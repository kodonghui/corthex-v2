---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-03-14'
lastStep: 8
inputDocuments:
  - _bmad-output/planning-artifacts/tools-integration/prd.md
  - _bmad-output/planning-artifacts/tools-integration/product-brief.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/context-snapshots/tools/prd-step11-snapshot.md
workflowType: 'architecture-extension'
project_name: 'corthex-v2-tool-integration'
user_name: 'ubuntu'
date: '2026-03-14'
baseArchitecture: 'D1–D21, E1–E10'
partyModeRounds: 0
---

# Architecture Decision Document (Extension)

_CORTHEX v2 — Tool Integration: 18 New Built-in Tools + MCP Server Infrastructure_

---

> **⚠️ EXTENSION ARCHITECTURE — CRITICAL READING NOTE**
>
> This document **extends** the base architecture at `_bmad-output/planning-artifacts/architecture.md` (D1–D21, E1–E10).
> - New decisions start at **D22**. All D1–D21 remain in effect unchanged.
> - New patterns start at **E11**. All E1–E10 remain in effect unchanged.
> - Any new decision that touches existing patterns (e.g., E2 Hook pipeline, E3 getDB) calls out the **extension point explicitly** — it does NOT override the base rule.
> - Do NOT contradict base decisions. When base decisions conflict with new requirements, the resolution is listed as a new decision (D22+).

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements (41개, 8 Capability Areas):**

| FR 영역 | FR 수 | Phase | 아키텍처 영향 |
|---------|------|-------|------------|
| FR-CM: Credential Management | 6 | 1 | `credentials` 테이블 AES-256 암호화 + RESOLVE 단계 + compound unique index |
| FR-TA: Agent Tool Assignment | 4 | 1 | `agents.allowed_tools JSONB` 확장 + `/admin/agents/{id}/tools` + Workers MCP 정책(D22) |
| FR-MCP: MCP Server Management | 6 | 1 | `mcp_server_configs` + `agent_mcp_access` + 8단계 Manual MCP Pattern + SIGTERM/SIGKILL lifecycle |
| FR-DP: Document Processing | 4 | 1(DP1~2), 2(DP3~4) | Puppeteer/Chromium 풀(D24) + fonts-noto-cjk Docker + Claude Vision OCR Phase 2 |
| FR-RM: Report Management | 6 | 1 | `reports` 테이블 + save_report 부분 실패 계약(E15) + `/admin/reports` + `/reports` |
| FR-CP: Content Publishing & Media | 9 | 1(CP1~2), 2(CP3~9) | Tistory Open API + Cloudflare R2 S3 SDK + marked npm + Phase 2 소셜 미디어 |
| FR-WD: Web Data Acquisition | 3 | 1(WD1), 2(WD2), 3(WD3) | Jina Reader HTTP 래퍼 (API 키 불필요) + Phase 2 Firecrawl + Phase 3 CLI-Anything |
| FR-SO: Security & Observability | 7 | 1 | credential-scrubber 확장(D28) + `tool_call_events` 테이블 + run_id 기반 E2E 측정 |

**Non-Functional Requirements (5 영역, 20개 NFR — 아키텍처 영향 요약):**

| NFR 영역 | 핵심 아키텍처 영향 |
|---------|---------------|
| NFR-P: Performance | md_to_pdf p95 <10s(1p)/<20s(10p), read_web_page p95 <8s, MCP warm start <3s(Notion)/<5s(Playwright) |
| NFR-S: Security | AES-256 암호화(D23), credential-scrubber 100% 커버리지(D28), MCP env 최소 권한, company_id 격리 |
| NFR-R: Reliability | Typed error 전용(TOOL_/AGENT_ prefix), save_report 부분 실패 비롤백, MCP SIGTERM→5s→SIGKILL |
| NFR-SC: Scalability | Puppeteer ≤10 concurrent (D24), tool_call_events 인덱스 3종(D29), compose_video async Phase 3 |
| NFR-I: Integration | MCP transport 유연 파싱, Admin 연결 테스트 3-way handshake 검증, send_email 첨부파일 사전 검증 |

**Scale & Complexity:**

- Primary domain: AI Agent Orchestration (primary) + Marketing Automation (secondary) + Business Intelligence (tertiary)
- Complexity level: **High (31/40)** — external_dependency 5/5, auth_security 5/5, architecture_change 5/5 최고점 3개 축
- Project context: Brownfield (Epic 1–15 완료 운영 시스템 위에 Tool Layer 추가)
- Estimated new architectural components: ~30개 (새 파일 30개, 기존 3개 수정)
- **M-a 주석:** PRD frontmatter `db_schema_change: 4`는 PRD 작성 시점(4개 테이블 예상) 기준. Architecture phase에서 `mcp_lifecycle_events`(FR-SO3) + `tool_call_events`(FR-SO2 telemetry) 2개가 추가되어 **Phase 1 실제 테이블 = 6개**. PRD 복잡도 점수(4/5)는 재평가 시 5/5로 상향 가능. 이 문서의 결정들은 6개 테이블 기준으로 설계됨.

### Technical Constraints & Dependencies

| 제약 | 영향 | 대응 결정 |
|------|------|---------|
| ARM64 24GB VPS, Puppeteer ~200MB/인스턴스 | 동시 Chromium ≤10개 (실질 ≤5개 권장 시작) | D24: p-queue 기반 풀, 5개 초기 한도 |
| `messages.create()` 엔진(D17, Epic 15) | Native `mcpServers` 파라미터 미지원 → Manual Pattern 필수 | E12: 8단계 RESOLVE→TEARDOWN |
| E8 경계: engine/ 공개 API = agent-loop.ts + types.ts | MCP 통합 코드는 engine/mcp/ 내부에만 위치 | engine/mcp/ 신규 서브디렉토리 |
| D4 Hook 파이프라인 순서(보안 먼저) | credential-scrubber가 MCP 도구 출력에도 반드시 적용 | D28: 세션 시작 시 credential 목록 로드 |
| Bun runtime — Node.js child_process 호환 | `child_process.spawn()`은 Bun에서 동작하지만 MCP cold start npm 다운로드 시간 주의 | D26: lazy spawn + **120s** cold start timeout / warm start SLA 3–5s |
| `getDB(companyId)` 전용 접근(E3, D1) | **6개** 신규 테이블 전부 getDB() 확장으로만 접근 | E3 확장점: 신규 테이블 메서드 추가 |
| Zod v4 (기존 aarch64) | 신규 DB 스키마에 drizzle-zod 동일 적용 | 의존성 변경 없음 |
| CI/CD 동일 서버 — 배포 중 CPU 감소 | Puppeteer 풀 배포 중 일시 용량 감소 가능 | 배포 시간대 Puppeteer max 50% 하향 고려 |

### Cross-Cutting Concerns Identified

**1. Credential Lifecycle (자격증명 생명주기)**
- Admin 등록 → AES-256 암호화 DB 저장 → RESOLVE 단계 복호화 → MCP env 주입 → credential-scrubber 스캔 → 세션 종료 후 메모리 해제
- 3개 레이어 관통: DB 레이어(암호화 저장), 엔진 레이어(RESOLVE 복호화 + env 주입), Hook 레이어(scrubber 스캔)
- company_id × key_name 격리: 타 company credential이 구조적으로 접근 불가

**2. MCP Process Lifecycle (MCP 프로세스 생명주기)**
- 에이전트 세션 시작 → SPAWN → 세션 중 EXECUTE 반복 → 세션 종료 → TEARDOWN (SIGTERM→5s→SIGKILL)
- agent-loop.ts가 SessionContext 종료 시점을 확정하므로 MCP Manager도 agent-loop.ts가 직접 관리
- Zombie process 방지: 세션 종료 후 30s 초과 생존 프로세스 감지 → Admin 알림

**3. tool_call_events 텔레메트리 (Audit Backbone)**
- 모든 도구 호출(빌트인 + MCP)에서 시작/종료 타임스탬프 기록
- run_id: 파이프라인 E2E 측정 + Pipeline Go/No-Go Gate SQL의 핵심 (`SELECT ... WHERE run_id = $1 GROUP BY run_id HAVING COUNT(*) >= 2`)
- company_id 기반 3종 인덱스: 성능 보장(Phase 2 Audit Log UI) + 격리 강제

**4. Puppeteer Pool 공유 상태 (Single-process 내)**
- Bun 서버 단일 프로세스 내 공유 Chromium 인스턴스 풀
- p-queue maxConcurrency 5 → 큐 대기 30s 초과 → `TOOL_RESOURCE_UNAVAILABLE: puppeteer` 즉시 반환
- 빌트인 도구들(md_to_pdf, generate_card_news Phase 2)이 동일 풀 공유

**5. allowed_tools + MCP Access 이중 게이트 (E8 강제)**
- Gate 1: `agents.allowed_tools` JSONB — 빌트인 도구 engine-level 강제(기존 tool-permission-guard Hook)
- Gate 2: `agent_mcp_access` 테이블 — MCP 서버별 접근 engine-level 강제(신규 mcp-manager.ts)
- 두 게이트 모두 Soul 레이어 우회 구조적 불가 (E8 경계 내에서만 체크 수행)

**6. 에러 코드 확장 (D3 기반)**
- 기존 TOOL_/AGENT_ prefix 체계(D3, architecture.md) 위에 도구 전용 에러 코드 추가
- 신규: `TOOL_NOT_ALLOWED`, `TOOL_EXTERNAL_SERVICE_ERROR`, `TOOL_QUOTA_EXHAUSTED`, `TOOL_RESOURCE_UNAVAILABLE`, `TOOL_TIMEOUT`, `TOOL_CREDENTIAL_INVALID`, `AGENT_MCP_CREDENTIAL_MISSING`, `AGENT_MCP_SPAWN_TIMEOUT`, `CREDENTIAL_TEMPLATE_UNRESOLVED`
  - `TOOL_CREDENTIAL_INVALID`: 빌트인 도구의 외부 API 키 만료/오류 (Tistory, R2 등)
  - `AGENT_MCP_SPAWN_TIMEOUT`: MCP 서버 cold start 120s 초과 (D26)
  - `AGENT_MCP_CREDENTIAL_MISSING`: MCP env 크레덴셜 미등록 또는 RESOLVE 단계 실패

### PRD Deferred Decisions — Architecture Phase 해결 항목

다음 7개 항목은 PRD 단계에서 미결로 남긴 Architecture phase 결정 사항이며, 이 문서에서 D22–D29로 해결한다:

| PRD D# | 결정 항목 | 해결 결정 |
|--------|---------|---------|
| PRD-D1 | Workers MCP access: hard block vs. configurable default | → **D22**: configurable default (기본값 OFF, Admin 명시 부여 가능) |
| PRD-D2 | AES-256 키 관리: env var vs. KMS | → **D23**: Phase 1 env var (`CREDENTIAL_ENCRYPTION_KEY`), Phase 4+ KMS deferred |
| PRD-D3 + D4 | Puppeteer 풀 크기 + 초과 요청 처리 방식 | → **D24**: 풀 5개 초기 한도 + p-queue 30s timeout → 즉시 거부 |
| PRD-D6 | MCP transport 어댑터 설계 | → **D25**: Phase 1 stdio 구현, sse/http는 `TOOL_MCP_TRANSPORT_UNSUPPORTED` fallback |
| PRD-D7 | Notion MCP cold start 전략 | → **D26**: lazy spawn, warm start SLA ≤3s(Notion)/≤5s(Playwright), cold start timeout 120s (npm 다운로드 포함) |
| PRD-D9 | credential-scrubber MCP 출력 적용 여부 | → **D28**: 세션 시작 시 company credentials 로드 → 모든 PostToolUse(빌트인+MCP) 100% 스캔 |
| PRD-D12 | google_drive 채널 Phase 불일치 | → **D27**: Phase 4로 확정 (Google Workspace MCP 의존 — Phase 4 Roadmap 기준) |
| PRD-D8 | tool_call_events 추가 인덱스 여부 | → **D29**: 3종 인덱스 확정 — `(company_id, started_at DESC)` + `(company_id, agent_id, started_at DESC)` + `(company_id, tool_name, started_at DESC)` + `(run_id)` |

*PRD-D5(compose_video 동시 렌더 수), PRD-D10(Replicate 지출 한도), PRD-D11(고비용 도구 과금 분리)는 각각 Phase 3/Phase 2/Phase 2 시점에 해결 예정.*

---

## Starter Template Evaluation

### Primary Technology Domain

**Brownfield Feature Expansion** — CORTHEX v2 Turborepo 모노레포 위에 Tool Layer를 증분 추가. 새 스타터 불필요. 기존 스택 전면 재사용.

### Existing Technology Stack (불변)

기존 architecture.md의 Starter Template Evaluation 섹션(D1–D21)과 동일. 변경 없음.

| 항목 | 선택 | 비고 |
|------|------|------|
| Monorepo | Turborepo | packages/admin, app, ui, shared, server |
| Runtime | Bun | MCP child_process.spawn() Bun 호환 확인 필요 (Phase 1 의존성 검증 Story) |
| Backend | Hono | 기존 라우트 패턴 그대로 확장 |
| DB | PostgreSQL + Drizzle ORM | 6개 신규 테이블 Phase 1 (drizzle-kit migrate) |
| AES-256 암호화 | Bun 내장 `crypto` (Web Crypto API) | 외부 패키지 불필요 — `crypto.subtle.encrypt/decrypt` AES-GCM |
| Test | bun:test | 신규 도구 핸들러 단위 테스트 동일 전략(D10) |

### New Dependencies — Phase 1

| 패키지 | 버전 | 용도 | 위치 |
|--------|------|------|------|
| `puppeteer` | `22.x` (ARM64 Chromium 번들 포함) | md_to_pdf PDF 렌더링 | packages/server |
| `p-queue` | `8.x` (ESM, Bun 호환 확인 필수) | Puppeteer 인스턴스 풀 큐잉 | packages/server/src/lib/ |
| `@aws-sdk/client-s3` | `3.x` (exact pin) | Cloudflare R2 S3 호환 업로드 (`upload_media`) | packages/server |
| `marked` | `12.x` | markdown → HTML 변환 (`publish_tistory`) | packages/server |

> **ARM64 Puppeteer 주의사항:** `puppeteer` 패키지는 ARM64용 Chromium을 자동 다운로드. Dockerfile COPY에 `puppeteer` 캐시 경로 추가 필요. 대안: `puppeteer-core` + 시스템 Chromium 경로 지정 (Docker Layer 캐시 최적화 목적 — 의존성 검증 Story에서 양쪽 벤치마크 후 결정).

> **p-queue ESM 호환성:** `p-queue@8.x`는 순수 ESM 패키지. Bun은 ESM을 네이티브 지원하므로 호환 예상되나, 의존성 검증 Story에서 `import PQueue from 'p-queue'` 동작 확인 필수. 실패 시 대안: `async-sema` (CommonJS 호환 semaphore 구현).

### New DB Tables — Phase 1 스키마 (Drizzle ORM)

**`credentials` 테이블 (FR-CM1~6, NFR-S1):**

```typescript
// packages/server/src/db/schema/credentials.ts
export const credentials = pgTable('credentials', {
  id:             uuid('id').primaryKey().defaultRandom(),
  companyId:      text('company_id').notNull().references(() => companies.id),
  keyName:        text('key_name').notNull(),              // e.g., 'tistory_access_token'
  encryptedValue: text('encrypted_value').notNull(),       // AES-256-GCM: base64(iv):base64(ciphertext+authTag)
  // S2 fix: FR-CM6 audit 필드 — 별도 audit log 테이블 없이 인라인 기록
  createdByUserId: text('created_by_user_id'),             // Admin 사용자 ID (FR-CM6)
  updatedByUserId: text('updated_by_user_id'),             // 마지막 수정자 (FR-CM6)
  createdAt:      timestamp('created_at').defaultNow(),
  updatedAt:      timestamp('updated_at').defaultNow(),
}, (t) => ({
  uniqueCompanyKey: unique().on(t.companyId, t.keyName),   // NFR-S4: 동일 company 중복 key 불가
}));
// FR-CM6 구현 경로: credentials CRUD 라우트에서 ctx.userId를 createdByUserId/updatedByUserId로 자동 기록.
// 삭제 감사는 tool_call_events의 error_code='CREDENTIAL_DELETED' 패턴으로 대체 (D3 에러 코드 체계 확장).
```

**`mcp_server_configs` 테이블 (FR-MCP1~3, NFR-I3):**

```typescript
// packages/server/src/db/schema/mcp-server-configs.ts
export const mcpServerConfigs = pgTable('mcp_server_configs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   text('company_id').notNull().references(() => companies.id),
  displayName: text('display_name').notNull(),
  transport:   text('transport').notNull(),                // 'stdio' | 'sse' | 'http'
  command:     text('command'),                            // e.g., 'npx' (stdio only)
  args:        jsonb('args').default([]),                  // e.g., ['-y', '@notionhq/notion-mcp-server']
  env:         jsonb('env').default({}),                   // e.g., {'NOTION_TOKEN': '{{credential:notion_integration_token}}'}
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});
```

**`agent_mcp_access` 테이블 (FR-MCP2, D22):**

```typescript
// packages/server/src/db/schema/agent-mcp-access.ts
export const agentMcpAccess = pgTable('agent_mcp_access', {
  agentId:      uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  mcpServerId:  uuid('mcp_server_id').notNull().references(() => mcpServerConfigs.id, { onDelete: 'cascade' }),
  grantedAt:    timestamp('granted_at').defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.agentId, t.mcpServerId] }),
}));
// M-b: cross-company isolation TEA 필수 테스트 케이스 (TEA Story 단계 flagging):
//   1. companyA의 agentId가 companyB의 mcp_server_config를 getMcpServersForAgent()로 조회 → 빈 배열 반환 확인
//   2. companyA의 Admin이 companyB의 mcp_server_id를 agent_mcp_access에 직접 INSERT → FK cascade로 차단 확인
//   3. getDB(companyA).getMcpServersForAgent(agentId)가 WHERE companyId = companyA로 필터링되어 companyB 행 미반환 확인
```

**`reports` 테이블 (FR-RM1~4, NFR-R2):**

```typescript
// packages/server/src/db/schema/reports.ts
export const reports = pgTable('reports', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  companyId:           text('company_id').notNull().references(() => companies.id),
  agentId:             uuid('agent_id').references(() => agents.id),
  runId:               text('run_id').notNull(),           // FR-SO2: 파이프라인 추적
  title:               text('title').notNull(),
  content:             text('content').notNull(),          // markdown 원문
  type:                text('type'),                       // 'weekly_report', 'competitor_analysis', etc.
  tags:                jsonb('tags').default([]),
  distributionResults: jsonb('distribution_results'),      // {web_dashboard: 'success', pdf_email: 'failed'}
  createdAt:           timestamp('created_at').defaultNow(),
}, (t) => ({
  idxCompanyDate: index('reports_company_date').on(t.companyId, t.createdAt),
}));
```

**`tool_call_events` 테이블 (FR-SO2, NFR-SC3, Pipeline Gate SQL):**

```typescript
// packages/server/src/db/schema/tool-call-events.ts
export const toolCallEvents = pgTable('tool_call_events', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   text('company_id').notNull().references(() => companies.id),   // S1 fix: FK 추가
  agentId:     uuid('agent_id'),
  runId:       text('run_id').notNull(),                   // Pipeline Gate: GROUP BY run_id HAVING COUNT(*)>=2
  toolName:    text('tool_name').notNull(),
  startedAt:   timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  success:     boolean('success'),
  errorCode:   text('error_code'),
  durationMs:  integer('duration_ms'),
}, (t) => ({
  // PRD D8 → D29: 3종 인덱스 확정
  idxCompanyDate:      index('tce_company_date').on(t.companyId, t.startedAt),
  idxCompanyAgentDate: index('tce_company_agent_date').on(t.companyId, t.agentId, t.startedAt),
  idxCompanyToolDate:  index('tce_company_tool_date').on(t.companyId, t.toolName, t.startedAt),
  idxRunId:            index('tce_run_id').on(t.runId),   // Pipeline Gate SQL 최적화
}));
```

**`mcp_lifecycle_events` 테이블 (FR-SO3, NFR-R3 — C2 fix: 6번째 테이블 추가):**

```typescript
// packages/server/src/db/schema/mcp-lifecycle-events.ts
export const mcpLifecycleEvents = pgTable('mcp_lifecycle_events', {
  id:          uuid('id').primaryKey().defaultRandom(),
  companyId:   text('company_id').notNull().references(() => companies.id),
  mcpServerId: uuid('mcp_server_id').references(() => mcpServerConfigs.id),
  sessionId:   text('session_id').notNull(),               // SessionContext.sessionId — 세션 단위 추적
  event:       text('event').notNull(),                    // 'spawn'|'init'|'discover'|'execute'|'teardown'|'error'
  latencyMs:   integer('latency_ms'),                      // NFR-P2 warm start 측정 소스
  errorCode:   text('error_code'),                         // e.g., 'AGENT_MCP_CREDENTIAL_MISSING'
  createdAt:   timestamp('created_at').defaultNow(),
}, (t) => ({
  idxCompanyMcp:    index('mle_company_mcp').on(t.companyId, t.mcpServerId, t.createdAt),
  idxSession:       index('mle_session').on(t.sessionId),  // NFR-R3 zombie process 30s 감지용
}));
// NFR-R3 zombie process 감지: SELECT * FROM mcp_lifecycle_events
//   WHERE event != 'teardown' AND created_at < NOW() - INTERVAL '30 seconds'
//   AND session_id NOT IN (SELECT session_id WHERE event = 'teardown') → Admin 알림
```

**`content_calendar` 테이블 (Phase 2 — 스키마 사전 정의, Phase 2 migration에 포함):**

```typescript
// packages/server/src/db/schema/content-calendar.ts (Phase 2)
export const contentCalendar = pgTable('content_calendar', {
  id:              uuid('id').primaryKey().defaultRandom(),
  companyId:       text('company_id').notNull().references(() => companies.id),
  platform:        text('platform').notNull(),             // 'tistory' | 'instagram' | 'x' | 'youtube'
  contentType:     text('content_type').notNull(),         // 'blog_post' | 'carousel' | 'video' | 'tweet'
  topic:           text('topic'),
  status:          text('status').notNull().default('idea'), // idea|scripted|produced|scheduled|published
  assignedAgentId: uuid('assigned_agent_id').references(() => agents.id),
  scheduledAt:     timestamp('scheduled_at'),
  publishedAt:     timestamp('published_at'),
  createdAt:       timestamp('created_at').defaultNow(),
  updatedAt:       timestamp('updated_at').defaultNow(),
});
```

### Package Placement — New Files

```
packages/server/src/
├── engine/
│   ├── agent-loop.ts              [MODIFY: RESOLVE 단계 + MCP merge 통합]
│   ├── types.ts                   [MODIFY: McpSession, ToolCallContext 타입 추가]
│   ├── hooks/
│   │   └── credential-scrubber.ts [MODIFY: D28 — 세션 시작 시 credentials 로드, MCP 출력 포함]
│   └── mcp/                       [NEW — E8 적용: engine 내부 전용]
│       ├── mcp-manager.ts         [NEW: SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN]
│       │                          [M4: SpawnFn 주입 인터페이스 포함 — bun:test에서 mock spawn 주입 가능]
│       │                          [     type SpawnFn = (cmd: string, args: string[], env: Record<string,string>) => ChildProcess]
│       ├── mcp-transport.ts       [NEW: MCP transport interface (stdio/sse/http 추상화)]
│       └── transports/
│           └── stdio.ts           [NEW: child_process.spawn() stdio 구현 — Phase 1만 활성]
│
├── lib/
│   ├── credential-crypto.ts       [NEW: AES-256-GCM encrypt/decrypt (D23)]
│   ├── puppeteer-pool.ts          [NEW: p-queue maxConcurrency:5 인스턴스 풀 (D24)]
│   └── tool-cache.ts              [EXISTING — unchanged (D18, Epic 15)]
│
├── tool-handlers/
│   └── builtins/
│       ├── call-agent.ts          [EXISTING — unchanged]
│       ├── md-to-pdf.ts           [NEW: Puppeteer 풀 + corporate/minimal/default CSS preset]
│       ├── save-report.ts         [NEW: reports DB + 다중 채널 배포 + 부분 실패 계약(E15)]
│       ├── list-reports.ts        [NEW: company 스코프 reports 조회]
│       ├── get-report.ts          [NEW: ID 기반 단일 보고서 조회]
│       ├── publish-tistory.ts     [NEW: Tistory Open API + marked markdown→HTML]
│       ├── upload-media.ts        [NEW: Cloudflare R2 S3 SDK 업로드]
│       └── read-web-page.ts       [NEW: Jina Reader r.jina.ai/{url} fetch 래퍼]
│
├── db/
│   └── schema/
│       ├── credentials.ts         [NEW]
│       ├── mcp-server-configs.ts  [NEW]
│       ├── agent-mcp-access.ts    [NEW]
│       ├── reports.ts             [NEW]
│       ├── tool-call-events.ts    [NEW]
│       ├── mcp-lifecycle-events.ts [NEW: C2 fix — FR-SO3 MCP lifecycle telemetry]
│       └── content-calendar.ts    [NEW: Phase 2 migration용 사전 정의]
│
└── routes/
    └── admin/
        ├── credentials.ts         [NEW: CRUD + masked list]
        ├── mcp-servers.ts         [NEW: CRUD + connection test]
        ├── agent-tools.ts         [NEW: allowed_tools 체크박스 toggle]
        └── reports.ts             [NEW: Admin 보고서 조회]
    └── workspace/
        └── reports.ts             [NEW: Human read-only 보고서 조회]
```

**신규 파일 수: 30개 (engine 3개 수정 포함) — mcp-lifecycle-events.ts 추가로 +1, mcp-manager.ts SpawnFn 인터페이스 포함**

### getDB() Extension Points (E3 확장)

```typescript
// packages/server/src/db/scoped-query.ts — 신규 메서드 추가 (기존 메서드 불변)
export function getDB(companyId: string) {
  // === EXISTING methods (D1, E3 — 변경 없음) ===
  // agents(), departments(), tierConfigs(), knowledgeDocs(), ...

  // === NEW: Tool Integration Phase 1 ===

  // Credentials
  listCredentials: () =>
    db.select({ id: credentials.id, keyName: credentials.keyName, updatedAt: credentials.updatedAt })
      .from(credentials).where(eq(credentials.companyId, companyId)),
      // 주의: encryptedValue 제외 — Admin UI 마스킹 표시용 (S4: scrubber는 아래 별도 메서드 사용)
  // S4 fix (D28): credential-scrubber.ts 전용 — encryptedValue 포함 후 복호화하여 평문 스캔
  listCredentialsForScrubber: async () => {
    const rows = await db.select({ keyName: credentials.keyName, encryptedValue: credentials.encryptedValue })
      .from(credentials).where(eq(credentials.companyId, companyId));
    return Promise.all(rows.map(async r => ({
      keyName: r.keyName,
      plaintext: await decrypt(r.encryptedValue),   // credential-crypto.ts decrypt
    })));
  },
  getCredential: (keyName: string) =>
    db.select().from(credentials)
      .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName)))
      .limit(1),
  // S2 fix: FR-CM6 — userId 파라미터로 audit 필드 자동 기록
  insertCredential: (data: Omit<NewCredential, 'companyId' | 'createdByUserId' | 'updatedByUserId'>, userId: string) =>
    db.insert(credentials).values({ ...data, companyId, createdByUserId: userId, updatedByUserId: userId }),
  updateCredential: (keyName: string, encryptedValue: string, userId: string) =>
    db.update(credentials).set({ encryptedValue, updatedAt: new Date(), updatedByUserId: userId })
      .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName))),
  deleteCredential: (keyName: string) =>
    db.delete(credentials)
      .where(and(eq(credentials.companyId, companyId), eq(credentials.keyName, keyName))),
    // FR-CM6 삭제 감사: 호출부(credentials route)에서 삭제 직전 keyName을 audit log에 기록
    // (DB row가 삭제된 후에는 조회 불가 → route 레벨에서 audit insertMcpLifecycleEvent/logCredentialEvent 호출)

  // MCP Server Configs
  listMcpServers: () =>
    db.select().from(mcpServerConfigs)
      .where(and(eq(mcpServerConfigs.companyId, companyId), eq(mcpServerConfigs.isActive, true))),
  getMcpServersForAgent: (agentId: string) =>
    db.select({ mcp: mcpServerConfigs }).from(agentMcpAccess)
      .innerJoin(mcpServerConfigs, eq(agentMcpAccess.mcpServerId, mcpServerConfigs.id))
      .where(and(
        eq(agentMcpAccess.agentId, agentId),
        eq(mcpServerConfigs.companyId, companyId),   // C1 fix: cross-tenant 격리 필수
        eq(mcpServerConfigs.isActive, true),
      )),
      // 보안 체인: agent → agent_mcp_access → mcp_server_configs.companyId = companyId 강제 검증

  // Reports
  listReports: (filters?: { type?: string; agentId?: string; tags?: string[] }) =>
    db.select({ id: reports.id, title: reports.title, type: reports.type,
                tags: reports.tags, createdAt: reports.createdAt, agentId: reports.agentId })
      .from(reports).where(eq(reports.companyId, companyId))
      .orderBy(desc(reports.createdAt)),
  getReport: (id: string) =>
    db.select().from(reports)
      .where(and(eq(reports.id, id), eq(reports.companyId, companyId)))
      .limit(1),
  insertReport: (data: Omit<NewReport, 'companyId'>) =>
    db.insert(reports).values({ ...data, companyId }).returning({ id: reports.id }),
  // S5 fix (E15): save_report 채널 배포 결과 JSONB 업데이트
  updateReportDistribution: (id: string, distributionResults: Record<string, string>) =>
    db.update(reports).set({ distributionResults })
      .where(and(eq(reports.id, id), eq(reports.companyId, companyId))),

  // Tool Call Events (write-only for engine; read via admin route)
  insertToolCallEvent: (data: Omit<NewToolCallEvent, 'companyId'>) =>
    db.insert(toolCallEvents).values({ ...data, companyId }),

  // MCP Lifecycle Events (FR-SO3, NFR-R3 — C2 fix)
  insertMcpLifecycleEvent: (data: Omit<NewMcpLifecycleEvent, 'companyId'>) =>
    db.insert(mcpLifecycleEvents).values({ ...data, companyId }),
  // zombie process 감지 쿼리 (NFR-R3: sessionId 기준 teardown 누락 세션 조회)
  getActiveMcpSessions: (olderThanSeconds: number) =>
    db.select({ sessionId: mcpLifecycleEvents.sessionId, mcpServerId: mcpLifecycleEvents.mcpServerId })
      .from(mcpLifecycleEvents)
      .where(and(
        eq(mcpLifecycleEvents.companyId, companyId),
        eq(mcpLifecycleEvents.event, 'spawn'),
        lt(mcpLifecycleEvents.createdAt, sql`NOW() - INTERVAL '${olderThanSeconds} seconds'`),
        notExists(
          db.select().from(mcpLifecycleEvents).where(and(
            eq(mcpLifecycleEvents.sessionId, sql`outer.session_id`),
            eq(mcpLifecycleEvents.event, 'teardown'),
          ))
        )
      )),
}
```

### Dependency Verification — Phase 1 Additional Checklist

기존 아키텍처(architecture.md) Phase 1 의존성 검증 Story에 다음 항목 추가:

| 항목 | 검증 방법 | 실패 시 대안 |
|------|---------|-----------|
| `puppeteer@22.x` ARM64 Chromium 번들 설치 | `bun add puppeteer && bun --eval "import puppeteer from 'puppeteer'; const b = await puppeteer.launch(); await b.close(); console.log('OK')"` | `puppeteer-core` + 시스템 Chromium (`/usr/bin/chromium-browser`) |
| `p-queue@8.x` ESM import | `import PQueue from 'p-queue'` Bun 실행 | `async-sema` 패키지 (CJS 호환) |
| `@aws-sdk/client-s3@3.x` ARM64 Bun 호환 | R2 endpoint PUT 테스트 (실제 버킷 불필요 — presigned URL 생성만 확인) | `aws4fetch` 경량 S3 클라이언트 |
| `marked@12.x` ESM | `import { marked } from 'marked'; marked('# test')` | `micromark` 또는 `@md-to/html` |
| Bun `crypto.subtle` AES-GCM | `crypto.subtle.generateKey + encrypt + decrypt` round-trip 테스트 | `node:crypto` (Bun은 Node.js crypto도 지원) |
| MCP child_process.spawn() stdio pipe | Notion MCP PoC — `npx -y @notionhq/notion-mcp-server` 실행 + JSON-RPC initialize 3-way handshake 완성 | Phase 1 MCP 범위를 엔진만으로 축소, Phase 1.5로 분리 |
| Dockerfile `fonts-noto-cjk` 설치 | `docker build` + `md_to_pdf` 한국어 텍스트 렌더링 확인 (PDF에 두부/깨진 글자 없음) | `fonts-noto` (cjk 아닌 기본) → 한국어 일부 글꼴 대체 |

### Code Disposition Matrix — Tool Integration 추가 항목

기존 Code Disposition Matrix(architecture.md)에 다음 항목 추가:

| 파일 | 처분 | 시점 | 비고 |
|------|------|------|------|
| `services/publish-instagram.ts` (기존) | **리팩토링** | Phase 2 | `tool-handlers/builtins/publish-instagram.ts`로 이전, `upload_media` 의존성 추가 |
| `engine/hooks/credential-scrubber.ts` | **수정** | Phase 1 | D28: 세션 시작 credentials 사전 로드 추가 — 기존 scrubber 로직 불변 |
| `engine/agent-loop.ts` | **수정** | Phase 1 | RESOLVE 단계 + MCP mcp-manager 통합 추가 — 기존 SessionContext/Hook 로직 불변 |
| `engine/types.ts` | **수정** | Phase 1 | `McpSession`, `ToolCallContext`, `BuiltinToolHandler` 타입 추가 |
| `Dockerfile` | **수정** (M1 fix) | Phase 1 | `fonts-noto-cjk` APT 설치 추가 (한국어 PDF 렌더링); Puppeteer Chromium 캐시 경로 COPY 추가; `~/.cache/puppeteer` → `/root/.cache/puppeteer` Docker layer 캐싱 |
| `tool-handlers/builtins/send-email.ts` (기존) | **수정** (M3 fix) | Phase 1 | NFR-I4: `attachments: [{filename, content, encoding: 'base64'}]` MIME multipart 지원 검증 + 필요 시 업그레이드 — `save_report(pdf_email)` 구현의 **선행 조건** |

---

## Core Architectural Decisions

> **확장 아키텍처 결정 규칙:** 아래 D22–D29는 기존 D1–D21을 _확장_한다. D1–D21과 충돌하는 경우 해당 확장 결정이 어떻게 기존 결정의 범위 내에서 작동하는지 명시한다.

### 결정 요약 테이블 (D22–D29)

| 결정 | 핵심 항목 | 선택 결정 | 근거 |
|------|---------|---------|------|
| D22 | Workers MCP 접근 정책 | **Configurable default OFF** — Admin 명시 부여 시 허용 | 이중 게이트(allowed_tools + agent_mcp_access) 구조적 격리 보장 |
| D23 | AES-256 키 관리 | **Phase 1 env var** `CREDENTIAL_ENCRYPTION_KEY`, Phase 4+ KMS deferred | 단일 서버 Phase 1에서 KMS 불필요. credential-crypto.ts 내부만 교체 시 전환 가능 |
| D24 | Puppeteer 풀 설정 | **p-queue maxConcurrency:5, 30s 큐 대기 timeout** → TOOL_RESOURCE_UNAVAILABLE | ARM64 ~200MB/인스턴스 × 5 = 1GB. 대기 무제한 시 에이전트 hang 위험 |
| D25 | MCP transport 레이어 | **Phase 1 stdio 전용**; sse/http → TOOL_MCP_TRANSPORT_UNSUPPORTED | interface 선행 정의로 Phase 2 sse 추가 비용 최소화 |
| D26 | MCP cold start 전략 | **lazy spawn** + cold start 120s timeout + warm start SLA ≤3s/≤5s | pre-warm은 미사용 MCP에도 리소스 낭비. npm CDN 불안정 포함 120s |
| D27 | google_drive 채널 Phase | **Phase 4 확정** — Google Workspace MCP 의존 | Phase 1 Google OAuth 플로우 없음. Phase 4 MCP 통합 시 일관성 유지 |
| D28 | credential-scrubber 범위 | **빌트인+MCP 출력 100% 스캔** — 세션 시작 시 credentials 전체 로드 | D4 Hook 순서(보안 먼저) 확장. MCP가 credential을 echo할 위험 구조적 차단 |
| D29 | tool_call_events 인덱스 | **3종 compound 인덱스 + run_id 인덱스** | Phase 2 Audit Log UI + Pipeline Gate SQL 직접 의존. 초기 설계 필수 |

### 결정 우선순위 분류

**Critical Decisions (구현 착수 전 필수):**
- D22: Workers MCP 정책 → `agent_mcp_access` 테이블 + getMcpServersForAgent() companyId WHERE 절
- D23: 암호화 키 관리 → CREDENTIAL_ENCRYPTION_KEY env var 미설정 시 서버 시작 실패 처리
- D28: scrubber 범위 → credential-scrubber.ts 세션 시작 credentials 로드 로직 수정

**Important Decisions (아키텍처 형성):**
- D24: Puppeteer 풀 → p-queue 도입 + 30s timeout 전략
- D25: MCP transport → mcp-transport.ts interface + stdio 구현
- D26: cold start → lazy spawn + 120s timeout + SLA 측정 시스템
- D29: 인덱스 → Phase 1 마이그레이션에 포함 (Phase 2 전 미리 정의)

**Deferred Decisions (Post-Phase 1):**
- D27: google_drive → Phase 4 (E15 채널 정의에 반영)
- PRD-D5: compose_video 동시 렌더 수 → Phase 3
- PRD-D10: Replicate 지출 한도 → Phase 2
- PRD-D11: 고비용 도구 과금 분리 → Phase 2

---

### D22: Workers MCP Access Policy

> **PRD Deferred Decision:** PRD-D1

| 항목 | 내용 |
|------|------|
| **Context** | CORTHEX v2는 Human Staff(관리자/직원)과 AI Workers(에이전트) 두 유형의 "조직원"이 있다. PRD-D1은 AI Workers 에이전트도 Admin이 MCP 서버 접근 권한을 부여받을 수 있어야 하는지 결정을 요구했다. |
| **Options** | A) Hard block: Workers 에이전트 = MCP 접근 절대 불가 (타입 레벨 강제)<br>B) Configurable default: 기본값 OFF, Admin이 agent_mcp_access 테이블에 명시적 부여 시 허용<br>C) 모든 에이전트 허용: 권한 구분 없음 |
| **Decision** | **B) Configurable default — 기본값 OFF** |
| **Rationale** | Hard block(A)은 "AI 스태프의 도구 자율 사용" 비전(PRD Innovation 섹션)에 반한다. 이미 이중 게이트(Cross-Cutting Concern 5: allowed_tools Gate 1 + agent_mcp_access Gate 2)가 구조적으로 미승인 MCP 접근을 차단한다. 모든 허용(C)은 멀티테넌트 격리 위험. Configurable default는 보안성(기본 차단)과 유연성(명시적 부여) 모두 만족. |
| **Consequences** | `agent_mcp_access` 테이블에 `(agent_id, mcp_server_id)` 행이 없으면 Workers 에이전트는 MCP 도구 호출 불가. getMcpServersForAgent()에 companyId WHERE 절 필수(C1 fix 반영). Admin UI에 에이전트별 MCP 서버 접근 토글 필요. |

---

### D23: AES-256 Credential Encryption Key Management

> **PRD Deferred Decision:** PRD-D2

| 항목 | 내용 |
|------|------|
| **Context** | credentials 테이블의 `encrypted_value`는 AES-256-GCM으로 암호화되어 저장된다(NFR-S1). 암호화 키 자체를 어디에 보관할 것인가 — env var, AWS KMS, HashiCorp Vault 중 선택 필요. |
| **Options** | A) env var `CREDENTIAL_ENCRYPTION_KEY` (32바이트 hex 256-bit)<br>B) AWS KMS — 키 자체는 AWS 관리, API 호출로 encrypt/decrypt<br>C) HashiCorp Vault — 별도 Vault 서버 운영 |
| **Decision** | **A) Phase 1 env var `CREDENTIAL_ENCRYPTION_KEY`, Phase 4+ KMS deferred** |
| **Rationale** | Phase 1 단일 서버 환경에서 KMS/Vault는 추가 인프라 비용과 네트워크 지연을 야기한다. NFR-S1(AES-256 암호화) 요구사항은 env var로도 완전히 충족된다. `credential-crypto.ts` 내부에서만 키를 사용하므로, Phase 4 KMS 전환 시 해당 모듈 내부만 교체하면 된다(D21 Redis 전환과 동일 패턴). |
| **Consequences** | `CREDENTIAL_ENCRYPTION_KEY` env var 미설정 시 서버 시작 실패 처리 필수(`credential-crypto.ts` 초기화 시점 검증). 키 로테이션은 Phase 4 KMS 도입 시까지 수동 운영(신규 키 배포 + 기존 credentials 재암호화 스크립트 필요). 키 값은 로그/에러 메시지에 절대 노출 금지. |

**Phase 1 구현 세부 사항:**

```typescript
// packages/server/src/lib/credential-crypto.ts
const KEY_HEX = process.env.CREDENTIAL_ENCRYPTION_KEY;
if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error('CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
}
const KEY = Buffer.from(KEY_HEX, 'hex');

// AES-256-GCM: base64(iv):base64(ciphertext+authTag) 형식 (Web Crypto API 출력 포맷)
export async function encrypt(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));  // 96-bit IV
  const cryptoKey = await crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ['encrypt']);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey,
    new TextEncoder().encode(plaintext));
  // ciphertext 마지막 16바이트 = authTag (Web Crypto API AES-GCM 자동 포함)
  return Buffer.from(iv).toString('base64') + ':' + Buffer.from(ciphertext).toString('base64');
}

export async function decrypt(stored: string): Promise<string> {
  const [ivB64, ciphertextB64] = stored.split(':');
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  const cryptoKey = await crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ['decrypt']);
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(plaintext);
}
```

---

### D24: Puppeteer Instance Pool Configuration

> **PRD Deferred Decisions:** PRD-D3, PRD-D4

| 항목 | 내용 |
|------|------|
| **Context** | ARM64 24GB VPS에서 Chromium 인스턴스는 약 200MB/개를 소비한다. `md_to_pdf` 동시 요청 처리를 위해 풀 관리 전략 필요. 동시 요청 초과 시 거부 또는 대기 정책 결정 필요. |
| **Options** | A) 풀 없음: 요청마다 spawn/close → 높은 cold start 지연 + 메모리 급증<br>B) p-queue 5개 + 무제한 대기 → 요청 hang 위험<br>C) p-queue maxConcurrency:5 + 30s timeout → TOOL_RESOURCE_UNAVAILABLE 즉시 반환 |
| **Decision** | **C) p-queue maxConcurrency:5 + 30s 큐 대기 timeout → TOOL_RESOURCE_UNAVAILABLE** |
| **Rationale** | Chromium 5개 = ~1GB (24GB VPS에서 안전). 무제한 대기(B)는 에이전트 파이프라인 hang 위험 — NFR-R1(에러 코드 명시 반환)에 반한다. 30s 후 즉시 거부가 에러 코드 체계(D3 확장: TOOL_RESOURCE_UNAVAILABLE)와 일치. 동시에 `generate_card_news`(Phase 2)도 동일 풀 공유하므로 초기 보수적 설정 필요. |
| **Consequences** | 6번째 동시 `md_to_pdf` 요청은 30s 큐 대기 후 `TOOL_RESOURCE_UNAVAILABLE: puppeteer_pool_timeout` 반환. Phase 2에서 실측치 기반 maxConcurrency 조정(최대 10개까지 권장). CI/CD 배포 중 풀 용량 50% 하향(`MAX_PUPPETEER_CONCURRENCY` env var 동적 조정 고려). |

---

### D25: MCP Transport Layer Design

> **PRD Deferred Decision:** PRD-D6

| 항목 | 내용 |
|------|------|
| **Context** | MCP 서버는 stdio, SSE, HTTP 세 가지 transport를 지원한다. Phase 1에서 모두 구현할지, stdio만 구현할지 결정 필요. 동시에 transport 추상화 인터페이스 설계 결정 필요. |
| **Options** | A) stdio만 구현 (인터페이스 없음) — Phase 2에서 전체 재설계 위험<br>B) transport interface 정의 + stdio Phase 1 구현. sse/http 요청 시 에러 코드 반환<br>C) stdio+sse 동시 구현 — Phase 1 범위 과부하 |
| **Decision** | **B) `mcp-transport.ts` interface 정의 + stdio Phase 1 구현 활성. sse/http → TOOL_MCP_TRANSPORT_UNSUPPORTED** |
| **Rationale** | interface 선행 정의로 Phase 2 sse 추가 비용이 인터페이스 구현체 추가 수준으로 최소화된다. stdio는 Notion MCP(`npx -y @notionhq/notion-mcp-server`), Playwright MCP 등 표준 MCP 서버의 기본 transport. A)는 Phase 2에서 전체 재설계 위험이 크다. |
| **Consequences** | `mcp_server_configs.transport = 'sse'` 저장은 가능하지만 Phase 1에서 실행 불가. Admin UI "연결 테스트" 버튼은 sse/http에 대해 TOOL_MCP_TRANSPORT_UNSUPPORTED 반환 + 사용자 안내 메시지 표시 필요. Phase 2 sse 구현 시 `transports/sse.ts` 파일 추가만으로 완성. |

**Transport Interface:**

```typescript
// packages/server/src/engine/mcp/mcp-transport.ts
export interface McpTransport {
  send(message: JsonRpcRequest): Promise<JsonRpcResponse>;
  close(): Promise<void>;
  readonly sessionId: string;
}

export type McpTransportType = 'stdio' | 'sse' | 'http';

export function createMcpTransport(
  config: McpServerConfig,
  spawnFn: SpawnFn,   // M4: TEA testability 주입
): McpTransport {
  switch (config.transport) {
    case 'stdio': return new StdioTransport(config, spawnFn);
    case 'sse':
    case 'http':
      throw new ToolError('TOOL_MCP_TRANSPORT_UNSUPPORTED',
        `MCP transport '${config.transport}' is not supported in Phase 1. Use 'stdio'.`);
    default:
      throw new ToolError('TOOL_MCP_TRANSPORT_UNSUPPORTED', `Unknown transport: ${config.transport}`);
  }
}
```

---

### D26: MCP Server Cold Start Strategy

> **PRD Deferred Decision:** PRD-D7

| 항목 | 내용 |
|------|------|
| **Context** | Notion MCP 서버(`npx -y @notionhq/notion-mcp-server`)는 첫 실행 시 npm 패키지 다운로드로 10–30초가 소요된다. 이 cold start를 에이전트 세션 대비 언제 실행할지 전략 필요. warm start SLA 별도 정의 필요. |
| **Options** | A) pre-warm: 서버 시작 시 모든 활성 MCP 서버 spawn — 미사용 MCP에도 리소스 낭비<br>B) eager spawn: 에이전트 세션 시작 시 할당된 MCP 서버 모두 spawn<br>C) lazy spawn: 첫 MCP 도구 호출 시 spawn. cold start 지연은 해당 호출에서만 발생 |
| **Decision** | **C) lazy spawn + cold start timeout 120s + warm start SLA ≤3s(Notion)/≤5s(Playwright)** |
| **Rationale** | pre-warm(A)은 MCP 미사용 에이전트도 cold start 비용 부담. eager spawn(B)은 MCP 서버가 없는 세션에도 지연 노출. lazy spawn은 실제 사용 시점에만 비용 지불. 120s는 npm CDN 불안정 + ARM64 환경(컴파일 시간 추가) 최악 케이스 포함. warm start SLA는 mcp_lifecycle_events.latency_ms로 측정. |
| **Consequences** | 동일 세션 내 **첫 번째** MCP 도구 호출만 cold start 지연(최대 120s). 이후 호출은 기존 프로세스 재사용(warm start SLA). 120s 초과 시 `AGENT_MCP_SPAWN_TIMEOUT` 에러 코드 반환 + mcp_lifecycle_events에 `event='error'` 기록. mcp-manager.ts에서 세션별 McpSession 캐시 유지(lazy spawn 결과 재사용). |

---

### D27: google_drive Channel Phase Assignment

> **PRD Deferred Decision:** PRD-D12

| 항목 | 내용 |
|------|------|
| **Context** | `save_report` 도구는 여러 채널에 보고서를 배포할 수 있다. PRD-D12는 `google_drive` 채널의 Phase 불일치를 지적했다 — PRD의 일부 섹션은 Phase 1을, 로드맵은 Phase 4를 가리켰다. |
| **Options** | A) Phase 1 구현 — Google Drive REST API 직접 호출 (별도 OAuth 구현 필요)<br>B) Phase 2 구현 — 다른 소셜 채널과 함께<br>C) Phase 4 — Google Workspace MCP 서버 의존 (MCP 인프라 성숙 후) |
| **Decision** | **C) Phase 4 확정** |
| **Rationale** | Google Drive 쓰기는 Google Workspace OAuth 플로우(서비스 계정 또는 사용자 OAuth)가 필요하다. Phase 1에는 Google OAuth 인프라가 없고, 직접 구현은 별도 scope 관리가 필요하다. Phase 4에서 Google Workspace MCP 서버를 도입하면 `save_report`의 `google_drive` 채널이 해당 MCP를 통해 자연스럽게 통합된다. 아키텍처 일관성 우선. |
| **Consequences** | `save_report` Phase 1 채널: `web_dashboard`, `pdf_email`. Phase 2: `notion` (Notion MCP). Phase 4: `google_drive`. E15(Partial Failure Contract Pattern)에 채널별 Phase 레이블 반영. Admin UI 채널 선택 시 Phase 4 미구현 안내 필요. PRD FR-RM1 채널 목록 그대로 반영: web_dashboard/pdf_email(P1), notion/notebooklm(P2), google_drive(P4). |

---

### D28: Credential Scrubber Coverage Extension

> **PRD Deferred Decision:** PRD-D9

| 항목 | 내용 |
|------|------|
| **Context** | 기존 `credential-scrubber.ts`(E2 기반)는 빌트인 도구 출력을 스캔한다. MCP 서버 도구 출력도 동일하게 스캔해야 하는지, 스캔 대상 credentials를 어디서 로드할지 결정 필요. |
| **Options** | A) 빌트인 도구 출력만 스캔 — MCP 출력 미스캔 위험<br>B) 세션 시작 시 company credentials 전체 로드 → 모든 PostToolUse(빌트인+MCP) 100% 스캔<br>C) 각 도구 호출마다 credentials DB 조회 → DB 부하 |
| **Decision** | **B) 세션 시작 시 company credentials 전체 로드 → PostToolUse 100% 스캔** |
| **Rationale** | MCP 서버는 외부 서비스 응답을 그대로 도구 출력에 포함할 수 있다 — 외부 서비스가 credential 값을 echo하거나 오류 메시지에 포함할 위험이 있다. D4 Hook 파이프라인 순서(보안 먼저)의 확장이므로 의도에 부합. C)는 credential 수 × 도구 호출 수 = DB 과부하. B)는 세션 시작 1회 로드 후 메모리 캐시. |
| **Consequences** | `credential-scrubber.ts` 수정: `init(ctx)` 메서드 추가, 세션 시작 시 `getDB(companyId).listCredentialsForScrubber()` 호출 → 복호화된 평문 값 목록 로드(스캔 대상). `listCredentials()`는 encryptedValue 의도적 제외(Admin UI용) — scrubber는 별도 메서드 `listCredentialsForScrubber()` 사용 필수. scrubbing 비용: O(credential_count × response_length) — Phase 1 규모 무시 가능. 세션 종료 시 메모리 평문 목록 해제 필수(명시적 null 설정). |

---

### D29: tool_call_events Index Strategy

> **PRD Deferred Decision:** PRD-D8

| 항목 | 내용 |
|------|------|
| **Context** | `tool_call_events` 테이블은 모든 도구 호출 telemetry를 기록한다. Phase 2 Admin Audit Log UI와 Pipeline Go/No-Go Gate SQL이 이 테이블에 직접 의존한다. 인덱스 전략을 Phase 1 마이그레이션에 포함할지 결정 필요. |
| **Options** | A) 인덱스 없음 → Phase 2에서 ALTER TABLE 추가 (운영 중 잠금 위험)<br>B) company_id 단일 인덱스만<br>C) 3종 compound 인덱스 + run_id 인덱스 — Phase 1 마이그레이션에 포함 |
| **Decision** | **C) 3종 compound 인덱스 + run_id 인덱스 — Phase 1 마이그레이션 포함** |
| **Rationale** | Phase 2 Audit Log UI는 `(company_id, started_at)`, `(company_id, agent_id, started_at)`, `(company_id, tool_name, started_at)` 세 가지 조회 패턴을 모두 사용한다. Pipeline Gate SQL은 `WHERE run_id = $1` Full Scan 없이 인덱스가 필수. Phase 1에서 정의해야 Phase 2 마이그레이션 없이 바로 사용 가능. A)는 운영 중 대용량 테이블 ALTER TABLE은 Lock 위험. |
| **Consequences** | 4개 인덱스 Phase 1 마이그레이션 포함. `drizzle-kit generate` 출력에 4개 CREATE INDEX 포함 확인 필요. Pipeline Go/No-Go Gate SQL: `SELECT run_id, COUNT(*) as tool_count FROM tool_call_events WHERE run_id = $1 GROUP BY run_id HAVING COUNT(*) >= 2` — run_id 인덱스로 O(log n) 보장. |

---

### PRD Deferred Decisions — 전체 해결 현황

| PRD D# | 결정 항목 | 해결 결정 | 상태 |
|--------|---------|---------|------|
| PRD-D1 | Workers MCP access 정책 | **D22**: configurable default OFF | ✅ 해결 |
| PRD-D2 | AES-256 키 관리 | **D23**: Phase 1 env var, Phase 4+ KMS | ✅ 해결 |
| PRD-D3 | Puppeteer 풀 크기 | **D24**: p-queue maxConcurrency:5 | ✅ 해결 |
| PRD-D4 | 초과 요청 처리 | **D24**: 30s timeout → TOOL_RESOURCE_UNAVAILABLE | ✅ 해결 |
| PRD-D5 | compose_video 동시 렌더 | Phase 3 시점 결정 | ⏳ 미결 |
| PRD-D6 | MCP transport 어댑터 | **D25**: stdio Phase 1, sse/http → UNSUPPORTED | ✅ 해결 |
| PRD-D7 | Notion MCP cold start | **D26**: lazy spawn + 120s/3-5s SLA | ✅ 해결 |
| PRD-D8 | tool_call_events 인덱스 | **D29**: 3종 compound + run_id 인덱스 | ✅ 해결 |
| PRD-D9 | scrubber MCP 적용 | **D28**: 세션 시작 시 로드 + 100% 스캔 | ✅ 해결 |
| PRD-D10 | Replicate 지출 한도 | Phase 2 시점 결정 | ⏳ 미결 |
| PRD-D11 | 고비용 도구 과금 분리 | Phase 2 시점 결정 | ⏳ 미결 |
| PRD-D12 | google_drive 채널 Phase | **D27**: Phase 4 확정 | ✅ 해결 |

_9/12 해결 완료. PRD-D5/D10/D11은 각각 Phase 3/2/2 시점에 해결._

---

## Implementation Patterns & Consistency Rules

> **확장 패턴 규칙:** 아래 E11–E17은 기존 E1–E10을 _확장_한다. 기존 E1–E10 규칙이 더 구체적으로 적용되는 경우 E11+ 패턴이 우선 적용되지 않으며, 오히려 E11+는 E1–E10의 요구사항을 어떻게 도구 레이어에서 구현하는지 명시한다.

### 잠재적 충돌 지점 식별

**Tool Integration 구현에서 에이전트 간 불일치가 발생할 수 있는 영역 (7개):**

1. AES-256 암호화 포맷 — `iv:ciphertext` vs `iv:authTag:ciphertext` vs 별도 필드 분리
2. MCP 도구 이름 충돌 — built-in `read_web_page` vs MCP 서버 `read_web_page` 동일 이름
3. 빌트인 도구 핸들러 에러 반환 형식 — throw vs return string vs return object
4. save_report 부분 실패 처리 — 전체 롤백 vs 부분 성공 반환
5. Puppeteer 풀 획득/해제 — `try/finally` 누락 시 풀 고갈
6. 외부 API 에러 → ToolError 변환 패턴 — 에이전트마다 다른 에러 코드 사용 위험
7. tool_call_events 기록 타이밍 — 시작 전 INSERT vs 완료 후 INSERT

---

#### E11: Credential Encryption/Decryption Pattern

**적용 대상:** `credential-crypto.ts` 사용 모든 코드 (Admin credentials CRUD 라우트, RESOLVE 단계)

**위반 시 결과:** 암호화 포맷 불일치로 복호화 실패 → `CREDENTIAL_TEMPLATE_UNRESOLVED` 에러 + MCP 서버 인증 실패

```typescript
// ✅ CORRECT — credential-crypto.ts를 통해서만 암호화/복호화
import { encrypt, decrypt } from '@/lib/credential-crypto';

// Admin 등록 라우트
const encryptedValue = await encrypt(plaintext);
await getDB(companyId).insertCredential({ keyName, encryptedValue }, userId);

// RESOLVE 단계 (engine/agent-loop.ts)
const row = await getDB(companyId).getCredential(keyName);
if (!row) throw new ToolError('CREDENTIAL_TEMPLATE_UNRESOLVED', `Credential '${keyName}' not found`);
const plaintext = await decrypt(row.encryptedValue);
```

```typescript
// ❌ WRONG — 직접 crypto.subtle 호출 (포맷 불일치 위험)
const iv = crypto.getRandomValues(new Uint8Array(12));
const key = await crypto.subtle.importKey(...);
const ciphertext = await crypto.subtle.encrypt(...);
// 저장 형식이 credential-crypto.ts와 다를 수 있음
```

**규칙:**
- `encrypt()`/`decrypt()`는 `credential-crypto.ts`에서만 호출
- DB 저장 포맷: `base64(iv):base64(authTag+ciphertext)` — Web Crypto API AES-GCM 출력 형식
- Admin 목록 API: `encryptedValue` 필드 절대 응답에 포함 금지 (listCredentials() 마스킹 쿼리 사용)
- 복호화 실패 시 `CREDENTIAL_TEMPLATE_UNRESOLVED` 에러 코드 반환 (D3 에러 코드 체계 확장)

---

#### E12: Manual MCP Integration Pattern (8-Stage Lifecycle)

**적용 대상:** `engine/mcp/mcp-manager.ts` — 기존 E8 경계 내 engine 전용

**위반 시 결과:** D17(`messages.create()` 엔진) native mcpServers 미지원 — 패턴 미준수 시 MCP 도구 호출 불가

**배경:** Epic 15(D17)에서 messages.create() 엔진으로 전환한 결과, SDK query()의 native `mcpServers` 파라미터를 사용할 수 없다. 따라서 MCP 통합은 반드시 이 8단계 수동 패턴으로 구현해야 한다.

```
RESOLVE → SPAWN → INIT → DISCOVER → MERGE → EXECUTE → RETURN → TEARDOWN
```

```typescript
// engine/mcp/mcp-manager.ts (E8 경계 내 engine 전용)

// Stage 1: RESOLVE — credential 템플릿 치환
// {{credential:notion_integration_token}} → 복호화된 평문
async function resolveCredentials(
  envTemplate: Record<string, string>,
  companyId: string,
): Promise<Record<string, string>> {
  const resolved: Record<string, string> = {};
  for (const [key, value] of Object.entries(envTemplate)) {
    const match = value.match(/^\{\{credential:(.+)\}\}$/);
    if (match) {
      const row = await getDB(companyId).getCredential(match[1]);
      if (!row) throw new ToolError('AGENT_MCP_CREDENTIAL_MISSING', `Credential '${match[1]}' not found`);
      resolved[key] = await decrypt(row.encryptedValue);
    } else {
      resolved[key] = value;
    }
  }
  return resolved;
}

// Stage 2: SPAWN — lazy spawn (첫 도구 호출 시, D26)
// Stage 3: INIT — JSON-RPC initialize 3-way handshake
// Stage 4: DISCOVER — tools/list 캐싱 (세션 내 재사용)
// Stage 5: MERGE — 발견된 MCP 도구 목록을 messages.create() tools 배열에 통합
// Stage 6: EXECUTE — LLM이 MCP 도구 호출 시 해당 MCP 서버로 JSON-RPC 전달
// Stage 7: RETURN — MCP 서버 결과 → ContentBlock으로 변환 → messages.create() 다음 메시지에 포함
// Stage 8: TEARDOWN — 세션 종료 시 SIGTERM→5s→SIGKILL

export interface McpSession {
  readonly sessionId: string;
  readonly mcpServerId: string;
  transport: McpTransport;
  tools: ToolDefinition[];       // DISCOVER 결과 캐시
  spawnedAt: number;
  lastUsedAt: number;
}

// MCP 도구 이름 충돌 해결 (E12 핵심 규칙)
// PRD FR-MCP4: 네임스페이스 포맷 = "{displayName}__{toolName}" (더블언더스코어)
// e.g., Notion MCP의 create_page → "notion__create_page"
// UUID 대신 displayName 사용: LLM이 읽을 수 있는 사람 친화적 이름
function mergeMcpTools(
  builtinTools: ToolDefinition[],
  mcpTools: ToolDefinition[],
  mcpServerDisplayName: string,   // UUID 아닌 display_name 사용
): ToolDefinition[] {
  // 더블언더스코어(__) 구분자: 콜론(:)은 도구명 내부에서도 사용될 수 있어 파싱 충돌 위험
  const namespace = mcpServerDisplayName.toLowerCase().replace(/\s+/g, '_');
  const namespacedMcpTools = mcpTools.map(t => ({
    ...t,
    name: `${namespace}__${t.name}`,   // e.g., "notion__create_page"
  }));
  return [...builtinTools, ...namespacedMcpTools];
}
```

**규칙:**
- 8단계 순서 엄수 — SPAWN 없이 EXECUTE 불가, INIT 없이 DISCOVER 불가
- MCP 도구 이름: `{displayName}__{original_tool_name}` 더블언더스코어 네임스페이스 필수 (PRD FR-MCP4, built-in 동명 충돌 방지, LLM 가독성)
- TEARDOWN: agent-loop.ts `finally` 블록에서 `mcpManager.teardownAll(sessionId)` 직접 호출 후 Stop Hook 실행. D4 Stop Hook = cost-tracker 전용이므로 TEARDOWN을 Stop Hook에 추가하지 않고 finally 블록에서 독립 수행.
- TEARDOWN timeout 상수: `const SIGTERM_TIMEOUT_MS = 5000` (mcp-manager.ts 상수 정의) — SIGTERM 전송 후 5000ms 이내 프로세스 미종료 시 SIGKILL
- 각 단계에서 mcp_lifecycle_events INSERT 필수 (E17 참조)
- SpawnFn 주입 인터페이스: `type SpawnFn = (cmd: string, args: string[], env: Record<string,string>) => ChildProcess` — bun:test에서 mock spawn 주입

---

#### E13: Built-in Tool Handler Pattern

**적용 대상:** `tool-handlers/builtins/` 하위 모든 파일

**위반 시 결과:** 에러 처리/응답 형식 불일치 → LLM이 도구 결과를 잘못 파싱하거나 에러를 성공으로 오인

```typescript
// packages/server/src/tool-handlers/builtins/[tool-name].ts
import type { BuiltinToolHandler } from '@/engine/types';
import { ToolError } from '@/lib/tool-error';

export const handler: BuiltinToolHandler = {
  // 도구 이름은 snake_case, PRD FR과 동일
  name: 'read_web_page',

  // Zod 스키마 — 입력 검증 (drizzle-zod 패턴과 동일)
  schema: z.object({
    url: z.string().url(),
  }),

  // execute: 성공 시 string, 실패 시 ToolError throw
  execute: async (input, ctx) => {
    // 1. 입력 검증 (schema.parse는 engine에서 호출 — 여기서 중복 불필요)
    // 2. E17: tool_call_events INSERT (시작)
    // 3. 핵심 로직
    // 4. E17: tool_call_events UPDATE (완료)
    // 5. 결과 반환: string (LLM에게 전달될 텍스트)
    const result = await fetchJinaReader(input.url);
    return result;  // string 반환
  },
};

// ❌ WRONG: BuiltinToolHandler interface를 구현하지 않는 함수 직접 export
export async function readWebPage(url: string) { ... }

// ❌ WRONG: throw Error (ToolError 아닌 일반 에러)
throw new Error('fetch failed');

// ✅ CORRECT: throw ToolError (D3 에러 코드 체계)
throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', 'Jina Reader returned 429', { retryAfter: 60 });
```

**규칙:**
- 모든 빌트인 핸들러는 `BuiltinToolHandler` interface 구현
- 에러는 반드시 `ToolError` throw (일반 `Error` 금지) — 에러 코드: `TOOL_/AGENT_` prefix 체계(D3)
- 성공 반환값: `string` (LLM이 읽을 수 있는 텍스트) 또는 `Record<string,unknown>` (JSON stringified)
- `ctx.companyId`를 직접 사용하지 않고 반드시 `getDB(ctx.companyId)` 패턴 사용 (E3)
- 파일명: `kebab-case.ts` (CLAUDE.md 규칙 준수)

---

#### E14: Puppeteer Pool Acquisition Pattern

**적용 대상:** `md_to_pdf`, `generate_card_news`(Phase 2) — Puppeteer 풀 사용 모든 핸들러

**위반 시 결과:** `try/finally` 누락 시 에러 발생 후 release 미실행 → 풀 고갈 → 이후 모든 md_to_pdf 30s 후 TOOL_RESOURCE_UNAVAILABLE

```typescript
// packages/server/src/lib/puppeteer-pool.ts
import PQueue from 'p-queue';
import puppeteer, { Browser } from 'puppeteer';

const POOL_TIMEOUT_MS = 30_000;  // D24: 30s 큐 대기 timeout

// 싱글톤 — Bun 단일 프로세스 내 공유
let pool: PQueue | null = null;
let browsers: Browser[] = [];

export async function withPuppeteer<T>(
  fn: (browser: Browser) => Promise<T>
): Promise<T> {
  if (!pool) throw new ToolError('TOOL_RESOURCE_UNAVAILABLE', 'Puppeteer pool not initialized');

  return pool.add(async () => {
    const browser = await acquireBrowser();
    try {
      return await fn(browser);
    } finally {
      await releaseBrowser(browser);  // 반드시 실행 (에러 발생 시에도)
    }
  }, { timeout: POOL_TIMEOUT_MS }) as Promise<T>;
  // M4 fix: pool.add() timeout → p-queue AbortError → withPuppeteer wrapper에서 직접 TOOL_RESOURCE_UNAVAILABLE throw
  // (E16 callExternalApi 범위 밖 — Puppeteer pool timeout은 외부 API 에러 아님)
}
```

```typescript
// ✅ CORRECT — withPuppeteer 래퍼 사용
export const handler: BuiltinToolHandler = {
  name: 'md_to_pdf',
  execute: async (input, ctx) => {
    return withPuppeteer(async (browser) => {
      const page = await browser.newPage();
      // ... PDF 렌더링
      return pdfBase64;
    });
  },
};

// ❌ WRONG — 직접 launch/close (풀 우회)
const browser = await puppeteer.launch();
try { ... } finally { await browser.close(); }  // 풀 maxConcurrency 무시
```

**규칙:**
- Puppeteer 직접 launch 금지 — 반드시 `withPuppeteer()` 래퍼 사용
- `withPuppeteer` 내부에서 Page 생성/닫기는 허용 (Browser 닫기 금지)
- 초기화: 서버 시작 시 `initPuppeteerPool(concurrency: number)` 1회 호출

---

#### E15: save_report Partial Failure Contract Pattern

**적용 대상:** `save-report.ts` 핸들러 — 다중 채널 배포 로직

**위반 시 결과:** 채널 하나 실패 시 전체 롤백 → 성공한 채널도 취소 → LLM이 실패 이유 파악 불가

```typescript
// packages/server/src/tool-handlers/builtins/save-report.ts

// 부분 실패 계약: 성공한 채널 유지 + 실패 채널 에러 코드 병렬 반환
type ChannelResult =
  | { status: 'success'; channel: string }
  | { status: 'failed'; channel: string; error: string };

export const handler: BuiltinToolHandler = {
  name: 'save_report',
  execute: async (input, ctx) => {
    // 1. reports 테이블에 INSERT (단일 트랜잭션 — 실패 시 전체 중단)
    const report = await getDB(ctx.companyId).insertReport({
      title: input.title,
      content: input.content,
      type: input.report_type,
      runId: ctx.runId,
      agentId: ctx.agentId,
    });

    // 2. 채널 배포 — 병렬 실행, 부분 실패 허용
    const channelResults = await Promise.allSettled(
      (input.channels ?? ['web_dashboard']).map(channel =>
        distributeToChannel(report.id, input.content, channel, ctx)
      )
    );

    // 3. 결과 집계
    const results: ChannelResult[] = channelResults.map((r, i) => {
      const channel = input.channels?.[i] ?? 'web_dashboard';
      return r.status === 'fulfilled'
        ? { status: 'success', channel }
        : { status: 'failed', channel, error: r.reason?.code ?? 'UNKNOWN' };
    });

    // 4. distributionResults JSONB 업데이트
    const distributionResults = Object.fromEntries(
      results.map(r => [r.channel, r.status === 'success' ? 'success' : r.error])
    );
    await getDB(ctx.companyId).updateReportDistribution(report.id, distributionResults);

    // 5. LLM 응답: 부분 실패 포함 전체 결과 반환
    const successCount = results.filter(r => r.status === 'success').length;
    return JSON.stringify({
      reportId: report.id,
      summary: `Report saved. ${successCount}/${results.length} channels succeeded.`,
      channels: results,
    });
    // ❌ 전체 실패가 아닌 한 throw 금지 (부분 성공 = 성공)
  },
};

// save_report channels Phase 정의 (D27 — PRD FR-RM1 기준)
// Phase 1: web_dashboard, pdf_email
// Phase 2: notion, notebooklm  (Notion MCP 채널)
// Phase 4: google_drive         (Google Workspace MCP)
```

**규칙:**
- `reports` DB INSERT 실패만 전체 실패 (`throw ToolError`)
- 채널 배포 실패는 부분 실패 — `Promise.allSettled` 사용 (절대 `Promise.all` 사용 금지)
- 성공한 채널은 취소/롤백 없음
- 결과는 반드시 `distributionResults` JSONB에 기록
- LLM에게 성공/실패 채널 상세 전달 (에이전트가 재시도 결정 가능하도록)

---

#### E16: External API Typed Error Pattern

**적용 대상:** 외부 API 호출 모든 빌트인 핸들러 (`publish_tistory`, `upload_media`, `read_web_page` 등)

**위반 시 결과:** 에이전트마다 다른 에러 코드 사용 → 프론트엔드 에러 처리 불일치 + D3 에러 코드 체계 파괴

```typescript
// ✅ CORRECT — 외부 API 에러를 ToolError로 변환하는 어댑터 패턴
async function callExternalApi<T>(
  apiName: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (err: unknown) {
    // HTTP 상태코드 기반 에러 코드 매핑
    if (err instanceof Response || (err as any).status) {
      const status = (err as any).status ?? 500;
      if (status === 401 || status === 403)
        // TOOL_CREDENTIAL_INVALID: 빌트인 도구 외부 API 키 만료/오류
        // AGENT_MCP_CREDENTIAL_MISSING은 MCP spawn context 전용 — 빌트인 도구에 사용 금지
        throw new ToolError('TOOL_CREDENTIAL_INVALID', `${apiName}: auth failed (${status}). Check API credential in Admin settings.`);
      if (status === 429)
        throw new ToolError('TOOL_QUOTA_EXHAUSTED', `${apiName}: rate limit exceeded`);
      if (status >= 500)
        throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', `${apiName}: server error (${status})`);
    }
    throw new ToolError('TOOL_EXTERNAL_SERVICE_ERROR', `${apiName}: ${(err as Error).message}`);
  }
}

// 사용 예 (publish_tistory.ts)
const result = await callExternalApi('Tistory API', () =>
  fetch(`https://www.tistory.com/apis/post/write`, { method: 'POST', ... })
);
```

**에러 코드 매핑 (D3 확장):**

| 외부 에러 | ToolError 코드 | 의미 |
|---------|--------------|------|
| 401/403 | `TOOL_CREDENTIAL_INVALID` | 빌트인 도구 API 키 만료/오류 (Tistory, R2 등) — Admin credentials 확인 필요 |
| 429 | `TOOL_QUOTA_EXHAUSTED` | Rate limit 초과 |
| 4xx (기타) | `TOOL_EXTERNAL_SERVICE_ERROR` | 요청 오류 (잘못된 파라미터 등) |
| 5xx | `TOOL_EXTERNAL_SERVICE_ERROR` | 외부 서비스 일시 불가 |
| 네트워크 에러 | `TOOL_TIMEOUT` | DNS/연결 실패 |
| _MCP RESOLVE 실패_ | `AGENT_MCP_CREDENTIAL_MISSING` | MCP env 크레덴셜 미등록 (E16 범위 외 — E12 RESOLVE 단계 전용) |
| _Puppeteer pool timeout_ | `TOOL_RESOURCE_UNAVAILABLE` | E14 withPuppeteer wrapper 직접 throw (E16 범위 외) |

**규칙:**
- 외부 API 직접 try/catch 금지 — 반드시 `callExternalApi` 어댑터 사용
- 에러 메시지에 API 키/토큰 값 절대 포함 금지 (credential-scrubber가 잡더라도 원칙 준수)
- 원본 에러는 서버 로그에만 기록, LLM 응답에는 ToolError.message만 노출

---

#### E17: Tool Call Telemetry Pattern

**적용 대상:** `tool-handlers/builtins/` 모든 핸들러 + engine MCP execute 단계

**위반 시 결과:** 시작 시점 기록 없이 완료만 기록하면 `durationMs = null` → Pipeline Gate SQL `COUNT(*)` 부정확 + Phase 2 성능 분석 불가

```typescript
// ✅ CORRECT — 시작 INSERT → 핵심 로직 → 완료 UPDATE 패턴
export const handler: BuiltinToolHandler = {
  name: 'read_web_page',
  execute: async (input, ctx) => {
    // E17 Step 1: 시작 기록 (완료 이전에 INSERT)
    const startTime = Date.now();  // M2 fix: startTime 선언 (durationMs 계산용)
    const eventId = await getDB(ctx.companyId).insertToolCallEvent({
      agentId: ctx.agentId,
      runId: ctx.runId,
      toolName: 'read_web_page',
      startedAt: new Date(),
    });

    try {
      // 핵심 로직
      const result = await callExternalApi('Jina Reader',
        () => fetch(`https://r.jina.ai/${input.url}`)
          .then(r => r.text())
      );

      // E17 Step 2: 성공 완료 기록
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: true,
        durationMs: Date.now() - startTime,
      });

      return result;

    } catch (err) {
      // E17 Step 3: 실패 완료 기록 (throw 이전에)
      await getDB(ctx.companyId).updateToolCallEvent(eventId, {
        completedAt: new Date(),
        success: false,
        errorCode: err instanceof ToolError ? err.code : 'TOOL_EXTERNAL_SERVICE_ERROR',
        durationMs: Date.now() - startTime,
      });
      throw err;  // 에러는 engine으로 전파
    }
  },
};

// ❌ WRONG: 완료 시에만 INSERT (durationMs 계산 불가, 실패 시 기록 누락)
await insertToolCallEvent({ ..., success: true, durationMs: elapsed });

// ❌ WRONG: MCP tool_call_events 기록 누락 (E12 EXECUTE 단계에도 E17 필수)
```

**Pipeline Go/No-Go Gate SQL (D29 run_id 인덱스 활용):**

```sql
-- Phase 1 Pipeline 완료 검증 쿼리 (예: reports agent run 검증)
SELECT
  run_id,
  COUNT(*) as tool_count,
  SUM(CASE WHEN success = true THEN 1 ELSE 0 END) as success_count,
  MAX(completed_at) - MIN(started_at) as total_duration
FROM tool_call_events
WHERE run_id = $1
GROUP BY run_id
HAVING COUNT(*) >= 2 AND SUM(CASE WHEN success = false THEN 1 ELSE 0 END) = 0;
-- 결과 없음 = Pipeline 미완료 또는 실패 존재
```

**규칙:**
- INSERT: 핵심 로직 실행 **이전** (started_at 정확성)
- UPDATE: 성공/실패 **양쪽** 경로에서 모두 실행 (catch 블록 필수)
- MCP 도구 호출도 동일하게 기록 (E12 EXECUTE 단계에서 E17 패턴 적용)
- `ctx.runId`는 agent-loop.ts에서 SessionContext에 자동 주입 (핸들러에서 생성 금지)

---

### Enforcement Guidelines

**All AI Agents (구현 에이전트) MUST:**

1. **E11**: `credential-crypto.ts` 외부에서 `crypto.subtle` 직접 암호화 사용 금지
2. **E12**: MCP 도구 이름에 `{displayName}__` 더블언더스코어 네임스페이스 필수 (PRD FR-MCP4, 콜론 구분자 사용 금지)
3. **E13**: `BuiltinToolHandler` interface 구현, `ToolError`만 throw
4. **E14**: Puppeteer 직접 launch 금지, `withPuppeteer()` 래퍼 필수
5. **E15**: `save_report` 채널 배포 `Promise.allSettled` 필수 (절대 `Promise.all` 금지)
6. **E16**: 외부 API 에러를 `callExternalApi` 어댑터로 ToolError 변환 필수
7. **E17**: tool_call_events INSERT → 로직 → UPDATE 패턴 (MCP 포함) 필수

**Pattern Verification (Code Review 체크리스트):**
- `grep -r 'crypto.subtle' src/` → `credential-crypto.ts` 외 결과 = E11 위반
- `grep -r 'puppeteer.launch(' src/` → E14 위반
- `grep -rP 'Promise\.all\(' tool-handlers/ | grep -v 'allSettled'` → E15 위반 의심 (allSettled 대신 all 사용)
- `grep -r 'new Error(' tool-handlers/` → E13 위반 (`ToolError` 사용 필수)

---

## Project Structure & Boundaries

### Document Navigation

1. Project Context Analysis (Step 2) — 41 FRs × 8영역, 20 NFRs × 5영역, PRD Deferred Decisions D22–D29 preview
2. Starter Template Evaluation (Step 3) — 6 DB 테이블 스키마, 4 신규 의존성, 30개 파일 구조, getDB() 확장
3. Core Architectural Decisions (Step 4) — D22–D29 (PRD Deferred D1/D2/D3/D4/D6/D7/D8/D9/D12 해결)
4. Implementation Patterns (Step 5) — E11–E17, 에러 코드 확장, Enforcement 체크리스트
5. **Project Structure & Boundaries (Step 6)** — 완전한 파일 트리, FR 매핑, 패턴 매핑
6. Validation (Step 7) — FR/NFR 커버리지 매트릭스, 결정 호환성, 갭 분석

---

### Complete Project Directory Structure (Tool Integration — 30개 신규 파일)

```
packages/server/src/
│
├── engine/                                [E8 경계: 공개 API = agent-loop.ts + types.ts만]
│   ├── agent-loop.ts                      [MODIFY — FR-CM, FR-MCP 전체: RESOLVE 단계 + MCP merge 통합]
│   │                                      [  E12 Stage 1(RESOLVE) + Stage 5(MERGE) + Stage 8(TEARDOWN finally 블록)]
│   │                                      [  D26 lazy spawn 호출, D28 scrubber init() 호출]
│   ├── types.ts                           [MODIFY — 신규 타입 추가]
│   │                                      [  McpSession, ToolCallContext, BuiltinToolHandler interface]
│   │                                      [  SessionContext 확장: runId 필드 추가 (E17)]
│   │
│   ├── hooks/
│   │   └── credential-scrubber.ts         [MODIFY — D28: 세션 시작 시 listCredentialsForScrubber() 로드]
│   │                                      [  init(ctx): Promise<void> 메서드 추가]
│   │                                      [  평문 목록 메모리 캐시 + 세션 종료 시 null 해제]
│   │
│   └── mcp/                               [NEW — E8 engine 내부 전용 서브디렉토리]
│       ├── mcp-manager.ts                 [NEW — E12: 8단계 RESOLVE→TEARDOWN 오케스트레이터]
│       │                                  [  FR-MCP1~6, NFR-R3 zombie 감지, D26 lazy spawn]
│       │                                  [  SpawnFn 주입 인터페이스 (TEA mock 지원)]
│       │                                  [  type SpawnFn = (cmd, args, env) => ChildProcess]
│       │                                  [  McpSession 세션별 캐시 (warm start 재사용)]
│       ├── mcp-transport.ts               [NEW — D25: McpTransport interface 정의]
│       │                                  [  createMcpTransport() factory (stdio/sse/http 분기)]
│       │                                  [  sse/http → TOOL_MCP_TRANSPORT_UNSUPPORTED]
│       └── transports/
│           └── stdio.ts                   [NEW — D25: StdioTransport implements McpTransport]
│                                          [  child_process.spawn() stdio 파이프 구현]
│                                          [  JSON-RPC initialize 3-way handshake (3s timeout)]
│                                          [  tools/list 캐싱, tools/call 실행]
│
├── lib/
│   ├── credential-crypto.ts               [NEW — E11, D23: AES-256-GCM encrypt/decrypt]
│   │                                      [  CREDENTIAL_ENCRYPTION_KEY 시작 시 검증]
│   │                                      [  저장 포맷: base64(iv):base64(ciphertext+authTag)]
│   ├── puppeteer-pool.ts                  [NEW — E14, D24: p-queue maxConcurrency:5]
│   │                                      [  withPuppeteer<T>() 래퍼 (try/finally 릴리즈)]
│   │                                      [  AbortError → TOOL_RESOURCE_UNAVAILABLE]
│   │                                      [  initPuppeteerPool(concurrency) 초기화]
│   └── tool-cache.ts                      [EXISTING — unchanged (D18, Epic 15)]
│
├── tool-handlers/
│   └── builtins/
│       ├── call-agent.ts                  [EXISTING — unchanged]
│       ├── md-to-pdf.ts                   [NEW — FR-DP1, E13, E14, E17]
│       │                                  [  E14 withPuppeteer() 래퍼 사용]
│       │                                  [  CSS preset: corporate/minimal/default]
│       │                                  [  fonts-noto-cjk 한국어 지원 (Dockerfile)]
│       ├── save-report.ts                 [NEW — FR-RM1~4, E13, E15, E17]
│       │                                  [  E15 Promise.allSettled 채널 배포]
│       │                                  [  D27 채널: P1 web_dashboard/pdf_email, P2 notion/notebooklm, P4 google_drive]
│       │                                  [  getDB().updateReportDistribution() JSONB 기록]
│       ├── list-reports.ts                [NEW — FR-RM3, E13, E17]
│       │                                  [  getDB().listReports() company 스코프 조회]
│       ├── get-report.ts                  [NEW — FR-RM3, E13, E17]
│       │                                  [  getDB().getReport(id) 단일 조회]
│       ├── publish-tistory.ts             [NEW — FR-CP1, E13, E16, E17]
│       │                                  [  E16 callExternalApi 어댑터 (TOOL_CREDENTIAL_INVALID)]
│       │                                  [  marked markdown→HTML 변환]
│       │                                  [  Tistory Open API POST /apis/post/write]
│       ├── upload-media.ts                [NEW — FR-CP2, E13, E16, E17]
│       │                                  [  @aws-sdk/client-s3 Cloudflare R2 S3 SDK]
│       │                                  [  E16 callExternalApi 어댑터]
│       └── read-web-page.ts               [NEW — FR-WD1, E13, E16, E17]
│                                          [  Jina Reader: GET https://r.jina.ai/{url}]
│                                          [  API 키 불필요 — 무인증 공개 API]
│
├── db/
│   ├── scoped-query.ts                    [MODIFY — E3 확장: 15개 신규 getDB() 메서드 추가]
│   │                                      [  listCredentials, listCredentialsForScrubber, getCredential]
│   │                                      [  insertCredential, updateCredential, deleteCredential]
│   │                                      [  listMcpServers, getMcpServersForAgent]
│   │                                      [  listReports, getReport, insertReport, updateReportDistribution]
│   │                                      [  insertToolCallEvent, insertMcpLifecycleEvent, getActiveMcpSessions]
│   └── schema/
│       ├── credentials.ts                 [NEW — FR-CM1~6, NFR-S1, D23]
│       │                                  [  AES-256-GCM encryptedValue 저장]
│       │                                  [  (company_id, key_name) unique index]
│       │                                  [  createdByUserId/updatedByUserId audit (FR-CM6)]
│       ├── mcp-server-configs.ts          [NEW — FR-MCP1~3, D25]
│       │                                  [  transport/command/args(JSONB)/env(JSONB)/isActive]
│       ├── agent-mcp-access.ts            [NEW — FR-MCP2, D22]
│       │                                  [  (agent_id, mcp_server_id) PK + cascade]
│       │                                  [  TEA 필수 cross-company isolation 테스트 3개]
│       ├── reports.ts                     [NEW — FR-RM1~4, E15]
│       │                                  [  distributionResults JSONB, runId, (company_id, created_at) index]
│       ├── tool-call-events.ts            [NEW — FR-SO2, D29, E17]
│       │                                  [  3종 compound 인덱스 + run_id 인덱스]
│       ├── mcp-lifecycle-events.ts        [NEW — FR-SO3, NFR-R3]
│       │                                  [  event: spawn/init/discover/execute/teardown/error]
│       │                                  [  zombie process 감지 SQL (sessionId 기준)]
│       └── content-calendar.ts            [NEW — Phase 2 사전 정의 (Phase 1 migration 미포함)]
│
└── routes/
    ├── admin/
    │   ├── credentials.ts                 [NEW — FR-CM1~4, FR-CM6]
    │   │                                  [  GET /admin/credentials (masked list)]
    │   │                                  [  POST /admin/credentials (encrypt + audit)]
    │   │                                  [  PUT /admin/credentials/:key (re-encrypt + audit)]
    │   │                                  [  DELETE /admin/credentials/:key (pre-delete audit)]
    │   ├── mcp-servers.ts                 [NEW — FR-MCP1~3, FR-MCP5]
    │   │                                  [  CRUD + connection test (3-way handshake 검증)]
    │   ├── agent-tools.ts                 [NEW — FR-TA1~4]
    │   │                                  [  allowed_tools 체크박스 toggle]
    │   │                                  [  MCP 서버 접근 부여 (agent_mcp_access)]
    │   └── reports.ts                     [NEW — FR-RM4 Admin read UI (+ FR-RM5/RM6 통합)]
    │                                      [  GET /admin/reports (전체 조회 + 필터)]
    └── workspace/
        └── reports.ts                     [NEW — FR-RM4 Human read-only UI]
                                           [  GET /reports (company 스코프 조회)]
                                           [  GET /reports/:id (단일 조회)]
```

**신규 파일 수: 30개** (engine 3개 수정 + mcp/ 3개 신규 + lib/ 2개 신규 + tool-handlers/ 7개 신규 + db/schema/ 7개 신규 + routes/ 5개 신규 + types.ts 수정)

---

### FR-to-File Mapping Matrix (Phase 1 전체)

| FR 영역 | FR | 구현 파일 | 패턴 |
|---------|-----|---------|------|
| **FR-CM: Credential Management** | FR-CM1 (등록) | routes/admin/credentials.ts + credential-crypto.ts | E11 |
| | FR-CM2 (목록 마스킹) | routes/admin/credentials.ts → listCredentials() | E11 |
| | FR-CM3 (수정) | routes/admin/credentials.ts → updateCredential() | E11 |
| | FR-CM4 (삭제) | routes/admin/credentials.ts → deleteCredential() | E11 |
| | FR-CM5 (RESOLVE 단계) | engine/mcp/mcp-manager.ts (Stage 1) | E11, E12 |
| | FR-CM6 (audit log) | db/schema/credentials.ts (createdByUserId/updatedByUserId) | E11 |
| **FR-TA: Tool Assignment** | FR-TA1 (목록 조회) | routes/admin/agent-tools.ts | — |
| | FR-TA2 (할당) | routes/admin/agent-tools.ts → agents.allowed_tools | D7 |
| | FR-TA3 (MCP 접근 부여) | routes/admin/agent-tools.ts → agent_mcp_access | D22 |
| | FR-TA4 (권한 검증) | engine/agent-loop.ts → tool-permission-guard Hook | E2 |
| **FR-MCP: MCP Management** | FR-MCP1 (서버 등록) | routes/admin/mcp-servers.ts | D25 |
| | FR-MCP2 (접근 제어) | db/schema/agent-mcp-access.ts + getMcpServersForAgent() | D22 |
| | FR-MCP3 (연결 테스트) | routes/admin/mcp-servers.ts → 3-way handshake | D25 |
| | FR-MCP4 (도구 이름 namespace) | engine/mcp/mcp-manager.ts → mergeMcpTools() | E12 |
| | FR-MCP5 (lifecycle 이벤트) | db/schema/mcp-lifecycle-events.ts + insertMcpLifecycleEvent() | E12 |
| | FR-MCP6 (TEARDOWN) | engine/agent-loop.ts finally → mcpManager.teardownAll() | E12 |
| **FR-DP: Document Processing** | FR-DP1 (md_to_pdf) | tool-handlers/builtins/md-to-pdf.ts | E13, E14, E17 |
| | FR-DP2 (OCR) | Phase 2 — Claude Vision (미구현) | — |
| | FR-DP3/4 | Phase 2 — 생략 | — |
| **FR-RM: Report Management** | FR-RM1 (save_report) | tool-handlers/builtins/save-report.ts | E13, E15, E17 |
| | FR-RM2 (채널 배포) | save-report.ts → distributeToChannel() | E15 |
| | FR-RM3 (에이전트용 목록/조회 도구) | tool-handlers/builtins/list-reports.ts, get-report.ts | E13, E17 |
| | FR-RM4 (Human/Admin UI 조회) | routes/admin/reports.ts + routes/workspace/reports.ts | — |
| | FR-RM5 (보고서 run_id 그룹 조회) | routes/admin/reports.ts → GET ?run_id= (FR-RM4 통합 구현) | D29 |
| | FR-RM6 (distributionResults 재시도/업데이트) | save-report.ts → updateReportDistribution() (FR-RM2/FR-RM1 통합 구현) | E15 |
| **FR-CP: Content Publishing** | FR-CP1 (publish_tistory) | tool-handlers/builtins/publish-tistory.ts | E13, E16, E17 |
| | FR-CP2 (upload_media) | tool-handlers/builtins/upload-media.ts | E13, E16, E17 |
| | FR-CP3~9 | Phase 2 — 소셜 미디어 (미구현) | — |
| **FR-WD: Web Data** | FR-WD1 (read_web_page) | tool-handlers/builtins/read-web-page.ts | E13, E16, E17 |
| | FR-WD2 | Phase 2 — Firecrawl (미구현) | — |
| | FR-WD3 | Phase 3 — CLI-Anything (미구현) | — |
| **FR-SO: Security & Observability** | FR-SO1 (allowed_tools 강제) | engine/agent-loop.ts + tool-permission-guard | E2, D7 |
| | FR-SO2 (telemetry) | db/schema/tool-call-events.ts + E17 패턴 | E17, D29 |
| | FR-SO3 (MCP lifecycle) | db/schema/mcp-lifecycle-events.ts + E12 각 단계 | E12 |
| | FR-SO4 (scrubber 확장) | engine/hooks/credential-scrubber.ts (수정) | D28 |
| | FR-SO5 (암호화 저장) | lib/credential-crypto.ts + credentials 테이블 | E11, D23 |
| | FR-SO6 (audit) | credentials 테이블 audit 필드 + route pre-delete | E11 |
| | FR-SO7 (company 격리) | getMcpServersForAgent() companyId WHERE | D22, E3 |

---

### Architectural Boundaries

**E8 경계 (engine/ 내부 전용):**
- `engine/agent-loop.ts` — 외부에서 import 금지 (단, call-agent.ts는 agent-loop.ts를 내부 재귀 호출)
- `engine/types.ts` — server 패키지 내부 전용 (shared/ re-export 금지)
- `engine/mcp/` — engine 외부에서 import 절대 금지

**getDB(companyId) 경계 (E3):**
- 신규 6개 테이블 전부 getDB() 메서드를 통해서만 접근 (직접 `db` import 금지)
- `listCredentialsForScrubber()` — credential-scrubber.ts 전용
- `updateReportDistribution()` — save-report.ts 전용

**lib/ 경계:**
- `credential-crypto.ts` — 허용 importers: routes/admin/credentials.ts, engine/mcp/mcp-manager.ts, **db/scoped-query.ts** (listCredentialsForScrubber 내부 decrypt() 호출). 이 3개 파일 외 import 금지.
- `puppeteer-pool.ts` — tool-handlers/builtins/md-to-pdf.ts + generate_card_news(Phase 2)만 import 허용

**Code Disposition Matrix 추가 항목:**
| 파일 | 처분 | 비고 |
|------|------|------|
| `db/scoped-query.ts` | **수정** | E3 확장: 15개 신규 getDB() 메서드 추가. credential-crypto.ts import 추가(listCredentialsForScrubber). |

---

## Architecture Validation

### FR/NFR 커버리지 체크

**Phase 1 FR 구현 현황 (21개 Phase 1 구현 / 20개 Phase 2+ Deferred):**

_41개 FR 전체 = Phase 1 구현 21개 + Phase 2+ Deferred 20개_

| 상태 | FR 수 | 내용 |
|------|------|------|
| ✅ Phase 1 구현 + 아키텍처 커버 | 21개 | FR-CM1~6(6), FR-TA1~4(4), FR-MCP1~6(6), FR-DP1(1), FR-RM1~2(2), FR-CP1~2(2) — Agent-facing 도구 + 인프라 |
| ✅ Phase 1 구현 (Human UI 포함) | 8개 | FR-RM3~6(4), FR-WD1(1), FR-SO1~7 Phase 1 구현분(3) — routes + telemetry + security |
| ⏳ Phase 2 Deferred (의도적 미구현) | 11개 | FR-DP2~4(3), FR-CP3~9(7), FR-WD2(1) |
| ⏳ Phase 3+ Deferred | 1개 | FR-WD3 (CLI-Anything) |

_FR-SO 세부: FR-SO1(Phase 1 구현), FR-SO2/3(Phase 1 텔레메트리 수집 + Phase 2 Admin UI), FR-SO4/5/6/7(Phase 1 전부 구현)_

**NFR 커버리지 (20/20개):**

| NFR 영역 | 커버리지 | 아키텍처 결정 |
|---------|---------|-----------|
| NFR-P (Performance) | ✅ | D24(Puppeteer SLA), D26(MCP warm start SLA ≤3s/5s), E17(durationMs 측정) |
| NFR-S (Security) | ✅ | D23(AES-256), D28(scrubber 100%), D22(companyId 격리), E11(encrypt/decrypt 전용) |
| NFR-R (Reliability) | ✅ | E15(부분 실패 계약), E16(Typed Error), NFR-R3 zombie 감지 SQL |
| NFR-SC (Scalability) | ✅ | D24(p-queue maxConcurrency:5), D29(3+1 인덱스) |
| NFR-I (Integration) | ✅ | D25(transport interface), E16(callExternalApi adapter), M3 send_email 검증 |

---

### Decision Compatibility Check (D22–D29 × D1–D21)

| 결정 | D1~D21 호환성 | 결론 |
|------|------------|------|
| D22 (Workers MCP) | D7(allowed_tools) + D1(companyId 격리) 확장 — 충돌 없음 | ✅ |
| D23 (AES-256 env var) | D9(pino logger) 패턴과 동일 (env var 기반) — 충돌 없음 | ✅ |
| D24 (Puppeteer pool) | D8(DB 쿼리 캐싱 없음)과 별개 레이어 — 충돌 없음 | ✅ |
| D25 (MCP transport) | D6(단일 진입점 agent-loop.ts) 확장 — 충돌 없음 | ✅ |
| D26 (lazy spawn) | D5(SessionContext 불변 객체) + lazy spawn: McpSession은 세션 내 가변 캐시 — D5 위반 아님 (McpSession ≠ SessionContext) | ✅ |
| D27 (google_drive P4) | D11(WebSocket Phase 1 유지) + Phase 4 MCP 추가 — 충돌 없음 | ✅ |
| D28 (scrubber 확장) | D4(Hook 순서 보안 먼저) 확장 — 의도에 완전 부합 | ✅ |
| D29 (3+1 인덱스) | D8(DB 쿼리 캐싱 없음) — 인덱스는 캐싱과 별개 레이어 | ✅ |

**D22–D29 상호 호환성:** 모든 결정이 독립적인 관심사(MCP 접근 정책, 암호화, 풀 관리, transport, cold start, 채널 할당, scrubber, 인덱스) — 상호 충돌 없음.

---

### E11–E17 패턴 충돌 검증

| 패턴 쌍 | 잠재 충돌 | 해결 |
|--------|---------|------|
| E11 + E16 | credential-crypto.ts가 E16 callExternalApi 내부에서 사용될 경우 중첩 에러 | RESOLVE 단계(E12)가 E11 전용 — E16은 RESOLVE 이후 외부 API 호출에만 적용 |
| E14 + E17 | withPuppeteer() 내부에서 E17 INSERT/UPDATE 위치 | E17 INSERT는 withPuppeteer() 호출 이전, UPDATE는 withPuppeteer() 완료 후 — 명시 필요 |
| E15 + E17 | save_report 채널 배포 중 E17 기록 위치 | save_report 전체를 단일 tool_call_event로 기록 (채널별 개별 기록 금지 — 과부하) |
| E12 + E17 | MCP EXECUTE 단계 E17 기록 | E12 EXECUTE 단계에서 E17 패턴 별도 적용 — tool_name = `{namespace}__{tool_name}` |

**추가 명확화 (E14 + E17):**
```typescript
// ✅ CORRECT: E17 INSERT는 withPuppeteer() 호출 이전
const startTime = Date.now();
const eventId = await getDB(ctx.companyId).insertToolCallEvent({ toolName: 'md_to_pdf', startedAt: new Date(), ... });
try {
  const result = await withPuppeteer(async (browser) => { /* PDF 렌더링 */ });
  await getDB(ctx.companyId).updateToolCallEvent(eventId, { success: true, durationMs: Date.now() - startTime });
  return result;
} catch (err) {
  await getDB(ctx.companyId).updateToolCallEvent(eventId, { success: false, errorCode: ..., durationMs: Date.now() - startTime });
  throw err;
}
```

---

### 갭 분석 (Gap Analysis)

**Phase 1에서 의도적으로 미포함한 항목 (아키텍처 범위 외):**

| 항목 | 이유 | Phase |
|------|------|-------|
| FR-DP2 OCR (Claude Vision) | Claude Vision API 별도 통합 필요 | Phase 2 |
| FR-CP3~9 소셜 미디어 | 각 플랫폼 OAuth 플로우 필요 | Phase 2 |
| FR-WD2 Firecrawl | BYOK API 키 + Rate Limit 설계 | Phase 2 |
| FR-WD3 CLI-Anything | 보안 샌드박스 설계 필요 | Phase 3 |
| content_calendar 테이블 | 스키마만 사전 정의 (Phase 2 migration) | Phase 2 |
| google_drive 채널 | Google Workspace MCP 의존 (D27) | Phase 4 |
| KMS 키 관리 | env var로 Phase 1 충족 (D23) | Phase 4 |
| Workers MCP pre-warm | lazy spawn으로 Phase 1 충족 (D26) | 불필요 |

**Phase 1 구현 의존성 순서 (중요):**
```
1. credential-crypto.ts (E11, D23)    → 선행 조건: 없음
2. db/schema/*.ts (Phase 1 migration 대상 6개 테이블) → 선행 조건: 없음 (credential-crypto.ts와 독립, 병렬 진행 가능)
3. db/scoped-query.ts 확장 (getDB)    → 선행 조건: db/schema/*.ts + credential-crypto.ts (listCredentialsForScrubber에서 decrypt() 호출)
4. engine/mcp/transports/stdio.ts      → 선행 조건: getDB()
5. engine/mcp/mcp-transport.ts         → 선행 조건: stdio.ts
6. engine/mcp/mcp-manager.ts           → 선행 조건: mcp-transport.ts + getDB()
7. engine/hooks/credential-scrubber.ts [수정] → 선행 조건: getDB().listCredentialsForScrubber()
8. engine/agent-loop.ts [수정]         → 선행 조건: mcp-manager.ts + credential-scrubber.ts
9. lib/puppeteer-pool.ts               → 선행 조건: 없음 (병렬 가능)
10. tool-handlers/builtins/*.ts (7개) → 선행 조건: getDB() + credential-crypto.ts + puppeteer-pool.ts
11. routes/admin/*.ts (4개)            → 선행 조건: getDB() + credential-crypto.ts
12. routes/workspace/reports.ts        → 선행 조건: getDB()
```

---

### TEA 필수 테스트 케이스 (Risk-Based)

**Critical (보안 격리):**
1. `getMcpServersForAgent()` cross-tenant: companyA agent → companyB MCP config → 빈 배열 반환
2. `agent_mcp_access` cross-tenant: companyA admin → companyB mcp_server_id 접근 불가
3. `listCredentialsForScrubber()` cross-company: companyA credentials가 companyB 세션에 노출되지 않음
4. `credential-scrubber.ts` MCP 출력 스캔: plaintext API 키가 MCP 도구 결과에 포함되면 `[REDACTED]` 치환

**High (핵심 기능):**
5. E12 TEARDOWN: 세션 종료 시 SIGTERM → 5s → SIGKILL 순서 검증
6. E12 SPAWN_TIMEOUT: 120s 초과 시 `AGENT_MCP_SPAWN_TIMEOUT` + mcp_lifecycle_events error 기록
7. E14 Puppeteer pool 고갈: 6번째 동시 요청 → 30s 후 `TOOL_RESOURCE_UNAVAILABLE`
8. E15 Partial failure: 2채널 중 1채널 실패 → 성공 채널 롤백 없음 + distributionResults 업데이트
9. E17 Pipeline Gate SQL: run_id 기반 쿼리 O(log n) 확인 (EXPLAIN ANALYZE)

**Medium (통합):**
10. AES-256 round-trip: encrypt → DB 저장 → 조회 → decrypt → 원본 값 일치
11. MCP warm start SLA: 두 번째 도구 호출 latency_ms ≤ 3000 (Notion MCP)
12. save_report 채널 배포: web_dashboard 성공 + pdf_email 실패 → reports.distributionResults 정확 기록
13. E11 Admin UI: listCredentials() 응답에 encryptedValue 필드 없음
14. E16 에러 코드: Tistory API 401 → TOOL_CREDENTIAL_INVALID (AGENT_MCP_CREDENTIAL_MISSING 아님)
15. D23 서버 시작 검증: `CREDENTIAL_ENCRYPTION_KEY` 미설정 또는 64자 아닌 경우 서버 시작 실패 + 명확한 에러 메시지 출력 (키 값 미노출 — "CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)" 형식)

---

### Architecture Complete

> **아키텍처 문서 완성 상태**: CORTHEX v2 Tool Integration Phase 1 구현에 필요한 모든 기술 결정과 패턴이 정의되었습니다.

**구현 에이전트를 위한 필독 순서:**
1. `_bmad-output/planning-artifacts/architecture.md` (D1–D21, E1–E10 — 기존 결정 확인)
2. 이 문서 전체 — 특히 Step 04(D22–D29)와 Step 05(E11–E17)
3. Step 05 Enforcement Guidelines의 grep 체크리스트

**Story 개발 착수 시 주의사항:**
- 의존성 순서 준수 (위 구현 의존성 순서 참조)
- E8 경계 위반 금지 (`engine/mcp/` 외부 import 절대 금지)
- 모든 외부 API 호출은 E16 `callExternalApi` 어댑터 경유
- `Promise.allSettled` vs `Promise.all` — save_report 채널 배포는 반드시 allSettled
- `updateToolCallEvent` — catch 블록에서도 반드시 실행

---

_Architecture Document — CORTHEX v2 Tool Integration: Steps 1–8 Complete_
