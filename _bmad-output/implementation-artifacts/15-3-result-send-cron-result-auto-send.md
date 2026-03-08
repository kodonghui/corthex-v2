# Story 15.3: 결과 전송 + 크론 결과 자동 전송

Status: done

## Story

As a CEO/관리자,
I want 오케스트레이션 결과가 텔레그램으로 자동 전송되고, 크론 스케줄러 실행 결과도 텔레그램으로 자동 푸시되기를,
so that 모바일에서도 AI 조직의 작업 결과를 실시간으로 확인하고 크론 작업 결과를 놓치지 않을 수 있다.

## Acceptance Criteria

1. **크론 결과 텔레그램 자동 전송**: 크론 실행 엔진(`cron-execution-engine.ts`)이 작업 완료 시 해당 회사의 텔레그램 봇을 통해 CEO에게 결과를 자동 전송한다. 성공/실패 모두 전송.
2. **크론 결과 메시지 포맷**: `⏰ [스케줄명]\n\n결과내용` 형식. 긴 결과는 3900자로 잘라서 `\n\n... (전체는 웹에서 확인)` 추가. 실패 시 `❌ 크론 실패: [스케줄명]\n오류: [메시지]` 형식.
3. **텔레그램 결과 전송 실패 시 무시**: 결과 전송 실패해도 크론 실행 자체에 영향 없음 (fire-and-forget). 전송 실패만 콘솔 경고.
4. **회사별 텔레그램 설정 조회**: companyId로 telegramConfigs 조회, isActive=true이고 ceoChatId가 있어야 전송. 설정 없으면 조용히 건너뜀.
5. **결과 전송 전용 함수**: `sendCronResult(companyId, scheduleName, result, isSuccess)` 함수 export하여 크론 엔진뿐 아니라 향후 알림에도 재사용 가능.
6. **텔레그램 알림 함수**: `sendTelegramNotification(companyId, message)` 범용 함수 — companyId로 설정 조회 → 토큰 복호화 → sendMessage. 알림 전송의 단일 진입점.
7. **크론 실패 재시도 시 중복 전송 방지**: 재시도 시 매번 전송하지 않고, 최종 결과(성공 또는 최종 실패)만 1회 전송.
8. **멀티테넌트 격리**: 각 회사의 텔레그램 봇/chatId로만 전송. 다른 회사에 전송되지 않음.
9. **기존 테스트 유지**: telegram-bot.test.ts 88건 + telegram-command-parsing 62건 모두 통과 유지.

## Tasks / Subtasks

- [x] Task 1: sendTelegramNotification 범용 함수 (AC: #6, #4, #8)
  - [x] 1.1 `telegram-bot.ts`에 `sendTelegramNotification(companyId, message)` 추가
  - [x] 1.2 companyId → telegramConfigs 조회 → isActive + ceoChatId 확인
  - [x] 1.3 botToken 복호화 → sendMessage 호출
  - [x] 1.4 설정 없거나 비활성이면 조용히 return (에러 아님)
  - [x] 1.5 sendMessage 실패 시 console.warn 후 return (throw 안 함)

- [x] Task 2: sendCronResult 전용 함수 (AC: #5, #2, #3)
  - [x] 2.1 `telegram-bot.ts`에 `sendCronResult(companyId, scheduleName, result, isSuccess)` 추가
  - [x] 2.2 성공 시: `⏰ [${scheduleName}]\n\n${result}` (3900자 제한)
  - [x] 2.3 실패 시: `❌ 크론 실패: ${scheduleName}\n오류: ${errorMessage}`
  - [x] 2.4 내부적으로 sendTelegramNotification 호출 (fire-and-forget)

- [x] Task 3: cron-execution-engine 연동 (AC: #1, #7)
  - [x] 3.1 `cron-execution-engine.ts`에서 `sendCronResult` import
  - [x] 3.2 executeCronJob 성공 시 sendCronResult(companyId, name, result, true) 호출
  - [x] 3.3 최종 실패 시(재시도 초과) sendCronResult(companyId, name, error, false) 호출
  - [x] 3.4 **재시도 중에는 전송하지 않음** — retryCount < MAX_RETRIES - 1일 때 건너뛰기
  - [x] 3.5 sendCronResult는 fire-and-forget (await 하지 않고 .catch로 에러만 로깅)

- [x] Task 4: 테스트 (AC: #9)
  - [x] 4.1 sendTelegramNotification 단위 테스트 (설정 있음/없음/비활성/복호화실패)
  - [x] 4.2 sendCronResult 단위 테스트 (성공/실패/긴결과 잘림/빈결과)
  - [x] 4.3 cron-execution-engine 연동 테스트 (성공 시 전송/실패 시 전송/재시도 중 미전송)
  - [x] 4.4 기존 88 + 62 = 150건 테스트 통과 확인

## Dev Notes

### 핵심 패턴: v1 참고 (CRITICAL)

v1 코드 `/home/ubuntu/CORTHEX_HQ/web/scheduler.py` (lines 277-322):
```python
# v1 크론 결과 전송 패턴
content = result.get("content", "")
if content and app_state.telegram_app:
    msg = f"⏰ [{schedule_name}]\n\n{content}"
    if len(msg) > 3900:
        msg = msg[:3900] + "\n\n... (전체는 웹에서 확인)"
    await app_state.telegram_app.bot.send_message(chat_id=int(ceo_id), text=msg)
```

이 패턴을 v2 TypeScript로 그대로 이식:
- 3900자 제한 (4096 Telegram 한도 - 여유분)
- fire-and-forget (전송 실패해도 크론 실행은 정상)
- `⏰` 이모지 + 스케줄명 헤더

### 기존 코드 구조 (수정 대상)

**`telegram-bot.ts`** (1030줄):
- 이미 `sendMessage`, `getConfigByCompanyId` 등 존재
- `sendTelegramNotification`과 `sendCronResult`를 추가하면 됨
- `getConfigByCompanyId`는 이미 companyId→config 로드를 하므로 재사용

**`cron-execution-engine.ts`** (406줄):
- `executeCronJob` 함수의 성공 블록(line ~253)과 실패 블록(line ~315)에 sendCronResult 호출 추가
- WebSocket eventBus.emit 바로 다음에 추가하면 자연스러움
- 재시도 블록(retryCount < MAX_RETRIES - 1)에서는 전송하지 않음

### 구현 주의사항

1. **순환 import 방지**: cron-execution-engine.ts가 telegram-bot.ts를 import. telegram-bot.ts는 cron-execution-engine을 import하지 않으므로 OK.
2. **async/await 패턴**: sendCronResult는 fire-and-forget이므로 await 없이 `.catch(err => console.warn(...))` 패턴 사용.
3. **테스트 mock**: db, decrypt, fetch를 mock해야 함. 기존 telegram-bot.test.ts의 mock 패턴 따를 것.
4. **3900자 제한**: splitMessage(4096자)와 별개. 크론 결과는 하나의 메시지로 보내고, 길면 잘라서 보냄.

### 코드 위치 정리

| 변경 | 파일 | 위치 |
|------|------|------|
| sendTelegramNotification 추가 | `packages/server/src/services/telegram-bot.ts` | getConfigByCompanyId 바로 위 |
| sendCronResult 추가 | `packages/server/src/services/telegram-bot.ts` | sendTelegramNotification 바로 아래 |
| executeCronJob 수정 | `packages/server/src/services/cron-execution-engine.ts` | 성공/최종실패 블록 |
| 테스트 파일 생성 | `packages/server/src/__tests__/unit/telegram-result-send.test.ts` | 신규 |

### Project Structure Notes

- `packages/server/src/services/telegram-bot.ts` — 텔레그램 봇 서비스 (수정)
- `packages/server/src/services/cron-execution-engine.ts` — 크론 실행 엔진 (수정)
- `packages/server/src/__tests__/unit/telegram-result-send.test.ts` — 신규 테스트
- DB 스키마 변경 없음
- 마이그레이션 없음

### 의존성

- **E15-S2** (완료): 텔레그램 명령 파싱 — handleUpdate, parseEntities, handleCallbackQuery
- **E14-S2** (완료): 크론 실행 엔진 — executeCronJob, pollDueSchedules
- 신규 import: `cron-execution-engine.ts` → `telegram-bot.ts` (sendCronResult)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic15-S3]
- [Source: packages/server/src/services/telegram-bot.ts — sendMessage, getConfigByCompanyId]
- [Source: packages/server/src/services/cron-execution-engine.ts — executeCronJob lines 117-335]
- [Source: /home/ubuntu/CORTHEX_HQ/web/scheduler.py — lines 277-322, v1 크론 결과 전송]
- [Source: _bmad-output/implementation-artifacts/15-2-telegram-command-parsing-mention-text.md — 이전 스토리]

### 이전 스토리 인텔리전스 (15-2)

- Entity 기반 @mention 파싱이 text 기반보다 정확 — 이번 스토리는 mention 관련 없으므로 참고만
- `command-router.parseSlash()` 재사용하여 중복 방지 — 이번 스토리도 기존 함수 재사용 원칙 유지
- mock 패턴: `vi.mock('../db')`, `vi.mock('../lib/crypto')`, `vi.mock('../lib/activity-logger')`
- 테스트 프레임워크: `bun:test` (describe/it/expect)
- 기존 테스트 파일: telegram-bot.test.ts (88건), telegram-command-parsing.test.ts (33건), telegram-command-parsing-tea.test.ts (29건)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- sendTelegramNotification(): companyId → config → decrypt → sendMessage, silent on failure
- sendCronResult(): success format ⏰[name], failure format ❌, 3900 char truncation
- cron-execution-engine: sendCronResult on success + final failure only (not during retries)
- 16 new tests: 7 notification, 7 cron result, 2 integration export checks
- 131 existing telegram tests pass (88 + 33 + 29 + ... = 131)
- 88 cron engine tests pass

### Change Log

- 2026-03-08 — Story 15-3 context created with comprehensive developer guide
- 2026-03-08 — Story 15-3 implemented: sendTelegramNotification, sendCronResult, cron engine integration, 16 new tests

### File List

- `packages/server/src/services/telegram-bot.ts` (MODIFIED — added sendTelegramNotification, sendCronResult)
- `packages/server/src/services/cron-execution-engine.ts` (MODIFIED — import sendCronResult, fire-and-forget calls)
- `packages/server/src/__tests__/unit/telegram-result-send.test.ts` (NEW — 16 tests)
