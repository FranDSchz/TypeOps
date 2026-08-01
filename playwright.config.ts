import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config para recorridos críticos de TypeOps.
 * Requiere: npx playwright install chromium
 * Ejecutar el servidor preview antes: npm run build && npm run preview
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Iniciar preview server automáticamente para e2e
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
  },
})
