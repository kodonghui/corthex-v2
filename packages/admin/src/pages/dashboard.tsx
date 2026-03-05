import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Card, CardContent, Badge, StatusDot, Skeleton } from '@corthex/ui'
import { useAdminStore } from '../stores/admin-store'

type User = { id: string; name: string; username: string; role: string; isActive: boolean }
type Agent = { id: string; name: string; role: string; status: string; isActive: boolean }
type Department = { id: string; name: string }

function StatCard({ label, value, isLoading }: { label: string; value: number; isLoading: boolean }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mt-2" />
        ) : (
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['users', selectedCompanyId],
    queryFn: () => api.get<{ data: User[] }>(`/admin/users?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: agentData, isLoading: agentLoading } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const users = userData?.data || []
  const agents = agentData?.data || []
  const depts = deptData?.data || []
  const isLoading = userLoading || agentLoading

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">대시보드</h1>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="직원" value={users.length} isLoading={isLoading} />
        <StatCard label="부서" value={depts.length} isLoading={isLoading} />
        <StatCard label="AI 에이전트" value={agents.length} isLoading={isLoading} />
        <StatCard label="온라인" value={agents.filter((a) => a.status === 'online').length} isLoading={isLoading} />
      </div>

      {/* 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">직원 목록</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.name}</p>
                      <p className="text-xs text-zinc-500">@{u.username}</p>
                    </div>
                    <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>
                      {u.role}
                    </Badge>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-sm text-zinc-400 py-4 text-center">직원이 없습니다</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">AI 에이전트</h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {agents.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <StatusDot status={a.status} />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.name}</p>
                        <p className="text-xs text-zinc-500">{a.role}</p>
                      </div>
                    </div>
                    <Badge variant={a.status === 'online' ? 'success' : a.status === 'error' ? 'error' : 'default'}>
                      {a.status}
                    </Badge>
                  </div>
                ))}
                {agents.length === 0 && (
                  <p className="text-sm text-zinc-400 py-4 text-center">에이전트가 없습니다</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
