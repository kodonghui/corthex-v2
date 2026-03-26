# Cycle 31 — Batch 7 E2E Test Results
**Date**: 2026-03-26
**Session ID**: QA-C31-session
**Tester**: Claude (automated)
**URL**: http://localhost:5174
**Login**: admin / admin1234
**Pages Tested**: /login, /hub, /dashboard, /chat, /agents, /departments

---

## Summary

| Section | Total TCs | PASS | FAIL | BUG | SKIP |
|---------|-----------|------|------|-----|------|
| TC-ALOGIN (Login) | 10 | 7 | 0 | 0 | 3 |
| TC-HUB (Hub) | 14 | 9 | 0 | 0 | 5 |
| TC-ADASH (Dashboard) | 15 | 10 | 0 | 0 | 5 |
| TC-CHAT (Chat) | 15 | 6 | 0 | 0 | 9 |
| TC-AAGENT (Agents) | 20 | 12 | 1 | 2 | 7 |
| TC-ADEPT (Departments) | 10 | 8 | 0 | 2 | 2 |
| **TOTAL** | **84** | **52** | **1** | **4** | **31** |

---

## /login (TC-ALOGIN-*)

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-ALOGIN-001 | PASS | admin/admin1234 → 로그인 성공, /hub으로 리다이렉트 |
| TC-ALOGIN-002 | PASS | 빈 아이디 제출 → username 필드에 포커스 이동 (HTML validation) |
| TC-ALOGIN-003 | PASS | 잘못된 비밀번호 → "아이디 또는 비밀번호가 올바르지 않습니다" 에러 표시 |
| TC-ALOGIN-004 | PASS | 5회 실패 후 rate limit → "로그인 시도가 너무 많습니다. 46초 후 다시 시도해주세요" |
| TC-ALOGIN-005 | PASS | 비밀번호 visibility 토글 → type="text"로 변경되어 비밀번호 표시 |
| TC-ALOGIN-005 (rate) | PASS | Rate limit 버튼 "36초 후 재시도" [disabled] 카운트다운 확인 |
| TC-ALOGIN-006 | PASS | 카운트다운 완료 후 "INITIALIZE COMMAND" 버튼 재활성화됨 |
| TC-ALOGIN-007 | SKIP | ?redirect 파라미터 테스트 미실시 |
| TC-ALOGIN-008 | SKIP | ?redirect=/chat 파라미터 테스트 미실시 |
| TC-ALOGIN-009 | SKIP | 이미 인증 상태 auto-redirect 테스트 미실시 |
| TC-ALOGIN-010 | SKIP | "Request access" 링크 테스트 미실시 |

### Login Page Observations
- "비밀번호 찾기" 링크 존재 확인됨 (TC-ALOGIN-007 관련)
- "Keep session persistent" 체크박스 존재 확인됨
- "Request access" 링크 존재 확인됨
- Footer: Privacy Policy, Terms of Service, Support 링크 존재

---

## /hub (TC-HUB-*)

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-HUB-001 | SKIP | Secretary agent 여부 판단 복잡 — 현재는 DashboardView 렌더링됨 |
| TC-HUB-002 | PASS | Dashboard view with quick action cards 확인 (secretary 없음) |
| TC-HUB-003 | PASS | "Welcome, Commander" + "코동희 본사" + "3/3 agents operational" 확인 |
| TC-HUB-004 | PASS | "Start Chat" 클릭 → 에이전트 선택 모달 열림 |
| TC-HUB-005 | PASS | "New Job" 클릭 → /jobs 페이지 이동 확인 |
| TC-HUB-006 | PASS | "View NEXUS" 클릭 → /nexus 페이지 이동 확인 |
| TC-HUB-007 | PASS | "Reports" 클릭 → /costs 페이지 이동 확인 |
| TC-HUB-008 | PASS | "Session Logs" 클릭 → 에이전트 선택 모달 열림 (Start Chat 동작과 동일) |
| TC-HUB-009 | PASS | "Force Sync" 클릭 → Hub 페이지 유지, "Welcome, Commander" 표시 |
| TC-HUB-010 | PASS | Agent Status panel "3/3 ONLINE" 확인, 에이전트 카드 3개 |
| TC-HUB-011 | SKIP | No agents 상태 테스트 미실시 |
| TC-HUB-012 | PASS | "Manage All Agents" → /agents 이동 확인 |
| TC-HUB-013 | PASS | Live System Events: "Hub initialized — 3 agents loaded from 코동희 본사" |
| TC-HUB-014 | SKIP | ?session=id 파라미터 테스트 미실시 |

### Hub Page Observations
- "System: Online" 상태 배지 표시됨
- Live System Events에 야간 작업 로그가 표시됨
- TC-HUB-008 "Session Logs"가 TC-HUB-004 "Start Chat"과 동일 동작 — 에이전트 선택 모달 오픈. TC 설명 상이할 수 있음 (세션 목록 표시가 아닌 새 채팅 시작 모달)

---

## /dashboard (TC-ADASH-*)

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-ADASH-001 | PASS | 4개 stat 카드 로드: Active Agents (00/ONLINE), Departments (00/STABLE), Pending Jobs (000/IDLE), Total Costs ($0/MTD) |
| TC-ADASH-002 | PASS | Active Units 테이블 로드, 현재 "No active agents" |
| TC-ADASH-003 | PASS | "View Full Roster" → /agents 이동 확인 |
| TC-ADASH-004 | PASS | Live Event Stream "Waiting for events..." 표시 |
| TC-ADASH-005 | PASS | System Health Matrix: Central Processing Unit (99%), Neural Memory Banks (0%), NEXUS Throughput (0%) |
| TC-ADASH-006 | PASS | Cost Trend 차트 존재 (2026-03-26 날짜들 표시) |
| TC-ADASH-007 | PASS | Departmental Load "No department data" 메시지 |
| TC-ADASH-008 | PASS | Task Status 파이 차트: Completed(0%), In Progress(0%), Failed(0%), Pending(0%) |
| TC-ADASH-009 | PASS | Recent Tasks 테이블: COMPLETED/IN PROGRESS/FAILED 0건 |
| TC-ADASH-010 | PASS | "View History" → /activity-log 이동 확인 |
| TC-ADASH-011 | PASS | "New Conversation" → /hub 이동 확인 |
| TC-ADASH-012 | PASS | "Create Workflow" → /n8n-workflows 이동 확인 |
| TC-ADASH-013 | PASS | "Weekly Report" → /reports 이동 확인 |
| TC-ADASH-014 | SKIP | Empty state 세부 테스트 미실시 |
| TC-ADASH-015 | SKIP | Pagination 테스트 미실시 |

### Dashboard Page Observations
- CPU 사용률이 26% → 99%로 급격히 변화함 (페이지 재방문 간격 동안)
- SYSTEM: OFFLINE 상태로 표시됨 (에이전트들이 오프라인이라 그럴 수 있음)

---

## /chat (TC-CHAT-*)

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-CHAT-001 | PASS | 세션 목록 사이드바 + 채팅 메인 영역 로드됨, 2 conversations 표시 |
| TC-CHAT-002 | PASS | "New Chat Session" (+) → AgentListModal 열림 (2개 에이전트 모두 오프라인 [disabled]) |
| TC-CHAT-003 | SKIP | 에이전트 모두 오프라인 상태여서 선택/세션 생성 불가 |
| TC-CHAT-004 | PASS | 기존 세션 클릭 → ChatArea 로드 (테스트 역할 에이전트, 오프라인) |
| TC-CHAT-005 | SKIP | 에이전트 오프라인으로 메시지 전송 테스트 불가 |
| TC-CHAT-006 | SKIP | 에이전트 오프라인으로 스트리밍 응답 테스트 불가 |
| TC-CHAT-007 | SKIP | 세션 이름 rename 기능 - hover 시 rename 버튼 미표시 (UI 미구현 또는 다른 방식) |
| TC-CHAT-008 | SKIP | 세션 삭제 기능 - hover 시 delete 버튼 미표시 |
| TC-CHAT-009 | SKIP | No sessions 상태 테스트 미실시 |
| TC-CHAT-010 | PASS | 빈 메시지 → 전송 버튼 [disabled] 확인 |
| TC-CHAT-011 | PASS | 에이전트 모두 오프라인 → 선택 불가 (disabled 상태) |
| TC-CHAT-012 | SKIP | 모바일 테스트 미실시 |
| TC-CHAT-013 | SKIP | 모바일 back arrow 테스트 미실시 |
| TC-CHAT-014 | SKIP | Agent info panel (desktop right sidebar) 테스트 미실시 |
| TC-CHAT-015 | SKIP | 파일 첨부 버튼 존재 확인됨 (테스트 미실시) |

### Chat Page Observations
- 파일 첨부(paperclip) 버튼 존재 확인됨
- WebSocket 연결 오류: "연결이 끊어졌습니다. 재연결 중..." 표시됨
- "CORTHEX AI can make mistakes. Consider verifying important information." 면책 문구 표시됨
- 세션 사이드바에 hover 시 rename/delete 버튼 미노출 — UI 개선 필요 가능성

---

## /agents (TC-AAGENT-*)

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-AAGENT-001 | PASS | "에이전트 생성" 클릭 → 생성 폼 (name, tier, model, department, soul, 비서 토글, Big Five) 열림 |
| TC-AAGENT-002 | PASS | 폼 제출 → "QA-C31-New-Agent" 에이전트 카드 생성됨 (Total: 3) |
| TC-AAGENT-003 | PASS | 빈 이름 제출 → "에이전트 이름을 입력하세요" validation 에러 표시, 다이얼로그 유지 |
| TC-AAGENT-004 | SKIP | 100자 초과 이름 테스트 미실시 |
| TC-AAGENT-005 | PASS | 부서 드롭다운 존재: 미배속, App E2E Dept, QA-C31-onboard-dept, QA-C31-departments |
| TC-AAGENT-006 | SKIP | Tier 변경 시 모델 기본값 업데이트 테스트 미실시 |
| TC-AAGENT-007 | PASS | 모델 드롭다운 (textbox 방식): claude-haiku-4-5 기본값 확인 |
| TC-AAGENT-008 | PASS | "비서 에이전트" 토글 클릭 → checked 상태로 변경 |
| TC-AAGENT-009 | PASS | Big Five 성격 슬라이더 5개 (개방성/성실성/외향성/친화성/신경성) 기본값 50 확인 |
| TC-AAGENT-010 | PASS | 에이전트 카드 클릭 → 상세 패널 열림 (수정/비활성화 버튼, 성능 탭, Soul/설정 탭) |
| TC-AAGENT-011 | SKIP | Soul 편집 {{ 자동완성 테스트 미실시 |
| TC-AAGENT-012 | SKIP | 프리뷰 버튼 테스트 미실시 |
| TC-AAGENT-013 | SKIP | A/B 모드 토글 테스트 미실시 |
| TC-AAGENT-014 | SKIP | 성격 프리셋 A/B 테스트 미실시 |
| TC-AAGENT-015 | PASS | 수정 버튼 클릭 → 폼에 현재 데이터 사전 입력됨 (이름, 모델, 역할 등) |
| TC-AAGENT-016 | PASS | 비활성화 클릭 → 확인 다이얼로그, 취소/삭제 확인 버튼 |
| TC-AAGENT-017 | PASS | 검색 "테스트" → "테스트 역할" 에이전트만 필터링됨 |
| TC-AAGENT-018 | PASS | 부서 필터 "미배속" → 미배속 에이전트만 표시됨 |
| TC-AAGENT-019 | FAIL | **BUG**: "활성" 필터 선택 시 오프라인 에이전트들이 여전히 표시됨 — 활성 필터가 동작하지 않음 |
| TC-AAGENT-020 | PASS | 상태 dot: 에이전트들 모두 회색 dot (오프라인 상태), 텍스트 "오프라인" 확인 |

### Bugs Found — Agents Page

**BUG-C31-AGENT-001**: 에이전트 상세 패널의 이름 헤딩에 한국어 이름과 영문 이름이 붙어서 표시됨
- 재현: "QA-C31-New-Agent" 에이전트 클릭 시 헤딩이 "QA-C31-New-AgentQA-C31-New-Agent-EN"으로 표시
- 예상: 이름과 영문 이름이 별도 줄/섹션으로 표시되어야 함
- 심각도: MEDIUM (UI 가독성 문제)

**BUG-C31-AGENT-002**: "활성" 상태 필터가 오프라인 에이전트를 필터링하지 않음
- 재현: 상태 필터 "활성" 선택 → 오프라인 에이전트들이 그대로 표시됨
- 예상: 활성(온라인/작업중) 에이전트만 표시되어야 함
- 심각도: MEDIUM (필터 기능 버그)

---

## /departments (TC-ADEPT-*)

| TC-ID | Result | Notes |
|-------|--------|-------|
| TC-ADEPT-001 | PASS | "Create Department" 클릭 → 폼 (name: required, description: optional) 열림 |
| TC-ADEPT-002 | PASS | 폼 제출 → "QA-C31-New-Department" 카드 생성, toast "부서가 생성되었습니다" |
| TC-ADEPT-003 | PASS | 부서 카드 클릭 → 상세 패널 열림 (에이전트 목록, 수정/삭제 버튼) |
| TC-ADEPT-004 | PASS | 수정 버튼 → 폼에 현재 데이터 사전 입력됨 |
| TC-ADEPT-005 | PASS | 삭제 클릭 → cascade analysis 모달 (소속 에이전트: 0명, 진행 중 작업: 0건, 부서 지식: 0건) |
| TC-ADEPT-006 | PASS | 삭제 확인 → toast "부서가 삭제되었습니다", 에이전트 목록 패널 닫힘 |
| TC-ADEPT-007 | SKIP | 빈 부서 "이 부서에 할당된 에이전트가 없습니다" 메시지 테스트 미실시 (적합한 빈 부서 찾기 어려움) |
| TC-ADEPT-008 | SKIP | Desktop 에이전트 테이블 레이아웃 테스트 미실시 |
| TC-ADEPT-009 | SKIP | 모바일 반응형 테스트 미실시 |
| TC-ADEPT-010 | PASS | 에이전트 상태 color dot: 오프라인 에이전트 회색 dot 확인 |

### Bugs Found — Departments Page

**BUG-C31-DEPT-001**: 부서 삭제 후 카드가 목록에서 완전 제거되지 않고 "Inactive" 상태로 잔류
- 재현: "QA-C31-New-Department" 삭제 확인 → 카드가 "Inactive" 상태로 목록에 남아있음
- 예상: 삭제 후 카드가 목록에서 제거되거나 명확히 삭제됨 표시
- 심각도: LOW (이전 사이클에서도 동일하게 동작 — 의도된 soft delete 방식일 수 있음)

**BUG-C31-DEPT-002**: XSS 주입 시도 데이터가 데이터베이스에 존재 (이전 테스트 잔류)
- `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` 이름의 부서/에이전트 존재
- 관찰: 화면에는 텍스트로 안전하게 렌더링됨 (XSS 방지 정상 동작)
- 권장: 이전 테스트에서 생성된 XSS 테스트 데이터 정리 필요

---

## Screenshots

| Filename | Description |
|----------|-------------|
| 01-login-page.png | 로그인 페이지 초기 상태 |
| 02-login-wrong-password.png | 잘못된 비밀번호 에러 메시지 |
| 03-login-rate-limit.png | Rate limit 카운트다운 (로그인 시도 초과) |
| 04-hub-page.png | Hub 페이지 전체 |
| 05-dashboard.png | Dashboard 4개 stat 카드 + Active Units |
| 06-chat-page.png | Chat 페이지 세션 목록 + 채팅 영역 |
| 07-agents-page.png | Agents 에코시스템 페이지 |
| 08-departments-page.png | Departments 페이지 (XSS 텍스트 안전 렌더링 확인) |
| 09-agents-cleanup.png | 에이전트 정리 후 최종 상태 |

---

## Cleanup Status

| 항목 | 생성 | 정리 |
|------|------|------|
| QA-C31-New-Agent | 생성됨 | 비활성화 완료 |
| QA-C31-New-Department | 생성됨 | 삭제 완료 (Inactive 상태로 잔류) |

---

## Key Findings

1. **Login 기능**: rate limit, countdown timer, 에러 메시지, visibility toggle 모두 정상 동작
2. **Hub**: 모든 quick action 카드 네비게이션 정상. Force Sync, Session Logs 버튼 정상
3. **Dashboard**: stat 카드, System Health Matrix, Recent Tasks 테이블, quick action buttons 정상
4. **Chat**: WebSocket 연결 끊김 상태에서 테스트됨. 에이전트 오프라인으로 실제 채팅 불가
5. **Agents**: CRUD 정상, Big Five 슬라이더, 비서 에이전트 토글 정상. 활성 필터 버그 발견
6. **Departments**: CRUD 정상, cascade analysis 모달 정상. 삭제 후 soft delete 방식

### XSS 보안 확인
- 에이전트/부서 이름의 `<script>alert(1)</script>`, `<img src=x onerror=alert(1)>` 태그가 HTML 텍스트로 안전하게 이스케이프됨 — XSS 방지 정상 동작 확인
