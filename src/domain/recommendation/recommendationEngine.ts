import type { ContentItem, ContentPack, ContentItemMode } from '../content/types'
import type { LearningProgress } from '../learning/learningState'
import type { MechanicalProfile } from '../mechanical/mechanicalProfile'
import type { UnitEligibilityMap } from '../learning/unitEligibility'
import { checkItemPrerequisites } from '../learning/unitEligibility'

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
  unitEligibilityMap?: UnitEligibilityMap
  mechanicalProfile?: MechanicalProfile
  targetItemId?: string
}

/**
 * Motor determinista de recomendaciones por reglas basadas en TYPEOPS_V1_ADAPTATION_RULES.md.
 */
export function recommendNextItem(
  options: RecommendationOptions,
): RecommendationResult | null {
  const {
    pack,
    mode,
    userFocusCategory,
    remainingSecondsBudget,
    recentItemIds = [],
    progressMap = {},
    unitEligibilityMap,
    targetItemId,
  } = options

  // 1. RESTRICCIONES DURAS (INFRANQUEABLES)
  const hardEligibleItems = pack.items.filter((item) => {
    if (!item.enabled) return false
    if (item.mode !== mode) return false

    if (targetItemId !== undefined && item.itemId !== targetItemId) {
      return false
    }

    if (unitEligibilityMap) {
      const prereqCheck = checkItemPrerequisites(item, pack, unitEligibilityMap)
      if (!prereqCheck.isEligible) {
        return false
      }
    }

    return true
  })

  if (hardEligibleItems.length === 0) return null

  // Si se especificó targetItemId y pasó las restricciones duras, es el único candidato
  if (targetItemId !== undefined) {
    const targetItem = hardEligibleItems[0]
    if (!targetItem) return null
    return {
      item: targetItem,
      reasonCode: mode === 'guided' ? 'resume_guided' : 'user_focus',
      reasonDescription: `Actividad seleccionada explícitamente: '${targetItem.title}'.`,
      priorityRank: 1,
    }
  }

  // 2. RELAJACIÓN ORDENADA DE PREFERENCIAS (Nivel 0: Todas las preferencias aplicadas)
  let candidates = hardEligibleItems.filter((item) => {
    if (remainingSecondsBudget !== undefined && item.estimatedSeconds > remainingSecondsBudget + 30) {
      return false
    }
    if (recentItemIds.slice(-3).includes(item.itemId)) {
      return false
    }
    if (userFocusCategory && !item.categories.includes(userFocusCategory)) {
      return false
    }
    return true
  })

  // Nivel 1 de relajación: Omitir foco por categoría si no hay candidatos
  if (candidates.length === 0 && userFocusCategory) {
    candidates = hardEligibleItems.filter((item) => {
      if (remainingSecondsBudget !== undefined && item.estimatedSeconds > remainingSecondsBudget + 30) {
        return false
      }
      if (recentItemIds.slice(-3).includes(item.itemId)) {
        return false
      }
      return true
    })
  }

  // Nivel 2 de relajación: Omitir exclusión de ítems recientes
  if (candidates.length === 0 && recentItemIds.length > 0) {
    candidates = hardEligibleItems.filter((item) => {
      if (remainingSecondsBudget !== undefined && item.estimatedSeconds > remainingSecondsBudget + 30) {
        return false
      }
      return true
    })
  }

  // Nivel 3 de relajación: Omitir presupuesto de tiempo restante
  if (candidates.length === 0) {
    candidates = hardEligibleItems
  }

  if (candidates.length === 0) return null

  for (const item of candidates) {
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

  for (const item of candidates) {
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

  for (const item of candidates) {
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

  for (const item of candidates) {
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

  for (const item of candidates) {
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

  const defaultItem = candidates[0]
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
