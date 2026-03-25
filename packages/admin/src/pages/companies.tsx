/**
 * Admin Companies Page — Natural Organic Theme
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
import { ConfirmDialog, SkeletonCard } from '@corthex/ui'
import { Plus, Search, Users, Bot, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { olive, oliveBg, terracotta, cream, sand, warmBrown, muted, lightMuted } from '../lib/colors'

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

  const inputStyle = { borderColor: sand, color: warmBrown, backgroundColor: '#fbfaf8' }

  return (
    <div className="min-h-screen" style={{ backgroundColor: cream, fontFamily: "'Public Sans', sans-serif" }}>
      <div className="p-8 max-w-5xl mx-auto w-full" data-testid="companies-page">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>
              Company Management
            </h1>
            <p className="mt-1" style={{ color: muted }}>
              {filteredCompanies.length === companies.length
                ? `${companies.length} companies`
                : `${filteredCompanies.length} / ${companies.length} companies`}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all text-white shadow-lg"
            style={{ backgroundColor: terracotta, boxShadow: '0 10px 15px -3px rgba(196,98,45,0.2)' }}
            data-testid="company-add-btn"
          >
            <Plus size={18} />
            <span>Add Company</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-corthex-surface rounded-xl border p-4 mb-6 flex items-center" style={{ borderColor: sand }}>
          <div className="relative w-full md:w-96">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: lightMuted }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company name or slug..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
              style={{ ...inputStyle, outlineColor: olive }}
              data-testid="company-search"
            />
          </div>
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="bg-corthex-surface rounded-xl border p-6 mb-6 shadow-sm" style={{ borderColor: sand }} data-testid="company-create-form">
            <h3 className="text-lg font-bold mb-4" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>New Company</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate(form)
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Company Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1"
                  style={{ ...inputStyle, outlineColor: olive }}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: muted }}>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1"
                  style={{ ...inputStyle, outlineColor: olive }}
                  placeholder="lowercase, numbers, hyphens only"
                  required
                />
              </div>
              <div className="col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2 text-sm" style={{ color: muted }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: olive }}
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
              {createMutation.isError && (
                <p className="col-span-2 text-sm" style={{ color: '#ef4444' }}>{(createMutation.error as Error).message}</p>
              )}
            </form>
          </div>
        )}

        {/* Company List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="space-y-4" data-testid="company-list">
            {filteredCompanies.map((c) => {
              const s = stats[c.id] || { userCount: 0, agentCount: 0 }
              return (
                <div
                  key={c.id}
                  className="bg-corthex-surface rounded-xl border p-6 shadow-sm transition-all hover:shadow-md"
                  style={{ borderColor: sand }}
                  data-testid={`company-card-${c.slug}`}
                >
                  {editId === c.id ? (
                    <div className="flex items-center gap-4">
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="flex-1 px-3 py-2.5 border rounded-lg text-sm"
                        style={inputStyle}
                      />
                      <button
                        onClick={() => updateMutation.mutate({ id: c.id, name: editForm.name })}
                        className="text-sm font-bold" style={{ color: olive }}
                      >
                        Save
                      </button>
                      <button onClick={() => setEditId(null)} className="text-sm" style={{ color: muted }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm" style={{ backgroundColor: oliveBg, color: olive }}>
                            {c.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>{c.name}</h3>
                            <p className="text-xs" style={{ color: lightMuted }}>slug: {c.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3 ml-[52px]">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} style={{ color: muted }} />
                            <span className="text-xs font-medium" style={{ color: muted }}>{s.userCount} users</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Bot size={14} style={{ color: muted }} />
                            <span className="text-xs font-medium" style={{ color: muted }}>{s.agentCount} agents</span>
                          </div>
                          <span className="text-xs" style={{ color: lightMuted }}>
                            Created: {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-bold"
                          style={{
                            backgroundColor: c.isActive ? oliveBg : 'rgba(239,68,68,0.1)',
                            color: c.isActive ? olive : '#ef4444',
                          }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.isActive ? olive : '#ef4444' }} />
                          {c.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => {
                            setEditId(c.id)
                            setEditForm({ name: c.name, slug: c.slug })
                          }}
                          className="p-1.5 rounded hover:bg-corthex-elevated transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} style={{ color: muted }} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {filteredCompanies.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: lightMuted }}>
              Showing {filteredCompanies.length} of {companies.length} companies
            </p>
            <div className="flex gap-2">
              <button className="p-1 border rounded bg-corthex-surface transition-colors disabled:opacity-50" style={{ borderColor: sand }} disabled>
                <ChevronLeft size={18} style={{ color: lightMuted }} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-white font-bold text-xs" style={{ backgroundColor: olive }}>1</button>
              <button className="p-1 border rounded bg-corthex-surface transition-colors" style={{ borderColor: sand }}>
                <ChevronRight size={18} style={{ color: lightMuted }} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-xs gap-4" style={{ color: lightMuted }}>
          <p>&copy; 2024 CORTHEX Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <span>System Status: <span style={{ color: olive }}>Healthy</span></span>
            <span>API v2.4.1</span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.name}`}
        description="이 회사를 삭제하면 소속 직원의 로그인이 차단됩니다. 이 작업은 되돌릴 수 없습니다."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  )
}
