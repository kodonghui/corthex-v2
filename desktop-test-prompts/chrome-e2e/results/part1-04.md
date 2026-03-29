# Part 1-04: 회사 관리 테스트 결과

## 테스트 환경
- 일시: 2026-03-30
- 브라우저: Chrome (claude-in-chrome MCP)
- 해상도: 1575x781
- OS: Windows 11 Home
- URL: https://corthex-hq.com/admin/companies

## 단계별 결과

| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | "Create Company" 클릭 | PASS | /admin/companies | 1s | INITIALIZE_NEW_NODE 폼 열림 (ss_2751w3fp1) |
| 2 | 이름: `크롬QA공사` 입력 | PASS | /admin/companies | 1s | |
| 3 | 슬러그: `chrome-qa-corp` 입력 | PASS | /admin/companies | 1s | |
| 4 | "CREATE" 클릭 | PASS | /admin/companies | 2s | |
| 5 | 목록에 추가됨 확인 | PASS | /admin/companies | 0s | 전체 회사 1→2, 크롬QA공사 카드 ACTIVE 표시 (ss_8894bvqys에서 확인) |
| 6 | 토스트 메시지 확인 | N/A | /admin/companies | 0s | 토스트 미관찰 — 카드 즉시 추가로 성공 판별 가능 |
| 7 | 스크린샷: part1-04-create.png | PASS | /admin/companies | 0s | ss_8894bvqys |
| 8 | 검색창에 `크롬` 입력 | PASS | /admin/companies | 1s | |
| 9 | "크롬QA공사"만 필터됨 확인 | PASS | /admin/companies | 1s | SHOWING 1 OF 2 COMPANIES (ss_07721cl4f에서 확인) |
| 10 | 편집 아이콘 클릭 | PASS | /admin/companies | 1s | 인라인 편집 모드 활성화, SAVE/CANCEL 버튼 표시 (ss_1845lktc4에서 확인) |
| 11 | 이름을 `크롬QA공사수정`으로 변경 | PASS | /admin/companies | 1s | |
| 12 | "SAVE" 클릭 | PASS | /admin/companies | 2s | |
| 13 | 변경 반영됨 확인 | PASS | /admin/companies | 0s | 카드 제목이 `크롬QA공사수정`으로 변경 (ss_1581snw0o에서 확인) |
| 14 | 스크린샷: part1-04-edit.png | PASS | /admin/companies | 0s | ss_1581snw0o |
| 15 | 쓰레기통 아이콘 클릭 | PASS | /admin/companies | 1s | |
| 16 | 확인 다이얼로그 표시 확인 | PASS | /admin/companies | 0s | "크롬QA공사수정 비활성화" 다이얼로그 (ss_0392jd7v3에서 확인) |
| 17 | "비활성화 후 영구 삭제 가능" 안내 문구 확인 | PASS | /admin/companies | 0s | "이 회사를 비활성화하면 소속 직원의 로그인이 차단됩니다. 비활성화 후 영구 삭제가 가능합니다." |
| 18 | "비활성화" 클릭 | PASS | /admin/companies | 2s | |
| 19 | 회사가 비활성화됨 확인 | PASS | /admin/companies | 0s | ACTIVE→INACTIVE(빨간 배지), 활성율 100%→50% (ss_1793pyus3에서 확인) |
| 20 | 스크린샷: part1-04-delete.png | PASS | /admin/companies | 0s | ss_1793pyus3 |
| 21 | "Create Company" 클릭 | PASS | /admin/companies | 1s | |
| 22 | 기존 슬러그 `chrome-qa-corp` 입력 | PASS | /admin/companies | 1s | 회사명: 중복테스트회사 |
| 23 | "CREATE" 클릭 | PASS | /admin/companies | 2s | |
| 24 | 에러 메시지 표시 확인 | PASS | /admin/companies | 0s | `duplicate key value violates unique constraint "companies_slug_unique"` (ss_2348dk9r4에서 확인) |

## 발견된 버그

### BUG-001: 회사 생성 폼 — CANCEL 후 재열기 시 이전 값/에러 잔존
- 페이지 URL: https://corthex-hq.com/admin/companies
- 재현 단계:
  1. "+ CREATE COMPANY" 클릭하여 폼 열기
  2. 중복 슬러그로 생성 시도 → 에러 발생
  3. "CANCEL" 클릭하여 폼 닫기
  4. 다시 "+ CREATE COMPANY" 또는 "INITIALIZE NODE" 카드 클릭
  5. 폼이 이전 입력값(`중복테스트회사`, `chrome-qa-corp`)과 에러 메시지를 그대로 유지
- 기대 결과: 폼이 빈 상태(초기화)로 열려야 함
- 실제 결과: 이전 입력값과 에러 메시지가 그대로 남아있음
- 콘솔 에러: 없음
- 스크린샷: ss_9746ilnmo, ss_78344wmy9, ss_0652piunn
- 심각도: Minor
- 추정 원인: 폼 상태(React state)가 CANCEL/닫기 시 초기화되지 않음

## UX 탐색 발견사항 — 7건 시도

1. **"선택" 버튼 (CORTHEX HQ 카드)** → /admin/companies → 클릭 시 시각적 피드백 미미. 이미 선택된 회사이므로 변화 없음. 사이드바 상단 CORTHEX HQ 드롭다운과 연동되는 것으로 추정 (ss_4459fcha9에서 확인).
2. **INACTIVE 회사의 "선택" 버튼 클릭** → /admin/companies → 클릭 가능하지만 사이드바가 여전히 CORTHEX HQ를 표시. INACTIVE 회사 선택에 대한 경고나 피드백 없음 (ss_54005spw9에서 확인).
3. **경고(삼각형) 아이콘 (INACTIVE 회사)** → /admin/companies → "회사 영구 삭제" 다이얼로그 열림. 회사 이름을 정확히 타이핑해야 삭제 가능한 안전장치가 잘 구현됨 (ss_3514sztx9에서 확인). 좋은 UX.
4. **검색창 XSS 테스트** → `<script>alert('xss')</script>` 입력 → /admin/companies → alert 실행 안 됨. 텍스트로 안전하게 렌더링. 매칭 결과 0건, INITIALIZE NODE 카드만 표시. XSS 방어 정상 (ss_1435ezwlx에서 확인).
5. **INITIALIZE NODE 카드 클릭** → /admin/companies → CREATE COMPANY 폼 열림. "+ CREATE COMPANY" 버튼과 동일 기능. 단, BUG-001과 동일하게 이전 상태가 잔존하는 문제 있음 (ss_0652piunn에서 확인).
6. **하단 상태바** → SYSTEM_LOAD: NOMINAL, NETWORK_LATENCY: STABLE, 빌드 #935, 커밋 해시 45e010b 표시. 운영 모니터링 정보 제공 — 좋은 UX.
7. **페이지네이션** → 하단에 < 1 > 버튼 표시. 현재 2개 회사로 1페이지만 존재. 페이지 이동 UI 정상.

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 미테스트 (chrome-e2e 한계)
- 로딩 속도 체감: 빠름 (회사 생성/수정/비활성화 모두 2초 이내)
- 레이아웃 깨짐: 없음
- 한글 회사명: 정상 표시 (크롬QA공사수정)
- 인라인 편집 UX: 카드 내에서 직접 이름 변경 가능 — 모달 없이 빠른 수정 가능. 좋은 UX

## 요약
- 총 단계: 24
- PASS: 23
- FAIL: 0
- N/A: 1 (토스트 메시지 — 존재 여부 미관찰)
- 버그: 1건 (Minor — 폼 리셋 미작동)
- UX 발견: 7건

## 스크린샷 ID 매핑
| 스크린샷 | ID | 설명 |
|----------|-----|------|
| part1-04-initial | ss_4146lt17j | 초기 회사 관리 페이지 (1개 회사) |
| part1-04-create-form | ss_2751w3fp1 | 생성 폼 열린 상태 |
| part1-04-create | ss_8894bvqys | 생성 완료 (2개 회사) |
| part1-04-search | ss_07721cl4f | 검색 필터 결과 |
| part1-04-edit-mode | ss_1845lktc4 | 인라인 편집 모드 |
| part1-04-edit | ss_1581snw0o | 수정 완료 |
| part1-04-deactivate-dialog | ss_0392jd7v3 | 비활성화 확인 다이얼로그 |
| part1-04-delete | ss_1793pyus3 | 비활성화 후 상태 |
| part1-04-duplicate-slug | ss_2348dk9r4 | 중복 슬러그 에러 |
| part1-04-ux-select | ss_4459fcha9 | 선택 버튼 클릭 |
| part1-04-ux-inactive-select | ss_54005spw9 | INACTIVE 선택 버튼 |
| part1-04-ux-permanent-delete | ss_3514sztx9 | 영구 삭제 다이얼로그 |
| part1-04-ux-xss | ss_1435ezwlx | XSS 테스트 |
| part1-04-ux-form-stale1 | ss_9746ilnmo | 폼 리셋 버그 1 |
| part1-04-ux-form-stale2 | ss_78344wmy9 | 폼 리셋 버그 2 |
| part1-04-ux-initialize-node | ss_0652piunn | INITIALIZE NODE 클릭 |
