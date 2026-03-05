import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Badge, toast } from '@corthex/ui'

type TelegramConfig = {
  id: string
  isActive: boolean
  ceoChatId: string | null
  hasToken: boolean
} | null

type AgentDetail = {
  id: string
  name: string
  role: string
  soul: string | null
  status: string
}

type ApiKey = {
  id: string
  provider: string
  label: string | null
  createdAt: string
}

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

const TABS = [
  { key: 'api', label: 'API 연동', shortLabel: 'API', enabled: true },
  { key: 'telegram', label: '텔레그램', shortLabel: '텔레', enabled: true },
  { key: 'soul', label: '소울 편집', shortLabel: '소울', enabled: true },
  { key: 'files', label: '파일 관리', shortLabel: '파일', enabled: false },
  { key: 'trading', label: '매매 설정', shortLabel: '매매', enabled: false },
  { key: 'notifications', label: '알림 설정', shortLabel: '알림', enabled: false },
]

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') || 'api'
  const validTab = TABS.find((t) => t.key === rawTab && t.enabled)
  const activeTab = validTab ? rawTab : 'api'

  const setTab = (tab: string) => {
    setSearchParams((prev) => { prev.set('tab', tab); return prev }, { replace: true })
  }

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-4">설정</h2>

      {/* 탭 네비게이션 */}
      <div className="overflow-x-auto snap-x snap-mandatory mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => tab.enabled && setTab(tab.key)}
              className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors min-w-[100px] text-center snap-start ${
                activeTab === tab.key
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : tab.enabled
                    ? 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    : 'text-zinc-300 dark:text-zinc-600 cursor-default'
              }`}
            >
              <span className="hidden md:inline">{tab.label}</span>
              <span className="md:hidden">{tab.shortLabel}</span>
              {!tab.enabled && (
                <span className="ml-1 text-[10px] text-zinc-400 dark:text-zinc-600">준비 중</span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="max-w-lg">
        {activeTab === 'api' && <ApiKeyTab />}
        {activeTab === 'telegram' && <TelegramSection />}
        {activeTab === 'soul' && <AgentSoulSection />}
        {(activeTab === 'files' || activeTab === 'trading' || activeTab === 'notifications') && (
          <PlaceholderTab />
        )}
      </div>
    </div>
  )
}

function PlaceholderTab() {
  return (
    <div className="text-center py-16">
      <p className="text-3xl mb-3">🚧</p>
      <p className="text-sm text-zinc-500">준비 중입니다</p>
      <p className="text-xs text-zinc-400 mt-1">이 기능은 향후 업데이트에서 제공됩니다</p>
    </div>
  )
}

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
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">개인 API Key</h3>
          <button
            onClick={() => { setShowForm(!showForm); setFormCredentials({}) }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showForm ? '취소' : '+ 새 키 등록'}
          </button>
        </div>

        {showForm && (
          <div className="mb-4 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">서비스</label>
              <select
                value={formProvider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p} value={p}>{PROVIDER_LABELS[p] || p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">라벨 (선택)</label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="예: 내 KIS 계정"
                className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
              />
            </div>
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-zinc-500 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={formCredentials[f.key] || ''}
                  onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  placeholder={`${f.label} 입력`}
                  className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </div>
            ))}
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              <span>🔒</span> 모든 키는 서버에서 암호화되어 저장됩니다
            </p>
            <button
              onClick={handleRegister}
              disabled={!allFieldsFilled || registerKey.isPending}
              className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {registerKey.isPending ? '등록 중...' : '등록'}
            </button>
          </div>
        )}

        <div className="space-y-2">
          {keysLoading ? (
            <div className="text-center py-6 text-sm text-zinc-400">불러오는 중...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-6 text-sm text-zinc-400">
              등록된 API key가 없습니다
            </div>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-3 rounded-md border border-zinc-200 dark:border-zinc-800"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {PROVIDER_LABELS[key.provider] || key.provider}
                    </span>
                    <Badge variant="success">연동됨</Badge>
                  </div>
                  {key.label && (
                    <p className="text-xs text-zinc-400 mt-0.5">{key.label}</p>
                  )}
                  <p className="text-[10px] text-zinc-400">
                    {new Date(key.createdAt).toLocaleDateString('ko-KR')} 등록
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('이 API key를 삭제하시겠습니까?')) {
                      deleteKey.mutate(key.id)
                    }
                  }}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  삭제
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">서비스 연동 안내</h3>
        <div className="space-y-2 text-xs text-zinc-500">
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800">
            <span className="font-medium">KIS 증권</span> — 한국투자증권 API key를 등록하면 에이전트가 매매 현황을 조회할 수 있습니다.
          </div>
          <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800">
            <span className="font-medium">노션</span> — 노션 API key를 등록하면 노션 연동 도구를 사용할 수 있습니다.
          </div>
        </div>
      </section>
    </div>
  )
}

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
    <section>
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">텔레그램 연동</h3>
      {config?.isActive ? (
        <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">연동됨</span>
            <span className="text-xs text-zinc-500">Chat ID: {config.ceoChatId || '미설정'}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => testMessage.mutate()} disabled={testMessage.isPending}
              className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50">
              {testMessage.isPending ? '전송 중...' : '테스트 메시지'}
            </button>
            <button onClick={() => disconnect.mutate()}
              className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
              연결 해제
            </button>
          </div>
          {testMessage.isSuccess && <p className="text-xs text-green-600">테스트 메시지 전송 성공!</p>}
          {testMessage.isError && <p className="text-xs text-red-600">전송 실패: {(testMessage.error as Error).message}</p>}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3">
          <input type="password" value={botToken} onChange={(e) => setBotToken(e.target.value)}
            placeholder="봇 토큰 (@BotFather에서 발급)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
          <input value={ceoChatId} onChange={(e) => setCeoChatId(e.target.value)}
            placeholder="CEO 채팅 ID (선택)" className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm" />
          <button onClick={() => saveConfig.mutate()} disabled={!botToken || saveConfig.isPending}
            className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50">
            {saveConfig.isPending ? '검증 중...' : '연동하기'}
          </button>
          {saveConfig.isError && <p className="text-xs text-red-600">{(saveConfig.error as Error).message}</p>}
        </div>
      )}
    </section>
  )
}

function AgentSoulSection() {
  const queryClient = useQueryClient()
  const [selectedAgent, setSelectedAgent] = useState<string>('')
  const [soulText, setSoulText] = useState('')

  const { data: agentsData } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<{ data: { id: string; name: string }[] }>('/workspace/agents'),
  })

  const { data: agentDetail } = useQuery({
    queryKey: ['agent-detail', selectedAgent],
    queryFn: () => api.get<{ data: AgentDetail }>(`/workspace/agents/${selectedAgent}`),
    enabled: !!selectedAgent,
  })

  const updateSoul = useMutation({
    mutationFn: () => api.patch(`/workspace/agents/${selectedAgent}/soul`, { soul: soulText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-detail', selectedAgent] })
    },
  })

  const agents = agentsData?.data || []

  // 에이전트 선택 시 소울 로드
  const detail = agentDetail?.data
  if (detail && soulText === '' && detail.soul) {
    setSoulText(detail.soul)
  }

  return (
    <section>
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">에이전트 소울 편집</h3>
      <div className="space-y-3">
        <select value={selectedAgent} onChange={(e) => { setSelectedAgent(e.target.value); setSoulText('') }}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm">
          <option value="">에이전트 선택</option>
          {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        {selectedAgent && detail && (
          <>
            <textarea value={soulText} onChange={(e) => setSoulText(e.target.value)}
              rows={8} placeholder="에이전트의 성격, 역할, 말투를 마크다운으로 정의..."
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm resize-none font-mono" />
            <button onClick={() => updateSoul.mutate()} disabled={!soulText.trim() || updateSoul.isPending}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50">
              {updateSoul.isPending ? '저장 중...' : '소울 저장'}
            </button>
            {updateSoul.isSuccess && <p className="text-xs text-green-600">저장 완료!</p>}
          </>
        )}
      </div>
    </section>
  )
}
