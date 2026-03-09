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

  if (!selectedCompanyId) {
    return (
      <div className="flex items-center justify-center h-64" data-testid="no-company">
        <p className="text-sm text-slate-400">회사를 선택하세요</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6" data-testid="employees-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">직원 관리</h1>
          <p className="text-sm text-slate-400 mt-1">{pagination ? `${pagination.total}명의 직원` : '직원 목록'}</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
          data-testid="invite-btn"
        >
          <span>+</span> 직원 초대
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3" data-testid="filters">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="이름 또는 이메일로 검색..."
            className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-500"
            data-testid="search-input"
          />
        </div>

        {/* Active status filter */}
        <div className="flex items-center gap-2">
          {[
            { label: '전체', value: '' },
            { label: '활성', value: 'true' },
            { label: '비활성', value: 'false' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => { setActiveFilter(f.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeFilter === f.value
                  ? 'text-white bg-blue-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Department filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setDepartmentFilter(''); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              departmentFilter === ''
                ? 'text-white bg-blue-600'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            전체 부서
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => { setDepartmentFilter(d.id); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                departmentFilter === d.id
                  ? 'text-white bg-blue-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid="employee-table">
        {isLoading ? (
          <div className="p-5">
            <SkeletonTable rows={5} />
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            title={departmentFilter || debouncedSearch ? '조건에 맞는 직원이 없습니다' : '아직 등록된 직원이 없습니다'}
            description={departmentFilter || debouncedSearch ? '검색어나 필터를 변경해보세요.' : '직원 초대 버튼을 눌러 첫 번째 직원을 등록하세요.'}
            action={
              !departmentFilter && !debouncedSearch ? (
                <button
                  onClick={() => setShowInvite(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
                <tr className="border-b border-slate-700">
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이름</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">아이디</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">이메일</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">부서</th>
                  <th className="text-left text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">상태</th>
                  <th className="text-right text-xs font-medium uppercase tracking-wider text-slate-400 px-4 py-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{emp.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">@{emp.username}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{emp.email || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {emp.departments.length > 0 ? emp.departments.map((d) => (
                          <span
                            key={d.id}
                            className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400"
                          >
                            {d.name}
                          </span>
                        )) : (
                          <span className="text-xs text-slate-500">미배정</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.isActive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {emp.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditTarget(emp)
                            setEditForm({
                              name: emp.name,
                              email: emp.email || '',
                              departmentIds: emp.departments.map((d) => d.id),
                            })
                          }}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => setResetPasswordTarget(emp)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                        >
                          비밀번호 초기화
                        </button>
                        {emp.isActive ? (
                          <button
                            onClick={() => setDeactivateTarget(emp)}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                          >
                            비활성화
                          </button>
                        ) : (
                          <button
                            onClick={() => setReactivateTarget(emp)}
                            className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors"
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
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700" data-testid="pagination">
                <span className="text-sm text-slate-400">
                  {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}명
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                        <span key={`e-${idx}`} className="text-slate-500 px-1">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                            page === item
                              ? 'text-white bg-blue-600'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInvite(false)} data-testid="invite-modal">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">직원 초대</h2>
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
                <label className="block text-xs font-medium text-slate-400 mb-1.5">아이디 *</label>
                <input
                  value={inviteForm.username}
                  onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                  placeholder="사용자 아이디"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">이름 *</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                  placeholder="직원 이름"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">이메일 *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">부서 배정</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-900/50 border border-slate-600 rounded-lg p-2">
                  {departments.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-2">등록된 부서가 없습니다</p>
                  ) : departments.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={inviteForm.departmentIds.includes(d.id)}
                        onChange={() => toggleDept(d.id, inviteForm.departmentIds, (ids) => setInviteForm({ ...inviteForm, departmentIds: ids }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditTarget(null)} data-testid="edit-modal">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">직원 수정 — {editTarget.name}</h2>
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
                <label className="block text-xs font-medium text-slate-400 mb-1.5">아이디</label>
                <input
                  value={editTarget.username}
                  disabled
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">이름</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">이메일</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">부서 배정</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-900/50 border border-slate-600 rounded-lg p-2">
                  {departments.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-2">등록된 부서가 없습니다</p>
                  ) : departments.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={editForm.departmentIds.includes(d.id)}
                        onChange={() => toggleDept(d.id, editForm.departmentIds, (ids) => setEditForm({ ...editForm, departmentIds: ids }))}
                        className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-300">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {updateMutation.isPending ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPasswordModal(null)} data-testid="password-modal">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">임시 비밀번호</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-slate-300">{passwordModal.name}님의 임시 비밀번호입니다.</p>
              <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 flex items-center justify-between">
                <code className="text-lg font-mono text-cyan-400 tracking-wider select-all">{passwordModal.password}</code>
                <button
                  onClick={copyPassword}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors"
                >
                  복사
                </button>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-xs text-amber-400">이 비밀번호는 다시 확인할 수 없으니 반드시 복사해두세요.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setPasswordModal(null)}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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
        description="이 직원은 더 이상 로그인할 수 없습니다. 나중에 다시 활성화할 수 있습니다."
        confirmText="비활성화"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={!!reactivateTarget}
        onConfirm={() => reactivateTarget && reactivateMutation.mutate(reactivateTarget.id)}
        onCancel={() => setReactivateTarget(null)}
        title={`${reactivateTarget?.name} 재활성화`}
        description="이 직원이 다시 로그인할 수 있습니다."
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
        description="새 임시 비밀번호가 생성됩니다."
        confirmText="초기화"
        variant="default"
      />
    </div>
  )
}
