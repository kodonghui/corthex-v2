# Story 12.4: 위임 보안 — 깊이 제한 + 중복 방지 + 감사 로그

Status: done

## Story

As a 시스템 관리자,
I want 위임에 보안 제한이 적용된다,
so that 무한 루프, 중복 위임, 추적 불가능한 위임이 발생하지 않는다.

## Acceptance Criteria

1. **Given** 세션에 processing 위임 3개 **When** 추가 위임 시도 **Then** 차단 메시지 반환
2. **Given** 같은 에이전트에게 2번 위임 요청 **When** 분석 결과 **Then** 중복 제거되어 1번만 실행
3. **Given** 위임 완료 **When** 결과 수집 후 **Then** activity-logger에 성공/실패 감사 로그 기록
4. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: MAX_DELEGATION_DEPTH=3, processing 위임 수 확인
- [x] Task 2: Set 기반 중복 에이전트 위임 필터
- [x] Task 3: logActivity로 위임 결과 감사 로그
- [x] Task 4: 빌드 확인

## Dev Notes

### 변경 파일
- `packages/server/src/lib/orchestrator.ts` — 3가지 보안 장치 추가
