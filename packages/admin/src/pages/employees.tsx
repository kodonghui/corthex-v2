import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog, EmptyState, SkeletonTable } from '@corthex/ui'

type Department = { id: string; name: string }
type Employee = {
  id: string
  username: string
  name: string
  email: string
  isActive: boolean
  createdAt: string
  departments: Department[]
}

type EmployeeListResponse = {
  data: Employee[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

type CreateResponse = {
  data: { employee: Employee; initialPassword: string; departments: Department[] }
}

type ResetPasswordResponse = {
  data: { newPassword: string }
}

export function EmployeesPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  // Pagination & filter state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')

  // Modal state
  const [showInvite, setShowInvite] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<Employee | null>(null)
  const [reactivateTarget, setReactivateTarget] = useState<Employee | null>(null)
  const [resetPasswordTarget, setResetPasswordTarget] = useState<Employee | null>(null)
  const [passwordModal, setPasswordModal] = useState<{ name: string; password: string } | null>(null)

  // Invite form state
  const [inviteForm, setInviteForm] = useState({ username: '', name: '', email: '', departmentIds: [] as string[] })

  // Edit form state
  const [editForm, setEditForm] = useState({ name: '', email: '', departmentIds: [] as string[] })

  // Search debounce
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 300)
  }, [])

  // Queries
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ['employees', selectedCompanyId, page, debouncedSearch, departmentFilter, activeFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('companyId', selectedCompanyId!)
      params.set('page', String(page))
      params.set('limit', '20')
      if (debouncedSearch) params.set('search', debouncedSearch)
      if (departmentFilter) params.set('departmentId', departmentFilter)
      if (activeFilter) params.set('isActive', activeFilter)
      return api.get<EmployeeListResponse>(`/admin/employees?${params}`)
    },
    enabled: !!selectedCompanyId,
  })

  const { data: deptData } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const employees = employeeData?.data || []
  const pagination = employeeData?.pagination
  const departments = deptData?.data || []

  // Mutations
  const createMutation = useMutation({
    mutationFn: (body: typeof inviteForm & { companyId: string }) =>
      api.post<CreateResponse>(`/admin/employees?companyId=${body.companyId}`, body),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setShowInvite(false)
      setInviteForm({ username: '', name: '', email: '', departmentIds: [] })
      setPasswordModal({ name: res.data.employee.name, password: res.data.initialPassword })
      addToast({ type: 'success', message: '직원이 초대되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; email?: string; departmentIds?: string[] }) =>
      api.put(`/admin/employees/${id}?companyId=${selectedCompanyId}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setEditTarget(null)
      addToast({ type: 'success', message: '직원 정보가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/employees/${id}?companyId=${selectedCompanyId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setDeactivateTarget(null)
      addToast({ type: 'success', message: '직원이 비활성화되었습니다' })
    },
    onError: (err: Error) => {
      setDeactivateTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/employees/${id}/reactivate?companyId=${selectedCompanyId}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setReactivateTarget(null)
      addToast({ type: 'success', message: '직원이 재활성화되었습니다' })
    },
    onError: (err: Error) => {
      setReactivateTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  const resetNameRef = useRef('')
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) =>
      api.post<ResetPasswordResponse>(`/admin/employees/${id}/reset-password?companyId=${selectedCompanyId}`, {}),
    onSuccess: (res) => {
      setResetPasswordTarget(null)
      setPasswordModal({ name: resetNameRef.current, password: res.data.newPassword })
      addToast({ type: 'success', message: '비밀번호가 초기화되었습니다' })
    },
    onError: (err: Error) => {
      setResetPasswordTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  // Department toggle helper
  const toggleDept = (deptId: string, form: string[], setForm: (ids: string[]) => void) => {
    setForm(form.includes(deptId) ? form.filter((id) => id !== deptId) : [...form, deptId])
  }

  // Copy password
  const copyPassword = () => {
    if (passwordModal) {
      navigator.clipboard.writeText(passwordModal.password)
      addToast({ type: 'success', message: '비밀번호가 복사되었습니다' })
    }
  }

  if (!selectedCompanyId) return <div className="p-8 text-center text-zinc-500">회사를 선택하세요</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">직원 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">{pagination ? `${pagination.total}명의 직원` : '직원 목록'}</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 직원 초대
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="이름 또는 이메일로 검색..."
            className="flex-1 max-w-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          {/* Active status filter */}
          <div className="flex gap-1">
            <button
              onClick={() => { setActiveFilter(''); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeFilter === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => { setActiveFilter('true'); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeFilter === 'true'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              활성
            </button>
            <button
              onClick={() => { setActiveFilter('false'); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeFilter === 'false'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              비활성
            </button>
          </div>
        </div>

        {/* Department filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => { setDepartmentFilter(''); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              departmentFilter === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            전체 부서
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => { setDepartmentFilter(d.id); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                departmentFilter === d.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable rows={5} />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title="아직 등록된 직원이 없습니다"
            description={departmentFilter ? '선택한 부서에 배정된 직원이 없습니다' : '직원을 초대해보세요'}
            action={
              !departmentFilter ? (
                <button
                  onClick={() => setShowInvite(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  + 직원 초대
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">이름</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">아이디</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">이메일</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">부서</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase px-5 py-3">상태</th>
                  <th className="text-right text-xs font-medium text-zinc-500 uppercase px-5 py-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{emp.name}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">@{emp.username}</td>
                    <td className="px-5 py-3 text-sm text-zinc-600 dark:text-zinc-400">{emp.email || '-'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {emp.departments.length > 0 ? emp.departments.map((d) => (
                          <span
                            key={d.id}
                            className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                          >
                            {d.name}
                          </span>
                        )) : (
                          <span className="text-xs text-zinc-400">미배정</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        emp.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {emp.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => {
                            setEditTarget(emp)
                            setEditForm({
                              name: emp.name,
                              email: emp.email || '',
                              departmentIds: emp.departments.map((d) => d.id),
                            })
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setResetPasswordTarget(emp)}
                          className="text-xs text-amber-600 hover:text-amber-700"
                        >
                          비밀번호 초기화
                        </button>
                        {emp.isActive ? (
                          <button
                            onClick={() => setDeactivateTarget(emp)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            비활성화
                          </button>
                        ) : (
                          <button
                            onClick={() => setReactivateTarget(emp)}
                            className="text-xs text-green-600 hover:text-green-700"
                          >
                            재활성화
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500">
                  {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}명
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    이전
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                      if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 py-1 text-sm text-zinc-400">...</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            page === item
                              ? 'bg-indigo-600 text-white'
                              : 'border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Invite Employee Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowInvite(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">직원 초대</h2>
              <button onClick={() => setShowInvite(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!selectedCompanyId) return
                createMutation.mutate({ ...inviteForm, companyId: selectedCompanyId })
              }}
              className="px-6 py-5 space-y-4"
            >
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">아이디 *</label>
                <input
                  value={inviteForm.username}
                  onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="사용자 아이디"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름 *</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="직원 이름"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이메일 *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">부서 배정</label>
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {departments.length === 0 ? (
                    <p className="text-xs text-zinc-400">등록된 부서가 없습니다</p>
                  ) : departments.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inviteForm.departmentIds.includes(d.id)}
                        onChange={() => toggleDept(d.id, inviteForm.departmentIds, (ids) => setInviteForm({ ...inviteForm, departmentIds: ids }))}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {createMutation.isPending ? '초대 중...' : '초대'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditTarget(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">직원 수정 - {editTarget.name}</h2>
              <button onClick={() => setEditTarget(null)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                updateMutation.mutate({
                  id: editTarget.id,
                  name: editForm.name,
                  email: editForm.email || undefined,
                  departmentIds: editForm.departmentIds,
                })
              }}
              className="px-6 py-5 space-y-4"
            >
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">아이디</label>
                <input
                  value={editTarget.username}
                  disabled
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이름</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">이메일</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">부서 배정</label>
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                  {departments.length === 0 ? (
                    <p className="text-xs text-zinc-400">등록된 부서가 없습니다</p>
                  ) : departments.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.departmentIds.includes(d.id)}
                        onChange={() => toggleDept(d.id, editForm.departmentIds, (ids) => setEditForm({ ...editForm, departmentIds: ids }))}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Display Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPasswordModal(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">임시 비밀번호</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <strong>{passwordModal.name}</strong>님의 임시 비밀번호입니다. 이 비밀번호는 다시 확인할 수 없으니 반드시 복사해두세요.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono text-zinc-900 dark:text-zinc-100 select-all">
                  {passwordModal.password}
                </code>
                <button
                  onClick={copyPassword}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                >
                  복사
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setPasswordModal(null)}
                className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialogs */}
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
        isOpen={!!reactivateTarget}
        onConfirm={() => reactivateTarget && reactivateMutation.mutate(reactivateTarget.id)}
        onCancel={() => setReactivateTarget(null)}
        title={`${reactivateTarget?.name} 재활성화`}
        description="이 직원을 다시 활성화합니다. 활성화 후 로그인할 수 있습니다."
        confirmText="재활성화"
        variant="default"
      />

      <ConfirmDialog
        isOpen={!!resetPasswordTarget}
        onConfirm={() => {
          if (resetPasswordTarget) {
            resetNameRef.current = resetPasswordTarget.name
            resetPasswordMutation.mutate(resetPasswordTarget.id)
          }
        }}
        onCancel={() => setResetPasswordTarget(null)}
        title={`${resetPasswordTarget?.name} 비밀번호 초기화`}
        description="비밀번호가 새로 생성됩니다. 초기화 후 표시되는 임시 비밀번호를 직원에게 전달해주세요."
        confirmText="초기화"
        variant="default"
      />
    </div>
  )
}
