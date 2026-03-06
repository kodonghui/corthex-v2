# Story 11.3: 이벤트 트리거 자동실행 — 트리거 CRUD API + 워커 + 트리거 탭 UI

Status: done

## Story

As a 사용자,
I want 가격 도달·장 시작/마감 등 이벤트 조건을 설정하면 조건 충족 시 자동으로 야간작업이 실행된다,
so that 시장 상황에 맞춰 자동으로 대응할 수 있다.

## Acceptance Criteria

1. **Given** 트리거 CRUD API **When** POST/GET/PATCH/DELETE /api/workspace/jobs/triggers **Then** nightJobTriggers 테이블 CRUD + companyId 테넌트 격리
2. **Given** 트리거 생성 **When** triggerType=price-above, condition={stockCode,targetPrice} 입력 **Then** nightJobTriggers INSERT + isActive=true
3. **Given** 트리거 워커(30초 폴링) **When** 활성 트리거 조건 충족 (현재가 >= 목표가 등) **Then** queueNightJob 호출(triggerId 전달) + 트리거 isActive=false 자동 비활성화
4. **Given** 트리거 탭 **When** 조회 **Then** 조건 + 액션 + StatusDot(감시중/중지) + [편집][중지][삭제] 표시
5. **Given** 비활성화된 트리거 **When** [다시 감시] 클릭 **Then** isActive=true + StatusDot 변경
6. **Given** jobs.tsx 등록 모달 **When** 유형=트리거 선택 **Then** 트리거 유형 Select + 유형별 추가 필드(종목/목표가) 표시
7. **Given** 트리거에서 생성된 nightJob **When** 일회성 탭 조회 **Then** triggerId!=null이므로 표시 안 됨 (기존 필터 동작)
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 트리거 CRUD API (AC: #1, #2)
  - [x] `packages/server/src/routes/workspace/triggers.ts` 생성
  - [x] GET /api/workspace/jobs/triggers — 내 트리거 목록 (companyId+userId 필터, agents JOIN으로 agentName)
  - [x] POST /api/workspace/jobs/triggers — 트리거 생성 (agentId, instruction, triggerType, condition)
  - [x] PATCH /api/workspace/jobs/triggers/:id — 트리거 수정 (instruction, triggerType, condition)
  - [x] PATCH /api/workspace/jobs/triggers/:id/toggle — isActive 토글 (다시 감시 / 중지)
  - [x] DELETE /api/workspace/jobs/triggers/:id — 트리거 삭제
  - [x] Zod 유효성 검증: triggerType enum('price-above','price-below','market-open','market-close'), condition jsonb

- [x] Task 2: jobs.ts에 트리거 서브라우트 마운트 (AC: #1, #7)
  - [x] jobs.ts에 `jobsRoute.route('/triggers', triggersRoute)` 추가 (schedules와 동일 패턴)
  - [x] import 추가

- [x] Task 3: job-queue.ts에 triggerId 지원 추가 (AC: #3)
  - [x] `queueNightJob` params에 `triggerId?: string` 추가
  - [x] insert 시 triggerId 전달

- [x] Task 4: 트리거 워커 구현 (AC: #3)
  - [x] `packages/server/src/lib/trigger-worker.ts` 생성
  - [x] `startTriggerWorker()` — setInterval 30초 폴링
  - [x] 폴링 로직: `SELECT * FROM night_job_triggers WHERE is_active = true`
  - [x] 각 트리거별 조건 평가:
    - `price-above`: KIS API(기존 도구)로 현재가 조회 → currentPrice >= targetPrice
    - `price-below`: currentPrice <= targetPrice
    - `market-open`: 현재 시간이 09:00 KST 이후 + 오늘 아직 미발동
    - `market-close`: 현재 시간이 15:30 KST 이후 + 오늘 아직 미발동
  - [x] 조건 충족 시: `queueNightJob({ triggerId })` + `UPDATE night_job_triggers SET is_active=false, last_triggered_at=now()`
  - [x] `stopTriggerWorker()` — clearInterval
  - [x] 개별 트리거 실패 시 에러 로깅 + 다음 트리거 계속 처리

- [x] Task 5: 서버 시작 시 트리거 워커 연동 (AC: #3)
  - [x] `packages/server/src/index.ts`에서 `startTriggerWorker()` import + 호출
  - [x] SIGTERM 핸들러에 `stopTriggerWorker()` 추가

- [x] Task 6: 프론트엔드 — 트리거 탭 UI (AC: #4, #5)
  - [x] jobs.tsx에 트리거 쿼리 추가: `useQuery(['night-triggers'], () => api.get('/workspace/jobs/triggers'))`
  - [x] 탭 카운트에 트리거 갯수 반영
  - [x] 트리거 카드: 조건 텍스트(종목 + 목표가) + 액션(instruction) + StatusDot(online/offline) + [편집][중지/감시][삭제]
  - [x] 토글 mutation: api.patch(`/triggers/${id}/toggle`)
  - [x] 삭제: 기존 ConfirmDialog deleteTarget에 type='trigger' 추가

- [x] Task 7: 프론트엔드 — 등록 모달에 트리거 유형 추가 (AC: #6)
  - [x] modalType에 'trigger' 추가
  - [x] 유형 RadioGroup에 '이벤트 트리거' 옵션 추가
  - [x] 트리거 폼: triggerType Select (가격 상회/가격 하회/장 시작/장 마감) + 조건별 추가 필드
  - [x] 가격 트리거: 종목 코드 Input + 목표가 Input (number)
  - [x] 장 시작/마감: 추가 필드 없음
  - [x] createTrigger mutation + handleSubmit 분기 추가

- [x] Task 8: 빌드 검증 (AC: #8)
  - [x] `npx turbo build --force` → 3/3 성공 확인

## Dev Notes

### 기존 인프라 활용

1. **nightJobTriggers 테이블** — 이미 존재 (Epic 8 생성, schema.ts:341-354)
   - id, companyId, userId, agentId, instruction, triggerType(varchar50), condition(jsonb), isActive, lastTriggeredAt, createdAt
   - relations: company, user, agent, jobs(many)

2. **nightJobs.triggerId** — 이미 존재 (schema.ts:309, nullable uuid)
   - relations에 `trigger: one(nightJobTriggers, ...)` 이미 정의 (schema.ts:636)

3. **기존 필터** — GET /jobs에서 `isNull(nightJobs.triggerId)` 이미 적용 (11-2에서 구현)
   - 트리거에서 생성된 작업은 일회성 탭에 안 나타남 → AC#7 자동 충족

4. **jobs.tsx 3탭 구조** — 11-2에서 구현. 트리거 탭은 placeholder EmptyState → 실제 UI로 교체

5. **KIS API 도구** — 이미 구현 (Epic 9, packages/server/src/tools/kis/)
   - 현재가 조회 기능 재사용 가능

### 트리거 condition JSON 구조

```json
// price-above / price-below
{ "stockCode": "005930", "targetPrice": 72000 }

// market-open / market-close
{} (빈 객체)
```

### 가격 조회 방식

기존 KIS 도구에서 현재가 조회 함수를 재사용:
- `packages/server/src/tools/kis/` 디렉토리 확인
- 직접 KIS API 호출이 아닌, 기존 도구 함수를 import해서 사용
- KIS API 인증 정보는 credential vault에서 가져옴 → companyId 기준

### API 설계

```
POST   /api/workspace/jobs/triggers      — 트리거 생성
GET    /api/workspace/jobs/triggers      — 내 트리거 목록
PATCH  /api/workspace/jobs/triggers/:id  — 트리거 수정
DELETE /api/workspace/jobs/triggers/:id  — 트리거 삭제
PATCH  /api/workspace/jobs/triggers/:id/toggle — isActive 토글
```

POST body:
```json
{
  "agentId": "uuid",
  "instruction": "삼성전자 72000원 돌파 시 매수 분석해줘",
  "triggerType": "price-above",
  "condition": { "stockCode": "005930", "targetPrice": 72000 }
}
```

### UX 스펙 (ux-design-specification.md:1065-1080)

- 조건 + 액션 + StatusDot "● 감시 중" + [편집][중지]
- 트리거 달성 후: 1회 실행 → 자동 비활성화 (StatusDot offline)
- 카드에 "마지막 발동: 날짜" 표시
- [다시 감시] 버튼으로 재활성화
- 가격 트리거: 30초 폴링
- 지원 유형: price-above, price-below, market-open, market-close

### 이전 스토리 교훈 (11-1, 11-2)

- UTC 기반 시간 처리: 모든 시간 계산은 UTC 기준
- Badge variant: 'default' | 'info' | 'error' | 'success' | 'warning' (11-2 코드 리뷰에서 수정)
- ConfirmDialog: `isOpen` prop 사용 (not `open`)
- StatusDot: status='online'/'offline' 사용
- 서브라우트 마운트: `jobsRoute.route('/triggers', triggersRoute)` — authMiddleware가 route() 이전이므로 triggers에 자체 authMiddleware 필요
- schedules.ts 패턴을 그대로 따를 것 (CRUD 구조, Zod 검증, 테넌트 격리)

### 주의사항 — 가격 조회 실패 처리

- KIS API 인증 정보가 없는 회사의 트리거 → 건너뛰기 (에러 로깅)
- KIS API 호출 실패 → 해당 트리거 건너뛰기 (다음 폴링에서 재시도)
- 장 시작/마감 트리거는 KIS API 불필요 → 시간 비교만

### Project Structure Notes

- `packages/server/src/routes/workspace/triggers.ts` — 새 파일 (트리거 CRUD API)
- `packages/server/src/lib/trigger-worker.ts` — 새 파일 (트리거 폴링 워커)
- `packages/server/src/routes/workspace/jobs.ts` — 기존 파일 수정 (트리거 서브라우트 마운트)
- `packages/server/src/lib/job-queue.ts` — 기존 파일 수정 (triggerId 파라미터 추가)
- `packages/server/src/index.ts` — 기존 파일 수정 (startTriggerWorker 호출 추가)
- `packages/app/src/pages/jobs.tsx` — 기존 파일 수정 (트리거 탭 UI + 등록 모달 트리거 폼)

### References

- [Source: packages/server/src/db/schema.ts:341-354] — nightJobTriggers 스키마
- [Source: packages/server/src/db/schema.ts:309] — nightJobs.triggerId FK
- [Source: packages/server/src/db/schema.ts:636] — trigger relation
- [Source: packages/server/src/db/schema.ts:646-651] — nightJobTriggersRelations
- [Source: packages/server/src/lib/job-queue.ts] — queueNightJob 함수
- [Source: packages/server/src/lib/schedule-worker.ts] — schedule-worker 패턴 참조
- [Source: packages/server/src/routes/workspace/schedules.ts] — CRUD API 패턴 참조
- [Source: packages/server/src/routes/workspace/jobs.ts] — 서브라우트 마운트 패턴
- [Source: packages/app/src/pages/jobs.tsx] — 3탭 UI + 등록 모달
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1065-1080] — 트리거 탭 UX 스펙
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1082-1092] — 등록 모달 트리거 폼 UX

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Task 1: triggers.ts CRUD API — GET/POST/PATCH/DELETE + toggle, Zod 검증, 테넌트 격리
- Task 2: jobs.ts에 triggersRoute 서브라우트 마운트
- Task 3: job-queue.ts에 triggerId 파라미터 추가
- Task 4: trigger-worker.ts — 30초 폴링, KIS API 가격 조회, 장 시작/마감 시간 체크, 조건 충족 시 자동 비활성화
- Task 5: index.ts에 startTriggerWorker/stopTriggerWorker 연동
- Task 6-7: jobs.tsx에 트리거 탭 UI + 등록 모달 트리거 폼 (가격/장 시작/마감)
- Task 8: turbo build 3/3 성공
- Code Review: condition 검증 강화 — price 트리거에 stockCode+targetPrice 필수 refine 추가

### File List
- packages/server/src/routes/workspace/triggers.ts (NEW)
- packages/server/src/lib/trigger-worker.ts (NEW)
- packages/server/src/routes/workspace/jobs.ts (MODIFIED — triggers 서브라우트 마운트)
- packages/server/src/lib/job-queue.ts (MODIFIED — triggerId 파라미터 추가)
- packages/server/src/index.ts (MODIFIED — triggerWorker import + 시작/중지)
- packages/app/src/pages/jobs.tsx (MODIFIED — 트리거 탭 + 등록 모달 트리거 폼)
