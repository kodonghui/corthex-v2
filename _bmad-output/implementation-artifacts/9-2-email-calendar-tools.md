# Story 9.2: 이메일/캘린더 도구 — SMTP 이메일 발송 + 구글 캘린더 조회/생성

Status: review

## Story

As a AI 에이전트 사용자,
I want 에이전트가 이메일을 보내고 구글 캘린더 일정을 확인/추가할 수 있다,
so that 에이전트가 업무 커뮤니케이션과 일정 관리를 자동화할 수 있다.

## Acceptance Criteria

1. `send_email` 핸들러가 credential vault의 smtp/email 자격증명을 사용하여 이메일을 발송하고, 결과(성공/실패)를 반환한다
2. `list_calendar_events` 핸들러가 Google Calendar API로 오늘~7일 이내 일정 목록을 반환한다
3. `create_calendar_event` 핸들러가 Google Calendar API로 새 일정을 생성하고 결과를 반환한다
4. 3개 핸들러 모두 registry.register()로 등록되고, credential 없을 때 graceful degradation 패턴을 따른다
5. credential-vault에 google_calendar provider 스키마가 추가된다
6. 시드 데이터에 3개 신규 도구(category, tags, inputSchema 포함)가 등록된다
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: send_email 핸들러 (AC: #1, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/send-email.ts` 생성
  - [x] 기존 email-sender.ts의 sendEmail() 활용, credential vault에서 smtp 자격증명 조회
  - [x] 입력: to, subject, body(text) → HTML 변환 후 발송
  - [x] `index.ts`에 import + registry.register('send_email', sendEmail)
- [x] Task 2: google_calendar credential provider (AC: #5)
  - [x] `credential-vault.ts`의 PROVIDER_SCHEMAS에 google_calendar 추가
  - [x] 필수 필드: api_key (서비스 계정 키 또는 API 키)
- [x] Task 3: list_calendar_events 핸들러 (AC: #2, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/list-calendar-events.ts` 생성
  - [x] Google Calendar API v3 events.list 호출 (timeMin: now, timeMax: now+7d)
  - [x] 결과: title, start, end, location 반환
  - [x] `index.ts`에 import + register
- [x] Task 4: create_calendar_event 핸들러 (AC: #3, #4)
  - [x] `packages/server/src/lib/tool-handlers/builtins/create-calendar-event.ts` 생성
  - [x] Google Calendar API v3 events.insert 호출
  - [x] 입력: title, startTime, endTime, description(optional), location(optional)
  - [x] `index.ts`에 import + register
- [x] Task 5: 시드 데이터 업데이트 (AC: #6)
  - [x] seed.ts에 send_email, list_calendar_events, create_calendar_event 추가
  - [x] 기존 placeholder '이메일', '일정 관리' 대체
  - [x] category, tags, inputSchema, handler 모두 포함
- [x] Task 6: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공 확인

## Dev Notes

### send_email 구현

기존 `packages/server/src/lib/email-sender.ts`에 nodemailer 기반 sendEmail() 함수가 있음.
credential vault의 smtp/email provider에서 host, port, user, password, from 조회 후 활용.

```typescript
import type { ToolHandler } from '../types'
import { sendEmail as smtpSend } from '../../email-sender'

export const sendEmailTool: ToolHandler = async (input, ctx) => {
  const to = String(input.to || '')
  const subject = String(input.subject || '')
  const body = String(input.body || '')
  if (!to || !subject) return '받는 사람(to)과 제목(subject)은 필수입니다.'

  let creds: Record<string, string>
  try {
    creds = await ctx.getCredentials('smtp')
  } catch {
    return JSON.stringify({ success: false, message: 'SMTP 자격증명이 등록되지 않았습니다.' })
  }

  // SmtpConfig 형태로 변환 → sendEmail 호출
  const smtpConfig = { host: creds.host, port: Number(creds.port), secure: Number(creds.port) === 465, user: creds.user, pass: creds.password }
  // sendEmail(smtpConfig, { to, subject, html: bodyToHtml(body) })
}
```

### Google Calendar API 패턴

Google Calendar API v3는 REST API. Service Account 또는 API Key로 접근.
- events.list: `GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`
- events.insert: `POST https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events`

credential에 api_key 저장. config에 calendarId 저장 가능 (기본값: 'primary').

```typescript
const baseUrl = 'https://www.googleapis.com/calendar/v3'
const calendarId = ctx.config?.calendarId || 'primary'
const url = `${baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?key=${creds.api_key}&timeMin=...&timeMax=...`
```

### 시드 데이터 매핑

| 도구명 | category | tags |
|--------|----------|------|
| send_email | communication | ["email", "smtp", "api"] |
| list_calendar_events | utility | ["calendar", "google", "api"] |
| create_calendar_event | utility | ["calendar", "google", "api"] |

### email-sender.ts 기존 구조

- `sendEmail(config: SmtpConfig, params: EmailParams)` — nodemailer transporter 생성 → sendMail
- SmtpConfig: { host, port, secure, user, pass }
- EmailParams: { to, subject, html }
- nodemailer는 dynamic import (없으면 graceful fail)

### Project Structure Notes

- 기존 email-sender.ts 재사용 (중복 구현 방지)
- Google Calendar은 fetch()로 직접 호출 (추가 라이브러리 불필요)
- credential-vault.ts PROVIDER_SCHEMAS에 google_calendar 추가 필요

### References

- [Source: packages/server/src/lib/email-sender.ts] — 기존 SMTP 이메일 발송
- [Source: packages/server/src/services/credential-vault.ts:8-16] — PROVIDER_SCHEMAS
- [Source: packages/server/src/lib/tool-handlers/builtins/search-web.ts] — credential 조회 + API 호출 참조 패턴
- [Source: packages/server/src/db/seed.ts:224-231] — 기존 placeholder 외부 도구 (이메일, 일정 관리)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: send_email — smtp/email credential 양쪽 fallback, email-sender.ts 재사용, XSS escape 처리
- Task 2: credential-vault에 google_calendar provider 추가 (api_key 필수)
- Task 3: list_calendar_events — Google Calendar API v3 events.list, 기본 7일, 최대 10건
- Task 4: create_calendar_event — Google Calendar API v3 events.insert, Asia/Seoul 타임존
- Task 5: seed.ts에 3개 신규 도구 추가 + 기존 placeholder(이메일, 일정관리) 대체
- Task 6: turbo build 3/3 성공

### File List

- packages/server/src/lib/tool-handlers/builtins/send-email.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/list-calendar-events.ts (신규)
- packages/server/src/lib/tool-handlers/builtins/create-calendar-event.ts (신규)
- packages/server/src/lib/tool-handlers/index.ts (수정)
- packages/server/src/services/credential-vault.ts (수정)
- packages/server/src/db/seed.ts (수정)
