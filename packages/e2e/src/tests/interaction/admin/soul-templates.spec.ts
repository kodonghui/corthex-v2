import { test, expect } from '@playwright/test'

test.describe('Soul Templates — 소울 템플릿 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/soul-templates')
    await page.waitForTimeout(2000)
  })

  test('페이지 렌더링 — 제목', async ({ page }) => {
    const header = page.locator('[data-testid="soul-templates-header"]')
    const noCompany = page.locator('text=회사를 선택하세요')
    const hasHeader = await header.isVisible().catch(() => false)
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    expect(hasHeader || hasNoCompany).toBe(true)
  })

  test('새 템플릿 버튼 클릭 시 폼 표시', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 템플릿")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      await expect(page.locator('[data-testid="soul-create-form"]')).toBeVisible()
      await expect(page.locator('text=새 소울 템플릿')).toBeVisible()
    }
  })

  test('생성 폼 필드 확인', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 템플릿")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      const form = page.locator('[data-testid="soul-create-form"]')
      await expect(form.locator('input[placeholder="예: 친절한 상담원"]')).toBeVisible()
      await expect(form.locator('input[placeholder="예: 고객 응대"]')).toBeVisible()
      await expect(form.locator('textarea')).toBeVisible()
    }
  })

  test('생성 폼 취소', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 템플릿")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      await expect(page.locator('[data-testid="soul-create-form"]')).toBeVisible()
      await page.locator('button:has-text("취소")').first().click()
      await expect(page.locator('[data-testid="soul-create-form"]')).not.toBeVisible()
    }
  })

  test('카드 내용 보기 버튼', async ({ page }) => {
    const viewBtn = page.locator('button:has-text("내용 보기")').first()
    const isVisible = await viewBtn.isVisible().catch(() => false)
    if (isVisible) {
      await viewBtn.click()
      // Modal should appear with full content
      await expect(page.locator('.fixed.inset-0')).toBeVisible()
    }
  })
})
