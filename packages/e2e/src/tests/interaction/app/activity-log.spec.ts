import { test, expect } from '@playwright/test'

test.describe('Activity Log Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/activity-log')
    await page.waitForSelector('[data-testid="activity-log-page"]')
  })

  test('renders page container and header', async ({ page }) => {
    await expect(page.getByTestId('activity-log-page')).toBeVisible()
    await expect(page.getByTestId('activity-header')).toBeVisible()
    await expect(page.getByTestId('activity-header')).toContainText('통신로그')
  })

  test('renders 4 tab buttons', async ({ page }) => {
    await expect(page.getByTestId('activity-tabs')).toBeVisible()
    await expect(page.getByTestId('tab-agents')).toBeVisible()
    await expect(page.getByTestId('tab-delegations')).toBeVisible()
    await expect(page.getByTestId('tab-quality')).toBeVisible()
    await expect(page.getByTestId('tab-tools')).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    // Click delegations tab
    await page.getByTestId('tab-delegations').click()
    await expect(page.getByTestId('tab-delegations')).toHaveClass(/border-blue-500/)

    // Click QA tab
    await page.getByTestId('tab-quality').click()
    await expect(page.getByTestId('tab-quality')).toHaveClass(/border-blue-500/)

    // Click tools tab
    await page.getByTestId('tab-tools').click()
    await expect(page.getByTestId('tab-tools')).toHaveClass(/border-blue-500/)
  })

  test('renders filter bar with search and date inputs', async ({ page }) => {
    await expect(page.getByTestId('activity-filters')).toBeVisible()
    await expect(page.getByTestId('search-input')).toBeVisible()
    await expect(page.getByTestId('date-start')).toBeVisible()
    await expect(page.getByTestId('date-end')).toBeVisible()
  })

  test('search input is functional', async ({ page }) => {
    await page.getByTestId('search-input').fill('테스트 검색')
    await expect(page.getByTestId('search-input')).toHaveValue('테스트 검색')
  })

  test('tools tab shows tool name filter', async ({ page }) => {
    await page.getByTestId('tab-tools').click()
    await expect(page.getByTestId('tool-name-filter')).toBeVisible()
  })

  test('QA tab shows conclusion filter', async ({ page }) => {
    await page.getByTestId('tab-quality').click()
    await expect(page.getByTestId('conclusion-filter')).toBeVisible()
  })

  test('renders content area with loading, empty, or table', async ({ page }) => {
    const content = page.getByTestId('activity-content')
    await expect(content).toBeVisible()

    const isLoading = await page.getByTestId('activity-loading').isVisible().catch(() => false)
    const isEmpty = await page.getByTestId('activity-empty').isVisible().catch(() => false)
    const hasTable = await page.getByTestId('agents-table').isVisible().catch(() => false)

    expect(isLoading || isEmpty || hasTable).toBeTruthy()
  })

  test('uses dark slate theme', async ({ page }) => {
    const pageEl = page.getByTestId('activity-log-page')
    await expect(pageEl).toHaveClass(/bg-slate-900/)
  })
})
