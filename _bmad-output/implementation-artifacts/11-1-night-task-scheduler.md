# Story 11.1: 야간작업 스케줄러 — cron 파서 + 스케줄 CRUD API + 스케줄 실행 워커

Status: review

## Story

As a 일반 직원(유저),
I want 반복 야간작업을 cron 식으로 등록하고 관리할 수 있다,
so that 매일/매주 반복되는 에이전트 작업을 자동으로 실행시킬 수 있다.

## Acceptance Criteria

1. **Given** 스케줄 생성 요청 **When** POST /schedules에 agentId, instruction, cronExpression 전송 **Then** cron 식을 파싱하여 nextRunAt 계산 후 DB 저장, 201 반환
2. **Given** 유효하지 않은 cron 식 **When** 스케줄 생성/수정 **Then** 400 에러 + `SCHEDULE_001` 코드 반환
3. **Given** 내 스케줄 목록 **When** GET /schedules **Then** 현재 사용자의 활성/비활성 스케줄 목록 반환 (에이전트 이름 포함)
4. **Given** 기존 스케줄 **When** PATCH /schedules/:id **Then** instruction, cronExpression, isActive 수정 가능, cronExpression 변경 시 nextRunAt 재계산
5. **Given** 기존 스케줄 **When** DELETE /schedules/:id **Then** 스케줄 삭제 (연결된 대기 중 작업도 삭제)
6. **Given** 활성 스케줄이 존재 **When** nextRunAt 시간이 도달 **Then** 스케줄 워커가 night_jobs에 작업을 자동 생성하고 nextRunAt을 다음 실행 시간으로 갱신
7. **Given** 비활성 스케줄 **When** 스케줄 워커 실행 **Then** 해당 스케줄은 건너뜀
8. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: cron 파서 라이브러리 설치 + 유틸 함수 (AC: #1, #2)
  - [x] `bun add croner` (경량 cron 파서, ESM 지원, Bun 호환)
  - [x] `packages/server/src/lib/cron-utils.ts` 신규 생성
    - `parseCron(expression: string): boolean` — cron 식 유효성 검증
    - `getNextRunAt(expression: string, from?: Date): Date` — 다음 실행 시간 계산
    - 5필드 cron (분 시 일 월 요일) + 프리셋 지원 (`@daily`, `@weekly`, `@hourly`)

- [x] Task 2: 스케줄 CRUD API (AC: #1, #2, #3, #4, #5)
  - [x] `packages/server/src/routes/workspace/schedules.ts` 신규 생성
    - `POST /` — 스케줄 생성 (Zod: agentId uuid, instruction min(1), cronExpression, isActive?)
    - `GET /` — 내 스케줄 목록 (에이전트 이름 join, updatedAt DESC 정렬)
    - `PATCH /:id` — 스케줄 수정 (소유자만, cronExpression 변경 시 nextRunAt 재계산)
    - `DELETE /:id` — 스케줄 삭제 (소유자만 + 연결된 queued 작업 삭제)
  - [x] 에러 코드: SCHEDULE_001 (invalid cron), SCHEDULE_002 (not found), SCHEDULE_003 (not owner)
  - [x] `packages/server/src/index.ts`에 라우트 등록: `/api/workspace/schedules`

- [x] Task 3: 스케줄 실행 워커 (AC: #6, #7)
  - [x] `packages/server/src/lib/schedule-worker.ts` 신규 생성
    - `pollSchedules()` — 활성 스케줄 중 nextRunAt ≤ now인 것 조회
    - 매칭된 스케줄마다 `queueNightJob()` 호출하여 night_jobs에 등록
    - nextRunAt을 다음 실행 시간으로 갱신
    - 폴링 간격: 60초 (스케줄은 분 단위 정밀도이므로 충분)
    - isActive=false인 스케줄은 조회에서 제외
  - [x] `packages/server/src/index.ts`에 `startScheduleWorker()` 추가 (startJobWorker 옆)

- [x] Task 4: 빌드 확인 (AC: #8)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 핵심 설계: 스케줄 → 작업 변환 패턴

```
night_job_schedules (cron 정의)
     ↓ 스케줄 워커가 nextRunAt 도달 감지
     ↓ queueNightJob() 호출
night_jobs (실제 실행 큐)
     ↓ 기존 job-queue.ts 폴링 워커가 처리
     ↓ AI 응답 생성 + 결과 저장
완료
```

기존 `job-queue.ts`(야간 작업 실행 엔진)는 수정하지 않음. 스케줄 워커는 새 작업을 큐에 넣기만 하고, 실행은 기존 워커가 담당.

### cron 파서 라이브러리: croner

- `croner` 선택 이유: ESM 네이티브, 0 dependency, Bun 호환, TypeScript 타입 포함
- 사용법:
  ```typescript
  import { Cron } from 'croner'

  // 유효성 검증
  try { new Cron('0 2 * * *'); return true } catch { return false }

  // 다음 실행 시간
  const job = new Cron('0 2 * * *')
  const next = job.nextRun()  // Date 객체 반환
  ```

### DB 스키마 (이미 존재 — 수정 없음)

`night_job_schedules` 테이블이 `packages/server/src/db/schema.ts:324-338`에 이미 정의되어 있음:
```typescript
export const nightJobSchedules = pgTable('night_job_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  instruction: text('instruction').notNull(),
  cronExpression: varchar('cron_expression', { length: 100 }).notNull(),
  nextRunAt: timestamp('next_run_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('night_schedules_company_idx').on(table.companyId),
}))
```

마이그레이션도 이미 적용된 상태. **새 마이그레이션 불필요.**

`nightJobs.scheduleId` 컬럼도 이미 존재 (schema.ts:308) — 스케줄에서 생성된 작업 추적 가능.

### 기존 코드 참조

- **작업 큐 엔진**: `packages/server/src/lib/job-queue.ts` — `queueNightJob()` 함수 재사용
- **작업 API**: `packages/server/src/routes/workspace/jobs.ts` — API 패턴 참조
- **서버 진입점**: `packages/server/src/index.ts` — 워커 시작 위치 참조

### API 엔드포인트 설계

```typescript
// POST /api/workspace/schedules
// Body: { agentId: uuid, instruction: string, cronExpression: string, isActive?: boolean }
// → nextRunAt 자동 계산, 201 반환
// 에러: SCHEDULE_001 (invalid cron), SCHEDULE_003 (agent not found)

// GET /api/workspace/schedules
// → [{ id, agentId, agentName, instruction, cronExpression, nextRunAt, isActive, createdAt, updatedAt }]
// 정렬: updatedAt DESC

// PATCH /api/workspace/schedules/:id
// Body: { instruction?, cronExpression?, isActive? }
// → 소유자만, cronExpression 변경 시 nextRunAt 재계산
// 에러: SCHEDULE_002 (not found), SCHEDULE_003 (not owner)

// DELETE /api/workspace/schedules/:id
// → 소유자만, 연결된 queued 상태 night_jobs도 삭제
// 에러: SCHEDULE_002 (not found), SCHEDULE_003 (not owner)
```

### 스케줄 워커 설계

```typescript
// schedule-worker.ts
const SCHEDULE_POLL_INTERVAL_MS = 60_000  // 60초 (분 단위 정밀도)

async function pollSchedules() {
  const now = new Date()
  // isActive=true AND nextRunAt <= now
  const dueSchedules = await db.select()
    .from(nightJobSchedules)
    .where(and(
      eq(nightJobSchedules.isActive, true),
      lte(nightJobSchedules.nextRunAt, now),
    ))

  for (const schedule of dueSchedules) {
    // 1. 작업 큐에 등록
    await queueNightJob({
      companyId: schedule.companyId,
      userId: schedule.userId,
      agentId: schedule.agentId,
      instruction: schedule.instruction,
      scheduledFor: new Date(),
    })
    // TODO: scheduleId를 queueNightJob에 전달하려면 함수 확장 필요

    // 2. nextRunAt을 다음 실행 시간으로 갱신
    const nextRun = getNextRunAt(schedule.cronExpression)
    await db.update(nightJobSchedules)
      .set({ nextRunAt: nextRun, updatedAt: new Date() })
      .where(eq(nightJobSchedules.id, schedule.id))
  }
}
```

### queueNightJob 확장

`job-queue.ts`의 `queueNightJob` 파라미터에 `scheduleId?: string` 추가 필요:
```typescript
export async function queueNightJob(params: {
  companyId: string
  userId: string
  agentId: string
  sessionId?: string
  scheduleId?: string  // ← 추가
  instruction: string
  scheduledFor?: Date
})
```
그리고 `.values({ ... scheduleId: params.scheduleId || null })` 추가.

### 이전 에픽 학습사항 적용

- UUID params에 반드시 `zValidator('param', z.object({ id: z.string().uuid() }))` 적용
- `authMiddleware`를 `use('*', ...)` 로 전역 적용
- 에러 코드 네임스페이스 일관성: SCHEDULE_001~003
- `c.get('tenant')` 로 companyId/userId 추출하여 테넌트 격리
- `Hono<AppEnv>` 타입 사용

### 이 스토리에서 하지 않는 것

- 프론트엔드 UI (Story 11-2에서 구현)
- 이벤트 기반 트리거 (Story 11-3에서 구현)
- 자동 리포트 생성 (Story 11-4에서 구현)
- WebSocket 이벤트 (Story 11-5에서 구현)
- 고급 작업 체인 (Story 11-6에서 구현)

### 파일 구조

```
신규 파일:
  packages/server/src/lib/cron-utils.ts (cron 파서 유틸)
  packages/server/src/lib/schedule-worker.ts (스케줄 폴링 워커)
  packages/server/src/routes/workspace/schedules.ts (스케줄 CRUD API)
수정 파일:
  packages/server/src/lib/job-queue.ts (queueNightJob에 scheduleId 파라미터 추가)
  packages/server/src/index.ts (schedules 라우트 등록 + startScheduleWorker 호출)
  packages/server/package.json (croner 의존성 추가)
```

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- croner v10.0.1 설치, cron-utils.ts로 parseCron/getNextRunAt 유틸 구현
- 스케줄 CRUD API 4개 (POST/GET/PATCH/DELETE) + 에러 코드 3종
- 스케줄 워커: 60초 폴링, 도달한 스케줄 → night_jobs 큐 등록 + nextRunAt 갱신
- queueNightJob에 scheduleId 파라미터 추가
- turbo build 3/3, type-check 5/5, 179 unit tests 통과

### Change Log

- 2026-03-05: Story 11-1 구현 완료 — cron 파서 + 스케줄 CRUD + 워커

### File List

New:
- packages/server/src/lib/cron-utils.ts
- packages/server/src/lib/schedule-worker.ts
- packages/server/src/routes/workspace/schedules.ts
- packages/server/src/__tests__/unit/cron-utils.test.ts

Modified:
- packages/server/src/lib/job-queue.ts (scheduleId 파라미터 추가)
- packages/server/src/index.ts (schedules 라우트 + startScheduleWorker)
- package.json (croner 의존성)
