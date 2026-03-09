import { cn } from '@corthex/ui'
import type { DelegationStep } from './types'

const statusStyles = {
  pending: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500',
  working: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 animate-pulse',
  done: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300',
  error: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
}

const lineStyles = {
  pending: 'bg-zinc-300 dark:bg-zinc-600',
  working: 'bg-amber-400 animate-pulse',
  done: 'bg-emerald-400',
  error: 'bg-red-400',
}

type DelegationPipelineProps = {
  steps: DelegationStep[]
  className?: string
}

export function DelegationPipeline({ steps, className }: DelegationPipelineProps) {
  if (steps.length === 0) return null

  return (
    <div className={cn('flex items-center gap-1 overflow-x-auto py-2 px-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg', className)}>
      <span className="text-[10px] text-zinc-400 shrink-0 mr-1">위임:</span>
      {steps.map((step, index) => (
        <div key={step.agentId} className="flex items-center shrink-0">
          {/* Agent node */}
          <div
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-colors',
              statusStyles[step.status]
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="whitespace-nowrap">{step.agentName}</span>
            {step.status === 'done' && <span className="text-[10px]">&#10003;</span>}
            {step.status === 'error' && <span className="text-[10px]">&#10007;</span>}
          </div>
          
          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-4 h-0.5 mx-0.5 rounded-full transition-colors',
                lineStyles[steps[index + 1].status === 'pending' ? 'pending' : steps[index + 1].status]
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

type DelegationPipelineBarProps = {
  activeSteps: DelegationStep[]
  totalAgents?: number
  className?: string
}

export function DelegationPipelineBar({ activeSteps, totalAgents = 0, className }: DelegationPipelineBarProps) {
  const workingCount = activeSteps.filter(s => s.status === 'working').length
  const doneCount = activeSteps.filter(s => s.status === 'done').length
  const hasActive = activeSteps.length > 0

  if (!hasActive && totalAgents === 0) {
    return (
      <div className={cn('px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800', className)}>
        <p className="text-xs text-zinc-400 text-center">대기 중인 작업이 없습니다</p>
      </div>
    )
  }

  return (
    <div className={cn('px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">위임 파이프라인</span>
        <div className="flex items-center gap-3 text-[10px]">
          {workingCount > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-1" />
              {workingCount}개 처리중
            </span>
          )}
          {doneCount > 0 && (
            <span className="text-emerald-600 dark:text-emerald-400">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />
              {doneCount}개 완료
            </span>
          )}
        </div>
      </div>
      
      {hasActive && <DelegationPipeline steps={activeSteps} />}
    </div>
  )
}
