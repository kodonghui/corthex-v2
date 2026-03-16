/**
 * Admin Users — Minimal Warm Theme
 *
 * API Endpoints:
 *   GET  /admin/users?companyId={id}
 *   POST /admin/users
 *   PATCH /admin/users/{id}
 *   DELETE /admin/users/{id}
 *   POST /admin/users/{id}/reset-password
 *   GET  /admin/departments?companyId={id}
 *   GET  /admin/agents?companyId={id}
 */
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog, EmptyState, SkeletonTable } from '@corthex/ui'

type User = {
  id: string; companyId: string; name: string; username: string
  email: string | null; role: string; isActive: boolean; createdAt: string
}
type Department = { id: string; name: string }
type Agent = { id: string; name: string; departmentId: string | null; userId: string }

/* Minimal Warm colors */
const olive = '#e57373'
const oliveBg = 'rgba(229,115,115,0.1)'
const cream = '#fcfbf9'

export function UsersPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' })
  const [form, setForm] = useState({ username: '', password: '', name: '', email: '', role: 'user' as string })
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null)
  const [resetPasswordTarget, setResetPasswordTarget] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: userData, isLoading } = useQuery({
    queryKey: ['users', selectedCompanyId],
    queryFn: () => api.get<{ data: User[] }>(`/admin/users?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: agentData } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const users = userData?.data || []
  const depts = deptData?.data || []
  const agents = agentData?.data || []

  const userDeptMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const agent of agents) {
      if (agent.departmentId && agent.userId) map.set(agent.userId, agent.departmentId)
    }
    return map
  }, [agents])

  const filteredUsers = users
    .filter((u) => deptFilter === 'all' || userDeptMap.get(u.id) === deptFilter)
    .filter((u) => statusFilter === 'all' || (statusFilter === 'active' ? u.isActive : !u.isActive))
    .filter((u) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
    })

  const createMutation = useMutation({
    mutationFn: (body: typeof form & { companyId: string }) => api.post('/admin/users', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setShowCreate(false)
      setForm({ username: '', password: '', name: '', email: '', role: 'user' })
      addToast({ type: 'success', message: '직원이 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; email?: string; role?: string; isActive?: boolean }) =>
      api.patch(`/admin/users/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setEditUser(null)
      addToast({ type: 'success', message: '직원 정보가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] })
      setDeactivateTarget(null)
      addToast({ type: 'success', message: '직원이 비활성화되었습니다' })
    },
    onError: (err: Error) => {
      setDeactivateTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/users/${id}/reset-password`, {}),
    onSuccess: () => {
      setResetPasswordTarget(null)
      addToast({ type: 'success', message: '비밀번호가 초기화되었습니다' })
    },
    onError: (err: Error) => {
      setResetPasswordTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  if (!selectedCompanyId) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="no-company">
        <p className="text-sm text-slate-400">회사를 선택하세요</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      <div className="p-8 max-w-7xl mx-auto w-full" data-testid="users-page">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage, invite and assign roles across the CORTHEX platform.</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all text-white shadow-lg"
            style={{ backgroundColor: olive, boxShadow: '0 10px 15px -3px rgba(229,115,115,0.2)' }}
            data-testid="add-user-btn"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Invite User</span>
          </button>
        </div>

        {/* Create User Form */}
        {showCreate && (
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 space-y-4" data-testid="create-form">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">새 직원 추가</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!selectedCompanyId) return
                createMutation.mutate({ ...form, companyId: selectedCompanyId })
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">아이디</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 transition-colors"
                  style={{ outlineColor: olive }}
                  placeholder="사용자 아이디"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 transition-colors"
                  placeholder="비밀번호"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 transition-colors"
                  placeholder="직원 이름"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 transition-colors"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">역할</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="user">일반 직원</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: olive }}
                >
                  {createMutation.isPending ? '생성 중...' : '생성'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="md:col-span-2 text-sm text-red-500">{(createMutation.error as Error).message}</p>
              )}
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm"
              style={{ outlineColor: olive }}
              placeholder="Search by name, email or company..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">Filter by:</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm py-2 px-3 min-w-[140px]"
            >
              <option value="all">All Roles</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm py-2 px-3 min-w-[140px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm" data-testid="user-table">
          {isLoading ? (
            <div className="p-5"><SkeletonTable rows={5} /></div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title={deptFilter !== 'all' ? '해당 부서에 직원이 없습니다' : '직원이 없습니다'}
              description={deptFilter !== 'all' ? '다른 부서를 선택하거나 전체를 확인하세요.' : '직원 추가 버튼을 눌러 새 직원을 등록하세요.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: oliveBg, color: olive }}>
                            {u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            {editUser?.id === u.id ? (
                              <input
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm w-full"
                              />
                            ) : (
                              <>
                                <p className="font-bold text-sm">{u.name}</p>
                                <p className="text-xs text-slate-500">{u.email || `@${u.username}`}</p>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {editUser?.id === u.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">{u.companyId?.slice(0, 8) || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editUser?.id === u.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => updateMutation.mutate({
                                id: u.id,
                                name: editForm.name,
                                email: editForm.email || undefined,
                                role: editForm.role,
                              })}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs font-medium"
                              style={{ color: olive }}
                            >
                              저장
                            </button>
                            <button
                              onClick={() => setEditUser(null)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 text-xs"
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditUser(u)
                                setEditForm({ name: u.name, email: u.email || '', role: u.role })
                              }}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            {u.isActive ? (
                              <button
                                onClick={() => setDeactivateTarget(u)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500"
                                title="Deactivate"
                              >
                                <span className="material-symbols-outlined text-xl">block</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setResetPasswordTarget(u)}
                                className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded text-slate-400 hover:text-emerald-600"
                                title="Reset Password"
                              >
                                <span className="material-symbols-outlined text-xl">check_circle</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Showing 1 to {filteredUsers.length} of {users.length} users</p>
              <div className="flex gap-2">
                <button className="p-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-400 transition-colors disabled:opacity-50" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded text-white font-bold text-xs" style={{ backgroundColor: olive }}>1</button>
                <button className="p-1 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-400 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer/System Info */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 dark:text-slate-600 gap-4">
          <p>&copy; 2024 CORTHEX Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <span>System Status: <span className="text-emerald-500">Healthy</span></span>
            <span>API v2.4.1</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onConfirm={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
        onCancel={() => setDeactivateTarget(null)}
        title={`${deactivateTarget?.name} 비활성화`}
        description="이 직원은 더 이상 로그인할 수 없습니다. 나중에 다시 활성화할 수 있습니다."
        confirmText="비활성화"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!resetPasswordTarget}
        onConfirm={() => resetPasswordTarget && resetPasswordMutation.mutate(resetPasswordTarget.id)}
        onCancel={() => setResetPasswordTarget(null)}
        title={`${resetPasswordTarget?.name} 비밀번호 초기화`}
        description="비밀번호가 초기값으로 재설정됩니다. 새 비밀번호를 직원에게 전달해주세요."
        confirmText="초기화"
        variant="default"
      />
    </div>
  )
}
