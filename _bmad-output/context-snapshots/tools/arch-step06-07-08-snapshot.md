# Architecture Step 06+07+08 — Context Snapshot (FINAL)

**Saved:** 2026-03-14
**Steps:** step-06 (Project Structure) + step-07 (Architecture Validation) + step-08 (Architecture Complete)
**Score:** critic-a 9/10 + critic-b 9/10 — PASS (avg 9.0/10)
**Arch File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/architecture.md

---

## Step-06 핵심 산출물

### 30개 파일 디렉토리 트리 (신규 파일 기준)

**engine/ (4개)**
- `engine/mcp/mcp-manager.ts` [NEW] — E12 8단계 MCP 생명주기, SpawnFn 주입
- `engine/mcp/mcp-types.ts` [NEW] — McpServerConfig, McpTool, McpSession 타입
- `engine/tool-handlers/builtin-tool-registry.ts` [NEW] — E13 BuiltinToolHandler 등록
- `engine/tool-handlers/builtin/` [NEW — 12개 핸들러 파일]

**lib/ (3개)**
- `lib/credential-crypto.ts` [NEW] — E11 AES-256-GCM encrypt/decrypt
- `lib/puppeteer-pool.ts` [NEW] — E14 withPuppeteer() 래퍼 + p-queue
- `lib/report-renderer.ts` [NEW] — marked HTML 변환 + PDF 생성

**db/ (수정 포함)**
- `db/schema/credentials.ts` [NEW] — credentials 테이블 스키마
- `db/schema/mcp-server-configs.ts` [NEW] — mcp_server_configs 스키마
- `db/schema/agent-mcp-access.ts` [NEW] — agent_mcp_access 스키마
- `db/schema/reports.ts` [NEW] — reports 테이블 스키마
- `db/schema/tool-call-events.ts` [NEW] — tool_call_events 스키마
- `db/schema/mcp-lifecycle-events.ts` [NEW] — mcp_lifecycle_events 스키마
- `db/scoped-query.ts` [MODIFY — E3 확장: 15개 신규 getDB() 메서드]
- `db/migrations/` [NEW — Phase 1 마이그레이션 파일]

**routes/ (7개)**
- `routes/admin/credentials.ts` [NEW] — FR-CM1~7
- `routes/admin/mcp-servers.ts` [NEW] — FR-MCP1~3
- `routes/admin/reports.ts` [NEW] — FR-RM4
- `routes/workspace/reports.ts` [NEW] — FR-RM4
- `routes/workspace/tool-call-events.ts` [NEW] — FR-SO1~4

**engine/ 수정 (3개)**
- `engine/agent-loop.ts` [MODIFY — MCP 통합 + finally TEARDOWN + credential scrubber]
- `engine/hooks/post-tool-use.ts` [MODIFY — credential scrubber 연결]
- `engine/types.ts` [MODIFY — 신규 에러 코드 + McpContext 타입]

### FR-to-File Mapping Matrix (주요)

| FR 그룹 | 담당 파일 |
|---------|---------|
| FR-CM1~7 | routes/admin/credentials.ts + lib/credential-crypto.ts |
| FR-MCP1~5 | routes/admin/mcp-servers.ts + engine/mcp/mcp-manager.ts |
| FR-TH1~12 | engine/tool-handlers/builtin/*.ts + builtin-tool-registry.ts |
| FR-RM1~6 | routes/admin/reports.ts + routes/workspace/reports.ts + lib/report-renderer.ts |
| FR-SO1~4 | routes/workspace/tool-call-events.ts + engine/agent-loop.ts |

### Architectural Boundaries

**E8 경계:**
- engine/ public API: `agent-loop.ts` + `types.ts` only
- engine/mcp/: engine-internal (외부 import 금지)
- engine/ 내부 → lib/ 허용

**lib/ 허용 importers:**
- `lib/credential-crypto.ts`: routes/admin/credentials.ts, engine/mcp/mcp-manager.ts, db/scoped-query.ts
- `lib/puppeteer-pool.ts`: engine/tool-handlers/builtin/web-scraper.ts, playwright-automation.ts
- `lib/report-renderer.ts`: engine/tool-handlers/builtin/save-report.ts

**getDB() 신규 메서드 15개 (db/scoped-query.ts):**
- Credentials: insertCredential, updateCredential, deleteCredential, getCredential, listCredentials, listCredentialsForScrubber
- MCP: insertMcpServerConfig, updateMcpServerConfig, getMcpServersForAgent, grantAgentMcpAccess, revokeAgentMcpAccess
- Reports: insertReport, updateReportDistribution, getReport, listReports
- Events: insertToolCallEvent, getMcpLifecycleEvents (기존 포함)

---

## Step-07 핵심 산출물

### FR 커버리지

- Phase 1 구현: **21개** (FR-CM1~7, FR-MCP1~5, FR-TH1~4, FR-RM1~3, FR-SO1~4)
- Phase 2+ Deferred: **20개** (FR-TH5~12, FR-RM4~6 일부, FR-CT1~5 등)
- 총 41개 FR 전체 커버 확인

### D22-D29 × D1-D21 호환성 — 전체 충돌 없음

### E11-E17 패턴 충돌 검사 — 전체 클린

### 12단계 구현 의존성 순서

1. lib/credential-crypto.ts (독립)
2. db/scoped-query.ts (선행: db/schema/*.ts + credential-crypto.ts)
3. db/schema/*.ts 6개 (병렬)
4. db/migrations/ Phase 1
5. engine/mcp/mcp-types.ts
6. engine/mcp/mcp-manager.ts
7. lib/puppeteer-pool.ts + lib/report-renderer.ts (병렬)
8. engine/tool-handlers/builtin/*.ts 12개 (병렬 가능)
9. engine/tool-handlers/builtin-tool-registry.ts
10. engine/agent-loop.ts 수정
11. routes/ 5개 (병렬 가능)
12. 통합 테스트

### TEA 테스트 케이스 15개

| 우선순위 | # | 테스트 |
|---------|---|--------|
| Critical | 1 | cross-tenant credential 격리 |
| Critical | 2 | agent_mcp_access cross-company 격리 |
| Critical | 3 | credential-scrubber 100% 스캔 |
| High | 4~9 | MCP lifecycle, Puppeteer pool, save_report partial failure 등 |
| Medium | 10~15 | API 에러 코드, 인덱스 성능, CREDENTIAL_ENCRYPTION_KEY startup 등 |

---

## 수정 이슈 (9개, 8/10 → 9/10)

- S1: FR coverage 헤더 "29/41" → "21개 Phase 1 / 20개 Phase 2+ Deferred" + FR-SO 세부
- S2: lib/ 경계에 db/scoped-query.ts 추가 + CDM scoped-query.ts [MODIFY] 등재
- S3: FR-RM5/6 매핑 행 추가 + routes FR-RM3 → FR-RM4 라벨 수정
- M1: 파일 트리 db/ 섹션에 scoped-query.ts [MODIFY] 추가
- M2: 의존성 Step 2 선행 조건 → "없음 (credential-crypto.ts와 독립)"
- N1: "6개 테이블" → "Phase 1 6개; content-calendar.ts Phase 2 포함 시 7개"
- N2: SIGTERM_TIMEOUT_MS = 5000 상수 E12에 추가
- N3: routes FR-RM3 → FR-RM4 (S3에서 통합 처리)
- N4: TEA #15 CREDENTIAL_ENCRYPTION_KEY startup 검증 추가

---

## Architecture Complete

**Architecture 전체 스코어 요약:**

| 단계 | critic-a | critic-b | 평균 |
|------|----------|----------|------|
| Step 02+03 | 9/10 | 9/10 | 9.0/10 |
| Step 04+05 | 9/10 | 9/10 | 9.0/10 |
| Step 06+07+08 | 9/10 | 9/10 | 9.0/10 |
| **전체 평균** | **9.0** | **9.0** | **9.0/10** |

**Status:** Architecture Complete — Epic/Story 개발 착수 가능
**stepsCompleted:** [1,2,3,4,5,6,7,8]
