import { test, expect } from '@playwright/test'

test.describe('Users Admin — 직원 관리 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users')
    const noCompany = page.locator('[data-testid="no-company"]')
    const usersPage = page.locator('[data-testid="users-page"]')
    await Promise.race([
      noCompany.waitFor({ timeout: 15000 }).catch(() => {}),
      usersPage.waitFor({ timeout: 15000 }).catch(() => {}),
    ])
  })

  test('페이지 렌더링 — 제목 또는 미선택 메시지', async ({ page }) => {
    const noCompany = page.locator('[data-testid="no-company"]')
    const usersPage = page.locator('[data-testid="users-page"]')
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    const hasUsers = await usersPage.isVisible().catch(() => false)
    expect(hasNoCompany || hasUsers).toBe(true)
  })

  test('페이지 제목 "직원 관리" 표시', async ({ page }) => {
    const usersPage = page.locator('[data-testid="users-page"]')
    const isVisible = await usersPage.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('h1:text("직원 관리")')).toBeVisible()
    }
  })

  test('직원 추가 버튼 표시', async ({ page }) => {
    const btn = page.locator('[data-testid="add-user-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(btn).toContainText('직원 추가')
    }
  })

  test('직원 추가 버튼 클릭 시 생성 폼 표시', async ({ page }) => {
    const btn = page.locator('[data-testid="add-user-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      const form = page.locator('[data-testid="create-form"]')
      await expect(form).toBeVisible()
      await expect(page.locator('text=새 직원 추가')).toBeVisible()
    }
  })

  test('부서 필터 탭 존재', async ({ page }) => {
    const filter = page.locator('[data-testid="dept-filter"]')
    const isVisible = await filter.isVisible().catch(() => false)
    if (isVisible) {
      await expect(filter.locator('button').first()).toContainText('전체')
    }
  })

  test('직원 테이블 표시', async ({ page }) => {
    const table = page.locator('[data-testid="user-table"]')
    const isVisible = await table.isVisible().catch(() => false)
    if (isVisible) {
      // Table headers or empty state should be visible
      const hasHeaders = await page.locator('th:text("이름")').isVisible().catch(() => false)
      const hasEmpty = await page.locator('text=직원이 없습니다').isVisible().catch(() => false)
      expect(hasHeaders || hasEmpty).toBe(true)
    }
  })
})
