import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { generateImportPreview, confirmImport } from './importService'
import { exportSinglePack, exportFullBackup } from './exportService'
import { bootstrapOfficialContent, isOfficialContentInstalled } from '../bootstrap'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import invalidPack from '../../test/fixtures/content/invalid_security.json'
import type { ContentPack } from '../../domain/content/types'

describe('Transfer Services — Import, Export, Conflict Policy & Atomic Rollback', () => {
  let testDb: TypeOpsDatabase

  beforeEach(async () => {
    testDb = createTestDatabase()
    await testDb.open()
  })

  afterEach(async () => {
    await testDb.delete()
  })

  it('generar preview no realiza escrituras en IndexedDB', async () => {
    const preview = await generateImportPreview(officialPack, testDb)

    expect(preview.valid).toBe(true)
    expect(preview.proposedAction).toBe('new')

    const count = await testDb.contentPacks.count()
    expect(count).toBe(0)
  })

  it('un pack inválido falla la preview y no modifica IndexedDB', async () => {
    const preview = await generateImportPreview(invalidPack, testDb)

    expect(preview.valid).toBe(false)
    expect(preview.errors.length).toBeGreaterThan(0)

    const result = await confirmImport(preview, testDb)
    expect(result.success).toBe(false)
    expect(result.actionTaken).toBe('rejected')

    const count = await testDb.contentPacks.count()
    expect(count).toBe(0)
  })

  it('importa exitosamente un pack válido por primera vez', async () => {
    const preview = await generateImportPreview(officialPack, testDb)
    const result = await confirmImport(preview, testDb)

    expect(result.success).toBe(true)
    expect(result.actionTaken).toBe('imported')

    const stored = await testDb.contentPacks.get(officialPack.packId)
    expect(stored).toBeDefined()
    expect(stored?.title).toBe(officialPack.title)
    expect(stored?.content.items).toHaveLength(6)
  })

  it('omite un pack duplicado idéntico (mismo ID, misma versión, mismo checksum)', async () => {
    const preview1 = await generateImportPreview(officialPack, testDb)
    await confirmImport(preview1, testDb)

    const preview2 = await generateImportPreview(officialPack, testDb)
    expect(preview2.proposedAction).toBe('duplicate_identical')

    const result2 = await confirmImport(preview2, testDb)
    expect(result2.success).toBe(true)
    expect(result2.actionTaken).toBe('skipped')
  })

  it('rechaza por conflicto si tiene el mismo ID y versión pero diferente contenido/checksum', async () => {
    const preview1 = await generateImportPreview(officialPack, testDb)
    await confirmImport(preview1, testDb)

    const modifiedPack = JSON.parse(JSON.stringify(officialPack)) as ContentPack
    modifiedPack.title = "TypeOps Modificado con Mismo SemVer"
    if (modifiedPack.items[0]) {
      modifiedPack.items[0].title = "Título Alterado"
    }

    const preview2 = await generateImportPreview(modifiedPack, testDb)
    expect(preview2.proposedAction).toBe('conflict')

    const result2 = await confirmImport(preview2, testDb)
    expect(result2.success).toBe(false)
    expect(result2.actionTaken).toBe('rejected')
  })

  it('actualiza atómicamente si la versión ingresada es superior SemVer', async () => {
    const preview1 = await generateImportPreview(officialPack, testDb)
    await confirmImport(preview1, testDb)

    const updatedPack = JSON.parse(JSON.stringify(officialPack)) as ContentPack
    updatedPack.packVersion = "1.1.0"
    updatedPack.title = "TypeOps Foundations Actualizado v1.1.0"

    const preview2 = await generateImportPreview(updatedPack, testDb)
    expect(preview2.proposedAction).toBe('update')

    const result2 = await confirmImport(preview2, testDb)
    expect(result2.success).toBe(true)
    expect(result2.actionTaken).toBe('updated')

    const stored = await testDb.contentPacks.get(officialPack.packId)
    expect(stored?.packVersion).toBe("1.1.0")
    expect(stored?.title).toBe("TypeOps Foundations Actualizado v1.1.0")
  })

  it('rechaza la importación por defecto si la versión es un downgrade inferior', async () => {
    const preview1 = await generateImportPreview(officialPack, testDb)
    await confirmImport(preview1, testDb)

    const downgradePack = JSON.parse(JSON.stringify(officialPack)) as ContentPack
    downgradePack.packVersion = "0.9.0"

    const preview2 = await generateImportPreview(downgradePack, testDb)
    expect(preview2.proposedAction).toBe('downgrade_rejected')

    const result2 = await confirmImport(preview2, testDb)
    expect(result2.success).toBe(false)
    expect(result2.actionTaken).toBe('rejected')
  })

  it('mantiene la consistencia de datos en round-trip (exportar e importar)', async () => {
    const preview1 = await generateImportPreview(officialPack, testDb)
    await confirmImport(preview1, testDb)

    const exportedPack = await exportSinglePack(officialPack.packId, testDb)
    expect(exportedPack).toBeDefined()

    const previewSingleRoundTrip = await generateImportPreview(exportedPack, testDb)
    expect(previewSingleRoundTrip.proposedAction).toBe('duplicate_identical')

    const backupEnvelope = await exportFullBackup(testDb)
    expect(backupEnvelope.format).toBe('typeops-export')
    expect(backupEnvelope.contentPacks).toHaveLength(1)

    await testDb.contentPacks.clear()
    expect(await testDb.contentPacks.count()).toBe(0)

    const previewEnvelope = await generateImportPreview(backupEnvelope, testDb)
    expect(previewEnvelope.sourceType).toBe('backup_envelope')

    const resultEnvelope = await confirmImport(previewEnvelope, testDb)
    expect(resultEnvelope.success).toBe(true)

    const restoredPack = await testDb.contentPacks.get(officialPack.packId)
    expect(restoredPack).toBeDefined()
    expect(restoredPack?.title).toBe(officialPack.title)
    expect(restoredPack?.content.items).toHaveLength(6)
  })

  it('realiza bootstrap explícito e idempotente', async () => {
    expect(await isOfficialContentInstalled(testDb)).toBe(false)

    const res1 = await bootstrapOfficialContent(testDb)
    expect(res1.success).toBe(true)
    expect(await isOfficialContentInstalled(testDb)).toBe(true)

    const res2 = await bootstrapOfficialContent(testDb)
    expect(res2.success).toBe(true)
    expect(res2.actionTaken).toBe('skipped')
  })

  // Subhito 5B — Pruebas de Exportación e Importación de Perfiles Mecánicos
  describe('Perfiles Mecánicos en Backup y Restore (Subhito 5B)', () => {
    it('Export v3: incluye mechanicalProfiles sin eventos DOM crudos', async () => {
      await testDb.mechanicalProfiles.put({
        profileKey: 'pack-foundations:1.0.0',
        packId: 'pack-foundations',
        packVersion: '1.0.0',
        characterMetrics: {
          a: { totalAppearances: 10, distinctAttemptsCount: 4, validLatenciesMs: [100, 110], medianLatencyMs: 105, hasSufficientSample: true },
        },
        sequenceMetrics: {},
        updatedAt: '2026-08-01T10:00:00.000Z',
      })

      const backup = await exportFullBackup(testDb)
      expect(backup.mechanicalProfiles).toBeDefined()
      expect(backup.mechanicalProfiles).toHaveLength(1)

      const prof = backup.mechanicalProfiles?.[0]
      expect(prof?.profileKey).toBe('pack-foundations:1.0.0')
      expect(prof?.characterMetrics['a']?.totalAppearances).toBe(10)

      // Verificación de ausencia de eventos DOM crudos
      const jsonString = JSON.stringify(backup)
      expect(jsonString).not.toContain('KeyboardEvent')
      expect(jsonString).not.toContain('InputEvent')
    })

    it('Import v3: restaura mechanicalProfiles dentro de la transacción', async () => {
      const preview1 = await generateImportPreview(officialPack, testDb)
      await confirmImport(preview1, testDb)

      await testDb.mechanicalProfiles.put({
        profileKey: 'pack-foundations:1.0.0',
        packId: 'pack-foundations',
        packVersion: '1.0.0',
        characterMetrics: {
          s: { totalAppearances: 8, distinctAttemptsCount: 3, validLatenciesMs: [120], medianLatencyMs: 120, hasSufficientSample: true },
        },
        sequenceMetrics: {},
        updatedAt: '2026-08-01T10:00:00.000Z',
      })

      const backup = await exportFullBackup(testDb)

      // Limpiar base de datos
      await testDb.mechanicalProfiles.clear()
      expect(await testDb.mechanicalProfiles.count()).toBe(0)

      // Restaurar
      const preview = await generateImportPreview(backup, testDb)
      const result = await confirmImport(preview, testDb)
      expect(result.success).toBe(true)

      const restoredProf = await testDb.mechanicalProfiles.get('pack-foundations:1.0.0')
      expect(restoredProf).toBeDefined()
      expect(restoredProf?.characterMetrics['s']?.totalAppearances).toBe(8)
    })

    it('Backup v2 anterior: un envelope válido sin mechanicalProfiles se importa correctamente y preserva perfiles preexistentes', async () => {
      const existingProfile = {
        profileKey: 'pack-existing:1.0.0',
        packId: 'pack-existing',
        packVersion: '1.0.0',
        characterMetrics: { a: { totalAppearances: 5, distinctAttemptsCount: 2, validLatenciesMs: [100], medianLatencyMs: 100, hasSufficientSample: false } },
        sequenceMetrics: {},
        updatedAt: '2026-08-01T10:00:00.000Z',
      }
      await testDb.mechanicalProfiles.put(existingProfile)

      const backupV2 = await exportFullBackup(testDb)
      delete backupV2.mechanicalProfiles

      const preview = await generateImportPreview(backupV2, testDb)
      expect(preview.valid).toBe(true)

      const result = await confirmImport(preview, testDb)
      expect(result.success).toBe(true)

      // La política preserva intactos los perfiles preexistentes si el sobre v2 no contiene la clave
      const preserved = await testDb.mechanicalProfiles.get('pack-existing:1.0.0')
      expect(preserved).toEqual(existingProfile)
    })

    it('Perfil inválido: rechaza sobre con perfiles malformados (contadores negativos / estructura inválida)', async () => {
      const backupRaw = (await exportFullBackup(testDb)) as unknown as Record<string, unknown>
      backupRaw.mechanicalProfiles = [
        {
          profileKey: 'invalid-key',
          packId: 'pack-test',
          packVersion: '1.0.0',
          characterMetrics: {
            a: { totalAppearances: -5, distinctAttemptsCount: -1, validLatenciesMs: [-10], hasSufficientSample: true },
          },
          sequenceMetrics: {},
          updatedAt: '2026-08-01T10:00:00.000Z',
        },
      ]

      const preview = await generateImportPreview(backupRaw, testDb)
      expect(preview.valid).toBe(false)
      expect(preview.errors.length).toBeGreaterThan(0)
    })

    it('Backup v4: exporta y restaura registros de guidedProgress correctamente', async () => {
      await bootstrapOfficialContent(testDb)

      const guidedRecord = {
        progressKey: 'typeops-foundations-es-ar:1.0.0:guided-tail-intro',
        packId: 'typeops-foundations-es-ar',
        packVersion: '1.0.0',
        itemId: 'guided-tail-intro',
        completedStageIds: ['stg-1', 'stg-2', 'stg-3'],
        updatedAt: '2026-08-02T10:00:00.000Z',
      }
      await testDb.guidedProgress.put(guidedRecord)

      const backup = await exportFullBackup(testDb)
      expect(backup.guidedProgress).toBeDefined()
      expect(backup.guidedProgress).toHaveLength(1)

      await testDb.guidedProgress.clear()
      expect(await testDb.guidedProgress.count()).toBe(0)

      const preview = await generateImportPreview(backup, testDb)
      const result = await confirmImport(preview, testDb)
      expect(result.success).toBe(true)

      const restored = await testDb.guidedProgress.get('typeops-foundations-es-ar:1.0.0:guided-tail-intro')
      expect(restored).toBeDefined()
      expect(restored?.completedStageIds).toEqual(['stg-1', 'stg-2', 'stg-3'])
    })

    it('Rechaza sobre con guidedProgress donde progressKey no coincide con packId, packVersion e itemId', async () => {
      await bootstrapOfficialContent(testDb)

      const backupRaw = (await exportFullBackup(testDb)) as unknown as Record<string, unknown>
      backupRaw.guidedProgress = [
        {
          progressKey: 'mismatch-key',
          packId: 'pack-1',
          packVersion: '1.0.0',
          itemId: 'guided-item-1',
          completedStageIds: ['stg-1'],
          updatedAt: '2026-08-02T10:00:00.000Z',
        },
      ]

      const preview = await generateImportPreview(backupRaw, testDb)
      expect(preview.valid).toBe(false)
      expect(preview.errors.some((e) => e.message.includes('progressKey no coincide'))).toBe(true)
    })
  })
})
