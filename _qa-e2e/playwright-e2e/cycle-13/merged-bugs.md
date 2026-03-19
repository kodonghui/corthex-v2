# Merged Bugs — Cycle 13

## Summary
- Raw: 2 bugs from Agent B only (A: 0, C: 0, D: 0)
- After dedup: **2 unique bugs**
- Cycle 12 fixes: ALL VERIFIED (CSP 0 errors, sidebar "등록된 회사 없음")
- Agent A: 21/21 PASS, Agent C: PASS (11 headers), Agent D: 48/48 PASS

## P1 (High) — 1 bug

### BUG-B001: Korean text □ boxes (font fallback)
- **Page**: All pages
- **Severity**: P1 (BUT may be headless-only — real browsers load Google Fonts)
- **Description**: index.html loads Noto Serif KR from Google Fonts, but CSS font-family chain (Inter → Pretendard → system-ui) doesn't include it. Headless Chromium without Korean fonts renders □.
- **Fix**: Add "Noto Sans KR" to CSS font-family fallback chain
- **Auto-fixable**: YES (Style, 1 file — index.css or tailwind config)

## P3 (Low) — 1 bug

### BUG-B002: CSS --color-corthex-accent is blue/purple hue
- **Page**: Any using CSS variable
- **Severity**: P3 (low impact — most pages use hardcoded hex)
- **Description**: `--color-corthex-accent: oklch(0.55 0.2 264)` = blue/purple (264°). Should be olive (~145°).
- **Fix**: Change hue from 264 to ~145 in CSS variable definition
- **Auto-fixable**: YES (Style, 1 file)
