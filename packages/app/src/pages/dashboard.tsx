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
  Building2, MoreVertical, ChevronLeft, ChevronRight, Terminal,
} from 'lucide-react'
import type {
  LLMProviderName,
  DashboardSummary,
  DashboardUsageDay,
  DashboardUsage,
  DashboardBudget,
  QuickAction,
  DashboardSatisfaction,
  Agent,
} from '@corthex/shared'

// === Constants ===

const PROVIDER_COLORS: Record<LLMProviderName, string> = {
  anthropic: 'var(--color-corthex-handoff)',
  openai: 'var(--color-corthex-success)',
  google: 'var(--color-corthex-warning)',
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
    <div className="bg-corthex-surface p-6 rounded-xl shadow-lg border border-corthex-border/10 group hover:bg-corthex-bg transition-colors">
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
    <div className="lg:col-span-8 bg-corthex-surface p-8 rounded-xl shadow-lg flex flex-col">
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
              <stop offset="0%" stopColor="var(--color-corthex-accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-corthex-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Reference lines */}
          <line x1="0" x2={chartWidth} y1="50" y2="50" stroke="var(--color-corthex-border)" strokeDasharray="4" strokeWidth="1" opacity="0.4" />
          <line x1="0" x2={chartWidth} y1="100" y2="100" stroke="var(--color-corthex-border)" strokeDasharray="4" strokeWidth="1" opacity="0.4" />
          <line x1="0" x2={chartWidth} y1="150" y2="150" stroke="var(--color-corthex-border)" strokeDasharray="4" strokeWidth="1" opacity="0.4" />
          {/* Area fill */}
          <path d={areaPath} fill="url(#cost-gradient)" />
          {/* Line */}
          <path d={linePath} fill="none" stroke="var(--color-corthex-accent)" strokeWidth="3" strokeLinecap="round" />
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
    <div className="lg:col-span-4 bg-corthex-surface p-8 rounded-xl shadow-lg flex flex-col">
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
    { label: 'Completed', count: completed, color: 'var(--color-corthex-accent)' },
    { label: 'In Progress', count: inProgress, color: 'var(--color-corthex-accent-hover)' },
    { label: 'Failed', count: failed, color: 'var(--color-corthex-error)' },
    { label: 'Pending', count: pending, color: 'var(--color-corthex-border)' },
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
    <div className="lg:col-span-4 bg-corthex-surface p-8 rounded-xl shadow-lg">
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
    <div className="lg:col-span-8 bg-corthex-surface p-8 rounded-xl shadow-lg overflow-hidden">
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
          <div key={i} className="bg-corthex-surface rounded-xl border border-corthex-border/10 p-6">
            <div className="h-3 w-20 bg-corthex-border animate-pulse rounded mb-4" />
            <div className="h-8 w-16 bg-corthex-elevated animate-pulse rounded" />
          </div>
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-corthex-surface rounded-xl border border-corthex-border/10 p-8 h-80 animate-pulse" />
        <div className="lg:col-span-4 bg-corthex-surface rounded-xl border border-corthex-border/10 p-8 h-80 animate-pulse" />
      </div>
      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-corthex-surface rounded-xl border border-corthex-border/10 p-8 h-72 animate-pulse" />
        <div className="lg:col-span-8 bg-corthex-surface rounded-xl border border-corthex-border/10 p-8 h-72 animate-pulse" />
      </div>
    </div>
  )
}

// === Main Page ===

export function DashboardPage() {
  const navigate = useNavigate()
  const [usageDays, setUsageDays] = useState(7)
  const { isConnected, addListener, removeListener } = useWsStore()

  // WebSocket real-time updates
  useDashboardWs()

  // Live event stream — populated from WS channel events
  const [wsEvents, setWsEvents] = useState<Array<{ time: string; type: 'INFO' | 'OKAY' | 'WARN' | 'FAIL'; message: string }>>([])

  useEffect(() => {
    const handleAgentStatus = (data: unknown) => {
      const d = data as { agentName?: string; status?: string } | null
      const time = new Date().toLocaleTimeString('en-US', { hour12: false })
      const type: 'INFO' | 'OKAY' | 'WARN' | 'FAIL' =
        d?.status === 'error' ? 'FAIL' : d?.status === 'working' ? 'INFO' : 'OKAY'
      const message =
        d?.status === 'error'
          ? `Agent ${d?.agentName ?? '?'} reported an error.`
          : d?.status === 'working'
            ? `Agent ${d?.agentName ?? '?'} started a new task.`
            : `Agent ${d?.agentName ?? '?'} status updated.`
      setWsEvents(prev => [{ time, type, message }, ...prev].slice(0, 30))
    }
    const handleCost = () => {
      const time = new Date().toLocaleTimeString('en-US', { hour12: false })
      setWsEvents(prev => [{ time, type: 'INFO' as const, message: 'Cost metrics updated.' }, ...prev].slice(0, 30))
    }
    const handleCommand = (data: unknown) => {
      const d = data as { action?: string } | null
      const time = new Date().toLocaleTimeString('en-US', { hour12: false })
      setWsEvents(prev => [{ time, type: 'OKAY' as const, message: `Command ${d?.action ?? 'executed'} completed.` }, ...prev].slice(0, 30))
    }
    addListener('agent-status', handleAgentStatus)
    addListener('cost', handleCost)
    addListener('command', handleCommand)
    return () => {
      removeListener('agent-status', handleAgentStatus)
      removeListener('cost', handleCost)
      removeListener('command', handleCommand)
    }
  }, [addListener, removeListener])

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

  const { data: agentsRes } = useQuery({
    queryKey: ['dashboard-agents'],
    queryFn: () => api.get<{ data: Agent[] }>('/workspace/agents'),
  })

  const summary = summaryRes?.data
  const usage = usageRes?.data
  const budget = budgetRes?.data
  const agents = agentsRes?.data ?? []

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

  // Stat card derived values
  const activeAgents = summary?.agents.active ?? 0
  const deptCount = budget?.byDepartment?.length ?? 0
  const pendingJobs = summary
    ? Math.max(0, summary.tasks.total - summary.tasks.completed - summary.tasks.inProgress - summary.tasks.failed)
    : 0
  const mtdCost = budget?.currentMonthSpendUsd ?? 0

  // System Health Matrix — semantic mappings
  const cpuLoad = budgetPercent
  const memoryLoad = summary && summary.tasks.total > 0
    ? (summary.tasks.completed / summary.tasks.total) * 100
    : 0
  const nexusLoad = summary && summary.agents.total > 0
    ? (summary.agents.active / summary.agents.total) * 100
    : 0

  // Active units table — online/working agents
  const activeAgentsList = agents
    .filter(a => a.status === 'online' || a.status === 'working')
    .slice(0, 5)

  const eventTypeColor: Record<string, string> = {
    INFO: 'text-corthex-info',
    OKAY: 'text-corthex-success',
    WARN: 'text-corthex-warning',
    FAIL: 'text-corthex-error',
  }

  return (
    <div data-testid="dashboard-page" className="bg-corthex-bg min-h-screen font-sans text-corthex-text-primary antialiased">
      <div className="p-8 max-w-[1440px] mx-auto space-y-8">

        {/* SECTION 1: WELCOME HEADER */}
        <section>
          <h1 className="text-3xl font-bold text-corthex-text-primary mb-1">Welcome, Commander</h1>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse shadow-sm' : 'bg-red-500'}`} />
            <p className="text-[10px] font-mono tracking-widest uppercase text-corthex-success">
              {isConnected ? 'SYSTEM: NOMINAL' : 'SYSTEM: OFFLINE'}
            </p>
          </div>
        </section>

        {isLoading && !summary ? (
          <DashboardSkeleton />
        ) : summaryError && !summary ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-base font-medium text-corthex-text-secondary">Failed to load data</p>
            <p className="text-sm text-corthex-text-secondary mt-1">Retrying automatically...</p>
          </div>
        ) : summary ? (
          <>
            {/* SECTION 2: STAT CARDS GRID (4-col) */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Active Agents */}
              <div className="bg-corthex-surface border border-corthex-border/40 rounded-lg p-5 group hover:border-corthex-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <Bot className="w-6 h-6 text-corthex-accent" />
                  <span className="bg-green-500/10 text-corthex-success text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-green-500/20">ONLINE</span>
                </div>
                <div className="font-mono text-[30px] font-bold text-corthex-text-primary leading-tight">
                  {String(activeAgents).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-corthex-text-secondary/60">Active Agents</div>
              </div>
              {/* Departments */}
              <div className="bg-corthex-surface border border-corthex-border/40 rounded-lg p-5 group hover:border-corthex-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <Building2 className="w-6 h-6 text-corthex-accent" />
                  <span className="bg-corthex-border/30 text-corthex-text-secondary text-[10px] font-bold uppercase px-2 py-0.5 rounded">STABLE</span>
                </div>
                <div className="font-mono text-[30px] font-bold text-corthex-text-primary leading-tight">
                  {String(deptCount).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-corthex-text-secondary/60">Departments</div>
              </div>
              {/* Pending Jobs */}
              <div className="bg-corthex-surface border border-corthex-border/40 rounded-lg p-5 group hover:border-corthex-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <Timer className="w-6 h-6 text-corthex-accent" />
                  <span className="bg-yellow-500/10 text-corthex-warning text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-yellow-500/20">
                    {summary.tasks.inProgress > 0 ? `${summary.tasks.inProgress} ACTIVE` : 'IDLE'}
                  </span>
                </div>
                <div className="font-mono text-[30px] font-bold text-corthex-text-primary leading-tight">
                  {String(pendingJobs).padStart(3, '0')}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-corthex-text-secondary/60">Pending Jobs</div>
              </div>
              {/* Total Costs */}
              <div className="bg-corthex-surface border border-corthex-border/40 rounded-lg p-5 group hover:border-corthex-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <DollarSign className="w-6 h-6 text-corthex-accent" />
                  <span className="bg-corthex-border/30 text-corthex-text-secondary text-[10px] font-bold uppercase px-2 py-0.5 rounded">MTD</span>
                </div>
                <div className="font-mono text-[30px] font-bold text-corthex-text-primary leading-tight">
                  ${mtdCost.toFixed(0)}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-corthex-text-secondary/60">Total Costs</div>
              </div>
            </section>

            {/* SECTION 3: MAIN GRID (2/3 + 1/3) */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Units Table (2/3) */}
              <div className="lg:col-span-2 bg-corthex-surface border border-corthex-border/40 rounded-lg overflow-hidden flex flex-col">
                <div className="p-5 border-b border-corthex-border/40 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Active Units</h3>
                  <button
                    onClick={() => navigate('/agents')}
                    className="text-[10px] font-bold text-corthex-accent hover:text-corthex-accent/80 uppercase tracking-wider"
                  >
                    View Full Roster
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-corthex-border/10">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-corthex-text-secondary/60 font-bold">Unit ID</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-corthex-text-secondary/60 font-bold">Status</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-corthex-text-secondary/60 font-bold">Tier</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-corthex-text-secondary/60 font-bold text-right">Ops</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-corthex-border/10">
                      {activeAgentsList.length > 0 ? activeAgentsList.map((agent) => (
                        <tr key={agent.id} className="hover:bg-corthex-elevated/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-corthex-accent/10 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-corthex-accent" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-corthex-text-primary">{agent.name}</p>
                                <p className="text-[10px] font-mono text-corthex-text-secondary/60">{agent.id.slice(0, 12).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                agent.status === 'working' ? 'bg-corthex-accent' :
                                agent.status === 'online' ? 'bg-green-500' :
                                agent.status === 'error' ? 'bg-red-500' : 'bg-corthex-border'
                              }`} />
                              <span className="text-sm text-corthex-text-primary capitalize">{agent.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-[10px] font-mono uppercase text-corthex-text-secondary/60">
                              {agent.tier} T{agent.tierLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => navigate('/agents')}
                              className="text-corthex-text-secondary/40 hover:text-corthex-accent transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-corthex-text-secondary">
                            No active agents
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-auto p-4 border-t border-corthex-border/10 flex justify-center">
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-corthex-border/40 text-corthex-text-secondary/40 hover:bg-corthex-elevated transition-all">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-corthex-accent bg-corthex-accent/10 text-corthex-accent text-xs font-bold">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-corthex-border/40 text-corthex-text-secondary/60 hover:bg-corthex-elevated text-xs transition-all">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-corthex-border/40 text-corthex-text-secondary/40 hover:bg-corthex-elevated transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Event Stream (1/3) */}
              <div className="bg-corthex-surface border border-corthex-border/40 rounded-lg flex flex-col h-[400px]">
                <div className="p-5 border-b border-corthex-border/40 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary">Live Event Stream</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] space-y-3">
                  {wsEvents.length > 0 ? wsEvents.map((ev, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-corthex-text-secondary/40 shrink-0">[{ev.time}]</span>
                      <span className={`font-bold shrink-0 ${eventTypeColor[ev.type]}`}>{ev.type}:</span>
                      <span className="text-corthex-text-secondary">{ev.message}</span>
                    </div>
                  )) : (
                    <div className="text-corthex-text-secondary/40">
                      Waiting for events...
                    </div>
                  )}
                </div>
                <div className="p-4 bg-corthex-bg/50 border-t border-corthex-border/40">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-corthex-elevated rounded border border-corthex-border/40">
                    <Terminal className="w-4 h-4 text-corthex-text-secondary/40" />
                    <span className="text-[10px] font-mono text-corthex-text-secondary/40">Waiting for input...</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 4: SYSTEM HEALTH MATRIX */}
            <section className="bg-corthex-surface border border-corthex-border/40 rounded-lg p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-corthex-text-secondary mb-6">System Health Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* CPU — Budget utilization */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-corthex-text-secondary">Central Processing Unit</span>
                    <span className="text-xs font-mono text-corthex-text-primary">{cpuLoad.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 bg-corthex-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-corthex-accent to-corthex-accent/70"
                      style={{ width: `${Math.min(cpuLoad, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-1 h-3 ${i <= Math.ceil(cpuLoad / 20) ? 'bg-corthex-accent' : 'bg-corthex-border/40'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-corthex-text-secondary/60">BUDGET</span>
                  </div>
                </div>
                {/* Memory — Task completion ratio */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-corthex-text-secondary">Neural Memory Banks</span>
                    <span className="text-xs font-mono text-corthex-text-primary">{memoryLoad.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 bg-corthex-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-corthex-info to-corthex-info"
                      style={{ width: `${Math.min(memoryLoad, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-1 h-3 ${i <= Math.ceil(memoryLoad / 20) ? 'bg-blue-500' : 'bg-corthex-border/40'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-corthex-text-secondary/60">{summary.tasks.completed} DONE</span>
                  </div>
                </div>
                {/* Network — Agent active ratio */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase text-corthex-text-secondary">NEXUS Throughput</span>
                    <span className="text-xs font-mono text-corthex-text-primary">{nexusLoad.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2 bg-corthex-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-corthex-success to-corthex-success"
                      style={{ width: `${Math.min(nexusLoad, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`w-1 h-3 ${i <= Math.ceil(nexusLoad / 20) ? 'bg-green-500' : 'bg-corthex-border/40'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-corthex-text-secondary/60">
                      {summary.agents.active}/{summary.agents.total} AGENTS
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: COST TREND + DEPT LOAD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <CostTrendChart usage={usage} budget={budget} />
              <DeptLoadChart budget={budget} />
            </div>

            {/* SECTION 6: TASK STATUS DONUT + RECENT TASKS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <TaskStatusDonut summary={summary} />
              <RecentTasksTable summary={summary} />
            </div>

            {/* SECTION 7: QUICK ACTIONS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/command-center')}
                className="bg-corthex-surface p-6 rounded-xl shadow-lg border border-corthex-border/10 hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group"
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
                className="bg-corthex-surface p-6 rounded-xl shadow-lg border border-corthex-border/10 hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group"
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
                className="bg-corthex-surface p-6 rounded-xl shadow-lg border border-corthex-border/10 hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group"
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
