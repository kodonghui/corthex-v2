# Party Mode Round 1: Collaborative Review — Core Experience

**Step:** step-03-core-experience
**Round:** 1 (Collaborative)
**Date:** 2026-03-11

## Expert Panel

- **John (PM)**: Product strategy & user needs alignment
- **Winston (Architect)**: Architecture → UX alignment
- **Sally (UX Designer)**: Interaction patterns & usability
- **Amelia (Dev)**: Technical feasibility of proposed UX
- **Quinn (QA)**: Edge cases & testability

## Review Discussion

**John (PM):** Section 2.1 Experience Vision is clear and well-articulated. The "CEO가 자기 회사를 운영하는 것" metaphor is strong. However, the 3 core sensations (통제감, 투명성, 위임 안도감) don't mention **학습/개선** as a loop. The PRD defines Journey 6 "조직 최적화" — the experience isn't just command-and-get-result, it's an iterative cycle where you observe performance → tune agents → see improvements. This should be a 4th sensation or at least acknowledged. Also, the Journeys (A-D) don't cover the **AGORA debate flow** or the **전략실 trading flow** — both are v1 core features. Journey coverage feels incomplete without these.

**Sally (UX):** Journey A "첫 조직 만들기" has a great flow but it starts at 회원가입 → 조직 템플릿 선택 without showing the actual login/signup UI state. More importantly, the journey says "비서실장 + CIO + 전문가 4명 자동 생성" but doesn't specify what the user SEES during this 2-3 second creation phase. Is there a loading animation? Progress bar? The gap between "click template" and "NEXUS shows org" needs a transition state. Also in 2.3 Interaction Paradigms — the table lists 6 paradigms well but omits **검색** as a paradigm. The 정보국 semantic search (pgvector) is a distinct interaction pattern — query → results cards — different from chat or dashboard.

**Winston (Architect):** The SSE state machine in 2.5 is architecturally accurate, which is great. However, I see a missing state: **Cancel**. Per the architecture, when a user sends a new command while a previous one is still processing, the behavior depends on session management. The PRD mentions maxConcurrentSessions (NFR): can a user have multiple simultaneous command sessions? If not, what happens to the current processing state when a new command is sent? Also, the state machine shows `Sending → API POST /api/workspace/hub` but the architecture defines the API as `/api/hub/command` (FR1). The endpoint path should be verified against the actual architecture.

**Amelia (Dev):** Journey D "조직 리디자인" is detailed with the React Flow canvas interaction, which is great. But the "더블클릭 빈 캔버스 → 노드 생성" pattern assumes a department is created directly on the canvas. Per the architecture, departments are entities with `parent_department_id` and `tier_level`. Creating a department requires at minimum: name, tier_level, optional parent. A more realistic UX would be: double-click canvas → popup form (name + tier selection) → node created. The current description skips the creation form entirely. Also, the agent settings panel shows "계급: [Tier 3 ▾]" but per architecture, agents inherit tier from their department's tier_configs, not set individually. An agent doesn't have its own tier — it belongs to a department which has a tier_level.

**Quinn (QA):** The Information Architecture (2.4) provides a clear sitemap, which is good for test planning. However, I notice **전략실** says "Phase 2" and **AGORA** says "Phase 2" in parens, but the PRD shows these as Phase 1 features (FR17-18 AGORA, FR24-26 전략실). If they're Phase 1, their absence from Journey coverage is a bigger gap. Also, the state machine in 2.5 doesn't define the **reconnection** behavior. SSE connections drop on mobile/unstable networks — what state does the UI return to? Does it show "연결 중..." with a spinner? Does it auto-replay missed events? The architecture mentions WebSocket for real-time events — is the hub using SSE (as stated) or WebSocket? This needs clarification.

**John (PM):** Good catch Quinn. Let me clarify — the PRD has AGORA as Phase 1 (FR17-18) and 전략실 as Phase 2. The IA should match. And Winston's point about the API endpoint is important — we need exact paths. Sally, the search paradigm gap is real — 의미검색 is a wholly different interaction model than chat.

## Issues Found

1. **[ISSUE-R1-1] Missing Optimization/Learning Sensation** — 2.1 lists 3 core sensations but omits the iterative optimization cycle (observe → tune → improve). PRD Journey 6 "조직 최적화" is unrepresented.

2. **[ISSUE-R1-2] Incomplete Journey Coverage** — 4 journeys cover onboarding, daily use, no-secretary, and org redesign. Missing: AGORA debate participation and 전략실 trading — both are v1 core features.

3. **[ISSUE-R1-3] Missing Template Loading Transition State** — Journey A jumps from "template click" to "NEXUS shows org" without showing what the user sees during the 2-3 second creation phase.

4. **[ISSUE-R1-4] API Endpoint Inconsistency** — 2.5 shows `/api/workspace/hub` but architecture defines the command endpoint differently. Must verify and match.

5. **[ISSUE-R1-5] Agent Tier Assignment Error** — Journey D shows agents having individual tier selection, but per architecture, agents inherit tier from their department. Individual tier setting is incorrect.

6. **[ISSUE-R1-6] Missing Cancel/Reconnection States** — SSE state machine has no Cancel state (what if user sends another command mid-processing?) and no Reconnection state (SSE/WebSocket drop recovery).

7. **[ISSUE-R1-7] Phase Labeling Inconsistency in IA** — AGORA marked Phase 2 in IA but is Phase 1 in PRD. 정보국 phase also unclear.

## Fixes Applied

- **ISSUE-R1-1**: Added 4th sensation "성장 실감" with PRD Journey 6 optimization loop
- **ISSUE-R1-2**: Added Phase 2 Journey acknowledgment note for AGORA + 전략실 at end of section
- **ISSUE-R1-3**: Added template loading transition state (progress bar + per-entity creation messages)
- **ISSUE-R1-4**: VERIFIED — `/api/workspace/hub` matches architecture line 942. No fix needed.
- **ISSUE-R1-5**: Fixed — agents now show "소속 부서" with inherited tier, not individual tier dropdown
- **ISSUE-R1-6**: Added Cancel path (stop button + new command) and Reconnection path (exponential backoff + lastEventId)
- **ISSUE-R1-7**: VERIFIED — AGORA is Phase 2 per PRD line 290. IA labeling is correct. No fix needed.
