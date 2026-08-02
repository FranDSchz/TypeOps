import { describe, it, expect } from 'vitest'
import type { GuidedPracticeItem } from '../content/types'
import {
  normalizeCompletedGuidedStages,
  deriveActiveGuidedStage,
  computeNextGuidedLearningState,
  type GuidedItemProgressRecord,
} from './guidedState'

const mockGuidedItem: GuidedPracticeItem = {
  itemId: 'guided-test',
  unitId: 'unit-test',
  kind: 'guided_practice',
  mode: 'guided',
  unitIds: ['unit-test'],
  title: 'Práctica Guiada Test',
  context: 'Contexto test',
  task: 'Completá las cinco etapas de la secuencia guiada.',
  responseFormat: 'pasos interactivos',
  maxResponse: { lines: 5 },
  estimatedSeconds: 120,
  categories: ['test'],
  skills: [{ skillId: 'test.skill', dimension: 'tool_selection' }],
  difficulty: 1,
  prerequisiteUnitIds: [],
  hints: [],
  explanation: 'Explicación test',
  categoryVisibility: 'visible',
  securityContext: {
    scope: 'safe_inert',
    targets: ['localhost'],
    executionAllowed: false,
  },
  mechanicalSequences: [],
  sourceNotes: [],
  enabled: true,
  stages: [
    { stageId: 'stg-1', stageType: 'model', title: 'Modelo', content: 'Contenido 1' },
    { stageId: 'stg-2', stageType: 'syntax_breakdown', title: 'Sintaxis', content: 'Contenido 2' },
    { stageId: 'stg-3', stageType: 'contextual_example', title: 'Ejemplo', content: 'Contenido 3' },
    {
      stageId: 'stg-4',
      stageType: 'guided_exercise',
      title: 'Ejercicio Guiado',
      content: 'Contenido 4',
      expectedAction: {
        kind: 'command',
        acceptedAlternatives: ['cmd 1'],
        normalization: ['trim_outer'],
        unrecognizedPolicy: 'needs_review',
      },
    },
    {
      stageId: 'stg-5',
      stageType: 'unassisted_exercise',
      title: 'Ejercicio Sin Ayuda',
      content: 'Contenido 5',
      expectedAction: {
        kind: 'command',
        acceptedAlternatives: ['cmd 2'],
        normalization: ['trim_outer'],
        unrecognizedPolicy: 'needs_review',
      },
    },
    { stageId: 'stg-6', stageType: 'later_variant', title: 'Variante', content: 'Contenido 6' },
  ],
  resumePolicy: 'next_incomplete_stage',
  promotionRule: 'complete_unassisted_and_later_variant',
  laterVariantItemId: 'cmd-test-variant',
}

describe('guidedState — Dominio Puro de Práctica Guiada', () => {
  describe('normalizeCompletedGuidedStages', () => {
    it('filtra duplicados, IDs inexistentes y excluye later_variant respetando el orden editorial', () => {
      const raw = ['stg-3', 'stg-99', 'stg-3', 'stg-6', 'stg-1']
      const normalized = normalizeCompletedGuidedStages(mockGuidedItem, raw)

      expect(normalized).toEqual(['stg-1', 'stg-3'])
    })
  })

  describe('deriveActiveGuidedStage', () => {
    it('retorna la primera etapa inmediata (stg-1) cuando no hay progreso registrado', () => {
      const result = deriveActiveGuidedStage(mockGuidedItem, null)

      expect(result.isCompleted).toBe(false)
      expect(result.activeStageIndex).toBe(0)
      expect(result.activeStage?.stageId).toBe('stg-1')
      expect(result.immediateStagesCount).toBe(5)
    })

    it('identifica la primera etapa incompleta ante huecos (stg-1 y stg-3 completadas -> activa stg-2)', () => {
      const progress: GuidedItemProgressRecord = {
        progressKey: 'pack-1:1.0.0:guided-test',
        packId: 'pack-1',
        packVersion: '1.0.0',
        itemId: 'guided-test',
        completedStageIds: ['stg-1', 'stg-3'],
        updatedAt: '2026-08-02T00:00:00Z',
      }

      const result = deriveActiveGuidedStage(mockGuidedItem, progress)

      expect(result.isCompleted).toBe(false)
      expect(result.activeStageIndex).toBe(1)
      expect(result.activeStage?.stageId).toBe('stg-2')
    })

    it('marca el ítem como completado cuando las 5 etapas inmediatas están completadas', () => {
      const progress: GuidedItemProgressRecord = {
        progressKey: 'pack-1:1.0.0:guided-test',
        packId: 'pack-1',
        packVersion: '1.0.0',
        itemId: 'guided-test',
        completedStageIds: ['stg-1', 'stg-2', 'stg-3', 'stg-4', 'stg-5'],
        updatedAt: '2026-08-02T00:00:00Z',
      }

      const result = deriveActiveGuidedStage(mockGuidedItem, progress)

      expect(result.isCompleted).toBe(true)
      expect(result.activeStage).toBeNull()
      expect(result.activeStageIndex).toBe(5)
    })

    it('normaliza correctamente progreso importado con IDs inexistentes, duplicados y later_variant (stg-1, stg-inexistente, stg-1, stg-later)', () => {
      const importedProgress: GuidedItemProgressRecord = {
        progressKey: 'pack-1:1.0.0:guided-test',
        packId: 'pack-1',
        packVersion: '1.0.0',
        itemId: 'guided-test',
        completedStageIds: ['stg-1', 'stg-inexistente', 'stg-1', 'stg-6'],
        updatedAt: '2026-08-02T00:00:00Z',
      }

      const result = deriveActiveGuidedStage(mockGuidedItem, importedProgress)

      expect(result.normalizedCompletedStageIds).toEqual(['stg-1'])
      expect(result.activeStage?.stageId).toBe('stg-2')
      expect(result.isCompleted).toBe(false)
    })
  })

  describe('computeNextGuidedLearningState', () => {
    const nowIso = '2026-08-02T12:00:00Z'

    it('exposure_completed promueve new -> learning con 0 éxitos independientes', () => {
      const next = computeNextGuidedLearningState(undefined, 'pack-1', 'unit-test', 'exposure_completed', nowIso, 'guided-test')

      expect(next.state).toBe('learning')
      expect(next.independentSuccessesCount).toBe(0)
      expect(next.lastReasonCode).toBe('INITIAL_LEARNING_OPENED')
      expect(next.practicedItemIds).toContain('guided-test')
    })

    it('assisted_success promueve learning -> practicing con 0 éxitos independientes', () => {
      const current = computeNextGuidedLearningState(undefined, 'pack-1', 'unit-test', 'exposure_completed', nowIso, 'guided-test')
      const next = computeNextGuidedLearningState(current, 'pack-1', 'unit-test', 'assisted_success', nowIso, 'guided-test')

      expect(next.state).toBe('practicing')
      expect(next.independentSuccessesCount).toBe(0)
      expect(next.lastReasonCode).toBe('GUIDED_STAGE_COMPLETED')
    })

    it('assisted_completed_without_success preserva el estado en learning con 0 éxitos independientes', () => {
      const current = computeNextGuidedLearningState(undefined, 'pack-1', 'unit-test', 'exposure_completed', nowIso, 'guided-test')
      const next = computeNextGuidedLearningState(current, 'pack-1', 'unit-test', 'assisted_completed_without_success', nowIso, 'guided-test')

      expect(next.state).toBe('learning')
      expect(next.independentSuccessesCount).toBe(0)
    })

    it('independent_success otorga como máximo 1 éxito independiente y estado practicing', () => {
      const current = computeNextGuidedLearningState(undefined, 'pack-1', 'unit-test', 'assisted_success', nowIso, 'guided-test')
      const next = computeNextGuidedLearningState(current, 'pack-1', 'unit-test', 'independent_success', nowIso, 'guided-test')

      expect(next.state).toBe('practicing')
      expect(next.independentSuccessesCount).toBe(1)
      expect(next.lastReasonCode).toBe('INDEPENDENT_SUCCESS_PRACTICING')

      // Repetición idempotente no infla el contador a 2
      const repeat = computeNextGuidedLearningState(next, 'pack-1', 'unit-test', 'independent_success', nowIso, 'guided-test')
      expect(repeat.independentSuccessesCount).toBe(1)
    })

    it('preserva intactos los estados superiores preexistentes (ready_for_assessment)', () => {
      const readyRecord = {
        compositeUnitKey: 'pack-1:unit-test',
        packId: 'pack-1',
        unitId: 'unit-test',
        state: 'ready_for_assessment' as const,
        independentSuccessesCount: 3,
        practicedItemIds: ['cmd-1', 'cmd-2'],
        lastPracticedAt: nowIso,
        updatedAt: nowIso,
      }

      const next = computeNextGuidedLearningState(readyRecord, 'pack-1', 'unit-test', 'independent_success', nowIso, 'guided-test')

      expect(next.state).toBe('ready_for_assessment')
      expect(next.independentSuccessesCount).toBe(3)
    })
  })
})
