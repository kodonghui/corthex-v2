// Organization Page — Tabbed view combining NEXUS, Departments, Agents, Tiers
// Tabs: NEXUS Canvas | Departments | Agents | Tiers

import { useState, lazy, Suspense } from 'react'
import { Network, Building2, Bot, GitBranch } from 'lucide-react'
import { Skeleton } from '@corthex/ui'

const NexusPage = lazy(() => import('./nexus').then((m) => ({ default: m.NexusPage })))
const DepartmentsPage = lazy(() => import('./departments').then((m) => ({ default: m.DepartmentsPage })))
const AgentsPage = lazy(() => import('./agents').then((m) => ({ default: m.AgentsPage })))
const TiersPage = lazy(() => import('./tiers').then((m) => ({ default: m.TiersPage })))

type OrgTab = 'nexus' | 'departments' | 'agents' | 'tiers'

const TAB_CONFIG: { value: OrgTab; label: string; icon: typeof Network }[] = [
  { value: 'nexus', label: 'NEXUS', icon: Network },
  { value: 'departments', label: '부서', icon: Building2 },
  { value: 'agents', label: '에이전트', icon: Bot },
  { value: 'tiers', label: '티어', icon: GitBranch },
]

function TabSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<OrgTab>('nexus')

  return (
    <div data-testid="organization-page" className="flex-1 flex flex-col overflow-hidden bg-[#faf8f5]">
      {/* Tab Header */}
      <header className="border-b border-[#e5e1d3] bg-white shrink-0">
        <div className="px-6 pt-4 pb-0">
          <h1 className="text-2xl font-bold text-[#283618] mb-3">Organization</h1>
          <nav className="flex gap-1" aria-label="Organization tabs">
            {TAB_CONFIG.map(({ value, label, icon: Icon }) => {
              const isActive = activeTab === value
              return (
                <button
                  key={value}
                  onClick={() => setActiveTab(value)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${
                    isActive
                      ? 'border-[#606C38] text-[#283618] bg-[#f5f0e8]'
                      : 'border-transparent text-[#6b705c] hover:text-[#283618] hover:bg-[#f5f0e8]/50'
                  }`}
                  data-testid={`org-tab-${value}`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Tab Content */}
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
