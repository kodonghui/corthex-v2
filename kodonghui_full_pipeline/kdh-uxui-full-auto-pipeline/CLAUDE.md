# CLAUDE.md -- kdh-uxui-full-auto-pipeline v6.1 (ProMax)

## What This Pipeline Does
Redesigns ALL frontend packages (app, admin, landing) using promax design-system DB + Playwright visual research + Stitch 2 MCP generation + **react:components skill for HTML→React conversion**. Multi-theme support.

## Key Differences from v5.1 (Libre)
- **promax** replaces LibreUIUX as design decision engine
- **Playwright screenshots** mandatory in Phase 1 (HARD GATE)
- **6 phases** instead of 8 (leaner)
- **Multi-theme** via CSS custom properties (not single theme)
- **ALL packages** covered (app + admin + landing)
- **ZERO hardcoded colors** anywhere in pipeline or output
- **react:components** skill converts Stitch HTML → modular React components (AST-validated)

## Stitch → React Conversion (Phase 3.5)
After Stitch MCP generates HTML screens (Phase 3), the `react:components` skill converts them to production-ready React/JSX:
1. Stitch MCP `generate_screen_from_text` → HTML + PNG
2. `react:components` skill reads HTML + PNG → modular React components
3. Components placed in `phase-3-generated/{theme}/{package}/components/`
4. Phase 4 uses these React components to rebuild page render output

Skill location: `~/.claude/skills/react-components/SKILL.md`
Install: `npx skills add google-labs-code/stitch-skills --skill react:components --global --yes`

## Folder Structure

```
_uxui_redesign/
  phase-0-scan/           # project-context.yaml
  phase-1-research/       # Playwright screenshots + benchmark analysis
    screenshots/          # 15+ benchmark site screenshots
    snapshots/            # DOM structure captures
    benchmark-sites.md    # Selected sites with rationale
    benchmark-analysis.md # Visual analysis + patterns
  phase-2-design-system/  # promax output per theme
    {theme-name}/
      MASTER.md           # promax --design-system --persist output
      DESIGN.md           # Stitch 2 compatible design system
      pages/              # Page-specific overrides
  phase-3-generated/      # Stitch 2 MCP output per theme per package
    {theme-name}/
      app/                # CEO app pages (.tsx + .png)
      admin/              # Admin pages (.tsx + .png)
      landing/            # Landing page (.tsx + .png)
  phase-4-integration/    # Rebuild reports
    color-mapping.md      # Stitch → CSS variable mapping
    completeness-report.md
  phase-5-verification/   # Test results
    visual-report.md
    e2e-report.md
    accessibility-report.md
  context-snapshots/      # Per-step decision snapshots
  party-logs/             # Critic reviews and scores
  pipeline-status.yaml    # Single source of truth
```

## Previous Version (Preserved)
The LibreUIUX-based v5.1 pipeline is preserved at:
`kodonghui_full_pipeline/kdh-libre-uxui-pipeline/`
