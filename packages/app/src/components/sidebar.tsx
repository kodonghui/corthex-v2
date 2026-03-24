import { useState, useCallback } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/auth-store'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  LayoutDashboard, Terminal, MessageSquare, TrendingUp, Users,
  Clock, FileText, FolderOpen, Network, Building2, Bot, Layers, Share2,
  Send, DollarSign, History, Shield, Lock, BookOpen,
  Settings, BarChart3, Hexagon,
} from 'lucide-react'

declare const __BUILD_NUMBER__: string
declare const __BUILD_HASH__: string
declare const __BUILD_TIME__: string

type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> }
type NavSection = { label?: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    label: 'COMMAND',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/hub', label: '허브', icon: Terminal },
      { to: '/nexus', label: 'NEXUS', icon: Network },
      { to: '/chat', label: '채팅', icon: MessageSquare },
    ],
  },
  {
    label: 'ORGANIZATION',
    items: [
      { to: '/agents', label: '에이전트', icon: Bot },
      { to: '/departments', label: '부서', icon: Building2 },
      { to: '/jobs', label: '작업', icon: Clock },
      { to: '/tiers', label: '티어', icon: Layers },
      { to: '/reports', label: '보고서', icon: FileText },
    ],
  },
  {
    label: 'TOOLS',
    items: [
      { to: '/n8n-workflows', label: '워크플로우', icon: Hexagon },
      { to: '/sns', label: 'SNS', icon: Share2 },
      { to: '/trading', label: '전략실', icon: TrendingUp },
      { to: '/messenger', label: '메신저', icon: Send },
      { to: '/knowledge', label: '라이브러리', icon: BookOpen },
      { to: '/agora', label: 'AGORA', icon: Users },
      { to: '/files', label: '파일', icon: FolderOpen },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/costs', label: '비용', icon: DollarSign },
      { to: '/performance', label: '전력분석', icon: BarChart3 },
      { to: '/activity-log', label: '통신로그', icon: History },
      { to: '/ops-log', label: '작전일지', icon: Shield },
      { to: '/classified', label: '기밀문서', icon: Lock },
      { to: '/settings', label: '설정', icon: Settings },
    ],
  },
]

function SwitchToAdminButton() {
  const [switching, setSwitching] = useState(false)
  const { data: canSwitchData } = useQuery({
    queryKey: ['can-switch-admin'],
    queryFn: () => api.get<{ data: { canSwitch: boolean } }>('/auth/can-switch-admin'),
    staleTime: 5 * 60 * 1000,
  })

  const canSwitch = canSwitchData?.data?.canSwitch ?? false

  const handleSwitch = useCallback(async () => {
    if (!canSwitch || switching) return
    setSwitching(true)
    try {
      const res = await api.post<{ data: { token: string; user: { id: string; name: string; role: string }; targetUrl: string } }>('/auth/switch-app', {
        targetApp: 'admin',
      })
      localStorage.setItem('corthex_admin_token', res.data.token)
      localStorage.setItem('corthex_admin_user', JSON.stringify(res.data.user))
      window.location.href = res.data.targetUrl
    } catch (err) {
      setSwitching(false)
      alert(err instanceof Error ? err.message : '앱 전환에 실패했습니다')
    }
  }, [canSwitch, switching])

  if (!canSwitch) return null

  return (
    <button
      onClick={handleSwitch}
      disabled={switching}
      className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors text-[#c5d8a4] bg-white/10 hover:bg-white/15"
    >
      <span>⇄</span>
      <span>{switching ? '전환 중...' : '관리자 콘솔'}</span>
    </button>
  )
}

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
    <aside className="w-[280px] h-full flex flex-col bg-[#283618] border-r border-[#3a4d28] shrink-0">
      {/* Brand */}
      <div className="h-14 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#606C38]/30 flex items-center justify-center text-[#c5d8a4]">
            <Hexagon className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-widest text-sm leading-tight text-white">CORTHEX</span>
            <span className="text-[10px] text-[#a3c48a] font-mono uppercase tracking-wider">Management Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
        {navSections.map((section, si) => (
          <div key={si} className="flex flex-col gap-1">
            {section.label && (
              <span className="px-3 text-[11px] font-mono text-[#a3c48a] uppercase tracking-widest mb-1">
                {section.label}
              </span>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-[#a3c48a] hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
                {item.to === '/notifications' && unreadCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User Context */}
      <div className="p-4 border-t border-white/10 shrink-0 space-y-2">
        <SwitchToAdminButton />
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
          <div className="w-8 h-8 rounded-full bg-[#606C38] text-white flex items-center justify-center text-xs font-medium shrink-0">
            {user?.name?.charAt(0) || '?'}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-sm font-medium text-white truncate">{user?.name}</span>
            <span className="text-xs text-[#a3c48a] truncate">{user?.role === 'admin' ? 'System Administrator' : 'User'}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-[#a3c48a]/70 hover:text-red-400 transition-colors shrink-0"
            aria-label="로그아웃"
          >
            로그아웃
          </button>
        </div>
        <div className="px-2 text-[10px] text-[#a3c48a]/50 font-mono">
          #{__BUILD_NUMBER__}{__BUILD_HASH__ ? ` · ${__BUILD_HASH__}` : ''}
        </div>
      </div>
    </aside>
  )
}
