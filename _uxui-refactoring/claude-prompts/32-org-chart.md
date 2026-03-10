# 32. Org Chart (조직도) — Admin App — Claude Design Spec

> **Route**: `/org-chart`
> **File**: `packages/admin/src/pages/org-chart.tsx` (409 lines)
> **App**: Admin App

---

## Code Analysis Summary

### Current Implementation
- **Data**: React Query `org-chart` keyed by `selectedCompanyId`
- **Structure**: Company root → Departments (collapsible) → Agent nodes
- **Detail Panel**: Slide-in from right for agent inspection + department move
- **States**: Loading skeleton, Error with retry, Empty with template CTA, Normal tree view
- **Interactions**: Click agent → detail panel, Click department → expand/collapse, Escape → close panel
- **Mutations**: Agent department move via `PATCH /admin/agents/:id`

### Current Design Issues
- Uses zinc/gray colors inconsistently
- Agent nodes are `<button>` (good) but use light-mode defaults
- Detail panel uses fixed positioning correctly
- Missing keyboard trap in detail panel (focus management)
- Unassigned agents section uses amber — keep this semantic color

---

## Design Spec

### Page Container
```
div.space-y-6
```

### Page Title
```
h1.text-xl.font-semibold.tracking-tight.text-slate-50
```
Text: "조직도"

### No Company Selected State
```
Card (bg-slate-800/50 border border-slate-700 rounded-xl)
  CardContent
    p.text-sm.text-slate-500.text-center.py-8 → "사이드바에서 회사를 선택해주세요."
```

### Loading State (Skeleton)
```
div.space-y-6
  Skeleton.h-8.w-32 (bg-slate-800 animate-pulse rounded)
  Card
    CardContent
      Skeleton.h-12.w-full.mb-4  ← company root placeholder
      ×2 department groups:
        div.ml-10.mb-4
          Skeleton.h-10.w-full.mb-2  ← department header
          div.ml-10.space-y-1.5.border-l-2.border-slate-700.pl-4
            Skeleton.h-9.w-full (×3)  ← agent placeholders
```

### Error State
```
Card
  CardContent
    div.text-center.py-8.space-y-3
      p.text-sm.text-red-500 → "조직도를 불러올 수 없습니다."
      button.px-4.py-2.text-sm.rounded-lg.bg-blue-600.text-white.hover:bg-blue-500 → "다시 시도"
```

---

### Company Root Node
```
div.flex.items-center.gap-3.px-4.py-3.rounded-lg.bg-slate-50.dark:bg-slate-100.mb-4
```
Wait — this is a dark-first app. The company root should invert for contrast:
```
div.flex.items-center.gap-3.px-4.py-3.rounded-lg.bg-slate-100.text-slate-900.mb-4
```

**Elements**:
- Company initial: `span.w-8.h-8.rounded-lg.bg-blue-600.text-white.flex.items-center.justify-center.text-sm.font-bold.flex-shrink-0`
- Company name: `span.text-sm.font-semibold`
- Stats: `span.text-xs.opacity-60.ml-auto` → "N개 부서 · M명 에이전트"

### Empty State (no departments, no agents)
```
div.text-center.py-12.space-y-3
  p.text-sm.text-slate-500 → "아직 조직이 구성되지 않았습니다."
  button.px-4.py-2.text-sm.rounded-lg.bg-blue-600.text-white.hover:bg-blue-500 → "템플릿으로 시작하세요"
```
Navigates to `/org-templates`

---

### Department Section (Collapsible)

**Container**: `div.ml-6.md:ml-10`

**Department Header** (clickable):
```
button.flex.items-center.gap-2.px-4.py-2.5.rounded-lg.w-full.text-left.transition-colors
  .bg-blue-950/30.border.border-blue-800.hover:bg-blue-900/40
```

**Elements**:
- Expand indicator: `span.text-xs.text-blue-400` → "▼" (expanded) | "▶" (collapsed)
- Department name: `span.text-sm.font-medium.text-blue-300`
- Description: `span.text-xs.text-blue-500.truncate.hidden.sm:inline` → "— {description}"
- Agent count badge: `span.text-xs.px-1.5.py-0.5.rounded-full.bg-blue-800.text-blue-400.ml-auto.flex-shrink-0`

**Expanded Agent List**:
```
div.ml-6.md:ml-10.mt-2.space-y-1.5.border-l-2.border-blue-800.pl-4
```

**Empty Department**:
```
div.ml-6.md:ml-10.mt-2.border-l-2.border-blue-800.pl-4
  p.text-xs.text-slate-500.py-2 → "에이전트 없음"
```

---

### Agent Node

```
button.flex.items-center.gap-2.px-3.py-2.rounded-lg.w-full.text-left.transition-colors
  .bg-slate-800.border.border-slate-700
  .hover:border-blue-600
  .focus:outline-none.focus:ring-2.focus:ring-blue-500/40
```

**Elements** (left to right):
1. **Status dot**: `span.w-2.h-2.rounded-full.flex-shrink-0`
   - online: `bg-emerald-500`
   - working: `bg-blue-500 animate-pulse`
   - error: `bg-red-500`
   - offline: `bg-slate-500`

2. **Agent name**: `span.text-sm.text-slate-50.truncate`

3. **Tier badge**: `span.text-[10px].px-1.5.py-0.5.rounded.flex-shrink-0`
   - Manager: `bg-blue-900 text-blue-300`
   - Specialist: `bg-cyan-900 text-cyan-300`
   - Worker: `bg-slate-700 text-slate-400`

4. **System badge** (conditional): `span.text-[10px].px-1.py-0.5.rounded.bg-amber-900.text-amber-300.flex-shrink-0` → "🔒 시스템"

---

### Unassigned Agents Section

**Header**:
```
div.ml-6.md:ml-10.mt-3
  div.flex.items-center.gap-2.px-4.py-2.5.rounded-lg.bg-amber-950/30.border.border-amber-800
    span.text-sm.font-medium.text-amber-300 → "미배속"
    span.text-xs.text-amber-500 → "부서를 지정하세요"
    span.text-xs.px-1.5.py-0.5.rounded-full.bg-amber-800.text-amber-400.ml-auto → count
```

**Agent List**:
```
div.ml-6.md:ml-10.mt-2.space-y-1.5.border-l-2.border-amber-800.pl-4
  AgentNode (×N)
```

---

### Agent Detail Panel (Slide-in)

**Backdrop**: `div.fixed.inset-0.z-40.bg-black/40` (click to close)

**Panel**:
```
div.fixed.right-0.top-0.z-50.h-full.w-80
  .bg-slate-900.border-l.border-slate-700.shadow-xl
  .animate-slide-left.overflow-y-auto
```

**Content** (`div.p-5.space-y-5`):

1. **Header**:
   ```
   div.flex.items-center.justify-between
     h2.text-lg.font-semibold.text-slate-50 → agent name
     button.text-slate-500.hover:text-slate-300.text-xl.leading-none → "×"
   ```

2. **Status + Tier Row**:
   ```
   div.flex.items-center.gap-2
     Tier badge (same as in tree)
     Status: span.flex.items-center.gap-1.5.text-xs.text-slate-400
       Status dot + label (온라인/작업 중/오류/오프라인)
   ```

3. **Model**:
   ```
   p.text-xs.text-slate-500.mb-1 → "모델"
   p.text-sm.text-slate-300.font-mono → modelName
   ```

4. **Role** (conditional):
   ```
   p.text-xs.text-slate-500.mb-1 → "역할"
   p.text-sm.text-slate-300 → role text
   ```

5. **Department Move**:
   ```
   p.text-xs.text-slate-500.mb-1 → "부서 이동"
   div.flex.gap-2
     select.flex-1.px-2.py-1.5.text-sm
       .border.border-slate-600.rounded-lg.bg-slate-800.text-slate-50
       .focus:ring-2.focus:ring-blue-500.focus:outline-none
       option → "미배속"
       option (×N departments) → dept name
     button.px-3.py-1.5.text-xs.bg-blue-600.hover:bg-blue-500
       .disabled:opacity-40.disabled:cursor-not-allowed
       .text-white.font-medium.rounded-lg.transition-colors
       → "이동" | "..."
   ```
   - Button disabled when: department unchanged OR isPending

6. **System Badge** (conditional):
   ```
   div.flex.items-center.gap-1.5.px-2.py-1.5.rounded
     .bg-amber-950.border.border-amber-800
     span.text-xs → "🔒"
     span.text-xs.text-amber-300 → "시스템 필수 에이전트"
   ```

7. **Soul Summary** (conditional, truncated to 200 chars):
   ```
   p.text-xs.text-slate-500.mb-1 → "Soul"
   p.text-xs.text-slate-400.whitespace-pre-wrap.bg-slate-800.rounded.p-2
   ```

8. **Allowed Tools** (conditional):
   ```
   p.text-xs.text-slate-500.mb-1 → "허용 도구 (N)"
   div.flex.flex-wrap.gap-1
     span.text-[10px].px-1.5.py-0.5.rounded.bg-slate-800.text-slate-400 (×N)
   ```

**Keyboard**: Escape key closes the panel (global keydown listener)

---

## Responsive Behavior
- Mobile: `ml-6` indentation, department descriptions hidden
- Desktop: `ml-10` indentation, descriptions shown inline
- Detail panel: always w-80, overlays on mobile
- Tree lines: `border-l-2` for visual hierarchy

## Accessibility
- All tree nodes are `<button>` elements
- Detail panel backdrop is clickable to close
- Escape key closes detail panel
- Focus management: should trap focus in panel (enhancement needed)
- Status dots have text labels in detail panel

## Animation
- `animate-slide-left`: panel slides in from right
- `animate-pulse`: working status dot
- `transition-colors`: hover states on all interactive elements
- Skeleton pulse for loading
