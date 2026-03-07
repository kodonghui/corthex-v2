import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Skeleton, Toggle } from '@corthex/ui'
import { api } from '../lib/api'
import type {
  LLMProviderName,
  DashboardSummary,
  DashboardUsageDay,
  DashboardUsage,
  DashboardBudget,
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

const REFETCH_INTERVAL = 30_000

// === Summary Cards ===

function SummaryCards({ data }: { data: DashboardSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Task Card */}
      <Card>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📋</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              작업 현황
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{data.tasks.total}</p>
          <p className="text-xs text-zinc-500 mt-1">오늘 총 명령</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-green-600 dark:text-green-400">
              ● {data.tasks.completed} 완료
            </span>
            <span className="text-red-500 dark:text-red-400">● {data.tasks.failed} 실패</span>
            <span className="text-blue-500 dark:text-blue-400">
              ● {data.tasks.inProgress} 진행중
            </span>
          </div>
        </div>
      </Card>

      {/* Cost Card */}
      <Card>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">💰</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              비용 현황
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ${data.cost.todayUsd.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            오늘 비용 · 예산 {data.cost.budgetUsagePercent.toFixed(0)}% 사용
          </p>
          <div className="flex gap-2 mt-2 text-xs flex-wrap">
            {data.cost.byProvider.map((p) => (
              <span key={p.provider} style={{ color: PROVIDER_COLORS[p.provider] }}>
                {PROVIDER_LABELS[p.provider]} ${p.costUsd.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Agent Card */}
      <Card>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🤖</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              에이전트 현황
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{data.agents.total}</p>
          <p className="text-xs text-zinc-500 mt-1">전체 에이전트</p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="text-green-600 dark:text-green-400">
              ● {data.agents.active} 활성
            </span>
            <span className="text-zinc-400">● {data.agents.idle} 유휴</span>
            <span className="text-red-500 dark:text-red-400">● {data.agents.error} 에러</span>
          </div>
        </div>
      </Card>

      {/* Integration Card */}
      <Card>
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🔗</span>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              연동 상태
            </span>
          </div>
          <div className="space-y-1.5 mt-1">
            {data.integrations.providers.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-zinc-700 dark:text-zinc-300">
                  {PROVIDER_LABELS[p.name]}
                </span>
                <span
                  className={
                    p.status === 'up'
                      ? 'text-green-600 dark:text-green-400 text-xs'
                      : 'text-red-500 dark:text-red-400 text-xs'
                  }
                >
                  {p.status === 'up' ? '● 정상' : '● 중단'}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-700 dark:text-zinc-300">도구 시스템</span>
              <span
                className={
                  data.integrations.toolSystemOk
                    ? 'text-green-600 dark:text-green-400 text-xs'
                    : 'text-red-500 dark:text-red-400 text-xs'
                }
              >
                {data.integrations.toolSystemOk ? '● 정상' : '● 중단'}
              </span>
            </div>
          </div>
        </div>
      </Card>
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
    <Card>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            AI 사용량 ({days}일)
          </h3>
          <Toggle
            checked={days === 30}
            onChange={onToggleDays}
            label={days === 30 ? '30일' : '7일'}
            size="sm"
          />
        </div>

        {grouped.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-zinc-400">
            사용량 데이터가 없습니다
          </div>
        ) : (
          <>
            <div className="flex items-end gap-1 h-40" role="img" aria-label={`최근 ${days}일 AI 사용량 차트`}>
              {grouped.map((day) => {
                const heightPercent = (day.total / maxTotal) * 100
                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col justify-end relative group"
                    title={`${day.date}: $${day.total.toFixed(2)}`}
                  >
                    <div
                      className="w-full rounded-t-sm overflow-hidden"
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
                      <div className="bg-zinc-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow">
                        {day.date.slice(5)} · ${day.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-1 mt-1">
              {grouped.map((day, i) => {
                const showLabel = grouped.length <= 10 || i === 0 || i === grouped.length - 1 || i % 5 === 0
                return (
                  <div key={day.date} className="flex-1 text-center">
                    {showLabel && (
                      <span className="text-[9px] text-zinc-400">{day.date.slice(5)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs">
          {(['anthropic', 'openai', 'google'] as const).map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: PROVIDER_COLORS[p] }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">{PROVIDER_LABELS[p]}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// === Budget Progress Bar ===

function getBudgetColor(percent: number): string {
  if (percent >= 80) return 'bg-red-500'
  if (percent >= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

function BudgetBar({ data }: { data: DashboardBudget }) {
  const projectedPercent = data.monthlyBudgetUsd > 0
    ? Math.min((data.projectedMonthEndUsd / data.monthlyBudgetUsd) * 100, 120)
    : 0
  const barColor = getBudgetColor(data.usagePercent)
  const clampedUsage = Math.min(data.usagePercent, 100)

  return (
    <Card>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">월 예산 진행률</h3>
          <span className="text-xs text-zinc-500">
            ${data.currentMonthSpendUsd.toFixed(2)} / ${data.monthlyBudgetUsd.toFixed(0)}
            {data.isDefaultBudget && (
              <span className="ml-1 text-zinc-400">(기본값)</span>
            )}
          </span>
        </div>

        {/* Progress bar with projected marker */}
        <div className="relative h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-visible">
          {/* Current spend */}
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${clampedUsage}%` }}
            role="progressbar"
            aria-valuenow={data.usagePercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          {/* Projected marker (dashed line) */}
          {projectedPercent > 0 && projectedPercent <= 120 && (
            <div
              className="absolute top-0 h-full border-r-2 border-dashed border-zinc-500 dark:border-zinc-400"
              style={{ left: `${Math.min(projectedPercent, 100)}%` }}
              title={`월말 예상: $${data.projectedMonthEndUsd.toFixed(2)}`}
            >
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-zinc-500 whitespace-nowrap">
                예상 ${data.projectedMonthEndUsd.toFixed(0)}
              </span>
            </div>
          )}
        </div>

        {/* Percentage labels */}
        <div className="flex justify-between mt-1 text-[10px] text-zinc-400">
          <span>0%</span>
          <span className="font-medium text-zinc-600 dark:text-zinc-300">
            {data.usagePercent.toFixed(0)}% 사용
          </span>
          <span>100%</span>
        </div>

        {/* Department breakdown */}
        {data.byDepartment.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
              부서별 비용
            </p>
            <div className="space-y-1">
              {data.byDepartment.map((dept) => (
                <div key={dept.departmentId} className="flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">{dept.name}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                    ${dept.costUsd.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// === Quick Actions ===

function QuickActions() {
  const navigate = useNavigate()

  const actions = [
    { label: '루틴 실행', command: '/루틴', icon: '▶️', desc: '일상 루틴 자동 실행' },
    { label: '시스템 점검', command: '/시스템점검', icon: '🔍', desc: '전체 시스템 상태 점검' },
    { label: '비용 리포트', command: '/비용리포트', icon: '📊', desc: '상세 비용 분석 보고서' },
  ]

  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">퀵 액션</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.command}
            onClick={() =>
              navigate(`/command-center?preset=${encodeURIComponent(action.command)}`)
            }
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
          >
            <span className="text-xl">{action.icon}</span>
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {action.label}
              </p>
              <p className="text-xs text-zinc-500">{action.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// === Loading Skeleton ===

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="px-4 py-3 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="px-5 py-4">
          <Skeleton className="h-4 w-32 mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Card>
      <Card>
        <div className="px-5 py-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Card>
    </div>
  )
}

// === Main Page ===

export function DashboardPage() {
  const [usageDays, setUsageDays] = useState(7)

  const { data: summaryRes, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<{ data: DashboardSummary }>('/workspace/dashboard/summary'),
    refetchInterval: REFETCH_INTERVAL,
  })

  const { data: usageRes, isLoading: usageLoading } = useQuery({
    queryKey: ['dashboard-usage', usageDays],
    queryFn: () =>
      api.get<{ data: DashboardUsage }>(`/workspace/dashboard/usage?days=${usageDays}`),
    refetchInterval: REFETCH_INTERVAL,
  })

  const { data: budgetRes, isLoading: budgetLoading } = useQuery({
    queryKey: ['dashboard-budget'],
    queryFn: () => api.get<{ data: DashboardBudget }>('/workspace/dashboard/budget'),
    refetchInterval: REFETCH_INTERVAL,
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
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">작전현황</h2>
        <p className="text-xs text-zinc-500 mt-0.5">조직 전체 현황을 한눈에 파악합니다</p>
      </div>

      <div className="px-6 py-4 space-y-6 max-w-6xl">
        {isLoading && !summary ? (
          <DashboardSkeleton />
        ) : summaryError && !summary ? (
          <div className="text-center py-12 text-sm text-zinc-500">
            <p>데이터를 불러올 수 없습니다</p>
            <p className="text-xs mt-1">잠시 후 자동으로 재시도합니다</p>
          </div>
        ) : (
          <>
            {summary && <SummaryCards data={summary} />}

            {usage && (
              <UsageChart
                data={usage}
                days={usageDays}
                onToggleDays={() => setUsageDays((d) => (d === 7 ? 30 : 7))}
              />
            )}

            {budget && <BudgetBar data={budget} />}

            <QuickActions />
          </>
        )}
      </div>
    </div>
  )
}
