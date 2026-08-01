import officialPack from '../content/typeops-foundations-es-ar/pack.json'
import { generateImportPreview, confirmImport } from './transfer/importService'
import type { TypeOpsDatabase } from './db/database'
import type { ImportResult } from './transfer/transferTypes'

/**
 * Comprueba si el pack oficial walking-skeleton 'typeops-foundations-es-ar' está instalado en IndexedDB.
 */
export async function isOfficialContentInstalled(db: TypeOpsDatabase): Promise<boolean> {
  const record = await db.contentPacks.get('typeops-foundations-es-ar')
  return record !== undefined
}

/**
 * Instala explícitamente el pack oficial reutilizando exactamente
 * la misma canalización de validación e importación atómica que cualquier pack externo.
 * No realiza escrituras silenciosas ni automáticas.
 */
export async function bootstrapOfficialContent(db: TypeOpsDatabase): Promise<ImportResult> {
  const preview = await generateImportPreview(officialPack, db)
  return confirmImport(preview, db)
}
