import { describe, it, expect } from 'vitest'
import { sessionReducer, INITIAL_SESSION_UI_STATE } from './sessionReducer'
import type { SessionRecord } from '../../data/db/records'
import type { SessionPlan } from '../../domain/session/sessionComposer'

describe('sessionReducer (Paso 3)', () => {
  it('transita a status "configuring" con START_CONFIGURING', () => {
    const nextState = sessionReducer(INITIAL_SESSION_UI_STATE, { type: 'START_CONFIGURING' })
    expect(nextState.status).toBe('configuring')
  })

  it('transita a status "active" y asigna UUID de turno en SESSION_INITIALIZED', () => {
    const sessionRecord: SessionRecord = {
      sessionId: 'sess-123',
      packId: 'pack-1',
      packVersion: '1.0.0',
      mode: 'command',
      presetName: '5_minutes',
      startedAt: new Date().toISOString(),
      deadlineAt: null,
      planItems: [],
      currentIndex: 0,
      status: 'active',
      completionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const sessionPlan: SessionPlan = { items: [], estimatedTotalDurationSeconds: 60, presetName: '5_minutes' }

    const nextState = sessionReducer(INITIAL_SESSION_UI_STATE, {
      type: 'SESSION_INITIALIZED',
      sessionRecord,
      sessionPlan,
    })

    expect(nextState.status).toBe('active')
    expect(nextState.currentTurnAttemptId).toBeDefined()
    expect(typeof nextState.currentTurnAttemptId).toBe('string')
  })

  it('incrementa hintsUsedCount con USE_HINT', () => {
    const activeState = { ...INITIAL_SESSION_UI_STATE, status: 'active' as const }
    const state1 = sessionReducer(activeState, { type: 'USE_HINT' })
    expect(state1.hintsUsedCount).toBe(1)
    expect(state1.activeHintLevel).toBe(1)
  })
})
