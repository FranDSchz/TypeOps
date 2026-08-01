import { describe, it, expect } from 'vitest'
import { loadContentPack } from '../../domain/content/loader'
import officialPack from './pack.json'

describe('Corpus de contenido oficial — TypeOps Foundations es-AR', () => {
  it('valida el pack oficial walking skeleton sin errores', () => {
    const result = loadContentPack(officialPack)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.pack.packId).toBe('typeops-foundations-es-ar')
      expect(result.pack.schemaVersion).toBe('1.0.0')
      expect(result.pack.packVersion).toBe('1.0.0')
      expect(result.pack.units).toHaveLength(2)
      expect(result.pack.guidedPaths).toHaveLength(1)
      expect(result.pack.items).toHaveLength(6)

      // Verificación de cobertura de tipos discriminados
      const kinds = result.pack.items.map((item) => item.kind)
      expect(kinds).toContain('typing_copy')
      expect(kinds).toContain('command_intention')
      expect(kinds).toContain('exact_question')
      expect(kinds).toContain('open_question')
      expect(kinds).toContain('decision')
      expect(kinds).toContain('guided_practice')
    }
  })
})
