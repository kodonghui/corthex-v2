import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { Badge, toast } from '@corthex/ui'
import { Settings, Check, ArrowLeftRight } from 'lucide-react'
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

type TabDef = {
  value: string
  label: string
  disabled?: boolean
}

const TABS: TabDef[] = [
  { value: 'profile', label: '일반' },
  { value: 'display', label: '테마' },
  { value: 'notifications', label: '알림 설정' },
  { value: 'command', label: '사령관실' },
  { value: 'api', label: 'API 연동' },
  { value: 'telegram', label: '텔레그램' },
  { value: 'soul', label: '소울 편집' },
  { value: 'files', label: '파일 관리', disabled: true },
  { value: 'trading', label: '매매 설정', disabled: true },
  { value: 'mcp', label: 'MCP 연동' },
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
const inputBase = 'w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl focus:outline-0 focus:ring-1 focus:ring-cyan-400 border border-slate-700 bg-slate-900/50 h-14 placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal transition-all'
const inputReadOnly = `${inputBase} text-slate-500 cursor-not-allowed`
const inputEditable = `${inputBase} text-slate-50`
const selectClass = `${inputBase} text-slate-50 appearance-none`

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
    <div className="flex flex-1 justify-center py-5 px-4 sm:px-10 md:px-20 lg:px-40" data-testid="settings-page">
      <div className="flex flex-col max-w-[800px] flex-1">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-800 px-4 sm:px-10 py-4">
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 text-cyan-400 flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-50">CORTHEX System Settings</h2>
          </div>
        </header>

        {/* Tab Navigation -- Stitch style */}
        <div className="pb-3 pt-2">
          <div className="flex border-b border-slate-800 px-4 sm:px-10 gap-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {TABS.filter(t => !t.disabled).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setTab(tab.value)}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 transition-colors whitespace-nowrap ${
                  activeTab === tab.value
                    ? 'border-cyan-400'
                    : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                <p className={`text-sm font-bold leading-normal ${
                  activeTab === tab.value ? 'text-cyan-400' : ''
                }`}>{tab.label}</p>
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
    <div data-testid="profile-tab">
      {/* 회사 정보 Section -- Stitch style */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">회사 정보</h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2 text-slate-300">사용자명</p>
              <input type="text" value={profile?.username || ''} readOnly className={inputReadOnly} />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2 text-slate-300">이메일</p>
              <input type="text" value={profile?.email || '미설정'} readOnly className={inputReadOnly} />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2 text-slate-300">이름</p>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={inputEditable}
              />
            </label>
          </div>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2 text-slate-300">역할</p>
              <input
                type="text"
                value={profile?.role === 'admin' ? '관리자' : profile?.role === 'ceo' ? 'CEO' : '직원'}
                readOnly
                className={inputReadOnly}
              />
            </label>
          </div>
          <button
            onClick={handleSaveName}
            disabled={updateProfile.isPending || editName.trim() === profile?.name}
            className="px-6 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50 self-end"
          >
            {updateProfile.isPending ? '저장 중...' : '이름 저장'}
          </button>
        </div>
      </section>

      <div className="w-full h-px bg-slate-800 my-10" />

      {/* 비밀번호 변경 Section */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">비밀번호 변경</h2>
        <div className="flex flex-col gap-5">
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2 text-slate-300">새 비밀번호</p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError('') }}
              placeholder="최소 6자"
              className={inputEditable}
            />
          </label>
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2 text-slate-300">비밀번호 확인</p>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError('') }}
              placeholder="비밀번호 재입력"
              className={inputEditable}
            />
          </label>
          {passwordError && (
            <p className="text-sm text-red-400">{passwordError}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={!newPassword || !confirmPassword || changePassword.isPending}
            className="px-6 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50 self-end"
          >
            {changePassword.isPending ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </section>

      {/* Admin Console Switch */}
      {canSwitchData?.data?.canSwitch && (
        <>
          <div className="w-full h-px bg-slate-800 my-10" />
          <div className="flex justify-end">
            <button
              onClick={handleSwitchToAdmin}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              관리자 콘솔로 이동
            </button>
          </div>
        </>
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

  const ACCENT_COLORS = [
    { value: 'cyan', color: 'bg-cyan-400', label: 'Cyan (기본값)' },
    { value: 'amber', color: 'bg-amber-400', label: 'Amber' },
    { value: 'emerald', color: 'bg-emerald-400', label: 'Emerald' },
    { value: 'violet', color: 'bg-violet-400', label: 'Violet' },
    { value: 'slate', color: 'bg-slate-400', label: 'Slate' },
  ]

  return (
    <div data-testid="display-tab">
      {/* 테마 Section -- Stitch style */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">테마</h2>
        <div className="flex flex-col gap-6">
          {/* Theme mode selector */}
          <div>
            <p className="text-base font-medium leading-normal text-slate-300 mb-3">모드</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'system', label: '시스템' },
                { value: 'light', label: '라이트' },
                { value: 'dark', label: '다크' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    theme === opt.value
                      ? 'bg-cyan-400/10 text-cyan-400 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent color picker -- Stitch style */}
          <div>
            <p className="text-base font-medium leading-normal text-slate-300 mb-4">액센트 컬러</p>
            <div className="flex items-center gap-4 flex-wrap">
              {ACCENT_COLORS.map((ac, idx) => (
                <button
                  key={ac.value}
                  className={`w-12 h-12 rounded-full ${ac.color} flex items-center justify-center transition-all cursor-pointer ${
                    idx === 0
                      ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950'
                      : 'hover:scale-110'
                  }`}
                >
                  {idx === 0 && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-slate-400">Cyan (기본값)</span>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full h-px bg-slate-800 my-10" />

      {/* 언어 Section */}
      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">언어</h2>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2 text-slate-300">언어</p>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className={selectClass}
            >
              <option value="ko">한국어 (Korean)</option>
              <option value="en">English</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
          </label>
          <p className="text-xs text-slate-500">언어 변경은 향후 업데이트에서 전체 UI에 적용됩니다</p>
        </div>
      </section>
    </div>
  )
}

// ── Command Center Tab ──

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
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">사령관실 설정</h2>
        <div className="flex flex-col gap-6">
          {/* Auto scroll toggle -- Stitch style */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-base font-medium text-slate-100">자동 스크롤</p>
              <p className="text-sm text-slate-400 mt-1">새 메시지가 올 때 자동으로 아래로 스크롤합니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked={autoScroll} onChange={toggleAutoScroll} className="sr-only peer" type="checkbox" />
              <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400" />
            </label>
          </div>
          {/* Sound toggle */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-base font-medium text-slate-100">알림 소리</p>
              <p className="text-sm text-slate-400 mt-1">에이전트 응답 완료 시 알림 소리를 재생합니다</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input checked={sound} onChange={toggleSound} className="sr-only peer" type="checkbox" />
              <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-400" />
            </label>
          </div>
        </div>
      </section>
    </div>
  )
}

// ── Placeholder Tab ──

function PlaceholderTab() {
  return (
    <div className="text-center py-16">
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
    <div data-testid="api-key-tab">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50">API 연동</h2>
          <button
            onClick={() => { setShowForm(!showForm); setFormCredentials({}) }}
            className="px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 font-semibold text-sm hover:bg-cyan-300 transition-colors"
          >
            {showForm ? '취소' : '+ 새 키 등록'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 p-5 rounded-xl border border-cyan-400/30 bg-cyan-400/5 flex flex-col gap-4">
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2 text-slate-300">서비스</p>
              <select
                value={formProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className={selectClass}
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col flex-1">
              <p className="text-base font-medium leading-normal pb-2 text-slate-300">라벨 (선택)</p>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="예: 내 KIS 계정"
                className={inputEditable}
              />
            </label>
            {fields.map((f) => (
              <label key={f.key} className="flex flex-col flex-1">
                <p className="text-base font-medium leading-normal pb-2 text-slate-300">{f.label}</p>
                <input
                  type={f.type}
                  value={formCredentials[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  placeholder={`${f.label} 입력`}
                  className={inputEditable}
                />
              </label>
            ))}
            <p className="text-xs text-slate-500">모든 키는 서버에서 암호화되어 저장됩니다</p>
            <button
              onClick={handleRegister}
              disabled={!allFieldsFilled || registerKey.isPending}
              className="px-6 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50 self-end"
            >
              {registerKey.isPending ? '등록 중...' : '등록'}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {keysLoading ? (
            <div className="text-center py-8 text-sm text-slate-500">불러오는 중...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500">
              등록된 API key가 없습니다
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-slate-50">
                      {PROVIDER_LABELS[key.provider] || key.provider}
                    </span>
                    <Badge variant="success">연동됨</Badge>
                  </div>
                  {key.label && (
                    <p className="text-sm text-slate-500 mt-0.5">{key.label}</p>
                  )}
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {new Date(key.createdAt).toLocaleDateString('ko-KR')} 등록
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('이 API key를 삭제하시겠습니까?')) {
                      deleteKey.mutate(key.id)
                    }
                  }}
                  className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 border border-red-800 rounded-lg hover:bg-red-900/30 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="w-full h-px bg-slate-800 my-10" />

      <section>
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">서비스 연동 안내</h2>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="font-medium text-slate-200">KIS 증권</span>
            <span className="text-sm text-slate-400"> — 한국투자증권 API key를 등록하면 에이전트가 매매 현황을 조회할 수 있습니다.</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="font-medium text-slate-200">노션</span>
            <span className="text-sm text-slate-400"> — 노션 API key를 등록하면 노션 연동 도구를 사용할 수 있습니다.</span>
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
    <div data-testid="telegram-tab">
      <h2 className="text-[22px] font-bold leading-tight tracking-tight text-slate-50 pb-6">텔레그램 연동</h2>
      {config?.isActive ? (
        <div className="p-5 rounded-xl border border-emerald-800 bg-emerald-950/30 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full font-medium">연동됨</span>
            <span className="text-sm text-slate-400 font-mono">Chat ID: {config.ceoChatId || '미설정'}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => testMessage.mutate()} disabled={testMessage.isPending}
              className="px-4 py-2 text-sm bg-cyan-400 text-slate-950 font-medium rounded-lg hover:bg-cyan-300 disabled:opacity-50 transition-colors">
              {testMessage.isPending ? '전송 중...' : '테스트 메시지'}
            </button>
            <button onClick={() => disconnect.mutate()}
              className="px-4 py-2 text-sm border border-red-800 text-red-400 rounded-lg hover:bg-red-900/30 transition-colors">
              연결 해제
            </button>
          </div>
          {testMessage.isSuccess && <p className="text-sm text-emerald-400">테스트 메시지 전송 성공!</p>}
          {testMessage.isError && <p className="text-sm text-red-400">전송 실패: {(testMessage.error as Error).message}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2 text-slate-300">봇 토큰</p>
            <input type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)}
              placeholder="봇 토큰 (@BotFather에서 발급)" className={inputEditable} />
          </label>
          <label className="flex flex-col flex-1">
            <p className="text-base font-medium leading-normal pb-2 text-slate-300">CEO 채팅 ID (선택)</p>
            <input value={ceoChatId} onChange={(e) => setCeoChatId(e.target.value)}
              placeholder="CEO 채팅 ID" className={inputEditable} />
          </label>
          <button onClick={() => saveConfig.mutate()} disabled={!botToken || saveConfig.isPending}
            className="px-6 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-semibold hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50 self-end">
            {saveConfig.isPending ? '검증 중...' : '연동하기'}
          </button>
          {saveConfig.isError && <p className="text-sm text-red-400">{(saveConfig.error as Error).message}</p>}
        </div>
      )}
    </div>
  )
}
