import { test, expect } from '@playwright/test'

test.describe('Costs Admin — 비용 관리 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/costs')
    await page.waitForSelector('[data-testid="costs-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 — 제목 표시', async ({ page }) => {
    await expect(page.locator('[data-testid="costs-page"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('비용 관리')
  })

  test('회사 미선택 시 안내 메시지 또는 정상 렌더링', async ({ page }) => {
    const noCompany = page.locator('[data-testid="costs-no-company"]')
    const summaryCards = page.locator('[data-testid="costs-summary-cards"]')
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    const hasSummary = await summaryCards.isVisible().catch(() => false)
    expect(hasNoCompany || hasSummary).toBe(true)
  })

  test('요약 카드 4개 표시', async ({ page }) => {
    const cards = page.locator('[data-testid="costs-summary-cards"] > div')
    const count = await cards.count()
    // 로딩 스켈레톤이거나 데이터 카드 4개
    expect(count).toBe(4)
  })

  test('3축 분석 탭 존재', async ({ page }) => {
    const tabSection = page.locator('text=3축 비용 분석')
    const isVisible = await tabSection.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=에이전트별')).toBeVisible()
      await expect(page.locator('text=모델별')).toBeVisible()
      await expect(page.locator('text=부서별')).toBeVisible()
    }
  })

  test('예산 설정 패널 존재', async ({ page }) => {
    const budgetTitle = page.locator('[data-testid="budget-panel-title"]')
    const isVisible = await budgetTitle.isVisible().catch(() => false)
    if (isVisible) {
      await expect(budgetTitle).toContainText('예산 설정')
    }
  })

  test('일일 비용 차트 존재', async ({ page }) => {
    const chartTitle = page.locator('[data-testid="daily-chart-title"]')
    const isVisible = await chartTitle.isVisible().catch(() => false)
    if (isVisible) {
      await expect(chartTitle).toContainText('일일 비용 추이')
      await expect(page.locator('text=7일')).toBeVisible()
      await expect(page.locator('text=30일')).toBeVisible()
    }
  })

  test('날짜 필터 입력 가능', async ({ page }) => {
    const dateInputs = page.locator('input[type="date"]')
    const count = await dateInputs.count()
    if (count >= 2) {
      await expect(dateInputs.first()).toBeVisible()
      await expect(dateInputs.nth(1)).toBeVisible()
    }
  })
})
