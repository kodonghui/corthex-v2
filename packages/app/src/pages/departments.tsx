/**
 * API ENDPOINTS:
 * - GET    /api/admin/departments                       : List all departments
 * - POST   /api/admin/departments                       : Create a new department
 * - PATCH  /api/admin/departments/:id                   : Update department
 * - DELETE /api/admin/departments/:id?mode=force        : Delete department (force cascade)
 * - GET    /api/admin/departments/:id/cascade-analysis  : Analyze deletion impact
 * - GET    /api/admin/agents?departmentId=:id           : List agents in a department
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Modal, Button, Input, Textarea, Skeleton, EmptyState, Badge, toast } from '@corthex/ui'
import { Plus, Pencil, Trash2, Bot, Building2, Users } from 'lucide-react'

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

// ── Department Form ──

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
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1">
          부서명 <span className="text-red-500">*</span>
        </label>
        <Input value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} placeholder="예: 마케팅부" maxLength={100} autoFocus />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
      </div>
      <div>
        <label className="block text-xs font-medium text-corthex-text-secondary mb-1">설명</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="부서 설명 (선택)" rows={3} />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isSubmitting}>취소</Button>
        <Button size="sm" type="submit" disabled={isSubmitting}>{isSubmitting ? '처리 중...' : submitLabel}</Button>
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
      <div className="bg-amber-700/5 border border-amber-700/20 rounded-lg p-3">
        <p className="text-sm font-medium text-amber-700 mb-2">삭제 영향 분석</p>
        <div className="space-y-1 text-xs text-amber-700/80">
          <p>소속 에이전트: <strong>{analysis.agentCount}명</strong> (미할당으로 전환됨)</p>
          <p>진행 중 작업: <strong>{analysis.activeTaskCount}건</strong></p>
          <p>부서 지식: <strong>{analysis.knowledgeCount}건</strong></p>
        </div>
      </div>
      {analysis.agentBreakdown.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          <p className="text-xs font-medium text-corthex-text-secondary mb-1">영향 받는 에이전트</p>
          <div className="space-y-1">
            {analysis.agentBreakdown.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between text-xs px-2 py-1 bg-corthex-bg rounded border border-corthex-border">
                <span className="text-corthex-text-secondary">{agent.name}</span>
                <Badge variant="default">{agent.tier}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2 justify-end pt-2">
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>취소</Button>
        <Button variant="destructive" size="sm" onClick={onForceDelete} disabled={isDeleting}>
          {isDeleting ? '삭제 중...' : '삭제 확인'}
        </Button>
      </div>
    </div>
  )
}

// ── Agent status helpers ──

const STATUS_COLORS: Record<string, { dot: string; label: string }> = {
  online: { dot: 'bg-corthex-accent', label: '활성' },
  working: { dot: 'bg-corthex-info', label: '작업 중' },
  error: { dot: 'bg-red-600', label: '오류' },
  offline: { dot: 'bg-corthex-text-secondary/40', label: '오프라인' },
}

const TIER_COLORS: Record<string, string> = {
  manager: 'bg-corthex-accent-deep text-white',
  specialist: 'bg-corthex-accent text-white',
  worker: 'bg-corthex-elevated text-corthex-accent-deep',
}

const DEPT_ICONS = [
  { icon: Bot, label: 'default' },
]

function getDeptInitials(name: string): string {
  return name.slice(0, 2)
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
  const { data: agentsData, isLoading: agentsLoading } = useQuery({
    queryKey: ['admin-agents', dept.id],
    queryFn: () => api.get<{ success: boolean; data: DeptAgent[] }>(`/workspace/agents?departmentId=${dept.id}`),
    enabled: !!dept.id,
  })

  const agents = agentsData?.data ?? []

  return (
    <div className="bg-corthex-elevated rounded-xl p-8 border border-corthex-border">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-corthex-accent-deep text-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Building2 className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-black text-corthex-accent-deep tracking-tight">{dept.name}</h2>
            </div>
            <p className="mt-2 text-corthex-text-secondary max-w-xl leading-relaxed">{dept.description || '설명 없음'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onEdit} className="px-6 py-2.5 bg-corthex-elevated text-corthex-text-primary font-bold rounded-lg hover:bg-corthex-border transition-colors border border-corthex-border active:scale-95">
            수정 Edit
          </button>
          <button onClick={onDelete} className="px-6 py-2.5 bg-red-600/10 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all active:scale-95">
            삭제 Delete
          </button>
        </div>
      </div>

      {/* Members List */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-corthex-accent-deep flex items-center gap-2">
            <Users className="w-5 h-5" />
            소속 에이전트
          </h3>
          <div className="text-corthex-text-secondary text-xs font-mono uppercase tracking-widest">
            {agentsLoading ? '...' : `${agents.length} Entities`}
          </div>
        </div>

        {agentsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-corthex-bg border border-corthex-border rounded-xl p-6 text-center">
            <Bot className="w-8 h-8 text-corthex-text-secondary mx-auto mb-2" />
            <p className="text-sm text-corthex-text-secondary">이 부서에 할당된 에이전트가 없습니다</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-corthex-bg border border-corthex-border/50">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-corthex-border/50">
                  <th className="px-6 py-4 text-[10px] font-mono text-corthex-text-secondary uppercase tracking-widest">Agent Name</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-corthex-text-secondary uppercase tracking-widest">Tier</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-corthex-text-secondary uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-mono text-corthex-text-secondary uppercase tracking-widest">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-corthex-border/30">
                {agents.map((agent) => {
                  const statusInfo = STATUS_COLORS[agent.status] ?? STATUS_COLORS.offline
                  const tierColor = TIER_COLORS[agent.tier] ?? TIER_COLORS.worker
                  return (
                    <tr key={agent.id} className="hover:bg-corthex-elevated transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${tierColor}`}>
                            {agent.name.slice(0, 2)}
                          </div>
                          <span className="font-bold text-corthex-text-primary">{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-corthex-text-secondary capitalize">{agent.tier}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                          <span className="text-sm font-medium text-corthex-text-primary">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-corthex-accent-deep">{agent.modelName}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['workspace-departments'],
    queryFn: () => api.get<{ success: boolean; data: Department[] }>('/workspace/departments'),
  })

  const { data: cascadeData, isLoading: cascadeLoading } = useQuery({
    queryKey: ['cascade-analysis', deleteDept?.id],
    queryFn: () => api.get<{ success: boolean; data: CascadeAnalysis }>(`/workspace/departments/${deleteDept!.id}/cascade-analysis`),
    enabled: !!deleteDept,
  })

  const createMutation = useMutation({
    mutationFn: (body: DeptFormData) => api.post('/workspace/departments', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-departments'] })
      setCreateOpen(false)
      toast.success('부서가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<DeptFormData> }) => api.patch(`/workspace/departments/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-departments'] })
      if (editDept && selectedDept && editDept.id === selectedDept.id) {
        setSelectedDept(null)
      }
      setEditDept(null)
      toast.success('부서가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/departments/${id}?mode=force`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-departments'] })
      if (deleteDept && selectedDept && deleteDept.id === selectedDept.id) {
        setSelectedDept(null)
      }
      setDeleteDept(null)
      toast.success('부서가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const departments = data?.data ?? []
  const activeDepts = departments.filter((d) => d.isActive)
  const inactiveDepts = departments.filter((d) => !d.isActive)

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

  if (isLoading) {
    return (
      <div data-testid="departments-page" className="flex-1 p-8 space-y-6 bg-corthex-bg">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-8">
          <div className="w-[440px]">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-44 w-full rounded-xl" />)}
            </div>
          </div>
          <Skeleton className="flex-1 h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div data-testid="departments-page" className="flex-1 p-8 bg-corthex-bg">
        <div className="bg-red-600/10 border border-red-600/20 rounded-xl p-6 text-center">
          <p className="text-sm text-red-600">부서 목록을 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-red-600 hover:opacity-70 underline mt-2">다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="departments-page" className="flex-1 bg-corthex-bg overflow-y-auto">
      <div className="p-8 max-w-[1440px] mx-auto">
        <div className="flex gap-8 items-start">
          {/* LEFT PANEL: Department Navigation */}
          <aside className="w-[440px] sticky top-8 flex flex-col gap-6">
            <header className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-corthex-text-secondary mb-1">Organization Oversight</p>
                <h1 className="text-4xl font-bold tracking-tight text-corthex-text-primary">{departments.length} Departments</h1>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-corthex-accent hover:bg-corthex-accent-hover text-corthex-text-on-accent rounded-lg font-bold text-sm transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Create Department
              </button>
            </header>

            {/* Empty state */}
            {activeDepts.length === 0 && inactiveDepts.length === 0 && (
              <EmptyState title="부서가 없습니다" description="첫 부서를 생성하여 조직을 구성하세요" />
            )}

            {/* Department Grid */}
            <div className="grid grid-cols-2 gap-4">
              {activeDepts.map((dept) => {
                const isSelected = resolvedSelected?.id === dept.id
                return (
                  <div
                    key={dept.id}
                    data-testid={`dept-row-${dept.id}`}
                    onClick={() => handleCardClick(dept)}
                    className={`bg-corthex-surface border rounded-xl p-5 cursor-pointer transition-all duration-300 group hover:border-corthex-accent/50 ${
                      isSelected
                        ? 'border-corthex-accent shadow-lg'
                        : 'border-corthex-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-corthex-accent text-corthex-text-on-accent' : 'bg-corthex-accent/10 text-corthex-accent group-hover:bg-corthex-accent group-hover:text-corthex-text-on-accent'
                      }`}>
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-corthex-success/10 text-corthex-success">
                        Operational
                      </span>
                    </div>
                    <h3 className={`text-base font-bold mb-1 transition-colors line-clamp-1 ${isSelected ? 'text-corthex-accent' : 'text-corthex-text-primary group-hover:text-corthex-accent'}`}>
                      {dept.name}
                    </h3>
                    <p className="text-corthex-text-secondary text-xs mb-4 line-clamp-2">{dept.description || 'No description'}</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-corthex-text-secondary">Budget</span>
                        <span className="text-xs font-mono font-bold text-corthex-text-primary">--</span>
                      </div>
                      <div className="h-1.5 w-full bg-corthex-elevated rounded-full overflow-hidden">
                        <div className={`${isSelected ? 'bg-corthex-accent' : 'bg-corthex-accent/40'} h-full rounded-full`} style={{ width: '50%' }} />
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Inactive departments inline */}
              {inactiveDepts.map((dept) => (
                <div key={dept.id} className="bg-corthex-surface border border-corthex-border rounded-xl p-5 opacity-50">
                  <div className="flex justify-between items-start mb-5">
                    <div className="w-10 h-10 bg-corthex-border rounded-lg flex items-center justify-center text-corthex-text-secondary">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-corthex-border/50 text-corthex-text-secondary">
                      Inactive
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-corthex-text-secondary mb-1 line-clamp-1">{dept.name}</h3>
                  {dept.description && <p className="text-corthex-text-secondary text-xs line-clamp-2">{dept.description}</p>}
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT PANEL: Department Detail */}
          <main className="flex-1 min-w-0">
            {resolvedSelected ? (
              <DepartmentDetailSection
                dept={resolvedSelected}
                onEdit={() => setEditDept(resolvedSelected)}
                onDelete={() => setDeleteDept(resolvedSelected)}
                onClose={() => setSelectedDept(null)}
              />
            ) : (
              <div className="bg-corthex-elevated rounded-xl border border-corthex-border p-12 text-center">
                <Building2 className="w-16 h-16 text-corthex-border mx-auto mb-4" />
                <p className="text-corthex-text-secondary font-medium">부서를 선택하세요</p>
                <p className="text-corthex-text-secondary text-sm mt-1">좌측 카드에서 부서를 클릭하면 상세 정보가 표시됩니다</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="부서 생성">
        <DepartmentForm onSubmit={(data) => createMutation.mutate(data)} onCancel={() => setCreateOpen(false)} isSubmitting={createMutation.isPending} submitLabel="생성" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editDept} onClose={() => setEditDept(null)} title="부서 편집">
        {editDept && (
          <DepartmentForm initialData={{ name: editDept.name, description: editDept.description ?? '' }} onSubmit={(data) => updateMutation.mutate({ id: editDept.id, body: data })} onCancel={() => setEditDept(null)} isSubmitting={updateMutation.isPending} submitLabel="저장" />
        )}
      </Modal>

      {/* Delete Modal with Cascade Analysis */}
      <Modal isOpen={!!deleteDept} onClose={() => setDeleteDept(null)} title={`"${deleteDept?.name}" 부서 삭제`}>
        {deleteDept && (
          <CascadePanel analysis={cascadeData?.data ?? null} isLoading={cascadeLoading} onForceDelete={() => deleteMutation.mutate(deleteDept.id)} onCancel={() => setDeleteDept(null)} isDeleting={deleteMutation.isPending} />
        )}
      </Modal>
    </div>
  )
}
