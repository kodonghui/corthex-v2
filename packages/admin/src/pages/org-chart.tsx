import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { Card, CardContent, Skeleton } from '@corthex/ui'

type OrgAgent = {
  id: string
  name: string
  role: string
  departmentId: string | null
  status: string
  isSecretary: boolean
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

const statusColor: Record<string, string> = {
  online: 'bg-green-500',
  working: 'bg-blue-500',
  error: 'bg-red-500',
  offline: 'bg-gray-400',
}

const statusLabel: Record<string, string> = {
  online: '온라인',
  working: '작업 중',
  error: '오류',
  offline: '오프라인',
}

function AgentNode({ agent }: { agent: OrgAgent }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div
      className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors cursor-default"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[agent.status] || 'bg-gray-400'}`} />
      <span className="text-zinc-900 dark:text-zinc-100 truncate">{agent.name}</span>
      {agent.isSecretary && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex-shrink-0">
          비서
        </span>
      )}
      {showTooltip && (
        <div className="absolute left-full ml-2 top-0 z-50 w-48 p-3 rounded-lg shadow-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{agent.name}</p>
          <p className="text-xs text-zinc-500 mt-1">{agent.role || '역할 미지정'}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`w-2 h-2 rounded-full ${statusColor[agent.status] || 'bg-gray-400'}`} />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">{statusLabel[agent.status] || agent.status}</span>
          </div>
          {agent.isSecretary && <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">비서 에이전트</p>}
        </div>
      )}
    </div>
  )
}

function DepartmentNode({ dept }: { dept: OrgDept }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="ml-6 md:ml-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors w-full text-left"
      >
        <span className="text-xs text-indigo-400">{expanded ? '▼' : '▶'}</span>
        <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{dept.name}</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400 ml-auto">
          {dept.agents.length}
        </span>
      </button>
      {expanded && dept.agents.length > 0 && (
        <div className="ml-6 md:ml-10 mt-2 space-y-1.5 border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
          {dept.agents.map((agent) => (
            <AgentNode key={agent.id} agent={agent} />
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

export function OrgChartPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['org-chart', selectedCompanyId],
    queryFn: () => api.get<OrgChartData>(`/admin/org-chart?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

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

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">조직도</h1>
        <Card><CardContent>
          <p className="text-sm text-red-500 text-center py-8">데이터를 불러오는데 실패했습니다.</p>
        </CardContent></Card>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    )
  }

  const org = data.data

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">조직도</h1>

      <Card>
        <CardContent>
          {/* 회사 루트 노드 */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mb-4">
            <span className="text-lg">🏛️</span>
            <span className="text-sm font-semibold">{org.company.name}</span>
            <span className="text-xs opacity-60 ml-auto">
              {org.departments.length}개 부서 · {org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length}명 에이전트
            </span>
          </div>

          {/* 부서 노드들 */}
          <div className="space-y-3">
            {org.departments.map((dept) => (
              <DepartmentNode key={dept.id} dept={dept} />
            ))}
          </div>

          {/* 미배정 에이전트 */}
          {org.unassignedAgents.length > 0 && (
            <div className="ml-6 md:ml-10 mt-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">미배정</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-600 dark:text-amber-400 ml-auto">
                  {org.unassignedAgents.length}
                </span>
              </div>
              <div className="ml-6 md:ml-10 mt-2 space-y-1.5 border-l-2 border-amber-200 dark:border-amber-800 pl-4">
                {org.unassignedAgents.map((agent) => (
                  <AgentNode key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          )}

          {org.departments.length === 0 && org.unassignedAgents.length === 0 && (
            <p className="text-sm text-zinc-400 text-center py-8">부서와 에이전트가 아직 없습니다.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
