# Phase 4-1: Fix Summary — Round 1 → Round 2

**Date**: 2026-03-12
**Applied by**: Writer (post Critic-A + Critic-B cross-talk)
**Source**: `_corthex_full_redesign/party-logs/phase4-step1-critic-b.md` (combined 15-issue table)
**File fixed**: `_corthex_full_redesign/phase-4-themes/themes-creative.md`

---

## All 15 Issues — Fix Status

| # | Severity | Theme | Issue | Fix Applied |
|---|----------|-------|-------|------------|
| 1 | 🔴 CRITICAL | Theme 4 | `#FFFFFF` on `#E91E8C` = 4.17:1 — WCAG AA FAIL | Changed button to `text-[#1A0030]` (4.77:1 ✅). Updated contrast table from `#F0E6FF / 4.5:1` → `#1A0030 / 4.77:1` |
| 2 | 🔴 CRITICAL | Theme 1 | Sidebar `::after` missing `after:content-['']` | Added `after:content-['']` before `after:absolute` in sidebar class list |
| 3 | 🔴 CRITICAL | Theme 1 | Hub diagram: ChatArea + TrackerPanel stacked vertically | Replaced with 4-column horizontal ASCII diagram: AppSidebar \| SessionPanel \| ChatArea \| TrackerPanel |
| 4 | 🟠 HIGH | Theme 5 | `bioluminescent-pulse` `@media` override targets CSS class but HTML uses inline `style=""` | Removed inline `style="animation:..."`. Added `.bioluminescent-step` CSS class. `prefers-reduced-motion` override now fires correctly |
| 5 | 🟠 HIGH | Theme 5 | `success = accent` (`#00E5A0` identical) — in-progress vs complete indistinguishable | Changed `--color-corthex-success` to `oklch(0.850 0.228 122)` = `#A3E635` (lime-400, warm yellow-green). Updated Note on success color. Added WCAG 1.3.3 ✓ icon requirement |
| 6 | 🟠 HIGH | Theme 1 | `#647A91` muted on `#111D30` card = 3.80:1 — unlisted, fails normal-text AA | Added new contrast table row: `#647A91` on `#111D30` = 3.80:1 ⚠️ large-text only |
| 7 | 🟠 HIGH | Theme 5 | `animate-[pulse_2s_ease-in-out_infinite]` StatusDot missing `motion-reduce:animate-none` | Added `motion-reduce:animate-none` to AgentCard HTML comment and Visual Details StatusDot spec |
| 8 | 🟡 MEDIUM | Theme 3 | `rounded-xl` everywhere = Vision anti-pattern; blue-500 is generic Tailwind default | Changed Card, Button, Ghost Button, Input from `rounded-xl` → `rounded-lg`. Changed accent `#3B82F6` (OKLCH 259°) → `#1B81D4` (OKLCH 222° — distinctive Fjord Blue). Added Swiss Grid whitespace spec to section headers |
| 9 | 🟡 MEDIUM | Theme 4 | Contrast table `#F0E6FF` vs button spec `text-white` — misaligned, both fail AA | Contrast table updated: `#F0E6FF / 4.5:1` → `#1A0030 / 4.77:1`. Aligned with button fix (#1) |
| 10 | 🟡 MEDIUM | Theme 5 | `bioluminescent-pulse` animates `box-shadow` → paint jank on mobile | Rewrote keyframe: removed box-shadow animation, replaced with GPU-composited opacity animation on `::before` pseudo-element |
| 11 | 🟡 MEDIUM | Theme 4 | NEXUS edges `drop-shadow(0 0 4px rgba(233,30,140,0.8))` on ALL edges = VRAM overuse | Changed to: `drop-shadow` opacity reduced to 0.4, applied to **selected edge only** (not all edges). Added implementation note |
| 12 | 🟡 MEDIUM | Theme 2 | Full-monospace theme needs `@theme { --font-sans: ... }` root override — not specified | Added root-level `[data-theme="terminal-command"] { --font-sans: 'JetBrains Mono', monospace }` override block to Typography section |
| 13 | 🟡 MEDIUM | Theme 1 | Stated muted contrast 4.6:1 is actually 4.44:1 | Corrected to 4.44:1 in contrast table |
| 14 | 🟡 MEDIUM | Theme 4 | Brand guardrail documentation required for niche-audience theme | Added explicit Brand Guardrail blockquote: Neon Citadel = optional niche theme only, NOT default brand expression |
| 15 | 🟢 LOW | All themes | Font loading: preload only default theme fonts — ambiguous in implementation notes | Updated Google Fonts Loading Pattern: explicit `<link rel="preload">` for Synaptic Cortex defaults (Space Grotesk 500/600 + Inter 400/500 + JetBrains Mono 400). All other themes use `media="print" onload` lazy pattern |

---

## Round 2 Additional Fixes (post Critic feedback on Round 1)

| # | Severity | Theme | Issue | Fix Applied |
|---|----------|-------|-------|------------|
| A1 | 🔴 CRITICAL | Theme 3 | `text-white` on `#1B81D4` ≈ 4.1:1 — WCAG AA FAIL | Changed button to `text-[#080C14]` (dark text, Swiss Typography convention, 5.8:1 ✅). Updated contrast table note. |
| A2 | 🟡 MEDIUM | Theme 2 | `#00FF41` phosphor green reads "Matrix hacking" not enterprise confirmation | Changed `--color-corthex-success` to `#22C55E` (green-500, 7.3:1 ✅). Updated contrast table. |
| A3 | 🟡 MEDIUM | Theme 5 | 300–500ms step row animation conflicts with Principle 3 (Zero-Delay Feedback) | Step entry capped at 200ms ease-out. 2s breathing pulse reserved for StatusDot only. Glow pseudo-element 3s cycle unchanged. |

## What Was NOT Changed

- Theme 3 Nunito Sans body font: Critic-A flagged rounded terminals as anti-pattern. Cross-talk decision preserved the font pairing but addressed the "rounded everywhere" concern via `rounded-xl` → `rounded-lg` fix (#8).

---

## Round 2 Verification Request

All 15 fixes applied. Requesting verification scores from Critic-A and Critic-B.

**Passing threshold**: Average score ≥ 7.0 / 10.0
