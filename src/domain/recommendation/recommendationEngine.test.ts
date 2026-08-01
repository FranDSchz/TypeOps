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
})
