# Part 2-06: 작업(Jobs) + 워크플로우 결과

## 테스트 환경
- 일시: 2026-03-30 05:20
- 브라우저: Chrome (claude-in-chrome MCP)
- 해상도: 1575x781 (viewport)
- 계정: ceo / 대표님 (User)
- OS: Windows 11 Home

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | Jobs 목록 페이지 로딩 | PASS | /jobs | 2s | "Jobs Manager [01]" 표시, 4개 통계 카드(완료된 작업 00, 실행 중 00, 활성 스케줄 00, 오류 알림 01), 탭 3개(야간 작업, 반복 스케줄, ARGOS 트리거), 기존 작업 1개 (ss_0816h0kj5에서 확인) |
| 2 | "+ Create Job" 버튼 클릭 | PASS | /jobs | 1s | "작업 등록" 다이얼로그 표시 (ss_8829jedoz에서 확인) |
| 3 | 작업 생성 다이얼로그 표시 확인 | PASS | /jobs | - | 일회성/반복 스케줄/이벤트 트리거 라디오, 담당 에이전트 select, 작업 지시 textarea, 실행 시간 datetime-local, 체인 단계 추가 링크, 취소/등록 버튼 모두 표시 (ss_8829jedoz에서 확인) |
| 4 | 에이전트 선택 + 작업 지시 입력 | PASS | /jobs | 3s | 비서실장 (비서) — CEO 비서실장 (오케스트레이터) 선택, "QA테스트작업: 크롬 E2E 테스트용" 입력 (ss_614581sgj에서 확인) |
| 5 | 스케줄/반복 설정 확인 | PASS | /jobs | - | 일회성(기본), 반복 스케줄, 이벤트 트리거 3가지 옵션 라디오, 실행 시간 입력 필드(비워두면 즉시) |
| 6 | "등록" 클릭 | PASS | /jobs | 2s | 다이얼로그 닫힘, 목록에 새 작업 추가됨 |
| 7 | 목록에 새 작업 추가 확인 | PASS | /jobs | - | B492454A "QA테스트작업: 크롬 E2E 테스트용", 비서실장, 상태: 진행 중→실패(재시도 3/3), 카운트 [01]→[02], 오류 알림 01→02 (ss_8850kgd1z 진행 중 확인, ss_8911i3mxg 실패 확인) |
| 8 | Jobs 스크린샷 저장 | PASS | /jobs | - | ss_8911i3mxg 캡처 |
| 9 | 워크플로우 페이지 로딩 확인 | PASS | /n8n-workflows | 3s | WORKFLOWS 헤딩, "FOUND 0 AUTOMATED SEQUENCES", 테이블(IDENTIFICATION/TRIGGER, STATUS, LAST EXECUTION, HEALTH, ACTION), "등록된 워크플로우가 없습니다" 빈 상태 (ss_5193qtv42에서 확인) |
| 10 | 워크플로우 목록/에디터 확인 | PASS | /n8n-workflows | - | "+ NEW WORKFLOW" 버튼, Filter 입력, 통계 카드 3개(Total Throughput 2.4M, Active Instances 882, System Health 99.9%), Live Execution Stream 패널, "Send command to kernel..." 입력 (ss_5193qtv42에서 확인) |
| 11 | 워크플로우 스크린샷 저장 | PASS | /n8n-workflows | - | ss_5193qtv42 캡처 |

## 추가 확인: Jobs 탭 전환
| # | 탭 | 결과 | 비고 |
|---|-----|------|------|
| A1 | 야간 작업 (2) | PASS | 기본 탭, 2개 작업 표시 (ss_9355yfhck에서 확인) |
| A2 | 반복 스케줄 | PASS | "등록된 반복 스케줄이 없습니다" + 아이콘 표시 (ss_124460lyt에서 확인) |
| A3 | ARGOS 트리거 | PASS | "등록된 이벤트 트리거가 없습니다" + 아이콘 표시 (ss_7069dn8gm에서 확인) |

## 발견된 버그
### BUG-001: 작업 생성 후 즉시 실패 (재시도 3/3, Duration 00m 0s)
- 페이지 URL: https://corthex-hq.com/jobs
- 재현 단계:
  1. Jobs 페이지 → "+ Create Job" 클릭
  2. 비서실장 에이전트 선택 + 작업 지시 입력
  3. "등록" 클릭
  4. 목록에 "진행 중" 상태로 추가됨
  5. 수 초 후 "실패 (재시도 3/3)" 상태로 변경
- 기대 결과: 에이전트가 작업을 처리하고 완료 상태로 전환
- 실제 결과: Duration 00m 0s, 상태 "실패", 재시도 3/3. 두 작업 모두 동일 증상
- 스크린샷: ss_8850kgd1z (진행 중), ss_8911i3mxg (실패)
- 심각도: **Major**
- 추정 원인: Claude API OAuth 토큰 만료 또는 에이전트 루프 실행 시 인증 실패. 이전 Playwright 테스트(BUG-001)에서도 동일 증상 확인됨

### BUG-002: 워크플로우 통계 수치 하드코딩 의심
- 페이지 URL: https://corthex-hq.com/n8n-workflows
- 기대 결과: 실제 워크플로우 데이터 또는 0/N/A 표시
- 실제 결과: 등록 워크플로우 0개인데 "Total Throughput: 2.4M (+14.2%)", "Active Instances: 882", "System Health: 99.9%" 표시
- 스크린샷: ss_5193qtv42
- 심각도: **Minor**
- 추정 원인: 통계 카드가 하드코딩된 목업 데이터를 표시 중

## UX 탐색 발견사항
1. **작업 등록 다이얼로그 구성** → /jobs → 일회성(기본)/반복 스케줄/이벤트 트리거 3가지 타입 라디오 버튼, 담당 에이전트 select(10개 옵션: 비서실장, 개발팀장, 마케팅팀장, 재무팀장, CIO, 투자분석 A/B, 리서치 A/B), 작업 지시 textarea(placeholder 예시 있음), 실행 시간 datetime-local, 체인 단계 추가 링크 → 구성 완전함 (ss_8829jedoz)
2. **에이전트 드롭다운 — 역할 설명 포함** → /jobs → 각 에이전트마다 "이름 (부서) — 역할 설명" 형식으로 표시. 예: "비서실장 (비서) — CEO 비서실장 (오케스트레이터)" → 에이전트 선택 시 구분 용이
3. **탭 전환 시 카운트 연동** → /jobs → 야간 작업(2) 선택 시 "[02]", 반복 스케줄/ARGOS 탭 선택 시 "[00]" 표시 → 탭별 카운트 실시간 반영 정상
4. **빈 상태 아이콘 차별화** → /jobs → 반복 스케줄 탭: 새로고침 아이콘 + "등록된 반복 스케줄이 없습니다", ARGOS 트리거 탭: 타겟 아이콘 + "등록된 이벤트 트리거가 없습니다" → 탭 유형에 맞는 아이콘 사용
5. **워크플로우 Live Execution Stream** → /n8n-workflows → 우측 패널에 실시간 실행 스트림 + ">" 프롬프트 + "Send command to kernel..." 입력 → 터미널 스타일 커맨드 UI 존재 (ss_5193qtv42)
6. **검색/필터 기능** → /jobs → "Job ID, 제목, 에이전트 검색..." 입력 + AGENT 드롭다운(All Agents) + STATUS 드롭다운(All Status) 필터 3종 제공 → 워크플로우에도 "Filter active workflows..." 입력 존재
7. **Export Logs 버튼** → /jobs → Jobs Manager 우측 상단에 다운로드 아이콘 + "Export Logs" 버튼 존재 → 클릭 미수행 (렌더러 타임아웃으로 추가 탐색 제한)
8. **"+ 체인 단계 추가 (순차 실행)" 링크** → /jobs 작업 등록 폼 → 폼 하단에 체인 단계 추가 링크 존재, 멀티스텝 순차 작업 구성 가능 → 클릭 미수행
9. **작업 상태 색상 코딩** → /jobs → "진행 중" = 초록 배지, "실패" = 빨간 배지, ID 값 = 골든(amber) 색상 링크 스타일 → 시각적 구분 명확

## 접근성 / 반응성 관찰
- 탭 키 네비게이션: 작업 등록 다이얼로그 내 폼 요소 간 이동 가능
- 로딩 속도 체감: Jobs 빠름(2초), Workflows 보통(3초)
- 레이아웃 깨짐: 없음. dark theme 일관성 유지
- 렌더러 안정성: Chrome 탭 다수 오픈 시 CDP captureScreenshot 타임아웃 빈발 (6회+)

## 이전 테스트 대비 변경사항 (Playwright → Chrome E2E)
- BUG-001 (작업 즉시 실패): **재현됨** — 동일 증상
- BUG-002 (n8n 403): **개선됨** — 이번 테스트에서 오류 배너 없이 빈 상태 표시 (n8n API 403 대신 정상 빈 목록 표시)
- BUG-003 (New Workflow 무반응): 미테스트 (렌더러 이슈)
- BUG-005 (통계 하드코딩): **재현됨** — 동일 증상
- BUG-006 (⋮ 메뉴 비작동): 미확인 (클릭 후 렌더러 타임아웃)

## 요약
- 총 단계: 11 (+ 추가 탭 전환 3건)
- PASS: 14
- FAIL: 0
- 버그: 2건 (Major 1, Minor 1)
- UX 발견: 9건
- 핵심 이슈: 작업 생성 즉시 실패(BUG-001 — 이전 테스트에서도 동일), 워크플로우 통계 하드코딩 의심(BUG-002)
