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
  anthropic: '#8B5CF6',
  openai: '#10B981',
  google: '#F59E0B',
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
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
      {/* Task Card */}
      <div
        data-testid="card-tasks"
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border border-blue-500/20 p-4 sm:p-6 hover:border-blue-500/40 transition-all duration-300 group"
        role="region"
        aria-label="작업 현황"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-blue-400/80">작업 현황</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-4 tracking-tight font-mono">{data.tasks.total}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {data.tasks.completed} 완료
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {data.tasks.failed} 실패
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> {data.tasks.inProgress} 진행
            </span>
          </div>
        </div>
      </div>

      {/* Cost Card — clickable → /costs */}
      <div
        data-testid="card-cost"
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-violet-600/20 via-slate-800 to-slate-800 border border-violet-500/20 p-4 sm:p-6 cursor-pointer hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 group"
        role="region"
        aria-label="비용 현황"
        onClick={() => navigate('/costs')}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/costs') }}
        tabIndex={0}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-violet-500/10 transition-colors" />
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-violet-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-violet-400/80">비용 현황</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-3 tracking-tight font-mono">${data.cost.todayUsd.toFixed(2)}</p>
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>월 예산 사용률</span>
              <span className="font-mono font-bold text-white">{budgetPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-slate-700/80 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${budgetPct < 60 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : budgetPct < 80 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                style={{ width: `${Math.min(budgetPct, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {data.cost.byProvider.map((p) => (
              <span key={p.provider} className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: PROVIDER_COLORS[p.provider] }} />
                {PROVIDER_LABELS[p.provider]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Card */}
      <div
        data-testid="card-agents"
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-600/20 via-slate-800 to-slate-800 border border-cyan-500/20 p-4 sm:p-6 hover:border-cyan-500/40 transition-all duration-300 group"
        role="region"
        aria-label="에이전트 현황"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-500/10 transition-colors" />
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-cyan-400/80">에이전트</span>
          </div>
          <p className="text-2xl sm:text-4xl font-black text-white mb-2 sm:mb-4 tracking-tight font-mono">{data.agents.total}</p>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {data.agents.active} 활성
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-500/10 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> {data.agents.idle} 대기
            </span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 text-red-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {data.agents.error} 오류
            </span>
          </div>
        </div>
      </div>

      {/* Integration Card */}
      <div
        data-testid="card-integrations"
        className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-600/20 via-slate-800 to-slate-800 border border-amber-500/20 p-4 sm:p-6 hover:border-amber-500/40 transition-all duration-300 group col-span-2 sm:col-span-1"
        role="region"
        aria-label="연동 상태"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-colors" />
        <div className="relative">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-amber-400/80">연동 상태</span>
          </div>
          <div className="space-y-2.5">
            {data.integrations.providers.map((p) => (
              <div key={p.name} data-testid={`provider-${p.name}`} className="flex items-center justify-between text-sm" aria-label={`${PROVIDER_LABELS[p.name]} ${p.status === 'up' ? '정상' : '중단'}`}>
                <span className="text-slate-300 font-medium">{PROVIDER_LABELS[p.name]}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${p.status === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'up' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  {p.status === 'up' ? '정상' : '중단'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium">도구 시스템</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${data.integrations.toolSystemOk ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data.integrations.toolSystemOk ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {data.integrations.toolSystemOk ? '정상' : '중단'}
              </span>
            </div>
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
    <div data-testid="usage-chart" className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">AI 사용량</h3>
          <p className="text-xs text-slate-500 mt-0.5">최근 {days}일</p>
        </div>
        <button
          data-testid="usage-toggle"
          onClick={onToggleDays}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-all border border-slate-600/50 hover:border-slate-500/50"
        >
          {days === 7 ? '30일 보기' : '7일 보기'}
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-52 text-sm text-slate-600">
          <svg className="w-8 h-8 mb-2 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
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
                    <div className="bg-slate-900 border border-slate-600 rounded-xl px-3.5 py-2.5 text-xs shadow-2xl whitespace-nowrap pointer-events-none">
                      <p className="font-semibold text-white">{day.date.slice(5)}</p>
                      <p className="text-slate-400 mt-0.5 font-mono">${day.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between mt-3 text-[10px] text-slate-600">
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
      <div className="flex items-center justify-center gap-5 mt-4 pt-4 border-t border-slate-700/50">
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
    <div data-testid="budget-bar" className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-white">월 예산 진행률</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            <span className="font-mono text-slate-300">${data.currentMonthSpendUsd.toFixed(2)}</span>
            {' / '}
            <span className="font-mono">${data.monthlyBudgetUsd.toFixed(2)}</span>
            {data.isDefaultBudget && <span className="ml-1 text-slate-600">(기본값)</span>}
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
        <div className="h-3 bg-slate-700/60 rounded-full overflow-hidden">
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
        {/* Projected marker (outside overflow-hidden) */}
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
      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-600">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>

      {/* Department breakdown */}
      {data.byDepartment.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-700/50">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">부서별 비용</h4>
          <div className="space-y-2">
            {data.byDepartment.map((dept) => (
              <div key={dept.departmentId} data-testid={`dept-cost-${dept.departmentId}`} className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{dept.name}</span>
                <span className="text-white font-mono font-medium">${dept.costUsd.toFixed(2)}</span>
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
    <div data-testid="quick-actions" className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 backdrop-blur-sm">
      <h3 className="text-base font-semibold text-white mb-4">퀵 액션</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            data-testid={`quick-action-${action.id}`}
            onClick={() => handleClick(action)}
            disabled={executingId === action.id}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-700/30 border border-slate-700/50 hover:bg-slate-700/60 hover:border-slate-600 transition-all duration-200 text-left disabled:opacity-40 disabled:cursor-wait group"
          >
            <span className="text-xl group-hover:scale-110 transition-transform">
              {executingId === action.id ? (
                <span className="inline-block w-5 h-5 border-2 border-slate-600 border-t-violet-400 rounded-full animate-spin" />
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
    <div data-testid="satisfaction-chart" className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">명령 만족도</h3>
          <p className="text-xs text-slate-500 mt-0.5">응답 품질 평가</p>
        </div>
        <div className="flex items-center gap-0.5 bg-slate-700/40 rounded-lg p-0.5">
          {SATISFACTION_PERIODS.map((p) => (
            <button
              key={p.value}
              data-testid={`satisfaction-period-${p.label}`}
              onClick={() => setPeriod(p.value)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                period === p.value
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
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
          <div className="absolute inset-4 rounded-full bg-slate-800 flex flex-col items-center justify-center shadow-inner">
            <span className="text-3xl font-black text-white">{sat.rate}%</span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">만족도</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-300">긍정</span>
            </span>
            <span className="text-sm text-white font-semibold font-mono">{sat.positive} <span className="text-slate-500 font-normal">({posPercent.toFixed(0)}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-300">부정</span>
            </span>
            <span className="text-sm text-white font-semibold font-mono">{sat.negative} <span className="text-slate-500 font-normal">({negPercent.toFixed(0)}%)</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded bg-slate-700" />
              <span className="text-slate-300">무응답</span>
            </span>
            <span className="text-sm text-slate-500 font-mono">{sat.neutral}</span>
          </div>
          <div className="border-t border-slate-700/50 pt-2 flex justify-between text-xs text-slate-500">
            <span>전체</span>
            <span className="font-mono">{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// === Loading Skeleton ===

function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-700/50 animate-pulse" />
              <div className="h-3 w-16 bg-slate-700/50 animate-pulse rounded" />
            </div>
            <div className="h-10 w-20 bg-slate-700/50 animate-pulse rounded mb-4" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-700/30 animate-pulse rounded-full" />
              <div className="h-6 w-16 bg-slate-700/30 animate-pulse rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 h-72">
          <div className="h-4 w-24 bg-slate-700/50 animate-pulse rounded mb-6" />
          <div className="h-52 bg-slate-700/20 animate-pulse rounded-xl" />
        </div>
        <div className="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 h-72">
          <div className="h-4 w-24 bg-slate-700/50 animate-pulse rounded mb-6" />
          <div className="h-3 w-full bg-slate-700/30 animate-pulse rounded-full mt-8" />
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
    document.title = '작전현황 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div data-testid="dashboard-page" className="h-full overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <div data-testid="dashboard-header" className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">작전현황</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">조직 전체 현황을 한눈에 파악합니다</p>
        </div>
        <div data-testid="ws-status" className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-2 text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> <span className="hidden sm:inline">실시간 연결됨</span><span className="sm:hidden">연결</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <span className="w-2 h-2 rounded-full bg-red-400" /> <span className="hidden sm:inline">연결 끊김</span><span className="sm:hidden">끊김</span>
            </span>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-12">
        {isLoading && !summary ? (
          <DashboardSkeleton />
        ) : summaryError && !summary ? (
          <div data-testid="dashboard-error" className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-base font-medium text-slate-300">데이터를 불러올 수 없습니다</p>
            <p className="text-sm text-slate-600 mt-1">잠시 후 자동으로 재시도합니다</p>
          </div>
        ) : (
          <>
            {summary && <SummaryCards data={summary} />}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {usage && (
                <UsageChart
                  data={usage}
                  days={usageDays}
                  onToggleDays={() => setUsageDays((d) => (d === 7 ? 30 : 7))}
                />
              )}

              {budget && <BudgetBar data={budget} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <QuickActionsPanel />
              <SatisfactionChart />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
