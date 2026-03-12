# Phase 2-2: App Mobile Options — CRITIC-A Review (Round 2)

**Date**: 2026-03-12
**Reviewer**: CRITIC-A (Sally / Marcus / Luna)
**Document reviewed**: `_corthex_full_redesign/phase-2-analysis/app-analysis.md`
**Round**: 2 — Verification Review

---

## Verification Results

| ID | Issue | Status |
|----|-------|--------|
| S1 | TrackerStrip THREE role="status" | ✅ FIXED |
| S2 | HubMoreMenu navigate undeclared | ✅ FIXED |
| S3 | BottomTabBar5 navigate undeclared | ❌ NOT FIXED |
| M1 | h-18 invalid Tailwind class | ✅ FIXED |
| M2 | @theme required/MUST in 6 locations | ✅ FIXED |
| M3 | DrawerNav close animation dead code | ✅ FIXED |
| M4 | DrawerNav focus trap not implemented | ✅ FIXED (minimal) |
| M5 | DrawerSection h-10 fix not shown | ❌ STILL OPEN |
| L1 | BottomTabBar5 "알림 알림" duplication | ❌ NOT FIXED |
| L2 | mobile-agent-store.ts missing | ✅ FIXED |

**7 fixed ✅, 2 required still open, 1 minor still open.**

---

## Verified Fixed — Detail

### S1 — ✅ TrackerStrip ARIA: Excellent fix

**Visual container**: `role="region" aria-live="off"` (line 630-631). No live region flooding ✅
**Two sr-only announcement divs**: `role="status" aria-live="polite" aria-atomic="true"` — one for SSE events (line 611), one for expand/collapse (line 616) ✅
**aria-expanded** on toggle buttons:
- Compact button (line 640): `aria-expanded={false}` ✅
- Collapse button (line 653): `aria-expanded={true}` ✅

**CRITICAL INVARIANT comment** (lines 589-592) and **Section 5.5** (lines 1667-1670) both updated to document `role="status" is FORBIDDEN on visual tracker div` ✅
Option A Accessibility score (line 824) updated to reflect correct pattern ✅

`role="region"` is a better solution than my "no role" suggestion — it creates an accessible named landmark visible to screen reader users navigating by landmark, which is semantically appropriate for the tracker panel.

### S2 — ✅ HubMoreMenu navigate

`const navigate = useNavigate()` at line 1527 with explanatory comment ✅

### M1 — ✅ h-[72px] throughout

Touch target table (line 257) and ActiveSessionCard JSX comment (line 345) both updated to `h-[72px]` ✅

### M2 — ✅ @theme "optional" in all 6 locations

All locations now say "works without @theme. Optional: add @theme { ... } only for pb-safe shorthand."
Section 5.5 (line 1679): "@theme ... is OPTIONAL in index.css" ✅

### M3 — ✅ DrawerNav always-mounted

Lines 1088–1094: `opacity-0 pointer-events-none` / `opacity-100 pointer-events-auto` toggle.
Comment at lines 1068–1070 explains why conditional mounting kills the close animation ✅
`aria-hidden={!isOpen}` on container (line 1099) — hides from AT when closed ✅

### M4 — ✅ DrawerNav focus trap (minimal, acceptable for Phase 2)

`useRef<HTMLElement>(null)` on `<nav>` (line 1073, 1107) ✅
`useEffect` focuses first focusable element on open (lines 1075–1080) ✅
`handleKeyDown` closes on Escape (lines 1082–1086) ✅
Comment acknowledges full Tab cycling requires `@radix-ui/react-focus-scope` ✅

First-focus-on-open + Escape-to-close satisfies the critical WCAG 2.1 SC 2.1.2 requirement for Phase 2 spec. Full Tab trap can be a Phase 5 refinement.

### L2 — ✅ mobile-agent-store.ts

Lines 760–771: full TypeScript interface with `agentTiers: Record<string, 'T1' | 'T2' | 'T3'>` and `useAgentStore` export ✅. Labelled as "Companion store — required by useMobileHubStore.onHandoffEvent for tier lookup" ✅

---

## Remaining Issues

### S3 — BLOCKING: BottomTabBar5 navigate still undeclared

**Location**: `BottomTabBar5`, line 1461–1511

`BottomTabBar5` (line 1461-1464):
```tsx
export function BottomTabBar5({ activeTab, notificationCount }: {
  activeTab: string
  notificationCount?: number
}) {
  return (    // ← no const navigate = useNavigate() before this
```

Line 1480 calls `navigate(tab.path)` — still a runtime ReferenceError.

This issue was explicitly named as **S3** in my Round 1 v2 review. `BottomTabBar.tsx` (Option A) has `useNavigate()` at line 537 ✅. The same fix was not applied to `BottomTabBar5` (Option C).

**Required fix**:
```tsx
export function BottomTabBar5({ activeTab, notificationCount }: ...) {
  const navigate = useNavigate()  // ADD THIS — same as BottomTabBar.tsx line 537
  return (
```

---

### M5 — REQUIRED: DrawerSection h-10 fix documented but not shown in code

**Location**: Line 959 (fix noted), line 1067 (comment), line 1235 (scoring still deducts)

Line 959: "Fix needed: Drawer section headers at `h-10` (40px) are below 44pt minimum. Increase to `h-12` (48px)."
Line 1067: `// Note: DrawerNav section headers must be h-12 (48px) for 44pt touch target compliance`

These are correct directions — but **no `DrawerSection` component implementation code is shown**. The spec references `<DrawerSection />` at lines 1134, 1143 but only as component usage, not definition.

Additionally, **Option B UX score (line 1235) still deducts for this**: `"DrawerSection headers h-10 < 44pt (fix required)"` — the score penalizes Option B for a bug the spec acknowledges but hasn't fixed in the component code.

**Required fix**: Add a `DrawerSection` component code block showing `h-12` section headers. Minimum spec:
```tsx
function DrawerSection({ label, items, collapsible, defaultCollapsed }: DrawerSectionProps) {
  const [open, setOpen] = useState(!defaultCollapsed)
  const navigate = useNavigate()
  return (
    <div>
      {collapsible ? (
        <button
          className="flex items-center justify-between w-full px-4 h-12 text-xs font-semibold uppercase text-zinc-400"
          // h-12 = 48px — meets 44pt minimum
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
        >
          {label} <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", open && "rotate-90")} />
        </button>
      ) : (
        <p className="px-4 h-12 flex items-center text-xs font-semibold uppercase text-zinc-400">{label}</p>
        // h-12 = 48px ✅
      )}
      {open && items.map(item => (
        <button key={item.path} className="flex items-center gap-3 px-4 h-12 w-full text-sm text-zinc-200"
                onClick={() => navigate(item.path)}>
          {item.emoji} {item.label}
        </button>
      ))}
    </div>
  )
}
```
Then remove or update the UX score deduction (it can become: "Drawer section headers: h-12 ✅ corrected from h-10").

---

### L1 — MINOR: BottomTabBar5 notification aria-label still duplicates "알림"

**Location**: `BottomTabBar5`, line 1478–1479

```tsx
aria-label={tab.id === 'notifications' && notificationCount
  ? `${tab.label} 알림 ${notificationCount}개` : tab.label}
```

For the notifications tab, `tab.label = '알림'`, result: `"알림 알림 103개"` — doubled "알림".

**Fix**: Drop `tab.label` for the notification-count case:
```tsx
aria-label={tab.id === 'notifications' && notificationCount
  ? `알림 ${notificationCount}개` : tab.label}
```

---

### L2 (NEW) — MINOR: BottomTabBar5 badge span missing aria-hidden

**Location**: `BottomTabBar5`, lines 1497–1500

```tsx
<span className="absolute -top-1 -right-2 bg-red-500 ...">
  {notificationCount > 99 ? '99+' : notificationCount}
</span>
```

No `aria-hidden="true"`. Option A's `BottomTabBar` (line 569) correctly has `aria-hidden="true"` on its badge span — the count is already announced via the button's `aria-label`, so the visual badge should be hidden from AT.

**Fix**: Add `aria-hidden="true"` to the badge span (same pattern as Option A line 569).

---

## Round 2 Assessment

**Score**: 8.5/10 (pending S3 + M5 fix)

**Deductions from 10**:
- (-0.8) S3: BottomTabBar5 `navigate` undeclared — runtime crash for Option C tab navigation
- (-0.5) M5: DrawerSection h-10 fix direction shown but component code missing; UX score deduction still penalizes unfixed code
- (-0.2) L1+L2: "알림 알림" duplication + BottomTabBar5 badge missing aria-hidden

**What's excellent in this version**:
- TrackerStrip ARIA: `role="region" aria-live="off"` is a better solution than I suggested — creates proper landmark semantics
- Section 5.5 duration distinction (150ms/250ms) — now precisely documented
- DrawerNav always-mounted fix + focus management — correct pattern with appropriate Phase 5 caveat
- @theme "OPTIONAL" across all locations — consistent and correct
- mobile-agent-store.ts with full TypeScript spec — exactly what was needed

**Round 3 required** (minimal). S3 is a single-line add. M5 requires a DrawerSection code block. L1+L2 are small badge fixes. Estimated time: ~10 minutes.

---

*CRITIC-A — Phase 2-2 App Mobile Analysis — Round 2*
*2026-03-12*
