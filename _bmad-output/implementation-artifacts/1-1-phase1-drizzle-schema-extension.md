# Story 1.1: Phase 1 Drizzle Schema Extension

Status: done

## Story

As a **system architect**,
I want **all Phase 1 core tables defined in the Drizzle ORM schema with proper relations, indexes, and tenant isolation**,
so that **all subsequent Epic 1-5 stories have a stable data foundation to build upon**.

## Acceptance Criteria

1. **6개 신규 테이블** 스키마 정의 완료: commands, tasks, quality_reviews, presets, org_templates, audit_logs
2. **기존 agents 테이블 확장**: `isSystem` boolean 추가, `allowedTools` jsonb(string[]) 추가
3. 모든 신규 테이블에 `companyId` FK + index 포함 (테넌트 격리 준비)
4. 모든 테이블에 `createdAt` 타임스탬프 포함 (audit_logs는 updatedAt 제외 - INSERT ONLY)
5. Drizzle 마이그레이션 파일 생성 + `drizzle-kit generate` 성공
6. 기존 테이블(companies, users, admin_users, departments, agents, cost_records, tool_calls 등)과의 관계(relations) 정의
7. 기존 201건 테스트 전부 통과 유지
8. `bun run typecheck` 통과 (타입 에러 없음)

## Tasks / Subtasks

- [x] Task 1: 신규 테이블 스키마 정의 (AC: #1, #3, #4)
  - [x] 1.1 `commands` 테이블 추가 (CEO 명령 이력)
  - [x] 1.2 `tasks` 테이블 추가 (오케스트레이션 작업 추적) — `orchestrationTasks`로 명명
  - [x] 1.3 `quality_reviews` 테이블 추가 (QA 게이트 결과)
  - [x] 1.4 `presets` 테이블 추가 (명령 프리셋)
  - [x] 1.5 `org_templates` 테이블 추가 (조직 템플릿)
  - [x] 1.6 `audit_logs` 테이블 추가 (삭제 불가 감사 로그, updatedAt 없음)
- [x] Task 2: 기존 테이블 확장 (AC: #2)
  - [x] 2.1 agents 테이블에 `isSystem` boolean 추가
  - [x] 2.2 agents 테이블에 `allowedTools` jsonb 추가
- [x] Task 3: 관계(relations) 정의 (AC: #6)
  - [x] 3.1 신규 테이블 → 기존 테이블 relations 정의 (6개 relations)
  - [x] 3.2 companiesRelations에 신규 many 관계 추가 (6개)
- [x] Task 4: Enum 추가
  - [x] 4.1 `commandTypeEnum` 추가 (8종)
  - [x] 4.2 `orchestrationTaskStatusEnum` 추가 (5종)
  - [x] 4.3 `qualityResultEnum` 추가 (pass/fail)
- [x] Task 5: 마이그레이션 생성 + 검증 (AC: #5, #7, #8)
  - [x] 5.1 SQL 마이그레이션 파일 수동 생성 (drizzle-kit interactive 제약)
  - [x] 5.2 기존 테스트 통과 확인 (baseline 동일: 2535 pass, 255 fail pre-existing)
  - [x] 5.3 신규 테스트 20건 통과 확인

## Dev Notes

### CRITICAL: 기존 스키마 분석 (Epic 0 Foundation)

기존 `packages/server/src/db/schema.ts`에 **이미 34개 테이블 + 관계가 정의됨**. 반드시 기존 코드를 읽고 확장할 것. 새로 만들지 말 것!

**이미 존재하는 테이블 (건드리지 말 것 또는 최소 변경):**
- `companies` - 회사/테넌트 (line 22)
- `users` - 앱 사용자 (line 33)
- `admin_users` - 관리자 (line 49)
- `departments` - 부서 (line 97)
- `agents` - AI 에이전트 (line 110) → **확장 필요** (아래 참고)
- `cost_records` - AI 비용 기록 (line 462) → 이미 존재, 추가 불필요
- `tool_calls` - 도구 호출 기록 (line 310) → architecture의 `tool_invocations`에 해당, 이미 존재
- `api_keys` - API 키/크리덴셜 (line 160) → architecture의 `credentials`에 해당, 이미 존재
- `activity_logs` - 작전일지 (line 424) → audit_logs와는 다름 (아래 참고)
- 그 외 30+ 테이블 (chat, sns, strategy, messenger, etc.)

### agents 테이블 확장 상세

현재 agents 테이블 (line 110-130):
```typescript
// 현재 칼럼: id, companyId, userId, departmentId, name, role, tier, nameEn,
//            modelName, reportTo, soul, adminSoul, status, isSecretary, isActive,
//            createdAt, updatedAt
```

**추가할 칼럼:**
- `isSystem: boolean('is_system').notNull().default(false)` — 시스템 에이전트 여부 (삭제 불가)
  - 주의: `isSecretary`와는 다른 개념. isSecretary는 비서실장 역할, isSystem은 삭제 보호
- `allowedTools: jsonb('allowed_tools').default([])` — 허용 도구 이름 목록 (string[])

### 신규 테이블 상세 스키마

**1. commands (CEO 명령 이력)**
```
id: uuid PK
companyId: uuid FK→companies NOT NULL
userId: uuid FK→users NOT NULL (명령 발신자)
type: commandTypeEnum NOT NULL  -- 'direct'|'mention'|'slash'|'preset'|'batch'|'all'|'sequential'|'deepwork'
text: text NOT NULL (원본 명령 텍스트)
targetAgentId: uuid FK→agents (null이면 자동 분류)
status: varchar(20) 'pending'|'processing'|'completed'|'failed'|'cancelled'
result: text (최종 결과/보고서)
metadata: jsonb (슬래시 종류, 프리셋ID 등)
createdAt: timestamp
completedAt: timestamp
index: companyId, (companyId + userId), (companyId + createdAt)
```

**2. tasks (오케스트레이션 작업 추적)**
```
id: uuid PK
companyId: uuid FK→companies NOT NULL
commandId: uuid FK→commands NOT NULL (상위 명령)
agentId: uuid FK→agents NOT NULL (실행 에이전트)
parentTaskId: uuid (self-ref, 위임 체인 추적)
type: varchar(30) -- 'classify'|'delegate'|'execute'|'synthesize'|'review'
input: text (작업 입력)
output: text (작업 결과)
status: taskStatusEnum -- 'pending'|'running'|'completed'|'failed'|'timeout'
startedAt: timestamp
completedAt: timestamp
durationMs: integer
metadata: jsonb (도구 호출 수, 토큰 수 등)
createdAt: timestamp
index: companyId, (companyId + commandId), (companyId + agentId)
```

**3. quality_reviews (QA 게이트 결과)**
```
id: uuid PK
companyId: uuid FK→companies NOT NULL
commandId: uuid FK→commands NOT NULL
taskId: uuid FK→tasks (검수 대상 작업)
reviewerAgentId: uuid FK→agents NOT NULL (비서실장)
conclusion: varchar(10) -- 'pass'|'fail'
scores: jsonb NOT NULL -- {conclusionQuality, evidenceSources, riskAssessment, formatCompliance, logicalCoherence}
feedback: text (fail 시 재작업 지시)
attemptNumber: integer NOT NULL DEFAULT 1 (재작업 회차, max 3)
createdAt: timestamp
index: companyId, (companyId + commandId)
```

**4. presets (명령 프리셋)**
```
id: uuid PK
companyId: uuid FK→companies NOT NULL
userId: uuid FK→users NOT NULL (생성자)
name: varchar(100) NOT NULL
description: text
command: text NOT NULL (프리셋 명령 텍스트)
category: varchar(50) (루틴, 분석, 보고 등)
isGlobal: boolean DEFAULT false (회사 전체 공유 여부)
sortOrder: integer DEFAULT 0
isActive: boolean DEFAULT true
createdAt: timestamp
updatedAt: timestamp
index: companyId, (companyId + userId)
```

**5. org_templates (조직 템플릿)**
```
id: uuid PK
companyId: uuid FK→companies (null = 플랫폼 내장 템플릿)
name: varchar(100) NOT NULL
description: text
templateData: jsonb NOT NULL -- {departments: [{name, agents: [{name, tier, modelName, soul, allowedTools}]}]}
isBuiltin: boolean DEFAULT false (플랫폼 내장 여부)
isActive: boolean DEFAULT true
createdBy: uuid FK→users
createdAt: timestamp
updatedAt: timestamp
index: companyId
```

**6. audit_logs (삭제 불가 감사 로그)**
```
id: uuid PK
companyId: uuid FK→companies NOT NULL
actorType: varchar(20) NOT NULL -- 'admin_user'|'user'|'agent'|'system'
actorId: uuid NOT NULL (실행자 ID)
action: varchar(100) NOT NULL -- 'org.department.create'|'org.agent.delete'|'credential.access'|'trade.order'...
targetType: varchar(50) -- 'department'|'agent'|'credential'|'company'|...
targetId: uuid
before: jsonb (변경 전 상태)
after: jsonb (변경 후 상태)
metadata: jsonb (IP, userAgent 등)
createdAt: timestamp NOT NULL
-- NO updatedAt! INSERT-ONLY 테이블. DELETE/UPDATE 쿼리 금지.
index: companyId, (companyId + action), (companyId + createdAt), (companyId + targetType + targetId)
```

### Enum 추가 목록

```typescript
// 새로 추가할 enum
export const commandTypeEnum = pgEnum('command_type', [
  'direct', 'mention', 'slash', 'preset', 'batch', 'all', 'sequential', 'deepwork'
])

export const taskStatusEnum_v2 = pgEnum('task_status', [
  'pending', 'running', 'completed', 'failed', 'timeout'
])
// 주의: 기존 jobStatusEnum과 이름 충돌 없도록 할 것

export const qualityResultEnum = pgEnum('quality_result', ['pass', 'fail'])
```

### activity_logs vs audit_logs 구분

- `activity_logs`: 모든 종류의 활동 로그 (UI 표시용, 통신로그 4탭). 필터/검색 가능. 일반 테이블.
- `audit_logs`: 보안/규정 감사 로그. INSERT ONLY. 삭제/수정 절대 불가. 금융 거래, 조직 변경, 권한 변경, 크리덴셜 접근 전용.
- 두 테이블은 **용도가 다르므로 둘 다 유지**.

### Project Structure Notes

- 스키마 파일: `packages/server/src/db/schema.ts` (단일 파일, 기존 코드에 추가)
- Drizzle config: `packages/server/drizzle.config.ts`
- 마이그레이션: `packages/server/drizzle/` 디렉토리
- 기존 패턴을 따를 것: pgTable, uuid PK, references, index, relations

### Architecture Compliance

- [Source: architecture.md#Decision-10] Data Architecture 핵심 테이블 목록 준수
- [Source: architecture.md#Decision-9] Tenant Isolation: 모든 테이블에 companyId + FK + index
- [Source: architecture.md#Decision-1] Orchestration: commands + tasks 테이블로 명령-작업 체인 추적
- [Source: architecture.md#Decision-6] Quality Gate: quality_reviews 테이블로 5항목 검수 결과 저장
- [Source: architecture.md#Decision-5] Dynamic Org: org_templates 테이블로 템플릿 관리
- [Source: architecture.md#Naming-Conventions] DB 테이블 snake_case 복수형, 칼럼 snake_case

### Library/Framework Requirements

- Drizzle ORM v0.39 (`drizzle-orm/pg-core`의 pgTable, pgEnum, relations 등)
- PostgreSQL UUID, JSONB, timestamp 타입 사용
- Drizzle Kit으로 마이그레이션 생성 (`bunx drizzle-kit generate`)

### File Structure

**수정할 파일:**
- `packages/server/src/db/schema.ts` — 테이블 + 관계 추가

**생성될 파일:**
- `packages/server/drizzle/XXXX_*.sql` — 자동 생성 마이그레이션

### Testing Requirements

- 기존 201건 bun:test 전부 통과 확인 (`cd packages/server && bun test`)
- 타입체크: `bun run typecheck` 또는 `bunx tsc --noEmit`
- 마이그레이션 생성 성공 확인

### References

- [Source: _bmad-output/planning-artifacts/epics.md#E1-S1] 스토리 정의 + AC
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-10] Data Architecture 테이블 목록
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-9] Tenant Isolation 패턴
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-1] Orchestration Engine 흐름
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-6] Quality Gate 5항목
- [Source: _bmad-output/planning-artifacts/architecture.md#Decision-7] Cost Tracking (cost_records 이미 존재)
- [Source: packages/server/src/db/schema.ts] 기존 스키마 (34 테이블 + relations)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- 6개 신규 테이블: commands, orchestrationTasks, qualityReviews, presets, orgTemplates, auditLogs
- agents 테이블 확장: isSystem + allowedTools 칼럼 추가
- 3개 신규 enum: commandTypeEnum, orchestrationTaskStatusEnum, qualityResultEnum
- 기존 테이블(cost_records, tool_calls, api_keys)은 이미 존재 → 중복 생성 안 함
- audit_logs는 INSERT-ONLY (updatedAt 없음), activity_logs와 별도 유지
- orchestration_tasks로 명명 (기존 jobStatusEnum 충돌 방지)
- 20건 신규 테스트 + 기존 14건 schema 테스트 모두 통과, zero regressions

### File List

- packages/server/src/db/schema.ts (수정 — 6 테이블 + 3 enum + agents 확장 + 7 relations)
- packages/server/src/__tests__/unit/phase1-schema-extension.test.ts (신규 — 20 테스트)
- packages/server/src/db/migrations/0031_phase1-schema-extension.sql (신규 — SQL 마이그레이션)
- packages/server/src/db/migrations/meta/_journal.json (수정 — 마이그레이션 엔트리 추가)
