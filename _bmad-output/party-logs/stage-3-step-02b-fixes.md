---
step: v-02b
title: Format Detection Parity Check — Fixes Applied
date: 2026-03-22
critics: john(7.4), winston(8.05), quinn(7.90)
avg: 7.78
status: PASS
---

# Step V-02b Fixes

## Issues Found by Critics

### 1. Stale Line Numbers (ALL 3 critics — D3)
**Severity:** LOW-MEDIUM
**Found by:** john, winston, quinn (independently confirmed)

10/11 L2 header line numbers were stale (+8 to +156 drift from pre-sweep PRD edits).

**Fix applied:**
| Section | Old | New |
|---------|-----|-----|
| Executive Summary | L265 | L273 |
| Success Criteria | L451 | L471 |
| Product Scope | L625 | L668 |
| User Journeys | L992 | L1070 |
| Domain-Specific Req | L1258 | L1352 |
| Innovation | L1439 | L1538 |
| Tech Architecture | L1677 | L1784 |
| Scoping | L1951 | L2085 |
| Functional Req | L2139 | L2285 |
| Non-Functional Req | L2343 | L2499 |

Also updated BMAD Core Sections Present block (6 line numbers).

### 2. Domain Requirement Count Wrong (Winston — D3)
**Severity:** MEDIUM
**Found by:** winston

Report said 75 domain requirements; PRD summary table (L1536) shows 80.

Discrepancies:
- N8N-SEC: reported 6, actual **8** (+2)
- MEM: reported 5, actual **7** (+2)
- NRT: reported 4, actual **5** (+1)

**Fix applied:** Updated all 75→80 references throughout report. Fixed individual category counts in V-08 table.

### 3. Missing Recommendation Note (Quinn — D6)
**Severity:** LOW
**Found by:** quinn

Recommendations section said "None" without noting line drift risk.

**Fix applied:** Added recommendation noting line numbers revalidated + domain count corrected.
