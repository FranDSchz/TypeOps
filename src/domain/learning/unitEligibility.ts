import type { ContentItem, ContentPack } from '../content/types'

export interface UnitEligibility {
  unitId: string
  hasGuidedPathInPack: boolean
  isGuidedCompleted: boolean
  hasPriorKnowledge: boolean
  isSatisfiedForEvaluation: boolean
  isSatisfiedForGuidedEntry: boolean
}

export type UnitEligibilityMap = Record<string, UnitEligibility>

export interface BuildUnitEligibilityOptions {
  pack: ContentPack
  completedGuidedItemIds: string[]
  priorKnowledgeUnitIds: string[]
}

export function buildUnitEligibilityMap(options: BuildUnitEligibilityOptions): UnitEligibilityMap {
  const { pack, completedGuidedItemIds, priorKnowledgeUnitIds } = options
  const completedGuidedSet = new Set(completedGuidedItemIds)
  const priorKnowledgeSet = new Set(priorKnowledgeUnitIds)

  const map: UnitEligibilityMap = {}

  for (const unit of pack.units) {
    const guidedItem = pack.items.find(
      (i) =>
        i.kind === 'guided_practice' &&
        (i.unitId === unit.unitId ||
          i.unitIds.includes(unit.unitId) ||
          (unit.guidedPathId !== undefined && i.guidedPathId === unit.guidedPathId)),
    )

    const hasGuidedPathInPack = Boolean(unit.guidedPathId && guidedItem)
    const isGuidedCompleted = guidedItem ? completedGuidedSet.has(guidedItem.itemId) : false
    const hasPriorKnowledge = priorKnowledgeSet.has(unit.unitId)

    const isSatisfiedForEvaluation = isGuidedCompleted || hasPriorKnowledge
    const isSatisfiedForGuidedEntry = !hasGuidedPathInPack || isGuidedCompleted || hasPriorKnowledge

    map[unit.unitId] = {
      unitId: unit.unitId,
      hasGuidedPathInPack,
      isGuidedCompleted,
      hasPriorKnowledge,
      isSatisfiedForEvaluation,
      isSatisfiedForGuidedEntry,
    }
  }

  return map
}

export interface UnitBlockDetail {
  unitId: string
  requirementType: 'own_unit' | 'prerequisite_unit'
  satisfactionStatus: 'guided_incomplete' | 'guided_missing_in_pack' | 'prior_knowledge_unmarked'
  guidedItemId?: string | undefined
}

export interface ItemPrerequisiteCheckResult {
  isEligible: boolean
  blockedUnits: UnitBlockDetail[]
}

export function checkItemPrerequisites(
  item: ContentItem,
  pack: ContentPack,
  eligibilityMap: UnitEligibilityMap,
): ItemPrerequisiteCheckResult {
  const blockedUnits: UnitBlockDetail[] = []

  if (item.kind === 'guided_practice') {
    for (const prereqId of item.prerequisiteUnitIds) {
      const el = eligibilityMap[prereqId]
      if (el && !el.isSatisfiedForGuidedEntry) {
        const prereqUnit = pack.units.find((u) => u.unitId === prereqId)
        const prereqGuidedItem = pack.items.find(
          (i) =>
            i.kind === 'guided_practice' &&
            (i.unitId === prereqId ||
              i.unitIds.includes(prereqId) ||
              (prereqUnit?.guidedPathId !== undefined && i.guidedPathId === prereqUnit.guidedPathId)),
        )

        blockedUnits.push({
          unitId: prereqId,
          requirementType: 'prerequisite_unit',
          satisfactionStatus: 'guided_incomplete',
          guidedItemId: prereqGuidedItem?.itemId,
        })
      }
    }

    return {
      isEligible: blockedUnits.length === 0,
      blockedUnits,
    }
  }

  // 1. Propias unidades del ítem
  for (const ownUnitId of item.unitIds) {
    const el = eligibilityMap[ownUnitId]
    if (el && !el.isSatisfiedForEvaluation) {
      const ownUnit = pack.units.find((u) => u.unitId === ownUnitId)
      const ownGuidedItem = pack.items.find(
        (i) =>
          i.kind === 'guided_practice' &&
          (i.unitId === ownUnitId ||
            i.unitIds.includes(ownUnitId) ||
            (ownUnit?.guidedPathId !== undefined && i.guidedPathId === ownUnit.guidedPathId)),
      )

      blockedUnits.push({
        unitId: ownUnitId,
        requirementType: 'own_unit',
        satisfactionStatus: !el.hasGuidedPathInPack
          ? 'guided_missing_in_pack'
          : el.hasPriorKnowledge
            ? 'prior_knowledge_unmarked'
            : 'guided_incomplete',
        guidedItemId: ownGuidedItem?.itemId,
      })
    }
  }

  // 2. Unidades prerrequisito del ítem
  for (const prereqId of item.prerequisiteUnitIds) {
    const el = eligibilityMap[prereqId]
    if (el && !el.isSatisfiedForEvaluation) {
      const prereqUnit = pack.units.find((u) => u.unitId === prereqId)
      const prereqGuidedItem = pack.items.find(
        (i) =>
          i.kind === 'guided_practice' &&
          (i.unitId === prereqId ||
            i.unitIds.includes(prereqId) ||
            (prereqUnit?.guidedPathId !== undefined && i.guidedPathId === prereqUnit.guidedPathId)),
      )

      blockedUnits.push({
        unitId: prereqId,
        requirementType: 'prerequisite_unit',
        satisfactionStatus: !el.hasGuidedPathInPack
          ? 'guided_missing_in_pack'
          : el.hasPriorKnowledge
            ? 'prior_knowledge_unmarked'
            : 'guided_incomplete',
        guidedItemId: prereqGuidedItem?.itemId,
      })
    }
  }

  // Eliminar duplicados de unidades bloqueadas por unitId
  const uniqueBlocked: UnitBlockDetail[] = []
  const seenUnitIds = new Set<string>()
  for (const block of blockedUnits) {
    if (!seenUnitIds.has(block.unitId)) {
      seenUnitIds.add(block.unitId)
      uniqueBlocked.push(block)
    }
  }

  return {
    isEligible: uniqueBlocked.length === 0,
    blockedUnits: uniqueBlocked,
  }
}
