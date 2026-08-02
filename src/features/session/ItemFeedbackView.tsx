import type { EvaluationResult } from '../../domain/evaluation/types'
import type { ContentItem } from '../../domain/content/types'

interface ItemFeedbackViewProps {
  item: ContentItem
  evaluationResult: EvaluationResult
  onContinue: () => void
}

export function ItemFeedbackView({ item, evaluationResult, onContinue }: ItemFeedbackViewProps) {
  const isSkipped = evaluationResult.feedbackCode === 'ITEM_SKIPPED'
  const isGuided = item.kind === 'guided_practice'
  const isCorrect = evaluationResult.status === 'correct'
  const isNeedsReview = evaluationResult.status === 'needs_review'

  let bannerTitle = '✖ Respuesta incorrecta'
  if (isSkipped) {
    bannerTitle = '⏭ Ejercicio omitido'
  } else if (isGuided) {
    if (evaluationResult.feedbackCode === 'GUIDED_STAGE_READ_COMPLETE') {
      bannerTitle = '📝 Etapa revisada'
    } else if (evaluationResult.feedbackCode === 'GUIDED_STAGE_RECORDED') {
      bannerTitle = '📝 Práctica registrada'
    } else if (evaluationResult.status === 'incorrect') {
      bannerTitle = '✖ Respuesta incorrecta para la etapa'
    } else {
      bannerTitle = '📝 Práctica registrada'
    }
  } else if (isCorrect) {
    bannerTitle = '✔ Respuesta correcta'
  } else if (isNeedsReview) {
    bannerTitle = '💬 Respuesta pendiente de revisión / no reconocida'
  }

  return (
    <div className="item-feedback-view" role="region" aria-label="Resultado de la respuesta">
      <div className={`feedback-banner feedback-banner--${evaluationResult.status}`}>
        <h3 className="feedback-banner-title">{bannerTitle}</h3>
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
