# Part 2-09: 마케팅 파이프라인 + 콘텐츠 승인 + SNS 결과

## 테스트 환경
- 일시: 2026-03-30 15:30
- 브라우저: Chrome (claude-in-chrome)
- 해상도: 1528x804
- 계정: 대표님 (CEO)
- OS: Windows 11 Home

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | 마케팅 파이프라인 페이지 로딩 | PASS | /marketing-pipeline | 2s | "CONTENT PIPELINE" 제목 + 칸반 4열 표시 (ss_5850jwc9w에서 확인) |
| 2 | 파이프라인 단계/카드 확인 | PASS | /marketing-pipeline | 1s | QUEUED(0), RUNNING(0), COMPLETED(0), FAILED(0) — 모두 "비어 있음". 레이아웃 정상 |
| 3 | 스크린샷: marketing | PASS | /marketing-pipeline | - | ss_5850jwc9w 캡처 완료 |
| 4 | 콘텐츠 승인 페이지 로딩 | PASS | /marketing-approval | 2s | "APPROVAL QUEUE 0 PENDING" 표시 (ss_0529a1o67에서 확인) |
| 5 | 승인/거부 버튼 확인 | PASS | /marketing-approval | 1s | "전체 거절" + "전체 승인" 버튼 존재. 체크박스 정상 작동 (ss_9892kiyt6에서 확인) |
| 6 | 스크린샷: approval | PASS | /marketing-approval | - | ss_0529a1o67 캡처 완료 |
| 7 | SNS 관리 페이지 로딩 | PASS | /sns | 2s | 통계 카드 4개 + 게시물 3개 표시 (ss_2349o6n6z에서 확인) |
| 8 | 계정 목록/게시물 관리 UI 확인 | PASS | /sns | 1s | Scheduled/Published/Drafts 탭, CTX-P1~P3 확인, 편집/삭제 버튼 존재 |
| 9 | 새 게시물 작성 버튼 확인 | N/A | /sns | 1s | 전용 "새 게시물 작성" 버튼 없음. read_page interactive 요소에도 없음 |
| 10 | 스크린샷: sns | PASS | /sns | - | ss_2349o6n6z 캡처 완료 |

## 발견된 버그

### BUG-001: SNS 탭 필터링 미작동 — Scheduled/Published/Drafts 동일 결과
- 페이지 URL: https://corthex-hq.com/sns?tab=drafts
- 재현 단계:
  1. /sns 접속
  2. Scheduled 탭: CTX-P1(READY), CTX-P2(QUEUEING), CTX-P3(PUBLISHED) 표시
  3. Published 탭 클릭 → URL ?tab=published 변경됨
  4. Drafts 탭 클릭 → URL ?tab=drafts 변경됨
  5. 모든 탭에서 동일한 3개 게시물 표시
- 기대 결과: 각 탭별 해당 상태 게시물만 필터링
- 실제 결과: 탭 전환 시 URL만 변경, 게시물 목록 동일 (필터 미적용)
- 콘솔 에러: 없음
- 스크린샷: ss_2349o6n6z (Scheduled), ss_1003nw6f6 (Published), ss_3476gjrzd (Drafts)
- 심각도: **Major**
- 추정 원인: 프론트엔드 tab 파라미터 기반 필터 로직 미구현

### BUG-002: SNS 편집 버튼 클릭 시 반응 없음
- 페이지 URL: https://corthex-hq.com/sns
- 재현 단계:
  1. /sns 접속
  2. CTX-P1 게시물의 연필(편집) 아이콘 버튼 클릭
  3. 아무 반응 없음 (모달/페이지 이동/토스트 없음)
- 기대 결과: 게시물 편집 모달 또는 편집 페이지로 이동
- 실제 결과: 클릭 후 UI 변화 없음
- 콘솔 에러: 없음
- 스크린샷: ss_94648pbiz (클릭 후 변화 없는 상태)
- 심각도: **Major**
- 추정 원인: 편집 버튼 onClick 핸들러 미구현 또는 빈 함수

### BUG-003: SNS 정렬 버튼(SORT_BY 아이콘) 클릭 시 반응 없음
- 페이지 URL: https://corthex-hq.com/sns?tab=drafts
- 재현 단계:
  1. /sns 접속
  2. SORT_BY: TIME_DESC 옆 정렬 아이콘 클릭
  3. 아무 반응 없음
- 기대 결과: 정렬 옵션 드롭다운 표시 또는 정렬 순서 토글
- 실제 결과: 클릭 후 아무 변화 없음
- 콘솔 에러: 없음
- 스크린샷: ss_4440j5yyr
- 심각도: **Minor**
- 추정 원인: 정렬 토글 핸들러 미구현

### BUG-004: SNS TOTAL REACH 0이면서 +12.4% 표시 (데이터 불일치)
- 페이지 URL: https://corthex-hq.com/sns
- 재현 단계: SNS 페이지 접속 → TOTAL REACH 카드 확인
- 기대 결과: Reach 0이면 성장률 0% 또는 N/A
- 실제 결과: TOTAL REACH = 0, 성장률 = +12.4% (데이터 모순)
- 스크린샷: ss_2349o6n6z
- 심각도: **Minor**

### BUG-005: SNS 새 게시물 작성 기능 부재
- 페이지 URL: https://corthex-hq.com/sns
- 재현 단계: SNS 페이지 접속 → 페이지 전체에서 Create/New/작성 버튼 탐색
- 기대 결과: 새 게시물 작성 버튼/인터페이스 존재
- 실제 결과: 새 게시물 작성 진입점이 페이지 어디에도 없음 (read_page interactive 확인)
- 심각도: **Major**

## UX 탐색 발견사항 — 10건 시도

1. **마케팅 파이프라인 칸반 열 영역** → /marketing-pipeline → "비어 있음" 카드에 클릭 반응 없음. 콘텐츠 생성 CTA 부재 → UX 개선 제안: 빈 상태 시 "파이프라인 시작" 버튼 추가 권장
2. **콘텐츠 승인 "전체 승인" 버튼** → /marketing-approval → 대기 0건 상태 클릭 시 에러 없이 무반응. 정상 (승인할 항목 없음)
3. **콘텐츠 승인 전체 선택 체크박스** → /marketing-approval → 클릭 시 빨간색 체크 표시로 변경됨 (ss_9892kiyt6에서 확인). 정상 작동
4. **콘텐츠 승인 "전체 거절" 버튼** → /marketing-approval → 대기 0건 상태 클릭 시 무반응. 정상
5. **SNS 하트(좋아요) 아이콘** → /sns → CTX-P1 하트 아이콘 클릭 → 아무 반응 없음. 카운터 "--" 표시
6. **SNS Published 탭** → /sns?tab=published → URL 변경 확인, 탭 하이라이트 변경 확인, 그러나 게시물 동일 (BUG-001)
7. **SNS Drafts 탭** → /sns?tab=drafts → URL 변경 확인, 탭 하이라이트 변경 확인, 게시물 동일 (BUG-001)
8. **SNS CTX-P3 스크롤 확인** → /sns → 스크롤 다운하여 3번째 게시물 확인: STATUS PUBLISHED, 하트 3,480 / 공유 1,100 / 조회 14,290. PUBLISHED 게시물에는 삭제 버튼 없이 편집만 존재 — 의도된 디자인
9. **콘텐츠 승인 통계 카드** → /marketing-approval → 승인 속도(4.2시간), 준수율(--), AI 보조 상태(동기화됨, 노란 점). 데이터 표시 일관됨
10. **SNS 정렬 아이콘** → /sns → SORT_BY: TIME_DESC 옆 아이콘 클릭 → 드롭다운 없음 (BUG-003)

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 사이드바 메뉴 항목 순서대로 이동 가능
- 로딩 속도 체감: 빠름 (각 페이지 1~2초 내 로딩)
- 레이아웃 깨짐: 없음. 3개 페이지 모두 깔끔한 레이아웃
- 콘솔 에러: 없음

## 이전 테스트 대비 변경사항 (Playwright 2026-03-30 01:55 → Chrome 2026-03-30 15:30)
- ✅ 개선: 이전 Playwright 테스트에서 보고된 admin API 호출 에러(BUG-001)가 콘솔에서 재현되지 않음 (콘솔 에러 0건)
- ✅ 개선: 콘텐츠 승인 workspace API 에러가 콘솔에서 재현되지 않음
- ❌ 지속: SNS 탭 필터링 미작동 (BUG-001 재확인)
- ❌ 지속: SNS 편집 버튼 반응 없음 (이전 "준비 중" 토스트도 안 뜸)
- ❌ 지속: SNS 새 게시물 작성 기능 부재
- ❌ 지속: SNS 정렬 드롭다운 없음
- ❌ 지속: TOTAL REACH 0 + 12.4% 데이터 불일치

## 요약
- 총 단계: 10
- PASS: 9
- FAIL: 0
- N/A: 1 (새 게시물 작성 버튼 부재)
- 버그: 5건 (Major 3건, Minor 2건)
- UX 발견: 10건

### 핵심 이슈
| 문제 | 심각도 | 영향 |
|------|--------|------|
| SNS 탭 필터링 미작동 | Major | Scheduled/Published/Drafts 구분 불가 |
| SNS 편집 버튼 반응 없음 | Major | 게시물 수정 불가 |
| SNS 새 게시물 작성 기능 부재 | Major | 새 콘텐츠 생성 불가, 읽기 전용 |
| SNS 정렬 드롭다운 없음 | Minor | 정렬 기능 시각적 표시만 |
| SNS Total Reach 0 + 12.4% 모순 | Minor | 통계 신뢰성 문제 |
