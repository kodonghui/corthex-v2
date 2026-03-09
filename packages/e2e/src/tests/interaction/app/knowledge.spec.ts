import { test, expect } from '@playwright/test'

test.describe('Knowledge Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/knowledge')
    await page.waitForSelector('[data-testid="knowledge-page"]')
  })

  test('renders page container and header', async ({ page }) => {
    await expect(page.getByTestId('knowledge-page')).toBeVisible()
    await expect(page.getByTestId('knowledge-header')).toBeVisible()
    await expect(page.getByTestId('knowledge-header')).toContainText('지식 베이스')
  })

  test('renders sidebar with folder tree', async ({ page }) => {
    await expect(page.getByTestId('folder-tree')).toBeVisible()
    await expect(page.getByTestId('create-folder-btn')).toBeVisible()
  })

  test('renders tab buttons for documents and memories', async ({ page }) => {
    await expect(page.getByTestId('tab-documents')).toBeVisible()
    await expect(page.getByTestId('tab-memories')).toBeVisible()
  })

  test('tab switching works', async ({ page }) => {
    // Default should be documents tab
    await expect(page.getByTestId('tab-documents')).toBeVisible()

    // Click memories tab
    await page.getByTestId('tab-memories').click()
    // Memories content should be visible
    await expect(page.getByTestId('memories-list')).toBeVisible()
  })

  test('search input is functional', async ({ page }) => {
    await expect(page.getByTestId('search-input')).toBeVisible()
    await page.getByTestId('search-input').fill('테스트 검색')
    await expect(page.getByTestId('search-input')).toHaveValue('테스트 검색')
  })

  test('upload document button is visible', async ({ page }) => {
    await expect(page.getByTestId('upload-doc-btn')).toBeVisible()
  })

  test('uses dark slate theme classes', async ({ page }) => {
    const pageEl = page.getByTestId('knowledge-page')
    await expect(pageEl).toHaveClass(/bg-slate-900/)
  })
})
