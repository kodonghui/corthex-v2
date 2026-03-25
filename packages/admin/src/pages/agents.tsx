/**
 * Agent Management — Natural Organic Theme
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
  { value: 'worker', label: 'Worker', desc: '반복 작업 수행', defaultModel: 'gemini-2.5-flash' },
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
  offline: 'bg-slate-300',
}

const TIER_BADGE: Record<string, string> = {
  manager: 'bg-amber-100 text-amber-800 border-amber-200',
  specialist: 'bg-corthex-accent-deep/10 text-corthex-accent-deep border-corthex-accent-deep/20',
  worker: 'bg-slate-100 text-slate-800 border-slate-200',
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
      return true
    })
  }, [agents, search])

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
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#f7f8f4', color: '#363d2a' }}>
        <p className="text-sm font-medium">회사를 선택하세요</p>
      </div>
    )
  }

  return (
    <div data-testid="agents-page" className="h-screen overflow-hidden flex" style={{ backgroundColor: '#f7f8f4', fontFamily: "'Inter', sans-serif", color: '#363d2a' }}>
      {/* BEGIN: Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* BEGIN: Header */}
        <header className="h-16 border-b flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-10" style={{ borderColor: '#dce1cd' }}>
          <h1 className="text-lg font-bold" style={{ color: '#4e5938' }}>Agent Management</h1>
          <div className="flex items-center gap-4">
            <button
              data-testid="agents-create-btn"
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors border"
              style={{ color: '#4e5938', backgroundColor: '#eceee3', borderColor: '#dce1cd' }}
            >
              New Agent Template
            </button>
          </div>
        </header>
        {/* END: Header */}

        <div className="flex-1 flex overflow-hidden">
          {/* BEGIN: Left Column (Agent List) */}
          <section className="w-80 border-r overflow-y-auto" style={{ borderColor: '#dce1cd', backgroundColor: '#f7f8f4' }} data-testid="agents-table">
            <div className="p-4 space-y-3">
              {/* Search Box */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="w-4 h-4" style={{ color: '#a3b182' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </span>
                <input
                  data-testid="agents-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:ring-corthex-accent focus:border-corthex-accent bg-white"
                  style={{ borderColor: '#dce1cd' }}
                  placeholder="Search agents..."
                  type="text"
                />
              </div>

              {/* Agent Cards */}
              {isLoading ? (
                <div data-testid="agents-loading" className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border animate-pulse" style={{ borderColor: '#dce1cd' }}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full" style={{ backgroundColor: '#eceee3' }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 rounded" style={{ backgroundColor: '#eceee3' }} />
                          <div className="h-3 w-32 rounded" style={{ backgroundColor: '#eceee3' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAgents.length === 0 ? (
                <div data-testid="agents-empty-state" className="text-center py-8">
                  <p className="text-sm" style={{ color: '#a3b182' }}>
                    {agents.length === 0 ? '등록된 에이전트가 없습니다' : '필터 조건에 맞는 에이전트가 없습니다'}
                  </p>
                </div>
              ) : (
                filteredAgents.map((a) => {
                  const isSelected = selectedAgent?.id === a.id
                  const statusColor = STATUS_COLORS[a.status] || STATUS_COLORS.offline
                  const tierBadge = TIER_BADGE[a.tier] || TIER_BADGE.worker

                  return (
                    <div
                      key={a.id}
                      data-testid={`agents-row-${a.id}`}
                      onClick={() => openDetail(a)}
                      className={`bg-white p-4 rounded-xl shadow-sm cursor-pointer transition-all group ${
                        isSelected
                          ? 'border-2'
                          : 'border hover:border-corthex-border'
                      }`}
                      style={{
                        borderColor: isSelected ? '#a3b182' : '#dce1cd',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div
                            className="w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold"
                            style={{ borderColor: '#dce1cd', backgroundColor: '#eceee3', color: '#4e5938' }}
                          >
                            {a.name.charAt(0)}
                          </div>
                          <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white ${statusColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 data-testid={`agents-name-${a.id}`} className="text-sm font-bold truncate" style={{ color: '#363d2a' }}>
                            {a.name}
                            {a.isSystem && <span data-testid={`agents-system-badge-${a.id}`} className="ml-1 text-[10px] text-amber-600">[SYS]</span>}
                            {!a.isActive && <span data-testid={`agents-inactive-badge-${a.id}`} className="ml-1 text-[10px] text-slate-400">[OFF]</span>}
                          </h3>
                          <p className="text-xs truncate mb-2" style={{ color: '#83935d' }}>{a.role || 'No role'}</p>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${tierBadge}`}>
                            {a.tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
          {/* END: Left Column */}

          {/* BEGIN: Right Column (Soul Editor & Details) */}
          {selectedAgent ? (
            <section className="flex-1 flex flex-col min-w-0 overflow-hidden" data-testid="agents-detail-panel">
              {/* Editor Tabs/Header */}
              <div className="flex items-center justify-between px-8 py-4 border-b bg-white" style={{ borderColor: '#eceee3' }}>
                <div className="flex items-center gap-6">
                  <button
                    data-testid="agents-tab-soul"
                    onClick={() => setDetailTab('soul')}
                    className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                      detailTab === 'soul'
                        ? 'font-bold'
                        : 'hover:text-corthex-accent'
                    }`}
                    style={{
                      borderColor: detailTab === 'soul' ? '#667447' : 'transparent',
                      color: detailTab === 'soul' ? '#363d2a' : '#a3b182',
                    }}
                  >
                    Soul Markdown
                  </button>
                  <button
                    data-testid="agents-tab-info"
                    onClick={() => setDetailTab('config')}
                    className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                      detailTab === 'config'
                        ? 'font-bold'
                        : 'hover:text-corthex-accent'
                    }`}
                    style={{
                      borderColor: detailTab === 'config' ? '#667447' : 'transparent',
                      color: detailTab === 'config' ? '#363d2a' : '#a3b182',
                    }}
                  >
                    Configuration
                  </button>
                  <button
                    onClick={() => setDetailTab('memory')}
                    className={`pb-4 border-b-2 text-sm font-medium transition-colors ${
                      detailTab === 'memory'
                        ? 'font-bold'
                        : 'hover:text-corthex-accent'
                    }`}
                    style={{
                      borderColor: detailTab === 'memory' ? '#667447' : 'transparent',
                      color: detailTab === 'memory' ? '#363d2a' : '#a3b182',
                    }}
                  >
                    Memory Snapshots
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs italic" style={{ color: '#a3b182' }}>Auto-saved 2m ago</span>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Editor Section */}
                {detailTab === 'soul' && (
                  <div className="flex-1 flex flex-col p-6 bg-white overflow-hidden">
                    <div className="flex-1 flex flex-col rounded-xl border overflow-hidden shadow-inner" style={{ borderColor: '#dce1cd', backgroundColor: '#f7f8f4' }}>
                      <div className="flex items-center justify-between px-4 py-2 border-b bg-white/50" style={{ borderColor: '#dce1cd' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                          <span className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50" />
                          <span className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/50" />
                        </div>
                        <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#a3b182' }}>SOUL_FABRIC_CORE</div>
                        <div className={`text-[10px] font-mono ${charCount > 45000 ? 'text-red-500' : ''}`} style={charCount <= 45000 ? { color: '#a3b182' } : {}}>
                          {charCount.toLocaleString()} / 50,000 chars
                        </div>
                      </div>
                      <textarea
                        data-testid="agents-soul-editor"
                        value={editForm.soul || ''}
                        onChange={(e) => setEditForm({ ...editForm, soul: e.target.value })}
                        className="flex-1 w-full p-6 font-mono text-sm bg-transparent border-none focus:ring-0 resize-none overflow-y-auto"
                        style={{ color: '#4e5938' }}
                        maxLength={50000}
                        placeholder="# Describe the essence of the agent here..."
                        spellCheck={false}
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <button
                        onClick={handleSaveSoul}
                        disabled={updateMutation.isPending}
                        className="px-4 py-2 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                        style={{ backgroundColor: '#707a52' }}
                      >
                        {updateMutation.isPending ? 'Saving...' : 'Save Soul'}
                      </button>
                    </div>
                  </div>
                )}

                {detailTab === 'config' && (
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    {/* Settings Panel matching Stitch HTML structure */}
                    <div className="max-w-lg space-y-8">
                      {/* Core Identity */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a3b182' }}>Core Identity</h4>
                        <div>
                          <label className="block text-sm font-semibold mb-1" style={{ color: '#4e5938' }}>Agent Name</label>
                          <input type="text" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1" style={{ color: '#4e5938' }}>Primary Role</label>
                          <input type="text" value={editForm.role || ''} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className={inputCls} />
                        </div>
                      </div>
                      {/* Intelligence Configuration */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a3b182' }}>Intelligence</h4>
                        <div>
                          <label className="block text-sm font-semibold mb-1" style={{ color: '#4e5938' }}>Tier Level</label>
                          <select
                            value={editForm.tier || 'specialist'}
                            onChange={(e) => setEditForm({ ...editForm, tier: e.target.value as Agent['tier'] })}
                            className={selectCls}
                          >
                            {TIER_OPTIONS.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-1" style={{ color: '#4e5938' }}>Foundation Model</label>
                          <select
                            value={editForm.modelName || ''}
                            onChange={(e) => setEditForm({ ...editForm, modelName: e.target.value })}
                            className={selectCls}
                          >
                            {MODEL_OPTIONS.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Permissions & Tools */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#a3b182' }}>Permissions &amp; Tools</h4>
                        <div className="space-y-2">
                          {(selectedAgent.allowedTools || []).map((tool) => (
                            <label key={tool} className="flex items-center gap-3 group cursor-pointer">
                              <input defaultChecked type="checkbox" className="rounded text-corthex-accent focus:ring-corthex-accent" style={{ borderColor: '#c2ccaa' }} />
                              <span className="text-sm font-medium transition-colors group-hover:text-corthex-accent-deep" style={{ color: '#4e5938' }}>{tool}</span>
                            </label>
                          ))}
                        </div>
                        <div className="pt-2 border-t" style={{ borderColor: '#dce1cd' }}>
                          <label className="flex items-center justify-between cursor-pointer">
                            <div>
                              <span className="text-sm font-bold" style={{ color: '#4e5938' }}>isSecretary</span>
                              <p className="text-xs" style={{ color: '#83935d' }}>Auto-organizes workspace</p>
                            </div>
                            <div className="relative inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={editForm.enableSemanticCache ?? false}
                                onChange={(e) => handleCacheToggle(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-corthex-accent" style={{ backgroundColor: editForm.enableSemanticCache ? '#667447' : '#dce1cd' }} />
                            </div>
                          </label>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="pt-6 space-y-3">
                        <button
                          onClick={handleSaveInfo}
                          disabled={updateMutation.isPending}
                          className="w-full py-3 px-4 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
                          style={{ backgroundColor: '#707a52' }}
                        >
                          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          className="w-full py-2 px-4 bg-transparent font-semibold rounded-xl text-xs transition-colors"
                          style={{ color: '#83935d' }}
                        >
                          Reset to Admin Soul
                        </button>
                        <button
                          data-testid="agents-deactivate-btn"
                          onClick={() => openDeactivateModal(selectedAgent)}
                          disabled={!selectedAgent.isActive}
                          className="w-full py-2 px-4 border border-red-200 text-red-600 font-semibold rounded-xl text-xs transition-colors hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {selectedAgent.isActive ? 'Deactivate Agent' : 'Already Deactivated'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === 'memory' && (
                  <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="text-center py-16" style={{ color: '#a3b182' }}>
                      <p className="text-sm">Memory snapshots will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="flex-1 flex items-center justify-center bg-white">
              <p className="text-sm" style={{ color: '#a3b182' }}>Select an agent from the list</p>
            </section>
          )}
          {/* END: Right Column */}
        </div>
      </main>

      {/* Deactivate Modal */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden border" style={{ borderColor: '#dce1cd' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#eceee3', backgroundColor: '#f7f8f4' }}>
              <h3 className="text-lg font-bold" style={{ color: '#363d2a' }}>에이전트 비활성화</h3>
              <button onClick={() => setDeactivateTarget(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm" style={{ color: '#4e5938' }}>
                <strong>{deactivateTarget.name}</strong>을(를) 비활성화하시겠습니까?
              </p>
              {activeSessionCount !== null && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    현재 {activeSessionCount}개의 활성 세션이 있습니다.
                  </p>
                  <label className="flex items-center gap-2 mt-2">
                    <input type="checkbox" checked={forceDeactivate} onChange={(e) => setForceDeactivate(e.target.checked)} className="rounded" />
                    <span className="text-sm text-amber-700">강제 비활성화</span>
                  </label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeactivateTarget(null)}
                  className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors"
                  style={{ borderColor: '#dce1cd', color: '#4e5938' }}
                >
                  취소
                </button>
                <button
                  onClick={handleDeactivateConfirm}
                  disabled={deactivateMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {deactivateMutation.isPending ? '처리 중...' : '비활성화'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden border max-h-[80vh] flex flex-col" style={{ borderColor: '#dce1cd' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between shrink-0" style={{ borderColor: '#eceee3', backgroundColor: '#f7f8f4' }}>
              <h3 className="text-lg font-bold" style={{ color: '#363d2a' }}>New Agent Template</h3>
              <button onClick={() => { setShowCreate(false); setForm({ ...defaultCreateForm }) }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              </button>
            </div>
            <form data-testid="agents-create-form" onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4e5938' }}>Agent Name *</label>
                <input data-testid="agents-create-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="예: 마케팅 매니저" required />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4e5938' }}>Role</label>
                <input data-testid="agents-create-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls} placeholder="예: SNS 콘텐츠 제작" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4e5938' }}>Tier Level</label>
                <select data-testid="agents-create-tier" value={form.tier} onChange={(e) => handleTierChange(e.target.value as 'manager' | 'specialist' | 'worker')} className={selectCls}>
                  {TIER_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label} - {t.desc}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4e5938' }}>Foundation Model</label>
                <select data-testid="agents-create-model" value={form.modelName} onChange={(e) => setForm({ ...form, modelName: e.target.value })} className={selectCls}>
                  {MODEL_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4e5938' }}>Department</label>
                <select data-testid="agents-create-dept" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={selectCls}>
                  <option value="">미배정</option>
                  {depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#4e5938' }}>Soul (Persona)</label>
                {soulTemplates.length > 0 && (
                  <select
                    value=""
                    onChange={(e) => {
                      const tpl = soulTemplates.find((t) => t.id === e.target.value)
                      if (tpl) setForm({ ...form, soul: tpl.content })
                    }}
                    className="w-full mb-2 border-corthex-border rounded-lg text-xs py-1.5 focus:ring-corthex-accent focus:border-corthex-accent"
                  >
                    <option value="">템플릿 불러오기...</option>
                    {soulTemplates.map((t) => <option key={t.id} value={t.id}>{t.isBuiltin ? '[기본] ' : ''}{t.name}</option>)}
                  </select>
                )}
                <textarea data-testid="agents-create-soul" value={form.soul} onChange={(e) => setForm({ ...form, soul: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="에이전트의 성격과 행동 방식을 정의합니다..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button data-testid="agents-create-cancel" type="button" onClick={() => { setShowCreate(false); setForm({ ...defaultCreateForm }) }} className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors" style={{ borderColor: '#dce1cd', color: '#4e5938' }}>
                  취소
                </button>
                <button data-testid="agents-create-submit" type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50" style={{ backgroundColor: '#667447' }}>
                  {createMutation.isPending ? '생성 중...' : '만들기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cache Disable Confirmation Modal */}
      {showCacheDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 border" style={{ borderColor: '#dce1cd' }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#363d2a' }}>Semantic Cache 비활성화</h3>
            <p className="text-sm mb-4" style={{ color: '#4e5938' }}>캐시를 비활성화하면 응답 속도가 느려질 수 있습니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCacheDisableModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm" style={{ borderColor: '#dce1cd' }}>취소</button>
              <button onClick={confirmCacheDisable} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
