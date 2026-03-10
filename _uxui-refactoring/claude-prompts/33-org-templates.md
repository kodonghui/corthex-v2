# 33. Org Templates (조직 템플릿) — Admin App — Claude Design Spec

> **Route**: `/org-templates`
> **File**: `packages/admin/src/pages/org-templates.tsx` (595 lines)
> **App**: Admin App

---

## Code Analysis Summary

### Current Implementation
- **Data**: React Query `org-templates` keyed by selectedCompanyId
- **Actions**: Apply template, Create template (save current org), Publish/Unpublish to market
- **Modals**: PreviewModal (template details + apply), ApplyResultModal (summary of what was created/skipped), CreateTemplateModal, PublishConfirmModal
- **States**: No company, Loading, Error, Empty, Grid of template cards
- **Mutations**: apply, create, publish, unpublish

### Data Types
- `OrgTemplate`: id, companyId, name, description, templateData (departments+agents), isBuiltin, isActive, isPublished, publishedAt, downloadCount, tags, createdAt
- `ApplyResult`: templateId/Name, departmentsCreated/Skipped, agentsCreated/Skipped, details[]
- `TemplateDepartment`: name, description, agents[]
- `TemplateAgent`: name, nameEn, role, tier, modelName, soul, allowedTools

### Current Design Issues
- Light-mode defaults (zinc/white bg)
- Modal overlays use basic pattern — needs dark theme adaptation
- Grid layout 1/2/3 columns works well
- No loading indicators on cards themselves
- Publish section at bottom is functional but visually disconnected

---

## Design Spec

### Page Container
```
div.space-y-6
```

### Page Header
```
div.flex.items-start.justify-between
  div
    h1.text-xl.font-semibold.tracking-tight.text-slate-50 → "조직 템플릿"
    p.text-sm.text-slate-400.mt-1 → "템플릿을 선택하면 부서와 에이전트가 자동으로 생성됩니다. 기존 조직과 중복되는 항목은 건너뜁니다."
  button.px-4.py-2.bg-blue-600.hover:bg-blue-500.text-white.text-sm.font-medium.rounded-lg.transition-colors.flex-shrink-0
    → "현재 조직을 템플릿으로 저장"
```

### No Company / Loading / Error States
Same pattern as org-chart (see `32-org-chart.md`):
- No company: "사이드바에서 회사를 선택해주세요."
- Loading: "로딩 중..." centered
- Error: "템플릿을 불러올 수 없습니다." + retry button

### Empty State
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  CardContent
    div.text-center.py-12
      p.text-sm.text-slate-500 → "등록된 템플릿이 없습니다."
```

---

### Template Grid
```
div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4
```

#### Template Card
```
button.text-left.rounded-xl.p-5.transition-all.cursor-pointer.group
  .bg-slate-800/50.border.border-slate-700
  .hover:border-blue-600.hover:shadow-lg.hover:shadow-blue-900/10
  .focus:outline-none.focus:ring-2.focus:ring-blue-500/40
```

**Layout**:
```
Row 1 (header): div.flex.items-start.justify-between.mb-3
  h3.text-base.font-semibold.text-slate-50
    .group-hover:text-blue-400.transition-colors
    → template name
  div.flex.items-center.gap-1.5.flex-shrink-0
    (isBuiltin) span.text-[10px].px-1.5.py-0.5.rounded.bg-blue-900.text-blue-400 → "기본"
    (isPublished) span.text-[10px].px-1.5.py-0.5.rounded.bg-emerald-900.text-emerald-400 → "공개"

Row 2 (description, conditional): p.text-sm.text-slate-400.mb-4.line-clamp-2

Row 3 (stats): div.flex.items-center.gap-4.text-xs.text-slate-500
  span → "N개 부서"
  span → "M명 에이전트"

Row 4 (department pills): div.mt-3.flex.flex-wrap.gap-1.5
  span.text-[10px].px-2.py-0.5.rounded-full.bg-slate-700.text-slate-400 (×N)
```

---

### Preview Modal

**Backdrop**: `div.fixed.inset-0.z-50.flex.items-center.justify-center.bg-black/60`

**Dialog**:
```
div[role=dialog][aria-modal=true]
  .bg-slate-900.rounded-xl.border.border-slate-700.shadow-xl
  .w-full.max-w-2xl.mx-4.max-h-[80vh].overflow-hidden.flex.flex-col
```

**Header**:
```
div.flex.items-center.justify-between.px-6.py-4.border-b.border-slate-700
  div
    h2.text-lg.font-semibold.text-slate-50 → template name
    p.text-sm.text-slate-400.mt-0.5 → "N개 부서 · M명 에이전트"
  button.text-slate-500.hover:text-slate-300 → close X SVG (w-5 h-5)
```

**Content** (`div.overflow-y-auto.flex-1.px-6.py-4.space-y-4`):

Description: `p.text-sm.text-slate-400`

Per department:
```
div.border.border-slate-700.rounded-lg.overflow-hidden
  Department header:
    div.flex.items-center.gap-2.px-4.py-2.5.bg-slate-800
      span.text-sm.font-medium.text-slate-50 → dept name
      span.text-xs.text-slate-500.truncate → "— {description}"
      span.text-xs.px-1.5.py-0.5.rounded-full.bg-slate-700.text-slate-400.ml-auto → "N명"
  Agent rows: divide-y divide-slate-700
    div.flex.items-center.gap-3.px-4.py-2
      span.text-sm.text-slate-50 → agent name
      span.text-[10px].px-1.5.py-0.5.rounded → tier badge (same colors as org-chart)
      span.text-xs.text-slate-500.ml-auto → modelName
```

**Footer**:
```
div.flex.justify-end.gap-3.px-6.py-4.border-t.border-slate-700
  button.px-4.py-2.text-sm.text-slate-400.hover:text-slate-200 → "닫기"
  button.px-4.py-2.bg-blue-600.hover:bg-blue-500.disabled:opacity-50
    .text-white.text-sm.font-medium.rounded-lg.transition-colors
    → "이 템플릿 적용" | "적용 중..."
```

---

### Apply Result Modal

**Dialog**: `bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-lg mx-4`

**Header**:
```
px-6 py-4 border-b border-slate-700
  h2.text-lg.font-semibold.text-slate-50 → "적용 완료"
  p.text-sm.text-slate-400.mt-0.5 → template name
```

**Summary Grid** (2 columns):
```
div.grid.grid-cols-2.gap-3
  div.bg-emerald-900/20.rounded-lg.px-4.py-3.text-center
    p.text-2xl.font-bold.text-emerald-300 → departmentsCreated
    p.text-xs.text-emerald-400 → "부서 생성"
  div.bg-blue-900/20.rounded-lg.px-4.py-3.text-center
    p.text-2xl.font-bold.text-blue-300 → agentsCreated
    p.text-xs.text-blue-400 → "에이전트 생성"
```

**Skipped Info** (conditional):
```
div.bg-slate-800.rounded-lg.px-4.py-3
  p.text-xs.text-slate-500 → "이미 존재하는 항목: 부서 N개, 에이전트 M명 (건너뜀)"
```

**Detail per department**:
```
div.space-y-2
  div.text-sm
    div.flex.items-center.gap-2
      action badge:
        created → span.text-xs.px-1.5.py-0.5.rounded.bg-emerald-900/30.text-emerald-300 → "생성"
        skipped → span.text-xs.px-1.5.py-0.5.rounded.bg-slate-800.text-slate-500 → "기존"
      span.text-sm.font-medium.text-slate-50 → department name
    agentsCreated: p.text-xs.text-slate-500.ml-12.mt-0.5 → "+ agent1, agent2, ..."
```

**Footer**: `button.bg-blue-600.hover:bg-blue-500.text-white.rounded-lg` → "확인"

---

### Market Publish Management Section

Only shown when there are company-owned non-builtin templates.

```
div.border.border-slate-700.rounded-lg.p-4
  h3.text-sm.font-medium.text-slate-50.mb-3 → "마켓 공개 관리"
  div.space-y-2
```

Per template row:
```
div.flex.items-center.justify-between.py-2.px-3.bg-slate-800.rounded-lg
  Left: div.flex.items-center.gap-2
    span.text-sm.text-slate-50 → template name
    Published: span.text-[10px].px-1.5.py-0.5.rounded.bg-emerald-900.text-emerald-300 → "공개"
    Not published: span.text-[10px].px-1.5.py-0.5.rounded.bg-slate-700.text-slate-500 → "비공개"
    Download count (if > 0): span.text-[10px].text-slate-500 → "N회 다운로드"
  Right:
    Published → button.px-3.py-1.text-xs.text-red-400.border.border-red-800.rounded-lg.hover:bg-red-900/20 → "마켓에서 회수"
    Not published → button.px-3.py-1.text-xs.text-blue-400.border.border-blue-800.rounded-lg.hover:bg-blue-900/20 → "마켓에 공개"
```

### Publish Confirm Modal
```
Dialog: bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-sm mx-4
  Header: "마켓에 공개"
  Body: p.text-sm.text-slate-400 → warning text about public visibility
  Footer: "취소" + "공개" (bg-blue-600)
```

### Create Template Modal
```
Dialog: bg-slate-900 rounded-xl border border-slate-700 shadow-xl w-full max-w-md mx-4
  Header:
    h2 → "현재 조직을 템플릿으로 저장"
    p.text-sm.text-slate-400 → "현재 부서와 에이전트 구조가 템플릿으로 저장됩니다."
  Body:
    템플릿 이름: input (required)
    설명: textarea (optional, rows=3, resize-none)
  Footer: "취소" + "저장" (disabled when empty name)
```

**Input classes** (all modals): `bg-slate-800 border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none rounded-lg px-3 py-2 text-sm text-slate-50`

---

## Responsive Behavior
- Grid: 1 col mobile, 2 cols tablet, 3 cols desktop
- Modals: `mx-4` on mobile, centered
- Publish section: full width, wraps on small screens

## Accessibility
- All modals: `role="dialog"` `aria-modal="true"`
- Escape key closes modals (keydown listener)
- Click outside backdrop closes modals
- `e.stopPropagation()` on dialog content
- Template cards are `<button>` elements
- Focus ring on interactive elements

## State Management
- `previewTemplate`: currently selected for preview modal
- `applyResult`: result data after successful apply
- `showCreateModal`: create template form
- `publishConfirmId`: template ID pending publish confirmation
