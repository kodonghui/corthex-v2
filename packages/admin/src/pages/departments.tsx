/**
 * Admin Departments — Industrial Dark Theme (Stitch)
 *
 * API Endpoints:
 *   GET    /admin/departments?companyId={id}
 *   POST   /admin/departments
 *   PATCH  /admin/departments/{id}
 *   DELETE /admin/departments/{id}?mode={force|wait_completion}
 *   GET    /admin/departments/{id}/cascade-analysis
 *   GET    /admin/agents?companyId={id}
 */
import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import {
  Plus, Search, Filter, Download, ChevronLeft, ChevronRight,
  X, Users, Shield, AlertTriangle, BarChart2, Building2, Key,
  Pencil, Trash2,
} from 'lucide-react'

type Department = { id: string; companyId: string; name: string; description: string | null; isActive: boolean; createdAt: string }
type Agent = { id: string; name: string; role: string; departmentId: string | null; status: string }

type AgentBreakdown = {
  id: string
  name: string
  tier: 'manager' | 'specialist' | 'worker'
  isSystem: boolean
  activeTaskCount: number
  totalCostUsdMicro: number
}

type CascadeAnalysis = {
  departmentId: string
  departmentName: string
  agentCount: number
  activeTaskCount: number
  totalCostUsdMicro: number
  knowledgeCount: number
  agentBreakdown: AgentBreakdown[]
}

type CascadeMode = 'force' | 'wait_completion'

const tierLabels: Record<string, string> = {
  manager: 'Manager',
  specialist: 'Specialist',
  worker: 'Worker',
}

function formatCost(usdMicro: number): string {
  return `$${(usdMicro / 1_000_000).toFixed(2)}`
}

export function DepartmentsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  // Form states
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', description: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)

  // Cascade modal state
  const [cascadeTarget, setCascadeTarget] = useState<Department | null>(null)
  const [cascadeData, setCascadeData] = useState<CascadeAnalysis | null>(null)
  const [cascadeMode, setCascadeMode] = useState<CascadeMode>('wait_completion')
  const [cascadeLoading, setCascadeLoading] = useState(false)

  const { data: deptData, isLoading } = useQuery({
    queryKey: ['departments', selectedCompanyId],
    queryFn: () => api.get<{ data: Department[] }>(`/admin/departments?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const { data: agentData } = useQuery({
    queryKey: ['agents', selectedCompanyId],
    queryFn: () => api.get<{ data: Agent[] }>(`/admin/agents?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const depts = deptData?.data || []
  const allAgents = agentData?.data || []
  const agentCountMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const a of allAgents) {
      if (a.departmentId) map.set(a.departmentId, (map.get(a.departmentId) || 0) + 1)
    }
    return map
  }, [allAgents])
  const agentCountByDept = (deptId: string) => agentCountMap.get(deptId) || 0

  const filteredDepts = searchQuery
    ? depts.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : depts

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string }) => api.post('/admin/departments', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setShowCreate(false)
      setForm({ name: '', description: '' })
      addToast({ type: 'success', message: '부서가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name: string; description?: string }) => api.patch(`/admin/departments/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      setEditId(null)
      addToast({ type: 'success', message: '부서가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: ({ id, mode }: { id: string; mode: CascadeMode }) => api.delete(`/admin/departments/${id}?mode=${mode}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
      qc.invalidateQueries({ queryKey: ['agents'] })
      closeCascadeModal()
      addToast({ type: 'success', message: '부서가 삭제되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const cascadeAbortRef = useRef<AbortController | null>(null)

  async function openCascadeModal(dept: Department) {
    cascadeAbortRef.current?.abort()
    const controller = new AbortController()
    cascadeAbortRef.current = controller
    setCascadeTarget(dept)
    setCascadeData(null)
    setCascadeLoading(true)
    setCascadeMode('wait_completion')
    try {
      const result = await api.get<{ data: CascadeAnalysis }>(`/admin/departments/${dept.id}/cascade-analysis`)
      if (controller.signal.aborted) return
      setCascadeData(result.data)
    } catch (err) {
      if (controller.signal.aborted) return
      addToast({ type: 'error', message: (err as Error).message })
      setCascadeTarget(null)
      setCascadeData(null)
    } finally {
      if (!controller.signal.aborted) setCascadeLoading(false)
    }
  }

  function closeCascadeModal() {
    cascadeAbortRef.current?.abort()
    setCascadeTarget(null)
    setCascadeData(null)
    setCascadeMode('wait_completion')
  }

  if (!selectedCompanyId) return (
    <div className="p-8 text-center text-corthex-text-secondary">회사를 선택하세요</div>
  )

  return (
    <div className="min-h-screen bg-corthex-bg" data-testid="departments-page">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 sm:gap-6 mb-8 md:mb-12 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-corthex-accent shadow-[0_0_8px_rgba(202,138,4,0.6)]" />
              <span className="font-mono text-xs tracking-[0.3em] text-corthex-accent uppercase">Registry / Sector</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase text-corthex-text-primary leading-none" data-testid="departments-title">
              Departments
            </h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase text-corthex-text-disabled mb-1">Total Sectors</p>
              <p className="font-mono text-2xl font-bold text-corthex-text-primary">
                {depts.length}
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent px-6 py-3 md:px-8 md:py-4 font-black text-sm tracking-widest uppercase transition-all flex items-center gap-3 active:scale-95 shadow-[8px_8px_0px_rgba(202,138,4,0.2)] min-h-[44px]"
              data-testid="departments-create-btn"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create Department</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        </header>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-corthex-surface border border-corthex-border p-6 mb-8" data-testid="departments-create-form">
            <h3 className="text-lg font-bold text-corthex-text-primary uppercase tracking-tight mb-4">New Department</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate({
                  name: form.name,
                  ...(form.description ? { description: form.description } : {}),
                })
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">부서명 *</label>
                  <input
                    data-testid="departments-create-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-corthex-bg border-b-2 border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-base sm:text-sm py-3 px-0 outline-none transition-colors placeholder:opacity-30"
                    placeholder="e.g. ENGINEERING"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">설명</label>
                  <input
                    data-testid="departments-create-desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-corthex-bg border-b-2 border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-base sm:text-sm py-3 px-0 outline-none transition-colors placeholder:opacity-30"
                    placeholder="부서의 역할과 목적"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  data-testid="departments-create-cancel"
                  type="button"
                  onClick={() => { setShowCreate(false); setForm({ name: '', description: '' }) }}
                  className="font-mono text-xs uppercase tracking-[0.2em] text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  data-testid="departments-create-submit"
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent font-black text-xs uppercase tracking-widest px-6 py-2 transition-all disabled:opacity-50 active:scale-95"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Department Table */}
        <section className="bg-corthex-surface border border-corthex-border/20 shadow-2xl overflow-hidden">
          {/* Table Controls */}
          <div className="bg-corthex-elevated px-4 sm:px-6 py-4 border-b border-corthex-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-corthex-text-disabled" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-base sm:text-[10px] pl-10 pr-4 py-2 w-full sm:w-64 outline-none transition-all placeholder:opacity-30"
                  placeholder="FILTER DEPARTMENTS..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-corthex-text-disabled">
              <button className="hover:text-corthex-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Filter className="w-5 h-5" /></button>
              <button className="hover:text-corthex-accent transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"><Download className="w-5 h-5" /></button>
              <div className="h-4 w-px bg-corthex-border hidden sm:block" />
              <span className="font-mono text-[10px] uppercase tracking-widest hidden sm:inline">활성 노드: {allAgents.length}</span>
            </div>
          </div>

          {/* The Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="px-8 py-12 text-center font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled" data-testid="departments-loading">
                Loading...
              </div>
            ) : filteredDepts.length === 0 ? (
              <div className="px-8 py-12 text-center" data-testid="departments-empty-state">
                <p className="font-mono text-[10px] uppercase tracking-widest text-corthex-text-disabled mb-4">
                  {searchQuery ? 'No departments match your search' : 'No departments registered'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="bg-corthex-accent text-corthex-text-on-accent font-black text-xs uppercase tracking-widest px-6 py-2 transition-all active:scale-95"
                  >
                    + Create Department
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full text-left border-collapse" data-testid="departments-table">
                <thead>
                  <tr className="bg-corthex-elevated border-b border-corthex-border">
                    <th className="px-4 sm:px-6 md:px-8 py-4 md:py-6">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-corthex-text-disabled uppercase flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        Department Name
                      </span>
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-4 md:py-6 hidden md:table-cell">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-corthex-text-disabled uppercase flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        Description
                      </span>
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-corthex-text-disabled uppercase flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Agent Count
                      </span>
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-4 md:py-6 text-right">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-corthex-text-disabled uppercase">Status</span>
                    </th>
                    <th className="px-4 sm:px-6 md:px-8 py-4 md:py-6 text-right">
                      <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-corthex-text-disabled uppercase">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-corthex-border/30">
                  {filteredDepts.map((d) => {
                    const count = agentCountByDept(d.id)
                    const isEditing = editId === d.id

                    if (isEditing) {
                      return (
                        <tr key={d.id} className="bg-corthex-elevated/50">
                          <td className="px-8 py-4" colSpan={5}>
                            <div className="flex items-center gap-4">
                              <input
                                data-testid={`departments-edit-name-${d.id}`}
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-sm py-2 px-0 outline-none transition-colors w-48"
                              />
                              <input
                                data-testid={`departments-edit-desc-${d.id}`}
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                className="bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent text-corthex-text-primary font-mono text-sm py-2 px-0 outline-none transition-colors flex-1"
                                placeholder="설명"
                              />
                              <button
                                data-testid={`departments-edit-save-${d.id}`}
                                onClick={() => updateMutation.mutate({ id: d.id, name: editForm.name, description: editForm.description || undefined })}
                                disabled={updateMutation.isPending}
                                className="font-mono text-xs uppercase tracking-widest text-corthex-accent hover:text-corthex-accent-hover transition-colors disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                data-testid={`departments-edit-cancel-${d.id}`}
                                onClick={() => setEditId(null)}
                                className="font-mono text-xs uppercase tracking-widest text-corthex-text-disabled hover:text-corthex-text-secondary transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={d.id} onClick={() => setSelectedDept(d)} className="hover:bg-corthex-elevated/60 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-corthex-accent" data-testid={`departments-row-${d.id}`}>
                        <td className="px-4 sm:px-6 md:px-8 py-4 md:py-6">
                          <div className="flex flex-col">
                            <span className="text-corthex-text-primary font-bold tracking-tight uppercase group-hover:text-corthex-accent transition-colors" data-testid={`departments-name-${d.id}`}>
                              {d.name}
                            </span>
                            <span className="font-mono text-[9px] text-corthex-text-disabled opacity-50 uppercase">
                              ID: {d.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 md:py-6 hidden md:table-cell">
                          <span className="text-sm text-corthex-text-secondary">{d.description || '—'}</span>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 md:py-6 hidden sm:table-cell">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-lg font-bold text-corthex-text-primary" data-testid={`departments-agent-count-${d.id}`}>{count}</span>
                            <div className="flex-1 h-1 bg-corthex-border w-24 relative overflow-hidden">
                              <div
                                className="absolute top-0 left-0 h-full bg-corthex-accent"
                                style={{ width: `${Math.min(count * 10, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 md:py-6 text-right">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 border-l-2 ${
                              d.isActive
                                ? 'bg-corthex-elevated border-corthex-accent'
                                : 'bg-corthex-elevated border-corthex-text-disabled'
                            }`}
                            data-testid={`departments-status-${d.id}`}
                          >
                            <span
                              className={`font-mono text-[10px] font-bold uppercase ${
                                d.isActive ? 'text-corthex-accent' : 'text-corthex-text-disabled'
                              }`}
                            >
                              {d.isActive ? 'Operational' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 md:px-8 py-4 md:py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              data-testid={`departments-edit-${d.id}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditId(d.id)
                                setEditForm({ name: d.name, description: d.description || '' })
                              }}
                              className="p-2 sm:p-1.5 text-corthex-text-disabled hover:text-corthex-accent hover:bg-corthex-elevated rounded transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              data-testid={`departments-delete-${d.id}`}
                              onClick={(e) => { e.stopPropagation(); openCascadeModal(d) }}
                              className="p-2 sm:p-1.5 text-corthex-text-disabled hover:text-corthex-error hover:bg-corthex-elevated rounded transition-colors min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="bg-corthex-elevated px-4 sm:px-6 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-corthex-border">
            <div className="font-mono text-[10px] text-corthex-text-disabled opacity-60 uppercase">
              Showing {filteredDepts.length} of {depts.length} Registered Departments
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center border border-corthex-border text-corthex-text-secondary hover:bg-corthex-accent hover:text-corthex-text-on-accent transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-corthex-accent text-corthex-text-on-accent font-bold text-[10px] font-mono">
                01
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-corthex-border text-corthex-text-secondary hover:bg-corthex-accent hover:text-corthex-text-on-accent transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-corthex-surface p-4 md:p-6 border-l-2 border-corthex-accent">
            <p className="font-mono text-[10px] uppercase text-corthex-text-disabled opacity-50 mb-2">Total Departments</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-corthex-text-primary">{depts.length}</span>
              <BarChart2 className="w-6 h-6 text-corthex-accent opacity-40" />
            </div>
          </div>
          <div className="bg-corthex-surface p-4 md:p-6 border-l-2 border-corthex-accent">
            <p className="font-mono text-[10px] uppercase text-corthex-text-disabled opacity-50 mb-2">Active Depts</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-corthex-text-primary">{depts.filter((d) => d.isActive).length}</span>
              <Shield className="w-6 h-6 text-corthex-accent opacity-40" />
            </div>
          </div>
          <div className="bg-corthex-surface p-4 md:p-6 border-l-2 border-corthex-accent">
            <p className="font-mono text-[10px] uppercase text-corthex-text-disabled opacity-50 mb-2">Total Agents</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-corthex-text-primary">{allAgents.length}</span>
              <Users className="w-6 h-6 text-corthex-accent opacity-40" />
            </div>
          </div>
          <div className="bg-corthex-surface p-4 md:p-6 border-l-2 border-corthex-error">
            <p className="font-mono text-[10px] uppercase text-corthex-text-disabled opacity-50 mb-2">System Alerts</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-corthex-error">{depts.filter((d) => !d.isActive).length}</span>
              <AlertTriangle className="w-6 h-6 text-corthex-error opacity-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Department Detail Panel */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedDept(null)}>
          <div
            data-testid="departments-detail-panel"
            className="bg-corthex-surface border border-corthex-border shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-corthex-border">
              <div>
                <h3 className="text-lg font-bold text-corthex-text-primary uppercase tracking-tight">{selectedDept.name}</h3>
                <p className="font-mono text-[10px] text-corthex-text-disabled uppercase">ID: {selectedDept.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedDept(null)} className="text-corthex-text-disabled hover:text-corthex-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-1">Description</p>
                <p className="text-sm text-corthex-text-secondary">{selectedDept.description || '—'}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-1">Status</p>
                <span className={`font-mono text-xs font-bold uppercase ${selectedDept.isActive ? 'text-corthex-accent' : 'text-corthex-text-disabled'}`}>
                  {selectedDept.isActive ? 'Operational' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-2">
                  Assigned Agents ({allAgents.filter((a) => a.departmentId === selectedDept.id).length})
                </p>
                {allAgents.filter((a) => a.departmentId === selectedDept.id).length === 0 ? (
                  <p className="font-mono text-xs text-corthex-text-disabled">No agents assigned</p>
                ) : (
                  <div className="space-y-2">
                    {allAgents.filter((a) => a.departmentId === selectedDept.id).map((a) => (
                      <div key={a.id} className="flex items-center justify-between bg-corthex-bg px-3 py-2 border border-corthex-border/30">
                        <span className="text-sm font-bold text-corthex-text-primary">{a.name}</span>
                        <span className="font-mono text-[10px] text-corthex-text-disabled uppercase">{a.role}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-corthex-text-disabled mb-1">Created</p>
                <p className="font-mono text-xs text-corthex-text-secondary">{new Date(selectedDept.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cascade Wizard Modal */}
      {cascadeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeCascadeModal}>
          <div
            data-testid="departments-cascade-modal"
            className="bg-corthex-surface border border-corthex-border shadow-xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-corthex-border shrink-0">
              <h2 className="text-lg font-semibold text-corthex-text-primary">
                부서 삭제 - {cascadeTarget.name}
              </h2>
              <button data-testid="departments-cascade-close" onClick={closeCascadeModal} className="text-corthex-text-disabled hover:text-corthex-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1 min-h-0">
              {cascadeLoading ? (
                <div className="text-center text-corthex-text-disabled py-8">영향 분석 중...</div>
              ) : cascadeData ? (
                <>
                  {/* Impact Summary */}
                  <div>
                    <h3 className="text-sm font-medium text-corthex-text-primary mb-3">
                      &quot;{cascadeData.departmentName}&quot;을(를) 삭제하면 다음이 영향 받습니다:
                    </h3>
                    <div data-testid="departments-impact-summary" className="grid grid-cols-2 gap-3">
                      <div className="bg-corthex-bg rounded-xl p-3">
                        <p className="text-xs text-corthex-text-disabled">소속 에이전트</p>
                        <p className="text-lg font-semibold text-corthex-text-primary">{cascadeData.agentCount}명</p>
                      </div>
                      <div className="bg-corthex-bg rounded-xl p-3">
                        <p className="text-xs text-corthex-text-disabled">진행 중 작업</p>
                        <p className="text-lg font-semibold text-corthex-text-primary">{cascadeData.activeTaskCount}건</p>
                      </div>
                      <div className="bg-corthex-bg rounded-xl p-3">
                        <p className="text-xs text-corthex-text-disabled">학습 기록</p>
                        <p className="text-lg font-semibold text-corthex-text-primary">{cascadeData.knowledgeCount}건</p>
                      </div>
                      <div className="bg-corthex-bg rounded-xl p-3">
                        <p className="text-xs text-corthex-text-disabled">누적 비용</p>
                        <p className="text-lg font-semibold text-corthex-text-primary">{formatCost(cascadeData.totalCostUsdMicro)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Agent Breakdown */}
                  {cascadeData.agentBreakdown.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-corthex-text-disabled uppercase tracking-wider mb-2">영향 받는 에이전트</h4>
                      <div data-testid="departments-agent-breakdown" className="space-y-1 max-h-32 overflow-y-auto">
                        {cascadeData.agentBreakdown.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-2">
                              <span className="text-corthex-text-primary">{a.name}</span>
                              <span className="text-xs text-corthex-text-disabled">{tierLabels[a.tier] || a.tier}</span>
                              {a.isSystem && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-corthex-accent/10 text-corthex-accent">
                                  시스템
                                </span>
                              )}
                            </div>
                            {a.activeTaskCount > 0 && (
                              <span className="text-xs text-corthex-accent">작업 {a.activeTaskCount}건</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode Selection */}
                  <div>
                    <h4 className="text-xs font-medium text-corthex-text-disabled uppercase tracking-wider mb-2">삭제 방식 선택</h4>
                    <div className="space-y-2">
                      <label
                        data-testid="departments-mode-wait"
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          cascadeMode === 'wait_completion'
                            ? 'border-corthex-accent bg-corthex-accent/10'
                            : 'border-corthex-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cascadeMode"
                          value="wait_completion"
                          checked={cascadeMode === 'wait_completion'}
                          onChange={() => setCascadeMode('wait_completion')}
                          className="mt-0.5 accent-corthex-accent"
                        />
                        <div>
                          <p className="text-sm font-medium text-corthex-text-primary">완료 대기 (권장)</p>
                          <p className="text-xs text-corthex-text-disabled mt-0.5">진행 중 작업이 끝난 후 삭제합니다. 에이전트는 미배속으로 전환됩니다.</p>
                        </div>
                      </label>
                      <label
                        data-testid="departments-mode-force"
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          cascadeMode === 'force'
                            ? 'border-corthex-error bg-corthex-error/5'
                            : 'border-corthex-border'
                        }`}
                      >
                        <input
                          type="radio"
                          name="cascadeMode"
                          value="force"
                          checked={cascadeMode === 'force'}
                          onChange={() => setCascadeMode('force')}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-corthex-text-primary">강제 종료</p>
                          <p className="text-xs text-corthex-text-disabled mt-0.5">진행 중 작업을 즉시 중단하고 삭제합니다.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Preservation notice */}
                  <div data-testid="departments-preservation-notice" className="bg-corthex-bg rounded-xl p-3 text-xs text-corthex-text-disabled space-y-1">
                    <p>* 학습 기록은 아카이브에 보존됩니다</p>
                    <p>* 비용 기록은 영구 보존됩니다 (회계 추적)</p>
                    <p>* 에이전트는 미배속으로 전환되지만 활성 상태가 유지됩니다</p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-corthex-border shrink-0">
              <button
                data-testid="departments-cascade-cancel"
                onClick={closeCascadeModal}
                className="px-4 py-2 text-sm text-corthex-text-secondary hover:text-corthex-text-primary"
              >
                취소
              </button>
              <button
                data-testid="departments-cascade-confirm"
                onClick={() => {
                  if (cascadeTarget) {
                    deleteMutation.mutate({ id: cascadeTarget.id, mode: cascadeMode })
                  }
                }}
                disabled={deleteMutation.isPending || cascadeLoading || !cascadeData}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {deleteMutation.isPending ? '삭제 중...' : '삭제 실행'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
