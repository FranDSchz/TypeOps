import { describe, it, expect } from 'vitest'
import { createTestDatabase } from './database'

describe('Dexie v2 Database Migration (Hito 4)', () => {
  it('inicializa correctamente la versión 2 del esquema con 5 tablas', async () => {
    const testDb = createTestDatabase()

    expect(testDb.contentPacks).toBeDefined()
    expect(testDb.settings).toBeDefined()
    expect(testDb.sessions).toBeDefined()
    expect(testDb.attempts).toBeDefined()
    expect(testDb.learningProgress).toBeDefined()

    await testDb.settings.put({
      key: 'activeSessionId',
      value: 'session-test-123',
      updatedAt: new Date().toISOString(),
    })

    const setting = await testDb.settings.get('activeSessionId')
    expect(setting?.value).toBe('session-test-123')

    testDb.close()
  })
})
