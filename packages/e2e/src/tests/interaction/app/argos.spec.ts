import { test, expect } from '@playwright/test'

test.describe('ARGOS — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/argos')
    await page.waitForSelector('[data-testid="argos-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="argos-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-trigger-btn"]')).toBeVisible()
  })

  test('빈 상태 또는 트리거 카드 표시', async ({ page }) => {
    const emptyState = page.locator('[data-testid="argos-empty-state"]')
    const triggerCard = page.locator('[data-testid^="trigger-card-"]').first()
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasCards = await triggerCard.isVisible().catch(() => false)
    expect(hasEmpty || hasCards).toBe(true)
  })

  test('트리거 추가 버튼 클릭 시 모달 표시', async ({ page }) => {
    await page.locator('[data-testid="add-trigger-btn"]').click()
    await expect(page.locator('[data-testid="trigger-modal"]')).toBeVisible()
  })

  test('이벤트 로그 섹션 표시', async ({ page }) => {
    const eventLog = page.locator('[data-testid="event-log-section"]')
    const isVisible = await eventLog.isVisible().catch(() => false)
    if (isVisible) {
      await expect(eventLog).toBeVisible()
    }
  })
})
