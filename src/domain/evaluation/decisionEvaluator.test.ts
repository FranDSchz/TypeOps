import { describe, it, expect } from 'vitest'
import { evaluateDecision } from './decisionEvaluator'
import type { DecisionItem } from '../content/types'

describe('decisionEvaluator Edge Cases (Subhito 5A)', () => {
  const item: DecisionItem = {
    itemId: 'dec-test',
    kind: 'decision',
    mode: 'review',
    unitIds: ['unit-1'],
    title: 'Decisión de prueba',
    context: 'Contexto de prueba',
    task: 'Tarea de prueba',
    responseFormat: 'selección',
    maxResponse: { bullets: 2 },
    estimatedSeconds: 60,
    categories: ['test'],
    skills: [],
    difficulty: 2,
    prerequisiteUnitIds: [],
    hints: [],
    explanation: 'Explicación',
    categoryVisibility: 'visible',
    securityContext: { scope: 'safe_inert', targets: ['localhost'], executionAllowed: false },
    mechanicalSequences: [],
    sourceNotes: [],
    enabled: true,
    evidence: [
      { evidenceId: 'ev-req-1', text: 'Evidencia requerida 1' },
      { evidenceId: 'ev-req-2', text: 'Evidencia requerida 2' },
      { evidenceId: 'ev-irrelevant', text: 'Evidencia adicional irrelevante' },
    ],
    choices: [
      { choiceId: 'ch-correct', text: 'Opción correcta' },
      { choiceId: 'ch-wrong', text: 'Opción incorrecta' },
    ],
    correctChoiceIds: ['ch-correct'],
    requiredEvidenceIds: ['ev-req-1', 'ev-req-2'],
    conditionalBranches: [],
  }

  it('retorna status correct cuando opción y evidencia requerida coinciden', () => {
    const res = evaluateDecision(item, {
      selectedChoiceIds: ['ch-correct'],
      selectedEvidenceIds: ['ev-req-1', 'ev-req-2'],
    })
    expect(res.status).toBe('correct')
    expect(res.dimensionResults.concept).toBe('correct')
    expect(res.dimensionResults.verification).toBe('correct')
  })

  it('retorna status partial cuando la opción es correcta pero falta evidencia requerida', () => {
    const res = evaluateDecision(item, {
      selectedChoiceIds: ['ch-correct'],
      selectedEvidenceIds: ['ev-req-1'],
    })
    expect(res.status).toBe('partial')
    expect(res.dimensionResults.concept).toBe('correct')
    expect(res.dimensionResults.verification).toBe('incorrect')
    expect(res.errorCodes).toContain('verification_missing')
  })

  it('retorna status incorrect cuando la opción es incorrecta aunque la evidencia sea correcta', () => {
    const res = evaluateDecision(item, {
      selectedChoiceIds: ['ch-wrong'],
      selectedEvidenceIds: ['ev-req-1', 'ev-req-2'],
    })
    expect(res.status).toBe('incorrect')
    expect(res.dimensionResults.concept).toBe('incorrect')
    expect(res.dimensionResults.verification).toBe('correct')
  })

  it('tolera selección de evidencia adicional irrelevante si toda la evidencia requerida está presente', () => {
    const res = evaluateDecision(item, {
      selectedChoiceIds: ['ch-correct'],
      selectedEvidenceIds: ['ev-req-1', 'ev-req-2', 'ev-irrelevant'],
    })
    expect(res.status).toBe('correct')
    expect(res.dimensionResults.verification).toBe('correct')
  })
})
