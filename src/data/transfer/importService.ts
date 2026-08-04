import { loadContentPack } from '../../domain/content/loader'
import { loadExportEnvelope } from './transferSchemas'
import { calculateChecksum } from './checksum'
import { compareSemVer } from './semver'
import type { TypeOpsDatabase } from '../db/database'
import type { ContentPackRecord } from '../db/records'
import type {
  ImportPreview,
  ImportPreviewAction,
  ImportResult,
  TypeOpsExportEnvelope,
} from './transferTypes'

/**
 * Genera una vista previa inmutable para la importación sin modificar la base de datos.
 * Acepta tanto un ContentPack individual como un backup completo (TypeOpsExportEnvelope).
 */
export async function generateImportPreview(
  input: unknown,
  db: TypeOpsDatabase,
): Promise<ImportPreview> {
  if (typeof input === 'object' && input !== null && (input as { format?: string }).format === 'typeops-export') {
    const envelopeResult = loadExportEnvelope(input)
    if (!envelopeResult.success) {
      return {
        valid: false,
        sourceType: 'backup_envelope',
        unitCount: 0,
        itemCount: 0,
        itemsByKind: {},
        proposedAction: 'invalid',
        checksum: '',
        warnings: [],
        errors: envelopeResult.errors,
      }
    }
    return generateBackupEnvelopePreview(envelopeResult.envelope)
  }

  // 2. Probar si la entrada es un ContentPack individual
  const packResult = loadContentPack(input)
  if (!packResult.success) {
    return {
      valid: false,
      sourceType: 'content_pack',
      unitCount: 0,
      itemCount: 0,
      itemsByKind: {},
      proposedAction: 'invalid',
      checksum: '',
      warnings: [],
      errors: packResult.errors,
    }
  }

  const pack = packResult.pack
  const checksum = await calculateChecksum(pack)

  const itemsByKind = pack.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.kind] = (acc[item.kind] ?? 0) + 1
    return acc
  }, {})

  // 3. Evaluar conflicto contra IndexedDB
  const existingRecord = await db.contentPacks.get(pack.packId)
  let proposedAction: ImportPreviewAction = 'new'
  const warnings: string[] = []

  if (existingRecord) {
    const cmp = compareSemVer(pack.packVersion, existingRecord.packVersion)
    if (cmp === 0) {
      if (checksum === existingRecord.checksum) {
        proposedAction = 'duplicate_identical'
        warnings.push(`El pack '${pack.title}' (${pack.packVersion}) ya está instalado con el mismo contenido (omitir).`)
      } else {
        proposedAction = 'conflict'
        warnings.push(`El pack '${pack.title}' (${pack.packVersion}) tiene el mismo número de versión pero diferente contenido. Rechazado por conflicto.`)
      }
    } else if (cmp > 0) {
      proposedAction = 'update'
      warnings.push(`Se actualizará el pack '${pack.title}' de v${existingRecord.packVersion} a v${pack.packVersion}.`)
    } else {
      proposedAction = 'downgrade_rejected'
      warnings.push(`La versión v${pack.packVersion} es inferior a la v${existingRecord.packVersion} ya instalada. Rechazado por downgrade.`)
    }
  }

  const isValid = proposedAction === 'new' || proposedAction === 'update' || proposedAction === 'duplicate_identical'

  return {
    valid: isValid,
    sourceType: 'content_pack',
    packId: pack.packId,
    packVersion: pack.packVersion,
    title: pack.title,
    locale: pack.locale,
    unitCount: pack.units.length,
    itemCount: pack.items.length,
    itemsByKind,
    proposedAction,
    checksum,
    validatedPack: pack,
    warnings,
    errors: [],
  }
}

async function generateBackupEnvelopePreview(
  envelope: TypeOpsExportEnvelope,
): Promise<ImportPreview> {
  const totalUnits = envelope.contentPacks.reduce((acc, p) => acc + p.units.length, 0)
  const totalItems = envelope.contentPacks.reduce((acc, p) => acc + p.items.length, 0)

  const itemsByKind = envelope.contentPacks.flatMap((p) => p.items).reduce<Record<string, number>>((acc, item) => {
    acc[item.kind] = (acc[item.kind] ?? 0) + 1
    return acc
  }, {})

  const checksum = await calculateChecksum(envelope)
  const packCountStr = String(envelope.contentPacks.length)

  return {
    valid: true,
    sourceType: 'backup_envelope',
    unitCount: totalUnits,
    itemCount: totalItems,
    itemsByKind,
    proposedAction: 'new',
    checksum,
    validatedEnvelope: envelope,
    warnings: [`Sobre de exportación v${envelope.exportSchemaVersion} con ${packCountStr} pack(s).`],
    errors: [],
  }
}

/**
 * Ejecuta la importación atómica en IndexedDB reutilizando el contenido validado de la preview.
 */
export async function confirmImport(
  preview: ImportPreview,
  db: TypeOpsDatabase,
): Promise<ImportResult> {
  if (preview.proposedAction === 'duplicate_identical') {
    return {
      success: true,
      actionTaken: 'skipped',
      message: `Pack '${preview.title ?? ''}' duplicado e idéntico omitido sin modificaciones.`,
      errors: [],
    }
  }

  if (!preview.valid) {
    return {
      success: false,
      actionTaken: 'rejected',
      message: `Importación no válida (${preview.proposedAction}).`,
      errors: preview.errors,
    }
  }

  if (preview.sourceType === 'content_pack' && preview.validatedPack) {
    const pack = preview.validatedPack
    const record: ContentPackRecord = {
      packId: pack.packId,
      packVersion: pack.packVersion,
      schemaVersion: pack.schemaVersion,
      title: pack.title,
      locale: pack.locale,
      updatedAt: pack.updatedAt,
      importedAt: new Date().toISOString(),
      checksum: preview.checksum,
      content: pack,
    }

    try {
      await db.transaction('rw', [db.contentPacks, db.settings], async () => {
        await db.contentPacks.put(record)
      })

      const isUpdate = preview.proposedAction === 'update'
      return {
        success: true,
        actionTaken: isUpdate ? 'updated' : 'imported',
        message: `Pack '${pack.title}' (${pack.packVersion}) ${isUpdate ? 'actualizado' : 'importado'} exitosamente.`,
        errors: [],
      }
    } catch (err) {
      return {
        success: false,
        actionTaken: 'rejected',
        message: `Error en la transacción IndexedDB: ${String(err)}`,
        errors: [
          {
            path: 'transaction',
            code: 'TRANSACTION_ERROR',
            message: String(err),
          },
        ],
      }
    }
  }

  if (preview.sourceType === 'backup_envelope' && preview.validatedEnvelope) {
    const envelope = preview.validatedEnvelope

    // Pre-calcular registros fuera de la transacción Dexie
    const recordsToStore: ContentPackRecord[] = []
    for (const pack of envelope.contentPacks) {
      const checksum = await calculateChecksum(pack)
      recordsToStore.push({
        packId: pack.packId,
        packVersion: pack.packVersion,
        schemaVersion: pack.schemaVersion,
        title: pack.title,
        locale: pack.locale,
        updatedAt: pack.updatedAt,
        importedAt: new Date().toISOString(),
        checksum,
        content: pack,
      })
    }

    try {
      await db.transaction('rw', [db.contentPacks, db.settings, db.mechanicalProfiles, db.guidedProgress, db.priorKnowledge], async () => {
        for (const record of recordsToStore) {
          await db.contentPacks.put(record)
        }

        if (Array.isArray(envelope.mechanicalProfiles)) {
          for (const prof of envelope.mechanicalProfiles) {
            if (prof.profileKey && prof.packId) {
              await db.mechanicalProfiles.put(prof)
            }
          }
        }

        if (Array.isArray(envelope.guidedProgress)) {
          for (const guidedRec of envelope.guidedProgress) {
            if (guidedRec.progressKey && guidedRec.packId) {
              await db.guidedProgress.put(guidedRec)
            }
          }
        }

        if (Array.isArray(envelope.priorKnowledge)) {
          for (const pkRec of envelope.priorKnowledge) {
            if (pkRec.compositeKey && pkRec.packId && pkRec.unitId) {
              await db.priorKnowledge.put(pkRec)
            }
          }
        }

        if (envelope.settings?.activePackId) {
          await db.settings.put({
            key: 'activePackId',
            value: envelope.settings.activePackId,
            updatedAt: new Date().toISOString(),
          })
        }
      })

      const envelopeCountStr = String(envelope.contentPacks.length)

      return {
        success: true,
        actionTaken: 'imported',
        message: `Backup con ${envelopeCountStr} pack(s) restaurado exitosamente.`,
        errors: [],
      }
    } catch (err) {
      return {
        success: false,
        actionTaken: 'rejected',
        message: `Error en la transacción de restauración: ${String(err)}`,
        errors: [
          {
            path: 'transaction',
            code: 'TRANSACTION_ERROR',
            message: String(err),
          },
        ],
      }
    }
  }

  return {
    success: false,
    actionTaken: 'rejected',
    message: 'Formato de preview desconocido.',
    errors: [],
  }
}
