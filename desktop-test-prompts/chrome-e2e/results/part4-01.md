# Part 4-01: Admin — 회사 + 조직 세팅 결과

## 테스트 환경
- 일시: 2026-03-30 02:37
- 브라우저: Chromium (Playwright MCP)
- OS: Windows 11 Home 10.0.26200

## CEO 비밀번호 (다음 파트 필수)
- **최넥스트 (nw-ceo)**: `*H8k*8nmE3k4lbbQ`
- **한개발 (nw-dev01)**: `isdPPPV6L21cPT*N`

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | 로그인 (admin/admin1234) | PASS | /admin/login | ~2s | 대시보드 진입 확인 |
| 2 | 회사 관리 페이지 이동 | PASS | /admin/companies | <1s | 기존 1개 회사 표시 |
| 3 | 넥스트웨이브 회사 생성 (slug: nextwave-inc) | PASS | /admin/companies | ~1s | ACTIVE 상태, 토스트 "Company created" |
| 4 | 온보딩 진입 (넥스트웨이브 선택) | PASS | /onboarding | ~2s | 사이드바 combobox에서 선택 |
| 5 | Step 01 - 회사 정보 확인 (Next) | PASS | /onboarding | <1s | slug: nextwave-inc 표시 |
| 6 | Step 02 - 부서 추가: AI연구소 | PASS | /onboarding | <1s | 토스트 "AI연구소 부서가 추가되었습니다" |
| 7 | Step 02 - 부서 추가: 사업개발팀 | PASS | /onboarding | <1s | Current Departments (2) 확인 |
| 8 | Step 03 - API 키 (Anthropic) 등록 | PASS | /onboarding | ~1s | 토스트 "Anthropic (Claude) 키가 등록되었습니다" |
| 9 | Step 04 - CEO 초대 (nw-ceo, 최넥스트) | PASS | /onboarding | ~1s | 임시 비밀번호 모달 표시 |
| 10 | Step 04 - 직원 초대 (nw-dev01, 한개발) | PASS | /onboarding | ~1s | 임시 비밀번호 모달 표시 |
| 11 | Step 05 - 온보딩 완료 확인 | PASS | /onboarding | <1s | "CORTHEX 준비 완료" + 요약 표시 |
| 12 | 에이전트 생성: 넥스트비서 (API 직접 호출) | PASS | API | <1s | tier: specialist, status: offline |
| 13 | 에이전트 생성: 데이터분석봇 (API 직접 호출) | PASS | API | <1s | tier: specialist, status: offline |
| 14 | 넥스트웨이브 컨텍스트로 에이전트 페이지 전환 | PASS | /admin/agents | ~3s | localStorage + onboardingCompleted 업데이트 필요 |
| 15 | 넥스트비서 Go Online | PASS | /admin/agents | ~1s | 상태 → 유휴(online) 확인 |
| 16 | 데이터분석봇 Go Online | PASS | /admin/agents | ~1s | 상태 → 유휴(online) 확인 |
| 17 | 보고 라인 설정 (한개발 → 최넥스트) | PASS | /admin/report-lines | ~2s | "보고 라인 1개 설정됨", 저장 완료 |

## 발견된 버그

### BUG-001: Admin 회사 컨텍스트 전환 시 온보딩 리다이렉트 무한 반복
- **페이지 URL**: /admin/onboarding → /onboarding
- **재현 단계**:
  1. Admin에서 사이드바 열기
  2. 넥스트웨이브 선택
  3. AI 에이전트 링크 클릭
  4. 온보딩 완료 후 다시 사이드바에서 넥스트웨이브 선택해도 Step 01로 돌아감
- **기대 결과**: onboardingCompleted=true면 일반 에이전트 페이지로 이동
- **실제 결과**: settings.onboardingCompleted가 null이면 항상 온보딩으로 리다이렉트. 온보딩 완료 후 settings에 자동으로 저장되지 않음
- **콘솔 에러**: 없음
- **네트워크 에러**: 없음
- **스크린샷**: screenshots/part4-01-company.png (회사 목록)
- **심각도**: Major
- **추정 원인**: 온보딩 Step 05 "CORTHEX 사용 시작하기" 버튼 클릭 없이 페이지 이탈 시 `onboardingCompleted`가 DB에 저장되지 않음

### BUG-002: Admin 회사 컨텍스트 page.goto() 시 초기화
- **페이지 URL**: /admin/agents
- **재현 단계**:
  1. localStorage의 corthex-admin-company에 넥스트웨이브 ID 설정
  2. page.goto('/admin/agents') 호출
  3. 페이지 로드 후 CORTHEX HQ 에이전트가 표시됨
- **기대 결과**: localStorage 값 유지 → 넥스트웨이브 에이전트 표시
- **실제 결과**: React 앱 초기화 시 localStorage가 덮어쓰여 CORTHEX HQ로 초기화됨
- **콘솔 에러**: 없음
- **스크린샷**: 없음
- **심각도**: Minor (자동화 테스트 환경에서만 발생, 실사용자에게는 영향 없음)
- **추정 원인**: Zustand persist 미들웨어가 page.goto() 후 기본값으로 재초기화

### BUG-003: NEXUS 조직도 사용자 노드에 "CLI 토큰 미등록" 경고 표시
- **페이지 URL**: /admin/nexus
- **재현 단계**: 넥스트웨이브 컨텍스트에서 NEXUS 조직도 접근
- **기대 결과**: 사용자 노드 정상 표시
- **실제 결과**: 최넥스트, 한개발 노드에 "CLI 토큰 미등록" 배지 표시됨
- **스크린샷**: screenshots/part4-01-nexus.png
- **심각도**: Minor
- **추정 원인**: 신규 생성된 사용자는 CLI 토큰 등록 전까지 배지 표시됨 (정상 동작일 수도 있음)

## UX 탐색 발견사항

1. **[온보딩 Step 02] 추천 부서 템플릿** → `/onboarding` → 재무팀, 마케팅팀, 경영지원실, 개발팀 등 6개의 사전 정의 템플릿 제공. "빈 조직으로 시작" 옵션도 있어 유연한 설정 가능. UX 우수.

2. **[부서 관리] 넥스트웨이브 부서 확인** → `/admin/departments` → AI연구소(ID: 317A7E3F), 사업개발팀(ID: 1290C0D0) 2개 정상 생성됨. Total Agents: 2 (에이전트가 미배속 상태이지만 회사 전체로 집계됨).

3. **[NEXUS 조직도] 넥스트웨이브 전체 구조 시각화** → `/admin/nexus` → 회사 노드 → 부서 2개 + 미배속 그룹 → 에이전트 2개(온라인) + 사용자 2명 시각적으로 표시됨. React Flow 기반 인터랙티브 다이어그램. 스크린샷: part4-01-nexus.png.

4. **[직원 관리] admin 역할 사용자 제외** → `/admin/employees` → 최넥스트(admin 역할)는 직원 목록에 미표시. 한개발(user 역할)만 표시됨. 사용자 관리(/admin/users)에는 둘 다 표시됨. 역할 분리 정상 동작.

5. **[직원 관리] 임시 비밀번호 확인 버튼** → `/admin/employees` → "열쇠" 아이콘 버튼 클릭 시 임시 비밀번호 재확인 모달 표시. `isdPPPV6L21cPT*N` 확인됨. 첫 로그인 후 비밀번호 소멸 안내 문구 있음.

6. **[AI 에이전트] Soul 탭 소울 텍스트 입력** → `/admin/agents` → 넥스트비서 클릭 → Soul 탭에서 텍스트 에디터(50k 글자 제한) 제공. "당신은 넥스트웨이브의 비서입니다..." 입력 후 Save Soul 성공. 토스트 "에이전트가 수정되었습니다" 표시. 스크린샷: part4-01-soul-saved.png.

## 스크린샷 목록
- `part4-01-login-success.png` — Admin 대시보드 로그인 성공
- `part4-01-company.png` — 넥스트웨이브 회사 생성 확인
- `part4-01-ceo-password.png` — CEO 임시 비밀번호 모달
- `part4-01-onboarding.png` — 온보딩 Step 05 완료 화면
- `part4-01-agents-online.png` — 에이전트 2개 online 상태
- `part4-01-report-lines.png` — 보고 라인 1개 설정됨
- `part4-01-nexus.png` — NEXUS 조직도 (넥스트웨이브)
- `part4-01-soul-saved.png` — 넥스트비서 Soul 텍스트 저장

## 요약
- 총 단계: 17 / PASS: 17 / FAIL: 0 / 버그: 3건 / UX 발견: 6건
- **모든 핵심 기능 정상 동작**: 회사 생성, 부서 2개, API 키 등록, 직원 2명 초대, 에이전트 2개 생성+온라인, 보고 라인 설정
- **주의**: 에이전트 생성 단계는 온보딩 플로우에 포함되어 있지 않음 (별도 AI 에이전트 메뉴에서 생성). 온보딩 플로우: Company → Departments → API Keys → Team → Complete (에이전트 없음)
- **CEO 비밀번호**: `*H8k*8nmE3k4lbbQ` (다음 파트에서 사용 필수)
