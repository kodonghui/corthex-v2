# Agents (에이전트 관리 — Admin) UX/UI 설명서

> 페이지: #07 agents
> 패키지: admin
> 경로: /admin/agents
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 AI 에이전트(AI 직원)를 **생성, 편집, 비활성화**하는 관리 페이지. 에이전트별 계급(Manager/Specialist/Worker), LLM 모델, 소속 부서, Soul(성격) 설정.

**핵심 사용자 시나리오:**
- AI 직원 추가: 이름, 역할, 계급, 모델, 부서, Soul 설정
- 기존 에이전트 편집: 이름/역할/계급/모델/부서 변경
- Soul(성격) 마크다운 편집 + 실시간 미리보기
- 도구 권한 확인 (현재 읽기 전용)
- 에이전트 비활성화

---

## 2. 현재 레이아웃 분석

### 데스크톱
```
┌─────────────────────────────────────────────────────┐
│ Header: "에이전트 관리"   {N}개     [+ 새 AI 직원]   │
├─────────────────────────────────────────────────────┤
│ [검색] [부서▼] [계급▼] [상태▼]     ← 필터 바        │
├─────────────────────────────────────────────────────┤
│ 테이블                                               │
│ | 이름 | 계급 | 모델 | 부서 | 상태 | 작업 |           │
│ | ...  | ...  | ...  | ... | ...  | [편집][비활성화] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [편집 클릭 시 → 우측 슬라이드 패널]                    │
│ ┌──────────────────────────────────────────────────┐│
│ │ 에이전트명    [X]                                 ││
│ │ [기본 정보] [Soul 편집] [도구 권한]  ← 탭          ││
│ │                                                  ││
│ │ 기본 정보: 이름, 역할, 계급, 모델, 부서             ││
│ │ Soul: 에디터 + 미리보기 (2컬럼)                    ││
│ │ 도구: 현재 허용 도구 목록 (읽기 전용)               ││
│ └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## 3. 현재 문제점

1. **테이블 단조로움**: 기본 HTML 테이블, 시각적 매력 부족
2. **슬라이드 패널 UX**: 우측에서 슬라이드인 하는데 반투명 배경 클릭으로 닫힘, 실수로 닫기 쉬움
3. **Soul 편집**: 에디터와 미리보기가 나란히 있지만 높이가 작아(400px min) 긴 Soul 편집 불편
4. **생성 폼**: 인라인 폼이 테이블 위에 나타나는데 페이지가 밀려남
5. **시스템 에이전트 표시**: 시스템 에이전트 경고가 아이콘+텍스트로 분산
6. **필터 바 디자인**: select 요소가 기본 스타일
7. **비활성화 확인 모달**: 기본적인 모달, 영향 범위 정보 부족 (이 에이전트가 어떤 워크플로우/스케줄에 연결되어 있는지 미표시)
8. **빈 상태**: 에이전트가 없을 때 기본적인 안내
9. **에이전트 아바타 없음**: 텍스트만으로 에이전트 구분
10. **로딩/에러 상태**: 목록 로딩 중 skeleton UI 미정의, API 에러 시 재시도 UI 없음
11. **비서 에이전트 표시**: isSecretary 속성이 있으나 별도 시각적 표시 없음
12. **미저장 경고 없음**: Soul 편집 중 패널 닫기 시 미저장 변경 유실 위험

### 상태별 UI 정의

| 상태 | UI 표현 |
|------|---------|
| **목록 로딩 중** | 테이블 skeleton (행 3~5개 placeholder + 헤더) |
| **에이전트 상세 로딩** | 디테일 패널 skeleton |
| **저장 중** | 저장 버튼 spinner + 비활성화 |
| **저장 성공** | toast 성공 메시지 (2초 후 자동 닫힘) |
| **저장 실패** | toast 에러 메시지 + 재시도 링크 |
| **생성 중** | 생성 버튼 spinner + 비활성화 |
| **비활성화 처리 중** | 모달 확인 버튼 spinner + 비활성화 |
| **API 에러** | 에러 메시지 카드 + 재시도 버튼 |
| **빈 목록** | 환영 안내 + "+ 새 AI 직원" CTA |
| **검색 결과 없음** | "검색 결과가 없습니다" + 필터 초기화 링크 |
| **Soul 미저장 경고** | 패널 닫기 시 "저장하지 않은 변경이 있습니다" 확인 다이얼로그 |

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 관리자 패널 느낌 (Linear Admin, Vercel Dashboard 참고)
- 테이블 + 디테일 패널 패턴 유지하되 시각적 세련도 향상

### 4.2 레이아웃 개선
- **테이블**: 에이전트 아바타/뱃지 추가, 행 호버 강화
- **슬라이드 패널**: 탭 스타일 개선, Soul 편집 높이 확대
- **생성 폼**: 모달로 변경 검토 (페이지 밀림 방지)

### 4.3 인터랙션 개선
- Soul 템플릿 선택 UX 개선
- 필터 바 스타일 통일
- 로딩 상태: 테이블 skeleton (행 3~5개 placeholder)
- 에러 상태: 에러 메시지 + 재시도 버튼
- 비서 에이전트: 비서 뱃지 표시 (시스템 뱃지와 유사)

> **별도 Enhancement로 분리**: 에이전트 카드 뷰 옵션 (테이블 <-> 카드 전환) — 현재 범위는 테이블 스타일 개선에 집중

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | AgentsPage | 전체 레이아웃 + 테이블 스타일 | pages/agents.tsx |

(단일 파일에 모든 컴포넌트가 인라인으로 정의되어 있음)

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| agents | useQuery → /admin/agents?companyId=X | 에이전트 목록 |
| depts | useQuery → /admin/departments?companyId=X | 부서 목록 (필터/배정) |
| soulTemplates | useQuery → /admin/soul-templates?companyId=X | Soul 템플릿 |
| selectedAgent | useState | 편집 중인 에이전트 |
| filterDept/filterTier/filterStatus/search | useState | 필터 조건 |
| showCreate | useState | 생성 폼 토글 |
| detailTab | useState ('info'|'soul'|'tools') | 디테일 탭 |

**API 엔드포인트 (변경 없음):**
- `GET /api/admin/agents?companyId=X` — 에이전트 목록
- `POST /api/admin/agents` — 에이전트 생성
- `PATCH /api/admin/agents/:id` — 에이전트 수정
- `DELETE /api/admin/agents/:id` — 에이전트 비활성화
- `GET /api/admin/departments?companyId=X` — 부서 목록
- `GET /api/admin/soul-templates?companyId=X` — Soul 템플릿

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| online 상태 | 초록 뱃지 |
| working 상태 | 파랑 뱃지 |
| error 상태 | 빨강 뱃지 |
| offline 상태 | 회색 뱃지 |
| 시스템 에이전트 | 앰버 뱃지/아이콘 |
| 비활성 에이전트 | 회색 뱃지 |
| 비서 에이전트 | 보라 뱃지/아이콘 |
| Manager 계급 | 구분 색상 |
| Specialist 계급 | 구분 색상 |
| Worker 계급 | 구분 색상 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 전체 테이블 + 우측 디테일 패널 |
| **768px~1439px** (Tablet) | 테이블 (모델/부서 컬럼 숨김) + 모달 디테일 |
| **~375px** (Mobile) | 카드 리스트 + 풀스크린 디테일 (Soul 편집은 에디터/미리보기 세로 스택) |

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 2번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 에이전트 CRUD (생성/수정/비활성화)
- [x] 3계급 (Manager/Specialist/Worker) + 모델 배정
- [x] 부서 배정
- [x] Soul(성격) 편집 + 미리보기
- [x] Soul 템플릿 불러오기
- [x] 시스템 에이전트 보호 (삭제 불가)
- [x] 도구 허용 목록 확인
- [x] 필터 (부서/계급/상태/검색)
- [x] 비서 에이전트(isSecretary) 시각적 구분

**UI 변경 시 절대 건드리면 안 되는 것:**
- createMutation, updateMutation, deactivateMutation 로직
- selectedCompanyId 기반 필터링
- handleTierChange (계급 → 기본 모델 자동 매칭)
- renderMarkdown Soul 미리보기 함수
- 시스템 에이전트 isSystem 보호 로직
- isSecretary 비서 에이전트 판별 로직

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human user manages an organization of AI agents. This is the ADMIN panel where the administrator manages the AI workforce.

This page: An agent management page where the admin creates, configures, and manages AI employees. Each agent has: name, role, tier (Manager/Specialist/Worker), AI model assignment, department, and a "Soul" (personality definition in markdown).

User workflow:
1. Admin sees a table/list of all AI agents with their status, tier, model, and department
2. Filters agents by department, tier, status, or search by name
3. Clicks "+ New AI Employee" to create a new agent (name, role, tier, model, department, soul template)
4. Clicks an agent row to open a detail panel (slides in from right or modal)
5. Detail panel has 3 tabs: Basic Info (edit name/role/tier/model/dept), Soul Editor (markdown editor + live preview side-by-side), Tools (read-only list of allowed tools)
6. System agents are marked with a special badge and cannot be deleted
7. Admin can deactivate non-system agents (with confirmation)

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only.
- On desktop, this content area is approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — title "Agent Management", agent count, "+ New AI Employee" button.
2. Filter bar — search input, department dropdown, tier dropdown (Manager/Specialist/Worker), status dropdown (online/working/error/offline).
3. Agent table — columns: Name (with avatar/icon, role subtitle, system badge if applicable), Tier, Model, Department, Status (colored badge), Actions (edit, deactivate).
4. Create form — expandable form or modal for creating new agents. Fields: name, role, tier (with auto model suggestion), model selector, department, soul template dropdown + textarea.
5. Detail panel — slide-in panel from right (or wide modal) with 3 tabs:
   - Basic Info: form fields for name, role, tier, model, department
   - Soul Editor: split view with markdown editor (left) and rendered preview (right)
   - Tools: read-only list of allowed tools as badges/chips
6. Deactivation confirmation modal — shows agent name and impact description.
7. Empty state — when no agents exist, CTA to create first one.
8. Loading state, error state.

Design tone — YOU DECIDE:
- This is an admin management panel. Think Linear settings, Vercel dashboard, or Stripe dashboard.
- Professional, clean, data-focused.
- The table should be scannable and the detail panel should be spacious for editing.
- Light or dark theme — your choice.

Design priorities:
1. The agent list must be scannable — status and tier at a glance.
2. The Soul editor needs enough space for comfortable markdown editing.
3. System agents must be visually distinct from regular agents.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

### 모바일 버전
```
Mobile version (375x812) of the same agent management page.

IMPORTANT — Mobile app shell context:
- BOTTOM TAB BAR (don't include). TOP HEADER (don't include).
- Content area only.

Mobile-specific:
- Agent list as cards instead of table (name, tier badge, status badge, dept)
- Detail panel as full-screen overlay
- Create form as full-screen modal
- Filters collapsible or in a filter drawer

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `agents-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `agents-header` | 페이지 헤더 | 제목 + 카운트 |
| `agents-create-btn` | 새 에이전트 버튼 | 생성 폼 열기 |
| `agents-create-form` | 생성 폼 | 폼 영역 |
| `agents-search` | 검색 입력 | 이름 검색 |
| `agents-filter-dept` | 부서 필터 | 부서 선택 |
| `agents-filter-tier` | 계급 필터 | 계급 선택 |
| `agents-filter-status` | 상태 필터 | 상태 선택 |
| `agents-table` | 에이전트 테이블 | 목록 표시 |
| `agents-row` | 테이블 행 | 개별 에이전트 |
| `agents-edit-btn` | 편집 버튼 | 디테일 열기 |
| `agents-deactivate-btn` | 비활성화 버튼 | 비활성화 시작 |
| `agents-detail-panel` | 디테일 패널 | 편집 패널 |
| `agents-tab-info` | 기본 정보 탭 | 탭 전환 |
| `agents-tab-soul` | Soul 탭 | 탭 전환 |
| `agents-tab-tools` | 도구 탭 | 탭 전환 |
| `agents-soul-editor` | Soul 에디터 | 마크다운 편집 |
| `agents-soul-preview` | Soul 미리보기 | 렌더 결과 |
| `agents-save-btn` | 저장 버튼 | 변경 저장 |
| `agents-deactivate-modal` | 비활성화 모달 | 확인 다이얼로그 |
| `agents-empty-state` | 빈 상태 | 에이전트 없을 때 |
| `agents-system-badge` | 시스템 뱃지 | 시스템 에이전트 |
| `agents-secretary-badge` | 비서 뱃지 | 비서 에이전트 |
| `agents-loading` | 로딩 skeleton | 목록 로딩 중 |
| `agents-error` | 에러 상태 | API 에러 표시 |
| `agents-retry-btn` | 재시도 버튼 | 에러 시 재시도 |
| `agents-soul-template-select` | Soul 템플릿 선택 | 템플릿 드롭다운 |
| `agents-unsaved-dialog` | 미저장 경고 다이얼로그 | Soul 편집 미저장 시 확인 |
| `agents-search-empty` | 검색 결과 없음 | 빈 필터 결과 표시 |
| `agents-filter-reset` | 필터 초기화 | 전체 필터 리셋 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/agents 접속 | `agents-page` 존재 |
| 2 | 에이전트 목록 | 로드 완료 | 테이블 행 표시 |
| 3 | 검색 필터 | 이름 입력 | 필터된 결과 |
| 4 | 계급 필터 | Manager 선택 | Manager만 표시 |
| 5 | 에이전트 생성 | + 클릭 → 폼 입력 → 생성 | 목록에 추가 |
| 6 | 에이전트 편집 | 행 클릭 → 디테일 패널 | 편집 폼 표시 |
| 7 | Soul 편집 | Soul 탭 → 텍스트 입력 | 미리보기 업데이트 |
| 8 | 비활성화 | 비활성화 클릭 → 확인 | 에이전트 비활성화 |
| 9 | 시스템 에이전트 | 시스템 에이전트 확인 | 비활성화 버튼 없음 |
| 10 | 반응형 | 375px 뷰포트 | 카드 레이아웃 |
| 11 | Soul 템플릿 | 템플릿 선택 → 적용 | Soul 에디터에 내용 반영 |
| 12 | 로딩 상태 | 페이지 로드 중 | `agents-loading` skeleton 표시 |
| 13 | 에러 상태 | API 실패 시뮬레이션 | `agents-error` + 재시도 버튼 표시 |
| 14 | 필수 필드 검증 | 이름 빈 채로 생성 시도 | 에러 메시지 / 버튼 비활성화 |
| 15 | 부서 필터 | 부서 선택 | 해당 부서만 표시 |
| 16 | 계급→모델 자동 매칭 | 편집 패널에서 계급 변경 | 모델이 자동으로 변경됨 |
| 17 | 미저장 경고 | Soul 편집 후 패널 닫기 시도 | 미저장 확인 다이얼로그 표시 |
| 18 | 검색 결과 없음 | 존재하지 않는 이름 검색 | "결과 없음" + 필터 초기화 링크 |
| 19 | 비서 에이전트 뱃지 | 비서 에이전트 행 확인 | `agents-secretary-badge` 표시 |
