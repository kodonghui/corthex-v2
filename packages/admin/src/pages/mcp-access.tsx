import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { ShieldCheck, Users, Network, Search, Trash2, ChevronLeft, ChevronRight, Terminal } from 'lucide-react'

// Story 19.4: Agent-MCP Access Matrix UI (FR-MCP2, D22)
// Admin grants/revokes per-agent MCP access via checkboxes.
// D22: default OFF — all checkboxes start unchecked unless agent_mcp_access row exists.

type Agent = {
  id: string
  name: string
  isActive: boolean
}

type McpServer = {
  id: string
  displayName: string
  transport: string
  isActive: boolean
}

export function McpAccessPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const queryClient = useQueryClient()
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  // List all active agents
  const { data: agentsData } = useQuery({
    queryKey: ['agents-for-mcp', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  // List all active MCP servers
  const { data: mcpData } = useQuery({
    queryKey: ['mcp-servers-for-matrix', selectedCompanyId],
    queryFn: () => api.get<{ data: McpServer[] }>('/admin/mcp-servers'),
    enabled: !!selectedCompanyId,
  })

  // List MCP servers accessible to selected agent
  const { data: accessData, refetch: refetchAccess } = useQuery({
    queryKey: ['agent-mcp-access', selectedAgentId],
    queryFn: () =>
      api.get<{ data: McpServer[] }>(`/admin/agents/${selectedAgentId}/mcp-access`),
    enabled: !!selectedAgentId,
  })

  const agents = agentsData?.data?.filter(a => a.isActive) ?? []
  const mcpServers = mcpData?.data ?? []
  const accessibleIds = new Set((accessData?.data ?? []).map(s => s.id))

  const grantRevokeMutation = useMutation({
    mutationFn: ({ mcpServerId, grant }: { mcpServerId: string; grant: boolean }) =>
      api.put(`/admin/agents/${selectedAgentId}/mcp-access`, { mcpServerId, grant }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-mcp-access', selectedAgentId] })
      refetchAccess()
    },
  })

  async function handleToggle(mcpServerId: string, currentlyGranted: boolean) {
    setSaving(prev => ({ ...prev, [mcpServerId]: true }))
    try {
      await grantRevokeMutation.mutateAsync({ mcpServerId, grant: !currentlyGranted })
    } finally {
      setSaving(prev => ({ ...prev, [mcpServerId]: false }))
    }
  }

  if (!selectedCompanyId) {
    return <div className="p-6 text-corthex-text-disabled text-sm">회사를 선택해 주세요.</div>
  }

  const selectedAgent = agents.find(a => a.id === selectedAgentId)
  const grantedCount = accessibleIds.size

  return (
    <div className="p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-black tracking-tight text-corthex-text-primary uppercase">Access Control</h2>
          <p className="text-corthex-text-secondary text-sm mt-1 max-w-lg">
            에이전트별로 MCP 서버 접근 권한을 설정하세요. 기본값은 모두 OFF입니다. (D22)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs text-corthex-text-disabled font-mono uppercase tracking-widest">에이전트 선택</label>
          <select
            value={selectedAgentId ?? ''}
            onChange={e => setSelectedAgentId(e.target.value || null)}
            className="bg-corthex-surface border border-corthex-border rounded px-3 py-2 text-base sm:text-sm text-corthex-text-primary focus:outline-none focus:ring-1 focus:ring-corthex-accent min-w-48 min-h-[44px]"
          >
            <option value="">에이전트를 선택하세요</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bento Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-corthex-surface border border-corthex-border p-4 lg:p-5 flex flex-col justify-between">
          <span className="text-corthex-text-disabled text-xs font-bold tracking-widest uppercase">Active Agents</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-mono text-corthex-accent">{agents.length}</span>
          </div>
        </div>
        <div className="bg-corthex-surface border border-corthex-border p-4 lg:p-5 flex flex-col justify-between">
          <span className="text-corthex-text-disabled text-xs font-bold tracking-widest uppercase">MCP Nodes</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-mono text-corthex-accent">{mcpServers.length}</span>
            <span className="text-corthex-text-disabled text-xs font-mono">STABLE</span>
          </div>
        </div>
        <div className="col-span-2 md:col-span-2 bg-corthex-elevated border border-corthex-border p-4 lg:p-5 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-corthex-text-disabled text-xs font-bold tracking-widest uppercase">Security Level</span>
            <div className="mt-4 text-2xl font-mono text-corthex-accent">CLASS-IV</div>
          </div>
          <div className="opacity-10">
            <ShieldCheck className="w-20 h-20 text-corthex-accent" />
          </div>
        </div>
      </div>

      {/* Access Control Table */}
      <div className="bg-corthex-surface border border-corthex-border overflow-hidden shadow-2xl">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-corthex-border bg-corthex-elevated flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <input
                disabled
                className="bg-corthex-surface border border-corthex-border text-base sm:text-xs font-mono pl-10 pr-4 py-2 w-full sm:w-64 focus:ring-1 focus:ring-corthex-accent outline-none text-corthex-text-secondary placeholder-corthex-text-disabled rounded min-h-[44px]"
                placeholder="FILTER BY AGENT OR SERVER..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-corthex-text-disabled text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            LIVE ACCESS LOGS
          </div>
        </div>

        {/* Matrix Content */}
        {!selectedAgentId ? (
          <div className="px-6 py-16 text-center">
            <Users className="w-10 h-10 text-corthex-text-disabled mx-auto mb-3" />
            <p className="text-corthex-text-secondary text-sm">에이전트를 선택하면 MCP 접근 권한 목록이 표시됩니다.</p>
          </div>
        ) : mcpServers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Network className="w-10 h-10 text-corthex-text-disabled mx-auto mb-3" />
            <p className="text-corthex-text-disabled text-sm">등록된 MCP 서버가 없습니다.</p>
            <p className="text-xs mt-1 text-corthex-text-secondary">
              먼저 MCP 서버 관리에서 서버를 등록하세요.
            </p>
          </div>
        ) : (
          <>
          {/* Desktop Table */}
          <div className="overflow-x-auto hidden lg:block">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-corthex-elevated/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest border-b border-corthex-border">Agent Entity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest border-b border-corthex-border">MCP Server Hub</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest border-b border-corthex-border">Transport</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest border-b border-corthex-border">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest border-b border-corthex-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border/50">
                {mcpServers.map(server => {
                  const granted = accessibleIds.has(server.id)
                  const isSaving = saving[server.id] ?? false
                  return (
                    <tr key={server.id} className="hover:bg-corthex-elevated/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-corthex-text-primary">{selectedAgent?.name ?? '—'}</div>
                          <div className="text-[10px] font-mono text-corthex-text-disabled">ID: {selectedAgentId?.slice(0, 8)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${granted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-corthex-text-disabled'}`} />
                          <span className="font-mono text-xs text-corthex-text-secondary">{server.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                          server.transport === 'stdio'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {server.transport}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={granted}
                            disabled={isSaving}
                            onChange={() => handleToggle(server.id, granted)}
                            className="w-4 h-4 rounded border-corthex-border text-corthex-accent bg-corthex-bg focus:ring-corthex-accent cursor-pointer disabled:cursor-wait"
                          />
                          {isSaving ? (
                            <span className="text-xs text-corthex-text-disabled">저장 중...</span>
                          ) : granted ? (
                            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wide">✓ 허용됨</span>
                          ) : (
                            <span className="text-xs font-mono text-corthex-text-secondary uppercase tracking-wide">— 차단됨</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {granted && (
                          <button
                            onClick={() => handleToggle(server.id, granted)}
                            disabled={isSaving}
                            className="text-corthex-text-disabled hover:text-red-400 transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-corthex-border/50">
            {mcpServers.map(server => {
              const granted = accessibleIds.has(server.id)
              const isSaving = saving[server.id] ?? false
              return (
                <div key={server.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${granted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-corthex-text-disabled'}`} />
                      <span className="font-mono text-sm font-bold text-corthex-text-secondary">{server.displayName}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                      server.transport === 'stdio'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {server.transport}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={granted}
                        disabled={isSaving}
                        onChange={() => handleToggle(server.id, granted)}
                        className="w-5 h-5 rounded border-corthex-border text-corthex-accent bg-corthex-bg focus:ring-corthex-accent cursor-pointer disabled:cursor-wait"
                      />
                      {isSaving ? (
                        <span className="text-xs text-corthex-text-disabled">저장 중...</span>
                      ) : granted ? (
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wide">✓ 허용됨</span>
                      ) : (
                        <span className="text-xs font-mono text-corthex-text-secondary uppercase tracking-wide">— 차단됨</span>
                      )}
                    </div>
                    {granted && (
                      <button
                        onClick={() => handleToggle(server.id, granted)}
                        disabled={isSaving}
                        className="text-corthex-text-disabled hover:text-red-400 transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-corthex-text-disabled">
                    {selectedAgent?.name ?? '—'} · ID: {selectedAgentId?.slice(0, 8)}
                  </div>
                </div>
              )
            })}
          </div>
          </>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-corthex-border bg-corthex-bg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-corthex-text-disabled uppercase">
            {selectedAgentId ? `DISPLAYING ${mcpServers.length} SERVERS · ${grantedCount} GRANTED` : 'SELECT AN AGENT TO VIEW PERMISSIONS'}
          </span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center border border-corthex-border text-corthex-text-disabled hover:text-corthex-accent transition-colors rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-corthex-accent text-corthex-accent text-xs font-mono rounded">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-corthex-border text-corthex-text-disabled hover:text-corthex-accent transition-colors rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Security Audit Section */}
      <div className="p-6 border border-corthex-border/50 bg-corthex-surface/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-corthex-accent/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-corthex-text-primary mb-2 uppercase tracking-wide">System Security Audit</h3>
            <p className="text-corthex-text-secondary text-sm max-w-xl">
              모든 접근 권한은 즉시 적용되며 다음 에이전트 세션부터 반영됩니다. 체크박스 클릭 시 즉시 저장됩니다.
            </p>
          </div>
          <button className="px-5 py-2.5 border border-corthex-border text-corthex-text-secondary hover:border-corthex-accent hover:text-corthex-accent transition-all flex items-center gap-2 font-mono text-xs tracking-widest uppercase rounded whitespace-nowrap min-h-[44px]">
            <Terminal className="w-4 h-4" />
            Run Full Audit Trace
          </button>
        </div>
      </div>
    </div>
  )
}
