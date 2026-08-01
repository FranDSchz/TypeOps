import type { ContentItem, ContentPack, ContentItemMode } from '../content/types'
import type { LearningProgress } from '../learning/learningState'
import type { MechanicalProfile } from '../mechanical/mechanicalProfile'

export type RecommendationReasonCode =
  | 'resume_guided'
  | 'new_needs_guidance'
  | 'review_due'
  | 'high_confidence_mismatch'
  | 'concept_repair'
  | 'tool_repair'
  | 'interpretation_repair'
  | 'verification_repair'
  | 'syntax_rebuild'
  | 'mechanical_sequence'
  | 'hinted_variant'
  | 'variety_exploration'
  | 'user_focus'

export interface RecommendationResult {
  item: ContentItem
  reasonCode: RecommendationReasonCode
  reasonDescription: string
  priorityRank: number
}

export interface RecommendationOptions {
  pack: ContentPack
  mode: ContentItemMode
  userFocusCategory?: string
  remainingSecondsBudget?: number
  recentItemIds?: string[]
  progressMap?: Record<string, LearningProgress>
  mechanicalProfile?: MechanicalProfile
}

/**
 * Motor determinista de recomendaciones por reglas basadas en TYPEOPS_V1_ADAPTATION_RULES.md.
 */
export function recommendNextItem(
  options: RecommendationOptions,
): RecommendationResult | null {
  const { pack, mode, userFocusCategory, remainingSecondsBudget, recentItemIds = [], progressMap = {} } = options

  let eligibleItems = pack.items.filter((item) => {
    if (!item.enabled) return false
    if (item.mode !== mode) return false

    if (remainingSecondsBudget !== undefined && item.estimatedSeconds > remainingSecondsBudget + 30) {
      return false
    }

    if (recentItemIds.slice(-3).includes(item.itemId)) {
      return false
    }

    return true
  })

  if (userFocusCategory) {
    const focusFiltered = eligibleItems.filter((i) => i.categories.includes(userFocusCategory))
    if (focusFiltered.length > 0) {
      eligibleItems = focusFiltered
    }
  }

  if (eligibleItems.length === 0) {
    eligibleItems = pack.items.filter((item) => item.enabled && item.mode === mode)
  }

  if (eligibleItems.length === 0) return null

  for (const item of eligibleItems) {
    if (item.kind === 'guided_practice') {
      const unitProg = item.unitIds[0] ? progressMap[item.unitIds[0]] : undefined
      if (unitProg?.state === 'learning') {
        return {
          item,
          reasonCode: 'resume_guided',
          reasonDescription: 'Continuar la práctica guiada en curso para esta unidad.',
          priorityRank: 1,
        }
      }
    }
  }

  for (const item of eligibleItems) {
    if (item.kind === 'guided_practice') {
      const unitProg = item.unitIds[0] ? progressMap[item.unitIds[0]] : undefined
      if (!unitProg || unitProg.state === 'new') {
        return {
          item,
          reasonCode: 'new_needs_guidance',
          reasonDescription: 'Aprender un concepto nuevo con la guía del modelo base.',
          priorityRank: 2,
        }
      }
    }
  }

  for (const item of eligibleItems) {
    for (const unitId of item.unitIds) {
      const prog = progressMap[unitId]
      if (prog?.state === 'review_due') {
        return {
          item,
          reasonCode: 'review_due',
          reasonDescription: 'Repasar concepto con vencimiento alcanzado.',
          priorityRank: 3,
        }
      }
    }
  }

  for (const item of eligibleItems) {
    for (const unitId of item.unitIds) {
      const prog = progressMap[unitId]
      if (prog?.lastReasonCode === 'CONCEPTUAL_REPAIR_NEEDED') {
        return {
          item,
          reasonCode: 'concept_repair',
          reasonDescription: 'Reforzar el modelo conceptual tras un error reciente.',
          priorityRank: 5,
        }
      }
    }
  }

  for (const item of eligibleItems) {
    for (const unitId of item.unitIds) {
      const prog = progressMap[unitId]
      if (prog?.lastReasonCode === 'SYNTAX_REPAIR_NEEDED') {
        return {
          item,
          reasonCode: 'syntax_rebuild',
          reasonDescription: 'Practicar la estructura y sintaxis técnica del comando.',
          priorityRank: 7,
        }
      }
    }
  }

  const defaultItem = eligibleItems[0]
  if (!defaultItem) return null

  return {
    item: defaultItem,
    reasonCode: userFocusCategory ? 'user_focus' : 'variety_exploration',
    reasonDescription: userFocusCategory
      ? `Práctica seleccionada por foco en la categoría '${userFocusCategory}'.`
      : 'Variedad de práctica en el modo seleccionado.',
    priorityRank: 10,
  }
}
