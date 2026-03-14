---
step: prd-step09-10
reviewer: critic-b
date: 2026-03-14
sections: Functional Requirements (lines 916–1009) + Non-Functional Requirements (lines 1011–1151)
---

# CRITIC-B Review: PRD Step-09 (Functional Requirements) + Step-10 (Non-Functional Requirements)

## Section Scores

| Section | Score | Verdict |
|---------|-------|---------|
| FR 영역 1: Credential Management | 9/10 | ✅ RESOLVE step + error contract complete |
| FR 영역 2: Agent Tool Assignment | 9/10 | ✅ FR-TA4 Tier MCP policy included |
| FR 영역 3: MCP Server Management | 9/10 | ✅ 8단계 패턴 + transport 타입 완전 명세 |
| FR 영역 4: Document Processing | 9/10 | ✅ Phase 레이블 정확 |
| FR 영역 5: Report Management | 7/10 | ⚠️ notebooklm 채널 누락 — 제외 근거 없음 |
| FR 영역 6: Content Publishing & Media | 9/10 | ✅ compose_video async 패턴 정확 |
| FR 영역 7: Web Data Acquisition | 9/10 | ✅ Jina URL 전달 방식 명시됨 |
| FR 영역 8: Security & Observability | 5/10 | ❌ FR-SO2 run_id 누락 — Pipeline Gate 측정 불가 |
| NFR 영역 1: Performance | 8/10 | ⚠️ NFR-P4 Phase 2 벤치마크 Phase 레이블 없음 |
| NFR 영역 2: Security | 10/10 | ✅ P0 vs HIGH 버그 구분 명확 |
| NFR 영역 3: Reliability | 10/10 | ✅ save_report 부분 실패 계약 완전 명세 |
| NFR 영역 4: Scalability | 10/10 | ✅ Architecture phase 결정 위임 명시됨 |
| NFR 영역 5: Integration | 10/10 | ✅ send_email 첨부파일 전제조건 Phase 1 Gate 연결됨 |

---

## Winston (Architect) — Architecture Consistency

**Finding 1 — CRITICAL: FR-SO2 `tool_call_events` 스키마에 `run_id` 누락**

PRD line 1002 (FR-SO2) 스키마:
```
{ company_id, agent_id, tool_name, started_at, completed_at, success: bool, error_code?: string }
```

`run_id` 필드 없음.

그러나 PRD는 동일 문서 내에서 `run_id`를 두 곳에서 전제한다:

**전제 1 — NFR-P4 (line 1048):**
> "측정: 첫 tool call `started_at` → 마지막 tool_result `completed_at` (**동일 run_id 내**)"

**전제 2 — Go/No-Go Gate (line 237, step-03):**
> "Pipeline completion 측정: 동일 run_id 내 ≥2행 tool_call_events — run_id 없이 불가"

`tool_call_events` 테이블에 `run_id` 컬럼이 없으면:
- NFR-P4 파이프라인 E2E 측정 불가 (동일 run의 첫/마지막 이벤트를 GROUP BY 불가)
- Go/No-Go Pipeline completion Gate SQL 쿼리 자체가 불가 (`동일 run_id 내 ≥2행` 집계 불가)
- 두 핵심 측정 지표가 동시에 무력화됨 → Phase 1 Go/No-Go 판단 불가

**Fix:** FR-SO2 스키마에 `run_id` 추가:
```
{ company_id, agent_id, run_id, tool_name, started_at, completed_at, success: bool, error_code?: string }
```
Note: Product Brief line 658 — "run_id: pipeline grouping identifier generated at agent session start" 명시됨.

---

## Amelia (Dev) — Implementation Complexity

**Finding 2 — VERIFIED: FR-MCP4 8단계 패턴 완전 명세** ✅

Line 942–947:
- RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN 순서 ✅
- INIT: JSON-RPC initialize 요청 → server 응답 → client initialized 알림 (protocol_version: "2024-11-05") ✅ (3-way handshake 완전)
- DISCOVER: `tools/list` 요청 (INIT 완료 후에만 실행) ✅
- MERGE: `messages.create()` tools[] 병합, `server__tool_name` 네임스페이스 ✅
- EXECUTE: MCP 네임스페이스 tool_use 블록 감지 → 해당 서버 라우팅 ✅
- RETURN: tool_result를 다음 messages.create() 주입 ✅

Brief lines 149–163과 PRD Innovation 섹션 일치 완전 확인.

**Finding 3 — VERIFIED: FR-SO7 + NFR-S2 typed error vs P0 구분** ✅

NFR-S2 (line 1064): "`{{credential:key}}` 리터럴 템플릿이 출력에 나타나는 것은 설정 오류(HIGH 버그) — 실제 credential 값 미노출이므로 P0 인시던트가 아님 (`CREDENTIAL_TEMPLATE_UNRESOLVED` 로그)"

Brief line 538과 정확히 일치. 개발자가 `{{credential:*}}` 리터럴 출력을 P0 보안 인시던트로 잘못 처리하는 것 방지.

---

## Quinn (QA) — Edge Cases & Coverage

**Finding 4 — MODERATE: NFR-P4 경쟁사 분석 파이프라인 벤치마크에 Phase 2 레이블 없음**

PRD line 1047:
> "경쟁사 분석 파이프라인 (`read_web_page` × 3 + **`web_crawl` × 1** + `md_to_pdf` + `send_email`): ≤5분"

`web_crawl`은 Phase 2 도구 (FR-WD2 line 993 명시). 그러나 NFR-P4 벤치마크 타겟에 Phase 2 레이블이 없다.

실용적 위험: Phase 1 QA가 이 벤치마크를 Phase 1 성능 검증 항목으로 인식하고 `web_crawl` 미구현 상태에서 테스트 실패를 NFR 위반으로 보고할 수 있다. NFR-P4는 이미 "단일 에이전트 파이프라인" 주석이 있으나 Phase 구분은 없다.

**Fix:** Line 1047 수정:
> "경쟁사 분석 파이프라인 (`read_web_page` × 3 + `web_crawl` × 1 + `md_to_pdf` + `send_email`): ≤5분 *(Phase 2 측정 가능 — `web_crawl` Phase 2 도구)*"

**Finding 5 — LOW: FR-RM1 `distribute_to` 채널에 `notebooklm` 누락 — 제외 근거 없음**

PRD line 963 (FR-RM1):
```
distribute_to: ['web_dashboard'|'pdf_email'|'notion'|'google_drive']
```

Product Brief line 117: `save_report` 채널 목록에 `notebooklm` 포함.

PRD Capability Contract 헤더 (line 919): "여기에 없는 기능은 최종 제품에 존재하지 않습니다."

`notebooklm` 채널이 의도적으로 제외된 것인지 단순 누락인지 알 수 없다. Phase 2로 연기되었다면 Phase 레이블을 붙여야 하고, 범위 외라면 Brief와의 불일치를 명시해야 한다.

**Fix 옵션 A (Phase 2 연기):** `distribute_to` 파라미터 설명에 추가:
> `notebooklm`: Phase 2 (Google NotebookLM API 통합 — Phase 1 out of scope)

**Fix 옵션 B (영구 제외):** FR-RM1 노트 추가:
> Note: `notebooklm` 채널은 Google NotebookLM 공개 API 미제공으로 제외. Brief 범위와 상이.

---

## Bob (SM) — Scope Realism

**Finding 6 — VERIFIED: FR-CP1 publish_tistory 파라미터 완전 반영** ✅

Line 974: `title`, `visibility`(0=비공개/3=공개), `category`, `tags[]`, `scheduled_at` — Brief line 127과 정확 일치.

**Finding 7 — VERIFIED: FR-WD1 Jina URL 전달 방식** ✅

Line 991: "에이전트는 원본 URL만 전달; Jina Reader 프리픽스는 도구 내부에서 자동 추가" — Brief line 140과 일치.

**Finding 8 — VERIFIED: FR-CP8 compose_video async 패턴** ✅

Line 983: "비동기 job으로 제출하고 `job_id`를 즉시 받아 상태를 폴링할 수 있다" — Brief의 async job pattern 요구사항 충족.

**Finding 9 — VERIFIED: NFR-P1 SLA 수치** ✅

`md_to_pdf` <10s/1p, <20s/10p; `read_web_page` <8s; `web_crawl(scrape)` <12s; `ocr_document` <8s/1p, <20s/10p — Brief lines 505–513과 완전 일치.

**Finding 10 — VERIFIED: NFR-P3 call_agent 60s 적용 범위** ✅

Line 1042: "에이전트 간 핸드오프 체인만. 단일 에이전트 다중 도구 순차 실행 미포함" — Brief line 509–510과 정확 일치.

**Finding 11 — VERIFIED: NFR-SC1 Puppeteer Architecture phase 위임** ✅

Line 1115: "인스턴스 풀 크기 최종값: 로컬 10개 동시 실행 부하 테스트 결과로 Architecture phase 확정" ✅

**Finding 12 — VERIFIED: NFR-I4 send_email Phase 1 Gate 연결** ✅

Line 1150: "Phase 1 Go/No-Go Gate 5 직접 영향" — 첨부파일 지원 전제조건이 Phase 1 Gate와 명시적으로 연결됨 ✅

---

## Summary: Issues Requiring Fixes

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Line 1002 (FR-SO2) | `tool_call_events` 스키마 `run_id` 누락 — NFR-P4 파이프라인 측정 + Go/No-Go Pipeline Gate SQL 동시 불가 |
| 2 | MODERATE | Line 1047 (NFR-P4) | 경쟁사 분석 파이프라인 벤치마크 내 `web_crawl`(Phase 2)에 Phase 레이블 없음 |
| 3 | LOW | Line 963 (FR-RM1) | `notebooklm` 채널 누락 — Brief line 117 포함, 제외 근거 없음 |

**Total: 3 issues (1 critical, 1 moderate, 1 low)**

---

## Verified Items (no fixes needed)

| Item | Verdict |
|------|---------|
| FR-MCP4 8단계 패턴 (RESOLVE→TEARDOWN) | ✅ Brief lines 149–163과 완전 일치 |
| INIT 3-way handshake (protocol_version: "2024-11-05") | ✅ PRD Innovation 섹션과 일치 |
| FR-RM2 save_report 부분 실패 계약 | ✅ DB 저장 → 배포 순서 보장, rollback 금지 |
| FR-SO7 typed error 전용 (블랙박스 0건) | ✅ NFR-R1 오류 코드 테이블 8개 항목 정확 |
| NFR-S2 credential 리터럴 vs 실제값 P0 구분 | ✅ Brief line 538과 일치 |
| FR-CP1 publish_tistory 파라미터 | ✅ visibility/category/tags/scheduled_at 완전 |
| FR-WD1 Jina Reader URL 전달 방식 | ✅ 에이전트 원본 URL만 전달, 프리픽스 내부 처리 |
| FR-CP8 compose_video async job_id 패턴 | ✅ Brief 요구사항 충족 |
| FR-MCP1 transport: stdio\|sse\|http | ✅ 3가지 transport 타입 모두 포함 |
| FR-TA4 Tier별 MCP 접근 기본값 구성 | ✅ Special Focus Area 검증 완료 |
| NFR-P1 SLA (5개 도구 수치) | ✅ Brief lines 505–513 일치 |
| NFR-P3 call_agent 60s 적용 범위 제한 | ✅ 핸드오프 체인만, 외부 API 제외 |
| NFR-SC1 Puppeteer Architecture phase 결정 위임 | ✅ "최종값 Architecture phase 확정" 명시 |
| NFR-S4 multi-tenant 격리 (5개 신규 테이블) | ✅ company_id 강제, getDB(ctx.companyId) |
| NFR-I4 send_email 첨부파일 전제조건 + Phase 1 Gate 연결 | ✅ Gate 5 직접 영향 명시 |
| Accessibility NFR 제외 근거 | ✅ Line 1013 "관련 없는 카테고리 제외" 정당 — B2B Admin 도구 |
| NFR-R3 SIGTERM→5초→SIGKILL + zombie process 30초 감지 | ✅ R3 mitigation과 일치 |

---

## Context

Project type: `saas_b2b` (40%) + `developer_tool` (30%) + `web_app` (30%)
Platform: ARM64 24GB VPS, PostgreSQL + Drizzle ORM, Hono+Bun, React+Vite.
이 섹션은 Capability Contract — 여기서 누락된 것은 구현 대상이 아님.
