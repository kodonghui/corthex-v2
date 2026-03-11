# Story 1.2: getDB(companyId) 멀티테넌시 래퍼

Status: done

## Story

As a 서버 개발자,
I want 모든 DB 접근이 companyId로 자동 격리되는 것을,
so that 타사 데이터에 접근할 수 없다.

## Acceptance Criteria

1. [x] `packages/server/src/db/scoped-query.ts` (~30줄) 생성
2. [x] READ: agents(), departments(), knowledgeDocs() 스코프 쿼리
3. [x] WRITE: insertAgent(), updateAgent(), deleteAgent() — companyId 자동 주입
4. [x] UPDATE/DELETE에 companyId WHERE 자동 적용 (E3)
5. [x] companyId 빈 문자열 시 throw Error (가드)
6. [x] 단위 테스트: `scoped-query.test.ts` — 격리 검증 3케이스
7. [x] 기존 `tenant-isolation.test.ts`에 getDB 케이스 추가

## Tasks / Subtasks

- [x] Task 1: getDB 래퍼 함수 생성 (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 `packages/server/src/db/scoped-query.ts` 파일 생성
  - [x] 1.2 `getDB(companyId: string)` 함수 구현 — companyId 빈 문자열 가드
  - [x] 1.3 READ 메서드: `agents()`, `departments()`, `knowledgeDocs()` — 각각 `db.select().from(table).where(eq(table.companyId, companyId))` 반환
  - [x] 1.4 WRITE 메서드: `insertAgent(data)` — `Omit<NewAgent, 'companyId'>` 타입, companyId 자동 주입
  - [x] 1.5 WRITE 메서드: `updateAgent(id, data)` — `and(eq(agents.id, id), eq(agents.companyId, companyId))` WHERE 적용
  - [x] 1.6 WRITE 메서드: `deleteAgent(id)` — `and(eq(agents.id, id), eq(agents.companyId, companyId))` WHERE 적용
  - [x] 1.7 NOTE: `tierConfigs()` READ는 스킵 — tierConfigs 테이블은 Story 8.1에서 생성됨. 추가 시점에 getDB에 추가

- [x] Task 2: 단위 테스트 작성 (AC: #6)
  - [x] 2.1 `packages/server/src/__tests__/unit/scoped-query.test.ts` 생성
  - [x] 2.2 테스트 1: companyId 빈 문자열 시 Error throw 검증
  - [x] 2.3 테스트 2: getDB 반환 객체에 모든 READ/WRITE 메서드 존재 확인
  - [x] 2.4 테스트 3: 다른 companyId → 별개의 스코프 객체 확인

- [x] Task 3: 기존 테넌트 격리 테스트 확장 (AC: #7)
  - [x] 3.1 `packages/server/src/__tests__/tenant-isolation.test.ts`에 getDB import 추가
  - [x] 3.2 getDB 래퍼의 companyId 격리 검증 케이스 추가 (FAKE_COMPANY_ID와 REAL_COMPANY_ID로 독립 스코프 검증)

- [x] Task 4: 빌드 검증
  - [x] 4.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — PASS (0 errors)
  - [x] 4.2 `bun test packages/server/src/__tests__/unit/scoped-query.test.ts` — PASS (3/3)

## Dev Notes

### Architecture Decisions (이 스토리에 해당하는 결정들)

- **D1 (getDB 패턴):** `getDB(companyId)` 패턴 — db 직접 export 금지, 타입 레벨 강제. 컴파일 타임 안전성. lint 규칙 없이 격리 보장.
  - [Source: architecture.md → D1, line 343]
- **E3 (getDB 사용 규칙):** 비즈니스 로직: 반드시 `getDB(ctx.companyId)` 사용. `db` 직접 import 허용: 마이그레이션, 시드, 시스템 쿼리만. UPDATE/DELETE에도 companyId WHERE 자동 적용.
  - [Source: architecture.md → E3, lines 612-639]

### 아키텍처 E3 참조 구현 코드

```typescript
// architecture.md에 정의된 정확한 패턴 (lines 614-632)
export function getDB(companyId: string) {
  if (!companyId) throw new Error('companyId required');
  return {
    // READ
    agents: () => db.select().from(agents).where(eq(agents.companyId, companyId)),
    departments: () => db.select().from(departments).where(eq(departments.companyId, companyId)),
    tierConfigs: () => db.select().from(tierConfigs).where(eq(tierConfigs.companyId, companyId)),

    // WRITE — companyId 자동 주입
    insertAgent: (data: Omit<NewAgent, 'companyId'>) =>
      db.insert(agents).values({ ...data, companyId }),
    updateAgent: (id: string, data: Partial<Agent>) =>
      db.update(agents).set(data).where(and(eq(agents.id, id), eq(agents.companyId, companyId))),
    deleteAgent: (id: string) =>
      db.delete(agents).where(and(eq(agents.id, id), eq(agents.companyId, companyId))),
  };
}
```

### tierConfigs 테이블 부재 처리

- `tierConfigs` 테이블은 아직 schema.ts에 없음 — Story 8.1 (`tier_configs 테이블 + enum→integer 마이그레이션`)에서 생성 예정
- **Phase 1 구현:** `tierConfigs()` READ 메서드는 생략. Story 8.1 구현 시 getDB에 추가
- Architecture에는 tierConfigs()가 있지만, 존재하지 않는 테이블을 참조하면 빌드 에러 → 점진 추가가 올바른 접근

### 기존 코드 현황

**현재 DB 접근 패턴 (수동 companyId 필터링):**
```typescript
// 현재 routes에서 사용하는 패턴 — 매번 수동으로 companyId 추가 (에러 프론)
const [doc] = await db.select()
  .from(knowledgeDocs)
  .where(and(
    eq(knowledgeDocs.id, docId),
    eq(knowledgeDocs.companyId, tenant.companyId),
  ))
```

**기존 tenant-helpers.ts** (`packages/server/src/db/tenant-helpers.ts`):
- `withTenant(column, companyId)` — eq 조건 반환
- `scopedWhere(column, companyId, ...conditions)` — and 조합
- `scopedInsert(companyId, data)` — companyId 주입
- 이 헬퍼들은 유지. getDB는 이보다 상위 레벨 래퍼 (테이블 단위 접근 캡슐화)

**DB 초기화** (`packages/server/src/db/index.ts`):
- `export const db = drizzle(client, { schema })` — 글로벌 인스턴스
- `db`는 scoped-query.ts 내부에서만 import. 비즈니스 로직은 getDB() 사용

### Anti-Patterns (금지 사항)

- ❌ `db.select().from(agents)` 직접 쿼리 — companyId 누락 = 데이터 유출
- ❌ `db.delete(agents).where(eq(agents.id, id))` — 타사 데이터 삭제 가능
- ✅ `getDB(ctx.companyId).deleteAgent(id)` — companyId 자동 적용
- [Source: architecture.md → Anti-Patterns, lines 769-770]

### 기존 코드와 공존 전략

- Phase 1에서는 기존 직접 db 사용 코드를 강제 전환하지 않음
- 신규 engine 코드만 getDB() 사용 필수
- 기존 routes 코드는 점진적으로 전환 (Phase 2+)

### Drizzle ORM 타입 참고

```typescript
// packages/server/src/db/schema.ts에서 export하는 타입들
import { agents, departments, knowledgeDocs } from './schema'
// Drizzle infer types:
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
type Agent = InferSelectModel<typeof agents>
type NewAgent = InferInsertModel<typeof agents>
```

### 스키마 핵심 컬럼

**agents 테이블** (schema.ts line 144-167):
- `id` (uuid, PK), `companyId` (FK → companies), `name`, `tier` (enum, default 'specialist')
- `departmentId` (FK → departments), `allowedTools` (jsonb array)
- `isActive` (boolean), `createdAt`, `updatedAt`

**departments 테이블** (schema.ts line 131-141):
- `id` (uuid, PK), `companyId` (FK → companies), `name`
- `description`, `isActive`, `createdAt`, `updatedAt`

**knowledgeDocs 테이블** (schema.ts line 1519-1537):
- `id` (uuid, PK), `companyId` (FK → companies), `folderId` (FK → knowledgeFolders)
- `title`, `content`, `type` (markdown/text/html/mermaid)
- `isActive`, `createdBy`, `createdAt`, `updatedAt`

### 이전 스토리 학습사항 (Story 1.1)

- pino v10.3.1 Bun 호환 확인됨 (D9)
- Zod 3.25.76 (v4) backwards compatible
- bun:test 프레임워크 사용 (vitest 아님)
- Pre-existing test failures: drizzle-orm@0.39 missing `sum` export, Bun segfault on 87+ test files — Story 1.2 변경과 무관
- 테스트 경로: `packages/server/src/__tests__/unit/` 하위

### 테스트 인프라 참고

- **테스트 헬퍼**: `packages/server/src/__tests__/helpers/test-utils.ts`
- `REAL_COMPANY_ID`, `REAL_CEO_ID`, `REAL_AGENT_ID` — 실제 DB 데이터
- `FAKE_COMPANY_ID`, `FAKE_USER_ID` — 격리 테스트용
- `makeToken(sub, companyId, role, type?)` — JWT 생성
- `api(path, token, options)` — 인증된 API 호출

### Project Structure Notes

- `packages/server/src/db/scoped-query.ts` — 새 파일 (getDB 래퍼)
- `packages/server/src/db/index.ts` — 기존 파일 (db 인스턴스, 수정 없음)
- `packages/server/src/db/tenant-helpers.ts` — 기존 파일 (저수준 헬퍼, 수정 없음)
- `packages/server/src/db/schema.ts` — 기존 파일 (테이블 정의, 수정 없음)
- 파일명 규칙: kebab-case lowercase

### References

- [Source: _bmad-output/planning-artifacts/architecture.md → D1 (line 343), E3 (lines 612-639)]
- [Source: _bmad-output/planning-artifacts/epics.md → Epic 1, Story 1.2 (lines 82-102)]
- [Source: packages/server/src/db/index.ts → db 인스턴스 (line 31)]
- [Source: packages/server/src/db/tenant-helpers.ts → withTenant, scopedWhere, scopedInsert (lines 1-41)]
- [Source: packages/server/src/db/schema.ts → agents (144-167), departments (131-141), knowledgeDocs (1519-1537)]
- [Source: packages/server/src/__tests__/tenant-isolation.test.ts → 기존 격리 테스트 (308 lines)]
- [Source: _bmad-output/implementation-artifacts/1-1-phase1-dependency-verification.md → 이전 스토리 학습]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **scoped-query.ts:** 35 lines. Implements `getDB(companyId)` with 3 READ (agents, departments, knowledgeDocs) + 3 WRITE (insertAgent, updateAgent, deleteAgent) methods. companyId guard throws on empty string. updateAgent uses `Partial<Omit<Agent, 'id' | 'companyId'>>` to prevent overwriting identity fields.
- **tierConfigs omitted:** Table doesn't exist yet (Story 8.1). Architecture pattern followed — add when table exists.
- **Type safety:** `tsc --noEmit` PASS. All Drizzle ORM types correctly inferred from schema.
- **Unit tests:** 3 tests — empty guard, method existence, independent scope objects.
- **Tenant isolation tests:** 2 tests added — empty companyId guard + independent scope per companyId using REAL/FAKE company IDs.
- **Regression:** Story 1.1 tests (9/9) still pass.

### Change Log

- 2026-03-11: Story 1.2 implementation complete — getDB(companyId) multitenancy wrapper, 3 unit tests + 2 tenant isolation tests

### File List

- `packages/server/src/db/scoped-query.ts` — NEW: getDB(companyId) multitenancy wrapper (35 lines)
- `packages/server/src/__tests__/unit/scoped-query.test.ts` — NEW: 3 unit tests for getDB
- `packages/server/src/__tests__/tenant-isolation.test.ts` — MODIFIED: added 2 getDB isolation tests (section 6)
