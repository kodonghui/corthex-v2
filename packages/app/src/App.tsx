import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/auth-store'
import { Layout } from './components/layout'
import { LoginPage } from './pages/login'
import { HomePage } from './pages/home'
import { ChatPage } from './pages/chat'
import { SettingsPage } from './pages/settings'
import { ReportsPage } from './pages/reports'
import { JobsPage } from './pages/jobs'
import { SnsPage } from './pages/sns'
import { MessengerPage } from './pages/messenger'
import { DashboardPage } from './pages/dashboard'
import { OpsLogPage } from './pages/ops-log'
import { NexusPage } from './pages/nexus'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function App() {
  // 다크모드 시스템 설정 감지
  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="sns" element={<SnsPage />} />
            <Route path="messenger" element={<MessengerPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="ops-log" element={<OpsLogPage />} />
            <Route path="nexus" element={<NexusPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
