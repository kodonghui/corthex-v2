# Phase 0-2 Critic-C Review (Tech+Perf)

**Reviewer:** Amelia (Frontend Dev) + Bob (Performance)
**Model:** opus | **Round:** 1

## Findings

### Issue 1 (Amelia): Font loading strategy not addressed
- Geist + Pretendard + JetBrains Mono = 3 font families
- Pretendard Korean subsets are large (~300-500KB for all weights)
- Need font-display strategy (swap? optional? block?)
- Need preload for critical fonts
- **Severity:** Medium — affects LCP and FOUT/FOIT

### Issue 2 (Bob): Motion budget is excellent and conservative
- 150ms-300ms transitions, no parallax/particles — perfect for B2B
- Spring easing for toast — need to specify what CSS implementation (framer-motion spring? CSS?)
- **Severity:** Low

### Issue 3 (Amelia): Sidebar 64px/240px matches existing code
- Verified: this is implementable with `transition-[width] duration-200`
- Concern: at 64px collapsed, icon-only nav may have Fitts's Law issues on some monitors
- Recommend minimum icon target 40x40px within 64px rail
- **Severity:** Low

### Issue 4 (Amelia): Design Masters / Design Movements referenced correctly
- Rams' 10 principles applied with CORTHEX-specific examples — good
- Swiss International Style + Dark Tech UI + selective Glassmorphism — well-justified combination
- Muller-Brockmann grid philosophy referenced but not deeply applied (just "12-column grid")
- **Severity:** Low — Phase 3 will operationalize the grid

## Score: 8.5/10
Technically sound. Font loading is the main gap — important for performance but solvable.
