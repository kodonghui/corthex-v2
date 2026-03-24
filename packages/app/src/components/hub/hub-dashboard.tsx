// API: GET /workspace/dashboard/summary
// API: GET /workspace/activity-log

import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/auth-store'
import {
  Bot, Zap, ArrowRightLeft, DollarSign, ArrowRight,
  MessageSquare, Users, Building2, Activity,
} from 'lucide-react'
import type { DashboardSummary } from '@corthex/shared'

// ── Types ──

type ActivityItem = {
  id: string
  type: string
  agentName: string | null
  summary: string
  createdAt: string
}

// ── Stats Card ──

function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#e5e1d3]/60 p-5 shadow-[0_2px_12px_rgba(40,54,24,0.04)] hover:shadow-[0_4px_20px_rgba(40,54,24,0.08)] transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6b705c]">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold font-mono text-[#283618]">{value}</div>
    </div>
  )
}

// ── Activity Feed Item ──

function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const timeAgo = getTimeAgo(item.createdAt)
  return (
    <div className="flex gap-3 py-3 border-b border-[#e5e1d3]/30 last:border-0 group hover:bg-[#f5f0e8]/50 -mx-4 px-4 transition-colors rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-[#5a7247]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Activity className="w-4 h-4 text-[#5a7247]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[#283618] leading-relaxed">
          {item.agentName && (
            <span className="font-semibold">{item.agentName}: </span>
          )}
          {item.summary}
        </p>
        <span className="text-[10px] text-[#a3b18a] font-mono mt-0.5 block">{timeAgo}</span>
      </div>
    </div>
  )
}

// ── Quick Action Button ──

function QuickAction({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-xl border border-[#e5e1d3]/60 shadow-[0_2px_12px_rgba(40,54,24,0.04)] hover:shadow-[0_4px_20px_rgba(40,54,24,0.08)] hover:bg-[#f5f3f0] transition-all text-left flex items-start gap-4 group w-full"
    >
      <div className="p-2.5 rounded-xl bg-[#5a7247]/10 text-[#5a7247] group-hover:bg-[#5a7247]/15 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-[#283618] group-hover:text-[#5a7247] transition-colors flex items-center gap-1.5">
          {label}
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-xs text-[#6b705c] mt-0.5">{description}</p>
      </div>
    </button>
  )
}

// ── Time ago helper ──

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ── Greeting helper ──

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

// ── Main Component ──

export function HubDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const greeting = getGreeting()

  const { data: summaryRes, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<{ data: DashboardSummary }>('/workspace/dashboard/summary'),
    staleTime: 30_000,
  })

  const { data: activityRes, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity-feed', 10],
    queryFn: () => api.get<{ success: boolean; data: ActivityItem[] }>('/workspace/activity-log?limit=10'),
    staleTime: 30_000,
  })

  const summary = summaryRes?.data
  const activities = activityRes?.data || []

  return (
    <div data-testid="hub-dashboard" className="bg-[#faf8f5] min-h-full">
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
        {/* Welcome Header */}
        <header data-testid="hub-welcome-header" className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#283618]">
            {greeting} 👋
          </h1>
          {user && (
            <p className="text-[#6b705c] font-medium">
              Welcome back. Here's what's happening today.
            </p>
          )}
        </header>

        {/* Stats Cards */}
        {summaryLoading ? (
          <div data-testid="hub-stats-skeleton" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#e5e1d3]/60 p-5">
                <div className="h-3 w-16 bg-[#e5e1d3] animate-pulse rounded mb-3" />
                <div className="h-8 w-12 bg-[#f5f0e8] animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <section data-testid="hub-stats-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              label="Agents Online"
              value={summary.agents.active}
              icon={<Bot className="w-4 h-4" />}
              color="bg-[#5a7247]/10 text-[#5a7247]"
            />
            <StatsCard
              label="Active Tasks"
              value={summary.tasks.inProgress}
              icon={<Zap className="w-4 h-4" />}
              color="bg-blue-50 text-blue-600"
            />
            <StatsCard
              label="Recent Handoffs"
              value={summary.tasks.completed}
              icon={<ArrowRightLeft className="w-4 h-4" />}
              color="bg-amber-50 text-amber-600"
            />
            <StatsCard
              label="Cost Today"
              value={`$${(summary.cost.todayUsd ?? 0).toFixed(2)}`}
              icon={<DollarSign className="w-4 h-4" />}
              color="bg-emerald-50 text-emerald-600"
            />
          </section>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#e5e1d3]/60 shadow-[0_2px_12px_rgba(40,54,24,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#283618]">Recent Activity</h2>
              <button
                onClick={() => navigate('/activity-log')}
                className="text-xs font-medium text-[#5a7247] hover:underline underline-offset-2 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div data-testid="hub-activity-feed">
              {activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 py-3">
                      <div className="w-8 h-8 bg-[#f5f0e8] animate-pulse rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-full bg-[#f5f0e8] animate-pulse rounded" />
                        <div className="h-2 w-20 bg-[#f5f0e8] animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                activities.map((item) => (
                  <ActivityFeedItem key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-[#6b705c]">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#283618]">Quick Actions</h2>
            <div data-testid="hub-quick-actions" className="space-y-3">
              <QuickAction
                icon={<MessageSquare className="w-5 h-5" />}
                label="New Conversation"
                description="Start a chat with an agent"
                onClick={() => navigate('/chat')}
              />
              <QuickAction
                icon={<Users className="w-5 h-5" />}
                label="View Agents"
                description="Browse and manage AI agents"
                onClick={() => navigate('/agents')}
              />
              <QuickAction
                icon={<Building2 className="w-5 h-5" />}
                label="Organization"
                description="Manage departments and hierarchy"
                onClick={() => navigate('/nexus')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
