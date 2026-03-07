import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Card, CardContent, Skeleton } from '@corthex/ui'

// ============================================================
// Types matching server API response (Story 2-5 enhanced)
// ============================================================
type OrgAgent = {
  id: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  departmentId: string | null
  status: string
  isSecretary: boolean
  isSystem: boolean
  soul: string | null
  allowedTools: string[] | null
}

type OrgDept = {
  id: string
  name: string
  description: string | null
  agents: OrgAgent[]
}

type OrgChartData = {
  data: {
    company: { id: string; name: string; slug: string }
    departments: OrgDept[]
    unassignedAgents: OrgAgent[]
  }
}

// ============================================================
// Constants
// ============================================================
const STATUS_CONFIG: Record<string, { color: string; pulse?: boolean; label: string }> = {
  online: { color: 'bg-green-500', label: '온라인' },
  working: { color: 'bg-blue-500', pulse: true, label: '작업 중' },
  error: { color: 'bg-red-500', label: '오류' },
  offline: { color: 'bg-gray-400', label: '오프라인' },
}

const TIER_CONFIG: Record<string, { bg: string; label: string }> = {
  manager: { bg: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300', label: 'Manager' },
  specialist: { bg: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', label: 'Specialist' },
  worker: { bg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', label: 'Worker' },
}

// ============================================================
// AgentDetailPanel -- slide-in from right with department move
// ============================================================
function AgentDetailPanel({
  agent,
  departments,
  onClose,
}: {
  agent: OrgAgent
  departments: OrgDept[]
  onClose: () => void
}) {
  const qc = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
  const tier = TIER_CONFIG[agent.tier] || TIER_CONFIG.specialist
  const tools = agent.allowedTools || []
  const soulSummary = agent.soul ? (agent.soul.length > 200 ? agent.soul.slice(0, 200) + '...' : agent.soul) : null

  const [moveDeptId, setMoveDeptId] = useState(agent.departmentId || '')

  const moveMutation = useMutation({
    mutationFn: (newDeptId: string | null) =>
      api.patch(`/admin/agents/${agent.id}`, { departmentId: newDeptId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-chart'] })
      qc.invalidateQueries({ queryKey: ['agents'] })
      addToast({ type: 'success', message: `${agent.name}의 부서가 변경되었습니다` })
      onClose()
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  function handleMove() {
    const newDeptId = moveDeptId || null
    if (newDeptId === agent.departmentId) return
    moveMutation.mutate(newDeptId)
  }

  const deptChanged = (moveDeptId || null) !== (agent.departmentId || null)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-80 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-xl animate-slide-left overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{agent.name}</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xl leading-none">&times;</button>
          </div>

          {/* Status + Tier */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${tier.bg}`}>{tier.label}</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>

          {/* Model */}
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">모델</p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">{agent.modelName}</p>
          </div>

          {/* Role */}
          {agent.role && (
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">역할</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{agent.role}</p>
            </div>
          )}

          {/* Department Move */}
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">부서 이동</p>
            <div className="flex gap-2">
              <select
                value={moveDeptId}
                onChange={(e) => setMoveDeptId(e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="">미배속</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={handleMove}
                disabled={!deptChanged || moveMutation.isPending}
                className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {moveMutation.isPending ? '...' : '이동'}
              </button>
            </div>
          </div>

          {/* System badge */}
          {agent.isSystem && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <span className="text-xs">🔒</span>
              <span className="text-xs text-amber-700 dark:text-amber-300">시스템 필수 에이전트</span>
            </div>
          )}

          {/* Soul summary */}
          {soulSummary && (
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Soul</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800 rounded p-2">{soulSummary}</p>
            </div>
          )}

          {/* Tools */}
          {tools.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">허용 도구 ({tools.length})</p>
              <div className="flex flex-wrap gap-1">
                {tools.map((tool) => (
                  <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ============================================================
// AgentNode -- individual agent in the tree
// ============================================================
function AgentNode({ agent, onSelect }: { agent: OrgAgent; onSelect: (a: OrgAgent) => void }) {
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
  const tier = TIER_CONFIG[agent.tier] || TIER_CONFIG.specialist

  return (
    <button
      onClick={() => onSelect(agent)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-pointer w-full text-left"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-zinc-900 dark:text-zinc-100 truncate">{agent.name}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${tier.bg}`}>{tier.label}</span>
      {agent.isSystem && (
        <span className="text-[10px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex-shrink-0">
          🔒 시스템
        </span>
      )}
    </button>
  )
}

// ============================================================
// DepartmentSection -- collapsible department with agents
// ============================================================
function DepartmentSection({ dept, onSelectAgent }: { dept: OrgDept; onSelectAgent: (a: OrgAgent) => void }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="ml-6 md:ml-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors w-full text-left"
      >
        <span className="text-xs text-indigo-400">{expanded ? '▼' : '▶'}</span>
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{dept.name}</span>
        {dept.description && <span className="text-xs text-indigo-400 dark:text-indigo-500 truncate hidden sm:inline">— {dept.description}</span>}
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 ml-auto flex-shrink-0">
          {dept.agents.length}
        </span>
      </button>
      {expanded && dept.agents.length > 0 && (
        <div className="ml-6 md:ml-10 mt-2 space-y-1.5 border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
          {dept.agents.map((agent) => (
            <AgentNode key={agent.id} agent={agent} onSelect={onSelectAgent} />
          ))}
        </div>
      )}
      {expanded && dept.agents.length === 0 && (
        <div className="ml-6 md:ml-10 mt-2 border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
          <p className="text-xs text-zinc-400 py-2">에이전트 없음</p>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Loading Skeleton
// ============================================================
function OrgChartSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <Card>
        <CardContent>
          <Skeleton className="h-12 w-full mb-4" />
          {[0, 1].map((d) => (
            <div key={d} className="ml-10 mb-4">
              <Skeleton className="h-10 w-full mb-2" />
              <div className="ml-10 space-y-1.5 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
                {[0, 1, 2].map((a) => (
                  <Skeleton key={a} className="h-9 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================
export function OrgChartPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const navigate = useNavigate()
  const [selectedAgent, setSelectedAgent] = useState<OrgAgent | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['org-chart', selectedCompanyId],
    queryFn: () => api.get<OrgChartData>(`/admin/org-chart?companyId=${encodeURIComponent(selectedCompanyId!)}`),
    enabled: !!selectedCompanyId,
  })

  // Close panel on Escape (global listener so it works regardless of focus)
  useEffect(() => {
    if (!selectedAgent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAgent(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedAgent])

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">조직도</h1>
        <Card><CardContent>
          <p className="text-sm text-zinc-500 text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </CardContent></Card>
      </div>
    )
  }

  if (isLoading || !data) return <OrgChartSkeleton />

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">조직도</h1>
        <Card><CardContent>
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">조직도를 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </CardContent></Card>
      </div>
    )
  }

  const org = data.data
  const totalAgents = org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length
  const isEmpty = org.departments.length === 0 && org.unassignedAgents.length === 0

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">조직도</h1>

      <Card>
        <CardContent>
          {/* Company root node */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mb-4">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {org.company.name.charAt(0)}
            </span>
            <span className="text-sm font-semibold">{org.company.name}</span>
            <span className="text-xs opacity-60 ml-auto">
              {org.departments.length}개 부서 · {totalAgents}명 에이전트
            </span>
          </div>

          {/* Empty state with template CTA */}
          {isEmpty && (
            <div className="text-center py-12 space-y-3">
              <p className="text-sm text-zinc-500">아직 조직이 구성되지 않았습니다.</p>
              <button
                onClick={() => navigate('/org-templates')}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                템플릿으로 시작하세요
              </button>
            </div>
          )}

          {/* Department tree */}
          {!isEmpty && (
            <div className="space-y-3">
              {org.departments.map((dept) => (
                <DepartmentSection key={dept.id} dept={dept} onSelectAgent={setSelectedAgent} />
              ))}
            </div>
          )}

          {/* Unassigned agents */}
          {org.unassignedAgents.length > 0 && (
            <div className="ml-6 md:ml-10 mt-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">미배속</span>
                <span className="text-xs text-amber-500 dark:text-amber-400">부서를 지정하세요</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-600 dark:text-amber-400 ml-auto">
                  {org.unassignedAgents.length}
                </span>
              </div>
              <div className="ml-6 md:ml-10 mt-2 space-y-1.5 border-l-2 border-amber-200 dark:border-amber-800 pl-4">
                {org.unassignedAgents.map((agent) => (
                  <AgentNode key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agent detail side panel */}
      {selectedAgent && (
        <AgentDetailPanel
          key={selectedAgent.id}
          agent={selectedAgent}
          departments={org.departments}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  )
}
