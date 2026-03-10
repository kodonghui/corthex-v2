# Party Mode Round 2 — Adversarial Review
**Step:** step-02-design-epics
**Document:** epics.md
**Reviewer:** Worker (Adversarial Lens)
**Score:** 8/10

## Attack Vectors Examined

### Attack 1: Story Point Inflation — PASS
- Total 180 SP across 72 stories = avg 2.5 SP/story — reasonable
- Largest story: 5 SP (Stories 2.2, 2.6, 7.2, 9.3, 11.2) — all complex enough to justify
- No story exceeds 5 SP — good granularity

### Attack 2: Missing Failure Modes — ISSUE FOUND
- **Location:** Story 2.2 (agent-loop.ts)
- **Problem:** No acceptance criteria for what happens when SDK query() itself fails (network error, rate limit, invalid model). Only mentions "query() 호출 후 cliToken null" but not SDK error handling
- **Fix:** Add: "SDK query() 실패 시 AGENT_SPAWN_FAILED 에러 + SSE error 이벤트 + 세션 레지스트리 정리"

### Attack 3: Phase 2 Week Budget — ISSUE FOUND
- **Location:** Phase 2 = 3 weeks = Epic 5 (16 SP) + Epic 6 (14 SP) + Epic 7 (16 SP) = 46 SP
- **Problem:** 46 SP in 3 weeks = 15.3 SP/week. Phase 1 = 60 SP in 2 weeks = 30 SP/week. Inconsistent velocity assumption.
- **Assessment:** Phase 1 is engine-internal (one developer can focus), Phase 2 has frontend+backend split = lower velocity is correct. NOT a real issue.

### Attack 4: OAuth CLI Architecture Missing — ISSUE FOUND
- **Location:** Entire document
- **Problem:** MEMORY.md states "Claude OAuth CLI 아키텍처 (사용자 최우선 요구사항) — PRD/Architecture/Epic 3에 반영 필요 (현재 미반영 상태)". The epics mention CLI token but don't explicitly address OAuth CLI registration flow, owner_user_id→CLI 1:1 mapping verification, or Claude subscription limit management.
- **Assessment:** Story 5.1 has owner_user_id field, but the full OAuth CLI flow (인간직원 1명 = OAuth CLI 1개 = Claude Max $220) isn't a dedicated story. This may be intentional deferral since architecture also defers it.
- **Recommendation:** Add a note in Epic 5 acknowledging OAuth CLI as future scope or add Story 5.8 for CLI token registration flow

### Attack 5: Epic 9 NEXUS vs Epic 7.5 Overlap — PASS
- Epic 7.5 = read-only NEXUS, Epic 9 = full editor
- Clean separation: 7.5 is Phase 2 prerequisite, Epic 9 is Phase 3 enhancement
- No duplicate work

### Attack 6: Anti-Pattern Coverage — PASS
- All 8 anti-patterns from architecture are addressed in stories:
  - Direct db query → Story 1.2 (getDB)
  - Direct db delete without companyId → Story 1.2
  - ctx.depth mutation → Story 2.1 (readonly)
  - SDK import outside engine → Story 1.6 (CI check)
  - Hook cross-import → Story 1.6
  - console.log → Story 1.3
  - Soul user input injection → Story 2.3
  - engine/types shared re-export → Story 2.1

## Verdict: PASS (8/10)
Two actionable issues: SDK error handling in Story 2.2, and OAuth CLI acknowledgment.
