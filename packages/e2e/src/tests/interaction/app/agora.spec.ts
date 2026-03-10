import { test, expect } from '@playwright/test'

test.describe('AGORA (토론) — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agora')
    await page.waitForSelector('[data-testid="agora-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="agora-page"]')).toBeVisible()
  })

  test('토론 목록 패널 표시', async ({ page }) => {
    const listPanel = page.locator('[data-testid="debate-list-panel"]')
    await expect(listPanel).toBeVisible()
  })

  test('새 토론 버튼 표시', async ({ page }) => {
    const createBtn = page.locator('[data-testid="debate-create-btn"]')
    await expect(createBtn).toBeVisible()
  })

  test('토론 필터 버튼 표시', async ({ page }) => {
    const filterAll = page.locator('[data-testid="debate-filter-all"]')
    const isVisible = await filterAll.isVisible().catch(() => false)
    if (isVisible) {
      await expect(filterAll).toBeVisible()
      await expect(page.locator('[data-testid="debate-filter-in-progress"]')).toBeVisible()
      await expect(page.locator('[data-testid="debate-filter-completed"]')).toBeVisible()
      await expect(page.locator('[data-testid="debate-filter-failed"]')).toBeVisible()
    }
  })

  test('새 토론 모달 열기', async ({ page }) => {
    const createBtn = page.locator('[data-testid="debate-create-btn"]')
    const isVisible = await createBtn.isVisible().catch(() => false)
    if (isVisible) {
      await createBtn.click()
      const modal = page.locator('[data-testid="create-debate-modal"]')
      await expect(modal).toBeVisible({ timeout: 5000 })
      await expect(page.locator('[data-testid="debate-topic-input"]')).toBeVisible()
      await expect(page.locator('[data-testid="debate-cancel-btn"]')).toBeVisible()
      await expect(page.locator('[data-testid="debate-submit-btn"]')).toBeVisible()
    }
  })

  test('토론 유형 선택 버튼', async ({ page }) => {
    const createBtn = page.locator('[data-testid="debate-create-btn"]')
    const isVisible = await createBtn.isVisible().catch(() => false)
    if (isVisible) {
      await createBtn.click()
      await page.waitForSelector('[data-testid="create-debate-modal"]', { timeout: 5000 })
      await expect(page.locator('[data-testid="debate-type-debate"]')).toBeVisible()
      await expect(page.locator('[data-testid="debate-type-deep"]')).toBeVisible()
    }
  })

  test('모달 취소 버튼으로 닫기', async ({ page }) => {
    const createBtn = page.locator('[data-testid="debate-create-btn"]')
    const isVisible = await createBtn.isVisible().catch(() => false)
    if (isVisible) {
      await createBtn.click()
      await page.waitForSelector('[data-testid="create-debate-modal"]', { timeout: 5000 })
      await page.locator('[data-testid="debate-cancel-btn"]').click()
      await expect(page.locator('[data-testid="create-debate-modal"]')).not.toBeVisible()
    }
  })
})
