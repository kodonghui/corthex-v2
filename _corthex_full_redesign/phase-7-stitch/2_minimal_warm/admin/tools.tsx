/**
 * Tool Definition Management — Minimal Warm Theme
 *
 * API Endpoints:
 *   GET    /api/admin/tools/catalog
 *   GET    /api/admin/agents?companyId=...
 *   PATCH  /api/admin/agents/:id/allowed-tools
 */
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

const categoryBadgeColors: Record<string, { bg: string; text: string }> = {
  common: { bg: 'rgba(229,115,115,0.1)', text: '#e57373' },
  finance: { bg: 'rgba(224,122,95,0.1)', text: '#e07a5f' },
  legal: { bg: 'rgba(244,162,97,0.1)', text: '#f4a261' },
  marketing: { bg: 'rgba(224,122,95,0.1)', text: '#e07a5f' },
  tech: { bg: 'rgba(229,115,115,0.1)', text: '#e57373' },
}

export function ToolsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
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
        <p className="text-sm" style={{ color: '#81b29a' }}>회사를 선택하세요</p>
      </div>
    )
  }

  const isLoading = catalogLoading || agentsLoading

  return (
    <div data-testid="tools-page" className="flex h-screen overflow-hidden" style={{ backgroundColor: '#fcfbf9', fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#2c2c2c' }}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0" style={{ borderColor: '#e5e7eb' }}>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-medium" style={{ color: '#e57373' }}>Admin Tools</span>
          </div>
          <div className="flex items-center gap-4">
            {changeCount > 0 && (
              <>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: 'rgba(224,122,95,0.1)', color: '#e07a5f' }}>
                  변경사항 {changeCount}건
                </span>
                <button onClick={handleCancel} className="text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: '#2c2c2c' }} data-testid="cancel-btn">
                  취소
                </button>
                <button onClick={handleSave} disabled={saving} className="text-sm font-medium px-4 py-1.5 text-white rounded-lg transition-colors disabled:opacity-50" style={{ backgroundColor: '#e57373' }} data-testid="save-btn">
                  {saving ? '저장 중...' : '저장'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold" style={{ color: '#2c2c2c' }}>도구 정의 관리</h2>
              <p className="text-slate-500 mt-1">플랫폼 내 에이전트가 사용하는 외부 도구 및 API 엔드포인트를 구성합니다.</p>
            </div>
            <button className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all" style={{ backgroundColor: '#e57373', boxShadow: '0 4px 14px rgba(229,115,115,0.2)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v12m6-6H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
              <span>새 도구 추가</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-xl border flex flex-wrap gap-4 items-center mb-6" style={{ borderColor: '#e5e7eb' }}>
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-none rounded-lg focus:ring-2 text-sm"
                  style={{ backgroundColor: '#f5f3ec', focusRingColor: 'rgba(229,115,115,0.2)' } as React.CSSProperties}
                  placeholder="도구명 또는 카테고리 검색..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-3" data-testid="category-tabs">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="border-none rounded-lg py-2 pl-3 pr-8 text-sm focus:ring-2"
                style={{ backgroundColor: '#f5f3ec' }}
              >
                <option value="all">전체 카테고리</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div data-testid="loading-state" className="bg-white rounded-xl border p-8" style={{ borderColor: '#e5e7eb' }}>
              <div className="animate-pulse space-y-4">
                <div className="h-8 rounded w-1/3" style={{ backgroundColor: '#f5f3ec' }} />
                <div className="h-40 rounded w-full" style={{ backgroundColor: '#f5f3ec' }} />
              </div>
            </div>
          ) : allTools.length === 0 ? (
            <div data-testid="empty-state" className="bg-white rounded-xl border p-12 text-center" style={{ borderColor: '#e5e7eb' }}>
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2c2c2c' }}>등록된 도구가 없습니다</h3>
              <p className="text-sm text-slate-500">tool_definitions 테이블에 도구를 등록하세요.</p>
            </div>
          ) : (
            <>
              {/* Tools Table */}
              <div data-testid="tool-catalog" className="bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b" style={{ backgroundColor: '#f5f3ec', borderColor: '#e5e7eb' }}>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">도구명</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">카테고리</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">범위</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">상태</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ divideColor: '#f3f4f6' }}>
                      {filteredTools.map((tool) => {
                        const badge = categoryBadgeColors[tool.category] || categoryBadgeColors.common
                        return (
                          <tr key={tool.name} className="hover:bg-[#fcfbf9] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
                                  <svg className="w-5 h-5" style={{ color: '#e57373' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                </div>
                                <div>
                                  <p className="text-sm font-bold" style={{ color: '#2c2c2c' }}>{tool.name}</p>
                                  <p className="text-xs text-slate-400">{tool.description || 'No description'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: badge.bg, color: badge.text }}>
                                {tool.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" style={{ backgroundColor: 'rgba(224,122,95,0.1)', color: '#e07a5f', borderColor: 'rgba(224,122,95,0.2)' }}>
                                platform
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${tool.registered ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                <span className={`text-xs font-medium ${tool.registered ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {tool.registered ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button className="p-1.5 hover:bg-slate-200 rounded transition-colors text-slate-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                </button>
                                <button className="p-1.5 hover:bg-red-50 rounded transition-colors text-slate-400 hover:text-red-500">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} /></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#f5f3ec' }}>
                  <p className="text-xs text-slate-500 font-medium">전체 {allTools.length}개 도구 중 {filteredTools.length} 표시</p>
                  <div className="flex items-center gap-1">
                    <button className="w-7 h-7 flex items-center justify-center text-white rounded-md text-xs font-bold" style={{ backgroundColor: '#e57373' }}>1</button>
                  </div>
                </div>
              </div>

              {/* Agent Permission Matrix */}
              {agents.length > 0 && (
                <div data-testid="permission-matrix" className="mt-6 bg-white rounded-xl border overflow-hidden shadow-sm" style={{ borderColor: '#e5e7eb' }}>
                  <div className="px-6 py-4 border-b" style={{ borderColor: '#e5e7eb' }}>
                    <h3 className="text-sm font-bold" style={{ color: '#2c2c2c' }}>Agent Permission Matrix</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor: '#e5e7eb' }}>
                          <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3 sticky left-0 z-10 bg-white min-w-[180px]">에이전트</th>
                          {filteredTools.map((tool) => (
                            <th key={tool.name} className="px-2 py-3 text-center min-w-[44px]">
                              <span className="text-xs text-slate-400 [writing-mode:vertical-lr] transform -rotate-45 inline-block origin-bottom-left whitespace-nowrap font-mono">
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
                              className={`border-b transition-colors ${isModified ? 'bg-amber-50' : 'hover:bg-[#fcfbf9]'}`}
                              style={{ borderColor: '#f3f4f6' }}
                            >
                              <td className="sticky left-0 z-10 bg-white px-4 py-3 whitespace-nowrap border-r" style={{ borderColor: '#e5e7eb' }}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium" style={{ color: '#2c2c2c' }}>{agent.name}</span>
                                  <span className="text-xs text-slate-500">({agent.tier?.[0]?.toUpperCase() || '?'})</span>
                                  {isModified && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#e07a5f' }} />}
                                </div>
                              </td>
                              {filteredTools.map((tool) => {
                                const checked = agentTools.includes(tool.name)
                                return (
                                  <td key={tool.name} className="px-2 py-3 text-center">
                                    <button
                                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        checked
                                          ? 'text-white'
                                          : 'hover:border-slate-400'
                                      }`}
                                      style={{
                                        backgroundColor: checked ? '#e57373' : '#f3f4f6',
                                        borderColor: checked ? '#e57373' : '#d1d5db',
                                      }}
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
                <div className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm border-t px-6 py-3" style={{ borderColor: '#e5e7eb' }} data-testid="save-bar">
                  <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: '#e07a5f' }}>변경사항 {changeCount}건</span>
                    <div className="flex items-center gap-3">
                      <button onClick={handleCancel} className="bg-slate-100 hover:bg-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors" style={{ color: '#2c2c2c' }}>
                        취소
                      </button>
                      <button onClick={handleSave} disabled={saving} className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" style={{ backgroundColor: '#e57373' }}>
                        {saving ? '저장 중...' : '저장'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* API Reference */}
              <div className="mt-8 p-4 rounded-xl border" style={{ backgroundColor: 'rgba(229,115,115,0.05)', borderColor: 'rgba(229,115,115,0.2)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-bold" style={{ color: '#e57373' }}>API Endpoints Reference</h4>
                </div>
                <code className="text-[11px] font-mono" style={{ color: 'rgba(229,115,115,0.8)' }}>
                  GET/POST/PATCH/DELETE /api/admin/tools
                </code>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
