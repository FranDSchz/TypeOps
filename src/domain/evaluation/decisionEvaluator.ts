import type { DecisionItem } from '../content/types'
import type { EvaluationResult, DimensionResults, EvaluationErrorCode } from './types'

export interface DecisionResponseInput {
  selectedChoiceIds: string[]
  selectedEvidenceIds?: string[]
}

/**
 * Evalúa determinísticamente un ítem de decisión operacional (decision).
 */
export function evaluateDecision(
  item: DecisionItem,
  response: DecisionResponseInput,
): EvaluationResult {
  const selectedChoices = new Set(response.selectedChoiceIds)
  const correctChoices = new Set(item.correctChoiceIds)
  const selectedEvidence = new Set(response.selectedEvidenceIds ?? [])

  const errorCodes: EvaluationErrorCode[] = []

  // 1. Evaluar coincidencia de elecciones
  const allCorrectSelected = item.correctChoiceIds.every((id) => selectedChoices.has(id))
  const noIncorrectSelected = response.selectedChoiceIds.every((id) => correctChoices.has(id))
  const choicesCorrect = allCorrectSelected && noIncorrectSelected

  // 2. Evaluar evidencia requerida
  const allRequiredEvidenceSelected = item.requiredEvidenceIds.every((id) => selectedEvidence.has(id))

  if (!allRequiredEvidenceSelected && item.requiredEvidenceIds.length > 0) {
    errorCodes.push('verification_missing')
  }

  let status: 'correct' | 'partial' | 'incorrect' = 'incorrect'

  if (choicesCorrect && allRequiredEvidenceSelected) {
    status = 'correct'
  } else if (choicesCorrect && !allRequiredEvidenceSelected) {
    status = 'partial'
  } else {
    status = 'incorrect'
    errorCodes.push('answer_mismatch')
  }

  const dimensionResults: DimensionResults = {
    concept: choicesCorrect ? 'correct' : 'incorrect',
    toolSelection: 'not_assessed',
    semanticStructure: 'not_assessed',
    syntax: 'not_assessed',
    interpretation: choicesCorrect ? 'correct' : 'incorrect',
    verification: allRequiredEvidenceSelected ? 'correct' : 'incorrect',
    mechanical: 'not_assessed',
  }

  const evalResult: EvaluationResult = {
    status,
    dimensionResults,
    errorCodes: Array.from(new Set(errorCodes)),
    feedbackCode: status === 'correct' ? 'DECISION_CORRECT' : status === 'partial' ? 'DECISION_PARTIAL_EVIDENCE_MISSING' : 'DECISION_INCORRECT',
    feedbackMessage: status === 'correct'
      ? 'Decisión correcta respaldada por la evidencia esperada.'
      : status === 'partial'
      ? 'La elección de decisión es adecuada, pero falta seleccionar la evidencia requerida.'
      : 'La decisión no coincide con las opciones esperadas.',
    requiresReview: false,
  }

  if (item.rubric?.rubricId) {
    evalResult.rubricId = item.rubric.rubricId
  }

  return evalResult
}
