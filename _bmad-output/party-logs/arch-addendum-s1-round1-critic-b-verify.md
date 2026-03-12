# CRITIC-B 검증: Architecture Addendum Section 1 v2
**라운드:** 수정 후 검증 | **날짜:** 2026-03-12

---

## 이슈별 수정 확인

| 이슈 | 확인 결과 | 비고 |
|------|----------|------|
| Issue 1: D-번호 충돌 [CRITICAL] | ❌ FAIL | addendum D17=Prompt Cache 유지, architecture.md D17=Tool Cache 유지 — 충돌 미해결 |
| Issue 2: credential-scrubber PreToolUse 오류 [High] | ✅ PASS | addendum line 125: `credential-scrubber (**PostToolUse**)` 정확 |
| Issue 3: D13 Deferred 이중 상태 [Medium] | ❌ FAIL | architecture.md line 368: D13 여전히 Deferred 테이블 잔류, "D13-Phase4" 유령 ID도 잔류 |
| Issue 4: D12→D17 점프 미설명 [Medium] | ⚠️ PARTIAL | addendum line 69 번호 갭 설명 추가됨. 그러나 "D17~D20은 Epic 15 신규 결정"은 architecture.md 기존 D17~D19와 충돌하는 설명 |
| Issue 5: 흐름도 sanitization 위치 [Low] | ✅ PASS | 신규 통합 흐름도 line 156: `saveToSemanticCache (내부에서 CREDENTIAL_PATTERNS 마스킹 후 저장 — D20 callee 처리)` ✅ |
| Issue 6: Layer 2/3 fallback 미표시 [Low] | ✅ PASS | Layer 3 line 152: `graceful fallback (NFR-CACHE-R1)` ✅, Save 오류 line 157: `오류: 무시 + log.warn (NFR-CACHE-R2)` ✅ |

---

## Issue 1 미수정 상세 (CRITICAL — 재작업 필요)

**현재 상태:**
- `architecture.md` line 360: `D17 = Tool Cache 위치 (lib/tool-cache.ts)`
- `architecture.md` line 361: `D18 = Semantic Cache 위치 (engine/semantic-cache.ts)`
- `architecture.md` line 362: `D19 = Semantic Cache 저장 전 sanitization (CREDENTIAL_PATTERNS)`
- `addendum` line 75: `D17 = Prompt Cache 전략 (cache_control ContentBlock)` ← 충돌
- `addendum` line 76: `D18 = Tool Cache 위치` ← architecture.md D17과 동일 내용
- `addendum` line 77: `D19 = Semantic Cache 위치` ← architecture.md D18과 동일 내용
- `addendum` line 78: `D20 = companyId 격리`

**필요한 수정:**
addendum의 번호를 architecture.md 현재 상태 기준으로 재정렬:
- D17 (Prompt Cache 전략) → **D20** (신규)
- D18 (Tool Cache 위치) → architecture.md D17로 이미 정의됨, addendum에서 "D17 확인" 참조로 변경
- D19 (Semantic Cache 위치) → architecture.md D18로 이미 정의됨, "D18 확인" 참조로 변경
- D20 (companyId 격리) → **D21** (신규)
- D21 (Redis 전환 Deferred) → **D22** (신규)
- addendum 내 모든 D17~D21 참조 일괄 업데이트: PoC 결정 트리(D17→D20), E8 검증 섹션(D19→D18), Credential Sanitization 섹션(D20→D21), 흐름도 괄호 참조 전부

---

## Issue 3 미수정 상세 (Medium — 재작업 필요)

`architecture.md` line 368: D13이 Deferred 테이블에 여전히 존재:
```
| D13 | Claude API · 도구 · Semantic 캐싱 전략 | Epic 15에서 조기 구현 ... Phase 4+ Redis 전환은 별도 D13-Phase4로 Deferred 유지. |
```
- `D13-Phase4`는 어디에도 정의되지 않은 유령 ID
- D13이 "Deferred" 테이블 안에 "구현됨" 표시 — 구조적 이중 상태

**필요한 수정:**
1. architecture.md Deferred 테이블에서 D13 행 완전 제거
2. D13을 Important Decisions 테이블로 이동
3. Phase 4+ Redis 전환은 D22 (Issue 1 재정렬 후)로 Deferred에 별도 등록

---

## 양호한 신규 추가 사항

- **통합 흐름도**: 3-레이어 런타임 실행 순서 (D17~D20 통합) — 구체적, 레이어별 NFR 참조 포함
- **D20 Credential Sanitization 섹션**: Hook 파이프라인 설명 정확 (PreToolUse/PostToolUse 구분, Stop Hook 한계 명시)
- **D17 PoC 결정 트리**: 그대로 유효

---

## 최종 점수

**5 / 10**

- 3개 이슈 반영: Issue 2(High) ✅, Issue 5(Low) ✅, Issue 6(Low) ✅ (+3점)
- CRITICAL Issue 1 미반영: D-번호 충돌 그대로 — 두 문서 병합 시 D17~D19 중복 정의 발생 (-3점)
- Medium Issue 3 미반영: D13 Deferred 이중 상태 그대로 (-1점)
- Issue 4 부분 반영: 갭 설명 추가됐지만 충돌 내용 포함 (-1점)

Issue 1은 addendum 전체 D-번호 체계에 영향하므로 재작업 필수. 재작업 후 재검증 요망.
