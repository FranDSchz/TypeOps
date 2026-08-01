import { describe, it, expect } from 'vitest'
import { processMechanicalEvents, DEFAULT_MECHANICAL_CONFIG } from './mechanicalProfile'
import type { MechanicalCaptureEvent } from '../evaluation/types'

describe('Mechanical Profile Aggregator (Hito 3)', () => {
  it('no marca candidatos a fricción si no alcanza la muestra mínima', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'keydown', key: 'a', targetChar: 'a', producedChar: 'b', timestampMs: 100 },
      { type: 'keydown', key: 'a', targetChar: 'a', producedChar: 'b', timestampMs: 200 },
    ]

    const profile = processMechanicalEvents(events)
    expect(profile.characterMetrics['a']?.hasSufficientSample).toBe(false)
    expect(profile.characterMetrics['a']?.isFrictionCandidate).toBe(false)
  })

  it('marca candidato a fricción al alcanzar la muestra mínima y superar la tasa de error', () => {
    const events: MechanicalCaptureEvent[] = []
    for (let i = 0; i < DEFAULT_MECHANICAL_CONFIG.minCharAppearances; i++) {
      events.push({
        type: 'keydown',
        key: 'x',
        targetChar: 'x',
        producedChar: i < 3 ? 'z' : 'x', // 3/8 = 37.5% error rate (> 20%)
        timestampMs: 100 * (i + 1),
      })
    }

    const profile = processMechanicalEvents(events)
    const metric = profile.characterMetrics['x']
    expect(metric?.hasSufficientSample).toBe(true)
    expect(metric?.isFrictionCandidate).toBe(true)
  })
})
