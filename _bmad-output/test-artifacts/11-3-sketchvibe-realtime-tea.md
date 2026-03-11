---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests']
lastStep: 'step-03-generate-tests'
lastSaved: '2026-03-11'
inputDocuments:
  - _bmad-output/implementation-artifacts/11-3-sketchvibe-ai-realtime-editing.md
  - packages/server/src/lib/tool-handlers/builtins/sketchvibe-mcp.ts
  - packages/server/src/__tests__/unit/sketchvibe-realtime.test.ts
---

# TEA: Story 11.3 SketchVibe AI 실시간 편집

## Risk Matrix

| ID | Risk | Severity | Coverage |
|----|------|----------|----------|
| R1 | MCP 브로드캐스트 이벤트 형태 무결성 | HIGH | 4 tests |
| R2 | companyId 테넌트 격리 | HIGH | 2 tests |
| R3 | 에러 복원력 (JSON 실패, 빈 응답) | HIGH | 4 tests |
| R4 | 비-mutation 도구 브로드캐스트 차단 | MEDIUM | 2 tests |
| R5 | 빠른 연속 mutation 순서 | MEDIUM | 1 test |
| R6 | 대용량 mermaid 페이로드 | MEDIUM | 1 test |
| R7 | 필드 추출 엣지 케이스 | LOW | 2 tests |

## Test Summary

- **File**: `packages/server/src/__tests__/unit/sketchvibe-realtime-tea.test.ts`
- **Tests**: 16 pass, 0 fail
- **Assertions**: 36 expect() calls
- **Framework**: bun:test

## Coverage Gaps Addressed

1. 테넌트 격리: ctx.companyId vs input.companyId 혼동 방지
2. 에러 방어: malformed JSON, null 값, 빈 응답 시 크래시 방지
3. 비-mutation 차단: read_canvas/save_diagram이 mermaid 응답 있어도 브로드캐스트 안 함
4. 동시성: 5개 동시 mutation이 5개 브로드캐스트 생성 확인
5. 대용량: 100개 노드 mermaid 페이로드 정상 브로드캐스트
