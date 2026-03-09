# Departments (부서 관리 — Admin) UX/UI 설명서

> 페이지: #08 departments
> 패키지: admin
> 경로: /admin/departments
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 AI 조직의 **부서를 생성, 수정, 삭제**하는 관리 페이지. 부서에 소속된 에이전트 수 확인, 삭제 시 영향 분석(cascade analysis) 제공.

**핵심 사용자 시나리오:**
- 새 부서 생성 (이름 + 설명)
- 기존 부서 이름/설명 인라인 수정
- 부서 삭제 전 영향 분석 확인 (소속 에이전트 수, 진행 중 작업, 비용 등)
- 삭제 방식 선택: 완료 대기(권장) vs 강제 종료

---

## 2. 현재 레이아웃 분석

### 데스크톱
```
┌─────────────────────────────────────────────────────┐
│ Header: "부서 관리"    {N}개 부서    [+ 새 부서]       │
├─────────────────────────────────────────────────────┤
│ [생성 폼 — showCreate 시]                            │
│  부서명 입력    설명 입력         [취소] [생성]         │
├─────────────────────────────────────────────────────┤
│ 테이블                                               │
│ | 부서명 | 설명 | 에이전트 | 상태 | 작업 |             │
│ | ...    | ...  | (N)     | 활성 | [수정][삭제]       │
└─────────────────────────────────────────────────────┘

[삭제 클릭 시 → 영향 분석 모달]
┌──────────────────────────────────────────────────┐
│ 부서 삭제 - {부서명}                     [X]       │
├──────────────────────────────────────────────────┤
│ 영향 분석:                                        │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                     │
│ │N명  │ │N건  │ │N건  │ │$X.XX│                    │
│ │에이전트│ │작업│ │학습│ │비용  │                    │
│ └────┘ └────┘ └────┘ └────┘                     │
│                                                  │
│ 에이전트 목록 (영향 받는)                           │
│                                                  │
│ 삭제 방식:                                        │
│ (●) 완료 대기 (권장)                               │
│ ( ) 강제 종료                                     │
│                                                  │
│ * 학습 기록 아카이브 보존                            │
│ * 비용 기록 영구 보존                              │
│                               [취소] [삭제 실행]   │
└──────────────────────────────────────────────────┘
```

---

## 3. 현재 문제점

1. **테이블 디자인**: agents.tsx와 동일한 기본 테이블 스타일
2. **인라인 편집**: 수정 시 테이블 행이 입력란으로 변하는데 시각적 전환이 미흡
3. **생성 폼**: 테이블 위에 인라인으로 나타나 페이지 레이아웃이 밀림
4. **Cascade 모달 정보 밀도**: 4개 숫자 카드가 작아서 한눈에 파악 어려움
5. **삭제 방식 라디오 버튼**: 기본 스타일, 시각적으로 선택 상태 구분 약함
6. **에이전트 수 뱃지**: 작은 원형 뱃지로 표시, 클릭해서 에이전트 목록 볼 수 없음
7. **빈 상태**: 기본 텍스트 + 버튼
8. **부서 색상/아이콘 없음**: 모든 부서가 동일한 시각적 표현

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 깔끔한 관리자 패널 (조직 관리 도구 느낌)

### 4.2 레이아웃 개선
- **테이블/카드**: 부서별 색상 또는 아이콘으로 시각적 구분
- **Cascade 모달**: 더 넓고 명확한 영향 분석 표시
- **인라인 편집**: 더 명확한 편집 모드 전환

### 4.3 인터랙션 개선
- 부서 카드에서 바로 소속 에이전트 목록 프리뷰
- 삭제 방식 선택 시 결과 미리보기 강화
- **인라인 편집 전환 규칙**: 편집 중 다른 행의 편집 클릭 시, 현재 편집을 자동 취소하고 새 행으로 전환 (저장 확인 다이얼로그 없음 -- 경량 인라인 편집이므로)

### 4.4 상태 UI 정의
- **로딩 상태**: 테이블 영역에 skeleton 행 3~5개 표시 (shimmer 애니메이션)
- **에러 상태**: 테이블 영역에 에러 메시지 + 재시도 버튼 표시
- **생성 폼**: Banana2가 모달 또는 인라인 중 결정 (현재 인라인의 레이아웃 밀림 문제 해결 필요)

### 4.5 부서 색상/아이콘
- UI-only 시각 장식 (DB에 저장하지 않음)
- 부서 인덱스 순서대로 사전 정의된 색상 팔레트에서 할당
- API 변경 없음

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | DepartmentsPage | 전체 레이아웃 + 테이블 스타일 | pages/departments.tsx |
| 2 | CascadeAnalysisModal | 영향 분석 모달 추출 + 스타일 개선 | components/cascade-analysis-modal.tsx |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| depts | useQuery → /admin/departments?companyId=X | 부서 목록 |
| allAgents | useQuery → /admin/agents?companyId=X | 에이전트 수 계산 |
| cascadeData | api.get → /admin/departments/:id/cascade-analysis | 삭제 영향 분석 |
| showCreate | useState | 생성 폼 토글 |
| editId | useState | 인라인 편집 중인 부서 |
| cascadeTarget | useState | 삭제 대상 부서 |
| cascadeMode | useState ('wait_completion' or 'force') | 삭제 방식 |

**API 엔드포인트 (변경 없음):**
- `GET /api/admin/departments?companyId=X` — 부서 목록
- `POST /api/admin/departments` — 부서 생성
- `PATCH /api/admin/departments/:id` — 부서 수정
- `DELETE /api/admin/departments/:id?mode=X` — 부서 삭제
- `GET /api/admin/departments/:id/cascade-analysis` — 영향 분석

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 활성 부서 | 초록 뱃지 |
| 비활성 부서 | 회색 뱃지 |
| 편집 모드 | 인디고 배경 하이라이트 |
| 삭제 경고 | 빨강 계열 |
| 완료 대기 선택 | 인디고 보더 |
| 강제 종료 선택 | 빨강 보더 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 전체 테이블 |
| **768px~1439px** (Tablet) | 테이블 (설명 컬럼 숨김) |
| **~375px** (Mobile) | 카드 리스트 |

---

## 9. 기존 기능 참고사항

v2 핵심 방향: "관리자가 부서를 자유롭게 생성-수정-삭제"

- [x] 부서 CRUD
- [x] 부서별 에이전트 수 표시
- [x] 인라인 편집 (이름, 설명)
- [x] Cascade 삭제 분석 (에이전트 수, 작업, 학습, 비용)
- [x] 삭제 방식 선택 (wait_completion / force)
- [x] 에이전트 브레이크다운 (영향 받는 에이전트 목록)

**UI 변경 시 절대 건드리면 안 되는 것:**
- createMutation, updateMutation, deleteMutation 로직
- openCascadeModal cascade-analysis API 호출
- cascadeMode 기반 삭제 방식 전달
- selectedCompanyId 기반 필터링

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — admin panel for managing an AI agent organization.

This page: A department management page where the admin creates, edits, and deletes departments. Each department groups AI agents together. Deleting a department requires impact analysis showing how many agents, tasks, and costs will be affected.

User workflow:
1. Admin sees a list/table of departments with name, description, agent count, and status
2. Clicks "+ New Department" to create (name + description)
3. Clicks "Edit" on a row to inline-edit the name and description
4. Clicks "Delete" to open a cascade analysis modal showing: affected agent count, active tasks, knowledge records, and accumulated costs, plus agent breakdown list
5. Chooses deletion mode: "Wait for completion" (recommended) or "Force terminate"

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — "Department Management", department count, "+ New Department" button.
2. Department table — columns: Name, Description, Agent Count (as badge), Status (active/inactive badge), Actions (edit, delete).
3. Inline editing — when editing, the row transforms to show input fields with save/cancel buttons. Highlighted background to indicate edit mode.
4. Create form — expandable form above table, or modal. Fields: name (required), description (optional).
5. Cascade analysis modal — opened when deleting. Shows: 4 impact summary cards (agents, active tasks, knowledge records, cost). Agent breakdown list. Deletion mode selector (radio buttons with descriptions). Confirmation info. Cancel/Delete buttons.
6. Empty state — when no departments exist (icon + message + "Create your first department" CTA button).
7. Loading state — skeleton placeholder rows (3-5 shimmer rows) while data loads.
8. Error state — centered error message with retry button when API call fails.
9. Department color indicators — each department row has a small colored dot or left border stripe, cycling through a fixed palette by index (purely decorative, no data stored).

Design tone — YOU DECIDE:
- Admin management panel, clean and professional.
- The cascade analysis modal is the most complex part — it needs to clearly communicate the impact of deletion.
- Light or dark theme — your choice.

Design priorities:
1. The department list must be scannable.
2. The cascade modal must clearly communicate risk before deletion.
3. Inline editing should feel seamless.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

### 모바일 버전
```
Mobile version (375x812) of the same department management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Mobile-specific:
- Departments as cards instead of table
- Create form as full-screen modal
- Cascade modal: full-screen with scrollable content
- Inline editing: expand card into edit mode

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `departments-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `departments-header` | 페이지 헤더 | 제목 + 카운트 |
| `departments-create-btn` | 새 부서 버튼 | 생성 폼 열기 |
| `departments-create-form` | 생성 폼 | 폼 영역 |
| `departments-table` | 부서 테이블 | 목록 표시 |
| `departments-row` | 테이블 행 | 개별 부서 |
| `departments-edit-btn` | 수정 버튼 | 인라인 편집 시작 |
| `departments-edit-save` | 저장 버튼 (편집) | 수정 저장 |
| `departments-edit-cancel` | 취소 버튼 (편집) | 편집 취소 |
| `departments-delete-btn` | 삭제 버튼 | Cascade 모달 열기 |
| `departments-cascade-modal` | Cascade 모달 | 영향 분석 |
| `departments-cascade-agents` | 영향 에이전트 수 | 카드 확인 |
| `departments-cascade-tasks` | 진행 중 작업 | 카드 확인 |
| `departments-cascade-mode` | 삭제 방식 선택 | 라디오 버튼 |
| `departments-cascade-delete` | 삭제 실행 버튼 | 최종 삭제 |
| `departments-agent-count` | 에이전트 수 뱃지 | 부서별 에이전트 |
| `departments-empty-state` | 빈 상태 | 부서 없을 때 |
| `departments-loading` | 로딩 skeleton | 데이터 로드 중 |
| `departments-error` | 에러 상태 | API 실패 시 |
| `departments-cascade-knowledge` | 학습 기록 카드 | 영향 분석 학습 수 |
| `departments-cascade-cost` | 비용 카드 | 영향 분석 비용 |
| `departments-create-name` | 부서명 입력 필드 | 생성 폼 이름 입력 |
| `departments-create-desc` | 설명 입력 필드 | 생성 폼 설명 입력 |
| `departments-create-submit` | 생성 버튼 | 생성 폼 제출 |
| `departments-create-cancel` | 취소 버튼 | 생성 폼 취소 |
| `departments-cascade-cancel` | 취소 버튼 (모달) | cascade 모달 닫기 |
| `departments-edit-name` | 이름 입력 필드 (편집) | 인라인 편집 이름 입력 |
| `departments-edit-desc` | 설명 입력 필드 (편집) | 인라인 편집 설명 입력 |
| `departments-retry-btn` | 재시도 버튼 | 에러 상태에서 재로드 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/departments 접속 | `departments-page` 존재 |
| 2 | 부서 목록 | 로드 완료 | 테이블 행 표시 |
| 3 | 부서 생성 | + 클릭 → 이름 입력 → 생성 | 목록에 추가 |
| 4 | 인라인 편집 | 수정 클릭 → 이름 변경 → 저장 | 이름 업데이트 |
| 5 | 삭제 모달 | 삭제 클릭 | `departments-cascade-modal` 표시 |
| 6 | 영향 분석 | 모달 열림 | 에이전트 수, 작업 수 표시 |
| 7 | 삭제 실행 | 모드 선택 → 삭제 실행 | 부서 삭제됨 |
| 8 | 반응형 | 375px 뷰포트 | 카드 레이아웃 |
| 9 | 빈 이름 생성 | + 클릭 -> 이름 비우고 생성 클릭 | validation 에러 또는 버튼 비활성화 |
| 10 | 편집 취소 | 수정 클릭 -> 이름 변경 -> 취소 | 원래 값 복원 |
| 11 | 로딩 상태 | 느린 네트워크 시뮬레이션 | `departments-loading` skeleton 표시 |
| 12 | 에러 상태 | API 에러 시뮬레이션 | `departments-error` 에러 메시지 표시 |
| 13 | 중복 부서명 | 기존 부서명과 동일한 이름으로 생성 | 에러 토스트 또는 validation 메시지 |
| 14 | cascade 모달 닫기 | cascade 모달에서 취소 클릭 | 모달 닫힘, 부서 유지 |
