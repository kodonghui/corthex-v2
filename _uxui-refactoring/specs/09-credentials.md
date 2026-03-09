# Credentials (CLI 토큰 / API 키 관리 — Admin) UX/UI 설명서

> 페이지: #09 credentials
> 패키지: admin
> 경로: /admin/credentials
> 작성일: 2026-03-09

---

## 1. 페이지 목적

관리자가 직원별 **Claude OAuth 토큰**과 **외부 API 키**를 등록, 관리하는 보안 설정 페이지. AI 에이전트가 실제로 동작하려면 인간 직원의 CLI 토큰이 필요.

**핵심 사용자 시나리오:**
- 직원 목록에서 대상 선택
- Claude OAuth 토큰 등록 (sk-ant-oat01-... 형식)
- 외부 API 키 등록 (KIS 증권, Notion, Email, Telegram 등)
- 토큰/키 비활성화 및 삭제

---

## 2. 현재 레이아웃 분석

### 데스크톱
```
┌─────────────────────────────────────────────────────┐
│ Header: "CLI 토큰 / API 키 관리"                     │
│ "직원별 Claude OAuth 토큰 및 외부 API 키를 관리합니다" │
├─────────────────────────────────────────────────────┤
│ [Claude OAuth 토큰 찾는 법 — 안내 박스]               │
├───────────────┬─────────────────────────────────────┤
│ 직원 선택      │  CLI OAuth 토큰 — {직원명}            │
│ (1/3 너비)    │  [+ 토큰 등록]                        │
│               │  토큰 목록 (라벨, 등록일, 활성 상태)    │
│ 직원1 ←선택   │                                      │
│ 직원2         │──────────────────────────────────────│
│ 직원3         │  외부 API 키                          │
│               │  [+ API 키 등록]                      │
│               │  키 목록 (제공자, 범위, 라벨, 등록일)    │
└───────────────┴─────────────────────────────────────┘
```

---

## 3. 현재 문제점

1. **직원 목록 디자인**: 단순 버튼 목록, 아바타/역할 정보 없음
2. **가이드 박스**: 유용하지만 노란색 경고 스타일이 "에러"처럼 보임
3. **토큰/키 등록 폼**: 인라인 폼이 목록 위에 나타나 레이아웃 밀림
4. **보안 표시 부족**: 토큰이 민감한 데이터인데 보안 관련 시각적 단서 없음
5. **API 키 범위(scope)**: company/user 선택이 작은 select로만 구분
6. **빈 상태**: "등록된 토큰이 없습니다" 단순 텍스트
7. **토큰 마스킹**: 토큰 값이 표시되지 않지만 마스킹 된 값(sk-ant-oat01-***) 프리뷰도 없음
8. **비활성화 확인**: confirm() 기본 대화상자 사용

---

## 4. 개선 방향

### 4.1 디자인 톤
- **톤은 Banana2(디자인 AI)가 결정** — 특정 테마 강제 없음
- 보안 설정 페이지 느낌 (GitHub Settings > Tokens, AWS IAM 참고)
- 민감 데이터임을 시각적으로 전달 (자물쇠 아이콘, 보안 뱃지 등)

### 4.2 레이아웃 개선
- **직원 목록**: 아바타 + 역할 표시, 직원 수 10명 이상 시 검색 입력 표시 (프론트 필터링, API 변경 없음)
- **가이드**: 더 친근한 정보 박스 스타일
- **토큰 카드**: 보안 레벨 표시, 마스킹된 프리뷰 (서버 응답에 마스킹 필드가 있으면 사용, 없으면 라벨만 표시)

### 4.3 인터랙션 개선
- 토큰/키 등록: 모달로 변경 (레이아웃 밀림 방지) -- AddTokenModal, AddApiKeyModal 컴포넌트
- 비활성화/삭제: 커스텀 확인 다이얼로그 (ConfirmDialog) -- native confirm() 대체
- 토큰 복사 방지 표시
- 가이드 박스: 접기(collapse) 기능 추가 (익숙한 관리자용). **접기 상태는 localStorage에 저장** — 세션 간 유지

### 4.4 상태 UI 정의
- **로딩 상태**: 직원 목록, 토큰 목록, API 키 목록 각각 스켈레톤 UI 표시
- **에러 상태**: API 호출 실패 시 에러 메시지 + 재시도 버튼 표시
- **빈 상태**: 아이콘 + 안내 텍스트 + 등록 유도 버튼 (단순 텍스트가 아닌 시각적 빈 상태)
- **직원 미선택 상태**: 우측 2/3 영역에 "직원을 선택하세요" placeholder 표시 (아이콘 + 안내 텍스트). 토큰/키 등록 버튼 비활성화

---

## 5. 컴포넌트 목록 (개선 후)

| # | 컴포넌트 | 변경 사항 | 파일 |
|---|---------|---------|------|
| 1 | CredentialsPage | 전체 레이아웃 + data-testid 추가 + 로딩/에러 상태 | pages/credentials.tsx |
| 2 | AddTokenModal | 토큰 등록 모달 (인라인 폼 -> 모달 전환) | pages/credentials.tsx 내부 또는 별도 |
| 3 | AddApiKeyModal | API 키 등록 모달 (인라인 폼 -> 모달 전환) | pages/credentials.tsx 내부 또는 별도 |
| 4 | ConfirmDialog | 비활성화/삭제 커스텀 확인 다이얼로그 | 공유 UI 컴포넌트 활용 |

> **참고:** 현재 구현체에 `data-testid` 속성이 없으므로, 모든 testid를 신규 추가해야 합니다.

---

## 6. 데이터 바인딩

| 데이터 | 소스 | 용도 |
|--------|------|------|
| users | useQuery → /admin/users?companyId=X | 직원 목록 |
| creds | useQuery → /admin/cli-credentials?userId=X | CLI 토큰 목록. 마스킹 프리뷰: 서버 응답에 maskedToken 필드가 있으면 표시, 없으면 라벨만 표시 (프론트에서 토큰 원문 접근 불가) |
| apiKeys | useQuery → /admin/api-keys?userId=X | API 키 목록 |
| selectedUserId | useState | 선택된 직원 |
| showAddToken | useState | 토큰 등록 폼 토글 |
| showAddApiKey | useState | API 키 등록 폼 토글 |

**API 엔드포인트 (변경 없음):**
- `GET /api/admin/users?companyId=X` — 직원 목록
- `GET /api/admin/cli-credentials?userId=X` — CLI 토큰 목록
- `POST /api/admin/cli-credentials` — 토큰 등록
- `DELETE /api/admin/cli-credentials/:id` — 토큰 비활성화
- `GET /api/admin/api-keys?userId=X` — API 키 목록
- `POST /api/admin/api-keys` — API 키 등록
- `DELETE /api/admin/api-keys/:id` — API 키 삭제

---

## 7. 색상/톤 앤 매너

| 용도 | 설명 |
|------|------|
| 활성 토큰 | 초록 뱃지 |
| 비활성 토큰 | 빨강 뱃지 |
| 보안 가이드 | 앰버/정보 박스 스타일 |
| 제공자 뱃지 | 파랑 (각 제공자 구분) |
| 선택된 직원 | 인디고 하이라이트 |
| 삭제/비활성화 | 빨강 텍스트/버튼 |

---

## 8. 반응형 대응

| Breakpoint | 변경 사항 |
|------------|---------|
| **1440px+** (Desktop) | 3컬럼 그리드 (직원 1/3 + 토큰/키 2/3) |
| **768px~1439px** (Tablet) | 2컬럼 (직원 1/3 + 토큰/키 2/3) |
| **~375px** (Mobile) | 1컬럼: 직원 선택 → 토큰/키 목록 전환 (상단에 "< 직원 목록" 뒤로가기 버튼 표시). 뒤로가기 시 `selectedUserId` 초기화 (stale data 방지) |

---

## 9. 기존 기능 참고사항

v1-feature-spec.md에 직접 대응하는 항목은 없지만, CLI 토큰은 AI 에이전트 두뇌의 핵심:
- "인간 직원이 Claude CLI Max 구독 토큰 등록 → AI 에이전트가 그 토큰으로 실행"
- "API 과금" 표현 금지 → "CLI 토큰으로 호출" "CLI 구독으로 실행"

- [x] 직원별 CLI OAuth 토큰 CRUD
- [x] 외부 API 키 CRUD (KIS, Notion, Email, Telegram)
- [x] 토큰 활성/비활성 상태 관리 (**비활성화 = soft delete, 현재 API에서 재활성화 기능 없음**. 비활성 토큰은 목록에 남아있지만 에이전트가 사용 불가)
- [x] API 키 범위 (company/user)
- [x] 가이드: OAuth 토큰 찾는 법

**UI 변경 시 절대 건드리면 안 되는 것:**
- addTokenMutation, deactivateTokenMutation 로직
- addApiKeyMutation, deleteApiKeyMutation 로직
- selectedCompanyId + selectedUserId 기반 쿼리
- apiKeyForm.scope ('company' | 'user') 범위 전달

---

## 10. Banana2 이미지 생성 프롬프트

### 데스크톱 버전
```
Design the CONTENT AREA of a single page inside a web application. This is NOT a standalone app — it lives inside an existing app shell that already provides a left navigation sidebar and a top header. You are designing ONLY the main content region.

Product: CORTHEX — admin panel for managing an AI agent organization.

This page: A security/credentials management page where the admin registers and manages authentication tokens and API keys for each employee. AI agents need human employees' CLI tokens to operate. Also manages external API keys (stock broker, email, etc.).

User workflow:
1. Admin sees a list of employees (human users) in the left panel
2. Selects an employee to see their registered tokens and API keys
3. A helpful guide box explains how to find the Claude OAuth token
4. Admin can register new CLI OAuth tokens (label + token value)
5. Admin can register external API keys (provider: KIS/Notion/Email/Telegram, scope: personal/company, key value)
6. Admin can deactivate CLI tokens or delete API keys

IMPORTANT — App shell context:
- LEFT SIDEBAR and TOP HEADER already exist. Design CONTENT AREA only.
- Desktop content area: approximately 1200px wide and 850px tall.

Required functional elements:
1. Page header — "CLI Token / API Key Management" with subtitle.
2. Guide box — informational callout explaining how to find the Claude OAuth token (step-by-step instructions). Should feel helpful, not alarming.
3. Employee list (left, ~1/3 width) — list of employees with name and username. Selected employee is highlighted. Optional: search/filter input at the top if the list is long.
4. Token section (right, ~2/3 width) — for the selected employee:
   a. CLI OAuth Tokens — header with employee name, "+ Register Token" button. List of tokens showing: label, registration date, active/inactive badge, deactivate button.
   b. External API Keys — header, "+ Register API Key" button. List of keys showing: provider badge (KIS/Notion/etc.), scope badge (personal/company), label, registration date, delete button.
5. Registration forms — modal dialogs (not inline). Token form: label + textarea for token value. API key form: provider selector, scope (personal/company radio), label, key input (password field). Modals prevent layout shift.
6. Empty state — "No registered tokens" / "No registered API keys" with icon and CTA button.
7. Security indicators — visual cues that this is sensitive data (lock icons, masked token preview like "sk-ant-oat01-***", etc.).
8. Loading state — skeleton placeholders while data loads (employee list, token list, API key list each independently).
9. Error state — error message with retry button when API call fails.
10. Guide box — collapsible (with toggle button) so experienced admins can hide it.

Design tone — YOU DECIDE:
- This is a security settings page. Think GitHub Settings > Personal Access Tokens, or AWS IAM credentials.
- Should feel secure and professional. Sensitive data handling should be visually communicated.
- Light or dark theme — your choice.

Design priorities:
1. It must be clear which employee's credentials you're viewing.
2. The guide box should be helpful for first-time setup.
3. Token/key status (active/inactive) must be immediately visible.

Resolution: 1440x900, pixel-perfect UI screenshot style.
```

### 모바일 버전
```
Mobile version (375x812) of the same credentials management page.

IMPORTANT — Mobile context: BOTTOM TAB BAR and TOP HEADER already exist. Content area only.

Mobile-specific:
- Employee list as a full-width master view (NOT dropdown). Employee list IS the initial screen on mobile -- no placeholder needed.
- After selecting an employee, navigate to detail view showing token/key sections stacked vertically
- Back button ("< Employee List") in content area to return to master view. Navigating back clears selectedUserId (prevents stale data).
- Registration forms as full-screen modals
- Guide box collapsible

Design tone: Same as desktop. YOU DECIDE.
Resolution: 375x812, pixel-perfect mobile UI screenshot style.
```

---

## 11. data-testid 목록

| testid | 요소 | 용도 |
|--------|------|------|
| `credentials-page` | 페이지 컨테이너 | 페이지 로드 확인 |
| `credentials-header` | 페이지 헤더 | 제목 |
| `credentials-guide` | 가이드 박스 | 안내 표시 |
| `employee-list` | 직원 목록 | 직원 선택 영역 |
| `employee-item` | 직원 항목 | 개별 직원 |
| `token-section` | CLI 토큰 섹션 | 토큰 영역 |
| `token-add-btn` | 토큰 등록 버튼 | 등록 폼 열기 |
| `token-add-form` | 토큰 등록 폼 | 폼 영역 |
| `token-label-input` | 라벨 입력 | 토큰 라벨 |
| `token-value-input` | 토큰 값 입력 | OAuth 토큰 |
| `token-submit-btn` | 토큰 등록 제출 | 폼 제출 |
| `token-cancel-btn` | 토큰 등록 취소 | 폼 닫기 |
| `token-item` | 토큰 항목 | 개별 토큰 |
| `token-status-badge` | 활성/비활성 뱃지 | 상태 확인 |
| `token-deactivate-btn` | 비활성화 버튼 | 토큰 비활성화 |
| `apikey-section` | API 키 섹션 | API 키 영역 |
| `apikey-add-btn` | API 키 등록 버튼 | 등록 폼 열기 |
| `apikey-add-form` | API 키 등록 폼 | 폼 영역 |
| `apikey-provider-select` | 제공자 선택 | KIS/Notion 등 |
| `apikey-scope-select` | 범위 선택 | 개인/회사 |
| `apikey-label-input` | API 키 라벨 입력 | 키 라벨 |
| `apikey-key-input` | API 키 값 입력 | 키 값 (password) |
| `apikey-submit-btn` | API 키 등록 제출 | 폼 제출 |
| `apikey-cancel-btn` | API 키 등록 취소 | 폼 닫기 |
| `apikey-item` | API 키 항목 | 개별 키 |
| `apikey-scope-badge` | 범위 뱃지 | 개인/회사 구분 표시 |
| `apikey-delete-btn` | 삭제 버튼 | 키 삭제 |
| `confirm-dialog` | 커스텀 확인 다이얼로그 | 비활성화/삭제 확인 |
| `confirm-dialog-ok` | 확인 버튼 | 확인 액션 |
| `confirm-dialog-cancel` | 취소 버튼 | 취소 액션 |
| `credentials-loading` | 로딩 상태 | 스켈레톤/스피너 |
| `credentials-error` | 에러 상태 | 에러 메시지 + 재시도 |
| `credentials-empty` | 빈 상태 | 토큰/키 없을 때 |
| `guide-collapse-btn` | 가이드 접기 버튼 | 가이드 박스 토글 |
| `mobile-back-btn` | 모바일 뒤로가기 | 직원 목록으로 복귀 (모바일만) |
| `token-masked-preview` | 마스킹된 토큰 프리뷰 | sk-ant-oat01-*** 형태 표시 |
| `credentials-retry-btn` | 재시도 버튼 | 에러 상태에서 재로드 |
| `employee-search` | 직원 검색 입력 (선택적) | 직원 10명+ 시 프론트 필터링 |
| `credentials-no-selection` | 직원 미선택 placeholder | "직원을 선택하세요" 안내 |
| `apikey-provider-badge` | 제공자 뱃지 (KIS/Notion 등) | API 키 목록에서 제공자 시각 구분 |

---

## 12. Playwright 인터랙션 테스트 항목

| # | 테스트 | 동작 | 기대 결과 |
|---|--------|------|----------|
| 1 | 페이지 로드 | /admin/credentials 접속 | `credentials-page` 존재 |
| 2 | 가이드 표시 | 로드 완료 | `credentials-guide` 가이드 박스 표시 |
| 3 | 직원 선택 | 직원 클릭 | 토큰/키 섹션 표시 |
| 4 | 토큰 등록 | + 클릭 → 라벨+토큰 입력 → 등록 | 토큰 목록에 추가 |
| 5 | 토큰 비활성화 | 비활성화 클릭 → 확인 | 상태 변경 |
| 6 | API 키 등록 | + 클릭 → 제공자+키 입력 → 등록 | 키 목록에 추가 |
| 7 | API 키 삭제 | 삭제 클릭 → 확인 | 키 삭제됨 |
| 8 | 직원 미선택 | 초기 상태 | "직원을 선택하세요" 안내 |
| 9 | 반응형 | 375px 뷰포트 | 1컬럼 레이아웃 |
| 10 | 로딩 상태 | 직원 선택 후 느린 네트워크 | `credentials-loading` 표시 |
| 11 | 에러 상태 | API 실패 시뮬레이션 | `credentials-error` 표시 + 재시도 |
| 12 | API 키 범위 표시 | API 키 등록 (개인/회사) | `apikey-scope-badge` 에 범위 표시 |
| 13 | 가이드 접기 | 접기 버튼 클릭 | 가이드 박스 숨김/표시 토글 |
| 14 | 확인 다이얼로그 | 비활성화/삭제 클릭 | `confirm-dialog` 표시, native confirm 아님 |
| 15 | 모바일 뒤로가기 | 375px 뷰포트에서 직원 선택 후 뒤로가기 클릭 | 직원 목록으로 복귀 |
| 16 | 빈 라벨 토큰 등록 | 라벨 비우고 등록 시도 | validation 에러 또는 버튼 비활성화 |
| 17 | 토큰 마스킹 표시 | 토큰 등록 후 목록 확인 | 마스킹된 프리뷰 (sk-ant-***) 표시 (서버에 maskedToken 필드가 있을 때) |
| 18 | 직원 미선택 placeholder | 페이지 최초 로드, 직원 미선택 | `credentials-no-selection` 표시, 등록 버튼 비활성화 |
| 19 | 토큰 등록 모달 | + 토큰 등록 클릭 | `token-add-form` 모달 열림 (인라인 폼 아님) |
| 20 | 가이드 접기 지속성 | 접기 버튼 클릭 → 페이지 새로고침 | 가이드 박스 접힌 상태 유지 (localStorage) |
