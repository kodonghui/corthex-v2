# CRITIC-A Review: Architecture D8/D13 update + D17~D19 신규

**Reviewer:** CRITIC-A (John/PM, Sally/UX, Mary/BA)
**File reviewed:** `_bmad-output/planning-artifacts/architecture.md`
**변경 위치:** D8(line 355), D13(line 368), D17~D19(lines 360~362), Caching Architecture 섹션(lines 406~459)
**Date:** 2026-03-12

---

## Issue 1 (Mary/BA): D19 — credential-scrubber Hook 타입이 architecture.md 자체 정의와 상충 [HIGH]

D19 근거 컬럼: "output-redactor(PostToolUse) · `credential-scrubber`(**PreToolUse**)는 도구 I/O만 처리."

그런데 architecture.md lines 162~167(Hook 파이프라인 순서)에 명확히:
```
PreToolUse: tool-permission-guard
PostToolUse: credential-scrubber → output-redactor → delegation-tracker
```

credential-scrubber는 **PostToolUse**이지 PreToolUse가 아니다. D19가 같은 문서 내 D4의 Hook 파이프라인 정의(line 346: "PreToolUse: permission → PostToolUse: scrubber→redactor→delegation → Stop: cost")와 자기 모순. 아키텍처 결정 문서에서 동일 시스템을 다르게 설명하면 구현자가 어느 것을 따라야 할지 혼선. D19 근거를 "credential-scrubber(PostToolUse) · output-redactor(PostToolUse)"로 수정 필요.

**핵심 결론은 맞음**: 두 Hook 모두 도구 I/O만 처리하며 LLM fullResponse를 sanitize하지 않는다 — Hook 타입 레이블만 교정하면 됨.

---

## Issue 2 (John/PM): D13이 Deferred 테이블에 "조기 구현"으로 잔류 — 구조적 모순 [MEDIUM]

Deferred 테이블(line 368)에 D13이 "**Epic 15에서 조기 구현**"으로 표기되어 있다. 그러나 Deferred는 "아직 결정하지 않거나 미구현인 항목"을 담는 테이블이다. 이미 구현된 결정이 Deferred 테이블에 존재하는 것은 구조적으로 모순. Phase 5+ Deferred 목록(line 1111)에서 "Epic 15 조기 구현" 항목이 별도로 표시되어 있어 중복 혼선도 발생. **수정 방향**: D13을 Deferred 테이블에서 제거하고 "Important Decisions" 테이블에 신규 추가하거나, Deferred 테이블에 "완료 — Epic 15" 배지를 달고 향후 아카이브 처리.

---

## Issue 3 (Mary/BA): D12 → D17 번호 점프 이유 설명 없음 [MEDIUM]

Important Decisions 테이블에 D7~D12 다음에 D17~D19가 배치되어 D13~D16이 어디에 있는지 독자가 직접 Deferred 테이블을 찾아야 한다. architecture.md를 처음 읽는 구현자는 "D13~D16이 빠진 이유가 뭐지?" 혼란. **수정 방향**: D17~D19 행 위 또는 테이블 상단에 주석 `<!-- D13~D16은 하단 Deferred 섹션 참조 -->` 또는 각주 한 줄 추가. 또는 D17~D19를 D13~D15로 재번호화(D13이 Deferred에서 해제되면 가장 자연스러운 번호).

---

## Issue 4 (Sally/UX): Caching Architecture 흐름도 — Layer 2/3 graceful fallback 미표시 [LOW]

흐름도(lines 411~427)에서 Layer 1(Semantic Cache)만 "미스/오류: graceful fallback → 계속" 표시. Layer 2(Prompt Cache PoC 실패 → `anthropic.messages.create` 대안), Layer 3(`withCache()` 예외 → 원본 함수 실행)의 fallback 경로가 흐름도에 없어 "캐시 레이어 전체 장애 시 에이전트 정상 동작"(NFR-CACHE-R3) 보장이 흐름도에서 보이지 않음. 구현자가 Layer 2/3의 fallback 처리를 선택 사항으로 오해할 수 있음. **추가 권고**: Layer 2/3에도 "(실패 시 graceful fallback → 원본 실행)" 한 줄 추가.

---

## 긍정 검증 항목

| 항목 | 결과 |
|------|------|
| D8 수정 — DB 쿼리 캐싱 없음 유지, Epic 15는 D8 범위 밖 | ✅ 원래 의도 정확히 보존 |
| D13 조기 해제 근거 (에이전트 수 무관, $27/월 즉각 절감) | ✅ architecture.md 스타일 일치 |
| D17/D18/D19 포맷 — `| # | 결정 | 선택 | 근거 |` | ✅ D1~D12와 완전 일치 |
| 3-레이어 실행 순서 vs FR-CACHE-3.8 일치 여부 | ✅ 정확히 일치 (Semantic→Prompt→Tool→save) |
| D19 Hook 결론(LLM fullResponse sanitize 불가) | ✅ 결론 정확, 레이블만 오류 |
| E8 grep 패턴 (grep -v 제외 조건 포함) | ✅ NFR-CACHE-S3 수정안과 일치 |
| Phase 4 Deferred (Redis 전환, 1시간 TTL 자동화) | ✅ Brief Deferred 목록과 일치 |

---

## 요약

| # | 역할 | 심각도 | 이슈 |
|---|------|--------|------|
| 1 | Mary/BA | HIGH | D19 credential-scrubber Hook 타입 오류 (PreToolUse → PostToolUse) |
| 2 | John/PM | MEDIUM | D13이 Deferred 테이블에 잔류 — 구조적 모순 |
| 3 | Mary/BA | MEDIUM | D12→D17 번호 점프 이유 미설명 |
| 4 | Sally/UX | LOW | Caching 흐름도 Layer 2/3 graceful fallback 미표시 |
