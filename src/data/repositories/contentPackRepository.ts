import type { TypeOpsDatabase } from '../db/database'
import type { ContentPackRecord } from '../db/records'
import type { IContentPackRepository } from './interfaces'

export class ContentPackRepository implements IContentPackRepository {
  constructor(private readonly db: TypeOpsDatabase) {}

  async getAllPacks(): Promise<ContentPackRecord[]> {
    return this.db.contentPacks.toArray()
  }

  async getPackById(packId: string): Promise<ContentPackRecord | undefined> {
    return this.db.contentPacks.get(packId)
  }

  async savePackRecord(record: ContentPackRecord): Promise<void> {
    await this.db.contentPacks.put(record)
  }

  async deletePack(packId: string): Promise<boolean> {
    const count = await this.db.contentPacks.where('packId').equals(packId).delete()
    return count > 0
  }

  async hasPack(packId: string): Promise<boolean> {
    const count = await this.db.contentPacks.where('packId').equals(packId).count()
    return count > 0
  }
}
