import { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { useAuthStore } from '../stores/auth-store'
import { ToastProvider } from '@corthex/ui'
import { NotificationListener } from './notification-listener'
import { NightJobListener } from './night-job-listener'
import { BudgetAlertListener } from './budget-alert-listener'
import { InstallBanner } from './install-banner'
import { PushPermission } from './push-permission'
import { Menu } from 'lucide-react'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

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
    <div className="h-screen flex flex-col lg:flex-row bg-[#020617] text-slate-50">
      {/* 데스크톱 사이드바 (lg 이상) */}
      <div className="hidden lg:block border-r border-slate-800">
        <Sidebar />
      </div>

      {/* 모바일 상단바 (lg 미만) */}
      <header className="lg:hidden flex flex-col sticky top-0 z-30 shrink-0 bg-slate-900 border-b border-slate-800">
        <div className="h-[env(safe-area-inset-top)]" />
        <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={openSidebar}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>
          <span className="text-lg font-semibold tracking-tight text-slate-50">CORTHEX</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-medium">
          {user?.name?.charAt(0) || '?'}
        </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* 모바일 사이드바 오버레이 */}
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
