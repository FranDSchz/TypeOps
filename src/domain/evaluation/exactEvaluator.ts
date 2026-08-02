import type { ExactQuestionItem } from '../content/types'
import type { EvaluationResult, DimensionResults, EvaluationErrorCode } from './types'

/**
 * Normaliza respuestas de preguntas exactas.
 */
function normalizeExact(text: string, caseSensitive: boolean): string {
  const trimmed = text.trim()
  return caseSensitive ? trimmed : trimmed.toLowerCase()
}

/**
 * Evalúa determinísticamente un ítem de pregunta exacta (exact_question).
 */
export function evaluateExactQuestion(
  item: ExactQuestionItem,
  responseRaw: string | string[],
): EvaluationResult {
  const errorCodes: EvaluationErrorCode[] = []
  let isCorrect = false

  if (item.answerType === 'single_choice' || item.answerType === 'short_exact') {
    const singleResponse = Array.isArray(responseRaw) ? responseRaw[0] ?? '' : responseRaw
    const normalized = normalizeExact(singleResponse, item.caseSensitive)

    isCorrect = item.acceptedAnswers.some(
      (ans) => normalizeExact(ans, item.caseSensitive) === normalized,
    )
  } else if (item.answerType === 'ordered_steps') {
    const responseArray = Array.isArray(responseRaw) ? responseRaw : [responseRaw]
    const normalizedResponses = responseArray.map((r) => normalizeExact(r, item.caseSensitive))
    const normalizedAccepted = item.acceptedAnswers.map((a) => normalizeExact(a, item.caseSensitive))

    isCorrect =
      normalizedResponses.length === normalizedAccepted.length &&
      normalizedResponses.every((val, idx) => val === normalizedAccepted[idx])
  } else {
    // multiple_choice (orden independiente)
    const responseArray = Array.isArray(responseRaw) ? responseRaw : [responseRaw]
    const normalizedResponses = responseArray.map((r) => normalizeExact(r, item.caseSensitive)).sort()
    const normalizedAccepted = item.acceptedAnswers.map((a) => normalizeExact(a, item.caseSensitive)).sort()

    isCorrect =
      normalizedResponses.length === normalizedAccepted.length &&
      normalizedResponses.every((val, idx) => val === normalizedAccepted[idx])
  }

  const status = isCorrect ? 'correct' : 'incorrect'
  if (!isCorrect) {
    errorCodes.push('answer_mismatch')
  }

  let feedbackMessage = isCorrect ? 'Respuesta correcta.' : 'Respuesta incorrecta.'
  if (!isCorrect && item.feedbackByOption && typeof responseRaw === 'string' && item.feedbackByOption[responseRaw]) {
    feedbackMessage = item.feedbackByOption[responseRaw]
  }

  const dimensionResults: DimensionResults = {
    concept: status,
    toolSelection: 'not_assessed',
    semanticStructure: 'not_assessed',
    syntax: status,
    interpretation: 'not_assessed',
    verification: 'not_assessed',
    mechanical: 'not_assessed',
  }

  return {
    status,
    dimensionResults,
    errorCodes,
    feedbackCode: isCorrect ? 'EXACT_MATCH_CORRECT' : 'EXACT_MATCH_INCORRECT',
    feedbackMessage,
    requiresReview: false,
  }
}
