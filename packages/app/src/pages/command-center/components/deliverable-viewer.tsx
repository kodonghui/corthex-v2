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

function StatusBadge({ status }: { status: string }) {
  const isSuccess = status === 'COMPLETED'
  const isFailed = status === 'FAILED'
  
  if (isFailed) {
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        FAIL
      </span>
    )
  }
  if (isSuccess) {
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        PASS
      </span>
    )
  }
  return null
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-400">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Select a message to view deliverables</p>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading deliverables...</p>
      </div>
    </div>
  )
}

export function DeliverableViewer({ commandId, command, onDetailClick, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'deliverables' | 'deliverable'>('deliverables')

  if (!commandId) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Deliverable Viewer</h2>
          <div className="flex items-center gap-2">
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="3" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                <circle cx="13" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        <EmptyState />
      </div>
    )
  }

  if (!command) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Deliverable Viewer</h2>
        </div>
        <LoadingState />
      </div>
    )
  }

  const qualityGate = command.metadata?.qualityGate as { passed: boolean; totalScore: number } | undefined

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Deliverable Viewer</h2>
        <div className="flex items-center gap-2">
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="3" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              <circle cx="13" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('deliverables')}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            activeTab === 'deliverables'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Deliverables
        </button>
        <button
          onClick={() => setActiveTab('deliverable')}
          className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
            activeTab === 'deliverable'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Deliverable
        </button>
        <div className="ml-auto flex items-center gap-2">
          {qualityGate && (
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 ${
                qualityGate.passed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${qualityGate.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {qualityGate.passed ? 'PASS' : 'FAIL'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {command.result ? (
          <div className="prose prose-sm dark:prose-invert max-w-none" onClick={onDetailClick}>
            <MarkdownRenderer content={command.result} />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No deliverables available yet.</p>
          </div>
        )}
      </div>

      {/* Hover tooltip hint */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 text-right">
        <span className="text-[10px] text-zinc-400">Hover tooltip</span>
      </div>
    </div>
  )
}
