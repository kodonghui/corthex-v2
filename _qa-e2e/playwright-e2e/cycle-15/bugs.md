# Shared Bug Registry — Cycle 15

Phase 1 API: 6/6 OK
No new code since Cycle 14. Stability verification cycle.
ESC-001: mobile sidebar (ESCALATED, don't re-report)
Known: terracotta #c4622d is intentional secondary color (not orange bug)
Known: Noto Serif KR in headings is intentional design choice

Agent A: 20/20 pages PASS, 0 console errors, 0 dead buttons, 0 new bugs.
Agent B: 21/21 pages + 1 mobile PASS, 0 console errors, 0 new bugs. ESC-001 re-confirmed.

| Bug ID | Agent | Page | Severity | Description | Screenshot |
|--------|-------|------|----------|-------------|------------|
| ESC-001 | B | /admin (mobile 390x844) | P2 | Sidebar not responsive — no hamburger, content squeezed (ESCALATED, known) | 22-mobile-390x844.png |
