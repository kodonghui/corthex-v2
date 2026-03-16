# Prompt 3: Claude Desktop (Cowork) — 스펙 기반 전수 E2E + 근본 원인 분석

## 역할
CORTHEX v2 (https://corthex-hq.com)의 **스펙 기반 E2E QA + 근본 원인 분석**.
PRD를 읽고, 각 기능이 실제로 동작하는지 검증 + DOM/CSS로 왜 안 되는지 원인까지 파악.

## 로그인 정보
- **Admin**: `admin` / `admin1234`
- **CEO**: `ceo` / `ceo1234`

## 디자인 기준
**Natural Organic (라이트 모드)**. 배경: 베이지(#faf8f5), 액센트: 올리브그린(#5a7247).

## 핵심 원칙
1. **PRD를 먼저 읽고** 각 FR을 이해한 후 테스트
2. **스크린샷만 찍으면 미검사** — 모든 인터랙션 직접 조작
3. **안 되면 DOM/CSS로 원인까지 파악** — 다른 2명과의 차별점

## 사전 작업
1. `_bmad-output/planning-artifacts/prd.md` 읽기 → FR1~FR72
2. `_bmad-output/planning-artifacts/architecture.md` 읽기 → API 엔드포인트, 데이터 흐름
3. `_corthex_full_redesign/phase-7-stitch/1_natural_organic/` → 레퍼런스 TSX

---

## ROUND 1: Admin — 스펙 기반 전수 E2E

### 로그인

1. https://corthex-hq.com 접속
2. 빈 폼 → 에러? / 틀린 비번 → 에러? / admin/admin1234 → 성공?
3. DOM 검사: `document.querySelectorAll('form').length`, 배경색 확인

### /hub — 허브

**PRD 기반 테스트:**

| FR | 테스트 | 조작 | 기대 | 실제 | 안 되면 DOM 원인 |
|----|------|------|------|------|----------------|
| FR1 | 자연어 명령 | "안녕" 입력 → 전송 | 응답 옴 | | `fetch('/api/...') 네트워크 탭 확인` |
| FR6 | SSE 스트리밍 | 전송 후 | 실시간 글자 | | `EventSource 연결 확인` |
| FR7 | 에러 처리 | 잘못된 요청 | 에러 메시지 | | `console.error 확인` |
| FR14 | 비서 있는 허브 | 로그인 후 | 채팅 중심 | | `에이전트 목록 DOM 존재 여부` |
| FR46 | 핸드오프 트래커 | 핸드오프 발생 | 실시간 표시 | | `트래커 컴포넌트 DOM` |
| FR62 | 대화 기록 | 사이드바 대화 클릭 | 로드됨 | | `API 호출 확인` |
| FR65 | 파일 첨부 | 첨부 버튼 | 파일 선택 | | `input[type=file] 존재` |
| FR66 | 작업 취소 | 취소 버튼 | 중단됨 | | `AbortController 확인` |
| FR67 | 응답 복사 | 복사 버튼 | 클립보드 | | `navigator.clipboard 호출` |
| FR68 | 마크다운 | 표/코드 응답 | 렌더링됨 | | `prose 클래스 확인` |

**인터랙션 전수:**
- 입력창 → 입력 되는지
- 전송 버튼 → 반응
- 새 대화 → 초기화
- 사이드바 대화 클릭 → 로드
- 파일 첨부 버튼 → 파일 선택
- 에이전트 선택 → 변경
- 복사 버튼 → 복사
- 취소 버튼 → 중단

### /agents — 에이전트 (FR20~FR29, FR33)

**CRUD 전체 사이클:**

| 단계 | 조작 | 기대 | 안 되면 DOM |
|------|------|------|-----------|
| 목록 | 로드 | 에이전트 카드 보임 | `querySelectorAll('[data-agent-id]')` |
| 생성 | 추가 → "테스트봇" → 저장 | 목록에 추가 | 네트워크 POST 확인 |
| Soul 편집 | 클릭 → Soul 수정 → 저장 | 저장 성공 | PATCH API 확인 |
| 도구 할당 | 도구 체크 → 저장 | 할당 반영 | 도구 목록 API |
| 수정 | 이름 변경 → 저장 | 반영 | PATCH API |
| 삭제 | 삭제 → 확인 | 사라짐 | DELETE API |
| 비서실장 삭제 | 삭제 시도 | 거부 | 에러 응답 확인 |
| 검색 | "비서" 입력 | 필터링 | 필터 로직 확인 |

### /departments — 부서 (FR26)

| 단계 | 조작 | 기대 | 안 되면 DOM |
|------|------|------|-----------|
| 목록 | 로드 | 4개 부서 | API 응답 확인 |
| 생성 | 추가 → "QA팀" → 저장 | 추가됨 | POST API |
| 수정 | "품질관리팀"으로 변경 | 반영 | PATCH API |
| 삭제 | 삭제 → 확인 | 사라짐 | DELETE API |
| 소속 에이전트 | 부서 클릭 | 에이전트 목록 | 하위 API |

### 나머지 모든 페이지 — 동일 패턴

아래 모든 페이지에서 **전수 인터랙션 + DOM 원인 분석:**

```
/chat, /dashboard, /tiers, /jobs, /reports, /trading, /nexus,
/knowledge, /sns, /messenger, /agora, /files, /costs,
/performance, /activity-log, /ops-log, /workflows,
/notifications, /classified, /settings, /sketchvibe, /onboarding

/admin/dashboard, /admin/users, /admin/employees,
/admin/departments, /admin/agents, /admin/credentials,
/admin/tools, /admin/costs, /admin/report-lines,
/admin/soul-templates, /admin/nexus, /admin/onboarding,
/admin/monitoring, /admin/settings, /admin/companies,
/admin/workflows
```

**각 페이지에서 반드시:**
- 모든 버튼 → 클릭 → 반응 기록 (무반응이면 DOM에 onClick 있는지 확인)
- 모든 입력 → 텍스트 입력 → 되는지 (안 되면 disabled/readonly 확인)
- 모든 폼 → 제출 → 성공/실패 (실패면 네트워크 탭에서 API 응답 확인)
- 모든 드롭다운 → 열기 → 선택 (안 열리면 이벤트 핸들러 확인)
- CRUD → 전체 사이클 (안 되면 API 요청/응답 확인)
- 콘솔 에러 전문 복사

### 보안 테스트 (FR40~FR45)

| FR | 테스트 | 방법 | 기대 |
|----|------|------|------|
| FR41 | 토큰 마스킹 | 에이전트 응답에서 API 키 패턴 확인 | 마스킹됨 |
| FR43 | 암호화 | /admin/credentials API 키 표시 | 마스킹됨 |
| FR45 | 멀티테넌트 | 네트워크 탭에서 다른 companyId 요청 시도 | 거부됨 |

---

## ROUND 2: CEO 계정

1. 로그아웃 → ceo / ceo1234 로그인
2. 사이드바 메뉴 전부 기록 (Admin과 비교)
3. App 25개 전수 E2E (ROUND 1 동일)
4. CEO Admin 접근: /admin/* 16개 → 전부 거부?
5. Admin 전용 버튼 숨김 확인

---

## ROUND 3: 근본 원인 분석 (너만의 역할)

### 테마 분석
```js
// 배경색 — 베이지(#faf8f5)여야 정상
getComputedStyle(document.body).backgroundColor

// dark 클래스 — 없어야 정상 (Natural Organic = 라이트)
document.documentElement.classList.contains('dark')

// 사이드바 개수 — 1개여야 정상
document.querySelectorAll('nav').length

// 올리브그린 색상 사용 확인
document.querySelectorAll('[style*="5a7247"]').length
document.querySelectorAll('[class*="olive"]').length

// 이전 다크 테마 잔재
document.querySelectorAll('[style*="020617"]').length
document.querySelectorAll('[style*="0f172a"]').length
```

### 폰트 분석
```js
// 헤딩에 Noto Serif KR 있어야 정상
document.querySelectorAll('h1,h2,h3').forEach(h =>
  console.log(h.tagName, getComputedStyle(h).fontFamily))

// Network → Font → 어떤 폰트 로드되는지
```

### API 연결 분석
```js
// 각 페이지에서 네트워크 요청 확인
// 200 OK? 401? 404? 500?
// 응답 body가 실제 데이터인지 빈 배열인지
```

---

## 출력

`_qa-e2e/browser-claude-desktop/BUGS.md`에 기록:

```markdown
# Claude Desktop 스펙 기반 E2E + 근본 원인 리포트
> 검사일: 2026-03-16
> 검사자: Claude Desktop
> 기준: PRD FR1~FR72

## FR 커버리지
- 테스트: {N}/72 | PASS: {N} | FAIL: {N} | 미구현: {N}

## 근본 원인 분석

| 현상 | DOM/CSS 증거 | 추정 원인 코드 |
|------|------------|--------------|
| 다크 배경 | `html.classList = ['dark']` | App.tsx:67 |
| 사이드바 2개 | `nav` 요소 3개 | 페이지 TSX에 nav 포함 |
| ... | | |

## 인터랙션 전수 결과 (페이지별)

### /hub
| 요소 | 조작 | 결과 | FR | DOM 원인 (실패 시) |
|------|------|------|----|--------------------|
| 입력창 | 입력 | ✅/❌ | FR1 | |
| 전송 | 클릭 | ✅/❌ | FR1 | API 응답: {status} |
| ... | | | | |

(모든 페이지)

## 버그 목록

### BUG-D001: {한줄 요약}
- **위반 FR**: FR-XX
- **심각도**: Critical / Major / Minor / Security
- **페이지**: /{path}
- **PRD 기준**: "{FR 원문}"
- **실제**: {동작}
- **DOM 분석**: {증거}
- **API 분석**: {요청/응답}
- **추정 원인 코드**: {파일:라인}
```

## 규칙
- **PRD 먼저 읽기.** FR을 모르고 테스트하면 의미 없음.
- **코드 수정 금지.** 검사 + 분석 + 기록만.
- **git commit/push 금지.**
- 스크린샷만 = 미검사. 모든 인터랙션 전수 필수.
- 콘솔 에러 전문 복사.
- 안 되는 것 → DOM/네트워크 원인까지 파악.
