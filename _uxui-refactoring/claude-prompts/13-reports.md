# 13. 보고서 — Design Spec for Claude Coding

> Route: `/reports`, `/reports/:id` — CEO App
> File: `packages/app/src/pages/reports.tsx` (single file, ~625 lines)

---

## Page Overview

인간 직원(Employee)이 CEO에게 보고서를 작성하여 제출하고, CEO가 검토하며 코멘트를 주고받는 페이지. 보고서 워크플로우: 초안(draft) → 제출(submitted) → 검토완료(reviewed). 양방향 코멘트로 피드백 교환, 마크다운 렌더링, 다운로드, 메신저 공유 지원.

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

## Page Layout — List View

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: px-6 py-4 border-b border-slate-700                    │
│ "보고서" text-xl font-semibold            [+ 새 보고서]         │
├─────────────────────────────────────────────────────────────────┤
│ TABS: px-6 pt-2                                                │
│ [전체 (12)] [내 보고서 (5)] [받은 보고서 (7)]                   │
├─────────────────────────────────────────────────────────────────┤
│ LIST: flex-1 overflow-y-auto px-6 py-4 max-w-2xl space-y-2    │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 마케팅 성과 보고서 Q1              [📤 CEO 보고 완료]       │ │
│ │ 본문 미리보기 2줄까지...                                    │ │
│ │ 김비서 · 2026.03.09                                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 기술부 주간 업무 리포트              [초안]                  │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Header

```
px-6 py-4 border-b border-slate-700 flex items-center justify-between

Left: flex items-center gap-3
  Back button (detail/create only):
    text-sm text-slate-400 hover:text-slate-200 "← 목록"
  Title: text-xl font-semibold text-slate-50
    list: "보고서"
    create: "새 보고서"
    detail: "보고서 상세"

Right (list only):
  bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
  "+ 새 보고서"
```

### Tab Bar

```
Shared Tabs component from @corthex/ui

Tab items:
  전체 (N) | 내 보고서 (N) | 받은 보고서 (N)

Active: border-b-2 border-blue-500 text-blue-400 font-medium text-sm
Inactive: border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-sm
```

### Report List Item

```
w-full text-left px-4 py-3 rounded-xl
bg-slate-800/50 border border-slate-700
hover:border-slate-600 cursor-pointer transition-all

Row 1: flex items-center gap-2 mb-1
  Title: font-medium text-sm text-slate-100 truncate
  Status badge:
    draft: bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded "초안"
    submitted: bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded "📤 CEO 보고 완료"
    reviewed: bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded "검토 완료"

Row 2 (if content): text-xs text-slate-500 line-clamp-2 mb-1

Row 3: text-[11px] text-slate-500
  authorName · date
```

### Empty State

```
text-center py-16
"아직 보고서가 없습니다" text-sm text-slate-400
(for 'mine' tab): "새 보고서를 작성해보세요" text-xs text-slate-500
(for 'received' tab): "받은 보고서가 없습니다" text-sm text-slate-400
```

---

## Page Layout — Create View

```
px-6 py-4 max-w-2xl space-y-4

Title input:
  w-full bg-slate-800 border border-slate-600 focus:border-blue-500
  rounded-lg px-4 py-2.5 text-sm
  placeholder="보고서 제목"
  focus:ring-2 focus:ring-blue-500/30

Content textarea:
  w-full bg-slate-800 border border-slate-600 focus:border-blue-500
  rounded-lg px-4 py-2.5 text-sm
  rows=16
  placeholder="보고서 내용을 마크다운으로 작성하세요..."

Buttons: flex gap-3
  초안 저장:
    bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium
    disabled:opacity-50
  취소:
    text-slate-400 hover:text-slate-200 text-sm px-5 py-2.5
```

---

## Page Layout — Detail View

```
px-6 py-4 max-w-2xl space-y-6

┌─────────────────────────────────────────────────────────────────┐
│ STATUS + META                                                   │
│ [📤 CEO 보고 완료]  작성: 김비서 · 2026.03.09 · 제출: 2026.03.09│
│                                                                 │
│ (submitted/reviewed): "CEO에게 보고된 보고서입니다..."           │
│ text-xs text-slate-500                                         │
├─────────────────────────────────────────────────────────────────┤
│ TITLE                                                           │
│ text-xl font-bold text-slate-50                                │
├─────────────────────────────────────────────────────────────────┤
│ CONTENT                                                         │
│ bg-slate-800/50 rounded-xl p-5 min-h-[200px]                  │
│ MarkdownRenderer                                               │
├─────────────────────────────────────────────────────────────────┤
│ ACTION BUTTONS                                                  │
│ border-t border-slate-700 pt-4                                 │
│ [수정] [📤 CEO에게 보고] [삭제]  (draft, my report)             │
│ [검토 완료]  (submitted, received by me)                        │
│ [📥 다운로드] [💬 메신저로 공유]  (submitted/reviewed)           │
├─────────────────────────────────────────────────────────────────┤
│ COMMENTS SECTION (submitted/reviewed only)                      │
│ border-t border-slate-700 pt-4                                 │
│                                                                 │
│ "코멘트 (3)" text-sm font-medium text-slate-500                │
│                                                                 │
│ [이전 코멘트 N개 더 보기]                                       │
│                                                                 │
│ ┌──────────────────────────────────────┐                        │
│ │ 작성자 코멘트 (왼쪽 정렬)            │                        │
│ │ bg-slate-800/50 rounded-lg px-4 py-3 │                        │
│ │ 작성자 이름 · 시간                    │                        │
│ │ 내용                                  │                        │
│ └──────────────────────────────────────┘                        │
│                        ┌──────────────────────────────────────┐ │
│                        │ CEO 코멘트 (오른쪽 정렬)              │ │
│                        │ bg-blue-600/10 rounded-lg px-4 py-3   │ │
│                        │ CEO 이름 · 시간                       │ │
│                        │ 내용                                   │ │
│                        └──────────────────────────────────────┘ │
│                                                                 │
│ ┌───────────────────────────────────┬─────┐                    │
│ │ 코멘트 입력...                    │ 전송 │                    │
│ └───────────────────────────────────┴─────┘                    │
├─────────────────────────────────────────────────────────────────┤
│ AGENT LINK                                                      │
│ border-t border-slate-700 pt-4                                 │
│ "에이전트와 이어서 논의하기 →"                                  │
│ bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 w-full    │
└─────────────────────────────────────────────────────────────────┘
```

### Edit Mode (inline, replaces title + content)

```
Title input: same as create view
Content textarea: rows=14
Buttons: flex gap-3
  저장: bg-blue-600 text-white rounded-lg px-4 py-2 text-sm
  취소: text-slate-400 text-sm px-4 py-2
```

### Action Buttons

```
flex gap-3 border-t border-slate-700 pt-4
Mobile: sticky bottom-0 bg-slate-900 pb-4 sm:pb-0

수정 (draft, my report):
  border border-slate-600 text-slate-300 hover:bg-slate-800
  rounded-lg px-4 py-2 text-sm

📤 CEO에게 보고 (draft, my report):
  bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium

삭제 (draft, my report):
  text-red-400 hover:text-red-300 text-sm px-4 py-2

검토 완료 (submitted, received by me):
  bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm font-medium

📥 다운로드 (submitted/reviewed):
  border border-slate-600 text-slate-300 hover:bg-slate-800
  rounded-lg px-4 py-2 text-sm

💬 메신저로 공유 (submitted/reviewed):
  border border-slate-600 text-slate-300 hover:bg-slate-800
  rounded-lg px-4 py-2 text-sm
```

### Comments Section

```
border-t border-slate-700 pt-4 space-y-4

Header: text-sm font-medium text-slate-500 "코멘트 (N)"

Empty: text-xs text-slate-500 "아직 코멘트가 없습니다"

Load more button:
  text-xs text-blue-400 hover:underline
  "이전 코멘트 N개 더 보기"

Comment bubble:
  max-w-[85%] rounded-xl px-4 py-3

  Reporter's comment (left-aligned):
    mr-auto bg-slate-800/50

  CEO's comment (right-aligned):
    ml-auto bg-blue-600/10

  Author line: flex items-center gap-2 mb-1
    Name: text-xs font-medium text-slate-300
    Time: text-[10px] text-slate-500

  Content: text-sm whitespace-pre-wrap text-slate-300

Comment input row:
  flex gap-2
  Input:
    flex-1 bg-slate-800 border border-slate-600 focus:border-blue-500
    rounded-lg px-4 py-2 text-sm
    placeholder="코멘트 작성..."
    Enter to submit
  Send button:
    bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
    disabled:opacity-50
    "전송"
```

### Agent Discussion Link

```
border-t border-slate-700 pt-4

w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl
px-4 py-3 text-sm font-medium
flex items-center justify-center gap-2
transition-colors

"에이전트와 이어서 논의하기" + "→" text-xs text-slate-500
```

---

## Confirm Dialogs

**CEO 보고:**
```
title: "CEO에게 보고"
description: "이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다."
confirmText: "보고하기" (bg-blue-600)
```

**삭제:**
```
title: "보고서 삭제"
description: "이 보고서를 삭제하시겠습니까? 되돌릴 수 없습니다."
confirmText: "삭제" (bg-red-600)
variant: "danger"
```

---

## Share to Conversation Modal

```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md p-6

Title: "보고서 공유"
Conversation list to select
Send button: bg-blue-600

Uses ShareToConversationModal component
```

---

## Backend API Routes

```
GET    /workspace/reports                    → 보고서 목록
POST   /workspace/reports                    → 새 보고서 생성
GET    /workspace/reports/:id                → 보고서 상세
PUT    /workspace/reports/:id                → 보고서 수정
DELETE /workspace/reports/:id                → 보고서 삭제
POST   /workspace/reports/:id/submit         → CEO에게 제출
POST   /workspace/reports/:id/review         → 검토 완료
GET    /workspace/reports/:id/comments       → 코멘트 목록 (?limit=5&before=id)
POST   /workspace/reports/:id/comments       → 코멘트 작성
GET    /workspace/reports/:id/download       → 마크다운 다운로드
```

---

## Loading States

```
List loading: 3x Skeleton h-20 rounded-xl bg-slate-800 animate-pulse
Detail loading: Skeleton h-4 w-24 + h-6 w-3/4 + 10x h-4 w-full
```

---

## Current Code Issues to Fix

1. **Single monolith file** (625 lines) — three view states in one component
2. **Light mode classes** — `bg-white`, `dark:bg-zinc-900`, `text-zinc-700` etc.
3. **URL routing** — uses both `/reports` and `/reports/:id` with internal view state; should align
4. **Comment loading** — initial load + lazy load could be cleaner with useInfiniteQuery
5. **Mobile sticky buttons** — uses sm breakpoint for sticky positioning
6. **No real-time comments** — poll-based, not WebSocket

## Component Structure (target)

```
pages/reports.tsx                  → Main page with view routing
components/reports/
  report-list.tsx                  → List view with tabs
  report-create.tsx                → Create/edit form
  report-detail.tsx                → Detail view with actions
  comment-section.tsx              → Comments with chat-like bubbles
  share-to-conversation-modal.tsx  → Report sharing (exists)
```
