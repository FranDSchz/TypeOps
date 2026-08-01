import { describe, it, expect } from 'vitest'
import { parseSemVer, compareSemVer } from './semver'

describe('SemVer Utility', () => {
  it('parsea versiones semver válidas', () => {
    const p1 = parseSemVer('1.2.3')
    expect(p1).toEqual({ major: 1, minor: 2, patch: 3, prerelease: undefined })

    const p2 = parseSemVer('2.0.0-alpha.1')
    expect(p2).toEqual({ major: 2, minor: 0, patch: 0, prerelease: 'alpha.1' })
  })

  it('compara versiones correctamente', () => {
    expect(compareSemVer('1.0.0', '1.0.0')).toBe(0)
    expect(compareSemVer('1.1.0', '1.0.0')).toBe(1)
    expect(compareSemVer('1.0.0', '1.1.0')).toBe(-1)
    expect(compareSemVer('2.0.0', '1.9.9')).toBe(1)
    expect(compareSemVer('1.0.0-alpha', '1.0.0')).toBe(-1)
  })
})
