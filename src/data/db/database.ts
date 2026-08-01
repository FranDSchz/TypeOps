import Dexie, { type Table } from 'dexie'
import type { ContentPackRecord, SettingRecord } from './records'

/**
 * TypeOps V1 — Dexie IndexedDB Database
 *
 * Base de datos local-first. En Hito 2 define únicamente las tablas
 * necesarias para el caso de uso real: 'contentPacks' y 'settings'.
 */
export class TypeOpsDatabase extends Dexie {
  contentPacks!: Table<ContentPackRecord, string>
  settings!: Table<SettingRecord, string>

  constructor(databaseName = 'TypeOpsDB') {
    super(databaseName)

    // Versión 1 del esquema de IndexedDB
    this.version(1).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
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
