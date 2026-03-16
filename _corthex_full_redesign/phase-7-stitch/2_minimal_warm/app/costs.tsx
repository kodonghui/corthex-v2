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

const oliveGreen = '#e57373'
const organicBeige = '#fcfbf9'
const terracotta = '#e07a5f'
const mustardTan = '#d4a373'

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
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif", backgroundColor: organicBeige, color: '#0f172a' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: oliveGreen }}>
            <span className="material-symbols-outlined text-2xl" style={{ fontFamily: "'Material Symbols Outlined'" }}>neurology</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">CORTHEX <span style={{ color: oliveGreen }}>v2</span></h2>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors" href="#">
            <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>dashboard</span>
            <span className="font-medium">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors" href="#" style={{ backgroundColor: `${oliveGreen}1a`, color: oliveGreen }}>
            <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>payments</span>
            <span className="font-medium">Cost Analysis</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors" href="#">
            <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>smart_toy</span>
            <span className="font-medium">Agents</span>
          </a>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors" href="#">
            <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>description</span>
            <span className="font-medium">Logs</span>
          </a>
          <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">System</div>
          <a className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors" href="#">
            <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>settings</span>
            <span className="font-medium">Settings</span>
          </a>
        </nav>
        {budget && (
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-xs text-slate-500 mb-2">Monthly Budget</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2">
                <div className="h-1.5 rounded-full" style={{ width: `${Math.min(budget.usagePercent, 100)}%`, backgroundColor: oliveGreen }} />
              </div>
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>${costData?.totalCostUsd.toFixed(0) ?? '0'}</span>
                <span>${budget.limitUsd?.toFixed(0) ?? '2,000'}</span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-100">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl" style={{ fontFamily: "'Material Symbols Outlined'" }}>search</span>
              <input
                className="w-full bg-slate-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-slate-400"
                placeholder="Search usage logs..."
                type="text"
                style={{ outline: 'none' }}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors relative">
              <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full border-2 border-white" style={{ backgroundColor: oliveGreen }} />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">Workspace v2</p>
                <p className="text-xs text-slate-500">Admin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">U</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto w-full" data-testid="costs-page">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Inter', 'Noto Sans KR', sans-serif" }}>비용 분석</h1>
              <p className="text-slate-500">실시간 API 사용량 및 비용 트렌드를 확인하세요.</p>
            </div>
            <button
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: oliveGreen, boxShadow: `0 4px 14px -2px ${oliveGreen}33` }}
            >
              <span className="material-symbols-outlined text-xl" style={{ fontFamily: "'Material Symbols Outlined'" }}>account_balance_wallet</span>
              <span>Set Monthly Budget</span>
            </button>
          </div>

          {isLoading && !costData ? (
            <div className="space-y-6" data-testid="costs-loading">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-50 animate-pulse" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    <div className="h-4 w-20 bg-slate-100 rounded mb-4" />
                    <div className="h-8 w-24 bg-slate-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : !costData ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="costs-empty">
              <h3 className="text-base font-medium text-slate-500 mb-2">데이터가 없습니다</h3>
              <p className="text-sm text-slate-400">선택한 기간에 해당하는 비용 데이터가 없습니다</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="cost-summary">
                {/* Total Monthly Cost */}
                <div className="bg-white p-6 rounded-2xl border border-slate-50" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${oliveGreen}1a`, color: oliveGreen }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>payments</span>
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Total Monthly Cost</p>
                  <h3 className="text-3xl font-bold text-slate-900">${costData.totalCostUsd.toFixed(2)}</h3>
                </div>
                {/* Top Model */}
                <div className="bg-white p-6 rounded-2xl border border-slate-50" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${mustardTan}1a`, color: mustardTan }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>temp_preferences_custom</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">-2.4%</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">{topModel?.model ?? 'Anthropic (Claude)'}</p>
                  <h3 className="text-3xl font-bold text-slate-900">${topModel?.costUsd.toFixed(2) ?? '0.00'}</h3>
                </div>
                {/* Daily Average */}
                <div className="bg-white p-6 rounded-2xl border border-slate-50" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#3b82f61a', color: '#3b82f6' }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>psychology</span>
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+18.2%</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Daily Average</p>
                  <h3 className="text-3xl font-bold text-slate-900">${dailyAvg.toFixed(2)}</h3>
                </div>
                {/* Active Agents */}
                <div className="bg-white p-6 rounded-2xl border border-slate-50" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: '#ef44441a', color: '#ef4444' }}>
                      <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'" }}>cloud</span>
                    </div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">+5.1%</span>
                  </div>
                  <p className="text-sm text-slate-500 mb-1 font-medium">Active Agents</p>
                  <h3 className="text-3xl font-bold text-slate-900">{activeAgentCount}</h3>
                </div>
              </div>

              {/* Chart Section */}
              <div className="bg-white p-8 rounded-2xl border border-slate-50 mb-8" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Cost Trends</h3>
                    <p className="text-sm text-slate-500">Daily spending over the last {days} days</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setDays(7); setChartRange('7d') }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        chartRange === '7d'
                          ? 'border-transparent text-white'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                      style={chartRange === '7d' ? { backgroundColor: `${oliveGreen}1a`, color: oliveGreen, borderColor: `${oliveGreen}33` } : {}}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => { setDays(30); setChartRange('30d') }}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors ${
                        chartRange === '30d'
                          ? 'border-transparent text-white'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                      style={chartRange === '30d' ? { backgroundColor: `${oliveGreen}1a`, color: oliveGreen, borderColor: `${oliveGreen}33` } : {}}
                    >
                      30 Days
                    </button>
                  </div>
                </div>
                {/* Visual chart placeholder */}
                <div className="w-full h-64 relative">
                  {dailyLoading ? (
                    <div className="h-full w-full bg-slate-50 rounded animate-pulse" />
                  ) : dailyItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-slate-400">데이터가 없습니다</div>
                  ) : (
                    <div className="absolute inset-0 flex items-end justify-between px-2">
                      {dailyItems.map((d, i) => {
                        const maxCost = Math.max(...dailyItems.map(dd => dd.costMicro), 1)
                        const heightPct = (d.costMicro / maxCost) * 100
                        const isEven = i % 2 === 0
                        return (
                          <div
                            key={d.date}
                            className="rounded-t-lg"
                            style={{
                              width: `${Math.max(100 / dailyItems.length - 1, 2)}%`,
                              height: `${Math.max(heightPct, 2)}%`,
                              backgroundColor: isEven ? `${mustardTan}${Math.min(30 + i * 5, 90).toString(16)}` : `${oliveGreen}${Math.min(30 + i * 5, 90).toString(16)}`,
                            }}
                          />
                        )
                      })}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100" />
                </div>
                <div className="flex justify-between mt-4 text-xs font-medium text-slate-400">
                  {dailyItems.length >= 5 ? (
                    <>
                      <span>{dailyItems[0]?.date}</span>
                      <span>{dailyItems[Math.floor(dailyItems.length * 0.25)]?.date}</span>
                      <span>{dailyItems[Math.floor(dailyItems.length * 0.5)]?.date}</span>
                      <span>{dailyItems[Math.floor(dailyItems.length * 0.75)]?.date}</span>
                      <span>{dailyItems[dailyItems.length - 1]?.date}</span>
                    </>
                  ) : dailyItems.map(d => (
                    <span key={d.date}>{d.date}</span>
                  ))}
                </div>
              </div>

              {/* Table Section */}
              <div className="bg-white rounded-2xl border border-slate-50 overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-900">Detailed Cost Records</h3>
                  <button className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{ color: oliveGreen }}>
                    <span className="material-symbols-outlined text-sm" style={{ fontFamily: "'Material Symbols Outlined'" }}>download</span>
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-8 py-4 font-bold">Agent Name</th>
                        <th className="px-8 py-4 font-bold">Model</th>
                        <th className="px-8 py-4 font-bold text-center">Tokens</th>
                        <th className="px-8 py-4 font-bold text-right">Cost (USD)</th>
                        <th className="px-8 py-4 font-bold text-center">Runs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {agentCostData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-slate-400">데이터 없음</td>
                        </tr>
                      ) : (
                        agentCostData.slice(0, 10).map((a, i) => {
                          const iconColors = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ef4444']
                          const bgColors = ['#fff7ed', '#eff6ff', '#f0fdf4', '#faf5ff', '#fef2f2']
                          const iconColor = iconColors[i % iconColors.length]
                          const bgColor = bgColors[i % bgColors.length]
                          const icons = ['bolt', 'code', 'translate', 'draw', 'cloud']
                          const icon = icons[i % icons.length]
                          return (
                            <tr key={a.agentId || a.agentName} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                                    <span className="material-symbols-outlined text-sm" style={{ fontFamily: "'Material Symbols Outlined'", color: iconColor }}>{icon}</span>
                                  </div>
                                  <span className="font-medium text-slate-900">{a.agentName}</span>
                                </div>
                              </td>
                              <td className="px-8 py-4">
                                <span className="px-2 py-1 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                                  {costData.byModel[i % costData.byModel.length]?.model ?? 'CLAUDE'}
                                </span>
                              </td>
                              <td className="px-8 py-4 text-center font-mono text-xs">
                                {formatNumber(a.count * 100)}
                              </td>
                              <td className="px-8 py-4 text-right font-bold text-slate-900">
                                ${a.costUsd.toFixed(2)}
                              </td>
                              <td className="px-8 py-4 text-center text-xs text-slate-500">
                                {formatNumber(a.count)}
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between">
                  <p className="text-xs text-slate-500">Showing {Math.min(agentCostData.length, 10)} of {agentCostData.length} agents</p>
                  <div className="flex gap-2">
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="material-symbols-outlined text-sm" style={{ fontFamily: "'Material Symbols Outlined'" }}>chevron_left</span>
                    </button>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="material-symbols-outlined text-sm" style={{ fontFamily: "'Material Symbols Outlined'" }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
