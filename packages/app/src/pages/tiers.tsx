// API Endpoints:
// GET    /admin/tier-configs
// POST   /admin/tier-configs
// PATCH  /admin/tier-configs/:id
// DELETE /admin/tier-configs/:id
// PUT    /admin/tier-configs/reorder

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Modal, ConfirmDialog, Button, Input, Textarea, Skeleton, EmptyState, toast } from '@corthex/ui'
import { GitBranch, Plus, Users, Brain, Shield } from 'lucide-react'

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
  0: { bg: 'var(--color-corthex-accent-deep)', label: 'Manager' },
  1: { bg: 'var(--color-corthex-accent)', label: 'Specialist' },
  2: { bg: 'var(--color-corthex-text-secondary)', label: 'Worker' },
}

const TIER_LEVEL_COLORS: string[] = [
  'var(--color-corthex-accent-deep)', 'var(--color-corthex-accent)', 'var(--color-corthex-text-secondary)', '#908a78', 'var(--color-corthex-border)', 'var(--color-corthex-elevated)',
]

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
        <label className="block text-xs font-medium text-stone-500 mb-1">
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
        <label className="block text-xs font-medium text-stone-500 mb-1">
          AI 모델
        </label>
        <select
          value={modelPreference}
          onChange={(e) => setModelPreference(e.target.value)}
          className="w-full px-3 py-2 text-base sm:text-sm bg-corthex-surface border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
          최대 도구 수 <span className="text-stone-400">(0 = 무제한)</span>
        </label>
        <Input
          type="number"
          value={maxTools}
          onChange={(e) => setMaxTools(Math.max(0, parseInt(e.target.value) || 0))}
          min={0}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-1">
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
    queryKey: ['workspace-tier-configs'],
    queryFn: () => api.get<{ success: boolean; data: TierConfig[] }>('/workspace/tier-configs'),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: Omit<TierFormData, 'description'> & { description: string }) =>
      api.post('/workspace/tier-configs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tier-configs'] })
      setCreateOpen(false)
      toast.success('계층이 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<TierFormData> }) =>
      api.patch(`/workspace/tier-configs/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tier-configs'] })
      setEditTier(null)
      toast.success('계층이 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/tier-configs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tier-configs'] })
      setDeleteTier(null)
      toast.success('계층이 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (order: string[]) => api.put('/workspace/tier-configs/reorder', { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-tier-configs'] })
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
      <div data-testid="tiers-page" className="flex-1 p-8 bg-corthex-bg space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div data-testid="tiers-page" className="flex-1 p-8 bg-corthex-bg">
        <div className="bg-corthex-error/10 border border-corthex-error/20 rounded-xl p-6 text-center">
          <p className="text-sm text-corthex-error">계층 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-corthex-error hover:opacity-70 underline mt-2">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="tiers-page" className="flex-1 bg-corthex-bg overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-2 text-corthex-text-primary">Tiers Hierarchy</h1>
            <p className="text-corthex-text-secondary text-sm">Define and manage hierarchical permission structures and model assignments for agents.</p>
          </div>
          <button
            data-testid="create-tier-btn"
            onClick={() => setCreateOpen(true)}
            className="bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-bg px-4 py-2 min-h-[44px] rounded-lg font-medium flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create Tier</span>
          </button>
        </div>

        {/* Empty state */}
        {tiers.length === 0 && (
          <EmptyState
            title="계층이 없습니다"
            description="첫 계층을 생성하여 에이전트 등급을 구성하세요"
          />
        )}

        {/* VERTICAL TIER STACK */}
        {tiers.length > 0 && (
          <div className="flex flex-col items-center">
            {tiers.map((tier, index) => {
              const levelColor = TIER_LEVEL_COLORS[Math.min(index, TIER_LEVEL_COLORS.length - 1)]
              return (
                <div key={tier.id} className="w-full" data-testid={`tier-row-${tier.id}`}>
                  {/* Tier Card */}
                  <div className="bg-corthex-surface border border-corthex-border rounded-xl p-4 sm:p-6 transition-all duration-200 hover:border-corthex-accent/50 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: levelColor }} />
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-3 sm:gap-5">
                        {/* Level badge */}
                        <div className="bg-corthex-elevated border border-corthex-border rounded-lg p-3 text-center min-w-[64px]" style={{ backgroundColor: index === 0 ? `${levelColor}19` : undefined, borderColor: index === 0 ? `${levelColor}33` : undefined }}>
                          <div className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: index === 0 ? levelColor : undefined, opacity: index === 0 ? 1 : 0.6 }}>LEVEL</div>
                          <div className="text-2xl font-mono font-bold text-corthex-text-primary">L{tier.tierLevel}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-lg sm:text-xl font-bold text-corthex-text-primary">{tier.name}</h2>
                            {index === 0 && (
                              <span className="bg-corthex-success/10 text-corthex-success text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-corthex-success/20">Active Authority</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mb-2">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-corthex-elevated rounded border border-corthex-border">
                              <Brain className="w-3 h-3 text-corthex-accent" />
                              <span className="text-xs font-mono font-medium text-corthex-text-secondary">{getModelLabel(tier.modelPreference)}</span>
                            </div>
                            {tier.description && (
                              <span className="text-xs text-corthex-text-secondary">{tier.description}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-corthex-elevated rounded transition-colors text-corthex-text-secondary hover:text-corthex-text-primary disabled:opacity-30 text-xs"
                          title="Move up"
                        >▲</button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === tiers.length - 1 || reorderMutation.isPending}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-corthex-elevated rounded transition-colors text-corthex-text-secondary hover:text-corthex-text-primary disabled:opacity-30 text-xs"
                          title="Move down"
                        >▼</button>
                        <button
                          onClick={() => setEditTier(tier)}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-corthex-elevated rounded transition-colors text-corthex-text-secondary hover:text-corthex-text-primary"
                          title="Edit"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTier(tier)}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-corthex-error/10 rounded transition-colors text-corthex-text-secondary hover:text-corthex-error"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                        </button>
                      </div>
                    </div>
                    {/* Metrics row */}
                    <div className="mt-4 pt-4 border-t border-corthex-border/30 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                      <div>
                        <div className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest mb-1 font-mono">MAX TOOLS</div>
                        <div className="text-sm font-mono font-bold text-corthex-text-primary">
                          {tier.maxTools === 0 ? 'Unlimited' : `${tier.maxTools} tools`}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest mb-1 font-mono">AI MODEL</div>
                        <div className="text-sm font-mono font-bold text-corthex-text-primary">{getModelShortLabel(tier.modelPreference)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-corthex-text-disabled uppercase tracking-widest mb-1 font-mono">TIER LEVEL</div>
                        <div className="text-sm font-mono font-bold" style={{ color: levelColor }}>Level {tier.tierLevel}</div>
                      </div>
                    </div>
                  </div>
                  {/* Flow connector */}
                  {index < tiers.length - 1 && (
                    <div className="flex flex-col items-center">
                      <div className="w-0.5 h-10" style={{ background: `linear-gradient(to bottom, ${levelColor}, transparent)` }} />
                      <svg className="w-4 h-4 text-corthex-accent" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16l-6-6h12l-6 6z" /></svg>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add Tier Placeholder */}
            <div
              onClick={() => setCreateOpen(true)}
              className="mt-6 w-full flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-corthex-border rounded-xl group hover:border-corthex-accent/40 transition-colors cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-corthex-elevated flex items-center justify-center mb-4 group-hover:bg-corthex-accent/10 transition-colors">
                <Plus className="w-5 h-5 text-corthex-text-disabled group-hover:text-corthex-accent" />
              </div>
              <h3 className="text-sm font-bold text-corthex-text-secondary group-hover:text-corthex-text-primary">Append Hierarchy Level</h3>
              <p className="text-xs text-corthex-text-disabled mt-1">L{tiers.length + 1} Custom Operations</p>
            </div>
          </div>
        )}

        {/* SUMMARY SECTION */}
        <footer className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="bg-corthex-elevated p-4 sm:p-6 rounded-xl border border-corthex-border/50 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">Total Tiers</p>
              <p className="text-2xl font-black text-corthex-accent">{tiers.length}</p>
            </div>
            <GitBranch className="w-9 h-9 text-corthex-border" />
          </div>
          <div className="bg-corthex-elevated p-4 sm:p-6 rounded-xl border border-corthex-border/50 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">Total Tools</p>
              <p className="text-2xl font-black text-corthex-accent">{tiers.reduce((sum, t) => sum + (t.maxTools || 0), 0)}</p>
            </div>
            <Users className="w-9 h-9 text-corthex-border" />
          </div>
          <div className="bg-corthex-elevated p-4 sm:p-6 rounded-xl border border-corthex-border/50 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">Avg Model</p>
              <p className="text-2xl font-black text-corthex-accent font-mono">
                {tiers.length > 0 ? getModelShortLabel(tiers[Math.floor(tiers.length / 2)]?.modelPreference || '') : '--'}
              </p>
            </div>
            <Brain className="w-9 h-9 text-corthex-border" />
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
