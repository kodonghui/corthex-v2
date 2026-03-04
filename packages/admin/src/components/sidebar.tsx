import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'

declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

const nav = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/companies', label: '회사 관리', icon: '🏛️' },
  { to: '/users', label: '직원 관리', icon: '👥' },
  { to: '/departments', label: '부서 관리', icon: '🏢' },
  { to: '/agents', label: 'AI 에이전트', icon: '🤖' },
  { to: '/tools', label: '도구 관리', icon: '🔧' },
  { to: '/credentials', label: 'CLI / API 키', icon: '🔑' },
  { to: '/report-lines', label: '보고 라인', icon: '📋' },
]

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="w-60 h-screen flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            C
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">CORTHEX</p>
            <p className="text-xs text-zinc-500">Admin Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user?.name}</p>
            <p className="text-xs text-zinc-500">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
        <div className="px-3 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
          {__BUILD_HASH__} · {__BUILD_TIME__}
        </div>
      </div>
    </aside>
  )
}
