import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useDashboardWs } from '../hooks/use-dashboard-ws'
import { useWsStore } from '../stores/ws-store'
import type {
  LLMProviderName,
  DashboardSummary,
  DashboardUsageDay,
  DashboardUsage,
  DashboardBudget,
  QuickAction,
  DashboardSatisfaction,
} from '@corthex/shared'

// === Constants ===

const PROVIDER_COLORS: Record<LLMProviderName, string> = {
  anthropic: '#3B82F6',
  openai: '#22C55E',
  google: '#F97316',
}

const PROVIDER_LABELS: Record<LLMProviderName, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
}

// === Summary Cards ===

function SummaryCards({ data }: { data: DashboardSummary }) {
  const navigate = useNavigate()
  const budgetPct = data.cost.budgetUsagePercent

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Task Card */}
      <div data-testid="card-tasks" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5" role="region" aria-label="작업 현황">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">📋</span>
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400">작업 현황</span>
        </div>
        <p className="text-3xl font-bold text-slate-50 mb-3">{data.tasks.total}</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 완료 {data.tasks.completed}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 실패 {data.tasks.failed}
          </span>
          <span className="flex items-center gap-1 text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 진행중 {data.tasks.inProgress}
          </span>
        </div>
      </div>

      {/* Cost Card — clickable → /costs */}
      <div
        data-testid="card-cost"
        className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 transition-colors"
        role="region"
        aria-label="비용 현황"
        onClick={() => navigate('/costs')}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/costs') }}
        tabIndex={0}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">💰</span>
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400">비용 현황</span>
        </div>
        <p className="text-3xl font-bold text-slate-50 mb-3">${data.cost.todayUsd.toFixed(2)}</p>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>월 예산</span>
          <span>{budgetPct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full">
          <div
            className={`h-full rounded-full transition-all duration-500 ${budgetPct < 60 ? 'bg-emerald-500' : budgetPct < 80 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(budgetPct, 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs">
          {data.cost.byProvider.map((p) => (
            <span key={p.provider} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: PROVIDER_COLORS[p.provider] }} />
              {PROVIDER_LABELS[p.provider]}
            </span>
          ))}
        </div>
      </div>

      {/* Agent Card */}
      <div data-testid="card-agents" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5" role="region" aria-label="에이전트 현황">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">🤖</span>
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400">에이전트</span>
        </div>
        <p className="text-3xl font-bold text-slate-50 mb-3">{data.agents.total}</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 활성 {data.agents.active}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> 대기 {data.agents.idle}
          </span>
          <span className="flex items-center gap-1 text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 오류 {data.agents.error}
          </span>
        </div>
      </div>

      {/* Integration Card */}
      <div data-testid="card-integrations" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5" role="region" aria-label="연동 상태">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">🔗</span>
          <span className="text-sm font-medium uppercase tracking-wider text-slate-400">연동 상태</span>
        </div>
        <div className="space-y-2 mt-2">
          {data.integrations.providers.map((p) => (
            <div key={p.name} data-testid={`provider-${p.name}`} className="flex items-center justify-between text-xs" aria-label={`${PROVIDER_LABELS[p.name]} ${p.status === 'up' ? '정상' : '중단'}`}>
              <span className="text-slate-300">{PROVIDER_LABELS[p.name]}</span>
              <span className={p.status === 'up' ? 'flex items-center gap-1 text-emerald-400' : 'flex items-center gap-1 text-red-400'}>
                <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'up' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {p.status === 'up' ? '정상' : '중단'}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">도구 시스템</span>
            <span className={data.integrations.toolSystemOk ? 'flex items-center gap-1 text-emerald-400' : 'flex items-center gap-1 text-red-400'}>
              <span className={`w-1.5 h-1.5 rounded-full ${data.integrations.toolSystemOk ? 'bg-emerald-500' : 'bg-red-500'}`} />
              {data.integrations.toolSystemOk ? '정상' : '중단'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// === Usage Chart (div-based stacked bar) ===

type DayData = { date: string; byProvider: Record<LLMProviderName, number>; total: number }

function groupUsageByDate(usage: DashboardUsageDay[]): DayData[] {
  const map = new Map<string, Record<LLMProviderName, number>>()
  for (const u of usage) {
    if (!map.has(u.date)) map.set(u.date, { anthropic: 0, openai: 0, google: 0 })
    const day = map.get(u.date)!
    day[u.provider] += u.costUsd
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, byProvider]) => ({
      date,
      byProvider,
      total: byProvider.anthropic + byProvider.openai + byProvider.google,
    }))
}

function UsageChart({
  data,
  days,
  onToggleDays,
}: {
  data: DashboardUsage
  days: number
  onToggleDays: () => void
}) {
  const grouped = useMemo(() => groupUsageByDate(data.usage), [data.usage])
  const maxTotal = useMemo(() => Math.max(...grouped.map((d) => d.total), 0.01), [grouped])

  return (
    <div data-testid="usage-chart" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">AI 사용량 ({days}일)</h3>
        <button
          data-testid="usage-toggle"
          onClick={onToggleDays}
          className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
        >
          {days === 7 ? '30일 보기' : '7일 보기'}
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-slate-600">
          사용량 데이터가 없습니다
        </div>
      ) : (
        <>
          <div className="flex items-end gap-1 h-48" role="img" aria-label={`최근 ${days}일 AI 사용량 차트`}>
            {grouped.map((day) => {
              const heightPercent = (day.total / maxTotal) * 100
              return (
                <div
                  key={day.date}
                  data-testid={`chart-bar-${day.date}`}
                  className="flex-1 flex flex-col justify-end relative group"
                  title={`${day.date}: $${day.total.toFixed(2)}`}
                >
                  <div
                    className="w-full rounded-t-sm overflow-hidden transition-all duration-300"
                    style={{ height: `${heightPercent}%`, minHeight: day.total > 0 ? 2 : 0 }}
                  >
                    {(['anthropic', 'openai', 'google'] as const).map((provider) => {
                      const ratio = day.total > 0 ? (day.byProvider[provider] / day.total) * 100 : 0
                      if (ratio <= 0) return null
                      return (
                        <div
                          key={provider}
                          style={{
                            height: `${ratio}%`,
                            backgroundColor: PROVIDER_COLORS[provider],
                          }}
                        />
                      )
                    })}
                  </div>
                  {/* tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white shadow-xl whitespace-nowrap pointer-events-none">
                      <p className="font-medium">{day.date.slice(5)}</p>
                      <p className="text-slate-400">${day.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 text-xs text-slate-600">
            {grouped.map((day, i) => {
              const showLabel = grouped.length <= 10 || i === 0 || i === grouped.length - 1 || i % 5 === 0
              return (
                <div key={day.date} className="flex-1 text-center">
                  {showLabel && (
                    <span className="text-[9px] text-slate-600">{day.date.slice(5)}</span>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3">
        {(['anthropic', 'openai', 'google'] as const).map((p) => (
          <span key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: PROVIDER_COLORS[p] }}
            />
            {PROVIDER_LABELS[p]}
          </span>
        ))}
      </div>
    </div>
  )
}

// === Budget Progress Bar ===

function BudgetBar({ data }: { data: DashboardBudget }) {
  const projectedPercent = data.monthlyBudgetUsd > 0
    ? Math.min((data.projectedMonthEndUsd / data.monthlyBudgetUsd) * 100, 120)
    : 0
  const barColor = data.usagePercent >= 80 ? 'bg-red-500' : data.usagePercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
  const clampedUsage = Math.min(data.usagePercent, 100)

  return (
    <div data-testid="budget-bar" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">월 예산 진행률</h3>
        <span className="text-sm text-slate-400">
          ${data.currentMonthSpendUsd.toFixed(2)} / ${data.monthlyBudgetUsd.toFixed(2)}
          {data.isDefaultBudget && <span className="text-xs text-slate-600 ml-1">(기본값)</span>}
        </span>
      </div>

      {/* Progress bar with projected marker */}
      <div className="relative h-3 bg-slate-700 rounded-full overflow-hidden">
        {/* Current spend */}
        <div
          data-testid="budget-fill"
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${clampedUsage}%` }}
          role="progressbar"
          aria-valuenow={data.usagePercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {/* Projected marker (outside overflow-hidden) */}
      {projectedPercent > 0 && projectedPercent <= 120 && (
        <div className="relative h-0">
          <div
            data-testid="budget-projected"
            className="absolute -top-3 border-l-2 border-dashed border-slate-400 h-3"
            style={{ left: `${Math.min(projectedPercent, 100)}%` }}
          >
            <span className="absolute -top-5 -translate-x-1/2 text-xs text-slate-500 whitespace-nowrap">
              예상 ${data.projectedMonthEndUsd.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Percentage labels */}
      <div className="flex items-center justify-between mt-1 text-xs text-slate-600">
        <span>0%</span>
        <span className="font-medium text-slate-400">{data.usagePercent.toFixed(0)}%</span>
        <span>100%</span>
      </div>

      {/* Department breakdown */}
      {data.byDepartment.length > 0 && (
        <>
          <h4 className="text-xs font-medium text-slate-500 mt-4 mb-2">부서별 비용</h4>
          <div className="space-y-1.5">
            {data.byDepartment.map((dept) => (
              <div key={dept.departmentId} data-testid={`dept-cost-${dept.departmentId}`} className="flex items-center justify-between text-xs">
                <span className="text-slate-400">{dept.name}</span>
                <span className="text-slate-300 font-mono">${dept.costUsd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// === Quick Actions (API-based) ===

function QuickActionsPanel() {
  const navigate = useNavigate()
  const [executingId, setExecutingId] = useState<string | null>(null)

  const { data: actionsRes } = useQuery({
    queryKey: ['dashboard-quick-actions'],
    queryFn: () => api.get<{ data: QuickAction[] }>('/workspace/dashboard/quick-actions'),
  })

  const executePreset = useMutation({
    mutationFn: (presetId: string) =>
      api.post(`/workspace/presets/${presetId}/execute`, {}),
    onSettled: () => setExecutingId(null),
  })

  const actions = actionsRes?.data ?? []

  const handleClick = (action: QuickAction) => {
    if (action.presetId) {
      setExecutingId(action.id)
      executePreset.mutate(action.presetId)
    } else {
      navigate(`/command-center?preset=${encodeURIComponent(action.command)}`)
    }
  }

  if (actions.length === 0) return null

  return (
    <div data-testid="quick-actions" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-medium text-slate-300 mb-3">퀵 액션</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            data-testid={`quick-action-${action.id}`}
            onClick={() => handleClick(action)}
            disabled={executingId === action.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all text-left disabled:opacity-50 disabled:cursor-wait"
          >
            <span className="text-lg">
              {executingId === action.id ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
              ) : action.icon}
            </span>
            <span className="text-sm font-medium text-slate-200">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// === Satisfaction Chart (CSS donut) ===

const SATISFACTION_PERIODS = [
  { value: '7d' as const, label: '7일' },
  { value: '30d' as const, label: '30일' },
  { value: 'all' as const, label: '전체' },
]

function SatisfactionChart() {
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d')

  const { data: satRes } = useQuery({
    queryKey: ['dashboard-satisfaction', period],
    queryFn: () =>
      api.get<{ data: DashboardSatisfaction }>(`/workspace/dashboard/satisfaction?period=${period}`),
  })

  const sat = satRes?.data

  if (!sat) return null

  const total = sat.positive + sat.negative + sat.neutral
  const posPercent = total > 0 ? (sat.positive / total) * 100 : 0
  const negPercent = total > 0 ? (sat.negative / total) * 100 : 0

  const gradient = total > 0
    ? `conic-gradient(#10b981 0% ${posPercent}%, #ef4444 ${posPercent}% ${posPercent + negPercent}%, #3f3f46 ${posPercent + negPercent}% 100%)`
    : 'conic-gradient(#3f3f46 0deg 360deg)'

  return (
    <div data-testid="satisfaction-chart" className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-300">명령 만족도</h3>
        <div className="flex items-center gap-1">
          {SATISFACTION_PERIODS.map((p) => (
            <button
              key={p.value}
              data-testid={`satisfaction-period-${p.label}`}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                period === p.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'
              }`}
              aria-current={period === p.value ? 'true' : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center">
        {/* Donut chart */}
        <div data-testid="donut-chart" className="relative w-32 h-32 flex-shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{ background: gradient }}
            role="img"
            aria-label={`만족도 ${sat.rate}%`}
          />
          {/* Inner circle for donut effect */}
          <div className="absolute inset-3 rounded-full bg-slate-800 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-50">{sat.rate}%</span>
            <span className="text-xs text-slate-500">만족도</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            긍정
          </span>
          <span className="text-slate-300">{sat.positive} ({posPercent.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
            부정
          </span>
          <span className="text-slate-300">{sat.negative} ({negPercent.toFixed(0)}%)</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-600" />
            무응답
          </span>
          <span className="text-slate-500">{sat.neutral}</span>
        </div>
        <div className="border-t border-slate-700 pt-1 mt-1 flex justify-between text-xs text-slate-500">
          <span>전체</span>
          <span>{total}</span>
        </div>
      </div>
    </div>
  )
}

// === Loading Skeleton ===

function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
            <div className="bg-slate-700 animate-pulse rounded h-5 w-20 mb-3" />
            <div className="bg-slate-700 animate-pulse rounded h-10 w-24 mb-3" />
            <div className="bg-slate-700 animate-pulse rounded h-3 w-full" />
          </div>
        ))}
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 h-64">
        <div className="bg-slate-700/50 animate-pulse rounded h-full" />
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 h-24">
        <div className="bg-slate-700/50 animate-pulse rounded h-3 w-full" />
      </div>
    </div>
  )
}

// === Main Page ===

export function DashboardPage() {
  const [usageDays, setUsageDays] = useState(7)
  const { isConnected } = useWsStore()

  // WebSocket real-time updates (replaces 30s polling)
  useDashboardWs()

  const { data: summaryRes, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<{ data: DashboardSummary }>('/workspace/dashboard/summary'),
  })

  const { data: usageRes, isLoading: usageLoading } = useQuery({
    queryKey: ['dashboard-usage', usageDays],
    queryFn: () =>
      api.get<{ data: DashboardUsage }>(`/workspace/dashboard/usage?days=${usageDays}`),
  })

  const { data: budgetRes, isLoading: budgetLoading } = useQuery({
    queryKey: ['dashboard-budget'],
    queryFn: () => api.get<{ data: DashboardBudget }>('/workspace/dashboard/budget'),
  })

  const summary = summaryRes?.data
  const usage = usageRes?.data
  const budget = budgetRes?.data

  const isLoading = summaryLoading || usageLoading || budgetLoading

  useEffect(() => {
    document.title = '작전현황 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div data-testid="dashboard-page" className="h-full overflow-y-auto">
      {/* Header */}
      <div data-testid="dashboard-header" className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">작전현황</h1>
          <p className="text-sm text-slate-400 mt-0.5">조직 전체 현황을 한눈에 파악합니다</p>
        </div>
        <div data-testid="ws-status">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 실시간
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> 연결 끊김
            </span>
          )}
        </div>
      </div>

      <div className="px-6 py-4 space-y-6 pb-8">
        {isLoading && !summary ? (
          <DashboardSkeleton />
        ) : summaryError && !summary ? (
          <div data-testid="dashboard-error" className="flex flex-col items-center justify-center py-16">
            <span className="text-slate-600 text-4xl mb-3">⚠️</span>
            <p className="text-sm text-slate-400">데이터를 불러올 수 없습니다</p>
            <p className="text-xs text-slate-500 mt-1">잠시 후 자동으로 재시도합니다</p>
          </div>
        ) : (
          <>
            {summary && <SummaryCards data={summary} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {usage && (
                <UsageChart
                  data={usage}
                  days={usageDays}
                  onToggleDays={() => setUsageDays((d) => (d === 7 ? 30 : 7))}
                />
              )}

              {budget && <BudgetBar data={budget} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QuickActionsPanel />
              <SatisfactionChart />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
