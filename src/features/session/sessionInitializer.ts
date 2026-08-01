import type { TypeOpsDatabase } from '../../data/db/database'
import type { SessionPlanItemRecord, SessionRecord } from '../../data/db/records'
import type { ContentItemMode, ContentPack } from '../../domain/content/types'
import { composeSession, type SessionComposeOptions, type SessionPlan } from '../../domain/session/sessionComposer'
import { LearningProgressRepository } from '../../data/repositories/learningProgressRepository'
import type { LearningProgress } from '../../domain/learning/learningState'

export interface CreateSessionParams {
  db: TypeOpsDatabase
  pack: ContentPack
  mode: ContentItemMode
  targetDurationSeconds?: number
  targetCount?: number
  userFocusCategory?: string
}

export interface CreateSessionResult {
  sessionRecord: SessionRecord | null
  sessionPlan: SessionPlan
  emptyReason?: string
}

export async function createSession(params: CreateSessionParams): Promise<CreateSessionResult> {
  const { db, pack, mode, targetDurationSeconds, targetCount, userFocusCategory } = params

  // 1. Obtener mapa de progreso para este pack
  const progressRepo = new LearningProgressRepository(db)
  const progressRecordMap = await progressRepo.getAllProgressForPack(pack.packId)

  // Convertir de registros de persistencia a modelo de aprendizaje de dominio
  const progressDomainMap: Record<string, LearningProgress> = {}
  for (const [unitId, record] of Object.entries(progressRecordMap)) {
    const domProg: LearningProgress = {
      unitId: record.unitId,
      state: record.state,
      independentSuccessesCount: record.independentSuccessesCount,
      practicedItemIds: record.practicedItemIds,
    }
    if (record.lastPracticedAt !== undefined) domProg.lastPracticedAt = record.lastPracticedAt
    if (record.nextReviewAt !== undefined) domProg.nextReviewAt = record.nextReviewAt
    if (record.lastReasonCode !== undefined) domProg.lastReasonCode = record.lastReasonCode
    progressDomainMap[unitId] = domProg
  }

  const composeOpts: SessionComposeOptions = {
    pack,
    mode,
    progressMap: progressDomainMap,
  }
  if (targetDurationSeconds !== undefined) composeOpts.targetDurationSeconds = targetDurationSeconds
  if (targetCount !== undefined) composeOpts.targetCount = targetCount
  if (userFocusCategory !== undefined) composeOpts.userFocusCategory = userFocusCategory

  // 2. Componer la sesión usando el dominio existente
  const sessionPlan = composeSession(composeOpts)

  // 3. Si no hay candidatos, devolver resultado explicativo sin alterar dominio
  if (sessionPlan.items.length === 0) {
    return {
      sessionRecord: null,
      sessionPlan,
      emptyReason: userFocusCategory
        ? `No hay ejercicios disponibles en la categoría '${userFocusCategory}' para el modo seleccionado.`
        : 'No hay ejercicios disponibles en el pack para esta configuración.',
    }
  }

  // 4. Crear registro de sesión persistible
  const sessionId = crypto.randomUUID()
  const now = new Date()
  const nowIso = now.toISOString()
  const deadlineAt = targetDurationSeconds ? new Date(now.getTime() + targetDurationSeconds * 1000).toISOString() : null

  const planItemsRecord: SessionPlanItemRecord[] = sessionPlan.items.map((pi) => ({
    itemId: pi.item.itemId,
    unitId: pi.item.unitIds[0] ?? pi.item.itemId,
    reasonCode: pi.reasonCode,
    reasonDescription: pi.reasonDescription,
  }))

  const sessionRecord: SessionRecord = {
    sessionId,
    packId: pack.packId,
    packVersion: pack.packVersion,
    mode,
    presetName: sessionPlan.presetName,
    startedAt: nowIso,
    deadlineAt,
    planItems: planItemsRecord,
    currentIndex: 0,
    status: 'active',
    completionReason: null,
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  if (userFocusCategory !== undefined) {
    sessionRecord.userFocusCategory = userFocusCategory
  }

  // 5. Persistir sesión y fijar activeSessionId atómicamente
  await db.transaction('rw', [db.sessions, db.settings], async () => {
    await db.sessions.put(sessionRecord)
    await db.settings.put({
      key: 'activeSessionId',
      value: sessionId,
      updatedAt: nowIso,
    })
  })

  return {
    sessionRecord,
    sessionPlan,
  }
}
