/**
 * Admin Companies Page — Stitch Command Theme
 *
 * API Endpoints:
 *   GET    /admin/companies
 *   GET    /admin/companies/stats
 *   POST   /admin/companies
 *   PATCH  /admin/companies/:id
 *   DELETE /admin/companies/:id
 */
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog, TypedConfirmDialog, SkeletonCard } from '@corthex/ui'
import { Plus, Search, Users, Bot, Pencil, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

type Company = {
  id: string; name: string; slug: string; isActive: boolean; createdAt: string
}
type CompanyStats = Record<string, { userCount: number; agentCount: number }>

export function CompaniesPage() {
  const qc = useQueryClient()
  const addToast = useToastStore((s) => s.addToast)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '' })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', slug: '' })
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null)
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Company | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<{ data: Company[] }>('/admin/companies?all=true'),
  })

  const { data: statsData } = useQuery({
    queryKey: ['companies-stats'],
    queryFn: () => api.get<{ data: CompanyStats }>('/admin/companies/stats'),
  })

  const companies = data?.data || []
  const stats = statsData?.data || {}

  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies
    const q = search.toLowerCase()
    return companies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
    )
  }, [companies, search])

  const createMutation = useMutation({
    mutationFn: (body: { name: string; slug: string }) => api.post('/admin/companies', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['companies-stats'] })
      setShowCreate(false)
      setForm({ name: '', slug: '' })
      addToast({ type: 'success', message: 'Company created' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; slug?: string }) =>
      api.patch(`/admin/companies/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      setEditId(null)
      addToast({ type: 'success', message: 'Company updated' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/companies/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['companies-stats'] })
      setDeleteTarget(null)
      addToast({ type: 'success', message: 'Company deleted' })
    },
    onError: (err: Error) => {
      setDeleteTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  const hardDeleteMutation = useMutation({
    mutationFn: ({ id, confirmName }: { id: string; confirmName: string }) =>
      api.post(`/admin/companies/${id}/hard-delete`, { confirmName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['companies-stats'] })
      setHardDeleteTarget(null)
      addToast({ type: 'success', message: '회사가 영구 삭제되었습니다' })
    },
    onError: (err: Error) => {
      setHardDeleteTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  const activeCount = companies.filter((c) => c.isActive).length
  const throughput = companies.length > 0 ? Math.round((activeCount / companies.length) * 100) : 0

  return (
    <div className="min-h-screen bg-corthex-bg" data-testid="companies-page">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-corthex-accent" />
              <span className="font-mono text-xs tracking-[0.3em] text-corthex-accent">ADMIN_OVERRIDE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none text-corthex-text-primary">
              Companies Management
            </h1>
            <p className="font-mono text-sm text-corthex-text-secondary mt-2 max-w-xl">
              Global entity provisioner. Manage infrastructure permissions across the mesh network.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-corthex-accent text-corthex-text-on-accent font-black py-3 px-6 md:py-4 md:px-8 text-sm tracking-[0.15em] uppercase active:scale-95 transition-transform flex items-center gap-3 hover:bg-corthex-accent-hover min-h-[44px]"
            data-testid="company-add-btn"
          >
            <Plus size={18} />
            Create Company
          </button>
        </header>

        {/* Stats + Search Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mb-8">
          <div className="bg-corthex-surface border border-corthex-border p-6 flex flex-col justify-between h-32">
            <span className="font-mono text-[10px] tracking-widest text-corthex-text-secondary uppercase">전체 회사</span>
            <span className="text-4xl font-black tracking-tighter text-corthex-text-primary">{companies.length.toLocaleString()}</span>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-6 flex flex-col justify-between h-32">
            <span className="font-mono text-[10px] tracking-widest text-corthex-text-secondary uppercase">활성률</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black tracking-tighter text-corthex-info">{throughput}</span>
              <span className="font-mono text-xs mb-1 text-corthex-text-secondary">%</span>
            </div>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-6 flex flex-col justify-between h-32">
            <span className="font-mono text-[10px] tracking-widest text-corthex-text-secondary uppercase">Sync_Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-corthex-accent animate-pulse" />
              <span className="text-xl font-black tracking-tight text-corthex-accent">STABLE</span>
            </div>
          </div>
          <div className="bg-corthex-surface border border-corthex-border p-6 flex items-center justify-center h-32">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-b border-corthex-border focus:border-corthex-accent font-mono text-xs tracking-widest placeholder:text-corthex-text-disabled text-corthex-text-primary focus:ring-0 pb-2"
                placeholder="FILTER_SEARCH..."
                data-testid="company-search"
              />
              <Search size={14} className="absolute right-0 top-0 text-corthex-text-disabled" />
            </div>
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-corthex-surface border border-corthex-border p-6 mb-8" data-testid="company-create-form">
            <h3 className="font-mono text-xs text-corthex-accent uppercase tracking-widest mb-4">INITIALIZE_NEW_NODE</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate(form)
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">Company Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent font-mono text-base sm:text-xs text-corthex-text-primary py-3 px-2 focus:ring-0 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest mb-1.5">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full bg-corthex-bg border-b border-corthex-border focus:border-corthex-accent font-mono text-base sm:text-xs text-corthex-text-primary py-3 px-2 focus:ring-0 transition-colors"
                  placeholder="lowercase, numbers, hyphens only"
                  required
                />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="font-mono text-[10px] text-corthex-text-secondary hover:text-corthex-text-primary uppercase tracking-widest px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-corthex-accent text-corthex-text-on-accent font-mono font-bold text-xs uppercase tracking-widest px-6 py-2.5 disabled:opacity-50 hover:bg-corthex-accent-hover transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="col-span-2 font-mono text-xs text-corthex-error">{(createMutation.error as Error).message}</p>
              )}
            </form>
          </div>
        )}

        {/* Company Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6" data-testid="company-list">
            {filteredCompanies.map((c) => {
              const s = stats[c.id] || { userCount: 0, agentCount: 0 }
              return (
                <div
                  key={c.id}
                  className="bg-corthex-bg border border-corthex-border group relative hover:bg-corthex-surface transition-colors duration-300"
                  data-testid={`company-card-${c.slug}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-[2px] transition-colors ${c.isActive ? 'bg-corthex-accent' : 'bg-corthex-border'} group-hover:bg-corthex-accent`} />
                  <div className="p-6">
                    {editId === c.id ? (
                      <div className="flex items-center gap-4">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="flex-1 bg-corthex-bg border-b border-corthex-accent font-mono text-xs text-corthex-text-primary py-2 px-2 focus:ring-0"
                        />
                        <button
                          onClick={() => updateMutation.mutate({ id: c.id, name: editForm.name })}
                          className="font-mono text-[10px] text-corthex-accent uppercase tracking-widest hover:text-corthex-accent-hover transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="font-mono text-[10px] text-corthex-text-secondary uppercase tracking-widest hover:text-corthex-text-primary transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h3 className="text-2xl font-black tracking-tight uppercase mb-1 text-corthex-text-primary">
                              {c.name.toUpperCase()}
                            </h3>
                            <div className="flex items-center gap-4">
                              <span className={`px-2 py-0.5 text-[10px] font-mono tracking-widest font-bold border ${
                                c.isActive
                                  ? 'bg-corthex-accent/10 text-corthex-accent border-corthex-accent/20'
                                  : 'bg-corthex-error/10 text-corthex-error border-corthex-error/20'
                              }`}>
                                {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                              <span className="font-mono text-[10px] text-corthex-text-disabled">
                                ID: {c.id.slice(0, 8).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-corthex-elevated border border-corthex-border flex items-center justify-center text-corthex-accent">
                              <Users size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-mono tracking-widest text-corthex-text-secondary uppercase leading-none mb-1">Users</p>
                              <p className="text-lg font-black leading-none text-corthex-text-primary">{s.userCount.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-corthex-elevated border border-corthex-border flex items-center justify-center text-corthex-info">
                              <Bot size={18} />
                            </div>
                            <div>
                              <p className="text-[10px] font-mono tracking-widest text-corthex-text-secondary uppercase leading-none mb-1">Agents</p>
                              <p className="text-lg font-black leading-none text-corthex-text-primary">{s.agentCount.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-corthex-border">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-mono text-corthex-text-disabled uppercase">Provisioned_On</span>
                            <span className="font-mono text-xs text-corthex-text-secondary">
                              {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditId(c.id)
                                setEditForm({ name: c.name, slug: c.slug })
                              }}
                              className="text-corthex-text-disabled hover:text-corthex-accent transition-colors p-1"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="text-corthex-text-disabled hover:text-corthex-error transition-colors p-1"
                              title="Deactivate"
                            >
                              <Trash2 size={14} />
                            </button>
                            {!c.isActive && (
                              <button
                                onClick={() => setHardDeleteTarget(c)}
                                className="text-corthex-text-disabled hover:text-red-600 transition-colors p-1"
                                title="영구 삭제"
                              >
                                <AlertTriangle size={14} />
                              </button>
                            )}
                            <button className="font-mono text-[10px] tracking-[0.2em] text-corthex-accent uppercase font-bold hover:underline ml-2">
                              선택
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add New Slot */}
            <div
              className="border-2 border-dashed border-corthex-border group hover:border-corthex-accent/50 transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center min-h-[340px]"
              onClick={() => setShowCreate(true)}
            >
              <div className="w-16 h-16 bg-corthex-elevated border border-corthex-border flex items-center justify-center text-corthex-text-disabled group-hover:text-corthex-accent mb-6 transition-colors">
                <Plus size={32} />
              </div>
              <h3 className="font-black tracking-widest uppercase mb-2 text-corthex-text-primary">Initialize Node</h3>
              <p className="font-mono text-[10px] text-corthex-text-disabled uppercase tracking-[0.1em]">
                Awaiting infrastructure allocation command...
              </p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredCompanies.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-mono text-[10px] text-corthex-text-disabled uppercase tracking-widest">
              Showing {filteredCompanies.length} of {companies.length} companies
            </p>
            <div className="flex gap-2">
              <button className="p-1 border border-corthex-border bg-corthex-surface transition-colors disabled:opacity-50 text-corthex-text-disabled" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-corthex-accent text-corthex-text-on-accent font-bold text-xs">1</button>
              <button className="p-1 border border-corthex-border bg-corthex-surface transition-colors text-corthex-text-disabled hover:text-corthex-accent">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Footer Data Stream */}
        <footer className="mt-8 md:mt-16 pt-6 md:pt-8 border-t border-corthex-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-corthex-text-disabled uppercase">System_Load</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1 bg-corthex-elevated">
                  <div className="w-1/3 h-full bg-corthex-info" />
                </div>
                <span className="font-mono text-[10px] text-corthex-info">NOMINAL</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-corthex-text-disabled uppercase">Network_Latency</span>
              <span className="font-mono text-[10px] text-corthex-accent">STABLE</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-corthex-text-disabled uppercase tracking-[0.2em]">
            SECURE_TERMINAL // CORTHEX_ADMIN
          </div>
        </footer>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}`}
        description="회사를 비활성화하면 소속 직원의 로그인이 차단됩니다. 비활성화 후 영구 삭제가 가능합니다."
        confirmText="Delete"
        variant="danger"
      />

      <TypedConfirmDialog
        isOpen={!!hardDeleteTarget}
        onConfirm={() => hardDeleteTarget && hardDeleteMutation.mutate({ id: hardDeleteTarget.id, confirmName: hardDeleteTarget.name })}
        onCancel={() => setHardDeleteTarget(null)}
        title="회사 영구 삭제"
        description="이 작업은 회사의 모든 데이터(직원, 에이전트, 채팅, 비용 등)를 영구적으로 삭제합니다. 복구할 수 없습니다."
        requiredText={hardDeleteTarget?.name || ''}
        inputLabel="회사 이름을 정확히 입력하세요"
        confirmText="영구 삭제"
        loading={hardDeleteMutation.isPending}
      />
    </div>
  )
}
