# Story 11.5: P2 WebSocket 이벤트 — job-progress 진행률 + 이벤트 페이로드 보강 + 글로벌 토스트

Status: done

## Story

As a 사용자,
I want 야간작업 처리 중 실시간 진행률을 보고, 완료/실패 시 어떤 페이지에 있든 토스트 알림을 받는다,
so that 야간작업 상태를 실시간으로 파악하고 빠르게 결과를 확인할 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 processing 중 **When** AI 응답 시작/도구 실행 등 단계 진행 **Then** job-progress WebSocket 이벤트 발행 (progress 0-100 + statusMessage)
2. **Given** 야간작업 카드 **When** job-progress 이벤트 수신 **Then** 카드 하단에 ProgressBar + statusMessage 표시
3. **Given** 야간작업 카드 **When** progress 이벤트 없이 processing 상태 **Then** border-corthex-accent + pulse 좌측 바 표시 (graceful degradation)
4. **Given** job-completed 이벤트 **When** 발행 **Then** durationMs 포함 (처리 소요 시간)
5. **Given** job-failed 이벤트 **When** 발행 **Then** errorCode + retryCount 포함
6. **Given** 스케줄/트리거 워커 **When** 새 작업 생성 **Then** job-queued WebSocket 이벤트 발행 → 프론트 일회성 탭 즉시 갱신
7. **Given** 야간작업 완료/실패 **When** /jobs 이외 페이지에 있음 **Then** 토스트 알림 표시 (NotificationListener 패턴)
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: @corthex/ui ProgressBar 컴포넌트 생성 (AC: #2)
  - [x] `packages/ui/src/progress-bar.tsx` 생성
  - [x] props: value(0-100), className
  - [x] 기본 스타일: h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700, fill bg-indigo-500
  - [x] `packages/ui/src/index.ts`에 export 추가

- [x] Task 2: job-queue.ts — job-progress 이벤트 + 페이로드 보강 (AC: #1, #4, #5)
  - [x] processJob에 단계별 progress 이벤트 발행
  - [x] job-completed 페이로드에 `durationMs` 추가
  - [x] job-failed 페이로드에 `errorCode`, `retryCount` 추가

- [x] Task 3: schedule-worker.ts, trigger-worker.ts — job-queued 이벤트 (AC: #6)
  - [x] schedule-worker.ts: job-queued 이벤트 발행
  - [x] trigger-worker.ts: job-queued 이벤트 발행

- [x] Task 4: 프론트엔드 — JobCard ProgressBar + processing 스타일 (AC: #2, #3)
  - [x] jobProgress 로컬 상태 + wsHandler job-progress 핸들링
  - [x] ProgressBar + statusMessage 표시 (progress 있을 때)
  - [x] border-indigo-500 + pulse (progress 없을 때)
  - [x] job-completed/job-failed 시 progress 상태 제거

- [x] Task 5: 프론트엔드 — 글로벌 야간작업 토스트 알림 (AC: #7)
  - [x] night-job-listener.tsx 생성
  - [x] Layout에 NightJobListener 마운트

- [x] Task 6: wsHandler에 job-queued 핸들링 추가 (AC: #6)
  - [x] jobs.tsx wsHandler에 job-queued 이벤트 → invalidateQueries

- [x] Task 7: 빌드 검증 (AC: #8)
  - [x] `npx turbo build --force` → 3/3 성공 확인

## Dev Agent Record

### File List

**New Files:**
- `packages/ui/src/progress-bar.tsx` — ProgressBar 공유 컴포넌트
- `packages/app/src/components/night-job-listener.tsx` — 글로벌 야간작업 토스트 리스너

**Modified Files:**
- `packages/ui/src/index.ts` — ProgressBar export 추가
- `packages/server/src/lib/job-queue.ts` — emitProgress 헬퍼 + 단계별 progress 이벤트 + 페이로드 보강
- `packages/server/src/lib/schedule-worker.ts` — job-queued 이벤트 발행
- `packages/server/src/lib/trigger-worker.ts` — job-queued 이벤트 발행
- `packages/app/src/pages/jobs.tsx` — ProgressBar + jobProgress 상태 + wsHandler 보강
- `packages/app/src/components/layout.tsx` — NightJobListener 마운트

## Dev Notes

### 기존 인프라 활용

1. **night-job 채널 인프라** — Story 11-4에서 완성
   - channels.ts: night-job 구독 핸들러 (companyId 기반)
   - types.ts: WsChannel 타입에 'night-job' 포함
   - index.ts: EventBus → WS 브리지 `eventBus.on('night-job', ...)`
   - job-queue.ts: job-completed, job-failed, job-retrying 이벤트 이미 발행

2. **eventBus** — 이미 존재 (lib/event-bus.ts, EventEmitter)

3. **useWsStore** — 프론트 WS 스토어 (stores/ws-store.ts)
   - subscribe, addListener, removeListener 메서드

4. **NotificationListener 패턴** — notification-listener.tsx
   - Layout에 마운트, 전역 WS 리스너, 페이지별 토스트 분기

5. **toast** — @corthex/ui에서 제공 (toast.success, toast.error, toast.info)

### job-progress 이벤트 발행 전략

processJob 내부에서 단계별로 이벤트를 보내는 헬퍼 함수를 정의:

```typescript
function emitProgress(companyId: string, jobId: string, progress: number, statusMessage: string) {
  eventBus.emit('night-job', {
    companyId,
    payload: { type: 'job-progress', jobId, progress, statusMessage },
  })
}
```

**단계:**
1. `progress=0` — processJob 시작
2. `progress=20` — AI 응답 생성 시작 직전
3. `progress=60` — AI 응답 완료 후
4. `progress=80` — 보고서 생성 시작
5. `progress=100` — 작업 완료 직전

> 참고: generateAgentResponse는 non-streaming이므로 20→60 사이 세부 진행은 불가. 도구 사용이 있으면 더 세밀한 분할 가능하지만, 현재 processJob에서는 도구 콜백을 받지 않음. 향후 개선 가능.

### job-completed 페이로드 보강

```typescript
// 기존
{ type: 'job-completed', jobId, resultData }

// 보강 후
{ type: 'job-completed', jobId, resultData, durationMs }
// durationMs = completedAt.getTime() - (job.startedAt?.getTime() || Date.now())
```

### job-failed 페이로드 보강

```typescript
// 기존
{ type: 'job-failed', jobId, error: string }

// 보강 후
{ type: 'job-failed', jobId, errorCode: 'MAX_RETRIES_EXCEEDED', errorMessage, retryCount }
```

### ProgressBar 컴포넌트 스펙

```tsx
// packages/ui/src/progress-bar.tsx
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700', className)}>
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
```

### Processing 카드 스타일 (graceful degradation)

```tsx
// progress 정보가 없는 processing 상태
<div className={`border rounded-lg overflow-hidden ${
  job.status === 'processing'
    ? 'border-indigo-500 border-l-4 animate-pulse'
    : ...
}`}>
```

### 글로벌 토스트 리스너

```tsx
// night-job-listener.tsx — Layout에 마운트
export function NightJobListener() {
  // subscribe('night-job', {})
  // addListener(`night-job::${companyId}`, handler)
  // handler: job-completed → toast.success, job-failed → toast.error
  // /jobs 페이지에서는 토스트 비활성화 (이미 카드에서 볼 수 있으므로)
  return null
}
```

### 이전 스토리 교훈 (11-1 ~ 11-4)

- Badge variant: 'default' | 'info' | 'error' | 'success' | 'warning'
- ConfirmDialog: `isOpen` prop (not `open`)
- eventBus 패턴: `eventBus.emit('night-job', { companyId, payload })`
- WS 구독: `subscribe('night-job', {})` + `addListener(\`night-job::${companyId}\`, handler)`
- 보고서 생성 실패 격리: try-catch로 작업 완료에 영향 없게
- instruction 개행 치환: `.replace(/\n/g, ' ')`
- @corthex/ui 새 컴포넌트: 파일 생성 + index.ts export 추가

### trade-executed 이벤트

- UX spec에 정의되어 있으나 KIS 매매 도구가 아직 미구현
- 이 스토리 범위 밖 — 매매 도구 구현 시 해당 도구 핸들러에서 이벤트 발행 예정
- 참고: UX spec lines 841-852

### 주의사항

- progress 이벤트는 processJob 내부에서 단계적으로 발행 — 도구 실행 중 세밀한 진행률은 현재 불가
- job-queued 이벤트는 schedule/trigger 워커에서만 발행 — 사용자 직접 등록 시 POST API 응답으로 충분
- 글로벌 토스트는 /jobs 페이지에서 비활성화 — 중복 알림 방지
- ProgressBar는 공유 UI 컴포넌트 — @corthex/ui에 생성

### Project Structure Notes

- `packages/ui/src/progress-bar.tsx` — 새 파일 (ProgressBar 컴포넌트)
- `packages/ui/src/index.ts` — 기존 파일 수정 (ProgressBar export)
- `packages/server/src/lib/job-queue.ts` — 기존 파일 수정 (progress 이벤트 + 페이로드 보강)
- `packages/server/src/lib/schedule-worker.ts` — 기존 파일 수정 (job-queued 이벤트)
- `packages/server/src/lib/trigger-worker.ts` — 기존 파일 수정 (job-queued 이벤트)
- `packages/app/src/pages/jobs.tsx` — 기존 파일 수정 (ProgressBar + progress 상태 + job-queued 핸들링)
- `packages/app/src/components/night-job-listener.tsx` — 새 파일 (글로벌 토스트 리스너)
- `packages/app/src/components/layout.tsx` — 기존 파일 수정 (NightJobListener 마운트)

### References

- [Source: packages/server/src/lib/job-queue.ts:73-228] — processJob 전체 플로우
- [Source: packages/server/src/lib/schedule-worker.ts] — 스케줄 워커 (queueNightJob 호출)
- [Source: packages/server/src/lib/trigger-worker.ts] — 트리거 워커 (queueNightJob 호출)
- [Source: packages/server/src/ws/channels.ts:130-139] — night-job 구독 핸들러
- [Source: packages/server/src/index.ts:99-101] — night-job EventBus 브리지
- [Source: packages/shared/src/types.ts:107-114] — WsChannel 타입
- [Source: packages/app/src/stores/ws-store.ts] — WS 스토어
- [Source: packages/app/src/pages/jobs.tsx:188-206] — 기존 WS 구독 코드
- [Source: packages/app/src/components/notification-listener.tsx] — 글로벌 리스너 패턴
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:833-878] — P2 WS 이벤트 페이로드
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1109-1113] — job-progress UX 스펙
