# Party Mode Round 1: Collaborative Review
## Target: epics.md - step-03-create-stories
## Lens: Collaborative (supportive, constructive)

---

### Expert Panel Discussion

**John (PM):** "Strong story breakdown. 136 stories across 20 epics with clear SP estimates. Two observations:

1. **Epic 5 (Orchestration) has 11 stories totaling 27 SP.** This confirms it as the largest epic. The internal milestone recommendation from step-02 (Backend/Frontend/QualityGate tracks) is well-reflected: S1-S6 are backend, S7-S10 are frontend, S11 is testing. Good separation.

2. **Story count per epic is well-controlled** -- ranges from 3 (Epic 15) to 11 (Epic 5). Average is 6.8 stories per epic, within the 5-10 guideline. Only Epic 5 exceeds 10 as expected."

**Winston (Architect):** "Cross-referencing story dependencies with the epic dependency graph:

1. **E4-S1 depends on E3-S4 (AgentRunner)** -- this is correct because ToolPool.execute() is called from AgentRunner's tool handling loop. However, E4-S2 also depends on E2-S2 (agent CRUD to get allowedTools). This cross-epic dependency is correctly captured.

2. **E5-S1 depends on E2-S2** -- CommandRouter needs to know about agents for @mention resolution. This is correct.

3. **Issue: E3-S1 (LLM adapters) shows dependency on E1-S1 but doesn't need the schema.** The LLM adapters are standalone SDK wrappers. They don't depend on the DB schema. The dependency should be 'Epic 0' or 'none'. E3-S4 (AgentRunner) does need E1-S1 for the agents table, but E3-S1 doesn't."

**Amelia (Dev):** "Practical concerns:

4. **E4-S3 and E4-S4 (30 tools total) are each SP=3.** 15 tools in 1.5 days is ambitious -- some tools like real_web_search and stock_price_checker need external API integration. Consider splitting into 'simple tools' (calculator, date_utils) and 'API tools' (web_search, stock_price) with different SPs. BUT -- these are skeleton implementations that will be fleshed out later. As long as each tool has Zod schema + basic execute(), SP=3 is acceptable for 15 simple tools.

5. **E12-S3 (Selenium 5 platforms) is SP=5.** This is the only SP=5 story. Selenium automation for 5 different platforms is indeed complex -- each platform has different login flows, DOM structures, and anti-bot measures. This story might need splitting into per-platform stories in sprint planning. For now, keeping it as one story is OK since it's Phase 2."

**Quinn (QA):** "Test story coverage:

6. Epic 1 has E1-S7 (integration test). Epic 3 has E3-S7 (LLM test). Epic 5 has E5-S11 (orchestration E2E). These are the critical path epics. Good that they each have dedicated test stories. However, **Epics 2 and 4 lack dedicated test stories.** For Epic 2, cascade processing is complex enough to warrant a test story. For Epic 4, tool execution with permission checks needs testing.

Recommendation: Not adding test stories now -- these can be handled by TEA (Test Architect) during implementation. The BMAD workflow has a dedicated TEA step that will generate tests per story."

**Sally (UX):** "UX screen mapping in stories:
- Epic 2: A1 (E2-S5), A2 (E2-S6), A3 (E2-S7), A7 (E2-S8) -- all 4 admin screens covered
- Epic 4: A5 (E4-S6) -- covered
- Epic 5: UX #2 (E5-S7, E5-S8, E5-S9) -- command center covered
- Epic 6: UX #1 (E6-S2), UX #7 (E6-S4) -- covered
- All 22 UX screens are mapped to at least one story. No gaps."

**Bob (SM):** "SP distribution looks healthy. P0 (40 stories, 100 SP) at 1 person = roughly 50 working days = 2.5 months with buffer. This aligns with the 3-month Phase 1 target."

**Mary (BA):** "FR coverage at story level:

7. **FR14 (@mention) is covered in E5-S1 (parsing) and E5-S7 (UI).** Good split.
8. **FR47 (credential prompt protection) -- where is it?** It's part of NFR11 covered in E3-S4 (AgentRunner) and E8-S4 (prompt injection defense). Not explicitly listed as a story PRD mapping. This is acceptable since FR47 is a cross-cutting concern embedded in implementation details."

---

### Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | E3-S1 dependency on E1-S1 is incorrect -- LLM adapters don't need DB schema | Minor | Remove E1-S1 dependency, set to "Epic 0" or none |
| 2 | Epic 6-9 stories (P1) have abbreviated acceptance criteria vs Epic 1-5 (P0) | Minor | Acceptable -- P1 stories will be detailed during create-story BMAD step |
| 3 | E12-S3 (Selenium 5 platforms, SP=5) may be too large for single story | Minor | Flag for sprint planning split; keep as-is in epic doc |

### Fixes Applied

**Issue 1:** Updated E3-S1 dependency from "E1-S1" to "Epic 0" since LLM provider adapters only need the SDK packages, not the DB schema. The agents table dependency belongs to E3-S4 (AgentRunner), which correctly depends on E1-S1. **Fix applied to document.**

**Issue 2:** Not fixed -- P1 and Phase 2 story details will be expanded when those stories enter the BMAD create-story step. Abbreviated format is appropriate for planning-level documentation.

**Issue 3:** Not fixed -- flagged as note for sprint planning. Keeping as single story in the epic document since it's Phase 2 and the exact split depends on implementation context.

### Round 1 Score: 9/10
### Verdict: PASS (1 minor fix applied)
