/**
 * Admin Dashboard — Minimal Warm Theme
 *
 * API Endpoints:
 *   GET /admin/users?companyId={id}
 *   GET /admin/agents?companyId={id}
 *   GET /admin/departments?companyId={id}
 */
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'

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
  const onlineAgents = agents.filter((a) => a.status === 'online').length

  if (!selectedCompanyId) return <div className="p-8 text-center text-slate-500">회사를 선택하세요</div>

  return (
    <div className="p-8 max-w-7xl mx-auto w-full" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      {/* Quick Stats Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">Total Companies</p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(229,115,115,0.1)', color: '#e57373' }}>Active</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>{depts.length}</h3>
          )}
          <p className="text-[10px] text-slate-400 mt-2">Departments</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">Active Users</p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(229,115,115,0.1)', color: '#e57373' }}>+{users.filter(u => u.isActive).length}</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>{users.length}</h3>
          )}
          <p className="text-[10px] text-slate-400 mt-2">Active now: {users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">AI Agents</p>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(229,115,115,0.1)', color: '#e57373' }}>{agents.length}</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>{agents.length}</h3>
          )}
          <p className="text-[10px] text-slate-400 mt-2">Total registered</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm" style={{ borderLeftWidth: '4px', borderLeftColor: '#e57373' }}>
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-slate-500">System Health</p>
            <span className="material-symbols-outlined" style={{ color: '#e57373' }}>check_circle</span>
          </div>
          {isLoading ? (
            <div className="h-9 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>{onlineAgents}</h3>
          )}
          <p className="text-[10px] text-slate-400 mt-2">Online agents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue vs Cost Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Revenue vs API Cost Trend</h4>
            <select className="text-xs bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-1 px-3">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[280px] w-full relative">
            <svg className="w-full h-full" viewBox="0 0 800 280">
              {/* Chart Grid */}
              <line className="text-slate-100 dark:text-slate-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="50" y2="50" />
              <line className="text-slate-100 dark:text-slate-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="150" y2="150" />
              <line className="text-slate-100 dark:text-slate-800" stroke="currentColor" strokeDasharray="4" x1="0" x2="800" y1="250" y2="250" />
              {/* Revenue Line Area */}
              <path d="M0,200 Q100,180 200,120 T400,100 T600,60 T800,40 L800,280 L0,280 Z" fill="url(#revGradient)" opacity="0.1" />
              <path d="M0,200 Q100,180 200,120 T400,100 T600,60 T800,40" fill="none" stroke="#e57373" strokeLinecap="round" strokeWidth="4" />
              {/* Cost Line Area */}
              <path d="M0,250 Q100,240 200,230 T400,210 T600,220 T800,200" fill="none" stroke="#94a3b8" strokeDasharray="6" strokeLinecap="round" strokeWidth="2" />
              <defs>
                <linearGradient id="revGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#e57373" />
                  <stop offset="100%" stopColor="#e57373" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
        </div>

        {/* Active Sessions Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
          <h4 className="font-bold text-lg mb-1" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Active Sessions</h4>
          <p className="text-xs text-slate-400 mb-8">Real-time traffic last 24h</p>
          <div className="flex-1 flex items-end justify-between gap-1 h-full px-2">
            <div className="w-full rounded-t-sm" style={{ height: '40%', backgroundColor: 'rgba(229,115,115,0.2)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '35%', backgroundColor: 'rgba(229,115,115,0.2)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '30%', backgroundColor: 'rgba(229,115,115,0.2)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '55%', backgroundColor: 'rgba(229,115,115,0.4)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '70%', backgroundColor: 'rgba(229,115,115,0.4)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '95%', backgroundColor: '#e57373' }} />
            <div className="w-full rounded-t-sm" style={{ height: '85%', backgroundColor: '#e57373' }} />
            <div className="w-full rounded-t-sm" style={{ height: '100%', backgroundColor: '#e57373' }} />
            <div className="w-full rounded-t-sm" style={{ height: '60%', backgroundColor: 'rgba(229,115,115,0.6)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '40%', backgroundColor: 'rgba(229,115,115,0.4)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '25%', backgroundColor: 'rgba(229,115,115,0.2)' }} />
            <div className="w-full rounded-t-sm" style={{ height: '15%', backgroundColor: 'rgba(229,115,115,0.2)' }} />
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Peak Concurrency</span>
              <span className="text-sm font-bold">{onlineAgents}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="h-full w-[85%]" style={{ backgroundColor: '#e57373' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg leading-none" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Recent System Alerts</h4>
            <p className="text-xs text-slate-400 mt-2">Latest security and operational logs</p>
          </div>
          <button className="text-sm font-bold hover:underline" style={{ color: '#e57373' }}>View All Logs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {/* Users list as recent alerts */}
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 && agents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No recent alerts</td>
                </tr>
              ) : (
                <>
                  {users.slice(0, 2).map((u) => (
                    <tr key={`user-${u.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 font-bold text-xs uppercase" style={{ color: '#e57373' }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#e57373' }} /> Info
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">User Active: {u.name}</p>
                        <p className="text-xs text-slate-400">Role: {u.role}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">@{u.username}</td>
                      <td className="px-6 py-4 text-sm">System</td>
                      <td className="px-6 py-4 text-sm text-slate-400">Recent</td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-slate-400 hover:text-slate-900 transition-colors">more_vert</button>
                      </td>
                    </tr>
                  ))}
                  {agents.slice(0, 2).map((a) => (
                    <tr key={`agent-${a.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 font-bold text-xs uppercase ${a.status === 'online' ? '' : 'text-amber-500'}`} style={a.status === 'online' ? { color: '#e57373' } : {}}>
                          <span className={`w-2 h-2 rounded-full ${a.status === 'online' ? '' : 'bg-amber-500'}`} style={a.status === 'online' ? { backgroundColor: '#e57373' } : {}} />
                          {a.status === 'online' ? 'Info' : 'Warning'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">Agent: {a.name}</p>
                        <p className="text-xs text-slate-400">Status: {a.status}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">{a.role}</td>
                      <td className="px-6 py-4 text-sm">System</td>
                      <td className="px-6 py-4 text-sm text-slate-400">Recent</td>
                      <td className="px-6 py-4 text-right">
                        <button className="material-symbols-outlined text-slate-400 hover:text-slate-900 transition-colors">more_vert</button>
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
