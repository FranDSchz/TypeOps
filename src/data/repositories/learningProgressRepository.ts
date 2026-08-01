import type { TypeOpsDatabase } from '../db/database'
import type { LearningProgressRecord } from '../db/records'
import type { ILearningProgressRepository } from './interfaces'

export class LearningProgressRepository implements ILearningProgressRepository {
  constructor(private db: TypeOpsDatabase) {}

  async getProgress(packId: string, unitId: string): Promise<LearningProgressRecord | undefined> {
    const compositeUnitKey = `${packId}:${unitId}`
    return this.db.learningProgress.get(compositeUnitKey)
  }

  async saveProgress(progress: LearningProgressRecord): Promise<void> {
    await this.db.learningProgress.put(progress)
  }

  async getAllProgressForPack(packId: string): Promise<Record<string, LearningProgressRecord>> {
    const records = await this.db.learningProgress.where('packId').equals(packId).toArray()
    const map: Record<string, LearningProgressRecord> = {}
    for (const record of records) {
      map[record.unitId] = record
    }
    return map
  }

  async getAllProgress(): Promise<LearningProgressRecord[]> {
    return this.db.learningProgress.toArray()
  }
}
