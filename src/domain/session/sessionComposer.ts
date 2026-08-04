import type { ContentItem, ContentPack, ContentItemMode } from '../content/types'
import type { LearningProgress } from '../learning/learningState'
import type { UnitEligibilityMap } from '../learning/unitEligibility'
import { checkItemPrerequisites } from '../learning/unitEligibility'
import { recommendNextItem, type RecommendationOptions } from '../recommendation/recommendationEngine'

export interface SessionComposeOptions {
  pack: ContentPack
  mode: ContentItemMode
  targetDurationSeconds?: number
  targetCount?: number
  userFocusCategory?: string
  progressMap?: Record<string, LearningProgress>
  unitEligibilityMap?: UnitEligibilityMap
  recentItemIds?: string[]
  targetItemId?: string
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

export interface UnitBlockInfo {
  unitId: string
  unitTitle: string
  requirementType: 'own_unit' | 'prerequisite_unit'
  satisfactionStatus: 'guided_incomplete' | 'guided_missing_in_pack' | 'prior_knowledge_unmarked'
  guidedItemId?: string | undefined
  guidedItemTitle?: string | undefined
}

export type SessionCompositionResult =
  | {
      status: 'success'
      sessionPlan: SessionPlan
    }
  | {
      status: 'missing_learning_evidence'
      mode: ContentItemMode
      blockedUnits: UnitBlockInfo[]
      targetGuidedItemId?: string | undefined
    }
  | {
      status: 'guided_path_unavailable'
      mode: ContentItemMode
      blockedUnits: UnitBlockInfo[]
    }
  | {
      status: 'invalid_content_relationship'
      mode: ContentItemMode
      errorDetails: string
    }
  | {
      status: 'no_content_for_category'
      mode: ContentItemMode
      category: string
    }
  | {
      status: 'no_eligible_items'
      mode: ContentItemMode
      reason: string
    }

/**
 * Compositor puro de micro sesiones por presupuesto de tiempo o cantidad de ítems.
 */
export function composeSession(options: SessionComposeOptions): SessionCompositionResult {
  const {
    pack,
    mode,
    targetDurationSeconds,
    targetCount,
    userFocusCategory,
    progressMap = {},
    unitEligibilityMap,
    targetItemId,
  } = options

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
    const remainingBudget =
      targetDurationSeconds !== undefined ? Math.max(0, targetDurationSeconds - accumulatedSeconds) : undefined

    if (targetDurationSeconds !== undefined && accumulatedSeconds >= targetDurationSeconds && sessionItems.length > 0) {
      break
    }

    const recOptions: RecommendationOptions = {
      pack,
      mode,
      recentItemIds: sessionRecentItemIds,
      progressMap,
    }
    if (unitEligibilityMap !== undefined) recOptions.unitEligibilityMap = unitEligibilityMap
    if (userFocusCategory !== undefined) recOptions.userFocusCategory = userFocusCategory
    if (remainingBudget !== undefined) recOptions.remainingSecondsBudget = remainingBudget
    if (targetItemId !== undefined && sessionItems.length === 0) recOptions.targetItemId = targetItemId

    const rec = recommendNextItem(recOptions)

    if (!rec) {
      break
    }

    sessionItems.push({
      item: rec.item,
      reasonCode: rec.reasonCode,
      reasonDescription: rec.reasonDescription,
    })

    accumulatedSeconds += rec.item.estimatedSeconds
    sessionRecentItemIds.push(rec.item.itemId)

    // Si se solicitó un targetItemId específico, la sesión consta solo de ese ítem
    if (targetItemId !== undefined) {
      break
    }
  }

  if (sessionItems.length > 0) {
    const plan: SessionPlan = {
      items: sessionItems,
      estimatedTotalDurationSeconds: accumulatedSeconds,
      presetName,
    }
    if (targetDurationSeconds !== undefined) plan.targetDurationSeconds = targetDurationSeconds
    if (targetCount !== undefined) plan.targetCount = targetCount

    return {
      status: 'success',
      sessionPlan: plan,
    }
  }

  // Si no se pudieron agregar ítems, derivar la causa estructurada exacta
  const modeItems = pack.items.filter((i) => i.enabled && i.mode === mode)
  if (modeItems.length === 0) {
    return {
      status: 'no_eligible_items',
      mode,
      reason: `No hay ítems habilitados en el pack para el modo '${mode}'.`,
    }
  }

  const categoryItems = userFocusCategory
    ? modeItems.filter((i) => i.categories.includes(userFocusCategory))
    : modeItems

  if (userFocusCategory && categoryItems.length === 0) {
    return {
      status: 'no_content_for_category',
      mode,
      category: userFocusCategory,
    }
  }

  // Analizar bloqueos por prerrequisito
  const blockedUnitsMap = new Map<string, UnitBlockInfo>()

  for (const item of categoryItems) {
    if (unitEligibilityMap) {
      const check = checkItemPrerequisites(item, pack, unitEligibilityMap)
      for (const b of check.blockedUnits) {
        if (!blockedUnitsMap.has(b.unitId)) {
          const unit = pack.units.find((u) => u.unitId === b.unitId)
          const guidedItem = b.guidedItemId ? pack.items.find((i) => i.itemId === b.guidedItemId) : undefined

          blockedUnitsMap.set(b.unitId, {
            unitId: b.unitId,
            unitTitle: unit?.title ?? b.unitId,
            requirementType: b.requirementType,
            satisfactionStatus: b.satisfactionStatus,
            guidedItemId: b.guidedItemId,
            guidedItemTitle: guidedItem?.title,
          })
        }
      }
    }
  }

  const blockedUnits = Array.from(blockedUnitsMap.values())

  if (blockedUnits.length > 0) {
    const hasUnavailablePath = blockedUnits.some((b) => b.satisfactionStatus === 'guided_missing_in_pack')
    const firstGuidedItem = blockedUnits.find((b) => b.guidedItemId !== undefined)?.guidedItemId

    if (hasUnavailablePath && !firstGuidedItem) {
      return {
        status: 'guided_path_unavailable',
        mode,
        blockedUnits,
      }
    }

    return {
      status: 'missing_learning_evidence',
      mode,
      blockedUnits,
      targetGuidedItemId: firstGuidedItem,
    }
  }

  return {
    status: 'no_eligible_items',
    mode,
    reason: `La configuración seleccionada no produjo actividades elegibles.`,
  }
}
