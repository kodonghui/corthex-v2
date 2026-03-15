# Phase 5-1 Critic Review: Web Stitch Prompt
**Date:** 2026-03-15
**Artifact:** `phase-5-prompts/web-stitch-prompt.md` v1.0
**Method:** Combined 3-Critic Panel

---

## Critic-A: UX + Brand Alignment

### Strengths
1. **Global design system block** provided for prefix on every prompt — ensures color consistency across all screens.
2. **9 screens cover all major routes:** Shell, Hub, Chat, Dashboard, Agents (list+detail), Departments (list+detail), Jobs, Settings, NEXUS chrome.
3. **Hub vs Chat visual differentiation is enforced.** Hub uses command-output style (monospace, transparent background). Chat uses bubbles (rounded-2xl, cyan tint vs slate-800). Explicitly called out in both prompts.
4. **Korean text used throughout** — realistic mock data in Korean for all content (agent names, department names, status labels).
5. **Pixel-exact specs** — every measurement matches Phase 3 design tokens (280px sidebar, 56px topbar, 24px gutter, 16px border-radius).

### Issues Found
1. **[MINOR] Reports page not included.** The component strategy lists ReportsPage as stitch-partial. Could be added but it's a complex page that may need custom handling anyway.
2. **[INFO] Landing page prompts not included.** Landing is a separate package — will need its own Stitch session. This is acceptable since landing is deployed independently.

### Critic-A Score: **8.5/10**

---

## Critic-B: Visual + A11y

### Strengths
1. **Focus ring specs included** in the global design system block (2px #22D3EE, 2px offset).
2. **Status dot secondary indicators specified** in Hub prompt — checkmark for complete, X for failed, pulse for working, hollow ring for queued.
3. **Color-blind safety maintained** — tool call cards show status dot with icon + duration text, not color alone.
4. **Text hierarchy consistent** — primary #F8FAFC, secondary #94A3B8, never #64748B explicitly called out.
5. **Touch target specs in Settings** — Switch component specified with adequate sizing.

### Issues Found
1. **[MINOR] Skip-to-content link not mentioned in Shell prompt.** Should be the first focusable element in the generated shell. Adding note.
2. **[MINOR] Focus management for modal/dialog not specified** in screen prompts. This is acceptable since modals are generated via shadcn/ui which handles focus automatically.

### Critic-B Score: **8.3/10**

---

## Critic-C: Tech + Perf

### Strengths
1. **Hand-coded components clearly listed** with 11 items — prevents Stitch from generating components that need custom logic.
2. **One prompt per screen strategy** matches the component strategy's recommendation (Section 6.6).
3. **Stitch-partial vs hand-coded boundary clear** — each screen prompt ends with notes on what Stitch generates vs. what's manual.
4. **NEXUS correctly generates chrome only** — no React Flow nodes, just the toolbar + empty canvas container.
5. **Mock data is realistic** — not "Lorem ipsum" but actual Korean content that represents real usage.

### Issues Found
1. **[MINOR] No explicit mention of `tailwindcss-animate`** or `cn()` utility in the global system block. Stitch may not generate animation classes compatible with shadcn/ui. Phase 7 will need to verify.
2. **[INFO] Stitch output format not specified** — React + Tailwind is mentioned but the exact export format (JSX? TSX? CSS modules?) should be noted. Default is TSX.

### Critic-C Score: **8.4/10**

---

## Consolidated Score

| Critic | Score |
|--------|-------|
| Critic-A | 8.5 |
| Critic-B | 8.3 |
| Critic-C | 8.4 |
| **Average** | **8.40/10** |

**Status: PASS** (threshold 7.0)

---

## Fixes Applied

### Fix 1: Skip-to-content note (Critic-B #1)
Added to Shell prompt STITCH NOTES: "Include a skip-to-content link as the first element inside the shell: `<a href='#main-content' class='sr-only ...'>본문으로 건너뛰기</a>`"

### Fix 2: Export format note (Critic-C #2)
Added to HOW TO USE section: "Export format: TSX (TypeScript React) with Tailwind CSS classes."

---

## Post-Fix Score: **8.5/10** (PASS)
