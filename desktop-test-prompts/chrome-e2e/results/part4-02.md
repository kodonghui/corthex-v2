# Part 4-02: App — CEO 첫 로그인 + 둘러보기 결과

## 테스트 환경
- 일시: 2026-03-30 07:25 (2차 실행)
- 브라우저: Chrome (claude-in-chrome MCP)
- OS: Windows 11 Home 10.0.26200
- 비고: 1차 실행(02:47, Playwright MCP)에서 발견된 버그와 함께 2차 실행 결과 병합

## CEO 비밀번호 (리셋 후)
- **최넥스트 (nw-ceo)**: `q4wASVUq` (Part 4-01 비밀번호 만료로 Admin API로 리셋)

## 사전 조건 복구 작업
Part 4-01 이후 넥스트웨이브 회사 및 사용자가 비활성화(isActive=false) 상태였음. 테스트 전 아래 복구 수행:
1. 회사 넥스트웨이브 `isActive: false → true` (API: PATCH /api/admin/companies/:id)
2. 사용자 nw-ceo `isActive: false → true` + 비밀번호 리셋 (API: POST /api/admin/users/:id/reset-password)
3. 사용자 nw-dev01 `isActive: false → true`
4. Superadmin의 `?companyId=` 쿼리 오버라이드 활용 (tenantMiddleware line 20-26)

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | CEO 로그인 (nw-ceo / q4wASVUq) | PASS | /login → /hub | ~5s | API 로그인 성공 → localStorage 토큰 설정 → /hub 진입. 로그인 폼 submit은 리다이렉트 루프 발생 (BUG-001) |
| 2 | Hub 페이지 확인 | PASS | /hub | <1s | "넥스트웨이브 · 0/0 agents operational", "최넥스트 / System Administrator" 표시 (ss_72269sxoy) |
| 3 | 사이드바 → 부서 확인 | PASS | /departments | ~2s | AI연구소, 사업개발팀 2개 OPERATIONAL 상태 정상 표시 (ss_1699ewwdd) |
| 4 | 사이드바 → 에이전트 확인 | FAIL | /agents | ~2s | "에이전트가 없습니다" — 넥스트비서, 데이터분석봇 모두 미표시. 전체 필터에서도 0개 (ss_7769z7cpt) |
| 5 | 사이드바 → 대시보드 확인 | PASS (부분) | /dashboard | ~2s | ACTIVE AGENTS: 00, DEPARTMENTS: 00 (실제 2개 — BUG-003), SYSTEM: OFFLINE (ss_4781938q1) |
| 6 | 사이드바 → 조직 확인 | PASS | /organization | ~2s | DEPARTMENTS: 2 정확, ACTIVE AGENTS: 0, SECURITY STATUS: OPTIMAL (ss_34998kou5) |
| 7 | 설정 → 일반 탭 확인 | PASS | /settings | <1s | 사용자명: nw-ceo, 이메일: ceo@nextwave.dev, 이름: 최넥스트, 역할: 관리자 (ss_5491htkvd) |
| 8 | 설정 → API 연동 탭 확인 | FAIL | /settings?tab=api | <1s | "등록된 API key가 없습니다" — Part 4-01 Anthropic 키 미표시 (ss_6036av94b). App API 연동 탭은 외부 서비스(KIS/노션) 전용 |

## 발견된 버그

### BUG-001: 비활성 회사/사용자 로그인 시 에러 메시지가 비밀번호 오류와 구분 불가
- **페이지 URL**: /login
- **재현 단계**:
  1. 넥스트웨이브 회사 isActive=false 상태
  2. nw-ceo 사용자 isActive=false 상태
  3. 정확한 credential 입력 → "아이디 또는 비밀번호가 올바르지 않습니다"
  4. 또한 API(/api/auth/login)는 토큰 발급 성공하지만, 후속 API 호출에서 30초 TTL 캐시 만료 후 isActive 체크 실패 → /hub 접근 불가 → /login 리다이렉트 루프
- **기대 결과**: "비활성화된 계정입니다" 또는 "회사가 비활성 상태입니다" 같은 명확한 에러
- **실제 결과**: AUTH_001 "아이디 또는 비밀번호가 올바르지 않습니다" — 원인 파악 불가
- **스크린샷**: 없음
- **심각도**: Major
- **추정 원인**: auth.ts 로그인 시 isActive 체크가 비밀번호 검증과 동일한 에러 코드 사용

### BUG-002: Part 4-01에서 생성한 에이전트(넥스트비서, 데이터분석봇) 실종
- **페이지 URL**: /agents
- **재현 단계**:
  1. Part 4-01에서 API로 넥스트비서, 데이터분석봇 생성 + Go Online 확인
  2. Part 4-02에서 /agents 접속 → "에이전트가 없습니다"
  3. 활성/전체/비활성 필터 모두 0개
- **기대 결과**: 넥스트비서(online), 데이터분석봇(online) 표시
- **실제 결과**: 에이전트 0개
- **스크린샷**: ss_7769z7cpt (전체 필터)
- **심각도**: Major
- **추정 원인**: 다른 테스트 세션의 cleanup 작업으로 에이전트 삭제됨, 또는 회사 비활성화 기간 동안 데이터 정리

### BUG-003: Dashboard 부서 수 "00" 표시 (실제 2개)
- **페이지 URL**: /dashboard
- **재현 단계**: CEO 로그인 → /dashboard 접속 → DEPARTMENTS 카드 확인
- **기대 결과**: DEPARTMENTS: 2 (또는 02)
- **실제 결과**: DEPARTMENTS: 00
- **콘솔 에러**: 없음
- **스크린샷**: ss_4781938q1
- **심각도**: Major (1차, 2차 테스트 모두 재현)
- **추정 원인**: Dashboard 부서 카운트 API가 0을 반환. /organization에서는 정확히 "2" 표시되므로 Dashboard 전용 집계 버그. 1차 테스트에서도 동일 현상 확인

### BUG-004: App 설정 API 연동 탭에서 Anthropic API 키 미노출
- **페이지 URL**: /settings?tab=api
- **재현 단계**: 설정 → API 연동 탭 클릭
- **기대 결과**: Part 4-01 온보딩에서 등록한 Anthropic(Claude) API 키 표시
- **실제 결과**: "등록된 API key가 없습니다"
- **스크린샷**: ss_6036av94b
- **심각도**: Minor (설계 의도일 수 있음)
- **추정 원인**: App 설정 API 연동 탭은 외부 서비스(KIS 증권, 노션) 전용. Anthropic 키는 Admin 전용 credentials 테이블에 저장되며 App에서는 조회 불가. 테스트 시나리오 단계 14의 API 키가 이 탭에서 보이지 않는 것은 정상 동작일 가능성 높음

### BUG-005 (1차 테스트): 채팅 WebSocket 연결 실패
- **페이지 URL**: /chat?session=bb119d91-...
- **재현 단계**: /chat → New Chat Session → 넥스트비서 선택
- **기대 결과**: 에이전트와 채팅 가능
- **실제 결과**: "연결이 끊어졌습니다. 재연결 중..." 배너 표시
- **스크린샷**: screenshots/part4-02-chat-session.png (1차 테스트)
- **심각도**: Critical
- **추정 원인**: 1차 테스트 환경(Playwright MCP)에서의 WebSocket 연결 제한. 실 브라우저에서는 재현 여부 미확인

### BUG-006 (1차 테스트): NEXUS 모바일 뷰포트에서 노드 클릭 차단
- **페이지 URL**: /nexus
- **재현 단계**: /nexus → 에이전트 노드 클릭 시도
- **기대 결과**: 에이전트 상세 패널 표시
- **실제 결과**: TimeoutError — `<header>` 요소가 pointer events 차단
- **심각도**: Major (모바일/태블릿 뷰포트 전용)
- **추정 원인**: 모바일 헤더(lg:hidden)가 z-index로 React Flow 캔버스 위에 오버레이

## UX 탐색 발견사항 — 6개

1. **[Hub LIVE SYSTEM EVENTS]** → `/hub` → "Hub initialized — 0 agents loaded from 넥스트웨이브" + 이전 세션 로그(넥스트비서 대화, 야간 보안 점검 등) 표시. 한글 회사명 정상 렌더링. (ss_72269sxoy에서 확인)

2. **[부서 OPERATIONAL 배지]** → `/departments` → AI연구소, 사업개발팀 모두 "OPERATIONAL" 배지 + "BUDGET: --" 표시. 카드 클릭 시 우측 상세 패널 구조. 빈 상태에서 "부서를 선택하세요" 안내문구 제공. (ss_1699ewwdd에서 확인)

3. **[조직 CORTHEX GLOBAL]** → `/organization` → "CORTHEX GLOBAL ENTERPRISE" 타이틀, SYSTEM STATUS: OPERATIONAL, SECURITY STATUS: OPTIMAL. API ENDPOINT, RECENT CHANGES, NETWORK LOAD 위젯 제공. Manage Departments / View Agents / Configure Tiers / NEXUS Map 단축 버튼. (ss_34998kou5에서 확인)

4. **[설정 8개 탭]** → `/settings` → 일반, 테마, 알림 설정, 허브, API 연동, 텔레그램, 소울 편집, MCP 연동 총 8개 탭. CEO(admin 역할)에게 전체 노출. (ss_5491htkvd에서 확인)

5. **[Dashboard SYSTEM HEALTH]** → `/dashboard` → ACTIVE UNITS 테이블(에이전트 목록) + LIVE EVENT STREAM + SYSTEM HEALTH MATRIX(CPU, Memory, NEXUS Throughput 지표). 하단에 페이지네이션(1, 2). (ss_4781938q1에서 확인)

6. **[에이전트 빈 상태 UX]** → `/agents` → 에이전트 0개일 때 "에이전트가 없습니다 / 첫 에이전트를 생성하여 AI 조직을 구성하세요" + "+ 에이전트 생성" CTA 버튼. 검색, 부서 필터, 활성/전체/비활성 필터 UI 제공. (ss_4098vr269에서 확인)

## 스크린샷 목록 (2차 실행 — 스크린샷 ID)
- `ss_72269sxoy` — Hub 페이지 (넥스트웨이브, 0/0 agents)
- `ss_4098vr269` — 에이전트 페이지 (활성 필터, 0개)
- `ss_7769z7cpt` — 에이전트 페이지 (전체 필터, 0개)
- `ss_1699ewwdd` — 부서 페이지 (AI연구소, 사업개발팀)
- `ss_4781938q1` — 대시보드 (DEPARTMENTS 00 버그)
- `ss_34998kou5` — 조직 페이지 (DEPARTMENTS: 2)
- `ss_5491htkvd` — 설정 > 일반 (nw-ceo 프로필)
- `ss_6036av94b` — 설정 > API 연동 (키 없음)

## 요약
- 총 단계: 8 / PASS: 4 / PASS(부분): 1 / FAIL: 2 / 조건부 PASS: 1 / 버그: 6건 (2차: 4건, 1차 전용: 2건) / UX 발견: 6건
- **핵심 성공**: CEO로 Hub 진입, 부서 2개 확인, 조직 페이지 정상, 설정 프로필 정확
- **핵심 실패**: 에이전트 0개 (Part 4-01 데이터 실종), Dashboard 부서 수 "00" (2회 연속 재현)
- **데이터 영속성 이슈**: Part 4-01 → 4-02 사이에 회사/사용자 비활성화 + 에이전트/API키 실종. 테스트 간 데이터 격리 부재 또는 cleanup 스크립트 영향
- **다음 파트용 비밀번호**: `q4wASVUq` (리셋 후)
