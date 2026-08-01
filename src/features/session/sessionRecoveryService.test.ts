import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../../data/db/database'
import { createSession } from './sessionInitializer'
import { recoverActiveSession } from './sessionRecoveryService'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../../domain/content/types'

describe('SessionRecoveryService (Paso 2)', () => {
  let testDb: TypeOpsDatabase
  const pack = officialPack as ContentPack

  beforeEach(() => {
    testDb = createTestDatabase()
  })

  afterEach(() => {
    testDb.close()
  })

  it('recupera exactamente el plan persistido de una sesión activa (recarga F5)', async () => {
    const created = await createSession({
      db: testDb,
      pack,
      mode: 'review',
      targetCount: 2,
    })

    expect(created.sessionRecord).not.toBeNull()

    const recovery = await recoverActiveSession(testDb, pack)

    expect(recovery.activeSession).not.toBeNull()
    expect(recovery.activeSession?.sessionId).toBe(created.sessionRecord?.sessionId)
    expect(recovery.sessionPlan?.items).toHaveLength(created.sessionPlan.items.length)
    expect(recovery.recoveryError).toBeNull()
  })

  it('informa RECOVERY_FAILED_CONTENT_MISSING si falta un ítem del plan en el pack', async () => {
    const created = await createSession({
      db: testDb,
      pack,
      mode: 'command',
      targetCount: 1,
    })

    expect(created.sessionRecord).not.toBeNull()

    // Crear un pack incompleto sin el ítem cmd-tail-n
    const incompletePack: ContentPack = {
      ...pack,
      items: pack.items.filter((i) => i.itemId !== 'cmd-tail-n'),
    }

    const recovery = await recoverActiveSession(testDb, incompletePack)

    expect(recovery.activeSession).not.toBeNull()
    expect(recovery.sessionPlan).toBeNull()
    expect(recovery.recoveryError?.code).toBe('RECOVERY_FAILED_CONTENT_MISSING')
    expect(recovery.recoveryError?.missingItemIds).toContain('cmd-tail-n')
  })
})
