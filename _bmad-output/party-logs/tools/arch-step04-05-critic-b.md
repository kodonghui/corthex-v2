# CRITIC-B Review — arch-step04+05 (D22–D29 + E11–E17)

**Reviewer:** CRITIC-B (Winston / Amelia / Quinn / Bob)
**Date:** 2026-03-14
**Scope:** architecture.md lines 472–1164
**Score:** 7.5/10 (PASS — 3 Significant issues require fix before story dev)

---

## Winston (Architect) — D1–D21 Consistency

**Positive:**
- D22–D29 전부 기존 D1–D21과 방향 일치. D4 Hook 순서 위반 없음. D28이 D4의 "보안 먼저" 원칙을 명시적으로 확장.
- E11–E17이 E1–E10(특히 E3 getDB, E8 경계, D3 에러 코드)을 정확하게 참조하며 확장. 충돌 없음.
- D29 PRD-D8 해결: Phase 1 마이그레이션 포함 이유 충분 (Phase 2 ALTER TABLE Lock 위험 회피).
- D27 google_drive Phase 4 결정: Google OAuth 인프라 부재 이유 타당. E15 채널 Phase 레이블(1→2→3→4)로 일관성 유지됨.

**Issue 1 (SIGNIFICANT — D28 + E3 불일치):** D28 Consequences (line 662)에서 `getDB(companyId).listCredentials()` 호출로 "복호화된 평문 목록 로드"라고 명시했지만, `listCredentials()`는 `{ id, keyName, updatedAt }` 만 반환하며 `encryptedValue`를 의도적으로 제외한다 (Step 03 line 336-338의 마스킹 쿼리). Scrubber가 평문 값을 스캔 목록으로 구성하려면 `encryptedValue`가 필요하고 이를 `decrypt()`로 복호화해야 한다. 즉, getDB()에 `listCredentialsForScrubber(): Promise<{ keyName: string, encryptedValue: string }[]>` 메서드가 별도로 필요하다. 현재 설계대로라면 scrubber는 keyName 목록만 얻고 실제 평문 값 로드는 불가능하다 — credential 스캔이 동작하지 않는다. D28과 E3 getDB() 확장 포인트 간 직접 모순.
→ Fix: D28 Consequences에서 메서드명을 `listCredentialsForScrubber()` (encryptedValue 포함)로 수정 + getDB() 확장에 해당 메서드 추가.

**Issue 2 (SIGNIFICANT — E15 updateReportDistribution getDB() 누락):** E15 line 986에서 `getDB(ctx.companyId).updateReportDistribution(report.id, distributionResults)` 호출하는데, 이 메서드는 Step 03 getDB() 확장 포인트(lines 397–432)에 정의되지 않았다. `insertReport()`는 있지만 `updateReportDistribution()`은 없다. 구현 에이전트가 getDB()에서 이 메서드를 찾을 수 없다.
→ Fix: getDB() 확장에 `updateReportDistribution(id: string, results: Record<string, string>) => ...` 추가.

**Issue 3 (MINOR — D23 암호화 포맷 설명 불일치):** credentials 테이블 컬럼 주석(Step 03 line 171)에서 `AES-256-GCM: base64(iv:tag:ciphertext)` (3-part: iv / tag / ciphertext 분리)으로 설명하지만, E11 line 749는 `base64(iv):base64(authTag+ciphertext)` (2-part: iv / ciphertext+tag 결합)으로 설명한다. Web Crypto API의 `crypto.subtle.encrypt()` AES-GCM 출력은 `ciphertext || authTag` (authTag 자동 append)이므로 2-part 형식이 맞다. 3-part 설명은 별도 authTag 분리 저장을 암시하여 오해를 일으킬 수 있다.
→ Fix: line 171 주석을 `AES-256-GCM: base64(iv):base64(ciphertext+authTag)` 로 E11과 통일.

---

## Amelia (Dev) — ARM64 / Bun Implementation Feasibility

**Positive:**
- D23 `credential-crypto.ts` 코드: `KEY_HEX.length !== 64` 검증 정확 (32 bytes = 64 hex chars). `crypto.subtle.importKey('raw', KEY, 'AES-GCM', false, ...)` Web Crypto API — Bun 1.0+ 지원 확인됨.
- E14 `withPuppeteer` wrapper: p-queue v8 `add({ timeout })` API 정확. `as Promise<T>` cast 필요한 이유(p-queue v8 반환 타입 `Promise<T | void>`) 주석에 없어도 동작은 문제없음.
- E11 암호화 코드: Bun에서 `Buffer.from()` (Node.js 호환) 사용 가능. Web Crypto API 직접 사용으로 외부 의존성 없음. Correct.

**Issue 4 (MODERATE — E17 startTime 미정의):** E17 code example (lines 1098, 1110)에서 `Date.now() - startTime`을 참조하지만 `startTime` 변수가 선언되지 않았다. `eventId` 생성 이전에 `const startTime = Date.now()` 선언이 필요하다. 구현 에이전트가 이 코드를 그대로 복사하면 `ReferenceError: startTime is not defined` 런타임 에러 발생 — `durationMs`가 항상 `NaN` 기록.
→ Fix: E17 코드 예시 `insertToolCallEvent` 호출 직전에 `const startTime = Date.now();` 추가.

**Issue 5 (MODERATE — D24/E14 p-queue timeout 에러 경로 주석 부정확):** E14 line 912 주석: `"timeout 초과 시 p-queue가 TimeoutError throw → E16에서 TOOL_RESOURCE_UNAVAILABLE로 변환"`. 그러나 p-queue v8의 timeout은 `pool.add()` promise에서 직접 reject — `callExternalApi` 어댑터(E16) 밖에서 발생한다. E16은 이 에러를 가로채지 못한다. 실제 경로: `withPuppeteer()` → `pool.add()` timeout → AbortError → `withPuppeteer` 호출자에서 처리되어야 함. E16 에러 코드 테이블(line 1059)에 "p-queue timeout → TOOL_RESOURCE_UNAVAILABLE"이 있지만 구현 경로가 E16이 아닌 E14 내에서 직접 처리되어야 한다. 혼동 가능.
→ Fix: E14 주석을 "timeout 초과 시 `pool.add()` 가 AbortError를 throw — `withPuppeteer` wrapper에서 `TOOL_RESOURCE_UNAVAILABLE` 로 직접 변환" 으로 수정. E16 테이블에서 p-queue timeout 항목 제거.

---

## Quinn (QA) — Testability

**Positive:**
- E12 SpawnFn injection interface 명확: `type SpawnFn = (cmd, args, env) => ChildProcess`. bun:test에서 mock spawn 주입 가능. TEA 단계 지원됨.
- E13 BuiltinToolHandler interface 패턴: 구현체 표준화 → 단위 테스트 시 interface 구현 mock 주입 용이.
- E15 Promise.allSettled 패턴: 채널별 독립 테스트 가능. grep 검증 기준(Promise.all 금지)으로 Code Review 자동화 가능.

**Issue 6 (SIGNIFICANT — E12 TEARDOWN-Stop Hook 연계 미지정):** E12 line 825: `"TEARDOWN: 세션 종료 Hook(Stop Hook)에서 모든 McpSession에 대해 반드시 실행"`. 그러나 기존 D4 Hook 파이프라인 Stop Hook에는 `cost-tracker`만 정의된다. MCP TEARDOWN이 Stop Hook에 추가되는 것인지, 아니면 `agent-loop.ts`가 Stop Hook 이전에 직접 `mcp-manager.teardownAll(sessionId)` 호출하는 것인지 미지정. 이 구현 경로가 불명확하면:
  - Stop Hook 실행 실패 시 MCP TEARDOWN도 실행 안 됨 → zombie process 발생
  - TEA가 TEARDOWN 경로를 테스트하는 방법이 없음
→ Fix: E12 TEARDOWN 규칙에 구체적 통합 포인트 명시. 권장 방법: `agent-loop.ts`의 `finally` 블록에서 직접 `mcpManager.teardownAll(sessionId)` 호출 후 Stop Hook 실행 순서 지정.

**Issue 7 (MODERATE — E16 401/403 에러코드 AGENT_MCP_ prefix 의미 부정확):** E16 line 1034에서 HTTP 401/403을 `AGENT_MCP_CREDENTIAL_MISSING` 에러 코드로 매핑한다. 그러나 `AGENT_MCP_` prefix는 MCP 컨텍스트(D3 에러 코드 체계)를 의미한다. `publish_tistory` 또는 `upload_media` 같은 빌트인 도구에서 Tistory/R2 API 키가 만료되어 401이 발생한 경우 `AGENT_MCP_CREDENTIAL_MISSING`을 반환하면 Admin이 "MCP 서버 자격증명 문제"로 오인할 수 있다. 빌트인 도구용 자격증명 오류는 별도 코드(`TOOL_CREDENTIAL_INVALID` 또는 `TOOL_EXTERNAL_SERVICE_AUTH_ERROR`)가 필요하다.
→ Fix: E16 에러 코드 테이블에서 401/403 → `AGENT_MCP_CREDENTIAL_MISSING` 매핑을 `TOOL_CREDENTIAL_INVALID` 로 변경. D3 에러 코드 확장 목록(Step 03 line 108)에 `TOOL_CREDENTIAL_INVALID` 추가.

---

## Bob (SM) — Scope & Delivery

**Positive:**
- PRD-D1~D12 해결 현황 테이블(lines 682–697): 9/12 해결, 3개 명시적 deferred — 명확하고 검증 가능.
- E11–E17 각 패턴이 7개 충돌 지점을 1:1 매핑하여 해결 — 범위 정합성 우수.
- Enforcement Guidelines grep 검증 4개: 코드 리뷰 자동화 지원. Step 5 종료 후 즉시 적용 가능.
- D22–D29 결정 우선순위 분류(Critical/Important/Deferred) — 스프린트 착수 순서 결정에 직접 사용 가능.

**관찰 (감점 없음):** E15 Phase별 채널 목록(lines 1000-1003: Phase 1 web_dashboard/pdf_email, Phase 2 slack_dm, Phase 3 notion_page, Phase 4 google_drive)이 PRD FR-RM과 정확히 일치 확인됨. 단, PRD Journey 2(CEO 김대표)에서 Phase 2+ 기능인 Notion 저장이 Phase 1 데모로 오해될 수 있어 Phase 레이블 명시가 중요 — 이미 올바르게 처리됨.

---

## Summary of Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | **Significant** | D28 line 662 / getDB lines 397–432 | listCredentials()는 encryptedValue 제외 → scrubber 평문 로드 불가. `listCredentialsForScrubber()` 미정의 |
| 2 | **Significant** | E15 line 986 / getDB lines 397–432 | `updateReportDistribution()` getDB()에 미정의 |
| 3 | **Minor** | D23 line 171 vs E11 line 749 | 암호화 포맷 설명 3-part vs 2-part 불일치 |
| 4 | **Moderate** | E17 lines 1098, 1110 | `startTime` 변수 미선언 — 코드 예시 버그 |
| 5 | **Moderate** | E14 line 912 | p-queue timeout → E16 변환 경로 부정확한 주석 |
| 6 | **Significant** | E12 line 825 | TEARDOWN-Stop Hook 연계 구현 포인트 미지정 |
| 7 | **Moderate** | E16 line 1034 | 빌트인 401/403에 `AGENT_MCP_CREDENTIAL_MISSING` 의미 오류 |

**최우선 수정 (Story dev 전):** Issues 1, 2, 6 (Significant 3개)
**같은 패스 권장:** Issues 4, 5, 7 (Moderate 3개)
**스토리 레벨 가능:** Issue 3 (Minor)

---

**Score: 7.5/10** (PASS)

Step 04 (D22–D29): 8.5/10 — 결정 구조 완전, 로직 일관. D28 scrubber 메서드 불일치가 주요 감점.
Step 05 (E11–E17): 7/10 — 패턴 의도 명확, 충돌 지점 해결. TEARDOWN 연계 미지정(E12) + 코드 예시 버그(E17)가 구현 혼동 위험.
