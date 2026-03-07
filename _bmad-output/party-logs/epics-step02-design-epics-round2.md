# Party Mode Round 2: Adversarial Review
## Target: epics.md - step-02-design-epics
## Lens: Adversarial (devil's advocate, stress-test)

---

### Expert Panel Discussion

**John (PM):** "Let me stress-test the phasing. The PRD says Phase 1 = 3 months. P0 has 5 epics (37-47 stories), P1 has 4 epics (23-30 stories). That's 60-77 stories for Phase 1. For a 1-person dev team with AI assist, is this realistic in 3 months? BUT -- this is a planning document, not a sprint plan. Timeline is the PRD's responsibility, not the epics document. The epic scoping itself is correct."

**Winston (Architect):** "I want to challenge one thing:

1. **Epic 16 (Knowledge & Memory) mentions 'RAG' but Architecture doc deferred vector DB selection to Phase 2.** The architecture doc says 'Decision #13: Vector DB selection -- RAG/Knowledge (Phase 2)'. Epic 16 lists RAG but doesn't mention how the vector DB decision feeds into the implementation. The acceptance criteria say 'knowledge auto-injection into system prompt' but don't clarify if this is full RAG (vector search) or simple file-based knowledge injection. The v1 spec (#16) shows folder-based knowledge with 'department-level auto-injection' -- this could be implemented without vector DB. The epic should clarify: Phase 2 knowledge injection can use file-based approach first, with vector DB RAG as an enhancement. Otherwise the epic has an unresolved architectural dependency."

**Amelia (Dev):** "The dependency graph shows Epic 2 and Epic 3 as parallel after Epic 1. But Epic 5 needs BOTH Epic 2 AND Epic 4 (which depends on Epic 3). This means the critical path is actually:
```
E0 -> E1 -> E3 -> E4 -> E5 (+ E2 must also be done by E5 start)
```
This is correctly shown in the Critical Path section at the bottom. No issue -- just confirming the graph is accurate."

**Quinn (QA):** "Challenging coverage: the document claims 76/76 FR coverage and 22/22 v1 feature coverage. Let me verify one tricky case:

v1 #22 (CEO Ideas) maps to multiple epics: #001->E10, #005->All, #007->E5, #009->E13, #010->E5, #011->E2. Let me check #004 (Predictive Workflow) -- it maps to Epic 18 (FR75). Confirmed present.

All 7 CEO ideas accounted for. Coverage is clean."

**Bob (SM):** "The 'Epic Prioritization Summary' table is excellent for sprint planning. Total story count range 130-160 is wide but appropriate for estimation at this stage."

**Mary (BA):** "One pattern I notice: Epic 17 bundles THREE features (History + Archive + Performance) with 7-9 stories. These are separate UX screens (#8, #9, #10) with different data sources. Is bundling justified? The rationale is 'past data query/analysis pattern' -- they share a read-heavy, filter-heavy UI pattern. This is reasonable for Phase 2 low-priority features."

---

### Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Epic 16 RAG implementation approach unclear -- vector DB vs file-based | Minor | Clarify that initial implementation uses file-based injection, vector DB RAG is optional enhancement |

### Fixes Applied

**Issue 1:** Added clarification to Epic 16 that initial implementation uses file-based knowledge injection (matching v1 approach), with vector DB RAG as an optional enhancement when the deferred architecture decision (#13) is resolved. This removes the unresolved architectural dependency. **Fix applied to document.**

### Round 2 Score: 9/10
### Verdict: PASS (1 minor fix applied)
