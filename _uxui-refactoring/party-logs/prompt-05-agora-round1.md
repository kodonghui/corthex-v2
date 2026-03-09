# Party Mode Round 1 — Collaborative Review
## prompt-05-agora.md

### Expert Panel

**Mary (Analyst) 📊**: "Excellent coverage of the debate data model! The position types (support/oppose/neutral/conditional-support/conditional-oppose) are all correctly enumerated. Two observations: (1) The prompt mentions 'debate (2 rounds)' and '심층토론 (3 rounds)' — but the API allows maxRounds up to 10. The 2/3 round defaults come from the create modal, not a hard limit. Should we mention this? (2) The in-progress debate re-fetches every 5 seconds for polling — this is worth noting since it supplements the WebSocket."

**Sally (UX Designer) 🎨**: "Great UX considerations! I especially like the 'live debate is the hero moment' guidance. One thing — the prompt says the right panel is 'desktop only, hidden on mobile' but doesn't suggest where the Diff analysis goes on mobile. The CEO might still want to see position changes on their phone. Also, the auto-scroll behavior (scroll-to-bottom unless user scrolled up) is a great detail that should stay."

**Winston (Architect) 🏗️**: "The WebSocket channel 'debate' is correctly implied. The polling interval for in-progress debates (5 seconds for detail, also WebSocket) is a dual-refresh approach. The prompt correctly describes both server-loaded and WebSocket-streamed content flows."

**John (PM) 📋**: "The 'navigate from chat' flow is a nice cross-page connection. It shows the CEO can trigger a debate from the Command Center, then watch it unfold here. The 'back to chat' button only appears when the debate is completed AND the user came from chat — that's a specific UX detail worth keeping."

> **Crosstalk — Mary & Sally**:
> Mary: "Should we note that the maxRounds can go up to 10?"
> Sally: "The create modal only offers 2 and 3 as options. The API supports more but the UI doesn't expose it. Since we're documenting v2 UI behavior, I'd say keep the 2/3 description and not mention the API limit."
> Mary: "Agreed — document what the UI shows, not the API ceiling."

### Issues Found
1. **Mobile Diff view access** — Right panel is hidden on mobile but Diff analysis is valuable. Should mention that on mobile, the info/diff content could be accessed via an alternative pattern (e.g., bottom sheet, expandable section in timeline).
2. **Polling detail minor** — The 5-second refetchInterval for in-progress debates supplements WebSocket. Not critical for Lovable but adds context.

### Fixes Applied
- Added note about mobile access to debate info/diff content
- Minor wording improvements
