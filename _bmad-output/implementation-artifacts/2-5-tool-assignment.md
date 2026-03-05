# Story 2.5: Tool Assignment

Status: ready-for-dev

## Story

As a 관리자,
I want 도구를 에이전트별로 할당/해제하기를,
so that 에이전트가 올바른 도구만 사용한다.

## Acceptance Criteria

1. **Given** 에이전트 상세 **When** 도구 체크박스 ON/OFF **Then** agent_tools 매핑 즉시 업데이트
2. **Given** 도구 페이지 **When** 도구 선택 **Then** 해당 도구가 할당된 에이전트 목록 표시 + 토글 가능
3. **Given** 에이전트 페이지 **When** 에이전트 카드 클릭 **Then** 할당된 도구 목록 표시 + 추가/제거 가능
4. **Given** 도구 할당 변경 **When** 성공 **Then** 성공 토스트 표시
5. **Given** 도구 페이지 **When** 로딩 **Then** 회사 선택 store 기준 데이터 표시

## Tasks / Subtasks

- [ ] Task 1: 도구 페이지 store 연동 (AC: #5)
  - [ ] `companyData?.data?.[0]?.id` 하드코딩을 admin-store 연동으로 변경
- [ ] Task 2: 에이전트 카드에 도구 목록 표시 (AC: #3)
  - [ ] 에이전트 페이지에서 각 카드 하단에 할당된 도구 뱃지 표시
  - [ ] 에이전트별 도구 조회 API: `GET /api/admin/agent-tools?agentId=`
- [ ] Task 3: 도구 할당 N+1 쿼리 최적화 (AC: #2)
  - [ ] 현재: 도구 선택 → 모든 에이전트에 대해 개별 API 호출 (N+1 문제)
  - [ ] 개선: `GET /api/admin/agent-tools?toolId=` 단일 API로 변경
  - [ ] 서버: toolId 기준 agent_tools 조회 라우트 추가
- [ ] Task 4: 토스트 알림 (AC: #4)
  - [ ] 할당/해제/토글 성공 시 토스트 표시
- [ ] Task 5: 테스트
  - [ ] agent-tools CRUD API 테스트
  - [ ] toolId 기준 조회 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/tools.tsx` — 도구 관리 + 에이전트 배정 패널 완성
- 서버: agent-tools CRUD API (생성/토글/삭제)
- 현재 UI에서 도구 선택 → 에이전트별 개별 API 호출로 할당 정보 조회 (비효율)

**수정 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 에이전트별 도구 표시 | agents 페이지에 없음 | 카드에 도구 뱃지 |
| N+1 쿼리 | 에이전트마다 개별 호출 | toolId 기준 단일 API |
| 회사 선택 | 하드코딩 | admin-store 연동 |

### 파일 변경 범위

```
packages/admin/src/pages/tools.tsx              — store 연동 + N+1 해결
packages/admin/src/pages/agents.tsx             — 도구 뱃지 표시
packages/server/src/routes/admin/               — toolId 기준 조회 API
```

### References

- [Source: packages/admin/src/pages/tools.tsx] — 현재 도구 할당 UI
- [Source: PRD FR-1.8] — 도구 할당 체크박스 ON/OFF

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
