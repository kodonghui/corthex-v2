# CORTHEX UX 워크스루 리포트
Date: 2026-03-27
Tester: Claude (Playwright MCP)
Environment: Production (corthex-hq.com)

## Executive Summary
- 전체 플로우 완주: Y (Admin 16페이지, App 11페이지, Mobile 3페이지)
- Critical UX 이슈: 3건
- Major UX 이슈: 7건
- Minor UX 이슈: 9건
- 첫인상 점수: 6.5/10

**한줄 요약**: 시각적으로 인상적인 "군사 커맨드 센터" 테마가 일관성 있게 적용되어 있으나, 영어/한국어 혼재와 지나친 전문용어 사용이 비개발자 CEO 사용자를 혼란스럽게 만든다. 핵심 기능(채팅, 에이전트 관리, 대시보드)은 잘 작동하지만 20개 이상의 사이드바 메뉴 항목은 정리가 필요하다.

---

## Journey 1: Admin Panel

### Step 1: 로그인 (01-admin-login.png)
- **첫인상**: 깔끔한 군사 테마 로그인. 골드+블랙 색상이 프리미엄 느낌.
- **알기 쉬운가**: O - 아이디/비밀번호 필드가 명확하고 "세션 시작" 버튼이 눈에 잘 들어옴
- **이슈**:
  - [Minor] "세션 시작" 버튼이 페이지 하단 푸터(Privacy Policy, Terms of Service)와 겹쳐 보임. 뷰포트 높이가 작으면 버튼이 가려질 수 있음.
  - [Minor] "Mainframe Online" / "v4.2.0-secure" 같은 장식용 텍스트가 실제 시스템 버전과 다름 (실제는 #875 ba6598e). 장식이라면 혼란의 소지가 있음.
  - [Minor] "Central Command Access" / "Authorized Personnel Only" -- 영어로만 되어 있음. 한국어 사용자 대상이라면 통일 필요.

### Step 2: 대시보드 (02-admin-dashboard.png)
- **첫인상**: 카드형 KPI(Departments 6, Active Users 4, Autonomous Agents 6)가 한눈에 보여 좋음. Health Status 바 차트도 깔끔.
- **알기 쉬운가**: O - 핵심 지표가 바로 보임
- **이슈**:
  - [Major] **DEPARTMENTS, ACTIVE USERS, AUTONOMOUS AGENTS** 등 영어 대문자 라벨과 한국어(관리자, 대표님, 비서실장) 데이터가 혼재. CEO 사용자 입장에서 "AUTONOMOUS AGENTS"가 뭔지 바로 이해하기 어려움. "AI 에이전트 6대" 같은 한국어 라벨이 더 적합.
  - [Major] **USERS_ACTIVE, AGENTS_ONLINE, DEPT_COUNT** -- 변수명 그대로 UI에 노출됨. 이것은 개발자용 디버그 정보처럼 보임. "활성 사용자", "온라인 에이전트" 등으로 변환 필요.
  - [Minor] **EXPORT_LOGS, VIEW_ALL_RECORDS** 버튼도 프로그래밍 변수 스타일. 사용자 친화적 라벨로 변경 필요.
  - [Minor] Recent Activity 테이블에 E2E/QA 테스트 데이터가 노출됨 ("E2E Inactive User", "QA Employee Updated"). 데모/프로덕션 데이터 정리 필요.

### Step 3: 사이드바 (03-admin-sidebar.png)
- **첫인상**: 깔끔한 드로어 메뉴. 회사 선택(CORTHEX HQ) 드롭다운이 상단에 있어 멀티테넌시 지원이 명확.
- **알기 쉬운가**: X -- 메뉴 항목이 20개 이상으로 너무 많음
- **이슈**:
  - [Critical] **사이드바 메뉴 항목 20+개**: 대시보드, 회사관리, 직원관리, 사용자관리, 부서관리, AI에이전트, 도구관리, 비용관리, CLI/API키, 보고라인, 소울템플릿, 시스템모니터링, NEXUS조직도, SketchVibe, 조직템플릿, 템플릿마켓, 에이전트마켓, 공개API키, n8n에디터, 마케팅AI엔진, 메모리관리, 회사설정. CEO가 이 중에서 원하는 것을 찾으려면 스크롤이 필요하고, 대부분은 자주 사용하지 않는 기능. **카테고리별 그룹핑(조직/AI/시스템/마켓플레이스)이 절실함.**
  - [Major] "직원 관리"와 "사용자 관리"의 차이가 불분명. 사이드바에서 나란히 있으면 CEO는 "어디서 사람을 추가하지?"라고 헷갈림.
  - [Minor] 사이드바가 스크롤되지만 "회사 설정"과 "CEO 앱으로 전환" 버튼이 하단 고정 영역에 있어, 중간 메뉴 항목이 가려질 수 있음.
  - [Minor] 빌드 번호 "#875 ba6598e" 가 사이드바 하단에 노출 -- 개발자에게는 유용하나 CEO에게는 의미 없는 정보.

### Step 4: 회사 관리 (04-companies.png)
- **첫인상**: "ADMIN_OVERRIDE" 태그와 "Global entity provisioner. Manage infrastructure permissions across the mesh network." 설명이 매우 기술적.
- **알기 쉬운가**: X -- "TOTAL_ENTITIES", "ACTIVE_THROUGHPUT", "SYNC_STATUS" 등 프로그래밍 변수명이 UI에 노출
- **이슈**:
  - [Critical] **변수명 UI 노출 패턴이 전체 Admin에 반복됨**: "TOTAL_ENTITIES", "ACTIVE_THROUGHPUT", "SYNC_STATUS", "FILTER_SEARCH...", "PROVISIONED_ON", "ACCESS_ROOT" 등. CEO 사용자는 이 용어를 이해할 수 없음. "총 회사 수", "활성률", "동기화 상태" 등 한국어 라벨 필요.
  - [Major] "Initialize Node / Awaiting infrastructure allocation command..." -- 새 회사를 만드는 CTA인데 서버 인프라 용어로 되어 있어 CEO가 이해 불가.

### Step 5: 직원 관리 (05-employees.png)
- **첫인상**: 테이블 뷰가 깔끔. 검색, 부서 필터, 상태 필터가 잘 배치됨.
- **알기 쉬운가**: O - 테이블 구조가 직관적
- **이슈**:
  - [Minor] "3명의 직원" 표시와 함께 "영구 삭제" 버튼이 바로 노출됨 -- 위험한 작업인데 확인 없이 바로 접근 가능한 것은 위험.
  - [Minor] QA/E2E 테스트 데이터가 프로덕션에 남아있음 ("QA Employee Updated", "E2E Inactive User").

### Step 6: 부서 관리 (06-departments.png)
- **첫인상**: "REGISTRY / SECTOR" 태그와 함께 부서 목록 표시. "Active nodes: 6" 표시.
- **알기 쉬운가**: 대체로 O -- 부서명, 설명, 에이전트 수, 상태가 명확
- **이슈**:
  - [Minor] "Registry / Sector" 라벨이 CEO에게는 의미 없음. "부서 관리"가 이미 명확.
  - [Minor] QA 테스트 부서("QA-Test-Department", "QA-V1-TestDept-36")가 프로덕션에 노출.

### Step 7: AI 에이전트 (07-agents.png)
- **첫인상**: 통계 카드(Total 6, Online 1, Error/Inactive 2)가 유용. 필터(Tier, Status)도 잘 배치됨.
- **알기 쉬운가**: O - 에이전트 목록과 상태가 명확
- **이슈**:
  - [Major] **TOTAL_AGENTS, ONLINE_AGENTS, SEARCH_REGISTRY, FILTER_TIER, FILTER_STATUS, ALL_TIERS, ALL_STATES, NEW_AGENT** -- 여전히 변수명 스타일 라벨. "총 에이전트", "온라인", "검색", "등급 필터" 등이 적합.
  - [Minor] "ATTENTION_REQUIRED"도 변수명. "확인 필요"가 적합.
  - [Minor] "[SYS]", "[OFF]" 접미사는 개발자 편의용. 사용자에게는 상태 뱃지로 충분.

### Step 8: 도구 관리 (08-tools.png)
- **첫인상**: "MODULE / REGISTRY" 태그와 "TOOL REGISTRY" 제목. "QUERY_SYSTEM_TOOLS..." 검색 placeholder.
- **알기 쉬운가**: O -- 도구 목록은 이름+설명이 명확 (한국어 설명 제공)
- **이슈**:
  - [Minor] "Interface for low-level diagnostic and data extraction protocols" 설명이 CEO에게 의미 없음. "AI 에이전트가 사용할 수 있는 도구를 관리합니다" 정도가 적합.
  - [Minor] Agent Permission Matrix가 24개 도구 x 6개 에이전트로 매우 넓어 가로 스크롤 필요. 도구 이름도 잘림("get_account_...", "create_calen...").

### Step 9: 비용 관리 (09-costs.png)
- **첫인상**: "TERMINAL_ID: 0x882A_COST" / "COST MANAGEMENT // SYSTEM_OVERVIEW" 제목. 시간대 필터(24H, 7D, 30D, ALL)와 날짜 범위 선택기 제공.
- **알기 쉬운가**: O -- $0.00 / $15,000.00 등 금액이 명확
- **이슈**:
  - [Major] "TERMINAL_ID: 0x882A_COST" 같은 가짜 터미널 ID가 UI에 노출. 혼란의 소지.
  - [Minor] "TOTAL SYSTEM SPEND (MTD)", "REMAINING BUDGET", "PROJECTED MONTH-END" 라벨이 영어. 한국어 혼용.
  - [Minor] "-5.2% VS LAST WEEK" 표시가 있지만 실제 지출이 $0.00인데 -5.2%는 무의미한 데이터.

### Step 10: 자격증명 관리 (10-credentials.png)
- **첫인상**: "CREDENTIAL MANAGER / SECURE_STORAGE // ACCESS_CONTROL_V4" 제목. 사용자 선택 후 자격증명 관리.
- **알기 쉬운가**: X -- "SELECT_USER" 라벨과 "ACTIVE_KEYS", "CLI_TOKENS", "API_KEYS" 카운터가 변수명 스타일
- **이슈**:
  - [Minor] "SELECT A USER ABOVE TO MANAGE CREDENTIALS" 안내가 영어. 한국어 인터페이스와 불일치.

### Step 11: 보고 라인 (11-report-lines.png)
- **첫인상**: 간결하고 이해하기 쉬움. "새 보고 라인 추가" 섹션과 기존 라인 목록.
- **알기 쉬운가**: O -- 대상 사용자(REPORTER)와 직속 상사(SUPERVISOR) 개념이 명확
- **이슈**:
  - [Minor] "(REPORTER)", "(SUPERVISOR)" 영어 주석이 한국어 라벨 옆에 불필요하게 부가됨.

### Step 12: 소울 템플릿 (12-soul-templates.png)
- **첫인상**: "SOUL TEMPLATES LIBRARY" 제목. 0개 템플릿. "ADD CUSTOM TEMPLATE / Click to create a new soul profile" CTA.
- **알기 쉬운가**: X -- "소울 템플릿"이 뭔지 CEO가 바로 이해하기 어려움
- **이슈**:
  - [Major] **"소울 템플릿" 개념 설명 부재**: 에이전트의 성격/역할을 정의하는 템플릿인 것 같지만, 이 페이지만 봐서는 알 수 없음. 설명 텍스트가 필요.
  - [Minor] "API ONLINE / GET /api/admin/soul-templates" 디버그 정보가 UI에 노출. 사용자에게 불필요.

### Step 13: 시스템 모니터링 (13-monitoring.png)
- **첫인상**: SERVER_STATUS ONLINE, SYSTEM_UPTIME 56m, ERRORS_24H 0, DATABASE_PROTOCOL ONLINE 카드. Memory Allocation 게이지(102.6%), Process Memory(168 MB RSS).
- **알기 쉬운가**: O -- 서버 상태를 한눈에 파악 가능
- **이슈**:
  - [Minor] RAM 사용량 102.6%는 100%를 초과하는데, 이것이 정상인지 경고인지 시각적 표시 부족. 붉은색 경고가 있어야 할 것 같은데 녹색/노란색으로 표시됨.
  - [Minor] "LIVE SYS-LOG" 섹션에 "[SYS] ALL_SYSTEMS_NOMINAL" 한 줄만 표시. 실시간 로그가 비어있으면 "최근 로그 없음" 같은 안내가 더 적합.

### Step 14: NEXUS 조직도 (14-nexus.png)
- **첫인상**: 인상적인 그래프 시각화. CORTHEX HQ를 중심으로 에이전트/부서가 노드와 엣지로 연결. 색상으로 구분.
- **알기 쉬운가**: O -- 조직 구조가 시각적으로 명확
- **이슈**:
  - [Minor] 노드 텍스트가 한국어인데 매우 작아서 읽기 어려움. 줌 인/아웃 컨트롤(+/-)이 있지만 기본 뷰에서 텍스트가 가려짐.
  - [Minor] 우측 하단에 범례(legend)처럼 보이는 컬러 바가 있으나 잘려서 전체가 보이지 않음.

### Step 15: 설정 (15-settings.png)
- **첫인상**: "SYSTEM CONFIGURATION" 태그 + "Admin Settings" 제목. General / API Keys / Agent Settings 탭.
- **알기 쉬운가**: O -- 탭 구조가 깔끔하고 회사명 입력 필드가 명확
- **이슈**:
  - [Minor] "High-precision adjustments made here affect all operational sub-systems." 설명이 과도하게 기술적.

### Step 16: 온보딩 (16-onboarding.png)
- **첫인상**: "SYSTEM INITIALIZATION / STEP 01 / 05" 진행 표시줄. Company -> Departments -> Agents -> CLI Token -> Complete 단계.
- **알기 쉬운가**: O -- 스텝 바이 스텝 마법사가 직관적
- **이슈**:
  - [Minor] "Provision a new industrial workspace on the CORTHEX backbone." 설명이 CEO에게 부자연스러움. "회사 정보를 입력하여 워크스페이스를 생성하세요" 정도가 적합.
  - [Minor] "CLI Token" 단계명이 비개발자에게 생소. "API 연결" 또는 "시스템 연동" 정도가 적합.

---

## Journey 2: App Panel

### Step 1: Hub (20-app-hub.png)
- **첫인상**: 3-컬럼 레이아웃. 좌측 네비게이션(Workspace Hub, Active Tasks, Agent Directory), 중앙 채팅형 인터페이스, 우측 Process Delegation 패널.
- **알기 쉬운가**: O -- "비서실장에게 명령하세요" 안내와 예시 명령(뉴스 브리핑, 도구 목록 등)이 매우 직관적
- **이슈**:
  - [Major] "Reconnecting..." 상태가 표시됨. WebSocket 연결이 불안정한 것으로 보임. CEO가 처음 접속했는데 "재연결 중"이 보이면 불안함.
  - [Minor] CORTHEX_TERMINAL_V2 라벨과 "API: /api/workspace/hub/stream" 디버그 정보가 입력 영역 아래에 노출.
  - [Minor] 좌측 네비게이션 항목이 3개뿐인데 큰 영역을 차지. 화면 낭비.

### Step 2: 대시보드 (21-app-dashboard.png)
- **첫인상**: "Welcome, Commander" 인사말. 4개 KPI 카드(Active Agents 01, Departments 00, Pending Jobs 000, Total Costs $0). Active Units 테이블.
- **알기 쉬운가**: O -- 핵심 지표가 한눈에 보임
- **이슈**:
  - [Critical] **"SYSTEM: OFFLINE" 빨간 표시가 "Welcome, Commander" 바로 아래에 있음.** CEO가 처음 접속했는데 시스템이 오프라인이라고 하면 당황스러움. 이것이 실제 장애인지, 단순 표시 오류인지 불분명.
  - [Major] "Departments 00" 표시인데 실제로 6개 부서가 있음. 데이터 불일치.
  - [Minor] "Welcome, Commander" -- 영어 인사말. 한국어 인터페이스라면 "환영합니다, CEO님" 등이 자연스러움.

### Step 3: 채팅 (22-app-chat.png)
- **첫인상**: 좌측 세션 목록, 우측 채팅 영역. "비서실장"이 온라인 상태. 깔끔한 메시지 입력 영역.
- **알기 쉬운가**: O -- 카카오톡/Slack 같은 친숙한 채팅 UI
- **이슈**:
  - [Minor] "CORTHEX AI can make mistakes. Consider verifying important information." 면책조항이 영어로만 되어 있음.
  - [Minor] 기존 세션 "[야간] QA-V1-Test job instruction cyc..." 테스트 데이터가 노출.

### Step 4: 에이전트 (23-app-agents.png)
- **첫인상**: "Agents Ecosystem / 1 ACTIVE / Total: 4" 헤더. 카드형 에이전트 목록(비서실장, 개발팀장 등). 검색, 부서 필터, 활성/전체/비활성 탭.
- **알기 쉬운가**: O -- 카드 디자인이 매력적이고 상태가 명확
- **이슈**:
  - [Minor] "에이전트 생성" 버튼이 눈에 잘 들어옴(좋음). 하지만 카드에 표시되는 정보가 다소 부족 -- 각 에이전트가 무엇을 할 수 있는지 요약이 없음.

### Step 5: 부서 (24-app-departments.png)
- **첫인상**: "ORGANIZATION OVERSIGHT / 6 Departments" + "Create Department" 버튼. 2x2 카드 그리드(개발팀, 마케팅팀, 재무팀, 경영지원실).
- **알기 쉬운가**: O -- 부서 카드가 깔끔하고 상태(OPERATIONAL/INACTIVE)가 명확
- **이슈**:
  - [Minor] "BUDGET --" 표시가 모든 카드에 있는데 실제 데이터 없음. "--"보다 "미설정" 등이 더 명확.

### Step 6: 지식 라이브러리 (25-app-knowledge.png)
- **첫인상**: "Library / Knowledge documents & agent memories" 헤더. 문서 탭과 에이전트 기억 탭. 검색 유형(혼합, 의미, 키워드) 필터.
- **알기 쉬운가**: O -- 문서 관리 UI가 직관적
- **이슈**:
  - [Minor] 헤더 영역에 "Library"와 "CORTHEX Knowledge"가 이중으로 표시됨. 두 개의 네비게이션 바가 겹쳐 보이는 느낌.
  - [Minor] "1 Files" 표시 -- 문법 오류. "1 File" 또는 "파일 1개"가 맞음.

### Step 7: 잡 매니저 (26-app-jobs.png)
- **첫인상**: "System > Jobs Manager [01]" 브레드크럼. 4개 KPI(완료된 작업 01, 실행 중 00, 활성 스케줄 01, 오류 알림 00). 야간 작업/반복 스케줄/ARGOS 트리거 탭.
- **알기 쉬운가**: O -- 잡 관리 인터페이스가 체계적
- **이슈**:
  - [Minor] "Export Logs" 버튼이 "Create Job"과 같은 행에 있는데, 둘의 중요도가 다름. Create가 primary이고 Export는 secondary여야 함.

### Step 8: 설정 (27-app-settings.png)
- **첫인상**: "SYSTEM / CONFIGURATION" 헤더. 8개 탭(일반, 테마, 알림설정, 허브, API연동, 텔레그램, 소울편집, MCP연동).
- **알기 쉬운가**: O -- 탭 구조가 잘 정리되어 있음
- **이슈**:
  - [Minor] 탭 8개가 한 줄에 있어 작은 화면에서 잘릴 수 있음. 스크롤 가능한지 확인 필요.
  - [Minor] "MCP 연동" 탭 -- CEO가 "MCP"가 뭔지 모를 가능성 높음.

### Step 9: 비용 분석 (28-app-costs.png)
- **첫인상**: "COST ANALYTICS / Operational Expenditure" 제목. 깔끔한 KPI 카드(이번 달 비용, Top Model, Daily Avg, Budget 대비).
- **알기 쉬운가**: O -- 비용 데이터가 명확하고 필터(7d, 30d, 90d)와 Export 기능 제공
- **이슈**:
  - [Minor] 모든 값이 $0.00인데 "Updated 30d ago" 표시. 실제 사용이 없는 상태인지 데이터 수집 문제인지 불분명.

### Step 10: 트레이딩 (29-app-trading.png)
- **첫인상**: "트레이딩 / Trading" 이중 표시. BTC/USD 차트 $67,432.50 (+2.34%). 캔들/라인/영역 차트 옵션. 시간대 필터(1분~1일).
- **알기 쉬운가**: O -- 트레이딩 UI가 전문적이고 차트가 인상적
- **이슈**:
  - [Minor] "TERMINAL_STABLE_V3.0.4 // SESSION_ACTIVE" 장식 텍스트가 유용한 정보 없이 화면 공간 차지.
  - [Minor] "시장 개장 Market Open" 이중 언어 표시 -- 한국어만으로 충분.

### Step 11: 알림 센터 (30-app-notifications.png)
- **첫인상**: "NOTIFICATION CENTER / CORTHEX System Alerts & Updates". All/Tasks/System 탭 + All/Unread 필터. 검색 가능.
- **알기 쉬운가**: O -- 알림 UI가 깔끔하고 카테고리별 분류가 유용
- **이슈**:
  - [Minor] "ACTIVE STREAM / 2 RECORDS FOUND" 라벨이 기술적. "새 알림 2건" 정도가 자연스러움.
  - [Minor] HANDOFF/AGENT 뱃지가 영어로만 표시.

---

## Journey 3: Mobile (390x844)

### Hub (40-mobile-hub.png)
- **첫인상**: 좌측 네비게이션이 전체 화면을 차지. 우측에 Process Delegation 패널이 겹쳐서 보임.
- **사용성**: X
- **이슈**:
  - [Critical] **허브 페이지 모바일 레이아웃 문제**: 3-컬럼 레이아웃이 모바일에서 제대로 반응하지 않음. 좌측 사이드바와 우측 Process Delegation 패널이 동시에 보이면서 중앙 채팅 영역이 완전히 가려짐. 메시지 입력 영역이 보이지 않아 실제 사용 불가.

### Chat (41-mobile-chat.png)
- **첫인상**: 채팅 UI가 모바일에 잘 적응. 뒤로가기 화살표, 에이전트 이름, 온라인 상태가 상단에. 메시지 입력이 하단 고정.
- **사용성**: O -- 메시지 기반 UI라 모바일에 자연스러움
- **이슈**: 없음. 잘 작동함.

### Agents (42-mobile-agents.png)
- **첫인상**: "에이전트 생성" 버튼이 full-width로 눈에 잘 들어옴. 에이전트 카드가 세로로 잘 쌓임.
- **사용성**: O -- 카드형 레이아웃이 모바일에 적합
- **이슈**:
  - [Minor] 검색 필드와 필터가 상단에 있어 화면을 많이 차지. 접을 수 있는 필터 UI가 더 적합.

---

## UX 이슈 종합 (우선순위별)

| # | 심각도 | 위치 | 이슈 설명 | 추천 수정 |
|---|--------|------|-----------|-----------|
| 1 | Critical | Admin 사이드바 | 메뉴 항목 20+개, 카테고리 그룹핑 없음 | 조직관리/AI관리/시스템/마켓 등 4~5개 그룹으로 접이식 메뉴 적용 |
| 2 | Critical | Admin 전체 | 변수명 스타일 라벨(TOTAL_ENTITIES, USERS_ACTIVE, SEARCH_REGISTRY 등)이 UI에 노출 | 전체 라벨을 한국어 사용자 친화적으로 변경 |
| 3 | Critical | App Hub (모바일) | 3-컬럼 레이아웃이 모바일에서 깨짐, 중앙 채팅 영역 사용 불가 | 모바일에서 사이드바를 숨기고 단일 컬럼 레이아웃 적용 |
| 4 | Major | App 대시보드 | "SYSTEM: OFFLINE" 표시 + "Departments 00" 데이터 불일치 | 실제 시스템 상태 반영, 부서 카운트 수정 |
| 5 | Major | Admin 대시보드 | USERS_ACTIVE, AGENTS_ONLINE 등 변수명이 Health Status에 노출 | "활성 사용자 50%", "온라인 에이전트 17%" 등으로 변환 |
| 6 | Major | Admin 회사관리 | "Initialize Node", "infrastructure allocation" 등 인프라 용어 | "새 회사 추가", "회사 정보를 입력하세요" 등으로 변경 |
| 7 | Major | Admin 에이전트 | 변수명 스타일 라벨 반복(TOTAL_AGENTS, NEW_AGENT 등) | 한국어 라벨 적용 |
| 8 | Major | Admin 비용관리 | "TERMINAL_ID: 0x882A_COST" 가짜 터미널 ID 노출 | 장식 제거 또는 실제 의미 있는 정보로 대체 |
| 9 | Major | App Hub | "Reconnecting..." 상태 + "API: /api/workspace/hub/stream" 디버그 정보 노출 | 재연결 로직 안정화, 디버그 정보 제거 |
| 10 | Major | 소울 템플릿 | 개념 설명 부재, CEO가 용도를 이해할 수 없음 | 설명 텍스트 추가: "에이전트의 성격과 행동 패턴을 정의합니다" |
| 11 | Minor | Admin 로그인 | 버튼/푸터 겹침, 장식 버전 번호와 실제 버전 불일치 | 레이아웃 수정, 장식 제거 또는 실제 버전 표시 |
| 12 | Minor | Admin 전체 | 영어/한국어 혼재 (영어 라벨 + 한국어 데이터) | 일관된 한국어 인터페이스로 통일 |
| 13 | Minor | Admin 전체 | QA/E2E 테스트 데이터가 프로덕션에 노출 | 시드 데이터 정리 |
| 14 | Minor | Admin 도구관리 | Permission Matrix 가로 스크롤 + 도구명 잘림 | 반응형 테이블 또는 체크 매트릭스 UI 개선 |
| 15 | Minor | App 지식라이브러리 | 헤더 이중 표시, "1 Files" 문법 오류 | 중복 헤더 제거, 문법 수정 |
| 16 | Minor | App 설정 | "MCP 연동" 용어 비개발자에게 생소 | 도움말 툴팁 추가 또는 "외부 도구 연동"으로 변경 |
| 17 | Minor | Admin 모니터링 | RAM 102.6% 경고 표시 부재 | 임계치 초과 시 빨간색 경고 표시 |
| 18 | Minor | App 트레이딩 | 이중 언어 표시, 장식 텍스트 | 한국어 단일 또는 깔끔한 이중 표시로 통일 |
| 19 | Minor | Admin 온보딩 | "CLI Token" 비개발자에게 생소한 스텝명 | "시스템 연동" 또는 "API 설정"으로 변경 |

---

## 좋은 점 (칭찬할 것)

1. **일관된 디자인 시스템**: 골드+블랙+다크 테마가 Admin과 App 전체에 일관되게 적용. "Sovereign Sage" 디자인 토큰이 제대로 작동하고 있음. 시각적 아이덴티티가 강력함.

2. **채팅 UX가 핵심 강점**: Chat 페이지(22)는 이 제품의 킬러 피처. 에이전트와의 대화가 자연스럽고, 세션 관리가 깔끔하며, 모바일에서도 완벽하게 작동. "비서실장과(와) 대화를 시작하세요" 같은 한국어 안내가 친근함.

3. **Hub의 예시 명령 버튼**: "오늘 뉴스 브리핑해줘", "@CMO 이번 주 마케팅 보고서" 같은 예시 명령이 신규 사용자의 진입 장벽을 크게 낮춤. 이것은 정말 잘 만든 온보딩 패턴.

4. **NEXUS 조직도**: 그래프 시각화가 인상적. 조직 구조를 한눈에 파악할 수 있어 CEO에게 매우 유용한 기능.

5. **App 에이전트 카드 UI**: 카드형 디자인이 에이전트를 "사람"처럼 느끼게 해줌. 아바타, 역할, 상태가 깔끔하게 표시됨.

6. **잡 매니저의 체계적 구조**: 야간 작업/반복 스케줄/ARGOS 트리거 탭 분류가 매우 실용적.

7. **온보딩 마법사**: 5단계 진행 표시줄이 신규 사용자를 안내하기에 좋은 구조.

8. **모바일 Chat & Agents**: 채팅과 에이전트 페이지는 모바일에서 완벽하게 반응. 특히 채팅은 네이티브 앱 수준.

9. **트레이딩 차트**: BTC/USD 실시간 차트가 전문적. 캔들/라인/영역 옵션과 시간대 필터가 트레이딩 앱 수준.

10. **알림 센터의 카테고리 분류**: All/Tasks/System + All/Unread 이중 필터가 실용적.

---

## 결론 및 추천

### 핵심 문제: "누구를 위한 제품인가?"

현재 CORTHEX의 가장 큰 UX 문제는 **타깃 사용자(비개발자 CEO)와 인터페이스 언어의 불일치**다. Admin 패널 전체에 걸쳐 `TOTAL_ENTITIES`, `SEARCH_REGISTRY`, `FILTER_TIER` 같은 프로그래밍 변수명이 UI 라벨로 사용되고 있다. 이것은 개발자가 보기엔 멋지지만, CEO가 보기엔 의미를 알 수 없는 코드다.

### 3가지 최우선 개선사항

1. **Admin 사이드바 카테고리화** (영향도: 높음, 난이도: 중)
   - 20+ 메뉴를 5개 그룹으로 묶기: 조직(회사/직원/부서/보고라인), AI(에이전트/도구/소울), 운영(비용/모니터링/잡), 연동(API키/자격증명/n8n/MCP), 마켓(템플릿/에이전트)
   - 접이식 메뉴로 네비게이션 부담 감소

2. **변수명 라벨 -> 한국어 라벨 전환** (영향도: 높음, 난이도: 낮음)
   - 전체 Admin의 SCREAMING_SNAKE_CASE 라벨을 한국어로 변환
   - "TOTAL_ENTITIES" -> "총 회사 수", "NEW_AGENT" -> "+ 에이전트 추가"
   - 장식용 "TERMINAL_ID: 0x882A_COST" 등 가짜 기술 정보 제거

3. **Hub 모바일 레이아웃 수정** (영향도: 높음, 난이도: 중)
   - 390px 뷰에서 3-컬럼이 깨지는 문제 수정
   - 모바일에서는 채팅 영역만 전체 화면으로 표시

### 총평

CORTHEX v2는 **기능적으로 인상적인 AI 가상 오피스 플랫폼**이다. 에이전트와의 채팅, 조직 관리, 도구 권한 매트릭스, 비용 분석 등 핵심 기능이 모두 구현되어 있고 실제로 작동한다. 시각적 디자인도 독특하고 일관성이 있다.

하지만 **"멋진 사이버펑크 터미널"과 "CEO가 쉽게 쓸 수 있는 관리 도구" 사이에서 균형을 잡지 못하고 있다.** 밀리터리 테마의 장식 텍스트와 변수명 라벨이 분위기를 만들어주지만, 동시에 사용성을 떨어뜨린다. 이 두 가지를 양립시키려면: 테마는 유지하되, **모든 라벨과 안내문은 평이한 한국어**로, **장식 텍스트는 의미 없는 기술 코드 대신 분위기 있는 한국어 문구**로 교체하는 것을 추천한다.

현재 상태로도 기능적으로 사용 가능하지만, 위의 3가지 개선만 적용하면 **8/10 수준의 UX**로 끌어올릴 수 있다.
