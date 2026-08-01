import type { GuidedPracticeItem, GuidedStageType } from '../content/types'
import type { EvaluationResult } from './types'

export interface StageCapabilities {
  teaches: boolean
  requiresAttempt: boolean
  usesEvaluator: boolean
  advancementCriterion: string
}

/**
 * Mapea las capacidades pedagógicas de cada tipo de etapa en práctica guiada.
 */
export function getStageCapabilities(stageType: GuidedStageType): StageCapabilities {
  switch (stageType) {
    case 'model':
      return { teaches: true, requiresAttempt: false, usesEvaluator: false, advancementCriterion: 'Apertura y lectura del modelo' }
    case 'syntax_breakdown':
      return { teaches: true, requiresAttempt: false, usesEvaluator: false, advancementCriterion: 'Revisión de sintaxis' }
    case 'contextual_example':
      return { teaches: true, requiresAttempt: false, usesEvaluator: false, advancementCriterion: 'Lectura del ejemplo' }
    case 'guided_exercise':
      return { teaches: false, requiresAttempt: true, usesEvaluator: true, advancementCriterion: 'Resolución del ejercicio con ayuda disponible' }
    case 'unassisted_exercise':
      return { teaches: false, requiresAttempt: true, usesEvaluator: true, advancementCriterion: 'Resolución independiente sin ayuda' }
    case 'later_variant':
      return { teaches: false, requiresAttempt: false, usesEvaluator: false, advancementCriterion: 'Programación para variante posterior' }
  }
}

export interface GuidedStageEvaluationInput {
  stageId: string
  responseRaw?: string
}

/**
 * Evalúa el intento o avance en una etapa de práctica guiada.
 */
export function evaluateGuidedStage(
  item: GuidedPracticeItem,
  input: GuidedStageEvaluationInput,
): EvaluationResult & { stageCapabilities: StageCapabilities } {
  const stage = item.stages.find((s) => s.stageId === input.stageId)
  if (!stage) {
    const emptyCapabilities = getStageCapabilities('model')
    return {
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
      errorCodes: ['answer_mismatch'],
      feedbackCode: 'GUIDED_STAGE_NOT_FOUND',
      feedbackMessage: `La etapa '${input.stageId}' no existe en el ítem guiado '${item.itemId}'.`,
      requiresReview: false,
      stageCapabilities: emptyCapabilities,
    }
  }

  const capabilities = getStageCapabilities(stage.stageType)

  if (!capabilities.requiresAttempt) {
    return {
      status: 'correct',
      dimensionResults: {
        concept: 'correct',
        toolSelection: 'not_assessed',
        semanticStructure: 'not_assessed',
        syntax: 'correct',
        interpretation: 'not_assessed',
        verification: 'not_assessed',
        mechanical: 'not_assessed',
      },
      errorCodes: [],
      feedbackCode: 'GUIDED_STAGE_READ_COMPLETE',
      feedbackMessage: `Etapa '${stage.title}' completada.`,
      requiresReview: false,
      stageCapabilities: capabilities,
    }
  }

  if (!input.responseRaw || !input.responseRaw.trim()) {
    return {
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
      errorCodes: ['answer_mismatch'],
      feedbackCode: 'GUIDED_STAGE_RESPONSE_EMPTY',
      feedbackMessage: `La etapa '${stage.title}' requiere una respuesta para avanzar.`,
      requiresReview: false,
      stageCapabilities: capabilities,
    }
  }

  const status = 'correct'
  return {
    status,
    dimensionResults: {
      concept: 'correct',
      toolSelection: 'not_assessed',
      semanticStructure: 'not_assessed',
      syntax: 'correct',
      interpretation: 'not_assessed',
      verification: 'not_assessed',
      mechanical: 'not_assessed',
    },
    errorCodes: [],
    feedbackCode: 'GUIDED_STAGE_EXERCISE_PASSED',
    feedbackMessage: `Ejercicio de la etapa '${stage.title}' resuelto correctamente.`,
    requiresReview: false,
    stageCapabilities: capabilities,
  }
}
