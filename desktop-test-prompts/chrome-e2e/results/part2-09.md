# Part 2-09: 마케팅 파이프라인 + 콘텐츠 승인 + SNS 결과

## 테스트 환경
- 일시: 2026-03-29 19:30
- 브라우저: Chrome
- 해상도: 1440x617
- 계정: 대표님 (CEO)

## 단계별 결과
| # | 단계 | 결과 | 비고 |
|---|------|------|------|
| 1 | 파이프라인 페이지 로딩 (칸반 또는 리스트) | PASS | /marketing-pipeline URL 직접 접근 시 로딩됨. 칸반 스타일 (QUEUED/RUNNING/COMPLETED/FAILED 4컬럼). 단, 사이드바에 메뉴 항목 없음 |
| 2 | 파이프라인 단계/카드 확인 | PASS | 4개 단계(QUEUED 0, RUNNING 0, COMPLETED 0, FAILED 0) 표시. 모두 "비어 있음" 상태 |
| 3 | 스크린샷: marketing pipeline | PASS | ss_5108kah2f (marketing-pipeline 페이지) |
| 4 | 승인 대기 목록 표시 | FAIL | /content-approval → 404 "페이지를 찾을 수 없습니다" |
| 5 | 승인/거부 버튼 확인 | FAIL | 페이지 자체가 404이므로 확인 불가 |
| 6 | 스크린샷: content approval | PASS | ss_5484se9sf (404 페이지) |
| 7 | SNS 관리 페이지 로딩 | PASS | /sns URL 직접 접근 시 로딩됨. 통계 카드 + 탭 + 게시물 목록 표시. 단, 사이드바에 메뉴 항목 없음 |
| 8 | 계정 목록 또는 게시물 관리 UI 확인 | PASS | 게시물 관리 UI 확인: Scheduled/Published/Drafts 탭, 게시물 카드(ID, 본문, 실행시간, 상태, 편집/삭제 버튼), 통계 카드(TOTAL REACH, ENGAGEMENT RATE, QUEUE SIZE, PEAK ENGAGEMENT) |
| 9 | 새 게시물 작성 버튼 클릭 → 폼 확인 | FAIL | "새 게시물 작성" 버튼 없음. 페이지 어디에도 Create/New 관련 버튼이 존재하지 않음 |
| 10 | 스크린샷: SNS | PASS | ss_3595o8zql (SNS 페이지) |

## 발견된 버그

### BUG-001: 사이드바에 마케팅 파이프라인/콘텐츠 승인/SNS 메뉴 없음
- 페이지: 사이드바 전체
- 재현 단계: 1. 사이드바의 모든 메뉴 항목을 위아래로 스크롤하며 확인
- 기대 결과: 마케팅 파이프라인, 콘텐츠 승인, SNS 메뉴 항목이 사이드바에 표시
- 실제 결과: 세 메뉴 모두 사이드바에 없음. /marketing-pipeline, /sns는 URL 직접 입력 시 접근 가능하나 네비게이션 불가
- 스크린샷: ss_5108kah2f
- 심각도: Major

### BUG-002: 콘텐츠 승인 페이지 404
- 페이지: https://corthex-hq.com/content-approval
- 재현 단계: 1. 브라우저에서 /content-approval URL로 이동
- 기대 결과: 콘텐츠 승인 대기 목록과 승인/거부 버튼이 표시
- 실제 결과: 404 "페이지를 찾을 수 없습니다" 에러
- 스크린샷: ss_5484se9sf
- 심각도: Critical

### BUG-003: SNS 탭 필터링 작동하지 않음
- 페이지: https://corthex-hq.com/sns
- 재현 단계: 1. SNS 페이지 접속 2. Scheduled 탭 → 게시물 확인 3. Published 탭 클릭 → 동일한 게시물 표시 4. Drafts 탭 클릭 → 동일한 게시물 표시
- 기대 결과: 각 탭에서 해당 상태의 게시물만 필터링되어 표시 (Published 탭에는 PUBLISHED 상태만, Drafts 탭에는 DRAFT 상태만)
- 실제 결과: 세 탭 모두 동일한 게시물 목록 표시 (READY, QUEUEING 상태 포함). URL은 ?tab=published, ?tab=drafts로 변경되지만 필터 미작동
- 스크린샷: ss_7507bkr8m (Published탭), ss_0823ozqnm (Drafts탭)
- 심각도: Major

### BUG-004: SNS 편집 버튼 클릭 시 무반응
- 페이지: https://corthex-hq.com/sns
- 재현 단계: 1. SNS 페이지 접속 2. 게시물(CTX-P1)의 연필(편집) 아이콘 클릭
- 기대 결과: 편집 모달 또는 편집 폼이 열림
- 실제 결과: 아무 반응 없음. 모달/폼/인라인 편집 등 어떤 변화도 없음
- 스크린샷: ss_6111tcuj4
- 심각도: Major

### BUG-005: SNS 새 게시물 작성 기능 없음
- 페이지: https://corthex-hq.com/sns
- 재현 단계: 1. SNS 페이지 접속 2. 페이지 전체에서 "새 게시물", "Create", "+", "New" 등의 버튼 탐색
- 기대 결과: 새 게시물을 작성할 수 있는 버튼/인터페이스 존재
- 실제 결과: 새 게시물 작성 버튼이 페이지 어디에도 없음
- 심각도: Major

### BUG-006: SNS TOTAL REACH 0인데 +12.4% 표시
- 페이지: https://corthex-hq.com/sns
- 재현 단계: 1. SNS 페이지 접속 2. TOTAL REACH 통계 카드 확인
- 기대 결과: 도달 수가 0이면 성장률도 0% 또는 N/A로 표시
- 실제 결과: TOTAL REACH = 0, 성장률 = +12.4% (모순되는 데이터)
- 스크린샷: ss_3595o8zql
- 심각도: Minor

## UX 탐색 발견사항
- **통계 카드 호버** → 특별한 반응 없음 (툴팁/강조 효과 없음)
- **게시물 본문 클릭** → 상세 뷰로 이동하지 않음 (게시물 상세 페이지 없음)
- **좋아요(하트)/공유/조회 아이콘 클릭** → 아무 반응 없음 (클릭 불가 상태)
- **READY 상태 게시물 참여도 지표** → "--"으로 표시 (미발행 상태이므로 정상)
- **PUBLISHED 상태 게시물(CTX-P3)** → 좋아요 3,400 / 공유 1,100 / 조회 14,200 표시, 삭제 버튼 없이 편집만 가능 (의도된 동작으로 보임)
- **정렬 버튼(SORT BY: TIME DESC)** → 클릭해도 정렬 순서 변경 없음
- **마케팅 파이프라인 빈 칸반 컬럼 클릭** → 반응 없음 (작업 추가 기능 없음)
- **마케팅 파이프라인에 인터랙티브 요소 전무** → 읽기 전용 대시보드. 파이프라인 항목 추가/관리 기능 없음

## 요약
- 총 단계: 10
- PASS: 7
- FAIL: 3
- 버그: 6건 (Critical 1, Major 4, Minor 1)

### 핵심 이슈
1. **콘텐츠 승인 페이지 미구현** (404) — Critical
2. **사이드바 네비게이션 누락** — 마케팅 파이프라인, 콘텐츠 승인, SNS 세 페이지 모두 사이드바에서 접근 불가
3. **SNS 탭 필터링 미작동** — Scheduled/Published/Drafts 구분 안 됨
4. **SNS 편집 기능 미작동** — 편집 버튼 클릭 시 무반응
5. **SNS 신규 게시물 작성 불가** — 작성 버튼 자체가 없음
