import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { toast } from '@corthex/ui'

// === Types ===

type WorkflowStep = {
  id: string
  name: string
  type: 'tool' | 'llm' | 'condition'
  action: string
  params?: Record<string, unknown>
  agentId?: string
  dependsOn?: string[]
  trueBranch?: string
  falseBranch?: string
  systemPrompt?: string
  timeout?: number
  retryCount?: number
}

type Workflow = {
  id: string
  name: string
  description: string | null
  steps: WorkflowStep[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
  recentExecutions?: Execution[]
}

type Execution = {
  id: string
  workflowId: string
  status: 'success' | 'failed'
  totalDurationMs: number
  stepSummaries: StepSummary[]
  triggeredBy: string
  createdAt: string
}

type StepSummary = {
  stepId: string
  stepName: string
  status: string
  output: unknown | null
  durationMs: number
  error: string | null
}

type Suggestion = {
  id: string
  reason: string
  suggestedSteps: WorkflowStep[]
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

type ListMeta = { page: number; total: number }

// === Constants ===

const STEP_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  tool: { label: 'Tool', className: 'bg-blue-500/20 text-blue-400' },
  llm: { label: 'LLM', className: 'bg-purple-500/20 text-purple-400' },
  condition: { label: 'Condition', className: 'bg-amber-500/20 text-amber-400' },
}

const EXEC_STATUS: Record<string, { label: string; className: string }> = {
  success: { label: '성공', className: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: '실패', className: 'bg-red-500/20 text-red-400' },
}

const inputClass = 'w-full bg-slate-800 border border-slate-600 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-slate-50 focus:outline-none'
const selectClass = 'w-full bg-slate-800 border border-slate-600 focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-slate-50 focus:outline-none appearance-none'

type TabKey = 'workflows' | 'suggestions'

// === Main Page ===

export function WorkflowsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabKey>('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [executionsPage, setExecutionsPage] = useState(1)

  // --- Queries ---
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: () => api.get<{ success: boolean; data: Workflow[]; meta: ListMeta }>('/workspace/workflows?limit=100'),
  })

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['workflow-detail', selectedWorkflow],
    queryFn: () => api.get<{ success: boolean; data: Workflow }>(`/workspace/workflows/${selectedWorkflow}`),
    enabled: !!selectedWorkflow,
  })

  const { data: executionsData } = useQuery({
    queryKey: ['workflow-executions', selectedWorkflow, executionsPage],
    queryFn: () => api.get<{ success: boolean; data: Execution[]; meta: ListMeta }>(
      `/workspace/workflows/${selectedWorkflow}/executions?page=${executionsPage}&limit=10`
    ),
    enabled: !!selectedWorkflow,
  })

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['workflow-suggestions'],
    queryFn: () => api.get<{ success: boolean; data: Suggestion[]; meta: ListMeta }>('/workspace/workflows/suggestions?limit=100'),
  })

  // --- Mutations ---
  const createWorkflow = useMutation({
    mutationFn: (body: { name: string; description?: string; steps: WorkflowStep[] }) =>
      api.post<{ success: boolean; data: Workflow }>('/workspace/workflows', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setShowCreateModal(false)
      setEditingWorkflow(null)
      toast.success('워크플로우가 생성되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const updateWorkflow = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; description?: string; steps?: WorkflowStep[] }) =>
      api.put<{ success: boolean; data: Workflow }>(`/workspace/workflows/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      queryClient.invalidateQueries({ queryKey: ['workflow-detail', selectedWorkflow] })
      setShowCreateModal(false)
      setEditingWorkflow(null)
      toast.success('워크플로우가 수정되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteWorkflow = useMutation({
    mutationFn: (id: string) => api.delete<{ success: boolean }>(`/workspace/workflows/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setDeleteTarget(null)
      if (selectedWorkflow === deleteTarget) setSelectedWorkflow(null)
      toast.success('워크플로우가 삭제되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const executeWorkflow = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: { executionId: string; status: string } }>(`/workspace/workflows/${id}/execute`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-executions', selectedWorkflow] })
      queryClient.invalidateQueries({ queryKey: ['workflow-detail', selectedWorkflow] })
      toast.success('워크플로우가 실행되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const acceptSuggestion = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean; data: { workflowId: string } }>(`/workspace/workflows/suggestions/${id}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-suggestions'] })
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('제안이 수락되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const rejectSuggestion = useMutation({
    mutationFn: (id: string) =>
      api.post<{ success: boolean }>(`/workspace/workflows/suggestions/${id}/reject`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-suggestions'] })
      toast.success('제안이 거절되었습니다')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const workflows = workflowsData?.data || []
  const suggestions = suggestionsData?.data || []
  const detail = detailData?.data || null
  const executions = executionsData?.data || []
  const executionsMeta = executionsData?.meta

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'workflows', label: '워크플로우', count: workflows.length },
    { key: 'suggestions', label: '자동 제안', count: suggestions.length },
  ]

  function openEdit(wf: Workflow) {
    setEditingWorkflow(wf)
    setShowCreateModal(true)
  }

  // --- Detail view ---
  if (selectedWorkflow) {
    return (
      <div className="h-full flex flex-col bg-slate-900" data-testid="workflows-detail">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setSelectedWorkflow(null); setExecutionsPage(1) }}
              className="text-sm text-slate-400 hover:text-slate-200"
            >
              ← 목록
            </button>
            <h2 className="text-xl font-semibold text-slate-50">
              {detailLoading ? '...' : detail?.name || '워크플로우'}
            </h2>
          </div>
          {detail && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => executeWorkflow.mutate(detail.id)}
                disabled={executeWorkflow.isPending}
                className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50"
                data-testid="execute-btn"
              >
                {executeWorkflow.isPending ? '실행 중...' : '실행'}
              </button>
              <button
                onClick={() => openEdit(detail)}
                className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm"
                data-testid="edit-workflow-btn"
              >
                편집
              </button>
              <button
                onClick={() => setDeleteTarget(detail.id)}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-2"
                data-testid="delete-workflow-btn"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {detailLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800 animate-pulse rounded-xl" />)}
            </div>
          ) : detail ? (
            <div className="max-w-3xl space-y-6">
              {/* Description */}
              {detail.description && (
                <p className="text-sm text-slate-400">{detail.description}</p>
              )}

              {/* Steps visualization */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">단계 ({detail.steps.length})</h3>
                <div className="space-y-2">
                  {(detail.steps as WorkflowStep[]).map((step, idx) => {
                    const typeInfo = STEP_TYPE_LABELS[step.type] || STEP_TYPE_LABELS.tool
                    return (
                      <div key={step.id} className="flex items-start gap-3" data-testid={`step-${idx}`}>
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400 font-mono">
                            {idx + 1}
                          </div>
                          {idx < detail.steps.length - 1 && (
                            <div className="w-px h-6 bg-slate-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeInfo.className}`}>
                              {typeInfo.label}
                            </span>
                            <span className="text-sm font-medium text-slate-100">{step.name}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-mono">{step.action}</p>
                          {step.dependsOn && step.dependsOn.length > 0 && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              의존: {step.dependsOn.map(depId => {
                                const depStep = (detail.steps as WorkflowStep[]).find(s => s.id === depId)
                                return depStep?.name || depId.slice(0, 8)
                              }).join(', ')}
                            </p>
                          )}
                          {step.timeout && (
                            <p className="text-[10px] text-slate-500 mt-0.5">타임아웃: {(step.timeout / 1000).toFixed(0)}초</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Execution history */}
              <div>
                <h3 className="text-sm font-medium text-slate-400 mb-3">실행 이력</h3>
                {executions.length === 0 ? (
                  <p className="text-xs text-slate-500">아직 실행 이력이 없습니다</p>
                ) : (
                  <div className="space-y-2">
                    {executions.map(exec => {
                      const statusInfo = EXEC_STATUS[exec.status] || EXEC_STATUS.failed
                      return (
                        <ExecutionCard key={exec.id} execution={exec} statusInfo={statusInfo} />
                      )
                    })}
                    {/* Pagination */}
                    {executionsMeta && executionsMeta.total > 10 && (
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => setExecutionsPage(p => Math.max(1, p - 1))}
                          disabled={executionsPage <= 1}
                          className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        >
                          이전
                        </button>
                        <span className="text-xs text-slate-500">
                          {executionsPage} / {Math.ceil(executionsMeta.total / 10)}
                        </span>
                        <button
                          onClick={() => setExecutionsPage(p => p + 1)}
                          disabled={executionsPage >= Math.ceil(executionsMeta.total / 10)}
                          className="text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30"
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        {/* Delete confirm */}
        {deleteTarget && (
          <DeleteConfirmModal
            onConfirm={() => deleteWorkflow.mutate(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {/* Edit modal */}
        {showCreateModal && (
          <WorkflowFormModal
            workflow={editingWorkflow}
            isPending={createWorkflow.isPending || updateWorkflow.isPending}
            onSubmit={(data) => {
              if (editingWorkflow) {
                updateWorkflow.mutate({ id: editingWorkflow.id, ...data })
              } else {
                createWorkflow.mutate(data)
              }
            }}
            onClose={() => { setShowCreateModal(false); setEditingWorkflow(null) }}
          />
        )}
      </div>
    )
  }

  // --- List view ---
  return (
    <div className="h-full flex flex-col bg-slate-900" data-testid="workflows-page">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">워크플로우</h2>
          <p className="text-sm text-slate-400 mt-1">
            자동화 워크플로우를 관리하세요
          </p>
        </div>
        <button
          onClick={() => { setEditingWorkflow(null); setShowCreateModal(true) }}
          className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-4 py-2 text-sm font-medium"
          data-testid="create-workflow-btn"
        >
          + 워크플로우 생성
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 sm:px-6 lg:px-8 border-b border-slate-800" data-testid="workflow-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-2xl space-y-3">
          {/* Workflows tab */}
          {activeTab === 'workflows' && (
            isLoading ? (
              <div className="space-y-3" data-testid="workflows-loading">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-xl" />)}
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-16" data-testid="workflows-empty">
                <p className="text-sm text-slate-400">아직 워크플로우가 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">새 워크플로우를 생성해보세요</p>
              </div>
            ) : (
              workflows.map(wf => (
                <div
                  key={wf.id}
                  onClick={() => setSelectedWorkflow(wf.id)}
                  className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all"
                  data-testid={`workflow-item-${wf.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-slate-100 truncate">{wf.name}</h3>
                      {wf.description && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{wf.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500 font-mono">
                        <span>{(wf.steps as WorkflowStep[]).length}개 단계</span>
                        <span>{new Date(wf.updatedAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEdit(wf) }}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        편집
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(wf.id) }}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* Suggestions tab */}
          {activeTab === 'suggestions' && (
            suggestionsLoading ? (
              <div className="space-y-3" data-testid="suggestions-loading">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-800 animate-pulse rounded-xl" />)}
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-16" data-testid="suggestions-empty">
                <p className="text-sm text-slate-400">대기 중인 자동 제안이 없습니다</p>
                <p className="text-xs text-slate-500 mt-1">반복적인 도구 사용 패턴이 감지되면 자동으로 제안됩니다</p>
              </div>
            ) : (
              suggestions.map(sg => (
                <div
                  key={sg.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
                  data-testid={`suggestion-item-${sg.id}`}
                >
                  <p className="text-sm text-slate-100 mb-2">{sg.reason}</p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {(sg.suggestedSteps as WorkflowStep[]).map((step, i) => (
                      <span key={step.id} className="inline-flex items-center gap-1">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{step.action}</span>
                        {i < sg.suggestedSteps.length - 1 && <span className="text-slate-600 text-xs">→</span>}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => acceptSuggestion.mutate(sg.id)}
                      disabled={acceptSuggestion.isPending}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                    >
                      수락
                    </button>
                    <button
                      onClick={() => rejectSuggestion.mutate(sg.id)}
                      disabled={rejectSuggestion.isPending}
                      className="border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      거절
                    </button>
                    <span className="text-[10px] text-slate-500 ml-auto font-mono">
                      {new Date(sg.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={() => deleteWorkflow.mutate(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Create/Edit modal */}
      {showCreateModal && (
        <WorkflowFormModal
          workflow={editingWorkflow}
          isPending={createWorkflow.isPending || updateWorkflow.isPending}
          onSubmit={(data) => {
            if (editingWorkflow) {
              updateWorkflow.mutate({ id: editingWorkflow.id, ...data })
            } else {
              createWorkflow.mutate(data)
            }
          }}
          onClose={() => { setShowCreateModal(false); setEditingWorkflow(null) }}
        />
      )}
    </div>
  )
}

// === Execution Card ===

function ExecutionCard({ execution, statusInfo }: { execution: Execution; statusInfo: { label: string; className: string } }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden" data-testid={`execution-${execution.id}`}>
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.className}`}>{statusInfo.label}</span>
          <span className="text-xs text-slate-400 font-mono">
            {(execution.totalDurationMs / 1000).toFixed(1)}초
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-mono">
            {new Date(execution.createdAt).toLocaleString('ko-KR', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <span className="text-slate-500 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-3 border-t border-slate-800 space-y-2">
          {(execution.stepSummaries as StepSummary[]).map((step) => (
            <div key={step.stepId} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${step.status === 'completed' || step.status === 'success' ? 'bg-emerald-400' : step.status === 'failed' ? 'bg-red-400' : 'bg-slate-500'}`} />
                <span className="text-slate-300">{step.stepName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono">{(step.durationMs / 1000).toFixed(1)}초</span>
                {step.error && (
                  <span className="text-red-400 truncate max-w-[200px]" title={step.error}>{step.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// === Delete Confirm Modal ===

function DeleteConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-96 mx-4" data-testid="delete-confirm-modal">
        <h3 className="text-sm font-semibold text-slate-100 mb-2">워크플로우 삭제</h3>
        <p className="text-xs text-slate-400 mb-4">이 워크플로우를 삭제하시겠습니까?</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-700">취소</button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium">삭제</button>
        </div>
      </div>
    </div>
  )
}

// === Workflow Form Modal (Create / Edit) ===

function WorkflowFormModal({ workflow, isPending, onSubmit, onClose }: {
  workflow: Workflow | null
  isPending: boolean
  onSubmit: (data: { name: string; description?: string; steps: WorkflowStep[] }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const [steps, setSteps] = useState<WorkflowStep[]>(
    workflow?.steps
      ? (workflow.steps as WorkflowStep[]).map(s => ({ ...s }))
      : [createEmptyStep()]
  )

  function createEmptyStep(): WorkflowStep {
    return {
      id: crypto.randomUUID(),
      name: '',
      type: 'tool',
      action: '',
    }
  }

  function addStep() {
    if (steps.length >= 20) return
    const newStep = createEmptyStep()
    // Auto-chain: depend on the last step
    if (steps.length > 0) {
      newStep.dependsOn = [steps[steps.length - 1].id]
    }
    setSteps([...steps, newStep])
  }

  function removeStep(idx: number) {
    if (steps.length <= 1) return
    const removedId = steps[idx].id
    const updated = steps.filter((_, i) => i !== idx).map(s => ({
      ...s,
      dependsOn: s.dependsOn?.filter(d => d !== removedId),
    }))
    setSteps(updated)
  }

  function updateStep(idx: number, patch: Partial<WorkflowStep>) {
    setSteps(steps.map((s, i) => i === idx ? { ...s, ...patch } : s))
  }

  function moveStep(idx: number, direction: -1 | 1) {
    const targetIdx = idx + direction
    if (targetIdx < 0 || targetIdx >= steps.length) return
    const newSteps = [...steps]
    const temp = newSteps[idx]
    newSteps[idx] = newSteps[targetIdx]
    newSteps[targetIdx] = temp
    setSteps(newSteps)
  }

  function handleSubmit() {
    if (!name.trim() || steps.length === 0) return
    const validSteps = steps.filter(s => s.name.trim() && s.action.trim())
    if (validSteps.length === 0) return
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      steps: validSteps,
    })
  }

  const isValid = name.trim() && steps.some(s => s.name.trim() && s.action.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-xl w-full mx-4 p-4 sm:p-6 max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        data-testid="workflow-form-modal"
      >
        <h3 className="text-lg font-bold text-slate-50 mb-4">
          {workflow ? '워크플로우 수정' : '워크플로우 생성'}
        </h3>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-slate-500 mb-1">이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="워크플로우 이름"
            className={inputClass}
            data-testid="workflow-name-input"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 mb-1">설명 (선택)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="워크플로우 설명"
            rows={2}
            className={inputClass}
            data-testid="workflow-desc-input"
          />
        </div>

        {/* Steps */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-500">단계 ({steps.length}/20)</label>
            {steps.length < 20 && (
              <button
                type="button"
                onClick={addStep}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                + 단계 추가
              </button>
            )}
          </div>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 space-y-2" data-testid={`form-step-${idx}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">단계 {idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                      className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 px-1"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === steps.length - 1}
                      className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 px-1"
                    >
                      ↓
                    </button>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="text-xs text-red-400 hover:text-red-300 px-1"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={step.name}
                    onChange={e => updateStep(idx, { name: e.target.value })}
                    placeholder="단계 이름"
                    className={inputClass}
                  />
                  <select
                    value={step.type}
                    onChange={e => updateStep(idx, { type: e.target.value as WorkflowStep['type'] })}
                    className={selectClass}
                  >
                    <option value="tool">Tool</option>
                    <option value="llm">LLM</option>
                    <option value="condition">Condition</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={step.action}
                  onChange={e => updateStep(idx, { action: e.target.value })}
                  placeholder="액션 (도구 이름 또는 프롬프트)"
                  className={inputClass}
                />
                {step.type === 'llm' && (
                  <textarea
                    value={step.systemPrompt || ''}
                    onChange={e => updateStep(idx, { systemPrompt: e.target.value })}
                    placeholder="시스템 프롬프트 (선택)"
                    rows={2}
                    className={inputClass}
                  />
                )}
                {step.type === 'condition' && (
                  <p className="text-[10px] text-slate-500">조건 분기는 trueBranch/falseBranch로 연결됩니다</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-slate-400 border border-slate-600 rounded-lg hover:bg-slate-700"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            data-testid="submit-workflow-btn"
          >
            {isPending ? '처리 중...' : workflow ? '수정' : '생성'}
          </button>
        </div>
      </div>
    </div>
  )
}
