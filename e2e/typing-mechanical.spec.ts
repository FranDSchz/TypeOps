import { test, expect, type Page } from '@playwright/test'

async function seedPriorKnowledge(page: Page, unitIds: string[]) {
  await page.evaluate(async (units) => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open('TypeOpsDB')
      req.onsuccess = () => {
        const db = req.result
        const tx = db.transaction(['priorKnowledge'], 'readwrite')
        const store = tx.objectStore('priorKnowledge')
        const nowIso = new Date().toISOString()
        for (const unitId of units) {
          store.put({
            compositeKey: `typeops-foundations-es-ar:1.0.0:${unitId}`,
            packId: 'typeops-foundations-es-ar',
            packVersion: '1.0.0',
            unitId,
            source: 'user_configured',
            updatedAt: nowIso,
          })
        }
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
        tx.onerror = () => {
          db.close()
          reject(tx.error)
        }
      }
      req.onerror = () => reject(req.error)
    })
  }, unitIds)
  await page.reload()
}

test.describe('E2E — Typing Mechanical Capture and Persistence (Subhito 5B)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await seedPriorKnowledge(page, ['unit-linux-basics'])
  })

  test('inicia sesión de typing, escribe de forma fluida y finaliza con feedback neutro de copia', async ({ page }) => {

    // Abrir configuración personalizada
    await page.getByRole('button', { name: 'Configuración personalizada' }).click()

    // Seleccionar modo typing
    await page.getByText('Typing técnico').click()
    await page.getByLabel('Por cantidad de ejercicios').click()
    await page.getByRole('button', { name: '1 Ejercicio' }).click()
    await page.getByRole('button', { name: 'Iniciar sesión personalizada' }).click()

    // Verificar que el input de typing está enfocado y visible
    const input = page.locator('#typing-input')
    await expect(input).toBeVisible()

    // Leer el texto objetivo
    const targetText = (await page.locator('#typing-target').innerText()).trim()

    // Tipear realmente carácter a carácter
    await input.pressSequentially(targetText, { delay: 30 })

    // Enviar con Enter
    await input.press('Enter')

    // Verificar feedback neutro de fidelidad de copia (sin WPM ficticio ni maestría conceptual)
    await expect(page.getByText(/Fidelidad de copia/)).toBeVisible()

    // Continuar y finalizar
    await page.getByRole('button', { name: /Continuar/ }).click()
    await expect(page.getByRole('heading', { name: 'Sesión finalizada' })).toBeVisible()
  })

  test('detecta pegado (paste) en el navegador y presenta aviso informativo', async ({ page }) => {
    await page.getByRole('button', { name: 'Configuración personalizada' }).click()
    await page.getByText('Typing técnico').click()
    await page.getByLabel('Por cantidad de ejercicios').click()
    await page.getByRole('button', { name: '1 Ejercicio' }).click()
    await page.getByRole('button', { name: 'Iniciar sesión personalizada' }).click()

    const input = page.locator('#typing-input')
    await expect(input).toBeVisible()

    const targetText = (await page.locator('#typing-target').innerText()).trim()

    // Simular evento paste en el input
    await input.focus()
    await page.evaluate((text) => {
      const el = document.querySelector('#typing-input')
      if (el !== null) {
        const pasteEvent = new Event('paste', { bubbles: true, cancelable: true })
        el.dispatchEvent(pasteEvent)
        ;(el as HTMLInputElement).value = text
        el.dispatchEvent(new Event('input', { bubbles: true }))
      }
    }, targetText)

    // Notificación visual de pegado detectado
    await expect(page.getByText(/Pegado detectado/)).toBeVisible()
  })

  test('recarga con F5 recupera la sesión de typing en curso sin datos parciales', async ({ page }) => {
    await page.getByRole('button', { name: 'Configuración personalizada' }).click()
    await page.getByText('Typing técnico').click()
    await page.getByLabel('Por cantidad de ejercicios').click()
    await page.getByRole('button', { name: '2 Ejercicios' }).click()
    await page.getByRole('button', { name: 'Iniciar sesión personalizada' }).click()

    await expect(page.getByText('Ejercicio 1 de 2')).toBeVisible()

    // Recargar página
    await page.reload()

    // Comprobar que la sesión activa se recupera en el ejercicio 1
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()
    await expect(page.getByText('Ejercicio 1 de 2')).toBeVisible()
  })
})
