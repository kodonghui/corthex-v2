import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useAuthStore } from '../stores/auth-store'
import { useToastStore } from '../stores/toast-store'

type Agent = {
  id: string
  companyId: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  soul: string | null
  status: string
  departmentId: string | null
  isSecretary: boolean
  isSystem: boolean
  isActive: boolean
  allowedTools: string[]
  createdAt: string
}
type Department = { id: string; name: string }
type SoulTemplate = { id: string; name: string; content: string; isBuiltin: boolean }

const TIER_OPTIONS = [
  { value: 'manager', label: 'Manager', desc: '팀을 이끌고 결과를 종합', defaultModel: 'claude-sonnet-4-6' },
  { value: 'specialist', label: 'Specialist', desc: '전문 분야 분석', defaultModel: 'claude-haiku-4-5' },
  { value: 'worker', label: 'Worker', desc: '반복 작업 수행', defaultModel: 'gemini-2.5-flash' },
] as const

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
]

const STATUS_LABELS: Record<string, string> = {
  online: '유휴',
  working: '작업중',
  error: '에러',
  offline: '오프라인',
}

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  working: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  offline: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
}

const TIER_LABELS: Record<string, string> = {
  manager: 'Manager',
  specialist: 'Specialist',
  worker: 'Worker',
}

const inputCls = 'w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none'
const selectCls = inputCls

/** Lightweight markdown -> HTML for Soul preview */
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-zinc-100 dark:bg-zinc-800 rounded p-2 text-xs overflow-x-auto my-2"><code>$2</code></pre>')
    // inline code
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-xs">$1</code>')
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>')
    // bold & italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // unordered list
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
    // line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

type CreateForm = {
  name: string
  role: string
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  departmentId: string
  soul: string
}

const defaultCreateForm: CreateForm = {
  name: '',
  role: '',
  tier: 'specialist',
  modelName: 'claude-haiku-4-5',
  departmentId: '',
  soul: '',
}

type DetailTab = 'info' | 'soul' | 'tools'

export function AgentsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const authUser = useAuthStore((s) => s.user)
  const addToast = useToastStore((s) => s.addToast)

  // UI states
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateForm>({ ...defaultCreateForm })
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('info')
  const [editForm, setEditForm] = useState<Partial<Agent>>({})
  const [deactivateTarget, setDeactivateTarget] = useState<Agent | null>(null)

  // Filters
  const [filterDept, setFilterDept] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  // Queries
  const { data: agentData, isLoading } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: templateData } = useQuery({
    queryKey: ['soul-templates', selectedCompanyId],
    queryFn: () => api.get<{ data: SoulTemplate[] }>(`/admin/soul-templates?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const agents = agentData?.data || []
  const depts = deptData?.data || []
  const soulTemplates = templateData?.data || []
  const deptMap = new Map(depts.map((d) => [d.id, d.name]))

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (filterDept && a.departmentId !== filterDept) return false
      if (filterTier && a.tier !== filterTier) return false
      if (filterStatus && a.status !== filterStatus) return false
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [agents, filterDept, filterTier, filterStatus, search])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/agents', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      setShowCreate(false)
      setForm({ ...defaultCreateForm })
      addToast({ type: 'success', message: '에이전트가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>): Promise<{ data: Agent } | undefined> =>
      api.patch(`/admin/agents/${id}`, body) as Promise<{ data: Agent } | undefined>,
    onSuccess: (result: { data: Agent } | undefined, variables) => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      // Refresh selected agent with server response (includes server-side effects like adminSoul sync)
      if (selectedAgent && selectedAgent.id === variables.id) {
        setSelectedAgent(result?.data ? result.data : { ...selectedAgent, ...variables } as Agent)
      }
      addToast({ type: 'success', message: '에이전트가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/agents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      setDeactivateTarget(null)
      setSelectedAgent(null)
      addToast({ type: 'success', message: '에이전트가 비활성화되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  function handleTierChange(tier: 'manager' | 'specialist' | 'worker') {
    const tierOpt = TIER_OPTIONS.find((t) => t.value === tier)
    setForm({ ...form, tier, modelName: tierOpt?.defaultModel || 'claude-haiku-4-5' })
  }

  function openDetail(agent: Agent) {
    setSelectedAgent(agent)
    setEditForm({
      name: agent.name,
      role: agent.role,
      tier: agent.tier,
      modelName: agent.modelName,
      departmentId: agent.departmentId,
      soul: agent.soul,
    })
    setDetailTab('info')
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!authUser) return
    createMutation.mutate({
      userId: authUser.id,
      name: form.name,
      role: form.role || undefined,
      tier: form.tier,
      modelName: form.modelName,
      ...(form.departmentId ? { departmentId: form.departmentId } : {}),
      ...(form.soul ? { soul: form.soul } : {}),
    })
  }

  function handleSaveInfo() {
    if (!selectedAgent) return
    updateMutation.mutate({
      id: selectedAgent.id,
      name: editForm.name,
      role: editForm.role,
      tier: editForm.tier,
      modelName: editForm.modelName,
      departmentId: editForm.departmentId ?? null,
    })
  }

  function handleSaveSoul() {
    if (!selectedAgent) return
    updateMutation.mutate({
      id: selectedAgent.id,
      soul: editForm.soul ?? null,
    })
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">에이전트 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{agents.length}개 에이전트{filteredAgents.length !== agents.length ? ` (${filteredAgents.length}개 표시)` : ''}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 새 AI 직원 추가
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="에이전트 검색..."
          className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none w-48"
        />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          <option value="">모든 부서</option>
          {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          <option value="">모든 계급</option>
          <option value="manager">Manager</option>
          <option value="specialist">Specialist</option>
          <option value="worker">Worker</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
          <option value="">모든 상태</option>
          <option value="online">유휴</option>
          <option value="working">작업중</option>
          <option value="error">에러</option>
          <option value="offline">오프라인</option>
        </select>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 AI 직원</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름 *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls}
                  placeholder="예: 마케팅 매니저"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">역할</label>
                <input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputCls}
                  placeholder="예: SNS 콘텐츠 제작"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">계급</label>
                <select value={form.tier} onChange={(e) => handleTierChange(e.target.value as 'manager' | 'specialist' | 'worker')} className={selectCls}>
                  {TIER_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">LLM 모델</label>
                <select value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })} className={selectCls}>
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">소속 부서</label>
                <select value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={selectCls}>
                  <option value="">미배정</option>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">Soul (성격/페르소나)</label>
              {soulTemplates.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    const tpl = soulTemplates.find((t) => t.id === e.target.value)
                    if (tpl) setForm({ ...form, soul: tpl.content })
                  }}
                  className="w-full px-3 py-1.5 mb-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">템플릿 불러오기...</option>
                  {soulTemplates.map((t) => (
                    <option key={t.id} value={t.id}>{t.isBuiltin ? '[기본] ' : ''}{t.name}</option>
                  ))}
                </select>
              )}
              <textarea
                value={form.soul}
                onChange={(e) => setForm({ ...form, soul: e.target.value })}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="에이전트의 성격과 행동 방식을 정의합니다..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowCreate(false); setForm({ ...defaultCreateForm }) }}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '만들기'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agent Table */}
      {isLoading ? (
        <div className="text-center text-zinc-500 py-8">로딩 중...</div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 mb-4">{agents.length === 0 ? '등록된 에이전트가 없습니다' : '필터 조건에 맞는 에이전트가 없습니다'}</p>
          {agents.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              + 새 AI 직원 추가
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">이름</th>
                <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">계급</th>
                <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">모델</th>
                <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">부서</th>
                <th className="text-center text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">상태</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredAgents.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  onClick={() => openDetail(a)}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {a.isSystem && (
                        <span title="오케스트레이션에 필수인 에이전트입니다" className="text-amber-500 flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                        </span>
                      )}
                      <div>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.name}</span>
                        {a.role && <p className="text-xs text-zinc-500">{a.role}</p>}
                      </div>
                      {a.isSystem && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                          시스템
                        </span>
                      )}
                      {!a.isActive && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-500">
                          비활성
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{TIER_LABELS[a.tier] || a.tier}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs text-zinc-500">{a.modelName}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      {a.departmentId ? deptMap.get(a.departmentId) || '-' : '미배정'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status] || STATUS_COLORS.offline}`}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openDetail(a)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-medium mr-3"
                    >
                      편집
                    </button>
                    {a.isActive && !a.isSystem && (
                      <button
                        onClick={() => setDeactivateTarget(a)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        비활성화
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Panel Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50" onClick={() => setSelectedAgent(null)}>
          <div
            className="bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700 shadow-xl h-full w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{selectedAgent.name}</h2>
                {selectedAgent.isSystem && (
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    시스템 에이전트
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedAgent(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* System agent warning */}
            {selectedAgent.isSystem && (
              <div className="mx-6 mt-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  이 에이전트는 오케스트레이션에 필수입니다. 삭제할 수 없습니다.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 mt-2">
              {([
                { key: 'info' as const, label: '기본 정보' },
                { key: 'soul' as const, label: 'Soul 편집' },
                { key: 'tools' as const, label: '도구 권한' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDetailTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    detailTab === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="px-6 py-5">
              {/* Info Tab */}
              {detailTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름</label>
                    <input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">역할</label>
                    <input
                      value={editForm.role || ''}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className={inputCls}
                      placeholder="예: SNS 콘텐츠 제작"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">계급</label>
                      <select
                        value={editForm.tier || 'specialist'}
                        onChange={(e) => {
                          const tier = e.target.value as 'manager' | 'specialist' | 'worker'
                          const tierOpt = TIER_OPTIONS.find((t) => t.value === tier)
                          setEditForm({ ...editForm, tier, modelName: tierOpt?.defaultModel || editForm.modelName })
                        }}
                        className={selectCls}
                      >
                        {TIER_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">LLM 모델</label>
                      <select value={editForm.modelName || ''} onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })} className={selectCls}>
                        {MODEL_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">소속 부서</label>
                    <select
                      value={editForm.departmentId || ''}
                      onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value || null })}
                      className={selectCls}
                    >
                      <option value="">미배정</option>
                      {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={handleSaveInfo}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {updateMutation.isPending ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              )}

              {/* Soul Tab */}
              {detailTab === 'soul' && (
                <div className="space-y-4">
                  {soulTemplates.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        const tpl = soulTemplates.find((t) => t.id === e.target.value)
                        if (tpl) setEditForm({ ...editForm, soul: tpl.content })
                      }}
                      className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="">템플릿 불러오기...</option>
                      {soulTemplates.map((t) => (
                        <option key={t.id} value={t.id}>{t.isBuiltin ? '[기본] ' : ''}{t.name}</option>
                      ))}
                    </select>
                  )}
                  <div className="grid grid-cols-2 gap-4" style={{ minHeight: '400px' }}>
                    {/* Editor */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">에디터</label>
                      <textarea
                        value={editForm.soul || ''}
                        onChange={(e) => setEditForm({ ...editForm, soul: e.target.value })}
                        className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-mono"
                        placeholder="# 에이전트 Soul&#10;&#10;이 에이전트의 성격, 역할, 전문 분야를 정의합니다..."
                      />
                    </div>
                    {/* Preview */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">미리보기</label>
                      <div
                        className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 overflow-y-auto prose-sm"
                        dangerouslySetInnerHTML={{ __html: editForm.soul ? renderMarkdown(editForm.soul) : '<p class="text-zinc-400 text-sm">Soul 마크다운을 입력하면 미리보기가 표시됩니다...</p>' }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                      onClick={handleSaveSoul}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {updateMutation.isPending ? '저장 중...' : 'Soul 저장'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tools Tab */}
              {detailTab === 'tools' && (
                <div className="space-y-4">
                  <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <p className="text-sm text-zinc-500">
                      도구 관리 기능은 준비 중입니다. (Epic 4에서 구현 예정)
                    </p>
                  </div>
                  {selectedAgent.allowedTools && selectedAgent.allowedTools.length > 0 ? (
                    <div>
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2 block">현재 허용 도구</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.allowedTools.map((tool) => (
                          <span key={tool} className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">허용된 도구가 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* Panel Footer -- Deactivate */}
            {!selectedAgent.isSystem && selectedAgent.isActive && (
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setDeactivateTarget(selectedAgent)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  이 에이전트 비활성화
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setDeactivateTarget(null)}>
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">에이전트 비활성화</h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                <strong>&quot;{deactivateTarget.name}&quot;</strong> 에이전트를 비활성화하시겠습니까?
              </p>
              <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-xs text-zinc-500 space-y-1">
                <p>* 에이전트가 미배속으로 전환됩니다</p>
                <p>* 메모리/학습 기록이 아카이브됩니다</p>
                <p>* 비용 기록은 영구 보존됩니다</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                취소
              </button>
              <button
                onClick={() => deactivateMutation.mutate(deactivateTarget.id)}
                disabled={deactivateMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {deactivateMutation.isPending ? '처리 중...' : '비활성화'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
