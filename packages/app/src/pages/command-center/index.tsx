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
      className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
    >
      {/* Page Header */}
      <div data-testid="command-center-header" className="px-6 py-5 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">작전현황</h1>
            <p className="text-sm text-slate-500 mt-1">AI 에이전트에게 명령을 내리고 결과를 확인합니다</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="ws-status-pill"
              className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              실시간 연결됨
            </span>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 px-6 py-4 shrink-0">
        {/* Total Commands */}
        <div
          data-testid="kpi-card-commands"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border border-blue-500/20 p-5 hover:border-blue-500/40 transition-all duration-300 group"
          role="region"
          aria-label="Total commands"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">명령 수</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">{userMsgCount}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {agentMsgCount} 응답
              </span>
            </div>
          </div>
        </div>

        {/* Active Agents */}
        <div
          data-testid="kpi-card-agents"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600/20 via-slate-800 to-slate-800 border border-cyan-500/20 p-5 hover:border-cyan-500/40 transition-all duration-300 group"
          role="region"
          aria-label="Active agents"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-cyan-400/80">에이전트</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">{managers.length}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {activeAgentCount} 활성
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Status */}
        <div
          data-testid="kpi-card-pipeline"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600/20 via-slate-800 to-slate-800 border border-emerald-500/20 p-5 hover:border-emerald-500/40 transition-all duration-300 group"
          role="region"
          aria-label="Pipeline status"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80">파이프라인</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">{completedSteps}/{activeSteps.length || 0}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              {activeCommandId ? (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  진행 중
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-500/10 text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                  대기
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Presets */}
        <div
          data-testid="kpi-card-presets"
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 via-slate-800 to-slate-800 border border-amber-500/20 p-5 hover:border-amber-500/40 transition-all duration-300 group cursor-pointer"
          role="region"
          aria-label="Saved presets"
          tabIndex={0}
          onClick={() => setShowPresetManager(true)}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowPresetManager(true) }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/80">프리셋</span>
            </div>
            <p className="text-4xl font-black text-white tracking-tight">{presets.length}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                관리하기
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline bar */}
      <PipelineVisualization
        activeCommandId={activeCommandId}
        delegationSteps={activeSteps}
      />

      {/* Mobile tab bar */}
      <div className="flex md:hidden border-b border-slate-700/50 shrink-0">
        <button
          data-testid="mobile-tab-chat"
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            mobileTab === 'chat'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          대화
        </button>
        <button
          data-testid="mobile-tab-report"
          onClick={() => setMobileTab('report')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
            mobileTab === 'report'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          보고서
        </button>
      </div>

      {/* Main body: left thread + right report */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left column: message thread */}
        <div
          className={`w-full md:w-[420px] flex-col border-r border-slate-700/50 hidden md:flex
            ${mobileTab === 'chat' ? '!flex' : ''}`}
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
