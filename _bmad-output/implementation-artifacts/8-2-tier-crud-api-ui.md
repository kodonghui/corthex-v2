# Story 8.2: Tier CRUD API + UI

Status: done

## Story

As a 관리자,
I want 회사별 계층 구조를 자유롭게 관리하는 것을,
so that "인턴→사원→대리→팀장→임원" 같은 커스텀 계층을 만들 수 있다.

## Acceptance Criteria

1. REST API: GET/POST/PUT/DELETE `/api/admin/tier-configs` — tenant-scoped CRUD
2. tier_level 순서 자동 관리 — 생성 시 자동 번호 부여, PUT `/api/admin/tier-configs/reorder` 드래그 정렬
3. model_preference 설정: claude-opus-4-6, claude-sonnet-4-6, claude-haiku-4-5
4. max_tools: tier별 사용 가능 도구 수 제한 (0 = 무제한)
5. Admin UI: Tier 관리 페이지 (목록, 생성, 편집, 삭제, 드래그 순서 변경)
6. 에이전트가 사용 중인 tier 삭제 방지 (참조 무결성)
7. 기본 3개 tier(Manager/Specialist/Worker) 보존 — 삭제 시 에이전트 이관 경고

## Tasks / Subtasks

- [x] Task 1: Server — tier-configs admin route (AC: #1, #2, #6)
  - [x]1.1 `packages/server/src/routes/admin/tier-configs.ts` 파일 생성
  - [x]1.2 GET `/tier-configs` — getDB(companyId).tierConfigs() 호출, tierLevel ASC 정렬
  - [x]1.3 POST `/tier-configs` — zValidator body: { name, modelPreference, maxTools, description? }
    - 자동 tierLevel 할당: 기존 최대 tierLevel + 1
  - [x]1.4 PATCH `/tier-configs/:id` — name, modelPreference, maxTools, description 업데이트
  - [x]1.5 DELETE `/tier-configs/:id` — 에이전트 참조 확인 후 삭제 (참조 있으면 400 에러)
  - [x]1.6 PUT `/tier-configs/reorder` — body: `{ order: string[] }` (id 배열 순서대로 tierLevel 재배치)
  - [x]1.7 index.ts에 route 등록: `app.route('/api/admin', tierConfigsRoute)`

- [x] Task 2: Server — 에이전트 참조 확인 로직 (AC: #6, #7)
  - [x]2.1 DELETE 시 해당 tier_level을 사용 중인 agents 수 조회
  - [x]2.2 참조 있으면 `{ success: false, error: { code: 'TIER_IN_USE', message: '이 계층을 사용 중인 에이전트가 N명 있습니다' } }` 반환
  - [x]2.3 scoped-query.ts에 `agentsByTierLevel(level: number)` 추가 (카운트용)

- [x] Task 3: Frontend — tiers 관리 페이지 (AC: #5)
  - [x]3.1 `packages/app/src/pages/tiers.tsx` 생성 — departments.tsx 패턴 따름
  - [x]3.2 테이블: tierLevel | name | modelPreference | maxTools | description | actions
  - [x]3.3 생성 모달: name(필수), modelPreference(select), maxTools(number input), description(textarea)
  - [x]3.4 편집 모달: 기존 데이터 프리필
  - [x]3.5 삭제 확인 다이얼로그: 에이전트 사용 중이면 에러 토스트
  - [x]3.6 드래그 순서 변경 (간단한 up/down 버튼 사용 — 또는 DnD)

- [x] Task 4: Frontend — 라우트 + 사이드바 등록 (AC: #5)
  - [x]4.1 App.tsx에 `/tiers` Route 추가 (lazy import)
  - [x]4.2 sidebar.tsx 운영 섹션에 '계층 관리' 항목 추가: `{ to: '/tiers', label: '계층 관리', icon: '📊' }`

- [x] Task 5: Tests (AC: all)
  - [x]5.1 `packages/server/src/__tests__/unit/tier-crud-api.test.ts` — route 핸들러 테스트
    - GET 목록 조회
    - POST 생성 + 자동 tierLevel
    - PATCH 업데이트
    - DELETE 성공 / 참조 에러
    - PUT reorder
  - [x]5.2 tsc 검사 통과 확인

## Dev Notes

### Architecture Compliance

- **D1 (getDB 패턴)**: 모든 tier_configs DB 접근은 `getDB(companyId)` 통해서만. `scoped-query.ts`에 이미 tierConfigs(), insertTierConfig(), updateTierConfig(), deleteTierConfig() 존재 (Story 8.1에서 생성).
- **API 패턴**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **인증 미들웨어**: `authMiddleware, adminOnly, tenantMiddleware` — departments.ts, agents.ts와 동일 패턴
- **Naming**: route 파일: `tier-configs.ts`, export: `tierConfigsRoute`, 경로: `/tier-configs`

### Existing Code (Story 8.1 완료)

**DB Schema** (`packages/server/src/db/schema.ts`):
```typescript
// tierConfigs table: id(uuid), companyId(uuid FK), tierLevel(int), name(varchar 100),
// modelPreference(varchar 100), maxTools(int), description(text), createdAt, updatedAt
// unique constraint: (companyId, tierLevel)
```

**Scoped Queries** (`packages/server/src/db/scoped-query.ts:93-105`):
```typescript
tierConfigs: () => db.select().from(tierConfigs).where(withTenant(...)).orderBy(tierConfigs.tierLevel),
tierConfigByLevel: (level: number) => ...,
insertTierConfig: (data: Omit<NewTierConfig, 'companyId'>) => ...,
updateTierConfig: (id: string, data: Partial<...>) => ...,
deleteTierConfig: (id: string) => ...,
```

**Shared Types** (`packages/shared/src/types.ts:84-94`):
```typescript
export type TierConfig = {
  id: string; companyId: string; tierLevel: number; name: string;
  modelPreference: string; maxTools: number; description: string | null;
  createdAt: Date; updatedAt: Date;
}
```

### Route Registration Pattern

`packages/server/src/index.ts:129-147` — 모든 admin route를 `app.route('/api/admin', xxxRoute)`로 등록.
새 route도 동일하게 import + 등록.

### Admin Route Pattern (departments.ts 참고)

```typescript
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { authMiddleware, adminOnly } from '../../middleware/auth'
import { tenantMiddleware } from '../../middleware/tenant'
import { HTTPError } from '../../middleware/error'
import type { AppEnv } from '../../types'

export const tierConfigsRoute = new Hono<AppEnv>()
tierConfigsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)
// GET /tier-configs → c.get('tenant').companyId → getDB(companyId).tierConfigs()
```

### Frontend Pattern (departments.tsx 참고)

- `useQuery` + `useMutation` (react-query) — `api.get('/api/admin/tier-configs')`, `api.post(...)` etc.
- UI components from `@corthex/ui`: Modal, ConfirmDialog, Button, Input, Textarea, Skeleton, EmptyState, Badge, toast
- State: `useState` for modals, form data
- Korean labels throughout

### App Router Pattern (App.tsx)

```typescript
const TiersPage = lazy(() => import('./pages/tiers').then((m) => ({ default: m.TiersPage })))
// inside <Route>:
<Route path="tiers" element={<Suspense fallback={<PageSkeleton />}><TiersPage /></Suspense>} />
```

### Sidebar Pattern (sidebar.tsx:34-38)

운영 섹션에 `{ to: '/tiers', label: '계층 관리', icon: '📊' }` 추가. 위치: agents 다음.

### Model Preference Options

- `claude-opus-4-6` (Tier 1 기본 — 최고 성능)
- `claude-sonnet-4-6` (Tier 2 기본 — 균형)
- `claude-haiku-4-5` (Tier 3 기본 — 경제적)

### Reorder Logic

PUT `/tier-configs/reorder` body: `{ order: ['uuid1', 'uuid2', 'uuid3'] }`
- 배열 순서대로 tierLevel = 1, 2, 3, ... 할당
- 트랜잭션으로 처리 (unique constraint 충돌 방지를 위해 임시 값 사용 또는 일괄 업데이트)
- reorder 후 해당 tier_level을 사용하는 agents.tierLevel도 업데이트 필요

### Delete Protection Logic

DELETE 전에 `db.select({ count }).from(agents).where(companyId AND tierLevel = target)` 확인.
- count > 0 → 400 에러 (TIER_IN_USE)
- count === 0 → 삭제 진행

### Anti-Patterns to Avoid

- `db.select().from(tierConfigs)` 직접 쿼리 금지 → `getDB(companyId)` 사용
- 에이전트 참조 확인 없이 tier 삭제 금지
- model-selector.ts 수정 금지 (이 스토리 범위 아님 — Story 8.3)
- engine/ 내부 import 금지 (E8)
- barrel export (index.ts) 만들지 않음

### Project Structure Notes

- `packages/server/src/routes/admin/tier-configs.ts` (new)
- `packages/server/src/index.ts` (modified: import + route 등록)
- `packages/server/src/db/scoped-query.ts` (modified: agentsByTierLevel 추가)
- `packages/app/src/pages/tiers.tsx` (new)
- `packages/app/src/App.tsx` (modified: lazy import + Route)
- `packages/app/src/components/sidebar.tsx` (modified: nav item 추가)
- `packages/server/src/__tests__/unit/tier-crud-api.test.ts` (new)

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Epic 8, Story 8.2]
- [Source: _bmad-output/planning-artifacts/architecture.md — D1, E6, FR24~29]
- [Source: _bmad-output/implementation-artifacts/8-1-tier-configs-enum-to-integer.md — 전체 (선행 스토리)]
- [Source: packages/server/src/routes/admin/departments.ts — admin route 패턴]
- [Source: packages/server/src/routes/admin/agents.ts — agent route 패턴]
- [Source: packages/app/src/pages/departments.tsx — admin UI 패턴]
- [Source: packages/server/src/db/scoped-query.ts:93-105 — 기존 tierConfigs 쿼리]
- [Source: packages/shared/src/types.ts:84-94 — TierConfig 타입]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- All 5 tasks + 19 subtasks completed
- Server: GET/POST/PATCH/DELETE/PUT(reorder) endpoints on `/api/admin/tier-configs`
- Auto tierLevel assignment on create (max existing + 1)
- Delete protection: checks agents.tierLevel reference, returns TIER_IN_USE error
- Reorder: temp offset strategy to avoid unique constraint collision, also updates agents.tierLevel
- Auth: authMiddleware + adminOnly + tenantMiddleware (same pattern as departments/agents)
- Frontend: TiersPage with model select (opus/sonnet/haiku), maxTools input, up/down reorder buttons
- Sidebar: 계층 관리 added under 운영 section after 에이전트 관리
- 18 new tests (tier-crud-api.test.ts) all pass; 22 existing tier-configs tests pass (no regression)
- tsc --noEmit passes cleanly

### File List

- packages/server/src/routes/admin/tier-configs.ts (new: CRUD route)
- packages/server/src/index.ts (modified: import + route registration)
- packages/app/src/pages/tiers.tsx (new: admin tier management page)
- packages/app/src/App.tsx (modified: lazy import + Route)
- packages/app/src/components/sidebar.tsx (modified: 계층 관리 nav item)
- packages/server/src/__tests__/unit/tier-crud-api.test.ts (new: 18 tests)
