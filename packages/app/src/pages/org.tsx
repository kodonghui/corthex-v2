import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

// ── Types ──

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

// ── Constants ──

type ViewMode = 'tree' | 'list'

const STATUS_CONFIG: Record<string, { dot: string; shadow?: string; pulse?: boolean; label: string; textColor: string }> = {
  online: { dot: 'bg-emerald-500', shadow: 'shadow-[0_0_6px_rgba(16,185,129,0.4)]', label: '온라인', textColor: 'text-emerald-400' },
  working: { dot: 'bg-blue-500', shadow: 'shadow-[0_0_6px_rgba(59,130,246,0.4)]', pulse: true, label: '작업 중', textColor: 'text-blue-400' },
  error: { dot: 'bg-red-500', shadow: 'shadow-[0_0_6px_rgba(239,68,68,0.4)]', label: '오류', textColor: 'text-red-400' },
  offline: { dot: 'bg-corthex-surface', label: '오프라인', textColor: 'text-corthex-text-secondary' },
}

const TIER_CONFIG: Record<string, { classes: string; label: string }> = {
  manager: { classes: 'bg-corthex-accent/15 text-corthex-accent', label: 'Manager' },
  specialist: { classes: 'bg-blue-500/15 text-blue-400', label: 'Specialist' },
  worker: { classes: 'bg-corthex-surface/15 text-corthex-text-secondary', label: 'Worker' },
}

const TIER_ORDER: Record<string, number> = { manager: 0, specialist: 1, worker: 2 }

function sortAgentsByTier(agents: OrgAgent[]): OrgAgent[] {
  return [...agents].sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9))
}

// ── AgentDetailPanel ──

function AgentDetailPanel({ agent, onClose }: { agent: OrgAgent; onClose: () => void }) {
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
  const tier = TIER_CONFIG[agent.tier] || TIER_CONFIG.specialist
  const tools = agent.allowedTools || []
  const soulText = agent.soul || null

  return (
    <div className="fixed inset-0 z-40" data-testid="agent-detail-panel">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 md:w-96 bg-corthex-elevated border-l border-corthex-border shadow-2xl overflow-y-auto">
        <div className="px-5 py-4 border-b border-corthex-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-corthex-text-primary">{agent.name}</h2>
            {agent.isSecretary && <span className="text-sm text-corthex-accent">(비서실장)</span>}
          </div>
          <button onClick={onClose} aria-label="닫기" className="text-corthex-text-secondary hover:text-corthex-accent-deep text-xl leading-none">✕</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Status + Tier */}
          <div className="flex items-center gap-3">
            <span className={`w-3 h-3 rounded-full ${status.dot} ${status.shadow || ''} ${status.pulse ? 'animate-pulse' : ''}`} />
            <span className={`text-sm ${status.textColor}`}>{status.label}</span>
            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${tier.classes}`}>{tier.label}</span>
          </div>

          {/* Info Fields */}
          <div>
            <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">모델</p>
            <p className="text-sm text-corthex-accent-deep mt-0.5">{agent.modelName}</p>
          </div>

          <div>
            <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">역할</p>
            <p className="text-sm text-corthex-accent-deep mt-0.5">{agent.role || '역할 미지정'}</p>
          </div>

          <div>
            <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">계급</p>
            <p className="text-sm text-corthex-accent-deep mt-0.5">{tier.label}</p>
          </div>

          {agent.isSystem && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/20">
              <span className="text-xs text-amber-400">시스템 필수 에이전트</span>
            </div>
          )}

          {/* Soul */}
          <div>
            <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">SOUL</p>
            {soulText ? (
              <div className="bg-corthex-surface/50 border border-corthex-border rounded-lg p-3 mt-1">
                <p className="text-xs text-corthex-text-secondary leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">{soulText}</p>
              </div>
            ) : (
              <p className="text-xs text-corthex-text-secondary italic mt-1">Soul이 설정되지 않았습니다</p>
            )}
          </div>

          {/* Tools */}
          <div>
            <p className="text-[10px] text-corthex-text-secondary font-medium uppercase tracking-wider">허용 도구</p>
            {tools.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {tools.map((tool) => (
                  <span key={tool} className="text-[10px] bg-corthex-border/50 text-corthex-text-secondary px-2 py-0.5 rounded-full">{tool}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-corthex-text-secondary italic mt-1">도구가 할당되지 않았습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── AgentNode ──

function AgentNode({ agent, isSelected, onSelect }: { agent: OrgAgent; isSelected: boolean; onSelect: (a: OrgAgent) => void }) {
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
  const tier = TIER_CONFIG[agent.tier] || TIER_CONFIG.specialist

  return (
    <div
      data-testid={`agent-node-${agent.id}`}
      onClick={() => onSelect(agent)}
      className={`bg-corthex-elevated border rounded-lg p-3 cursor-pointer hover:border-corthex-border-strong hover:bg-corthex-border/50 transition-all ${
        isSelected ? 'border-blue-500/30 bg-blue-500/5' : 'border-corthex-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`w-2 h-2 rounded-full ${status.dot} ${status.shadow || ''} ${status.pulse ? 'animate-pulse' : ''}`} />
        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${tier.classes}`}>{tier.label}</span>
      </div>
      <p className="text-xs font-semibold text-corthex-accent-deep mt-2 truncate">
        {agent.name}
        {agent.isSecretary && <span className="text-corthex-accent"> (비서실장)</span>}
      </p>
      <p className={`text-[10px] mt-0.5 ${status.textColor}`}>{status.label}</p>
      <p className="text-[10px] text-corthex-text-secondary mt-1 truncate">{agent.role || '역할 미지정'}</p>
    </div>
  )
}

// ── DepartmentSection ──

function DepartmentSection({ dept, selectedAgentId, onSelectAgent }: { dept: OrgDept; selectedAgentId: string | null; onSelectAgent: (a: OrgAgent) => void }) {
  const [expanded, setExpanded] = useState(true)
  const sortedAgents = sortAgentsByTier(dept.agents)

  return (
    <div data-testid={`dept-section-${dept.id}`} className="bg-corthex-elevated border border-corthex-border rounded-xl overflow-hidden">
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-corthex-elevated/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-corthex-text-secondary">{expanded ? '▼' : '▶'}</span>
          <span className="text-sm font-semibold text-corthex-text-primary">{dept.name}</span>
          <span className="text-[10px] text-corthex-text-secondary bg-corthex-border/50 px-1.5 py-0.5 rounded">({dept.agents.length}명)</span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {sortedAgents.map((agent) => (
              <AgentNode key={agent.id} agent={agent} isSelected={selectedAgentId === agent.id} onSelect={onSelectAgent} />
            ))}
          </div>
          {dept.agents.length === 0 && (
            <p className="text-xs text-corthex-text-secondary py-2">에이전트 없음</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ──

// ── Tree View (Mobile) ──

function OrgTreeView({ org, onSelectAgent }: { org: OrgChartData['data']; onSelectAgent: (a: OrgAgent) => void }) {
  return (
    <div className="flex flex-col items-center py-6 px-4">
      {/* Root node */}
      <div className="relative w-full max-w-xs mx-auto mb-8">
        <div className="bg-corthex-elevated border-2 border-corthex-accent rounded-xl p-4 shadow-lg relative z-10 flex flex-col items-center text-center">
          <div className="absolute -top-3.5 bg-corthex-bg px-2">
            <span className="text-yellow-500 text-2xl">👑</span>
          </div>
          <h2 className="text-lg font-bold text-corthex-text-primary mt-2">{org.company.name}</h2>
          <p className="text-sm font-medium text-corthex-accent mt-1">Root</p>
        </div>
        {/* Vertical connector */}
        {org.departments.length > 0 && (
          <div className="absolute left-1/2 bottom-[-24px] w-px h-6 bg-corthex-border -translate-x-1/2" />
        )}
      </div>

      {/* Departments in tree layout */}
      {org.departments.length > 0 && (
        <div className="relative w-full mb-6">
          {/* Horizontal connector line */}
          {org.departments.length > 1 && (
            <div
              className="absolute top-0 h-px bg-corthex-border"
              style={{
                left: `${100 / (org.departments.length * 2)}%`,
                right: `${100 / (org.departments.length * 2)}%`,
              }}
            />
          )}
          <div className={`grid gap-3 relative pt-6`} style={{ gridTemplateColumns: `repeat(${Math.min(org.departments.length, 3)}, minmax(0, 1fr))` }}>
            {org.departments.map((dept) => (
              <div key={dept.id} className="relative flex flex-col items-center">
                {/* Vertical connector from horizontal line */}
                <div className="absolute top-[-24px] left-1/2 w-px h-6 bg-corthex-border -translate-x-1/2" />
                {/* Department node */}
                <div className="w-full bg-corthex-elevated border border-corthex-border rounded-lg p-3 flex flex-col items-center text-center cursor-pointer hover:border-corthex-border-strong transition-colors">
                  <h3 className="text-sm font-semibold text-corthex-text-primary">{dept.name}</h3>
                  <div className="flex items-center mt-1.5 gap-1 text-xs text-corthex-text-secondary">
                    <span>👥</span>
                    <span>{dept.agents.length}</span>
                  </div>
                </div>
                {/* Vertical connector to agents */}
                {dept.agents.length > 0 && <div className="w-px h-4 bg-corthex-border" />}
                {/* Agent pills */}
                <div className="flex flex-col gap-1.5 w-full">
                  {sortAgentsByTier(dept.agents).slice(0, 3).map((agent) => {
                    const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.offline
                    const tier = TIER_CONFIG[agent.tier] || TIER_CONFIG.specialist
                    return (
                      <div
                        key={agent.id}
                        onClick={() => onSelectAgent(agent)}
                        className="bg-corthex-elevated border border-corthex-border rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-corthex-border/50 transition-colors"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-corthex-border flex items-center justify-center text-[10px] font-bold text-corthex-text-secondary">
                            {agent.name.slice(0, 2)}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-corthex-border ${status.dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-corthex-accent-deep truncate">{agent.name}</p>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${tier.classes}`}>{tier.label}</span>
                        </div>
                      </div>
                    )
                  })}
                  {dept.agents.length > 3 && (
                    <p className="text-[10px] text-corthex-text-secondary text-center">+{dept.agents.length - 3}명 더</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEXUS hint */}
      <div className="mt-auto pt-8 pb-4 text-center w-full">
        <p className="text-xs text-corthex-text-secondary flex items-center justify-center gap-1">
          ℹ️ 전체 캔버스를 보려면 NEXUS 탭을 이용하세요.
        </p>
      </div>
    </div>
  )
}

export function OrgPage() {
  const [selectedAgent, setSelectedAgent] = useState<OrgAgent | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workspace-org-chart'],
    queryFn: () => api.get<OrgChartData>('/workspace/org-chart'),
  })

  useEffect(() => {
    if (!selectedAgent) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAgent(null)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [selectedAgent])

  // Loading
  if (isLoading || !data) {
    return (
      <div data-testid="org-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-corthex-elevated/60 border border-corthex-border/50 rounded-xl animate-pulse h-40" />
        ))}
      </div>
    )
  }

  // Error
  if (isError) {
    return (
      <div data-testid="org-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm text-red-400">조직 정보를 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-400 hover:text-red-300 underline mt-1">다시 시도</button>
        </div>
      </div>
    )
  }

  const org = data.data
  const totalAgents = org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length
  const isEmpty = org.departments.length === 0 && org.unassignedAgents.length === 0

  return (
    <div data-testid="org-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-corthex-text-primary">{org.company.name}</h1>
          <p className="text-sm text-corthex-text-secondary mt-1">{org.departments.length}개 부서 · {totalAgents}명 에이전트</p>
        </div>
        {/* View mode toggle (mobile tree / list) */}
        <div className="flex items-center bg-corthex-elevated rounded-lg p-1 md:hidden">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'tree' ? 'bg-corthex-border text-corthex-text-primary shadow-sm' : 'text-corthex-text-secondary hover:text-corthex-accent-deep'
            }`}
          >
            트리
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-corthex-border text-corthex-text-primary shadow-sm' : 'text-corthex-text-secondary hover:text-corthex-accent-deep'
            }`}
          >
            리스트
          </button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="bg-corthex-elevated/60 border border-dashed border-corthex-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🏢</p>
          <p className="text-sm font-medium text-corthex-text-secondary">조직이 구성되지 않았습니다</p>
          <p className="text-xs text-corthex-text-secondary mt-1">관리자 패널에서 부서와 에이전트를 추가해주세요</p>
        </div>
      )}

      {/* Tree view (mobile only) */}
      {!isEmpty && viewMode === 'tree' && (
        <div className="md:hidden">
          <OrgTreeView org={org} onSelectAgent={setSelectedAgent} />
        </div>
      )}

      {/* List view (default on desktop, toggle on mobile) */}
      {!isEmpty && (viewMode === 'list' || typeof window !== 'undefined') && (
        <div className={viewMode === 'tree' ? 'hidden md:block' : ''}>
          <div className="space-y-4">
            {org.departments.map((dept) => (
              <DepartmentSection key={dept.id} dept={dept} selectedAgentId={selectedAgent?.id || null} onSelectAgent={setSelectedAgent} />
            ))}
          </div>
        </div>
      )}

      {/* Unassigned agents */}
      {org.unassignedAgents.length > 0 && (
        <div data-testid="unassigned-section" className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2">
            <span className="text-amber-400">⚠</span>
            <span className="text-sm font-semibold text-amber-400">미배속 에이전트</span>
            <span className="text-[10px] text-corthex-text-secondary bg-corthex-border/50 px-1.5 py-0.5 rounded">({org.unassignedAgents.length}명)</span>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {org.unassignedAgents.map((agent) => (
                <AgentNode key={agent.id} agent={agent} isSelected={selectedAgent?.id === agent.id} onSelect={setSelectedAgent} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedAgent && <AgentDetailPanel agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
    </div>
  )
}
