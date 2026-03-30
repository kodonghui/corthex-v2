// Organization Page — Overview hub + tabbed sub-views
// Overview shows stats + quick-link tiles. Tiles navigate to sub-views.

import { useState, lazy, Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Network, Building2, Bot, GitBranch, ArrowRight, Timer, Zap, X, History } from 'lucide-react'
import { Skeleton } from '@corthex/ui'
import { api } from '../lib/api'

const NexusPage = lazy(() => import('./nexus').then((m) => ({ default: m.NexusPage })))
const DepartmentsPage = lazy(() => import('./departments').then((m) => ({ default: m.DepartmentsPage })))
const AgentsPage = lazy(() => import('./agents').then((m) => ({ default: m.AgentsPage })))
const TiersPage = lazy(() => import('./tiers').then((m) => ({ default: m.TiersPage })))

type OrgTab = 'nexus' | 'departments' | 'agents' | 'tiers'

type OrgChartSummary = {
  data: {
    company: { id: string; name: string; slug: string }
    departments: Array<{ id: string; agents: unknown[] }>
    unassignedAgents: unknown[]
  }
}

function TabSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

// ── Overview Dashboard ──

function OrganizationOverview({ onNavigate }: { onNavigate: (tab: OrgTab) => void }) {
  const { data, isError, refetch } = useQuery({
    queryKey: ['workspace-org-chart'],
    queryFn: () => api.get<OrgChartSummary>('/workspace/org-chart'),
  })

  if (isError) {
    return (
      <div className="min-h-full p-6 lg:p-10 flex items-center justify-center">
        <div className="bg-corthex-error/10 border border-corthex-error/20 rounded-xl p-8 text-center max-w-sm">
          <p className="text-sm text-corthex-error font-medium mb-3">조직도를 불러올 수 없습니다</p>
          <button onClick={() => refetch()} className="text-xs text-corthex-error hover:opacity-70 underline">
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const org = data?.data
  const deptCount = org?.departments.length ?? 0
  const agentCount = (org?.departments.reduce((sum, d) => sum + d.agents.length, 0) ?? 0) +
    (org?.unassignedAgents.length ?? 0)

  const stats = [
    { icon: Building2, label: 'Departments', value: deptCount, badge: 'Active' },
    { icon: Bot, label: 'Active Agents', value: agentCount, badge: 'Live', badgeColor: 'text-corthex-success bg-corthex-success/10' },
    { icon: GitBranch, label: 'Service Tiers', value: '—', badge: 'Priority' },
    { icon: Timer, label: 'Active Jobs', value: '—', badge: '+12% WK', badgeColor: 'text-corthex-accent bg-corthex-accent/10' },
  ]

  const tiles = [
    {
      tab: 'departments' as OrgTab,
      icon: Building2,
      title: 'Manage Departments',
      desc: 'Configure organizational structures, budget allocations, and departmental permissions.',
      cta: 'Initialize Access',
    },
    {
      tab: 'agents' as OrgTab,
      icon: Bot,
      title: 'View Agents',
      desc: 'Monitor AI instances, performance metrics, and individual agent task logs in real-time.',
      cta: 'Launch Monitor',
    },
    {
      tab: 'tiers' as OrgTab,
      icon: GitBranch,
      title: 'Configure Tiers',
      desc: 'Adjust computational priority, bandwidth caps, and service level agreements for tiers.',
      cta: 'Modify Specs',
    },
    {
      tab: 'nexus' as OrgTab,
      icon: Network,
      title: 'NEXUS Map',
      desc: 'Visual node-graph of all active processes and inter-departmental data exchanges.',
      cta: 'Enter Nexus',
    },
  ]

  return (
    <div className="min-h-full p-6 lg:p-10 space-y-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-corthex-text-primary">CORTHEX GLOBAL</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-corthex-accent text-corthex-text-on-accent tracking-widest">
              ENTERPRISE
            </span>
          </div>
          <p className="text-corthex-text-secondary font-mono text-xs uppercase tracking-[0.2em]">
            Core Infrastructure Overview
          </p>
        </div>
        <div className="flex items-center gap-2 text-corthex-text-secondary">
          <span className="font-mono text-xs uppercase tracking-widest">System Status:</span>
          <span className="font-mono text-xs text-corthex-success uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-corthex-success animate-pulse" />
            Operational
          </span>
        </div>
      </header>

      {/* Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, badge, badgeColor }) => (
          <div
            key={label}
            className="bg-corthex-surface border border-corthex-border p-5 rounded-lg group hover:border-corthex-accent/50 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <Icon className="w-5 h-5 text-corthex-accent" />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${badgeColor ?? 'text-corthex-text-secondary'}`}>
                {badge}
              </span>
            </div>
            <div className="font-mono text-3xl font-bold text-corthex-text-primary mb-1">{value}</div>
            <div className="text-[10px] font-bold text-corthex-border-strong uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </section>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Quick Link Tiles */}
        <section className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiles.map(({ tab, icon: Icon, title, desc, cta }) => (
            <button
              key={tab}
              onClick={() => onNavigate(tab)}
              className="bg-corthex-surface border border-corthex-border p-6 rounded-lg group cursor-pointer hover:bg-corthex-elevated transition-all active:scale-[0.98] text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-corthex-accent/10 flex items-center justify-center mb-6 group-hover:bg-corthex-accent transition-colors">
                <Icon className="w-5 h-5 text-corthex-accent group-hover:text-corthex-text-on-accent" />
              </div>
              <h3 className="text-lg font-bold text-corthex-text-primary mb-2">{title}</h3>
              <p className="text-sm text-corthex-text-secondary mb-4">{desc}</p>
              <div className="flex items-center gap-2 text-corthex-accent font-mono text-xs font-bold uppercase tracking-widest">
                {cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </section>

        {/* Right Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-6">
          {/* Security Status Card */}
          <div className="bg-corthex-surface border border-corthex-border rounded-lg overflow-hidden">
            <div className="bg-corthex-accent/10 px-4 py-3 border-b border-corthex-border flex justify-between items-center">
              <span className="text-[10px] font-bold text-corthex-accent uppercase tracking-widest">Security Status</span>
              <span className="flex items-center gap-1.5 text-corthex-success text-[10px] font-bold uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-corthex-success" />
                Optimal
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest block mb-2">
                  API Endpoint
                </label>
                <div className="bg-corthex-elevated border border-corthex-border p-2 rounded flex items-center justify-between">
                  <code className="font-mono text-xs text-corthex-accent overflow-hidden text-ellipsis whitespace-nowrap">
                    https://api.corthex.ai
                  </code>
                </div>
              </div>
              <div className="pt-2">
                <label className="text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest block mb-3">
                  Recent Changes
                </label>
                <div className="space-y-3">
                  {[
                    { text: 'Tier 2 bandwidth increased by 50%', meta: '14:20 UTC · SYS_ADMIN', active: true },
                    { text: "New Department: 'Data Synthesis' created", meta: 'Yesterday · HR_LEAD', active: false },
                    { text: 'Agent initialized successfully', meta: 'Yesterday · AUTO_PROC', active: false },
                  ].map(({ text, meta, active }) => (
                    <div key={text} className="flex gap-3 items-start">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-corthex-accent' : 'bg-corthex-border-strong'}`} />
                      <div className="space-y-0.5">
                        <p className="text-xs text-corthex-text-primary">{text}</p>
                        <p className="font-mono text-[10px] text-corthex-text-disabled uppercase">{meta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full bg-corthex-elevated hover:bg-corthex-border border border-corthex-border text-corthex-text-primary py-2 px-4 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                View Audit Log
                <History className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Network Load Card */}
          <div className="bg-corthex-surface border border-corthex-border p-5 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold text-corthex-text-secondary uppercase tracking-widest">
                Network Load
              </span>
              <span className="font-mono text-xs text-corthex-accent">42.8%</span>
            </div>
            <div className="h-24 flex items-end gap-1 mb-4">
              {[40, 60, 55, 70, 45, 85, 30, 50, 65, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t-sm transition-colors ${
                    i === 5 ? 'bg-corthex-accent' : 'bg-corthex-border-strong hover:bg-corthex-accent'
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between font-mono text-[10px] text-corthex-text-disabled uppercase">
              <span>00:00</span>
              <span>12:00</span>
              <span>Now</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ── Main Page ──

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<OrgTab | null>(null)

  // Show sub-page with back button
  if (activeTab !== null) {
    return (
      <div data-testid="organization-page" className="flex-1 flex flex-col overflow-hidden bg-corthex-bg">
        {/* Sub-page header with back */}
        <header className="border-b border-corthex-border bg-corthex-surface shrink-0 px-6 py-3 flex items-center gap-3">
          <button
            onClick={() => setActiveTab(null)}
            className="flex items-center gap-2 text-corthex-text-secondary hover:text-corthex-text-primary transition-colors text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Overview
          </button>
          <span className="text-corthex-border">/</span>
          <span className="text-sm font-medium text-corthex-accent-deep">
            {activeTab === 'nexus' && 'NEXUS'}
            {activeTab === 'departments' && '부서'}
            {activeTab === 'agents' && '에이전트'}
            {activeTab === 'tiers' && '티어'}
          </span>
        </header>
        <div className="flex-1 overflow-hidden">
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === 'nexus' && <NexusPage />}
            {activeTab === 'departments' && <DepartmentsPage />}
            {activeTab === 'agents' && <AgentsPage />}
            {activeTab === 'tiers' && <TiersPage />}
          </Suspense>
        </div>
      </div>
    )
  }

  return (
    <div data-testid="organization-page" className="flex-1 overflow-y-auto bg-corthex-bg">
      <OrganizationOverview onNavigate={setActiveTab} />
    </div>
  )
}
