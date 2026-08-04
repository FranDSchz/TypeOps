import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createTestDatabase, type TypeOpsDatabase } from '../../data/db/database'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { ContentPack, ContentItem, GuidedPracticeItem } from '../../domain/content/types'
import type { SessionRecord, AttemptRecord } from '../../data/db/records'
import type { SessionUIState } from './sessionReducer'
import { SessionRunnerView } from './SessionRunnerView'
import { SessionConfigView } from './SessionConfigView'
import { SessionSummaryView } from './SessionSummaryView'
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
      db={db}
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

  beforeEach(async () => {
    testDb = createTestDatabase()
    await testDb.priorKnowledge.put({
      compositeKey: `${pack.packId}:${pack.packVersion}:unit-log-inspection`,
      packId: pack.packId,
      packVersion: pack.packVersion,
      unitId: 'unit-log-inspection',
      source: 'user_configured',
      updatedAt: new Date().toISOString(),
    })
    await testDb.priorKnowledge.put({
      compositeKey: `${pack.packId}:${pack.packVersion}:unit-linux-basics`,
      packId: pack.packId,
      packVersion: pack.packVersion,
      unitId: 'unit-linux-basics',
      source: 'user_configured',
      updatedAt: new Date().toISOString(),
    })
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
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument()
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

  it('muestra el diagnóstico real ante una respuesta incorrecta en command_intention', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    await user.click(screen.getByRole('button', { name: 'Configuración personalizada' }))
    await user.click(screen.getByText('Comando desde intención'))
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión personalizada' }))

    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()
    const input = screen.getByLabelText('Comando Bash:')
    await user.type(input, 'ls -la /var/log')

    const submitBtn = screen.getByRole('button', { name: /Enviar respuesta/i })
    await user.click(submitBtn)

    expect(await screen.findByText(/Respuesta incorrecta/i)).toBeInTheDocument()
  })

  it('bloquea el envío con respuesta vacía en guided_practice mostrando la alerta accesible', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    // Iniciar sesión recomendada (modo guided por defecto)
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))
    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

    // Avanzar las 3 etapas expositivas (Continuar)
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 2/i })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 3/i })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 4/i })).toBeInTheDocument()

    // Enviar respuesta vacía en la etapa 4 evaluable
    const submitBtn = await screen.findByRole('button', { name: /Enviar respuesta/i })
    await user.click(submitBtn)

    // Debe mostrar la alerta de validación y NO avanzar a feedback
    const alert = await screen.findByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent('Esta etapa requiere una respuesta para avanzar')
  })

  it('muestra feedback al responder en la etapa 4 de guided_practice', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))
    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

    // Avanzar las 3 etapas expositivas (Continuar)
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 2/i })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 3/i })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Continuar' }))
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 4/i })).toBeInTheDocument()

    const input = await screen.findByRole('textbox', { name: /Respuesta:/i })
    await user.type(input, 'tail -n 20 /var/log/auth.log')

    const submitBtn = screen.getByRole('button', { name: /Enviar respuesta/i })
    await user.click(submitBtn)

    expect(await screen.findByText(/Respuesta correcta para la etapa/i)).toBeInTheDocument()
  })

  it('permite omitir un ejercicio mostrando el banner de ejercicio omitido', async () => {
    const user = userEvent.setup()
    render(<TestSessionApp db={testDb} pack={pack} />)

    await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))
    expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

    const skipBtn = screen.getByRole('button', { name: 'Omitir ejercicio' })
    await user.click(skipBtn)

    expect(await screen.findByText(/Ejercicio omitido/i)).toBeInTheDocument()
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

    expect(screen.getByText(/Modelo solo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Continuar/i })).toBeInTheDocument()
  })

  describe('Reglas de visibilidad y conservación de pistas (Hito 4)', () => {
    it('1. typing_copy con texto objetivo visible NO muestra el botón "Pedir pista"', () => {
      const typingItem = pack.items.find((i) => i.kind === 'typing_copy') as ContentItem
      const mockState: SessionUIState = {
        status: 'active',
        sessionRecord: null,
        sessionPlan: {
          items: [{ item: typingItem, reasonCode: 'practice', reasonDescription: 'test' }],
          estimatedTotalDurationSeconds: 300,
          presetName: '5_minutes',
        },
        currentPlanIndex: 0,
        currentTurnAttemptId: 'att-1',
        hintsUsedCount: 0,
        activeHintLevel: 0,
        lastSubmittedAttempt: null,
        submittedAttempts: [],
        emptyReason: null,
        compositionResult: null,
        recoveryError: null,
        closeError: null,
        summaryRecommendation: null,
      }

      render(
        <SessionRunnerView
          state={mockState}
          onSubmitResponse={() => {}}
          onUseHint={() => {}}
          onAdvanceNextItem={() => {}}
          onFinishSession={() => {}}
          onExitSession={() => {}}
        />,
      )

      expect(screen.queryByRole('button', { name: /Pedir pista/i })).toBeNull()
    })

    it('2. open_question sin pistas NO muestra "Pedir pista (0 restantes)"', () => {
      const openItem = pack.items.find((i) => i.kind === 'open_question') as ContentItem
      const mockState: SessionUIState = {
        status: 'active',
        sessionRecord: null,
        sessionPlan: {
          items: [{ item: openItem, reasonCode: 'practice', reasonDescription: 'test' }],
          estimatedTotalDurationSeconds: 300,
          presetName: '5_minutes',
        },
        currentPlanIndex: 0,
        currentTurnAttemptId: 'att-2',
        hintsUsedCount: 0,
        activeHintLevel: 0,
        lastSubmittedAttempt: null,
        submittedAttempts: [],
        emptyReason: null,
        compositionResult: null,
        recoveryError: null,
        closeError: null,
        summaryRecommendation: null,
      }

      render(
        <SessionRunnerView
          state={mockState}
          onSubmitResponse={() => {}}
          onUseHint={() => {}}
          onAdvanceNextItem={() => {}}
          onFinishSession={() => {}}
          onExitSession={() => {}}
        />,
      )

      expect(screen.queryByRole('button', { name: /Pedir pista/i })).toBeNull()
      expect(screen.queryByText(/0 restantes/i)).toBeNull()
    })

    it('3. un ítem con pistas disponibles (command_intention) SÍ muestra el botón "Pedir pista"', () => {
      const cmdItem = pack.items.find((i) => i.kind === 'command_intention') as ContentItem
      const mockState: SessionUIState = {
        status: 'active',
        sessionRecord: null,
        sessionPlan: {
          items: [{ item: cmdItem, reasonCode: 'practice', reasonDescription: 'test' }],
          estimatedTotalDurationSeconds: 300,
          presetName: '5_minutes',
        },
        currentPlanIndex: 0,
        currentTurnAttemptId: 'att-3',
        hintsUsedCount: 0,
        activeHintLevel: 0,
        lastSubmittedAttempt: null,
        submittedAttempts: [],
        emptyReason: null,
        compositionResult: null,
        recoveryError: null,
        closeError: null,
        summaryRecommendation: null,
      }

      render(
        <SessionRunnerView
          state={mockState}
          onSubmitResponse={() => {}}
          onUseHint={() => {}}
          onAdvanceNextItem={() => {}}
          onFinishSession={() => {}}
          onExitSession={() => {}}
        />,
      )

      const hintBtn = screen.getByRole('button', { name: /Pedir pista/i })
      expect(hintBtn).toBeInTheDocument()
      expect(hintBtn).toBeEnabled()
      expect(hintBtn).toHaveTextContent('Pedir pista (1 restantes)')
    })

    it('4. usar una pista incrementa el nivel de pista visible y actualiza el contador', () => {
      const cmdItem = pack.items.find((i) => i.kind === 'command_intention') as ContentItem

      render(
        <ItemPresenter
          item={cmdItem}
          activeHintLevel={1}
          onSubmitResponse={() => {}}
        />,
      )

      expect(screen.getByRole('region', { name: 'Pistas activadas' })).toBeInTheDocument()
      expect(screen.getByText(/Usá la herramienta tail con la opción -n/i)).toBeInTheDocument()
    })

    it('5. al agotar las pistas el botón queda deshabilitado indicando "Sin más pistas disponibles"', () => {
      const cmdItem = pack.items.find((i) => i.kind === 'command_intention') as ContentItem
      const mockState: SessionUIState = {
        status: 'active',
        sessionRecord: null,
        sessionPlan: {
          items: [{ item: cmdItem, reasonCode: 'practice', reasonDescription: 'test' }],
          estimatedTotalDurationSeconds: 300,
          presetName: '5_minutes',
        },
        currentPlanIndex: 0,
        currentTurnAttemptId: 'att-5',
        hintsUsedCount: 1,
        activeHintLevel: 1, // Pista usada
        lastSubmittedAttempt: null,
        submittedAttempts: [],
        emptyReason: null,
        compositionResult: null,
        recoveryError: null,
        closeError: null,
        summaryRecommendation: null,
      }

      render(
        <SessionRunnerView
          state={mockState}
          onSubmitResponse={() => {}}
          onUseHint={() => {}}
          onAdvanceNextItem={() => {}}
          onFinishSession={() => {}}
          onExitSession={() => {}}
        />,
      )

      const disabledBtn = screen.getByRole('button', { name: /No quedan más pistas disponibles para este ejercicio/i })
      expect(disabledBtn).toBeInTheDocument()
      expect(disabledBtn).toBeDisabled()
      expect(disabledBtn).toHaveTextContent('Sin más pistas disponibles')
    })

    it('6. el resumen de sesión conserva y presenta correctamente hintsUsedCount', () => {
      const mockSessionRecord: SessionRecord = {
        sessionId: 'sess-summary-hints',
        packId: 'typeops-foundations-es-ar',
        packVersion: '1.0.0',
        mode: 'command',
        presetName: '5_minutes',
        startedAt: new Date().toISOString(),
        deadlineAt: null,
        planItems: [{ itemId: 'cmd-tail-n', unitId: 'unit-log-inspection', reasonCode: 'practice', reasonDescription: 'test' }],
        currentIndex: 1,
        status: 'completed',
        completionReason: 'items_completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const mockAttempt: AttemptRecord = {
        attemptId: 'att-summary-1',
        sessionId: 'sess-summary-hints',
        packId: 'typeops-foundations-es-ar',
        packVersion: '1.0.0',
        itemId: 'cmd-tail-n',
        unitId: 'unit-log-inspection',
        responseRaw: 'tail -n 20 /var/log/auth.log',
        evaluationResult: {
          status: 'correct',
          dimensionResults: {
            concept: 'correct',
            toolSelection: 'correct',
            semanticStructure: 'correct',
            syntax: 'correct',
            interpretation: 'not_assessed',
            verification: 'not_assessed',
            mechanical: 'not_assessed',
          },
          errorCodes: [],
          requiresReview: false,
        },
        workflowStatus: 'evaluated',
        hintsUsedCount: 1,
        durationMs: 5000,
        createdAt: new Date().toISOString(),
      }

      render(
        <SessionSummaryView
          sessionRecord={mockSessionRecord}
          submittedAttempts={[mockAttempt]}
          summaryRecommendation={null}
          onFinish={() => {}}
        />,
      )

      expect(screen.getByRole('region', { name: 'Resumen de cierre de sesión' })).toBeInTheDocument()
      expect(screen.getByText('Pistas utilizadas')).toBeInTheDocument()
      expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Validación de respuestas vacías o incompletas y ruta de omisión (Hito 4)', () => {
    it('1. open_question vacío: muestra error role="alert", no invoca onSubmitResponse y enfoca el textarea', async () => {
      const user = userEvent.setup()
      const openItem = pack.items.find((i) => i.kind === 'open_question') as ContentItem
      const handleSubmit = vi.fn()

      render(
        <ItemPresenter
          item={openItem}
          activeHintLevel={0}
          onSubmitResponse={handleSubmit}
        />,
      )

      const submitBtn = screen.getByRole('button', { name: /Enviar respuesta/i })
      await user.click(submitBtn)

      const alert = await screen.findByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent('Debés escribir una explicación antes de enviar.')
      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('2. command_intention vacío o con espacios: no evalúa ni invoca onSubmitResponse', async () => {
      const user = userEvent.setup()
      const cmdItem = pack.items.find((i) => i.kind === 'command_intention') as ContentItem
      const handleSubmit = vi.fn()

      render(
        <ItemPresenter
          item={cmdItem}
          activeHintLevel={0}
          onSubmitResponse={handleSubmit}
        />,
      )

      const input = screen.getByLabelText('Comando Bash:')
      await user.type(input, '   ')
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent('Debés escribir un comando antes de enviar.')
      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('3. typing_copy vacío: no evalúa ni invoca onSubmitResponse', async () => {
      const user = userEvent.setup()
      const typingItem = pack.items.find((i) => i.kind === 'typing_copy') as ContentItem
      const handleSubmit = vi.fn()

      render(
        <ItemPresenter
          item={typingItem}
          activeHintLevel={0}
          onSubmitResponse={handleSubmit}
        />,
      )

      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent('Debés ingresar el texto antes de enviar la respuesta.')
      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('4. exact_question sin opción: muestra alerta y enfoca el grupo de opciones', async () => {
      const user = userEvent.setup()
      const exactItem = pack.items.find((i) => i.kind === 'exact_question') as ContentItem
      const handleSubmit = vi.fn()

      render(
        <ItemPresenter
          item={exactItem}
          activeHintLevel={0}
          onSubmitResponse={handleSubmit}
        />,
      )

      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent('Debés seleccionar una opción antes de enviar.')
      expect(handleSubmit).not.toHaveBeenCalled()
    })

    it('5. decision incompleta: requiere elección y evidencia requerida según el item', async () => {
      const user = userEvent.setup()
      const decisionItem = pack.items.find((i) => i.kind === 'decision') as ContentItem
      const handleSubmit = vi.fn()

      render(
        <ItemPresenter
          item={decisionItem}
          activeHintLevel={0}
          onSubmitResponse={handleSubmit}
        />,
      )

      // Sin selección
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Debés seleccionar una decisión antes de enviar.')
      expect(handleSubmit).not.toHaveBeenCalled()

      // Con decisión pero sin evidencia requerida
      const choiceRadio = screen.getByLabelText(/Identificar actividad de recon/i)
      await user.click(choiceRadio)
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

      expect(await screen.findByRole('alert')).toHaveTextContent('Debés seleccionar al menos una evidencia requerida.')
      expect(handleSubmit).not.toHaveBeenCalled()

      // Con decisión y evidencia
      const evidenceCheckbox = screen.getByLabelText(/150 peticiones GET/i)
      await user.click(evidenceCheckbox)
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('6. guided_practice vacía: no avanza mediante "Enviar respuesta", pero "Omitir" funciona por la ruta separada', async () => {
      const user = userEvent.setup()
      render(<TestSessionApp db={testDb} pack={pack} />)

      await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))
      expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

      // Avanzar las 3 etapas expositivas (Continuar)
      await user.click(await screen.findByRole('button', { name: 'Continuar' }))
      expect(await screen.findByRole('heading', { level: 3, name: /Etapa 2/i })).toBeInTheDocument()
      await user.click(await screen.findByRole('button', { name: 'Continuar' }))
      expect(await screen.findByRole('heading', { level: 3, name: /Etapa 3/i })).toBeInTheDocument()
      await user.click(await screen.findByRole('button', { name: 'Continuar' }))
      expect(await screen.findByRole('heading', { level: 3, name: /Etapa 4/i })).toBeInTheDocument()

      // Intentar enviar respuesta vacía en la etapa 4 (guided_exercise) -> no avanza a feedback
      await user.click(await screen.findByRole('button', { name: /Enviar respuesta/i }))
      expect(await screen.findByRole('alert')).toHaveTextContent('Esta etapa requiere una respuesta para avanzar')

      // Omitir ejercicio -> avanza por la ruta de omisión
      await user.click(screen.getByRole('button', { name: 'Omitir ejercicio' }))
      expect(await screen.findByText(/Ejercicio omitido/i)).toBeInTheDocument()
    })

    it('7. para cada ítem, pulsar "Omitir ejercicio" registra la omisión sin evaluar ni alterar progreso positivo o negativo', async () => {
      const user = userEvent.setup()
      render(<TestSessionApp db={testDb} pack={pack} />)

      await user.click(screen.getByRole('button', { name: 'Iniciar sesión recomendada' }))
      expect(await screen.findByRole('region', { name: /Sesión interactiva en curso/i })).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Omitir ejercicio' }))
      expect(await screen.findByText(/Ejercicio omitido/i)).toBeInTheDocument()
      expect(screen.queryByText(/Respuesta correcta/i)).toBeNull()
      expect(screen.queryByText(/Respuesta incorrecta/i)).toBeNull()
    })

    it('8. doble envío o clic repetido sobre una validación fallida no crea intentos ni duplica mensajes o avance', async () => {
      const user = userEvent.setup()
      const openItem = pack.items.find((i) => i.kind === 'open_question') as ContentItem
      const handleSubmit = vi.fn()

      render(
        <ItemPresenter
          item={openItem}
          activeHintLevel={0}
          onSubmitResponse={handleSubmit}
        />,
      )

      const submitBtn = screen.getByRole('button', { name: /Enviar respuesta/i })

      // Enviar repetidamente con la entrada vacía
      await user.click(submitBtn)
      await user.click(submitBtn)

      expect(handleSubmit).not.toHaveBeenCalled()
      const alerts = screen.getAllByRole('alert')
      expect(alerts).toHaveLength(1)
    })

    it('9. el resumen distingue respondidos, pendientes de revisión y omitidos', () => {
      const mockSessionRecord: SessionRecord = {
        sessionId: 'sess-summary-distinguish',
        packId: 'typeops-foundations-es-ar',
        packVersion: '1.0.0',
        mode: 'command',
        presetName: '5_minutes',
        startedAt: new Date().toISOString(),
        deadlineAt: null,
        planItems: [],
        currentIndex: 3,
        status: 'completed',
        completionReason: 'items_completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const attempts: AttemptRecord[] = [
        {
          attemptId: 'att-1',
          sessionId: 'sess-summary-distinguish',
          packId: 'typeops-foundations-es-ar',
          packVersion: '1.0.0',
          itemId: 'cmd-tail-n',
          unitId: 'unit-log-inspection',
          responseRaw: 'tail -n 20 /var/log/auth.log',
          evaluationResult: {
            status: 'correct',
            dimensionResults: { concept: 'correct', toolSelection: 'correct', semanticStructure: 'correct', syntax: 'correct', interpretation: 'not_assessed', verification: 'not_assessed', mechanical: 'not_assessed' },
            errorCodes: [],
            requiresReview: false,
          },
          workflowStatus: 'evaluated',
          hintsUsedCount: 0,
          durationMs: 4000,
          createdAt: new Date().toISOString(),
        },
        {
          attemptId: 'att-2',
          sessionId: 'sess-summary-distinguish',
          packId: 'typeops-foundations-es-ar',
          packVersion: '1.0.0',
          itemId: 'open-auth-logs',
          unitId: 'unit-log-inspection',
          responseRaw: 'Explicación del log.',
          evaluationResult: {
            status: 'needs_review',
            dimensionResults: { concept: 'needs_review', toolSelection: 'not_assessed', semanticStructure: 'not_assessed', syntax: 'not_assessed', interpretation: 'needs_review', verification: 'not_assessed', mechanical: 'not_assessed' },
            errorCodes: [],
            requiresReview: true,
          },
          workflowStatus: 'pending_review',
          hintsUsedCount: 0,
          durationMs: 8000,
          createdAt: new Date().toISOString(),
        },
        {
          attemptId: 'att-3',
          sessionId: 'sess-summary-distinguish',
          packId: 'typeops-foundations-es-ar',
          packVersion: '1.0.0',
          itemId: 'exact-chmod-x',
          unitId: 'unit-permissions',
          responseRaw: { isSkipped: true },
          evaluationResult: {
            status: 'not_assessed',
            dimensionResults: { concept: 'not_assessed', toolSelection: 'not_assessed', semanticStructure: 'not_assessed', syntax: 'not_assessed', interpretation: 'not_assessed', verification: 'not_assessed', mechanical: 'not_assessed' },
            errorCodes: [],
            requiresReview: false,
          },
          workflowStatus: 'skipped',
          hintsUsedCount: 0,
          durationMs: 1000,
          createdAt: new Date().toISOString(),
        },
      ]

      render(
        <SessionSummaryView
          sessionRecord={mockSessionRecord}
          submittedAttempts={attempts}
          summaryRecommendation={null}
          onFinish={() => {}}
        />,
      )

      expect(screen.getByText('Intentos registrados')).toBeInTheDocument()
      expect(screen.getByText('Respondidos')).toBeInTheDocument()
      expect(screen.getByText('Pendientes de revisión')).toBeInTheDocument()
      expect(screen.getByText('Omitidos')).toBeInTheDocument()
    })
  })

  describe('Flujo R1E — guided_path_unavailable al requerir unidad sin recorrido guiado', () => {
    it('muestra guided_path_unavailable con la explicación para unit-linux-basics al intentar modo command tras guided-tail-intro', async () => {
      const user = userEvent.setup()

      // Asegurar que unit-linux-basics no tenga marca de conocimiento previo
      await testDb.priorKnowledge.delete(`${pack.packId}:${pack.packVersion}:unit-linux-basics`)

      // Guiado completado para unit-log-inspection
      await testDb.guidedProgress.put({
        progressKey: `${pack.packId}:${pack.packVersion}:guided-tail-intro`,
        packId: pack.packId,
        packVersion: pack.packVersion,
        itemId: 'guided-tail-intro',
        completedStageIds: ['stg-1', 'stg-2', 'stg-3', 'stg-4', 'stg-5'],
        updatedAt: new Date().toISOString(),
      })

      render(<TestSessionApp db={testDb} pack={pack} />)

      // Seleccionar modo comando desde la configuración personalizada
      await user.click(screen.getByRole('button', { name: 'Configuración personalizada' }))
      await user.click(screen.getByText('Comando desde intención'))
      const submitConfigBtn = screen.getByRole('button', { name: 'Iniciar sesión personalizada' })
      await user.click(submitConfigBtn)

      // Debe mostrar la región "Sin plan de sesión"
      const emptyView = await screen.findByRole('region', { name: /Sin plan de sesión/i })
      expect(emptyView).toBeInTheDocument()

      // Debe explicar que unit-linux-basics no posee recorrido guiado
      expect(screen.getByText(/La siguiente unidad requerida no posee recorrido guiado en este pack/i)).toBeInTheDocument()
      expect(screen.getByText(/Fundamentos de Shell Linux/i)).toBeInTheDocument()

      // No debe ofrecer botón para iniciar guiado inexistente
      expect(screen.queryByRole('button', { name: /Iniciar Práctica Guiada/i })).not.toBeInTheDocument()

      // Debe existir el botón de retorno
      expect(screen.getByRole('button', { name: /Volver al inicio/i })).toBeInTheDocument()

      // No se crearon intentos en la DB
      const attemptsCount = await testDb.attempts.count()
      expect(attemptsCount).toBe(0)
    })
  })
})
