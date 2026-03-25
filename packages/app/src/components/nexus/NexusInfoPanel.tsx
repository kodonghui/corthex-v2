import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MessageSquare, Shield } from 'lucide-react'
import type { NexusGraphNode } from '@corthex/shared'

const STATUS_LABELS: Record<string, { label: string; color: string; dotColor: string }> = {
  online: { label: '온라인', color: 'text-emerald-400', dotColor: 'bg-emerald-400' },
  working: { label: '작업 중', color: 'text-amber-400', dotColor: 'bg-amber-400' },
  error: { label: '오류', color: 'text-red-400', dotColor: 'bg-red-400' },
  offline: { label: '오프라인', color: 'text-stone-500', dotColor: 'bg-slate-500' },
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
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const panelContent = (
    <div className="space-y-4">
      {/* Name + Status */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`} />
          <span className="text-base font-semibold text-corthex-text-primary">{node.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium uppercase tracking-wider ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Role */}
      {node.role && (
        <div>
          <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">역할</span>
          <p className="text-sm text-stone-600 mt-1">{node.role}</p>
        </div>
      )}

      {/* Soul */}
      {node.soul && (
        <div className="bg-stone-100/50 p-3 rounded-lg border border-stone-200/50">
          <p className="text-xs text-stone-500 italic leading-relaxed">"{node.soul}"</p>
        </div>
      )}

      {node.isSecretary && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">비서실장</span>
        </div>
      )}

      <hr className="border-stone-200" />

      {/* Chat action */}
      {node.agentId && (
        <button
          onClick={() => navigate(`/chat?agentId=${node.agentId}`)}
          className="w-full py-2.5 bg-corthex-accent/10 text-corthex-accent border border-corthex-accent/20 text-sm font-medium rounded-lg hover:bg-corthex-accent/20 transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          채팅하기
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: bottom slide-up sheet */}
      <div className="md:hidden fixed inset-0 z-40" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40" />
        <div
          className="absolute bottom-0 inset-x-0 bg-corthex-surface border-t border-stone-200 rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto [-webkit-overflow-scrolling:touch] animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 bg-stone-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-corthex-text-primary">에이전트 정보</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:text-corthex-text-primary hover:bg-stone-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {panelContent}
        </div>
      </div>

      {/* Desktop: right sidebar */}
      <div className="hidden md:flex flex-col w-80 border-l border-stone-200 bg-corthex-surface/80 backdrop-blur-md overflow-y-auto transition-all">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-corthex-text-primary">에이전트 정보</h3>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-500 hover:text-corthex-text-primary hover:bg-stone-100 transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          {panelContent}
        </div>
      </div>
    </>
  )
}
