import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            period === p
              ? 'bg-blue-600/20 text-blue-400'
              : 'text-slate-400 hover:bg-slate-700'
          }`}
          aria-pressed={period === p}
          data-testid={`period-${p}`}
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
            className="px-2 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-800 text-slate-200 outline-none focus:border-blue-500"
          />
          <span className="text-slate-500 text-xs">~</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onCustomEndChange(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-800 text-slate-200 outline-none focus:border-blue-500"
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
          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
      }`}
      role="alert"
      data-testid="budget-warning"
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
      return 'conic-gradient(#334155 0deg 360deg)'
    }
    let currentAngle = 0
    const segments: string[] = []
    for (const [provider, cost] of providerCosts) {
      const pct = (cost / totalCost) * 360
      const color = PROVIDER_COLORS[provider] ?? '#9CA3AF'
      segments.push(`${color} ${currentAngle}deg ${currentAngle + pct}deg`)
      currentAngle += pct
    }
    if (currentAngle < 360) {
      const lastColor = PROVIDER_COLORS[providerCosts[providerCosts.length - 1][0]] ?? '#9CA3AF'
      segments.push(`${lastColor} ${currentAngle}deg 360deg`)
    }
    return `conic-gradient(${segments.join(', ')})`
  }, [providerCosts, totalCost])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="cost-summary">
      {/* Total Cost */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">총 비용</p>
        <p className="text-3xl font-bold text-slate-50">${totalCost.toFixed(2)}</p>
        <p className="text-xs text-slate-500 mt-1">최근 {costData.days}일 합계</p>
      </div>

      {/* Budget Usage */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">예산 사용률</p>
        <p className={`text-3xl font-bold ${
          usagePercent >= 100
            ? 'text-red-500'
            : usagePercent >= 80
              ? 'text-amber-400'
              : 'text-emerald-400'
        }`}>
          {usagePercent.toFixed(0)}%
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {budget
            ? `$${budget.currentMonthSpendUsd.toFixed(2)} / $${budget.monthlyBudgetUsd.toFixed(0)}`
            : '예산 미설정'}
        </p>
      </div>

      {/* Provider Donut */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">프로바이더별 비용</p>
        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative w-20 h-20 flex-shrink-0">
            <div
              className="w-full h-full rounded-full"
              style={{ background: donutGradient }}
              role="img"
              aria-label="프로바이더별 비용 비율"
            />
            <div className="absolute inset-2.5 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-200">
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
                  <span className="text-slate-400">
                    {PROVIDER_LABELS[provider] ?? provider}
                  </span>
                </span>
                <span className="font-medium text-slate-200">
                  ${cost.toFixed(2)}
                </span>
              </div>
            ))}
            {providerCosts.length === 0 && (
              <span className="text-slate-500 text-xs">데이터 없음</span>
            )}
          </div>
        </div>
      </div>
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4" data-testid="top-agents">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">에이전트별 비용 순위</h3>
      {display.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-sm text-slate-500">
          데이터가 없습니다
        </div>
      ) : (
        <div className="space-y-2">
          {display.map((agent, i) => {
            const barWidth = maxCost > 0 ? (agent.costUsd / maxCost) * 100 : 0
            return (
              <div key={agent.agentId} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-5 text-right font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm text-slate-100 truncate">{agent.agentName}</span>
                    <span className="text-xs font-mono text-slate-300 ml-2 flex-shrink-0">
                      ${agent.costUsd.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{formatNumber(agent.count)} 호출</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {sorted.length > 10 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-xs text-blue-400 hover:text-blue-300 hover:underline"
        >
          {showAll ? '접기' : `더보기 (${sorted.length - 10}개)`}
        </button>
      )}
    </div>
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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4" data-testid="daily-chart">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">일일 비용 추이</h3>

      {isLoading ? (
        <div className="h-40 w-full bg-slate-700/50 rounded animate-pulse" />
      ) : items.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-slate-500">
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
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400 min-h-[2px]"
                  style={{ height: `${Math.max(pct, 1)}%` }}
                />
                <span className="text-[8px] text-slate-500 mt-1 truncate w-full text-center">
                  {d.date.slice(5)}
                </span>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-700 text-slate-100 text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-lg">
                  ${microToUsd(d.costMicro)}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// === Loading Skeleton ===

function CostsSkeleton() {
  return (
    <div className="space-y-6" data-testid="costs-loading">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4 space-y-2">
            <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
            <div className="h-8 w-24 bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-32 bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
          <div className="h-4 w-40 bg-slate-700 rounded animate-pulse mb-3" />
          <div className="h-40 w-full bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-5 py-4">
          <div className="h-4 w-40 bg-slate-700 rounded animate-pulse mb-3" />
          <div className="h-40 w-full bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
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

  const effectiveDays = useMemo(() => {
    if (period !== 'custom') return days
    const diff = Math.ceil(
      (new Date(customEnd).getTime() - new Date(customStart).getTime()) / (24 * 60 * 60 * 1000),
    )
    return Math.max(diff, 1)
  }, [period, days, customStart, customEnd])

  const { data: costRes, isLoading: costLoading } = useQuery({
    queryKey: ['costs-overview', effectiveDays, period === 'custom' ? `${startDate}-${endDate}` : ''],
    queryFn: () =>
      api.get<{ data: CostOverview }>(
        `/workspace/dashboard/costs?days=${effectiveDays}`,
      ),
  })

  const { data: budgetRes, isLoading: budgetLoading } = useQuery({
    queryKey: ['costs-budget'],
    queryFn: () => api.get<{ data: DashboardBudget }>('/workspace/dashboard/budget'),
  })

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
    <div className="h-full overflow-y-auto bg-slate-900" data-testid="costs-page">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="대시보드로 돌아가기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-semibold text-slate-50">비용 분석</h2>
            <p className="text-xs text-slate-500 mt-0.5">AI 운영 비용을 상세하게 분석합니다</p>
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
          <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="costs-empty">
            <svg className="w-10 h-10 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-base font-medium text-slate-300 mb-2">데이터가 없습니다</h3>
            <p className="text-sm text-slate-500">선택한 기간에 해당하는 비용 데이터가 없습니다</p>
          </div>
        ) : (
          <>
            {/* Budget Warning Banner */}
            {budget && <BudgetWarningBanner budget={budget} />}

            {/* Cost Overview */}
            <CostOverviewSection costData={costData} budget={budget} />

            {/* Two-column: Agents + Daily Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopAgentsSection
                agents={agentsByUsd.length > 0 ? agentsByUsd : costData.byAgent}
              />
              <DailyCostChart startDate={startDate} endDate={endDate} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
