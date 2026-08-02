import { test, expect } from '@playwright/test'

test.describe('E2E — Guided Practice 5 Stages Flow (Subhito 5C)', () => {
  test('1. recorrido guided completo de 5 etapas', async ({ page }) => {
    await page.goto('/')

    // Iniciar sesión recomendada (modo guided)
    await page.getByRole('button', { name: /Iniciar sesión recomendada/i }).click()

    // Comprobar región activa de sesión
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()

    // Etapa 1 expositiva
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 1 de 5/i })).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Etapa 2 expositiva
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 2 de 5/i })).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Etapa 3 expositiva
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 3 de 5/i })).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Etapa 4 evaluable (guided_exercise)
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 4 de 5/i })).toBeVisible()
    const inputStage4 = page.locator('#guided-input')
    await expect(inputStage4).toBeVisible()

    await inputStage4.fill('tail -n 20 /var/log/auth.log')
    await page.getByRole('button', { name: /Enviar respuesta/i }).click()

    // Feedback de etapa 4 y avanzar a etapa 5
    await expect(page.getByText(/Respuesta correcta para la etapa/i)).toBeVisible()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Etapa 5 evaluable (unassisted_exercise)
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 5 de 5/i })).toBeVisible()
    const inputStage5 = page.locator('#guided-input')
    await expect(inputStage5).toBeVisible()

    await inputStage5.fill('tail -n 20 /var/log/auth.log')
    await page.getByRole('button', { name: /Enviar respuesta/i }).click()

    // Feedback de etapa 5 y continuar
    await expect(page.getByText(/Respuesta correcta para la etapa/i)).toBeVisible()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Confirma que el ítem finalizó y la sesión continuó adecuadamente
    await expect(page.getByRole('region', { name: /(Sesión interactiva en curso|Resumen de sesión completada)/i })).toBeVisible()
  })

  test('2. recarga F5 en guided_exercise recupera la etapa en 2do intento asistido (Secuencia exacta de 10 pasos)', async ({ page }) => {
    await page.goto('/')

    // 1. Iniciar sesión recomendada
    await page.getByRole('button', { name: /Iniciar sesión recomendada/i }).click()
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()

    // Avanzar etapas 1, 2 y 3
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // LLegada a Etapa 4 (guided_exercise)
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 4 de 5/i })).toBeVisible()
    const input = page.locator('#guided-input')

    // 2. Enviar respuesta no reconocida (1er intento)
    await input.fill('comando-invalido-xyz')
    await page.getByRole('button', { name: /Enviar respuesta/i }).click()

    // 3. Persistir primer intento con needs_review y ver feedback
    await expect(page.getByText(/Respuesta registrada \(Pendiente de revisión\)/i)).toBeVisible()

    // 4. Continuar al 2do intento sin completar la etapa
    await page.getByRole('button', { name: /Continuar/i }).click()
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 4 de 5/i })).toBeVisible()

    // 5. Recargar la página con F5
    await page.reload()

    // 6. Volver a la misma etapa (Etapa 4)
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 4 de 5/i })).toBeVisible()

    // 7. Confirmar banner visual del 2do intento de corrección asistida
    await expect(page.getByText(/Corrección asistida \(2.º intento\)/i)).toBeVisible()

    // 8. Enviar la segunda respuesta (válida)
    const reloadedInput = page.locator('#guided-input')
    await reloadedInput.fill('tail -n 20 /var/log/auth.log')
    await page.getByRole('button', { name: /Enviar respuesta/i }).click()

    // 9 y 10. Etapa 4 completada -> avanza a feedback de etapa 4 para ingresar a etapa 5
    await expect(page.getByText(/Respuesta correcta para la etapa/i)).toBeVisible()
    await page.getByRole('button', { name: /Continuar/i }).click()
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 5 de 5/i })).toBeVisible()
  })

  test('3. etapa 5 terminal con omisión avanza la sesión sin bloquearse', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: /Iniciar sesión recomendada/i }).click()
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()

    // Omitir ejercicio
    await page.getByRole('button', { name: 'Omitir ejercicio' }).click()

    // Debe mostrar la vista de feedback indicando ejercicio omitido
    await expect(page.getByText(/Ejercicio omitido/i)).toBeVisible()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Debe avanzar la sesión limpiamente a la región activa del siguiente ítem o al resumen
    await expect(page.getByRole('region', { name: /(Sesión interactiva en curso|Resumen de sesión completada)/i })).toBeVisible()
  })
})
