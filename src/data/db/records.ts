import type { ContentPack, ContentItemMode } from '../../domain/content/types'
import type { EvaluationResult } from '../../domain/evaluation/types'
import type { LearningState } from '../../domain/learning/learningState'

/**
 * Registros de base de datos para Dexie (Hito 2).
 *
 * Mantiene separados los modelos de persistencia del modelo de dominio.
 * El ContentPack validado queda encapsulado en la propiedad `content`.
 */

export interface ContentPackRecord {
  /** Clave primaria: ID del pack */
  packId: string
  /** Versión del pack (indexada para comparaciones SemVer) */
  packVersion: string
  /** Versión del schema */
  schemaVersion: string
  /** Título del pack */
  title: string
  /** Idioma / locale */
  locale: string
  /** Fecha de última actualización del pack */
  updatedAt: string
  /** Fecha en la que el pack fue importado a IndexedDB */
  importedAt: string
  /** Checksum SHA-256 canónico del contenido */
  checksum: string
  /** Objeto de dominio ContentPack validado e inmutable */
  content: ContentPack
}

export interface SessionPlanItemRecord {
  itemId: string
  unitId: string
  reasonCode: string
  reasonDescription: string
}

export type SessionStatus = 'active' | 'completed' | 'abandoned'
export type SessionCompletionReason = 'time_expired' | 'items_completed' | 'user_exited'

export interface SessionRecord {
  sessionId: string
  packId: string
  packVersion: string
  mode: ContentItemMode
  presetName: string
  userFocusCategory?: string
  startedAt: string
  deadlineAt: string | null
  planItems: SessionPlanItemRecord[]
  currentIndex: number
  status: SessionStatus
  completionReason: SessionCompletionReason | null
  createdAt: string
  updatedAt: string
}

export type WorkflowStatus = 'evaluated' | 'pending_review'

export interface AttemptRecord {
  attemptId: string
  sessionId: string
  packId: string
  packVersion: string
  itemId: string
  unitId: string
  responseRaw: unknown
  evaluationResult: EvaluationResult
  workflowStatus: WorkflowStatus
  hintsUsedCount: number
  confidence?: 'low' | 'medium' | 'high'
  durationMs: number
  createdAt: string
}

export interface LearningProgressRecord {
  /** Clave primaria compuesta `${packId}:${unitId}` */
  compositeUnitKey: string
  packId: string
  unitId: string
  state: LearningState
  independentSuccessesCount: number
  practicedItemIds: string[]
  lastPracticedAt?: string
  nextReviewAt?: string
  lastReasonCode?: string
  updatedAt: string
}

/** Mapa strictly tipado de claves de configuración de la aplicación */
export interface AppSettings {
  /** ID del pack activo seleccionado */
  activePackId?: string
  /** ID de la sesión activa en curso (para recuperación tras F5) */
  activeSessionId?: string
  /** Fecha ISO de la última copia de seguridad / exportación */
  lastBackupAt?: string
}

export type AppSettingKey = keyof AppSettings

export interface SettingRecord<K extends AppSettingKey = AppSettingKey> {
  key: K
  value: AppSettings[K]
  updatedAt: string
}

