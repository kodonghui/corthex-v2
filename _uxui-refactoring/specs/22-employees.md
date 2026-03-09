# Employees UX/UI 설명서

> 페이지: #22 employees
> 패키지: admin
> 경로: /admin/employees
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 조직의 **직원을 초대, 수정, 비활성화/재활성화, 비밀번호 초기화**하는 페이지. users 페이지와 달리 **페이지네이션, 검색, 부서 다중 배정, 임시 비밀번호 모달** 등 더 완성도 높은 직원 관리 기능을 제공.

**핵심 사용자 시나리오:**
- 관리자가 새 직원 초대 (아이디, 이름, 이메일, 부서 다중 배정) -> 임시 비밀번호 발급
- 이름/이메일 검색으로 특정 직원 찾기
- 부서별, 활성 상태별 필터 조합
- 직원 정보 수정 (이름, 이메일, 부서 배정 변경)
- 비활성화/재활성화 토글
- 비밀번호 초기화 -> 임시 비밀번호 모달에서 복사

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌─────────────────────────────────────────────────────────┐
│  "직원 관리"                                             │
│  N명의 직원                             [+ 직원 초대]    │
├─────────────────────────────────────────────────────────┤
│  [검색 input________]   [전체][활성][비활성] ← 상태 필터  │
│  [전체 부서] [마케팅] [기술] [법무] ...    ← 부서 필터     │
├─────────────────────────────────────────────────────────┤
│  ┌─ 직원 테이블 ────────────────────────────────────┐   │
│  │ 이름 | 아이디 | 이메일 | 부서(pill) | 상태 | 관리  │   │
│  │ 홍길동 @hong  hong@..  [마케팅]    활성   [수정]  │   │
│  │                                    [PW][비활성화] │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌─ 페이지네이션 ───────────────────────────────────┐   │
│  │ "N명 중 1-20명"          [이전] [1][2]...[N] [다음]│   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  [초대 모달] [수정 모달] [비밀번호 표시 모달]              │
│  [비활성화 ConfirmDialog] [재활성화 ConfirmDialog]         │
│  [PW 초기화 ConfirmDialog]                                │
└─────────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "직원 관리"     [+]  │
│ N명의 직원           │
├─────────────────────┤
│ [검색______]        │
│ [전체][활성][비활성]  │
│ [전체부서][마케팅]... │
├─────────────────────┤
│ ┌─ 테이블 ────────┐ │
│ │ 가로스크롤       │ │
│ └─────────────────┘ │
│ [이전][1][2][다음]   │
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **테이블 모바일 가독성**: 6개 컬럼이 가로 스크롤되면 터치로 행 탐색이 어려움
2. **모달 일관성 좋음**: 초대/수정이 모달 방식이라 사용성은 양호 (users 페이지의 인라인 편집보다 나음)
3. **부서 다중 배정 UI**: 체크박스 리스트가 max-h-40으로 스크롤되는데, 부서 수가 적으면 불필요한 공간 차지
4. **임시 비밀번호 모달**: 디자인은 좋지만 모달 바깥 클릭 시 닫히는데, 비밀번호를 복사하기 전에 실수로 닫을 위험
5. **검색 디바운스**: 300ms debounce가 있지만 검색 중임을 시각적으로 표시하지 않음
6. **필터 조합**: 상태 필터 + 부서 필터 + 검색이 동시에 작동하는데, 현재 적용된 필터가 무엇인지 한눈에 보기 어려움
7. **페이지네이션 ellipsis**: 페이지 수가 많을 때 1...5 6 7...20 형태로 표시하는데, 현재 페이지 위치 파악이 어려움
8. **수정 모달에서 아이디 비활성화**: 아이디 필드가 disabled인데 왜 보여주는지 불명확 (UX 낭비)
9. **빈 상태 CTA**: 부서 필터 적용 시 "선택한 부서에 배정된 직원이 없습니다"만 표시 -- "부서에 직원 배정하기" 같은 액션 없음
10. **에러 상태 미정의**: API 실패 시 토스트만 뜨고 화면 레벨 에러 UI가 없음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2가 결정** -- 현재 톤 유지 불필요
- 상태별 색상 코드 유지: 활성(green), 비활성(red)
- 부서 뱃지는 인디고 pill 스타일 유지

### 4.2 레이아웃 개선
- **테이블 -> 카드 뷰 옵션**: 모바일에서 카드 뷰 제공
- **필터 상태 표시**: 적용 중인 필터를 chip 형태로 상단에 요약 표시
- **검색 피드백**: 검색 중 로딩 인디케이터 + 결과 없음 상태

### 4.3 인터랙션 개선
- 임시 비밀번호 모달: 바깥 클릭으로 닫히지 않도록 (확인 버튼 필수)
- 수정 모달: 아이디 필드 제거 또는 정보 표시 전용 영역으로 분리
- 필터 초기화 버튼: 모든 필터를 한번에 리셋

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | EmployeesPage | 필터 상태 표시, 레이아웃 정리 | pages/employees.tsx |
| 2 | SearchInput | 검색 입력 + 디바운스 + 로딩 표시 | pages/employees.tsx (내부) |
| 3 | StatusFilter | 활성 상태 필터 pill | pages/employees.tsx (내부) |
| 4 | DepartmentFilter | 부서 필터 pill (가로 스크롤) | pages/employees.tsx (내부) |
| 5 | EmployeeTable | 테이블 디자인, 모바일 카드 뷰 | pages/employees.tsx (내부) |
| 6 | Pagination | 페이지네이션 컴포넌트 | pages/employees.tsx (내부) |
| 7 | InviteModal | 직원 초대 모달 | pages/employees.tsx (내부) |
| 8 | EditModal | 직원 수정 모달 | pages/employees.tsx (내부) |
| 9 | PasswordModal | 임시 비밀번호 표시 모달 | pages/employees.tsx (내부) |
| 10 | ConfirmDialog | 비활성화/재활성화/PW 초기화 확인 | @corthex/ui |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| employees | useQuery → GET /admin/employees?companyId=&page=&limit=20&search=&departmentId=&isActive= | 직원 목록 (페이지네이션) |
| departments | useQuery → GET /admin/departments?companyId={id} | 부서 목록 (필터 + 배정) |
| pagination | employees 응답 내 pagination 객체 | 페이지 정보 |
| search/debouncedSearch | useState + useRef (debounce 300ms) | 검색어 |
| departmentFilter | useState | 부서 필터 |
| activeFilter | useState | 활성 상태 필터 |
| page | useState | 현재 페이지 |
| selectedCompanyId | useAdminStore | 회사 필터 |

**API 엔드포인트 (변경 없음):**
- `GET /admin/employees?companyId=&page=&limit=&search=&departmentId=&isActive=` -- 직원 목록 (페이지네이션)
- `POST /admin/employees?companyId={id}` -- 직원 초대 (initialPassword 반환)
- `PUT /admin/employees/{id}?companyId={id}` -- 직원 수정
- `DELETE /admin/employees/{id}?companyId={id}` -- 직원 비활성화
- `POST /admin/employees/{id}/reactivate?companyId={id}` -- 직원 재활성화
- `POST /admin/employees/{id}/reset-password?companyId={id}` -- 비밀번호 초기화 (newPassword 반환)

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| 활성 상태 뱃지 | 그린 | bg-green-100 text-green-700 / dark:bg-green-900/30 dark:text-green-300 |
| 비활성 상태 뱃지 | 레드 | bg-red-100 text-red-700 / dark:bg-red-900/30 dark:text-red-300 |
| 부서 뱃지 | 인디고 | bg-indigo-100 text-indigo-700 / dark:bg-indigo-900/30 dark:text-indigo-300 |
| 미배정 텍스트 | 징크 | text-zinc-400 |
| 수정 버튼 | 인디고 | text-indigo-600 hover:text-indigo-700 |
| PW 초기화 버튼 | 앰버 | text-amber-600 hover:text-amber-700 |
| 비활성화 버튼 | 레드 | text-red-600 hover:text-red-700 |
| 재활성화 버튼 | 그린 | text-green-600 hover:text-green-700 |
| 초대 버튼 | 인디고 | bg-indigo-600 text-white hover:bg-indigo-700 |
| 활성 필터 pill (선택) | 인디고 | bg-indigo-600 text-white |
| 활성 필터 pill (미선택) | 보더 | bg-white border-zinc-200 text-zinc-700 |
| 검색 포커스 | 인디고 | focus:ring-indigo-500 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 테이블 6컬럼 전체 표시, 검색+필터 가로 배치 |
| **768px~1439px** (Tablet) | 테이블 유지, 이메일 컬럼 축소 가능 |
| **~375px** (Mobile) | 테이블 가로 스크롤 or 카드 뷰, 필터 세로 스택, 모달 풀폭 |

**모바일 특별 처리:**
- 검색 + 상태 필터: 세로 스택
- 부서 필터: 가로 스크롤 pill 바
- 테이블: 가로 스크롤 (이름 sticky left) 또는 카드 뷰로 전환
- 초대/수정 모달: 풀스크린 또는 풀폭
- 비밀번호 모달: 풀폭, 복사 버튼 크게
- 페이지네이션: 숫자 버튼 축소 (현재 +-1만 표시)

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 23번 항목(v2 추가 기능)에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 직원 초대 (아이디, 이름, 이메일, 부서 다중 배정)
- [x] 임시 비밀번호 자동 생성 + 모달 표시 + 복사 기능
- [x] 직원 정보 수정 (이름, 이메일, 부서 재배정)
- [x] 비활성화 + 재활성화 토글
- [x] 비밀번호 초기화 (새 임시 비밀번호 발급)
- [x] 검색 (이름/이메일 기반, 300ms debounce)
- [x] 부서별 필터 + 활성 상태 필터 조합
- [x] 서버사이드 페이지네이션 (limit 20)

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get/post/put/delete` 호출 로직
- createMutation (initialPassword 반환 로직)
- resetPasswordMutation (newPassword 반환 로직)
- Employee 타입 (departments 배열 포함)
- 페이지네이션 쿼리 파라미터 구조
- debounce 검색 로직 (searchTimerRef)

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages employee accounts — inviting new employees, editing their information, managing their department assignments, and handling account status.

This page: Employee management — a full-featured employee directory with search, filtering, pagination, invite workflow, and password management.

User workflow:
1. Admin sees a paginated table of employees with search bar and filters (active status + department).
2. Admin searches by name or email (instant search with debounce).
3. Admin filters by status (All / Active / Inactive) and by department (pill buttons).
4. Each employee row shows: Name, Username (@handle), Email, Department badges (multiple possible), Status badge (Active=green, Inactive=red), and action buttons.
5. Admin clicks "+ Invite Employee" — a modal opens with fields: Username, Name, Email, Department checkboxes. After submission, a temporary password modal appears with copy button.
6. Admin clicks "Edit" — a modal opens with editable fields (Name, Email, Department reassignment).
7. Admin can Deactivate (red) or Reactivate (green) an employee. Admin can Reset Password — which generates a new temporary password shown in a modal.
8. Pagination at the bottom shows "N of M employees", with Previous/Next and page number buttons.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — "Employee Management", subtitle "N employees", "+ Invite Employee" button.
2. Search bar — text input with placeholder "Search by name or email...".
3. Status filter — pill buttons: All, Active, Inactive.
4. Department filter — pill buttons for each department plus "All Departments".
5. Employee table — Name, Username, Email, Departments (colored pill badges, multiple possible), Status (badge), Actions.
6. Action buttons — Edit (indigo), Reset Password (amber), Deactivate (red) / Reactivate (green).
7. Pagination — "Showing 1-20 of N" + page buttons with ellipsis for large page counts.
8. Invite modal — form with Username, Name, Email fields + department checklist with checkboxes.
9. Edit modal — form with Name, Email + department checklist (Username shown but disabled).
10. Password display modal — shows generated temporary password with copy button. Important: cannot be dismissed by clicking outside.
11. Confirmation dialogs — for deactivate, reactivate, and password reset actions.
12. Empty state — "No employees found" with invite CTA when table is empty.
13. Loading skeleton — placeholder table rows.

Design tone — YOU DECIDE:
- Professional HR/employee management interface — think: Rippling, BambooHR, or Notion Team Settings.
- Clean table layout with good information hierarchy.
- Status and department badges should be scannable at a glance.
- Modals should feel polished and focused.

Design priorities:
1. Search + filter combination must feel fast and responsive.
2. The invite flow (form -> password modal) must feel smooth and guided.
3. Pagination must be clear about current position in the dataset.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: an admin panel for managing employees with search, filtering, pagination, invite workflow, and password management.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Search input (full width)
2. Status filter pills (horizontal)
3. Department filter pills (horizontal scrollable)
4. Employee list as cards (not table) — Name, Username, Department badges, Status, action buttons
5. Pagination (compact — previous/next + current page indicator)
6. Invite modal (full-screen or full-width)
7. Edit modal (full-screen or full-width)
8. Password modal with large copy button
9. Confirmation dialogs
10. Loading / empty / error states

Design tone: Same as desktop — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Search must be immediately accessible at the top.
2. Employee cards must show essential info without scrolling within the card.
3. Action buttons must have adequate touch targets (especially Deactivate/Reactivate).

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `employees-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `employees-invite-btn` | + 직원 초대 버튼 | 초대 모달 열기 |
| `employees-search-input` | 검색 입력 | 이름/이메일 검색 |
| `employees-status-filter` | 상태 필터 컨테이너 | 필터 영역 |
| `employees-status-all` | 전체 상태 필터 | 전체 보기 |
| `employees-status-active` | 활성 필터 | 활성만 보기 |
| `employees-status-inactive` | 비활성 필터 | 비활성만 보기 |
| `employees-dept-filter` | 부서 필터 컨테이너 | 부서 필터 영역 |
| `employees-dept-all` | 전체 부서 필터 | 전체 부서 |
| `employees-dept-item` | 개별 부서 필터 | 부서별 필터 |
| `employees-table` | 직원 테이블 | 테이블 영역 |
| `employees-row` | 직원 행 | 개별 직원 |
| `employees-dept-badge` | 부서 뱃지 | 부서 표시 |
| `employees-status-badge` | 상태 뱃지 | 활성/비활성 표시 |
| `employees-edit-btn` | 수정 버튼 | 수정 모달 열기 |
| `employees-reset-pw-btn` | PW 초기화 버튼 | PW 초기화 확인 |
| `employees-deactivate-btn` | 비활성화 버튼 | 비활성화 확인 |
| `employees-reactivate-btn` | 재활성화 버튼 | 재활성화 확인 |
| `employees-pagination` | 페이지네이션 | 페이지 이동 |
| `employees-page-prev` | 이전 버튼 | 이전 페이지 |
| `employees-page-next` | 다음 버튼 | 다음 페이지 |
| `employees-page-num` | 페이지 번호 버튼 | 특정 페이지 이동 |
| `employees-invite-modal` | 초대 모달 | 직원 초대 폼 |
| `employees-invite-username` | 아이디 입력 | 초대 폼 아이디 |
| `employees-invite-name` | 이름 입력 | 초대 폼 이름 |
| `employees-invite-email` | 이메일 입력 | 초대 폼 이메일 |
| `employees-invite-dept-check` | 부서 체크박스 | 부서 배정 |
| `employees-invite-submit` | 초대 버튼 | 폼 제출 |
| `employees-invite-cancel` | 취소 버튼 | 모달 닫기 |
| `employees-edit-modal` | 수정 모달 | 직원 수정 폼 |
| `employees-edit-submit` | 저장 버튼 | 수정 저장 |
| `employees-password-modal` | 비밀번호 모달 | 임시 PW 표시 |
| `employees-password-copy` | 복사 버튼 | PW 복사 |
| `employees-password-close` | 확인 버튼 | 모달 닫기 |
| `employees-confirm-dialog` | 확인 다이얼로그 | 확인/취소 모달 |
| `employees-edit-dept-check` | 수정 부서 체크박스 | 수정 모달 부서 재배정 |
| `employees-empty-state` | 빈 상태 | 직원 없을 때 |
| `employees-loading` | 로딩 상태 | 데이터 로딩 중 |
| `employees-error-state` | 에러 상태 | API 실패 시 에러 메시지 + 재시도 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/employees 접속 | `employees-page` 존재, 테이블 표시 |
| 2 | 검색 | 검색어 입력 | 300ms 후 필터된 결과 표시 |
| 3 | 검색 초기화 | 검색어 삭제 | 전체 목록 복원 |
| 4 | 상태 필터 - 활성 | 활성 버튼 클릭 | 활성 직원만 표시 |
| 5 | 상태 필터 - 비활성 | 비활성 버튼 클릭 | 비활성 직원만 표시 |
| 6 | 부서 필터 | 특정 부서 클릭 | 해당 부서 직원만 표시 |
| 7 | 필터 조합 | 상태 + 부서 동시 | 교차 필터 결과 표시 |
| 8 | 직원 초대 모달 열기 | + 직원 초대 클릭 | `employees-invite-modal` 표시 |
| 9 | 직원 초대 완료 | 폼 입력 후 초대 | 성공 토스트 + 비밀번호 모달 표시 |
| 10 | 임시 비밀번호 복사 | 복사 버튼 클릭 | 클립보드 복사 토스트 |
| 11 | 직원 수정 | 수정 클릭 -> 값 변경 -> 저장 | 성공 토스트, 값 업데이트 |
| 12 | 직원 비활성화 | 비활성화 클릭 -> 확인 | 상태 뱃지 변경 |
| 13 | 직원 재활성화 | 재활성화 클릭 -> 확인 | 상태 뱃지 변경 |
| 14 | 비밀번호 초기화 | PW 초기화 -> 확인 | 비밀번호 모달 표시 |
| 15 | 페이지네이션 - 다음 | 다음 버튼 클릭 | 2페이지 표시 |
| 16 | 페이지네이션 - 특정 | 페이지 번호 클릭 | 해당 페이지 표시 |
| 17 | 빈 상태 | 직원 없을 때 | `employees-empty-state` 표시 + CTA |
| 18 | 빈 상태 + 필터 | 부서 필터 결과 없을 때 | 필터 안내 메시지 |
| 19 | 부서 다중 배정 | 초대 시 2개 부서 체크 | 직원 행에 2개 부서 뱃지 |
| 20 | 반응형 | 375px 뷰포트 | 모달 풀폭, 필터 가로 스크롤 |
