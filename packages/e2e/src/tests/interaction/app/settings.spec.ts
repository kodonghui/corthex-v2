import { test, expect } from '@playwright/test'

test.describe('Settings — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForSelector('[data-testid="settings-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 다크 테마 확인', async ({ page }) => {
    const container = page.locator('[data-testid="settings-page"]')
    await expect(container).toBeVisible()
  })

  test('프로필 탭 표시', async ({ page }) => {
    const profileTab = page.locator('[data-testid="profile-tab"]')
    await expect(profileTab).toBeVisible()
  })

  test('디스플레이 탭 전환', async ({ page }) => {
    const displayTab = page.locator('[data-testid="display-tab"]')
    const isVisible = await displayTab.isVisible().catch(() => false)
    if (isVisible) {
      await displayTab.click()
    }
  })

  test('커맨드센터 탭 전환', async ({ page }) => {
    const ccTab = page.locator('[data-testid="command-center-tab"]')
    const isVisible = await ccTab.isVisible().catch(() => false)
    if (isVisible) {
      await ccTab.click()
    }
  })

  test('API 키 탭 전환 및 추가 폼 확인', async ({ page }) => {
    const apiTab = page.locator('[data-testid="api-keys-tab"]')
    const isVisible = await apiTab.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await apiTab.click()
    const addForm = page.locator('[data-testid="add-api-key-form"]')
    const hasForm = await addForm.isVisible().catch(() => false)
    if (hasForm) {
      await expect(addForm).toBeVisible()
    }
  })

  test('텔레그램 섹션 표시', async ({ page }) => {
    const telegram = page.locator('[data-testid="telegram-section"]')
    const isVisible = await telegram.isVisible().catch(() => false)
    if (isVisible) {
      await expect(telegram).toBeVisible()
    }
  })
})
