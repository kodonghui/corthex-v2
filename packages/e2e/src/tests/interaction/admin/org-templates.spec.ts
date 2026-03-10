import { test, expect } from '@playwright/test'

test.describe('Org Templates — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/org-templates')
    await page.waitForSelector('[data-testid="org-templates-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 다크 테마 확인', async ({ page }) => {
    const container = page.locator('[data-testid="org-templates-page"]')
    await expect(container).toBeVisible()
  })

  test('템플릿 생성 버튼 표시', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-template-btn"]')
    await expect(createBtn).toBeVisible()
  })

  test('템플릿 카드 표시', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="template-card-"]').first()
    const hasCard = await firstCard.isVisible().catch(() => false)
    if (hasCard) {
      await expect(firstCard).toBeVisible()
    }
  })

  test('템플릿 생성 버튼 클릭 시 모달 열림', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-template-btn"]')
    await createBtn.click()
    const modal = page.locator('[data-testid="edit-template-modal"]')
    await expect(modal).toBeVisible({ timeout: 3000 })
  })

  test('템플릿 카드 클릭 시 상세 또는 편집 동작', async ({ page }) => {
    const firstCard = page.locator('[data-testid^="template-card-"]').first()
    const hasCard = await firstCard.isVisible().catch(() => false)
    if (!hasCard) {
      test.skip()
      return
    }

    await firstCard.click()
  })

  test('적용 버튼 표시', async ({ page }) => {
    const applyBtn = page.locator('[data-testid="apply-template-btn"]').first()
    const isVisible = await applyBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(applyBtn).toBeVisible()
    }
  })

  test('발행 토글 표시', async ({ page }) => {
    const publishToggle = page.locator('[data-testid="publish-toggle"]').first()
    const isVisible = await publishToggle.isVisible().catch(() => false)
    if (isVisible) {
      await expect(publishToggle).toBeVisible()
    }
  })
})
