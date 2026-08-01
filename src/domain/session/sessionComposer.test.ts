import { describe, it, expect } from 'vitest'
import { composeSession } from './sessionComposer'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../content/types'

describe('Session Composer (Hito 3)', () => {
  const pack = officialPack as ContentPack

  it('compone una sesión respetando el preset de 2 minutos (120s)', () => {
    const plan = composeSession({
      pack,
      mode: 'typing',
      targetDurationSeconds: 120,
    })

    expect(plan.presetName).toBe('2_minutes')
    expect(plan.items.length).toBeGreaterThan(0)
    expect(plan.estimatedTotalDurationSeconds).toBeGreaterThan(0)
  })

  it('compone una sesión por cantidad fija de ítems', () => {
    const plan = composeSession({
      pack,
      mode: 'typing',
      targetCount: 2,
    })

    expect(plan.presetName).toBe('count_2')
    expect(plan.items.length).toBeLessThanOrEqual(2)
  })

  it('permite 1 ítem si excede ligeramente el presupuesto de tiempo vacíos', () => {
    const plan = composeSession({
      pack,
      mode: 'typing',
      targetDurationSeconds: 10, // Muy corto
    })

    expect(plan.items.length).toBe(1)
  })
})
