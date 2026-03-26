import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/auth-store'
import { Layout } from './components/layout'
import { Skeleton } from '@corthex/ui'

const LoginPage = lazy(() => import('./pages/login').then((m) => ({ default: m.LoginPage })))
const HomePage = lazy(() => import('./pages/home').then((m) => ({ default: m.HomePage })))
const ChatPage = lazy(() => import('./pages/chat').then((m) => ({ default: m.ChatPage })))
const SettingsPage = lazy(() => import('./pages/settings').then((m) => ({ default: m.SettingsPage })))
const ReportsPage = lazy(() => import('./pages/reports').then((m) => ({ default: m.ReportsPage })))
const JobsPage = lazy(() => import('./pages/jobs').then((m) => ({ default: m.JobsPage })))
const SnsPage = lazy(() => import('./pages/sns').then((m) => ({ default: m.SnsPage })))
const MessengerPage = lazy(() => import('./pages/messenger').then((m) => ({ default: m.MessengerPage })))
const DashboardPage = lazy(() => import('./pages/dashboard').then((m) => ({ default: m.DashboardPage })))
const OpsLogPage = lazy(() => import('./pages/ops-log').then((m) => ({ default: m.OpsLogPage })))
const NexusPage = lazy(() => import('./pages/nexus').then((m) => ({ default: m.NexusPage })))

const NotificationsPage = lazy(() => import('./pages/notifications').then((m) => ({ default: m.NotificationsPage })))
const TradingPage = lazy(() => import('./pages/trading').then((m) => ({ default: m.TradingPage })))
const FilesPage = lazy(() => import('./pages/files').then((m) => ({ default: m.FilesPage })))
const OrgPage = lazy(() => import('./pages/org').then((m) => ({ default: m.OrgPage })))
const CommandCenterPage = lazy(() => import('./pages/command-center').then((m) => ({ default: m.CommandCenterPage })))
const ActivityLogPage = lazy(() => import('./pages/activity-log').then((m) => ({ default: m.ActivityLogPage })))
const CostsPage = lazy(() => import('./pages/costs').then((m) => ({ default: m.CostsPage })))
const CronBasePage = lazy(() => import('./pages/cron-base').then((m) => ({ default: m.CronBasePage })))
const ArgosPage = lazy(() => import('./pages/argos').then((m) => ({ default: m.ArgosPage })))
const AgoraPage = lazy(() => import('./pages/agora').then((m) => ({ default: m.AgoraPage })))
const ClassifiedPage = lazy(() => import('./pages/classified').then((m) => ({ default: m.ClassifiedPage })))
const KnowledgePage = lazy(() => import('./pages/knowledge').then((m) => ({ default: m.KnowledgePage })))
const PerformancePage = lazy(() => import('./pages/performance').then((m) => ({ default: m.PerformancePage })))
const HubPage = lazy(() => import('./pages/hub').then((m) => ({ default: m.HubPage })))
const DepartmentsPage = lazy(() => import('./pages/departments').then((m) => ({ default: m.DepartmentsPage })))
const AgentsPage = lazy(() => import('./pages/agents').then((m) => ({ default: m.AgentsPage })))
const TiersPage = lazy(() => import('./pages/tiers').then((m) => ({ default: m.TiersPage })))
const OnboardingPage = lazy(() => import('./pages/onboarding').then((m) => ({ default: m.OnboardingPage })))
const N8nWorkflowsPage = lazy(() => import('./pages/n8n-workflows').then((m) => ({ default: m.N8nWorkflowsPage })))
const MarketingPipelinePage = lazy(() => import('./pages/marketing-pipeline').then((m) => ({ default: m.MarketingPipelinePage })))
const MarketingApprovalPage = lazy(() => import('./pages/marketing-approval').then((m) => ({ default: m.MarketingApprovalPage })))
const MemoriesPage = lazy(() => import('./pages/memories').then((m) => ({ default: m.MemoriesPage })))
const OrganizationPage = lazy(() => import('./pages/organization').then((m) => ({ default: m.OrganizationPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = window.location.pathname
  if (!isAuthenticated) {
    const redirect = location !== '/' ? `?redirect=${encodeURIComponent(location)}` : ''
    return <Navigate to={`/login${redirect}`} replace />
  }
  return <>{children}</>
}

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<SuspensePage><LoginPage /></SuspensePage>}
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <SuspensePage><OnboardingPage /></SuspensePage>
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/hub" replace />} />

            {/* ═══ GROUP 1: Hub (dashboard, overview) ═══ */}
            <Route path="hub" element={<SuspensePage><HubPage /></SuspensePage>} />
            <Route path="dashboard" element={<SuspensePage><DashboardPage /></SuspensePage>} />

            {/* ═══ GROUP 2: Workspace (chat, organization, agents, departments, tiers) ═══ */}
            <Route path="chat" element={<SuspensePage><ChatPage /></SuspensePage>} />
            <Route path="organization" element={<SuspensePage><OrganizationPage /></SuspensePage>} />
            <Route path="agents" element={<SuspensePage><AgentsPage /></SuspensePage>} />
            <Route path="departments" element={<SuspensePage><DepartmentsPage /></SuspensePage>} />
            <Route path="tiers" element={<SuspensePage><TiersPage /></SuspensePage>} />
            <Route path="nexus" element={<SuspensePage><NexusPage /></SuspensePage>} />
            <Route path="agora" element={<SuspensePage><AgoraPage /></SuspensePage>} />
            <Route path="memories" element={<SuspensePage><MemoriesPage /></SuspensePage>} />
            <Route path="messenger" element={<SuspensePage><MessengerPage /></SuspensePage>} />

            {/* ═══ GROUP 3: Library (documents, knowledge) ═══ */}
            <Route path="knowledge" element={<SuspensePage><KnowledgePage /></SuspensePage>} />
            <Route path="files" element={<SuspensePage><FilesPage /></SuspensePage>} />
            <Route path="classified" element={<SuspensePage><ClassifiedPage /></SuspensePage>} />
            <Route path="reports" element={<SuspensePage><ReportsPage /></SuspensePage>} />
            <Route path="reports/:id" element={<SuspensePage><ReportsPage /></SuspensePage>} />

            {/* ═══ GROUP 4: ARGOS (jobs, schedules, monitoring) ═══ */}
            <Route path="jobs" element={<SuspensePage><JobsPage /></SuspensePage>} />
            <Route path="n8n-workflows" element={<SuspensePage><N8nWorkflowsPage /></SuspensePage>} />
            <Route path="marketing-pipeline" element={<SuspensePage><MarketingPipelinePage /></SuspensePage>} />
            <Route path="marketing-approval" element={<SuspensePage><MarketingApprovalPage /></SuspensePage>} />

            {/* ═══ GROUP 5: Activity (logs, notifications, costs) ═══ */}
            <Route path="activity-log" element={<SuspensePage><ActivityLogPage /></SuspensePage>} />
            <Route path="ops-log" element={<SuspensePage><OpsLogPage /></SuspensePage>} />
            <Route path="notifications" element={<SuspensePage><NotificationsPage /></SuspensePage>} />
            <Route path="costs" element={<SuspensePage><CostsPage /></SuspensePage>} />
            <Route path="performance" element={<SuspensePage><PerformancePage /></SuspensePage>} />
            <Route path="sns" element={<SuspensePage><SnsPage /></SuspensePage>} />
            <Route path="trading" element={<SuspensePage><TradingPage /></SuspensePage>} />

            {/* ═══ GROUP 6: Settings ═══ */}
            <Route path="settings" element={<SuspensePage><SettingsPage /></SuspensePage>} />

            {/* ═══ REDIRECTS: Legacy paths → canonical paths ═══ */}
            <Route path="command-center" element={<Navigate to="/hub" replace />} />
            <Route path="org" element={<Navigate to="/organization" replace />} />
            <Route path="cron" element={<Navigate to="/jobs" replace />} />
            <Route path="argos" element={<Navigate to="/jobs" replace />} />
            <Route path="workflows" element={<Navigate to="/n8n-workflows" replace />} />
            <Route path="home" element={<Navigate to="/hub" replace />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-6xl font-mono font-black text-corthex-text-disabled">404</p>
                <p className="text-sm font-mono text-corthex-text-secondary">페이지를 찾을 수 없습니다</p>
                <a href="/hub" className="text-xs font-mono text-corthex-accent hover:underline">허브로 돌아가기</a>
              </div>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
