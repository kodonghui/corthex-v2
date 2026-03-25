// API: GET /api/workspace/agents, GET /api/workspace/jobs/notifications, GET /api/workspace/notifications
// API: GET /workspace/dashboard/summary, GET /workspace/dashboard/usage, GET /workspace/dashboard/budget
// API: GET /workspace/dashboard/quick-actions, GET /workspace/dashboard/satisfaction
// API: POST /workspace/presets/:presetId/execute

import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useDashboardWs } from '../hooks/use-dashboard-ws'
import { useWsStore } from '../stores/ws-store'
import {
  Bot, Zap, CheckCircle, DollarSign, Timer, Database,
  TrendingUp, TrendingDown, Plus, XCircle, ArrowRight,
  MessageSquare, Workflow, BarChart3, Calendar,
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

// === Usage Chart helpers ===

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

// === KPI Card ===

function KpiCard({
  label,
  value,
  icon,
  trend,
  trendLabel,
}: {
  label: string
  value: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] border border-corthex-border/10 group hover:bg-corthex-bg transition-colors">
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] uppercase tracking-widest font-bold text-corthex-text-secondary">{label}</span>
        <span className="text-corthex-accent">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-mono font-bold text-corthex-text-primary">{value}</span>
        {trendLabel && (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${
            trend === 'up' ? 'text-corthex-accent' : trend === 'down' ? 'text-red-600' : 'text-corthex-text-secondary'
          }`}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trendLabel}
          </span>
        )}
      </div>
    </div>
  )
}

// === Cost Trend Chart (SVG Area) ===

function CostTrendChart({ usage, budget }: { usage: DashboardUsage | undefined; budget: DashboardBudget | undefined }) {
  const days = useMemo(() => usage ? groupUsageByDate(usage.usage) : [], [usage])
  const maxTotal = useMemo(() => Math.max(...days.map(d => d.total), 1), [days])
  const totalSpend = budget?.currentMonthSpendUsd ?? 0

  // Build SVG path from data
  const chartWidth = 800
  const chartHeight = 200
  const points = days.map((d, i) => ({
    x: days.length > 1 ? (i / (days.length - 1)) * chartWidth : chartWidth / 2,
    y: chartHeight - (d.total / maxTotal) * (chartHeight - 20) - 10,
  }))

  const linePath = points.length > 0
    ? `M${points.map(p => `${p.x},${p.y}`).join(' L')}`
    : 'M0,180 L800,180'
  const areaPath = points.length > 0
    ? `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`
    : 'M0,180 L800,180 L800,200 L0,200 Z'

  const dateLabels = days.length > 0
    ? [days[0]?.date, days[Math.floor(days.length / 4)]?.date, days[Math.floor(days.length / 2)]?.date, days[Math.floor(3 * days.length / 4)]?.date, days[days.length - 1]?.date].filter(Boolean)
    : []

  return (
    <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-corthex-accent-deep">Cost Trend</h3>
          <p className="text-sm text-corthex-text-secondary">Daily token consumption across all active agents</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-corthex-accent">${totalSpend.toFixed(2)}</p>
          <p className="text-[10px] uppercase font-bold text-corthex-text-secondary">MTD Total</p>
        </div>
      </div>
      <div className="relative h-64 w-full mt-auto">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="cost-gradient" x1="0%" x2="0%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#606C38" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#606C38" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Reference lines */}
          <line x1="0" x2={chartWidth} y1="50" y2="50" stroke="#e5e1d3" strokeDasharray="4" strokeWidth="1" opacity="0.4" />
          <line x1="0" x2={chartWidth} y1="100" y2="100" stroke="#e5e1d3" strokeDasharray="4" strokeWidth="1" opacity="0.4" />
          <line x1="0" x2={chartWidth} y1="150" y2="150" stroke="#e5e1d3" strokeDasharray="4" strokeWidth="1" opacity="0.4" />
          {/* Area fill */}
          <path d={areaPath} fill="url(#cost-gradient)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="#606C38" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {dateLabels.length > 0 && (
          <div className="absolute bottom-[-30px] left-0 right-0 flex justify-between text-[10px] font-mono text-corthex-text-secondary/60 px-2">
            {dateLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// === Department Load Bar Chart ===

function DeptLoadChart({ budget }: { budget: DashboardBudget | undefined }) {
  const departments = useMemo(() => {
    if (!budget?.byDepartment?.length) return []
    const sorted = [...budget.byDepartment].sort((a, b) => b.costUsd - a.costUsd)
    const maxCost = sorted[0]?.costUsd || 1
    return sorted.slice(0, 5).map(d => ({
      name: d.name,
      value: d.costUsd,
      percent: (d.costUsd / maxCost) * 100,
    }))
  }, [budget])

  return (
    <div className="lg:col-span-4 bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] flex flex-col">
      <h3 className="text-xl font-bold tracking-tight text-corthex-accent-deep mb-2">Departmental Load</h3>
      <p className="text-sm text-corthex-text-secondary mb-8">Cost per department</p>
      <div className="space-y-6 flex-1">
        {departments.length > 0 ? departments.map((dept) => (
          <div key={dept.name} className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-wide">
              <span className="text-corthex-text-primary">{dept.name}</span>
              <span className="text-corthex-text-secondary font-mono">${dept.value.toFixed(2)}</span>
            </div>
            <div className="h-2 w-full bg-corthex-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-corthex-accent rounded-full transition-all duration-500"
                style={{ width: `${dept.percent}%`, opacity: Math.max(0.3, dept.percent / 100) }}
              />
            </div>
          </div>
        )) : (
          <div className="flex items-center justify-center h-full text-sm text-corthex-text-secondary">No department data</div>
        )}
      </div>
    </div>
  )
}

// === Task Status Donut ===

function TaskStatusDonut({ summary }: { summary: DashboardSummary }) {
  const { completed, inProgress, failed, total } = summary.tasks
  const pending = Math.max(0, total - completed - inProgress - failed)
  const circumference = 2 * Math.PI * 70 // ~440

  const segments = [
    { label: 'Completed', count: completed, color: '#606C38' },
    { label: 'In Progress', count: inProgress, color: '#5a7247' },
    { label: 'Failed', count: failed, color: '#dc2626' },
    { label: 'Pending', count: pending, color: '#e5e1d3' },
  ]

  let accOffset = 0
  const arcs = segments.map(s => {
    const ratio = total > 0 ? s.count / total : 0
    const dashLen = ratio * circumference
    const offset = circumference - accOffset
    accOffset += dashLen
    return { ...s, dashLen, offset, ratio }
  })

  return (
    <div className="lg:col-span-4 bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)]">
      <h3 className="text-xl font-bold tracking-tight text-corthex-accent-deep mb-8">Task Status</h3>
      <div className="flex items-center justify-center relative py-4">
        <svg className="w-48 h-48 transform -rotate-90">
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx="96" cy="96" r="70"
              fill="transparent"
              stroke={arc.color}
              strokeWidth="20"
              strokeDasharray={`${arc.dashLen} ${circumference - arc.dashLen}`}
              strokeDashoffset={arc.offset}
              className="transition-all duration-500"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-mono font-bold text-corthex-accent-deep">{total}</span>
          <span className="text-[10px] uppercase font-bold text-corthex-text-secondary">Total</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-8">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: arc.color }} />
            <span className="text-xs font-medium text-corthex-text-secondary">
              {arc.label} ({total > 0 ? Math.round(arc.ratio * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// === Recent Tasks Table ===

function RecentTasksTable({ summary }: { summary: DashboardSummary }) {
  // We display summary-derived info since we don't have a separate recent-tasks endpoint
  const navigate = useNavigate()
  return (
    <div className="lg:col-span-8 bg-white p-8 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-bold tracking-tight text-corthex-accent-deep">Recent Tasks</h3>
        <button
          onClick={() => navigate('/activity-log')}
          className="text-sm font-bold text-corthex-accent hover:underline underline-offset-4 flex items-center gap-1"
        >
          View History <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-[10px] uppercase tracking-widest font-bold text-corthex-text-secondary/60 border-b border-corthex-border/30">
            <tr>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 font-bold">Category</th>
              <th className="pb-4 font-bold">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-corthex-border/10">
            <tr className="group hover:bg-corthex-bg transition-colors">
              <td className="py-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-corthex-accent/10 text-corthex-accent text-[10px] font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                </span>
              </td>
              <td className="py-5 text-sm font-medium text-corthex-text-primary">Finished tasks</td>
              <td className="py-5 font-mono text-sm text-corthex-text-primary">{summary.tasks.completed}</td>
            </tr>
            <tr className="group hover:bg-corthex-bg transition-colors">
              <td className="py-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-corthex-info/10 text-corthex-info text-[10px] font-bold">
                  <Zap className="w-3.5 h-3.5" /> IN PROGRESS
                </span>
              </td>
              <td className="py-5 text-sm font-medium text-corthex-text-primary">Active tasks</td>
              <td className="py-5 font-mono text-sm text-corthex-text-primary">{summary.tasks.inProgress}</td>
            </tr>
            <tr className="group hover:bg-corthex-bg transition-colors">
              <td className="py-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/10 text-red-600 text-[10px] font-bold">
                  <XCircle className="w-3.5 h-3.5" /> FAILED
                </span>
              </td>
              <td className="py-5 text-sm font-medium text-corthex-text-primary">Failed tasks</td>
              <td className="py-5 font-mono text-sm text-corthex-text-primary">{summary.tasks.failed}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// === Loading Skeleton ===

function DashboardSkeleton() {
  return (
    <div data-testid="dashboard-skeleton" className="space-y-10 animate-in fade-in duration-300">
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-corthex-border/10 p-6">
            <div className="h-3 w-20 bg-corthex-border animate-pulse rounded mb-4" />
            <div className="h-8 w-16 bg-corthex-elevated animate-pulse rounded" />
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-xl border border-corthex-border/10 p-8 h-80 animate-pulse" />
        <div className="lg:col-span-4 bg-white rounded-xl border border-corthex-border/10 p-8 h-80 animate-pulse" />
      </div>
      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-white rounded-xl border border-corthex-border/10 p-8 h-72 animate-pulse" />
        <div className="lg:col-span-8 bg-white rounded-xl border border-corthex-border/10 p-8 h-72 animate-pulse" />
      </div>
    </div>
  )
}

// === Main Page ===

export function DashboardPage() {
  const navigate = useNavigate()
  const [usageDays, setUsageDays] = useState(7)
  const { isConnected } = useWsStore()

  // WebSocket real-time updates
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
    document.title = 'Dashboard - CORTHEX'
    return () => { document.title = 'CORTHEX' }
  }, [])

  // Derived KPI values
  const completionRate = summary && summary.tasks.total > 0
    ? ((summary.tasks.completed / summary.tasks.total) * 100).toFixed(1)
    : '0.0'

  const todayCost = summary?.cost.todayUsd ?? 0
  const budgetPercent = summary?.cost.budgetUsagePercent ?? 0

  const usageDayOptions = [
    { label: 'Today', value: 1 },
    { label: '7d', value: 7 },
    { label: '30d', value: 30 },
  ]

  return (
    <div data-testid="dashboard-page" className="bg-corthex-bg min-h-screen font-sans text-corthex-text-primary antialiased">
      <div className="p-8 max-w-[1440px] mx-auto space-y-10">
        {/* SECTION 1: PAGE HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter text-corthex-accent-deep">Analytics Overview</h1>
            <p className="text-corthex-text-secondary font-medium">Real-time performance metrics and resource allocation.</p>
          </div>
          <div className="inline-flex p-1 bg-corthex-bg rounded-xl">
            {usageDayOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setUsageDays(opt.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  usageDays === opt.value
                    ? 'bg-corthex-border text-corthex-text-primary shadow-sm font-semibold'
                    : 'text-corthex-text-secondary hover:text-corthex-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </header>

        {isLoading && !summary ? (
          <DashboardSkeleton />
        ) : summaryError && !summary ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-base font-medium text-corthex-text-secondary">Failed to load data</p>
            <p className="text-sm text-corthex-text-secondary mt-1">Retrying automatically...</p>
          </div>
        ) : summary ? (
          <>
            {/* SECTION 2: KPI CARDS ROW */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <KpiCard
                label="Total Agents"
                value={String(summary.agents.total)}
                icon={<Bot className="w-5 h-5" />}
                trend={summary.agents.active > 0 ? 'up' : 'neutral'}
                trendLabel={`${summary.agents.active} active`}
              />
              <KpiCard
                label="Active Tasks"
                value={String(summary.tasks.inProgress)}
                icon={<Zap className="w-5 h-5" />}
                trend={summary.tasks.inProgress > 0 ? 'up' : 'neutral'}
                trendLabel={`${summary.tasks.total} total`}
              />
              <KpiCard
                label="Completion Rate"
                value={`${completionRate}%`}
                icon={<CheckCircle className="w-5 h-5" />}
                trend={Number(completionRate) >= 90 ? 'up' : 'down'}
                trendLabel={`${summary.tasks.completed} done`}
              />
              <KpiCard
                label="Today's Cost"
                value={`$${todayCost.toFixed(2)}`}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <KpiCard
                label="Budget Used"
                value={`${budgetPercent.toFixed(0)}%`}
                icon={<Timer className="w-5 h-5" />}
                trend={budgetPercent > 80 ? 'down' : 'up'}
                trendLabel={budgetPercent > 80 ? 'Near limit' : 'On track'}
              />
              <KpiCard
                label="Error Agents"
                value={String(summary.agents.error)}
                icon={<Database className="w-5 h-5" />}
                trend={summary.agents.error > 0 ? 'down' : 'up'}
                trendLabel={summary.agents.error > 0 ? 'Needs attention' : 'All clear'}
              />
            </section>

            {/* SECTION 3 & 4: COST CHART & DEPT LOAD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <CostTrendChart usage={usage} budget={budget} />
              <DeptLoadChart budget={budget} />
            </div>

            {/* SECTION 5 & 6: DONUT & TABLE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <TaskStatusDonut summary={summary} />
              <RecentTasksTable summary={summary} />
            </div>

            {/* SECTION 7: QUICK ACTIONS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/command-center')}
                className="bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] border border-corthex-border/10 hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group"
              >
                <div className="p-3 rounded-xl bg-corthex-accent/10 text-corthex-accent">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-corthex-text-primary group-hover:text-corthex-accent-deep">New Conversation</h3>
                  <p className="text-sm text-corthex-text-secondary">Give agents a new task</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/workflows')}
                className="bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] border border-corthex-border/10 hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group"
              >
                <div className="p-3 rounded-xl bg-corthex-accent/10 text-corthex-accent">
                  <Workflow className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-corthex-text-primary group-hover:text-corthex-accent-deep">Create Workflow</h3>
                  <p className="text-sm text-corthex-text-secondary">Design automated tasks</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="bg-white p-6 rounded-xl shadow-[0_20px_50px_rgba(40,54,24,0.06)] border border-corthex-border/10 hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group"
              >
                <div className="p-3 rounded-xl bg-corthex-accent/10 text-corthex-accent">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-corthex-text-primary group-hover:text-corthex-accent-deep">Weekly Report</h3>
                  <p className="text-sm text-corthex-text-secondary">View agent performance</p>
                </div>
              </button>
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}
