# 06. Nexus / SketchVibe — Design Spec (Claude Coding Prompt)

## Page Overview
**Route**: `/nexus` (CEO App — `packages/app/src/pages/nexus.tsx`)
**Purpose**: Interactive visual canvas for creating node-based diagrams with AI assistance, Mermaid import/export, and contextual chat.
**Source**: 1,160 lines main file + 13 component files + 4 utility files

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER BAR (h-10, border-b border-slate-700)                       │
│ ┌──────┬──────────┬────┬────┬───────┬──────┬─────┬──┬──┬────┬────┐│
│ │Title │SketchName│Save│List│Mermaid│Export│KB   │↩ │↪ │Agent│Chat││
│ │      │ — name * │    │    │Import │      │Save │  │  │Sel │Tog ││
│ └──────┴──────────┴────┴────┴───────┴──────┴─────┴──┴──┴────┴────┘│
├──────────┬──────────────────────────────────────┬───────────────────┤
│ SIDEBAR  │ CANVAS AREA                          │ CHAT PANEL        │
│ w-52     │ flex-1                                │ w-[380px]         │
│ (toggle) │                                      │ lg:w-[420px]      │
│          │ ┌─────────────┐                      │                   │
│ Sketches │ │ NODE PALETTE│ ┌──────────────────┐ │ ┌───────────────┐ │
│ tab      │ │ + 노드      │ │ AI PREVIEW       │ │ │ ChatArea      │ │
│          │ │ ⟳ 정렬      │ │ (top-right z-20) │ │ │ Component     │ │
│ Knowledge│ │ ✕ 초기화    │ │ 적용 / 취소      │ │ │               │ │
│ tab      │ │ (top-left)  │ └──────────────────┘ │ │               │ │
│          │ └─────────────┘                      │ │               │ │
│          │                                      │ │               │ │
│          │        ReactFlow Canvas              │ │               │ │
│          │        (Background: Dots)            │ │               │ │
│          │        (Controls: bottom-left)       │ │               │ │
│          │        (MiniMap: bottom-right)        │ │               │ │
│          │                                      │ │               │ │
│          ├──────────────────────────────────────┤│ │               │ │
│          │ AI COMMAND BAR (border-t)            ││ │               │ │
│          │ [AI] [input________________________] ││ │               │ │
│          │                          [전송]      ││ │               │ │
│          ├──────────────────────────────────────┤│ │               │ │
│          │ STATUS BAR (h-6)                     ││ └───────────────┘ │
│          │ 노드 5개 | 연결 3개 | 미저장 | hints ││                   │
└──────────┴──────────────────────────────────────┴───────────────────┘
```

### Mobile Layout (< md breakpoint)
- Sidebar hidden
- Tab switcher in header: `캔버스` | `채팅`
- Only one view visible at a time
- Chat panel takes full width when active

---

## Component Breakdown

### 1. Header Bar
```
Container: px-3 py-2 border-b border-slate-700 flex items-center gap-2
```

| Element | Tailwind Classes | States |
|---------|-----------------|--------|
| Title "SketchVibe" | `text-base font-semibold shrink-0 text-slate-50` | Static |
| Sketch Name | `text-xs text-slate-400 truncate max-w-[120px]` | Shows `— {name} *` when dirty |
| Save Button | `px-2 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors` | `disabled:bg-slate-700 disabled:text-slate-500` when empty canvas |
| List Toggle | `px-2 py-1 text-xs rounded transition-colors` | Active: `bg-blue-600 text-white`, Inactive: `bg-slate-700 hover:bg-slate-600 text-slate-300` |
| Mermaid Import | `px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors` | — |
| Export Button | `px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors` | Shows "복사됨!" for 2s after copy, `disabled:bg-slate-800 disabled:text-slate-600` |
| KB Save | `px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors` | Disabled when no sketchId or empty canvas |
| Undo/Redo | `px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors` | `disabled:bg-slate-800 disabled:text-slate-600` when stack empty |
| Agent Selector | `text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 max-w-[140px] text-slate-200` | Populates from /workspace/agents |
| Chat Toggle (desktop) | `hidden md:block px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors` | Text toggles: "채팅 닫기" / "채팅 열기" |
| Mobile Tabs | `flex md:hidden gap-1` | Active: `bg-slate-700 text-white`, Inactive: `text-slate-400` |

### 2. Canvas Sidebar (w-52, toggle, desktop only)
```
Container: w-52 border-r border-slate-800 shrink-0 hidden md:block
```
- **CanvasSidebar** component (`canvas-sidebar.tsx`, 234 lines)
- Two tabs: "sketches" | "knowledge base"
- Sketches: list saved canvases, duplicate/delete actions
- Knowledge: load Mermaid diagrams from knowledge docs
- Each sketch item: name + date, click to load (with dirty-check confirm)

### 3. Canvas Area
```
Container: flex-1 flex flex-col relative
Mobile hide: mobileView === 'chat' ? 'hidden md:flex' : 'flex'
```

#### 3a. Node Palette (floating, top-left, z-10)
```
Container: absolute top-2 left-2 z-10 flex flex-col gap-1
```

| Element | Classes |
|---------|---------|
| "+ 노드" button | `px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors` |
| Palette dropdown | `absolute top-full left-0 mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 w-44 z-50` |
| Palette item | `w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-800 rounded transition-colors` |
| Color swatch | `w-5 h-5 rounded flex items-center justify-center text-white text-[10px] {item.color}` |
| "⟳ 정렬" button | `px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow transition-colors` |
| "✕ 초기화" button | `px-3 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded-lg shadow transition-colors` |

**8 Node Types (from `sketchvibe-nodes.tsx`):**
| Type | Korean Label | Color | Shape |
|------|-------------|-------|-------|
| start | 시작 | bg-emerald-500 | Rounded pill `([, ])` |
| end | 종료 | bg-red-500 | Double-rounded `((, ))` |
| agent | 에이전트 | bg-blue-500 | Rectangle with "AGENT" label |
| system | 시스템 | bg-slate-500 | Rectangle with "SYSTEM" label |
| api | 외부 API | bg-orange-500 | Hexagon `{{, }}` |
| decide | 결정 | bg-amber-500 | Diamond `{, }` |
| db | 데이터베이스 | bg-purple-500 | Cylinder shape |
| note | 메모 | bg-amber-300 | Sticky note |

#### 3b. AI Preview Overlay (conditional, top-right)
```
Container: absolute top-2 right-2 z-20 bg-slate-900/95 border border-blue-500 rounded-lg shadow-xl p-3 w-72
```

| Element | Classes |
|---------|---------|
| "AI 제안" label | `text-xs text-blue-400 font-semibold mb-1` |
| Description | `text-xs text-slate-300 mb-3` |
| Apply button | `flex-1 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors` |
| Cancel button | `flex-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors` |

#### 3c. Empty Canvas State
```
Container: absolute inset-0 flex items-center justify-center pointer-events-none z-10
```
- "여기에 그림을 그려보세요" — `text-lg mb-2 text-slate-500`
- Instructions — `text-sm text-slate-500`

#### 3d. ReactFlow Canvas
```
Container: flex-1
Background: variant=Dots, gap=20, size=1, color="#3f3f46"
MiniMap: w-120 h-80, hidden md:block, bg-slate-800
Controls: default position (bottom-left)
```

- `fitView` on load with padding 0.3
- `minZoom=0.1`, `maxZoom=3`
- `panOnScroll`, `zoomOnPinch`
- `deleteKeyCode=['Backspace', 'Delete']` (disabled during AI preview)
- `nodesDraggable`, `nodesConnectable` disabled during AI preview
- Default edge type: `editable` (from `editable-edge.tsx`)

#### 3e. AI Command Bar
```
Container: px-3 py-2 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2
```

| Element | Classes |
|---------|---------|
| "AI" label | `text-[10px] text-blue-400 font-semibold shrink-0` |
| Input | `flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 disabled:opacity-50` |
| Send button | `px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shrink-0` |
| Placeholder | `예: DB 노드를 추가하고 API 서버에 연결해줘` |
| Loading text | "처리중..." (replaces "전송") |

#### 3f. AI Error Bar (conditional)
```
Container: px-3 py-1 bg-red-900/30 border-t border-red-800
Error text: text-[10px] text-red-400
```

#### 3g. Status Bar
```
Container: px-3 py-1 border-t border-slate-800 bg-slate-900/80 flex items-center gap-3 text-[10px] text-slate-500
```

| Element | Classes | Condition |
|---------|---------|-----------|
| Node count | `text-slate-500` | Always: "노드 {N}개" |
| Edge count | `text-slate-500` | Always: "연결 {N}개" |
| Dirty indicator | `text-amber-500` | When dirty: "미저장" |
| Auto-save toast | `text-emerald-400` | 2s flash: "자동 저장됨" |
| Undo depth | `text-slate-600` | When >0: "Undo {N}" |
| Shortcuts hint | `hidden sm:inline text-slate-500` | "더블클릭: 이름 편집 \| Delete: 삭제 \| 핸들 드래그: 연결 \| 우클릭: 메뉴" |

### 4. Chat Panel
```
Container: border-l border-slate-800 flex flex-col
Desktop: hidden md:flex, w-[380px] lg:w-[420px] shrink-0
Mobile: full width when mobileView === 'chat'
```
- Renders `<ChatArea>` component with `agent`, `sessionId`, `canvasContext` props
- Canvas context: serialized text representation of all nodes and edges

### 5. Context Menu (`context-menu.tsx`, 113 lines)
```
Container: fixed, positioned at click coordinates, bg-slate-900 border border-slate-700 rounded-lg shadow-xl
```
- **Node context**: Edit label, Duplicate, Delete
- **Pane context**: Add node (submenu with all 8 types, placed at click position)
- Auto-close on outside click or Escape

### 6. Save Dialog (Modal)
```
Overlay: fixed inset-0 bg-black/50 flex items-center justify-center z-50
Modal: bg-slate-800 border border-slate-700 rounded-2xl p-6 w-80 shadow-2xl
Title: text-sm font-semibold text-slate-200 mb-3
Input: w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500
```
- Cancel: `px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg`
- Save: `px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg`

### 7. Mermaid Import Modal
```
Overlay: fixed inset-0 bg-black/50 flex items-center justify-center z-50
Modal: bg-slate-800 border border-slate-700 rounded-2xl p-6 w-[480px] max-w-[90vw] shadow-2xl
Title: text-sm font-semibold text-slate-200 mb-3
Textarea: w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono outline-none focus:border-blue-500 resize-y, rows=10
Error: text-xs text-red-400 mt-2
```

### 8. Auto-Save Toast (floating)
```
Container: fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-800/90 text-emerald-200 text-xs rounded-lg shadow-lg animate-pulse
```
- Shows for 2 seconds after auto-save

---

## Interactions

| Action | Trigger | Behavior |
|--------|---------|----------|
| Add node | Palette click or context menu | New node at random or click position |
| Connect nodes | Drag from handle to handle | Creates editable edge |
| Edit label | Double-click node/edge | Inline text editing |
| Move node | Drag | Repositions, marks dirty |
| Delete | Select + Delete/Backspace | Removes node and connected edges |
| Duplicate | Right-click context menu | Copy at +30px offset |
| Auto-layout | "정렬" button | Dagre algorithm, TB direction, fitView |
| Clear canvas | "초기화" button | Confirm dialog → clear all |
| Save | Save button | If existing: PUT update. If new: show save dialog |
| Load sketch | Sidebar click | Fetch and restore (dirty-check confirm) |
| New canvas | Sidebar button | Reset all (dirty-check confirm) |
| Mermaid import | Modal textarea → Apply | Parse Mermaid → generate nodes/edges |
| Mermaid export | Export button | Copy to clipboard, show "복사됨!" 2s |
| AI command | Type + Enter/Send | POST → Mermaid response → preview overlay |
| Apply AI | "적용" button | Push to undo stack, replace canvas |
| Cancel AI | "취소" button | Dismiss preview |
| Undo/Redo | Header buttons | Restore from undo/redo stack (max 20) |
| Chat | Right panel | Sends canvas context to agent |
| Cross-page nav | From Command Center | `sessionStorage.pendingGraphData` → auto-populate |
| Auto-save | Every 30s when dirty + saved | PUT with autoSave=true flag |
| WebSocket | nexus channel | Receives canvas_ai_start, canvas_update, canvas_ai_error |

---

## Responsive Behavior

| Breakpoint | Changes |
|-----------|---------|
| < md (mobile) | Sidebar hidden, tab switcher (캔버스/채팅), MiniMap hidden, full-width chat |
| md+ (desktop) | Side-by-side canvas + chat, sidebar toggleable, MiniMap visible |
| lg+ | Chat panel wider (420px vs 380px) |
| < sm | Keyboard shortcuts hint hidden |

---

## Animations

| Element | Animation |
|---------|-----------|
| Auto-save toast | `animate-pulse`, appears bottom-center for 2s |
| Button hover | `transition-colors` on all buttons |
| Context menu | Appears instantly at click position |
| AI Preview | Appears top-right with border glow (border-blue-500) |
| Canvas | Smooth pan/zoom via ReactFlow |

---

## Accessibility

| Feature | Implementation |
|---------|---------------|
| Keyboard | Delete/Backspace to remove, Enter to send AI command, Escape to close modals |
| Focus | autoFocus on save dialog input, Mermaid textarea |
| Labels | title attributes on toolbar buttons |
| Screen reader | Button text is descriptive (Korean) |
| Touch | panOnScroll, zoomOnPinch enabled |

---

## data-testid Map

| Element | data-testid |
|---------|-------------|
| Page container | `nexus-page` |
| Save button | `nexus-save-btn` |
| Sidebar toggle | `nexus-sidebar-toggle` |
| Mermaid import button | `nexus-mermaid-import-btn` |
| Mermaid export button | `nexus-mermaid-export-btn` |
| KB save button | `nexus-kb-save-btn` |
| Undo button | `nexus-undo-btn` |
| Redo button | `nexus-redo-btn` |
| Agent selector | `nexus-agent-select` |
| Chat toggle | `nexus-chat-toggle` |
| Node palette trigger | `nexus-node-palette-btn` |
| Auto-layout button | `nexus-auto-layout-btn` |
| Clear button | `nexus-clear-btn` |
| AI command input | `nexus-ai-input` |
| AI send button | `nexus-ai-send-btn` |
| AI preview overlay | `nexus-ai-preview` |
| AI apply button | `nexus-ai-apply-btn` |
| AI cancel button | `nexus-ai-cancel-btn` |
| Status bar | `nexus-status-bar` |
| Save dialog | `nexus-save-dialog` |
| Mermaid modal | `nexus-mermaid-modal` |
| Canvas area | `nexus-canvas` |
| Chat panel | `nexus-chat-panel` |
| Mobile canvas tab | `nexus-mobile-canvas-tab` |
| Mobile chat tab | `nexus-mobile-chat-tab` |
| Auto-save toast | `nexus-autosave-toast` |
| Sidebar panel | `nexus-sidebar` |
| Context menu | `nexus-context-menu` |
