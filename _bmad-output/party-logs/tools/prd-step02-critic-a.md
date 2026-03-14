# CRITIC-A Review: PRD Steps 02 + 02b + 02c
**Reviewer:** CRITIC-A (John/PM · Sally/UX · Mary/BA)
**Date:** 2026-03-14
**Sections reviewed:** Lines 1–165 of prd.md (Discovery + Vision + Executive Summary)
**Reference:** product-brief.md (full file)

---

## Section Scores

| Section | Score | Verdict |
|---------|-------|---------|
| Step 02 — Discovery | 8/10 | Complexity math verified correct. One traceability gap. |
| Step 02b — Vision | 7/10 | Differentiator compelling but workflow-automation gap not addressed. |
| Step 02c — Executive Summary | 7/10 | TCO table unit mismatch + publish_x downgrade absent. |

---

## Step 02 — Discovery (Lines 80–108): Score 8/10

### John (PM): 8/10
Complexity 31/40 is mathematically verifiable from the 8-axis breakdown (5+5+4+4+5+4+2+2=31) and the three 5/5 axes (external_dependency, auth_security, architecture_change) are all well-evidenced by the Brief's content. However, the PRD frontmatter states "phase1: product+engineering # **7 new tools**" while the Brief Phase 1 table explicitly includes 8 tools (`md_to_pdf, save_report, list_reports, get_report, publish_tistory, **publish_x**, upload_media, read_web_page`). This 7-vs-8 discrepancy is a silent scope change — if `publish_x` was removed from Phase 1 due to R4 (X API $200/month cost gate), that decision must be explicitly documented in Discovery or the decision log, not just implied by the tool count. No reader can reconstruct this decision from lines 1–165.

**Required fix:** Add explicit scope decision note to Discovery or frontmatter: "`publish_x` was included in Phase 1 scope in the Product Brief but downgraded to Phase 2 due to R4 ($200/month cost gate threatening pilot adoption). Phase 1 MVP: 7 tools (publish_x excluded)."

### Sally (UX): 8/10
The Detection Signals section correctly identifies the 5 admin routes + 1 human route as `ux_change: 2` (low), and the team_capability: 2 reflects that the team knows this codebase. The MCP Manual Integration Pattern reference to Epic 15/D17 is accurate and traceable — the terminology section (line 64) and Detection Signals (line 100) both correctly cite the SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN pattern as the consequence of the messages.create() engine rewrite. No UX-specific issues in Discovery.

### Mary (BA): 7/10
The typeComposition (saas_b2b 40% / web_app 30% / developer_tool 30%) has a classification signal issue. Both primary personas (김지은: non-developer admin; 박현우: infrastructure admin) are **platform administrators**, not developers building tools. The `developer_tool: 30%` weight appears to derive from the MCP server infrastructure feature, but this infrastructure is administered via Admin UI — it is not a developer SDK or API surface. This classification may push architecture phase to over-invest in API/SDK design patterns instead of Admin UI polish. If `developer_tool` refers specifically to the CLI-Anything/Crawlee bridge (crawl_site), it should be scoped to that, not at 30% platform weight.

**Required fix (optional, not blocking):** Add a parenthetical to typeComposition: "developer_tool 30% = MCP server configuration admin UI + CLI-Anything bridge (not an SDK/API-first surface)."

---

## Step 02b — Vision (Lines 111–147): Score 7/10

### John (PM): 7/10
"Full Pipeline Autonomy" as the core differentiator is compelling and well-illustrated by the concrete before/after comparison (lines 121–123: "분석 완료 — 직접 게시해주세요" → "Tistory 5개, X 스레드 5개 발행 완료"). However, the PRD does not address the most obvious competitive challenge: **Make.com, n8n, Zapier, and Activepieces also provide pipeline automation** that connects Tistory + Instagram + Notion without human intervention. A VP-level reader will immediately ask: "why not just use n8n for $20/month?" The current vision section says "이것이 핵심 가치 전환이다" (line 123) but does not explain why workflow automation platforms cannot achieve the same pipeline autonomy.

**Required fix:** Add a 3-bullet comparison vs. workflow automation platforms:
- "Make.com/n8n can route data between Tistory + Instagram, but they require a human to pre-build the workflow diagram, cannot generate the content itself, and lose conversation context between steps."
- "CORTHEX: one natural language command → agent decides which tools to use → generates content → publishes → all within a single conversation context. No workflow diagram. No pre-configuration per content type."

### Sally (UX): 7/10
The "What Makes This Special" section (lines 119–147) presents 5 value points in a logical sequence (pipeline autonomy → consolidation → security → Korean support → extensibility), which is a clean UX story arc. However, Point 2 (SaaS Consolidation table, lines 127–134) has a **unit inconsistency that will confuse non-technical decision makers**: the left column shows per-tool SaaS costs (Predis.ai $59/월, Buffer $30/월, etc.) with "합계 $127-150/월/팀" while the CORTHEX column shows "$67-267/월/전사" — mixing "per team" and "per organization" units in the same comparison table. A non-developer admin (김지은 persona) reading this table will think CORTHEX costs $67/month compared to $127-150/month, when the actual apples-to-apples comparison is $13.40/팀 (5 teams sharing) vs $127-150/팀. This is a decision-misleading UX problem.

**Required fix:** Add a consistent unit row or footnote:
```
합계: $127-150/팀 SaaS 스택  vs.  $67-267/전사 ($13.40–$53.40/팀 · 5팀 공유 기준)
```
Or change the CORTHEX column header to "CORTHEX 전사 비용" and add a footnote: "*(5팀 공유 시 팀당 $13.40–$53.40)*"

### Mary (BA): 6/10
The Vision section positions this as a SaaS consolidation play ($127-150/팀/월 → lower), but the business case is weakened by the absence of a payback period or ROI frame. The Brief includes the persona 김지은's "2-3시간/금요일 → 0분" pain point (Brief p.254), which translates to ~100 hours/year of admin time saved per organization — at SME rates ($30-50/hour), this is $3,000–$5,000/year of labor recaptured just from the Friday manual publishing workflow. This is a stronger business case than the SaaS cost comparison (which saves $127-150/팀/월 = $1,524–$1,800/년). The Vision section leads with the weaker ROI number.

**Required fix (recommended):** Add to SaaS Consolidation section or create a brief ROI bridge: "김지은 시나리오: 주 2-3시간 수작업 게시 절감 = 연간 100+ 시간 · SME 노무비 환산 ₩4,000,000–₩6,500,000/년. SaaS 스택 절감($127-150/팀/월 = ₩1.8M-2.2M/년)보다 노동비 절감이 주 ROI 근거."

---

## Step 02c — Executive Summary (Lines 111–165): Score 7/10

### John (PM): 7/10
The exec summary correctly traces: capability ceiling → tool gap → SaaS fragmentation → consolidation via 18 new tools + MCP infra → Full Pipeline Autonomy. The MCP Manual Integration Pattern is correctly cited as the Epic 15/D17 engine consequence (line 100). However, two issues break full traceability:
1. **publish_x downgrade not noted** (described above): Brief Phase 1 = 8 tools, PRD Phase 1 = 7 tools. Silent discrepancy.
2. **Complexity comparison to Phase 1 PRD absent**: The review brief notes 31/40 vs "Phase 1 PRD's 29/40" — but nowhere in lines 1–165 does the PRD acknowledge this comparison or justify why Tool Integration is harder than the Phase 1 PRD. For a brownfield feature expansion (vs the Phase 1 greenfield build), 31/40 > 29/40 is counter-intuitive and needs a one-line justification.

**Required fix:** Add to Discovery or frontmatter: "Note: Tool Integration complexity (31/40) exceeds Phase 1 PRD (29/40) due to 6+ external platform APIs (5/5, vs Phase 1's 3/5) and credential security model (5/5, vs Phase 1's 2/5). Brownfield context offsets architecture familiarity reduction (team_capability 2/5)."

### Sally (UX): 8/10
The exec summary's Point 3 (Credential Security, line 136–138) correctly describes the 3-layer security model (`{{credential:key}}` + scrubber hook + typed error). Point 5 (Extensible MCP Architecture, lines 144–146) correctly notes the Admin UI management path. The Korean platform support (Point 4, lines 140–142) is specific and evidenced. No UX gaps in the exec summary beyond the TCO unit issue flagged above.

### Mary (BA): 7/10
The exec summary is high-density and mostly zero-fluff. The product brief TCO table (Brief p.201-213) is accurately reproduced in the PRD (lines 127-134 match Brief exactly: $67 without X / $267 with X). However, the SaaS comparison table in the exec summary has an **apples-to-oranges unit problem** (팀 vs 전사 — same as flagged in Vision). Additionally, the exec summary does not note that `publish_x` Phase 1 placement was a contested decision with a named risk (R4). For a C-suite reader evaluating whether to fund Phase 1, knowing that the $200/month X API cost might defer a P0 tool is material information.

---

## Issue Summary (Ranked by Severity)

| # | Issue | Severity | Section | Fix Required |
|---|-------|----------|---------|-------------|
| 1 | **publish_x Phase 1 downgrade not explicitly documented** — Brief = 8 Phase 1 tools, PRD = 7. Silent scope change with no decision note. | HIGH | Discovery (frontmatter + topRisks) | Add explicit note: "publish_x downgraded Phase 1→Phase 2 due to R4. Phase 1 MVP = 7 tools." |
| 2 | **TCO table unit mismatch (팀 vs 전사)** — SaaS "합계 $127-150/팀" vs CORTHEX "$67-267/전사" creates misleading impression of cost savings magnitude | HIGH | Exec Summary (line 134) | Add consistent per-team unit: "$13.40–$53.40/팀 (5팀 공유 기준)" row to table |
| 3 | **Vision doesn't differentiate from workflow automation** — Make.com/n8n/Zapier also provide "pipeline autonomy". No explanation of why agent-driven approach is superior | MEDIUM | Vision (lines 119–124) | Add 3-bullet comparison vs workflow automation platforms (generative capability, no pre-built workflow, context preservation) |
| 4 | **Complexity 31/40 vs Phase 1's 29/40 comparison absent** — counter-intuitive for brownfield, needs one-line justification | MEDIUM | Discovery (line 154) | Add: "31/40 > Phase 1 PRD 29/40: +2점 = 외부 플랫폼 API 6개(5/5 vs 3/5) + 크리덴셜 보안(5/5 vs 2/5)" |
| 5 | **developer_tool 30% classification unclear** — both primary personas are admins, not developers | LOW | Discovery (typeComposition) | Add parenthetical clarifying what drives this 30% |

---

## Verdict

Steps 02/02b/02c are **solid but not yet publish-ready**. Issues #1 and #2 are blocking — one is a silent scope change that will confuse story creation, the other will mislead business stakeholders. Issues #3 and #4 are required for PRD quality standards. Issue #5 is optional but recommended.

**Minimum fixes required before passing: Issues #1, #2, #3, #4.**
