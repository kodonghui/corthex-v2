# Story 6.3: 이메일 알림 — SMTP 연동 + 이벤트별 발송

Status: ready-for-dev

## Story

As a 사용자,
I want 중요한 이벤트(야간작업 완료/실패 등)를 이메일로도 받는다,
so that 앱에 접속하지 않아도 긴급한 알림을 확인할 수 있다.

## Acceptance Criteria

1. **Given** notification_preferences.email=true **When** 알림 생성 시 **Then** 이메일도 함께 발송
2. **Given** SMTP 설정이 없는 회사 **When** 이메일 알림 시도 **Then** 조용히 스킵 (에러 아님)
3. **Given** 관리자 콘솔 **When** SMTP 설정 저장 **Then** companies 테이블 smtp_config JSONB에 저장
4. **Given** GET /settings/email-configured **When** 요청 **Then** SMTP 등록 여부 반환
5. **Given** notifier.ts createNotification **When** 호출 **Then** inApp + email 설정 확인 후 각각 발송
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [ ] Task 1: SMTP 설정 저장 (AC: #3)
  - [ ] companies 테이블에 smtp_config jsonb 컬럼 추가 (또는 api_keys 활용)
  - [ ] 관리자 API: PUT /admin/companies/:id/smtp
  - [ ] GET /settings/email-configured API (AC: #4)

- [ ] Task 2: 이메일 발송 유틸 (AC: #1, #2)
  - [ ] `packages/server/src/lib/email-sender.ts` — nodemailer 기반
  - [ ] SMTP 설정 조회 → 없으면 silent skip
  - [ ] HTML 템플릿 (간단한 인라인 스타일)

- [ ] Task 3: notifier.ts 이메일 통합 (AC: #5)
  - [ ] createNotification에서 notification_preferences 조회
  - [ ] email=true + SMTP 존재 → sendEmail 호출
  - [ ] fire-and-forget 패턴 유지

- [ ] Task 4: 빌드 검증 (AC: #6)

## Dev Notes

### notification_preferences 기존 스키마
- `packages/server/src/db/schema.ts:110-121` — inApp/email/push 이미 존재
- email 기본값 false → 사용자가 설정에서 켜야 발송

### nodemailer 패키지
- `bun add nodemailer @types/nodemailer`
- SMTP transporter: host, port, secure, auth

### 이메일 발송 대상 이벤트 (UX 스펙 기본값)
| 이벤트 | 이메일 기본값 |
|--------|-------------|
| 야간작업 완료 | ON |
| 야간작업 실패 | ON |
| CEO 보고서 코멘트 | ON |
| 채팅 응답 완료 | OFF |
| 매매 체결 | OFF |
| 메신저 메시지 | OFF |

### References
- [Source: ux-design-specification.md#1979-2016] — 알림 설정 탭 + 이메일 기본값
- [Source: packages/server/src/db/schema.ts:110-121] — notification_preferences

## Dev Agent Record

### Agent Model Used
### Debug Log References
### Completion Notes List
### File List
