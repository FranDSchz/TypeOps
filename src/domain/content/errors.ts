import type { ZodError } from 'zod'
import type { ContentValidationError } from './types'

/**
 * Mapea errores de Zod a objetos ContentValidationError estructurados y legibles.
 */
export function formatZodErrors(
  zodError: ZodError,
  packId?: string,
): ContentValidationError[] {
  return zodError.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
    
    let itemId: string | undefined
    let unitId: string | undefined

    if (issue.path[0] === 'items' && typeof issue.path[1] === 'number') {
      const idx = issue.path[1]
      itemId = `items[${String(idx)}]`
    } else if (issue.path[0] === 'units' && typeof issue.path[1] === 'number') {
      const idx = issue.path[1]
      unitId = `units[${String(idx)}]`
    }

    let code = 'SCHEMA_VALIDATION_ERROR'
    if (issue.code === 'unrecognized_keys') {
      code = 'UNEXPECTED_FIELD'
    } else if (issue.code === 'invalid_literal') {
      code = 'INVALID_LITERAL'
    } else if (issue.code === 'invalid_type') {
      code = 'INVALID_TYPE'
    }

    const err: ContentValidationError = {
      path,
      code,
      message: `${issue.message} en campo '${path}'`,
    }

    if (packId !== undefined) err.packId = packId
    if (itemId !== undefined) err.itemId = itemId
    if (unitId !== undefined) err.unitId = unitId

    return err
  })
}

/**
 * Crea un error de validación de negocio estructurado.
 */
export function createValidationError(params: {
  packId?: string
  itemId?: string
  unitId?: string
  path: string
  code: string
  message: string
}): ContentValidationError {
  const err: ContentValidationError = {
    path: params.path,
    code: params.code,
    message: params.message,
  }

  if (params.packId !== undefined) err.packId = params.packId
  if (params.itemId !== undefined) err.itemId = params.itemId
  if (params.unitId !== undefined) err.unitId = params.unitId

  return err
}
