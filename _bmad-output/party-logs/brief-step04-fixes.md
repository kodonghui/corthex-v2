# [Writer Fix Summary] step-04: Success Metrics + KPIs

**Date:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 234-304
**Total fixes applied:** 8 (1 CRITICAL→fixed, 2 HIGH, 4 MEDIUM, 1 LOW)

---

## Fixes Applied

| # | Severity | Source | Issue | Fix Applied |
|---|----------|--------|-------|-------------|
| 1 | **CRITICAL** | Both critics | Prompt Cache 히트율 70% + 비용 절감율 85% 수학적 공존 불가 (70% 히트 → 실효 절감 ~60%. 85% 절감에는 ~96% 히트 필요) + TTL 14.4분 간격 > 5분 TTL | 지표를 3개로 분리: (1) 단위 절감율 ≥ 85% per hit (캐시 히트 1건 기준, Anthropic 공식), (2) 히트율 ≥ 70% (5분 내 세션 기준), (3) 실효 절감율 ≥ 60% (1주) → ≥ 80% (30일, 1시간 TTL 후). TTL 패턴 이슈 및 1시간 TTL 전환 조건 명시. |
| 2 | **HIGH** | Both critics | Tool Cache 히트율 metrics table ≥ 40% vs KPI-3 ≥ 20% 동일 시점 불일치 | Metrics table → "≥ 20% (1주 초기) → ≥ 40% (30일 안정기)" 단계적 표현으로 통일 |
| 3 | **HIGH** | Both critics | TTFT 80% → step-02 확정값 85%로 수정 + 기준선 측정 방법 없음 | "≥ 85% 단축 (Anthropic 공식)" + "Story 15.1 배포 직전 1주 평균 TTFT 기준선 측정 후 비교" 추가 |
| 4 | **MEDIUM** | Critic-B | cost_tracker Stop Hook `usage` 타입에 `cache_read_input_tokens` 필드 없음 → KPI-2 측정 불가 | KPI-1, KPI-2 모두에 "Stop Hook usage 타입 확장 Story 15.1 scope 포함" 명시 |
| 5 | **MEDIUM** | Both critics | KPI-4 Semantic Cache 히트율 측정 불가 — miss 로그 없음 | KPI-4에 `log.info({ event: 'semantic_cache_miss', companyId, similarity: bestSimilarity })` Story 15.3 scope 포함 명시 |
| 6 | **MEDIUM** | Critic-B | KPI-1 PASS 기준 "cache_read_input_tokens > 0 1건" 너무 느슨 | "동일 에이전트 5분 내 2회 연속 호출 시 두 번째 호출의 cache_read_input_tokens > 0"으로 명확화 |
| 7 | **MEDIUM** | Critic-A | BO-2 1.4배 근거 없음 + KPI-5 확장성 수치 ("+50%시 +30%") 불일치 | BO-2: 근거 추가 + "분기 리뷰로 추이 관찰" (통제된 실험 불가 명시). KPI-5: 통제 실험 불가 → 분기 리뷰 방식으로 수정. 단위 비용 기준 (< $5/에이전트 추가)으로 현실적 수치 제시 |
| 8 | **LOW** | Both critics | KPI-5 "에이전트 +50%시 +30%" 통제 실험 불가 | 분기 리뷰 + 단위 비용 추이 관찰 방식으로 현실화 (fix #7과 통합) |

---

## 수정 후 파일 상태

- **Lines:** 234-304 (기존 234-302에서 2줄 증가)
- **Metrics 표:** 9행 → 11행 (Prompt Cache 지표 3개로 분리)
- **수학적 일관성:** 단위 절감율(85% per hit) vs 실효 절감율(히트율 × 85%) 명확히 구분
- **측정 가능성:** Stop Hook 타입 확장, semantic_cache_miss 로그 — 모두 Story scope에 명시
