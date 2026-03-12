# Context Snapshot — Phase 1, Step 1-2: App Mobile Layout Research

**Date**: 2026-03-12
**Score**: 8.65/10 (Critic-A: 8.3/10, Critic-B: 9.0/10) — PASS
**Output file**: `_corthex_full_redesign/phase-1-research/app/app-layout-research.md` (~1010 lines)
**Rounds**: 2 (Round 1 → 10 issues → Round 2 all fixed)
**Note**: Critics initially reviewed wrong file (old desktop SPA). Corrected after clarification. Team-lead confirmed: Step 1-1 covers desktop App SPA; this file covers mobile/Stitch only.

---

## Key Decisions & Facts Established

### Mobile App Scope
- Target: Google Stitch generation → native-like mobile app (iOS + Android)
- NOT a responsive version of web dashboard — fully separate design
- Users: CEO (김대표) / employees on mobile
- Viewport: 390–430px portrait primary
- Navigation: Bottom tab bar (NOT sidebar)
- `pb-[env(safe-area-inset-bottom)]` requires `@theme { --spacing-safe: env(safe-area-inset-bottom) }` in `index.css` — NOT built into Tailwind CSS 4

### Google Stitch Capabilities (confirmed)
| Can generate | Cannot generate |
|---|---|
| Bottom tab nav, cards, chat bubbles, forms | ReactFlow canvas, multi-screen coherent flows |
| Dark/light modes, modals, empty states | Design system tokens, drag-and-drop |
| Simple KPI dashboards, notification lists | Real-time streaming UI (SSE/WebSocket) |

### 8 Reference Products Analyzed
| Product | Key pattern for CORTHEX |
|---|---|
| ChatGPT mobile | Date-grouped session list → Hub home |
| Gemini app | Always-visible input bar, drawer nav |
| Slack 2025 | Priority bubbling, section collapse, badge inheritance |
| Notion mobile | Full feature parity on mobile |
| Teams mobile | 4-tab model, agent @mention in-context |
| Material Design 3 | 4-tab active=icon+label, inactive=icon only; 80dp min tab width |
| Apple HIG 2025 | 44×44pt min touch target; 34pt bottom safe area; max 5 tabs |
| Google Stitch | Screen-by-screen generation; 1-2 screens per session for coherence |

### TOP 3 Mobile Layout Options

**Option A: 4-Tab Command Center (Recommended for 김대표)**
- Tabs: `🔗허브 | 📈대시 | 🔍NEXUS | ⋯More`
- Hub = Tab 1, always 1 tap
- Tracker: expandable strip `h-12` compact → `h-48` expanded, above input bar
- Active session row: `h-18` with pulsing indigo dot (`animate-pulse motion-reduce:animate-none`)
- P2/P3 in More tab grid

**Option B: Hub-First Drawer Navigation (Gemini-inspired)**
- Input bar always visible on every screen
- Hamburger drawer for all features (27+ items, `운영` section collapsible)
- Tracker: `h-12` compact strip conditionally visible above input bar
- Drawer slide-in: `transition-transform duration-250 ease-in-out motion-reduce:transition-none`

**Option C: Adaptive 5-Tab**
- Tabs: `🔗Hub | 📈대시 | 🔍NEXUS | 📄라이브러리 | 🔔알림`
- Max 5 tabs (MD3 maximum)
- ⚠️ At 390px: 78px per tab — 2dp below MD3 minimum 80dp. Full compliance requires ≥430px device
- Notification as dedicated tab 5 = maximum badge prominence

### Critical ARIA Specs (all options)
```tsx
// Tab bar
<div role="tablist" aria-label="Main navigation" className="flex h-14">
  <button role="tab" aria-selected={active === tab.id} ...>

// Tracker strip
<div role="status" aria-atomic="false" aria-label="Agent delegation tracker">
// Note: role="status" implies aria-live="polite" — do NOT add redundant aria-live
// aria-atomic="false" = announce only changed step (not full chain) on each SSE update

// Navigation drawer (Option B)
<div role="dialog" aria-label="Navigation" aria-modal="true">
```

### Touch Target Verification
| Element | Spec | CORTHEX value |
|---|---|---|
| Tab items | 44pt / 48dp | ~97pt at 390px (4-tab) ✅ |
| Tracker compact strip | 44pt | h-12 = 48px ✅ |
| Chat send button | 44×44pt | 48×48pt ✅ |
| Session rows | 44pt height | h-16 = 64px ✅ |

### Unique CORTHEX Mobile Pattern
Tracker strip above input bar: no reference product has this. Surfaces live AI delegation chain (비서실장 → CIO (D2) → 전문가 (D3) ●) without hiding chat. Compact `h-12` → expanded `h-48` on tap. This is the product's core mobile differentiator.

---

## Issues Fixed (10 total)
1. Option A tab bar: added `role="tablist"` + `role="tab"` on buttons
2. Option C inner div: added `role="tablist"`
3. Option B Tracker: `h-10` → `h-12` (below 44pt touch target)
4. `pb-safe` → `pb-[env(safe-area-inset-bottom)]` in all 3 options + Constraints table note
5. Removed fabricated `developers.openai.com` URL → `chatgpt.com`
6. Removed broken `bricxlabs.com/blogs/message-screen-ui-deisgn`
7. `role="status" aria-live="polite"` → `role="status" aria-atomic="false"` (removed redundant aria-live)
8. Option A: added `animate-pulse motion-reduce:animate-none` session dot code
9. Option C: added independent Tracker code block (h-12/h-48 full spec)
10. Option C cons: added ⚠️ MD3 78px < 80dp tab width violation with device guidance
- Bonus: Removed `slack.com/blog/news/redesigning-slack-ios26` (unverifiable); replaced `almcorp.com` with `stitch.withgoogle.com`; added Option B drawer slide-in animation

---

## Pipeline Note
- Desktop App SPA layout research: CONFIRMED NOT NEEDED — Step 1-1 covers desktop `packages/app` SPA layout
- Step 1-2 = mobile/Stitch ONLY (team-lead confirmed)

---

## Next Step
Phase 1-3: Landing Page Research (waiting for team-lead instruction)
