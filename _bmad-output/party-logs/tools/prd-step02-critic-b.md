# CRITIC-B Review — PRD Steps 02 + 02b + 02c
**Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob)
**Date:** 2026-03-14
**Sections:** Step 02 Discovery (L52–88) + Step 02b Vision (L91–138) + Step 02c Executive Summary (L91–165)

---

## Step 02 — Discovery (Lines 52–88) | Score: 7/10

### Winston (Architect)
The MCP Manual Integration Pattern reference in terminology (L64) correctly cites `SPAWN→DISCOVER→MERGE→EXECUTE→RETURN→TEARDOWN` and ties to Epic 15/D17. Architecture_change: 5/5 is justified — rewiring the engine's tool dispatch for a 6-step manual lifecycle is genuinely high complexity. However, the `regression_scope: 4` annotation ("All 56 existing tools must remain intact") is never narratively supported in Detection Signals — only 3 of 8 axes have prose justification (L103–108). The remaining 5 axes (db_schema_change, realtime_impact, regression_scope, ux_change, team_capability) are in the YAML only, invisible to any stakeholder reading the prose section.

### Amelia (Dev)
`architecture_change: 5` is correctly scored. But `realtime_impact: 4` annotation says "MCP child process lifecycle + credential-scrubber hook per tool call" — credential-scrubber fires PostToolUse per every tool call, not just MCP. The annotation implies realtime_impact only comes from MCP, underestimating the hook overhead on all 56+ tools. Should read "credential-scrubber PostToolUse Hook fires on ALL tool calls, not just MCP-namespaced ones."

### Quinn (QA)
Domain classification lists primary/secondary/tertiary (AI Agent Orchestration / Marketing Automation / Business Intelligence) but Detection Signals (L92–108) only provides evidence for the primary domain and the SaaS B2B classification. There is **zero detection signal** for the Marketing Automation secondary domain (content_calendar, ARGOS scheduling) or Business Intelligence tertiary domain (save_report, list_reports, structured analytics). These are classified domains without justification — if a QA engineer were to audit this, they'd flag it as unverified.

### Bob (SM)
Complexity 31/40 vs prior PRD 29/40 — the Brief does not reference any prior PRD score, and neither does this Discovery section. The reviewer's note about "justified vs Phase 1 PRD 29/40" is not traceable from the PRD text itself. Either the delta should be explicitly documented here ("+2 from Phase 1 PRD: external_dependency 5/5 vs prior 4/5, auth_security 5/5 vs prior 4/5") or the comparison claim should be removed from Review Request context. Stakeholders reading this PRD cannot verify the claim.

### Issues Found
- **Issue 1 [REQUIRED]**: Detection Signals missing prose for 5 of 8 complexity axes (db_schema_change, realtime_impact, regression_scope, ux_change, team_capability). YAML-only justification is insufficient — adds narrative section under "High Complexity 근거" for all 8 axes.
- **Issue 2 [REQUIRED]**: No detection signals for Marketing Automation (secondary) or Business Intelligence (tertiary) domains. Add signal block showing `content_calendar`/ARGOS as marketing automation evidence and `save_report`/`list_reports` as BI evidence.

---

## Step 02b — Vision (Lines 91–138) | Score: 8/10

### Winston (Architect)
"Full Pipeline Autonomy" is the correct differentiator name. The before/after example (L121) is concrete and specific: "Tistory 5개, Instagram 카루셀 5개, X 스레드 5개 발행 완료 — Notion 콘텐츠 캘린더 업데이트됨." The `call_agent` handoff chain citation (marketing director → copywriter → designer → publisher → reporter) correctly maps to the existing Epic 7 organizational model. Architecturally sound.

### Amelia (Dev)
The differentiator claim "Predis.ai, Buffer, Perplexity가 서로 대화하지 않기 때문" (L123) is accurate but undersells the technical enabler. The real reason CORTHEX can do this is that `call_agent` + `allowed_tools` JSONB + the Manual MCP Integration Pattern create an in-process orchestration layer that external SaaS tools fundamentally cannot replicate. This technical anchor is entirely absent from the Vision section — the claim reads as a marketing assertion rather than an architectural fact.

### Quinn (QA)
X thread in the before/after example (L121): "X 스레드 5개 발행 완료" — but `publish_x` is downgraded to Phase 2. The Vision's aspirational example uses a Phase 2 tool as if it's available in Phase 1. This creates a false expectation gap. The example should either (a) replace X with a Phase 1 tool (e.g., Tistory + Instagram only), or (b) add a footnote: "*(X 스레드: Phase 2)*".

### Bob (SM)
Vision is scope-realistic for what Phase 1+2 delivers combined. No scope creep detected. The 5-differentiator structure (L119–146) correctly identifies the key value props without overpromising timelines.

### Issues Found
- **Issue 3 [REQUIRED]**: Before/after example (L121) includes "X 스레드 5개" which is a Phase 2 feature (`publish_x` downgraded). Must add phase annotation or replace with Phase 1 tool.
- **Issue 4 [RECOMMENDED]**: Technical anchor missing — add 1 sentence explaining WHY competitors can't match this: the `call_agent` in-process orchestration + `allowed_tools` JSONB + Manual MCP Pattern vs. external SaaS point solutions that lack API-to-API communication.

---

## Step 02c — Executive Summary (Lines 91–165) | Score: 7/10

### Winston (Architect)
Critical architectural omission: The Executive Summary never mentions the Epic 15/D17 consequence that forced the Manual MCP Integration Pattern. The Exec Summary says agents become "자율적 비즈니스 운영자" via MCP but doesn't disclose that MCP integration required a novel SPAWN→TEARDOWN pattern because `messages.create()` has no native `mcpServers` parameter. This is the #1 architectural risk of the entire project and should appear in the exec summary — at minimum one sentence: "MCP integration uses a 6-step Manual Pattern (SPAWN→TEARDOWN) required by the messages.create() engine (Epic 15/D17), adding implementation complexity vs. SDK-abstracted alternatives."

### Amelia (Dev)
The SaaS Consolidation table (L127–134) shows Buffer ($30/mo) replaced by "`content_calendar` + publish tools" — but at Phase 1 completion, "publish tools" only covers Tistory + Instagram (publish_x is Phase 2, publish_youtube is Phase 2). Buffer's multi-platform scheduling value is therefore NOT fully replaced at Phase 1. The table is misleading to an engineering reader who would plan Phase 1 scope based on this. Should add "(Phase 1: Tistory + Instagram only)" qualifier.

### Quinn (QA)
`publish_x` downgrade from Phase 1 is a critical scoping decision documented in the Brief (line 615) but is **entirely absent from the Executive Summary**. A stakeholder reading only the Exec Summary would not know that X publishing costs $200/month and was deliberately deferred. This omission violates the "traceable to Product Brief decisions" requirement. The Exec Summary must explicitly note: "`publish_x` Phase 2 (X API Basic $200/월 cost gate — requires explicit pilot commitment)."

### Bob (SM)
TCO table (L134): "$67–267/월/전사 (X API 포함 여부에 따라)" — correctly sourced from Brief's Honest TCO section ($67 without X API, $267 with). This is accurate. However "전사(org-wide)" vs Brief's "per organization" is correctly translated. The SaaS comparison "합계 $127–150/팀/월" uses "팀(team)" while CORTHEX TCO uses "전사(org-wide)" — these are different units (team vs organization). If an org has 3 teams, the comparison baseline is $381–450/월 vs CORTHEX's $67–267/월, which makes CORTHEX look even better. The comparison units should be normalized or explicitly noted.

The "Extensible MCP Architecture" section (L144–146) lists Notion (22 tools), Playwright, GitHub, Google Workspace as examples — these are all Phase 2 MCP servers per the Brief. Presenting them without a phase qualifier in the Exec Summary implies they're available at Phase 1 launch.

### Issues Found
- **Issue 5 [REQUIRED]**: `publish_x` Phase 2 downgrade not mentioned in Exec Summary. Must add explicit note.
- **Issue 6 [REQUIRED]**: "Extensible MCP Architecture" section lists Phase 2 MCP servers (Notion, Playwright, GitHub, Google Workspace) without phase qualifiers — misleading stakeholders about Phase 1 scope.
- **Issue 7 [REQUIRED]**: Epic 15/D17 Manual MCP Integration Pattern consequence absent from Exec Summary. Add 1-sentence architectural note.
- **Issue 8 [RECOMMENDED]**: Buffer TCO comparison unit mismatch (팀 vs 전사). Add footnote normalizing comparison units.

---

## Summary

| Section | Score | Required Fixes | Recommended |
|---------|-------|---------------|-------------|
| Step 02 Discovery | 7/10 | 2 | 0 |
| Step 02b Vision | 8/10 | 1 | 1 |
| Step 02c Exec Summary | 7/10 | 3 | 1 |
| **Overall** | **7.3/10** | **6** | **2** |

### Top 3 Critical Fixes (Blocking)
1. **publish_x Phase 2 downgrade** — not in Exec Summary (Issue 5)
2. **Phase 2 MCP servers unlabeled in Exec Summary** (Issue 6) — creates false Phase 1 scope expectation
3. **Missing domain detection signals** for Marketing Automation + BI secondary/tertiary (Issue 2)
