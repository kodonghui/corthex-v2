/**
 * SketchPreviewCard — 사령관실에서 /스케치 결과를 미리보기로 표시
 * Mermaid → ReactFlow 미니 캔버스 렌더링 + 액션 버튼
 */
import { useCallback, useMemo, useState } from 'react'
import { ReactFlow, Background, BackgroundVariant, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { mermaidToCanvas } from '../../../lib/mermaid-to-canvas'
import { sketchVibeNodeTypes } from '../../../components/nexus/sketchvibe-nodes'
import { sketchVibeEdgeTypes } from '../../../components/nexus/editable-edge'
import { api } from '../../../lib/api'

type Props = {
  mermaid: string
  description: string
  commandId: string
}

export function SketchPreviewCard({ mermaid, description, commandId }: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState(description.slice(0, 50) || '새 다이어그램')
  const [copyToast, setCopyToast] = useState(false)

  // Convert Mermaid to ReactFlow nodes/edges
  const { nodes, edges } = useMemo(() => {
    try {
      const result = mermaidToCanvas(mermaid)
      return { nodes: result.nodes, edges: result.edges }
    } catch {
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }
  }, [mermaid])

  // Save sketch mutation
  const saveMutation = useMutation({
    mutationFn: (name: string) =>
      api.post<{ data: { id: string } }>('/workspace/sketches', {
        name,
        graphData: { nodes, edges },
      }),
    onSuccess: () => {
      setShowSaveDialog(false)
      queryClient.invalidateQueries({ queryKey: ['sketches'] })
    },
  })

  // Open in SketchVibe editor
  const handleOpenInEditor = useCallback(() => {
    sessionStorage.setItem('pendingGraphData', JSON.stringify({ nodes, edges }))
    navigate('/nexus')
  }, [nodes, edges, navigate])

  // Copy Mermaid to clipboard
  const handleCopyMermaid = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mermaid)
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 2000)
    } catch {
      // Clipboard API fallback
    }
  }, [mermaid])

  // Save dialog submit
  const handleSave = useCallback(() => {
    if (saveName.trim()) {
      saveMutation.mutate(saveName.trim())
    }
  }, [saveName, saveMutation])

  return (
    <div data-testid="sketch-preview" className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
      {/* Mini canvas preview */}
      <div className="h-48 bg-zinc-50 dark:bg-zinc-900 relative">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={sketchVibeNodeTypes}
            edgeTypes={sketchVibeEdgeTypes}
            fitView
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-zinc-400">
            다이어그램 미리보기를 로드할 수 없습니다
          </div>
        )}
      </div>

      {/* Description */}
      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700">
        <p className="text-xs text-zinc-600 dark:text-zinc-300">{description}</p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 px-3 py-2 border-t border-zinc-100 dark:border-zinc-700">
        <button
          onClick={handleOpenInEditor}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          SketchVibe에서 열기
        </button>
        <button
          onClick={() => setShowSaveDialog(true)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          저장
        </button>
        <button
          onClick={handleCopyMermaid}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors relative"
        >
          {copyToast ? '복사됨!' : 'Mermaid 복사'}
        </button>
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
          <label className="text-xs text-zinc-500 mb-1 block">스케치 이름</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSaveDialog(false) }}
            />
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saveMutation.isPending ? '저장 중...' : '확인'}
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-600 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              취소
            </button>
          </div>
          {saveMutation.isSuccess && (
            <p className="text-xs text-emerald-600 mt-1">스케치가 저장되었습니다</p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * SketchLoadingCard — /스케치 명령 처리 중 로딩 표시
 */
export function SketchLoadingCard() {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-800">
      <div className="h-32 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <span className="animate-spin text-2xl inline-block mb-2">🎨</span>
          <p className="text-xs text-zinc-400">다이어그램 생성 중...</p>
        </div>
      </div>
    </div>
  )
}

/**
 * SketchErrorCard — /스케치 명령 실패 시 에러 표시
 */
export function SketchErrorCard({ error }: { error: string }) {
  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 overflow-hidden bg-red-50 dark:bg-red-900/20 px-4 py-3">
      <p className="text-sm text-red-600 dark:text-red-400">다이어그램 생성에 실패했습니다.</p>
      <p className="text-xs text-red-500 dark:text-red-500 mt-1">{error}</p>
    </div>
  )
}
