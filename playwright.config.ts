import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env['CI']
const baseURL = process.env['BASE_URL'] ?? (isCI ? 'http://localhost:4173' : 'http://localhost:5173')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  ...(isCI ? { workers: 1 } : {}),
  reporter: isCI ? [['html'], ['github']] : [['html']],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: isCI ? 'pnpm preview' : 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !isCI,
  },
})
