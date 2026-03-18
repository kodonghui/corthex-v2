# 전수 E2E 검증 프롬프트 — VS Code Claude Code (Playwright MCP)

## 역할
CORTHEX v2 (https://corthex-hq.com) **모든 페이지의 모든 인터랙션**을 전수 검증.
버튼처럼 생겼는데 안 눌리는 것, 입력처럼 생겼는데 안 써지는 것, 링크인데 아무데도 안 가는 것 — 전부 찾아서 기록.

## 로그인 정보
- **Admin**: `admin` / `admin1234`
- **CEO**: `ceo` / `ceo1234`

## Playwright MCP 도구
`browser_navigate`, `browser_snapshot`, `browser_click`, `browser_type`, `browser_take_screenshot`, `browser_console_messages`, `browser_evaluate`, `browser_fill_form`

## 디자인 기준 (Natural Organic — 라이트 모드)
- 배경: **베이지 #faf8f5** (어두운 배경 = 버그)
- 사이드바: **올리브 다크 #283618**
- 액센트: **올리브그린 #606C38**
- `<html class="dark">` 있으면 = **버그**

---

## 절대 규칙

1. **스크린샷만 찍으면 미검사** — 눈에 보이는 모든 요소를 직접 조작해야 검사 완료
2. **"반응 없음"이 가장 중요한 버그** — 버튼/링크/입력/드롭다운이 클릭/입력 가능하게 생겼는데 아무 반응 없으면 반드시 기록
3. 모든 페이지에서 아래 **자동 검사 스크립트**를 반드시 실행
4. 콘솔 에러(403/500) 전문 복사
5. 결과를 `_qa-e2e/playwright-claude-code/VERIFY-RESULT.md`에 기록

---

## 모든 페이지 공통 — 자동 검사 스크립트

**매 페이지 도착 시 아래를 browser_evaluate로 실행:**

```javascript
(() => {
  // 1. 클릭 가능해 보이는 모든 요소 수집
  const clickables = document.querySelectorAll('button, a, [role="button"], [onclick], [tabindex="0"], input[type="submit"], input[type="button"], .cursor-pointer, [class*="hover:"]')

  // 2. 입력 가능해 보이는 모든 요소 수집
  const inputs = document.querySelectorAll('input:not([type="hidden"]), textarea, select, [contenteditable="true"], [role="textbox"], [role="combobox"], [role="searchbox"]')

  // 3. Material Symbols 잔재
  const matSymbols = document.querySelectorAll('.material-symbols-outlined, .material-symbols-rounded, [class*="material-symbols"]')

  // 4. 이중 사이드바
  const asides = document.querySelectorAll('aside')
  const fixedLeftAsides = [...asides].filter(a => {
    const s = getComputedStyle(a)
    return s.position === 'fixed' && a.getBoundingClientRect().left < 10
  })

  // 5. 다크 테마 잔재
  const darkClass = document.documentElement.classList.contains('dark')
  const slateElements = document.querySelectorAll('[class*="slate-950"], [class*="slate-900"]')
  const cyanElements = document.querySelectorAll('[class*="cyan-400"], [class*="cyan-300"]')

  return {
    clickableCount: clickables.length,
    inputCount: inputs.length,
    matSymbolCount: matSymbols.length,
    matSymbolTexts: [...matSymbols].map(el => el.textContent?.trim()).filter(Boolean).slice(0, 20),
    asideCount: asides.length,
    fixedLeftAsideCount: fixedLeftAsides.length,
    darkClass,
    slateCount: slateElements.length,
    cyanCount: cyanElements.length,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    consoleUrl: window.location.pathname,
  }
})()
```

---

## ROUND 1: Admin 계정 — 모든 페이지 전수 인터랙션

```
browser_navigate → https://corthex-hq.com/login
```

### 0. 로그인 페이지

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 아이디 입력칸 | input | 클릭 → 커서 깜빡임 | 포커스 됨 | | |
| 2 | 아이디 입력 | input | "admin" 타이핑 | 글자 입력됨 | | |
| 3 | 비번 입력칸 | input | 클릭 → 커서 | 포커스 됨 | | |
| 4 | 비번 입력 | input | "wrongpass" 타이핑 | 글자 입력됨 (마스킹) | | |
| 5 | 로그인 버튼 | button | 클릭 | 에러 메시지 표시 ("인증이 만료" 아닌 적절한 메시지) | | |
| 6 | 에러 메시지 내용 | text | 읽기 | "아이디 또는 비밀번호가 올바르지 않습니다" | | |
| 7 | 빈 폼 제출 | button | 아이디/비번 비우고 클릭 | 유효성 에러 메시지 | | |
| 8 | 정상 로그인 | button | admin/admin1234 → 클릭 | /hub 리다이렉트 | | |
| 9 | "회원가입" 링크 | link | 클릭 | 페이지 이동 또는 모달 (없으면 "반응없음" 기록) | | |
| 10 | "비밀번호 찾기" 링크 | link | 클릭 | 페이지 이동 또는 모달 (없으면 "반응없음" 기록) | | |
| 11 | 개인정보처리방침 | link | 클릭 | 이동 (href="#"이면 "빈 링크" 기록) | | |
| 12 | 이용약관 | link | 클릭 | 이동 (href="#"이면 "빈 링크" 기록) | | |
| 13 | Copyright 연도 | text | 읽기 | "2026" (2024면 ❌) | | |
| 14 | 배경색 | DOM | evaluate | #faf8f5 (베이지) | | |

### 1. /hub — 허브

**자동 검사 스크립트 실행 후, 발견된 clickable 모두 클릭 테스트:**

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 채팅 입력창 | textarea/input | 클릭 → 커서 | 포커스 됨, 타이핑 가능 | | |
| 2 | "안녕" 입력 | input | 타이핑 | 글자 보임 | | |
| 3 | 전송 버튼 | button | 클릭 | 응답이 옴 (CLI토큰 없으면 "CLI 토큰이 등록되지 않았습니다" — "INTERNAL_ERROR" 아님) | | |
| 4 | 제안 카드 1 "오늘 뉴스 브리핑" | button/card | 클릭 | 입력창에 텍스트 채워짐 | | |
| 5 | 제안 카드 2 | button/card | 클릭 | 입력창에 텍스트 채워짐 | | |
| 6 | 제안 카드 3 | button/card | 클릭 | 입력창에 텍스트 채워짐 | | |
| 7 | 제안 카드 4 | button/card | 클릭 | 입력창에 텍스트 채워짐 | | |
| 8 | "+ 새 대화" 버튼 | button | 클릭 | 대화 초기화 | | |
| 9 | 이전 대화 항목 | link/button | 클릭 | 해당 대화 로드 | | |
| 10 | 대화 삭제 버튼 | button | 클릭 | 확인 다이얼로그 또는 삭제 | | |
| 11 | 파일 첨부 버튼 | button | 클릭 | 파일 선택 대화상자 | | |
| 12 | Process Delegation 패널 | section | 존재 확인 | 표시됨 | | |
| 13 | 사이드바 "Dashboard" 메뉴 | link | 클릭 | /dashboard 이동 (inner sidebar에 가려서 안 눌리면 ❌❌❌) | | |
| 14 | 사이드바 모든 메뉴 | link | 위→아래 순서대로 전부 클릭 | 각각 올바른 페이지 이동 | | |

### 2. /dashboard — 대시보드

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 환영 메시지 | text | 읽기 | 로그인한 사용자 이름 (하드코딩 "CEO님" 아님) | | |
| 2 | "새로운 대화" 버튼/링크 | link | 클릭 | /hub 이동 | | |
| 3 | "워크플로우 생성" 버튼/링크 | link | 클릭 | /workflows 이동 또는 모달 | | |
| 4 | "주간 분석" 버튼/링크 | link | 클릭 | 이동 또는 반응 | | |
| 5 | 에이전트 현황 카드들 | card | 각각 클릭 | 반응 (이동 또는 상세) | | |
| 6 | 통계 카드 (숫자) | card | 클릭 | 반응 확인 | | |
| 7 | inner sidebar 없음 | DOM | evaluate | fixedLeftAsideCount = 0 | | |
| 8 | 모든 href="#" 링크 | link | 각각 클릭 | 실제 동작 (href="#"이면 "빈 링크" 기록) | | |

### 3. /chat — 채팅

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | "New Chat Session" 버튼 | button | 클릭 | 새 세션 생성 | | |
| 2 | 이전 대화 목록 항목 | link | 각각 클릭 | 해당 대화 로드 | | |
| 3 | 메시지 입력창 | input | 클릭 → "테스트" 입력 | 글자 보임 | | |
| 4 | 전송 버튼 | button | 클릭 | 메시지 전송 (CLI 토큰 에러라도 응답) | | |
| 5 | "작업 중단" 버튼 | button | (작업 중이면) 클릭 | 중단 반응 | | |
| 6 | 파일 첨부 버튼 | button | 클릭 | 파일 선택 | | |
| 7 | 에이전트 프로필 | card | 클릭 | 상세 표시 | | |
| 8 | Workspace/Debates/Archive 탭 | tab | 각각 클릭 | 탭 전환 | | |
| 9 | WebSocket 상태 | banner | 읽기 | "Reconnecting..." 배너 여부 기록 | | |

### 4. /agents — 에이전트

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 페이지 로드 | page | navigate | 에이전트 카드 보임 (빈 화면 ❌, "403" ❌) | | |
| 2 | "Deploy Agent" 버튼 | button | 클릭 | 생성 폼/모달 열림 | | |
| 3 | 생성 폼 — 이름 입력 | input | "테스트봇" 입력 | 글자 보임 | | |
| 4 | 생성 폼 — 부서 드롭다운 | select/dropdown | 클릭 → 선택 | 부서 목록 보임, 선택 가능 | | |
| 5 | 생성 폼 — 저장 버튼 | button | 클릭 | 성공 토스트 + 목록에 추가 | | |
| 6 | 에이전트 카드 클릭 | card | 클릭 | 상세 패널 열림 또는 선택 표시 | | |
| 7 | "Configure" 버튼 | button | 클릭 | 편집 모드 | | |
| 8 | 편집 — 이름 변경 | input | "테스트봇2" 입력 → 저장 | 반영됨 | | |
| 9 | 삭제 버튼 | button | 클릭 | 확인 다이얼로그 → 삭제 | | |
| 10 | 검색창 | input | "비서" 입력 | 필터링 동작 | | |
| 11 | 필터 드롭다운 (부서/활성) | select | 클릭 → 선택 | 필터링 동작 | | |
| 12 | "+ Deploy New Agent" 플레이스홀더 카드 | card | 클릭 | 생성 폼 열림 | | |
| 13 | 비서실장 삭제 시도 | button | 삭제 클릭 | 시스템 거부 (FR33) | | |
| 14 | 콘솔 에러 | console | 확인 | 403/500 **0개** | | |

### 5. /departments — 부서

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 페이지 로드 | page | navigate | 4개 부서 카드 보임 | | |
| 2 | "새 부서 추가" 버튼 | button | 클릭 | 생성 폼/모달 | | |
| 3 | 이름 입력 | input | "QA팀" 입력 | 입력됨 | | |
| 4 | 저장 | button | 클릭 | 성공 (UUID 에러 ❌) | | |
| 5 | 편집 버튼 (연필 아이콘) | button | 클릭 | 편집 모드 | | |
| 6 | 이름 변경 → 저장 | input+button | "품질관리팀" → 저장 | 반영됨 (UUID 에러 ❌) | | |
| 7 | 삭제 버튼 | button | 클릭 | 확인 다이얼로그 | | |
| 8 | 삭제 확인 | button | 확인 클릭 | 삭제 성공 (UUID 에러 ❌) | | |
| 9 | "상세보기" 버튼 | button | 클릭 | 상세 패널/모달 | | |
| 10 | MoreVertical (⋮) 메뉴 | button | 클릭 | 드롭다운 메뉴 | | |
| 11 | 검색창 | input | "경영" 입력 | 필터링 | | |
| 12 | "필터" 버튼 | button | 클릭 | 필터 UI | | |
| 13 | 통계 카드 4개 (전체부서/활성에이전트/평균효율/응답속도) | card | 각각 클릭 | 반응 확인 (없으면 기록) | | |
| 14 | "최근 변경 내역" 링크 | link | "모든 내역 보기" 클릭 | 이동 또는 반응 | | |
| 15 | 콘솔 에러 | console | 확인 | 500 **0개** | | |

### 6. /tiers — 티어

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 페이지 로드 | page | navigate | 빈 화면 아님 | | |
| 2 | "New Tier" 버튼 | button | 클릭 | 생성 폼 | | |
| 3 | 이름/설명 입력 | input | 입력 | 글자 보임 | | |
| 4 | 저장 | button | 클릭 | 성공 | | |
| 5 | 편집 버튼 | button | 클릭 | 편집 모드 | | |
| 6 | 삭제 버튼 | button | 클릭 | 확인 → 삭제 | | |
| 7 | 검색창 | input | "manager" 입력 | 필터링 | | |
| 8 | Filter 버튼 | button | 클릭 | 반응 | | |
| 9 | Refresh 버튼 | button | 클릭 | 새로고침 | | |
| 10 | 상단 nav 탭 (Dashboard/Workspace/Tiers/Settings) | link | 각각 클릭 | href="#"이면 "빈 링크" 기록 | | |
| 11 | 하단 footer 링크 (API Documentation 등) | link | 각각 클릭 | href="#"이면 "빈 링크" 기록 | | |

### 7. /jobs — 작업

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 작업 생성 버튼 | button | 클릭 | 생성 폼/모달 | | |
| 2 | 에이전트 선택 드롭다운 | select | 클릭 → 선택 | 에이전트 목록 보임 | | |
| 3 | 지시 입력 | textarea | "테스트 작업" 입력 | 글자 보임 | | |
| 4 | 저장/등록 | button | 클릭 | "작업이 등록되었습니다" 토스트 | | |
| 5 | 작업 행 클릭 | row | 클릭 | 상세 표시 | | |
| 6 | 작업 삭제 | button | 클릭 → 확인 | "작업이 취소되었습니다" | | |
| 7 | 탭 (Jobs/Schedules 등) | tab | 각각 클릭 | 탭 전환 | | |
| 8 | 필터 버튼들 | button | 각각 클릭 | 반응 | | |
| 9 | inner sidebar 없음 | DOM | evaluate | fixedLeftAsideCount = 0 | | |

### 8. /reports — 보고서

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 페이지 로드 | page | navigate | 콘텐츠 보임 (빈 화면이면 기록) | | |
| 2 | 보고서 목록 | list | 존재 확인 | 보고서 항목 있으면 클릭 | | |
| 3 | 한글 깨짐 여부 | text | 읽기 | 한글 정상 (mojibake ❌) | | |
| 4 | 모든 버튼 | button | 각각 클릭 | 반응 기록 | | |
| 5 | 검색/필터 | input | 입력 | 동작 | | |

### 9. /trading — 전략실

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | BUY 버튼 | button | 클릭 | 다이얼로그 열림 (반응없음 = ❌) | | |
| 2 | SELL 버튼 | button | 클릭 | 다이얼로그 열림 | | |
| 3 | 1H/4H/1D/1W 타임프레임 | button group | 각각 클릭 | 선택 변경 | | |
| 4 | 종목 카드 (NVDA/AAPL 등) | card | 클릭 | 반응 (선택 또는 상세) | | |
| 5 | Portfolio/Analytics 탭 | tab | 클릭 | 탭 전환 | | |
| 6 | Strategy Agent 채팅 입력 | input | "분석해줘" 입력 | 글자 보임 | | |
| 7 | 검색창 | input | "TSLA" 입력 | 필터링 | | |

### 10. /nexus — 조직도

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | React Flow 캔버스 | canvas | 로드 | 노드 보임 (CORTHEX HQ + 4부서 + 4에이전트) | | |
| 2 | Zoom In 버튼 | button | 클릭 | 확대 | | |
| 3 | Zoom Out 버튼 | button | 클릭 | 축소 | | |
| 4 | Fit View 버튼 | button | 클릭 | 전체 보기 | | |
| 5 | 편집 모드 토글 (Admin) | toggle | 클릭 | 편집 모드 On/Off | | |
| 6 | Add Department | button | 클릭 | 추가 UI | | |
| 7 | Add Agent | button | 클릭 | 추가 UI | | |
| 8 | Save Draft | button | 클릭 | 저장 | | |
| 9 | Publish Changes | button | 클릭 | 발행 | | |
| 10 | 노드 클릭 | node | 클릭 | 상세 패널 | | |

### 11. /knowledge — 라이브러리

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 페이지 로드 | page | navigate | 콘텐츠 보임 | | |
| 2 | 문서/메모리 탭 | tab | 각각 클릭 | 전환 | | |
| 3 | 검색창 | input | "test" 입력 | 필터링 | | |
| 4 | 폴더 클릭 | tree item | 클릭 | 펼침/접음 | | |
| 5 | 모든 버튼 | button | 각각 클릭 | 반응 기록 | | |

### 12. /sns — SNS

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | inner sidebar 없음 | DOM | evaluate | fixedLeftAsideCount = 0 | | |
| 2 | Dashboard/SNS Management/Analytics/Settings 탭 | tab/nav | 각각 클릭 | 전환 | | |
| 3 | "New Project" 버튼 | button | 클릭 | 반응 (모달/폼 또는 반응없음 기록) | | |
| 4 | "Create Post" 버튼 | button | 클릭 | 에디터 열림 (반응없음 = ❌) | | |
| 5 | "Generate New Content" 버튼 | button | 클릭 | 반응 | | |
| 6 | "Approve" 버튼 | button | 클릭 | 상태 변경 (반응없음 = ❌) | | |
| 7 | "Edit Draft" 버튼 | button | 클릭 | 편집 모드 | | |
| 8 | "Reschedule" 버튼 | button | 클릭 | 날짜 변경 UI | | |
| 9 | "View Stats" 버튼 | button | 클릭 | 통계 표시 | | |
| 10 | "Switch to Board" 버튼 | button | 클릭 | 뷰 전환 | | |
| 11 | Content Library/Publication Queue/Card News 버튼 | button | 각각 클릭 | 반응 | | |
| 12 | 플랫폼/상태 필터 | dropdown | 각각 클릭 → 선택 | 필터링 | | |

### 13. /messenger — 메신저

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | Messages/Contacts/Files 탭 | tab | 각각 클릭 | 전환 | | |
| 2 | 채팅방 항목 | item | 클릭 | 대화 로드 | | |
| 3 | 메시지 입력 | input | "테스트" 입력 | 글자 보임 | | |
| 4 | 전송 | button | 클릭 | 반응 | | |
| 5 | 연락처 클릭 | item | 클릭 | 프로필/채팅 시작 | | |

### 14. /agora — 토론

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | Workspace/Debates/Archive 탭 | tab | 각각 클릭 | 전환 | | |
| 2 | "New Debate" 버튼 | button | 클릭 | 생성 UI | | |
| 3 | 토론 항목 클릭 | card | 클릭 | 상세 | | |
| 4 | API Documentation 등 footer 링크 | link | 각각 클릭 | href="#"이면 기록 | | |

### 15. /files — 파일

| # | 요소 | 타입 | 조작 | 기대 결과 | 실제 | 판정 |
|---|------|------|------|----------|------|------|
| 1 | 업로드 버튼 | button | 클릭 | 파일 선택 대화상자 | | |
| 2 | 전체/이미지/문서/기타 필터 | button group | 각각 클릭 | 필터 전환 | | |
| 3 | 검색 | input | "test" 입력 | 필터링 | | |
| 4 | 정렬 드롭다운 | dropdown | 클릭 → 선택 | 정렬 변경 | | |
| 5 | 리스트/그리드 토글 | button | 클릭 | 뷰 전환 | | |
| 6 | 드래그&드롭 영역 | dropzone | 존재 확인 | "Drag and drop" 텍스트 | | |

### 16~25. 나머지 페이지 (동일 패턴)

**아래 페이지 모두 동일하게:**
- /costs, /performance, /activity-log, /ops-log, /workflows, /notifications, /classified, /settings, /sketchvibe, /onboarding

**각 페이지에서:**
1. 자동 검사 스크립트 실행
2. **발견된 모든 clickable 요소** (clickableCount개) 중 눈에 보이는 것 **전부 클릭**
3. **발견된 모든 input 요소** (inputCount개)에 **전부 텍스트 입력**
4. 드롭다운/select → 전부 열어서 선택
5. 탭 → 전부 클릭해서 전환
6. CRUD → 생성→수정→삭제 전체 사이클
7. 콘솔 에러 기록
8. **반응 없는 요소 전부 기록** (이게 가장 중요!)

#### /workflows 특별 체크:
| # | 요소 | 조작 | 기대 | 판정 |
|---|------|------|------|------|
| 1 | 워크플로우 생성 | 이름/설명/단계 → 생성 | 성공 | |
| 2 | Suggestions 탭 | 클릭 | 전환 (500에러 없이) | |
| 3 | 삭제 | 확인 → 삭제 | 성공 | |

#### /settings 특별 체크:
| # | 요소 | 조작 | 기대 | 판정 |
|---|------|------|------|------|
| 1 | 8개 탭 | 각각 클릭 | 전환 | |
| 2 | 이름 변경 → 저장 | 입력 → 저장 버튼 | 토스트 + 사이드바 반영 | |
| 3 | 비밀번호 변경 폼 | 입력 | disabled 상태면 기록 | |

#### /sketchvibe 특별 체크:
| # | 요소 | 조작 | 기대 | 판정 |
|---|------|------|------|------|
| 1 | inner sidebar 없음 | evaluate | fixedLeftAsideCount = 0 | |
| 2 | React Flow 컨트롤 | 클릭 | Zoom/Fit 동작 | |
| 3 | 시작/종료 버튼 | 클릭 | 반응 | |

---

## ROUND 2: Admin 패널 16개 전수

```
browser_navigate → https://corthex-hq.com/admin/login
admin / admin1234 로그인
```

**모든 Admin 페이지에서:**
1. 로드 확인 (빈 화면 = ❌)
2. 콘솔 500 에러 수 기록
3. 모든 버튼 클릭 → 반응
4. 모든 입력 → 텍스트 입력
5. CRUD → 전체 사이클

| # | 페이지 | 로드 | 500에러수 | 버튼반응 | 입력동작 | CRUD | 반응없는요소 | 판정 |
|---|--------|------|---------|---------|---------|------|-----------|------|
| 1 | /admin | | | | | | | |
| 2 | /admin/users | | | | | | | |
| 3 | /admin/employees | | | | 초대폼 | 초대 | | |
| 4 | /admin/departments | | | | | C→R→U→D | | |
| 5 | /admin/agents | | | | | C→R→U→D | | |
| 6 | /admin/credentials | | | | | 토큰등록 | | |
| 7 | /admin/tools | | | | | | | |
| 8 | /admin/costs | | | | | | | |
| 9 | /admin/report-lines | | | | | | | |
| 10 | /admin/soul-templates | | | | | | | |
| 11 | /admin/monitoring | | | | | | | |
| 12 | /admin/nexus | | | | | | | |
| 13 | /admin/onboarding | | | | | | | |
| 14 | /admin/settings | | | | | | | |
| 15 | /admin/companies | | | | | C→비활성화 | | |
| 16 | /admin/workflows | | | | | | | |

---

## ROUND 3: CEO 계정 전수 + 보안

```
App 로그아웃 → ceo / ceo1234 로그인
```

### CEO App 25페이지 전수
ROUND 1과 동일 패턴으로 25개 페이지 전부. 특히:
- 모든 버튼 클릭 → 반응
- 모든 입력 → 텍스트 입력
- **반응 없는 요소 전부 기록**

### CEO 보안 테스트

| # | 테스트 | 조작 | 기대 결과 | 판정 |
|---|--------|------|----------|------|
| 1 | Admin API 13개 차단 | fetch 13개 API → status | 전부 **403** | |
| 2 | /admin 페이지 접근 | navigate → /admin | 리다이렉트/차단 | |
| 3 | NEXUS 편집 모드 | /nexus → snapshot | "편집 모드" 토글 **안 보임** | |
| 4 | NEXUS "Save Draft" | /nexus → snapshot | 버튼 **안 보임** | |
| 5 | NEXUS "Publish Changes" | /nexus → snapshot | 버튼 **안 보임** | |

---

## 출력 포맷

`_qa-e2e/playwright-claude-code/VERIFY-RESULT.md`에 기록:

```markdown
# 전수 E2E 검증 리포트
> 검증일: {날짜}
> 사이트: https://corthex-hq.com

## 요약
| 항목 | 수치 |
|------|------|
| 검사 페이지 수 | /66 (App25×2계정 + Admin16) |
| 총 클릭한 요소 수 | |
| 총 입력 테스트 수 | |
| **반응 없는 요소 수** | |
| 콘솔 403 에러 | |
| 콘솔 500 에러 | |
| Material Symbols 잔재 | |
| 이중 사이드바 | |

## 반응 없는 요소 목록 (가장 중요!)

### /페이지명
| # | 요소 텍스트/설명 | 타입 | 클릭 결과 | 원인 추정 |
|---|----------------|------|----------|----------|
| 1 | "Approve" 버튼 | button | 무반응 | onClick 미구현 |
| 2 | "Create Post" | button | 무반응 | 핸들러 없음 |

(모든 페이지에서 발견된 것 전부)

## 빈 링크 (href="#") 목록

### /페이지명
| # | 링크 텍스트 | 위치 |
|---|-----------|------|
| 1 | "API Documentation" | footer |

## CRUD 테스트 결과
| 대상 | Create | Read | Update | Delete | 에러 |
|------|--------|------|--------|--------|------|
| 에이전트 | ✅/❌ | | | | |
| 부서 | ✅/❌ | | | | |
| 티어 | ✅/❌ | | | | |
| 작업 | ✅/❌ | | | | |
| 워크플로우 | ✅/❌ | | | | |

## 콘솔 에러 전문
(페이지별로 복사)

## 새로 발견된 버그
### BUG-V001: {한줄 요약}
- 심각도 / 페이지 / 재현 / 실제 동작
```

## 규칙
- **코드 수정 금지.** 검증 + 기록만.
- **git commit/push 금지.**
- **반응 없는 요소가 가장 중요한 버그.** 버튼인데 안 눌림, 링크인데 안 감, 입력인데 안 써짐 → 전부 기록.
- 스크린샷만 = 미검사. 모든 인터랙션 전수 필수.
- href="#" 링크 전부 기록.
