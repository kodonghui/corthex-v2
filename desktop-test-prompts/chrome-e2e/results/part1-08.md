# Part 1-08: 직원 부서 배치 + 권한 테스트 결과

## 테스트 환경
- 일시: 2026-03-30
- 브라우저: Chrome (claude-in-chrome MCP)
- 해상도: 1575x781
- OS: Windows 11 Home

## 사전 조건
- cqa03 (크롬검수원수정) — 개발팀 배정, 임시 비밀번호 `mO7tZdFs6n%NxmSe`
- part1-05에서 Inactive로 변경됨 → 본 테스트 시작 전 재활성화 완료

## 단계별 결과

| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 0 | cqa03 재활성화 (사전 작업) | PASS | /admin/employees | 3s | 재활성화 다이얼로그 → "재활성화" 클릭 → "직원이 재활성화되었습니다" 토스트 (ss_824086omz) |
| 1 | App 로그인 페이지 접속 | PASS | /login | 2s | 새 탭 생성 후 이동, 로그인 폼 정상 표시 (ss_1959amiwf) |
| 2 | 아이디 `cqa03` 입력 | PASS | /login | 1s | |
| 3 | 비밀번호 `mO7tZdFs6n%NxmSe` 입력 | PASS | /login | 1s | |
| 4 | "INITIALIZE COMMAND" 클릭 | PASS | /login | 3s | |
| 5 | Hub 페이지 로드 확인 | PASS | /hub | 0s | "Welcome, Commander" + 좌하단 "크롬검수원수정 / User" 확인 (ss_0691e4f8o) |
| 6 | 스크린샷: employee-login | DONE | /hub | 0s | ss_0691e4f8o |
| 7 | /agents 페이지 이동 | PASS | /agents | 2s | |
| 8 | 부서 스코프 확인 (에이전트) | PASS | /agents | 0s | Total: 1, 개발팀장만 표시 — 개발팀 소속 에이전트만 보임 (ss_886792zcn) |
| 9 | /departments 페이지 이동 | PASS | /departments | 2s | |
| 10 | 부서 스코프 확인 (부서) | PASS | /departments | 0s | 1 Department, 개발팀만 표시 — 자기 부서만 보임 (ss_4377beowu) |
| 11 | 스크린샷: scope | DONE | /departments | 0s | ss_886792zcn + ss_4377beowu |
| 12 | Admin 탭 → 직원 관리 | PASS | /admin/employees | 2s | |
| 13 | "Add Employee" 클릭 | PASS | /admin/employees | 1s | 직원 초대 모달 표시 (ss_19363ovek) |
| 14 | 아이디 `cqa-nogroup` 입력 | PASS | /admin/employees | 1s | |
| 15 | 이름 `미소속검수원` 입력 | PASS | /admin/employees | 1s | |
| 16 | 이메일 `nogroup@chrometest.dev` 입력 | PASS | /admin/employees | 1s | |
| 17 | 부서 체크박스: 아무것도 선택 안 함 | PASS | /admin/employees | 0s | 4개 부서 체크박스 모두 비선택 상태 확인 (ss_8898uvcxg) |
| 18 | "초대" 클릭 | PASS | /admin/employees | 2s | "직원이 초대되었습니다" 토스트 → 임시 비밀번호 모달 (ss_141980iqb) |
| 19 | 비밀번호 메모 | DONE | /admin/employees | 0s | `gwpfs1pREH$7LmLZ` |
| 20 | "확인" 클릭 | PASS | /admin/employees | 1s | |
| 21 | App 탭 로그아웃 | PASS | /login | 2s | localStorage.clear() + sessionStorage.clear() → /login 리다이렉트 |
| 22 | `cqa-nogroup` / 비밀번호 입력 | PASS | /login | 2s | |
| 23 | "INITIALIZE COMMAND" 클릭 | PASS | /login → /hub | 3s | 로그인 성공, Hub 로드 |
| 24 | /agents 페이지 이동 (미배정 직원) | PASS | /agents | 2s | |
| 25 | 전체 접근 확인 (에이전트) | PASS | /agents | 0s | Total: 9 — 모든 부서의 에이전트 표시 (비서실장, 개발팀장, 마케팅팀장, 재무팀장, CIO, 투자분석 전문가 A 등) (ss_292316385) |
| 26 | /departments 페이지 이동 (미배정 직원) | PASS | /departments | 2s | |
| 27 | 전체 접근 확인 (부서) | PASS | /departments | 0s | 7 Departments — 경영지원실, 개발팀, 마케팅팀, 재무팀 등 모든 부서 표시 (ss_2149t31i1) |
| 28 | 스크린샷: nogroup | DONE | /departments | 0s | ss_292316385 + ss_2149t31i1 |
| 29 | 로그아웃 → CEO 계정 로그인 | PASS | /login → /hub | 5s | localStorage.clear() → ceo/ceo1234 로그인 성공 |
| 30 | /agents 페이지 이동 (CEO) | PASS | /agents | 2s | |
| 31 | CEO 전체 접근 확인 (에이전트) | PASS | /agents | 0s | Total: 9 — 모든 에이전트 접근 가능, 좌하단 "대표님 / User" 확인 (ss_1696j7ijp) |
| 32 | /departments 페이지 이동 (CEO) | PASS | /departments | 2s | |
| 33 | CEO 전체 접근 확인 (부서) | PASS | /departments | 0s | 7 Departments — 전체 부서 접근 가능 (ss_788586dvu) |
| 34 | 스크린샷: ceo | DONE | /departments | 0s | ss_1696j7ijp + ss_788586dvu |

## 권한 비교 결과

| 계정 | 역할 | 부서 배정 | 에이전트 수 | 부서 수 | 결론 |
|------|------|----------|-----------|--------|------|
| cqa03 (크롬검수원수정) | User | 개발팀 | 1 (개발팀장만) | 1 (개발팀만) | 자기 부서만 접근 ✅ |
| cqa-nogroup (미소속검수원) | User | 없음 | 9 (전체) | 7 (전체) | 전체 접근 ✅ |
| ceo (대표님) | User | UNASSIGNED | 9 (전체) | 7 (전체) | 전체 접근 ✅ |

**결론**: 부서 배정 직원은 자기 부서만 접근, 미배정 직원과 CEO는 전체 접근 — **성공 기준 충족**

## 발견된 버그

### BUG-001: 일반 직원이 에이전트 삭제/수정/비활성화 가능
- 페이지 URL: /agents
- 재현 단계: 1. cqa03으로 로그인 2. /agents 이동 3. 에이전트 카드 더보기(⋮) 클릭 → 삭제 다이얼로그 표시 4. 에이전트 카드 본체 클릭 → 상세 패널에 "수정" + "비활성화" 버튼 표시
- 기대 결과: 일반 직원(User)은 에이전트 조회만 가능해야 함. 삭제/수정/비활성화 버튼은 숨기거나 비활성화
- 실제 결과: 일반 직원에게도 삭제 다이얼로그, 수정 버튼, 비활성화 버튼 모두 노출됨
- 콘솔 에러: 없음
- 스크린샷: ss_528513kwk (삭제 다이얼로그), ss_4585odm7y (수정/비활성화 버튼)
- 심각도: Major — 데이터 무결성 위험. 일반 직원이 에이전트를 삭제/비활성화할 수 있음
- 추정 원인: App의 에이전트 페이지에서 role 기반 버튼 표시/숨김 로직 미구현

### BUG-002: 일반 직원에게 에이전트 생성 버튼 노출
- 페이지 URL: /agents
- 재현 단계: 1. cqa03으로 로그인 2. /agents 이동 3. 우상단 "+ 에이전트 생성" 버튼 표시됨
- 기대 결과: 일반 직원은 에이전트 생성 권한이 없으므로 버튼 숨김 또는 비활성화
- 실제 결과: "+ 에이전트 생성" 버튼이 활성 상태로 표시됨 (클릭 시 동작은 미확인)
- 스크린샷: ss_886792zcn, ss_05462a1y3
- 심각도: Minor — 버튼 클릭 시 서버에서 거부될 수 있지만 UX 혼란 유발
- 추정 원인: App 에이전트 페이지에서 role 기반 UI 분기 미구현

## UX 탐색 발견사항 — 7개 시도

### 1. 에이전트 더보기(⋮) 메뉴 클릭 (ss_528513kwk에서 확인)
- 클릭한 요소: 개발팀장 카드의 ⋮ 아이콘
- URL: /agents
- 결과: 바로 "개발팀장 에이전트 삭제" 확인 다이얼로그 표시. 메뉴가 아니라 삭제로 바로 연결됨
- 평가: **UX 이슈** — ⋮ 클릭 시 드롭다운 메뉴(수정/삭제/채팅 등)가 나와야 하는데 바로 삭제 다이얼로그가 뜸. 실수 삭제 위험. 또한 일반 직원에게 삭제 접근 가능 (BUG-001)

### 2. 에이전트 카드 본체 클릭 (ss_4585odm7y에서 확인)
- 클릭한 요소: 개발팀장 카드 중앙 영역
- URL: /agents
- 결과: 하단에 에이전트 상세 패널 펼침 — 에이전트 정보, 통계(총 작업, 성공률, 평균 응답, 월간 비용), 수정/비활성화 버튼 표시
- 평가: 상세 패널 UX 정상 ✅. 다만 일반 직원에게 수정/비활성화 노출은 이슈 (BUG-001)

### 3. 에이전트 검색 — 없는 에이전트 (ss_2192x8p1l에서 확인)
- 입력값: "존재하지않는에이전트"
- URL: /agents
- 결과: "에이전트가 없습니다 / 첫 에이전트를 생성하여 AI 조직을 구성하세요" 빈 상태 표시
- 평가: 빈 상태 처리 정상 ✅

### 4. 부서 필터 드롭다운 확인 (ss_6030mx04n에서 확인)
- 클릭한 요소: "전체 부서" 드롭다운
- URL: /agents
- 결과: cqa03(개발팀 배정)의 드롭다운에 "전체 부서", "미배속", "개발팀" 옵션만 있음 (다른 부서 옵션 없음)
- 평가: 부서 스코프가 필터 옵션에도 올바르게 적용됨 ✅

### 5. 로그아웃 버튼 반응 (ss_5557exq0f에서 확인)
- 클릭한 요소: 좌하단 "로그아웃" 텍스트
- URL: /hub
- 결과: 클릭 시 텍스트가 빨간색으로 변하지만 즉시 로그아웃 안 됨. 내부 상태는 변경된 것 같으나 페이지 리다이렉트 없음
- 평가: **Minor UX 이슈** — 로그아웃 클릭 후 즉시 /login으로 리다이렉트되지 않음. localStorage.clear() 후 수동 이동으로 해결함

### 6. 에이전트 카드 본체 클릭 상세 패널 (ss_4585odm7y에서 확인)
- 클릭한 요소: 개발팀장 카드
- URL: /agents
- 결과: 하단에 상세 패널 — 큰 아바타, 이름, 역할, 소속 부서, 온라인 상태, 통계 4개(총 작업, 성공률, 평균 응답, 월간 비용), 수정/비활성화 버튼
- 평가: 상세 패널 레이아웃 잘 구성됨 ✅

### 7. 콘솔 에러 확인
- 전 테스트 구간에서 에러/경고 없음
- 평가: 클린한 콘솔 상태 ✅

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 미테스트
- 로딩 속도 체감: 빠름 — 페이지 전환 2초 이내
- 레이아웃 깨짐: 없음
- 로그인/로그아웃 전환: 정상 동작 (localStorage 클리어 후 리다이렉트)
- 부서 스코프 필터링: 에이전트, 부서 페이지 모두 정확히 동작

## 스크린샷 목록
| ID | 설명 |
|----|------|
| ss_8461hc7im | Admin 직원 관리 초기 상태 (cqa03 Inactive) |
| ss_4501yczp8 | 재활성화 다이얼로그 |
| ss_824086omz | 재활성화 완료 (Active 2명) |
| ss_1959amiwf | App 로그인 페이지 |
| ss_0691e4f8o | **part1-08-employee-login** — cqa03 로그인 성공 Hub |
| ss_886792zcn | **part1-08-scope** — cqa03 에이전트 (Total: 1, 개발팀장만) |
| ss_4377beowu | cqa03 부서 (1 Department, 개발팀만) |
| ss_19363ovek | 직원 초대 모달 (빈 폼) |
| ss_8898uvcxg | 직원 초대 모달 (cqa-nogroup 입력, 부서 미선택) |
| ss_141980iqb | 임시 비밀번호 모달 (미소속검수원) |
| ss_292316385 | **part1-08-nogroup** — 미소속검수원 에이전트 (Total: 9, 전체) |
| ss_2149t31i1 | 미소속검수원 부서 (7 Departments, 전체) |
| ss_1696j7ijp | **part1-08-ceo** — CEO 에이전트 (Total: 9, 전체) |
| ss_788586dvu | CEO 부서 (7 Departments, 전체) |
| ss_528513kwk | UX: 더보기 → 바로 삭제 다이얼로그 |
| ss_4585odm7y | UX: 에이전트 상세 패널 (수정/비활성화 노출) |
| ss_2192x8p1l | UX: 없는 에이전트 검색 (빈 상태) |
| ss_6030mx04n | UX: 부서 필터 드롭다운 |

## 요약
- 총 단계: 34
- PASS: 30
- DONE: 4 (스크린샷/메모)
- FAIL: 0
- 버그: 2건 (Major 1건, Minor 1건)
- UX 발견: 7건
- 콘솔 에러: 0건
- **성공 기준 충족**: 부서 배정 직원은 자기 부서만, 미배정 직원은 전체, CEO는 전체 접근 — 모두 정상 동작
