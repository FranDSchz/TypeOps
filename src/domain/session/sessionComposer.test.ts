import { describe, it, expect } from 'vitest'
import { composeSession } from './sessionComposer'
import { buildUnitEligibilityMap } from '../learning/unitEligibility'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../content/types'

describe('Session Composer (Hito 3)', () => {
  const pack = officialPack as ContentPack

  it('compone una sesión respetando el preset de 2 minutos (120s)', () => {
    const res = composeSession({
      pack,
      mode: 'typing',
      targetDurationSeconds: 120,
    })

    expect(res.status).toBe('success')
    if (res.status === 'success') {
      expect(res.sessionPlan.presetName).toBe('2_minutes')
      expect(res.sessionPlan.items.length).toBeGreaterThan(0)
      expect(res.sessionPlan.estimatedTotalDurationSeconds).toBeGreaterThan(0)
    }
  })

  it('compone una sesión por cantidad fija de ítems', () => {
    const res = composeSession({
      pack,
      mode: 'typing',
      targetCount: 2,
    })

    expect(res.status).toBe('success')
    if (res.status === 'success') {
      expect(res.sessionPlan.presetName).toBe('count_2')
      expect(res.sessionPlan.items.length).toBeLessThanOrEqual(2)
    }
  })

  it('permite 1 ítem si excede ligeramente el presupuesto de tiempo vacíos', () => {
    const res = composeSession({
      pack,
      mode: 'typing',
      targetDurationSeconds: 10,
    })

    expect(res.status).toBe('success')
    if (res.status === 'success') {
      expect(res.sessionPlan.items.length).toBe(1)
    }
  })

  it('retorna guided_path_unavailable cuando una unidad requerida no tiene guided path ni conocimiento previo', () => {
    const res = composeSession({
      pack,
      mode: 'command',
      unitEligibilityMap: {
        'unit-log-inspection': {
          unitId: 'unit-log-inspection',
          hasGuidedPathInPack: true,
          isGuidedCompleted: true,
          hasPriorKnowledge: false,
          isSatisfiedForEvaluation: true,
          isSatisfiedForGuidedEntry: true,
        },
        'unit-linux-basics': {
          unitId: 'unit-linux-basics',
          hasGuidedPathInPack: false,
          isGuidedCompleted: false,
          hasPriorKnowledge: false,
          isSatisfiedForEvaluation: false,
          isSatisfiedForGuidedEntry: true,
        },
      },
    })

    expect(res.status).toBe('guided_path_unavailable')
    if (res.status === 'guided_path_unavailable') {
      expect(res.blockedUnits).toHaveLength(1)
      expect(res.blockedUnits[0]?.unitId).toBe('unit-linux-basics')
    }
  })

  describe('Semántica diferenciada de elegibilidad por unidad (R1D)', () => {
    it('1. unit-linux-basics sin guided y sin conocimiento previo: no satisfecha para evaluación, permitida como prerrequisito para guided', () => {
      const map = buildUnitEligibilityMap({
        pack,
        completedGuidedItemIds: [],
        priorKnowledgeUnitIds: [],
      })
      const linuxBasics = map['unit-linux-basics']
      expect(linuxBasics).toBeDefined()
      expect(linuxBasics?.isSatisfiedForEvaluation).toBe(false)
      expect(linuxBasics?.isSatisfiedForGuidedEntry).toBe(true)
    })

    it('2. unit-log-inspection con guided incompleto: no satisfecha para evaluación', () => {
      const map = buildUnitEligibilityMap({
        pack,
        completedGuidedItemIds: [],
        priorKnowledgeUnitIds: [],
      })
      const logInspection = map['unit-log-inspection']
      expect(logInspection).toBeDefined()
      expect(logInspection?.isSatisfiedForEvaluation).toBe(false)
    })

    it('3. unit-log-inspection con guided completo: satisfecha para evaluación', () => {
      const map = buildUnitEligibilityMap({
        pack,
        completedGuidedItemIds: ['guided-tail-intro'],
        priorKnowledgeUnitIds: [],
      })
      const logInspection = map['unit-log-inspection']
      expect(logInspection).toBeDefined()
      expect(logInspection?.isSatisfiedForEvaluation).toBe(true)
    })

    it('4. cualquier unidad con conocimiento previo válido: satisfecha para evaluación', () => {
      const map = buildUnitEligibilityMap({
        pack,
        completedGuidedItemIds: [],
        priorKnowledgeUnitIds: ['unit-linux-basics'],
      })
      const linuxBasics = map['unit-linux-basics']
      expect(linuxBasics).toBeDefined()
      expect(linuxBasics?.isSatisfiedForEvaluation).toBe(true)
    })

    it('5. marca de conocimiento previo para otra unidad o de otro filtro no satisface la unidad activa', () => {
      const map = buildUnitEligibilityMap({
        pack,
        completedGuidedItemIds: [],
        priorKnowledgeUnitIds: ['unit-other-pack'],
      })
      const linuxBasics = map['unit-linux-basics']
      expect(linuxBasics?.isSatisfiedForEvaluation).toBe(false)
    })
  })
})
