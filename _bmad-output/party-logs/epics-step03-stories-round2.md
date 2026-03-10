# Party Mode Round 2 — Adversarial Review
**Step:** step-03-create-stories
**Document:** epics.md (stories section)
**Reviewer:** Worker (Adversarial Lens)
**Score:** 8/10

## Attack Vectors

### Attack 1: Story Dependencies Within Epics — PASS
- Epic 1: Stories are independent (can be parallel except 1.6 needs deploy.yml)
- Epic 2: 2.1 (types) must precede 2.2 (agent-loop) → correct ordering
- Epic 3: All hooks depend on Epic 2 → correct dependency chain
- Epic 4: Migration depends on Epic 2+3 → correct

### Attack 2: Missing Stories for Known Gaps — ISSUE FOUND
- **Location:** Epic 7
- **Problem:** No story for human staff workspace management (인간 직원 워크스페이스). v2 direction says "admin can freely create/edit/delete departments, human staff, AI agents" but only agent and department CRUD exist. Human staff CRUD (beyond admin_users) is missing.
- **Assessment:** admin_users table already exists. Story 7.2 focuses on AI agents. Human staff workspace is covered by existing Epic 1~20 code (users table + workspace routes). This is a "maintain" not "create" scenario. Low impact.

### Attack 3: Sprint Velocity Feasibility — PASS
- Phase 1: 60 SP / 2 weeks ≈ 30 SP/week — aggressive but all engine-internal code (~325 new lines)
- Phase 2: 46 SP / 3 weeks ≈ 15 SP/week — includes frontend, more realistic
- Phase 3: 28 SP / 2 weeks ≈ 14 SP/week — NEXUS UI heavy
- Phase 4: 28 SP / 2 weeks ≈ 14 SP/week — MCP integration
- Total: 180 SP / 9 weeks ≈ 20 SP/week average — feasible for single focused developer

### Attack 4: Stubs/Mocks Detection — PASS
- Searched all stories for stub/mock indicators
- No story says "placeholder", "TODO", "basic/simple CRUD"
- All stories have concrete file paths, line counts, and behavioral acceptance criteria
- CLAUDE.md rule "no stubs/mocks — real working features only" is respected

### Attack 5: Missing Error Scenarios — MINOR ISSUE
- Story 2.6 (call-agent) covers depth exceeded, circular, target not found
- Story 3.1 covers tool permission denied
- Story 4.4 covers graceful shutdown timeout
- **Missing:** What happens when a downstream agent in handoff chain takes too long? NFR-P8 says 120s timeout but no story explicitly covers per-agent timeout within a handoff chain.
- **Fix:** Already covered by SessionContext.startedAt + NFR-P8 timeout in agent-loop.ts, but could be made explicit in Story 2.2 AC

## Verdict: PASS (8/10)
One minor gap (per-agent timeout in handoff chain), but overall stories are comprehensive and stub-free.
