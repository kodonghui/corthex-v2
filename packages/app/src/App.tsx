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

const queryClient = new QueryClient()

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

export function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    const stored = localStorage.getItem('corthex_theme') as 'system' | 'light' | 'dark' | null
    const theme = stored || 'system'
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', dark)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Suspense fallback={<PageSkeleton />}><HomePage /></Suspense>} />
            <Route path="hub" element={<Suspense fallback={<PageSkeleton />}><HubPage /></Suspense>} />
            <Route path="command-center" element={<Suspense fallback={<PageSkeleton />}><CommandCenterPage /></Suspense>} />
            <Route path="chat" element={<Suspense fallback={<PageSkeleton />}><ChatPage /></Suspense>} />
            <Route path="jobs" element={<Suspense fallback={<PageSkeleton />}><JobsPage /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<PageSkeleton />}><ReportsPage /></Suspense>} />
            <Route path="reports/:id" element={<Suspense fallback={<PageSkeleton />}><ReportsPage /></Suspense>} />
            <Route path="sns" element={<Suspense fallback={<PageSkeleton />}><SnsPage /></Suspense>} />
            <Route path="messenger" element={<Suspense fallback={<PageSkeleton />}><MessengerPage /></Suspense>} />
            <Route path="dashboard" element={<Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>} />
            <Route path="ops-log" element={<Suspense fallback={<PageSkeleton />}><OpsLogPage /></Suspense>} />
            <Route path="nexus" element={<Suspense fallback={<PageSkeleton />}><NexusPage /></Suspense>} />
            <Route path="trading" element={<Suspense fallback={<PageSkeleton />}><TradingPage /></Suspense>} />
            <Route path="files" element={<Suspense fallback={<PageSkeleton />}><FilesPage /></Suspense>} />
            <Route path="org" element={<Suspense fallback={<PageSkeleton />}><OrgPage /></Suspense>} />
            <Route path="notifications" element={<Suspense fallback={<PageSkeleton />}><NotificationsPage /></Suspense>} />
            <Route path="activity-log" element={<Suspense fallback={<PageSkeleton />}><ActivityLogPage /></Suspense>} />
            <Route path="costs" element={<Suspense fallback={<PageSkeleton />}><CostsPage /></Suspense>} />
            <Route path="cron" element={<Suspense fallback={<PageSkeleton />}><CronBasePage /></Suspense>} />
            <Route path="argos" element={<Suspense fallback={<PageSkeleton />}><ArgosPage /></Suspense>} />
            <Route path="agora" element={<Suspense fallback={<PageSkeleton />}><AgoraPage /></Suspense>} />
            <Route path="classified" element={<Suspense fallback={<PageSkeleton />}><ClassifiedPage /></Suspense>} />
            <Route path="knowledge" element={<Suspense fallback={<PageSkeleton />}><KnowledgePage /></Suspense>} />
            <Route path="performance" element={<Suspense fallback={<PageSkeleton />}><PerformancePage /></Suspense>} />
            <Route path="departments" element={<Suspense fallback={<PageSkeleton />}><DepartmentsPage /></Suspense>} />
            <Route path="agents" element={<Suspense fallback={<PageSkeleton />}><AgentsPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
