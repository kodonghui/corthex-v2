# Phase 3-2: Component Strategy — CRITIC-A Review (Round 1)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-3-design-system/component-strategy.md`
**Round**: 1 — Initial Review

---

## Overall Assessment

The document is structurally solid: CVA pattern documented correctly, 3-layer atom/molecule/organism architecture is clear, slate→zinc migration files are named, protected components are listed, and Phase 3-1 cross-references are accurate. However, I found **4 concrete issues** before approval: 1 critical path error that will send developers to the wrong directory, 1 live reactive bug pattern in the SSE integration code, 1 API standards violation in the flagship new atom, and 1 missing spec for a P0-path compound component.

---

## SALLY (UX Designer) — Issues Found

### Issue S1: `useAgentStore.getState()` in TrackerPanel — non-reactive, tier badges will silently not render — CRITICAL

**Location**: §4.2 TrackerPanel SSE Integration Pattern

**The code**:
```tsx
const tier = useAgentStore.getState().agentTiers[step.to] ?? null
```

**The problem**: `useAgentStore.getState()` is a **snapshot read** — it reads the current store state once and does not subscribe to updates. In React, this means the component will NOT re-render when `agentTiers` is populated. This is not the reactive Zustand pattern.

The race condition that will silently fail in production:
1. User submits command → SSE fires `handoff` event → `TrackerPanel` renders new `HandoffStep`
2. At render time: `useAgentStore.getState().agentTiers[step.to]` → returns `null` (agents not yet loaded)
3. `TierBadge` renders with `tier={null}` → badge is invisible (no tier shown)
4. Store updates when agents load → `getState()` is not subscribed → component does NOT re-render
5. Tier badge stays invisible for the entire execution chain

The TrackerPanel is CORTHEX's #1 emotional moment (Vision §4.2: "🥇 Tracker cascade"). Invisible tier badges on every step silently breaks the product's signature feature.

**Required fix**: Replace snapshot read with Zustand reactive selector pattern:
```tsx
// ✅ CORRECT — reactive, re-renders when store updates:
const agentTiers = useAgentStore(state => state.agentTiers)
const tier = agentTiers[step.to] ?? null

// Or per-step:
const tier = useAgentStore(state => state.agentTiers[step.to] ?? null)

// ❌ WRONG (current doc):
const tier = useAgentStore.getState().agentTiers[step.to] ?? null  // snapshot only
```

Also update the comment to explain WHY reactive is required: "Tier data may load after SSE event — reactive selector ensures re-render when agentTiers populates."

---

## MARCUS (Visual Designer) — Issues Found

### Issue M1: NEXUS component location conflict between §2.3 and §7 — CRITICAL

**Location**: §2.3 Admin Organisms vs §7 Existing Components (Do Not Recreate)

**The conflict**:

| Section | Location stated |
|---------|----------------|
| §2.3 (Admin Organisms): `NexusCanvas` | `packages/admin/src/components/nexus/` |
| §2.3 (Admin Organisms): `AgentConfigPanel` | `packages/admin/src/components/nexus/` |
| **§7 Protected Components**: "All 13 NEXUS components" | **`packages/app/src/components/nexus/`** |

These are different directories in different packages. Developers following §7 ("do not recreate") will look in `packages/app/src/components/nexus/` — if the actual components live in `packages/admin/`, they won't find them and may create duplicates, breaking the "do not recreate" protection the document is trying to establish.

**Required fix**: Verify actual location in codebase, then update §7 to match §2.3. One of them is wrong. Based on product architecture (NEXUS canvas editor is an admin function), the correct path is likely `packages/admin/src/components/nexus/` — update §7 to match.

If there are NEXUS components in BOTH packages (admin: full editor, app: SketchVibe read-only view), the §7 table must list both paths explicitly:
```
All 13 admin NEXUS components | packages/admin/src/components/nexus/ | @xyflow/react — do not recreate
SketchVibe canvas components   | packages/app/src/components/nexus/   | app-side view — do not recreate
```

---

### Issue M2: `TierBadgeProps` violates §3.1 canonical CVA pattern + integer variant keys — MAJOR

**Location**: §2.1 TierBadge Spec

**Problem 1 — Missing HTMLAttributes extension** (§3.1 violation):
```tsx
// Current (wrong — violates §3.1 canonical pattern):
export interface TierBadgeProps extends VariantProps<typeof tierBadgeVariants> {
  className?: string
  showLabel?: boolean
}

// Required (§3.1: "Props interface extends HTML element props + VariantProps"):
export interface TierBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,  // badge renders as <span>
    VariantProps<typeof tierBadgeVariants> {
  showLabel?: boolean
}
```
Without extending `HTMLSpanElement`, consumers cannot pass `data-*` attributes, `aria-label`, `id`, or `ref` to the badge — all of which will be needed when using `TierBadge` inside `AgentBadge` and `TrackerPanel` for ARIA labeling.

**Problem 2 — Integer CVA variant keys** (TypeScript risk):
```tsx
// Current — integer keys:
variants: { tier: { 1: '...', 2: '...', 3: '...' } }

// Generated VariantProps type: tier: 1 | 2 | 3  (numeric literals)
```
CVA internally uses object keys as strings regardless. Passing `tier={1}` in JSX works, but `tier={"1"}` (from a string-typed data source like `agent.tier_level: string`) will fail TypeScript type check. All API data is typically typed as `number | string` at boundaries. Use string keys to avoid runtime/type boundary issues:
```tsx
variants: { tier: { '1': '...', '2': '...', '3': '...' } }
// Or semantic names:
variants: { tier: { manager: '...', specialist: '...', worker: '...' } }
```
Semantic names (`manager/specialist/worker`) are also more readable than `1/2/3` and align with Vision terminology (T1 관리자 / T2 전문가 / T3 워커).

**Required fix**: (1) Add `extends React.HTMLAttributes<HTMLSpanElement>`. (2) Change integer keys to string keys `'1'/'2'/'3'` or semantic names.

---

### Issue M3: `AgentBadge` has no spec — P0-path component — MAJOR

**Location**: §2.2 Molecules — New — `AgentBadge`

**The entry**:
> `AgentBadge | 🆕 New | Agent name + TierBadge + StatusDot in one compound. Used in TrackerPanel steps.`

`AgentBadge` is used in:
- Every `HandoffStep` row in `TrackerPanel` (P0 — Hub's #1 feature)
- `MessageBubble` header (agent name + tier above each AI response)
- Potentially `SessionPanel` header (agent status indicators)

For a component that appears on every single TrackerPanel step — the product's #1 emotional moment — having only a one-line description with no prop interface or visual spec is insufficient. Developers implementing the P0 TrackerPanel redesign will need to guess its API, leading to inconsistent implementations across files.

Minimum required spec:
```tsx
// packages/ui/src/agent-badge.tsx
export interface AgentBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  agentName: string               // "비서실장", "CTO"
  tier: 1 | 2 | 3                 // drives TierBadge variant
  status: 'online' | 'working' | 'offline'  // drives StatusDot color
  size?: 'sm' | 'md'              // sm for TrackerPanel steps, md for MessageBubble header
  showStatus?: boolean            // true in SessionPanel, false in TrackerPanel steps
}
// Visual: [StatusDot?] [agentName text-sm font-medium text-zinc-100] [TierBadge]
// Size sm: text-xs text-zinc-300 (TrackerPanel density)
// Size md: text-sm text-zinc-100 (MessageBubble, card headers)
```

**Required fix**: Add `AgentBadge` spec block (prop interface + visual layout + size variants) alongside the existing `TierBadge` and `CostBadge` specs.

---

## LUNA (Brand Strategist) — Issues Found

### Issue L1: `Bot` listed twice in §4.1 FORBIDDEN examples — MINOR

**Location**: §4.1 The "Never Bot" Rule

**The code**:
```tsx
// ❌ FORBIDDEN — robot metaphor:
<Bot className="h-4 w-4" />     // Vision §5.3: "Do NOT use: robots"
<Cpu className="h-4 w-4" />
<Bot className="h-4 w-4" />     // ← DUPLICATE
```

`Bot` appears twice in the FORBIDDEN list. Copy-paste artifact. Remove the duplicate.

---

## Summary of Issues

| # | Severity | Reviewer | Issue | Required action |
|---|----------|----------|-------|----------------|
| S1 | CRITICAL | Sally | `useAgentStore.getState()` non-reactive — tier badges silently fail when tiers load after SSE | Replace with reactive `useAgentStore(state => ...)` selector |
| M1 | CRITICAL | Marcus | NEXUS location conflict: §7 says `packages/app/`, §2.3 says `packages/admin/` | Verify actual location, update §7 to match |
| M2 | MAJOR | Marcus | `TierBadgeProps` missing `React.HTMLAttributes<HTMLSpanElement>` + integer CVA keys cause type boundary issues | Add HTMLSpanElement extension; change to string keys or semantic names |
| M3 | MAJOR | Marcus | `AgentBadge` — no prop interface or visual spec for P0-path component | Add full spec: prop interface + size variants + visual layout |
| L1 | MINOR | Luna | `Bot` listed twice in §4.1 forbidden examples | Remove duplicate |

**Blockers before approval**: S1 (silent production bug), M1 (wrong directory — breaks protected component guarantee)
**Should fix before Round 2**: M2, M3 (API correctness + developer clarity)

---

## What the Document Does Well

- CVA canonical pattern in §1.2 is complete and correct — base → variants → defaultVariants → props → function structure is exactly right
- The `Always mounted (never {open && <Drawer>})` note in §2.2 Drawer spec is an excellent UX detail — preserves the close animation
- `transition-[transform] duration-[250ms] ease-out motion-reduce:transition-none` on Drawer is correctly specified
- Protected components list is valuable — clearly marks @xyflow/react and CodeMirror wrappers as "do not recreate"
- Stitch integration checklist in §5.3 is thorough — the `pb-[env(safe-area-inset-bottom)]` safe area note for BottomTabBar is exactly the kind of mobile-specific detail that prevents bugs
- §4.3 AGORA speech card pattern correctly uses `setTimeout` JS stagger with CSS animation (not transition) — consistent with Phase 3-1
- §4.4 slate→zinc migration with explicit affected file paths is actionable

**Round 1 rating**: Cannot approve. Fix 2 CRITICAL issues (S1/M1) and 2 MAJOR issues (M2/M3) before Round 2.
