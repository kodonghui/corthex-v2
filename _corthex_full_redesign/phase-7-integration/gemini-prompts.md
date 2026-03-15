# Phase 7 Gemini 변환 프롬프트

총 7개 프롬프트. 순서대로 실행. 각 프롬프트 결과를 Claude에게 전달하면 통합.

## 공통 규칙 (모든 프롬프트에 적용)

```
공통 규칙:
1. React 함수형 컴포넌트 (export function ComponentName)
2. TypeScript (props 인터페이스 export)
3. Tailwind CSS 클래스 유지, inline style 제거
4. 아이콘: lucide-react에서 import
5. 숫자(비용/시간/토큰): font-mono tabular-nums
6. 각 컴포넌트를 별도 파일로 출력 (파일경로 주석 포함)
7. dark: 접두사 제거 (항상 dark mode)
8. mock 데이터는 props 기본값으로
9. 로직(API호출, 상태관리) 없이 순수 UI만
```

---

## 프롬프트 1: 기존 컴포넌트 마이그레이션

첨부할 파일: 없음 (코드가 프롬프트에 포함됨)

```
너는 React + Tailwind CSS 전문 개발자야. 아래 2개 파일의 디자인 시스템을 교체해줘.
로직은 절대 건드리지 마. className과 아이콘만 교체해.

## 교체 규칙

색상:
- zinc-950 → slate-950, zinc-900 → slate-900, zinc-800 → slate-800
- zinc-700 → slate-700, zinc-600 → slate-600, zinc-500 → slate-500
- zinc-400 → slate-400, zinc-200 → slate-800, zinc-100 → slate-50, zinc-50 → slate-900
- indigo-600 → cyan-400, indigo-700 → cyan-400, indigo-400 → cyan-300, indigo-300 → cyan-300
- indigo-950 → [rgba(34,211,238,0.10)], indigo-900 → [rgba(34,211,238,0.15)]
- indigo-100 → [rgba(34,211,238,0.10)], indigo-50 → [rgba(34,211,238,0.10)]
- bg-white → bg-[#020617]

dark: 접두사:
- 항상 dark mode이므로 dark: 클래스만 남기고 light 클래스 제거
- 예: `bg-white dark:bg-zinc-950` → `bg-[#020617]`
- 예: `text-zinc-900 dark:text-zinc-100` → `text-slate-50`
- 예: `border-zinc-200 dark:border-zinc-800` → `border-slate-800`

사이드바: w-60 → w-[280px]

아이콘: emoji → lucide-react
- 파일 상단에 추가: import { LayoutDashboard, Terminal, Monitor, MessageSquare, TrendingUp, Users, Clock, FileText, FolderOpen, Network, Building2, Bot, Layers, Share2, Send, Activity, DollarSign, History, Shield, Lock, BookOpen, Timer, Search, Bell, Settings, BarChart3 } from 'lucide-react'
- NavItem 타입: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }
- 렌더링: <item.icon className="w-5 h-5 shrink-0" />
- 매핑: 🏠→LayoutDashboard, 🔗(허브)→Terminal, 🎖️→Monitor, 💬→MessageSquare, 📈→TrendingUp, 🗣️→Users, 🌙→Clock, 📄→FileText, 📁→FolderOpen, 🏢→Network, 🏗️→Building2, 🤖→Bot, 📊(계층)→Layers, 📱→Share2, 💭→Send, 📊(작전)→Activity, 💰→DollarSign, 📞→History, 📋→Shield, 🔒→Lock, 💪→BarChart3, 📚→BookOpen, ⏰→Timer, 🔍→Search, 🔗(NEXUS)→Network, 🔔→Bell, ⚙️→Settings

nav 스타일:
- 섹션헤더: text-[11px] font-medium uppercase tracking-widest text-slate-400
- active: bg-[rgba(34,211,238,0.10)] text-cyan-400 font-medium border-l-2 border-cyan-400
- inactive: text-slate-400 hover:bg-slate-800/50 hover:text-slate-200
- badge: bg-red-500 text-white

로고: 아이콘 제거, "CORTHEX" text-lg font-semibold text-slate-50
유저아바타: bg-slate-700 text-slate-300
SwitchToAdmin: text-cyan-300 bg-[rgba(34,211,238,0.10)]
유저영역: name text-slate-50, role text-slate-400, logout hover:text-red-400

---

파일 1: layout.tsx

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
    setTimeout(() => { setSidebarOpen(false); setClosing(false) }, 200)
  }, [sidebarOpen])
  useEffect(() => { setSidebarOpen(false); setClosing(false) }, [location.pathname])
  useEffect(() => {
    if (!sidebarOpen) return
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSidebar() }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, closeSidebar])
  useEffect(() => {
    if (!sidebarOpen) return
    const handlePopState = () => { setSidebarOpen(false); setClosing(false) }
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
          <button onClick={openSidebar} className="p-1.5 -ml-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="메뉴 열기">
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">C</div>
            <span className="text-sm font-bold tracking-tight">CORTHEX</span>
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-medium">
          {user?.name?.charAt(0) || '?'}
        </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto"><Outlet /></main>
      {(sidebarOpen || closing) && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog" aria-modal="true">
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`} onClick={closeSidebar} />
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

---

파일 2: sidebar.tsx

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
  { items: [
    { to: '/', label: '홈', icon: '🏠' },
    { to: '/hub', label: '허브', icon: '🔗' },
    { to: '/command-center', label: '사령관실', icon: '🎖️' },
  ]},
  { label: '업무', items: [
    { to: '/chat', label: '채팅', icon: '💬' },
    { to: '/trading', label: '전략실', icon: '📈' },
    { to: '/agora', label: 'AGORA 토론', icon: '🗣️' },
    { to: '/jobs', label: '야간작업', icon: '🌙' },
    { to: '/reports', label: '보고서', icon: '📄' },
    { to: '/files', label: '파일', icon: '📁' },
  ]},
  { label: '운영', items: [
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
  ]},
  { label: '시스템', items: [
    { to: '/notifications', label: '알림', icon: '🔔' },
    { to: '/settings', label: '설정', icon: '⚙️' },
  ]},
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
      const res = await api.post<{ data: { token: string; user: { id: string; name: string; role: string }; targetUrl: string } }>('/auth/switch-app', { targetApp: 'admin' })
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
    <button onClick={handleSwitch} disabled={switching}
      className="flex items-center gap-2 w-full px-2 py-2 text-xs font-medium rounded-lg transition-colors text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900">
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
    refetchInterval: 30000, enabled: !!user,
  })
  const unreadCount = countData?.data?.unread ?? 0
  return (
    <aside className="w-60 h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
      <div className="px-4 h-14 flex items-center border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">C</div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">CORTHEX</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {navSections.map((section, si) => (
          <div key={si}>
            {section.label && (<p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{section.label}</p>)}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onNavClick}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-medium' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.to === '/notifications' && unreadCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold leading-none">{unreadCount > 99 ? '99+' : unreadCount}</span>
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
          <button onClick={logout} className="text-xs text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">로그아웃</button>
        </div>
        <div className="px-2 text-[10px] text-zinc-400 dark:text-zinc-600 font-mono">
          #{__BUILD_NUMBER__}{__BUILD_HASH__ ? ` · ${__BUILD_HASH__}` : ''}
        </div>
      </div>
    </aside>
  )
}

위 교체 규칙을 전부 적용해서 layout.tsx와 sidebar.tsx 완성된 코드를 각각 출력해줘.
```

---

## 프롬프트 2: 핵심 화면 React 변환 (Hub + Dashboard + Chat)

첨부할 파일: `02-hub.html`, `03-chat.html`, `04-dashboard.html`

```
너는 React + TypeScript + Tailwind CSS 전문 개발자야.
첨부된 3개 HTML 파일을 React 컴포넌트로 변환해줘.

공통 규칙:
1. export function ComponentName 형식
2. TypeScript props 인터페이스 export
3. Tailwind 클래스 유지, 아이콘은 lucide-react
4. 숫자: font-mono tabular-nums
5. mock 데이터는 props 기본값으로
6. 파일경로를 주석으로 첫줄에 표시
7. API 호출/상태관리 로직 없이 순수 UI만

추출할 컴포넌트:

02-hub.html에서:
// packages/app/src/components/hub/hub-output-panel.tsx — 좌측 8칸 전체
// packages/app/src/components/hub/hub-message.tsx — 개별 메시지 (type: 'user'|'agent'|'system')
// packages/app/src/components/hub/tool-call-card.tsx — 도구 호출 카드
// packages/app/src/components/hub/hub-input-bar.tsx — 하단 입력바
// packages/app/src/components/hub/tracker-active-agent.tsx — ACTIVE AGENT 카드
// packages/app/src/components/hub/tracker-handoff-chain.tsx — HANDOFF CHAIN 카드
// packages/app/src/components/hub/tracker-session-cost.tsx — SESSION COST 카드
// packages/app/src/components/hub/tracker-active-jobs.tsx — ACTIVE JOBS 카드

03-chat.html에서:
// packages/app/src/components/chat/chat-bubble.tsx — 말풍선 (type: 'user'|'agent')
// packages/app/src/components/chat/chat-input-bar.tsx — 입력바

04-dashboard.html에서:
// packages/app/src/components/dashboard/metric-card.tsx — 통계 카드
// packages/app/src/components/dashboard/activity-feed.tsx — 활동 목록
// packages/app/src/components/dashboard/activity-item.tsx — 활동 항목

총 13개 컴포넌트를 각각 별도 코드블록으로 출력해줘.
```

---

## 프롬프트 3: 관리 화면 React 변환 (Agents + Departments + Jobs + Settings)

첨부할 파일: `05-agents.html`, `06-departments.html`, `07-jobs.html`, `08-settings.html`

```
첨부된 4개 HTML을 React 컴포넌트로 변환해줘. 공통 규칙은 프롬프트 2와 동일.

추출할 컴포넌트:

05-agents.html에서:
// packages/app/src/components/agents/agent-card.tsx
// packages/app/src/components/agents/agent-detail.tsx
// packages/app/src/components/agents/tier-badge.tsx — T1:cyan, T2:violet, T3:slate
// packages/app/src/components/agents/performance-stats.tsx

06-departments.html에서:
// packages/app/src/components/departments/department-card.tsx
// packages/app/src/components/departments/avatar-group.tsx — 겹치는 아바타

07-jobs.html에서:
// packages/app/src/components/jobs/job-card.tsx
// packages/app/src/components/shared/status-badge.tsx — active:cyan, scheduled:amber, completed:emerald, failed:red

08-settings.html에서:
// packages/app/src/components/settings/settings-section.tsx
// packages/app/src/components/settings/theme-selector.tsx
// packages/app/src/components/settings/toggle-switch.tsx

총 11개 컴포넌트.
```

---

## 프롬프트 4: 인증/온보딩 + 조직 React 변환

첨부할 파일: `10-login.html`, `27-onboarding.html`, `28-org.html`, `09-nexus.html`

```
첨부된 4개 HTML을 React 컴포넌트로 변환해줘. 공통 규칙 동일.

10-login.html에서:
// packages/app/src/components/auth/login-form.tsx — 로그인 폼 카드 전체

27-onboarding.html에서:
// packages/app/src/components/onboarding/step-indicator.tsx — 3단계 표시
// packages/app/src/components/onboarding/template-card.tsx — 템플릿 선택 카드
// packages/app/src/components/onboarding/template-preview.tsx — 미리보기

28-org.html에서:
// packages/app/src/components/org/org-tree.tsx — 조직도 트리
// packages/app/src/components/org/org-node.tsx — 부서/에이전트 노드
// packages/app/src/components/org/entity-detail.tsx — 우측 상세패널

09-nexus.html에서:
// packages/app/src/components/nexus/nexus-toolbar.tsx — 상단 툴바
// packages/app/src/components/nexus/nexus-sidebar-rail.tsx — 64px 아이콘 레일

총 9개 컴포넌트.
```

---

## 프롬프트 5: 커뮤니케이션 화면 React 변환

첨부할 파일: `11-command-center.html`, `22-messenger.html`, `23-agora.html`, `14-notifications.html`

```
첨부된 4개 HTML을 React 컴포넌트로 변환해줘. 공통 규칙 동일.

11-command-center.html에서:
// packages/app/src/components/command-center/command-thread.tsx — 좌측 명령 스레드
// packages/app/src/components/command-center/delegation-card.tsx — 위임 카드 (violet)
// packages/app/src/components/command-center/pipeline-tracker.tsx — 우측 파이프라인
// packages/app/src/components/command-center/deliverables-card.tsx — 산출물 카드

22-messenger.html에서:
// packages/app/src/components/messenger/conversation-list.tsx — 좌측 대화 목록
// packages/app/src/components/messenger/conversation-item.tsx — 대화 항목

23-agora.html에서:
// packages/app/src/components/agora/debate-list.tsx — 좌측 토론 목록
// packages/app/src/components/agora/debate-timeline.tsx — 중앙 타임라인
// packages/app/src/components/agora/debate-info.tsx — 우측 정보 패널

14-notifications.html에서:
// packages/app/src/components/notifications/notification-card.tsx — 알림 카드
// packages/app/src/components/notifications/notification-list.tsx — 날짜별 그룹 목록

총 11개 컴포넌트.
```

---

## 프롬프트 6: 분석/모니터링 화면 React 변환

첨부할 파일: `16-costs.html`, `17-performance.html`, `20-activity-log.html`, `21-ops-log.html`

```
첨부된 4개 HTML을 React 컴포넌트로 변환해줘. 공통 규칙 동일.

16-costs.html에서:
// packages/app/src/components/costs/cost-summary-cards.tsx — 4개 요약 카드
// packages/app/src/components/costs/cost-chart-placeholder.tsx — 차트 영역
// packages/app/src/components/costs/cost-table.tsx — 모델별/에이전트별 테이블

17-performance.html에서:
// packages/app/src/components/performance/performance-table.tsx — 에이전트 성능 테이블
// packages/app/src/components/performance/suggestion-card.tsx — 개선 제안 카드

20-activity-log.html에서:
// packages/app/src/components/activity-log/activity-item.tsx — 활동 항목 (dot+avatar+detail+tags)
// packages/app/src/components/activity-log/activity-list.tsx — 필터+목록+페이징

21-ops-log.html에서:
// packages/app/src/components/ops-log/ops-summary-cards.tsx — 3개 요약
// packages/app/src/components/ops-log/ops-table.tsx — 작전 테이블

총 9개 컴포넌트.
```

---

## 프롬프트 7: 콘텐츠/자동화 화면 React 변환

첨부할 파일: `12-sns.html`, `13-trading.html`, `15-knowledge.html`, `18-reports.html`, `19-files.html`, `24-classified.html`, `25-cron.html`, `26-argos.html`

```
첨부된 8개 HTML을 React 컴포넌트로 변환해줘. 공통 규칙 동일.

12-sns.html에서:
// packages/app/src/components/sns/sns-content-card.tsx — SNS 콘텐츠 카드

13-trading.html에서:
// packages/app/src/components/trading/watchlist.tsx — 좌측 워치리스트
// packages/app/src/components/trading/chart-header.tsx — 차트 헤더 (가격+변동)
// packages/app/src/components/trading/trade-history-table.tsx — 거래 내역

15-knowledge.html에서:
// packages/app/src/components/knowledge/folder-tree.tsx — 폴더 트리
// packages/app/src/components/knowledge/doc-list-item.tsx — 문서 항목
// packages/app/src/components/knowledge/doc-detail.tsx — 문서 상세

18-reports.html에서:
// packages/app/src/components/reports/report-card.tsx — 보고서 카드
// packages/app/src/components/reports/report-detail.tsx — 보고서 상세+댓글

19-files.html에서:
// packages/app/src/components/files/file-tile.tsx — 파일 타일
// packages/app/src/components/files/upload-zone.tsx — 업로드 영역

24-classified.html에서:
// packages/app/src/components/classified/classification-badge.tsx — 1급/2급/3급 배지
// packages/app/src/components/classified/archive-item.tsx — 기밀문서 항목

25-cron.html에서:
// packages/app/src/components/cron/schedule-list-item.tsx — 스케줄 항목
// packages/app/src/components/cron/schedule-detail-form.tsx — 스케줄 상세 폼
// packages/app/src/components/cron/execution-history.tsx — 실행 이력

26-argos.html에서:
// packages/app/src/components/argos/trigger-card.tsx — 트리거 카드
// packages/app/src/components/argos/event-timeline.tsx — 이벤트 타임라인
// packages/app/src/components/argos/status-summary.tsx — 상태 요약

총 19개 컴포넌트.
```

---

## 총합

| 프롬프트 | 내용 | 컴포넌트 수 |
|---------|------|-----------|
| 1 | 기존 layout+sidebar 마이그레이션 | 2 파일 |
| 2 | Hub + Chat + Dashboard | 13개 |
| 3 | Agents + Departments + Jobs + Settings | 11개 |
| 4 | Login + Onboarding + Org + NEXUS | 9개 |
| 5 | Command Center + Messenger + Agora + Notifications | 11개 |
| 6 | Costs + Performance + Activity Log + Ops Log | 9개 |
| 7 | SNS + Trading + Knowledge + Reports + Files + Classified + Cron + ARGOS | 19개 |
| **합계** | | **2파일 + 72개 컴포넌트** |
