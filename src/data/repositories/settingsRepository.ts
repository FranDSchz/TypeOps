import type { TypeOpsDatabase } from '../db/database'
import type { AppSettings, AppSettingKey, SettingRecord } from '../db/records'
import type { ISettingsRepository } from './interfaces'

export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly db: TypeOpsDatabase) {}

  async getSetting<K extends AppSettingKey>(key: K): Promise<AppSettings[K] | undefined> {
    const record = await this.db.settings.get(key)
    if (!record) return undefined
    return record.value
  }

  async setSetting<K extends AppSettingKey>(key: K, value: AppSettings[K]): Promise<void> {
    const record: SettingRecord<K> = {
      key,
      value,
      updatedAt: new Date().toISOString(),
    }
    await this.db.settings.put(record)
  }

  async getAllSettings(): Promise<AppSettings> {
    const records = await this.db.settings.toArray()
    const settings: AppSettings = {}
    const target = settings as Record<string, unknown>
    records.forEach((rec) => {
      target[rec.key] = rec.value
    })
    return settings
  }
}
