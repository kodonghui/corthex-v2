# arch-step04+05 Fix Summary

**Date:** 2026-03-14
**Step:** step-04 (Core Architectural Decisions D22–D29) + step-05 (Implementation Patterns E11–E17)
**Critic Feedback Score:** 7/10 (critic-b joint, 11 issues)
**Post-fix Expected Score:** 8.5+/10

---

## Issues Applied (11/11)

### SIGNIFICANT (5개)

**S1 — slack_dm scope creep + notion_page 표기 오류 (E15, D27)**
- Problem: `slack_dm`은 PRD FR-RM1에 없는 채널. `notion_page` → PRD 채널명은 `notion`
- Fix: D27 Consequences + E15 코드 채널 목록 수정:
  - Phase 1: web_dashboard, pdf_email
  - Phase 2: notion, notebooklm (Notion MCP 채널)
  - Phase 4: google_drive
  - slack_dm 제거, notion_page → notion

**S2 — MCP 네임스페이스 포맷 PRD 불일치 (E12)**
- Problem: `${mcpServerId}:` (UUID + 콜론) → PRD FR-MCP4: `notion__create_page` 패턴
- Fix: `mergeMcpTools()` 파라미터 `mcpServerId` → `mcpServerDisplayName`, 포맷 `${namespace}__${t.name}` 변경
- 이유: UUID는 LLM 불투명, 콜론 구분자는 도구명 내부 콜론과 파싱 충돌 위험

**S3 — E16 401/403 → TOOL_CREDENTIAL_INVALID (신규 코드)**
- Problem: `AGENT_MCP_CREDENTIAL_MISSING`은 MCP spawn context 전용 — 빌트인 도구에 사용 시 Admin 오진단
- Fix: 빌트인 도구 외부 API 401/403 → `TOOL_CREDENTIAL_INVALID` 신규 코드
- D3 에러 코드 확장 목록(line 109)에 `TOOL_CREDENTIAL_INVALID`, `AGENT_MCP_SPAWN_TIMEOUT` 추가 + 각 설명

**S4 — listCredentialsForScrubber() getDB() 미정의 (D28)**
- Problem: `listCredentials()`는 encryptedValue 의도적 제외 → scrubber 평문 스캔 불가
- Fix: getDB() 확장에 `listCredentialsForScrubber()` 추가 — encryptedValue 포함 후 decrypt() 호출
- D28 Consequences 메서드명 수정: listCredentials() → listCredentialsForScrubber()

**S5 — updateReportDistribution() getDB() 미정의 (E15)**
- Problem: E15 코드에서 `updateReportDistribution()` 호출하나 getDB() 확장에 없음
- Fix: getDB() Reports 섹션에 `updateReportDistribution(id, distributionResults)` 추가

### MODERATE (5개)

**M1 — AGENT_MCP_SPAWN_TIMEOUT 에러 코드 미등재**
- Fix: D3 에러 코드 확장 목록에 추가 (S3 수정에 포함)

**M2 — E17 startTime 변수 미선언**
- Fix: `insertToolCallEvent` 직전에 `const startTime = Date.now();` 추가

**M3 — AES-GCM 포맷 설명 불일치 (3곳)**
- Canonical: `base64(iv):base64(ciphertext+authTag)` (Web Crypto API 출력 포맷)
- Fix: line 175 (`base64(iv:tag:ciphertext)` → `base64(iv):base64(ciphertext+authTag)`)
- Fix: line 562 (`base64(iv:authTag:ciphertext)` → `base64(iv):base64(ciphertext+authTag)`)
- Line 765 이미 correct — 유지

**M4 — E14 p-queue timeout 에러 경로 주석 오류**
- Fix: 주석 수정 → "p-queue AbortError → withPuppeteer wrapper에서 TOOL_RESOURCE_UNAVAILABLE 직접 throw"
- E16 에러 코드 테이블: p-queue timeout 행을 "(E16 범위 외)" 명시로 수정

**M5 — E12 TEARDOWN Stop Hook 연계 불명확**
- Fix: "agent-loop.ts `finally` 블록에서 `mcpManager.teardownAll(sessionId)` 직접 호출 후 Stop Hook 실행" 명시
- D4 Stop Hook = cost-tracker 전용이므로 TEARDOWN과 분리

### MINOR (1개)

**N1 — Enforcement grep false positive**
- Fix: `grep -rP 'Promise\.all\(' tool-handlers/ | grep -v 'allSettled'`

---

## 변경 파일
- `/home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/architecture.md`
  - D3 에러 코드 확장 목록 (line 109): TOOL_CREDENTIAL_INVALID, AGENT_MCP_SPAWN_TIMEOUT 추가
  - D27 Consequences: 채널 목록 PRD FR-RM1 기준 수정
  - D28 Consequences: listCredentialsForScrubber() 메서드명 수정
  - getDB() 확장: listCredentialsForScrubber(), updateReportDistribution() 추가
  - E12 mergeMcpTools(): displayName__toolName 포맷 변경
  - E12 TEARDOWN 규칙: agent-loop.ts finally 블록 명시
  - E15 채널 목록: slack_dm 제거, notion_page → notion
  - E16 코드: 401/403 → TOOL_CREDENTIAL_INVALID
  - E16 에러 테이블: 업데이트
  - E17: startTime 선언 추가
  - AES-GCM 포맷 3곳 통일
  - Enforcement grep 패턴 수정
