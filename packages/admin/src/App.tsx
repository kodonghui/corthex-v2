import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/auth-store'
import { Layout } from './components/layout'
import { Skeleton } from '@corthex/ui'

const LoginPage = lazy(() => import('./pages/login').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('./pages/dashboard').then((m) => ({ default: m.DashboardPage })))
const UsersPage = lazy(() => import('./pages/users').then((m) => ({ default: m.UsersPage })))
const DepartmentsPage = lazy(() => import('./pages/departments').then((m) => ({ default: m.DepartmentsPage })))
const AgentsPage = lazy(() => import('./pages/agents').then((m) => ({ default: m.AgentsPage })))
const CredentialsPage = lazy(() => import('./pages/credentials').then((m) => ({ default: m.CredentialsPage })))
const CompaniesPage = lazy(() => import('./pages/companies').then((m) => ({ default: m.CompaniesPage })))
const ToolsPage = lazy(() => import('./pages/tools').then((m) => ({ default: m.ToolsPage })))
const CostsPage = lazy(() => import('./pages/costs').then((m) => ({ default: m.CostsPage })))
const ReportLinesPage = lazy(() => import('./pages/report-lines').then((m) => ({ default: m.ReportLinesPage })))
const SoulTemplatesPage = lazy(() => import('./pages/soul-templates').then((m) => ({ default: m.SoulTemplatesPage })))
const MonitoringPage = lazy(() => import('./pages/monitoring').then((m) => ({ default: m.MonitoringPage })))
const OrgChartPage = lazy(() => import('./pages/org-chart').then((m) => ({ default: m.OrgChartPage })))
const OrgTemplatesPage = lazy(() => import('./pages/org-templates').then((m) => ({ default: m.OrgTemplatesPage })))
const EmployeesPage = lazy(() => import('./pages/employees').then((m) => ({ default: m.EmployeesPage })))
const SettingsPage = lazy(() => import('./pages/settings').then((m) => ({ default: m.SettingsPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
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
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  ;(window as unknown as Record<string, unknown>).__toggleDark = () => setDark((d) => !d)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
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
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>} />
            <Route path="users" element={<Suspense fallback={<PageSkeleton />}><UsersPage /></Suspense>} />
            <Route path="employees" element={<Suspense fallback={<PageSkeleton />}><EmployeesPage /></Suspense>} />
            <Route path="departments" element={<Suspense fallback={<PageSkeleton />}><DepartmentsPage /></Suspense>} />
            <Route path="agents" element={<Suspense fallback={<PageSkeleton />}><AgentsPage /></Suspense>} />
            <Route path="credentials" element={<Suspense fallback={<PageSkeleton />}><CredentialsPage /></Suspense>} />
            <Route path="companies" element={<Suspense fallback={<PageSkeleton />}><CompaniesPage /></Suspense>} />
            <Route path="tools" element={<Suspense fallback={<PageSkeleton />}><ToolsPage /></Suspense>} />
            <Route path="costs" element={<Suspense fallback={<PageSkeleton />}><CostsPage /></Suspense>} />
            <Route path="report-lines" element={<Suspense fallback={<PageSkeleton />}><ReportLinesPage /></Suspense>} />
            <Route path="soul-templates" element={<Suspense fallback={<PageSkeleton />}><SoulTemplatesPage /></Suspense>} />
            <Route path="monitoring" element={<Suspense fallback={<PageSkeleton />}><MonitoringPage /></Suspense>} />
            <Route path="org-chart" element={<Suspense fallback={<PageSkeleton />}><OrgChartPage /></Suspense>} />
            <Route path="org-templates" element={<Suspense fallback={<PageSkeleton />}><OrgTemplatesPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
