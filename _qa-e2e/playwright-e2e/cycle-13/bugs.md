# Shared Bug Registry — Cycle 13

Phase 1 API Smoke: 6/6 OK
Cycle 12 fixes to verify: CSP (BUG-C001), sidebar empty state (BUG-A001)
Remaining from Cycle 12: BUG-B001 (mobile, ESCALATED), BUG-B002 (i18n inconsistency)

| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| BUG-B001 | B | All pages | P1 | Korean text renders as □ boxes — `index.css` font-family missing `Noto Sans KR`/`Noto Serif KR` (loaded in index.html but not referenced in CSS). Fallback chain: `Inter → Pretendard(not loaded) → system-ui(no KR fonts)` → tofu. | `B-01-login-page.png`, `B-02-login-korean-text.png` |
| BUG-B002 | B | Any using corthex-accent | P3 | CSS `--color-corthex-accent: oklch(0.55 0.2 264)` = blue/purple hue. Should be olive (~145°). Most pages use hardcoded hex so low impact. | — |
