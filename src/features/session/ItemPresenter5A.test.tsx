import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemPresenter } from './ItemPresenter'
import { ItemFeedbackView } from './ItemFeedbackView'
import { evaluateExactQuestion } from '../../domain/evaluation/exactEvaluator'
import { evaluateDecision } from '../../domain/evaluation/decisionEvaluator'
import { evaluateCommandIntention } from '../../domain/evaluation/commandEvaluator'
import { evaluateOpenQuestion } from '../../domain/evaluation/openEvaluator'
import type {
  ExactQuestionItem,
  DecisionItem,
  OpenQuestionItem,
  CommandIntentionItem,
} from '../../domain/content/types'

describe('ItemPresenter — Controles y Payloads Subhito 5A (RTL & Integración)', () => {
  const baseItem = {
    itemId: 'item-5a-test',
    unitIds: ['unit-1'],
    title: 'Título de prueba',
    context: 'Contexto de prueba',
    task: 'Tarea de prueba',
    responseFormat: 'formato',
    maxResponse: { lines: 1 },
    estimatedSeconds: 30,
    categories: ['test'],
    skills: [],
    difficulty: 1 as const,
    prerequisiteUnitIds: [],
    hints: [],
    explanation: 'Explicación de prueba',
    categoryVisibility: 'visible' as const,
    securityContext: { scope: 'safe_inert' as const, targets: ['localhost' as const], executionAllowed: false as const },
    mechanicalSequences: [],
    sourceNotes: [],
    enabled: true,
  }

  describe('exact_question — single_choice', () => {
    const singleItem: ExactQuestionItem = {
      ...baseItem,
      kind: 'exact_question',
      mode: 'review',
      answerType: 'single_choice',
      options: [
        { optionId: 'opt-1', text: 'Opción 1' },
        { optionId: 'opt-2', text: 'Opción 2' },
      ],
      acceptedAnswers: ['opt-1'],
      caseSensitive: false,
    }

    it('renderiza radios accesibles, bloquea envío vacío y envía la opción seleccionada', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<ItemPresenter item={singleItem} activeHintLevel={0} onSubmitResponse={onSubmit} />)

      expect(screen.getByRole('radiogroup', { name: /Opciones de respuesta/i })).toBeInTheDocument()
      const radio1 = screen.getByRole('radio', { name: 'Opción 1' })
      const radio2 = screen.getByRole('radio', { name: 'Opción 2' })
      expect(radio1).not.toBeChecked()
      expect(radio2).not.toBeChecked()

      // Intento de envío sin seleccionar -> Alerta accesible y no invoca onSubmit
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Debés seleccionar una opción antes de enviar.')
      expect(onSubmit).not.toHaveBeenCalled()

      // Selección por teclado / click
      await user.click(radio1)
      expect(radio1).toBeChecked()

      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(onSubmit).toHaveBeenCalledWith('opt-1')

      // Verificar evaluación
      const firstCall = onSubmit.mock.calls[0]
      expect(firstCall).toBeDefined()
      if (firstCall) {
        const evalRes = evaluateExactQuestion(singleItem, firstCall[0] as string)
        expect(evalRes.status).toBe('correct')
      }
    })
  })

  describe('exact_question — multiple_choice', () => {
    const multiItem: ExactQuestionItem = {
      ...baseItem,
      kind: 'exact_question',
      mode: 'review',
      answerType: 'multiple_choice',
      options: [
        { optionId: 'opt-1', text: 'Opción 1' },
        { optionId: 'opt-2', text: 'Opción 2' },
        { optionId: 'opt-3', text: 'Opción 3' },
      ],
      acceptedAnswers: ['opt-1', 'opt-2'],
      caseSensitive: false,
    }

    it('renderiza checkboxes accesibles, bloquea envío vacío y envía el array esperado independientemente del orden', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<ItemPresenter item={multiItem} activeHintLevel={0} onSubmitResponse={onSubmit} />)

      const cb1 = screen.getByRole('checkbox', { name: 'Opción 1' })
      const cb2 = screen.getByRole('checkbox', { name: 'Opción 2' })

      // Bloquea selección vacía
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Debés seleccionar una opción antes de enviar.')
      expect(onSubmit).not.toHaveBeenCalled()

      // Seleccionar opción 2 luego opción 1
      await user.click(cb2)
      await user.click(cb1)

      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      const firstCall = onSubmit.mock.calls[0]
      expect(firstCall).toBeDefined()
      if (firstCall) {
        const payload = firstCall[0] as string[]
        expect(payload).toEqual(['opt-2', 'opt-1'])

        // Evaluar payload
        const evalRes = evaluateExactQuestion(multiItem, payload)
        expect(evalRes.status).toBe('correct')
      }
    })
  })

  describe('exact_question — ordered_steps', () => {
    const orderedItem: ExactQuestionItem = {
      ...baseItem,
      kind: 'exact_question',
      mode: 'review',
      answerType: 'ordered_steps',
      options: [
        { optionId: 'step-1', text: 'Paso Uno' },
        { optionId: 'step-2', text: 'Paso Dos' },
        { optionId: 'step-3', text: 'Paso Tres' },
      ],
      acceptedAnswers: ['step-1', 'step-2', 'step-3'],
      caseSensitive: false,
    }

    it('renderiza pasos, deshabilita botones límite, permite reordenar y envía el orden visible real', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<ItemPresenter item={orderedItem} activeHintLevel={0} onSubmitResponse={onSubmit} />)

      expect(screen.getByText('Paso Uno')).toBeInTheDocument()
      expect(screen.getByText('Paso Dos')).toBeInTheDocument()
      expect(screen.getByText('Paso Tres')).toBeInTheDocument()

      const upButtons = screen.getAllByRole('button', { name: /hacia arriba/i })
      const downButtons = screen.getAllByRole('button', { name: /hacia abajo/i })

      // El primer botón de subir y el último botón de bajar deben estar deshabilitados
      expect(upButtons[0]).toBeDisabled()
      expect(downButtons[2]).toBeDisabled()

      // Mover Paso 2 arriba (intercambiar paso 2 y paso 1)
      const btnUpStep2 = upButtons[1]
      if (btnUpStep2) {
        await user.click(btnUpStep2)
      }

      // El orden visible ahora es: Paso Dos, Paso Uno, Paso Tres
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      const firstCall = onSubmit.mock.calls[0]
      expect(firstCall).toBeDefined()
      if (firstCall) {
        const payload = firstCall[0] as string[]
        expect(payload).toEqual(['step-2', 'step-1', 'step-3'])

        // Evaluar orden incorrecto
        const evalRes = evaluateExactQuestion(orderedItem, payload)
        expect(evalRes.status).toBe('incorrect')
      }
    })
  })

  describe('exact_question — short_exact', () => {
    const shortItem: ExactQuestionItem = {
      ...baseItem,
      kind: 'exact_question',
      mode: 'review',
      answerType: 'short_exact',
      acceptedAnswers: ['chmod +x'],
      caseSensitive: false,
    }

    it('utiliza un input etiquetado, bloquea texto vacío y evalúa texto ingresado', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<ItemPresenter item={shortItem} activeHintLevel={0} onSubmitResponse={onSubmit} />)

      const input = screen.getByLabelText('Respuesta exacta:')
      expect(input).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Debés seleccionar una opción antes de enviar.')

      await user.type(input, 'chmod +x')
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(onSubmit).toHaveBeenCalledWith('chmod +x')

      const evalRes = evaluateExactQuestion(shortItem, 'chmod +x')
      expect(evalRes.status).toBe('correct')
    })
  })

  describe('decision — Integración de Presentador y Evaluador', () => {
    const decItem: DecisionItem = {
      ...baseItem,
      kind: 'decision',
      mode: 'review',
      evidence: [
        { evidenceId: 'ev-1', text: 'Evidencia Requerida' },
        { evidenceId: 'ev-2', text: 'Evidencia No Requerida' },
      ],
      choices: [
        { choiceId: 'ch-1', text: 'Elección 1' },
      ],
      correctChoiceIds: ['ch-1'],
      requiredEvidenceIds: ['ev-1'],
      conditionalBranches: [],
    }

    it('envía opción y evidencia y evalúa resultado parcial si falta evidencia requerida', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<ItemPresenter item={decItem} activeHintLevel={0} onSubmitResponse={onSubmit} />)

      const radioChoice = screen.getByRole('radio', { name: 'Elección 1' })
      const cbOtherEvidence = screen.getByRole('checkbox', { name: 'Evidencia No Requerida' })

      // Seleccionar opción correcta pero evidencia no requerida (faltando evidencia requerida ev-1)
      await user.click(radioChoice)
      await user.click(cbOtherEvidence)
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

      const firstCall = onSubmit.mock.calls[0]
      expect(firstCall).toBeDefined()
      if (firstCall) {
        const payload = firstCall[0] as { selectedChoiceIds: string[]; selectedEvidenceIds: string[] }
        expect(payload).toEqual({ selectedChoiceIds: ['ch-1'], selectedEvidenceIds: ['ev-2'] })

        const evalRes = evaluateDecision(decItem, payload)
        expect(evalRes.status).toBe('partial')
        expect(evalRes.errorCodes).toContain('verification_missing')

        // Ahora renderizar ItemFeedbackView con resultado partial
        render(<ItemFeedbackView item={decItem} evaluationResult={evalRes} onContinue={() => {}} />)
        expect(screen.getByText('⚠ Respuesta parcialmente correcta')).toBeInTheDocument()
      }
    })
  })

  describe('open_question — Presentación, Contador y Rúbrica Informativa', () => {
    const openItem: OpenQuestionItem = {
      ...baseItem,
      kind: 'open_question',
      mode: 'review',
      maxResponse: { lines: 4, characters: 200 },
      rubric: {
        rubricId: 'rub-1',
        essentialElements: ['Elemento Esencial A'],
        acceptableAlternatives: [],
        commonErrors: [],
        verificationCriterion: 'Criterio de verificación de prueba',
        doNotInfer: [],
      },
      reviewPolicy: 'pending_external',
      captureMechanical: false,
    }

    it('utiliza textarea accesible, muestra contador de caracteres, bloquea vacío y muestra rúbrica meramente informativa', async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()

      render(<ItemPresenter item={openItem} activeHintLevel={0} onSubmitResponse={onSubmit} />)

      const textarea = screen.getByRole('textbox', { name: 'Respuesta libre:' })
      expect(textarea).toBeInTheDocument()
      expect(screen.getByText((_, el) => (el ? el.classList.contains('character-counter') && el.textContent.includes('0 / 200') : false))).toBeInTheDocument()

      // Bloqueo de respuesta vacía
      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(screen.getByRole('alert')).toHaveTextContent('Debés escribir una explicación antes de enviar.')

      await user.type(textarea, 'Explicación detallada de análisis de seguridad.')
      expect(screen.getByText((_, el) => (el ? el.classList.contains('character-counter') && el.textContent.includes('47 / 200') : false))).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))
      expect(onSubmit).toHaveBeenCalledWith('Explicación detallada de análisis de seguridad.')

      const evalRes = evaluateOpenQuestion(openItem)
      expect(evalRes.status).toBe('needs_review')
      expect(evalRes.requiresReview).toBe(true)

      // Verificar que ItemFeedbackView muestra estado pendiente y rúbrica puramente informativa sin controles interactivos de autoevaluación
      render(<ItemFeedbackView item={openItem} evaluationResult={evalRes} onContinue={() => {}} />)
      expect(screen.getByText('📝 Respuesta guardada (Pendiente de revisión)')).toBeInTheDocument()
      expect(screen.getByText(/Rúbrica de autoevaluación \(opcional\):/i)).toBeInTheDocument()
      expect(screen.getAllByText('Criterio de verificación de prueba').length).toBeGreaterThan(0)
      // No existe ningún botón ni radio de calificación que afecte el dominio
      expect(screen.queryByRole('radio')).toBeNull()
    })
  })

  describe('command_intention — Diagnóstico Dimensional y Ausencia de Ejecución', () => {
    const cmdItem: CommandIntentionItem = {
      ...baseItem,
      kind: 'command_intention',
      mode: 'command',
      intent: 'Ver últimas 20 líneas de auth.log',
      answerSpec: {
        acceptedAlternatives: [
          {
            alternativeId: 'alt-1',
            text: 'tail -n 20 /var/log/auth.log',
            tool: 'tail',
            semanticTags: ['read'],
            explanation: 'Comando estándar de tail',
          },
        ],
        normalization: ['trim_outer', 'spaces_outside_quotes'],
        toolChecks: [{ pattern: '^tail\\b' }],
        requiredFragments: ['tail', '/var/log/auth.log'],
        forbiddenFragments: ['rm'],
        syntaxChecks: [],
      },
      captureMechanical: false,
      unrecognizedPolicy: 'needs_review',
    }

    it('evalúa alternativa reconocida y muestra feedback desglosado por dimensión excluyendo not_assessed', () => {
      const evalRes = evaluateCommandIntention(cmdItem, 'tail -n 20 /var/log/auth.log')
      expect(evalRes.status).toBe('correct')

      render(<ItemFeedbackView item={cmdItem} evaluationResult={evalRes} onContinue={() => {}} />)

      expect(screen.getByText('✔ Respuesta correcta')).toBeInTheDocument()
      expect(screen.getByText('Selección de herramienta:')).toBeInTheDocument()
      expect(screen.getByText('Estructura semántica:')).toBeInTheDocument()
      expect(screen.getByText('Sintaxis:')).toBeInTheDocument()

      // Dimensiones not_assessed (interpretación, verificación, mecánica) NO se muestran como errores
      expect(screen.queryByText('Interpretación:')).toBeNull()
      expect(screen.queryByText('Mecánica:')).toBeNull()

      // Sin indicadores de ejecución de shell
      expect(screen.queryByText(/ejecutando/i)).toBeNull()
      expect(screen.queryByText(/terminal/i)).toBeNull()
    })

    it('evalúa respuesta plausible no reconocida conservando needs_review', () => {
      const evalRes = evaluateCommandIntention(cmdItem, 'tail -n 20 /var/log/auth.log --verbose')
      expect(evalRes.status).toBe('needs_review')
      expect(evalRes.requiresReview).toBe(true)

      render(<ItemFeedbackView item={cmdItem} evaluationResult={evalRes} onContinue={() => {}} />)

      expect(screen.getByText('💬 Respuesta pendiente de revisión / no reconocida')).toBeInTheDocument()
    })
  })
})
