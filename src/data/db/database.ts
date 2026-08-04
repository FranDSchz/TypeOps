import Dexie, { type Table } from 'dexie'
import type {
  ContentPackRecord,
  SettingRecord,
  SessionRecord,
  AttemptRecord,
  LearningProgressRecord,
  MechanicalProfileRecord,
  GuidedItemProgressRecord,
  PriorKnowledgeRecord,
} from './records'

/**
 * TypeOps V1 — Dexie IndexedDB Database
 *
 * Base de datos local-first. En Subhito 5C amplía las tablas a v4:
 * 'contentPacks', 'settings', 'sessions', 'attempts', 'learningProgress', 'mechanicalProfiles', 'guidedProgress'.
 */
export class TypeOpsDatabase extends Dexie {
  contentPacks!: Table<ContentPackRecord, string>
  settings!: Table<SettingRecord, string>
  sessions!: Table<SessionRecord, string>
  attempts!: Table<AttemptRecord, string>
  learningProgress!: Table<LearningProgressRecord, string>
  mechanicalProfiles!: Table<MechanicalProfileRecord, string>
  guidedProgress!: Table<GuidedItemProgressRecord, string>
  priorKnowledge!: Table<PriorKnowledgeRecord, string>

  constructor(databaseName = 'TypeOpsDB') {
    super(databaseName)

    // Versión 1 del esquema de IndexedDB (Hito 2)
    this.version(1).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
    })

    // Versión 2 del esquema de IndexedDB (Hito 4)
    this.version(2).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
      sessions: 'sessionId, mode, status, startedAt',
      attempts: 'attemptId, sessionId, itemId, unitId, createdAt',
      learningProgress: 'compositeUnitKey, unitId, packId, state, nextReviewAt, lastPracticedAt',
    })

    // Versión 3 del esquema de IndexedDB (Subhito 5B)
    this.version(3).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
      sessions: 'sessionId, mode, status, startedAt',
      attempts: 'attemptId, sessionId, itemId, unitId, createdAt',
      learningProgress: 'compositeUnitKey, unitId, packId, state, nextReviewAt, lastPracticedAt',
      mechanicalProfiles: 'profileKey, packId',
    })

    // Versión 4 del esquema de IndexedDB (Subhito 5C)
    this.version(4).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
      sessions: 'sessionId, mode, status, startedAt',
      attempts: 'attemptId, sessionId, itemId, unitId, createdAt',
      learningProgress: 'compositeUnitKey, unitId, packId, state, nextReviewAt, lastPracticedAt',
      mechanicalProfiles: 'profileKey, packId',
      guidedProgress: 'progressKey, packId, itemId',
    })

    // Versión 5 del esquema de IndexedDB (Puerta 5D — Prior Knowledge)
    this.version(5).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
      sessions: 'sessionId, mode, status, startedAt',
      attempts: 'attemptId, sessionId, itemId, unitId, createdAt',
      learningProgress: 'compositeUnitKey, unitId, packId, state, nextReviewAt, lastPracticedAt',
      mechanicalProfiles: 'profileKey, packId',
      guidedProgress: 'progressKey, packId, itemId',
      priorKnowledge: 'compositeKey, packId, unitId',
    })
  }
}


/** Instancia principal de la base de datos de la aplicación */
export const db = new TypeOpsDatabase()

/** Helper para instanciar bases de datos temporales (útil para aislar tests con fake-indexeddb) */
export function createTestDatabase(name?: string): TypeOpsDatabase {
  const dbName = name ?? `TypeOpsDB_Test_${String(Date.now())}_${Math.random().toString(36).substring(2, 7)}`
  return new TypeOpsDatabase(dbName)
}
