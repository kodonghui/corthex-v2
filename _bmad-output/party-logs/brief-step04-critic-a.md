# [Critic-A Review] step-04: Success Metrics + KPIs

**Reviewed:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` Lines 234-302
**Cross-referenced:** `_research/tool-reports/05-caching-strategy.md`, step-02/03 결정사항

---

## Agent Discussion (in character)

**John (PM):** "Prompt Cache 히트율 70% 목표를 보자. 측정 방법은 `cache_read_input_tokens / input_tokens`로 명확하다. 그런데 step-02에서 확정한 기준선이 '에이전트 1명 × 하루 100회/일 추정값'이다. 100회/일을 24시간으로 나누면 평균 14.4분 간격. Claude API ephemeral TTL은 5분. 14분 간격 호출에 5분 TTL이면 매 호출마다 캐시가 이미 만료된 상태다 — 이론상 히트율 ≈ 0%. 70% 목표는 어디서 나왔나? 호출이 '버스트' 패턴(짧은 시간에 몰리는)일 때만 달성 가능하다. 근거 없는 목표는 KPI가 아니라 소망이다."

**Sally (UX):** "TTFT 80% 단축 측정 방법을 봤는데 — 'SSE `processing` → `message` 이벤트 간격'이라고 했다. 그런데 CORTHEX v2의 실제 SSE 이벤트 이름이 `processing`인지, 그리고 이 이벤트가 실제로 발화되는지 코드 확인이 필요하다. 더 중요한 건 기준선(baseline)이 없다는 것이다. '기존 대비 80% 단축'인데 기존 TTFT가 평균 몇 ms인지 측정된 데이터가 없으면 80% 달성 여부를 판단할 수 없다. Step-02에서 성능 영향에 'TTFT 85% 단축'이라고 했는데 여기서는 80%로 바뀌었다 — 어떤 게 맞나?"

**Mary (BA):** "BO-2가 흥미롭다: '에이전트 수 2배 시 비용 ≤ 1.4배'. 근거가 없다. Prompt Cache로 Soul 비용 85%를 절감해도, 대화 히스토리·신규 메시지 비용은 에이전트 수에 정비례한다. Soul이 전체 비용의 X%라면 계산이 달라진다. 그리고 KPI-5에서는 '에이전트 +50% 시 비용 증가율 ≤ +30%'라고 했는데, 이걸 선형 외삽하면 +100% 시 ≤ +60%가 되어 BO-2의 ≤ 1.4배(+40%)와 충돌한다. 같은 목표를 두 곳에서 다르게 표현하고 있어서 의사결정권자가 어느 숫자로 판단해야 할지 모른다."

---

## Issues Found

| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | **CRITICAL** | John (PM) + Critic-B | **Prompt Cache 히트율 70% vs 비용 절감율 85% — 수학적 공존 불가** — 히트율 70%의 실제 절감율 ≈ 55% (수학 검증: (0.7N×$0.0012 + 0.3N×$0.015) / N×$0.012 ≈ 44.5% 수준). 85% 절감에 필요한 히트율 = ~96%. 동일 측정 시점(1주)에 두 기준이 공존 불가. 추가: 100회/일 기준 평균 호출 간격 14.4분 > ephemeral TTL 5분 → 분산 호출 시 히트율 ≈ 0% (버스트 패턴 없이는 70%도 불가). | 두 지표를 분리: (A) "1시간 TTL 사용 시 히트율 ≥ 90%, 비용 절감 ≥ 85%", (B) "ephemeral(5분) TTL 시 히트율 ≥ 70%는 버스트 시나리오 전용". 또는 Story 15.1에서 1시간 TTL을 기본으로 채택하고 목표 재산출. |
| 1a | **HIGH** | John (PM) | **Prompt Cache 70% 히트율 목표 — 5분 TTL과 호출 간격 불일치** — 100회/일 기준 평균 호출 간격 14.4분. Claude API ephemeral TTL 5분. 균등 분포 시 매 호출마다 캐시 만료 → 히트율 ≈ 0%. 70% 달성은 버스트 패턴(짧은 시간 집중 호출)을 가정해야 가능. 기준선 근거 없음. KPI-2 "FAIL 기준"에서 이 문제를 인식하고 있으나 Success Metric 70% 목표 자체가 잘못된 가정에 기반할 수 있음. | 목표값을 호출 패턴별로 분리: "버스트 시나리오(5분 내 재호출): ≥ 70%. 분산 호출(14분 간격): 1시간 TTL 전환 필요 — 5분 ephemeral은 분산 호출에 효과 거의 없음." 또는 1시간 TTL(Story 15.1 옵션)을 기본으로 검토하고 목표값 재계산. |
| 2 | **HIGH** | John (PM) | **Tool Cache 히트율 목표 불일치 — Success Metrics 40% vs KPI-3 20%** — Line 242: Success Metrics 표에 "≥ 40% (동시 에이전트 10명 시나리오)". Line 289: KPI-3 "PASS 기준: 히트율 ≥ 20% (초기 1주)". 같은 1주 시점에 서로 다른 목표값. 어느 숫자로 Pass/Fail을 판단하나? | 불일치 해소: Success Metrics 표를 KPI와 일치시키거나, 명시적으로 "초기 1주 ≥ 20%, 안정기 ≥ 40%"로 단계 구분하여 표에 반영. |
| 3 | **HIGH** | Sally (UX) | **TTFT 측정 기준선(baseline) 없음 + 이벤트 이름 미검증** — Line 245: "기존 대비 ≥ 80% 단축"인데, '기존 TTFT' 측정값이 없다. 또한 step-02에서는 "TTFT 85% 단축"으로 명시했는데 여기서는 80%로 다르다. SSE `processing` 이벤트가 CORTHEX v2에 실제로 존재하는지도 코드 미확인 상태. 기준선 없이는 달성 여부 판단 불가. | TTFT 기준선 측정 추가: "Story 15.1 배포 전 동일 에이전트 10회 호출 평균 TTFT = X ms (기준선 측정 필요)". 이벤트 이름은 실제 SSE 구현 확인 후 업데이트. 목표값을 step-02와 통일: "≥ 85% 단축 (Anthropic 공식값)". |
| 6 | **HIGH** | Critic-B | **E2 Stop Hook usage 타입 확장 — KPI-2 측정의 전제조건 누락** — KPI-2 공식(line 282): `cache_read_cost / (cache_read_cost + cache_creation_cost + input_cost)`. 이 계산에 필요한 `cache_read_input_tokens`, `cache_creation_input_tokens`가 현재 E2 Stop Hook 시그니처에 없음. architecture.md E2: `(ctx, usage: { inputTokens: number; outputTokens: number }) => void`. Claude API 응답에는 이 필드들이 있으나 Hook에 전달되지 않으면 KPI-2 측정 자체가 불가. Story 15.1 scope에 E2 usage 타입 확장이 포함되어야 함 — 현재 Brief에 언급 없음. | Story 15.1 구현 범위에 명시: "E2 Stop Hook usage 타입 확장: `cache_read_input_tokens?: number; cache_creation_input_tokens?: number` 추가. Claude API 응답에서 해당 필드 전파." KPI-2 측정 방법에 "(E2 타입 확장 필요 — Story 15.1 scope)" 주석 추가. |
| 5 | **MEDIUM** | Critic-B | **KPI-4 Semantic Cache 히트율 측정 불가 — miss 로그 없음** — Line 294: "`semantic_cache` 테이블 레코드 수 증가 추이"로 히트율 측정. 그러나 hit rate = hit/(hit+miss)에서 miss는 테이블에 기록되지 않는다. `engine/semantic-cache.ts`에서 similarity < 0.95 (미스) 케이스는 로그가 없으면 분모를 알 수 없다. KPI-4 PASS 기준(히트율 ≥ 15%) 달성 여부를 판단할 수 없음. | Story 15.3 scope에 `log.info({ event: 'semantic_cache_miss', companyId, similarity: bestSimilarity })` 추가 명시. KPI-4 측정 방법을 "서버 로그에서 `semantic_cache_hit` + `semantic_cache_miss` 카운트 비율"로 수정. |
| 4 | **LOW** | Mary (BA) | **BO-2 1.4배 근거 없음 + KPI-5 확장성 수치 불일치** — BO-2: "에이전트 2배 시 ≤ 1.4배 비용". KPI-5: "에이전트 +50% 시 ≤ +30%". +50% 시 +30%를 선형 외삽하면 +100% 시 약 +60% → BO-2의 +40%와 불일치. 두 곳에서 다른 숫자. 또한 1.4배 계산 근거(Soul 비용 비중 × 캐싱 절감율)가 없음. | BO-2 계산 근거 명시: "Soul 비용이 전체의 약 67% ($18/$27) → Soul 캐싱 85% 절감 시 에이전트 2배 = 2 × ($27 - $18×0.85) = 2 × ($27 - $15.3) = 2 × $11.7 = $23.4 (기존 2배 $54 대비 43% 수준)". KPI-5 확장성 수치를 BO-2와 일치시킴. |

---

## Cross-Talk with Critic-B

**Critic-B raised:**
1. [HIGH] Prompt Cache 히트율 70% vs 비용 절감율 85% 수학적 불일치 — 역산 결과 85% 절감에는 ~96% 히트율 필요. 70% 히트율 시 실제 절감 ≈ 55%. 같은 1주 시점에 두 기준 공존 불가.
2. [MEDIUM] KPI-4 Semantic Cache 히트율 측정 불가 — `semantic_cache` 테이블 레코드 수로는 miss를 알 수 없음. `log.info({ event: 'semantic_cache_miss' })` 필요.

**Critic-B 추가 발견:**
- `cost_tracker` Hook (E2 Stop Hook) 타입 시그니처에 `cache_read_input_tokens`, `cache_creation_input_tokens` 필드 없음. architecture.md E2: `(ctx, usage: { inputTokens: number; outputTokens: number }) => void`. KPI-2 공식이 이 필드들을 요구 → E2 타입 확장이 Story 15.1 scope에 포함되어야 함. → **Issue #6으로 추가.**

**Critic-A 응답:**

Issue 1 (히트율 70% vs 절감 85% 수학 불일치) — **완전 동의. 내 Issue #1(5분 TTL 문제)의 근본 원인과 연결된다.** 수학 검증:
- Without cache: N × 4,000tok × $3/MTok = N × $0.012
- With 70% hit rate: (0.7N × $0.0012) + (0.3N × $0.015) = N × $0.00534
- 절감율 = 1 - ($0.00534/$0.012) ≈ 55%. (85% 아님)
- 85% 달성에 필요한 히트율: `H × $0.0012 + (1-H) × $0.015 = $0.0018` → H ≈ 96%

즉, 70% 히트율 목표와 85% 절감율 목표는 수학적으로 동시 달성 불가. 둘 중 하나를 수정해야 한다. 내 Issue #1에 Critic-B의 수학 증명을 추가해 **CRITICAL로 격상** 필요.

Issue 2 (Semantic Cache miss 로그 없음) — **동의. 측정 불가 KPI는 무의미하다.** `semantic_cache` 테이블 레코드만으로는 hit rate = hit/(hit+miss)에서 miss를 알 수 없다. Story 15.3 scope에 `log.info({ event: 'semantic_cache_miss', companyId })` 추가가 필요하고, KPI-4 측정 방법에 이를 명시해야 한다. **Issue #5로 추가.**

BO-1~4 달성 가능성에 대한 답변:
- BO-1 ($27→$5~8/월): Prompt Cache 단독 목표($5~8)는 ~96% 히트율 가정 시 가능하지만 14분 간격 호출에서는 비현실적. 3레이어 복합($2~4)은 Semantic Cache 안정기 가정이 있어 장기적으로는 합리적.
- BO-2 (1.4배): 이미 Issue #4에서 근거 없음 + KPI-5 불일치 플래그.
- BO-3 (Epic 12 A/B): 측정 방법이 구체적이고 이미 인프라 있음. 달성 가능.
- BO-4 (<100MB): LRU MAX 10,000 항목 설정 있으므로 달성 가능.
- KPI-5 확장성 측정 현실성: "에이전트 수 변화 보정 필요"라고 명시했으나 보정 방법이 없다. 에이전트 추가 시점/수를 기록하지 않으면 3개월 후 비용 변화가 캐싱 효과인지 에이전트 수 변화인지 분리 불가. → Issue #4에 추가.

---

## v1-feature-spec Coverage Check

- Features verified:
  - v1 SSE 스트리밍(실시간 상태 표시, 경과 시간) → TTFT 지표가 SSE 기반으로 측정하려는 접근 방향 일치 ✅
  - v1 `/전체` 동시 6-에이전트 실행 → Tool Cache 히트율 측정 "동시 에이전트 10명 시나리오" 연결 ✅
  - Epic 12 A/B 테스트 프레임워크 → BO-3 품질 무결성 측정에 활용 명시 ✅ (에픽 간 연계 우수)

---

## Verification Results (Post-Fix)

| Issue | Status | Notes |
|-------|--------|-------|
| [CRITICAL] 히트율 70% + 절감 85% 수학 불일치 | ✅ RESOLVED | 3지표 분리: per-hit 85%, 히트율 70%(세션), 실효 60%→80% (lines 240-242) |
| [HIGH] Tool Cache 40% vs 20% 불일치 | ✅ RESOLVED | Line 243: "≥ 20%(1주) → ≥ 40%(30일)" 통일 |
| [HIGH] TTFT 80%→85% + 기준선 없음 | ✅ RESOLVED | Line 246: 85% + 배포 직전 기준선 측정 방법 추가 |
| [HIGH] E2 Stop Hook 타입 확장 누락 | ✅ RESOLVED | Lines 278, 283: KPI-1/2에 Story 15.1 scope 명시 |
| [MEDIUM] KPI-4 miss 로그 없음 | ✅ RESOLVED | Line 296: semantic_cache_miss 로그 Story 15.3 scope 포함 |
| [LOW] BO-2 근거 없음 + KPI-5 불일치 | ✅ RESOLVED | BO-2 근거 명시, KPI-5 단위 비용 추이 + 분기 리뷰 채택 |

**Final Score: 9/10**
- 6개 이슈 전부 해결. 수학 일관성 확보(70%×85%≈60%=1주 실효 목표).
- -1점: 실효 절감율 80%(30일, 1시간 TTL 전환 후)는 1시간 TTL 채택 결정이 Story 15.1 구현 시 이뤄져야 하는데 Brief 단계에서 "전환 검토"로만 남겨짐. 향후 스토리 생성 시 TTL 선택 기준(에이전트별 호출 빈도 임계값)을 명시 권장.

---

- Gaps found:
  - **TTFT 개선은 v1에서도 중요한 UX 지표였음** (에이전트 작업 중 이름+경과 시간 표시). 그러나 v1의 실제 TTFT 측정값이 없어 "기존 대비 80/85%" 목표의 의미 있는 기준선이 없음. v1 로그에서 SSE 응답 타임스탬프 추출 가능 여부 확인 권장.
