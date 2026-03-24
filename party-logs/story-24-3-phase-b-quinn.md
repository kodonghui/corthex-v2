# Critic-B (QA + Security) Implementation Review — Story 24.3

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 Layer 1 Key Boundary | ✅ | soul-enricher.ts:42-49 — `PERSONALITY_KEYS` whitelist, iterates only 5 allowed keys |
| AC-2 Layer 2 API Zod | ✅ | agents.ts:24-30 — `.strict()` + `.int().min(0).max(100)` |
| AC-3 Layer 3 extraVars strip | ✅ | soul-enricher.ts:48 — `String(val).replace(/[\n\r\t\x00-\x1f]/g, '')` matches E12 spec |
| AC-4 Layer 4 Template regex | ✅ | soul-renderer.ts:45 — `{{var}} → value or ''`. Test regex at per1-test:301 matches exactly. |
| AC-5 AR60 Independence | ✅ | soul-enricher.ts imports: db, schema, drizzle-orm, logger only. Test reads source to verify. |
| AC-6 NFR-S8 100% pass | ✅ | 32/32 adversarial tests pass |
| AC-7 Go/No-Go #2 | ✅ | per1-test:311-317 — unknown vars → empty string confirmed |

## E12 Architecture Compliance

Verified Layer 3 regex against E12 spec (architecture.md:2037-2040):

| | E12 Spec | Implementation |
|---|----------|---------------|
| Regex | `String(v).replace(/[\n\r\t\x00-\x1f]/g, '')` | `String(val).replace(/[\n\r\t\x00-\x1f]/g, '')` |
| Match | **Exact** | ✅ |

Layer execution order verified: 1→2→3→4 as required by architecture.md:2047.

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | E12 regex 문자 단위 일치. 라인 참조 정확. |
| D2 완전성 | 8/10 | 7/7 AC 구현. 32 테스트 across 4 layers + E2E. Layer 3 직접 테스트 1개 미비 (아래). |
| D3 정확성 | 10/10 | regex 완벽 일치. Layer 4 테스트 regex가 실제 soul-renderer.ts:45와 동일. |
| D4 실행가능성 | 10/10 | 32/32 pass, 87 total pass. Build 4/4. |
| D5 일관성 | 9/10 | E12, AR60, NFR-S8 아키텍처 전부 정합. Layer 번호링 일관. |
| D6 리스크 | 8/10 | 재귀 템플릿 인젝션 검증됨. Prototype pollution 검증됨. AR60 독립성 검증됨. |

### 가중 평균: 8.75/10 ✅ PASS

---

## Security Deep-Dive

### Attack Vector Coverage (32 tests)

| Vector | Layer | Test Lines | Result |
|--------|-------|-----------|--------|
| Extra key injection | L1 | 93-106 | Silently ignored ✅ |
| Prototype pollution (`__proto__`) | L1 | 121-131 | No pollution ✅ |
| Constructor override | L1 | 108-119 | Ignored ✅ |
| Non-integer bypass (float, NaN, Infinity) | L1 | 133-144 | Type guard rejects ✅ |
| Out-of-range (-1, 101, MAX_SAFE_INT) | L1 | 146-157 | Range guard rejects ✅ |
| SQL injection in value | L2 | 215-224 | Type-checked away ✅ |
| Prompt injection in value | L2 | 226-235 | Type-checked away ✅ |
| Extra fields via Zod | L2 | 169-175 | `.strict()` rejects ✅ |
| Control character in output | L3 | 260-271 | Regex strip verified ✅ |
| Template `{{}}` in value (recursive) | L4 | 319-327 | Single-pass, no recursion ✅ |
| Unknown var names | L4 | 311-317 | Empty string ✅ |
| Nested braces | L4 | 329-336 | Regex handles correctly ✅ |
| Full chain malicious E2E | E2E | 372-386 | Only valid keys pass ✅ |
| MEM-6/TOOLSANITIZE independence | AR60 | 419-431 | Source verified clean ✅ |

### Recursive Template Injection — Critical Finding

per1-test:319-327 confirms `renderSoul` does single-pass replacement. If `personality_openness` = `"{{system_prompt}}"`, the output is the literal string `{{system_prompt}}`, NOT the value of system_prompt. **This is correct — no recursive expansion.**

In practice, this vector is unreachable because Layer 1 type guard ensures values are integers 0-100. Defense is theoretical but tested. ✅

## Issues (1 non-blocking)

### 1. **[D2] Layer 3 regex never exercised with actual control characters**

Layer 3 test (per1-test:260-271) only verifies that `String(75)` doesn't contain control characters — which is trivially true. The regex `/[\n\r\t\x00-\x1f]/g` is never tested against a string that *actually contains* control characters.

Because the Layer 1 type guard (`typeof === 'number' && isInteger`) runs first, `String(val)` for integers 0-100 can never contain `\n\r\t\x00-\x1f`. So Layer 3 is dead-path defense-in-depth.

**Why this matters:** If Layer 3 regex had a typo (e.g., wrong character class), the tests wouldn't catch it. The regex happens to be correct (verified against E12 spec), but there's no test proving it *works*.

**Suggested fix (optional):** Add a direct regex test:
```typescript
test('Layer 3 regex strips control characters from arbitrary strings', () => {
  const strip = (s: string) => s.replace(/[\n\r\t\x00-\x1f]/g, '')
  expect(strip('75\n')).toBe('75')
  expect(strip('hello\x00world')).toBe('helloworld')
  expect(strip('\r\n\t')).toBe('')
})
```

**Severity:** Low — defense-in-depth path. Regex verified correct by visual inspection against E12 spec.

---

## Verdict

**✅ PASS (8.75/10)**

PER-1 4-layer chain is solid. All layers verified against E12 architecture spec. 32 adversarial tests provide comprehensive attack surface coverage. Recursive template injection explicitly tested and safe. AR60 independence verified via source inspection. The single non-blocking issue (Layer 3 dead-path testing) is theoretical — the regex is correct per spec.
