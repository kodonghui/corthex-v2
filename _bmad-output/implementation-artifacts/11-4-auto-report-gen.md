# Story 11.4: 야간작업 자동 보고서 생성 — 완료 작업 → 보고서 자동 생성

Status: review

## Story

As a 일반 직원(유저),
I want 야간작업이 완료되면 결과가 자동으로 보고서로 생성된다,
so that 아침에 출근하면 정리된 보고서로 결과를 바로 확인하고 CEO에게 제출할 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 완료 **When** processJob 성공 **Then** 자동으로 reports 테이블에 draft 보고서 생성
2. **Given** 자동 생성된 보고서 **When** 제목 **Then** "[야간] {에이전트명} — {instruction 앞 50자}" 형식
3. **Given** 자동 생성된 보고서 **When** 내용 **Then** AI 결과(result) 전체 텍스트 + 메타정보(실행시간, 에이전트) 포함
4. **Given** 야간작업 목록 **When** 완료된 작업에 보고서가 있으면 **Then** "[보고서 보기]" 버튼 표시
5. **Given** "[보고서 보기]" 클릭 **When** 이동 **Then** /reports 페이지로 이동 (해당 보고서)
6. **Given** 보고서 생성 실패 **When** 에러 **Then** 작업 자체는 completed 유지, 에러 로그만 기록
7. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: job-queue.ts processJob에 자동 보고서 생성 로직 추가 (AC: #1, #2, #3, #6)
  - [x] 작업 완료 후 reports 테이블에 insert (status: draft)
  - [x] 제목: `[야간] ${agentName} — ${instruction.slice(0, 50)}`
  - [x] 내용: 메타정보 헤더 + result 전문
  - [x] 에러 시 catch → 로그만, 작업 상태는 completed 유지

- [x] Task 2: nightJobs 결과에 reportId 연결 (AC: #4)
  - [x] processJob에서 생성된 보고서 ID를 nightJobs.resultData에 { reportId } 저장
  - [x] GET /api/workspace/jobs 응답에 resultData 포함 (이미 스키마에 있음)

- [x] Task 3: 프론트엔드 "[보고서 보기]" 버튼 (AC: #4, #5)
  - [x] jobs.tsx JobsTab 완료 작업 카드에 resultData?.reportId 있으면 버튼 표시
  - [x] 클릭 시 navigate('/reports') 이동

- [x] Task 4: 빌드 확인 (AC: #7)
  - [x] `npx turbo build --force` 3/3 성공

## Dev Notes

### 기존 코드 참조

- **작업 큐**: `packages/server/src/lib/job-queue.ts:71-193` — processJob 함수
- **보고서 API**: `packages/server/src/routes/workspace/reports.ts` — insert 패턴
- **DB 스키마**: `packages/server/src/db/schema.ts:250-271` — reports 테이블
- **야간작업 UI**: `packages/app/src/pages/jobs.tsx` — JobsTab 컴포넌트

### 보고서 생성 패턴

```typescript
// reports 테이블에 직접 insert (API 경유 불필요 — 서버 내부 호출)
import { reports } from '../db/schema'

const [report] = await db.insert(reports).values({
  companyId: job.companyId,
  authorId: job.userId,
  title: `[야간] ${agentName} — ${job.instruction.slice(0, 50)}`,
  content: `## 야간 작업 결과\n\n**에이전트:** ${agentName}\n**실행:** ${new Date().toLocaleString('ko-KR')}\n\n---\n\n${result}`,
  status: 'draft',
}).returning()
```

### resultData 활용

nightJobs.resultData는 JSONB 컬럼으로 이미 존재. 현재 미사용 상태.
자동 보고서 ID를 여기에 저장: `{ reportId: string }`

### 이전 스토리 학습사항

- Badge variant "secondary" 없음 → "success"/"default" 사용
- 보고서 생성 실패가 작업 자체를 실패시키면 안 됨 (try-catch 분리)

### 파일 구조

```
수정 파일:
  packages/server/src/lib/job-queue.ts (processJob에 보고서 생성 로직)
  packages/app/src/pages/jobs.tsx (보고서 보기 버튼)
```

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- processJob 완료 후 자동 보고서 생성 (try-catch로 실패해도 작업은 completed)
- resultData JSONB에 { reportId } 저장, GET /api/workspace/jobs에서 반환
- 프론트 JobsTab에 "보고서 보기" 버튼 추가 (resultData.reportId 존재 시)
- turbo build 3/3 성공

### File List

- packages/server/src/lib/job-queue.ts (수정 — 자동 보고서 생성 + resultData 저장)
- packages/server/src/routes/workspace/jobs.ts (수정 — resultData 필드 반환)
- packages/app/src/pages/jobs.tsx (수정 — 보고서 보기 버튼 + useNavigate)
