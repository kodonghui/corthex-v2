import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { api } from '../lib/api'
import { useAdminStore } from '../stores/admin-store'
import { computeElkLayout, type OrgChartData } from '../lib/elk-layout'
import { CompanyNode } from '../components/nexus/company-node'
import { DepartmentNode } from '../components/nexus/department-node'
import { AgentNode } from '../components/nexus/agent-node'
import { UnassignedGroupNode } from '../components/nexus/unassigned-group-node'
import { Skeleton } from '@corthex/ui'

// Register custom node types
const nodeTypes: NodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
  'unassigned-group': UnassignedGroupNode,
} as unknown as NodeTypes

// MiniMap color mapping
function miniMapNodeColor(node: { type?: string }) {
  switch (node.type) {
    case 'company': return '#e2e8f0'
    case 'department': return '#3b82f6'
    case 'agent': return '#10b981'
    case 'unassigned-group': return '#f59e0b'
    default: return '#64748b'
  }
}

function NexusSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40 bg-slate-800" />
      <Skeleton className="h-[600px] w-full bg-slate-800/50 rounded-xl" />
    </div>
  )
}

export function NexusPage() {
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([] as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([] as Edge[])
  const [layoutReady, setLayoutReady] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['org-chart', selectedCompanyId],
    queryFn: () => api.get<{ data: OrgChartData }>(`/admin/org-chart?companyId=${encodeURIComponent(selectedCompanyId!)}`),
    enabled: !!selectedCompanyId,
  })

  // Compute ELK layout when data changes (with stale guard)
  useEffect(() => {
    if (!data?.data) return
    let stale = false
    setLayoutReady(false)
    computeElkLayout(data.data)
      .then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        if (stale) return
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
        setLayoutReady(true)
      })
      .catch((err) => {
        if (!stale) console.error('ELK layout failed:', err)
      })
    return () => { stale = true }
  }, [data, setNodes, setEdges])

  if (!selectedCompanyId) {
    return (
      <div className="space-y-6" data-testid="nexus-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">NEXUS 조직도</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500 text-center py-8">사이드바에서 회사를 선택해주세요.</p>
        </div>
      </div>
    )
  }

  if (isLoading || !data) return <NexusSkeleton />

  if (isError) {
    return (
      <div className="space-y-6" data-testid="nexus-page">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">NEXUS 조직도</h1>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-8 space-y-3">
            <p className="text-sm text-red-500">조직도를 불러올 수 없습니다.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    )
  }

  const org = data.data
  const totalAgents = org.departments.reduce((s, d) => s + d.agents.length, 0) + org.unassignedAgents.length
  const isEmpty = org.departments.length === 0 && org.unassignedAgents.length === 0

  return (
    <div className="space-y-4" data-testid="nexus-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-slate-50">NEXUS 조직도</h1>
        <span className="text-xs text-slate-500">
          {org.departments.length}개 부서 · {totalAgents}명 에이전트
        </span>
      </div>

      {isEmpty ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-slate-500">아직 조직이 구성되지 않았습니다.</p>
            <p className="text-xs text-slate-600">부서와 에이전트를 먼저 추가해주세요.</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
          {layoutReady && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              nodesDraggable={true}
              nodesConnectable={false}
              elementsSelectable={true}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.1}
              maxZoom={2}
            >
              <Controls
                className="!bg-slate-800 !border-slate-700 !rounded-lg [&>button]:!bg-slate-800 [&>button]:!border-slate-700 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-700"
              />
              <MiniMap
                nodeColor={miniMapNodeColor}
                maskColor="rgba(15, 23, 42, 0.7)"
                className="!bg-slate-800 !border-slate-700 !rounded-lg"
              />
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
            </ReactFlow>
          )}
        </div>
      )}
    </div>
  )
}
