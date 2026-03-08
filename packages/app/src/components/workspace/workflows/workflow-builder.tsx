import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { toast } from 'sonner'
import type { Workflow, WorkflowStep, WorkflowStepType } from '@corthex/shared'

// React Flow node data type
interface StepNodeData {
  label: string
  stepType: WorkflowStepType
  action: string
  params: Record<string, unknown>
  stepId: string
  [key: string]: unknown
}

// Step type colors
const STEP_TYPE_COLORS: Record<WorkflowStepType, { bg: string; border: string; text: string }> = {
  tool: { bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-400 dark:border-blue-600', text: 'text-blue-700 dark:text-blue-300' },
  llm: { bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-400 dark:border-violet-600', text: 'text-violet-700 dark:text-violet-300' },
  condition: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-400 dark:border-amber-600', text: 'text-amber-700 dark:text-amber-300' },
}

const STEP_TYPE_ICONS: Record<WorkflowStepType, string> = {
  tool: '🔧',
  llm: '🤖',
  condition: '⚡',
}

// Custom step node component
function StepNode({ data }: { data: StepNodeData }) {
  const colors = STEP_TYPE_COLORS[data.stepType] || STEP_TYPE_COLORS.tool
  return (
    <div className={`px-4 py-3 rounded-xl border-2 ${colors.bg} ${colors.border} shadow-md min-w-[180px] max-w-[260px]`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{STEP_TYPE_ICONS[data.stepType]}</span>
        <span className={`text-[10px] uppercase font-bold tracking-wider ${colors.text}`}>{data.stepType}</span>
      </div>
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{data.label || data.stepId}</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{data.action || '(action 미설정)'}</p>
    </div>
  )
}

const nodeTypes = { step: StepNode }

// Helpers: convert WorkflowStep[] to React Flow nodes/edges
function stepsToFlow(steps: WorkflowStep[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = steps.map((step, i) => ({
    id: step.id,
    type: 'step',
    position: { x: 100 + (i % 3) * 320, y: 100 + Math.floor(i / 3) * 160 },
    data: {
      label: step.id,
      stepType: step.type,
      action: step.action,
      params: step.params || {},
      stepId: step.id,
    } satisfies StepNodeData,
  }))

  const edges: Edge[] = []
  steps.forEach((step) => {
    if (step.dependsOn) {
      step.dependsOn.forEach((dep) => {
        edges.push({
          id: `e-${dep}-${step.id}`,
          source: dep,
          target: step.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1' },
        })
      })
    }
  })

  return { nodes, edges }
}

// Convert React Flow nodes/edges back to WorkflowStep[]
function flowToSteps(nodes: Node[], edges: Edge[]): WorkflowStep[] {
  return nodes.map((node) => {
    const data = node.data as StepNodeData
    const deps = edges.filter((e) => e.target === node.id).map((e) => e.source)
    return {
      id: data.stepId,
      type: data.stepType,
      action: data.action,
      params: data.params,
      ...(deps.length > 0 ? { dependsOn: deps } : {}),
    }
  })
}

// Detail panel for editing a selected node
function StepDetailPanel({
  node,
  allNodes,
  onUpdate,
  onClose,
}: {
  node: Node
  allNodes: Node[]
  onUpdate: (id: string, data: Partial<StepNodeData>) => void
  onClose: () => void
}) {
  const data = node.data as StepNodeData
  const [action, setAction] = useState(data.action)
  const [paramsText, setParamsText] = useState(JSON.stringify(data.params, null, 2))
  const [stepType, setStepType] = useState<WorkflowStepType>(data.stepType)
  const [paramsError, setParamsError] = useState('')

  const availableVars = useMemo(() => {
    return allNodes
      .filter((n) => n.id !== node.id)
      .map((n) => `{{${(n.data as StepNodeData).stepId}.output}}`)
  }, [allNodes, node.id])

  const handleSave = () => {
    let parsedParams: Record<string, unknown> = {}
    try {
      parsedParams = JSON.parse(paramsText)
      setParamsError('')
    } catch {
      setParamsError('JSON 형식이 올바르지 않습니다')
      return
    }
    onUpdate(node.id, { action, params: parsedParams, stepType })
    onClose()
  }

  return (
    <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 overflow-y-auto space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">스텝 설정</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-lg">✕</button>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Step ID</label>
        <input
          value={data.stepId}
          disabled
          className="w-full px-3 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-md border border-zinc-200 dark:border-zinc-700"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">유형</label>
        <select
          value={stepType}
          onChange={(e) => setStepType(e.target.value as WorkflowStepType)}
          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
        >
          <option value="tool">🔧 Tool</option>
          <option value="llm">🤖 LLM</option>
          <option value="condition">⚡ Condition</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Action</label>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="예: summarize, fetchData, evaluate"
          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">Params (JSON)</label>
        <textarea
          value={paramsText}
          onChange={(e) => setParamsText(e.target.value)}
          rows={5}
          className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md resize-y"
        />
        {paramsError && <p className="text-red-500 text-xs mt-1">{paramsError}</p>}
      </div>

      {availableVars.length > 0 && (
        <div>
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">참조 가능한 변수</label>
          <div className="flex flex-wrap gap-1">
            {availableVars.map((v) => (
              <button
                key={v}
                onClick={() => {
                  navigator.clipboard.writeText(v)
                  toast.success(`${v} 복사됨`)
                }}
                className="px-2 py-1 text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors font-mono"
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
      >
        적용
      </button>
    </div>
  )
}

// Main builder inner component
function BuilderInner({ workflowId, onClose }: { workflowId: string | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDesc, setWorkflowDesc] = useState('')
  const [nodeCounter, setNodeCounter] = useState(0)

  // Load existing workflow
  const { data: existingWorkflow } = useQuery({
    queryKey: ['workspace-workflow', workflowId],
    queryFn: () => api.get<{ data: Workflow }>(`/workspace/workflows/${workflowId}`),
    enabled: !!workflowId,
  })

  useEffect(() => {
    if (existingWorkflow?.data) {
      const wf = existingWorkflow.data
      setWorkflowName(wf.name)
      setWorkflowDesc(wf.description || '')
      const { nodes: flowNodes, edges: flowEdges } = stepsToFlow(wf.steps)
      setNodes(flowNodes)
      setEdges(flowEdges)
    }
  }, [existingWorkflow, setNodes, setEdges])

  const onConnect = useCallback(
    (conn: Connection) => {
      setEdges((eds) =>
        addEdge(
          { ...conn, id: `e-${conn.source}-${conn.target}`, type: 'smoothstep', animated: true, style: { stroke: '#6366f1' } },
          eds,
        ),
      )
    },
    [setEdges],
  )

  const handleAddStep = useCallback(
    (type: WorkflowStepType) => {
      const c = nodeCounter + 1
      setNodeCounter(c)
      const id = `step_${type}_${c}`
      const newNode: Node = {
        id,
        type: 'step',
        position: { x: 150 + (nodes.length % 3) * 320, y: 120 + Math.floor(nodes.length / 3) * 160 },
        data: {
          label: id,
          stepType: type,
          action: '',
          params: {},
          stepId: id,
        } satisfies StepNodeData,
      }
      setNodes((nds) => [...nds, newNode])
    },
    [nodeCounter, nodes.length, setNodes],
  )

  const handleNodeUpdate = useCallback(
    (id: string, partial: Partial<StepNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...partial } } : n)),
      )
    },
    [setNodes],
  )

  // Save / Create
  const saveMutation = useMutation({
    mutationFn: async () => {
      const steps = flowToSteps(nodes, edges)
      if (workflowId) {
        return api.put(`/workspace/workflows/${workflowId}`, { name: workflowName, description: workflowDesc, steps })
      } else {
        return api.post('/workspace/workflows', { name: workflowName, description: workflowDesc, steps })
      }
    },
    onSuccess: () => {
      toast.success(workflowId ? '워크플로우가 저장되었습니다.' : '워크플로우가 생성되었습니다.')
      queryClient.invalidateQueries({ queryKey: ['workspace-workflows'] })
      onClose()
    },
    onError: (err: Error) => {
      // Cycle detection from server
      if (err.message?.includes('순환') || err.message?.includes('Cycle') || err.message?.includes('DAG')) {
        toast.error('순환 참조가 감지되었습니다. 스텝 간 연결을 확인해주세요.')
      } else {
        toast.error(err.message || '저장에 실패했습니다.')
      }
    },
  })

  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId])

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white dark:bg-zinc-900 shrink-0">
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-lg"
        >
          ←
        </button>
        <input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="워크플로우 이름"
          className="text-lg font-semibold bg-transparent border-none outline-none flex-1 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
        />
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!workflowName.trim() || saveMutation.isPending}
          className="px-4 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 text-white rounded-lg transition-colors"
        >
          {saveMutation.isPending ? '저장 중...' : '저장'}
        </button>
      </div>

      {/* Description */}
      <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-950/50 shrink-0">
        <input
          value={workflowDesc}
          onChange={(e) => setWorkflowDesc(e.target.value)}
          placeholder="워크플로우 설명 (선택)"
          className="w-full text-sm bg-transparent border-none outline-none text-zinc-600 dark:text-zinc-400 placeholder-zinc-400"
        />
      </div>

      {/* Toolbar: add step buttons */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900 shrink-0">
        <span className="text-xs text-zinc-500 mr-2">스텝 추가:</span>
        {(['tool', 'llm', 'condition'] as WorkflowStepType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleAddStep(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${STEP_TYPE_COLORS[type].bg} ${STEP_TYPE_COLORS[type].border} ${STEP_TYPE_COLORS[type].text} hover:opacity-80`}
          >
            {STEP_TYPE_ICONS[type]} {type.toUpperCase()}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-[10px] text-zinc-400">
          {nodes.length}개 스텝 · {edges.length}개 연결
        </span>
      </div>

      {/* Canvas + Side panel */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_e, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodeTypes={nodeTypes}
            fitView
            className="!bg-zinc-50 dark:!bg-zinc-950"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d4d4d8" />
            <Controls className="!bg-white dark:!bg-zinc-900 !border-zinc-200 dark:!border-zinc-700 !shadow-lg !rounded-lg" />
            <MiniMap
              nodeColor={(n) => {
                const t = (n.data as StepNodeData)?.stepType
                return t === 'tool' ? '#3b82f6' : t === 'llm' ? '#8b5cf6' : '#f59e0b'
              }}
              className="!bg-zinc-100 dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !rounded-lg"
            />
          </ReactFlow>
        </div>

        {selectedNode && (
          <StepDetailPanel
            node={selectedNode}
            allNodes={nodes}
            onUpdate={handleNodeUpdate}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}

// Exported wrapper with ReactFlowProvider
export function WorkflowBuilder({ workflowId, onClose }: { workflowId: string | null; onClose: () => void }) {
  return (
    <ReactFlowProvider>
      <BuilderInner workflowId={workflowId} onClose={onClose} />
    </ReactFlowProvider>
  )
}
