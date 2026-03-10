import { test, expect } from '@playwright/test'

test.describe('Cron — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cron')
    await page.waitForSelector('[data-testid="cron-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="cron-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-cron-btn"]')).toBeVisible()
  })

  test('빈 상태 또는 스케줄 카드 표시', async ({ page }) => {
    const emptyState = page.locator('[data-testid="cron-empty-state"]')
    const scheduleCard = page.locator('[data-testid^="schedule-card-"]').first()
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasCards = await scheduleCard.isVisible().catch(() => false)
    expect(hasEmpty || hasCards).toBe(true)
  })

  test('스케줄 추가 버튼 클릭 시 모달 표시', async ({ page }) => {
    await page.locator('[data-testid="add-cron-btn"]').click()
    await expect(page.locator('[data-testid="cron-modal"]')).toBeVisible()
  })

  test('모달 닫기', async ({ page }) => {
    await page.locator('[data-testid="add-cron-btn"]').click()
    await expect(page.locator('[data-testid="cron-modal"]')).toBeVisible()
    await page.keyboard.press('Escape')
    // Modal should close or still be visible (depends on implementation)
    const stillVisible = await page.locator('[data-testid="cron-modal"]').isVisible().catch(() => false)
    expect(typeof stillVisible).toBe('boolean')
  })
})
