# Story 11.4: 야간작업 완료 시 자동 보고서 생성 — resultData + 보고서 연결 UI + WebSocket 알림

Status: done

## Story

As a 사용자,
I want 야간작업이 완료되면 에이전트가 자동으로 보고서를 생성하고, 작업 카드에서 바로 보고서로 이동할 수 있다,
so that 야간에 수행된 업무 결과를 아침에 보고서 형태로 바로 확인할 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 완료 **When** processJob 성공 **Then** create_report 도구로 자동 보고서 생성 + resultData에 { reportId, sessionId } 저장
2. **Given** 자동 보고서 생성 실패 **When** create_report 오류 (DB 오류 등) **Then** 작업은 여전히 completed 상태 + resultData에 { sessionId } 만 저장 (보고서 실패가 작업 실패로 이어지지 않음)
3. **Given** GET /api/workspace/jobs **When** 조회 **Then** resultData 필드 포함 (sessionId, reportId 등)
4. **Given** 완료된 작업 카드 **When** resultData.reportId 존재 **Then** [보고서 보기] 버튼 표시 → /reports/{reportId} 이동
5. **Given** 완료된 작업 카드 **When** resultData.sessionId 존재 **Then** [결과 보기] 버튼 표시 → /chat?session={sessionId} 이동
6. **Given** 작업 완료/실패 **When** WebSocket 연결 중 **Then** job-completed/job-failed 이벤트 수신 → 해당 작업 카드 즉시 갱신
7. **Given** 알림 API (/notifications) **When** 완료된 작업 조회 **Then** resultData 포함 (보고서 링크 제공)
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: job-queue.ts — 자동 보고서 생성 로직 추가 (AC: #1, #2)
  - [x] processJob 완료 시점에 보고서 자동 생성 로직 추가
  - [x] reports 테이블에 INSERT: title=`[야간] {instruction 앞 50자}`, content=result, status='draft', authorId=userId(사용자 대리)
  - [x] 성공 시 resultData = { reportId, sessionId }
  - [x] 실패 시 resultData = { sessionId } (보고서 생성 실패는 작업 완료에 영향 없음)
  - [x] try-catch로 보고서 생성 실패 격리 — 에러 로깅만

- [x] Task 2: jobs.ts GET API — resultData 필드 추가 (AC: #3, #7)
  - [x] GET / 쿼리에 `resultData: nightJobs.resultData` 추가
  - [x] GET /notifications 쿼리에 `resultData: nightJobs.resultData` 추가

- [x] Task 3: WebSocket 이벤트 브로드캐스트 (AC: #6)
  - [x] job-queue.ts processJob 완료 시: `eventBus.emit('night-job', { companyId, payload: { type: 'job-completed', jobId, resultData } })`
  - [x] job-queue.ts processJob 실패 시: `eventBus.emit('night-job', { companyId, payload: { type: 'job-failed', jobId, error } })`
  - [x] index.ts에 EventBus → WS 브리지 추가: `eventBus.on('night-job', ...)`
  - [x] WsChannel 타입에 'night-job' 추가 (shared/types.ts)
  - [x] channels.ts에 night-job 구독 핸들러 추가 (companyId 기반 권한 검증)

- [x] Task 4: 프론트엔드 — 작업 카드에 보고서/결과 버튼 추가 (AC: #4, #5)
  - [x] NightJob 타입에 resultData 필드 추가: `resultData: { reportId?: string; sessionId?: string } | null`
  - [x] 완료된 작업 카드에 [결과 보기] 버튼: resultData.sessionId → `/chat?session={sessionId}`
  - [x] 완료된 작업 카드에 [보고서 보기] 버튼: resultData.reportId → `/reports/{reportId}`
  - [x] 버튼은 `Link` 컴포넌트 사용 (react-router-dom)

- [x] Task 5: 프론트엔드 — WebSocket 실시간 갱신 (AC: #6)
  - [x] jobs.tsx에서 WebSocket 'night-job' 채널 구독
  - [x] job-completed 수신: invalidateQueries로 즉시 갱신
  - [x] job-failed 수신: invalidateQueries로 즉시 갱신
  - [x] react-query invalidateQueries 사용 (useWsStore + useAuthStore)

- [x] Task 6: 빌드 검증 (AC: #8)
  - [x] `npx turbo build --force` → 3/3 성공 확인

## Dev Notes

### 기존 인프라 활용

1. **nightJobs.resultData** — jsonb 컬럼 이미 존재 (schema.ts:313)
   - 현재 미사용 → 이 스토리에서 활용 시작
   - 구조: `{ reportId?: string, sessionId?: string }`

2. **nightJobs.result** — text 컬럼 (schema.ts:312)
   - AI 응답 전체 텍스트 저장 (기존)
   - 유지: result는 텍스트, resultData는 구조화 메타데이터

3. **reports 테이블** — 이미 존재 (schema.ts:249-261)
   - 필드: id, companyId, authorId, title, content, status, submittedTo, submittedAt, createdAt, updatedAt
   - status enum: 'draft' | 'submitted' | 'reviewed'
   - authorId는 users.id FK → 야간작업은 userId(사용자 대리)로 설정

4. **create_report 도구** — 이미 존재 (tool-handlers/builtins/create-report.ts)
   - 참고만: 이 도구는 AI 도구 호출용. 직접 DB INSERT가 더 적합 (도구 호출은 AI 컨텍스트 필요)

5. **EventBus** — 이미 존재 (lib/event-bus.ts)
   - index.ts에 activity, agent-status, notification 브리지 이미 구현
   - 패턴: `eventBus.emit('night-job', { companyId, payload })` → `broadcastToCompany(companyId, 'night-job', payload)`

6. **WebSocket 채널 구독** — 프론트엔드 패턴
   - notification-listener.tsx 참조: useEffect로 WS 메시지 구독
   - 또는 useWebSocket 훅이 있으면 사용

### 보고서 자동 생성 로직 (job-queue.ts)

```typescript
// processJob 완료 시점 (status='completed' UPDATE 직전)
let reportId: string | null = null
try {
  const [report] = await db.insert(reports).values({
    companyId: job.companyId,
    authorId: job.userId,  // 사용자 대리로 생성
    title: `[야간] ${job.instruction.slice(0, 50)}`,
    content: result,
    status: 'draft',
  }).returning()
  reportId = report.id
} catch (e) {
  console.error(`⚠️ 야간 작업 보고서 생성 실패: ${job.id}`, e)
}

// resultData에 세션+보고서 ID 저장
await db.update(nightJobs).set({
  status: 'completed',
  result,
  resultData: { sessionId, reportId },
  completedAt: new Date(),
  sessionId,
}).where(eq(nightJobs.id, job.id))
```

### WebSocket 이벤트 구조

```typescript
// job-completed
{ type: 'job-completed', jobId: string, resultData: { sessionId, reportId } }

// job-failed
{ type: 'job-failed', jobId: string, error: string }
```

### 프론트엔드 버튼 위치

완료 카드 결과 영역 하단에 버튼 그룹:
```tsx
{job.status === 'completed' && job.resultData && (
  <div className="flex gap-2 mt-2">
    {job.resultData.sessionId && (
      <Link to={`/chat?session=${job.resultData.sessionId}`}>
        <Button variant="outline" size="sm">결과 보기</Button>
      </Link>
    )}
    {job.resultData.reportId && (
      <Link to={`/reports/${job.resultData.reportId}`}>
        <Button variant="outline" size="sm">보고서 보기</Button>
      </Link>
    )}
  </div>
)}
```

### 이전 스토리 교훈 (11-1 ~ 11-3)

- UTC 기반 시간 처리: 모든 시간 계산은 UTC 기준
- Badge variant: 'default' | 'info' | 'error' | 'success' | 'warning' (11-2 코드 리뷰에서 수정)
- ConfirmDialog: `isOpen` prop 사용 (not `open`)
- StatusDot: status='online'/'offline' 사용
- eventBus 패턴: index.ts에서 on 리스너 등록 → broadcastToCompany 호출

### 주의사항

- 보고서 생성 실패가 작업 완료를 방해하면 안 됨 (격리된 try-catch)
- resultData는 nullable jsonb → 기존 완료 작업은 resultData=null (하위 호환)
- WebSocket 이벤트는 같은 회사 전체에 브로드캐스트 (userId별 필터는 프론트에서)
- authorId는 에이전트가 아닌 사용자(job.userId)로 설정 — 보고서 소유권은 사용자

### Project Structure Notes

- `packages/server/src/lib/job-queue.ts` — 기존 파일 수정 (보고서 생성 + resultData + eventBus)
- `packages/server/src/routes/workspace/jobs.ts` — 기존 파일 수정 (resultData 필드 추가)
- `packages/server/src/index.ts` — 기존 파일 수정 (night-job eventBus 브리지)
- `packages/app/src/pages/jobs.tsx` — 기존 파일 수정 (보고서/결과 버튼 + WS 구독)

### References

- [Source: packages/server/src/db/schema.ts:301-322] — nightJobs 스키마 (resultData:313)
- [Source: packages/server/src/db/schema.ts:249-261] — reports 스키마
- [Source: packages/server/src/lib/job-queue.ts:73-195] — processJob 함수
- [Source: packages/server/src/lib/tool-handlers/builtins/create-report.ts] — 참조용
- [Source: packages/server/src/routes/workspace/jobs.ts:53-86] — GET /jobs API
- [Source: packages/server/src/routes/workspace/jobs.ts:88-122] — GET /notifications API
- [Source: packages/server/src/index.ts:89-98] — EventBus → WS 브리지 패턴
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1112] — job-completed + relatedReportId UX
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:1119-1121] — [결과 보기] + [보고서 보기] 버튼

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Debug Log References

### Completion Notes List
- Task 1: job-queue.ts — processJob 완료 시 reports INSERT + resultData 저장, try-catch 격리
- Task 2: jobs.ts GET API — resultData 필드 두 엔드포인트(/, /notifications)에 추가
- Task 3: WebSocket — eventBus night-job 이벤트 발행(완료/실패) + index.ts 브리지 + channels.ts 구독 핸들러 + WsChannel 타입 확장
- Task 4: jobs.tsx — NightJob 타입 resultData 추가, JobCard에 결과 보기/보고서 보기 Link 버튼
- Task 5: jobs.tsx — useWsStore + useAuthStore로 night-job 채널 구독, invalidateQueries로 실시간 갱신
- Task 6: turbo build 3/3 성공
- Code Review: H1 — 재시도 시 job-retrying 이벤트 추가, M2 — instruction 개행문자 공백 치환

### File List
- packages/server/src/lib/job-queue.ts (MODIFIED — 보고서 생성 + resultData + eventBus emit)
- packages/server/src/routes/workspace/jobs.ts (MODIFIED — resultData 필드 GET/notifications 추가)
- packages/server/src/index.ts (MODIFIED — night-job eventBus 브리지)
- packages/server/src/ws/channels.ts (MODIFIED — night-job 구독 핸들러)
- packages/shared/src/types.ts (MODIFIED — WsChannel에 'night-job' 추가)
- packages/app/src/pages/jobs.tsx (MODIFIED — resultData 타입 + 버튼 + WS 구독)
