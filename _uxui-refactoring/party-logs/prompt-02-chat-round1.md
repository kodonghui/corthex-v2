# Party Mode — prompt-02-chat — Round 1 (Collaborative)

## Expert Panel

### Mary (📊 Business Analyst)
"Great prompt — it clearly distinguishes Chat from Command Center. Two observations: (1) The prompt mentions 'debate shortcut' via `/토론` — this is a nice feature but the prompt doesn't explain that the user gets a confirmation card when the debate completes. The code shows `debateResults` state and a completion notice. (2) The 'canvas context injection' feature — the code shows `useSearchParams` can inject canvas context into messages. Is that a feature we should mention?"

**Issues raised:**
1. Debate completion notification in chat not described
2. Canvas context injection from URL params

### Winston (🏗️ Architect)
"The prompt covers the WebSocket streaming well. One gap: the prompt doesn't mention the `chat-stream::${sessionId}` channel pattern — but that's fine since it's an implementation detail. However, the prompt should note that **tool call matching** is temporal — tool calls are matched to agent messages by timestamp proximity, which means they appear alongside the message they were generated during."

**Issues raised:**
3. Tool call placement context (they appear within/alongside the agent message)

### Sally (🎨 UX Designer)
"I love the 'Secretary is special' UX note. One thing missing: the prompt mentions 'links' in markdown rendering but the code shows that **markdown links navigate within the app** (e.g., clicking an agent name link navigates to that agent's page). This is a notable interaction pattern. Also, the prompt could mention that the chat area scrolls to bottom when a new message arrives, similar to Command Center."

**Issues raised:**
4. Internal navigation via markdown links
5. Auto-scroll behavior on new messages

### Crosstalk
- **Winston → Mary**: "The canvas context injection is from the Nexus/SketchVibe integration — it lets the user start a chat about a specific canvas. Worth mentioning briefly."
- **Mary → Sally**: "Good catch on internal links. The report view highlights sections (conclusion/analysis/risk/recommendation) — that's already in the prompt."
- **Sally → Winston**: "The tool call placement is important — they should appear inline with the response, not in a separate panel."

## Issues Summary
| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Debate completion notification missing | Minor | Fix |
| 2 | Canvas context injection from Nexus | Minor | Skip (edge case) |
| 3 | Tool calls appear inline with agent messages | Medium | Fix |
| 4 | Internal navigation via markdown links | Minor | Fix |
| 5 | Auto-scroll on new messages | Minor | Fix |

## Actions Taken
- Fixed issue 1: Added debate completion notice
- Fixed issue 3: Clarified tool calls appear inline with agent messages
- Fixed issue 4: Added internal link navigation note
- Fixed issue 5: Added auto-scroll behavior

## Score: 8/10 → PASS
