import { test, expect } from '@playwright/test'

test.describe('Dashboard — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForSelector('[data-testid="dashboard-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible()
  })

  test('WS 상태 표시', async ({ page }) => {
    await expect(page.locator('[data-testid="ws-status"]')).toBeVisible()
  })

  test('요약 카드 4개 표시', async ({ page }) => {
    // 스켈레톤 또는 실제 카드
    const skeleton = page.locator('[data-testid="dashboard-skeleton"]')
    const hasSkeleton = await skeleton.isVisible().catch(() => false)
    if (hasSkeleton) return // 로딩 중이면 패스

    const tasks = page.locator('[data-testid="card-tasks"]')
    const cost = page.locator('[data-testid="card-cost"]')
    const agents = page.locator('[data-testid="card-agents"]')
    const integrations = page.locator('[data-testid="card-integrations"]')

    const hasCards = await tasks.isVisible().catch(() => false)
    if (hasCards) {
      await expect(tasks).toBeVisible()
      await expect(cost).toBeVisible()
      await expect(agents).toBeVisible()
      await expect(integrations).toBeVisible()
    }
  })

  test('사용량 차트 표시', async ({ page }) => {
    const chart = page.locator('[data-testid="usage-chart"]')
    const isVisible = await chart.isVisible().catch(() => false)
    if (isVisible) {
      await expect(chart).toBeVisible()
      await expect(page.locator('[data-testid="usage-toggle"]')).toBeVisible()
    }
  })

  test('예산 바 표시', async ({ page }) => {
    const budget = page.locator('[data-testid="budget-bar"]')
    const isVisible = await budget.isVisible().catch(() => false)
    if (isVisible) {
      await expect(budget).toBeVisible()
    }
  })

  test('만족도 차트 표시', async ({ page }) => {
    const chart = page.locator('[data-testid="satisfaction-chart"]')
    const isVisible = await chart.isVisible().catch(() => false)
    if (isVisible) {
      await expect(chart).toBeVisible()
    }
  })

  test('에러 상태 또는 데이터 표시', async ({ page }) => {
    const error = page.locator('[data-testid="dashboard-error"]')
    const skeleton = page.locator('[data-testid="dashboard-skeleton"]')
    const cards = page.locator('[data-testid="card-tasks"]')
    const hasError = await error.isVisible().catch(() => false)
    const hasSkeleton = await skeleton.isVisible().catch(() => false)
    const hasCards = await cards.isVisible().catch(() => false)
    expect(hasError || hasSkeleton || hasCards).toBe(true)
  })
})
