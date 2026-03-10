# 27. Organization (조직도) — Claude Design Spec

## 복사할 프롬프트:

### What This Page Is For

The Organization page shows the CEO a **read-only visual overview** of their company's AI organization structure — departments, agents within departments, agent hierarchy (Manager → Specialist → Worker), and agent status. The CEO clicks an agent to see their details in a slide-out panel.

This is the **user-facing** (app) view. CRUD operations (create/edit/delete departments and agents) happen in the **Admin** panel. This page is for viewing and understanding the organization.

Think of it as: **A living org chart** where the CEO sees all their AI employees organized by department, with real-time status indicators.

---

### Design System Tokens

```
Page bg: bg-slate-900
Card bg: bg-slate-800/50 border border-slate-700 rounded-xl
Text primary: text-slate-50
Text secondary: text-slate-400
Border: border-slate-700
Status:
  online: emerald-500
  working: blue-500 (pulse animation)
  error: red-500
  offline: slate-500
Tier:
  manager: indigo-500
  specialist: blue-500
  worker: slate-400
```

---

### Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│ Header: Company Name + stats                                    │
│ "CORTHEX Corp" · 5개 부서 · 14명 에이전트                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ▼ 경영전략실 (3명)                                        │   │
│ │ ┌────────┐ ┌────────┐ ┌────────┐                         │   │
│ │ │Manager │ │Spec.   │ │Worker  │                         │   │
│ │ │ ●비서장│ │ ●분석관│ │ ●실무자│                         │   │
│ │ └────────┘ └────────┘ └────────┘                         │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ▼ 개발팀 (4명)                                            │   │
│ │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐             │   │
│ │ │Manager │ │Spec.   │ │Worker  │ │Worker  │             │   │
│ │ └────────┘ └────────┘ └────────┘ └────────┘             │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ ⚠ 미배속 에이전트 (2명)                                    │   │
│ │ ┌────────┐ ┌────────┐                                     │   │
│ │ │Worker  │ │Worker  │                                     │   │
│ │ └────────┘ └────────┘                                     │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                  │
├────────────────────────────────────────────────────────────────┤
│ Agent Detail Panel (slide-in from right, shown when selected)   │
│ ┌───────────────────────────────────────────────┐              │
│ │ ✕                                              │              │
│ │ Agent Name · Manager · 온라인                   │              │
│ │ Model: claude-sonnet-4-6                       │              │
│ │ Role: 팀 전체 관리 및 작업 분배                  │              │
│ │ Soul: (text preview, 4 lines)                  │              │
│ │ Tools: [도구1] [도구2] [도구3]                  │              │
│ └───────────────────────────────────────────────┘              │
└────────────────────────────────────────────────────────────────┘
```

**Page Container**: `min-h-screen bg-slate-900 text-slate-50`
**Inner**: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6`

---

### Component Specifications

#### 1. Page Header

```
Container: mb-6

CompanyName: text-2xl font-bold text-slate-50, "{companyName}"
Stats (flex items-center gap-3 mt-1):
  Stat: text-sm text-slate-400
    Content: "{N}개 부서 · {N}명 에이전트"
  Separator: text-slate-600, "·"
```

#### 2. Department Section (repeating)

```
Container: bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden

Header (px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/70 transition-colors):
  Left (flex items-center gap-2):
    CollapseIcon: text-xs text-slate-500, "▼" (expanded) / "▶" (collapsed)
    DeptName: text-sm font-semibold text-slate-50
    AgentCount: text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded, "({N}명)"

Body (px-4 pb-4, hidden when collapsed):
  Container: grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3
  (AgentNode cards inside, sorted by tier: manager first, then specialist, then worker)
```

**Unassigned Agents Section**:
```
Container: bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden

Header:
  Left:
    WarningIcon: text-amber-400, "⚠"
    Title: text-sm font-semibold text-amber-400, "미배속 에이전트"
    Count: as above
  (Same body layout)
```

#### 3. Agent Node (Card)

```
Container: bg-slate-800/80 border border-slate-700 rounded-lg p-3 cursor-pointer
  hover:border-slate-600 hover:bg-slate-700/50 transition-all
  Selected: border-blue-500/30 bg-blue-500/5

Top (flex items-center justify-between):
  StatusDot:
    online: w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]
    working: w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_6px_rgba(59,130,246,0.4)]
    error: w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]
    offline: w-2 h-2 rounded-full bg-slate-500

  TierBadge: text-[9px] font-medium px-1.5 py-0.5 rounded
    manager: bg-indigo-500/15 text-indigo-400, "Manager"
    specialist: bg-blue-500/15 text-blue-400, "Specialist"
    worker: bg-slate-500/15 text-slate-400, "Worker"

AgentName: text-xs font-semibold text-slate-200 mt-2 truncate
  Secretary suffix: text-cyan-400, " (비서실장)"

StatusLabel: text-[10px] mt-0.5
  online: text-emerald-400, "온라인"
  working: text-blue-400, "작업 중"
  error: text-red-400, "오류"
  offline: text-slate-500, "오프라인"

Role: text-[10px] text-slate-500 mt-1 truncate, agent.role || "역할 미지정"
```

#### 4. Agent Detail Panel (Slide-in)

```
Overlay: fixed inset-0 z-40
Backdrop: absolute inset-0 bg-black/40 backdrop-blur-sm (click to close)
Panel: absolute right-0 top-0 h-full w-80 md:w-96 bg-slate-800 border-l border-slate-700 shadow-2xl overflow-y-auto
  Animation: slide in from right (translate-x-full → translate-x-0)

Header (px-5 py-4 border-b border-slate-700 flex items-center justify-between):
  Left:
    Name: text-lg font-semibold text-slate-50
    Secretary: text-sm text-cyan-400, "(비서실장)"
  CloseBtn: text-slate-400 hover:text-slate-200, "✕"

Body (px-5 py-4 space-y-4):

  StatusSection (flex items-center gap-3):
    StatusDot (w-3 h-3 variant, same as above but larger)
    StatusText: text-sm text-{statusColor}
    TierBadge (larger version)

  InfoSection:
    Each field:
      Label: text-[10px] text-slate-500 font-medium uppercase tracking-wider
      Value: text-sm text-slate-200 mt-0.5

    Fields:
      - "모델": modelName (e.g., "claude-sonnet-4-6")
      - "역할": role text
      - "계급": tier label (Manager / Specialist / Worker)

  SoulSection:
    Label: text-[10px] text-slate-500 font-medium uppercase tracking-wider, "SOUL"
    Content: bg-slate-900/50 border border-slate-700 rounded-lg p-3 mt-1
      text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap
    Empty: text-xs text-slate-500 italic, "Soul이 설정되지 않았습니다"

  ToolsSection:
    Label: text-[10px] text-slate-500 font-medium uppercase tracking-wider, "허용 도구"
    Container: flex flex-wrap gap-1.5 mt-1
    ToolBadge: text-[10px] bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full
    Empty: text-xs text-slate-500 italic, "도구가 할당되지 않았습니다"
```

---

### Loading & Empty States

**Loading**:
```
Container: space-y-4
Skeleton: bg-slate-800/30 border border-slate-700/50 rounded-xl animate-pulse
  DeptSkeleton: h-40
  Repeat 3 times
```

**No Departments**:
```
Container: bg-slate-800/30 border border-dashed border-slate-700 rounded-xl p-12 text-center
Icon: text-4xl mb-3, "🏢"
Title: text-sm font-medium text-slate-300, "조직이 구성되지 않았습니다"
Subtitle: text-xs text-slate-500 mt-1, "관리자 패널에서 부서와 에이전트를 추가해주세요"
```

**Error**:
```
Container: bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center
Icon: text-2xl mb-2, "⚠️"
Title: text-sm text-red-400, "조직 정보를 불러올 수 없습니다"
RetryBtn: text-xs text-red-400 hover:text-red-300 underline mt-1, "다시 시도"
```

---

### State Management

**React Query Keys**:
- `['workspace-org-chart']` — Full org structure (departments + agents)

**Local State**:
- `selectedAgent: OrgAgent | null` — Selected agent for detail panel
- `collapsedDepts: Set<string>` — Collapsed department IDs

---

### Data Flow

1. `GET /api/workspace/org-chart` returns `{ company, departments: [{ id, name, agents: [...] }], unassignedAgents: [...] }`
2. Departments rendered in order, agents sorted by tier within each department
3. Click agent → set `selectedAgent` → show detail panel
4. Click backdrop or ✕ → clear `selectedAgent` → hide panel

---

### What NOT to Include

- No CRUD operations (create/edit/delete departments or agents — that's Admin)
- No drag-and-drop reorganization (that's Admin org-chart)
- No template management (that's Admin)
- No agent configuration changes (that's Admin)
- This page is READ-ONLY — viewing the organization structure only
