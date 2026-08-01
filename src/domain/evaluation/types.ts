/**
 * TypeOps V1 — Evaluation Domain Types
 *
 * Contrato del resultado de evaluación determinista por dimensiones.
 */

export type DimensionStatus =
  | 'correct'
  | 'partial'
  | 'incorrect'
  | 'needs_review'
  | 'not_assessed'

export interface DimensionResults {
  concept: DimensionStatus
  toolSelection: DimensionStatus
  semanticStructure: DimensionStatus
  syntax: DimensionStatus
  interpretation: DimensionStatus
  verification: DimensionStatus
  mechanical: DimensionStatus
}

/**
 * Taxonomía de errores derivados exclusivamente de reglas deterministas explícitas.
 */
export type EvaluationErrorCode =
  | 'answer_mismatch'
  | 'tool_mismatch'
  | 'missing_required_component'
  | 'forbidden_component'
  | 'syntax_mismatch'
  | 'unrecognized_valid_alternative'
  | 'unsafe_action'
  | 'verification_missing'
  | 'hint_used'
  | 'mechanical_friction'

export interface EvaluationResult {
  /** Estado global derivado */
  status: DimensionStatus
  /** Resultados independientes por dimensión */
  dimensionResults: DimensionResults
  /** ID de la alternativa aceptada si hubo coincidencia */
  matchedAlternativeId?: string
  /** Códigos de error explícitos detectados */
  errorCodes: EvaluationErrorCode[]
  /** Código de feedback o motivo corto */
  feedbackCode?: string
  /** Mensaje corto de feedback para UI */
  feedbackMessage?: string
  /** ID de la rúbrica referenciada (para preguntas abiertas/decisión) */
  rubricId?: string
  /** Indica si la respuesta requiere revisión externa u opcional */
  requiresReview: boolean
}

export interface EvaluationOptions {
  /** Pistas utilizadas en el intento */
  hintsUsedCount?: number
  /** Autoevaluación o confianza declarada ('low' | 'medium' | 'high') */
  confidence?: 'low' | 'medium' | 'high'
  /** Eventos de captura mecánica (keydown/input) si están disponibles */
  mechanicalEvents?: MechanicalCaptureEvent[]
}

export interface MechanicalCaptureEvent {
  type: 'keydown' | 'input' | 'paste'
  key?: string
  targetChar?: string
  producedChar?: string
  timestampMs: number
  position?: number
}
