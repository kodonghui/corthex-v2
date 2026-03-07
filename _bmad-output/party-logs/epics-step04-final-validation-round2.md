# Party Mode Round 2: Adversarial Review
## Target: epics.md - step-04-final-validation
## Lens: Adversarial (devil's advocate, stress-test)

---

### Expert Panel Discussion

**John (PM):** "Let me stress-test the FR coverage matrix. The matrix claims 76/76 FRs covered, but I want to challenge the *quality* of coverage, not just presence.

FR47 (크리덴셜 프롬프트 노출 금지) is mapped to E3-S4 and E8-S4. But E3-S4 is the AgentRunner (P0) and E8-S4 is prompt injection defense (P1). The AgentRunner doesn't inherently prevent credential exposure in prompts -- that's a prompt engineering concern embedded in the agent execution flow. However, the AgentRunner is the right place to implement credential scrubbing before sending to LLM, and E8-S4 adds defense-in-depth. Coverage is valid.

FR8 (메모리 아카이브 + 비용 영구 보존) is mapped to E2-S2 and E2-S3 (P0). But actual agent memory isn't implemented until Epic 16 (Phase 2). The P0 implementation archives whatever data exists in agent_memories table (which will be empty). This is forward-compatible design, not a gap. Acceptable."

**Winston (Architect):** "Challenging the dependency DAG. The graph notation shows:
```
Epic 5 -> (Epic 6, Epic 8, Epic 10, Epic 11, Epic 12, Epic 13, Epic 14, Epic 16, Epic 17, Epic 18)
```

This means Epic 5 is a massive bottleneck -- 10 epics depend on it. If Epic 5 slips, the entire Phase 2 is blocked. However, most Phase 2 epics only depend on Epic 5's CommandRouter and WebSocket infrastructure, not the full orchestration engine. The dependency is architecturally correct but operationally risky.

**Mitigation exists:** Epic 5 is allocated 2 full sprints (Sprint 5-6) in the implementation order, and it has E5-S11 as a dedicated E2E test story. The 3-track split (Backend S1-S6, Frontend S7-S10, Test S11) enables parallel work within the epic. Risk acknowledged but adequately mitigated."

**Amelia (Dev):** "The implementation order puts Epic 2 + Epic 3 as parallel in Sprint 2-3. Let me check if this is actually parallelizable.

- Epic 2 depends on Epic 1 (schema) ✓
- Epic 3 depends on Epic 1 (schema for AgentRunner E3-S4) ✓
- Epic 3 does NOT depend on Epic 2 ✓
- Epic 2 does NOT depend on Epic 3 ✓

So yes, they are truly parallelizable. But this is a solo developer project (1 person). Parallel in a sprint plan doesn't mean simultaneous implementation -- it means either can go first. The sprint plan says 'Sprint 2-3' which is 2 sprints for both, totaling 40 SP (23+17). At ~20 SP/sprint, this fits. No issue."

**Quinn (QA):** "Adversarial check on the Risk Assessment. 6 high-risk stories identified, but I want to challenge whether the list is complete.

**Missing risk candidates:**
1. E2-S3 (cascade 처리) -- cascade delete/archive with data preservation is notoriously error-prone. If it corrupts data, recovery is hard. But E2-S3 is SP=2 and cascade logic is well-defined in PRD. The AgentRunner stopping in-progress tasks before cascade is the complex part, but that's E2-S3's acceptance criteria. Not adding to high-risk -- it's adequately sized.

2. E1-S5 (AES-256-GCM vault) -- encryption key management is critical. If the key is lost, all credentials are permanently inaccessible. But this is a standard pattern (env var or KMS), not technically novel. Not adding.

3. E9-S1~S8 (멀티테넌시) -- tenant isolation bugs could expose data between companies. But E1-S2 already handles companyId middleware, and E1-S7 tests it. E9 builds on that foundation. The risk is already captured in E1-S2.

No new high-risk stories to add. The current 6 are appropriate."

**Bob (SM):** "Sprint velocity assumption check. The plan assumes ~20 SP/sprint (2 weeks). With 1 developer:
- Sprint 1: 16 SP (Epic 1). Feasible -- pure schema/config work.
- Sprint 2-3: 40 SP in 2 sprints = 20 SP/sprint. These are CRUD + LLM adapter work. Feasible.
- Sprint 4: 16 SP (Epic 4). Tool skeletons. Feasible.
- Sprint 5-6: 27 SP in 2 sprints = 13.5 SP/sprint. Lower velocity but highest complexity. Appropriate.
- Sprint 7-8: 53 SP in 2 sprints = 26.5 SP/sprint. This is HIGH. Epics 6+7+8+9 in 2 sprints.

**Issue: Sprint 7-8 velocity of 26.5 SP/sprint is 33% above the 20 SP baseline.** However, P1 stories are less complex than P0 (dashboard UI, cost charts, RBAC additions). Higher velocity for simpler work is expected. Not blocking but worth noting."

**Mary (BA):** "Cross-referencing CEO Ideas mapping:
- #005 (메모리 금지 원칙) says '모든 에픽 -- 아키텍처 원칙으로 전체 적용'. This is correct -- it's an NFR, not a specific story. The Architecture doc Decision #2 embeds this principle. No story needed.
- All other 6 CEO ideas map to specific stories. Verified."

---

### Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | Section 6.1 AC Coverage table had Phase 2 as 56 instead of 50 | Minor | Already fixed in Round 1 follow-up |
| 2 | Sprint 7-8 velocity (26.5 SP/sprint) is 33% above baseline | Info | Noted as acceptable for simpler P1 work |

### Round 2 Score: 9/10
### Verdict: PASS (no new fixes needed, all adversarial challenges resolved)
