---
reviewer: critic-a
sections: step-09 (Functional Requirements) + step-10 (Non-Functional Requirements)
date: 2026-03-14
status: review-complete
---

# CRITIC-A Review: PRD Step-09 + Step-10
> Sections reviewed: lines 916–1151 of prd.md
> Cross-reference: Product Brief (tools-integration/product-brief.md)

---

## Overall Scores

| Section | Score | Verdict |
|---------|-------|---------|
| FR-CM: Credential Management | 9/10 | ✅ RESOLVE 단계 + typed error 완전 |
| FR-TA: Agent Tool Assignment | 7/10 | ⚠️ FR-TA4 Architecture phase 결정 선점 |
| FR-MCP: MCP Server Management | 9/10 | ✅ 8단계 패턴 정확, INIT handshake 포함 |
| FR-DP: Document Processing | 9/10 | ✅ Phase labels 정확, corporate 프리셋 명세 구체적 |
| FR-RM: Report Management | 7/10 | ⚠️ distribute_to 채널 Phase 레이블 누락 |
| FR-CP: Content Publishing & Media | 9/10 | ✅ Phase 레이블 전부 정확, quota 수치 일치 |
| FR-WD: Web Data Acquisition | 9/10 | ✅ Jina API 키 불필요 명시, Phase 경계 정확 |
| FR-SO: Security & Observability | 7/10 | **FAIL** — run_id 누락 (NFR-P4 자기 참조 불일치) |
| NFR-P: Performance | 8/10 | ⚠️ NFR-P4 run_id 의존하나 FR-SO2 스키마에 없음 |
| NFR-S: Security | 9/10 | ✅ AES-256 + P0 credential 강제 완전 |
| NFR-R: Reliability | 9/10 | ✅ save_report 부분 실패 계약 일관 |
| NFR-SC: Scalability | 9/10 | ✅ Puppeteer ≤10 + compose_video async 정확 |
| NFR-I: Integration | 8/10 | ⚠️ NFR-I2 연결 테스트 INIT 핸드셰이크 누락 |

**Overall Step-09+10 score: 8/10 — REQUIRES FIXES before approval**

---

## Issue 1 (HIGH — FR-SO2 + NFR-P4, lines 1002 + 1048)
### run_id 누락 — FR-SO2 이벤트 스키마와 NFR-P4 측정 방식 자기 모순

**Location:** prd.md line 1002 (FR-SO2) + line 1048 (NFR-P4)

**FR-SO2 says (line 1002):**
```
{ company_id, agent_id, tool_name, started_at, completed_at, success: bool, error_code?: string }
```

**NFR-P4 says (line 1048):**
> "측정: 첫 tool call `started_at` → 마지막 tool_result `completed_at` **(동일 run_id 내)**"

**Problem:** NFR-P4 비즈니스 파이프라인 E2E 측정이 `run_id`를 기준으로 집계하는데, FR-SO2의 이벤트 로그 스키마에 `run_id`가 없다. 동일 run_id 내 첫 started_at ~ 마지막 completed_at을 특정하려면 `run_id`가 각 이벤트에 기록되어야 한다.

추가로, Step-03에서 Pipeline Completion Gate가 **run_id** 기반 집계로 이미 업그레이드 확정됨 (line 227: telemetry schema `{ ..., run_id }`). FR-SO2는 이 결정을 반영하지 않았다.

두 개의 모순 지점:
1. NFR-P4 내부 자기 모순: run_id 스키마 없이는 NFR-P4 측정 불가
2. Step-03 결정과 FR-SO2 불일치: run_id는 이미 확정된 telemetry 필드

**Required Fix:**
```
FR-SO2: 모든 도구 호출 이벤트가 로그에 기록될 수 있다:
  { company_id, agent_id, tool_name, started_at, completed_at, success: bool,
    error_code?: string, run_id: string }
  — run_id: 동일 에이전트 세션 내 파이프라인 단위 집계 키 (NFR-P4 E2E 측정 필수)
```

---

## Issue 2 (MEDIUM — FR-RM1, line 963)
### distribute_to 채널 'notion'(Phase 2) + 'google_drive'(Phase 3) Phase 레이블 누락

**Location:** prd.md line 963, FR-RM1 파라미터 목록

**FR-RM1 says:**
```
distribute_to: ['web_dashboard'|'pdf_email'|'notion'|'google_drive']
```
(FR-RM1은 Phase 1 feature로 표시됨)

**Problem:** `save_report`는 Phase 1이지만 `distribute_to` 채널 중 두 개가 Phase 2+ 의존성을 가진다:
- `notion`: Phase 2 Notion MCP 서버 설정 필요 (Integration Registry + Step-08 Post-MVP 모두 Phase 2 명시)
- `google_drive`: Phase 3 Google Workspace MCP 에코시스템 필요

Phase 1 구현자가 FR-RM1을 읽으면 4개 채널을 모두 Phase 1에서 구현해야 한다고 해석한다. 이는 Phase 1 스코프를 크게 초과하고 Phase 2 MCP 인프라가 없는 상태에서 `notion` 채널 구현 불가능 상황을 만든다.

**Required Fix:**
```
distribute_to 파라미터 Phase 레이블 추가:
- 'web_dashboard': Phase 1
- 'pdf_email': Phase 1
- 'notion': **Phase 2** (Notion MCP 서버 구성 후 활성화)
- 'google_drive': **Phase 3** (Google Workspace MCP 에코시스템 후 활성화)

Phase 1 초기 구현 범위: web_dashboard + pdf_email 채널만
```

---

## Issue 3 (MEDIUM — NFR-I2, line 1142)
### MCP 연결 테스트 스펙에서 INIT 핸드셰이크 누락

**Location:** prd.md line 1142, NFR-I2

**NFR-I2 says:**
> "Admin UI 연결 테스트에서 `tools/list` 성공 여부 명시적 검증 — 프로토콜 비호환 MCP 서버를 사전 감지"

**Problem:** MCP 프로토콜 spec은 `tools/list` 이전에 3단계 `initialize` 핸드셰이크를 필수 요구한다 (FR-MCP4 INIT 단계에서 이미 명시). 연결 테스트 스펙이 `tools/list` 성공만 검증 기준으로 명시하면, 구현자가 initialize 핸드셰이크 없이 `tools/list`를 직접 보내는 테스트를 작성할 위험이 있다. 프로토콜 호환 MCP 서버는 초기화 없는 `tools/list`를 거부한다.

Step-05+06에서 MCP INIT 핸드셰이크 누락이 이미 수정됨. NFR-I2는 같은 수정이 적용되지 않았다.

**Required Fix:**
```
NFR-I2 연결 테스트 기준:
"Admin UI 연결 테스트에서 전체 MCP 초기화 시퀀스 검증:
 (1) initialize 요청 전송 → server initialize 응답 수신
 (2) initialized 알림 전송
 (3) tools/list 요청 전송 → 도구 스키마 목록 수신 성공
 — 세 단계 중 하나라도 실패 시 '프로토콜 비호환' 판정, Admin에 구체적 실패 단계 표시"
```

---

## Issue 4 (MEDIUM — FR-TA4, line 935)
### FR-TA4 "MCP 접근 기본값 구성" — Step-07 Architecture phase 결정 선점

**Location:** prd.md line 935, FR-TA4

**FR-TA4 says:**
> "Admin이 에이전트 Tier(Workers/Specialists/Managers)에 따라 MCP 접근 기본값을 구성할 수 있다"

**Step-07 RBAC 수정 내용 (from step-07 fixes):**
> "MCP 없음 (기본값 — Architecture phase에서 hard block vs. configurable default 결정 필요)"

**Problem:** Step-07 RBAC 섹션은 Workers MCP 접근을 "hard block vs. configurable default" 결정을 Architecture phase로 명시적 위임했다. FR-TA4는 이 결정을 선점하여 "Admin이 구성할 수 있다" — 즉 configurable default — 로 capability contract에 확정해버린다.

이 FR이 그대로 남으면 Architecture phase에서 engine-level hard block을 결정해도 이미 FR에 "Admin 구성 가능"이 명시된 상태라 충돌이 발생한다.

**Required Fix (2 options):**
1. FR-TA4에 조건부 주석 추가: "Admin이 에이전트 Tier에 따라 MCP 접근 기본값을 구성할 수 있다 *(Specialists/Managers 한정 — Workers MCP 접근 여부는 Architecture phase에서 hard block vs. configurable default 결정)*"
2. FR-TA4를 Specialists/Managers 범위로만 명시: "Admin이 Specialist/Manager 에이전트의 Tier별 MCP 접근 기본값을 구성할 수 있다 (Workers MCP 접근 정책: Architecture phase 결정)"

---

## Section-by-Section Feedback

### John (PM) — Completeness & Scope Accuracy

**FR-CM Credential Management (9/10):**
RESOLVE 단계(FR-CM4)가 "spawn 이전" 명시됨 — 올바른 순서. `CREDENTIAL_TEMPLATE_UNRESOLVED` vs `AGENT_MCP_CREDENTIAL_MISSING` 구분이 명확: 전자는 템플릿 파싱 오류(설정 오류), 후자는 MCP spawn 시 credentials 테이블 미등록(사용자 오류). 이 구분이 FR과 NFR-R1 typed error 표에 일관되게 반영됨.

**FR-SO Security & Observability (7/10):**
Issue 1에 기재. FR-SO4 Audit Log UI가 Phase 2로 정확히 표시됨 ✓. FR-SO5/SO6 할당량 자동 제어 (80% 알림 + 100% 자동 비활성화)가 NFR-SC4 표와 일치 ✓.

NFR-P1 SLA 표 측정 방법이 "Tool call event log (duration_ms)"를 참조하는데, FR-SO2 이벤트 스키마는 `started_at`과 `completed_at`만 있고 `duration_ms`는 없다. `duration_ms`는 `completed_at - started_at`으로 도출 가능하므로 블로커는 아니지만, NFR-P1 측정 방법 칼럼을 "Tool call event log (completed_at - started_at)" 또는 "`duration_ms` (derived)"로 명확히 하면 구현 혼선을 줄일 수 있다 (LOW).

**FR-DP Document Processing (9/10):**
`md_to_pdf` corporate 프리셋: Pretendard 폰트 + `#0f172a` 헤더 + `#3b82f6` 강조 + A4 + 페이지 번호 — 전부 구체적이고 Architecture phase에서 직접 구현 가능한 수준. Phase 2 `ocr_document` Claude Vision 구현 — 미결 결정이 없고 범위가 명확 ✓.

### Sally (UX) — User Impact

**FR-RM Report Management (7/10):**
Issue 2에 기재. FR-RM5/RM6 Admin + Human 분리 라우트(`/admin/reports` vs `/reports`) — Step-07 RBAC 표에서 Human 역할 추가 요청과 일치 ✓. `get_report` Phase 1 포함(FR-RM4) — Step-07+08 Issue 3(get_report fallback 누락)의 수정을 FR 수준에서도 반영함 ✓.

**FR-MCP3 연결 테스트 (FR + NFR 일관성):**
FR-MCP3는 "연결 테스트를 실행하고 성공/실패 상태를 즉시 확인" — 추상적 WHAT 수준으로 올바름. NFR-I2가 WHAT 수준에서 측정 기준을 명시하는 역할인데, Issue 3에서 기준이 불완전함이 확인됨. FR-MCP3 자체는 수정 불필요.

### Mary (BA) — Business Case

**NFR-R2 save_report 부분 실패 계약 (9/10):**
FR-RM2(FR 수준)와 NFR-R2(NFR 수준)가 동일한 계약을 양면에서 명시 — Journey 6 최민준 에러 복구 패턴과 완전히 일치. "DB 저장 → 배포 순서 보장" + "에이전트 자율 재시도 결정" 조합은 올바른 부분 실패 설계. ✓

**NFR-I4 send_email 첨부파일 전제 조건 (9/10):**
"미지원 시 send_email 도구 업그레이드가 save_report 구현의 선행 조건"으로 Phase 1 Gate 5 의존성이 명시됨. 이 전제 조건이 Epic 구현 순서에서 반드시 검증되어야 함을 BA가 스프린트 계획에서 포착해야 하는 포인트. 잘 명시됨 ✓.

---

## Cross-Check Results

| Check Item | Result |
|-----------|--------|
| FR-CM4 RESOLVE 단계 "spawn 이전" 명시 | ✓ |
| CREDENTIAL_TEMPLATE_UNRESOLVED vs AGENT_MCP_CREDENTIAL_MISSING 구분 | ✓ NFR-R1 표와 일치 |
| FR-MCP4 8단계 패턴 (RESOLVE→SPAWN→INIT→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN) | ✓ INIT 3-way handshake 포함 |
| FR-MCP4 INIT: protocol_version "2024-11-05" | ✓ Step-05+06 수정 반영됨 |
| FR-SO2 run_id 포함 여부 | ✗ 누락 — NFR-P4 자기 모순 |
| NFR-P4 run_id 의존성 | ✗ FR-SO2 스키마에 run_id 없음 |
| distribute_to Phase 레이블 (notion=Phase2, google_drive=Phase3) | ✗ 누락 |
| NFR-I2 연결 테스트 INIT 핸드셰이크 | ✗ `tools/list`만 명시 |
| FR-TA4 vs Step-07 Architecture phase 결정 일관성 | ⚠️ hard block vs. configurable 결정 선점 |
| NFR-R2 save_report 부분 실패 계약 일관성 | ✓ FR-RM2와 일치 |
| NFR-I4 send_email 첨부파일 Gate 5 영향 명시 | ✓ |
| Typed error 코드 전체 목록 (NFR-R1) | ✓ 8개 error 코드 완전 |
| Puppeteer ≤10 인스턴스 (NFR-SC1) | ✓ Architecture phase 확정 표시 정확 |
| compose_video async job (NFR-SC2) | ✓ 15분 + job_id 즉시 반환 |
| NFR-SC3 텔레메트리 인덱스 (company_id + started_at DESC) | ✓ Step-07 DB 아키텍처와 일치 |
| FR-CP Phase 레이블 (publish_x/instagram/youtube = Phase 2) | ✓ |
| credential-scrubber 100% coverage (FR-SO1) | ✓ |

---

## Summary of Required Fixes

| # | Priority | Section | Fix |
|---|----------|---------|-----|
| 1 | HIGH | FR-SO2 (line 1002) | run_id 추가: `{ ..., run_id: string }` — NFR-P4 E2E 측정 + Pipeline Gate 의존 |
| 2 | MEDIUM | FR-RM1 (line 963) | distribute_to 채널에 Phase 레이블: notion=Phase 2, google_drive=Phase 3 |
| 3 | MEDIUM | NFR-I2 (line 1142) | 연결 테스트 기준에 INIT 핸드셰이크 3단계 명시 |
| 4 | MEDIUM | FR-TA4 (line 935) | Workers MCP 접근 정책 Architecture phase 위임 명시 |
