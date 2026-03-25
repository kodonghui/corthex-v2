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

  // Compute KPI stats from messages
  const userMsgCount = messages.filter((m) => m.role === 'user').length
  const agentMsgCount = messages.filter((m) => m.role === 'agent').length
  const activeAgentCount = managers.filter((m) => m.status === 'ACTIVE').length
  const completedSteps = activeSteps.filter((s) => s.event.includes('COMPLETED') || s.event.includes('PASSED')).length

  return (
    <div
      data-testid="command-center-page"
      className="flex flex-col h-full bg-corthex-bg antialiased"
    >
      {/* Mobile tab bar */}
      <div className="flex md:hidden border-b border-stone-200 shrink-0">
        <button
          data-testid="mobile-tab-chat"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            mobileTab === 'chat'
              ? 'text-corthex-accent border-b-2 border-corthex-accent'
              : 'text-stone-400 hover:text-stone-500'
          }`}
        >
          대화
        </button>
        <button
          data-testid="mobile-tab-report"
          onClick={() => setMobileTab('report')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            mobileTab === 'report'
              ? 'text-corthex-accent border-b-2 border-corthex-accent'
              : 'text-stone-400 hover:text-stone-500'
          }`}
        >
          보고서
        </button>
      </div>

      {/* Main Content Grid: Left command thread (flex-8) + Right info panel (flex-4) */}
      <main className="flex-1 flex w-full overflow-hidden">
        {/* Left Panel: Command Thread */}
        <div
          className={`flex-[8] flex flex-col border-r border-stone-200 relative overflow-hidden
            ${mobileTab === 'chat' ? 'flex' : 'hidden'} md:flex`}
        >
          {/* Thread Header */}
          <div className="sticky top-0 bg-corthex-bg/95 backdrop-blur-sm z-10 border-b border-stone-200 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h3 className="font-semibold text-lg text-corthex-text-primary">Command Center</h3>
            </div>
            <div className="flex items-center gap-2">
              <span
                data-testid="ws-status-pill"
                className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                Running
              </span>
            </div>
          </div>

          {/* Thread Content */}
          <div className="flex-1 overflow-y-auto">
            <MessageThread
              messages={messages}
              isLoading={historyLoading}
              onReportClick={handleReportClick}
              onExampleClick={submitCommand}
              selectedCommandId={selectedReportId}
            />
          </div>

          {/* Input Area (Fixed at bottom) */}
          <CommandInput
            onSubmit={submitCommand}
            isSubmitting={isSubmitting}
            managers={managers}
            deptMap={deptMap}
            presets={presetItems}
            onOpenPresets={() => setShowPresetManager(true)}
          />
        </div>

        {/* Right Panel: Info & Tracking */}
        <div
          className={`flex-[4] bg-white flex flex-col overflow-y-auto border-l border-stone-200
            ${mobileTab === 'report' ? 'flex' : 'hidden'} md:flex`}
        >
          <div className="p-6 flex flex-col gap-6">
            {/* Session Info */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Session Info</h4>
              <div className="bg-stone-100 rounded-xl border border-stone-200 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Commands</span>
                  <span className="text-sm font-mono tabular-nums text-corthex-text-primary">{userMsgCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Responses</span>
                  <span className="text-sm font-mono tabular-nums text-corthex-text-primary">{agentMsgCount}</span>
                </div>
                <div className="h-px w-full bg-stone-200 my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500">Active Agents</span>
                  <span className="text-sm font-mono tabular-nums text-corthex-accent">{activeAgentCount}/{managers.length}</span>
                </div>
              </div>
            </div>

            {/* Delegation Pipeline */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Delegation Pipeline</h4>
              <PipelineVisualization
                activeCommandId={activeCommandId}
                delegationSteps={activeSteps}
              />
            </div>

            {/* Deliverables */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Deliverables</h4>
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

            {/* Presets */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Presets ({presets.length})</h4>
              <button
                data-testid="kpi-card-presets"
                onClick={() => setShowPresetManager(true)}
                className="bg-stone-100 rounded-xl border border-stone-200 p-3 text-sm text-amber-400 hover:bg-stone-200/50 transition-colors text-left"
              >
                프리셋 관리하기 →
              </button>
            </div>
          </div>
        </div>
      </main>

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
