# Party Mode Round 1: Collaborative Review
## Target: epics.md - step-02-design-epics
## Lens: Collaborative (supportive, constructive)

---

### Expert Panel Discussion

**John (PM):** "Overall structure is solid -- 20 epics, 76 FRs mapped, clean Phase alignment. But I have TWO concerns:

1. **Epic 5 is too big** -- 10~12 stories combining Orchestration Engine + Command Center UI + Quality Gate P0. That's THREE major subsystems in one epic. If the orchestration engine takes longer, the Command Center UI is blocked. I'd recommend splitting Epic 5 into two: 5a (Orchestration Engine backend) and 5b (Command Center UI + real-time display). This gives cleaner boundaries and allows UI work to start with mocked data while the engine is being built.

2. **Epic 1 and Epic 9 overlap on security/multi-tenancy FRs** -- FR42-49 are split across both. Epic 1 handles the middleware foundations (FR42, FR46, FR48, FR49) while Epic 9 handles the company/user CRUD (FR43-45, FR47). This split is logical but the FR mapping shows FR42-49 in BOTH epics in the summary table. Need explicit delineation of which specific FRs go to which epic."

**Winston (Architect):** "The dependency graph correctly reflects the architecture implementation order. Critical path is well-identified. One concern:

3. **Epic 3 depends on Epic 2 but shouldn't need to** -- AgentRunner needs the agents table schema, but doesn't need the full CRUD/cascade/template functionality of Epic 2. The schema is created in Epic 1. Epic 3 should depend only on Epic 1, not Epic 2. This would allow Epic 2 and Epic 3 to be truly parallel, which is what the dependency graph claims but the text contradicts."

**Sally (UX):** "Love that every UX screen is mapped to an epic. The coverage tables at the bottom are really helpful for validation. No issues from UX perspective -- all 22 CEO app + admin screens are accounted for."

**Amelia (Dev):** "Practical observation:

4. **Phase 2 tool additions aren't explicitly tracked** -- Epic 10 mentions 'Finance tools' and Epic 12 mentions 'Marketing tools', but these are buried in the epic descriptions. The ToolPool framework is in Epic 4, but where exactly do the 95+ remaining tools (beyond the initial 30+) get implemented? Need a clearer strategy: are they added as stories within their feature epics, or is there a separate 'Tool Expansion' track?"

**Quinn (QA):** "The acceptance criteria are specific and testable. Good use of NFR references. Coverage validation tables are excellent -- 76/76 FRs, 22/22 v1 features. No gaps detected."

---

### Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Epic 5 is too large (10-12 stories, 3 subsystems) | Major | Split into 5a (Orchestration backend) and 5b (Command Center UI) |
| 2 | FR42-49 split between Epic 1 and Epic 9 needs explicit delineation | Minor | Clarify which specific FRs map to which epic |
| 3 | Epic 3 dependency on Epic 2 is incorrect -- should depend on Epic 1 only | Major | Fix dependency: Epic 3 depends on Epic 1 (schema), not Epic 2 (CRUD) |
| 4 | Phase 2 tool additions (Finance/Marketing/Legal/Tech) need explicit tracking strategy | Minor | Add note clarifying tools are added within their feature epics |

### Fixes Applied

**Issue 1:** After consideration, keeping Epic 5 as one epic is acceptable because the orchestration engine and Command Center UI are deeply coupled -- the UI is the primary consumer of the orchestration events, and splitting them would create artificial boundaries. However, the story count range (10-12) warrants a note that this is the largest epic and may need internal milestone tracking. **Decision: Keep as-is but add note about internal milestones.**

**Issue 2:** Updated the PRD FR Coverage table to explicitly show Epic 1 handles FR42(companyId core middleware), FR46(AES-256-GCM), FR48(JWT RBAC middleware), FR49(audit logs), while Epic 9 handles FR43(company CRUD), FR44(employee workspace), FR45(employee access restriction), FR47(credential prompt protection). **Fix applied to document.**

**Issue 3:** Fixed Epic 3 dependency from "Epic 1 (schema), Epic 2 (agent table)" to "Epic 1 (schema -- includes agents table definition)". Epic 2 is about the CRUD API and UI, not the table itself. The agents table is defined in Epic 1's schema migration. **Fix applied to document.**

**Issue 4:** Added clarification that Phase 2 domain-specific tools (Finance in Epic 10, Marketing in Epic 12, Legal/Tech in relevant epics) are implemented as stories within their feature epics, not as a separate track. The 30+ P0 tools in Epic 4 establish the ToolPool framework; additional tools follow the same pattern. **Fix applied to document.**

### Round 1 Score: 8/10
### Verdict: PASS (fixes applied)
