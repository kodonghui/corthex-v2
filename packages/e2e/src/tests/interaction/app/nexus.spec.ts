import { test, expect } from '@playwright/test'

test.describe('Nexus / SketchVibe Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nexus')
    await page.waitForSelector('[data-testid="nexus-page"]')
  })

  test('renders page container and header elements', async ({ page }) => {
    await expect(page.getByTestId('nexus-page')).toBeVisible()
    await expect(page.getByTestId('nexus-save-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-sidebar-toggle')).toBeVisible()
    await expect(page.getByTestId('nexus-mermaid-import-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-mermaid-export-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-kb-save-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-undo-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-redo-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-agent-select')).toBeVisible()
  })

  test('renders canvas area and AI command bar', async ({ page }) => {
    await expect(page.getByTestId('nexus-canvas')).toBeVisible()
    await expect(page.getByTestId('nexus-ai-input')).toBeVisible()
    await expect(page.getByTestId('nexus-ai-send-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-status-bar')).toBeVisible()
  })

  test('renders node palette and toolbar buttons', async ({ page }) => {
    await expect(page.getByTestId('nexus-node-palette-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-auto-layout-btn')).toBeVisible()
    await expect(page.getByTestId('nexus-clear-btn')).toBeVisible()
  })

  test('chat toggle works on desktop', async ({ page }) => {
    await expect(page.getByTestId('nexus-chat-toggle')).toBeVisible()
    await expect(page.getByTestId('nexus-chat-panel')).toBeVisible()

    await page.getByTestId('nexus-chat-toggle').click()
    await expect(page.getByTestId('nexus-chat-panel')).not.toBeVisible()

    await page.getByTestId('nexus-chat-toggle').click()
    await expect(page.getByTestId('nexus-chat-panel')).toBeVisible()
  })

  test('sidebar toggle works', async ({ page }) => {
    await expect(page.getByTestId('nexus-sidebar')).not.toBeVisible()

    await page.getByTestId('nexus-sidebar-toggle').click()
    await expect(page.getByTestId('nexus-sidebar')).toBeVisible()

    await page.getByTestId('nexus-sidebar-toggle').click()
    await expect(page.getByTestId('nexus-sidebar')).not.toBeVisible()
  })

  test('save button is disabled when canvas is empty', async ({ page }) => {
    await expect(page.getByTestId('nexus-save-btn')).toBeDisabled()
    await expect(page.getByTestId('nexus-mermaid-export-btn')).toBeDisabled()
  })

  test('node palette opens on click', async ({ page }) => {
    await page.getByTestId('nexus-node-palette-btn').click()
    await expect(page.getByText('시작')).toBeVisible()
    await expect(page.getByText('에이전트')).toBeVisible()
  })

  test('mermaid import modal opens', async ({ page }) => {
    await page.getByTestId('nexus-mermaid-import-btn').click()
    await expect(page.getByTestId('nexus-mermaid-modal')).toBeVisible()
  })

  test('status bar shows node and edge count', async ({ page }) => {
    const statusBar = page.getByTestId('nexus-status-bar')
    await expect(statusBar).toContainText('노드 0개')
    await expect(statusBar).toContainText('연결 0개')
  })

  test('undo and redo buttons are disabled initially', async ({ page }) => {
    await expect(page.getByTestId('nexus-undo-btn')).toBeDisabled()
    await expect(page.getByTestId('nexus-redo-btn')).toBeDisabled()
  })
})
