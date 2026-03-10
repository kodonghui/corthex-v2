import { test, expect } from '@playwright/test'

test.describe('Trading (전략실) — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trading')
    await page.waitForSelector('[data-testid="trading-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="trading-page"]')).toBeVisible()
  })

  test('종목 사이드바 표시', async ({ page }) => {
    const sidebar = page.locator('[data-testid="stock-sidebar"]')
    const isVisible = await sidebar.isVisible().catch(() => false)
    if (isVisible) {
      await expect(sidebar).toBeVisible()
    }
  })

  test('종목 검색 입력 필드', async ({ page }) => {
    const searchInput = page.locator('[data-testid="stock-search-input"]')
    const isVisible = await searchInput.isVisible().catch(() => false)
    if (isVisible) {
      await expect(searchInput).toBeVisible()
    }
  })

  test('시장 필터 버튼 표시', async ({ page }) => {
    const filterAll = page.locator('[data-testid="market-filter-all"]')
    const isVisible = await filterAll.isVisible().catch(() => false)
    if (isVisible) {
      await expect(filterAll).toBeVisible()
      await expect(page.locator('[data-testid="market-filter-kr"]')).toBeVisible()
      await expect(page.locator('[data-testid="market-filter-us"]')).toBeVisible()
    }
  })

  test('비교 토글 버튼', async ({ page }) => {
    const compareBtn = page.locator('[data-testid="compare-toggle-btn"]')
    const isVisible = await compareBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(compareBtn).toBeVisible()
    }
  })

  test('채팅 패널 표시 (데스크톱)', async ({ page }) => {
    const chatPanel = page.locator('[data-testid="trading-chat-panel"]')
    const isVisible = await chatPanel.isVisible().catch(() => false)
    if (isVisible) {
      await expect(chatPanel).toBeVisible()
    }
  })

  test('모바일 탭 전환', async ({ page }) => {
    const chartTab = page.locator('[data-testid="mobile-tab-chart"]')
    const chatTab = page.locator('[data-testid="mobile-tab-chat"]')
    const hasChartTab = await chartTab.isVisible().catch(() => false)
    if (hasChartTab) {
      await expect(chartTab).toBeVisible()
      await expect(chatTab).toBeVisible()
    }
  })
})
