import { useCallback, useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { useCommandCenter } from '../../hooks/use-command-center'
import { useCommandStore } from '../../stores/command-store'
import { usePresets } from '../../hooks/use-presets'
import { api } from '../../lib/api'
import { ReportDetailModal } from '../../components/chat/report-detail-modal'
import { MessageThread } from './components/message-thread'
import { CommandInput } from './components/command-input'
import { PipelineVisualization } from './components/pipeline-visualization'
import { DeliverableViewer } from './components/deliverable-viewer'
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

export function CommandCenterPage() {
  const { messages, historyLoading, submitCommand, isSubmitting, managers, deptMap } = useCommandCenter()
  const { selectedReportId, viewMode, setSelectedReport, setViewMode, activeCommandId, delegationSteps } = useCommandStore()
  const { presets, createPreset, updatePreset, deletePreset, executePreset, isCreating, isExecuting } = usePresets()
  const [detailModalId, setDetailModalId] = useState<string | null>(null)
  const [showPresetManager, setShowPresetManager] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileTab, setMobileTab] = useState<'chat' | 'report'>('chat')

  const { data: selectedCommandData } = useQuery({
    queryKey: ['command', selectedReportId],
    queryFn: () => api.get<{ data: CommandDetail }>(`/workspace/commands/${selectedReportId}`),
    enabled: !!selectedReportId,
  })

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
      setMobileTab('report')
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

  const presetItems = presets.map((p) => ({
    id: p.id,
    name: p.name,
    command: p.command,
    description: p.description,
    category: p.category,
  }))

  const selectedCommand = selectedCommandData?.data
  const activeSteps = delegationSteps.filter((s) => s.commandId === activeCommandId)

  return (
    <div
      data-testid="command-center-page"
      className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
    >
      {/* Pipeline bar — always visible at top */}
      <PipelineVisualization
        activeCommandId={activeCommandId}
        delegationSteps={activeSteps}
      />

      {/* Mobile tab bar — only shown on small screens, above content */}
      <div className="flex md:hidden border-b border-slate-700/60">
        <button
          data-testid="mobile-tab-chat"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-all ${
            mobileTab === 'chat'
              ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            대화
          </span>
        </button>
        <button
          data-testid="mobile-tab-report"
          onClick={() => setMobileTab('report')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-all ${
            mobileTab === 'report'
              ? 'text-violet-400 border-b-2 border-violet-400 bg-violet-500/5'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            보고서
          </span>
        </button>
      </div>

      {/* Main body: left thread + right report, fills remaining height */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left column: message thread */}
        <div
          className={`w-[420px] flex-col border-r border-slate-700/40
            ${mobileTab === 'chat' ? 'flex' : 'hidden md:flex'}`}
        >
          <MessageThread
            messages={messages}
            isLoading={historyLoading}
            onReportClick={handleReportClick}
            onExampleClick={submitCommand}
            selectedCommandId={selectedReportId}
          />
        </div>

        {/* Right column: deliverable viewer */}
        <div
          className={`flex-1 flex flex-col min-w-0
            ${mobileTab === 'report' ? 'flex' : 'hidden'}
            md:flex`}
        >
          <DeliverableViewer
            commandId={selectedReportId}
            command={selectedCommand}
            onDetailClick={() => selectedReportId && setDetailModalId(selectedReportId)}
            onClose={() => {
              setSelectedReport(null)
              setViewMode('chat')
              setMobileTab('chat')
            }}
          />
        </div>
      </div>

      {/* Command input — pinned to bottom */}
      <CommandInput
        onSubmit={submitCommand}
        isSubmitting={isSubmitting}
        managers={managers}
        deptMap={deptMap}
        presets={presetItems}
        onOpenPresets={() => setShowPresetManager(true)}
      />

      {/* Modals */}
      {detailModalId && (
        <ReportDetailModal
          isOpen={!!detailModalId}
          onClose={() => setDetailModalId(null)}
          commandId={detailModalId}
        />
      )}

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
