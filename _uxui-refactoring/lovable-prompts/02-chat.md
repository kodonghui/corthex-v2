# 02. Chat — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Chat page is a direct 1:1 conversation interface between the CEO (or employee) and a specific AI agent. Unlike the Command Center — which orchestrates multi-agent workflows — Chat is for focused, private conversations with one agent at a time.

Think of it as an internal messaging app where each conversation is with a specific AI team member. The CEO can ask questions, request analysis, have ongoing discussions, and even launch debates — all within a persistent chat session that maintains history.

Key differences from Command Center:
- **1:1 only**: Each session is with one specific agent (no multi-agent orchestration unless the agent is the secretary)
- **Persistent sessions**: Chat sessions are saved and can be resumed anytime
- **Streaming responses**: Agent replies stream in token-by-token in real time
- **File attachments**: CEO can attach files for the agent to analyze
- **Tool visibility**: The CEO sees which tools the agent uses during the conversation
- **Secretary delegation**: If chatting with the secretary agent, it can delegate tasks to other agents, and the delegation chain is visible

---

### Data Displayed — In Detail

**1. Session Panel (left sidebar)**
- List of all chat sessions, grouped chronologically:
  - "오늘" (Today)
  - "어제" (Yesterday)
  - "이번 주" (This Week)
  - "이전" (Earlier)
- Each session entry shows:
  - Agent name initial (avatar)
  - Session title (auto-generated or user-renamed)
  - Time of last message
  - Highlighted state when selected
- Groups are collapsible
- "새 대화" (New Chat) button at the top to start a new session
- On first load, auto-selects the most recent session

**2. Agent Selection Modal (overlay)**
- Opens when CEO clicks "New Chat"
- Lists all AI agents the user can access
- Each agent shows: name, role, online status indicator
- Secretary agents are marked with a special badge and sorted first
- Agents sorted by: secretary first, then online status
- Search/filter field (only shown when there are more than 3 agents)
- Offline agents are visible but disabled (cannot start a chat with an offline agent)
- Employee users only see agents in their assigned departments

**3. Chat Message Area (right main panel)**
- Chronological message thread for the selected session
- Two message types:
  - **User messages**: CEO's text, positioned on one side
  - **Agent messages**: AI response with agent identification, positioned on the other side
- Messages support:
  - **Markdown rendering**: Bold, italic, lists, headings, code blocks, and clickable links (some links navigate within the app, e.g., to an agent's profile)
  - **File attachments**: Attached files shown with filename, type icon, and file size
  - **Tool call cards** (inline with agent messages): When the agent uses a tool, a collapsible card appears within the agent's message showing:
    - Tool name
    - Status indicator (running / success / error / timeout)
    - Duration
    - Expandable input/output details
  - **Delegation chain** (secretary only): When the secretary delegates to other agents, the chain shows:
    - Which agents were delegated to
    - Their completion status (pending/processing/completed/failed)
    - Expandable to see full delegation details
- **Infinite scroll**: Older messages load automatically when scrolling to the top (cursor-based pagination)
- **Streaming state**: While the agent is responding:
  - Text appears token-by-token
  - Tool calls appear as they execute
  - A typing/thinking indicator shows the agent is working
- **Empty state**: When a new session starts, show a welcome message or prompt suggestions
- **Auto-scroll**: Chat area scrolls to the bottom when a new message arrives. A scroll-to-bottom button appears when the user has scrolled up.

**4. Message Input (bottom of chat area)**
- Text input field for typing messages
- Enter to send, Shift+Enter for newline
- File attachment button — supports uploading up to 5 files per message. Files upload immediately when selected (show upload progress).
- Pending attachments shown as removable chips above the input
- Send button (disabled when empty or while agent is responding)
- **Debate shortcut**: Typing `/토론` or `/심층토론` triggers creation of a multi-agent debate and navigates to the AGORA page. When the debate completes, a completion notice card appears in the chat showing the result summary.

**5. Delegation Panel (secretary sessions only)**
- Toggle button to switch between chat view and delegation history view
- Shows all delegations made by the secretary during this session:
  - Target agent name
  - Delegation prompt (what the secretary asked the agent to do)
  - Agent's response (or pending status)
  - Timestamps (created, completed)
  - Status badge (pending / processing / completed / failed)

**6. Report View (for command results)**
- When the agent delivers a structured report/analysis:
  - Highlighted sections (conclusion, analysis, risk, recommendation) with distinct visual treatment
  - Quality badge (PASS/FAIL/WARNING with score)
  - Cost summary showing total USD spent on this response
  - Feedback buttons (thumbs up/down)

**7. Report Detail Modal (full-screen overlay)**
- Detailed view of a command result with:
  - Full report content
  - Cost breakdown (total USD, expandable token details)
  - Delegation chain with agent details (name, tier, type, duration, status)
  - Quality score card (5 criteria × 5 points, progress bars, PASS/FAIL)

---

### User Actions

**Primary (core chat workflow):**
1. **Start a new chat** — click "New Chat", select an agent from the modal
2. **Send a message** — type in the input field, press Enter
3. **Read agent responses** — including streamed real-time text
4. **Switch between sessions** — click any session in the left sidebar

**Secondary (enhanced interaction):**
5. **Attach files** — click attachment button, select up to 5 files
6. **Rename a session** — right-click or long-press a session to rename it
7. **Delete a session** — right-click or use context menu to delete with confirmation (deletion is permanent — all messages, tool calls, and delegations are removed)
8. **Retry a failed message** — resend the last user message if the agent response failed
9. **View tool calls** — expand tool call cards to see what tools the agent used, with inputs/outputs
10. **View delegation chain** — when chatting with secretary, see which agents were involved

**Tertiary (review and feedback):**
11. **Give feedback** — thumbs up/down on agent responses
12. **View cost** — see how much a response cost in USD
13. **View quality scores** — see automated quality review results
14. **Launch a debate** — type `/토론 [topic]` to create a debate and navigate to AGORA
15. **Open report detail** — view full command result analysis in a modal

---

### UX Considerations

- **Real-time streaming is central**: The chat experience depends on smooth token-by-token streaming. Text should appear naturally, not in chunks. Tool calls should appear inline as they execute.
- **Session management**: Sessions are long-lived and resumable. The sidebar must handle a growing list gracefully (date grouping, scrolling). Auto-select the most recent session on page load.
- **Secretary is special**: When the user is chatting with the secretary agent, the UI needs to accommodate delegation chains — showing which sub-agents are working and their progress. This is a significant visual difference from regular 1:1 chats.
- **File attachments UX**: File upload should feel lightweight — drag-and-drop or click to select. Pending files shown as chips that can be removed before sending. File previews in messages should be compact but informative.
- **Infinite scroll for history**: Older messages load as the user scrolls up. Maintain scroll position during load. Show a loading indicator while fetching.
- **Context menu for session actions**: Rename and delete should be accessible via right-click/long-press, not cluttering the default session list view.
- **Mobile responsiveness**: On small screens, the session sidebar should collapse. Show either the session list OR the chat area, with a back button to switch.
- **Loading / Empty / Error states**:
  - Loading: Skeleton sessions list, spinner in chat area
  - Empty: No sessions yet → prompt to start first chat
  - Error: Agent offline → disable send, show status message. If the agent goes offline *during* an active conversation, show a status change notification.
  - Streaming error → show error message with retry option
- **WebSocket reconnection**: If the connection drops during streaming, show a reconnection banner at the top of the chat area.

---

### What NOT to Include on This Page

- No multi-agent command orchestration (that's Command Center — `/command-center`)
- No debate/discussion UI (AGORA — `/agora`; the chat page only *launches* debates)
- No agent configuration or editing (that's in Admin)
- No org chart or visual canvas (that's Nexus — `/nexus`)
- No dashboard or analytics (that's Dashboard — `/dashboard`)
- No trading or portfolio management (that's Strategy Room — `/strategy`)
