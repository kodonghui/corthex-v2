# Part 4-03: App — 에이전트와 대화 + 업무 결과

## 테스트 환경
- 일시: 2026-03-30 07:40 (2차 실행 — Chrome MCP)
- 브라우저: Chrome (claude-in-chrome MCP)
- OS: Windows 11 Home 10.0.26200
- 로그인: nw-ceo / q4wASVUq (Part 4-02에서 리셋된 비밀번호)
- 비고: 1차 실행(02:51, Playwright MCP) 결과와 병합

## 사전 조건 복구
- Part 4-02에서 에이전트 0개 상태 확인 → Admin API로 넥스트비서 에이전트 재생성
  - `POST /api/admin/agents?companyId={넥스트웨이브ID}` → ID: `5bfb9abc-4c49-4212-b03e-8940c4fa59c8`
  - `PATCH` → status: online
  - 부서: AI연구소 (`317a7e3f-fbdf-4832-93c4-31a124fdb5aa`)
- CEO 토큰 만료 → API 재로그인으로 갱신

## 단계별 결과
| # | 단계 | 결과 | URL | 소요시간 | 비고 |
|---|------|------|-----|----------|------|
| 1 | 사이드바 → 채팅 | PASS | /chat | ~1s | 3 conversations 표시, 기존 대화 2개 + 새 대화 1개 (ss_8816do2ua) |
| 2 | "+" 새 대화 → 에이전트 선택 모달 | PASS (부분) | /chat | ~2s | 에이전트 목록에 넥스트비서 표시되나 이름 깨짐 (ss_8853ookf4) |
| 3 | 넥스트비서 선택 → 새 세션 생성 | PASS | /chat?session=25f4ebb8-... | ~1s | 새 세션 생성, ACTIVE SESSION 패널 표시 (ss_0735ybksn) |
| 4 | 메시지 입력 | PASS | /chat?session=25f4ebb8-... | ~1s | "안녕하세요, 이번 주 일정을 정리해주세요" 입력란 표시 확인 (ss_0200i2nkn) |
| 5 | 메시지 전송 (Enter / 전송 버튼) | FAIL | /chat?session=25f4ebb8-... | 10s+ | WebSocket 연결 실패 — "연결이 끊어졌습니다. 재연결 중..." (ss_1472f1t8d) |
| 6 | 후속 메시지 전송 | SKIP | — | — | Step 5 실패로 미수행 |
| 7 | 스크린샷: 채팅 | PASS | — | — | ss_1472f1t8d |
| 8 | 사이드바 → 작업(Jobs) | PASS | /jobs | ~1s | Jobs Manager [01], 기존 완료 작업 1개 (ss_4098kngwm) |
| 9 | "+ Create Job" 클릭 | PASS | /jobs | ~1s | "작업 등록" 모달 표시 (ss_1106o0vy7) |
| 10 | 에이전트 선택 + 작업 지시 입력 | PASS | /jobs | ~3s | 넥스트비서 선택, "주간 보안 점검 — 매주 월요일 자동 보안 스캔" 입력 |
| 11 | 등록 → 목록 확인 | PASS | /jobs | ~2s | Jobs Manager [02]로 증가, 새 작업 "대기" 상태 (ss_5490vk6g1) |
| 12 | 스크린샷: 작업 | PASS | — | — | ss_5490vk6g1 |
| 13 | 사이드바 → 보고서 | PASS | /reports | ~1s | Active Reports [3] 기존 보고서 3개 (ss_1072w5w3u) |
| 14 | "+ New Report" 클릭 | PASS | /reports | ~1s | 새 보고서 작성 폼 (ss_976515hqu) |
| 15 | 제목 + 내용 입력 | PASS | /reports | ~2s | "넥스트웨이브 1주차 보고서" + 활동 요약 내용 |
| 16 | 초안 저장 → 목록 확인 | PASS | /reports/f3d63ab4-... | ~2s | Active Reports [4]로 증가, DRAFT 상태 (ss_5291lxcm5) |
| 17 | 스크린샷: 보고서 | PASS | — | — | ss_5291lxcm5 |
| 18 | URL → /knowledge (라이브러리) | PASS | /knowledge | ~1s | Library 페이지, 기존 "온보딩 가이드" 1개 (ss_812698ms8) |
| 19 | "+ 새 문서" 클릭 | PASS | /knowledge | ~1s | 새 문서 모달 (ss_8448dyt4x) |
| 20 | 제목 + 내용 입력 → 생성 | PASS | /knowledge | ~2s | "온보딩 가이드 v2" 생성, 2 Files 확인 (ss_6990fl7ql) |
| 21 | 스크린샷: 라이브러리 | PASS | — | — | ss_6990fl7ql |

## 발견된 버그

### BUG-001: 에이전트 이름 한글 인코딩 깨짐
- **페이지 URL**: /chat, /agents, /jobs 전 페이지
- **재현 단계**:
  1. Admin API (superadmin 토큰)로 에이전트 생성 시 한글 이름 "넥스트비서" 전달
  2. App에서 해당 에이전트 조회 → 이름이 "◆3◆T◆◆"로 표시
  3. 역할 "CEO 비서 및 일정 관리"도 깨짐
  4. soul 필드도 깨져서 "No soul description configured" 표시
- **기대 결과**: "넥스트비서" 한글 정상 표시
- **실제 결과**: 다이아몬드 문자(◆)로 깨짐
- **스크린샷**: ss_8853ookf4, ss_0735ybksn, ss_8261b0obk
- **심각도**: Critical
- **추정 원인**: Admin API의 agents POST/PATCH 응답에서 이미 `�ؽ�Ʈ��` 형태로 깨진 상태. curl이 UTF-8 한글을 CP949/EUC-KR로 인코딩하여 전송했거나, Hono 서버의 request body 파싱 시 charset 불일치. Windows bash(Git Bash) 환경의 curl 한글 인코딩 이슈 가능성 높음

### BUG-002: 채팅 WebSocket 연결 지속 실패
- **페이지 URL**: /chat?session=25f4ebb8-f0f6-4de6-8a74-dd935f878472
- **재현 단계**:
  1. 새 대화 생성 → 에이전트 선택
  2. 채팅 화면 진입 시 상단 "연결이 끊어졌습니다. 재연결 중..." 배너
  3. 메시지 입력 후 전송 → 미전송
  4. 10초+ 대기해도 연결 복구 안 됨
- **기대 결과**: WebSocket 연결 성공, 메시지 전송 및 응답
- **실제 결과**: WebSocket 연결 실패, 메시지 전송 불가
- **스크린샷**: ss_0735ybksn, ss_1472f1t8d
- **심각도**: Critical (핵심 기능 차단)
- **추정 원인**: Part 4-02(1차)에서도 동일 증상. Chrome MCP 확장의 WebSocket 프로토콜 제한 또는 다수 탭 열림으로 인한 연결 제한. 실제 브라우저에서 재현 여부 확인 필요

### BUG-003: AGENT SOUL "No soul description configured" 표시
- **페이지 URL**: /chat?session=25f4ebb8-...
- **재현 단계**: 넥스트비서 대화 세션 → 우측 ACTIVE SESSION 패널 확인
- **기대 결과**: soul 텍스트 표시
- **실제 결과**: "No soul description configured for this agent."
- **스크린샷**: ss_0735ybksn
- **심각도**: Minor
- **추정 원인**: BUG-001과 동일. soul 필드 인코딩 깨짐 → 프론트에서 빈 값 판단

## UX 탐색 발견사항 — 6개

1. **[NEXUS 토폴로지 캔버스]** → `/nexus` → CORTHEX NEXUS V2.4.0, NETWORK HEALTH 99.8%, Active Agents 1/1, Departments 2. Tree/Radial 뷰 전환, 100% 줌, Export 기능. LEGEND: Master Hub, Standard Agent Node, Command Sync Line. (ss_3337jke0o에서 확인)

2. **[에이전트 카드 UI]** → `/agents` → Agents Ecosystem "1 ACTIVE Total: 1". 카드: 아바타 + 녹색 online 점, "전문가" 배지, 역할(깨짐), AI연구소(깨짐). 전체 부서/활성/전체/비활성 필터. "+ 에이전트 생성" CTA. (ss_8261b0obk에서 확인)

3. **[작업 등록 모달]** → `/jobs` → 유형 3가지(일회성/반복/이벤트 트리거). 담당 에이전트 드롭다운, 작업 지시 textarea(placeholder 예시), 실행 시간(비워두면 즉시), "+ 체인 단계 추가 (순차 실행)". (ss_1106o0vy7에서 확인)

4. **[보고서 상세 뷰]** → `/reports/{id}` → 좌측 목록 + 우측 상세. CREATED DATE, AUTHORING AGENT, STATUS(Draft) 메타. 삭제/Request Edit/Complete Review 액션. 마크다운 렌더링. (ss_5291lxcm5에서 확인)

5. **[라이브러리 Knowledge Base]** → `/knowledge` → WORKSPACE 폴더 패널, Documents 카드 뷰(MARKDOWN 배지 + 수정일 + UUID). 혼합/의미/키워드 검색 모드 + 전체 유형 필터. 페이지네이션. (ss_6990fl7ql에서 확인)

6. **[Jobs 대시보드 위젯]** → `/jobs` → 상단 4카드: 완료된 작업(01), 실행 중(00), 활성 스케줄(00), 오류 알림(00, 빨간색). 야간 작업/반복 스케줄/ARGOS 트리거 3탭. 테이블: ID, TITLE, ASSIGNED AGENT, STATUS, CREATED, DURATION, ACTIONS. (ss_4098kngwm에서 확인)

## 스크린샷 목록
| ID | 설명 |
|---|---|
| ss_227606pr0 | Hub 초기 진입 (넥스트웨이브, 0/0 agents) |
| ss_8816do2ua | 채팅 페이지 진입 (2 conversations) |
| ss_6616u8tj4 | 에이전트 선택 모달 — 검색 결과 없음 |
| ss_8853ookf4 | 에이전트 선택 모달 — 넥스트비서 표시 (이름 깨짐) |
| ss_0735ybksn | 채팅 세션 — WebSocket 연결 실패 배너 |
| ss_0200i2nkn | 메시지 입력 상태 (미전송) |
| ss_1472f1t8d | 메시지 전송 시도 후 — 여전히 미전송 |
| ss_4098kngwm | Jobs Manager 초기 (1개 완료) |
| ss_1106o0vy7 | 작업 등록 모달 |
| ss_5490vk6g1 | Jobs Manager — 작업 생성 후 (2개) |
| ss_1072w5w3u | 보고서 목록 (3개 기존) |
| ss_976515hqu | 새 보고서 작성 폼 |
| ss_5291lxcm5 | 보고서 생성 후 (4개, 상세 패널) |
| ss_812698ms8 | 라이브러리 (1개 기존 문서) |
| ss_8448dyt4x | 새 문서 모달 |
| ss_6990fl7ql | 라이브러리 — 문서 생성 후 (2 Files) |
| ss_3337jke0o | NEXUS 토폴로지 |
| ss_8261b0obk | 에이전트 목록 (1 ACTIVE, 이름 깨짐) |

## 요약
- **총 단계: 21** / **PASS: 18** / **PASS(부분): 1** / **FAIL: 1** / **SKIP: 1**
- **버그: 3건** (Critical 2, Minor 1)
- **UX 발견: 6건**
- **핵심 성공**: Job 생성(PASS), 보고서 생성(PASS), 라이브러리 문서 추가(PASS) — CRUD 기능 정상
- **핵심 실패**: 채팅 메시지 전송 불가 (WebSocket 연결 실패)
- **가장 심각한 이슈**: 에이전트 이름 한글 인코딩 깨짐 — Admin API(curl)로 생성한 에이전트의 name/role/soul 필드 전체 깨짐. Windows Git Bash curl의 UTF-8 인코딩 문제로 추정
- **다음 파트용 참고**: 넥스트비서 에이전트 ID `5bfb9abc-4c49-4212-b03e-8940c4fa59c8` (이름 인코딩 깨진 상태)
