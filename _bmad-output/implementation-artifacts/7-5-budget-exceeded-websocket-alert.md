# Story 7.5: 예산 초과 WebSocket 알림

Status: done

## Story

As a CEO (사용자),
I want 예산 경고(80%) 및 초과(100%) 시 실시간 WebSocket 알림을 CEO 앱에서 토스트/모달로 확인한다,
so that 예산 한도에 도달하거나 초과했을 때 즉시 인지하고 대응할 수 있다.

## Acceptance Criteria

1. **Given** cost 채널 WS 구독 중 **When** budget-warning 이벤트 수신 **Then** CEO 앱에 경고 토스트 표시 (현재 비용, 예산, 사용률 %)
2. **Given** cost 채널 WS 구독 중 **When** budget-exceeded 이벤트 수신 **Then** CEO 앱에 차단 모달 표시 ("예산 초과" + 현재 비용 + 예산 + 확인 버튼)
3. **Given** 경고 토스트/모달 표시 후 **When** 페이지 새로고침 **Then** 동일 알림 재표시 안 함 (localStorage 기반 중복 방지)
4. **Given** 새 월/일 시작 **When** 예산 리셋 **Then** localStorage 알림 기록 초기화 (resetDate 기반)
5. **Given** Admin 콘솔 **When** budget-warning/exceeded 이벤트 발생 **Then** Admin 콘솔에도 알림 표시 (토스트)
6. **Given** useBudgetAlerts 훅 **When** cost 채널 리스닝 **Then** budget-warning과 budget-exceeded 타입만 필터링 처리
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 패키지 성공

## Tasks / Subtasks

- [x] Task 1: CEO 앱 useBudgetAlerts 훅 (AC: #1, #2, #3, #4, #6)
  - [x] 1.1 `packages/app/src/hooks/use-budget-alerts.ts` 생성
  - [x] 1.2 useWsStore의 subscribe('cost') + addListener('cost', handler)
  - [x] 1.3 handler에서 budget-warning → toast.warning(), budget-exceeded → 모달 상태 set
  - [x] 1.4 localStorage 중복 방지: `budget_alert_{type}_{level}_{resetDate}` 키로 표시 여부 추적
  - [x] 1.5 resetDate 비교로 월/일 갱신 시 이전 알림 기록 자동 만료

- [x] Task 2: 예산 초과 모달 컴포넌트 (AC: #2)
  - [x] 2.1 `packages/app/src/components/budget-exceeded-modal.tsx` 생성
  - [x] 2.2 현재 비용($), 예산($), level(월간/일일), 확인 버튼 표시
  - [x] 2.3 확인 클릭 시 모달 닫기 + localStorage에 확인 기록

- [x] Task 3: Layout에 BudgetAlertListener 마운트 (AC: #1, #2)
  - [x] 3.1 `packages/app/src/components/budget-alert-listener.tsx` 생성 — useBudgetAlerts + BudgetExceededModal 렌더
  - [x] 3.2 `packages/app/src/components/layout.tsx`에 BudgetAlertListener 추가 (NotificationListener 옆)

- [x] Task 4: Admin 콘솔 예산 알림 (AC: #5)
  - [x] 4.1 `packages/admin/src/hooks/use-budget-alerts.ts` 생성 (Admin은 WS 없으므로 60초 폴링 방식)
  - [x] 4.2 Admin Layout에 AdminBudgetAlertListener 마운트
  - [x] 4.3 Admin은 토스트만 (모달 없음) — useToastStore.addToast

- [x] Task 5: 테스트 (AC: 전체)
  - [x] 5.1 useBudgetAlerts 훅 테스트 (CEO 앱) — localStorage helpers, event filtering
  - [x] 5.2 BudgetExceededModal 데이터 구조 테스트
  - [x] 5.3 localStorage 중복 방지 테스트
  - [x] 5.4 Admin 예산 알림 로직 테스트

- [x] Task 6: 빌드 검증 (AC: #7) — turbo build 3/3 성공

## Dev Notes

### 핵심: 서버 이벤트는 이미 구현 완료 (Story 7-2)

**BudgetGuard 이벤트 (packages/server/src/services/budget-guard.ts):**
- `emitBudgetWarning()` (line 124-143): `eventBus.emit('cost', { companyId, payload: { type: 'budget-warning', level, currentSpendUsd, budgetUsd, usagePercent, resetDate } })`
- `emitBudgetExceeded()` (line 145-162): `eventBus.emit('cost', { companyId, payload: { type: 'budget-exceeded', level, currentSpendUsd, budgetUsd, resetDate } })`

**EventBus → WS 브리지 (packages/server/src/index.ts:153-154):**
- `eventBus.on('cost', ...)` → `broadcastToCompany(companyId, 'cost', payload)` — 이미 동작 중

**결론: 서버 코드 수정 불필요. 클라이언트만 구현하면 됨.**

### WS 이벤트 페이로드 구조

```typescript
// budget-warning (경고, 80% 임계값 도달)
{
  type: 'budget-warning',
  level: 'monthly' | 'daily',
  currentSpendUsd: number,    // e.g. 410.50 (이미 USD 변환됨)
  budgetUsd: number,          // e.g. 500.00
  usagePercent: number,       // e.g. 82
  resetDate: string,          // e.g. '2026-04-01'
}

// budget-exceeded (초과, 100% 차단)
{
  type: 'budget-exceeded',
  level: 'monthly' | 'daily',
  currentSpendUsd: number,
  budgetUsd: number,
  resetDate: string,
}
```

### CEO 앱 WS 패턴 (반드시 따를 것)

**기존 패턴 (packages/app/src/components/notification-listener.tsx):**
```typescript
import { useWsStore } from '../stores/ws-store'
import { toast } from '@corthex/ui'

// 1. subscribe('cost') — 채널 구독
// 2. addListener('cost', handler) — 이벤트 리스너 등록
// 3. handler 내에서 data.type으로 분기
// 4. cleanup: removeListener('cost', handler)
```

**toast API (packages/ui/src/toast.tsx):**
- `toast.info(message)`, `toast.success(message)`, `toast.warning(message)`, `toast.error(message)`

### localStorage 중복 방지 패턴

```typescript
const STORAGE_PREFIX = 'corthex_budget_alert_'

function getAlertKey(type: string, level: string, resetDate: string): string {
  return `${STORAGE_PREFIX}${type}_${level}_${resetDate}`
}

function wasAlertShown(type: string, level: string, resetDate: string): boolean {
  return localStorage.getItem(getAlertKey(type, level, resetDate)) === 'shown'
}

function markAlertShown(type: string, level: string, resetDate: string): void {
  localStorage.setItem(getAlertKey(type, level, resetDate), 'shown')
}

// resetDate 변경 시 이전 기간 알림 키 자동 만료 (cleanup)
function cleanupExpiredAlerts(): void {
  const today = new Date().toISOString().split('T')[0]
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX)) {
      const resetDate = key.split('_').pop()
      if (resetDate && resetDate < today) {
        localStorage.removeItem(key)
      }
    }
  }
}
```

### BudgetExceededModal 디자인

```tsx
// 심플한 오버레이 모달 — 기존 app 패턴과 일치
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
  <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 mx-4 max-w-sm shadow-xl">
    <h2 className="text-lg font-bold text-red-600 mb-2">예산 초과</h2>
    <p>현재 비용: ${currentSpendUsd}</p>
    <p>예산 한도: ${budgetUsd}</p>
    <p className="text-sm text-zinc-500">{level === 'monthly' ? '월간' : '일일'} 예산 초과로 AI 호출이 차단되었습니다</p>
    <button onClick={onConfirm} className="mt-4 w-full ...">확인</button>
  </div>
</div>
```

### Admin 콘솔 예산 알림 패턴

**Admin WS 연결:**
- Admin 앱에는 기존 WS 연결이 없을 수 있음
- Admin에 WS 인프라가 없으면 **SSE 또는 폴링 대신**, Admin의 기존 토스트 시스템(`useToastStore`)만 사용
- Admin 비용 대시보드(costs.tsx)에서 React Query 폴링(30초)으로 예산 상태 확인하여 토스트 표시하는 방식 권장

**확인할 것:**
- `packages/admin/src/stores/` — WS store 존재 여부 확인
- Admin에 WS가 없으면: costs.tsx의 useQuery `refetchInterval: 30000`으로 예산 상태 체크 + 임계값 초과 시 토스트
- Admin에 WS가 있으면: CEO 앱과 동일한 useBudgetAlerts 훅 생성

**Admin 토스트 (packages/admin/src/stores/toast-store.ts):**
- `addToast({ type: 'warning', message: '...' })` 패턴

### useDashboardWs와의 관계

**기존 useDashboardWs (packages/app/src/hooks/use-dashboard-ws.ts):**
- 이미 'cost' 채널 구독 + React Query 캐시 무효화
- useBudgetAlerts는 **동일 'cost' 채널의 추가 리스너** — 구독 중복은 WS 서버에서 무시됨
- useBudgetAlerts는 data.type === 'budget-warning' || 'budget-exceeded'만 처리
- useDashboardWs는 모든 cost 이벤트에 대해 캐시 무효화 (기존 기능 유지)

### Project Structure Notes

- 신규: `packages/app/src/hooks/use-budget-alerts.ts` (CEO 앱 예산 알림 훅)
- 신규: `packages/app/src/components/budget-exceeded-modal.tsx` (예산 초과 모달)
- 신규: `packages/app/src/components/budget-alert-listener.tsx` (Layout 마운트 리스너)
- 수정: `packages/app/src/components/layout.tsx` (BudgetAlertListener 추가)
- 신규/수정: Admin 예산 알림 (WS 유무에 따라 결정)
- 테스트: `packages/app/src/__tests__/budget-alerts.test.ts`

### 주의사항 (Developer Guardrails)

1. **서버 코드 수정 금지** — BudgetGuard 이벤트는 이미 완성 (7-2에서 구현)
2. **toast import는 `@corthex/ui`에서** — `import { toast } from '@corthex/ui'` (notification-listener.tsx 패턴)
3. **useWsStore에서 subscribe + addListener** — ws-store.ts 패턴 그대로 따르기
4. **cost 채널 구독 중복 OK** — useDashboardWs와 useBudgetAlerts 모두 'cost' 구독해도 문제 없음
5. **WS 이벤트의 값은 이미 USD** — currentSpendUsd, budgetUsd는 서버에서 변환 완료 (microToUsd 불필요)
6. **localStorage 키에 resetDate 포함** — 월/일 갱신 시 자동으로 새 알림 표시
7. **모달은 budget-exceeded에만** — warning은 토스트, exceeded는 모달
8. **Layout에 마운트** — NotificationListener, NightJobListener와 같은 패턴
9. **다크 모드 지원** — 모든 컴포넌트에 dark: 클래스
10. **Korean UI** — 모든 텍스트는 한국어

### References

- [Source: packages/server/src/services/budget-guard.ts:124-162] — emitBudgetWarning/emitBudgetExceeded 이벤트 구조
- [Source: packages/server/src/index.ts:153-154] — EventBus → WS 브리지 (cost 채널)
- [Source: packages/app/src/stores/ws-store.ts] — WS store, subscribe/addListener/removeListener API
- [Source: packages/app/src/hooks/use-dashboard-ws.ts] — 기존 cost 채널 구독 패턴
- [Source: packages/app/src/components/notification-listener.tsx] — 전역 WS 리스너 + toast 패턴
- [Source: packages/app/src/components/layout.tsx:6-7,60-61] — Layout 글로벌 리스너 마운트 위치
- [Source: packages/ui/src/toast.tsx:18] — toast.info/success/warning/error API
- [Source: packages/admin/src/stores/toast-store.ts] — Admin 토스트 패턴
- [Source: _bmad-output/planning-artifacts/epics.md:1185-1186] — E7-S5 수용 기준
- [Source: _bmad-output/implementation-artifacts/7-2-budget-limit-auto-block.md] — BudgetGuard 구현 상세

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- useBudgetAlerts hook: subscribes to cost WS channel, filters budget-warning/budget-exceeded events, shows toast for warning + modal for exceeded
- BudgetExceededModal: overlay modal with current spend, budget limit, level label (monthly/daily), confirm button
- BudgetAlertListener: mounted in Layout alongside NotificationListener and NightJobListener
- localStorage dedup: keys include type+level+resetDate, auto-cleanup of expired keys on mount
- Admin polling alerts: 60s refetchInterval on budget+summary queries, toast on threshold crossing (no WS in admin)
- AdminBudgetAlertListener: mounted in admin Layout, uses useToastStore (addToast with type 'error'/'info')
- Tests: 18 tests (localStorage helpers, event structure, duplicate prevention, WS event filtering, admin polling logic)
- Build: 3/3 turbo build passing, 295 app tests passing

### File List

- packages/app/src/hooks/use-budget-alerts.ts (NEW — CEO 앱 예산 알림 WS 훅)
- packages/app/src/components/budget-exceeded-modal.tsx (NEW — 예산 초과 차단 모달)
- packages/app/src/components/budget-alert-listener.tsx (NEW — Layout 마운트 리스너)
- packages/app/src/components/layout.tsx (MODIFIED — BudgetAlertListener import + 마운트)
- packages/admin/src/hooks/use-budget-alerts.ts (NEW — Admin 예산 알림 폴링 훅)
- packages/admin/src/components/budget-alert-listener.tsx (NEW — Admin Layout 리스너)
- packages/admin/src/components/layout.tsx (MODIFIED — AdminBudgetAlertListener 마운트)
- packages/app/src/__tests__/budget-alerts.test.ts (NEW — 18 tests)
