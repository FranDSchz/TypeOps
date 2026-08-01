/**
 * Serialización canónica determinista y cálculo de Checksum SHA-256 usando Web Crypto API.
 */

/**
 * Convierte cualquier estructura de datos en un string JSON canónico
 * con las claves de los objetos ordenadas alfabéticamente de forma recursiva.
 */
export function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj)
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']'
  }
  const record = obj as Record<string, unknown>
  const sortedKeys = Object.keys(record).sort()
  const entries = sortedKeys.map(
    (key) => `${JSON.stringify(key)}:${canonicalJsonStringify(record[key])}`,
  )
  return '{' + entries.join(',') + '}'
}

/**
 * Calcula el hash SHA-256 canónico de un objeto de datos usando Web Crypto API.
 */
export async function calculateChecksum(data: unknown): Promise<string> {
  const canonicalString = canonicalJsonStringify(data)
  const encoder = new TextEncoder()
  const buffer = encoder.encode(canonicalString)

  // Web Crypto API (disponible en navegadores modernos y Node 20+/Vitest)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}
