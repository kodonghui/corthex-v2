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

function QualityBadge({ passed }: { passed: boolean }) {
  return (
    <span
      data-testid="quality-badge"
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-sm border ${
        passed
          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
          : 'bg-red-950/60 text-red-400 border-red-800/60'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {passed ? 'PASS' : 'FAIL'}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
      <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zinc-600">
          <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 8h6M7 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-500">No deliverable selected</p>
        <p className="text-xs text-zinc-700 mt-1">Click a message in the thread to view its output</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3">
      <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-corthex-accent animate-spin" />
      <p className="text-xs text-zinc-600">Loading deliverable...</p>
    </div>
  )
}

export function DeliverableViewer({ commandId, command, onDetailClick, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'deliverables' | 'deliverable'>('deliverables')

  const qualityGate = command?.metadata?.qualityGate as { passed: boolean; totalScore: number } | undefined

  if (!commandId) {
    return (
      <div data-testid="report-panel" className="flex flex-col h-full bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-600">
              <rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-zinc-500">Deliverables</span>
          </div>
        </div>
        <EmptyState />
      </div>
    )
  }

  if (!command) {
    return (
      <div data-testid="report-panel" className="flex flex-col h-full bg-zinc-950">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
          <span className="text-xs font-semibold text-zinc-500">Deliverables</span>
        </div>
        <LoadingState />
      </div>
    )
  }

  return (
    <div data-testid="report-panel" className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-zinc-500 flex-shrink-0">
              <rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span className="text-xs font-semibold text-zinc-400 truncate max-w-[160px]" title={command.text}>
              {command.text?.slice(0, 40)}{command.text?.length > 40 ? '…' : ''}
            </span>
          </div>
          {qualityGate && <QualityBadge passed={qualityGate.passed} />}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Expand button */}
          <button
            onClick={onDetailClick}
            title="Open full view"
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M8 2h3v3M5 11H2V8M11 2l-4 4M2 11l4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {/* Close button */}
          <button
            onClick={onClose}
            title="Close"
            className="w-7 h-7 flex items-center justify-center rounded-md text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-0 px-4 border-b border-zinc-800 flex-shrink-0">
        {(['deliverables', 'deliverable'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-1 mr-4 text-xs font-medium border-b-2 -mb-px transition-colors capitalize ${
              activeTab === tab
                ? 'border-corthex-accent text-zinc-100'
                : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {tab === 'deliverables' ? 'Overview' : 'Deliverable'}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {command.result ? (
          <div
            className="p-5 prose prose-sm prose-invert max-w-none
              prose-headings:text-zinc-100 prose-headings:font-semibold
              prose-p:text-zinc-400 prose-p:leading-relaxed
              prose-a:text-corthex-accent-dark prose-a:no-underline hover:prose-a:underline
              prose-code:text-zinc-300 prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800
              prose-blockquote:border-l-zinc-700 prose-blockquote:text-zinc-500
              prose-strong:text-zinc-200
              prose-li:text-zinc-400
              prose-hr:border-zinc-800
              prose-table:text-sm
              prose-th:text-zinc-300 prose-th:border-zinc-700
              prose-td:text-zinc-500 prose-td:border-zinc-800
              cursor-pointer"
            onClick={onDetailClick}
          >
            <MarkdownRenderer content={command.result} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 h-full gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-800 border-t-zinc-600 animate-spin" />
            <p className="text-xs text-zinc-600">Waiting for output...</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2 border-t border-zinc-800 flex-shrink-0">
        <p className="text-[10px] text-zinc-700">Click to open full view</p>
      </div>
    </div>
  )
}
