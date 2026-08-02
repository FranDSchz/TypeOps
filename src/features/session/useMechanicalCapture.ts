import { useRef, useCallback } from 'react'
import type { MechanicalCaptureEvent, MechanicalObservation } from '../../domain/mechanical/mechanicalObservation'
import { reduceEventsToObservation } from '../../domain/mechanical/mechanicalObservation'

/**
 * TypeOps V1 — React Hook para la captura en memoria de eventos mecánicos de escritura (Subhito 5B).
 *
 * Mantiene un buffer interno no persistido durante la edición y expone la función
 * consolidate() para reducir los eventos en una MechanicalObservation inmutable.
 */
export function useMechanicalCapture() {
  const eventsRef = useRef<MechanicalCaptureEvent[]>([])
  const isSubmittingRef = useRef<boolean>(false)

  const resetCapture = useCallback(() => {
    eventsRef.current = []
    isSubmittingRef.current = false
  }, [])

  const markSubmitting = useCallback(() => {
    isSubmittingRef.current = true
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    eventsRef.current.push({
      type: 'keydown',
      key: e.key,
      code: e.code,
      timestampMs: performance.now(),
    })
  }, [])

  const handleBeforeInput = useCallback((e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nativeEv = e.nativeEvent as InputEvent
    eventsRef.current.push({
      type: 'beforeinput',
      inputType: nativeEv.inputType,
      charInserted: nativeEv.data ?? undefined,
      timestampMs: performance.now(),
    })
  }, [])

  const handleInput = useCallback((e: React.SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.currentTarget
    const nativeEv = e.nativeEvent as InputEvent
    eventsRef.current.push({
      type: 'input',
      inputType: nativeEv.inputType,
      charInserted: nativeEv.data ?? undefined,
      targetValueLength: target.value.length,
      selectionStart: target.selectionStart ?? undefined,
      selectionEnd: target.selectionEnd ?? undefined,
      timestampMs: performance.now(),
    })
  }, [])

  const handlePaste = useCallback(() => {
    eventsRef.current.push({
      type: 'paste',
      timestampMs: performance.now(),
    })
  }, [])

  const handleBlur = useCallback(() => {
    // Si el desenfoque es provocado por el propio botón o envío, NO se marca focus_lost
    if (isSubmittingRef.current) return

    eventsRef.current.push({
      type: 'blur',
      timestampMs: performance.now(),
    })
  }, [])

  const handleCompositionStart = useCallback(() => {
    eventsRef.current.push({
      type: 'compositionstart',
      timestampMs: performance.now(),
    })
  }, [])

  const handleCompositionEnd = useCallback(() => {
    eventsRef.current.push({
      type: 'compositionend',
      timestampMs: performance.now(),
    })
  }, [])

  const consolidate = useCallback(
    (targetText: string, submittedText: string, declaredSequences: string[] = []): MechanicalObservation => {
      return reduceEventsToObservation(targetText, submittedText, eventsRef.current, declaredSequences)
    },
    [],
  )

  return {
    eventsBuffer: eventsRef,
    resetCapture,
    markSubmitting,
    handleKeyDown,
    handleBeforeInput,
    handleInput,
    handlePaste,
    handleBlur,
    handleCompositionStart,
    handleCompositionEnd,
    consolidate,
  }
}
