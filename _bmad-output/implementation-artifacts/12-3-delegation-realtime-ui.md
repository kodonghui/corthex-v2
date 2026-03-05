# Story 12.3: 위임 실시간 UI — 병렬 위임 상태 추적

Status: done

## Story

As a 사용자,
I want 비서가 여러 부서에 동시에 위임할 때 모든 위임 상태를 실시간으로 볼 수 있다,
so that 어떤 부서가 작업 중이고 어떤 부서가 완료했는지 한눈에 파악할 수 있다.

## Acceptance Criteria

1. **Given** 비서가 3개 부서에 병렬 위임 **When** 화면 표시 **Then** 3개 에이전트 이름이 모두 표시
2. **Given** 위임 중 1개 완료 **When** 화면 갱신 **Then** 완료된 것은 사라지고 나머지만 표시
3. **Given** delegation-chain 이벤트 **When** 수신 **Then** 정상 처리 (에러 없음)
4. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DelegationStatus → DelegationItem[] 배열로 변경
- [x] Task 2: delegation-start → 배열에 추가 (upsert by agentId)
- [x] Task 3: delegation-end → 배열 내 해당 항목 상태 업데이트
- [x] Task 4: chat-area에서 활성 위임 복수 표시
- [x] Task 5: delegation-chain 이벤트 핸들러 추가
- [x] Task 6: 빌드 확인

## Dev Notes

### 변경 파일
- `packages/app/src/hooks/use-chat-stream.ts` — DelegationItem[], delegations 배열 관리
- `packages/app/src/components/chat/chat-area.tsx` — 복수 에이전트 이름 표시
