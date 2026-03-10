# 01. Command Center — Design Specification

## 1. Page Overview

- **Purpose**: CEO's mission-control for issuing natural-language commands to AI organization. Commands get classified, routed through AI agents via delegation pipeline, and results stream back in real-time.
- **Key User Goals**: Submit commands (text, slash, @mention, preset), watch delegation pipeline progress, read deliverables (markdown reports, diagrams), manage command templates.
- **Route**: `/command-center`
- **Data Dependencies**:
  - `GET /workspace/commands?limit=50` → command history
  - `GET /workspace/commands/:id` → single command detail
  - `POST /workspace/commands` → submit command `{ text, targetAgentId? }`
  - `GET /workspace/org-chart` → agents + departments (for @mention)
  - `GET /workspace/presets` → saved command templates
  - `POST /workspace/presets` → create preset
  - `PATCH /workspace/presets/:id` → update preset
  - `DELETE /workspace/presets/:id` → delete preset
  - `POST /workspace/presets/:id/execute` → execute preset
  - `POST /workspace/sketches` → save generated diagram
  - WebSocket channels: `command`, `delegation`, `tool`, `nexus`
- **Current State**: Functional dark page with zinc palette. Needs consistent slate design tokens, improved visual hierarchy, polished pipeline bar, and better mobile experience.

## 2. Page Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ PipelineVisualization (top bar, h-16)                           │
│ [Manager ──→ Analyst ──→ Writer ──→ Designer]                   │
├──────────────────────────┬──────────────────────────────────────┤
│ MessageThread            │ DeliverableViewer                    │
│ (left panel, w-[420px])  │ (right panel, flex-1)               │
│                          │                                      │
│ [User msg]               │ [Tab: 개요 | 산출물]                 │
│ [Agent msg + quality]    │ [Markdown rendered content]          │
│ [User msg]               │                                      │
│ ...                      │                                      │
│                          │                                      │
├──────────────────────────┴──────────────────────────────────────┤
│ CommandInput (bottom, sticky)                                    │
│ [Target chip?] [Textarea] [/ @ Templates Send]                  │
└─────────────────────────────────────────────────────────────────┘

Mobile (< md):
┌───────────────────────┐
│ Pipeline (h-12)       │
├───────────────────────┤
│ Tab: [대화] [보고서]  │
├───────────────────────┤
│ Active tab content    │
│ (full width)          │
│                       │
├───────────────────────┤
│ CommandInput          │
└───────────────────────┘
```

- **Page container**: `flex flex-col h-full bg-slate-900`
- **Pipeline bar**: `flex items-center gap-3 px-4 h-16 border-b border-slate-700 bg-slate-900 shrink-0`
- **Content area**: `flex flex-1 min-h-0 overflow-hidden`
- **Left panel**: `w-[420px] flex flex-col border-r border-slate-700 hidden md:flex`
- **Right panel**: `flex-1 flex flex-col min-w-0`
- **Input area**: `shrink-0 border-t border-slate-700 bg-slate-900 p-3`
- **Mobile tab bar**: `flex md:hidden border-b border-slate-700`
  - Tab button: `flex-1 py-2.5 text-sm font-medium text-center transition-colors`
  - Active: `text-blue-400 border-b-2 border-blue-400`
  - Inactive: `text-slate-500`

## 3. Component Breakdown

### 3.1 PipelineVisualization

- **Purpose**: Show current command's delegation progress as a horizontal stage pipeline
- **Container**: `flex items-center gap-2 px-4 h-16 border-b border-slate-700 bg-slate-900 shrink-0 overflow-x-auto`
- **Header dot** (left):
  - Working: `<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />`
  - Failed: `<span className="w-2 h-2 rounded-full bg-red-500" />`
  - Idle: `<span className="w-2 h-2 rounded-full bg-slate-600" />`

**Stage item** (repeated for Manager, Analyst, Writer, Designer):
- Container: `flex items-center gap-2 px-3 py-1.5 rounded-lg`
- Status dot:
  - `done`: `<span className="w-2 h-2 rounded-full bg-emerald-500" />`
  - `working`: `<span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />`
  - `waiting`: `<span className="w-2 h-2 rounded-full bg-slate-600" />`
  - `failed`: `<span className="w-2 h-2 rounded-full bg-red-500" />`
- Role name: `<span className="text-xs font-medium text-slate-300">{role}</span>`
- Description: `<span className="text-xs text-slate-500 max-w-[120px] truncate">{desc}</span>`

**Connector arrow** (between stages):
- Normal: `<span className="text-slate-600 text-xs">→</span>`
- Failed: `<span className="text-red-500 text-xs">→</span>`

- **Empty state** (no active command): `<p className="text-xs text-slate-600">명령을 입력하면 처리 파이프라인이 표시됩니다</p>`
- **data-testid**: `pipeline-bar`

### 3.2 MessageThread

- **Purpose**: Chronological list of command history messages (user commands, agent responses, system errors)
- **Container**: `flex-1 overflow-y-auto px-4 py-3 space-y-3`
- **Scroll-to-bottom button**: `absolute bottom-20 right-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full p-2 shadow-lg transition-colors z-10`
  - Icon: ChevronDown 16x16
  - Visible when scrolled up >100px from bottom

**User message bubble**:
- Container: `flex items-start gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 transition-colors`
- Avatar: `w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0`
  - Icon: `<UserIcon className="w-4 h-4 text-white" />`
- Content:
  - Name + time: `<div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-200">You</span><span className="text-xs text-slate-500">{time}</span></div>`
  - Text: `<p className="text-sm text-slate-300 mt-0.5">{text}</p>`
- Selected state: `ring-1 ring-blue-500/50 bg-slate-800/30`

**Agent message bubble**:
- Container: `flex items-start gap-3 cursor-pointer hover:bg-slate-800/50 rounded-lg p-2 transition-colors`
- Avatar: `w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold`
  - Role-based colors:
    - MANAGER: `bg-violet-950 text-violet-300 border border-violet-800`
    - CONTENT: `bg-amber-950 text-amber-300 border border-amber-800`
    - ANALYST: `bg-blue-950 text-blue-300 border border-blue-800`
    - DESIGNER: `bg-emerald-950 text-emerald-300 border border-emerald-800`
    - Default: `bg-slate-800 text-slate-300 border border-slate-700`
- Content:
  - Header row: `<div className="flex items-center gap-2 flex-wrap">`
    - Name: `<span className="text-sm font-medium text-slate-200">{agentName}</span>`
    - Role badge: `<span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{role}</span>`
    - Quality badge (if present):
      - PASS: `<span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASS {score}</span>`
      - FAIL: `<span className="text-xs px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">FAIL {score}</span>`
    - Time: `<span className="text-xs text-slate-500">{time}</span>`
  - Text: `<p className="text-sm text-slate-300 mt-1">{summary}</p>`
  - Sketch preview (if sketchResult): renders `SketchPreviewCard` component

**System error message**:
- Container: `flex items-center justify-center py-2`
- Box: `bg-red-950/50 border border-red-900/50 rounded-lg px-4 py-2 flex items-center gap-2`
  - Icon: `<AlertCircle className="w-4 h-4 text-red-400 shrink-0" />`
  - Text: `<span className="text-sm text-red-300">{errorText}</span>`

**Loading skeleton**:
```
<div className="space-y-3 px-4 py-3">
  {[1,2,3,4].map(i => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="bg-slate-800 animate-pulse rounded h-4 w-24" />
        <div className="bg-slate-800 animate-pulse rounded h-4 w-full" />
        <div className="bg-slate-800 animate-pulse rounded h-4 w-3/4" />
      </div>
    </div>
  ))}
</div>
```

**Empty state**:
- Container: `flex flex-col items-center justify-center h-full text-center px-6`
- Icon: `<Terminal className="w-12 h-12 text-slate-700 mb-4" />`
- Title: `<p className="text-sm font-medium text-slate-400 mb-2">아직 명령이 없습니다</p>`
- Hints: `<div className="space-y-1.5">`
  - Each: `<button className="text-xs text-slate-500 hover:text-blue-400 transition-colors">"오늘 주요 뉴스 브리핑해줘"</button>`

- **data-testid**: `message-thread`

### 3.3 DeliverableViewer

- **Purpose**: Display selected command's detailed result (markdown report)
- **Container**: `flex-1 flex flex-col min-w-0`

**Header** (when command selected):
- Container: `flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0`
- Left: `<div className="flex items-center gap-2 min-w-0">`
  - Title: `<span className="text-sm font-medium text-slate-200 truncate">{command.text.slice(0,40)}</span>`
  - Quality badge (same as agent message quality badge)
- Right: `<div className="flex items-center gap-1">`
  - Expand button: `<button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"><Maximize2 className="w-4 h-4" /></button>`
  - Close button: `<button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"><X className="w-4 h-4" /></button>`

**Tabs**:
- Container: `flex border-b border-slate-700 shrink-0`
- Tab: `px-4 py-2 text-sm font-medium transition-colors`
  - Active: `text-blue-400 border-b-2 border-blue-400`
  - Inactive: `text-slate-500 hover:text-slate-300`
- Tabs: "개요", "산출물"

**Content area**:
- Container: `flex-1 overflow-y-auto px-4 py-4`
- Prose wrapper: `prose prose-sm prose-invert max-w-none prose-headings:text-slate-100 prose-p:text-slate-300 prose-strong:text-slate-200 prose-code:text-cyan-400 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-a:text-blue-400 prose-blockquote:border-slate-600 prose-blockquote:text-slate-400 prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700`

**Footer hint**: `<p className="text-xs text-slate-600 text-center py-2">클릭하여 전체 보기</p>`

**Empty state** (no command selected):
- Container: `flex flex-col items-center justify-center h-full`
- Icon: `<FileText className="w-12 h-12 text-slate-700 mb-3" />`
- Text: `<p className="text-sm text-slate-500">산출물이 선택되지 않았습니다</p>`
- Hint: `<p className="text-xs text-slate-600 mt-1">왼쪽에서 명령을 선택하세요</p>`

**Loading state**: `<div className="flex items-center justify-center h-full"><Spinner className="w-6 h-6 text-blue-500" /></div>`

- **data-testid**: `deliverable-viewer`

### 3.4 CommandInput

- **Purpose**: Multi-line textarea with slash commands, @mentions, preset access, and send
- **Container**: `shrink-0 border-t border-slate-700 bg-slate-900 p-3`

**Target agent chip** (when @mentioned agent selected):
- `<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium border border-blue-500/30 mb-2">`
  - `<span>@{agentName}</span>`
  - Remove: `<button className="hover:text-blue-100 transition-colors"><X className="w-3 h-3" /></button>`

**Input row**: `<div className="flex items-end gap-2">`

**Action buttons** (left of textarea): `<div className="flex items-center gap-1 pb-1">`
- Slash button: `<button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors" title="슬래시 명령"><span className="text-sm font-mono">/</span></button>`
- Mention button: `<button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors" title="에이전트 멘션"><span className="text-sm">@</span></button>`
- Templates button: `<button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors" title="템플릿"><Bookmark className="w-4 h-4" /></button>`

**Textarea**:
```
<textarea
  className="flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 outline-none resize-none transition-colors min-h-[44px] max-h-[160px]"
  placeholder="명령을 입력하세요... (Enter 전송 · Shift+Enter 줄바꿈)"
/>
```

**Send button**: `<button className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0" disabled={empty || submitting}><Send className="w-4 h-4" /></button>`

**Slash popup** (absolute, above input):
- Container: `absolute bottom-full left-0 mb-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50`
- Search: `<input className="w-full px-3 py-2 text-sm bg-transparent text-white border-b border-slate-700 outline-none placeholder-slate-500" placeholder="명령어 검색..." />`
- Section label: `<p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">기본 명령어</p>`
- Item: `<button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">`
  - Icon: `<span className="w-6 h-6 rounded bg-{color}-500/20 text-{color}-400 flex items-center justify-center text-xs">{icon}</span>`
  - Name: `<span className="font-medium text-slate-200">{name}</span>`
  - Desc: `<span className="text-xs text-slate-500">{desc}</span>`
- Selected: `bg-slate-700`
- Preset section label: `<p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-slate-500 border-t border-slate-700">저장된 프리셋</p>`

**Mention popup** (absolute, above input):
- Container: `absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-80 overflow-y-auto`
- Search: same style as slash popup search
- Department group: `<p className="px-3 py-1 text-xs font-medium text-slate-500 bg-slate-800/50 sticky top-0">{deptName}</p>`
- Agent item: `<button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-700 transition-colors">`
  - Avatar: `<span className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">{initials}</span>`
  - Name: `<span className="text-sm text-slate-200">{name}</span>`
  - Tier badge:
    - manager: `<span className="text-xs px-1 py-0.5 rounded bg-purple-500/20 text-purple-300">매니저</span>`
    - specialist: `<span className="text-xs px-1 py-0.5 rounded bg-blue-500/20 text-blue-300">전문가</span>`
  - Status dot:
    - ACTIVE: `<span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />`
    - IDLE: `<span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />`
    - BUSY: `<span className="w-1.5 h-1.5 rounded-full bg-amber-500" />`
- Selected: `bg-slate-700`

- **data-testid**: `command-input`

### 3.5 SketchPreviewCard

- **Purpose**: Mini ReactFlow canvas preview of AI-generated Mermaid diagram
- **Container**: `bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden mt-2`
- **Canvas area**: `h-48 bg-slate-900/50 relative`
  - ReactFlow mini-canvas (pan/zoom disabled, fitView)
- **Footer**: `flex items-center gap-2 p-3 border-t border-slate-700`
  - Open in editor: `<button className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">SketchVibe에서 열기</button>`
  - Save: `<button className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">저장</button>`
  - Copy Mermaid: `<button className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors">Mermaid 복사</button>`

**Save dialog** (inline, replaces footer temporarily):
- Container: `flex items-center gap-2 p-3 border-t border-slate-700`
- Input: `<input className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white outline-none" placeholder="스케치 이름" />`
- Confirm: `<button className="text-xs px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">확인</button>`
- Cancel: `<button className="text-xs px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">취소</button>`

**Loading state** (SketchLoadingCard):
- Container: `h-32 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-center mt-2`
- Content: `<span className="text-sm text-slate-400 animate-pulse">🎨 다이어그램 생성 중...</span>`

- **data-testid**: `sketch-preview`

### 3.6 PresetManager (Modal)

- **Purpose**: CRUD for saved command templates
- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`
- **Modal**: `bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col`

**Header**: `flex items-center justify-between px-5 py-4 border-b border-slate-700 shrink-0`
- Title: `<h3 className="text-lg font-semibold text-slate-50">명령 프리셋</h3>`
- Close: `<button className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>`

**List mode content**: `flex-1 overflow-y-auto`
- Create button (top): `<button className="w-full flex items-center gap-2 px-5 py-3 text-sm text-blue-400 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50"><Plus className="w-4 h-4" /> 새 프리셋 만들기</button>`
- Preset item: `<div className="px-5 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">`
  - Row 1: `<div className="flex items-center justify-between">`
    - Name: `<span className="text-sm font-medium text-slate-200">{name}</span>`
    - Actions (visible on group hover): `<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">`
      - Run: `<button className="p-1 rounded text-emerald-400 hover:bg-slate-600 transition-colors"><Play className="w-3.5 h-3.5" /></button>`
      - Edit: `<button className="p-1 rounded text-slate-400 hover:bg-slate-600 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>`
      - Delete: `<button className="p-1 rounded text-red-400 hover:bg-slate-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>`
  - Command preview: `<p className="text-xs text-slate-500 mt-1 truncate">{command}</p>`
  - Category badge (if set): `<span className="inline-flex mt-1 text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{category}</span>`
  - Global indicator: `<span className="inline-flex text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 ml-1">공유</span>`

**Create/Edit form**:
- Container: `px-5 py-4 space-y-3`
- Name input: `<input className="w-full bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="프리셋 이름" />`
- Command textarea: `<textarea className="w-full bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none h-24" placeholder="명령어 내용" />`
- Description input: `<input className="w-full bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none" placeholder="설명 (선택사항)" />`
- Category select: `<select className="bg-slate-700 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-white outline-none"><option value="">카테고리 선택</option><option>일반</option><option>분석</option><option>보고</option><option>전략</option><option>마케팅</option><option>기술</option></select>`
- Buttons: `<div className="flex justify-end gap-2">`
  - Cancel: `<button className="px-4 py-2 text-sm rounded-lg text-slate-400 hover:bg-slate-700 transition-colors">취소</button>`
  - Save: `<button className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">저장</button>`

**Delete confirmation**: inline red bar
- `<div className="flex items-center justify-between px-5 py-2 bg-red-950/30 border-y border-red-900/30">`
  - Text: `<span className="text-xs text-red-300">이 프리셋을 삭제할까요?</span>`
  - Buttons: `<div className="flex gap-2"><button className="text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white">삭제</button><button className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">취소</button></div>`

- **data-testid**: `preset-manager-modal`

### 3.7 ReportDetailModal

- **Purpose**: Full-screen overlay showing complete command result with cost, delegation chain, quality scores, feedback
- **Overlay**: `fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm overflow-y-auto`
- **Content**: `max-w-4xl mx-auto px-4 py-8`
- **Header**: `flex items-center justify-between mb-6`
  - Title: `<h2 className="text-xl font-semibold text-slate-50 truncate">{command.text}</h2>`
  - Close: `<button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>`

**Report content**: same prose styling as DeliverableViewer

**Cost summary card**: `bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-6`
- Label: `<h4 className="text-sm font-medium text-slate-400 mb-2">비용 요약</h4>`
- Total: `<p className="text-lg font-bold text-slate-50">${totalCostUsd.toFixed(4)}</p>`
- Detail row: `<div className="flex items-center justify-between text-xs text-slate-500 mt-1"><span>입력 토큰: {inputTokens}</span><span>출력 토큰: {outputTokens}</span></div>`

**Delegation chain card**: `bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4`
- Label: `<h4 className="text-sm font-medium text-slate-400 mb-3">위임 체인</h4>`
- Agent row: `<div className="flex items-center gap-3 py-2 border-b border-slate-700/50 last:border-0">`
  - Avatar (role-colored, same as message)
  - Name: `<span className="text-sm text-slate-200">{name}</span>`
  - Tier badge: `<span className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">{tier}</span>`
  - Task type: `<span className="text-xs text-slate-500">{taskType}</span>`
  - Duration: `<span className="text-xs text-slate-500">{durationMs}ms</span>`
  - Status dot (same as pipeline)

**Quality score card**: `bg-slate-800/50 border border-slate-700 rounded-xl p-4 mt-4`
- Label: `<h4 className="text-sm font-medium text-slate-400 mb-3">품질 평가</h4>`
- Overall: `<div className="flex items-center gap-2 mb-3"><span className="text-lg font-bold {passed ? 'text-emerald-400' : 'text-red-400'}">{passed ? 'PASS' : 'FAIL'}</span><span className="text-sm text-slate-400">{score}/10</span></div>`
- Per-criterion (5 items): `<div className="space-y-2">`
  - Row: `<div className="flex items-center gap-2"><span className="text-xs text-slate-400 w-20">{criterion}</span><div className="flex-1 h-1.5 bg-slate-700 rounded-full"><div className="h-full bg-blue-500 rounded-full" style="width: {pct}%" /></div><span className="text-xs text-slate-500 w-8 text-right">{val}/5</span></div>`

**Feedback buttons**: `<div className="flex items-center gap-3 mt-6">`
- Up: `<button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-sm"><ThumbsUp className="w-4 h-4" /> 좋아요</button>`
- Down: `<button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-red-500/50 hover:text-red-400 transition-colors text-sm"><ThumbsDown className="w-4 h-4" /> 아쉬워요</button>`

- **data-testid**: `report-detail-modal`

## 4. Interaction Specifications

| Action | Trigger | Handler | Result |
|--------|---------|---------|--------|
| Submit command | Enter key or Send button | `handleSubmit()` | POST /workspace/commands, add user msg, clear input |
| New line | Shift+Enter | textarea default | Adds line break in input |
| Open slash popup | Type `/` or click `/` button | `handleChange()` | Show slash popup above input |
| Select slash cmd | Click item or Enter | `handleSlashSelect()` | Insert command text, close popup |
| Open mention popup | Type `@` or click `@` button | `handleChange()` | Show mention popup |
| Select agent | Click or Enter | `handleMentionSelect()` | Set targetAgentId, show chip |
| Remove target | Click X on chip | clear targetAgentId | Remove chip |
| Navigate popup | Arrow Up/Down | `handleKeyDown()` | Move selection in popup |
| Close popup | Escape | `handleKeyDown()` | Dismiss popup |
| Select message | Click user/agent msg | `handleReportClick()` | Load command detail in DeliverableViewer |
| Open detail modal | Click expand in viewer | setDetailModalId | Open ReportDetailModal |
| Close detail modal | Click X or overlay | clear detailModalId | Close modal |
| Open presets | Click Templates button | setShowPresetManager | Open PresetManager modal |
| Execute preset | Click Run in preset list | `handleExecutePreset()` | POST /workspace/presets/:id/execute |
| Copy sketch | Click "Mermaid 복사" | clipboard.writeText | Toast "복사됨!" |
| Save sketch | Fill name + confirm | POST /workspace/sketches | Toast "저장됨" |
| Open in SketchVibe | Click button | sessionStorage + navigate | Navigate to /nexus/sketchvibe |
| Give feedback | Click thumbs up/down | PATCH /commands/:id/feedback | Update badge |

**Keyboard shortcuts**:
- Enter: Send command
- Shift+Enter: New line
- Escape: Close popup / deselect
- ArrowUp/Down: Navigate popup items
- Tab: Select highlighted popup item

**WebSocket real-time updates**:
- `command:COMPLETED` → add agent message with result + quality
- `command:FAILED` → add system error message
- `delegation:*` → update pipeline stages
- `nexus:canvas_ai_start` → show SketchLoadingCard
- `nexus:canvas_update` → replace with SketchPreviewCard
- `nexus:canvas_ai_error` → show error in sketch area

## 5. Responsive Design

### Desktop (≥ 1024px)
- Full 3-section layout: pipeline + (left thread 420px | right viewer flex-1) + input
- Both panels visible simultaneously

### Tablet (768px - 1023px)
- Same layout but left panel narrows to 320px
- Preset manager modal: max-w-md

### Mobile (< 768px)
- Pipeline bar: `h-12`, smaller text `text-[10px]`, horizontal scroll
- Tab bar replaces split: `대화` | `보고서`
- Single column content based on active tab
- Left panel hidden, right panel hidden (tab-controlled)
- Command input: full width, action buttons stack if needed
- Popups: full width `w-full` instead of fixed width
- Preset manager: `max-h-[90vh]`, full-width cards

## 6. Animation & Transitions

- Pipeline stage status change: `transition-colors duration-300`
- Pipeline working dot: `animate-pulse` (tailwind built-in)
- Popup open/close: `transition-all duration-200 ease-out` (opacity + translateY)
- Message appear: `animate-in fade-in slide-in-from-bottom-2 duration-300`
- Scroll-to-bottom button: `transition-opacity duration-200`
- Hover states: `transition-colors duration-150`
- Sketch loading: `animate-pulse`
- Skeleton loading: `animate-pulse`
- Tab underline: `transition-colors duration-200`

## 7. Accessibility

- **ARIA roles**: `role="log"` on MessageThread, `role="dialog"` on modals, `role="listbox"` on popups
- **aria-label**: Command input textarea `aria-label="명령 입력"`, Send button `aria-label="명령 전송"`
- **aria-live**: MessageThread `aria-live="polite"` for new messages, pipeline `aria-live="polite"` for status changes
- **Focus management**: Modal trap focus, popup auto-focuses first item, Escape closes
- **Keyboard navigation**: Full popup navigation, Enter to submit, Tab to cycle
- **Contrast**: All text meets WCAG AA against slate-900 background (slate-300 on 900 = 9.7:1, slate-400 on 900 = 6.4:1)
- **Role badges**: Include sr-only text for screen readers

## 8. data-testid Map

| Element | data-testid |
|---------|-------------|
| Page container | `command-center-page` |
| Pipeline bar | `pipeline-bar` |
| Pipeline stage | `pipeline-stage-{role}` |
| Message thread | `message-thread` |
| User message | `msg-user-{id}` |
| Agent message | `msg-agent-{id}` |
| System error | `msg-system-{id}` |
| Deliverable viewer | `deliverable-viewer` |
| Viewer tab | `viewer-tab-{name}` |
| Command input textarea | `command-input` |
| Send button | `send-button` |
| Slash popup | `slash-popup` |
| Slash item | `slash-item-{index}` |
| Mention popup | `mention-popup` |
| Mention item | `mention-agent-{id}` |
| Target chip | `target-chip` |
| Preset manager modal | `preset-manager-modal` |
| Preset item | `preset-item-{id}` |
| Preset create button | `preset-create-btn` |
| Sketch preview | `sketch-preview-{commandId}` |
| Sketch loading | `sketch-loading` |
| Report detail modal | `report-detail-modal` |
| Quality badge | `quality-badge-{commandId}` |
| Feedback up | `feedback-up` |
| Feedback down | `feedback-down` |
| Mobile tab | `mobile-tab-{name}` |
| Scroll-to-bottom | `scroll-bottom-btn` |
| Empty state | `empty-state` |
