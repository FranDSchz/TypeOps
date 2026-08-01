import type { ContentPackRecord, AppSettings, AppSettingKey } from '../db/records'

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
