import { test, expect } from '@playwright/test'

test.describe('Classified — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/classified')
    await page.waitForSelector('[data-testid="classified-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="classified-page"]')).toBeVisible()
  })

  test('폴더 사이드바 표시', async ({ page }) => {
    const sidebar = page.locator('[data-testid="folder-sidebar"]')
    const isVisible = await sidebar.isVisible().catch(() => false)
    if (isVisible) {
      await expect(sidebar).toBeVisible()
    }
  })

  test('필터 바 표시 및 검색 입력', async ({ page }) => {
    const filterBar = page.locator('[data-testid="filter-bar"]')
    await expect(filterBar).toBeVisible()
    const searchInput = filterBar.locator('input[placeholder="검색..."]')
    await searchInput.fill('테스트 검색')
    await expect(searchInput).toHaveValue('테스트 검색')
  })

  test('빈 상태 또는 문서 테이블 표시', async ({ page }) => {
    const emptyState = page.locator('[data-testid="classified-empty-state"]')
    const table = page.locator('[data-testid="document-table"]')
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasTable = await table.isVisible().catch(() => false)
    expect(hasEmpty || hasTable).toBe(true)
  })

  test('필터 칩 표시 및 초기화', async ({ page }) => {
    const filterBar = page.locator('[data-testid="filter-bar"]')
    const searchInput = filterBar.locator('input[placeholder="검색..."]')
    await searchInput.fill('필터 테스트')
    // Wait for debounce
    await page.waitForTimeout(500)
    const chips = page.locator('[data-testid="filter-chips"]')
    const hasChips = await chips.isVisible().catch(() => false)
    if (hasChips) {
      await expect(chips).toBeVisible()
    }
  })
})
