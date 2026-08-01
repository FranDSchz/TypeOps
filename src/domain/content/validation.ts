import { createValidationError } from './errors'
import type { ContentPack, ContentValidationError } from './types'

/**
 * TypeOps V1 — Content Pack Cross Validation
 *
 * Valida reglas de negocio que Zod no puede comprobar por sí solo:
 * - Unicidad de IDs globales y locales.
 * - Integridad de referencias entre unidades, ítems y guided paths.
 * - Detección de ciclos en el grafo de prerrequisitos (DFS con estados).
 * - Coincidencia de secuencias mecánicas en items de typing.
 * - Validez de referencias en preguntas de decisión y práctica guiada.
 */
export function validateContentPackCrossReferences(
  pack: ContentPack,
): ContentValidationError[] {
  const errors: ContentValidationError[] = []

  const unitIds = new Set<string>()
  const itemIds = new Set<string>()
  const pathIds = new Set<string>()
  const rubricIds = new Set<string>()

  // 1. Unicidad de IDs globales de Unidades
  pack.units.forEach((unit, idx) => {
    const sIdx = String(idx)
    if (unitIds.has(unit.unitId)) {
      errors.push(
        createValidationError({
          packId: pack.packId,
          unitId: unit.unitId,
          path: `units[${sIdx}].unitId`,
          code: 'DUPLICATE_ID',
          message: `ID de unidad duplicado: '${unit.unitId}'`,
        }),
      )
    } else {
      unitIds.add(unit.unitId)
    }
  })

  // 2. Unicidad de IDs globales de GuidedPaths
  pack.guidedPaths.forEach((path, idx) => {
    const sIdx = String(idx)
    if (pathIds.has(path.pathId)) {
      errors.push(
        createValidationError({
          packId: pack.packId,
          path: `guidedPaths[${sIdx}].pathId`,
          code: 'DUPLICATE_ID',
          message: `ID de guidedPath duplicado: '${path.pathId}'`,
        }),
      )
    } else {
      pathIds.add(path.pathId)
    }
  })

  // 3. Unicidad de IDs globales de ítems y rúbricas
  pack.items.forEach((item, idx) => {
    const sIdx = String(idx)
    if (itemIds.has(item.itemId)) {
      errors.push(
        createValidationError({
          packId: pack.packId,
          itemId: item.itemId,
          path: `items[${sIdx}].itemId`,
          code: 'DUPLICATE_ID',
          message: `ID de ítem duplicado: '${item.itemId}'`,
        }),
      )
    } else {
      itemIds.add(item.itemId)
    }

    // Rubric ID check
    if (item.kind === 'open_question') {
      const rId = item.rubric.rubricId
      if (rubricIds.has(rId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${sIdx}].rubric.rubricId`,
            code: 'DUPLICATE_ID',
            message: `ID de rúbrica duplicado: '${rId}'`,
          }),
        )
      } else {
        rubricIds.add(rId)
      }
    } else if (item.kind === 'decision' && item.rubric) {
      const rId = item.rubric.rubricId
      if (rubricIds.has(rId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${sIdx}].rubric.rubricId`,
            code: 'DUPLICATE_ID',
            message: `ID de rúbrica duplicado: '${rId}'`,
          }),
        )
      } else {
        rubricIds.add(rId)
      }
    }
  })

  // 4. Unicidad de IDs locales en ítems y comprobaciones internas por ítem
  pack.items.forEach((item, idx) => {
    const itemIdxStr = String(idx)

    // Unicidad local de hintIds
    const hintIds = new Set<string>()
    item.hints.forEach((hint, hIdx) => {
      const hintIdxStr = String(hIdx)
      if (hintIds.has(hint.hintId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${itemIdxStr}].hints[${hintIdxStr}].hintId`,
            code: 'DUPLICATE_LOCAL_ID',
            message: `ID de pista duplicado localmente en ítem '${item.itemId}': '${hint.hintId}'`,
          }),
        )
      } else {
        hintIds.add(hint.hintId)
      }
    })

    // typing_copy: secuencias mecánicas deben estar presentes en targetText
    if (item.kind === 'typing_copy') {
      item.mechanicalSequences.forEach((seq, seqIdx) => {
        const seqIdxStr = String(seqIdx)
        if (!item.targetText.includes(seq.value)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].mechanicalSequences[${seqIdxStr}].value`,
              code: 'MECHANICAL_SEQUENCE_NOT_FOUND',
              message: `La secuencia mecánica '${seq.value}' no está presente en el targetText del ítem '${item.itemId}'`,
            }),
          )
        }
      })
    }

    // command_intention: unicidad local de alternativeIds
    if (item.kind === 'command_intention') {
      const altIds = new Set<string>()
      item.answerSpec.acceptedAlternatives.forEach((alt, aIdx) => {
        const altIdxStr = String(aIdx)
        if (altIds.has(alt.alternativeId)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].answerSpec.acceptedAlternatives[${altIdxStr}].alternativeId`,
              code: 'DUPLICATE_LOCAL_ID',
              message: `ID de alternativa duplicado en ítem '${item.itemId}': '${alt.alternativeId}'`,
            }),
          )
        } else {
          altIds.add(alt.alternativeId)
        }
      })
    }

    // exact_question: unicidad local de optionIds si existen
    if (item.kind === 'exact_question' && item.options) {
      const optIds = new Set<string>()
      item.options.forEach((opt, oIdx) => {
        const optIdxStr = String(oIdx)
        if (optIds.has(opt.optionId)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].options[${optIdxStr}].optionId`,
              code: 'DUPLICATE_LOCAL_ID',
              message: `ID de opción duplicado en ítem '${item.itemId}': '${opt.optionId}'`,
            }),
          )
        } else {
          optIds.add(opt.optionId)
        }
      })
    }

    // decision: unicidad local y validez de referencias a evidence y choices
    if (item.kind === 'decision') {
      const evIds = new Set<string>()
      item.evidence.forEach((ev, eIdx) => {
        const evIdxStr = String(eIdx)
        if (evIds.has(ev.evidenceId)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].evidence[${evIdxStr}].evidenceId`,
              code: 'DUPLICATE_LOCAL_ID',
              message: `ID de evidencia duplicado en ítem '${item.itemId}': '${ev.evidenceId}'`,
            }),
          )
        } else {
          evIds.add(ev.evidenceId)
        }
      })

      const chIds = new Set<string>()
      item.choices.forEach((ch, cIdx) => {
        const chIdxStr = String(cIdx)
        if (chIds.has(ch.choiceId)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].choices[${chIdxStr}].choiceId`,
              code: 'DUPLICATE_LOCAL_ID',
              message: `ID de elección duplicado en ítem '${item.itemId}': '${ch.choiceId}'`,
            }),
          )
        } else {
          chIds.add(ch.choiceId)
        }
      })

      // Referencias correctChoiceIds
      item.correctChoiceIds.forEach((cId, ccIdx) => {
        const ccIdxStr = String(ccIdx)
        if (!chIds.has(cId)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].correctChoiceIds[${ccIdxStr}]`,
              code: 'MISSING_LOCAL_REFERENCE',
              message: `correctChoiceId '${cId}' no existe en choices del ítem '${item.itemId}'`,
            }),
          )
        }
      })

      // Referencias requiredEvidenceIds
      item.requiredEvidenceIds.forEach((eId, reIdx) => {
        const reIdxStr = String(reIdx)
        if (!evIds.has(eId)) {
          errors.push(
            createValidationError({
              packId: pack.packId,
              itemId: item.itemId,
              path: `items[${itemIdxStr}].requiredEvidenceIds[${reIdxStr}]`,
              code: 'MISSING_LOCAL_REFERENCE',
              message: `requiredEvidenceId '${eId}' no existe en evidence del ítem '${item.itemId}'`,
            }),
          )
        }
      })
    }
  })

  // 5. Integridad de referencias globales
  // Unidades -> prerequisiteUnitIds & guidedPathId
  pack.units.forEach((unit, uIdx) => {
    const uIdxStr = String(uIdx)
    unit.prerequisiteUnitIds.forEach((prereqId, pIdx) => {
      const pIdxStr = String(pIdx)
      if (!unitIds.has(prereqId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            unitId: unit.unitId,
            path: `units[${uIdxStr}].prerequisiteUnitIds[${pIdxStr}]`,
            code: 'MISSING_REFERENCE',
            message: `Prerrequisito inexistente: unidad '${prereqId}' en unidad '${unit.unitId}'`,
          }),
        )
      }
    })

    if (unit.guidedPathId && !pathIds.has(unit.guidedPathId)) {
      errors.push(
        createValidationError({
          packId: pack.packId,
          unitId: unit.unitId,
          path: `units[${uIdxStr}].guidedPathId`,
          code: 'MISSING_REFERENCE',
          message: `GuidedPath inexistente: '${unit.guidedPathId}' en unidad '${unit.unitId}'`,
        }),
      )
    }
  })

  // GuidedPaths -> unitId
  pack.guidedPaths.forEach((gp, gpIdx) => {
    const gpIdxStr = String(gpIdx)
    if (!unitIds.has(gp.unitId)) {
      errors.push(
        createValidationError({
          packId: pack.packId,
          path: `guidedPaths[${gpIdxStr}].unitId`,
          code: 'MISSING_REFERENCE',
          message: `Unidad inexistente '${gp.unitId}' en guidedPath '${gp.pathId}'`,
        }),
      )
    }
  })

  // Items -> unitIds, prerequisiteUnitIds, variantOf, laterVariantItemId
  pack.items.forEach((item, iIdx) => {
    const iIdxStr = String(iIdx)
    item.unitIds.forEach((uId, uIdx) => {
      const uIdxStr = String(uIdx)
      if (!unitIds.has(uId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${iIdxStr}].unitIds[${uIdxStr}]`,
            code: 'MISSING_REFERENCE',
            message: `Unidad referenciada inexistente '${uId}' en ítem '${item.itemId}'`,
          }),
        )
      }
    })

    item.prerequisiteUnitIds.forEach((puId, puIdx) => {
      const puIdxStr = String(puIdx)
      if (!unitIds.has(puId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${iIdxStr}].prerequisiteUnitIds[${puIdxStr}]`,
            code: 'MISSING_REFERENCE',
            message: `Prerrequisito inexistente '${puId}' en ítem '${item.itemId}'`,
          }),
        )
      }
    })

    if (item.variantOf && !itemIds.has(item.variantOf)) {
      errors.push(
        createValidationError({
          packId: pack.packId,
          itemId: item.itemId,
          path: `items[${iIdxStr}].variantOf`,
          code: 'MISSING_REFERENCE',
          message: `Ítem original inexistente en variantOf: '${item.variantOf}' en ítem '${item.itemId}'`,
        }),
      )
    }

    if (item.kind === 'guided_practice' && item.laterVariantItemId) {
      if (!itemIds.has(item.laterVariantItemId)) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${iIdxStr}].laterVariantItemId`,
            code: 'MISSING_REFERENCE',
            message: `Ítem de variante posterior inexistente: '${item.laterVariantItemId}' en ítem '${item.itemId}'`,
          }),
        )
      }
      if (item.laterVariantItemId === item.itemId) {
        errors.push(
          createValidationError({
            packId: pack.packId,
            itemId: item.itemId,
            path: `items[${iIdxStr}].laterVariantItemId`,
            code: 'INVALID_REFERENCE',
            message: `laterVariantItemId en '${item.itemId}' no puede autoreferenciarse`,
          }),
        )
      }
    }
  })

  // 6. Detección de ciclos en prerrequisitos de unidades (DFS con 3 estados)
  const UNVISITED = 0
  const VISITING = 1
  const VISITED = 2

  const unitMap = new Map(pack.units.map((u) => [u.unitId, u]))
  const stateMap = new Map<string, number>()
  pack.units.forEach((u) => stateMap.set(u.unitId, UNVISITED))

  function dfs(uId: string, currentPath: string[]): boolean {
    stateMap.set(uId, VISITING)
    currentPath.push(uId)

    const unit = unitMap.get(uId)
    if (unit) {
      for (const prereqId of unit.prerequisiteUnitIds) {
        const prereqState = stateMap.get(prereqId)
        if (prereqState === VISITING) {
          const cycleStartIndex = currentPath.indexOf(prereqId)
          const cycleNodes = currentPath.slice(cycleStartIndex).concat(prereqId)
          errors.push(
            createValidationError({
              packId: pack.packId,
              unitId: uId,
              path: `units`,
              code: 'CYCLIC_PREREQUISITES',
              message: `Grafo de prerrequisitos contiene un ciclo: ${cycleNodes.join(' -> ')}`,
            }),
          )
          return true
        } else if (prereqState === UNVISITED) {
          if (dfs(prereqId, currentPath)) {
            return true
          }
        }
      }
    }

    currentPath.pop()
    stateMap.set(uId, VISITED)
    return false
  }

  for (const unit of pack.units) {
    if (stateMap.get(unit.unitId) === UNVISITED) {
      dfs(unit.unitId, [])
    }
  }

  return errors
}
