# 24. Home (홈) — Design Specification

## 1. Page Overview

- **Purpose**: CEO's landing page after login. A personal "morning briefing" showing overnight job results, AI team status, recent notifications, and quick navigation. NOT a data dashboard — it's a warm, actionable launchpad.
- **Key User Goals**: (1) See what happened overnight (job results), (2) Check which agents are online, (3) Scan recent notifications, (4) Navigate quickly to Chat/Jobs/Reports.
- **Data Dependencies**:
  - `GET /workspace/agents` → `{ data: Agent[] }` where `Agent = { id, name, role, status: 'online'|'working'|'error'|'offline', isSecretary }`
  - `GET /workspace/jobs/notifications` (refetchInterval: 30s) → `{ data: { total, completedCount, failedCount, jobs: JobNotification[] } }`
  - `GET /workspace/notifications?limit=5` (refetchInterval: 300s) → `{ data: RecentNotif[] }` where `RecentNotif = { id, type, title, isRead, createdAt }`
  - `PUT /workspace/jobs/read-all` → mark all job notifications as read
- **Current State**: `packages/app/src/pages/home.tsx`. Uses Card/Badge/StatusDot/Skeleton from @corthex/ui. Zinc/indigo scheme. Needs slate dark-mode redesign.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Greeting Header                                              │
│ "안녕하세요, 김대표님 👋"                                    │
│ "2026년 3월 9일 일요일"                                      │
├─────────────────────────────────────────────────────────────┤
│ Overnight Jobs Card (conditional)                            │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ "밤사이 완료된 작업"  ✅ 3건  ❌ 1건    [읽음][자세히]│   │
│ │ ✅ 마케팅봇 — 블로그 초안 작성 완료                   │   │
│ │ ✅ 분석봇 — 매출 리포트 생성 완료                     │   │
│ │ ❌ SNS봇 — 인스타그램 게시 실패                       │   │
│ │ +2건 더...                                            │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ My Team                                                      │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │
│ │● 비서봇│ │● 마케팅│ │● 분석봇│ │○ 재무봇│                │
│ │  ⭐    │ │  봇    │ │        │ │        │                │
│ │ 비서   │ │콘텐츠  │ │데이터  │ │ 재무   │                │
│ │채팅 → │ │채팅 → │ │채팅 → │ │오프라인│                │
│ └────────┘ └────────┘ └────────┘ └────────┘                │
│                                        +4명 더 보기         │
├─────────────────────────────────────────────────────────────┤
│ Recent Notifications                                         │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ ● 🔔 마케팅봇 작업 완료             10:23            │   │
│ │   🤖 분석봇 위임 완료               09:15            │   │
│ │ ● ⚠️ 도구 실행 오류                 08:02            │   │
│ │                              모두 보기 →             │   │
│ └───────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│ Quick Start                                                  │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│ │ 💬 채팅     │ │ 🌙 야간 작업 │ │ 📄 보고서   │          │
│ │ 에이전트와  │ │ 시켜놓고     │ │ 업무 보고   │          │
│ │ 대화        │ │ 퇴근         │ │ 확인        │          │
│ └──────────────┘ └──────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

- **Container**: `max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6`
- **Responsive**:
  - Desktop (>1024px): Agent grid 4 cols, quick start 3 cols
  - Tablet (768-1024px): Agent grid 3 cols
  - Mobile (<768px): Agent grid 2 cols, quick start still 3 cols (compact)

## 3. Component Breakdown

### 3.1 GreetingHeader

- **Container**: `space-y-1`
- **Greeting**:
  ```
  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
    안녕하세요, {user.name}님 👋
  </h1>
  ```
- **Date**:
  ```
  <p className="text-sm text-slate-400">
    {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
  </p>
  ```

### 3.2 OvernightJobsCard (conditional — only when `notifications.total > 0`)

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Header**: `<div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">`
  - Left:
    ```
    <div className="flex items-center gap-3">
      <h3 className="text-sm font-semibold text-white">밤사이 완료된 작업</h3>
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">✓ {completedCount}건</span>
        {failedCount > 0 && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">✕ {failedCount}건</span>}
      </div>
    </div>
    ```
  - Right:
    ```
    <div className="flex items-center gap-2">
      <button className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-700 transition-colors" onClick={markAllRead}>모두 읽음</button>
      <button onClick={() => navigate('/jobs')} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors">자세히 →</button>
    </div>
    ```
- **Body**: `<div className="divide-y divide-slate-700/50">`
  - Each job (max 5):
    ```
    <div className="px-5 py-3 flex items-start gap-3">
      {job.status === 'completed'
        ? <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">✓</span>
        : <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">✕</span>
      }
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-slate-300">{job.agentName}</span>
        <span className="text-xs text-slate-500 mx-1.5">—</span>
        <span className="text-xs text-slate-400 truncate">{job.instruction}</span>
      </div>
    </div>
    ```
  - Overflow indicator (if more than 5):
    ```
    <div className="px-5 py-2 text-center">
      <button onClick={() => navigate('/jobs')} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">+{total - 5}건 더...</button>
    </div>
    ```

### 3.3 MyTeamSection

- **Container**: `space-y-3`
- **Section title**: `<h2 className="text-sm font-semibold text-slate-200">내 팀</h2>`
- **Agent grid**: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3`
- **Agent card (online/working)**:
  ```
  <div onClick={() => navigate('/chat')} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 transition-colors group cursor-pointer">
    <div className="flex items-center gap-2 mb-2">
      <StatusDot status={agent.status} />  <!-- from @corthex/ui -->
      <span className="text-sm font-medium text-white truncate">{agent.name}</span>
      {agent.isSecretary && <span className="text-xs">⭐</span>}
    </div>
    <p className="text-xs text-slate-400 truncate">{agent.role}</p>
    <p className="text-xs text-blue-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">채팅 →</p>
  </div>
  ```
- **Agent card (error)**:
  - Same structure but border: `border-red-500/30`
  - Status text: `<p className="text-xs text-red-400 mt-2">오류 발생</p>`
- **Agent card (offline)**:
  ```
  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 opacity-50">
    <div className="flex items-center gap-2 mb-2">
      <StatusDot status="offline" />
      <span className="text-sm font-medium text-slate-400 truncate">{agent.name}</span>
    </div>
    <p className="text-xs text-slate-500 truncate">{agent.role}</p>
    <p className="text-xs text-slate-600 mt-2">오프라인</p>
  </div>
  ```
- **Overflow indicator** (if agents > 8):
  ```
  <div className="text-right">
    <span className="text-xs text-slate-500">+{agents.length - 8}명 더 보기</span>
  </div>
  ```
- **Sort order**: Secretary first → status (online=0, working=1, error=2, offline=3) → name (ko locale)
- **Loading state**: `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3` with skeleton cards: `<div className="bg-slate-800/50 border border-slate-700 rounded-xl h-28 animate-pulse" />`
- **Empty state**:
  ```
  <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
    <p className="text-sm text-slate-400">아직 배정된 에이전트가 없습니다</p>
    <p className="text-xs text-slate-500 mt-1">관리자에게 문의하세요.</p>
  </div>
  ```

### 3.4 RecentNotificationsSection

- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden`
- **Header**: `<div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">`
  - `<h3 className="text-sm font-semibold text-slate-200">최근 알림</h3>`
  - `<button onClick={() => navigate('/notifications')} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">모두 보기 →</button>`
- **Notification list**: `<div className="divide-y divide-slate-700/30">`
  - Each notification:
    ```
    <div className="px-5 py-3 flex items-center gap-3 {notif.isRead ? '' : 'bg-blue-500/5'}">
      {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
      <span className="text-sm flex-shrink-0">{NOTIF_ICON_MAP[notif.type] || '🔔'}</span>
      <span className="text-sm {notif.isRead ? 'text-slate-400' : 'text-white font-medium'} truncate flex-1">{notif.title}</span>
      <span className="text-xs text-slate-500 font-mono flex-shrink-0">
        {new Date(notif.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    ```
- **Notification icon map**:
  - `chat_complete`: 🔔
  - `delegation_complete`: 🤖
  - `tool_error`: ⚠️
  - `job_complete`: ✅
  - `job_error`: ❌
  - `system`: ⚙️
- **Empty behavior**: When `items.length === 0`, the entire RecentNotifications section is NOT rendered (returns null). No empty state message — the section simply doesn't appear.

### 3.5 QuickStartSection

- **Container**: `space-y-3`
- **Section title**: `<h2 className="text-sm font-semibold text-slate-200">빠른 시작</h2>`
- **Card grid**: `grid grid-cols-3 gap-3`
- **Quick start card**:
  ```
  <div onClick={() => navigate(path)} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:bg-slate-800 hover:border-slate-600 transition-colors text-center cursor-pointer">
    <div className="text-2xl mb-2">{icon}</div>
    <h4 className="text-sm font-medium text-white">{title}</h4>
    <p className="text-xs text-slate-400 mt-1">{description}</p>
  </div>
  ```
- **Cards**:
  1. `{ path: '/chat', icon: '💬', title: '채팅', description: '에이전트와 대화' }`
  2. `{ path: '/jobs', icon: '🌙', title: '야간 작업', description: '시켜놓고 퇴근' }`
  3. `{ path: '/reports', icon: '📄', title: '보고서', description: '업무 보고 확인' }`

## 4. States

### 4.1 Loading
- Greeting visible (from auth store, available immediately)
- Overnight jobs: Not shown (conditional render)
- Team section: Skeleton grid
- Notifications: Skeleton list
- Quick start: Always visible (static content)

### 4.2 No Agents
- Team section shows empty state message

### 4.3 No Overnight Jobs
- Card is completely absent (not rendered), not "0 jobs" message

### 4.4 No Notifications
- Card shows "새로운 알림이 없습니다" centered

## 5. Interactions & Animations

- **Agent card hover**: `hover:bg-slate-800 hover:border-slate-600 transition-colors`, "채팅 →" fades in
- **Quick start card hover**: Same hover pattern
- **Mark all read**: Fades out the overnight jobs card after mutation success, invalidates queries
- **Notification unread dot**: Small blue pulse would be nice but not essential
- **Auto-refresh**: Jobs every 30s, notifications every 5min

## 6. Responsive Behavior

- **Desktop (>1024px)**: Agent grid 4 cols, everything comfortable
- **Tablet (768-1024px)**: Agent grid 3 cols
- **Mobile (<768px)**:
  - Agent grid: 2 cols
  - Quick start: 3 cols maintained but cards are smaller (less padding, `p-3`, text-xs for description)
  - Page padding: `px-4`
  - Overnight card: Job text wraps, may need line-clamp-1

## 7. Data Flow Summary

```
user (from useAuthStore)
  ↓
  greeting + date

useQuery(['agents']) → agents[] → sorted → sliced(0, MAX_AGENTS=8) → agent cards
useQuery(['job-notifications'], refetchInterval: 30000) → notifications → OvernightJobsCard (conditional)
useQuery(['recent-notifications'], refetchInterval: 300000) → RecentNotificationsSection

readAllMutation → PUT /workspace/jobs/read-all → invalidate(['job-notifications', 'night-jobs'])
```
