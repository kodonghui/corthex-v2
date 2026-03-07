import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, Skeleton } from '@corthex/ui'
import { api } from '../lib/api'
import type { DashboardBudget } from '@corthex/shared'

// === Types ===

type CostByAgent = {
  agentId: string
  agentName: string
  totalCostMicro: number
  inputTokens: number
  outputTokens: number
  callCount: number
}

type CostDaily = {
  date: string
  costMicro: number
  inputTokens: number
  outputTokens: number
  callCount: number
}

type CostOverview = {
  totalCostUsd: number
  byModel: { model: string; costUsd: number; inputTokens: number; outputTokens: number; count: number }[]
  byAgent: { agentId: string; agentName: string; costUsd: number; count: number }[]
  bySource: { source: string; costUsd: number; count: number }[]
  days: number
}

// === Constants ===

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: '#3B82F6',
  openai: '#22C55E',
  google: '#F97316',
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  google: 'Google',
}

// === Helpers ===

function microToUsd(micro: number): string {
  return (micro / 1_000_000).toFixed(2)
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function getDatesForDays(days: number) {
  const end = new Date()
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}

// === Period Selector ===

type PeriodType = '7d' | '30d' | 'custom'

function PeriodSelector({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
}: {
  period: PeriodType
  onPeriodChange: (p: PeriodType) => void
  customStart: string
  customEnd: string
  onCustomStartChange: (v: string) => void
  onCustomEndChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {(['7d', '30d', 'custom'] as const).map((p) => (
        <button
          key={p}
          onClick={() => onPeriodChange(p)}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            period === p
              ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {p === '7d' ? '7일' : p === '30d' ? '30일' : '직접 설정'}
        </button>
      ))}
      {period === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onCustomStartChange(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
          <span className="text-zinc-400 text-xs">~</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
        </div>
      )}
    </div>
  )
}

// === Budget Warning Banner ===

function BudgetWarningBanner({ budget }: { budget: DashboardBudget }) {
  if (budget.usagePercent < 80) return null

  const isExceeded = budget.usagePercent >= 100
  return (
    <div
      className={`px-4 py-3 rounded-xl text-sm font-medium ${
        isExceeded
          ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800'
      }`}
    >
      {isExceeded
        ? `예산 초과! 현재 ${budget.usagePercent.toFixed(0)}% 사용 — 자동 차단이 활성화될 수 있습니다`
        : `예산 ${budget.usagePercent.toFixed(0)}% 사용 중 — 주의가 필요합니다`}
    </div>
  )
}

// === Cost Overview Cards ===

function CostOverviewSection({
  costData,
  budget,
}: {
  costData: CostOverview
  budget: DashboardBudget | undefined
}) {
  // Group model costs by provider for donut
  const providerCosts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const m of costData.byModel) {
      // Extract provider from model name
      const provider = m.model.startsWith('claude')
        ? 'anthropic'
        : m.model.startsWith('gpt') || m.model.startsWith('o1') || m.model.startsWith('o3') || m.model.startsWith('o4')
          ? 'openai'
          : m.model.startsWith('gemini')
            ? 'google'
            : 'other'
      map[provider] = (map[provider] ?? 0) + m.costUsd
    }
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
  }, [costData.byModel])

  const totalCost = costData.totalCostUsd
  const usagePercent = budget?.usagePercent ?? 0

  // Build donut gradient
  const donutGradient = useMemo(() => {
    if (providerCosts.length === 0 || totalCost <= 0) {
      return 'conic-gradient(#D4D4D8 0deg 360deg)'
    }
    let currentAngle = 0
    const segments: string[] = []
    for (const [provider, cost] of providerCosts) {
      const pct = (cost / totalCost) * 360
      const color = PROVIDER_COLORS[provider] ?? '#9CA3AF'
      segments.push(`${color} ${currentAngle}deg ${currentAngle + pct}deg`)
      currentAngle += pct
    }
    // Fill remaining with gray if rounding leaves gaps
    if (currentAngle < 360) {
      const lastColor = PROVIDER_COLORS[providerCosts[providerCosts.length - 1][0]] ?? '#9CA3AF'
      segments.push(`${lastColor} ${currentAngle}deg 360deg`)
    }
    return `conic-gradient(${segments.join(', ')})`
  }, [providerCosts, totalCost])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Cost */}
      <Card>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            총 비용
          </p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            ${totalCost.toFixed(2)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            최근 {costData.days}일 합계
          </p>
        </div>
      </Card>

      {/* Budget Usage */}
      <Card>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-2">
            예산 사용률
          </p>
          <p className={`text-3xl font-bold ${
            usagePercent >= 100
              ? 'text-red-500'
              : usagePercent >= 80
                ? 'text-yellow-500'
                : 'text-emerald-500'
          }`}>
            {usagePercent.toFixed(0)}%
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {budget
              ? `$${budget.currentMonthSpendUsd.toFixed(2)} / $${budget.monthlyBudgetUsd.toFixed(0)}`
              : '예산 미설정'}
          </p>
        </div>
      </Card>

      {/* Provider Donut */}
      <Card>
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide mb-3">
            프로바이더별 비용
          </p>
          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <div
                className="w-full h-full rounded-full"
                style={{ background: donutGradient }}
                role="img"
                aria-label="프로바이더별 비용 비율"
              />
              <div className="absolute inset-2.5 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center">
                <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">
                  ${totalCost.toFixed(0)}
                </span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex-1 space-y-1.5">
              {providerCosts.map(([provider, cost]) => (
                <div key={provider} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-sm inline-block"
                      style={{ backgroundColor: PROVIDER_COLORS[provider] ?? '#9CA3AF' }}
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {PROVIDER_LABELS[provider] ?? provider}
                    </span>
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    ${cost.toFixed(2)}
                  </span>
                </div>
              ))}
              {providerCosts.length === 0 && (
                <span className="text-zinc-400 text-xs">데이터 없음</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

// === Top Agents by Cost ===

function TopAgentsSection({ agents }: { agents: { agentId: string; agentName: string; costUsd: number; count: number }[] }) {
  const [showAll, setShowAll] = useState(false)

  const sorted = useMemo(
    () => [...agents].sort((a, b) => b.costUsd - a.costUsd),
    [agents],
  )

  const display = showAll ? sorted : sorted.slice(0, 10)
  const maxCost = sorted[0]?.costUsd ?? 1

  return (
    <Card>
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          에이전트별 비용 순위
        </h3>
        {display.length === 0 ? (
          <div className="h-24 flex items-center justify-center text-sm text-zinc-400">
            데이터가 없습니다
          </div>
        ) : (
          <div className="space-y-2">
            {display.map((agent, i) => {
              const barWidth = maxCost > 0 ? (agent.costUsd / maxCost) * 100 : 0
              return (
                <div key={agent.agentId} className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400 w-5 text-right font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{agent.agentName}</span>
                      <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 ml-2 flex-shrink-0">
                        ${agent.costUsd.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400">{formatNumber(agent.count)} 호출</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {sorted.length > 10 && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {showAll ? '접기' : `더보기 (${sorted.length - 10}개)`}
          </button>
        )}
      </div>
    </Card>
  )
}

// === Daily Cost Trend Chart ===

function DailyCostChart({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['costs-daily-ceo', startDate, endDate],
    queryFn: () =>
      api.get<{ success: boolean; data: { items: CostDaily[] } }>(
        `/workspace/dashboard/costs/daily?startDate=${startDate}&endDate=${endDate}`,
      ),
  })

  const items = data?.data?.items ?? []
  const maxCost = Math.max(...items.map((d) => d.costMicro), 1)

  return (
    <Card>
      <div className="px-5 py-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
          일일 비용 추이
        </h3>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : items.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-sm text-zinc-400">
            데이터가 없습니다
          </div>
        ) : (
          <div className="flex items-end gap-[2px] h-40">
            {items.map((d) => {
              const pct = (d.costMicro / maxCost) * 100
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group relative"
                >
                  <div
                    className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-t transition-all hover:bg-indigo-600 dark:hover:bg-indigo-300 min-h-[2px]"
                    style={{ height: `${Math.max(pct, 1)}%` }}
                  />
                  <span className="text-[8px] text-zinc-400 mt-1 truncate w-full text-center">
                    {d.date.slice(5)}
                  </span>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    ${microToUsd(d.costMicro)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}

// === Loading Skeleton ===

function CostsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="px-5 py-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <div className="px-5 py-4">
          <Skeleton className="h-4 w-40 mb-3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </Card>
      <Card>
        <div className="px-5 py-4">
          <Skeleton className="h-4 w-40 mb-3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </Card>
    </div>
  )
}

// === Main Page ===

export function CostsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<PeriodType>('7d')
  const [customStart, setCustomStart] = useState(() => getDatesForDays(30).start)
  const [customEnd, setCustomEnd] = useState(() => getDatesForDays(0).end)

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 0
  const { start: startDate, end: endDate } = useMemo(() => {
    if (period === 'custom') return { start: customStart, end: customEnd }
    return getDatesForDays(days)
  }, [period, days, customStart, customEnd])

  // Calculate effective days for the costs endpoint (which only accepts ?days=N)
  const effectiveDays = useMemo(() => {
    if (period !== 'custom') return days
    const diff = Math.ceil(
      (new Date(customEnd).getTime() - new Date(customStart).getTime()) / (24 * 60 * 60 * 1000),
    )
    return Math.max(diff, 1)
  }, [period, days, customStart, customEnd])

  // Cost overview (uses days-based endpoint)
  const { data: costRes, isLoading: costLoading } = useQuery({
    queryKey: ['costs-overview', effectiveDays, period === 'custom' ? `${startDate}-${endDate}` : ''],
    queryFn: () =>
      api.get<{ data: CostOverview }>(
        `/workspace/dashboard/costs?days=${effectiveDays}`,
      ),
  })

  // Budget
  const { data: budgetRes, isLoading: budgetLoading } = useQuery({
    queryKey: ['costs-budget'],
    queryFn: () => api.get<{ data: DashboardBudget }>('/workspace/dashboard/budget'),
  })

  // Agent breakdown (workspace-scoped with date range)
  const { data: agentRes } = useQuery({
    queryKey: ['costs-by-agent-ceo', startDate, endDate],
    queryFn: () =>
      api.get<{ success: boolean; data: { items: CostByAgent[] } }>(
        `/workspace/dashboard/costs/by-agent?startDate=${startDate}&endDate=${endDate}`,
      ),
  })

  const costData = costRes?.data
  const budget = budgetRes?.data
  const agentItems = agentRes?.data?.items ?? []

  // Convert agent microdollars to USD for display
  const agentsByUsd = useMemo(
    () =>
      agentItems.map((a) => ({
        agentId: a.agentId,
        agentName: a.agentName,
        costUsd: a.totalCostMicro / 1_000_000,
        count: a.callCount,
      })),
    [agentItems],
  )

  const isLoading = costLoading || budgetLoading

  useEffect(() => {
    document.title = '비용 분석 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            aria-label="대시보드로 돌아가기"
          >
            &larr;
          </button>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">비용 분석</h2>
            <p className="text-xs text-zinc-500 mt-0.5">AI 운영 비용을 상세하게 분석합니다</p>
          </div>
        </div>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
        />
      </div>

      <div className="px-6 py-4 space-y-6 max-w-6xl">
        {isLoading && !costData ? (
          <CostsSkeleton />
        ) : !costData ? (
          <div className="text-center py-12 text-sm text-zinc-500">
            데이터를 불러올 수 없습니다
          </div>
        ) : (
          <>
            {/* Budget Warning Banner */}
            {budget && <BudgetWarningBanner budget={budget} />}

            {/* Cost Overview: total, budget %, provider donut */}
            <CostOverviewSection costData={costData} budget={budget} />

            {/* Two-column: Agents + Daily Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Agents */}
              <TopAgentsSection
                agents={agentsByUsd.length > 0 ? agentsByUsd : costData.byAgent}
              />

              {/* Daily Cost Trend */}
              <DailyCostChart startDate={startDate} endDate={endDate} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
