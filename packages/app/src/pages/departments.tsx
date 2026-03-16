import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Modal, ConfirmDialog, Button, Input, Textarea, Skeleton, EmptyState, Badge, toast } from '@corthex/ui'

// ── Types ──

type Department = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  companyId: string
  createdAt: string
  updatedAt: string
}

type CascadeAgentBreakdown = {
  id: string
  name: string
  tier: string
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
  agentBreakdown: CascadeAgentBreakdown[]
}

type DeptFormData = {
  name: string
  description: string
}

// ── Department Form (shared between create & edit) ──

function DepartmentForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
}: {
  initialData?: DeptFormData
  onSubmit: (data: DeptFormData) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [nameError, setNameError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setNameError('부서명을 입력하세요')
      return
    }
    if (trimmedName.length > 100) {
      setNameError('부서명은 100자 이내로 입력하세요')
      return
    }
    setNameError('')
    onSubmit({ name: trimmedName, description: description.trim() || '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          부서명 <span className="text-red-500">*</span>
        </label>
        <Input
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError('') }}
          placeholder="예: 마케팅부"
          maxLength={100}
          autoFocus
        />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          설명
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="부서 설명 (선택)"
          rows={3}
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

// ── Cascade Analysis Panel ──

function CascadePanel({
  analysis,
  isLoading,
  onForceDelete,
  onCancel,
  isDeleting,
}: {
  analysis: CascadeAnalysis | null
  isLoading: boolean
  onForceDelete: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="space-y-4">
      <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
        <p className="text-sm font-medium text-amber-300 mb-2">
          삭제 영향 분석
        </p>
        <div className="space-y-1 text-xs text-amber-400">
          <p>소속 에이전트: <strong>{analysis.agentCount}명</strong> (미할당으로 전환됨)</p>
          <p>진행 중 작업: <strong>{analysis.activeTaskCount}건</strong></p>
          <p>부서 지식: <strong>{analysis.knowledgeCount}건</strong></p>
        </div>
      </div>

      {analysis.agentBreakdown.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-slate-500 mb-1">영향 받는 에이전트</p>
          <div className="space-y-1">
            {analysis.agentBreakdown.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between text-xs px-2 py-1 bg-slate-800 rounded">
                <span className="text-slate-400">{agent.name}</span>
                <Badge variant="default">{agent.tier}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
          취소
        </Button>
        <Button variant="destructive" size="sm" onClick={onForceDelete} disabled={isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제 확인'}
        </Button>
      </div>
    </div>
  )
}

// ── Main Page ──

export function DepartmentsPage() {
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [editDept, setEditDept] = useState<Department | null>(null)
  const [deleteDept, setDeleteDept] = useState<Department | null>(null)

  // Fetch departments
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-departments'],
    queryFn: () => api.get<{ success: boolean; data: Department[] }>('/admin/departments'),
  })

  // Cascade analysis query (only when deleteDept is set)
  const { data: cascadeData, isLoading: cascadeLoading } = useQuery({
    queryKey: ['cascade-analysis', deleteDept?.id],
    queryFn: () => api.get<{ success: boolean; data: CascadeAnalysis }>(`/admin/departments/${deleteDept!.id}/cascade-analysis`),
    enabled: !!deleteDept,
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (body: DeptFormData) => api.post('/admin/departments', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] })
      setCreateOpen(false)
      toast.success('부서가 생성되었습니다')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DeptFormData> }) =>
      api.patch(`/admin/departments/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] })
      setEditDept(null)
      toast.success('부서가 수정되었습니다')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/departments/${id}?mode=force`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] })
      setDeleteDept(null)
      toast.success('부서가 삭제되었습니다')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const departments = data?.data ?? []
  const activeDepts = departments.filter((d) => d.isActive)
  const inactiveDepts = departments.filter((d) => !d.isActive)

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="departments-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
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
      <div data-testid="departments-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-6 text-center">
          <p className="text-sm text-red-400">부서 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-500 hover:text-red-400 underline mt-2">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="departments-page" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-50">부서 관리</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {activeDepts.length}개 활성 부서
            {inactiveDepts.length > 0 && ` · ${inactiveDepts.length}개 비활성`}
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          + 부서 추가
        </Button>
      </div>

      {/* Empty state */}
      {activeDepts.length === 0 && inactiveDepts.length === 0 && (
        <EmptyState
          title="부서가 없습니다"
          description="첫 부서를 생성하여 조직을 구성하세요"
        />
      )}

      {/* Active departments */}
      {activeDepts.length > 0 && (
        <div className="space-y-3">
          {activeDepts.map((dept) => (
            <div
              key={dept.id}
              data-testid={`dept-row-${dept.id}`}
              className="flex flex-col gap-3 bg-slate-900/40 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/30 transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-50 truncate group-hover:text-cyan-400 transition-colors">{dept.name}</h3>
                      <Badge variant="success">활성</Badge>
                    </div>
                    {dept.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{dept.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => setEditDept(dept)}
                    className="px-2 sm:px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-800 rounded-lg transition-colors"
                    aria-label={`${dept.name} 편집`}
                  >
                    편집
                  </button>
                  <button
                    onClick={() => setDeleteDept(dept)}
                    className="px-2 sm:px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-900/20 rounded-lg transition-colors"
                    aria-label={`${dept.name} 삭제`}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inactive departments */}
      {inactiveDepts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">
            비활성 부서
          </p>
          {inactiveDepts.map((dept) => (
            <div
              key={dept.id}
              className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-lg px-4 py-3 opacity-60"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-slate-500 truncate">{dept.name}</h3>
                  <Badge variant="default">비활성</Badge>
                </div>
                {dept.description && (
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{dept.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Bar — mobile-friendly stats */}
      {departments.length > 0 && (
        <div className="sm:hidden rounded-xl bg-slate-800/80 border border-slate-700 p-3 px-4">
          <div className="flex justify-between items-center font-mono text-xs">
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-sans uppercase">부서</span>
                <span className="font-bold text-slate-100">{activeDepts.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-sans uppercase">비활성</span>
                <span className="font-bold text-slate-400">{inactiveDepts.length}</span>
              </div>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-slate-500 text-[10px] font-sans uppercase">전체</span>
              <span className="font-bold text-slate-100">{departments.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="부서 생성">
        <DepartmentForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setCreateOpen(false)}
          isSubmitting={createMutation.isPending}
          submitLabel="생성"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editDept}
        onClose={() => setEditDept(null)}
        title="부서 편집"
      >
        {editDept && (
          <DepartmentForm
            initialData={{ name: editDept.name, description: editDept.description ?? '' }}
            onSubmit={(data) => updateMutation.mutate({ id: editDept.id, body: data })}
            onCancel={() => setEditDept(null)}
            isSubmitting={updateMutation.isPending}
            submitLabel="저장"
          />
        )}
      </Modal>

      {/* Delete Modal with Cascade Analysis */}
      <Modal
        isOpen={!!deleteDept}
        onClose={() => setDeleteDept(null)}
        title={`"${deleteDept?.name}" 부서 삭제`}
      >
        {deleteDept && (
          <CascadePanel
            analysis={cascadeData?.data ?? null}
            isLoading={cascadeLoading}
            onForceDelete={() => deleteMutation.mutate(deleteDept.id)}
            onCancel={() => setDeleteDept(null)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </Modal>
    </div>
  )
}
