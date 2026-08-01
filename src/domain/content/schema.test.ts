import { describe, it, expect } from 'vitest'
import {
  TypingCopyItemSchema,
  SecurityContextSchema,
} from './schema'

describe('Domain Content Schemas — Zod', () => {
  it('valida un TypingCopyItem válido', () => {
    const validTyping = {
      itemId: 't1',
      kind: 'typing_copy',
      mode: 'typing',
      unitIds: ['u1'],
      title: 'Título',
      context: 'Contexto',
      task: 'Tarea',
      responseFormat: 'Formato',
      maxResponse: { characters: 100 },
      estimatedSeconds: 30,
      categories: ['test'],
      skills: [],
      difficulty: 1,
      prerequisiteUnitIds: [],
      hints: [],
      explanation: 'Explicación',
      categoryVisibility: 'visible',
      securityContext: {
        scope: 'safe_inert',
        targets: ['localhost'],
        executionAllowed: false,
      },
      mechanicalSequences: [],
      sourceNotes: [],
      enabled: true,
      targetText: 'echo hello',
      language: 'bash',
      display: 'single_line',
      whitespacePolicy: 'exact',
      fingerGuideEligible: true,
      technicalValidationNote: 'Nota',
    }

    const res = TypingCopyItemSchema.safeParse(validTyping)
    expect(res.success).toBe(true)
  })

  it('rechaza executionAllowed = true en SecurityContext', () => {
    const invalidSecurity = {
      scope: 'safe_inert',
      targets: ['localhost'],
      executionAllowed: true,
    }

    const res = SecurityContextSchema.safeParse(invalidSecurity)
    expect(res.success).toBe(false)
  })

  it('rechaza estimatedSeconds fuera del rango 15-600', () => {
    const invalidItem = {
      itemId: 't1',
      kind: 'typing_copy',
      mode: 'typing',
      unitIds: ['u1'],
      title: 'Título',
      context: 'Contexto',
      task: 'Tarea',
      responseFormat: 'Formato',
      maxResponse: { characters: 100 },
      estimatedSeconds: 5,
      categories: [],
      skills: [],
      difficulty: 1,
      prerequisiteUnitIds: [],
      hints: [],
      explanation: 'Explicación',
      categoryVisibility: 'visible',
      securityContext: {
        scope: 'safe_inert',
        targets: ['localhost'],
        executionAllowed: false,
      },
      mechanicalSequences: [],
      sourceNotes: [],
      enabled: true,
      targetText: 'echo hello',
      language: 'bash',
      display: 'single_line',
      whitespacePolicy: 'exact',
      fingerGuideEligible: true,
      technicalValidationNote: 'Nota',
    }

    const res = TypingCopyItemSchema.safeParse(invalidItem)
    expect(res.success).toBe(false)
  })

  it('rechaza campos inesperados por modo estricto (.strict())', () => {
    const itemWithExtra = {
      itemId: 't1',
      kind: 'typing_copy',
      mode: 'typing',
      unitIds: ['u1'],
      title: 'Título',
      context: 'Contexto',
      task: 'Tarea',
      responseFormat: 'Formato',
      maxResponse: { characters: 100 },
      estimatedSeconds: 30,
      categories: [],
      skills: [],
      difficulty: 1,
      prerequisiteUnitIds: [],
      hints: [],
      explanation: 'Explicación',
      categoryVisibility: 'visible',
      securityContext: {
        scope: 'safe_inert',
        targets: ['localhost'],
        executionAllowed: false,
      },
      mechanicalSequences: [],
      sourceNotes: [],
      enabled: true,
      targetText: 'echo hello',
      language: 'bash',
      display: 'single_line',
      whitespacePolicy: 'exact',
      fingerGuideEligible: true,
      technicalValidationNote: 'Nota',
      extraUnauthorizedProperty: 999,
    }

    const res = TypingCopyItemSchema.safeParse(itemWithExtra)
    expect(res.success).toBe(false)
  })
})
