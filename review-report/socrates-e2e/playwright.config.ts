import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  workers: 4,
  reporter: [['json', { outputFile: './test-results.json' }], ['list']],
  use: {
    baseURL: 'https://corthex-hq.com',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    { name: 'agent-A-functional', testMatch: 'agent-a-functional.spec.ts' },
    { name: 'agent-B-visual', testMatch: 'agent-b-visual.spec.ts' },
    { name: 'agent-C-edge', testMatch: 'agent-c-edge.spec.ts' },
    { name: 'agent-D-regression', testMatch: 'agent-d-regression.spec.ts' },
  ],
});
