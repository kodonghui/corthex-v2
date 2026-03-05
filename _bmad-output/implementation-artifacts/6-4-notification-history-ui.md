# Story 6.4: 알림 설정 UI + 홈 알림 카드

Status: review

## Story

As a 사용자,
I want 알림 설정 탭에서 이벤트별로 앱/이메일 알림을 켜고 끄며, 홈에서 최근 알림을 바로 확인한다,
so that 원하는 알림만 받고 중요 이벤트를 한눈에 볼 수 있다.

## Acceptance Criteria

1. **Given** /notifications 알림 설정 탭 **When** 진입 **Then** 카테고리별 이벤트 목록 + 앱알림/이메일 Toggle 표시
2. **Given** Toggle 변경 **When** 클릭 **Then** 즉시 낙관적 업데이트 + PUT /notification-prefs API 호출
3. **Given** SMTP 미등록 회사 **When** 알림 설정 탭 **Then** "이메일 알림을 사용하려면 관리자에게 SMTP 설정을 요청하세요" 배너 + 이메일 토글 disabled
4. **Given** 탭 하단 **When** 표시 **Then** "알림은 30일간 보관됩니다" 안내 문구
5. **Given** 홈 페이지 **When** 로드 **Then** "최근 알림" 카드에 최대 5건 표시 (5분 폴링), 0건이면 카드 숨김
6. **Given** 홈 알림 카드 **When** [모두 보기] 클릭 **Then** /notifications로 이동
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 알림 설정 탭 구현 (AC: #1, #2, #3, #4)
  - [x] notification-settings.tsx 컴포넌트 생성
  - [x] GET /notification-prefs → 카테고리별 이벤트 목록 렌더링
  - [x] Toggle 컴포넌트 (@corthex/ui) 사용
  - [x] PUT /notification-prefs — 변경 즉시 저장
  - [x] SMTP 미등록 시 배너 + 이메일 토글 disabled
  - [x] 하단 30일 보관 안내

- [x] Task 2: 알림 설정 API (AC: #2)
  - [x] GET /api/workspace/notification-prefs — 사용자 알림 설정 조회 (없으면 기본값 반환)
  - [x] PUT /api/workspace/notification-prefs — 설정 업데이트 (upsert)

- [x] Task 3: 홈 최근 알림 카드 (AC: #5, #6)
  - [x] home.tsx에 "최근 알림" Card 추가
  - [x] useQuery GET /notifications?limit=5 (refetchInterval 5분)
  - [x] 0건이면 카드 숨김
  - [x] [모두 보기 →] 링크 → /notifications

- [x] Task 4: 빌드 검증 (AC: #7) — 3/3 성공

## Dev Notes

### 기존 코드
- `packages/app/src/pages/notifications.tsx` — 6-2에서 탭 구조 생성됨
- `packages/app/src/pages/home.tsx` — 홈 페이지 (에이전트 그리드 + 최근 대화 카드 있음)
- `@corthex/ui Toggle` — 5-3에서 구현됨

### 알림 설정 카테고리 (UX 스펙)
| 카테고리 | 이벤트 | P1 |
|----------|--------|----|
| 채팅 | 에이전트 응답 완료 | 앱 |
| | 도구 호출 실패 | 앱 |
| | 위임 완료 | 앱 |
| 작업 | 야간작업 완료/실패 | 앱 |
| 시스템 | 에이전트 상태 변경 | 앱 |
| | 서버 재시작 | 앱 |

### notification_preferences 확장 필요
현재 inApp/email/push 3개 boolean만 있는데, 이벤트별 세밀한 설정이 필요.
→ `notification_preferences`에 `settings` jsonb 컬럼 추가하거나, 기존 boolean은 전체 on/off + 이벤트별 jsonb로 관리

### References
- [Source: ux-design-specification.md#1854-1870] — 알림 설정 탭 스펙
- [Source: ux-design-specification.md#733-739] — 홈 최근 알림 카드
- [Source: packages/server/src/db/schema.ts:110-121] — notification_preferences

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- notification_preferences에 settings jsonb 컬럼 추가 (이벤트별 세부 설정)
- 전체 on/off (inApp/email) + 이벤트별 Toggle UI 구현
- SMTP 미등록 시 이메일 토글 disabled + 안내 배너
- 홈 최근 알림: 5건 표시, 5분 폴링, 0건이면 숨김

### File List
- packages/app/src/components/notification-settings.tsx (NEW)
- packages/app/src/pages/notifications.tsx (MODIFIED)
- packages/app/src/pages/home.tsx (MODIFIED)
- packages/server/src/db/schema.ts (MODIFIED — settings jsonb)
- packages/server/src/routes/workspace/notifications.ts (MODIFIED — prefs API)
