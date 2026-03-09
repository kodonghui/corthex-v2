import { test, expect } from '@playwright/test'

test.describe('Companies — 회사 관리 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/companies')
    await page.waitForSelector('[data-testid="companies-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 — 제목 표시', async ({ page }) => {
    await expect(page.locator('[data-testid="companies-page"]')).toBeVisible()
    await expect(page.locator('h1')).toContainText('회사 관리')
  })

  test('회사 추가 버튼 존재', async ({ page }) => {
    await expect(page.locator('[data-testid="company-add-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="company-add-btn"]')).toContainText('회사 추가')
  })

  test('검색 입력창 존재 및 입력 가능', async ({ page }) => {
    const search = page.locator('[data-testid="company-search"]')
    await expect(search).toBeVisible()
    await search.fill('테스트')
    await expect(search).toHaveValue('테스트')
  })

  test('회사 추가 버튼 클릭 시 폼 표시', async ({ page }) => {
    await page.locator('[data-testid="company-add-btn"]').click()
    await expect(page.locator('[data-testid="company-create-form"]')).toBeVisible()
    await expect(page.locator('text=새 회사')).toBeVisible()
  })

  test('생성 폼 취소 버튼 동작', async ({ page }) => {
    await page.locator('[data-testid="company-add-btn"]').click()
    await expect(page.locator('[data-testid="company-create-form"]')).toBeVisible()
    await page.locator('[data-testid="company-create-form"] button:has-text("취소")').click()
    await expect(page.locator('[data-testid="company-create-form"]')).not.toBeVisible()
  })

  test('회사 목록 또는 로딩 스켈레톤 표시', async ({ page }) => {
    const list = page.locator('[data-testid="company-list"]')
    const skeleton = page.locator('.animate-pulse').first()
    const hasList = await list.isVisible().catch(() => false)
    const hasSkeleton = await skeleton.isVisible().catch(() => false)
    expect(hasList || hasSkeleton).toBe(true)
  })

  test('회사 수 표시', async ({ page }) => {
    const subtitle = page.locator('text=/\\d+개 회사/')
    await expect(subtitle).toBeVisible({ timeout: 10000 })
  })
})
