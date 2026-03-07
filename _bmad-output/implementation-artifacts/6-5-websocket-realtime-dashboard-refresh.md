# Story 6.5: WebSocket 실시간 대시보드 갱신

Status: done

## Story

As a **CEO (김대표)**,
I want **대시보드와 통신로그 화면이 WebSocket을 통해 실시간으로 자동 갱신**되도록,
so that **새 명령 완료, 비용 변동, 에이전트 상태 변경 시 새로고침 없이 즉시 최신 데이터를 확인할 수 있다**.

## Acceptance Criteria

1. **Given** 대시보드 진입 + WS 연결 **When** cost/agent-status/command 채널에 이벤트 수신 **Then** 해당 카드/차트가 자동 refetch (새로고침 불필요)
2. **Given** 통신로그 진입 + WS 연결 **When** activity-log/delegation/tool/command 채널에 이벤트 수신 **Then** 현재 탭의 데이터 자동 refetch
3. **Given** WS 연결 상태 **When** 연결됨 **Then** 초록 점 표시 / 끊어짐 시 빨간 점 + "재연결 중..." 표시
4. **Given** WS 연결 끊김 **When** 재연결 시도 **Then** 지수 백오프(3초→6초→12초→최대30초)로 자동 재연결
5. **Given** cost 이벤트 발생 (LLM 호출 완료 시) **When** 서버에서 cost 채널 이벤트 emit **Then** cost_records 기록 시 eventBus 통해 WS 브로드캐스트
6. **Given** useDashboardWs() 훅 **When** 관련 채널 이벤트 수신 **Then** react-query cache invalidation으로 자동 refetch 트리거
7. **Given** useActivityWs() 훅 **When** 관련 채널 이벤트 수신 **Then** 현재 활성 탭의 react-query cache invalidation
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: `cost` WS 채널 추가 (AC: #5)
  - [x] 1.1 `packages/shared/src/types.ts` — WsChannel에 `'cost'` 추가
  - [x] 1.2 `packages/server/src/ws/channels.ts` — `case 'cost':` 구독 핸들러 추가 (companyId 기반 격리)
  - [x] 1.3 `packages/server/src/lib/cost-tracker.ts` — recordCost() 함수에서 eventBus.emit('cost', { companyId, payload }) 추가
  - [x] 1.4 `packages/server/src/index.ts` — eventBus.on('cost') 리스너 추가 → broadcastToCompany

- [x] Task 2: useDashboardWs() 훅 (AC: #1, #6)
  - [x] 2.1 `packages/app/src/hooks/use-dashboard-ws.ts` 생성
  - [x] 2.2 WS 채널 구독: cost, agent-status, command
  - [x] 2.3 이벤트 수신 시 react-query invalidation:
    - cost → invalidate `['dashboard-summary']`, `['dashboard-usage']`, `['dashboard-budget']`
    - agent-status → invalidate `['dashboard-summary']`
    - command → invalidate `['dashboard-summary']`
  - [x] 2.4 dashboard.tsx에서 useDashboardWs() 호출 + REFETCH_INTERVAL 제거 (WS 대체)

- [x] Task 3: useActivityWs() 훅 (AC: #2, #7)
  - [x] 3.1 `packages/app/src/hooks/use-activity-ws.ts` 생성
  - [x] 3.2 WS 채널 구독: activity-log, delegation, tool, command
  - [x] 3.3 이벤트 수신 시 현재 활성 탭 기반 invalidation:
    - activity-log/command → invalidate `['activity-agents']`
    - delegation → invalidate `['activity-delegations']`
    - tool → invalidate `['activity-tools']`
    - command → invalidate `['activity-quality']` (QA는 command 완료 후 생성)
  - [x] 3.4 activity-log.tsx에서 useActivityWs(tab) 호출

- [x] Task 4: 연결 상태 표시 (AC: #3, #4)
  - [x] 4.1 `packages/app/src/components/ws-status-indicator.tsx` 생성 — 초록/빨간 점 + "연결됨"/"재연결 중..." 텍스트
  - [x] 4.2 ws-store.ts에 reconnectAttempt 카운터 추가 + 지수 백오프 개선 (3s→6s→12s→max 30s)
  - [x] 4.3 dashboard.tsx, activity-log.tsx 헤더에 WsStatusIndicator 배치

- [x] Task 5: 빌드 확인 + 테스트 (AC: #8)
  - [x] 5.1 turbo build 전체 성공 확인 (3/3)
  - [x] 5.2 기존 테스트 통과 확인 (server 7000 pass, app 252 pass)

## Dev Notes

### 기존 인프라 (이미 구현됨)

**WebSocket 서버:** `packages/server/src/ws/server.ts`
- JWT 인증, 최대 3개 연결 제한, subscribe/unsubscribe 메시지 처리
- `clientMap`: userId → WsClient[] (ws, userId, companyId, role, subscriptions)

**채널 핸들러:** `packages/server/src/ws/channels.ts`
- `handleSubscription()`: 채널별 권한 검증 후 구독 추가
- `broadcastToChannel(channelKey, data)`: 구독자에게 브로드캐스트
- `broadcastToCompany(companyId, event, data)`: 회사 전체 브로드캐스트
- 이미 구현된 채널: chat-stream, agent-status, notifications, messenger, activity-log, strategy-notes, night-job, nexus, command, delegation, tool

**EventBus 연결:** `packages/server/src/index.ts`
- eventBus.on('activity') → broadcastToCompany activity-log
- eventBus.on('agent-status') → broadcastToCompany agent-status
- eventBus.on('command') → broadcastToCompany command
- eventBus.on('delegation') → broadcastToCompany delegation
- eventBus.on('tool') → broadcastToCompany tool

**이벤트 발생원:** `packages/server/src/services/delegation-tracker.ts`
- eventBus.emit('command', ...) — 명령 시작/완료 시
- eventBus.emit('delegation', ...) — 위임 시작/완료 시
- eventBus.emit('tool', ...) — 도구 호출/완료/실패 시

**클라이언트 WS Store:** `packages/app/src/stores/ws-store.ts` (Zustand)
- connect(token), disconnect(), subscribe(channel, params)
- addListener(channelKey, fn), removeListener(channelKey, fn)
- 자동 재연결: 3초 고정 → 이번 스토리에서 지수 백오프로 개선
- channelListeners: Map<string, Set<WsEventListener>> (모듈 레벨)

**기존 WS 훅 패턴:** `packages/app/src/hooks/use-chat-stream.ts`
```typescript
// 참조 패턴:
const { subscribe, addListener, removeListener, isConnected } = useWsStore()
useEffect(() => {
  if (!isConnected) return
  subscribe('chat-stream', { id: sessionId })
  const handler = (data: unknown) => { /* process */ }
  addListener(`chat-stream::${sessionId}`, handler)
  return () => removeListener(`chat-stream::${sessionId}`, handler)
}, [sessionId, isConnected, ...])
```

### 누락된 cost 채널

**Architecture Decision #8**에 `cost` 채널이 정의되어 있으나 아직 구현 안 됨:
- WsChannel 타입에 `'cost'` 없음
- channels.ts에 cost case 없음
- cost-tracker.ts에 eventBus.emit 없음
- **이번 스토리에서 추가해야 함**

### 대시보드 현재 갱신 방식 (교체 대상)

`packages/app/src/pages/dashboard.tsx`:
```typescript
const REFETCH_INTERVAL = 30_000  // 30초 폴링 → WS로 교체
useQuery({ queryKey: ['dashboard-summary'], refetchInterval: REFETCH_INTERVAL })
useQuery({ queryKey: ['dashboard-usage', usageDays], refetchInterval: REFETCH_INTERVAL })
useQuery({ queryKey: ['dashboard-budget'], refetchInterval: REFETCH_INTERVAL })
```

### 통신로그 현재 갱신 방식

`packages/app/src/pages/activity-log.tsx`:
- 현재 수동 갱신만 (폴링 없음) → WS로 자동 갱신 추가

### react-query invalidation 패턴

```typescript
import { useQueryClient } from '@tanstack/react-query'
const queryClient = useQueryClient()
// 이벤트 수신 시:
queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
```

### WsChannel 타입 위치

`packages/shared/src/types.ts:351` — 'cost' 추가 필요

### Project Structure Notes

- 훅 파일: `packages/app/src/hooks/use-dashboard-ws.ts`, `use-activity-ws.ts`
- 컴포넌트: `packages/app/src/components/ws-status-indicator.tsx`
- 서버 채널: `packages/server/src/ws/channels.ts` (cost case 추가)
- EventBus 리스너: `packages/server/src/index.ts` (cost 리스너 추가)
- 공유 타입: `packages/shared/src/types.ts` (WsChannel에 cost 추가)

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-8] Real-time Communication Protocol
- [Source: _bmad-output/planning-artifacts/epics.md#E6-S5] WebSocket 실시간 대시보드 갱신
- [Source: packages/server/src/ws/channels.ts] 채널 구독 + broadcastToCompany
- [Source: packages/server/src/ws/server.ts] WS 서버 JWT 인증
- [Source: packages/app/src/stores/ws-store.ts] Zustand WS 스토어
- [Source: packages/app/src/hooks/use-chat-stream.ts] 기존 WS 훅 패턴
- [Source: packages/server/src/services/delegation-tracker.ts] eventBus.emit 패턴
- [Source: packages/server/src/index.ts:128-147] eventBus → broadcastToCompany 매핑
- [Source: packages/app/src/pages/dashboard.tsx] 대시보드 refetchInterval=30s
- [Source: packages/app/src/pages/activity-log.tsx] 통신로그 react-query

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Added `cost` WsChannel type, subscription handler in channels.ts (companyId isolation), eventBus.emit in cost-tracker.ts recordCost(), eventBus→WS bridge in index.ts
- Task 2: Created useDashboardWs() hook — subscribes to cost/agent-status/command channels, invalidates react-query cache on events. Removed 30s polling from dashboard.tsx
- Task 3: Created useActivityWs(tab) hook — subscribes to activity-log/delegation/tool/command channels, invalidates active tab's query cache
- Task 4: Created WsStatusIndicator component (green/red dot + text), added reconnectAttempt to ws-store with exponential backoff (3s→6s→12s→max 30s), placed indicator in dashboard and activity-log headers
- Task 5: turbo build 3/3 success. Server: 7000 tests pass, 7 new. App: 252 tests pass, 33 new. No regressions.

### File List

- packages/shared/src/types.ts (modified — added 'cost' to WsChannel)
- packages/server/src/ws/channels.ts (modified — added cost case to handleSubscription)
- packages/server/src/lib/cost-tracker.ts (modified — added eventBus import + emit in recordCost)
- packages/server/src/index.ts (modified — added eventBus.on('cost') listener)
- packages/app/src/hooks/use-dashboard-ws.ts (new — WS hook for dashboard)
- packages/app/src/hooks/use-activity-ws.ts (new — WS hook for activity log)
- packages/app/src/components/ws-status-indicator.tsx (new — connection status UI)
- packages/app/src/stores/ws-store.ts (modified — added reconnectAttempt + exponential backoff)
- packages/app/src/pages/dashboard.tsx (modified — integrated useDashboardWs, removed polling, added WsStatusIndicator)
- packages/app/src/pages/activity-log.tsx (modified — integrated useActivityWs, added WsStatusIndicator)
- packages/server/src/__tests__/unit/ws-realtime-dashboard.test.ts (new — 7 tests)
- packages/app/src/__tests__/ws-realtime.test.ts (new — 33 tests)
