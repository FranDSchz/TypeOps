import type { GuidedPracticeItem, GuidedStageType } from '../content/types'
import type { EvaluationResult } from './types'
import { normalizeCommand } from './commandEvaluator'

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
      feedbackCode: 'GUIDED_STAGE_READ_COMPLETE',
      feedbackMessage: `Etapa '${stage.title}' revisada.`,
      requiresReview: false,
      stageCapabilities: capabilities,
    }
  }

  if (!input.responseRaw || !input.responseRaw.trim()) {
    return {
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
      errorCodes: ['missing_required_component'],
      feedbackCode: 'GUIDED_STAGE_RESPONSE_EMPTY',
      feedbackMessage: `La etapa '${stage.title}' requiere una respuesta para avanzar.`,
      requiresReview: false,
      stageCapabilities: capabilities,
    }
  }

  const spec = stage.expectedAction
  if (spec) {
    const normalizedInput = normalizeCommand(input.responseRaw, spec.normalization)
    const isMatched = spec.acceptedAlternatives.some(
      (alt) => normalizeCommand(alt, spec.normalization) === normalizedInput,
    )

    if (isMatched) {
      return {
        status: 'correct',
        dimensionResults: {
          concept: 'correct',
          toolSelection: 'correct',
          semanticStructure: 'correct',
          syntax: 'correct',
          interpretation: 'not_assessed',
          verification: 'not_assessed',
          mechanical: 'not_assessed',
        },
        errorCodes: [],
        feedbackCode: 'GUIDED_STAGE_CORRECT',
        feedbackMessage: `Respuesta correcta en la etapa '${stage.title}'.`,
        requiresReview: false,
        stageCapabilities: capabilities,
      }
    }
  }

  return {
    status: 'needs_review',
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
    feedbackCode: 'GUIDED_STAGE_NEEDS_REVIEW',
    feedbackMessage: `Respuesta registrada para '${stage.title}'. Pendiente de revisión.`,
    requiresReview: true,
    stageCapabilities: capabilities,
  }
}
