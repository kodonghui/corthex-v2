import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type CatalogTool = { name: string; description: string | null; category: string; registered: boolean }
type CatalogGroup = { category: string; tools: CatalogTool[] }
type Agent = { id: string; name: string; tier: string; allowedTools: string[] | null }

const CATEGORIES = ['common', 'finance', 'legal', 'marketing', 'tech'] as const
type Category = (typeof CATEGORIES)[number]

const categoryLabels: Record<string, string> = {
  common: 'Common', finance: 'Finance', legal: 'Legal', marketing: 'Marketing', tech: 'Tech',
}

const categoryColors: Record<string, string> = {
  common: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  finance: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  legal: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  marketing: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  tech: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
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
      // Remove all in category
      const removeSet = new Set(catTools)
      newTools = current.filter((t) => !removeSet.has(t))
    } else {
      // Add all in category
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
    return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>
  }

  const isLoading = catalogLoading || agentsLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">도구 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{allTools.length}개 도구 · {agents.length}개 에이전트</p>
        </div>
        {changeCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              변경사항 {changeCount}건
            </span>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeCategory === 'all'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          전체 ({allTools.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = catalog.find((g) => g.category === cat)?.tools.length || 0
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeCategory === cat
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {categoryLabels[cat]} ({count})
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="text-center text-zinc-500 py-12">로딩 중...</div>
      ) : allTools.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
          <p className="text-zinc-500 text-sm">등록된 도구가 없습니다</p>
          <p className="text-zinc-400 text-xs mt-1">도구 정의(tool_definitions)를 먼저 등록하세요</p>
        </div>
      ) : (
        <>
          {/* Tool Catalog Table */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">도구 카탈로그</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-4 py-2">이름</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-4 py-2">카테고리</th>
                    <th className="text-left text-xs font-medium text-zinc-500 uppercase px-4 py-2">설명</th>
                    <th className="text-center text-xs font-medium text-zinc-500 uppercase px-4 py-2">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map((tool) => (
                    <tr key={tool.name} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="px-4 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100">{tool.name}</td>
                      <td className="px-4 py-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[tool.category] || ''}`}>
                          {categoryLabels[tool.category] || tool.category}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">{tool.description}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${tool.registered ? 'bg-green-500' : 'bg-zinc-300'}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agent Permission Matrix */}
          {agents.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">에이전트별 도구 권한</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase px-4 py-2 sticky left-0 bg-white dark:bg-zinc-900 min-w-[180px]">
                        에이전트
                      </th>
                      {/* Category batch toggle headers */}
                      {CATEGORIES.filter((cat) => toolsByCategory.has(cat)).map((cat) => (
                        <th key={`cat-${cat}`} className="text-center text-[10px] font-medium text-zinc-400 uppercase px-1 py-2" colSpan={1}>
                          {categoryLabels[cat]}
                        </th>
                      ))}
                      {/* Individual tool headers */}
                      {filteredTools.map((tool) => (
                        <th key={tool.name} className="text-center px-1 py-2 min-w-[40px]">
                          <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono writing-mode-vertical transform -rotate-45 inline-block origin-bottom-left whitespace-nowrap">
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
                          className={`border-b border-zinc-100 dark:border-zinc-800/50 ${
                            isModified ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                          }`}
                        >
                          {/* Agent name cell */}
                          <td className="px-4 py-2 sticky left-0 bg-inherit min-w-[180px]">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{agent.name}</span>
                              <span className="text-[10px] text-zinc-400">({agent.tier?.[0]?.toUpperCase() || '?'})</span>
                              {isModified && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                            </div>
                          </td>

                          {/* Category batch toggle buttons */}
                          {CATEGORIES.filter((cat) => toolsByCategory.has(cat)).map((cat) => {
                            const catToolNames = toolsByCategory.get(cat) || []
                            const allEnabled = catToolNames.every((t) => agentTools.includes(t))
                            const someEnabled = catToolNames.some((t) => agentTools.includes(t))

                            return (
                              <td key={`batch-${cat}`} className="text-center px-1 py-2">
                                <button
                                  onClick={() => toggleCategory(agent.id, cat)}
                                  className={`w-6 h-6 rounded border text-[10px] font-bold transition-colors ${
                                    allEnabled
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : someEnabled
                                        ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 text-indigo-600'
                                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-400'
                                  }`}
                                  title={`${categoryLabels[cat]} 전체 ${allEnabled ? '해제' : '선택'}`}
                                >
                                  {allEnabled ? '✓' : someEnabled ? '−' : ''}
                                </button>
                              </td>
                            )
                          })}

                          {/* Individual tool checkboxes */}
                          {filteredTools.map((tool) => (
                            <td key={tool.name} className="text-center px-1 py-2">
                              <input
                                type="checkbox"
                                checked={agentTools.includes(tool.name)}
                                onChange={() => toggleTool(agent.id, tool.name)}
                                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                              />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bottom save bar (sticky) */}
          {changeCount > 0 && (
            <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between rounded-xl shadow-lg">
              <span className="text-sm text-amber-600 dark:text-amber-400">
                {changeCount}건의 변경사항이 있습니다
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
