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

const STATUS_CONFIG = {
  done: {
    dot: 'bg-emerald-500',
    label: 'text-emerald-400',
    ring: 'border-emerald-800',
    bg: 'bg-emerald-950/40',
    badge: 'bg-emerald-900/50 text-emerald-400',
    text: 'Done',
  },
  working: {
    dot: 'bg-blue-400 animate-pulse',
    label: 'text-blue-400',
    ring: 'border-blue-800',
    bg: 'bg-blue-950/40',
    badge: 'bg-blue-900/50 text-blue-400',
    text: 'Working',
  },
  waiting: {
    dot: 'bg-zinc-600',
    label: 'text-zinc-500',
    ring: 'border-zinc-700/60',
    bg: 'bg-zinc-900/30',
    badge: 'bg-zinc-800/60 text-zinc-500',
    text: 'Waiting',
  },
  failed: {
    dot: 'bg-red-500',
    label: 'text-red-400',
    ring: 'border-red-800',
    bg: 'bg-red-950/30',
    badge: 'bg-red-900/50 text-red-400',
    text: 'Failed',
  },
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  Manager: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 12.5c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Analyst: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 10.5l2.5-3.5 2.5 1.5 3.5-5 1.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Writer: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 11l1.5-1.5 5-5 1.5 1.5-5 5-1.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9.5 4.5l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Designer: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="3" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 8l2-2 1.5 1 2.5-2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
}

const ROLE_COLORS: Record<string, string> = {
  Manager: 'text-violet-400',
  Analyst: 'text-blue-400',
  Writer: 'text-amber-400',
  Designer: 'text-emerald-400',
}

function PipelineStep({ stage, isLast }: { stage: PipelineStage; isLast: boolean }) {
  const cfg = STATUS_CONFIG[stage.status]
  const iconColor = ROLE_COLORS[stage.role] || 'text-zinc-400'

  return (
    <div
      data-testid="delegation-step"
      className="flex items-center gap-0"
    >
      {/* Step card */}
      <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${cfg.ring} ${cfg.bg} min-w-0`}>
        {/* Status dot */}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {/* Role icon */}
        <span className={`flex-shrink-0 ${iconColor}`}>
          {ROLE_ICONS[stage.role] || (
            <span className="text-xs font-bold">{stage.role.charAt(0)}</span>
          )}
        </span>
        {/* Text */}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-zinc-200 leading-tight whitespace-nowrap">{stage.role}</span>
          <span className={`text-[10px] leading-tight whitespace-nowrap ${cfg.label}`}>{stage.description}</span>
        </div>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex items-center mx-1.5 flex-shrink-0">
          <div className="w-5 h-px bg-zinc-700" />
          <svg width="5" height="8" viewBox="0 0 5 8" fill="none" className="text-zinc-600 -ml-px">
            <path d="M1 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
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

  return (
    <div
      data-testid="delegation-chain"
      className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950 overflow-x-auto"
    >
      {/* Label */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 select-none">
          Pipeline
        </span>
        {hasActive && !hasFailed && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
        )}
        {hasFailed && (
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-zinc-800 flex-shrink-0" />

      {/* Steps row */}
      <div className="flex items-center flex-shrink-0">
        {stages.map((stage, idx) => (
          <PipelineStep
            key={stage.id}
            stage={stage}
            isLast={idx === stages.length - 1 && !hasFailed}
          />
        ))}

        {hasFailed && (
          <>
            <div className="flex items-center mx-1.5">
              <div className="w-5 h-px bg-red-800" />
              <svg width="5" height="8" viewBox="0 0 5 8" fill="none" className="text-red-700 -ml-px">
                <path d="M1 1l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-800 bg-red-950/30">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-red-400">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4 4l4 4M8 4l-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-red-400">Failed</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
