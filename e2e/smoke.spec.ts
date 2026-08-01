import { test, expect } from '@playwright/test'

/**
 * Smoke test — Hito 0
 *
 * Verifica que la app arranca, muestra el heading principal
 * y que los cuatro modos son visibles.
 *
 * Requiere: npx playwright install chromium
 * El webServer del playwright.config.ts levanta npm run preview automáticamente.
 */

test.describe('TypeOps — smoke test', () => {
  test('la página carga con el heading principal', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/TypeOps/)
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toContainText('Micropráctica adaptativa')
  })

  test('los cuatro modos son visibles', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Typing técnico')).toBeVisible()
    await expect(page.getByText('Comando desde intención')).toBeVisible()
    await expect(page.getByText('Repaso y decisiones')).toBeVisible()
    await expect(page.getByText('Práctica guiada')).toBeVisible()
  })

  test('el skip link está disponible en el DOM', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.getByText('Saltar al contenido principal')
    await expect(skipLink).toBeAttached()
    await expect(skipLink).toHaveAttribute('href', '#main-content')
  })

  test('navegación por Tab alcanza los botones de modo', async ({ page }) => {
    await page.goto('/')
    // Tab pasa por skip link y llega al primer modo
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    const focused = page.locator(':focus')
    await expect(focused).toHaveId('mode-typing')
  })

  test('no hay errores de consola en la carga inicial', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(consoleErrors).toHaveLength(0)
  })
})
