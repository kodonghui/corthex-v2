import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
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

const AGENT_DOT_COLORS = [
  'bg-cyan-400',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
]

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

// === Period Tabs ===

type PeriodType = 'today' | '7d' | '30d' | 'lastMonth' | 'custom'

const PERIOD_LABELS: Record<PeriodType, string> = {
  today: 'Today',
  '7d': 'Last 7 Days',
  '30d': 'This Month',
  lastMonth: 'Last Month',
  custom: '직접 설정',
}

function PeriodTabs({
  period,
  onPeriodChange,
}: {
  period: PeriodType
  onPeriodChange: (p: PeriodType) => void
}) {
  return (
    <div className="pb-3 px-4">
      <div className="flex border-b border-slate-800 gap-8">
        {(['today', '7d', '30d', 'lastMonth'] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
              period === p
                ? 'border-b-cyan-400 text-slate-100'
                : 'border-b-transparent text-slate-400 hover:text-slate-100'
            }`}
            aria-pressed={period === p}
            data-testid={`period-${p}`}
          >
            <span className="text-sm font-bold leading-normal tracking-[0.015em]">
              {PERIOD_LABELS[p]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// === Budget Warning Banner ===

function BudgetWarningBanner({ budget }: { budget: DashboardBudget }) {
  if (budget.usagePercent < 80) return null

  const isExceeded = budget.usagePercent >= 100
  return (
    <div
      className={`px-4 py-3 rounded-lg text-sm font-medium ${
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

// === Daily Cost Chart (SVG area chart) ===

function DailyCostChart({
  startDate,
  endDate,
  chartRange,
  onChartRangeChange,
}: {
  startDate: string
  endDate: string
  chartRange: '1W' | '1M' | '3M'
  onChartRangeChange: (r: '1W' | '1M' | '3M') => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['costs-daily-ceo', startDate, endDate],
    queryFn: () =>
      api.get<{ success: boolean; data: { items: CostDaily[] } }>(
        `/workspace/dashboard/costs/daily?startDate=${startDate}&endDate=${endDate}`,
      ),
  })

  const items = data?.data?.items ?? []
  const totalCost = items.reduce((sum, d) => sum + d.costMicro, 0)
  const totalCostUsd = totalCost / 1_000_000

  return (
    <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-slate-100 text-base font-semibold leading-normal">비용 추이 차트 (Cost Trend Chart)</h3>
          <div className="flex items-baseline gap-3 mt-1">
            <p className="text-slate-100 font-mono text-[32px] font-bold leading-tight tabular-nums">
              ${totalCostUsd.toFixed(2)}
            </p>
            <div className="flex gap-1 items-center">
              <span className="text-slate-400 text-sm">This Month</span>
              <span className="text-emerald-400 text-sm font-medium ml-2">+5.2%</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(['1W', '1M', '3M'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onChartRangeChange(r)}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                chartRange === r
                  ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="flex min-h-[220px] flex-1 flex-col gap-4 py-6 w-full relative mt-4">
        {isLoading ? (
          <div className="h-full w-full bg-slate-800/50 rounded animate-pulse" />
        ) : items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">
            데이터가 없습니다
          </div>
        ) : (
          <>
            <svg className="absolute inset-0 h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chart-gradient-costs" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const maxCost = Math.max(...items.map((d) => d.costMicro), 1)
                const points = items.map((d, i) => {
                  const x = items.length > 1 ? (i / (items.length - 1)) * 100 : 50
                  const y = 100 - (d.costMicro / maxCost) * 80 - 10
                  return `${x},${y}`
                })
                const pathD = `M${points.join(' L')}`
                const areaD = `${pathD} L100,100 L0,100 Z`
                return (
                  <>
                    <path d={areaD} fill="url(#chart-gradient-costs)" opacity="0.2" />
                    <path d={pathD} stroke="#22d3ee" fill="none" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  </>
                )
              })()}
            </svg>
            <div className="flex justify-between w-full absolute bottom-0 px-2">
              {items.length >= 5 ? (
                <>
                  <span className="text-slate-500 text-xs font-mono">{items[0]?.date.slice(8)}</span>
                  <span className="text-slate-500 text-xs font-mono">{items[Math.floor(items.length * 0.25)]?.date.slice(8)}</span>
                  <span className="text-slate-500 text-xs font-mono">{items[Math.floor(items.length * 0.5)]?.date.slice(8)}</span>
                  <span className="text-slate-500 text-xs font-mono">{items[Math.floor(items.length * 0.75)]?.date.slice(8)}</span>
                  <span className="text-slate-500 text-xs font-mono">{items[items.length - 1]?.date.slice(8)}</span>
                </>
              ) : (
                items.map((d) => (
                  <span key={d.date} className="text-slate-500 text-xs font-mono">{d.date.slice(8)}</span>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// === Loading Skeleton ===

function CostsSkeleton() {
  return (
    <div className="space-y-6 p-4" data-testid="costs-loading">
      <div className="flex flex-wrap gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-slate-800 bg-slate-900/50">
            <div className="h-3 w-20 bg-slate-800 rounded animate-pulse" />
            <div className="h-8 w-24 bg-slate-800 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
    </div>
  )
}

// === Main Page ===

export function CostsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<PeriodType>('30d')
  const [chartRange, setChartRange] = useState<'1W' | '1M' | '3M'>('1M')

  const days = period === 'today' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : period === 'lastMonth' ? 30 : 30

  const { start: startDate, end: endDate } = useMemo(() => {
    return getDatesForDays(days)
  }, [days])

  const { data: costRes, isLoading: costLoading } = useQuery({
    queryKey: ['costs-overview', days],
    queryFn: () =>
      api.get<{ data: CostOverview }>(
        `/workspace/dashboard/costs?days=${days}`,
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

  // Find the most expensive model
  const topModel = costData?.byModel?.length
    ? [...costData.byModel].sort((a, b) => b.costUsd - a.costUsd)[0]
    : null

  // Daily average
  const dailyAvg = costData ? costData.totalCostUsd / Math.max(costData.days, 1) : 0

  // Active agents count
  const activeAgentCount = costData?.byAgent?.length ?? 0

  // Agent cost data for table
  const agentCostData = agentsByUsd.length > 0
    ? agentsByUsd.sort((a, b) => b.costUsd - a.costUsd)
    : (costData?.byAgent ?? []).sort((a, b) => b.costUsd - a.costUsd)

  useEffect(() => {
    document.title = '비용 분석 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div className="h-full overflow-y-auto" data-testid="costs-page">
      <div className="max-w-[960px] mx-auto flex-1 px-4 py-5">
        {/* Page Title */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <h1 className="text-slate-100 tracking-tight text-[32px] font-bold leading-tight">
              비용 분석 (Cost Analytics)
            </h1>
            <p className="text-slate-400 text-sm font-normal leading-normal">
              Detailed monitoring of resource expenditure and token usage.
            </p>
          </div>
        </div>

        {/* Period Tabs */}
        <PeriodTabs period={period} onPeriodChange={setPeriod} />

        {isLoading && !costData ? (
          <CostsSkeleton />
        ) : !costData ? (
          <div className="flex flex-col items-center justify-center py-16 text-center p-4" data-testid="costs-empty">
            <h3 className="text-base font-medium text-slate-300 mb-2">데이터가 없습니다</h3>
            <p className="text-sm text-slate-500">선택한 기간에 해당하는 비용 데이터가 없습니다</p>
          </div>
        ) : (
          <>
            {/* Budget Warning Banner */}
            {budget && (
              <div className="px-4">
                <BudgetWarningBanner budget={budget} />
              </div>
            )}

            {/* Summary Cards */}
            <div className="flex flex-wrap gap-4 p-4" data-testid="cost-summary">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-slate-800 bg-slate-900/50">
                <p className="text-slate-400 text-sm font-medium leading-normal">Total Monthly Cost</p>
                <p className="text-slate-100 font-mono text-2xl font-bold leading-tight tabular-nums">
                  ${costData.totalCostUsd.toFixed(2)}
                </p>
                <p className="text-emerald-400 text-sm font-medium leading-normal flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.2%
                </p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-slate-800 bg-slate-900/50">
                <p className="text-slate-400 text-sm font-medium leading-normal">Daily Average</p>
                <p className="text-slate-100 font-mono text-2xl font-bold leading-tight tabular-nums">
                  ${dailyAvg.toFixed(2)}
                </p>
                <p className="text-rose-400 text-sm font-medium leading-normal flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> -1.2%
                </p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-slate-800 bg-slate-900/50">
                <p className="text-slate-400 text-sm font-medium leading-normal">Most Expensive Model</p>
                <p className="text-slate-100 font-mono text-xl font-bold leading-tight truncate tabular-nums">
                  {topModel?.model ?? '-'}
                </p>
                <p className="text-slate-500 text-sm font-medium leading-normal">
                  {topModel ? `$${topModel.costUsd.toFixed(2)}` : '-'}
                </p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-slate-800 bg-slate-900/50">
                <p className="text-slate-400 text-sm font-medium leading-normal">Active Agent Count</p>
                <p className="text-slate-100 font-mono text-2xl font-bold leading-tight tabular-nums">
                  {activeAgentCount}
                </p>
                <p className="text-emerald-400 text-sm font-medium leading-normal flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +2
                </p>
              </div>
            </div>

            {/* Cost Trend Chart */}
            <div className="flex flex-wrap gap-4 px-4 py-4">
              <DailyCostChart
                startDate={startDate}
                endDate={endDate}
                chartRange={chartRange}
                onChartRangeChange={setChartRange}
              />
            </div>

            {/* Two tables side by side */}
            <div className="flex flex-wrap gap-4 px-4 py-4 pb-12">
              {/* Cost by Model */}
              <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                <h3 className="text-slate-100 text-base font-semibold px-1">모델별 비용 (Cost by Model)</h3>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Model</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Tokens</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {costData.byModel.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-sm text-slate-500">데이터 없음</td>
                        </tr>
                      ) : (
                        costData.byModel.map((m) => (
                          <tr key={m.model}>
                            <td className="py-3 px-4 text-sm text-slate-100 font-medium">{m.model}</td>
                            <td className="py-3 px-4 text-sm text-slate-400 font-mono text-right tabular-nums">
                              {formatNumber(m.inputTokens + m.outputTokens)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-100 font-mono text-right tabular-nums">
                              ${m.costUsd.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost by Agent */}
              <div className="flex-1 min-w-[300px] flex flex-col gap-4">
                <h3 className="text-slate-100 text-base font-semibold px-1">에이전트별 비용 (Cost by Agent)</h3>
                <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50">
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Agent</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Runs</th>
                        <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {agentCostData.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-sm text-slate-500">데이터 없음</td>
                        </tr>
                      ) : (
                        agentCostData.slice(0, 10).map((a, i) => (
                          <tr key={a.agentId || a.agentName}>
                            <td className="py-3 px-4 text-sm text-slate-100 font-medium flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${AGENT_DOT_COLORS[i % AGENT_DOT_COLORS.length]}`} />
                              {a.agentName}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-400 font-mono text-right tabular-nums">
                              {formatNumber(a.count)}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-100 font-mono text-right tabular-nums">
                              ${a.costUsd.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
