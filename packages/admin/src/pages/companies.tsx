import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useToastStore } from '../stores/toast-store'
import { ConfirmDialog, SkeletonCard } from '@corthex/ui'

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
  const [deactivateTarget, setDeactivateTarget] = useState<Company | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<{ data: Company[] }>('/admin/companies'),
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
      addToast({ type: 'success', message: '회사가 생성되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; slug?: string }) =>
      api.patch(`/admin/companies/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      setEditId(null)
      addToast({ type: 'success', message: '회사가 수정되었습니다' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/companies/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['companies'] })
      qc.invalidateQueries({ queryKey: ['companies-stats'] })
      setDeactivateTarget(null)
      addToast({ type: 'success', message: '회사가 비활성화되었습니다' })
    },
    onError: (err: Error) => {
      setDeactivateTarget(null)
      addToast({ type: 'error', message: err.message })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">회사 관리</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {filteredCompanies.length === companies.length
              ? `${companies.length}개 회사`
              : `${filteredCompanies.length} / ${companies.length}개 회사`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 회사 추가
        </button>
      </div>

      {/* 검색 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="회사명 또는 슬러그로 검색..."
        className="w-full max-w-md px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      {showCreate && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">새 회사</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              createMutation.mutate(form)
            }}
            className="grid grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">회사명</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-1">슬러그</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="영문, 숫자, 하이픈만"
                required
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-zinc-600">
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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((c) => {
            const s = stats[c.id] || { userCount: 0, agentCount: 0 }
            return (
              <div
                key={c.id}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
              >
                {editId === c.id ? (
                  <div className="flex items-center gap-4">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100"
                    />
                    <button
                      onClick={() => updateMutation.mutate({ id: c.id, name: editForm.name })}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      저장
                    </button>
                    <button onClick={() => setEditId(null)} className="text-sm text-zinc-500">
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{c.name}</h3>
                      <p className="text-sm text-zinc-500">slug: {c.slug}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-zinc-500">
                          직원 {s.userCount}명
                        </span>
                        <span className="text-xs text-zinc-500">
                          에이전트 {s.agentCount}개
                        </span>
                        <span className="text-xs text-zinc-400">
                          생성: {new Date(c.createdAt).toLocaleDateString('ko')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          c.isActive
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {c.isActive ? '활성' : '비활성'}
                      </span>
                      <button
                        onClick={() => {
                          setEditId(c.id)
                          setEditForm({ name: c.name, slug: c.slug })
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        수정
                      </button>
                      {c.isActive && (
                        <button
                          onClick={() => setDeactivateTarget(c)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          비활성화
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onConfirm={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
        onCancel={() => setDeactivateTarget(null)}
        title={`${deactivateTarget?.name} 비활성화`}
        description="이 회사를 비활성화하면 소속 직원은 로그인할 수 없습니다. 활성 직원이 있으면 먼저 비활성화해야 합니다."
        confirmText="비활성화"
        variant="danger"
      />
    </div>
  )
}
