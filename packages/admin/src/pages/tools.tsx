import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'

type Tool = {
  id: string; companyId: string; name: string; description: string | null
  scope: string; handler: string | null; isActive: boolean; createdAt: string
}
type Agent = { id: string; name: string }
type AgentTool = { id: string; agentId: string; toolId: string; isEnabled: boolean }

export function ToolsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', scope: 'company' })
  const [selectedTool, setSelectedTool] = useState<string | null>(null)
  const [assignAgentId, setAssignAgentId] = useState('')

  const { data: toolData, isLoading } = useQuery({
    queryKey: ['tools', selectedCompanyId],
    queryFn: () => api.get<{ data: Tool[] }>(`/admin/tools?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: agentData } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const tools = toolData?.data || []
  const agents = agentData?.data || []

  // agent-tools for selected tool's agents
  const { data: agentToolsForSelected } = useQuery({
    queryKey: ['agent-tools-by-agent', selectedTool],
    queryFn: async () => {
      // Get all agent-tools for each agent that has this tool
      const results: (AgentTool & { agentName: string })[] = []
      for (const agent of agents) {
        const res = await api.get<{ data: AgentTool[] }>(`/admin/agent-tools?agentId=${agent.id}`)
        for (const at of res.data) {
          if (at.toolId === selectedTool) {
            results.push({ ...at, agentName: agent.name })
          }
        }
      }
      return results
    },
    enabled: !!selectedTool && agents.length > 0,
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/admin/tools', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tools'] })
      setShowCreate(false)
      setForm({ name: '', description: '', scope: 'company' })
      addToast({ type: 'success', message: '도구가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const assignMutation = useMutation({
    mutationFn: (body: { companyId: string; agentId: string; toolId: string }) =>
      api.post('/admin/agent-tools', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-tools-by-agent'] })
      setAssignAgentId('')
      addToast({ type: 'success', message: '에이전트에 도구가 배정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }: { id: string; isEnabled: boolean }) =>
      api.patch(`/admin/agent-tools/${id}`, { isEnabled }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-tools-by-agent'] })
      addToast({ type: 'success', message: '도구 상태가 변경되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const unassignMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/agent-tools/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-tools-by-agent'] })
      addToast({ type: 'success', message: '도구 배정이 해제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const scopeColors: Record<string, string> = {
    platform: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    company: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    department: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">도구 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{tools.length}개 도구</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 도구 추가
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 도구</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedCompanyId) return
              createMutation.mutate({ companyId: selectedCompanyId, ...form })
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">범위</label>
                <select
                  value={form.scope}
                  onChange={(e) => setForm({ ...form, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="platform">Platform</option>
                  <option value="company">Company</option>
                  <option value="department">Department</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">설명</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-zinc-600">
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                생성
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center text-zinc-500 py-8">로딩 중...</div>
          ) : (
            <div className="space-y-3">
              {tools.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTool(t.id)}
                  className={`bg-white dark:bg-zinc-900 rounded-xl border p-4 cursor-pointer transition-colors ${
                    selectedTool === t.id
                      ? 'border-indigo-500 dark:border-indigo-400'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</h3>
                      {t.description && <p className="text-xs text-zinc-500 mt-0.5">{t.description}</p>}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${scopeColors[t.scope] || ''}`}>
                      {t.scope}
                    </span>
                  </div>
                </div>
              ))}
              {tools.length === 0 && (
                <p className="text-center text-zinc-500 py-8">등록된 도구가 없습니다</p>
              )}
            </div>
          )}
        </div>

        {/* 에이전트 배정 패널 */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">에이전트 배정</h2>
          {!selectedTool ? (
            <p className="text-sm text-zinc-500">도구를 선택하세요</p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={assignAgentId}
                  onChange={(e) => setAssignAgentId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                >
                  <option value="">에이전트 선택</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!selectedCompanyId || !assignAgentId || !selectedTool) return
                    assignMutation.mutate({ companyId: selectedCompanyId, agentId: assignAgentId, toolId: selectedTool })
                  }}
                  disabled={!assignAgentId || assignMutation.isPending}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  배정
                </button>
              </div>

              <div className="space-y-2">
                {(agentToolsForSelected || []).map((at) => (
                  <div
                    key={at.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${at.isEnabled ? 'bg-green-500' : 'bg-zinc-400'}`} />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{at.agentName}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleMutation.mutate({ id: at.id, isEnabled: !at.isEnabled })}
                        className="text-xs text-indigo-600 hover:text-indigo-700"
                      >
                        {at.isEnabled ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => unassignMutation.mutate(at.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        해제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
