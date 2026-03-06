# Story 14.1: SNS 콘텐츠 예약 발행

Status: done

## Story

As a 사용자,
I want SNS 콘텐츠에 예약 발행 시간을 설정할 수 있다,
so that 원하는 시간에 자동으로 콘텐츠가 발행되어 최적의 타이밍에 마케팅할 수 있다.

## Acceptance Criteria

1. **Given** 인증된 사용자 **When** POST /api/workspace/sns에 scheduledAt(ISO 8601) 포함 **Then** 콘텐츠가 예약 시간과 함께 생성됨 (status: draft)
2. **Given** 인증된 사용자 **When** PUT /api/workspace/sns/:id에 scheduledAt 포함 **Then** 예약 시간 수정됨 (draft/rejected 상태만)
3. **Given** 승인된 콘텐츠(approved) **When** scheduledAt이 현재 시간 이후 **Then** 상태가 'scheduled'로 변경되고 발행 대기
4. **Given** scheduled 상태 콘텐츠 **When** 현재 시간이 scheduledAt 도달 **Then** 자동으로 publishContent() 호출하여 발행 (published/failed)
5. **Given** scheduled 상태 콘텐츠 **When** POST /api/workspace/sns/:id/cancel-schedule **Then** 상태가 approved로 복귀, scheduledAt 제거
6. **Given** SNS 목록 **When** 필터로 'scheduled' 탭 선택 **Then** 예약된 콘텐츠만 표시 (scheduledAt 오름차순)
7. **Given** 콘텐츠 승인 **When** scheduledAt이 설정되어 있음 **Then** 즉시 발행하지 않고 scheduled 상태로 전환
8. **Given** 콘텐츠 승인 **When** scheduledAt이 없음 **Then** 기존 동작 유지 (즉시 발행 가능)
9. **Given** 예약 발행 성공/실패 **When** 결과 반환 **Then** 활동 로그 기록 + 알림 발행
10. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 변경 — scheduledAt 컬럼 + scheduled 상태 추가 (AC: #1, #3)
  - [x] `snsStatusEnum`에 'scheduled' 추가: `['draft', 'pending', 'approved', 'scheduled', 'rejected', 'published', 'failed']`
  - [x] `snsContents` 테이블에 `scheduledAt: timestamp('scheduled_at')` nullable 컬럼 추가
  - [x] SQL 마이그레이션 파일 생성: `packages/server/src/db/migrations/0021_sns-scheduled-publish.sql`
    - `ALTER TYPE sns_status ADD VALUE 'scheduled';`
    - `ALTER TABLE sns_contents ADD COLUMN scheduled_at TIMESTAMP;`

- [x] Task 2: 서버 API 변경 — 예약 설정/수정/취소 (AC: #1, #2, #5, #7, #8)
  - [x] `createSnsSchema`에 `scheduledAt: z.string().datetime().optional()` 추가
  - [x] `updateSnsSchema`에 `scheduledAt: z.string().datetime().nullable().optional()` 추가
  - [x] POST /sns 생성 시 scheduledAt 저장 + 과거 시간 검증
  - [x] PUT /sns/:id 수정 시 scheduledAt 변경 가능 (draft/rejected 상태) + 과거 시간 검증
  - [x] POST /sns/:id/approve 승인 시:
    - scheduledAt 있으면 → status를 'scheduled'로 설정
    - scheduledAt 없으면 → 기존 'approved'로 유지
  - [x] POST /sns/:id/cancel-schedule 새 엔드포인트:
    - scheduled 상태에서만 → status를 'approved'로 변경, scheduledAt을 null로
  - [x] GET /sns 목록에 scheduledAt 필드 포함
  - [x] GET /sns/:id 상세에 scheduledAt 필드 포함

- [x] Task 3: 예약 발행 워커 — schedule-worker 연동 (AC: #4, #9)
  - [x] `packages/server/src/lib/sns-schedule-checker.ts` 생성
    - `checkScheduledSns()`: scheduled 상태 + scheduledAt <= now인 콘텐츠 조회
    - 각 콘텐츠에 대해 publishContent() 호출
    - 성공: status → published, publishedUrl/publishedAt 업데이트
    - 실패: status → failed, publishError 기록
    - 활동 로그 기록 (actorType: 'system', action: 'SNS 예약 발행')
  - [x] index.ts에 startSnsScheduleChecker/stopSnsScheduleChecker 등록 (별도 타이머, 60초 간격)

- [x] Task 4: 프론트엔드 — 예약 설정 UI + 목록 필터 (AC: #1, #2, #5, #6)
  - [x] 생성 폼에 scheduledAt 날짜+시간 입력 추가 (input type="datetime-local")
  - [x] 상세 뷰에 예약 시간 표시 (scheduled 상태일 때)
  - [x] 상세 뷰에 '예약 취소' 버튼 추가 (scheduled 상태일 때)
  - [x] STATUS_LABELS에 scheduled: '예약됨' 추가
  - [x] STATUS_COLORS에 scheduled 색상 추가 (bg-blue-100 text-blue-800)

- [x] Task 5: 빌드 검증 (AC: #10)
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Notes

### 기존 인프라 활용

1. **snsContents 테이블** (schema.ts:360-380)
   - 이미 status, publishedUrl, publishedAt, publishError 필드 존재
   - metadata jsonb 필드 활용 가능
   - snsStatusEnum: `['draft', 'pending', 'approved', 'rejected', 'published', 'failed']`

2. **sns-publisher.ts** (lib/sns-publisher.ts)
   - `publishContent()` 함수 이미 존재 (스텁)
   - 플랫폼별 분기 (instagram, tistory, daum_cafe)

3. **schedule-worker.ts** (lib/schedule-worker.ts)
   - 기존 야간작업 스케줄러 존재
   - 별도 sns-schedule-checker.ts로 분리하여 독립적 타이머 운영

4. **SNS API** (routes/workspace/sns.ts)
   - 전체 CRUD + 승인/반려/발행 워크플로 이미 구현
   - 활동 로그 기록 패턴 확립

5. **SNS 프론트엔드** (pages/sns.tsx)
   - SnsContent 타입, STATUS_LABELS/COLORS, PLATFORM_LABELS 정의
   - 목록/생성/상세 3뷰 구조
   - useMutation/useQuery 패턴 확립

### 주의사항

- **enum 마이그레이션**: PostgreSQL에서 enum에 값 추가 시 `ALTER TYPE ... ADD VALUE` 사용 (트랜잭션 내 불가 — 별도 스테이트먼트)
- **시간대**: scheduledAt은 UTC로 저장, 프론트에서 로컬 시간 변환
- **과거 시간 검증**: scheduledAt이 현재보다 과거이면 서버에서 400 에러
- **동시성**: 워커가 같은 콘텐츠 중복 발행하지 않도록 status 체크 (scheduled → published/failed)

### Project Structure Notes

- 서버: `packages/server/src/routes/workspace/sns.ts` (기존 수정)
- 서버: `packages/server/src/lib/sns-schedule-checker.ts` (신규)
- 서버: `packages/server/src/db/schema.ts` (기존 수정 — enum + 컬럼)
- 서버: `packages/server/src/db/migrations/0021_sns-scheduled-publish.sql` (신규)
- 서버: `packages/server/src/index.ts` (기존 수정 — checker 등록)
- 프론트: `packages/app/src/pages/sns.tsx` (기존 수정)
- 파일명 kebab-case 소문자 규칙 준수

### References

- [Source: packages/server/src/routes/workspace/sns.ts] — 기존 SNS API 전체
- [Source: packages/server/src/db/schema.ts#snsContents] — SNS 테이블 스키마
- [Source: packages/server/src/lib/sns-publisher.ts] — 발행 스텁
- [Source: packages/server/src/lib/schedule-worker.ts] — 기존 스케줄 워커
- [Source: packages/app/src/pages/sns.tsx] — 기존 SNS 프론트엔드
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.7] — SNS UX 사양

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: snsStatusEnum에 'scheduled' 추가, snsContents에 scheduledAt 컬럼 추가, 0021 마이그레이션 생성
- Task 2: createSnsSchema/updateSnsSchema에 scheduledAt 추가, approve에 scheduled 상태 분기, cancel-schedule 엔드포인트 추가, 목록/상세에 scheduledAt 포함, 과거 시간 검증
- Task 3: sns-schedule-checker.ts 신규 생성 (60초 폴링, checkScheduledSns), index.ts에 시작/종료 등록
- Task 4: SnsContent 타입에 scheduledAt 추가, STATUS_LABELS/COLORS에 scheduled 추가, 생성 폼에 datetime-local 입력, 상세에 예약 시간 표시/취소 버튼
- Task 5: turbo build 3/3 성공

### File List

- packages/server/src/db/schema.ts (modified)
- packages/server/src/db/migrations/0021_sns-scheduled-publish.sql (new)
- packages/server/src/routes/workspace/sns.ts (modified)
- packages/server/src/lib/sns-schedule-checker.ts (new)
- packages/server/src/index.ts (modified)
- packages/app/src/pages/sns.tsx (modified)
