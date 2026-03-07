# Story 3.1: 29-Agent Organization Deployment

Status: done

## Story

As the system,
I want to automatically deploy the standard 29-agent organization when a company is created,
So that every company starts with a fully staffed AI team with proper hierarchy, departments, and Soul definitions.

## Acceptance Criteria

1. **Given** a new company is created via POST /api/auth/register
   **When** the company setup completes
   **Then** 29 agent records are created in the agents table with correct hierarchy

2. **Given** the 29 agents are deployed
   **Then** each agent has: name, nameEn, tier (manager/specialist/worker), department, reportTo (parent agent), defaultModel, and default Soul markdown

3. **Given** the deployed hierarchy
   **Then** it matches v1 exactly:
   - CEO -> Chief of Staff (비서실장) + 3 Assistants (보좌관)
   - Chief of Staff -> 6 Department Managers (CTO, CSO, CLO, CMO, CIO, CPO)
   - CTO -> 4 Specialists (프론트엔드, 백엔드, 인프라, AI모델)
   - CSO -> 3 Specialists (시장조사, 사업계획서, 재무모델링)
   - CLO -> 2 Specialists (저작권, 특허/약관)
   - CMO -> 3 Specialists (설문/리서치, 콘텐츠, 커뮤니티)
   - CIO -> 4 Specialists + 1 Worker (시황분석, 종목분석, 기술적분석, 리스크관리 + VECTOR봇)
   - CPO -> 3 Workers (편집, 교정, 발행)
   Total: 1 CoS + 3 Assistants + 6 Managers + 16 Specialists + 4 Workers = 30? → Verify against v1's 29 count

4. **Given** the agents are deployed
   **Then** departments are also created matching v1 structure:
   - 비서실 (Executive Office)
   - LEET MASTER 본부: 기술처 (CTO), 전략처 (CSO), 법무처 (CLO), 홍보처 (CMO)
   - 투자분석 본부: 투자분석처 (CIO)
   - 출판기록 본부: 출판기록처 (CPO)

5. **Given** agents are deployed
   **Then** each agent has a meaningful default Soul markdown (not empty stubs) that includes:
   - Role description, expertise area
   - Judgment principles, report format preferences
   - Allowed tool categories (will be linked in Epic 4)

6. **Given** agent deployment
   **Then** delegation rules are auto-created: CoS -> each Manager based on keyword matching

7. **Given** a GET /api/workspace/agents request
   **Then** the response includes tier, reportTo, and department information for hierarchy display

8. **Given** a GET /api/workspace/agents/hierarchy request
   **Then** the response returns the full tree structure for org chart visualization

## Tasks / Subtasks

- [x] Task 1: DB Schema Migration — Add tier, reportTo, modelName, nameEn columns (AC: #2, #7)
  - [x] 1.1 Add `agentTierEnum` ('manager', 'specialist', 'worker') to schema
  - [x] 1.2 Add `tier` column (agentTierEnum, default 'specialist')
  - [x] 1.3 Add `reportTo` column (self-referencing UUID, nullable)
  - [x] 1.4 Add `modelName` column (varchar, default 'claude-haiku-4-5')
  - [x] 1.5 Add `nameEn` column (varchar, nullable) for English name
  - [x] 1.6 Create migration file 0030_agent-organization.sql
  - [x] 1.7 Migration auto-applies on server start via runMigrations()

- [x] Task 2: Organization Definition Data (AC: #3, #4, #5)
  - [x] 2.1 Create `packages/server/src/lib/agent-org-definition.ts` with full 29-agent org structure
  - [x] 2.2 Define 7 departments with Korean names and descriptions
  - [x] 2.3 Define all 29 agents: name, nameEn, tier, department, modelName, reportTo key, Soul markdown
  - [x] 2.4 Soul content per agent: managers 400+ chars, specialists 300+ chars, workers 150+ chars

- [x] Task 3: Organization Deployment Service (AC: #1, #6)
  - [x] 3.1 Create `packages/server/src/services/agent-org-deployer.ts`
  - [x] 3.2 `deployOrganization(companyId, userId)` — creates departments + 29 agents + delegation rules
  - [x] 3.3 Idempotent: skip if agents already exist for company
  - [x] 3.4 Sequential inserts with idempotency guard
  - [x] 3.5 Create 6 delegation rules: CoS -> each Manager with keyword matching

- [x] Task 4: Hook into Company Registration (AC: #1)
  - [x] 4.1 Call `deployOrganization()` in POST /api/auth/register after company+user creation
  - [x] 4.2 Agents are owned by the registering user (userId)

- [x] Task 5: Hierarchy API Endpoint (AC: #7, #8)
  - [x] 5.1 Update GET /api/workspace/agents to include tier, nameEn, reportTo, modelName fields
  - [x] 5.2 Add GET /api/workspace/agents/hierarchy — returns tree structure
  - [x] 5.3 Tree structure: nested { agent, children[] } format for org chart
  - [x] 5.4 Updated agent detail endpoint with new fields
  - [x] 5.5 Updated shared types (AgentTier, Agent type with new fields)

- [x] Task 6: Tests (32 tests, all pass)
  - [x] 6.1 Agent count (29), department count (7), tier distribution tests
  - [x] 6.2 Hierarchy structure tests (CoS->managers->specialists/workers)
  - [x] 6.3 Model assignment per tier tests
  - [x] 6.4 Soul content quality tests
  - [x] 6.5 Delegation rules tests (6 rules, CoS->managers)
  - [x] 6.6 Hierarchy tree building tests

## Dev Notes

### Architecture Compliance

- **Agent = config (Soul) + runtime (AgentRunner)** — per architecture decision #2
- **3-Tier Hierarchy**: Manager (Sonnet), Specialist (Haiku), Worker (Haiku) — per architecture
- **Tenant Isolation**: All agents filtered by companyId — already enforced in existing routes
- **DB convention**: snake_case columns, kebab-case files
- **Agent table already has**: id, companyId, userId, departmentId, name, role, soul, adminSoul, status, isSecretary, isActive
- **Missing columns**: tier, reportTo (self-ref), modelName, nameEn

### v1 Organization Reference (CRITICAL)

From v1-feature-spec.md section 2.1, the exact org structure:
```
CEO (사용자)
├── 비서실장 (Chief of Staff) + 3명 보좌관
└── 2개 본부:
    ├── LEET MASTER 본부
    │   ├── CTO (5명): 프론트엔드, 백엔드, 인프라, AI모델, (+ CTO 자신)
    │   ├── CSO (3명): 시장조사, 사업계획서, 재무모델링 (+ CSO 자신)
    │   ├── CLO (2명): 저작권, 특허/약관 (+ CLO 자신)
    │   └── CMO (3명): 설문/리서치, 콘텐츠, 커뮤니티 (+ CMO 자신)
    ├── 투자분석 본부
    │   └── CIO (5명): 시황분석, 종목분석, 기술적분석, 리스크관리 (+ CIO 자신)
    └── 출판 기록 본부
        └── CPO (3명) (+ CPO 자신)
```

Agent count: CoS(1) + Assistants(3) + Managers(6) + CTO staff(4) + CSO staff(3) + CLO staff(2) + CMO staff(3) + CIO staff(4+1 VECTOR) + CPO staff(3) = 1+3+6+4+3+2+3+5+3 = 30
But v1 spec says "29명" — verify: likely excludes CEO or VECTOR. Match exact v1 count.

### Model Assignment (per v1 spec section 2.2)

| Tier | Default Model | Rationale |
|------|--------------|-----------|
| Manager | claude-sonnet-4-6 | 업무 분해 + 종합 (중비용) |
| Specialist | claude-haiku-4-5 | 실제 작업 수행 (저비용) |
| Worker | claude-haiku-4-5 | 단순 반복 (최저비용) |

### Existing Code Patterns to Follow

From Epic 0 implementation:
- **Routes**: Hono router with `authMiddleware`, `zValidator`
- **DB queries**: Drizzle `select().from().where(and(eq(...)))` pattern
- **Error handling**: `throw new HTTPError(code, msg, errorCode)`
- **Activity logging**: `logActivity({...})` after mutations
- **Schema**: `pgTable()` with `uuid().primaryKey().defaultRandom()`
- **Relations**: Drizzle `relations()` for type-safe joins

### Delegation Rules (auto-created)

CoS is the orchestrator (isSecretary=true). When deployed, create default delegation rules:
- CoS -> CTO: keywords ["개발", "기술", "코드", "프로그래밍", "인프라", "서버"]
- CoS -> CSO: keywords ["전략", "시장", "사업", "계획", "분석"]
- CoS -> CLO: keywords ["법률", "법무", "저작권", "특허", "계약", "약관"]
- CoS -> CMO: keywords ["마케팅", "홍보", "SNS", "콘텐츠", "브랜딩"]
- CoS -> CIO: keywords ["투자", "주식", "종목", "시황", "매매", "포트폴리오"]
- CoS -> CPO: keywords ["출판", "편집", "보고서", "문서", "기록"]

### Project Structure Notes

Files to create/modify:
```
packages/server/src/
  db/
    schema.ts                    — Add tier enum, new columns
    migrations/0030_agent-organization.sql — Migration
  lib/
    agent-org-definition.ts      — 29-agent org data (NEW)
  services/
    agent-org-deployer.ts        — Deployment service (NEW)
  routes/
    auth.ts                      — Hook deployOrganization into register
    workspace/agents.ts          — Add hierarchy endpoint, update list response
```

### Soul Content Guidelines

Each agent's Soul should include (per v1 section 2.3):
1. **역할 정의**: 이 에이전트의 핵심 역할 (1-2문장)
2. **전문 분야**: 구체적 전문 영역 목록
3. **판단 원칙**: 의사결정 시 우선순위 (3-5개)
4. **보고서 형식**: 산출물 작성 기준
5. **행동 지침**: 에이전트 행동 규칙

### References

- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#2-에이전트-조직-시스템]
- [Source: _bmad-output/planning-artifacts/architecture.md#Agent-Execution-Model]
- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3]
- [Source: _bmad-output/planning-artifacts/prd.md#FR14-FR18]
- [Source: packages/server/src/db/schema.ts — agents table definition]
- [Source: packages/server/src/routes/workspace/agents.ts — existing agent routes]
- [Source: packages/server/src/routes/auth.ts — register endpoint to hook into]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References
- All 32 tests pass: `bun test packages/server/src/__tests__/unit/agent-org-deployment.test.ts`
- Full test suite: 2710 pass / 31 fail (pre-existing failures, none related to this story)

### Completion Notes List
- DB schema: Added agentTierEnum, tier, nameEn, modelName, reportTo columns to agents table
- Organization definition: 29 agents across 7 departments with full Soul markdown
- Deployment service: Idempotent deployOrganization() called on company registration
- Hierarchy API: GET /hierarchy returns tree structure for org chart
- Shared types updated: AgentTier type, Agent type with new fields

### File List
- packages/server/src/db/schema.ts (modified — added agentTierEnum, tier, nameEn, modelName, reportTo)
- packages/server/src/db/migrations/0030_agent-organization.sql (new)
- packages/server/src/db/migrations/meta/_journal.json (modified — added entry 30)
- packages/server/src/lib/agent-org-definition.ts (new — 29 agents, 7 departments, 6 delegation rules)
- packages/server/src/services/agent-org-deployer.ts (new — deployOrganization service)
- packages/server/src/routes/auth.ts (modified — hook deployOrganization into register)
- packages/server/src/routes/workspace/agents.ts (modified — added hierarchy endpoint, updated list/detail with new fields)
- packages/shared/src/types.ts (modified — added AgentTier, updated Agent type)
- packages/server/src/__tests__/unit/agent-org-deployment.test.ts (new — 32 tests)
