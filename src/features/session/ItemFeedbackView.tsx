import type { EvaluationResult } from '../../domain/evaluation/types'
import type { ContentItem } from '../../domain/content/types'

interface ItemFeedbackViewProps {
  item: ContentItem
  evaluationResult: EvaluationResult
  onContinue: () => void
}

export function ItemFeedbackView({ item, evaluationResult, onContinue }: ItemFeedbackViewProps) {
  const isCorrect = evaluationResult.status === 'correct'
  const isNeedsReview = evaluationResult.status === 'needs_review'
  const isIncorrect = evaluationResult.status === 'incorrect'
  const isNotAssessed = evaluationResult.status === 'not_assessed'
  const isGuided = item.kind === 'guided_practice'

  return (
    <div className="item-feedback-view" role="region" aria-label="Resultado de la respuesta">
      <div className={`feedback-banner feedback-banner--${evaluationResult.status}`}>
        <h3 className="feedback-banner-title">
          {isNotAssessed && '⏭ Ejercicio omitido'}
          {!isNotAssessed && isGuided && isCorrect && '📝 Etapa completada / Intento registrado'}
          {!isNotAssessed && isGuided && isIncorrect && '✖ Respuesta incorrecta para la etapa'}
          {!isNotAssessed && !isGuided && isCorrect && '✔ Respuesta correcta'}
          {!isNotAssessed && !isGuided && isNeedsReview && '💬 Respuesta pendiente de revisión / no reconocida'}
          {!isNotAssessed && !isGuided && isIncorrect && '✖ Respuesta incorrecta'}
        </h3>
        {evaluationResult.feedbackMessage && (
          <p className="feedback-banner-desc">{evaluationResult.feedbackMessage}</p>
        )}
      </div>

      <div className="dimensions-feedback-box">
        <h4>Evaluación por dimensiones:</h4>
        <ul className="dimensions-list">
          {Object.entries(evaluationResult.dimensionResults).map(([dim, status]) => (
            <li key={dim} className={`dim-item dim-item--${String(status)}`}>
              <span className="dim-name">{dim}:</span> <span className="dim-status">{String(status)}</span>
            </li>
          ))}
        </ul>
      </div>

      {item.explanation && (
        <div className="explanation-box">
          <h4>Explicación:</h4>
          <p>{item.explanation}</p>
        </div>
      )}

      <div className="feedback-actions-row">
        <button type="button" className="btn btn--primary" onClick={onContinue} autoFocus>
          Continuar (Enter)
        </button>
      </div>
    </div>
  )
}
