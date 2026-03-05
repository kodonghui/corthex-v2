# Story 11.2: 야간작업 스케줄 관리 UI — 탭 네비게이션 + 스케줄 CRUD

Status: review

## Story

As a 일반 직원(유저),
I want 야간작업 페이지에서 반복 스케줄을 등록/수정/삭제/활성화 토글할 수 있다,
so that 반복 작업을 직관적으로 관리할 수 있다.

## Acceptance Criteria

1. **Given** 야간작업 페이지 **When** 탭 클릭 **Then** "작업"(기존 목록)과 "스케줄"(반복 관리) 탭 전환
2. **Given** 스케줄 탭 **When** "+ 새 스케줄" 클릭 **Then** 에이전트 선택 + 작업 지시 + cron 식 입력 폼 표시
3. **Given** 유효한 스케줄 입력 **When** 등록 **Then** API POST 호출, 목록에 추가, 토스트 "스케줄 등록 완료"
4. **Given** 유효하지 않은 cron 식 **When** 등록/수정 **Then** 에러 메시지 표시 (SCHEDULE_001)
5. **Given** 스케줄 목록 **When** 토글 스위치 클릭 **Then** isActive PATCH 호출, 즉시 반영
6. **Given** 스케줄 카드 **When** 수정 버튼 클릭 **Then** 인라인 편집 모드 (instruction, cronExpression 수정 가능)
7. **Given** 스케줄 카드 **When** 삭제 버튼 클릭 **Then** ConfirmDialog → DELETE 호출 → 목록에서 제거
8. **Given** 스케줄 목록 **When** 로드 **Then** 에이전트 이름, cron 식, 다음 실행 시간(nextRunAt), 활성 상태 표시
9. `turbo build` 3/3 성공

## Tasks / Subtasks

- [x] Task 1: jobs.tsx에 탭 네비게이션 추가 (AC: #1)
  - [x]`Tabs` 컴포넌트 import + useState로 activeTab 관리
  - [x]"작업" 탭 = 기존 일회성 작업 UI (변경 없음)
  - [x]"스케줄" 탭 = 새 스케줄 관리 섹션

- [x] Task 2: 스케줄 목록 + 생성 폼 (AC: #2, #3, #4, #8)
  - [x]`useQuery(['schedules'])` — GET /api/workspace/schedules
  - [x]스케줄 카드: 에이전트명 + instruction + cron 식 + nextRunAt + isActive 뱃지
  - [x]생성 폼: Select(에이전트) + Textarea(지시) + Input(cron) + cron 도움말
  - [x]`useMutation` POST → 성공 시 invalidate + toast

- [x] Task 3: 스케줄 수정 + 삭제 + 토글 (AC: #5, #6, #7)
  - [x]isActive 토글: PATCH { isActive: !current } → 즉시 반영
  - [x]인라인 편집: 수정 버튼 → instruction/cronExpression 편집 모드 → 저장 PATCH
  - [x]삭제: ConfirmDialog → DELETE → invalidate + toast

- [x] Task 4: 빌드 확인 (AC: #9)
  - [x]`npx turbo build --force` 3/3 성공

## Dev Notes

### 기존 코드 참조

- **야간작업 페이지**: `packages/app/src/pages/jobs.tsx` — 기존 250줄, 탭 추가하여 확장
- **스케줄 API**: `packages/server/src/routes/workspace/schedules.ts` — Story 11-1에서 구현
- **탭 패턴**: `packages/app/src/pages/settings.tsx` — `Tabs` 컴포넌트 + useState 패턴
- **UI 컴포넌트**: `@corthex/ui` — Tabs, Select, Textarea, Input, ConfirmDialog, Badge, toast

### API 엔드포인트

```
GET    /api/workspace/schedules       → { data: Schedule[] }
POST   /api/workspace/schedules       → { data: Schedule } (201)
PATCH  /api/workspace/schedules/:id   → { data: Schedule }
DELETE /api/workspace/schedules/:id   → { data: { deleted: true } }
```

### Schedule 타입

```typescript
type Schedule = {
  id: string
  agentId: string
  agentName: string
  instruction: string
  cronExpression: string
  nextRunAt: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
```

### cron 도움말 텍스트

```
분 시 일 월 요일 | 예: 0 2 * * * = 매일 02:00
프리셋: @daily(매일), @weekly(매주), @hourly(매시간)
```

### 에러 코드

- SCHEDULE_001: 유효하지 않은 cron 식
- SCHEDULE_002: 스케줄을 찾을 수 없음
- SCHEDULE_003: 소유자가 아님

### 이전 스토리 학습사항 (11-1)

- croner 라이브러리로 cron 파싱, 서버에서 유효성 검증
- nextRunAt은 서버가 자동 계산 → UI에서 입력 불필요
- isActive 토글은 서버에서 즉시 반영, nextRunAt 재계산 없음

### 파일 구조

```
수정 파일:
  packages/app/src/pages/jobs.tsx (탭 추가 + 스케줄 CRUD 섹션)
```

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes List

- Badge variant "secondary" → "success"/"default"로 수정 (ui 패키지에 secondary 없음)
- turbo build 3/3 성공

### File List

- packages/app/src/pages/jobs.tsx (탭 추가 + 스케줄 CRUD 전체 구현)
