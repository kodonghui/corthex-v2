# Context Snapshot: Brief step-02 (Executive Summary + Core Vision)

**Date:** 2026-03-11
**Score:** Critic-A 9/10 + Critic-B 9/10 = avg 9/10 — PASS
**Output file:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md`
**Lines written:** 24-144

---

## Key Decisions Made in Step-02

1. **3-Layer Caching 순서 확정:**
   - 런타임 실행 순서: Semantic Cache → Prompt Cache → Tool Cache
   - 스토리 구현 순서: 15.1 (Prompt) → 15.2 (Tool) → 15.3 (Semantic) — 쉬운 것부터

2. **D8/D13 해명:**
   - D8 = DB 쿼리 캐싱 기준 결정 (Epic 15와 무관)
   - D13 = 캐싱 전략 Phase 5+ Defer → Epic 15에서 조기 해제. 근거: 에이전트 수와 무관하게 즉각 절감 가능

3. **Semantic Cache 적용 범위:**
   - `enableSemanticCache: true` 에이전트만 적용 (FAQ, 정책 안내)
   - 실시간 데이터 에이전트 (주가, 뉴스) 제외 (`enableSemanticCache: false`)

4. **SDK PoC 필수 선행:**
   - Story 15.1 시작 전 `cache_control` ContentBlock 지원 여부 PoC 검증 필요
   - 실패 시 대안: `anthropic.messages.create` 직접 호출

5. **Tool Cache 메모리 상한:**
   - MAX 10,000 항목 + LRU 교체 정책 + 1분 주기 만료 정리
   - 최대 ~100MB (24GB 서버의 0.4%)

6. **비용 근거 기준:**
   - "100회/일" = 에이전트 1명 기준 (추정값, v1 실측 데이터 미수집)
   - 60~80% 절감 = 안정기(30일+) 기준. Day 1: 0% → 30일 후 40~60%

7. **Soul 업데이트 무효화 정책:**
   - Prompt Cache: 5분 TTL 자연 만료 허용 (즉시 무효화 불필요)
   - Tool/Semantic Cache: Soul 변경과 무관

---

## Sections Written (step-02 범위)

- Executive Summary (lines 24-35)
- Core Vision / Problem Statement (lines 38-68)
- Core Vision / Problem Impact (lines 70-81)
- Core Vision / Why Existing Solutions Fall Short (lines 83-91)
- Core Vision / Proposed Solution (lines 93-130)
- Core Vision / Key Differentiators (lines 132-144)

---

## Next Steps

- Step-03: Target Users + Personas
- Step-04: Success Metrics + KPIs
- Step-05: MVP Scope + Future Vision
- Step-06: Final Review + Completion
