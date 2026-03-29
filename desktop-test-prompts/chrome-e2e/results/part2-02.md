# Part 2-02: 대시보드 + NEXUS 결과

## 테스트 환경
- 일시: 2026-03-30 22:10 ~ 22:18
- 브라우저: Chrome (claude-in-chrome MCP)
- 해상도: 1529x804
- OS: Windows 11 Home
- 계정: CEO (대표님 / User, #935 · 45e010b)

---

## 단계별 결과

| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | 대시보드 로딩 (로딩 스피너 후 데이터 표시) | PASS | /dashboard | ~2s | "Welcome, Commander" + "SYSTEM: OFFLINE" + 4개 스탯 카드 즉시 렌더링 (ss_2976sltsx에서 확인) |
| 2 | 위젯/카드 확인 | PASS | /dashboard | — | 전체 위젯 확인: ① Active Agents 00/ONLINE ② Departments 00/STABLE ③ Pending Jobs 000/IDLE ④ Total Costs $0/MTD ⑤ Active Units 테이블 + 페이지네이션(1,2) ⑥ Live Event Stream ("Waiting for events...") ⑦ System Health Matrix (CPU 0.0%, Neural Memory Banks 0.0%, Nexus Throughput 0.0%) ⑧ Cost Trend ($0.00 MTD) ⑨ Departmental Load ("No department data") ⑩ Task Status (0 TOTAL 도넛차트) ⑪ Recent Tasks (COMPLETED 0, IN PROGRESS 0, FAILED 0) ⑫ Quick Actions 3개 (New Conversation, Create Workflow, Weekly Report) — (ss_2976sltsx, ss_0296uopv8, ss_2096wjjfn에서 확인) |
| 3 | 스크린샷 저장 | PASS | /dashboard | — | ss_2976sltsx (상단), ss_0296uopv8 (중단), ss_2096wjjfn (하단) |
| 4 | NEXUS 페이지 로딩 | PASS | /nexus | ~1s | "CORTHEX NEXUS — AGENT TOPOLOGY CANVAS V2.4.0" 제목 표시, "조직이 구성되지 않았습니다" 안내 + "Initialize Workspace" 버튼 정상 렌더링 (ss_1298igvd0에서 확인) |
| 5 | 조직도/워크플로우 시각화 확인 | N/A | /nexus | — | 부서·에이전트 0건 상태이므로 조직도 대신 빈 상태 안내 표시 — 정상 동작 |
| 6 | 노드 클릭 → 상세 정보 표시 확인 | N/A | /nexus | — | 조직 미구성 상태이므로 노드 없음 — 테스트 불가 (정상) |
| 7 | 스크린샷 저장 | PASS | /nexus | — | ss_1298igvd0, ss_6961p7ral |

---

## 발견된 버그

### BUG-001: 대시보드 헤더 "SYSTEM: OFFLINE" vs Active Agents 카드 배지 "ONLINE" 불일치
- **페이지 URL**: https://corthex-hq.com/dashboard
- **재현 단계**:
  1. CEO 계정으로 로그인 후 /dashboard 접속
  2. 페이지 상단 "Welcome, Commander" 아래 → `● SYSTEM: OFFLINE` (빨간 점)
  3. Active Agents 카드 우측 상단 배지 → `ONLINE` (초록)
- **기대 결과**: 시스템 상태가 일관되게 표시 (둘 다 ONLINE이거나 둘 다 OFFLINE)
- **실제 결과**: 헤더는 OFFLINE, 카드 배지는 ONLINE → 상태 모순
- **콘솔 에러**: 없음
- **스크린샷**: ss_2976sltsx
- **심각도**: Minor
- **추정 원인**: 헤더는 WebSocket 실시간 연결 상태를, 카드 배지는 REST API 결과(에이전트 상태 라벨)를 별도로 반영. WebSocket 미연결 시 헤더만 OFFLINE 표시.

### BUG-002: NEXUS "Initialize Workspace" 버튼 클릭 시 Admin 페이지가 새 탭에서 열림
- **페이지 URL**: https://corthex-hq.com/nexus
- **재현 단계**:
  1. /nexus 접속
  2. "Initialize Workspace" 버튼 클릭
  3. 새 탭에서 /admin/departments 가 열림 (CEO 앱 탭은 변경 없음)
- **기대 결과**: CEO 사용자에게 적절한 안내 또는 같은 탭 내 이동 (CEO는 admin 페이지에 접근할 수 없으므로 admin 링크는 부적절)
- **실제 결과**: Admin 부서 관리 페이지가 새 탭에서 열림 — CEO 사용자는 admin 권한이 없을 수 있어 혼란 유발
- **콘솔 에러**: 없음
- **스크린샷**: ss_6961p7ral (클릭 후 NEXUS 탭 변화 없음, 탭 목록에서 새 admin/departments 탭 748487899 생성 확인)
- **심각도**: Minor
- **추정 원인**: "Initialize Workspace" 버튼이 `window.open('/admin/departments')` 등으로 하드코딩되어 있어, CEO 앱에서도 Admin URL로 이동

### BUG-003: 대시보드 Live Event Stream 입력 필드 무반응
- **페이지 URL**: https://corthex-hq.com/dashboard
- **재현 단계**:
  1. /dashboard 하단 Live Event Stream 영역의 "Waiting for input..." 입력 필드 클릭
  2. "test input" 타이핑
  3. 화면에 변화 없음 — 입력 텍스트 미표시, 커서 미활성
- **기대 결과**: 입력 필드가 포커스되고 타이핑 내용이 표시되거나, 비활성 상태라면 disabled 스타일이 명확해야 함
- **실제 결과**: 입력 필드처럼 보이지만 반응 없음 — 사용자가 클릭해도 피드백 없음
- **콘솔 에러**: 없음
- **스크린샷**: ss_6597crdch (타이핑 후에도 변화 없음)
- **심각도**: Cosmetic
- **추정 원인**: WebSocket 미연결(SYSTEM: OFFLINE) 상태에서 입력 필드가 기능적으로 비활성이지만, 시각적으로 disabled 상태가 명확하지 않음

---

## UX 탐색 발견사항 (8건 시도)

| # | 탐색 요소 | URL | 결과 상세 |
|---|----------|-----|----------|
| 1 | **"VIEW FULL ROSTER" 링크 클릭** | /dashboard → /agents | PASS — /agents 페이지로 정상 이동, 에이전트 목록 표시 (ss_2976sltsx에서 링크 확인, 클릭 후 URL 변경 확인) |
| 2 | **페이지네이션 "2" 버튼 클릭** | /dashboard | PASS — 버튼 클릭 반응함, 에이전트 0건이므로 "No active agents" 유지 — 빈 상태에서 페이지네이션 존재는 약간 혼란스러움 (ss_4122tsgtm에서 확인) |
| 3 | **Active Agents 스탯 카드 클릭** | /dashboard | 변화 없음 — 카드는 클릭 가능한 링크가 아님. 호버 시 커서 변경 없음 |
| 4 | **Departments 스탯 카드 클릭** | /dashboard | 변화 없음 — 동일하게 비클릭 요소 |
| 5 | **Live Event Stream "Waiting for input..." 필드 클릭+타이핑** | /dashboard | FAIL — 입력 무반응 (BUG-003으로 기록) |
| 6 | **NEXUS "Initialize Workspace" 버튼 클릭** | /nexus | 새 탭에서 /admin/departments 열림 — CEO 사용자에게 admin 링크는 부적절 (BUG-002로 기록) |
| 7 | **스탯 카드 호버 테스트** (Active Agents, Departments, Pending Jobs, Total Costs) | /dashboard | 호버 시 시각적 피드백 없음 — 카드는 정보 표시용으로 인터랙션 없음 |
| 8 | **System Health Matrix 프로그레스 바 확인** | /dashboard | 3개 바 모두 0.0% 표시, 하단에 BUDGET/DONE/AGENTS 레이블 표시 — 에이전트 없는 상태에서 정상 |

---

## 접근성 / 반응성 관찰
- **탭 키 네비게이션**: 미테스트
- **로딩 속도 체감**: 대시보드 빠름(~2s), NEXUS 즉시 로딩(~1s)
- **레이아웃 깨짐**: 없음 — 대시보드 전 위젯 12개 정상 배치, 스크롤 시 순서 일관
- **콘솔 에러**: 없음 (콘솔 트래킹 시작 이후 에러 미발생)
- **네트워크 에러**: 없음
- **UX 관찰**:
  - Active Units 테이블에 데이터 0건인데 페이지네이션(1, 2)이 표시되는 것은 약간 혼란스러움
  - "SYSTEM: OFFLINE" 빨간 점이 눈에 띄지만 모든 기능은 정상 작동 중 — OFFLINE의 의미가 불명확
  - Departmental Load "No department data" — 빈 상태 메시지 적절함
  - Quick Actions 3개 카드 (New Conversation, Create Workflow, Weekly Report) — 진입점으로 유용

---

## 요약
- 총 단계: 7
- PASS: 5 (단계 1, 2, 3, 4, 7)
- N/A: 2 (단계 5, 6 — 조직 미구성 상태로 테스트 불가)
- FAIL: 0
- 버그: 3건 (BUG-001: 상태 불일치 **Minor**, BUG-002: NEXUS Initialize 버튼 admin 링크 **Minor**, BUG-003: 이벤트 스트림 입력 무반응 **Cosmetic**)
- UX 탐색: 8건 시도 (6 정상, 2 이슈 발견)
- 스크린샷: ss_2976sltsx, ss_0296uopv8, ss_2096wjjfn, ss_1745qnxks, ss_1298igvd0, ss_6961p7ral, ss_8161chk9a, ss_4122tsgtm, ss_6597crdch
