# 26. Classified (기밀문서) — Claude Design Spec

## 복사할 프롬프트:

### What This Page Is For

Classified is the CEO's document archive — completed command results stored with security classifications (public, internal, confidential, secret). It provides folder-based organization, advanced filtering, quality score tracking, and similar document discovery.

Think of it as: **A secure filing cabinet** where every AI-completed task result is automatically archived with classification levels, searchable and organized into folders.

---

### Design System Tokens

```
Page bg: bg-white dark:bg-zinc-950 (supports light + dark mode)
Card bg: bg-zinc-50 dark:bg-zinc-800/60 rounded-lg
Elevated: bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
Text primary: text-zinc-900 dark:text-zinc-100
Text secondary: text-zinc-600 dark:text-zinc-400
Text muted: text-zinc-500
Border: border-zinc-200 dark:border-zinc-800
Action: indigo-600/indigo-700 (dark: indigo-400/indigo-300)
Classification colors:
  public: emerald-500
  internal: blue-500
  confidential: amber-500
  secret: red-500
```

---

### Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│ Header: "기밀문서" + [목록으로] (detail view only)          │
├────────┬───────────────────────────────────────────────────┤
│ Left   │ Right Panel                                       │
│ Panel  │                                                   │
│ w-56   │ List View OR Detail View                         │
│        │                                                   │
│ Stats  │ ┌──────────────────────────────────────────────┐ │
│ Card   │ │ Filter bar: search, classification, dates,   │ │
│        │ │ sort                                          │ │
│ Folder │ ├──────────────────────────────────────────────┤ │
│ Tree   │ │ Filter chips (active filters)                │ │
│        │ ├──────────────────────────────────────────────┤ │
│        │ │ Document table (sortable columns)            │ │
│        │ │ Title | Class | Dept | Agent | Quality | ... │ │
│        │ │ ────────────────────────────────────────────  │ │
│        │ │ row 1                                        │ │
│        │ │ row 2                                        │ │
│        │ ├──────────────────────────────────────────────┤ │
│        │ │ Pagination                                   │ │
│        │ └──────────────────────────────────────────────┘ │
├────────┴───────────────────────────────────────────────────┤
│                                                            │
│ Detail View (replaces list):                               │
│ ┌────────────────────────────────────────────┬───────────┐ │
│ │ Document content + metadata                │ Similar   │ │
│ │ Title, classification, summary, tags       │ Documents │ │
│ │ Meta cards (quality, cost, type)           │ sidebar   │ │
│ │ Quality review details                     │ w-56      │ │
│ │ Delegation chain                           │           │ │
│ │ Markdown content                           │           │ │
│ │ Original command                           │           │ │
│ └────────────────────────────────────────────┴───────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Page Container**: `h-full flex flex-col` (inherits app theme: light/dark)

---

### Component Specifications

#### 1. Page Header

```
Container: px-4 md:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between
Left (flex items-center gap-3):
  MobileToggle (md:hidden): px-2 py-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800
    Content: "폴더 숨기기" / "폴더 보기" (toggles folder tree)
  Title: text-lg font-semibold, "기밀문서"
BackButton (detail view only): px-3 py-1.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300
  Content: "목록으로"
```

#### 2. Left Panel — Stats + Folder Tree

```
Container: w-56 lg:w-64 border-r border-slate-700 bg-slate-900/80 overflow-y-auto flex-shrink-0
Hidden on mobile by default, toggled via button
```

**Stats Card**:
```
Container: px-3 py-3 border-b border-slate-700

TotalCount: flex items-center justify-between
  Label: text-xs text-slate-400, "전체 문서"
  Value: text-sm font-semibold text-slate-50

RecentCount: text-[10px] text-slate-500 mt-0.5, "최근 7일: {N}건"

Classification Distribution Bar:
  Container: flex w-full h-2 rounded-full overflow-hidden mt-2 bg-slate-700
  Segments (width = percentage):
    Public: bg-emerald-500
    Internal: bg-blue-500
    Confidential: bg-amber-500
    Secret: bg-red-500

Legend (mt-1.5, grid grid-cols-2 gap-1):
  Each: flex items-center gap-1 text-[10px] text-slate-500
    Dot: w-1.5 h-1.5 rounded-full bg-{color}
    Label: "{classification} {count}"
```

**Folder Tree**:
```
Header: px-3 py-2 flex items-center justify-between border-b border-slate-700
  Label: text-xs font-medium text-slate-400, "폴더"
  AddBtn: text-slate-500 hover:text-slate-300 text-xs, "+"

AllButton:
  Container: px-3 py-2 text-xs cursor-pointer transition-colors
  Selected: bg-blue-500/10 text-blue-400 border-l-2 border-blue-500
  Unselected: text-slate-400 hover:text-slate-300 hover:bg-slate-800/50

FolderNode (recursive):
  Container: flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer transition-colors group
  Selected: bg-blue-500/10 text-blue-400
  Unselected: text-slate-400 hover:bg-slate-800/50

  Left (flex items-center gap-1.5):
    Icon: text-slate-500, "📁"
    Name: truncate max-w-[120px]
      Editing: bg-slate-800 border border-slate-600 text-xs px-1.5 py-0.5 rounded w-full outline-none

  Right (opacity-0 group-hover:opacity-100 flex items-center gap-0.5):
    DocCount: text-[10px] text-slate-600, "{N}"
    MenuBtn: text-slate-600 hover:text-slate-400, "⋮"
    Menu (absolute, bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-10):
      Item: text-xs px-3 py-1.5 hover:bg-slate-700/50 text-slate-300, "이름 변경" / "삭제"

  Children: ml-4 (nested, recursive)

CreateInput (when adding folder):
  Container: px-3 py-1.5
  Input: bg-slate-800 border border-slate-600 focus:border-blue-500 text-xs px-2 py-1 rounded w-full outline-none text-slate-50
  Placeholder: "새 폴더"
  Submit: Enter key, Cancel: Escape
```

#### 3. Right Panel — List View

**Filter Bar**:
```
Container: px-4 py-3 border-b border-slate-700 flex flex-wrap items-center gap-2

SearchInput:
  bg-slate-800 border border-slate-700 focus:border-blue-500 text-xs text-slate-50 rounded-lg px-3 py-1.5 w-40 md:w-48 outline-none
  Placeholder: "검색..."
  Icon: left side magnifying glass text-slate-500

ClassificationSelect:
  bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
  Options: "전체 등급", "공개", "내부", "기밀", "극비"

DateRange (flex items-center gap-1):
  Each: bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
  type="date"

SortSelect:
  bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2 py-1.5
  Options: "날짜순", "등급순", "품질순"
```

**Filter Chips** (shown when filters active):
```
Container: px-4 py-2 flex flex-wrap items-center gap-1.5

Chip: flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] px-2.5 py-1 rounded-full
  Label: filter name + value
  RemoveBtn: hover:text-blue-200 ml-0.5, "×"

ClearAll: text-[11px] text-slate-500 hover:text-slate-300 ml-2, "전체 초기화"
```

**Document Table**:
```
Container: overflow-x-auto
Table: w-full text-sm min-w-[700px]

Thead:
  Row: border-b border-slate-700
  Th: text-[11px] font-medium text-slate-500 uppercase tracking-wider px-3 py-2.5 text-left cursor-pointer hover:text-slate-300
    Sortable: show ↑/↓ indicator when active

Tbody:
  Row: border-b border-slate-700/50 hover:bg-slate-800/50 cursor-pointer transition-colors
  Td: px-3 py-2.5 text-xs text-slate-300

Columns:
  Title: text-xs font-medium text-slate-200 truncate max-w-[200px]
  Classification: ClassificationBadge component
  Department: text-xs text-slate-400
  Agent: text-xs text-slate-400
  Quality: QualityBar component
  Tags: TagList component
  Date: text-[10px] text-slate-500 font-mono whitespace-nowrap
```

**ClassificationBadge**:
```
Container: text-[10px] font-medium px-2 py-0.5 rounded-full
  public: bg-emerald-500/15 text-emerald-400, "공개"
  internal: bg-blue-500/15 text-blue-400, "내부"
  confidential: bg-amber-500/15 text-amber-400, "기밀"
  secret: bg-red-500/15 text-red-400, "극비"
```

**QualityBar**:
```
Container: flex items-center gap-1.5
Bar: w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden
  Fill: h-full rounded-full, width = score * 20%
    >=4: bg-emerald-500
    >=3: bg-amber-500
    <3: bg-red-500
Score: text-[10px] font-mono text-slate-400, "{score}/5"
```

**TagList**:
```
Container: flex items-center gap-1
Tag: text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded
Max display: 2 tags
Overflow: text-[10px] text-slate-500, "+{N}"
```

**Pagination**:
```
Container: px-4 py-3 border-t border-slate-700 flex items-center justify-center gap-3
PrevBtn: text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 px-2 py-1, "← 이전"
PageInfo: text-xs text-slate-500, "{page} / {totalPages}"
NextBtn: text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 px-2 py-1, "다음 →"
```

#### 4. Right Panel — Detail View

**Main Content Area**: `flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4`

**Document Header**:
```
Container: flex items-center justify-between

Left:
  Title (read mode): text-sm font-semibold text-slate-50
  Title (edit mode): bg-slate-800 border border-slate-600 focus:border-blue-500 text-sm text-slate-50 rounded-lg px-3 py-1.5 w-full

Meta (flex items-center gap-2 mt-1):
  ClassificationBadge
  Date: text-[10px] text-slate-500 font-mono
  Agent: text-[10px] text-slate-400
  Department: text-[10px] text-slate-400

Right (flex items-center gap-1):
  EditBtn: text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-700/50, "편집"
  DeleteBtn: text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded, "삭제"
  (In edit mode):
  CancelBtn: text-xs text-slate-400 px-2 py-1 rounded, "취소"
  SaveBtn: bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg, "저장"
```

**Summary Section**:
```
Read: bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-xs text-slate-300
Edit: bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg p-3 text-xs text-slate-50 resize-none w-full
```

**Tags Section**:
```
Read: flex flex-wrap gap-1
  Tag: bg-slate-700/50 text-slate-300 text-[10px] px-2 py-0.5 rounded-full
Edit: text input, comma-separated, same styling as form inputs
```

**Meta Cards** (3-column grid):
```
Container: grid grid-cols-3 gap-3
Card: bg-slate-800/50 border border-slate-700 rounded-lg p-3
  Label: text-[10px] text-slate-500 font-medium uppercase tracking-wider
  Value: text-sm font-semibold text-slate-50 mt-1
Cards:
  - "품질 점수": QualityBar (large version)
  - "비용": sum of costRecords formatted as USD
  - "명령 유형": commandType
```

**Quality Review** (if present):
```
Container: bg-slate-800/50 border border-slate-700 rounded-lg p-3
Header (flex items-center justify-between):
  Title: text-xs font-medium text-slate-300, "품질 리뷰"
  Badge:
    pass: bg-emerald-500/15 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full, "PASS"
    fail: bg-red-500/15 text-red-400 text-[10px] px-2 py-0.5 rounded-full, "FAIL"
Score: text-xs text-slate-400 mt-1
Feedback: text-xs text-slate-300 mt-2
```

**Delegation Chain**:
```
Container: bg-slate-800/50 border border-slate-700 rounded-lg p-3
Title: text-xs font-medium text-slate-300 mb-2, "위임 체인"
Chain (flex items-center flex-wrap gap-1):
  Agent: text-[10px] bg-slate-700/50 px-2 py-1 rounded text-slate-300
    Status indicator dot beside name
  Arrow: text-slate-600, "→"
```

**Content Section**:
```
Container: bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-h-[500px] overflow-y-auto
Content: text-xs text-slate-300 leading-relaxed
  Markdown rendered: prose prose-sm prose-invert
  Code blocks: bg-slate-900 rounded p-2 font-mono text-[11px]
```

**Original Command**:
```
Container: bg-slate-800/50 border border-slate-700 rounded-lg p-3
Label: text-[10px] text-slate-500 font-medium mb-1, "원본 명령"
Text: text-xs text-slate-300 font-mono
```

#### 5. Similar Documents Sidebar (Detail View)

```
Container: w-56 lg:w-64 border-l border-slate-700 bg-slate-900/80 overflow-y-auto flex-shrink-0

Header: px-3 py-3 border-b border-slate-700
  Title: text-xs font-medium text-slate-400, "유사 문서"

DocCard (each):
  Container: px-3 py-2.5 border-b border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors
  Title: text-xs font-medium text-slate-200 truncate
  Meta (flex items-center gap-2 mt-1):
    ClassificationBadge (small)
    Similarity: text-[10px] font-mono text-cyan-400, "{score}%"
  Date: text-[10px] text-slate-500 mt-0.5

Empty: text-xs text-slate-500 text-center py-6, "유사한 문서가 없습니다"
```

---

### State Management

**React Query Keys**:
- `['archive', page, search, classification, startDate, endDate, sortBy, folderId]` — Paginated list
- `['archive-stats']` — Statistics
- `['archive-folders']` — Folder tree
- `['archive-detail', detailId]` — Document detail

**Local State**:
- `detailId: string | null` — Selected document (null = list view)
- `showFolderTree: boolean` — Mobile folder toggle
- `page, searchInput, classificationFilter, startDate, endDate, sortBy, selectedFolderId` — Filters
- `isEditing: boolean` — Edit mode in detail view

---

### What NOT to Include

- No document creation from scratch (documents come from completed commands)
- No file upload functionality (that's Files page)
- No agent management (that's Admin)
- No command execution (that's Command Center)
- No batch operations or export (future feature)
