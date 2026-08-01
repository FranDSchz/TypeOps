import type { TypeOpsDatabase } from '../db/database'
import type { SessionRecord } from '../db/records'
import type { ISessionRepository } from './interfaces'

export class SessionRepository implements ISessionRepository {
  constructor(private db: TypeOpsDatabase) {}

  async getSessionById(sessionId: string): Promise<SessionRecord | undefined> {
    return this.db.sessions.get(sessionId)
  }

  async saveSession(session: SessionRecord): Promise<void> {
    await this.db.sessions.put(session)
  }

  async getAllSessions(): Promise<SessionRecord[]> {
    return this.db.sessions.toArray()
  }
}
