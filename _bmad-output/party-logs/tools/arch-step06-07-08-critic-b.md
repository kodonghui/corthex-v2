# CRITIC-B Review — arch-step06+07+08 (FINAL: Structure + Validation + Complete)

**Reviewer:** CRITIC-B (Winston / Amelia / Quinn / Bob)
**Date:** 2026-03-14
**Scope:** architecture.md lines 1191–1523 (Steps 06+07+08 — FINAL)
**Score:** 8/10 (PASS)

---

## Winston (Architect) — Structural Correctness & Decision Alignment

**Positive:**
- File tree 30개 파일 모두 E8 경계, E3 getDB() 경계, lib/ 경계 명확히 준수.
- D22–D29 × D1–D21 호환성 체크 테이블: 8개 결정 모두 "충돌 없음" ✓. D26(lazy spawn)이 D5(SessionContext 불변)와 충돌하지 않는다는 논리(McpSession ≠ SessionContext) 명확하게 설명됨.
- 구현 의존성 순서 12단계: 순환 참조 없음. agent-loop.ts(8번)가 mcp-manager.ts + credential-scrubber.ts 완료 후 수정되는 것 올바름.

**Issue 1 (SIGNIFICANT — FR 커버리지 헤더 수치 불일치):**
Line 1384: `Phase 1 FR 커버리지 (29/41개)`라고 헤더에 명시했지만, 아래 테이블 합계는 21+12+8 = 41개 — 즉 전체 FR을 3가지 상태로 분류한 것인데 헤더의 "29/41"은 이와 맞지 않는다. "21/41 Phase 1 구현" (나머지 12+8=20개 deferred/선행 조건 미충족)이 의도라면 헤더를 "21개 Phase 1 구현, 20개 Deferred"로 수정하거나, "커버리지 = 21개 구현 확정"으로 명확히 해야 한다. 현재 "29/41"은 어느 쪽 카운트도 아닌 부정확한 숫자.
→ Fix: 헤더를 `Phase 1 FR 구현 현황 (21개 Phase 1 구현 / 20개 Phase 2+ Deferred)`으로 수정.

**Issue 2 (SIGNIFICANT — FR-RM mapping: 4개 행 vs Step 02 선언 6개):**
Step 02 FR 개요 테이블 line 41: `FR-RM: Report Management | 6`. 그러나 FR-to-File Mapping Matrix(lines 1342–1345)는 FR-RM1~FR-RM4만 4개 행. FR-RM5, FR-RM6가 매핑 없음. 41 FRs 전체 커버를 선언했지만 2개가 명시적으로 누락. (PRD에서 FR-RM5/6는 보고서 타입 필터링/ARGOS 재배포 등일 가능성 있음.)
→ Fix: FR-RM5, FR-RM6를 명시적으로 매핑하거나, "FR-RM5~6: FR-RM3/4에 통합 구현" 주석 추가.

**Issue 3 (SIGNIFICANT — lib/ 경계 누락: db/scoped-query.ts):**
Line 1375: "`credential-crypto.ts` — routes/admin/credentials.ts + engine/mcp/mcp-manager.ts만 import 허용". 그러나 Step 04(S4 fix)에서 추가된 `getDB().listCredentialsForScrubber()` 내부에서 `decrypt()` (credential-crypto.ts)를 직접 호출한다(line 384). 즉 `db/scoped-query.ts`도 credential-crypto.ts의 importer임 — 경계 선언에서 누락.
→ Fix: lib/ 경계 설명에 `db/scoped-query.ts (listCredentialsForScrubber 내부)` 추가.

---

## Amelia (Dev) — Implementation Feasibility

**Positive:**
- lib/puppeteer-pool.ts line 1245: "AbortError → TOOL_RESOURCE_UNAVAILABLE" 명시됨(step04+05 M4 fix 반영). E14 p-queue timeout 처리 경로 명확.
- mcp-transport.ts createMcpTransport() factory 패턴 (line 1231): stdio/sse/http 분기 + TOOL_MCP_TRANSPORT_UNSUPPORTED. Phase 2 sse 추가 시 파일 하나만 추가하면 됨 — 확장 비용 최소화 확인.
- engine/agent-loop.ts TEARDOWN finally 블록 명시(line 1213): "Stage 8(TEARDOWN finally 블록)" — M5 fix 반영됨.

**Issue 4 (MODERATE — db/scoped-query.ts 파일 트리 미등재):**
getDB() 확장은 Step 03에서 상세 명시됐지만, Step 06 파일 트리(lines 1208–1313)에 `db/scoped-query.ts [MODIFY]`가 없다. 신규 15개 메서드(listCredentialsForScrubber, updateReportDistribution, insertMcpLifecycleEvent, getActiveMcpSessions 등)가 추가되는 중요 파일인데 구조 섹션에서 완전히 누락.
→ Fix: 파일 트리 db/ 섹션에 `scoped-query.ts [MODIFY — 15개 신규 메서드 추가 (E3 확장)]` 추가.

**Issue 5 (MODERATE — 의존성 순서 Step 2 선행 조건 오류):**
Line 1465: `db/schema/*.ts (6개 테이블) → 선행 조건: credential-crypto.ts`. 그러나 Drizzle ORM 스키마 파일들은 credential-crypto.ts를 import하지 않는다. 스키마 파일은 `pgTable` 정의만 포함 — 선행 조건이 없다. (credential-crypto.ts 의존은 getDB() → route 레이어에서 발생.)
→ Fix: Step 2 선행 조건을 `없음 (credential-crypto.ts와 독립)` 또는 `없음 (병렬 가능)` 으로 수정.

**Issue 6 (MODERATE — db/schema 테이블 수 "6개" 오류):**
Line 1465, 1475: `db/schema/*.ts (6개 테이블)`. 실제 Phase 1 schema 파일: credentials + mcp-server-configs + agent-mcp-access + reports + tool-call-events + mcp-lifecycle-events = 6개 Phase 1 테이블 + content-calendar = 7번째 파일(Phase 2 pre-defined). 파일 트리(line 1293)는 7개 파일로 정확히 표시됨 — 의존성 순서 표현과 불일치.
→ Fix: 의존성 순서 Step 2를 `db/schema/*.ts (Phase 1 6개 테이블 + Phase 2 content-calendar 사전 정의)`로 수정.

---

## Quinn (QA) — Testability

**Positive:**
- TEA Critical 4개: cross-tenant MCP config, cross-tenant agent_mcp_access, listCredentialsForScrubber cross-company, scrubber MCP 출력 스캔 — 보안 격리의 핵심 4개 경로 모두 포함. 충분함.
- E12+E17 충돌 명확화 (lines 1426–1443): md_to_pdf E17 INSERT → withPuppeteer() → E17 UPDATE 순서 코드 예시 추가됨. TEA 에이전트가 이 순서를 검증 가능.
- TEA test #14 (line 1500): Tistory 401 → TOOL_CREDENTIAL_INVALID 검증 — step04+05 S3 fix 반영됨 ✓.

**Issue 7 (MINOR — CREDENTIAL_ENCRYPTION_KEY 시작 검증 TEA 테스트 누락):**
D23 Consequences (line 534): "`CREDENTIAL_ENCRYPTION_KEY` env var 미설정 시 서버 시작 실패 처리 필수". 이 startup 안전 장치는 14개 TEA 테스트 목록에 없다. 실제 운영에서 env var 없이 서버가 시작되면 모든 credential 암호화/복호화가 실패 — P0 보안 시나리오.
→ Fix: TEA Medium 섹션에 "15. `CREDENTIAL_ENCRYPTION_KEY` 미설정 시 서버 시작 실패 + 명확한 에러 메시지 반환 (키 값 미노출)" 추가.

---

## Bob (SM) — Scope Completeness

**Positive:**
- 갭 분석 8개 항목 모두 근거 명확 (Phase 이유 + 결정 참조). "Workers MCP pre-warm: 불필요"가 D26 lazy spawn으로 해결됨 표기 — 의사결정 추적 가능.
- Story 개발 착수 주의사항 5개 (line 1513-1518): E8 경계, E16 callExternalApi, Promise.allSettled, updateToolCallEvent catch 필수 — Story 착수 즉시 적용 가능한 구체적 지침.
- 구현 에이전트 필독 순서 3단계 명확. architecture.md → 이 문서 → Enforcement grep 순서.

**관찰 (감점 없음):**
- 파일 트리 총 계수 "30개" (line 1315) — Dockerfile(1) + scoped-query.ts(1) + send-email.ts(1)을 포함하면 27 tree files + 3 = 30 가능. Code Disposition Matrix 포함 카운트라면 맞지만 트리에서 누락된 파일들을 "30개"에 포함하는 것은 독자에게 혼란. Minor.

---

## Summary of Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | **Significant** | Line 1384 | FR 커버리지 헤더 "29/41개" — 테이블 합계(21+12+8=41)와 불일치 |
| 2 | **Significant** | Lines 1342–1345 | FR-RM5/6 매핑 누락 (Step 02 선언 6개, 매핑 4개) |
| 3 | **Significant** | Line 1375 | lib/ 경계에서 db/scoped-query.ts (listCredentialsForScrubber) 누락 |
| 4 | **Moderate** | Lines 1208–1313 | db/scoped-query.ts [MODIFY] 파일 트리 미등재 |
| 5 | **Moderate** | Line 1465 | 의존성 순서 Step 2 "선행 조건: credential-crypto.ts" = 틀림 (schema 파일 독립) |
| 6 | **Moderate** | Line 1465 | "6개 테이블" → 실제 7개 파일 (content-calendar 포함) |
| 7 | **Minor** | Lines 1480–1500 | CREDENTIAL_ENCRYPTION_KEY startup 검증 TEA 테스트 누락 |

**최우선 수정:** Issues 1, 2, 3 (Significant 3개 — 논리적 정확성)
**같은 패스:** Issues 4, 5, 6 (Moderate 3개 — 문서 정확성)
**스토리 레벨:** Issue 7 (Minor)

---

**Score: 8/10** (PASS — FINAL 기준 충족)

Step 06 (Structure): 8/10 — FR-RM 매핑 갭, scoped-query.ts 누락이 주요 감점
Step 07 (Validation): 8.5/10 — 호환성 체크 및 TEA 케이스 우수. FR 커버리지 헤더 수치가 주요 감점
Step 08 (Complete): 9/10 — 구현 에이전트 가이드 명확. 착수 주의사항 적절.

**Architecture Complete 승인 의견: PASS (수정 후 확인 없이 바로 진행 가능)** — 7개 이슈가 모두 문서 정확성 수준이며 아키텍처 논리에 치명적 오류 없음. Significant 3개는 수정 권장하나 Epic/Story 개발 착수를 블로킹하지 않음.
