import { test, expect } from '@playwright/test'

/**
 * App 스모크 테스트 — 모든 페이지에 접근 가능한지 확인
 * 로그인 상태에서 각 페이지가 200 응답 + 에러 없이 로드되는지 체크
 */

const appRoutes = [
  { name: 'home', path: '/' },
  { name: 'command-center', path: '/command-center' },
  { name: 'chat', path: '/chat' },
  { name: 'jobs', path: '/jobs' },
  { name: 'reports', path: '/reports' },
  { name: 'sns', path: '/sns' },
  { name: 'messenger', path: '/messenger' },
  { name: 'dashboard', path: '/dashboard' },
  { name: 'ops-log', path: '/ops-log' },
  { name: 'nexus', path: '/nexus' },
  { name: 'trading', path: '/trading' },
  { name: 'files', path: '/files' },
  { name: 'org', path: '/org' },
  { name: 'notifications', path: '/notifications' },
  { name: 'activity-log', path: '/activity-log' },
  { name: 'costs', path: '/costs' },
  { name: 'cron', path: '/cron' },
  { name: 'argos', path: '/argos' },
  { name: 'agora', path: '/agora' },
  { name: 'classified', path: '/classified' },
  { name: 'knowledge', path: '/knowledge' },
  { name: 'performance', path: '/performance' },
  { name: 'settings', path: '/settings' },
]

for (const route of appRoutes) {
  test(`app/${route.name} — 페이지 로드`, async ({ page }) => {
    // 콘솔 에러 수집
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // 페이지 이동
    const response = await page.goto(route.path)

    // 응답 확인
    expect(response?.status()).toBeLessThan(400)

    // 페이지 로드 대기
    await page.waitForLoadState('networkidle')

    // 로그인 페이지로 리다이렉트되지 않았는지 확인
    expect(page.url()).not.toContain('/login')

    // 치명적 콘솔 에러 없는지 확인 (React 에러 등)
    const criticalErrors = consoleErrors.filter(
      (e) => e.includes('Uncaught') || e.includes('ChunkLoadError') || e.includes('Failed to fetch')
    )
    expect(criticalErrors).toHaveLength(0)
  })
}
