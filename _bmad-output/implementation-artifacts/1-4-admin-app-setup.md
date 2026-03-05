# Story 1.4: Admin & App 앱 세팅 (Vite + 라우팅 + 상태 관리)

Status: done

## Story

As a 개발자,
I want admin/app 두 SPA가 라우팅과 상태 관리 기반으로 동작하기를,
so that 각 페이지를 독립적으로 개발하고 API 데이터를 일관성 있게 관리할 수 있다.

## Acceptance Criteria

1. **Given** packages/admin 또는 packages/app / **When** `bun dev` 실행 / **Then** Vite 6 + React 19 SPA 정상 렌더링
2. Tailwind CSS 4 (`@tailwindcss/vite`) 적용 — `--color-corthex-accent: oklch(0.55 0.2 264)` 커스텀 컬러 동작
3. 기본 테마: 다크 모드 (zinc-950 배경). `dark:` 클래스 동작 확인
4. React Router DOM 7 라우팅 + 보호 라우트 (미로그인 시 /login 리다이렉트)
5. Zustand 5 — **auth-store, ws-store, notification-store, activity-store** 4개 초기화 + TanStack Query 5 초기화
6. React.lazy + Suspense 기반 페이지 lazy import (로딩 중 Skeleton UI 표시)
7. `__BUILD_NUMBER__` Vite define 주입 + 앱 사이드바 `#N` 빌드 번호 표시

## Tasks / Subtasks

- [x] Task 1: Zustand 스토어 3개 신규 생성 (AC: #5)
  - [x] `packages/app/src/stores/ws-store.ts` 생성
    - WebSocket 연결 상태: `socket: WebSocket | null`, `isConnected: boolean`
    - 액션: `connect(token)`, `disconnect()`, `send(channel, data)`
  - [x] `packages/app/src/stores/notification-store.ts` 생성
    - 알림 목록: `notifications: Notification[]`, `unreadCount: number`
    - 액션: `addNotification(n)`, `markAllRead()`, `clearAll()`
  - [x] `packages/app/src/stores/activity-store.ts` 생성
    - 활동 로그: `logs: ActivityLog[]`, `isStreaming: boolean`
    - 액션: `addLog(log)`, `clearLogs()`
  - [x] admin에도 동일 스토어 필요 여부 확인 (admin은 auth-store만 필요할 수 있음)

- [x] Task 2: App.tsx에 React.lazy + Suspense 적용 (AC: #6)
  - [x] `packages/app/src/App.tsx` 페이지 import를 `React.lazy()`로 변경
  - [x] `<Suspense fallback={<PageSkeleton />}>` 래핑
  - [x] `PageSkeleton` 컴포넌트: `@corthex/ui`의 `Skeleton` 사용 (풀스크린 회색 애니메이션)
  - [x] 동일 작업을 `packages/admin/src/App.tsx`에도 적용

- [x] Task 3: 전체 동작 검증 (AC: #1~#7)
  - [x] `turbo dev` 실행 → admin(5173), app(5174), server(3000) 정상 기동
  - [x] 로그인 페이지 접근 → 정상 렌더링
  - [x] 미인증 상태로 `/` 접근 → `/login` 리다이렉트
  - [x] 사이드바 하단 `#dev` 또는 `#N` 빌드 번호 표시 확인
  - [x] Dark mode: 시스템 다크모드 설정 시 `zinc-950` 배경 적용 확인

## Dev Notes

### ⚠️ 현재 코드베이스 상태

**이미 완성된 항목:**
- ✅ `packages/app/src/App.tsx` — BrowserRouter + Routes + ProtectedRoute + QueryClientProvider
- ✅ `packages/admin/src/App.tsx` — 동일 패턴 (darkMode 수동 토글 포함)
- ✅ `packages/app/src/stores/auth-store.ts` — Zustand 5 auth store (token/user/isAuthenticated, localStorage 지속)
- ✅ `packages/app/src/index.css` — `--color-corthex-accent: oklch(0.55 0.2 264)` 정의 완료
- ✅ `packages/admin/src/index.css` — 동일 디자인 토큰 정의 완료
- ✅ `packages/app/src/components/layout.tsx` — `dark:bg-zinc-950` 다크 테마 적용
- ✅ `packages/app/src/components/sidebar.tsx` — `__BUILD_NUMBER__` 빌드 번호 표시 (`#{__BUILD_NUMBER__}` 형식)
- ✅ `__BUILD_NUMBER__` Vite define — 두 `vite.config.ts` 모두 `process.env.BUILD_NUMBER || 'dev'` 주입 완료
- ✅ TanStack Query 5 `QueryClient` 초기화 완료 (App.tsx)
- ✅ 모든 페이지 파일 존재 (app: 11개, admin: ~9개)

**수정/추가가 필요한 항목:**

| 항목 | 파일 | 현재 상태 | 필요 작업 |
|------|------|----------|----------|
| 누락 스토어 | `app/src/stores/` | auth-store만 존재 | ws-store, notification-store, activity-store 추가 |
| Lazy Loading | `app/src/App.tsx` | 직접 import (lazy 없음) | `React.lazy()` + `<Suspense>` 적용 |
| Lazy Loading | `admin/src/App.tsx` | 직접 import (lazy 없음) | 동일 적용 |

### Zustand 스토어 구현 패턴

```typescript
// packages/app/src/stores/ws-store.ts
import { create } from 'zustand'

type WsState = {
  socket: WebSocket | null
  isConnected: boolean
  connect: (token: string) => void
  disconnect: () => void
}

export const useWsStore = create<WsState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token: string) => {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws?token=${token}`)
    ws.onopen = () => set({ isConnected: true })
    ws.onclose = () => {
      set({ isConnected: false, socket: null })
      // 자동 재연결은 E6 WebSocket 인프라 스토리(1.9)에서 처리
    }
    set({ socket: ws })
  },

  disconnect: () => {
    get().socket?.close()
    set({ socket: null, isConnected: false })
  },
}))
```

```typescript
// packages/app/src/stores/notification-store.ts
import { create } from 'zustand'

export type Notification = {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
  createdAt: Date
  read: boolean
}

type NotificationState = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAllRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((s) => {
      const notification: Notification = {
        ...n,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        read: false,
      }
      return {
        notifications: [notification, ...s.notifications].slice(0, 50), // 최대 50개
        unreadCount: s.unreadCount + 1,
      }
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}))
```

```typescript
// packages/app/src/stores/activity-store.ts
import { create } from 'zustand'
import type { ActivityLogType } from '@corthex/shared'

export type ActivityLog = {
  id: string
  type: ActivityLogType
  phase: 'start' | 'end' | 'error'
  action: string
  metadata?: Record<string, unknown>
  createdAt: Date
}

type ActivityState = {
  logs: ActivityLog[]
  isStreaming: boolean
  addLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => void
  clearLogs: () => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  logs: [],
  isStreaming: false,

  addLog: (log) =>
    set((s) => ({
      logs: [
        { ...log, id: crypto.randomUUID(), createdAt: new Date() },
        ...s.logs,
      ].slice(0, 200), // 최근 200건 유지 (architecture.md Decision 2)
    })),

  clearLogs: () => set({ logs: [] }),
}))
```

### React.lazy + Suspense 적용 패턴

```typescript
// packages/app/src/App.tsx 수정 예시
import { lazy, Suspense } from 'react'
import { Skeleton } from '@corthex/ui'

// Before (직접 import):
// import { HomePage } from './pages/home'

// After (lazy import):
const HomePage = lazy(() => import('./pages/home').then(m => ({ default: m.HomePage })))
const ChatPage = lazy(() => import('./pages/chat').then(m => ({ default: m.ChatPage })))
// ... 모든 페이지 동일 패턴

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

// Routes 부분에 Suspense 추가:
<Route
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  <Suspense fallback={<PageSkeleton />}>
    <Route index element={<HomePage />} />
    <Route path="chat" element={<ChatPage />} />
    {/* ... */}
  </Suspense>
</Route>
```

> ⚠️ Named export의 lazy import: `import('./pages/home').then(m => ({ default: m.HomePage }))`
> 또는 각 페이지 파일에 `export default` 추가하는 방법도 가능.

### Project Structure Notes

```
packages/app/src/
├── App.tsx               ← Suspense + lazy 추가 필요
├── main.tsx              ✅ StrictMode + createRoot
├── index.css             ✅ @theme 토큰 정의 완료
├── stores/
│   ├── auth-store.ts     ✅ 완성
│   ├── ws-store.ts       ← 신규 생성
│   ├── notification-store.ts  ← 신규 생성
│   └── activity-store.ts     ← 신규 생성
├── components/
│   ├── layout.tsx        ✅ dark:bg-zinc-950 적용
│   └── sidebar.tsx       ✅ __BUILD_NUMBER__ 표시 완성
└── pages/                ✅ 11개 모두 존재

packages/admin/src/
├── App.tsx               ← Suspense + lazy 추가 필요
├── stores/
│   └── auth-store.ts     ← admin에도 auth-store 확인 필요
└── ...
```

### 파일명 컨벤션

- `ws-store.ts`, `notification-store.ts`, `activity-store.ts` (kebab-case)
- store 내부 hook: `useWsStore`, `useNotificationStore`, `useActivityStore` (camelCase)

### References

- [Source: epics.md#Story 1.4] — AC 및 story
- [Source: packages/app/src/App.tsx] — 현재 구조 (lazy 없음, stores 3개 미초기화)
- [Source: packages/app/src/stores/auth-store.ts] — Zustand 5 패턴 (ws/notification/activity 동일 패턴 사용)
- [Source: packages/app/src/components/sidebar.tsx] — __BUILD_NUMBER__ 이미 구현됨
- [Source: packages/app/src/index.css] — Tailwind CSS 4 @theme 완성
- [Source: architecture.md#Decision 2] — activity-store 최근 200건 유지 정책

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: Zustand 스토어 3개 생성 — ws-store(connect/disconnect/send), notification-store(50개 제한, markAllRead), activity-store(200개 제한, ActivityLogType)
- ✅ Task 2: React.lazy + Suspense — app(11페이지), admin(9페이지) 모두 lazy import + PageSkeleton fallback 적용
- ✅ Task 3: 빌드 성공 (3 tasks), 타입 체크 성공, 전체 테스트 59 pass (app:14 + server-unit:41 + shared:4)
- ✅ admin은 auth-store만 필요 (관리자 콘솔에 WS/알림/활동로그 불필요)

### Change Log

- 2026-03-05: Story 1.4 구현 완료 — Zustand 스토어 3개 + React.lazy/Suspense (3개 태스크)

### File List

- packages/app/src/stores/ws-store.ts (신규 — WebSocket 상태 관리)
- packages/app/src/stores/notification-store.ts (신규 — 알림 관리, 최대 50개)
- packages/app/src/stores/activity-store.ts (신규 — 활동 로그, 최대 200개)
- packages/app/src/App.tsx (수정 — React.lazy + Suspense + PageSkeleton)
- packages/admin/src/App.tsx (수정 — React.lazy + Suspense + PageSkeleton)
- packages/app/src/__tests__/stores.test.ts (신규 — 스토어 테스트 10건)
