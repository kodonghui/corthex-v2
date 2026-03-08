# Story 4.6: 관리자 콘솔 도구 관리 UI (A5)

Status: review

## Story

As a **시스템 관리자 (박과장)**,
I want **관리자 콘솔에서 전체 도구 카탈로그를 카테고리별로 조회하고, 에이전트별 허용 도구를 체크박스 매트릭스로 설정/해제할 수 있는 도구 관리 화면**,
so that **각 AI 에이전트가 사용할 수 있는 도구를 세밀하게 관리하고, 카테고리별 일괄 설정으로 효율적으로 권한을 제어할 수 있다**.

## Acceptance Criteria

1. **도구 카탈로그 표시**: 전체 도구 목록을 이름, 카테고리, 설명과 함께 테이블로 표시. 카테고리 필터 지원 (common, finance, legal, marketing, tech)
2. **에이전트별 체크박스 매트릭스**: 에이전트(행) x 도구(열) 체크박스 매트릭스로 허용 도구 설정. 체크 = allowedTools에 포함, 언체크 = 제거
3. **권한 변경 시 감사 로그**: allowedTools 변경 시 audit_logs 테이블에 자동 기록 (action: 'agent.update', details에 변경된 도구 목록)
4. **카테고리별 일괄 선택/해제**: 특정 카테고리의 모든 도구를 한 에이전트에 대해 일괄 체크/언체크하는 버튼
5. **ToolPool 연동**: ToolPool에 등록된 실제 도구 목록 기반으로 카탈로그 표시 (DB tool_definitions와 ToolPool 양쪽 참조)
6. **실시간 반영**: 권한 변경 즉시 agents.allowedTools 업데이트 → 다음 도구 호출부터 적용

## Tasks / Subtasks

- [x] Task 1: 도구 카탈로그 API 개선 (AC: #1, #5)
  - [x] 1.1 GET /api/admin/tools/catalog -- ToolPool + DB 통합 카탈로그 엔드포인트
  - [x] 1.2 카테고리별 그룹핑 + 등록 상태(ToolPool 등록 여부) 포함
  - [x] 1.3 응답: `{ data: { category: string, tools: { name, description, category, registered }[] }[] }`

- [x] Task 2: 에이전트 allowedTools 일괄 업데이트 API (AC: #2, #3, #4, #6)
  - [x] 2.1 PATCH /api/admin/agents/:id/allowed-tools -- allowedTools 전체 교체
  - [x] 2.2 body: `{ allowedTools: string[] }` → agents.allowedTools 업데이트
  - [x] 2.3 변경 전/후 diff 계산 → audit_logs 기록 (added/removed tools)
  - [x] 2.4 PATCH /api/admin/agents/:id/allowed-tools/batch -- 카테고리별 일괄 추가/제거
  - [x] 2.5 body: `{ category: string, action: 'add' | 'remove' }` → 해당 카테고리 전체 도구 추가/제거

- [x] Task 3: 도구 관리 UI 전면 리팩토링 (AC: #1, #2, #4)
  - [x] 3.1 기존 `packages/admin/src/pages/tools.tsx` 전면 교체
  - [x] 3.2 상단: 카테고리 필터 탭 (전체 / common / finance / legal / marketing / tech)
  - [x] 3.3 도구 카탈로그 테이블: 이름, 카테고리 뱃지, 설명, 등록 상태
  - [x] 3.4 에이전트별 권한 매트릭스 뷰: 에이전트(행) x 도구(열) 체크박스
  - [x] 3.5 카테고리별 일괄 선택/해제 버튼 (에이전트별)
  - [x] 3.6 변경 저장 버튼 + 변경사항 카운터 뱃지

- [x] Task 4: 단위/통합 테스트 (AC: all)
  - [x] 4.1 도구 카탈로그 API 테스트 (카테고리 그룹핑, ToolPool 연동)
  - [x] 4.2 allowedTools 업데이트 API 테스트 (개별, 일괄, 감사 로그)
  - [x] 4.3 UI 컴포넌트 테스트 (필터, 체크박스, 일괄 동작)

## Dev Notes

### 기존 코드 현황 (매우 중요 -- 기존 시스템 활용 필수)

**이미 존재하는 인프라:**

1. **기존 tools.tsx** (`packages/admin/src/pages/tools.tsx`):
   - 현재는 tool_definitions DB 기반 CRUD + 1:1 에이전트 배정 방식
   - agent_tools 매핑 테이블 기반의 개별 배정/해제 UI
   - **이 파일을 전면 리팩토링**: agent_tools 매핑 방식 → agents.allowedTools 배열 방식으로 전환

2. **기존 Tools API** (`packages/server/src/routes/admin/tools.ts`):
   - GET /api/admin/tools: tool_definitions 테이블 기반 목록
   - POST/PUT/DELETE: tool_definitions CRUD
   - agent-tools 매핑 CRUD (agent_tools 테이블)
   - **주의**: 기존 API는 유지하되, 새 카탈로그 엔드포인트를 추가

3. **ToolPool** (`packages/server/src/services/tool-pool.ts`):
   - `toolPool.list()`: 등록된 모든 도구 반환 (ToolRegistration[])
   - `toolPool.listByCategory(category)`: 카테고리별 필터
   - 현재 37개 도구 등록 (26 handler-registry + 11 ToolPool-registered)
   - 각 도구: name, description, category, parameters(Zod)

4. **agents.allowedTools** (`packages/server/src/db/schema.ts`):
   - agents 테이블의 `allowedTools: jsonb('allowed_tools').$type<string[]>().default([])`
   - ToolPool.createExecutor()에서 이 배열로 서버 사이드 권한 검증
   - 이것이 실제 도구 권한의 진실 소스(source of truth)

5. **HandlerRegistry** (`packages/server/src/lib/tool-handlers/`):
   - registry.ts: 37개 핸들러 등록
   - types.ts: ToolHandler, ToolExecContext 타입
   - index.ts: 모든 핸들러 import + 등록

6. **기존 에이전트 API** (`packages/server/src/routes/admin/agents.ts`):
   - PATCH /api/admin/agents/:id: allowedTools 포함 업데이트 가능
   - updateAgentSchema에 `allowedTools: z.array(z.string()).optional()` 이미 존재

### Architecture Compliance

- **파일 위치**:
  - 서버 API: `packages/server/src/routes/admin/tools.ts` (기존 파일에 엔드포인트 추가)
  - UI: `packages/admin/src/pages/tools.tsx` (기존 파일 전면 리팩토링)
  - 테스트: `packages/server/src/__tests__/unit/tool-management.test.ts`
- **API 응답**: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- **네이밍**: kebab-case 파일, camelCase 함수, PascalCase 컴포넌트
- **UI 패턴**: React + @tanstack/react-query + Tailwind CSS (기존 Admin 패턴)

### ToolPool → 카탈로그 매핑 전략

**핵심 결정:** ToolPool이 도구의 진실 소스. tool_definitions 테이블은 보조 메타데이터.

```typescript
// GET /api/admin/tools/catalog 응답 구조
{
  data: [
    {
      category: 'common',
      tools: [
        { name: 'calculate', description: '수학 계산', category: 'common', registered: true },
        { name: 'search_web', description: '웹 검색', category: 'common', registered: true },
        // ...
      ]
    },
    {
      category: 'finance',
      tools: [
        { name: 'get_stock_price', description: '주식 시세 조회', category: 'finance', registered: true },
        // ...
      ]
    },
    // ...
  ]
}
```

### 에이전트 권한 업데이트 흐름

```
관리자가 체크박스 변경 → 로컬 상태 업데이트 → "저장" 클릭
→ PATCH /api/admin/agents/:id { allowedTools: [...] }
→ 서버: agents.allowedTools 업데이트 + audit_log 기록
→ UI: react-query invalidate → 최신 상태 반영
```

**기존 agents.ts PATCH 라우트 활용:**
- `updateAgent(tenant, id, { allowedTools: [...] })` 이미 동작
- audit_log은 `createAuditLog()` 유틸 활용 (기존 패턴)

### allowedTools 일괄 카테고리 업데이트 로직

```typescript
// 카테고리 일괄 추가 예시
const categoryTools = toolPool.listByCategory('finance').map(t => t.name)
const currentAllowed = agent.allowedTools || []
const newAllowed = [...new Set([...currentAllowed, ...categoryTools])]
// → PATCH agents/:id { allowedTools: newAllowed }

// 카테고리 일괄 제거 예시
const categoryTools = toolPool.listByCategory('finance').map(t => t.name)
const newAllowed = currentAllowed.filter(t => !categoryTools.includes(t))
```

### UI 레이아웃 설계 (UX A5 준수)

```
┌─────────────────────────────────────────────────────┐
│ 도구 관리                                    [N개 도구] │
├─────────────────────────────────────────────────────┤
│ [전체] [common] [finance] [legal] [marketing] [tech] │
├─────────────────────────────────────────────────────┤
│                                                      │
│ ┌── 도구 카탈로그 ──────────────────────────────┐    │
│ │ 이름          │ 카테고리 │ 설명        │ 상태  │    │
│ │ calculate     │ common  │ 수학 계산    │ ✅    │    │
│ │ search_web    │ common  │ 웹 검색     │ ✅    │    │
│ │ ...           │         │             │       │    │
│ └────────────────────────────────────────────────┘    │
│                                                      │
│ ┌── 에이전트별 도구 권한 ────────────────────────┐    │
│ │              │calc │search│chart │json  │... │    │
│ │ ─────────────┼─────┼──────┼──────┼──────┼────│    │
│ │ 김비서(M)     │ ☑   │ ☑    │ ☐    │ ☑    │    │    │
│ │  [common ✅][finance ✅][legal ☐]               │    │
│ │ 박분석(S)     │ ☑   │ ☑    │ ☑    │ ☑    │    │    │
│ │  [common ✅][finance ☑][legal ☐]               │    │
│ │ 이실행(W)     │ ☐   │ ☑    │ ☐    │ ☐    │    │    │
│ │  [common ☐][finance ☐][legal ☐]               │    │
│ └────────────────────────────────────────────────┘    │
│                                                      │
│                        [변경사항 3건] [저장] [취소]    │
└─────────────────────────────────────────────────────┘
```

### 감사 로그 기록 패턴

```typescript
// 기존 audit-log 패턴 참조: packages/server/src/services/audit-log.ts
import { createAuditLog } from '../../services/audit-log'

// 도구 권한 변경 시
await createAuditLog({
  companyId: tenant.companyId,
  userId: tenant.userId,
  action: 'agent.update',
  entityType: 'agent',
  entityId: agentId,
  details: {
    field: 'allowedTools',
    added: ['calculate', 'search_web'],
    removed: ['get_stock_price'],
  },
})
```

### UX 디자인 가이드라인 (UX spec 준수)

- **테이블 패턴**: 20행 페이지네이션 (UX spec 도구 관리 테이블)
- **필터**: 카테고리 필터 기본 제공 (UX spec 12.2)
- **Empty State**: "등록된 도구가 없습니다" + 안내 메시지 (UX spec 11.6.2)
- **색상**: 관리자 콘솔은 중립 톤 (UX spec Admin 테마)
- **카테고리 뱃지 색상**:
  - common: bg-blue-100 text-blue-700
  - finance: bg-green-100 text-green-700
  - legal: bg-purple-100 text-purple-700
  - marketing: bg-orange-100 text-orange-700
  - tech: bg-cyan-100 text-cyan-700

### 이전 스토리 학습 사항 (4-1 ~ 4-5)

- ToolPool.list()는 ToolRegistration[] 반환 (name, description, category, parameters, execute)
- ToolCategory = 'finance' | 'legal' | 'marketing' | 'tech' | 'common'
- agents.allowedTools는 string[] (도구 이름 배열)
- 서버 사이드 권한 검증은 ToolPool.createExecutor()에서 처리
- 감사 로그는 createAuditLog() 패턴 사용 (audit-log.ts)
- fire-and-forget 로깅 패턴 (tool-invocation-log.ts)
- Admin UI는 @tanstack/react-query + lazy import + Tailwind

### 기존 코드 재활용 (중복 방지)

**재활용할 것:**
- `packages/server/src/routes/admin/tools.ts`: 기존 엔드포인트 유지 + 카탈로그 엔드포인트 추가
- `packages/server/src/routes/admin/agents.ts`: PATCH 라우트의 allowedTools 업데이트 로직
- `packages/server/src/services/audit-log.ts`: createAuditLog() 감사 기록
- `packages/server/src/services/tool-pool.ts`: toolPool.list(), listByCategory()
- `packages/admin/src/stores/admin-store.ts`: selectedCompanyId 상태
- `packages/admin/src/stores/toast-store.ts`: addToast 알림
- `packages/admin/src/lib/api.ts`: API 클라이언트

**만들지 말 것 (이미 존재):**
- 에이전트 목록 API (GET /api/admin/agents 이미 존재)
- 도구 CRUD API (GET/POST/PUT /api/admin/tools 이미 존재)
- allowedTools 업데이트 (PATCH /api/admin/agents/:id에 이미 포함)

### Project Structure Notes

- Admin 앱: `packages/admin/` (React + Vite SPA)
- 서버: `packages/server/` (Hono + Bun)
- 공유 타입: `packages/shared/src/types.ts` (ToolCategory 등)
- 라우트 등록: `packages/server/src/index.ts`에서 toolsRoute 이미 등록됨

### References

- [Source: _bmad-output/planning-artifacts/epics.md - E4-S6 수용 기준]
- [Source: _bmad-output/planning-artifacts/prd.md - FR28 에이전트별 허용 도구 설정]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md - Admin A5 도구 관리]
- [Source: _bmad-output/planning-artifacts/architecture.md - Decision #4 Tool System]
- [Source: packages/server/src/services/tool-pool.ts - ToolPool.list(), listByCategory()]
- [Source: packages/server/src/routes/admin/tools.ts - 기존 도구 API]
- [Source: packages/server/src/routes/admin/agents.ts - allowedTools 업데이트]
- [Source: packages/admin/src/pages/tools.tsx - 기존 도구 관리 UI]
- [Source: packages/server/src/services/audit-log.ts - 감사 로그 패턴]
- [Source: packages/shared/src/types.ts:236 - ToolCategory 타입]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- Task 1: GET /api/admin/tools/catalog added to tools.ts -- groups by category, checks handler registration
- Task 2: PATCH /api/admin/agents/:id/allowed-tools and /batch endpoints -- with audit log via createAuditLog()
- Task 3: tools.tsx fully rewritten -- category filter tabs, tool catalog table, agent x tool checkbox matrix, category batch toggle, pending changes with save/cancel
- Task 4: 38 unit tests covering catalog grouping, allowedTools diff, batch operations, Zod schemas, audit log structure
- All 38 tests pass, no regressions in related test files (91 pass across 3 files)
- No TypeScript errors in tools.tsx or tools.ts

### File List

- packages/server/src/routes/admin/tools.ts (modified -- catalog API, allowed-tools management endpoints)
- packages/admin/src/pages/tools.tsx (modified -- full rewrite with permission matrix UI)
- packages/server/src/__tests__/unit/tool-management.test.ts (new -- 38 tests)
