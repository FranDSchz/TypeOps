import { test, expect } from '@playwright/test'

test.describe('E2E AC-16 — Prerequisite Flow & Prior Knowledge Unlock (Puerta 5D)', () => {
  test('Flujo completo AC-16: Bloqueo guiado, práctica guiada 5 etapas, prerrequisito sin guiado, marca de conocimiento previo y persistencia tras F5', async ({
    page,
  }) => {
    // 1. Navegar al origen de la aplicación para tener origen válido en IndexedDB
    await page.goto('/')

    // 2. Ejecutar la eliminación completa de TypeOpsDB esperando estrictamente onsuccess
    await page.evaluate(async () => {
      return new Promise<void>((resolve, reject) => {
        const req = indexedDB.deleteDatabase('TypeOpsDB')
        req.onsuccess = () => { resolve() }
        req.onerror = () => { reject(req.error ?? new Error('TypeOpsDB deletion error')) }
        req.onblocked = () => { reject(new Error('TypeOpsDB deletion blocked')) }
      })
    })

    // 3. Recargar la aplicación sobre la base limpia
    await page.reload()

    // 2. Intentar iniciar directamente en Modo 2 (Comando desde intención) para 'cmd-tail-n'
    await page.getByRole('button', { name: /Comando desde intención/i }).click()

    // 3. Confirmar que se muestra el bloqueo estructurado por falta de evidencia guiada sin registrar intentos
    await expect(page.getByRole('region', { name: /Sin plan de sesión/i })).toBeVisible()
    await expect(
      page.getByText(/No podés evaluar este contenido sin haber completado su introducción guiada previa/i),
    ).toBeVisible()

    // 4. Iniciar la práctica guiada requerida directamente desde el botón contextual
    const startGuidedBtn = page.getByRole('button', { name: /Iniciar Práctica Guiada/i })
    await expect(startGuidedBtn).toBeVisible()
    await startGuidedBtn.click()

    // 5. Completar las 5 etapas de la práctica guiada (guided-tail-intro)
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()

    // Etapa 1
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 1 de 5/i })).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Etapa 2
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 2 de 5/i })).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Etapa 3
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 3 de 5/i })).toBeVisible()
    await page.getByRole('button', { name: 'Continuar' }).click()

    // Etapa 4
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 4 de 5/i })).toBeVisible()
    const inputStage4 = page.locator('#guided-input')
    await expect(inputStage4).toBeVisible()
    await inputStage4.fill('tail -n 20 /var/log/auth.log')
    await page.getByRole('button', { name: /Enviar respuesta/i }).click()
    await expect(page.getByText(/Respuesta correcta para la etapa/i)).toBeVisible()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Etapa 5
    await expect(page.getByRole('heading', { level: 3, name: /Etapa 5 de 5/i })).toBeVisible()
    const inputStage5 = page.locator('#guided-input')
    await expect(inputStage5).toBeVisible()
    await inputStage5.fill('tail -n 20 /var/log/auth.log')
    await page.getByRole('button', { name: /Enviar respuesta/i }).click()
    await expect(page.getByText(/Respuesta correcta para la etapa/i)).toBeVisible()
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Finalizar/salir de la sesión guiada completada
    await page.getByRole('button', { name: /Volver al inicio/i }).click()
    await expect(page.getByRole('heading', { name: /Micropráctica adaptativa/i })).toBeVisible()

    // 6. Volver a intentar Modo 2 (Comando desde intención)
    await page.getByRole('button', { name: /Comando desde intención/i }).click()

    // 7. Comprobar que todavía falta evidencia para unit-linux-basics (que no posee recorrido guiado)
    await expect(page.getByRole('region', { name: /Sin plan de sesión/i })).toBeVisible()
    await expect(
      page.getByText(/La siguiente unidad requerida no posee recorrido guiado en este pack/i),
    ).toBeVisible()

    // 8. Verificar que no existe botón de práctica guiada para esa unidad sin guided path
    await expect(page.getByRole('button', { name: /Iniciar Práctica Guiada/i })).not.toBeVisible()

    // Volver al inicio
    await page.getByRole('button', { name: /Volver al inicio/i }).click()

    // 9. Abrir Configuración personalizada para declarar conocimiento previo explícito de unit-linux-basics
    await page.getByRole('button', { name: /Configuración personalizada/i }).click()
    await expect(page.getByRole('region', { name: /Configuración de sesión/i })).toBeVisible()

    // Marcar checkbox de conocimiento previo para la unidad Fundamentos de Linux
    const linuxBasicsCheckbox = page.locator('input[type="checkbox"]').first()
    await linuxBasicsCheckbox.click()

    // 10. Iniciar nuevamente en modo comando con la opción personalizada
    await page.getByRole('button', { name: /Iniciar sesión personalizada/i }).click()

    // 11. Comprobar que cmd-tail-n se habilita y la sesión comienza exitosamente
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()

    // 12. Recargar con F5 y comprobar que la sesión activa y el desbloqueo persisten
    await page.reload()
    await expect(page.getByRole('region', { name: /Sesión interactiva en curso/i })).toBeVisible()
  })
})
