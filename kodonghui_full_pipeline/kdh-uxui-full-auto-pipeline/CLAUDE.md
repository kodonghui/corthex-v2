# CLAUDE.md -- kdh-uxui-full-auto-pipeline v6.0 (ProMax)

## What This Pipeline Does
Redesigns ALL frontend packages (app, admin, landing) using promax design-system DB + Playwright visual research + Stitch 2 MCP generation. Multi-theme support.

## Key Differences from v5.1 (Libre)
- **promax** replaces LibreUIUX as design decision engine
- **Playwright screenshots** mandatory in Phase 1 (HARD GATE)
- **6 phases** instead of 8 (leaner)
- **Multi-theme** via CSS custom properties (not single theme)
- **ALL packages** covered (app + admin + landing)
- **ZERO hardcoded colors** anywhere in pipeline or output

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
