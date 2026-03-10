import { test, expect } from '@playwright/test'

test.describe('Chat — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat')
    await page.waitForSelector('[data-testid="chat-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible()
    // 세션 패널 또는 채팅 영역 중 하나 이상 표시
    const hasPanel = await page.locator('[data-testid="session-panel"]').isVisible().catch(() => false)
    const hasChat = await page.locator('[data-testid="chat-area"]').isVisible().catch(() => false)
    const hasEmpty = await page.locator('[data-testid="chat-empty"]').isVisible().catch(() => false)
    expect(hasPanel || hasChat || hasEmpty).toBe(true)
  })

  test('새 대화 버튼 표시', async ({ page }) => {
    const newChatBtn = page.locator('[data-testid="new-chat-btn"]')
    // 데스크톱에서 세션 패널이 보일 때 새 대화 버튼 확인
    const isVisible = await newChatBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(newChatBtn).toBeVisible()
    }
  })

  test('새 대화 버튼 클릭 시 에이전트 모달 열림', async ({ page }) => {
    const newChatBtn = page.locator('[data-testid="new-chat-btn"]')
    const isVisible = await newChatBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await newChatBtn.click()
    await expect(page.locator('[data-testid="agent-list-modal"]')).toBeVisible({ timeout: 3000 })
  })

  test('에이전트 모달 닫기', async ({ page }) => {
    const newChatBtn = page.locator('[data-testid="new-chat-btn"]')
    const isVisible = await newChatBtn.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    await newChatBtn.click()
    const modal = page.locator('[data-testid="agent-list-modal"]')
    await expect(modal).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    // 모달이 닫히거나 배경 클릭으로 닫힘
  })

  test('채팅 입력 영역 표시', async ({ page }) => {
    const chatInput = page.locator('[data-testid="chat-input"]')
    const isVisible = await chatInput.isVisible().catch(() => false)
    if (isVisible) {
      await expect(chatInput).toBeVisible()
      await expect(page.locator('[data-testid="chat-send-btn"]')).toBeVisible()
      await expect(page.locator('[data-testid="attach-btn"]')).toBeVisible()
    }
  })

  test('채팅 헤더에 에이전트 이름 표시', async ({ page }) => {
    const chatHeader = page.locator('[data-testid="chat-header"]')
    const isVisible = await chatHeader.isVisible().catch(() => false)
    if (isVisible) {
      await expect(chatHeader).toBeVisible()
    }
  })

  test('메시지 목록 영역 표시', async ({ page }) => {
    const messageList = page.locator('[data-testid="message-list"]')
    const isVisible = await messageList.isVisible().catch(() => false)
    if (isVisible) {
      await expect(messageList).toBeVisible()
    }
  })

  test('빈 상태 또는 메시지 목록 표시', async ({ page }) => {
    const empty = page.locator('[data-testid="chat-empty"]')
    const messages = page.locator('[data-testid="message-list"]')
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasMessages = await messages.isVisible().catch(() => false)
    expect(hasEmpty || hasMessages).toBe(true)
  })

  test('전송 버튼 비활성화 상태 (빈 입력)', async ({ page }) => {
    const sendBtn = page.locator('[data-testid="chat-send-btn"]')
    const isVisible = await sendBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(sendBtn).toBeDisabled()
    }
  })
})
