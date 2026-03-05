# Story 2.2: Company & User CRUD

Status: done

## Story

As a 관리자,
I want 회사와 직원을 완전하게 관리하기를,
so that 새 직원을 5분 안에 세팅할 수 있다.

## Acceptance Criteria

1. **Given** 관리자 콘솔 **When** 회사 선택 드롭다운 변경 **Then** 해당 회사의 직원/부서/에이전트 데이터 표시
2. **Given** 회사 선택됨 **When** 직원 추가 **Then** ID/PW 발급 + users 테이블 생성 + 생성 완료 토스트
3. **Given** 직원 목록 **When** "비밀번호 초기화" 클릭 **Then** 새 임시 비밀번호 생성 + 모달에 표시 (복사 가능)
4. **Given** 직원 생성 **When** 동일 회사 내 중복 username **Then** "이미 존재하는 아이디" 에러
5. **Given** 직원 수정 **When** 이름/이메일/역할 변경 **Then** 즉시 반영 + 성공 토스트
6. **Given** 회사 삭제 **When** 소속 직원이 있으면 **Then** "소속 직원이 있어 삭제할 수 없습니다" 에러

## Tasks / Subtasks

- [x] Task 1: 회사 선택 드롭다운 (AC: #1)
  - [x] Layout/Sidebar에 회사 선택 드롭다운 추가 (현재 `companyData?.data?.[0]?.id` 하드코딩 제거)
  - [x] 선택된 companyId를 Zustand store에 저장 (`admin-store.ts`)
  - [x] 모든 관리 페이지에서 store의 companyId 사용
- [x] Task 2: 비밀번호 초기화 (AC: #3)
  - [x] `POST /api/admin/users/:id/reset-password` 서버 라우트 추가
  - [x] 8자리 임시 비밀번호 생성 → hash 후 DB 저장 → 평문 반환
  - [x] 프론트: 직원 목록 행에 "비밀번호 초기화" 버튼 → 확인 모달 → 결과 모달(복사 버튼)
- [x] Task 3: 회사 삭제 보호 (AC: #6)
  - [x] 서버: 회사 삭제 시 소속 직원 수 확인 → 0이 아니면 409 에러
  - [x] 프론트: 회사 카드에 삭제 버튼 추가 + 에러 메시지 표시
- [x] Task 4: UI 개선 + 토스트 (AC: #2, #5)
  - [x] 생성/수정/삭제 성공 시 토스트 알림 (기존 notification-store 또는 간단한 toast)
  - [x] 폼 에러 메시지 개선 (서버 에러 코드 → 한국어 메시지)
- [x] Task 5: 테스트
  - [x] 비밀번호 초기화 API 테스트
  - [x] 회사 삭제 보호 테스트 (직원 있으면 409)
  - [x] 중복 username 409 테스트

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/companies.tsx` — 회사 CRUD UI (생성/수정/목록 표시)
- `packages/admin/src/pages/users.tsx` — 직원 CRUD UI (생성/수정/비활성화/테이블)
- `packages/server/src/routes/admin/companies.ts` — 회사 CRUD API
- `packages/server/src/routes/admin/users.ts` — 직원 CRUD API (생성/수정/비활성화)

**수정/추가 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 회사 선택 | `companyData?.data?.[0]?.id` 하드코딩 | 드롭다운 + store |
| 비밀번호 초기화 | 없음 | API + UI 모달 |
| 회사 삭제 | API 있지만 보호 없음 | 직원 있으면 삭제 불가 |
| 토스트 | 없음 | 성공/실패 토스트 |

### 회사 선택 store 패턴

```typescript
// packages/admin/src/stores/admin-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AdminState = {
  selectedCompanyId: string | null
  setSelectedCompanyId: (id: string) => void
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      selectedCompanyId: null,
      setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),
    }),
    { name: 'admin-company' }
  )
)
```

### 파일 변경 범위

```
packages/admin/src/stores/admin-store.ts        — 신규 (회사 선택 상태)
packages/admin/src/components/layout.tsx         — 회사 선택 드롭다운
packages/admin/src/pages/companies.tsx           — 삭제 버튼 + 보호
packages/admin/src/pages/users.tsx               — 비밀번호 초기화 버튼
packages/server/src/routes/admin/users.ts        — reset-password 라우트
packages/server/src/routes/admin/companies.ts    — 삭제 보호 로직
```

### References

- [Source: packages/admin/src/pages/users.tsx] — 현재 직원 CRUD UI
- [Source: packages/server/src/routes/admin/users.ts] — 현재 직원 API
- [Source: PRD FR-1.3] — 직원 계정 CRUD, 5분 이내 세팅

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- 회사 선택 드롭다운 + Zustand admin-store 구현
- 비밀번호 초기화 API + UI 모달 구현
- 회사 삭제 보호 (소속 직원 확인)
- 토스트 알림 시스템 구현
- 코드리뷰: reset-password companyId 격리 추가, companies 토스트 추가

### File List
- packages/admin/src/stores/admin-store.ts — 회사 선택 상태
- packages/admin/src/components/layout.tsx — 회사 선택 드롭다운
- packages/admin/src/pages/companies.tsx — 삭제 버튼 + 보호 + 토스트
- packages/admin/src/pages/users.tsx — 비밀번호 초기화 버튼
- packages/server/src/routes/admin/users.ts — reset-password 라우트 + companyId 격리
- packages/server/src/routes/admin/companies.ts — 삭제 보호 로직
