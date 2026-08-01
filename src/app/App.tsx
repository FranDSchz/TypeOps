import { loadContentPack } from '../domain/content/loader'
import officialPack from '../content/typeops-foundations-es-ar/pack.json'
import './App.css'

/**
 * TypeOps — App shell mínimo (Hito 1: Contrato y Loader de Contenido)
 *
 * Mantiene la navegación accesible y añade una integración mínima aislada
 * para verificar que el ContentPack oficial se valida y carga correctamente.
 */

interface ModeDefinition {
  id: string
  label: string
  title: string
  description: string
  shortcut: string
}

const MODES: ModeDefinition[] = [
  {
    id: 'typing',
    label: 'Modo 1',
    title: 'Typing técnico',
    description: 'Copiá fragmentos técnicos coherentes. Se registran errores iniciales, correcciones y latencias.',
    shortcut: '1',
  },
  {
    id: 'command',
    label: 'Modo 2',
    title: 'Comando desde intención',
    description: 'Escribí el comando que satisface una intención operacional. Evaluación por dimensiones.',
    shortcut: '2',
  },
  {
    id: 'review',
    label: 'Modo 3',
    title: 'Repaso y decisiones',
    description: 'Recuperación conceptual, siguiente acción, interpretación de output y verificación.',
    shortcut: '3',
  },
  {
    id: 'guided',
    label: 'Modo 4',
    title: 'Práctica guiada',
    description: 'Seis etapas: modelo, sintaxis, ejemplo, ejercicio guiado, sin ayuda y variante posterior.',
    shortcut: '4',
  },
]

function ModeCard({ mode }: { mode: ModeDefinition }) {
  function handleClick() {
    console.info(`Modo seleccionado: ${mode.id} (no implementado aún — Hito 4)`)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      type="button"
      className="mode-card"
      id={`mode-${mode.id}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`${mode.title}: ${mode.description}`}
    >
      <span className="mode-card-label" aria-hidden="true">
        {mode.label}
      </span>
      <span className="mode-card-title">{mode.title}</span>
      <span className="mode-card-desc">{mode.description}</span>
      <span className="badge badge--wip" aria-label="Próximamente disponible">
        Hito 4
      </span>
    </button>
  )
}

/**
 * Componente de desarrollo / soporte para mostrar el estado del contrato de contenido.
 */
function ContentPackStatusBanner() {
  const loadResult = loadContentPack(officialPack)

  if (!loadResult.success) {
    return (
      <div className="content-status content-status--error" role="alert">
        <strong>Error de validación del pack de contenido:</strong>
        <ul>
          {loadResult.errors.map((err, idx) => (
            <li key={idx}>
              [{err.code}] {err.path}: {err.message}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const pack = loadResult.pack
  const countsByKind = pack.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.kind] = (acc[item.kind] ?? 0) + 1
    return acc
  }, {})

  const typingCount = countsByKind['typing_copy'] ?? 0
  const commandCount = countsByKind['command_intention'] ?? 0
  const reviewCount =
    (countsByKind['exact_question'] ?? 0) +
    (countsByKind['open_question'] ?? 0) +
    (countsByKind['decision'] ?? 0)
  const guidedCount = countsByKind['guided_practice'] ?? 0

  return (
    <aside
      className="content-status content-status--valid"
      aria-label="Estado del contrato de contenido"
    >
      <span className="badge badge--valid">Contrato 1.0.0 OK</span>
      <span className="content-status-info">
        Pack <strong>{pack.title}</strong> ({pack.packVersion}): {pack.items.length} ítems validados
        ({typingCount} typing, {commandCount} command, {reviewCount} review, {guidedCount} guided).
      </span>
    </aside>
  )
}

export function App() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <header className="app-header" role="banner">
        <span className="app-logo" aria-label="TypeOps">
          TypeOps
          <span className="app-logo-sub" aria-hidden="true">v1</span>
        </span>
      </header>

      <main id="main-content" className="app-main" role="main">
        <section className="home-screen" aria-labelledby="home-heading">
          <div>
            <h1 id="home-heading" className="home-title">
              Micropráctica adaptativa
            </h1>
            <p className="home-subtitle">
              Sesiones de 2 a 10 minutos. Sin cuenta. Sin red. Sin formularios.
            </p>
          </div>

          <ContentPackStatusBanner />

          <nav aria-label="Modos de práctica">
            <div
              className="mode-grid"
              role="list"
              aria-label="Cuatro modos disponibles"
            >
              {MODES.map((mode) => (
                <div key={mode.id} role="listitem">
                  <ModeCard mode={mode} />
                </div>
              ))}
            </div>
          </nav>
        </section>
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
