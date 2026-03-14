---
step: prd-step03-04
reviewer: critic-b
date: 2026-03-14
sections: Success Criteria (lines 179–320) + User Journeys (lines 321–411)
---

# CRITIC-B Review: PRD Step-03 (Success Criteria) + Step-04 (User Journeys)

## Section Scores

| Section | Score | Verdict |
|---------|-------|---------|
| User Success (Personas) | 9/10 | ✅ Strong |
| Business Success (6-metric table) | 6/10 | ⚠️ Timing error |
| Technical Success (SLA table + telemetry) | 9/10 | ✅ Strong |
| Measurable Outcomes (Go/No-Go Gates) | 7/10 | ⚠️ Vague measurement |
| Product Scope (Phase labels) | 8/10 | ✅ Mostly correct |
| User Journeys (6 narratives) | 7/10 | ⚠️ API signature bug |
| Journey Requirements Summary | 9/10 | ✅ Strong |

---

## Winston (Architect) — Architecture Consistency

**Finding 1 — CRITICAL: `save_report(style: 'corporate')` parameter is wrong**

PRD Journey 2 line 328:
> `save_report(distribute_to: ['pdf_email'], style: 'corporate')`

The `style` parameter belongs to **`md_to_pdf`**, not `save_report`. Product Brief line 110 defines `md_to_pdf` CSS presets as `corporate` / `minimal` / `default`. Brief line 467 shows the correct call: `md_to_pdf(style: 'corporate')`. The `save_report` tool routes to `md_to_pdf` internally — but tool signatures are separate. If developers see this journey, they will build `save_report` with a `style` parameter that doesn't belong in its interface. This introduces a tool API design error at PRD stage.

**Fix:** Change Journey 2 Climax (line 328) to: `save_report(distribute_to: ['pdf_email'])` (style is an md_to_pdf concern, not save_report). Add note: "md_to_pdf internally applies corporate preset when triggered via pdf_email channel, or caller can invoke md_to_pdf directly."

**Finding 2 — MODERATE: Activation Gate measurement is vague**

PRD line 236: "agents.allowed_tools JSONB 비공 + company_ids 집계"

"비공" appears to be a truncation/OCR artifact — likely "비공(non-empty)" or "비어있지 않음." Product Brief line 492 provides the exact SQL:
```sql
SELECT COUNT(DISTINCT company_id) FROM agents
WHERE jsonb_array_length(allowed_tools) > 0
```
Architecture consistency requires exact query definitions at PRD stage so implementation matches measurement. The vague "집계" leaves ambiguity: does this count companies with at least 1 agent with tools ON, or all companies with any agent config?

**Fix:** Replace "비공 + company_ids 집계" with the exact SQL from the Brief.

---

## Amelia (Dev) — Implementation Complexity & Testability

**Finding 3 — CRITICAL: Publishing Adoption metric timing mismatch breaks Phase 1 success criteria**

PRD Business Success table (line 205):
> Publishing adoption — Phase 1 목표 (출시 후 30일): ≥30%

Product Brief line 496:
> "≥30% within 60 days of Phase 1 release"

**60 days ≠ 30 days.** The Brief defines this as a 60-day target, which falls in the Phase 2 measurement window. The PRD incorrectly promotes it to Phase 1 (30-day). This creates two problems for dev:
1. The telemetry query will be run at wrong milestone — pass/fail at 30 days when 60 was intended
2. If measured at 30 days, this gate will almost certainly fail (publishing adoption takes time to ramp), causing a false Phase 1 failure signal

**Fix:** Move Publishing adoption to Phase 2 column only (remove Phase 1 30-day target), or explicitly label as "Phase 1 target = N/A (60-day baseline only)."

**Finding 4 — MODERATE: Journey 4 (이수진) Phase labeling creates Phase 1/2 implementation confusion**

Journey 4 Opening Scene (line 354): "**Phase 1 이후**" — this means the journey takes place after Phase 1 (i.e., Phase 2). Yet the journey sits in the same section as Phase 1 journeys (Journeys 1–3) without explicit "Phase 2 Journey" header. The Climax (line 358) references `content_calendar updated(idea→published)` which is Phase 2. A developer reading the PRD linearly will encounter this journey and may incorrectly scope `content_calendar` into Phase 1 epics.

**Fix:** Add explicit header "(Phase 2 Journey)" to Journey 4 opening. Consider separating Phase 1 journeys (1, 2, 3, 6) from Phase 2 journeys (4, 5) with a section divider.

---

## Quinn (QA) — Edge Cases & Security

**Finding 5 — MODERATE: CEO 김대표 80% automation rate lacks dual-condition measurement spec**

PRD User Success line 195:
> "매주 보고서 자동화율 ≥80%"

Brief line 525 defines the measurement as:
> "ARGOS scheduled run completion log **AND** `save_report(distribute_to includes 'pdf_email')` success event within same `run_id`"

The PRD doesn't specify the "AND" condition — ARGOS completion alone is not sufficient (the Brief explicitly warns this). If only ARGOS completion is checked, a run that fails at send_email but completes ARGOS scheduling could be counted as "automated," inflating the metric. QA cannot write a passing test for this metric without the dual-condition specification.

**Fix:** Add measurement footnote to CEO 김대표 User Success criterion: "측정: ARGOS run completion log + 동일 run_id 내 save_report(pdf_email) success 이벤트 — 둘 다 충족 시에만 자동화 1건 집계."

**Finding 6 — LOW: Journey 6 (최민준) double-failure scenario not addressed**

Journey 6 shows SMTP failure → user requests retry → success. But what happens if SMTP is down during the retry call too? The partial failure contract (DB저장 우선 → 채널별 결과 보고) covers the first failure, but Journey 6's Resolution assumes the retry always succeeds. If SMTP is still down, the agent would loop `get_report` + `send_email` indefinitely or fail ambiguously.

**Fix:** Add one sentence to Journey Requirements Revealed: "`send_email` 최대 재시도 = 3회; 3회 실패 시 에이전트 응답: '이메일 전송이 일시적으로 불가합니다. 보고서 ID RPT-XXX는 DB에 보존되어 있어 나중에 다시 요청 가능합니다.'"

---

## Bob (SM) — Scope Realism & Schedule Risk

**Finding 7 — HIGH: Publishing adoption Phase 1 target creates false failure risk at sprint review**

(See Amelia's Finding 3 above — duplicate view from SM perspective)

If Phase 1 sprint review uses the PRD's 30-day target for publishing adoption and the metric comes in at 20% (reasonable for early adoption), the team faces pressure to extend Phase 1 or declare failure. The Brief's 60-day baseline was set deliberately — removing this buffer creates a schedule risk that could delay Phase 2 investment decision.

**Finding 8 — MODERATE: Journey 5 (박과장 audit log) is labeled "(Phase 2)" in opening but Journey Requirements table only says "Phase 2 UI"**

Journey 5 (line 368) opening: "**Opening Scene (Phase 2):**" — correctly flagged. The Journey Requirements Summary (line 407) labels "Tool Audit Log UI" as Phase 2. ✓ No discrepancy here, but the telemetry backend (tool call event log) ships Phase 1 per Brief line 644. The PRD Journey Requirements table correctly omits backend telemetry from Phase 2 items — consistent with the Brief. No fix needed.

---

## Summary: Issues Requiring Fixes

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Journey 2 line 328 | `save_report(style: 'corporate')` — wrong parameter; `style` belongs to `md_to_pdf` |
| 2 | CRITICAL | Business Success table line 205 | Publishing adoption Phase 1 target = ≥30% at 30 days; Brief says 60 days |
| 3 | MODERATE | Go/No-Go Gate line 236 | "비공 + company_ids 집계" vague; needs exact SQL from Brief |
| 4 | MODERATE | Journey 4 line 354 | Phase 2 journey not labeled as Phase 2; content_calendar Phase confusion risk |
| 5 | MODERATE | User Success line 195 | CEO automation rate lacks dual-condition (ARGOS AND send_email success) spec |
| 6 | LOW | Journey 6 requirements | Double-failure (SMTP down on retry) scenario unspecified |

**Total issues: 6 (2 critical, 3 moderate, 1 low)**

---

## Phase Label Verification (checklist)

| Item | PRD Phase | Brief Phase | Match? |
|------|-----------|-------------|--------|
| publish_x | Phase 2 | Phase 2 (downgraded from P1) | ✅ |
| content_calendar | Phase 2 | Phase 2 | ✅ |
| audit log UI | Phase 2 | Phase 2+ | ✅ |
| Notion MCP | Phase 2 | Phase 2 | ✅ |
| Playwright MCP | Phase 2 | Phase 2 | ✅ |
| Publishing adoption ≥30% | Phase 1 (30d) | 60 days | ❌ MISMATCH |

---

## Security Gate Verification

PRD line 243 vs Brief line 666:

| Element | PRD | Brief | Match? |
|---------|-----|-------|--------|
| Trigger | raw API key 1건 감지 | raw API key value detected | ✅ |
| Response | 즉시 전체 에이전트 도구 실행 중단 | immediate halt of all agent tool execution | ✅ |
| Action | Phase 1 도구 배포 롤백 | rollback Phase 1 tool deployment | ✅ |
| Blocker | Phase 2 진행 불가 | do not proceed until 100% coverage | ✅ |
| Classification | (missing in Gate table; only in note below) | P0 security incident | ⚠️ Minor: not in table row |

Security Gate language is substantively correct. The only gap is the "P0" classification is in the special note but not the Gate table row — acceptable but ideally the table row should note "P0 incident" inline.
