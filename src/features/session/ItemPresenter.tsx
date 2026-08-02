import type { SyntheticEvent } from 'react'
import { useState, useEffect, useMemo } from 'react'
import type { ContentItem } from '../../domain/content/types'
import { getStageCapabilities } from '../../domain/evaluation/guidedEvaluator'
import { validateResponsePresent } from '../../domain/evaluation/responseValidation'
import { deriveActiveGuidedStage, type GuidedItemProgressRecord } from '../../domain/learning/guidedState'

import { useMechanicalCapture } from './useMechanicalCapture'
import type { EvaluationOptions } from '../../domain/evaluation/types'

interface ItemPresenterProps {
  item: ContentItem
  activeHintLevel: number
  disabled?: boolean
  onSubmitResponse: (responseRaw: unknown, durationMs?: number, options?: EvaluationOptions) => void
  onUseHint?: () => void
  onAdvanceGuidedStage?: (stageId: string) => void | Promise<void>
  guidedProgress?: GuidedItemProgressRecord | null
  attemptsCountForActiveStage?: number
}

export function ItemPresenter({
  item,
  activeHintLevel,
  disabled = false,
  onSubmitResponse,
  onAdvanceGuidedStage,
  guidedProgress = null,
  attemptsCountForActiveStage = 0,
}: ItemPresenterProps) {
  const mechanicalCapture = useMechanicalCapture()
  const { resetCapture } = mechanicalCapture
  const [pasteNotice, setPasteNotice] = useState(false)
  // Reset del hook de captura al cambiar de ítem
  useEffect(() => {
    setTextInput('')
    setPasteNotice(false)
    setValidationError(null)
    resetCapture()
  }, [item.itemId, resetCapture])

  // Estado local de respuesta según el tipo de ítem
  const [textInput, setTextInput] = useState('')
  const [singleChoiceId, setSingleChoiceId] = useState('')
  const [multipleChoiceIds, setMultipleChoiceIds] = useState<string[]>([])
  const [orderedChoiceIds, setOrderedChoiceIds] = useState<string[]>(() => {
    if (item.kind === 'exact_question' && item.answerType === 'ordered_steps' && item.options) {
      return item.options.map((o) => o.optionId)
    }
    return []
  })
  const [openText, setOpenText] = useState('')
  const [selectedDecisionChoiceId, setSelectedDecisionChoiceId] = useState('')
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([])
  const [validationError, setValidationError] = useState<string | null>(null)

  // Derivar la etapa activa actual para ítems guided
  const activeStageResult = useMemo(() => {
    if (item.kind !== 'guided_practice') return null
    return deriveActiveGuidedStage(item, guidedProgress)
  }, [item, guidedProgress])

  const activeStage = activeStageResult?.activeStage

  // Ocultar pistas si la etapa activa es unassisted_exercise (Mandato 6)
  const isUnassistedStage = activeStage?.stageType === 'unassisted_exercise'
  const visibleHints = isUnassistedStage ? [] : item.hints.slice(0, activeHintLevel)

  function constructResponseRaw(): unknown {
    switch (item.kind) {
      case 'typing_copy':
        return textInput
      case 'command_intention':
        return textInput
      case 'exact_question':
        if (item.answerType === 'single_choice') {
          return singleChoiceId
        }
        if (item.answerType === 'multiple_choice') {
          return multipleChoiceIds
        }
        if (item.answerType === 'short_exact') {
          return textInput
        }
        return orderedChoiceIds
      case 'open_question':
        return openText
      case 'decision':
        return {
          selectedChoiceIds: selectedDecisionChoiceId ? [selectedDecisionChoiceId] : [],
          selectedEvidenceIds,
        }
      case 'guided_practice':
        if (activeStage) {
          return {
            stageId: activeStage.stageId,
            responseRaw: textInput,
          }
        }
        return {
          stageId: 'invalid-stage-not-found',
          responseRaw: textInput,
        }
    }
  }

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()

    const rawResponse = constructResponseRaw()
    const validation = validateResponsePresent(item, rawResponse)

    if (!validation.isValid) {
      setValidationError(validation.errorMessage ?? 'Respuesta requerida para enviar.')
      resetCapture()
      const targetId = validation.targetElementId
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId)
          if (el) {
            el.focus()
          }
        }, 0)
      }
      return
    }

    setValidationError(null)

    if (item.kind === 'typing_copy') {
      mechanicalCapture.markSubmitting()
      const declaredSeqs = item.mechanicalSequences.map((s) => (typeof s === 'string' ? s : s.value))
      const obs = mechanicalCapture.consolidate(item.targetText, textInput, declaredSeqs)
      try {
        onSubmitResponse(rawResponse, undefined, { mechanicalObservation: obs })
      } catch (err) {
        resetCapture()
        throw err
      }
    } else if (item.kind === 'guided_practice' && activeStage) {
      try {
        onSubmitResponse(rawResponse, undefined, { guidedStageId: activeStage.stageId })
      } catch (err) {
        resetCapture()
        throw err
      }
    } else {
      try {
        onSubmitResponse(rawResponse)
      } catch (err) {
        resetCapture()
        throw err
      }
    }
  }

  function handleAdvanceExpositoryStage() {
    if (item.kind !== 'guided_practice' || !activeStage) return
    void onAdvanceGuidedStage?.(activeStage.stageId)
    setTextInput('')
    setTimeout(() => {
      const heading = document.getElementById('guided-stage-title')
      if (heading) heading.focus()
    }, 0)
  }

  const isExpositoryStage =
    activeStage && !getStageCapabilities(activeStage.stageType).requiresAttempt

  return (
    <div className="item-presenter" role="region" aria-label={`Ejercicio: ${item.title}`}>
      <div className="item-presenter-header">
        <span className="badge badge--info">{item.kind.toUpperCase()}</span>
        <h2 className="item-title">{item.title}</h2>
      </div>

      <div className="item-context-box">
        <p className="item-context">{item.context}</p>
        <p className="item-task">
          <strong>Consigna:</strong> {item.task}
        </p>
      </div>

      {visibleHints.length > 0 && (
        <div className="hints-box notice-box notice-box--info" role="region" aria-label="Pistas activadas">
          <h4>Pistas ({visibleHints.length} de {item.hints.length}):</h4>
          <ul>
            {visibleHints.map((hint) => (
              <li key={hint.hintId}>
                <strong>Nivel {hint.level}:</strong> {hint.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationError && (
        <div className="alert alert--danger mb-3" role="alert">
          {validationError}
        </div>
      )}

      {pasteNotice && (
        <div className="notice-box notice-box--warning mb-3" role="status">
          ⚠️ Pegado detectado: Se registrará métrica de pegado en el perfil.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {item.kind === 'typing_copy' && (
          <div className="input-group">
            <div className="target-text-display mb-2 text-mono p-2 bg-subtle" id="typing-target">
              {item.targetText}
            </div>
            <input
              id="typing-input"
              type="text"
              className="form-control text-mono"
              value={textInput}
              onChange={(e) => {
                setValidationError(null)
                setTextInput(e.target.value)
              }}
              onKeyDown={mechanicalCapture.handleKeyDown}
              onInput={mechanicalCapture.handleInput}
              onPaste={() => {
                setPasteNotice(true)
                mechanicalCapture.handlePaste()
              }}
              onBlur={mechanicalCapture.handleBlur}
              disabled={disabled}
              placeholder="Escribí el valor exacto..."
              autoFocus
              autoComplete="off"
            />
          </div>
        )}

        {item.kind === 'command_intention' && (
          <div className="input-group">
            <label htmlFor="command-input" className="input-label">
              Comando Bash:
            </label>
            <input
              id="command-input"
              type="text"
              className="form-control text-mono"
              value={textInput}
              onChange={(e) => {
                setValidationError(null)
                setTextInput(e.target.value)
              }}
              disabled={disabled}
              placeholder="Escribí el comando..."
              autoFocus
              autoComplete="off"
            />
          </div>
        )}

        {item.kind === 'exact_question' && item.answerType === 'single_choice' && item.options && (
          <div className="input-group" role="radiogroup" aria-label="Opciones de respuesta única">
            {item.options.map((opt) => (
              <label key={opt.optionId} className="radio-label block mb-2">
                <input
                  type="radio"
                  name="singleChoice"
                  value={opt.optionId}
                  checked={singleChoiceId === opt.optionId}
                  onChange={() => {
                    setValidationError(null)
                    setSingleChoiceId(opt.optionId)
                  }}
                  disabled={disabled}
                />
                <span className="radio-text">{opt.text}</span>
              </label>
            ))}
          </div>
        )}

        {item.kind === 'exact_question' && item.answerType === 'multiple_choice' && item.options && (
          <div className="input-group" role="group" aria-label="Opciones de respuesta múltiple">
            {item.options.map((opt) => (
              <label key={opt.optionId} className="checkbox-label block mb-2">
                <input
                  type="checkbox"
                  value={opt.optionId}
                  checked={multipleChoiceIds.includes(opt.optionId)}
                  onChange={(e) => {
                    setValidationError(null)
                    if (e.target.checked) {
                      setMultipleChoiceIds([...multipleChoiceIds, opt.optionId])
                    } else {
                      setMultipleChoiceIds(multipleChoiceIds.filter((id) => id !== opt.optionId))
                    }
                  }}
                  disabled={disabled}
                />
                <span className="checkbox-text">{opt.text}</span>
              </label>
            ))}
          </div>
        )}

        {item.kind === 'exact_question' && item.answerType === 'short_exact' && (
          <div className="input-group">
            <label htmlFor="short-exact-input" className="input-label">
              Respuesta exacta:
            </label>
            <input
              id="short-exact-input"
              type="text"
              className="form-control text-mono"
              value={textInput}
              onChange={(e) => {
                setValidationError(null)
                setTextInput(e.target.value)
              }}
              disabled={disabled}
              placeholder="Escribí la respuesta exacta..."
              autoFocus
              autoComplete="off"
            />
          </div>
        )}

        {item.kind === 'exact_question' && item.answerType === 'ordered_steps' && (
          <div className="input-group" role="group" aria-label="Reordenar pasos en secuencia correcta">
            <p className="input-label">Ordená los pasos de arriba hacia abajo:</p>
            <ol className="ordered-steps-list">
              {orderedChoiceIds.map((optId, idx) => {
                const optObj = item.options?.find((o) => o.optionId === optId)
                return (
                  <li key={optId} className="ordered-step-item flex items-center gap-2 mb-2 p-2 bg-subtle border rounded">
                    <span className="step-number font-bold">{idx + 1}.</span>
                    <span className="step-text flex-grow">{optObj?.text ?? optId}</span>
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => {
                        if (idx === 0) return
                        const next = [...orderedChoiceIds]
                        const prevItem = next[idx - 1]
                        const currItem = next[idx]
                        if (prevItem !== undefined && currItem !== undefined) {
                          next[idx - 1] = currItem
                          next[idx] = prevItem
                          setOrderedChoiceIds(next)
                        }
                      }}
                      disabled={disabled || idx === 0}
                      aria-label={`Mover "${optObj?.text ?? optId}" hacia arriba`}
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm"
                      onClick={() => {
                        if (idx === orderedChoiceIds.length - 1) return
                        const next = [...orderedChoiceIds]
                        const nextItem = next[idx + 1]
                        const currItem = next[idx]
                        if (nextItem !== undefined && currItem !== undefined) {
                          next[idx + 1] = currItem
                          next[idx] = nextItem
                          setOrderedChoiceIds(next)
                        }
                      }}
                      disabled={disabled || idx === orderedChoiceIds.length - 1}
                      aria-label={`Mover "${optObj?.text ?? optId}" hacia abajo`}
                    >
                      ▼
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        {item.kind === 'open_question' && (
          <div className="input-group">
            <label htmlFor="open-question-textarea" className="input-label">
              Respuesta libre:
            </label>
            <textarea
              id="open-question-textarea"
              className="form-control"
              rows={4}
              value={openText}
              onChange={(e) => {
                setValidationError(null)
                setOpenText(e.target.value)
              }}
              disabled={disabled}
              placeholder="Escribí tu respuesta justificada aquí..."
            />
            <span className="character-counter text-subtle text-sm">
              Caracteres: {openText.length} / {String(item.maxResponse.characters)}
            </span>

            <div className="rubric-box notice-box notice-box--info mt-3" role="region" aria-label="Rúbrica de autoevaluación">
              <h4>Rúbrica de orientación:</h4>
              <p>
                <strong>Criterio:</strong> {item.rubric.verificationCriterion}
              </p>
              {item.rubric.essentialElements.length > 0 && (
                <div>
                  <strong>Elementos recomendados:</strong>
                  <ul>
                    {item.rubric.essentialElements.map((el, rIdx) => (
                      <li key={rIdx}>{el}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {item.kind === 'decision' && (
          <div className="input-group">
            {item.evidence.length > 0 && (
              <div className="evidence-section mb-3">
                <p className="input-label">Evidencia disponible (seleccioná las aplicables):</p>
                {item.evidence.map((ev) => (
                  <label key={ev.evidenceId} className="checkbox-label block mb-2">
                    <input
                      type="checkbox"
                      value={ev.evidenceId}
                      checked={selectedEvidenceIds.includes(ev.evidenceId)}
                      onChange={(e) => {
                        setValidationError(null)
                        if (e.target.checked) {
                          setSelectedEvidenceIds([...selectedEvidenceIds, ev.evidenceId])
                        } else {
                          setSelectedEvidenceIds(selectedEvidenceIds.filter((id) => id !== ev.evidenceId))
                        }
                      }}
                      disabled={disabled}
                    />
                    <span className="checkbox-text">{ev.text}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="choices-section" role="radiogroup" aria-label="Elección táctica de decisión">
              <p className="input-label">Elección táctica (opción única):</p>
              {item.choices.map((ch) => (
                <label key={ch.choiceId} className="radio-label block mb-2">
                  <input
                    type="radio"
                    name="decisionChoice"
                    value={ch.choiceId}
                    checked={selectedDecisionChoiceId === ch.choiceId}
                    onChange={() => {
                      setValidationError(null)
                      setSelectedDecisionChoiceId(ch.choiceId)
                    }}
                    disabled={disabled}
                  />
                  <span className="radio-text">{ch.text}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {item.kind === 'guided_practice' && (
          <div className="input-group">
            {activeStageResult?.activeStage ? (
              <>
                <div className="guided-summary">
                  <h3 id="guided-stage-title" tabIndex={-1} className="guided-stage-heading font-bold text-lg mb-2">
                    Etapa {activeStageResult.activeStageIndex + 1} de{' '}
                    {activeStageResult.immediateStagesCount} —{' '}
                    {activeStageResult.activeStage.title}
                  </h3>
                  <div className="guided-content p-3 bg-subtle rounded border mb-3">{activeStageResult.activeStage.content}</div>
                </div>

                {!isExpositoryStage && (
                  <>
                    {attemptsCountForActiveStage >= 1 && (
                      <div className="notice-box notice-box--warning mb-3" role="status">
                        💡 Corrección asistida (2.º intento) — Probá ajustar tu respuesta o aplicá la pista.
                      </div>
                    )}
                    <label htmlFor="guided-input" className="input-label">
                      Respuesta:
                    </label>
                    <input
                      id="guided-input"
                      type="text"
                      className="form-control text-mono"
                      value={textInput}
                      onChange={(e) => {
                        setValidationError(null)
                        setTextInput(e.target.value)
                      }}
                      disabled={disabled}
                      placeholder="Escribí la respuesta de la etapa..."
                      autoFocus
                      autoComplete="off"
                    />
                  </>
                )}
              </>
            ) : (
              <div className="notice-box notice-box--success" role="status">
                ✔ Secuencia guiada completada.
              </div>
            )}
          </div>
        )}

        <div className="item-submit-row">
          {item.kind === 'guided_practice' && isExpositoryStage ? (
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAdvanceExpositoryStage}
              disabled={disabled}
            >
              Continuar
            </button>
          ) : (
            <button type="submit" className="btn btn--primary" disabled={disabled || Boolean(activeStageResult?.isCompleted)}>
              Enviar respuesta
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
