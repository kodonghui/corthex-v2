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
import { Brain, LayoutDashboard, CreditCard, Bot, FileText, Settings, Search, Bell, Wallet, SlidersHorizontal, Cloud, Download, ChevronLeft, ChevronRight, Zap, Code, Languages, Paintbrush } from 'lucide-react'

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

const oliveGreen = '#5a7247'
const organicBeige = '#faf8f5'
const terracotta = '#c4622d'
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
    <div className="min-h-screen overflow-y-auto" style={{ fontFamily: "'Public Sans', sans-serif", backgroundColor: organicBeige, color: '#0f172a' }}>
        {/* Content */}
        <div className="p-8 max-w-7xl mx-auto w-full" data-testid="costs-page">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Noto Serif KR', serif" }}>비용 분석</h1>
              <p className="text-slate-500">실시간 API 사용량 및 비용 트렌드를 확인하세요.</p>
            </div>
            <button
              onClick={() => toast.info('이 기능은 준비 중입니다')}
              className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: oliveGreen, boxShadow: `0 4px 14px -2px ${oliveGreen}33` }}
            >
              <Wallet className="w-5 h-5" />
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
                      <CreditCard className="w-5 h-5" />
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
                      <SlidersHorizontal className="w-5 h-5" />
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
                      <Brain className="w-5 h-5" />
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
                      <Cloud className="w-5 h-5" />
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
                    <Download className="w-4 h-4" />
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
                          const iconComps = [Zap, Code, Languages, Paintbrush, Cloud]
                          const IconComp = iconComps[i % iconComps.length]
                          return (
                            <tr key={a.agentId || a.agentName} className="hover:bg-slate-50 transition-colors">
                              <td className="px-8 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                                    <IconComp className="w-4 h-4" style={{ color: iconColor }} />
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
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                      <ChevronRight className="w-4 h-4" />
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
