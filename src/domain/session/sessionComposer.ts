import type { ContentItem, ContentPack, ContentItemMode } from '../content/types'
import type { LearningProgress } from '../learning/learningState'
import { recommendNextItem, type RecommendationOptions } from '../recommendation/recommendationEngine'

export interface SessionComposeOptions {
  pack: ContentPack
  mode: ContentItemMode
  targetDurationSeconds?: number
  targetCount?: number
  userFocusCategory?: string
  progressMap?: Record<string, LearningProgress>
  recentItemIds?: string[]
}

export interface SessionPlanItem {
  item: ContentItem
  reasonCode: string
  reasonDescription: string
}

export interface SessionPlan {
  items: SessionPlanItem[]
  estimatedTotalDurationSeconds: number
  targetDurationSeconds?: number
  targetCount?: number
  presetName: string
}

/**
 * Compositor puro de micro sesiones por presupuesto de tiempo o cantidad de ítems.
 */
export function composeSession(options: SessionComposeOptions): SessionPlan {
  const { pack, mode, targetDurationSeconds, targetCount, userFocusCategory, progressMap = {} } = options

  const sessionItems: SessionPlanItem[] = []
  let accumulatedSeconds = 0
  const sessionRecentItemIds = [...(options.recentItemIds ?? [])]

  let presetName = 'custom'
  if (targetDurationSeconds === 120) presetName = '2_minutes'
  else if (targetDurationSeconds === 300) presetName = '5_minutes'
  else if (targetDurationSeconds === 600) presetName = '10_minutes'
  else if (targetCount !== undefined) presetName = `count_${String(targetCount)}`

  const maxItemsLimit = targetCount ?? 15

  while (sessionItems.length < maxItemsLimit) {
    const remainingBudget = targetDurationSeconds !== undefined ? Math.max(0, targetDurationSeconds - accumulatedSeconds) : undefined

    if (targetDurationSeconds !== undefined && accumulatedSeconds >= targetDurationSeconds && sessionItems.length > 0) {
      break
    }

    const recOptions: RecommendationOptions = {
      pack,
      mode,
      recentItemIds: sessionRecentItemIds,
      progressMap,
    }
    if (userFocusCategory !== undefined) recOptions.userFocusCategory = userFocusCategory
    if (remainingBudget !== undefined) recOptions.remainingSecondsBudget = remainingBudget

    const rec = recommendNextItem(recOptions)

    if (!rec) {
      if (sessionItems.length === 0 && targetDurationSeconds !== undefined) {
        const fallbackOptions: RecommendationOptions = {
          pack,
          mode,
          recentItemIds: sessionRecentItemIds,
          progressMap,
        }
        if (userFocusCategory !== undefined) fallbackOptions.userFocusCategory = userFocusCategory

        const fallbackRec = recommendNextItem(fallbackOptions)
        if (fallbackRec) {
          sessionItems.push({
            item: fallbackRec.item,
            reasonCode: fallbackRec.reasonCode,
            reasonDescription: fallbackRec.reasonDescription,
          })
          accumulatedSeconds += fallbackRec.item.estimatedSeconds
        }
      }
      break
    }

    sessionItems.push({
      item: rec.item,
      reasonCode: rec.reasonCode,
      reasonDescription: rec.reasonDescription,
    })

    accumulatedSeconds += rec.item.estimatedSeconds
    sessionRecentItemIds.push(rec.item.itemId)
  }

  const plan: SessionPlan = {
    items: sessionItems,
    estimatedTotalDurationSeconds: accumulatedSeconds,
    presetName,
  }

  if (targetDurationSeconds !== undefined) plan.targetDurationSeconds = targetDurationSeconds
  if (targetCount !== undefined) plan.targetCount = targetCount

  return plan
}
