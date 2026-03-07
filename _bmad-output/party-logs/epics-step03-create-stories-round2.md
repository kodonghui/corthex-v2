# Party Mode Round 2: Adversarial Review
## Target: epics.md - step-03-create-stories
## Lens: Adversarial (devil's advocate, stress-test)

---

### Expert Panel Discussion

**John (PM):** "Let me stress-test story sizing. E5-S3 (Manager delegation + parallel Specialist execution) is SP=3 (1.5 days). This story requires:
1. Manager LLM call for task decomposition
2. Specialist assignment logic
3. Promise.allSettled parallel execution
4. Manager self-analysis (#007)
5. WebSocket delegation events

That's 5 significant components in 1.5 days. However, the orchestration pattern is well-defined from v1 and Architecture doc Decision #1. With v1 code as reference, SP=3 is achievable. Not a blocking issue."

**Winston (Architect):** "Challenging the dependency chain:

1. **E5-S1 (CommandRouter) depends on E2-S2 (agent CRUD) for @mention resolution.** But @mention just needs to query the agents table -- it doesn't need the full CRUD API with cascade, Soul editing, etc. E5-S1 actually only needs E1-S1 (schema with agents table) to work. The dependency on E2-S2 is overstated. The command router can query agents directly via the schema.

However, E2-S2 provides the OrganizationService that E5-S1 should use for clean architecture. Having E5-S1 query agents directly would bypass the service layer. So the dependency is architecturally correct even if technically possible to bypass. Keeping as-is."

**Amelia (Dev):** "I want to challenge the SP total:

- P0 total: 100 SP. At 1 SP = 0.5 day, that's 50 working days.
- But there are 40 stories. Story overhead (context switching, PR, testing) adds ~20% = 60 working days = 3 months.
- This matches the Phase 1 timeline. But leaves ZERO buffer. Any story overrun cascades.

**Suggestion:** The Story Count Summary shows 'Total SP' but doesn't mention risk buffer. Sprint planning should account for 15-20% velocity uncertainty. This is a sprint planning concern, not an epic document concern. No fix needed."

**Quinn (QA):** "Adversarial check on acceptance criteria coverage:

1. **E2-S2 acceptance criteria mention 'FR8 메모리/학습 기록 아카이브 + 비용 기록 영구 보존'** but agent memory (Epic 16) doesn't exist in Phase 1. How can P0 archive memory that hasn't been implemented? The answer: the archiving mechanism should be designed but the actual memory data won't exist until Phase 2. E2-S2 should archive any existing data in agent_memories table (which may be empty in P0). This is forward-compatible design, not an error.

2. **E9-S3 (직원 사령관실 접근 제한) depends on E5-S7 (사령관실 UI).** But E9 is P1 and E5 is P0, so the dependency direction is correct (P1 depends on P0). Verified."

**Bob (SM):** "Stress-testing Phase 2 story estimates. Epic 10 (Strategy Room) has 8 stories / 20 SP. This includes KIS API integration, CIO+VECTOR orchestration, real/paper trading separation, and full UI. v1 had all this working, so it's primarily porting work. SP=20 for this epic seems reasonable for porting with adaptation."

**Mary (BA):** "Checking for missing stories -- are there any FR that isn't covered by at least one story?

- FR1 (부서 CRUD): E2-S1 ✓
- FR2-5 (에이전트 CRUD + 보호): E2-S2 ✓
- FR6-8 (cascade): E2-S3 ✓
- FR9 (조직도): E2-S5, E2-S9 ✓
- FR10 (템플릿): E2-S4, E2-S8 ✓
- FR11 (Soul 편집): E2-S7 ✓
- FR12 (부서 표준): E2-S8 ✓
- FR13-15 (사령관실): E5-S1, E5-S7 ✓
- FR16 (프리셋): E5-S10 ✓
- FR17 (위임 체인): E5-S8 ✓
- FR18 (피드백): E5-S9 ✓
- FR19-22 (오케스트레이션): E5-S2, E5-S3, E5-S4 ✓
- FR23 (딥워크): E5-S6 ✓
- FR24-25 (/전체/순차): E5-S5 ✓
- FR26-29 (도구): E4-S1~S6 ✓
- FR30-31 (모델 배정): E3-S2 ✓
- FR32 (라우팅): E3-S1 ✓
- FR33 (Batch): E3-S6 ✓
- FR34 (fallback): E3-S3 ✓
- FR35-37, FR41 (모니터링): E6-S1~S6 ✓
- FR38-40 (비용): E7-S1~S5 ✓
- FR42 (companyId): E1-S2 ✓
- FR43 (회사 CRUD): E9-S1 ✓
- FR44-45 (직원): E9-S2, E9-S3 ✓
- FR46 (AES): E1-S5 ✓
- FR47 (크리덴셜 보호): E3-S4, E8-S4 (implicit) ✓
- FR48 (JWT RBAC): E1-S3 ✓
- FR49 (감사): E1-S4 ✓
- FR50-51 (QG P0): E5-S4 ✓
- FR52-55 (QG P1): E8-S1~S5 ✓
- FR56-62 (투자): E10-S1~S8 ✓
- FR63 (AGORA): E11-S1~S5 ✓
- FR64 (SketchVibe): E13-S1~S5 ✓
- FR65 (SNS): E12-S1~S5 ✓
- FR66-67 (크론/ARGOS): E14-S1~S6 ✓
- FR68 (텔레그램): E15-S1~S3 ✓
- FR69-70 (지식/메모리): E16-S1~S6 ✓
- FR71-73 (이력/문서/성능): E17-S1~S7 ✓
- FR74-75 (워크플로우): E18-S1~S5 ✓
- FR76 (메신저): E19-S1~S5 ✓

All 76 FRs covered at story level. 100% coverage maintained."

---

### Issues Found

| # | Issue | Severity | Resolution |
|---|-------|----------|------------|
| 1 | No new issues found | - | All adversarial challenges resolved satisfactorily |

### Round 2 Score: 9/10
### Verdict: PASS (no fixes needed)
