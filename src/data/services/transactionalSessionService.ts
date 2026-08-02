import type { TypeOpsDatabase } from '../db/database'
import type { ContentItem } from '../../domain/content/types'
import type { EvaluationResult, EvaluationOptions } from '../../domain/evaluation/types'
import type { AttemptRecord, SessionCompletionReason, WorkflowStatus, LearningProgressRecord } from '../db/records'
import { evaluateContentItem } from '../../domain/evaluation'
import { computeNextLearningState, type ComputeLearningStateOptions, type LearningProgress } from '../../domain/learning/learningState'

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

    // 2. Comprobar si es un intento de omisión (Omitir)
    const isSkipped =
      typeof responseRaw === 'object' && responseRaw !== null && Boolean((responseRaw as { isSkipped?: boolean }).isSkipped)

    let evaluationResult: EvaluationResult
    let workflowStatus: WorkflowStatus

    if (isSkipped) {
      workflowStatus = 'skipped'
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
        feedbackMessage: 'El ejercicio fue omitido por el usuario.',
        requiresReview: false,
      }
    } else {
      evaluationResult = evaluateContentItem(item, responseRaw, evaluationOptions)

      if (item.kind === 'typing_copy') {
        evaluationResult.dimensionResults.mechanical = 'not_assessed'
      }

      if (item.kind === 'open_question') {
        workflowStatus = 'pending_review'
      } else if (item.kind === 'guided_practice') {
        const evaluableStage = item.stages.find(
          (s) => s.stageType === 'guided_exercise' || s.stageType === 'unassisted_exercise',
        )
        let actualText = ''
        if (typeof responseRaw === 'object' && responseRaw !== null) {
          actualText = ((responseRaw as { responseRaw?: string }).responseRaw ?? '').trim()
        } else if (typeof responseRaw === 'string') {
          actualText = responseRaw.trim()
        }

        let expectedCommand: string | undefined = undefined
        if (evaluableStage?.content.startsWith('Escribí ')) {
          expectedCommand = evaluableStage.content.replace(/^Escribí\s+/, '').trim()
        }

        if (!actualText) {
          evaluationResult = {
            status: 'incorrect',
            dimensionResults: {
              concept: 'incorrect',
              toolSelection: 'not_assessed',
              semanticStructure: 'not_assessed',
              syntax: 'incorrect',
              interpretation: 'not_assessed',
              verification: 'not_assessed',
              mechanical: 'not_assessed',
            },
            errorCodes: ['missing_required_component'],
            feedbackCode: 'GUIDED_STAGE_RESPONSE_EMPTY',
            feedbackMessage: 'La etapa requiere una respuesta para avanzar.',
            requiresReview: false,
          }
          workflowStatus = 'failed'
        } else if (expectedCommand && actualText.toLowerCase() !== expectedCommand.toLowerCase()) {
          evaluationResult = {
            status: 'incorrect',
            dimensionResults: {
              concept: 'incorrect',
              toolSelection: 'not_assessed',
              semanticStructure: 'not_assessed',
              syntax: 'incorrect',
              interpretation: 'not_assessed',
              verification: 'not_assessed',
              mechanical: 'not_assessed',
            },
            errorCodes: ['syntax_mismatch'],
            feedbackCode: 'GUIDED_STAGE_EXERCISE_FAILED',
            feedbackMessage: `El comando ingresado no coincide con el ejercicio guiado ('${expectedCommand}').`,
            requiresReview: false,
          }
          workflowStatus = 'failed'
        } else {
          workflowStatus = evaluationResult.status === 'incorrect' ? 'failed' : 'guided_step_recorded'
        }
      } else {
        workflowStatus = 'evaluated'
      }
    }

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

    if (isSkipped) {
      // Omitir no modifica el progreso de aprendizaje
    } else if (item.kind === 'guided_practice') {
      // Si la respuesta fue vacía/incorrecta, no actualiza el progreso
      if (evaluationResult.status !== 'incorrect') {
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
      }
    } else {
      // Para otros tipos (command_intention, typing_copy, exact_question, decision)
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

    // 5. Actualizar avance de la sesión (currentIndex)
    const sessionRecord = await db.sessions.get(sessionId)
    let isSessionCompleted = false

    // Si es una respuesta vacía/fallida en guided_practice (no es omitir ni respuesta no vacía), NO avanzar la sesión
    const shouldAdvanceIndex = !(!isSkipped && item.kind === 'guided_practice' && evaluationResult.status === 'incorrect')

    if (sessionRecord && shouldAdvanceIndex) {
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
