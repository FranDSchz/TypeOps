import type { SyntheticEvent } from 'react'
import { useState } from 'react'
import type { ContentItem } from '../../domain/content/types'
import { getStageCapabilities } from '../../domain/evaluation/guidedEvaluator'

interface ItemPresenterProps {
  item: ContentItem
  activeHintLevel: number
  onSubmitResponse: (responseRaw: unknown) => void
  disabled?: boolean
}

export function ItemPresenter({ item, activeHintLevel, onSubmitResponse, disabled }: ItemPresenterProps) {
  // Estado local de respuesta según el tipo de ítem
  const [textInput, setTextInput] = useState('')
  const [singleChoiceId, setSingleChoiceId] = useState('')
  const [openText, setOpenText] = useState('')
  const [selectedDecisionChoiceId, setSelectedDecisionChoiceId] = useState('')
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([])

  // Pistas visibles según el activeHintLevel
  const visibleHints = item.hints.slice(0, activeHintLevel)

  // Encontrar dinámicamente la etapa evaluable para ítems guided sin hardcodear índices o IDs
  const evaluableStage =
    item.kind === 'guided_practice'
      ? item.stages.find((s) => getStageCapabilities(s.stageType).requiresAttempt)
      : undefined

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()

    switch (item.kind) {
      case 'typing_copy':
        onSubmitResponse(textInput)
        break
      case 'command_intention':
        onSubmitResponse(textInput)
        break
      case 'exact_question':
        onSubmitResponse(singleChoiceId)
        break
      case 'open_question':
        onSubmitResponse(openText)
        break
      case 'decision':
        onSubmitResponse({
          selectedChoiceIds: selectedDecisionChoiceId ? [selectedDecisionChoiceId] : [],
          selectedEvidenceIds,
        })
        break
      case 'guided_practice':
        if (evaluableStage) {
          onSubmitResponse({
            stageId: evaluableStage.stageId,
            responseRaw: textInput,
          })
        } else {
          onSubmitResponse({
            stageId: 'invalid-stage-not-found',
            responseRaw: textInput,
          })
        }
        break
    }
  }

  function toggleEvidence(evId: string) {
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

      <div className="item-task-box">
        <strong>Tarea:</strong> {item.task}
      </div>

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

      <form onSubmit={handleSubmit} className="item-form">
        {/* Render según el kind del walking skeleton */}
        {item.kind === 'typing_copy' && (
          <div className="input-group">
            <label htmlFor="typing-target" className="input-label">
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
              onChange={(e) => {
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
                setTextInput(e.target.value)
              }}
              disabled={disabled}
              placeholder="Escribí el comando..."
              autoFocus
              autoComplete="off"
            />
          </div>
        )}

        {item.kind === 'exact_question' && item.options && (
          <div className="input-group" role="radiogroup" aria-label="Opciones de respuesta">
            {item.options.map((opt) => (
              <label key={opt.optionId} className="radio-card">
                <input
                  type="radio"
                  name="exactOption"
                  value={opt.optionId}
                  checked={singleChoiceId === opt.optionId}
                  onChange={() => {
                    setSingleChoiceId(opt.optionId)
                  }}
                  disabled={disabled}
                />
                <span className="radio-text">{opt.text}</span>
              </label>
            ))}
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
              rows={4}
              value={openText}
              onChange={(e) => {
                setOpenText(e.target.value)
              }}
              disabled={disabled}
              placeholder="Explicá tu análisis en 2 o 3 frases..."
              autoFocus
            />
          </div>
        )}

        {item.kind === 'decision' && (
          <div className="input-group">
            {Array.isArray(item.evidence) && item.evidence.length > 0 && (
              <div className="evidence-section">
                <p className="section-label">Evidencia observada:</p>
                {item.evidence.map((ev) => (
                  <label key={ev.evidenceId} className="checkbox-card">
                    <input
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

            <div className="choices-section" role="radiogroup" aria-label="Opciones de decisión">
              <p className="section-label">Seleccioná tu decisión:</p>
              {item.choices.map((ch) => (
                <label key={ch.choiceId} className="radio-card">
                  <input
                    type="radio"
                    name="decisionChoice"
                    value={ch.choiceId}
                    checked={selectedDecisionChoiceId === ch.choiceId}
                    onChange={() => {
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
