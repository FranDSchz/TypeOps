import { describe, it, expect } from 'vitest'
import {
  reduceEventsToObservation,
  calculateMedianLatency,
  trimLatenciesWindow,
  type MechanicalCaptureEvent,
} from './mechanicalObservation'

describe('Mechanical Observation Engine (Subhito 5B)', () => {
  it('consolida un tipeo normal continuo calculando deltas y acierto final', () => {
    const target = 'ls -la'
    const events: MechanicalCaptureEvent[] = [
      { type: 'keydown', key: 'l', timestampMs: 100 },
      { type: 'input', charInserted: 'l', targetValueLength: 1, timestampMs: 105 },
      { type: 'keydown', key: 's', timestampMs: 200 },
      { type: 'input', charInserted: 's', targetValueLength: 2, timestampMs: 205 },
      { type: 'keydown', key: ' ', timestampMs: 300 },
      { type: 'input', charInserted: ' ', targetValueLength: 3, timestampMs: 305 },
      { type: 'keydown', key: '-', timestampMs: 400 },
      { type: 'input', charInserted: '-', targetValueLength: 4, timestampMs: 405 },
      { type: 'keydown', key: 'l', timestampMs: 500 },
      { type: 'input', charInserted: 'l', targetValueLength: 5, timestampMs: 505 },
      { type: 'keydown', key: 'a', timestampMs: 600 },
      { type: 'input', charInserted: 'a', targetValueLength: 6, timestampMs: 605 },
    ]

    const obs = reduceEventsToObservation(target, 'ls -la', events)
    expect(obs.isValid).toBe(true)
    expect(obs.validityLimitations).toHaveLength(0)
    expect(obs.targetLength).toBe(6)
    expect(obs.finalLength).toBe(6)
    expect(obs.finalCorrectCharsCount).toBe(6)
    expect(obs.initialErrorsCount).toBe(0)
    expect(obs.globalCorrectionsCount).toBe(0)
    expect(obs.observedSequences['l']).toBeDefined()
    expect(obs.observedSequences['ls']).toBeDefined()
  })

  it('detecta pegado (paste) e invalida la agregación marcando paste_detected', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'paste', timestampMs: 100 },
      { type: 'input', inputType: 'insertFromPaste', charInserted: 'ls -la', targetValueLength: 6, timestampMs: 105 },
    ]

    const obs = reduceEventsToObservation('ls -la', 'ls -la', events)
    expect(obs.isValid).toBe(false)
    expect(obs.validityLimitations).toContain('paste_detected')
  })

  it('detecta pérdida de foco (blur) agregando focus_lost e invalidando la observación', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'keydown', key: 'l', timestampMs: 100 },
      { type: 'input', charInserted: 'l', targetValueLength: 1, timestampMs: 105 },
      { type: 'blur', timestampMs: 200 },
    ]

    const obs = reduceEventsToObservation('ls -la', 'l', events)
    expect(obs.isValid).toBe(false)
    expect(obs.validityLimitations).toContain('focus_lost')
  })

  it('desconecta latencias e incrementa globalCorrectionsCount al pulsar Backspace', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'keydown', key: 'x', timestampMs: 100 },
      { type: 'input', charInserted: 'x', targetValueLength: 1, timestampMs: 105 },
      { type: 'keydown', key: 'Backspace', timestampMs: 200 },
      { type: 'keydown', key: 'l', timestampMs: 300 },
      { type: 'input', charInserted: 'l', targetValueLength: 1, timestampMs: 305 },
    ]

    const obs = reduceEventsToObservation('ls', 'l', events)
    expect(obs.globalCorrectionsCount).toBe(1)
    expect(obs.initialErrorsCount).toBe(1) // 'x' vs 'l' en posicion 0
  })

  it('acota la ventana deslizante a máximo 20 latencias y calcula mediana determinista', () => {
    const latencies = Array.from({ length: 30 }, (_, i) => (i + 1) * 10)
    const trimmed = trimLatenciesWindow(latencies, 20)
    expect(trimmed).toHaveLength(20)
    expect(trimmed[0]).toBe(110)
    expect(trimmed[19]).toBe(300)

    const median = calculateMedianLatency([10, 20, 30, 40, 50])
    expect(median).toBe(30)
  })

  it('invalida la observación ante sustitución de selección no colapsada o historial', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'input', inputType: 'insertText', charInserted: 'a', targetValueLength: 1, selectionStart: 0, selectionEnd: 2, timestampMs: 100 },
    ]

    const obs = reduceEventsToObservation('a', 'a', events)
    expect(obs.isValid).toBe(false)
    expect(obs.validityLimitations).toContain('selection_replacement')
  })

  it('descarta latencias mayores a 5000 ms entre mutaciones consecutivas', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'input', charInserted: 'l', targetValueLength: 1, timestampMs: 100 },
      { type: 'input', charInserted: 's', targetValueLength: 2, timestampMs: 6000 }, // Pause 5900ms > 5000ms
    ]

    const obs = reduceEventsToObservation('ls', 'ls', events)
    expect(obs.observedSequences['ls']?.validLatenciesMs).toHaveLength(0)
  })

  it('secuencias de 3+ caracteres sólo se registran si están en declaredSequences', () => {
    const events: MechanicalCaptureEvent[] = [
      { type: 'input', charInserted: 'c', targetValueLength: 1, timestampMs: 100 },
      { type: 'input', charInserted: 'a', targetValueLength: 2, timestampMs: 200 },
      { type: 'input', charInserted: 't', targetValueLength: 3, timestampMs: 300 },
    ]

    // Sin declarar 'cat'
    const obs1 = reduceEventsToObservation('cat', 'cat', events, [])
    expect(obs1.observedSequences['cat']).toBeUndefined()

    // Con 'cat' en declaredSequences
    const obs2 = reduceEventsToObservation('cat', 'cat', events, ['cat'])
    expect(obs2.observedSequences['cat']).toBeDefined()
  })
})
