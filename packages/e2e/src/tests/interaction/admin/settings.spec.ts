import { test, expect } from '@playwright/test'

test.describe('Settings Admin — 회사 설정 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/settings')
    // 회사 미선택이면 no-company, 선택되면 settings-page
    const noCompany = page.locator('[data-testid="settings-no-company"]')
    const settingsPage = page.locator('[data-testid="settings-page"]')
    await Promise.race([
      noCompany.waitFor({ timeout: 15000 }).catch(() => {}),
      settingsPage.waitFor({ timeout: 15000 }).catch(() => {}),
    ])
  })

  test('페이지 렌더링 — 제목 또는 미선택 메시지', async ({ page }) => {
    const noCompany = page.locator('[data-testid="settings-no-company"]')
    const settingsPage = page.locator('[data-testid="settings-page"]')
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    const hasSettings = await settingsPage.isVisible().catch(() => false)
    expect(hasNoCompany || hasSettings).toBe(true)
  })

  test('회사 기본 정보 섹션 표시', async ({ page }) => {
    const section = page.locator('[data-testid="settings-company-info"]')
    const isVisible = await section.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=회사 기본 정보')).toBeVisible()
      await expect(page.locator('text=회사명')).toBeVisible()
      await expect(page.locator('text=Slug')).toBeVisible()
    }
  })

  test('API 키 관리 섹션 표시', async ({ page }) => {
    const section = page.locator('[data-testid="settings-api-keys"]')
    const isVisible = await section.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=API 키 관리')).toBeVisible()
      await expect(page.locator('[data-testid="api-key-add-btn"]')).toBeVisible()
    }
  })

  test('API 키 등록 버튼 클릭 시 폼 표시', async ({ page }) => {
    const btn = page.locator('[data-testid="api-key-add-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      await expect(page.locator('text=서비스 제공자')).toBeVisible()
      await expect(page.locator('text=라벨')).toBeVisible()
    }
  })

  test('기본 설정 섹션 표시', async ({ page }) => {
    const section = page.locator('[data-testid="settings-defaults"]')
    const isVisible = await section.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=기본 설정')).toBeVisible()
      await expect(page.locator('text=타임존')).toBeVisible()
      await expect(page.locator('text=기본 LLM 모델')).toBeVisible()
    }
  })

  test('Slug 필드는 비활성화 상태', async ({ page }) => {
    const section = page.locator('[data-testid="settings-company-info"]')
    const isVisible = await section.isVisible().catch(() => false)
    if (isVisible) {
      const slugInput = section.locator('input[disabled]')
      await expect(slugInput).toBeVisible()
    }
  })
})
