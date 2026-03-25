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
          className="w-full px-3 py-2 text-sm bg-corthex-surface border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div data-testid="tiers-page" className="flex-1 p-8 bg-corthex-bg">
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600">계층 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 hover:opacity-70 underline mt-2">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const getTierBadge = (index: number) => {
    const style = TIER_BADGE_STYLES[Math.min(index, 2)]
    return style
  }

  return (
    <div data-testid="tiers-page" className="flex-1 bg-corthex-bg overflow-y-auto">
      <div className="p-8 max-w-[1440px] mx-auto min-h-screen">
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-[2.75rem] font-extrabold tracking-tighter leading-tight text-corthex-text-primary">
              계급 관리 <span className="text-corthex-text-secondary font-medium">Tier Management</span>
            </h1>
            <p className="text-lg text-corthex-text-secondary font-medium">에이전트 계층 구조를 정의하고 관리합니다</p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-corthex-accent hover:bg-corthex-accent-deep text-white px-6 h-11 rounded-lg flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">계급 생성 Create Tier</span>
          </button>
        </header>

        {/* Empty state */}
        {tiers.length === 0 && (
          <EmptyState
            title="계층이 없습니다"
            description="첫 계층을 생성하여 에이전트 등급을 구성하세요"
          />
        )}

        {/* MAIN TABLE SECTION */}
        {tiers.length > 0 && (
          <div className="bg-corthex-elevated rounded-xl overflow-hidden shadow-sm border border-corthex-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-corthex-border/50">
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">계급명 Tier Name</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary text-center">레벨 Level</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">최대 도구 Max Tools</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">AI 모델 Model</th>
                    <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary text-right">작업 Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-corthex-border/30">
                  {tiers.map((tier, index) => {
                    const badge = getTierBadge(index)
                    const levelColor = TIER_LEVEL_COLORS[Math.min(index, TIER_LEVEL_COLORS.length - 1)]
                    return (
                      <tr key={tier.id} data-testid={`tier-row-${tier.id}`} className="hover:bg-corthex-elevated transition-colors group">
                        <td className="px-6 py-5 relative">
                          <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full" style={{ backgroundColor: levelColor }} />
                          <div className="flex flex-col">
                            <span className="font-bold text-corthex-text-primary">{tier.name}</span>
                            {tier.description && <span className="text-xs text-corthex-text-secondary">{tier.description}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>
                            <Shield className="w-3.5 h-3.5" />
                            <span className="font-mono font-bold">{tier.tierLevel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {tier.maxTools === 0 ? (
                            <span className="font-mono text-corthex-text-secondary">Unlimited</span>
                          ) : (
                            <span className="font-mono text-corthex-text-secondary">{tier.maxTools} tools</span>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-corthex-border text-corthex-text-primary rounded-full text-xs font-semibold">
                            {getModelShortLabel(tier.modelPreference)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-4">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0 || reorderMutation.isPending}
                              className="text-xs text-corthex-text-secondary hover:text-corthex-accent-deep disabled:opacity-30 transition-colors"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === tiers.length - 1 || reorderMutation.isPending}
                              className="text-xs text-corthex-text-secondary hover:text-corthex-accent-deep disabled:opacity-30 transition-colors"
                            >
                              ▼
                            </button>
                            <button
                              onClick={() => setEditTier(tier)}
                              className="text-xs font-bold text-corthex-text-secondary hover:text-corthex-accent transition-colors"
                            >
                              수정 Edit
                            </button>
                            <button
                              onClick={() => setDeleteTier(tier)}
                              className="text-xs font-bold text-red-600 hover:opacity-70 transition-colors"
                            >
                              삭제 Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUMMARY SECTION */}
        <footer className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-corthex-elevated p-6 rounded-xl border border-corthex-border/50 flex items-center justify-between group hover:bg-corthex-elevated transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">총 계급 수 Total Tiers</p>
              <p className="text-2xl font-black text-corthex-accent">{tiers.length}개</p>
            </div>
            <GitBranch className="w-9 h-9 text-corthex-border" />
          </div>
          <div className="bg-corthex-elevated p-6 rounded-xl border border-corthex-border/50 flex items-center justify-between group hover:bg-corthex-elevated transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">총 도구 할당 Total Tools</p>
              <p className="text-2xl font-black text-corthex-accent">{tiers.reduce((sum, t) => sum + (t.maxTools || 0), 0)}</p>
            </div>
            <Users className="w-9 h-9 text-corthex-border" />
          </div>
          <div className="bg-corthex-elevated p-6 rounded-xl border border-corthex-border/50 flex items-center justify-between group hover:bg-corthex-elevated transition-colors">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">평균 모델 수준</p>
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
