# Party Mode Round 2: Adversarial Review — Core Experience

**Step:** step-03-core-experience
**Round:** 2 (Adversarial)
**Date:** 2026-03-11

## Expert Panel (Cynical Mode)

- **John (PM)**: "Show me the gap"
- **Winston (Architect)**: "What breaks first?"
- **Sally (UX)**: "Users will hate this because..."
- **Quinn (QA)**: "What's untestable?"

## Review Discussion

**John (PM):** Looking at Journey A critically — the "10분 목표" is mentioned but the journey has NO time estimates per step. How do we know it actually takes 10 minutes? Let me count: 회원가입 (2-3 min), 템플릿 선택 (30 sec), 템플릿 적용 (2 sec), NEXUS 확인 (1 min), 온보딩 가이드 첫 명령 (2 min), 결과 확인 (1 min) = ~7 minutes. OK, feasible, but this should be explicit in the journey so developers can benchmark against NFR34. Also — Journey A assumes the user picks a template. But what if they want to build from scratch? There's no "빈 조직" option mentioned.

**Winston (Architect):** The Cancel path says "서버에 SSE close + cancel signal 전송" — but architecturally, SSE is server-to-client (one-way). The client can't send a "cancel signal" over SSE. The client would need to call a separate REST endpoint like `DELETE /api/workspace/hub/sessions/{sessionId}` or use the WebSocket channel (which the architecture DOES define for real-time events per D10) to send the cancel. This is a protocol error in the state machine. Also — the Reconnection path mentions `lastEventId` which is correct for SSE reconnection, but the architecture says real-time updates use **WebSocket** (D10), not SSE. Sections 2.5 says "SSE 기반 상태 머신" but the architecture specifies WebSocket with EventBus. Which is it? This contradiction needs resolution.

**Sally (UX):** Journey C "비서 없는 직원" — the agent panel shows departments with agent counts and "최근 사용" timestamps. But what's the empty state? When a new employee first enters the hub with no chat history, they see a list of agents they've never used. "최근 어제" assumes prior usage. The first-time experience for a non-CEO employee is completely missing. Also — the 2.4 IA shows "통신로그 ← 활동/통신/QA/도구 4탭" but there's no mention of what each tab actually contains. For a UX spec, just naming tabs isn't enough. What data does each tab show? What are the column headers? This matters for developers.

**Quinn (QA):** The state machine's Sending state says "API POST /api/workspace/hub" — but what's the request payload? For test automation I need to know what fields are sent. More importantly: the state machine handles error codes like `SESSION_LIMIT_EXCEEDED` but the IA doesn't show where the user can SEE their current session count or manage sessions. If they hit the limit, they need a way to kill old sessions. Where's that UI? Also — the reconnection path says "30초 이상 실패" shows a refresh button, but what happens to the partially received response? Is it lost? Preserved in local state? This affects data integrity testing.

## Issues Found

1. **[ISSUE-R2-1] SSE vs WebSocket Protocol Contradiction** — Section 2.5 calls it "SSE 기반 상태 머신" but architecture D10 specifies WebSocket with EventBus for real-time events. Cancel signal also can't be sent over SSE (one-way). Must clarify: is the hub using SSE streaming for command responses or WebSocket?

2. **[ISSUE-R2-2] No Empty/First-Time State for Non-CEO Employee** — Journey C assumes prior usage ("최근 2분 전"). First-time employee hub experience needs definition.

3. **[ISSUE-R2-3] Partial Response Preservation on Disconnect** — Reconnection path doesn't specify what happens to already-streamed content when connection drops and recovers.

## Fixes Applied

- **ISSUE-R2-1**: Clarified that command responses use SSE (server→client streaming per E5 architecture: accepted→processing→handoff→message→error→done), while cancel uses REST endpoint `DELETE /api/workspace/hub/sessions/{sessionId}`. Real-time notifications (not command responses) use WebSocket/EventBus per D10. Both coexist for different purposes.
- **ISSUE-R2-2**: Added first-time employee empty state to Journey C — welcome message + "에이전트를 선택하고 대화를 시작해보세요" placeholder
- **ISSUE-R2-3**: Added partial response preservation note — streamed content preserved in local state, reconnection resumes from last received position, displayed content is NOT cleared
