import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { NexusGraphNode } from '@corthex/shared'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  online: { label: '온라인', color: 'bg-green-400' },
  working: { label: '작업 중', color: 'bg-yellow-400' },
  error: { label: '오류', color: 'bg-red-400' },
  offline: { label: '오프라인', color: 'bg-zinc-300' },
}

type Props = {
  node: NexusGraphNode
  onClose: () => void
}

export function NexusInfoPanel({ node, onClose }: Props) {
  const navigate = useNavigate()
  const statusInfo = STATUS_LABELS[node.status || 'offline'] || STATUS_LABELS.offline

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="w-72 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 overflow-y-auto transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">에이전트 정보</h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-lg leading-none"
          aria-label="닫기"
        >
          &times;
        </button>
      </div>

      <div className="space-y-3">
        {/* 이름 + 상태 */}
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`} />
          <span className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{node.label}</span>
        </div>

        {/* 역할 */}
        {node.role && (
          <div>
            <span className="text-xs text-zinc-500">역할</span>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">{node.role}</p>
          </div>
        )}

        {/* 소울 한 줄 */}
        {node.soul && (
          <div>
            <p className="text-xs text-zinc-500 italic">"{node.soul}"</p>
          </div>
        )}

        {/* 상태 */}
        <div>
          <span className="text-xs text-zinc-500">상태</span>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{statusInfo.label}</p>
        </div>

        {node.isSecretary && (
          <span className="inline-block text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded">
            비서실장
          </span>
        )}

        <hr className="border-zinc-200 dark:border-zinc-700" />

        {/* 채팅하기 */}
        <button
          onClick={() => navigate(`/chat?agentId=${node.agentId}`)}
          className="w-full py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
        >
          채팅하기
        </button>
      </div>
    </div>
  )
}
