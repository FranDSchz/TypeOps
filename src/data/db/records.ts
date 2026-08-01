import type { ContentPack } from '../../domain/content/types'

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

/** Mapa estrictamente tipado de claves de configuración de la aplicación */
export interface AppSettings {
  /** ID del pack activo seleccionado */
  activePackId?: string
  /** Fecha ISO de la última copia de seguridad / exportación */
  lastBackupAt?: string
}

export type AppSettingKey = keyof AppSettings

export interface SettingRecord<K extends AppSettingKey = AppSettingKey> {
  key: K
  value: AppSettings[K]
  updatedAt: string
}
