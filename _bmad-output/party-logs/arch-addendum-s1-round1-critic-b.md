# CRITIC-B Review: Architecture Addendum Section 1
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## 주요 확인 통과

- D8 수정: DB 쿼리 캐싱 없음 유지 + Epic 15 별도 레이어 명시 ✅
- D17 PoC 결정 트리: Brief 구현 노트와 일치 (성공 조건 두 번째 호출 cache_read_input_tokens > 0) ✅
- D18 Phase 4 Redis 전환 경계: cacheStore 인터페이스 분리 ✅
- D19 E8 grep 패턴: engine/agent-loop.ts + engine/semantic-cache.ts 제외 조건 포함 ✅
- D17~D20 포맷: 기존 D1~D12 테이블 `| # | 결정 | 선택 | 근거 |` 일관성 ✅
- D20 companyId 격리: Tool Cache 키 정렬 포함, Semantic Cache getDB() E3 패턴 ✅

---

## Issue 1 — D20 credential-scrubber Hook 타입 오류 (High)
**[Winston — Architect 관점]**

D20 Credential Sanitization 섹션(line 115):
```
- `credential-scrubber` (PreToolUse): 도구 입력 파라미터 필터링
- `output-redactor` (PostToolUse): 도구 출력 결과 필터링
```

architecture.md 직접 확인 결과:
- line 552: `engine/hooks/credential-scrubber.ts | PostToolUse: @zapier/secret-scrubber 기반`
- D4: `PostToolUse: scrubber→redactor→delegation`

`credential-scrubber`는 **PreToolUse가 아닌 PostToolUse**다. PreToolUse는 `tool-permission-guard`(도구 실행 허가 여부 결정)이다.

보안 결론 "어떤 Hook도 LLM fullResponse를 sanitize하지 않는다"는 여전히 맞지만, 라벨 오류가 구현자에게 두 가지 혼선을 일으킨다: (1) credential-scrubber가 도구 입력을 필터링한다는 잘못된 이해, (2) PreToolUse Hook 추가 시 scrubber 패턴을 참조할 경우 잘못된 시그니처 적용.

**요구사항:** line 115를 `"credential-scrubber" (PostToolUse): 도구 출력 결과의 민감 패턴 마스킹 (@zapier/secret-scrubber 기반)`으로 수정. PreToolUse는 `tool-permission-guard`임을 명시.

---

## Issue 2 — D13이 Deferred와 구현됨 상태로 이중 존재 (Medium)
**[Winston — Architect 관점]**

addendum의 D13 업데이트 섹션은 "Epic 15에서 조기 구현"을 명시했지만, 기존 architecture.md Deferred 테이블(line 368)에 D13이 여전히 "Phase 4+ Redis 전환은 별도 D13-Phase4로 Deferred 유지"로 잔류한다. 동일 문서에서 D13이 Deferred 섹션에 있으면서 구현 완료를 표시하는 이중 상태다. "D13-Phase4"라는 번호가 어디에도 정의되지 않은 유령 ID이기도 하다.

**요구사항:**
1. Deferred 테이블에서 D13 제거
2. D13을 Important Decisions로 이동 (조기 구현된 결정이므로)
3. Phase 4+ Redis 전환은 별도 결정 번호(예: D21)로 Deferred에 등록하거나 "Deferred (Phase 4+)" 별도 테이블에 명시

---

## Issue 3 — D12→D17 번호 점프 이유 미설명 (Medium)
**[Bob — SM 관점]**

addendum에서 "기존 Important Decisions (D7~D12) 목록에 추가"라고 소개한 뒤 D17~D20을 정의했다. D13~D16이 어디에 있는지 설명이 없어 독자가 혼란을 겪는다 — D13~D16은 기존 architecture.md Deferred 섹션에 있지만 addendum만 보는 구현자는 알 수 없다.

**요구사항:** D17~D20 테이블 바로 위에 주석 추가: `"D13(Epic 15 조기 구현됨), D14(토큰 풀), D15(크로스 프로바이더), D16(API 버저닝)은 기존 architecture.md 결정 참조. D17~D20은 Epic 15 신규 추가."`

---

## Issue 4 — 3-레이어 흐름도의 "마스킹 → saveToSemanticCache" 표현이 D19/D20 "내부 적용"과 충돌 (Low)
**[Amelia — Dev 관점]**

architecture.md Caching Architecture 섹션 흐름도:
```
LLM 응답 완성 → CREDENTIAL_PATTERNS 마스킹 → saveToSemanticCache
```
이는 마스킹이 caller(agent-loop.ts)에서 먼저 수행됨을 암시한다.

반면 D20 텍스트: `"engine/semantic-cache.ts의 saveToSemanticCache 함수 내부에서 CREDENTIAL_PATTERNS 정규식을 fullResponse에 직접 적용"` — callee 내부 수행.

두 표현이 불일치한다. Defensive design 관점에서 callee 내부 마스킹이 더 안전하므로 D20 텍스트가 정확한 의도이나, 흐름도를 읽은 구현자가 agent-loop.ts에서 마스킹을 담당한다고 오해할 수 있다.

**요구사항:** 흐름도를 `"LLM 응답 완성 → saveToSemanticCache (함수 내부에서 CREDENTIAL_PATTERNS 마스킹 후 저장)"`로 수정하여 callee 내부 처리임을 명확히.

---

## Issue 5 — Layer 2/3 graceful fallback 흐름도 미표시 (Low)
**[Quinn — QA 관점]**

흐름도에서 Layer 1 Semantic Cache만 `"미스/오류: graceful fallback → 계속"`을 표시했다. NFR-CACHE-R1(Tool Cache fallback)과 NFR-CACHE-R2(Semantic Cache save fallback)가 Layer 2/3에도 적용되는데 흐름도에 시각적으로 표현이 없다. 테스트 케이스 작성 시 fallback 경로가 모든 레이어에 존재함을 흐름도에서 직접 확인하기 어렵다.

**요구사항:** Layer 3(Tool Cache) 아래에도 `"→ 캐시 오류 시 graceful fallback (NFR-CACHE-R1)"` 표시 추가. Semantic Cache save(Layer 1 저장 단계)에도 `"→ 오류 시 무시(NFR-CACHE-R2)"` 추가.

---

## 종합 평가

| 이슈 | 심각도 | 유형 |
|------|--------|------|
| Issue 1: credential-scrubber PreToolUse 오류 | **High** (보안 결정 문서 오류) | 팩트 오류 |
| Issue 2: D13 Deferred 이중 상태 | **Medium** (아키텍처 모호성) | 구조적 불명확 |
| Issue 3: D12→D17 점프 미설명 | **Medium** (독자 혼선) | 문서 가이드 누락 |
| Issue 4: 흐름도 sanitization 위치 충돌 | **Low** (구현 가이드 모호) | 불일치 |
| Issue 5: Layer 2/3 fallback 흐름도 미표시 | **Low** (테스트 가시성) | 불완전 |

**전체 판정:** 핵심 아키텍처 결정(D8/D17~D20) 내용은 정확하고 일관성 있음. Issue 1(Hook 타입 라벨) 수정이 가장 중요 — 보안 근거 문서의 정확성 필수.
