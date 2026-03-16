// API Endpoints:
// GET   /workspace/profile
// PATCH /workspace/profile  { name?, password? }
// GET   /workspace/profile/api-keys
// POST  /workspace/profile/api-keys  { provider, label?, credentials }
// DELETE /workspace/profile/api-keys/:id
// GET   /workspace/telegram/config
// POST  /workspace/telegram/config  { botToken, ceoChatId? }
// POST  /workspace/telegram/test
// DELETE /workspace/telegram/config
// GET   /auth/can-switch-admin
// POST  /auth/switch-app  { targetApp }

import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Badge, toast } from '@corthex/ui'
import { SoulEditor } from '../components/settings/soul-editor'
import { SettingsMcp } from '../components/settings/settings-mcp'
import { NotificationSettings } from '../components/notification-settings'

// === Types ===

type TelegramConfig = {
  id: string
  isActive: boolean
  ceoChatId: string | null
  hasToken: boolean
} | null

type ApiKey = {
  id: string
  provider: string
  label: string | null
  createdAt: string
}

type ProfileData = {
  id: string
  companyId: string
  username: string
  name: string
  email: string | null
  role: string
  createdAt: string
}

// === Constants ===

const PROVIDER_LABELS: Record<string, string> = {
  kis: 'KIS 증권',
  notion: '노션',
  email: '이메일',
  serper: 'Serper 검색',
  instagram: '인스타그램',
  telegram: '텔레그램',
}

const PROVIDER_FIELDS: Record<string, { key: string; label: string; type: string }[]> = {
  kis: [
    { key: 'app_key', label: 'App Key', type: 'password' },
    { key: 'app_secret', label: 'App Secret', type: 'password' },
    { key: 'account_no', label: '계좌번호', type: 'text' },
  ],
  notion: [
    { key: 'api_key', label: 'API Key', type: 'password' },
  ],
  email: [
    { key: 'host', label: 'SMTP 호스트', type: 'text' },
    { key: 'port', label: '포트', type: 'text' },
    { key: 'user', label: '사용자명', type: 'text' },
    { key: 'password', label: '비밀번호', type: 'password' },
    { key: 'from', label: '발신 주소', type: 'email' },
  ],
}

const PROVIDER_OPTIONS = Object.keys(PROVIDER_FIELDS) as (keyof typeof PROVIDER_FIELDS)[]

type TabDef = {
  value: string
  label: string
  disabled?: boolean
}

const TABS: TabDef[] = [
  { value: 'profile', label: '일반' },
  { value: 'display', label: '테마' },
  { value: 'notifications', label: '알림 설정' },
  { value: 'command', label: '허브' },
  { value: 'api', label: 'API 연동' },
  { value: 'telegram', label: '텔레그램' },
  { value: 'soul', label: '소울 편집' },
  { value: 'files', label: '파일 관리', disabled: true },
  { value: 'trading', label: '매매 설정', disabled: true },
  { value: 'mcp', label: 'MCP 연동' },
]

const WIDE_TABS = new Set(['soul', 'mcp'])

// === Theme helpers ===

type ThemeMode = 'system' | 'light' | 'dark'

function getStoredTheme(): ThemeMode {
  return (localStorage.getItem('corthex_theme') as ThemeMode) || 'system'
}

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else if (theme === 'light') {
    root.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  }
  localStorage.setItem('corthex_theme', theme)
}

function getStoredLanguage(): string {
  return localStorage.getItem('corthex_language') || 'ko'
}

// === Style helpers ===

const inputStyle: React.CSSProperties = {
  backgroundColor: '#fcfbf9',
  borderColor: '#e8e4d9',
  color: '#463e30',
}

const inputBase = 'w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl border h-14 placeholder:text-stone-400 p-[15px] text-base font-normal leading-normal transition-all focus:outline-none focus:ring-1'
const inputReadOnly = `${inputBase} cursor-not-allowed`
const inputEditable = inputBase
const selectClass = `${inputBase} appearance-none`

// === Main Page ===

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') || 'profile'
  const validTab = TABS.find((t) => t.value === rawTab && !t.disabled)
  const activeTab = validTab ? rawTab : 'profile'

  const soulDirtyRef = useRef(false)

  const setTab = (tab: string) => {
    if (activeTab === 'soul' && soulDirtyRef.current) {
      if (!confirm('저장하지 않은 변경사항이 있습니다. 다른 탭으로 이동하시겠어요?')) return
    }
    setSearchParams((prev) => { prev.set('tab', tab); return prev }, { replace: true })
  }

  const handleSoulDirtyChange = useCallback((dirty: boolean) => {
    soulDirtyRef.current = dirty
  }, [])

  return (
    <div
      className="flex flex-1 justify-center py-5 px-4 sm:px-10 md:px-20 lg:px-40 min-h-screen"
      style={{ backgroundColor: '#fcfbf9', fontFamily: "'Inter', sans-serif" }}
      data-testid="settings-page"
    >
      <div className="flex flex-col max-w-[800px] flex-1">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b px-4 sm:px-10 py-4" style={{ borderColor: '#e8e4d9' }}>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 flex items-center justify-center" style={{ color: '#e57373' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>CORTHEX Settings</h2>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="pb-3 pt-2">
          <div className="flex border-b px-4 sm:px-10 gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" style={{ borderColor: '#e8e4d9' }}>
            {TABS.filter(t => !t.disabled).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTab(tab.value)}
                className="flex flex-col items-center justify-center pb-3 pt-4 transition-colors whitespace-nowrap"
                style={activeTab === tab.value
                  ? { borderBottom: '2px solid #e57373', color: '#e57373', fontWeight: 700 }
                  : { borderBottom: '2px solid transparent', color: '#9c8d66', fontWeight: 500 }
                }
              >
                <p className="text-sm leading-normal">{tab.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`px-4 sm:px-10 py-6 flex flex-col gap-10 ${WIDE_TABS.has(activeTab) ? '' : ''}`}>
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'display' && <DisplayTab />}
          {activeTab === 'command' && <CommandCenterTab />}
          {activeTab === 'api' && <ApiKeyTab />}
          {activeTab === 'telegram' && <TelegramSection />}
          {activeTab === 'soul' && <SoulEditor onDirtyChange={handleSoulDirtyChange} />}
          {activeTab === 'mcp' && <SettingsMcp />}
          {(activeTab === 'files' || activeTab === 'trading') && <PlaceholderTab />}
        </div>
      </div>
    </div>
  )
}

// === Profile Tab ===

function ProfileTab() {
  const queryClient = useQueryClient()
  const authStore = useAuthStore()
  const [editName, setEditName] = useState('')
  const [nameLoaded, setNameLoaded] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<{ data: ProfileData }>('/workspace/profile'),
  })

  const profile = profileData?.data

  useEffect(() => {
    if (profile && !nameLoaded) {
      setEditName(profile.name)
      setNameLoaded(true)
    }
  }, [profile, nameLoaded])

  const updateProfile = useMutation({
    mutationFn: (body: { name?: string; password?: string }) =>
      api.patch<{ data: { id: string; name: string; email: string | null; role: string } }>('/workspace/profile', body),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      if (res.data.name && authStore.user) {
        const updated = { ...authStore.user, name: res.data.name }
        localStorage.setItem('corthex_user', JSON.stringify(updated))
        authStore.login(authStore.token!, updated)
      }
      toast.success('저장되었습니다')
    },
    onError: (err: Error) => toast.error(err.message || '저장에 실패했습니다'),
  })

  const handleSaveName = () => {
    const trimmed = editName.trim()
    if (!trimmed) {
      toast.error('이름을 입력해주세요')
      return
    }
    if (trimmed === profile?.name) return
    updateProfile.mutate({ name: trimmed })
  }

  const changePassword = useMutation({
    mutationFn: (body: { password: string }) =>
      api.patch('/workspace/profile', body),
    onSuccess: () => {
      setNewPassword('')
      setConfirmPassword('')
      toast.success('비밀번호가 변경되었습니다')
    },
    onError: (err: Error) => toast.error(err.message || '비밀번호 변경에 실패했습니다'),
  })

  const handleChangePassword = () => {
    setPasswordError('')
    if (newPassword.length < 6) {
      setPasswordError('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다')
      return
    }
    changePassword.mutate({ password: newPassword })
  }

  const { data: canSwitchData } = useQuery({
    queryKey: ['can-switch-admin'],
    queryFn: () => api.get<{ data: { canSwitch: boolean } }>('/auth/can-switch-admin'),
  })

  const handleSwitchToAdmin = async () => {
    try {
      const res = await api.post<{ data: { token: string; user: { id: string; name: string; role: string }; targetUrl: string } }>('/auth/switch-app', { targetApp: 'admin' })
      localStorage.setItem('corthex_admin_token', res.data.token)
      localStorage.setItem('corthex_admin_user', JSON.stringify(res.data.user))
      window.location.href = '/admin'
    } catch (err) {
      toast.error((err as Error).message || '전환에 실패했습니다')
    }
  }

  if (isLoading) {
    return <div className="text-center py-8 text-sm" style={{ color: '#9c8d66' }}>불러오는 중...</div>
  }

  return (
    <div data-testid="profile-tab">
      {/* 회사 정보 Section */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>회사 정보</h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>사용자명</p>
              <input type="text" value={profile?.username || ''} readOnly className={inputReadOnly} style={{ ...inputStyle, color: '#9c8d66', focusRingColor: '#e57373' }} />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>이메일</p>
              <input type="text" value={profile?.email || '미설정'} readOnly className={inputReadOnly} style={{ ...inputStyle, color: '#9c8d66' }} />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>이름</p>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputEditable}
                style={{ ...inputStyle, color: '#463e30' }}
              />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>역할</p>
              <input
                type="text"
                value={profile?.role === 'admin' ? '관리자' : profile?.role === 'ceo' ? 'CEO' : '직원'}
                readOnly
                className={inputReadOnly}
                style={{ ...inputStyle, color: '#9c8d66' }}
              />
            </label>
          </div>
          <button
            onClick={handleSaveName}
            disabled={updateProfile.isPending || editName.trim() === profile?.name}
            className="px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 self-end hover:opacity-90"
            style={{ backgroundColor: '#e57373', color: '#ffffff' }}
          >
            {updateProfile.isPending ? '저장 중...' : '이름 저장'}
          </button>
        </div>
      </section>

      <div className="w-full h-px my-10" style={{ backgroundColor: '#e8e4d9' }} />

      {/* 비밀번호 변경 Section */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>비밀번호 변경</h2>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>새 비밀번호</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
              placeholder="최소 6자"
              className={inputEditable}
              style={{ ...inputStyle, color: '#463e30' }}
            />
          </label>
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>비밀번호 확인</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
              placeholder="비밀번호 재입력"
              className={inputEditable}
              style={{ ...inputStyle, color: '#463e30' }}
            />
          </label>
          {passwordError && (
            <p className="text-sm" style={{ color: '#ef4444' }}>{passwordError}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={!newPassword || !confirmPassword || changePassword.isPending}
            className="px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 self-end hover:opacity-90"
            style={{ backgroundColor: '#e57373', color: '#ffffff' }}
          >
            {changePassword.isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </section>

      {/* Admin Console Switch */}
      {canSwitchData?.data?.canSwitch && (
        <>
          <div className="w-full h-px my-10" style={{ backgroundColor: '#e8e4d9' }} />
          <div className="flex justify-end">
            <button
              onClick={handleSwitchToAdmin}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl border font-medium transition-colors hover:opacity-70"
              style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              관리자 콘솔로 이동
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// === Display Tab ===

function DisplayTab() {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme())
  const [language, setLanguage] = useState(getStoredLanguage())

  const handleThemeChange = (newTheme: string) => {
    const t = newTheme as ThemeMode
    setTheme(t)
    applyTheme(t)
    toast.success('테마가 변경되었습니다')
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('corthex_language', lang)
    toast.success('언어 설정이 변경되었습니다')
  }

  const ACCENT_COLORS = [
    { value: 'olive', color: '#e57373', label: 'Olive (기본값)' },
    { value: 'terracotta', color: '#e07a5f', label: 'Terracotta' },
    { value: 'emerald', color: '#10b981', label: 'Emerald' },
    { value: 'violet', color: '#8b5cf6', label: 'Violet' },
    { value: 'stone', color: '#9c8d66', label: 'Stone' },
  ]

  return (
    <div data-testid="display-tab">
      {/* 테마 Section */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>테마</h2>
        <div className="flex flex-col gap-6">
          {/* Theme mode selector */}
          <div>
            <p className="text-base font-medium leading-normal mb-3" style={{ color: '#6a5d43' }}>모드</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'system', label: '시스템' },
                { value: 'light', label: '라이트' },
                { value: 'dark', label: '다크' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className="py-3 rounded-xl text-sm font-medium transition-all"
                  style={theme === opt.value
                    ? { backgroundColor: 'rgba(90,114,71,0.1)', color: '#e57373', border: '2px solid #e57373' }
                    : { backgroundColor: '#f2f0e9', color: '#6a5d43', border: '2px solid transparent' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color picker */}
          <div>
            <p className="text-base font-medium leading-normal mb-4" style={{ color: '#6a5d43' }}>액센트 컬러</p>
            <div className="flex items-center gap-4 flex-wrap">
              {ACCENT_COLORS.map((ac, idx) => (
                <button
                  key={ac.value}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  style={{
                    backgroundColor: ac.color,
                    outline: idx === 0 ? `2px solid ${ac.color}` : undefined,
                    outlineOffset: idx === 0 ? '3px' : undefined,
                  }}
                >
                  {idx === 0 && (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  )}
                </button>
              ))}
              <span className="ml-2 text-sm font-medium" style={{ color: '#9c8d66' }}>Olive (기본값)</span>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-px my-10" style={{ backgroundColor: '#e8e4d9' }} />

      {/* 언어 Section */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>언어</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>언어</p>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={selectClass}
              style={{ ...inputStyle, color: '#463e30' }}
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
          </label>
          <p className="text-xs" style={{ color: '#9c8d66' }}>언어 변경은 향후 업데이트에서 전체 UI에 적용됩니다</p>
        </div>
      </section>
    </div>
  )
}

// === Command Center Tab ===

function CommandCenterTab() {
  const [autoScroll, setAutoScroll] = useState(() => localStorage.getItem('corthex_autoscroll') !== 'false')
  const [sound, setSound] = useState(() => localStorage.getItem('corthex_sound') !== 'false')

  const toggleAutoScroll = () => {
    const next = !autoScroll
    setAutoScroll(next)
    localStorage.setItem('corthex_autoscroll', String(next))
  }

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    localStorage.setItem('corthex_sound', String(next))
  }

  return (
    <div data-testid="command-center-tab">
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>허브 설정</h2>
        <div className="flex flex-col gap-6">
          {/* Auto scroll toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-base font-medium" style={{ color: '#463e30' }}>자동 스크롤</p>
              <p className="text-sm mt-1" style={{ color: '#9c8d66' }}>새 메시지가 올 때 자동으로 아래로 스크롤합니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked={autoScroll} onChange={toggleAutoScroll} className="sr-only peer" type="checkbox" />
              <div
                className="w-12 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ backgroundColor: autoScroll ? '#e57373' : '#d1c9b2' }}
              />
            </label>
          </div>
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-base font-medium" style={{ color: '#463e30' }}>알림 소리</p>
              <p className="text-sm mt-1" style={{ color: '#9c8d66' }}>에이전트 응답 완료 시 알림 소리를 재생합니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked={sound} onChange={toggleSound} className="sr-only peer" type="checkbox" />
              <div
                className="w-12 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                style={{ backgroundColor: sound ? '#e57373' : '#d1c9b2' }}
              />
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}

// === Placeholder Tab ===

function PlaceholderTab() {
  return (
    <div className="text-center py-16">
      <p className="text-sm" style={{ color: '#9c8d66' }}>준비 중입니다</p>
      <p className="text-xs mt-1" style={{ color: '#b7aa88' }}>이 기능은 향후 업데이트에서 제공됩니다</p>
    </div>
  )
}

// === API Key Tab ===

function ApiKeyTab() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formProvider, setFormProvider] = useState<string>('kis')
  const [formLabel, setFormLabel] = useState('')
  const [formCredentials, setFormCredentials] = useState<Record<string, string>>({})

  const { data: keysData, isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.get<{ data: ApiKey[] }>('/workspace/profile/api-keys'),
  })

  const registerKey = useMutation({
    mutationFn: (body: { provider: string; label?: string; credentials: Record<string, string> }) =>
      api.post('/workspace/profile/api-keys', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setShowForm(false)
      setFormLabel('')
      setFormCredentials({})
      toast.success('API 키가 등록되었습니다')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'API 키 등록에 실패했습니다')
    },
  })

  const deleteKey = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/profile/api-keys/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API 키가 삭제되었습니다')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'API 키 삭제에 실패했습니다')
    },
  })

  const keys = keysData?.data || []
  const fields = PROVIDER_FIELDS[formProvider] || []
  const allFieldsFilled = fields.every((f) => formCredentials[f.key]?.trim())

  const handleProviderChange = (provider: string) => {
    setFormProvider(provider)
    setFormCredentials({})
  }

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormCredentials((prev) => ({ ...prev, [fieldKey]: value }))
  }

  const handleRegister = () => {
    if (!allFieldsFilled) return
    const credentials: Record<string, string> = {}
    for (const f of fields) {
      credentials[f.key] = formCredentials[f.key].trim()
    }
    registerKey.mutate({
      provider: formProvider,
      ...(formLabel.trim() ? { label: formLabel.trim() } : {}),
      credentials,
    })
  }

  return (
    <div data-testid="api-key-tab">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>API 연동</h2>
          <button
            onClick={() => { setShowForm(!showForm); setFormCredentials({}) }}
            className="px-4 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#e57373', color: '#ffffff' }}
          >
            {showForm ? '취소' : '+ 새 키 등록'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-5 rounded-2xl border flex flex-col gap-4" style={{ borderColor: 'rgba(90,114,71,0.3)', backgroundColor: 'rgba(90,114,71,0.03)' }}>
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>서비스</p>
              <select
                value={formProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className={selectClass}
                style={{ ...inputStyle, color: '#463e30' }}
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>라벨 (선택)</p>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="예: 내 KIS 계정"
                className={inputEditable}
                style={{ ...inputStyle, color: '#463e30' }}
              />
            </label>
            {fields.map((f) => (
              <label key={f.key} className="flex flex-col flex-1">
                <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>{f.label}</p>
                <input
                  type={f.type}
                  value={formCredentials[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  placeholder={`${f.label} 입력`}
                  className={inputEditable}
                  style={{ ...inputStyle, color: '#463e30' }}
                />
              </label>
            ))}
            <p className="text-xs" style={{ color: '#9c8d66' }}>모든 키는 서버에서 암호화되어 저장됩니다</p>
            <button
              onClick={handleRegister}
              disabled={!allFieldsFilled || registerKey.isPending}
              className="px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 self-end hover:opacity-90"
              style={{ backgroundColor: '#e57373', color: '#ffffff' }}
            >
              {registerKey.isPending ? '등록 중...' : '등록'}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {keysLoading ? (
            <div className="text-center py-8 text-sm" style={{ color: '#9c8d66' }}>불러오는 중...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: '#9c8d66' }}>
              등록된 API key가 없습니다
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-2xl border bg-white"
                style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium" style={{ color: '#463e30' }}>
                      {PROVIDER_LABELS[key.provider] || key.provider}
                    </span>
                    <Badge variant="success">연동됨</Badge>
                  </div>
                  {key.label && (
                    <p className="text-sm mt-0.5" style={{ color: '#9c8d66' }}>{key.label}</p>
                  )}
                  <p className="text-xs font-mono tabular-nums" style={{ color: '#9c8d66' }}>
                    {new Date(key.createdAt).toLocaleDateString('ko-KR')} 등록
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('이 API key를 삭제하시겠습니까?')) {
                      deleteKey.mutate(key.id)
                    }
                  }}
                  className="px-3 py-1.5 text-sm border rounded-lg transition-colors hover:opacity-70"
                  style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="w-full h-px my-10" style={{ backgroundColor: '#e8e4d9' }} />

      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>서비스 연동 안내</h2>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-white border" style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
            <span className="font-medium" style={{ color: '#463e30' }}>KIS 증권</span>
            <span className="text-sm" style={{ color: '#9c8d66' }}> -- 한국투자증권 API key를 등록하면 에이전트가 매매 현황을 조회할 수 있습니다.</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border" style={{ borderColor: '#e8e4d9', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)' }}>
            <span className="font-medium" style={{ color: '#463e30' }}>노션</span>
            <span className="text-sm" style={{ color: '#9c8d66' }}> -- 노션 API key를 등록하면 노션 연동 도구를 사용할 수 있습니다.</span>
          </div>
        </div>
      </section>
    </div>
  )
}

// === Telegram Section ===

function TelegramSection() {
  const queryClient = useQueryClient()
  const [botToken, setBotToken] = useState('')
  const [ceoChatId, setCeoChatId] = useState('')

  const { data: configData } = useQuery({
    queryKey: ['telegram-config'],
    queryFn: () => api.get<{ data: TelegramConfig }>('/workspace/telegram/config'),
  })

  const saveConfig = useMutation({
    mutationFn: () => api.post('/workspace/telegram/config', { botToken, ceoChatId: ceoChatId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-config'] })
      setBotToken('')
    },
  })

  const testMessage = useMutation({
    mutationFn: () => api.post('/workspace/telegram/test', {}),
  })

  const disconnect = useMutation({
    mutationFn: () => api.delete('/workspace/telegram/config'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['telegram-config'] }),
  })

  const config = configData?.data

  return (
    <div data-testid="telegram-tab">
      <h2 className="text-[22px] font-bold leading-tight tracking-tight pb-6" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>텔레그램 연동</h2>
      {config?.isActive ? (
        <div className="p-5 rounded-2xl border flex flex-col gap-4" style={{ borderColor: 'rgba(16,185,129,0.3)', backgroundColor: 'rgba(16,185,129,0.03)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>연동됨</span>
            <span className="text-sm font-mono" style={{ color: '#9c8d66' }}>Chat ID: {config.ceoChatId || '미설정'}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => testMessage.mutate()} disabled={testMessage.isPending}
              className="px-4 py-2 text-sm font-medium rounded-xl disabled:opacity-50 transition-colors hover:opacity-90"
              style={{ backgroundColor: '#e57373', color: '#ffffff' }}>
              {testMessage.isPending ? '전송 중...' : '테스트 메시지'}
            </button>
            <button onClick={() => disconnect.mutate()}
              className="px-4 py-2 text-sm border rounded-xl transition-colors hover:opacity-70"
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
              연결 해제
            </button>
          </div>
          {testMessage.isSuccess && <p className="text-sm" style={{ color: '#10b981' }}>테스트 메시지 전송 성공!</p>}
          {testMessage.isError && <p className="text-sm" style={{ color: '#ef4444' }}>전송 실패: {(testMessage.error as Error).message}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>봇 토큰</p>
            <input type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)}
              placeholder="봇 토큰 (@BotFather에서 발급)" className={inputEditable} style={{ ...inputStyle, color: '#463e30' }} />
          </label>
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2" style={{ color: '#6a5d43' }}>CEO 채팅 ID (선택)</p>
            <input value={ceoChatId} onChange={(e) => setCeoChatId(e.target.value)}
              placeholder="CEO 채팅 ID" className={inputEditable} style={{ ...inputStyle, color: '#463e30' }} />
          </label>
          <button onClick={() => saveConfig.mutate()} disabled={!botToken || saveConfig.isPending}
            className="px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm disabled:opacity-50 self-end hover:opacity-90"
            style={{ backgroundColor: '#e57373', color: '#ffffff' }}>
            {saveConfig.isPending ? '검증 중...' : '연동하기'}
          </button>
          {saveConfig.isError && <p className="text-sm" style={{ color: '#ef4444' }}>{(saveConfig.error as Error).message}</p>}
        </div>
      )}
    </div>
  )
}
