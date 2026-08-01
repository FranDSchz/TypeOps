import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from './database'

describe('TypeOpsDatabase IndexedDB Schema', () => {
  let testDb: TypeOpsDatabase

  beforeEach(() => {
    testDb = createTestDatabase()
  })

  afterEach(async () => {
    await testDb.delete()
  })

  it('inicializa la base de datos y define las tablas contentPacks y settings', async () => {
    await testDb.open()

    expect(testDb.isOpen()).toBe(true)
    expect(testDb.contentPacks).toBeDefined()
    expect(testDb.settings).toBeDefined()
  })
})
