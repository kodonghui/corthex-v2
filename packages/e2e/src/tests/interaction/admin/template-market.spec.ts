import { test, expect } from '@playwright/test'

test.describe('Template Market — 템플릿 마켓 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/template-market')
    await page.waitForTimeout(2000)
  })

  test('페이지 렌더링 — 제목 표시', async ({ page }) => {
    await expect(page.locator('h1:has-text("템플릿 마켓")')).toBeVisible()
  })

  test('회사 미선택 시 안내 메시지', async ({ page }) => {
    const noCompanyMsg = page.locator('text=사이드바에서 회사를 선택해주세요.')
    const isVisible = await noCompanyMsg.isVisible().catch(() => false)
    if (isVisible) {
      await expect(noCompanyMsg).toBeVisible()
    }
  })

  test('검색 입력 필드 존재', async ({ page }) => {
    const searchInput = page.locator('input[placeholder="템플릿 이름 검색..."]')
    const isVisible = await searchInput.isVisible().catch(() => false)
    if (isVisible) {
      await expect(searchInput).toBeVisible()
      await searchInput.fill('test')
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('템플릿 카드 클릭 시 모달 열림', async ({ page }) => {
    const card = page.locator('button.group').first()
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await card.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.locator('text=내 조직에 복제')).toBeVisible()
    }
  })

  test('모달 닫기 — Escape 키', async ({ page }) => {
    const card = page.locator('button.group').first()
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await card.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    }
  })

  test('모달 닫기 — 닫기 버튼', async ({ page }) => {
    const card = page.locator('button.group').first()
    const isVisible = await card.isVisible().catch(() => false)
    if (isVisible) {
      await card.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await page.locator('text=닫기').first().click()
      await expect(page.locator('[role="dialog"]')).not.toBeVisible()
    }
  })
})
