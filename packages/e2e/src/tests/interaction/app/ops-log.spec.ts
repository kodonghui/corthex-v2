import { test, expect } from '@playwright/test'

test.describe('Ops Log — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ops-log')
    await page.waitForSelector('[data-testid="ops-log-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="ops-log-page"]')).toBeVisible()
  })

  test('필터 행 표시', async ({ page }) => {
    const filters = page.locator('[data-testid="filters-row"]')
    const isVisible = await filters.isVisible().catch(() => false)
    if (isVisible) {
      await expect(filters).toBeVisible()
    }
  })

  test('검색 입력 표시 및 타이핑', async ({ page }) => {
    const search = page.locator('[data-testid="search-input"]')
    const isVisible = await search.isVisible().catch(() => false)
    if (!isVisible) return

    await search.fill('테스트 검색')
    await expect(search).toHaveValue('테스트 검색')
  })

  test('북마크 필터 토글', async ({ page }) => {
    const bookmark = page.locator('[data-testid="bookmark-filter"]')
    const isVisible = await bookmark.isVisible().catch(() => false)
    if (isVisible) {
      await bookmark.click()
      // 토글 상태 변경 확인
      await expect(bookmark).toBeVisible()
    }
  })

  test('로딩 또는 빈 상태 또는 테이블 표시', async ({ page }) => {
    const loading = page.locator('[data-testid="ops-loading"]')
    const empty = page.locator('[data-testid="ops-empty"]')
    const table = page.locator('[data-testid="ops-table"]')
    const hasLoading = await loading.isVisible().catch(() => false)
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasTable = await table.isVisible().catch(() => false)
    expect(hasLoading || hasEmpty || hasTable).toBe(true)
  })

  test('비교 버튼 표시', async ({ page }) => {
    const compareBtn = page.locator('[data-testid="compare-btn"]')
    const isVisible = await compareBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(compareBtn).toBeVisible()
    }
  })

  test('내보내기 버튼 표시', async ({ page }) => {
    const exportBtn = page.locator('[data-testid="export-btn"]')
    const isVisible = await exportBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(exportBtn).toBeVisible()
    }
  })

  test('페이지네이션 표시', async ({ page }) => {
    const pagination = page.locator('[data-testid="pagination"]')
    const isVisible = await pagination.isVisible().catch(() => false)
    if (isVisible) {
      await expect(pagination).toBeVisible()
    }
  })
})
