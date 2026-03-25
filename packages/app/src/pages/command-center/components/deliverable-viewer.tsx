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
          <div className="w-16 h-16 rounded-2xl bg-corthex-elevated border border-corthex-border flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-corthex-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-corthex-text-secondary">산출물이 선택되지 않았습니다</p>
          <p className="text-xs text-corthex-text-secondary mt-1">왼쪽에서 명령을 선택하세요</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (!command) {
    return (
      <div data-testid="deliverable-viewer" className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-corthex-border border-t-corthex-accent animate-spin" />
          <p className="text-xs text-corthex-text-secondary">결과를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="deliverable-viewer" className="flex-1 flex flex-col min-w-0">
      {/* Header — gradient accent */}
      <div className="relative overflow-hidden border-b border-corthex-border shrink-0">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-corthex-accent/15 flex items-center justify-center shrink-0">
              <svg className="w-4.5 h-4.5 text-corthex-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-corthex-text-primary truncate block">
                {command.text?.slice(0, 50)}{command.text?.length > 50 ? '…' : ''}
              </span>
              {command.createdAt && (
                <span className="text-xs text-corthex-text-secondary font-mono">{new Date(command.createdAt).toLocaleString('ko-KR')}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {qualityGate && (
              <span
                data-testid={`quality-badge-${command.id}`}
                aria-describedby={`quality-score-${command.id}`}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  qualityGate.passed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${qualityGate.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span id={`quality-score-${command.id}`}>{qualityGate.passed ? 'PASS' : 'FAIL'} {qualityGate.totalScore}</span>
              </span>
            )}
            <button
              onClick={onDetailClick}
              title="전체 보기"
              aria-label="전체 보기"
              className="p-2 rounded-xl text-corthex-text-secondary hover:text-corthex-text-primary hover:bg-corthex-elevated transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-corthex-accent/50 focus-visible:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 2h4v4M6 14H2v-4M14 2l-5 5M2 14l5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={onClose}
              title="닫기"
              aria-label="닫기"
              className="p-2 rounded-xl text-corthex-text-secondary hover:text-corthex-text-primary hover:bg-corthex-elevated transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-corthex-accent/50 focus-visible:outline-none"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-corthex-border shrink-0 px-1">
        <button
          data-testid="viewer-tab-overview"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-corthex-accent border-b-2 border-corthex-accent'
              : 'text-corthex-text-secondary hover:text-corthex-text-primary border-b-2 border-transparent'
          }`}
        >
          개요
        </button>
        <button
          data-testid="viewer-tab-deliverable"
          onClick={() => setActiveTab('deliverable')}
          className={`px-4 py-3 text-sm font-medium transition-all cursor-pointer ${
            activeTab === 'deliverable'
              ? 'text-corthex-accent border-b-2 border-corthex-accent'
              : 'text-corthex-text-secondary hover:text-corthex-text-primary border-b-2 border-transparent'
          }`}
        >
          산출물
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {command.result ? (
          <>
            {/* Content sanitization is handled by MarkdownRenderer (no dangerouslySetInnerHTML) */}
            <div
              className="prose prose-sm prose-invert max-w-none prose-headings:text-corthex-text-primary prose-p:text-corthex-text-secondary prose-strong:text-corthex-text-primary prose-code:text-corthex-accent prose-code:bg-corthex-elevated prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-a:text-corthex-accent prose-blockquote:border-corthex-border prose-blockquote:text-corthex-text-secondary prose-pre:bg-corthex-elevated prose-pre:border prose-pre:border-corthex-border prose-pre:rounded-xl cursor-pointer"
              onClick={onDetailClick}
            >
              <MarkdownRenderer content={command.result} />
            </div>
            <p className="text-xs text-corthex-text-secondary text-center py-2 border-t border-corthex-border/30">클릭하여 전체 보기</p>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-corthex-border border-t-corthex-accent animate-spin" />
            <p className="text-xs text-corthex-text-secondary">결과 대기 중...</p>
          </div>
        )}
      </div>
    </div>
  )
}
