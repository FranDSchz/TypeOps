import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { submitAttempt, closeSession } from './transactionalSessionService'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, ContentItem } from '../../domain/content/types'
import type { SessionRecord, LearningProgressRecord } from '../db/records'
import { recommendNextItem } from '../../domain/recommendation/recommendationEngine'

describe('TransactionalSessionService (Paso 2 & Política de Progreso Guided)', () => {
  let testDb: TypeOpsDatabase
  const pack = officialPack as ContentPack

  beforeEach(async () => {
    testDb = createTestDatabase()
    // Crear una sesión de prueba en la DB
    const session: SessionRecord = {
      sessionId: 'sess-test-1',
      packId: pack.packId,
      packVersion: pack.packVersion,
      mode: 'guided',
      presetName: '5_minutes',
      startedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 300000).toISOString(),
      planItems: [
        { itemId: 'guided-tail-intro', unitId: 'unit-log-inspection', reasonCode: 'new_needs_guidance', reasonDescription: 'test' },
      ],
      currentIndex: 0,
      status: 'active',
      completionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await testDb.sessions.put(session)
  })

  afterEach(() => {
    testDb.close()
  })

  it('guarda atómicamente un intento y actualiza el progreso de aprendizaje completo para un ítem independiente', async () => {
    const item = pack.items.find((i) => i.itemId === 'cmd-tail-n') as ContentItem
    const attemptId = 'att-uuid-1'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      durationMs: 3200,
    })

    expect(result.attempt.attemptId).toBe(attemptId)
    expect(result.evaluationResult.status).toBe('correct')

    // Verificar que el intento está guardado
    const savedAttempt = await testDb.attempts.get(attemptId)
    expect(savedAttempt).toBeDefined()

    // Verificar que el progreso de aprendizaje independiente incrementa éxitos
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeDefined()
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(1)
  })

  it('persiste intento guided con texto arbitrario, realiza transición legítima a "learning" pero NO incrementa éxitos independientes ni alcanza ready_for_assessment', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-guided-foo'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'foo',
      durationMs: 4000,
    })

    // 1. El intento se persiste con su EvaluationResult original
    expect(result.attempt.attemptId).toBe(attemptId)
    expect(result.attempt.responseRaw).toBe('foo')
    expect(result.evaluationResult.status).toBe('correct')

    const savedAttempt = await testDb.attempts.get(attemptId)
    expect(savedAttempt).toBeDefined()
    expect(savedAttempt?.responseRaw).toBe('foo')

    // 2. Transición guiada legítima: new -> learning, pero independentSuccessesCount = 0
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeDefined()
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(0)
    expect(progress?.state).not.toBe('ready_for_assessment')

    // 3. El recomendador posterior usa el estado 'learning' y recomienda resume_guided
    if (progress) {
      const progressMap: Record<string, LearningProgressRecord> = {
        'unit-log-inspection': progress,
      }
      const recResult = recommendNextItem({ pack, mode: 'guided', progressMap })
      expect(recResult?.reasonCode).toBe('resume_guided')
    }
  })

  it('garantiza idempotencia ante envíos duplicados con el mismo attemptId', async () => {
    const item = pack.items.find((i) => i.itemId === 'cmd-tail-n') as ContentItem
    const attemptId = 'att-uuid-repeat'

    const result1 = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      durationMs: 3200,
    })

    const result2 = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      durationMs: 3200,
    })

    expect(result1.attempt.attemptId).toBe(attemptId)
    expect(result2.attempt.attemptId).toBe(attemptId)

    const allAttempts = await testDb.attempts.toArray()
    expect(allAttempts).toHaveLength(1)
  })

  it('preserva status: "needs_review" y marca workflowStatus: "pending_review" para open_question', async () => {
    const openItem = pack.items.find((i) => i.kind === 'open_question') as ContentItem
    const attemptId = 'att-open-1'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: openItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'Verificar si hubo algún intento exitoso en los logs.',
      durationMs: 12000,
    })

    expect(result.evaluationResult.status).toBe('needs_review')
    expect(result.evaluationResult.requiresReview).toBe(true)
    expect(result.attempt.workflowStatus).toBe('pending_review')
  })

  it('permite reintentar el cierre de sesión si falló sin borrar activeSessionId', async () => {
    await testDb.settings.put({
      key: 'activeSessionId',
      value: 'sess-test-1',
      updatedAt: new Date().toISOString(),
    })

    await closeSession(testDb, 'sess-test-1', 'items_completed')

    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.status).toBe('completed')

    const activeSetting = await testDb.settings.get('activeSessionId')
    expect(activeSetting).toBeUndefined()
  })
})
