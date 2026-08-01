import type { MechanicalCaptureEvent } from '../evaluation/types'

/**
 * Configuración central de umbrales mecánicos heurísticos y modificables.
 */
export interface MechanicalConfig {
  minCharAppearances: number
  minBigramAppearances: number
  minSequenceAppearances: number
  initialErrorThreshold: number
  correctionRateThreshold: number
  latencyMultiplierThreshold: number
}

export const DEFAULT_MECHANICAL_CONFIG: MechanicalConfig = {
  minCharAppearances: 8,
  minBigramAppearances: 6,
  minSequenceAppearances: 4,
  initialErrorThreshold: 0.20,
  correctionRateThreshold: 0.25,
  latencyMultiplierThreshold: 1.5,
}

export interface SequenceMetric {
  sequence: string
  attemptsCount: number
  totalAppearances: number
  initialErrors: number
  corrections: number
  latenciesMs: number[]
  medianLatencyMs?: number
  hasSufficientSample: boolean
  isFrictionCandidate: boolean
}

export interface MechanicalProfile {
  characterMetrics: Record<string, SequenceMetric>
  sequenceMetrics: Record<string, SequenceMetric>
  lastObservationAt?: string
}

/**
 * Procesa eventos de captura mecánica y actualiza métricas acumuladas de forma pura.
 */
export function processMechanicalEvents(
  events: MechanicalCaptureEvent[],
  existingProfile?: MechanicalProfile,
  config: MechanicalConfig = DEFAULT_MECHANICAL_CONFIG,
): MechanicalProfile {
  const profile: MechanicalProfile = existingProfile ?? {
    characterMetrics: {},
    sequenceMetrics: {},
  }

  if (events.length === 0) return profile

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!ev || ev.type !== 'keydown' || !ev.targetChar) continue

    const char = ev.targetChar
    const metric = profile.characterMetrics[char] ?? {
      sequence: char,
      attemptsCount: 0,
      totalAppearances: 0,
      initialErrors: 0,
      corrections: 0,
      latenciesMs: [],
      hasSufficientSample: false,
      isFrictionCandidate: false,
    }

    metric.totalAppearances++
    if (ev.producedChar && ev.producedChar !== ev.targetChar) {
      metric.initialErrors++
    }
    if (ev.key === 'Backspace') {
      metric.corrections++
    }

    const prevEv = events[i - 1]
    if (i > 0 && prevEv?.timestampMs !== undefined) {
      const lat = ev.timestampMs - prevEv.timestampMs
      if (lat > 0 && lat < 5000) {
        metric.latenciesMs.push(lat)
      }
    }

    metric.hasSufficientSample = metric.totalAppearances >= config.minCharAppearances
    const errorRate = metric.totalAppearances > 0 ? metric.initialErrors / metric.totalAppearances : 0
    const corrRate = metric.totalAppearances > 0 ? metric.corrections / metric.totalAppearances : 0

    metric.isFrictionCandidate =
      metric.hasSufficientSample &&
      (errorRate >= config.initialErrorThreshold || corrRate >= config.correctionRateThreshold)

    profile.characterMetrics[char] = metric
  }

  profile.lastObservationAt = new Date().toISOString()
  return profile
}
