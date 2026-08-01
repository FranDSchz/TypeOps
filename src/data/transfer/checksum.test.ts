import { describe, it, expect } from 'vitest'
import { canonicalJsonStringify, calculateChecksum } from './checksum'

describe('Canonical JSON & SHA-256 Checksum', () => {
  it('ordena claves de objetos alfabéticamente de forma recursiva', () => {
    const objA = { b: 2, a: 1, c: { y: 'val', x: 'val' } }
    const objB = { a: 1, c: { x: 'val', y: 'val' }, b: 2 }

    const strA = canonicalJsonStringify(objA)
    const strB = canonicalJsonStringify(objB)

    expect(strA).toBe(strB)
    expect(strA).toBe('{"a":1,"b":2,"c":{"x":"val","y":"val"}}')
  })

  it('calcula hashes SHA-256 idénticos para objetos idénticos con orden de claves distinto', async () => {
    const objA = { z: 10, a: 'test' }
    const objB = { a: 'test', z: 10 }

    const hashA = await calculateChecksum(objA)
    const hashB = await calculateChecksum(objB)

    expect(hashA).toBe(hashB)
    expect(hashA.length).toBe(64) // SHA-256 hex tiene 64 caracteres
  })
})
