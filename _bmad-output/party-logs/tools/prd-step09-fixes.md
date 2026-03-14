# PRD Step 09+10 — Fix Summary

**Round:** 1
**Applied:** 2026-03-14
**Source:** critic-a (6 issues: 1 critical, 3 medium, 1 moderate, 1 low) + critic-b (3 issues: 1 critical, 1 moderate, 1 low — overlap confirmed)

---

## CRITICAL Fix

### Fix CRITICAL-1 — FR-SO2 `tool_call_events` 스키마 `run_id` 추가
**Location:** FR 영역 8: Security & Observability → FR-SO2
**Before:**
```
{ company_id, agent_id, tool_name, started_at, completed_at, success: bool, error_code?: string }
```
**After:**
```
{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success: bool, error_code?: string }
```
**Added note:** "`run_id`: 에이전트 세션 시작 시 생성되는 파이프라인 그룹 식별자 — NFR-P4 E2E 측정(`동일 run_id 내 첫/마지막 이벤트`) 및 Pipeline Go/No-Go Gate SQL(`동일 run_id 내 ≥2행` 집계)에 필수"
**Source:** Product Brief line 658 — "run_id: pipeline grouping identifier generated at agent session start"; NFR-P4 line 1048; Step-03 Pipeline Gate

---

## MEDIUM Fixes

### Fix MEDIUM-1 — FR-RM1 `distribute_to` Phase 레이블 추가
**Location:** FR 영역 5: Report Management → FR-RM1
**Before:** `distribute_to: ['web_dashboard'|'pdf_email'|'notion'|'google_drive']`
**After:** Each channel now has explicit Phase label:
- `web_dashboard`: Phase 1
- `pdf_email`: Phase 1
- `notion`: Phase 2 (Notion MCP 구성 후 활성화)
- `google_drive`: Phase 4 (Google Workspace MCP — Phase 4 Roadmap 기준)
  - Note: Integration Registry (line 735)에 "Phase 3" 표기 남아있음 — PRD 내부 불일치. Architecture phase에서 Integration Registry를 Phase 4로 교정 권고 (LOW)
- `notebooklm`: Phase 2 (Google NotebookLM API 통합 — Phase 1 out of scope) ← LOW fix 통합
**Source:** Brief line 117 (notebooklm 포함), Integration Registry Phase labels (Notion MCP = Phase 2, Google Workspace MCP = Phase 3)

### Fix MEDIUM-2 — NFR-I2 연결 테스트 INIT 핸드셰이크 전 단계 명시
**Location:** NFR 영역 5: Integration → NFR-I2
**Before:** "Admin UI 연결 테스트에서 `tools/list` 성공 여부 명시적 검증"
**After:** "(1) JSON-RPC `initialize` 요청 → server `initialize` 응답; (2) client `initialized` 알림 전송; (3) `tools/list` 요청 → 도구 스키마 수신 — 세 단계 모두 성공 시 '연결 성공'"
**Source:** MCP protocol specification — initialize 3-way handshake required before tools/list

### Fix MEDIUM-3 — FR-TA4 Workers MCP Architecture phase 위임 명시
**Location:** FR 영역 2: Agent Tool Assignment → FR-TA4
**Before:** "Admin이 에이전트 Tier(Workers/Specialists/Managers)에 따라 MCP 접근 기본값을 구성할 수 있다"
**After:** "Admin이 에이전트 Tier(Specialists/Managers)에 따라 MCP 접근 기본값을 구성할 수 있다 *(Workers MCP 접근 정책: Architecture phase 결정 사항 — engine hard block vs. configurable default 미확정)*"
**Source:** Product Brief line 185 "Workers — no MCP access by default" (not hard block); RBAC Matrix step-07 fix already qualified same ambiguity

---

## MODERATE Fix

### Fix MODERATE-1 — NFR-P4 경쟁사 분석 파이프라인 Phase 2 레이블
**Location:** NFR 영역 1: Performance → NFR-P4
**Before:** "경쟁사 분석 파이프라인 (`read_web_page` × 3 + `web_crawl` × 1 + `md_to_pdf` + `send_email`): ≤5분"
**After:** "경쟁사 분석 파이프라인 (...): ≤5분 *(Phase 2 측정 가능 — `web_crawl` Phase 2 도구)*"
**Source:** FR-WD2 (line 993) — `web_crawl` is Phase 2 (Firecrawl). Phase 1 QA false-failure prevention.

---

## LOW Fix

### Fix LOW-1 — FR-RM1 `notebooklm` 채널 추가 (MEDIUM-1에 통합)
**Location:** FR-RM1 distribute_to (Fix MEDIUM-1에 포함)
**Source:** Brief line 117 — `notebooklm` listed as save_report channel. PRD Capability Contract: "여기에 없는 기능은 최종 제품에 존재하지 않음." → Phase 2로 명시적 추가.

---

## Verification Checklist
- [x] FR-SO2: `run_id` 필드 추가 + 용도 note (NFR-P4 측정 + Pipeline Gate SQL 참조)
- [x] FR-RM1: distribute_to 5개 채널 모두 Phase 레이블 명시
- [x] FR-RM1: `notebooklm` Phase 2로 추가 (Brief line 117 일치)
- [x] NFR-I2: INIT 3-step handshake + tools/list 전 단계 명시
- [x] FR-TA4: Workers MCP 정책 Architecture phase 위임 명시
- [x] NFR-P4: web_crawl 경쟁사 파이프라인 Phase 2 레이블

**Ready for critic re-verification.**
