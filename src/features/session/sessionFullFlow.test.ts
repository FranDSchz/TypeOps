/**
 * Prueba de integración R1J — Flujo completo guided → command
 *
 * Reproduce exactamente la ruta pública usada por la UI:
 * 1. createSession(mode: 'guided', targetItemId: 'guided-tail-intro')
 * 2. advanceExpositoryGuidedStage para stg-1, stg-2, stg-3
 * 3. submitAttempt para stg-4 (guided_exercise, correct)
 * 4. submitAttempt para stg-5 (unassisted_exercise, correct)
 * 5. createSession(mode: 'command') → debe retornar guided_path_unavailable
 *
 * Si el test falla (retorna missing_learning_evidence o success),
 * la causa raíz está en cómo los servicios transaccionales
 * construyen guidedProgress o en alguna condición de closeSession.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../../data/db/database'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../../domain/content/types'
import { createSession } from './sessionInitializer'
import { advanceExpositoryGuidedStage, submitAttempt } from '../../data/services/transactionalSessionService'

describe('Flujo completo guided → command (R1J)', () => {
  let db: TypeOpsDatabase
  const pack = officialPack as ContentPack

  beforeEach(() => {
    db = createTestDatabase()
  })

  afterEach(() => {
    db.close()
  })

  it('retorna guided_path_unavailable al intentar command tras completar el flujo guided completo via servicios reales', async () => {
    // Paso 1: Crear sesión guided apuntando a guided-tail-intro
    const guidedResult = await createSession({
      db,
      pack,
      mode: 'guided',
      targetDurationSeconds: 300,
      targetItemId: 'guided-tail-intro',
    })

    expect(guidedResult.sessionRecord).not.toBeNull()
    expect(guidedResult.sessionPlan).not.toBeNull()
    expect(guidedResult.compositionResult.status).toBe('success')

    if (!guidedResult.sessionRecord) throw new Error('sessionRecord no debe ser null')
    const sessionId = guidedResult.sessionRecord.sessionId
    const rawGuidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro')
    if (!rawGuidedItem || rawGuidedItem.kind !== 'guided_practice') {
      throw new Error('guided-tail-intro no encontrado o no es guided_practice')
    }
    const guidedItem = rawGuidedItem

    // Paso 2: Avanzar etapas expositivas stg-1, stg-2, stg-3
    await advanceExpositoryGuidedStage({
      db,
      sessionId,
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      stageId: 'stg-1',
    })
    await advanceExpositoryGuidedStage({
      db,
      sessionId,
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      stageId: 'stg-2',
    })
    await advanceExpositoryGuidedStage({
      db,
      sessionId,
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      stageId: 'stg-3',
    })

    // Paso 3: submitAttempt para stg-4 (guided_exercise, respuesta correcta)
    await submitAttempt({
      db,
      attemptId: crypto.randomUUID(),
      sessionId,
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      evaluationOptions: { guidedStageId: 'stg-4' },
      durationMs: 5000,
    })

    // Paso 4: submitAttempt para stg-5 (unassisted_exercise, respuesta correcta)
    await submitAttempt({
      db,
      attemptId: crypto.randomUUID(),
      sessionId,
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      evaluationOptions: { guidedStageId: 'stg-5' },
      durationMs: 5000,
    })

    // Paso 5: Intentar command — debe retornar guided_path_unavailable
    const commandResult = await createSession({
      db,
      pack,
      mode: 'command',
      targetDurationSeconds: 300,
    })

    expect(commandResult.sessionRecord).toBeNull()
    expect(commandResult.sessionPlan).toBeNull()
    expect(commandResult.compositionResult.status).toBe('guided_path_unavailable')

    if (commandResult.compositionResult.status === 'guided_path_unavailable') {
      expect(commandResult.compositionResult.blockedUnits).toHaveLength(1)
      expect(commandResult.compositionResult.blockedUnits[0]?.unitId).toBe('unit-linux-basics')
    }
  })
})
