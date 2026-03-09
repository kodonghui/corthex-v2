# Users UX/UI 설명서

> 페이지: #21 users
> 패키지: admin
> 경로: /admin/users
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 시스템 **사용자(User) 계정을 생성, 편집, 비활성화, 비밀번호 초기화**하는 페이지. 부서별 필터로 특정 부서 소속 사용자만 조회 가능. 여기서 "사용자"는 CORTHEX 플랫폼에 로그인하는 인간 직원을 의미.

**핵심 사용자 시나리오:**
- 관리자가 새 직원 계정 생성 (아이디, 비밀번호, 이름, 이메일, 역할)
- 기존 직원 정보 인라인 수정 (이름, 이메일, 역할)
- 퇴사/휴직 직원 비활성화 (ConfirmDialog)
- 비밀번호 분실 시 초기화 (ConfirmDialog)
- 부서별 필터링으로 특정 부서 직원만 조회

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────────┐
│  "직원 관리"                                             │
│  N명의 직원                              [+ 직원 추가]   │
├─────────────────────────────────────────────────────────┤
│  [전체] [마케팅부] [기술부] [법무부] ...  ← 부서 필터     │
├─────────────────────────────────────────────────────────┤
│  ┌─ 생성 폼 (showCreate일 때만) ─────────────────────┐  │
│  │ "새 직원 등록"                                     │  │
│  │ [아이디] [비밀번호] [이름] [이메일] [역할▾]         │  │
│  │                                   [취소] [생성]    │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─ 직원 테이블 ────────────────────────────────────┐   │
│  │ 이름 | 아이디 | 이메일 | 역할 | 상태 | 관리       │   │
│  │ 홍길동 @hong  hong@..  직원   활성   [수정][PW][비활]│   │
│  │ (수정 모드: 인라인 input으로 전환)                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [비활성화 ConfirmDialog]                                │
│  [비밀번호 초기화 ConfirmDialog]                          │
└─────────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "직원 관리"          │
│ N명            [+]  │
├─────────────────────┤
│ [전체][마케팅][기술] │
│ ← 가로스크롤 필터    │
├─────────────────────┤
│ ┌─ 생성 폼 ──────┐ │
│ │ 2x2 그리드 폼   │ │
│ └─────────────────┘ │
│ ┌─ 테이블 ────────┐ │
│ │ 가로스크롤       │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **인라인 편집 UX 불편**: 테이블 셀이 갑자기 input으로 바뀌는 방식이라 어떤 행이 편집 중인지 시각적 구분 약함
2. **생성 폼 위치**: 페이지 중간에 인라인으로 나타나서 테이블이 아래로 밀림 -- 모달이 더 자연스러움
3. **부서 매핑 간접적**: users 테이블에 부서 정보가 없어 agents 테이블을 통해 간접 매핑 -- 필터 결과가 직관적이지 않을 수 있음
4. **비활성 사용자 재활성화 불가**: 비활성화만 있고 재활성화 기능이 없음
5. **페이지네이션 없음**: 전체 사용자를 한번에 로드 -- 사용자 수 증가 시 성능 문제
6. **검색 기능 없음**: 이름/아이디로 검색하는 기능이 없음
7. **역할 표시 불일치**: 코드에서 role은 'user'/'admin'이지만 화면에는 '직원'/'관리자'로 표시
8. **비밀번호 초기화 결과 불명확**: 초기화 후 새 비밀번호가 무엇인지 표시하지 않음 (토스트만)
9. **생성 폼 validation 약함**: 아이디 중복, 비밀번호 강도 등 클라이언트 검증 없음
10. **SkeletonTable 사용**: @corthex/ui의 SkeletonTable을 사용하고 있어 커스텀 skeleton 불필요

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2가 결정** -- 관리자 도구답게 깔끔하고 기능적인 느낌
- 역할별 색상 코드 유지: admin(indigo), user(zinc)
- 상태별 색상 유지: 활성(green), 비활성(red)

### 4.2 레이아웃 개선
- **생성 폼 모달화**: 인라인 대신 모달로 변경하여 테이블 레이아웃 유지
- **편집 모달화**: 인라인 수정 대신 클릭 시 모달로 편집
- **검색 추가**: 이름/아이디 텍스트 검색
- **비밀번호 표시 모달**: 초기화 후 임시 비밀번호를 모달에 표시 + 복사 버튼

### 4.3 인터랙션 개선
- 비활성 사용자 재활성화 기능 추가
- 생성 폼에 클라이언트 validation 강화
- 테이블 소팅 (이름, 생성일 기준)

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | UsersPage | 검색 추가, 레이아웃 정리 | pages/users.tsx |
| 2 | DepartmentFilter | 부서 필터 pill 디자인 | pages/users.tsx (내부) |
| 3 | UserTable | 테이블 디자인, 인라인 편집 -> 모달 편집 검토 | pages/users.tsx (내부) |
| 4 | CreateUserForm | 생성 폼 (인라인 or 모달) | pages/users.tsx (내부) |
| 5 | ConfirmDialog | 비활성화/비밀번호 초기화 확인 (@corthex/ui) | @corthex/ui |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| users | useQuery → GET /admin/users?companyId={id} | 사용자 목록 |
| departments | useQuery → GET /admin/departments?companyId={id} | 부서 목록 (필터용) |
| agents | useQuery → GET /admin/agents?companyId={id} | 사용자-부서 매핑용 |
| deptFilter | useState | 현재 선택된 부서 필터 |
| selectedCompanyId | useAdminStore | 회사 필터 |

**API 엔드포인트 (변경 없음):**
- `GET /admin/users?companyId={id}` -- 사용자 목록 조회
- `POST /admin/users` -- 사용자 생성
- `PATCH /admin/users/{id}` -- 사용자 수정
- `DELETE /admin/users/{id}` -- 사용자 비활성화
- `POST /admin/users/{id}/reset-password` -- 비밀번호 초기화
- `GET /admin/departments?companyId={id}` -- 부서 목록
- `GET /admin/agents?companyId={id}` -- 에이전트 목록 (부서 매핑)

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 관리자 역할 뱃지 | 인디고 | bg-indigo-100 text-indigo-700 / dark:bg-indigo-900/30 dark:text-indigo-300 |
| 직원 역할 뱃지 | 징크 | bg-zinc-100 text-zinc-600 / dark:bg-zinc-800 dark:text-zinc-400 |
| 활성 상태 | 그린 | bg-green-100 text-green-700 / dark:bg-green-900/30 dark:text-green-300 |
| 비활성 상태 | 레드 | bg-red-100 text-red-700 / dark:bg-red-900/30 dark:text-red-300 |
| 수정 버튼 | 인디고 | text-indigo-600 hover:text-indigo-700 |
| PW 초기화 버튼 | 앰버 | text-amber-600 hover:text-amber-700 |
| 비활성화 버튼 | 레드 | text-red-600 hover:text-red-700 |
| 생성 버튼 | 인디고 | bg-indigo-600 text-white hover:bg-indigo-700 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 테이블 전체 컬럼 표시, 생성 폼 2컬럼 그리드 |
| **768px~1439px** (Tablet) | 테이블 유지, 일부 컬럼 축소 |
| **~375px** (Mobile) | 테이블 가로 스크롤, 부서 필터 가로 스크롤, 생성 폼 1컬럼 |

**모바일 특별 처리:**
- 부서 필터: 가로 스크롤 pill 바
- 테이블: 가로 스크롤 + 이름 컬럼 sticky left
- 생성 폼: 1컬럼 세로 레이아웃 (2x2 그리드 -> 1x4 스택)
- 관리 버튼: 더보기(...) 메뉴로 통합 검토
- ConfirmDialog: 풀폭 모달

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 23번 항목(v2 추가 기능)에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 사용자 계정 CRUD (생성, 조회, 수정, 비활성화)
- [x] 역할 관리 (user/admin)
- [x] 비밀번호 초기화
- [x] 부서별 필터링
- [x] 멀티테넌시 (companyId 격리)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get/post/patch/delete` 호출 로직
- createMutation, updateMutation, deactivateMutation, resetPasswordMutation 로직
- User, Department, Agent 타입 정의
- userDeptMap 매핑 로직
- ConfirmDialog 호출 패턴

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages human user accounts that can log into the platform.

This page: User management — the admin creates, edits, deactivates, and resets passwords for employee accounts. Users can be filtered by department.

User workflow:
1. Admin sees a list of all employees in a table format: Name, Username (@handle), Email, Role (admin/employee badge), Status (active/inactive badge), and action buttons.
2. Admin can filter by department using pill-shaped buttons at the top (All, Marketing, Engineering, Legal, etc.).
3. Admin clicks "+ Add Employee" to open a creation form with fields: Username, Password, Name, Email, Role dropdown.
4. Admin can inline-edit an employee's name, email, and role directly in the table row.
5. Admin can deactivate an employee (confirmation dialog required) or reset their password (confirmation dialog).

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — page title "User Management", subtitle "N employees", "+ Add Employee" primary button.
2. Department filter — pill-shaped buttons for each department plus "All". Active pill is highlighted.
3. User table — columns: Name, Username, Email, Role (badge), Status (badge), Actions. Hover row highlight. Clean borders.
4. Role badges — "Admin" (indigo) and "Employee" (gray).
5. Status badges — "Active" (green) and "Inactive" (red).
6. Action buttons per row — Edit (indigo text), Reset Password (amber text), Deactivate (red text).
7. Inline edit mode — when editing, table cells transform into input fields with Save/Cancel buttons.
8. Creation form — expandable card above the table with form fields in 2-column grid layout.
9. Confirmation dialogs — for deactivation and password reset actions.
10. Empty state — message when no employees exist or no employees match the department filter.
11. Loading skeleton — placeholder rows while data loads.

Design tone — YOU DECIDE:
- This is a standard user management admin page — think: Stripe Dashboard, Vercel Team Settings, or GitHub Organization Members.
- Clean, professional, functional.
- Role and status badges should be instantly recognizable.

Design priorities:
1. The table must be the focal point — scannable and sortable.
2. Action buttons must be clearly accessible but not dominate the row.
3. Department filter must be one-click accessible.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: an admin panel for managing human user accounts (employees) with department filtering.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Department filter as horizontal scrollable pills
2. Employee list as cards instead of table (Name, Username, Role badge, Status badge, action buttons)
3. "+ Add Employee" button (compact)
4. Creation form (single column layout)
5. Confirmation dialogs (full-width)
6. Loading / empty / error states

Design tone: Same as desktop — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Employee cards must show key info at a glance (name, role, status).
2. Action buttons must have adequate touch targets.
3. Department filter pills must be scrollable with one thumb.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `users-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `users-create-btn` | + 직원 추가 버튼 | 생성 폼 열기 |
| `users-dept-filter` | 부서 필터 컨테이너 | 필터 영역 |
| `users-dept-filter-all` | 전체 필터 | 전체 보기 |
| `users-dept-filter-item` | 개별 부서 필터 | 부서별 필터 |
| `users-create-form` | 생성 폼 | 새 직원 등록 폼 |
| `users-create-username` | 아이디 입력 | 아이디 필드 |
| `users-create-password` | 비밀번호 입력 | 비밀번호 필드 |
| `users-create-name` | 이름 입력 | 이름 필드 |
| `users-create-email` | 이메일 입력 | 이메일 필드 |
| `users-create-role` | 역할 선택 | 역할 드롭다운 |
| `users-create-submit` | 생성 버튼 | 폼 제출 |
| `users-create-cancel` | 취소 버튼 | 폼 닫기 |
| `users-table` | 직원 테이블 | 테이블 영역 |
| `users-row` | 직원 행 | 개별 직원 |
| `users-edit-btn` | 수정 버튼 | 인라인 편집 시작 |
| `users-edit-save` | 저장 버튼 | 편집 저장 |
| `users-edit-cancel` | 취소 버튼 | 편집 취소 |
| `users-reset-pw-btn` | 비밀번호 초기화 버튼 | PW 초기화 확인 다이얼로그 |
| `users-deactivate-btn` | 비활성화 버튼 | 비활성화 확인 다이얼로그 |
| `users-confirm-dialog` | 확인 다이얼로그 | 확인/취소 모달 |
| `users-role-badge` | 역할 뱃지 | 관리자/직원 표시 |
| `users-status-badge` | 상태 뱃지 | 활성/비활성 표시 |
| `users-search-input` | 검색 입력 | 이름/아이디 검색 |
| `users-reactivate-btn` | 재활성화 버튼 | 비활성 사용자 재활성화 |
| `users-password-modal` | 임시 비밀번호 모달 | 초기화 후 임시 PW 표시 |
| `users-password-copy` | 비밀번호 복사 버튼 | 임시 PW 클립보드 복사 |
| `users-empty-state` | 빈 상태 | 직원 없을 때 |
| `users-loading` | 로딩 상태 | 데이터 로딩 중 |
| `users-error-state` | 에러 상태 | API 실패 시 에러 메시지 + 재시도 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/users 접속 | `users-page` 존재, 테이블 표시 |
| 2 | 부서 필터 | 특정 부서 클릭 | 해당 부서 직원만 표시 |
| 3 | 전체 필터 | 전체 버튼 클릭 | 모든 직원 표시 |
| 4 | 생성 폼 열기 | + 직원 추가 클릭 | `users-create-form` 표시 |
| 5 | 직원 생성 | 폼 입력 후 생성 클릭 | 성공 토스트, 테이블에 추가 |
| 6 | 생성 취소 | 취소 버튼 클릭 | 폼 닫힘 |
| 7 | 인라인 편집 시작 | 수정 버튼 클릭 | 셀이 input으로 전환 |
| 8 | 인라인 편집 저장 | 값 변경 후 저장 | 성공 토스트, 값 업데이트 |
| 9 | 인라인 편집 취소 | 취소 클릭 | 원래 값 복원 |
| 10 | 비활성화 | 비활성화 클릭 -> 확인 | 성공 토스트, 상태 변경 |
| 11 | 비밀번호 초기화 | PW 초기화 클릭 -> 확인 | 성공 토스트 |
| 12 | 빈 상태 | 직원 없을 때 | `users-empty-state` 표시 |
| 13 | 역할 뱃지 표시 | 직원 행 확인 | 관리자=인디고, 직원=그레이 뱃지 |
| 14 | 상태 뱃지 표시 | 직원 행 확인 | 활성=그린, 비활성=레드 뱃지 |
| 15 | 반응형 필터 | 375px 뷰포트 | 부서 필터 가로 스크롤 |
| 16 | 필수 입력 검증 | 빈 폼 제출 시도 | HTML5 validation 또는 에러 메시지 |
| 17 | 이름/아이디 검색 | 검색어 입력 | 매칭 직원만 표시 |
| 18 | 에러 상태 | API 실패 시 | `users-error-state` 에러 메시지 표시 |
| 19 | 재활성화 | 비활성 사용자 재활성화 클릭 -> 확인 | 상태 뱃지 활성으로 변경 |
