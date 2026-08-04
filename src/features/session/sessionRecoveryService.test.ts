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
      mode: 'guided',
      targetCount: 1,
    })

    expect(created.sessionRecord).not.toBeNull()

    const recovery = await recoverActiveSession(testDb, pack)

    expect(recovery.activeSession).not.toBeNull()
    expect(recovery.activeSession?.sessionId).toBe(created.sessionRecord?.sessionId)
    expect(recovery.sessionPlan?.items).toHaveLength(created.sessionPlan ? created.sessionPlan.items.length : 0)
    expect(recovery.recoveryError).toBeNull()
  })

  it('recupera sesión activa para los 4 modos (typing, command, review, guided)', async () => {
    // Prior knowledge for unit-log-inspection and unit-linux-basics to enable evaluation modes
    await testDb.priorKnowledge.put({
      compositeKey: `${pack.packId}:${pack.packVersion}:unit-log-inspection`,
      packId: pack.packId,
      packVersion: pack.packVersion,
      unitId: 'unit-log-inspection',
      source: 'user_configured',
      updatedAt: new Date().toISOString(),
    })
    await testDb.priorKnowledge.put({
      compositeKey: `${pack.packId}:${pack.packVersion}:unit-linux-basics`,
      packId: pack.packId,
      packVersion: pack.packVersion,
      unitId: 'unit-linux-basics',
      source: 'user_configured',
      updatedAt: new Date().toISOString(),
    })

    const modes = ['typing', 'command', 'review', 'guided'] as const
    for (const mode of modes) {
      const created = await createSession({
        db: testDb,
        pack,
        mode,
        targetCount: 1,
      })

      expect(created.sessionRecord).not.toBeNull()
      const recovery = await recoverActiveSession(testDb, pack)
      expect(recovery.activeSession?.mode).toBe(mode)
      expect(recovery.sessionPlan?.items[0]?.item.mode).toBe(mode)
    }
  })

  it('informa RECOVERY_FAILED_CONTENT_MISSING si falta un ítem del plan en el pack', async () => {
    const created = await createSession({
      db: testDb,
      pack,
      mode: 'guided',
      targetCount: 1,
    })

    expect(created.sessionRecord).not.toBeNull()

    // Crear un pack incompleto sin el ítem guided-tail-intro
    const incompletePack: ContentPack = {
      ...pack,
      items: pack.items.filter((i) => i.itemId !== 'guided-tail-intro'),
    }

    const recovery = await recoverActiveSession(testDb, incompletePack)

    expect(recovery.activeSession).not.toBeNull()
    expect(recovery.sessionPlan).toBeNull()
    expect(recovery.recoveryError?.code).toBe('RECOVERY_FAILED_CONTENT_MISSING')
    expect(recovery.recoveryError?.missingItemIds).toContain('guided-tail-intro')
  })
})
