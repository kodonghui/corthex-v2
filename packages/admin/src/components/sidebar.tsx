import { useEffect, useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth-store'
import { useAdminStore } from '../stores/admin-store'
import { api } from '../lib/api'
import {
  LayoutDashboard, Building2, Users, UserCog, Building, Bot, Wrench,
  DollarSign, KeyRound, ClipboardList, Sparkles, Monitor,
  Orbit, FileStack, ShoppingCart, BrainCircuit, Paintbrush,
  Lock, Hexagon, Megaphone, Brain, Settings, ArrowLeftRight,
  ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

declare const __BUILD_NUMBER__: string
declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

type Company = { id: string; name: string; slug: string; isActive: boolean }

type NavItem = { to: string; label: string; icon: LucideIcon }
type NavGroup = { group: string; items: NavItem[] }

const nav: NavGroup[] = [
  {
    group: '조직 관리',
    items: [
      { to: '/', label: '대시보드', icon: LayoutDashboard },
      { to: '/companies', label: '회사 관리', icon: Building2 },
      { to: '/employees', label: '직원 관리', icon: Users },
      { to: '/users', label: '사용자 관리', icon: UserCog },
      { to: '/departments', label: '부서 관리', icon: Building },
      { to: '/report-lines', label: '보고 라인', icon: ClipboardList },
      { to: '/nexus', label: 'NEXUS 조직도', icon: Orbit },
    ],
  },
  {
    group: 'AI 관리',
    items: [
      { to: '/agents', label: 'AI 에이전트', icon: Bot },
      { to: '/soul-templates', label: '소울 템플릿', icon: Sparkles },
      { to: '/tools', label: '도구 관리', icon: Wrench },
      { to: '/memory-management', label: '메모리 관리', icon: Brain },
    ],
  },
  {
    group: '운영',
    items: [
      { to: '/costs', label: '비용 관리', icon: DollarSign },
      { to: '/credentials', label: 'CLI / API 키', icon: KeyRound },
      { to: '/monitoring', label: '시스템 모니터링', icon: Monitor },
    ],
  },
  {
    group: '마켓플레이스',
    items: [
      { to: '/org-templates', label: '조직 템플릿', icon: FileStack },
      { to: '/template-market', label: '템플릿 마켓', icon: ShoppingCart },
      { to: '/agent-marketplace', label: '에이전트 마켓', icon: BrainCircuit },
      { to: '/api-keys', label: '공개 API 키', icon: Lock },
    ],
  },
  {
    group: '기타',
    items: [
      { to: '/sketchvibe', label: 'SketchVibe', icon: Paintbrush },
      { to: '/n8n-editor', label: 'n8n 에디터', icon: Hexagon },
      { to: '/marketing-settings', label: '마케팅 AI 엔진', icon: Megaphone },
    ],
  },
]

function NavGroups({ nav: groups, onNavClick }: { nav: NavGroup[]; onNavClick?: () => void }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = useCallback((group: string) => {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }))
  }, [])

  return (
    <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
      {groups.map((g) => {
        const isCollapsed = collapsed[g.group] ?? false
        return (
          <div key={g.group}>
            <button
              type="button"
              onClick={() => toggle(g.group)}
              className="flex items-center justify-between w-full px-3 py-1 uppercase text-[10px] tracking-widest text-corthex-sidebar-text/50 hover:text-corthex-sidebar-text/80 transition-colors"
            >
              <span>{g.group}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              />
            </button>
            {!isCollapsed && (
              <div className="mt-1 space-y-1">
                {g.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={onNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-corthex-accent ${
                          isActive
                            ? 'bg-corthex-sidebar-active text-corthex-sidebar-text-active font-medium'
                            : 'text-corthex-sidebar-text hover:bg-corthex-sidebar-hover hover:text-corthex-sidebar-text-active'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}

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
      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-corthex-accent-hover bg-corthex-accent/20 hover:bg-corthex-accent/30"
    >
      <ArrowLeftRight className="w-4 h-4" />
      <span>{switching ? '전환 중...' : 'CEO 앱으로 전환'}</span>
    </button>
  )
}

export function Sidebar({ onNavClick }: { onNavClick?: () => void } = {}) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const selectedCompanyId = useAdminStore((s) => s.selectedCompanyId)
  const setSelectedCompanyId = useAdminStore((s) => s.setSelectedCompanyId)

  const { data: companyData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: () => api.get<{ data: Company[] }>('/admin/companies'),
  })

  const companies = companyData?.data || []

  // 회사 미선택 또는 선택된 회사가 목록에 없으면 첫 번째 회사 자동 선택
  useEffect(() => {
    if (companiesLoading) return
    if (companies.length === 0) {
      if (selectedCompanyId) setSelectedCompanyId(null)
      return
    }
    const found = companies.find((c) => c.id === selectedCompanyId)
    if (!found) {
      setSelectedCompanyId(companies[0].id)
    }
  }, [selectedCompanyId, companies, companiesLoading, setSelectedCompanyId])

  return (
    <aside className="w-60 h-screen flex flex-col bg-corthex-sidebar-bg text-corthex-sidebar-text">
      <div className="p-4 border-b border-corthex-sidebar-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-corthex-sidebar-brand/30 text-corthex-sidebar-text flex items-center justify-center text-sm font-bold">
            C
          </div>
          <div>
            <p className="text-sm font-bold text-corthex-sidebar-text-active">CORTHEX</p>
            <p className="text-xs text-corthex-sidebar-text">Admin Console</p>
          </div>
        </div>

        {/* 회사 선택 드롭다운 */}
        {companies.length > 0 ? (
          <select
            value={selectedCompanyId || ''}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-2 py-1.5 text-xs border border-corthex-sidebar-border rounded-lg bg-corthex-sidebar-bg text-corthex-sidebar-text-active focus:ring-2 focus:ring-corthex-accent/40 focus:outline-none"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : companiesLoading ? (
          <div className="w-full px-2 py-1.5 text-xs text-corthex-sidebar-text animate-pulse">
            회사 로딩중...
          </div>
        ) : (
          <div className="w-full px-2 py-1.5 text-xs text-corthex-sidebar-text/60">
            등록된 회사 없음
          </div>
        )}
      </div>

      <NavGroups nav={nav} onNavClick={onNavClick} />

      <div className="p-3 border-t border-corthex-sidebar-border space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-corthex-accent/30 text-corthex-border font-medium'
                : 'text-corthex-accent-hover hover:bg-corthex-accent/20 hover:text-corthex-border'
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>회사 설정</span>
        </NavLink>
        <SwitchToCeoButton companyId={selectedCompanyId} />
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <p className="text-sm font-medium text-corthex-sidebar-text-active">{user?.name}</p>
            <p className="text-xs text-corthex-sidebar-text">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-corthex-sidebar-text hover:text-red-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
        <div className="px-3 text-[10px] text-corthex-sidebar-text/50 font-mono">
          #{__BUILD_NUMBER__}{__BUILD_HASH__ ? ` · ${__BUILD_HASH__}` : ''}
        </div>
      </div>
    </aside>
  )
}
