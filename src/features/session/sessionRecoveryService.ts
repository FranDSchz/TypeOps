import type { TypeOpsDatabase } from '../../data/db/database'
import type { AttemptRecord, SessionRecord } from '../../data/db/records'
import type { ContentItem, ContentPack } from '../../domain/content/types'
import type { SessionPlan, SessionPlanItem } from '../../domain/session/sessionComposer'
import { AttemptRepository } from '../../data/repositories/attemptRepository'

export interface RecoveryFailureInfo {
  code: 'RECOVERY_FAILED_CONTENT_MISSING'
  message: string
  missingPackId?: string
  missingPackVersion?: string
  missingItemIds?: string[]
}

export interface SessionRecoveryResult {
  activeSession: SessionRecord | null
  sessionPlan: SessionPlan | null
  submittedAttempts: AttemptRecord[]
  recoveryError: RecoveryFailureInfo | null
}

/**
 * Intenta recuperar una sesión activa previamente interrumpida (por ejemplo, recarga con F5).
 * Utiliza el plan persistido sin recomponer la sesión.
 */
export async function recoverActiveSession(
  db: TypeOpsDatabase,
  activePack: ContentPack,
): Promise<SessionRecoveryResult> {
  const activeSetting = await db.settings.get('activeSessionId')
  const activeSessionId = activeSetting?.value

  if (!activeSessionId) {
    return { activeSession: null, sessionPlan: null, submittedAttempts: [], recoveryError: null }
  }

  const sessionRecord = await db.sessions.get(activeSessionId)
  if (!sessionRecord || sessionRecord.status !== 'active') {
    return { activeSession: null, sessionPlan: null, submittedAttempts: [], recoveryError: null }
  }

  // 1. Validar que el pack y su versión coincidan
  const isPackCompatible =
    sessionRecord.packId === activePack.packId && sessionRecord.packVersion === activePack.packVersion

  if (!isPackCompatible) {
    return {
      activeSession: sessionRecord,
      sessionPlan: null,
      submittedAttempts: [],
      recoveryError: {
        code: 'RECOVERY_FAILED_CONTENT_MISSING',
        message: `El pack de la sesión ('${sessionRecord.packId}@${sessionRecord.packVersion}') no coincide con el pack cargado ('${activePack.packId}@${activePack.packVersion}').`,
        missingPackId: sessionRecord.packId,
        missingPackVersion: sessionRecord.packVersion,
      },
    }
  }

  // 2. Reconstruir el plan exacto usando los items del pack cargado
  const itemMap = new Map<string, ContentItem>()
  for (const item of activePack.items) {
    itemMap.set(item.itemId, item)
  }

  const reconstructedItems: SessionPlanItem[] = []
  const missingItemIds: string[] = []

  for (const planItemRecord of sessionRecord.planItems) {
    const item = itemMap.get(planItemRecord.itemId)
    if (!item) {
      missingItemIds.push(planItemRecord.itemId)
    } else {
      reconstructedItems.push({
        item,
        reasonCode: planItemRecord.reasonCode,
        reasonDescription: planItemRecord.reasonDescription,
      })
    }
  }

  if (missingItemIds.length > 0) {
    return {
      activeSession: sessionRecord,
      sessionPlan: null,
      submittedAttempts: [],
      recoveryError: {
        code: 'RECOVERY_FAILED_CONTENT_MISSING',
        message: `No se encontraron algunos ítems en el catálogo local (${missingItemIds.join(', ')}).`,
        missingItemIds,
      },
    }
  }

  let estimatedTotalDurationSeconds = 0
  for (const pi of reconstructedItems) {
    estimatedTotalDurationSeconds += pi.item.estimatedSeconds
  }

  const sessionPlan: SessionPlan = {
    items: reconstructedItems,
    estimatedTotalDurationSeconds,
    presetName: sessionRecord.presetName,
  }

  if (sessionRecord.deadlineAt && sessionRecord.startedAt) {
    const startMs = new Date(sessionRecord.startedAt).getTime()
    const endMs = new Date(sessionRecord.deadlineAt).getTime()
    sessionPlan.targetDurationSeconds = Math.round((endMs - startMs) / 1000)
  }

  // 3. Recuperar los intentos previamente guardados para esta sesión
  const attemptRepo = new AttemptRepository(db)
  const submittedAttempts = await attemptRepo.getAttemptsBySessionId(sessionRecord.sessionId)

  return {
    activeSession: sessionRecord,
    sessionPlan,
    submittedAttempts,
    recoveryError: null,
  }
}
