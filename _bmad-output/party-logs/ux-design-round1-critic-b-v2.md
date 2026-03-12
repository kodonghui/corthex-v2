# CRITIC-B Review: UX Design Epic 15 v2
**Round:** 1 (v2 재작성 리뷰) | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## v1 → v2 수정 확인

| v1 이슈 | 확인 결과 | 비고 |
|---------|----------|------|
| Issue 1 (High): OFF 모달 "24시간 후 자동 만료" TTL 기준 오해 | ❌ FAIL | line 141: 동일 텍스트 유지 |
| Issue 2 (Medium): ON 상태 "에이전트" vs "사용자" 불일치 | ✅ PASS | line 85: "이 회사의 모든 사용자가 캐시를 공유합니다." ✅ |
| Issue 3 (Medium): 권장 표시 도구명 하드코딩 | ❌ FAIL | line 161-162: kr_stock, search_news, get_current_time, generate_image 그대로 |
| Issue 4 (Low): TTL 24시간 고정 커스터마이징 불가 미명시 | ❌ FAIL | 미반영 |
| Issue 5 (Low): Prompt/Tool Cache 배지 미표시 근거 미설명 | ✅ PASS | Section 1.3 + 1.4 line 195 설명 추가 ✅ |

## 신규 섹션 통과 확인

- **1.0 페르소나** (김운영/이주임 역할 + Epic 15 접점): 구체적 ✅
- **1.4 스피너 제거 결정** (300ms 지연 패턴): UX 논리 타당 ✅
- **1.4 "이전 유사 질문" 미표시 결정**: 불안감 vs 투명성 분석 명확 ✅
- **1.5 Error UX 3-레이어 fallback**: NFR-CACHE-R1/R2/R3 일관 ✅
- **1.6 UX 결정 테이블**: 11개 결정 근거 명시 ✅

---

## Issue 1 — OFF 확인 모달 TTL 기준 오해 [High] — v1 미수정
**[Quinn — QA 관점]**

line 141 (v2에서도 동일):
```
• 기존 캐시는 24시간 후 자동 만료됩니다.
```

FR-CACHE-3.4 SQL: `created_at > NOW() - ttl_hours * INTERVAL '1 hour'`
→ TTL 24시간 = **캐시 생성 시점** 기준. 토글 OFF 시점 기준 아님.

"24시간 후 자동 만료됩니다"는 "지금 OFF하면 24시간 동안 기존 캐시가 살아있다"는 의미로 읽힌다. 실제로는:
- 23시간 전 생성된 항목 → 1시간 후 만료
- 방금 생성된 항목 → 24시간 후 만료

김운영이 "지금 OFF하면 24시간 내 stale 응답이 계속 나간다"고 판단해 불필요한 혼란 또는 과도한 대기를 할 수 있다.

**요구사항:** `"기존 캐시는 각 항목의 TTL 만료 시 자동 소멸됩니다 (생성 후 최대 24시간)."`

---

## Issue 2 — 권장 표시 도구명 하드코딩 [Medium] — v1 미수정
**[Winston — Architect 관점]**

lines 161-162:
```
| kr_stock 또는 search_news 포함          | ⚠ 실시간 도구 포함 ...
| get_current_time 또는 generate_image 포함 | ✗ 캐싱 비권장 ...
```

PRD FR-CACHE-2.5: `tool-cache-config.ts`에 도구별 TTL 등록 테이블 명시.
- `get_current_time TTL=0`, `generate_image TTL=0` → 이미 Tool Cache에서 제외 처리
- 새 도구 추가 시 UI 권장 로직 별도 갱신 필요 → 유지보수 갭

**요구사항:** Section 1.1 권장 표시 구현 명세에 추가:
> `tool-cache-config.ts` TTL 값을 기준으로 권장 단계 동적 판단 — `TTL=0 → ✗ 비권장`, `TTL≤15min → ⚠ 실시간 경고`, `TTL 없음(도구 미보유) → ✓ 권장`. 도구명 하드코딩 대신 config 기반 동적 처리로 Story 15.3에서 구현.

---

## Issue 3 — 300ms 스피너 지연 패턴 — base ux-design-spec 일관성 참조 없음 [Medium]
**[Amelia — Dev 관점]**

1.4 핵심 결정 (line 242):
```
setTimeout(showSpinner, 300) — 300ms 내 message 이벤트 도착 시 스피너 미표시
```

이 패턴 자체는 UX 표준(debounced loader)으로 타당하나, base `ux-design-specification.md`의 Hub 로딩 상태 패턴과 일관성 여부가 명시되지 않았다. 기존 스펙에 `accepted` → spinner → `message` 흐름이 정의되어 있다면 변경 사항이고, 미정의라면 신규 패턴으로 base spec에 반영 필요.

**요구사항:** 다음 중 하나 명시:
- A) "base ux-design-spec Hub 로딩 패턴 (N절)에서 스피너 지연 없이 즉시 표시 → Epic 15에서 300ms 지연으로 변경"
- B) "base ux-design-spec Hub 로딩 패턴 미정의 → Epic 15 신규 결정으로 base spec N절에 추가"

---

## Issue 4 — TTL 24시간 고정 커스터마이징 불가 Admin 미명시 [Low] — v1 미수정
**[Bob — SM 관점]**

FR-CACHE-3.9: "에이전트별 TTL 커스터마이징 UI는 구현하지 않는다."
ON 상태 표시 (line 87): `TTL: 24시간 자동 만료 · 유사도 임계값: 95%`
툴팁 (line 119): `TTL: 24시간 자동 만료`

24시간이 고정값(변경 불가)임을 표시하지 않아 김운영이 클릭/수정 시도 가능.

**요구사항:** ON 상태 부가 정보를 `"TTL: 24시간 자동 만료 (고정, MVP) · 유사도 임계값: 95%"`로 수정. 또는 `text-slate-500` 소형 텍스트 `"(현재 버전에서 조정 불가)"` 추가.

---

## Issue 5 — Edge Case: 이주임이 캐시 인지 시 AI 에이전트 응답 처리 [Low]
**[Quinn — QA 관점]**

line 257:
```
이주임이 "아까 답변이랑 같네?" 인지 시 — 이는 정상 동작.
```

추가 Edge Case: 이주임이 에이전트에게 **직접 질문**하는 경우:
> "방금 답변이 이전이랑 완전히 같은데 혹시 캐시된 답변인가요?"

이 질문은 **에이전트(Soul 기반 LLM)에게 전달**되나, 에이전트는 자신이 캐시된 응답을 반환했는지 알 수 없다. Semantic Cache 히트 시 `agent-loop.ts`가 LLM을 미호출하고 저장된 텍스트를 반환하므로, 에이전트는 메타 정보 없음.

**요구사항:** Edge Case 테이블에 추가:
> "이주임이 에이전트에게 '캐시 여부' 직접 질문 시 → 에이전트는 LLM 응답으로 '정확히 동일한 판단을 내립니다'라고 자연스럽게 답변 (에이전트는 캐시 여부 알 수 없음 — 구조적 비노출). MVP 의도된 동작."

---

## 종합 평가

| 이슈 | 심각도 |
|------|--------|
| Issue 1: OFF 모달 TTL 기준 오해 (v1 미수정) | **High** |
| Issue 2: 권장 표시 도구명 하드코딩 (v1 미수정) | **Medium** |
| Issue 3: 300ms 스피너 base spec 일관성 미명시 | **Medium** |
| Issue 4: TTL 고정 커스터마이징 불가 미명시 (v1 미수정) | **Low** |
| Issue 5: 이주임 에이전트 직접 질문 Edge Case | **Low** |

**v2 신규 추가 내용 평가:** 페르소나 기반 서술(김운영/이주임), Hub 스피너 결정, "이전 유사 질문" 미표시 결정 분석, Error UX 3-레이어 fallback — 모두 구체적이고 PRD/Architecture와 일관성 있음.

**전체 판정:** 신규 섹션 품질은 높으나 v1 High 이슈(모달 TTL 기준)가 미수정. Issue 3(스피너 패턴 spec 참조) 추가 명세 필요. 재작업 후 재검증 요망.
