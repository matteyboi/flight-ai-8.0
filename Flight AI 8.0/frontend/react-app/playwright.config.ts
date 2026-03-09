import { defineConfig, devices } from '@playwright/test';

const skipWebServer = !!process.env.E2E_SKIP_WEBSERVER;
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5174';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    ignoreHTTPSErrors: true,
    baseURL,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  ...(skipWebServer ? {} : {
    webServer: {
      // For CI the backend is started by the workflow; locally you can run
      // `npm run preview:e2e` to start the backend and preview together.
      command: 'npm run preview -- --port=5174',
      port: 5174,
        reuseExistingServer: true,
      timeout: 120_000,
    }
  }),
});
