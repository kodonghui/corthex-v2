# Phase 3, Step 3-2 — Critic-A (UX & Brand) R2 Verification

**Reviewer:** ux-brand (Critic-A)
**Document:** `_uxui_redesign/phase-3-design-system/component-strategy.md` (R2)
**Date:** 2026-03-23
**R1 Score:** 7.5/10 (2 major, 4 minor)
**Fixes Claimed:** 19 total

---

## R1 Issue Verification

### M1. Destructive Hover `red-700` → RESOLVED ✅

**R1:** `destructive: 'bg-corthex-error text-white hover:bg-red-700'`
**R2:** `destructive: 'bg-corthex-error text-white hover:bg-corthex-error/90'`

Uses opacity modifier (darkened error on hover). API rule #1 updated: *"Opacity modifiers (`bg-corthex-error/90`) are acceptable."* This is the correct approach — stays within the token system while leveraging Tailwind v4's native color modifiers. No new token needed.

### M2. Missing Inverse Variant → RESOLVED ✅

**R1:** `inverse` mentioned in §4.5 but absent from CVA.
**R2:** Fully defined in CVA:
```tsx
inverse: 'bg-white/15 text-corthex-text-chrome hover:bg-white/25 focus-visible:ring-corthex-focus-chrome',
```

Plus three reinforcing additions:
1. **API rule #7:** Explicit mandate — components on `--bg-chrome` must use `variant="inverse"`
2. **§4.5 expanded note:** Dark-bg switching pattern — parent containers pass `variant="inverse"` to children, no CSS parent selector magic needed
3. **Variant mapping table:** Inverse row updated with full token spec

The switching pattern explanation is excellent: *"This is determined by render context, not a global dark mode. The pattern: parent chrome containers (sidebar, drawer) pass variant='inverse' to child interactive components."* This is explicit, testable, and avoids the CSS dark-mode class trap.

### m1. Link Variant Underline → RESOLVED ✅

**R1:** Hover-only underline contradicted Step 3-1 §1.8.
**R2:** `link: 'text-corthex-accent-secondary underline underline-offset-4 hover:text-corthex-accent'`

Always-visible underline with hover color change. API rule #12 documents the alignment explicitly. Matches Step 3-1 §1.8 exactly.

### m2. No Monospace Guidance → RESOLVED ✅

**R2 API rule #10:** *"Components displaying machine-readable data (agent IDs, costs, API endpoints, build numbers) must use `font-mono` class (JetBrains Mono). Badge, Input, and Table support `className="font-mono"` for this purpose."*

Clear, actionable, references the correct use cases from Step 3-1 §2.3.

### m3. Dialog Overlay Color → RESOLVED ✅

**R2 API rule #11:** *"Dialog/Drawer overlay: Use `bg-corthex-chrome/40` (olive-tinted translucent). Maintains Natural Organic warmth during modal interactions. Never use pure black overlay."*

The olive-tinted overlay maintains the brand warmth even during modal states. The "never pure black" prohibition is a strong brand guard.

### m4. "Controlled Nature" Framing → RESOLVED ✅

**R2 §1 opening:** *"CORTHEX's component architecture embodies the Ruler archetype's drive for order. The current three-system chaos (Subframe + @corthex/ui + Stitch) mirrors an organization without a clear chain of command — three dialects, none authoritative. The migration unifies these into a single system of components that speak the same visual language — one token system, one component API, one source of truth. This is 'Controlled Nature' applied to architecture: imposing structural precision on organic growth."*

Concise (4 sentences), anchors the entire document in brand purpose, connects chaos→order to Ruler archetype. Well crafted.

---

## Additional Fixes Observed (from other critics)

| # | Fix | Impact on Brand/UX |
|---|-----|-------------------|
| 1 | **TreeView ARIA warning** — detailed role="tree"/role="treeitem" requirements, arrow-key navigation, typeahead. References React Aria's useTreeView. | Significant a11y improvement. Shows care for screen reader experience — Sage archetype (understanding through structure). |
| 2 | **CommandPalette (cmdk) added** — P1, z-index 100, Phase 4-B.11 | The CEO's "voice" — Ruler archetype's command channel. Correct priority elevation. |
| 3 | **Migration checklist 12→15 steps** — added prefers-reduced-motion (#13), forced-colors (#14), touch targets (#15) | Three critical a11y gates that were missing. Aligns with Step 3-1 §5.4 and §3.5. |
| 4 | **`transition-all` → `transition-colors`** — API rule #8 + CVA base class updated | Prevents accidental width/height animation. Directly references Step 3-1 §5.1 Rule 3. |
| 5 | **Touch target h-10 → h-11** — default button 40px → 44px, icon 40px → 44px | WCAG AAA compliance. Step 3-1 §3.5 mandates 44px minimum. |
| 6 | **Radix version pinning note** — API rule #3 updated | Acknowledges CLAUDE.md convention without guessing the implementation-time version. |
| 7 | **Transitive dependency promotion** — recharts + react-day-picker identified | Prevents runtime crash when @subframe/core is removed. Critical for clean migration. |
| 8 | **Chart pattern fills** — §6.1 references CVD requirement | Connects to Step 3-1's color-blind safety mandate. |
| 9 | **Calendar a11y note** — §6.7 ARIA grid pattern | Production-ready a11y guidance for date picker migration. |

The `transition-colors` fix (#4) is particularly impactful for brand — `transition-all` would have silently violated the motion principles, causing layout jank on hover that contradicts "Controlled Nature's" precision.

---

## Residual Minor Issues (Non-Blocking)

### r1. TreeView Directory Comment Contradicts Warning

**Location:** §7.1 directory listing

```
├── tree-view.tsx         # Custom (recursive Radix Accordion)
```

But §3.3 TreeView ARIA warning explicitly says: *"The TreeView migration MUST NOT simply reuse Radix Accordion primitives for the ARIA layer."*

The directory comment implies Accordion-based implementation; the warning forbids it. Should update to:
```
├── tree-view.tsx         # Custom tree ARIA (visual structure from Accordion, ARIA from role="tree")
```

### r2. §7.2 package.json Uses `^` Despite Pinning Note

**Location:** §7.2 vs §3.2 API rule #3

API rule #3: *"Version to be verified at implementation — pin to exact version per CLAUDE.md convention."*
§7.2 package.json: `"radix-ui": "^1.4.3"` (uses caret)

The rule says pin; the example uses caret. Both can't be right. Since the rule defers to implementation-time verification, the `^` in the example should be noted as placeholder: add a `// pin at implementation` comment or use `"1.x.x"` placeholder notation.

---

## R2 Score Breakdown

| Focus Area | R1 Score | R2 Score | Delta | Key Improvements |
|-----------|----------|----------|-------|-----------------|
| **Brand Consistency** | 8/10 | **9/10** | +1.0 | Destructive uses corthex-error/90, inverse variant fully defined, dark-bg switching pattern explicit, dialog olive overlay |
| **60-30-10 Rule** | 7.5/10 | **8.5/10** | +1.0 | Inverse variant defines 30% zone component styling, overlay warmth maintained, link color correctly in 10% accent zone |
| **Typography Pairing** | 7.5/10 | **8.5/10** | +1.0 | Mono guidance added (API rule #10), button heights 44px, link alignment with Step 3-1 |
| **Emotional Tone** | 7/10 | **8/10** | +1.0 | "Controlled Nature" opening, Ruler archetype framing, olive overlay warmth, TreeView ARIA care |
| **WEIGHTED AVERAGE** | **7.5/10** | **8.5/10** | **+1.0** | |

### Score Justification

**Brand Consistency 9/10:** Zero hardcoded colors. Inverse variant + switching pattern makes dark surface styling explicit. Dialog overlay maintains warmth. 12 API rules create a comprehensive brand protection framework. Deduction: TreeView directory comment contradiction (-0.5), version caret vs pin (-0.5).

**60-30-10 Rule 8.5/10:** Inverse variant correctly defines how components express the 30% chrome zone. Ghost/outline variants handle the 60% zone. Default/accent handles the 10% zone. The variant catalog implicitly IS a 60-30-10 component mapping. Deduction: no explicit summary table connecting variants to zones (-1), but this is implementation detail appropriate for Phase 4 (-0.5 offset).

**Typography Pairing 8.5/10:** API rule #10 addresses mono for data components. Button sizes correct at WCAG AAA (44px). Link variant aligned. Deduction: no compound component typography guidance (Card title weight, Table header weight) — but Phase 4 implementation scope (-1), partially offset by correct base class choices (+0.5).

**Emotional Tone 8/10:** Opening paragraph is concise and powerful — connects three-system chaos to Ruler archetype's desire for order. "Three dialects, none authoritative" is evocative. Olive dialog overlay maintains warmth. TreeView ARIA warning shows care for human experience. Deduction: only §1 has explicit brand narrative — subsequent sections are purely technical (-1.5), offset by document type (architecture docs serve different purpose than visual specs: +0.5).

---

## Verdict

**CLEAN PASS — 8.5/10 (Grade B exceeded)**

All 2 major and 4 minor issues from R1 fully resolved. 9 additional fixes from other critics significantly strengthen the document. The API rules section (now 12 rules) is a comprehensive brand + a11y + performance protection framework that will guide every component implementation through Phase 4.

**R1 → R2 improvement: 7.5 → 8.5 (+1.0 point).** Grade B confirmed with margin.

**Residual items (non-blocking, for implementers):**
1. r1: TreeView directory comment — update to reflect custom ARIA, not Accordion
2. r2: package.json caret vs pin note — cosmetic consistency

---

*Critic-A (ux-brand) — Phase 3, Step 3-2 R2 Verification Complete*
