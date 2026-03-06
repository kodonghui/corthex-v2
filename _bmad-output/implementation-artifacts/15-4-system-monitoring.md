# Story 15.4: System Monitoring (시스템 모니터링)

Status: done

## Story

As a platform admin (관리자),
I want a system monitoring page in the admin console that shows server health, uptime, memory usage, DB status, and recent error counts,
so that I can quickly assess the platform's operational health without SSH-ing into the server.

## Acceptance Criteria

1. **Given** admin logged in **When** navigating to `/admin/monitoring` **Then** 시스템 모니터링 페이지가 렌더링된다 (사이드바에 "시스템 모니터링" 메뉴 추가)
2. **Given** 모니터링 페이지 **When** 로드 완료 **Then** 서버 상태 카드 표시: 서버 상태 (ok/error), 업타임 (사람이 읽기 쉬운 형식: "3일 2시간 15분"), Node/Bun 버전, 빌드 번호
3. **Given** 모니터링 페이지 **When** 로드 완료 **Then** 메모리 카드 표시: RSS 메모리 (MB), 힙 사용량/총량 (MB), 사용률 퍼센트 바 (80% 이상 amber, 90% 이상 red)
4. **Given** 모니터링 페이지 **When** 로드 완료 **Then** DB 상태 카드 표시: 연결 상태 (ok/error), 응답 시간 (ms)
5. **Given** 모니터링 페이지 **When** 로드 완료 **Then** 에러 요약 카드 표시: 최근 24시간 에러 수 (메모리 내 카운터), 최근 에러 메시지 (최대 5건, 시간 + 메시지)
6. **Given** 모니터링 페이지 **When** "새로고침" 버튼 클릭 **Then** 모든 카드 데이터가 다시 로드됨 (수동 새로고침) + 30초 자동 폴링
7. **Given** 비관리자 유저 **When** `GET /admin/monitoring/status` 호출 **Then** 401/403 반환
8. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: 서버 에러 카운터 유틸리티 (AC: #5)
  - [x] `packages/server/src/utils/error-counter.ts` 생성
  - [x] 인메모리 에러 카운터: `recordError(message: string)`, `getRecentErrors()`, `getErrorCount24h()`
  - [x] 최근 에러 100건까지 순환 버퍼 저장 (시간 + 메시지)
  - [x] 24시간 이상 된 에러 자동 제거 (getErrorCount24h 호출 시 정리)

- [x] Task 2: 시스템 모니터링 API 엔드포인트 (AC: #2, #3, #4, #5, #7)
  - [x] `packages/server/src/routes/admin/monitoring.ts` 생성
  - [x] `authMiddleware + adminOnly` 적용
  - [x] `GET /monitoring/status` → 서버 상태, 업타임, 버전, 메모리, DB 상태, 에러 요약 한 번에 반환
  - [ ] 응답 형태:
    ```json
    {
      "server": {
        "status": "ok",
        "uptime": 123456,
        "version": { "build": "123", "hash": "abc1234", "runtime": "Bun 1.x" }
      },
      "memory": {
        "rss": 123.4,
        "heapUsed": 56.7,
        "heapTotal": 128.0,
        "usagePercent": 44.3
      },
      "db": {
        "status": "ok",
        "responseTimeMs": 12
      },
      "errors": {
        "count24h": 3,
        "recent": [
          { "timestamp": "2026-03-06T10:00:00Z", "message": "..." }
        ]
      }
    }
    ```

- [x] Task 3: 에러 핸들러에 카운터 연동 (AC: #5)
  - [x] `packages/server/src/middleware/error.ts`의 errorHandler에서 `recordError()` 호출 추가
  - [x] 기존 에러 핸들러 동작에 영향 없이 카운터만 추가

- [x] Task 4: 서버 index.ts에 모니터링 라우트 등록 (AC: #7)
  - [x] `packages/server/src/index.ts`에 monitoringRoute import + `app.route('/api/admin', monitoringRoute)` 추가
  - [x] 기존 admin 라우트 아래에 추가

- [x] Task 5: Admin 모니터링 페이지 UI (AC: #1, #2, #3, #4, #5, #6)
  - [x] `packages/admin/src/pages/monitoring.tsx` 생성
  - [x] 4개 카드 레이아웃: 서버 상태, 메모리, DB, 에러
  - [x] 업타임을 "X일 Y시간 Z분" 형식으로 변환
  - [x] 메모리 사용률 퍼센트 바 (80%+ amber, 90%+ red)
  - [x] 에러 목록 (최근 5건, 시간 + 메시지)
  - [x] 새로고침 버튼 + 30초 자동 폴링 (react-query refetchInterval)

- [x] Task 6: Admin 사이드바 + 라우터 등록 (AC: #1)
  - [x] `packages/admin/src/components/sidebar.tsx`의 nav 배열에 `{ to: '/monitoring', label: '시스템 모니터링', icon: '🖥️' }` 추가
  - [x] `packages/admin/src/App.tsx`에 MonitoringPage lazy import + Route 추가

- [x] Task 7: 빌드 검증 (AC: #8)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **Health Route** (`packages/server/src/routes/health.ts`)
   - 이미 존재: `GET /api/health` → `{ status, checks: { db }, version: { build, hash, uptime } }`
   - 모니터링 API는 health보다 더 상세한 정보를 제공 (메모리, 에러 등)
   - health 라우트를 수정하지 말 것 — 별도 admin 전용 엔드포인트

2. **Admin Route 패턴** (`packages/server/src/routes/admin/*.ts`)
   - `new Hono<AppEnv>()` + `.use('*', authMiddleware, adminOnly)` 패턴
   - import: `authMiddleware, adminOnly` from `../../middleware/auth`
   - import: `HTTPError` from `../../middleware/error`
   - import: `AppEnv` from `../../types`

3. **Error Handler** (`packages/server/src/middleware/error.ts`)
   - `export function errorHandler(err, c)` — 기존 핸들러에 recordError 호출만 추가

4. **Admin 사이드바** (`packages/admin/src/components/sidebar.tsx`)
   - `nav` 배열에 메뉴 항목 추가하면 자동으로 사이드바에 표시
   - 아이콘은 이모지 사용 (기존 패턴: 📊, 🏛️, 👥, 🏢, 🤖, 🔧, 🔑, 📋, ✨)

5. **Admin App.tsx** (`packages/admin/src/App.tsx`)
   - `lazy(() => import(...).then(m => ({ default: m.XxxPage })))` 패턴
   - `<Route path="xxx" element={<Suspense fallback={<PageSkeleton />}><XxxPage /></Suspense>} />`

6. **Admin API Client** (`packages/admin/src/lib/api.ts`)
   - `api.get<T>(url)` 패턴으로 호출

7. **UI 컴포넌트** (`@corthex/ui`)
   - Card, CardContent, Badge, Skeleton 등 공유 컴포넌트 사용
   - 다크 모드: `dark:` Tailwind 프리픽스

### Memory & Process Info (Bun runtime)

```typescript
// Bun에서 메모리 정보 가져오기
const mem = process.memoryUsage()
// { rss, heapTotal, heapUsed, external, arrayBuffers }

// 업타임 (초)
process.uptime()

// 런타임 버전
typeof Bun !== 'undefined' ? `Bun ${Bun.version}` : `Node ${process.version}`
```

### 업타임 포맷팅 (프론트엔드)

```typescript
function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return [d && `${d}일`, h && `${h}시간`, `${m}분`].filter(Boolean).join(' ')
}
```

### 에러 카운터 패턴

```typescript
// packages/server/src/utils/error-counter.ts
type ErrorEntry = { timestamp: number; message: string }
const errors: ErrorEntry[] = []
const MAX_ERRORS = 100

export function recordError(message: string) {
  errors.push({ timestamp: Date.now(), message })
  if (errors.length > MAX_ERRORS) errors.shift()
}

export function getRecentErrors(limit = 5): ErrorEntry[] {
  return errors.slice(-limit).reverse()
}

export function getErrorCount24h(): number {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  // 오래된 항목 정리
  while (errors.length > 0 && errors[0].timestamp < cutoff) errors.shift()
  return errors.length
}
```

### DB 응답 시간 측정

```typescript
const start = performance.now()
await db.execute(sql`SELECT 1`)
const responseTimeMs = Math.round(performance.now() - start)
```

### 보안 고려사항

- 모니터링 엔드포인트는 admin 전용 (authMiddleware + adminOnly)
- 메모리/에러 정보는 민감할 수 있으므로 admin만 접근
- 에러 메시지에서 스택 트레이스는 제외 — 메시지만 저장

### Project Structure Notes

- `packages/server/src/utils/error-counter.ts` (신규 - 인메모리 에러 카운터)
- `packages/server/src/routes/admin/monitoring.ts` (신규 - 모니터링 API)
- `packages/server/src/middleware/error.ts` (수정 - recordError 호출 추가)
- `packages/server/src/index.ts` (수정 - monitoringRoute 등록)
- `packages/admin/src/pages/monitoring.tsx` (신규 - 모니터링 페이지 UI)
- `packages/admin/src/components/sidebar.tsx` (수정 - nav 메뉴 추가)
- `packages/admin/src/App.tsx` (수정 - 라우트 + lazy import 추가)

### References

- [Source: packages/server/src/routes/health.ts] — 기존 health 체크 패턴
- [Source: packages/server/src/routes/admin/soul-templates.ts] — admin 라우트 패턴 (authMiddleware + adminOnly)
- [Source: packages/server/src/index.ts:68-75] — admin 라우트 등록 패턴
- [Source: packages/admin/src/App.tsx] — admin 페이지 lazy import + 라우트 패턴
- [Source: packages/admin/src/components/sidebar.tsx:14-24] — nav 배열 패턴
- [Source: packages/admin/src/pages/dashboard.tsx] — StatCard + 레이아웃 패턴
- [Source: packages/server/src/middleware/error.ts] — 에러 핸들러

### Previous Story Intelligence (15-3)

- Story 15-3에서 CodeMirror 에디터 추가됨 (soul-editor.tsx)
- 빌드: 8/8 success, 1157 tests pass
- 커밋 패턴: `feat: Story X-Y 제목 — 변경 요약 + TEA N건`
- Code Review에서 발견된 이슈는 자동 수정됨 (singleton → instance ref 등)

### Git Intelligence

Recent commits:
- `1869cc3` feat: Story 15-3 소울 에디터 — CodeMirror 마크다운 에디터 + TEA 46건
- `1625ffd` feat: Story 15-2 소울 템플릿 관리 — admin CRUD + workspace API + UI + TEA 43건
- `f2af5b1` feat: Story 15-1 P3 DB 스키마 — soulTemplates 테이블 + 마이그레이션 + 타입 + TEA 53건
- 커밋 명명: `feat: Story X-Y 제목 — 변경 요약 + TEA N건`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Created error-counter.ts with recordError, getRecentErrors, getErrorCount24h. Circular buffer (MAX 100), auto-cleanup of 24h+ entries.
- Task 2: Created monitoring.ts admin route with GET /monitoring/status. Returns server info (uptime, runtime, build), memory (RSS, heap, usage%), DB status (ping + response time), errors (count24h + recent 5).
- Task 3: Added recordError() call to errorHandler in error.ts. Captures error message on every server error.
- Task 4: Registered monitoringRoute in index.ts under /api/admin.
- Task 5: Created monitoring.tsx admin page with 4 cards (server, memory, DB, errors). MemoryBar with color thresholds (80% amber, 90% red). 30s auto-polling via react-query refetchInterval. Manual refresh button.
- Task 6: Added sidebar nav item and lazy route in App.tsx.
- Task 7: Build 8/8 success. 1252 unit tests pass, 0 regressions. 67 tests for monitoring (TEA expanded).
- Code Review: Fixed 5 issues — 5xx-only error recording, null assertion removal, message truncation (500 chars), error UI state. 2 MEDIUM + 2 LOW + 1 MEDIUM issues resolved.
- TEA: 67 tests total (expanded from 21 during TEA phase)

### File List

- packages/server/src/utils/error-counter.ts (new - in-memory error counter with 500-char truncation)
- packages/server/src/routes/admin/monitoring.ts (new - monitoring API endpoint)
- packages/server/src/middleware/error.ts (modified - recordError for 5xx only)
- packages/server/src/index.ts (modified - registered monitoringRoute)
- packages/admin/src/pages/monitoring.tsx (new - monitoring UI page with error state)
- packages/admin/src/components/sidebar.tsx (modified - added nav item)
- packages/admin/src/App.tsx (modified - added lazy import + route)
- packages/server/src/__tests__/unit/system-monitoring.test.ts (new - 67 tests)
