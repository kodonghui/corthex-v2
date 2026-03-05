# Story 8.4: P2 데이터베이스 스키마 — 도구 카탈로그 + 야간작업 스케줄 + 파일 관리 + 위임 계층

Status: review

## Story

As a 백엔드 개발자,
I want P2 에픽(9~13)에 필요한 DB 테이블과 컬럼을 미리 추가한다,
so that 도구 카탈로그, 야간작업 스케줄링, 파일 관리, 에이전트 위임 계층 기능 개발 시 스키마가 준비되어 있다.

## Acceptance Criteria

1. **Given** toolDefinitions 테이블 **When** 도구 카탈로그 조회 **Then** category, tags(JSONB) 필드로 분류 가능
2. **Given** nightJobSchedules 테이블 **When** 반복 야간작업 등록 **Then** cron식 스케줄 + nextRunAt 기반 실행 가능
3. **Given** nightJobTriggers 테이블 **When** 이벤트 트리거 등록 **Then** 조건(가격 상/하한, 시장 개장 등) 기반 자동 실행 가능
4. **Given** nightJobs 테이블 **When** 스케줄/트리거에서 생성된 작업 **Then** scheduleId, triggerId FK로 출처 추적 가능
5. **Given** files 테이블 **When** 파일 업로드 **Then** 메타데이터(이름, MIME, 크기, 경로) 저장 + companyId 테넌트 격리
6. **Given** delegations 테이블 **When** 계층 위임 발생 **Then** parentDelegationId, depth로 위임 체인 추적 가능
7. **Given** drizzle-kit generate **When** 스키마 변경 후 **Then** 마이그레이션 SQL 생성 성공
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: toolDefinitions 확장 (AC: #1)
  - [x] `category` varchar(50) 추가 (예: 'search', 'finance', 'content', 'utility')
  - [x] `tags` jsonb 추가 (예: ['web', 'api', 'free'])
  - [x] `updatedAt` timestamp 추가 (현재 createdAt만 있음)

- [x] Task 2: nightJobSchedules 테이블 생성 (AC: #2)
  - [x] id, companyId, userId, agentId, instruction, cronExpression, nextRunAt, isActive, createdAt, updatedAt
  - [x] relations 정의 (company, user, agent)
  - [x] companyIdx 인덱스

- [x] Task 3: nightJobTriggers 테이블 생성 (AC: #3)
  - [x] id, companyId, userId, agentId, instruction, triggerType varchar(50), condition jsonb, isActive, lastTriggeredAt, createdAt
  - [x] triggerType 예시: 'price_above', 'price_below', 'market_open', 'market_close', 'time_based'
  - [x] relations 정의 (company, user, agent)

- [x] Task 4: nightJobs 확장 (AC: #4)
  - [x] `scheduleId` uuid FK → nightJobSchedules.id (nullable)
  - [x] `triggerId` uuid FK → nightJobTriggers.id (nullable)
  - [x] `resultData` jsonb 추가 (구조화된 실행 결과)
  - [x] nightJobsRelations에 schedule, trigger 관계 추가

- [x] Task 5: files 테이블 생성 (AC: #5)
  - [x] id, companyId, userId, filename varchar(255), mimeType varchar(100), sizeBytes integer, storagePath text, isActive, createdAt
  - [x] relations 정의 (company, user)
  - [x] companyIdx 인덱스

- [x] Task 6: delegations 확장 (AC: #6)
  - [x] `parentDelegationId` uuid FK → delegations.id (nullable, 자기참조)
  - [x] `depth` integer default 0
  - [x] delegationsRelations에 parentDelegation 관계 추가

- [x] Task 7: 마이그레이션 생성 + 빌드 검증 (AC: #7, #8)
  - [x] `bun run db:generate` 실행하여 마이그레이션 SQL 생성
  - [x] 생성된 SQL 검토
  - [x] turbo build 3/3 성공 확인

## Dev Notes

### toolDefinitions 확장

```typescript
// 기존 toolDefinitions에 추가
category: varchar('category', { length: 50 }),  // 'search', 'finance', 'content', 'utility', 'communication'
tags: jsonb('tags'),  // string[] — ['web', 'api', 'free', 'premium']
updatedAt: timestamp('updated_at').notNull().defaultNow(),
```

### nightJobSchedules 설계

```typescript
export const nightJobSchedules = pgTable('night_job_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  instruction: text('instruction').notNull(),
  cronExpression: varchar('cron_expression', { length: 100 }).notNull(),  // '0 22 * * 1-5' = 평일 22시
  nextRunAt: timestamp('next_run_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('night_schedules_company_idx').on(table.companyId),
}))
```

### nightJobTriggers 설계

```typescript
export const nightJobTriggers = pgTable('night_job_triggers', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').notNull().references(() => agents.id),
  instruction: text('instruction').notNull(),
  triggerType: varchar('trigger_type', { length: 50 }).notNull(),  // price_above, price_below, market_open, etc.
  condition: jsonb('condition').notNull(),  // { stockCode: '005930', threshold: 80000 }
  isActive: boolean('is_active').notNull().default(true),
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('night_triggers_company_idx').on(table.companyId),
}))
```

### nightJobs 확장

```typescript
// 기존 nightJobs에 추가
scheduleId: uuid('schedule_id'),  // FK via relations (정의 순서 제약)
triggerId: uuid('trigger_id'),  // FK via relations (정의 순서 제약)
resultData: jsonb('result_data'),  // 구조화된 결과 (기존 result는 text)
```

### files 설계

```typescript
export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storagePath: text('storage_path').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  companyIdx: index('files_company_idx').on(table.companyId),
}))
```

### delegations 확장

```typescript
// 기존 delegations에 추가
parentDelegationId: uuid('parent_delegation_id'),  // 자기참조 — 연쇄 위임 추적
depth: integer('depth').notNull().default(0),  // 위임 깊이 (0 = 직접, 1+ = 연쇄)
```

### 마이그레이션 명령

```bash
cd packages/server && bun run db:generate
```
기존 패턴: drizzle-kit이 자동 생성하며, 서버 시작 시 `migrate()` 자동 적용.

### 기존 스키마 패턴 (반드시 따를 것)

- 모든 테이블에 `id: uuid().primaryKey().defaultRandom()`
- 테넌트 격리: `companyId` FK + `companyIdx` 인덱스
- 타임스탬프: `createdAt: timestamp().notNull().defaultNow()`
- boolean 기본값: `.notNull().default(true/false)`
- relations 정의는 스키마 하단에 별도 export
- 네이밍: camelCase (TS) → snake_case (DB)

### Project Structure Notes

- DB 스키마: packages/server/src/db/schema.ts (590줄 → ~660줄)
- 마이그레이션: packages/server/src/db/migrations/ (0000~0010)
- 시드: packages/server/src/db/seed.ts
- Drizzle 설정: packages/server/drizzle.config.ts

### References

- [Source: packages/server/src/db/schema.ts:189-203] — toolDefinitions 현재 구조
- [Source: packages/server/src/db/schema.ts:296-313] — nightJobs 현재 구조
- [Source: packages/server/src/db/schema.ts:228-241] — delegations 현재 구조
- [Source: packages/server/src/db/schema.ts:1] — import 구문 (pgTable, uuid, varchar 등)
- [Source: packages/server/drizzle.config.ts] — 마이그레이션 출력 경로: ./src/db/migrations
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml:139-165] — Epic 9~13 스토리 목록

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: toolDefinitions에 category(varchar50), tags(jsonb), updatedAt(timestamp) 추가
- Task 2: nightJobSchedules 테이블 생성 — cronExpression + nextRunAt + relations
- Task 3: nightJobTriggers 테이블 생성 — triggerType + condition(jsonb) + relations
- Task 4: nightJobs에 scheduleId, triggerId, resultData 추가 + relations 확장
- Task 5: files 테이블 생성 — filename, mimeType, sizeBytes, storagePath + relations
- Task 6: delegations에 parentDelegationId(자기참조), depth 추가 + relations
- Task 7: drizzle-kit generate → 0010_strong_mephistopheles.sql 생성, turbo build 3/3 성공

### File List
- packages/server/src/db/schema.ts (MODIFIED — 3개 테이블 추가, 3개 테이블 확장, relations 추가)
- packages/server/src/db/migrations/0010_strong_mephistopheles.sql (NEW — P2 마이그레이션)
- packages/server/src/db/migrations/meta/0010_snapshot.json (NEW — Drizzle 메타데이터)
