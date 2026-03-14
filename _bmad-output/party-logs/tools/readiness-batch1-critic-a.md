---
session: readiness-batch1
critic: BMAD Adversarial Reviewer
target: implementation-readiness.md (Sections 1-3: Document Discovery + PRD Analysis + Epic Coverage)
date: 2026-03-14
---

# Batch 1 Critic Review — Document Discovery, PRD Analysis, Epic Coverage

## Critique Round 1

### C1: FR Count Inconsistency — Unexplained Delta

**Issue:** The PRD frontmatter says 41 FRs, the epics document says 45, and the readiness report says 45 but lists them from the *epics* document's requirements inventory — not from directly reading the PRD. This is a validation gap. The readiness report should have independently extracted FRs from the PRD itself, then compared against the epics document's formalization.

**Severity:** Minor — but worth flagging as a process note. The 4-FR delta (FR-DP3~4, FR-SO3~4) is correctly explained as architecture-phase formalization.

**Suggested fix:** Add a note clarifying the extraction source: "FRs extracted from both PRD section 'Functional Requirements' (41 original) and epics document requirements inventory (which adds 4 FRs formalized during architecture phase)."

### C2: NFR-SC3 Classification

**Issue:** The readiness report labels NFR-SC3 as "architecture-derived" to explain the PRD's "20 NFRs" claim vs the report's "19 NFRs." However, NFR-SC3 (`tool_call_events` indexes) is explicitly in the PRD under NFR Area 4: Scalability. This is not an architecture-derived requirement — it IS in the PRD. The count discrepancy explanation is incorrect.

**Severity:** Minor documentation error.

**Suggested fix:** Recount the PRD NFRs directly. The PRD lists NFR-P1~5 (5) + NFR-S1~5 (5) + NFR-R1~3 (3) + NFR-SC1~3 (3) + NFR-I1~3 (3) = 19 total. The PRD header "20 NFRs" may be the PRD itself being inaccurate, or an NFR was removed during finalization. The readiness report should state this explicitly rather than misclassifying NFR-SC3.

### C3: FR Coverage Matrix — Phase 2 "Covered" Claims

**Issue:** The coverage matrix marks FR-RM5 and FR-RM6 as covered by Epic 19 Story 19.5, but Section 5 explicitly calls out Story 19.5 as having a forward dependency on Epic 20. The matrix entry "✓ Covered" is technically correct (the story exists) but doesn't warn the reader about the scheduling constraint. A reader could miss that these FRs depend on Epic 20 completion.

**Severity:** Minor — inconsistency between Section 3 (FR Coverage) and Section 5 (Epic Quality).

**Suggested fix:** Add a footnote to FR-RM5 and FR-RM6 rows: "⚠️ Story 19.5 implementation requires Epic 20 Stories 20.1+20.3 (see Issue M1)"

### C4: Missing PRD Completeness Risk — R6 (Jina Reader HIGH Risk)

**Issue:** The PRD Analysis section (Section 2) includes a "PRD Completeness Assessment" that calls the PRD "highly complete" and lists strengths. However, it does not explicitly call out R6 (Jina Reader outage = Phase 1 Persona Value Delivery Gate failure) as a risk the readiness assessment should surface. R6 is a HIGH risk with no Phase 1 fallback — a single external dependency outage blocks the entire Persona Value Gate.

**Severity:** Major concern for readiness — the report should flag this risk prominently, not just note it exists in the PRD risk register.

**Suggested fix:** Add to Section 6 recommendations: "R6 Watch: `read_web_page` has no Phase 1 fallback if Jina Reader goes down. Verify Jina Reader SLA before production launch. Consider having Firecrawl Phase 2 fallback specification ready before Phase 1 go-live."

---

## Verdict

The Batch 1 analysis is **overall sound** with good FR extraction, complete coverage matrix, and correct phase-gating assessment. Issues C1 and C2 are minor documentation clarifications. Issue C3 is an internal consistency gap. Issue C4 is a genuine readiness risk that deserves more visibility.

**Batch 1 passes** with the above noted corrections. Proceed to Batch 2.
