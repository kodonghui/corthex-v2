---
session: readiness-batch2
critic: BMAD Adversarial Reviewer
target: implementation-readiness.md (Sections 4-6: UX Alignment + Epic Quality + Final Assessment)
date: 2026-03-14
---

# Batch 2 Critic Review — UX Alignment, Epic Quality, Final Assessment

## Critique Round 2

### C5: UX Alignment "Acceptable" Verdict May Be Premature

**Issue:** The report gives a "WARNING: Minor" rating for the missing UX document and says developers can "create a quick sketch/wireframe before Epic 19." This understates the risk for a brownfield feature that introduces 5 new Admin pages that must visually integrate with the existing Admin UI system.

The existing CORTHEX v2 Admin UI has an established visual language (from Epics 7–9). The 5 new Admin pages should follow the same component patterns (table styles, button placement, modal forms, status indicators) as existing pages. Without even a brief design spec referencing existing Admin patterns, developers may implement inconsistent UI.

**Severity:** 🟠 Major concern for UX consistency (not blocking for functionality, but impacts user experience quality).

**Suggested fix:** Recommend that the dev team review 2–3 existing Admin pages (e.g., `/admin/agents`, `/admin/tiers`) before implementing Epic 19 to extract the component pattern language. Story 19.1 should include an explicit "follows existing Admin table component pattern" constraint.

### C6: Epic 21 "Acceptable Exception" Needs Qualification

**Issue:** The report calls Epic 21 (Integration Testing & Security Audit) an "acceptable exception" to the user-value-focus rule. While this is a fair assessment, the report should more clearly state *why* this exception is justified in the context of CORTHEX Tool Integration specifically — not just generically.

The reason is concrete: Epic 21 Story 21.1's Security Gate (credential-scrubber 100% coverage) is a **hard business requirement** — if it fails, Phase 2 is blocked entirely per the PRD's "Security Gate special regulation." This is not a "nice to have testing epic" — it's a gating requirement with production deployment consequences.

**Severity:** Minor — the verdict is correct, but the justification could be stronger.

**Suggested fix:** Add to Epic 21 assessment: "Epic 21 Story 21.4 Go/No-Go Gate validation is a production deployment gate — all 6 gates must pass before Phase 2. The Security Gate specifically blocks Phase 2 if any credential leak is detected. This makes Epic 21 a hard dependency, not optional quality work."

### C7: Readiness Score 8.9/10 — "Epic Quality" 8.5 Seems Low

**Issue:** The Readiness Scorecard gives "Epic Quality: 8.5/10" which, given only 1 cross-epic dep issue (19.5→20) and 2 minor concerns (m1, m2), seems like an underrated score. The epics themselves received 8.75/10 in the party review.

Additionally, "Dependency Graph: 8/10" for a single known scheduling issue (19.5) seems overly penalizing — the dependency is documented, the fix is clear, and it doesn't cause any implementation ambiguity.

**Severity:** Minor — scoring calibration.

**Suggested fix:** Revise "Dependency Graph: 8/10" to "8.5/10" with note "single scheduling issue, clearly documented." Epic Quality 8.5 is reasonable given the testing-epic exception and cross-epic dep.

### C8: Missing: Send-Email Handler MIME Upgrade — Existing Code Assumption

**Issue:** Story 20.4 assumes the existing `send-email.ts` handler "does NOT support MIME multipart attachments" and specifies it must be upgraded. However, the readiness report's Epic 20 analysis does not call out this pre-existing code dependency as a risk. If `send-email.ts` has existing tests that would break with the MIME upgrade, this could be a regression risk.

**Severity:** 🟡 Minor — the story AC specifies "backward compatible," but the readiness report doesn't verify this assumption against the existing codebase.

**Suggested fix:** Add to Section 6 Pre-Implementation Checklist: "Before Story 20.4, check if `send_email` handler in the existing codebase already supports MIME attachments (check existing tests in Epic 1–15 test suite) — if it does, Story 20.4 is smaller than estimated."

---

## Verdict

Batch 2 analysis is **sound**. The UX assessment correctly identifies the missing formal UX doc as a minor concern. The epic quality analysis correctly finds the cross-epic dependency. The final assessment correctly assigns READY status.

Issues C5 and C8 add minor risk visibility that would improve the report. Issues C6 and C7 are calibration notes.

**Batch 2 passes** with the above noted corrections. Implementation readiness report is cleared for final delivery.
