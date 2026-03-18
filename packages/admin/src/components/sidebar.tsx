import { useEffect, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth-store'
import { useAdminStore } from '../stores/admin-store'
import { api } from '../lib/api'
import {
  LayoutDashboard, Building2, Users, Building, Bot, Wrench,
  DollarSign, KeyRound, ClipboardList, Sparkles, Monitor,
  Network, Orbit, FileStack, ShoppingCart, BrainCircuit,
  Lock, Zap, Settings, ArrowLeftRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

declare const __BUILD_NUMBER__: string
declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

type Company = { id: string; name: string; slug: string; isActive: boolean }

const nav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: '대시보드', icon: LayoutDashboard },
  { to: '/companies', label: '회사 관리', icon: Building2 },
  { to: '/employees', label: '직원 관리', icon: Users },
  { to: '/departments', label: '부서 관리', icon: Building },
  { to: '/agents', label: 'AI 에이전트', icon: Bot },
  { to: '/tools', label: '도구 관리', icon: Wrench },
  { to: '/costs', label: '비용 관리', icon: DollarSign },
  { to: '/credentials', label: 'CLI / API 키', icon: KeyRound },
  { to: '/report-lines', label: '보고 라인', icon: ClipboardList },
  { to: '/soul-templates', label: '소울 템플릿', icon: Sparkles },
  { to: '/monitoring', label: '시스템 모니터링', icon: Monitor },
  { to: '/org-chart', label: '조직도', icon: Network },
  { to: '/nexus', label: 'NEXUS 조직도', icon: Orbit },
  { to: '/org-templates', label: '조직 템플릿', icon: FileStack },
  { to: '/template-market', label: '템플릿 마켓', icon: ShoppingCart },
  { to: '/agent-marketplace', label: '에이전트 마켓', icon: BrainCircuit },
  { to: '/api-keys', label: '공개 API 키', icon: Lock },
  { to: '/workflows', label: '워크플로우', icon: Zap },
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
      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[#a3c48a] bg-[#5a7247]/20 hover:bg-[#5a7247]/30"
    >
      <ArrowLeftRight className="w-4 h-4" />
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
    <aside className="w-60 h-screen flex flex-col bg-[#283618] text-[#a3c48a]">
      <div className="p-4 border-b border-[#3a5a1c]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#5a7247] text-white flex items-center justify-center text-sm font-bold">
            C
          </div>
          <div>
            <p className="text-sm font-bold text-[#e5e1d3]">CORTHEX</p>
            <p className="text-xs text-[#8fae7a]">Admin Console</p>
          </div>
        </div>

        {/* 회사 선택 드롭다운 */}
        {companies.length > 0 && (
          <select
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-[#3a5a1c] rounded-lg bg-[#1e2b12] text-[#e5e1d3] focus:ring-2 focus:ring-[#5a7247]/40 focus:outline-none"
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
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#5a7247]/30 text-[#e5e1d3] font-medium'
                    : 'text-[#a3c48a] hover:bg-[#5a7247]/20 hover:text-[#e5e1d3]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[#3a5a1c] space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-[#5a7247]/30 text-[#e5e1d3] font-medium'
                : 'text-[#a3c48a] hover:bg-[#5a7247]/20 hover:text-[#e5e1d3]'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>회사 설정</span>
        </NavLink>
        <SwitchToCeoButton companyId={selectedCompanyId} />
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-sm font-medium text-[#e5e1d3]">{user?.name}</p>
            <p className="text-xs text-[#8fae7a]">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-[#8fae7a] hover:text-red-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
        <div className="px-3 text-[10px] text-[#5a7247] font-mono">
          #{__BUILD_NUMBER__}{__BUILD_HASH__ ? ` · ${__BUILD_HASH__}` : ''}
        </div>
      </div>
    </aside>
  )
}
