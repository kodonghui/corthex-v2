# Story 8.4: maxDepth 회사별 설정

Status: done

## Story

As a 관리자,
I want 핸드오프 최대 깊이를 회사별로 설정하는 것을,
so that 복잡한 조직은 깊이를 늘리고, 단순 조직은 줄일 수 있다.

## Acceptance Criteria

1. **companies.settings JSONB에 maxHandoffDepth 저장**: `companies.settings.maxHandoffDepth` (integer, 1~10, 기본 5). 새 테이블 불필요 — 기존 `companies.settings` JSONB 패턴 활용.
2. **SessionContext.maxDepth = 회사 설정값**: `hub.ts`에서 SessionContext 생성 시 DB에서 회사의 `maxHandoffDepth` 조회하여 `ctx.maxDepth`에 반영. 조회 실패 시 기본값 5.
3. **Admin API: GET/PUT 핸드오프 깊이 설정**: `GET /api/admin/company-settings/handoff-depth` → 현재값 반환. `PUT /api/admin/company-settings/handoff-depth` → `{ maxHandoffDepth: number }` 저장. 기존 `prompt-guard-settings.ts` 패턴 따라 JSONB merge.
4. **Admin UI: 핸드오프 깊이 설정 슬라이더 (1~10)**: Settings 페이지에 "핸드오프 깊이" 섹션 추가. range slider + 숫자 표시 + 저장 버튼. 현재값 로드 + 변경 시 PUT 호출.
5. **깊이 변경 시 진행 중 세션에는 영향 없음**: SessionContext는 세션 시작 시 스냅샷이므로 이미 보장됨 (readonly). 별도 구현 불필요 — 확인만.
6. **다른 caller(argos, agora)도 회사 설정 반영**: `argos-evaluator.ts`의 `maxDepth: 3` → 회사 설정 조회로 변경. `agora-engine.ts`의 `maxDepth: 1`은 토론용이므로 유지 (handoff 없음).

## Tasks / Subtasks

- [x] Task 1: Server — maxHandoffDepth 서비스 함수 (AC: #1, #3)
  - [x] 1.1 `packages/server/src/services/handoff-depth-settings.ts` 신규 생성
    - `getMaxHandoffDepth(companyId: string): Promise<number>` — companies.settings.maxHandoffDepth 조회, 기본 5
    - `saveMaxHandoffDepth(companyId: string, depth: number): Promise<number>` — JSONB merge 저장
    - 패턴: `prompt-guard-settings.ts` 완전 동일 (select settings → parse → merge → update)
  - [x] 1.2 유효성 검증: depth는 integer, 1 ≤ depth ≤ 10

- [x] Task 2: Server — Admin API 엔드포인트 (AC: #3)
  - [x] 2.1 `packages/server/src/routes/admin/company-settings.ts` 신규 생성 (또는 기존 라우트에 추가)
    - `GET /api/admin/company-settings/handoff-depth` → `{ success: true, data: { maxHandoffDepth: number } }`
    - `PUT /api/admin/company-settings/handoff-depth` → body `{ maxHandoffDepth: z.number().int().min(1).max(10) }` → 저장 → 반환
    - 미들웨어: `authMiddleware, adminOnly, tenantMiddleware`
  - [x] 2.2 `routes/admin/index.ts`에 라우트 등록 (index.ts에서 직접 import+route)

- [x] Task 3: Server — hub.ts에서 회사 설정 적용 (AC: #2)
  - [x] 3.1 `packages/server/src/routes/workspace/hub.ts` 수정
    - import `getMaxHandoffDepth` from handoff-depth-settings
    - SessionContext 생성 시 `maxDepth: 3` → `maxDepth: await getMaxHandoffDepth(companyId)`
    - DB 조회 실패 시 fallback 5 (서비스 함수 내부에서 처리됨)

- [x] Task 4: Server — argos-evaluator 회사 설정 반영 (AC: #6)
  - [x] 4.1 `packages/server/src/services/argos-evaluator.ts` 수정
    - import `getMaxHandoffDepth`
    - `maxDepth: 3` → `maxDepth: await getMaxHandoffDepth(companyId)` (companyId는 이미 함수 파라미터에 있음)
  - [x] 4.2 `agora-engine.ts`의 `maxDepth: 1`은 변경하지 않음 (토론 전용, 핸드오프 없음) — 테스트로 확인 완료

- [x] Task 5: Shared — 타입 추가 (AC: #3, #4)
  - [x] 5.1 `packages/shared/src/types.ts`에 `HandoffDepthSettings` 타입 추가

- [x] Task 6: Admin UI — 설정 페이지에 핸드오프 깊이 섹션 추가 (AC: #4)
  - [x] 6.1 `packages/admin/src/pages/settings.tsx`에 핸드오프 깊이 섹션 추가
    - useQuery: `GET /api/admin/company-settings/handoff-depth`
    - range input (1~10) + 현재값 숫자 표시 + accent-indigo-600 슬라이더
    - 저장 버튼 → useMutation: `PUT /api/admin/company-settings/handoff-depth`
    - 성공 시 toast "핸드오프 깊이가 N으로 변경되었습니다"
    - 설명 텍스트 포함, data-testid="settings-handoff-depth"

- [x] Task 7: Tests (AC: all)
  - [x] 7.1 `packages/server/src/__tests__/unit/handoff-depth-settings.test.ts` — 30 단위 테스트
    - getMaxHandoffDepth: 설정 있을 때 / 없을 때(기본 5) / DB 에러 시 fallback / 범위 외 / 비정수
    - saveMaxHandoffDepth: 정상 저장 / JSONB merge 확인 / 범위 외 값 거부 / 기존 설정 덮어쓰기
    - SessionContext 통합 / API route 모듈 로드 / agora-engine maxDepth:1 유지 확인
  - [x] 7.2 tsc --noEmit 통과 확인

## Dev Notes

### Architecture Compliance

- **D1 (getDB 패턴)**: companies.settings 접근은 `db.select().from(companies).where(eq(companies.id, companyId))` — getDB 스코프 쿼리 대신 직접 접근 (prompt-guard-settings.ts 패턴과 동일, companies는 company_id 스코프가 아닌 id 기준)
- **E1 (SessionContext)**: `maxDepth` 필드는 이미 존재. 값만 DB에서 동적으로 설정
- **API 패턴**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **인증**: admin routes → `authMiddleware + adminOnly + tenantMiddleware`

### Key Existing Code

**prompt-guard-settings.ts** (패턴 복사 대상):
```typescript
// packages/server/src/services/prompt-guard-settings.ts
// companies.settings JSONB에서 sub-key 조회/저장 패턴
// getPromptGuardSettings(companyId) → select settings → parse → fallback
// savePromptGuardSettings(companyId, update) → select → merge → update
```

**hub.ts** (maxDepth 변경 위치):
```typescript
// packages/server/src/routes/workspace/hub.ts:91-100
const ctx: SessionContext = {
  // ...
  maxDepth: 3,  // ← 여기를 await getMaxHandoffDepth(companyId)로 변경
}
```

**argos-evaluator.ts** (maxDepth 변경 위치):
```typescript
// packages/server/src/services/argos-evaluator.ts:389
maxDepth: 3,  // ← 여기를 await getMaxHandoffDepth(companyId)로 변경
```

**agora-engine.ts** (변경 안 함):
```typescript
// packages/server/src/services/agora-engine.ts:194, 311
maxDepth: 1,  // 토론 전용 — 핸드오프 없으므로 변경 불필요
```

**call-agent.ts** (변경 안 함):
```typescript
// packages/server/src/tool-handlers/builtins/call-agent.ts:20
if (ctx.depth >= ctx.maxDepth) { /* HANDOFF_DEPTH_EXCEEDED 에러 */ }
// 이미 ctx.maxDepth를 참조하므로 변경 불필요 — hub에서 동적으로 설정하면 자동 반영
```

**companies 테이블 schema**:
```typescript
// packages/server/src/db/schema.ts:41-50
export const companies = pgTable('companies', {
  settings: jsonb('settings').$type<Record<string, unknown>>(),
  // maxHandoffDepth는 여기 settings JSONB 안에 저장
})
```

**settings.tsx** (Admin UI 수정 위치):
```
// packages/admin/src/pages/settings.tsx
// 기존: 회사 정보 + API 키 관리
// 추가: 핸드오프 깊이 설정 섹션
```

### Project Structure Notes

- 새 파일: `services/handoff-depth-settings.ts`, `routes/admin/company-settings.ts`
- 수정 파일: `hub.ts`, `argos-evaluator.ts`, `settings.tsx`, `shared/types.ts`, `routes/admin/index.ts`
- 새 테스트: `__tests__/unit/handoff-depth-settings.test.ts`
- DB 마이그레이션 불필요 (JSONB 기존 컬럼 활용)

### Previous Story Intelligence (8.3)

- **패턴**: model-selector 서비스에서 tierConfigs DB 조회 → 에이전트에 반영하는 패턴 성공
- **import 주의**: engine/ 내부 모듈 import는 E8 원칙상 제한적. handoff-depth는 services/ 레벨이므로 문제 없음
- **테스트 패턴**: bun:test, mock DB 함수, 27+ 테스트로 충분한 커버리지
- **tsc 깨끗하게 유지**: 모든 타입 체크 통과 필수

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.4 (lines 1067-1079)]
- [Source: _bmad-output/planning-artifacts/architecture.md — ORC-1 (maxDepth 회사별 configurable, 기본 5)]
- [Source: packages/server/src/engine/types.ts — SessionContext.maxDepth]
- [Source: packages/server/src/routes/workspace/hub.ts:98 — maxDepth: 3 하드코딩]
- [Source: packages/server/src/services/argos-evaluator.ts:389 — maxDepth: 3 하드코딩]
- [Source: packages/server/src/services/agora-engine.ts:194,311 — maxDepth: 1 (변경 안 함)]
- [Source: packages/server/src/services/prompt-guard-settings.ts — companies.settings JSONB 패턴]
- [Source: packages/server/src/routes/admin/tier-configs.ts — admin route 미들웨어 패턴]
- [Source: _bmad-output/implementation-artifacts/8-3-model-auto-assign-cost-optimization.md — 선행 스토리]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 7 tasks + 13 subtasks completed
- Task 1: `handoff-depth-settings.ts` service — getMaxHandoffDepth (default 5, range 1-10, DB error fallback) + saveMaxHandoffDepth (JSONB merge, validation)
- Task 2: `company-settings.ts` admin route — GET/PUT /api/admin/company-settings/handoff-depth with zod validation (int, min 1, max 10)
- Task 3: hub.ts `maxDepth: 3` → `await getMaxHandoffDepth(companyId)` — dynamic per-company setting
- Task 4: argos-evaluator.ts `maxDepth: 3` → `await getMaxHandoffDepth(trigger.companyId)` — dynamic per-company setting. agora-engine.ts `maxDepth: 1` unchanged (debate-only, no handoff)
- Task 5: `HandoffDepthSettings` interface added to shared/types.ts
- Task 6: HandoffDepthSection component in settings.tsx — range slider (1~10), current value display, save/cancel, toast notification
- Task 7: 30 unit tests in handoff-depth-settings.test.ts — all pass. tsc --noEmit clean.
- Hub-route test failures (20) are pre-existing (presetsByUser mock missing) — unrelated to this story.

### File List

- packages/server/src/services/handoff-depth-settings.ts (new)
- packages/server/src/routes/admin/company-settings.ts (new)
- packages/server/src/__tests__/unit/handoff-depth-settings.test.ts (new: 30 unit tests)
- packages/server/src/__tests__/unit/handoff-depth-tea.test.ts (new: 27 TEA risk-based tests)
- packages/server/src/index.ts (modified: import + route registration for companySettingsRoute)
- packages/server/src/routes/workspace/hub.ts (modified: import getMaxHandoffDepth, maxDepth dynamic)
- packages/server/src/services/argos-evaluator.ts (modified: import getMaxHandoffDepth, maxDepth dynamic)
- packages/shared/src/types.ts (modified: HandoffDepthSettings interface)
- packages/admin/src/pages/settings.tsx (modified: HandoffDepthSection component + render)
