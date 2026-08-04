import { useState, useEffect } from 'react'
import type { SessionUIState } from './sessionReducer'
import { ItemPresenter } from './ItemPresenter'
import { ItemFeedbackView } from './ItemFeedbackView'
import { SessionSummaryView } from './SessionSummaryView'

import { deriveActiveGuidedStage, type GuidedItemProgressRecord } from '../../domain/learning/guidedState'
import { advanceExpositoryGuidedStage } from '../../data/services/transactionalSessionService'
import type { TypeOpsDatabase } from '../../data/db/database'
import type { EvaluationOptions } from '../../domain/evaluation/types'

interface SessionRunnerViewProps {
  state: SessionUIState
  onSubmitResponse: (responseRaw: unknown, durationMs: number, options?: EvaluationOptions) => void
  onUseHint: () => void
  onAdvanceExpositoryStage?: (stageId: string) => void
  onAdvanceNextItem: () => void
  onFinishSession: () => void
  onExitSession: (saveAsAbandoned?: boolean) => void
  onRetryCloseSession?: () => void
  onStartTargetGuided?: (targetItemId: string) => void
  db?: TypeOpsDatabase | undefined
}

export function SessionRunnerView({
  state,
  onSubmitResponse,
  onUseHint,
  onAdvanceExpositoryStage,
  onAdvanceNextItem,
  onFinishSession,
  onExitSession,
  onRetryCloseSession,
  onStartTargetGuided,
  db,
}: SessionRunnerViewProps) {
  const [showExitModal, setShowExitModal] = useState(false)
  const [itemStartTime, setItemStartTime] = useState<number>(Date.now())
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number | null>(null)
  const [guidedProgressRecord, setGuidedProgressRecord] = useState<GuidedItemProgressRecord | null>(null)

  const currentPlanItem = state.sessionPlan?.items[state.currentPlanIndex]
  const currentItem = currentPlanItem?.item
  const totalItems = state.sessionPlan?.items.length ?? 0

  useEffect(() => {
    if (currentItem?.kind !== 'guided_practice' || !db || !state.sessionRecord) {
      setGuidedProgressRecord(null)
      return
    }
    const key = `${state.sessionRecord.packId}:${state.sessionRecord.packVersion}:${currentItem.itemId}`
    void db.guidedProgress.get(key).then((rec) => {
      setGuidedProgressRecord(rec ?? null)
    })
  }, [currentItem, db, state.sessionRecord, state.submittedAttempts, state.status])

  // Actualizar inicio de tiempo por ítem cuando cambia el índice
  useEffect(() => {
    setItemStartTime(Date.now())
  }, [state.currentPlanIndex])

  // Temporizador autoritativo derivado de deadlineAt
  useEffect(() => {
    if (!state.sessionRecord?.deadlineAt || state.status !== 'active') {
      setRemainingTimeSeconds(null)
      return
    }

    const deadlineMs = new Date(state.sessionRecord.deadlineAt).getTime()

    function updateTimer() {
      const diffMs = deadlineMs - Date.now()
      if (diffMs <= 0) {
        setRemainingTimeSeconds(0)
        onFinishSession()
      } else {
        setRemainingTimeSeconds(Math.ceil(diffMs / 1000))
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [state.sessionRecord?.deadlineAt, state.status, onFinishSession])

  // Accesos directos de teclado complementarios (protegidos dentro de inputs)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const isInputOrTextarea = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')

      if (e.key === 'Escape') {
        e.preventDefault()
        setShowExitModal(true)
        return
      }

      if (isInputOrTextarea) return

      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        const canHaveHints = currentItem && currentItem.kind !== 'typing_copy' && currentItem.hints.length > 0
        if (canHaveHints && state.activeHintLevel < currentItem.hints.length) {
          onUseHint()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentItem, state.activeHintLevel, onUseHint])

  function handleFormSubmit(responseRaw: unknown, _?: number, options?: EvaluationOptions) {
    const durationMs = Date.now() - itemStartTime
    onSubmitResponse(responseRaw, durationMs, options)
  }

  function handleSkipItem() {
    handleFormSubmit({ isSkipped: true })
  }

  const handleAdvanceGuidedStage = async (stageId: string) => {
    if (onAdvanceExpositoryStage) {
      onAdvanceExpositoryStage(stageId)
      return
    }
    if (!db || !state.sessionRecord || !currentItem || currentItem.kind !== 'guided_practice') return
    const res = await advanceExpositoryGuidedStage({
      db,
      sessionId: state.sessionRecord.sessionId,
      item: currentItem,
      packId: state.sessionRecord.packId,
      packVersion: state.sessionRecord.packVersion,
      stageId,
    })
    setGuidedProgressRecord(res.guidedProgress)
  }

  const effectiveGuidedProgress = state.guidedProgressRecord ?? guidedProgressRecord
  const activeStageResult = currentItem?.kind === 'guided_practice' ? deriveActiveGuidedStage(currentItem, effectiveGuidedProgress) : null
  const activeStageId = activeStageResult?.activeStage?.stageId
  const attemptsCountForActiveStage = activeStageId
    ? state.submittedAttempts.filter((a) => a.itemId === currentItem?.itemId && a.guidedStageId === activeStageId).length
    : 0

  if (state.status === 'empty_plan') {
    const compRes = state.compositionResult
    return (
      <div className="session-empty-view" role="region" aria-label="Sin plan de sesión">
        <h2>No hay actividades disponibles</h2>

        {compRes?.status === 'missing_learning_evidence' && (
          <div className="empty-plan-detail">
            <p>No podés evaluar este contenido sin haber completado su introducción guiada previa:</p>
            <ul>
              {compRes.blockedUnits.map((b) => (
                <li key={b.unitId}>
                  <strong>{b.unitTitle}</strong> ({b.requirementType === 'own_unit' ? 'Unidad propia' : 'Prerrequisito'})
                </li>
              ))}
            </ul>
            {compRes.targetGuidedItemId && onStartTargetGuided && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const itemToStart = compRes.targetGuidedItemId
                  if (itemToStart) {
                    onStartTargetGuided(itemToStart)
                  }
                }}
              >
                Iniciar Práctica Guiada de la Unidad
              </button>
            )}
          </div>
        )}

        {compRes?.status === 'guided_path_unavailable' && (
          <div className="empty-plan-detail">
            <p>La siguiente unidad requerida no posee recorrido guiado en este pack:</p>
            <ul>
              {compRes.blockedUnits.map((b) => (
                <li key={b.unitId}>
                  <strong>{b.unitTitle}</strong> — Podés marcar conocimiento previo si ya conocés este tema.
                </li>
              ))}
            </ul>
          </div>
        )}

        {compRes?.status === 'no_content_for_category' && (
          <p>No hay actividades disponibles en la categoría &apos;{compRes.category}&apos;.</p>
        )}

        {(!compRes || compRes.status === 'no_eligible_items') && (
          <p>{state.emptyReason ?? 'La configuración seleccionada no produjo candidatos elegibles.'}</p>
        )}

        <div className="empty-plan-actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              onExitSession(false)
            }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  if (state.status === 'recovery_error') {
    return (
      <div className="session-error-view" role="region" aria-label="Error de recuperación">
        <h2>Imposible reanudar la sesión</h2>
        <p>{state.recoveryError?.message ?? 'Falta contenido en el catálogo local para reanudar esta sesión.'}</p>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            onExitSession(false)
          }}
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  if (state.status === 'completed') {
    return (
      <SessionSummaryView
        sessionRecord={state.sessionRecord}
        submittedAttempts={state.submittedAttempts}
        summaryRecommendation={state.summaryRecommendation}
        onFinish={() => {
          onExitSession(false)
        }}
        {...(onRetryCloseSession ? { onRetryClose: onRetryCloseSession } : {})}
        {...(state.closeError ? { closeError: state.closeError } : {})}
      />
    )
  }

  return (
    <div className="session-runner-view" role="region" aria-label="Sesión interactiva en curso">
      {/* Header de la sesión activa */}
      <header className="runner-header">
        <div className="runner-header-info">
          <span className="runner-mode-badge">{state.sessionRecord?.mode}</span>
          <span className="runner-counter">
            Ejercicio {state.currentPlanIndex + 1} de {totalItems}
          </span>
        </div>

        {remainingTimeSeconds !== null && (
          <div className="runner-timer" aria-label="Tiempo restante">
            ⏱ {Math.floor(remainingTimeSeconds / 60)}:
            {String(remainingTimeSeconds % 60).padStart(2, '0')}
          </div>
        )}

        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => {
            setShowExitModal(true)
          }}
          aria-label="Salir anticipadamente"
        >
          Salir (Esc)
        </button>
      </header>

      {/* Contenido principal: presentación o feedback */}
      <main className="runner-main">
        {state.status === 'active' && currentItem && (
          <>
            <ItemPresenter
              item={currentItem}
              activeHintLevel={state.activeHintLevel}
              onSubmitResponse={handleFormSubmit}
              onAdvanceGuidedStage={handleAdvanceGuidedStage}
              guidedProgress={effectiveGuidedProgress}
              attemptsCountForActiveStage={attemptsCountForActiveStage}
            />

            {/* Fila de controles de acción secundarios (HTML botones reales - AC-25) */}
            <div className="runner-controls-bar">
              {currentItem.kind !== 'typing_copy' && currentItem.hints.length > 0 && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={onUseHint}
                  disabled={currentItem.hints.length - state.activeHintLevel <= 0}
                  aria-label={
                    currentItem.hints.length - state.activeHintLevel > 0
                      ? 'Pedir pista (Alt+H)'
                      : 'No quedan más pistas disponibles para este ejercicio'
                  }
                >
                  {currentItem.hints.length - state.activeHintLevel > 0
                    ? `Pedir pista (${String(currentItem.hints.length - state.activeHintLevel)} restantes)`
                    : 'Sin más pistas disponibles'}
                </button>
              )}

              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleSkipItem}
                aria-label="Omitir ejercicio"
              >
                Omitir ejercicio
              </button>
            </div>
          </>
        )}

        {state.status === 'item_feedback' && currentItem && state.lastSubmittedAttempt && (
          <ItemFeedbackView
            item={currentItem}
            evaluationResult={state.lastSubmittedAttempt.evaluationResult}
            onContinue={onAdvanceNextItem}
          />
        )}
      </main>

      {/* Modal de confirmación de salida (AC-25) */}
      {showExitModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <h3 id="modal-title">¿Deseás salir de la sesión?</h3>
            <p>Se conservarán los intentos que ya enviaste hasta el momento.</p>
            <div className="modal-actions-row">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setShowExitModal(false)
                }}
                autoFocus
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  setShowExitModal(false)
                  onExitSession(true)
                }}
              >
                Confirmar salida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
