import { useCallback, useState, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodesChange,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/auth-store'
import { CompanyNode } from '../components/nexus/CompanyNode'
import { DepartmentNode } from '../components/nexus/DepartmentNode'
import { AgentNode } from '../components/nexus/AgentNode'
import { NodeDetailPanel } from '../components/nexus/NodeDetailPanel'
import { getAutoLayout } from '../lib/dagre-layout'
import type { NexusOrgData, NexusLayoutData } from '@corthex/shared'

const nodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
}

export function NexusPage() {
  const user = useAuthStore((s) => s.user)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const initialized = useRef(false)

  // Admin check
  if (user?.role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-500">관리자 권한이 필요합니다</p>
      </div>
    )
  }

  const { data: orgData } = useQuery({
    queryKey: ['nexus-org-data'],
    queryFn: () => api.get<{ data: NexusOrgData }>('/workspace/nexus/org-data'),
  })

  const { data: layoutRes } = useQuery({
    queryKey: ['nexus-layout'],
    queryFn: () => api.get<{ data: { layoutData: NexusLayoutData } | null }>('/workspace/nexus/layout'),
  })

  const saveLayout = useMutation({
    mutationFn: (data: NexusLayoutData) => api.put('/workspace/nexus/layout', data),
  })

  // org 데이터 → React Flow 노드/엣지 변환
  useEffect(() => {
    if (!orgData?.data) return
    // 이미 초기화된 경우 중복 실행 방지 (org-data가 바뀌면 리셋)
    const org = orgData.data
    const saved = layoutRes?.data?.layoutData

    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    // Company 노드
    const companyNodeId = `company-${org.company.id}`
    newNodes.push({
      id: companyNodeId,
      type: 'company',
      position: saved?.nodes?.[companyNodeId] || { x: 0, y: 0 },
      data: { label: org.company.name, slug: org.company.slug },
      draggable: true,
    })

    // Department 노드 + 엣지
    org.departments.forEach((dept) => {
      const deptNodeId = `dept-${dept.id}`
      newNodes.push({
        id: deptNodeId,
        type: 'department',
        position: saved?.nodes?.[deptNodeId] || { x: 0, y: 0 },
        data: { label: dept.name, description: dept.description, agentCount: dept.agents.length },
        draggable: true,
      })
      newEdges.push({
        id: `e-company-${dept.id}`,
        source: companyNodeId,
        target: deptNodeId,
        type: 'smoothstep',
        animated: false,
      })

      // Agent 노드 in department
      dept.agents.forEach((agent) => {
        const agentNodeId = `agent-${agent.id}`
        newNodes.push({
          id: agentNodeId,
          type: 'agent',
          position: saved?.nodes?.[agentNodeId] || { x: 0, y: 0 },
          data: {
            label: agent.name,
            role: agent.role,
            status: agent.status,
            isSecretary: agent.isSecretary,
          },
          draggable: true,
        })
        newEdges.push({
          id: `e-dept-${agent.id}`,
          source: deptNodeId,
          target: agentNodeId,
          type: 'smoothstep',
        })
      })
    })

    // 미배정 에이전트
    org.unassignedAgents.forEach((agent) => {
      const agentNodeId = `agent-${agent.id}`
      newNodes.push({
        id: agentNodeId,
        type: 'agent',
        position: saved?.nodes?.[agentNodeId] || { x: 0, y: 0 },
        data: {
          label: agent.name,
          role: agent.role,
          status: agent.status,
          isSecretary: agent.isSecretary,
        },
        draggable: true,
      })
      newEdges.push({
        id: `e-unassigned-${agent.id}`,
        source: companyNodeId,
        target: agentNodeId,
        type: 'smoothstep',
        style: { strokeDasharray: '5 5' },
      })
    })

    // 저장된 레이아웃 없으면 dagre 자동 정렬
    const finalNodes = saved?.nodes && Object.keys(saved.nodes).length > 0
      ? newNodes
      : getAutoLayout(newNodes, newEdges)

    setNodes(finalNodes)
    setEdges(newEdges)
    initialized.current = true
  }, [orgData, layoutRes])

  const handleNodesChange: OnNodesChange<Node> = useCallback(
    (changes) => {
      onNodesChange(changes)
    },
    [onNodesChange],
  )

  const handleSaveLayout = useCallback(() => {
    const nodePositions: Record<string, { x: number; y: number }> = {}
    nodes.forEach((n) => {
      nodePositions[n.id] = { x: n.position.x, y: n.position.y }
    })
    saveLayout.mutate({ nodes: nodePositions })
  }, [nodes, saveLayout])

  const handleAutoLayout = useCallback(() => {
    const layouted = getAutoLayout(nodes, edges)
    setNodes(layouted)
  }, [nodes, edges, setNodes])

  return (
    <div className="h-full flex">
      <div className="flex-1 flex flex-col">
        {/* 툴바 */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">NEXUS</h2>
            <span className="text-xs text-zinc-400">조직도 캔버스</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAutoLayout}
              className="px-3 py-1.5 text-xs border border-zinc-300 dark:border-zinc-600 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              자동 정렬
            </button>
            <button
              onClick={handleSaveLayout}
              disabled={saveLayout.isPending}
              className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {saveLayout.isPending ? '저장 중...' : '레이아웃 저장'}
            </button>
            {saveLayout.isSuccess && (
              <span className="text-xs text-green-600 self-center">저장됨</span>
            )}
          </div>
        </div>

        {/* 캔버스 */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedNode(node)}
            onPaneClick={() => setSelectedNode(null)}
            fitView
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              className="!bg-zinc-100 dark:!bg-zinc-800"
            />
          </ReactFlow>
        </div>
      </div>

      {/* 상세 패널 */}
      {selectedNode && (
        <NodeDetailPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}
