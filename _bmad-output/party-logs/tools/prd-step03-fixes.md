# PRD Step 03+04 — Fix Summary

**Round:** 1
**Applied:** 2026-03-14
**Source:** critic-b (merged critic-a + critic-b findings, 7 issues)

---

## CRITICAL Fixes

### Fix CRITICAL-1 — save_report API signature corrected (Journey 2)
**Location:** Journey 2 Rising Action
**Before:** `save_report(distribute_to: ['pdf_email'], style: 'corporate')` — `style` is md_to_pdf param, not save_report
**After:** `save_report(distribute_to: ['pdf_email'])` + note: "pdf_email 채널이 내부적으로 `md_to_pdf(style: 'corporate')`를 실행하여..."
**Source:** Brief line 110 (md_to_pdf presets) + Brief line 467 (md_to_pdf(style: 'corporate') as correct usage)

### Fix CRITICAL-2 — Publishing adoption Phase timing corrected (Business Success table)
**Location:** Business Success table row "Publishing adoption"
**Before:** Phase 1 30일 목표 ≥30%
**After:** Phase 1 = "N/A (Phase 1: publish_tistory만 존재, 60일 기준 적용)" / Phase 2 = "≥30% (출시 후 60일)"
**Source:** Brief line 496 — "within 60 days of Phase 1 release" = 60-day target, not 30-day

---

## HIGH Fix

### Fix HIGH — Tool diversity index metric added (Business Success table)
**Location:** Business Success table — new row 6 (before SaaS substitution proxy)
**Added:** `Tool diversity index | company당 주간 호출된 서로 다른 도구 수 | Week 1: ≥3개/company, Week 4: ≥6개/company | Week 8: ≥8개/company`
**Source:** Brief line ~494 — "Week 1: ≥3 distinct tools / Week 4: ≥6 distinct tools"

---

## MODERATE Fixes

### Fix MODERATE-1 — call_agent latency NFR forward reference removed
**Location:** Technical Success table — call_agent handoff E2E row
**Before:** `<60초 (PRD NFR-P6 — call_agent 체인만 해당)`
**After:** `<60초 (call_agent 체인만 해당; 단일 에이전트 다중 도구 순차 실행 미포함; 외부 API 응답 시간 제외)`
**Rationale:** NFR section doesn't exist yet in this PRD — inline SLA removes dangling reference

### Fix MODERATE-2 — CEO automation rate dual-condition measurement added
**Location:** User Success — CEO 김대표 항목
**Added footnote:** "측정: ARGOS run completion log + 동일 run_id 내 save_report(pdf_email) success 이벤트 둘 다 충족 시에만 자동화 1건 집계 — ARGOS completion 단독은 email 배포 확인 안 됨"
**Source:** Brief line 525 — dual condition requirement

### Fix MODERATE-3 — Activation Gate measurement — exact SQL added
**Location:** Go/No-Go Gates table — Activation row
**Before:** "`agents.allowed_tools JSONB` 비공 + company_ids 집계" (ambiguous/truncated)
**After:** `SELECT COUNT(DISTINCT company_id) FROM agents WHERE jsonb_array_length(allowed_tools) > 0`
**Source:** Brief line 492

### Fix MODERATE-4 — Journey 4 labeled as Phase 2 + section divider added
**Location:** Journey 4 header + Opening Scene
**Before:** "Phase 1 이후" (ambiguous)
**After:** Header: "Phase 2 시나리오 — Phase 2 이후 구현" + Opening Scene: "Phase 2 시나리오 — Phase 2 이후 구현"
**Added:** Section divider between Phase 1 journeys (1, 2, 3, 6) and Phase 2 journeys (4, 5)

---

## Confirmed Unchanged (PASSED items)
- Security Gate language ✓
- Journey 6 partial failure contract ✓
- publish_x Phase 2 label ✓
- content_calendar Phase 2 (Requirements Summary) ✓
- audit log UI Phase 2 ✓
- Pipeline Gate run_id measurement ✓

**Ready for critic re-verification.**
