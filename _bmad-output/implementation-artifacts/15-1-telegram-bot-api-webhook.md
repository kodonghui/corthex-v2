# Story 15.1: 텔레그램 Bot API Webhook 연동

Status: done

## Story

As a CEO/Human 직원,
I want 텔레그램 봇에서 Webhook 방식으로 명령을 수신하고 오케스트레이션 결과를 돌려받을 수 있도록,
so that 모바일에서도 AI 조직에 업무 지시를 내리고 실시간 결과를 받을 수 있다.

## Acceptance Criteria (BDD)

1. **Webhook 등록/해제**: POST `/api/workspace/telegram/webhook` 호출 시 Telegram Bot API `setWebhook`이 성공하고, DELETE 시 `deleteWebhook`으로 해제된다
2. **Webhook 수신**: POST `/api/telegram/webhook/:companyId` 엔드포인트가 Telegram Update JSON을 수신하고 200 OK를 즉시 반환한다
3. **인증**: ceoChatId가 설정된 회사의 봇만 명령을 처리하고, 미인증 chat_id는 무시한다
4. **슬래시 명령**: /start, /help, /agents, /cost, /health, /status, /tasks, /last, /cancel — v1과 동일한 13개 명령 지원
5. **일반 텍스트 → 오케스트레이션**: 슬래시 명령이 아닌 일반 텍스트는 CommandRouter(classify + createCommand + ChiefOfStaff)를 통해 처리
6. **결과 전송**: 오케스트레이션 완료 시 Telegram sendMessage로 CEO에게 결과를 Markdown 형식으로 전송 (4096자 초과 시 분할)
7. **토큰 보안**: botToken은 DB에 AES-256-GCM 암호화 저장, Webhook URL에는 secret_token을 포함하여 Telegram이 X-Telegram-Bot-Api-Secret-Token 헤더로 검증
8. **멀티테넌트**: 회사별로 독립된 봇 토큰 + Webhook URL 사용, companyId 기반 격리
9. **에러 핸들링**: Telegram API 호출 실패 시 3회 재시도 (지수 백오프), 실패 시 로그 기록

## Tasks / Subtasks

- [x] Task 1: TelegramBotService 생성 (AC: #1,#3,#4,#5,#6,#7,#8,#9)
  - [x] 1.1 `packages/server/src/services/telegram-bot.ts` 생성
  - [x] 1.2 Telegram Bot API HTTP 클라이언트 구현 (sendMessage, getMe, setWebhook, deleteWebhook)
  - [x] 1.3 메시지 분할 로직 (4096자 제한, Markdown 안전 분할)
  - [x] 1.4 재시도 로직 (3회, 지수 백오프 1s→2s→4s)
  - [x] 1.5 슬래시 명령 핸들러 13개 구현 (/start ~/cancel)
  - [x] 1.6 일반 텍스트 → CommandRouter 연동 (classify → createCommand → ChiefOfStaff)
  - [x] 1.7 결과 포매터 (Markdown 형식, 부서별 정리)

- [x] Task 2: Webhook 라우트 구현 (AC: #1,#2,#7,#8)
  - [x] 2.1 `packages/server/src/routes/telegram-webhook.ts` 생성 (공개 엔드포인트)
  - [x] 2.2 POST `/api/telegram/webhook/:companyId` — Update 수신 + secret_token 헤더 검증
  - [x] 2.3 기존 telegram route에 PUT `/api/workspace/telegram/webhook` 추가 — setWebhook 호출
  - [x] 2.4 기존 telegram route에 DELETE `/api/workspace/telegram/webhook` 추가 — deleteWebhook 호출
  - [x] 2.5 index.ts에 webhook 라우트 등록 (인증 미들웨어 없이, rate limit 적용)

- [x] Task 3: DB 스키마 확장 (AC: #7,#8)
  - [x] 3.1 telegramConfigs 테이블에 `webhookSecret` varchar(100) 컬럼 추가 (Drizzle migration)
  - [x] 3.2 telegramConfigs 테이블에 `webhookUrl` text 컬럼 추가

- [x] Task 4: 테스트 (전체)
  - [x] 4.1 TelegramBotService 단위 테스트 (명령 파싱, 메시지 분할, 재시도)
  - [x] 4.2 Webhook 라우트 단위 테스트 (secret 검증, Update 처리, 에러)
  - [x] 4.3 통합 테스트 (Webhook 등록 → 메시지 수신 → 오케스트레이션 → 결과 전송 플로우)

## Dev Notes

### 기존 코드 활용 (매우 중요)

**이미 존재하는 것:**
- `packages/server/src/routes/workspace/telegram.ts` — 봇 토큰 등록/조회/삭제 CRUD (이미 동작)
- `packages/server/src/db/schema.ts` — telegramConfigs 테이블 (botToken encrypted, ceoChatId, isActive)
- `packages/server/src/lib/crypto.ts` — encrypt/decrypt (AES-256-GCM)
- `packages/server/src/services/command-router.ts` — classify(), createCommand()
- `packages/server/src/services/chief-of-staff.ts` — process() (명령 → 오케스트레이션)
- `packages/server/src/index.ts` — telegramRoute 이미 등록 (line 130)

**v1 참고 코드 (패턴 유지):**
- `/home/ubuntu/CORTHEX_HQ/src/telegram/bot.py` — 슬래시 명령 13개, 한국어 토론 처리
- `/home/ubuntu/CORTHEX_HQ/src/telegram/bridge.py` — TelegramBridge (명령→Orchestrator→결과 전송)
- `/home/ubuntu/CORTHEX_HQ/src/telegram/notifier.py` — TelegramNotifier (프로액티브 알림)
- `/home/ubuntu/CORTHEX_HQ/src/telegram/auth.py` — chat_id 기반 인증

### 핵심 아키텍처 결정

1. **Webhook vs Polling**: v1은 polling, v2는 Webhook 방식 (서버가 이미 HTTP 서버이므로 효율적)
2. **공개 엔드포인트**: `/api/telegram/webhook/:companyId`는 인증 미들웨어 없이 등록 (Telegram 서버가 호출)
3. **Secret Token**: `setWebhook` 시 `secret_token` 파라미터 사용 → Telegram이 `X-Telegram-Bot-Api-Secret-Token` 헤더로 전송 → 서버가 검증
4. **멀티테넌트**: URL에 companyId 포함하여 어떤 회사의 봇인지 식별
5. **비동기 처리**: Webhook은 즉시 200 반환, 오케스트레이션은 백그라운드에서 처리 후 sendMessage로 결과 전송

### Telegram Bot API 핵심 정보

- Base URL: `https://api.telegram.org/bot{token}/{method}`
- setWebhook: POST, params: `url`, `secret_token` (1-256 chars), `allowed_updates: ["message", "callback_query"]`
- deleteWebhook: POST, no required params
- sendMessage: POST, params: `chat_id`, `text`, `parse_mode: "Markdown"`, text max 4096 chars
- getMe: GET, 봇 정보 조회 (토큰 검증용)
- Update 구조: `{ update_id, message: { message_id, from, chat, date, text, entities } }`

### 메시지 분할 전략

Telegram sendMessage는 4096자 제한. 긴 결과는:
1. `\n\n` 기준 분할 시도
2. `\n` 기준 분할 시도
3. 최후: 4096자 하드컷
4. Markdown 코드블록 내에서 분할 시 ``` 자동 닫기/열기

### Project Structure Notes

```
packages/server/src/
├── routes/
│   ├── telegram-webhook.ts          # [NEW] 공개 Webhook 수신 엔드포인트
│   └── workspace/
│       └── telegram.ts              # [MODIFY] Webhook 등록/해제 추가
├── services/
│   └── telegram-bot.ts              # [NEW] 핵심 서비스 (명령 처리 + 결과 전송)
├── db/
│   └── schema.ts                    # [MODIFY] webhookSecret, webhookUrl 추가
└── index.ts                         # [MODIFY] webhook 라우트 등록
```

### v2 기존 패턴 준수

- 라우트: Hono + zValidator
- DB: Drizzle ORM + PostgreSQL
- 인증: authMiddleware + tenant context
- 에러: HTTPError class
- 암호화: lib/crypto.ts (encrypt/decrypt)
- 로깅: logActivity() for audit trail
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 파일명: kebab-case
- 테스트: bun:test

### 슬래시 명령 매핑 (v1 → v2)

| v1 명령 | v2 구현 | 데이터 소스 |
|---------|---------|------------|
| /start | ceoChatId 안내 또는 환영 메시지 | telegramConfigs |
| /help | 사용법 텍스트 | 하드코딩 |
| /agents | 에이전트 목록 | agents 테이블 (companyId 필터) |
| /cost | 비용 현황 | costRecords 집계 |
| /health | 시스템 상태 | health check 로직 |
| /tasks | 최근 작업 | commands 테이블 (최근 10건) |
| /last | 마지막 결과 | commands 테이블 (최근 1건) |
| /status | 실행 중 작업 | orchestrationTasks (running 상태) |
| /cancel {id} | 작업 취소 | orchestrationTasks 상태 업데이트 |
| /detail | 마지막 보고서 전체 | 캐시된 마지막 결과 |
| /result {id} | 작업 결과 조회 | /task 별칭 |
| /task {id} | 특정 작업 상세 | commands + orchestrationTasks |
| /models | 모델 목록 | models.yaml 하드코딩 |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 15]
- [Source: _bmad-output/planning-artifacts/architecture.md#외부 의존성 - 텔레그램]
- [Source: _bmad-output/planning-artifacts/prd.md#FR68]
- [Source: packages/server/src/routes/workspace/telegram.ts — 기존 CRUD]
- [Source: packages/server/src/services/command-router.ts — classify/createCommand]
- [Source: packages/server/src/services/chief-of-staff.ts — process()]
- [Source: /home/ubuntu/CORTHEX_HQ/src/telegram/ — v1 전체 텔레그램 모듈]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- TelegramBotService: Full Telegram Bot API client with setWebhook/deleteWebhook/sendMessage/getMe, 3-retry exponential backoff (1s→2s→4s), 4xx no-retry, message splitting (4096 char limit with code block safety)
- 13 slash commands: /start, /help, /agents, /cost, /health, /tasks, /last, /status, /cancel, /detail, /result, /task, /models — all querying real DB (agents, commands, orchestrationTasks, costRecords)
- General text → CommandRouter pipeline: classify → createCommand → ChiefOfStaff/All/Sequential/Debate processors
- Webhook route: Public POST /api/telegram/webhook/:companyId with X-Telegram-Bot-Api-Secret-Token verification, always returns 200
- Workspace webhook management: PUT/DELETE /api/workspace/telegram/webhook with setWebhook/deleteWebhook + secret generation
- DB schema: Added webhookSecret varchar(100) and webhookUrl text to telegramConfigs table with migration 0042
- 88 tests (32 telegram-bot + 19 telegram-webhook + 37 telegram-tea): command parsing, message splitting, auth, retry, API mocks, security, multitenant, risk-based edge cases

### Change Log
- 2026-03-08: Story 15-1 implemented — Telegram Bot API Webhook integration with 51 tests
- 2026-03-08: TEA automate — 37 risk-based tests added (telegram-tea.test.ts)
- 2026-03-08: Code review — Fixed processAll/processSequential/processDebateCommand result not sent to Telegram, removed redundant double-decrypt in error handler

### File List
- packages/server/src/services/telegram-bot.ts (NEW)
- packages/server/src/routes/telegram-webhook.ts (NEW)
- packages/server/src/routes/workspace/telegram.ts (MODIFIED — webhook endpoints added)
- packages/server/src/db/schema.ts (MODIFIED — webhookSecret, webhookUrl columns)
- packages/server/src/db/migrations/0042_telegram-webhook-columns.sql (NEW)
- packages/server/src/index.ts (MODIFIED — telegramWebhookRoute registered)
- packages/server/src/__tests__/unit/telegram-bot.test.ts (NEW — 32 tests)
- packages/server/src/__tests__/unit/telegram-webhook.test.ts (NEW — 19 tests)
- packages/server/src/__tests__/unit/telegram-tea.test.ts (NEW — 37 TEA tests)
