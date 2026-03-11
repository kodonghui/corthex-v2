# [Critic-A Review] step-02: Executive Summary + Core Vision

**Reviewed:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` Lines 24-125
**Cross-referenced:** `_research/tool-reports/05-caching-strategy.md`, `v1-feature-spec.md`, `prd.md`

---

## Agent Discussion (in character)

**John (PM):** "The $1,350+/월 for 50-agent scenario is a great hook, but where does '100회/일' come from? Is this 100 calls per agent per day — so 50 agents × 100 calls = 5,000 calls/day total? Or 100 calls total across all agents? This ambiguity makes the entire financial projection house of cards. If it's 100 calls total (2 calls/agent/day), then the real per-agent savings story looks far less urgent. Stakeholders will immediately ask this, and the document gives them no answer. The detective in me says: no evidence, no claim."

**Sally (UX):** "I keep staring at the flow diagram and thinking: what does a real user actually see when semantic cache hits? The diagram shows '비용 $0, 응답 ≤ 100ms' — great for engineers. But in the Hub UI, if someone on the financial team asks '삼성전자 주가 어때?' and gets a cached answer from 58 minutes ago with zero indication it's stale, they might make a real trading decision on bad data. There's no mention of a 'cached result' badge, timestamp, or warning in the UX. For a fintech platform with 125+ financial tools, that's not a UX problem — it's a liability. A real user would trust the response without knowing it's cached."

**Mary (BA):** "I'm excited by the pgvector reuse angle — zero additional infra cost is a great business story. But I'm puzzled by the layer numbering mismatch between this document and the research report. The research report (`05-caching-strategy.md` §1) explicitly labels Tool Result Caching as 'Layer 3 (Phase 2)' and Semantic Caching as 'Layer 2 (Phase 3+)'. This brief reverses that, calling Tool Result Caching 'Story 15.2' and Semantic Caching 'Story 15.3'. When we go to stakeholder presentations or developer briefings, which numbering wins? Inconsistency in foundational documents creates confusion and erodes trust in the planning process."

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **HIGH** | Sally (UX) | **Semantic Cache Staleness UX Risk** — The solution shows cosine similarity > 0.95 returns cached responses immediately, but for financial queries (주가, 공시, 뉴스) a 58-minute-old cached answer could cause real harm. No TTL-per-query-type is shown in the Executive Summary or flow diagram. Research report §3.2 explicitly marks "실시간 데이터 (주가, 뉴스)" as **부적합** for semantic caching, but this brief doesn't surface that constraint at the vision level. Users on Hub will have no idea a response is cached. | Add a "Semantic Cache 적합/부적합 쿼리 유형" table to Core Vision section. Add 'Semantic Cache TTL per-agent setting (기본 1시간)' to the flow diagram. Add UI note: cached responses show a ⚡ Cache badge + timestamp in Hub. |
| 2 | **HIGH** | John (PM) | **"100회/일" Baseline Undefined** — All financial projections ($0.90/일, $27/월, $1,350+/월 for 50 agents) depend on this number, but it's never defined as per-agent or total-across-platform. If 100회/일 is total (not per-agent), the 50-agent scenario drops from $1,350+/월 to $27/월 — a 50× difference in urgency. The research report also uses 100/일 without definition. | Add parenthetical: "100회/일 = 에이전트 1명 기준 하루 100 호출 (v1 실측 기반 또는 추정 명시 필요)". If real data exists from v1, cite it. If estimated, mark as "추정값". |
| 3 | **MEDIUM** | Mary (BA) | **Layer Numbering Inconsistency vs. Research Report** — Research report §1 table: Layer 1=Prompt Caching, Layer 2=Semantic Caching (Phase 3+), Layer 3=Tool Result Caching (Phase 2). Brief reverses Layers 2 and 3 in Story numbering (15.2=Tool, 15.3=Semantic). The runtime flow diagram (Semantic first → Prompt → Tool) further differs from both. Three different orderings exist: (A) research priority order, (B) Story implementation order, (C) runtime execution order. | Add a note box: "스토리 번호 = 구현 순서 (쉬운 것부터). 런타임 실행 순서와 다름. 런타임: Semantic → Prompt → Tool". Align the layer labels across research report and brief, or explicitly state the numbering rationale. |
| 5 | **HIGH** | Mary (BA) | **D13 조기 해제 비즈니스 정당성 누락** — 아키텍처.md D13은 캐싱 전략을 "에이전트 100명+ 시 재검토 (Phase 5+)"로 명시적 Defer했다. Epic 15는 현재 Phase 1~4 범위에서 D13을 조기 해제하는 것이다. Brief는 "D8 결정 확장, 위반 아님"을 Key Differentiator로 내세우지만, D13 조기 해제에 대한 비즈니스 정당성(현재 에이전트 수 N명 + 실측 비용 데이터)이 전혀 없다. 의사결정권자가 "아직 100명 안 됐는데 왜 지금?"이라고 물으면 답이 없다. | Problem Statement에 "D13 조기 해제 근거: Prompt Caching은 에이전트 수와 무관하게 1줄로 즉각 절감 가능. 현재 N명이어도 $27/월 낭비는 지금 발생 중"을 명시. 에이전트 수 미달 시에도 ROI가 양수임을 수치로 표시. |
| 4 | **LOW** | John (PM) | **Missing Cache Miss Rate Assumptions for 60~80% Projection** — The "60~80% 총 절감" claim is compelling but opaque. Semantic Cache at ~73% reduction assumes some hit rate. What hit rate? Research report §5 table says "Semantic Caching ~73% (히트율 기준)" — but what's the assumed hit rate %? For a new deployment with zero cache history, Day 1 savings = 0% from Semantic Cache. | Add: "시맨틱 캐시 히트율 가정: 초기 0% → 30일 후 ~40~60% (FAQ성 질문 비율 추정)". Show Day 1 vs. Steady State savings separately. |

---

---

## Cross-Talk with Critic-B

**Critic-B raised:**
1. Semantic Cache 범용 적용 오류 — flow diagram이 per-agent `enableSemanticCache` 플래그 없이 모든 쿼리에 Semantic Cache를 적용함
2. SDK cache_control 호환성 미검증 — 연구보고서 §2.4 "PoC 확인 필요"를 Brief가 "검증된 1줄 변경"으로 단정
3. D13 조기 구현 비즈니스 정당성 문의

**Critic-A 응답:**

Issue 1 (Semantic Cache 범용 적용) — **완전 동의. 사용자 신뢰 파괴 수준.** 내 Issue #1과 동일 근원이지만 Critic-B가 더 정확히 짚었다: 연구보고서 `semantic-cache.ts` 코드 예시에는 `agent.enableSemanticCache` 플래그가 있는데 (§3.5), 흐름도는 이 조건문을 생략했다. CEO가 "삼성전자 지금 주가?" 물어보고 58분 된 답을 받으면 플랫폼 신뢰는 무너진다. 이건 HIGH → **CRITICAL**로 격상이 맞다.

Issue 2 (SDK 호환성 미검증) — **동의. 내가 놓친 기술 리스크.** 아키텍처.md에서 "Bun runtime Node.js와 SDK 호환성 PoC 통과 확인 완료"라고 되어있지만, cache_control 필드 지원은 별도 PoC가 필요하다. Brief가 "1줄 변경"이라고 단정한 것은 검증 전에 확정 사실로 기술한 오류다.

Issue 3 (D13 조기 구현 정당성) — **아키텍처.md D13 확인 결과**: "캐싱 전략 — 에이전트 100명+ 시 재검토" + "캐싱: 없음. 에이전트 50명 = DB 행 50개, 조회 ≤ 1ms. Phase 5+ 재검토." Epic 15는 D13을 조기 해제하는 것인데, Brief에 그 비즈니스 정당성이 없다. (DB 쿼리 캐싱이 아닌 Claude API 토큰 캐싱이므로 D8/D13과 다른 레이어라는 설명은 있으나, D13 명시적 해제 근거가 없음) → **추가 Issue #5로 등록.**

---

## v1-feature-spec Coverage Check

- Features verified:
  - v1 has 125+ tools across financial, legal, marketing categories → Tool Result Caching covers all (TTL-per-tool design matches v1 tool diversity)
  - v1 Soul system (마크다운 파일, 웹 UI 편집 가능) → Prompt Caching correctly identifies Soul as the cache target
  - v1 에이전트 계급 3단계 (Manager/Specialist/Worker) → Multi-agent simultaneous calls (동시 에이전트 10개) accurately represents v1 parallel execution

- Gaps found:
  - **v1 has `get_current_time` and `generate_image` tools** (always-fresh, per research report TTL=0). Brief mentions these in research but **not in Key Differentiators or flow diagram**. Brief should note that TTL=0 tools are excluded from Tool Cache — this is a correctness boundary that v1 users need to understand.
  - **v1 has `/전체` (6-agent simultaneous dispatch)** — this is the highest-impact scenario for Tool Cache (6 agents calling `kr_stock` simultaneously → 6× external API calls vs. 1× with cache). Brief mentions "에이전트 10개 동시" but could specifically reference this v1 pattern to make the business case more concrete.

---

## Verification Results (Post-Fix)

| Issue | Status | Notes |
|-------|--------|-------|
| [CRITICAL] Semantic Cache 범용 적용 | ✅ RESOLVED | `enableSemanticCache` 플래그 흐름도 반영 + 적합/부적합 표 추가 (lines 98-123) |
| [HIGH] 100회/일 기준 미정의 | ✅ RESOLVED | "에이전트 1명 × 하루 100 호출 (추정값)" 기준 블록 (line 46) |
| [HIGH] D13 조기 해제 정당성 | ✅ RESOLVED | D13 조기 해제 근거 단락 추가, architecture.md 업데이트 필요성 명시 (line 58) |
| [HIGH] SDK PoC 미검증 | ✅ RESOLVED | "PoC 검증 필요, 실패 시 messages.create 대안" 명시 (lines 30, 128) |
| [LOW] 히트율 가정 누락 | ✅ RESOLVED | "Day 1: 0% → 30일 후 40~60%" 명시 (lines 32, 141) |

**Final Score: 9/10**
- 5개 이슈 전부 해결, 구체적 수치와 조건 모두 반영됨
- -1점: 100회/일이 "추정값"으로만 표시됨 (v1 실측 데이터 부재). 허용 범위이나 향후 실측 데이터로 교체 권장.
