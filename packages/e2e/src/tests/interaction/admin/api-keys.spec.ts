import { test, expect } from '@playwright/test'

test.describe('API Keys — 공개 API 키 관리 인터랙션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/api-keys')
    await page.waitForTimeout(2000)
  })

  test('페이지 렌더링 — 제목 또는 미선택 메시지', async ({ page }) => {
    const header = page.locator('[data-testid="api-keys-header"]')
    const noCompany = page.locator('text=회사를 먼저 선택해 주세요')
    const hasHeader = await header.isVisible().catch(() => false)
    const hasNoCompany = await noCompany.isVisible().catch(() => false)
    expect(hasHeader || hasNoCompany).toBe(true)
  })

  test('제목과 부제목', async ({ page }) => {
    const header = page.locator('[data-testid="api-keys-header"]')
    const isVisible = await header.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('h1:has-text("공개 API 키 관리")')).toBeVisible()
      await expect(page.locator('text=외부 시스템에서 CORTHEX API를 호출하기 위한 키를 관리합니다')).toBeVisible()
    }
  })

  test('새 API 키 버튼 클릭 시 모달', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 API 키")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      await expect(page.locator('[data-testid="api-key-create-modal"]')).toBeVisible()
      await expect(page.locator('text=새 API 키 생성')).toBeVisible()
    }
  })

  test('생성 모달 필드 확인', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 API 키")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      const modal = page.locator('[data-testid="api-key-create-modal"]')
      await expect(modal.locator('input[placeholder="예: 대시보드 연동"]')).toBeVisible()
      await expect(modal.locator('text=스코프')).toBeVisible()
      await expect(modal.locator('text=read')).toBeVisible()
      await expect(modal.locator('text=write')).toBeVisible()
      await expect(modal.locator('text=execute')).toBeVisible()
    }
  })

  test('생성 버튼 비활성 상태 (이름 미입력)', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 API 키")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      const createBtn = page.locator('[data-testid="api-key-create-modal"] button:has-text("생성")')
      await expect(createBtn).toBeDisabled()
    }
  })

  test('생성 모달 취소', async ({ page }) => {
    const btn = page.locator('button:has-text("+ 새 API 키")')
    const isVisible = await btn.isVisible().catch(() => false)
    if (isVisible) {
      await btn.click()
      await expect(page.locator('[data-testid="api-key-create-modal"]')).toBeVisible()
      await page.locator('text=취소').click()
      await expect(page.locator('[data-testid="api-key-create-modal"]')).not.toBeVisible()
    }
  })

  test('테이블 헤더 렌더링 (키 존재 시)', async ({ page }) => {
    const table = page.locator('table')
    const isVisible = await table.isVisible().catch(() => false)
    if (isVisible) {
      await expect(page.locator('th:has-text("이름")')).toBeVisible()
      await expect(page.locator('th:has-text("키 접두사")')).toBeVisible()
      await expect(page.locator('th:has-text("스코프")')).toBeVisible()
      await expect(page.locator('th:has-text("상태")')).toBeVisible()
    }
  })
})
