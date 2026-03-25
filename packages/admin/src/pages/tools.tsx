/**
 * Tool Definition Management — Industrial Dark Theme (Stitch)
 *
 * API Endpoints:
 *   GET    /api/admin/tools/catalog
 *   GET    /api/admin/agents?companyId=...
 *   PATCH  /api/admin/agents/:id/allowed-tools
 */
import { useState, useMemo, useCallback, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { X, Plus, MoreVertical, ChevronLeft, ChevronRight, BarChart2, Search, Wrench } from 'lucide-react'

type CatalogTool = { id: string; name: string; description: string | null; category: string; registered: boolean }
type CatalogGroup = { category: string; tools: CatalogTool[] }
type Agent = { id: string; name: string; tier: string; allowedTools: string[] | null }

const CATEGORIES = ['common', 'finance', 'legal', 'marketing', 'tech'] as const

const categoryLabels: Record<string, string> = {
  common: 'Common', finance: 'Finance', legal: 'Legal', marketing: 'Marketing', tech: 'Tech',
}

export function ToolsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingChanges, setPendingChanges] = useState<Map<string, string[]>>(new Map())
  const [saving, setSaving] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTool, setNewTool] = useState({ name: '', description: '', category: 'common' })
  const [editingTool, setEditingTool] = useState<CatalogTool | null>(null)
  const [deletingTool, setDeletingTool] = useState<CatalogTool | null>(null)

  // Fetch tool catalog
  const { data: catalogData, isLoading: catalogLoading } = useQuery({
    queryKey: ['tool-catalog', selectedCompanyId],
    queryFn: () => api.get<{ data: CatalogGroup[] }>('/admin/tools/catalog'),
    enabled: !!selectedCompanyId,
  })

  // Fetch agents
  const { data: agentData, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const catalog = catalogData?.data || []
  const agents = agentData?.data || []

  const allTools = useMemo(() => catalog.flatMap((g) => g.tools), [catalog])

  const filteredTools = useMemo(() => {
    let tools = allTools
    if (activeCategory !== 'all') tools = tools.filter((t) => t.category === activeCategory)
    if (searchQuery) tools = tools.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()))
    return tools
  }, [allTools, activeCategory, searchQuery])

  const toolsByCategory = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const group of catalog) {
      map.set(group.category, group.tools.map((t) => t.name))
    }
    return map
  }, [catalog])

  const getAgentTools = useCallback((agentId: string) => {
    if (pendingChanges.has(agentId)) return pendingChanges.get(agentId)!
    const agent = agents.find((a) => a.id === agentId)
    return agent?.allowedTools || []
  }, [agents, pendingChanges])

  const changeCount = useMemo(() => {
    let count = 0
    for (const [agentId, newTools] of pendingChanges) {
      const agent = agents.find((a) => a.id === agentId)
      const original = agent?.allowedTools || []
      const added = newTools.filter((t) => !original.includes(t))
      const removed = original.filter((t) => !newTools.includes(t))
      count += added.length + removed.length
    }
    return count
  }, [pendingChanges, agents])

  const toggleTool = useCallback((agentId: string, toolName: string) => {
    const current = getAgentTools(agentId)
    const newTools = current.includes(toolName)
      ? current.filter((t) => t !== toolName)
      : [...current, toolName]
    setPendingChanges((prev) => new Map(prev).set(agentId, newTools))
  }, [getAgentTools])

  const toggleCategory = useCallback((agentId: string, category: string) => {
    const catTools = toolsByCategory.get(category) || []
    if (catTools.length === 0) return
    const current = getAgentTools(agentId)
    const allEnabled = catTools.every((t) => current.includes(t))
    let newTools: string[]
    if (allEnabled) {
      const removeSet = new Set(catTools)
      newTools = current.filter((t) => !removeSet.has(t))
    } else {
      newTools = [...new Set([...current, ...catTools])]
    }
    setPendingChanges((prev) => new Map(prev).set(agentId, newTools))
  }, [getAgentTools, toolsByCategory])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<unknown>[] = []
      for (const [agentId, allowedTools] of pendingChanges) {
        promises.push(api.patch(`/admin/agents/${agentId}/allowed-tools`, { allowedTools }))
      }
      await Promise.all(promises)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agents'] })
      setPendingChanges(new Map())
      setSaving(false)
      addToast({ type: 'success', message: '도구 권한이 저장되었습니다' })
    },
    onError: (err: Error) => {
      setSaving(false)
      addToast({ type: 'error', message: err.message })
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string; category: string }) =>
      api.post('/admin/tools', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tool-catalog'] })
      setShowCreateDialog(false)
      setNewTool({ name: '', description: '', category: 'common' })
      addToast({ type: 'success', message: '도구가 추가되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const editMutation = useMutation({
    mutationFn: (data: { id: string; name: string; description: string }) =>
      api.put(`/admin/tools/${data.id}`, { name: data.name, description: data.description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tool-catalog'] })
      setEditingTool(null)
      addToast({ type: 'success', message: '도구가 수정되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tools/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tool-catalog'] })
      setDeletingTool(null)
      addToast({ type: 'success', message: '도구가 삭제되었습니다' })
    },
    onError: (err: Error) => {
      addToast({ type: 'error', message: err.message })
    },
  })

  const handleEditTool = (e: FormEvent) => {
    e.preventDefault()
    if (!editingTool) return
    editMutation.mutate({ id: editingTool.id, name: editingTool.name, description: editingTool.description || '' })
  }

  const handleCreateTool = (e: FormEvent) => {
    e.preventDefault()
    if (!newTool.name.trim()) return
    createMutation.mutate(newTool)
  }

  const handleSave = () => {
    setSaving(true)
    saveMutation.mutate()
  }

  const handleCancel = () => {
    setPendingChanges(new Map())
  }

  if (!selectedCompanyId) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="no-company">
        <p className="text-sm text-corthex-accent">회사를 선택하세요</p>
      </div>
    )
  }

  const isLoading = catalogLoading || agentsLoading

  return (
    <div data-testid="tools-page" className="min-h-screen bg-corthex-bg">
      <div className="p-8 space-y-8">
        {/* Page Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-corthex-border/10 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-corthex-accent animate-pulse" />
              <span className="font-mono text-xs tracking-widest text-corthex-accent uppercase">Module / Registry</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-corthex-text-primary uppercase">Tool Registry</h1>
            <p className="text-corthex-text-secondary max-w-xl text-sm leading-relaxed">
              Interface for low-level diagnostic and data extraction protocols. Manage core system tools, monitor execution metrics, and provision new automation assets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {changeCount > 0 && (
              <>
                <span className="font-mono text-xs px-2.5 py-1 bg-corthex-warning/10 text-corthex-warning border border-corthex-warning/20">
                  변경사항 {changeCount}건
                </span>
                <button
                  onClick={handleCancel}
                  className="font-mono text-sm px-3 py-2 text-corthex-text-secondary hover:text-corthex-text-primary border border-corthex-border hover:bg-corthex-elevated transition-colors"
                  data-testid="cancel-btn"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="font-mono text-sm px-4 py-2 bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent font-bold disabled:opacity-50 transition-colors"
                  data-testid="save-btn"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </>
            )}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent font-black px-8 py-4 flex items-center gap-3 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span className="uppercase tracking-widest text-sm">Register Tool</span>
            </button>
          </div>
        </section>

        {/* Filters & Search */}
        <div className="bg-corthex-surface border border-corthex-border p-4 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-corthex-text-disabled" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-[10px] outline-none transition-colors placeholder:opacity-30"
                placeholder="QUERY_SYSTEM_TOOLS..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-3" data-testid="category-tabs">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-corthex-bg border border-corthex-border text-corthex-text-secondary font-mono text-xs py-2 pl-3 pr-8 focus:ring-1 focus:ring-corthex-accent outline-none appearance-none"
            >
              <option value="all">전체 카테고리</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{categoryLabels[cat]}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div data-testid="loading-state" className="bg-corthex-surface border border-corthex-border p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-1/3 bg-corthex-elevated" />
              <div className="h-40 w-full bg-corthex-elevated" />
            </div>
          </div>
        ) : allTools.length === 0 ? (
          <div data-testid="empty-state" className="bg-corthex-surface border border-corthex-border p-12 text-center">
            <h3 className="text-lg font-black uppercase tracking-tight text-corthex-text-primary mb-2">등록된 도구가 없습니다</h3>
            <p className="font-mono text-xs text-corthex-text-disabled">tool_definitions 테이블에 도구를 등록하세요.</p>
          </div>
        ) : (
          <>
            {/* Table Section */}
            <section className="bg-corthex-surface shadow-2xl relative overflow-hidden" data-testid="tool-catalog">
              {/* Accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-corthex-accent/50 via-corthex-accent to-corthex-accent/50" />
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-corthex-elevated border-b border-corthex-border/20">
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent/70">Tool Identity</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent/70">Classification</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent/70 text-center">Protocol Status</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent/70 text-right">Scope</th>
                      <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-accent/70 text-center">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-corthex-border/10">
                    {filteredTools.map((tool) => (
                      <tr key={tool.name} className="hover:bg-corthex-elevated/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-corthex-elevated flex items-center justify-center text-corthex-accent border border-corthex-border/20">
                              <Wrench className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-black text-corthex-text-primary group-hover:text-corthex-accent transition-colors uppercase tracking-tight">{tool.name}</p>
                              <p className="font-mono text-[10px] text-corthex-text-disabled opacity-50 uppercase">{tool.description || 'No description'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-mono text-xs border border-corthex-border/30 px-2 py-0.5 text-corthex-text-secondary">
                            {tool.category}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${tool.registered ? 'bg-corthex-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-corthex-text-disabled/30'}`} />
                            <span className={`font-mono text-[10px] uppercase font-bold ${tool.registered ? 'text-corthex-success' : 'text-corthex-text-disabled/50'}`}>
                              {tool.registered ? 'Active' : 'Offline'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="font-mono text-xs border border-corthex-border/30 px-2 py-0.5 text-corthex-text-secondary">
                            platform
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-1.5 text-corthex-text-disabled hover:text-corthex-accent hover:bg-corthex-elevated rounded transition-colors"
                              onClick={() => setEditingTool(tool)}
                              data-testid={`edit-tool-${tool.name}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="bg-corthex-elevated px-6 py-3 flex items-center justify-between border-t border-corthex-border/10">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest">
                    Displaying {filteredTools.length}/{allTools.length} Total Entities
                  </span>
                  <div className="h-4 w-px bg-corthex-border/20" />
                  <span className="font-mono text-[10px] text-corthex-accent/70 uppercase tracking-widest">Registry Sync: Nominal</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center text-corthex-text-secondary hover:text-corthex-accent transition-colors border border-corthex-border/10 hover:border-corthex-accent/40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[10px] px-4 font-bold text-corthex-accent">PAGE_01</span>
                  <button className="w-8 h-8 flex items-center justify-center text-corthex-text-secondary hover:text-corthex-accent transition-colors border border-corthex-border/10 hover:border-corthex-accent/40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* Agent Permission Matrix */}
            {agents.length > 0 && (
              <div data-testid="permission-matrix" className="bg-corthex-surface border border-corthex-border overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-corthex-border bg-corthex-elevated">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-corthex-accent/70">Agent Permission Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-corthex-border">
                        <th className="text-left font-mono text-[10px] uppercase tracking-wider text-corthex-text-disabled px-4 py-3 sticky left-0 z-10 bg-corthex-surface min-w-[180px]">에이전트</th>
                        {filteredTools.map((tool) => (
                          <th key={tool.name} className="px-2 py-3 text-center min-w-[44px]">
                            <span className="font-mono text-[9px] text-corthex-text-disabled [writing-mode:vertical-lr] transform -rotate-45 inline-block origin-bottom-left whitespace-nowrap">
                              {tool.name.length > 12 ? tool.name.slice(0, 12) + '...' : tool.name}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => {
                        const agentTools = getAgentTools(agent.id)
                        const isModified = pendingChanges.has(agent.id)

                        return (
                          <tr
                            key={agent.id}
                            className={`border-b transition-colors ${isModified ? 'bg-corthex-accent/5' : 'hover:bg-corthex-elevated/40'}`}
                            style={{ borderColor: 'rgba(68,64,60,0.3)' }}
                          >
                            <td className="sticky left-0 z-10 bg-corthex-surface px-4 py-3 whitespace-nowrap border-r border-corthex-border">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-corthex-text-primary">{agent.name}</span>
                                <span className="font-mono text-[10px] text-corthex-text-disabled">({agent.tier?.[0]?.toUpperCase() || '?'})</span>
                                {isModified && <span className="w-1.5 h-1.5 rounded-full bg-corthex-warning" />}
                              </div>
                            </td>
                            {filteredTools.map((tool) => {
                              const checked = agentTools.includes(tool.name)
                              return (
                                <td key={tool.name} className="px-2 py-3 text-center">
                                  <button
                                    className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                                      checked
                                        ? 'bg-corthex-accent border-corthex-accent text-corthex-text-on-accent'
                                        : 'bg-corthex-elevated border-corthex-border hover:border-corthex-text-secondary'
                                    }`}
                                    onClick={() => toggleTool(agent.id, tool.name)}
                                    role="checkbox"
                                    aria-checked={checked}
                                  >
                                    {checked && (
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sticky Bottom Save Bar */}
            {changeCount > 0 && (
              <div className="fixed bottom-0 left-0 right-0 z-20 bg-corthex-surface/95 backdrop-blur-sm border-t border-corthex-border px-6 py-3" data-testid="save-bar">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <span className="font-mono text-sm text-corthex-warning">변경사항 {changeCount}건</span>
                  <div className="flex items-center gap-3">
                    <button onClick={handleCancel} className="bg-corthex-elevated hover:bg-corthex-border text-corthex-text-secondary px-4 py-2 text-sm font-mono transition-colors">
                      취소
                    </button>
                    <button onClick={handleSave} disabled={saving} className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50">
                      {saving ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Metric Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-corthex-surface px-6 py-8 border-l border-corthex-accent/20 flex flex-col justify-between h-40">
                <span className="font-mono text-[10px] text-corthex-accent uppercase tracking-[0.3em]">Total Tools</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-corthex-text-primary">{allTools.length}<span className="text-lg text-corthex-accent opacity-60"> tools</span></h3>
                </div>
                <div className="w-full bg-corthex-elevated h-1 overflow-hidden">
                  <div className="bg-corthex-accent h-full w-2/3" />
                </div>
              </div>
              <div className="bg-corthex-surface px-6 py-8 border-l border-corthex-accent/20 flex flex-col justify-between h-40">
                <span className="font-mono text-[10px] text-corthex-accent uppercase tracking-[0.3em]">Active Tools</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-corthex-text-primary">{allTools.filter((t) => t.registered).length}<span className="text-lg text-corthex-accent opacity-60"> active</span></h3>
                </div>
                <div className="flex gap-1">
                  <BarChart2 className="w-4 h-4 text-corthex-accent opacity-60" />
                </div>
              </div>
              <div className="bg-corthex-surface px-6 py-8 border-l border-corthex-accent/20 flex flex-col justify-between h-40">
                <span className="font-mono text-[10px] text-corthex-accent uppercase tracking-[0.3em]">Categories</span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-corthex-text-primary">{CATEGORIES.length}</h3>
                </div>
                <span className="font-mono text-[10px] text-corthex-success uppercase">Registry Nominal</span>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Create Tool Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-corthex-surface border border-corthex-border shadow-xl w-full max-w-md mx-4 p-6 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-corthex-text-primary">새 도구 추가</h3>
              <button onClick={() => setShowCreateDialog(false)} className="p-1 hover:bg-corthex-elevated rounded-lg transition-colors">
                <X className="w-5 h-5 text-corthex-text-disabled" />
              </button>
            </div>
            <form onSubmit={handleCreateTool} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">도구명</label>
                <input
                  type="text"
                  value={newTool.name}
                  onChange={(e) => setNewTool((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors"
                  placeholder="예: web-search"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">설명</label>
                <input
                  type="text"
                  value={newTool.description}
                  onChange={(e) => setNewTool((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors"
                  placeholder="도구에 대한 간단한 설명"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">카테고리</label>
                <select
                  value={newTool.category}
                  onChange={(e) => setNewTool((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-sm font-mono text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg transition-colors">
                  취소
                </button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 text-sm font-bold bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg transition-colors disabled:opacity-50">
                  {createMutation.isPending ? '추가 중...' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tool Dialog */}
      {editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingTool(null)}>
          <div className="bg-corthex-surface border border-corthex-border shadow-xl w-full max-w-md mx-4 p-6 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black uppercase tracking-tight text-corthex-text-primary">도구 수정</h3>
              <button onClick={() => setEditingTool(null)} className="p-1 hover:bg-corthex-elevated rounded-lg transition-colors">
                <X className="w-5 h-5 text-corthex-text-disabled" />
              </button>
            </div>
            <form onSubmit={handleEditTool} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">도구명</label>
                <input
                  type="text"
                  value={editingTool.name}
                  onChange={(e) => setEditingTool((prev) => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">설명</label>
                <input
                  type="text"
                  value={editingTool.description || ''}
                  onChange={(e) => setEditingTool((prev) => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-primary focus:ring-1 focus:ring-corthex-accent focus:outline-none transition-colors"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingTool(null)} className="px-4 py-2 text-sm font-mono text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg transition-colors">
                  취소
                </button>
                <button type="submit" disabled={editMutation.isPending} className="px-4 py-2 text-sm font-bold bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg transition-colors disabled:opacity-50">
                  {editMutation.isPending ? '수정 중...' : '수정'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setDeletingTool(null)}>
          <div className="bg-corthex-surface border border-corthex-border shadow-xl w-full max-w-sm mx-4 p-6 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight text-corthex-text-primary mb-2">도구 삭제</h3>
            <p className="text-sm text-corthex-text-secondary mb-6">
              <strong className="text-corthex-text-primary">{deletingTool.name}</strong> 도구를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingTool(null)} className="px-4 py-2 text-sm font-mono text-corthex-text-secondary hover:bg-corthex-elevated rounded-lg transition-colors">
                취소
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingTool.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors disabled:opacity-50 bg-red-500 hover:bg-red-600"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
