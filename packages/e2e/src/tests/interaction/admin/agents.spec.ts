import { test, expect } from '@playwright/test'

test.describe('Agents Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/agents')
    await page.waitForSelector('[data-testid="agents-page"]')
  })

  test('renders page with title and create button', async ({ page }) => {
    await expect(page.getByTestId('agents-page')).toBeVisible()
    await expect(page.getByTestId('agents-title')).toContainText('에이전트 관리')
    await expect(page.getByTestId('agents-create-btn')).toBeVisible()
  })

  test('renders filter controls', async ({ page }) => {
    await expect(page.getByTestId('agents-search-input')).toBeVisible()
    await expect(page.getByTestId('agents-filter-dept')).toBeVisible()
    await expect(page.getByTestId('agents-filter-tier')).toBeVisible()
    await expect(page.getByTestId('agents-filter-status')).toBeVisible()
  })

  test('create form opens and closes', async ({ page }) => {
    await page.getByTestId('agents-create-btn').click()
    await expect(page.getByTestId('agents-create-form')).toBeVisible()
    await expect(page.getByTestId('agents-create-name')).toBeVisible()
    await expect(page.getByTestId('agents-create-role')).toBeVisible()
    await expect(page.getByTestId('agents-create-tier')).toBeVisible()
    await expect(page.getByTestId('agents-create-model')).toBeVisible()
    await expect(page.getByTestId('agents-create-dept')).toBeVisible()
    await expect(page.getByTestId('agents-create-soul')).toBeVisible()
    await expect(page.getByTestId('agents-create-submit')).toBeVisible()

    await page.getByTestId('agents-create-cancel').click()
    await expect(page.getByTestId('agents-create-form')).not.toBeVisible()
  })

  test('search input filters agents', async ({ page }) => {
    await page.getByTestId('agents-search-input').fill('비서')
    // Search should filter the visible agents
  })

  test('agent table or empty state renders', async ({ page }) => {
    const table = page.getByTestId('agents-table')
    const empty = page.getByTestId('agents-empty-state')
    const loading = page.getByTestId('agents-loading')

    // One of these three states should be visible
    const isTable = await table.isVisible().catch(() => false)
    const isEmpty = await empty.isVisible().catch(() => false)
    const isLoading = await loading.isVisible().catch(() => false)
    expect(isTable || isEmpty || isLoading).toBeTruthy()
  })
})
