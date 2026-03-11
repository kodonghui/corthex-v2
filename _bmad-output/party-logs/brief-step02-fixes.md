# [Writer Fix Summary] step-02: Executive Summary + Core Vision

**Date:** 2026-03-11
**File:** `_bmad-output/planning-artifacts/epic-15-caching-brief.md` lines 24-145
**Total fixes applied:** 8 (2 CRITICAL→fixed, 4 HIGH, 2 MEDIUM)

---

## Fixes Applied

| # | Severity | Source | Issue | Fix Applied |
|---|----------|--------|-------|-------------|
| 1 | **CRITICAL** | Both critics | Semantic Cache 범용 적용 — 흐름도가 모든 쿼리에 Semantic Cache 적용, 실시간 데이터(주가·뉴스) 포함 | 흐름도에 `enableSemanticCache` 플래그 조건 추가. "적합/부적합 쿼리 유형" 표 추가. Executive Summary에 "에이전트별 플래그로 실시간 데이터 제외" 명시 |
| 2 | **HIGH** | Critic-A (John PM) | "100회/일" 기준 미정의 — 에이전트 1명 vs 플랫폼 전체 불명확 | 낭비 규모 표 상단에 `> 기준: 에이전트 1명 × 하루 100 호출 (추정값)` 블록 추가. 표 근거 열에도 "(에이전트 1명 기준)" 명시 |
| 3 | **HIGH** | Critic-A (Mary BA), Critic-B | D13 조기 해제 근거 누락 — architecture.md D13 "에이전트 100명+ 시 Phase 5+ 재검토" 조기 해제 정당성 없음 | Problem Statement 마지막에 D13 조기 해제 근거 단락 추가: "Prompt Caching은 에이전트 수와 무관하게 즉각 절감 가능. 구현 비용 vs 절감 ROI 명시. architecture.md D13 업데이트 필요 안내" |
| 4 | **HIGH** | Critic-B (Winston) | SDK cache_control 호환성 미검증 — 연구보고서 §2.4 "PoC 확인 필요"를 브리프가 "검증된 1줄 변경"으로 단정 | Executive Summary Story 15.1에 "전제조건: SDK cache_control 호환성 PoC 검증 필요. 실패 시 대안: anthropic.messages.create 직접 호출" 추가. 구현 난이도 "매우 낮음 → 낮음(PoC 후 확정)"으로 수정. 변경 규모 "SDK PoC 검증 + cache_control 추가"로 구체화 |
| 5 | **HIGH** | Critic-B (Amelia Dev) | Tool Cache 메모리 상한 미정의 — 무한 Map 누적 OOM 위험 | Executive Summary 15.2에 "MAX 10,000 항목 + LRU 교체 정책" 추가. Key Differentiators #3에 "MAX 10,000 + LRU + 1분 주기 만료 정리, ~100MB (0.4%)" 명시 |
| 6 | **MEDIUM** | Critic-B (Amelia Dev) | 15.2 구현 범위 과소 기재 — "래퍼 적용"이 125개+ 도구 핸들러 수정을 은폐 | 구현 난이도 표 15.2 변경 규모 → "신규 파일 1개 + 캐시 대상 도구 핸들러 N개 수정 (TTL 설정 포함, 7개 대표 도구 우선)"으로 수정 |
| 7 | **MEDIUM** | Critic-B (Quinn QA) | Soul 업데이트 시 Prompt Cache 무효화 정책 미결정 — 5분 내 구버전 Soul 응답 허용 여부 | Key Differentiators #7 신규 추가: "Soul 업데이트 시 5분 TTL 자연 만료 허용 (즉시 무효화 불필요). Tool Cache/Semantic Cache는 Soul과 무관" |
| 8 | **LOW** | Critic-A (John PM) | 60~80% 절감의 캐시 히트율 가정 미공개 | Executive Summary 15.3 + Key Differentiators #8에 "Day 1: 히트율 0% → 30일 후 40~60% (FAQ 기준). 60~80% 절감은 안정기(30일+) 기준" 명시 |

---

## 수정되지 않은 이슈 (이유 있음)

| # | Issue | 이유 |
|---|-------|------|
| Critic-A #3 | 레이어 번호 불일치 (연구보고서 vs 브리프 vs 런타임) | 흐름도에 "스토리 번호 = 구현 순서, 런타임 실행 순서와 다름" 안내 박스 추가로 해결. 별도 번호 통일 불필요 (Brief가 우선) |
| Critic-B #6 | 스토리 점수/예상 시간 부재 | Story 파일이 아닌 Product Brief 범위. Sprint planning 단계에서 스토리 파일에 추가 예정 |

---

## 수정 후 파일 상태

- **Lines:** 24-145 (기존 24-125에서 20줄 증가)
- **추가된 섹션:** Semantic Cache 적합/부적합 표, D13 조기 해제 근거, Soul 무효화 정책
- **수정된 섹션:** Executive Summary (3개 항목), Proposed Solution 흐름도, 구현 난이도 표, Key Differentiators (8개로 확장)
