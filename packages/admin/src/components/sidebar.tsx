import { useEffect, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth-store'
import { useAdminStore } from '../stores/admin-store'
import { api } from '../lib/api'

declare const __BUILD_NUMBER__: string
declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

type Company = { id: string; name: string; slug: string }

const nav = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/companies', label: '회사 관리', icon: '🏛️' },
  { to: '/employees', label: '직원 관리', icon: '👥' },
  { to: '/departments', label: '부서 관리', icon: '🏢' },
  { to: '/agents', label: 'AI 에이전트', icon: '🤖' },
  { to: '/tools', label: '도구 관리', icon: '🔧' },
  { to: '/costs', label: '비용 관리', icon: '💰' },
  { to: '/credentials', label: 'CLI / API 키', icon: '🔑' },
  { to: '/report-lines', label: '보고 라인', icon: '📋' },
  { to: '/soul-templates', label: '소울 템플릿', icon: '✨' },
  { to: '/monitoring', label: '시스템 모니터링', icon: '🖥️' },
  { to: '/org-chart', label: '조직도', icon: '🏗️' },
  { to: '/org-templates', label: '조직 템플릿', icon: '📋' },
]

function SwitchToCeoButton({ companyId }: { companyId: string | null }) {
  const [switching, setSwitching] = useState(false)

  const handleSwitch = useCallback(async () => {
    if (!companyId || switching) return
    setSwitching(true)
    try {
      const res = await api.post<{ data: { token: string; user: { id: string; name: string; role: string; companyId: string }; targetUrl: string } }>('/auth/switch-app', {
        targetApp: 'ceo',
        companyId,
      })
      // CEO 앱 localStorage에 토큰 저장
      localStorage.setItem('corthex_token', res.data.token)
      localStorage.setItem('corthex_user', JSON.stringify(res.data.user))
      window.location.href = res.data.targetUrl
    } catch (err) {
      setSwitching(false)
      alert(err instanceof Error ? err.message : '앱 전환에 실패했습니다')
    }
  }, [companyId, switching])

  return (
    <button
      onClick={handleSwitch}
      disabled={!companyId || switching}
      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900"
    >
      <span>⇄</span>
      <span>{switching ? '전환 중...' : 'CEO 앱으로 전환'}</span>
    </button>
  )
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const setSelectedCompanyId = useAdminStore((s) => s.setSelectedCompanyId)

  const { data: companyData } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<{ data: Company[] }>('/admin/companies'),
  })

  const companies = companyData?.data || []

  // 회사 미선택 시 첫 번째 회사 자동 선택
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(companies[0].id)
    }
  }, [selectedCompanyId, companies, setSelectedCompanyId])

  return (
    <aside className="w-60 h-screen flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
            C
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">CORTHEX</p>
            <p className="text-xs text-zinc-500">Admin Console</p>
          </div>
        </div>

        {/* 회사 선택 드롭다운 */}
        {companies.length > 0 && (
          <select
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
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
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`
          }
        >
          <span>{'⚙️'}</span>
          <span>회사 설정</span>
        </NavLink>
        <SwitchToCeoButton companyId={selectedCompanyId} />
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
          #{__BUILD_NUMBER__}{__BUILD_HASH__ ? ` · ${__BUILD_HASH__}` : ''}
        </div>
      </div>
    </aside>
  )
}
