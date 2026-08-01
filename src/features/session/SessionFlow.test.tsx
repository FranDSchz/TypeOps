import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestDatabase, type TypeOpsDatabase } from '../../data/db/database'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, GuidedPracticeItem } from '../../domain/content/types'
import { SessionRunnerView } from './SessionRunnerView'
import { SessionConfigView } from './SessionConfigView'
import { useSession } from './useSession'
import { ItemPresenter } from './ItemPresenter'

function TestSessionApp({ db, pack }: { db: TypeOpsDatabase; pack: ContentPack }) {
  const {
    state,
    startRecommendedSession,
    startConfiguring,
    initSession,
    useHint,
    submitResponse,
    advanceNextItem,
    finishSession,
    exitSession,
  } = useSession(db, pack)

  if (state.status === 'idle') {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            void startRecommendedSession()
          }}
        >
          Iniciar sesión recomendada
        </button>
        <button
          type="button"
          onClick={() => {
            startConfiguring()
          }}
        >
          Configuración personalizada
        </button>
      </div>
    )
  }

  if (state.status === 'configuring') {
    return (
      <SessionConfigView
        onStartSession={(mode, targetDurationSeconds, targetCount, userFocusCategory) => {
          void initSession(mode, targetDurationSeconds, targetCount, userFocusCategory)
        }}
        onCancel={() => {
          void exitSession(false)
        }}
      />
    )
  }

  return (
    <SessionRunnerView
      state={state}
      onSubmitResponse={(responseRaw, durationMs) => {
        void submitResponse(responseRaw, durationMs)
      }}
      onUseHint={useHint}
      onAdvanceNextItem={() => {
        void advanceNextItem()
      }}
      onFinishSession={() => {
        void finishSession('time_expired')
      }}
      onExitSession={(saveAsAbandoned) => {
        void exitSession(saveAsAbandoned)
      }}
    />
  )
}

describe('Session UI Flow (Paso 4 - RTL & Observaciones Hito 4)', () => {
  let testDb: TypeOpsDatabase
  const pack = officialPack as ContentPack

  beforeEach(() => {
    testDb = createTestDatabase()
  })

  afterEach(() => {
    testDb.close()
  })

  it('inicia sesión rápida en ruta AC-01 con un solo click', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    const fastPathButton = screen.getByRole('button', { name: 'Iniciar sesión recomendada' })
    expect(fastPathButton).toBeInTheDocument()

    await user.click(fastPathButton)

    // Debe abrir la sesión directamente presentando el primer ítem
    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Enviar respuesta/i })).toBeInTheDocument()
  })

  it('permite abrir configuración personalizada y seleccionar modo', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    await user.click(screen.getByRole('button', { name: 'Configuración personalizada' }))

    expect(screen.getByRole('region', { name: 'Configuración de sesión' })).toBeInTheDocument()

    const submitConfigBtn = screen.getByRole('button', { name: 'Iniciar sesión personalizada' })
    await user.click(submitConfigBtn)

    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()
  })

  it('verifica que el placeholder de command_intention no revela la solución', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    await user.click(screen.getByRole('button', { name: 'Configuración personalizada' }))
    await user.click(screen.getByText('Comando desde intención'))
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión personalizada' }))

    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()
    const input = screen.getByLabelText('Comando Bash:')
    const placeholder = input.getAttribute('placeholder')

    expect(placeholder).not.toContain('tail')
    expect(placeholder).not.toContain('auth.log')
    expect(placeholder).not.toContain('-n 20')
    expect(placeholder).toBe('Escribí el comando...')
  })

  it('evalúa como respuesta requerida (incorrecta) un texto vacío en guided_practice', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    // Iniciar sesión recomendada (modo guided por defecto)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))

    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

    // Enviar respuesta vacía
    const submitBtn = screen.getByRole('button', { name: /Enviar respuesta/i })
    await user.click(submitBtn)

    // Debe presentar la respuesta como requerida (incorrecta por ser vacía)
    expect(await screen.findByText(/Respuesta requerida para la etapa/i)).toBeInTheDocument()
    expect(screen.getByText(/requiere una respuesta para avanzar/i)).toBeInTheDocument()
  })

  it('muestra feedback neutral "Etapa completada / Intento registrado" para respuestas en guided_practice sin afirmar "Respuesta correcta"', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))
    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

    const input = screen.getByLabelText('Respuesta:')
    await user.type(input, 'texto arbitrario de prueba')

    const submitBtn = screen.getByRole('button', { name: /Enviar respuesta/i })
    await user.click(submitBtn)

    // Debe mostrar la etiqueta neutral de etapa completada / intento registrado y NO "Respuesta correcta"
    expect(await screen.findByText(/Etapa completada \/ Intento registrado/i)).toBeInTheDocument()
    expect(screen.queryByText('✔ Respuesta correcta')).toBeNull()
  })

  it('muestra un error estructurado si un ítem guided carece de etapas evaluables', () => {
    const guidedWithoutEvaluableStages: GuidedPracticeItem = {
      itemId: 'guided-no-eval',
      kind: 'guided_practice',
      mode: 'guided',
      unitId: 'unit-log-inspection',
      unitIds: ['unit-log-inspection'],
      title: 'Práctica guiada sin evaluación',
      context: 'Sin etapa evaluable.',
      task: 'Leer modelo',
      responseFormat: 'ninguno',
      maxResponse: { lines: 1 },
      estimatedSeconds: 60,
      categories: ['linux'],
      skills: [],
      difficulty: 1,
      prerequisiteUnitIds: ['unit-linux-basics'],
      hints: [],
      explanation: 'Explicación',
      categoryVisibility: 'visible',
      securityContext: { scope: 'safe_inert', targets: ['localhost'], executionAllowed: false },
      mechanicalSequences: [],
      sourceNotes: [],
      enabled: true,
      resumePolicy: 'next_incomplete_stage',
      promotionRule: 'complete_all',
      stages: [
        { stageId: 'stg-model-only', stageType: 'model', title: 'Modelo solo', content: 'Contenido' },
      ],
    }

    render(
      <ItemPresenter
        item={guidedWithoutEvaluableStages}
        activeHintLevel={0}
        onSubmitResponse={() => {}}
      />,
    )

    expect(screen.getByText(/No se encontró una etapa evaluable compatible en este ítem guiado/i)).toBeInTheDocument()
  })
})
