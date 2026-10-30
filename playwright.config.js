import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:3000', headless: true, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  // Never reuse an unknown server: fail on port conflict rather than test another app.
  webServer: { command: 'npm run dev', url: 'http://localhost:3000/__server_identity', reuseExistingServer: false, timeout: 30000 },
});
