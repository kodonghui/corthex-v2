import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useDashboardWs } from '../hooks/use-dashboard-ws'
import { useWsStore } from '../stores/ws-store'
import {
  Bot,
  RefreshCw,
  Database,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react'
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
  anthropic: '#8B5CF6',
  openai: '#10B981',
  google: '#F59E0B',
}

const PROVIDER_LABELS: Record<LLMProviderName, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
}

// === Summary Cards (Stitch metric card grid) ===

function SummaryCards({ data }: { data: DashboardSummary }) {
  const navigate = useNavigate()
  const budgetPct = data.cost.budgetUsagePercent

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Active Agents Card */}
      <div
        data-testid="card-agents"
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col gap-4"
        role="region"
        aria-label="에이전트 현황"
      >
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Agents</p>
          <div className="size-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
            <Bot className="w-[18px] h-[18px]" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-slate-50 text-3xl font-mono font-bold tracking-tight tabular-nums">{data.agents.total}</p>
          <p className="text-emerald-500 text-sm font-mono font-bold flex items-center tabular-nums">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            +{data.agents.active}
          </p>
        </div>
      </div>

      {/* Running Jobs Card */}
      <div
        data-testid="card-tasks"
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col gap-4"
        role="region"
        aria-label="작업 현황"
      >
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Running Jobs</p>
          <div className="size-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
            <RefreshCw className="w-[18px] h-[18px]" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-slate-50 text-3xl font-mono font-bold tracking-tight tabular-nums">{data.tasks.inProgress}</p>
          {data.tasks.failed > 0 ? (
            <p className="text-red-500 text-sm font-mono font-bold flex items-center tabular-nums">
              <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
              -{data.tasks.failed}
            </p>
          ) : (
            <p className="text-emerald-500 text-sm font-mono font-bold flex items-center tabular-nums">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
              +{data.tasks.completed}
            </p>
          )}
        </div>
      </div>

      {/* Tokens Today Card */}
      <div
        data-testid="card-integrations"
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col gap-4"
        role="region"
        aria-label="토큰 사용량"
      >
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Tokens Today</p>
          <div className="size-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
            <Database className="w-[18px] h-[18px]" />
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-slate-50 text-3xl font-mono font-bold tracking-tight tabular-nums">{data.tasks.total}K</p>
          <p className="text-emerald-500 text-sm font-mono font-bold flex items-center tabular-nums">
            <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
            +12%
          </p>
        </div>
      </div>

      {/* Monthly Cost Card */}
      <div
        data-testid="card-cost"
        className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col gap-4 cursor-pointer hover:border-slate-700 transition-colors"
        role="region"
        aria-label="비용 현황"
        onClick={() => navigate('/costs')}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/costs') }}
        tabIndex={0}
      >
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Monthly Cost</p>
          <div className="size-8 rounded-lg bg-cyan-400/10 flex items-center justify-center text-cyan-400">
            <CreditCard className="w-[18px] h-[18px]" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-slate-50 text-3xl font-mono font-bold tracking-tight tabular-nums">${data.cost.todayUsd.toFixed(2)}</p>
          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Budget used</span>
              <span>${(data.cost.todayUsd / (budgetPct / 100 || 1)).toFixed(2)} max</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${Math.min(budgetPct, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
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
    <div data-testid="usage-chart" className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-50">AI 사용량</h3>
          <p className="text-xs text-slate-400 mt-0.5">최근 {days}일</p>
        </div>
        <button
          data-testid="usage-toggle"
          onClick={onToggleDays}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 hover:border-slate-600"
        >
          {days === 7 ? '30일 보기' : '7일 보기'}
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-sm text-slate-500">
          <BarChart3 className="w-8 h-8 mb-2 text-slate-600" />
          사용량 데이터가 없습니다
        </div>
      ) : (
        <>
          <div className="flex items-end gap-[3px] h-52" role="img" aria-label={`최근 ${days}일 AI 사용량 차트`}>
            {grouped.map((day) => {
              const heightPercent = (day.total / maxTotal) * 100
              return (
                <div
                  key={day.date}
                  data-testid={`chart-bar-${day.date}`}
                  className="flex-1 flex flex-col justify-end relative group cursor-pointer"
                  title={`${day.date}: $${day.total.toFixed(2)}`}
                >
                  <div
                    className="w-full rounded-t-md overflow-hidden transition-all duration-500 group-hover:opacity-80"
                    style={{ height: `${heightPercent}%`, minHeight: day.total > 0 ? 3 : 0 }}
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs shadow-2xl whitespace-nowrap pointer-events-none">
                      <p className="font-semibold text-slate-50">{day.date.slice(5)}</p>
                      <p className="text-slate-400 mt-0.5 font-mono">${day.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-3 text-[10px] text-slate-500">
            {grouped.map((day, i) => {
              const showLabel = grouped.length <= 10 || i === 0 || i === grouped.length - 1 || i % 5 === 0
              return (
                <div key={day.date} className="flex-1 text-center">
                  {showLabel && <span>{day.date.slice(5)}</span>}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-800">
        {(['anthropic', 'openai', 'google'] as const).map((p) => (
          <span key={p} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: PROVIDER_COLORS[p] }} />
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
  const barColor = data.usagePercent >= 80 ? 'from-red-500 to-rose-400' : data.usagePercent >= 60 ? 'from-amber-500 to-yellow-400' : 'from-emerald-500 to-teal-400'
  const clampedUsage = Math.min(data.usagePercent, 100)

  return (
    <div data-testid="budget-bar" className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-slate-50">월 예산 진행률</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="font-mono text-slate-300">${data.currentMonthSpendUsd.toFixed(2)}</span>
            {' / '}
            <span className="font-mono">${data.monthlyBudgetUsd.toFixed(2)}</span>
            {data.isDefaultBudget && <span className="ml-1 text-slate-500">(기본값)</span>}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-black tracking-tight ${data.usagePercent >= 80 ? 'text-red-400' : data.usagePercent >= 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {data.usagePercent.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Progress bar with projected marker */}
      <div className="relative mt-4">
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            data-testid="budget-fill"
            className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${barColor}`}
            style={{ width: `${clampedUsage}%` }}
            role="progressbar"
            aria-valuenow={data.usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        {/* Projected marker */}
        {projectedPercent > 0 && projectedPercent <= 120 && (
          <div
            data-testid="budget-projected"
            className="absolute top-0 h-3"
            style={{ left: `${Math.min(projectedPercent, 100)}%` }}
          >
            <div className="w-0.5 h-full bg-white/40" />
            <span className="absolute -top-5 -translate-x-1/2 text-[10px] text-slate-500 whitespace-nowrap font-mono">
              예상 ${data.projectedMonthEndUsd.toFixed(0)}
            </span>
          </div>
        )}
      </div>

      {/* Scale */}
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>

      {/* Department breakdown */}
      {data.byDepartment.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">부서별 비용</h4>
          <div className="space-y-2">
            {data.byDepartment.map((dept) => (
              <div key={dept.departmentId} data-testid={`dept-cost-${dept.departmentId}`} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{dept.name}</span>
                <span className="text-slate-50 font-mono font-medium tabular-nums">${dept.costUsd.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
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
    <div data-testid="quick-actions" className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-50 mb-4">퀵 액션</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            data-testid={`quick-action-${action.id}`}
            onClick={() => handleClick(action)}
            disabled={executingId === action.id}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all duration-200 text-left disabled:opacity-40 disabled:cursor-wait group min-h-[44px]"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {executingId === action.id ? (
                <span className="inline-block w-5 h-5 border-2 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
              ) : action.icon}
            </span>
            <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{action.label}</span>
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
    ? `conic-gradient(#10b981 0% ${posPercent}%, #ef4444 ${posPercent}% ${posPercent + negPercent}%, #1e293b ${posPercent + negPercent}% 100%)`
    : 'conic-gradient(#1e293b 0deg 360deg)'

  return (
    <div data-testid="satisfaction-chart" className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-50">명령 만족도</h3>
          <p className="text-xs text-slate-400 mt-0.5">응답 품질 평가</p>
        </div>
        <div className="flex items-center gap-0.5 bg-slate-800 rounded-lg p-0.5">
          {SATISFACTION_PERIODS.map((p) => (
            <button
              key={p.value}
              data-testid={`satisfaction-period-${p.label}`}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                period === p.value
                  ? 'bg-cyan-400/20 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              aria-current={period === p.value ? 'true' : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
        {/* Donut chart */}
        <div data-testid="donut-chart" className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0">
          <div
            className="w-full h-full rounded-full shadow-lg"
            style={{ background: gradient }}
            role="img"
            aria-label={`만족도 ${sat.rate}%`}
          />
          <div className="absolute inset-4 rounded-full bg-slate-900 flex flex-col items-center justify-center shadow-inner">
            <span className="text-3xl font-black text-slate-50">{sat.rate}%</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">만족도</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">긍정</span>
            </span>
            <span className="text-sm text-slate-50 font-semibold font-mono tabular-nums">{sat.positive} <span className="text-slate-400 font-normal">({posPercent.toFixed(0)}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-300">부정</span>
            </span>
            <span className="text-sm text-slate-50 font-semibold font-mono tabular-nums">{sat.negative} <span className="text-slate-400 font-normal">({negPercent.toFixed(0)}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded bg-slate-700" />
              <span className="text-slate-300">무응답</span>
            </span>
            <span className="text-sm text-slate-400 font-mono tabular-nums">{sat.neutral}</span>
          </div>
          <div className="border-t border-slate-800 pt-2 flex justify-between text-xs text-slate-400">
            <span>전체</span>
            <span className="font-mono tabular-nums">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// === Recent Activity Feed ===

function RecentActivityFeed({ data }: { data: DashboardSummary }) {
  // Build activity items from tasks data
  const activityItems = useMemo(() => {
    const items: Array<{
      id: string
      agentName: string
      action: string
      detail: string
      time: string
      status: 'success' | 'running' | 'error' | 'idle'
    }> = []

    // Add completed tasks
    if (data.tasks.completed > 0) {
      items.push({
        id: 'completed',
        agentName: 'System',
        action: `completed ${data.tasks.completed} tasks`,
        detail: 'All tasks processed successfully',
        time: 'Recently',
        status: 'success',
      })
    }

    // Add in-progress tasks
    if (data.tasks.inProgress > 0) {
      items.push({
        id: 'running',
        agentName: 'System',
        action: `${data.tasks.inProgress} tasks running`,
        detail: 'Active processing in progress',
        time: 'Now',
        status: 'running',
      })
    }

    // Add failed tasks
    if (data.tasks.failed > 0) {
      items.push({
        id: 'failed',
        agentName: 'System',
        action: `${data.tasks.failed} tasks encountered errors`,
        detail: 'Check agent logs for details',
        time: 'Recently',
        status: 'error',
      })
    }

    // Add agent status
    if (data.agents.active > 0) {
      items.push({
        id: 'agents-active',
        agentName: 'System',
        action: `${data.agents.active} agents active`,
        detail: `${data.agents.idle} idle, ${data.agents.error} with errors`,
        time: 'Now',
        status: 'idle',
      })
    }

    // Provider statuses
    for (const p of data.integrations.providers) {
      items.push({
        id: `provider-${p.name}`,
        agentName: PROVIDER_LABELS[p.name],
        action: p.status === 'up' ? 'connected and operational' : 'connection disrupted',
        detail: p.status === 'up' ? 'All endpoints healthy' : 'Service may be degraded',
        time: 'Now',
        status: p.status === 'up' ? 'success' : 'error',
      })
    }

    return items
  }, [data])

  const statusDotClass = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500'
      case 'running': return 'bg-cyan-400 animate-pulse'
      case 'error': return 'bg-red-500'
      default: return 'bg-slate-600'
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-slate-50 text-[22px] font-bold tracking-tight">최근 활동</h2>
        <button className="text-cyan-400 text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <ul className="divide-y divide-slate-800">
          {activityItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 p-4 hover:bg-slate-800/50 transition-colors"
            >
              <div className={`size-2 rounded-full ${statusDotClass(item.status)} shrink-0 mt-1 self-start`} />
              <div className="flex-1 min-w-0">
                <p className="text-slate-50 text-sm font-medium truncate">
                  <span className="font-bold mr-1">{item.agentName}</span> {item.action}
                </p>
                <p className="text-slate-400 text-xs mt-1 truncate">{item.detail}</p>
              </div>
              <div className="text-slate-500 text-xs font-mono whitespace-nowrap shrink-0">
                {item.time}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// === Loading Skeleton ===

function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-3 w-24 bg-slate-800 animate-pulse rounded" />
              <div className="w-8 h-8 rounded-lg bg-slate-800 animate-pulse" />
            </div>
            <div className="h-10 w-20 bg-slate-800 animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-72">
          <div className="h-4 w-24 bg-slate-800 animate-pulse rounded mb-6" />
          <div className="h-52 bg-slate-800/50 animate-pulse rounded-xl" />
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-72">
          <div className="h-4 w-24 bg-slate-800 animate-pulse rounded mb-6" />
          <div className="h-3 w-full bg-slate-800 animate-pulse rounded-full mt-8" />
        </div>
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
    document.title = '대시보드 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div data-testid="dashboard-page" className="h-full overflow-y-auto bg-slate-950">
      {/* Main content container matching Stitch layout */}
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Page Header */}
        <header className="mb-10 flex items-center justify-between">
          <h1 className="text-slate-50 text-[32px] font-bold tracking-tight">대시보드</h1>
          <div data-testid="ws-status" className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 실시간 연결됨
              </span>
            ) : (
              <span className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-400" /> 연결 끊김
              </span>
            )}
          </div>
        </header>

        {isLoading && !summary ? (
          <DashboardSkeleton />
        ) : summaryError && !summary ? (
          <div data-testid="dashboard-error" className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-base font-medium text-slate-300">데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-slate-500 mt-1">잠시 후 자동으로 재시도합니다</p>
          </div>
        ) : (
          <>
            {/* Metrics Grid — matches Stitch 4-card layout */}
            {summary && <SummaryCards data={summary} />}

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {usage && (
                <UsageChart
                  data={usage}
                  days={usageDays}
                  onToggleDays={() => setUsageDays((d) => (d === 7 ? 30 : 7))}
                />
              )}

              {budget && <BudgetBar data={budget} />}
            </div>

            {/* Quick actions + Satisfaction row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <QuickActionsPanel />
              <SatisfactionChart />
            </div>

            {/* Recent Activity — matches Stitch activity feed */}
            {summary && <RecentActivityFeed data={summary} />}
          </>
        )}
      </div>
    </div>
  )
}
