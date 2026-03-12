# CRITIC-A Review: UX Design Addendum v2 (Epic 15 — 3-Layer Caching)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-ux-design.md` (v2)
**Date:** 2026-03-12

---

## v1 이슈 해결 확인

| v1 이슈 | v2 상태 |
|---------|---------|
| HIGH: ON 상태 "모든 에이전트" vs "모든 사용자" 불일치 | ✅ 수정 완료 — line 67, 85, 120 전부 "이 회사의 모든 사용자"로 통일 |
| HIGH: Section 1.4 Tool Cache TTL(1분/15분) 수치 노출 | ⚠️ 부분 수정 — 수치 제거됐으나 "단기 TTL" 표현이 여전히 모호 (Issue A-1) |
| MEDIUM: PRD Appendix F 미반영 유형 + 중복 우선순위 | 미수정 — 여전히 3개 조건만 존재 (Issue A-2) |
| LOW: SSE cacheHit 필드 스코프 불명확 | ✅ 수정 완료 — line 216 "Phase 5+ 데이터: SSE cacheHit 추가 필요"로 명시 |

---

## CRITIC-B 이슈 교차 검증 결과

| CRITIC-B 이슈 | v2 검증 |
|--------------|---------|
| B-1 HIGH: "24시간 후 자동 만료" TTL 기준 오류 | ✅ 확인 — line 141에 동일 표현 존재. 공동 확인 이슈 |
| B-2 MEDIUM: "모든 에이전트" 표현 | ✅ **v2에서 이미 수정됨** — "모든 사용자"로 통일. 수정 필요 없음 |
| B-3 MEDIUM: 도구명 하드코딩 | ✅ 확인 — lines 161~162에 kr_stock, search_news, get_current_time, generate_image 하드코딩 유지 |
| B-4 LOW: TTL 커스터마이징 불가 미명시 | ⚠️ v2 line 87에 "TTL: 24시간 자동 만료" 표시되나 "커스터마이징 불가"는 미명시 — 단, FR-CACHE-3.9 준수 확인으로 구현 시 자연히 반영됨. 수용 가능 LOW |
| B-5 LOW: Prompt/Tool Cache 배지 없음 근거 미설명 | ✅ **v2에서 이미 수정됨** — line 214 "내부 최적화로 배지 없음" 명시 |

---

## Issue A-1 (Mary/BA — HIGH): "단기 TTL 내 캐시 허용" — 여전히 모호한 TTL 혼동 [v2 신규 잔존]

**위치:** Section 1.4 에이전트 유형별 권장 표시 테이블, line 161

```
⚠ 실시간 도구 포함 — 단기 TTL 내 캐시 허용   text-amber-400
```

**문제:** v1의 "kr_stock: 1분, search_news: 15분" 수치는 제거됐으나 "단기 TTL"이라는 표현이 잔존. "단기 TTL"은 이 맥락에서 두 가지로 읽힌다:
- Tool Cache TTL(kr_stock: 1분, search_news: 15분) — 도구 결과 캐싱
- Semantic Cache TTL(24시간) — LLM 응답 캐싱

이 토글은 Semantic Cache 토글이므로, 관련 TTL은 오직 Semantic Cache 24시간. "단기 TTL"이 Tool Cache의 짧은 TTL(1분)을 암시하여 "캐시가 1분이라 괜찮다"는 잘못된 안도감 제공 가능성 존재.

**수정 방향:**
```
⚠ 실시간 도구 포함 — Semantic Cache 활성화 시 최대 24시간 이전 응답 반환 가능
```

---

## Issue A-2 (Sally/UX — MEDIUM): 에이전트 유형 감지 조건 — PRD Appendix F 2개 유형 미반영 + 중복 우선순위 없음 [v1 미수정]

**위치:** Section 1.4 권장 표시 테이블, lines 158~162

**현재 3개 조건:**
1. 실시간 도구 없음 → ✓ 권장
2. kr_stock 또는 search_news → ⚠
3. get_current_time 또는 generate_image → ✗

**PRD Appendix F 미반영 유형:**
- "다단계 핸드오프 오케스트레이터" → false — 도구 목록 기반 자동 감지 불가
- "Library 업데이트 즉각 반영 필요 에이전트" → false — 도구 목록 기반 자동 감지 불가

**조건 중복:** `generate_image + kr_stock` 동시 보유 에이전트 → ✗와 ⚠ 중 우선순위 미정의

**수정 방향:**
1. 조건 테이블 하단에 우선순위 규칙 명시: `✗ 우선 > ⚠ > ✓`
2. 테이블 하단에 안내 텍스트 추가:
   > "⚠ 자동 감지는 도구 목록 기반입니다. 복잡한 오케스트레이터 또는 지식 베이스 즉각 반영이 필요한 에이전트는 수동으로 OFF를 설정하세요."

---

## Issue A-3 (John/PM — MEDIUM): Section 1.5 "Tool Cache 비활성" — 존재하지 않는 제어 개념 [v2 신규]

**위치:** Section 1.5 "3-레이어 전부 비활성 시" (line 292)

```
[enableSemanticCache=false + Tool Cache 비활성 + Prompt Cache 미적용]
```

**문제:** Tool Cache는 에이전트별 on/off 없음 — `withCache()` 래퍼가 도구 핸들러에 등록된 경우 자동 적용. "Tool Cache 비활성"이라는 관리자가 제어하는 설정은 존재하지 않는다. 이 표현이 구현자에게 "Tool Cache on/off 토글을 만들어야 하나?" 혼동 유발 가능.

"3-레이어 전부 비활성"의 현실적 시나리오:
- `enableSemanticCache=false` (Admin 설정)
- Tool Cache 오류 → withCache() graceful fallback → 원본 실행 (Section 1.5 Tool Cache 오류 섹션과 동일)
- Prompt Cache D17 PoC 실패 → messages.create() 직접 호출

**수정 방향:**
```
[enableSemanticCache=false (Admin 설정) + Tool Cache 오류(graceful fallback) + Prompt Cache 미적용]
```
또는 이 시나리오를 "Semantic Cache OFF + 모든 캐시 미스" 상황으로 단순화.

---

## CRITIC-B Issue B-1 공동 확인 (Mary/BA — HIGH): 모달 "24시간 후 자동 만료" TTL 기준 오류

**위치:** ON→OFF 확인 모달, line 141

```
• 기존 캐시는 24시간 후 자동 만료됩니다.
```

**문제(CRITIC-B 확인):** FR-CACHE-3.4 TTL 조건: `created_at > NOW() - ttl_hours * INTERVAL '1 hour'` — TTL은 **캐시 생성 시점** 기준. 토글을 OFF하는 시점이 캐시 생성 후 23시간이라면 "1시간 후" 만료, 1시간이라면 "23시간 후" 만료. "24시간 후"는 항상 사실이 아니다.

Admin(김운영)이 "24시간 후 만료"를 보면 "OFF해도 최소 24시간은 지속된다"고 오해할 수 있음.

**수정 방향:**
```
• 기존 캐시는 각 응답의 저장 시점부터 24시간이 지나면 자동 만료됩니다.
```
또는 더 간결하게:
```
• 기존 캐시는 생성 후 24시간 경과 시 자동 만료됩니다. (즉시 삭제 아님)
```

---

## 긍정 검증 항목

| 항목 | 결과 |
|------|------|
| 토글 위치 — Soul 아래, 도구 권한 위 (FR-CACHE-3.3) | ✅ |
| 기본값 OFF (FR-CACHE-3.2 DEFAULT FALSE) | ✅ |
| ON→OFF 확인 모달 구조 | ✅ (TTL 기준 표현만 수정 필요) |
| "이 회사의 모든 사용자" 통일 (FR-CACHE-3.11) | ✅ v2 전면 수정 확인 |
| 로딩 스피너 300ms 지연 패턴 | ✅ UX 표준 패턴, 100ms 캐시 히트 시 flicker 방지 논리 타당 |
| "이전 유사 질문" 안내 문구 MVP 미채택 결정 | ✅ 이주임 불안감 vs 투명성 트레이드오프 명확 |
| Error UX graceful fallback 서술 (NFR-CACHE-R1/R2/R3) | ✅ 이주임 미노출 원칙 일관성 |
| Phase 5+ Deferred 구분 (배지, 대시보드) | ✅ PRD와 일치 |
| Phase 1~3 Admin 측정 방법 명시 (Anthropic 대시보드) | ✅ 실용적 보완 |
| 페르소나 명시 (김운영, 이주임) | ✅ v2 신규 — UX 결정 근거 강화 |

---

## 요약

| # | 역할 | 심각도 | 이슈 |
|---|------|--------|------|
| B-1 | Mary/BA | HIGH | 확인 모달 "24시간 후 자동 만료" — TTL은 생성 시점 기준, 토글 OFF 시점 기준 아님 |
| A-1 | Mary/BA | HIGH | "단기 TTL 내 캐시 허용" 모호 — Semantic Cache 24h TTL 명시 필요 |
| A-2 | Sally/UX | MEDIUM | 에이전트 유형 감지 조건 3개 — PRD F 2개 유형 미반영, 중복 우선순위 미정의 |
| A-3 | John/PM | MEDIUM | "Tool Cache 비활성" — 존재하지 않는 제어 개념, 구현자 혼동 유발 |
| B-3 | Sally/UX | MEDIUM | 도구명 하드코딩 (kr_stock 등) — tool-cache-config.ts 기반 동적 감지 권고 |

**v2에서 해결됨:** B-2("모든 사용자" 통일), B-5(배지 없음 근거), v1-A-1(에이전트→사용자), v1-A-4(SSE cacheHit Phase 5+ 명시)
