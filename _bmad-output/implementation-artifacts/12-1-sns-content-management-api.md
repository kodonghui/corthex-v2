# Story 12.1: SNS 콘텐츠 관리 API (생성/승인/반려)

Status: done

## Story

As a CEO/관리자,
I want SNS 콘텐츠를 생성하고 승인/반려 워크플로우로 관리할 수 있기를,
so that AI가 작성한 콘텐츠를 검토하고 통제된 방식으로 SNS에 발행할 수 있다.

## Acceptance Criteria

1. **콘텐츠 CRUD**: 수동 생성(draft), 수정(draft/rejected만), 삭제(draft만), 목록 조회(필터: platform, status, accountId, variantOf)
2. **AI 콘텐츠 생성**: 에이전트에게 주제+플랫폼 지정 → AI가 제목/본문/해시태그 자동 생성 → draft 저장
3. **AI 이미지 생성**: DALL-E 3로 SNS 이미지 자동 생성 (텍스트+이미지 동시 또는 기존 콘텐츠에 추가)
4. **승인 워크플로우**: draft → pending(승인 요청) → approved/scheduled(CEO 승인) 또는 rejected(CEO 반려+사유)
5. **예약 발행**: scheduledAt이 미래인 콘텐츠가 승인되면 'scheduled' 상태, 시간 도래 시 자동 발행
6. **예약 취소**: scheduled → approved (관리자만)
7. **발행**: approved → published/failed (sns-publisher 호출)
8. **A/B 변형 테스트**: 원본 콘텐츠에서 변형 생성(수동/AI), 전략(tone/length/hashtag/headline/mixed), 성과 데이터 입력(views/likes/shares/clicks), winner 자동 계산
9. **SNS 계정 관리**: 플랫폼별 계정 등록/수정/삭제, credentials AES-256-GCM 암호화, 연결 콘텐츠 확인 후 삭제
10. **통계 API**: 전체 건수, 상태별/플랫폼별 분포, 일별 생성 추이
11. **활동 로그**: 모든 주요 액션(생성, 승인, 반려, 발행, 계정 관리)에 activity log 기록
12. **멀티 테넌트 격리**: 모든 쿼리에 companyId 조건 적용

## Tasks / Subtasks

- [x] Task 1: DB 스키마 (AC: #1, #9, #8)
  - [x] sns_accounts 테이블 (id, companyId, platform, accountName, accountId, credentials, isActive, createdBy, timestamps)
  - [x] sns_contents 테이블 (id, companyId, agentId, snsAccountId, createdBy, platform, title, body, hashtags, imageUrl, status, reviewedBy, reviewedAt, rejectReason, publishedUrl, publishedAt, publishError, scheduledAt, variantOf, metadata, timestamps)
  - [x] snsPlatformEnum: instagram, tistory, daum_cafe
  - [x] snsStatusEnum: draft, pending, approved, scheduled, rejected, published, failed
  - [x] Drizzle relations 정의 완료
- [x] Task 2: SNS 콘텐츠 CRUD API (AC: #1, #2, #3)
  - [x] GET /api/workspace/sns — 목록 (필터 지원)
  - [x] GET /api/workspace/sns/stats — 통계
  - [x] POST /api/workspace/sns — 수동 생성
  - [x] POST /api/workspace/sns/generate — AI 생성
  - [x] POST /api/workspace/sns/generate-with-image — AI 텍스트+이미지
  - [x] POST /api/workspace/sns/:id/generate-image — 이미지 추가
  - [x] GET /api/workspace/sns/:id — 상세 (변형 포함)
  - [x] PUT /api/workspace/sns/:id — 수정
  - [x] DELETE /api/workspace/sns/:id — 삭제
- [x] Task 3: 승인 워크플로우 API (AC: #4, #5, #6, #7)
  - [x] POST /api/workspace/sns/:id/submit — 승인 요청 (draft/rejected → pending)
  - [x] POST /api/workspace/sns/:id/approve — 승인 (pending → approved/scheduled, CEO만)
  - [x] POST /api/workspace/sns/:id/reject — 반려 (pending → rejected, CEO만, 사유 필수)
  - [x] POST /api/workspace/sns/:id/publish — 발행 (approved → published/failed)
  - [x] POST /api/workspace/sns/:id/cancel-schedule — 예약 취소 (scheduled → approved, CEO만)
- [x] Task 4: A/B 테스트 API (AC: #8)
  - [x] POST /api/workspace/sns/:id/create-variant — 수동 변형
  - [x] POST /api/workspace/sns/:id/generate-variants — AI 변형 자동 생성
  - [x] PUT /api/workspace/sns/:id/metrics — 성과 데이터 입력
  - [x] GET /api/workspace/sns/:id/ab-results — 결과 비교 + winner 계산
- [x] Task 5: SNS 계정 관리 API (AC: #9)
  - [x] GET /api/workspace/sns-accounts — 목록
  - [x] POST /api/workspace/sns-accounts — 등록 (credentials 암호화)
  - [x] PUT /api/workspace/sns-accounts/:id — 수정
  - [x] DELETE /api/workspace/sns-accounts/:id — 삭제 (연결 콘텐츠 확인)
- [x] Task 6: 예약 발행 스케줄러 (AC: #5)
  - [x] sns-schedule-checker.ts: 60초 폴링, scheduled+scheduledAt<=now 자동 발행
  - [x] 중복 방지: 낙관적 잠금 (status=scheduled 조건으로 UPDATE)
  - [x] 실패 시 status=failed + publishError 기록
- [x] Task 7: AI 이미지 생성 (AC: #3)
  - [x] sns-image-generator.ts: DALL-E 3 API (CredentialVault에서 OpenAI 키 로드)
  - [x] 부분 실패 허용: 이미지 실패해도 텍스트 콘텐츠는 저장

## Dev Notes

### 기존 구현 현황 (이미 완료)

이 스토리의 모든 기능은 이전 에픽에서 이미 구현되어 있습니다. 검증 및 테스트만 필요합니다.

### 구현된 파일 목록

| 파일 | 줄 수 | 설명 |
|------|-------|------|
| `packages/server/src/routes/workspace/sns.ts` | 974 | SNS 콘텐츠 CRUD + 승인 + A/B 테스트 |
| `packages/server/src/routes/workspace/sns-accounts.ts` | 178 | SNS 계정 관리 CRUD |
| `packages/server/src/db/schema.ts` | ~60줄 | snsAccounts, snsContents 테이블 + relations |
| `packages/server/src/lib/sns-publisher.ts` | 78 | 발행 stub (12-3에서 실제 구현) |
| `packages/server/src/lib/sns-image-generator.ts` | 72 | DALL-E 3 이미지 생성 (실제 동작) |
| `packages/server/src/lib/sns-schedule-checker.ts` | 134 | 예약 발행 스케줄러 (실제 동작) |

### 핵심 아키텍처 패턴

- **인증**: `authMiddleware` → `TenantContext` (companyId, userId, role)
- **권한**: `isCeoOrAbove(role)` — 승인/반려/예약취소는 CEO 이상만
- **검증**: Zod schema (createSnsSchema, updateSnsSchema, etc.)
- **응답 형식**: `{ data: T }` 또는 `{ data: T, imageGenerationError }` (부분 실패)
- **에러**: `HTTPError(statusCode, message, errorCode)` — SNS_001~SNS_007, SNS_ACCOUNT_001~002
- **로깅**: `logActivity()` — type: 'sns', actorType: 'user'|'agent'|'system'
- **암호화**: `encrypt()/decrypt()` — SNS 계정 credentials (AES-256-GCM)

### sns-publisher.ts는 Stub

`sns-publisher.ts`는 의도적 stub입니다. 실제 플랫폼별 발행(Instagram Graph API, Tistory/Daum Cafe Selenium)은 Story 12-3에서 구현 예정. 이 스토리(12-1)에서는 콘텐츠 관리 API + 워크플로우가 핵심 범위.

### 상태 전이 다이어그램

```
draft → pending (submit)
pending → approved (approve, scheduledAt 없음)
pending → scheduled (approve, scheduledAt 미래)
pending → rejected (reject + reason)
rejected → pending (submit 재요청)
rejected → draft (수정 시 자동)
approved → published (publish 성공)
approved → failed (publish 실패)
scheduled → published (스케줄러 자동)
scheduled → failed (스케줄러 실패)
scheduled → approved (cancel-schedule)
```

### A/B 테스트 점수 계산

```typescript
score = views + likes*2 + shares*3 + clicks*2
```

Winner = 가장 높은 score를 가진 콘텐츠 (metrics가 있는 것들 중)

### v1 대비 v2 개선점

| v1 | v2 |
|----|-----|
| SQLite KV 저장 | PostgreSQL + Drizzle ORM |
| 단일 테넌트 | 멀티 테넌트 (companyId 격리) |
| 없음 | A/B 변형 테스트 |
| 없음 | AI 이미지 생성 (DALL-E 3) |
| 환경변수 직접 참조 | CredentialVault 암호화 저장 |
| Telegram 즉시 알림 | Activity Log + WebSocket |
| CMO/Chief of Staff만 발행 | CEO 이상 승인 권한 |

### Project Structure Notes

- 라우트 마운트: `packages/server/src/index.ts`에서 `snsRoute`, `snsAccountsRoute` 등록 확인 필요
- 테스트 위치: `packages/server/src/__tests__/unit/` 디렉토리
- 기존 테스트 패턴: `*.test.ts`, bun:test 사용

### References

- [Source: packages/server/src/routes/workspace/sns.ts] — 전체 SNS 콘텐츠 API
- [Source: packages/server/src/routes/workspace/sns-accounts.ts] — SNS 계정 관리
- [Source: packages/server/src/db/schema.ts#snsAccounts,snsContents] — DB 스키마
- [Source: packages/server/src/lib/sns-publisher.ts] — 발행 스텁 (12-3 범위)
- [Source: packages/server/src/lib/sns-image-generator.ts] — DALL-E 3 이미지 생성
- [Source: packages/server/src/lib/sns-schedule-checker.ts] — 예약 발행 스케줄러
- [Source: /home/ubuntu/CORTHEX_HQ/src/tools/sns/sns_manager.py] — v1 SNS 비즈니스 로직
- [Source: /home/ubuntu/CORTHEX_HQ/web/handlers/sns_handler.py] — v1 SNS API 핸들러
- [Source: _bmad-output/planning-artifacts/epics.md#Epic12] — Epic 12 스펙
- [Source: _bmad-output/planning-artifacts/v1-feature-spec.md#8] — v1 SNS 통신국 스펙

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

- 2026-03-08: 기존 구현 검증 완료 — 모든 라우트, 스키마, 유틸리티 정상 동작

### Completion Notes List

- 전체 기능이 이전 에픽에서 이미 구현되어 있음을 확인
- 라우트 마운트 확인 완료 (index.ts에서 snsRoute, snsAccountsRoute 정상 등록)
- 예약 발행 스케줄러 (startSnsScheduleChecker) 서버 시작 시 자동 실행 확인
- sns-publisher.ts stub은 이 스토리 범위가 아님 (Story 12-3 범위)
- Story 12-1 전용 테스트 78개 신규 작성 (상태 전이, 권한, 검증, A/B, 통계 등)
- 기존 SNS 테스트 326개 + 신규 78개 = 총 404 단위 테스트, 0 실패

### Change Log

- 2026-03-08: dev-story 검증 완료 — 기존 구현 확인 + 78개 테스트 추가
- 2026-03-08: TEA 완료 — 46개 엣지케이스 테스트 추가 (총 450 테스트)
- 2026-03-08: QA 완료 — 12/12 AC 검증 통과
- 2026-03-08: code-review 완료 — 발행 실패 activity log 추가 (M1), 에러 코드 충돌 수정 (L1)

### File List

- `packages/server/src/routes/workspace/sns.ts` (기존, 974줄)
- `packages/server/src/routes/workspace/sns-accounts.ts` (기존, 178줄)
- `packages/server/src/db/schema.ts` (기존, snsAccounts/snsContents 정의)
- `packages/server/src/lib/sns-publisher.ts` (기존 stub, 78줄)
- `packages/server/src/lib/sns-image-generator.ts` (기존, 72줄)
- `packages/server/src/lib/sns-schedule-checker.ts` (기존, 134줄)
- `packages/server/src/__tests__/unit/sns-content-management.test.ts` (신규, 78 테스트)
