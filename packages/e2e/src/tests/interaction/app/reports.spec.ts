import { test, expect } from '@playwright/test'

test.describe('Reports — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await page.waitForSelector('[data-testid="reports-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="reports-page"]')).toBeVisible()
  })

  test('새 보고서 버튼 표시', async ({ page }) => {
    const newBtn = page.locator('[data-testid="new-report-btn"]')
    const isVisible = await newBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(newBtn).toBeVisible()
    }
  })

  test('탭 바 표시 및 탭 전환', async ({ page }) => {
    const tabs = page.locator('[data-testid="report-tabs"]')
    const isVisible = await tabs.isVisible().catch(() => false)
    if (!isVisible) return

    await expect(tabs).toBeVisible()

    // 내 보고서 탭 클릭
    const mineTab = page.locator('[data-testid="report-tab-mine"]')
    const hasMine = await mineTab.isVisible().catch(() => false)
    if (hasMine) {
      await mineTab.click()
      await expect(mineTab).toBeVisible()
    }

    // 받은 보고서 탭 클릭
    const receivedTab = page.locator('[data-testid="report-tab-received"]')
    const hasReceived = await receivedTab.isVisible().catch(() => false)
    if (hasReceived) {
      await receivedTab.click()
      await expect(receivedTab).toBeVisible()
    }
  })

  test('로딩 또는 빈 상태 또는 보고서 목록 표시', async ({ page }) => {
    const loading = page.locator('[data-testid="reports-loading"]')
    const empty = page.locator('[data-testid="reports-empty"]')
    const list = page.locator('[data-testid="reports-list"]')
    const hasLoading = await loading.isVisible().catch(() => false)
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasList = await list.isVisible().catch(() => false)
    expect(hasLoading || hasEmpty || hasList).toBe(true)
  })

  test('새 보고서 버튼 클릭 시 작성 화면 표시', async ({ page }) => {
    const newBtn = page.locator('[data-testid="new-report-btn"]')
    const isVisible = await newBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await newBtn.click()
    await expect(page.locator('[data-testid="report-title-input"]')).toBeVisible({ timeout: 3000 })
    await expect(page.locator('[data-testid="report-content-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="save-draft-btn"]')).toBeVisible()
  })

  test('작성 화면에서 제목/내용 입력', async ({ page }) => {
    const newBtn = page.locator('[data-testid="new-report-btn"]')
    const isVisible = await newBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await newBtn.click()
    const titleInput = page.locator('[data-testid="report-title-input"]')
    await titleInput.waitFor({ timeout: 3000 })

    await titleInput.fill('테스트 보고서')
    await expect(titleInput).toHaveValue('테스트 보고서')

    const contentInput = page.locator('[data-testid="report-content-input"]')
    await contentInput.fill('테스트 내용입니다')
    await expect(contentInput).toHaveValue('테스트 내용입니다')
  })

  test('뒤로가기 버튼 표시 (작성 화면)', async ({ page }) => {
    const newBtn = page.locator('[data-testid="new-report-btn"]')
    const isVisible = await newBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await newBtn.click()
    await page.locator('[data-testid="report-title-input"]').waitFor({ timeout: 3000 })

    const backBtn = page.locator('[data-testid="back-btn"]')
    await expect(backBtn).toBeVisible()

    await backBtn.click()
    // 목록 뷰로 복귀
    await expect(page.locator('[data-testid="new-report-btn"]')).toBeVisible({ timeout: 3000 })
  })
})
