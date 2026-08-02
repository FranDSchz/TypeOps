import { z } from 'zod'
import { loadContentPack } from '../../domain/content/loader'
import { formatZodErrors } from '../../domain/content/errors'
import type { ContentValidationError } from '../../domain/content/types'
import type { TypeOpsExportEnvelope } from './transferTypes'
import type { AppSettings } from '../db/records'

const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

export const IntegrityManifestSchema = z
  .object({
    packCount: z.number().int().min(0),
    checksums: z.record(z.string(), z.string()),
  })
  .strict()

export const SequenceMetricSchema = z
  .object({
    totalAppearances: z.number().int().min(0),
    distinctAttemptsCount: z.number().int().min(0),
    validLatenciesMs: z.array(z.number().min(0)),
    medianLatencyMs: z.number().min(0).optional(),
    hasSufficientSample: z.boolean(),
  })
  .strict()

export const MechanicalProfileRecordSchema = z
  .object({
    profileKey: z.string().min(1),
    packId: z.string().min(1),
    packVersion: z.string().min(1),
    characterMetrics: z.record(z.string(), SequenceMetricSchema),
    sequenceMetrics: z.record(z.string(), SequenceMetricSchema),
    updatedAt: z.string().regex(isoDateRegex, 'updatedAt debe ser fecha ISO 8601'),
  })
  .strict()

export const GuidedItemProgressRecordSchema = z
  .object({
    progressKey: z.string().min(1),
    packId: z.string().min(1),
    packVersion: z.string().min(1),
    itemId: z.string().min(1),
    completedStageIds: z.array(z.string()),
    updatedAt: z.string().regex(isoDateRegex, 'updatedAt debe ser fecha ISO 8601'),
  })
  .strict()
  .refine(
    (rec) => rec.progressKey === `${rec.packId}:${rec.packVersion}:${rec.itemId}`,
    { message: 'progressKey no coincide con packId, packVersion e itemId' },
  )

export const TypeOpsExportEnvelopeSchema = z
  .object({
    format: z.literal('typeops-export', {
      errorMap: () => ({ message: "El formato debe ser 'typeops-export'" }),
    }),
    exportSchemaVersion: z.literal('1.0.0', {
      errorMap: () => ({ message: "exportSchemaVersion debe ser '1.0.0'" }),
    }),
    appVersion: z.string().min(1, 'appVersion no puede estar vacío'),
    exportedAt: z.string().regex(isoDateRegex, 'exportedAt debe ser fecha ISO 8601'),
    contentPacks: z.array(z.unknown()),
    settings: z
      .object({
        activePackId: z.string().optional(),
        lastBackupAt: z.string().optional(),
      })
      .strict()
      .optional(),
    mechanicalProfiles: z.array(MechanicalProfileRecordSchema).optional(),
    guidedProgress: z.array(GuidedItemProgressRecordSchema).optional(),
    integrity: IntegrityManifestSchema,
  })
  .strict()

export type LoadEnvelopeResult =
  | { success: true; envelope: TypeOpsExportEnvelope }
  | { success: false; errors: ContentValidationError[] }

/**
 * Valida de forma defensiva un archivo/JSON de backup completo (TypeOpsExportEnvelope).
 * Cada ContentPack contenido es validado individualmente con loadContentPack.
 */
export function loadExportEnvelope(input: unknown): LoadEnvelopeResult {
  if (typeof input !== 'object' || input === null) {
    return {
      success: false,
      errors: [
        {
          path: 'root',
          code: 'INVALID_ROOT_STRUCTURE',
          message: 'El sobre de exportación debe ser un objeto JSON válido.',
        },
      ],
    }
  }

  let inputClone: unknown
  try {
    inputClone = structuredClone(input)
  } catch {
    inputClone = JSON.parse(JSON.stringify(input))
  }

  const parseResult = TypeOpsExportEnvelopeSchema.safeParse(inputClone)
  if (!parseResult.success) {
    return {
      success: false,
      errors: formatZodErrors(parseResult.error),
    }
  }

  const rawEnvelope = parseResult.data
  const errors: ContentValidationError[] = []
  const validatedPacks = []

  for (let idx = 0; idx < rawEnvelope.contentPacks.length; idx++) {
    const rawPack = rawEnvelope.contentPacks[idx]
    const packResult = loadContentPack(rawPack)
    if (!packResult.success) {
      packResult.errors.forEach((err) => {
        errors.push({
          ...err,
          path: `contentPacks[${String(idx)}].${err.path}`,
        })
      })
    } else {
      validatedPacks.push(packResult.pack)
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    }
  }

  const envelope: TypeOpsExportEnvelope = {
    format: rawEnvelope.format,
    exportSchemaVersion: rawEnvelope.exportSchemaVersion,
    appVersion: rawEnvelope.appVersion,
    exportedAt: rawEnvelope.exportedAt,
    contentPacks: validatedPacks,
    integrity: rawEnvelope.integrity,
  }

  if (rawEnvelope.mechanicalProfiles !== undefined) {
    envelope.mechanicalProfiles = rawEnvelope.mechanicalProfiles
  }

  if (rawEnvelope.guidedProgress !== undefined) {
    envelope.guidedProgress = rawEnvelope.guidedProgress
  }

  if (rawEnvelope.settings !== undefined) {
    const settings: AppSettings = {}
    if (rawEnvelope.settings.activePackId !== undefined) {
      settings.activePackId = rawEnvelope.settings.activePackId
    }
    if (rawEnvelope.settings.lastBackupAt !== undefined) {
      settings.lastBackupAt = rawEnvelope.settings.lastBackupAt
    }
    envelope.settings = settings
  }

  return {
    success: true,
    envelope,
  }
}
