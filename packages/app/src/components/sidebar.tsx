import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'

const navItems = [
  { to: '/', label: '홈', icon: '🏠' },
  { to: '/chat', label: '채팅', icon: '💬' },
  { to: '/reports', label: '보고서', icon: '📄' },
  { to: '/settings', label: '설정', icon: '⚙️' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="w-60 h-screen border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      {/* 로고 */}
      <div className="px-4 py-5 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-lg font-bold tracking-tight">CORTHEX</h1>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 유저 정보 */}
      <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.name}</p>
            <p className="text-xs text-zinc-500">{user?.role === 'admin' ? '관리자' : '유저'}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            로그아웃
          </button>
        </div>
      </div>
    </aside>
  )
}
