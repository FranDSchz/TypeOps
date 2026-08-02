import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemPresenter } from './ItemPresenter'
import { createTestDatabase, type TypeOpsDatabase } from '../../data/db/database'
import officialPack from '../../content/typeops-foundations-es-ar/pack.json'
import type { GuidedPracticeItem } from '../../domain/content/types'

describe('ItemPresenter — Guided Practice 5 Stages (RTL & Integración Subhito 5C)', () => {
  let testDb: TypeOpsDatabase
  const guidedItem = officialPack.items.find((i) => i.kind === 'guided_practice') as GuidedPracticeItem

  beforeEach(async () => {
    testDb = createTestDatabase()
    await testDb.open()
  })

  afterEach(async () => {
    await testDb.delete()
  })

  it('1. Renderiza Etapa 1 expositiva con botón Continuar, stepper "Etapa 1 de 5" y sin input de texto', async () => {
    const handleSubmit = vi.fn()

    render(
      <ItemPresenter
        item={guidedItem}
        activeHintLevel={1}
        onSubmitResponse={handleSubmit}
      />,
    )

    // Stepper header
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 1 de 5/i })).toBeInTheDocument()
    expect(screen.getByText(/Modelo de tail/i)).toBeInTheDocument()

    // Botón Continuar expositivo
    const btnContinue = screen.getByRole('button', { name: /Continuar/i })
    expect(btnContinue).toBeInTheDocument()

    // No hay input de texto en etapa expositiva
    expect(screen.queryByLabelText(/Respuesta:/i)).not.toBeInTheDocument()
  })

  it('2. Avanza a Etapa 4 evaluable (guided_exercise) permitiendo envío de respuesta', async () => {
    const handleSubmit = vi.fn()

    const guidedProgress = {
      progressKey: 'typeops-foundations-es-ar:1.0.0:guided-tail-intro',
      packId: 'typeops-foundations-es-ar',
      packVersion: '1.0.0',
      itemId: 'guided-tail-intro',
      completedStageIds: ['stg-1', 'stg-2', 'stg-3'],
      updatedAt: new Date().toISOString(),
    }

    const itemWithHints = {
      ...guidedItem,
      hints: [{ hintId: 'h1', level: 1 as const, text: 'Pista de prueba', reveals: 'syntax' as const }],
    }

    render(
      <ItemPresenter
        item={itemWithHints}
        activeHintLevel={1}
        onSubmitResponse={handleSubmit}
        guidedProgress={guidedProgress}
      />,
    )

    // Stepper header para etapa 4
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 4 de 5/i })).toBeInTheDocument()

    // Input de texto visible
    const input = screen.getByRole('textbox', { name: /Respuesta:/i })
    expect(input).toBeInTheDocument()

    // Pistas visibles en guided_exercise (activeHintLevel = 1)
    expect(screen.getByRole('region', { name: /Pistas activadas/i })).toBeInTheDocument()

    const user = userEvent.setup()
    await user.type(input, 'tail -n 20 /var/log/auth.log')
    await user.click(screen.getByRole('button', { name: /Enviar respuesta/i }))

    expect(handleSubmit).toHaveBeenCalledTimes(1)
    expect(handleSubmit).toHaveBeenCalledWith(
      { stageId: 'stg-4', responseRaw: 'tail -n 20 /var/log/auth.log' },
      undefined,
      { guidedStageId: 'stg-4' },
    )
  })

  it('3. En Etapa 5 (unassisted_exercise) las pistas permanecen OCULTAS independientemente de activeHintLevel', async () => {
    const handleSubmit = vi.fn()

    const guidedProgress = {
      progressKey: 'typeops-foundations-es-ar:1.0.0:guided-tail-intro',
      packId: 'typeops-foundations-es-ar',
      packVersion: '1.0.0',
      itemId: 'guided-tail-intro',
      completedStageIds: ['stg-1', 'stg-2', 'stg-3', 'stg-4'],
      updatedAt: new Date().toISOString(),
    }

    render(
      <ItemPresenter
        item={guidedItem}
        activeHintLevel={3} // Solicitar 3 pistas
        onSubmitResponse={handleSubmit}
        guidedProgress={guidedProgress}
      />,
    )

    // Stepper header para etapa 5
    expect(await screen.findByRole('heading', { level: 3, name: /Etapa 5 de 5/i })).toBeInTheDocument()

    // Pistas OCULTAS en unassisted_exercise (Mandato 6)
    expect(screen.queryByRole('region', { name: /Pistas activadas/i })).not.toBeInTheDocument()
  })
})
