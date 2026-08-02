import type { SyntheticEvent } from 'react'
import { useState, useEffect } from 'react'
import type { ContentItem } from '../../domain/content/types'
import { getStageCapabilities } from '../../domain/evaluation/guidedEvaluator'
import { validateResponsePresent } from '../../domain/evaluation/responseValidation'

import { useMechanicalCapture } from './useMechanicalCapture'
import type { EvaluationOptions } from '../../domain/evaluation/types'

interface ItemPresenterProps {
  item: ContentItem
  activeHintLevel: number
  disabled?: boolean
  onSubmitResponse: (responseRaw: unknown, durationMs?: number, options?: EvaluationOptions) => void
  onUseHint?: () => void
}

export function ItemPresenter({
  item,
  activeHintLevel,
  disabled = false,
  onSubmitResponse,
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

  // Pistas visibles según el activeHintLevel
  const visibleHints = item.hints.slice(0, activeHintLevel)

  // Encontrar dinámicamente la etapa evaluable para ítems guided sin hardcodear índices o IDs
  const evaluableStage =
    item.kind === 'guided_practice'
      ? item.stages.find((s) => getStageCapabilities(s.stageType).requiresAttempt)
      : undefined

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
        if (evaluableStage) {
          return {
            stageId: evaluableStage.stageId,
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
    } else {
      onSubmitResponse(rawResponse)
    }
  }

  function toggleEvidence(evId: string) {
    setValidationError(null)
    if (selectedEvidenceIds.includes(evId)) {
      setSelectedEvidenceIds(selectedEvidenceIds.filter((id) => id !== evId))
    } else {
      setSelectedEvidenceIds([...selectedEvidenceIds, evId])
    }
  }

  return (
    <div className="item-presenter" role="region" aria-label={`Ítem: ${item.title}`}>
      <header className="item-header">
        <span className="item-badge">{item.kind}</span>
        <h3 className="item-title">{item.title}</h3>
      </header>

      {item.context && <p className="item-context">{item.context}</p>}

      {item.task && (
        <div className="item-task-box">
          <strong>Tarea:</strong> {item.task}
        </div>
      )}

      {visibleHints.length > 0 && (
        <div className="hints-box" role="region" aria-label="Pistas activadas">
          <h4>Pistas ({visibleHints.length}):</h4>
          <ul>
            {visibleHints.map((h) => (
              <li key={h.hintId} className="hint-item">
                {h.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationError && (
        <div className="notice-box notice-box--danger" role="alert" aria-live="assertive">
          <strong>Respuesta requerida:</strong> {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="item-form">
        {/* Render según el kind del walking skeleton */}
        {item.kind === 'typing_copy' && (
          <div className="input-group">
            {pasteNotice && (
              <div className="notice-box notice-box--info" role="status">
                ℹ Pegado detectado. Se evaluará la precisión final pero no alimentará el perfil de fricción.
              </div>
            )}
            <label htmlFor="typing-input" className="input-label">
              Texto a copiar:
            </label>
            <pre id="typing-target" className="code-display">
              {item.targetText}
            </pre>
            <label htmlFor="typing-input" className="input-label">
              Tu respuesta:
            </label>
            <input
              id="typing-input"
              type="text"
              className="form-control text-mono"
              value={textInput}
              onKeyDown={mechanicalCapture.handleKeyDown}
              onBeforeInput={mechanicalCapture.handleBeforeInput}
              onInput={mechanicalCapture.handleInput}
              onPaste={() => {
                setPasteNotice(true)
                mechanicalCapture.handlePaste()
              }}
              onBlur={mechanicalCapture.handleBlur}
              onCompositionStart={mechanicalCapture.handleCompositionStart}
              onCompositionEnd={mechanicalCapture.handleCompositionEnd}
              onChange={(e) => {
                setValidationError(null)
                setTextInput(e.target.value)
              }}
              disabled={disabled}
              placeholder="Escribí aquí exactamente..."
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

        {item.kind === 'exact_question' && (
          <div id="exact-options-group" tabIndex={-1} className="input-group">
            {item.answerType === 'single_choice' && item.options && (
              <div role="radiogroup" aria-label="Opciones de respuesta" className="options-stack">
                {item.options.map((opt, idx) => (
                  <label key={opt.optionId} className="radio-card">
                    <input
                      id={`exact-option-${String(idx)}`}
                      type="radio"
                      name="exactOption"
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

            {item.answerType === 'multiple_choice' && item.options && (
              <div role="group" aria-label="Selección múltiple de opciones" className="options-stack">
                {item.options.map((opt, idx) => (
                  <label key={opt.optionId} className="checkbox-card">
                    <input
                      id={`exact-option-${String(idx)}`}
                      type="checkbox"
                      value={opt.optionId}
                      checked={multipleChoiceIds.includes(opt.optionId)}
                      onChange={() => {
                        setValidationError(null)
                        if (multipleChoiceIds.includes(opt.optionId)) {
                          setMultipleChoiceIds(multipleChoiceIds.filter((id) => id !== opt.optionId))
                        } else {
                          setMultipleChoiceIds([...multipleChoiceIds, opt.optionId])
                        }
                      }}
                      disabled={disabled}
                    />
                    <span className="checkbox-text">{opt.text}</span>
                  </label>
                ))}
              </div>
            )}

            {item.answerType === 'short_exact' && (
              <div className="input-group">
                <label htmlFor="exact-short-input" className="input-label">
                  Respuesta exacta:
                </label>
                <input
                  id="exact-short-input"
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

            {item.answerType === 'ordered_steps' && item.options && (
              <div className="ordered-steps-group" aria-label="Ordenamiento de pasos">
                <p className="section-label">Ordená las etapas con los botones Subir / Bajar:</p>
                <ol className="ordered-steps-list">
                  {orderedChoiceIds.map((optId, idx) => {
                    const optObj = item.options?.find((o) => o.optionId === optId)
                    return (
                      <li key={optId} className="ordered-step-item">
                        <span className="step-number">{idx + 1}.</span>
                        <span className="step-text">{optObj?.text ?? optId}</span>
                        <div className="step-actions">
                          <button
                            type="button"
                            className="btn btn--small"
                            onClick={() => {
                              setValidationError(null)
                              if (idx > 0) {
                                const next = [...orderedChoiceIds]
                                const curr = next[idx]
                                const prev = next[idx - 1]
                                if (curr !== undefined && prev !== undefined) {
                                  next[idx] = prev
                                  next[idx - 1] = curr
                                  setOrderedChoiceIds(next)
                                }
                              }
                            }}
                            disabled={disabled || idx === 0}
                            aria-label={`Subir paso ${String(idx + 1)}`}
                          >
                            ▲ Subir
                          </button>
                          <button
                            type="button"
                            className="btn btn--small"
                            onClick={() => {
                              setValidationError(null)
                              if (idx < orderedChoiceIds.length - 1) {
                                const next = [...orderedChoiceIds]
                                const curr = next[idx]
                                const nextEl = next[idx + 1]
                                if (curr !== undefined && nextEl !== undefined) {
                                  next[idx] = nextEl
                                  next[idx + 1] = curr
                                  setOrderedChoiceIds(next)
                                }
                              }
                            }}
                            disabled={disabled || idx === orderedChoiceIds.length - 1}
                            aria-label={`Bajar paso ${String(idx + 1)}`}
                          >
                            ▼ Bajar
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </div>
            )}
          </div>
        )}

        {item.kind === 'open_question' && (
          <div className="input-group">
            <div className="notice-box notice-box--info" role="status">
              ℹ Esta respuesta se registrará como <strong>pendiente de revisión</strong>.
            </div>
            <label htmlFor="open-textarea" className="input-label">
              Tu explicación:
            </label>
            <textarea
              id="open-textarea"
              className="form-control textarea-input"
              rows={item.maxResponse.lines ?? 4}
              maxLength={item.maxResponse.characters}
              value={openText}
              onChange={(e) => {
                setValidationError(null)
                setOpenText(e.target.value)
              }}
              disabled={disabled}
              placeholder="Explicá tu análisis en 2 o 3 frases..."
              autoFocus
            />
            {item.maxResponse.characters !== undefined && (
              <div className="char-counter" aria-live="polite">
                {String(openText.length)} / {String(item.maxResponse.characters)} caracteres
              </div>
            )}
          </div>
        )}

        {item.kind === 'decision' && (
          <div className="input-group">
            {Array.isArray(item.evidence) && item.evidence.length > 0 && (
              <div id="decision-evidence-group" tabIndex={-1} className="evidence-section">
                <p className="section-label">Evidencia observada:</p>
                {item.evidence.map((ev, idx) => (
                  <label key={ev.evidenceId} className="checkbox-card">
                    <input
                      id={`decision-evidence-${String(idx)}`}
                      type="checkbox"
                      checked={selectedEvidenceIds.includes(ev.evidenceId)}
                      onChange={() => {
                        toggleEvidence(ev.evidenceId)
                      }}
                      disabled={disabled}
                    />
                    <span className="checkbox-text">{ev.text}</span>
                  </label>
                ))}
              </div>
            )}

            <div
              id="decision-choices-group"
              tabIndex={-1}
              className="choices-section"
              role="radiogroup"
              aria-label="Opciones de decisión"
            >
              <p className="section-label">Seleccioná tu decisión:</p>
              {item.choices.map((ch, idx) => (
                <label key={ch.choiceId} htmlFor={`decision-choice-${String(idx)}`} className="radio-card">
                  <input
                    id={`decision-choice-${String(idx)}`}
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
            {evaluableStage ? (
              <>
                <div className="guided-summary">
                  <p>
                    <strong>Etapa activa:</strong> {evaluableStage.title}
                  </p>
                  <p className="guided-content">{evaluableStage.content}</p>
                </div>
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
            ) : (
              <div className="notice-box notice-box--danger" role="alert">
                No se encontró una etapa evaluable compatible en este ítem guiado.
              </div>
            )}
          </div>
        )}

        <div className="item-submit-row">
          <button type="submit" className="btn btn--primary" disabled={disabled}>
            Enviar respuesta
          </button>
        </div>
      </form>
    </div>
  )
}
