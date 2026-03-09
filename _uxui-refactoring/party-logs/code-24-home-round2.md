# Party Log: code-24-home — Round 2 (Adversarial)

## Expert Panel
1. **Security Reviewer** — No XSS vectors. User name comes from auth store (server-validated). Navigation uses react-router navigate (safe). No dangerouslySetInnerHTML.
2. **Edge Case Hunter** — What if `user` is null? Line 89 uses `user?.name` with optional chaining — safe, renders "님" without name. Not ideal UX but won't crash.
3. **Spec Compliance** — Re-read spec line by line. Overnight card header text: spec says "밤사이 완료된 작업" — code has same ✓. Badges use emerald/red ✓. Button text "모두 읽음" and "자세히 →" ✓. Job list uses `items-start` for multiline support ✓.
4. **Performance** — `formatDate()` is called on every render without memoization. Since it's a simple Date format, this is negligible. Not worth useMemo overhead.
5. **TypeScript** — All types preserved from original. No new type errors expected. StatusDot import from @corthex/ui is valid (confirmed in source).
6. **Accessibility** — Missing aria-labels on interactive buttons. "모두 읽음" button has no aria-label, but text content is descriptive enough for screen readers.
7. **Design Fidelity** — Compared every Tailwind class against spec. Notification section uses `divide-slate-700/30` ✓. Unread bg uses `bg-blue-500/5` ✓. Time uses `font-mono` ✓.

## Crosstalk
- **Edge Case Hunter → TypeScript**: The `NOTIF_ICON` uses unicode escapes — this is fine for the build but emoji characters in source would be more readable. Not a bug.
- **Spec Compliance → Design Fidelity**: The spec says empty notifications section should show "새로운 알림이 없습니다" but the spec section 3.4 says "Empty behavior: returns null". Code returns null — matches the more specific instruction. The section 4.4 seems contradictory but 3.4 takes precedence.

## Issues Found
1. [New/Minor] Section 4.4 says "No Notifications: Card shows 새로운 알림이 없습니다" but Section 3.4 says "returns null". Using null per 3.4 — design decision documented.

## Verdict: **PASS** (9/10) — No blocking issues. Spec contradiction documented and resolved.
