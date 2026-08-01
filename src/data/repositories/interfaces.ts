import type {
  ContentPackRecord,
  AppSettings,
  AppSettingKey,
  SessionRecord,
  AttemptRecord,
  LearningProgressRecord,
} from '../db/records'

/**
 * Puerto / Interfaz de repositorio de Packs de Contenido.
 */
export interface IContentPackRepository {
  getAllPacks(): Promise<ContentPackRecord[]>
  getPackById(packId: string): Promise<ContentPackRecord | undefined>
  savePackRecord(record: ContentPackRecord): Promise<void>
  deletePack(packId: string): Promise<boolean>
  hasPack(packId: string): Promise<boolean>
}

/**
 * Puerto / Interfaz de repositorio de Configuración de Aplicación (mapa estrictamente tipado).
 */
export interface ISettingsRepository {
  getSetting<K extends AppSettingKey>(key: K): Promise<AppSettings[K] | undefined>
  setSetting<K extends AppSettingKey>(key: K, value: AppSettings[K]): Promise<void>
  getAllSettings(): Promise<AppSettings>
}

/**
 * Puerto / Interfaz de repositorio de Sesiones.
 */
export interface ISessionRepository {
  getSessionById(sessionId: string): Promise<SessionRecord | undefined>
  saveSession(session: SessionRecord): Promise<void>
  getAllSessions(): Promise<SessionRecord[]>
}

/**
 * Puerto / Interfaz de repositorio de Intentos.
 */
export interface IAttemptRepository {
  getAttemptById(attemptId: string): Promise<AttemptRecord | undefined>
  saveAttempt(attempt: AttemptRecord): Promise<void>
  getAttemptsBySessionId(sessionId: string): Promise<AttemptRecord[]>
  getAllAttempts(): Promise<AttemptRecord[]>
}

/**
 * Puerto / Interfaz de repositorio de Progreso de Aprendizaje.
 */
export interface ILearningProgressRepository {
  getProgress(packId: string, unitId: string): Promise<LearningProgressRecord | undefined>
  saveProgress(progress: LearningProgressRecord): Promise<void>
  getAllProgressForPack(packId: string): Promise<Record<string, LearningProgressRecord>>
  getAllProgress(): Promise<LearningProgressRecord[]>
}

