import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { Skeleton } from '@corthex/ui'

// ============================================================
// Types matching server API response
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
  online: { color: 'bg-emerald-500', label: '온라인' },
  working: { color: 'bg-corthex-accent', pulse: true, label: '작업 중' },
  error: { color: 'bg-corthex-error', label: '오류' },
  offline: { color: 'bg-corthex-border', label: '오프라인' },
}

const TIER_CONFIG: Record<string, { bg: string; label: string }> = {
  manager: { bg: 'bg-corthex-accent-muted text-corthex-accent border border-corthex-border', label: 'Manager' },
  specialist: { bg: 'bg-corthex-elevated text-corthex-text-secondary border border-corthex-border', label: 'Specialist' },
  worker: { bg: 'bg-corthex-elevated text-corthex-text-disabled border border-corthex-border', label: 'Worker' },
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
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 h-full w-80 bg-corthex-surface border-l border-corthex-border shadow-2xl animate-slide-left overflow-y-auto" data-testid="agent-detail-panel">
        <div className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{agent.name}</h2>
            <button onClick={onClose} className="text-corthex-text-disabled hover:text-corthex-text-primary transition-colors text-xl leading-none">&times;</button>
          </div>

          {/* Status + Tier */}
          <div className="flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 font-mono font-bold uppercase tracking-widest ${tier.bg}`}>{tier.label}</span>
            <span className="flex items-center gap-1.5 text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
              {status.label}
            </span>
          </div>

          {/* Model */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">모델</p>
            <p className="text-xs text-corthex-text-disabled font-mono">{agent.modelName}</p>
          </div>

          {/* Role */}
          {agent.role && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">역할</p>
              <p className="text-xs text-corthex-text-disabled">{agent.role}</p>
            </div>
          )}

          {/* Department Move */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">부서 이동</p>
            <div className="flex gap-2">
              <select
                value={moveDeptId}
                onChange={(e) => setMoveDeptId(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs font-mono border border-corthex-border bg-corthex-elevated text-corthex-text-primary focus:ring-2 focus:ring-corthex-accent/30 focus:border-corthex-border-strong focus:outline-none"
              >
                <option value="">미배속</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                onClick={handleMove}
                disabled={!deptChanged || moveMutation.isPending}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {moveMutation.isPending ? '...' : '이동'}
              </button>
            </div>
          </div>

          {/* System badge */}
          {agent.isSystem && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-corthex-accent-muted border border-corthex-border">
              <span className="text-xs">🔒</span>
              <span className="text-xs font-mono text-corthex-accent uppercase tracking-widest">시스템 필수 에이전트</span>
            </div>
          )}

          {/* Soul summary */}
          {soulSummary && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">Soul</p>
              <p className="text-xs text-corthex-text-disabled whitespace-pre-wrap bg-corthex-elevated border border-corthex-border p-2 font-mono">{soulSummary}</p>
            </div>
          )}

          {/* Tools */}
          {tools.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-1">허용 도구 ({tools.length})</p>
              <div className="flex flex-wrap gap-1">
                {tools.map((tool) => (
                  <span key={tool} className="text-xs px-1.5 py-0.5 bg-corthex-elevated border border-corthex-border text-corthex-text-disabled font-mono">
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
      className="flex items-center gap-2 px-3 py-2 bg-corthex-surface border border-corthex-border hover:border-corthex-border-strong hover:bg-corthex-elevated focus:outline-none focus:ring-2 focus:ring-corthex-accent/40 transition-colors cursor-pointer w-full text-left border-l-2 border-l-transparent hover:border-l-corthex-accent"
      data-testid={`agent-node-${agent.id}`}
    >
      <span className={`w-2 h-2 flex-shrink-0 ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-mono text-corthex-text-primary truncate">{agent.name}</span>
      <span className={`text-xs px-1.5 py-0.5 font-mono font-bold uppercase tracking-widest flex-shrink-0 ${tier.bg}`}>{tier.label}</span>
      {agent.isSystem && (
        <span className="text-xs px-1.5 py-0.5 bg-corthex-accent-muted text-corthex-accent border border-corthex-border font-mono uppercase tracking-widest flex-shrink-0">
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
        className="flex items-center gap-2 px-4 py-2.5 bg-corthex-elevated border border-corthex-border hover:bg-corthex-border/50 transition-colors w-full text-left border-l-2 border-l-corthex-accent"
        data-testid={`dept-${dept.id}`}
      >
        <span className="text-xs text-corthex-accent font-mono">{expanded ? '▼' : '▶'}</span>
        <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{dept.name}</span>
        {dept.description && <span className="text-xs font-mono text-corthex-text-disabled truncate hidden sm:inline">— {dept.description}</span>}
        <span className="text-xs px-1.5 py-0.5 bg-corthex-accent-muted text-corthex-accent border border-corthex-border font-mono font-bold uppercase tracking-widest ml-auto flex-shrink-0">
          {dept.agents.length}
        </span>
      </button>
      {expanded && dept.agents.length > 0 && (
        <div className="ml-6 md:ml-10 mt-2 space-y-1.5 border-l-2 border-corthex-border pl-4">
          {dept.agents.map((agent) => (
            <AgentNode key={agent.id} agent={agent} onSelect={onSelectAgent} />
          ))}
        </div>
      )}
      {expanded && dept.agents.length === 0 && (
        <div className="ml-6 md:ml-10 mt-2 border-l-2 border-corthex-border pl-4">
          <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest py-2">에이전트 없음</p>
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
      <Skeleton className="h-8 w-32 bg-corthex-surface" />
      <div className="bg-corthex-surface/50 border border-corthex-border rounded-xl p-6">
        <Skeleton className="h-12 w-full mb-4 bg-corthex-elevated" />
        {[0, 1].map((d) => (
          <div key={d} className="ml-10 mb-4">
            <Skeleton className="h-10 w-full mb-2 bg-corthex-elevated" />
            <div className="ml-10 space-y-1.5 border-l-2 border-corthex-border pl-4">
              {[0, 1, 2].map((a) => (
                <Skeleton key={a} className="h-9 w-full bg-corthex-elevated" />
              ))}
            </div>
          </div>
        ))}
      </div>
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

  // Close panel on Escape
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
      <div className="p-8 space-y-4" data-testid="org-chart-page">
        <h1 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">조직도</h1>
        <div className="bg-corthex-surface border border-corthex-border p-8 text-center">
          <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading || !data) return <OrgChartSkeleton />

  if (isError) {
    return (
      <div className="p-8 space-y-4" data-testid="org-chart-page">
        <h1 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">조직도</h1>
        <div className="bg-corthex-surface border border-corthex-border p-8 text-center space-y-3">
          <p className="text-xs font-mono text-corthex-error uppercase tracking-widest">조직도를 불러올 수 없습니다.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const org = data.data
  const totalAgents = org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length
  const isEmpty = org.departments.length === 0 && org.unassignedAgents.length === 0

  return (
    <div className="p-8 space-y-6" data-testid="org-chart-page">
      <div className="flex items-center gap-2 border-b border-corthex-border pb-4">
        <div className="w-2 h-2 bg-corthex-accent"></div>
        <span className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">System / Org Chart / Registry</span>
      </div>

      <div className="bg-corthex-surface border border-corthex-border">
        {/* Company root node */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-corthex-border bg-corthex-elevated">
          <div className="w-8 h-8 bg-corthex-accent flex items-center justify-center text-corthex-text-on-accent text-sm font-bold flex-shrink-0">
            {org.company.name.charAt(0)}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-corthex-text-primary">{org.company.name}</span>
          <span className="text-xs font-mono text-corthex-text-disabled ml-auto uppercase tracking-widest">
            {org.departments.length}개 부서 · {totalAgents}명 에이전트
          </span>
        </div>

        <div className="p-5">
          {/* Empty state with template CTA */}
          {isEmpty && (
            <div className="text-center py-12 space-y-3">
              <p className="text-xs font-mono text-corthex-text-disabled uppercase tracking-widest">아직 조직이 구성되지 않았습니다.</p>
              <button
                onClick={() => navigate('/org-templates')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover transition-colors"
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
              <div className="flex items-center gap-2 px-4 py-2.5 bg-corthex-elevated border border-corthex-border border-l-2 border-l-corthex-warning">
                <span className="text-xs font-bold uppercase tracking-widest text-corthex-warning">미배속</span>
                <span className="text-xs font-mono text-corthex-text-disabled">부서를 지정하세요</span>
                <span className="text-xs px-1.5 py-0.5 bg-corthex-accent-muted text-corthex-warning border border-corthex-border font-mono font-bold uppercase tracking-widest ml-auto">
                  {org.unassignedAgents.length}
                </span>
              </div>
              <div className="ml-6 md:ml-10 mt-2 space-y-1.5 border-l-2 border-corthex-warning/30 pl-4">
                {org.unassignedAgents.map((agent) => (
                  <AgentNode key={agent.id} agent={agent} onSelect={setSelectedAgent} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
