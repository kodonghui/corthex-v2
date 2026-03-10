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

export function PipelineVisualization({ activeCommandId, delegationSteps }: Props) {
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
  const hasActive = stages.some((s) => s.status === 'working' || s.status === 'done')

  if (!activeCommandId) {
    return (
      <div
        data-testid="pipeline-bar"
        aria-live="polite"
        className="flex items-center gap-3 px-4 h-16 border-b border-slate-700 bg-slate-900 shrink-0"
      >
        <span className="w-2 h-2 rounded-full bg-slate-600" />
        <p className="text-xs text-slate-600">명령을 입력하면 처리 파이프라인이 표시됩니다</p>
      </div>
    )
  }

  return (
    <div
      data-testid="pipeline-bar"
      aria-live="polite"
      className="flex items-center gap-2 px-4 h-16 border-b border-slate-700 bg-slate-900 shrink-0 overflow-x-auto"
    >
      {/* Header dot */}
      {hasActive && !hasFailed && (
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
      )}
      {hasFailed && (
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
      )}
      {!hasActive && !hasFailed && (
        <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
      )}

      {/* Stages */}
      {stages.map((stage, idx) => {
        const dotClass =
          stage.status === 'done' ? 'bg-emerald-500' :
          stage.status === 'working' ? 'bg-blue-500 animate-pulse' :
          stage.status === 'failed' ? 'bg-red-500' :
          'bg-slate-600'

        const textClass =
          stage.status === 'done' ? 'text-slate-300' :
          stage.status === 'working' ? 'text-slate-300' :
          stage.status === 'failed' ? 'text-slate-300' :
          'text-slate-500'

        const descClass =
          stage.status === 'done' ? 'text-slate-500' :
          stage.status === 'working' ? 'text-slate-500' :
          stage.status === 'failed' ? 'text-slate-500' :
          'text-slate-600'

        return (
          <div key={stage.id} className="flex items-center gap-2 shrink-0">
            <div
              data-testid={`pipeline-stage-${stage.role.toLowerCase()}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            >
              <span className={`w-2 h-2 rounded-full ${dotClass}`} />
              <span className={`text-xs font-medium ${textClass}`}>{stage.role}</span>
              <span className={`text-xs max-w-[120px] truncate ${descClass}`}>{stage.description}</span>
            </div>

            {/* Connector arrow */}
            {idx < stages.length - 1 && (
              <span className={`text-xs ${hasFailed ? 'text-red-500' : 'text-slate-600'}`}>→</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
