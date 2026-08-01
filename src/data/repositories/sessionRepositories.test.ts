import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createTestDatabase, type TypeOpsDatabase } from '../db/database'
import { SessionRepository } from './sessionRepository'
import { AttemptRepository } from './attemptRepository'
import { LearningProgressRepository } from './learningProgressRepository'
import type { SessionRecord, AttemptRecord, LearningProgressRecord } from '../db/records'

describe('Session Repositories (Hito 4)', () => {
  let testDb: TypeOpsDatabase
  let sessionRepo: SessionRepository
  let attemptRepo: AttemptRepository
  let progressRepo: LearningProgressRepository

  beforeEach(() => {
    testDb = createTestDatabase()
    sessionRepo = new SessionRepository(testDb)
    attemptRepo = new AttemptRepository(testDb)
    progressRepo = new LearningProgressRepository(testDb)
  })

  afterEach(() => {
    testDb.close()
  })

  it('guarda y recupera sesiones en SessionRepository', async () => {
    const session: SessionRecord = {
      sessionId: 'sess-1',
      packId: 'pack-test',
      packVersion: '1.0.0',
      mode: 'command',
      presetName: '5_minutes',
      startedAt: new Date().toISOString(),
      deadlineAt: new Date(Date.now() + 300000).toISOString(),
      planItems: [
        { itemId: 'item-1', unitId: 'unit-1', reasonCode: 'variety_exploration', reasonDescription: 'test' },
      ],
      currentIndex: 0,
      status: 'active',
      completionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await sessionRepo.saveSession(session)
    const fetched = await sessionRepo.getSessionById('sess-1')
    expect(fetched).toEqual(session)
  })

  it('guarda y recupera intentos por sessionId en AttemptRepository', async () => {
    const attempt: AttemptRecord = {
      attemptId: 'att-1',
      sessionId: 'sess-1',
      packId: 'pack-test',
      packVersion: '1.0.0',
      itemId: 'item-1',
      unitId: 'unit-1',
      responseRaw: 'tail -n 20 /var/log/auth.log',
      evaluationResult: {
        status: 'correct',
        dimensionResults: {
          concept: 'correct',
          toolSelection: 'correct',
          semanticStructure: 'correct',
          syntax: 'correct',
          interpretation: 'not_assessed',
          verification: 'not_assessed',
          mechanical: 'not_assessed',
        },
        errorCodes: [],
        requiresReview: false,
      },
      workflowStatus: 'evaluated',
      hintsUsedCount: 0,
      durationMs: 4500,
      createdAt: new Date().toISOString(),
    }

    await attemptRepo.saveAttempt(attempt)
    const attempts = await attemptRepo.getAttemptsBySessionId('sess-1')
    expect(attempts).toHaveLength(1)
    expect(attempts[0]?.attemptId).toBe('att-1')
  })

  it('guarda y recupera progreso por clave compuesta en LearningProgressRepository', async () => {
    const progress: LearningProgressRecord = {
      compositeUnitKey: 'pack-test:unit-1',
      packId: 'pack-test',
      unitId: 'unit-1',
      state: 'learning',
      independentSuccessesCount: 1,
      practicedItemIds: ['item-1'],
      updatedAt: new Date().toISOString(),
    }

    await progressRepo.saveProgress(progress)
    const fetched = await progressRepo.getProgress('pack-test', 'unit-1')
    expect(fetched).toEqual(progress)

    const map = await progressRepo.getAllProgressForPack('pack-test')
    expect(map['unit-1']).toEqual(progress)
  })
})
