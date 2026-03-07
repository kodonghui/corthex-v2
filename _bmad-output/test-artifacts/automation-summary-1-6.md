---
stepsCompleted: ['step-01-preflight', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-07'
story: '1-6-seed-data-org-templates'
---

# TEA Automation Summary -- Story 1-6

## Preflight
- Stack: fullstack (Turborepo monorepo)
- Test framework: bun:test
- Mode: BMad-Integrated (sequential)
- Playwright/Pact: disabled

## Coverage Plan

| Priority | Category | Test Count | Description |
|----------|----------|-----------|-------------|
| P0 | Schema Compliance | 30 | templateData 구조, 필수 필드, tier/model 검증 |
| P0 | Soul Integrity | 4 | 마크다운 형식, 안전성, 길이 |
| P0 | Model Assignment | 3 | 3계급 모델 배정 규칙 |
| P1 | Tool Validity | 21 | allowedTools가 실제 도구 이름인지 검증 |
| P1 | Uniqueness | 7 | 부서/에이전트 이름 중복 방지 |
| P1 | Content Safety | 2 | SQL/XSS 인젝션 방어 |
| P2 | Immutability | 5 | BUILTIN_TEMPLATES 계약 검증 |
| P2 | Manager Capability | 6 | Manager에 create_report 도구 확인 |

## Results

- **Total tests generated:** 74
- **All pass:** 74/74
- **Expectations:** 762
- **File:** `packages/server/src/__tests__/unit/seed-data-tea.test.ts`

## Combined with dev-story tests

- dev-story tests: 195
- TEA tests: 74
- **Total: 269 tests**
