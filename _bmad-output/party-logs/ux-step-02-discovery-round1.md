# Party Mode Round 1: Collaborative Review — UX Discovery

**Step:** step-02-discovery
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **John (PM)**: Product strategy & user needs alignment
- **Winston (Architect)**: Architecture → UX alignment
- **Sally (UX Designer)**: Interaction patterns & usability
- **Amelia (Dev)**: Technical feasibility of proposed UX
- **Quinn (QA)**: Edge cases & testability

## Review Discussion

**John (PM):** The Discovery section covers three personas well, and the use cases are comprehensive with 12 entries. However, I notice there's no mention of the **onboarding journey** as a distinct use case. The PRD specifies "온보딩 10분 이내 첫 명령 성공" (NFR34) and there's Journey 1 that describes the first-time experience with template selection. This should be UC0 or at minimum referenced in the use case table. Also, the personas don't include the **Admin** persona — they're referenced in use cases UC5, UC6, UC9, UC12 but there's no dedicated persona table for them.

**Sally (UX):** John makes a good point about onboarding. I want to add that the pain points table (1.3) is excellent with 10 entries, but it's missing a critical pain point from v1: **대화 이력 관리**. The v1 feature spec mentions 작전일지 (History) with search/filter, bookmark, tag, archive, A/B comparison, and replay. Users transitioning from v1 will miss this. Additionally, in the Architecture-Driven UX Constraints table (1.4), the "비서 있음: 풀 위드 채팅" description doesn't specify what happens when the user wants to switch from the secretary-routed mode to directly selecting an agent. Is there a toggle? Or is it permanently determined by the `hasSecretary` boolean?

**Winston (Architect):** I appreciate that section 1.4 maps architecture decisions to UX constraints accurately. The SSE 6-event mapping is correct per E5. However, I see a gap: the **SessionContext.maxDepth** (default 5, company-configurable) should be reflected in the UX. When a handoff chain reaches maxDepth, what does the user see? The error code would be `HANDOFF_DEPTH_EXCEEDED` — the UX needs to handle this gracefully. Also, the `error` SSE event includes an optional `agentName` field (per E5 type union), but the UX constraint table says "붉은 배너 + 에러 코드 + 한국어 메시지" without specifying that the agent name should be displayed when available.

**Amelia (Dev):** Technical feasibility looks solid. The React Flow + ELK.js for NEXUS is well-chosen and matches the architecture. One concern: UC1 says "노드 포트 드래그" for edge creation, but React Flow uses **handle-based edge creation** with specific source/target handles. The UX spec should clarify whether edges represent delegation relationships (call_agent routing) or reporting hierarchy (organizational structure). Per the architecture, "NEXUS 조직도 = 실제 call_agent 호출 구조", so edges should represent delegation paths. This distinction matters for the drag interaction design.

**Quinn (QA):** From a testability perspective, the use cases are well-structured for test scenario derivation. However, I notice UC4 (비서 없는 허브) mentions "부서별 아코디언 그룹핑 + 최근 사용순 정렬" but doesn't specify what happens when an agent is in **미배속 (unassigned)** state. Per the cascade spec (FR8), agents can be unassigned. Should they appear in a separate "미배속" group? Also, UC12 (CLI 토큰 등록) doesn't specify the error case when the token validation query() fails due to network issues vs. invalid token — these are different UX states.

**John (PM):** Building on Quinn's point about 미배속 agents — the architecture mentions this in the product brief's NEXUS section showing an "미배속" area on the org chart. The Discovery section should document this state explicitly. Sally, regarding your 대화 이력 question — I agree it should be listed as PP11 even though it's a Phase 2 feature, because users will notice its absence immediately.

**Sally (UX):** Agreed. And Winston's point about maxDepth error is crucial — when a 5-level handoff chain hits the limit, the user needs to understand it's not a system failure but a configured safety limit. The error message should say something like "위임 깊이 제한에 도달했습니다 (최대 5단계). 관리자에게 설정 변경을 요청하세요." Not just a generic error.

## Issues Found

1. **[ISSUE-R1-1] Missing Admin Persona** — UC5/UC6/UC9/UC12 reference Admin but no persona table exists. Admin is a key user with distinct needs (system configuration, team management, security oversight).

2. **[ISSUE-R1-2] Missing Onboarding Use Case** — PRD NFR34 mandates "10분 이내 첫 명령 성공". No UC for template selection → first command flow. Should be UC0 or early in the table.

3. **[ISSUE-R1-3] 미배속 Agent State Not Addressed** — UC4 (비서 없는 허브) and UC1 (NEXUS) don't specify how unassigned agents appear. Need "미배속" group in agent list and NEXUS node treatment.

4. **[ISSUE-R1-4] maxDepth Error UX Missing** — Architecture defines HANDOFF_DEPTH_EXCEEDED error but 1.4 doesn't specify UX treatment for this specific error type.

5. **[ISSUE-R1-5] CLI Token Validation Error Differentiation** — UC12 doesn't distinguish between network error vs. invalid token vs. expired token in the validation UX.

## Fixes Applied

Fixing all 5 issues in the main document.
