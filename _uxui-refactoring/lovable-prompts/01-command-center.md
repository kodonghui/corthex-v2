# 01. Command Center — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

The Command Center is the CEO's primary workspace — the single screen where they issue natural-language commands to their AI organization and watch the results come back in real time.

Think of it as a "mission control" for an AI company: the CEO types an instruction (e.g., "마케팅부에서 이번 달 SNS 성과 분석해줘"), and the system classifies it, routes it through the right AI agents, and streams back the result — all visible on one screen.

This is NOT a simple chatbot. It is an orchestration interface where:
- Commands get classified (direct, mention, all-hands, sequential, debate, sketch)
- A delegation pipeline shows which AI agents are currently working
- The final deliverable (report, analysis, diagram) appears alongside the conversation
- Quality gates show whether the result passed automated review
- Saved command templates (presets) let the CEO reuse common instructions

---

### Data Displayed — In Detail

**1. Delegation Pipeline Bar (top of page)**
- A horizontal sequence of stages showing the current command's processing flow
- Each stage represents an AI agent role working on the command (e.g., Manager → Analyst → Writer → Designer)
- Each stage shows: agent role name, current status (done / working / waiting / failed)
- Stages connect with arrows to show flow direction
- When a stage fails, it visually indicates the failure point

**2. Command History & Message Thread (left panel)**
- The CEO can browse past commands (paginated list, most recent first). Selecting a past command loads its message thread and deliverable.
- Chronological list of all messages for the selected command, similar to a chat thread
- Three message types:
  - **User messages**: The CEO's typed commands
  - **Agent messages**: AI responses, each tagged with agent name and role (e.g., "김비서 · 비서실장")
  - **System messages**: Status updates (e.g., "명령이 처리 중입니다")
- Agent messages may include:
  - A quality badge showing PASS or FAIL with a numeric score
  - A sketch preview card showing a generated diagram (Mermaid-based flowchart/org chart rendered as an interactive mini-canvas)
- When no messages exist: empty state showing example commands the CEO can try (e.g., "오늘 주요 뉴스 브리핑해줘", "마케팅 전략 보고서 작성해줘")
- Auto-scrolls to newest message; manual scroll-to-bottom button when scrolled up

**3. Deliverable Viewer (right panel)**
- Shows the detailed output of a selected command
- Two tabs: "개요" (Overview — list of deliverables) and "산출물" (Deliverable — full content)
- Content is rendered as formatted markdown (headings, lists, bold, code blocks)
- Quality gate badge at the top (PASS/FAIL with score)
- Loading spinner while the command is still processing
- Empty state when no command is selected

**4. Command Input (bottom of page)**
- Multi-line text area for typing commands
- Dynamic height — grows as the CEO types more text
- **Slash command popup**: Typing `/` opens a dropdown with two sections:
  - **Built-in commands**: `/전체` (broadcast to all agents), `/순차` (sequential processing), `/도구점검` (tool check), `/스케치` (generate diagram)
  - **Saved presets**: The CEO's saved command templates, shown separately below the built-in commands
- **Mention popup**: Typing `@` opens a dropdown of available AI agents:
  - Agents grouped by department
  - Each entry shows: agent name, role, tier badge, online status dot
  - Offline agents are shown but disabled
- **Secretary agent note**: One special agent (the secretary / 비서실장) acts as the orchestrator — when mentioned or when a command is sent without a target, the secretary delegates to multiple agents automatically. This is what triggers the multi-step pipeline.
- **Target agent chip**: When an agent is mentioned, a chip appears showing the target agent's name
- Send button (disabled when input is empty or command is processing)

**5. Preset Manager (modal overlay)**
- Accessible from a button near the input area
- Lists all saved command templates
- Each preset shows: name, command text, category tag, description
- Categories: 일반, 분석, 보고, 전략, 마케팅, 기술
- CEO can create, edit, delete presets
- Global (system-provided) presets are marked and cannot be edited
- Execute button to run a preset immediately

**6. Report Detail Modal (full-screen overlay)**
- Opens when CEO clicks to see full details of a completed command
- Shows:
  - Full report content (rendered markdown)
  - Cost summary: total cost in USD (simplified for non-technical user; raw token details optional/expandable)
  - Delegation chain: ordered list of agents that worked on the command, each showing agent name, tier, task type, duration, status. Note: some commands trigger parallel delegations — multiple agents work simultaneously and then results are synthesized.
  - Quality score card: breakdown of 5 scoring criteria (each 0-5 points), visual progress bars, overall PASS/FAIL
  - Feedback buttons: thumbs up / thumbs down with optional comment

---

### User Actions

**Primary (core workflow):**
1. **Type and submit a command** — natural language instruction in the input area, press Enter to send
2. **Use slash commands** — type `/` to see available commands and presets, select one
3. **Mention an agent** — type `@` to target a specific AI agent for the command
4. **Browse command history** — scroll through past commands, select one to view its thread and deliverable
5. **Select a message to view its deliverable** — click an agent response to see the full report in the right panel

**Secondary (review and feedback):**
6. **View report details** — open the full report modal to see cost, delegation chain, quality scores
7. **Give feedback** — thumbs up/down on command results
8. **Manage presets** — open preset manager to create, edit, delete, or execute saved templates

**Tertiary (sketch-specific):**
9. **Open sketch in editor** — when a diagram is generated, click to open it in the full SketchVibe canvas editor
10. **Copy diagram code** — copy the Mermaid source of a generated diagram
11. **Save a diagram** — save a generated diagram with a custom name

---

### UX Considerations

- **Real-time streaming**: Agent responses stream in token-by-token via WebSocket. The message area must handle text appearing progressively, not all at once.
- **Pipeline visibility**: The delegation pipeline at the top gives the CEO confidence that work is happening. When agents are "working", the CEO should feel the system is alive. Different command types produce different pipeline shapes — `/전체` shows parallel processing across all agents, `/순차` shows sequential agent-by-agent flow, and direct commands show a single-agent pipeline.
- **Information density vs. clarity**: The CEO needs to see the message thread AND the deliverable simultaneously. On desktop, these are side-by-side panels. On mobile, they become tabs the CEO can switch between.
- **Keyboard-first for power users**: Enter to send, Shift+Enter for newline, arrow keys to navigate slash/mention popups, Escape to dismiss popups.
- **Empty states matter**: When the CEO first opens Command Center with no history, the empty state should teach them what they can do (show example commands).
- **Quality at a glance**: PASS/FAIL badges on messages let the CEO quickly scan which results met quality standards without opening each one.
- **Sketch integration**: Diagram previews should be interactive mini-canvases, not static images — the CEO can see the structure at a glance and open it for editing.
- **Mobile responsiveness**: On small screens, collapse the two-panel layout into a tabbed single-panel view (대화 / 보고서).
- **Loading and error states**: Show a processing indicator when a command is being handled. Show clear error messages when commands fail. The pipeline bar should visually indicate which stage failed. There is no "retry" button — if a command fails, the CEO simply submits a new one.
- **Role-based access**: Employees (non-CEO users) can also use Command Center, but they only see agents and commands within their assigned departments. The mention popup and command history are filtered accordingly.

---

### What NOT to Include on This Page

- No agent configuration or settings (that's in Admin)
- No direct 1:1 chat with agents (that's the Chat page — `/chat`)
- No debate/discussion interface (that's AGORA — `/agora`)
- No stock trading or portfolio views (that's Strategy Room — `/strategy`)
- No org chart or visual canvas editing (that's Nexus — `/nexus`)
- No SNS content management (that's SNS Publishing — `/sns`)
- No system administration, user management, or billing
