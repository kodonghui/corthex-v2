# Critic-B (QA + Security) Implementation Review — Story 24.4

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-24

---

## AC Verification

| AC | Status | Evidence |
|----|--------|----------|
| AC-1 3 default presets | ✅ | `shared/constants.ts:50-72` — balanced 50/50/50/50/50, creative 80/30/70/60/40, analytical 40/90/20/40/30. Values match spec (epics-and-stories.md:2037) exactly. |
| AC-2 Preset API endpoint | ✅ | `agents.ts:72-74` — `GET /agents/personality-presets` returns `{ success, data: PERSONALITY_PRESETS }` |
| AC-3 Backward compat | ✅ | No "none"/"default" preset. NULL remains the default for agents without personality. Test line 123-128. |
| AC-4 Soul template placeholders | ✅ | `soul-templates.ts:143-155` (manager) + `:246-258` (secretary) — all 5 `{{personality_*}}` vars + Korean communication style guidance. |

## Preset Values Verification

| Preset | O | C | E | A | N | Spec Match |
|--------|---|---|---|---|---|------------|
| balanced | 50 | 50 | 50 | 50 | 50 | ✅ |
| creative | 80 | 30 | 70 | 60 | 40 | ✅ |
| analytical | 40 | 90 | 20 | 40 | 30 | ✅ |

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 프리셋 값 정확. 타입 명확. 한국어 라벨(nameKo) + 영문 이름 포함. |
| D2 완전성 | 8/10 | 4/4 AC 구현. 15 테스트. API endpoint 응답 테스트 미비 (아래 참조). |
| D3 정확성 | 9/10 | 프리셋 값 spec 일치. 타입 정확. Route 패턴 정확. |
| D4 실행가능성 | 10/10 | 157/157 pass. Type-check clean. |
| D5 일관성 | 9/10 | `@corthex/shared` barrel export 패턴 준수. `{ success, data }` API 포맷. `as const` 이뮤터블. |
| D6 리스크 | 9/10 | Route ordering 안전. Auth 보호됨. 이뮤터블 상수. 하단 상세. |

### 가중 평균: 8.85/10 ✅ PASS

---

## Security Assessment

### Route Ordering — Critical Check ✅

```
Line 72: GET /agents/personality-presets    ← FIRST (specific)
Line 77: GET /agents                        ← list
Line 96: GET /agents/:id                    ← AFTER (parameterized)
```

If `/personality-presets` were after `/:id`, Hono would match `"personality-presets"` as an agent ID and return 404. Route order is correct.

### Auth Protection ✅

`agentsRoute.use('*', authMiddleware, adminOnly, tenantMiddleware)` (line 20) — all routes including preset endpoint are behind auth + admin check. Presets are platform-wide (don't use tenant context) but auth is still enforced.

### Immutability ✅

`PERSONALITY_PRESETS` declared as `readonly PersonalityPreset[]` + `as const` — prevents runtime mutation of preset values.

### Type Boundary

`PersonalityTraits` type in shared allows any `number` (no int/range constraint at type level). This is correct — Zod schema at API boundary handles runtime validation. TypeScript types + Zod = compile-time shape + runtime validation.

## Issues (1 non-blocking)

### 1. **[D2] API endpoint response not tested**

15 tests verify preset constants and soul templates, but none test the actual `GET /api/admin/agents/personality-presets` endpoint. The endpoint (agents.ts:72-74) is a simple passthrough of `PERSONALITY_PRESETS`, so risk is very low, but a smoke test would complete AC-2 coverage.

**Suggested test:**
```typescript
test('GET /personality-presets returns all 3 presets', async () => {
  // Integration test via app.request('/api/admin/agents/personality-presets')
  // Verify response.data has length 3 and correct structure
})
```

**Severity:** Low — the endpoint is trivial (one-liner returning a constant). Constant values are thoroughly tested.

## Observations (non-scoring)

### AR30 Implementation Note

AR30 originally specified "DB seed migration" for presets (epics-and-stories.md:380). Implementation uses shared constants instead. Story spec was updated to reflect this (AC-1: "defined as shared constants"). This is a valid simplification — presets are platform-wide, immutable, and don't need per-company customization. Constants are simpler and eliminate DB failure mode.

### Soul Template Quality

Both MANAGER and SECRETARY templates include role-specific personality guidance:
- Manager: "비유적인 표현" (metaphorical expression for high openness)
- Secretary: "비유를 활용" + "종합하고 CEO 눈높이로 재구성" (synthesize at CEO level)

Guidance is contextually appropriate for each role. ✅

---

## Verdict

**✅ PASS (8.85/10)**

Clean implementation. Preset values match spec exactly. Route ordering prevents param collision. Types exported correctly via shared barrel. Soul templates provide meaningful personality-to-behavior guidance. Single non-blocking gap: API endpoint smoke test.
