# Story 11.6: 야간작업 체인 — 순차 실행 + 결과 전달 + 체인 시각화

Status: done

## Story

As a 사용자,
I want 여러 야간작업을 순차적으로 연결하여 앞 작업의 결과를 다음 작업에 자동 전달하고, 체인 진행 상황을 한눈에 확인한다,
so that 복합적인 분석 업무(예: 데이터 수집 → 분석 → 보고서)를 자동화할 수 있다.

## Acceptance Criteria

1. **Given** 작업 등록 모달 **When** "체인 추가" 버튼 클릭 **Then** 동일 체인에 2번째 이후 작업을 추가할 수 있다 (최대 5단계)
2. **Given** 체인 작업 등록 **When** 저장 **Then** DB에 chainId로 그룹화 + parentJobId로 순서 연결 + 2번째 이후 작업은 status='blocked' 저장
3. **Given** 체인 1번째 작업 완료 **When** processJob 완료 시점 **Then** 다음 작업의 instruction 앞에 이전 결과 요약(500자)을 자동 주입하고 status를 'queued'로 변경
4. **Given** 체인 중간 작업 실패 **When** 최대 재시도 초과 **Then** 이후 모든 작업을 'failed'로 마킹 + chain-failed WebSocket 이벤트 발행
5. **Given** 체인 작업 카드 **When** /jobs 페이지 **Then** 체인 그룹을 들여쓰기 + 연결선으로 시각화하고, 체인 헤더에 전체 진행률 표시
6. **Given** 체인 대기 중 작업 **When** 사용자가 체인 취소 **Then** 체인 내 모든 queued/blocked 작업 일괄 취소
7. **Given** jobStatusEnum **When** 마이그레이션 실행 **Then** 'blocked' 상태 추가 (기존 4개 + 1개)
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: DB 스키마 확장 — nightJobs 테이블 체인 필드 추가 (AC: #2, #7)
  - [x] jobStatusEnum에 'blocked' 상태 추가
  - [x] nightJobs에 `parentJobId` (uuid, self-reference, nullable) 추가
  - [x] nightJobs에 `chainId` (uuid, nullable) 추가
  - [x] `drizzle-kit generate` 마이그레이션 생성 (0016_unusual_northstar.sql)

- [x] Task 2: job-queue.ts — 체인 실행 로직 (AC: #3, #4)
  - [x] activateNextChainJob: 완료 시 자식 작업 활성화 + 이전 결과 주입
  - [x] failRemainingChainJobs: 최종 실패 시 blocked 작업 전체 실패 + chain-failed 이벤트
  - [x] pickNextJob: 기존 FIFO 유지 (blocked는 자연 필터링)

- [x] Task 3: 체인 작업 등록 API (AC: #1, #2)
  - [x] POST /workspace/jobs/chain — 체인 일괄 등록 (2~5단계)
  - [x] chainId = uuid, 1번째='queued', 이후='blocked'+parentJobId

- [x] Task 4: 체인 취소 API (AC: #6)
  - [x] DELETE /workspace/jobs/chain/:chainId — queued/blocked 일괄 삭제

- [x] Task 5: GET /jobs 응답에 체인 필드 추가 (AC: #5)
  - [x] parentJobId, chainId 포함

- [x] Task 6: 프론트엔드 — 체인 등록 UI (AC: #1)
  - [x] "체인 단계 추가" 버튼 + 단계별 에이전트/지시 입력
  - [x] 최대 4개 후속 단계 (총 5단계)
  - [x] createChain 뮤테이션 호출

- [x] Task 7: 프론트엔드 — 체인 카드 시각화 (AC: #5, #6)
  - [x] chainId 그룹핑 + 체인 헤더 (완료 현황)
  - [x] 자식 작업 ml-6 + border-l-2 들여쓰기
  - [x] blocked Badge + 체인 취소 ConfirmDialog

- [x] Task 8: 빌드 검증 (AC: #8)
  - [x] `npx turbo build --force` → 3/3 성공

## Dev Agent Record

### Completion Notes

- DB: jobStatusEnum에 'blocked' 추가, nightJobs에 parentJobId/chainId 컬럼 추가
- 백엔드: activateNextChainJob (결과 500자 주입) + failRemainingChainJobs (체인 실패 전파) 구현
- API: POST /chain (일괄 등록) + DELETE /chain/:chainId (일괄 취소) 추가
- 프론트엔드: 체인 등록 모달 (단계 추가/삭제) + 체인 그룹 시각화 (들여쓰기 + 연결선)

### File List

**Modified Files:**
- `packages/server/src/db/schema.ts` — jobStatusEnum + nightJobs 체인 필드
- `packages/server/src/lib/job-queue.ts` — activateNextChainJob + failRemainingChainJobs
- `packages/server/src/routes/workspace/jobs.ts` — POST /chain + DELETE /chain/:chainId + GET 응답 확장
- `packages/app/src/pages/jobs.tsx` — 체인 등록 UI + 체인 카드 시각화 + NightJob 타입 확장

**New Files:**
- `packages/server/src/db/migrations/0016_unusual_northstar.sql` — 마이그레이션

## Dev Notes

### 기존 인프라 활용

1. **nightJobs 테이블** — schema.ts:302-322
   - 기존 필드: id, companyId, userId, agentId, sessionId, instruction, status, result, resultData, error, retryCount, maxRetries, scheduledFor, startedAt, completedAt, isRead
   - jobStatusEnum: 'queued' | 'processing' | 'completed' | 'failed' → 'blocked' 추가 필요

2. **job-queue.ts** — processJob (line 82-253)
   - 완료 시 resultData에 { sessionId, reportId } 저장
   - emitProgress 헬퍼로 단계별 WS 이벤트 발행
   - 실패 시 재시도 로직 + job-retrying/job-failed 이벤트

3. **jobs.ts API** — POST / GET / DELETE 엔드포인트 존재
   - POST /jobs에 agentId, instruction, scheduledFor 파라미터
   - GET /jobs: 최근 50개 내림차순 조회

4. **jobs.tsx 프론트엔드** — JobCard 컴포넌트 673-775
   - jobStatusConfig 매핑
   - WS 실시간 갱신 (wsHandler)
   - ProgressBar + progress 상태

### 체인 실행 설계

```
Chain: [작업A] → [작업B] → [작업C]

1. 등록 시:
   chainId = "abc-123" (3개 공유)
   작업A: status='queued', parentJobId=null
   작업B: status='blocked', parentJobId=A.id
   작업C: status='blocked', parentJobId=B.id

2. 작업A 완료:
   → 작업B.instruction = "[이전 결과]\n{A결과 500자}\n\n[현재 지시]\n{B원래지시}"
   → 작업B.status = 'queued'
   → job-chain-progress 이벤트 발행

3. 작업A 실패 (최대 재시도 초과):
   → 작업B, 작업C status = 'failed', error = '이전 작업 실패로 취소됨'
   → chain-failed 이벤트 발행
```

### DB 마이그레이션 패턴

```typescript
// schema.ts 수정
export const jobStatusEnum = pgEnum('job_status', ['queued', 'processing', 'completed', 'failed', 'blocked'])

// nightJobs 테이블에 추가
parentJobId: uuid('parent_job_id'),  // self-reference (체인 순서)
chainId: uuid('chain_id'),          // 같은 체인 그룹 식별자
```

주의: pgEnum 변경은 ALTER TYPE ... ADD VALUE 필요. drizzle-kit push가 자동 처리.

### 체인 카드 UI 구조

```
┌──────────────────────────────────────────┐
│ 🔗 체인 (2/3 완료)           [체인 취소] │
│ ┌────────────────────────────────────┐   │
│ │ ✅ 완료 | 데이터 수집              │   │
│ └────────────────────────────────────┘   │
│   │                                      │
│   ├─┌────────────────────────────────┐   │
│   │ │ ✅ 완료 | 분석 실행            │   │
│   │ └────────────────────────────────┘   │
│   │                                      │
│   └─┌────────────────────────────────┐   │
│     │ 🟡 처리중 | 보고서 작성        │   │
│     └────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 이전 스토리 교훈 (11-1 ~ 11-5)

- Badge variant: 'default' | 'info' | 'error' | 'success' | 'warning'
- ConfirmDialog: `isOpen` prop (not `open`)
- eventBus 패턴: `eventBus.emit('night-job', { companyId, payload })`
- WS 구독: `subscribe('night-job', {})` + `addListener('night-job::${companyId}', handler)`
- 보고서 생성 실패 격리: try-catch로 작업 완료에 영향 없게
- instruction 개행 치환: `.replace(/\n/g, ' ')`
- DB enum 변경: drizzle-kit push로 ALTER TYPE 자동 처리
- processJob 내부 emitProgress 헬퍼 패턴 활용

### Project Structure Notes

- `packages/server/src/db/schema.ts` — nightJobs 테이블 체인 필드 + jobStatusEnum 확장
- `packages/server/src/lib/job-queue.ts` — 체인 실행 로직 (완료→자식 활성화, 실패→체인 취소)
- `packages/server/src/routes/workspace/jobs.ts` — POST /chain, DELETE /chain/:chainId, GET 응답 확장
- `packages/app/src/pages/jobs.tsx` — 체인 등록 UI + 체인 카드 시각화

### References

- [Source: packages/server/src/db/schema.ts:302-354] — nightJobs, nightJobSchedules, nightJobTriggers 테이블
- [Source: packages/server/src/lib/job-queue.ts:17-44] — queueNightJob 함수
- [Source: packages/server/src/lib/job-queue.ts:82-253] — processJob 전체 플로우
- [Source: packages/server/src/routes/workspace/jobs.ts:28-179] — 작업 API 엔드포인트
- [Source: packages/app/src/pages/jobs.tsx:17-33] — NightJob 타입
- [Source: packages/app/src/pages/jobs.tsx:673-775] — JobCard 컴포넌트
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1020-1131] — 야간작업 UX 스펙
