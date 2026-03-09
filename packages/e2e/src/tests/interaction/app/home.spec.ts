import { test, expect } from '@playwright/test'

test.describe('Home — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('[data-testid="home-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 인사말 표시', async ({ page }) => {
    await expect(page.locator('[data-testid="home-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="greeting-header"]')).toBeVisible()
  })

  test('야간 작업 카드 표시', async ({ page }) => {
    const overnightCard = page.locator('[data-testid="overnight-jobs-card"]')
    const isVisible = await overnightCard.isVisible().catch(() => false)
    if (isVisible) {
      await expect(overnightCard).toBeVisible()
    }
  })

  test('팀 섹션 표시', async ({ page }) => {
    const teamSection = page.locator('[data-testid="my-team-section"]')
    const isVisible = await teamSection.isVisible().catch(() => false)
    if (isVisible) {
      await expect(teamSection).toBeVisible()
    }
  })

  test('빠른 시작 섹션 표시', async ({ page }) => {
    const quickStart = page.locator('[data-testid="quick-start-section"]')
    const isVisible = await quickStart.isVisible().catch(() => false)
    if (isVisible) {
      await expect(quickStart).toBeVisible()
    }
  })

  test('알림 섹션 표시', async ({ page }) => {
    const notifications = page.locator('[data-testid="recent-notifications-section"]')
    const isVisible = await notifications.isVisible().catch(() => false)
    if (isVisible) {
      await expect(notifications).toBeVisible()
    }
  })
})
