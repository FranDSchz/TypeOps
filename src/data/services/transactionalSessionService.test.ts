import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { submitAttempt } from './transactionalSessionService'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, ContentItem } from '../../domain/content/types'
import type { SessionRecord, LearningProgressRecord } from '../db/records'
import { recommendNextItem } from '../../domain/recommendation/recommendationEngine'

describe('TransactionalSessionService (Política Completa Hito 4)', () => {
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

  it('1. Texto arbitrario incorrecto en guided ("foo"): se evalúa como incorrecto (failed), no avanza currentIndex y no modifica progreso', async () => {
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

    expect(result.attempt.attemptId).toBe(attemptId)
    expect(result.attempt.workflowStatus).toBe('failed')
    expect(result.evaluationResult.status).toBe('incorrect')
    expect(result.evaluationResult.feedbackMessage).toContain("El comando ingresado no coincide con el ejercicio guiado")

    // NO avanza el currentIndex (permanece en 0)
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(0)

    // NO modifica progreso
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeUndefined()
  })

  it('2. Respuesta esperada en guided ("tail -n 20 /var/log/auth.log"): se registra como guided_step_recorded, avanza currentIndex pero independentSuccessesCount es 0', async () => {
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
    expect(result.evaluationResult.status).toBe('correct')

    // Avanza currentIndex a 1
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(1)

    // Transiciona de new -> learning pero independentSuccessesCount = 0
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(0)
  })

  it('3. Omitir: se guarda como workflowStatus "skipped", evaluationResult "not_assessed", avanza currentIndex una sola vez y no modifica progreso', async () => {
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

    // Avance de la sesión: currentIndex pasa de 0 a 1
    const updatedSession = await testDb.sessions.get('sess-test-1')
    expect(updatedSession?.currentIndex).toBe(1)

    // Sin cambios en éxitos independientes de LearningProgress por omitir
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeUndefined()
  })

  it('4. Respuesta vacía en guided: se guarda como workflowStatus "failed", no avanza currentIndex y no actualiza progreso', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-empty-1'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: '',
      durationMs: 2000,
    })

    expect(result.attempt.workflowStatus).toBe('failed')
    expect(result.evaluationResult.status).toBe('incorrect')

    // NO avanza el currentIndex (se mantiene en 0)
    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(0)

    // NO modifica progreso
    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress).toBeUndefined()
  })

  it('5. Paridad entre ruta rápida y Modo 4: la recomendación posterior usa "resume_guided"', async () => {
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
})
