import { useReducer, useCallback, useEffect } from 'react'
import type { TypeOpsDatabase } from '../../data/db/database'
import type { ContentItemMode, ContentPack } from '../../domain/content/types'
import type { MechanicalObservation } from '../../domain/mechanical/mechanicalObservation'
import { INITIAL_SESSION_UI_STATE, sessionReducer } from './sessionReducer'
import { createSession, type CreateSessionParams } from './sessionInitializer'
import { submitAttempt, closeSession, advanceExpositoryGuidedStage } from '../../data/services/transactionalSessionService'
import { recoverActiveSession } from './sessionRecoveryService'
import { LearningProgressRepository } from '../../data/repositories/learningProgressRepository'
import { recommendNextItem } from '../../domain/recommendation/recommendationEngine'
import type { SessionCompletionReason } from '../../data/db/records'
import type { LearningProgress } from '../../domain/learning/learningState'
import { deriveActiveGuidedStage } from '../../domain/learning/guidedState'

export function useSession(db: TypeOpsDatabase, activePack: ContentPack | null) {
  const [state, dispatch] = useReducer(sessionReducer, INITIAL_SESSION_UI_STATE)

  // Intentar recuperar una sesión activa al montar el hook si existe un activePack
  useEffect(() => {
    if (!activePack) return

    let isMounted = true
    void recoverActiveSession(db, activePack).then((recovery) => {
      if (!isMounted) return

      if (recovery.recoveryError) {
        dispatch({
          type: 'SESSION_RECOVERY_FAILED',
          sessionRecord: recovery.activeSession,
          recoveryError: recovery.recoveryError,
        })
      } else if (recovery.activeSession && recovery.sessionPlan) {
        dispatch({
          type: 'SESSION_RECOVERED',
          sessionRecord: recovery.activeSession,
          sessionPlan: recovery.sessionPlan,
          submittedAttempts: recovery.submittedAttempts,
          guidedProgress: recovery.guidedProgressRecord ?? null,
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [db, activePack])

  /**
   * Ruta rápida AC-01: Inicia una sesión recomendada en ≤3 acciones de teclado
   * utilizando una configuración predeterminada derivada del dominio (ej. guided, 5 min).
   */
  const startRecommendedSession = useCallback(async () => {
    if (!activePack) return
    const result = await createSession({
      db,
      pack: activePack,
      mode: 'guided',
      targetDurationSeconds: 300,
    })

    if (result.sessionRecord && result.sessionPlan) {
      dispatch({
        type: 'SESSION_INITIALIZED',
        sessionRecord: result.sessionRecord,
        sessionPlan: result.sessionPlan,
      })
    } else {
      dispatch({
        type: 'SESSION_EMPTY_PLAN',
        compositionResult: result.compositionResult,
      })
    }
  }, [db, activePack])

  const startConfiguring = useCallback(() => {
    dispatch({ type: 'START_CONFIGURING' })
  }, [])

  const initSession = useCallback(
    async (
      mode: ContentItemMode,
      targetDurationSeconds?: number,
      targetCount?: number,
      userFocusCategory?: string,
      targetItemId?: string,
    ) => {
      if (!activePack) return

      const createParams: CreateSessionParams = { db, pack: activePack, mode }
      if (targetDurationSeconds !== undefined) createParams.targetDurationSeconds = targetDurationSeconds
      if (targetCount !== undefined) createParams.targetCount = targetCount
      if (userFocusCategory !== undefined) createParams.userFocusCategory = userFocusCategory
      if (targetItemId !== undefined) createParams.targetItemId = targetItemId

      const result = await createSession(createParams)

      if (result.sessionRecord && result.sessionPlan) {
        dispatch({
          type: 'SESSION_INITIALIZED',
          sessionRecord: result.sessionRecord,
          sessionPlan: result.sessionPlan,
          guidedProgress: result.guidedProgressRecord ?? null,
        })
      } else {
        dispatch({
          type: 'SESSION_EMPTY_PLAN',
          compositionResult: result.compositionResult,
        })
      }
    },
    [db, activePack],
  )

  const useHint = useCallback(() => {
    dispatch({ type: 'USE_HINT' })
  }, [])

  const computeSummaryRecommendation = useCallback(async () => {
    if (!activePack || !state.sessionRecord) return null

    const progressRepo = new LearningProgressRepository(db)
    const progressRecordMap = await progressRepo.getAllProgressForPack(activePack.packId)

    const progressDomainMap: Record<string, LearningProgress> = {}
    for (const [unitId, record] of Object.entries(progressRecordMap)) {
      const domProg: LearningProgress = {
        unitId: record.unitId,
        state: record.state,
        independentSuccessesCount: record.independentSuccessesCount,
        practicedItemIds: record.practicedItemIds,
      }
      if (record.lastPracticedAt !== undefined) domProg.lastPracticedAt = record.lastPracticedAt
      if (record.nextReviewAt !== undefined) domProg.nextReviewAt = record.nextReviewAt
      if (record.lastReasonCode !== undefined) domProg.lastReasonCode = record.lastReasonCode
      progressDomainMap[unitId] = domProg
    }

    const recResult = recommendNextItem({
      pack: activePack,
      mode: state.sessionRecord.mode,
      progressMap: progressDomainMap,
    })

    if (!recResult) return null

    return {
      item: recResult.item,
      reasonCode: recResult.reasonCode,
      reasonDescription: recResult.reasonDescription,
    }
  }, [db, activePack, state.sessionRecord])

  const finishSession = useCallback(
    async (reason: SessionCompletionReason = 'items_completed') => {
      if (!state.sessionRecord) return

      try {
        await closeSession(db, state.sessionRecord.sessionId, reason)
        const summaryRec = await computeSummaryRecommendation()

        dispatch({
          type: 'SESSION_COMPLETED',
          summaryRecommendation: summaryRec,
        })
      } catch (err) {
        dispatch({
          type: 'SESSION_CLOSE_FAILED',
          error: err instanceof Error ? err.message : 'Fallo de persistencia al cerrar la sesión.',
        })
      }
    },
    [db, state.sessionRecord, computeSummaryRecommendation],
  )

  const submitResponse = useCallback(
    async (
      responseRaw: unknown,
      durationMs: number,
      options?: { mechanicalObservation?: MechanicalObservation; guidedStageId?: string },
    ) => {
      if (!state.sessionRecord || !state.sessionPlan || !state.currentTurnAttemptId || !activePack) return

      const currentPlanItem = state.sessionPlan.items[state.currentPlanIndex]
      if (!currentPlanItem) return

      const result = await submitAttempt({
        db,
        attemptId: state.currentTurnAttemptId,
        sessionId: state.sessionRecord.sessionId,
        item: currentPlanItem.item,
        packId: activePack.packId,
        packVersion: activePack.packVersion,
        responseRaw,
        evaluationOptions: {
          hintsUsedCount: state.hintsUsedCount,
          ...(options?.mechanicalObservation ? { mechanicalObservation: options.mechanicalObservation } : {}),
          ...(options?.guidedStageId ? { guidedStageId: options.guidedStageId } : {}),
        },
        durationMs,
      })

      dispatch({
        type: 'ATTEMPT_SUBMITTED',
        attempt: result.attempt,
        isCompleted: result.isSessionCompleted,
        guidedProgress: result.guidedProgress ?? null,
      })
    },
    [db, activePack, state.sessionRecord, state.sessionPlan, state.currentPlanIndex, state.currentTurnAttemptId, state.hintsUsedCount],
  )

  const advanceNextItem = useCallback(async () => {
    if (!state.sessionPlan || !state.sessionRecord || !activePack) return

    const currentItem = state.sessionPlan.items[state.currentPlanIndex]?.item

    if (currentItem?.kind === 'guided_practice') {
      const key = `${state.sessionRecord.packId}:${state.sessionRecord.packVersion}:${currentItem.itemId}`
      const dbProgress = await db.guidedProgress.get(key)
      const effectiveProgress = dbProgress ?? state.guidedProgressRecord

      const activeStageResult = deriveActiveGuidedStage(currentItem, effectiveProgress)

      if (!activeStageResult.isCompleted) {
        dispatch({ type: 'CONTINUE_CURRENT_ITEM', guidedProgress: effectiveProgress ?? null })
        return
      }
    }

    const nextIndex = state.currentPlanIndex + 1
    if (nextIndex >= state.sessionPlan.items.length) {
      await finishSession('items_completed')
    } else {
      dispatch({ type: 'ADVANCE_TO_NEXT_ITEM' })
    }
  }, [db, activePack, state.sessionPlan, state.sessionRecord, state.currentPlanIndex, state.guidedProgressRecord, finishSession])

  const advanceExpositoryStage = useCallback(
    async (stageId: string) => {
      if (!state.sessionRecord || !state.sessionPlan || !activePack) return
      const currentItem = state.sessionPlan.items[state.currentPlanIndex]?.item
      if (!currentItem || currentItem.kind !== 'guided_practice') return

      const res = await advanceExpositoryGuidedStage({
        db,
        sessionId: state.sessionRecord.sessionId,
        item: currentItem,
        packId: activePack.packId,
        packVersion: activePack.packVersion,
        stageId,
      })

      dispatch({
        type: 'EXPOSITORY_STAGE_ADVANCED',
        guidedProgress: res.guidedProgress,
      })
    },
    [db, activePack, state.sessionRecord, state.sessionPlan, state.currentPlanIndex],
  )

  const exitSession = useCallback(
    async (saveAsAbandoned = true) => {
      if (saveAsAbandoned && state.sessionRecord && state.sessionRecord.status === 'active') {
        try {
          await closeSession(db, state.sessionRecord.sessionId, 'user_exited')
        } catch {
          // Si falla, el usuario aun puede salir de la UI
        }
      }
      dispatch({ type: 'EXIT_SESSION' })
    },
    [db, state.sessionRecord],
  )

  return {
    state,
    startRecommendedSession,
    startConfiguring,
    initSession,
    useHint,
    submitResponse,
    advanceExpositoryStage,
    advanceNextItem,
    finishSession,
    exitSession,
  }
}
