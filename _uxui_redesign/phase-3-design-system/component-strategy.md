# CORTHEX v3 — Component Strategy

**Phase:** 3-Design System, Step 3-2
**Date:** 2026-03-23
**Author:** UXUI Writer (Phase 3 Design System)
**Input:** Design Tokens (Step 3-1), Vision & Identity (Phase 0), Phase 2 Analysis (Option C winner), Codebase Audit, 2026 Library Research
**Target Grade:** B (avg >= 7.0)

---

## 1. Current State Audit

CORTHEX's component architecture embodies the Ruler archetype's drive for order. The current three-system chaos (Subframe + @corthex/ui + Stitch) mirrors an organization without a clear chain of command — three dialects, none authoritative. The migration unifies these into a single system of components that speak the same visual language — one token system, one component API, one source of truth. This is "Controlled Nature" applied to architecture: imposing structural precision on organic growth.

### 1.1 Component Layers (3 Overlapping Systems)

CORTHEX currently has **three component layers** that overlap and conflict:

| Layer | Location | Components | Token System | Status |
|-------|----------|-----------|-------------|--------|
| **Subframe UI** | `packages/app/src/ui/components/` | 44 components | `theme.css` (`bg-brand-*`, `bg-neutral-*`) | Active — 131+ token references across 37 files |
| **@corthex/ui** | `packages/ui/src/` | 20 components | Hardcoded Tailwind (indigo, zinc, red) | Active — used by Stitch-generated pages |
| **Stitch Generated** | `_corthex_full_redesign/phase-7-stitch/` | 42 page-level TSX files | Inline Tailwind (olive, cream hardcoded) | Reference — not yet integrated |

**The problem:** Three layers, three different color systems, zero shared token usage. The Subframe Button uses `bg-brand-600`, the @corthex/ui Button uses `bg-indigo-600`, and Stitch pages hardcode `#5a7247`. None use the `corthex-*` design tokens from Step 3-1.

### 1.2 Subframe UI Component Inventory (44 Components)

**Category breakdown of the 44 Subframe components:**

| Category | Components | Count |
|----------|-----------|-------|
| **Form Inputs** | TextField, TextArea, Select, Checkbox, CheckboxGroup, RadioGroup, Switch, Slider, Calendar | 9 |
| **Buttons** | Button, IconButton, LinkButton, CopyToClipboardButton | 4 |
| **Overlays** | Dialog, FullscreenDialog, Drawer, ContextMenu, DropdownMenu, Tooltip, Toast | 7 |
| **Navigation** | Breadcrumbs, Tabs, SidebarWithSections, TopbarWithRightNav | 4 |
| **Data Display** | Table, TreeView, Accordion, Badge, Avatar, IconWithBackground | 6 |
| **Charts** | AreaChart, BarChart, LineChart, PieChart | 4 |
| **Feedback** | Alert, Loader, Progress, Stepper, VerticalStepper | 5 |
| **Layout** | CheckboxCard, RadioCardGroup, ToggleGroup | 3 |
| **Skeleton** | SkeletonCircle, SkeletonText | 2 |

**Subframe component pattern:**
```tsx
// Every component follows this exact pattern:
"use client";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

const Component = React.forwardRef<HTMLElement, Props>(
  function Component({ variant, className, ...otherProps }, ref) {
    return (
      <element
        className={SubframeUtils.twClassNames(
          "bg-brand-600 text-white hover:bg-brand-500 ...",
          { "bg-transparent": variant === "secondary" },
          className
        )}
        ref={ref}
        {...otherProps}
      />
    );
  }
);
```

**Key dependencies:**
- `@subframe/core@^1.154.0` — wraps Radix UI primitives (Dialog, Popover, Menu) + provides `twClassNames` utility
- `theme.css` — CSS custom properties (`--color-brand-*`, `--color-neutral-*`, etc.)
- Estimated CSS footprint: ~54KB from @subframe/core

### 1.3 @corthex/ui Component Inventory (20 Components)

The shared UI package at `packages/ui/src/` exports 20 components using CVA (class-variance-authority) + clsx + tailwind-merge:

| Component | Variants | Notes |
|-----------|----------|-------|
| Button | default, outline, ghost, destructive × sm, default, lg, icon | Uses hardcoded `bg-indigo-600` — needs rebranding |
| Card | CardHeader, CardContent, CardFooter | Compound component |
| Badge | (default) | Simple |
| Input | (default) | Simple |
| Select | (default) | With SelectOption type |
| Textarea | (default) | Simple |
| Tabs | (default) | With TabItem type |
| Toggle | (default) | Simple |
| Modal | (default) | Simple |
| ConfirmDialog | (default) | Alert-style dialog |
| Avatar | (default) | Simple |
| Spinner | (default) | Loading indicator |
| StatusDot | (default) | Agent status |
| EmptyState | (default) | Zero-data state |
| Skeleton | SkeletonCard, SkeletonTable | Loading placeholders |
| FilterChip | (default) | Tag-style filter |
| Timeline | TimelineGroup, TimelineItem | Activity display |
| ProgressBar | (default) | Progress indicator |
| Toast | toast fn + ToastProvider | Via sonner |

**Pattern:** CVA for variants, `cn()` for class merging (clsx + tailwind-merge). No Radix UI primitives — pure HTML elements.

### 1.4 Dependency Map

```
@subframe/core (1.154.0)
├── Internally wraps @radix-ui/* (Dialog, Popover, Menu, etc.)
├── Provides SubframeCore.Dialog.Root/Content, Popover.*, Menu.*
├── Provides SubframeCore.IconWrapper
└── Consumes theme.css tokens

@corthex/ui (workspace)
├── class-variance-authority (0.7)
├── clsx (2.x)
├── tailwind-merge (3.x)
└── No Radix — pure HTML elements

Other UI-adjacent deps:
├── @xyflow/react (12.10.1) — NEXUS org chart
├── @dnd-kit/core (6.3.1) + @dnd-kit/sortable (10.0.0)
├── @codemirror/* (6.x) — code editor (SketchVibe)
├── lightweight-charts (5.1.0) — trading charts
├── sonner (2.0.7) — toast notifications
├── lucide-react (0.577.0) — icons
└── zustand (5.0.11) — state management
```

---

## 2. Library Evaluation — Headless Component Primitives

### 2.1 Evaluation Criteria

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| **Tailwind v4 compatibility** | HIGH | CORTHEX uses Tailwind CSS v4 with `@theme` directive |
| **React 19 support** | HIGH | CORTHEX runs React 19 |
| **A11y (WCAG 2.1 AA)** | HIGH | Step 3-1 mandates AA compliance |
| **Component coverage** | HIGH | Must cover all 44 Subframe components + gaps |
| **Bundle size** | MEDIUM | VPS-hosted (Oracle ARM 4-core), not CDN-edge |
| **Ecosystem / community** | MEDIUM | Documentation quality, third-party extensions |
| **Migration effort** | MEDIUM | Subframe already wraps Radix internally |
| **Multi-framework** | LOW | CORTHEX is React-only |

### 2.2 Candidates Evaluated

#### A. shadcn/ui + Radix UI Primitives (Recommended)

**What it is:** A copy-paste component registry built on Radix UI primitives. Components are copied into your codebase — no runtime dependency. CLI generates components with CVA + Tailwind + Radix.

| Factor | Assessment |
|--------|-----------|
| **Version** | shadcn/cli v4 (March 2026). Radix `radix-ui` v1.4.3 (unified package) |
| **Tailwind v4** | Full support. `tw-animate-css` replaces `tailwindcss-animate` for CSS-only animations |
| **React 19** | Full support. `forwardRef` removed, `ref` as direct prop |
| **A11y** | AAA via Radix primitives (ARIA, keyboard nav, focus management) |
| **Components** | 50+ registry components covering all Subframe equivalents |
| **Bundle** | ~5KB per component (tree-shaken, copy-paste) |
| **Ecosystem** | Largest community. AI-aware: `shadcn/skills` for LLM code generation context |
| **Migration** | Lowest friction — Subframe already wraps Radix internally. Same conceptual model. |

**Why shadcn/ui wins for CORTHEX:**
1. **Subframe → shadcn is a lateral move, not a rewrite.** Both use Radix Dialog, Popover, DropdownMenu. The migration swaps the wrapper, not the primitive.
2. **CVA pattern already in @corthex/ui.** The shared UI package already uses `cva()` + `cn()` — exactly shadcn's pattern.
3. **Tailwind v4 first-class.** CLI v4 generates Tailwind v4-native code with `@theme` support.
4. **Registry system.** Can distribute the entire CORTHEX design system as a `registry:base` — components, tokens, fonts in one `npx shadcn add`.
5. **AI agent context.** `shadcn/skills` provides structured component context for LLM code generation — aligns with Step 3-1's LLM Context Block.

#### B. Base UI (MUI) — Watch List

| Factor | Assessment |
|--------|-----------|
| **Version** | Beta (not 1.0). Active development by MUI team. |
| **Tailwind v4** | Supported (unstyled — framework-agnostic) |
| **React 19** | Supported |
| **A11y** | AAA |
| **Components** | ~20 (beta). Has native Combobox and multi-select (Radix lacks these) |
| **Bundle** | Smallest of all options |
| **Ecosystem** | Growing. shadcn/ui now supports `--base-ui` init flag |
| **Migration** | Different API pattern (`render` prop vs Radix's `asChild`). Higher friction. |

**Verdict:** Not ready for production adoption. Beta status + different API pattern = too risky. But worth monitoring — if Radix stagnation continues (WorkOS acquisition slowed updates), Base UI becomes the fallback.

#### C. Ark UI (Chakra team) — Rejected

| Factor | Assessment |
|--------|-----------|
| **Version** | `@ark-ui/react` v5.34.1 (stable) |
| **Strength** | 45+ components, state-machine-driven (Zag.js), multi-framework |
| **Weakness** | No shadcn/ui integration. Different mental model (state machines vs. composition). No ecosystem momentum in CORTHEX's stack. |

**Verdict:** Rejected. Good library, but zero ecosystem overlap with CORTHEX's existing CVA + Radix pattern. Migration cost exceeds benefit.

#### D. React Aria (Adobe) — Rejected

| Factor | Assessment |
|--------|-----------|
| **Version** | Stable. 14K+ GitHub stars |
| **Strength** | Best-in-class a11y. Hook-based (`useButton`, `useCombobox`). Superior internationalization. |
| **Weakness** | Hook-based API requires more boilerplate than component-based (Radix). Steeper learning curve. No shadcn/ui integration. |

**Verdict:** Rejected for primary use. CORTHEX's non-developer owner needs components, not hooks. But React Aria's `useDatePicker` could supplement Radix for complex inputs (Radix has no native date picker).

#### E. Headless UI (Tailwind Labs) — Rejected

| Factor | Assessment |
|--------|-----------|
| **Version** | `@headlessui/react` v2.2.9 |
| **Weakness** | Only ~10 components. Far too limited for a 44-component replacement. |

**Verdict:** Rejected. Insufficient component coverage.

### 2.3 Evaluation Matrix

| Criterion | Weight | shadcn/Radix | Base UI | Ark UI | React Aria | Headless UI |
|-----------|--------|-------------|---------|--------|-----------|-------------|
| TW4 compat | 3 | 10 | 8 | 7 | 6 | 9 |
| React 19 | 3 | 10 | 9 | 9 | 9 | 9 |
| A11y | 3 | 9 | 9 | 9 | 10 | 9 |
| Coverage | 3 | 10 | 5 | 9 | 8 | 3 |
| Bundle | 2 | 8 | 10 | 7 | 7 | 9 |
| Ecosystem | 2 | 10 | 6 | 5 | 7 | 7 |
| Migration | 2 | 10 | 5 | 4 | 4 | 6 |
| **Weighted** | | **9.61** | **7.50** | **7.44** | **7.50** | **7.44** |

> **Formula:** `sum(score × weight) / sum(weights)`. Total weight = 18. Base UI and React Aria tie at 7.50; Ark UI and Headless UI tie at 7.44.

**Winner: shadcn/ui + Radix UI Primitives** — 9.61/10 weighted score. 2.1-point lead over field.

---

## 3. Target Architecture

### 3.1 Unified Component Stack

After migration, CORTHEX will have **one component layer** instead of three:

```
┌─────────────────────────────────────────────┐
│              Page Components                 │
│  (pages/*.tsx — use @corthex/ui exclusively) │
├─────────────────────────────────────────────┤
│          @corthex/ui (packages/ui/)          │
│  CVA + cn() + Radix primitives               │
│  All variants use corthex-* design tokens    │
├─────────────────────────────────────────────┤
│       Radix UI Primitives (radix-ui)         │
│  Dialog, Popover, DropdownMenu, Select,      │
│  Accordion, Tabs, Tooltip, etc.              │
├─────────────────────────────────────────────┤
│       Tailwind CSS v4 + @theme tokens        │
│  bg-corthex-*, text-corthex-*, etc.          │
└─────────────────────────────────────────────┘
```

**What gets removed:**
- `@subframe/core` dependency (~54KB CSS)
- `packages/app/src/ui/components/` (44 Subframe components)
- `packages/app/src/ui/theme.css` (parallel token system)
- `packages/app/src/ui/utils.ts` (SubframeUtils.twClassNames)

**What stays:**
- `@corthex/ui` (expanded from 20 → ~35 components)
- `radix-ui` (unified package, tree-shakable)
- `lucide-react`, `sonner`, `@xyflow/react`, `@dnd-kit/*`, `@codemirror/*`, `lightweight-charts`

### 3.2 Component API Standard

All @corthex/ui components follow this pattern after migration:

```tsx
// packages/ui/src/button.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  // Base styles using corthex-* tokens
  // transition-colors (not transition-all) — Step 3-1 §5.1: only transform+opacity for layout; colors are safe
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-corthex-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-corthex-accent text-corthex-text-on-accent hover:bg-corthex-accent-hover',
        secondary: 'bg-corthex-accent-secondary text-corthex-text-on-accent hover:bg-corthex-accent-hover',
        outline: 'border border-corthex-border-input bg-transparent text-corthex-text-primary hover:bg-corthex-surface',
        ghost: 'text-corthex-text-primary hover:bg-corthex-surface',
        destructive: 'bg-corthex-error text-white hover:bg-corthex-error/90',
        inverse: 'bg-white/15 text-corthex-text-chrome hover:bg-white/25 focus-visible:ring-corthex-focus-chrome',
        link: 'text-corthex-accent-secondary underline underline-offset-4 hover:text-corthex-accent',
      },
      size: {
        default: 'h-11 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />
}
```

**API rules:**
1. All color classes use `corthex-*` tokens (never hardcoded hex, never `indigo-*` / `zinc-*`). Opacity modifiers (`bg-corthex-error/90`) are acceptable.
2. All components export `VariantProps` type for consumer type-safety
3. Radix-wrapped components use `radix-ui` unified package (not individual `@radix-ui/react-*`). Version to be verified at implementation — pin to exact version per CLAUDE.md convention.
4. Focus rings use `ring-corthex-focus` (light bg) or `ring-corthex-focus-chrome` (dark bg)
5. Border on inputs uses `border-corthex-border-input` (WCAG 1.4.11 compliant)
6. Animation classes from `tw-animate-css` (not `tailwindcss-animate`)
7. **Inverse variant for chrome surfaces:** Components rendered on `--bg-chrome` (sidebar, drawer, dark zones) must use `variant="inverse"` or equivalent. Inverse variants use `--text-chrome`, `bg-white/15` hover, and `--focus-ring-chrome` tokens.
8. **Transition scope:** Use `transition-colors` (not `transition-all`) for color-only hover effects. Use `transition-[transform,opacity]` for layout animations. Never use `transition-all` — it animates width/height/padding, violating Step 3-1 §5.1 Rule 3.
9. **Touch targets:** Default button height is `h-11` (44px) — WCAG AAA per Step 3-1 §3.5. `size="sm"` (`h-8`, 32px) is for desktop-only compact contexts; mobile must override to `h-11`.
10. **Typography in components:** Components displaying machine-readable data (agent IDs, costs, API endpoints, build numbers) must use `font-mono` class (JetBrains Mono). Badge, Input, and Table support `className="font-mono"` for this purpose.
11. **Dialog/Drawer overlay:** Use `bg-corthex-chrome/40` (olive-tinted translucent). Maintains Natural Organic warmth during modal interactions. Never use pure black overlay.
12. **Link variant vs inline links:** Button `variant="link"` uses always-visible underline + `hover:text-corthex-accent`. Inline `<a>` tags follow the same rule per Step 3-1 §1.8. Both use `text-corthex-accent-secondary` as base color.

### 3.3 Component Inventory — Target State

The unified @corthex/ui will have ~35 components covering all current Subframe + @corthex/ui functionality:

| Component | Radix Primitive? | Subframe Equivalent | Priority |
|-----------|-----------------|-------------------|----------|
| **Button** | No | Button | P0 — used everywhere |
| **IconButton** | No | IconButton | P0 |
| **Badge** | No | Badge | P0 |
| **Card** | No | (none — was custom) | P0 |
| **Input** | No | TextField | P0 |
| **Textarea** | No | TextArea | P0 |
| **Select** | Yes (`Select`) | Select | P0 |
| **Dialog** | Yes (`Dialog`) | Dialog, FullscreenDialog | P0 |
| **DropdownMenu** | Yes (`DropdownMenu`) | DropdownMenu, ContextMenu | P0 |
| **Tabs** | Yes (`Tabs`) | Tabs | P0 |
| **Tooltip** | Yes (`Tooltip`) | Tooltip | P0 |
| **Avatar** | Yes (`Avatar`) | Avatar | P1 |
| **Accordion** | Yes (`Accordion`) | Accordion | P1 |
| **Checkbox** | Yes (`Checkbox`) | Checkbox, CheckboxGroup | P1 |
| **RadioGroup** | Yes (`RadioGroup`) | RadioGroup, RadioCardGroup | P1 |
| **Switch** | Yes (`Switch`) | Switch | P1 |
| **Slider** | Yes (`Slider`) | Slider | P1 |
| **Progress** | Yes (`Progress`) | Progress | P1 |
| **Toast** | No (sonner) | Toast | P1 — keep sonner |
| **Alert** | No | Alert | P1 |
| **Table** | No | Table | P1 |
| **Popover** | Yes (`Popover`) | (via @subframe/core) | P1 |
| **Drawer** | No (vaul) | Drawer | P2 — use vaul for mobile bottom sheet |
| **Skeleton** | No | SkeletonCircle, SkeletonText | P2 |
| **Breadcrumbs** | No | Breadcrumbs | P2 |
| **Stepper** | No | Stepper, VerticalStepper | P2 |
| **Calendar** | No (react-day-picker) | Calendar | P2 |
| **TreeView** | No | TreeView | P2 — **requires custom tree ARIA** (see note below) |
| **ToggleGroup** | Yes (`ToggleGroup`) | ToggleGroup | P2 |
| **StatusDot** | No | (custom) | P2 — keep existing |
| **EmptyState** | No | (custom) | P2 — keep existing |
| **Spinner** | No | Loader | P2 — keep existing |
| **FilterChip** | No | (custom) | P2 — keep existing |
| **Timeline** | No | (custom) | P2 — keep existing |
| **ConfirmDialog** | Yes (`AlertDialog`) | (custom) | P2 |
| **CommandPalette** | No (cmdk) | (new — v3 feature) | P1 — Cmd+K, Step 3-1 z-index 100 |

**Not migrated (kept as-is):**
- Charts (AreaChart, BarChart, LineChart, PieChart) — these are `lightweight-charts` / Recharts wrappers, not Subframe UI
- SidebarWithSections — replaced by custom sidebar (already rebuilt in Phase 7)
- TopbarWithRightNav — replaced by custom topbar (already rebuilt in Phase 7)
- CopyToClipboardButton — trivial utility, stays inline
- IconWithBackground — trivial utility, replaced by Tailwind classes
- CheckboxCard — merge into Checkbox variant

> **TreeView ARIA warning:** The current Subframe TreeView uses Accordion internally. **Accordion and Tree are different ARIA patterns.** Accordion uses `region`/`heading` roles with Enter/Space toggling. Trees require `role="tree"` → `role="treeitem"` with `aria-expanded`, arrow-key navigation (up/down navigate, left/right expand/collapse), Home/End jump, and typeahead focus-by-letter. The TreeView migration MUST NOT simply reuse Radix Accordion primitives for the ARIA layer — it needs custom `role="tree"`/`role="treeitem"` semantics and arrow-key keyboard handlers. Reference React Aria's `useTreeView` hook or build custom keyboard navigation on top of Accordion's visual structure.

### 3.4 New Dependencies

| Package | Version | Purpose | Replaces | Notes |
|---------|---------|---------|----------|-------|
| `radix-ui` | ^1.4.3 | Unified Radix primitives (Dialog, Select, Popover, etc.) | `@subframe/core` | Version to be verified at implementation — pin exact version per CLAUDE.md |
| `tw-animate-css` | ^1.x | Tailwind v4 CSS-only animations | none (new) | |
| `vaul` | ^1.x | Mobile bottom sheet / drawer | Subframe Drawer | |
| `react-day-picker` | ^9.x | Calendar / date picker | Subframe Calendar | Already bundled transitively via @subframe/core. Becomes direct dependency after removal. |
| `cmdk` | ^1.x | Command palette (Cmd+K) | none (new v3 feature) | shadcn/ui integrates natively |

**Retained dependencies (currently transitive via @subframe/core, must become direct):**

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `recharts` | ^2.15.x | Chart components (AreaChart, BarChart, LineChart, PieChart) | Currently a @subframe/core dependency. Must add to `packages/app/package.json` before removing @subframe/core. |

| Package Removed | Savings |
|----------------|---------|
| `@subframe/core` | ~54KB CSS + JS runtime (includes Radix primitives, recharts, react-day-picker — all promoted to direct deps) |

**Note:** `class-variance-authority`, `clsx`, `tailwind-merge` are already in `packages/ui/` — no new utility deps.

---

## 4. Migration Strategy

### 4.1 Principles

1. **Component-by-component, not big-bang.** Replace one Subframe component at a time. Both systems coexist during migration.
2. **Pages drive priority.** Migrate components in order of which pages are being rebuilt from Stitch references.
3. **Token-first.** Before migrating any component, ensure `theme.css` brand tokens are mapped to `corthex-*` tokens (see Step 3-1 Appendix A-2).
4. **Test at each step.** Each component replacement must pass visual diff + a11y audit before merging.
5. **No feature regressions.** Every Subframe component's props, variants, and a11y features must be preserved.

### 4.2 Migration Phases

#### Phase 4-A: Foundation (P0 Components — ~2 weeks)

**Goal:** Replace the 10 most-used Subframe components with @corthex/ui equivalents.

| Step | Action | Impact |
|------|--------|--------|
| 4-A.1 | Install `radix-ui` unified package | Adds Radix primitives directly |
| 4-A.2 | Install `tw-animate-css` | Replaces JS animation plugin |
| 4-A.3 | Rebrand existing @corthex/ui Button, Input, Badge, Card | Swap `indigo-*` → `corthex-*` tokens |
| 4-A.4 | Build Dialog (Radix Dialog) | Replace Subframe Dialog + FullscreenDialog |
| 4-A.5 | Build Select (Radix Select) | Replace Subframe Select |
| 4-A.6 | Build DropdownMenu (Radix DropdownMenu) | Replace Subframe DropdownMenu + ContextMenu |
| 4-A.7 | Build Tabs (Radix Tabs) | Replace Subframe Tabs |
| 4-A.8 | Build Tooltip (Radix Tooltip) | Replace Subframe Tooltip |
| 4-A.9 | Build Textarea | Replace Subframe TextArea |
| 4-A.10 | Build IconButton | Replace Subframe IconButton |

**After Phase 4-A:** Pages can import from `@corthex/ui` for all fundamental components. Subframe imports remain for non-P0 components.

#### Phase 4-B: Interactive Components (P1 — ~2 weeks)

| Step | Action | Radix Primitive |
|------|--------|----------------|
| 4-B.1 | Accordion | `Accordion` |
| 4-B.2 | Checkbox + CheckboxGroup | `Checkbox` |
| 4-B.3 | RadioGroup + RadioCardGroup | `RadioGroup` |
| 4-B.4 | Switch | `Switch` |
| 4-B.5 | Slider | `Slider` |
| 4-B.6 | Progress | `Progress` |
| 4-B.7 | Popover | `Popover` |
| 4-B.8 | Avatar | `Avatar` |
| 4-B.9 | Alert | (no primitive — HTML) |
| 4-B.10 | Table | (no primitive — HTML) |
| 4-B.11 | CommandPalette | `cmdk` — new v3 feature (Cmd+K) |

#### Phase 4-C: Cleanup (P2 — ~1 week)

| Step | Action |
|------|--------|
| 4-C.1 | Build Drawer (vaul) for mobile bottom sheet |
| 4-C.2 | Build Calendar (react-day-picker) |
| 4-C.3 | Build remaining: Breadcrumbs, Stepper, TreeView, ToggleGroup, ConfirmDialog |
| 4-C.4 | Remove `@subframe/core` from `package.json` |
| 4-C.5 | Delete `packages/app/src/ui/components/` (44 Subframe files) |
| 4-C.6 | Delete `packages/app/src/ui/theme.css` |
| 4-C.7 | Delete `packages/app/src/ui/utils.ts` |

### 4.3 Component Migration Checklist (Per Component)

For each Subframe component being replaced:

```
□ 1. Read Subframe component source — note all props, variants, event handlers
□ 2. Read all page usages of the component (grep for import path)
□ 3. Build @corthex/ui equivalent with CVA + Radix (if applicable)
□ 4. Apply corthex-* design tokens (bg-corthex-accent, text-corthex-text-primary, etc.)
□ 5. Match all existing variants (variant names may change but behavior must not)
□ 6. Add focus ring: ring-corthex-focus (light) or ring-corthex-focus-chrome (dark)
□ 7. Add WCAG 1.4.11 input borders: border-corthex-border-input (for inputs/selects)
□ 8. Test keyboard navigation (Tab, Enter, Escape, Arrow keys)
□ 9. Test screen reader (aria-label, aria-describedby, role)
□ 10. Update all page imports: @subframe → @corthex/ui
□ 11. Visual diff — compare before/after screenshots
□ 12. Remove Subframe component file
□ 13. Test prefers-reduced-motion — all transitions disabled (0.01ms override per Step 3-1 §5.4)
□ 14. Test forced-colors: active — borders visible, no transparent-only indicators (Windows High Contrast per Step 3-1 §5.4)
□ 15. Verify touch targets >= 44px on mobile viewport (WCAG AAA per Step 3-1 §3.5)
```

### 4.4 Import Migration Pattern

```tsx
// BEFORE (Subframe)
import { Button } from "../../ui/components/Button";
import { Dialog } from "../../ui/components/Dialog";
import * as SubframeCore from "@subframe/core";

// AFTER (@corthex/ui)
import { Button, Dialog } from "@corthex/ui";
// No SubframeCore import needed
```

### 4.5 Variant Mapping (Subframe → @corthex/ui)

| Subframe Variant | @corthex/ui Variant | Token Change |
|-----------------|-------------------|-------------|
| `variant="brand-primary"` | `variant="default"` | `bg-brand-600` → `bg-corthex-accent` |
| `variant="brand-secondary"` | `variant="secondary"` | `bg-brand-50` → `bg-corthex-accent-secondary` |
| `variant="brand-tertiary"` | `variant="ghost"` | `bg-transparent` → same |
| `variant="neutral-primary"` | `variant="outline"` | `bg-neutral-*` → `border-corthex-border-input` |
| `variant="neutral-secondary"` | `variant="ghost"` | merged |
| `variant="destructive-primary"` | `variant="destructive"` | `bg-error-600` → `bg-corthex-error` |
| `variant="inverse"` | `variant="inverse"` | new — `bg-white/15 text-chrome hover:bg-white/25` for sidebar/drawer/dark chrome surfaces |
| `size="small"` | `size="sm"` | naming alignment |
| `size="medium"` | `size="default"` | naming alignment |
| `size="large"` | `size="lg"` | naming alignment |

> **Dark-bg component switching pattern:** Components on olive chrome surfaces (sidebar, drawer, dark chrome) use the `inverse` variant. This is determined by render context, not a global dark mode. The pattern: parent chrome containers (sidebar, drawer) pass `variant="inverse"` to child interactive components. Focus rings switch to `ring-corthex-focus-chrome`. Text uses `text-corthex-text-chrome`. No CSS parent selector or `.chrome` class needed — explicit variant prop keeps it predictable and testable.

---

## 5. Stitch Reference Integration

### 5.1 What Stitch Files Provide

The 42 Stitch-generated TSX files in `_corthex_full_redesign/phase-7-stitch/1_natural_organic/` are **design references**, not production code. They provide:

1. **Layout structure** — how each page arranges its sections, grids, and panels
2. **Data flow patterns** — React Query usage, API endpoint structure, mutation patterns
3. **Natural Organic visual language** — how the design tokens look in actual UI context
4. **Component composition** — how components combine (e.g., Table + Badge + StatusDot in a row)

### 5.2 What Stitch Files Do NOT Provide

1. **Correct component imports** — Stitch references `@corthex/ui` but the actual component API may differ
2. **Token accuracy** — Stitch hardcodes olive hex values instead of using `corthex-*` utility classes
3. **Error handling** — Stitch provides happy-path only; production needs error boundaries, loading states, empty states
4. **A11y compliance** — Stitch doesn't guarantee WCAG compliance on interactive components
5. **Type safety** — Stitch uses inline types; production must use `shared/types.ts`

### 5.3 Page Rebuild Strategy (Stitch → Production)

For each page:

```
1. Read Stitch TSX reference for layout structure
2. Extract content area only (ignore sidebar/topbar — already rebuilt)
3. Replace hardcoded hex values with corthex-* Tailwind classes
4. Replace Stitch component calls with @corthex/ui component calls
5. Replace inline types with shared/types.ts imports
6. Add error handling (React Query error states, error boundaries)
7. Add loading states (Skeleton components)
8. Add empty states (EmptyState component)
9. Add a11y (aria-labels, keyboard nav, landmarks)
10. Visual diff against Stitch reference screenshot
```

### 5.4 Page Priority (Based on Phase 2 Analysis Fit Scores)

| Priority | Pages | Stitch Fit | Notes |
|----------|-------|-----------|-------|
| **P0** | Hub, Dashboard, Chat | 90-95% | Almost direct adoption from Stitch |
| **P1** | SNS, Notifications, Activity Log | 85% | Minor structure adjustments |
| **P2** | Agents, Departments, Knowledge | 75-80% | Detail panel / section structure differs |
| **P3** | Trading, Jobs, Settings | 60-70% | Complex features, significant adaptation needed |
| **P4** | NEXUS, SketchVibe, Agora | N/A | Custom canvas/editor — Stitch is layout reference only |

---

## 6. Specialized Component Decisions

### 6.1 Charts — Keep Current Stack

| Library | Components | Rationale |
|---------|-----------|-----------|
| `lightweight-charts` (5.1.0) | Trading page TradingView-style charts | Purpose-built for financial data. No alternative. |
| Custom chart wrappers | AreaChart, BarChart, LineChart, PieChart | Subframe chart components are thin wrappers. Migrate to direct recharts/nivo usage with `corthex-chart-*` tokens. |

**Token integration:** Chart components must consume `--color-corthex-chart-1` through `--color-corthex-chart-6` from Step 3-1. **Charts with >3 series must support pattern fills** (dashed, dotted, hatched) per Step 3-1 CVD safety requirement.

### 6.2 NEXUS — Keep @xyflow/react

The NEXUS org chart editor uses `@xyflow/react@12.10.1`. This is a specialized graph visualization library — no migration needed. Style nodes and edges with `corthex-*` tokens.

### 6.3 Drag & Drop — Keep @dnd-kit

`@dnd-kit/core@6.3.1` + `@dnd-kit/sortable@10.0.0` for reorderable lists. No migration needed.

### 6.4 Code Editor — Keep @codemirror

`@codemirror/*@6.x` for SketchVibe's code editing. Theme the editor with `corthex-*` tokens using CodeMirror's theme API.

### 6.5 Toast — Keep sonner

`sonner@2.0.7` is already used. shadcn/ui also recommends sonner over its own Toast component. Style with `corthex-*` tokens.

### 6.6 Mobile Bottom Sheet — Add vaul

New dependency: `vaul` for mobile drawer / bottom sheet behavior. Recommended by Phase 2 App Analysis for the bottom sheet interaction pattern. Integrates with Radix Dialog primitive.

### 6.7 Calendar / Date Picker — Add react-day-picker

New dependency: `react-day-picker@9.x` for date selection. shadcn/ui uses this internally. Replace Subframe Calendar. Already bundled transitively via @subframe/core — becomes direct dependency after removal.

> **Calendar a11y:** react-day-picker v9 provides built-in ARIA grid pattern, arrow-key date navigation, month navigation, and locale support. Implementers must verify `aria-label` on date cells and arrow-key behavior during migration.

---

## 7. @corthex/ui Package Structure

### 7.1 Directory Layout (Post-Migration)

```
packages/ui/
├── src/
│   ├── index.ts              # Public exports
│   ├── utils.ts              # cn() helper (clsx + tailwind-merge)
│   │
│   ├── # Primitives (no Radix)
│   ├── button.tsx
│   ├── icon-button.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── textarea.tsx
│   ├── alert.tsx
│   ├── avatar.tsx
│   ├── spinner.tsx
│   ├── skeleton.tsx
│   ├── progress-bar.tsx
│   ├── status-dot.tsx
│   ├── empty-state.tsx
│   ├── filter-chip.tsx
│   ├── timeline.tsx
│   ├── breadcrumbs.tsx
│   ├── stepper.tsx
│   ├── table.tsx
│   │
│   ├── # Radix-wrapped
│   ├── dialog.tsx            # Radix Dialog
│   ├── confirm-dialog.tsx    # Radix AlertDialog
│   ├── select.tsx            # Radix Select
│   ├── dropdown-menu.tsx     # Radix DropdownMenu
│   ├── popover.tsx           # Radix Popover
│   ├── tooltip.tsx           # Radix Tooltip
│   ├── tabs.tsx              # Radix Tabs
│   ├── accordion.tsx         # Radix Accordion
│   ├── checkbox.tsx          # Radix Checkbox
│   ├── radio-group.tsx       # Radix RadioGroup
│   ├── switch.tsx            # Radix Switch
│   ├── slider.tsx            # Radix Slider
│   ├── toggle-group.tsx      # Radix ToggleGroup
│   ├── drawer.tsx            # vaul
│   ├── calendar.tsx          # react-day-picker
│   ├── tree-view.tsx         # Custom (Accordion visual structure + custom role="tree" ARIA — see §3.3 warning)
│   │
│   └── # Re-exports
│       └── toast.ts          # sonner re-export
├── package.json
└── tsconfig.json
```

### 7.2 Package Dependencies (Post-Migration)

```json
{
  "dependencies": {
    "radix-ui": "1.4.3",          /* pin exact — verify latest at implementation time */
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^3",
    "vaul": "^1",
    "react-day-picker": "^9",
    "cmdk": "^1",
    "sonner": "^2.0.7"
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19"
  }
}
```

> **Note:** `recharts` remains in `packages/app/package.json` (not @corthex/ui) since chart components are app-level, not shared UI primitives. It must be promoted from transitive (@subframe/core) to direct dependency before @subframe/core removal.
```

### 7.3 Export Rules

1. Every component is a named export from `index.ts`
2. Every component exports its `Props` type
3. Every component exports its `Variants` type (if CVA-based)
4. No default exports — named only
5. No re-exporting Radix primitives — wrap everything

---

## 8. Risk Assessment

### 8.1 Migration Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Subframe → Radix API mismatch** | LOW | Subframe already wraps Radix internally — same primitive model |
| **290+ token reference breakage** | MEDIUM | Phase 4 migration: align `theme.css` values first, then swap class names |
| **Visual regression** | MEDIUM | Screenshot diff testing at each component swap |
| **A11y regression** | HIGH | Each component must pass keyboard + screen reader test before merge |
| **Bundle size increase** | LOW | Radix unified package is tree-shakable; removing @subframe/core nets ~54KB savings |
| **React 19 forwardRef removal** | LOW | shadcn/ui v4 already dropped forwardRef — use `ref` prop directly |

### 8.2 Coexistence Strategy

During migration, Subframe and @corthex/ui coexist. Rules:

1. **New pages** use @corthex/ui exclusively
2. **Existing pages** keep Subframe imports until their component is replaced
3. **theme.css** stays loaded but values are aligned to `corthex-*` equivalents (Step 3-1 Appendix A-2)
4. **No mixing** in same component — a component imports either Subframe OR @corthex/ui, never both
5. **@subframe/core** is not removed until Phase 4-C (all 44 components replaced)

### 8.3 Success Criteria

| Metric | Target |
|--------|--------|
| Subframe components remaining | 0 |
| @subframe/core in package.json | Removed |
| theme.css | Deleted |
| All components using corthex-* tokens | 100% |
| WCAG AA compliance | 100% of interactive components |
| Bundle size change | Net negative (savings from @subframe/core removal) |

---

## Appendix A: Carry-Forward Items from Step 3-1

| # | Item | Source | Action in Component Strategy |
|---|------|--------|------------------------------|
| 1 | Handoff purple hue-distance justification | ux-brand R2 | Add 1-line rationale when building semantic color badges |
| 2 | Z-index 30 shared tier stacking | ux-brand R2 | Document stacking order: bottom-nav → FAB → overlay-backdrop (left-to-right in DOM) |
| 3 | `--bg-input` token | ux-brand R2 | Define as CVA base class on Input/Select/Textarea: `bg-corthex-bg` (cream background for form inputs) |

---

## Appendix B: Subframe → Radix Primitive Mapping

| Subframe Component | Uses @subframe/core Primitive | Radix Equivalent | Notes |
|-------------------|-----------------------------|-----------------|----|
| Dialog | `SubframeCore.Dialog.Root/Content` | `Dialog` from `radix-ui` | Direct 1:1 |
| FullscreenDialog | `SubframeCore.Dialog.Root/Content` | `Dialog` + fullscreen variant | Merge into Dialog |
| DropdownMenu | `SubframeCore.Menu.*` | `DropdownMenu` from `radix-ui` | Direct 1:1 |
| ContextMenu | `SubframeCore.Menu.*` | `ContextMenu` from `radix-ui` | Direct 1:1 |
| Select | `SubframeCore.Select.*` | `Select` from `radix-ui` | Direct 1:1 |
| Tooltip | `SubframeCore.Tooltip.*` | `Tooltip` from `radix-ui` | Direct 1:1 |
| Drawer | `SubframeCore.Dialog.*` | `vaul` (Drawer) | Different lib, same concept |
| Accordion | Subframe custom | `Accordion` from `radix-ui` | New primitive |
| Tabs | Subframe custom | `Tabs` from `radix-ui` | New primitive |
| Checkbox | HTML `<input>` | `Checkbox` from `radix-ui` | Upgrade to primitive |
| RadioGroup | HTML `<input>` | `RadioGroup` from `radix-ui` | Upgrade to primitive |
| Switch | HTML `<input>` | `Switch` from `radix-ui` | Upgrade to primitive |
| Slider | HTML `<input>` | `Slider` from `radix-ui` | Upgrade to primitive |
| Progress | HTML `<div>` | `Progress` from `radix-ui` | Upgrade to primitive |
| Calendar | Subframe custom | `react-day-picker` | Different lib |

---

*End of Component Strategy — Phase 3-Design System, Step 3-2*
