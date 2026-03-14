# Critic-B Review: Epics Step 01-02
**Score: 7.5/10**
**Reviewer:** critic-b
**Date:** 2026-03-14

## Critical Issues (3)

### 🔴 Issue 1: Story 21.4 Gate 5 — Wrong Pipeline + Wrong Threshold
- NFR-P4: `read_web_page × 1 + save_report(pdf_email)` ≤ 4 min (240s = 240000ms)
- Story 21.4 Gate 5 tests: `read_web_page × 3` < 5 min (300000ms)
- Fix: pipeline `read_web_page × 1 + save_report(pdf_email)`, threshold `duration_ms < 240000`

### 🔴 Issue 2: Story 20.4 — Wrong Credential Reference
- Last AC references `tistory_access_token` but should reference SMTP credentials (smtp_host/user/password)
- Fix: Replace `tistory_access_token` with SMTP credential names

### 🔴 Issue 3: Story 18.3/18.4 Stage Numbering Inconsistent
- Architecture E12 is 1-indexed (Stage 1=RESOLVE, Stage 2=SPAWN...)
- Story 18.3 says "Stages 0–4" (0-indexed), Story 18.4 says "Stages 5–8" (1-indexed) — mismatch
- Fix: Story 18.3 → "Stages 1–4", Story 18.4 → "Stages 5–8" (both 1-indexed, matching E12)

## Non-Critical Findings
- Story 21.4 Gate 4 (Time-to-Value <30min) is untestable by automated tests — needs metric setup story
- Story 17.1 complexity M → should be L (covers agent-loop.ts modification)
- Story 19.5 should explicitly state it creates 2 route files in ACs
- NFR-P3 (call_agent <60s) not tested anywhere in Epics 16–21
