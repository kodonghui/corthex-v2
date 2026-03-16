# Claude Desktop QA 버그 리포트
> 검사일: 2026-03-16
> 검사자: Claude Desktop (Cowork)
> 사이트: https://corthex-hq.com
> 디자인 기준: Natural Organic (올리브그린 #5a7247, 베이지 #faf8f5, Noto Serif KR 헤딩, Pretendard 본문)

## 요약
- Admin App: 12개 페이지 검수 완료 (/login, /hub, /dashboard, /agents, /departments, /jobs, /trading, /nexus, /sns, /messenger, /knowledge, /reports)
- Admin Panel: 3개 페이지 검수 (/admin/dashboard, /admin/login, /admin/credentials)
- CEO: 브라우저 연결 끊김으로 미완료 (별도 세션 필요)
- 총: **Critical 3 | Major 5 | Minor 3 | Cosmetic 2 | Security 미검증**

## 근본 원인 분석

| 의심 원인 | 확인 결과 | DOM/CSS 증거 |
|----------|----------|------------|
| 이중/삼중 사이드바 | ✅확인 | nav 2~3개 (거의 모든 페이지), aside 2~3개 |
| 다크 테마 잔재 | ✅확인 | Admin 패널 전체 다크, /nexus 조직도 다크 카드 |
| 올리브그린 적용 | ✅부분적용 | /login, /dashboard 버튼은 #5a7247 정상. Admin 패널은 보라색 |
| 폰트 미로딩/불일치 | ✅확인 | 페이지별 6종 폰트 혼재 (아래 표 참조) |
| Noto Serif KR 누락 | ✅부분적용 | /login, /dashboard, /knowledge만 적용. 나머지 미적용 |
| Material Symbols 미로딩 | ✅확인 | "smart_toy", "bar_chart", "eco" 등 아이콘 이름이 텍스트로 노출 |
| 다중 레이아웃 시스템 | ✅확인 | /hub, /dashboard, /agents 각각 다른 사이드바/레이아웃 구조 |

### 폰트 일관성 맵

| 페이지 | 헤딩 폰트 (실제) | 정상 여부 |
|--------|----------------|---------|
| /login | Noto Serif KR, serif | ✅ |
| /hub | Pretendard, Inter, sans-serif | ❌ |
| /dashboard | Noto Serif KR, serif | ✅ |
| /agents | Public Sans, sans-serif | ❌ |
| /departments | Public Sans, sans-serif | ❌ |
| /jobs | Public Sans, sans-serif | ❌ |
| /trading | ui-sans-serif, system-ui | ❌ |
| /nexus | Pretendard, sans-serif | ❌ |
| /sns | ui-sans-serif, system-ui | ❌ |
| /messenger | DM Serif Display, serif | ❌ (세리프이지만 잘못된 패밀리) |
| /knowledge | Noto Serif KR, serif | ✅ |
| /reports | Public Sans, sans-serif | ❌ |

### nav/aside 카운트 맵

| 페이지 | nav 개수 | aside 개수 | 비고 |
|--------|---------|-----------|------|
| /login | 0 | 0 | ✅ 정상 |
| /hub | 2 | 3 | ❌ nav[0] width=0 숨김 |
| /dashboard | 2 | 2 | ❌ |
| /agents | 3 | 2 | ❌ 삼중 nav |
| /departments | 3 | 2 | ❌ 삼중 nav, 이중 사이드바 시각적으로 보임 |
| /jobs | 2 | 2 | ❌ 이중 사이드바 시각적으로 보임 |
| /trading | 2 | 1 | ❌ |
| /nexus | 1 | 2 | nav 단일 (양호) |
| /sns | 2 | 2 | ❌ |
| /messenger | 2 | 3 | ❌ |
| /knowledge | 2 | 2 | ❌ |
| /reports | 2 | 2 | ❌ |

## Admin 사이드바 메뉴 (Admin 패널)
1. 대시보드
2. 회사 관리
3. 직원 관리
4. 부서 관리
5. AI 에이전트
6. 도구 관리
7. 비용 관리
8. CLI / API 키
9. 보고 라인
10. 소울 템플릿
11. 시스템 모니터링
12. 조직도
13. NEXUS 조직도
14. (스크롤 필요 — 추가 항목 있음)
15. 회사 설정
16. CEO 앱으로 전환
17. 관리자 superadmin / 로그아웃

## App 사이드바 메뉴 (메인 레이아웃 — /jobs 기준)
**COMMAND**: Dashboard, 허브, NEXUS, 채팅
**ORGANIZATION**: 에이전트, 부서, 작업, 티어, 보고서
**TOOLS**: 워크플로우, 스케치바이브, SNS, 전략실, 메신저
**하단**: 관리자 System Administrator, 로그아웃, #555 792x0a6

## CEO 사이드바 메뉴
> ⚠️ 브라우저 연결 끊김으로 미수집. CEO 로그인 후 별도 확인 필요.

## 페이지별 결과 (Admin App)

| # | 경로 | 레퍼런스 일치 | 기능 정상 | DOM 이상 | 판정 |
|---|------|-------------|---------|---------|------|
| 1 | /login | ✅ 양호 | ✅ (빈폼 유효성, 에러 표시) | nav 0 ✅ | PASS (Minor 1건) |
| 2 | /hub | ⚠️ 차이 있음 | ❌ INTERNAL_ERROR | nav 2, aside 3 | FAIL |
| 3 | /dashboard | ⚠️ 축소 사이드바 | ✅ 카드/에이전트 표시 | nav 2 | WARN |
| 4 | /agents | ❌ 아이콘 깨짐 | ⚠️ 빈 목록 (데이터 없음) | nav 3 | FAIL |
| 5 | /departments | ❌ 이중사이드바 | ⚠️ 빈 목록 | nav 3, 이중사이드바 보임 | FAIL |
| 6 | /jobs | ❌ 아이콘 깨짐 | ⚠️ 빈 목록 | nav 2, 이중사이드바 보임 | FAIL |
| 7 | /trading | ⚠️ 차이 있음 | ⚠️ 차트 미렌더링 | nav 2 | WARN |
| 8 | /nexus | ❌ 다크 노드 | ✅ 조직도 렌더링 | nav 1 ✅ | FAIL (시각) |
| 9 | /sns | ❌ 아이콘 깨짐 | ✅ 콘텐츠 카드 표시 | nav 2 | WARN |
| 10 | /messenger | ⚠️ 폰트 다름 | ✅ 대화 표시 | nav 2, aside 3 | WARN |
| 11 | /knowledge | ✅ 양호 | ✅ 빈 폴더 표시 | nav 2 | PASS |
| 12 | /reports | ❌ 한글 깨짐 | ❌ 인코딩 오류 | nav 2 | FAIL |

## 페이지별 결과 (Admin 패널)

| # | 경로 | 레퍼런스 일치 | 기능 정상 | DOM 이상 | 판정 |
|---|------|-------------|---------|---------|------|
| 1 | /admin/login | ❌ 다크+보라색 | ✅ 로그인 동작 | 다크 테마 전체 | FAIL (시각) |
| 2 | /admin/dashboard | ❌ 다크 테마 | ✅ 통계/차트 표시 | 다크 테마 전체 | FAIL (시각) |
| 3 | /admin/credentials | ❌ 혼합 테마 | ✅ 직원 선택, 토큰 UI | 다크 사이드바 + 밝은 콘텐츠 | FAIL (시각) |

## CEO Admin 접근 보안 테스트
> ⚠️ 브라우저 연결 끊김으로 미완료. 별도 세션에서 CEO(ceo/ceo1234) 로그인 후 /admin/* 전체 접근 테스트 필요.

---

## 버그 목록

### BUG-D001: 로그인 실패 시 잘못된 에러 메시지
- **심각도**: Minor
- **계정**: Admin
- **페이지**: /login
- **레퍼런스**: `login_page/screen.png`
- **레퍼런스와 차이점**: 없음 (시각적 정상)
- **기능 문제**: 틀린 비밀번호(admin/wrongpass) 입력 시 "인증이 만료되었습니다" 표시. 기대값은 "아이디 또는 비밀번호가 올바르지 않습니다" 류의 인증 실패 메시지
- **DOM 분석**: 에러 박스 색상 테라코타(#c4622d) 정상, 텍스트 내용만 부적절
- **콘솔 에러**: 없음
- **추정 원인 코드**: 서버 `/api/auth/login` 응답의 에러 메시지가 잘못 설정됨. 또는 이전 세션 토큰 만료 에러가 로그인 에러보다 먼저 잡힘

### BUG-D002: /hub 명령 전송 시 INTERNAL_ERROR
- **심각도**: Critical
- **계정**: Admin
- **페이지**: /hub
- **레퍼런스**: `hub_command_center_variant_1/screen.png`
- **레퍼런스와 차이점**: 레퍼런스는 마크다운 테이블 포함 정상 응답 표시
- **기능 문제**: "오늘 뉴스 브리핑해줘" 입력 → "오류가 발생했습니다! (코드: INTERNAL_ERROR)" 표시. 핵심 기능(AI 에이전트 명령) 완전 불가
- **DOM 분석**: nav 2개, aside 3개
- **콘솔 에러**: 수집 시점 이슈로 미캡처 (콘솔 트래킹이 에러 발생 후 시작됨)
- **추정 원인 코드**: `POST /api/workspace/hub/stream` 엔드포인트 서버 에러. 에이전트 실행 엔진(engine/agent-loop.ts) 또는 API 핸들러 문제

### BUG-D003: 전체 사이트 헤딩 폰트 불일치 (6종 혼재)
- **심각도**: Major
- **계정**: 둘 다
- **페이지**: 전체 (12개 중 9개 불일치)
- **레퍼런스**: 모든 레퍼런스는 Noto Serif KR 세리프 헤딩
- **레퍼런스와 차이점**: /login, /dashboard, /knowledge만 Noto Serif KR 정상. 나머지 9개 페이지에서 Public Sans, Pretendard, DM Serif Display, system-ui 등 6종 폰트 혼재
- **기능 문제**: 없음 (시각적 문제)
- **DOM 분석**: 각 페이지 `getComputedStyle(h1).fontFamily` 결과 상이 (위 폰트 맵 참조)
- **콘솔 에러**: 없음
- **추정 원인 코드**: 각 페이지 컴포넌트가 독립적으로 폰트를 지정하거나, 글로벌 폰트 설정이 일부 레이아웃에만 적용됨. `tailwind.config` 또는 `index.css`의 `@font-face` / `font-family` 설정 불일치

### BUG-D004: Material Symbols 아이콘 폰트 미로딩 — 아이콘 이름이 텍스트로 노출
- **심각도**: Critical
- **계정**: 둘 다
- **페이지**: /agents, /departments, /jobs, /sns, /reports, /admin/dashboard 등 대다수
- **레퍼런스**: 모든 레퍼런스에서 아이콘이 정상 렌더링
- **레퍼런스와 차이점**: "smart_toy", "bar_chart", "groups", "trending_up", "bolt", "eco", "terminal", "dark_mode", "calendar_month", "work", "filter_list", "add", "search", "notifications", "view_kanban", "edit_square", "photo_cam", "auto_awesome", "check_circle", "more_vert" 등 수십 개의 아이콘 이름이 그대로 텍스트로 표시
- **기능 문제**: UI 가독성 심각하게 저하. 통계 카드에서 "groups 0", "bolt --s" 등 의미 파악 불가
- **DOM 분석**: Material Symbols Outlined 폰트가 로드되지 않아 fallback 텍스트 표시
- **콘솔 에러**: 미캡처
- **추정 원인 코드**: `index.html` 또는 CSS에서 Google Material Symbols 폰트 CDN 링크 누락 또는 로드 실패. CLAUDE.md에 "아이콘: Lucide React 유지 (Material Symbols 대신)"으로 명시되어 있으나, 실제 코드는 Material Symbols를 사용 중 → **디자인 스펙과 구현 불일치**

### BUG-D005: 이중/삼중 사이드바 구조
- **심각도**: Major
- **계정**: 둘 다
- **페이지**: /departments, /jobs (시각적으로 보임), 나머지 대부분 (DOM에 존재)
- **레퍼런스**: 모든 레퍼런스는 사이드바 1개
- **레퍼런스와 차이점**: /departments, /jobs에서 왼쪽 어두운 사이드바 + 중앙 두 번째 사이드바 패널이 동시 표시. 다른 페이지에서도 DOM에 nav 2~3개, aside 2~3개 존재
- **기능 문제**: 콘텐츠 영역 축소, 화면 공간 낭비
- **DOM 분석**: nav 2~3개 (nav[0]: width=0 숨김 또는 width=207px). /departments, /jobs에서는 두 번째 사이드바("eco CORTHEX v2 Natural Workspace" + dashboard/work/settings 메뉴)가 시각적으로 노출
- **콘솔 에러**: 없음
- **추정 원인 코드**: App Shell의 layout.tsx에 기본 사이드바 + 각 페이지의 자체 사이드바가 중첩 렌더링. 또는 mobile sidebar와 desktop sidebar가 동시 마운트

### BUG-D006: /nexus 조직도 노드가 다크 테마 (slate/navy 배경)
- **심각도**: Major
- **계정**: Admin
- **페이지**: /nexus
- **레퍼런스**: `nexus_app_1/screen.png`
- **레퍼런스와 차이점**: 레퍼런스는 밝은 베이지/흰색 카드인데, 실제는 짙은 navy/slate 배경의 다크 카드. "COMPANY CORTHEX HQ", "DEPARTMENT 경영지원실" 등 모든 노드가 다크
- **기능 문제**: 없음 (조직도 자체는 동작)
- **DOM 분석**: nav 1개(양호), headingFont Pretendard(불일치). 노드 카드에 다크 배경 클래스/인라인 스타일 적용
- **콘솔 에러**: 없음
- **추정 원인 코드**: nexus 페이지 컴포넌트가 이전 Sovereign Sage 다크 테마의 스타일을 그대로 사용. Natural Organic 테마로 마이그레이션 누락

### BUG-D007: Admin 패널 전체가 다크 테마 + 보라색 액센트
- **심각도**: Major
- **계정**: Admin
- **페이지**: /admin/login, /admin/dashboard, /admin/credentials 등 Admin 전체
- **레퍼런스**: 레퍼런스 이미지는 Natural Organic 테마
- **레퍼런스와 차이점**: Admin 로그인 = 검정 배경 + 보라색 버튼/아이콘. Admin 대시보드 = 짙은 slate 배경 + 보라색 사이드바 하이라이트. Natural Organic(베이지 #faf8f5, 올리브 #5a7247)과 완전 불일치
- **기능 문제**: 없음 (기능은 정상 동작)
- **DOM 분석**: Admin은 별도 레이아웃/라우터 사용. 메인 앱과 완전히 다른 테마
- **콘솔 에러**: 없음
- **추정 원인 코드**: Admin 섹션이 테마 리디자인(Phase 7) 범위에서 누락됨. Admin 레이아웃/컴포넌트가 이전 다크 테마를 그대로 유지

### BUG-D008: /reports 보고서 제목 한글 깨짐 (인코딩 오류)
- **심각도**: Critical
- **계정**: Admin
- **페이지**: /reports
- **레퍼런스**: `reports_archive/screen.png`
- **레퍼런스와 차이점**: 레퍼런스는 깨끗한 한글 제목, 실제는 "3◆◆ ◆◆ ◆◆◆◆" (mojibake)
- **기능 문제**: 보고서 제목을 읽을 수 없음
- **DOM 분석**: 서버에서 받은 데이터 자체가 깨진 상태로 렌더링
- **콘솔 에러**: 미캡처
- **추정 원인 코드**: `GET /api/workspace/reports` 응답의 인코딩 문제. DB 저장 시 UTF-8 미설정, 또는 API 응답 Content-Type charset 누락

### BUG-D009: /admin/dashboard 첫 접근 시 빈 백색 화면
- **심각도**: Major
- **계정**: Admin
- **페이지**: /admin/dashboard
- **레퍼런스**: `admin_dashboard/screen.png`
- **레퍼런스와 차이점**: 완전히 빈 화면 (아무것도 안 보임)
- **기능 문제**: 메인 앱에서 /admin/dashboard 직접 접근 시 React root는 존재하나 innerHTML 비어있음. Admin 별도 로그인(/admin/login) 필요하지만, 빈 화면 대신 로그인 리다이렉트가 되어야 함
- **DOM 분석**: `document.getElementById('root')` 존재, innerHTML = "" (빈 문자열), body 자식 4개
- **콘솔 에러**: React 에러 없음 (크롬 확장 로그 1건만)
- **추정 원인 코드**: Admin 라우터의 인증 가드가 미인증 상태에서 빈 화면을 렌더링하며 리다이렉트하지 않음. /admin/users 접근 시에는 /admin/login으로 리다이렉트됨 → /admin/dashboard만 리다이렉트 로직 누락

### BUG-D010: 다중 레이아웃 시스템 (3종 이상의 사이드바)
- **심각도**: Minor
- **계정**: 둘 다
- **페이지**: 전체
- **레퍼런스**: 통일된 사이드바 1개
- **레퍼런스와 차이점**: /hub = Workspace Hub/Active Tasks/Agent Directory (3개 메뉴), /dashboard = 대시보드/AI에이전트채팅/워크플로우/보고서/설정 (5개 메뉴), /agents~이하 = COMMAND/ORGANIZATION/TOOLS 그룹 (15+ 메뉴). 3종 이상의 서로 다른 사이드바 구조 혼재
- **기능 문제**: 사용자 혼란. 같은 앱인데 페이지마다 네비게이션이 다름
- **DOM 분석**: 각 페이지 그룹이 서로 다른 레이아웃 컴포넌트 사용
- **콘솔 에러**: 없음
- **추정 원인 코드**: layout.tsx 통합 미완. 각 페이지 그룹이 독립적 레이아웃을 보유

### BUG-D011: /dashboard에서 "CEO님" 표시 (Admin 로그인인데)
- **심각도**: Minor
- **계정**: Admin
- **페이지**: /dashboard
- **레퍼런스**: 해당 없음
- **레퍼런스와 차이점**: 해당 없음
- **기능 문제**: Admin(관리자) 계정으로 로그인했는데 "반갑습니다, CEO님" 표시. 사용자 이름/역할이 잘못 표시됨
- **DOM 분석**: 상단 바에도 "CEO님" 표시
- **콘솔 에러**: 없음
- **추정 원인 코드**: 사용자 표시명 로직이 role이 아닌 다른 값을 참조하거나, 하드코딩

### BUG-D012: /trading 차트 영역 미렌더링
- **심각도**: Minor
- **계정**: Admin
- **페이지**: /trading
- **레퍼런스**: `trading/screen.png`
- **레퍼런스와 차이점**: 레퍼런스는 캔들스틱 차트 표시, 실제는 차트 영역 비어있음
- **기능 문제**: 종목(NVDA 등) 가격은 표시되나 차트 미렌더링
- **DOM 분석**: nav 2, aside 1
- **콘솔 에러**: 미캡처
- **추정 원인 코드**: 차트 라이브러리(Recharts 등) 데이터 바인딩 실패 또는 렌더링 조건 미충족

### BUG-D013: /reports API 경로 텍스트 헤더에 노출
- **심각도**: Cosmetic
- **계정**: Admin
- **페이지**: /reports
- **레퍼런스**: `reports_archive/screen.png`
- **레퍼런스와 차이점**: 레퍼런스에 없는 "GET /api/workspace/reports" 텍스트가 헤더 영역에 표시
- **기능 문제**: 없음 (디버그 정보 노출)
- **DOM 분석**: 해당 없음
- **콘솔 에러**: 없음
- **추정 원인 코드**: 개발 중 디버그용 API 경로 표시가 제거되지 않음

---

## 미완료 항목 (브라우저 연결 끊김)

### 미검수 App 페이지
- /tiers, /agora, /classified, /costs, /performance, /activity-log, /sketchvibe, /onboarding
- /chat, /files, /ops-log, /workflows, /notifications, /settings

### 미검수 Admin 페이지
- /admin/users, /admin/employees, /admin/departments, /admin/agents
- /admin/tools, /admin/costs, /admin/report-lines, /admin/soul-templates
- /admin/nexus, /admin/onboarding, /admin/monitoring, /admin/settings
- /admin/companies, /admin/workflows

### CEO 전수검수
- CEO 로그인 (ceo/ceo1234)
- CEO App 25개 페이지 전수
- CEO Admin 보안 접근 테스트 (16개 /admin/* 경로)

### 반응형 테스트
- 375px 모바일 뷰 미테스트

---

## 우선순위 수정 권장 순서

1. **BUG-D002** (Critical): Hub INTERNAL_ERROR — 핵심 기능 불가
2. **BUG-D004** (Critical): Material Symbols 폰트 미로딩 — CLAUDE.md에 "Lucide React 유지"로 명시됨. Material Symbols → Lucide React 전환 필요
3. **BUG-D008** (Critical): Reports 한글 깨짐 — 인코딩 수정
4. **BUG-D005** (Major): 이중/삼중 사이드바 — layout.tsx 통합
5. **BUG-D007** (Major): Admin 패널 다크 테마 → Natural Organic 전환
6. **BUG-D003** (Major): 폰트 통일 — 글로벌 Noto Serif KR 헤딩 + Pretendard 본문
7. **BUG-D006** (Major): Nexus 다크 카드 → 밝은 테마
8. **BUG-D009** (Major): Admin dashboard 빈 화면 → 로그인 리다이렉트 추가
