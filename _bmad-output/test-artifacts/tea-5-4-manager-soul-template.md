---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-04-validate']
lastStep: 'step-04-validate'
lastSaved: '2026-03-11'
story: '5.4'
inputDocuments:
  - _bmad-output/implementation-artifacts/5-4-manager-soul-standard-template.md
  - packages/server/src/lib/soul-templates.ts
---

# TEA: Story 5.4 — 매니저 Soul 표준 템플릿

## Risk Assessment

| Risk | Probability | Impact | Priority | Coverage |
|------|-------------|--------|----------|----------|
| Template variables incompatible with soul-renderer | Medium | High | P0 | ✅ 18 tests |
| Report format structure wrong | Low | Medium | P1 | ✅ Covered |
| Delegation pattern missing call_agent | Low | High | P1 | ✅ Covered |
| Prompt injection in template | Low | Critical | P0 | ✅ Covered |
| Template too large (token waste) | Low | Low | P2 | ✅ Covered |

## Test Coverage Summary

**Test File:** `packages/server/src/__tests__/unit/soul-templates.test.ts`
**Tests:** 18 pass, 0 fail
**Framework:** bun:test

### Tests by Category

**Template Content (12 tests):**
1. Template is non-empty string (>500 chars)
2. Contains {{subordinate_list}} variable
3. Contains {{tool_list}} variable
4. Contains {{department_name}} variable
5. Contains {{owner_name}} variable
6. Contains {{specialty}} variable
7. Only valid {{variable}} syntax (soul-renderer compatible)
8. Contains 5th analyst pattern (독자 분석)
9. Contains delegation pattern (call_agent)
10. Contains 4-section report format (결론/분석/리스크/추천)
11. Contains 3-step flow in correct order
12. Handles solo mode (no subordinates fallback)

**Rendering Compatibility (3 tests — TEA added):**
13. All {{variables}} substituted correctly with real values
14. Empty variables produce clean output (no leftover {{}})
15. No prompt injection risks (no ${}, no system override)

**Seed Data (3 tests):**
16. BUILTIN_SOUL_TEMPLATES has entries
17. Manager template metadata correct (name, tier, category, isBuiltin)
18. Manager template has description

## TEA Verdict

**PASS** — 18 tests cover all 8 acceptance criteria with P0 risks addressed.
No additional tests needed. Template is a pure constant with no runtime behavior beyond soul-renderer.ts substitution.
