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

  // Fetch selected command details
  const { data: selectedCommandData } = useQuery({
    queryKey: ['command', selectedReportId],
    queryFn: () => api.get<{ data: CommandDetail }>(`/workspace/commands/${selectedReportId}`),
    enabled: !!selectedReportId,
  })

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

  const selectedCommand = selectedCommandData?.data

  return (
    <div data-testid="command-center-page" className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Task delegation pipeline</h1>
      </div>

      {/* Pipeline Visualization */}
      <PipelineVisualization
        activeCommandId={activeCommandId}
        delegationSteps={delegationSteps.filter((s) => s.commandId === activeCommandId)}
      />

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Message Thread */}
        <div className="w-1/2 flex flex-col border-r border-zinc-200 dark:border-zinc-800 min-w-0">
          <MessageThread
            messages={messages}
            isLoading={historyLoading}
            onReportClick={handleReportClick}
            onExampleClick={submitCommand}
            selectedCommandId={selectedReportId}
          />
        </div>

        {/* Right Column - Deliverable Viewer */}
        <div className="w-1/2 flex flex-col min-w-0 bg-zinc-50/50 dark:bg-zinc-900/30">
          <DeliverableViewer
            commandId={selectedReportId}
            command={selectedCommand}
            onDetailClick={() => selectedReportId && setDetailModalId(selectedReportId)}
            onClose={() => {
              setSelectedReport(null)
              setViewMode('chat')
            }}
          />
        </div>
      </div>

      {/* Command Input - Full Width at Bottom */}
      <CommandInput
        onSubmit={submitCommand}
        isSubmitting={isSubmitting}
        managers={managers}
        deptMap={deptMap}
        presets={presetItems}
        onOpenPresets={() => setShowPresetManager(true)}
      />

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
