import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'

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
    return <div className="p-6 text-slate-400 text-sm">회사를 선택해 주세요.</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">에이전트-MCP 접근 권한</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          에이전트별로 MCP 서버 접근 권한을 설정하세요. 기본값은 모두 OFF입니다. (D22)
        </p>
      </div>

      {/* Agent Selector */}
      <div className="space-y-1">
        <label className="text-xs text-slate-400 font-medium">에이전트 선택</label>
        <select
          value={selectedAgentId ?? ''}
          onChange={e => setSelectedAgentId(e.target.value || null)}
          className="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-48"
        >
          <option value="">에이전트를 선택하세요</option>
          {agents.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Access Matrix */}
      {!selectedAgentId ? (
        <div className="text-slate-500 text-sm">에이전트를 선택하면 MCP 접근 권한 목록이 표시됩니다.</div>
      ) : mcpServers.length === 0 ? (
        <div className="text-slate-400 text-sm">
          <p>등록된 MCP 서버가 없습니다.</p>
          <p className="text-xs mt-1 text-slate-500">
            먼저 <a href="/admin/mcp-servers" className="text-blue-400 hover:underline">MCP 서버 관리</a>에서 서버를 등록하세요.
          </p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-700 bg-slate-800/80">
                <th className="px-4 py-3 font-medium w-8">접근</th>
                <th className="px-4 py-3 font-medium">MCP 서버</th>
                <th className="px-4 py-3 font-medium">Transport</th>
                <th className="px-4 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {mcpServers.map(server => {
                const granted = accessibleIds.has(server.id)
                const isSaving = saving[server.id] ?? false
                return (
                  <tr key={server.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={granted}
                        disabled={isSaving}
                        onChange={() => handleToggle(server.id, granted)}
                        className="w-4 h-4 rounded border-slate-600 text-blue-500 bg-slate-900 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer disabled:cursor-wait"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-white">{server.displayName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                        server.transport === 'stdio'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {server.transport}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSaving ? (
                        <span className="text-xs text-slate-400">저장 중...</span>
                      ) : granted ? (
                        <span className="text-xs text-emerald-400">✓ 허용됨</span>
                      ) : (
                        <span className="text-xs text-slate-500">— 차단됨</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-500">
              체크박스 클릭 시 즉시 저장됩니다. 변경 사항은 다음 에이전트 세션부터 적용됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
