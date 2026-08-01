import type { TypeOpsDatabase } from '../db/database'
import type { AttemptRecord, LearningProgressRecord, SessionCompletionReason, WorkflowStatus } from '../db/records'
import type { ContentItem } from '../../domain/content/types'
import { evaluateContentItem } from '../../domain/evaluation'
import type { EvaluationOptions, EvaluationResult } from '../../domain/evaluation/types'
import { computeNextLearningState, type LearningProgress, type ComputeLearningStateOptions } from '../../domain/learning/learningState'

export interface SubmitAttemptOptions {
  db: TypeOpsDatabase
  attemptId: string
  sessionId: string
  item: ContentItem
  packId: string
  packVersion: string
  responseRaw: unknown
  evaluationOptions?: EvaluationOptions
  durationMs: number
}

export interface SubmitAttemptResult {
  attempt: AttemptRecord
  evaluationResult: EvaluationResult
  isSessionCompleted: boolean
}

/**
 * Procesa la evaluación y persiste el intento, progreso de aprendizaje
 * y avance de la sesión de forma estrictamente atómica e idempotente.
 */
export async function submitAttempt(options: SubmitAttemptOptions): Promise<SubmitAttemptResult> {
  const { db, attemptId, sessionId, item, packId, packVersion, responseRaw, evaluationOptions, durationMs } = options

  return db.transaction('rw', [db.attempts, db.learningProgress, db.sessions], async () => {
    // 1. Verificación de idempotencia
    const existingAttempt = await db.attempts.get(attemptId)
    if (existingAttempt) {
      const session = await db.sessions.get(sessionId)
      const isSessionCompleted = session ? session.status === 'completed' : false
      return {
        attempt: existingAttempt,
        evaluationResult: existingAttempt.evaluationResult,
        isSessionCompleted,
      }
    }

    // 2. Evaluación determinista del item
    const evaluationResult = evaluateContentItem(item, responseRaw, evaluationOptions)

    // Para typing_copy sin captura mecánica completa, asegurar dimensión not_assessed
    if (item.kind === 'typing_copy') {
      evaluationResult.dimensionResults.mechanical = 'not_assessed'
    }

    // Para open_question, workflowStatus = 'pending_review' manteniendo status: 'needs_review'
    const workflowStatus: WorkflowStatus = item.kind === 'open_question' ? 'pending_review' : 'evaluated'

    const unitId = item.unitIds[0] ?? item.itemId
    const nowIso = new Date().toISOString()

    // 3. Crear registro de intento
    const attemptRecord: AttemptRecord = {
      attemptId,
      sessionId,
      packId,
      packVersion,
      itemId: item.itemId,
      unitId,
      responseRaw,
      evaluationResult,
      workflowStatus,
      hintsUsedCount: evaluationOptions?.hintsUsedCount ?? 0,
      durationMs,
      createdAt: nowIso,
    }

    await db.attempts.put(attemptRecord)

    // 4. Actualizar progreso de aprendizaje con clave primaria compuesta ${packId}:${unitId}
    const compositeUnitKey = `${packId}:${unitId}`
    const currentProgressRecord = await db.learningProgress.get(compositeUnitKey)

    if (item.kind === 'guided_practice') {
      // Política de avance para guided_practice en Hito 4:
      // - Si la unidad no fue iniciada (sin registro o state: 'new'), transiciona a state: 'learning'
      //   (transición guiada legítima para que la recomendación posterior pase a 'resume_guided').
      // - NO incrementa independentSuccessesCount (permanece en 0 o valor previo).
      // - NO produce 'ready_for_assessment' ni programa 'nextReviewAt'.
      const existingPracticed = currentProgressRecord?.practicedItemIds ?? []
      const updatedPracticedItemIds = Array.from(new Set([...existingPracticed, item.itemId]))
      const nextState = !currentProgressRecord || currentProgressRecord.state === 'new'
        ? 'learning'
        : currentProgressRecord.state

      const updatedProgressRecord: LearningProgressRecord = {
        compositeUnitKey,
        packId,
        unitId,
        state: nextState,
        independentSuccessesCount: currentProgressRecord?.independentSuccessesCount ?? 0,
        practicedItemIds: updatedPracticedItemIds,
        lastPracticedAt: nowIso,
        lastReasonCode: !currentProgressRecord || currentProgressRecord.state === 'new'
          ? 'INITIAL_LEARNING_OPENED'
          : (currentProgressRecord.lastReasonCode ?? 'GUIDED_STAGE_COMPLETED'),
        updatedAt: nowIso,
      }

      if (currentProgressRecord?.nextReviewAt !== undefined) {
        updatedProgressRecord.nextReviewAt = currentProgressRecord.nextReviewAt
      }

      await db.learningProgress.put(updatedProgressRecord)
    } else {
      // Para ítems independientes (command_intention, typing_copy, exact_question, decision),
      // se utiliza la máquina de estados completa computeNextLearningState()
      let currentDomainProgress: LearningProgress | undefined = undefined
      if (currentProgressRecord) {
        currentDomainProgress = {
          unitId: currentProgressRecord.unitId,
          state: currentProgressRecord.state,
          independentSuccessesCount: currentProgressRecord.independentSuccessesCount,
          practicedItemIds: currentProgressRecord.practicedItemIds,
        }
        if (currentProgressRecord.lastPracticedAt !== undefined) {
          currentDomainProgress.lastPracticedAt = currentProgressRecord.lastPracticedAt
        }
        if (currentProgressRecord.nextReviewAt !== undefined) {
          currentDomainProgress.nextReviewAt = currentProgressRecord.nextReviewAt
        }
        if (currentProgressRecord.lastReasonCode !== undefined) {
          currentDomainProgress.lastReasonCode = currentProgressRecord.lastReasonCode
        }
      }

      const computeOpts: ComputeLearningStateOptions = {
        itemId: item.itemId,
        unitId,
        evaluationResult,
      }
      if (currentDomainProgress !== undefined) {
        computeOpts.currentProgress = currentDomainProgress
      }
      if (evaluationOptions?.hintsUsedCount !== undefined) {
        computeOpts.hintsUsedCount = evaluationOptions.hintsUsedCount
      }

      const nextDomainProgress = computeNextLearningState(computeOpts)

      const updatedProgressRecord: LearningProgressRecord = {
        compositeUnitKey,
        packId,
        unitId,
        state: nextDomainProgress.state,
        independentSuccessesCount: nextDomainProgress.independentSuccessesCount,
        practicedItemIds: nextDomainProgress.practicedItemIds,
        updatedAt: nowIso,
      }
      if (nextDomainProgress.lastPracticedAt !== undefined) {
        updatedProgressRecord.lastPracticedAt = nextDomainProgress.lastPracticedAt
      }
      if (nextDomainProgress.nextReviewAt !== undefined) {
        updatedProgressRecord.nextReviewAt = nextDomainProgress.nextReviewAt
      }
      if (nextDomainProgress.lastReasonCode !== undefined) {
        updatedProgressRecord.lastReasonCode = nextDomainProgress.lastReasonCode
      }

      await db.learningProgress.put(updatedProgressRecord)
    }

    // 5. Actualizar avance de la sesión
    const sessionRecord = await db.sessions.get(sessionId)
    let isSessionCompleted = false

    if (sessionRecord) {
      const nextIndex = sessionRecord.currentIndex + 1
      const allItemsCompleted = nextIndex >= sessionRecord.planItems.length
      const isTimeExpired = sessionRecord.deadlineAt ? new Date().getTime() >= new Date(sessionRecord.deadlineAt).getTime() : false

      if (allItemsCompleted || isTimeExpired) {
        isSessionCompleted = true
        sessionRecord.currentIndex = nextIndex
        sessionRecord.status = 'completed'
        sessionRecord.completionReason = allItemsCompleted ? 'items_completed' : 'time_expired'
        sessionRecord.updatedAt = nowIso
      } else {
        sessionRecord.currentIndex = nextIndex
        sessionRecord.updatedAt = nowIso
      }

      await db.sessions.put(sessionRecord)
    }

    return {
      attempt: attemptRecord,
      evaluationResult,
      isSessionCompleted,
    }
  })
}

/**
 * Cierra la sesión de forma atómica y elimina activeSessionId de settings
 * solo si la transacción de cierre se confirma con éxito.
 */
export async function closeSession(
  db: TypeOpsDatabase,
  sessionId: string,
  completionReason: SessionCompletionReason,
): Promise<void> {
  await db.transaction('rw', [db.sessions, db.settings], async () => {
    const session = await db.sessions.get(sessionId)
    if (!session) return

    const nowIso = new Date().toISOString()
    session.status = 'completed'
    session.completionReason = completionReason
    session.updatedAt = nowIso

    await db.sessions.put(session)

    // Eliminar activeSessionId de la tabla settings solo al confirmar la transacción
    const settingRecord = await db.settings.get('activeSessionId')
    if (settingRecord && settingRecord.value === sessionId) {
      await db.settings.delete('activeSessionId')
    }
  })
}
