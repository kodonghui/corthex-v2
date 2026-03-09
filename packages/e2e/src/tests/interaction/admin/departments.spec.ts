import { test, expect } from '@playwright/test'

test.describe('Departments Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/departments')
    await page.waitForSelector('[data-testid="departments-page"]')
  })

  test('renders page with title and create button', async ({ page }) => {
    await expect(page.getByTestId('departments-page')).toBeVisible()
    await expect(page.getByTestId('departments-title')).toContainText('부서 관리')
    await expect(page.getByTestId('departments-create-btn')).toBeVisible()
  })

  test('create form opens and closes', async ({ page }) => {
    await page.getByTestId('departments-create-btn').click()
    await expect(page.getByTestId('departments-create-form')).toBeVisible()
    await expect(page.getByTestId('departments-create-name')).toBeVisible()
    await expect(page.getByTestId('departments-create-desc')).toBeVisible()
    await expect(page.getByTestId('departments-create-submit')).toBeVisible()

    await page.getByTestId('departments-create-cancel').click()
    await expect(page.getByTestId('departments-create-form')).not.toBeVisible()
  })

  test('department table or empty state renders', async ({ page }) => {
    const table = page.getByTestId('departments-table')
    const empty = page.getByTestId('departments-empty-state')
    const loading = page.getByTestId('departments-loading')

    // One of these three states should be visible
    const isTable = await table.isVisible().catch(() => false)
    const isEmpty = await empty.isVisible().catch(() => false)
    const isLoading = await loading.isVisible().catch(() => false)
    expect(isTable || isEmpty || isLoading).toBeTruthy()
  })

  test('empty state has create button', async ({ page }) => {
    const empty = page.getByTestId('departments-empty-state')
    const isVisible = await empty.isVisible().catch(() => false)
    if (isVisible) {
      await expect(empty.locator('button')).toContainText('새 부서 만들기')
    }
  })
})
