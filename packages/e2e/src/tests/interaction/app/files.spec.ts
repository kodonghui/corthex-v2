import { test, expect } from '@playwright/test'

test.describe('Files Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/files')
    await page.waitForSelector('[data-testid="files-page"]')
  })

  test('renders page container and header', async ({ page }) => {
    await expect(page.getByTestId('files-page')).toBeVisible()
    await expect(page.getByTestId('files-header')).toBeVisible()
    await expect(page.getByTestId('files-header')).toContainText('파일 관리')
  })

  test('renders upload button', async ({ page }) => {
    await expect(page.getByTestId('upload-button')).toBeVisible()
    await expect(page.getByTestId('upload-button')).toContainText('파일 업로드')
  })

  test('renders search input', async ({ page }) => {
    await expect(page.getByTestId('file-search')).toBeVisible()
    await page.getByTestId('file-search').fill('테스트')
    await expect(page.getByTestId('file-search')).toHaveValue('테스트')
  })

  test('renders filter chips', async ({ page }) => {
    await expect(page.getByTestId('filter-all')).toBeVisible()
    await expect(page.getByTestId('filter-images')).toBeVisible()
    await expect(page.getByTestId('filter-documents')).toBeVisible()
    await expect(page.getByTestId('filter-others')).toBeVisible()
  })

  test('filter chip selection works', async ({ page }) => {
    // Click images filter
    await page.getByTestId('filter-images').click()
    await expect(page.getByTestId('filter-images')).toHaveClass(/bg-blue-600/)

    // Click back to all
    await page.getByTestId('filter-all').click()
    await expect(page.getByTestId('filter-all')).toHaveClass(/bg-blue-600/)
  })

  test('shows empty state or file list', async ({ page }) => {
    const filesList = page.getByTestId('files-list')
    const emptyState = page.getByTestId('files-empty')
    const loading = page.getByTestId('files-loading')

    // Should show one of: loading, empty, or list
    const isLoading = await loading.isVisible().catch(() => false)
    const isEmpty = await emptyState.isVisible().catch(() => false)
    const hasList = await filesList.isVisible().catch(() => false)

    expect(isLoading || isEmpty || hasList).toBeTruthy()
  })

  test('uses dark slate theme', async ({ page }) => {
    const pageEl = page.getByTestId('files-page')
    await expect(pageEl).toHaveClass(/bg-slate-900/)
  })
})
