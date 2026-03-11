## [Critic-B Review] Step-04: Success Metrics + KPIs

**File reviewed:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 234–302
**References checked:** architecture.md (D1~D16, E1~E10), prd.md (NFRs), `_research/tool-reports/05-caching-strategy.md`

---

### Agent Discussion (in character, cross-talking)

**Winston (Architect):**
The most critical flaw in this section is a mathematical contradiction between two simultaneous PASS criteria. The metrics table targets Prompt Cache 히트율 ≥ 70% AND Prompt Cache 비용 절감율 ≥ 85% — both measured at "Story 15.1 배포 후 1주." These are mutually exclusive. Doing the math at $1.5/MTok (the implicit rate from the research §2.3 calculation): with 70% hit rate, Soul token cost = (70 reads × $0.15/MTok + 30 inputs × $1.5/MTok) × 4,000tok/call = ($0.042 + $0.18) = $0.222/day. Savings vs baseline ($0.60/day) = 63%. NOT 85%. To achieve 85% savings you need ~96% hit rate. A system that passes the 70% hit rate KPI will FAIL the 85% savings KPI at the same measurement time. This is a broken test definition that will cause confusion at release.

**Amelia (Dev):**
`_bmad-output/planning-artifacts/epic-15-caching-brief.md:294`. KPI-4 says "Semantic Cache 히트율: `semantic_cache` 테이블 레코드 수 증가 추이. similarity ≥ 0.95 쿼리 비율." But table record count ≠ hit rate. Hit rate = hits / total_lookups. The current `semantic_cache` table design (research §3.4) stores only cached entries — it has no lookup attempt log. Every cache miss is invisible. To measure hit rate, you need `log.info({ event: 'semantic_cache_miss' })` instrumentation in `engine/semantic-cache.ts`. That's missing from the implementation scope. Without it, "히트율" is unmeasurable — you only know how many items are cached, not how often they're retrieved vs missed.

**Quinn (QA):**
Three edge cases in the KPI definitions: (1) KPI-1 PASS criteria is `cache_read_input_tokens > 0` — this passes even if only 1 out of 100 calls hits the cache. The PASS bar is too low for a "캐싱 활성화 증명" claim. A better threshold is `cache_read_input_tokens > 0` on the SECOND call specifically (which is what the test procedure already says — "동일 에이전트 연속 2회 호출"), but the PASS criteria should explicitly say "on the 2nd consecutive call within 5 minutes, `cache_read_input_tokens` > 0." (2) Line 247: "캐싱 장애 시 서비스 연속성 — 서비스 중단 0건" — what constitutes a "장애"? If `lib/tool-cache.ts` throws, does it propagate? If `engine/semantic-cache.ts` fails, does `agent-loop.ts` catch it? The graceful fallback behavior is assumed but not specified in any story scope. (3) TTFT measurement uses `processing → message` interval (line 245). This excludes the 2-second SDK spawn time. The `accepted → message` interval is what the user actually experiences. The measurement will systematically overstate the TTFT improvement by ~2 seconds.

**Bob (SM):**
Two scope clarity issues: (1) KPI-3 says PASS at "히트율 ≥ 20% (초기 1주)" but the metrics table says "≥ 40% (동시 에이전트 10명 시나리오)." Semantic Cache shows tiered targets (15% → 40%) in both places. Tool Cache shows 40% in the table but only 20% in KPI-3. The table needs to match: "≥ 20% (1주 초기) → ≥ 40% (30일 안정기)." Sprint reviewers will be confused which target to check at the 1-week mark. (2) KPI-5 sub-metric "에이전트 수 +50% 시 API 비용 증가율 ≤ +30%": how does this get measured in production? You'd need a controlled experiment: hold usage constant while adding 50% more agents. That's impossible to do cleanly in a live system. The metric is not operationally measurable as stated.

**Winston (cross-talk with Quinn):**
Quinn, the TTFT measurement issue you raised is important but I want to add an architectural dimension. The `processing` event fires when `query()` completes its spawn. But Prompt Caching specifically reduces the time WITHIN `query()` — the TTFT reduction from caching is the time from when the LLM starts processing to when it outputs the first token. The `processing → message` interval does capture this internal LLM processing time reduction. So while not perfect from a user perspective, it IS measuring the right thing from a caching mechanism perspective. My concern is more about the 70%/85% contradiction — that's structurally broken.

---

### Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **HIGH** | Winston | **Prompt Cache 히트율 ≥ 70%와 비용 절감율 ≥ 85%가 수학적으로 불일치.** 1주 시점 동시 측정 기준. 85% 절감은 ~96% 히트율 필요 (연구보고서 §2.3 수치 역산). 70% 히트율 달성 시 실제 절감율은 ~63%만 가능. 두 기준 동시 PASS 불가능. | (A) 히트율 목표를 ≥ 90%로 상향, 또는 (B) 비용 절감율 목표를 ≥ 60%로 하향하고 ≥ 85%는 "30일 안정기" 목표로 이동. 단, 연구보고서 §2.3은 높은 히트율을 전제하므로 (A) 권장. |
| 2 | **MEDIUM** | Amelia | **KPI-4 Semantic Cache 히트율 측정 불가.** "semantic_cache 테이블 레코드 수 + similarity ≥ 0.95 쿼리 비율"로는 hit rate(히트/총 조회 시도)를 계산할 수 없음. 캐시 미스가 기록되지 않음. | `engine/semantic-cache.ts`에 `log.info({ event: 'semantic_cache_miss', companyId })` 추가를 Story 15.3 scope에 명시. 측정 방법을 "miss 로그 카운트 / (hit + miss) 전체"로 수정. |
| 3 | **MEDIUM** | Quinn | **KPI-1 PASS 기준이 불완전.** "cache_read_input_tokens > 0"는 1건이라도 히트하면 통과. "캐싱 활성화 증명"으로서 의미 없는 기준. | PASS 기준을 "동일 에이전트 5분 내 2회 연속 호출 시, 두 번째 호출의 cache_read_input_tokens > 0 AND > 첫 번째 호출의 80% 수준"으로 강화. |
| 4 | **MEDIUM** | Bob | **Tool Cache 히트율 목표 불일치.** metrics table: ≥ 40% (측정 시점 "1주"). KPI-3: ≥ 20% PASS (초기 1주). 동일 측정 시점에 다른 기준 적용 → 명확성 훼손. | metrics table의 Tool Cache 히트율을 "≥ 20% (1주 초기) → ≥ 40% (30일 안정기)"로 Semantic Cache와 동일한 단계적 표현으로 수정. |
| 5 | **LOW** | Bob | **KPI-5 확장성 부지표 측정 불가.** "에이전트 수 +50% 시 API 비용 증가율 ≤ +30%" — 프로덕션 라이브 시스템에서 에이전트 수를 통제 조건으로 변경하는 실험 불가. | 측정 방법을 "실제 에이전트 확장 이벤트 발생 시 비용 추이 관찰 (수동, 분기 리뷰)"로 수정. 또는 추정 공식으로 대체: "에이전트 N명 기준 캐싱 전 예상 비용 vs 실측 비용 비율". |

---

### Architecture Consistency Check

**Checked against: architecture.md decisions D1–D16, patterns E1–E10**

| 항목 | 상태 | 상세 |
|------|------|------|
| D1 (getDB/companyId) | ✅ 준수 | "멀티테넌시 격리 — 다른 companyId에서 동일 쿼리 → 캐시 미공유" 명시 (line 248) |
| D10 (테스트 전략) | ✅ 준수 | KPI-1/3 측정이 bun:test + 서버 로그 기반. CI 자동화 가능 |
| NFR 비용 | ✅ 연계 | BO-4 "Tool Cache < 100MB" → NFR-SC7 메모리 제약과 일치 |
| BO-3 품질 측정 | ✅ 좋음 | Epic 12 A/B 프레임워크 활용 명시. 회귀 방지 안전망 확보 |
| KPI-2 측정 공식 | ⚠️ 개선 필요 | `cache_read_cost / (cache_read_cost + cache_creation_cost + input_cost)` = 캐시 비중 측정. "캐싱 전 대비 절감율"이 아님. 기준선 비교 공식 누락. |

**Contradictions found:**
1. **CRITICAL**: Prompt Cache 히트율 ≥ 70% (metrics table) + 비용 절감율 ≥ 85% (KPI-2) — 동시 측정 1주 시점에서 수학적으로 공존 불가.
2. Tool Cache 히트율 ≥ 40% (table) vs KPI-3 PASS ≥ 20% — 동일 시점 다른 기준.

---

### Cross-talk Outcome (Critic-A 응답 반영)

**Critic-A 추가 발견:**
- **[HIGH] 5분 TTL vs 14.4분 평균 호출 간격 불일치**: 100회/일 기준 호출 간격 = 14.4분. Ephemeral TTL 5분이면 매 호출 시 캐시 만료 → 실제 히트율 ≈ 0%. 버스트 패턴(5분 내 연속 호출)에서만 70% 달성 가능. 내 Issue #1과 같은 뿌리이지만 다른 각도: 히트율 70% 목표 자체가 평균 사용 패턴에서 달성 불가능한 수치임을 확인.
- **[HIGH] TTFT 목표값 step-02 불일치**: metrics table "≥ 80% 단축" vs step-02 확정값 "85%" — 같은 Anthropic 공식 수치인데 불일치. 기준선(캐싱 전 TTFT 측정값) 자체도 없음.
- **[LOW] BO-2 vs KPI-5 외삽 충돌**: BO-2 "에이전트 2배 → 비용 ≤ 1.4배" / KPI-5 "에이전트 +50% → 비용 ≤ +30%". 두 공식에서 외삽 시 다른 결과 도출.

**Critic-A 질문 — cost_tracker Hook 로그 + semantic_cache 테이블 기술적 실현 가능성 (내 답변):**

1. **cost_tracker Hook 로그 형식 문제 (architecture.md E2 참조):**
   Stop Hook 시그니처: `(ctx: SessionContext, usage: { inputTokens: number; outputTokens: number }) => void`
   **`cache_read_input_tokens`, `cache_creation_input_tokens` 필드가 없음.**
   KPI-2 공식 `cache_read_cost / (cache_read_cost + cache_creation_cost + input_cost)`는 이 두 필드가 필요하지만, 현재 Stop Hook이 받는 `usage` 객체에 포함되지 않음. Claude Agent SDK response에서 이 값을 추출하려면 Stop Hook 시그니처 자체를 확장하거나, SDK response 객체를 직접 접근해야 함. **이것은 architecture.md E2를 위반 없이 해결하려면 Stop Hook usage 타입 확장 필요** — Story 15.1 scope에 명시 필요.

2. **semantic_cache 테이블 쿼리 방식 문제:**
   내 Issue #2와 동일 — miss 로그 없이 hit rate 측정 불가. `engine/semantic-cache.ts` 구현 시 miss 로그 추가가 Story 15.3 scope에 포함되어야 함.

**합산 이슈 (크로스토크 후 최종):**
| 심각도 | 이슈 | 출처 |
|--------|------|------|
| HIGH | 히트율 70% vs 비용 절감율 85% 수학적 불일치 + 5분 TTL vs 14.4분 간격 문제 | 양쪽 공통 |
| HIGH | TTFT 80% (table) vs 85% (step-02) 불일치 + 기준선 없음 | Critic-A 발견 |
| HIGH | Tool Cache 히트율 목표 불일치 (table 40% vs KPI-3 20%) | 양쪽 공통 |
| MEDIUM | KPI-4 Semantic Cache 히트율 측정 불가 (miss 로그 없음) | 내 발견 |
| MEDIUM | KPI-1 PASS 기준 너무 낮음 (> 0 한 건이면 통과) | 내 발견 |
| MEDIUM | cost_tracker Stop Hook usage 타입에 cache 토큰 필드 없음 | 크로스토크 추가 |
| LOW | KPI-5 확장성 지표 측정 불가 | 양쪽 공통 |
| LOW | BO-2 vs KPI-5 수치 외삽 충돌 | Critic-A 발견 |
