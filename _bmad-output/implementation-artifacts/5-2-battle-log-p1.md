# Story 5.2: Battle Log P1 — 작전일지 실시간 타임라인

Status: done

## Story

As a 일반 직원(유저),
I want 작전일지에서 모든 에이전트 활동을 실시간으로 타임라인 형태로 확인한다,
so that 비서 위임, 도구 호출, 채팅 등 회사 AI 활동을 즉시 모니터링할 수 있다.

## Acceptance Criteria

1. **Given** /ops-log 진입 **When** 활동 로그 로드 **Then** 타임라인 세로선 + 도트 + 카드 UI로 표시
2. **Given** 필터 칩 클릭 **When** 복수 타입 선택 가능 **Then** 선택된 타입만 필터링 (활성=강조색, 비활성=뮤트)
3. **Given** 에이전트 활동 발생 **When** WebSocket 활성 **Then** 새 로그가 실시간으로 타임라인에 추가됨
4. **Given** 스크롤 아래로 내린 상태 **When** 새 로그 도착 **Then** "새로운 활동 N건" 배너 표시
5. **Given** start 이벤트 후 end 이벤트 **When** 간격 < 3초 **Then** 카드 1개로 합침 (완료 표시)
6. **Given** URL /ops-log?filter=delegation **When** 페이지 진입 **Then** 해당 필터 칩 자동 활성화
7. **Given** 실시간 연결 **When** WS 연결 상태 **Then** 필터 바에 실시간 ON/재연결 중 표시

## Tasks / Subtasks

- [x] Task 1: 서버 — activity-log에 실시간 브로드캐스트 추가 (AC: #3)
  - [x] logActivity에서 로그 삽입 후 broadcastToChannel('activity-log::{companyId}', logData) 발송
  - [x] phase 정보 포함하여 start/end 구분 가능하게
  - [x] activity-log API에 eventId, phase 필드 추가 반환
- [x] Task 2: 프론트엔드 — 타임라인 UI 리팩토링 (AC: #1)
  - [x] ops-log.tsx를 세로 타임라인 레이아웃으로 변경 (세로선 + 도트 + 카드)
  - [x] phase별 도트 색상: start=노란 pulse, end=초록, error=빨강
  - [x] 타입별 아이콘: chat=💬 tool_call=🔧 delegation=🔀 system=⚙️ error=❌
  - [x] 날짜 그룹 구분 (오늘/어제/이전)
- [x] Task 3: 프론트엔드 — 필터 칩 복수 선택 + URL 동기화 (AC: #2, #6)
  - [x] FilterChip: 활성=bg-indigo-600 text-white, 비활성=bg-zinc-100
  - [x] 복수 선택 가능 (Set으로 관리)
  - [x] URL searchParams와 동기화 (?filter=chat,delegation)
- [x] Task 4: 프론트엔드 — WebSocket 실시간 스트리밍 (AC: #3, #4, #7)
  - [x] activity-log 채널 구독
  - [x] 새 로그 도착 시 타임라인 상단에 추가
  - [x] 스크롤 내린 상태면 "새로운 활동 N건" 배너 표시
  - [x] 연결 상태 표시 (실시간 ON / 재연결 중)
- [x] Task 5: 프론트엔드 — start/end 쌍 매칭 (AC: #5)
  - [x] eventId 기준 start/end 매칭
  - [x] 간격 < 3초면 카드 합침 (완료 + duration 표시)
  - [x] 간격 > 3초면 별도 카드
- [x] Task 6: 빌드 + 테스트
  - [x] turbo build 3/3 성공
  - [x] bun test 139 pass, 0 fail

## Dev Notes

### 핵심: 기존 ops-log.tsx 리팩토링 + WS 실시간 추가

기존 ops-log.tsx는 REST만 사용하는 단순 목록. 이 스토리에서 타임라인 UI + 실시간 WS로 업그레이드합니다.

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/server/src/lib/activity-logger.ts` — logActivity() fire-and-forget
- `packages/server/src/routes/workspace/activity-log.ts` — GET /workspace/activity-log + summary
- `packages/server/src/ws/channels.ts` — activity-log 채널 구독 로직 이미 구현
- `packages/app/src/pages/ops-log.tsx` — 기본 목록 UI (150줄)
- `packages/server/src/db/schema.ts` — activity_logs 테이블 (type, phase, actorType, action, detail, metadata, eventId)

**activity_logs 테이블 주요 컬럼:**
- eventId: UUID (UNIQUE) — 멱등성 보장, start/end 쌍 매칭에 활용
- type: 'chat' | 'delegation' | 'tool_call' | 'job' | 'sns' | 'error' | 'system' | 'login'
- phase: 'start' | 'end' | 'error'
- actorType: 'user' | 'agent' | 'system'
- action: varchar(200)
- detail: text

### Task 1: logActivity에서 WS 브로드캐스트

```typescript
// activity-logger.ts에 broadcastToChannel import 추가
import { broadcastToChannel } from '../ws/channels'

// 로그 삽입 후 브로드캐스트
broadcastToChannel(`activity-log::${params.companyId}`, {
  type: 'new-log',
  log: insertedLog,
})
```

### Task 2: 타임라인 레이아웃 패턴

```tsx
// 세로 타임라인
<div className="relative">
  <div className="absolute left-5 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
  {logs.map(log => (
    <div className="relative flex gap-4 py-2 pl-3">
      <div className={`w-3 h-3 rounded-full mt-1.5 z-10 ${dotColor(log)}`} />
      <div className="flex-1 border rounded-lg p-3">...</div>
    </div>
  ))}
</div>
```

### 파일 변경 범위

```
packages/server/src/lib/activity-logger.ts  — broadcastToChannel 추가
packages/app/src/pages/ops-log.tsx          — 타임라인 UI + WS + 필터 + URL 동기화
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1407-1492] — 작전일지 UX 스펙
- [Source: packages/server/src/lib/activity-logger.ts] — logActivity 함수
- [Source: packages/server/src/ws/channels.ts:85-94] — activity-log 채널

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: activity-logger.ts에 broadcastToChannel 추가 — .returning()으로 삽입된 로그를 받아 실시간 브로드캐스트
- Task 2: ops-log.tsx를 세로 타임라인 UI로 완전 리팩토링 (150줄 → 367줄) — 세로선+도트+카드, phase별 도트색, 타입별 아이콘, 날짜 그룹
- Task 3: FilterChip 복수 선택 (Set) + URL searchParams 동기화 (?filter=chat,delegation)
- Task 4: WebSocket activity-log 채널 구독, 실시간 로그 추가, 스크롤 배너, 연결 상태 표시
- Task 5: eventId 기준 start/end 매칭, <3초 시 카드 합침 + duration 표시
- Task 6: turbo build 3/3 성공, bun test 139 pass 0 fail

### File List
- packages/server/src/lib/activity-logger.ts — broadcastToChannel import + .returning() + 실시간 브로드캐스트
- packages/app/src/pages/ops-log.tsx — 타임라인 UI + WS 실시간 + 필터 칩 + URL 동기화 + start/end 매칭
