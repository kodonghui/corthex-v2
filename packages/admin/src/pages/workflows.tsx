import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { useToastStore } from '../stores/toast-store'
import { WorkflowCanvas, type WorkflowStep } from '../components/workflow-canvas'

// === Types ===

export type { WorkflowStep }

type Workflow = {
  id: string
  companyId: string
  name: string
  description: string | null
  steps: WorkflowStep[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

type Suggestion = {
  id: string
  reason: string
  suggestedSteps: WorkflowStep[]
  status: string
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

type Execution = {
  id: string
  companyId: string
  workflowId: string
  status: 'success' | 'failed'
  totalDurationMs: number
  stepSummaries: StepSummary[]
  triggeredBy: string | null
  createdAt: string
}

type Tab = 'list' | 'suggestions'

// === Helpers ===

function uuid() {
  return crypto.randomUUID()
}

function emptyStep(): WorkflowStep {
  return { id: uuid(), name: '', type: 'tool', action: '' }
}

/** Topological sort into layers using Kahn's algorithm. Exported for testing. */
export function buildDagLayers(steps: WorkflowStep[]): WorkflowStep[][] {
  if (steps.length === 0) return []

  const inDegree = new Map(steps.map((s) => [s.id, 0]))

  for (const s of steps) {
    for (const dep of s.dependsOn || []) {
      if (inDegree.has(dep)) {
        inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1)
      }
    }
  }

  const result: WorkflowStep[][] = []
  let queue = steps.filter((s) => (inDegree.get(s.id) || 0) === 0)

  while (queue.length > 0) {
    result.push(queue)
    const nextQueue: WorkflowStep[] = []
    for (const s of queue) {
      for (const other of steps) {
        if (other.dependsOn?.includes(s.id)) {
          const newDeg = (inDegree.get(other.id) || 0) - 1
          inDegree.set(other.id, newDeg)
          if (newDeg === 0) nextQueue.push(other)
        }
      }
    }
    queue = nextQueue
  }

  return result
}

const stepTypeLabels: Record<string, string> = {
  tool: 'Tool',
  llm: 'LLM',
  condition: 'Condition',
}

const stepTypeColors: Record<string, string> = {
  tool: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  llm: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  condition: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
}

// === Main Page ===

export function WorkflowsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)

  const [tab, setTab] = useState<Tab>('list')
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [creating, setCreating] = useState(false)
  const [viewingExecutions, setViewingExecutions] = useState<Workflow | null>(null)

  // Fetch workflows
  const { data: wfData, isLoading } = useQuery({
    queryKey: ['workflows', selectedCompanyId],
    queryFn: () => api.get<{ data: Workflow[]; meta: { total: number } }>('/workspace/workflows?limit=100'),
    enabled: !!selectedCompanyId,
  })

  // Fetch suggestions
  const { data: sugData } = useQuery({
    queryKey: ['workflow-suggestions', selectedCompanyId],
    queryFn: () => api.get<{ data: Suggestion[]; meta: { total: number } }>('/workspace/workflows/suggestions?limit=100'),
    enabled: !!selectedCompanyId,
  })

  // Delete mutation
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/workflows/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      addToast({ type: 'success', message: '워크플로우가 삭제되었습니다' })
    },
    onError: (e: Error) => addToast({ type: 'error', message: e.message }),
  })

  // Accept suggestion
  const acceptMut = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/workflows/suggestions/${id}/accept`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflows'] })
      qc.invalidateQueries({ queryKey: ['workflow-suggestions'] })
      addToast({ type: 'success', message: '제안이 수락되어 워크플로우가 생성되었습니다' })
    },
    onError: (e: Error) => addToast({ type: 'error', message: e.message }),
  })

  // Reject suggestion
  const rejectMut = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/workflows/suggestions/${id}/reject`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workflow-suggestions'] })
      addToast({ type: 'success', message: '제안이 거절되었습니다' })
    },
    onError: (e: Error) => addToast({ type: 'error', message: e.message }),
  })

  // Analyze patterns
  const analyzeMut = useMutation({
    mutationFn: () => api.post<{ data: { patternsFound: number; suggestionsCreated: number } }>('/workspace/workflows/analyze', {}),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['workflow-suggestions'] })
      addToast({ type: 'success', message: `패턴 분석 완료: ${res.data.patternsFound}개 패턴, ${res.data.suggestionsCreated}개 새 제안` })
    },
    onError: (e: Error) => addToast({ type: 'error', message: e.message }),
  })

  // Execute workflow (from list view)
  const executeMut = useMutation({
    mutationFn: (id: string) => api.post<{ data: { executionId: string; status: string; totalDurationMs: number; stepSummaries: StepSummary[] } }>(`/workspace/workflows/${id}/execute`, {}),
    onSuccess: (res, id) => {
      const d = res.data
      addToast({ type: d.status === 'success' ? 'success' : 'error', message: `실행 ${d.status === 'success' ? '성공' : '실패'} (${(d.totalDurationMs / 1000).toFixed(1)}초)` })
      qc.invalidateQueries({ queryKey: ['workflow-executions', id] })
    },
    onError: (e: Error) => addToast({ type: 'error', message: e.message }),
  })

  const workflows = wfData?.data || []
  const suggestions = sugData?.data || []

  if (!selectedCompanyId) {
    return <div className="text-zinc-500 dark:text-zinc-400">회사를 선택해주세요</div>
  }

  if (viewingExecutions) {
    return (
      <ExecutionHistory
        workflow={viewingExecutions}
        onClose={() => setViewingExecutions(null)}
      />
    )
  }

  if (editingWorkflow || creating) {
    return (
      <WorkflowEditor
        workflow={editingWorkflow}
        onClose={() => { setEditingWorkflow(null); setCreating(false) }}
        onSaved={() => {
          setEditingWorkflow(null)
          setCreating(false)
          qc.invalidateQueries({ queryKey: ['workflows'] })
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">워크플로우 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={() => analyzeMut.mutate()}
            disabled={analyzeMut.isPending}
            className="px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            {analyzeMut.isPending ? '분석 중...' : '패턴 분석'}
          </button>
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            + 새 워크플로우
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setTab('list')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'list'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          워크플로우 ({workflows.length})
        </button>
        <button
          onClick={() => setTab('suggestions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === 'suggestions'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          제안 ({suggestions.length})
        </button>
      </div>

      {/* Workflow List */}
      {tab === 'list' && (
        <div className="space-y-3">
          {isLoading && <p className="text-zinc-500">로딩 중...</p>}
          {!isLoading && workflows.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <p className="text-lg mb-2">워크플로우가 없습니다</p>
              <p className="text-sm">새 워크플로우를 만들거나 패턴 분석으로 자동 제안을 받아보세요.</p>
            </div>
          )}
          {workflows.map((wf) => (
            <div
              key={wf.id}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{wf.name}</h3>
                  {wf.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{wf.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                    <span className={wf.isActive ? 'text-green-600 dark:text-green-400' : 'text-zinc-400'}>
                      {wf.isActive ? '활성' : '비활성'}
                    </span>
                    <span>{wf.steps.length}개 스텝</span>
                    <span>{new Date(wf.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  {/* Mini DAG */}
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {wf.steps.map((step, idx) => (
                      <span key={step.id} className="flex items-center gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${stepTypeColors[step.type]}`}>
                          {step.action}
                        </span>
                        {idx < wf.steps.length - 1 && (
                          <span className="text-zinc-400 text-xs">→</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 ml-4 flex-col">
                  <div className="flex gap-2">
                    <button
                      onClick={() => executeMut.mutate(wf.id)}
                      disabled={executeMut.isPending}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {executeMut.isPending ? '실행 중...' : '실행'}
                    </button>
                    <button
                      onClick={() => setViewingExecutions(wf)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      이력
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingWorkflow(wf)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      편집
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('정말 삭제하시겠습니까?')) deleteMut.mutate(wf.id)
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {tab === 'suggestions' && (
        <div className="space-y-3">
          {suggestions.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              <p className="text-lg mb-2">제안이 없습니다</p>
              <p className="text-sm">"패턴 분석" 버튼을 눌러 반복 패턴을 감지해보세요.</p>
            </div>
          )}
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{sug.reason}</p>
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {(sug.suggestedSteps || []).map((step, idx) => (
                  <span key={step.id} className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${stepTypeColors[step.type] || 'bg-zinc-100 text-zinc-700'}`}>
                      {step.action}
                    </span>
                    {idx < sug.suggestedSteps.length - 1 && (
                      <span className="text-zinc-400 text-xs">→</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => acceptMut.mutate(sug.id)}
                  disabled={acceptMut.isPending}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  수락
                </button>
                <button
                  onClick={() => rejectMut.mutate(sug.id)}
                  disabled={rejectMut.isPending}
                  className="px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  거절
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// === Workflow Editor (Create / Edit) ===

function WorkflowEditor({
  workflow,
  onClose,
  onSaved,
}: {
  workflow: Workflow | null
  onClose: () => void
  onSaved: () => void
}) {
  const addToast = useToastStore((s) => s.addToast)

  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const [steps, setSteps] = useState<WorkflowStep[]>(
    workflow?.steps.length ? workflow.steps : [emptyStep()]
  )
  const [saving, setSaving] = useState(false)
  const [editorMode, setEditorMode] = useState<'canvas' | 'form'>('canvas')

  const isEditing = !!workflow

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, emptyStep()])
  }, [])

  const removeStep = useCallback((idx: number) => {
    setSteps((prev) => {
      const removed = prev[idx]
      return prev
        .filter((_, i) => i !== idx)
        .map((s) => ({
          ...s,
          dependsOn: s.dependsOn?.filter((d) => d !== removed.id),
          trueBranch: s.trueBranch === removed.id ? undefined : s.trueBranch,
          falseBranch: s.falseBranch === removed.id ? undefined : s.falseBranch,
        }))
    })
  }, [])

  const updateStep = useCallback((idx: number, partial: Partial<WorkflowStep>) => {
    setSteps((prev) => prev.map((s, i) => (i === idx ? { ...s, ...partial } : s)))
  }, [])

  const moveStep = useCallback((idx: number, dir: -1 | 1) => {
    setSteps((prev) => {
      const arr = [...prev]
      const target = idx + dir
      if (target < 0 || target >= arr.length) return prev
      ;[arr[idx], arr[target]] = [arr[target], arr[idx]]
      return arr
    })
  }, [])

  const handleSave = async () => {
    if (!name.trim()) {
      addToast({ type: 'error', message: '이름을 입력해주세요' })
      return
    }
    if (steps.some((s) => !s.name.trim() || !s.action.trim())) {
      addToast({ type: 'error', message: '모든 스텝의 이름과 액션을 입력해주세요' })
      return
    }

    setSaving(true)
    try {
      if (isEditing) {
        await api.put(`/workspace/workflows/${workflow.id}`, { name, description: description || undefined, steps })
        addToast({ type: 'success', message: '워크플로우가 수정되었습니다' })
      } else {
        await api.post('/workspace/workflows', { name, description: description || undefined, steps })
        addToast({ type: 'success', message: '워크플로우가 생성되었습니다' })
      }
      onSaved()
    } catch (e: unknown) {
      addToast({ type: 'error', message: e instanceof Error ? e.message : '저장 실패' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isEditing ? '워크플로우 편집' : '새 워크플로우'}
        </h1>
        <div className="flex items-center gap-3">
          {/* Canvas/Form mode toggle */}
          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-600 overflow-hidden">
            <button
              onClick={() => setEditorMode('canvas')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                editorMode === 'canvas'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              캔버스
            </button>
            <button
              onClick={() => setEditorMode('form')}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                editorMode === 'form'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              폼
            </button>
          </div>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ← 목록으로
          </button>
        </div>
      </div>

      {/* Name & Description */}
      <div className="space-y-4 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">이름 *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="예: 일일 리포트 생성 파이프라인"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none resize-none"
            placeholder="워크플로우 설명 (선택)"
          />
        </div>
      </div>

      {/* Canvas Mode */}
      {editorMode === 'canvas' && (
        <WorkflowCanvas steps={steps} onChange={setSteps} onSave={handleSave} />
      )}

      {/* Form Mode (original) */}
      {editorMode === 'form' && (
        <>
          {/* DAG Visualization */}
          <DagPreview steps={steps} />

          {/* Step Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">스텝 ({steps.length})</h2>
              <button
                onClick={addStep}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + 스텝 추가
              </button>
            </div>

            {steps.map((step, idx) => (
              <StepForm
                key={step.id}
                step={step}
                index={idx}
                allSteps={steps}
                onUpdate={(partial) => updateStep(idx, partial)}
                onRemove={() => removeStep(idx)}
                onMove={(dir) => moveStep(idx, dir)}
                isFirst={idx === 0}
                isLast={idx === steps.length - 1}
              />
            ))}
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : isEditing ? '수정' : '생성'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              취소
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// === Step Form ===

function StepForm({
  step,
  index,
  allSteps,
  onUpdate,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: {
  step: WorkflowStep
  index: number
  allSteps: WorkflowStep[]
  onUpdate: (partial: Partial<WorkflowStep>) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  isFirst: boolean
  isLast: boolean
}) {
  const otherSteps = allSteps.filter((s) => s.id !== step.id)

  return (
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">#{index + 1}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stepTypeColors[step.type]}`}>
            {stepTypeLabels[step.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={isFirst} className="p-1 text-xs text-zinc-400 hover:text-zinc-600 disabled:opacity-30">▲</button>
          <button onClick={() => onMove(1)} disabled={isLast} className="p-1 text-xs text-zinc-400 hover:text-zinc-600 disabled:opacity-30">▼</button>
          <button onClick={onRemove} className="p-1 text-xs text-red-400 hover:text-red-600 ml-2">✕</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">이름 *</label>
          <input
            value={step.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="스텝 이름"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">타입</label>
          <select
            value={step.type}
            onChange={(e) => onUpdate({ type: e.target.value as WorkflowStep['type'] })}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
          >
            <option value="tool">Tool</option>
            <option value="llm">LLM</option>
            <option value="condition">Condition</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">액션 *</label>
          <input
            value={step.action}
            onChange={(e) => onUpdate({ action: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            placeholder={step.type === 'tool' ? 'search_web' : step.type === 'llm' ? 'summarize' : 'check_result'}
          />
        </div>
      </div>

      {/* Type-specific fields */}
      {step.type === 'llm' && (
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">시스템 프롬프트</label>
          <textarea
            value={step.systemPrompt || ''}
            onChange={(e) => onUpdate({ systemPrompt: e.target.value || undefined })}
            rows={2}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="LLM에게 전달할 시스템 프롬프트"
          />
        </div>
      )}

      {step.type === 'condition' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">True Branch</label>
            <select
              value={step.trueBranch || ''}
              onChange={(e) => onUpdate({ trueBranch: e.target.value || undefined })}
              className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            >
              <option value="">선택 없음</option>
              {otherSteps.map((s) => (
                <option key={s.id} value={s.id}>{s.name || s.action || s.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1">False Branch</label>
            <select
              value={step.falseBranch || ''}
              onChange={(e) => onUpdate({ falseBranch: e.target.value || undefined })}
              className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            >
              <option value="">선택 없음</option>
              {otherSteps.map((s) => (
                <option key={s.id} value={s.id}>{s.name || s.action || s.id.slice(0, 8)}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* DependsOn */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 mb-1">의존 스텝 (dependsOn)</label>
        <div className="flex flex-wrap gap-2">
          {otherSteps.map((s) => {
            const isSelected = step.dependsOn?.includes(s.id)
            return (
              <button
                key={s.id}
                onClick={() => {
                  const current = step.dependsOn || []
                  onUpdate({
                    dependsOn: isSelected
                      ? current.filter((d) => d !== s.id)
                      : [...current, s.id],
                  })
                }}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  isSelected
                    ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : 'border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:border-zinc-400'
                }`}
              >
                {s.name || s.action || s.id.slice(0, 8)}
              </button>
            )
          })}
          {otherSteps.length === 0 && (
            <span className="text-xs text-zinc-400">다른 스텝이 없습니다</span>
          )}
        </div>
      </div>

      {/* Advanced: timeout, retryCount */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">타임아웃 (ms)</label>
          <input
            type="number"
            value={step.timeout || ''}
            onChange={(e) => onUpdate({ timeout: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="30000"
            min={1000}
            max={300000}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">재시도 횟수</label>
          <input
            type="number"
            value={step.retryCount ?? ''}
            onChange={(e) => onUpdate({ retryCount: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-2 py-1.5 text-sm border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="0"
            min={0}
            max={3}
          />
        </div>
      </div>
    </div>
  )
}

// === Execution History ===

function ExecutionHistory({
  workflow,
  onClose,
}: {
  workflow: Workflow
  onClose: () => void
}) {
  const addToast = useToastStore((s) => s.addToast)
  const qc = useQueryClient()
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null)

  const { data: execData, isLoading } = useQuery({
    queryKey: ['workflow-executions', workflow.id],
    queryFn: () => api.get<{ data: Execution[]; meta: { total: number } }>(`/workspace/workflows/${workflow.id}/executions?limit=50`),
  })

  const executeMut = useMutation({
    mutationFn: () => api.post<{ data: { executionId: string; status: string; totalDurationMs: number; stepSummaries: StepSummary[] } }>(`/workspace/workflows/${workflow.id}/execute`, {}),
    onSuccess: (res) => {
      const d = res.data
      addToast({ type: d.status === 'success' ? 'success' : 'error', message: `실행 ${d.status === 'success' ? '성공' : '실패'} (${(d.totalDurationMs / 1000).toFixed(1)}초)` })
      qc.invalidateQueries({ queryKey: ['workflow-executions', workflow.id] })
    },
    onError: (e: Error) => addToast({ type: 'error', message: e.message }),
  })

  const executions = execData?.data || []

  if (selectedExecution) {
    return (
      <ExecutionDetail
        execution={selectedExecution}
        workflowName={workflow.name}
        onBack={() => setSelectedExecution(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">실행 이력</h1>
          <p className="text-sm text-zinc-500 mt-1">{workflow.name}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => executeMut.mutate()}
            disabled={executeMut.isPending}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {executeMut.isPending ? '실행 중...' : '지금 실행'}
          </button>
          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            ← 목록으로
          </button>
        </div>
      </div>

      {isLoading && <p className="text-zinc-500">로딩 중...</p>}
      {!isLoading && executions.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <p className="text-lg mb-2">실행 이력이 없습니다</p>
          <p className="text-sm">"지금 실행" 버튼을 눌러 워크플로우를 실행해보세요.</p>
        </div>
      )}

      <div className="space-y-2">
        {executions.map((exec) => (
          <button
            key={exec.id}
            onClick={() => setSelectedExecution(exec)}
            className="w-full text-left p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  exec.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {exec.status === 'success' ? '성공' : '실패'}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {exec.stepSummaries.length}개 스텝
                </span>
                <span className="text-sm text-zinc-500">
                  {(exec.totalDurationMs / 1000).toFixed(1)}초
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {new Date(exec.createdAt).toLocaleString('ko-KR')}
              </span>
            </div>
            {/* Step status mini-bar */}
            <div className="flex gap-1 mt-2">
              {exec.stepSummaries.map((step) => (
                <div
                  key={step.stepId}
                  title={`${step.stepName}: ${step.status}`}
                  className={`h-2 flex-1 rounded-full ${
                    step.status === 'completed' ? 'bg-green-400 dark:bg-green-600'
                    : step.status === 'failed' ? 'bg-red-400 dark:bg-red-600'
                    : 'bg-zinc-300 dark:bg-zinc-600'
                  }`}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// === Execution Detail ===

function ExecutionDetail({
  execution,
  workflowName,
  onBack,
}: {
  execution: Execution
  workflowName: string
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">실행 상세</h1>
          <p className="text-sm text-zinc-500 mt-1">{workflowName}</p>
        </div>
        <button onClick={onBack} className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
          ← 이력으로
        </button>
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            execution.status === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {execution.status === 'success' ? '성공' : '실패'}
          </span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            총 소요시간: {(execution.totalDurationMs / 1000).toFixed(2)}초
          </span>
          <span className="text-sm text-zinc-500">
            {new Date(execution.createdAt).toLocaleString('ko-KR')}
          </span>
        </div>
      </div>

      {/* Step Results */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          스텝 결과 ({execution.stepSummaries.length})
        </h2>
        {execution.stepSummaries.map((step, idx) => (
          <div
            key={step.stepId}
            className={`p-4 rounded-lg border bg-white dark:bg-zinc-900 ${
              step.status === 'completed'
                ? 'border-green-200 dark:border-green-800'
                : step.status === 'failed'
                ? 'border-red-200 dark:border-red-800'
                : 'border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400">#{idx + 1}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  step.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : step.status === 'failed'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}>
                  {step.status === 'completed' ? '완료' : step.status === 'failed' ? '실패' : step.status}
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {step.stepName}
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                {step.durationMs >= 1000
                  ? `${(step.durationMs / 1000).toFixed(1)}초`
                  : `${step.durationMs}ms`}
              </span>
            </div>
            {step.error && (
              <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 text-xs text-red-600 dark:text-red-400 font-mono">
                {step.error}
              </div>
            )}
            {step.output != null && (
              <div className="mt-2 p-2 rounded bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 font-mono max-h-32 overflow-y-auto">
                {typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// === DAG Preview ===

function DagPreview({ steps }: { steps: WorkflowStep[] }) {
  const layers = useMemo(() => buildDagLayers(steps), [steps])

  if (steps.length === 0) return null

  return (
    <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">DAG 미리보기</h3>
      <div className="space-y-2">
        {layers.map((layer, layerIdx) => (
          <div key={layerIdx}>
            {layerIdx > 0 && (
              <div className="flex justify-center py-1">
                <span className="text-zinc-400 text-sm">↓</span>
              </div>
            )}
            <div className="flex gap-2 justify-center flex-wrap">
              {layer.map((step) => (
                <div
                  key={step.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${stepTypeColors[step.type]} border-current/20`}
                >
                  <span className="opacity-60 mr-1">{stepTypeLabels[step.type]}:</span>
                  {step.name || step.action || '(미입력)'}
                </div>
              ))}
              {layer.length > 1 && (
                <span className="self-center text-[10px] text-zinc-400 ml-1">(병렬)</span>
              )}
            </div>
          </div>
        ))}
        {layers.reduce((acc, l) => acc + l.length, 0) < steps.length && (
          <p className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2">
            순환 의존성이 감지되었습니다
          </p>
        )}
      </div>
    </div>
  )
}
