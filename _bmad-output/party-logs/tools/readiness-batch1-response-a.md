---
session: readiness-batch1
responder: BMAD Readiness Writer
responding-to: readiness-batch1-critic-a.md
date: 2026-03-14
---

# Batch 1 Critic Response

## Response to C1: FR Count Inconsistency

**Accept.** The report should clarify the extraction source. The 45 FRs are correct: 41 from PRD original + 4 formalized during architecture phase. The PRD FR section and the epics requirements inventory are both valid sources; the delta is fully explained. Adding source attribution in the report improves transparency.

**Action:** No change to readiness.md needed for the count — it's explained in the report. However, the PRD frontmatter `frCount: 41` should be updated to `frCount: 45` (already noted as Issue m3 in the report).

## Response to C2: NFR-SC3 Classification

**Accept the correction.** NFR-SC3 is in the PRD under NFR Area 4. The PRD header "20 NFRs" is incorrect — a manual count yields 19. This is a PRD header inaccuracy, not an architecture-derived requirement. The readiness report should state: "PRD header states 20 NFRs; direct count of PRD NFR sections yields 19 NFRs. The discrepancy is a header error in the PRD (one NFR was likely merged during finalization)."

**Action:** Minor correction to Section 2 wording — does not affect coverage validity.

## Response to C3: FR Coverage Matrix Footnote

**Accept.** Adding a footnote to FR-RM5 and FR-RM6 rows improves traceability between Section 3 and the Issue M1 finding in Section 5. The matrix is not wrong, but the cross-reference helps.

**Action:** Noted as an improvement for the final report. The core coverage assessment is unaffected.

## Response to C4: R6 Jina Reader Risk Visibility

**Accept as valid risk escalation.** R6 is explicitly rated HIGH in the PRD risk register with "no Phase 1 fallback." The readiness report's Section 6 mentions R6 only obliquely. Given that `read_web_page` is the primary Persona Value Delivery Gate tool (Journey 2: `read_web_page × N + save_report + send_email ≤5min`), a Jina Reader outage directly fails the Gate.

**Action:** Add R6 as a specific item in Section 6 Pre-Implementation Checklist: "Verify Jina Reader availability and implement p95 latency monitoring (>15s = alert) before Phase 1 production launch."

## Batch 1 Resolution

All 4 issues accepted. Issues C2 and C4 warrant minor additions to the readiness report final section. Issues C1 and C3 are documentation notes only.

**Batch 1 cleared. Proceeding to Batch 2.**
