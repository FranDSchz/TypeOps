import { describe, it, expect } from 'vitest'
import { evaluateExactQuestion } from './exactEvaluator'
import type { ExactQuestionItem } from '../content/types'

describe('exactEvaluator — Four Formats (Subhito 5A)', () => {
  const baseItem: ExactQuestionItem = {
    itemId: 'exact-test',
    kind: 'exact_question',
    mode: 'review',
    unitIds: ['unit-1'],
    title: 'Pregunta exacta de prueba',
    context: 'Contexto de prueba',
    task: 'Tarea de prueba',
    responseFormat: 'varios',
    maxResponse: { lines: 1 },
    estimatedSeconds: 30,
    categories: ['test'],
    skills: [],
    difficulty: 1,
    prerequisiteUnitIds: [],
    hints: [],
    explanation: 'Explicación',
    categoryVisibility: 'visible',
    securityContext: { scope: 'safe_inert', targets: ['localhost'], executionAllowed: false },
    mechanicalSequences: [],
    sourceNotes: [],
    enabled: true,
    answerType: 'single_choice',
    options: [
      { optionId: 'opt-1', text: 'Opción 1' },
      { optionId: 'opt-2', text: 'Opción 2' },
    ],
    acceptedAnswers: ['opt-1'],
    caseSensitive: false,
  }

  it('evalúa single_choice correcta e incorrectamente', () => {
    const resCorrect = evaluateExactQuestion(baseItem, 'opt-1')
    expect(resCorrect.status).toBe('correct')

    const resIncorrect = evaluateExactQuestion(baseItem, 'opt-2')
    expect(resIncorrect.status).toBe('incorrect')
    expect(resIncorrect.errorCodes).toContain('answer_mismatch')
  })

  it('evalúa multiple_choice independientemente del orden de las respuestas seleccionadas', () => {
    const multiItem: ExactQuestionItem = {
      ...baseItem,
      answerType: 'multiple_choice',
      acceptedAnswers: ['opt-1', 'opt-2'],
    }

    const resOrder1 = evaluateExactQuestion(multiItem, ['opt-1', 'opt-2'])
    expect(resOrder1.status).toBe('correct')

    const resOrder2 = evaluateExactQuestion(multiItem, ['opt-2', 'opt-1'])
    expect(resOrder2.status).toBe('correct')

    const resMissing = evaluateExactQuestion(multiItem, ['opt-1'])
    expect(resMissing.status).toBe('incorrect')

    const resExtra = evaluateExactQuestion(multiItem, ['opt-1', 'opt-2', 'opt-3'])
    expect(resExtra.status).toBe('incorrect')
  })

  it('evalúa short_exact respetando caseSensitive', () => {
    const shortItemInsensitive: ExactQuestionItem = {
      ...baseItem,
      answerType: 'short_exact',
      acceptedAnswers: ['chmod +x'],
      caseSensitive: false,
    }
    expect(evaluateExactQuestion(shortItemInsensitive, 'CHMOD +X').status).toBe('correct')

    const shortItemSensitive: ExactQuestionItem = {
      ...baseItem,
      answerType: 'short_exact',
      acceptedAnswers: ['chmod +x'],
      caseSensitive: true,
    }
    expect(evaluateExactQuestion(shortItemSensitive, 'CHMOD +X').status).toBe('incorrect')
    expect(evaluateExactQuestion(shortItemSensitive, 'chmod +x').status).toBe('correct')
  })

  it('evalúa ordered_steps de forma estrictamente dependiente del orden', () => {
    const orderedItem: ExactQuestionItem = {
      ...baseItem,
      answerType: 'ordered_steps',
      acceptedAnswers: ['step-1', 'step-2', 'step-3'],
    }

    const resCorrect = evaluateExactQuestion(orderedItem, ['step-1', 'step-2', 'step-3'])
    expect(resCorrect.status).toBe('correct')

    const resWrongOrder = evaluateExactQuestion(orderedItem, ['step-2', 'step-1', 'step-3'])
    expect(resWrongOrder.status).toBe('incorrect')
    expect(resWrongOrder.errorCodes).toContain('answer_mismatch')
  })
})
