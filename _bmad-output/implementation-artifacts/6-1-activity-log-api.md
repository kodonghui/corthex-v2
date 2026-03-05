# Story 6.1: 알림 시스템 백엔드 — notifications 테이블 + API + 실시간 발송

Status: review

## Story

As a 사용자 (CEO/팀장),
I want 에이전트 활동(채팅 완료, 위임 완료, 도구 실패 등)에 대한 알림을 실시간으로 받고 목록으로 확인한다,
so that 중요한 이벤트를 놓치지 않고 빠르게 대응할 수 있다.

## Acceptance Criteria

1. **Given** notifications 테이블 **When** 마이그레이션 실행 **Then** id, userId, companyId, type, title, body, actionUrl, isRead, createdAt 컬럼 생성 + 인덱스
2. **Given** 채팅 응답 완료 이벤트 **When** AI 응답 스트리밍 done **Then** 해당 사용자에게 알림 자동 생성 + WS `notifications` 채널 브로드캐스트
3. **Given** 위임 완료 이벤트 **When** delegation-end **Then** 해당 사용자에게 알림 생성 + WS 브로드캐스트
4. **Given** 도구 호출 실패 **When** tool-end with error **Then** 해당 사용자에게 경고 알림 생성 + WS 브로드캐스트
5. **Given** GET /api/workspace/notifications **When** 인증된 사용자 요청 **Then** 본인 알림 목록 반환 (최신순, limit/offset 페이지네이션, filter=unread 지원)
6. **Given** GET /api/workspace/notifications/count **When** 인증된 사용자 요청 **Then** 미읽음 알림 건수 반환 `{ unread: number }`
7. **Given** PATCH /api/workspace/notifications/:id/read **When** 알림 ID로 요청 **Then** isRead=true로 업데이트
8. **Given** POST /api/workspace/notifications/read-all **When** 요청 **Then** 해당 사용자의 모든 미읽음 알림을 읽음 처리
9. **Given** 홈 페이지 **When** GET /api/workspace/notifications?limit=5 **Then** 최근 5건 반환 (홈 최근 알림 카드용)
10. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 — notifications 테이블 (AC: #1)
  - [x] `packages/server/src/db/schema.ts`에 `notifications` 테이블 추가
  - [x] 컬럼: id, userId, companyId, type, title, body, actionUrl, isRead, createdAt
  - [x] 인덱스: (companyId, userId, createdAt DESC), (userId, isRead)
  - [x] relations 추가 (user, company)

- [x] Task 2: 알림 생성 유틸리티 (AC: #2, #3, #4)
  - [x] `packages/server/src/lib/notifier.ts` 생성
  - [x] `createNotification(params)` — DB insert + WS 브로드캐스트
  - [x] fire-and-forget 패턴
  - [x] 헬퍼: notifyChatComplete, notifyDelegationComplete, notifyToolError

- [x] Task 3: 기존 이벤트에 알림 트리거 연결 (AC: #2, #3, #4)
  - [x] `chat.ts` — done 이벤트 시 notifyChatComplete 호출
  - [x] `orchestrator.ts` — delegation-end 시 notifyDelegationComplete 호출
  - [x] `chat.ts` — tool-end with error 시 notifyToolError 호출

- [x] Task 4: 알림 API 라우트 (AC: #5, #6, #7, #8, #9)
  - [x] `notifications.ts` 생성 — 4개 엔드포인트
  - [x] GET /notifications — 목록 (limit, offset, filter=unread)
  - [x] GET /notifications/count — 미읽음 건수
  - [x] PATCH /notifications/:id/read — 개별 읽음
  - [x] POST /notifications/read-all — 전체 읽음
  - [x] index.ts에 마운트

- [x] Task 5: 빌드 검증 (AC: #10)
  - [x] turbo build 3/3 성공
  - [x] 기존 단위 테스트 172 pass, 0 fail

## Dev Notes

### 기존 구현 분석

**이미 구현된 WS 인프라:**
- `packages/server/src/ws/channels.ts:49-57` — `notifications` 채널 구독 이미 구현됨
  - `client.subscriptions.add('notifications::${client.userId}')` 형태
  - 본인만 구독 가능 (userId 검증)
- `broadcastToChannel(channelKey, data)` 함수로 특정 채널 구독자에게 브로드캐스트
- `packages/server/src/index.ts:84-92` — EventBus 브릿지에 `notification` 이벤트 핸들러 이미 존재
  - `eventBus.on('notification', (data) => broadcastToCompany(data.userId, 'notifications', data.payload))`

**이미 존재하는 프론트엔드 코드:**
- `packages/app/src/stores/notification-store.ts` — Zustand 알림 스토어 (max 50건, addNotification/markAllRead/clearAll)
- `packages/app/src/pages/notifications.tsx` — 플레이스홀더 페이지 ("알림 기능은 준비 중입니다.")

**activity-logger.ts 패턴 참조:**
- `packages/server/src/lib/activity-logger.ts` — fire-and-forget + .returning() + broadcastToChannel
- 동일한 패턴으로 notifier.ts 구현
- try-catch로 메인 플로우 차단 방지

**notification_preferences 테이블 (schema.ts:110-121):**
- 이미 존재: inApp, email, push boolean 필드
- 6-1에서는 inApp만 사용 (email/push는 6-3에서)
- createNotification에서 notification_preferences.inApp 확인 후 생성 여부 결정

**chat.ts 이벤트 흐름:**
- `packages/server/src/routes/workspace/chat.ts` — done 이벤트에서 queryClient.invalidateQueries 호출
- 여기서 createNotification 추가 (chatSession의 userId로 발송)

**orchestrator.ts 위임 흐름:**
- `packages/server/src/lib/orchestrator.ts` — delegation-end onEvent 콜백
- ctx.userId로 알림 대상 결정

**UX 스펙 알림 유형 (ux-design-specification.md:1842-1852):**
| 이벤트 | 아이콘 | 액션 링크 |
|--------|--------|----------|
| 채팅 응답 완료 | 🔔 | `/chat?session={sessionId}` |
| 도구 호출 실패 | ⚠️ | `/ops-log` |
| 야간작업 완료 | ✅ | `/chat?session={sessionId}` |
| 야간작업 실패 | ❌ | `/ops-log` |
| 위임 완료 | 🤖 | `/chat?session={sessionId}` |

**홈 페이지 알림 카드 (ux-design-specification.md:733):**
- 최대 5건, 5분 폴링 (실시간 아님)
- `GET /notifications?limit=5` API 호출
- 0건이면 카드 숨김

### 알림 type enum 값

```
chat_complete    — 채팅 응답 완료
delegation_complete — 위임 완료
tool_error       — 도구 호출 실패
job_complete     — 야간작업 완료 (추후 Epic 11)
job_error        — 야간작업 실패 (추후 Epic 11)
system           — 시스템 알림
```

### DB 스키마 설계

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  type VARCHAR(30) NOT NULL,  -- chat_complete, delegation_complete, tool_error, ...
  title VARCHAR(200) NOT NULL,
  body TEXT,
  action_url VARCHAR(500),    -- 클릭 시 이동할 경로
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX notif_user_created_idx ON notifications(company_id, user_id, created_at DESC);
CREATE INDEX notif_user_unread_idx ON notifications(user_id, is_read);
```

### 프론트엔드 연동 (6-2에서 구현)

이 스토리는 백엔드만 구현. 프론트엔드 알림 UI는 6-2-realtime-notifications에서 구현:
- 사이드바 뱃지 (미읽음 카운트)
- Toast 알림
- 알림 목록 페이지

### Project Structure Notes

- `packages/server/src/db/schema.ts` — notifications 테이블 추가 (기존 activityLogs 바로 아래)
- `packages/server/src/lib/notifier.ts` — 새 파일 (activity-logger.ts와 같은 위치)
- `packages/server/src/routes/workspace/notifications.ts` — 새 파일 (activity-log.ts와 같은 패턴)
- `packages/server/src/routes/workspace/index.ts` — notificationsRoute 마운트 추가

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#1805-1874] — 알림 페이지 UX 스펙
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#1842-1852] — 알림 유형 매핑
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#733-739] — 홈 최근 알림 카드
- [Source: packages/server/src/ws/channels.ts:49-57] — notifications WS 채널 (이미 구현)
- [Source: packages/server/src/lib/activity-logger.ts] — fire-and-forget 패턴 참조
- [Source: packages/server/src/db/schema.ts:109-121] — notification_preferences 테이블
- [Source: packages/server/src/routes/workspace/activity-log.ts] — API 라우트 패턴 참조

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- notifications 테이블 + 2개 인덱스 + relations 추가
- notifier.ts: createNotification + 3개 헬퍼 (fire-and-forget + WS broadcast)
- chat.ts: done 시 chatComplete 알림, tool-end error 시 toolError 알림
- orchestrator.ts: delegation-end 시 delegationComplete 알림
- notifications.ts: 4개 REST 엔드포인트 (목록/카운트/읽음/전체읽음)
- 빌드 3/3 성공, 단위 테스트 172 pass 0 fail

### File List
- packages/server/src/db/schema.ts (modified — notifications 테이블 + relations)
- packages/server/src/lib/notifier.ts (new)
- packages/server/src/routes/workspace/notifications.ts (new)
- packages/server/src/routes/workspace/chat.ts (modified — 알림 트리거)
- packages/server/src/lib/orchestrator.ts (modified — 위임 완료 알림)
- packages/server/src/index.ts (modified — notificationsRoute 마운트)
