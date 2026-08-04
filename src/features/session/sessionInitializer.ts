import type { TypeOpsDatabase } from '../../data/db/database'
import type { SessionPlanItemRecord, SessionRecord } from '../../data/db/records'
import type { ContentItemMode, ContentPack } from '../../domain/content/types'
import {
  composeSession,
  type SessionComposeOptions,
  type SessionPlan,
  type SessionCompositionResult,
} from '../../domain/session/sessionComposer'
import { LearningProgressRepository } from '../../data/repositories/learningProgressRepository'
import { PriorKnowledgeRepository } from '../../data/repositories/priorKnowledgeRepository'
import type { LearningProgress } from '../../domain/learning/learningState'
import { buildUnitEligibilityMap } from '../../domain/learning/unitEligibility'
import { deriveActiveGuidedStage, type GuidedItemProgressRecord } from '../../domain/learning/guidedState'

export interface CreateSessionParams {
  db: TypeOpsDatabase
  pack: ContentPack
  mode: ContentItemMode
  targetDurationSeconds?: number
  targetCount?: number
  userFocusCategory?: string
  targetItemId?: string
}


export interface CreateSessionResult {
  sessionRecord: SessionRecord | null
  sessionPlan: SessionPlan | null
  compositionResult: SessionCompositionResult
  guidedProgressRecord?: GuidedItemProgressRecord | null
}

export async function createSession(params: CreateSessionParams): Promise<CreateSessionResult> {
  const { db, pack, mode, targetDurationSeconds, targetCount, userFocusCategory, targetItemId } = params

  // 1. Obtener progreso conceptual y marcas de conocimiento previo
  const progressRepo = new LearningProgressRepository(db)
  const progressRecordMap = await progressRepo.getAllProgressForPack(pack.packId)

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

  // 2. Obtener evidencia de guiado completado desde guidedProgress en Dexie
  const guidedRecords = await db.guidedProgress.where('packId').equals(pack.packId).toArray()
  const completedGuidedItemIds: string[] = []

  for (const gRec of guidedRecords) {
    const guidedItem = pack.items.find((i) => i.itemId === gRec.itemId && i.kind === 'guided_practice')
    if (guidedItem && guidedItem.kind === 'guided_practice') {
      const activeStage = deriveActiveGuidedStage(guidedItem, gRec)
      if (activeStage.isCompleted) {
        completedGuidedItemIds.push(guidedItem.itemId)
      }
    }
  }

  // 3. Obtener marcas de conocimiento previo desde priorKnowledge
  const pkRepo = new PriorKnowledgeRepository(db)
  const pkRecords = await pkRepo.getAllForPack(pack.packId, pack.packVersion)
  const priorKnowledgeUnitIds = pkRecords.map((r) => r.unitId)

  // 4. Derivar mapa de elegibilidad de dominio puro
  const unitEligibilityMap = buildUnitEligibilityMap({
    pack,
    completedGuidedItemIds,
    priorKnowledgeUnitIds,
  })

  const composeOpts: SessionComposeOptions = {
    pack,
    mode,
    progressMap: progressDomainMap,
    unitEligibilityMap,
  }
  if (targetDurationSeconds !== undefined) composeOpts.targetDurationSeconds = targetDurationSeconds
  if (targetCount !== undefined) composeOpts.targetCount = targetCount
  if (userFocusCategory !== undefined) composeOpts.userFocusCategory = userFocusCategory
  if (targetItemId !== undefined) composeOpts.targetItemId = targetItemId

  // 5. Componer la sesión
  const compositionResult = composeSession(composeOpts)

  if (compositionResult.status !== 'success') {
    return {
      sessionRecord: null,
      sessionPlan: null,
      compositionResult,
    }
  }

  const sessionPlan = compositionResult.sessionPlan

  // 6. Crear registro de sesión persistible ÚNICAMENTE cuando status es 'success'
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

  // Persistir sesión y fijar activeSessionId atómicamente
  await db.transaction('rw', [db.sessions, db.settings], async () => {
    await db.sessions.put(sessionRecord)
    await db.settings.put({
      key: 'activeSessionId',
      value: sessionId,
      updatedAt: nowIso,
    })
  })

  const firstItem = sessionPlan.items[0]?.item
  let guidedProgressRecord: GuidedItemProgressRecord | null = null
  if (firstItem?.kind === 'guided_practice') {
    const key = `${pack.packId}:${pack.packVersion}:${firstItem.itemId}`
    guidedProgressRecord = (await db.guidedProgress.get(key)) ?? null
  }

  return {
    sessionRecord,
    sessionPlan,
    compositionResult,
    guidedProgressRecord,
  }
}
