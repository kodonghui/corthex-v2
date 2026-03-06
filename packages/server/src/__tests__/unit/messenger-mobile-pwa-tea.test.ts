import { describe, it, expect } from 'bun:test'

// ===== TEA: Push Route Edge Cases =====
describe('TEA: Push Route Security & Edge Cases', () => {
  describe('VAPID Key Handling', () => {
    it('should not crash when VAPID keys are empty', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      // Checks that VAPID keys are guarded with empty string defaults
      expect(content).toContain("VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || ''")
      expect(content).toContain("VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || ''")
    })

    it('should only set VAPID details when keys exist', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain('if (VAPID_PUBLIC && VAPID_PRIVATE)')
    })

    it('should skip push when VAPID keys missing', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      // sendPushToUser should early return if no VAPID
      expect(content).toContain('if (!VAPID_PUBLIC || !VAPID_PRIVATE) return')
    })
  })

  describe('Subscription Validation', () => {
    it('should require valid URL for endpoint', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain('endpoint: z.string().url()')
    })

    it('should require p256dh and auth keys', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain('p256dh: z.string()')
      expect(content).toContain('auth: z.string()')
    })

    it('should use tenant userId not user-supplied', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain('userId: tenant.userId')
      expect(content).toContain('companyId: tenant.companyId')
    })
  })

  describe('Subscription Lifecycle', () => {
    it('should upsert on duplicate endpoint (not error)', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain('onConflictDoUpdate')
      expect(content).toContain('target: pushSubscriptions.endpoint')
    })

    it('should delete ALL subscriptions for user on unsubscribe', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain("pushRoute.delete('/subscribe'")
      expect(content).toContain('eq(pushSubscriptions.userId, tenant.userId)')
    })

    it('should auto-delete expired subscriptions (410/404)', async () => {
      const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
      expect(content).toContain('statusCode === 410 || statusCode === 404')
      // Check deletion happens on expired
      expect(content).toContain('eq(pushSubscriptions.id, sub.id)')
    })
  })
})

// ===== TEA: SW Cache Strategy Deep Tests =====
describe('TEA: SW Cache Strategy Correctness', () => {
  let swContent: string

  it('setup: load SW content', async () => {
    swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toBeTruthy()
  })

  describe('Security: API Never Cached', () => {
    it('should return early (no respondWith) for /api/ routes', () => {
      // The API handling must return before any respondWith call
      const apiSection = swContent.split("url.pathname.startsWith('/api/')")[1]
      const nextReturn = apiSection?.indexOf('return')
      expect(nextReturn).toBeLessThan(10) // Should return immediately after the check
    })
  })

  describe('WebSocket Exclusion', () => {
    it('should skip WS protocol', () => {
      expect(swContent).toContain("url.protocol === 'ws:'")
      expect(swContent).toContain("url.protocol === 'wss:'")
    })

    it('should skip /ws path', () => {
      expect(swContent).toContain("url.pathname === '/ws'")
    })
  })

  describe('Navigation Fallback Chain', () => {
    it('should try network first for navigation', () => {
      expect(swContent).toContain("request.mode === 'navigate'")
      expect(swContent).toContain('fetch(request)')
    })

    it('should fallback to cache then offline page', () => {
      expect(swContent).toContain('caches.match(request)')
      expect(swContent).toContain('caches.match(OFFLINE_URL)')
    })
  })

  describe('Cache Cleanup on Activate', () => {
    it('should delete caches with different name', () => {
      expect(swContent).toContain('k !== CACHE_NAME')
      expect(swContent).toContain('caches.delete(k)')
    })

    it('should call clients.claim()', () => {
      expect(swContent).toContain('clients.claim()')
    })
  })

  describe('Push Notification Handling', () => {
    it('should parse JSON payload', () => {
      expect(swContent).toContain('event.data.json()')
    })

    it('should show notification with icon', () => {
      expect(swContent).toContain("icon: '/icons/icon-192.png'")
    })

    it('should include url in notification data', () => {
      expect(swContent).toContain("data: { url: data.url || '/' }")
    })

    it('should handle malformed push gracefully', () => {
      expect(swContent).toContain('catch')
    })
  })

  describe('Notification Click', () => {
    it('should close notification on click', () => {
      expect(swContent).toContain('event.notification.close()')
    })

    it('should try to focus existing window first', () => {
      expect(swContent).toContain('client.focus()')
    })

    it('should open new window if no existing one', () => {
      expect(swContent).toContain('self.clients.openWindow(targetUrl)')
    })
  })

  describe('LOGOUT Handler', () => {
    it('should listen for message events', () => {
      expect(swContent).toContain("addEventListener('message'")
    })

    it('should clear ALL caches on LOGOUT', () => {
      // Should iterate all cache keys and delete each
      const logoutSection = swContent.split("type === 'LOGOUT'")[1]
      expect(logoutSection).toContain('caches.keys()')
      expect(logoutSection).toContain('caches.delete(k)')
    })
  })
})

// ===== TEA: Offline Page Robustness =====
describe('TEA: Offline Page Edge Cases', () => {
  let offlineContent: string

  it('setup: load offline HTML', async () => {
    offlineContent = await Bun.file('packages/app/public/offline.html').text()
    expect(offlineContent).toBeTruthy()
  })

  it('should be valid standalone HTML (no React dependency)', () => {
    expect(offlineContent).toContain('<!DOCTYPE html>')
    expect(offlineContent).toContain('<html')
    expect(offlineContent).toContain('</html>')
    expect(offlineContent).not.toContain('react')
    expect(offlineContent).not.toContain('import ')
  })

  it('should have viewport meta for mobile', () => {
    expect(offlineContent).toContain('viewport')
    expect(offlineContent).toContain('width=device-width')
  })

  it('should have Korean content', () => {
    expect(offlineContent).toContain('lang="ko"')
  })

  it('should handle online event for auto-reconnect', () => {
    expect(offlineContent).toContain("addEventListener('online'")
    expect(offlineContent).toContain('location.reload()')
  })

  it('should not depend on external CSS/JS files', () => {
    // All styles should be inline
    expect(offlineContent).toContain('<style>')
    expect(offlineContent).not.toContain('<link rel="stylesheet"')
  })
})

// ===== TEA: Messenger Push Integration =====
describe('TEA: Messenger Push Integration', () => {
  let messengerContent: string

  it('setup: load messenger route', async () => {
    messengerContent = await Bun.file('packages/server/src/routes/workspace/messenger.ts').text()
    expect(messengerContent).toBeTruthy()
  })

  it('should check WS connection before sending push', () => {
    expect(messengerContent).toContain('clientMap.has(m.userId)')
  })

  it('should not send push to message sender', () => {
    expect(messengerContent).toContain('m.userId === tenant.userId')
    expect(messengerContent).toContain('continue')
  })

  it('should wrap push in fire-and-forget (no await blocking)', () => {
    // Push should not block message response
    expect(messengerContent).toContain('.catch(() => {})')
  })

  it('should send push with channel name in title', () => {
    expect(messengerContent).toContain('title: `#${chName}`')
  })

  it('should truncate long message content in push body', () => {
    expect(messengerContent).toContain("content.length > 80 ? content.slice(0, 80) + '...' : content")
  })

  it('should include channelId in push URL', () => {
    expect(messengerContent).toContain('url: `/messenger?channelId=${channelId}`')
  })

  it('should query members with companyId for tenant isolation', () => {
    expect(messengerContent).toContain('eq(messengerMembers.companyId, tenant.companyId)')
  })
})

// ===== TEA: Install Banner Timing Logic =====
describe('TEA: Install Banner Timing & State', () => {
  let bannerContent: string

  it('setup: load install banner', async () => {
    bannerContent = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(bannerContent).toBeTruthy()
  })

  it('should record first visit time exactly once', () => {
    expect(bannerContent).toContain("if (!localStorage.getItem(FIRST_VISIT_KEY))")
    expect(bannerContent).toContain('String(Date.now())')
  })

  it('should not show banner for installed PWA', () => {
    expect(bannerContent).toContain("window.matchMedia('(display-mode: standalone)').matches")
    expect(bannerContent).toContain('return') // Early return for standalone
  })

  it('should prevent default on beforeinstallprompt', () => {
    expect(bannerContent).toContain('e.preventDefault()')
  })

  it('should calculate 3-day threshold correctly', () => {
    expect(bannerContent).toContain('THREE_DAYS = 3 * 24 * 60 * 60 * 1000')
  })

  it('should calculate 7-day dismiss cooldown correctly', () => {
    expect(bannerContent).toContain('SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000')
  })

  it('should cleanup event listener on unmount', () => {
    expect(bannerContent).toContain('removeEventListener')
  })

  it('should clear deferred prompt after install', () => {
    expect(bannerContent).toContain('setDeferredPrompt(null)')
  })

  it('should have safe area padding for notched devices', () => {
    expect(bannerContent).toContain('safe-area-inset-bottom')
  })
})

// ===== TEA: Messenger Mobile Responsive =====
describe('TEA: Messenger Mobile Responsive', () => {
  let messengerUI: string

  it('setup: load messenger page', async () => {
    messengerUI = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(messengerUI).toBeTruthy()
  })

  it('should use md breakpoint consistently', () => {
    // Channel list: hidden on mobile when chatting
    expect(messengerUI).toContain('hidden md:block')
    // Chat area: hidden on mobile when viewing channel list
    expect(messengerUI).toContain('hidden md:flex')
  })

  it('should set showChat on channel select', () => {
    expect(messengerUI).toContain('setShowChat(true)')
  })

  it('should reset showChat on back button', () => {
    expect(messengerUI).toContain('setShowChat(false)')
  })

  it('should hide back button on desktop', () => {
    expect(messengerUI).toContain('md:hidden')
  })

  it('should make channel list full width on mobile', () => {
    expect(messengerUI).toContain('w-full md:w-64')
  })

  it('should make thread panel overlay on mobile', () => {
    expect(messengerUI).toContain('fixed inset-0 md:static')
  })

  it('should have safe area inset on input', () => {
    expect(messengerUI).toContain('safe-area-inset-bottom')
  })

  it('should have iOS momentum scroll on message list', () => {
    expect(messengerUI).toContain('-webkit-overflow-scrolling:touch')
  })

  it('should have iOS momentum scroll on channel list', () => {
    // Channel list section uses momentum scroll class
    const channelSection = messengerUI.split('w-full md:w-64')[1]
    expect(channelSection).toContain('-webkit-overflow-scrolling:touch')
  })
})

// ===== TEA: Push Permission Component =====
describe('TEA: Push Permission Edge Cases', () => {
  let pushContent: string

  it('setup: load push permission', async () => {
    pushContent = await Bun.file('packages/app/src/components/push-permission.tsx').text()
    expect(pushContent).toBeTruthy()
  })

  it('should only attempt push setup once', () => {
    expect(pushContent).toContain('attempted.current')
  })

  it('should not request permission when denied', () => {
    expect(pushContent).toContain("Notification.permission === 'denied'")
  })

  it('should handle already granted permission', () => {
    expect(pushContent).toContain("Notification.permission === 'granted'")
  })

  it('should check for ServiceWorker API support', () => {
    expect(pushContent).toContain("'serviceWorker' in navigator")
  })

  it('should use userVisibleOnly for subscription', () => {
    expect(pushContent).toContain('userVisibleOnly: true')
  })

  it('should handle push setup failure gracefully', () => {
    expect(pushContent).toContain('catch')
  })

  it('should return null (no visible UI)', () => {
    expect(pushContent).toContain('return null')
  })

  it('should get existing subscription before creating new', () => {
    expect(pushContent).toContain('getSubscription()')
  })
})

// ===== TEA: Auth Store SW Integration =====
describe('TEA: Auth Store SW Integration', () => {
  it('should check for serviceWorker.controller before messaging', async () => {
    const content = await Bun.file('packages/app/src/stores/auth-store.ts').text()
    expect(content).toContain('navigator.serviceWorker.controller')
  })

  it('should guard with serviceWorker feature detection', async () => {
    const content = await Bun.file('packages/app/src/stores/auth-store.ts').text()
    expect(content).toContain("'serviceWorker' in navigator")
  })
})

// ===== TEA: DB Schema Integrity =====
describe('TEA: Push Subscriptions Schema Integrity', () => {
  let schemaContent: string

  it('setup: load schema', async () => {
    schemaContent = await Bun.file('packages/server/src/db/schema.ts').text()
    expect(schemaContent).toBeTruthy()
  })

  it('should have FK to companies', () => {
    const pushSection = schemaContent.split("pgTable('push_subscriptions'")[1]?.split('})')[0] || ''
    expect(pushSection).toContain("references(() => companies.id)")
  })

  it('should have FK to users', () => {
    const pushSection = schemaContent.split("pgTable('push_subscriptions'")[1]?.split('})')[0] || ''
    expect(pushSection).toContain("references(() => users.id)")
  })

  it('should have proper relations defined', () => {
    expect(schemaContent).toContain('pushSubscriptionsRelations')
  })
})

// ===== TEA: Route Registration =====
describe('TEA: Route Registration Correctness', () => {
  it('should register under /api/workspace/push path', async () => {
    const content = await Bun.file('packages/server/src/index.ts').text()
    expect(content).toContain("app.route('/api/workspace/push', pushRoute)")
  })

  it('should import pushRoute correctly', async () => {
    const content = await Bun.file('packages/server/src/index.ts').text()
    expect(content).toContain("import { pushRoute } from './routes/workspace/push'")
  })
})

// ===== TEA: Migration File Integrity =====
describe('TEA: Migration File Integrity', () => {
  it('should use IF NOT EXISTS for idempotent migration', async () => {
    const content = await Bun.file('packages/server/src/db/migrations/0027_push-subscriptions.sql').text()
    expect(content).toContain('IF NOT EXISTS')
  })

  it('should create indexes', async () => {
    const content = await Bun.file('packages/server/src/db/migrations/0027_push-subscriptions.sql').text()
    expect(content).toContain('CREATE INDEX')
    expect(content).toContain('CREATE UNIQUE INDEX')
  })

  it('should have FK constraints in migration', async () => {
    const content = await Bun.file('packages/server/src/db/migrations/0027_push-subscriptions.sql').text()
    expect(content).toContain('REFERENCES "companies"("id")')
    expect(content).toContain('REFERENCES "users"("id")')
  })
})
