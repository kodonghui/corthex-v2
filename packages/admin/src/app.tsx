import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/auth-store'
import { Layout } from './components/layout'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'
import { UsersPage } from './pages/users'
import { DepartmentsPage } from './pages/departments'
import { AgentsPage } from './pages/agents'
import { CredentialsPage } from './pages/credentials'
import { CompaniesPage } from './pages/companies'
import { ToolsPage } from './pages/tools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

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

  // expose for potential future use
  ;(window as unknown as Record<string, unknown>).__toggleDark = () => setDark((d) => !d)

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="credentials" element={<CredentialsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="tools" element={<ToolsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
