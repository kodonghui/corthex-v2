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
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', dark)
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
            <Route path="chat" element={<Suspense fallback={<PageSkeleton />}><ChatPage /></Suspense>} />
            <Route path="jobs" element={<Suspense fallback={<PageSkeleton />}><JobsPage /></Suspense>} />
            <Route path="reports" element={<Suspense fallback={<PageSkeleton />}><ReportsPage /></Suspense>} />
            <Route path="sns" element={<Suspense fallback={<PageSkeleton />}><SnsPage /></Suspense>} />
            <Route path="messenger" element={<Suspense fallback={<PageSkeleton />}><MessengerPage /></Suspense>} />
            <Route path="dashboard" element={<Suspense fallback={<PageSkeleton />}><DashboardPage /></Suspense>} />
            <Route path="ops-log" element={<Suspense fallback={<PageSkeleton />}><OpsLogPage /></Suspense>} />
            <Route path="nexus" element={<Suspense fallback={<PageSkeleton />}><NexusPage /></Suspense>} />
            <Route path="settings" element={<Suspense fallback={<PageSkeleton />}><SettingsPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
