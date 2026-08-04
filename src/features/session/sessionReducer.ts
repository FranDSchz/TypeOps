import type { AttemptRecord, GuidedItemProgressRecord, SessionRecord } from '../../data/db/records'
import type { ContentItem } from '../../domain/content/types'
import type { SessionCompositionResult, SessionPlan } from '../../domain/session/sessionComposer'
import type { RecoveryFailureInfo } from './sessionRecoveryService'

export type SessionUIStatus =
  | 'idle'
  | 'configuring'
  | 'active'
  | 'item_feedback'
  | 'completed'
  | 'recovery_error'
  | 'empty_plan'

export interface SummaryRecommendationInfo {
  item: ContentItem
  reasonCode: string
  reasonDescription: string
}

export interface SessionUIState {
  status: SessionUIStatus
  sessionRecord: SessionRecord | null
  sessionPlan: SessionPlan | null
  currentPlanIndex: number
  currentTurnAttemptId: string | null
  hintsUsedCount: number
  activeHintLevel: number
  lastSubmittedAttempt: AttemptRecord | null
  submittedAttempts: AttemptRecord[]
  emptyReason: string | null
  compositionResult: SessionCompositionResult | null
  recoveryError: RecoveryFailureInfo | null
  closeError: string | null
  summaryRecommendation: SummaryRecommendationInfo | null
  guidedProgressRecord?: GuidedItemProgressRecord | null
}

export const INITIAL_SESSION_UI_STATE: SessionUIState = {
  status: 'idle',
  sessionRecord: null,
  sessionPlan: null,
  currentPlanIndex: 0,
  currentTurnAttemptId: null,
  hintsUsedCount: 0,
  activeHintLevel: 0,
  lastSubmittedAttempt: null,
  submittedAttempts: [],
  emptyReason: null,
  compositionResult: null,
  recoveryError: null,
  closeError: null,
  summaryRecommendation: null,
  guidedProgressRecord: null,
}

export type SessionAction =
  | { type: 'START_CONFIGURING' }
  | { type: 'SESSION_INITIALIZED'; sessionRecord: SessionRecord; sessionPlan: SessionPlan; guidedProgress?: GuidedItemProgressRecord | null }
  | { type: 'SESSION_EMPTY_PLAN'; compositionResult: SessionCompositionResult }
  | {
      type: 'SESSION_RECOVERED'
      sessionRecord: SessionRecord
      sessionPlan: SessionPlan
      submittedAttempts: AttemptRecord[]
      guidedProgress?: GuidedItemProgressRecord | null
    }
  | { type: 'SESSION_RECOVERY_FAILED'; sessionRecord: SessionRecord | null; recoveryError: RecoveryFailureInfo }
  | { type: 'USE_HINT' }
  | { type: 'ATTEMPT_SUBMITTED'; attempt: AttemptRecord; isCompleted: boolean; guidedProgress?: GuidedItemProgressRecord | null }
  | { type: 'CONTINUE_CURRENT_ITEM'; guidedProgress?: GuidedItemProgressRecord | null }
  | { type: 'EXPOSITORY_STAGE_ADVANCED'; guidedProgress: GuidedItemProgressRecord }
  | { type: 'ADVANCE_TO_NEXT_ITEM' }
  | { type: 'SESSION_COMPLETED'; summaryRecommendation?: SummaryRecommendationInfo | null }
  | { type: 'SESSION_CLOSE_FAILED'; error: string }
  | { type: 'EXIT_SESSION' }

export function sessionReducer(state: SessionUIState, action: SessionAction): SessionUIState {
  switch (action.type) {
    case 'START_CONFIGURING':
      return {
        ...INITIAL_SESSION_UI_STATE,
        status: 'configuring',
      }

    case 'SESSION_INITIALIZED':
      return {
        ...state,
        status: 'active',
        sessionRecord: action.sessionRecord,
        sessionPlan: action.sessionPlan,
        currentPlanIndex: 0,
        currentTurnAttemptId: crypto.randomUUID(),
        hintsUsedCount: 0,
        activeHintLevel: 0,
        lastSubmittedAttempt: null,
        submittedAttempts: [],
        emptyReason: null,
        recoveryError: null,
        closeError: null,
        guidedProgressRecord: action.guidedProgress ?? null,
      }

    case 'SESSION_EMPTY_PLAN':
      return {
        ...state,
        status: 'empty_plan',
        compositionResult: action.compositionResult,
      }

    case 'SESSION_RECOVERED': {
      const isCompleted = action.sessionRecord.status === 'completed'
      return {
        ...state,
        status: isCompleted ? 'completed' : 'active',
        sessionRecord: action.sessionRecord,
        sessionPlan: action.sessionPlan,
        currentPlanIndex: action.sessionRecord.currentIndex,
        currentTurnAttemptId: isCompleted ? null : crypto.randomUUID(),
        hintsUsedCount: 0,
        activeHintLevel: 0,
        submittedAttempts: action.submittedAttempts,
        lastSubmittedAttempt: action.submittedAttempts[action.submittedAttempts.length - 1] ?? null,
        recoveryError: null,
        guidedProgressRecord: action.guidedProgress ?? null,
      }
    }

    case 'SESSION_RECOVERY_FAILED':
      return {
        ...state,
        status: 'recovery_error',
        sessionRecord: action.sessionRecord,
        recoveryError: action.recoveryError,
      }

    case 'USE_HINT':
      return {
        ...state,
        hintsUsedCount: state.hintsUsedCount + 1,
        activeHintLevel: state.activeHintLevel + 1,
      }

    case 'ATTEMPT_SUBMITTED': {
      const updatedAttempts = [...state.submittedAttempts, action.attempt]
      return {
        ...state,
        status: 'item_feedback',
        lastSubmittedAttempt: action.attempt,
        submittedAttempts: updatedAttempts,
        ...(action.guidedProgress !== undefined ? { guidedProgressRecord: action.guidedProgress } : {}),
      }
    }

    case 'CONTINUE_CURRENT_ITEM':
      return {
        ...state,
        status: 'active',
        currentTurnAttemptId: crypto.randomUUID(),
        hintsUsedCount: 0,
        activeHintLevel: 0,
        ...(action.guidedProgress !== undefined ? { guidedProgressRecord: action.guidedProgress } : {}),
      }

    case 'EXPOSITORY_STAGE_ADVANCED':
      return {
        ...state,
        guidedProgressRecord: action.guidedProgress,
      }

    case 'ADVANCE_TO_NEXT_ITEM': {
      if (!state.sessionPlan || !state.sessionRecord) return state
      const nextIndex = state.currentPlanIndex + 1
      const isCompleted = nextIndex >= state.sessionPlan.items.length

      return {
        ...state,
        status: isCompleted ? 'completed' : 'active',
        currentPlanIndex: nextIndex,
        currentTurnAttemptId: isCompleted ? null : crypto.randomUUID(),
        hintsUsedCount: 0,
        activeHintLevel: 0,
        sessionRecord: {
          ...state.sessionRecord,
          currentIndex: nextIndex,
          status: isCompleted ? 'completed' : 'active',
        },
      }
    }

    case 'SESSION_COMPLETED':
      return {
        ...state,
        status: 'completed',
        closeError: null,
        summaryRecommendation: action.summaryRecommendation ?? null,
      }

    case 'SESSION_CLOSE_FAILED':
      return {
        ...state,
        closeError: action.error,
      }

    case 'EXIT_SESSION':
      return INITIAL_SESSION_UI_STATE

    default:
      return state
  }
}
