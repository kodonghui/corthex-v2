# Story 2.8: Admin Console UI Integration & Tests

Status: ready-for-dev

## Story

As a 관리자,
I want 관리자 콘솔이 일관성 있고 안정적으로 동작하기를,
so that 모든 관리 작업을 신뢰할 수 있다.

## Acceptance Criteria

1. **Given** 대시보드 **When** 로딩 **Then** 선택된 회사 기준 통계 표시 (직원 수/부서 수/에이전트 수/온라인 수)
2. **Given** 모든 관리 페이지 **When** API 에러 발생 **Then** 한국어 에러 메시지 표시 (영어 X)
3. **Given** 모든 관리 페이지 **When** 생성/수정/삭제 성공 **Then** 일관된 토스트 알림
4. **Given** 관리자 콘솔 **When** 빌드 **Then** 타입 체크 0 에러 + 기존 테스트 전체 통과
5. **Given** Epic 2 전체 기능 **When** 통합 테스트 실행 **Then** admin CRUD + auth + 세션 종료 테스트 전체 통과
6. **Given** 사이드바 **When** 현재 페이지 **Then** 해당 메뉴 하이라이트

## Tasks / Subtasks

- [ ] Task 1: 토스트 시스템 구현 (AC: #3)
  - [ ] 간단한 토스트 컴포넌트 (성공/에러/정보, 3초 자동 닫힘)
  - [ ] Zustand store: `useToastStore` (addToast, removeToast)
  - [ ] Layout에 토스트 컨테이너 렌더링
- [ ] Task 2: 대시보드 회사 선택 연동 (AC: #1)
  - [ ] admin-store의 selectedCompanyId 기준 데이터 표시
  - [ ] 회사 미선택 시 "회사를 선택하세요" 안내
- [ ] Task 3: 에러 메시지 한국어화 (AC: #2)
  - [ ] 서버 에러 코드(AUTH_001, USER_001 등) → 한국어 매핑
  - [ ] api.ts에서 에러 응답 파싱 후 한국어 메시지 표시
- [ ] Task 4: 사이드바 활성 메뉴 (AC: #6)
  - [ ] `useLocation` 기반 현재 경로 → 해당 메뉴 하이라이트
  - [ ] 이미 있을 수 있음 — 확인 후 누락 시 추가
- [ ] Task 5: 통합 테스트 (AC: #4, #5)
  - [ ] `turbo build` + `turbo typecheck` 0 에러
  - [ ] admin-crud 테스트 보강: 회사/직원/부서/에이전트/도구/보고라인 전체 CRUD
  - [ ] auth 테스트: admin 로그인 + user JWT admin 접근 거부
  - [ ] 세션 종료 테스트 (2-7에서 만든 것 통합)
- [ ] Task 6: sprint-status 업데이트
  - [ ] 모든 2-x 스토리 + epic-2 상태를 done으로 변경

## Dev Notes

### 현재 코드베이스 상태

**이미 존재하는 것:**
- `packages/admin/src/pages/dashboard.tsx` — 통계 카드 4개 + 직원/에이전트 목록 (UI 완성)
- `packages/admin/src/components/sidebar.tsx` — 메뉴 네비게이션
- `packages/admin/src/components/layout.tsx` — 레이아웃 구조
- `packages/admin/src/lib/api.ts` — API 클라이언트 (401 리다이렉트 포함)
- 기존 테스트: tenant-isolation, auth, admin-crud 등

**수정/추가 필요:**

| 항목 | 현재 | 목표 |
|------|------|------|
| 토스트 | 없음 | 전역 토스트 시스템 |
| 대시보드 회사 | 첫 번째 회사 하드코딩 | store 연동 |
| 에러 메시지 | 영어 에러 코드 그대로 | 한국어 변환 |
| 사이드바 활성 | 확인 필요 | 현재 경로 하이라이트 |

### 토스트 store 패턴

```typescript
// packages/admin/src/stores/toast-store.ts
import { create } from 'zustand'

type Toast = {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

type ToastState = {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
```

### 에러 코드 한국어 매핑

```typescript
const errorMessages: Record<string, string> = {
  AUTH_001: '아이디 또는 비밀번호가 올바르지 않습니다',
  AUTH_002: '로그인이 만료되었습니다. 다시 로그인해주세요',
  AUTH_003: '관리자 권한이 필요합니다',
  USER_001: '직원을 찾을 수 없습니다',
  USER_002: '이미 존재하는 아이디입니다',
  TENANT_001: '접근 권한이 없습니다',
}
```

### 파일 변경 범위

```
packages/admin/src/stores/toast-store.ts       — 신규
packages/admin/src/components/toast.tsx         — 신규 (토스트 컴포넌트)
packages/admin/src/components/layout.tsx        — 토스트 컨테이너 + 회사 선택
packages/admin/src/pages/dashboard.tsx          — store 연동
packages/admin/src/lib/api.ts                  — 에러 한국어화
packages/admin/src/components/sidebar.tsx       — 활성 메뉴 확인
packages/server/src/__tests__/                 — 통합 테스트
_bmad-output/implementation-artifacts/sprint-status.yaml — epic-2 done
```

### References

- [Source: packages/admin/src/pages/dashboard.tsx] — 현재 대시보드
- [Source: packages/admin/src/lib/api.ts] — 에러 핸들링
- [Source: UX spec] — 관리자 콘솔 UI 스펙

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
