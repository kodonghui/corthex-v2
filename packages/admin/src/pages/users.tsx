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

  // Build user->department mapping via agents table
  const userDeptMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const agent of agents) {
      if (agent.departmentId && agent.userId) {
        map.set(agent.userId, agent.departmentId)
      }
    }
    return map
  }, [agents])

  const filteredUsers = deptFilter === 'all'
    ? users
    : users.filter((u) => userDeptMap.get(u.id) === deptFilter)

  const createMutation = useMutation({
    mutationFn: (body: typeof form & { companyId: string }) =>
      api.post('/admin/users', body),
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
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6" data-testid="users-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">직원 관리</h1>
          <p className="text-sm text-slate-400 mt-1">{users.length}명의 직원</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          data-testid="add-user-btn"
        >
          <span>+</span> 직원 추가
        </button>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" data-testid="dept-filter">
        <button
          onClick={() => setDeptFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
            deptFilter === 'all'
              ? 'text-white bg-blue-600'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          전체
        </button>
        {depts.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(d.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              deptFilter === d.id
                ? 'text-white bg-blue-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Create User Form */}
      {showCreate && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 space-y-4" data-testid="create-form">
          <h3 className="text-lg font-semibold text-white">새 직원 추가</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedCompanyId) return
              createMutation.mutate({ ...form, companyId: selectedCompanyId })
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">아이디</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                placeholder="사용자 아이디"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                placeholder="비밀번호"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                placeholder="직원 이름"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">역할</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="user">일반 직원</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
            {createMutation.isError && (
              <p className="md:col-span-2 text-sm text-red-400">{(createMutation.error as Error).message}</p>
            )}
          </form>
        </div>
      )}

      {/* User List Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid="user-table">
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable rows={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title={deptFilter !== 'all' ? '해당 부서에 직원이 없습니다' : '직원이 없습니다'}
            description={deptFilter !== 'all' ? '다른 부서를 선택하거나 전체를 확인하세요.' : '직원 추가 버튼을 눌러 새 직원을 등록하세요.'}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이름</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">아이디</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이메일</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">역할</th>
                <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">상태</th>
                <th className="text-right text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3">
                    {editUser?.id === u.id ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-700 border border-slate-600 focus:border-blue-500 rounded px-2 py-1 text-sm text-white w-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-white">{u.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 font-mono">@{u.username}</td>
                  <td className="px-4 py-3">
                    {editUser?.id === u.id ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="bg-slate-700 border border-slate-600 focus:border-blue-500 rounded px-2 py-1 text-sm text-white w-full"
                        placeholder="이메일"
                      />
                    ) : (
                      <span className="text-sm text-slate-400">{u.email || '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editUser?.id === u.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      >
                        <option value="user">직원</option>
                        <option value="admin">관리자</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-slate-600/50 text-slate-300'
                      }`}>
                        {u.role === 'admin' ? '관리자' : '직원'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.isActive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {u.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editUser?.id === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateMutation.mutate({
                            id: u.id,
                            name: editForm.name,
                            email: editForm.email || undefined,
                            role: editForm.role,
                          })}
                          className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditUser(null)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditUser(u)
                            setEditForm({ name: u.name, email: u.email || '', role: u.role })
                          }}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setResetPasswordTarget(u)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                          비밀번호 초기화
                        </button>
                        {u.isActive && (
                          <button
                            onClick={() => setDeactivateTarget(u)}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                          >
                            비활성화
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
