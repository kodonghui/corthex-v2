import { useEffect, Component, type ReactNode } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './sidebar'
import { ToastContainer } from './toast-container'
import { AdminBudgetAlertListener } from './budget-alert-listener'
import { useAdminStore } from '../stores/admin-store'
import { api } from '../lib/api'

type Company = {
  id: string
  name: string
  settings: Record<string, unknown> | null
}

class PageErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center">
          <p className="text-red-600 font-bold mb-2">페이지 오류</p>
          <p className="text-sm text-corthex-text-secondary mb-4">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-lg text-white text-sm font-bold bg-corthex-accent"
          >
            다시 시도
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)

  const { data: companyData, isFetching } = useQuery({
    queryKey: ['company-detail', selectedCompanyId],
    queryFn: () => api.get<{ data: Company }>(`/admin/companies/${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
    staleTime: 2000, // prevent immediate re-fetch race after onboarding completion
  })

  const company = companyData?.data
  const isOnboardingPage = location.pathname === '/onboarding'

  // Auto-redirect to onboarding if not completed
  // Wait for fresh data (isFetching=false) to avoid redirect based on stale cache
  useEffect(() => {
    if (!company || isOnboardingPage || isFetching) return
    const settings = company.settings || {}
    if (settings.onboardingCompleted !== true) {
      navigate('/onboarding', { replace: true })
    }
  }, [company, isOnboardingPage, isFetching, navigate])

  return (
    <div className="flex h-screen bg-corthex-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <PageErrorBoundary>
            <Outlet />
          </PageErrorBoundary>
        </div>
      </main>
      <AdminBudgetAlertListener />
      <ToastContainer />
    </div>
  )
}
