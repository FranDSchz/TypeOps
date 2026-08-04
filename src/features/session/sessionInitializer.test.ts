import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../../data/db/database'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../../domain/content/types'
import { createSession } from './sessionInitializer'

describe('createSession integration (R1G)', () => {
  let db: TypeOpsDatabase
  const pack = officialPack as ContentPack

  beforeEach(() => {
    db = createTestDatabase()
  })

  afterEach(() => {
    db.close()
  })

  it('retorna guided_path_unavailable bloqueando unit-linux-basics cuando modo command es iniciado tras completar guided-tail-intro sin priorKnowledge', async () => {
    // Simular evidencia de guiado completado para guided-tail-intro
    await db.guidedProgress.put({
      progressKey: `${pack.packId}:${pack.packVersion}:guided-tail-intro`,
      packId: pack.packId,
      packVersion: pack.packVersion,
      itemId: 'guided-tail-intro',
      completedStageIds: ['stg-1', 'stg-2', 'stg-3', 'stg-4', 'stg-5'],
      updatedAt: new Date().toISOString(),
    })

    const res = await createSession({
      db,
      pack,
      mode: 'command',
    })

    expect(res.sessionRecord).toBeNull()
    expect(res.sessionPlan).toBeNull()
    expect(res.compositionResult.status).toBe('guided_path_unavailable')

    if (res.compositionResult.status === 'guided_path_unavailable') {
      expect(res.compositionResult.blockedUnits).toHaveLength(1)
      expect(res.compositionResult.blockedUnits[0]?.unitId).toBe('unit-linux-basics')
    }
  })

  it('retorna guided_path_unavailable bloqueando unit-linux-basics cuando learningProgress contiene unit-log-inspection en practicing tras guiado (R1I)', async () => {
    const nowIso = new Date().toISOString()

    // 1. guidedProgress completado
    await db.guidedProgress.put({
      progressKey: `${pack.packId}:${pack.packVersion}:guided-tail-intro`,
      packId: pack.packId,
      packVersion: pack.packVersion,
      itemId: 'guided-tail-intro',
      completedStageIds: ['stg-1', 'stg-2', 'stg-3', 'stg-4', 'stg-5'],
      updatedAt: nowIso,
    })

    // 2. learningProgress persistido tras el guiado en el navegador real
    await db.learningProgress.put({
      compositeUnitKey: `${pack.packId}:unit-log-inspection`,
      packId: pack.packId,
      unitId: 'unit-log-inspection',
      state: 'practicing',
      independentSuccessesCount: 1,
      practicedItemIds: ['guided-tail-intro'],
      lastPracticedAt: nowIso,
      lastReasonCode: 'INDEPENDENT_SUCCESS_PRACTICING',
      updatedAt: nowIso,
    })

    const res = await createSession({
      db,
      pack,
      mode: 'command',
    })

    expect(res.sessionRecord).toBeNull()
    expect(res.sessionPlan).toBeNull()
    expect(res.compositionResult.status).toBe('guided_path_unavailable')

    if (res.compositionResult.status === 'guided_path_unavailable') {
      expect(res.compositionResult.blockedUnits).toHaveLength(1)
      expect(res.compositionResult.blockedUnits[0]?.unitId).toBe('unit-linux-basics')
    }
  })
})
