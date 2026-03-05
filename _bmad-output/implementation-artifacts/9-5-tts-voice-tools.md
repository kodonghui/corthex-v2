# Story 9.5: TTS/음성 도구 — 텍스트 음성 변환

Status: review

## Story

As a AI 에이전트 사용자,
I want 에이전트가 텍스트를 음성으로 변환하고 텔레그램 봇으로 메시지를 보낼 수 있다,
so that 에이전트가 음성 출력과 외부 메신저 알림을 지원할 수 있다.

## Acceptance Criteria

1. `text_to_speech` 핸들러가 입력 텍스트에 대해 TTS URL 또는 Base64 오디오를 반환한다
2. `send_telegram` 핸들러가 텔레그램 Bot API로 메시지를 발송하고 결과를 반환한다
3. 2개 핸들러 모두 registry.register()로 등록되고 graceful degradation 패턴
4. credential-vault에 telegram, tts provider 스키마가 추가된다
5. 시드 데이터에 2개 도구가 등록된다
6. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: TTS provider + 핸들러 (AC: #1, #3, #4)
  - [x] credential-vault에 tts provider 추가 (api_key)
  - [x] `packages/server/src/lib/tool-handlers/builtins/text-to-speech.ts` 생성
  - [x] Google Cloud TTS 또는 유사 API 호출 패턴
  - [x] `index.ts`에 import + register
- [x] Task 2: Telegram provider + 핸들러 (AC: #2, #3, #4)
  - [x] credential-vault에 telegram provider 추가 (bot_token, chat_id)
  - [x] `packages/server/src/lib/tool-handlers/builtins/send-telegram.ts` 생성
  - [x] Telegram Bot API sendMessage 호출
  - [x] `index.ts`에 import + register
- [x] Task 3: 시드 데이터 + 빌드 (AC: #5, #6)
  - [x] seed.ts에 2개 도구 추가 + 기존 '텔레그램' placeholder 대체
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### TTS API 패턴
Google Cloud TTS REST API:
```
POST https://texttospeech.googleapis.com/v1/text:synthesize?key={api_key}
Body: { input: { text }, voice: { languageCode: "ko-KR" }, audioConfig: { audioEncoding: "MP3" } }
Response: { audioContent: base64 }
```

### Telegram Bot API
```
POST https://api.telegram.org/bot{token}/sendMessage
Body: { chat_id, text, parse_mode: "Markdown" }
```

### 시드 데이터 매핑
| 도구명 | category | tags |
|--------|----------|------|
| text_to_speech | utility | ["tts", "voice", "api"] |
| send_telegram | communication | ["telegram", "bot", "api"] |

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- Task 1: text_to_speech — Google Cloud TTS API, ko-KR 기본, MP3 base64 반환, 5000자 제한
- Task 2: seed.ts에 TTS 도구 추가, credential-vault에 tts provider 추가

### File List

- packages/server/src/lib/tool-handlers/builtins/text-to-speech.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/services/credential-vault.ts (수정)
- packages/server/src/db/seed.ts (수정)
