import type { EvaluationResult } from '../evaluation/types'

export type LearningState =
  | 'new'
  | 'learning'
  | 'practicing'
  | 'ready_for_assessment'
  | 'review_due'

export interface IntervalPolicy {
  firstIndependentDays: number
  secondIndependentDays: number
  review1Days: number
  review2Days: number
}

export const DEFAULT_INTERVAL_POLICY: IntervalPolicy = {
  firstIndependentDays: 1,
  secondIndependentDays: 3,
  review1Days: 7,
  review2Days: 14,
}

export interface LearningProgress {
  unitId: string
  state: LearningState
  independentSuccessesCount: number
  practicedItemIds: string[]
  lastPracticedAt?: string
  nextReviewAt?: string
  lastReasonCode?: string
}

export interface ComputeLearningStateOptions {
  currentProgress?: LearningProgress
  itemId: string
  unitId: string
  evaluationResult: EvaluationResult
  hintsUsedCount?: number
  hasEligibleVariantInPack?: boolean
  isVariantItem?: boolean
  currentTime?: Date
  intervalPolicy?: IntervalPolicy
}

/**
 * Transición pura de la máquina de estados de aprendizaje.
 */
export function computeNextLearningState(
  options: ComputeLearningStateOptions,
): LearningProgress {
  const policy = options.intervalPolicy ?? DEFAULT_INTERVAL_POLICY
  const now = options.currentTime ?? new Date()
  const nowIso = now.toISOString()
  const hintsUsed = options.hintsUsedCount ?? 0

  const current: LearningProgress = options.currentProgress ?? {
    unitId: options.unitId,
    state: 'new',
    independentSuccessesCount: 0,
    practicedItemIds: [],
  }

  const practicedItemIds = Array.from(new Set([...current.practicedItemIds, options.itemId]))

  // 1. Transición desde 'new' -> 'learning' al iniciar la unidad
  if (current.state === 'new') {
    return {
      unitId: options.unitId,
      state: 'learning',
      independentSuccessesCount: 0,
      practicedItemIds,
      lastPracticedAt: nowIso,
      lastReasonCode: 'INITIAL_LEARNING_OPENED',
    }
  }

  const isUnassistedSuccess = options.evaluationResult.status === 'correct' && hintsUsed === 0
  const isIncorrect = options.evaluationResult.status === 'incorrect'
  const isConceptualError = isIncorrect && options.evaluationResult.errorCodes.some((c) => c === 'answer_mismatch' || c === 'tool_mismatch')

  let nextState: LearningState = current.state
  let independentSuccessesCount = current.independentSuccessesCount
  let nextReviewAt = current.nextReviewAt
  let lastReasonCode = 'PRACTICE_ATTEMPT'

  if (isUnassistedSuccess) {
    independentSuccessesCount++

    const requiresVariant = options.hasEligibleVariantInPack ?? false
    const variantSatisfied = !requiresVariant || Boolean(options.isVariantItem)

    if (independentSuccessesCount >= 2 && variantSatisfied) {
      nextState = 'ready_for_assessment'
      nextReviewAt = addDays(now, policy.secondIndependentDays).toISOString()
      lastReasonCode = 'READY_FOR_ASSESSMENT_ACHIEVED'
    } else {
      nextState = 'practicing'
      nextReviewAt = addDays(now, policy.firstIndependentDays).toISOString()
      lastReasonCode = 'INDEPENDENT_SUCCESS_PRACTICING'
    }
  } else if (isConceptualError) {
    nextState = 'learning'
    independentSuccessesCount = 0
    lastReasonCode = 'CONCEPTUAL_REPAIR_NEEDED'
  } else if (isIncorrect) {
    nextState = 'practicing'
    lastReasonCode = 'SYNTAX_REPAIR_NEEDED'
  }

  if (nextState === 'ready_for_assessment' && nextReviewAt) {
    if (new Date(nextReviewAt) <= now) {
      nextState = 'review_due'
      lastReasonCode = 'REVIEW_DUE_TRIGGERED'
    }
  }

  const result: LearningProgress = {
    unitId: options.unitId,
    state: nextState,
    independentSuccessesCount,
    practicedItemIds,
    lastPracticedAt: nowIso,
    lastReasonCode,
  }

  if (nextReviewAt !== undefined) {
    result.nextReviewAt = nextReviewAt
  }

  return result
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
