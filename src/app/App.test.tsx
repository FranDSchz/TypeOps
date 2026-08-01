import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { App } from './App'

describe('App shell — Hito 1', () => {
  it('renderiza el heading principal', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { level: 1, name: /micropráctica adaptativa/i }),
    ).toBeInTheDocument()
  })

  it('muestra los cuatro modos de práctica', () => {
    render(<App />)
    expect(screen.getByText(/typing técnico/i)).toBeInTheDocument()
    expect(screen.getByText(/comando desde intención/i)).toBeInTheDocument()
    expect(screen.getByText(/repaso y decisiones/i)).toBeInTheDocument()
    expect(screen.getByText(/práctica guiada/i)).toBeInTheDocument()
  })

  it('muestra el estado del contrato de contenido cargado correctamente', () => {
    render(<App />)
    expect(screen.getByText(/contrato 1\.0\.0 ok/i)).toBeInTheDocument()
    expect(screen.getByText(/typeops foundations/i)).toBeInTheDocument()
  })

  it('provee un skip link visible al enfocar', async () => {
    const user = userEvent.setup()
    render(<App />)

    const skipLink = screen.getByText(/saltar al contenido principal/i)
    expect(skipLink).toBeInTheDocument()
    expect(skipLink).toHaveAttribute('href', '#main-content')

    await user.tab()
    expect(skipLink).toHaveFocus()
  })

  it('los botones de modo tienen IDs únicos y son accesibles por rol', () => {
    render(<App />)
    const buttons = screen.getAllByRole('button')
    const ids = buttons.map((b) => b.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
    expect(ids).toContain('mode-typing')
    expect(ids).toContain('mode-command')
    expect(ids).toContain('mode-review')
    expect(ids).toContain('mode-guided')
  })

  it('la navegación de modos tiene landmark role=navigation', () => {
    render(<App />)
    expect(
      screen.getByRole('navigation', { name: /modos de práctica/i }),
    ).toBeInTheDocument()
  })

  it('el foco se puede mover entre modos con teclado (Tab)', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.tab() // skip link
    await user.tab() // mode-typing
    const typingBtn = screen.getByRole('button', { name: /typing técnico/i })
    expect(typingBtn).toHaveFocus()

    await user.tab() // mode-command
    const commandBtn = screen.getByRole('button', { name: /comando desde intención/i })
    expect(commandBtn).toHaveFocus()
  })

  it('tiene landmark main con id main-content (destino del skip link)', () => {
    render(<App />)
    const main = screen.getByRole('main')
    expect(main).toHaveAttribute('id', 'main-content')
  })

  it('tiene contentinfo (footer) con texto de la aplicación', () => {
    render(<App />)
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent(/local-first/i)
  })
})
