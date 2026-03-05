# Story 2.4: Department & Agent CRUD

Status: ready-for-dev

## Story

As a 관리자,
I want 부서와 에이전트를 관리하기를,
so that 조직 구조를 설정하고 에이전트를 즉시 활성화할 수 있다.

## Acceptance Criteria

1. **Given** 부서 생성 **When** 동일 회사 내 중복 이름 **Then** "이미 존재하는 부서명" 에러
2. **Given** 부서 삭제 **When** 소속 에이전트가 있으면 **Then** "소속 에이전트가 있어 삭제할 수 없습니다" 에러
3. **Given** 에이전트 생성 **When** 이름/역할/소울/부서/CLI 연결 입력 **Then** DB 저장 + 즉시 활성화 (서버 재시작 불필요)
4. **Given** 에이전트 **When** userId(직원) 연결 **Then** 해당 직원의 CLI 토큰으로 에이전트 실행 가능
5. **Given** 에이전트 편집 **When** 소울(페르소나) 마크다운 수정 **Then** 미리보기 가능 + 즉시 반영
6. **Given** 부서/에이전트 페이지 **When** 로딩 **Then** 회사 선택 store 기준 데이터 표시

## Tasks / Subtasks

- [ ] Task 1: 부서 CRUD 보강 (AC: #1, #2, #6)
  - [ ] 서버: 부서 생성 시 동일 회사 내 이름 중복 체크 → 409
  - [ ] 서버: 부서 삭제 시 소속 에이전트 수 확인 → 있으면 409
  - [ ] 프론트: admin-store companyId 연동
- [ ] Task 2: 에이전트-직원 연결 UI (AC: #3, #4)
  - [ ] 에이전트 생성/수정 폼에 "담당 직원" 드롭다운 (userId 선택)
  - [ ] 서버: agents 테이블의 userId 업데이트 API 확인
  - [ ] 직원 연결 시 해당 직원의 CLI 토큰 존재 여부 표시 (유/무 뱃지)
- [ ] Task 3: 소울 편집 개선 (AC: #5)
  - [ ] 에이전트 수정 시 소울 textarea → 더 넓은 편집 모달
  - [ ] 마크다운 미리보기 (간단한 렌더링)
- [ ] Task 4: 즉시 활성화 검증 (AC: #3)
  - [ ] 에이전트 생성 후 status='offline' + isActive=true 기본값 확인
  - [ ] 서버 재시작 없이 새 에이전트 API 조회 가능 확인 테스트
- [ ] Task 5: 테스트
  - [ ] 부서 중복 이름 409 테스트
  - [ ] 부서 삭제 보호 409 테스트
  - [ ] 에이전트 CRUD + userId 연결 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/departments.tsx` — 부서 CRUD UI
- `packages/admin/src/pages/agents.tsx` — 에이전트 CRUD UI (카드 레이아웃, 생성/수정/비활성화)
- `packages/server/src/routes/admin/departments.ts` — 부서 CRUD API
- `packages/server/src/routes/admin/agents.ts` — 에이전트 CRUD API

**수정 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 부서 중복 체크 | 없음 | 동일 회사 내 이름 중복 409 |
| 부서 삭제 보호 | 없음 | 소속 에이전트 있으면 409 |
| 에이전트-직원 연결 | userId 필드 있지만 UI 없음 | 드롭다운 선택 |
| 소울 편집 | 작은 textarea | 모달 + 미리보기 |
| 회사 선택 | 하드코딩 | admin-store 연동 |

### 파일 변경 범위

```
packages/admin/src/pages/departments.tsx        — store 연동 + 삭제 보호 UI
packages/admin/src/pages/agents.tsx             — userId 드롭다운 + 소울 모달
packages/server/src/routes/admin/departments.ts — 중복/삭제 보호
packages/server/src/routes/admin/agents.ts      — userId 연결
```

### References

- [Source: packages/admin/src/pages/agents.tsx] — 현재 에이전트 UI
- [Source: PRD FR-1.6, FR-1.7] — 부서/에이전트 CRUD, 즉시 활성화
- [Source: packages/server/src/db/schema.ts] — agents.userId, agents.departmentId

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
