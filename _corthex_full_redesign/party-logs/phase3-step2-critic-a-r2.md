# Phase 3-2: Component Strategy — CRITIC-A Review (Round 2)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-3-design-system/component-strategy.md`
**Round**: 2 — Fix Verification

---

## R1 Issue Verification — All 5 Confirmed Fixed ✅

| R1 Issue | Status | Verification |
|---------|--------|-------------|
| **S1** `getState()` non-reactive | ✅ FIXED | §4.2: `useAgentStore(state => state.agentTiers[step.to] ?? null)` with ✅/❌ examples. Anti-pattern commented out with explanation. |
| **M1** NEXUS location conflict | ✅ FIXED | §0: "24 NEXUS components (13 app + 11 admin)". §7: two separate rows — `packages/app/src/components/nexus/` (13, SketchVibe) + `packages/admin/src/components/nexus/` (11, org chart). |
| **M2** TierBadge API violations | ✅ FIXED | Keys: `manager/specialist/worker` strings. `TierBadgeProps extends React.HTMLAttributes<HTMLSpanElement>`. API mapping note: `tier === 1 ? 'manager' : ...`. |
| **M3** AgentBadge missing spec | ✅ FIXED | Full CVA spec with `name/tier/status/showTier/showStatus`. Size variants `sm`/`md`. Visual layout for both sizes documented. |
| **L1** Bot duplicate in §4.1 | ✅ FIXED | `Bot` appears once. |

---

## R2 New Findings

### Minor-1: `AgentBadge size=sm` StatusDot at `h-1.5 w-1.5` (6px) smaller than Phase 3-1 spec

**Location**: §2.2 AgentBadge Spec

**The spec**:
```tsx
// size=sm: name text-xs text-zinc-300 truncate max-w-[120px]] [TierBadge tier="specialist"]
// (implicit StatusDot h-1.5 w-1.5 from comment above)
```

Phase 3-1 §1.8 specifies the standard status dot as:
```tsx
Active session dot | h-2 w-2 rounded-full bg-indigo-500
```

`h-1.5 w-1.5` = **6px**. `h-2 w-2` = **8px** (Phase 3-1 standard). A 6px colored dot approaches the lower bound for WCAG 1.4.11 Non-text Contrast (3:1 minimum for UI components — enforcement becomes unreliable below ~8px at normal viewing distances). More practically: at 6px, `bg-green-500` and `bg-indigo-500` are hard to distinguish by color alone, especially for users with color vision deficiency.

**Recommended fix**: Keep `StatusDot h-2 w-2` (8px) even in `size=sm`. TrackerPanel rows have sufficient density at 8px dots. Update the `size=sm` comment: `StatusDot h-2 w-2` (not 1.5).

---

### Minor-2: `Tooltip` classified as Atom in §6 but as Molecule in §2.2 — inconsistency

**Location**: §2.2 New Molecules table + §6 Priority Queue

**The conflict**:
- §2.2 New Molecules table: `Tooltip | 🆕 New` (listed under Molecules)
- §6 Priority Queue: `Tooltip | Atom | @corthex/ui`

The classification is debatable (Tooltip has no state and wraps a single element — arguably an atom). But the inconsistency within the same document will confuse developers creating the component file. Pick one and be consistent.

**Recommended fix**: Move `Tooltip` from §2.2 Molecules table to §2.1 Atoms table (matches §6's `Atom` classification). A Tooltip wraps a trigger element with a hover-activated label — no compound structure, no business logic, no multi-atom composition → Atom.

---

## Summary of R2 Findings

| # | Severity | Issue | Impact |
|---|----------|-------|--------|
| Minor-1 | Minor | AgentBadge sm StatusDot h-1.5 (6px) < Phase 3-1 h-2 (8px) standard | WCAG 1.4.11 boundary + color distinguishability |
| Minor-2 | Minor | Tooltip: Atom in §6, Molecule in §2.2 | Developer confusion on component file location |

**No blockers. No new CRITICAL or MAJOR issues.**

---

## CRITIC-A Round 2 Score

**Score: 48 / 50**

| Criterion | Score | Notes |
|-----------|-------|-------|
| API correctness | 10/10 | CVA pattern canonical, all props extend HTMLAttributes, string variant keys throughout. |
| Reactive patterns | 10/10 | useAgentStore reactive selector fixed, AGORA single-setState fixed, always-mounted Drawer preserved. |
| Brand alignment | 10/10 | Never Bot enforced in §4.1 with ✅/❌ examples. slate→zinc migration file paths actionable. |
| Accessibility | 9/10 | Drawer inert+aria-hidden ✅. DataTable grid ARIA ✅. AgentBadge sm dot 6px borderline (-1). |
| Consistency | 9/10 | Tooltip classification conflict §2.2 vs §6 (-1). |

**Recommendation**: ✅ **APPROVE** for Phase 3-2. Two minor findings do not block developer handoff. Minor-1 (AgentBadge dot size) and Minor-2 (Tooltip classification) should be corrected during implementation sprint before the relevant components are built.

---

## What Improved from R1 → R2

- §4.2 reactive/non-reactive pattern shown side by side — clear dev guidance with ✅/❌
- §4.3 single-setState AGORA pattern is a real performance improvement (N→1 React re-renders)
- §7 split NEXUS entries eliminate all ambiguity about which 24 components live where
- `TierBadge` semantic string keys (`manager/specialist/worker`) are significantly more readable than `1/2/3`
- `AgentBadge` spec with `showTier`/`showStatus` boolean props gives fine-grained control across TrackerPanel (dense) vs MessageBubble (spacious) contexts
- Drawer `inert={!open}` prevents keyboard Tab from reaching hidden drawer content — correct WCAG 2.4.3 implementation

**Phase 3-2 APPROVED by CRITIC-A. Round 2.**
