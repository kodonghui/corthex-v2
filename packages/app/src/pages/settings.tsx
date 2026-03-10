import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Badge, toast, Tabs, Toggle } from '@corthex/ui'
import type { TabItem } from '@corthex/ui'
import { SoulEditor } from '../components/settings/soul-editor'
import { SettingsMcp } from '../components/settings/settings-mcp'
import { NotificationSettings } from '../components/notification-settings'

// ── Types ──

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

// ── Constants ──

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

const TABS: TabItem[] = [
  { value: 'profile', label: '프로필', shortLabel: '프로필' },
  { value: 'notifications', label: '알림 설정', shortLabel: '알림' },
  { value: 'display', label: '표시 설정', shortLabel: '표시' },
  { value: 'command', label: '사령관실', shortLabel: '사령관' },
  { value: 'api', label: 'API 연동', shortLabel: 'API' },
  { value: 'telegram', label: '텔레그램', shortLabel: '텔레' },
  { value: 'soul', label: '소울 편집', shortLabel: '소울' },
  { value: 'files', label: '파일 관리', shortLabel: '파일', disabled: true },
  { value: 'trading', label: '매매 설정', shortLabel: '매매', disabled: true },
  { value: 'mcp', label: 'MCP 연동', shortLabel: 'MCP' },
]

const WIDE_TABS = new Set(['soul', 'mcp'])

// ── Theme helpers ──

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

// ── Input class helpers ──
const inputReadOnly = 'w-full px-3 py-2 rounded-lg text-sm bg-slate-900 border border-slate-700 text-slate-500 cursor-not-allowed'
const inputEditable = 'w-full px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-600 focus:border-blue-500 text-slate-50 outline-none'

// ── Main Page ──

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
    <div className="p-4 md:p-8" data-testid="settings-page">
      <h2 className="text-2xl font-bold text-slate-50 mb-4">설정</h2>

      <Tabs items={TABS} value={activeTab} onChange={setTab} className="mb-6" />

      <div className={WIDE_TABS.has(activeTab) ? 'max-w-3xl' : 'max-w-lg'}>
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
  )
}

// ── Profile Tab ──

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
    return <div className="text-center py-8 text-sm text-slate-500">불러오는 중...</div>
  }

  return (
    <div className="space-y-6" data-testid="profile-tab">
      {/* Profile Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">내 정보</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">사용자명</label>
            <input type="text" value={profile?.username || ''} readOnly className={inputReadOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">이메일</label>
            <input type="text" value={profile?.email || '미설정'} readOnly className={inputReadOnly} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">이름</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={inputEditable}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">역할</label>
            <input
              type="text"
              value={profile?.role === 'admin' ? '관리자' : profile?.role === 'ceo' ? 'CEO' : '직원'}
              readOnly
              className={inputReadOnly}
            />
          </div>
          <button
            onClick={handleSaveName}
            disabled={updateProfile.isPending || editName.trim() === profile?.name}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {updateProfile.isPending ? '저장 중...' : '이름 저장'}
          </button>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">비밀번호 변경</p>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
              placeholder="최소 6자"
              className={inputEditable}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
              placeholder="비밀번호 재입력"
              className={inputEditable}
            />
          </div>
          {passwordError && (
            <p className="text-xs text-red-500">{passwordError}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={!newPassword || !confirmPassword || changePassword.isPending}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {changePassword.isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </div>

      {/* Admin Console Switch */}
      {canSwitchData?.data?.canSwitch && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="p-4">
            <button
              onClick={handleSwitchToAdmin}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-600 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              관리자 콘솔로 이동
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Display Tab ──

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

  return (
    <div className="space-y-4" data-testid="display-tab">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">테마</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'system', label: '시스템' },
              { value: 'light', label: '라이트' },
              { value: 'dark', label: '다크' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleThemeChange(opt.value)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  theme === opt.value
                    ? 'bg-blue-900/40 text-blue-300 ring-1 ring-blue-700'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">언어</p>
        </div>
        <div className="p-4">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 text-sm text-slate-300 rounded-lg px-3 py-2"
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
          <p className="text-[10px] text-slate-500 mt-2">언어 변경은 향후 업데이트에서 전체 UI에 적용됩니다</p>
        </div>
      </div>
    </div>
  )
}

// ── Command Center Tab ──

function CommandCenterTab() {
  const [autoScroll, setAutoScroll] = useState(() => localStorage.getItem('corthex_autoscroll') !== 'false')
  const [sound, setSound] = useState(() => localStorage.getItem('corthex_sound') !== 'false')

  const toggleAutoScroll = (value: boolean) => {
    setAutoScroll(value)
    localStorage.setItem('corthex_autoscroll', String(value))
  }

  const toggleSound = (value: boolean) => {
    setSound(value)
    localStorage.setItem('corthex_sound', String(value))
  }

  return (
    <div className="space-y-4" data-testid="command-center-tab">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">사령관실 설정</p>
        </div>
        <div className="divide-y divide-slate-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm text-slate-300">자동 스크롤</span>
              <p className="text-[11px] text-slate-500">새 메시지가 올 때 자동으로 아래로 스크롤합니다</p>
            </div>
            <Toggle checked={autoScroll} onChange={toggleAutoScroll} size="sm" />
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="text-sm text-slate-300">알림 소리</span>
              <p className="text-[11px] text-slate-500">에이전트 응답 완료 시 알림 소리를 재생합니다</p>
            </div>
            <Toggle checked={sound} onChange={toggleSound} size="sm" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Placeholder Tab ──

function PlaceholderTab() {
  return (
    <div className="text-center py-16">
      <p className="text-3xl mb-3">🚧</p>
      <p className="text-sm text-slate-500">준비 중입니다</p>
      <p className="text-xs text-slate-500 mt-1">이 기능은 향후 업데이트에서 제공됩니다</p>
    </div>
  )
}

// ── API Key Tab ──

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
    <div className="space-y-6" data-testid="api-key-tab">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-400">개인 API Key</h3>
          <button
            onClick={() => { setShowForm(!showForm); setFormCredentials({}) }}
            className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
          >
            {showForm ? '취소' : '+ 새 키 등록'}
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-lg border border-blue-800 bg-blue-950/30 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">서비스</label>
              <select
                value={formProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 text-sm text-slate-300 rounded-lg px-3 py-2"
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">라벨 (선택)</label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="예: 내 KIS 계정"
                className={inputEditable}
              />
            </div>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-500 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={formCredentials[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  placeholder={`${f.label} 입력`}
                  className={inputEditable}
                />
              </div>
            ))}
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <span>🔒</span> 모든 키는 서버에서 암호화되어 저장됩니다
            </p>
            <button
              onClick={handleRegister}
              disabled={!allFieldsFilled || registerKey.isPending}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {registerKey.isPending ? '등록 중...' : '등록'}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {keysLoading ? (
            <div className="text-center py-6 text-sm text-slate-500">불러오는 중...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              등록된 API key가 없습니다
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-700"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-50">
                      {PROVIDER_LABELS[key.provider] || key.provider}
                    </span>
                    <Badge variant="success">연동됨</Badge>
                  </div>
                  {key.label && (
                    <p className="text-xs text-slate-500 mt-0.5">{key.label}</p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    {new Date(key.createdAt).toLocaleDateString('ko-KR')} 등록
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('이 API key를 삭제하시겠습니까?')) {
                      deleteKey.mutate(key.id)
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-400"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-400 mb-3">서비스 연동 안내</h3>
        <div className="space-y-2 text-xs text-slate-500">
          <div className="p-3 rounded-lg bg-slate-800">
            <span className="font-medium text-slate-300">KIS 증권</span> — 한국투자증권 API key를 등록하면 에이전트가 매매 현황을 조회할 수 있습니다.
          </div>
          <div className="p-3 rounded-lg bg-slate-800">
            <span className="font-medium text-slate-300">노션</span> — 노션 API key를 등록하면 노션 연동 도구를 사용할 수 있습니다.
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Telegram Section ──

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
    <section data-testid="telegram-tab">
      <h3 className="text-sm font-medium text-slate-400 mb-3">텔레그램 연동</h3>
      {config?.isActive ? (
        <div className="p-4 rounded-lg border border-emerald-800 bg-emerald-950/30 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded-full">연동됨</span>
            <span className="text-xs text-slate-500">Chat ID: {config.ceoChatId || '미설정'}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => testMessage.mutate()} disabled={testMessage.isPending}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50">
              {testMessage.isPending ? '전송 중...' : '테스트 메시지'}
            </button>
            <button onClick={() => disconnect.mutate()}
              className="px-3 py-1 text-xs border border-red-800 text-red-400 rounded hover:bg-red-900/30">
              연결 해제
            </button>
          </div>
          {testMessage.isSuccess && <p className="text-xs text-emerald-400">테스트 메시지 전송 성공!</p>}
          {testMessage.isError && <p className="text-xs text-red-400">전송 실패: {(testMessage.error as Error).message}</p>}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-slate-700 space-y-3">
          <input type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)}
            placeholder="봇 토큰 (@BotFather에서 발급)" className={inputEditable} />
          <input value={ceoChatId} onChange={(e) => setCeoChatId(e.target.value)}
            placeholder="CEO 채팅 ID (선택)" className={inputEditable} />
          <button onClick={() => saveConfig.mutate()} disabled={!botToken || saveConfig.isPending}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {saveConfig.isPending ? '검증 중...' : '연동하기'}
          </button>
          {saveConfig.isError && <p className="text-xs text-red-400">{(saveConfig.error as Error).message}</p>}
        </div>
      )}
    </section>
  )
}
