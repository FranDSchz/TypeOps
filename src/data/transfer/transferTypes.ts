import type { ContentPack, ContentValidationError } from '../../domain/content/types'
import type { AppSettings, MechanicalProfileRecord } from '../db/records'

/**
 * Sobres de exportación e intercambio de datos (Hito 2, ampliado en Subhito 5B).
 */

export interface IntegrityManifest {
  packCount: number
  checksums: Record<string, string>
}

/** Backup completo / sobre de exportación versionado */
export interface TypeOpsExportEnvelope {
  format: 'typeops-export'
  exportSchemaVersion: '1.0.0'
  appVersion: string
  exportedAt: string
  contentPacks: ContentPack[]
  settings?: AppSettings
  mechanicalProfiles?: MechanicalProfileRecord[]
  integrity: IntegrityManifest
}

export type ImportPreviewAction =
  | 'new'
  | 'duplicate_identical'
  | 'update'
  | 'conflict'
  | 'downgrade_rejected'
  | 'invalid'

export interface ImportPreview {
  valid: boolean
  sourceType: 'content_pack' | 'backup_envelope'
  packId?: string
  packVersion?: string
  title?: string
  locale?: string
  unitCount: number
  itemCount: number
  itemsByKind: Record<string, number>
  proposedAction: ImportPreviewAction
  checksum: string
  /** Contenido validado e inmutable preparado para la confirmación */
  validatedPack?: ContentPack
  validatedEnvelope?: TypeOpsExportEnvelope
  warnings: string[]
  errors: ContentValidationError[]
}

export interface ImportResult {
  success: boolean
  actionTaken: 'imported' | 'updated' | 'skipped' | 'rejected'
  message: string
  errors: ContentValidationError[]
}
