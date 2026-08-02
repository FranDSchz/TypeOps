import { describe, it, expect } from 'vitest'
import Dexie, { type Table } from 'dexie'
import { TypeOpsDatabase } from './database'
import type { ContentPackRecord, SessionRecord, AttemptRecord, LearningProgressRecord } from './records'
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

class V2Database extends Dexie {
  contentPacks!: Table<ContentPackRecord, string>
  settings!: Table<SettingRecord, string>
  sessions!: Table<SessionRecord, string>
  attempts!: Table<AttemptRecord, string>
  learningProgress!: Table<LearningProgressRecord, string>

  constructor(databaseName: string) {
    super(databaseName)
    this.version(2).stores({
      contentPacks: 'packId, packVersion, schemaVersion, title, checksum',
      settings: 'key',
      sessions: 'sessionId, mode, status, startedAt',
      attempts: 'attemptId, sessionId, itemId, unitId, createdAt',
      learningProgress: 'compositeUnitKey, unitId, packId, state, nextReviewAt, lastPracticedAt',
    })
  }
}

  it('migra una base v2 a v3 preservando registros en las 5 tablas e instanciando la tabla mechanicalProfiles', async () => {
    const dbName = `TypeOpsDB_Migration_V2_V3_${String(Date.now())}_${Math.random().toString(36).substring(2, 7)}`
    const dbV2 = new V2Database(dbName)
    try {
      // 1. Poblar las 5 tablas en versión 2 del esquema
      await dbV2.settings.put({ key: 'activePackId', value: 'pack-v2-test', updatedAt: '2026-08-01T10:00:00.000Z' })
      await dbV2.contentPacks.put({
        packId: 'pack-v2-test',
        packVersion: '1.0.0',
        schemaVersion: '1.0',
        title: 'Pack V2 Test',
        locale: 'es-AR',
        checksum: 'sha256-v2',
        content: officialPack as ContentPack,
        importedAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-01T10:00:00.000Z',
      })
      await dbV2.sessions.put({
        sessionId: 'sess-v2-test',
        packId: 'pack-v2-test',
        packVersion: '1.0.0',
        mode: 'typing',
        presetName: '5_minutes',
        startedAt: '2026-08-01T10:00:00.000Z',
        deadlineAt: '2026-08-01T10:05:00.000Z',
        planItems: [],
        currentIndex: 0,
        status: 'active',
        completionReason: null,
        createdAt: '2026-08-01T10:00:00.000Z',
        updatedAt: '2026-08-01T10:00:00.000Z',
      })
      await dbV2.attempts.put({
        attemptId: 'att-v2-test',
        sessionId: 'sess-v2-test',
        packId: 'pack-v2-test',
        packVersion: '1.0.0',
        itemId: 'type-ls-1',
        unitId: 'unit-typing-1',
        responseRaw: 'ls -la',
        evaluationResult: {
          status: 'correct',
          dimensionResults: { concept: 'not_assessed', toolSelection: 'not_assessed', semanticStructure: 'not_assessed', syntax: 'not_assessed', interpretation: 'not_assessed', verification: 'not_assessed', mechanical: 'correct' },
          errorCodes: [],
          feedbackCode: 'OK',
          feedbackMessage: 'OK',
          requiresReview: false,
        },
        workflowStatus: 'evaluated',
        hintsUsedCount: 0,
        durationMs: 2000,
        createdAt: '2026-08-01T10:00:00.000Z',
      })
      await dbV2.learningProgress.put({
        compositeUnitKey: 'pack-v2-test:unit-typing-1',
        packId: 'pack-v2-test',
        unitId: 'unit-typing-1',
        state: 'learning',
        independentSuccessesCount: 0,
        practicedItemIds: ['type-ls-1'],
        updatedAt: '2026-08-01T10:00:00.000Z',
      })

      dbV2.close()

      // 2. Reabrir mediante TypeOpsDatabase (v3) en la misma base
      const dbV3 = new TypeOpsDatabase(dbName)
      try {
        // Verificar que las 5 tablas conservan sus datos intactos
        const setting = await dbV3.settings.get('activePackId')
        expect(setting?.value).toBe('pack-v2-test')

        const packRecord = await dbV3.contentPacks.get('pack-v2-test')
        expect(packRecord?.title).toBe('Pack V2 Test')

        const sessionRecord = await dbV3.sessions.get('sess-v2-test')
        expect(sessionRecord?.mode).toBe('typing')

        const attemptRecord = await dbV3.attempts.get('att-v2-test')
        expect(attemptRecord?.attemptId).toBe('att-v2-test')

        const progressRecord = await dbV3.learningProgress.get('pack-v2-test:unit-typing-1')
        expect(progressRecord?.state).toBe('learning')

        // Verificar que la tabla mechanicalProfiles funciona normalmente
        expect(dbV3.mechanicalProfiles).toBeDefined()
        await dbV3.mechanicalProfiles.put({
          profileKey: 'pack-v2-test:1.0.0',
          packId: 'pack-v2-test',
          packVersion: '1.0.0',
          characterMetrics: {},
          sequenceMetrics: {},
          updatedAt: new Date().toISOString(),
        })

        const profileRecord = await dbV3.mechanicalProfiles.get('pack-v2-test:1.0.0')
        expect(profileRecord?.profileKey).toBe('pack-v2-test:1.0.0')
      } finally {
        dbV3.close()
        await dbV3.delete()
      }
    } finally {
      if (dbV2.isOpen()) {
        dbV2.close()
      }
    }
  })
})
