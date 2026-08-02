import { describe, it, expect } from 'vitest'
import { computeNextLearningState, type LearningProgress } from './learningState'
import type { EvaluationResult } from '../evaluation/types'

describe('Learning State Machine (Hito 3)', () => {
  const correctEval: EvaluationResult = {
    status: 'correct',
    dimensionResults: {
      concept: 'correct',
      toolSelection: 'correct',
      semanticStructure: 'correct',
      syntax: 'correct',
      interpretation: 'not_assessed',
      verification: 'not_assessed',
      mechanical: 'not_assessed',
    },
    errorCodes: [],
    requiresReview: false,
  }

  const incorrectEval: EvaluationResult = {
    status: 'incorrect',
    dimensionResults: {
      concept: 'incorrect',
      toolSelection: 'incorrect',
      semanticStructure: 'incorrect',
      syntax: 'incorrect',
      interpretation: 'not_assessed',
      verification: 'not_assessed',
      mechanical: 'not_assessed',
    },
    errorCodes: ['tool_mismatch'],
    requiresReview: false,
  }

  const partialEval: EvaluationResult = {
    status: 'partial',
    dimensionResults: {
      concept: 'partial',
      toolSelection: 'correct',
      semanticStructure: 'incorrect',
      syntax: 'incorrect',
      interpretation: 'not_assessed',
      verification: 'not_assessed',
      mechanical: 'not_assessed',
    },
    errorCodes: ['syntax_mismatch'],
    requiresReview: false,
  }

  const needsReviewEval: EvaluationResult = {
    status: 'needs_review',
    dimensionResults: {
      concept: 'needs_review',
      toolSelection: 'needs_review',
      semanticStructure: 'needs_review',
      syntax: 'needs_review',
      interpretation: 'not_assessed',
      verification: 'not_assessed',
      mechanical: 'not_assessed',
    },
    errorCodes: ['unrecognized_valid_alternative'],
    requiresReview: true,
  }

  it.each([
    { statusName: 'correct', evalRes: correctEval },
    { statusName: 'incorrect', evalRes: incorrectEval },
    { statusName: 'partial', evalRes: partialEval },
    { statusName: 'needs_review', evalRes: needsReviewEval },
  ])('transita de new a learning con independentSuccessesCount: 0 para resultado $statusName (SA-01)', ({ evalRes }) => {
    const prog = computeNextLearningState({
      itemId: 'item-1',
      unitId: 'unit-linux-basics',
      evaluationResult: evalRes,
    })

    expect(prog.state).toBe('learning')
    expect(prog.independentSuccessesCount).toBe(0)
    expect(prog.lastReasonCode).toBe('INITIAL_LEARNING_OPENED')
  })

  it('avanza a ready_for_assessment al acumular dos éxitos independientes sin ayuda', () => {
    const p1: LearningProgress = {
      unitId: 'unit-linux-basics',
      state: 'practicing',
      independentSuccessesCount: 1,
      practicedItemIds: ['item-1'],
    }

    const p2 = computeNextLearningState({
      currentProgress: p1,
      itemId: 'item-2',
      unitId: 'unit-linux-basics',
      evaluationResult: correctEval,
      hintsUsedCount: 0,
    })

    expect(p2.state).toBe('ready_for_assessment')
    expect(p2.independentSuccessesCount).toBe(2)
  })

  it('retorna a learning ante un error conceptual grave', () => {
    const p1: LearningProgress = {
      unitId: 'unit-linux-basics',
      state: 'ready_for_assessment',
      independentSuccessesCount: 2,
      practicedItemIds: ['item-1', 'item-2'],
    }

    const p2 = computeNextLearningState({
      currentProgress: p1,
      itemId: 'item-1',
      unitId: 'unit-linux-basics',
      evaluationResult: incorrectEval,
    })

    expect(p2.state).toBe('learning')
    expect(p2.independentSuccessesCount).toBe(0)
  })
})
