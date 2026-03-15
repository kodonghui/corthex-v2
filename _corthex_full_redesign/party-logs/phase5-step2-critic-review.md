# Phase 5-2 Critic Review: App Stitch Prompt
**Date:** 2026-03-15
**Artifact:** `phase-5-prompts/app-stitch-prompt.md` v1.0
**Method:** Combined 3-Critic Panel

---

## Critic-A: UX + Brand Alignment

### Strengths
1. **6 screens match the 5-tab app structure.** Hub, Chat, NEXUS, Jobs, You — plus the Shell/Tab Bar as a separate screen. All tabs from Phase 2-2 Option A covered.
2. **Hub screen is a STATUS DASHBOARD**, not a terminal. Explicitly called out multiple times. Matches Phase 2 winner.
3. **Secretary card with amber tint** signals priority agent — aligns with Phase 2-2 "Hub-first" principle.
4. **Chat bubbles use rounded corners with avatar-adjacent flat corner** (rounded-tl-sm for agent, rounded-tr-sm for user) — a polished mobile messaging pattern.
5. **You/Profile screen** provides a natural entry point to management features that don't have dedicated tabs.

### Issues Found
1. **[MINOR] Agent list screen not included as a separate prompt.** The You screen links to "에이전트 관리" but no dedicated agent list screen prompt is provided. This is acceptable since it can reuse the web agent card pattern adapted to mobile.

### Critic-A Score: **8.4/10**

---

## Critic-B: Visual + A11y

### Strengths
1. **Touch targets explicitly documented** in the global system block — 44x44pt minimum. Tab bar items are 78x49pt.
2. **Safe areas documented** — top (59px) and bottom (34px) insets for iPhone 14 Pro. Tab bar accounts for bottom safe area.
3. **backdrop-filter fallback** specified for tab bar — `@supports` fallback to solid background.
4. **Status dot secondary indicators maintained** — same pattern as web (checkmark, X, pulse, ring).
5. **Input bar above tab bar** — positioned correctly in the visual hierarchy.
6. **Tab labels are Latin-only** ("Hub", "Chat", "NEXUS", "Jobs", "You") — correctly noted as not needing Korean at 10px.

### Issues Found
1. **[MINOR] prefers-reduced-motion not explicitly mentioned** in app prompts. The global design system from Phase 3 covers this, but a note in the Stitch prompt would be helpful for the user generating screens.
2. **[INFO] Chat input rounded-full style** is different from web's rectangular textarea. This is intentional (mobile messaging convention) and correctly specified.

### Critic-B Score: **8.5/10**

---

## Critic-C: Tech + Perf

### Strengths
1. **Capacitor integration notes comprehensive.** 7 Capacitor plugins listed with specific use cases. iOS 15+ and Android 12+ targets specified.
2. **Hand-coded components clearly listed** — 7 items that Stitch should not generate.
3. **React Flow mobile limits specified** — maximum 50 nodes (performance constraint from Phase 2-2).
4. **FAB sizing at 56pt** exceeds the 44pt minimum touch target.
5. **Tab persistence strategy** referenced from component strategy — `display:none` toggle, not unmount/remount.
6. **Segment control pattern** in Jobs screen — standard mobile UI, Stitch-safe.

### Issues Found
1. **[MINOR] Bundle budget not restated** in the prompt. Phase 3 specifies <150KB gzipped initial bundle. Adding a note would help Phase 7 integration verify compliance.
2. **[INFO] Haptics mentioned in Capacitor notes** but not in individual screen prompts. This is fine — haptics are implementation details, not visual.

### Critic-C Score: **8.3/10**

---

## Consolidated Score

| Critic | Score |
|--------|-------|
| Critic-A | 8.4 |
| Critic-B | 8.5 |
| Critic-C | 8.3 |
| **Average** | **8.40/10** |

**Status: PASS** (threshold 7.0)

---

## Fixes Applied

### Fix 1: Reduced motion note (Critic-B #1)
Added to global design system block: "MOTION: All animations must include @media (prefers-reduced-motion: reduce) override. See Phase 3 design tokens for exact rules."

### Fix 2: Bundle budget note (Critic-C #1)
Added to Capacitor integration notes: "Bundle budget: Initial app bundle must be <150KB gzipped. TTI target: <3s on mid-range Android."

---

## Post-Fix Score: **8.5/10** (PASS)
