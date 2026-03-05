# Story 12.2: 병렬 위임 엔진 — Promise.all 동시 실행

Status: done

## Story

As a 비서 에이전트,
I want 여러 부서에 동시에 위임을 실행할 수 있다,
so that 위임 처리 시간이 단축되고 효율적으로 보고서를 받을 수 있다.

## Acceptance Criteria

1. **Given** 비서가 3개 부서에 위임 **When** 실행 **Then** 3개가 병렬(Promise.all)로 동시 실행
2. **Given** 위임 중 1개 실패 **When** Promise.all **Then** 나머지는 정상 완료, 실패만 오류 표시
3. **Given** 3개 이상 동시 위임 **When** 시작 **Then** delegation-chain 이벤트 발생
4. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: orchestrator.ts 순차 for → Promise.all 병렬로 변환
- [x] Task 2: delegation-chain 이벤트 추가 (3개+ 동시 위임)
- [x] Task 3: 각 위임별 독립적 에러 핸들링 유지
- [x] Task 4: 빌드 확인 — 3/3 성공

## Dev Notes

### 변경 파일
- `packages/server/src/lib/orchestrator.ts` — 핵심 변경

### 주요 변경 사항
1. 순차 `for (const del of analysis.delegations)` → `Promise.all(delegationPromises)` 병렬 실행
2. delegationTargets 배열을 먼저 추출/필터 후 map으로 병렬 promise 생성
3. 각 promise 내부에서 독립적으로 DB 기록, WS 이벤트, 에러 핸들링
4. `delegation-chain` 이벤트 타입 추가 (3개+ 동시 위임 시 UI에서 체인 표시용)
