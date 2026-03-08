import { useCallback, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Tabs } from '@corthex/ui'
import type { TabItem } from '@corthex/ui'
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
          <span className="animate-spin text-2xl inline-block mb-2">⏳</span>
          <p className="text-sm text-zinc-400">보고서를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const command = data?.data
  if (!command?.result) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-zinc-400">보고서가 아직 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">보고서</h2>
        {command.completedAt && (
          <span className="text-[10px] text-zinc-400">
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

  // Mobile tab items
  const tabItems: TabItem[] = [
    { value: 'chat', label: '대화' },
    { value: 'report', label: '보고서', disabled: !selectedReportId },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
        <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">🎖️ 사령관실</h1>
        <div className="flex items-center gap-2">
          {activeCommandId && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              <span className="text-xs text-blue-600 dark:text-blue-400">처리 중</span>
            </div>
          )}
          <button
            onClick={() => setShowPresetManager(true)}
            className="px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            title="프리셋 관리"
          >
            ⭐ 프리셋
          </button>
        </div>
      </div>

      {/* Desktop: split view / Mobile: tabs */}
      <div className="flex-1 flex overflow-hidden">
        {/* Large screen: side by side */}
        <div className={`flex-1 flex flex-col min-w-0 ${selectedReportId ? 'hidden lg:flex lg:w-2/5 lg:border-r lg:border-zinc-200 lg:dark:border-zinc-700' : ''}`}>
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
          <div className="hidden lg:flex lg:flex-col lg:flex-1 min-w-0">
            <div className="flex items-center justify-between px-4 h-10 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
              <span className="text-xs text-zinc-400">보고서 패널</span>
              <button
                onClick={() => { setSelectedReport(null); setViewMode('chat') }}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                ✕ 닫기
              </button>
            </div>
            <ReportPanel commandId={selectedReportId} onDetailClick={() => setDetailModalId(selectedReportId)} />
          </div>
        )}

        {/* Mobile tabs */}
        {selectedReportId && (
          <div className="flex flex-col flex-1 lg:hidden">
            <div className="border-b border-zinc-200 dark:border-zinc-700">
              <Tabs
                items={tabItems}
                value={viewMode}
                onChange={(v) => setViewMode(v as 'chat' | 'report')}
              />
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
              <ReportPanel commandId={selectedReportId} onDetailClick={() => setDetailModalId(selectedReportId)} />
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
