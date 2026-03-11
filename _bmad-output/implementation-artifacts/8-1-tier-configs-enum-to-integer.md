# Story 8.1: tier_configs 테이블 + enum→integer 마이그레이션

Status: done

## Story

As a 시스템,
I want 에이전트 tier가 enum이 아닌 integer(1~N)로 관리되는 것을,
so that 회사별로 자유롭게 계층을 추가할 수 있다.

## Acceptance Criteria

1. tier_configs 테이블 생성: id(uuid), company_id(uuid FK), tier_level(integer), name(varchar 100), model_preference(varchar 100), max_tools(integer), description(text)
2. 기존 agents.tier enum('manager'|'specialist'|'worker') → agents.tier_level integer 마이그레이션
3. 마이그레이션 매핑: Manager=1, Specialist=2, Worker=3
4. 무중단 마이그레이션 (NFR-DI): 양방향 호환 — 새 tier_level 컬럼 추가 후 데이터 복사, 구 tier 컬럼은 삭제하지 않고 deprecated 처리 (Story 8.2 이후 제거)
5. getDB(companyId).tierConfigs() 스코프 쿼리 추가
6. model-selector.ts에서 tier_level integer → model 매핑 지원 (하위 호환 유지)
7. shared/types.ts의 AgentTier 타입 + Agent.tier 필드 업데이트

## Tasks / Subtasks

- [x] Task 1: tier_configs 테이블 스키마 (AC: #1)
  - [x] 1.1 schema.ts에 tierConfigs pgTable 정의
  - [x] 1.2 unique constraint: (company_id, tier_level) 유니크
  - [x] 1.3 company_id FK → companies.id
  - [x] 1.4 relations 정의 (companies ↔ tierConfigs)
- [x] Task 2: agents.tier_level 컬럼 추가 (AC: #2, #3)
  - [x] 2.1 agents 테이블에 tier_level integer 컬럼 추가 (nullable initially)
  - [x] 2.2 기존 tier enum 값 → tier_level integer 데이터 매핑 (manager→1, specialist→2, worker→3)
  - [x] 2.3 tier_level NOT NULL + default 2 (specialist) 설정
- [x] Task 3: SQL 마이그레이션 파일 (AC: #4)
  - [x] 3.1 `0048_tier-configs-table.sql` 작성
  - [x] 3.2 tier_configs 테이블 CREATE
  - [x] 3.3 agents.tier_level 컬럼 ADD + UPDATE + ALTER NOT NULL
  - [x] 3.4 기존 회사별 기본 3단계 tier_configs 시드 INSERT (SELECT DISTINCT company_id)
- [x] Task 4: getDB() 스코프 쿼리 (AC: #5)
  - [x] 4.1 scoped-query.ts에 tierConfigs() 읽기 쿼리 추가
  - [x] 4.2 tierConfigByLevel(level: number) 단건 조회 추가
  - [x] 4.3 insertTierConfig, updateTierConfig, deleteTierConfig CRUD 추가
- [x] Task 5: model-selector.ts 업데이트 (AC: #6)
  - [x] 5.1 selectModel(tier) → selectModel(tierLevel | string) 시그니처 확장
  - [x] 5.2 string tier 입력도 하위 호환 유지 (fallback to hardcoded map)
  - [x] 5.3 DB tier_configs 조회 경로 추가 (async selectModelFromDB)
- [x] Task 6: shared/types.ts 업데이트 (AC: #7)
  - [x] 6.1 Agent 타입에 tierLevel: number 추가
  - [x] 6.2 TierConfig 타입 정의 추가
  - [x] 6.3 기존 tier: AgentTier 필드는 유지 (하위 호환)
- [x] Task 7: 프론트엔드 호환 (AC: #4 무중단)
  - [x] 7.1 API 응답에 tier (string) + tierLevel (number) 모두 포함 — Drizzle schema가 양 컬럼 반환
  - [x] 7.2 기존 프론트 코드가 tier string 사용 → 변경 불필요 확인

## Dev Notes

### Architecture Compliance

- **D1 (getDB 패턴)**: 모든 tier_configs 접근은 `getDB(companyId).tierConfigs()` 통해서만. 직접 `db.select().from(tierConfigs)` 금지.
- **E6 (model-selector)**: `engine/model-selector.ts`는 engine 내부 전용. tier_configs → model 매핑. Phase 1~4 Claude 전용, 라우팅 로직 추가 금지 (llm-router.ts 동결).
- **E8 (engine 공개 API)**: engine/ 공개 API는 `agent-loop.ts` + `types.ts`만. model-selector는 내부 전용 — 외부 import 금지.
- **Naming**: DB 테이블 snake_case 복수형 (`tier_configs`), 컬럼 snake_case (`tier_level`, `model_preference`, `max_tools`), JS enum camelCase.

### Current Schema State

**agents 테이블** (`packages/server/src/db/schema.ts:144`):
```typescript
tier: agentTierEnum('tier').notNull().default('specialist'),
```
- `agentTierEnum = pgEnum('agent_tier', ['manager', 'specialist', 'worker'])` (line 19)
- SQL 타입: `CREATE TYPE "public"."agent_tier" AS ENUM(...)` (migration 0037)

**현재 tier 사용처 (변경 영향 분석):**
- `packages/server/src/engine/model-selector.ts` — `selectModel(tier: string)` → tier string 매핑
- `packages/server/src/engine/hooks/cost-tracker.ts` — Phase 3+ DB 조회 예정 코멘트
- `packages/shared/src/types.ts:64` — `AgentTier = 'manager' | 'specialist' | 'worker'`
- `packages/shared/src/types.ts:73` — `tier: AgentTier` (Agent 타입)
- `packages/app/src/pages/agents.tsx` — tier enum으로 UI select, badge 렌더링
- `packages/app/src/pages/org.tsx` — TIER_ORDER, TIER_CONFIG로 정렬/색상
- `packages/app/src/pages/onboarding.tsx` — TIER_LABELS 매핑
- `packages/admin/src/lib/elk-layout.ts` — tier 기반 노드 스타일링
- 테스트 파일 다수 — `tier: 'manager'` 등 하드코딩

### Migration Strategy (무중단)

**Step 1 — Additive only (이 스토리)**:
1. tier_configs 테이블 CREATE
2. agents에 `tier_level` integer 컬럼 ADD (nullable)
3. 기존 tier enum → tier_level 데이터 복사: `UPDATE agents SET tier_level = CASE tier WHEN 'manager' THEN 1 WHEN 'specialist' THEN 2 WHEN 'worker' THEN 3 END`
4. `ALTER COLUMN tier_level SET NOT NULL, SET DEFAULT 2`
5. 각 company_id에 기본 3단계 tier_configs 시드

**Step 2 — 구 컬럼 제거 (Story 8.2+ 이후)**:
- agents.tier enum 컬럼 DROP
- agentTierEnum DROP TYPE
- 이 스토리에서는 하지 않음!

### Existing Patterns to Follow

**migration 파일 패턴** (`packages/server/src/db/migrations/`):
- 파일명: `0048_tier-configs-table.sql` (다음 번호 = 0048)
- 구분자: `--> statement-breakpoint` 각 SQL 문 뒤
- 수동 SQL (Drizzle generate 아님, 직접 작성)

**scoped-query.ts 패턴** (`packages/server/src/db/scoped-query.ts`):
```typescript
// READ 예시
tierConfigs: () =>
  db.select().from(tierConfigs).where(withTenant(tierConfigs.companyId, companyId)),
// WRITE 예시
insertTierConfig: (data: Omit<NewTierConfig, 'companyId'>) =>
  db.insert(tierConfigs).values(scopedInsert(companyId, data)).returning(),
```

**tenant-helpers.ts**: `withTenant`, `scopedWhere`, `scopedInsert` 사용.

### v1 Reference

- v1: `agents.yaml`에 `model_name` 고정 → 3계급(Manager/Specialist/Worker) 하드코딩
- v2: tier_configs 테이블 기반 N계급 동적 → 회사별 "인턴→사원→대리→팀장→임원" 같은 커스텀 계층 지원
- v1 코드 위치: `/home/ubuntu/CORTHEX_HQ/`

### Project Structure Notes

- `packages/server/src/db/schema.ts` — tierConfigs 테이블 + agents.tierLevel 추가
- `packages/server/src/db/scoped-query.ts` — tierConfigs 스코프 쿼리
- `packages/server/src/db/migrations/0048_tier-configs-table.sql` — SQL 마이그레이션
- `packages/server/src/engine/model-selector.ts` — tier_level 지원 확장
- `packages/shared/src/types.ts` — TierConfig 타입 + Agent.tierLevel 필드
- 테스트: `packages/server/src/__tests__/unit/tier-configs.test.ts`

### Testing Standards

- 프레임워크: bun:test
- 위치: `packages/server/src/__tests__/unit/`
- SDK 모킹: `packages/server/src/__tests__/helpers/` 헬퍼 활용
- 필수 테스트:
  - tier_configs 스키마 타입 검증
  - getDB().tierConfigs() 스코프 격리
  - model-selector tier_level→model 매핑
  - migration 매핑 로직 (manager→1, specialist→2, worker→3)

### Anti-Patterns to Avoid

- `db.select().from(tierConfigs)` 직접 쿼리 금지 → `getDB(companyId).tierConfigs()` 사용
- agentTierEnum 삭제 금지 (이 스토리에서는 유지)
- model-selector에 라우팅 로직 추가 금지 (llm-router.ts 동결)
- engine/ 외부에서 model-selector import 금지 (E8)
- barrel export (index.ts) 만들지 않음

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — D1, E6, E8, 데이터 아키텍처]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.1~8.4]
- [Source: packages/server/src/db/schema.ts — agents 테이블, agentTierEnum]
- [Source: packages/server/src/db/scoped-query.ts — getDB 패턴]
- [Source: packages/server/src/engine/model-selector.ts — 현재 tier→model 매핑]
- [Source: packages/shared/src/types.ts — AgentTier, Agent 타입]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 7 tasks + 17 subtasks completed
- tier_configs pgTable: uuid pk, company_id FK, tier_level int, name, model_preference, max_tools, description, timestamps
- unique constraint (company_id, tier_level) prevents duplicate tier levels per company
- agents.tierLevel integer column added with default=2, tier enum kept for backward compat
- Migration 0048: additive-only — CREATE tier_configs, ADD tier_level, UPDATE mapping, seed 3 default tiers per company
- getDB().tierConfigs(), tierConfigByLevel(), insertTierConfig, updateTierConfig, deleteTierConfig added
- selectModel() now accepts string|number; selectModelFromDB() async DB lookup added
- shared/types.ts: Agent.tierLevel + TierConfig type exported
- 22 new tests (tier-configs.test.ts) all pass; 8 existing model-selector tests pass (no regression)
- tsc --noEmit passes for server, shared, app packages

### File List

- packages/server/src/db/schema.ts (modified: added tierConfigs table, agents.tierLevel, tierConfigsRelations)
- packages/server/src/db/scoped-query.ts (modified: added tierConfigs CRUD queries)
- packages/server/src/db/migrations/0048_tier-configs-table.sql (new: migration)
- packages/server/src/engine/model-selector.ts (modified: integer support, selectModelFromDB)
- packages/shared/src/types.ts (modified: Agent.tierLevel, TierConfig type)
- packages/server/src/__tests__/unit/tier-configs.test.ts (new: 22 tests)
