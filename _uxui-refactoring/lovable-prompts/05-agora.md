# 05. AGORA (토론) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

AGORA is the **multi-agent debate forum**. The CEO poses a topic, selects which AI agents should participate, and watches them debate in real-time — arguing positions, changing stances across rounds, and reaching (or failing to reach) consensus.

This is not a chat. It's a structured, round-based debate where each agent delivers formal speeches with stated positions (support/oppose/neutral/conditional). The CEO observes but does not participate in the debate itself.

The page has a 3-panel layout:
- **Left panel**: Debate list (browse and filter past/ongoing debates, create new ones)
- **Center panel**: Debate timeline (the actual debate content — speeches, round markers, results)
- **Right panel**: Debate info & analysis (metadata, participant list, position diff view)

---

### Data Displayed — In Detail

**Left Panel — Debate List:**
- List of all debates for this company, ordered by creation date (newest first)
- Each item shows: topic (truncated to 1 line), status badge (대기/진행중/완료/실패), debate type (토론 or 심층토론), participant count, creation date
- Status filter buttons at top: 전체 / 진행중 / 완료 / 실패
- "+ 새 토론" button to create a new debate
- Currently selected debate is highlighted
- Empty state when no debates exist: "진행된 토론이 없습니다" with action button to start one
- Loading spinner while fetching

**Center Panel — Debate Timeline:**
- Scrollable timeline of debate events, structured as:
  - **Round headers**: Visual divider with "Round N / M" label
  - **Speech cards**: Each speech shows agent avatar (colored circle with initial letter), agent name, round number label, position badge (찬성/반대/중립/조건부 찬성/조건부 반대), and the speech content text. Long speeches (200+ characters) are truncated with "더 보기" expand button.
  - **Round end markers**: Small centered text showing "Round N 완료 — N명 발언"
  - **Consensus result card** (at end of completed debates): Shows consensus outcome (합의 도달 / 합의 실패 / 부분 합의) with icon, summary text, majority position, minority position, key arguments list, and round count
  - **Error card**: If debate failed, shows error message
- For **live (in-progress) debates**: Speeches appear in real-time via WebSocket as agents deliver them. The timeline auto-scrolls to the bottom as new content arrives (unless the user has scrolled up to read earlier content).
- For **completed debates**: All rounds and speeches are loaded from the server at once
- Empty state when no debate is selected: "토론을 선택하거나 새 토론을 시작하세요"
- Pending state: Spinner with "토론 시작 대기 중..."

**Topic Header (above timeline):**
- Debate topic text (bold)
- Live indicator when in-progress (pulsing dot + "진행중")
- Sub-info line: debate type (심층토론 or 토론), participant count, round progress (e.g., "Round 2/3")
- Mobile: back-to-list button ("← 목록으로")

**Right Panel — Debate Info (desktop only, hidden on mobile):**
- Tabbed interface with two tabs: "정보" and "Diff". For completed debates, auto-switches to Diff tab. For non-completed debates, the Diff tab is visible but disabled (grayed out).
- **Info tab:**
  - Topic text
  - Metadata rows: type, status, max rounds, current rounds, start time, completion time
  - Participant list with agent avatars (colored circles), names, and roles
  - Error display if debate failed
- **Diff tab** (only available for completed debates):
  - **Per-agent position tracking**: For each agent, shows their position at each round with arrow transitions. Highlights agents who changed positions across rounds with a "변화" badge.
  - **Per-round consensus convergence**: Stacked bar visualization showing the distribution of positions (support/oppose/neutral etc.) in each round, so the CEO can see how opinions converged or diverged over time.
  - **Key arguments**: Numbered list of the most important points from the debate
  - **Before/After comparison**: Shows the original topic vs. the final consensus summary side by side

**Create Debate Modal:**
- Topic input (text field, placeholder: "예: 신규 사업 진출 전략에 대한 논의")
- Debate type selection: 토론 (2 rounds) or 심층토론 (3 rounds)
- Agent picker: Scrollable list of all company agents with checkboxes. Shows agent name, role, and department. Minimum 2 agents required, maximum 20. Shows count of selected agents.
- Error message display if creation fails
- Cancel and "토론 시작" buttons. The debate auto-starts immediately upon creation.

---

### User Actions

1. **Browse debates** — scroll through past and current debates in the list panel
2. **Filter debates by status** — click status filter buttons (all/in-progress/completed/failed)
3. **Select a debate** — click on a debate in the list to view its timeline and info
4. **Watch a live debate** — see speeches appear in real-time as agents deliver them
5. **Read speech content** — expand long speeches with "더 보기" button
6. **Create a new debate** — click "+ 새 토론", fill in topic, choose type, select agents, start
7. **View position analysis** — switch to Diff tab to see how agent positions changed across rounds
8. **View consensus result** — see the final outcome card with majority/minority positions and key arguments
9. **Navigate from chat** — debates can be opened from chat links, with a "back to chat" button for return navigation
10. **Deep-link to specific debate** — debates can be linked via URL parameter (?debateId=...)

---

### UX Considerations

- **Live debate is the hero moment** — watching agents argue in real-time is the most engaging feature. The design should make this feel dynamic: speeches appearing one by one, auto-scrolling, live indicator. It should feel like watching a live event.
- **Position tracking is intellectually rich** — the Diff view shows how opinions shifted across rounds. This is sophisticated analysis that differentiates AGORA from simple chat. Design it to be visually clear — the CEO should instantly see which agents changed their minds and in which direction.
- **The consensus result is the payoff** — after rounds of debate, the CEO gets a structured outcome (consensus/partial/dissent). This should feel like a conclusion, not just another card in the timeline.
- **Mobile: list/detail toggle** — on mobile, show either the debate list OR the debate detail (with back button), never both simultaneously. The right info panel (info + diff analysis) is hidden on mobile; consider making this content accessible via a collapsible section within the timeline view or a bottom sheet, so mobile users can still see participant details and position analysis.
- **Debate creation should be fast** — the CEO should be able to fire up a new debate in under 30 seconds. Topic → type → select agents → go.
- **Debates are read-heavy** — most of the time, the CEO is reading agent speeches. Typography and readability matter more than interactivity here.
- **Empty states are important** — a new user will see "no debates" first. Guide them toward creating their first debate.
- **Speech cards need visual identity** — each agent should be easily distinguishable by their avatar color. The position badge (support/oppose etc.) is critical context for each speech.
- **Loading states**: Debate list loading, debate detail loading, live debate waiting for first speech, timeline loading for completed debates.

---

### What NOT to Include on This Page

- Direct participation in the debate (the CEO observes, not participates)
- Agent configuration or soul editing
- Debate scheduling or recurring debates
- Voting or polling features
- Comment/annotation on individual speeches
- Export or sharing of debate results (not currently implemented)
