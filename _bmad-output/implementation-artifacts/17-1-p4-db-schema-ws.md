# Story 17.1: P4 DB 스키마 + WebSocket

Status: done

## Story

As a platform developer,
I want P4 NEXUS/MCP DB 스키마를 Drizzle ORM에 등록하고 nexus WebSocket 채널을 추가,
so that Epic 17-18의 후속 스토리들이 DB 테이블과 실시간 이벤트를 즉시 사용할 수 있다.

## Acceptance Criteria

1. **Given** `packages/server/src/db/schema.ts` **When** Drizzle ORM 스키마 정의 확인 **Then** `nexusWorkflows`, `nexusExecutions`, `mcpServers` 3개 테이블이 Drizzle 스키마에 정의되어 있고, 기존 마이그레이션 0019의 SQL과 컬럼/타입이 정확히 일치
2. **Given** 각 테이블 **When** relations 정의 확인 **Then** `nexusWorkflowsRelations` (company, createdByUser, executions), `nexusExecutionsRelations` (company, workflow), `mcpServersRelations` (company) 관계가 올바르게 정의됨
3. **Given** `packages/shared/src/types.ts` **When** WsChannel 타입 확인 **Then** `'nexus'` 가 union에 포함됨 (기존 7개 + nexus = 8개)
4. **Given** `packages/server/src/ws/channels.ts` **When** nexus 채널 구독 요청 **Then** companyId 기반 권한 검증 후 `nexus::{companyId}` 키로 구독 처리 (agent-status와 동일 패턴)
5. **Given** `broadcastToCompany(companyId, 'nexus', { type: 'nexus-updated', ... })` 호출 **When** nexus 채널 구독자 존재 **Then** 해당 회사 구독자 전원에게 메시지 수신
6. **Given** `turbo build type-check` **When** 전체 빌드 **Then** 8/8 success, 타입 에러 0건
7. **Given** 기존 마이그레이션 0019에 이미 CREATE TABLE SQL 존재 **When** 이 스토리 **Then** 새 마이그레이션 SQL 생성 불필요 (Drizzle 스키마 정의만 추가)

## Tasks / Subtasks

- [x] Task 1: Drizzle 스키마 — nexusWorkflows 테이블 정의 (AC: #1, #2)
  - [x] `packages/server/src/db/schema.ts`에 `nexusWorkflows` pgTable 추가
  - [x] 컬럼: id(uuid PK), companyId(uuid FK→companies), name(varchar 200), description(text nullable), nodes(jsonb default []), edges(jsonb default []), isTemplate(boolean default false), isActive(boolean default true), createdBy(uuid FK→users), createdAt(timestamp), updatedAt(timestamp)
  - [x] `nexusWorkflowsRelations` 정의: company(one→companies), createdByUser(one→users), executions(many→nexusExecutions)

- [x] Task 2: Drizzle 스키마 — nexusExecutions 테이블 정의 (AC: #1, #2)
  - [x] `nexusExecutions` pgTable 추가
  - [x] 컬럼: id(uuid PK), companyId(uuid FK→companies), workflowId(uuid FK→nexusWorkflows), status(varchar 20 default 'running'), result(jsonb nullable), startedAt(timestamp), completedAt(timestamp nullable)
  - [x] `nexusExecutionsRelations` 정의: company(one→companies), workflow(one→nexusWorkflows)

- [x] Task 3: Drizzle 스키마 — mcpServers 테이블 정의 (AC: #1, #2)
  - [x] `mcpServers` pgTable 추가
  - [x] 컬럼: id(uuid PK), companyId(uuid FK→companies), name(varchar 100), url(text), transport(varchar 20 default 'stdio'), config(jsonb nullable), isActive(boolean default true), createdAt(timestamp), updatedAt(timestamp)
  - [x] `mcpServersRelations` 정의: company(one→companies)

- [x] Task 4: shared 타입 — WsChannel에 'nexus' 추가 (AC: #3)
  - [x] `packages/shared/src/types.ts`의 `WsChannel` union에 `| 'nexus'` 추가

- [x] Task 5: WebSocket — nexus 채널 구독 핸들러 (AC: #4, #5)
  - [x] `packages/server/src/ws/channels.ts`의 switch문에 `case 'nexus':` 추가
  - [x] 권한 검증: companyId 기반 (`agent-status` 패턴과 동일)
  - [x] 구독 키: `nexus::{companyId}`

- [x] Task 6: 빌드 검증 (AC: #6)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **DB 마이그레이션 0019** (`packages/server/src/db/migrations/0019_wandering_sally_floyd.sql`)
   - nexus_workflows, nexus_executions, mcp_servers 3개 테이블 CREATE + FK 제약 이미 존재
   - **새 마이그레이션 생성 불필요** — Drizzle 스키마 정의만 추가하면 됨

2. **canvasLayouts 테이블** (`schema.ts:597-610`)
   - NEXUS 캔버스 레이아웃 저장 테이블 이미 존재
   - 관련 관계(canvasLayoutsRelations)도 이미 정의됨 (`schema.ts:820-822`)
   - **이 테이블은 건드리지 않음**

3. **nexus API 라우트** (`packages/server/src/routes/workspace/nexus.ts`)
   - GET /nexus/org-data, GET /nexus/layout, PUT /nexus/layout, PATCH /nexus/agent/:id/department
   - 현재 canvasLayouts만 사용 — nexusWorkflows/nexusExecutions는 후속 스토리(17-3)에서 사용

4. **WebSocket 인프라** (`packages/server/src/ws/`)
   - `server.ts`: JWT 인증, WsClient 타입, clientMap
   - `channels.ts`: handleSubscription (7개 채널), broadcastToChannel, broadcastToCompany
   - `@corthex/shared`의 WsChannel 타입으로 채널 타입 안전성 보장

5. **기존 WsChannel 7개**: chat-stream, agent-status, notifications, messenger, activity-log, strategy-notes, night-job

### 스키마 정의 위치 & 컨벤션

- 테이블 정의: `schema.ts` 맨 아래 (canvasLayouts 다음, relations 블록 전)
- 넘버링 컨벤션: `// === 29. nexus_workflows ===`, `// === 30. nexus_executions ===`, `// === 31. mcp_servers ===`
- relations 정의: 기존 relations 블록 뒤에 추가 (canvasLayoutsRelations 다음)
- import: `pgTable`, `uuid`, `varchar`, `text`, `boolean`, `jsonb`, `timestamp` — 이미 import됨
- FK 참조: `references: () => companies.id`, `references: () => users.id`, `references: () => nexusWorkflows.id`

### WebSocket nexus 채널 패턴 (agent-status와 동일)

```ts
case 'nexus': {
  const targetCompanyId = id || client.companyId
  if (targetCompanyId !== client.companyId) {
    ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN', channel }))
    return
  }
  client.subscriptions.add(`nexus::${client.companyId}`)
  break
}
```

UX 스펙 이벤트 페이로드:
```ts
// broadcastToCompany(companyId, 'nexus', { type: 'nexus-updated', updatedBy, updatedAt })
// 수신 시 클라이언트: GET /nexus/graph 재호출 + fitView() 재실행
```

### 마이그레이션 0019와의 정확한 일치 확인

반드시 아래 SQL과 Drizzle 정의의 컬럼명/타입이 1:1 일치하는지 확인:
- `nexus_workflows`: id, company_id, name(varchar 200), description(text), nodes(jsonb default []), edges(jsonb default []), is_template(bool default false), is_active(bool default true), created_by, created_at, updated_at
- `nexus_executions`: id, company_id, workflow_id, status(varchar 20 default 'running'), result(jsonb), started_at, completed_at
- `mcp_servers`: id, company_id, name(varchar 100), url(text), transport(varchar 20 default 'stdio'), config(jsonb), is_active(bool default true), created_at, updated_at

### Project Structure Notes

```
packages/shared/
  src/types.ts                    <- WsChannel union에 'nexus' 추가

packages/server/
  src/
    db/
      schema.ts                   <- nexusWorkflows, nexusExecutions, mcpServers + relations 추가
    ws/
      channels.ts                 <- nexus 채널 핸들러 추가
```

### References

- [Source: packages/server/src/db/migrations/0019_wandering_sally_floyd.sql] — nexus_workflows, nexus_executions, mcp_servers CREATE TABLE SQL
- [Source: packages/server/src/db/schema.ts:597-610] — canvasLayouts 테이블 (기존 NEXUS 레이아웃)
- [Source: packages/server/src/ws/channels.ts] — WebSocket 채널 구독 + 브로드캐스트
- [Source: packages/shared/src/types.ts:151-158] — WsChannel 타입 (현재 7개)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:958-968] — P4 WebSocket nexus-updated 이벤트 페이로드
- [Source: packages/server/src/routes/workspace/nexus.ts] — 기존 nexus API (org-data, layout)

### Previous Story Intelligence (16-6)

- 마이그레이션 최신: 0028_messenger-file-attach.sql (새 마이그레이션 불필요)
- 인라인 컴포넌트 패턴 유지
- TEA 87건 통과, turbo build 8/8 success
- 커밋 패턴: `feat: Story X-Y 한글제목 — 핵심내용 + TEA N건`

### Git Intelligence

Recent commits:
- `82df90c` docs: Epic 16 회고 완료
- `3d1ee02` feat: Story 16-6 메신저 파일 첨부 — TEA 87건
- `428399c` feat: Story 16-5 메신저 모바일 PWA — TEA 172건

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: nexusWorkflows pgTable + nexusWorkflowsRelations 추가 (11 컬럼, 마이그레이션 0019와 정확히 일치)
- Task 2: nexusExecutions pgTable + nexusExecutionsRelations 추가 (7 컬럼, workflowId FK)
- Task 3: mcpServers pgTable + mcpServersRelations 추가 (9 컬럼, transport default 'stdio')
- Task 4: WsChannel union에 'nexus' 추가 (7→8개 채널)
- Task 5: channels.ts에 nexus case 추가 (companyId 기반, agent-status 패턴)
- Task 6: turbo build type-check 8/8 success, 1943 unit tests pass (37 new)

### File List

- packages/server/src/db/schema.ts (수정 — nexusWorkflows, nexusExecutions, mcpServers + relations)
- packages/shared/src/types.ts (수정 — WsChannel에 'nexus' 추가)
- packages/server/src/ws/channels.ts (수정 — nexus 채널 구독 핸들러)
- packages/server/src/__tests__/unit/p4-db-schema-ws.test.ts (신규 — 37 tests)
- packages/server/src/__tests__/unit/p4-db-schema-ws-tea.test.ts (신규 — TEA 57 tests)
- packages/server/src/__tests__/unit/p4-db-schema-ws-qa.test.ts (신규 — QA 27 tests)
- _bmad-output/implementation-artifacts/sprint-status.yaml (수정 — 스토리 상태 업데이트)
- _bmad-output/test-artifacts/tea-17-1-summary.md (신규 — TEA 요약)
