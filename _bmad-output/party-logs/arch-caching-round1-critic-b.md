# CRITIC-B Review: Architecture D8/D13/D17~D19 + Caching Architecture 섹션
**Round:** 1 | **Reviewer:** CRITIC-B (Winston/Amelia/Quinn/Bob) | **Date:** 2026-03-12

---

## 주요 확인 사항 통과

- **D8 수정**: "DB 쿼리 캐싱 없음 유지, Epic 15 캐싱은 D8 범위 밖" — 기존 의도 보존 ✅
- **D19 Hook 타입 설명**: "Stop Hook은 usage만, output-redactor는 PostToolUse(도구 출력), credential-scrubber는 PreToolUse(도구 입력)" — E2 패턴과 정확히 일치 ✅
- **3-레이어 흐름도** vs FR-CACHE-3.8 순서 일치 (Semantic → Prompt → Tool → sanitize → save) ✅
- **D17/D18/D19 포맷**: 기존 D1~D12 테이블 형식과 일관성 ✅
- **멀티테넌시 격리**: Tool Cache 키 `companyId` 포함, Semantic Cache `getDB(companyId)` 명시 ✅

---

## Issue 1 — Validation 섹션이 D1~D16으로 구버전 참조 (Medium)
**[Bob — SM 관점]**

D17~D19 추가 후 Architecture Validation 섹션(파일 하단)이 여전히 구버전 범위를 참조한다:

- Line 1102: `"D1~D16 전부 호환. 충돌 없음."` → D17~D19 포함해야 함
- Line 1115: `"Decision Completeness: D1~D16 전부 선택+근거+코드 예시"` → D1~D19
- Line 1126: `"결정 | D1~D16 (16개)"` → `D1~D19 (19개)`

D17~D19 검증 불통과 상태로 보일 수 있어 향후 구현자가 혼란을 겪는다.

**요구사항:** 세 곳 모두 "D1~D19"로 업데이트 + Process Statistics 결정 카운트 16 → 19 수정.

---

## Issue 2 — D13의 Deferred 테이블 잔류로 이중 상태 모호성 (Medium)
**[Winston — Architect 관점]**

D13이 "Deferred Decisions (Phase 5+)" 테이블에 아직 존재하면서 "Epic 15에서 조기 구현" 설명이 붙었다 — 하나의 결정이 "Deferred"이면서 동시에 "구현됨"인 상태다. 같은 Validation 섹션(line 1110)은 "Phase 5+ Deferred: D14, D15, D16"으로 D13을 제외해서 Deferred 테이블과 불일치한다.

추가로 D13 설명의 "별도 D13-Phase4로 Deferred 유지"라는 표현이 암시하는 미래 결정 번호(`D13-Phase4`)가 실제로 테이블에 존재하지 않는다.

**요구사항:** D13 처리를 명확히 분리:
1. Deferred 테이블에서 D13 제거 (이미 구현됨)
2. Important Decisions 테이블 또는 별도 행으로 "D13 (Epic 15 조기 구현)" 이동
3. Phase 4+ Redis 전환은 Deferred 항목에 **새 번호** `D20` (또는 적절한 다음 번호)으로 분리 등록

---

## Issue 3 — 흐름도와 D19 텍스트의 sanitization 위치 불일치 (Low)
**[Amelia — Dev 관점]**

Caching Architecture 섹션 흐름도:
```
LLM 응답 완성 → CREDENTIAL_PATTERNS 마스킹 → saveToSemanticCache
```
이 표현은 마스킹이 `saveToSemanticCache` **호출 전**에 caller(agent-loop.ts)에서 수행됨을 암시한다.

반면 D19 텍스트: `"saveToSemanticCache 내부에서 CREDENTIAL_PATTERNS 정규식 직접 적용"` — callee 내부에서 수행.

둘이 충돌한다. 방어적 설계(callee 내부)가 더 안전하지만, 흐름도를 읽은 구현자가 마스킹을 caller에서 처리하고 함수 내부에는 마스킹이 없다고 가정할 경우 두 번 마스킹하거나(중복, 무해) 흐름도만 보고 함수 내부 마스킹을 생략하는(보안 버그) 오류가 발생할 수 있다.

**요구사항:** 흐름도를 `"LLM 응답 완성 → saveToSemanticCache (내부 CREDENTIAL_PATTERNS 마스킹 적용)"` 또는 D19 텍스트를 `"agent-loop.ts에서 CREDENTIAL_PATTERNS 마스킹 후 sanitizedResponse를 saveToSemanticCache에 전달"` 중 하나로 통일.

---

## Issue 4 — Caching Architecture 섹션 위치가 Data Architecture 하위에만 있어 발견성 낮음 (Low)
**[Bob — SM 관점]**

Caching Architecture 섹션이 Data Architecture 내 서브 섹션으로만 존재한다. engine/ 아키텍처 전반에 영향을 주는 3-레이어 결정인데 (`agent-loop.ts` 통합 순서, E8 경계, D19 보안) Engine Patterns(E1~E10)과 Critical Decisions(D1~D6) 섹션에서 참조가 없다.

특히 E1(SessionContext)에 `enableSemanticCache` 필드가 추가되었는지, E8 경계 check 패턴이 E10 섹션에 반영되었는지 확인 필요.

**요구사항 (확인):** E10(`engine-boundary-check.sh`) 섹션에 `engine/semantic-cache` 패턴 추가 여부를 확인하여, 없다면 E10에 참조 또는 직접 추가 필요.

---

## 종합 평가

| 이슈 | 심각도 | 유형 |
|------|--------|------|
| Issue 1: Validation D1~D16 구버전 참조 | **Medium** (문서 불일치) | 업데이트 누락 |
| Issue 2: D13 Deferred 이중 상태 | **Medium** (아키텍처 모호성) | 구조적 불명확 |
| Issue 3: 흐름도 vs D19 sanitization 위치 충돌 | **Low** (구현 가이드 혼선) | 불일치 |
| Issue 4: E10 섹션 E8 패턴 업데이트 확인 | **Low** (발견성) | 누락 가능성 |

**전체 판정:** 핵심 아키텍처 결정(D8/D13/D17~D19/Caching Architecture)은 정확하고 일관성 있음. Issue 1/2는 문서 메타데이터 수정 수준. Issue 3은 구현 가이드 명확화 필요.
