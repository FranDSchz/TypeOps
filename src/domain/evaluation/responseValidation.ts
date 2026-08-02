import type { ContentItem } from '../content/types'
import { getStageCapabilities } from './guidedEvaluator'

export type ResponseValidationErrorCode =
  | 'empty_response'
  | 'missing_choice'
  | 'missing_evidence'
  | 'empty_stage_response'

export interface ResponseValidationResult {
  isValid: boolean
  errorCode?: ResponseValidationErrorCode
  errorMessage?: string
  targetElementId?: string
}

/**
 * Función pura y exhaustiva por item.kind que valida si existe una respuesta
 * válida/mínima según la estructura y capacidad real del ítem antes de evaluar o enviar.
 */
export function validateResponsePresent(
  item: ContentItem,
  responseRaw: unknown,
): ResponseValidationResult {
  switch (item.kind) {
    case 'typing_copy': {
      const text = typeof responseRaw === 'string' ? responseRaw : ''
      if (!text.trim()) {
        return {
          isValid: false,
          errorCode: 'empty_response',
          errorMessage: 'Debés ingresar el texto antes de enviar la respuesta.',
          targetElementId: 'typing-input',
        }
      }
      return { isValid: true }
    }

    case 'command_intention': {
      const text = typeof responseRaw === 'string' ? responseRaw : ''
      if (!text.trim()) {
        return {
          isValid: false,
          errorCode: 'empty_response',
          errorMessage: 'Debés escribir un comando antes de enviar.',
          targetElementId: 'command-input',
        }
      }
      return { isValid: true }
    }

    case 'open_question': {
      const text = typeof responseRaw === 'string' ? responseRaw : ''
      if (!text.trim()) {
        return {
          isValid: false,
          errorCode: 'empty_response',
          errorMessage: 'Debés escribir una explicación antes de enviar.',
          targetElementId: 'open-textarea',
        }
      }
      return { isValid: true }
    }

    case 'exact_question': {
      const optionId = typeof responseRaw === 'string' ? responseRaw : ''
      if (!optionId.trim()) {
        return {
          isValid: false,
          errorCode: 'missing_choice',
          errorMessage: 'Debés seleccionar una opción antes de enviar.',
          targetElementId: 'exact-options-group',
        }
      }
      return { isValid: true }
    }

    case 'decision': {
      let selectedChoiceIds: string[] = []
      let selectedEvidenceIds: string[] = []

      if (typeof responseRaw === 'object' && responseRaw !== null) {
        const obj = responseRaw as { selectedChoiceIds?: string[]; selectedEvidenceIds?: string[] }
        if (Array.isArray(obj.selectedChoiceIds)) {
          selectedChoiceIds = obj.selectedChoiceIds.filter(Boolean)
        }
        if (Array.isArray(obj.selectedEvidenceIds)) {
          selectedEvidenceIds = obj.selectedEvidenceIds.filter(Boolean)
        }
      }

      if (selectedChoiceIds.length === 0) {
        return {
          isValid: false,
          errorCode: 'missing_choice',
          errorMessage: 'Debés seleccionar una decisión antes de enviar.',
          targetElementId: 'decision-choices-group',
        }
      }

      if (item.requiredEvidenceIds.length > 0 && selectedEvidenceIds.length === 0) {
        return {
          isValid: false,
          errorCode: 'missing_evidence',
          errorMessage: 'Debés seleccionar al menos una evidencia requerida.',
          targetElementId: 'decision-evidence-group',
        }
      }

      return { isValid: true }
    }

    case 'guided_practice': {
      let stageText = ''
      if (typeof responseRaw === 'object' && responseRaw !== null) {
        const obj = responseRaw as { responseRaw?: unknown }
        if (typeof obj.responseRaw === 'string') {
          stageText = obj.responseRaw
        }
      } else if (typeof responseRaw === 'string') {
        stageText = responseRaw
      }

      const evaluableStage = item.stages.find((s) => getStageCapabilities(s.stageType).requiresAttempt)
      if (evaluableStage && !stageText.trim()) {
        return {
          isValid: false,
          errorCode: 'empty_stage_response',
          errorMessage: 'Esta etapa requiere una respuesta para avanzar. Si no querés responder, usá "Omitir ejercicio".',
          targetElementId: 'guided-input',
        }
      }

      return { isValid: true }
    }

    default:
      return { isValid: true }
  }
}
