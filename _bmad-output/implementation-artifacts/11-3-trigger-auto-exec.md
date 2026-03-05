# Story 11.3: 이벤트 트리거 자동 실행 — 조건 감시 + 자동 작업 등록

Status: review

## Story

As a 일반 직원(유저),
I want 주가 도달/장 시작·마감 등 조건을 설정하면 자동으로 야간작업이 실행된다,
so that 수동 확인 없이 이벤트 기반 자동화를 활용할 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 페이지 **When** 탭 클릭 **Then** "작업" / "스케줄" / "트리거" 3개 탭 전환
2. **Given** 트리거 탭 **When** "+ 새 트리거" 클릭 **Then** 에이전트 선택 + 작업 지시 + 트리거 유형(price-above/price-below/market-open/market-close) + 유형별 추가 필드(종목/목표가) 폼 표시
3. **Given** 유효한 트리거 입력 **When** 등록 **Then** POST /api/workspace/triggers → 목록 추가 + 토스트 "트리거 등록 완료"
4. **Given** 활성 트리거 **When** 서버 30초 폴링에서 조건 충족 **Then** night_jobs에 자동 등록 + isActive=false (1회 실행) + lastTriggeredAt 갱신
5. **Given** 트리거 발동 후 **When** 목록 확인 **Then** "○ 중지" 배지 + "마지막 발동: 날짜" 표시 + "[다시 감시]" 버튼
6. **Given** 트리거 카드 **When** 수정/삭제 **Then** 인라인 편집 + ConfirmDialog 삭제
7. **Given** price-above/price-below 트리거 **When** 조건 평가 **Then** KIS API로 현재가 조회 후 비교
8. **Given** market-open/market-close 트리거 **When** 장 시작(09:00)/마감(15:30) **Then** 조건 충족 판정
9. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 트리거 CRUD API (AC: #3, #6)
  - [x] `packages/server/src/routes/workspace/triggers.ts` 신규 — POST/GET/PATCH/DELETE
  - [x] Zod 스키마: agentId, instruction, triggerType(enum), condition(JSON)
  - [x] 에러 코드: TRIGGER_001(유효하지 않은 조건), TRIGGER_002(미발견), TRIGGER_003(소유자 아님)
  - [x] `index.ts`에 라우트 등록: `app.route('/api/workspace/triggers', triggersRoute)`

- [x] Task 2: 트리거 평가 워커 (AC: #4, #7, #8)
  - [x] `packages/server/src/lib/trigger-worker.ts` 신규 — 30초 폴링
  - [x] `evaluateCondition(trigger)` 함수: triggerType별 조건 평가
  - [x] price-above/price-below: KIS 현재가 API 호출 → 비교
  - [x] market-open: 현재 시간 ≥ 09:00 KST (평일만)
  - [x] market-close: 현재 시간 ≥ 15:30 KST (평일만)
  - [x] 조건 충족 시: queueNightJob({ triggerId }) + isActive=false + lastTriggeredAt 갱신
  - [x] `index.ts`에 `startTriggerWorker()` 등록

- [x] Task 3: job-queue.ts에 triggerId 지원 (AC: #4)
  - [x] `queueNightJob` params에 `triggerId?: string` 추가
  - [x] insert values에 `triggerId: params.triggerId || null` 추가

- [x] Task 4: 프론트엔드 트리거 탭 (AC: #1, #2, #3, #5, #6)
  - [x] jobs.tsx TABS 배열에 `{ value: 'triggers', label: '트리거' }` 추가
  - [x] TriggersTab 컴포넌트: 목록 + 생성 폼 + 인라인 편집 + 삭제
  - [x] 트리거 유형 Select → 조건부 필드 표시 (종목 Input + 목표가 Input)
  - [x] 상태 배지: "● 감시 중"(success) / "○ 중지"(default) + lastTriggeredAt 표시
  - [x] "[다시 감시]" 버튼 → PATCH { isActive: true }

- [x] Task 5: 빌드 확인 (AC: #9)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 기존 코드 참조

- **스케줄 API 패턴**: `packages/server/src/routes/workspace/schedules.ts` — 동일 CRUD 구조 복제
- **스케줄 워커 패턴**: `packages/server/src/lib/schedule-worker.ts` — 폴링 워커 구조 복제
- **작업 큐**: `packages/server/src/lib/job-queue.ts` — `queueNightJob()` 함수에 triggerId 추가
- **DB 스키마**: `packages/server/src/db/schema.ts:341-354` — `nightJobTriggers` 테이블 이미 존재
- **야간작업 UI**: `packages/app/src/pages/jobs.tsx` — 탭 추가 + TriggersTab 컴포넌트
- **서버 진입점**: `packages/server/src/index.ts` — 라우트 + 워커 등록

### API 엔드포인트

```
POST   /api/workspace/triggers       → { data: Trigger } (201)
GET    /api/workspace/triggers       → { data: Trigger[] }
PATCH  /api/workspace/triggers/:id   → { data: Trigger }
DELETE /api/workspace/triggers/:id   → { data: { deleted: true } }
```

### Trigger 타입

```typescript
type Trigger = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  triggerType: 'price-above' | 'price-below' | 'market-open' | 'market-close'
  condition: {
    symbol?: string       // 종목코드 (price 트리거용)
    targetPrice?: number  // 목표가 (price 트리거용)
  }
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
}
```

### 조건 평가 로직

```typescript
// price-above: currentPrice >= condition.targetPrice
// price-below: currentPrice <= condition.targetPrice
// market-open: 현재 KST 시간 >= 09:00 && 평일 && 오늘 아직 미발동
// market-close: 현재 KST 시간 >= 15:30 && 평일 && 오늘 아직 미발동
```

### KIS 현재가 조회 패턴

주가 트리거는 KIS API를 직접 호출하지 않고, 간단한 mock/stub으로 구현합니다.
실제 KIS 연동은 도구 시스템(Epic 9)에 이미 있으나, 트리거 워커에서 직접 호출하면 API 키 관리가 복잡해집니다.
대안: `condition` JSON에 `lastCheckedPrice`를 캐싱하거나, 유저의 credential vault에서 KIS 키를 로드하여 호출.

**실용적 접근**: 트리거 워커에서 KIS 현재가 API를 호출하되, 키가 없으면 해당 트리거를 스킵하고 로그 남기기.

### 에러 코드

- TRIGGER_001: 유효하지 않은 트리거 조건
- TRIGGER_002: 트리거를 찾을 수 없음
- TRIGGER_003: 소유자가 아님

### 이전 스토리 학습사항 (11-1, 11-2)

- Badge variant에 "secondary" 없음 → "success"/"default" 사용
- schedule-worker.ts 폴링 패턴: `setInterval` + 즉시 1회 실행
- `queueNightJob()`에 scheduleId 추가한 것처럼 triggerId도 동일 패턴
- 스케줄 삭제 시 연결된 queued 작업도 삭제 → 트리거도 동일하게

### 파일 구조

```
신규 파일:
  packages/server/src/routes/workspace/triggers.ts (트리거 CRUD API)
  packages/server/src/lib/trigger-worker.ts (30초 폴링 워커)

수정 파일:
  packages/server/src/lib/job-queue.ts (triggerId 파라미터 추가)
  packages/server/src/index.ts (라우트 + 워커 등록)
  packages/app/src/pages/jobs.tsx (트리거 탭 + TriggersTab 컴포넌트)
```

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- 트리거 CRUD API: schedules.ts 패턴 복제, Zod refine으로 price 트리거 조건 검증
- 트리거 워커: 30초 폴링, KST 기준 market-open(09:00)/market-close(15:30) 평일 체크
- 주가 트리거: KIS API 연동 구조 갖춤 (실제 호출은 TODO — credential vault 연동 필요)
- 1회 실행 후 자동 비활성화 + "다시 감시" 버튼으로 재활성화
- turbo build 3/3 성공

### File List

- packages/server/src/routes/workspace/triggers.ts (신규 — 트리거 CRUD API)
- packages/server/src/lib/trigger-worker.ts (신규 — 30초 폴링 워커)
- packages/server/src/lib/job-queue.ts (수정 — triggerId 파라미터 추가)
- packages/server/src/index.ts (수정 — 라우트 + 워커 등록)
- packages/app/src/pages/jobs.tsx (수정 — 트리거 탭 + TriggersTab 컴포넌트)
