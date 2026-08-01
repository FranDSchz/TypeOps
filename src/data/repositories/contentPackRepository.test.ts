import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { ContentPackRepository } from './contentPackRepository'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPackRecord } from '../db/records'
import type { ContentPack } from '../../domain/content/types'

describe('ContentPackRepository', () => {
  let testDb: TypeOpsDatabase
  let repo: ContentPackRepository

  beforeEach(async () => {
    testDb = createTestDatabase()
    await testDb.open()
    repo = new ContentPackRepository(testDb)
  })

  afterEach(async () => {
    await testDb.delete()
  })

  it('guarda, consulta por ID y lista los packs persistidos', async () => {
    const record: ContentPackRecord = {
      packId: officialPack.packId,
      packVersion: officialPack.packVersion,
      schemaVersion: officialPack.schemaVersion,
      title: officialPack.title,
      locale: officialPack.locale,
      updatedAt: officialPack.updatedAt,
      importedAt: new Date().toISOString(),
      checksum: 'sha256-dummy-hash',
      content: officialPack as unknown as ContentPack,
    }

    await repo.savePackRecord(record)

    const hasIt = await repo.hasPack(officialPack.packId)
    expect(hasIt).toBe(true)

    const queried = await repo.getPackById(officialPack.packId)
    expect(queried).toBeDefined()
    expect(queried?.title).toBe('TypeOps Foundations (es-AR)')
    expect(queried?.content.items).toHaveLength(6)

    const all = await repo.getAllPacks()
    expect(all).toHaveLength(1)
  })

  it('elimina un pack de IndexedDB por ID', async () => {
    const record: ContentPackRecord = {
      packId: 'test-pack',
      packVersion: '1.0.0',
      schemaVersion: '1.0.0',
      title: 'Pack Test',
      locale: 'es-AR',
      updatedAt: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      checksum: 'hash',
      content: officialPack as unknown as ContentPack,
    }

    await repo.savePackRecord(record)
    expect(await repo.hasPack('test-pack')).toBe(true)

    const deleted = await repo.deletePack('test-pack')
    expect(deleted).toBe(true)
    expect(await repo.hasPack('test-pack')).toBe(false)
  })
})
