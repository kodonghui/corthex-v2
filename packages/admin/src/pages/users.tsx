/**
 * Admin Users — Stitch Command Theme
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
import { UserPlus, Search, Pencil, Ban, CheckCircle, ChevronLeft, ChevronRight, Trash2, Lock } from 'lucide-react'

type User = {
  id: string; companyId: string; name: string; username: string
  email: string | null; role: string; isActive: boolean; createdAt: string
}
type Department = { id: string; name: string }
type Agent = { id: string; name: string; departmentId: string | null; userId: string }

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
        <p className="font-mono text-xs text-corthex-text-disabled uppercase tracking-widest">SELECT_COMPANY_TO_CONTINUE</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-corthex-bg" data-testid="users-page">
      {/* Header & Search */}
      <section className="p-8 flex-1 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-corthex-surface p-6 border border-corthex-border">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-corthex-text-primary uppercase">Admin Users</h1>
            <p className="font-mono text-xs text-corthex-accent/60 uppercase tracking-[0.2em]">Access Control &amp; Identity Management</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-corthex-accent text-corthex-text-on-accent px-8 py-3 font-mono font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-corthex-accent-hover transition-colors active:scale-95"
            data-testid="add-user-btn"
          >
            <UserPlus size={14} />
            + Create User
          </button>
        </div>

        {/* Create User Form */}
        {showCreate && (
          <div className="bg-corthex-surface border border-corthex-border p-6 space-y-4" data-testid="create-form">
            <h3 className="font-mono text-xs text-corthex-accent uppercase tracking-widest">NEW_USER_RECORD</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!selectedCompanyId) return
                createMutation.mutate({ ...form, companyId: selectedCompanyId })
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">아이디</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 px-3 text-corthex-text-primary focus:ring-0 transition-colors"
                  placeholder="사용자 아이디"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 px-3 text-corthex-text-primary focus:ring-0 transition-colors"
                  placeholder="비밀번호"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">이름</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 px-3 text-corthex-text-primary focus:ring-0 transition-colors"
                  placeholder="직원 이름"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 px-3 text-corthex-text-primary focus:ring-0 transition-colors"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">역할</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-corthex-elevated border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 text-corthex-text-primary uppercase tracking-widest"
                >
                  <option value="user">일반 직원</option>
                  <option value="admin">관리자</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="font-mono text-[10px] text-corthex-text-secondary hover:text-corthex-text-primary uppercase tracking-widest px-4 py-2 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-corthex-accent text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-widest px-6 py-2.5 disabled:opacity-50 hover:bg-corthex-accent-hover transition-colors"
                >
                  {createMutation.isPending ? '생성 중...' : '생성'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="md:col-span-2 font-mono text-xs text-corthex-error">{(createMutation.error as Error).message}</p>
              )}
            </form>
          </div>
        )}

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-corthex-bg border border-corthex-border p-4">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-corthex-text-disabled" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-corthex-border focus:border-corthex-accent text-xs font-mono pl-9 py-3 text-corthex-text-primary focus:ring-0 placeholder:text-corthex-text-disabled"
              placeholder="SEARCH DATABASE..."
              type="text"
            />
          </div>
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-corthex-elevated border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 text-corthex-text-primary uppercase tracking-widest focus:ring-0"
            >
              <option value="all">Department: ALL</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-corthex-elevated border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 text-corthex-text-primary uppercase tracking-widest focus:ring-0"
            >
              <option value="all">Status: ALL</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <select
              className="w-full bg-corthex-elevated border-b border-corthex-border focus:border-corthex-accent text-xs font-mono py-3 text-corthex-text-primary uppercase tracking-widest focus:ring-0"
            >
              <option>Role: ALL</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-corthex-bg border border-corthex-border overflow-hidden" data-testid="user-table">
          {isLoading ? (
            <div className="p-5"><SkeletonTable rows={5} /></div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title={deptFilter !== 'all' ? '해당 부서에 직원이 없습니다' : '직원이 없습니다'}
              description={deptFilter !== 'all' ? '다른 부서를 선택하거나 전체를 확인하세요.' : '직원 추가 버튼을 눌러 새 직원을 등록하세요.'}
            />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-corthex-elevated border-b border-corthex-border">
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">Identifier</th>
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">Credentials</th>
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">Access Role</th>
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">Affiliation</th>
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">Node Status</th>
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">Telemetry</th>
                  <th className="p-4 font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-corthex-surface transition-colors group">
                    {/* Identifier */}
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-corthex-elevated border border-corthex-border flex items-center justify-center font-bold text-sm text-corthex-accent">
                          {u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        {editUser?.id === u.id ? (
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="bg-corthex-bg border-b border-corthex-accent text-xs font-mono text-corthex-text-primary px-2 py-1 focus:ring-0"
                          />
                        ) : (
                          <span className="font-bold text-sm tracking-tight text-corthex-text-primary uppercase">{u.name}</span>
                        )}
                      </div>
                    </td>
                    {/* Credentials */}
                    <td className="p-4 font-mono text-xs text-corthex-text-secondary">{u.email || `@${u.username}`}</td>
                    {/* Access Role */}
                    <td className="p-4">
                      {editUser?.id === u.id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="bg-corthex-bg border-b border-corthex-accent text-xs font-mono text-corthex-text-primary py-1 focus:ring-0"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase font-bold border ${
                          u.role === 'admin'
                            ? 'bg-corthex-accent/10 text-corthex-accent border-corthex-accent/20'
                            : 'bg-corthex-elevated text-corthex-text-secondary border-corthex-border'
                        }`}>
                          {u.role === 'admin' ? 'SUPER ADMIN' : 'OPERATOR'}
                        </span>
                      )}
                    </td>
                    {/* Affiliation */}
                    <td className="p-4 font-mono text-xs text-corthex-text-secondary uppercase">
                      {u.companyId?.slice(0, 8) || 'N/A'}
                    </td>
                    {/* Node Status */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-corthex-success' : 'bg-corthex-error'}`} />
                        <span className={`font-mono text-[10px] uppercase ${u.isActive ? 'text-corthex-success' : 'text-corthex-error'}`}>
                          {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </div>
                    </td>
                    {/* Telemetry */}
                    <td className="p-4 font-mono text-[10px] text-corthex-text-secondary">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'N/A'}
                    </td>
                    {/* Actions */}
                    <td className="p-4 text-right">
                      {editUser?.id === u.id ? (
                        <div className="flex justify-end gap-3 text-corthex-text-disabled">
                          <button
                            onClick={() => updateMutation.mutate({
                              id: u.id,
                              name: editForm.name,
                              email: editForm.email || undefined,
                              role: editForm.role,
                            })}
                            className="font-mono text-[10px] uppercase tracking-widest text-corthex-accent hover:text-corthex-accent-hover transition-colors"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditUser(null)}
                            className="font-mono text-[10px] uppercase tracking-widest hover:text-corthex-text-primary transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-3 text-corthex-text-disabled">
                          <button
                            onClick={() => {
                              setEditUser(u)
                              setEditForm({ name: u.name, email: u.email || '', role: u.role })
                            }}
                            className="hover:text-corthex-accent transition-colors"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          {u.isActive ? (
                            <button
                              onClick={() => setDeactivateTarget(u)}
                              className="hover:text-corthex-accent transition-colors"
                              title="Deactivate"
                            >
                              <Lock size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setResetPasswordTarget(u)}
                              className="hover:text-corthex-success transition-colors"
                              title="Reset Password"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => setDeactivateTarget(u)}
                            className="hover:text-corthex-error transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Terminal Pagination */}
          {filteredUsers.length > 0 && (
            <footer className="flex justify-between items-center bg-corthex-surface border-t border-corthex-border p-4">
              <div className="font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest flex items-center gap-4">
                <span>DATABASE_SECTOR: USR</span>
                <span className="w-1 h-1 bg-corthex-border rounded-full" />
                <span>ENTRIES_LOADED: {users.length.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-6">
                <button className="text-corthex-text-disabled hover:text-corthex-accent disabled:opacity-30 flex items-center gap-1 transition-colors" disabled>
                  <ChevronLeft size={14} />
                  <span className="font-mono text-[10px] uppercase tracking-tighter">PREV_BLOCK</span>
                </button>
                <div className="px-4 py-1 border border-corthex-accent/20 bg-corthex-accent/5">
                  <span className="font-mono text-xs text-corthex-accent font-bold tracking-[0.2em]">
                    PAGE 01 OF {Math.max(1, Math.ceil(users.length / 20))}
                  </span>
                </div>
                <button className="text-corthex-text-disabled hover:text-corthex-accent flex items-center gap-1 transition-colors">
                  <span className="font-mono text-[10px] uppercase tracking-tighter">NEXT_BLOCK</span>
                  <ChevronRight size={14} />
                </button>
              </div>
              <div className="font-mono text-[10px] text-corthex-accent/60 uppercase animate-pulse">
                SHOWING {filteredUsers.length} / {users.length}
              </div>
            </footer>
          )}
        </div>
      </section>

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
