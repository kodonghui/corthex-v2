# Critic-B (QA + Security) Implementation Review — Story 24.2

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 soul-enricher.ts created | ✅ | `services/soul-enricher.ts` — exports `enrich()`, `EnrichResult`, in services/ not engine/ |
| AC-2 personalityVars populated | ✅ | Line 44-48: iterates PERSONALITY_KEYS, `personality_{key}: String(val)`, 5 keys |
| AC-3 NULL → empty | ✅ | Line 38: `if (!agent?.personalityTraits) return EMPTY_RESULT`. Test line 101-107. |
| AC-4 DB error → graceful | ✅ | Line 52-54: try/catch → `log.warn()` + `EMPTY_RESULT`. Test line 119-131. |
| AC-5 All callers updated | ✅ | 9 call sites in 8 files verified (see below) |
| AC-6 agent-loop.ts untouched | ✅ | `grep` confirms 0 soul-enricher imports in `engine/` |
| AC-7 EnrichResult frozen | ✅ | Line 16-19: interface + AR27 frozen comment |
| AC-8 previewSoul excluded | ✅ | `agents.ts:156-172` soul-preview route has no enrich() call |

## Call Site Verification (9 sites, 8 files)

| File | Line | Pattern | Verified |
|------|------|---------|----------|
| hub.ts | 96-106 | knowledge_context merge | ✅ enrich → spread → conditional knowledge_context → renderSoul |
| call-agent.ts | 60-68 | knowledge_context merge | ✅ same pattern as hub.ts |
| commands.ts | 56-58 | simple | ✅ enrich → spread → renderSoul |
| presets.ts | 46-48 | simple | ✅ |
| public-api/v1.ts | 47-49 | simple | ✅ |
| telegram-bot.ts | 97-98 | simple | ✅ |
| argos-evaluator.ts | 379-382 | simple | ✅ |
| agora-engine.ts | 171-174 | getCachedSoul (cached) | ✅ |
| agora-engine.ts | 307-309 | synthesize fallback | ✅ |

**Note:** Spec says "12 call sites in 9 files" but actual is 9 call sites in 8 files. Minor spec discrepancy — all renderSoul callers are covered.

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 모든 call site가 spec 패턴과 정확히 일치. |
| D2 완전성 | 8/10 | 8/8 AC 구현됨. 테스트 12개로 핵심 시나리오 커버. 2개 미비 아래 참조. |
| D3 정확성 | 9/10 | Drizzle query, type guard, String() 변환 전부 정확. |
| D4 실행가능성 | 10/10 | 12/12 테스트 통과. turbo build 4/4. |
| D5 일관성 | 9/10 | 9개 caller 전부 동일 패턴. D23/E11 아키텍처 정합. |
| D6 리스크 | 8/10 | E12 Layer 1 방어 견고. tenant 격리. engine/ 무침범. DB error 안전. |

### 가중 평균: 8.60/10 ✅ PASS

---

## Security Assessment

| 항목 | 상태 | 근거 |
|------|------|------|
| E12 Layer 1 Key Boundary | ✅ | `PERSONALITY_KEYS` const 배열로 허용 키만 순회. 추가 키 무시. |
| Type guard defense-in-depth | ✅ | `typeof === 'number' && Number.isInteger && 0-100` — DB에 잘못된 값 있어도 안전 |
| Tenant isolation | ✅ | `eq(agents.companyId, companyId)` — 교차 테넌트 접근 불가 |
| E8 boundary | ✅ | engine/ 디렉토리에 soul-enricher import 0건 |
| extraVars injection | ✅ | `String(val)` on int 0-100 — 주입 벡터 없음. 키는 `personality_` 접두사 하드코딩 |
| knowledge_context 머지 순서 | ✅ | personality vars 먼저 spread → knowledge_context 나중에 할당. 키 충돌 없음 (`personality_*` vs `knowledge_context`) |

## Issues (2 non-blocking)

### 1. **[D2] DB error 테스트 — log.warn 호출 미검증**

`soul-enricher.test.ts:119-131` — DB error 시 empty result 반환은 확인하지만, `log.warn`이 실제로 호출되었는지 assert 없음. `warnCalls` 배열이 test setup에 존재(line 33-37)하지만 이 테스트에서 검증 안 함.

**Severity:** Low — log.warn 자체는 기능에 영향 없으나, AC-4 완전 충족을 위해 `expect(warnCalls.length).toBeGreaterThan(0)` 추가 권장.

### 2. **[D6] DB error 테스트 — mock restore 취약성**

```typescript
;(db as any).select = origSelect  // line 130 — restore after test
```

테스트 중간에 assertion 실패하면 restore 실행 안 됨 → 이후 테스트 오염 가능. `afterEach` 또는 `try/finally` 패턴이 더 안전.

**Severity:** Low — 현재 테스트 순서상 이 테스트가 마지막 그룹 근처이므로 실질적 영향 적음.

---

## Verdict

**✅ PASS (8.60/10)**

soul-enricher 구현이 견고함. E12 Layer 1 방어가 특히 우수 — 5개 허용 키만 순회하고, 타입/범위 검사까지 적용. 9개 call site가 일관된 패턴으로 통합됨. E8 경계 준수 확인. 2개 non-blocking 이슈는 품질 개선 수준이며 기능에 영향 없음.
