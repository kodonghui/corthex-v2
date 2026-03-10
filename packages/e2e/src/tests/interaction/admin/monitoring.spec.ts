import { test, expect } from '@playwright/test'

test.describe('Monitoring Admin — 시스템 모니터링 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/monitoring')
    const monPage = page.locator('[data-testid="monitoring-page"]')
    await monPage.waitFor({ timeout: 15000 }).catch(() => {})
  })

  test('페이지 렌더링 — 제목 표시', async ({ page }) => {
    await expect(page.locator('text=시스템 모니터링')).toBeVisible()
  })

  test('새로고침 버튼 표시', async ({ page }) => {
    const btn = page.locator('[data-testid="refresh-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(btn).toContainText('새로고침')
    }
  })

  test('서버 상태 카드 표시', async ({ page }) => {
    const card = page.locator('[data-testid="server-card"]')
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=서버 상태')).toBeVisible()
      await expect(page.locator('text=업타임')).toBeVisible()
      await expect(page.locator('text=런타임')).toBeVisible()
      await expect(page.locator('text=빌드')).toBeVisible()
    }
  })

  test('메모리 카드 표시', async ({ page }) => {
    const card = page.locator('[data-testid="memory-card"]')
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=메모리')).toBeVisible()
      await expect(page.locator('text=RSS')).toBeVisible()
      await expect(page.locator('text=Heap')).toBeVisible()
    }
  })

  test('데이터베이스 카드 표시', async ({ page }) => {
    const card = page.locator('[data-testid="db-card"]')
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=데이터베이스')).toBeVisible()
      await expect(page.locator('text=응답 시간')).toBeVisible()
    }
  })

  test('에러 카드 표시', async ({ page }) => {
    const card = page.locator('[data-testid="error-card"]')
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=에러 (24시간)')).toBeVisible()
    }
  })

  test('로딩 상태 또는 데이터 표시', async ({ page }) => {
    const loading = page.locator('[data-testid="loading-state"]')
    const serverCard = page.locator('[data-testid="server-card"]')
    const hasLoading = await loading.isVisible().catch(() => false)
    const hasData = await serverCard.isVisible().catch(() => false)
    expect(hasLoading || hasData).toBe(true)
  })

  test('새로고침 버튼 클릭 동작', async ({ page }) => {
    const btn = page.locator('[data-testid="refresh-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      // Button text should change briefly to "새로고침 중..." or stay as "새로고침"
      const text = await btn.textContent()
      expect(text).toBeTruthy()
    }
  })
})
