# 06. Nexus / SketchVibe (시각화 캔버스) — Wireframe Prompt

## 복사할 프롬프트:

### What This Page Is For

Nexus (internally called "SketchVibe") is an **interactive visual canvas** where the CEO can create, edit, and manage node-based diagrams — flowcharts, system architectures, process maps, or any freeform visual thinking.

This is NOT a static org chart viewer. It's a full diagramming tool with:
- A node-and-edge canvas (powered by a graph visualization library)
- Multiple node types (start, end, agent, system, API, decision, database, note)
- AI-assisted editing (natural language commands to modify the canvas)
- Mermaid code import/export
- Save/load multiple named sketches
- Export diagrams to the knowledge base
- A side chat panel where the CEO can discuss the canvas content with an AI agent

Think of it as: **"A diagramming app with an AI assistant that can understand and modify your diagrams through conversation."**

---

### Data Displayed — In Detail

**Header Bar:**
- Page title: "SketchVibe"
- Current sketch name (if saved) with dirty indicator (*) when unsaved changes exist
- Save button (saves current canvas; if new, opens save dialog)
- List toggle button (opens/closes the sketch list sidebar)
- Mermaid import button (opens modal for pasting Mermaid code)
- Export button (copies canvas as Mermaid code to clipboard, shows "복사됨!" confirmation)
- Knowledge base save button (exports diagram to knowledge base; only enabled when sketch is saved)
- Undo / Redo buttons (only for AI-applied canvas changes, not manual edits; enabled/disabled based on stack state)
- Agent selector dropdown (choose which AI agent to chat with while working on the canvas)
- Desktop: Chat open/close toggle
- Mobile: Canvas/Chat tab switcher

**Sketch List Sidebar (togglable, desktop only):**
- List of saved sketches with names and dates
- Click to load a sketch (shows confirmation dialog if current canvas has unsaved changes)
- "New canvas" button (also with dirty-check confirmation)
- Knowledge base section: diagrams previously saved to knowledge base can be loaded back onto the canvas (with dirty-check)

**Cross-page Navigation:**
- The Command Center can generate graph data and navigate to Nexus with a pre-populated canvas (e.g., via /sketchvibe command). The canvas opens with the generated nodes/edges already placed.

**Canvas Area:**
- Interactive node-graph canvas with pan, zoom, and pinch gestures
- Dotted grid background
- Minimap in corner (desktop only) showing overview of the entire graph
- Zoom controls (zoom in, zoom out, fit view)
- Nodes can be:
  - Dragged to reposition
  - Connected by dragging from one node's handle to another (creates edges)
  - Double-clicked to edit their label text inline
  - Right-clicked for context menu
  - Deleted via Delete/Backspace key
- 8 node types available, each with distinct visual shape:
  - **시작** (Start) — process entry point
  - **종료** (End) — process endpoint
  - **에이전트** (Agent) — represents an AI agent
  - **시스템** (System) — internal system
  - **외부 API** (External API) — external service
  - **결정** (Decision) — branching logic
  - **데이터베이스** (Database) — data store
  - **메모** (Note) — freeform text annotation
- Edges (connections between nodes):
  - Can have labels (double-click edge to add/edit label)
  - Editable edge type with customizable paths

**Node Palette (floating toolbar, top-left):**
- "+ 노드" button that opens a dropdown palette
- Palette shows all 8 node types with icons and Korean labels
- Click a type to add a new node at a random position
- "정렬" button — auto-layout using dagre algorithm (arranges nodes in a clean hierarchy)
- "초기화" button — clears the entire canvas (with confirmation dialog)

**Context Menu (right-click):**
- On a node: Edit label, Duplicate, Delete
- On empty canvas: Add node (shows submenu with all 8 types, placed at click position)

**AI Command Bar (bottom of canvas):**
- Text input with "AI" label
- Placeholder: "예: DB 노드를 추가하고 API 서버에 연결해줘"
- Send button (or Enter key)
- When processing: shows "처리중..." and disables input
- AI responses come as Mermaid code that gets parsed into canvas nodes/edges
- **Preview overlay** appears in the top-right corner showing:
  - "AI 제안" label
  - Description of what the AI changed
  - "적용" (Apply) and "취소" (Cancel) buttons
  - While preview is active, the canvas shows the proposed changes (not the original). Canvas editing is disabled during preview.
- Error display below input bar if AI command fails
- WebSocket channel "nexus" also receives AI commands from other sources (e.g., agents working in the background)

**Status Bar (bottom):**
- Node count ("노드 N개")
- Edge count ("연결 N개")
- Dirty indicator ("미저장") when changes exist
- Auto-save confirmation ("자동 저장됨") toast
- Undo stack depth ("Undo N" when stack is non-empty)
- Keyboard shortcuts hint: "더블클릭: 이름 편집 | Delete: 삭제 | 핸들 드래그: 연결 | 우클릭: 메뉴"

**Empty Canvas State:**
- Centered message: "여기에 그림을 그려보세요"
- Instructions: "왼쪽 위 '+ 노드' 버튼으로 노드를 추가하고, 드래그해서 연결하세요. 하단 AI 명령으로 자동 생성할 수도 있어요."

**Chat Panel (right side):**
- Standard chat interface (same as used elsewhere in the app)
- Agent is selected via the header dropdown
- Chat is contextual — the current canvas state (nodes, edges, labels) is serialized and sent to the agent as context, so the agent can discuss and suggest changes to the diagram
- Auto-creates a chat session with the first available agent

**Save Dialog (modal):**
- Text input for canvas name
- Save and Cancel buttons
- Triggered when saving a new (unsaved) canvas

**Mermaid Import Modal:**
- Large textarea for pasting Mermaid flowchart code
- Placeholder shows example Mermaid syntax
- Apply and Cancel buttons
- Error message if parsing fails

**Export to Knowledge Base Dialog:**
- Saves the current diagram (as Mermaid + metadata) to the company's knowledge base
- Only available when the sketch has been saved

**Auto-save:**
- Automatically saves the current sketch every 30 seconds if there are unsaved changes and the sketch has been previously saved
- Shows brief "자동 저장됨" toast notification

---

### User Actions

1. **Add nodes** — via palette dropdown, context menu, or AI command
2. **Connect nodes** — drag from one node's handle to another
3. **Edit labels** — double-click a node or edge to edit its text inline
4. **Move nodes** — drag to reposition
5. **Delete nodes/edges** — select and press Delete, or use context menu
6. **Duplicate nodes** — right-click context menu
7. **Auto-layout** — click "정렬" to automatically arrange nodes
8. **Clear canvas** — click "초기화" with confirmation
9. **Save/load sketches** — save current canvas, load from list, create new
10. **Import Mermaid** — paste Mermaid code to generate canvas
11. **Export Mermaid** — copy canvas as Mermaid code to clipboard
12. **AI canvas commands** — type natural language instructions to modify the canvas. Preview proposed changes before applying.
13. **Undo/Redo** — revert or re-apply AI-generated changes
14. **Chat with agent** — discuss the diagram with an AI agent who can see the canvas content
15. **Export to knowledge base** — persist the diagram for company-wide access
16. **Load from knowledge base** — import previously saved diagrams
17. **Select different agent** — switch which AI agent to chat with
18. **Pan/zoom canvas** — scroll to pan, pinch to zoom, use controls

---

### UX Considerations

- **The canvas is a creative tool** — it should feel responsive, fluid, and fun to use. Dragging nodes, connecting edges, and zooming should feel natural and smooth.
- **AI assistance is the superpower** — the CEO can describe what they want in Korean ("마케팅 부서 워크플로우를 그려줘") and the AI generates it. The preview-before-apply pattern is critical so the CEO doesn't lose work.
- **Mermaid is the interchange format** — the canvas converts to/from Mermaid code. This enables importing diagrams from other tools and exporting for documentation.
- **Multiple sketches** — the CEO can maintain many named canvases. The sidebar provides browse/load functionality. Auto-save prevents accidental data loss.
- **Chat context is the canvas** — the AI agent sees what's on the canvas. This makes the chat contextual and useful for discussing architecture, improving workflows, or getting suggestions.
- **Mobile: canvas or chat** — on mobile, show either the canvas or the chat, never both. Tab switching between the two views. The canvas should still be fully functional on mobile with touch gestures.
- **The node palette should be quick to access** — a floating "+ Node" button that expands to show all types. Placing a node should take 2 clicks maximum.
- **Auto-save should be invisible** — just a brief toast. The user shouldn't think about saving manually most of the time.
- **Empty canvas should be inviting** — guide the user to either add nodes manually or use AI to generate something.
- **Loading states**: Canvas loading when fetching a sketch, AI processing indicator, auto-save indicator.
- **Keyboard shortcuts should be discoverable** — the status bar hints are always visible.

---

### What NOT to Include on This Page

- Org chart visualization (that's a different feature — Nexus originally showed org trees but the current implementation is SketchVibe diagramming only)
- Workflow execution or running workflows from the canvas (the backend has workflow execution but this page is for visual editing only)
- Real-time collaboration with other users (single-user canvas editing)
- Image insertion or rich media nodes
- Presentation mode or slideshow
- Version history or revision tracking for sketches
