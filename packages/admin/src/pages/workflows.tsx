/**
 * Admin Workflows Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET    /workspace/workflows?companyId={id}&page=&limit=
 *   GET    /workspace/workflows/:id
 *   POST   /workspace/workflows { name, description?, steps, companyId }
 *   PUT    /workspace/workflows/:id { name?, description?, steps? }
 *   DELETE /workspace/workflows/:id
 *   POST   /workspace/workflows/:id/execute
 *   GET    /workspace/workflows/:id/executions?page=
 *   GET    /workspace/workflows/suggestions?companyId={id}
 *   POST   /workspace/workflows/suggestions/:id/accept
 *   POST   /workspace/workflows/suggestions/:id/reject
 */
import { useState, useMemo, useCallback } from 'react'
import { Network, ArrowLeft, GitBranch, Lightbulb, Settings } from 'lucide-react'
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

import { olive, oliveBg, oliveActive, terracotta, cream, sand, warmBrown, muted, lightMuted, leafLight } from '../lib/colors'

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

const stepTypeLabels: Record<string, { label: string; color: string; bg: string }> = {
  tool: { label: 'Tool', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  llm: { label: 'LLM', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  condition: { label: 'Condition', color: terracotta, bg: 'rgba(196,98,45,0.1)' },
}

const execStatusLabels: Record<string, { label: string; color: string; bg: string }> = {
  success: { label: 'Success', color: olive, bg: oliveBg },
  failed: { label: 'Failed', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

// === Execution Card Sub-component ===

function ExecutionCard({ exec }: { exec: Execution }) {
  const [expanded, setExpanded] = useState(false)
  const statusInfo = execStatusLabels[exec.status] || execStatusLabels.failed

  return (
    <div className="border rounded-xl overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: sand }}>
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(!expanded) } }}
        style={{ backgroundColor: expanded ? `${cream}80` : 'transparent' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>{statusInfo.label}</span>
          <span className="text-xs font-mono" style={{ color: muted }}>{(exec.totalDurationMs / 1000).toFixed(1)}s</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono" style={{ color: lightMuted }}>
            {new Date(exec.createdAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-xs" style={{ color: lightMuted }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 py-3 border-t space-y-2" style={{ borderColor: `${sand}80` }}>
          {exec.stepSummaries.map((step) => (
            <div key={step.stepId} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: step.status === 'completed' || step.status === 'success' ? olive : step.status === 'failed' ? '#ef4444' : lightMuted,
                  }}
                />
                <span style={{ color: warmBrown }}>{step.stepName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono" style={{ color: lightMuted }}>{(step.durationMs / 1000).toFixed(1)}s</span>
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

// === Workflow Form Modal ===

function WorkflowFormModal({ workflow, isPending, onSubmit, onClose }: {
  workflow: Workflow | null
  isPending: boolean
  onSubmit: (data: { name: string; description?: string; steps: WorkflowStep[] }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(workflow?.name || '')
  const [description, setDescription] = useState(workflow?.description || '')
  const [steps, setSteps] = useState<WorkflowStep[]>(
    workflow?.steps ? (workflow.steps as WorkflowStep[]).map(s => ({ ...s })) : [emptyStep()]
  )

  const inputStyle = { backgroundColor: '#fbfaf8', borderColor: sand, color: warmBrown }

  function addStep() {
    if (steps.length >= 20) return
    const newStep = emptyStep()
    if (steps.length > 0) newStep.dependsOn = [steps[steps.length - 1].id]
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
    onSubmit({ name: name.trim(), description: description.trim() || undefined, steps: validSteps })
  }

  const isValid = name.trim() && steps.some(s => s.name?.trim() && s.action.trim())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-xl w-full mx-4 p-6 max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: '#ffffff', border: `1px solid ${sand}` }}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        data-testid="workflow-form-modal"
      >
        <h3 className="text-lg font-bold mb-4" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>
          {workflow ? 'Edit Workflow' : 'Create Workflow'}
        </h3>

        <div className="mb-3">
          <label className="block text-xs font-medium mb-1" style={{ color: muted }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Workflow name"
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1"
            style={{ ...inputStyle, outlineColor: olive }}
            data-testid="workflow-name-input"
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium mb-1" style={{ color: muted }}>Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Workflow description"
            rows={2}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1"
            style={{ ...inputStyle, outlineColor: olive }}
            data-testid="workflow-desc-input"
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: muted }}>Steps ({steps.length}/20)</label>
            {steps.length < 20 && (
              <button type="button" onClick={addStep} className="text-xs font-bold" style={{ color: olive }}>+ Add Step</button>
            )}
          </div>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="border rounded-lg p-3 space-y-2" style={{ backgroundColor: '#fbfaf8', borderColor: sand }} data-testid={`form-step-${idx}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color: lightMuted }}>Step {idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => moveStep(idx, -1)} disabled={idx === 0} className="text-xs disabled:opacity-30 px-1" style={{ color: muted }}>↑</button>
                    <button type="button" onClick={() => moveStep(idx, 1)} disabled={idx === steps.length - 1} className="text-xs disabled:opacity-30 px-1" style={{ color: muted }}>↓</button>
                    {steps.length > 1 && (
                      <button type="button" onClick={() => removeStep(idx)} className="text-xs px-1" style={{ color: '#ef4444' }}>Delete</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={step.name || ''}
                    onChange={e => updateStep(idx, { name: e.target.value })}
                    placeholder="Step name"
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
                  placeholder="Action (tool name or prompt)"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                  style={inputStyle}
                />
                {step.type === 'llm' && (
                  <textarea
                    value={step.systemPrompt || ''}
                    onChange={e => updateStep(idx, { systemPrompt: e.target.value })}
                    placeholder="System prompt (optional)"
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none"
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border rounded-xl transition-colors" style={{ borderColor: sand, color: muted }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="flex-1 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50"
            style={{ backgroundColor: olive }}
            data-testid="submit-workflow-btn"
          >
            {isPending ? 'Processing...' : workflow ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
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
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel() }}
    >
      <div
        className="rounded-2xl shadow-2xl p-6 w-96 mx-4"
        style={{ backgroundColor: '#ffffff', border: `1px solid ${sand}` }}
        tabIndex={-1}
        data-testid="delete-confirm-modal"
      >
        <h3 className="text-sm font-bold mb-2" style={{ color: warmBrown }}>Delete Workflow</h3>
        <p className="text-xs mb-4" style={{ color: muted }}>Are you sure you want to delete this workflow?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="border rounded-xl px-4 py-2 text-sm" style={{ borderColor: sand, color: muted }}>Cancel</button>
          <button onClick={onConfirm} className="text-white rounded-xl px-4 py-2 text-sm font-bold" style={{ backgroundColor: '#ef4444' }}>Delete</button>
        </div>
      </div>
    </div>
  )
}

// === Main Page ===

export function WorkflowsPage() {
  const qc = useQueryClient()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const addToast = useToastStore((s) => s.addToast)
  const [activeTab, setActiveTab] = useState<Tab>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [executionsPage, setExecutionsPage] = useState(1)

  // --- Queries ---
  const { data: workflowsData, isLoading } = useQuery({
    queryKey: ['admin-workflows', selectedCompanyId],
    queryFn: () => api.get<{ data: Workflow[] }>(`/workspace/workflows?companyId=${selectedCompanyId}&page=1&limit=100`),
    enabled: !!selectedCompanyId,
  })

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-workflow-detail', selectedId],
    queryFn: () => api.get<{ data: Workflow }>(`/workspace/workflows/${selectedId}`),
    enabled: !!selectedId,
  })

  const { data: executionsData } = useQuery({
    queryKey: ['admin-workflow-executions', selectedId, executionsPage],
    queryFn: () => api.get<{ data: Execution[]; meta?: { total: number } }>(`/workspace/workflows/${selectedId}/executions?page=${executionsPage}`),
    enabled: !!selectedId,
  })

  const { data: suggestionsData, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['admin-workflow-suggestions', selectedCompanyId],
    queryFn: () => api.get<{ data: Suggestion[] }>(`/workspace/workflows/suggestions?companyId=${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: (body: { name: string; description?: string; steps: WorkflowStep[] }) =>
      api.post('/workspace/workflows', { ...body, companyId: selectedCompanyId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-workflows'] })
      setShowCreate(false)
      setEditingWorkflow(null)
      addToast({ type: 'success', message: 'Workflow created' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; description?: string; steps?: WorkflowStep[] }) =>
      api.put(`/workspace/workflows/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-workflows'] })
      qc.invalidateQueries({ queryKey: ['admin-workflow-detail'] })
      setShowCreate(false)
      setEditingWorkflow(null)
      addToast({ type: 'success', message: 'Workflow updated' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workspace/workflows/${id}`),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['admin-workflows'] })
      setDeleteTarget(null)
      if (selectedId === id) setSelectedId(null)
      addToast({ type: 'success', message: 'Workflow deleted' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const executeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/workflows/${id}/execute`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-workflow-executions'] })
      addToast({ type: 'success', message: 'Workflow executed' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const acceptSuggestion = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/workflows/suggestions/${id}/accept`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-workflow-suggestions'] })
      qc.invalidateQueries({ queryKey: ['admin-workflows'] })
      addToast({ type: 'success', message: 'Suggestion accepted' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const rejectSuggestion = useMutation({
    mutationFn: (id: string) => api.post(`/workspace/workflows/suggestions/${id}/reject`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-workflow-suggestions'] })
      addToast({ type: 'success', message: 'Suggestion rejected' })
    },
    onError: (err: Error) => addToast({ type: 'error', message: err.message }),
  })

  const workflows = workflowsData?.data || []
  const suggestions = suggestionsData?.data || []
  const detail = detailData?.data || null
  const executions = executionsData?.data || []
  const executionsMeta = executionsData?.meta

  function openEdit(wf: Workflow) {
    setEditingWorkflow(wf)
    setShowCreate(true)
  }

  if (!selectedCompanyId) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <p className="text-sm" style={{ color: lightMuted }}>회사를 선택하세요</p>
      </div>
    )
  }

  // --- Detail view ---
  if (selectedId) {
    return (
      <div className="flex h-screen w-full" style={{ fontFamily: "'Pretendard', sans-serif" }}>
        {/* Sidebar */}
        <div className="w-64 text-white flex flex-col h-full flex-shrink-0 z-20 shadow-lg" style={{ backgroundColor: olive }}>
          <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: oliveActive }}>
            <Network className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Noto Serif KR', serif" }}>Workflows</h2>
          </div>
          <div className="p-6 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white/20 w-10 h-10 rounded-full" />
              <div className="flex flex-col">
                <h1 className="text-base font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>CORTHEX v2</h1>
                <p className="text-xs" style={{ color: leafLight }}>Admin Workflow Manager</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 mt-4">
              <button
                onClick={() => { setSelectedId(null); setExecutionsPage(1) }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to List</span>
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-inner" style={{ backgroundColor: oliveActive }}>
                <GitBranch className="w-5 h-5" />
                <span className="text-sm font-medium truncate">{detailLoading ? '...' : detail?.name || 'Workflow'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: cream }}>
          <header className="border-b px-8 py-6 flex items-center justify-between" style={{ backgroundColor: '#ffffff', borderColor: sand }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setSelectedId(null); setExecutionsPage(1) }}
                className="text-sm min-h-[44px] flex items-center px-3 transition-colors"
                style={{ color: muted }}
              >
                ← List
              </button>
              <h2 className="text-xl font-semibold" style={{ color: warmBrown, fontFamily: "'Noto Serif KR', serif" }}>
                {detailLoading ? '...' : detail?.name || 'Workflow'}
              </h2>
            </div>
            {detail && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => executeMutation.mutate(detail.id)}
                  disabled={executeMutation.isPending}
                  className="text-white rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50 transition-colors"
                  style={{ backgroundColor: terracotta }}
                  data-testid="execute-btn"
                >
                  {executeMutation.isPending ? 'Running...' : 'Execute'}
                </button>
                <button
                  onClick={() => openEdit(detail)}
                  className="border rounded-xl px-4 py-2 text-sm transition-colors"
                  style={{ borderColor: sand, color: muted }}
                  data-testid="edit-workflow-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTarget(detail.id)}
                  className="text-sm px-3 py-2"
                  style={{ color: '#ef4444' }}
                  data-testid="delete-workflow-btn"
                >
                  Delete
                </button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto px-8 py-6">
            {detailLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-xl" style={{ backgroundColor: `${sand}80` }} />)}
              </div>
            ) : detail ? (
              <div className="max-w-3xl space-y-6">
                {detail.description && (
                  <p className="text-sm" style={{ color: muted }}>{detail.description}</p>
                )}

                {/* Steps visualization */}
                <div>
                  <h3 className="text-sm font-bold mb-3" style={{ color: muted }}>Steps ({detail.steps.length})</h3>
                  <div className="space-y-2">
                    {(detail.steps as WorkflowStep[]).map((step, idx) => {
                      const typeInfo = stepTypeLabels[step.type] || stepTypeLabels.tool
                      return (
                        <div key={step.id} className="flex items-start gap-3" data-testid={`step-${idx}`}>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-mono" style={{ backgroundColor: '#fbfaf8', borderColor: sand, color: muted }}>
                              {idx + 1}
                            </div>
                            {idx < detail.steps.length - 1 && <div className="w-px h-6 mt-1" style={{ backgroundColor: sand }} />}
                          </div>
                          <div className="flex-1 border rounded-xl p-4" style={{ backgroundColor: '#ffffff', borderColor: sand }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: typeInfo.bg, color: typeInfo.color }}>{typeInfo.label}</span>
                              <span className="text-sm font-bold" style={{ color: warmBrown }}>{step.name}</span>
                            </div>
                            <p className="text-xs font-mono" style={{ color: muted }}>{step.action}</p>
                            {step.dependsOn && step.dependsOn.length > 0 && (
                              <p className="text-[10px] mt-1" style={{ color: lightMuted }}>
                                Depends on: {step.dependsOn.map(depId => {
                                  const depStep = (detail.steps as WorkflowStep[]).find(s => s.id === depId)
                                  return depStep?.name || depId.slice(0, 8)
                                }).join(', ')}
                              </p>
                            )}
                            {step.timeout && (
                              <p className="text-[10px] mt-0.5" style={{ color: lightMuted }}>Timeout: {(step.timeout / 1000).toFixed(0)}s</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Execution history */}
                <div>
                  <h3 className="text-sm font-bold mb-3" style={{ color: muted }}>Execution History</h3>
                  {executions.length === 0 ? (
                    <p className="text-xs" style={{ color: lightMuted }}>No execution history yet</p>
                  ) : (
                    <div className="space-y-2">
                      {executions.map(exec => (
                        <ExecutionCard key={exec.id} exec={exec} />
                      ))}
                      {executionsMeta && executionsMeta.total > 10 && (
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button onClick={() => setExecutionsPage(p => Math.max(1, p - 1))} disabled={executionsPage <= 1} className="text-xs disabled:opacity-30" style={{ color: muted }}>Prev</button>
                          <span className="text-xs" style={{ color: lightMuted }}>{executionsPage} / {Math.ceil(executionsMeta.total / 10)}</span>
                          <button onClick={() => setExecutionsPage(p => p + 1)} disabled={executionsPage >= Math.ceil(executionsMeta.total / 10)} className="text-xs disabled:opacity-30" style={{ color: muted }}>Next</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {deleteTarget && <DeleteConfirmModal onConfirm={() => deleteMutation.mutate(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}
        {showCreate && (
          <WorkflowFormModal
            workflow={editingWorkflow}
            isPending={createMutation.isPending || updateMutation.isPending}
            onSubmit={(data) => {
              if (editingWorkflow) updateMutation.mutate({ id: editingWorkflow.id, ...data })
              else createMutation.mutate(data)
            }}
            onClose={() => { setShowCreate(false); setEditingWorkflow(null) }}
          />
        )}
      </div>
    )
  }

  // --- List view ---
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'list', label: 'Workflows', count: workflows.length },
    { key: 'suggestions', label: 'Suggestions', count: suggestions.length },
  ]

  return (
    <div className="flex h-screen w-full" style={{ fontFamily: "'Pretendard', sans-serif" }}>
      {/* Sidebar */}
      <div className="w-64 text-white flex flex-col h-full flex-shrink-0 z-20 shadow-lg" style={{ backgroundColor: olive }}>
        <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: oliveActive }}>
          <Network className="w-6 h-6" />
          <h2 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Noto Serif KR', serif" }}>Workflows</h2>
        </div>
        <div className="p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 w-10 h-10 rounded-full" />
            <div className="flex flex-col">
              <h1 className="text-base font-bold" style={{ fontFamily: "'Noto Serif KR', serif" }}>CORTHEX v2</h1>
              <p className="text-xs" style={{ color: leafLight }}>Admin Workflow Manager</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <button
              onClick={() => setActiveTab('list')}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-inner"
              style={{ backgroundColor: activeTab === 'list' ? oliveActive : 'transparent' }}
              onMouseEnter={e => { if (activeTab !== 'list') e.currentTarget.style.backgroundColor = '#6a8454' }}
              onMouseLeave={e => { if (activeTab !== 'list') e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <GitBranch className="w-5 h-5" />
              <span className="text-sm font-medium">All Workflows</span>
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
              style={{ backgroundColor: activeTab === 'suggestions' ? oliveActive : 'transparent' }}
              onMouseEnter={e => { if (activeTab !== 'suggestions') e.currentTarget.style.backgroundColor = '#6a8454' }}
              onMouseLeave={e => { if (activeTab !== 'suggestions') e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm font-medium">Suggestions</span>
              {suggestions.length > 0 && (
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: terracotta }}>{suggestions.length}</span>
              )}
            </button>
          </div>
        </div>
        <div className="mt-auto p-6 flex flex-col gap-1 border-t" style={{ borderColor: oliveActive }}>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#6a8454')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: cream }}>
        <header className="border-b px-8 py-6" style={{ backgroundColor: '#ffffff', borderColor: sand }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl" style={{ fontFamily: "'Noto Serif KR', serif", color: warmBrown }}>Admin Workflows</h1>
              <p className="text-sm mt-1" style={{ color: muted }}>Manage and monitor automation workflows</p>
            </div>
            <button
              onClick={() => { setEditingWorkflow(null); setShowCreate(true) }}
              className="text-white rounded-2xl px-5 py-2.5 text-sm font-bold shadow-lg transition-all"
              style={{ backgroundColor: terracotta, boxShadow: '0 10px 15px -3px rgba(196,98,45,0.2)' }}
              data-testid="create-workflow-btn"
            >
              + Create Workflow
            </button>
          </div>

          <div className="flex border-b mt-8 gap-8" style={{ borderColor: sand }} data-testid="workflow-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className="pb-3 text-sm transition-colors"
                style={activeTab === t.key
                  ? { fontWeight: 700, borderBottom: `2px solid ${warmBrown}`, color: warmBrown }
                  : { fontWeight: 500, color: muted, borderBottom: '2px solid transparent' }
                }
              >
                {t.label}
                {t.count > 0 && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${sand}80`, color: muted }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-2xl space-y-3">
            {/* Workflows tab */}
            {activeTab === 'list' && (
              isLoading ? (
                <div className="space-y-3" data-testid="workflows-loading">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl" style={{ backgroundColor: `${sand}80` }} />)}
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-16" data-testid="workflows-empty">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: oliveBg }}>
                    <GitBranch className="w-5 h-5" style={{ color: olive }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: muted }}>No workflows yet</p>
                  <p className="text-xs mt-1" style={{ color: lightMuted }}>Create your first workflow to get started</p>
                </div>
              ) : (
                workflows.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => setSelectedId(wf.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(wf.id) } }}
                    className="border rounded-xl p-4 cursor-pointer transition-all shadow-sm hover:shadow-md"
                    style={{ backgroundColor: '#ffffff', borderColor: sand }}
                    data-testid={`workflow-item-${wf.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold truncate" style={{ color: warmBrown }}>{wf.name}</h3>
                        {wf.description && <p className="text-xs mt-0.5 truncate" style={{ color: muted }}>{wf.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono" style={{ color: lightMuted }}>
                          <span>{(wf.steps as WorkflowStep[]).length} steps</span>
                          <span>{new Date(wf.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ backgroundColor: wf.isActive ? oliveBg : 'rgba(239,68,68,0.1)', color: wf.isActive ? olive : '#ef4444' }}>
                            {wf.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(wf) }}
                          className="text-xs min-h-[44px] px-3 flex items-center transition-colors font-medium"
                          style={{ color: muted }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(wf.id) }}
                          className="text-xs min-h-[44px] px-3 flex items-center font-medium"
                          style={{ color: '#ef4444' }}
                        >
                          Delete
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
                  {[1, 2, 3].map(i => <div key={i} className="h-20 animate-pulse rounded-xl" style={{ backgroundColor: `${sand}80` }} />)}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-16" data-testid="suggestions-empty">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: oliveBg }}>
                    <Lightbulb className="w-5 h-5" style={{ color: olive }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: muted }}>No pending suggestions</p>
                  <p className="text-xs mt-1" style={{ color: lightMuted }}>Suggestions appear when repetitive tool usage patterns are detected</p>
                </div>
              ) : (
                suggestions.map(sg => (
                  <div
                    key={sg.id}
                    className="border rounded-xl p-4"
                    style={{ backgroundColor: '#ffffff', borderColor: sand }}
                    data-testid={`suggestion-item-${sg.id}`}
                  >
                    <p className="text-sm font-medium mb-2" style={{ color: warmBrown }}>{sg.reason}</p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {(sg.suggestedSteps as WorkflowStep[]).map((step, i) => (
                        <span key={step.id} className="inline-flex items-center gap-1">
                          <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${sand}80`, color: muted }}>{step.action}</span>
                          {i < sg.suggestedSteps.length - 1 && <span className="text-xs" style={{ color: lightMuted }}>→</span>}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => acceptSuggestion.mutate(sg.id)}
                        disabled={acceptSuggestion.isPending}
                        className="text-white rounded-xl px-4 py-2 text-xs font-bold disabled:opacity-50 min-h-[44px]"
                        style={{ backgroundColor: olive }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectSuggestion.mutate(sg.id)}
                        disabled={rejectSuggestion.isPending}
                        className="border rounded-xl px-4 py-2 text-xs disabled:opacity-50 min-h-[44px]"
                        style={{ borderColor: sand, color: muted }}
                      >
                        Reject
                      </button>
                      <span className="text-[10px] ml-auto font-mono" style={{ color: lightMuted }}>
                        {new Date(sg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
      </div>

      {deleteTarget && <DeleteConfirmModal onConfirm={() => deleteMutation.mutate(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}
      {showCreate && (
        <WorkflowFormModal
          workflow={editingWorkflow}
          isPending={createMutation.isPending || updateMutation.isPending}
          onSubmit={(data) => {
            if (editingWorkflow) updateMutation.mutate({ id: editingWorkflow.id, ...data })
            else createMutation.mutate(data)
          }}
          onClose={() => { setShowCreate(false); setEditingWorkflow(null) }}
        />
      )}
    </div>
  )
}
