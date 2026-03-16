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

const TIER_ICONS = ['👑', '🏷️', '⚙️'] // crown for top, tag for mid, gear for worker

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
      <div data-testid="tiers-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400">계층 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="tiers-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-50">계층 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tiers.length}개 계층 (N-Tier 동적 관리)
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          + 계층 추가
        </Button>
      </div>

      {/* Empty state */}
      {tiers.length === 0 && (
        <EmptyState
          title="계층이 없습니다"
          description="첫 계층을 생성하여 에이전트 등급을 구성하세요"
        />
      )}

      {/* Tier hierarchy cards (mobile) with connector lines */}
      {tiers.length > 0 && (
        <div className="md:hidden flex flex-col items-center gap-0">
          {tiers.map((tier, index) => {
            const isFirst = index === 0
            const icon = TIER_ICONS[Math.min(index, TIER_ICONS.length - 1)]
            return (
              <div key={tier.id} className="w-full flex flex-col items-center">
                {/* Connector line between cards */}
                {index > 0 && (
                  <div className="w-px h-6 bg-slate-700 my-[-0.25rem] relative z-0" />
                )}
                {/* Tier label for first card */}
                {isFirst && (
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Top-Level Authority</div>
                )}
                <div
                  data-testid={`tier-row-${tier.id}`}
                  className={`w-full rounded-xl p-5 flex flex-col gap-3 relative z-10 ${
                    isFirst
                      ? 'bg-slate-800/80 border-2 border-cyan-400 shadow-lg'
                      : 'bg-slate-800/80 border border-slate-700 shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        isFirst ? 'bg-cyan-400/20' : 'bg-slate-700'
                      }`}>
                        {icon}
                      </div>
                      <div>
                        <h2 className={`font-bold ${isFirst ? 'text-lg' : 'text-base'}`}>T{tier.tierLevel}: {tier.name}</h2>
                        {tier.description && (
                          <p className="text-xs text-slate-400">{tier.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditTier(tier)}
                        className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        편집
                      </button>
                    </div>
                  </div>
                  {/* Model info card */}
                  <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-700 font-mono text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Model:</span>
                      <span className={isFirst ? 'text-cyan-400 font-medium' : 'text-slate-200'}>{getModelLabel(tier.modelPreference).split(' (')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">도구 제한:</span>
                      <span>{tier.maxTools === 0 ? '무제한' : `${tier.maxTools}개`}</span>
                    </div>
                  </div>
                  {/* Reorder + delete row */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || reorderMutation.isPending}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-400 disabled:opacity-30 border border-slate-700 rounded"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === tiers.length - 1 || reorderMutation.isPending}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-400 disabled:opacity-30 border border-slate-700 rounded"
                      >
                        ▼
                      </button>
                    </div>
                    <button
                      onClick={() => setDeleteTier(tier)}
                      className="px-2 py-1 text-xs text-red-500 hover:bg-red-900/20 rounded transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add tier placeholder button (mobile) */}
          <div className="w-px h-6 bg-slate-700 my-[-0.25rem]" />
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full border-2 border-dashed border-slate-700 hover:border-cyan-400 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <span className="text-xl">+</span>
            <span className="text-sm font-medium">새 티어 추가</span>
          </button>
        </div>
      )}

      {/* Tier list — desktop (ordered by tierLevel) */}
      {tiers.length > 0 && (
        <div className="hidden md:block space-y-2">
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              data-testid={`tier-row-${tier.id}`}
              className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || reorderMutation.isPending}
                    className="px-1 py-0.5 text-xs text-slate-500 hover:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="위로 이동"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === tiers.length - 1 || reorderMutation.isPending}
                    className="px-1 py-0.5 text-xs text-slate-500 hover:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="아래로 이동"
                  >
                    ▼
                  </button>
                </div>

                {/* Tier info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Lv.{tier.tierLevel}</Badge>
                    <h3 className="text-sm font-medium text-slate-50 truncate">{tier.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">{getModelLabel(tier.modelPreference)}</span>
                    <span className="text-xs text-slate-500">
                      도구: {tier.maxTools === 0 ? '무제한' : `${tier.maxTools}개`}
                    </span>
                  </div>
                  {tier.description && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{tier.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button
                  onClick={() => setEditTier(tier)}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-800 rounded-lg transition-colors"
                  aria-label={`${tier.name} 편집`}
                >
                  편집
                </button>
                <button
                  onClick={() => setDeleteTier(tier)}
                  className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label={`${tier.name} 삭제`}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Model Cost Summary (mobile) */}
      {tiers.length > 0 && (
        <div className="md:hidden bg-slate-800/80 border border-slate-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-slate-50">
            <span className="text-cyan-400">💰</span>
            Model Cost Summary (per 1M tokens)
          </h3>
          <div className="font-mono text-xs w-full">
            <div className="grid grid-cols-3 gap-2 py-2 border-b border-slate-700 text-slate-400">
              <div>Model</div>
              <div className="text-right">Input</div>
              <div className="text-right">Output</div>
            </div>
            {MODEL_OPTIONS.map((opt, i) => (
              <div key={opt.value} className={`grid grid-cols-3 gap-2 py-2 ${i < MODEL_OPTIONS.length - 1 ? 'border-b border-slate-700' : ''}`}>
                <div className={`truncate ${i === 0 ? 'text-cyan-400' : 'text-slate-200'}`}>{opt.shortLabel}</div>
                <div className="text-right text-slate-200">{opt.inputCost}</div>
                <div className="text-right text-slate-200">{opt.outputCost}</div>
              </div>
            ))}
          </div>
        </div>
      )}

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
