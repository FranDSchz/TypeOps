import { test, expect } from '@playwright/test'

test.describe('E2E — Recuperación de sesión activa tras recarga (F5)', () => {
  test('recupera exactamente la sesión activa y presenta el segundo ítem del plan tras recargar', async ({ page }) => {
    await page.goto('/')

    // 1. Abrir configuración personalizada
    const configBtn = page.getByRole('button', { name: 'Configuración personalizada' })
    await configBtn.click()

    // 2. Seleccionar modo review y 2 ejercicios
    const reviewModeCard = page.getByText('Repaso y decisiones')
    await reviewModeCard.click()

    // Seleccionar presupuesto por cantidad de ejercicios
    const byCountRadio = page.getByLabel('Por cantidad de ejercicios')
    await byCountRadio.click()

    const twoExercisesBtn = page.getByRole('button', { name: '2 Ejercicios' })
    await twoExercisesBtn.click()

    const startBtn = page.getByRole('button', { name: 'Iniciar sesión personalizada' })
    await startBtn.click()

    // 3. Responder primer ítem (rev-linux-perm: exact_question)
    await expect(page.getByText('Ejercicio 1 de 2')).toBeVisible()

    const correctOption = page.getByText('chmod +x script.sh')
    await correctOption.click()

    const submitBtn = page.getByRole('button', { name: 'Enviar respuesta' })
    await submitBtn.click()

    // 4. Continuar al segundo ítem
    const continueBtn = page.getByRole('button', { name: /Continuar/i })
    await continueBtn.click()

    await expect(page.getByText('Ejercicio 2 de 2')).toBeVisible()

    // 5. Simular recarga de página (F5)
    await page.reload()

    // 6. Verificar que recupera la sesión activa en el ejercicio 2 sin reiniciar
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()
    await expect(page.getByText('Ejercicio 2 de 2')).toBeVisible()
  })
})
