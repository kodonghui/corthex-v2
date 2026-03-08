## [Party Mode Round 2 -- Adversarial Review] create-story 18-1

### Round 1 Fix Verification
| Issue # | Status | Verification Detail |
|---------|--------|---------------------|
| 1 | Verified | Success metrics added to ACs. |
| 2 | Verified | Zod schema draft is now comprehensively defined. |
| 3 | Verified | Granular error requirements included. |

### Adversarial Agent Discussion
**Amelia (Dev):** The test requirements are still too fluffy. "Test different payloads" means nothing to me. I need exact scenarios: missing `companyId`, invalid step structure, exceeding the 20-step limit, and payload size too large. Give me specifics!
**Quinn (QA):** Wait, what happens if a user tries to delete or modify a workflow while the execution engine (18-2) is currently running it? We need a state check or at least a soft-delete mechanism to prevent breaking active cron jobs or running workflows.

### New Issues Found (Round 2)
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 4 | High | Quinn | Deletion of active workflows | Implement a `is_active` soft-delete flag or restrict deletion if it's currently executing/scheduled. |
| 5 | Medium | Amelia | Vague testing scenarios | Explicitly list the negative testing scenarios required. |

### Cross-Step Consistency Check
- Checked against: PRD FR74, Architecture Phase 2.
- Contradictions found: None, but PRD implies workflows can be scheduled, confirming Quinn's concern.

### v1-feature-spec Coverage Check
- Features verified: Workflow CRUD.
- Gaps found: None.

### Fixes Applied
- Added soft-delete requirements instead of hard delete.
- Explicitly listed 5 negative testing scenarios.
