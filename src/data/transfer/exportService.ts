import type { TypeOpsDatabase } from '../db/database'
import type { ContentPack } from '../../domain/content/types'
import type { TypeOpsExportEnvelope } from './transferTypes'
import type { AppSettings } from '../db/records'

/**
 * Exporta un ContentPack individual por ID directamente desde IndexedDB.
 */
export async function exportSinglePack(
  packId: string,
  db: TypeOpsDatabase,
): Promise<ContentPack | null> {
  const record = await db.contentPacks.get(packId)
  if (!record) return null
  return record.content
}

/**
 * Exporta una copia de seguridad completa (TypeOpsExportEnvelope v1.0.0)
 * incluyendo todos los packs instalados, configuraciones y firmas de integridad.
 */
export async function exportFullBackup(
  db: TypeOpsDatabase,
): Promise<TypeOpsExportEnvelope> {
  const records = await db.contentPacks.toArray()
  const contentPacks = records.map((r) => r.content)

  const settingsRecords = await db.settings.toArray()
  const settings: AppSettings = {}
  settingsRecords.forEach((r) => {
    if (r.key === 'activePackId' && typeof r.value === 'string') {
      settings.activePackId = r.value
    } else if (r.key === 'lastBackupAt' && typeof r.value === 'string') {
      settings.lastBackupAt = r.value
    }
  })

  const checksums: Record<string, string> = {}
  for (const record of records) {
    checksums[record.packId] = record.checksum
  }

  const envelope: TypeOpsExportEnvelope = {
    format: 'typeops-export',
    exportSchemaVersion: '1.0.0',
    appVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    contentPacks,
    integrity: {
      packCount: contentPacks.length,
      checksums,
    },
  }

  const profiles = await db.mechanicalProfiles.toArray()
  if (profiles.length > 0) {
    envelope.mechanicalProfiles = profiles
  }

  if (Object.keys(settings).length > 0) {
    envelope.settings = settings
  }

  await db.settings.put({
    key: 'lastBackupAt',
    value: envelope.exportedAt,
    updatedAt: envelope.exportedAt,
  })

  return envelope
}
