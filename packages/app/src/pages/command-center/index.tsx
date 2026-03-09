import { useCallback, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useCommandCenter } from '../../hooks/use-command-center'
import { useCommandStore } from '../../stores/command-store'
import { usePresets } from '../../hooks/use-presets'
import { api } from '../../lib/api'
import { ReportView } from '../../components/chat/report-view'
import { ReportDetailModal } from '../../components/chat/report-detail-modal'
import { MessageList } from './components/message-list'
import { CommandInput } from './components/command-input'
import { DelegationChain } from './components/delegation-chain'
import { PresetManager } from './components/preset-manager'

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

function ReportPanel({ commandId, onDetailClick }: { commandId: string; onDetailClick: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['command', commandId],
    queryFn: () => api.get<{ data: CommandDetail }>(`/workspace/commands/${commandId}`),
    enabled: !!commandId,
  })

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">보고서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const command = data?.data
  if (!command?.result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zinc-400">
              <path d="M6 2H14C15.1 2 16 2.9 16 4V16C16 17.1 15.1 18 14 18H6C4.9 18 4 17.1 4 16V4C4 2.9 4.9 2 6 2Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7 7H13M7 10H13M7 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">보고서가 아직 없습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">보고서</h2>
        {command.completedAt && (
          <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
            {new Date(command.completedAt).toLocaleString('ko-KR')}
          </span>
        )}
      </div>
      <ReportView
        commandId={commandId}
        result={command.result}
        metadata={command.metadata}
        onDetailClick={onDetailClick}
      />
    </div>
  )
}

export function CommandCenterPage() {
  const { messages, historyLoading, submitCommand, isSubmitting, managers, deptMap } = useCommandCenter()
  const { selectedReportId, viewMode, setSelectedReport, setViewMode, activeCommandId } = useCommandStore()
  const { presets, createPreset, updatePreset, deletePreset, executePreset, isCreating, isExecuting } = usePresets()
  const [detailModalId, setDetailModalId] = useState<string | null>(null)
  const [showPresetManager, setShowPresetManager] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  // Replay: auto-submit from ops-log redirect
  useEffect(() => {
    const replayText = searchParams.get('replay')
    if (replayText && !isSubmitting && !historyLoading) {
      submitCommand(decodeURIComponent(replayText))
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, submitCommand, isSubmitting, historyLoading, setSearchParams])

  const handleReportClick = useCallback(
    (commandId: string) => {
      setSelectedReport(commandId)
      setViewMode('report')
    },
    [setSelectedReport, setViewMode],
  )

  const handleExecutePreset = useCallback(
    async (presetId: string) => {
      try {
        await executePreset(presetId)
      } catch {
        // error shown by toast
      }
    },
    [executePreset],
  )

  // Map presets to SlashPopup format
  const presetItems = presets.map((p) => ({
    id: p.id,
    name: p.name,
    command: p.command,
    description: p.description,
    category: p.category,
  }))

  return (
    <div data-testid="command-center-page" className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-5 h-12 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">작업 위임 파이프라인</h1>
          {activeCommandId && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500" />
              </span>
              <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400">처리 중</span>
            </div>
          )}
        </div>
        <button
          data-testid="preset-manager-btn"
          onClick={() => setShowPresetManager(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1L7.5 4H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4H4.5L6 1Z" fill="currentColor" />
          </svg>
          프리셋
        </button>
      </div>

      {/* Desktop: split view / Mobile: tabs */}
      <div className="flex-1 flex overflow-hidden">
        {/* Large screen: side by side */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedReportId ? 'hidden lg:flex lg:w-2/5 lg:border-r lg:border-zinc-200 lg:dark:border-zinc-800' : ''}`}>
          <MessageList
            messages={messages}
            isLoading={historyLoading}
            onReportClick={handleReportClick}
            onExampleClick={submitCommand}
          />
          <DelegationChain />
          <CommandInput
            onSubmit={submitCommand}
            isSubmitting={isSubmitting}
            managers={managers}
            deptMap={deptMap}
            presets={presetItems}
          />
        </div>

        {/* Report panel - large screen */}
        {selectedReportId && (
          <div data-testid="report-panel" className="hidden lg:flex lg:flex-col lg:flex-1 min-w-0 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center justify-between px-5 h-10 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">보고서</span>
              <button
                onClick={() => { setSelectedReport(null); setViewMode('chat') }}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                닫기
              </button>
            </div>
            <ReportPanel commandId={selectedReportId} onDetailClick={() => setDetailModalId(selectedReportId)} />
          </div>
        )}

        {/* Mobile tabs */}
        {selectedReportId && (
          <div className="flex flex-col flex-1 lg:hidden">
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <button
                data-testid="view-tab-chat"
                onClick={() => setViewMode('chat')}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  viewMode === 'chat'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                대화
              </button>
              <button
                data-testid="view-tab-report"
                onClick={() => setViewMode('report')}
                disabled={!selectedReportId}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                  viewMode === 'report'
                    ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                보고서
              </button>
            </div>
            {viewMode === 'chat' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <MessageList
                  messages={messages}
                  isLoading={historyLoading}
                  onReportClick={handleReportClick}
                  onExampleClick={submitCommand}
                />
                <DelegationChain />
                <CommandInput
                  onSubmit={submitCommand}
                  isSubmitting={isSubmitting}
                  managers={managers}
                  deptMap={deptMap}
                  presets={presetItems}
                />
              </div>
            ) : (
              <div data-testid="report-panel">
                <ReportPanel commandId={selectedReportId} onDetailClick={() => setDetailModalId(selectedReportId)} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {detailModalId && (
        <ReportDetailModal
          isOpen={!!detailModalId}
          onClose={() => setDetailModalId(null)}
          commandId={detailModalId}
        />
      )}

      {/* Preset Manager Modal */}
      {showPresetManager && (
        <PresetManager
          presets={presets}
          onClose={() => setShowPresetManager(false)}
          onCreate={createPreset}
          onUpdate={updatePreset}
          onDelete={deletePreset}
          onExecute={handleExecutePreset}
          isCreating={isCreating}
          isExecuting={isExecuting}
        />
      )}
    </div>
  )
}
