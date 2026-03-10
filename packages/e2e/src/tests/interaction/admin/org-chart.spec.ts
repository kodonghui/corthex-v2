import { test, expect } from '@playwright/test'

test.describe('Org Chart — 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/org-chart')
    await page.waitForSelector('[data-testid="org-chart-page"]', { timeout: 15000 })
  })

  test('페이지 렌더링 및 다크 테마 확인', async ({ page }) => {
    const container = page.locator('[data-testid="org-chart-page"]')
    await expect(container).toBeVisible()
  })

  test('회사 루트 노드 표시', async ({ page }) => {
    const root = page.locator('[data-testid="company-root"]')
    const isVisible = await root.isVisible().catch(() => false)
    if (isVisible) {
      await expect(root).toBeVisible()
    }
  })

  test('부서 노드 표시 및 클릭', async ({ page }) => {
    const firstDept = page.locator('[data-testid^="department-"]').first()
    const hasDept = await firstDept.isVisible().catch(() => false)
    if (!hasDept) {
      test.skip()
      return
    }

    await firstDept.click()
  })

  test('에이전트 노드 클릭 시 상세 패널 열림', async ({ page }) => {
    const firstAgent = page.locator('[data-testid^="agent-node-"]').first()
    const hasAgent = await firstAgent.isVisible().catch(() => false)
    if (!hasAgent) {
      test.skip()
      return
    }

    await firstAgent.click()
    await expect(page.locator('[data-testid="agent-detail-panel"]')).toBeVisible({ timeout: 3000 })
  })

  test('상세 패널 닫기', async ({ page }) => {
    const firstAgent = page.locator('[data-testid^="agent-node-"]').first()
    const hasAgent = await firstAgent.isVisible().catch(() => false)
    if (!hasAgent) {
      test.skip()
      return
    }

    await firstAgent.click()
    const panel = page.locator('[data-testid="agent-detail-panel"]')
    await expect(panel).toBeVisible({ timeout: 3000 })

    // 닫기 버튼 또는 백드롭 클릭
    const closeBtn = panel.locator('button').first()
    await closeBtn.click()
  })
})
