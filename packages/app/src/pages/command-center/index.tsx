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
      className="flex flex-col h-full bg-slate-900"
    >
      {/* Pipeline bar — always visible at top */}
      <PipelineVisualization
        activeCommandId={activeCommandId}
        delegationSteps={activeSteps}
      />

      {/* Mobile tab bar — only shown on small screens, above content */}
      <div className="flex md:hidden border-b border-slate-700">
        <button
          data-testid="mobile-tab-chat"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            mobileTab === 'chat'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-500'
          }`}
        >
          대화
        </button>
        <button
          data-testid="mobile-tab-report"
          onClick={() => setMobileTab('report')}
          className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
            mobileTab === 'report'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-500'
          }`}
        >
          보고서
        </button>
      </div>

      {/* Main body: left thread + right report, fills remaining height */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ── Left column: message thread ── */}
        <div
          className={`w-[420px] flex-col border-r border-slate-700
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

        {/* ── Right column: deliverable viewer ── */}
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
