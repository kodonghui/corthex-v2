# Context Snapshot: Brief step-04 (Success Metrics + KPIs)

**Date:** 2026-03-11
**Score:** Critic-A 9/10 + Critic-B 9/10 = avg 9/10 — PASS
**Output file:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md`
**Lines written:** 234-304

---

## Key Decisions Made in Step-04

1. **Prompt Cache 3-지표 분리 (수학적 일관성 확보):**
   - (1) 단위 절감율 ≥ 85% per hit (캐시 히트 1건 기준, Anthropic 공식)
   - (2) 히트율 ≥ 70% (5분 내 세션 버스트 기준)
   - (3) 실효 절감율 ≥ 60% (1주) → ≥ 80% (30일, 1시간 TTL 전환 후)
   - 이유: 70% 히트율 × 85%/hit = ~60% 실효절감. 동시 성립 불가 문제 해소.

2. **TTL 전환 조건 명시:**
   - 100회/일 기준 평균 간격 14.4분 > ephemeral TTL 5분 → 분산 호출 히트율 ≈ 0%
   - 실효 절감율 80% 목표 달성 위해 1시간 TTL 전환 검토 (에이전트별 호출 빈도 임계값 기준)

3. **Tool Cache 히트율 단계적 표현:**
   - ≥ 20% (1주 초기) → ≥ 40% (30일 안정기)
   - Success Metrics 표 + KPI-3 양쪽 통일

4. **TTFT 목표값 확정:**
   - ≥ 85% 단축 (Anthropic 공식, step-02 일치)
   - 기준선 측정: Story 15.1 배포 직전 1주 평균 TTFT 측정 후 비교

5. **Stop Hook E2 usage 타입 확장 — Story 15.1 scope:**
   - `cache_read_input_tokens`, `cache_creation_input_tokens` 현재 E2에 없음
   - KPI-1 (Prompt Cache 검증) + KPI-2 (비용 절감율) 양쪽에 Story 15.1 scope 전제조건 명시

6. **Semantic Cache 히트율 miss 로그 — Story 15.3 scope:**
   - `log.info({ event: 'semantic_cache_miss', companyId, similarity: bestSimilarity })`
   - miss 없으면 hit rate 분모 불명 → KPI-4 측정 불가 경고 명시

7. **KPI-1 PASS 기준 구체화:**
   - "동일 에이전트 5분 내 2회 연속 호출 시 두 번째 호출의 cache_read_input_tokens > 0"

8. **KPI-5/BO-2 확장성 현실화:**
   - 통제된 실험 불가 → 분기 리뷰 + 단위 비용 추이 관찰 방식
   - 단위 비용 기준: < $5/에이전트 추가

---

## Sections Written (step-04 범위)

- Success Metrics: 11행 표 (lines 237-249) — 3-layer 각각 + TTFT + 확장성
- Business Outcomes: BO-1~BO-5 (lines 251-265)
- KPI-1: Prompt Cache 검증 (lines 268-284)
- KPI-2: 비용 절감율 (lines 285-292)
- KPI-3: Tool Cache 히트율 (lines 293-298)
- KPI-4: Semantic Cache 히트율 (lines 299-302)
- KPI-5: 확장성 (lines 303-304)

---

## Next Steps

- Step-05: MVP Scope + Future Vision
- Step-06: Final Review + Completion
