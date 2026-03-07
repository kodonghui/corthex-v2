import { useState, useEffect, useRef } from 'react'
import { useCommandStore, type DelegationStep } from '../../../stores/command-store'

const EVENT_LABELS: Record<string, string> = {
  COMMAND_RECEIVED: '명령 접수',
  CLASSIFYING: '분류 중...',
  CLASSIFIED: '분류 완료',
  MANAGER_STARTED: '작업 시작',
  SPECIALIST_DISPATCHED: '전문가 배분',
  SPECIALIST_COMPLETED: '전문가 완료',
  SPECIALIST_FAILED: '전문가 실패',
  SYNTHESIZING: '결과 종합 중...',
  SYNTHESIS_COMPLETED: '종합 완료',
  SYNTHESIS_FAILED: '종합 실패',
  QUALITY_CHECKING: '품질 검수 중...',
  QUALITY_PASSED: '품질 통과',
  QUALITY_FAILED: '품질 실패',
  REWORKING: '재작업 중...',
  COMPLETED: '완료',
  FAILED: '실패',
}

const STATUS_STYLES: Record<string, { icon: string; color: string; pulse?: boolean }> = {
  CLASSIFYING: { icon: '◐', color: 'text-yellow-500', pulse: true },
  CLASSIFIED: { icon: '✓', color: 'text-emerald-500' },
  MANAGER_STARTED: { icon: '●', color: 'text-blue-500', pulse: true },
  SPECIALIST_DISPATCHED: { icon: '●', color: 'text-blue-500', pulse: true },
  SPECIALIST_COMPLETED: { icon: '✓', color: 'text-emerald-500' },
  SPECIALIST_FAILED: { icon: '✗', color: 'text-red-500' },
  SYNTHESIZING: { icon: '●', color: 'text-blue-500', pulse: true },
  SYNTHESIS_COMPLETED: { icon: '✓', color: 'text-emerald-500' },
  QUALITY_CHECKING: { icon: '◐', color: 'text-yellow-500', pulse: true },
  QUALITY_PASSED: { icon: '✓', color: 'text-emerald-500' },
  QUALITY_FAILED: { icon: '✗', color: 'text-red-500' },
  REWORKING: { icon: '↻', color: 'text-orange-500', pulse: true },
  COMPLETED: { icon: '✓', color: 'text-emerald-500' },
  FAILED: { icon: '✗', color: 'text-red-500' },
}

function formatElapsed(ms: number): string {
  if (ms < 1000) return '<1초'
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}초`
  const minutes = Math.floor(seconds / 60)
  const remainingSec = seconds % 60
  return `${minutes}분 ${remainingSec}초`
}

function StepNode({ step }: { step: DelegationStep }) {
  const style = STATUS_STYLES[step.event] || { icon: '○', color: 'text-zinc-400' }
  const label = EVENT_LABELS[step.event] || step.event
  const isToolCall = step.phase.startsWith('tool:')
  const toolName = isToolCall ? step.phase.replace('tool:', '') : null

  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className={`text-sm flex-shrink-0 ${style.color} ${style.pulse ? 'animate-pulse' : ''}`}>
        {isToolCall ? '◈' : style.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {step.agentName && (
            <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {step.agentName}
            </span>
          )}
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {isToolCall ? `도구: ${toolName}` : label}
          </span>
        </div>
        <span className="text-[10px] text-zinc-400">{formatElapsed(step.elapsed)}</span>
      </div>
    </div>
  )
}

export function DelegationChain() {
  const { activeCommandId, delegationSteps } = useCommandStore()
  const [expanded, setExpanded] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef<number | null>(null)

  // Live elapsed timer
  useEffect(() => {
    if (!activeCommandId) {
      startTimeRef.current = null
      setElapsed(0)
      return
    }
    startTimeRef.current = Date.now()
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Date.now() - startTimeRef.current)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [activeCommandId])

  if (!activeCommandId) return null

  const steps = delegationSteps.filter((s) => s.commandId === activeCommandId)
  const lastStep = steps[steps.length - 1]
  const isComplete = lastStep?.event === 'COMPLETED' || lastStep?.event === 'FAILED'

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {!isComplete && (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
            </span>
          )}
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            위임 체인 {isComplete ? '(완료)' : '(진행 중)'}
          </span>
          <span className="text-[10px] text-zinc-400">{formatElapsed(elapsed)}</span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Steps */}
      {expanded && (
        <div className="px-4 pb-3 max-h-48 overflow-y-auto">
          {steps.length === 0 ? (
            <div className="flex items-center gap-2 py-2">
              <span className="animate-pulse text-blue-500 text-sm">●</span>
              <span className="text-xs text-zinc-500">명령을 처리하고 있습니다...</span>
            </div>
          ) : (
            <div className="border-l-2 border-zinc-200 dark:border-zinc-700 pl-3 space-y-0">
              {steps.map((step) => (
                <StepNode key={step.id} step={step} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
