import type { OpenQuestionItem } from '../content/types'
import type { EvaluationResult, DimensionResults } from './types'

/**
 * Evalúa un ítem de pregunta abierta (open_question).
 * Retorna siempre 'needs_review', preserva la respuesta y adjunta únicamente rubricId.
 */
export function evaluateOpenQuestion(
  item: OpenQuestionItem,
): EvaluationResult {
  const dimensionResults: DimensionResults = {
    concept: 'needs_review',
    toolSelection: 'not_assessed',
    semanticStructure: 'needs_review',
    syntax: 'not_assessed',
    interpretation: 'needs_review',
    verification: 'needs_review',
    mechanical: 'not_assessed',
  }

  return {
    status: 'needs_review',
    dimensionResults,
    errorCodes: [],
    rubricId: item.rubric.rubricId,
    feedbackCode: 'OPEN_QUESTION_PENDING_REVIEW',
    feedbackMessage: 'Respuesta abierta guardada. Queda pendiente para revisión externa o autoevaluación.',
    requiresReview: true,
  }
}
