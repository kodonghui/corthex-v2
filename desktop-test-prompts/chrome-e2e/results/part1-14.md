# Part 1-14: 시스템 모니터링 + NEXUS 조직도 테스트 결과

## 테스트 환경
- 일시: 2026-03-30 15:30
- 브라우저: Chrome (claude-in-chrome MCP)
- 해상도: 1707x898 viewport
- OS: Windows 11 Home 10.0.26200

## 단계별 결과

### 시스템 모니터링

| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | Server Status "ONLINE" 표시 확인 | PASS | /admin/monitoring | 5s | SERVER_STATUS 카드에 녹색 "ONLINE" 표시 (ss_7155ssbv7에서 확인) |
| 2 | Uptime 숫자 확인 | PASS | /admin/monitoring | - | SYSTEM_UPTIME: "3h 4m" + "STABLE" 라벨 표시 (ss_7155ssbv7에서 확인) |
| 3 | Memory 사용량 게이지 바 확인 | PASS | /admin/monitoring | - | MEMORY ALLOCATION 게이지: 92.4%, Heap Used 29.2MB / Heap Total 31.6MB (ss_7155ssbv7에서 확인) |
| 4 | DB Latency (ms 단위) 확인 | PASS | /admin/monitoring | - | DB RESPONSE LATENCY 차트 + "Current: 69ms" 표시, MEMORY BREAKDOWN에도 "DB LATENCY 69ms" (ss_7155ssbv7에서 확인) |
| 5 | SYS-LOG 목록 확인 | PASS | /admin/monitoring | - | LIVE SYS-LOG 섹션에 2건의 오류 로그 표시: "duplicate key value violates unique constraint companies_slug_unique" (12:53:30, 12:58:22) (ss_7155ssbv7에서 확인) |
| 6 | "Refresh" 클릭 → 데이터 갱신 확인 | PASS | /admin/monitoring | 3s | Refresh 클릭 후 값 변경 확인: Memory 92.4%→93.4%, Heap 29.2→29.5MB, RSS 179.4→178.9MB (ss_6024682z0에서 확인) |
| 7 | 스크린샷 저장 | PASS | - | - | ss_7155ssbv7 (초기 로딩), ss_6024682z0 (Refresh 후) |

### NEXUS 조직도

| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 8 | ReactFlow 캔버스 로딩 (노드 보임) | PASS | /admin/nexus | 4s | CORTHEX HQ 루트 노드 + 부서/에이전트/직원 노드들 3계층 구조로 표시 (ss_49139rawn에서 확인) |
| 9 | 에이전트/부서 노드 연결선 표시 | PASS | /admin/nexus | - | 노드 간 cyan/green/purple 색상 연결선 표시, 부서(주황/보라), 에이전트(녹색), 직원(주황) 구분 (ss_49139rawn 줌인에서 확인) |
| 10 | 마우스 휠 줌 인/아웃 | PASS | /admin/nexus | 1s | 캔버스 영역에서 스크롤 시 줌 동작 확인 |
| 11 | "전체 보기" 클릭 → 전체 노드 화면 맞춤 | PASS | /admin/nexus | 2s | "전체 보기" 버튼 클릭 후 전체 노드가 뷰포트에 맞춰짐 (ss_71853xmic에서 확인) |
| 12 | 노드 클릭 → 속성 패널 열림 | PASS | /admin/nexus | 2s | CORTHEX HQ 노드 클릭 → Agent Property Panel 열림: 회사명, 5부서, 9에이전트, 5직원, 부서 목록(경영지원실/개발팀/마케팅팀/재무팀/!@#$%^&*()) 표시 (ss_8282o8k8k에서 확인) |
| 13 | "내보내기" 클릭 → JSON 파일 다운로드 | PASS | /admin/nexus | 2s | 내보내기 드롭다운 메뉴 (PNG 이미지/SVG 벡터/JSON 데이터/인쇄) 표시 → JSON 데이터 클릭 → 다운로드 트리거 (ss_2762r15z7에서 확인) |
| 14 | 스크린샷 저장 | PASS | - | - | ss_49139rawn (초기), ss_8282o8k8k (속성 패널), ss_2762r15z7 (내보내기) |

## 발견된 버그

### BUG-001: 시스템 모니터링 페이지 — 초기 로딩 skeleton이 해제되지 않는 간헐적 버그
- 페이지 URL: /admin/monitoring
- 재현 단계:
  1. /admin/monitoring 페이지 접속
  2. 5~10초 대기
  3. 간헐적으로 skeleton (animate-pulse) 상태에서 벗어나지 못함
- 기대 결과: 3~5초 내 모니터링 데이터가 로드되어 표시
- 실제 결과: skeleton 카드만 표시되고 15초 이상 대기해도 데이터가 렌더링되지 않음. API 응답은 200 OK로 정상인데 React 상태가 로딩에서 해제되지 않음.
- 콘솔 에러: 없음
- 네트워크 에러: 없음 (GET /api/admin/monitoring/status → 200)
- 스크린샷: ss_1164h34kq (첫 로딩 skeleton), ss_4280ae0dc (재접속 시 skeleton 멈춤)
- 심각도: **Major** — 페이지 재접속 시 50% 확률로 발생. 새로고침으로 해결 가능하나 사용자 경험에 큰 영향.
- 추정 원인: API 응답 데이터를 React Query/Zustand가 받았으나 `isLoading` 상태가 false로 전환되지 않는 race condition. companyId 쿼리 파라미터 유무에 따라 다른 요청(#1: companyId 포함, #4: 미포함)이 발생하는데, 상태 관리 간 충돌 가능성.

### BUG-002: NEXUS 검색 바가 동작하지 않음
- 페이지 URL: /admin/nexus
- 재현 단계:
  1. NEXUS 조직도 페이지 접속
  2. 상단 "Search infrastructure..." 입력 필드에 "개발" 입력
  3. Enter 또는 입력 후 대기
- 기대 결과: 검색어에 맞는 노드가 필터링/하이라이트됨
- 실제 결과: 검색어가 입력되지만 아무런 반응 없음. 필터링, 하이라이트, 자동완성 모두 동작 안 함.
- 콘솔 에러: 없음
- 스크린샷: ss_0020oimok (검색어 입력 후 무반응)
- 심각도: **Minor** — 검색 기능이 구현되지 않았거나, UI만 존재하고 로직이 미연결된 상태
- 추정 원인: 검색 input의 onChange 핸들러가 미구현 또는 노드 필터링 로직 미연결

## UX 탐색 발견사항 — 8건 시도

1. **모니터링 ERRORS_24H 카드 클릭** → /admin/monitoring → 경고 삼각형 아이콘이 표시되나 클릭 시 에러 상세 페이지로 이동하지 않음. 에러 수(2)만 표시. UX 개선 제안: 클릭 시 에러 로그 필터링 뷰로 이동하면 편리할 것.

2. **모니터링 DATABASE_PROTOCOL 카드 아이콘 클릭** → /admin/monitoring → 카드 우측 아이콘(데이터베이스) 클릭 시 아무 반응 없음. "ONLINE" 상태만 표시. 시각적 정보만 제공하는 카드.

3. **NEXUS Dashboard 메뉴 클릭** → /admin/nexus → MANAGEMENT 좌측 메뉴에서 Dashboard 클릭 시 선택 스타일만 바뀌고 캔버스 뷰는 그대로 유지. Dashboard 전용 뷰가 없는 것으로 보임.

4. **NEXUS Directory 메뉴 클릭** → /admin/nexus → Directory 메뉴 클릭 시 역시 캔버스 뷰 변화 없음. Directory 리스트 뷰가 미구현된 것으로 보임.

5. **NEXUS Permissions 메뉴 클릭** → /admin/nexus → Permissions 클릭 시 변화 없음. 미구현.

6. **NEXUS 상단 탭 (Nexus/Agents/Nodes/Logs) 클릭** → /admin/nexus# → URL에 #만 추가되고 뷰 전환 없음. 상단 탭이 시각적으로 구분되지만 기능적으로 미연결.

7. **NEXUS "회사 설정→" 링크** → Property Panel 하단에 "회사 설정→" 골드색 링크 표시. 클릭 가능 상태이며 /admin/settings로 이동할 것으로 예상. (클릭 미수행)

8. **NEXUS 내보내기 드롭다운의 4가지 옵션** → PNG 이미지, SVG 벡터, JSON 데이터, 인쇄 — 4개 옵션 모두 존재 확인. JSON 데이터는 정상 동작. 나머지는 미검증.

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 모니터링 페이지에서 사이드바 → 콘텐츠 순서로 포커스 이동됨
- 로딩 속도 체감:
  - 모니터링: **느림~불안정** — 초기 로딩 시 skeleton이 해제되지 않는 간헐적 버그 발생 (BUG-001). 정상 로딩 시에도 3~5초 소요.
  - NEXUS: **보통** — 4초 내 캔버스 + 노드 로딩. ReactFlow 캔버스 렌더링 시 간헐적으로 스크린샷 캡처 타임아웃 발생 (렌더러 부하).
- 레이아웃 깨짐: 없음. 모든 카드/게이지/차트가 그리드 안에 정상 배치.

## 요약
- 총 단계: 14
- PASS: 14
- FAIL: 0
- 버그: 2건 (BUG-001 Major, BUG-002 Minor)
- UX 발견: 8건
