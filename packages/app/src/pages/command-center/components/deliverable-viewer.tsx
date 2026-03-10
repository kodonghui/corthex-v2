import { useState } from 'react'
import { MarkdownRenderer } from '../../../components/markdown-renderer'

type CommandDetail = {
  id: string
  text: string
  type: string
  status: string
  result: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  completedAt: string | null
}

type Props = {
  commandId: string | null
  command: CommandDetail | undefined
  onDetailClick: () => void
  onClose: () => void
}

export function DeliverableViewer({ commandId, command, onDetailClick, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deliverable'>('overview')

  const qualityGate = command?.metadata?.qualityGate as { passed: boolean; totalScore: number } | undefined

  // Empty state — no command selected
  if (!commandId) {
    return (
      <div data-testid="deliverable-viewer" className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col items-center justify-center h-full">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-slate-700 mb-3">
            <rect x="10" y="6" width="28" height="36" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M18 18h12M18 24h12M18 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-slate-500">산출물이 선택되지 않았습니다</p>
          <p className="text-xs text-slate-600 mt-1">왼쪽에서 명령을 선택하세요</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!command) {
    return (
      <div data-testid="deliverable-viewer" className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div data-testid="deliverable-viewer" className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-200 truncate">
            {command.text?.slice(0, 40)}{command.text?.length > 40 ? '…' : ''}
          </span>
          {qualityGate && (
            <span
              data-testid={`quality-badge-${command.id}`}
              className={`text-xs px-1.5 py-0.5 rounded border ${
                qualityGate.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              {qualityGate.passed ? 'PASS' : 'FAIL'} {qualityGate.totalScore}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDetailClick}
            title="전체 보기"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={onClose}
            title="닫기"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 shrink-0">
        <button
          data-testid="viewer-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          개요
        </button>
        <button
          data-testid="viewer-tab-deliverable"
          onClick={() => setActiveTab('deliverable')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'deliverable'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          산출물
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {command.result ? (
          <div
            className="prose prose-sm prose-invert max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-slate-200 prose-code:text-cyan-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-blue-400 prose-blockquote:border-slate-600 prose-blockquote:text-slate-400 prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700 cursor-pointer"
            onClick={onDetailClick}
          >
            <MarkdownRenderer content={command.result} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
            <p className="text-xs text-slate-600">결과 대기 중...</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <p className="text-xs text-slate-600 text-center py-2">클릭하여 전체 보기</p>
    </div>
  )
}
