import { useState, useEffect, useCallback } from 'react'
import { DevStoragePanel } from './DevStoragePanel'
import { db } from '../data/db/database'
import officialPack from '../content/typeops-foundations-es-ar/pack.json'
import { loadContentPack } from '../domain/content/loader'
import type { ContentItemMode, ContentPack } from '../domain/content/types'
import { useSession } from '../features/session/useSession'
import { SessionConfigView } from '../features/session/SessionConfigView'
import { SessionRunnerView } from '../features/session/SessionRunnerView'
import { PriorKnowledgeRepository } from '../data/repositories/priorKnowledgeRepository'
import './App.css'

interface ModeDefinition {
  id: ContentItemMode
  label: string
  title: string
  description: string
}

const MODES: ModeDefinition[] = [
  {
    id: 'typing',
    label: 'Modo 1',
    title: 'Typing técnico',
    description: 'Copiá fragmentos técnicos coherentes.',
  },
  {
    id: 'command',
    label: 'Modo 2',
    title: 'Comando desde intención',
    description: 'Escribí el comando que satisface una intención operacional.',
  },
  {
    id: 'review',
    label: 'Modo 3',
    title: 'Repaso y decisiones',
    description: 'Recuperación conceptual, siguiente acción, interpretación de output y verificación.',
  },
  {
    id: 'guided',
    label: 'Modo 4',
    title: 'Práctica guiada',
    description: 'Secuencia interactiva guiada por etapas.',
  },
]

export function App() {
  const [pack, setPack] = useState<ContentPack | null>(null)
  const [priorKnowledgeUnitIds, setPriorKnowledgeUnitIds] = useState<string[]>([])

  const refreshPriorKnowledge = useCallback(async () => {
    if (!pack) return
    const pkRepo = new PriorKnowledgeRepository(db)
    const records = await pkRepo.getAllForPack(pack.packId, pack.packVersion)
    setPriorKnowledgeUnitIds(records.map((r) => r.unitId))
  }, [pack])

  useEffect(() => {
    const loaded = loadContentPack(officialPack)
    if (loaded.success) {
      setPack(loaded.pack)
    }
  }, [])

  useEffect(() => {
    if (pack) {
      refreshPriorKnowledge().catch(console.error)
    }
  }, [pack, refreshPriorKnowledge])

  const handleTogglePriorKnowledge = async (unitId: string, isMarked: boolean) => {
    if (!pack) return
    const pkRepo = new PriorKnowledgeRepository(db)
    if (isMarked) {
      await pkRepo.markPriorKnowledge(pack.packId, pack.packVersion, unitId)
    } else {
      await pkRepo.unmarkPriorKnowledge(pack.packId, pack.packVersion, unitId)
    }
    await refreshPriorKnowledge()
  }

  const {
    state,
    startRecommendedSession,
    startConfiguring,
    initSession,
    useHint,
    submitResponse,
    advanceNextItem,
    advanceExpositoryStage,
    finishSession,
    exitSession,
  } = useSession(db, pack)

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="app-header" role="banner">
        <span className="app-logo" aria-label="TypeOps">
          TypeOps
          <span className="app-logo-sub" aria-hidden="true">V1</span>
        </span>
      </header>

      <main id="main-content" className="app-main" role="main">
        {state.status === 'idle' && (
          <section className="home-screen" aria-labelledby="home-heading">
            <div>
              <h1 id="home-heading" className="home-title">
                Micropráctica adaptativa
              </h1>
              <p className="home-subtitle">
                Sesiones de 2 a 10 minutos. Sin cuenta. Sin red. Sin formularios.
              </p>
            </div>

            {/* Ruta Rápida AC-01: Iniciar sesión recomendada en 1 acción/tecla */}
            <div className="fast-path-box">
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={() => {
                  void startRecommendedSession()
                }}
              >
                Iniciar sesión recomendada (Enter)
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  startConfiguring()
                }}
              >
                Configuración personalizada
              </button>
            </div>

            <DevStoragePanel />

            <nav aria-label="Modos de práctica">
              <div className="mode-grid" role="list" aria-label="Cuatro modos disponibles">
                {MODES.map((mode) => (
                  <div key={mode.id} role="listitem">
                    <button
                      type="button"
                      className="mode-card"
                      id={`mode-${mode.id}`}
                      onClick={() => {
                        void initSession(mode.id, 300)
                      }}
                      aria-label={`${mode.title}: ${mode.description}`}
                    >
                      <span className="mode-card-label" aria-hidden="true">
                        {mode.label}
                      </span>
                      <span className="mode-card-title">{mode.title}</span>
                      <span className="mode-card-desc">{mode.description}</span>
                    </button>
                  </div>
                ))}
              </div>
            </nav>
          </section>
        )}

        {state.status === 'configuring' && (
          <SessionConfigView
            categories={pack ? Array.from(new Set(pack.items.flatMap((i) => i.categories))) : []}
            units={pack ? pack.units.map((u) => ({ unitId: u.unitId, title: u.title, summary: u.summary })) : []}
            priorKnowledgeUnitIds={priorKnowledgeUnitIds}
            onTogglePriorKnowledge={(unitId, isMarked) => {
              void handleTogglePriorKnowledge(unitId, isMarked)
            }}
            onStartSession={(mode, targetDurationSeconds, targetCount, userFocusCategory) => {
              void initSession(mode, targetDurationSeconds, targetCount, userFocusCategory)
            }}
            onCancel={() => {
              void exitSession(false)
            }}
          />
        )}

        {state.status !== 'idle' && state.status !== 'configuring' && (
          <SessionRunnerView
            db={db}
            state={state}
            onSubmitResponse={(responseRaw, durationMs) => {
              void submitResponse(responseRaw, durationMs)
            }}
            onUseHint={useHint}
            onAdvanceExpositoryStage={(stageId) => {
              void advanceExpositoryStage(stageId)
            }}
            onAdvanceNextItem={() => {
              void advanceNextItem()
            }}
            onFinishSession={() => {
              void finishSession('time_expired')
            }}
            onExitSession={(saveAsAbandoned) => {
              void exitSession(saveAsAbandoned)
            }}
            onStartTargetGuided={(targetItemId) => {
              void initSession('guided', 300, undefined, undefined, targetItemId)
            }}
          />
        )}
      </main>

      <footer className="app-footer" role="contentinfo">
        <p>
          TypeOps — local-first, monousuario, sin backend.{' '}
          <span aria-hidden="true">⌨</span>
        </p>
      </footer>
    </div>
  )
}
