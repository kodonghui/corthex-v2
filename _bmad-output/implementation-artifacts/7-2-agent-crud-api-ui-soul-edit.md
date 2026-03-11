# Story 7.2: 에이전트 CRUD API + UI (Soul 편집 포함)

Status: dev-complete

## Story

As a 관리자,
I want AI 에이전트를 자유롭게 생성/편집/삭제하고 Soul을 편집하는 것을,
so that v1의 29명 고정이 아닌 동적 조직을 운영할 수 있다.

## Acceptance Criteria

1. **REST API 완성**: POST/PATCH/DELETE `/api/admin/agents` — `{ success: true, data }` 응답 형식 통일 (현재 `{ data }` 형태 → `{ success: true, data }` 래핑 필요)
2. **에이전트 필드**: name, nameEn, departmentId(FK→departments), tier(manager|specialist|worker), allowedTools(jsonb), isSecretary, ownerUserId, soul, modelName, role, isActive, status
3. **Soul 편집**: 마크다운 에디터 (웹 UI에서 CEO가 직접 편집, v1 spec §2.3) — 서버 재시작 불필요
4. **Soul 변수 자동 프리뷰**: `{{agent_list}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{department_name}}`, `{{owner_name}}`, `{{specialty}}` 등이 실제 값으로 치환된 결과 표시 (실시간 프리뷰 API)
5. **비서 에이전트 삭제 방지**: isSecretary=true인 에이전트 삭제 시도 → ORG_SECRETARY_DELETE_DENIED (코드: 403)
6. **에이전트 생성 시 기본 Soul 템플릿 자동 적용**: tier에 따라 기본 Soul 템플릿 적용 (secretary→SECRETARY_SOUL_TEMPLATE, manager→MANAGER_SOUL_TEMPLATE)
7. **Admin UI**: 에이전트 목록 + 생성 모달 + 상세 편집 페이지 (Soul 에디터 포함) — `packages/app/src/pages/agents.tsx`

## Tasks / Subtasks

- [ ] Task 1: 백엔드 API 응답 형식 통일 (AC: #1)
  - [ ] 1.1 `packages/server/src/routes/admin/agents.ts` — 모든 엔드포인트 `{ data }` → `{ success: true, data }` 래핑
  - [ ] 1.2 isSecretary, ownerUserId 필드를 createAgentSchema/updateAgentSchema에 추가
  - [ ] 1.3 에이전트 생성 시 tier 기반 기본 Soul 템플릿 자동 적용 로직 (AC: #6)
- [ ] Task 2: Soul 프리뷰 API (AC: #4)
  - [ ] 2.1 POST `/api/admin/agents/:id/soul-preview` — 에이전트의 Soul 텍스트에 {{변수}} 치환 결과 반환
  - [ ] 2.2 `renderSoul()` (engine/soul-renderer.ts) 재활용 — 기존 로직 그대로 사용
- [ ] Task 3: Admin UI 에이전트 관리 페이지 (AC: #7)
  - [ ] 3.1 `packages/app/src/pages/agents.tsx` 신규 생성 — 에이전트 목록 (부서별 필터, 활성/비활성 필터)
  - [ ] 3.2 생성 모달: name(필수), nameEn, departmentId(셀렉트박스), tier(셀렉트), modelName, role, isSecretary(토글), ownerUserId(셀렉트), soul(선택적)
  - [ ] 3.3 편집 모달/페이지: 기본 정보 탭 + Soul 편집 탭 (탭 전환)
  - [ ] 3.4 Soul 에디터: 모노스페이스 textarea + {{변수}} 하이라이트 + 프리뷰 패널 (API 호출)
  - [ ] 3.5 삭제 확인 모달: 비서 에이전트면 삭제 불가 경고 표시
  - [ ] 3.6 App.tsx 라우트 추가: `/agents` → AgentsPage
  - [ ] 3.7 사이드바에 "에이전트 관리" 메뉴 추가 (운영 섹션, 부서 관리 아래)
- [ ] Task 4: 테스트 (AC: 전체)
  - [ ] 4.1 API 테스트: CRUD 엔드포인트, 응답 형식, 비서 삭제 방지, 이름 유니크, Soul 프리뷰
  - [ ] 4.2 Soul 프리뷰 테스트: 변수 치환 확인

## Dev Notes

### 기존 코드 현황 (매우 중요 — 중복 작성 금지)

**백엔드 API: 이미 대부분 구현됨**
- `packages/server/src/routes/admin/agents.ts` — Hono 라우트 (GET list, GET :id, POST, PATCH, DELETE)
  - **문제**: 응답 형식이 `{ data: ... }` → `{ success: true, data: ... }` 로 래핑 필요 (7.1에서 departments에 적용한 것과 동일)
  - createAgentSchema에 `isSecretary`, `ownerUserId` 필드 누락 → 추가 필요
- `packages/server/src/services/organization.ts` — 비즈니스 로직 완전 구현됨:
  - `getAgents(companyId, filters?)` — 부서별/활성 필터 지원
  - `getAgentById(companyId, agentId)`
  - `createAgent(tenant, input)` — 이름 유니크 검증, adminSoul 동기화, 감사 로그
  - `updateAgent(tenant, agentId, input)` — 이름 유니크, soul 변경 시 adminSoul 동기화
  - `deactivateAgent(tenant, agentId)` — isSystem 보호, isSecretary 보호 (ORG_SECRETARY_DELETE_DENIED), soft delete
- **미들웨어**: `authMiddleware → adminOnly → tenantMiddleware` 체인 적용됨

**Soul 렌더링: 이미 구현됨**
- `packages/server/src/engine/soul-renderer.ts` — `renderSoul(soulTemplate, agentId, companyId)` 함수
  - 6개 변수 치환: `{{agent_list}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{department_name}}`, `{{owner_name}}`, `{{specialty}}`
  - `getDB(companyId)` 사용하여 scoped-query 호출
  - 알 수 없는 변수는 빈 문자열로 대체

**Soul 템플릿: 기본 제공**
- `packages/server/src/lib/soul-templates.ts`:
  - `MANAGER_SOUL_TEMPLATE` — 매니저 표준 Soul (~1,500 chars)
  - `SECRETARY_SOUL_TEMPLATE` — 비서실장 Soul (~2,000 chars)
  - `BUILTIN_SOUL_TEMPLATES[]` — DB seed 데이터
  - `DEEPWORK_SOUL_SNIPPET` — 재사용 가능한 딥워크 패턴
  - `QUALITY_GATE_SNIPPET` — 재사용 가능한 품질 게이트 패턴

**DB 스키마 (변경 불필요)**
```
agents: id(uuid), companyId(uuid FK→companies), userId(uuid FK→users), departmentId(uuid FK→departments nullable),
        name(varchar 100), role(varchar 200), tier(enum: manager|specialist|worker), nameEn(varchar 100),
        modelName(varchar 100 default 'claude-haiku-4-5'), reportTo(uuid self-ref), soul(text), adminSoul(text),
        status(enum: online|working|error|offline), ownerUserId(uuid FK→users nullable),
        isSecretary(bool default false), isSystem(bool default false),
        allowedTools(jsonb default []), autoLearn(bool default true),
        isActive(bool default true), createdAt(timestamp), updatedAt(timestamp)
```
- `packages/server/src/db/schema.ts` 라인 144~168

**프론트엔드: Admin UI 없음**
- 에이전트 관리 페이지 **없음** — 이것이 이 스토리의 핵심 작업
- `packages/app/src/pages/departments.tsx` — 7.1에서 생성한 부서 관리 페이지 (패턴 참고)

### 아키텍처 준수 사항

1. **API 응답 형식** (CLAUDE.md): `{ success: true, data }` / `{ success: false, error: { code, message } }`
2. **파일명 규칙**: kebab-case (예: `agents.tsx`)
3. **컴포넌트**: PascalCase (예: `AgentsPage`, `AgentForm`, `SoulEditor`)
4. **프론트엔드 상태 관리**: TanStack Query로 서버 상태 관리
5. **에러 코드**: AGENT_001(Not Found), AGENT_002(Duplicate Name), AGENT_003(System Agent), ORG_SECRETARY_DELETE_DENIED
6. **멀티테넌시**: tenant 미들웨어가 `c.get('tenant')` → `{ companyId, userId, isAdminUser }` 제공

### 백엔드 변경 사항 (최소화)

**routes/admin/agents.ts 수정 범위**:
1. 응답 `{ data }` → `{ success: true, data }` 래핑 (5개 엔드포인트)
2. createAgentSchema에 추가:
   - `isSecretary: z.boolean().optional()` (기본값 false)
   - `ownerUserId: z.string().uuid().nullable().optional()`
3. 에이전트 생성 시 기본 Soul 자동 적용: tier가 'manager'면 MANAGER_SOUL_TEMPLATE, 그 외에는 null
4. Soul 프리뷰 엔드포인트 추가:
   ```typescript
   // POST /api/admin/agents/:id/soul-preview
   // Body: { soul: string } (선택적 — 없으면 DB의 현재 soul 사용)
   // Response: { success: true, data: { rendered: string, variables: Record<string, string> } }
   ```

**services/organization.ts 수정 범위**:
- AgentInput 인터페이스에 `isSecretary?: boolean`, `ownerUserId?: string | null` 추가
- createAgent()에서 isSecretary, ownerUserId를 values에 포함
- 기본 Soul 템플릿 적용 로직: soul이 null이고 tier가 'manager'면 MANAGER_SOUL_TEMPLATE 적용

### 프론트엔드 구현 가이드

**에이전트 목록 페이지** (`agents.tsx`):
- 부서별 필터 드롭다운 (departments API에서 목록 가져오기)
- 활성/비활성 필터 탭
- 에이전트 카드: name, tier(badge), department, status(dot), modelName
- 생성 버튼 → 모달
- 편집 버튼 → 모달 (기본 정보 탭 + Soul 편집 탭)
- 삭제 버튼 → 확인 모달 (비서면 경고)

**에이전트 생성 모달**:
```typescript
const fields = {
  name: '에이전트 이름 (필수)',
  nameEn: '영문 이름',
  departmentId: '소속 부서 (셀렉트박스, departments API)',
  tier: '등급 (manager/specialist/worker 셀렉트)',
  modelName: '모델명 (text, 기본값: claude-haiku-4-5)',
  role: '역할/전문분야 (text)',
  isSecretary: '비서 에이전트 여부 (토글)',
  ownerUserId: 'CLI 소유 인간직원 (셀렉트, users API)',
}
```

**Soul 편집 패널** (편집 모달의 두 번째 탭):
- 왼쪽: 모노스페이스 Textarea (Soul 마크다운)
- 오른쪽: 프리뷰 패널 (렌더링된 Soul, {{변수}} 치환 결과)
- "프리뷰 새로고침" 버튼 → POST `/api/admin/agents/:id/soul-preview`
- `{{variable}}` 패턴 하이라이트 설명 텍스트 (사용 가능한 변수 목록 표시)
- "기본 템플릿 적용" 버튼 (tier에 따른 기본 Soul 로드)

**UI 컴포넌트 활용** (`@corthex/ui`):
- Modal, Button, Input, Textarea, Select, Badge, Tabs, Skeleton, EmptyState, toast, Toggle
- 다크 테마: zinc-based (departments.tsx 패턴 따름)

**App.tsx 라우트 추가**:
```typescript
const AgentsPage = lazy(() => import('./pages/agents').then((m) => ({ default: m.AgentsPage })))
// Route: <Route path="agents" element={<Suspense fallback={<PageSkeleton />}><AgentsPage /></Suspense>} />
```

**사이드바 메뉴 추가** (`sidebar.tsx`):
```typescript
// 운영 섹션에 '에이전트 관리' 추가 (부서 관리 다음)
{ to: '/agents', label: '에이전트 관리', icon: '🤖' },
```

### Soul 템플릿 기본 적용 로직

에이전트 생성 시 soul이 null/undefined이면:
- tier === 'manager' → MANAGER_SOUL_TEMPLATE 적용
- isSecretary === true → SECRETARY_SOUL_TEMPLATE 적용
- 그 외 → null (빈 Soul)

이는 organization.ts의 createAgent() 내부에서 처리. soul-templates.ts에서 import.

### Soul 프리뷰 API 상세

```
POST /api/admin/agents/:id/soul-preview
Body: { soul?: string }  // 선택적. 없으면 DB의 현재 soul 사용
Response: {
  success: true,
  data: {
    rendered: string,      // {{변수}} 치환 완료된 결과
    variables: {           // 사용된 변수와 값
      agent_list: "김비서(비서), 분석관(분석)...",
      subordinate_list: "...",
      tool_list: "...",
      department_name: "마케팅부",
      owner_name: "홍길동",
      specialty: "시장분석"
    }
  }
}
```

구현: engine/soul-renderer.ts의 renderSoul() 재활용. 단, soul-preview는 body.soul이 있으면 그 텍스트에 치환, 없으면 DB soul에 치환.

### 7.1에서 배운 것 (Previous Story Intelligence)

- 백엔드 API는 이미 대부분 구현되어 있었음 → 중복 작성 금지
- 핵심 작업은 응답 형식 `{ success: true }` 래핑 + Admin UI 신규 생성
- departments.tsx 패턴 (TanStack Query + Modal + form + cascade)을 그대로 따라 확장
- Zod 스키마에 필드 추가할 때 optional()로 하면 기존 호출자에 영향 없음
- 테스트: bun:test 사용, `packages/server/src/__tests__/unit/` 경로

### Project Structure Notes

- `packages/server/src/routes/admin/agents.ts` — MODIFY: 응답 래핑 + 스키마 필드 추가 + Soul 프리뷰 엔드포인트
- `packages/server/src/services/organization.ts` — MODIFY: AgentInput에 isSecretary/ownerUserId + 기본 Soul 적용
- `packages/app/src/pages/agents.tsx` — NEW: 에이전트 관리 페이지
- `packages/app/src/App.tsx` — MODIFY: /agents 라우트 추가
- `packages/app/src/components/sidebar.tsx` — MODIFY: 에이전트 관리 메뉴 추가
- `packages/server/src/__tests__/unit/story-7-2-agent-crud-api-ui.test.ts` — NEW: 테스트

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 7, Story 7.2]
- [Source: _bmad-output/implementation-artifacts/7-1-department-crud-api-ui.md — 이전 스토리 패턴 참고]
- [Source: packages/server/src/routes/admin/agents.ts — 기존 API 라우트]
- [Source: packages/server/src/services/organization.ts — 비즈니스 로직 (createAgent, updateAgent, deactivateAgent)]
- [Source: packages/server/src/engine/soul-renderer.ts — renderSoul() 함수]
- [Source: packages/server/src/lib/soul-templates.ts — 기본 Soul 템플릿]
- [Source: packages/server/src/db/schema.ts#agents 라인 144~168 — DB 스키마]
- [Source: packages/app/src/pages/departments.tsx — Admin UI 패턴 참고]
- [Source: packages/app/src/components/sidebar.tsx — 사이드바 메뉴]
- [Source: CLAUDE.md — API 응답 형식, 파일명 규칙]
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md §2.3 — Soul 편집]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

### Change Log

- Backend: Wrapped all 5 agent endpoints with `{ success: true, data }` response format
- Backend: Added `isSecretary`, `ownerUserId` to create/update schemas and AgentInput/AgentUpdateInput interfaces
- Backend: Added default Soul template logic (secretary -> SECRETARY_SOUL_TEMPLATE, manager -> MANAGER_SOUL_TEMPLATE)
- Backend: Added POST `/api/admin/agents/:id/soul-preview` endpoint using renderSoul() with variable extraction
- Frontend: Created full agents.tsx page with list, filters, create/edit modals, Soul editor with live preview
- Frontend: Added `/agents` route to App.tsx
- Frontend: Added "에이전트 관리" menu to sidebar (운영 section, below 부서 관리)
- Tests: 22 tests covering response format, schema, secretary delete protection, default soul templates, variable preview

### File List

- `packages/server/src/routes/admin/agents.ts` — MODIFIED: response wrapping, schema fields, soul-preview endpoint
- `packages/server/src/services/organization.ts` — MODIFIED: AgentInput/AgentUpdateInput + default soul + import templates
- `packages/app/src/pages/agents.tsx` — NEW: agent management page with Soul editor
- `packages/app/src/App.tsx` — MODIFIED: added /agents route
- `packages/app/src/components/sidebar.tsx` — MODIFIED: added 에이전트 관리 menu
- `packages/server/src/__tests__/unit/story-7-2-agent-crud-api-ui.test.ts` — NEW: 22 unit tests
