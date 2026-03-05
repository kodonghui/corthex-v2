import { useState, useEffect, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { useAuthStore } from '../stores/auth-store'

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

  // 라우트 변경 시 사이드바 즉시 닫기
  useEffect(() => {
    setSidebarOpen(false)
    setClosing(false)
  }, [location.pathname])

  // Esc 키로 사이드바 닫기
  useEffect(() => {
    if (!sidebarOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])

  // 뒤로가기로 사이드바 닫기
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
    <div className="h-screen flex flex-col lg:flex-row bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* 데스크톱 사이드바 (lg 이상) */}
      <div className="hidden lg:block border-r border-zinc-200 dark:border-zinc-800">
        <Sidebar />
      </div>

      {/* 모바일 상단바 (lg 미만) */}
      <header className="lg:hidden flex flex-col sticky top-0 z-30 shrink-0 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {/* safe area 스페이서 (노치/Dynamic Island) */}
        <div className="h-[env(safe-area-inset-top)]" />
        <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={openSidebar}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="메뉴 열기"
          >
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
              C
            </div>
            <span className="text-sm font-bold tracking-tight">CORTHEX</span>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
          {user?.name?.charAt(0) || '?'}
        </div>
        </div>
      </header>

      {/* 메인 콘텐츠 (공유) */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* 모바일 사이드바 오버레이 */}
      {(sidebarOpen || closing) && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
            onClick={closeSidebar}
          />
          <div className={`absolute inset-y-0 left-0 w-60 shadow-xl transition-transform duration-200 ease-out ${closing ? '-translate-x-full' : 'translate-x-0 animate-slide-in'}`}>
            <Sidebar onNavClick={closeSidebar} />
          </div>
        </div>
      )}
    </div>
  )
}
