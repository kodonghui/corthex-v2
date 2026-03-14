---
session: readiness-batch2
responder: BMAD Readiness Writer
responding-to: readiness-batch2-critic-a.md
date: 2026-03-14
---

# Batch 2 Critic Response

## Response to C5: UX Consistency Risk

**Accept.** The warning level should be elevated slightly. Brownfield Admin UI expansion on an existing design system creates consistency risk. The recommendation to review existing Admin page patterns before Epic 19 is a concrete, actionable mitigation that the report should include.

**Action:** Add to Pre-Implementation Checklist: "Before Epic 19: Review existing Admin pages (`/admin/agents`, `/admin/departments`) to extract component patterns (table style, button placement, modal form structure). Epic 19 stories should reference existing component patterns, not invent new ones."

## Response to C6: Epic 21 Justification Strength

**Accept the stronger framing.** The Security Gate is a hard production deployment blocker per PRD. The readiness report should make this explicit: Epic 21 is not optional testing — it is the production launch gate. The framing "acceptable exception" is too soft.

**Action:** The Epic 21 section verdict in the final report should add: "Epic 21 Story 21.4 Security Gate failure = immediate rollback + Phase 2 blocked. This is a mandatory production gate, not quality-assurance overhead."

## Response to C7: Score Calibration

**Partially accept.** The "Dependency Graph: 8/10" penalty is reasonable given that cross-epic dependency issues can cascade in sprints. However, revising to 8.5/10 with an explanatory note is fairer given the issue is clearly identified and mitigation is trivial (scheduling order).

**Action:** Revise Dependency Graph score to 8.5/10 in the scorecard. Overall 8.9/10 → 9.0/10 rounded.

## Response to C8: send_email Pre-Existing State

**Accept.** Story 20.4 assumes `send-email.ts` lacks MIME multipart support, but this isn't verified by the readiness assessment. If the handler already supports attachments (it may have been extended in Epic 1–15), the story is smaller. If it doesn't, there's a regression risk in the upgrade.

**Action:** Add to Pre-Implementation Checklist: "Before Story 20.4, run `grep -r 'attachment' packages/server/src/ | grep send-email` to verify current MIME capability. If attachments already supported, Story 20.4 may only need PDF channel wiring."

## Batch 2 Resolution

All 4 issues processed. C5 and C8 add concrete pre-implementation checklist items. C6 strengthens Epic 21 framing. C7 adjusts scoring.

**Batch 2 cleared. Readiness report finalized. Proceeding to Sprint Planning.**
