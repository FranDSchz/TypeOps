import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { submitAttempt } from './transactionalSessionService'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, ContentItem } from '../../domain/content/types'
import type { SessionRecord, LearningProgressRecord } from '../db/records'
import { recommendNextItem } from '../../domain/recommendation/recommendationEngine'

describe('TransactionalSessionService (Saneamiento V1)', () => {
  let testDb: TypeOpsDatabase
  const pack = officialPack as ContentPack

  beforeEach(async () => {
    testDb = createTestDatabase()
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
        { itemId: 'cmd-tail-n', unitId: 'unit-log-inspection', reasonCode: 'practice', reasonDescription: 'test' },
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

  it('1. Texto arbitrario en guided ("foo"): se registra como guided_step_recorded con not_assessed, avanza índice y transiciona a learning con 0 éxitos (SA-02 & SA-03)', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-guided-foo'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: { stageId: 'stg-4', responseRaw: 'foo' },
      durationMs: 4000,
    })

    expect(result.attempt.attemptId).toBe(attemptId)
    expect(result.attempt.workflowStatus).toBe('guided_step_recorded')
    expect(result.evaluationResult.status).toBe('not_assessed')
    expect(result.evaluationResult.feedbackCode).toBe('GUIDED_STAGE_RECORDED')
    expect(result.evaluationResult.dimensionResults.concept).toBe('not_assessed')

    // Avanza el currentIndex de la sesión a 1
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(1)

    // Transiciona a learning con 0 éxitos independientes
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(0)
  })

  it('2. Respuesta esperada en guided ("tail -n 20 /var/log/auth.log"): comportamiento neutral guided_step_recorded con 0 éxitos independientes', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-guided-expected'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      durationMs: 5000,
    })

    expect(result.attempt.workflowStatus).toBe('guided_step_recorded')
    expect(result.evaluationResult.status).toBe('not_assessed')

    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(1)

    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(0)
  })

  it('3. Omitir: se guarda como workflowStatus "skipped", evaluationResult "not_assessed", avanza currentIndex una vez y no modifica progreso', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-skip-1'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: { isSkipped: true },
      durationMs: 1000,
    })

    expect(result.attempt.workflowStatus).toBe('skipped')
    expect(result.evaluationResult.status).toBe('not_assessed')
    expect(result.evaluationResult.feedbackCode).toBe('ITEM_SKIPPED')

    const updatedSession = await testDb.sessions.get('sess-test-1')
    expect(updatedSession?.currentIndex).toBe(1)

    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeUndefined()
  })

  it('4. Invocación directa con respuesta vacía: arroja error previo a la transacción y no realiza escrituras parciales', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-empty-direct'

    await expect(
      submitAttempt({
        db: testDb,
        attemptId,
        sessionId: 'sess-test-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: '',
        durationMs: 2000,
      }),
    ).rejects.toThrow('INVALID_RESPONSE_PRESENT')

    // Ninguna escritura en intentos
    const attempt = await testDb.attempts.get(attemptId)
    expect(attempt).toBeUndefined()

    // El currentIndex de la sesión NO avanza
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(0)

    // El progreso no se modifica
    const progress = await testDb.learningProgress.get(`${pack.packId}:unit-log-inspection`)
    expect(progress).toBeUndefined()
  })

  it('5. SA-01 Integración: primer intento incorrecto en command_intention transiciona a learning con 0 éxitos independientes', async () => {
    const cmdItem = pack.items.find((i) => i.itemId === 'cmd-tail-n') as ContentItem
    const attemptId = 'att-cmd-incorrect'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: cmdItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'grep -n 20 /var/log/auth.log', // error de herramienta
      durationMs: 3000,
    })

    expect(result.evaluationResult.status).toBe('incorrect')
    expect(result.attempt.workflowStatus).toBe('evaluated')

    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(0)
  })

  it('6. open_question sin progreso previo: persiste el intento con pending_review, avanza la sesión y NO crea registro en LearningProgress', async () => {
    const openItem = pack.items.find((i) => i.kind === 'open_question') as ContentItem
    const attemptId = 'att-open-no-prog'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: openItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'Análisis detallado de los eventos en auth.log.',
      durationMs: 10000,
    })

    expect(result.evaluationResult.status).toBe('needs_review')
    expect(result.evaluationResult.requiresReview).toBe(true)
    expect(result.attempt.workflowStatus).toBe('pending_review')

    // La sesión avanza 1 posición
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(1)

    // No se crea registro de progreso en la base de datos
    const unitId = openItem.unitIds[0] ?? openItem.itemId
    const compositeUnitKey = `${pack.packId}:${unitId}`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeUndefined()
  })

  it('7. open_question con progreso previo: persiste el intento, avanza la sesión y deja el LearningProgress totalmente intacto', async () => {
    const openItem = pack.items.find((i) => i.kind === 'open_question') as ContentItem
    const unitId = openItem.unitIds[0] ?? openItem.itemId
    const compositeUnitKey = `${pack.packId}:${unitId}`

    const existingProgress: LearningProgressRecord = {
      compositeUnitKey,
      packId: pack.packId,
      unitId,
      state: 'practicing',
      independentSuccessesCount: 1,
      practicedItemIds: ['item-prior-1'],
      lastPracticedAt: '2026-08-01T12:00:00.000Z',
      lastReasonCode: 'INDEPENDENT_SUCCESS_PRACTICING',
      updatedAt: '2026-08-01T12:00:00.000Z',
    }
    await testDb.learningProgress.put(existingProgress)

    const attemptId = 'att-open-with-prog'
    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: openItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'Análisis de incidentes en el sistema.',
      durationMs: 8000,
    })

    expect(result.attempt.workflowStatus).toBe('pending_review')

    // Sesión avanza
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(1)

    // Progreso se mantiene 100% idéntico e intacto (incluyendo updatedAt)
    const afterProgress = await testDb.learningProgress.get(compositeUnitKey)
    expect(afterProgress).toEqual(existingProgress)
  })

  it('8. Paridad entre ruta rápida y Modo 4: la recomendación posterior usa "resume_guided"', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem

    await submitAttempt({
      db: testDb,
      attemptId: 'att-parity-1',
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: 'tail -n 20 /var/log/auth.log',
      durationMs: 3000,
    })

    const progress = await testDb.learningProgress.get(`${pack.packId}:unit-log-inspection`)
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
})
