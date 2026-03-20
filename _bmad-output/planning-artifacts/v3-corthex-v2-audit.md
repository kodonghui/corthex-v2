# CORTHEX v2 정확한 현황 (코드 기반 검증)

> OpenClaw 보고서의 "70+ API, 68 페이지, 34+ 테이블"은 심각하게 과소평가.
> 아래는 실제 코드에서 검증된 정확한 수치.

---

## 요약

| 항목 | 수치 |
|------|------|
| API 엔드포인트 | **485개** |
| 프론트엔드 페이지 | **71개** (Admin 27 + CEO 42 + Login 2) |
| DB 테이블 | **86개** |
| DB Enum | **29개** |
| Built-in 도구 | **68개** |
| WebSocket 채널 | **14개** |
| 백그라운드 워커 | **6개** |
| 마이그레이션 | **60개** |
| 테스트 파일 | **393개** |
| 테스트 케이스 | **10,154개** |

---

## API 엔드포인트 상세 (485개)

### 라우트 파일: 68개
- Admin 라우트: 25 파일
- Workspace 라우트: 41 파일
- Auth/Public/기타: 2 파일

### 주요 파일별 엔드포인트 수
| 파일 | 엔드포인트 수 |
|------|-------------|
| strategy.ts | 45 |
| sns.ts | 34 |
| knowledge.ts | 33 |
| messenger.ts | 19 |
| conversations.ts | 12 |
| credentials.ts (합산) | 16 |
| dashboard.ts (합산) | 12 |
| agents.ts (admin) | 11 |
| archive.ts | 11 |
| chat.ts | 9 |
| agents.ts (workspace) | 6 |

---

## 프론트엔드 페이지 (71개)

### Admin (27개)
dashboard, companies, users, employees, departments, agents, tools, costs, budget, credentials, api-keys, report-lines, settings, monitoring, mcp-servers, mcp-access, mcp-credentials, nexus, onboarding, org-chart, org-templates, agent-reports, agent-marketplace, soul-templates, template-market, sketchvibe, login

### CEO App (42개)
activity-log, agents, agora, argos, chat, classified, costs, cron-base, dashboard, departments, files, home, jobs, knowledge, login, messenger, nexus, notifications, onboarding, ops-log, org, performance, reports, settings, sketchvibe, sns, tiers, trading, workflows + command-center(5) + hub(4)

---

## DB 스키마 (86 테이블 + 29 Enum)

파일: `packages/server/src/db/schema.ts`

---

## WebSocket 14채널

1. chat-stream
2. agent-status
3. notifications
4. messenger
5. conversation
6. activity-log
7. strategy-notes
8. night-job
9. nexus
10. debate
11. cost
12. command
13. delegation
14. tool

파일: `packages/server/src/ws/channels.ts`

---

## 백그라운드 워커 6개

1. Job Queue Worker (`lib/job-queue.ts`)
2. Argos Engine (`services/argos-evaluator.ts`)
3. Cron Execution Engine (`services/cron-execution-engine.ts`)
4. Trigger Worker (`lib/trigger-worker.ts`)
5. SNS Schedule Checker (`lib/sns-schedule-checker.ts`)
6. Semantic Cache Cleanup (`lib/semantic-cache-cleanup.ts`)

초기화: `packages/server/src/index.ts`

---

## Built-in 도구 68개

- Common 도구: 15개 (calculate, date_utils, search_web, send_email 등)
- Domain 도구: 15개 (주식, 뉴스, 법률, KIS 연동 등)
- E5 Phase 도구: 3개 (NotebookLM)
- E7 Phase 도구: 4개 (엔터프라이즈)
- 핸들러 파일: 66개 (builtins/ 디렉토리)

---

## 테스트 (10,154 케이스)

- 테스트 파일: 393개 (`.test.ts`)
- 테스트 케이스: 10,154개 (`test()` 호출)
- 위치: `packages/server/src/__tests__/`
