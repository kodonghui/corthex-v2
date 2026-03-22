---
step: v-04
title: Product Brief Coverage Validation — Fixes Applied
date: 2026-03-22
critics: john(5.35 FAIL), winston(6.15 FAIL), quinn(7.25 PASS)
avg: 6.25
status: FAIL → fixes applied
---

# Step V-04 Fixes

## Issues Found by Critics (consolidated)

### 1. Go/No-Go Gate Count + Hallucinated Names (ALL 3 — D3 HIGH)
**Severity:** HIGH
**Found by:** john (primary), winston, quinn (confirmed)

Report said "Brief gates 1-8 → PRD gates 1-8" with hallucinated additional gate names ("marketing E2E, AI tool engine API, page integration regression, accessibility" — grep returns 0 matches).

**Actual:**
- Brief §4: 11 gates (#1-#11, L457-467)
- PRD: 14 gates (#1-#14, L456-469)
- Additional PRD gates: #9 Observation Poisoning, #10 Voyage AI Migration, #12 v1 Feature Parity, #13 Usability, #14 Capability Evaluation

**Fix:** Corrected to "Brief gates 1-11 → PRD gates 1-14" with real gate names.

### 2. Fabricated WebSocket Discrepancy (john + winston — D3 HIGH)
**Severity:** HIGH
**Found by:** john, winston

Report claimed "Brief says 14→15채널, PRD says 16→17채널" — fabricated. Brief consistently says "16→17" (L125, L176, L433, L494). No discrepancy exists.

**Fix:** Deleted entire "Informational Gap #1". Updated coverage to 100%, 0 gaps.

### 3. Missing Brief Sections (john + quinn — D2 MEDIUM)
**Severity:** MEDIUM
**Found by:** john (Technical Constraints, Future Vision), quinn (Success Metrics)

Three Brief sections not covered in V-04:
- Brief §3 Success Metrics (L320-370) — ~15 metrics, 4 business objectives
- Brief §5 Technical Constraints (L483-495)
- Brief §4 Future Vision v4+ (L469-479)

**Fix:** Added 3 new coverage areas (total: 14→17). All rated "Fully Covered".

### 4. FR/Domain Requirement Counts Wrong (winston — D3 MEDIUM)
**Severity:** MEDIUM
**Found by:** winston

- FR-PERS1~8 → should be FR-PERS1~9 (quinn also caught)
- FR-MEM1~11 → should be FR-MEM1~14
- MEM-1~5 → should be MEM-1~7

**Fix:** All counts corrected.

### 5. ~30+ Stale Sub-Section Line Numbers (ALL 3 — D3 LOW)
**Severity:** LOW
**Found by:** john, winston, quinn

Same progressive drift as V-02b. Key corrections:
- Vision: L287→L295
- Target Users: L328→L332
- Problem Statement: L287-320→L295-322
- Go/No-Go: L439-449→L456-469
- Risks: L389-399→L396-418
- AHA Moments: L1084→L1152, L1152-1180→L1237, L1028-1032→L1074
- Out of Scope: L931-948→L1007-1020
- Onboarding: L1112-1120→L1197

**Fix:** All line references updated.

### 6. Coverage % Recalculated
- Old: 98% (14 areas, 1 fabricated gap)
- New: 100% (17 areas, 0 gaps)
