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
      className="h-full flex flex-col bg-zinc-950 overflow-hidden"
    >
      {/* Pipeline bar — always visible at top */}
      <PipelineVisualization
        activeCommandId={activeCommandId}
        delegationSteps={activeSteps}
      />

      {/* Main body: left thread + right report, fills remaining height */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left column: message thread ── */}
        <div
          className={`flex flex-col border-r border-zinc-800 min-w-0
            ${mobileTab === 'chat' ? 'flex' : 'hidden'}
            md:flex md:w-[420px] lg:w-[480px] xl:w-[520px]`}
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

      {/* Mobile tab switcher — only shown on small screens */}
      <div className="md:hidden flex border-t border-zinc-800 bg-zinc-950">
        <button
          data-testid="view-tab-chat"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            mobileTab === 'chat'
              ? 'text-zinc-100 border-t-2 border-corthex-accent -mt-px'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Thread
        </button>
        <button
          data-testid="view-tab-report"
          onClick={() => setMobileTab('report')}
          className={`flex-1 py-3 text-xs font-medium transition-colors ${
            mobileTab === 'report'
              ? 'text-zinc-100 border-t-2 border-corthex-accent -mt-px'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Deliverable
        </button>
      </div>

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
