import { useState, useRef, useCallback, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Input, Badge, Spinner } from '@corthex/ui'
import { api } from '../../../lib/api'
import { useAdminStore } from '../../../stores/admin-store'
import { useToastStore } from '../../../stores/toast-store'
import type { OrgAgent } from '../../../lib/elk-layout'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AgentPanel({ agent }: { agent: OrgAgent }) {
  const companyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const queryClient = useQueryClient()

  const [name, setName] = useState(agent.name)
  const [tierLevel, setTierLevel] = useState(agent.tierLevel ?? 3)
  const [allowedTools, setAllowedTools] = useState<string[]>(agent.allowedTools ?? [])
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state when agent changes (different node selected)
  useEffect(() => {
    setName(agent.name)
    setTierLevel(agent.tierLevel ?? 3)
    setAllowedTools(agent.allowedTools ?? [])
    setSaveStatus('idle')
  }, [agent.id, agent.name, agent.tierLevel, agent.allowedTools])

  // Fetch available tools
  const { data: toolsData } = useQuery({
    queryKey: ['tools', companyId],
    queryFn: () => api.get<{ data: { name: string; description?: string }[] }>(`/admin/tools?companyId=${encodeURIComponent(companyId!)}`),
    enabled: !!companyId,
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch(`/admin/agents/${agent.id}`, data),
    onMutate: async (update) => {
      await queryClient.cancelQueries({ queryKey: ['org-chart', companyId] })
      const prev = queryClient.getQueryData(['org-chart', companyId])
      queryClient.setQueryData(['org-chart', companyId], (old: unknown) => {
        if (!old || typeof old !== 'object') return old
        const o = old as { data: { departments: { agents: OrgAgent[] }[]; unassignedAgents: OrgAgent[] } }
        if (!o.data) return old
        const updateAgent = (a: OrgAgent) =>
          a.id === agent.id ? { ...a, ...update } : a
        return {
          ...o,
          data: {
            ...o.data,
            departments: o.data.departments.map((d) => ({
              ...d,
              agents: d.agents.map(updateAgent),
            })),
            unassignedAgents: o.data.unassignedAgents.map(updateAgent),
          },
        }
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['org-chart', companyId], ctx.prev)
      setSaveStatus('error')
      addToast({ type: 'error', message: '저장에 실패했습니다' })
    },
    onSuccess: () => {
      setSaveStatus('saved')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['org-chart', companyId] })
    },
  })

  const debounceSave = useCallback(
    (data: Record<string, unknown>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setSaveStatus('saving')
      saveTimerRef.current = setTimeout(() => {
        mutation.mutate(data)
      }, 500)
    },
    [mutation],
  )

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const handleNameChange = (val: string) => {
    setName(val)
    debounceSave({ name: val })
  }

  const handleTierChange = (val: string) => {
    const level = parseInt(val, 10)
    setTierLevel(level)
    const tierMap: Record<number, string> = { 1: 'manager', 2: 'specialist', 3: 'worker' }
    debounceSave({ tierLevel: level, tier: tierMap[level] || 'worker' })
  }

  const handleToolToggle = (toolName: string) => {
    const next = allowedTools.includes(toolName)
      ? allowedTools.filter((t) => t !== toolName)
      : [...allowedTools, toolName]
    setAllowedTools(next)
    debounceSave({ allowedTools: next })
  }

  const statusLabel: Record<string, string> = {
    online: '온라인',
    working: '작업 중',
    error: '오류',
    offline: '오프라인',
  }

  const statusColor: Record<string, string> = {
    online: 'bg-emerald-500',
    working: 'bg-blue-500',
    error: 'bg-red-500',
    offline: 'bg-slate-500',
  }

  const availableTools = toolsData?.data ?? []

  return (
    <div className="space-y-4" data-testid="agent-panel">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor[agent.status] ?? 'bg-slate-500'}`} />
        <h3 className="text-sm font-semibold text-slate-100 truncate flex-1">{agent.name}</h3>
        <SaveIndicator status={saveStatus} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="default">{statusLabel[agent.status] ?? '오프라인'}</Badge>
        {agent.isSecretary && <Badge variant="warning">비서</Badge>}
        {agent.isSystem && <Badge variant="default">시스템</Badge>}
      </div>

      <div className="border-b border-slate-800" />

      {/* Name */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">이름</label>
        <Input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mt-1"
          data-testid="agent-name-input"
        />
      </div>

      {/* Tier */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">Tier</label>
        <select
          value={tierLevel}
          onChange={(e) => handleTierChange(e.target.value)}
          className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="agent-tier-select"
        >
          <option value={1}>Manager (T1)</option>
          <option value={2}>Specialist (T2)</option>
          <option value={3}>Worker (T3)</option>
        </select>
      </div>

      {/* Model */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">모델</label>
        <p className="mt-1 text-sm text-slate-300">{agent.modelName || '미설정'}</p>
      </div>

      {/* Soul edit link */}
      <div>
        <a
          href="/admin/agents"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Soul 편집 (에이전트 관리) →
        </a>
      </div>

      <div className="border-b border-slate-800" />

      {/* Allowed Tools */}
      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">허용 도구 ({allowedTools.length})</label>
        <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
          {availableTools.length > 0 ? (
            availableTools.map((tool) => (
              <label
                key={tool.name}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800/50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={allowedTools.includes(tool.name)}
                  onChange={() => handleToolToggle(tool.name)}
                  className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-300 truncate">{tool.name}</span>
              </label>
            ))
          ) : (
            <p className="text-xs text-slate-600 py-2">도구 목록을 불러오는 중...</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') return <Spinner className="w-3 h-3" />
  if (status === 'saved') return <span className="text-[10px] text-emerald-400">✓ 저장됨</span>
  if (status === 'error') return <span className="text-[10px] text-red-400">저장 실패</span>
  return null
}
