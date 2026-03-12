# CRITIC-A Review: Architecture Addendum Section 1 (D17~D20)

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/epic-15-architecture-addendum.md` Section 1
**Date:** 2026-03-12

---

## Issue 1 (Mary/BA): D-번호 충돌 — architecture.md D17과 addendum D17이 다른 결정을 가리킴 [CRITICAL]

이 addendum은 "기존 architecture.md(D1~D16)에 추가하는 공식 문서"라고 선언하지만, architecture.md는 이미 이전 Stage 2 직접 수정을 통해 D17~D19를 포함하고 있다:

| 번호 | architecture.md (현재) | 이 addendum |
|------|----------------------|------------|
| D17 | **Tool Cache 위치** (`lib/tool-cache.ts`) | **Prompt Cache 전략** (cache_control ContentBlock) |
| D18 | **Semantic Cache 위치** (`engine/semantic-cache.ts`) | **Tool Cache 위치** (`lib/tool-cache.ts`) |
| D19 | **Sanitization** (CREDENTIAL_PATTERNS) | **Semantic Cache 위치** (`engine/semantic-cache.ts`) |
| D20 | (없음) | **companyId 격리** |

두 문서를 그대로 병합하면 D17이 "Tool Cache 위치"와 "Prompt Cache 전략"이라는 두 가지 의미를 갖는 충돌 발생. 구현자가 어느 것을 따를지 판단 불가.

**수정 방향**: 두 경로 중 하나를 선택해야 한다:
- **경로 A**: architecture.md의 D17~D19 직접 수정을 롤백하고, 이 addendum의 D17(Prompt Cache)~D20(companyId 격리)을 정식으로 사용.
- **경로 B**: 이 addendum의 D17=Prompt Cache를 D21로 재번호화하고, D18~D20도 D22~D24로 변경 — architecture.md D17~D19는 유지.
- **권고**: 경로 A가 더 완전함 (addendum이 Prompt Cache 전략을 별도 결정으로 분리한 구조가 더 명확).

---

## Issue 2 (Mary/BA): D20 Credential sanitization에서 credential-scrubber Hook 타입 오류 [HIGH]

addendum line 115: "`credential-scrubber` (**PreToolUse**): 도구 입력 파라미터 필터링"

그러나 architecture.md D4 및 Hook 파이프라인 정의(lines 162~167):
```
PreToolUse: tool-permission-guard (ONLY)
PostToolUse: credential-scrubber → output-redactor → delegation-tracker
```

credential-scrubber는 **PostToolUse**이며 도구 **출력** 결과를 필터링한다 — PreToolUse가 아니다. "D4 Hook 파이프라인 연계"라고 명시하면서 D4 내용과 불일치. 같은 오류가 이미 architecture.md D19에도 있음.

**수정 방향**: line 115를 "`credential-scrubber` (PostToolUse): 도구 **출력** 결과 필터링"으로 교정. D20 근거의 Hook 타입 설명도 동일하게 수정.

**핵심 결론은 맞음**: 두 Hook 모두 LLM fullResponse를 sanitize하지 않는다 — Hook 타입 레이블만 교정하면 됨.

---

## Issue 3 (John/PM): D13 수정 후 테이블 포맷 불일치 [MEDIUM]

수정 후 D13 테이블: `| # | 결정 | 선택 |` — 3열
Important Decisions 테이블 포맷: `| # | 결정 | 선택 | 근거 |` — 4열

D13이 Deferred에서 해제되어 Important Decisions로 이동한다면 4열 포맷이어야 하고, Deferred에 잔류한다면 3열 `| # | 결정 | 이유 |` 포맷이어야 한다. 현재는 어느 쪽도 아닌 중간 상태 (3열 + "선택" 헤더). 기존 D14~D16 Deferred 항목들의 포맷(`| # | 결정 | 이유 |`)과도 불일치.

**수정 방향**: D13을 Important Decisions 테이블에 4열로 추가하거나, Deferred 테이블에서 명확히 제거("⚡ Epic 15 구현 완료" 표기) 후 Important Decisions에 포함.

---

## 긍정 검증 항목

| 항목 | 결과 |
|------|------|
| D8 수정 — DB 쿼리 캐싱 없음 유지, Epic 15는 D8 범위 밖 | ✅ 원래 의도 정확히 보존. 수정 근거도 명확 |
| D17~D20 포맷 — `| # | 결정 | 선택 | 근거 |` 4열 | ✅ D1~D12 기존 포맷과 일치 |
| D17 PoC 결정 트리 — Brief 구현 노트 일치 여부 | ✅ 정확히 일치 (성공→agent-loop 수정, 실패→messages.create) |
| D19 E8 경계 grep 패턴 (grep -v 제외 조건 포함) | ✅ PRD addendum과 일치 |
| D20 companyId 격리 — Tool Cache 키 포맷 (sort 포함) | ✅ FR-CACHE-2.2 수정안과 일치 |
| D20과 D1의 관계 명시 | ✅ "멀티테넌시 핵심 원칙(D1) 캐싱 적용"으로 근거 명확 |

---

## 요약

| # | 역할 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | Mary/BA | CRITICAL | D-번호 충돌 — architecture.md D17(Tool Cache) vs addendum D17(Prompt Cache) |
| 2 | Mary/BA | HIGH | D20 credential-scrubber PreToolUse 오류 (PostToolUse가 맞음) |
| 3 | John/PM | MEDIUM | D13 수정 후 포맷 불일치 (3열 vs 4열) |
