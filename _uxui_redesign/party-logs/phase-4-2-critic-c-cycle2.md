# CRITIC-C Report — Phase 4-2: CSS + Theme Consistency (CYCLE 2)
**Role**: CSS & Theme Verification
**Date**: 2026-03-25
**Cycle**: 2 (re-review after fixes)

---

## Cycle 2 Fixes Verification

| Fix Claimed | Verified | Evidence |
|------------|----------|---------|
| `jobs.tsx`: `getStatusBadge()` → CSS vars | ✅ CONFIRMED | Lines 122–127: `var(--color-corthex-info-muted, ...)`, `var(--color-corthex-success)` etc. |
| `dashboard.tsx`: `PROVIDER_COLORS` → CSS vars | ✅ CONFIRMED | Lines 32–34: `var(--color-corthex-handoff)`, `var(--color-corthex-success)`, `var(--color-corthex-warning)` |
| `themes.css`: `*-muted` semantic tokens added | ✅ CONFIRMED | All 4 tokens present in all 3 theme blocks (lines 49–55, 106–113, 160–167) |
| `index.css`: `body { font-family }` added | ✅ CONFIRMED | Line 48–50: `body { font-family: var(--font-body, 'DM Sans', 'Inter', sans-serif); }` |

All 4 claimed fixes are correctly applied.

---

## Cycle 2 Score Summary

| File | Cycle 1 | Cycle 2 | Delta |
|------|---------|---------|-------|
| dashboard.tsx | 5/10 | 6/10 | +1 |
| hub/index.tsx | 8/10 | 8/10 | — |
| agents.tsx | 6/10 | 6/10 | — |
| jobs.tsx | 4/10 | 6/10 | +2 |
| themes.css | 9/10 | 10/10 | +1 |
| index.css | 8/10 | 9/10 | +1 |

**Overall: 6.5/10 — MARGINAL** (up from 5.5/10)

Progress: 4 critical issues resolved. 18 remaining violations across dashboard.tsx and jobs.tsx. agents.tsx untouched this cycle.

---

## File 1: `packages/app/src/pages/dashboard.tsx`
**Score: 6/10** (was 5/10)

### Verified Fix
- ✅ `PROVIDER_COLORS` now uses `var(--color-corthex-handoff/success/warning)` — theme-aware chart colors
- ✅ CPU health matrix bar: `bg-gradient-to-r from-corthex-accent to-corthex-accent/70` — correct
- ✅ CPU dot indicators: `bg-corthex-accent` — correct

### Remaining Issues

**[ISSUE 1 — HIGH] `eventTypeColor` still uses raw Tailwind (lines 470–475) — NOT FIXED**
```tsx
const eventTypeColor: Record<string, string> = {
  INFO: 'text-blue-400',    // ← raw Tailwind
  OKAY: 'text-green-500',   // ← raw Tailwind
  WARN: 'text-yellow-500',  // ← raw Tailwind
  FAIL: 'text-red-500',     // ← raw Tailwind
}
```
Live Event Stream log entries will not change color on theme switch. Should use `text-corthex-info`, `text-corthex-success`, `text-corthex-warning`, `text-corthex-error`.

**[ISSUE 2 — HIGH] System status dot hardcoded hex + raw Tailwind (line 485)**
```tsx
<span className={`... ${isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22C55E]' : 'bg-red-500'}`} />
<p className="text-[10px] font-mono ... text-green-500">
```
Three violations in two lines: `bg-green-500`, `shadow-[0_0_8px_#22C55E]` (hardcoded hex), `bg-red-500`, `text-green-500`. Should use corthex-success and corthex-error tokens.

**[ISSUE 3 — HIGH] Stat card badges still use raw Tailwind (lines 507, 529)**
```tsx
<span className="bg-green-500/10 text-green-500 ... border border-green-500/20">ONLINE</span>
<span className="bg-yellow-500/10 text-yellow-500 ... border border-yellow-500/20">
```
Both need CSS var inline styles. Note: Tailwind `/opacity` modifiers do not work on `--color-corthex-*` utility classes, so these must use `style={{ backgroundColor: 'var(--color-corthex-success-muted)', color: 'var(--color-corthex-success)', borderColor: 'var(--color-corthex-success-muted)' }}`.

**[ISSUE 4 — HIGH] Memory + NEXUS health matrix bars still raw Tailwind (lines 697–725)**
```tsx
// Memory bar — NOT FIXED
className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
className={`w-1 h-3 ${i <= ... ? 'bg-blue-500' : 'bg-corthex-border/40'}`}

// NEXUS bar — NOT FIXED
className="h-full bg-gradient-to-r from-green-500 to-green-400"
className={`w-1 h-3 ${i <= ... ? 'bg-green-500' : 'bg-corthex-border/40'}`}
```
CPU bar was fixed (correctly uses `from-corthex-accent`) but the other 2 matrix bars were missed. Memory should map to `--color-corthex-info`; NEXUS to `--color-corthex-success`. Since Tailwind gradients can't use CSS var classes directly, use inline style approach: `style={{ background: 'linear-gradient(to right, var(--color-corthex-info), color-mix(in srgb, var(--color-corthex-info) 70%, transparent))' }}`.

**[ISSUE 5 — MEDIUM] Agent status dots in Active Units table use raw Tailwind (lines 592–593)**
```tsx
agent.status === 'online' ? 'bg-green-500' :
agent.status === 'error' ? 'bg-red-500' : 'bg-corthex-border'
```
Should use `bg-corthex-success` and `bg-corthex-error`.

**[ISSUE 6 — MEDIUM] Live Event Stream indicator dot uses `bg-red-500` (line 639)**
```tsx
<div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
```
Live stream "recording" indicator should use `bg-corthex-error` (or `bg-corthex-accent` if it represents activity, not error).

**[ISSUE 7 — LOW] `font-sans` still on root element (line 478)**
```tsx
<div data-testid="dashboard-page" className="bg-corthex-bg min-h-screen font-sans ...">
```
`font-sans` → system sans-serif. Although `body { font-family: var(--font-body) }` was added to index.css this cycle (which fixes global inheritance), `font-sans` explicitly overrides it back to system default for this subtree. Should be `font-body` or removed.

---

## File 2: `packages/app/src/pages/hub/index.tsx`
**Score: 8/10** (unchanged)

No new issues introduced. Cycle 1 findings still apply:
- Minor: inline `N/N` agent count in welcome subtitle paragraph not wrapped in `font-mono`
- All colors still correctly via CSS vars ✓
- Lucide React icons only ✓

---

## File 3: `packages/app/src/pages/agents.tsx`
**Score: 6/10** (unchanged — no Cycle 2 fixes applied)

All Cycle 1 issues still present:

**[ISSUE 1 — HIGH] Soul variable chips hardcoded (line 340) — NOT FIXED**
```tsx
style={{
  backgroundColor: v.category === 'personality' ? 'rgba(37,99,235,0.1)' : v.category === 'memory' ? 'rgba(124,58,237,0.1)' : 'rgba(90,114,71,0.1)',
  color: v.category === 'personality' ? '#2563eb' : v.category === 'memory' ? '#7c3aed' : 'var(--color-corthex-accent)'
}}
```
Now that `--color-corthex-info-muted` and `--color-corthex-handoff-muted` exist (added in Cycle 2 to themes.css), the fix is available:
- personality → `var(--color-corthex-info-muted)` / `var(--color-corthex-info)`
- memory → `var(--color-corthex-handoff-muted)` / `var(--color-corthex-handoff)`
- default → `var(--color-corthex-accent-muted)` / `var(--color-corthex-accent)`

**[ISSUE 2 — HIGH] Status color logic uses hardcoded hex (line 493) — NOT FIXED**
```tsx
style={{ color: status.dot === 'bg-corthex-accent' ? '#4d7c0f' : status.dot === 'bg-red-600' ? '#dc2626' : '...' }}
```
Should map to `var(--color-corthex-accent-deep)` and `var(--color-corthex-error)`.

**[ISSUE 3 — HIGH] Delete button hardcoded hover hex (line 504) — NOT FIXED**
```tsx
className="... bg-red-600 text-white hover:bg-[#b91c1c] ..."
```
`bg-red-600` → `bg-corthex-error`. `hover:bg-[#b91c1c]` → should use inline style with `var(--color-corthex-error)` darkened, or add `--color-corthex-error-deep` token (analogous to `--color-corthex-accent-deep`).

---

## File 4: `packages/app/src/pages/jobs.tsx`
**Score: 6/10** (was 4/10)

### Verified Fix
- ✅ `getStatusBadge()` fully converted to CSS vars (lines 122–127) — correct pattern with rgba fallbacks

### Remaining Issues

**[ISSUE 1 — HIGH] `STATUS_STYLES` still raw Tailwind + hardcoded rgba (lines 96–98) — NOT FIXED**
```tsx
processing: { dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse', textClass: 'text-blue-600' },
completed:  { dotClass: 'bg-corthex-accent shadow-[0_0_8px_rgba(77,124,15,0.5)]', ...  },
failed:     { dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', textClass: 'text-red-600' },
```
Three violations:
1. `bg-blue-500`, `text-blue-600` → `bg-corthex-info`, `text-corthex-info`
2. `bg-red-500`, `text-red-600` → `bg-corthex-error`, `text-corthex-error`
3. `shadow-[0_0_8px_rgba(77,124,15,0.5)]` on `completed` — olive green shadow (#4d7c0f), does NOT match `--color-corthex-accent` (#CA8A04 gold). This is a copy-paste error from v1 Natural Organic theme. Should be `shadow-[0_0_8px_var(--color-corthex-accent)]` or removed.

Note: `STATUS_STYLES` is a Tailwind class string map — cannot use inline `var()` in class strings directly. Options: (a) convert to dynamic inline style object, or (b) use Tailwind's `[--var:value]` syntax but this doesn't support CSS vars as values. Best solution: convert `dotClass` to a function returning inline style.

**[ISSUE 2 — HIGH] Inline hardcoded hex still on 8+ lines (666, 750, 759, 790, 926, 933, 1054, 1061) — NOT FIXED**
```tsx
// Line 666
style={{ color: '#fbbf24' }}                    // warning yellow → var(--color-corthex-warning)
// Line 750
style={{ color: '#f87171' }}                    // error red → var(--color-corthex-error)
// Line 759
style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
// Line 790
style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
// Lines 926, 933, 1054, 1061
style={{ color: s.isActive ? '#fbbf24' : 'var(--color-corthex-accent)' }}  (×2 for schedules and triggers)
style={{ color: '#f87171' }}  (×2)
```
These are the schedule/trigger toggle buttons and error message styling. With `--color-corthex-warning-muted` and `--color-corthex-error-muted` now available in themes.css, all these should be converted:
- `#fbbf24` → `var(--color-corthex-warning)`
- `rgba(245,158,11,0.1)` → `var(--color-corthex-warning-muted)`
- `#f87171` → `var(--color-corthex-error)`
- `rgba(239,68,68,0.08)` → `var(--color-corthex-error-muted)`

**[ISSUE 3 — HIGH] Chain step border hardcoded olive hex (line 1130) — NOT FIXED**
```tsx
style={{ borderColor: '#606C3880' }}
```
`#606C38` is from the v1 Natural Organic theme (olive green). Completely wrong in the Command theme. Should be `var(--color-corthex-accent-muted)` or `var(--color-corthex-border)`.

**[ISSUE 4 — LOW] Delete confirmation button raw Tailwind (line 1239)**
```tsx
className="bg-red-600 hover:bg-red-700 text-white ..."
```
→ Should be `bg-corthex-error hover:bg-corthex-error-deep` (or inline style equivalent).

---

## File 5: `packages/app/src/styles/themes.css`
**Score: 10/10** (was 9/10)

### Verified Fix
- ✅ All 4 muted semantic tokens correctly added to all 3 themes
- ✅ Ordering is consistent: `success` / `success-muted` / `warning` / `warning-muted` / `error` / `error-muted` / `info` / `info-muted`
- ✅ Alpha values are hex (19 = 10%) consistent with existing `accent-muted` pattern

**No remaining issues.** Theme token system is now complete.

---

## File 6: `packages/app/src/index.css`
**Score: 9/10** (was 8/10)

### Verified Fix
- ✅ `body { font-family: var(--font-body, 'DM Sans', 'Inter', sans-serif); }` correctly added with fallback

### Remaining Issue

**[ISSUE 1 — LOW] No `code, pre { font-family: var(--font-mono) }` baseline**
Soul preview panels render markdown/text content. Without a baseline mono rule, rendered `<code>` tags in soul previews fall back to browser default rather than JetBrains Mono. Minor, but inconsistent with DESIGN.md "Code/Numbers: JetBrains Mono always".

---

## Remaining Violations by Priority

| Priority | File | Issue | Fix Available |
|----------|------|-------|---------------|
| P1 | jobs.tsx | `STATUS_STYLES` raw Tailwind + olive shadow bug (3 violations) | Convert to inline style objects |
| P1 | jobs.tsx | 8 inline hardcoded hex values (lines 666–1061) | Use `--color-corthex-warning/error/warning-muted/error-muted` |
| P1 | dashboard.tsx | `eventTypeColor` raw Tailwind (4 violations) | Use `text-corthex-{info,success,warning,error}` |
| P1 | dashboard.tsx | Memory + NEXUS health matrix bars `from-blue-500`, `from-green-500` | Inline style with CSS vars |
| P1 | agents.tsx | Soul chip hardcoded rgba/hex | Now has `*-muted` tokens to use — fix is unblocked |
| P2 | jobs.tsx | Chain border `#606C3880` (v1 olive) | `var(--color-corthex-accent-muted)` |
| P2 | dashboard.tsx | Status dot `bg-green-500 shadow-[0_0_8px_#22C55E]` + `text-green-500` | `bg-corthex-success` etc. |
| P2 | dashboard.tsx | Stat card ONLINE/IDLE badges raw Tailwind | Inline CSS var styles |
| P2 | dashboard.tsx | Agent table status dots `bg-green-500`, `bg-red-500` | `bg-corthex-success`, `bg-corthex-error` |
| P2 | dashboard.tsx | `font-sans` on root div overrides `body` rule | Remove or change to `font-body` |
| P2 | agents.tsx | Delete button `bg-red-600 hover:bg-[#b91c1c]` | `bg-corthex-error` + hover token |
| P3 | jobs.tsx | Delete confirm `bg-red-600 hover:bg-red-700` | `bg-corthex-error` |
| P3 | agents.tsx | Status color logic hardcoded `#4d7c0f`, `#dc2626` | `var(--color-corthex-accent-deep/error)` |

**Progress from Cycle 1:** 4/17 critical issues resolved (24%). themes.css is now complete. getStatusBadge() and PROVIDER_COLORS fully fixed.
