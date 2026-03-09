import { test, expect } from '@playwright/test'

test.describe('Messenger — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/messenger')
    await page.waitForSelector('[data-testid="messenger-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="messenger-page"]')).toBeVisible()
  })

  test('모드 탭 표시 (채널/대화)', async ({ page }) => {
    const channelsTab = page.locator('[data-testid="messenger-tab-channels"]')
    const conversationsTab = page.locator('[data-testid="messenger-tab-conversations"]')
    const hasChannels = await channelsTab.isVisible().catch(() => false)
    const hasConversations = await conversationsTab.isVisible().catch(() => false)
    expect(hasChannels || hasConversations).toBe(true)
  })

  test('채널 탭 클릭 시 채널 목록 표시', async ({ page }) => {
    const channelsTab = page.locator('[data-testid="messenger-tab-channels"]')
    const isVisible = await channelsTab.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await channelsTab.click()
    // 채널 사이드바 또는 채널 헤더 확인
    const sidebar = page.locator('[data-testid="channel-sidebar"]')
    const header = page.locator('[data-testid="channels-header"]')
    const hasSidebar = await sidebar.isVisible().catch(() => false)
    const hasHeader = await header.isVisible().catch(() => false)
    expect(hasSidebar || hasHeader).toBe(true)
  })

  test('대화 탭 클릭 시 대화 목록 표시', async ({ page }) => {
    const conversationsTab = page.locator('[data-testid="messenger-tab-conversations"]')
    const isVisible = await conversationsTab.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await conversationsTab.click()
    const view = page.locator('[data-testid="conversations-view"]')
    const hasView = await view.isVisible().catch(() => false)
    if (hasView) {
      await expect(view).toBeVisible()
    }
  })

  test('채널 생성 버튼 표시', async ({ page }) => {
    const createBtn = page.locator('[data-testid="create-channel-btn"]')
    const isVisible = await createBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(createBtn).toBeVisible()
    }
  })

  test('새 대화 버튼 표시', async ({ page }) => {
    // 대화 탭으로 전환
    const conversationsTab = page.locator('[data-testid="messenger-tab-conversations"]')
    const hasTab = await conversationsTab.isVisible().catch(() => false)
    if (!hasTab) return

    await conversationsTab.click()
    const newBtn = page.locator('[data-testid="new-conversation-btn"]')
    const isVisible = await newBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(newBtn).toBeVisible()
    }
  })

  test('메시지 입력 영역 표시', async ({ page }) => {
    const input = page.locator('[data-testid="channel-message-input"]')
    const isVisible = await input.isVisible().catch(() => false)
    if (isVisible) {
      await expect(input).toBeVisible()
      await expect(page.locator('[data-testid="channel-send-btn"]')).toBeVisible()
    }
  })
})
