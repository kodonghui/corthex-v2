import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '.env.test') })

const e2eRoot = __dirname

export default defineConfig({
  testDir: './src/tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://corthex-hq.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'app',
      testDir: './src/tests',
      testMatch: /smoke\/app\/|interaction\/app\//,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.resolve(e2eRoot, 'src/fixtures/.auth/user.json'),
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'admin',
      testDir: './src/tests',
      testMatch: /smoke\/admin\/|interaction\/admin\//,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ADMIN_URL || 'https://corthex-hq.com/admin',
        storageState: path.resolve(e2eRoot, 'src/fixtures/.auth/admin.json'),
      },
      dependencies: ['auth-setup'],
    },
    {
      name: 'mobile',
      testDir: './src/tests',
      testMatch: /smoke\/app\/|interaction\/app\//,
      use: {
        ...devices['iPhone 14'],
        storageState: path.resolve(e2eRoot, 'src/fixtures/.auth/user.json'),
      },
      dependencies: ['auth-setup'],
    },
  ],
})
