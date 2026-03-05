# Story 2.7: Secretary Assignment & Session Management

Status: done

## Story

As a 관리자,
I want 비서 에이전트를 배정하고 보안 사고 시 세션을 강제 종료하기를,
so that 직원에게 비서를 달아주고 긴급 시 즉시 접근을 차단할 수 있다.

## Acceptance Criteria

1. **Given** 에이전트 편집 **When** "비서 역할" 토글 ON **Then** agents.isSecretary=true 저장 + 비서 뱃지 표시
2. **Given** 비서 배정 **When** 해당 직원의 에이전트 목록 조회 **Then** 비서 에이전트 상단 고정 표시
3. **Given** 직원 목록 **When** "세션 종료" 클릭 **Then** 확인 모달 → 해당 유저 모든 세션 즉시 무효화
4. **Given** 세션 종료됨 **When** 해당 유저가 API 호출 **Then** 401 응답 → 재로그인 필요
5. **Given** 세션 종료 **When** 완료 **Then** 활동 로그에 "관리자에 의한 세션 종료" 기록

## Tasks / Subtasks

- [x] Task 1: 비서 역할 토글 UI (AC: #1, #2)
  - [x] 에이전트 편집 모달/폼에 "비서 역할" 토글 스위치 추가
  - [x] 에이전트 카드에 isSecretary=true면 비서 뱃지 (이미 있음, 확인)
  - [x] 에이전트 생성 시에도 비서 역할 옵션 제공
- [x] Task 2: 세션 강제 종료 API (AC: #3, #4)
  - [x] `POST /api/admin/users/:id/terminate-session` 라우트 신규
  - [x] sessions 테이블에서 해당 userId의 모든 활성 세션 삭제 또는 만료 처리
  - [x] 활동 로그 기록: type='system', action='세션 강제 종료'
- [x] Task 3: 세션 종료 UI (AC: #3, #5)
  - [x] 직원 목록 테이블 행에 "세션 종료" 버튼 (빨간색, 활성 유저만)
  - [x] 클릭 → 확인 모달: "{이름}의 모든 세션을 종료하시겠습니까? 즉시 로그아웃됩니다."
  - [x] 성공 시 토스트: "세션이 종료되었습니다"
- [x] Task 4: 테스트
  - [x] 세션 종료 후 해당 유저 JWT 401 테스트
  - [x] 비서 역할 토글 API 테스트
  - [x] 활동 로그 기록 확인 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/agents.tsx` — 에이전트 카드에 `isSecretary` 뱃지 이미 표시
- `packages/server/src/routes/admin/agents.ts` — 에이전트 PATCH (isSecretary 필드 업데이트 가능)
- `packages/server/src/db/schema.ts` — sessions 테이블, agents.isSecretary 컬럼
- `packages/server/src/lib/activity-logger.ts` — 활동 로그 유틸

**신규 작성:**

| 항목 | 설명 |
|------|------|
| terminate-session API | sessions 테이블 해당 userId 레코드 삭제/만료 |
| 세션 종료 UI | 직원 목록 행에 빨간 버튼 + 확인 모달 |
| 비서 토글 UI | 에이전트 폼에 토글 스위치 |

### 세션 종료 구현 패턴

```typescript
// POST /api/admin/users/:id/terminate-session
const userId = c.req.param('id')
await db.delete(sessions).where(eq(sessions.userId, userId))
// 또는 sessions에 expiresAt을 현재 시각으로 설정
logActivity({
  companyId: tenant.companyId,
  type: 'system',
  phase: 'end',
  actorType: 'admin',
  actorId: tenant.userId,
  action: `세션 강제 종료: ${userId}`,
})
```

### 파일 변경 범위

```
packages/server/src/routes/admin/users.ts     — terminate-session 라우트
packages/admin/src/pages/users.tsx            — 세션 종료 버튼 + 모달
packages/admin/src/pages/agents.tsx           — 비서 토글 스위치
packages/server/src/__tests__/                — 세션 종료 테스트
```

### References

- [Source: packages/admin/src/pages/agents.tsx] — isSecretary 뱃지 이미 표시
- [Source: packages/server/src/db/schema.ts] — sessions 테이블
- [Source: PRD FR-1.10, FR-1.11] — 비서 배정, 세션 강제 종료

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- 비서 역할 토글 UI 추가 (에이전트 생성/수정 폼에 체크박스)
- 세션 강제 종료 API (terminate-session) + companyId 격리
- 세션 종료 시 활동 로그 기록 (logActivity)
- 세션 종료 UI (빨간 버튼 + 확인 모달 + 토스트)

### File List
- packages/server/src/routes/admin/users.ts — terminate-session 라우트 + 격리 + 활동 로그
- packages/admin/src/pages/users.tsx — 세션 종료 버튼 + 모달
- packages/admin/src/pages/agents.tsx — 비서 토글 체크박스
