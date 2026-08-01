import { describe, it, expect } from 'vitest'
import { evaluateContentItem } from './index'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type {
  TypingCopyItem,
  CommandIntentionItem,
  ExactQuestionItem,
  OpenQuestionItem,
  DecisionItem,
  GuidedPracticeItem,
} from '../content/types'

describe('Domain Evaluation Engine (Hito 3)', () => {
  const items = officialPack.items

  const typingItem = items.find((i) => i.kind === 'typing_copy') as TypingCopyItem
  const commandItem = items.find((i) => i.kind === 'command_intention') as CommandIntentionItem
  const exactItem = items.find((i) => i.kind === 'exact_question') as ExactQuestionItem
  const openItem = items.find((i) => i.kind === 'open_question') as OpenQuestionItem
  const decisionItem = items.find((i) => i.kind === 'decision') as DecisionItem
  const guidedItem = items.find((i) => i.kind === 'guided_practice') as GuidedPracticeItem

  it('evalúa typing_copy determinísticamente y calcula diff sin métricas mecánicas inferidas cuando no hay eventos', () => {
    const res = evaluateContentItem(typingItem, 'ls -la /var/log')
    expect(res.status).toBe('correct')
    expect(res.dimensionResults.syntax).toBe('correct')
    expect(res.dimensionResults.mechanical).toBe('not_assessed')
    expect(res.errorCodes).toHaveLength(0)

    // 'ls -la /var/loX' tiene 14/15 caracteres coincidentes por posición (93% precisión >= 80%) -> status 'partial'
    const resMismatch = evaluateContentItem(typingItem, 'ls -la /var/loX')
    expect(resMismatch.status).toBe('partial')
    expect(resMismatch.errorCodes).toContain('answer_mismatch')
  })

  it('evalúa command_intention con coincidencia exacta de alternativa declarada', () => {
    const res = evaluateContentItem(commandItem, 'tail -n 20 /var/log/auth.log')
    expect(res.status).toBe('correct')
    expect(res.matchedAlternativeId).toBe('alt-tail-1')
    expect(res.requiresReview).toBe(false)
  })

  it('evalúa command_intention con alternativa no declarada plausible y retorna status needs_review', () => {
    const res = evaluateContentItem(commandItem, 'tail -n 20 /var/log/auth.log --verbose')
    expect(res.status).toBe('needs_review')
    expect(res.requiresReview).toBe(true)
    expect(res.errorCodes).toContain('unrecognized_valid_alternative')
  })

  it('evalúa command_intention con error de herramienta y retorna status incorrect', () => {
    const res = evaluateContentItem(commandItem, 'grep -n 20 /var/log/auth.log')
    expect(res.status).toBe('incorrect')
    expect(res.errorCodes).toContain('tool_mismatch')
  })

  it('evalúa exact_question correctamente', () => {
    const res = evaluateContentItem(exactItem, 'opt-1')
    expect(res.status).toBe('correct')
    expect(res.errorCodes).toHaveLength(0)

    const resBad = evaluateContentItem(exactItem, 'opt-2')
    expect(resBad.status).toBe('incorrect')
    expect(resBad.errorCodes).toContain('answer_mismatch')
  })

  it('evalúa open_question retornando siempre status needs_review y la referencia rubricId', () => {
    const res = evaluateContentItem(openItem, 'Inspeccionaría /var/log/auth.log para identificar la IP origen')
    expect(res.status).toBe('needs_review')
    expect(res.requiresReview).toBe(true)
    expect(res.rubricId).toBe('rub-open-incident')
  })

  it('evalúa decision respetando elecciones y evidencia requerida', () => {
    const resCorrect = evaluateContentItem(decisionItem, {
      selectedChoiceIds: ['ch-1'],
      selectedEvidenceIds: ['ev-1'],
    })
    expect(resCorrect.status).toBe('correct')

    const resPartial = evaluateContentItem(decisionItem, {
      selectedChoiceIds: ['ch-1'],
      selectedEvidenceIds: [],
    })
    expect(resPartial.status).toBe('partial')
    expect(resPartial.errorCodes).toContain('verification_missing')
  })

  it('evalúa etapas de guided_practice determinísticamente', () => {
    const resStage1 = evaluateContentItem(guidedItem, { stageId: 'stg-1' })
    expect(resStage1.status).toBe('correct')

    const resStage4Empty = evaluateContentItem(guidedItem, { stageId: 'stg-4', responseRaw: '' })
    expect(resStage4Empty.status).toBe('incorrect')
  })
})
