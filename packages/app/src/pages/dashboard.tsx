import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type CostsData = {
  totalCostUsd: number
  byModel: { model: string; costUsd: number; inputTokens: number; outputTokens: number; count: number }[]
  byAgent: { agentId: string; agentName: string; costUsd: number; count: number }[]
  bySource: { source: string; costUsd: number; count: number }[]
  days: number
}

type AgentsData = {
  agents: { id: string; name: string; role: string; status: string; isSecretary: boolean }[]
  statusCounts: { online: number; working: number; error: number; offline: number }
}

type StatsData = {
  messages: number
  delegations: number
  toolCalls: number
  nightJobs: number
  days: number
}

const STATUS_EMOJI: Record<string, string> = {
  online: '🟢',
  working: '🟡',
  error: '🔴',
  offline: '⚪',
}

const SOURCE_LABELS: Record<string, string> = {
  chat: '채팅',
  delegation: '위임',
  job: '야간작업',
  sns: 'SNS',
}

export function DashboardPage() {
  const { data: costsData } = useQuery({
    queryKey: ['dashboard-costs'],
    queryFn: () => api.get<{ data: CostsData }>('/workspace/dashboard/costs?days=30'),
  })

  const { data: agentsData } = useQuery({
    queryKey: ['dashboard-agents'],
    queryFn: () => api.get<{ data: AgentsData }>('/workspace/dashboard/agents'),
  })

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get<{ data: StatsData }>('/workspace/dashboard/stats?days=7'),
  })

  const costs = costsData?.data
  const agentsInfo = agentsData?.data
  const stats = statsData?.data

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">대시보드</h2>
      </div>

      <div className="px-6 py-4 space-y-6 max-w-4xl">
        {/* 에이전트 상태 */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">에이전트 상태</h3>
          {agentsInfo && (
            <>
              <div className="flex gap-4 mb-3">
                <span className="text-xs">🟢 {agentsInfo.statusCounts.online}</span>
                <span className="text-xs">🟡 {agentsInfo.statusCounts.working}</span>
                <span className="text-xs">🔴 {agentsInfo.statusCounts.error}</span>
                <span className="text-xs">⚪ {agentsInfo.statusCounts.offline}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {agentsInfo.agents.map((agent) => (
                  <div key={agent.id} className="p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>{STATUS_EMOJI[agent.status]}</span>
                      <span className="font-medium text-sm">{agent.name}</span>
                      {agent.isSecretary && <span className="text-xs text-indigo-500">비서</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{agent.role}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* 주간 통계 */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
            최근 {stats?.days || 7}일 활동
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: '채팅', value: stats?.messages },
              { label: '위임', value: stats?.delegations },
              { label: '도구호출', value: stats?.toolCalls },
              { label: '야간작업', value: stats?.nightJobs },
            ].map(({ label, value }) => (
              <div key={label} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-center">
                <p className="text-2xl font-bold">{value ?? '-'}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 비용 개요 */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
            비용 (최근 {costs?.days || 30}일)
          </h3>
          {costs && (
            <>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg mb-3">
                <p className="text-sm text-zinc-500">총 비용</p>
                <p className="text-2xl font-bold">${costs.totalCostUsd.toFixed(4)}</p>
              </div>

              {/* 모델별 */}
              {costs.byModel.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-zinc-500 mb-2">모델별</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
                        <th className="text-left py-1">모델</th>
                        <th className="text-right py-1">비용</th>
                        <th className="text-right py-1">호출</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.byModel.map((r) => (
                        <tr key={r.model} className="border-b dark:border-zinc-800">
                          <td className="py-1.5 text-xs">{r.model}</td>
                          <td className="text-right">${r.costUsd.toFixed(4)}</td>
                          <td className="text-right text-zinc-500">{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 에이전트별 */}
              {costs.byAgent.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-zinc-500 mb-2">에이전트별</h4>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-zinc-500 border-b dark:border-zinc-700">
                        <th className="text-left py-1">에이전트</th>
                        <th className="text-right py-1">비용</th>
                        <th className="text-right py-1">호출</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costs.byAgent.map((r) => (
                        <tr key={r.agentId} className="border-b dark:border-zinc-800">
                          <td className="py-1.5">{r.agentName}</td>
                          <td className="text-right">${r.costUsd.toFixed(4)}</td>
                          <td className="text-right text-zinc-500">{r.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 소스별 */}
              {costs.bySource.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 mb-2">소스별</h4>
                  <div className="flex gap-3">
                    {costs.bySource.map((r) => (
                      <div key={r.source} className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded text-center flex-1">
                        <p className="text-xs text-zinc-500">{SOURCE_LABELS[r.source] || r.source}</p>
                        <p className="font-medium text-sm">${r.costUsd.toFixed(4)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
