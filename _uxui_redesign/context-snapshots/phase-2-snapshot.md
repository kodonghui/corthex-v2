# Phase 2 Context Snapshot

## Key Decisions
- 3 themes generated via promax --design-system
- Command: dark theme, gold accent #CA8A04, DM Sans, promax bg overridden to #0C0A09 (Phase 1 dark pattern)
- Studio: light cyan theme, cyan accent #0891B2, Outfit + Work Sans, Soft UI Evolution style
- Corporate: light slate theme, blue accent #2563EB, Lexend + Source Sans 3, Trust & Authority style
- All themes share: JetBrains Mono, Lucide React icons, 4px spacing base, 280px sidebar

## Design Tokens
- Command: bg #0C0A09, surface #1C1917, accent #CA8A04, text #FAFAF9
- Studio: bg #ECFEFF, surface #FFFFFF, accent #0891B2, text #164E63
- Corporate: bg #F8FAFC, surface #FFFFFF, accent #2563EB, text #1E293B

## WCAG AA
- All 3 themes pass primary text contrast
- Studio accent on bg is 3.4:1 (passes for large text only, may need adjustment)

## Constraints for Phase 3
- Stitch 2 DESIGN.md must be generated per theme
- All colors via CSS variables, zero hardcoded hex in pages
- Sidebar gets themed via --color-corthex-sidebar-* tokens
