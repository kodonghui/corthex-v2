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

const STATUS_COLORS: Record<string, { dot: string; pill: string }> = {
  online: { dot: 'bg-emerald-400 animate-pulse', pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  working: { dot: 'bg-blue-400 animate-pulse', pill: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  error: { dot: 'bg-red-400', pill: 'bg-red-500/10 text-red-400 border-red-500/20' },
  offline: { dot: 'bg-slate-500', pill: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
}

const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  manager: { label: 'Manager', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  specialist: { label: 'Specialist', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  worker: { label: 'Worker', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
}

const inputCls = 'w-full px-3 py-2.5 border border-slate-600/80 rounded-xl bg-slate-800/80 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-500'
const selectCls = inputCls

/** Lightweight markdown -> HTML for Soul preview */
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-800 rounded p-2 text-xs overflow-x-auto my-2"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-sm">$1</li>')
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

  if (!selectedCompanyId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
          </svg>
        </div>
        <p className="text-sm text-slate-500 font-medium">회사를 선택하세요</p>
      </div>
    )
  }

  const filterCls = 'px-3 py-2 border border-slate-600/60 rounded-xl bg-slate-800/80 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all'

  return (
    <div data-testid="agents-page" className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      <div className="px-8 py-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="agents-title" className="text-3xl font-black tracking-tight text-white">에이전트 관리</h1>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-mono text-slate-300">{agents.length}</span>개 에이전트
              {filteredAgents.length !== agents.length && (
                <span className="text-slate-600"> (필터: <span className="font-mono text-slate-400">{filteredAgents.length}</span>개)</span>
              )}
            </p>
          </div>
          <button
            data-testid="agents-create-btn"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            새 AI 직원
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              data-testid="agents-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="에이전트 검색..."
              className={`${filterCls} w-52 pl-9`}
            />
          </div>
          <select data-testid="agents-filter-dept" value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className={filterCls}>
            <option value="">모든 부서</option>
            {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select data-testid="agents-filter-tier" value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className={filterCls}>
            <option value="">모든 계급</option>
            <option value="manager">Manager</option>
            <option value="specialist">Specialist</option>
            <option value="worker">Worker</option>
          </select>
          <select data-testid="agents-filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={filterCls}>
            <option value="">모든 상태</option>
            <option value="online">유휴</option>
            <option value="working">작업중</option>
            <option value="error">에러</option>
            <option value="offline">오프라인</option>
          </select>
        </div>

        {/* ── Create Form ── */}
        {showCreate && (
          <div data-testid="agents-create-form" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/10 via-slate-800/90 to-slate-800/90 border border-blue-500/20 p-6 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                새 AI 직원
              </h3>
              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">이름 *</label>
                    <input
                      data-testid="agents-create-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                      placeholder="예: 마케팅 매니저"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">역할</label>
                    <input
                      data-testid="agents-create-role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className={inputCls}
                      placeholder="예: SNS 콘텐츠 제작"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">계급</label>
                    <select data-testid="agents-create-tier" value={form.tier} onChange={(e) => handleTierChange(e.target.value as 'manager' | 'specialist' | 'worker')} className={selectCls}>
                      {TIER_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">LLM 모델</label>
                    <select data-testid="agents-create-model" value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })} className={selectCls}>
                      {MODEL_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">소속 부서</label>
                    <select data-testid="agents-create-dept" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={selectCls}>
                      <option value="">미배정</option>
                      {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Soul (성격/페르소나)</label>
                  {soulTemplates.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        const tpl = soulTemplates.find((t) => t.id === e.target.value)
                        if (tpl) setForm({ ...form, soul: tpl.content })
                      }}
                      className="w-full px-3 py-1.5 mb-2 border border-slate-600/60 rounded-xl bg-slate-800/80 text-xs text-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                    >
                      <option value="">템플릿 불러오기...</option>
                      {soulTemplates.map((t) => (
                        <option key={t.id} value={t.id}>{t.isBuiltin ? '[기본] ' : ''}{t.name}</option>
                      ))}
                    </select>
                  )}
                  <textarea
                    data-testid="agents-create-soul"
                    value={form.soul}
                    onChange={(e) => setForm({ ...form, soul: e.target.value })}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="에이전트의 성격과 행동 방식을 정의합니다..."
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    data-testid="agents-create-cancel"
                    type="button"
                    onClick={() => { setShowCreate(false); setForm({ ...defaultCreateForm }) }}
                    className="px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/60 transition-all"
                  >
                    취소
                  </button>
                  <button
                    data-testid="agents-create-submit"
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                  >
                    {createMutation.isPending ? '생성 중...' : '만들기'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Agent Table ── */}
        {isLoading ? (
          <div data-testid="agents-loading" className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-slate-700/50 animate-pulse rounded" />
                  <div className="h-3 w-48 bg-slate-700/30 animate-pulse rounded" />
                </div>
                <div className="h-6 w-20 bg-slate-700/30 animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div data-testid="agents-empty-state" className="rounded-2xl bg-slate-800/30 border border-slate-700/40 p-16 text-center backdrop-blur-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-400 font-medium">
              {agents.length === 0 ? '등록된 에이전트가 없습니다' : '필터 조건에 맞는 에이전트가 없습니다'}
            </p>
            {agents.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
              >
                + 새 AI 직원 추가
              </button>
            )}
          </div>
        ) : (
          <div data-testid="agents-table" className="rounded-2xl bg-slate-800/40 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">이름</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">계급</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">모델</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">부서</th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 py-4">상태</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredAgents.map((a) => {
                  const sCfg = STATUS_COLORS[a.status] || STATUS_COLORS.offline
                  const tCfg = TIER_CONFIG[a.tier] || TIER_CONFIG.worker
                  return (
                    <tr
                      key={a.id}
                      data-testid={`agents-row-${a.id}`}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      onClick={() => openDetail(a)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            a.isSystem ? 'bg-amber-500/15' : 'bg-cyan-500/15'
                          }`}>
                            {a.isSystem ? (
                              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            ) : (
                              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div data-testid={`agents-name-${a.id}`}>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">{a.name}</span>
                              {a.isSystem && (
                                <span data-testid={`agents-system-badge-${a.id}`} className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                  시스템
                                </span>
                              )}
                              {!a.isActive && (
                                <span data-testid={`agents-inactive-badge-${a.id}`} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700/60 text-slate-500 font-medium">
                                  비활성
                                </span>
                              )}
                            </div>
                            {a.role && <p className="text-xs text-slate-500 mt-0.5">{a.role}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${tCfg.color}`}>
                          {tCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs text-slate-400 font-mono">{a.modelName}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs text-slate-400">
                          {a.departmentId ? deptMap.get(a.departmentId) || '-' : '미배정'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span data-testid={`agents-status-${a.id}`} className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${sCfg.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />
                          {STATUS_LABELS[a.status] || a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          data-testid={`agents-edit-${a.id}`}
                          onClick={() => openDetail(a)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium mr-3 transition-colors"
                        >
                          편집
                        </button>
                        {a.isActive && !a.isSystem && (
                          <button
                            data-testid={`agents-deactivate-${a.id}`}
                            onClick={() => setDeactivateTarget(a)}
                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                          >
                            비활성화
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail Panel Modal ── */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAgent(null)}>
          <div
            data-testid="agents-detail-panel"
            className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l border-slate-700/60 shadow-2xl h-full w-full max-w-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedAgent.isSystem ? 'bg-amber-500/15' : 'bg-cyan-500/15'}`}>
                  {selectedAgent.isSystem ? (
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{selectedAgent.name}</h2>
                  {selectedAgent.isSystem && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      시스템 에이전트
                    </span>
                  )}
                </div>
              </div>
              <button data-testid="agents-detail-close" onClick={() => setSelectedAgent(null)} className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* System agent warning */}
            {selectedAgent.isSystem && (
              <div className="mx-6 mt-5 px-4 py-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-300/80">
                  이 에이전트는 오케스트레이션에 필수입니다. 삭제할 수 없습니다.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-700/60 px-6 mt-3">
              {([
                { key: 'info' as const, label: '기본 정보', testId: 'agents-tab-info' },
                { key: 'soul' as const, label: 'Soul 편집', testId: 'agents-tab-soul' },
                { key: 'tools' as const, label: '도구 권한', testId: 'agents-tab-tools' },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  data-testid={tab.testId}
                  onClick={() => setDetailTab(tab.key)}
                  className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-all ${
                    detailTab === tab.key
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="px-6 py-6">
              {/* Info Tab */}
              {detailTab === 'info' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">이름</label>
                    <input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">역할</label>
                    <input
                      value={editForm.role || ''}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className={inputCls}
                      placeholder="예: SNS 콘텐츠 제작"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">계급</label>
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
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">LLM 모델</label>
                      <select value={editForm.modelName || ''} onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })} className={selectCls}>
                        {MODEL_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">소속 부서</label>
                    <select
                      value={editForm.departmentId || ''}
                      onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value || null })}
                      className={selectCls}
                    >
                      <option value="">미배정</option>
                      {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3 justify-end pt-5 border-t border-slate-700/40">
                    <button
                      data-testid="agents-save-info"
                      onClick={handleSaveInfo}
                      disabled={updateMutation.isPending}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
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
                      data-testid="agents-soul-template"
                      value=""
                      onChange={(e) => {
                        const tpl = soulTemplates.find((t) => t.id === e.target.value)
                        if (tpl) setEditForm({ ...editForm, soul: tpl.content })
                      }}
                      className="w-full px-3 py-2 border border-slate-600/60 rounded-xl bg-slate-800/80 text-xs text-slate-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
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
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">에디터</label>
                      <textarea
                        data-testid="agents-soul-editor"
                        value={editForm.soul || ''}
                        onChange={(e) => setEditForm({ ...editForm, soul: e.target.value })}
                        className="flex-1 px-4 py-3 border border-slate-600/60 rounded-xl bg-slate-800/80 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:outline-none resize-none font-mono transition-all"
                        placeholder="# 에이전트 Soul&#10;&#10;이 에이전트의 성격, 역할, 전문 분야를 정의합니다..."
                      />
                    </div>
                    {/* Preview */}
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">미리보기</label>
                      <div
                        data-testid="agents-soul-preview"
                        className="flex-1 px-4 py-3 border border-slate-700/50 rounded-xl bg-slate-800/30 overflow-y-auto prose-sm backdrop-blur-sm"
                        dangerouslySetInnerHTML={{ __html: editForm.soul ? renderMarkdown(editForm.soul) : '<p class="text-slate-500 text-sm">Soul 마크다운을 입력하면 미리보기가 표시됩니다...</p>' }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end pt-5 border-t border-slate-700/40">
                    <button
                      data-testid="agents-save-soul"
                      onClick={handleSaveSoul}
                      disabled={updateMutation.isPending}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      {updateMutation.isPending ? '저장 중...' : 'Soul 저장'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tools Tab */}
              {detailTab === 'tools' && (
                <div className="space-y-4">
                  <div className="px-4 py-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl">
                    <p className="text-sm text-slate-500">
                      도구 관리 기능은 준비 중입니다. (Epic 4에서 구현 예정)
                    </p>
                  </div>
                  {selectedAgent.allowedTools && selectedAgent.allowedTools.length > 0 ? (
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3 block">현재 허용 도구</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAgent.allowedTools.map((tool) => (
                          <span key={tool} className="text-xs px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-400 font-mono">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">허용된 도구가 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* Panel Footer -- Deactivate */}
            {!selectedAgent.isSystem && selectedAgent.isActive && (
              <div className="px-6 py-5 border-t border-slate-700/40">
                <button
                  onClick={() => setDeactivateTarget(selectedAgent)}
                  className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                >
                  이 에이전트 비활성화
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Deactivate Confirmation Modal ── */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeactivateTarget(null)}>
          <div
            data-testid="agents-deactivate-modal"
            className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/60 shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-slate-700/40 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">에이전트 비활성화</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-300">
                <strong className="text-white">&quot;{deactivateTarget.name}&quot;</strong> 에이전트를 비활성화하시겠습니까?
              </p>
              <div className="bg-slate-800/60 rounded-xl p-4 text-xs text-slate-400 space-y-1.5 border border-slate-700/40">
                <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600" /> 에이전트가 미배속으로 전환됩니다</p>
                <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600" /> 메모리/학습 기록이 아카이브됩니다</p>
                <p className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-slate-600" /> 비용 기록은 영구 보존됩니다</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-700/40">
              <button
                data-testid="agents-deactivate-cancel"
                onClick={() => setDeactivateTarget(null)}
                className="px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/60 transition-all"
              >
                취소
              </button>
              <button
                data-testid="agents-deactivate-confirm"
                onClick={() => deactivateMutation.mutate(deactivateTarget.id)}
                disabled={deactivateMutation.isPending}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-red-500/20"
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
