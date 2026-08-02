/**
 * TypeOps V1 — Mechanical Observation Domain Types (Subhito 5B)
 *
 * Modelo de observación inmutable consolidado por intento de typing_copy.
 * Mantiene separados los eventos crudos de la evidencia estructurada de tipeo.
 */

export type MechanicalValidityLimitation =
  | 'paste_detected'
  | 'focus_lost'
  | 'ime_composition'
  | 'selection_replacement'
  | 'history_undo_redo'
  | 'incomplete_stream'

/**
 * Evento interno no persistido de captura en memoria (React Hook -> Reductor)
 */
export interface MechanicalCaptureEvent {
  type: 'keydown' | 'beforeinput' | 'input' | 'paste' | 'blur' | 'compositionstart' | 'compositionend'
  key?: string | undefined
  code?: string | undefined
  inputType?: string | undefined
  charInserted?: string | undefined
  timestampMs: number
  targetValueLength?: number | undefined
  selectionStart?: number | undefined
  selectionEnd?: number | undefined
}

/**
 * Estadísticas observadas por secuencia en un único intento.
 */
export interface SingleAttemptSequenceStats {
  totalAppearances: number
  validLatenciesMs: number[]
}

/**
 * Observación consolidada inmutable embebida en AttemptRecord
 */
export interface MechanicalObservation {
  isValid: boolean
  validityLimitations: MechanicalValidityLimitation[]
  targetLength: number
  finalLength: number
  initialErrorsCount: number
  globalCorrectionsCount: number
  finalCorrectCharsCount: number
  observedSequences: Record<string, SingleAttemptSequenceStats>
}

/**
 * Normaliza la lista de latencias acotándola a la ventana deslizante máxima (20 observaciones recientes).
 */
export function trimLatenciesWindow(latencies: number[], maxWindow = 20): number[] {
  if (latencies.length <= maxWindow) return latencies
  return latencies.slice(latencies.length - maxWindow)
}

/**
 * Calcula la mediana determinista de una lista de latencias ms.
 */
export function calculateMedianLatency(latencies: number[]): number | undefined {
  if (latencies.length === 0) return undefined
  const sorted = [...latencies].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 !== 0) {
    return sorted[mid]
  }
  const low = sorted[mid - 1]
  const high = sorted[mid]
  if (low === undefined || high === undefined) return undefined
  return Math.round((low + high) / 2)
}

/**
 * Reductor puro determinista que consolida una lista de eventos capturados
 * en una MechanicalObservation inmutable.
 */
export function reduceEventsToObservation(
  targetText: string,
  finalSubmittedText: string,
  events: MechanicalCaptureEvent[],
  declaredSequences: string[] = [],
): MechanicalObservation {
  const limitations = new Set<MechanicalValidityLimitation>()
  let globalCorrectionsCount = 0
  let initialErrorsCount = 0
  const firstMismatchPositions = new Set<number>()

  let isCompositionActive = false
  let isPasteDetected = false
  let isBlurDetected = false
  let isSelectionReplacementDetected = false
  let isHistoryUndoRedoDetected = false

  // Evaluar eventos crudos para detectar limitaciones e invalidantes
  let lastConfirmedTime: number | null = null
  let lastInsertedChar: string | null = null

  const observedSequences: Record<string, SingleAttemptSequenceStats> = {}

  function recordSequenceAppearance(seq: string, latencyMs?: number) {
    const existing = observedSequences[seq] ?? {
      totalAppearances: 0,
      validLatenciesMs: [],
    }
    existing.totalAppearances += 1
    if (latencyMs !== undefined && latencyMs > 0 && latencyMs <= 5000) {
      existing.validLatenciesMs.push(latencyMs)
      existing.validLatenciesMs = trimLatenciesWindow(existing.validLatenciesMs, 20)
    }
    observedSequences[seq] = existing
  }

  for (let i = 0; i < events.length; i++) {
    const ev = events[i]
    if (!ev) continue

    if (ev.type === 'paste') {
      isPasteDetected = true
      limitations.add('paste_detected')
    }

    if (ev.type === 'blur') {
      isBlurDetected = true
      limitations.add('focus_lost')
    }

    if (ev.type === 'compositionstart') {
      isCompositionActive = true
      limitations.add('ime_composition')
    }

    if (ev.type === 'compositionend') {
      isCompositionActive = false
    }

    if (ev.type === 'keydown') {
      if (ev.key === 'Backspace' || ev.key === 'Delete') {
        globalCorrectionsCount += 1
        // Discontinuidad de latencia al borrar
        lastConfirmedTime = null
        lastInsertedChar = null
      }
    }

    if (ev.type === 'beforeinput' || ev.type === 'input') {
      const inputType = ev.inputType ?? ''
      if (inputType === 'insertFromPaste') {
        isPasteDetected = true
        limitations.add('paste_detected')
      }
      if (inputType === 'historyUndo' || inputType === 'historyRedo' || inputType === 'insertReplacementText') {
        isHistoryUndoRedoDetected = true
        limitations.add('history_undo_redo')
      }

      // Detección de reemplazo de selección no colapsada
      if (ev.selectionStart !== undefined && ev.selectionEnd !== undefined && ev.selectionStart !== ev.selectionEnd) {
        isSelectionReplacementDetected = true
        limitations.add('selection_replacement')
      }
    }

    // Procesar inserción de carácter confirmada por evento input/beforeinput
    if ((ev.type === 'input' || ev.type === 'beforeinput') && ev.charInserted && ev.charInserted.length === 1) {
      const char = ev.charInserted
      const currentPos = (ev.targetValueLength ?? 1) - 1

      // Conteo de error inicial por primera intención en esa posición
      if (currentPos >= 0 && currentPos < targetText.length) {
        const expectedChar = targetText[currentPos]
        if (expectedChar !== undefined && char !== expectedChar && !firstMismatchPositions.has(currentPos)) {
          firstMismatchPositions.add(currentPos)
          initialErrorsCount += 1
        }
      }

      // Evaluar latencia y secuencias si no hay discontinuidades
      if (!isCompositionActive && !isPasteDetected && !isBlurDetected && !isSelectionReplacementDetected && !isHistoryUndoRedoDetected) {
        let currentLatency: number | undefined = undefined
        if (lastConfirmedTime !== null) {
          const delta = ev.timestampMs - lastConfirmedTime
          if (delta > 0 && delta <= 5000) {
            currentLatency = delta
          }
        }

        // Registrar carácter individual
        recordSequenceAppearance(char, currentLatency)

        // Registrar bigrama lineal si hubo carácter anterior confirmado
        if (lastInsertedChar !== null) {
          const bigram = lastInsertedChar + char
          recordSequenceAppearance(bigram, currentLatency)
        }

        // Registrar secuencias largas declaradas (3+ caracteres)
        for (const declaredSeq of declaredSequences) {
          if (declaredSeq.length >= 3 && targetText.includes(declaredSeq)) {
            // Si la inserción actual completa la secuencia declarada
            const targetPos = (ev.targetValueLength ?? 0)
            if (targetPos >= declaredSeq.length) {
              const subTarget = targetText.slice(targetPos - declaredSeq.length, targetPos)
              if (subTarget === declaredSeq) {
                recordSequenceAppearance(declaredSeq, currentLatency)
              }
            }
          }
        }

        lastConfirmedTime = ev.timestampMs
        lastInsertedChar = char
      } else {
        lastConfirmedTime = null
        lastInsertedChar = null
      }
    }
  }

  // Evaluar coincidencia exacta de caracteres en texto final enviado
  let finalCorrectCharsCount = 0
  const minLen = Math.min(targetText.length, finalSubmittedText.length)
  for (let idx = 0; idx < minLen; idx++) {
    if (targetText[idx] === finalSubmittedText[idx]) {
      finalCorrectCharsCount += 1
    }
  }

  const isValid =
    !isPasteDetected &&
    !isBlurDetected &&
    !isSelectionReplacementDetected &&
    !isHistoryUndoRedoDetected &&
    limitations.size === 0

  return {
    isValid,
    validityLimitations: Array.from(limitations),
    targetLength: targetText.length,
    finalLength: finalSubmittedText.length,
    initialErrorsCount,
    globalCorrectionsCount,
    finalCorrectCharsCount,
    observedSequences,
  }
}
