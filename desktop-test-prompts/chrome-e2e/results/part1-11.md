# Part 1-11: CLI / API 키 테스트 결과

## 테스트 환경
- 일시: 2026-03-30 15:35
- 브라우저: Chrome (claude-in-chrome)
- 해상도: 1528x804
- OS: Windows 11 Home
- URL: https://corthex-hq.com/admin/credentials

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | 사용자 선택 드롭다운 존재 확인 | PASS | /admin/credentials | 1s | SELECT_USER 탭: 관리자, 대표님, 크롬검수원, 크롬검수원수정, 미소속검수원 (ss_6000aoumc) |
| 2 | CLI Token 섹션 확인 | PASS | /admin/credentials | 1s | "CLI OAUTH TOKENS — 관리자" 섹션 + "+ ADD TOKEN" 버튼 존재 (ss_05020v7dc) |
| 3a | anthropic 선택 → API Key 필드 1개 | PASS | /admin/credentials | 1s | "API KEY" 필드 1개만 표시됨 (ss_09280ln5w) |
| 3b | kis 선택 → App Key + App Secret + Account No 3개 필드 | PASS | /admin/credentials | 1s | APP KEY, APP SECRET, ACCOUNT NO 3개 필드 표시 (ss_3184h658v) |
| 3c | telegram 선택 → Bot Token + Chat ID 2개 필드 | PASS | /admin/credentials | 1s | BOT TOKEN, CHAT ID 2개 필드 표시 (ss_8478gclmk) |
| 4 | 프로바이더 스크린샷 | PASS | /admin/credentials | - | ss_09280ln5w(anthropic), ss_3184h658v(kis), ss_8478gclmk(telegram) |
| 5 | serper 선택 → api_key 필드에 sk-chrome-qa-test-0329 입력 | PASS | /admin/credentials | 1s | API KEY 필드에 값 입력 완료 (ss_0035r6tjf) |
| 6 | "등록" 클릭 | PASS | /admin/credentials | 2s | REGISTER 버튼 클릭 → SERPER 행이 목록에 추가됨 |
| 7 | 등록 성공 확인 | PASS | /admin/credentials | - | 키 등록 후 SERPER 행이 목록에 표시됨, MASKED_KEY: ••••••••••••3912 (ss_5464nkogq) |
| 8 | 삭제 버튼 클릭 → 확인 다이얼로그 | PASS | /admin/credentials | 1s | "API 키 삭제" 모달 — "이 API 키를 삭제하시겠습니까? 삭제된 키는 복구할 수 없습니다." + 취소/삭제 버튼 (ss_4450531h9) |
| 9 | "삭제" 클릭 → 키 사라짐 확인 | PASS | /admin/credentials | 2s | SERPER 행 삭제됨, ANTHROPIC 키 1개만 남음, ACCESS_SUMMARY: API_KEYS 1 REGISTERED (ss_015163umq) |
| 10 | 최종 스크린샷 | PASS | /admin/credentials | - | ss_5299kw4dh (관리자 탭, 삭제 후 최종 상태) |

## 발견된 버그
없음

## UX 탐색 발견사항 — 6개 시도

### 1. "+ ADD CREDENTIAL" 버튼 클릭
- **요소**: 페이지 우상단 "+ ADD CREDENTIAL" 버튼
- **URL**: /admin/credentials
- **결과**: CLI Token 추가 폼이 나타남 — LABEL(예: CI/CD Pipeline A) + TOKEN STRING(sk-ant-oat01-...) 입력 필드, CANCEL/CREATE TOKEN 버튼 포함. 정상 동작 (ss_0926kn7u4)

### 2. 사용자 탭 전환 — "대표님"
- **요소**: SELECT_USER 탭의 "대표님" 버튼
- **URL**: /admin/credentials
- **결과**: CLI OAUTH TOKENS 섹션에 "QA Test Token" (CLI_OAUTH, ACTIVE 상태, REVOKE 버튼 포함, 2026.3.30 생성) 표시, EXTERNAL API KEYS에 ANTHROPIC 키 표시. 사용자별 데이터 분리 정상 (ss_98358dunq)

### 3. 페이지네이션 "01" 버튼 클릭
- **요소**: CLI TOKENS 섹션 우하단 페이지네이션 "01" 버튼
- **URL**: /admin/credentials
- **결과**: 1페이지만 있으므로 변화 없음. 정상 동작 (ss_1630bvd5v)

### 4. 사용자 탭 전환 — "미소속검수원"
- **요소**: SELECT_USER 탭의 "미소속검수원" 버튼
- **URL**: /admin/credentials
- **결과**: CLI OAUTH TOKENS: "NO CLI TOKENS REGISTERED", EXTERNAL API KEYS: ANTHROPIC 키 표시. 빈 사용자도 정상 표시 (ss_7279969e6)

### 5. "<" 이전 페이지 버튼 클릭
- **요소**: CLI TOKENS 섹션 우하단 "<" 버튼
- **URL**: /admin/credentials
- **결과**: 1페이지에서 이전 페이지 없으므로 변화 없음. 정상 동작 (ss_00157uc5j)

### 6. 하단 시스템 상태 카드 확인
- **요소**: 페이지 하단 SYSTEM_UPTIME, ENCRYPTION_STATUS, ACCESS_SUMMARY 카드 3개
- **URL**: /admin/credentials
- **결과**: SYSTEM_UPTIME 99.998% (파란색 프로그레스바), ENCRYPTION_STATUS AES_256_GCM (VERIFIED_SECURE, 노란색 텍스트), ACCESS_SUMMARY CLI_TOKENS 0 ACTIVE / API_KEYS 1 REGISTERED. 정보 표시 정상

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 사용자 탭 버튼들 간 이동 가능
- 로딩 속도 체감: 빠름 (사용자 탭 전환 시 즉시 데이터 로드)
- 레이아웃 깨짐: 없음
- 프로바이더 드롭다운 전환 시 필드가 즉시 동적으로 변경됨 — 반응 매우 빠름
- 삭제 확인 다이얼로그가 커스텀 모달로 구현되어 있어 UX 일관성 좋음
- 키 마스킹 처리 정상 (••••••••••••0bca 형태)

## 요약
- 총 단계: 10
- PASS: 10
- FAIL: 0
- 버그: 0건
- UX 발견: 6건 (모두 정상 동작)
