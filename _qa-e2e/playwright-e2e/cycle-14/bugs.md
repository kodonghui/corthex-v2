# Shared Bug Registry — Cycle 14

Phase 1 API: 6/6 OK
Cycle 13 fixes to verify: Korean font fallback (BUG-B001), accent hue olive (BUG-B002)
ESC-001: mobile sidebar (ESCALATED, don't re-report)

| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| BUG-C001 | C | Global (fonts) | P2 | Korean font fallback not applied: `--font-body: "Inter"` overrides index.css body font-family, AND Google Fonts loads `Noto Serif KR` but CSS references `Noto Sans KR` (serif/sans mismatch) | N/A (code-level) |
| BUG-B001 | B | /admin/companies, /admin/monitoring, /admin/onboarding | P2 | CTA buttons use orange `#c4622d` (`rgb(196,98,45)`) instead of olive accent. Breaks Natural Organic brand palette. | 02-companies.png, 12-monitoring.png, 21-onboarding.png |
| BUG-B002 | B | All pages with h1 | P3 | Heading font is `"Noto Serif KR", serif` instead of Inter (sans-serif) per design spec. Related to BUG-C001. | N/A (computed style) |
