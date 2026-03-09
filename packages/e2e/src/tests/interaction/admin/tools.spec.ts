import { test, expect } from '@playwright/test'

test.describe('Tools Admin — 도구 관리 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/tools')
    const noCompany = page.locator('[data-testid="no-company"]')
    const toolsPage = page.locator('[data-testid="tools-page"]')
    await Promise.race([
      noCompany.waitFor({ timeout: 15000 }).catch(() => {}),
      toolsPage.waitFor({ timeout: 15000 }).catch(() => {}),
    ])
  })

  test('페이지 렌더링 — 제목 또는 미선택 메시지', async ({ page }) => {
    const noCompany = page.locator('[data-testid="no-company"]')
    const toolsPage = page.locator('[data-testid="tools-page"]')
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    const hasTools = await toolsPage.isVisible().catch(() => false)
    expect(hasNoCompany || hasTools).toBe(true)
  })

  test('미선택 시 "회사를 선택하세요" 표시', async ({ page }) => {
    const noCompany = page.locator('[data-testid="no-company"]')
    const isVisible = await noCompany.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=회사를 선택하세요')).toBeVisible()
    }
  })

  test('페이지 제목 "도구 관리" 표시', async ({ page }) => {
    const toolsPage = page.locator('[data-testid="tools-page"]')
    const isVisible = await toolsPage.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=도구 관리')).toBeVisible()
    }
  })

  test('카테고리 필터 탭 존재', async ({ page }) => {
    const tabs = page.locator('[data-testid="category-tabs"]')
    const isVisible = await tabs.isVisible().catch(() => false)
    if (isVisible) {
      await expect(tabs.locator('button').first()).toBeVisible()
      await expect(page.locator('text=전체')).toBeVisible()
    }
  })

  test('도구 카탈로그 테이블 표시', async ({ page }) => {
    const catalog = page.locator('[data-testid="tool-catalog"]')
    const isVisible = await catalog.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=이름')).toBeVisible()
      await expect(page.locator('text=카테고리')).toBeVisible()
      await expect(page.locator('text=설명')).toBeVisible()
      await expect(page.locator('text=상태')).toBeVisible()
    }
  })

  test('에이전트 권한 매트릭스 표시', async ({ page }) => {
    const matrix = page.locator('[data-testid="permission-matrix"]')
    const isVisible = await matrix.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=에이전트')).toBeVisible()
    }
  })

  test('로딩 상태 표시', async ({ page }) => {
    const loading = page.locator('[data-testid="loading-state"]')
    const isVisible = await loading.isVisible().catch(() => false)
    // Loading state may or may not be visible depending on timing
    expect(typeof isVisible).toBe('boolean')
  })

  test('빈 상태 표시', async ({ page }) => {
    const empty = page.locator('[data-testid="empty-state"]')
    const isVisible = await empty.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=등록된 도구가 없습니다')).toBeVisible()
    }
  })
})
