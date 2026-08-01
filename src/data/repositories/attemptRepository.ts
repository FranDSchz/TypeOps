import type { TypeOpsDatabase } from '../db/database'
import type { AttemptRecord } from '../db/records'
import type { IAttemptRepository } from './interfaces'

export class AttemptRepository implements IAttemptRepository {
  constructor(private db: TypeOpsDatabase) {}

  async getAttemptById(attemptId: string): Promise<AttemptRecord | undefined> {
    return this.db.attempts.get(attemptId)
  }

  async saveAttempt(attempt: AttemptRecord): Promise<void> {
    await this.db.attempts.put(attempt)
  }

  async getAttemptsBySessionId(sessionId: string): Promise<AttemptRecord[]> {
    return this.db.attempts.where('sessionId').equals(sessionId).sortBy('createdAt')
  }

  async getAllAttempts(): Promise<AttemptRecord[]> {
    return this.db.attempts.toArray()
  }
}
