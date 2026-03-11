# Story 8.3: 모델 자동 배정 + 비용 최적화

Status: done

## Story

As a 관리자,
I want tier별로 AI 모델이 자동 배정되어 비용이 최적화되는 것을,
so that 상위 tier = 고성능 모델, 하위 tier = 저비용 모델로 자동 매핑된다.

## Acceptance Criteria

1. **model-selector.ts에서 tier_configs 조회 → 모델 매핑 (E6)**: `selectModelFromDB(tierLevel, companyId)` 이미 존재 (Story 8.1). 에이전트 생성/업데이트 시 이를 사용하여 `agents.modelName`에 tier 기반 모델 자동 배정.
2. **에이전트 생성 시 tier에 따라 모델 자동 배정**: `createAgent()` 호출 시 `modelName`이 없거나 빈 문자열이면 → `tierLevel`로 `selectModelFromDB()` 조회하여 해당 tier의 `modelPreference`를 `modelName`으로 설정.
3. **관리자가 개별 에이전트 모델 오버라이드 가능**: `updateAgent()` 호출 시 명시적 `modelName` 전달 → 그대로 저장 (자동 배정 무시). UI에서 "자동(tier 기본값)" vs "수동 지정" 선택 가능.
4. **비용 대시보드: tier별 비용 집계 표시**: 새 API `GET /api/workspace/dashboard/costs/by-tier` — agents 테이블의 `tierLevel` 기준으로 GROUP BY, costRecords JOIN하여 tier별 총비용/호출수 반환.

## Tasks / Subtasks

- [x] Task 1: Server — createAgent 모델 자동 배정 (AC: #1, #2)
  - [x] 1.1 `services/organization.ts` `createAgent()` 수정:
    - `input.modelName`이 없거나 빈 문자열이면 `tierLevel` 결정 (기존: tier enum → tierLevel 매핑 필요)
    - `selectModelFromDB(tierLevel, companyId)` 호출하여 modelName 결정
    - 결정된 modelName으로 INSERT
  - [x] 1.2 `AgentInput` 인터페이스에 `tierLevel?: number` 추가
  - [x] 1.3 createAgent에서 tierLevel 결정 로직:
    - `input.tierLevel`이 있으면 그대로 사용
    - `input.tier` string만 있으면 → tier_configs에서 매칭되는 tierLevel 찾기 (혹은 fallback: manager=1, specialist=2, worker=3)
    - 둘 다 없으면 기본 tierLevel=2 (기존 schema default)

- [x] Task 2: Server — updateAgent 모델 자동 배정 + 오버라이드 (AC: #2, #3)
  - [x] 2.1 `services/organization.ts` `updateAgent()` 수정:
    - `input.tierLevel` 변경 시 + `input.modelName`이 없으면 → 새 tierLevel의 modelPreference로 자동 업데이트
    - `input.modelName` 명시 전달 → 그대로 저장 (오버라이드)
  - [x] 2.2 `AgentUpdateInput` 인터페이스에 `tierLevel?: number` 추가

- [x] Task 3: Server — Admin agents route 스키마 업데이트 (AC: #2, #3)
  - [x] 3.1 `routes/admin/agents.ts` `createAgentSchema`에 `tierLevel: z.number().int().min(1).optional()` 추가
  - [x] 3.2 `routes/admin/agents.ts` `updateAgentSchema`에 `tierLevel: z.number().int().min(1).optional()` 추가

- [x] Task 4: Server — tier별 비용 집계 API (AC: #4)
  - [x] 4.1 `services/cost-aggregation.ts`에 `getByTier(companyId, range)` 함수 추가
  - [x] 4.2 `routes/workspace/dashboard.ts`에 `GET /dashboard/costs/by-tier` 엔드포인트 추가
  - [x] 4.3 `@corthex/shared` types.ts에 `AdminCostByTier` 타입 추가

- [x] Task 5: Tests (AC: all)
  - [x] 5.1 `packages/server/src/__tests__/unit/model-auto-assign.test.ts` — 27 tests
  - [x] 5.2 tsc --noEmit 통과 확인

## Dev Notes

### Architecture Compliance

- **D1 (getDB 패턴)**: 모든 tier_configs DB 접근은 `getDB(companyId)` 통해서만
- **E6 (model-selector)**: `selectModelFromDB(tierLevel, companyId)` 사용 — engine/ 내부 모듈이지만, organization service에서 import 가능 (E8는 "engine/ public API = agent-loop.ts + types.ts"이지만, model-selector는 유틸리티 함수이므로 예외. 실제로 이미 scoped-query.ts를 통해 간접 사용 중)
- **API 패턴**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **인증 미들웨어**: dashboard route는 `authMiddleware + departmentScopeMiddleware`, admin agents route는 `authMiddleware + adminOnly + tenantMiddleware`

### Key Existing Code

**model-selector.ts** (`packages/server/src/engine/model-selector.ts`):
```typescript
// 이미 존재 — Story 8.1에서 생성
export function selectModel(tier: string | number): string { /* hardcoded fallback */ }
export async function selectModelFromDB(tierLevel: number, companyId: string): Promise<string> {
  // tier_configs 조회 → modelPreference 반환
  // fallback: TIER_LEVEL_MODEL_MAP[tierLevel] || 'claude-haiku-4-5'
}
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.3 (lines 1052-1063)]
- [Source: _bmad-output/planning-artifacts/architecture.md — E6 (model-selector), D1 (getDB)]
- [Source: _bmad-output/implementation-artifacts/8-2-tier-crud-api-ui.md — 전체 (선행 스토리)]
- [Source: packages/server/src/engine/model-selector.ts — selectModelFromDB 구현]
- [Source: packages/server/src/services/organization.ts:296-349 — createAgent 현재 구현]
- [Source: packages/server/src/services/cost-aggregation.ts — 기존 비용 집계 패턴]
- [Source: packages/server/src/routes/workspace/dashboard.ts — 기존 비용 엔드포인트]
- [Source: packages/server/src/routes/admin/agents.ts:21-48 — 현재 zod 스키마]
- [Source: packages/shared/src/types.ts — AdminCostByModel/Agent/Department 타입 패턴]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 5 tasks + 14 subtasks completed
- Task 1: createAgent now auto-assigns modelName via selectModelFromDB(tierLevel, companyId) when modelName not explicitly provided. TIER_STRING_TO_LEVEL fallback: manager=1, specialist=2, worker=3. Default tierLevel=2.
- Task 2: updateAgent auto-assigns model when tierLevel changes and modelName not explicitly provided. Explicit modelName = override (preserved as-is).
- Task 3: createAgentSchema and updateAgentSchema both include `tierLevel: z.number().int().min(1).optional()`
- Task 4: `getByTier()` in cost-aggregation.ts — JOINs cost_records ↔ agents ↔ tier_configs, GROUP BY tierLevel. Dashboard endpoint `/dashboard/costs/by-tier` added. `AdminCostByTier` type in shared/types.ts.
- Task 5: 27 new tests in model-auto-assign.test.ts — all pass. 137 total tier+model tests pass with 0 regressions.
- tsc --noEmit clean

### File List

- packages/server/src/services/organization.ts (modified: import selectModelFromDB, AgentInput+AgentUpdateInput tierLevel field, createAgent auto-assign, updateAgent auto-assign)
- packages/server/src/routes/admin/agents.ts (modified: createAgentSchema + updateAgentSchema tierLevel field)
- packages/server/src/services/cost-aggregation.ts (modified: import tierConfigs/asc/AdminCostByTier, getByTier function)
- packages/server/src/routes/workspace/dashboard.ts (modified: GET /dashboard/costs/by-tier endpoint)
- packages/shared/src/types.ts (modified: AdminCostByTier type)
- packages/server/src/__tests__/unit/model-auto-assign.test.ts (new: 27 tests)
