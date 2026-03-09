import { test as setup, expect } from '@playwright/test'
import * as path from 'path'

const e2eRoot = path.resolve(__dirname, '../..')

/**
 * 일반 사용자(app) 로그인 → storageState 저장
 */
setup('app user login', async ({ page }) => {
  const baseURL = process.env.BASE_URL || 'https://corthex-hq.com'

  await page.goto(`${baseURL}/login`)
  await page.waitForLoadState('domcontentloaded')

  // 로그인 폼 입력 (각 폼에 text input 1개 + password input 1개)
  await page.locator('input[type="text"]').fill(process.env.APP_USERNAME || '')
  await page.locator('input[type="password"]').fill(process.env.APP_PASSWORD || '')

  // 로그인 버튼 클릭
  await page.locator('button[type="submit"]').click()

  // 로그인 성공 확인 — 로그인 페이지를 벗어났는지 체크
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 })

  // storageState 저장 (쿠키 + localStorage)
  await page.context().storageState({ path: path.resolve(e2eRoot, 'src/fixtures/.auth/user.json') })
})

/**
 * 관리자(admin) 로그인 → storageState 저장
 */
setup('admin user login', async ({ page }) => {
  const adminURL = process.env.ADMIN_URL || 'https://corthex-hq.com/admin'

  await page.goto(`${adminURL}/login`)
  await page.waitForLoadState('domcontentloaded')

  // 로그인 폼 입력
  await page.locator('input[type="text"]').fill(process.env.ADMIN_USERNAME || '')
  await page.locator('input[type="password"]').fill(process.env.ADMIN_PASSWORD || '')

  // 로그인 버튼 클릭
  await page.locator('button[type="submit"]').click()

  // 로그인 성공 확인
  await expect(page).not.toHaveURL(/\/login/, { timeout: 15_000 })

  // storageState 저장
  await page.context().storageState({ path: path.resolve(e2eRoot, 'src/fixtures/.auth/admin.json') })
})
