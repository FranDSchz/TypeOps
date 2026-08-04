import type { SyntheticEvent } from 'react'
import { useState, useEffect } from 'react'
import type { ContentItemMode } from '../../domain/content/types'

interface SessionConfigViewProps {
  onStartSession: (
    mode: ContentItemMode,
    targetDurationSeconds?: number,
    targetCount?: number,
    userFocusCategory?: string,
  ) => void
  onCancel: () => void
  categories?: string[]
  units?: { unitId: string; title: string; summary: string }[]
  priorKnowledgeUnitIds?: string[]
  onTogglePriorKnowledge?: (unitId: string, isMarked: boolean) => void
}

const MODES: { id: ContentItemMode; title: string; desc: string }[] = [
  {
    id: 'typing',
    title: 'Typing técnico',
    desc: 'Copia exacta de fragmentos técnicos coherentes.',
  },
  {
    id: 'command',
    title: 'Comando desde intención',
    desc: 'Escribí el comando que satisface la intención.',
  },
  {
    id: 'review',
    title: 'Repaso y decisiones',
    desc: 'Preguntas exactas, decisiones y abiertas.',
  },
  {
    id: 'guided',
    title: 'Práctica guiada',
    desc: 'Secuencia interactiva guiada por etapas.',
  },
]

export function SessionConfigView({
  onStartSession,
  onCancel,
  categories = [],
  units = [],
  priorKnowledgeUnitIds = [],
  onTogglePriorKnowledge,
}: SessionConfigViewProps) {
  const [selectedMode, setSelectedMode] = useState<ContentItemMode>('command')
  const [budgetType, setBudgetType] = useState<'duration' | 'count'>('duration')
  const [durationSeconds, setDurationSeconds] = useState<number>(300)
  const [itemCount, setItemCount] = useState<number>(5)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [markedUnitIds, setMarkedUnitIds] = useState<string[]>(priorKnowledgeUnitIds)

  useEffect(() => {
    setMarkedUnitIds(priorKnowledgeUnitIds)
  }, [priorKnowledgeUnitIds])

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault()
    onStartSession(
      selectedMode,
      budgetType === 'duration' ? durationSeconds : undefined,
      budgetType === 'count' ? itemCount : undefined,
      selectedCategory.trim() ? selectedCategory.trim() : undefined,
    )
  }

  return (
    <div className="session-config-view" role="region" aria-label="Configuración de sesión">
      <h2 id="config-heading" className="session-config-title">
        Configurar micropráctica
      </h2>

      <form onSubmit={handleSubmit} className="session-config-form">
        <fieldset className="config-fieldset">
          <legend className="config-legend">1. Seleccioná un modo</legend>

          <div className="mode-selection-grid" role="radiogroup" aria-label="Modo de práctica">
            {MODES.map((m) => (
              <label
                key={m.id}
                className={`mode-option-card ${selectedMode === m.id ? 'mode-option-card--selected' : ''}`}
              >
                <input
                  type="radio"
                  name="sessionMode"
                  value={m.id}
                  checked={selectedMode === m.id}
                  onChange={() => {
                    setSelectedMode(m.id)
                  }}
                />
                <span className="mode-option-title">{m.title}</span>
                <span className="mode-option-desc">{m.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="config-fieldset">
          <legend className="config-legend">2. Presupuesto de práctica</legend>

          <div className="budget-type-toggle">
            <label className="radio-label">
              <input
                type="radio"
                name="budgetType"
                value="duration"
                checked={budgetType === 'duration'}
                onChange={() => {
                  setBudgetType('duration')
                }}
              />
              Por duración
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="budgetType"
                value="count"
                checked={budgetType === 'count'}
                onChange={() => {
                  setBudgetType('count')
                }}
              />
              Por cantidad de ejercicios
            </label>
          </div>

          {budgetType === 'duration' ? (
            <div className="preset-buttons-row">
              <button
                type="button"
                className={`preset-btn ${durationSeconds === 120 ? 'preset-btn--selected' : ''}`}
                onClick={() => {
                  setDurationSeconds(120)
                }}
              >
                2 Minutos
              </button>
              <button
                type="button"
                className={`preset-btn ${durationSeconds === 300 ? 'preset-btn--selected' : ''}`}
                onClick={() => {
                  setDurationSeconds(300)
                }}
              >
                5 Minutos
              </button>
              <button
                type="button"
                className={`preset-btn ${durationSeconds === 600 ? 'preset-btn--selected' : ''}`}
                onClick={() => {
                  setDurationSeconds(600)
                }}
              >
                10 Minutos
              </button>
            </div>
          ) : (
            <div className="preset-buttons-row">
              <button
                type="button"
                className={`preset-btn ${itemCount === 1 ? 'preset-btn--selected' : ''}`}
                onClick={() => {
                  setItemCount(1)
                }}
              >
                1 Ejercicio
              </button>
              <button
                type="button"
                className={`preset-btn ${itemCount === 2 ? 'preset-btn--selected' : ''}`}
                onClick={() => {
                  setItemCount(2)
                }}
              >
                2 Ejercicios
              </button>
              <button
                type="button"
                className={`preset-btn ${itemCount === 5 ? 'preset-btn--selected' : ''}`}
                onClick={() => {
                  setItemCount(5)
                }}
              >
                5 Ejercicios
              </button>
            </div>
          )}
        </fieldset>

        {categories.length > 0 && (
          <fieldset className="config-fieldset">
            <legend className="config-legend">3. Foco opcional por categoría</legend>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
              }}
              className="category-select"
              aria-label="Foco por categoría"
            >
              <option value="">Todas las categorías (Recomendado)</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </fieldset>
        )}

        {units.length > 0 && onTogglePriorKnowledge && (
          <fieldset className="config-fieldset">
            <legend className="config-legend">4. Conocimiento previo de unidades (opcional)</legend>
            <p className="config-help-text">
              Declarar conocimiento previo de una unidad permite omitir el requisito de su introducción guiada para evaluaciones.
            </p>
            <div className="prior-knowledge-list">
              {units.map((u) => {
                const isMarked = markedUnitIds.includes(u.unitId)
                return (
                  <label key={u.unitId} className="prior-knowledge-item">
                    <input
                      type="checkbox"
                      checked={isMarked}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setMarkedUnitIds((prev) => (checked ? [...prev, u.unitId] : prev.filter((id) => id !== u.unitId)))
                        onTogglePriorKnowledge(u.unitId, checked)
                      }}
                    />
                    <span>
                      <strong>{u.title}</strong> — {u.summary}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        )}

        <div className="config-actions-row">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Volver al inicio
          </button>
          <button type="submit" className="btn btn--primary">
            Iniciar sesión personalizada
          </button>
        </div>
      </form>
    </div>
  )
}
