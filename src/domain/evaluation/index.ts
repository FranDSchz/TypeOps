import type { ContentItem } from '../content/types'
import type { EvaluationResult, EvaluationOptions } from './types'
import { evaluateTypingCopy } from './typingEvaluator'
import { evaluateCommandIntention } from './commandEvaluator'
import { evaluateExactQuestion } from './exactEvaluator'
import { evaluateOpenQuestion } from './openEvaluator'
import { evaluateDecision, type DecisionResponseInput } from './decisionEvaluator'
import { evaluateGuidedStage, type GuidedStageEvaluationInput } from './guidedEvaluator'

export * from './types'
export { evaluateTypingCopy } from './typingEvaluator'
export { evaluateCommandIntention } from './commandEvaluator'
export { evaluateExactQuestion } from './exactEvaluator'
export { evaluateOpenQuestion } from './openEvaluator'
export { evaluateDecision } from './decisionEvaluator'
export { evaluateGuidedStage, getStageCapabilities } from './guidedEvaluator'

/**
 * Función principal pura para evaluar cualquier ContentItem determinísticamente.
 */
export function evaluateContentItem(
  item: ContentItem,
  responseRaw: unknown,
  options?: EvaluationOptions,
): EvaluationResult {
  switch (item.kind) {
    case 'typing_copy':
      return evaluateTypingCopy(item, typeof responseRaw === 'string' ? responseRaw : '', options)

    case 'command_intention':
      return evaluateCommandIntention(item, typeof responseRaw === 'string' ? responseRaw : '')

    case 'exact_question':
      if (typeof responseRaw === 'string' || Array.isArray(responseRaw)) {
        return evaluateExactQuestion(item, responseRaw as string | string[])
      }
      return evaluateExactQuestion(item, '')

    case 'open_question':
      return evaluateOpenQuestion(item)

    case 'decision': {
      let decisionInput: DecisionResponseInput = { selectedChoiceIds: [] }
      if (typeof responseRaw === 'object' && responseRaw !== null) {
        const obj = responseRaw as Partial<DecisionResponseInput>
        decisionInput = {
          selectedChoiceIds: Array.isArray(obj.selectedChoiceIds) ? obj.selectedChoiceIds : [],
        }
        if (Array.isArray(obj.selectedEvidenceIds)) {
          decisionInput.selectedEvidenceIds = obj.selectedEvidenceIds
        }
      }
      return evaluateDecision(item, decisionInput)
    }

    case 'guided_practice': {
      let stageId = item.stages[0]?.stageId ?? 'stg-1'
      let stageResp: string | undefined
      if (typeof responseRaw === 'object' && responseRaw !== null) {
        const obj = responseRaw as { stageId?: string; responseRaw?: string }
        if (obj.stageId) stageId = obj.stageId
        stageResp = obj.responseRaw
      } else if (typeof responseRaw === 'string') {
        stageResp = responseRaw
      }

      const input: GuidedStageEvaluationInput = { stageId }
      if (stageResp !== undefined) {
        input.responseRaw = stageResp
      }
      return evaluateGuidedStage(item, input)
    }
  }
}
