# Story 11.2: 야간작업 CRUD UI — 3탭 + 스케줄/트리거 API + 등록 모달

Status: done

## Story

As a 사용자,
I want 야간작업 페이지에서 일회성/반복 스케줄/이벤트 트리거 작업을 등록·조회·수정·삭제한다,
so that 다양한 유형의 자동화 작업을 관리할 수 있다.

## Acceptance Criteria

1. **Given** /jobs 페이지 **When** 접근 **Then** 3개 탭(일회성, 반복 스케줄, 트리거) + 각 탭별 카운트 뱃지 표시
2. **Given** [+ 작업 등록] 버튼 **When** 클릭 **Then** 유형 선택(일회성/반복/트리거) + 유형별 폼 필드 변경 모달 표시
3. **Given** 반복 스케줄 등록 **When** 주기(매일/매주/특정요일) + 시간 + 에이전트 + 내용 입력 후 저장 **Then** nightJobSchedules에 INSERT + nextRunAt 자동 계산
4. **Given** 반복 스케줄 탭 **When** 조회 **Then** 주기 + 마지막/다음 실행 + StatusDot(활성/중지) + [편집][중지] 표시
5. **Given** 반복 스케줄 **When** [중지] 클릭 **Then** isActive=false 업데이트 + StatusDot 변경
6. **Given** 스케줄 CRUD API **When** POST/GET/PATCH/DELETE 요청 **Then** 올바른 CRUD 수행 + companyId 테넌트 격리
7. **Given** 일회성 탭 **When** 기존 nightJobs 조회 **Then** scheduleId=null AND triggerId=null인 것만 표시 (스케줄/트리거에서 생성된 작업 제외)
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 스케줄 CRUD API (AC: #3, #5, #6)
  - [x] `packages/server/src/routes/workspace/schedules.ts` 생성
  - [x] GET /api/workspace/jobs/schedules — 내 스케줄 목록 (companyId + userId 필터)
  - [x] POST /api/workspace/jobs/schedules — 스케줄 생성 (instruction, agentId, cronExpression, nextRunAt 자동 계산)
  - [x] PATCH /api/workspace/jobs/schedules/:id — 스케줄 수정 (instruction, cronExpression, isActive 등)
  - [x] DELETE /api/workspace/jobs/schedules/:id — 스케줄 삭제
  - [x] PATCH /api/workspace/jobs/schedules/:id/toggle — isActive 토글
  - [x] cron 표현식 생성: 주기(매일/매주/특정요일) + 시간 → cron 문자열 변환 유틸
  - [x] Zod 유효성 검증: instruction 필수, agentId uuid, time HH:MM, days 배열

- [x] Task 2: jobs.ts 라우트 수정 — 스케줄 라우트 마운트 + 일회성 필터 (AC: #6, #7)
  - [x] jobs.ts에 schedules 서브라우트 마운트
  - [x] GET /api/workspace/jobs 응답에서 scheduleId=null AND triggerId=null 필터 추가
  - [x] index.ts에 라우트 등록 (기존 jobsRoute에 포함되므로 추가 마운트 불필요할 수 있음)

- [x] Task 3: 프론트엔드 — 3탭 구조 + 탭 카운트 (AC: #1)
  - [x] jobs.tsx 리팩터링: 탭 상태(oneTime/schedule/trigger) 추가
  - [x] 각 탭별 데이터 쿼리: 일회성(기존), 스케줄(새 API), 트리거(11-3에서 구현 — 빈 탭으로 placeholder)
  - [x] 탭 카운트 뱃지 표시
  - [x] 일회성 탭: 기존 UI 유지 (scheduleId/triggerId가 null인 작업만)

- [x] Task 4: 프론트엔드 — 작업 등록 모달 (AC: #2, #3)
  - [x] 모달 컴포넌트: 유형 선택 (일회성/반복) — 트리거는 11-3에서 추가
  - [x] 일회성 폼: 내용 + 에이전트 Select + 실행 시간 datetime-local
  - [x] 반복 스케줄 폼: 내용 + 에이전트 + 주기 RadioGroup(매일/매주/특정요일) + 시간 Input time + 요일 체크박스
  - [x] 유효성 검증: 매주/특정요일 선택 시 요일 최소 1개 필수

- [x] Task 5: 프론트엔드 — 반복 스케줄 탭 (AC: #4, #5)
  - [x] 스케줄 카드: 주기 텍스트 + 마지막/다음 실행 시간 + StatusDot(활성/중지)
  - [x] [편집] 버튼: 수정 모달 열기
  - [x] [중지]/[시작] 버튼: isActive 토글 API 호출

- [x] Task 6: 빌드 검증 (AC: #8)
  - [x] `npx turbo build --force` → 3/3 성공 확인

## Dev Notes

### 기존 인프라 활용

1. **nightJobSchedules 테이블** — 이미 존재 (Epic 8 생성)
   - id, companyId, userId, agentId, instruction, cronExpression, nextRunAt, isActive, createdAt, updatedAt

2. **nightJobs 필터링** — 기존 GET /jobs는 모든 nightJobs 반환
   - 일회성 필터: `WHERE schedule_id IS NULL AND trigger_id IS NULL`

3. **cron-utils.ts** — Story 11-1에서 구현
   - `getNextCronDate(cronExpression, after)` 재사용

4. **기존 jobs.tsx** — 일회성만 지원하는 기본 UI (250줄)
   - 리팩터링하여 탭 구조 추가

### cron 표현식 생성 로직

프론트엔드에서 사용자가 선택한 주기+시간을 cron으로 변환:
- 매일 22:00 → `0 22 * * *`
- 매주 월요일 9:00 → `0 9 * * 1`
- 특정 요일 월/수/금 9:00 → `0 9 * * 1,3,5`

이 변환은 서버에서 수행 (cronExpression 직접 전달 대신 structured 데이터로 받아서 서버에서 cron 생성).

### API 설계

```
POST   /api/workspace/jobs/schedules      — 스케줄 생성
GET    /api/workspace/jobs/schedules      — 내 스케줄 목록
PATCH  /api/workspace/jobs/schedules/:id  — 스케줄 수정
DELETE /api/workspace/jobs/schedules/:id  — 스케줄 삭제
PATCH  /api/workspace/jobs/schedules/:id/toggle — isActive 토글
```

POST body:
```json
{
  "agentId": "uuid",
  "instruction": "텍스트",
  "frequency": "daily" | "weekly" | "custom",
  "time": "22:00",
  "days": [1, 3, 5]  // frequency=custom일 때만
}
```

서버에서 frequency+time+days → cronExpression 변환 + getNextCronDate로 nextRunAt 계산.

### UI 공유 컴포넌트

- `Badge` — 상태 뱃지 (이미 @corthex/ui에 존재)
- `StatusDot` — 활성/중지 상태 (이미 @corthex/ui에 존재)
- `ConfirmDialog` — 삭제 확인 (이미 @corthex/ui에 존재)
- `Select`, `Textarea` — 이미 사용 중
- RadioGroup, ProgressBar — @corthex/ui에 없음 → 인라인 구현 (전용 컴포넌트 불필요, 라디오 버튼 그룹은 간단한 div+label로 충분)

### UX 스펙 참조

- 3개 탭: 일회성 (기본) / 반복 스케줄 / 트리거
- 작업 등록 모달: max-w-lg, 유형 RadioGroup → 유형별 폼 필드 변경
- 반복 스케줄 탭: 주기 text-sm + 마지막/다음 실행 font-mono + StatusDot + [편집][중지]
- 트리거 탭: 11-3에서 구현 (이 스토리에서는 빈 placeholder)

### 11-1 스토리 교훈

- UTC 기반 시간 처리: 모든 cron 계산은 UTC 기준
- schedule-worker가 이미 nextRunAt 기반 폴링 구현 → CRUD만 제대로 하면 자동 실행됨

### Project Structure Notes

- `packages/server/src/routes/workspace/schedules.ts` — 새 파일 (스케줄 CRUD API)
- `packages/server/src/routes/workspace/jobs.ts` — 기존 파일 수정 (일회성 필터 + 스케줄 라우트 마운트)
- `packages/app/src/pages/jobs.tsx` — 기존 파일 대폭 수정 (3탭 + 등록 모달 + 스케줄 탭)

### References

- [Source: packages/server/src/db/schema.ts:324-338] — nightJobSchedules 스키마
- [Source: packages/server/src/routes/workspace/jobs.ts] — 기존 야간작업 API
- [Source: packages/app/src/pages/jobs.tsx] — 기존 야간작업 UI
- [Source: packages/server/src/lib/cron-utils.ts] — cron 유틸 (11-1 구현)
- [Source: packages/server/src/lib/schedule-worker.ts] — 스케줄 워커 (11-1 구현)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1020-1119] — 야간작업 UX 전체 스펙
- [Source: packages/ui/src/index.ts] — Badge, StatusDot, ConfirmDialog, Select, Textarea 컴포넌트

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Task 1-2: schedules.ts CRUD API 구현 + jobs.ts에 스케줄 서브라우트 마운트 + 일회성 필터 추가
- Task 3-5: jobs.tsx 전면 리팩터링 — 3탭(일회성/반복/트리거) + 등록/수정 모달 + 스케줄 카드 UI
- Task 6: turbo build 3/3 성공 (Badge variant + ConfirmDialog isOpen 수정 후)
- Code Review 수정: PATCH frequency 추론 custom 케이스 + days 복원 로직, scheduledFor datetime-local 추가, 타입 nullable 수정

### File List
- packages/server/src/routes/workspace/schedules.ts (NEW)
- packages/server/src/routes/workspace/jobs.ts (MODIFIED — schedules 마운트 + isNull 필터)
- packages/app/src/pages/jobs.tsx (REWRITTEN — 3탭 + 모달 + 스케줄 관리)
