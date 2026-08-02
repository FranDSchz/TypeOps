import type { GuidedPracticeItem, GuidedStage } from '../content/types'
import type { LearningProgressRecord } from '../../data/db/records'

export interface GuidedItemProgressRecord {
  progressKey: string
  packId: string
  packVersion: string
  itemId: string
  completedStageIds: string[]
  updatedAt: string
}

export type GuidedLearningEvent =
  | 'exposure_completed'
  | 'assisted_success'
  | 'assisted_completed_without_success'
  | 'independent_success'
  | 'independent_non_success'
  | 'stage_skipped'
  | 'needs_review'

export interface ActiveGuidedStageResult {
  activeStage: GuidedStage | null
  activeStageIndex: number
  immediateStagesCount: number
  isCompleted: boolean
  normalizedCompletedStageIds: string[]
}

/**
 * Normaliza las etapas completadas reteniendo únicamente etapas inmediatas válidas
 * y en el orden editorial definido en item.stages.
 */
export function normalizeCompletedGuidedStages(
  item: GuidedPracticeItem,
  completedStageIds: string[] | undefined,
): string[] {
  if (!completedStageIds || completedStageIds.length === 0) return []

  const immediateStageIds = new Set(
    item.stages
      .filter((s) => s.stageType !== 'later_variant')
      .map((s) => s.stageId),
  )

  const rawSet = new Set(completedStageIds.filter((id) => immediateStageIds.has(id)))

  // Devolver únicamente en el orden exacto de item.stages
  return item.stages
    .filter((s) => s.stageType !== 'later_variant' && rawSet.has(s.stageId))
    .map((s) => s.stageId)
}

/**
 * Deriva la etapa activa determinando la primera etapa inmediata incompleta.
 */
export function deriveActiveGuidedStage(
  item: GuidedPracticeItem,
  progress?: GuidedItemProgressRecord | null,
): ActiveGuidedStageResult {
  const immediateStages = item.stages.filter((s) => s.stageType !== 'later_variant')
  const immediateStagesCount = immediateStages.length
  const normalizedCompletedStageIds = normalizeCompletedGuidedStages(
    item,
    progress?.completedStageIds,
  )

  const completedSet = new Set(normalizedCompletedStageIds)

  const firstIncompleteIdx = immediateStages.findIndex((s) => !completedSet.has(s.stageId))

  if (firstIncompleteIdx === -1) {
    return {
      activeStage: null,
      activeStageIndex: immediateStagesCount,
      immediateStagesCount,
      isCompleted: true,
      normalizedCompletedStageIds,
    }
  }

  return {
    activeStage: immediateStages[firstIncompleteIdx] ?? null,
    activeStageIndex: firstIncompleteIdx,
    immediateStagesCount,
    isCompleted: false,
    normalizedCompletedStageIds,
  }
}

/**
 * Calcula la transición de estado conceptual pura para práctica guiada.
 */
export function computeNextGuidedLearningState(
  currentRecord: LearningProgressRecord | undefined,
  packId: string,
  unitId: string,
  event: GuidedLearningEvent,
  nowIso: string,
  itemId?: string,
): LearningProgressRecord {
  const compositeUnitKey = `${packId}:${unitId}`
  const existingPracticed = currentRecord?.practicedItemIds ?? []
  const updatedPracticedItemIds = itemId
    ? Array.from(new Set([...existingPracticed, itemId]))
    : existingPracticed

  const currentCount = currentRecord?.independentSuccessesCount ?? 0
  let nextState = currentRecord?.state ?? 'new'
  let nextCount = currentCount
  let reasonCode = currentRecord?.lastReasonCode ?? 'INITIAL_LEARNING_OPENED'

  switch (event) {
    case 'exposure_completed':
      if (nextState === 'new') {
        nextState = 'learning'
        reasonCode = 'INITIAL_LEARNING_OPENED'
      }
      break

    case 'assisted_success':
      if (nextState === 'new' || nextState === 'learning') {
        nextState = 'practicing'
        reasonCode = 'GUIDED_STAGE_COMPLETED'
      }
      break

    case 'assisted_completed_without_success':
      if (nextState === 'new') {
        nextState = 'learning'
        reasonCode = 'GUIDED_STAGE_COMPLETED'
      }
      break

    case 'independent_success':
      if (nextState === 'new' || nextState === 'learning') {
        nextState = 'practicing'
      }
      nextCount = Math.max(currentCount, 1)
      reasonCode = 'INDEPENDENT_SUCCESS_PRACTICING'
      break

    case 'independent_non_success':
      if (nextState === 'new') {
        nextState = 'learning'
      }
      reasonCode = 'GUIDED_STAGE_ATTEMPTED'
      break

    case 'stage_skipped':
      if (nextState === 'new') {
        nextState = 'learning'
      }
      reasonCode = 'GUIDED_STAGE_SKIPPED'
      break

    case 'needs_review':
      if (nextState === 'new') {
        nextState = 'learning'
      }
      reasonCode = 'GUIDED_STAGE_NEEDS_REVIEW'
      break
  }

  const result: LearningProgressRecord = {
    compositeUnitKey,
    packId,
    unitId,
    state: nextState,
    independentSuccessesCount: nextCount,
    practicedItemIds: updatedPracticedItemIds,
    lastPracticedAt: nowIso,
    lastReasonCode: reasonCode,
    updatedAt: nowIso,
  }

  if (currentRecord?.nextReviewAt !== undefined) {
    result.nextReviewAt = currentRecord.nextReviewAt
  }

  return result
}
