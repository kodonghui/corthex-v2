# Story 11.6: 고급 작업 체인 — 순차 실행 + 의존성 체이닝

Status: review

## Story

As a 일반 직원(유저),
I want 여러 야간작업을 순차적으로 연결하여 앞 작업 결과를 다음 작업에 전달할 수 있다,
so that 복잡한 자동화 파이프라인을 구성할 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 등록 **When** dependsOn 파라미터 지정 **Then** 선행 작업 완료 후 자동 실행
2. **Given** 체인 작업 **When** 선행 작업 completed **Then** 후행 작업의 instruction에 선행 result 자동 주입
3. **Given** 체인 작업 **When** 선행 작업 failed **Then** 후행 작업도 자동 실패 (cascade)
4. **Given** 작업 등록 UI **When** "체인 추가" 클릭 **Then** 이전 대기 작업 선택 + 추가 지시 입력 폼
5. **Given** 작업 목록 **When** 체인 작업 표시 **Then** 의존 관계 시각적 표시 (들여쓰기 + 화살표)
6. **Given** 체인 작업 **When** 선행 삭제 **Then** 후행도 함께 삭제 (cascade)
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB + API — nightJobs에 dependsOn 지원 (AC: #1, #6)
  - [x] nightJobs 테이블에 이미 없으면 dependsOnJobId 개념 활용 (resultData에 저장)
  - [x] POST /api/workspace/jobs에 dependsOn 옵션 추가
  - [x] DELETE cascade: 선행 삭제 시 후행 queued 작업도 삭제

- [x] Task 2: job-queue.ts — 체인 실행 로직 (AC: #2, #3)
  - [x] processJob 완료 시 dependsOn 후행 작업 찾아 scheduledFor를 now로 갱신 (실행 허용)
  - [x] 선행 result를 후행 instruction 앞에 자동 주입
  - [x] 선행 실패 시 후행 작업도 cascade failed 처리

- [x] Task 3: 프론트엔드 — 체인 등록 UI (AC: #4, #5)
  - [x] "체인 추가" 버튼: 이전 queued 작업 Select + 추가 지시 Textarea
  - [x] 목록에서 체인 작업은 들여쓰기 + "↳" 표시

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 설계 결정: DB 스키마 수정 vs resultData 활용

nightJobs 테이블에 `depends_on_job_id` 컬럼 추가 대신, 기존 `resultData` JSONB에 `{ dependsOnJobId, chainOrder }` 저장.
이유: DB 마이그레이션 없이 구현 가능, JSONB가 이미 확장용으로 존재.

### 체인 실행 로직

```
1. 유저가 작업 A 등록 (scheduledFor: now)
2. 유저가 작업 B 등록 (dependsOn: A, scheduledFor: far future → 대기)
3. 작업 A 완료 → B의 scheduledFor를 now로 갱신 + instruction에 A result 주입
4. 워커가 B를 픽업하여 실행
```

### result 주입 형식

```
[선행 작업 결과]
{previousResult}

[추가 지시]
{originalInstruction}
```

### 기존 코드 참조

- **작업 큐**: `packages/server/src/lib/job-queue.ts`
- **작업 API**: `packages/server/src/routes/workspace/jobs.ts`
- **작업 UI**: `packages/app/src/pages/jobs.tsx` — JobsTab

### 파일 구조

```
수정 파일:
  packages/server/src/routes/workspace/jobs.ts (dependsOn 파라미터 + cascade delete)
  packages/server/src/lib/job-queue.ts (체인 실행 + cascade fail)
  packages/app/src/pages/jobs.tsx (체인 등록 UI + 시각 표시)
```

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- dependsOnJobId를 resultData JSONB에 저장 (DB 마이그레이션 불필요)
- 체인 실행: 선행 완료 → 후행 scheduledFor=now + result 주입
- Cascade fail: 선행 실패 → 후행 자동 failed
- Cascade delete: 선행 삭제 → 후행 queued 작업 삭제
- 프론트: 체인 등록 폼(Select+Textarea) + 들여쓰기+↳ 시각 표시
- turbo build 3/3 성공

### File List

- packages/server/src/routes/workspace/jobs.ts (수정 — dependsOn + cascade delete)
- packages/server/src/lib/job-queue.ts (수정 — 체인 실행 + cascade fail)
- packages/app/src/pages/jobs.tsx (수정 — 체인 등록 UI + 시각 표시)
