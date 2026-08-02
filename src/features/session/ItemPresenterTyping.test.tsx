import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMechanicalCapture } from './useMechanicalCapture'
import type React from 'react'

describe('useMechanicalCapture Hook (Subhito 5B)', () => {
  it('registra eventos de teclado e input y consolida observación válida', () => {
    const { result } = renderHook(() => useMechanicalCapture())

    act(() => {
      result.current.handleKeyDown({ key: 'a', code: 'KeyA' } as unknown as React.KeyboardEvent<HTMLInputElement>)
      result.current.handleInput({
        currentTarget: { value: 'a' } as HTMLInputElement,
        nativeEvent: { data: 'a' } as InputEvent,
      } as unknown as React.SyntheticEvent<HTMLInputElement>)
    })

    const obs = result.current.consolidate('a', 'a')
    expect(obs.isValid).toBe(true)
    expect(obs.finalCorrectCharsCount).toBe(1)
  })

  it('el desenfoque (blur) provocado por el propio envío (markSubmitting) NO invalida la observación', () => {
    const { result } = renderHook(() => useMechanicalCapture())

    act(() => {
      result.current.handleKeyDown({ key: 'a', code: 'KeyA' } as unknown as React.KeyboardEvent<HTMLInputElement>)
      result.current.handleInput({
        currentTarget: { value: 'a' } as HTMLInputElement,
        nativeEvent: { data: 'a' } as InputEvent,
      } as unknown as React.SyntheticEvent<HTMLInputElement>)
      result.current.markSubmitting()
      result.current.handleBlur()
    })

    const obs = result.current.consolidate('a', 'a')
    expect(obs.isValid).toBe(true)
    expect(obs.validityLimitations).not.toContain('focus_lost')
  })

  it('un desenfoque (blur) real durante la edición SÍ agrega focus_lost e invalida la observación', () => {
    const { result } = renderHook(() => useMechanicalCapture())

    act(() => {
      result.current.handleKeyDown({ key: 'a', code: 'KeyA' } as unknown as React.KeyboardEvent<HTMLInputElement>)
      result.current.handleInput({
        currentTarget: { value: 'a' } as HTMLInputElement,
        nativeEvent: { data: 'a' } as InputEvent,
      } as unknown as React.SyntheticEvent<HTMLInputElement>)
      result.current.handleBlur()
    })

    const obs = result.current.consolidate('a', 'a')
    expect(obs.isValid).toBe(false)
    expect(obs.validityLimitations).toContain('focus_lost')
  })

  it('detecta evento de pegado (paste) y marca la observación', () => {
    const { result } = renderHook(() => useMechanicalCapture())

    act(() => {
      result.current.handlePaste()
      result.current.handleInput({
        currentTarget: { value: 'pasted' } as HTMLInputElement,
        nativeEvent: { inputType: 'insertFromPaste', data: 'pasted' } as InputEvent,
      } as unknown as React.SyntheticEvent<HTMLInputElement>)
    })

    const obs = result.current.consolidate('pasted', 'pasted')
    expect(obs.isValid).toBe(false)
    expect(obs.validityLimitations).toContain('paste_detected')
  })

  it('resetCapture() reinicia el estado de markSubmitting y vuelve a detectar blur en el nuevo intento', () => {
    const { result } = renderHook(() => useMechanicalCapture())

    act(() => {
      result.current.markSubmitting()
      result.current.resetCapture()
      result.current.handleKeyDown({ key: 'b', code: 'KeyB' } as unknown as React.KeyboardEvent<HTMLInputElement>)
      result.current.handleInput({
        currentTarget: { value: 'b' } as HTMLInputElement,
        nativeEvent: { data: 'b' } as InputEvent,
      } as unknown as React.SyntheticEvent<HTMLInputElement>)
      result.current.handleBlur()
    })

    const obs = result.current.consolidate('b', 'b')
    expect(obs.isValid).toBe(false)
    expect(obs.validityLimitations).toContain('focus_lost')
  })
})
