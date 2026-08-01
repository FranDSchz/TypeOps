import { useState, useEffect, useCallback } from 'react'
import { db } from '../data/db/database'
import { ContentPackRepository } from '../data/repositories/contentPackRepository'
import { generateImportPreview, confirmImport } from '../data/transfer/importService'
import { exportFullBackup } from '../data/transfer/exportService'
import { bootstrapOfficialContent, isOfficialContentInstalled } from '../data/bootstrap'
import type { ContentPackRecord } from '../data/db/records'
import type { ImportPreview, ImportResult } from '../data/transfer/transferTypes'

export function DevStoragePanel() {
  const [installedPacks, setInstalledPacks] = useState<ContentPackRecord[]>([])
  const [isOfficialInstalled, setIsOfficialInstalled] = useState<boolean>(false)
  const [inputText, setInputText] = useState<string>('')
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [resultMessage, setResultMessage] = useState<ImportResult | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const refreshState = useCallback(async () => {
    const repo = new ContentPackRepository(db)
    const packs = await repo.getAllPacks()
    setInstalledPacks(packs)
    const officialInstalled = await isOfficialContentInstalled(db)
    setIsOfficialInstalled(officialInstalled)
  }, [])

  useEffect(() => {
    refreshState().catch(console.error)
  }, [refreshState])

  async function handleBootstrap() {
    setIsLoading(true)
    setResultMessage(null)
    try {
      const res = await bootstrapOfficialContent(db)
      setResultMessage(res)
      await refreshState()
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGeneratePreview(jsonStr: string) {
    if (!jsonStr.trim()) {
      setPreview(null)
      return
    }

    try {
      const parsed: unknown = JSON.parse(jsonStr)
      const prev = await generateImportPreview(parsed, db)
      setPreview(prev)
      setResultMessage(null)
    } catch {
      setPreview({
        valid: false,
        sourceType: 'content_pack',
        unitCount: 0,
        itemCount: 0,
        itemsByKind: {},
        proposedAction: 'invalid',
        checksum: '',
        warnings: [],
        errors: [{ path: 'json', code: 'JSON_PARSE_ERROR', message: 'El texto ingresado no es un JSON válido.' }],
      })
    }
  }

  async function handleConfirmImport() {
    if (!preview) return
    setIsLoading(true)
    try {
      const res = await confirmImport(preview, db)
      setResultMessage(res)
      if (res.success) {
        setPreview(null)
        setInputText('')
        await refreshState()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExportBackup() {
    try {
      const backup = await exportFullBackup(db)
      const jsonStr = JSON.stringify(backup, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `typeops-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error(err)
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setInputText(text)
      handleGeneratePreview(text).catch(console.error)
    }
    reader.readAsText(file)
  }

  return (
    <section className="storage-panel" aria-labelledby="storage-panel-heading">
      <h2 id="storage-panel-heading" className="storage-panel-title">
        Persistencia e Intercambio (IndexedDB — Hito 2)
      </h2>

      {/* Lista de packs instalados */}
      <div className="storage-section">
        <h3>Packs Instalados ({installedPacks.length})</h3>
        {installedPacks.length === 0 ? (
          <p className="storage-empty">No hay packs instalados en IndexedDB.</p>
        ) : (
          <ul className="storage-pack-list">
            {installedPacks.map((p) => (
              <li key={p.packId} className="storage-pack-item">
                <div>
                  <strong>{p.title}</strong> (v{p.packVersion}) — ID: {p.packId}
                  <div className="storage-pack-meta">
                    {p.content.units.length} unidades | {p.content.items.length} ítems | Checksum: {p.checksum.substring(0, 8)}...
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="storage-actions">
          {!isOfficialInstalled && (
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                handleBootstrap().catch(console.error)
              }}
              disabled={isLoading}
            >
              Instalar pack oficial (Foundations es-AR)
            </button>
          )}

          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              handleExportBackup().catch(console.error)
            }}
            disabled={installedPacks.length === 0}
          >
            Exportar copia de seguridad (JSON)
          </button>
        </div>
      </div>

      {/* Importación y Vista Previa */}
      <div className="storage-section">
        <h3>Importar Contenido o Backup</h3>
        <div className="storage-upload-controls">
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            id="json-file-input"
            aria-label="Seleccionar archivo JSON"
          />
          <textarea
            className="storage-textarea"
            rows={4}
            placeholder="O pegá aquí el contenido JSON a importar..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              handleGeneratePreview(e.target.value).catch(console.error)
            }}
          />
        </div>

        {/* Vista previa de importación */}
        {preview && (
          <div className={`storage-preview ${preview.valid ? 'storage-preview--valid' : 'storage-preview--invalid'}`}>
            <h4>Vista Previa de Importación</h4>
            <p>
              <strong>Formato:</strong> {preview.sourceType === 'content_pack' ? 'ContentPack' : 'Backup Envelope'}{' '}
              | <strong>Acción propuesta:</strong> <span className="badge">{preview.proposedAction}</span>
            </p>
            {preview.title && <p><strong>Título:</strong> {preview.title} (v{preview.packVersion})</p>}
            <p>
              <strong>Contenido:</strong> {preview.unitCount} unidades, {preview.itemCount} ítems
            </p>

            {preview.warnings.length > 0 && (
              <div className="storage-warnings">
                <strong>Advertencias / Notas:</strong>
                <ul>
                  {preview.warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}

            {preview.errors.length > 0 && (
              <div className="storage-errors" role="alert">
                <strong>Errores de validación:</strong>
                <ul>
                  {preview.errors.map((e, idx) => (
                    <li key={idx}>[{e.code}] {e.path}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {preview.valid && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  handleConfirmImport().catch(console.error)
                }}
                disabled={isLoading}
              >
                Confirmar Importación
              </button>
            )}
          </div>
        )}

        {/* Resultado de importación */}
        {resultMessage && (
          <div className={`storage-result ${resultMessage.success ? 'storage-result--success' : 'storage-result--error'}`}>
            <p><strong>Resultado:</strong> {resultMessage.message}</p>
          </div>
        )}
      </div>
    </section>
  )
}
