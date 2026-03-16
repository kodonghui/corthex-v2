// API Endpoints:
// GET    /workspace/workflows?page=&limit=
// GET    /workspace/workflows/:id
// POST   /workspace/workflows { name, description?, steps }
// PUT    /workspace/workflows/:id { name?, description?, steps? }
// DELETE /workspace/workflows/:id
// POST   /workspace/workflows/:id/execute
// GET    /workspace/workflows/:id/executions?page=
// GET    /workspace/workflow-suggestions
// POST   /workspace/workflow-suggestions/:id/accept
// POST   /workspace/workflow-suggestions/:id/reject

import { useState } from 'react'
import { toast } from '@corthex/ui'
import type { WorkflowStep, Workflow, WorkflowExecution, WorkflowStepSummary, WorkflowSuggestion } from '@corthex/shared'
import { useWorkflows, useWorkflowDetail, useWorkflowExecutions, useWorkflowSuggestions, useWorkflowMutations } from '../hooks/use-queries'

// === Constants ===

const STEP_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  tool: { label: 'Tool', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  llm: { label: 'LLM', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  condition: { label: 'Condition', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
}

const EXEC_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  success: { label: '성공', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  failed: { label: '실패', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

type TabKey = 'workflows' | 'suggestions'

// === Main Page ===

export function WorkflowsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [executionsPage, setExecutionsPage] = useState(1)

  // --- Queries ---
  const { data: workflowsData, isLoading } = useWorkflows(1, 100)
  const { data: detailData, isLoading: detailLoading } = useWorkflowDetail(selectedWorkflow ?? undefined)
  const { data: executionsData } = useWorkflowExecutions(selectedWorkflow ?? undefined, executionsPage)
  const { data: suggestionsData, isLoading: suggestionsLoading } = useWorkflowSuggestions()

  // --- Mutations ---
  const { create: createMutation, update: updateMutation, remove: deleteMutation, execute: executeMutation, acceptSuggestion, rejectSuggestion } = useWorkflowMutations()

  const handleCreate = (body: { name: string; description?: string; steps: WorkflowStep[] }) => {
    createMutation.mutate(body, {
      onSuccess: () => { setShowCreateModal(false); setEditingWorkflow(null); toast.success('워크플로우가 생성되었습니다') },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleUpdate = (data: { id: string; name?: string; description?: string; steps?: WorkflowStep[] }) => {
    updateMutation.mutate(data, {
      onSuccess: () => { setShowCreateModal(false); setEditingWorkflow(null); toast.success('워크플로우가 수정되었습니다') },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => { setDeleteTarget(null); if (selectedWorkflow === id) setSelectedWorkflow(null); toast.success('워크플로우가 삭제되었습니다') },
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleExecute = (id: string) => {
    executeMutation.mutate(id, {
      onSuccess: () => toast.success('워크플로우가 실행되었습니다'),
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleAcceptSuggestion = (id: string) => {
    acceptSuggestion.mutate(id, {
      onSuccess: () => toast.success('제안이 수락되었습니다'),
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const handleRejectSuggestion = (id: string) => {
    rejectSuggestion.mutate(id, {
      onSuccess: () => toast.success('제안이 거절되었습니다'),
      onError: (err: Error) => toast.error(err.message),
    })
  }

  const workflows = workflowsData?.data || []
  const suggestions = suggestionsData?.data || []
  const detail = detailData?.data || null
  const executions = executionsData?.data || []
  const executionsMeta = executionsData?.meta

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'workflows', label: 'Workflows', count: workflows.length },
    { key: 'suggestions', label: 'Suggestions', count: suggestions.length },
  ]

  function openEdit(wf: Workflow) {
    setEditingWorkflow(wf)
    setShowCreateModal(true)
  }

  // --- Detail view ---
  if (selectedWorkflow) {
    return (
      <div className="flex h-screen w-full" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
        {/* Sidebar */}
        <div className="w-64 text-white flex flex-col h-full flex-shrink-0 z-20 shadow-lg" style={{ backgroundColor: '#e57373' }}>
          <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: '#4a5d23' }}>
            <span className="material-symbols-outlined text-2xl">hub</span>
            <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Workflows</h2>
          </div>
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 aspect-square rounded-full" style={{ width: '40px', height: '40px' }}></div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>CORTHEX v2</h1>
                <p className="text-xs" style={{ color: '#c5d8a4' }}>Workflow Manager</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              <button
                onClick={() => { setSelectedWorkflow(null); setExecutionsPage(1) }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="material-symbols-outlined text-xl">arrow_back</span>
                <span className="text-sm font-medium">Back to List</span>
              </button>
              <button
                className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-inner"
                style={{ backgroundColor: '#4a5d23' }}
              >
                <span className="material-symbols-outlined text-xl">account_tree</span>
                <span className="text-sm font-medium">{detailLoading ? '...' : detail?.name || 'Workflow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: '#fcfbf9' }}>
          {/* Header */}
          <header className="border-b px-8 py-6 flex items-center justify-between" style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedWorkflow(null); setExecutionsPage(1) }}
                className="text-sm min-h-[44px] flex items-center px-3 transition-colors"
                style={{ color: '#9c8d66' }}
              >
                ← 목록
              </button>
              <h2 className="text-xl font-semibold" style={{ color: '#463e30', fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
                {detailLoading ? '...' : detail?.name || 'Workflow'}
              </h2>
            </div>
            {detail && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecute(detail.id)}
                  disabled={executeMutation.isPending}
                  className="text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: '#e07a5f' }}
                  data-testid="execute-btn"
                >
                  {executeMutation.isPending ? '실행 중...' : '실행'}
                </button>
                <button
                  onClick={() => openEdit(detail)}
                  className="border rounded-lg px-4 py-2 text-sm transition-colors"
                  style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
                  data-testid="edit-workflow-btn"
                >
                  편집
                </button>
                <button
                  onClick={() => setDeleteTarget(detail.id)}
                  className="text-sm px-3 py-2 transition-colors"
                  style={{ color: '#ef4444' }}
                  data-testid="delete-workflow-btn"
                >
                  삭제
                </button>
              </div>
            )}
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {detailLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl" style={{ backgroundColor: '#f2f0e9' }} />)}
              </div>
            ) : detail ? (
              <div className="max-w-3xl space-y-6">
                {/* Description */}
                {detail.description && (
                  <p className="text-sm" style={{ color: '#9c8d66' }}>{detail.description}</p>
                )}

                {/* Steps visualization */}
                <div>
                  <h3 className="text-sm font-medium mb-3" style={{ color: '#9c8d66' }}>단계 ({detail.steps.length})</h3>
                  <div className="space-y-2">
                    {(detail.steps as WorkflowStep[]).map((step, idx) => {
                      const typeInfo = STEP_TYPE_LABELS[step.type] || STEP_TYPE_LABELS.tool
                      return (
                        <div key={step.id} className="flex items-start gap-3" data-testid={`step-${idx}`}>
                          <div className="flex flex-col items-center">
                            <div
                              className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono"
                              style={{ backgroundColor: '#fcfbf9', borderColor: '#e8e4d9', color: '#9c8d66' }}
                            >
                              {idx + 1}
                            </div>
                            {idx < detail.steps.length - 1 && (
                              <div className="w-px h-6 mt-1" style={{ backgroundColor: '#e8e4d9' }} />
                            )}
                          </div>
                          <div className="flex-1 border rounded-lg p-4" style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}
                              >
                                {typeInfo.label}
                              </span>
                              <span className="text-sm font-medium" style={{ color: '#463e30' }}>{step.name}</span>
                            </div>
                            <p className="text-xs font-mono" style={{ color: '#9c8d66' }}>{step.action}</p>
                            {step.dependsOn && step.dependsOn.length > 0 && (
                              <p className="text-[10px] mt-1" style={{ color: '#b7aa88' }}>
                                의존: {step.dependsOn.map(depId => {
                                  const depStep = (detail.steps as WorkflowStep[]).find(s => s.id === depId)
                                  return depStep?.name || depId.slice(0, 8)
                                }).join(', ')}
                              </p>
                            )}
                            {step.timeout && (
                              <p className="text-[10px] mt-0.5" style={{ color: '#b7aa88' }}>타임아웃: {(step.timeout / 1000).toFixed(0)}초</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Execution history */}
                <div>
                  <h3 className="text-sm font-medium mb-3" style={{ color: '#9c8d66' }}>실행 이력</h3>
                  {executions.length === 0 ? (
                    <p className="text-xs" style={{ color: '#b7aa88' }}>아직 실행 이력이 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {executions.map(exec => {
                        const statusInfo = EXEC_STATUS[exec.status] || EXEC_STATUS.failed
                        return (
                          <ExecutionCard key={exec.id} execution={exec} statusInfo={statusInfo} />
                        )
                      })}
                      {executionsMeta && executionsMeta.total > 10 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            onClick={() => setExecutionsPage(p => Math.max(1, p - 1))}
                            disabled={executionsPage <= 1}
                            className="text-xs disabled:opacity-30"
                            style={{ color: '#9c8d66' }}
                          >
                            이전
                          </button>
                          <span className="text-xs" style={{ color: '#b7aa88' }}>
                            {executionsPage} / {Math.ceil(executionsMeta.total / 10)}
                          </span>
                          <button
                            onClick={() => setExecutionsPage(p => p + 1)}
                            disabled={executionsPage >= Math.ceil(executionsMeta.total / 10)}
                            className="text-xs disabled:opacity-30"
                            style={{ color: '#9c8d66' }}
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
        </div>

        {/* Delete confirm */}
        {deleteTarget && (
          <DeleteConfirmModal
            onConfirm={() => handleDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}

        {/* Edit modal */}
        {showCreateModal && (
          <WorkflowFormModal
            workflow={editingWorkflow}
            isPending={createMutation.isPending || updateMutation.isPending}
            onSubmit={(data) => {
              if (editingWorkflow) {
                handleUpdate({ id: editingWorkflow.id, ...data })
              } else {
                handleCreate(data)
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
    <div className="flex h-screen w-full" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col h-full flex-shrink-0 z-20 shadow-lg" style={{ backgroundColor: '#e57373' }}>
        <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: '#4a5d23' }}>
          <span className="material-symbols-outlined text-2xl">hub</span>
          <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>Workflows</h2>
        </div>
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 aspect-square rounded-full" style={{ width: '40px', height: '40px' }}></div>
            <div className="flex flex-col">
              <h1 className="text-base font-bold" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>CORTHEX v2</h1>
              <p className="text-xs" style={{ color: '#c5d8a4' }}>Workflow Manager</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-inner"
              style={{ backgroundColor: '#4a5d23' }}
            >
              <span className="material-symbols-outlined text-xl">account_tree</span>
              <span className="text-sm font-medium">All Workflows</span>
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
              style={{ backgroundColor: activeTab === 'suggestions' ? '#4a5d23' : 'transparent' }}
              onMouseEnter={e => { if (activeTab !== 'suggestions') e.currentTarget.style.backgroundColor = '#6a8454' }}
              onMouseLeave={e => { if (activeTab !== 'suggestions') e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span className="material-symbols-outlined text-xl">tips_and_updates</span>
              <span className="text-sm font-medium">Suggestions</span>
              {suggestions.length > 0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#e07a5f' }}>
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="mt-auto p-6 flex flex-col gap-1 border-t" style={{ borderColor: '#4a5d23' }}>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined text-xl">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: '#fcfbf9' }}>
        {/* Header */}
        <header className="border-b px-8 py-6" style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", color: '#463e30' }}>Workflows</h1>
              <p className="text-sm mt-1" style={{ color: '#9c8d66' }}>
                자동화 워크플로우를 관리하세요
              </p>
            </div>
            <button
              onClick={() => { setEditingWorkflow(null); setShowCreateModal(true) }}
              className="text-white rounded-2xl px-4 py-2 text-sm font-medium shadow-md transition-colors"
              style={{ backgroundColor: '#e07a5f' }}
              data-testid="create-workflow-btn"
            >
              + 워크플로우 생성
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b mt-8 gap-8" style={{ borderColor: '#e8e4d9' }} data-testid="workflow-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="pb-3 text-sm transition-colors"
                style={activeTab === t.key
                  ? { fontWeight: 600, borderBottom: '2px solid #2c2c2c', color: '#463e30' }
                  : { fontWeight: 500, color: '#9c8d66', borderBottom: '2px solid transparent' }
                }
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#f2f0e9', color: '#9c8d66' }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-2xl space-y-3">
            {/* Workflows tab */}
            {activeTab === 'workflows' && (
              isLoading ? (
                <div className="space-y-3" data-testid="workflows-loading">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl" style={{ backgroundColor: '#f2f0e9' }} />)}
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-16" data-testid="workflows-empty">
                  <p className="text-sm" style={{ color: '#9c8d66' }}>아직 워크플로우가 없습니다</p>
                  <p className="text-xs mt-1" style={{ color: '#b7aa88' }}>새 워크플로우를 생성해보세요</p>
                </div>
              ) : (
                workflows.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedWorkflow(wf.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedWorkflow(wf.id) } }}
                    className="border rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md"
                    style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }}
                    data-testid={`workflow-item-${wf.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate" style={{ color: '#463e30' }}>{wf.name}</h3>
                        {wf.description && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: '#9c8d66' }}>{wf.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono" style={{ color: '#b7aa88' }}>
                          <span>{(wf.steps as WorkflowStep[]).length}개 단계</span>
                          <span>{new Date(wf.updatedAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(wf) }}
                          className="text-xs min-h-[44px] px-3 flex items-center transition-colors"
                          style={{ color: '#9c8d66' }}
                        >
                          편집
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(wf.id) }}
                          className="text-xs min-h-[44px] px-3 flex items-center"
                          style={{ color: '#ef4444' }}
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
                  {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl" style={{ backgroundColor: '#f2f0e9' }} />)}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-16" data-testid="suggestions-empty">
                  <p className="text-sm" style={{ color: '#9c8d66' }}>대기 중인 자동 제안이 없습니다</p>
                  <p className="text-xs mt-1" style={{ color: '#b7aa88' }}>반복적인 도구 사용 패턴이 감지되면 자동으로 제안됩니다</p>
                </div>
              ) : (
                suggestions.map(sg => (
                  <div
                    key={sg.id}
                    className="border rounded-xl p-4"
                    style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }}
                    data-testid={`suggestion-item-${sg.id}`}
                  >
                    <p className="text-sm mb-2" style={{ color: '#463e30' }}>{sg.reason}</p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {(sg.suggestedSteps as WorkflowStep[]).map((step, i) => (
                        <span key={step.id} className="inline-flex items-center gap-1">
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#f2f0e9', color: '#6a5d43' }}>{step.action}</span>
                          {i < sg.suggestedSteps.length - 1 && <span className="text-xs" style={{ color: '#d1c9b2' }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptSuggestion(sg.id)}
                        disabled={acceptSuggestion.isPending}
                        className="text-white rounded-lg px-3 py-1.5 text-xs font-medium disabled:opacity-50 min-h-[44px]"
                        style={{ backgroundColor: '#e57373' }}
                      >
                        수락
                      </button>
                      <button
                        onClick={() => handleRejectSuggestion(sg.id)}
                        disabled={rejectSuggestion.isPending}
                        className="border rounded-lg px-3 py-1.5 text-xs disabled:opacity-50 min-h-[44px]"
                        style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}
                      >
                        거절
                      </button>
                      <span className="text-[10px] ml-auto font-mono" style={{ color: '#b7aa88' }}>
                        {new Date(sg.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Create/Edit modal */}
      {showCreateModal && (
        <WorkflowFormModal
          workflow={editingWorkflow}
          isPending={createMutation.isPending || updateMutation.isPending}
          onSubmit={(data) => {
            if (editingWorkflow) {
              handleUpdate({ id: editingWorkflow.id, ...data })
            } else {
              handleCreate(data)
            }
          }}
          onClose={() => { setShowCreateModal(false); setEditingWorkflow(null) }}
        />
      )}
    </div>
  )
}

// === Execution Card ===

function ExecutionCard({ execution, statusInfo }: { execution: WorkflowExecution; statusInfo: { label: string; color: string; bg: string } }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#e8e4d9' }} data-testid={`execution-${execution.id}`}>
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded) } }}
        style={{ backgroundColor: expanded ? '#fcfbf9' : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>{statusInfo.label}</span>
          <span className="text-xs font-mono" style={{ color: '#9c8d66' }}>
            {(execution.totalDurationMs / 1000).toFixed(1)}초
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: '#b7aa88' }}>
            {new Date(execution.createdAt).toLocaleString('ko-KR', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </span>
          <span className="text-xs" style={{ color: '#b7aa88' }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: '#f2f0e9' }}>
          {(execution.stepSummaries as WorkflowStepSummary[]).map((step) => (
            <div key={step.stepId} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: step.status === 'completed' || step.status === 'success' ? '#10b981' : step.status === 'failed' ? '#ef4444' : '#d1c9b2',
                  }}
                />
                <span style={{ color: '#2c2c2c' }}>{step.stepName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono" style={{ color: '#b7aa88' }}>{(step.durationMs / 1000).toFixed(1)}초</span>
                {step.error && (
                  <span className="truncate max-w-[200px]" style={{ color: '#ef4444' }} title={step.error}>{step.error}</span>
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel() }}
    >
      <div
        className="rounded-2xl shadow-2xl p-6 w-96 mx-4"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e8e4d9' }}
        tabIndex={-1}
        data-testid="delete-confirm-modal"
      >
        <h3 id="delete-modal-title" className="text-sm font-semibold mb-2" style={{ color: '#463e30' }}>워크플로우 삭제</h3>
        <p className="text-xs mb-4" style={{ color: '#9c8d66' }}>이 워크플로우를 삭제하시겠습니까?</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="border rounded-lg px-4 py-2 text-sm" style={{ borderColor: '#e8e4d9', color: '#6a5d43' }}>취소</button>
          <button onClick={onConfirm} className="text-white rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#ef4444' }}>삭제</button>
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

  const inputStyle = { backgroundColor: '#fcfbf9', borderColor: '#e8e4d9', color: '#463e30' }

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
    const validSteps = steps.filter(s => s.name?.trim() && s.action.trim())
    if (validSteps.length === 0) return
    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      steps: validSteps,
    })
  }

  const isValid = name.trim() && steps.some(s => s.name?.trim() && s.action.trim())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="workflow-form-modal-title"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-xl w-full mx-4 p-6 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e8e4d9' }}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        data-testid="workflow-form-modal"
      >
        <h3 id="workflow-form-modal-title" className="text-lg font-bold mb-4" style={{ color: '#463e30', fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>
          {workflow ? '워크플로우 수정' : '워크플로우 생성'}
        </h3>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1" style={{ color: '#9c8d66' }}>이름</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="워크플로우 이름"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1"
            style={inputStyle}
            data-testid="workflow-name-input"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1" style={{ color: '#9c8d66' }}>설명 (선택)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="워크플로우 설명"
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1"
            style={inputStyle}
            data-testid="workflow-desc-input"
          />
        </div>

        {/* Steps */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: '#9c8d66' }}>단계 ({steps.length}/20)</label>
            {steps.length < 20 && (
              <button
                type="button"
                onClick={addStep}
                className="text-xs"
                style={{ color: '#e57373' }}
              >
                + 단계 추가
              </button>
            )}
          </div>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="border rounded-lg p-3 space-y-2" style={{ backgroundColor: '#fcfbf9', borderColor: '#e8e4d9' }} data-testid={`form-step-${idx}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]" style={{ color: '#b7aa88' }}>단계 {idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveStep(idx, -1)}
                      disabled={idx === 0}
                      className="text-xs disabled:opacity-30 px-1"
                      style={{ color: '#9c8d66' }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(idx, 1)}
                      disabled={idx === steps.length - 1}
                      className="text-xs disabled:opacity-30 px-1"
                      style={{ color: '#9c8d66' }}
                    >
                      ↓
                    </button>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="text-xs px-1"
                        style={{ color: '#ef4444' }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={step.name || ''}
                    onChange={e => updateStep(idx, { name: e.target.value })}
                    placeholder="단계 이름"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                  <select
                    value={step.type}
                    onChange={e => updateStep(idx, { type: e.target.value as WorkflowStep['type'] })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none appearance-none"
                    style={inputStyle}
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
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
                {step.type === 'llm' && (
                  <textarea
                    value={step.systemPrompt || ''}
                    onChange={e => updateStep(idx, { systemPrompt: e.target.value })}
                    placeholder="시스템 프롬프트 (선택)"
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                )}
                {step.type === 'condition' && (
                  <p className="text-[10px]" style={{ color: '#b7aa88' }}>조건 분기는 trueBranch/falseBranch로 연결됩니다</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium border rounded-lg transition-colors"
            style={{ borderColor: '#e8e4d9', color: '#9c8d66' }}
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="flex-1 py-2.5 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: '#e57373' }}
            data-testid="submit-workflow-btn"
          >
            {isPending ? '처리 중...' : workflow ? '수정' : '생성'}
          </button>
        </div>
      </div>
    </div>
  )
}
