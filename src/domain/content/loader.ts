import { ContentPackSchema } from './schema'
import { validateContentPackCrossReferences } from './validation'
import { formatZodErrors } from './errors'
import type { ContentLoadResult, ContentPack } from './types'

/**
 * TypeOps V1 — Content Pack Loader
 *
 * Recibe datos desconocidos (JSON / unknown), los valida mediante Zod
 * y aplica reglas de negocio cruzadas.
 *
 * Garantías:
 * 1. No muta los datos de entrada.
 * 2. Mantiene datos no validados fuera del dominio.
 * 3. No utiliza casts inseguros ni 'any'.
 * 4. Retorna un objeto discriminado con 'success: true' y el pack tipado,
 *    o 'success: false' con errores estructurados y orientados al autor.
 */
export function loadContentPack(input: unknown): ContentLoadResult {
  if (typeof input !== 'object' || input === null) {
    return {
      success: false,
      errors: [
        {
          path: 'root',
          code: 'INVALID_ROOT_STRUCTURE',
          message: 'El contenido raíz debe ser un objeto JSON válido.',
        },
      ],
    }
  }

  const inputObj = input as Record<string, unknown>

  let inputClone: unknown
  try {
    inputClone = structuredClone(input)
  } catch {
    inputClone = JSON.parse(JSON.stringify(input))
  }

  // 1. Validación de esquema con Zod
  const parseResult = ContentPackSchema.safeParse(inputClone)

  if (!parseResult.success) {
    const packId = typeof inputObj['packId'] === 'string' ? inputObj['packId'] : undefined
    const zodErrors = formatZodErrors(parseResult.error, packId)
    return {
      success: false,
      errors: zodErrors,
    }
  }

  const rawPack = parseResult.data

  // 2. Validación de versión compatible
  if (rawPack.schemaVersion !== '1.0.0') {
    return {
      success: false,
      errors: [
        {
          packId: rawPack.packId,
          path: 'schemaVersion',
          code: 'UNSUPPORTED_VERSION',
          message: `Versión del schema '${rawPack.schemaVersion}' no soportada. Se requiere '1.0.0'.`,
        },
      ],
    }
  }

  const pack = rawPack as ContentPack

  // 3. Validación cruzada de referencias, unicidad y grafo acíclico
  const crossErrors = validateContentPackCrossReferences(pack)

  if (crossErrors.length > 0) {
    return {
      success: false,
      errors: crossErrors,
    }
  }

  return {
    success: true,
    pack,
  }
}
