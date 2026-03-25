import { useState, useEffect, useCallback, useRef, Component, type ReactNode } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sidebar } from './sidebar'
import { ToastContainer } from './toast-container'
import { AdminBudgetAlertListener } from './budget-alert-listener'
import { useAdminStore } from '../stores/admin-store'
import { api } from '../lib/api'
import { Menu, ChevronRight } from 'lucide-react'

type Company = {
  id: string
  name: string
  settings: Record<string, unknown> | null
}

const PAGE_NAMES: Record<string, string> = {
  '': '대시보드',
  companies: '회사 관리',
  employees: '직원 관리',
  users: '사용자 관리',
  departments: '부서 관리',
  agents: 'AI 에이전트',
  tools: '도구 관리',
  costs: '비용 관리',
  credentials: 'CLI / API 키',
  'report-lines': '보고 라인',
  'soul-templates': '소울 템플릿',
  monitoring: '시스템 모니터링',
  nexus: 'NEXUS 조직도',
  sketchvibe: 'SketchVibe',
  'org-templates': '조직 템플릿',
  'template-market': '템플릿 마켓',
  'agent-marketplace': '에이전트 마켓',
  'api-keys': '공개 API 키',
  'n8n-editor': 'n8n 에디터',
  'marketing-settings': '마케팅 AI',
  'memory-management': '메모리 관리',
  'mcp-servers': 'MCP 서버',
  'mcp-access': 'MCP 접근제어',
  'mcp-credentials': 'MCP 인증정보',
  'agent-reports': '에이전트 리포트',
  settings: '설정',
  onboarding: '온보딩',
}

class PageErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 text-center">
          <p className="text-corthex-error font-bold mb-2">페이지 오류</p>
          <p className="text-sm text-corthex-text-secondary mb-4">{this.state.error.message}</p>
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-lg text-corthex-text-on-accent text-sm font-bold bg-corthex-accent"
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)

  const pageName = (() => {
    const segment = location.pathname.split('/').filter(Boolean)[0] || ''
    return PAGE_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  })()

  const { data: companyData, isFetching } = useQuery({
    queryKey: ['company-detail', selectedCompanyId],
    queryFn: () => api.get<{ data: Company }>(`/admin/companies/${selectedCompanyId}`),
    enabled: !!selectedCompanyId,
    staleTime: 2000,
  })

  const company = companyData?.data
  const isOnboardingPage = location.pathname === '/onboarding'

  useEffect(() => {
    if (!company || isOnboardingPage || isFetching) return
    const settings = company.settings || {}
    if (settings.onboardingCompleted !== true) {
      navigate('/onboarding', { replace: true })
    }
  }, [company, isOnboardingPage, isFetching, navigate])

  const closeSidebar = useCallback(() => {
    if (!sidebarOpen) return
    setClosing(true)
    setTimeout(() => {
      setSidebarOpen(false)
      setClosing(false)
    }, 200)
  }, [sidebarOpen])

  useEffect(() => {
    setSidebarOpen(false)
    setClosing(false)
  }, [location.pathname])

  const sidebarDialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sidebarOpen) return
    const dialog = sidebarDialogRef.current
    if (dialog) {
      const firstFocusable = dialog.querySelector<HTMLElement>('a, button, [tabindex]')
      firstFocusable?.focus()
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
      if (e.key === 'Tab' && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>('a, button, input, select, [tabindex]:not([tabindex="-1"])')
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  useEffect(() => {
    if (!sidebarOpen) return
    const handlePopState = () => {
      setSidebarOpen(false)
      setClosing(false)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [sidebarOpen])

  const openSidebar = () => {
    history.pushState(null, '', location.pathname + location.search + location.hash)
    setSidebarOpen(true)
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-corthex-bg text-corthex-text-primary">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden flex flex-col sticky top-0 z-30 shrink-0 bg-corthex-surface border-b border-corthex-border">
        <div className="h-[env(safe-area-inset-top)]" />
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={openSidebar}
              className="p-2.5 -ml-2.5 rounded-lg min-w-[44px] min-h-[44px] hover:bg-corthex-elevated transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5 text-corthex-text-secondary" />
            </button>
            <span className="text-lg font-semibold tracking-tight text-corthex-text-primary">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-corthex-text-secondary">{pageName}</span>
          </div>
        </div>
      </header>

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop top bar */}
        <header className="hidden lg:flex h-14 items-center justify-between px-6 border-b border-corthex-border bg-corthex-surface/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-corthex-text-secondary hover:text-corthex-text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>CORTHEX ADMIN</span>
            <ChevronRight className="w-4 h-4 text-corthex-text-disabled" />
            <span className="font-medium text-corthex-text-primary">{pageName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            <PageErrorBoundary>
              <Outlet />
            </PageErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {(sidebarOpen || closing) && (
        <div ref={sidebarDialogRef} className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="관리자 네비게이션">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeSidebar}
          />
          <div className={`absolute inset-y-0 left-0 w-[280px] shadow-xl transition-transform duration-200 ease-out ${closing ? '-translate-x-full' : 'translate-x-0'}`}>
            <Sidebar onNavClick={closeSidebar} />
          </div>
        </div>
      )}

      <AdminBudgetAlertListener />
      <ToastContainer />
    </div>
  )
}
