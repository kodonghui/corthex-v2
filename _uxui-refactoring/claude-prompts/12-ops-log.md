# 12. 작전일지 (Operation Log) — Design Spec for Claude Coding

> Route: `/ops-log` — CEO App
> File: `packages/app/src/pages/ops-log.tsx` (single file, ~820 lines)

---

## Page Overview

CEO가 내린 모든 명령(Command)의 실행 기록을 검색, 필터링, 정렬하여 조회하는 페이지. 각 명령이 어떤 에이전트에게 전달되었고, 결과/품질 점수/소요 시간을 한눈에 파악. 북마크, CSV 내보내기, 2건 비교(A/B), 리플레이 기능 포함.

---

## Design System Tokens

```
Surface: bg-slate-900 (primary), bg-slate-800 (elevated)
Text: text-slate-50 (primary), text-slate-400 (secondary), text-slate-300 (body)
Border: border-slate-700
Accent: blue-500 (action), cyan-400 (accent), red-500 (destructive), emerald-500 (success)
Card: bg-slate-800/50 border border-slate-700 rounded-xl
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
```

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: px-6 py-4 border-b border-slate-700                    │
│ "작전일지" text-xl font-semibold                                │
│ Right: [비교] (when 2 selected) + [내보내기]                    │
├─────────────────────────────────────────────────────────────────┤
│ FILTERS: px-6 py-3 border-b border-slate-700/50                │
│ [🔍 검색] [시작일] ~ [종료일] [유형▼] [상태▼] [정렬▼] [★북마크]│
├─────────────────────────────────────────────────────────────────┤
│ FILTER CHIPS (if any active):                                   │
│ px-6 py-2 border-b border-slate-700/30                          │
│ [검색: keyword ×] [유형: 직접 ×] ... [전체 초기화]              │
├─────────────────────────────────────────────────────────────────┤
│ SELECTION BAR (if items selected):                              │
│ bg-blue-600/10 px-6 py-2                                       │
│ "N개 선택됨 (비교하려면 2개를 선택하세요)" + [선택 해제]         │
├─────────────────────────────────────────────────────────────────┤
│ TABLE: flex-1 overflow-auto px-6 py-3                           │
│ ┌──┬────┬─────────┬────┬────┬──────┬─────┬──────┬──┬──┐       │
│ │☐│시간│명령      │유형│상태│에이전트│품질 │소요시간│★│⋮│       │
│ ├──┼────┼─────────┼────┼────┼──────┼─────┼──────┼──┼──┤       │
│ │☐│3/9 │마케팅... │직접│완료│김비서 │████ │3.2s  │★│⋮│       │
│ │☐│3/9 │투자전략..│멘션│진행│투자CIO│██   │-     │☆│⋮│       │
│ └──┴────┴─────────┴────┴────┴──────┴─────┴──────┴──┴──┘       │
├─────────────────────────────────────────────────────────────────┤
│ PAGINATION: px-6 py-3 border-t border-slate-700                │
│ "1,234건"                           [이전] 1/62 [다음]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Header

```
px-6 py-4 border-b border-slate-700 flex items-center justify-between

Left: "작전일지" text-xl font-semibold text-slate-50

Right: flex items-center gap-2
  Compare button (2 selected only):
    bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
    "비교"
  Export button:
    border border-slate-600 text-slate-300 hover:bg-slate-800 rounded-lg px-4 py-2 text-sm
    "내보내기"
```

---

## Filters Row

```
px-6 py-3 border-b border-slate-700/50 flex flex-wrap gap-2 items-center

Search input:
  bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg
  px-3 py-1.5 text-sm w-48
  placeholder="검색..."

Date inputs (start ~ end):
  bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm
  type="date"
  Separator: text-sm text-slate-500 "~"

Type select:
  bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm
  Options: 전체 유형, 직접, 멘션, 슬래시, 프리셋, 배치, 전체, 순차, 심화

Status select:
  Same style
  Options: 전체 상태, 완료, 진행중, 대기, 실패, 취소

Sort select:
  Same style
  Options: 날짜순, 품질순, 비용순, 소요시간순

Bookmark toggle:
  Active: bg-amber-500/20 border-amber-500/50 text-amber-400 rounded-lg px-3 py-1.5 text-sm
  Inactive: border border-slate-600 text-slate-400 hover:bg-slate-800 rounded-lg px-3 py-1.5 text-sm
  "★ 북마크"
```

---

## Filter Chips

```
px-6 py-2 border-b border-slate-700/30 flex flex-wrap gap-1.5
(Only shown when filters are active)

Each chip:
  inline-flex items-center gap-1 px-2.5 py-1 text-[11px]
  bg-blue-500/10 text-blue-400 rounded-full
  Remove button: text-blue-300 hover:text-blue-200 ml-0.5 "×"

Reset all:
  text-[11px] text-slate-500 hover:text-slate-300 px-2 py-1
  "전체 초기화"
```

---

## Selection Bar

```
px-6 py-2 bg-blue-600/10 border-b border-blue-500/20 flex items-center justify-between
(Only shown when selectedIds.size > 0)

Left: text-xs text-blue-400
  "N개 선택됨" + "(비교하려면 2개를 선택하세요)" if < 2
Right: text-xs text-blue-400 hover:text-blue-300 "선택 해제"
```

---

## Data Table

```
w-full text-sm min-w-[800px]

Table header:
  text-xs text-slate-500 border-b border-slate-700 font-medium
  Each th: text-left py-2 pr-3

Table row:
  border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer
  transition-colors

Columns:
  1. Checkbox (w-8): rounded border-slate-600 accent-blue-500
  2. Time: text-xs text-slate-500 whitespace-nowrap
  3. Command: text-xs text-slate-300 truncate max-w-[200px]
  4. Type badge: bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded
  5. Status badge: (see below)
  6. Agent: text-xs text-slate-400
  7. Quality bar: (see below)
  8. Duration: text-xs text-right text-slate-500
  9. Bookmark: text-sm, ★ (amber-400) or ☆ (slate-500), hover:scale-110
  10. Menu: "⋮" text-slate-500 hover:text-slate-300
```

**Status Badges:**
| Status | Style |
|--------|-------|
| completed (완료) | bg-emerald-500/20 text-emerald-400 |
| processing (진행중) | bg-blue-500/20 text-blue-400 |
| pending (대기) | bg-amber-500/20 text-amber-400 |
| failed (실패) | bg-red-500/20 text-red-400 |
| cancelled (취소) | bg-slate-700 text-slate-400 |

**Quality Bar:**
```
flex items-center gap-1.5 min-w-[80px]

Bar container: flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden
Bar fill: h-full rounded-full
  score >= 4: bg-emerald-500
  score >= 3: bg-amber-500
  score < 3: bg-red-500
  width: (score * 20)%

Score text: text-[10px] text-slate-500 w-6 text-right
```

**Row Menu (dropdown):**
```
absolute right-0 top-full z-20
bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 min-w-[100px]

Each option:
  w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700
  "리플레이" | "복사"

Backdrop: fixed inset-0 z-10 (closes menu)
```

---

## Pagination

```
px-6 py-3 border-t border-slate-700 flex items-center justify-between

Left: text-xs text-slate-500 "1,234건"

Right: flex items-center gap-2
  Prev button:
    border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300
    disabled:opacity-30
    hover:bg-slate-800
    "이전"
  Page info:
    text-xs text-slate-400 "1 / 62"
  Next button:
    Same as Prev
    "다음"
```

---

## Detail Modal

```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
max-w-2xl max-h-[85vh] overflow-y-auto p-6

Header:
  flex items-start justify-between mb-4
  Left:
    "작전 상세" text-sm font-semibold text-slate-100
    Timestamp: text-[11px] text-slate-500
  Right:
    [복사] border border-slate-600 text-slate-400 rounded-lg px-3 py-1.5 text-xs
    [리플레이] bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs

Command text section:
  bg-slate-900/70 rounded-xl p-4 mb-4
  Label: text-xs font-medium text-slate-500 mb-1 "명령"
  Text: text-sm text-slate-200

Metadata grid:
  grid grid-cols-4 gap-3 mb-4
  Each MetaCard:
    bg-slate-900/70 rounded-lg p-3
    Label: text-[10px] text-slate-500 mb-0.5
    Value: text-xs font-medium text-slate-300

Quality section (if score exists):
  border border-slate-700 rounded-xl p-4 mb-4
  Label: text-xs font-medium text-slate-500 mb-2 "품질 평가"
  QualityBar + PASS/FAIL badge
    PASS: bg-emerald-500/20 text-emerald-400
    FAIL: bg-red-500/20 text-red-400

Result section (if result exists):
  Label: text-xs font-medium text-slate-500 mb-2 "결과"
  Container: border border-slate-700 rounded-xl p-4 max-h-[300px] overflow-y-auto
  MarkdownRenderer content

Bookmark note (if bookmarked with note):
  bg-amber-500/10 border border-amber-500/30 rounded-xl p-4
  Label: text-xs font-medium text-amber-400 mb-1 "★ 북마크 메모"
  Note: text-xs text-amber-300
```

---

## Compare Modal

```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
max-w-4xl max-h-[90vh] overflow-y-auto p-6

Title: "A/B 비교" text-sm font-semibold text-slate-100 mb-4

Comparison metrics:
  grid grid-cols-3 gap-4 mb-4
  Each CompareBar:
    border border-slate-700 rounded-xl p-4
    Label: text-[10px] text-slate-500 mb-2 text-center
    Values: flex items-center justify-center gap-3
      A value: text-xs font-bold text-blue-400
      "vs": text-[10px] text-slate-500
      B value: text-xs font-bold text-emerald-400

Side-by-side results:
  grid grid-cols-2 gap-4
  Each panel:
    border border-slate-700 rounded-xl overflow-hidden

    Header: bg-slate-900/70 px-3 py-2 border-b border-slate-700
      Badge A: bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded
      Badge B: bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded
      Time: text-[11px] text-slate-500
      Command: text-xs text-slate-300 truncate

    Content: p-3 max-h-[400px] overflow-y-auto
      MarkdownRenderer or "결과 없음" text-xs text-slate-500
```

---

## Replay Confirm Dialog

```
ConfirmDialog:
  title: "명령 리플레이"
  description: "동일 명령을 다시 실행합니다. 결과가 다를 수 있습니다."
  confirmText: "실행" (bg-blue-600)
  cancelText: "취소"
```

---

## Empty State

```
text-center py-16
Icon: text-4xl mb-3 (📋)
Title: "보고된 작전이 없습니다" text-sm text-slate-400
Description: "사령관실에서 명령을 내리면 작전일지가 기록됩니다." text-xs text-slate-500
Action button: bg-blue-600 text-white rounded-lg px-4 py-2 text-sm "사령관실로 이동"
```

---

## Backend API Routes

```
GET    /workspace/operation-log          → 목록 (page, limit, search, startDate, endDate, type, status, sortBy, bookmarkedOnly)
GET    /workspace/operation-log/:id      → 상세
GET    /workspace/operation-log/export   → CSV 내보내기
POST   /workspace/operation-log/bookmarks → 북마크 추가
DELETE /workspace/operation-log/bookmarks/:id → 북마크 삭제
```

---

## Current Code Issues to Fix

1. **Single monolith file** (820 lines) — should extract sub-components: FilterBar, DataTable, DetailModal, CompareModal, RowMenu, QualityBar
2. **Light mode remnants** — `bg-white`, `dark:bg-zinc-800`, `text-zinc-700` etc.
3. **No skeleton loading** — SkeletonTable used but needs design token alignment
4. **Dropdown menu z-index** — RowMenu uses relative positioning that can clip
5. **Checkbox styling** — needs dark theme accent color
6. **Date inputs** — native date pickers look out of place in dark theme

## Component Structure (target)

```
pages/ops-log.tsx                → Main page with filters + table
components/ops-log/
  filter-bar.tsx                 → Search, date, type, status, sort, bookmark
  filter-chips.tsx               → Active filter display
  ops-table.tsx                  → Data table with selection
  quality-bar.tsx                → Score visualization
  row-menu.tsx                   → Per-row actions dropdown
  detail-modal.tsx               → Full detail view
  compare-modal.tsx              → Side-by-side A/B comparison
```
