/**
 * Admin Employees (Employee Assignment) — Natural Organic Theme
 *
 * API Endpoints:
 *   GET    /admin/employees?companyId={id}&page=N&limit=N&search=&departmentId=&isActive=
 *   POST   /admin/employees?companyId={id}
 *   PUT    /admin/employees/{id}?companyId={id}
 *   DELETE /admin/employees/{id}?companyId={id}
 *   POST   /admin/employees/{id}/reactivate?companyId={id}
 *   POST   /admin/employees/{id}/reset-password?companyId={id}
 *   GET    /admin/departments?companyId={id}
 */
import { useState, useCallback, useRef } from 'react'
import { UserPlus, Search, UserSearch, Filter, GripVertical, Plus, PlusCircle, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog, EmptyState, SkeletonTable } from '@corthex/ui'
import { olive, oliveBg, cream } from '../lib/colors'

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
        <p className="text-sm text-corthex-text-disabled">회사를 선택하세요</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" data-testid="employees-page">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-8 gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-corthex-text-primary dark:text-white tracking-tight">Employee Assignment</h2>
                <p className="text-corthex-text-secondary dark:text-corthex-text-disabled">{pagination ? `${pagination.total}명의 직원` : 'Drag and drop users to assign them to their specific departments.'}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowInvite(true)}
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md"
                  style={{ backgroundColor: olive, boxShadow: '0 4px 6px -1px rgba(90,114,71,0.2)' }}
                  data-testid="invite-btn"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Employee
                </button>
              </div>
            </div>
          </div>

          {/* Search + Filters */}
          <div className="space-y-3" data-testid="filters">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Global search for employees, IDs, or logs..."
                className="w-full bg-corthex-elevated dark:bg-corthex-surface border-none rounded-xl pl-10 pr-4 py-2 text-sm transition-all"
                style={{ outlineColor: olive }}
                data-testid="search-input"
                type="text"
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
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  style={activeFilter === f.value
                    ? { backgroundColor: olive, color: 'white' }
                    : { color: '#64748b' }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Department filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => { setDepartmentFilter(''); setPage(1) }}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={departmentFilter === ''
                  ? { backgroundColor: olive, color: 'white' }
                  : { color: '#64748b' }
                }
              >
                전체 부서
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setDepartmentFilter(d.id); setPage(1) }}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  style={departmentFilter === d.id
                    ? { backgroundColor: olive, color: 'white' }
                    : { color: '#64748b' }
                  }
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Assignment Grid */}
          <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Left Column: Unassigned Users */}
            <div className="w-1/3 flex flex-col bg-corthex-surface dark:bg-corthex-bg rounded-xl border border-corthex-border dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-corthex-border dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <UserSearch className="w-5 h-5" style={{ color: olive }} />
                  Unassigned Users
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: oliveBg, color: olive }}>
                    {employees.filter((e) => e.departments.length === 0).length}
                  </span>
                </h3>
                <button className="text-corthex-text-disabled hover:text-corthex-text-secondary"><Filter className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="p-5"><SkeletonTable rows={3} /></div>
                ) : employees.filter((e) => e.departments.length === 0).length === 0 ? (
                  <p className="text-sm text-center text-corthex-text-disabled py-4 italic">All employees assigned</p>
                ) : (
                  employees.filter((e) => e.departments.length === 0).map((emp) => (
                    <div key={emp.id} className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-corthex-bg dark:bg-corthex-surface/50 cursor-move hover:shadow-md transition-all" style={{ borderColor: 'transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(90,114,71,0.5)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm" style={{ backgroundColor: oliveBg, color: olive }}>
                        {emp.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{emp.name}</p>
                        <p className="text-xs text-corthex-text-secondary">ID: @{emp.username}</p>
                      </div>
                      <GripVertical className="w-5 h-5 text-corthex-text-disabled group-hover:text-corthex-text-secondary" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Departments */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 content-start pb-8">
              {departments.map((dept) => {
                const deptEmployees = employees.filter((e) => e.departments.some((d) => d.id === dept.id))
                return (
                  <div key={dept.id} className="bg-corthex-surface dark:bg-corthex-bg rounded-xl border border-corthex-border dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-corthex-bg/50 dark:bg-corthex-surface/20">
                      <div>
                        <h4 className="font-bold text-corthex-text-primary dark:text-white">{dept.name}</h4>
                        <p className="text-xs text-corthex-text-secondary">{deptEmployees.length} Members</p>
                      </div>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: oliveBg, color: olive }}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-4 space-y-2 min-h-[120px] border-2 border-dashed border-transparent transition-all rounded-b-xl" style={{}} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(90,114,71,0.2)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}>
                      {deptEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-2 bg-corthex-surface dark:bg-corthex-surface rounded-lg shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-bold" style={{ backgroundColor: oliveBg, color: olive }}>
                              {emp.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm">{emp.name}</span>
                          </div>
                          <button className="text-corthex-text-disabled hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {deptEmployees.length === 0 && (
                        <p className="text-sm text-center text-corthex-text-disabled py-4 italic">No members assigned</p>
                      )}
                      <div className="pt-2 text-center">
                        <p className="text-[10px] text-corthex-text-disabled uppercase font-bold tracking-widest">Drop here to assign</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* New Dept Placeholder */}
              <button className="border-2 border-dashed border-corthex-border dark:border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-corthex-text-disabled transition-all" style={{}} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(90,114,71,0.5)'; e.currentTarget.style.color = olive }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#94a3b8' }}>
                <PlusCircle className="w-8 h-8" />
                <span className="text-sm font-bold mt-2">Create New Department</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Employee Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInvite(false)} data-testid="invite-modal">
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-corthex-border">
              <h2 className="text-lg font-semibold text-corthex-text-primary">직원 초대</h2>
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
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">아이디 *</label>
                <input
                  value={inviteForm.username}
                  onChange={(e) => setInviteForm({ ...inviteForm, username: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm transition-colors"
                  placeholder="사용자 아이디"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이름 *</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm transition-colors"
                  placeholder="직원 이름"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이메일 *</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm transition-colors"
                  placeholder="email@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">부서 배정</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-corthex-bg border border-corthex-border rounded-lg p-2">
                  {departments.length === 0 ? (
                    <p className="text-xs text-corthex-text-secondary text-center py-2">등록된 부서가 없습니다</p>
                  ) : departments.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-corthex-elevated cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={inviteForm.departmentIds.includes(d.id)}
                        onChange={() => toggleDept(d.id, inviteForm.departmentIds, (ids) => setInviteForm({ ...inviteForm, departmentIds: ids }))}
                        className="rounded border-corthex-border"
                        style={{ accentColor: olive }}
                      />
                      <span className="text-sm text-corthex-text-primary">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="bg-corthex-elevated hover:bg-slate-200 text-corthex-text-primary rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: olive }}
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
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-corthex-border">
              <h2 className="text-lg font-semibold text-corthex-text-primary">직원 수정 &mdash; {editTarget.name}</h2>
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
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">아이디</label>
                <input value={editTarget.username} disabled className="w-full bg-corthex-elevated border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-secondary cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이름</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이메일</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-sm transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">부서 배정</label>
                <div className="max-h-40 overflow-y-auto space-y-1 bg-corthex-bg border border-corthex-border rounded-lg p-2">
                  {departments.length === 0 ? (
                    <p className="text-xs text-corthex-text-secondary text-center py-2">등록된 부서가 없습니다</p>
                  ) : departments.map((d) => (
                    <label key={d.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-corthex-elevated cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={editForm.departmentIds.includes(d.id)}
                        onChange={() => toggleDept(d.id, editForm.departmentIds, (ids) => setEditForm({ ...editForm, departmentIds: ids }))}
                        className="rounded border-corthex-border"
                        style={{ accentColor: olive }}
                      />
                      <span className="text-sm text-corthex-text-primary">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="bg-corthex-elevated hover:bg-slate-200 text-corthex-text-primary rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: olive }}
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
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-corthex-border">
              <h2 className="text-lg font-semibold text-corthex-text-primary">임시 비밀번호</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-corthex-text-secondary">{passwordModal.name}님의 임시 비밀번호입니다.</p>
              <div className="bg-corthex-bg border border-corthex-border rounded-lg p-3 flex items-center justify-between">
                <code className="text-lg font-mono tracking-wider select-all" style={{ color: olive }}>{passwordModal.password}</code>
                <button
                  onClick={copyPassword}
                  className="text-xs text-corthex-text-secondary hover:text-corthex-text-primary px-2 py-1 rounded hover:bg-corthex-elevated transition-colors"
                >
                  복사
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-700">이 비밀번호는 다시 확인할 수 없으니 반드시 복사해두세요.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-corthex-border flex justify-end">
              <button
                onClick={() => setPasswordModal(null)}
                className="text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{ backgroundColor: olive }}
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
