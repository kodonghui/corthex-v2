---
reviewer: critic-a
sections: step-03 (Success Criteria) + step-04 (User Journeys)
date: 2026-03-14
status: review-complete
---

# CRITIC-A Review: PRD Step-03 + Step-04
> Sections reviewed: lines 179–411 of prd.md
> Cross-reference: Product Brief (tools-integration/product-brief.md)

---

## Overall Scores

| Section | Score | Verdict |
|---------|-------|---------|
| Step-03: User Success | 9/10 | Strong — all 3 personas have specific measurable criteria |
| Step-03: Business Success table | 6/10 | **FAIL** — 2 confirmed errors vs Product Brief |
| Step-03: Technical Success table | 8/10 | Good, but dangling self-reference |
| Step-03: Measurable Outcomes (Go/No-Go Gates) | 9/10 | Accurate vs Brief, Security Gate language correct |
| Step-03: Product Scope | 8/10 | Well-labeled, publish_x Phase 2 correctly captured |
| Step-04: User Journeys (Journeys 1–6) | 7/10 | Narratives are specific; 1 critical Phase confusion |

**Overall Step-03+04 score: 7/10 — REQUIRES FIXES before approval**

---

## Issue 1 (HIGH — Step-03 Business Success Table)
### `Publishing adoption` placed in wrong Phase column

**Location:** prd.md line 205, Business Success table

**PRD says:**
```
| Publishing adoption | ... | ≥30% | ≥50% |
```
(Phase 1 column = 출시 후 30일, Phase 2 column = 출시 후 60일)

**Product Brief says (Layer 1 Adoption Metrics table, line ~496):**
> "≥30% within **60 days** of Phase 1 release"

**Problem:** Product Brief assigns the ≥30% publishing adoption target to the 60-day window, which maps to Phase 2 (출시 후 60일). The PRD incorrectly places it in the Phase 1 (30일) column. This misrepresents what's expected at 30 days — particularly risky because `publish_tistory` is the only Phase 1 publishing tool, and only 7 tools ship in Phase 1. Claiming ≥30% publishing adoption at 30 days is an overpromise.

**Required Fix:**
- Move ≥30% to Phase 2 column (60일)
- Phase 1 column: replace with "-" or "측정 시작 (인프라 검증)" to indicate Phase 1 is the baseline measurement period

---

## Issue 2 (HIGH — Step-03 Business Success Table)
### `Tool diversity index` metric entirely missing

**Location:** prd.md lines 199–206, Business Success table (6 rows)

**Product Brief explicitly defines (Layer 1 Adoption Metrics table):**
```
Tool diversity index | # of distinct tools called across all agent runs per company per week
  Phase 1: Week 1 ≥3 distinct tools / Week 4 ≥6 distinct tools
  Measurement: Tool call log aggregation
```

**Problem:** The PRD Business Success table has 6 metrics but omits `Tool diversity index` entirely. This is the only metric that validates whether users are exploring the tool catalog breadth vs. repetitively using 1–2 tools. A company could pass `Tool activation rate` (≥1 tool ON) while only ever calling one tool. The diversity index is the PM's early warning signal for catalog lock-in risk.

**Required Fix:**
Add row to Business Success table:
```
| Tool diversity index | 주당 company당 호출된 고유 tool 수 (mean) | Week 1: ≥3개, Week 4: ≥6개 | Week 4: ≥8개 |
```

---

## Issue 3 (MEDIUM — Step-03 Technical Success)
### "PRD NFR-P6" dangling self-reference

**Location:** prd.md line 219
```
call_agent handoff E2E | <60초 (PRD NFR-P6 — call_agent 체인만 해당)
```

**Problem:** "PRD NFR-P6" references an NFR section that does not yet exist in this PRD document. The label comes from the Product Brief (which anticipates it will be defined in the PRD), but at the time of reading Step-03, there is no NFR section to reference. A developer reading the Technical Success table will search for "NFR-P6" and find nothing.

Additionally, the Product Brief explicitly clarifies (line 510):
> "60s NFR applies to `call_agent` chains **only** — multi-tool single-agent pipelines are NOT governed by the 60s NFR"

The PRD line 219 has this clarification in parentheses, but the "PRD NFR-P6" label creates confusion until the NFR section is written.

**Required Fix:**
Replace `(PRD NFR-P6 — call_agent 체인만 해당)` with `(Product Brief 성능 기준 — call_agent 체인만 해당, 단일 에이전트 멀티툴 파이프라인 제외)` — or add a footnote: "NFR-P6 정의 예정 (Step-06 NFR 섹션)".

---

## Issue 4 (MEDIUM — Step-04 Journey 4)
### `content_calendar` implied as Phase 1 in Journey 4 narrative

**Location:** prd.md lines 354–362, Journey 4 (이수진)

**Opening Scene says:**
> "Phase 1 이후" — sets the scene as Phase 1 complete

**Climax says:**
> "콘텐츠 캘린더 updated(idea→published)" — describes content_calendar being used

**Journey Requirements says:**
> `content_calendar 상태 워크플로(Phase 2)` — correctly labeled Phase 2

**Problem:** The Climax scene (which is the memorable peak of the story) describes `content_calendar` being updated as part of a Phase 1 ("Phase 1 이후") scenario. A reader of the journey narrative — not the requirements table — will conclude content_calendar is available in Phase 1. This is a discoverability failure: the requirements table correctly labels it Phase 2, but 80% of readers won't reach the table after reading the climax.

The Product Brief explicitly defers `content_calendar` to Phase 2 because it's "valuable for 이수진 persona but not blocking core publishing."

**Required Fix:**
In the Climax scene, either:
1. Remove the content_calendar reference entirely and replace with: "에이전트가 Hub에 보고한다: 'LeetMaster 캠페인 완료: 블로그 3개 발행(링크 첨부).'"
2. Add explicit Phase marker in parentheses: "콘텐츠 캘린더 updated (Phase 2 기능 — 현재 미구현)"

Option 1 preferred — the journey narrative should not demonstrate Phase 2 features in a Phase 1 scenario without clear visual separation.

---

## Section-by-Section Feedback

### John (PM) — User Success + Business Success

**User Success (9/10):**
All 3 personas are measurable and distinct. 김지은's <30분 measurement boundary ("CORTHEX 내 설정 시간만, 외부 플랫폼 토큰 발급 제외")는 특히 잘 쓰여졌다 — 이 경계 없이 측정 불가능해진다. CEO 김대표의 80% automation rate 측정 방법이 Brief line 525의 "ARGOS completion **AND** save_report success within same run_id" 조건을 명시하지 않는 것이 아쉽다 — 단순 ARGOS 완료만으로는 이메일 배포 확인이 안 됨.

**Business Success (6/10):**
Issues 1, 2 위에 기재됨. `SaaS substitution proxy` 지표 추가는 좋은 PM 본능 — Brief에 없는 지표를 추가해서 비즈니스 가치를 더 명확히 한다. 그러나 `Tool diversity index`를 누락하면 Phase 2 투자 승인 시 "사람들이 툴을 1–2개만 쓰는 건 아닌가?" 질문에 데이터가 없다.

### Sally (UX) — User Journeys

**Journey 1 (김지은) — 9/10:** Opening scene 시간 기록 (2시간 37분 → 7분)과 Predis.ai 청구서 디테일이 탁월. 실제 사용자 좌절을 구체적으로 포착.

**Journey 2 (CEO 김대표) — 9/10:** "깨어 있지 않았다" 클라이맥스 표현이 Solo Operator의 진짜 Aha! 포착. `distribute_to: ['pdf_email']` 파라미터가 정확히 명시됨.

**Journey 3 (박현우) — 8/10:** "MCP 붙이는 게 설정이지 개발이 아니다" 해상도 문장이 핵심 가치를 1문장으로 포착. `연결 테스트` UI 요소가 Rising Action에 등장하지만 Journey Requirements에도 연결 상태 표시기로 매핑됨 — OK.

**Journey 4 (이수진) — 6/10:** Issue 4 위에 기재됨. content_calendar Phase confusion이 가장 큰 문제.

**Journey 5 (박과장) — 9/10:** Opening Scene Phase 2 레이블 명시. 89,000페이지 크롤링 숫자가 감사 로그 가치를 즉시 전달.

**Journey 6 (최민준) — 9/10:** 부분 실패 계약을 에이전트 응답 텍스트로 보여주는 것이 최선의 방법 — "send_email 실패 (SMTP 오류). 보고서는 DB에 저장됨 (ID: RPT-2026-0314-042)." run_id 기반 재조회 패턴도 명확히 드러남.

### Mary (BA) — Business Case + ROI

**Product Scope (8/10):** Phase 1/2/3/4+ 경계가 Brief와 일치. publish_x Phase 2 강등 이유($200/월 파일럿 비용 게이트) 명시됨 — BA 입장에서 비용-가치 의사결정 근거가 보임.

**Journey Requirements Summary table (8/10):** 15개 행이 6개 여정을 전부 커버. `Async job queue` Phase 3 레이블 정확. 단, Phase 1이어야 하는 `Reports UI`가 table에 있는데, Brief "Phase 1 UI Additions" 섹션과 일치 — OK.

---

## Summary of Required Fixes (Priority Order)

| # | Priority | Section | Fix |
|---|----------|---------|-----|
| 1 | HIGH | Business Success table (line 205) | Publishing adoption ≥30% → Phase 2 column(60일); Phase 1 column → "-" |
| 2 | HIGH | Business Success table (after line 206) | Add `Tool diversity index` row: Week 1 ≥3, Week 4 ≥6 distinct tools |
| 3 | MEDIUM | Technical Success table (line 219) | Replace "PRD NFR-P6" with "Product Brief 성능 기준 — call_agent 체인만" |
| 4 | MEDIUM | Journey 4 Climax (line 358) | Remove or Phase-label content_calendar reference |

---

## Cross-Check Results

| Check Item | Result |
|-----------|--------|
| Security Gate language vs Brief | ✓ Matches — "즉시 전체 중단 + 롤백 + Phase 2 불가" |
| Pipeline Gate measurement (run_id) | ✓ PRD upgraded correctly from Brief's agent_id+10min to run_id |
| publish_x Phase 2 label | ✓ Correct — $200/월 게이트 이유 명시 |
| content_calendar Phase 2 label (requirements table) | ✓ Correct in table |
| audit log UI Phase 2 label | ✓ Correct |
| partial failure contract in Journey 6 | ✓ Matches Brief — DB 저장 우선, 롤백 없음, 채널별 보고 |
| Journey Requirements Summary phase labels | ✓ All Phase 1/2/3 correct |
