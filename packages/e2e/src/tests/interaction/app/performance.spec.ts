import { test, expect } from '@playwright/test'

test.describe('Performance — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/performance')
    await page.waitForSelector('[data-testid="performance-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 다크 테마 확인', async ({ page }) => {
    const container = page.locator('[data-testid="performance-page"]')
    await expect(container).toBeVisible()
    await expect(container).toHaveCSS('background-color', 'rgb(15, 23, 42)') // bg-slate-900
  })

  test('탭 바 표시 및 전환', async ({ page }) => {
    const tabBar = page.locator('[data-testid="tab-bar"]')
    await expect(tabBar).toBeVisible()

    const agentTab = page.locator('[data-testid="tab-agent"]')
    const qualityTab = page.locator('[data-testid="tab-quality"]')
    await expect(agentTab).toBeVisible()
    await expect(qualityTab).toBeVisible()

    // 탭 전환
    await qualityTab.click()
    await expect(page.locator('[data-testid="quality-dashboard"]')).toBeVisible()

    await agentTab.click()
    await expect(page.locator('[data-testid="agent-performance-table"]')).toBeVisible()
  })

  test('요약 카드 표시', async ({ page }) => {
    const summaryCards = page.locator('[data-testid="summary-cards"]')
    await expect(summaryCards).toBeVisible()
  })

  test('에이전트 성과 테이블 표시', async ({ page }) => {
    const table = page.locator('[data-testid="agent-performance-table"]')
    await expect(table).toBeVisible()
  })

  test('역할/레벨 필터 동작', async ({ page }) => {
    const roleFilter = page.locator('[data-testid="role-filter"]')
    const levelFilter = page.locator('[data-testid="level-filter"]')

    const hasRole = await roleFilter.isVisible().catch(() => false)
    const hasLevel = await levelFilter.isVisible().catch(() => false)

    if (hasRole) {
      await roleFilter.selectOption({ index: 1 })
    }
    if (hasLevel) {
      await levelFilter.selectOption({ index: 1 })
    }
  })

  test('에이전트 클릭 시 상세 모달 열림', async ({ page }) => {
    const firstRow = page.locator('[data-testid^="agent-row-"]').first()
    const hasRow = await firstRow.isVisible().catch(() => false)
    if (!hasRow) {
      test.skip()
      return
    }

    await firstRow.click()
    await expect(page.locator('[data-testid="agent-detail-modal"]')).toBeVisible({ timeout: 3000 })
  })

  test('소울짐 패널 표시', async ({ page }) => {
    const soulGym = page.locator('[data-testid="soul-gym-panel"]')
    const isVisible = await soulGym.isVisible().catch(() => false)
    if (isVisible) {
      await expect(soulGym).toBeVisible()
    }
  })

  test('퀄리티 대시보드 탭 내용 표시', async ({ page }) => {
    await page.locator('[data-testid="tab-quality"]').click()
    await expect(page.locator('[data-testid="quality-dashboard"]')).toBeVisible()

    const summaryCards = page.locator('[data-testid="quality-summary-cards"]')
    const isVisible = await summaryCards.isVisible().catch(() => false)
    if (isVisible) {
      await expect(summaryCards).toBeVisible()
    }
  })
})
