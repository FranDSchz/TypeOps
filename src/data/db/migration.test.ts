import { describe, it, expect } from 'vitest'
import Dexie, { type Table } from 'dexie'
import { TypeOpsDatabase } from './database'
import type { ContentPackRecord } from './records'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack } from '../../domain/content/types'

class V1Database extends Dexie {
  contentPacks!: Table<ContentPackRecord, string>
  settings!: Table<SettingRecord, string>

  constructor(databaseName: string) {
    super(databaseName)
    this.version(1).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
    })
  }
}

interface SettingRecord {
  key: string
  value: string
  updatedAt: string
}

describe('Dexie Real v1 -> v2 Database Migration (SA-04)', () => {
  it('migra una base v1 con datos existentes a v2 preservando registros y habilitando tablas nuevas', async () => {
    const dbName = `TypeOpsDB_Migration_Test_${String(Date.now())}_${Math.random().toString(36).substring(2, 7)}`

    const dbV1 = new V1Database(dbName)
    try {
      // 1. Poblar base en versión 1 del esquema
      await dbV1.settings.put({
        key: 'activeSessionId',
        value: 'sess-v1-migration-test',
        updatedAt: '2026-08-01T10:00:00.000Z',
      })

      await dbV1.contentPacks.put({
        packId: 'pack-foundations-v1',
        packVersion: '1.0.0',
        schemaVersion: '1.0',
        title: 'Pack V1 Original',
        locale: 'es-AR',
        checksum: 'sha256-test-checksum',
        content: officialPack as ContentPack,
        importedAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-01T10:00:00.000Z',
      })

      dbV1.close()

      // 2. Abrir la misma base usando el esquema v2 actual
      const dbV2 = new TypeOpsDatabase(dbName)
      try {
        // Verificación de integridad de datos migrados de v1
        const setting = await dbV2.settings.get('activeSessionId')
        expect(setting?.value).toBe('sess-v1-migration-test')

        const pack = await dbV2.contentPacks.get('pack-foundations-v1')
        expect(pack?.title).toBe('Pack V1 Original')
        expect(pack?.checksum).toBe('sha256-test-checksum')

        // Verificación de existencia y operatividad mínima de las tablas nuevas de v2
        expect(dbV2.sessions).toBeDefined()
        expect(dbV2.attempts).toBeDefined()
        expect(dbV2.learningProgress).toBeDefined()

        await dbV2.sessions.put({
          sessionId: 'sess-v2-new',
          packId: 'pack-foundations-v1',
          packVersion: '1.0.0',
          mode: 'guided',
          presetName: '5_minutes',
          startedAt: new Date().toISOString(),
          deadlineAt: new Date().toISOString(),
          planItems: [],
          currentIndex: 0,
          status: 'active',
          completionReason: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        const createdSession = await dbV2.sessions.get('sess-v2-new')
        expect(createdSession?.sessionId).toBe('sess-v2-new')
      } finally {
        dbV2.close()
        await dbV2.delete()
      }
    } finally {
      if (dbV1.isOpen()) {
        dbV1.close()
      }
    }
  })
})
