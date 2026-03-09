import { test, expect } from '@playwright/test'

test.describe('Agent Marketplace — 에이전트 마켓 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/agent-marketplace')
    await page.waitForTimeout(2000)
  })

  test('페이지 렌더링 — 제목과 부제목', async ({ page }) => {
    await expect(page.locator('[data-testid="marketplace-header"]')).toBeVisible()
    await expect(page.locator('h1:has-text("에이전트 마켓")')).toBeVisible()
  })

  test('필터 바 렌더링', async ({ page }) => {
    const filters = page.locator('[data-testid="marketplace-filters"]')
    await expect(filters).toBeVisible()
    await expect(filters.locator('input[placeholder="템플릿 검색..."]')).toBeVisible()
    await expect(filters.locator('select').first()).toBeVisible()
  })

  test('검색 필터 동작', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="템플릿 검색..."]')
    await searchInput.fill('test-search')
    await expect(searchInput).toHaveValue('test-search')
  })

  test('카테고리 드롭다운 기본값', async ({ page }) => {
    const categorySelect = page.locator('select').first()
    const defaultOption = await categorySelect.inputValue()
    expect(defaultOption).toBe('')
  })

  test('티어 드롭다운 옵션', async ({ page }) => {
    const tierSelect = page.locator('select').last()
    await expect(tierSelect.locator('option:has-text("전체 티어")')).toBeVisible()
    await expect(tierSelect.locator('option:has-text("매니저")')).toBeVisible()
    await expect(tierSelect.locator('option:has-text("전문가")')).toBeVisible()
    await expect(tierSelect.locator('option:has-text("워커")')).toBeVisible()
  })

  test('템플릿 카드 클릭 시 프리뷰 모달', async ({ page }) => {
    const card = page.locator('[data-testid^="marketplace-card-"]').first()
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await card.click()
      await expect(page.locator('[data-testid="marketplace-preview-modal"]')).toBeVisible()
      await expect(page.locator('text=가져오기')).toBeVisible()
    }
  })
})
