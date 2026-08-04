import { test, expect } from '@playwright/test'

test.describe('E2E — Recorrido por teclado de sesión de comando (1 ejercicio)', () => {
  test('inicia, responde y cierra una sesión de 1 ejercicio por teclado', async ({ page }) => {
    await page.goto('/')

    // 1. Abrir configuración personalizada
    const configBtn = page.getByRole('button', { name: 'Configuración personalizada' })
    await configBtn.click()

    // 2. Seleccionar modo command
    const commandModeCard = page.getByText('Comando desde intención')
    await commandModeCard.click()

    // Seleccionar presupuesto por cantidad de ejercicios
    const byCountRadio = page.getByLabel('Por cantidad de ejercicios')
    await byCountRadio.click()

    const oneExerciseBtn = page.getByRole('button', { name: '1 Ejercicio' })
    await oneExerciseBtn.click()

    // Marcar conocimiento previo para desbloquear la evaluación del comando
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    for (const cb of checkboxes) {
      await cb.click()
    }

    const startBtn = page.getByRole('button', { name: 'Iniciar sesión personalizada' })
    await startBtn.click()

    // 3. Verificar que la sesión activa se presenta
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()
    await expect(page.getByText('Ejercicio 1 de 1')).toBeVisible()

    // 4. Escribir la respuesta en el input de comando
    const commandInput = page.getByLabel('Comando Bash:')
    await commandInput.fill('tail -n 20 /var/log/auth.log')

    const submitBtn = page.getByRole('button', { name: 'Enviar respuesta' })
    await submitBtn.click()

    // 5. Verificar feedback explícito
    await expect(page.getByText(/Respuesta correcta/)).toBeVisible()

    // 6. Avanzar al cierre
    const continueBtn = page.getByRole('button', { name: /Continuar/i })
    await continueBtn.click()

    // 7. Verificar pantalla de resumen de cierre
    await expect(page.getByRole('heading', { name: 'Sesión finalizada' })).toBeVisible()
    await expect(page.getByText('Siguiente recomendación adaptativa:')).toBeVisible()
  })
})
