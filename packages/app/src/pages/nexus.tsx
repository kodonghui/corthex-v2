import { useCallback, useState, useEffect, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useWsStore } from '../stores/ws-store'
import { CompanyNode } from '../components/nexus/CompanyNode'
import { DepartmentNode } from '../components/nexus/DepartmentNode'
import { AgentNode } from '../components/nexus/AgentNode'
import { NexusInfoPanel } from '../components/nexus/NexusInfoPanel'
import { WorkflowListPanel } from '../components/nexus/WorkflowListPanel'
import { WorkflowEditor } from '../components/nexus/WorkflowEditor'
import { getAutoLayout } from '../lib/dagre-layout'
import type { NexusGraphData, NexusGraphNode } from '@corthex/shared'

const nodeTypes = {
  company: CompanyNode,
  department: DepartmentNode,
  agent: AgentNode,
}

type NexusTab = 'org' | 'workflows'

export function NexusPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentTab = (searchParams.get('tab') === 'workflows' ? 'workflows' : 'org') as NexusTab
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges] = useEdgesState<Edge>([])
  const [selectedAgent, setSelectedAgent] = useState<NexusGraphNode | null>(null)
  const [highlightedDeptId, setHighlightedDeptId] = useState<string | null>(null)
  const reactFlowRef = useRef<{ fitView: (opts?: { padding?: number }) => void } | null>(null)

  // WS store
  const wsSubscribe = useWsStore((s) => s.subscribe)
  const addListener = useWsStore((s) => s.addListener)
  const removeListener = useWsStore((s) => s.removeListener)
  const isConnected = useWsStore((s) => s.isConnected)

  // Fetch graph data
  const { data: graphRes, isLoading } = useQuery({
    queryKey: ['nexus-graph'],
    queryFn: () => api.get<{ data: NexusGraphData }>('/workspace/nexus/graph'),
    enabled: currentTab === 'org',
  })

  // WebSocket nexus-updated subscription
  useEffect(() => {
    if (!isConnected) return
    wsSubscribe('nexus')
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ['nexus-graph'] }).then(() => {
        setTimeout(() => reactFlowRef.current?.fitView({ padding: 0.2 }), 100)
      })
    }
    addListener('nexus', handler)
    return () => {
      removeListener('nexus', handler)
    }
  }, [isConnected, wsSubscribe, addListener, removeListener, queryClient])

  // Graph data -> React Flow nodes/edges
  useEffect(() => {
    if (!graphRes?.data) return
    const graph = graphRes.data

    const hasSavedPositions = graph.nodes.some((n) => n.x !== 0 || n.y !== 0)

    const newNodes: Node[] = graph.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: n.x, y: n.y },
      data: {
        label: n.label,
        slug: n.slug,
        description: n.description,
        agentCount: n.agentCount,
        role: n.role,
        status: n.status,
        isSecretary: n.isSecretary,
      },
      draggable: false,
    }))

    const newEdges: Edge[] = graph.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type || 'smoothstep',
      animated: e.animated,
      style: e.style as Record<string, string | number> | undefined,
    }))

    const finalNodes = hasSavedPositions ? newNodes : getAutoLayout(newNodes, newEdges)

    setNodes(finalNodes)
    setEdges(newEdges)
  }, [graphRes, setNodes, setEdges])

  // Highlighted edges/nodes for department click
  const highlightedNodeIds = useMemo(() => {
    if (!highlightedDeptId) return null
    const ids = new Set<string>([highlightedDeptId])
    edges.forEach((e) => {
      if (e.source === highlightedDeptId) ids.add(e.target)
    })
    // Also highlight company parent
    edges.forEach((e) => {
      if (e.target === highlightedDeptId) ids.add(e.source)
    })
    return ids
  }, [highlightedDeptId, edges])

  // Apply opacity styles
  const styledNodes = useMemo(() => {
    if (!highlightedNodeIds) return nodes
    return nodes.map((n) => ({
      ...n,
      style: {
        ...n.style,
        opacity: highlightedNodeIds.has(n.id) ? 1 : 0.3,
        transition: 'opacity 0.2s ease',
      },
    }))
  }, [nodes, highlightedNodeIds])

  const styledEdges = useMemo(() => {
    if (!highlightedNodeIds) return edges
    return edges.map((e) => ({
      ...e,
      style: {
        ...e.style,
        opacity: highlightedNodeIds.has(e.source) && highlightedNodeIds.has(e.target) ? 1 : 0.15,
        transition: 'opacity 0.2s ease',
      },
    }))
  }, [edges, highlightedNodeIds])

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'agent') {
        // Find the graph node data to pass to info panel
        const graphNode = graphRes?.data?.nodes.find((n) => n.id === node.id)
        if (graphNode) {
          setSelectedAgent(graphNode)
          setHighlightedDeptId(null)
        }
      } else if (node.type === 'department') {
        setSelectedAgent(null)
        setHighlightedDeptId((prev) => (prev === node.id ? null : node.id))
      } else {
        setSelectedAgent(null)
        setHighlightedDeptId(null)
      }
    },
    [graphRes],
  )

  const handlePaneClick = useCallback(() => {
    setSelectedAgent(null)
    setHighlightedDeptId(null)
  }, [])

  const setTab = (tab: NexusTab) => {
    if (tab === 'org') {
      setSearchParams({})
    } else {
      setSearchParams({ tab })
    }
    setSelectedWorkflowId(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 + 탭 */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
        <h2 className="text-lg font-semibold">NEXUS</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setTab('org')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              currentTab === 'org'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            조직도
          </button>
          <button
            onClick={() => setTab('workflows')}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
              currentTab === 'workflows'
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            워크플로우
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {currentTab === 'org' ? (
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-zinc-500">조직도를 불러오는 중...</p>
              </div>
            ) : !graphRes?.data?.nodes.length ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-zinc-500">아직 조직도가 구성되지 않았습니다.</p>
              </div>
            ) : (
              <div className="flex-1">
                <ReactFlow
                  nodes={styledNodes}
                  edges={styledEdges}
                  onNodesChange={onNodesChange}
                  nodeTypes={nodeTypes}
                  onNodeClick={handleNodeClick}
                  onPaneClick={handlePaneClick}
                  onInit={(instance) => {
                    reactFlowRef.current = instance
                    instance.fitView({ padding: 0.2 })
                  }}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.2}
                  maxZoom={2}
                  panOnScroll
                  zoomOnPinch
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={true}
                  proOptions={{ hideAttribution: true }}
                >
                  <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#3f3f46" />
                  <Controls />
                  <MiniMap
                    nodeStrokeWidth={3}
                    style={{ width: 150, height: 100 }}
                    className="!bg-zinc-100 dark:!bg-zinc-800"
                  />
                </ReactFlow>
              </div>
            )}
          </div>

          {/* 에이전트 정보 패널 */}
          {selectedAgent && (
            <NexusInfoPanel
              node={selectedAgent}
              onClose={() => setSelectedAgent(null)}
            />
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {selectedWorkflowId ? (
            <WorkflowEditor
              workflowId={selectedWorkflowId}
              onBack={() => setSelectedWorkflowId(null)}
            />
          ) : (
            <WorkflowListPanel onSelect={setSelectedWorkflowId} />
          )}
        </div>
      )}
    </div>
  )
}
