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
})
