import { useState, useEffect, useCallback, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { useAuthStore } from '../stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ToastProvider } from '@corthex/ui'
import { NotificationListener } from './notification-listener'
import { NightJobListener } from './night-job-listener'
import { BudgetAlertListener } from './budget-alert-listener'
import { InstallBanner } from './install-banner'
import { PushPermission } from './push-permission'
import { Menu, ChevronRight, Search, Bell } from 'lucide-react'

const PAGE_NAMES: Record<string, string> = {
  hub: 'Hub',
  dashboard: 'Dashboard',
  chat: 'Chat',
  nexus: 'NEXUS',
  sketchvibe: 'SketchVibe',
  agents: 'Agents',
  departments: 'Departments',
  jobs: 'Jobs',
  tiers: 'Tiers',
  reports: 'Reports',
  workflows: 'Workflows',
  sns: 'SNS',
  trading: 'Trading',
  messenger: 'Messenger',
  knowledge: 'Library',
  agora: 'AGORA',
  files: 'Files',
  costs: 'Costs',
  performance: 'Performance',
  'activity-log': 'Activity Log',
  'ops-log': 'Ops Log',
  classified: 'Classified',
  settings: 'Settings',
  memories: 'Memory Dashboard',
  notifications: 'Notifications',
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('corthex_sidebar_collapsed') === 'true' } catch { return false }
  })
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const navigate = useNavigate()

  const pageName = useMemo(() => {
    const segment = location.pathname.split('/').filter(Boolean)[0] || 'hub'
    return PAGE_NAMES[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }, [location.pathname])

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get<{ data: { unread: number } }>('/workspace/notifications/count'),
    refetchInterval: 30000,
    enabled: !!user,
  })
  const hasUnread = (notifData?.data?.unread ?? 0) > 0

  const closeSidebar = useCallback(() => {
    if (!sidebarOpen) return
    setClosing(true)
    setTimeout(() => {
      setSidebarOpen(false)
      setClosing(false)
    }, 200)
  }, [sidebarOpen])

  const toggleCollapse = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try { localStorage.setItem('corthex_sidebar_collapsed', String(next)) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
    setClosing(false)
  }, [location.pathname])

  useEffect(() => {
    if (!sidebarOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
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
    <ToastProvider>
    <NotificationListener />
    <NightJobListener />
    <BudgetAlertListener />
    <div className="h-screen flex flex-col lg:flex-row bg-[#faf8f5] text-[#1a1a1a]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile top bar */}
      <header className="lg:hidden flex flex-col sticky top-0 z-30 shrink-0 bg-white border-b border-[#e5e1d3]">
        <div className="h-[env(safe-area-inset-top)]" />
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={openSidebar}
              className="p-1.5 -ml-1.5 rounded-lg hover:bg-[#f5f0e8] transition-colors"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5 text-[#6b705c]" />
            </button>
            <span className="text-lg font-semibold tracking-tight text-[#1a1a1a]">CORTHEX</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[#6b705c] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-colors"
              aria-label="알림"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#606C38] border-2 border-white" />
              )}
            </button>
            <div className="w-7 h-7 rounded-full bg-[#606C38] text-white flex items-center justify-center text-xs font-medium">
              {user?.name?.charAt(0) || '?'}
            </div>
          </div>
        </div>
      </header>

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop top bar */}
        <header className="hidden lg:flex h-14 items-center justify-between px-6 border-b border-[#e5e1d3] bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#6b705c] hover:text-[#1a1a1a] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>CORTHEX</span>
            <ChevronRight className="w-4 h-4 text-[#a3a08e]" />
            <span className="font-medium text-[#1a1a1a]">{pageName}</span>
          </div>
          {/* Search + Notifications */}
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#a3a08e]" />
              <input
                className="w-full bg-[#f5f0e8] border border-[#e5e1d3] rounded-lg pl-9 pr-16 py-1.5 text-sm focus:outline-none focus:border-[#606C38] focus:ring-1 focus:ring-[#606C38] transition-all placeholder:text-[#a3a08e] text-[#1a1a1a] h-8"
                placeholder="Search..."
                type="text"
                readOnly
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="inline-flex items-center px-1.5 font-mono text-[10px] text-[#6b705c] bg-[#e5e1d3] border border-[#d4cfc4] rounded">Ctrl</kbd>
                <kbd className="inline-flex items-center px-1.5 font-mono text-[10px] text-[#6b705c] bg-[#e5e1d3] border border-[#d4cfc4] rounded">K</kbd>
              </div>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-8 h-8 flex items-center justify-center rounded-lg text-[#6b705c] hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-colors"
              aria-label="알림"
            >
              <Bell className="w-5 h-5" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#606C38] border-2 border-white" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {(sidebarOpen || closing) && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeSidebar}
          />
          <div className={`absolute inset-y-0 left-0 w-[280px] shadow-xl transition-transform duration-200 ease-out ${closing ? '-translate-x-full' : 'translate-x-0 animate-slide-in'}`}>
            <Sidebar onNavClick={closeSidebar} />
          </div>
        </div>
      )}
    </div>
    <InstallBanner />
    <PushPermission />
    </ToastProvider>
  )
}
