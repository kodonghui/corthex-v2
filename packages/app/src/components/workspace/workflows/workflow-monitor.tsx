import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { toast } from 'sonner'
import type { WorkflowStep } from '@corthex/shared'

// Step status types matching engine output
type StepState = 'pending' | 'running' | 'success' | 'failed' | 'skipped'

interface StepSummary {
  id: string
  state: StepState
  durationMs: number
  error?: string
}

interface ExecutionResult {
  executionId: string
  status: 'success' | 'failed'
  totalDurationMs: number
  stepResults: StepSummary[]
}

interface AnalyticsData {
  workflowId: string
  totalExecutions: number
  successRatePercent: number
  averageDurationMs: number
  bottlenecks: { stepId: string; averageMs: number; relativeTimePercent: number }[]
  flakySteps: { stepId: string; failureRatePercent: number }[]
  timeSeries: { date: string; durationMs: number }[]
}

const STATE_COLORS: Record<StepState, { bg: string; dot: string; text: string }> = {
  pending: { bg: 'bg-zinc-100 dark:bg-zinc-800', dot: 'bg-zinc-400', text: 'text-zinc-500' },
  running: { bg: 'bg-blue-50 dark:bg-blue-950/40', dot: 'bg-blue-500 animate-pulse', text: 'text-blue-600 dark:text-blue-400' },
  success: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  failed: { bg: 'bg-red-50 dark:bg-red-950/40', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  skipped: { bg: 'bg-amber-50 dark:bg-amber-950/40', dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400' },
}

const STATE_LABELS: Record<StepState, string> = {
  pending: '대기',
  running: '실행 중',
  success: '성공',
  failed: '실패',
  skipped: '건너뜀',
}

interface Props {
  workflowId: string
  workflowName: string
  steps: WorkflowStep[]
  onClose: () => void
}

export function WorkflowMonitor({ workflowId, workflowName, steps, onClose }: Props) {
  const queryClient = useQueryClient()
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  // Analytics
  const { data: analyticsRes } = useQuery({
    queryKey: ['workflow-analytics', workflowId],
    queryFn: () => api.get<{ data: AnalyticsData }>(`/workspace/workflows/${workflowId}/analytics`),
  })
  const analytics = analyticsRes?.data || null

  // Execute
  const executeMutation = useMutation({
    mutationFn: () => api.post<{ data: ExecutionResult }>(`/workspace/workflows/${workflowId}/execute`, { initialContext: {} }),
    onMutate: () => setIsExecuting(true),
    onSuccess: (res) => {
      setLastResult(res.data)
      setIsExecuting(false)
      toast.success('워크플로우 실행 완료')
      queryClient.invalidateQueries({ queryKey: ['workflow-analytics', workflowId] })
    },
    onError: (err: Error) => {
      setIsExecuting(false)
      toast.error(err.message || '실행 실패')
    },
  })

  // Build step state map from last result
  const stepStateMap = new Map<string, StepSummary>()
  if (lastResult?.stepResults) {
    lastResult.stepResults.forEach((sr) => stepStateMap.set(sr.id, sr))
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-lg"
        >
          ←
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{workflowName}</h2>
          <p className="text-xs text-zinc-500">{steps.length}개 스텝 · {workflowId.slice(0, 8)}</p>
        </div>
        <button
          onClick={() => executeMutation.mutate()}
          disabled={isExecuting}
          className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-all shadow-sm"
        >
          {isExecuting ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              실행 중...
            </span>
          ) : '▶ 실행'}
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Step Pipeline */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">실행 파이프라인</h3>
          <div className="space-y-2">
            {steps.map((step, i) => {
              const result = stepStateMap.get(step.id)
              const state: StepState = isExecuting && !result ? 'running' : result?.state || 'pending'
              const colors = STATE_COLORS[state]

              return (
                <div key={step.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${colors.bg} border-zinc-200 dark:border-zinc-800`}>
                  {/* Step number */}
                  <div className="w-7 h-7 rounded-lg bg-zinc-200/80 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                    {i + 1}
                  </div>

                  {/* Status dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />

                  {/* Step info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{step.id}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">{step.type}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{step.action}</p>
                  </div>

                  {/* Status label */}
                  <span className={`text-xs font-medium shrink-0 ${colors.text}`}>
                    {STATE_LABELS[state]}
                  </span>

                  {/* Duration */}
                  {result && (
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {result.durationMs}ms
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Last result summary */}
        {lastResult && (
          <div className={`p-4 rounded-xl border ${lastResult.status === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{lastResult.status === 'success' ? '✅' : '❌'}</span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  실행 {lastResult.status === 'success' ? '성공' : '실패'}
                </p>
                <p className="text-xs text-zinc-500">총 소요시간: {lastResult.totalDurationMs}ms</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics */}
        {analytics && analytics.totalExecutions > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">실행 통계</h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.totalExecutions}</p>
                <p className="text-xs text-zinc-500">총 실행 수</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.successRatePercent}%</p>
                <p className="text-xs text-zinc-500">성공률</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{analytics.averageDurationMs}ms</p>
                <p className="text-xs text-zinc-500">평균 소요시간</p>
              </div>
            </div>

            {/* Bottlenecks */}
            {analytics.bottlenecks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2">⚠ 병목 스텝</h4>
                <div className="space-y-1">
                  {analytics.bottlenecks.map((b) => (
                    <div key={b.stepId} className="flex items-center justify-between px-3 py-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-xs">
                      <span className="font-mono text-amber-700 dark:text-amber-300">{b.stepId}</span>
                      <span className="text-amber-600 dark:text-amber-400">평균 {b.averageMs}ms ({b.relativeTimePercent}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flaky steps */}
            {analytics.flakySteps.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">🔥 불안정 스텝</h4>
                <div className="space-y-1">
                  {analytics.flakySteps.map((f) => (
                    <div key={f.stepId} className="flex items-center justify-between px-3 py-2 bg-red-50 dark:bg-red-950/20 rounded-lg text-xs">
                      <span className="font-mono text-red-700 dark:text-red-300">{f.stepId}</span>
                      <span className="text-red-600 dark:text-red-400">실패율 {f.failureRatePercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time series mini chart (simple bar representation) */}
            {analytics.timeSeries.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 mb-2">실행 시간 추이</h4>
                <div className="flex items-end gap-1 h-20 px-2">
                  {analytics.timeSeries.slice(-20).map((point, i) => {
                    const maxMs = Math.max(...analytics.timeSeries.map((t) => t.durationMs))
                    const heightPercent = maxMs > 0 ? (point.durationMs / maxMs) * 100 : 0
                    return (
                      <div
                        key={i}
                        className="flex-1 bg-indigo-400 dark:bg-indigo-600 rounded-t transition-all hover:bg-indigo-500"
                        style={{ height: `${Math.max(heightPercent, 4)}%` }}
                        title={`${new Date(point.date).toLocaleDateString()} — ${point.durationMs}ms`}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {analytics && analytics.totalExecutions === 0 && (
          <div className="text-center py-8 text-zinc-400 text-sm">
            아직 실행 기록이 없습니다. 위의 실행 버튼을 눌러 첫 실행을 시작하세요.
          </div>
        )}
      </div>
    </div>
  )
}
