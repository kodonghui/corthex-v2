import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

declare const __BUILD_NUMBER__: string
declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

type NavItem = { to: string; label: string; icon: string }
type NavSection = { label?: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    items: [
      { to: '/', label: '홈', icon: '🏠' },
    ],
  },
  {
    label: '업무',
    items: [
      { to: '/chat', label: '채팅', icon: '💬' },
      { to: '/trading', label: '전략실', icon: '📈' },
      { to: '/jobs', label: '야간작업', icon: '🌙' },
      { to: '/reports', label: '보고서', icon: '📄' },
      { to: '/files', label: '파일', icon: '📁' },
    ],
  },
  {
    label: '운영',
    items: [
      { to: '/sns', label: 'SNS', icon: '📱' },
      { to: '/messenger', label: '메신저', icon: '💭' },
      { to: '/dashboard', label: '대시보드', icon: '📊' },
      { to: '/ops-log', label: '작전일지', icon: '📋' },
      { to: '/nexus', label: 'NEXUS', icon: '🔗' },
    ],
  },
  {
    label: '시스템',
    items: [
      { to: '/notifications', label: '알림', icon: '🔔' },
      { to: '/settings', label: '설정', icon: '⚙️' },
    ],
  },
]

export function Sidebar({ onNavClick }: { onNavClick?: () => void }) {
  const { user, logout } = useAuthStore()
  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => api.get<{ data: { unread: number } }>('/workspace/notifications/count'),
    refetchInterval: 30000,
    enabled: !!user,
  })
  const unreadCount = countData?.data?.unread ?? 0

  return (
    <aside className="w-60 h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* 로고 */}
      <div className="px-4 h-14 flex items-center border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            C
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">CORTHEX</span>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`
                  }
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/notifications' && unreadCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* 유저 정보 */}
      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between px-2">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.name}</p>
            <p className="text-xs text-zinc-500">{user?.role === 'admin' ? '관리자' : '유저'}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
        <div className="px-2 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
          #{__BUILD_NUMBER__}{__BUILD_HASH__ ? ` · ${__BUILD_HASH__}` : ''}
        </div>
      </div>
    </aside>
  )
}
