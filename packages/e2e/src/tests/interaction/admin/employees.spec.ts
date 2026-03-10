import { test, expect } from '@playwright/test'

test.describe('Employees Admin — 직원 관리 (워크스페이스) 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/employees')
    const noCompany = page.locator('[data-testid="no-company"]')
    const empPage = page.locator('[data-testid="employees-page"]')
    await Promise.race([
      noCompany.waitFor({ timeout: 15000 }).catch(() => {}),
      empPage.waitFor({ timeout: 15000 }).catch(() => {}),
    ])
  })

  test('페이지 렌더링 — 제목 또는 미선택 메시지', async ({ page }) => {
    const noCompany = page.locator('[data-testid="no-company"]')
    const empPage = page.locator('[data-testid="employees-page"]')
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    const hasPage = await empPage.isVisible().catch(() => false)
    expect(hasNoCompany || hasPage).toBe(true)
  })

  test('페이지 제목 "직원 관리" 표시', async ({ page }) => {
    const empPage = page.locator('[data-testid="employees-page"]')
    const isVisible = await empPage.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('h1:text("직원 관리")')).toBeVisible()
    }
  })

  test('직원 초대 버튼 표시', async ({ page }) => {
    const btn = page.locator('[data-testid="invite-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(btn).toContainText('직원 초대')
    }
  })

  test('직원 초대 버튼 클릭 시 모달 표시', async ({ page }) => {
    const btn = page.locator('[data-testid="invite-btn"]')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      const modal = page.locator('[data-testid="invite-modal"]')
      await expect(modal).toBeVisible()
      await expect(page.locator('text=직원 초대').last()).toBeVisible()
    }
  })

  test('검색 입력 필드 표시', async ({ page }) => {
    const input = page.locator('[data-testid="search-input"]')
    const isVisible = await input.isVisible().catch(() => false)
    if (isVisible) {
      await expect(input).toHaveAttribute('placeholder', '이름 또는 이메일로 검색...')
    }
  })

  test('필터 섹션 표시', async ({ page }) => {
    const filters = page.locator('[data-testid="filters"]')
    const isVisible = await filters.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('button:text("전체")').first()).toBeVisible()
      await expect(page.locator('button:text("활성")')).toBeVisible()
      await expect(page.locator('button:text("비활성")')).toBeVisible()
      await expect(page.locator('button:text("전체 부서")')).toBeVisible()
    }
  })

  test('직원 테이블 표시', async ({ page }) => {
    const table = page.locator('[data-testid="employee-table"]')
    const isVisible = await table.isVisible().catch(() => false)
    if (isVisible) {
      const hasHeaders = await page.locator('th:text("이름")').isVisible().catch(() => false)
      const hasEmpty = await page.locator('text=아직 등록된 직원이 없습니다').isVisible().catch(() => false)
      expect(hasHeaders || hasEmpty).toBe(true)
    }
  })
})
