# CRITIC-C Report — Phase 4-2: CSS + Theme Consistency
**Role**: CSS & Theme Verification
**Date**: 2026-03-25
**Files reviewed**: dashboard.tsx, hub/index.tsx, agents.tsx, jobs.tsx, themes.css, index.css

---

## Scoring Summary

| File | Score | Status |
|------|-------|--------|
| dashboard.tsx | 5/10 | FAIL — multiple raw Tailwind colors + hardcoded PROVIDER_COLORS |
| hub/index.tsx | 8/10 | PASS — near-clean, minor issues only |
| agents.tsx | 6/10 | MARGINAL — hardcoded soul chip + status colors |
| jobs.tsx | 4/10 | FAIL — getStatusBadge() entirely hardcoded, STATUS_STYLES bypasses token system |
| themes.css | 9/10 | PASS — well-structured, minor gaps |
| index.css | 8/10 | PASS — clean @theme block, minor font-application gap |

**Overall Score: 5.5/10** — Theme switching is broken in dashboard.tsx and jobs.tsx. Needs fixes before production.

---

## File 1: `packages/app/src/pages/dashboard.tsx`
**Score: 5/10**

### Issues Found

**[ISSUE 1 — CRITICAL] PROVIDER_COLORS uses hardcoded hex (lines 31–35)**
```tsx
const PROVIDER_COLORS: Record<LLMProviderName, string> = {
  anthropic: '#8B5CF6',   // hardcoded purple
  openai: '#10B981',      // hardcoded green
  google: '#F59E0B',      // hardcoded amber
}
```
These are used for SVG chart strokes (line 153). With theme switching, these would remain static while everything else changes. Should map to chart series tokens from DESIGN.md:
- Series 4 (purple): `var(--color-corthex-handoff)` or a new `--color-corthex-series-4`
- Series 3 (green): `var(--color-corthex-success)`
- Series 5 (orange): `var(--color-corthex-warning)`

**[ISSUE 2 — HIGH] `eventTypeColor` uses raw Tailwind (lines 471–475)**
```tsx
const eventTypeColor: Record<string, string> = {
  INFO: 'text-blue-400',
  OKAY: 'text-green-500',
  WARN: 'text-yellow-500',
  FAIL: 'text-red-500',
}
```
Should be:
- INFO → `text-corthex-info`
- OKAY → `text-corthex-success`
- WARN → `text-corthex-warning`
- FAIL → `text-corthex-error`

**[ISSUE 3 — HIGH] System status dot uses hardcoded hex in shadow (line 485)**
```tsx
className={`... bg-green-500 animate-pulse shadow-[0_0_8px_#22C55E] ...`}
```
`#22C55E` is hardcoded. Also `bg-green-500` bypasses token. Should use:
```tsx
className={`... bg-corthex-success animate-pulse shadow-[0_0_8px_var(--color-corthex-success)] ...`}
```

**[ISSUE 4 — HIGH] System Health Matrix uses raw Tailwind gradient/color classes (lines 697–725)**
```tsx
className="h-full bg-gradient-to-r from-blue-500 to-blue-400"   // Budget bar
className="h-full bg-gradient-to-r from-green-500 to-green-400" // Tasks bar
className={`... bg-blue-500 ...`}  // dot indicators
className={`... bg-green-500 ...`} // dot indicators
```
These bars would not change on theme switch. Should use `--color-corthex-info` and `--color-corthex-success` via inline style.

**[ISSUE 5 — MEDIUM] ONLINE/WARNING status badges use raw Tailwind (lines 507–530)**
```tsx
<span className="bg-green-500/10 text-green-500 ... border border-green-500/20">ONLINE</span>
<span className="bg-yellow-500/10 text-yellow-500 ... border border-yellow-500/20">
```
Should use `--color-corthex-success` / `--color-corthex-warning` via inline style (Tailwind /opacity modifiers don't work on CSS vars).

**[ISSUE 6 — MEDIUM] `font-sans` at root div (line 478)**
```tsx
<div className="bg-corthex-bg min-h-screen font-sans text-corthex-text-primary antialiased">
```
`font-sans` maps to system default, not `--font-body` (DM Sans). Should be `font-body` to match DESIGN.md rule: "All text: DM Sans".

---

## File 2: `packages/app/src/pages/hub/index.tsx`
**Score: 8/10**

### Issues Found

**[ISSUE 1 — MEDIUM] Inline counts in welcome subtitle lack font-mono (line ~287)**
```tsx
<p className="mt-1" style={{ color: 'var(--color-corthex-text-secondary)' }}>
  {companyName} · {activeAgents.length}/{allAgents.length} agents operational
</p>
```
DESIGN.md rule: "Numbers/costs: JetBrains Mono always". The `N/N` agent count should be wrapped with `font-mono` span. The Agent Status panel (line 464) correctly uses `font-mono` for the counter — inconsistency within the same file.

**[ISSUE 2 — LOW] Loading spinner uses inline CSS vars correctly but missing font-mono on "허브 로딩 중..." (lines 164–166)**
```tsx
<p className="text-sm" style={{ color: 'var(--color-corthex-text-secondary)' }}>
  허브 로딩 중...
</p>
```
Minor: no explicit `font-body` class (implicitly inherits), acceptable.

### What's Working Well
- All colors exclusively via `var(--color-corthex-*)` inline styles — zero hardcoded hex
- Lucide React icons only (MessageSquare, Briefcase, Network, BarChart2, ChevronRight, History, RefreshCw, Bot)
- Theme switching would work correctly for all visible elements
- Spinner border/accent/text all use CSS vars correctly
- Agent status panel font-mono on the counter (line 464: `{activeAgents.length}/{allAgents.length} ONLINE`)

---

## File 3: `packages/app/src/pages/agents.tsx`
**Score: 6/10**

### Issues Found

**[ISSUE 1 — HIGH] Soul variable chips use hardcoded RGBA + hex (line 340)**
```tsx
style={{
  backgroundColor: v.category === 'personality' ? 'rgba(37,99,235,0.1)'   // hardcoded blue
                 : v.category === 'memory'       ? 'rgba(124,58,237,0.1)'  // hardcoded purple
                 : 'rgba(90,114,71,0.1)',                                   // hardcoded olive
  color: v.category === 'personality' ? '#2563eb'                          // hardcoded blue
       : v.category === 'memory'       ? '#7c3aed'                         // hardcoded purple
       : 'var(--color-corthex-accent)',                                     // correct only for this branch
}}
```
Should use CSS variable tokens. Missing tokens: a `--color-corthex-info-muted` and a `--color-corthex-handoff-muted` would solve this cleanly. Alternatively use existing tokens:
- personality → `--color-corthex-info-muted` / `--color-corthex-info`
- memory → `--color-corthex-handoff-muted` / `--color-corthex-handoff` (already exists)
- default → `--color-corthex-accent-muted` / `--color-corthex-accent`

**[ISSUE 2 — HIGH] Agent detail panel status color comparison uses hardcoded hex (line 493)**
```tsx
style={{ color: status.dot === 'bg-corthex-accent' ? '#4d7c0f'   // hardcoded dark gold
              : status.dot === 'bg-red-600'         ? '#dc2626'   // hardcoded red
              : 'var(--color-corthex-text-secondary)' }}
```
This logic compares a Tailwind class string to decide color — fragile and hardcoded. Should map to `--color-corthex-accent-deep` and `--color-corthex-error`.

**[ISSUE 3 — HIGH] Delete button uses hardcoded hover hex (line 504)**
```tsx
className="... bg-red-600 text-white hover:bg-[#b91c1c] ..."
```
`hover:bg-[#b91c1c]` is hardcoded. Should be `hover:bg-corthex-error` (or via `style={{ backgroundColor: ... }}`). Also `bg-red-600` should be `bg-corthex-error`.

**[ISSUE 4 — MEDIUM] Error/required field indicators use raw Tailwind (lines 225–228)**
```tsx
<span className="text-red-500">*</span>
{nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
```
Should use `text-corthex-error`. Theme `command` maps `--color-corthex-error: #EF4444` (which IS red-500 now, but won't survive theme changes where error color shifts).

### What's Working Well
- Tier badge styles use `bg-corthex-accent-muted`, `text-corthex-accent` etc. ✓
- Status config uses `bg-corthex-accent`, `bg-corthex-info`, `bg-corthex-text-secondary` ✓
- Lucide icons only ✓
- Form inputs use CSS var class names consistently ✓
- Soul preview pane uses `border-corthex-border`, `bg-corthex-bg` ✓

---

## File 4: `packages/app/src/pages/jobs.tsx`
**Score: 4/10**

### Issues Found

**[ISSUE 1 — CRITICAL] `getStatusBadge()` function is entirely hardcoded hex (lines 120–128)**
```tsx
function getStatusBadge(status: string): { bg: string; color: string; border: string; dot: string } {
  switch (status) {
    case 'processing': return { bg: 'rgba(59,130,246,0.1)',   color: '#60a5fa', border: 'rgba(59,130,246,0.25)', dot: '#60a5fa' }
    case 'completed':  return { bg: 'rgba(34,197,94,0.1)',    color: '#4ade80', border: 'rgba(34,197,94,0.25)',  dot: '#4ade80' }
    case 'failed':     return { bg: 'rgba(239,68,68,0.1)',    color: '#f87171', border: 'rgba(239,68,68,0.25)', dot: '#f87171' }
    case 'blocked':    return { bg: 'rgba(245,158,11,0.1)',   color: '#fbbf24', border: 'rgba(245,158,11,0.25)',dot: '#fbbf24' }
    default:           return { bg: 'rgba(120,113,108,0.12)', color: 'var(--color-corthex-text-secondary)', ... }
  }
}
```
This function is used across the job list rendering. **All theme switching is broken for job status badges.** Should be:
```tsx
case 'processing': return { bg: 'var(--color-corthex-info-muted)',    color: 'var(--color-corthex-info)',    ... }
case 'completed':  return { bg: 'var(--color-corthex-success-muted)', color: 'var(--color-corthex-success)', ... }
case 'failed':     return { bg: 'var(--color-corthex-error-muted)',   color: 'var(--color-corthex-error)',   ... }
case 'blocked':    return { bg: 'var(--color-corthex-warning-muted)', color: 'var(--color-corthex-warning)', ... }
```
Note: themes.css is missing `*-muted` variants for semantic colors (only `accent-muted` exists).

**[ISSUE 2 — HIGH] STATUS_STYLES uses raw Tailwind colors with glow shadows (lines 95–99)**
```tsx
processing: { dotClass: 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse', textClass: 'text-blue-600' },
completed:  { dotClass: 'bg-corthex-accent shadow-[0_0_8px_rgba(77,124,15,0.5)]', textClass: 'text-corthex-accent' },
failed:     { dotClass: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]', textClass: 'text-red-600' },
blocked:    { dotClass: 'bg-corthex-text-secondary', textClass: 'text-corthex-text-secondary' },
```
`bg-blue-500`, `text-blue-600`, `bg-red-500`, `text-red-600`, and all the `rgba()` shadow values are hardcoded. Also, `rgba(77,124,15,0.5)` on completed glow does NOT match `--color-corthex-accent` (#CA8A04 gold) — it's olive green, likely a copy-paste error.

**[ISSUE 3 — HIGH] Multiple inline style hardcoded hex values at various render points**
- Line 666: `style={{ color: '#fbbf24' }}` (warning yellow)
- Line 750: `style={{ color: '#f87171' }}` (error red)
- Line 759: `style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}`
- Line 790: `style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}`
- Lines 926, 933, 1054, 1061: `#fbbf24` and `#f87171` repeated for schedule/trigger toggle states
All should use `var(--color-corthex-warning)`, `var(--color-corthex-error)` etc.

**[ISSUE 4 — HIGH] Chain step border uses hardcoded olive hex (line 1130)**
```tsx
<div className="pl-4 border-l-2 space-y-2" style={{ borderColor: '#606C3880' }}>
```
`#606C38` is olive (from v1 Natural Organic theme). Should be `var(--color-corthex-border)` or `var(--color-corthex-accent-muted)`.

**[ISSUE 5 — MEDIUM] `font-mono` correctly used for IDs, durations, times** ✓ in jobs.tsx — this is good. But number fields in modals (price, schedule time) lack `font-mono` on their labels/values.

### What's Working Well
- Input/select class strings use corthex tokens ✓
- Tab and filter UI uses CSS vars consistently ✓
- TRIGGER_TYPE_LABELS, DAY_NAMES — pure strings, no color impact ✓

---

## File 5: `packages/app/src/styles/themes.css`
**Score: 9/10**

### Issues Found

**[ISSUE 1 — MEDIUM] No `*-muted` variants for semantic colors**
- `--color-corthex-accent-muted` exists (for accent), but there is NO equivalent for:
  - `--color-corthex-success-muted`
  - `--color-corthex-warning-muted`
  - `--color-corthex-error-muted`
  - `--color-corthex-info-muted`
  - `--color-corthex-handoff-muted`

This forces jobs.tsx and agents.tsx to hardcode `rgba()` values for semantic badge backgrounds — the root cause of ISSUE 1 in both files. Adding muted variants would enable proper token-based badge styling.

**[ISSUE 2 — LOW] `--font-mono` not defined in any theme block**
`--font-mono` is only defined in `index.css @theme`. It is not overridden per-theme (all 3 themes use JetBrains Mono, so this is fine). But it's semantically inconsistent that font-heading/font-body are in themes.css while font-mono is not.

### What's Working Well
- All 3 themes (command/studio/corporate) fully cover all tokens ✓
- Fix notes are well-documented in comments ✓
- `color-scheme` property set correctly per theme ✓
- Sidebar tokens fully parameterized per theme ✓
- rgba → hex alpha notation migration done (Fix 4 comments) ✓

---

## File 6: `packages/app/src/index.css`
**Score: 8/10**

### Issues Found

**[ISSUE 1 — MEDIUM] `--font-heading` and `--font-body` defined in `@theme` but never applied globally**
```css
@theme {
  --font-heading: 'DM Sans', 'Inter', sans-serif;
  --font-body: 'DM Sans', 'Inter', sans-serif;
}
```
There is no `body { font-family: var(--font-body); }` rule. Tailwind v4 generates `font-body`/`font-heading` utility classes from these, but they must be explicitly applied.

- `dashboard.tsx` uses `font-sans` (system default) instead of `font-body`
- `hub/index.tsx` relies on CSS inheritance for DM Sans
- No baseline applied to `html` or `body` element

DM Sans will only render if some ancestor has the class, which is inconsistent.

**[ISSUE 2 — LOW] Missing `font-mono` application on `code` and `pre` elements**
Global base styles don't set `pre, code { font-family: var(--font-mono); }`. This is fine for JSX usage (`className="font-mono"`) but could cause issues in rendered markdown/soul previews.

### What's Working Well
- Correct import order: tailwindcss → ui/theme.css → styles/themes.css ✓
- `@theme` holds only layout/typography/animation shared tokens ✓
- Keyframe animations are well-defined ✓
- Typography scale complete with line-height pairs ✓

---

## Cross-Cutting Themes

### Theme Switch Would Break In
1. **dashboard.tsx**: PROVIDER_COLORS chart bars, eventTypeColor log entries, status dots, health matrix bars
2. **jobs.tsx**: ALL status badges (getStatusBadge), ALL status dots (STATUS_STYLES), all inline hardcoded hex values
3. **agents.tsx**: Soul chip colors, delete button, error text

### Theme Switch Would Work In
1. **hub/index.tsx**: Fully correct — all CSS vars ✓
2. **dashboard.tsx** structural layout: bg/surface/border/text all correct

### Root Cause Pattern
Jobs.tsx has the most violations because `getStatusBadge()` was written as a pure function returning style objects — a pattern incompatible with CSS variable theming. Status semantics should be encoded as CSS class names or inline `var()` references, not hex strings.

### Missing Tokens (blocking full theme support)
The following tokens need to be added to all 3 theme blocks in `themes.css`:
```css
--color-corthex-success-muted: #22C55E19;
--color-corthex-warning-muted: #EAB30819;
--color-corthex-error-muted:   #EF444419;
--color-corthex-info-muted:    #3B82F619;
```

---

## Recommended Fix Priority

| Priority | File | Fix |
|----------|------|-----|
| P0 | jobs.tsx | Replace `getStatusBadge()` hardcoded hex with CSS vars |
| P0 | jobs.tsx | Replace STATUS_STYLES raw Tailwind + rgba shadows |
| P0 | themes.css | Add `*-muted` semantic tokens to all 3 themes |
| P1 | dashboard.tsx | Replace PROVIDER_COLORS with CSS var series tokens |
| P1 | dashboard.tsx | Replace `eventTypeColor` raw Tailwind with corthex vars |
| P1 | dashboard.tsx | Fix status dot `bg-green-500/bg-red-500` + `shadow-[0_0_8px_#22C55E]` |
| P1 | agents.tsx | Replace soul chip hardcoded rgba/hex with CSS vars |
| P2 | dashboard.tsx | Replace health matrix `from-blue-500`/`from-green-500` gradients |
| P2 | agents.tsx | Replace `bg-red-600/hover:bg-[#b91c1c]` with corthex-error |
| P2 | index.css | Add `body { font-family: var(--font-body); }` base rule |
| P3 | hub/index.tsx | Wrap inline `N/N` counts in font-mono span |
| P3 | jobs.tsx | Replace `#606C3880` chain border with CSS var |
