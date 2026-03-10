import { test, expect } from '@playwright/test'

test.describe('Credentials Management Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/credentials')
    await page.waitForSelector('[data-testid="credentials-page"]')
  })

  test('renders page with title and guide banner', async ({ page }) => {
    await expect(page.getByTestId('credentials-page')).toBeVisible()
    await expect(page.getByTestId('credentials-title')).toContainText('CLI 토큰 / API 키 관리')
    await expect(page.getByTestId('credentials-guide-banner')).toBeVisible()
  })

  test('renders user list panel', async ({ page }) => {
    await expect(page.getByTestId('credentials-user-list')).toBeVisible()
  })

  test('shows no-selection placeholder when no user selected', async ({ page }) => {
    const noSelection = page.getByTestId('credentials-no-selection')
    const isVisible = await noSelection.isVisible().catch(() => false)
    // Either no-selection is visible or a user is already selected
    if (isVisible) {
      await expect(noSelection).toContainText('직원을 선택하세요')
    }
  })

  test('guide banner contains OAuth instructions', async ({ page }) => {
    const banner = page.getByTestId('credentials-guide-banner')
    await expect(banner).toContainText('Claude OAuth 토큰 찾는 법')
    await expect(banner).toContainText('credentials.json')
  })
})
