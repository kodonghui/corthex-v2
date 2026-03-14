# PRD Step 02+02b+02c — Fix Summary

**Round:** 1
**Applied:** 2026-03-14
**Source:** critic-a feedback (combined critic-a + critic-b cross-talk, 6 issues)

---

## HIGH BLOCKING Fixes Applied

### Fix #1 — publish_x Phase 1 downgrade documented (HIGH BLOCKING)
**Location:** frontmatter `topRisks.R4`
**Before:** `"R4: X API $200/month cost gate threatens pilot adoption"`
**After:** Full downgrade note — `publish_x DOWNGRADED Phase 1→Phase 2 due to $200/月 cost gate. Phase 1 MVP = 7 new built-in tools (publish_x excluded).`
**Rationale:** Brief Section 5 explicitly states publish_x was "downgraded from Phase 1" due to pilot cost gate. PRD must mirror this decision explicitly.

### Fix #2 — MCP servers in Exec Summary Point 5 now Phase-labeled (HIGH BLOCKING)
**Location:** `## Executive Summary → **5. 확장 가능한 MCP 아키텍처**`
**Before:** "Notion(22개 도구), Playwright(브라우저 자동화), GitHub(레포/이슈), Google Workspace(50+개 도구)"
**After:** "예: Notion(22개 도구, Phase 2), Playwright(Phase 2), GitHub(Phase 2), Google Workspace(Phase 3)" + added clarification that Phase 1 builds the MCP infra foundation.
**Rationale:** All listed MCP servers are Phase 2 or Phase 3 — presenting without phase qualifiers misleads scope.

### Fix #3 — Vision before/after example no longer uses Phase 2 tools (HIGH BLOCKING)
**Location:** `## Executive Summary → **1. 파이프라인 완전 자율화**`
**Before:** Single example including "X 스레드 5개 발행 완료" (Phase 2: publish_x)
**After:** Restructured into Phase 1 row and Phase 2 row with explicit phase labels. Phase 1 example uses only Phase 1 tools (Tistory, save_report, pdf_email).
**Rationale:** publish_x is Phase 2. Flagship differentiator example must use Phase 1-deliverable tools only.

### Fix #4 — TCO table now apples-to-apples per-team comparison (HIGH BLOCKING)
**Location:** `## Executive Summary → **2. 단일 플랫폼 도구 통합**`
**Before:** "합계 | $127–150/월/팀 | $67–267/월/전사" — unit mismatch (팀 vs 전사)
**After:** Added row: "**팀당 비용 (5팀 공유 기준) | $127–150/팀 | $13.40/팀 / $53.40/팀**" sourced from Brief TCO table. Also added Phase labels to each CORTHEX tool column.
**Rationale:** Brief Section 2 explicitly provides the per-team normalized comparison ($13.40/팀 without X, $53.40/팀 with X, 5 teams sharing).

---

## MEDIUM Fixes Applied

### Fix #5 — n8n/Make.com/Zapier differentiation added (MEDIUM)
**Location:** `## Executive Summary → **1. 파이프라인 완전 자율화**`
**Added:** 2 bullet points under the before/after section:
- (1) workflow automation platforms run pre-defined node flows; CORTHEX agents select tools + generate content from natural language with zero pre-designed flows
- (2) `call_agent` context continuity — full conversation context passes to sub-agents in handoff chain
**Rationale:** "Full Pipeline Autonomy" without addressing n8n/Make.com/Zapier leaves a key competitive gap unaddressed.

### Fix #6 — Marketing Automation + Business Intelligence domain signals added (MEDIUM)
**Location:** `## Project Discovery → Detection Signals`
**Added:**
- "Marketing Automation 도메인 근거 (2차)" — 8 marketing tools, content_calendar workflow states, zero-touch campaign execution via call_agent chain
- "Business Intelligence 도메인 근거 (3차)" — read_web_page + web_crawl for live intelligence, save_report multi-channel distribution, ocr_document Korean OCR, ARGOS scheduled automation
**Rationale:** Secondary/tertiary domains were classified in frontmatter but not justified in prose Detection Signals section.

---

## Verification Checklist

- [x] publish_x downgrade documented in topRisks (frontmatter-level)
- [x] Phase labels on all MCP server examples in Exec Summary Point 5
- [x] Phase 1 and Phase 2 separated in before/after example
- [x] Per-team TCO comparison row added with correct figures from Brief
- [x] n8n/Make.com/Zapier differentiation in 2 bullets
- [x] Marketing Automation domain signals in prose
- [x] Business Intelligence domain signals in prose
- [x] All figures traceable to Product Brief

**Ready for critic re-verification.**
