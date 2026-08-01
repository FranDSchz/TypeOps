import type { SessionRecord, AttemptRecord } from '../../data/db/records'
import type { SummaryRecommendationInfo } from './sessionReducer'

interface SessionSummaryViewProps {
  sessionRecord: SessionRecord | null
  submittedAttempts: AttemptRecord[]
  summaryRecommendation: SummaryRecommendationInfo | null
  onFinish: () => void
  onRetryClose?: (() => void) | undefined
  closeError?: string | null | undefined
}

export function SessionSummaryView({
  sessionRecord,
  submittedAttempts,
  summaryRecommendation,
  onFinish,
  onRetryClose,
  closeError,
}: SessionSummaryViewProps) {
  const correctCount = submittedAttempts.filter((a) => a.evaluationResult.status === 'correct').length
  const totalCount = submittedAttempts.length

  return (
    <div className="session-summary-view" role="region" aria-label="Resumen de cierre de sesión">
      <h2 id="summary-heading" className="summary-title">
        Sesión finalizada
      </h2>

      {closeError && (
        <div className="notice-box notice-box--danger" role="alert">
          <p>
            <strong>Error al guardar el cierre:</strong> {closeError}
          </p>
          {onRetryClose && (
            <button type="button" className="btn btn--secondary btn--sm" onClick={onRetryClose}>
              Reintentar cierre
            </button>
          )}
        </div>
      )}

      <div className="summary-stats-grid">
        <div className="stat-card">
          <span className="stat-label">Modo</span>
          <span className="stat-value">{sessionRecord?.mode ?? 'custom'}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Ejercicios enviados</span>
          <span className="stat-value">{totalCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Correctos</span>
          <span className="stat-value">{correctCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Motivo de cierre</span>
          <span className="stat-value">{sessionRecord?.completionReason ?? 'finalizada'}</span>
        </div>
      </div>

      <div className="recommendation-card" role="region" aria-label="Recomendación para la siguiente práctica">
        <h3>Siguiente recomendación adaptativa:</h3>
        {summaryRecommendation ? (
          <div>
            <p className="rec-item-title">
              <strong>Ítem:</strong> {summaryRecommendation.item.title}
            </p>
            <p className="rec-reason">
              <strong>Motivo ({summaryRecommendation.reasonCode}):</strong> {summaryRecommendation.reasonDescription}
            </p>
          </div>
        ) : (
          <p className="rec-fallback">
            No hay actividades recomendadas adicionales en este pack para el modo seleccionado.
          </p>
        )}
      </div>

      <div className="summary-actions-row">
        <button type="button" className="btn btn--primary" onClick={onFinish} autoFocus>
          Volver al inicio
        </button>
      </div>
    </div>
  )
}
