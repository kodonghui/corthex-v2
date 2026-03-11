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
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6 (최고 성능)' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (균형)' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (경제적)' },
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
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
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
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          AI 모델
        </label>
        <select
          value={modelPreference}
          onChange={(e) => setModelPreference(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
          최대 도구 수 <span className="text-zinc-400">(0 = 무제한)</span>
        </label>
        <Input
          type="number"
          value={maxTools}
          onChange={(e) => setMaxTools(Math.max(0, parseInt(e.target.value) || 0))}
          min={0}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">계층 목록을 불러올 수 없습니다</p>
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
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">계층 관리</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
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

      {/* Tier list — ordered by tierLevel */}
      {tiers.length > 0 && (
        <div className="space-y-2">
          {tiers.map((tier, index) => (
            <div
              key={tier.id}
              data-testid={`tier-row-${tier.id}`}
              className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || reorderMutation.isPending}
                    className="px-1 py-0.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="위로 이동"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === tiers.length - 1 || reorderMutation.isPending}
                    className="px-1 py-0.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="아래로 이동"
                  >
                    ▼
                  </button>
                </div>

                {/* Tier info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Lv.{tier.tierLevel}</Badge>
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{tier.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{getModelLabel(tier.modelPreference)}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      도구: {tier.maxTools === 0 ? '무제한' : `${tier.maxTools}개`}
                    </span>
                  </div>
                  {tier.description && (
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{tier.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button
                  onClick={() => setEditTier(tier)}
                  className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  aria-label={`${tier.name} 편집`}
                >
                  편집
                </button>
                <button
                  onClick={() => setDeleteTier(tier)}
                  className="px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label={`${tier.name} 삭제`}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
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
