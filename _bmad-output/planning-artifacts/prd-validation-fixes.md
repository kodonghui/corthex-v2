# PRD Validation — Required Fixes

**Source:** `prd-validation-report.md` (V-02 through V-08 + ECC Gap Injection)
**Date:** 2026-03-21
**Reviewers:** analyst (Writer), winston (8/10), john (7/10), quinn (8/10) — avg 7.67 PASS
**Target:** `prd.md` (v3 OpenClaw PRD)

---

## CRITICAL Fixes (Must resolve before implementation)

### FIX-1: Add FR-TOOLSANITIZE (ECC-1, PM escalated)
**Source:** ECC-1, john PM escalation
**Location:** After FR-MEM11 or in SEC domain requirements
**Action:** Add new FR: "에이전트가 도구 응답 내 프롬프트 주입 시도를 감지하고 무력화한다 (도구 응답 컨텐츠 내 지시문 패턴 strip 또는 격리)"
**Why:** n8n webhooks (Sprint 2) introduce external tool responses — must have defense before Sprint 2 goes live.

### FIX-2: Add Go/No-Go #9 — Capability Evaluation (ECC-3, PM escalated)
**Source:** ECC-3, john/quinn confirmation
**Location:** L449 (after Go/No-Go #8)
**Action:** Add gate: "Capability Evaluation — 동일 태스크 N ≥ 3회 반복 시 3회차 재수정 횟수가 1회차 대비 ≤ 50%"
**Why:** Sprint 3 could pass with working plumbing but zero business improvement. Needs statistical methodology: N ≥ 3 runs per stage, clear "재수정" measurement, standardized task corpus.

### FIX-3: Resolve Reflections Table Contradiction (MISSED-1)
**Source:** quinn (confirmed john)
**Location:** L99 (Option B description) vs L862 (Feature 5-4) vs FR-MEM4/5/8 vs L876 (migration)
**Action:** Either:
- (a) Update Option B description: "observations + reflections 신규 테이블 2개 추가, agent_memories는 기존 유지" — if separate tables is the intent
- (b) Remove all references to separate reflections table — if truly extending agent_memories
**Why:** Core architecture contradiction. Sprint 3 scope, zero-regression (MEM-1), and migration strategy depend on resolution.

### FIX-4: Align FR-MEM4 API Reference (MISSED-2)
**Source:** quinn
**Location:** FR-MEM4 (L2326)
**Action:** Change "Gemini API로 요약" → "Haiku API로 요약" (or update NFR-COST3 cost projection)
**Why:** Cost gate (NFR-COST3: $0.10/day) and Go/No-Go #7 are based on Haiku pricing. Gemini pricing invalidates the threshold.

---

## HIGH Fixes (Should resolve before implementation)

### FIX-5: Fix 5 FR Format Violations (V-05)
**Source:** V-05 Measurability
**Locations:** FR-PERS4 (L2315), FR-PERS5 (L2316), FR-N8N3 (L2293), FR-MKT4 (L2305), FR-MKT5 (L2306)
**Action:** Add actors to passive-voice FRs. Reclassify FR-PERS5 as NFR (architecture constraint, not user capability).

### FIX-6: FR-OC7 Implementation Leakage (V-07, CR-1)
**Source:** V-07 + winston CR-1
**Location:** FR-OC7 (L2283)
**Action:** Replace entire PostgreSQL LISTEN/NOTIFY + raw SQL + Hono WebSocket Helper block with one sentence: "서버가 activity_logs 테이블 변화를 실시간으로 감지하여 WebSocket을 통해 office 클라이언트에 상태 이벤트를 전달한다."
**Why:** Most severe single implementation leakage violation in the PRD.

### FIX-7: Update Go/No-Go #6 Subframe Reference (CR-3)
**Source:** winston CR-3, john confirmation
**Location:** L447 (Go/No-Go #6)
**Action:** Replace "Subframe" with "Stitch 2" or current UXUI toolchain name.

### FIX-8: Reclassify Orphan FRs (V-06)
**Source:** V-06 Traceability
**Actions:**
- FR-PERS5 → Reclassify as NFR-CQ2 or PER domain constraint
- FR-N8N3 → Merge into FR-N8N1 as implementation detail or move to "Scope: Engineering Cleanup"
- Add brief Journey 11 or expand Journey 1 for CEO navigation simplification (FR-UX1-3 coverage gap)

---

## MEDIUM Fixes (Recommended)

### FIX-9: Extract Implementation Details from 8 v3 FRs (V-07)
**Source:** V-07 Implementation Leakage (17 FR violations)
**Action:** Move internal file paths, framework API patterns (proxy(), upgrade()), Zod schemas, raw SQL, and migration file names to architecture documentation. Keep capability language in FRs.
**Note:** Reclassify 3 "Hono" framework name references as scope constraints (informational); keep API-level patterns as violations.

### FIX-10: Add NFR Measurement Methods (V-05)
**Source:** V-05 Measurability (7 NFR violations)
**Actions:**
- NFR-O1: Add metric for acceptable deployment downtime
- NFR-CQ1: Add standalone measurable criterion
- NFR-A1/A2: Specify measurement tool (axe, Lighthouse)
- NFR-O2/O3: Add measurable outcomes
- NFR-AV1: Explicitly state "월간" measurement period

### FIX-11: Consolidate Deferred Items (CR-2)
**Source:** winston CR-2
**Action:** Add consolidated "Deferred Items" appendix cross-referencing L1404, L1719, L1909 + any other scattered deferrals.

---

## INFORMATIONAL (No action required)

### INFO-1: Big Five Scale Divergence (CR-4)
Brief uses 0.0–1.0 float; PRD uses 0–100 integer. Deliberate Decision 4.3.1 — more UX-friendly, avoids float issues. No fix needed.

### INFO-2: WebSocket Channel Count (V-04)
Brief says 14 channels; PRD says 16. PRD is code-verified (shared/types.ts audit). Brief was stale. No fix needed.

### INFO-3: ECC-2 (confidence/domain_type)
DEFERRED to architect decision. Optimization fields, not core requirements.

### INFO-4: ECC-4 (NFR-LOG expansion)
DEFERRED to post-v3 hardening. Existing domain requirements provide adequate audit coverage for v3 scope.

---

## Summary

| Priority | Count | Items |
|----------|-------|-------|
| CRITICAL | 4 | FIX-1 (FR-TOOLSANITIZE), FIX-2 (Go/No-Go #9), FIX-3 (reflections contradiction), FIX-4 (Gemini→Haiku) |
| HIGH | 4 | FIX-5 (FR format), FIX-6 (FR-OC7 leakage), FIX-7 (Subframe→Stitch 2), FIX-8 (orphan FRs) |
| MEDIUM | 3 | FIX-9 (impl leakage extraction), FIX-10 (NFR metrics), FIX-11 (deferred items) |
| INFORMATIONAL | 4 | No action required |
| **TOTAL** | **15** | **11 actionable fixes** |
