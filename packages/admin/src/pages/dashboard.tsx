/**
 * Admin Dashboard — Stitch Command Theme
 *
 * API Endpoints:
 *   GET /admin/users?companyId={id}
 *   GET /admin/agents?companyId={id}
 *   GET /admin/departments?companyId={id}
 */
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { Building2, Users, Bot, Zap, Download } from 'lucide-react'

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
  const efficiency = agents.length > 0 ? Math.round((onlineAgents / agents.length) * 100) : 0

  if (!selectedCompanyId) return (
    <div className="flex items-center justify-center h-64 text-corthex-text-disabled font-mono text-xs uppercase tracking-widest">
      SELECT_COMPANY_TO_CONTINUE
    </div>
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 md:space-y-8 bg-corthex-bg min-h-screen">
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Building2 size={64} className="text-corthex-text-primary opacity-10" />}
          label="DEPARTMENTS"
          value={depts.length}
          change={`${depts.length} registered`}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Users size={64} className="text-corthex-text-primary opacity-10" />}
          label="ACTIVE USERS"
          value={users.length}
          change={`${activeUsers} active`}
          isLoading={isLoading}
        />
        <StatCard
          icon={<Bot size={64} className="text-corthex-text-primary opacity-10" />}
          label="AUTONOMOUS AGENTS"
          value={agents.length}
          change={`${onlineAgents} online`}
          isLoading={isLoading}
        />
      </div>

      {/* Middle Section: Health + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* System Health Meters */}
        <div className="lg:col-span-1 bg-corthex-bg border border-corthex-border p-4 md:p-6 space-y-6 md:space-y-8">
          <h3 className="font-mono uppercase tracking-widest text-xs text-corthex-accent border-b border-corthex-border pb-4 flex items-center justify-between">
            Health Status
            <span className="w-1.5 h-1.5 rounded-full bg-corthex-accent" />
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-corthex-text-secondary">
                <span>활성 사용자</span>
                <span>{users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0}%</span>
              </div>
              <div className="h-4 bg-corthex-surface p-0.5 border border-corthex-border">
                <div
                  className="h-full bg-corthex-accent"
                  style={{ width: `${users.length > 0 ? (activeUsers / users.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-corthex-text-secondary">
                <span>온라인 에이전트</span>
                <span>{efficiency}%</span>
              </div>
              <div className="h-4 bg-corthex-surface p-0.5 border border-corthex-border">
                <div className="h-full bg-corthex-accent" style={{ width: `${efficiency}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-mono text-corthex-text-secondary">
                <span>부서 수</span>
                <span>{depts.length}</span>
              </div>
              <div className="h-4 bg-corthex-surface p-0.5 border border-corthex-border">
                <div className="h-full bg-corthex-info" style={{ width: `${Math.min(depts.length * 10, 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-corthex-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-corthex-surface border border-corthex-border flex items-center justify-center text-corthex-accent">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-corthex-text-secondary">SYSTEM</p>
                <p className="font-bold text-corthex-text-primary tracking-tight">OPERATIONAL</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-3 bg-corthex-bg border border-corthex-border overflow-hidden">
          <div className="p-4 md:p-6 border-b border-corthex-border flex justify-between items-center">
            <h3 className="font-mono uppercase tracking-widest text-xs text-corthex-accent">Recent Activity</h3>
            <button className="text-[10px] font-mono text-corthex-text-secondary hover:text-corthex-accent transition-colors flex items-center gap-1">
              로그 내보내기 <Download size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-corthex-surface text-[10px] font-mono uppercase text-corthex-text-secondary">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal">Name</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal hidden sm:table-cell">Type</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal hidden md:table-cell">Role</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-normal text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-corthex-text-disabled">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-corthex-border border-t-transparent rounded-full animate-spin" />
                        <span className="font-mono text-[10px] uppercase tracking-widest">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 && agents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">
                      NO_RECORDS_FOUND
                    </td>
                  </tr>
                ) : (
                  <>
                    {users.map((u) => (
                      <tr key={`user-${u.id}`} className="hover:bg-corthex-surface/50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-sm text-corthex-text-primary uppercase tracking-tight">{u.name}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-corthex-text-secondary font-mono hidden sm:table-cell">USER</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-corthex-text-secondary font-mono uppercase hidden md:table-cell">{u.role}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          {u.isActive ? (
                            <span className="px-2 py-0.5 bg-corthex-accent/20 text-corthex-accent text-[10px] font-mono border border-corthex-accent/30">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-corthex-error/20 text-corthex-error text-[10px] font-mono border border-corthex-error/30">
                              INACTIVE
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {agents.map((a) => (
                      <tr key={`agent-${a.id}`} className="hover:bg-corthex-surface/50 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4 font-bold text-sm text-corthex-text-primary uppercase tracking-tight">{a.name}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-corthex-text-secondary font-mono hidden sm:table-cell">AGENT</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs text-corthex-text-secondary font-mono uppercase hidden md:table-cell">{a.role}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          {a.status === 'online' ? (
                            <span className="px-2 py-0.5 bg-corthex-accent/20 text-corthex-accent text-[10px] font-mono border border-corthex-accent/30">
                              ONLINE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-corthex-elevated text-corthex-text-secondary text-[10px] font-mono border border-corthex-border">
                              {a.status.toUpperCase()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-corthex-surface border-t border-corthex-border flex justify-center">
            <button className="text-[10px] font-mono text-corthex-text-secondary hover:text-corthex-accent transition-all">
              전체 기록 보기
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Dept Overview + Agent Efficiency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Overview */}
        <div className="bg-corthex-surface border border-corthex-border p-4 md:p-6 flex flex-col h-[250px] md:h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-mono uppercase tracking-widest text-xs text-corthex-accent">Department Overview</h3>
          </div>
          <div className="flex-1 space-y-2 overflow-auto">
            {depts.length === 0 ? (
              <p className="font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest text-center mt-8">
                NO_DEPARTMENTS_FOUND
              </p>
            ) : (
              depts.map((d, i) => (
                <div key={d.id} className="flex items-center justify-between p-3 bg-corthex-bg border border-corthex-border">
                  <span className="font-mono text-xs text-corthex-text-primary uppercase tracking-tight">{d.name}</span>
                  <span className="font-mono text-[10px] text-corthex-accent">DEPT_{String(i + 1).padStart(2, '0')}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 flex items-center gap-4 border-t border-corthex-border pt-4">
            <div className="w-12 h-12 bg-corthex-bg border border-corthex-border flex items-center justify-center text-corthex-accent">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-mono text-corthex-text-secondary">전체 부서</p>
              <p className="font-bold text-corthex-text-primary tracking-tight">{depts.length}</p>
            </div>
          </div>
        </div>

        {/* Agent Efficiency Readout */}
        <div className="bg-corthex-surface border border-corthex-border p-6 flex flex-col">
          <h3 className="font-mono uppercase tracking-widest text-xs text-corthex-accent mb-6">Agent Efficiency Readout</h3>
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-corthex-elevated">
                <span className="font-mono text-xl font-bold text-corthex-text-primary">{efficiency}%</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-corthex-text-primary mb-1 uppercase tracking-tight">처리 효율</p>
                <p className="text-[11px] text-corthex-text-secondary mb-4">
                  {onlineAgents} of {agents.length} agents currently online.
                </p>
                <div className="flex gap-4">
                  <div>
                    <p className="text-[9px] font-mono text-corthex-text-disabled uppercase">Online</p>
                    <p className="text-sm font-mono text-corthex-text-primary">{onlineAgents}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-corthex-text-disabled uppercase">Total</p>
                    <p className="text-sm font-mono text-corthex-text-primary">{agents.length}</p>
                  </div>
                </div>
              </div>
            </div>
            {agents.slice(0, 2).map((a) => (
              <div key={a.id} className="p-4 bg-corthex-bg border border-corthex-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-corthex-text-secondary uppercase tracking-wide">
                    {a.name.toUpperCase()}_HEALTH
                  </span>
                  <span className={`text-[10px] font-mono ${a.status === 'online' ? 'text-corthex-accent' : 'text-corthex-text-disabled'}`}>
                    {a.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 ${a.status === 'online' ? 'bg-corthex-accent' : 'bg-corthex-text-disabled'} ${i >= (a.status === 'online' ? 5 : 2) ? 'opacity-30' : ''}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, change, isLoading }: {
  icon: React.ReactNode
  label: string
  value: number
  change: string
  isLoading: boolean
}) {
  return (
    <div className="bg-corthex-surface p-4 md:p-6 relative overflow-hidden border border-corthex-border">
      <div className="absolute top-0 right-0 p-2">{icon}</div>
      <p className="font-mono uppercase tracking-widest text-[10px] text-corthex-text-secondary mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-10 w-20 bg-corthex-elevated animate-pulse" />
        ) : (
          <h2 className="text-4xl font-black text-corthex-text-primary tracking-tighter">{value}</h2>
        )}
        <span className="text-corthex-accent font-mono text-xs">{change}</span>
      </div>
      <div className="mt-4 h-[2px] w-full bg-corthex-elevated">
        <div className="h-full bg-corthex-accent" style={{ width: `${Math.min(value * 5, 100)}%` }} />
      </div>
    </div>
  )
}
