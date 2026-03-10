# 34. Template Market (템플릿 마켓) — Admin App — Claude Design Spec

> **Route**: `/template-market`
> **File**: `packages/admin/src/pages/template-market.tsx` (367 lines)
> **App**: Admin App

---

## Code Analysis Summary

### Current Implementation
- **Data**: React Query `template-market` with search query + tag filter params
- **Actions**: Clone template to own organization
- **Modal**: MarketPreviewModal (template details + clone button)
- **Search**: Text search (`q` param) + tag filter dropdown
- **States**: No company, Loading, Error, Empty (no results / no templates), Grid

### Data Types
- `MarketTemplate`: id, name, description, templateData, isBuiltin, downloadCount, tags, publishedAt
- Same agent/department sub-types as org-templates

### Differences from Org Templates (page 33)
- **Read-only marketplace** — no create/publish/apply actions
- **Clone** instead of Apply — copies template to your templates
- Shows **download count** prominently
- Has **search + tag filter** UI
- Tags shown on cards and in preview modal
- Uses `workspace` API endpoint (not admin)

---

## Design Spec

### Page Container
```
div.space-y-6
```

### Page Header
```
div
  h1.text-xl.font-semibold.tracking-tight.text-slate-50 → "템플릿 마켓"
  p.text-sm.text-slate-400.mt-1 → "다른 회사가 공유한 조직 구조 템플릿을 찾아보고, 마음에 드는 것을 복제하여 사용할 수 있습니다."
```

### No Company / Loading / Error States
Same pattern as other admin pages.

---

### Search + Filter Bar
```
div.flex.flex-col.sm:flex-row.gap-3
```

**Search Input**:
```
input[type=text].flex-1.px-3.py-2.text-sm.rounded-lg
  .bg-slate-800.border.border-slate-600
  .text-slate-50.placeholder-slate-500
  .focus:border-blue-500.focus:ring-2.focus:ring-blue-500/40.focus:outline-none
```
- Placeholder: "템플릿 이름 검색..."

**Tag Filter** (conditional, only shown when tags exist):
```
select.px-3.py-2.text-sm.rounded-lg
  .bg-slate-800.border.border-slate-600
  .text-slate-50
  .focus:border-blue-500.focus:ring-2.focus:ring-blue-500/40.focus:outline-none
```
- Default option: "모든 태그"
- Dynamic options from collected unique tags across all templates

---

### Empty State
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  CardContent
    div.text-center.py-12
      p.text-sm.text-slate-500
        → With search/tag: "검색 결과가 없습니다."
        → No search: "공개된 템플릿이 아직 없습니다."
```

---

### Market Card Grid
```
div.grid.grid-cols-1.md:grid-cols-2.lg:grid-cols-3.gap-4
```

#### Market Card
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
  div.flex.items-center.gap-2.flex-shrink-0
    (isBuiltin) span.text-[10px].px-1.5.py-0.5.rounded.bg-blue-900.text-blue-400 → "기본"
    span.text-[10px].text-slate-500 → "N DL"

Row 2 (description, conditional): p.text-sm.text-slate-400.mb-3.line-clamp-2

Row 3 (tags, conditional): div.flex.flex-wrap.gap-1.mb-3
  span.text-[10px].px-1.5.py-0.5.rounded-full.bg-blue-900/30.text-blue-400 (×4 max)
  (more than 4) span.text-[10px].px-1.5.py-0.5.text-slate-500 → "+N"

Row 4 (stats): div.flex.items-center.gap-4.text-xs.text-slate-500
  span → "N개 부서"
  span → "M명 에이전트"

Row 5 (department pills): div.mt-3.flex.flex-wrap.gap-1.5
  span.text-[10px].px-2.py-0.5.rounded-full.bg-slate-700.text-slate-400 (×5 max)
  (more than 5) span.text-[10px].px-2.py-0.5.text-slate-500 → "+N"
```

---

### Market Preview Modal

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
    p.text-sm.text-slate-400.mt-0.5 → "N개 부서 · M명 에이전트 · K회 다운로드"
  button.text-slate-500.hover:text-slate-300 → close X SVG
```

**Tags** (conditional, between header and content):
```
div.px-6.pt-3.flex.flex-wrap.gap-1.5
  span.text-[10px].px-2.py-0.5.rounded-full.bg-blue-900/30.text-blue-400 (×N)
```

**Content** (`div.overflow-y-auto.flex-1.px-6.py-4.space-y-4`):

Same department/agent structure as org-templates preview modal (see `33-org-templates.md`).

**Footer**:
```
div.flex.justify-end.gap-3.px-6.py-4.border-t.border-slate-700
  button.px-4.py-2.text-sm.text-slate-400.hover:text-slate-200 → "닫기"
  button.px-4.py-2.bg-blue-600.hover:bg-blue-500.disabled:opacity-50
    .text-white.text-sm.font-medium.rounded-lg.transition-colors
    → "내 조직에 복제" | "복제 중..."
```

**Clone Success**: Toast "템플릿이 복제되었습니다. 조직 템플릿 페이지에서 확인하세요."

---

## Responsive Behavior
- Search bar: stacked on mobile (`flex-col`), row on desktop (`sm:flex-row`)
- Grid: 1 col mobile, 2 cols tablet, 3 cols desktop
- Modal: `mx-4` padding on mobile, centered
- Tags: wrap naturally, show max 4 on card with "+N" overflow

## Accessibility
- Modal: `role="dialog"` `aria-modal="true"`
- Escape key closes modal
- Click outside closes modal
- Market cards are `<button>` elements (keyboard accessible)
- Search input is a standard text input with placeholder
- Focus ring on all interactive elements

## Differences from Org Templates Page
| Feature | Org Templates (33) | Template Market (34) |
|---------|-------------------|---------------------|
| Action | Apply directly | Clone to my templates |
| Create | Yes (save current org) | No |
| Publish | Yes (to/from market) | No |
| Search | No | Yes (text + tag) |
| Tags display | No | Yes (on cards + modal) |
| Download count | No | Yes |
| API endpoint | /admin/org-templates | /workspace/template-market |
