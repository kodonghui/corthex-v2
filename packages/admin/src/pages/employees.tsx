/**
 * Admin Employees Management — Industrial Dark Theme (Stitch)
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
import {
  UserPlus, Search, Filter, Users, UserCheck, Briefcase,
  Pencil, Trash2, ChevronLeft, ChevronRight, X, KeyRound,
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog } from '@corthex/ui'

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
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Employee | null>(null)
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

  const hardDeleteMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/employees/${id}/hard-delete`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      setHardDeleteTarget(null)
      addToast({ type: 'success', message: '직원이 영구 삭제되었습니다' })
    },
    onError: (err: Error) => {
      setHardDeleteTarget(null)
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
    <div className="min-h-screen bg-corthex-bg" data-testid="employees-page">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black text-corthex-text-primary tracking-tighter uppercase mb-1">
              Employees Management
            </h1>
            <p className="text-corthex-text-secondary text-sm">
              {pagination ? `${pagination.total}명의 직원` : 'Manage personnel, roles, and department assignments.'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search employees..."
                className="bg-corthex-surface border border-corthex-border text-corthex-text-secondary text-base sm:text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-corthex-accent focus:border-corthex-accent outline-none w-full sm:w-56 transition-all"
                data-testid="search-input"
                type="text"
              />
            </div>
            {/* Dept Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1) }}
                className="bg-corthex-surface border border-corthex-border text-corthex-text-secondary text-xs rounded-lg pl-9 pr-8 py-2.5 focus:ring-1 focus:ring-corthex-accent outline-none appearance-none cursor-pointer hover:bg-corthex-elevated transition-colors"
                data-testid="filters"
              >
                <option value="">Department: ALL</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            {/* Active Filter */}
            <div className="relative">
              <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
              <select
                value={activeFilter}
                onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
                className="bg-corthex-surface border border-corthex-border text-corthex-text-secondary text-xs rounded-lg pl-9 pr-8 py-2.5 focus:ring-1 focus:ring-corthex-accent outline-none appearance-none cursor-pointer hover:bg-corthex-elevated transition-colors"
              >
                <option value="">Status: ALL</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            {/* Add Employee */}
            <button
              onClick={() => setShowInvite(true)}
              className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg min-h-[44px]"
              data-testid="invite-btn"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
          </div>
        </header>

        {/* Employee Table */}
        <div className="bg-corthex-surface border border-corthex-border rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-corthex-border bg-corthex-elevated/50">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-disabled">Name</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-disabled hidden sm:table-cell">Username</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-disabled hidden md:table-cell">Department</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-disabled">Status</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-disabled hidden lg:table-cell">Hire Date</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-[10px] font-black uppercase tracking-widest text-corthex-text-disabled text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-corthex-text-disabled text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-corthex-text-disabled text-sm">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-corthex-elevated/40 transition-colors group">
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-corthex-elevated text-corthex-accent border border-corthex-border shrink-0">
                              {emp.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-corthex-surface rounded-full ${
                                emp.isActive ? 'bg-corthex-success' : 'bg-corthex-text-disabled'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-corthex-text-primary">{emp.name}</p>
                            <p className="text-xs text-corthex-text-disabled">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-corthex-text-secondary text-sm font-medium hidden sm:table-cell">
                        @{emp.username}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {emp.departments.length === 0 ? (
                            <span className="px-2 py-1 bg-corthex-elevated text-corthex-text-disabled text-[10px] font-bold uppercase tracking-wider border border-corthex-border rounded">
                              Unassigned
                            </span>
                          ) : (
                            emp.departments.map((d) => (
                              <span
                                key={d.id}
                                className="px-2 py-1 bg-corthex-elevated text-corthex-text-secondary text-[10px] font-bold uppercase tracking-wider border border-corthex-border rounded"
                              >
                                {d.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${emp.isActive ? 'bg-corthex-success' : 'bg-corthex-text-disabled'}`}
                          />
                          <span
                            className={`text-xs font-medium ${emp.isActive ? 'text-corthex-success' : 'text-corthex-text-disabled'}`}
                          >
                            {emp.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-corthex-text-secondary text-sm font-mono italic hidden lg:table-cell">
                        {new Date(emp.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: '2-digit', year: 'numeric',
                        }).toUpperCase()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditTarget(emp)
                              setEditForm({ name: emp.name, email: emp.email, departmentIds: emp.departments.map((d) => d.id) })
                            }}
                            className="p-1.5 text-corthex-text-secondary hover:text-corthex-accent hover:bg-corthex-elevated rounded transition-colors"
                            data-testid={`edit-btn-${emp.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {emp.isActive && (
                            <button
                              onClick={() => setResetPasswordTarget(emp)}
                              className="p-1.5 text-corthex-text-secondary hover:text-corthex-accent hover:bg-corthex-elevated rounded transition-colors"
                              data-testid={`reset-pw-btn-${emp.id}`}
                              title="비밀번호 초기화"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                          {emp.isActive ? (
                            <button
                              onClick={() => setDeactivateTarget(emp)}
                              className="p-1.5 text-corthex-text-secondary hover:text-corthex-error hover:bg-corthex-elevated rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => setReactivateTarget(emp)}
                                className="p-1.5 text-corthex-text-secondary hover:text-corthex-success hover:bg-corthex-elevated rounded transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setHardDeleteTarget(emp)}
                                className="p-1.5 text-corthex-text-secondary hover:text-red-600 hover:bg-corthex-elevated rounded transition-colors"
                                title="영구 삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-corthex-elevated/30 border-t border-corthex-border">
              <p className="text-corthex-text-disabled text-xs font-medium">
                Showing{' '}
                <span className="text-corthex-text-secondary">{(page - 1) * 20 + 1}</span> to{' '}
                <span className="text-corthex-text-secondary">{Math.min(page * 20, pagination.total)}</span> of{' '}
                <span className="text-corthex-text-secondary">{pagination.total}</span> entries
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-corthex-border text-corthex-text-disabled hover:text-corthex-accent hover:border-corthex-accent/50 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-colors ${
                      p === page
                        ? 'bg-corthex-accent text-corthex-text-on-accent'
                        : 'border border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-corthex-border text-corthex-text-disabled hover:text-corthex-accent hover:border-corthex-accent/50 transition-colors disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-corthex-surface border border-corthex-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-corthex-accent/10 flex items-center justify-center text-corthex-accent border border-corthex-accent/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-corthex-text-disabled font-black uppercase tracking-widest">Total Workforce</p>
              <p className="text-2xl font-black text-corthex-text-primary tracking-tighter">{pagination?.total ?? '--'}</p>
            </div>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-corthex-elevated flex items-center justify-center text-corthex-text-secondary border border-corthex-border">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-corthex-text-disabled font-black uppercase tracking-widest">Active</p>
              <p className="text-2xl font-black text-corthex-text-primary tracking-tighter">
                {employees.filter((e) => e.isActive).length}
              </p>
            </div>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-corthex-elevated flex items-center justify-center text-corthex-text-secondary border border-corthex-border">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-corthex-text-disabled font-black uppercase tracking-widest">Unassigned</p>
              <p className="text-2xl font-black text-corthex-text-primary tracking-tighter">
                {employees.filter((e) => e.departments.length === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Employee Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInvite(false)} data-testid="invite-modal">
          <div className="bg-corthex-surface border border-corthex-border rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-corthex-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-corthex-text-primary">직원 초대</h2>
              <button onClick={() => setShowInvite(false)} className="text-corthex-text-disabled hover:text-corthex-text-secondary"><X className="w-5 h-5" /></button>
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
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-base sm:text-sm text-corthex-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-corthex-accent"
                  placeholder="사용자 아이디"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이름 *</label>
                <input
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-base sm:text-sm text-corthex-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-corthex-accent"
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
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-base sm:text-sm text-corthex-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-corthex-accent"
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
                        className="rounded border-corthex-border accent-corthex-accent"
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
                  className="bg-corthex-elevated hover:bg-corthex-border text-corthex-text-primary rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
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
            <div className="px-6 py-4 border-b border-corthex-border flex items-center justify-between">
              <h2 className="text-lg font-semibold text-corthex-text-primary">직원 수정 &mdash; {editTarget.name}</h2>
              <button onClick={() => setEditTarget(null)} className="text-corthex-text-disabled hover:text-corthex-text-secondary"><X className="w-5 h-5" /></button>
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
                <input value={editTarget.username} disabled className="w-full bg-corthex-elevated border border-corthex-border rounded-lg px-3 py-2 text-sm text-corthex-text-disabled cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이름</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-base sm:text-sm text-corthex-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-corthex-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-corthex-text-secondary mb-1.5">이메일</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-corthex-bg border border-corthex-border rounded-lg px-3 py-2 text-base sm:text-sm text-corthex-text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-corthex-accent"
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
                        className="rounded border-corthex-border accent-corthex-accent"
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
                  className="bg-corthex-elevated hover:bg-corthex-border text-corthex-text-primary rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
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
                <code className="text-lg font-mono tracking-wider select-all text-corthex-accent">{passwordModal.password}</code>
                <button
                  onClick={copyPassword}
                  className="text-xs text-corthex-text-secondary hover:text-corthex-text-primary px-2 py-1 rounded hover:bg-corthex-elevated transition-colors"
                >
                  복사
                </button>
              </div>
              <div className="bg-corthex-accent/10 border border-corthex-accent/20 rounded-lg p-3">
                <p className="text-xs text-corthex-accent">이 비밀번호는 다시 확인할 수 없으니 반드시 복사해두세요.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-corthex-border flex justify-end">
              <button
                onClick={() => setPasswordModal(null)}
                className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg px-4 py-2 text-sm font-medium transition-colors"
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

      <ConfirmDialog
        isOpen={!!hardDeleteTarget}
        onConfirm={() => hardDeleteTarget && hardDeleteMutation.mutate(hardDeleteTarget.id)}
        onCancel={() => setHardDeleteTarget(null)}
        title={`${hardDeleteTarget?.name} 영구 삭제`}
        description="이 직원의 모든 데이터(채팅 기록, 보고서, 파일 등)가 영구 삭제됩니다. 복구할 수 없습니다."
        confirmText="영구 삭제"
        variant="danger"
      />
    </div>
  )
}
