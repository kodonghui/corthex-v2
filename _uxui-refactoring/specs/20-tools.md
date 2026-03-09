# Tools UX/UI 설명서

> 페이지: #20 tools
> 패키지: admin
> 경로: /admin/tools
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 AI 에이전트 조직에서 사용 가능한 **도구(Tool) 카탈로그를 조회**하고, **에이전트별 도구 사용 권한을 매트릭스 형태로 설정**하는 페이지. 카테고리별 필터링(common/finance/legal/marketing/tech)과 일괄 토글로 효율적인 권한 관리를 지원.

**핵심 사용자 시나리오:**
- 관리자가 전체 도구 카탈로그를 카테고리별로 브라우징
- 특정 에이전트에 필요한 도구를 체크박스로 할당/해제
- 카테고리 단위 일괄 할당 (예: "Finance 도구 전체를 CIO에게")
- 변경사항을 미리보기 후 한번에 저장

---

## 2. 현재 레이아웃 분석

### 데스크톱 (1440px+)
```
┌────────────────────────────────────────────────────────┐
│  "도구 관리"                                            │
│  N개 도구 · N개 에이전트          [변경N건] [취소] [저장] │
├────────────────────────────────────────────────────────┤
│  [전체(N)] [Common(N)] [Finance(N)] [Legal(N)]         │
│  [Marketing(N)] [Tech(N)]     ← 카테고리 필터 (pill)    │
├────────────────────────────────────────────────────────┤
│  ┌─ 도구 카탈로그 테이블 ───────────────────────────┐   │
│  │ 이름(monospace) | 카테고리(pill) | 설명 | 상태(●) │   │
│  │ search_web     | Common         | ...  | ●녹색   │   │
│  │ kr_stock       | Finance        | ...  | ●녹색   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ 에이전트별 도구 권한 매트릭스 ────────────────────┐  │
│  │         | Com | Fin | Leg | ... | tool1 | tool2 |  │  │
│  │ Agent1  | [✓] | [−] | [ ] | ... | [✓]  | [ ]   |  │  │
│  │ Agent2  | [ ] | [✓] | [✓] | ... | [ ]  | [✓]   |  │  │
│  │ (수정된 행은 amber 배경 + 수정 인디케이터)         │  │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ 하단 저장 바 (sticky, 변경 시에만) ──────────────┐  │
│  │ "N건의 변경사항이 있습니다"        [취소] [저장]   │  │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

### 모바일 (375px)
```
┌─────────────────────┐
│ "도구 관리"          │
│ N도구 · N에이전트    │
├─────────────────────┤
│ [전체][Com][Fin]... │
│ ← 가로 스크롤 필터   │
├─────────────────────┤
│ ┌─ 카탈로그 ──────┐ │
│ │ 테이블 가로스크롤│ │
│ └─────────────────┘ │
│ ┌─ 권한 매트릭스 ─┐ │
│ │ 가로스크롤 테이블│ │
│ │ (에이전트 컬럼   │ │
│ │  sticky left)    │ │
│ └─────────────────┘ │
│ [N건 변경][취소][저장]│
└─────────────────────┘
```

---

## 3. 현재 문제점

1. **매트릭스 가독성**: 에이전트/도구가 많아지면 가로 스크롤이 길어지고 도구 이름이 45도 회전 텍스트라 읽기 어려움
2. **카테고리 배치 토글과 개별 체크박스 혼재**: 매트릭스 헤더에 카테고리 일괄 토글이 있는데, 개별 도구 체크박스와 시각적으로 구분이 약함
3. **변경 추적 UX**: 수정된 에이전트 행에 amber 배경과 작은 점만 있어서 어떤 도구가 변경되었는지 구체적으로 파악 어려움
4. **도구 카탈로그와 권한 매트릭스 분리**: 두 섹션이 세로로 나열되어 있어 도구 설명을 보면서 권한을 수정하기 불편
5. **모바일 매트릭스**: 체크박스 매트릭스가 모바일에서 사실상 사용 불가 (너무 작은 터치 타겟)
6. **빈 상태**: 도구 없을 때 "도구 정의를 먼저 등록하세요"만 표시 -- 등록 방법 안내 없음
7. **검색 기능 없음**: 도구 이름으로 검색하는 기능이 없어 카테고리 필터만으로 찾아야 함
8. **도구 상태 표시 약함**: 등록(registered) 여부가 작은 점(2px)으로만 표시
9. **저장 바 중복**: 상단 헤더와 하단 sticky 바 양쪽에 저장/취소 버튼이 있어 중복
10. **도구 설명 잘림**: max-w-xs truncate로 긴 설명이 잘리는데 확장 방법 없음

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2가 결정** -- 카테고리별 색상 코드는 유지
- 매트릭스는 data-heavy UI이므로 정보 밀도와 가독성 균형이 핵심
- 변경 상태는 시각적으로 명확하게 (단순 배경색이 아닌 diff 스타일)

### 4.2 레이아웃 개선
- **매트릭스 접근 방식 재검토**: 에이전트별 카드 뷰 + 도구 토글 방식도 고려 (모바일 대응)
- **도구 검색 추가**: 이름/설명 텍스트 검색
- **도구 설명 확장**: hover 시 툴팁 또는 클릭 시 확장

### 4.3 인터랙션 개선
- 변경사항 diff 뷰: 저장 전 추가/제거된 도구 목록 확인
- 카테고리 일괄 토글 시 확인 프롬프트 (실수 방지)

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | ToolsPage | 검색 추가, 레이아웃 개선 | pages/tools.tsx |
| 2 | CategoryFilter | 필터 pill 디자인 개선 | pages/tools.tsx (내부) |
| 3 | ToolCatalogTable | 도구 카탈로그 테이블 디자인, 설명 확장 | pages/tools.tsx (내부) |
| 4 | AgentPermissionMatrix | 매트릭스 가독성 개선, 변경 diff 표시 | pages/tools.tsx (내부) |
| 5 | SaveBar | 하단 저장 바 디자인 통일 | pages/tools.tsx (내부) |

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| catalog | useQuery → GET /admin/tools/catalog | 도구 카탈로그 (카테고리별 그룹) |
| agents | useQuery → GET /admin/agents?companyId={id} | 에이전트 목록 + allowedTools |
| pendingChanges | useState (Map) | 수정 중인 에이전트별 도구 목록 |
| activeCategory | useState | 현재 선택된 카테고리 필터 |
| selectedCompanyId | useAdminStore | 회사 필터 |

**API 엔드포인트 (변경 없음):**
- `GET /admin/tools/catalog` -- 도구 카탈로그 조회
- `GET /admin/agents?companyId={id}` -- 에이전트 목록 조회
- `PATCH /admin/agents/{id}/allowed-tools` -- 에이전트별 도구 권한 저장

---

## 7. 색상/톤 앤 매너

| 용도 | 색상 | Tailwind |
|------|------|---------|
| Common 카테고리 | 블루 | bg-blue-100 text-blue-700 / dark:bg-blue-900/30 dark:text-blue-300 |
| Finance 카테고리 | 그린 | bg-green-100 text-green-700 / dark:bg-green-900/30 dark:text-green-300 |
| Legal 카테고리 | 퍼플 | bg-purple-100 text-purple-700 / dark:bg-purple-900/30 dark:text-purple-300 |
| Marketing 카테고리 | 오렌지 | bg-orange-100 text-orange-700 / dark:bg-orange-900/30 dark:text-orange-300 |
| Tech 카테고리 | 시안 | bg-cyan-100 text-cyan-700 / dark:bg-cyan-900/30 dark:text-cyan-300 |
| 등록 상태 (등록됨) | 그린 | bg-green-500 |
| 등록 상태 (미등록) | 징크 | bg-zinc-300 |
| 수정된 행 배경 | 앰버 | bg-amber-50/50 dark:bg-amber-900/10 |
| 변경 건수 텍스트 | 앰버 | text-amber-600 dark:text-amber-400 |
| 전체 선택 체크 | 인디고 | bg-indigo-600 text-white |
| 부분 선택 체크 | 인디고 연 | bg-indigo-100 text-indigo-600 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 카탈로그 + 매트릭스 세로 배치, 넓은 테이블 |
| **768px~1439px** (Tablet) | 테이블 가로 스크롤, 에이전트 이름 sticky left |
| **~375px** (Mobile) | 매트릭스 대신 에이전트별 카드 뷰 (도구 체크리스트), 카테고리 필터 가로 스크롤 |

**모바일 특별 처리:**
- 카테고리 필터: 가로 스크롤 pill 바
- 도구 카탈로그: 테이블 대신 카드 리스트
- 권한 매트릭스: 에이전트 선택 -> 해당 에이전트의 도구 체크리스트 표시
- 저장 바: 하단 고정

---

## 9. 기존 기능 참고사항

v1-feature-spec.md 3번 항목에 따라, 아래 기능이 **반드시** 동작해야 함:

- [x] 도구 카탈로그 조회 (이름, 카테고리, 설명, 등록 상태)
- [x] 에이전트별 도구 권한 제어 (allowedTools 필드)
- [x] 카테고리별 필터링 (common/finance/legal/marketing/tech)
- [x] 일괄 카테고리 토글 (한 카테고리의 모든 도구를 한번에 on/off)
- [x] 변경사항 추적 + 일괄 저장

**UI 변경 시 절대 건드리면 안 되는 것:**
- `api.get/patch` 호출 로직
- pendingChanges Map 기반 변경 추적 로직
- toggleTool, toggleCategory 함수의 비즈니스 로직
- CatalogTool, Agent 타입 정의
- CATEGORIES 상수 배열

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — a platform where a human administrator manages an organization of AI agents. This is the ADMIN panel where the administrator manages which tools each AI agent is allowed to use.

This page: Tool management — the admin views a catalog of all available tools (categorized as Common, Finance, Legal, Marketing, Tech) and assigns tool permissions to individual AI agents using a permission matrix.

User workflow:
1. Admin sees a summary: total tool count and total agent count.
2. Admin filters tools by category using pill-shaped tab buttons (All, Common, Finance, Legal, Marketing, Tech) — each with a count badge.
3. A tool catalog table shows each tool's name (monospace font), category (colored badge), description, and registration status (green dot = registered).
4. Below the catalog, a permission matrix shows agents as rows and tools as columns. Each cell is a checkbox. The admin checks/unchecks to grant/revoke tool access.
5. Category-level batch toggle buttons let the admin enable/disable all tools in a category for a given agent with one click.
6. Modified rows are highlighted. A floating save bar at the bottom shows "N changes pending" with Cancel and Save buttons.

IMPORTANT — App shell context:
- The app already has a LEFT SIDEBAR for navigation. DO NOT include any navigation sidebar.
- The app already has a TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA only — approximately 1200px wide and 850px tall.

Required functional elements:
1. Header — page title "Tool Management", subtitle showing "N tools · N agents", save/cancel buttons (visible only when changes exist).
2. Category filter tabs — pill-shaped buttons: All, Common (blue), Finance (green), Legal (purple), Marketing (orange), Tech (cyan). Each shows count.
3. Tool catalog table — columns: Name, Category, Description, Status. Clean table with hover rows.
4. Permission matrix — rows = agents (sticky left column with agent name + tier badge), columns = individual tools. Header row has tool names rotated or abbreviated. Category batch toggle buttons before individual tool columns.
5. Checkbox states: checked (indigo), unchecked (empty), partial category (dash icon).
6. Change indicator — modified agent rows have subtle highlight + dot marker.
7. Floating save bar — bottom-sticky bar with change count + cancel/save buttons.
8. Empty state — message when no tools are registered.
9. Loading state — skeleton UI while data loads.

Design tone — YOU DECIDE:
- This is a data-heavy admin interface — think "permission management" like AWS IAM or GitHub repo settings.
- Information density is key but readability must not suffer.
- Category colors should be consistent and distinguishable.
- The matrix should feel like a spreadsheet — familiar and efficient.

Design priorities:
1. The permission matrix must be the focal point — it's where the admin spends most time.
2. Category filters must be immediately accessible — switching categories should be one click.
3. Change tracking must be obvious — the admin must know what will change before saving.

Resolution: 1440x900, pixel-perfect UI screenshot style. Should look like a real production web application, not a wireframe or mockup.
```

### 모바일 버전
```
Mobile version (375x812) of the same page described above.

Same product context: an admin panel for managing AI agent tool permissions with a catalog and permission matrix.

IMPORTANT — Mobile app shell context:
- The mobile app has a BOTTOM TAB BAR for navigation. DO NOT include a bottom nav bar.
- The app has a compact TOP HEADER. DO NOT include a top app bar.
- Your design fills the CONTENT AREA between the header and the bottom nav bar.

Required elements (same as desktop, optimized for mobile):
1. Category filter as horizontal scrollable pills
2. Tool catalog as card list (not table)
3. Permission management as agent-centric view: select an agent, then see their tool checklist grouped by category
4. Change tracking + save/cancel buttons (bottom sticky)
5. Loading / empty / error states

Note: The full matrix view doesn't work on mobile. Instead, use an agent-first approach: admin picks an agent, then toggles tools for that agent in a categorized checklist.

Design tone: Same as desktop — consistent visual language. YOU DECIDE the tone.

Design priorities for mobile:
1. Agent selection must be easy — dropdown or scrollable list.
2. Tool toggles must have large enough touch targets (minimum 44x44px).
3. Category grouping helps organize the long list of tools.

Resolution: 375x812, pixel-perfect mobile UI screenshot style. Should look like a real production mobile web app.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `tools-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `tools-category-filter` | 카테고리 필터 컨테이너 | 필터 영역 |
| `tools-category-all` | 전체 필터 버튼 | 전체 보기 |
| `tools-category-common` | Common 필터 | 카테고리 필터 |
| `tools-category-finance` | Finance 필터 | 카테고리 필터 |
| `tools-category-legal` | Legal 필터 | 카테고리 필터 |
| `tools-category-marketing` | Marketing 필터 | 카테고리 필터 |
| `tools-category-tech` | Tech 필터 | 카테고리 필터 |
| `tools-catalog-table` | 도구 카탈로그 테이블 | 카탈로그 영역 |
| `tools-catalog-row` | 도구 행 | 개별 도구 |
| `tools-permission-matrix` | 권한 매트릭스 | 매트릭스 영역 |
| `tools-agent-row` | 에이전트 행 | 개별 에이전트 권한 |
| `tools-batch-toggle` | 카테고리 일괄 토글 | 카테고리 전체 on/off |
| `tools-tool-checkbox` | 도구 체크박스 | 개별 도구 토글 |
| `tools-change-count` | 변경 건수 표시 | 미저장 변경 수 |
| `tools-save-btn` | 저장 버튼 | 변경사항 저장 |
| `tools-cancel-btn` | 취소 버튼 | 변경사항 취소 |
| `tools-save-bar` | 하단 저장 바 | 저장/취소 영역 |
| `tools-search-input` | 검색 입력 | 도구 이름/설명 검색 |
| `tools-empty-state` | 빈 상태 | 도구 없을 때 |
| `tools-loading` | 로딩 상태 | 데이터 로딩 중 |
| `tools-error-state` | 에러 상태 | API 실패 시 에러 메시지 + 재시도 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/tools 접속 | `tools-page` 존재, 카탈로그 테이블 표시 |
| 2 | 카테고리 필터 | Finance 필터 클릭 | Finance 카테고리 도구만 표시 |
| 3 | 전체 필터 | 전체 버튼 클릭 | 모든 도구 표시 |
| 4 | 도구 체크박스 토글 | 체크박스 클릭 | 체크 상태 변경, 변경 건수 증가 |
| 5 | 카테고리 일괄 토글 | 일괄 토글 버튼 클릭 | 해당 카테고리 도구 전체 체크/언체크 |
| 6 | 변경 건수 표시 | 체크박스 변경 후 | `tools-change-count`에 건수 표시 |
| 7 | 변경 저장 | 저장 버튼 클릭 | 성공 토스트, 변경 건수 0으로 리셋 |
| 8 | 변경 취소 | 취소 버튼 클릭 | 원래 상태로 복원, 변경 건수 0 |
| 9 | 저장 바 표시/숨김 | 변경 없을 때 / 있을 때 | 변경 시에만 저장 바 표시 |
| 10 | 수정된 행 하이라이트 | 체크박스 변경 후 | 해당 에이전트 행 amber 배경 |
| 11 | 빈 상태 | 도구 없는 회사 | `tools-empty-state` 표시 |
| 12 | 반응형 필터 | 375px 뷰포트 | 카테고리 필터 가로 스크롤 |
| 13 | 매트릭스 가로 스크롤 | 도구 많을 때 | 에이전트 이름 컬럼 sticky left |
| 14 | 다중 에이전트 변경 | 여러 에이전트 체크박스 변경 | 변경 건수에 모든 변경 합산 |
| 15 | 도구 검색 | 검색어 입력 | 이름/설명 매칭 도구만 표시 |
| 16 | 에러 상태 | API 실패 시 | `tools-error-state` 에러 메시지 표시 |
