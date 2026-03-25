/**
 * Cost Analysis Page — Natural Organic Theme
 *
 * API Endpoints:
 *   GET /api/workspace/dashboard/costs?days=
 *   GET /api/workspace/dashboard/costs/daily?startDate=&endDate=
 *   GET /api/workspace/dashboard/costs/by-agent?startDate=&endDate=
 *   GET /api/workspace/dashboard/budget
 *
 * Stitch HTML: costs/code.html (converted from Stitch Default orange to Natural Organic olive/beige)
 * Existing React: packages/app/src/pages/costs.tsx
 */

import { useState, useMemo, useEffect } from 'react'
import { toast } from '@corthex/ui'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { DashboardBudget } from '@corthex/shared'
import { Brain, LayoutDashboard, CreditCard, Bot, FileText, Settings, Search, Bell, Wallet, SlidersHorizontal, Cloud, Download, ChevronLeft, ChevronRight, Zap, Code, Languages, Paintbrush, Calendar } from 'lucide-react'

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

// Sovereign Sage Design Tokens
const accentColor = '#606C38'
const accentHover = '#4e5a2b'

// === Helpers ===

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

// === Main Page ===

export function CostsPage() {
  const navigate = useNavigate()
  const [days, setDays] = useState(30)
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('30d')

  const { start: startDate, end: endDate } = useMemo(() => getDatesForDays(days), [days])

  const { data: costRes, isLoading: costLoading } = useQuery({
    queryKey: ['costs-overview', days],
    queryFn: () => api.get<{ data: CostOverview }>(`/workspace/dashboard/costs?days=${days}`),
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

  const { data: dailyRes, isLoading: dailyLoading } = useQuery({
    queryKey: ['costs-daily-ceo', startDate, endDate],
    queryFn: () =>
      api.get<{ success: boolean; data: { items: CostDaily[] } }>(
        `/workspace/dashboard/costs/daily?startDate=${startDate}&endDate=${endDate}`,
      ),
  })

  const costData = costRes?.data
  const budget = budgetRes?.data
  const agentItems = agentRes?.data?.items ?? []
  const dailyItems = dailyRes?.data?.items ?? []

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
  const topModel = costData?.byModel?.length
    ? [...costData.byModel].sort((a, b) => b.costUsd - a.costUsd)[0]
    : null
  const dailyAvg = costData ? costData.totalCostUsd / Math.max(costData.days, 1) : 0
  const activeAgentCount = costData?.byAgent?.length ?? 0
  const agentCostData = agentsByUsd.length > 0
    ? agentsByUsd.sort((a, b) => b.costUsd - a.costUsd)
    : (costData?.byAgent ?? []).sort((a, b) => b.costUsd - a.costUsd)

  useEffect(() => {
    document.title = '비용 분석 - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  return (
    <div className="min-h-screen overflow-y-auto bg-corthex-bg text-corthex-text-primary">
        <div className="p-8 max-w-[1440px] mx-auto w-full space-y-12" data-testid="costs-page">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-corthex-text-primary">비용 분석 <span className="text-corthex-text-secondary font-light">Cost Analytics</span></h1>
              <p className="text-corthex-text-secondary text-lg">AI 에이전트 운영 비용을 추적하고 최적화합니다</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-3 px-5 py-2.5 bg-corthex-elevated rounded-lg border border-corthex-border hover:bg-corthex-border transition-colors">
                <Calendar className="w-5 h-5 text-corthex-text-secondary" />
                <span className="font-medium">{new Date().getFullYear()}년 {new Date().getMonth() + 1}월</span>
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-corthex-border rounded-lg hover:shadow-sm transition-all text-corthex-text-primary font-medium">
                <Download className="w-5 h-5" />
                내보내기 Export CSV
              </button>
            </div>
          </header>

          {isLoading && !costData ? (
            <div className="space-y-6" data-testid="costs-loading">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-corthex-elevated border border-corthex-border rounded-xl p-6 animate-pulse">
                    <div className="h-4 w-20 bg-corthex-border rounded mb-4" />
                    <div className="h-8 w-24 bg-corthex-border rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : !costData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="costs-empty">
              <h3 className="text-base font-medium text-corthex-text-secondary mb-2">데이터가 없습니다</h3>
              <p className="text-sm text-corthex-text-secondary">선택한 기간에 해당하는 비용 데이터가 없습니다</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="cost-summary">
                <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold tracking-widest text-corthex-text-secondary uppercase">이번 달 비용 This Month</p>
                    <Wallet className="w-5 h-5 text-corthex-text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-3xl font-bold">${costData.totalCostUsd.toFixed(2)}</p>
                    <p className="text-xs text-corthex-text-secondary">Updated {costData.days}d ago</p>
                  </div>
                </div>
                <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold tracking-widest text-corthex-text-secondary uppercase">Top Model</p>
                    <SlidersHorizontal className="w-5 h-5 text-corthex-text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-3xl font-bold">${topModel?.costUsd.toFixed(2) ?? '0.00'}</p>
                    <p className="text-xs text-corthex-text-secondary">{topModel?.model ?? 'Anthropic (Claude)'}</p>
                  </div>
                </div>
                <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold tracking-widest text-corthex-text-secondary uppercase">일 평균 Daily Avg</p>
                    <Brain className="w-5 h-5 text-corthex-text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-3xl font-bold">${dailyAvg.toFixed(2)}</p>
                    <p className="text-xs text-corthex-text-secondary">Current period projection</p>
                  </div>
                </div>
                <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold tracking-widest text-corthex-text-secondary uppercase">예산 대비 Budget</p>
                    <CreditCard className="w-5 h-5 text-corthex-text-secondary" />
                  </div>
                  <div className="space-y-3">
                    <p className="font-mono text-3xl font-bold">{budget ? `${((costData.totalCostUsd / (budget.monthlyBudgetUsd || 1)) * 100).toFixed(1)}%` : `${activeAgentCount}`}</p>
                    {budget && (
                      <>
                        <div className="w-full h-2 bg-corthex-border rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-corthex-accent to-corthex-accent-deep rounded-full" style={{ width: `${Math.min((costData.totalCostUsd / (budget.monthlyBudgetUsd || 1)) * 100, 100)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-corthex-text-secondary">
                          <span>${costData.totalCostUsd.toFixed(0)}</span>
                          <span>${budget.monthlyBudgetUsd.toFixed(0)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend Chart */}
                <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-8 flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-corthex-text-primary">일별 비용 추이 Daily Cost Trend</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setDays(7); setChartRange('7d') }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                          chartRange === '7d' ? 'border-corthex-accent/30 text-corthex-accent bg-corthex-accent/10' : 'border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated'
                        }`}
                      >
                        7 Days
                      </button>
                      <button
                        onClick={() => { setDays(30); setChartRange('30d') }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                          chartRange === '30d' ? 'border-corthex-accent/30 text-corthex-accent bg-corthex-accent/10' : 'border-corthex-border text-corthex-text-secondary hover:bg-corthex-elevated'
                        }`}
                      >
                        30 Days
                      </button>
                    </div>
                  </div>
                  <div className="relative h-64 flex items-end justify-between pt-8 border-b border-corthex-border pb-2">
                    {dailyLoading ? (
                      <div className="h-full w-full bg-corthex-border rounded animate-pulse" />
                    ) : dailyItems.length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center text-sm text-corthex-text-secondary">데이터가 없습니다</div>
                    ) : (
                      dailyItems.map((d, i) => {
                        const maxCost = Math.max(...dailyItems.map(dd => dd.costMicro), 1)
                        const heightPct = (d.costMicro / maxCost) * 100
                        const isLast = i === dailyItems.length - 1
                        return (
                          <div key={d.date} className="flex flex-col items-center gap-2 group" style={{ width: `${Math.max(100 / dailyItems.length - 1, 2)}%` }}>
                            <div
                              className={`w-full ${isLast ? 'bg-corthex-accent' : 'bg-corthex-accent/40 hover:bg-corthex-accent'} transition-colors rounded-t-sm`}
                              style={{ height: `${Math.max(heightPct, 2)}%` }}
                            />
                          </div>
                        )
                      })
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-corthex-text-secondary">
                    {dailyItems.length >= 5 ? (
                      <>
                        <span>{dailyItems[0]?.date}</span>
                        <span>{dailyItems[Math.floor(dailyItems.length * 0.5)]?.date}</span>
                        <span>{dailyItems[dailyItems.length - 1]?.date}</span>
                      </>
                    ) : dailyItems.map(d => (
                      <span key={d.date}>{d.date}</span>
                    ))}
                  </div>
                </div>

                {/* Agent Cost Breakdown */}
                <div className="bg-corthex-elevated border border-corthex-border rounded-xl p-8 flex flex-col gap-6">
                  <h3 className="text-lg font-semibold text-corthex-text-primary">에이전트별 비용 Agent Cost Breakdown</h3>
                  <div className="space-y-5">
                    {agentCostData.slice(0, 5).map((a) => (
                      <div key={a.agentId || a.agentName} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{a.agentName}</span>
                          <span className="font-mono text-corthex-text-secondary">${a.costUsd.toFixed(2)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-corthex-border rounded-full overflow-hidden">
                          <div className="h-full bg-corthex-accent" style={{ width: `${costData.totalCostUsd > 0 ? Math.min((a.costUsd / costData.totalCostUsd) * 100, 100) : 0}%` }} />
                        </div>
                      </div>
                    ))}
                    {agentCostData.length > 5 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-corthex-text-secondary">기타 Others</span>
                          <span className="font-mono text-corthex-text-secondary">${agentCostData.slice(5).reduce((sum, a) => sum + a.costUsd, 0).toFixed(2)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-corthex-border rounded-full overflow-hidden">
                          <div className="h-full bg-corthex-text-secondary" style={{ width: `${costData.totalCostUsd > 0 ? Math.min((agentCostData.slice(5).reduce((sum, a) => sum + a.costUsd, 0) / costData.totalCostUsd) * 100, 100) : 0}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Cost Table */}
              <div className="bg-corthex-elevated border border-corthex-border rounded-xl overflow-hidden">
                <div className="px-8 py-6 flex justify-between items-center border-b border-corthex-border">
                  <h3 className="text-lg font-semibold text-corthex-text-primary">상세 비용 Detailed Cost Records</h3>
                  <button className="text-sm font-semibold flex items-center gap-1 text-corthex-accent hover:underline">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-corthex-elevated text-corthex-text-secondary text-xs uppercase tracking-wider">
                        <th className="px-8 py-4 font-bold">Agent Name</th>
                        <th className="px-8 py-4 font-bold">Model</th>
                        <th className="px-8 py-4 font-bold text-center">Tokens</th>
                        <th className="px-8 py-4 font-bold text-right">Cost (USD)</th>
                        <th className="px-8 py-4 font-bold text-center">Runs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-corthex-border/50">
                      {agentCostData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-corthex-text-secondary">데이터 없음</td>
                        </tr>
                      ) : (
                        agentCostData.slice(0, 10).map((a, i) => {
                          const iconComps = [Zap, Code, Languages, Paintbrush, Cloud]
                          const IconComp = iconComps[i % iconComps.length]
                          return (
                            <tr key={a.agentId || a.agentName} className="hover:bg-corthex-elevated transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-corthex-accent/10 flex items-center justify-center">
                                    <IconComp className="w-4 h-4 text-corthex-accent" />
                                  </div>
                                  <span className="font-medium text-corthex-text-primary">{a.agentName}</span>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <span className="px-2 py-1 rounded bg-corthex-elevated text-[10px] font-bold text-corthex-text-secondary">
                                  {costData.byModel[i % costData.byModel.length]?.model ?? 'CLAUDE'}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-center font-mono text-xs">
                                {formatNumber(a.count * 100)}
                              </td>
                              <td className="px-8 py-4 text-right font-mono font-bold text-corthex-text-primary">
                                ${a.costUsd.toFixed(2)}
                              </td>
                              <td className="px-8 py-4 text-center font-mono text-xs text-corthex-text-secondary">
                                {formatNumber(a.count)}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-8 py-6 border-t border-corthex-border flex items-center justify-between">
                  <p className="text-xs text-corthex-text-secondary">Showing {Math.min(agentCostData.length, 10)} of {agentCostData.length} agents</p>
                  <div className="flex gap-2">
                    <button className="p-2 border border-corthex-border rounded-lg hover:bg-corthex-elevated transition-colors">
                      <ChevronLeft className="w-4 h-4 text-corthex-text-secondary" />
                    </button>
                    <button className="p-2 border border-corthex-border rounded-lg hover:bg-corthex-elevated transition-colors">
                      <ChevronRight className="w-4 h-4 text-corthex-text-secondary" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  )
}
