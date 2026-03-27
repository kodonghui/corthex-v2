/**
 * Agent Management — Stitch Design
 *
 * API Endpoints:
 *   GET    /api/admin/agents?companyId=...
 *   GET    /api/admin/agents/:id?companyId=...
 *   POST   /api/admin/agents
 *   PATCH  /api/admin/agents/:id
 *   DELETE /api/admin/agents/:id
 *   GET    /api/admin/departments?companyId=...
 *   GET    /api/admin/soul-templates?companyId=...
 */
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useAuthStore } from '../stores/auth-store'
import { useToastStore } from '../stores/toast-store'
import { Bot, Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react'

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
  enableSemanticCache: boolean
  createdAt: string
}

type AgentDetail = Agent & {
  semanticCacheRecommendation: 'safe' | 'warning' | 'none'
}
type Department = { id: string; name: string }
type SoulTemplate = { id: string; name: string; content: string; isBuiltin: boolean }

const TIER_OPTIONS = [
  { value: 'manager', label: 'Manager', desc: '팀을 이끌고 결과를 종합', defaultModel: 'claude-sonnet-4-6' },
  { value: 'specialist', label: 'Specialist', desc: '전문 분야 분석', defaultModel: 'claude-haiku-4-5' },
  { value: 'worker', label: 'Worker', desc: '반복 작업 수행', defaultModel: 'claude-haiku-4-5' },
] as const

const MODEL_OPTIONS = [
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
]

const STATUS_LABELS: Record<string, string> = {
  online: '유휴',
  working: '작업중',
  error: '에러',
  offline: '오프라인',
}

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  working: 'bg-corthex-accent animate-pulse',
  error: 'bg-red-400',
  offline: 'bg-corthex-surface',
}

const TIER_BADGE: Record<string, string> = {
  manager: 'bg-amber-100 text-amber-800 border-amber-200',
  specialist: 'bg-corthex-accent-deep/10 text-corthex-accent-deep border-corthex-accent-deep/20',
  worker: 'bg-corthex-elevated text-corthex-text-primary border-corthex-border',
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

type DetailTab = 'soul' | 'config' | 'memory'

const inputCls = 'w-full border-corthex-border rounded-lg focus:ring-corthex-accent focus:border-corthex-accent py-2 text-sm'
const selectCls = inputCls

export function AgentsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const authUser = useAuthStore((s) => s.user)
  const addToast = useToastStore((s) => s.addToast)

  // UI states
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState<CreateForm>({ ...defaultCreateForm })
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [detailTab, setDetailTab] = useState<DetailTab>('soul')
  const [editForm, setEditForm] = useState<Partial<Agent>>({})
  const [deactivateTarget, setDeactivateTarget] = useState<Agent | null>(null)
  const [activeSessionCount, setActiveSessionCount] = useState<number | null>(null)
  const [forceDeactivate, setForceDeactivate] = useState(false)
  const [showCacheDisableModal, setShowCacheDisableModal] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [filterTier, setFilterTier] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

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

  const { data: agentDetailData } = useQuery({
    queryKey: ['agent-detail', selectedCompanyId, selectedAgent?.id],
    queryFn: () => api.get<{ data: AgentDetail }>(`/admin/agents/${selectedAgent!.id}?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId && !!selectedAgent,
  })
  const agentDetail = agentDetailData?.data

  const agents = agentData?.data || []
  const depts = deptData?.data || []
  const soulTemplates = templateData?.data || []

  // Filtered agents
  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterTier && a.tier !== filterTier) return false
      if (filterStatus && a.status !== filterStatus) return false
      return true
    })
  }, [agents, search, filterTier, filterStatus])

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
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      api.delete(`/admin/agents/${id}${force ? '?force=true' : ''}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      setDeactivateTarget(null)
      setSelectedAgent(null)
      setActiveSessionCount(null)
      setForceDeactivate(false)
      addToast({ type: 'success', message: '에이전트가 비활성화되었습니다' })
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.code === 'AGENT_ACTIVE_SESSIONS' && err.data?.activeTaskCount) {
        setActiveSessionCount(Number(err.data.activeTaskCount))
        return
      }
      addToast({ type: 'error', message: err.message })
    },
  })

  function openDeactivateModal(agent: Agent) {
    setDeactivateTarget(agent)
    setActiveSessionCount(null)
    setForceDeactivate(false)
  }

  function handleDeactivateConfirm() {
    if (!deactivateTarget) return
    deactivateMutation.mutate({ id: deactivateTarget.id, force: forceDeactivate })
  }

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
      enableSemanticCache: agent.enableSemanticCache ?? false,
    })
    setDetailTab('soul')
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!authUser) return
    createMutation.mutate({
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
      enableSemanticCache: editForm.enableSemanticCache,
    })
  }

  function handleCacheToggle(newValue: boolean) {
    if (!newValue && editForm.enableSemanticCache) {
      setShowCacheDisableModal(true)
    } else {
      setEditForm({ ...editForm, enableSemanticCache: true })
      if (selectedAgent) {
        updateMutation.mutate({ id: selectedAgent.id, enableSemanticCache: true })
      }
    }
  }

  function confirmCacheDisable() {
    setShowCacheDisableModal(false)
    setEditForm({ ...editForm, enableSemanticCache: false })
    if (selectedAgent) {
      updateMutation.mutate({ id: selectedAgent.id, enableSemanticCache: false })
    }
  }

  function handleSaveSoul() {
    if (!selectedAgent) return
    updateMutation.mutate({
      id: selectedAgent.id,
      soul: editForm.soul ?? null,
    })
  }

  const charCount = (editForm.soul || '').length

  if (!selectedCompanyId) {
    return (
      <div className="flex items-center justify-center h-64 bg-corthex-bg">
        <p className="font-mono text-xs uppercase tracking-widest text-corthex-text-disabled">회사를 선택하세요</p>
      </div>
    )
  }

  const onlineCount = agents.filter(a => a.status === 'online' || a.status === 'working').length
  const errorCount = agents.filter(a => a.status === 'error' || !a.isActive).length

  return (
    <div data-testid="agents-page" className="flex h-screen overflow-hidden bg-corthex-bg">
      {/* MAIN TABLE AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

          {/* SUMMARY STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-corthex-surface border-l-4 p-6 flex flex-col justify-between relative group overflow-hidden"
              style={{ borderLeftColor: 'var(--color-corthex-accent)' }}>
              <div className="font-mono text-[10px] tracking-widest text-corthex-text-disabled mb-2 uppercase">TOTAL_AGENTS</div>
              <div className="text-4xl font-black font-mono tracking-tighter text-corthex-text-primary">{agents.length}</div>
              <div className="absolute right-[-10px] bottom-[-10px] opacity-5 group-hover:opacity-10 transition-opacity">
                <Bot className="w-20 h-20" />
              </div>
            </div>
            <div className="bg-corthex-surface border-l-4 p-6 flex flex-col justify-between"
              style={{ borderLeftColor: 'var(--color-corthex-success)' }}>
              <div className="font-mono text-[10px] tracking-widest text-corthex-text-disabled mb-2 uppercase">ONLINE_AGENTS</div>
              <div className="text-4xl font-black font-mono tracking-tighter" style={{ color: 'var(--color-corthex-success)' }}>{onlineCount}</div>
              <div className="font-mono text-[10px] mt-2" style={{ color: 'var(--color-corthex-success)' }}>ACTIVE_IN_NETWORK</div>
            </div>
            <div className="bg-corthex-surface border-l-4 p-6 flex flex-col justify-between"
              style={{ borderLeftColor: errorCount > 0 ? 'var(--color-corthex-error)' : 'var(--color-corthex-accent)' }}>
              <div className="font-mono text-[10px] tracking-widest text-corthex-text-disabled mb-2 uppercase">ERROR / INACTIVE</div>
              <div className="flex items-end gap-3">
                <div className="text-4xl font-black font-mono tracking-tighter text-corthex-text-primary">{errorCount}</div>
                {errorCount > 0 && <div className="h-8 w-1 mb-1 animate-pulse" style={{ backgroundColor: 'var(--color-corthex-error)' }} />}
              </div>
              <div className="font-mono text-[10px] mt-2 text-corthex-text-disabled uppercase">
                {errorCount === 0 ? 'ALL_SYSTEMS_NOMINAL' : 'ATTENTION_REQUIRED'}
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <div className="bg-corthex-surface border border-corthex-border p-4 flex flex-wrap gap-3 sm:gap-4 items-end">
            <div className="flex-1 min-w-0 sm:min-w-[200px]">
              <label className="block font-mono text-[9px] tracking-widest text-corthex-text-disabled mb-1 uppercase">Search_Registry</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-corthex-text-disabled" />
                <input
                  data-testid="agents-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-corthex-bg border border-corthex-border pl-8 pr-3 py-2 text-base sm:text-xs font-mono text-corthex-text-primary placeholder:text-corthex-text-disabled focus:outline-none focus:border-corthex-accent"
                  placeholder="AGENT_NAME..."
                  type="text"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="block font-mono text-[9px] tracking-widest text-corthex-text-disabled mb-1 uppercase">Filter_Tier</label>
              <select data-testid="agents-filter-tier" value={filterTier} onChange={(e) => setFilterTier(e.target.value)} className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-xs font-mono py-2 px-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                <option value="">ALL_TIERS</option>
                <option value="manager">MANAGER</option>
                <option value="specialist">SPECIALIST</option>
                <option value="worker">WORKER</option>
              </select>
            </div>
            <div className="w-full sm:w-48">
              <label className="block font-mono text-[9px] tracking-widest text-corthex-text-disabled mb-1 uppercase">Filter_Status</label>
              <select data-testid="agents-filter-status" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full bg-corthex-bg border border-corthex-border text-base sm:text-xs font-mono py-2 px-2 text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                <option value="">ALL_STATES</option>
                <option value="online">ONLINE</option>
                <option value="working">WORKING</option>
                <option value="offline">OFFLINE</option>
                <option value="error">ERROR</option>
              </select>
            </div>
            <button
              data-testid="agents-create-btn"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-6 py-2 font-mono text-[10px] tracking-widest uppercase font-bold min-h-[44px]"
              style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}
            >
              <Plus className="w-3 h-3" />
              NEW_AGENT
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-corthex-surface border border-corthex-border overflow-x-auto" data-testid="agents-table">
            {isLoading ? (
              <div data-testid="agents-loading" className="p-8 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-corthex-elevated animate-pulse" />)}
              </div>
            ) : filteredAgents.length === 0 ? (
              <div data-testid="agents-empty-state" className="p-12 text-center font-mono text-xs uppercase tracking-widest text-corthex-text-disabled">
                {agents.length === 0 ? 'NO_AGENTS_REGISTERED' : 'NO_AGENTS_MATCH_FILTER'}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-corthex-elevated font-mono text-[10px] tracking-widest uppercase text-corthex-text-disabled">
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal">Agent_Identity</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal hidden sm:table-cell">Role</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal hidden md:table-cell">Core_Model</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal text-center hidden sm:table-cell">Protocol_Tier</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal">Status</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredAgents.map((a) => {
                    const isSelected = selectedAgent?.id === a.id
                    const statusDotColor =
                      a.status === 'online' ? 'var(--color-corthex-success)' :
                      a.status === 'working' ? 'var(--color-corthex-accent)' :
                      a.status === 'error' ? 'var(--color-corthex-error)' :
                      'var(--color-corthex-text-disabled)'
                    const tierColor =
                      a.tier === 'manager' ? 'var(--color-corthex-accent)' :
                      a.tier === 'specialist' ? 'var(--color-corthex-info)' :
                      'var(--color-corthex-text-secondary)'

                    return (
                      <tr
                        key={a.id}
                        data-testid={`agents-row-${a.id}`}
                        onClick={() => openDetail(a)}
                        className="border-b border-corthex-border hover:bg-corthex-elevated transition-colors cursor-pointer"
                        style={isSelected ? { backgroundColor: 'var(--color-corthex-elevated)' } : {}}
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-corthex-elevated border border-corthex-border flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" style={{ color: 'var(--color-corthex-accent)' }} />
                            </div>
                            <div>
                              <div data-testid={`agents-name-${a.id}`} className="font-bold tracking-tight text-corthex-text-primary">
                                {a.name}
                                {a.isSystem && <span data-testid={`agents-system-badge-${a.id}`} className="ml-2 font-mono text-[10px]" style={{ color: 'var(--color-corthex-accent)' }}>[SYS]</span>}
                                {!a.isActive && <span data-testid={`agents-inactive-badge-${a.id}`} className="ml-2 font-mono text-[10px] text-corthex-text-disabled">[OFF]</span>}
                              </div>
                              <div className="font-mono text-[10px] text-corthex-text-disabled">ID: {a.id.slice(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                          <span className="font-mono text-[11px] text-corthex-text-secondary">{a.role || '—'}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                          <span className="font-mono text-[11px] bg-corthex-elevated border border-corthex-border px-2 py-1 text-corthex-text-secondary">
                            {a.modelName}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-center hidden sm:table-cell">
                          <span className="font-mono text-[10px] font-bold border px-2 py-0.5 uppercase"
                            style={{ borderColor: tierColor, color: tierColor }}>
                            {a.tier.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5" style={{ backgroundColor: statusDotColor }} />
                            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: statusDotColor }}>
                              {STATUS_LABELS[a.status] || a.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); openDetail(a) }}
                            className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled hover:text-corthex-text-primary transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-corthex-surface border border-corthex-border px-4 sm:px-6 py-4">
            <div className="font-mono text-[10px] tracking-widest text-corthex-text-disabled uppercase">
              SHOWING {filteredAgents.length} OF {agents.length} AGENTS
            </div>
            <div className="flex gap-2">
              <button className="bg-corthex-elevated min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-corthex-border transition-all text-corthex-text-secondary">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="min-w-[44px] min-h-[44px] flex items-center justify-center font-mono text-[10px]"
                style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}>01</button>
              <button className="bg-corthex-elevated min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-corthex-border transition-all text-corthex-text-secondary">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL SIDE PANEL */}
      {selectedAgent && (
        <section
          data-testid="agents-detail-panel"
          className="fixed inset-0 z-40 sm:static sm:inset-auto sm:z-auto w-full sm:w-96 shrink-0 border-l border-corthex-border flex flex-col overflow-hidden bg-corthex-surface"
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-corthex-border bg-corthex-elevated">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-corthex-surface border border-corthex-border flex items-center justify-center">
                <Bot className="w-4 h-4" style={{ color: 'var(--color-corthex-accent)' }} />
              </div>
              <div>
                <div className="font-mono text-xs font-bold text-corthex-text-primary uppercase tracking-widest">
                  {selectedAgent.name}
                </div>
                <div className="font-mono text-[10px] text-corthex-text-disabled">
                  {selectedAgent.tier.toUpperCase()}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-corthex-text-disabled hover:text-corthex-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-corthex-border">
            {(['soul', 'config', 'memory'] as DetailTab[]).map((tab) => (
              <button
                key={tab}
                data-testid={tab === 'config' ? 'agents-tab-info' : `agents-tab-${tab}`}
                onClick={() => setDetailTab(tab)}
                className="flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors border-b-2"
                style={{
                  borderBottomColor: detailTab === tab ? 'var(--color-corthex-accent)' : 'transparent',
                  color: detailTab === tab ? 'var(--color-corthex-accent)' : 'var(--color-corthex-text-disabled)',
                }}
              >
                {tab === 'soul' ? 'Soul' : tab === 'config' ? 'Config' : 'Memory'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {detailTab === 'soul' && (
              <div className="flex-1 flex flex-col p-4 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border border-corthex-border bg-corthex-bg mb-2">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled">SOUL_FABRIC_CORE</div>
                  <div className={`font-mono text-[10px] ${charCount > 45000 ? 'text-red-500' : 'text-corthex-text-disabled'}`}>
                    {charCount.toLocaleString()} / 50k
                  </div>
                </div>
                <textarea
                  data-testid="agents-soul-editor"
                  value={editForm.soul || ''}
                  onChange={(e) => setEditForm({ ...editForm, soul: e.target.value })}
                  className="flex-1 w-full p-4 font-mono text-xs bg-corthex-bg border border-corthex-border text-corthex-text-primary focus:outline-none focus:border-corthex-accent resize-none overflow-y-auto"
                  maxLength={50000}
                  placeholder="# Describe the essence of the agent..."
                  spellCheck={false}
                />
                <button
                  onClick={handleSaveSoul}
                  disabled={updateMutation.isPending}
                  className="mt-3 w-full py-2 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Soul'}
                </button>
              </div>
            )}

            {detailTab === 'config' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled border-b border-corthex-border pb-1">Core Identity</div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Agent Name</label>
                    <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent" />
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Primary Role</label>
                    <input type="text" value={editForm.role || ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled border-b border-corthex-border pb-1">Intelligence</div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Tier Level</label>
                    <select value={editForm.tier || 'specialist'} onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as Agent['tier'] })}
                      className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                      {TIER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Foundation Model</label>
                    <select value={editForm.modelName || ''} onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })}
                      className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                      {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled border-b border-corthex-border pb-1">Permissions</div>
                  {(selectedAgent.allowedTools || []).map((tool) => (
                    <label key={tool} className="flex items-center gap-3 cursor-pointer">
                      <input defaultChecked type="checkbox" className="rounded" />
                      <span className="font-mono text-xs text-corthex-text-secondary">{tool}</span>
                    </label>
                  ))}
                  <div className="pt-2 border-t border-corthex-border">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="font-mono text-xs text-corthex-text-primary">Semantic Cache</span>
                        <p className="font-mono text-[10px] text-corthex-text-disabled">Faster repeated queries</p>
                      </div>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={editForm.enableSemanticCache ?? false}
                          onChange={(e) => handleCacheToggle(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-corthex-border peer-checked:bg-corthex-accent rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-corthex-text-primary after:rounded-full after:h-5 after:w-5 after:transition-all" />
                      </div>
                    </label>
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <button onClick={handleSaveInfo} disabled={updateMutation.isPending}
                    className="w-full py-2 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    data-testid="agents-deactivate-btn"
                    onClick={() => openDeactivateModal(selectedAgent)}
                    disabled={!selectedAgent.isActive}
                    className="w-full py-2 border font-mono text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--color-corthex-error)', color: 'var(--color-corthex-error)' }}>
                    {selectedAgent.isActive ? 'Deactivate Agent' : 'Already Deactivated'}
                  </button>
                </div>
              </div>
            )}

            {detailTab === 'memory' && (
              <div className="flex-1 flex items-center justify-center">
                <p className="font-mono text-xs uppercase tracking-widest text-corthex-text-disabled">Memory snapshots will appear here</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Deactivate Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-corthex-surface border border-corthex-border w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-corthex-border flex items-center justify-between bg-corthex-elevated">
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-corthex-text-primary">에이전트 비활성화</h3>
              <button onClick={() => setDeactivateTarget(null)} className="text-corthex-text-disabled hover:text-corthex-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="font-mono text-xs text-corthex-text-secondary">
                <strong className="text-corthex-text-primary">{deactivateTarget.name}</strong>을(를) 비활성화하시겠습니까?
              </p>
              {activeSessionCount !== null && (
                <div className="p-3 border border-corthex-border bg-corthex-bg">
                  <p className="font-mono text-xs text-corthex-text-secondary">
                    현재 <span style={{ color: 'var(--color-corthex-warning)' }}>{activeSessionCount}</span>개의 활성 세션이 있습니다.
                  </p>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={forceDeactivate} onChange={(e) => setForceDeactivate(e.target.checked)} className="rounded" />
                    <span className="font-mono text-xs text-corthex-text-secondary">강제 비활성화</span>
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setDeactivateTarget(null)}
                  className="flex-1 px-4 py-2 border border-corthex-border font-mono text-xs uppercase tracking-widest text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
                  취소
                </button>
                <button onClick={handleDeactivateConfirm} disabled={deactivateMutation.isPending}
                  className="flex-1 px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-corthex-error)', color: 'white' }}>
                  {deactivateMutation.isPending ? '처리 중...' : '비활성화'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-corthex-surface border border-corthex-border w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-corthex-border flex items-center justify-between bg-corthex-elevated shrink-0">
              <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-corthex-text-primary">New Agent</h3>
              <button onClick={() => { setShowCreate(false); setForm({ ...defaultCreateForm }) }}
                className="text-corthex-text-disabled hover:text-corthex-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form data-testid="agents-create-form" onSubmit={handleCreate} className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Agent Name *</label>
                <input data-testid="agents-create-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent"
                  placeholder="예: 마케팅 매니저" required />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Role</label>
                <input data-testid="agents-create-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent"
                  placeholder="예: SNS 콘텐츠 제작" />
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Tier Level</label>
                <select data-testid="agents-create-tier" value={form.tier} onChange={(e) => handleTierChange(e.target.value as 'manager' | 'specialist' | 'worker')}
                  className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                  {TIER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Foundation Model</label>
                <select data-testid="agents-create-model" value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                  {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Department</label>
                <select data-testid="agents-create-dept" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent">
                  <option value="">미배정</option>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-widest text-corthex-text-disabled mb-1">Soul (Persona)</label>
                {soulTemplates.length > 0 && (
                  <select value="" onChange={(e) => { const tpl = soulTemplates.find((t) => t.id === e.target.value); if (tpl) setForm({ ...form, soul: tpl.content }) }}
                    className="w-full bg-corthex-bg border border-corthex-border px-3 py-1.5 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent mb-2">
                    <option value="">템플릿 불러오기...</option>
                    {soulTemplates.map((t) => <option key={t.id} value={t.id}>{t.isBuiltin ? '[기본] ' : ''}{t.name}</option>)}
                  </select>
                )}
                <textarea data-testid="agents-create-soul" value={form.soul} onChange={(e) => setForm({ ...form, soul: e.target.value })} rows={3}
                  className="w-full bg-corthex-bg border border-corthex-border px-3 py-2 text-xs font-mono text-corthex-text-primary focus:outline-none focus:border-corthex-accent resize-none"
                  placeholder="에이전트의 성격과 행동 방식을 정의합니다..." />
              </div>
              <div className="pt-2 flex gap-3">
                <button data-testid="agents-create-cancel" type="button" onClick={() => { setShowCreate(false); setForm({ ...defaultCreateForm }) }}
                  className="flex-1 px-4 py-2 border border-corthex-border font-mono text-xs uppercase tracking-widest text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
                  취소
                </button>
                <button data-testid="agents-create-submit" type="submit" disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-corthex-accent)', color: 'var(--color-corthex-text-on-accent)' }}>
                  {createMutation.isPending ? '생성 중...' : '만들기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cache Disable Confirmation Modal */}
      {showCacheDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-corthex-surface border border-corthex-border w-full max-w-sm mx-4 p-6">
            <h3 className="font-mono text-xs uppercase tracking-widest font-bold text-corthex-text-primary mb-3">Semantic Cache 비활성화</h3>
            <p className="font-mono text-xs text-corthex-text-secondary mb-4">캐시를 비활성화하면 응답 속도가 느려질 수 있습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCacheDisableModal(false)}
                className="flex-1 px-4 py-2 border border-corthex-border font-mono text-xs uppercase tracking-widest text-corthex-text-secondary hover:bg-corthex-elevated transition-colors">
                취소
              </button>
              <button onClick={confirmCacheDisable}
                className="flex-1 px-4 py-2 font-mono text-xs uppercase tracking-widest font-bold"
                style={{ backgroundColor: 'var(--color-corthex-error)', color: 'white' }}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
