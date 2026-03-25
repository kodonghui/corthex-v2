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
    <div className="bg-corthex-surface rounded-xl border border-corthex-border/60 p-5 shadow-[0_2px_12px_rgba(40,54,24,0.04)] hover:shadow-[0_4px_20px_rgba(40,54,24,0.08)] transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-corthex-text-secondary">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold font-mono text-corthex-accent-deep">{value}</div>
    </div>
  )
}

// ── Activity Feed Item ──

function ActivityFeedItem({ item }: { item: ActivityItem }) {
  const timeAgo = getTimeAgo(item.createdAt)
  return (
    <div className="flex gap-3 py-3 border-b border-corthex-border/30 last:border-0 group hover:bg-corthex-elevated/50 -mx-4 px-4 transition-colors rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-corthex-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Activity className="w-4 h-4 text-corthex-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-corthex-accent-deep leading-relaxed">
          {item.agentName && (
            <span className="font-semibold">{item.agentName}: </span>
          )}
          {item.summary}
        </p>
        <span className="text-[10px] text-corthex-accent-hover font-mono mt-0.5 block">{timeAgo}</span>
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
      className="bg-corthex-surface p-5 rounded-xl border border-corthex-border/60 shadow-[0_2px_12px_rgba(40,54,24,0.04)] hover:shadow-[0_4px_20px_rgba(40,54,24,0.08)] hover:bg-corthex-bg transition-all text-left flex items-start gap-4 group w-full"
    >
      <div className="p-2.5 rounded-xl bg-corthex-accent/10 text-corthex-accent group-hover:bg-corthex-accent/15 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-corthex-accent-deep group-hover:text-corthex-accent transition-colors flex items-center gap-1.5">
          {label}
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <p className="text-xs text-corthex-text-secondary mt-0.5">{description}</p>
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
    <div data-testid="hub-dashboard" className="bg-corthex-bg min-h-full">
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
        {/* Welcome Header */}
        <header data-testid="hub-welcome-header" className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-corthex-accent-deep">
            {greeting} 👋
          </h1>
          {user && (
            <p className="text-corthex-text-secondary font-medium">
              Welcome back. Here's what's happening today.
            </p>
          )}
        </header>

        {/* Stats Cards */}
        {summaryLoading ? (
          <div data-testid="hub-stats-skeleton" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-corthex-surface rounded-xl border border-corthex-border/60 p-5">
                <div className="h-3 w-16 bg-corthex-border animate-pulse rounded mb-3" />
                <div className="h-8 w-12 bg-corthex-elevated animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <section data-testid="hub-stats-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard
              label="Agents Online"
              value={summary.agents.active}
              icon={<Bot className="w-4 h-4" />}
              color="bg-corthex-accent/10 text-corthex-accent"
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
          <div className="lg:col-span-2 bg-corthex-surface rounded-xl border border-corthex-border/60 shadow-[0_2px_12px_rgba(40,54,24,0.04)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-corthex-accent-deep">Recent Activity</h2>
              <button
                onClick={() => navigate('/activity-log')}
                className="text-xs font-medium text-corthex-accent hover:underline underline-offset-2 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div data-testid="hub-activity-feed">
              {activityLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 py-3">
                      <div className="w-8 h-8 bg-corthex-elevated animate-pulse rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-full bg-corthex-elevated animate-pulse rounded" />
                        <div className="h-2 w-20 bg-corthex-elevated animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                activities.map((item) => (
                  <ActivityFeedItem key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-corthex-text-secondary">
                  No recent activity
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-corthex-accent-deep">Quick Actions</h2>
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
