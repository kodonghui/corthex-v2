import { useEffect } from 'react'
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

export function Layout() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)

  const { data: companyData } = useQuery({
    queryKey: ['company-detail', selectedCompanyId],
    queryFn: () => api.get<{ data: Company }>(`/admin/companies/${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
  })

  const company = companyData?.data
  const isOnboardingPage = location.pathname === '/onboarding'

  // Auto-redirect to onboarding if not completed
  useEffect(() => {
    if (!company || isOnboardingPage) return
    const settings = company.settings || {}
    if (settings.onboardingCompleted !== true) {
      navigate('/onboarding', { replace: true })
    }
  }, [company, isOnboardingPage, navigate])

  return (
    <div className="flex h-screen bg-[#faf8f5] dark:bg-zinc-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
      <AdminBudgetAlertListener />
      <ToastContainer />
    </div>
  )
}
