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
import { sketchVibeNodeTypes } from '../../../components/sketchvibe/sketchvibe-nodes'
import { sketchVibeEdgeTypes } from '../../../components/sketchvibe/editable-edge'
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
    navigate('/sketchvibe')
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
    <div data-testid={`sketch-preview-${commandId}`} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-2">
      {/* Mini canvas preview */}
      <div className="h-48 bg-slate-900/50 relative">
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
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            다이어그램 미리보기를 로드할 수 없습니다
          </div>
        )}
      </div>

      {/* Action buttons / Save dialog */}
      {showSaveDialog ? (
        <div className="flex items-center gap-2 p-3 border-t border-slate-700">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white outline-none"
            placeholder="스케치 이름"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setShowSaveDialog(false) }}
          />
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="text-xs px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            {saveMutation.isPending ? '저장 중...' : '확인'}
          </button>
          <button
            onClick={() => setShowSaveDialog(false)}
            className="text-xs px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 border-t border-slate-700">
          <button
            onClick={handleOpenInEditor}
            aria-label="SketchVibe에서 열기"
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            SketchVibe에서 열기
          </button>
          <button
            onClick={() => setShowSaveDialog(true)}
            aria-label="저장"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            저장
          </button>
          <button
            onClick={handleCopyMermaid}
            aria-label="Mermaid 코드 복사"
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:outline-none"
          >
            {copyToast ? '복사됨!' : 'Mermaid 복사'}
          </button>
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
    <div data-testid="sketch-loading" className="h-32 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center mt-2">
      <span className="text-sm text-slate-400 animate-pulse">다이어그램 생성 중...</span>
    </div>
  )
}

/**
 * SketchErrorCard — /스케치 명령 실패 시 에러 표시
 */
export function SketchErrorCard({ error }: { error: string }) {
  return (
    <div className="bg-red-950/50 border border-red-900/50 rounded-xl px-4 py-3 mt-2">
      <p className="text-sm text-red-400">다이어그램 생성에 실패했습니다.</p>
      <p className="text-xs text-red-500 mt-1">{error}</p>
    </div>
  )
}
