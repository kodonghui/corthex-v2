import { test, expect } from '@playwright/test'

test.describe('Costs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/costs')
    await page.waitForSelector('[data-testid="costs-page"]')
  })

  test('renders page container and header', async ({ page }) => {
    await expect(page.getByTestId('costs-page')).toBeVisible()
    await expect(page.getByTestId('costs-header')).toBeVisible()
    await expect(page.getByTestId('costs-header')).toContainText('비용 분석')
  })

  test('renders back button', async ({ page }) => {
    await expect(page.getByTestId('back-button')).toBeVisible()
  })

  test('renders period selector with 3 options', async ({ page }) => {
    await expect(page.getByTestId('period-selector')).toBeVisible()
    await expect(page.getByTestId('period-day')).toBeVisible()
    await expect(page.getByTestId('period-week')).toBeVisible()
    await expect(page.getByTestId('period-month')).toBeVisible()
  })

  test('period selector changes active state', async ({ page }) => {
    await page.getByTestId('period-week').click()
    await expect(page.getByTestId('period-week')).toHaveClass(/bg-blue-600/)

    await page.getByTestId('period-month').click()
    await expect(page.getByTestId('period-month')).toHaveClass(/bg-blue-600/)
  })

  test('renders summary cards or loading state', async ({ page }) => {
    const summaryCards = page.getByTestId('summary-cards')
    const loadingState = page.getByTestId('loading-state')

    const hasCards = await summaryCards.isVisible().catch(() => false)
    const isLoading = await loadingState.isVisible().catch(() => false)

    expect(hasCards || isLoading).toBeTruthy()
  })

  test('uses dark slate theme', async ({ page }) => {
    const pageEl = page.getByTestId('costs-page')
    await expect(pageEl).toHaveClass(/bg-slate-900/)
  })
})
