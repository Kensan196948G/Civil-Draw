import { defineConfig, devices } from '@playwright/test'

const perfPort = 5190
const port = process.env.PERF_RUN ? perfPort : 5173
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  testIgnore: process.env.PERF_RUN ? [] : ['**/perf*.spec.ts'],
  fullyParallel: false,
  workers: process.env.CI ? 1 : 2,
  retries: process.env.CI ? 2 : 0,
  timeout: process.env.PERF_RUN ? 120_000 : 30_000,
  reporter: process.env.CI ? [['github'], ['html']] : [['list']],
  webServer: {
    command: `npm run dev -- --port ${port}${process.env.PERF_RUN ? ' --strictPort' : ''}`,
    url: baseURL,
    // For PERF_RUN we always start a dedicated server to avoid port conflicts.
    reuseExistingServer: process.env.PERF_RUN ? false : !process.env.CI,
    timeout: 60_000,
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: process.env.PERF_RUN
    ? [{ name: 'firefox', use: { ...devices['Desktop Firefox'] } }]
    : [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
