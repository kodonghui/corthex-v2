import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type CatalogTool = { name: string; description: string | null; category: string; registered: boolean }
type CatalogGroup = { category: string; tools: CatalogTool[] }
type Agent = { id: string; name: string; tier: string; allowedTools: string[] | null }

const CATEGORIES = ['common', 'finance', 'legal', 'marketing', 'tech'] as const

const categoryLabels: Record<string, string> = {
  common: 'Common', finance: 'Finance', legal: 'Legal', marketing: 'Marketing', tech: 'Tech',
}

const categoryBadgeColors: Record<string, string> = {
  common: 'bg-blue-500/20 text-blue-400',
  finance: 'bg-emerald-500/20 text-emerald-400',
  legal: 'bg-purple-500/20 text-purple-400',
  marketing: 'bg-amber-500/20 text-amber-400',
  tech: 'bg-cyan-500/20 text-cyan-400',
}

export function ToolsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [pendingChanges, setPendingChanges] = useState<Map<string, string[]>>(new Map())
  const [saving, setSaving] = useState(false)

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

  // All tools flat list
  const allTools = useMemo(() => {
    return catalog.flatMap((g) => g.tools)
  }, [catalog])

  // Filtered tools by category
  const filteredTools = useMemo(() => {
    if (activeCategory === 'all') return allTools
    return allTools.filter((t) => t.category === activeCategory)
  }, [allTools, activeCategory])

  // Tools by category for batch operations
  const toolsByCategory = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const group of catalog) {
      map.set(group.category, group.tools.map((t) => t.name))
    }
    return map
  }, [catalog])

  // Get effective allowedTools for an agent (considering pending changes)
  const getAgentTools = useCallback((agentId: string) => {
    if (pendingChanges.has(agentId)) return pendingChanges.get(agentId)!
    const agent = agents.find((a) => a.id === agentId)
    return agent?.allowedTools || []
  }, [agents, pendingChanges])

  // Count pending changes
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

  // Toggle single tool for an agent
  const toggleTool = useCallback((agentId: string, toolName: string) => {
    const current = getAgentTools(agentId)
    const newTools = current.includes(toolName)
      ? current.filter((t) => t !== toolName)
      : [...current, toolName]
    setPendingChanges((prev) => new Map(prev).set(agentId, newTools))
  }, [getAgentTools])

  // Batch toggle category for an agent
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

  // Save mutation
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
        <p className="text-sm text-slate-400">회사를 선택하세요</p>
      </div>
    )
  }

  const isLoading = catalogLoading || agentsLoading

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6" data-testid="tools-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">도구 관리</h1>
          {!isLoading && (
            <p className="text-sm text-slate-400 mt-1">{allTools.length}개 도구 · {agents.length}개 에이전트</p>
          )}
        </div>
        {changeCount > 0 && (
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
              변경사항 {changeCount}건
            </span>
            <button
              onClick={handleCancel}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              data-testid="cancel-btn"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="save-btn"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" data-testid="category-tabs">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            activeCategory === 'all'
              ? 'text-white bg-blue-600'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          전체<span className="ml-1.5 text-xs opacity-70">({allTools.length})</span>
        </button>
        {CATEGORIES.map((cat) => {
          const count = catalog.find((g) => g.category === cat)?.tools.length || 0
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'text-white bg-blue-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {categoryLabels[cat]}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${categoryBadgeColors[cat]}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="space-y-4" data-testid="loading-state">
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-slate-700 animate-pulse rounded-lg h-8 w-20" />)}
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="bg-slate-700 animate-pulse rounded h-40 w-full" />
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
            <div className="bg-slate-700 animate-pulse rounded h-40 w-full" />
          </div>
        </div>
      ) : allTools.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center" data-testid="empty-state">
          <div className="text-4xl mb-3">🔧</div>
          <h3 className="text-lg font-semibold text-white mb-2">등록된 도구가 없습니다</h3>
          <p className="text-sm text-slate-400">tool_definitions 테이블에 도구를 등록하세요.</p>
        </div>
      ) : (
        <>
          {/* Tool Catalog Table */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid="tool-catalog">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이름</th>
                    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">카테고리</th>
                    <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">설명</th>
                    <th className="text-center text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3 w-20">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.name} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-slate-200">{tool.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryBadgeColors[tool.category] || ''}`}>
                          {tool.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400 max-w-xs truncate">{tool.description}</td>
                      <td className="px-4 py-3 text-center">
                        {tool.registered
                          ? <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="등록됨" />
                          : <span className="inline-block w-2 h-2 rounded-full bg-slate-500" title="미등록" />
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent Permission Matrix */}
          {agents.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid="permission-matrix">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3 sticky left-0 z-10 bg-slate-800 min-w-[180px]">
                        에이전트
                      </th>
                      {/* Category batch toggle headers */}
                      {CATEGORIES.filter((cat) => toolsByCategory.has(cat)).map((cat) => (
                        <th key={`cat-${cat}`} className="text-center text-[10px] font-medium text-slate-400 uppercase px-1 py-3 border-r border-slate-700/30" colSpan={1}>
                          {categoryLabels[cat]}
                        </th>
                      ))}
                      {/* Individual tool headers */}
                      {filteredTools.map((tool) => (
                        <th key={tool.name} className="px-2 py-3 text-center min-w-[44px]">
                          <span className="text-xs text-slate-400 [writing-mode:vertical-lr] transform -rotate-45 inline-block origin-bottom-left whitespace-nowrap font-mono">
                            {tool.name.length > 12 ? tool.name.slice(0, 12) + '…' : tool.name}
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
                          className={`border-b border-slate-700/50 transition-colors ${
                            isModified ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-800/30'
                          }`}
                        >
                          {/* Agent name cell (sticky) */}
                          <td className="sticky left-0 z-10 bg-slate-800 px-4 py-3 whitespace-nowrap border-r border-slate-700">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{agent.name}</span>
                              <span className="text-xs text-slate-500">({agent.tier?.[0]?.toUpperCase() || '?'})</span>
                              {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                            </div>
                          </td>

                          {/* Category batch toggle buttons */}
                          {CATEGORIES.filter((cat) => toolsByCategory.has(cat)).map((cat) => {
                            const catToolNames = toolsByCategory.get(cat) || []
                            const allEnabled = catToolNames.every((t) => agentTools.includes(t))
                            const someEnabled = catToolNames.some((t) => agentTools.includes(t))

                            return (
                              <td key={`batch-${cat}`} className="px-2 py-3 text-center border-r border-slate-700/30">
                                <button
                                  onClick={() => toggleCategory(agent.id, cat)}
                                  className={`w-6 h-6 rounded border flex items-center justify-center transition-colors text-xs font-bold ${
                                    allEnabled
                                      ? 'bg-blue-600 border-blue-500 text-white'
                                      : someEnabled
                                        ? 'bg-blue-600/30 border-blue-500/50 text-blue-400'
                                        : 'bg-slate-700 border-slate-600 text-transparent hover:border-slate-500'
                                  }`}
                                  title={`${categoryLabels[cat]} 전체 ${allEnabled ? '해제' : '선택'}`}
                                >
                                  {allEnabled ? '✓' : someEnabled ? '−' : ''}
                                </button>
                              </td>
                            )
                          })}

                          {/* Individual tool checkboxes */}
                          {filteredTools.map((tool) => {
                            const checked = agentTools.includes(tool.name)
                            return (
                              <td key={tool.name} className="px-2 py-3 text-center">
                                <button
                                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                    checked
                                      ? 'bg-blue-600 border-blue-500 text-white'
                                      : 'bg-slate-700 border-slate-600 hover:border-slate-500'
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
            <div className="fixed bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 px-6 py-3" data-testid="save-bar">
              <div className="max-w-[1400px] mx-auto flex items-center justify-between">
                <span className="text-sm text-amber-400 font-medium">변경사항 {changeCount}건</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCancel}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
