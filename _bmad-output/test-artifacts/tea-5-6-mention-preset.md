---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-11'
story: '5.6'
inputDocuments:
  - _bmad-output/implementation-artifacts/5-6-mention-preset-system.md
  - packages/server/src/routes/workspace/hub.ts
  - packages/server/src/routes/workspace/presets.ts
  - packages/server/src/db/scoped-query.ts
---

# TEA: Story 5.6 — @멘션 + 프리셋 시스템

## Risk Analysis

| Risk ID | Severity | Area | Description |
|---------|----------|------|-------------|
| R1 | HIGH | hub.ts pipeline | 프리셋 확장 순서 오류 → 잘못된 에이전트 라우팅 |
| R2 | HIGH | getDB migration | 테넌트 격리 깨짐 → 타사 데이터 노출 |
| R3 | MED | preset+mention | 프리셋 확장 후 @mention 상호작용 |
| R4 | MED | edge cases | 빈 메시지, 특수문자, 대소문자 |
| R5 | LOW | sortOrder | 비동기 에러 처리 |

## Test Coverage

| Test File | Tests | Risk Coverage |
|-----------|-------|--------------|
| `mention-preset-system.test.ts` | 27 | R1, R3, R4 |
| `preset-crud.test.ts` | 49 | R2, R4 |
| `mention-preset-tea.test.ts` | 24 | R1, R2, R3, R4, R5 |
| **Total** | **100** | **All risks covered** |

## Key Test Scenarios

### R1: Pipeline Order (7 tests)
- agentId > preset > @mention > secretary 우선순위
- 프리셋 확장 후 @mention 파싱 연쇄
- 프리셋 확장 후 secretary fallback

### R2: Tenant Isolation (4 tests)
- companyId 필수 검증
- 회사 간 프리셋 이름 독립
- 삭제 시 타사 데이터 보존

### R3: Preset + @Mention (4 tests)
- 프리셋 이름이 에이전트 이름과 동일한 경우
- 확장된 명령에 @mention 포함 시 파싱
- 한국어 @mention 에이전트 이름

### R4: Edge Cases (6 tests)
- 빈 메시지, 공백, 특수문자
- 대소문자 정확 일치
- 긴 명령 (10000자)

### R5: sortOrder (3 tests)
- 비동기 에러 무시
- 정렬 순서 검증

## Result: PASS — 100 tests, 0 failures, 0 regressions
