# Architecture Step 02+03 — Context Snapshot

**Saved:** 2026-03-14
**Steps:** step-02 (Project Context Analysis) + step-03 (Starter Template Evaluation)
**Score:** critic-a 9/10 + critic-b 9/10 — PASS (avg 9.0/10)
**Arch File:** /home/ubuntu/corthex-v2/_bmad-output/planning-artifacts/tools-integration/architecture.md

---

## Step-02 핵심 산출물

### FR/NFR 매핑 요약
- 41개 FR × 8영역 → 아키텍처 영향 테이블
- 20개 NFR × 5영역 → 핵심 제약 요약
- 기술 제약 8개 (ARM64, messages.create() 엔진, E8 경계, D26 120s cold start 등)
- Cross-cutting concerns 6개 확인

### PRD Deferred Decisions 해결 현황
| PRD D# | Architecture 결정 |
|--------|----------------|
| D1 | D22: Workers MCP — configurable default (기본값 OFF) |
| D2 | D23: AES-256 env var `CREDENTIAL_ENCRYPTION_KEY`, Phase 4+ KMS deferred |
| D3+D4 | D24: Puppeteer 5개 초기 한도 + p-queue 30s timeout → 즉시 거부 |
| D6 | D25: Phase 1 stdio 전용, sse/http → `TOOL_MCP_TRANSPORT_UNSUPPORTED` |
| D7 | D26: lazy spawn, cold start 120s timeout, warm start SLA 3s(Notion)/5s(Playwright) |
| D8 | D29: tool_call_events 3종 인덱스 + run_id 인덱스 확정 |
| D9 | D28: credential-scrubber 세션 시작 시 전체 로드 → 빌트인+MCP 100% 스캔 |
| D12 | D27: google_drive 채널 Phase 4 확정 |

## Step-03 핵심 산출물

### DB Tables (Phase 1 — 6개)
1. `credentials` — AES-256 암호화 + (company_id, key_name) unique + createdByUserId audit
2. `mcp_server_configs` — transport/command/args/env + isActive
3. `agent_mcp_access` — (agent_id, mcp_server_id) PK + cascade
4. `reports` — run_id + distributionResults JSONB + (company_id, created_at) index
5. `tool_call_events` — run_id + 3종 인덱스 + FK companies
6. `mcp_lifecycle_events` — session_id + event + latency_ms + zombie 감지 SQL

### New Dependencies (Phase 1)
- `puppeteer@22.x`, `p-queue@8.x`, `@aws-sdk/client-s3@3.x`, `marked@12.x`

### New Files: 30개 (engine 3개 수정 포함)

### Critical Design Decisions Applied
- getMcpServersForAgent: companyId WHERE 절 포함 (D1 cross-tenant 보안)
- getDB() insertCredential/updateCredential: userId 파라미터 추가 (FR-CM6)
- mcp-manager.ts: SpawnFn 주입 인터페이스 (TEA mock 지원)
- agent_mcp_access: TEA 필수 cross-company isolation 테스트 3개 명시

## 미결 사항 (Steps 4+ 해결 예정)
- D22–D29 공식 결정 문서화 (Step 4)
- E11–E17 신규 패턴 정의 (Step 5)
- 파일 구조 상세화 (Step 6)
- 검증 체크리스트 (Step 7)

## Next Steps
- Step 4: Core Architectural Decisions (D22–D29 상세 + 추가 결정)
- Step 5: Implementation Patterns (E11–E17)
- Steps 6–7: Structure + Validation
