# Story 2.3: soul-renderer.ts — Soul 템플릿 변수 치환

Status: done

## Story

As a 에이전트 시스템,
I want Soul 마크다운에 DB 데이터가 동적 주입되는 것을,
so that 에이전트가 조직/도구/부하 정보를 실시간으로 인지한다.

## Acceptance Criteria

1. [ ] `packages/server/src/engine/soul-renderer.ts` (~40줄) 생성
2. [ ] 6개 변수 치환: `{{agent_list}}`, `{{subordinate_list}}`, `{{tool_list}}`, `{{department_name}}`, `{{owner_name}}`, `{{specialty}}` (E4)
3. [ ] `getDB(companyId)`로 DB 데이터 조회 (E3) — scoped-query.ts에 필요한 쿼리 메서드 추가
4. [ ] 치환 실패 시 빈 문자열 대체 (에러 아님)
5. [ ] Soul에 사용자 입력 직접 삽입 절대 금지 (prompt injection 방지)
6. [ ] 단위 테스트: `soul-renderer.test.ts` — 6변수 치환 + 누락 변수 + 빈 DB 케이스
7. [ ] engine 내부 전용 (E8: 외부 import 금지)

## Tasks / Subtasks

- [x] Task 1: scoped-query.ts 확장 — soul-renderer에 필요한 DB 쿼리 메서드 추가 (AC: #3)
  - [x] 1.1 `agentById(id)` — 단일 에이전트 조회 (departmentId, userId, role 필요)
  - [x] 1.2 `agentsByReportTo(agentId)` — 부하 에이전트 목록 (name, role)
  - [x] 1.3 `agentToolsWithDefs(agentId)` — agentTools JOIN toolDefinitions (name, description)
  - [x] 1.4 `departmentById(id)` — 단일 부서 조회 (name)
  - [x] 1.5 `userById(id)` — 단일 사용자 조회 (name) — users 테이블 import 추가

- [x] Task 2: soul-renderer.ts 구현 (AC: #1, #2, #4, #5, #7)
  - [x] 2.1 `packages/server/src/engine/soul-renderer.ts` 파일 생성
  - [x] 2.2 `renderSoul(soulTemplate, agentId, companyId): Promise<string>` export
  - [x] 2.3 `getDB(companyId)` 호출로 DB 데이터 조회
  - [x] 2.4 6개 변수 resolve 로직 구현
  - [x] 2.5 regex `{{변수명}}` 매칭 → 치환, 미매칭 → 빈 문자열
  - [x] 2.6 사용자 입력 직접 삽입 방지 (renderSoul은 DB 데이터만 사용)

- [x] Task 3: 단위 테스트 (AC: #6)
  - [x] 3.1 `packages/server/src/__tests__/unit/soul-renderer.test.ts` 생성
  - [x] 3.2 getDB 모킹 — bun:test mock.module
  - [x] 3.3 테스트 1: 6변수 전체 치환 정상 동작
  - [x] 3.4 테스트 2: 누락 변수 → 빈 문자열 대체
  - [x] 3.5 테스트 3: 빈 DB 결과 → 빈 문자열
  - [x] 3.6 테스트 4: 변수 없는 템플릿 → 그대로 통과 (passthrough)
  - [x] 3.7 테스트 5: 알 수 없는 변수 `{{unknown_var}}` → 빈 문자열 대체

- [x] Task 4: 빌드 검증
  - [x] 4.1 `npx tsc --noEmit -p packages/server/tsconfig.json` — 0 errors
  - [x] 4.2 `bun test packages/server/src/__tests__/unit/soul-renderer.test.ts` — 5 PASS

## Dev Notes

### Architecture Decisions

- **E4 (Soul 변수 규칙):** 6개 변수만. `{{변수명}}` 이중 중괄호만 사용. soul-renderer.ts만 치환 수행.
- **E3 (DB 접근):** `getDB(companyId)` 필수. `db` 직접 import 금지.
- **E8 (engine 경계):** soul-renderer.ts는 engine 내부 전용. agent-loop.ts에서만 호출.
- **SEC (보안):** Soul에 사용자 입력 직접 삽입 절대 금지. DB 데이터만 사용.
- **v1→v2 차이:** v1은 agents.yaml 고정 → v2는 DB 동적 조회 (조직 CRUD와 연동).

### Function Signature

```typescript
export async function renderSoul(
  soulTemplate: string,
  agentId: string,
  companyId: string
): Promise<string>
```

### Variable Resolution Logic

| 변수 | DB 쿼리 | 형식 |
|------|---------|------|
| `{{agent_list}}` | `getDB(companyId).agents()` | `이름(역할), 이름(역할), ...` |
| `{{subordinate_list}}` | `getDB(companyId).agentsByReportTo(agentId)` | `이름(역할), 이름(역할), ...` |
| `{{tool_list}}` | `getDB(companyId).agentToolsWithDefs(agentId)` | `이름: 설명, 이름: 설명, ...` |
| `{{department_name}}` | `getDB(companyId).departmentById(agent.departmentId)` | 부서 이름 |
| `{{owner_name}}` | `getDB(companyId).userById(agent.userId)` | 사용자 이름 |
| `{{specialty}}` | `agent.role` (agentById 결과에서) | 역할 문자열 |

### DB Schema Context

**agents table:**
- id, companyId, userId, departmentId, name, role, tier, nameEn, modelName, reportTo, soul, status, isSecretary, isSystem

**departments table:**
- id, companyId, name, description, isActive

**toolDefinitions table:**
- id, companyId, name, description, scope, inputSchema, handler, category

**agentTools table:**
- id, companyId, agentId, toolId, isEnabled

**users table:**
- id, companyId, username, passwordHash, name, email, role, isActive

### scoped-query.ts 확장 패턴

기존 패턴 참고 (agents(), departments() 등):
```typescript
// 기존
agents: () =>
  db.select().from(agents).where(withTenant(agents.companyId, companyId)),

// 추가해야 할 것들
agentById: (id: string) =>
  db.select().from(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.id, id))),
agentsByReportTo: (agentId: string) =>
  db.select().from(agents).where(scopedWhere(agents.companyId, companyId, eq(agents.reportTo, agentId))),
agentToolsWithDefs: (agentId: string) =>
  db.select({ name: toolDefinitions.name, description: toolDefinitions.description })
    .from(agentTools)
    .innerJoin(toolDefinitions, eq(agentTools.toolId, toolDefinitions.id))
    .where(scopedWhere(agentTools.companyId, companyId, eq(agentTools.agentId, agentId), eq(agentTools.isEnabled, true))),
departmentById: (id: string) =>
  db.select().from(departments).where(scopedWhere(departments.companyId, companyId, eq(departments.id, id))),
userById: (id: string) =>
  db.select().from(users).where(scopedWhere(users.companyId, companyId, eq(users.id, id))),
```

### Implementation Algorithm (~40 lines)

```typescript
import { getDB } from '../db/scoped-query'

export async function renderSoul(
  soulTemplate: string,
  agentId: string,
  companyId: string,
): Promise<string> {
  const scopedDb = getDB(companyId)

  // 1. Fetch agent data first (needed for departmentId, userId, role)
  const [agent] = await scopedDb.agentById(agentId)
  if (!agent) return soulTemplate.replace(/\{\{[^}]+\}\}/g, '')

  // 2. Parallel fetch all variable data
  const [allAgents, subordinates, tools, dept, owner] = await Promise.all([
    scopedDb.agents(),
    scopedDb.agentsByReportTo(agentId),
    scopedDb.agentToolsWithDefs(agentId),
    agent.departmentId ? scopedDb.departmentById(agent.departmentId) : Promise.resolve([]),
    scopedDb.userById(agent.userId),
  ])

  // 3. Build variable map
  const vars: Record<string, string> = {
    agent_list: allAgents.map(a => `${a.name}(${a.role || ''})`).join(', '),
    subordinate_list: subordinates.map(a => `${a.name}(${a.role || ''})`).join(', '),
    tool_list: tools.map(t => `${t.name}: ${t.description || ''}`).join(', '),
    department_name: dept[0]?.name || '',
    owner_name: owner[0]?.name || '',
    specialty: agent.role || '',
  }

  // 4. Replace all {{var}} — known vars get value, unknown vars get empty string
  return soulTemplate.replace(/\{\{([^}]+)\}\}/g, (_, key) => vars[key.trim()] || '')
}
```

### Testing Strategy

- **getDB 모킹:** bun:test `mock.module` 으로 `../db/scoped-query` 모킹
- 모킹 패턴: Story 2.2의 SDK 모킹과 유사. `mock.module`으로 모듈 자체를 대체.
- 모든 DB 메서드가 Promise<array> 반환하도록 모킹

### Previous Story Intelligence (Story 2.2)

- **패턴:** bun:test `mock.module` 으로 외부 의존성 모킹 성공
- **교훈:** `(msg as any)` 캐스트 사용 — Phase 1에서는 허용 (E9)
- **구조:** 프로덕션 코드 ~85줄, 테스트 8개 — 이 스토리는 더 작을 것 (~40줄)
- **Simplify 적용:** 변수 섀도잉 수정 + processing 이벤트 추가됨

### Git Context (Recent Commits)

```
171567e fix(engine): code review fixes for agent-loop.ts (Story 2.2 CR)
365b9e4 feat: Story 2.2 agent-loop.ts — SDK query() wrapper + single entry point + TEA 8 tests + simplify
730d1a8 feat: Story 2.1 engine/types.ts — SessionContext, SSEEvent, PreToolHookResult, RunAgentOptions + TEA 8 tests
8f980aa feat: Story 1.6 CI engine boundary check — E8/E10 enforcement + TEA 7 tests
1514a9b feat: Story 1.5 session rate limiter middleware — concurrent session control + TEA 8 tests
```

커밋 메시지 패턴: `feat: Story X.Y filename — 기능 설명 + TEA N tests`

### Project Structure Notes

```
packages/server/src/
  engine/
    types.ts          # 공개 API (E8)
    agent-loop.ts     # 공개 API (E8)
    soul-renderer.ts  # 내부 전용 (이 스토리에서 생성)
  db/
    scoped-query.ts   # getDB(companyId) — 여기에 쿼리 메서드 추가
    schema.ts         # agents, departments, toolDefinitions, agentTools, users
    tenant-helpers.ts # withTenant, scopedWhere, scopedInsert
  __tests__/unit/
    soul-renderer.test.ts  # 이 스토리에서 생성
```

### Anti-Patterns to Avoid

- `db` 직접 import (E3 위반)
- `soul-renderer.ts`를 engine 외부에서 import (E8 위반)
- Soul에 사용자 입력(`message` 등) 직접 삽입 (prompt injection)
- barrel export(index.ts) 생성 금지
- 7번째 변수 추가 금지 — E4에 6개만 정의됨

### References

- [Source: architecture.md → E4 (lines 640-647), E3 (lines 631-638), E8 (lines 681-687)]
- [Source: epics.md → Story 2.3 (lines 254-272)]
- [Source: scoped-query.ts — getDB() pattern, tenant-helpers.ts]
- [Source: schema.ts → agents (line 144), departments (line 131), toolDefinitions (line 251), agentTools (line 270), users (line 53)]
- [Source: Story 2.2 → mock.module pattern, error handling, simplify learnings]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **soul-renderer.ts:** 42 lines. `renderSoul(soulTemplate, agentId, companyId)` — fetches agent, then parallel-fetches all 6 variable data from DB, replaces `{{var}}` via regex.
- **scoped-query.ts:** Added 5 new query methods (agentById, agentsByReportTo, agentToolsWithDefs, departmentById, userById) + imported agentTools, toolDefinitions, users from schema.
- **Variable map:** agent_list (name+role comma-sep), subordinate_list (reportTo), tool_list (name: description), department_name, owner_name, specialty (role).
- **Security:** Only DB data used for substitution. No user input injection path. Agent not found → all vars replaced with empty string.
- **Tests:** 5 tests — 6-var substitution, unknown vars, empty DB, passthrough, agent-not-found. getDB mocked via mock.module.
- **scoped-query test:** Updated method count test (6→11). Note: Bun mock.module leaks between files when run together — each test passes individually.
- **TEA:** 5 risk-based tests added (P0: prompt injection prevention, P1: null departmentId, P1: multiple same-variable, P1: single braces ignored, P1: null role)
- **tsc:** 0 errors. All 10 soul-renderer tests pass (5 dev + 5 TEA).

### Change Log

- 2026-03-11: Story 2.3 implementation complete — soul-renderer.ts + scoped-query.ts extensions + 5 unit tests
- 2026-03-11: TEA — 5 risk-based tests added (10 total)
- 2026-03-11: Code Review — 1 MEDIUM fix (toolDefinitions.isActive filter), 2 LOW acknowledged

### File List

- `packages/server/src/engine/soul-renderer.ts` — NEW: Soul template variable substitution (42 lines)
- `packages/server/src/db/scoped-query.ts` — MODIFIED: Added 5 query methods for soul-renderer (agentById, agentsByReportTo, agentToolsWithDefs, departmentById, userById)
- `packages/server/src/__tests__/unit/soul-renderer.test.ts` — NEW: 5 unit tests (getDB mocked)
- `packages/server/src/__tests__/unit/scoped-query.test.ts` — MODIFIED: Updated method count test (6→11)
