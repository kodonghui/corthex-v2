import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type Company = { id: string; name: string; slug: string; isActive: boolean }
type User = { id: string; name: string; username: string; role: string; isActive: boolean }
type Agent = { id: string; name: string; role: string; status: string; isActive: boolean }
type Department = { id: string; name: string }

export function DashboardPage() {
  const { data: companyData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<{ data: Company[] }>('/admin/companies'),
  })

  const companyId = companyData?.data?.[0]?.id

  const { data: userData } = useQuery({
    queryKey: ['users', companyId],
    queryFn: () => api.get<{ data: User[] }>(`/admin/users?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const { data: agentData } = useQuery({
    queryKey: ['agents', companyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments', companyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${companyId}`),
    enabled: !!companyId,
  })

  const company = companyData?.data?.[0]
  const users = userData?.data || []
  const agents = agentData?.data || []
  const depts = deptData?.data || []

  const stats = [
    { label: '직원 수', value: users.length, color: 'bg-blue-500' },
    { label: '부서 수', value: depts.length, color: 'bg-green-500' },
    { label: 'AI 에이전트', value: agents.length, color: 'bg-purple-500' },
    { label: '활성 에이전트', value: agents.filter((a) => a.status === 'online').length, color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">대시보드</h1>
        {company && (
          <p className="text-sm text-zinc-500 mt-1">{company.name} ({company.slug})</p>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
            </div>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">직원 목록</h2>
          <div className="space-y-2">
            {users.slice(0, 5).map((u) => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.name}</p>
                  <p className="text-xs text-zinc-500">@{u.username}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  u.role === 'admin'
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">AI 에이전트</h2>
          <div className="space-y-2">
            {agents.slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{a.name}</p>
                  <p className="text-xs text-zinc-500">{a.role}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  a.status === 'online'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
