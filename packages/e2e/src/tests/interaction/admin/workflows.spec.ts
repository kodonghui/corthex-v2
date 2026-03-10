import { test, expect } from '@playwright/test'

test.describe('Workflows Page (Admin)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows')
    await page.waitForSelector('[data-testid="workflows-page"], [data-testid="workflows-no-company"]')
  })

  test('renders page or no-company message', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    const noCompany = await page.getByTestId('workflows-no-company').isVisible().catch(() => false)

    expect(hasPage || noCompany).toBeTruthy()
  })

  test('renders header with title and action buttons', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    await expect(page.getByTestId('workflows-header')).toBeVisible()
    await expect(page.getByTestId('workflows-header')).toContainText('워크플로우 관리')
    await expect(page.getByTestId('analyze-button')).toBeVisible()
    await expect(page.getByTestId('create-workflow-button')).toBeVisible()
  })

  test('renders tabs for workflows and suggestions', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    await expect(page.getByTestId('workflows-tabs')).toBeVisible()
    await expect(page.getByTestId('tab-list')).toBeVisible()
    await expect(page.getByTestId('tab-suggestions')).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    await page.getByTestId('tab-suggestions').click()
    await expect(page.getByTestId('tab-suggestions')).toHaveClass(/border-blue-500/)
    await expect(page.getByTestId('suggestions-list')).toBeVisible()

    await page.getByTestId('tab-list').click()
    await expect(page.getByTestId('tab-list')).toHaveClass(/border-blue-500/)
    await expect(page.getByTestId('workflow-list')).toBeVisible()
  })

  test('shows workflow list or empty state', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    const hasList = await page.getByTestId('workflow-list').isVisible().catch(() => false)
    const isEmpty = await page.getByTestId('workflows-empty').isVisible().catch(() => false)
    const isLoading = await page.getByTestId('workflows-loading').isVisible().catch(() => false)

    expect(hasList || isEmpty || isLoading).toBeTruthy()
  })

  test('create workflow button navigates to editor', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    await page.getByTestId('create-workflow-button').click()
    await expect(page.getByTestId('workflow-editor')).toBeVisible()
    await expect(page.getByTestId('workflow-name-input')).toBeVisible()
    await expect(page.getByTestId('workflow-desc-input')).toBeVisible()
  })

  test('editor has mode toggle (canvas/form)', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    await page.getByTestId('create-workflow-button').click()
    await expect(page.getByTestId('editor-mode-toggle')).toBeVisible()
  })

  test('uses dark slate theme', async ({ page }) => {
    const hasPage = await page.getByTestId('workflows-page').isVisible().catch(() => false)
    if (!hasPage) return

    const pageEl = page.getByTestId('workflows-page')
    await expect(pageEl).toHaveClass(/bg-slate-900/)
  })
})
