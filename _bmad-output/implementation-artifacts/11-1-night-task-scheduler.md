# Story 11.1: 야간작업 스케줄러 — 반복 스케줄 cron 워커 + nextRunAt 자동 갱신

Status: done

## Story

As a 사용자,
I want 반복 스케줄(매일/매주/특정요일)을 등록하면 해당 시간에 자동으로 야간작업이 생성되어 실행된다,
so that 매번 수동으로 작업을 등록하지 않아도 정기적인 업무가 자동 처리된다.

## Acceptance Criteria

1. **Given** nightJobSchedules에 cronExpression='0 22 * * 1-5' + isActive=true **When** 스케줄 워커가 폴링 **Then** nextRunAt 도달 시 nightJobs에 새 작업 자동 생성 + nextRunAt 갱신
2. **Given** 스케줄에서 생성된 nightJob **When** 작업 조회 **Then** scheduleId FK로 출처 추적 가능
3. **Given** 스케줄 워커 **When** 서버 시작 **Then** 기존 job-queue 워커와 함께 자동 시작 (startScheduleWorker)
4. **Given** cron 표현식 '0 22 * * 1-5' **When** nextRunAt 계산 **Then** 다음 평일 22시로 정확히 계산 (KST 기준)
5. **Given** isActive=false인 스케줄 **When** 워커 폴링 **Then** 해당 스케줄 건너뜀
6. **Given** 스케줄 워커 **When** 작업 생성 실패 (DB 오류 등) **Then** 에러 로깅 + 해당 스케줄 건너뛰고 다음 스케줄 처리 계속
7. **Given** cron 유틸 함수 **When** 다양한 cron 표현식 입력 **Then** 올바른 nextRunAt 반환 (유닛 테스트 통과)
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: cron 유틸 함수 구현 (AC: #4, #7)
  - [x] `packages/server/src/lib/cron-utils.ts` 생성
  - [x] `getNextCronDate(cronExpression: string, after?: Date): Date` — cron 표현식에서 다음 실행 시간 계산
  - [x] 지원 패턴: 분 시 일 월 요일 (표준 5-필드 cron)
  - [x] UTC 기준으로 계산 — `after` 파라미터 기본값 = `new Date()` (서버 시간)
  - [x] 외부 라이브러리 사용 금지 — 직접 구현 (Bun 호환성, 의존성 최소화)
  - [x] 유닛 테스트: `packages/server/src/__tests__/unit/cron-utils.test.ts` — 13개 테스트 전체 통과
    - 매일 22시 (`0 22 * * *`) → 다음 22시
    - 평일만 (`0 22 * * 1-5`) → 금요일 22시 후 → 월요일 22시
    - 특정 요일 (`0 9 * * 1,3,5`) → 월/수/금 9시
    - 이미 해당 시간 지난 경우 → 다음 날/다음 주

- [x] Task 2: 스케줄 워커 구현 (AC: #1, #2, #3, #5, #6)
  - [x] `packages/server/src/lib/schedule-worker.ts` 생성
  - [x] `startScheduleWorker()` — setInterval 기반 폴링 (60초 간격)
  - [x] 폴링 로직: `SELECT * FROM night_job_schedules WHERE is_active = true AND next_run_at <= now()`
  - [x] 조건 충족 시: `queueNightJob()` 호출 (기존 job-queue.ts 재사용) + scheduleId 전달
  - [x] 작업 생성 후: `UPDATE night_job_schedules SET next_run_at = getNextCronDate(cron_expression)` 갱신
  - [x] 에러 핸들링: 개별 스케줄 실패 시 catch + console.error + 다음 스케줄 계속 처리
  - [x] `stopScheduleWorker()` — clearInterval

- [x] Task 3: job-queue.ts에 scheduleId 지원 추가 (AC: #2)
  - [x] `queueNightJob` params에 `scheduleId?: string` 추가
  - [x] insert 시 scheduleId 전달

- [x] Task 4: 서버 시작 시 스케줄 워커 연동 (AC: #3)
  - [x] `packages/server/src/index.ts`에서 `startScheduleWorker()` import + 호출
  - [x] 기존 `startJobWorker()` 바로 아래에 배치

- [x] Task 5: 빌드 검증 (AC: #8)
  - [x] `npx turbo build --force` → 3/3 성공 확인
  - [x] `bun test` → cron-utils 테스트 13/13 통과 확인

## Dev Notes

### 기존 인프라 활용

1. **nightJobSchedules 테이블** — Epic 8(Story 8-4)에서 이미 생성됨
   - `cronExpression`, `nextRunAt`, `isActive` 컬럼 존재
   - `companyId`, `userId`, `agentId`, `instruction` 포함
   - relations: company, user, agent, jobs(many)

2. **nightJobs.scheduleId** — Epic 8에서 이미 추가됨 (nullable uuid)
   - relations에 `schedule: one(nightJobSchedules, ...)` 이미 정의

3. **job-queue.ts** — 기존 폴링 워커 (30초)
   - `queueNightJob()` 함수 재사용 — scheduleId 파라미터만 추가
   - `processJob()` 로직 변경 없음 (일회성이든 스케줄이든 동일하게 처리)

### cron 표현식 파싱 전략

- 외부 라이브러리(cron-parser, croner 등) 대신 직접 구현
- 이유: Bun 호환성 보장 + 프로젝트 내 복잡한 cron은 불필요 (분/시/요일만 사용)
- 지원 범위: `분 시 일 월 요일` (5-필드 표준)
  - `*` — 모든 값
  - `N` — 특정 값
  - `N-M` — 범위
  - `N,M,O` — 목록
- KST 기준: 서버가 KST 타임존에서 동작한다고 가정 (process.env.TZ = 'Asia/Seoul')

### 폴링 간격 설계

- 스케줄 워커: **60초** (분 단위 정밀도면 충분)
- 기존 job 워커: **30초** (변경 없음)
- 두 워커는 독립적으로 동작:
  - 스케줄 워커: nextRunAt 확인 → nightJobs에 INSERT
  - job 워커: nightJobs 큐에서 queued 작업 PICK → 처리

### 주의사항

- **동시 실행 방지**: 스케줄 워커는 nextRunAt 갱신 후에야 다음 폴링에서 같은 스케줄을 다시 선택하지 않음 (UPDATE → nextRunAt 미래값으로)
- **서버 재시작**: 서버 재시작 시 놓친 스케줄도 nextRunAt <= now() 조건으로 자동 catch
- **타임존**: 모든 시간은 서버 로컬 시간(KST) 기준. DB에는 UTC로 저장될 수 있으나, cron 계산은 KST 기준

### Project Structure Notes

- `packages/server/src/lib/cron-utils.ts` — 새 파일 (순수 함수, 외부 의존성 없음)
- `packages/server/src/lib/schedule-worker.ts` — 새 파일 (스케줄 폴링 워커)
- `packages/server/src/lib/job-queue.ts` — 기존 파일 수정 (scheduleId 파라미터 추가)
- `packages/server/src/index.ts` — 기존 파일 수정 (startScheduleWorker 호출 추가)
- `packages/server/src/__tests__/unit/cron-utils.test.ts` — 새 파일 (유닛 테스트)

### References

- [Source: packages/server/src/db/schema.ts:301-354] — nightJobs, nightJobSchedules, nightJobTriggers 스키마
- [Source: packages/server/src/db/schema.ts:630-650] — nightJobs, schedules, triggers relations
- [Source: packages/server/src/lib/job-queue.ts] — 기존 야간작업 큐 (queueNightJob, processJob, startJobWorker)
- [Source: _bmad-output/implementation-artifacts/8-4-p2-db-schema.md:29-44] — nightJobSchedules 설계 스펙
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1061-1063] — 반복 스케줄 탭 UX
- [Source: _bmad-output/implementation-artifacts/epic-10-retro-2026-03-05.md:189-202] — Epic 11 준비 상태
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml:168-177] — Epic 11 스토리 목록

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- 초기 테스트 8개 실패: 서버 UTC 환경에서 KST 오프셋 Date를 getHours()로 비교 → UTC 메서드(getUTCHours 등)로 전환하여 해결

### Completion Notes List
- Task 1: cron-utils.ts 순수 함수 구현 — 5-필드 cron 파싱(*, N, N-M, N,M,O) + UTC 기반 nextDate 계산. 13개 유닛 테스트 전체 통과.
- Task 2: schedule-worker.ts 폴링 워커 — 60초 간격으로 isActive+nextRunAt<=now 스케줄 조회 → queueNightJob + nextRunAt 갱신. 개별 실패 시 에러 로깅+건너뛰기.
- Task 3: job-queue.ts queueNightJob에 scheduleId 파라미터 추가 → nightJobs INSERT 시 scheduleId FK 연결.
- Task 4: index.ts에서 startScheduleWorker() 호출 추가 (runMigrations 후 startJobWorker 바로 다음).
- Task 5: turbo build 3/3 성공, cron-utils 테스트 13/13 통과.

### Change Log
- 2026-03-06: Story 11-1 구현 완료 — cron 유틸 + 스케줄 워커 + scheduleId FK 지원

### File List
- packages/server/src/lib/cron-utils.ts (NEW)
- packages/server/src/lib/schedule-worker.ts (NEW)
- packages/server/src/__tests__/unit/cron-utils.test.ts (NEW)
- packages/server/src/lib/job-queue.ts (MODIFIED — scheduleId 파라미터 추가)
- packages/server/src/index.ts (MODIFIED — startScheduleWorker import + 호출)
