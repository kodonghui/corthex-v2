import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Modal, ConfirmDialog, Button, Input, Textarea, Skeleton, EmptyState, Badge, toast } from '@corthex/ui'
import { Plus, Pencil, Trash2, Bot, Building2, ChevronRight, Users, MoreVertical, Cpu, DollarSign } from 'lucide-react'

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

type DeptAgent = {
  id: string
  name: string
  role: string | null
  tier: 'manager' | 'specialist' | 'worker'
  modelName: string
  status: 'online' | 'working' | 'error' | 'offline'
  isActive: boolean
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

// ── Agent status helpers ──

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  online: { bg: 'bg-green-900/30', text: 'text-green-400', label: '활성' },
  working: { bg: 'bg-cyan-900/30', text: 'text-cyan-400', label: '작업 중' },
  error: { bg: 'bg-red-900/30', text: 'text-red-400', label: '오류' },
  offline: { bg: 'bg-slate-800', text: 'text-slate-400', label: '오프라인' },
}

const TIER_COLORS: Record<string, string> = {
  manager: 'text-cyan-400 bg-cyan-500/10',
  specialist: 'text-indigo-400 bg-indigo-500/10',
  worker: 'text-emerald-400 bg-emerald-500/10',
}

// ── Detail Section ──

function DepartmentDetailSection({
  dept,
  onEdit,
  onDelete,
  onClose,
}: {
  dept: Department
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  // Fetch agents assigned to this department
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['admin-agents', dept.id],
    queryFn: () => api.get<{ success: boolean; data: DeptAgent[] }>(`/admin/agents?departmentId=${dept.id}`),
    enabled: !!dept.id,
  })

  const agents = agentsData?.data ?? []

  return (
    <div className="flex flex-col gap-6">
      {/* Detail Header */}
      <div className="flex flex-col gap-2">
        <nav aria-label="Breadcrumb" className="flex text-sm text-slate-400">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <button
                onClick={onClose}
                className="hover:text-cyan-400 transition-colors"
              >
                부서 목록
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="text-slate-200 font-medium">{dept.name}</span>
              </div>
            </li>
          </ol>
        </nav>
        <div className="flex flex-wrap justify-between items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{dept.name} 상세</h2>
            <p className="text-slate-400 mt-1 max-w-2xl">
              {dept.description || '설명 없음'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-slate-900/50 border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <Pencil className="w-[18px] h-[18px]" />
              편집
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-[18px] h-[18px]" />
              삭제
            </button>
          </div>
        </div>
      </div>

      {/* Assigned Agents List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          할당된 에이전트 ({agentsLoading ? '...' : agents.length})
        </h3>

        {agentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
            <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">이 부서에 할당된 에이전트가 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => {
              const statusInfo = STATUS_COLORS[agent.status] ?? STATUS_COLORS.offline
              const tierColor = TIER_COLORS[agent.tier] ?? TIER_COLORS.worker
              return (
                <div
                  key={agent.id}
                  className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800"
                >
                  <div className={`rounded-lg p-3 ${tierColor}`}>
                    <Bot className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-base font-semibold text-white truncate">{agent.name}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-3 truncate">
                      {agent.role || '역할 미지정'}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{agent.modelName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="capitalize">{agent.tier}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)

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
      // Update selectedDept if we just edited it
      if (editDept && selectedDept && editDept.id === selectedDept.id) {
        // Refetch will update, but we also need to refresh the selected reference
        setSelectedDept(null)
      }
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
      if (deleteDept && selectedDept && deleteDept.id === selectedDept.id) {
        setSelectedDept(null)
      }
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

  // Keep selectedDept in sync with fetched data
  const resolvedSelected = selectedDept
    ? departments.find((d) => d.id === selectedDept.id) ?? null
    : null

  const handleCardClick = (dept: Department) => {
    if (selectedDept?.id === dept.id) {
      setSelectedDept(null)
    } else {
      setSelectedDept(dept)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div data-testid="departments-page" className="w-full max-w-[1200px] mx-auto px-6 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div data-testid="departments-page" className="w-full max-w-[1200px] mx-auto px-6 py-8">
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
    <div data-testid="departments-page" className="w-full max-w-[1200px] mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-white">부서 관리</h1>
          <p className="text-slate-400 mt-1">
            조직의 부서와 할당된 AI 에이전트를 관리합니다.
            {activeDepts.length > 0 && (
              <span className="text-slate-500 ml-2">
                {activeDepts.length}개 활성
                {inactiveDepts.length > 0 && ` · ${inactiveDepts.length}개 비활성`}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-cyan-400 hover:bg-cyan-400/90 text-slate-900 font-semibold leading-normal transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>새 부서 추가</span>
        </button>
      </div>

      {/* Empty state */}
      {activeDepts.length === 0 && inactiveDepts.length === 0 && (
        <EmptyState
          title="부서가 없습니다"
          description="첫 부서를 생성하여 조직을 구성하세요"
        />
      )}

      {/* Departments Grid */}
      {activeDepts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {activeDepts.map((dept) => {
            const isSelected = resolvedSelected?.id === dept.id
            return (
              <div
                key={dept.id}
                data-testid={`dept-row-${dept.id}`}
                className={`group flex flex-col rounded-xl overflow-hidden transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900/50 border-2 border-cyan-400 shadow-lg shadow-cyan-400/10'
                    : 'bg-slate-900/50 border border-slate-800 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/10'
                }`}
                onClick={() => handleCardClick(dept)}
              >
                <div className="p-5 flex-1 flex flex-col">
                  {/* Card header: name + agent count badge */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-xl font-bold transition-colors ${
                      isSelected ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {dept.name}
                    </h3>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                      isSelected ? 'bg-cyan-400/10 text-cyan-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Bot className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-3">
                    {dept.description || '설명 없음'}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-end mt-auto pt-4 border-t border-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">활성</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditDept(dept) }}
                        className="text-slate-400 hover:text-cyan-400 transition-colors"
                        aria-label={`${dept.name} 편집`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteDept(dept) }}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        aria-label={`${dept.name} 삭제`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Section (shown below grid when a department is selected) */}
      {resolvedSelected && (
        <>
          <div className="w-full h-px bg-slate-800 mb-8" />
          <DepartmentDetailSection
            dept={resolvedSelected}
            onEdit={() => setEditDept(resolvedSelected)}
            onDelete={() => setDeleteDept(resolvedSelected)}
            onClose={() => setSelectedDept(null)}
          />
        </>
      )}

      {/* Inactive departments */}
      {inactiveDepts.length > 0 && (
        <>
          <div className="w-full h-px bg-slate-800 mb-8 mt-12" />
          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1 mb-3">
              비활성 부서
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inactiveDepts.map((dept) => (
                <div
                  key={dept.id}
                  className="flex flex-col bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden opacity-60 p-5"
                >
                  <h3 className="text-lg font-bold text-slate-500 mb-2">{dept.name}</h3>
                  {dept.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{dept.description}</p>
                  )}
                  <div className="mt-auto pt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-400">비활성</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
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
