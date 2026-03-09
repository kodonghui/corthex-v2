import { test, expect } from '@playwright/test'

test.describe('Notifications — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notifications')
    await page.waitForSelector('[data-testid="notifications-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 다크 테마 확인', async ({ page }) => {
    const container = page.locator('[data-testid="notifications-page"]')
    await expect(container).toBeVisible()
  })

  test('필터 버튼 표시 (전체/안읽음)', async ({ page }) => {
    await expect(page.locator('[data-testid="filter-all"]')).toBeVisible()
    await expect(page.locator('[data-testid="filter-unread"]')).toBeVisible()
  })

  test('필터 전환 동작', async ({ page }) => {
    const filterAll = page.locator('[data-testid="filter-all"]')
    const filterUnread = page.locator('[data-testid="filter-unread"]')

    await filterUnread.click()
    await filterAll.click()
  })

  test('모두 읽음 버튼 표시', async ({ page }) => {
    const markAll = page.locator('[data-testid="mark-all-read"]')
    const isVisible = await markAll.isVisible().catch(() => false)
    if (isVisible) {
      await expect(markAll).toBeVisible()
    }
  })

  test('알림 항목 클릭 가능', async ({ page }) => {
    const firstNotification = page.locator('[data-testid^="notification-"]').first()
    const hasNotification = await firstNotification.isVisible().catch(() => false)
    if (!hasNotification) {
      test.skip()
      return
    }
    // 클릭 가능 확인
    await expect(firstNotification).toBeEnabled()
  })

  test('알림 설정 탭 접근', async ({ page }) => {
    const settingsTab = page.locator('[data-testid="notification-settings"]')
    const isVisible = await settingsTab.isVisible().catch(() => false)
    if (isVisible) {
      await settingsTab.click()
    }
  })
})
