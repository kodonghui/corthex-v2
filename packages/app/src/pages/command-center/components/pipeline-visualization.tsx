import { memo } from 'react'
import type { DelegationStep } from '../../../stores/command-store'

type PipelineStage = {
  id: string
  name: string
  role: string
  status: 'done' | 'working' | 'waiting' | 'failed'
  description: string
}

type Props = {
  activeCommandId: string | null
  delegationSteps: DelegationStep[]
}

function getStatusFromSteps(steps: DelegationStep[], role: string): 'done' | 'working' | 'waiting' | 'failed' {
  const roleSteps = steps.filter((s) => s.agentName?.toLowerCase().includes(role.toLowerCase()))
  if (roleSteps.length === 0) return 'waiting'
  const lastStep = roleSteps[roleSteps.length - 1]
  if (lastStep.event.includes('FAILED')) return 'failed'
  if (lastStep.event.includes('COMPLETED') || lastStep.event.includes('PASSED')) return 'done'
  return 'working'
}

function getDescriptionFromSteps(steps: DelegationStep[], role: string): string {
  const roleSteps = steps.filter((s) => s.agentName?.toLowerCase().includes(role.toLowerCase()))
  if (roleSteps.length === 0) return 'Waiting'
  const lastStep = roleSteps[roleSteps.length - 1]
  const descriptions: Record<string, string> = {
    CLASSIFYING: 'Routing task',
    CLASSIFIED: 'Routed',
    MANAGER_STARTED: 'Processing',
    SPECIALIST_DISPATCHED: 'Extracting',
    SPECIALIST_COMPLETED: 'Done',
    SYNTHESIZING: 'Writing',
    SYNTHESIS_COMPLETED: 'Draft ready',
    QUALITY_CHECKING: 'Checking',
    QUALITY_PASSED: 'Passed',
    COMPLETED: 'Complete',
    FAILED: 'Failed',
  }
  return descriptions[lastStep.event] || lastStep.event
}

const STAGE_ICONS: Record<string, React.ReactNode> = {
  Manager: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Analyst: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
    </svg>
  ),
  Writer: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  Designer: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
}

export const PipelineVisualization = memo(function PipelineVisualization({ activeCommandId, delegationSteps }: Props) {
  const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Manager', role: 'Manager', status: 'waiting', description: 'Routing task' },
    { id: '2', name: 'Analyst', role: 'Analyst', status: 'waiting', description: 'Extracting insights' },
    { id: '3', name: 'Writer', role: 'Writer', status: 'waiting', description: 'Writing draft' },
    { id: '4', name: 'Designer', role: 'Designer', status: 'waiting', description: 'Creating slides' },
  ]

  const stages: PipelineStage[] = activeCommandId
    ? defaultStages.map((stage) => ({
        ...stage,
        status: getStatusFromSteps(delegationSteps, stage.role),
        description: getDescriptionFromSteps(delegationSteps, stage.role),
      }))
    : defaultStages

  const hasFailed = stages.some((s) => s.status === 'failed')

  if (!activeCommandId) {
    return (
      <div
        data-testid="pipeline-bar"
        aria-live="polite"
        className="flex items-center gap-3 px-6 py-3 border-b border-stone-200/80 shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/10 to-slate-800/60 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-blue-500/40" />
        </div>
        <p className="text-xs text-corthex-text-secondary">명령을 입력하면 처리 파이프라인이 표시됩니다</p>
      </div>
    )
  }

  return (
    <div
      data-testid="pipeline-bar"
      aria-live="polite"
      className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-stone-200/80 shrink-0 overflow-x-auto"
    >
      {stages.map((stage, idx) => {
        const isDone = stage.status === 'done'
        const isWorking = stage.status === 'working'
        const isFailed = stage.status === 'failed'

        const cardClass = isDone
          ? 'bg-gradient-to-br from-emerald-600/20 via-slate-800 to-slate-800 border-emerald-500/30'
          : isWorking
            ? 'bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border-blue-500/30 shadow-lg shadow-blue-500/5'
            : isFailed
              ? 'bg-gradient-to-br from-red-600/20 via-slate-800 to-slate-800 border-red-500/30'
              : 'bg-stone-100/40 border-stone-200/50'

        const iconBgClass = isDone
          ? 'bg-emerald-500/20'
          : isWorking
            ? 'bg-blue-500/20'
            : isFailed
              ? 'bg-red-500/20'
              : 'bg-stone-200/50'

        const iconColor = isDone
          ? 'text-emerald-400'
          : isWorking
            ? 'text-blue-400'
            : isFailed
              ? 'text-red-400'
              : 'text-corthex-text-secondary'

        const dotClass = isDone
          ? 'bg-emerald-400'
          : isWorking
            ? 'bg-blue-400 animate-pulse'
            : isFailed
              ? 'bg-red-400'
              : 'bg-slate-600'

        const connectorColor = isDone
          ? 'bg-emerald-500/40'
          : isFailed
            ? 'bg-red-500/40'
            : 'bg-stone-200/50'

        return (
          <div key={stage.id} className="flex items-center gap-3 shrink-0">
            <div
              data-testid={`pipeline-stage-${stage.role.toLowerCase()}`}
              role="status"
              aria-label={`${stage.role}: ${stage.description}`}
              className={`flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2 md:py-2.5 rounded-xl border transition-all duration-300 ${cardClass}`}
            >
              {/* Mobile: compact circle indicator */}
              <div className={`w-8 h-8 rounded-full md:rounded-lg flex items-center justify-center ${iconBgClass} relative`}>
                <span className={iconColor}>
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    STAGE_ICONS[stage.role] || <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                  )}
                </span>
                {isWorking && (
                  <span className="absolute inset-0 rounded-full md:rounded-lg bg-blue-500/30 animate-ping" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] md:text-xs font-semibold text-white">{stage.role}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                </div>
                <p className="text-[10px] md:text-xs text-stone-400 mt-0.5 hidden sm:block">{stage.description}</p>
              </div>
            </div>

            {/* Connector */}
            {idx < stages.length - 1 && (
              <div className="flex items-center gap-0.5 shrink-0">
                <div className={`w-6 h-px ${connectorColor} transition-colors`} />
                <svg className={`w-3 h-3 ${hasFailed ? 'text-red-500/60' : isDone ? 'text-emerald-500/60' : 'text-corthex-text-secondary'}`} fill="none" viewBox="0 0 12 12">
                  <path d="M4.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})
