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

  const isPartial = evaluationResult.status === 'partial'
  const isOpenQuestion = item.kind === 'open_question'

  let bannerTitle = '✖ Respuesta incorrecta'
  if (isSkipped) {
    bannerTitle = '⏭ Ejercicio omitido'
  } else if (isGuided) {
    if (evaluationResult.feedbackCode === 'GUIDED_STAGE_READ_COMPLETE') {
      bannerTitle = '📝 Etapa revisada'
    } else if (evaluationResult.feedbackCode === 'GUIDED_STAGE_CORRECT') {
      bannerTitle = '✔ Respuesta correcta para la etapa'
    } else if (evaluationResult.feedbackCode === 'GUIDED_STAGE_NEEDS_REVIEW') {
      bannerTitle = '💬 Respuesta registrada (Pendiente de revisión)'
    } else if (evaluationResult.status === 'incorrect') {
      bannerTitle = '✖ Respuesta incorrecta para la etapa'
    } else {
      bannerTitle = '📝 Práctica guiada registrada'
    }
  } else if (isOpenQuestion) {
    bannerTitle = '📝 Respuesta guardada (Pendiente de revisión)'
  } else if (item.kind === 'typing_copy') {
    if (isCorrect) {
      bannerTitle = '✔ Fidelidad de copia completa (100%)'
    } else {
      bannerTitle = '⚠ Copia enviada con discrepancias de caracteres'
    }
  } else if (isCorrect) {
    bannerTitle = '✔ Respuesta correcta'
  } else if (isPartial) {
    bannerTitle = '⚠ Respuesta parcialmente correcta'
  } else if (isNeedsReview) {
    bannerTitle = '💬 Respuesta pendiente de revisión / no reconocida'
  }

  const dimensionLabels: Record<string, string> = {
    concept: 'Concepto',
    toolSelection: 'Selección de herramienta',
    semanticStructure: 'Estructura semántica',
    syntax: 'Sintaxis',
    interpretation: 'Interpretación',
    verification: 'Verificación',
    mechanical: 'Mecánica',
  }

  const assessedDimensions = Object.entries(evaluationResult.dimensionResults).filter(
    ([, status]) => status !== 'not_assessed',
  )

  return (
    <div className="item-feedback-view" role="region" aria-label="Resultado de la respuesta">
      <div className={`feedback-banner feedback-banner--${evaluationResult.status}`}>
        <h3 className="feedback-banner-title">{bannerTitle}</h3>
        {evaluationResult.feedbackMessage && (
          <p className="feedback-banner-desc">{evaluationResult.feedbackMessage}</p>
        )}
      </div>

      {assessedDimensions.length > 0 && (
        <div className="dimensions-feedback-box">
          <h4>Evaluación por dimensiones:</h4>
          <ul className="dimensions-list">
            {assessedDimensions.map(([dim, status]) => (
              <li key={dim} className={`dim-item dim-item--${String(status)}`}>
                <span className="dim-name">{dimensionLabels[dim] ?? dim}:</span>{' '}
                <span className="dim-status">{String(status)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpenQuestion && 'rubric' in item && Boolean(item.rubric) && (
        <div className="rubric-box notice-box notice-box--info">
          <h4>Rúbrica de autoevaluación (opcional):</h4>
          <p>
            <strong>Criterio:</strong> {item.rubric.verificationCriterion}
          </p>
          {item.rubric.essentialElements.length > 0 && (
            <div>
              <strong>Elementos esenciales:</strong>
              <ul>
                {item.rubric.essentialElements.map((el, i) => (
                  <li key={i}>{el}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
