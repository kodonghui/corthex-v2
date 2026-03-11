# Story 5.1: 비서 에이전트 DB 필드 및 설정

Status: done

## Story

As a 관리자,
I want 에이전트를 비서실장으로 지정할 수 있는 것을,
so that 사용자 메시지가 비서를 통해 자동 라우팅된다.

## Acceptance Criteria

1. agents 테이블에 `is_secretary boolean DEFAULT false` 컬럼 (**이미 존재** — 확인 완료)
2. agents 테이블에 `owner_user_id uuid REFERENCES users(id)` 컬럼 추가 (신규)
3. 회사당 `is_secretary=true` 에이전트 최대 1명 제약 (unique partial index)
4. 비서 삭제 방지 → `ORG_SECRETARY_DELETE_DENIED` 에러
5. 마이그레이션 파일 생성 + 기존 데이터 무중단

## Tasks / Subtasks

- [x] Task 1: Schema 업데이트 (AC: #1, #2)
  - [x] 1.1 `packages/server/src/db/schema.ts` — agents 테이블에 `ownerUserId` 컬럼 추가
  - [x] 1.2 `is_secretary` 컬럼 이미 존재 확인 (변경 불필요)

- [x] Task 2: Drizzle 마이그레이션 생성 (AC: #5)
  - [x] 2.1 drizzle-kit collision으로 수동 SQL 마이그레이션 작성
  - [x] 2.2 SQL에 unique partial index 포함 (AC: #3)
  - [x] 2.3 마이그레이션 SQL 검증 — ALTER ADD nullable + CREATE UNIQUE INDEX WHERE

- [x] Task 3: Unique Partial Index (AC: #3)
  - [x] 3.1 마이그레이션 SQL에 `agents_secretary_unique` partial index 추가

- [x] Task 4: 에러 코드 등록 (AC: #4)
  - [x] 4.1 `packages/server/src/lib/error-codes.ts` — `ORG_SECRETARY_DELETE_DENIED` 추가

- [x] Task 5: 비서 삭제 방지 로직 (AC: #4)
  - [x] 5.1 `packages/server/src/services/organization.ts` — `deactivateAgent()` 함수에 비서 보호 로직 추가
  - [x] 5.2 `isSystem` 체크 직후에 `isSecretary` 체크 추가
  - [x] 5.3 에러 반환: `{ status: 403, message: '비서 에이전트는 삭제할 수 없습니다', code: 'ORG_SECRETARY_DELETE_DENIED' }`

- [x] Task 6: 테스트 + 검증
  - [x] 6.1 agent-crud.test.ts — secretary delete protection 테스트 추가
  - [x] 6.2 agent-crud-tea.test.ts — 기존 TEA 테스트 업데이트 (secretary 삭제 차단 반영)
  - [x] 6.3 tsc --noEmit 통과
  - [x] 6.4 65 tests pass (0 fail)

## Dev Notes

### 기존 코드 분석 (CRITICAL)

**`is_secretary` 이미 존재:**
- `packages/server/src/db/schema.ts:158` — `isSecretary: boolean('is_secretary').notNull().default(false)`
- 이미 hub.ts, chat.ts, nexus.ts, dashboard.ts 등 15+ 곳에서 사용 중
- **변경 불필요 — 확인만**

**`owner_user_id` 미존재:**
- schema.ts agents 테이블에 없음 → 신규 추가 필요
- `userId` 필드가 이미 있지만 이것은 "생성한 사용자"이고, `ownerUserId`는 "CLI 토큰 소유 인간직원" 매핑용
- Nullable이어야 함 (모든 에이전트가 소유자를 가지진 않음)

**비서 삭제 방지 패턴 (기존 isSystem 참고):**
```typescript
// packages/server/src/services/organization.ts:397-400
if (current.isSystem) {
  return { error: { status: 403, message: '시스템 에이전트는 삭제할 수 없습니다', code: 'AGENT_003' } }
}
// 여기 바로 아래에 isSecretary 체크 추가
```

**에러 코드 패턴 (기존 참고):**
```typescript
// packages/server/src/lib/error-codes.ts
export const ERROR_CODES = {
  // ... 기존 코드들
  ORG_SECRETARY_DELETE_DENIED: 'ORG_SECRETARY_DELETE_DENIED',  // 추가
} as const
```

**마이그레이션 번호:** 현재 최대 `0046`. 새 파일은 `0047_*` 이어야 함.

### 관련 파일 (v1 참고)
- v1: `chief-of-staff.ts` 하드코딩 → v2: DB 플래그로 동적 지정
- `owner_user_id`: 인간 직원 1명 = OAuth CLI 1개 매핑의 기반 (Epic 3 OAuth CLI 아키텍처)

### Architecture Compliance

- **D1 (getDB):** 비즈니스 로직에서 `getDB(ctx.companyId)` 사용 (organization.ts는 이미 scopedWhere 패턴 사용)
- **D3 (에러 코드):** `error-codes.ts`에 등록 필수
- **D12 (토큰 등록시만 검증):** owner_user_id는 등록 시 users 테이블 참조만 검증
- 스키마 변경은 Drizzle ORM 패턴 따름 (pgTable, uuid, boolean, references)

### Project Structure Notes

- Schema: `packages/server/src/db/schema.ts` (agents 테이블 라인 143~167)
- Migrations: `packages/server/src/db/migrations/` (drizzle-kit generate)
- Error codes: `packages/server/src/lib/error-codes.ts`
- Organization service: `packages/server/src/services/organization.ts`
- Admin agent route: `packages/server/src/routes/admin/agents.ts`
- Seed (E5): `packages/server/src/db/seed-e5.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1] — AC 원본
- [Source: _bmad-output/planning-artifacts/architecture.md#D12] — 토큰 등록시만 검증
- [Source: _bmad-output/planning-artifacts/architecture.md#FR30~37] — Organization Management
- [Source: packages/server/src/db/schema.ts:158] — isSecretary 기존 정의
- [Source: packages/server/src/services/organization.ts:385-400] — deactivateAgent 기존 패턴
- [Source: packages/server/src/lib/error-codes.ts] — 에러 코드 레지스트리

### Library/Framework Requirements

- Drizzle ORM: `pgTable`, `uuid`, `boolean`, `references`, `index`, `uniqueIndex`
- `drizzle-kit generate` → SQL 마이그레이션 자동 생성
- Partial unique index는 Drizzle가 직접 지원하지 않음 → 생성된 SQL에 수동 추가

### Testing Requirements

- bun:test (server 패키지)
- TEA 리스크 기반 테스트 생성 후 실행
- 주요 테스트 케이스:
  - owner_user_id 컬럼 존재 + nullable 확인
  - is_secretary unique partial index 작동 (동일 회사 2번째 비서 지정 시 에러)
  - 비서 에이전트 삭제 시도 → ORG_SECRETARY_DELETE_DENIED 에러
  - 비비서 에이전트 삭제는 정상 작동
  - 기존 데이터 무중단 (마이그레이션 전후 데이터 보존)

### Previous Story Intelligence (Epic 4)

- Epic 4 완료 (Stories 4.1~4.6 전부 done)
- 패턴: scopedWhere + getDB 사용, engine/ 패턴 준수
- commit 스타일: `feat: Story X.Y title — N tests + details`
- simplify 스킬 실행 후 코드 품질 개선

### Git Intelligence

최근 커밋 패턴:
- `cafc58b feat: Story 4.6 Epic 1~20 regression test`
- `bb66be4 feat: Story 4.5 handoff chain integration test`
- `6c7fd9c feat: Story 4.4 Graceful Shutdown`
- 모든 커밋이 feat/fix 접두사 + Story 번호 + 구체적 내용 포함

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- drizzle-kit generate collision (0016/0037 snapshot conflict) → 수동 SQL 마이그레이션 작성
- agent-crud-tea.test.ts "allows deactivation of non-system secretary" → Story 5.1 요구사항에 맞게 업데이트

### Completion Notes List

- AC#1: `is_secretary` 기존 확인 완료 (schema.ts:158)
- AC#2: `ownerUserId` 추가 (nullable uuid FK → users), Drizzle relation `ownerUser` + 역방향 `ownedAgents` 추가
- AC#3: `agents_secretary_unique` partial index — 마이그레이션 SQL에 포함
- AC#4: `ORG_SECRETARY_DELETE_DENIED` 에러코드 + `deactivateAgent()` 보호 로직 추가
- AC#5: `0047_secretary-owner-fields.sql` 수동 마이그레이션 작성
- 테스트: 65 pass, 0 fail (agent-crud + agent-crud-tea)
- tsc --noEmit: clean

### Change Log

- 2026-03-11: Story 5.1 구현 완료 — schema, migration, error code, delete protection, tests

### File List

- packages/server/src/db/schema.ts (modified — ownerUserId 컬럼 + relations 추가)
- packages/server/src/db/migrations/0047_secretary-owner-fields.sql (new — migration SQL)
- packages/server/src/lib/error-codes.ts (modified — ORG_SECRETARY_DELETE_DENIED 추가)
- packages/server/src/services/organization.ts (modified — secretary delete protection)
- packages/server/src/__tests__/unit/agent-crud.test.ts (modified — secretary delete test 추가 + ownerUserId 필드)
- packages/server/src/__tests__/unit/agent-crud-tea.test.ts (modified — secretary delete 차단 반영 + ownerUserId/autoLearn 필드)
