import { describe, it, expect, beforeEach, mock } from 'bun:test'

// ===== Service Worker Cache Strategy Tests =====
describe('SW Cache Strategy', () => {
  it('should define cache name corthex-shell-v2', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("CACHE_NAME = 'corthex-shell-v2'")
  })

  it('should define offline URL', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("OFFLINE_URL = '/offline.html'")
  })

  it('should pre-cache offline page on install', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain('cache.add(OFFLINE_URL)')
  })

  it('should clean old caches on activate', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain('caches.keys()')
    expect(swContent).toContain('caches.delete(k)')
  })

  it('should skip non-GET requests', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("request.method !== 'GET'")
  })

  it('should skip API routes (Network Only)', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("url.pathname.startsWith('/api/')")
  })

  it('should skip WebSocket paths', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("url.pathname === '/ws'")
  })

  it('should use Cache First for static assets', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("url.pathname.startsWith('/assets/')")
    expect(swContent).toContain("url.pathname.startsWith('/icons/')")
  })

  it('should use Network First for navigation', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("request.mode === 'navigate'")
  })

  it('should handle push events', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("addEventListener('push'")
    expect(swContent).toContain('showNotification')
  })

  it('should handle notification clicks', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("addEventListener('notificationclick'")
    expect(swContent).toContain('clients.openWindow')
  })

  it('should handle LOGOUT message to clear caches', async () => {
    const swContent = await Bun.file('packages/app/public/sw.js').text()
    expect(swContent).toContain("addEventListener('message'")
    expect(swContent).toContain("type === 'LOGOUT'")
  })
})

// ===== Offline Page Tests =====
describe('Offline Page', () => {
  it('should exist as static HTML', async () => {
    const file = Bun.file('packages/app/public/offline.html')
    expect(await file.exists()).toBe(true)
  })

  it('should contain offline message', async () => {
    const content = await Bun.file('packages/app/public/offline.html').text()
    expect(content).toContain('인터넷 연결이 끊겼습니다')
    expect(content).toContain('연결 복구 시 자동으로 재개됩니다')
  })

  it('should contain retry button', async () => {
    const content = await Bun.file('packages/app/public/offline.html').text()
    expect(content).toContain('다시 시도')
    expect(content).toContain('location.reload()')
  })

  it('should auto-reload on online event', async () => {
    const content = await Bun.file('packages/app/public/offline.html').text()
    expect(content).toContain("addEventListener('online'")
  })

  it('should have dark theme matching app', async () => {
    const content = await Bun.file('packages/app/public/offline.html').text()
    expect(content).toContain('#09090b')
  })
})

// ===== Install Banner Tests =====
describe('Install Banner Component', () => {
  it('should exist', async () => {
    const file = Bun.file('packages/app/src/components/install-banner.tsx')
    expect(await file.exists()).toBe(true)
  })

  it('should use beforeinstallprompt event', async () => {
    const content = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(content).toContain('beforeinstallprompt')
  })

  it('should check standalone mode', async () => {
    const content = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(content).toContain('display-mode: standalone')
  })

  it('should implement 3-day delay', async () => {
    const content = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(content).toContain('THREE_DAYS')
    expect(content).toContain('corthex_first_visit')
  })

  it('should implement 7-day dismiss cooldown', async () => {
    const content = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(content).toContain('SEVEN_DAYS')
    expect(content).toContain('corthex_install_dismissed')
  })

  it('should have install and dismiss buttons', async () => {
    const content = await Bun.file('packages/app/src/components/install-banner.tsx').text()
    expect(content).toContain('handleInstall')
    expect(content).toContain('handleDismiss')
    expect(content).toContain('나중에')
    expect(content).toContain('설치')
  })
})

// ===== Push Route Tests =====
describe('Push Route', () => {
  it('should exist', async () => {
    const file = Bun.file('packages/server/src/routes/workspace/push.ts')
    expect(await file.exists()).toBe(true)
  })

  it('should export pushRoute and sendPushToUser', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain('export const pushRoute')
    expect(content).toContain('export async function sendPushToUser')
  })

  it('should have vapid-key endpoint', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain("'/vapid-key'")
  })

  it('should have subscribe endpoint with validation', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain("'/subscribe'")
    expect(content).toContain('endpoint: z.string().url()')
    expect(content).toContain('p256dh: z.string()')
    expect(content).toContain('auth: z.string()')
  })

  it('should upsert on existing endpoint', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain('onConflictDoUpdate')
  })

  it('should delete expired subscriptions on 410', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain('statusCode === 410')
  })

  it('should use authMiddleware', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/push.ts').text()
    expect(content).toContain('authMiddleware')
  })
})

// ===== Push Permission Component Tests =====
describe('Push Permission Component', () => {
  it('should exist', async () => {
    const file = Bun.file('packages/app/src/components/push-permission.tsx')
    expect(await file.exists()).toBe(true)
  })

  it('should check standalone mode before requesting permission', async () => {
    const content = await Bun.file('packages/app/src/components/push-permission.tsx').text()
    expect(content).toContain('display-mode: standalone')
  })

  it('should check for PushManager support', async () => {
    const content = await Bun.file('packages/app/src/components/push-permission.tsx').text()
    expect(content).toContain('PushManager')
  })

  it('should subscribe with VAPID key', async () => {
    const content = await Bun.file('packages/app/src/components/push-permission.tsx').text()
    expect(content).toContain('applicationServerKey')
    expect(content).toContain('vapid-key')
  })
})

// ===== DB Schema Tests =====
describe('Push Subscriptions Schema', () => {
  it('should define pushSubscriptions table', async () => {
    const content = await Bun.file('packages/server/src/db/schema.ts').text()
    expect(content).toContain("pushSubscriptions = pgTable('push_subscriptions'")
  })

  it('should have required columns', async () => {
    const content = await Bun.file('packages/server/src/db/schema.ts').text()
    expect(content).toContain("endpoint: text('endpoint').notNull()")
    expect(content).toContain("p256dh: text('p256dh').notNull()")
    expect(content).toContain("auth: text('auth').notNull()")
  })

  it('should have unique endpoint constraint', async () => {
    const content = await Bun.file('packages/server/src/db/schema.ts').text()
    expect(content).toContain('push_subscriptions_endpoint_uniq')
  })

  it('should have user index', async () => {
    const content = await Bun.file('packages/server/src/db/schema.ts').text()
    expect(content).toContain('push_subscriptions_user_idx')
  })
})

// ===== Migration Tests =====
describe('Migration', () => {
  it('should have migration file', async () => {
    const file = Bun.file('packages/server/src/db/migrations/0027_push-subscriptions.sql')
    expect(await file.exists()).toBe(true)
  })

  it('should create push_subscriptions table', async () => {
    const content = await Bun.file('packages/server/src/db/migrations/0027_push-subscriptions.sql').text()
    expect(content).toContain('CREATE TABLE IF NOT EXISTS "push_subscriptions"')
  })

  it('should have journal entry', async () => {
    const journal = await Bun.file('packages/server/src/db/migrations/meta/_journal.json').json()
    const entry = journal.entries.find((e: { tag: string }) => e.tag === '0027_push-subscriptions')
    expect(entry).toBeTruthy()
  })
})

// ===== Layout Integration Tests =====
describe('Layout Integration', () => {
  it('should include InstallBanner', async () => {
    const content = await Bun.file('packages/app/src/components/layout.tsx').text()
    expect(content).toContain("import { InstallBanner } from './install-banner'")
    expect(content).toContain('<InstallBanner />')
  })

  it('should include PushPermission', async () => {
    const content = await Bun.file('packages/app/src/components/layout.tsx').text()
    expect(content).toContain("import { PushPermission } from './push-permission'")
    expect(content).toContain('<PushPermission />')
  })
})

// ===== Auth Store Logout Tests =====
describe('Auth Store Logout', () => {
  it('should send LOGOUT message to SW on logout', async () => {
    const content = await Bun.file('packages/app/src/stores/auth-store.ts').text()
    expect(content).toContain("postMessage({ type: 'LOGOUT' })")
  })
})

// ===== Messenger Mobile Responsive Tests =====
describe('Messenger Mobile Responsive', () => {
  it('should have showChat state', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('showChat')
    expect(content).toContain('setShowChat')
  })

  it('should hide channel list on mobile when chat is shown', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain("hidden md:block")
  })

  it('should hide chat area on mobile when channel list is shown', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain("hidden md:flex")
  })

  it('should have mobile back button', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('← 채널')
    expect(content).toContain('setShowChat(false)')
  })

  it('should set showChat true on channel select', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('setShowChat(true)')
  })

  it('should have safe area inset on input area', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('safe-area-inset-bottom')
  })

  it('should have iOS momentum scroll', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('-webkit-overflow-scrolling:touch')
  })

  it('should make thread panel full-screen on mobile', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('fixed inset-0 md:static md:w-80')
  })

  it('should have responsive channel list width', async () => {
    const content = await Bun.file('packages/app/src/pages/messenger.tsx').text()
    expect(content).toContain('w-full md:w-64')
  })
})

// ===== Messenger Push Integration Tests =====
describe('Messenger Push Integration', () => {
  it('should import sendPushToUser in messenger route', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/messenger.ts').text()
    expect(content).toContain("import { sendPushToUser } from './push'")
  })

  it('should call sendPushToUser for offline users', async () => {
    const content = await Bun.file('packages/server/src/routes/workspace/messenger.ts').text()
    expect(content).toContain('sendPushToUser')
    expect(content).toContain('hasWs')
    expect(content).toContain('clientMap.has')
  })
})

// ===== Route Registration Tests =====
describe('Route Registration', () => {
  it('should register push route in index.ts', async () => {
    const content = await Bun.file('packages/server/src/index.ts').text()
    expect(content).toContain("import { pushRoute } from './routes/workspace/push'")
    expect(content).toContain("app.route('/api/workspace/push', pushRoute)")
  })
})
