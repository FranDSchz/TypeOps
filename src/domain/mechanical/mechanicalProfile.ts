import type { MechanicalObservation } from './mechanicalObservation'
import { calculateMedianLatency, trimLatenciesWindow } from './mechanicalObservation'

/**
 * TypeOps V1 — Mechanical Profile Domain Engine (Subhito 5B)
 *
 * Muestra acotada y agregación acumulada de perfiles mecánicos por pack.
 */

export interface SequenceMetric {
  totalAppearances: number
  distinctAttemptsCount: number
  validLatenciesMs: number[] // Máximo 20 observaciones en ventana deslizante
  medianLatencyMs?: number | undefined
  hasSufficientSample: boolean
}

export interface MechanicalProfileDomain {
  profileKey: string
  packId: string
  packVersion: string
  characterMetrics: Record<string, SequenceMetric>
  sequenceMetrics: Record<string, SequenceMetric>
  updatedAt: string
}

export type MechanicalProfile = MechanicalProfileDomain

/**
 * Procesa una MechanicalObservation inmutable y actualiza el perfil acumulado.
 * Si la observación es inválida (isValid === false), la agregación es un NO-OP estricto.
 */
export function aggregateObservationIntoProfile(
  observation: MechanicalObservation,
  existingProfile?: MechanicalProfileDomain,
  profileKey = 'default:1.0.0',
  packId = 'default',
  packVersion = '1.0.0',
): MechanicalProfileDomain {
  const profile: MechanicalProfileDomain = existingProfile ?? {
    profileKey,
    packId,
    packVersion,
    characterMetrics: {},
    sequenceMetrics: {},
    updatedAt: new Date().toISOString(),
  }

  // SI LA OBSERVACIÓN ES INVÁLIDA, NO-OP ESTRICTO (No altera ninguna métrica)
  if (!observation.isValid) {
    return profile
  }

  for (const [seq, stats] of Object.entries(observation.observedSequences)) {
    const isChar = seq.length === 1
    const targetMap = isChar ? profile.characterMetrics : profile.sequenceMetrics

    const currentMetric: SequenceMetric = targetMap[seq] ?? {
      totalAppearances: 0,
      distinctAttemptsCount: 0,
      validLatenciesMs: [],
      hasSufficientSample: false,
    }

    currentMetric.totalAppearances += stats.totalAppearances
    currentMetric.distinctAttemptsCount += 1

    if (stats.validLatenciesMs.length > 0) {
      currentMetric.validLatenciesMs = trimLatenciesWindow(
        [...currentMetric.validLatenciesMs, ...stats.validLatenciesMs],
        20,
      )
      currentMetric.medianLatencyMs = calculateMedianLatency(currentMetric.validLatenciesMs)
    }

    // Evaluación de muestra suficiente según diversidad de intentos
    if (isChar) {
      currentMetric.hasSufficientSample =
        currentMetric.totalAppearances >= 8 && currentMetric.distinctAttemptsCount >= 3
    } else if (seq.length === 2) {
      currentMetric.hasSufficientSample =
        currentMetric.totalAppearances >= 6 && currentMetric.distinctAttemptsCount >= 3
    } else {
      currentMetric.hasSufficientSample =
        currentMetric.totalAppearances >= 4 && currentMetric.distinctAttemptsCount >= 2
    }

    targetMap[seq] = currentMetric
  }

  profile.updatedAt = new Date().toISOString()
  return profile
}
