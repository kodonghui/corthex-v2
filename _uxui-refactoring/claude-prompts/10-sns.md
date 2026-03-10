# 10. SNS 퍼블리싱 — Design Spec for Claude Coding

> Route: `/sns` — CEO App
> Files: `packages/app/src/pages/sns.tsx`, `packages/app/src/components/sns/*`

---

## Page Overview

AI 에이전트가 생성하거나 사용자가 직접 작성한 SNS 콘텐츠를 관리하는 페이지. 콘텐츠 초안 작성부터 승인, 예약 발행, 실제 발행까지의 전체 워크플로우를 5개 탭(콘텐츠, 발행 큐, 카드뉴스, 통계, 계정 관리)으로 처리한다. 6개 플랫폼(인스타그램, 티스토리, 다음 카페, 트위터/X, 페이스북, 네이버 블로그) 지원, A/B 테스트 변형 생성과 카드뉴스 시리즈도 관리.

---

## Design System Tokens

```
Surface: bg-slate-900 (primary), bg-slate-800 (elevated), bg-slate-800/50 (card)
Text: text-slate-50 (primary), text-slate-400 (secondary), text-slate-300 (body)
Border: border-slate-700
Accent: blue-500 (action), cyan-400 (accent), red-500 (destructive), emerald-500 (success)
Card: bg-slate-800/50 border border-slate-700 rounded-xl
Button: bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium
Input: bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl
```

---

## Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER: h-14, px-6, border-b border-slate-700                  │
│ ┌──────────────────────────────────┬───────────────────────────┐│
│ │ "SNS 통신국" text-xl font-semibold│              (no actions)││
│ └──────────────────────────────────┴───────────────────────────┘│
│ TAB BAR: px-6, border-b border-slate-700/50, pt-2              │
│ ┌─────┬─────┬──────┬──────┬──────┐                             │
│ │콘텐츠│발행큐│카드뉴스│ 통계 │계정  │                             │
│ └─────┴─────┴──────┴──────┴──────┘                             │
│                                                                 │
│ CONTENT AREA: flex-1 overflow-y-auto px-6 py-4                 │
│ (Tab content renders here)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### Tab Bar Spec
- Container: `flex gap-1 px-6 border-b border-slate-700/50`
- Active tab: `border-b-2 border-blue-500 text-blue-400 font-medium text-sm px-4 py-2.5`
- Inactive tab: `border-b-2 border-transparent text-slate-400 hover:text-slate-200 text-sm px-4 py-2.5`

---

## Tab 1: 콘텐츠 (Content)

### List View (default)

**Toolbar Row:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [계정: ▼ 전체] [☐ 원본만] [목록|갤러리]          [+ 새 콘텐츠] │
└─────────────────────────────────────────────────────────────────┘
```
- Account filter: `<select>` with `bg-slate-800 border border-slate-600 rounded-lg text-sm px-3 py-1.5`
- Originals checkbox: `text-sm text-slate-400 gap-1.5`
- View toggle: `flex border border-slate-600 rounded-lg overflow-hidden`
  - Active: `bg-blue-600/20 text-blue-400 px-3 py-1.5 text-xs`
  - Inactive: `text-slate-400 px-3 py-1.5 text-xs hover:bg-slate-700`
- New button: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium`

**Content Card (List Mode):**
```
┌─────────────────────────────────────────────────────────────────┐
│ bg-slate-800/50 border border-slate-700 rounded-xl p-4         │
│ hover:border-slate-600 cursor-pointer transition-all            │
│                                                                 │
│ ┌──────────────────────────────────────────┬────────────────┐  │
│ │ 인스타그램 · @company_official [변형]     │  [승인 대기]   │  │
│ │ text-xs text-slate-400  cyan-400  purple  │  badge         │  │
│ └──────────────────────────────────────────┴────────────────┘  │
│ 콘텐츠 제목 — text-sm font-medium text-slate-100               │
│ 김비서 · 2026.03.09 — text-xs text-slate-500                   │
└─────────────────────────────────────────────────────────────────┘
```

**Status Badge Colors:**
| Status | Background | Text |
|--------|-----------|------|
| draft (초안) | bg-slate-700 | text-slate-300 |
| pending (승인 대기) | bg-amber-500/20 | text-amber-400 |
| approved (승인됨) | bg-emerald-500/20 | text-emerald-400 |
| scheduled (예약됨) | bg-blue-500/20 | text-blue-400 |
| rejected (반려됨) | bg-red-500/20 | text-red-400 |
| published (발행 완료) | bg-cyan-500/20 | text-cyan-400 |
| failed (발행 실패) | bg-red-500/20 | text-red-400 |
| publishing (발행 중) | bg-purple-500/20 | text-purple-400 |

**Variant badge:** `bg-purple-500/20 text-purple-400 text-xs px-1.5 py-0.5 rounded`
**Card news badge:** `bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded`

**Content Card (Gallery Mode):**
```
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4

Each card:
┌──────────────────────────┐
│ bg-slate-800/50 border   │
│ border-slate-700         │
│ rounded-xl overflow-hidden│
│ hover:ring-2 ring-blue-500│
│                          │
│ ┌──────────────────────┐ │
│ │ <img> h-40           │ │
│ │ object-cover         │ │
│ │                      │ │
│ │ [status badge] top-2 │ │
│ │ right-2 absolute     │ │
│ └──────────────────────┘ │
│ Hover overlay:           │
│ bg-gradient-to-t         │
│ from-black/70            │
│ Title + Platform         │
└──────────────────────────┘
```

**Empty State:**
```
text-center py-16
icon: text-4xl mb-3 (📝)
"아직 SNS 콘텐츠가 없습니다" text-sm text-slate-400
"새 콘텐츠를 만들어보세요!" text-xs text-slate-500
```

### Create View

**Back button:** `text-sm text-slate-400 hover:text-slate-200 mb-4` "← 목록으로"

**Mode Toggle:**
```
flex gap-2 mb-4
Active: bg-blue-600/20 text-blue-400 px-3 py-1.5 text-sm rounded-lg
Inactive: text-slate-400 hover:text-slate-300 px-3 py-1.5 text-sm rounded-lg
```
Modes: "직접 작성" | "AI 생성"

**Manual Form (max-w-2xl space-y-4):**
1. Platform select: `bg-slate-800 border border-slate-600 rounded-lg` with PLATFORM_OPTIONS
2. Title input: `bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm w-full` placeholder="제목"
3. Body textarea: `bg-slate-800 border border-slate-600 focus:border-blue-500 rounded-lg px-3 py-2.5 text-sm w-full` rows=6, placeholder="본문 내용"
4. Hashtags input: placeholder="해시태그 (#태그1 #태그2)"
5. Scheduled date: `<input type="datetime-local">` with label "예약 발행 (선택)" `text-xs text-slate-400`
6. Account select: if accounts exist, `<select>` filtered by platform
7. Submit: `bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50`

**AI Form:**
1. Platform select
2. Agent select: placeholder="에이전트 선택"
3. Topic input: placeholder="주제 (예: AI 자동화 마케팅 트렌드)"
4. Image prompt input: label "이미지 설명 (선택)"
5. Submit: "AI로 콘텐츠 생성" — loading state "AI 생성 중..."

### Detail View

**Status Stepper (top of detail):**
```
┌─────────────────────────────────────────────────────────────────┐
│ w-full py-3                                                     │
│ ┌─────┐───────┌─────┐───────┌──────┐───────┌──────┐───────┌───┐│
│ │  ✓  │━━━━━━━│  2  │───────│  3   │───────│  4   │───────│ 5 ││
│ │초안 │       │승인  │       │승인됨 │       │예약됨 │       │발행││
│ │     │       │대기  │       │      │       │      │       │완료││
│ └─────┘       └─────┘       └──────┘       └──────┘       └───┘│
│                                                                 │
│ Done circle: bg-emerald-500 text-white w-7 h-7 rounded-full    │
│ Active circle: border-blue-500 bg-blue-500/20 text-blue-400    │
│ Future circle: border-slate-600 text-slate-500                  │
│ Failed circle: border-red-500 bg-red-500/20 text-red-400 "!"   │
│ Done connector: bg-emerald-500 h-0.5                            │
│ Future connector: bg-slate-700 h-0.5                            │
│ Step label: text-[10px] mt-1                                    │
│ Timestamp: text-[9px] text-slate-500 mt-0.5                    │
└─────────────────────────────────────────────────────────────────┘
```

**Content Section:**
```
max-w-2xl space-y-4

Platform + Status row:
  text-xs text-slate-400 + status badge

Title: text-lg font-semibold text-slate-50

Body: bg-slate-800/70 rounded-xl p-4 text-sm text-slate-300 whitespace-pre-wrap

Image: rounded-xl overflow-hidden border border-slate-700, max-h-96 object-cover

Hashtags: text-sm text-cyan-400

Reject reason: bg-red-500/10 border border-red-500/30 rounded-xl p-3
  text-sm text-red-400

Published URL: text-sm text-blue-400 hover:underline

Creator info: text-xs text-slate-500
```

**Action Buttons Row:**
```
flex gap-2 pt-2 flex-wrap

승인 요청 (draft/rejected): bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-sm
승인 (pending, admin): bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 text-sm
반려 (pending, admin): bg-red-600 hover:bg-red-500 text-white rounded-lg px-4 py-2 text-sm
  + input for reason: bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-sm
발행하기 (approved): bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm
예약 취소 (scheduled): border border-blue-500/50 text-blue-400 rounded-lg px-4 py-2 text-sm
이미지 생성 (draft/rejected): border border-purple-500/50 text-purple-400 rounded-lg px-4 py-2 text-sm
삭제 (draft): border border-red-500/50 text-red-400 rounded-lg px-4 py-2 text-sm
```

**A/B Test Section:**
```
border-t border-slate-700 pt-4 mt-4 space-y-3

Header row:
  "A/B 테스트" text-sm font-semibold text-slate-200
  Buttons: [변형 복제] [AI 변형 생성] [성과 입력] [결과 비교]

변형 복제: border border-purple-500/50 text-purple-400 rounded-lg px-3 py-1.5 text-xs
AI 변형 생성: bg-purple-600 hover:bg-purple-500 text-white rounded-lg px-3 py-1.5 text-xs
성과 입력: border border-slate-600 text-slate-400 rounded-lg px-3 py-1.5 text-xs
결과 비교: border border-emerald-500/50 text-emerald-400 rounded-lg px-3 py-1.5 text-xs

Metrics form (when open):
  bg-slate-800/70 rounded-xl p-4
  grid grid-cols-4 gap-3
  Each: label text-xs text-slate-400 + input type=number

Variant list:
  "변형 N개" text-xs text-slate-500
  Each variant card: bg-slate-800/50 border border-slate-700 rounded-lg p-3
    hover:border-slate-600 cursor-pointer
    [변형] badge + title + status badge

AB results panel:
  bg-slate-800/70 rounded-xl p-4
  Winner row: bg-emerald-500/10 border border-emerald-500/30 rounded-lg
  "WINNER" text-xs text-emerald-400 font-bold
  Metrics: text-xs text-slate-400 gap-3
  Score: font-bold text-blue-400
```

**AI Variant Modal:**
```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md p-6

변형 수 slider: range min=2 max=5
Strategy select: options [어조 변경, 길이 변경, 해시태그 최적화, 제목 변경, 전체 변경]
Agent select
Buttons: 취소 (text-slate-400) + "N개 변형 생성" (bg-purple-600)
```

---

## Tab 2: 발행 큐 (Queue)

**Stats Cards Row:**
```
grid grid-cols-2 sm:grid-cols-4 gap-4

Each card: bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center
  Value: text-2xl font-bold
  Label: text-xs text-slate-400 mt-1

총 예약: text-blue-400
오늘 발행: text-emerald-400
실패: text-red-400 (if > 0, else text-slate-400)
다음 발행: text-cyan-400
```

**Filter Chips Row:**
```
flex gap-2 flex-wrap

Each chip: px-3 py-1.5 text-xs rounded-full border transition-colors
Active: bg-blue-600/20 text-blue-400 border-blue-500/50
Inactive: border-slate-600 text-slate-400 hover:border-slate-500

Options: 전체, 예약됨, 발행 중, 발행 완료, 발행 실패
```

**Batch Actions (when items selected):**
```
flex gap-2 items-center
"N개 선택" text-xs text-slate-400
datetime-local input + "일괄 예약" bg-blue-600 text-xs rounded-lg
"일괄 취소" border border-red-500/50 text-red-400 text-xs rounded-lg
```

**Queue Item Card:**
```
bg-slate-800/50 border border-slate-700 rounded-xl p-4
flex items-center gap-3
hover:border-slate-600

[checkbox] + content area + scheduled time

Checkbox: rounded border-slate-600 accent-blue-500
Platform label: text-xs text-slate-400
Status badge: as defined
Priority badge: bg-amber-500/20 text-amber-400 text-xs
Card news badge: bg-orange-500/20 text-orange-400 text-xs
Title: text-sm font-medium text-slate-100 truncate
Scheduled time: text-xs text-cyan-400
Creator: text-[10px] text-slate-500
```

---

## Tab 3: 카드뉴스 (Card News)

**Series Grid (list view):**
```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4

Each card:
bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden
hover:ring-2 ring-orange-500 transition-all cursor-pointer

Cover image: h-36 object-cover (or placeholder bg-slate-800)
Info section: p-3
  Platform + status + card count
  Title: text-sm font-medium truncate
  Date: text-xs text-slate-500
```

**Card Carousel (detail view):**
```
Carousel container: rounded-xl overflow-hidden border border-slate-700 bg-slate-800
Image: h-72 object-contain
Caption overlay: bg-gradient-to-t from-black/60 p-3
Nav arrows: w-8 h-8 bg-black/40 text-white rounded-full hover:bg-black/60
Slide indicators: flex gap-1.5 justify-center
  Active: bg-orange-500 w-4 h-2 rounded-full
  Inactive: bg-slate-600 w-2 h-2 rounded-full
```

**Card List (editable):**
```
Each card row:
bg-slate-800/50 border border-slate-700 rounded-lg p-3
flex items-center gap-3 cursor-pointer
Active (currentSlide): border-orange-500 bg-orange-500/10

Thumbnail: w-12 h-12 object-cover rounded
Layout badge:
  cover: bg-purple-500/20 text-purple-400
  content: bg-slate-700 text-slate-400
  closing: bg-emerald-500/20 text-emerald-400
Index: text-xs text-slate-500 #N
Caption: text-sm truncate

Edit/Move buttons (draft only):
  수정/↑/↓: border border-slate-600 text-slate-400 text-xs px-1.5 py-0.5 rounded
```

---

## Tab 4: 통계 (Stats)

**Period Selector:**
```
flex gap-2
Active: bg-blue-600/20 text-blue-400 px-3 py-1.5 text-sm rounded-lg
Inactive: text-slate-400 hover:text-slate-300 px-3 py-1.5 text-sm rounded-lg
Options: 7일, 30일, 90일
```

**Summary Cards:**
```
grid grid-cols-2 sm:grid-cols-4 gap-4
bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center
Value: text-2xl font-bold text-slate-50
Label: text-xs text-slate-400 mt-1
```

**Status Distribution:**
```
h3: text-sm font-semibold text-slate-400 mb-3 "상태별 분포"
Each row: flex items-center gap-3
  Status badge: w-20 text-center
  Bar: bg-slate-700 rounded-full h-4, inner bg-blue-500 h-4 rounded-full
  Count: text-sm font-medium text-slate-300 w-8 text-right
```

**Platform Distribution:**
```
grid grid-cols-3 gap-4
bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center
Platform: text-xs text-slate-400
Count: text-xl font-bold text-slate-50 mt-1
Published: text-xs text-emerald-400
```

**Daily Trend Chart:**
```
Each row: flex items-center gap-2
  Date: text-xs text-slate-500 w-24
  Bar: bg-slate-700 rounded h-3, inner bg-blue-500 h-3 rounded
  Count: text-xs font-medium text-slate-300 w-6 text-right
```

---

## Tab 5: 계정 관리 (Accounts)

**Account Card:**
```
bg-slate-800/50 border border-slate-700 rounded-xl p-4
flex justify-between items-center

Left:
  Platform label: text-xs text-slate-400
  Active badge: bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.5 rounded
  Inactive: bg-slate-700 text-slate-400
  Account name: text-sm font-medium text-slate-100 mt-1
  Account ID: text-xs text-slate-500

Right:
  수정: border border-slate-600 text-slate-400 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-700
  삭제: border border-red-500/50 text-red-400 text-xs px-3 py-1.5 rounded-lg
```

**Account Modal:**
```
Modal: bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md p-6

Fields:
  Platform select (new only)
  Account name input
  Account ID input
  Credentials input (type=password, monospace)

Buttons: 취소 + 저장 (bg-blue-600)
```

---

## Backend API Routes

```
GET    /workspace/sns                    → 콘텐츠 목록 (?variantOf=root)
GET    /workspace/sns/:id                → 콘텐츠 상세
POST   /workspace/sns                    → 수동 콘텐츠 생성
POST   /workspace/sns/generate-with-image → AI 콘텐츠+이미지 생성
POST   /workspace/sns/:id/submit         → 승인 요청
POST   /workspace/sns/:id/approve        → 승인
POST   /workspace/sns/:id/reject         → 반려
POST   /workspace/sns/:id/engine-publish  → 발행
POST   /workspace/sns/:id/cancel-schedule → 예약 취소
DELETE /workspace/sns/:id                → 삭제
POST   /workspace/sns/:id/generate-image  → 이미지 생성
POST   /workspace/sns/:id/create-variant  → 변형 복제
POST   /workspace/sns/:id/generate-variants → AI 변형 생성
PUT    /workspace/sns/:id/metrics        → 성과 입력
GET    /workspace/sns/:id/ab-results     → A/B 결과
GET    /workspace/sns/queue              → 발행 큐 (?status=)
GET    /workspace/sns/queue/stats        → 큐 통계
POST   /workspace/sns/batch-schedule     → 일괄 예약
POST   /workspace/sns/batch-cancel       → 일괄 취소
GET    /workspace/sns/stats              → 통계 (?days=)
GET    /workspace/sns-accounts           → 계정 목록
POST   /workspace/sns-accounts           → 계정 등록
PUT    /workspace/sns-accounts/:id       → 계정 수정
DELETE /workspace/sns-accounts/:id       → 계정 삭제
POST   /workspace/sns/card-series        → 카드뉴스 시리즈 생성
POST   /workspace/sns/card-series/generate → AI 카드뉴스 생성
GET    /workspace/sns/card-series/:id    → 시리즈 상세
PUT    /workspace/sns/card-series/:id/cards/:index → 카드 수정
POST   /workspace/sns/card-series/:id/reorder → 카드 순서 변경
POST   /workspace/sns/card-series/:id/submit  → 시리즈 승인 요청
POST   /workspace/sns/card-series/:id/approve → 시리즈 승인
POST   /workspace/sns/card-series/:id/reject  → 시리즈 반려
DELETE /workspace/sns/card-series/:id    → 시리즈 삭제
```

---

## Current Code Issues to Fix

1. **Light mode classes mixed in** — uses `dark:border-zinc-800`, `bg-white`, `text-zinc-700` etc. Must convert to dark-first design tokens
2. **No consistent card component** — each tab has slightly different card styling
3. **StatusStepper uses old colors** — needs `emerald/blue/red` instead of `green/indigo/red`
4. **No loading skeletons** — stats tab shows text "로딩 중..." instead of skeleton
5. **Gallery view incomplete** — only shows items with images, should handle no-image gracefully
6. **Modals inconsistent** — variant modal and account modal have different styling
7. **Select/Input components** — should use consistent design tokens from shared UI

## Component Structure (keep)

```
pages/sns.tsx              → Main page with tab router
components/sns/
  content-tab.tsx          → List/Create/Detail views for content
  queue-tab.tsx            → Publishing queue with batch actions
  card-news-tab.tsx        → Card news series list/create
  card-news-detail.tsx     → Series detail with carousel
  stats-tab.tsx            → Statistics dashboard
  accounts-tab.tsx         → SNS account CRUD
  status-stepper.tsx       → Workflow progress indicator
  sns-types.ts             → Shared types and constants
```
