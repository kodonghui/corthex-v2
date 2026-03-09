# Party Mode Round 1 — Collaborative Lens
## Pages: 35-agent-marketplace, 36-soul-templates, 37-report-lines, 38-api-keys

### Expert Panel Review

**Sally (UX Designer):** These specs are well-structured with clear component hierarchies. I appreciate the consistent modal overlay pattern (`bg-black/60 backdrop-blur-sm`) across all 4 pages — that's great for user familiarity. The API key page's KeyDisplayModal deliberately preventing overlay click-dismiss is a smart security UX decision. However, I notice the search input on page 35 doesn't mention debounce timing — the interaction spec says "debounced" but no ms value. Also, the empty states on pages 35 and 38 mention SVG icons but don't specify which icon to use.

**Winston (Architect):** The design system token usage is consistent — slate-800/50 for cards, slate-700 for borders, blue-600/500 for primary actions. Good alignment with the pipeline's design system foundation. One concern: page 37 currently imports `Card, CardContent, Badge, Button, Skeleton` from `@corthex/ui`, but the spec doesn't mention whether to keep using these shared components or replace with raw Tailwind. The coder needs to know.

**Amelia (Developer):** The Tailwind classes are precise and implementable. I can code these directly. Two items: (1) Page 35's filter bar uses `flex-col sm:flex-row` which is good for mobile, but pages 36-38 don't have similar responsive adjustments in their header areas. (2) Page 38's `[color-scheme:dark]` for datetime-local input is a nice touch — ensures the browser's date picker renders in dark mode.

**John (PM):** All existing functionality is preserved — no features added or removed. The specs correctly describe what's in the v2 codebase today. Good adherence to the "only existing features" rule.

**Quinn (QA):** data-testid attributes are provided for major components but not comprehensively. For example, modals on page 36 (DeleteConfirmModal, PublishConfirmModal) don't have explicit data-testid values. Also, the edit mode card on page 36 (section 3.4) doesn't have a data-testid.

### Issues Found

| # | Severity | Page | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 35 | Search debounce timing not specified | Add "300ms debounce" to interaction spec |
| 2 | Minor | 35, 38 | Empty state SVG icons not specified (just HTML comments) | Specify Lucide icon names (Store, Key) |
| 3 | Medium | 37 | Unclear whether to keep @corthex/ui components or use raw Tailwind | Add note: replace with raw Tailwind for consistency |
| 4 | Minor | 36 | DeleteConfirmModal and PublishConfirmModal missing data-testid | Add data-testid values |
| 5 | Minor | All | No transition/animation spec for modals (fade-in) | Optional: mention fade-in if desired |

### Fixes Applied
- Issue 1: Added debounce timing to page 35
- Issue 3: Added note to page 37 about raw Tailwind
- Issue 4: Added data-testid to page 36 modals
