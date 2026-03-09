# Party Mode Round 2 — Adversarial Lens
## Pages: 35-agent-marketplace, 36-soul-templates, 37-report-lines, 38-api-keys

### Expert Panel Review (All 7, adversarial)

**Quinn (QA):** Round 1 fixes verified — data-testid added to soul modals, debounce timing added. NEW ISSUE: Page 38's current code doesn't use the toast store for error handling on create/delete/rotate mutations. The spec mentions "should be added" — but this is a design spec, not a code fix spec. The spec should clearly state what the expected behavior IS, not hedge. Also, page 37 mobile section still references `<Badge>` from @corthex/ui in the alternative card layout, contradicting the raw-Tailwind directive.

**Winston (Architect):** The current code for page 35 uses `dark:` prefix classes everywhere, but the design spec is dark-mode-first without `dark:` prefixes. This is correct for the redesign (always dark), but the spec should explicitly state: "Remove all `dark:` conditional classes — this is always-dark mode." Otherwise the coder might add them back.

**Sally (UX):** Page 36 inline edit mode (section 3.4) has no visual differentiation from the create form card. When a card transforms to edit mode, the user needs to know they're editing, not creating. Consider adding a subtle border highlight (e.g., `border-blue-500/50`) or a mini header "수정 중" to indicate edit state. Also, the edit mode card has `flex gap-3` for actions but the view mode card has `flex gap-3 pt-3 border-t` — the edit actions should also have the border-top separator for visual consistency.

**Amelia (Developer):** Looking at page 38's checkbox styling: `rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0`. The `focus:ring-offset-0` is important for dark backgrounds. But `rounded` on checkboxes creates circular checkboxes — for square with rounded corners, use `rounded-sm`. Also, `text-blue-500` on checkboxes changes the checked state color in Tailwind's forms plugin, which requires `@tailwindcss/forms` — the spec should verify this dependency exists.

**Mary (Business Analyst):** No business logic issues. The marketplace → soul templates workflow makes sense: browse marketplace (p35) → import → manage in soul templates (p36) → publish back to marketplace. The bidirectional flow is well-documented across both specs.

**Bob (Scrum Master):** The specs reference page numbers (35-38) consistently. Good cross-referencing. One concern: the mobile alternative card layout in pages 37 and 38 says "Consider" and "Alternatively" — this is ambiguous for the coder. Should be a definitive decision: either use horizontal scroll OR card layout on mobile.

**John (PM):** Page 38's interaction spec notes "currently missing toast store usage in some paths — should be added." This crosses the line from design spec into code fix territory. Design spec should state the desired behavior as fact, and let the coder figure out the implementation gap.

### Issues Found

| # | Severity | Page | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | Medium | 37 | Mobile alternative card layout references `<Badge>` from @corthex/ui | Replace with raw Tailwind badge span |
| 2 | Minor | All | No explicit "always-dark, remove dark: prefixes" statement | Add note to overview of each spec |
| 3 | Medium | 36 | Edit mode card has no visual edit-state indicator | Add `border-blue-500/30` border + border-top on actions |
| 4 | Minor | 38 | Checkbox `rounded` should be `rounded-sm` for proper square checkbox | Fix class |
| 5 | Minor | 38 | "should be added" language is ambiguous | Rewrite as definitive behavior spec |
| 6 | Minor | 37, 38 | Mobile layout uses "Consider" / "Alternatively" — ambiguous | Make definitive decision |

### Fixes Applied
- Issues 1, 3, 4, 5 fixed directly in specs
- Issues 2, 6 noted as minor — addressing in files
