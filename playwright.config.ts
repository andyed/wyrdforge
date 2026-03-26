import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4200',
    viewport: { width: 1440, height: 900 },
    screenshot: 'off',
  },
  webServer: {
    command: 'pnpm dev --port 4200',
    port: 4200,
    reuseExistingServer: true,
  },
});
