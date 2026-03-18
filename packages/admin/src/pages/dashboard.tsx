/**
 * Admin Dashboard — Natural Organic Theme
 *
 * API Endpoints:
 *   GET /admin/users?companyId={id}
 *   GET /admin/agents?companyId={id}
 *   GET /admin/departments?companyId={id}
 */
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { CheckCircle, MoreVertical, Building2, Users, Bot, Activity } from 'lucide-react'
import { olive, oliveBg, cream, sand, warmBrown } from '../lib/colors'

type User = { id: string; name: string; username: string; role: string; isActive: boolean }
type Agent = { id: string; name: string; role: string; status: string; isActive: boolean }
type Department = { id: string; name: string }

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
  const activeUsers = users.filter((u) => u.isActive).length
  const onlineAgents = agents.filter((a) => a.status === 'online').length

  if (!selectedCompanyId) return <div className="p-8 text-center text-slate-500">회사를 선택하세요</div>

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto w-full" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Building2 size={20} style={{ color: olive }} />}
          label="Departments"
          value={depts.length}
          sub={`${depts.length} registered`}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Users size={20} style={{ color: olive }} />}
          label="Users"
          value={users.length}
          sub={`${activeUsers} active`}
          badge={`${activeUsers}`}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Bot size={20} style={{ color: olive }} />}
          label="AI Agents"
          value={agents.length}
          sub={`${onlineAgents} online`}
          badge={`${agents.length}`}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Activity size={20} style={{ color: olive }} />}
          label="System Health"
          value={onlineAgents}
          sub="Online agents"
          isLoading={isLoading}
          accent
        />
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: sand }}>
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: sand }}>
          <div>
            <h4 className="font-bold text-lg leading-none" style={{ color: warmBrown }}>Recent Activity</h4>
            <p className="text-xs text-slate-400 mt-2">Users and agents in this workspace</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider" style={{ backgroundColor: cream }}>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: sand }}>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 && agents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No users or agents yet</td>
                </tr>
              ) : (
                <>
                  {users.map((u) => (
                    <tr key={`user-${u.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 font-bold text-xs uppercase" style={{ color: u.isActive ? olive : '#94a3b8' }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.isActive ? olive : '#94a3b8' }} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold" style={{ color: warmBrown }}>{u.name}</p>
                        <p className="text-xs text-slate-400">@{u.username}</p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: warmBrown }}>User</td>
                      <td className="px-6 py-4 text-sm" style={{ color: warmBrown }}>{u.role}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-700 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {agents.map((a) => (
                    <tr key={`agent-${a.id}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 font-bold text-xs uppercase ${a.status === 'online' ? '' : 'text-amber-500'}`} style={a.status === 'online' ? { color: olive } : {}}>
                          <span className={`w-2 h-2 rounded-full ${a.status === 'online' ? '' : 'bg-amber-500'}`} style={a.status === 'online' ? { backgroundColor: olive } : {}} />
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold" style={{ color: warmBrown }}>{a.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: warmBrown }}>Agent</td>
                      <td className="px-6 py-4 text-sm" style={{ color: warmBrown }}>{a.role}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-400 hover:text-slate-700 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, sub, badge, isLoading, accent }: {
  icon: React.ReactNode
  label: string
  value: number
  sub: string
  badge?: string
  isLoading: boolean
  accent?: boolean
}) {
  return (
    <div
      className="bg-white p-6 rounded-xl border shadow-sm"
      style={{ borderColor: sand, ...(accent ? { borderLeftWidth: '4px', borderLeftColor: olive } : {}) }}
    >
      <div className="flex justify-between items-start mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {badge ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: oliveBg, color: olive }}>{badge}</span>
        ) : icon}
      </div>
      {isLoading ? (
        <div className="h-9 w-16 bg-slate-100 rounded animate-pulse" />
      ) : (
        <h3 className="text-3xl font-bold tracking-tight" style={{ color: warmBrown }}>{value}</h3>
      )}
      <p className="text-[10px] text-slate-400 mt-2">{sub}</p>
    </div>
  )
}
