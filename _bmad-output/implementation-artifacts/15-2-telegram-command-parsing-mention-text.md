# Story 15.2: 텔레그램 명령 파싱 (@멘션 + 텍스트)

Status: done

## Story

As a CEO/Human 직원,
I want 텔레그램에서 @멘션으로 특정 Manager를 지정하고, 한국어 슬래시 명령(/전체, /순차, /토론 등)을 사용하며, 인라인 버튼으로 승인/거절 등 인터랙션을 처리할 수 있도록,
so that 사령관실과 동일한 명령 체계를 모바일 텔레그램에서도 사용할 수 있다.

## Acceptance Criteria (BDD)

1. **@멘션 파싱 (Telegram entity 기반)**: 텔레그램 메시지의 `entities` 배열에서 `type: "mention"` 엔티티를 감지하여 `@에이전트명` → `resolveMentionAgent()` → 해당 Manager에게 직접 위임
2. **한국어 슬래시 명령**: /전체, /순차, /토론, /심층토론, /도구점검, /배치실행, /배치상태, /명령어 — 사령관실 command-router와 동일한 8개 한국어 슬래시가 텔레그램에서 동작
3. **한국어 텍스트 명령**: "토론 [주제]" 형태의 한국어 텍스트 명령도 인식하여 토론 처리기로 라우팅
4. **Callback Query 처리**: 인라인 키보드 버튼 콜백 처리 — SNS 승인(`sns_approve:ID`)/거절(`sns_reject:ID`) + 범용 콜백 라우팅
5. **인라인 키보드 전송**: `sendMessageWithKeyboard()` 함수로 인라인 버튼이 포함된 메시지 전송 가능 (SNS 승인 요청 등 외부에서 호출)
6. **진행 상태 업데이트**: `editMessage()` 함수로 기존 메시지를 수정하여 실시간 진행 상태 표시 가능 (⏳ → ✅)
7. **deleteMessage()**: 상태 메시지 삭제 기능
8. **멀티테넌트 격리**: 모든 callback/mention 처리에서 companyId 기반 격리 유지
9. **에러 핸들링**: 에이전트 미찾기 시 안내 메시지, 잘못된 콜백 데이터 시 query.answer로 응답

## Tasks / Subtasks

- [x] Task 1: telegram-bot.ts @멘션 파싱 강화 (AC: #1, #8)
  - [x] 1.1 `parseEntities()` 함수 추가: Telegram message.entities에서 mention, bot_command 타입 추출
  - [x] 1.2 handleUpdate에서 entities 기반 @멘션 감지 → command-router의 `resolveMentionAgent()` 호출
  - [x] 1.3 멘션된 에이전트가 존재하면 type='mention'으로 처리, 미존재 시 안내 메시지 전송
  - [x] 1.4 "@봇이름"(자기 자신 멘션)은 무시하고 텍스트만 추출

- [x] Task 2: 한국어 슬래시 명령 지원 (AC: #2, #3)
  - [x] 2.1 handleUpdate에서 command-router의 `parseSlash()` 호출하여 한국어 슬래시 인식
  - [x] 2.2 한국어 슬래시 결과에 따른 라우팅: all → processAll, sequential → processSequential, debate/deep_debate → processDebateCommand
  - [x] 2.3 /도구점검, /배치실행, /배치상태, /명령어는 해당 서비스 직접 호출 후 결과 전송
  - [x] 2.4 "토론 [주제]" 한국어 텍스트 명령 인식 (슬래시 없이도 동작)

- [x] Task 3: Callback Query 핸들러 (AC: #4, #8, #9)
  - [x] 3.1 `handleCallbackQuery()` 함수 추가: callback_query.data 파싱 + 라우팅
  - [x] 3.2 `sns_approve:{id}` → SNS publish-engine 승인 처리 + 결과 메시지 수정
  - [x] 3.3 `sns_reject:{id}` → SNS publish-engine 거절 처리 + 결과 메시지 수정
  - [x] 3.4 answerCallbackQuery() API 호출로 버튼 클릭 확인 응답
  - [x] 3.5 companyId 기반 권한 확인

- [x] Task 4: 인라인 키보드 + 메시지 수정/삭제 API (AC: #5, #6, #7)
  - [x] 4.1 `sendMessageWithKeyboard()` 함수: inline_keyboard 파라미터로 InlineKeyboardMarkup 전송
  - [x] 4.2 `editMessage()` 함수: editMessageText API 호출 (message_id + text)
  - [x] 4.3 `deleteMessage()` 함수: deleteMessage API 호출 (message_id)
  - [x] 4.4 `answerCallbackQuery()` 함수: 버튼 클릭 알림 응답

- [x] Task 5: Webhook 라우트 확장 (AC: #4, #8)
  - [x] 5.1 telegram-webhook.ts already passes full update (incl. callback_query) to handleUpdate — no change needed
  - [x] 5.2 callback_query의 chat_id로 companyId 매핑 + 인증 검증 (handleCallbackQuery에서 처리)

- [x] Task 6: 테스트 (전체)
  - [x] 6.1 @멘션 파싱 테스트 (entity 기반, 텍스트 기반, 봇이름 무시)
  - [x] 6.2 한국어 슬래시 명령 테스트 (/전체, /순차, /토론, /심층토론, 기타)
  - [x] 6.3 "토론 주제" 한국어 텍스트 명령 테스트
  - [x] 6.4 Callback query 핸들링 테스트 (SNS approve/reject, 미인증, 잘못된 데이터)
  - [x] 6.5 인라인 키보드 전송 테스트
  - [x] 6.6 editMessage, deleteMessage 테스트
  - [x] 6.7 멀티테넌트 격리 테스트 (다른 회사 callback 차단)

## Dev Notes

### 기존 코드 활용 (매우 중요)

**이미 존재하는 것 (15-1에서 구현):**
- `packages/server/src/services/telegram-bot.ts` — TelegramBotService (sendMessage, splitMessage, parseCommand, handleUpdate, setWebhook/deleteWebhook, 13 슬래시 핸들러)
- `packages/server/src/routes/telegram-webhook.ts` — Webhook 수신 엔드포인트 (POST /api/telegram/webhook/:companyId)
- `packages/server/src/services/command-router.ts` — classify(), parseMention(), resolveMentionAgent(), parseSlash()
- `packages/server/src/services/chief-of-staff.ts` — process()
- `packages/server/src/services/all-command-processor.ts` — processAll()
- `packages/server/src/services/sequential-command-processor.ts` — processSequential()
- `packages/server/src/services/debate-command-handler.ts` — processDebateCommand()

**수정할 파일 (기존 파일에 추가):**
- `packages/server/src/services/telegram-bot.ts` — 핵심 수정 파일
  - parseEntities() 추가
  - handleCallbackQuery() 추가
  - sendMessageWithKeyboard(), editMessage(), deleteMessage(), answerCallbackQuery() 추가
  - handleUpdate() 확장: entity 기반 @멘션, 한국어 슬래시 인식, 토론 텍스트 명령
- `packages/server/src/routes/telegram-webhook.ts` — callback_query 처리 추가

**v1 참고 코드 (패턴 유지):**
- `/home/ubuntu/CORTHEX_HQ/src/telegram/bot.py` lines 311-448:
  - `_run_debate()`: 한국어 "토론 주제" 명령 → 토론 실행
  - `handle_callback()`: SNS 승인/거절 인라인 버튼 콜백 처리
  - `handle_message()`: 한국어 토론 명령 인식 + 일반 텍스트 → bridge
- `/home/ubuntu/CORTHEX_HQ/src/telegram/bridge.py`:
  - `TelegramBridge.handle_command()`: 진행 상태 메시지 전송 + 수정 패턴

### 핵심 아키텍처 결정

1. **Entity 기반 @멘션**: Telegram message의 `entities` 배열에서 `type: "mention"` 감지. 텍스트 기반 `parseMention()`보다 정확 (Telegram이 이미 파싱한 결과 사용)
2. **한국어 슬래시 통합**: command-router의 `parseSlash()` 재활용. 이중 구현 금지
3. **Callback Query**: `update.callback_query`가 있으면 handleCallbackQuery로 분기. message 필드 없음에 주의
4. **SNS 승인 연동**: publish-engine의 기존 API를 직접 호출하거나 SNS 라우트의 approve/reject 엔드포인트를 내부 호출
5. **InlineKeyboard 형식**: `reply_markup: { inline_keyboard: [[{text, callback_data}]] }`

### Telegram Bot API 핵심 정보 (15-2 추가)

- **editMessageText**: POST, params: `chat_id`, `message_id`, `text`, `parse_mode`, `reply_markup?`
- **deleteMessage**: POST, params: `chat_id`, `message_id`
- **answerCallbackQuery**: POST, params: `callback_query_id`, `text?`, `show_alert?`
- **sendMessage with keyboard**: `reply_markup: { inline_keyboard: [[{ text: "승인", callback_data: "sns_approve:123" }]] }`
- **Callback Query 구조**: `{ id, from, message?, data?, chat_instance }`
- **Entity 구조**: `{ type: "mention", offset: 0, length: 5 }` → text.slice(offset, offset+length) = "@이름"
- **Entity types**: "mention" (@username), "bot_command" (/command), "text_mention" (이름에 @없이 멘션)

### 한국어 슬래시 명령 매핑

| 한국어 슬래시 | CommandType | 라우팅 대상 |
|-------------|-------------|-----------|
| /전체 [명령] | all | processAll() |
| /순차 [명령] | sequential | processSequential() |
| /토론 [주제] | slash (debate) | processDebateCommand() |
| /심층토론 [주제] | slash (deep_debate) | processDebateCommand() |
| /도구점검 | slash (tool_check) | toolCheck handler |
| /배치실행 | slash (batch_run) | batchRun handler |
| /배치상태 | slash (batch_status) | batchStatus handler |
| /명령어 | slash (commands_list) | 명령어 목록 텍스트 |

### Project Structure Notes

```
packages/server/src/
├── services/
│   └── telegram-bot.ts              # [MODIFY] @멘션 + 한국어슬래시 + callback + keyboard + edit/delete
├── routes/
│   └── telegram-webhook.ts          # [MODIFY] callback_query 처리 추가
└── __tests__/unit/
    └── telegram-command-parsing.test.ts  # [NEW] 15-2 테스트
```

### v2 기존 패턴 준수

- 라우트: Hono + zValidator
- DB: Drizzle ORM + PostgreSQL
- 인증: companyId + ceoChatId 기반 (Telegram 전용)
- 에러: try/catch + sendMessage로 에러 전송
- 암호화: lib/crypto.ts (decrypt for botToken)
- 로깅: logActivity() for audit trail
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 파일명: kebab-case
- 테스트: bun:test

### handleUpdate 수정 전략 (중요!)

현재 handleUpdate 흐름:
1. message.text 확인 → ceoChatId 인증 → parseCommand(text)
2. Telegram 슬래시(/start, /help 등) → handler 호출
3. 나머지 → classify() → createCommand() → process()

수정 후 흐름:
1. **callback_query 확인** → handleCallbackQuery() 분기 (최우선)
2. message.text 확인 → ceoChatId 인증
3. **Telegram entity에서 @멘션 추출** → resolveMentionAgent()
4. Telegram 슬래시(/start, /help 등) → handler 호출
5. **한국어 슬래시(/전체, /순차 등)** → parseSlash() → 라우팅
6. **"토론 주제" 텍스트** → debate 라우팅
7. 나머지 → classify() → createCommand() → process()

### 이전 스토리(15-1) 교훈

- sendMessage의 parse_mode: "Markdown"에서 특수문자 이스케이프 주의 (_*[]() 등)
- 비동기 결과 전송 패턴: .then() + .catch()로 fire-and-forget 처리
- callTelegramApi의 4xx 에러는 재시도하지 않음 (noRetry 플래그)
- 88개 테스트 패스 — 기존 테스트 깨뜨리지 않도록 주의

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 15, line 1303]
- [Source: _bmad-output/planning-artifacts/prd.md#FR68]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#텔레그램 @멘션]
- [Source: packages/server/src/services/telegram-bot.ts — 15-1 구현]
- [Source: packages/server/src/services/command-router.ts — parseMention/parseSlash/classify]
- [Source: packages/server/src/routes/telegram-webhook.ts — webhook 수신]
- [Source: /home/ubuntu/CORTHEX_HQ/src/telegram/bot.py — v1 토론/콜백/일반메시지 처리]
- [Source: /home/ubuntu/CORTHEX_HQ/src/telegram/bridge.py — v1 진행상태 메시지 수정 패턴]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List
- parseEntities(): Telegram entity 기반 @mention 추출. entities 배열에서 type="mention" 찾아 에이전트명 추출 + cleanText 생성
- handleUpdate 6단계 라우팅: (1) callback_query → handleCallbackQuery, (2) entity @mention → resolveMentionAgent → ChiefOfStaff, (3) Telegram slash (/start, /help 등), (4) Korean slash (/전체, /순차, /토론 등), (5) "토론 주제" 텍스트 명령, (6) general text → classify
- handleCallbackQuery(): sns_approve/sns_reject callback data 파싱 → DB snsContents 상태 업데이트 → editMessageText로 결과 표시 + answerCallbackQuery 확인
- handleKoreanSlash(): 8개 한국어 슬래시 (/전체, /순차, /토론, /심층토론, /도구점검, /배치실행, /배치상태, /명령어) 라우팅
- Telegram API 함수 4개 추가: sendMessageWithKeyboard(), editMessage(), deleteMessage(), answerCallbackQuery()
- /help 명령에 한국어 명령 + @멘션 안내 추가
- 33 tests (parseEntities 7개 + parseCommand 3개 + sendMessageWithKeyboard 1 + editMessage 2 + deleteMessage 1 + answerCallbackQuery 1 + @mention entity 3 + Korean slash 5 + Korean text debate 1 + callback query 6 + callback dispatch 1 + general fallback 1 + multitenant 1)
- 기존 88 telegram tests 유지 (1개 TEA 테스트 15-2 동작 반영 업데이트)

### Change Log
- 2026-03-08: Story 15-2 implemented — @mention entity parsing, Korean slash commands, callback query handling, inline keyboard API, 33 new tests

### File List
- packages/server/src/services/telegram-bot.ts (MODIFIED — parseEntities, handleCallbackQuery, handleKoreanSlash, sendMessageWithKeyboard, editMessage, deleteMessage, answerCallbackQuery 추가)
- packages/server/src/__tests__/unit/telegram-command-parsing.test.ts (NEW — 33 tests)
- packages/server/src/__tests__/unit/telegram-command-parsing-tea.test.ts (NEW — 29 TEA risk-based tests)
- packages/server/src/__tests__/unit/telegram-tea.test.ts (MODIFIED — callback_query 테스트 15-2 동작 반영)
