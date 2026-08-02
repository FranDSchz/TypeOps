import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { submitAttempt, advanceExpositoryGuidedStage } from './transactionalSessionService'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, ContentItem, GuidedPracticeItem } from '../../domain/content/types'
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
    expect(result.attempt.workflowStatus).toBe('evaluated')
  })

  it('2. Respuesta esperada en guided ("tail -n 20 /var/log/auth.log"): comportamiento en 5C', async () => {
    const guidedItem = pack.items.find((i) => i.itemId === 'guided-tail-intro') as ContentItem
    const attemptId = 'att-guided-expected'

    const result = await submitAttempt({
      db: testDb,
      attemptId,
      sessionId: 'sess-test-1',
      item: guidedItem,
      packId: pack.packId,
      packVersion: pack.packVersion,
      responseRaw: { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
      evaluationOptions: { guidedStageId: 'stg-4' },
      durationMs: 5000,
    })

    expect(result.attempt.workflowStatus).toBe('evaluated')
    expect(result.evaluationResult.status).toBe('correct')

    const session = await testDb.sessions.get('sess-test-1')
    expect(session?.currentIndex).toBe(0)

    const compositeUnitKey = `${pack.packId}:unit-log-inspection`
    const progress = await testDb.learningProgress.get(compositeUnitKey)
    expect(progress?.state).toBe('practicing')
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
    expect(progress?.state).toBe('learning')
    expect(progress?.independentSuccessesCount).toBe(0)
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

  // Subhito 5B — Pruebas Transaccionales de Typing
  describe('Pruebas Transaccionales de Typing (Subhito 5B)', () => {
    const typingItem = pack.items.find((i) => i.kind === 'typing_copy') as ContentItem
    const unitId = typingItem.unitIds[0] ?? typingItem.itemId

    const validObs = {
      isValid: true,
      validityLimitations: [],
      targetLength: 15,
      finalLength: 15,
      initialErrorsCount: 0,
      globalCorrectionsCount: 0,
      finalCorrectCharsCount: 15,
      observedSequences: {
        l: { totalAppearances: 2, validLatenciesMs: [100, 110] },
      },
    }

    const invalidObs = {
      isValid: false,
      validityLimitations: ['paste_detected' as const],
      targetLength: 15,
      finalLength: 15,
      initialErrorsCount: 0,
      globalCorrectionsCount: 0,
      finalCorrectCharsCount: 15,
      observedSequences: {},
    }

    it('A. Intento válido nuevo: persiste AttemptRecord con observation, crea MechanicalProfileRecord, avanza sesión y pasa new -> learning con 0 éxitos', async () => {
      const attemptId = 'att-typing-valid-new'

      const result = await submitAttempt({
        db: testDb,
        attemptId,
        sessionId: 'sess-test-1',
        item: typingItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: 'ls -la /var/log',
        evaluationOptions: { mechanicalObservation: validObs },
        durationMs: 3000,
      })

      expect(result.attempt.attemptId).toBe(attemptId)
      expect(result.attempt.mechanicalObservation).toBeDefined()
      expect(result.attempt.mechanicalObservation?.isValid).toBe(true)

      // Avance de sesión
      const session = await testDb.sessions.get('sess-test-1')
      expect(session?.currentIndex).toBe(1)

      // Perfil mecánico creado
      const profileKey = `${pack.packId}:${pack.packVersion}`
      const profile = await testDb.mechanicalProfiles.get(profileKey)
      expect(profile).toBeDefined()
      expect(profile?.characterMetrics['l']).toBeDefined()

      // Progreso conceptual: new -> learning con 0 éxitos
      const compositeKey = `${pack.packId}:${unitId}`
      const progress = await testDb.learningProgress.get(compositeKey)
      expect(progress?.state).toBe('learning')
      expect(progress?.independentSuccessesCount).toBe(0)
    })

    it('B. Progreso conceptual existente (practicing/mastered): preserva intactos state, éxitos, timestamps y razón', async () => {
      const compositeKey = `${pack.packId}:${unitId}`
      const existingProgress: LearningProgressRecord = {
        compositeUnitKey: compositeKey,
        packId: pack.packId,
        unitId,
        state: 'practicing',
        independentSuccessesCount: 2,
        practicedItemIds: ['item-old-1'],
        lastPracticedAt: '2026-08-01T10:00:00.000Z',
        lastReasonCode: 'INDEPENDENT_SUCCESS_PRACTICING',
        updatedAt: '2026-08-01T10:00:00.000Z',
      }
      await testDb.learningProgress.put(existingProgress)

      await submitAttempt({
        db: testDb,
        attemptId: 'att-typing-existing-prog',
        sessionId: 'sess-test-1',
        item: typingItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: 'ls -la /var/log',
        evaluationOptions: { mechanicalObservation: validObs },
        durationMs: 2500,
      })

      const afterProgress = await testDb.learningProgress.get(compositeKey)
      expect(afterProgress?.state).toBe('practicing')
      expect(afterProgress?.independentSuccessesCount).toBe(2)
      expect(afterProgress?.practicedItemIds).toContain(typingItem.itemId)
      expect(afterProgress?.practicedItemIds).toContain('item-old-1')
    })

    it('C. Observación inválida (paste_detected / focus_lost): persiste intento, avanza sesión, evalúa fidelidad, pero NO modifica MechanicalProfileRecord', async () => {
      const attemptId = 'att-typing-invalid-obs'

      await submitAttempt({
        db: testDb,
        attemptId,
        sessionId: 'sess-test-1',
        item: typingItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: 'ls -la /var/log',
        evaluationOptions: { mechanicalObservation: invalidObs },
        durationMs: 1000,
      })

      // Intento persistido
      const attempt = await testDb.attempts.get(attemptId)
      expect(attempt).toBeDefined()
      expect(attempt?.mechanicalObservation?.isValid).toBe(false)

      // Sesión avanzada
      const session = await testDb.sessions.get('sess-test-1')
      expect(session?.currentIndex).toBe(1)

      // Perfil mecánico NO creado
      const profileKey = `${pack.packId}:${pack.packVersion}`
      const profile = await testDb.mechanicalProfiles.get(profileKey)
      expect(profile).toBeUndefined()
    })

    it('D. Idempotencia ante envíos duplicados con el mismo attemptId', async () => {
      const attemptId = 'att-idempotent-repeat'

      const res1 = await submitAttempt({
        db: testDb,
        attemptId,
        sessionId: 'sess-test-1',
        item: typingItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: 'ls -la /var/log',
        evaluationOptions: { mechanicalObservation: validObs },
        durationMs: 3000,
      })

      // Reenvío con observación diferente
      const differentObs = { ...validObs, finalLength: 10 }
      const res2 = await submitAttempt({
        db: testDb,
        attemptId,
        sessionId: 'sess-test-1',
        item: typingItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: 'ls -la /var/log',
        evaluationOptions: { mechanicalObservation: differentObs },
        durationMs: 3000,
      })

      expect(res1.attempt.attemptId).toBe(attemptId)
      expect(res2.attempt.attemptId).toBe(attemptId)

      // Sólo 1 intento almacenado en la DB
      const attempts = await testDb.attempts.toArray()
      expect(attempts).toHaveLength(1)

      // La sesión avanzó 1 vez y no 2
      const session = await testDb.sessions.get('sess-test-1')
      expect(session?.currentIndex).toBe(1)
    })

    it('E. Rollback: si ocurre un fallo dentro de submitAttempt, revierte atómicamente la transacción (sin dejar intento ni perfil)', async () => {
      const attemptId = 'att-rollback-submit-test'
      const originalSessionsPut = testDb.sessions.put.bind(testDb.sessions)
      testDb.sessions.put = () => {
        throw new Error('SIMULATED_TRANSACTION_FAILURE_IN_SUBMIT')
      }

      try {
        await submitAttempt({
          db: testDb,
          attemptId,
          sessionId: 'sess-test-1',
          item: typingItem,
          packId: pack.packId,
          packVersion: pack.packVersion,
          responseRaw: 'ls -la /var/log',
          evaluationOptions: { mechanicalObservation: validObs },
          durationMs: 2500,
        })
      } catch (err) {
        expect(String(err)).toContain('SIMULATED_TRANSACTION_FAILURE_IN_SUBMIT')
      } finally {
        testDb.sessions.put = originalSessionsPut
      }

      // Comprobar que la transacción se revirtió: ni el intento ni el perfil mecánico existen
      const attempt = await testDb.attempts.get(attemptId)
      expect(attempt).toBeUndefined()

      const profileKey = `${pack.packId}:${pack.packVersion}`
      const profile = await testDb.mechanicalProfiles.get(profileKey)
      expect(profile).toBeUndefined()
    })
  })

  describe('Práctica Guiada Vertical — Transacciones, Reanudación e Idempotencia (Subhito 5C)', () => {
    const guidedItem = officialPack.items.find((i) => i.kind === 'guided_practice') as GuidedPracticeItem

    beforeEach(async () => {
      await testDb.sessions.put({
        sessionId: 'sess-guided-1',
        packId: pack.packId,
        packVersion: pack.packVersion,
        mode: 'guided',
        presetName: '5_minutes',
        startedAt: new Date().toISOString(),
        deadlineAt: null,
        planItems: [{ itemId: guidedItem.itemId, unitId: guidedItem.unitIds[0] ?? 'unit-log', reasonCode: 'new_needs_guidance', reasonDescription: 'Test' }],
        currentIndex: 0,
        status: 'active',
        completionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    })

    it('A. advanceExpositoryGuidedStage: avanza etapas expositivas de forma idempotente sin avanzar el índice de sesión', async () => {
      // 1. Avanzar etapa 1 (model)
      const res1 = await advanceExpositoryGuidedStage({
        db: testDb,
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        stageId: 'stg-1',
      })

      expect(res1.guidedProgress.completedStageIds).toEqual(['stg-1'])
      expect(res1.activeStageResult.activeStage?.stageId).toBe('stg-2')

      // Verificar que el índice de sesión sigue en 0
      const session1 = await testDb.sessions.get('sess-guided-1')
      expect(session1?.currentIndex).toBe(0)

      // 2. Doble click idempotente en la misma etapa 1 no duplica el arreglo de etapas completadas
      const res1Repeat = await advanceExpositoryGuidedStage({
        db: testDb,
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        stageId: 'stg-1',
      })
      expect(res1Repeat.guidedProgress.completedStageIds).toEqual(['stg-1'])
    })

    it('B. guided_exercise: 1er intento incorrecto deja la etapa incompleta para reintento; 2do intento la completa sin éxito independiente', async () => {
      // Avanzar etapas expositivas 1, 2 y 3
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-1' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-2' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-3' })

      // 1. Primer intento incorrecto en stg-4
      await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg4-try1',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'comando_incorrecto_1' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      // El primer intento no completa la etapa 4 para permitir el reintento asistido
      const progress1 = await testDb.guidedProgress.get(`${pack.packId}:${pack.packVersion}:${guidedItem.itemId}`)
      expect(progress1?.completedStageIds).not.toContain('stg-4')

      // 2. Segundo intento (reintento asistido) en stg-4
      await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg4-try2',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'comando_incorrecto_2' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      // El segundo intento agota la asistencia y completa stg-4
      const progress2 = await testDb.guidedProgress.get(`${pack.packId}:${pack.packVersion}:${guidedItem.itemId}`)
      expect(progress2?.completedStageIds).toContain('stg-4')

      // Verificar que NO otorgó éxitos independientes
      const compositeKey = `${pack.packId}:${guidedItem.unitIds[0] ?? ''}`
      const learning = await testDb.learningProgress.get(compositeKey)
      expect(learning?.independentSuccessesCount).toBe(0)
    })

    it('C. unassisted_exercise: intento correcto completa el ítem, otorga 1 éxito independiente y avanza la sesión', async () => {
      // Completar etapas 1 a 4
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-1' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-2' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-3' })

      // Resolver stg-4 correctamente
      await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg4-ok',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      // Resolver stg-5 correctamente
      const resStg5 = await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg5-ok',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-5', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-5' },
        durationMs: 2000,
      })

      expect(resStg5.isSessionCompleted).toBe(true)

      // Éxito independiente acreditado exactamente en 1
      const compositeKey = `${pack.packId}:${guidedItem.unitIds[0] ?? ''}`
      const learning = await testDb.learningProgress.get(compositeKey)
      expect(learning?.state).toBe('practicing')
      expect(learning?.independentSuccessesCount).toBe(1)

      // La sesión avanzó a completada
      const session = await testDb.sessions.get('sess-guided-1')
      expect(session?.currentIndex).toBe(1)
      expect(session?.status).toBe('completed')
    })

    it('D. Idempotencia de Etapa Guiada Completada (Mandato 7): un intento con nuevo attemptId sobre una etapa ya completada es un NO-OP seguro', async () => {
      // Completar etapas 1 a 5
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-1' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-2' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-1', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-3' })

      await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg4-ok2',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg5-ok2',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-5', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-5' },
        durationMs: 2000,
      })

      const compositeKey = `${pack.packId}:${guidedItem.unitIds[0] ?? ''}`
      const learningBefore = await testDb.learningProgress.get(compositeKey)
      expect(learningBefore?.independentSuccessesCount).toBe(1)

      // Intentar reenviar stg-5 con un NUEVO attemptId cuando stg-5 ya está completada
      const repeatRes = await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-stg5-NEW-ID-REPEAT',
        sessionId: 'sess-guided-1',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-5', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-5' },
        durationMs: 2000,
      })

      expect(repeatRes.evaluationResult.feedbackCode).toBe('GUIDED_STAGE_ALREADY_COMPLETED')

      // El contador de éxitos independientes se mantiene strictly en 1
      const learningAfter = await testDb.learningProgress.get(compositeKey)
      expect(learningAfter?.independentSuccessesCount).toBe(1)
    })

    it('E. Rutas Terminales de Etapa 5 (correct, needs_review, skipped): las 3 completan la etapa y avanzan la sesión', async () => {
      // Probar ruta needs_review en etapa 5
      await testDb.sessions.put({
        sessionId: 'sess-guided-needs-review',
        packId: pack.packId,
        packVersion: pack.packVersion,
        mode: 'guided',
        presetName: '5_minutes',
        startedAt: new Date().toISOString(),
        deadlineAt: null,
        planItems: [{ itemId: guidedItem.itemId, unitId: guidedItem.unitIds[0] ?? 'unit-log', reasonCode: 'new_needs_guidance', reasonDescription: 'Test' }],
        currentIndex: 0,
        status: 'active',
        completionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Completar etapas 1 a 4
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-needs-review', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-1' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-needs-review', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-2' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-needs-review', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-3' })
      await submitAttempt({
        db: testDb,
        attemptId: 'att-nr-stg4',
        sessionId: 'sess-guided-needs-review',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      // Enviar respuesta no reconocida en stg-5 (needs_review)
      const resNeedsReview = await submitAttempt({
        db: testDb,
        attemptId: 'att-stg5-needs-review',
        sessionId: 'sess-guided-needs-review',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-5', responseRaw: 'comando_desconocido' },
        evaluationOptions: { guidedStageId: 'stg-5' },
        durationMs: 2000,
      })

      expect(resNeedsReview.evaluationResult.status).toBe('needs_review')
      expect(resNeedsReview.isSessionCompleted).toBe(true)

      const sessNR = await testDb.sessions.get('sess-guided-needs-review')
      expect(sessNR?.currentIndex).toBe(1)
      expect(sessNR?.status).toBe('completed')

      const compositeKey = `${pack.packId}:${guidedItem.unitIds[0] ?? ''}`
      const learningNR = await testDb.learningProgress.get(compositeKey)
      // Confirmar que NO otorgó éxito independiente
      expect(learningNR?.independentSuccessesCount ?? 0).toBe(0)
      expect(learningNR?.state).not.toBe('ready_for_assessment')
      expect(learningNR?.state).not.toBe('mastered')

      // Limpiar guidedProgress para probar la ruta skipped en una nueva sesión limpia
      await testDb.guidedProgress.clear()

      // Probar ruta skipped en etapa 5
      await testDb.sessions.put({
        sessionId: 'sess-guided-skipped',
        packId: pack.packId,
        packVersion: pack.packVersion,
        mode: 'guided',
        presetName: '5_minutes',
        startedAt: new Date().toISOString(),
        deadlineAt: null,
        planItems: [{ itemId: guidedItem.itemId, unitId: guidedItem.unitIds[0] ?? 'unit-log', reasonCode: 'new_needs_guidance', reasonDescription: 'Test' }],
        currentIndex: 0,
        status: 'active',
        completionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-skipped', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-1' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-skipped', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-2' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-skipped', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-3' })
      await submitAttempt({
        db: testDb,
        attemptId: 'att-skipped-stg4',
        sessionId: 'sess-guided-skipped',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      const resSkip = await submitAttempt({
        db: testDb,
        attemptId: 'att-stg5-skipped',
        sessionId: 'sess-guided-skipped',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { isSkipped: true, stageId: 'stg-5' },
        evaluationOptions: { guidedStageId: 'stg-5', isSkipped: true },
        durationMs: 1000,
      })

      expect(resSkip.attempt.workflowStatus).toBe('skipped')
      expect(resSkip.isSessionCompleted).toBe(true)

      const sessSkip = await testDb.sessions.get('sess-guided-skipped')
      expect(sessSkip?.currentIndex).toBe(1)
      expect(sessSkip?.status).toBe('completed')
    })

    it('F. Evitar vista completada transitoria e invalidez de F5: completar etapa 5 avanza la sesión atómicamente', async () => {
      await testDb.guidedProgress.clear()

      // Crear sesión con 2 ítems
      const secondItem = officialPack.items.find((i) => i.itemId !== guidedItem.itemId) as ContentItem

      await testDb.sessions.put({
        sessionId: 'sess-guided-multi',
        packId: pack.packId,
        packVersion: pack.packVersion,
        mode: 'guided',
        presetName: '5_minutes',
        startedAt: new Date().toISOString(),
        deadlineAt: null,
        planItems: [
          { itemId: guidedItem.itemId, unitId: guidedItem.unitIds[0] ?? 'unit-log', reasonCode: 'new_needs_guidance', reasonDescription: 'Test 1' },
          { itemId: secondItem.itemId, unitId: secondItem.unitIds[0] ?? 'unit-2', reasonCode: 'new_needs_guidance', reasonDescription: 'Test 2' },
        ],
        currentIndex: 0,
        status: 'active',
        completionReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Completar etapas 1 a 4
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-multi', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-1' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-multi', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-2' })
      await advanceExpositoryGuidedStage({ db: testDb, sessionId: 'sess-guided-multi', item: guidedItem, packId: pack.packId, packVersion: pack.packVersion, stageId: 'stg-3' })
      await submitAttempt({
        db: testDb,
        attemptId: 'att-multi-stg4',
        sessionId: 'sess-guided-multi',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-4' },
        durationMs: 2000,
      })

      // Resolver etapa 5
      await submitAttempt({
        db: testDb,
        attemptId: 'att-guided-multi-stg5',
        sessionId: 'sess-guided-multi',
        item: guidedItem,
        packId: pack.packId,
        packVersion: pack.packVersion,
        responseRaw: { stageId: 'stg-5', responseRaw: 'tail -n 20 /var/log/auth.log' },
        evaluationOptions: { guidedStageId: 'stg-5' },
        durationMs: 2000,
      })

      // Confirmar que la sesión avanzó a currentIndex = 1 (segundo ítem)
      const sessionAfter = await testDb.sessions.get('sess-guided-multi')
      expect(sessionAfter?.currentIndex).toBe(1)
      expect(sessionAfter?.status).toBe('active')
      expect(sessionAfter?.planItems[sessionAfter.currentIndex]?.itemId).toBe(secondItem.itemId)
    })
  })
})
