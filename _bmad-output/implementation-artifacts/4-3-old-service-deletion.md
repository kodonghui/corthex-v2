# Story 4.3: 기존 서비스 교체/삭제

Status: ready-for-dev

## Story

As a 개발자,
I want 교체 완료된 기존 서비스 파일이 삭제되는 것을,
so that 코드베이스에 중복 경로가 남지 않는다.

## Acceptance Criteria

1. `services/agent-runner.ts` 삭제 (코드 처분 매트릭스: Phase 1 교체)
2. `services/delegation-tracker.ts` 삭제 (코드 처분 매트릭스: Phase 1 교체)
3. 삭제 전: `grep -r "agent-runner\|delegation-tracker" packages/server/src/` → 0건 확인 (engine/hooks/ 및 test 제외)
4. `tsc --noEmit` 성공 (참조 없음 확인)
5. `bun test` 전체 통과

## Codebase Reality vs Epic Expectations

**CRITICAL**: 실제 코드 분석 결과, 두 파일 모두 Phase 2 서비스에서 여전히 사용 중:

### agent-runner.ts (449줄) — 남은 참조:

| 파일 | Phase | 삭제 가능 시점 |
|---|---|---|
| `services/chief-of-staff.ts` | Phase 2 (Epic 5) | Phase 2에서 삭제 |
| `services/manager-delegate.ts` | Phase 2 (Epic 5) | Phase 2에서 삭제 |
| `services/cio-orchestrator.ts` | Phase 2 (Epic 5) | Phase 2에서 삭제 |
| `services/all-command-processor.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/sequential-command-processor.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/deep-work.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/soul-gym.ts` | scanForCredentials import | Phase 2에서 교체 |
| `services/memory-extractor.ts` | scanForCredentials import | Phase 2에서 교체 |
| `services/tool-pool-init.ts` | setToolDefinitionProvider import | Phase 2에서 교체 |
| 테스트 파일 13개 | 테스트 mock | 소스 삭제 후 자동 제거 |

### delegation-tracker.ts (services/, 242줄) — 남은 참조:

| 파일 | Phase | 삭제 가능 시점 |
|---|---|---|
| `services/chief-of-staff.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/manager-delegate.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/manager-synthesis.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/cio-orchestrator.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/all-command-processor.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/sequential-command-processor.ts` | Phase 2 | Phase 2에서 삭제 |
| `services/debate-command-handler.ts` | Phase 2 | engine/hooks로 교체 |
| `services/vector-executor.ts` | Phase 2 | engine/hooks로 교체 |
| 테스트 파일 10개 | 테스트 mock | 소스 삭제 후 자동 제거 |

**결론**: 두 파일 모두 Phase 2 서비스가 삭제되기 전에는 삭제 불가.

**실행 가능한 범위 (S12 불가침 준수)**:
- Phase 1에서 마이그레이션 완료된 파일(argos-evaluator, agora-engine)의 참조 제거 확인 ✅ (Story 4.2에서 완료)
- 남은 참조가 모두 Phase 2 대상임을 문서화 ✅
- agent-runner.ts와 delegation-tracker.ts는 **Phase 2 완료 후 삭제** 로 연기

## Tasks / Subtasks

- [x] Task 1: agent-runner.ts 참조 분석 및 Phase 2 의존 확인 (AC: #1, #3)
  - [x] 1.1 Phase 1 마이그레이션 파일(argos, agora, hub)에서 참조 0건 확인 ✓
  - [x] 1.2 남은 참조 10개 — 모두 Phase 2 서비스 (chief-of-staff, manager-delegate, cio-orchestrator, all-command-processor, sequential-command-processor, deep-work, soul-gym, memory-extractor, tool-pool-init)
  - [x] 1.3 삭제 불가 사유: Phase 2 서비스 10개가 agentRunner.execute(), AgentConfig, scanForCredentials, setToolDefinitionProvider 사용 중 → Phase 2 (Epic 5) 연기

- [x] Task 2: delegation-tracker.ts (services/) 참조 분석 (AC: #2, #3)
  - [x] 2.1 Phase 1 마이그레이션 파일에서 참조 0건 확인 ✓
  - [x] 2.2 engine/hooks/delegation-tracker.ts 존재 확인 — 단, 완전히 다른 API (PostToolUse hook vs orchestration event emitter class). 호환 불가.
  - [x] 2.3 남은 참조 8개 — 모두 Phase 2 서비스 (chief-of-staff, manager-delegate, manager-synthesis, cio-orchestrator, all-command-processor, sequential-command-processor, debate-command-handler, vector-executor)
  - [x] 2.4 삭제 불가 사유: services/ DelegationTracker는 orchestration workflow event tracking class (DelegationEvent, ToolEvent, 30+ event types). engine/hooks/ 버전은 단순 PostToolUse hook. API 완전 비호환 → Phase 2 연기

- [x] Task 3: 삭제 가능한 중간 정리 (AC: #3, #4)
  - [x] 3.1 agent-runner 테스트 파일 4개 (agent-runner.test.ts, agent-runner-qa.test.ts, agent-runner-permission.test.ts, agent-runner-tea.test.ts) — services/ 파일 존재하는 한 필요
  - [x] 3.2 delegation-tracker-tea.test.ts — services/ 버전 테스트 (DelegationTracker class). 파일 존재하는 한 필요
  - [x] 3.3 delegation-tracker.test.ts — engine/hooks/ 버전 테스트. 독립적, 변경 불필요

- [x] Task 4: 빌드 검증 (AC: #4, #5)
  - [x] 4.1 `npx tsc --noEmit` — 0 errors ✓
  - [x] 4.2 기존 테스트 — hub-route 22/22, caller-import-migration 17/17 pass ✓

## Dev Notes

### 핵심 원칙

- **S12 불가침**: Phase 2 서비스(chief-of-staff, manager-delegate, cio-orchestrator 등)는 수정/삭제하지 않음
- **D6 단일 진입점**: Phase 1에서 마이그레이션된 경로만 확인
- **현실적 판단**: Epic 계획 vs 코드 현실 불일치 — 삭제는 Phase 2로 연기

### Phase 2 삭제 순서 (향후 참고)

1. Epic 5에서 chief-of-staff, manager-delegate, cio-orchestrator 삭제
2. 이후 agent-runner.ts의 모든 import 소멸
3. 그때 agent-runner.ts + delegation-tracker.ts (services/) 안전 삭제 가능

### 대안: re-export 패턴 (Phase 2 전 중간 전환용)

services/agent-runner.ts를 engine/agent-loop.ts의 re-export로 교체하면 Phase 2 서비스가 깨지지 않으면서 단계적 전환 가능. 단, S12 불가침 위반 우려.

### Architecture References

- [Source: epics.md → Story 4.3 (lines 539-556)]
- [Source: architecture.md → S12 불가침 정의]
- [Source: architecture.md → S11 호출자 목록]

### Project Structure Notes

- 삭제 대상: `packages/server/src/services/agent-runner.ts` (Phase 2 연기)
- 삭제 대상: `packages/server/src/services/delegation-tracker.ts` (Phase 2 연기)
- 교체본: `packages/server/src/engine/hooks/delegation-tracker.ts` (이미 존재)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- **BLOCKING FINDING**: agent-runner.ts와 delegation-tracker.ts (services/) 모두 Phase 2 서비스에서 여전히 사용 중이므로 Phase 1에서 삭제 불가
- agent-runner.ts: 10개 서비스가 agentRunner.execute(), AgentConfig, scanForCredentials, setToolDefinitionProvider 사용
- delegation-tracker.ts (services/): 8개 서비스가 DelegationTracker class, DelegationEvent, ToolEvent 사용
- engine/hooks/delegation-tracker.ts와 services/delegation-tracker.ts는 완전히 다른 API — shim 교체 불가
- Phase 1 마이그레이션 파일 3개 (hub, argos, agora)는 참조 0건 확인 ✓
- **결론**: Story 4.3은 "분석 및 문서화" 완료. 실제 삭제는 Phase 2 (Epic 5) 완료 후 가능

### File List

- `_bmad-output/implementation-artifacts/4-3-old-service-deletion.md` — 분석 결과 문서화 (신규)
- 소스 코드 변경 없음 (삭제 연기)
