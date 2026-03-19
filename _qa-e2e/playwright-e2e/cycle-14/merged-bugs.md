# Merged Bugs — Cycle 14

## Summary
- Raw: 3 bugs from B + C (A: 0, D: 0)
- After dedup: **3 unique bugs** (BUG-B002 related to BUG-C001 but different symptom)
- Agent A: 21/21 PASS, Agent D: 12/12 PASS

## P2 (Medium) — 2 bugs

### BUG-C001: Korean font fallback broken
- **Severity**: P2
- **Description**: Tailwind `--font-body: "Inter"` overrides index.css body font-family. Also Google Fonts loads "Noto Serif KR" but CSS references "Noto Sans KR" (name mismatch).
- **Fix**: 1) Match font name: load Noto Sans KR in index.html OR change CSS to Noto Serif KR. 2) Ensure Tailwind config doesn't override body font-family.
- **Auto-fixable**: YES (Style, 2-3 files)

### BUG-B001: CTA buttons orange instead of olive
- **Severity**: P2
- **Description**: Companies, Monitoring, Onboarding pages have CTA buttons with #c4622d (orange) instead of olive accent.
- **Fix**: Find orange hex in those page files, replace with olive #5a7247 or similar
- **Auto-fixable**: YES (Style, 3 files)

## P3 (Low) — 1 bug

### BUG-B002: Heading font serif instead of sans-serif
- **Severity**: P3
- **Description**: h1 elements use "Noto Serif KR" serif. Should be Inter sans-serif per spec.
- **Related**: Same root cause as BUG-C001 (font configuration issue)
- **Auto-fixable**: YES (fixed together with BUG-C001)
