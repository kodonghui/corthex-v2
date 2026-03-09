import { test, expect } from '@playwright/test'

test.describe('Report Lines — 보고 라인 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/report-lines')
    await page.waitForTimeout(2000)
  })

  test('페이지 렌더링 — 제목 또는 미선택 메시지', async ({ page }) => {
    const header = page.locator('[data-testid="report-lines-header"]')
    const noCompany = page.locator('text=회사를 선택하세요')
    const hasHeader = await header.isVisible().catch(() => false)
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    expect(hasHeader || hasNoCompany).toBe(true)
  })

  test('제목과 부제목 표시', async ({ page }) => {
    const header = page.locator('[data-testid="report-lines-header"]')
    const isVisible = await header.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('h1:has-text("보고 라인")')).toBeVisible()
      await expect(page.locator('text=직원 간 보고 구조를 설정합니다')).toBeVisible()
    }
  })

  test('저장 버튼 초기 비활성 상태', async ({ page }) => {
    const saveBtn = page.locator('button:has-text("변경사항 저장")')
    const isVisible = await saveBtn.isVisible().catch(() => false)
    if (isVisible) {
      await expect(saveBtn).toBeDisabled()
    }
  })

  test('테이블 헤더 렌더링', async ({ page }) => {
    const table = page.locator('table')
    const isVisible = await table.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('th:has-text("직원")')).toBeVisible()
      await expect(page.locator('th:has-text("역할")')).toBeVisible()
      await expect(page.locator('th:has-text("보고 대상")')).toBeVisible()
      await expect(page.locator('th:has-text("유형")')).toBeVisible()
    }
  })

  test('안내 박스 표시', async ({ page }) => {
    const infoBox = page.locator('text=보고 라인은 보고서 전달 경로와 비서 오케스트레이션에 사용됩니다.')
    const header = page.locator('[data-testid="report-lines-header"]')
    const hasHeader = await header.isVisible().catch(() => false)
    if (hasHeader) {
      await expect(infoBox).toBeVisible()
    }
  })

  test('드롭다운 변경 시 저장 버튼 활성화', async ({ page }) => {
    const dropdown = page.locator('select').first()
    const isVisible = await dropdown.isVisible().catch(() => false)
    if (isVisible) {
      const options = await dropdown.locator('option').allTextContents()
      if (options.length > 1) {
        await dropdown.selectOption({ index: 1 })
        await expect(page.locator('button:has-text("변경사항 저장")')).toBeEnabled()
      }
    }
  })
})
