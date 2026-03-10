import { test, expect } from '@playwright/test'

test.describe('Jobs — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForSelector('[data-testid="jobs-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="jobs-page"]')).toBeVisible()
  })

  test('작업 등록 버튼 표시', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-job-btn"]')
    await expect(createBtn).toBeVisible()
  })

  test('탭 바 표시 및 탭 전환', async ({ page }) => {
    const tabs = page.locator('[data-testid="jobs-tabs"]')
    await expect(tabs).toBeVisible()

    // 일회성 탭
    const oneTimeTab = page.locator('[data-testid="jobs-tab-oneTime"]')
    await expect(oneTimeTab).toBeVisible()

    // 반복 스케줄 탭 클릭
    const scheduleTab = page.locator('[data-testid="jobs-tab-schedule"]')
    await scheduleTab.click()
    await expect(scheduleTab).toBeVisible()

    // 트리거 탭 클릭
    const triggerTab = page.locator('[data-testid="jobs-tab-trigger"]')
    await triggerTab.click()
    await expect(triggerTab).toBeVisible()
  })

  test('로딩 또는 빈 상태 또는 작업 목록 표시 (일회성)', async ({ page }) => {
    const loading = page.locator('[data-testid="jobs-loading"]')
    const empty = page.locator('[data-testid="jobs-empty"]')
    const card = page.locator('[data-testid^="job-card-"]').first()
    const chain = page.locator('[data-testid^="chain-group-"]').first()
    const hasLoading = await loading.isVisible().catch(() => false)
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasCard = await card.isVisible().catch(() => false)
    const hasChain = await chain.isVisible().catch(() => false)
    expect(hasLoading || hasEmpty || hasCard || hasChain).toBe(true)
  })

  test('스케줄 탭 — 빈 상태 또는 목록 표시', async ({ page }) => {
    const scheduleTab = page.locator('[data-testid="jobs-tab-schedule"]')
    await scheduleTab.click()

    // 잠시 대기 후 확인
    await page.waitForTimeout(1000)

    const empty = page.locator('[data-testid="schedules-empty"]')
    const item = page.locator('[data-testid^="schedule-item-"]').first()
    const loading = page.locator('[data-testid="jobs-loading"]')
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasItem = await item.isVisible().catch(() => false)
    const hasLoading = await loading.isVisible().catch(() => false)
    expect(hasEmpty || hasItem || hasLoading).toBe(true)
  })

  test('트리거 탭 — 빈 상태 또는 목록 표시', async ({ page }) => {
    const triggerTab = page.locator('[data-testid="jobs-tab-trigger"]')
    await triggerTab.click()

    await page.waitForTimeout(1000)

    const empty = page.locator('[data-testid="triggers-empty"]')
    const item = page.locator('[data-testid^="trigger-item-"]').first()
    const loading = page.locator('[data-testid="jobs-loading"]')
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasItem = await item.isVisible().catch(() => false)
    const hasLoading = await loading.isVisible().catch(() => false)
    expect(hasEmpty || hasItem || hasLoading).toBe(true)
  })

  test('작업 등록 버튼 클릭 시 모달 열림', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-job-btn"]')
    await createBtn.click()
    await expect(page.locator('[data-testid="job-modal"]')).toBeVisible({ timeout: 3000 })
  })

  test('모달 내 에이전트 선택 및 지시 입력 표시', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-job-btn"]')
    await createBtn.click()
    const modal = page.locator('[data-testid="job-modal"]')
    await modal.waitFor({ timeout: 3000 })

    await expect(page.locator('[data-testid="agent-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="instruction-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="submit-job-btn"]')).toBeVisible()
  })

  test('모달 닫기 (배경 클릭)', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-job-btn"]')
    await createBtn.click()
    const modal = page.locator('[data-testid="job-modal"]')
    await modal.waitFor({ timeout: 3000 })

    // 배경 클릭 (모달 외부)
    await page.mouse.click(10, 10)
    await expect(modal).not.toBeVisible({ timeout: 3000 })
  })
})
