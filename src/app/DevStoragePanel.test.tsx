import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DevStoragePanel } from './DevStoragePanel'
import { db } from '../data/db/database'
import officialPack from '../content/typeops-foundations-es-ar/pack.json'

describe('DevStoragePanel Component', () => {
  beforeEach(async () => {
    await db.open()
    await db.contentPacks.clear()
    await db.settings.clear()
  })

  afterEach(async () => {
    await db.contentPacks.clear()
    await db.settings.clear()
  })

  it('renderiza la lista vacía de packs e indica botón de instalación explícita', async () => {
    render(<DevStoragePanel />)

    expect(
      screen.getByRole('heading', { level: 2, name: /persistencia e intercambio/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/no hay packs instalados/i)).toBeInTheDocument()

    const bootstrapBtn = screen.getByRole('button', { name: /instalar pack oficial/i })
    expect(bootstrapBtn).toBeInTheDocument()
  })

  it('permite la vista previa y confirmación de importación desde la interfaz', async () => {
    const user = userEvent.setup()
    render(<DevStoragePanel />)

    const textarea = screen.getByPlaceholderText(/pegá aquí el contenido json/i)
    fireEvent.change(textarea, { target: { value: JSON.stringify(officialPack) } })

    expect(await screen.findByText(/vista previa de importación/i)).toBeInTheDocument()
    expect(screen.getAllByText(/TypeOps Foundations/i).length).toBeGreaterThan(0)

    const confirmBtn = screen.getByRole('button', { name: /confirmar importación/i })
    await user.click(confirmBtn)

    expect(await screen.findByText(/importado exitosamente/i)).toBeInTheDocument()
    expect(await testDbHasPack(officialPack.packId)).toBe(true)
  })
})

async function testDbHasPack(packId: string): Promise<boolean> {
  const record = await db.contentPacks.get(packId)
  return record !== undefined
}
