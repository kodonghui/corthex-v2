import { test, expect } from '@playwright/test'

/**
 * Admin 스모크 테스트 — 모든 관리자 페이지에 접근 가능한지 확인
 * 관리자 로그인 상태에서 각 페이지가 에러 없이 로드되는지 체크
 */

const adminRoutes = [
  { name: 'admin-home', path: '/' },
  { name: 'users', path: '/users' },
  { name: 'employees', path: '/employees' },
  { name: 'departments', path: '/departments' },
  { name: 'agents', path: '/agents' },
  { name: 'credentials', path: '/credentials' },
  { name: 'companies', path: '/companies' },
  { name: 'tools', path: '/tools' },
  { name: 'costs', path: '/costs' },
  { name: 'report-lines', path: '/report-lines' },
  { name: 'soul-templates', path: '/soul-templates' },
  { name: 'monitoring', path: '/monitoring' },
  { name: 'org-chart', path: '/org-chart' },
  { name: 'org-templates', path: '/org-templates' },
  { name: 'workflows', path: '/workflows' },
  { name: 'template-market', path: '/template-market' },
  { name: 'agent-marketplace', path: '/agent-marketplace' },
  { name: 'api-keys', path: '/api-keys' },
  { name: 'settings', path: '/settings' },
]

for (const route of adminRoutes) {
  test(`admin/${route.name} — 페이지 로드`, async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 페이지 이동 (admin 프로젝트는 baseURL이 이미 /admin)
    const response = await page.goto(route.path)

    // 응답 확인
    expect(response?.status()).toBeLessThan(400)

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle')

    // 로그인 페이지로 리다이렉트되지 않았는지 확인
    expect(page.url()).not.toContain('/login')

    // 치명적 콘솔 에러 없는지 확인
    const criticalErrors = consoleErrors.filter(
      (e) => e.includes('Uncaught') || e.includes('ChunkLoadError') || e.includes('Failed to fetch')
    )
    expect(criticalErrors).toHaveLength(0)
  })
}
