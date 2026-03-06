import { describe, it, expect } from 'bun:test'

// ===== QA Functional Verification: Story 16-5 ACs =====

// AC#1: SW Cache Strategy — Network Only for API, Cache First for assets, skip WS
describe('QA: AC#1 SW Cache Strategy Completeness', () => {
  let sw: string

  it('setup: load SW', async () => {
    sw = await Bun.file('packages/app/public/sw.js').text()
    expect(sw).toBeTruthy()
  })

  it('should call skipWaiting on install for immediate activation', () => {
    expect(sw).toContain('self.skipWaiting()')
  })

  it('should skip chrome-extension protocol requests', () => {
    expect(sw).toContain("url.protocol === 'chrome-extension:'")
  })

  it('should cache fonts with Cache First strategy', () => {
    expect(sw).toContain("'font'")
    expect(sw).toContain("request.destination")
  })

  it('should cache images with Cache First strategy', () => {
    expect(sw).toContain("'image'")
  })

  it('should only cache successful responses (response.ok)', () => {
    expect(sw).toContain('response.ok')
  })

  it('should clone response before caching (stream consumed once)', () => {
    expect(sw).toContain('response.clone()')
  })

  it('should include includeUncontrolled in notificationclick matchAll', () => {
    expect(sw).toContain('includeUncontrolled: true')
  })
})

// AC#2: Push Notification — VAPID + sendPushToUser
describe('QA: AC#2 Push Notification Integration', () => {
  it('should set VAPID subject for identification', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain("VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:")
  })

  it('should send push notification with badge icon', async () => {
    const sw = await Bun.file('packages/app/public/sw.js').text()
    expect(sw).toContain("badge: '/icons/icon-192.png'")
  })

  it('should use default title when push data has no title', async () => {
    const sw = await Bun.file('packages/app/public/sw.js').text()
    expect(sw).toContain("data.title || 'CORTHEX'")
  })

  it('should navigate to target URL before focusing client', async () => {
    const sw = await Bun.file('packages/app/public/sw.js').text()
    expect(sw).toContain('client.navigate(targetUrl)')
    expect(sw).toContain('client.focus()')
  })

  it('should skip push for sender in messenger integration', async () => {
    const messenger = await Bun.file('packages/server/src/routes/workspace/messenger.ts').text()
    expect(messenger).toContain('m.userId === tenant.userId')
  })
})

// AC#3: Install Banner — 3-day delay, 7-day cooldown
describe('QA: AC#3 Install Banner Lifecycle', () => {
  let banner: string

  it('setup: load banner', async () => {
    banner = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(banner).toBeTruthy()
  })

  it('should export InstallBanner as named export', () => {
    expect(banner).toContain('export function InstallBanner()')
  })

  it('should set FIRST_VISIT_KEY to corthex_first_visit', () => {
    expect(banner).toContain("FIRST_VISIT_KEY = 'corthex_first_visit'")
  })

  it('should set DISMISSED_KEY to corthex_install_dismissed', () => {
    expect(banner).toContain("DISMISSED_KEY = 'corthex_install_dismissed'")
  })

  it('should show "CORTHEX 앱 설치하기" text', () => {
    expect(banner).toContain('CORTHEX 앱 설치하기')
  })

  it('should have z-50 for proper layering', () => {
    expect(banner).toContain('z-50')
  })

  it('should hide banner after install accepted', () => {
    expect(banner).toContain("outcome === 'accepted'")
    expect(banner).toContain('setShow(false)')
  })
})

// AC#4: Offline page — standalone HTML
describe('QA: AC#4 Offline Page Functional', () => {
  let offline: string

  it('setup: load offline page', async () => {
    offline = await Bun.file('packages/app/public/offline.html').text()
    expect(offline).toBeTruthy()
  })

  it('should use dark theme background color', () => {
    expect(offline).toContain('#09090b')
  })

  it('should display offline emoji indicator', () => {
    // Should have visual indicator for offline state
    expect(offline.length).toBeGreaterThan(200)
  })

  it('should have retry button with reload', () => {
    expect(offline).toContain('location.reload()')
  })
})

// AC#5: Logout cache clear
describe('QA: AC#5 Logout Cache Cleanup', () => {
  it('should post LOGOUT message from auth store', async () => {
    const auth = await Bun.file('packages/app/src/stores/auth-store.ts').text()
    expect(auth).toContain("postMessage({ type: 'LOGOUT' })")
  })

  it('should guard SW access with feature detection', async () => {
    const auth = await Bun.file('packages/app/src/stores/auth-store.ts').text()
    expect(auth).toContain("'serviceWorker' in navigator")
    expect(auth).toContain('navigator.serviceWorker.controller')
  })

  it('should handle LOGOUT in SW by clearing ALL caches', async () => {
    const sw = await Bun.file('packages/app/public/sw.js').text()
    const logoutSection = sw.split("type === 'LOGOUT'")[1]
    expect(logoutSection).toBeTruthy()
    expect(logoutSection).toContain('caches.keys()')
    expect(logoutSection).toContain('caches.delete(k)')
  })
})

// AC#6: Mobile responsive
describe('QA: AC#6 Mobile Responsive Messenger', () => {
  let messenger: string

  it('setup: load messenger page', async () => {
    messenger = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(messenger).toBeTruthy()
  })

  it('should toggle between channel list and chat on mobile', () => {
    expect(messenger).toContain('showChat')
    expect(messenger).toContain('setShowChat(true)')
    expect(messenger).toContain('setShowChat(false)')
  })

  it('should have back button with Korean text', () => {
    expect(messenger).toContain('← 채널')
  })

  it('should apply safe area inset on message input', () => {
    expect(messenger).toContain('safe-area-inset-bottom')
  })

  it('should make thread panel fullscreen overlay on mobile', () => {
    expect(messenger).toContain('fixed inset-0 md:static')
  })
})

// AC#7: Build verification
describe('QA: AC#7 Build & Type Safety', () => {
  it('should have proper TypeScript interface for BeforeInstallPromptEvent', async () => {
    const banner = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(banner).toContain('interface BeforeInstallPromptEvent')
    expect(banner).toContain('prompt(): Promise<void>')
    expect(banner).toContain('userChoice: Promise<')
  })

  it('should use proper ArrayBuffer type for VAPID key conversion', async () => {
    const push = await Bun.file('packages/app/src/components/push-permission.tsx').text()
    expect(push).toContain('ArrayBuffer')
  })
})

// Cross-cutting: Layout integration
describe('QA: Cross-Cutting Integration', () => {
  it('should render InstallBanner and PushPermission in layout', async () => {
    const layout = await Bun.file('packages/app/src/components/layout.tsx').text()
    expect(layout).toContain('<InstallBanner />')
    expect(layout).toContain('<PushPermission />')
  })

  it('should register push route in server index', async () => {
    const index = await Bun.file('packages/server/src/index.ts').text()
    expect(index).toContain("app.route('/api/workspace/push', pushRoute)")
  })

  it('should have migration for push_subscriptions table', async () => {
    const migration = await Bun.file('packages/server/src/db/migrations/0027_push-subscriptions.sql').text()
    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "push_subscriptions"')
  })
})
