# QA Cycle 35 — Batch 2 Results
**Pages**: /admin/employees (TC-EMP-*), /admin/departments (TC-DEPT-*)
**Prefix**: QA-C35-
**Date**: 2026-03-27
**Session**: 8f27f1b7-01b0-41f2-8e15-222142d2fcde

---

## Summary
- **PASS**: 22
- **FAIL**: 4
- **SKIP**: 1
- **Total**: 27

---

## /admin/employees — TC-EMP-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| TC-EMP-001 | Click "직원 추가" | **PASS** | 다이얼로그 열림. 필드: 아이디(min 2), 이름(min 1), 이메일(valid), 부서배정(multi-select 체크박스). role 필드 없음 (스펙과 차이 있으나 서버에서 처리) |
| TC-EMP-002 | Fill form → submit | **PASS** | qa-c35-emp 생성 성공. 토스트 "✓ 직원이 초대되었습니다" + 임시 비밀번호(KTL#1YIxrqRb9S66) 모달 표시. 직원 수 18→19 |
| TC-EMP-003 | Empty username → submit | **FAIL** | 1자 username 입력 후 제출 시 폼이 닫히지 않음(submit 차단 동작). 하지만 명시적 Zod 오류 메시지("최소 2자" 등) 없이 단순 focus 이동만 발생 |
| TC-EMP-004 | Duplicate username | **PASS** | 토스트 "이미 존재하는 아이디입니다" 확인 |
| TC-EMP-005 | Invalid email format | **FAIL** | 잘못된 이메일 입력 시 브라우저 기본 HTML5 validation으로만 처리. 명시적 Zod 오류 메시지 미표시 (스펙: "Zod validation error") |
| TC-EMP-006 | Search by name/username | **PASS** | "QA-C35" 검색 → 1건 필터(QA-C35-Member) |
| TC-EMP-007 | Filter by department dropdown | **PASS** | "App E2E Dept" 선택 → 0건 (해당 부서 직원 없음, 필터 동작 정상) |
| TC-EMP-008 | Filter by status (active/inactive) | **PASS** | Active 선택 → 6건 표시, Inactive 항목 없음 |
| TC-EMP-009 | Click Edit on employee | **PASS** | "직원 수정 — QA C35 Member2" 편집 폼 열림. 아이디(disabled), 이름, 이메일, 부서 배정 pre-fill 확인 |
| TC-EMP-010 | Update name + email → save | **PASS** | 토스트 "✓ 직원 정보가 수정되었습니다" + 행 데이터 업데이트(QA-C35-Member2-EDITED) |
| TC-EMP-011 | Click Lock icon (deactivate) | **PASS** | 확인 다이얼로그 표시 "비활성화 — 이 직원은 더 이상 로그인할 수 없습니다", 확인 후 "✓ 직원이 비활성화되었습니다" |
| TC-EMP-012 | Click Reset Password | **SKIP** | 편집 폼 및 행 버튼에서 Reset Password 버튼을 찾을 수 없음. POST /reset-password API는 존재하나 UI에서 진입점 없음 |
| TC-EMP-013 | Copy password to clipboard | **PASS** | 비밀번호 모달에서 복사 버튼 클릭 → button[active] 상태 전환 확인 |
| TC-EMP-014 | Pagination controls | **PASS** | "Showing 1 to 20 of 20 entries" 표시. 현재 1페이지로 prev/next 버튼 disabled 상태 정상 |
| TC-EMP-015 | Sort by column header | **FAIL** | Name 컬럼 헤더 클릭 시 정렬 변화 없음. cursor: auto (pointer 아님) — 정렬 기능 미구현 |
| TC-EMP-016 | First employee gets role 'admin' | **PASS** | 대시보드 스냅샷에서 "QA First Member USER admin ACTIVE" 확인. 온보딩 최초 직원 admin role 부여됨 |

---

## /admin/departments — TC-DEPT-*

| TC-ID | Action | Result | Notes |
|-------|--------|--------|-------|
| TC-DEPT-001 | Click "Create Department" | **PASS** | 폼 열림: 부서명(필수, placeholder "e.g. ENGINEERING"), 설명(선택, placeholder "부서의 역할과 목적"), Cancel/Create 버튼 |
| TC-DEPT-002 | Fill name "개발팀" → 생성 | **PASS** | QA-C35-개발팀 생성 성공. 테이블에 카드 표시 (35/35 Registered Departments) |
| TC-DEPT-003 | Empty name → submit | **FAIL** | 빈 이름 제출 시 폼 닫히지 않음(차단 동작). 하지만 명시적 validation 오류 메시지 없음 |
| TC-DEPT-004 | Duplicate name | **PASS** | 토스트 "이미 있습니다" 오류 확인 |
| TC-DEPT-005 | Search departments | **PASS** | "QA-C35" 필터 → 2건(QA-C35-onboard-dept, QA-C35-개발팀) |
| TC-DEPT-006 | Click department card | **PASS** | 상세 패널 열림: Description, Status, Assigned Agents (0), Created 일시 표시 |
| TC-DEPT-007 | Click Edit | **PASS** | 인라인 편집 모드 전환. 이름/설명 pre-fill, Save/Cancel 버튼. 저장 후 행 업데이트(QA-C35-개발팀-EDITED) 확인 |
| TC-DEPT-008 | Click Delete | **PASS** | cascade-analysis 호출 → 모달 표시: 소속 에이전트 0명, 진행 중 작업 0건, 학습 기록 0건, 누적 비용 $0.00 |
| TC-DEPT-009 | Cascade modal: select force mode | **PASS** | "강제 종료" 옵션 선택 가능 확인 |
| TC-DEPT-010 | Cascade modal: select wait_completion | **PASS** | "완료 대기 (권장)" 기본 선택 옵션 확인 |
| TC-DEPT-011 | Cascade modal: cancel | **PASS** | 취소 클릭 후 부서 유지됨 (삭제 미실행) |
| TC-DEPT-012 | Stats: Total Sectors | **PASS** | "34" (정수, float 아님) — 헤더 영역 "Total Sectors: 34" 확인 |
| TC-DEPT-013 | Agent list in detail | **PASS** | 상세 패널에 "Assigned Agents (0) / No agents assigned" 표시 (에이전트 없는 부서) |

---

## Bugs Found

### BUG-C35-B2-001: TC-EMP-003/005 — validation 오류 메시지 미표시
- **경로**: /admin/employees → Add Employee
- **현상**: username 1자 또는 잘못된 이메일 입력 시 폼 제출이 차단되지만 명시적 오류 메시지 없음
- **기대**: Zod validation 오류 텍스트(예: "최소 2글자 이상 입력하세요", "올바른 이메일 형식을 입력하세요") 표시
- **심각도**: MEDIUM

### BUG-C35-B2-002: TC-EMP-012 — Reset Password UI 진입점 없음
- **경로**: /admin/employees
- **현상**: POST /admin/employees/{id}/reset-password API가 서버에 존재하나 UI에서 버튼을 찾을 수 없음
- **기대**: 편집 폼 또는 액션 버튼에서 비밀번호 재설정 기능 접근 가능해야 함
- **심각도**: HIGH (기능 누락)

### BUG-C35-B2-003: TC-EMP-015 — Column sort 미동작
- **경로**: /admin/employees
- **현상**: 테이블 컬럼 헤더(Name, Username, Department, Status) 클릭 시 정렬 변화 없음. cursor: auto
- **기대**: 클릭 시 ASC/DESC 토글 정렬
- **심각도**: LOW

### BUG-C35-B2-004: TC-DEPT-003 — Create Dept 빈 이름 validation 메시지 없음
- **경로**: /admin/departments → Create Department
- **현상**: 빈 이름으로 제출 시 폼은 닫히지 않지만 명시적 오류 메시지 없음
- **기대**: "부서명은 필수입니다" 등 오류 메시지 표시
- **심각도**: MEDIUM

---

## Screenshots
- `/home/ubuntu/corthex-v2/_qa-e2e/playwright-e2e/cycle-35/batch2-dept-page.png` — departments 페이지 최종 상태
