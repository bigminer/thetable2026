import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  snapshotDir: './tests/visual/production-baselines',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
    colorScheme: 'light',
    locale: 'en-US',
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1024 },
    deviceScaleFactor: 1,
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1440, height: 1024 } },
    },
    {
      name: 'mobile',
      use: { viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
