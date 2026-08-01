import type { TypingCopyItem } from '../content/types'
import type { EvaluationResult, EvaluationOptions, DimensionResults, EvaluationErrorCode } from './types'

export interface TypingDiffMetrics {
  totalTargetChars: number
  totalResponseChars: number
  correctChars: number
  substitutions: number
  omissions: number
  insertions: number
  accuracyPercentage: number
  initialErrorCount?: number
  correctionCount?: number
  hasMechanicalEvents: boolean
}

/**
 * Normaliza el texto de acuerdo a la política de espacios del ítem.
 */
function normalizeTypingText(text: string, whitespacePolicy: 'exact' | 'normalize_line_endings'): string {
  if (whitespacePolicy === 'normalize_line_endings') {
    return text.replace(/\r\n/g, '\n').trim()
  }
  return text
}

/**
 * Evalúa determinísticamente un ítem de copia técnica (typing_copy).
 */
export function evaluateTypingCopy(
  item: TypingCopyItem,
  responseRaw: string,
  options?: EvaluationOptions,
): EvaluationResult & { diffMetrics: TypingDiffMetrics } {
  const target = normalizeTypingText(item.targetText, item.whitespacePolicy)
  const response = normalizeTypingText(responseRaw, item.whitespacePolicy)

  let correctChars = 0
  let substitutions = 0
  const minLen = Math.min(target.length, response.length)

  for (let i = 0; i < minLen; i++) {
    if (target[i] === response[i]) {
      correctChars++
    } else {
      substitutions++
    }
  }

  const omissions = Math.max(0, target.length - response.length)
  const insertions = Math.max(0, response.length - target.length)
  const maxLength = Math.max(target.length, response.length)
  const accuracyPercentage = maxLength > 0 ? Math.round((correctChars / maxLength) * 100) : 100

  const isExactMatch = target === response
  const status = isExactMatch ? 'correct' : accuracyPercentage >= 80 ? 'partial' : 'incorrect'

  const errorCodes: EvaluationErrorCode[] = []
  if (!isExactMatch) {
    errorCodes.push('answer_mismatch')
  }

  let mechanicalStatus: 'correct' | 'partial' | 'incorrect' | 'not_assessed' = 'not_assessed'
  let initialErrorCount: number | undefined
  let correctionCount: number | undefined
  const hasMechanicalEvents = Boolean(options?.mechanicalEvents && options.mechanicalEvents.length > 0)

  if (hasMechanicalEvents && options?.mechanicalEvents) {
    const events = options.mechanicalEvents
    let initErrors = 0
    let corrections = 0

    events.forEach((ev) => {
      if (ev.type === 'keydown' && ev.key === 'Backspace') {
        corrections++
      }
      if (ev.producedChar && ev.targetChar && ev.producedChar !== ev.targetChar) {
        initErrors++
      }
    })

    initialErrorCount = initErrors
    correctionCount = corrections

    if (initialErrorCount > 0 || correctionCount > 0) {
      errorCodes.push('mechanical_friction')
      mechanicalStatus = 'partial'
    } else {
      mechanicalStatus = 'correct'
    }
  }

  const dimensionResults: DimensionResults = {
    concept: status,
    toolSelection: 'not_assessed',
    semanticStructure: 'not_assessed',
    syntax: status,
    interpretation: 'not_assessed',
    verification: 'not_assessed',
    mechanical: mechanicalStatus,
  }

  const diffMetrics: TypingDiffMetrics = {
    totalTargetChars: target.length,
    totalResponseChars: response.length,
    correctChars,
    substitutions,
    omissions,
    insertions,
    accuracyPercentage,
    hasMechanicalEvents,
  }

  if (initialErrorCount !== undefined) {
    diffMetrics.initialErrorCount = initialErrorCount
  }
  if (correctionCount !== undefined) {
    diffMetrics.correctionCount = correctionCount
  }

  const diffCountStr = String(substitutions + omissions + insertions)
  const accuracyStr = String(accuracyPercentage)

  return {
    status,
    dimensionResults,
    errorCodes,
    feedbackCode: isExactMatch ? 'TYPING_EXACT_MATCH' : 'TYPING_MISMATCH',
    feedbackMessage: isExactMatch
      ? 'Copia técnica exacta completada correctamente.'
      : `Precisión: ${accuracyStr}%. ${diffCountStr} diferencia(s) respecto al texto objetivo.`,
    requiresReview: false,
    diffMetrics,
  }
}
