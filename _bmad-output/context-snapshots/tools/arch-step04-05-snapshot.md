# Architecture Step 04+05 — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-04 (Core Architectural Decisions D22–D29) + step-05 (Implementation Patterns E11–E17)
**Score:** critic-a 9/10 + critic-b 9/10 — PASS (avg 9.0/10)
**Arch File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/architecture.md

---

## Step-04 핵심 산출물

### D22–D29 결정 요약

| 결정 | 선택 결정 |
|------|---------|
| D22 | Workers MCP — configurable default OFF. Admin 명시 부여 시 허용. agent_mcp_access 이중 게이트. |
| D23 | AES-256 Phase 1 env var `CREDENTIAL_ENCRYPTION_KEY`. Phase 4+ KMS deferred. 미설정 시 서버 시작 실패. |
| D24 | p-queue maxConcurrency:5, 30s 큐 대기 timeout → TOOL_RESOURCE_UNAVAILABLE |
| D25 | stdio Phase 1 구현. interface 선행 정의. sse/http → TOOL_MCP_TRANSPORT_UNSUPPORTED |
| D26 | lazy spawn + cold start 120s + warm start SLA ≤3s(Notion)/≤5s(Playwright) |
| D27 | google_drive Phase 4 확정 (Google Workspace MCP). FR-RM1 채널: P1 web_dashboard/pdf_email, P2 notion/notebooklm, P4 google_drive |
| D28 | 세션 시작 시 listCredentialsForScrubber() 로드 → 빌트인+MCP 100% PostToolUse 스캔 |
| D29 | tool_call_events 3종 compound 인덱스 + run_id 인덱스 — Phase 1 마이그레이션 포함 |

### PRD Deferred Decisions 해결 현황
- 9/12 해결 완료 (D22-D29)
- PRD-D5/D10/D11: Phase 3/2/2 시점 해결 예정

### 에러 코드 확장 (D3 기반)
- 신규 확정: `TOOL_NOT_ALLOWED`, `TOOL_EXTERNAL_SERVICE_ERROR`, `TOOL_QUOTA_EXHAUSTED`, `TOOL_RESOURCE_UNAVAILABLE`, `TOOL_TIMEOUT`, `TOOL_CREDENTIAL_INVALID`, `AGENT_MCP_CREDENTIAL_MISSING`, `AGENT_MCP_SPAWN_TIMEOUT`, `CREDENTIAL_TEMPLATE_UNRESOLVED`
- `TOOL_CREDENTIAL_INVALID`: 빌트인 도구 외부 API 키 만료/오류 (AGENT_MCP_CREDENTIAL_MISSING과 구분)
- `AGENT_MCP_SPAWN_TIMEOUT`: MCP cold start 120s 초과

---

## Step-05 핵심 산출물

### E11–E17 패턴 요약

| 패턴 | 핵심 규칙 |
|------|---------|
| E11 | credential-crypto.ts 전용 encrypt/decrypt. DB 저장: base64(iv):base64(ciphertext+authTag) |
| E12 | 8단계 RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN. MCP 도구명: `{displayName}__{toolName}` 더블언더스코어 (PRD FR-MCP4). TEARDOWN: agent-loop.ts finally 블록. |
| E13 | BuiltinToolHandler interface 필수. ToolError만 throw. |
| E14 | withPuppeteer() 래퍼 필수. try/finally 내 릴리즈. p-queue AbortError → withPuppeteer에서 TOOL_RESOURCE_UNAVAILABLE 직접 throw. |
| E15 | Promise.allSettled 필수 (Promise.all 금지). reports INSERT 실패만 전체 실패. distributionResults JSONB 기록 필수. |
| E16 | callExternalApi 어댑터 필수. 401/403 → TOOL_CREDENTIAL_INVALID (AGENT_MCP_CREDENTIAL_MISSING 사용 금지). |
| E17 | startTime 선언 → INSERT → 로직 → UPDATE(성공/실패 양쪽). ctx.runId는 agent-loop.ts 주입. |

### getDB() 추가 메서드 (Step 04+05에서 확정)
- `listCredentialsForScrubber()`: encryptedValue 포함 + decrypt() 내부 호출 → {keyName, plaintext}[] 반환 (D28 scrubber 전용)
- `updateReportDistribution(id, results)`: reports.distributionResults JSONB 업데이트 (E15 save_report 전용)

---

## 수정 이슈 (11개, 7/10 → 9/10)
- S1: slack_dm 제거, notion_page → notion (PRD FR-RM1 준수)
- S2: MCP namespace `${displayName}__${toolName}` (PRD FR-MCP4)
- S3: 401/403 → TOOL_CREDENTIAL_INVALID (신규 코드)
- S4: listCredentialsForScrubber() getDB() 추가
- S5: updateReportDistribution() getDB() 추가
- M1: AGENT_MCP_SPAWN_TIMEOUT 에러 코드 등재
- M2: E17 startTime 선언 추가
- M3: AES-GCM 포맷 3곳 통일 (base64(iv):base64(ciphertext+authTag))
- M4: E14 p-queue timeout 주석 수정
- M5: E12 TEARDOWN → agent-loop.ts finally 블록 명시
- N1: Enforcement grep false positive 수정

## 미결 사항 (Steps 6–7 해결 예정)
- Step 6: 완성된 파일 구조 (30개 파일 상세 디렉토리 트리)
- Step 7: 검증 체크리스트 + Architecture Complete

## Next Steps
- Step 6: Project Structure (완전한 파일 트리 + 각 파일 역할)
- Step 7: Architecture Validation + Complete
