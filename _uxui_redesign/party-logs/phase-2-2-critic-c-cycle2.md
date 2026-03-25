# Phase 2-2 Cycle 2 — CRITIC-C Re-review
## Technical Reality (Brief Update)

**Date:** 2026-03-25
**Cycle:** 2 (post-fix)
**Files verified:** phase-2-2-fixes.md, themes.css, index.css, design-tokens.md

---

## Fix Verification (My Cycle 1 Issues)

| My Issue | Fix Applied | Status |
|----------|-------------|--------|
| TC-1: rgba() in @theme breaks Tailwind v4 | Fix 4 — all rgba→8-digit hex | ✅ CONFIRMED |
| TC-2: Command declared twice (double maintenance) | Fix 9 — @theme stripped of color tokens | ✅ CONFIRMED |
| TC-3: border doc value mismatch (#292524 vs #44403C) | design-tokens.md updated | ✅ CONFIRMED |
| TS-3: Studio text-on-accent #FFFFFF WCAG fail | Fix 5 — #164E63 applied in themes.css | ✅ CONFIRMED |
| TS-4: sidebar-brand undocumented | Added to design-tokens.md | ✅ CONFIRMED |
| TO-1: Missing --color-corthex-cta | Fix 6 — token added to Corporate block | ✅ CONFIRMED |
| TO-2: Corporate accent-hover = info (#3B82F6) | Fix 2 — accent-hover → #60A5FA | ✅ CONFIRMED |
| Finding 2: @layer/dark: utility conflict undocumented | Comment added to top of themes.css | ✅ CONFIRMED |
| TS-1: color-scheme: light + dark sidebar | Not addressed — deferred | ⏸ DEFERRED |
| TS-2: 910KB font load | Fix 10 — documented + Phase 4 deferred | 📄 DOCUMENTED |

---

## Remaining Issues After Fixes

**[R-1] MEDIUM — Command --shadow-md/lg/xl still invisible on dark bg (partial fix)**

Fix 7 only overrides `--shadow-sm`. `--shadow-md/lg/xl` are still the shared `:root` drop-shadows (`rgba(0,0,0,0.1–0.15)`) — completely invisible on Command's `#0C0A09` surface. Cards with `--shadow-md` or modals with `--shadow-xl` will still render flat in Command. Fix log explicitly defers this to Phase 3 component work. Acceptable as a documented deferral, but must be tracked.

**[R-2] MEDIUM — Studio text-disabled (#67E8F9) is now MORE invisible after bg neutralization**

Fix 1 changed Studio bg from `#ECFEFF` → `#F9FAFB` (correct for chromatic fatigue). But `--color-corthex-text-disabled: #67E8F9` was not updated. The lighter cyan (`#67E8F9`) against the now more neutral `#F9FAFB` yields approximately **1.2:1** contrast — slightly worse than before. Disabled form fields, labels, and placeholder text will be effectively invisible. This was a Medium issue in Cycle 1 that the bg neutralization quietly worsened.

**[R-3] LOW — Studio border-strong (#67E8F9) is cyan on neutral bg (consistency gap)**

With `--color-corthex-bg` now `#F9FAFB` (neutral gray-white), the `--color-corthex-border-strong: #67E8F9` (saturated cyan-300) creates an inconsistency: the app background is now neutral, but "strong" borders will suddenly pop as distinctly cyan. The regular border (#E5E7EB, neutral gray) was correctly neutralized; border-strong was not. Minor but visible in side-by-side border contexts.

**[R-4] LOW — :root shadow tokens in design-tokens.md still show rgba()**

design-tokens.md "Shared non-@theme tokens" section documents:
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
```

Fix 4's verification checklist confirmed 0 rgba() in `themes.css` and `index.css` — but didn't check the file where these `:root` shadow tokens actually live (likely `ui/theme.css` or similar). If they're defined with `rgba()` in an unchecked file, they'd be unresolved. Low risk since shadows are CSS `box-shadow` values where rgba() is standard and doesn't interact with Tailwind's opacity modifier system — but worth verifying the source file.

---

## Score Update

| Theme | Cycle 1 | Cycle 2 | Delta |
|-------|---------|---------|-------|
| Command | 7/10 | **8/10** | +1 — rgba fixed, double-declaration removed, accent-hover collision fixed |
| Studio | 6/10 | **7/10** | +1 — bg neutralized, text-on-accent WCAG fixed; color-scheme/sidebar deferred |
| Corporate | 7/10 | **8/10** | +1 — CTA token added, accent-hover/info separated, handoff unified |
| **Overall** | 7/10 | **8/10** | All P0/P1 issues resolved. 2 medium + 2 low remain |

---

## Assessment

All P0 and P1 blocking issues are confirmed fixed in production files. The remaining items are Medium/Low with a clear Phase 3 deferral path (shadow scale) or acceptable scope (font loading documented). **Phase 3 can proceed.**

One active watch item: Studio text-disabled (#67E8F9) contrast should be corrected before component implementation touches Studio disabled states — otherwise this will be baked into 125 Stitch screens.
