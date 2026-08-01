import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { App } from './App'
import { db } from '../data/db/database'

describe('App shell — Hito 2', () => {
  beforeEach(async () => {
    await db.open()
    await db.contentPacks.clear()
    await db.settings.clear()
  })

  it('renderiza el heading principal y la sección de persistencia', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: /micropráctica adaptativa/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /persistencia e intercambio/i }),
    ).toBeInTheDocument()
  })

  it('muestra los cuatro modos de práctica', () => {
    render(<App />)
    expect(screen.getByText(/typing técnico/i)).toBeInTheDocument()
    expect(screen.getByText(/comando desde intención/i)).toBeInTheDocument()
    expect(screen.getByText(/repaso y decisiones/i)).toBeInTheDocument()
    expect(screen.getByText(/práctica guiada/i)).toBeInTheDocument()
  })

  it('provee un skip link visible al enfocar', () => {
    render(<App />)

    const skipLink = screen.getByText(/saltar al contenido principal/i)
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')

    skipLink.focus()
    expect(skipLink).toHaveFocus()
  })

  it('los botones de modo tienen IDs únicos y son accesibles por rol', () => {
    render(<App />)
    const buttons = screen.getAllByRole('button').filter((b) => b.id.startsWith('mode-'))
    const ids = buttons.map((b) => b.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
    expect(ids).toContain('mode-typing')
    expect(ids).toContain('mode-command')
    expect(ids).toContain('mode-review')
    expect(ids).toContain('mode-guided')
  })
})
