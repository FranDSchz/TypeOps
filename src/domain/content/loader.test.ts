import { describe, it, expect } from 'vitest'
import { loadContentPack } from './loader'

import validPack from '../../content/typeops-foundations-es-ar/pack.json'
import incompatibleVersionPack from '../../test/fixtures/content/incompatible_version.json'
import unknownDiscriminatorPack from '../../test/fixtures/content/unknown_discriminator.json'
import duplicateIdPack from '../../test/fixtures/content/duplicate_id.json'
import invalidSecurityPack from '../../test/fixtures/content/invalid_security.json'
import invalidPrerequisitePack from '../../test/fixtures/content/invalid_prerequisite.json'
import cyclicPrerequisitesPack from '../../test/fixtures/content/cyclic_prerequisites.json'
import unexpectedFieldPack from '../../test/fixtures/content/unexpected_field.json'

describe('Content Pack Loader', () => {
  it('carga exitosamente un ContentPack válido', () => {
    const res = loadContentPack(validPack)
    expect(res.success).toBe(true)
    if (res.success) {
      expect(res.pack.packId).toBe('typeops-foundations-es-ar')
      expect(res.pack.items.length).toBeGreaterThan(0)
    }
  })

  it('rechaza una versión mayor incompatible', () => {
    const res = loadContentPack(incompatibleVersionPack)
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.errors.some((e) => e.code === 'UNSUPPORTED_VERSION')).toBe(true)
    }
  })

  it('rechaza discriminador de item desconocido', () => {
    const res = loadContentPack(unknownDiscriminatorPack)
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.errors.length).toBeGreaterThan(0)
    }
  })

  it('rechaza IDs de item duplicados con mensaje legible', () => {
    const res = loadContentPack(duplicateIdPack)
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.errors.some((e) => e.code === 'DUPLICATE_ID')).toBe(true)
    }
  })

  it('rechaza executionAllowed = true en contexto de seguridad', () => {
    const res = loadContentPack(invalidSecurityPack)
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.errors.some((e) => e.path.includes('executionAllowed'))).toBe(true)
    }
  })

  it('rechaza referencias a prerrequisitos inexistentes', () => {
    const res = loadContentPack(invalidPrerequisitePack)
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.errors.some((e) => e.code === 'MISSING_REFERENCE')).toBe(true)
    }
  })

  it('detecta y rechaza ciclos en el grafo de prerrequisitos de unidades', () => {
    const res = loadContentPack(cyclicPrerequisitesPack)
    expect(res.success).toBe(false)
    if (!res.success) {
      const cyclicErr = res.errors.find((e) => e.code === 'CYCLIC_PREREQUISITES')
      expect(cyclicErr).toBeDefined()
      expect(cyclicErr?.message).toContain('unit-a -> unit-b -> unit-a')
    }
  })

  it('rechaza campos inesperados en schema estricto', () => {
    const res = loadContentPack(unexpectedFieldPack)
    expect(res.success).toBe(false)
    if (!res.success) {
      expect(res.errors.some((e) => e.code === 'UNEXPECTED_FIELD')).toBe(true)
    }
  })

  it('no muta el objeto de entrada', () => {
    const inputCopy: unknown = JSON.parse(JSON.stringify(validPack))
    const originalJson = JSON.stringify(inputCopy)
    loadContentPack(inputCopy)
    expect(JSON.stringify(inputCopy)).toBe(originalJson)
  })
})
