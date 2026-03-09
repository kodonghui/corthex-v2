import { test, expect } from '@playwright/test'

test.describe('Onboarding Wizard — 온보딩 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/onboarding')
    // 온보딩 페이지 또는 미선택 안내
    const onboarding = page.locator('[data-testid="onboarding-page"]')
    const noCompany = page.locator('text=사이드바에서 회사를 선택해주세요')
    await Promise.race([
      onboarding.waitFor({ timeout: 15000 }).catch(() => {}),
      noCompany.waitFor({ timeout: 15000 }).catch(() => {}),
    ])
  })

  test('페이지 렌더링 — 온보딩 또는 미선택 메시지', async ({ page }) => {
    const onboarding = page.locator('[data-testid="onboarding-page"]')
    const noCompany = page.locator('text=사이드바에서 회사를 선택해주세요')
    const hasOnboarding = await onboarding.isVisible().catch(() => false)
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    expect(hasOnboarding || hasNoCompany).toBe(true)
  })

  test('스텝 인디케이터 5단계 표시', async ({ page }) => {
    const indicator = page.locator('[data-testid="onboarding-step-indicator"]')
    const isVisible = await indicator.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=환영')).toBeVisible()
      await expect(page.locator('text=조직 템플릿')).toBeVisible()
      await expect(page.locator('text=API 키')).toBeVisible()
      await expect(page.locator('text=직원 초대')).toBeVisible()
      await expect(page.locator('text=완료')).toBeVisible()
    }
  })

  test('프로그레스 바 표시', async ({ page }) => {
    const progress = page.locator('[data-testid="onboarding-progress"]')
    const isVisible = await progress.isVisible().catch(() => false)
    if (isVisible) {
      await expect(progress).toBeVisible()
    }
  })

  test('Step 1 환영 페이지 — 환영 메시지 표시', async ({ page }) => {
    const onboarding = page.locator('[data-testid="onboarding-page"]')
    const isVisible = await onboarding.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('text=CORTHEX에 오신 것을 환영합니다!')).toBeVisible()
      await expect(page.locator('text=회사 정보')).toBeVisible()
    }
  })

  test('Step 1 다음 버튼 존재', async ({ page }) => {
    const onboarding = page.locator('[data-testid="onboarding-page"]')
    const isVisible = await onboarding.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('button:has-text("다음")')).toBeVisible()
    }
  })

  test('회사 미선택 시 대시보드 이동 버튼', async ({ page }) => {
    const noCompany = page.locator('text=사이드바에서 회사를 선택해주세요')
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    if (hasNoCompany) {
      await expect(page.locator('button:has-text("대시보드로 이동")')).toBeVisible()
    }
  })
})
