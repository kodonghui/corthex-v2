# Story 11.5: 야간작업 WebSocket 이벤트 — 실시간 진행/완료/실패 알림

Status: review

## Story

As a 일반 직원(유저),
I want 야간작업 진행 상황을 실시간으로 받아볼 수 있다,
so that 페이지를 새로고침하지 않아도 작업 상태를 즉시 알 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 처리 시작 **When** processJob 실행 **Then** `job-progress` WS 이벤트 발송 (statusMessage: "작업 처리 중...")
2. **Given** 야간작업 완료 **When** status=completed **Then** `job-completed` WS 이벤트 발송 (durationMs, reportId)
3. **Given** 야간작업 실패 **When** 최대 재시도 초과 **Then** `job-failed` WS 이벤트 발송 (errorMessage, retryCount)
4. **Given** 야간작업 페이지 **When** WS 이벤트 수신 **Then** 해당 작업 카드 즉시 업데이트 (queryClient invalidate)
5. **Given** WS 이벤트 수신 **When** job-completed **Then** toast "야간 작업 완료" 표시
6. **Given** WS 이벤트 수신 **When** job-failed **Then** toast "야간 작업 실패" 표시
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 서버 — job-queue.ts에 WS 이벤트 발송 (AC: #1, #2, #3)
  - [x] broadcastToCompany import
  - [x] processJob 시작 시 job-progress 이벤트
  - [x] 완료 시 job-completed 이벤트 (durationMs, reportId, sessionId)
  - [x] 최종 실패 시 job-failed 이벤트 (errorMessage, retryCount)

- [x] Task 2: 서버 — channels.ts에 night-jobs 채널 구독 처리 (AC: #1)
  - [x] handleSubscription에 'night-jobs' case 추가 (companyId 기반)

- [x] Task 3: 프론트엔드 — WS 이벤트 수신 + UI 반영 (AC: #4, #5, #6)
  - [x] jobs.tsx에 useEffect로 WS night-jobs 채널 구독
  - [x] 이벤트 수신 시 queryClient.invalidateQueries(['night-jobs'])
  - [x] job-completed → toast.success, job-failed → toast.error

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 기존 코드 참조

- **WS 브로드캐스트**: `packages/server/src/ws/channels.ts` — `broadcastToCompany()` 함수
- **채널 구독**: `packages/server/src/ws/channels.ts` — `handleSubscription()` switch/case
- **EventBus 브리지**: `packages/server/src/index.ts:90-99`
- **작업 큐**: `packages/server/src/lib/job-queue.ts` — processJob 함수

### WS 이벤트 형식

```typescript
// night-jobs 채널 이벤트
{ type: 'job-progress', jobId: string, statusMessage: string }
{ type: 'job-completed', jobId: string, durationMs: number, reportId: string | null }
{ type: 'job-failed', jobId: string, errorMessage: string, retryCount: number }
```

### 브로드캐스트 패턴

```typescript
import { broadcastToCompany } from '../ws/channels'

broadcastToCompany(job.companyId, 'night-jobs', {
  type: 'job-completed',
  jobId: job.id,
  durationMs: Date.now() - job.startedAt.getTime(),
  reportId: reportId || null,
})
```

### 프론트 WS 구독 패턴

기존 notification-listener.tsx에서 WS 구독 패턴 참조.
jobs.tsx에서는 useEffect로 간단하게 구독:
```typescript
// ws.subscribe('night-jobs') → onMessage → invalidateQueries
```

### 파일 구조

```
수정 파일:
  packages/server/src/lib/job-queue.ts (WS 이벤트 발송)
  packages/server/src/ws/channels.ts (night-jobs 채널 구독)
  packages/app/src/pages/jobs.tsx (WS 이벤트 수신 + toast)
```

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- job-queue.ts에서 broadcastToCompany로 job-progress/completed/failed 이벤트 발송
- channels.ts에 night-jobs 채널 구독 핸들러 추가 (companyId 기반)
- shared/types.ts WsChannel에 'night-jobs' 추가
- 프론트 JobsPage에서 WS 구독 + invalidateQueries + toast 알림
- turbo build 3/3 성공

### File List

- packages/server/src/lib/job-queue.ts (수정 — WS 이벤트 3종 발송)
- packages/server/src/ws/channels.ts (수정 — night-jobs 채널 구독)
- packages/shared/src/types.ts (수정 — WsChannel에 'night-jobs' 추가)
- packages/app/src/pages/jobs.tsx (수정 — WS 구독 + toast 알림)
