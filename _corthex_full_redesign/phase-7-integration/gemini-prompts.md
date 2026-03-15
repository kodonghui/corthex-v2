# Phase 7 Gemini Prompts

아래 3개 프롬프트를 Gemini에 순서대로 붙여넣기 하세요.
각 프롬프트 실행 후 결과물을 Claude에게 주면 통합합니다.

---

## 프롬프트 1: 기존 컴포넌트 색상 일괄 교체

```
너는 React + Tailwind CSS 전문 개발자야. 아래 2개 파일의 색상 시스템을 일괄 교체해줘.

## 교체 규칙 (전부 적용)

### 색상 교체
- `zinc-950` → `slate-950` (또는 `[#020617]`)
- `zinc-900` → `slate-900` (또는 `[#0F172A]`)
- `zinc-800` → `slate-800` (또는 `[#1E293B]`)
- `zinc-700` → `slate-700` (또는 `[#334155]`)
- `zinc-600` → `slate-600`
- `zinc-500` → `slate-500`
- `zinc-400` → `slate-400` (또는 `[#94A3B8]`)
- `zinc-200` → `slate-800` (dark mode이므로 border용)
- `zinc-100` → `slate-50` (또는 `[#F8FAFC]`)
- `zinc-50` → `slate-900` (dark mode이므로 surface용)
- `indigo-600` → `cyan-400` (또는 `[#22D3EE]`)
- `indigo-700` → `cyan-400`
- `indigo-400` → `cyan-300`
- `indigo-300` → `cyan-300`
- `indigo-950` → `[rgba(34,211,238,0.10)]`
- `indigo-900` → `[rgba(34,211,238,0.15)]`
- `indigo-100` → `[rgba(34,211,238,0.10)]`
- `indigo-50` → `[rgba(34,211,238,0.10)]`
- `bg-white` → `bg-[#020617]`
- `text-white` → `text-[#020617]` (accent 버튼 위의 텍스트일 때만)

### 사이드바 너비
- `w-60` → `w-[280px]`

### 폰트
- 모든 text에 font-family는 Inter 기본 (Tailwind 기본 sans가 Inter로 설정됨)

### 아이콘 (emoji → Lucide React)
sidebar.tsx의 navSections에서 emoji icon을 Lucide React import로 교체:
- '🏠' → LayoutDashboard
- '🔗' (허브) → Terminal
- '🎖️' → Monitor
- '💬' → MessageSquare
- '📈' → TrendingUp
- '🗣️' → Users
- '🌙' → Clock
- '📄' → FileText
- '📁' → FolderOpen
- '🏢' → Network
- '🏗️' → Building2
- '🤖' → Bot
- '📊' (계층) → Layers
- '📱' → Share2
- '💭' → Send
- '📊' (작전) → Activity
- '💰' → DollarSign
- '📞' → History
- '📋' → Shield
- '🔒' → Lock
- '💪' → Activity (중복이면 BarChart3)
- '📚' → BookOpen
- '⏰' → Timer
- '🔍' → Search
- '🔗' (NEXUS) → Network
- '🔔' → Bell
- '⚙️' → Settings

icon 렌더링을 `<span className="text-base leading-none">{item.icon}</span>` 에서
`<item.icon className="w-5 h-5 shrink-0" />` 로 변경.

NavItem 타입도 변경:
`type NavItem = { to: string; label: string; icon: React.ComponentType<{ className?: string }> }`

파일 상단에 lucide-react import 추가:
`import { LayoutDashboard, Terminal, Monitor, MessageSquare, TrendingUp, Users, Clock, FileText, FolderOpen, Network, Building2, Bot, Layers, Share2, Send, Activity, DollarSign, History, Shield, Lock, BookOpen, Timer, Search, Bell, Settings, BarChart3 } from 'lucide-react'`

### dark: 접두사 제거
이 앱은 항상 dark mode이므로 `dark:` 접두사가 있는 클래스만 남기고, light mode 클래스는 제거.
예시:
- `bg-white dark:bg-zinc-950` → `bg-[#020617]`
- `text-zinc-900 dark:text-zinc-100` → `text-slate-50`
- `bg-zinc-50 dark:bg-zinc-900` → `bg-slate-900`
- `border-zinc-200 dark:border-zinc-800` → `border-slate-800`

### nav 섹션 헤더 스타일
`text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500`
→ `text-[11px] font-medium uppercase tracking-widest text-slate-400`

### active nav 스타일
`bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium`
→ `bg-[rgba(34,211,238,0.10)] text-cyan-400 font-medium border-l-2 border-cyan-400`

### inactive nav 스타일
`text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800`
→ `text-slate-400 hover:bg-slate-800/50 hover:text-slate-200`

### notification badge 스타일
`bg-indigo-600 text-white`
→ `bg-red-500 text-white`

### SwitchToAdminButton 스타일
`text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900`
→ `text-cyan-300 bg-[rgba(34,211,238,0.10)] hover:bg-[rgba(34,211,238,0.15)]`

### 로고
`w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold` + "C"
→ `text-lg font-semibold tracking-tight text-slate-50` + "CORTHEX" (아이콘 제거, 텍스트만)

### 유저 아바타 (layout.tsx 모바일 헤더)
`bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400`
→ `bg-slate-700 text-slate-300`

### 유저 정보 영역 (sidebar.tsx 하단)
- border: `border-zinc-200 dark:border-zinc-800` → `border-slate-800`
- name: `text-zinc-900 dark:text-zinc-100` → `text-slate-50`
- role: `text-zinc-500` → `text-slate-400`
- logout hover: `hover:text-red-600 dark:hover:text-red-400` → `hover:text-red-400`
- build number: `text-zinc-400 dark:text-zinc-600 font-mono` → `text-slate-600 font-mono`

---

## 파일 1: layout.tsx (현재 코드)

```tsx
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
    <div className="h-screen flex flex-col lg:flex-row bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="hidden lg:block border-r border-zinc-200 dark:border-zinc-800">
        <Sidebar />
      </div>

      <header className="lg:hidden flex flex-col sticky top-0 z-30 shrink-0 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
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

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

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
    <InstallBanner />
    <PushPermission />
    </ToastProvider>
  )
}
```

## 파일 2: sidebar.tsx (현재 코드)

```tsx
import { useState, useCallback } from 'react'
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
      { to: '/hub', label: '허브', icon: '🔗' },
      { to: '/command-center', label: '사령관실', icon: '🎖️' },
    ],
  },
  {
    label: '업무',
    items: [
      { to: '/chat', label: '채팅', icon: '💬' },
      { to: '/trading', label: '전략실', icon: '📈' },
      { to: '/agora', label: 'AGORA 토론', icon: '🗣️' },
      { to: '/jobs', label: '야간작업', icon: '🌙' },
      { to: '/reports', label: '보고서', icon: '📄' },
      { to: '/files', label: '파일', icon: '📁' },
    ],
  },
  {
    label: '운영',
    items: [
      { to: '/org', label: '조직도', icon: '🏢' },
      { to: '/departments', label: '부서 관리', icon: '🏗️' },
      { to: '/agents', label: '에이전트 관리', icon: '🤖' },
      { to: '/tiers', label: '계층 관리', icon: '📊' },
      { to: '/sns', label: 'SNS', icon: '📱' },
      { to: '/messenger', label: '메신저', icon: '💭' },
      { to: '/dashboard', label: '작전현황', icon: '📊' },
      { to: '/costs', label: '비용 분석', icon: '💰' },
      { to: '/activity-log', label: '통신로그', icon: '📞' },
      { to: '/ops-log', label: '작전일지', icon: '📋' },
      { to: '/classified', label: '기밀문서', icon: '🔒' },
      { to: '/performance', label: '전력분석', icon: '💪' },
      { to: '/knowledge', label: '정보국', icon: '📚' },
      { to: '/cron', label: '크론기지', icon: '⏰' },
      { to: '/argos', label: 'ARGOS', icon: '🔍' },
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
      className="flex items-center gap-2 w-full px-2 py-2 text-xs font-medium rounded-lg transition-colors text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900"
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
    <aside className="w-60 h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <div className="px-4 h-14 flex items-center border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            C
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">CORTHEX</span>
        </div>
      </div>

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

      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <SwitchToAdminButton />
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
```

위 교체 규칙을 전부 적용해서 layout.tsx와 sidebar.tsx의 완성된 코드를 각각 출력해줘. 로직은 절대 건드리지 마. 스타일(className)과 아이콘만 교체해.
```

---

## 프롬프트 2: Stitch HTML → React 컴포넌트 변환 (Hub + Dashboard)

```
너는 React + TypeScript + Tailwind CSS 전문 개발자야.
아래 Stitch에서 생성된 HTML을 React 컴포넌트로 변환해줘.

## 규칙
1. 함수형 컴포넌트 (export function ComponentName)
2. TypeScript (props 인터페이스 필수)
3. Tailwind CSS 클래스 그대로 유지
4. 외부 라이브러리 import 없이 순수 React만 사용
5. 하나의 HTML 파일에서 여러 컴포넌트를 추출해야 함
6. 아이콘은 lucide-react에서 import
7. 모든 숫자(비용, 토큰, 시간 등)에는 `font-mono tabular-nums` 적용
8. mock 데이터는 props로 받되, 기본값으로 예시 데이터 포함
9. 각 컴포넌트를 별도 파일로 분리해서 출력

## 추출할 컴포넌트 목록

### Hub 화면에서 (02-hub.html):
1. **HubOutputPanel** — 좌측 8칸 패널 전체 (메시지 영역 + 입력바)
2. **HubMessage** — 개별 메시지 (user/agent 타입 구분, props: type, content, timestamp, agentName?)
3. **ToolCallCard** — 도구 호출 표시 카드 (props: toolName, status, duration, expandable)
4. **HubInputBar** — 하단 입력바 (textarea + send button + attach)
5. **TrackerActiveAgent** — 우측 "ACTIVE AGENT" 카드
6. **TrackerHandoffChain** — 우측 "HANDOFF CHAIN" 카드 (vertical timeline)
7. **TrackerSessionCost** — 우측 "SESSION COST" 카드 (progress bar)
8. **TrackerActiveJobs** — 우측 "ACTIVE JOBS" 카드

### Dashboard 화면에서 (04-dashboard.html):
9. **MetricCard** — 통계 카드 (props: label, value, icon, change, changeType)
10. **ActivityFeed** — 최근 활동 목록 (props: items[])
11. **ActivityItem** — 활동 항목 (props: agentName, action, timestamp, statusColor)

## Hub HTML:

[아래에 02-hub.html 내용을 붙여넣기]

## Dashboard HTML:

[아래에 04-dashboard.html 내용을 붙여넣기]

각 컴포넌트를 별도 코드블록으로 출력해줘. 파일 경로는 다음과 같이:
- packages/app/src/components/hub/hub-output-panel.tsx
- packages/app/src/components/hub/hub-message.tsx
- packages/app/src/components/hub/tool-call-card.tsx
- packages/app/src/components/hub/hub-input-bar.tsx
- packages/app/src/components/hub/tracker-active-agent.tsx
- packages/app/src/components/hub/tracker-handoff-chain.tsx
- packages/app/src/components/hub/tracker-session-cost.tsx
- packages/app/src/components/hub/tracker-active-jobs.tsx
- packages/app/src/components/dashboard/metric-card.tsx
- packages/app/src/components/dashboard/activity-feed.tsx
- packages/app/src/components/dashboard/activity-item.tsx
```

---

## 프롬프트 3: Stitch HTML → React 컴포넌트 변환 (Agents + Departments + Jobs + Settings + Chat)

```
너는 React + TypeScript + Tailwind CSS 전문 개발자야.
아래 Stitch에서 생성된 HTML을 React 컴포넌트로 변환해줘.

## 규칙 (프롬프트 2와 동일)
1. 함수형 컴포넌트 (export function ComponentName)
2. TypeScript (props 인터페이스 필수)
3. Tailwind CSS 클래스 그대로 유지
4. 순수 React + lucide-react 아이콘만
5. mock 데이터는 props로 받되, 기본값으로 예시 데이터 포함
6. 각 컴포넌트를 별도 파일로 분리

## 추출할 컴포넌트 목록

### Agents 화면 (05-agents.html):
1. **AgentCard** — 에이전트 카드 (props: name, department, tier, status, taskCount, cost, avatar)
2. **AgentDetail** — 에이전트 상세 (props: agent, onEdit, onDelete)
3. **TierBadge** — 티어 배지 (props: tier: 'T1'|'T2'|'T3', label?)
   - T1: bg-[rgba(34,211,238,0.10)] text-cyan-400 border-cyan-400/30
   - T2: bg-[rgba(167,139,250,0.10)] text-violet-400 border-violet-400/30
   - T3: bg-[rgba(148,163,184,0.10)] text-slate-400 border-slate-400/30
4. **PerformanceStats** — 성능 통계 카드 (totalTasks, successRate, avgResponseTime, totalCost)

### Departments 화면 (06-departments.html):
5. **DepartmentCard** — 부서 카드 (props: name, description, agentCount, agents[], cost)
6. **AvatarGroup** — 겹치는 아바타 그룹 (props: avatars[], max?)

### Jobs 화면 (07-jobs.html):
7. **JobCard** — 작업 카드 (props: name, agent, schedule, status, nextRun, type)
8. **StatusBadge** — 상태 배지 (props: status: 'active'|'scheduled'|'completed'|'failed')
   - active: bg-[rgba(34,211,238,0.10)] text-cyan-400
   - scheduled: bg-[rgba(251,191,36,0.10)] text-amber-400
   - completed: bg-[rgba(52,211,153,0.10)] text-emerald-400
   - failed: bg-[rgba(248,113,113,0.10)] text-red-400

### Settings 화면 (08-settings.html):
9. **SettingsSection** — 설정 섹션 wrapper (props: title, children)
10. **ThemeSelector** — 테마 선택 (props: themes[], selected, onChange)
11. **ToggleSwitch** — 토글 스위치 (props: label, description?, checked, onChange)

### Chat 화면 (03-chat.html):
12. **ChatBubble** — 채팅 말풍선 (props: type: 'user'|'agent', content, timestamp, agentName?)
    - user: 오른쪽 정렬, bg-[rgba(34,211,238,0.10)], rounded-2xl rounded-tr-sm
    - agent: 왼쪽 정렬, bg-slate-800, rounded-2xl rounded-tl-sm
13. **ChatInputBar** — 채팅 입력바 (props: onSend, placeholder?)

## HTML 파일 내용:

### 05-agents.html:
[붙여넣기]

### 06-departments.html:
[붙여넣기]

### 07-jobs.html:
[붙여넣기]

### 08-settings.html:
[붙여넣기]

### 03-chat.html:
[붙여넣기]

각 컴포넌트를 별도 코드블록으로 출력해줘. 파일 경로:
- packages/app/src/components/agents/agent-card.tsx
- packages/app/src/components/agents/agent-detail.tsx
- packages/app/src/components/agents/tier-badge.tsx
- packages/app/src/components/agents/performance-stats.tsx
- packages/app/src/components/departments/department-card.tsx
- packages/app/src/components/departments/avatar-group.tsx
- packages/app/src/components/jobs/job-card.tsx
- packages/app/src/components/shared/status-badge.tsx
- packages/app/src/components/settings/settings-section.tsx
- packages/app/src/components/settings/theme-selector.tsx
- packages/app/src/components/settings/toggle-switch.tsx
- packages/app/src/components/chat/chat-bubble.tsx
- packages/app/src/components/chat/chat-input-bar.tsx
```

---

## 사용 방법

1. **프롬프트 1**: 그대로 Gemini에 붙여넣기 → 결과로 나온 layout.tsx, sidebar.tsx를 Claude에게 주면 적용
2. **프롬프트 2**: `[붙여넣기]` 부분에 실제 HTML 파일 내용을 복사해서 넣기 → 결과 11개 컴포넌트를 Claude에게 전달
3. **프롬프트 3**: `[붙여넣기]` 부분에 실제 HTML 파일 내용을 복사해서 넣기 → 결과 13개 컴포넌트를 Claude에게 전달

총 결과물: layout.tsx + sidebar.tsx + 24개 새 컴포넌트 = Phase 7-1 완료
