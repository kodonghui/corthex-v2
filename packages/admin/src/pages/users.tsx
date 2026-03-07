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

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">직원 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{users.length}명의 직원</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 직원 추가
        </button>
      </div>

      {/* 부서 필터 */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setDeptFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            deptFilter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          전체
        </button>
        {depts.map((d) => (
          <button
            key={d.id}
            onClick={() => setDeptFilter(d.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              deptFilter === d.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* 직원 생성 폼 */}
      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 직원 등록</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedCompanyId) return
              createMutation.mutate({ ...form, companyId: selectedCompanyId })
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">아이디</label>
              <input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">역할</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="user">일반 직원</option>
                <option value="admin">관리자</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {createMutation.isPending ? '생성 중...' : '생성'}
              </button>
            </div>
            {createMutation.isError && (
              <p className="col-span-2 text-sm text-red-600">{(createMutation.error as Error).message}</p>
            )}
          </form>
        </div>
      )}

      {/* 직원 목록 테이블 */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable rows={5} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="직원이 없습니다"
            description={deptFilter !== 'all' ? '선택한 부서에 배정된 직원이 없습니다' : '직원을 추가해보세요'}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">이름</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">아이디</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">이메일</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">역할</th>
                <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">상태</th>
                <th className="text-right text-xs font-medium text-zinc-500 uppercase px-5 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-3">
                    {editUser?.id === u.id ? (
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 w-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">@{u.username}</td>
                  <td className="px-5 py-3">
                    {editUser?.id === u.id ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 w-full"
                        placeholder="이메일"
                      />
                    ) : (
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">{u.email || '-'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editUser?.id === u.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                      >
                        <option value="user">직원</option>
                        <option value="admin">관리자</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {u.role === 'admin' ? '관리자' : '직원'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {u.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {editUser?.id === u.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => updateMutation.mutate({
                            id: u.id,
                            name: editForm.name,
                            email: editForm.email || undefined,
                            role: editForm.role,
                          })}
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          저장
                        </button>
                        <button onClick={() => setEditUser(null)} className="text-xs text-zinc-500">
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditUser(u)
                            setEditForm({ name: u.name, email: u.email || '', role: u.role })
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setResetPasswordTarget(u)}
                          className="text-xs text-amber-600 hover:text-amber-700"
                        >
                          비밀번호 초기화
                        </button>
                        {u.isActive && (
                          <button
                            onClick={() => setDeactivateTarget(u)}
                            className="text-xs text-red-600 hover:text-red-700"
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
        description="이 직원을 비활성화하면 더 이상 로그인할 수 없습니다. 나중에 다시 활성화할 수 있습니다."
        confirmText="비활성화"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!resetPasswordTarget}
        onConfirm={() => resetPasswordTarget && resetPasswordMutation.mutate(resetPasswordTarget.id)}
        onCancel={() => setResetPasswordTarget(null)}
        title={`${resetPasswordTarget?.name} 비밀번호 초기화`}
        description="비밀번호가 기본값으로 초기화됩니다. 직원에게 새 비밀번호를 안내해주세요."
        confirmText="초기화"
        variant="default"
      />
    </div>
  )
}
