import { describe, it, expect } from 'vitest'
import { aggregateObservationIntoProfile } from './mechanicalProfile'
import type { MechanicalObservation } from './mechanicalObservation'

describe('Mechanical Profile Aggregation (Subhito 5B)', () => {
  const validObservation: MechanicalObservation = {
    isValid: true,
    validityLimitations: [],
    targetLength: 5,
    finalLength: 5,
    initialErrorsCount: 0,
    globalCorrectionsCount: 0,
    finalCorrectCharsCount: 5,
    observedSequences: {
      l: { totalAppearances: 3, validLatenciesMs: [100, 110, 105] },
      s: { totalAppearances: 3, validLatenciesMs: [120, 115, 125] },
    },
  }

  const invalidObservation: MechanicalObservation = {
    ...validObservation,
    isValid: false,
    validityLimitations: ['paste_detected'],
  }

  it('observación inválida (isValid === false) es un NO-OP estricto y no modifica el perfil', () => {
    const profile = aggregateObservationIntoProfile(invalidObservation, undefined, 'pack-1:1.0.0', 'pack-1', '1.0.0')
    expect(profile.characterMetrics['l']).toBeUndefined()
    expect(Object.keys(profile.characterMetrics)).toHaveLength(0)
  })

  it('observación válida agrega métricas e incrementa distinctAttemptsCount', () => {
    let profile = aggregateObservationIntoProfile(validObservation, undefined, 'pack-1:1.0.0', 'pack-1', '1.0.0')
    expect(profile.characterMetrics['l']).toBeDefined()
    expect(profile.characterMetrics['l']?.distinctAttemptsCount).toBe(1)
    expect(profile.characterMetrics['l']?.totalAppearances).toBe(3)
    expect(profile.characterMetrics['l']?.hasSufficientSample).toBe(false) // Requiere >= 8 apariciones y >= 3 intentos

    // Segundo intento válido
    profile = aggregateObservationIntoProfile(validObservation, profile, 'pack-1:1.0.0', 'pack-1', '1.0.0')
    expect(profile.characterMetrics['l']?.distinctAttemptsCount).toBe(2)
    expect(profile.characterMetrics['l']?.totalAppearances).toBe(6)
    expect(profile.characterMetrics['l']?.hasSufficientSample).toBe(false)

    // Tercer intento válido -> alcanza 9 apariciones en 3 intentos distintos
    profile = aggregateObservationIntoProfile(validObservation, profile, 'pack-1:1.0.0', 'pack-1', '1.0.0')
    expect(profile.characterMetrics['l']?.distinctAttemptsCount).toBe(3)
    expect(profile.characterMetrics['l']?.totalAppearances).toBe(9)
    expect(profile.characterMetrics['l']?.hasSufficientSample).toBe(true)
  })

  it('mantiene la ventana deslizante acotada a máximo 20 latencias', () => {
    let profile = aggregateObservationIntoProfile(validObservation, undefined, 'pack-1:1.0.0', 'pack-1', '1.0.0')
    for (let i = 0; i < 10; i++) {
      profile = aggregateObservationIntoProfile(validObservation, profile, 'pack-1:1.0.0', 'pack-1', '1.0.0')
    }
    expect(profile.characterMetrics['l']?.validLatenciesMs.length).toBeLessThanOrEqual(20)
  })
})
