# Phase 3-2: Component Strategy — Round 1 Review
**Reviewer**: CRITIC-B (Amelia / Quinn / Bob)
**Date**: 2026-03-12
**File Reviewed**: `_corthex_full_redesign/phase-3-design-system/component-strategy.md`

---

## AMELIA (Frontend / TypeScript / Compile-time correctness)

### Issue A-1 [CRITICAL]: `TierBadgeProps` and `CostBadgeProps` don't extend `React.HTMLAttributes` — violates §3.1 mandatory rule

**§3.1 Prop Interface Rules mandates:**
```tsx
export interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,   // ← REQUIRED
    VariantProps<typeof componentVariants> {
```

**§2.1 TierBadge actual:**
```tsx
export interface TierBadgeProps extends VariantProps<typeof tierBadgeVariants> {
  className?: string
  showLabel?: boolean
}
// ← Missing HTMLAttributes extension entirely
```

**§2.1 CostBadge actual:**
```tsx
export interface CostBadgeProps {
  costUsd: number
  tokensUsed: number
  className?: string
}
// ← Missing HTMLAttributes + VariantProps (no CVA defined for CostBadge either)
```

Without `extends React.HTMLAttributes<HTMLSpanElement>` (or appropriate element):
- Consumers can't pass `onClick`, `data-*`, `id`, `aria-*`, or any standard HTML attribute
- The spread `{...props}` in the component body would have no type to spread
- Breaks the contract of every other `@corthex/ui` component

Both specs need fixing to match the mandatory CVA pattern in §1.2 and §3.1.

---

### Issue A-2 [HIGH]: NEXUS component count is wrong — two separate NEXUS systems conflated

**§2.3 states:**
> `NexusCanvas | packages/admin/src/components/nexus/ | ✅ Exists (13 components)`

**§7 states:**
> `All 13 NEXUS components | packages/app/src/components/nexus/ | DO NOT recreate`

**Reality (verified via filesystem):**
- `packages/app/src/components/nexus/` — **13 files** (SketchVibe/workflow: WorkflowEditor, DepartmentNode, AgentNode, CompanyNode, NexusInfoPanel, NodeDetailPanel, ExecutionHistoryPanel, editable-edge, context-menu, canvas-sidebar, sketchvibe-nodes, WorkflowListPanel, export-knowledge-dialog)
- `packages/admin/src/components/nexus/` — **11 files** (org chart editor: agent-node, company-node, unassigned-group-node, property-panel, panels/agent-panel, etc.)

The "13 components" in §2.3 incorrectly attributes the app NEXUS count to the admin NEXUS. More critically:
- **§7 (Protected) lists only app/nexus** — the admin NEXUS org chart editor (11 components) is NOT listed as protected, even though it also should not be recreated.
- Phase 4 developers following §7 will protect SketchVibe components but may unknowingly recreate the admin org chart components.

**Fix required:**
1. §2.3: `packages/admin/src/components/nexus/ (11 components)` — correct the count
2. §7: Add a second protected row: `Admin NEXUS org chart components (11) | packages/admin/src/components/nexus/ | DO NOT recreate — only update zinc tokens`

---

### Issue A-3 [MEDIUM]: TierBadge CVA numeric variant keys — non-standard, TypeScript strict-mode risk

**§2.1 TierBadge spec:**
```tsx
variants: {
  tier: {
    1: 'bg-indigo-950 border-indigo-800 text-indigo-300',
    2: 'bg-violet-950 border-violet-800 text-violet-300',
    3: 'bg-zinc-800 border-zinc-700 text-zinc-400',
  },
  defaultVariants: { tier: 3 },
}
```

CVA internally converts object keys to strings, but TypeScript's `VariantProps` infers `tier?: 1 | 2 | 3` as **numeric literals**. When agent tier data comes from an API (which likely returns `number`), passing `tier={agentData.tier}` where `agentData.tier: number` will fail strict TS — `number` is not assignable to `1 | 2 | 3`.

Also violates §3.2 which says "All variant values: kebab-case strings" — numeric keys break this convention.

**Fix**: Use string keys:
```tsx
tier: {
  'manager':    'bg-indigo-950 border-indigo-800 text-indigo-300',  // T1
  'specialist': 'bg-violet-950 border-violet-800 text-violet-300',  // T2
  'worker':     'bg-zinc-800 border-zinc-700 text-zinc-400',         // T3
},
defaultVariants: { tier: 'worker' },
```
Then define a `tierLevel` prop that maps `1→'manager'`, `2→'specialist'`, `3→'worker'` from API data.

---

## QUINN (Accessibility / WCAG 2.2 / Focus management)

### Issue Q-1 [CRITICAL]: Drawer always-mounted without `inert` — keyboard/screen reader can access off-screen panel

**§2.2 Drawer spec:**
```tsx
// Always mounted (never {open && <Drawer>}) — preserves close animation
// Panel: fixed right-0 top-0 h-full bg-zinc-900 border-l border-zinc-700
//        translate-x-full → translate-x-0 when open
```

When closed (`translate-x-full`), the drawer is off-screen but fully accessible to:
- **Tab key**: Keyboard users Tab through all focusable elements — links, buttons, inputs inside the drawer are reachable even when visually hidden off-screen. WCAG 2.4.3 Focus Order violation.
- **Screen readers**: The DOM content is present and will be read by VoiceOver/NVDA in document order. Users encounter a "hidden" panel that they can't see.

`translate-x-full` moves the element visually but does NOT remove it from the accessibility tree or tab order.

**Fix**: Add `inert={!open}` to the drawer panel element:
```tsx
<div
  className={cn(
    "fixed right-0 top-0 h-full bg-zinc-900 border-l border-zinc-700 z-50",
    "transition-[transform] duration-[250ms] ease-out motion-reduce:transition-none",
    open ? "translate-x-0" : "translate-x-full"
  )}
  inert={!open}          // ← prevents focus + SR access when closed
  aria-hidden={!open}    // ← explicit SR hide (belt-and-suspenders)
>
```
`inert` is supported in all modern browsers (Chrome 102+, Firefox 112+, Safari 15.5+). Without it, the always-mounted pattern is an accessibility regression vs `{open && <Drawer>}`.

---

### Issue Q-2 [HIGH]: DataTable missing ARIA sort/select specification

**§2.2 DataTable:**
> Standard CRUD table. Sort, select, pagination.

No ARIA specification provided. An interactive sortable/selectable table requires:

1. **Sort**: `aria-sort="none|ascending|descending"` on `<th>` buttons. Without this, screen reader users can't determine current sort state.
2. **Row selection**: `role="grid"` (or just `<table>` with `aria-multiselectable="true"`), `aria-selected="true|false"` on selectable `<tr>` elements, `aria-checked` on checkbox cells.
3. **Keyboard pattern**: Space to select row, click on column header to sort — these need keyboard equivalents (Enter/Space on `<button>` in `<th>`).
4. **Caption/label**: `<caption>` or `aria-label` on `<table>` to identify what data is shown.

CORTHEX admin manages departments, agents, and users — tables are primary navigation surfaces. Missing sort/select ARIA means admin users with screen readers cannot manage their organization.

**Fix**: Add ARIA spec block to DataTable:
```tsx
// <table aria-label="[Injected from prop: tableLabel]" aria-multiselectable="true">
// <th>: <button onClick={sort} aria-sort="none|ascending|descending">{label}</button>
// <tr>: aria-selected={isSelected} onClick={handleSelect} onKeyDown={spaceToSelect}
// Pagination: <nav aria-label="테이블 페이지 탐색">
```

---

### Issue Q-3 [MEDIUM]: InputBar submit button missing `aria-label` in spec

**§2.3 InputBar Hub ChatArea spec:**
> InputBar — Textarea (auto-resize) + SubmitButton (h-12 w-12 bg-indigo-600)

The submit button is 48×48px — icon-only by size. No `aria-label` specified anywhere. An icon-only button has no accessible name → WCAG 4.1.2 Name/Role/Value violation.

If using the `Send` icon (specified in Phase 3-1 §6.5), the button needs:
```tsx
<button
  type="submit"
  aria-label="메시지 전송"   // ← required
  className="h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center"
>
  <Send className="h-5 w-5 text-white" aria-hidden="true" />
</button>
```

**Add to spec**: InputBar API must include `aria-label` on the submit button. If the icon is sufficient visual context, the label is still required for screen readers.

---

## BOB (Performance / Bundle / Rendering)

### Issue B-1 [HIGH]: AGORA SpeechCard `setTimeout` + `setState` causes N React re-renders — CSS already handles the stagger

**§4.3 AGORA Speech Card Pattern:**
```tsx
speeches.forEach((speech, index) => {
  setTimeout(() => {
    setSpeechCards(prev => [...prev, speech])  // ← N separate setState calls
  }, index * 200)
})
```

This schedules N `setTimeout` callbacks, each triggering a React `setState` → reconcile → re-render cycle. For 10 speeches: 10 re-renders of the parent, each time re-rendering the growing speech card list (quadratic render work).

**The CSS already solves this.** The same §4.3 spec shows:
```tsx
style={{
  animationDelay: `${index * 200}ms`,
  opacity: 0,
}}
```

If all N cards are rendered at once with `animationDelay`, the stagger is achieved purely via CSS with **a single render**. The `setTimeout` + `setSpeechCards` incrementally-growing-list pattern is entirely redundant.

**Fix**: Replace with single render:
```tsx
// Render all at once — CSS animationDelay handles the visual stagger
const [speechCards, setSpeechCards] = useState<Speech[]>([])

// On timeline fetch complete:
setSpeechCards(timelineData.speeches)  // ← single setState, single render

// Each card:
<div
  className="speech-card"
  style={{ animation: 'speech-enter 400ms ease-out forwards', animationDelay: `${index * 200}ms`, opacity: 0 }}
>
```

Performance improvement: O(1) renders instead of O(N). Correct with prefers-reduced-motion handling already in place from Phase 3-1.

---

### Issue B-2 [MEDIUM]: DataTable no row virtualization spec — large datasets will cause jank

**§2.2 DataTable** is described for "standard CRUD" — CORTHEX admin manages agents, departments, users. The knowledge page has document lists. Cost reports could have hundreds of rows.

No mention of:
- Maximum rows before virtualization is required
- `@tanstack/virtual` (already in the TanStack ecosystem, since TanStack Query is used)
- `overflow-auto` + fixed table height for scroll containment

Without virtualization guidance, a developer implementing DataTable will render all rows in the DOM — at 200 rows, this causes measurable scroll jank on the 4-core VPS where the app also runs.

**Recommendation**: Add a note: "DataTable renders max 100 rows before pagination is required. Virtual scrolling not needed at current data volumes — revisit in Phase 4 after profiling. Use `overflow-auto` on the container with `max-h-[60vh]`."

---

## Preliminary Scores (Round 1)

| Dimension | Score | Notes |
|-----------|-------|-------|
| Tech/TypeScript correctness | 7/10 | A-1 (HTMLAttributes), A-2 (NEXUS counts), A-3 (numeric keys) |
| A11y / WCAG | 6.5/10 | Q-1 (Drawer inert) and Q-2 (DataTable ARIA) are significant gaps |
| Performance | 8/10 | B-1 is a real redundancy; B-2 is a missing guideline |
| Completeness | 8.5/10 | Strong overall — CVA pattern, slate→zinc, SSE tier pattern well specified |
| Phase 3-1 consistency | 9/10 | border-zinc-707, CircleUser, duration-[250ms], motion-reduce all respected |

**Overall R1 assessment: 7.8/10. Good bones, 2 critical fixes needed (HTMLAttributes + Drawer inert) before R2.**

Priority fixes:
1. Add `HTMLAttributes` extension to TierBadgeProps + CostBadgeProps (A-1)
2. Correct NEXUS component counts/locations and add admin NEXUS to §7 (A-2)
3. Add `inert={!open}` + `aria-hidden` to Drawer spec (Q-1)
4. Add DataTable ARIA sort/select spec (Q-2)
5. Replace SpeechCard `setTimeout` stagger with single-render CSS approach (B-1)
