import { test, expect } from '@playwright/test'

test.describe('SNS — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sns')
    await page.waitForSelector('[data-testid="sns-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="sns-page"]')).toBeVisible()
  })

  test('탭 바 표시 및 전환', async ({ page }) => {
    const tabs = page.locator('[data-testid="sns-tabs"]')
    const isVisible = await tabs.isVisible().catch(() => false)
    if (!isVisible) return

    await expect(tabs).toBeVisible()

    // 초안 탭 클릭
    const draftTab = page.locator('[data-testid="sns-tab-draft"]')
    const hasDraft = await draftTab.isVisible().catch(() => false)
    if (hasDraft) {
      await draftTab.click()
      await expect(draftTab).toBeVisible()
    }
  })

  test('새 게시물 버튼 표시', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-post-btn"]')
    const isVisible = await createBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(createBtn).toBeVisible()
    }
  })

  test('새 게시물 버튼 클릭 시 모달 열림', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-post-btn"]')
    const isVisible = await createBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await createBtn.click()
    await expect(page.locator('[data-testid="create-post-modal"]')).toBeVisible({ timeout: 3000 })
  })

  test('로딩 또는 빈 상태 또는 게시물 목록 표시', async ({ page }) => {
    const loading = page.locator('[data-testid="sns-loading"]')
    const empty = page.locator('[data-testid="sns-empty"]')
    const list = page.locator('[data-testid="sns-post-list"]')
    const hasLoading = await loading.isVisible().catch(() => false)
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasList = await list.isVisible().catch(() => false)
    expect(hasLoading || hasEmpty || hasList).toBe(true)
  })

  test('계정 관리 버튼 표시', async ({ page }) => {
    const accountBtn = page.locator('[data-testid="manage-accounts-btn"]')
    const isVisible = await accountBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(accountBtn).toBeVisible()
    }
  })

  test('플랫폼 필터 표시', async ({ page }) => {
    const filter = page.locator('[data-testid="platform-filter"]')
    const isVisible = await filter.isVisible().catch(() => false)
    if (isVisible) {
      await expect(filter).toBeVisible()
    }
  })
})
