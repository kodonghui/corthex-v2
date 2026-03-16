// API Endpoints:
// GET    /admin/tier-configs
// POST   /admin/tier-configs
// PATCH  /admin/tier-configs/:id
// DELETE /admin/tier-configs/:id
// PUT    /admin/tier-configs/reorder

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Modal, ConfirmDialog, Button, Input, Textarea, Skeleton, EmptyState, Badge, toast } from '@corthex/ui'

// ── Types ──

type TierConfig = {
  id: string
  companyId: string
  tierLevel: number
  name: string
  modelPreference: string
  maxTools: number
  description: string | null
  createdAt: string
  updatedAt: string
}

type TierFormData = {
  name: string
  modelPreference: string
  maxTools: number
  description: string
}

const MODEL_OPTIONS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (최고 성능)', shortLabel: 'Opus', inputCost: '$15.00', outputCost: '$75.00' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (균형)', shortLabel: 'Sonnet', inputCost: '$3.00', outputCost: '$15.00' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (경제적)', shortLabel: 'Haiku', inputCost: '$0.25', outputCost: '$1.25' },
]

const TIER_BADGE_STYLES: Record<number, { bg: string; label: string }> = {
  0: { bg: '#e2b042', label: 'Manager' },
  1: { bg: '#5a7247', label: 'Specialist' },
  2: { bg: '#64748b', label: 'Worker' },
}

// ── Tier Form ──

function TierForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  initialData?: TierFormData
  onSubmit: (data: TierFormData) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [modelPreference, setModelPreference] = useState(initialData?.modelPreference ?? 'claude-haiku-4-5')
  const [maxTools, setMaxTools] = useState(initialData?.maxTools ?? 10)
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [nameError, setNameError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('계층명을 입력하세요')
      return
    }
    if (trimmedName.length > 100) {
      setNameError('계층명은 100자 이내로 입력하세요')
      return
    }
    setNameError('')
    onSubmit({
      name: trimmedName,
      modelPreference,
      maxTools,
      description: description.trim(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          계층명 <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError('') }}
          placeholder="예: 팀장, 사원, 인턴"
          maxLength={100}
          autoFocus
        />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          AI 모델
        </label>
        <select
          value={modelPreference}
          onChange={(e) => setModelPreference(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          최대 도구 수 <span className="text-slate-500">(0 = 무제한)</span>
        </label>
        <Input
          type="number"
          value={maxTools}
          onChange={(e) => setMaxTools(Math.max(0, parseInt(e.target.value) || 0))}
          min={0}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          설명
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="계층 설명 (선택)"
          rows={2}
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

// ── Main Page ──

export function TiersPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editTier, setEditTier] = useState<TierConfig | null>(null)
  const [deleteTier, setDeleteTier] = useState<TierConfig | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch tier configs
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-tier-configs'],
    queryFn: () => api.get<{ success: boolean; data: TierConfig[] }>('/admin/tier-configs'),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: Omit<TierFormData, 'description'> & { description: string }) =>
      api.post('/admin/tier-configs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tier-configs'] })
      setCreateOpen(false)
      toast.success('계층이 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TierFormData> }) =>
      api.patch(`/admin/tier-configs/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tier-configs'] })
      setEditTier(null)
      toast.success('계층이 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/tier-configs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tier-configs'] })
      setDeleteTier(null)
      toast.success('계층이 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => api.put('/admin/tier-configs/reorder', { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tier-configs'] })
      toast.success('순서가 변경되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const tiers = data?.data ?? []

  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const order = tiers.map(t => t.id)
    ;[order[index - 1], order[index]] = [order[index], order[index - 1]]
    reorderMutation.mutate(order)
  }

  const handleMoveDown = (index: number) => {
    if (index >= tiers.length - 1) return
    const order = tiers.map(t => t.id)
    ;[order[index], order[index + 1]] = [order[index + 1], order[index]]
    reorderMutation.mutate(order)
  }

  const getModelShortLabel = (model: string) => {
    const opt = MODEL_OPTIONS.find(o => o.value === model)
    return opt ? opt.shortLabel : model
  }

  const getModelLabel = (model: string) => {
    const opt = MODEL_OPTIONS.find(o => o.value === model)
    return opt ? opt.label : model
  }

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="tiers-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div data-testid="tiers-page" style={{ backgroundColor: '#faf8f5' }} className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 md:px-20 py-10">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-sm text-red-600">계층 목록을 불러올 수 없습니다</p>
            <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getTierBadge = (index: number) => {
    const style = TIER_BADGE_STYLES[Math.min(index, 2)]
    return style
  }

  return (
    <div data-testid="tiers-page" className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden" style={{ backgroundColor: '#faf8f5', fontFamily: "'Public Sans', sans-serif" }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Top Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid px-6 md:px-20 py-4" style={{ borderColor: 'rgba(90,114,71,0.1)', backgroundColor: '#faf8f5' }}>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3" style={{ color: '#5a7247' }}>
              <span className="material-symbols-outlined text-3xl font-bold">account_tree</span>
              <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-tight uppercase">CORTHEX <span style={{ color: 'rgba(90,114,71,0.7)' }}>v2</span></h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-slate-600 hover:transition-colors text-sm font-medium" href="#" style={{ color: '#5a7247' }}>Dashboard</a>
              <a className="text-slate-600 hover:transition-colors text-sm font-medium" href="#">Workspace</a>
              <a className="text-sm font-semibold border-b-2 pb-1" href="#" style={{ color: '#5a7247', borderColor: '#5a7247' }}>Tiers</a>
              <a className="text-slate-600 hover:transition-colors text-sm font-medium" href="#">Settings</a>
            </nav>
          </div>
          <div className="flex flex-1 justify-end gap-6 items-center">
            <label className="hidden sm:flex flex-col min-w-40 h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full border bg-white" style={{ borderColor: 'rgba(90,114,71,0.2)' }}>
                <div className="flex items-center justify-center pl-3" style={{ color: 'rgba(90,114,71,0.5)' }}>
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent text-sm placeholder:text-slate-400 focus:ring-0"
                  placeholder="Search tiers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </label>
            <div className="rounded-full p-1 border" style={{ backgroundColor: 'rgba(90,114,71,0.1)', borderColor: 'rgba(90,114,71,0.2)' }}>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 bg-slate-300" />
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 md:px-20 py-10 max-w-7xl mx-auto w-full">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-10">
            <div className="flex flex-col gap-2">
              <nav className="flex items-center gap-2 text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: 'rgba(90,114,71,0.6)' }}>
                <span>Workspace</span>
                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                <span>Management</span>
              </nav>
              <h1 className="text-slate-900 text-4xl font-extrabold tracking-tight">Tier Permissions</h1>
              <p className="text-slate-500 text-lg max-w-xl">Configure dynamic N-tier governance models, preferred LLM routing, and tool access limits across your organization.</p>
            </div>
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all"
              style={{ backgroundColor: '#5a7247', boxShadow: '0 10px 15px -3px rgba(90,114,71,0.2)' }}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>New Tier</span>
            </button>
          </div>

          {/* Dashboard Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl bg-white border shadow-sm flex items-center gap-4" style={{ borderColor: 'rgba(90,114,71,0.1)' }}>
              <div className="size-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#5a7247' }}>
                <span className="material-symbols-outlined">groups</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Tiers</p>
                <p className="text-2xl font-bold">{String(tiers.length).padStart(2, '0')}</p>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white border shadow-sm flex items-center gap-4" style={{ borderColor: 'rgba(90,114,71,0.1)' }}>
              <div className="size-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Avg. Model Power</p>
                <p className="text-2xl font-bold">High</p>
              </div>
            </div>
            <div className="p-6 rounded-xl bg-white border shadow-sm flex items-center gap-4" style={{ borderColor: 'rgba(90,114,71,0.1)' }}>
              <div className="size-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined">build</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Tools Deployed</p>
                <p className="text-2xl font-bold">{tiers.reduce((sum, t) => sum + (t.maxTools || 0), 0) || 42}</p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          {tiers.length === 0 && (
            <EmptyState
              title="계층이 없습니다"
              description="첫 계층을 생성하여 에이전트 등급을 구성하세요"
            />
          )}

          {/* Tiers Table Container */}
          {tiers.length > 0 && (
            <div className="bg-white rounded-xl border shadow-xl overflow-hidden" style={{ borderColor: 'rgba(90,114,71,0.1)' }}>
              <div className="p-5 border-b flex justify-between items-center" style={{ borderColor: 'rgba(90,114,71,0.1)', backgroundColor: 'rgba(248,250,252,0.5)' }}>
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ color: '#5a7247' }}>list_alt</span>
                  Active Configuration
                </h3>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border hover:opacity-80" style={{ borderColor: 'rgba(90,114,71,0.2)', color: '#5a7247' }}>
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                  </button>
                  <button onClick={() => refetch()} className="p-2 rounded-lg border hover:opacity-80" style={{ borderColor: 'rgba(90,114,71,0.2)', color: '#5a7247' }}>
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-xs font-bold uppercase tracking-widest bg-slate-50">
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Tier Identity</th>
                      <th className="px-6 py-4">Preferred Model</th>
                      <th className="px-6 py-4">Tool Quota</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ divideColor: 'rgba(90,114,71,0.05)' }}>
                    {tiers.map((tier, index) => {
                      const badge = getTierBadge(index)
                      return (
                        <tr key={tier.id} data-testid={`tier-row-${tier.id}`} className="transition-colors" style={{ cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(90,114,71,0.02)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td className="px-6 py-5">
                            <span className="text-lg font-black" style={{ color: 'rgba(90,114,71,0.3)' }}>{String(tier.tierLevel).padStart(2, '0')}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span
                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-1 shadow-sm text-white"
                                style={{ backgroundColor: badge.bg }}
                              >
                                {badge.label}
                              </span>
                              <span className="text-sm font-semibold">{tier.name}</span>
                              {tier.description && <span className="text-xs text-slate-400">{tier.description}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="size-6 rounded bg-slate-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-sm text-slate-500">neurology</span>
                              </div>
                              <span className="font-medium text-slate-700">{getModelShortLabel(tier.modelPreference)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {tier.maxTools === 0 ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Unlimited</span>
                            ) : (
                              <span className="text-sm font-bold text-slate-600">{tier.maxTools} Tools</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0 || reorderMutation.isPending}
                                className="px-1 py-0.5 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === tiers.length - 1 || reorderMutation.isPending}
                                className="px-1 py-0.5 text-xs text-slate-400 hover:text-slate-600 disabled:opacity-30"
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => setEditTier(tier)}
                                className="text-slate-400 hover:transition-colors px-2 py-1 text-xs rounded hover:bg-slate-100"
                                style={{ ['--tw-text-opacity' as string]: 1 }}
                              >
                                편집
                              </button>
                              <button
                                onClick={() => setDeleteTier(tier)}
                                className="text-red-400 hover:text-red-500 px-2 py-1 text-xs rounded hover:bg-red-50"
                              >
                                삭제
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-4 flex justify-between items-center text-xs text-slate-500" style={{ backgroundColor: 'rgba(248,250,252,0.5)' }}>
                <p>Endpoint: <code className="px-1 rounded" style={{ backgroundColor: 'rgba(90,114,71,0.05)' }}>GET /api/admin/tier-configs</code></p>
                <p>Last updated: just now</p>
              </div>
            </div>
          )}

          {/* Help/Details Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="size-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#5a7247' }}>
                <span className="material-symbols-outlined">security</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">Permission Propagation</h4>
                <p className="text-sm text-slate-500">Higher tiers automatically inherit lower tier capabilities but can be configured with specific override restrictions per workspace.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="size-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(90,114,71,0.1)', color: '#5a7247' }}>
                <span className="material-symbols-outlined">settings_suggest</span>
              </div>
              <div>
                <h4 className="font-bold mb-1">Model Preference Logic</h4>
                <p className="text-sm text-slate-500">Models are prioritized based on reasoning capability and speed metrics. Tiers can specify fallback models for high-traffic periods.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 md:px-20 py-8 border-t mt-20" style={{ borderColor: 'rgba(90,114,71,0.1)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">copyright</span>
              <span>2024 CORTHEX Dynamics</span>
            </div>
            <div className="flex gap-6">
              <a className="hover:opacity-80" href="#" style={{ color: '#5a7247' }}>API Documentation</a>
              <a className="hover:opacity-80" href="#" style={{ color: '#5a7247' }}>System Status</a>
              <a className="hover:opacity-80" href="#" style={{ color: '#5a7247' }}>Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="계층 생성">
        <TierForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setCreateOpen(false)}
          isSubmitting={createMutation.isPending}
          submitLabel="생성"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTier} onClose={() => setEditTier(null)} title="계층 편집">
        {editTier && (
          <TierForm
            initialData={{
              name: editTier.name,
              modelPreference: editTier.modelPreference,
              maxTools: editTier.maxTools,
              description: editTier.description ?? '',
            }}
            onSubmit={(data) => updateMutation.mutate({ id: editTier.id, body: data })}
            onCancel={() => setEditTier(null)}
            isSubmitting={updateMutation.isPending}
            submitLabel="저장"
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTier}
        onCancel={() => setDeleteTier(null)}
        onConfirm={() => deleteTier && deleteMutation.mutate(deleteTier.id)}
        title={`"${deleteTier?.name}" 계층 삭제`}
        description="이 계층을 삭제하시겠습니까? 사용 중인 에이전트가 있으면 삭제할 수 없습니다."
        confirmText={deleteMutation.isPending ? '삭제 중...' : '삭제'}
        variant="danger"
      />
    </div>
  )
}
