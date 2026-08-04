import type { TypeOpsDatabase } from '../db/database'
import type { PriorKnowledgeRecord } from '../db/records'

export class PriorKnowledgeRepository {
  constructor(private db: TypeOpsDatabase) {}

  async getRecord(
    packId: string,
    packVersion: string,
    unitId: string,
  ): Promise<PriorKnowledgeRecord | undefined> {
    const compositeKey = `${packId}:${packVersion}:${unitId}`
    return this.db.priorKnowledge.get(compositeKey)
  }

  async getAllForPack(packId: string, packVersion: string): Promise<PriorKnowledgeRecord[]> {
    return this.db.priorKnowledge
      .where('packId')
      .equals(packId)
      .filter((r) => r.packVersion === packVersion)
      .toArray()
  }

  async markPriorKnowledge(
    packId: string,
    packVersion: string,
    unitId: string,
    source: 'user_configured' | 'pack_imported' = 'user_configured',
  ): Promise<void> {
    const compositeKey = `${packId}:${packVersion}:${unitId}`
    const record: PriorKnowledgeRecord = {
      compositeKey,
      packId,
      packVersion,
      unitId,
      source,
      updatedAt: new Date().toISOString(),
    }
    await this.db.priorKnowledge.put(record)
  }

  async unmarkPriorKnowledge(
    packId: string,
    packVersion: string,
    unitId: string,
  ): Promise<void> {
    const compositeKey = `${packId}:${packVersion}:${unitId}`
    await this.db.priorKnowledge.delete(compositeKey)
  }
}
