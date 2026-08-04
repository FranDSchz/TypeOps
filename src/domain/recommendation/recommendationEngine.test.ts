import { describe, it, expect } from 'vitest'
import { recommendNextItem } from './recommendationEngine'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../content/types'

describe('Recommendation Engine (Hito 3)', () => {
  const pack = officialPack as ContentPack

  it('recomienda práctica guiada en curso si existe unidad en estado learning', () => {
    const rec = recommendNextItem({
      pack,
      mode: 'guided',
      progressMap: {
        'unit-log-inspection': {
          unitId: 'unit-log-inspection',
          state: 'learning',
          independentSuccessesCount: 0,
          practicedItemIds: [],
        },
      },
    })

    expect(rec).not.toBeNull()
    expect(rec?.reasonCode).toBe('resume_guided')
  })

  it('previene la repetición del mismo ítem si está en el historial reciente (cuando existen múltiples candidatos)', () => {
    const rec1 = recommendNextItem({
      pack,
      mode: 'review',
    })

    expect(rec1).not.toBeNull()
    const firstItemId = rec1?.item.itemId ?? ''

    const rec2 = recommendNextItem({
      pack,
      mode: 'review',
      recentItemIds: [firstItemId],
    })

    expect(rec2).not.toBeNull()
    expect(rec2?.item.itemId).not.toBe(firstItemId)
  })

  it('aplica userFocusCategory como filtro preferente', () => {
    const rec = recommendNextItem({
      pack,
      mode: 'typing',
      userFocusCategory: 'linux',
    })

    expect(rec).not.toBeNull()
    expect(rec?.item.categories).toContain('linux')
  })

  it('bloquea ítem de evaluación si la unidad requerida no es elegible en unitEligibilityMap', () => {
    const rec = recommendNextItem({
      pack,
      mode: 'command',
      unitEligibilityMap: {
        'unit-log-inspection': {
          unitId: 'unit-log-inspection',
          hasGuidedPathInPack: true,
          isGuidedCompleted: false,
          hasPriorKnowledge: false,
          isSatisfiedForEvaluation: false,
          isSatisfiedForGuidedEntry: false,
        },
        'unit-linux-basics': {
          unitId: 'unit-linux-basics',
          hasGuidedPathInPack: false,
          isGuidedCompleted: false,
          hasPriorKnowledge: true,
          isSatisfiedForEvaluation: true,
          isSatisfiedForGuidedEntry: true,
        },
      },
    })

    expect(rec).toBeNull()
  })

  it('permite ítem de evaluación cuando sus unidades requeridas están satisfechas', () => {
    const rec = recommendNextItem({
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
          hasPriorKnowledge: true,
          isSatisfiedForEvaluation: true,
          isSatisfiedForGuidedEntry: true,
        },
      },
    })

    expect(rec).not.toBeNull()
    expect(rec?.item.itemId).toBe('cmd-tail-n')
  })
})
