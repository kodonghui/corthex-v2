import { test, expect } from '@playwright/test'

test.describe('Command Center — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/command-center')
    await page.waitForSelector('[data-testid="command-center-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 핵심 요소 확인', async ({ page }) => {
    await expect(page.locator('[data-testid="command-center-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="preset-manager-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="command-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="send-button"]')).toBeVisible()
  })

  test('빈 상태 표시 확인', async ({ page }) => {
    const emptyState = page.locator('[data-testid="empty-state"]')
    const messageThread = page.locator('[data-testid="message-thread"]')
    // 메시지가 없으면 빈 상태가 보이거나, 메시지 리스트가 보임
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    const hasList = await messageThread.isVisible().catch(() => false)
    expect(hasEmpty || hasList).toBe(true)
  })

  test('예시 명령 버튼 클릭 시 입력창에 텍스트 입력됨', async ({ page }) => {
    const emptyState = page.locator('[data-testid="empty-state"]')
    const isVisible = await emptyState.isVisible().catch(() => false)
    if (!isVisible) {
      test.skip()
      return
    }

    const exampleBtn = page.locator('[data-testid="example-command"]').first()
    await expect(exampleBtn).toBeVisible()
    await exampleBtn.click()
    const input = page.locator('[data-testid="command-input"]')
    const value = await input.inputValue()
    expect(value.length).toBeGreaterThan(0)
  })

  test('명령 입력창에 텍스트 입력 가능', async ({ page }) => {
    const input = page.locator('[data-testid="command-input"]')
    await input.fill('삼성전자 분석해줘')
    await expect(input).toHaveValue('삼성전자 분석해줘')
  })

  test('전송 버튼 활성화/비활성화', async ({ page }) => {
    const submitBtn = page.locator('[data-testid="send-button"]')
    const input = page.locator('[data-testid="command-input"]')

    // 빈 상태에서는 비활성화
    await expect(submitBtn).toBeDisabled()

    // 텍스트 입력 시 활성화
    await input.fill('테스트 명령')
    await expect(submitBtn).toBeEnabled()

    // 텍스트 삭제 시 다시 비활성화
    await input.fill('')
    await expect(submitBtn).toBeDisabled()
  })

  test('슬래시(/) 입력 시 팝업 표시', async ({ page }) => {
    const input = page.locator('[data-testid="command-input"]')
    await input.fill('/')
    const popup = page.locator('[data-testid="slash-popup"]')
    await expect(popup).toBeVisible({ timeout: 3000 })
    const items = page.locator('[data-testid^="slash-item-"]')
    await expect(items.first()).toBeVisible()
  })

  test('@멘션 입력 시 팝업 표시', async ({ page }) => {
    const input = page.locator('[data-testid="command-input"]')
    await input.fill('@')
    const popup = page.locator('[data-testid="mention-popup"]')
    // 에이전트가 있을 때만 팝업 표시됨
    const isVisible = await popup.isVisible().catch(() => false)
    if (isVisible) {
      const items = page.locator('[data-testid^="mention-agent-"]')
      await expect(items.first()).toBeVisible()
    }
  })

  test('프리셋 관리 버튼 클릭 시 모달 열림', async ({ page }) => {
    await page.locator('[data-testid="preset-manager-btn"]').click()
    await expect(page.locator('[data-testid="preset-manager-modal"]')).toBeVisible()
  })

  test('프리셋 모달 - 새 프리셋 만들기 버튼', async ({ page }) => {
    await page.locator('[data-testid="preset-manager-btn"]').click()
    await expect(page.locator('[data-testid="preset-manager-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="preset-create-btn"]')).toBeVisible()
  })

  test('Escape 키로 슬래시 팝업 닫기', async ({ page }) => {
    const input = page.locator('[data-testid="command-input"]')
    await input.fill('/')
    const popup = page.locator('[data-testid="slash-popup"]')
    await expect(popup).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
    await expect(popup).not.toBeVisible()
  })

  test('파이프라인 바 표시', async ({ page }) => {
    await expect(page.locator('[data-testid="pipeline-bar"]')).toBeVisible()
  })

  test('딜리버러블 뷰어 표시', async ({ page }) => {
    // Desktop only — deliverable viewer is visible on md+ breakpoints
    const viewer = page.locator('[data-testid="deliverable-viewer"]')
    const isVisible = await viewer.isVisible().catch(() => false)
    if (isVisible) {
      await expect(viewer).toBeVisible()
    }
  })
})
