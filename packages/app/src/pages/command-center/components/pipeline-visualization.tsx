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
  if (roleSteps.length === 0) return 'Waiting...'
  
  const lastStep = roleSteps[roleSteps.length - 1]
  const descriptions: Record<string, string> = {
    CLASSIFYING: 'Routing task',
    CLASSIFIED: 'Routed task',
    MANAGER_STARTED: 'Processing...',
    SPECIALIST_DISPATCHED: 'Extracting insights',
    SPECIALIST_COMPLETED: 'Completed',
    SYNTHESIZING: 'Writing draft',
    SYNTHESIS_COMPLETED: 'Draft complete',
    QUALITY_CHECKING: 'Creating slides',
    QUALITY_PASSED: 'Slides ready',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  }
  return descriptions[lastStep.event] || lastStep.event
}

function StatusBadge({ status }: { status: 'done' | 'working' | 'waiting' | 'failed' }) {
  const styles = {
    done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    working: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    waiting: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  const labels = {
    done: 'DONE',
    working: 'WORKING',
    waiting: 'WAITING',
    failed: 'FAILED',
  }
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

function PipelineNode({ stage, isLast }: { stage: PipelineStage; isLast: boolean }) {
  const avatarColors: Record<string, string> = {
    Manager: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
    Analyst: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    Writer: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    Designer: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  }

  const icons: Record<string, JSX.Element> = {
    Manager: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    Analyst: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12l3-4 3 2 4-6 2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    Writer: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 13l2-2 6-6 2 2-6 6-2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11 5l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    Designer: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 9l2-2 2 1 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  }

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        {/* Node */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${avatarColors[stage.role] || 'bg-zinc-100 text-zinc-600'}`}>
            {icons[stage.role] || (
              <span className="text-xs font-bold">{stage.role.charAt(0)}</span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{stage.role}</span>
              <StatusBadge status={stage.status} />
            </div>
          </div>
        </div>
        {/* Description below */}
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">{stage.description}</span>
      </div>
      
      {/* Arrow connector */}
      {!isLast && (
        <div className="flex items-center mx-2 mb-6">
          <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-600" />
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-zinc-300 dark:text-zinc-600 -ml-1">
            <path d="M1 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
}

export function PipelineVisualization({ activeCommandId, delegationSteps }: Props) {
  // Default pipeline stages - in real app these would come from backend
  const defaultStages: PipelineStage[] = [
    { id: '1', name: 'Manager', role: 'Manager', status: 'waiting', description: 'Routing task' },
    { id: '2', name: 'Analyst', role: 'Analyst', status: 'waiting', description: 'Extracting insights' },
    { id: '3', name: 'Writer', role: 'Writer', status: 'waiting', description: 'Writing draft' },
    { id: '4', name: 'Designer', role: 'Designer', status: 'waiting', description: 'Creating slides' },
  ]

  // Update stages based on delegation steps
  const stages: PipelineStage[] = activeCommandId
    ? defaultStages.map((stage) => ({
        ...stage,
        status: getStatusFromSteps(delegationSteps, stage.role),
        description: getDescriptionFromSteps(delegationSteps, stage.role),
      }))
    : defaultStages

  // Check if any stage has failed to show the failed indicator
  const hasFailed = stages.some((s) => s.status === 'failed')

  return (
    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
      <div className="flex items-start justify-center min-w-max">
        {stages.map((stage, idx) => (
          <PipelineNode
            key={stage.id}
            stage={stage}
            isLast={idx === stages.length - 1 && !hasFailed}
          />
        ))}
        
        {/* Failed indicator at the end */}
        {hasFailed && (
          <div className="flex items-center">
            <div className="flex items-center mx-2 mb-6">
              <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-600" />
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="text-zinc-300 dark:text-zinc-600 -ml-1">
                <path d="M1 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col items-center">
              <div className="px-3 py-2 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-red-500">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">FAILED</span>
                </div>
              </div>
              <span className="text-xs text-red-500 mt-1.5">Failing task</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
