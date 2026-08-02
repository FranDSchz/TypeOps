import type { TypeOpsDatabase } from '../db/database'
import type { ContentItem, GuidedPracticeItem } from '../../domain/content/types'
import type { EvaluationResult, EvaluationOptions } from '../../domain/evaluation/types'
import type { AttemptRecord, SessionCompletionReason, LearningProgressRecord } from '../db/records'
import { evaluateContentItem } from '../../domain/evaluation'
import { validateResponsePresent } from '../../domain/evaluation/responseValidation'
import { computeNextLearningState, type ComputeLearningStateOptions, type LearningProgress } from '../../domain/learning/learningState'
import { aggregateObservationIntoProfile } from '../../domain/mechanical/mechanicalProfile'
import {
  normalizeCompletedGuidedStages,
  deriveActiveGuidedStage,
  computeNextGuidedLearningState,
  type GuidedItemProgressRecord,
  type ActiveGuidedStageResult,
} from '../../domain/learning/guidedState'
import { evaluateGuidedStage } from '../../domain/evaluation/guidedEvaluator'

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

export interface AdvanceExpositoryStageOptions {
  db: TypeOpsDatabase
  sessionId: string
  item: GuidedPracticeItem
  packId: string
  packVersion: string
  stageId: string
}

export interface AdvanceExpositoryStageResult {
  guidedProgress: GuidedItemProgressRecord
  activeStageResult: ActiveGuidedStageResult
  isSessionCompleted: boolean
}

export async function advanceExpositoryGuidedStage(
  options: AdvanceExpositoryStageOptions,
): Promise<AdvanceExpositoryStageResult> {
  const { db, sessionId, item, packId, packVersion, stageId } = options
  const progressKey = `${packId}:${packVersion}:${item.itemId}`
  const nowIso = new Date().toISOString()
  const unitId = item.unitIds[0] ?? item.itemId

  return db.transaction(
    'rw',
    [db.guidedProgress, db.learningProgress, db.sessions],
    async () => {
      const existingProgress = await db.guidedProgress.get(progressKey)
      const normalizedCompleted = normalizeCompletedGuidedStages(
        item,
        existingProgress?.completedStageIds,
      )

      const activeCurrent = deriveActiveGuidedStage(item, existingProgress)
      if (
        activeCurrent.isCompleted ||
        !activeCurrent.activeStage ||
        activeCurrent.activeStage.stageId !== stageId ||
        activeCurrent.activeStage.stageType === 'later_variant'
      ) {
        const sessionRecord = await db.sessions.get(sessionId)
        return {
          guidedProgress: existingProgress ?? {
            progressKey,
            packId,
            packVersion,
            itemId: item.itemId,
            completedStageIds: normalizedCompleted,
            updatedAt: nowIso,
          },
          activeStageResult: activeCurrent,
          isSessionCompleted: sessionRecord ? sessionRecord.status === 'completed' : false,
        }
      }

      const updatedCompleted = [...normalizedCompleted, stageId]

      const updatedGuidedProgress: GuidedItemProgressRecord = {
        progressKey,
        packId,
        packVersion,
        itemId: item.itemId,
        completedStageIds: updatedCompleted,
        updatedAt: nowIso,
      }
      await db.guidedProgress.put(updatedGuidedProgress)

      const compositeUnitKey = `${packId}:${unitId}`
      const currentLearningRecord = await db.learningProgress.get(compositeUnitKey)
      const nextLearningRecord = computeNextGuidedLearningState(
        currentLearningRecord,
        packId,
        unitId,
        'exposure_completed',
        nowIso,
        item.itemId,
      )
      await db.learningProgress.put(nextLearningRecord)

      const activeStageResult = deriveActiveGuidedStage(item, updatedGuidedProgress)

      const sessionRecord = await db.sessions.get(sessionId)
      const isSessionCompleted = sessionRecord ? sessionRecord.status === 'completed' : false

      return {
        guidedProgress: updatedGuidedProgress,
        activeStageResult,
        isSessionCompleted,
      }
    },
  )
}

export async function submitAttempt(options: SubmitAttemptOptions): Promise<SubmitAttemptResult> {
  const { db, attemptId, sessionId, item, packId, packVersion, responseRaw, evaluationOptions, durationMs } = options

  // 0. Comprobar si es un intento de omisión (Omitir)
  const isSkipped =
    (typeof responseRaw === 'object' && responseRaw !== null && Boolean((responseRaw as { isSkipped?: boolean }).isSkipped)) ||
    Boolean(evaluationOptions?.isSkipped)

  // 1. Validación previa de presencia de respuesta antes de abrir transacción (si no es omisión)
  if (!isSkipped) {
    const validation = validateResponsePresent(item, responseRaw)
    if (!validation.isValid) {
      throw new Error(`INVALID_RESPONSE_PRESENT: ${validation.errorMessage ?? 'Respuesta requerida para enviar.'}`)
    }
  }

  return db.transaction('rw', [db.attempts, db.learningProgress, db.sessions, db.mechanicalProfiles, db.guidedProgress], async () => {
    // 2. Verificación de idempotencia por attemptId
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

    const unitId = item.unitIds[0] ?? item.itemId
    const nowIso = new Date().toISOString()
    let guidedStageId = evaluationOptions?.guidedStageId

    if (!guidedStageId && typeof responseRaw === 'object' && responseRaw !== null) {
      guidedStageId = (responseRaw as { stageId?: string }).stageId
    }

    // 2.1. Idempotencia de etapa guiada ya completada (Mandato 7)
    if (item.kind === 'guided_practice' && guidedStageId) {
      const progressKey = `${packId}:${packVersion}:${item.itemId}`
      const existingGuided = await db.guidedProgress.get(progressKey)
      const normalizedCompleted = normalizeCompletedGuidedStages(
        item,
        existingGuided?.completedStageIds,
      )

      if (normalizedCompleted.includes(guidedStageId)) {
        const dummyResult: EvaluationResult = {
          status: 'not_assessed',
          dimensionResults: { concept: 'not_assessed', toolSelection: 'not_assessed', semanticStructure: 'not_assessed', syntax: 'not_assessed', interpretation: 'not_assessed', verification: 'not_assessed', mechanical: 'not_assessed' },
          errorCodes: [],
          feedbackCode: 'GUIDED_STAGE_ALREADY_COMPLETED',
          feedbackMessage: 'La etapa de práctica guiada ya fue completada previamente.',
          requiresReview: false,
        }
        const session = await db.sessions.get(sessionId)
        return {
          attempt: {
            attemptId,
            sessionId,
            packId,
            packVersion,
            itemId: item.itemId,
            unitId,
            responseRaw,
            evaluationResult: dummyResult,
            workflowStatus: 'evaluated',
            hintsUsedCount: 0,
            durationMs,
            createdAt: nowIso,
            guidedStageId,
          },
          evaluationResult: dummyResult,
          isSessionCompleted: session ? session.status === 'completed' : false,
        }
      }
    }

    // Evaluar la respuesta según tipo de ítem
    let evaluationResult: EvaluationResult

    if (isSkipped) {
      evaluationResult = {
        status: 'not_assessed',
        dimensionResults: {
          concept: 'not_assessed',
          toolSelection: 'not_assessed',
          semanticStructure: 'not_assessed',
          syntax: 'not_assessed',
          interpretation: 'not_assessed',
          verification: 'not_assessed',
          mechanical: 'not_assessed',
        },
        errorCodes: [],
        feedbackCode: 'ITEM_SKIPPED',
        feedbackMessage: 'El ejercicio fue omitido voluntariamente.',
        requiresReview: false,
      }
    } else if (item.kind === 'guided_practice') {
      let responseStr = ''
      if (typeof responseRaw === 'string') {
        responseStr = responseRaw
      } else if (typeof responseRaw === 'object' && responseRaw !== null && 'responseRaw' in responseRaw) {
        const val = (responseRaw as Record<string, unknown>).responseRaw
        if (typeof val === 'string') {
          responseStr = val
        }
      }

      const guidedEval = evaluateGuidedStage(item, {
        stageId: guidedStageId ?? '',
        responseRaw: responseStr,
      })

      const evalRes: EvaluationResult = {
        status: guidedEval.status,
        dimensionResults: guidedEval.dimensionResults,
        errorCodes: guidedEval.errorCodes,
        requiresReview: guidedEval.requiresReview,
      }
      if (guidedEval.feedbackCode !== undefined) {
        evalRes.feedbackCode = guidedEval.feedbackCode
      }
      if (guidedEval.feedbackMessage !== undefined) {
        evalRes.feedbackMessage = guidedEval.feedbackMessage
      }
      evaluationResult = evalRes
    } else {
      evaluationResult = evaluateContentItem(item, responseRaw, evaluationOptions)

      if (item.kind === 'typing_copy') {
        evaluationResult.dimensionResults.mechanical = 'not_assessed'
      }
    }

    const workflowStatus = isSkipped
      ? 'skipped'
      : item.kind === 'guided_practice'
        ? 'evaluated'
        : evaluationResult.requiresReview
          ? 'pending_review'
          : 'evaluated'

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

    if (guidedStageId) {
      attemptRecord.guidedStageId = guidedStageId
    }

    if (evaluationOptions?.mechanicalObservation) {
      attemptRecord.mechanicalObservation = evaluationOptions.mechanicalObservation
    }

    await db.attempts.put(attemptRecord)

    // 3.1. Agregación atómica del Perfil Mecánico (Subhito 5B)
    if (attemptRecord.mechanicalObservation && attemptRecord.mechanicalObservation.isValid) {
      const profileKey = `${packId}:${packVersion}`
      const existingProfileRecord = await db.mechanicalProfiles.get(profileKey)
      const updatedProfile = aggregateObservationIntoProfile(
        attemptRecord.mechanicalObservation,
        existingProfileRecord,
        profileKey,
        packId,
        packVersion,
      )
      await db.mechanicalProfiles.put(updatedProfile)
    }

    // 4. Actualizar progreso de aprendizaje y guiado
    const compositeUnitKey = `${packId}:${unitId}`
    const currentProgressRecord = await db.learningProgress.get(compositeUnitKey)
    let shouldAdvanceSession = true

    if (isSkipped && item.kind !== 'guided_practice') {
      // Omisión de otros ítems NO crea progreso
    } else if (item.kind === 'guided_practice' && guidedStageId) {
      const progressKey = `${packId}:${packVersion}:${item.itemId}`
      const existingGuided = await db.guidedProgress.get(progressKey)
      const currentCompleted = normalizeCompletedGuidedStages(
        item,
        existingGuided?.completedStageIds,
      )

      const previousAttempts = await db.attempts
        .where('sessionId')
        .equals(sessionId)
        .filter((a) => a.itemId === item.itemId && a.guidedStageId === guidedStageId && a.attemptId !== attemptRecord.attemptId)
        .toArray()

      const stage = item.stages.find((s) => s.stageId === guidedStageId)
      let stageCompleted = false
      let guidedEvent: Parameters<typeof computeNextGuidedLearningState>[3] = 'exposure_completed'

      if (stage?.stageType === 'guided_exercise') {
        if (isSkipped) {
          stageCompleted = true
          guidedEvent = 'stage_skipped'
        } else if (evaluationResult.status === 'correct') {
          stageCompleted = true
          guidedEvent = 'assisted_success'
        } else {
          if (previousAttempts.length === 0) {
            stageCompleted = false
            guidedEvent = 'exposure_completed'
          } else {
            stageCompleted = true
            guidedEvent = 'assisted_completed_without_success'
          }
        }
      } else if (stage?.stageType === 'unassisted_exercise') {
        stageCompleted = true
        if (isSkipped) {
          guidedEvent = 'stage_skipped'
        } else if (evaluationResult.status === 'correct') {
          guidedEvent = 'independent_success'
        } else if (evaluationResult.requiresReview) {
          guidedEvent = 'needs_review'
        } else {
          guidedEvent = 'independent_non_success'
        }
      }

      let updatedCompleted = currentCompleted
      if (stageCompleted && !currentCompleted.includes(guidedStageId)) {
        updatedCompleted = [...currentCompleted, guidedStageId]
      }

      const updatedGuidedProgress: GuidedItemProgressRecord = {
        progressKey,
        packId,
        packVersion,
        itemId: item.itemId,
        completedStageIds: updatedCompleted,
        updatedAt: nowIso,
      }
      await db.guidedProgress.put(updatedGuidedProgress)

      const nextLearningProgress = computeNextGuidedLearningState(
        currentProgressRecord,
        packId,
        unitId,
        guidedEvent,
        nowIso,
        item.itemId,
      )
      await db.learningProgress.put(nextLearningProgress)

      const activeStageResult = deriveActiveGuidedStage(item, updatedGuidedProgress)
      shouldAdvanceSession = activeStageResult.isCompleted || isSkipped
    } else if (item.kind === 'typing_copy') {
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
          ? 'TYPING_EXPOSURE_OPENED'
          : (currentProgressRecord.lastReasonCode ?? 'TYPING_PRACTICED'),
        updatedAt: nowIso,
      }

      if (currentProgressRecord?.nextReviewAt !== undefined) {
        updatedProgressRecord.nextReviewAt = currentProgressRecord.nextReviewAt
      }

      await db.learningProgress.put(updatedProgressRecord)
    } else if (item.kind !== 'open_question') {
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

    // 5. Actualizar avance de la sesión (currentIndex) únicamente cuando corresponde
    const sessionRecord = await db.sessions.get(sessionId)
    let isSessionCompleted = false

    if (sessionRecord && shouldAdvanceSession) {
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
    } else if (sessionRecord) {
      isSessionCompleted = sessionRecord.status === 'completed'
    }

    return {
      attempt: attemptRecord,
      evaluationResult,
      isSessionCompleted,
    }
  })
}

export async function closeSession(
  db: TypeOpsDatabase,
  sessionId: string,
  reason: SessionCompletionReason,
): Promise<void> {
  await db.transaction('rw', [db.sessions, db.settings], async () => {
    const sessionRecord = await db.sessions.get(sessionId)
    if (sessionRecord) {
      sessionRecord.status = 'completed'
      sessionRecord.completionReason = reason
      sessionRecord.updatedAt = new Date().toISOString()
      await db.sessions.put(sessionRecord)
    }

    const activeSetting = await db.settings.get('activeSessionId')
    if (activeSetting && activeSetting.value === sessionId) {
      await db.settings.delete('activeSessionId')
    }
  })
}
