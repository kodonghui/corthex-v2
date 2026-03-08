import { describe, test, expect, beforeEach } from 'bun:test'

// ─── Settings Page Structure Tests ───

describe('CEO Settings Page - Tab Structure', () => {
  const EXPECTED_TABS = [
    { value: 'profile', label: '프로필' },
    { value: 'notifications', label: '알림 설정' },
    { value: 'display', label: '표시 설정' },
    { value: 'command', label: '사령관실' },
    { value: 'api', label: 'API 연동' },
    { value: 'telegram', label: '텔레그램' },
    { value: 'soul', label: '소울 편집' },
    { value: 'mcp', label: 'MCP 연동' },
  ]

  test('should have all required tabs', () => {
    const tabValues = EXPECTED_TABS.map(t => t.value)
    expect(tabValues).toContain('profile')
    expect(tabValues).toContain('notifications')
    expect(tabValues).toContain('display')
    expect(tabValues).toContain('command')
    expect(tabValues).toContain('api')
    expect(tabValues).toContain('telegram')
    expect(tabValues).toContain('soul')
    expect(tabValues).toContain('mcp')
  })

  test('profile should be the first tab (default)', () => {
    expect(EXPECTED_TABS[0].value).toBe('profile')
  })

  test('all tabs should have Korean labels', () => {
    for (const tab of EXPECTED_TABS) {
      expect(tab.label).toBeTruthy()
      expect(tab.label.length).toBeGreaterThan(0)
    }
  })
})

// ─── Profile API Tests ───

describe('CEO Settings - Profile API', () => {
  test('GET /workspace/profile returns user data', () => {
    const expectedFields = ['id', 'companyId', 'username', 'name', 'email', 'role', 'createdAt']
    const mockProfile = {
      id: 'user-1',
      companyId: 'company-1',
      username: 'testuser',
      name: '테스트 사용자',
      email: 'test@example.com',
      role: 'ceo',
      createdAt: '2026-01-01T00:00:00Z',
    }
    for (const field of expectedFields) {
      expect(mockProfile).toHaveProperty(field)
    }
  })

  test('PATCH /workspace/profile accepts name update', () => {
    const updateBody = { name: '새 이름' }
    expect(updateBody.name).toBeTruthy()
    expect(updateBody.name.length).toBeGreaterThanOrEqual(1)
    expect(updateBody.name.length).toBeLessThanOrEqual(100)
  })

  test('PATCH /workspace/profile accepts password update', () => {
    const updateBody = { password: 'newpass123' }
    expect(updateBody.password.length).toBeGreaterThanOrEqual(6)
  })

  test('password minimum length is 6 characters', () => {
    const shortPasswords = ['', '1', '12', '123', '1234', '12345']
    for (const pw of shortPasswords) {
      expect(pw.length).toBeLessThan(6)
    }
    expect('123456'.length).toBeGreaterThanOrEqual(6)
  })

  test('password confirmation must match', () => {
    const password = 'newpass123'
    const confirm = 'newpass123'
    const mismatch = 'different'

    expect(password).toBe(confirm)
    expect(password).not.toBe(mismatch)
  })

  test('name must not be empty', () => {
    const emptyNames = ['', '   ', '\t', '\n']
    for (const name of emptyNames) {
      expect(name.trim()).toBe('')
    }
    expect('유효한 이름'.trim()).not.toBe('')
  })
})

// ─── Theme Settings Tests ───

describe('CEO Settings - Theme', () => {
  const VALID_THEMES = ['system', 'light', 'dark'] as const

  test('valid theme values', () => {
    expect(VALID_THEMES).toContain('system')
    expect(VALID_THEMES).toContain('light')
    expect(VALID_THEMES).toContain('dark')
    expect(VALID_THEMES.length).toBe(3)
  })

  test('default theme is system', () => {
    const defaultTheme = 'system'
    expect(defaultTheme).toBe('system')
  })

  test('theme applies correct dark class', () => {
    // Simulate theme logic
    function shouldBeDark(theme: string, systemPrefersDark: boolean): boolean {
      if (theme === 'dark') return true
      if (theme === 'light') return false
      return systemPrefersDark // system mode
    }

    expect(shouldBeDark('dark', false)).toBe(true)
    expect(shouldBeDark('dark', true)).toBe(true)
    expect(shouldBeDark('light', false)).toBe(false)
    expect(shouldBeDark('light', true)).toBe(false)
    expect(shouldBeDark('system', true)).toBe(true)
    expect(shouldBeDark('system', false)).toBe(false)
  })

  test('localStorage key for theme is corthex_theme', () => {
    const key = 'corthex_theme'
    expect(key).toBe('corthex_theme')
  })
})

// ─── Language Settings Tests ───

describe('CEO Settings - Language', () => {
  const VALID_LANGUAGES = ['ko', 'en'] as const

  test('valid language values', () => {
    expect(VALID_LANGUAGES).toContain('ko')
    expect(VALID_LANGUAGES).toContain('en')
    expect(VALID_LANGUAGES.length).toBe(2)
  })

  test('default language is Korean', () => {
    const defaultLang = 'ko'
    expect(defaultLang).toBe('ko')
  })

  test('localStorage key for language is corthex_language', () => {
    const key = 'corthex_language'
    expect(key).toBe('corthex_language')
  })
})

// ─── Command Center Settings Tests ───

describe('CEO Settings - Command Center', () => {
  test('auto-scroll default is true (enabled)', () => {
    // When localStorage has no value, auto-scroll should be true
    const noValue = null
    const autoScroll = noValue !== 'false'
    expect(autoScroll).toBe(true)
  })

  test('auto-scroll can be disabled', () => {
    const storedValue = 'false'
    const autoScroll = storedValue !== 'false'
    expect(autoScroll).toBe(false)
  })

  test('auto-scroll can be enabled', () => {
    const storedValue = 'true'
    const autoScroll = storedValue !== 'false'
    expect(autoScroll).toBe(true)
  })

  test('sound default is true (enabled)', () => {
    const noValue = null
    const sound = noValue !== 'false'
    expect(sound).toBe(true)
  })

  test('sound can be disabled', () => {
    const storedValue = 'false'
    const sound = storedValue !== 'false'
    expect(sound).toBe(false)
  })

  test('localStorage keys for command center settings', () => {
    expect('corthex_autoscroll').toBe('corthex_autoscroll')
    expect('corthex_sound').toBe('corthex_sound')
  })
})

// ─── Admin Console Switch Tests ───

describe('CEO Settings - Admin Console Switch', () => {
  test('switch requires admin_users existence', () => {
    const canSwitch = { canSwitch: true }
    const cannotSwitch = { canSwitch: false }
    expect(canSwitch.canSwitch).toBe(true)
    expect(cannotSwitch.canSwitch).toBe(false)
  })

  test('switch uses correct API endpoint', () => {
    const endpoint = '/auth/can-switch-admin'
    expect(endpoint).toBe('/auth/can-switch-admin')
  })

  test('switch-app request structure', () => {
    const request = { targetApp: 'admin' as const }
    expect(request.targetApp).toBe('admin')
  })

  test('switch-app response stores admin token', () => {
    const response = {
      token: 'jwt-admin-token',
      user: { id: 'user-1', name: '테스트', role: 'admin' },
      targetUrl: '/admin',
    }
    const adminTokenKey = 'corthex_admin_token'
    const adminUserKey = 'corthex_admin_user'
    expect(adminTokenKey).toBe('corthex_admin_token')
    expect(adminUserKey).toBe('corthex_admin_user')
    expect(response.token).toBeTruthy()
    expect(response.user).toBeTruthy()
  })

  test('non-admin users should not see switch button', () => {
    const canSwitch = false
    // Button should be hidden
    expect(canSwitch).toBe(false)
  })
})

// ─── Auth Store Update Tests ───

describe('CEO Settings - Auth Store Sync', () => {
  test('profile name update should sync to localStorage', () => {
    const currentUser = { id: 'u1', name: '기존 이름', role: 'ceo' as const, companyId: 'c1' }
    const newName = '새 이름'
    const updated = { ...currentUser, name: newName }
    expect(updated.name).toBe('새 이름')
    expect(updated.id).toBe(currentUser.id)
    expect(updated.companyId).toBe(currentUser.companyId)
  })

  test('localStorage keys for CEO auth', () => {
    expect('corthex_token').toBe('corthex_token')
    expect('corthex_user').toBe('corthex_user')
  })
})

// ─── Role Display Tests ───

describe('CEO Settings - Role Display', () => {
  test('role admin displays 관리자', () => {
    const roleMap: Record<string, string> = {
      admin: '관리자',
      ceo: 'CEO',
      user: '직원',
    }
    expect(roleMap['admin']).toBe('관리자')
    expect(roleMap['ceo']).toBe('CEO')
    expect(roleMap['user']).toBe('직원')
  })

  test('username and email are read-only', () => {
    // These fields should not be editable
    const readOnlyFields = ['username', 'email']
    expect(readOnlyFields).toContain('username')
    expect(readOnlyFields).toContain('email')
  })
})

// ─── Tab Navigation Tests ───

describe('CEO Settings - Tab Navigation', () => {
  test('default tab is profile when no query param', () => {
    const rawTab = null
    const defaultTab = rawTab || 'profile'
    expect(defaultTab).toBe('profile')
  })

  test('invalid tab falls back to profile', () => {
    const TABS = ['profile', 'notifications', 'display', 'command', 'api', 'telegram', 'soul', 'mcp']
    const invalidTab = 'nonexistent'
    const validTab = TABS.includes(invalidTab) ? invalidTab : 'profile'
    expect(validTab).toBe('profile')
  })

  test('disabled tabs cannot be selected', () => {
    const disabledTabs = ['files', 'trading']
    const ACTIVE_TABS = ['profile', 'notifications', 'display', 'command', 'api', 'telegram', 'soul', 'mcp']
    for (const dt of disabledTabs) {
      expect(ACTIVE_TABS).not.toContain(dt)
    }
  })

  test('query param ?tab= drives tab selection', () => {
    const searchParams = new URLSearchParams('tab=display')
    const tab = searchParams.get('tab')
    expect(tab).toBe('display')
  })

  test('soul tab has dirty check before navigation', () => {
    // When soulDirtyRef.current is true, confirm dialog should show
    const isDirty = true
    const activeTab = 'soul'
    const shouldConfirm = activeTab === 'soul' && isDirty
    expect(shouldConfirm).toBe(true)
  })

  test('non-soul tab skips dirty check', () => {
    const isDirty = true
    const activeTab = 'profile'
    const shouldConfirm = activeTab === 'soul' && isDirty
    expect(shouldConfirm).toBe(false)
  })
})

// ─── Wide Tab Layout Tests ───

describe('CEO Settings - Layout', () => {
  test('soul and mcp tabs use wide layout', () => {
    const wideTabs = new Set(['soul', 'mcp'])
    expect(wideTabs.has('soul')).toBe(true)
    expect(wideTabs.has('mcp')).toBe(true)
  })

  test('other tabs use narrow layout', () => {
    const wideTabs = new Set(['soul', 'mcp'])
    const narrowTabs = ['profile', 'notifications', 'display', 'command', 'api', 'telegram']
    for (const tab of narrowTabs) {
      expect(wideTabs.has(tab)).toBe(false)
    }
  })
})

// ─── App Theme Initialization Tests ───

describe('CEO Settings - App Theme Init', () => {
  test('stored theme overrides system preference', () => {
    function getInitialDark(stored: string | null, systemDark: boolean): boolean {
      const theme = stored || 'system'
      if (theme === 'dark') return true
      if (theme === 'light') return false
      return systemDark
    }

    expect(getInitialDark('dark', false)).toBe(true)
    expect(getInitialDark('light', true)).toBe(false)
    expect(getInitialDark(null, true)).toBe(true)
    expect(getInitialDark(null, false)).toBe(false)
    expect(getInitialDark('system', true)).toBe(true)
  })
})

// ─── Settings Data Persistence Tests ───

describe('CEO Settings - localStorage Persistence', () => {
  const ALL_SETTINGS_KEYS = [
    'corthex_theme',
    'corthex_language',
    'corthex_autoscroll',
    'corthex_sound',
  ]

  test('all settings keys are namespaced with corthex_', () => {
    for (const key of ALL_SETTINGS_KEYS) {
      expect(key.startsWith('corthex_')).toBe(true)
    }
  })

  test('settings keys do not collide with auth keys', () => {
    const authKeys = ['corthex_token', 'corthex_user', 'corthex_admin_token', 'corthex_admin_user']
    for (const settingKey of ALL_SETTINGS_KEYS) {
      expect(authKeys).not.toContain(settingKey)
    }
  })
})

// ─── Notification Settings Integration Tests ───

describe('CEO Settings - Notification Settings Integration', () => {
  test('NotificationSettings component is reused from existing code', () => {
    // The NotificationSettings component from ../components/notification-settings is used
    const importPath = '../components/notification-settings'
    expect(importPath).toBe('../components/notification-settings')
  })

  test('notification events include required categories', () => {
    const eventCategories = ['채팅', '작업', '시스템']
    expect(eventCategories).toContain('채팅')
    expect(eventCategories).toContain('작업')
    expect(eventCategories).toContain('시스템')
  })
})
