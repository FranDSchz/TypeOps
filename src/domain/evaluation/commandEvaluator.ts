import type { CommandIntentionItem, CommandNormalizationOption } from '../content/types'
import type { EvaluationResult, DimensionResults, EvaluationErrorCode } from './types'

/**
 * Aplica normalización conservadora según las opciones declaradas por el ítem.
 */
export function normalizeCommand(text: string, options: CommandNormalizationOption[]): string {
  let result = text.replace(/\r\n/g, '\n')

  if (options.includes('trim_outer')) {
    result = result.trim()
  }

  if (options.includes('spaces_outside_quotes')) {
    // Normalizar espacios múltiples fuera de comillas simples o dobles
    result = result.replace(/\s+/g, ' ')
  }

  return result
}

/**
 * Evalúa determinísticamente un ítem de comando desde intención (command_intention).
 * Aplica reglas estrictas de coincidencia y fallback a 'needs_review'.
 */
export function evaluateCommandIntention(
  item: CommandIntentionItem,
  responseRaw: string,
): EvaluationResult {
  const normalizedResponse = normalizeCommand(responseRaw, item.answerSpec.normalization)
  const errorCodes: EvaluationErrorCode[] = []

  // 1. Coincidencia directa con alternativas declaradas (Coincidencia Válida Declarada -> 'correct')
  for (const alt of item.answerSpec.acceptedAlternatives) {
    const normalizedAlt = normalizeCommand(alt.text, item.answerSpec.normalization)
    if (normalizedResponse === normalizedAlt) {
      const dimensionResults: DimensionResults = {
        concept: 'correct',
        toolSelection: 'correct',
        semanticStructure: 'correct',
        syntax: 'correct',
        interpretation: 'not_assessed',
        verification: 'not_assessed',
        mechanical: 'not_assessed',
      }

      return {
        status: 'correct',
        dimensionResults,
        matchedAlternativeId: alt.alternativeId,
        errorCodes: [],
        feedbackCode: 'COMMAND_MATCH_ACCEPTED',
        feedbackMessage: alt.explanation,
        requiresReview: false,
      }
    }
  }

  // 2. Comprobación de Violaciones Explícitas
  let isForbiddenViolated = false
  let isToolViolated = false
  let isRequiredViolated = false
  let isSyntaxViolated = false

  // Comprobar fragmentos prohibidos
  for (const forbidden of item.answerSpec.forbiddenFragments) {
    if (normalizedResponse.includes(forbidden)) {
      isForbiddenViolated = true;
      errorCodes.push(forbidden.includes('rm') || forbidden.includes('drop') ? 'unsafe_action' : 'forbidden_component')
      break
    }
  }

  // Comprobar reglas de herramienta (toolChecks)
  for (const toolCheck of item.answerSpec.toolChecks) {
    try {
      const regex = new RegExp(toolCheck.pattern)
      if (!regex.test(normalizedResponse)) {
        isToolViolated = true
        errorCodes.push('tool_mismatch')
        break
      }
    } catch {
      // Ignorar regex inválidas si las hubiera
    }
  }

  // Comprobar fragmentos obligatorios (requiredFragments)
  for (const req of item.answerSpec.requiredFragments) {
    if (!normalizedResponse.includes(req)) {
      isRequiredViolated = true
      errorCodes.push('missing_required_component')
    }
  }

  // Comprobar reglas sintácticas declaradas (syntaxChecks)
  for (const syntaxCheck of item.answerSpec.syntaxChecks) {
    try {
      const regex = new RegExp(syntaxCheck.pattern)
      if (!regex.test(normalizedResponse)) {
        isSyntaxViolated = true
        errorCodes.push('syntax_mismatch')
        break
      }
    } catch {
      // Ignorar regex inválidas
    }
  }

  const hasExplicitViolation = isForbiddenViolated || isToolViolated || isRequiredViolated || isSyntaxViolated

  // Si existe una violación explícita -> 'incorrect' o 'partial'
  if (hasExplicitViolation) {
    const toolStatus = isToolViolated ? 'incorrect' : 'correct'
    const structStatus = isRequiredViolated || isForbiddenViolated ? 'incorrect' : 'correct'
    const syntaxStatus = isSyntaxViolated ? 'incorrect' : 'correct'

    // Si la herramienta es correcta pero faltó un fragmento o hubo error sintáctico -> status 'partial'
    const status = !isToolViolated && (isRequiredViolated || isSyntaxViolated) ? 'partial' : 'incorrect'

    const dimensionResults: DimensionResults = {
      concept: toolStatus === 'correct' ? 'partial' : 'incorrect',
      toolSelection: toolStatus,
      semanticStructure: structStatus,
      syntax: syntaxStatus,
      interpretation: 'not_assessed',
      verification: 'not_assessed',
      mechanical: 'not_assessed',
    }

    return {
      status,
      dimensionResults,
      errorCodes: Array.from(new Set(errorCodes)),
      feedbackCode: isToolViolated ? 'COMMAND_TOOL_INCORRECT' : 'COMMAND_STRUCTURE_INCORRECT',
      feedbackMessage: isToolViolated
        ? 'Herramienta principal incorrecta o ausente.'
        : 'Sintaxis o fragmento requerido no coincide con las especificaciones.',
      requiresReview: false,
    }
  }

  // 3. Fallback: No reconocida sin violación demostrable -> 'needs_review'
  const dimensionResults: DimensionResults = {
    concept: 'needs_review',
    toolSelection: 'needs_review',
    semanticStructure: 'needs_review',
    syntax: 'needs_review',
    interpretation: 'not_assessed',
    verification: 'not_assessed',
    mechanical: 'not_assessed',
  }

  return {
    status: 'needs_review',
    dimensionResults,
    errorCodes: ['unrecognized_valid_alternative'],
    feedbackCode: 'COMMAND_UNRECOGNIZED_PLAUSIBLE',
    feedbackMessage: 'La respuesta no coincide exactamente con las alternativas declaradas pero tampoco viola reglas explícitas. Guardada para revisión.',
    requiresReview: true,
  }
}
