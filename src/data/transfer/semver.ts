/**
 * TypeOps V1 — Comparador SemVer
 *
 * Parsea y compara versiones SemVer (ej. 1.0.0, 1.2.3-alpha.1) de forma estricta.
 */

export interface ParsedSemVer {
  major: number
  minor: number
  patch: number
  prerelease?: string
}

export function parseSemVer(version: string): ParsedSemVer | null {
  const match = /^\s*v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+[a-zA-Z0-9.-]+)?\s*$/.exec(version)
  if (!match) return null

  const majorStr = match[1]
  const minorStr = match[2]
  const patchStr = match[3]

  if (majorStr === undefined || minorStr === undefined || patchStr === undefined) {
    return null
  }

  const parsed: ParsedSemVer = {
    major: parseInt(majorStr, 10),
    minor: parseInt(minorStr, 10),
    patch: parseInt(patchStr, 10),
  }

  if (match[4] !== undefined) {
    parsed.prerelease = match[4]
  }

  return parsed
}

/**
 * Compara dos versiones SemVer:
 * - Retorna -1 si v1 < v2
 * - Retorna 0 si v1 === v2
 * - Retorna 1 si v1 > v2
 */
export function compareSemVer(v1Str: string, v2Str: string): number {
  const v1 = parseSemVer(v1Str)
  const v2 = parseSemVer(v2Str)

  if (!v1 || !v2) {
    return v1Str.localeCompare(v2Str)
  }

  if (v1.major !== v2.major) return v1.major > v2.major ? 1 : -1
  if (v1.minor !== v2.minor) return v1.minor > v2.minor ? 1 : -1
  if (v1.patch !== v2.patch) return v1.patch > v2.patch ? 1 : -1

  if (v1.prerelease === undefined && v2.prerelease !== undefined) return 1 // 1.0.0 > 1.0.0-alpha
  if (v1.prerelease !== undefined && v2.prerelease === undefined) return -1 // 1.0.0-alpha < 1.0.0
  if (v1.prerelease !== undefined && v2.prerelease !== undefined) {
    return v1.prerelease.localeCompare(v2.prerelease)
  }

  return 0
}
