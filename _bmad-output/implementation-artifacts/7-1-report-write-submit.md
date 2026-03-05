# Story 7.1: 보고서 작성 & 제출 — UI 고도화 + 마크다운 렌더링 + 알림 연동 + 다운로드

Status: review

## Story

As a 워크스페이스 사용자,
I want 보고서를 마크다운으로 작성하고 CEO에게 제출하며 코멘트를 주고받고 다운로드할 수 있다,
so that 에이전트 분석 결과를 CEO에게 보고하고 피드백을 효율적으로 관리할 수 있다.

## Acceptance Criteria

1. **Given** /reports 목록 **When** 로드 **Then** [전체 (N)] [내 보고서 (N)] [받은 보고서 (N)] 탭 필터 + 보고서 카드(제목+작성자+날짜+미리보기+상태 뱃지)
2. **Given** 보고서 카드 **When** 클릭 **Then** `/reports/:id` 독립 URL로 읽기 뷰 진입, 마크다운 렌더링 본문 표시
3. **Given** 초안 보고서 **When** 작성자가 "CEO에게 보고" 클릭 **Then** ConfirmDialog 표시 → 확인 시 submit API 호출 + Toast "CEO에게 보고했습니다" + 상태 변경
4. **Given** 제출된 보고서 **When** CEO가 조회 **Then** 검토 완료 버튼 표시 + 코멘트 섹션 활성화
5. **Given** 코멘트 섹션 **When** 표시 **Then** 시간순 오름차순, CEO 코멘트 우측 accent 배경 / 작성자 좌측 muted 배경 구분
6. **Given** 보고서 제출 **When** API 성공 **Then** CEO에게 알림 발송 (인앱 + 이메일 옵션) + 활동 로그 기록
7. **Given** 코멘트 작성 **When** API 성공 **Then** 상대방에게 알림 발송 + 활동 로그 기록
8. **Given** 읽기 뷰 **When** 다운로드 클릭 **Then** GET /reports/:id/download → .md 파일 다운로드
9. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 백엔드 API 보강 (AC: #6, #7, #8)
  - [x] reports.ts에 다운로드 엔드포인트 추가: GET /reports/:id/download → Content-Disposition .md 파일
  - [x] reports.ts submit 엔드포인트에 알림 발송 추가: createNotification → CEO에게 "새 보고서가 제출되었습니다"
  - [x] reports.ts comments 엔드포인트에 알림 발송 추가: createNotification → 상대방에게 "코멘트가 추가되었습니다"
  - [x] 활동 로그 기록: 보고서 제출 시 activityLogs 추가

- [x] Task 2: 프론트엔드 보고서 목록 고도화 (AC: #1)
  - [x] reports.tsx 목록 뷰 리팩토링: 탭 필터(전체/내 보고서/받은 보고서) + 카운트 뱃지
  - [x] 보고서 카드 컴포넌트: 제목 + 작성자 + 날짜 + 미리보기 텍스트 (line-clamp-2) + 상태 뱃지
  - [x] CEO 보고 완료 카드: Badge success "📤 CEO 보고 완료" + 날짜

- [x] Task 3: 읽기 뷰 + 마크다운 렌더링 (AC: #2)
  - [x] `/reports/:id` 독립 URL 라우팅 (App.tsx 라우트 추가 + useParams)
  - [x] 마크다운 렌더링: react-markdown + CSS child selectors로 스타일링
  - [x] CEO 보고 완료 시 상단 안내: "CEO에게 보고된 보고서입니다" + 본문 편집 불가

- [x] Task 4: CEO 보고 (제출) 플로우 고도화 (AC: #3)
  - [x] ConfirmDialog 사용: "이 보고서를 CEO에게 보고하시겠습니까? 보고 후 본문 수정이 제한됩니다."
  - [x] Toast success "CEO에게 보고했습니다" (window.confirm → ConfirmDialog 교체)

- [x] Task 5: 코멘트 섹션 고도화 (AC: #5)
  - [x] CEO 코멘트: 우측 정렬 (ml-auto) + bg-indigo-50 배경
  - [x] 작성자 코멘트: 좌측 정렬 (mr-auto) + bg-zinc-50 배경

- [x] Task 6: 다운로드 + 모바일 (AC: #8)
  - [x] 다운로드 버튼: fetch + blob + URL.createObjectURL + 에러 Toast
  - [x] 모바일: 카드 100%, 액션 버튼 sticky bottom, -webkit-overflow-scrolling

- [x] Task 7: 빌드 검증 (AC: #9)

## Dev Notes

### 기존 코드 현황 (중요!)

**이미 구현된 백엔드 (packages/server/src/routes/workspace/reports.ts):**
- ✅ GET /reports — 목록 (내 보고서 + 받은 보고서)
- ✅ POST /reports — 새 보고서 생성
- ✅ GET /reports/:id — 상세
- ✅ PUT /reports/:id — 수정 (초안만)
- ✅ POST /reports/:id/submit — CEO 제출
- ✅ POST /reports/:id/review — 검토 완료
- ✅ DELETE /reports/:id — 삭제 (초안만)
- ✅ GET /reports/:id/comments — 코멘트 목록
- ✅ POST /reports/:id/comments — 코멘트 작성
- ❌ GET /reports/:id/download — 미구현 (추가 필요)
- ❌ 알림 발송 — 미연동 (createNotification 호출 추가 필요)
- ❌ 활동 로그 — 미연동 (activityLogs insert 추가 필요)

**이미 구현된 프론트엔드 (packages/app/src/pages/reports.tsx, 474줄):**
- ✅ 기본 목록/작성/상세 뷰 (SPA 내부 상태 기반)
- ✅ CRUD + 제출 + 검토 + 코멘트 mutation
- ❌ 탭 필터 (전체/내 보고서/받은 보고서) — 미구현
- ❌ 카드 미리보기 텍스트 — 미구현
- ❌ 독립 URL 라우팅 (/reports/:id) — 미구현 (현재 view state 사용)
- ❌ 마크다운 렌더링 — 미구현 (현재 whitespace-pre-wrap)
- ❌ ConfirmDialog — 미사용 (현재 window.confirm)
- ❌ 코멘트 좌/우 정렬 구분 — 미구현
- ❌ 다운로드 — 미구현
- ❌ 모바일 최적화 — 미구현

**DB 스키마 (packages/server/src/db/schema.ts:243-265):**
- reports 테이블: id, companyId, authorId, title, content, status(draft/submitted/reviewed), submittedTo, submittedAt
- reportComments 테이블: id, companyId, reportId, authorId, content, createdAt
- reportStatusEnum: ['draft', 'submitted', 'reviewed']

### 알림 시스템 연동 (Epic 6)

**notifier.ts 패턴 재사용:**
```typescript
import { createNotification } from '../../lib/notifier'

// 보고서 제출 시
await createNotification({
  userId: supervisor.id,  // CEO
  companyId: tenant.companyId,
  type: 'system',  // 또는 새 타입 추가 가능
  title: `${authorName}님이 보고서를 제출했습니다`,
  body: reportTitle,
  actionUrl: `/reports/${reportId}`,
})
```

**활동 로그 기록 패턴:**
```typescript
import { activityLogs } from '../../db/schema'

await db.insert(activityLogs).values({
  companyId: tenant.companyId,
  eventId: crypto.randomUUID(),
  type: 'system',
  phase: 'end',
  actorType: 'user',
  actorId: tenant.userId,
  actorName: user.name,
  action: '보고서 제출',
  detail: report.title,
})
```

### 마크다운 렌더링 접근

**Option A (추천): 간단 CSS + whitespace-pre-wrap 유지**
- 현재 코드 유지, prose 클래스만 추가
- 마크다운 파서 없이 기본 텍스트 표시

**Option B: react-markdown 패키지 사용**
- `npm install react-markdown` (app 패키지)
- `<ReactMarkdown className="prose prose-sm dark:prose-invert">{content}</ReactMarkdown>`
- Tailwind Typography 플러그인 필요 (@tailwindcss/typography)

**결정: Option B 사용 — UX 스펙에서 "prose prose-sm dark:prose-invert"를 명시적으로 요구**

### 독립 URL 라우팅 전환

현재 `reports.tsx`는 `view` state로 목록/작성/상세를 전환합니다.
UX 스펙 요구: `/reports/:id` 독립 URL.

**접근:**
1. React Router에 `/reports/:id` 라우트 추가
2. reports.tsx를 목록 전용으로 리팩토링
3. report-detail.tsx를 새로 생성 (또는 reports.tsx 내부에서 URL 파라미터 처리)

### ConfirmDialog 재사용

`packages/ui/src/confirm-dialog.tsx` — Epic 4-6에서 만든 공유 컴포넌트.
`window.confirm` → `ConfirmDialog` 교체.

### UX 스펙 참조

- 보고서 전체 UI 와이어프레임: ux-design-specification.md:1133-1209
- 목록 탭 필터: "전체 (12)", "내가 요청 (5)", "CEO 보고 (3)"
- 읽기 뷰: `/reports/:id` 독립 URL, 마크다운 렌더링
- 코멘트: 시간순 오름차순, CEO 우측/에이전트 좌측
- 다운로드: MD 형식만, GET /reports/:id/download
- 모바일: 카드 100%, sticky bottom 액션

### Project Structure Notes

- 보고서 라우트: packages/server/src/routes/workspace/reports.ts
- 보고서 페이지: packages/app/src/pages/reports.tsx
- UI 공유 컴포넌트: packages/ui/src/ (ConfirmDialog, Badge, Card, Tabs, Skeleton 등)
- 알림 유틸: packages/server/src/lib/notifier.ts
- 활동 로그: packages/server/src/routes/workspace/activity-log.ts
- 라우터: packages/app/src/app.tsx (라우트 정의 위치)

### References

- [Source: ux-design-specification.md#1133-1209] — 보고서 UI 전체 스펙
- [Source: packages/server/src/routes/workspace/reports.ts] — 기존 API 전체
- [Source: packages/app/src/pages/reports.tsx] — 기존 프론트엔드 전체
- [Source: packages/server/src/db/schema.ts#243-265] — reports + reportComments 스키마
- [Source: packages/server/src/lib/notifier.ts] — 알림 생성 패턴
- [Source: epic-6-retro-2026-03-05.md] — Epic 6 회고 (알림 시스템 패턴 참조)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- reports.ts 백엔드: 다운로드 엔드포인트 추가 (Content-Disposition UTF-8 파일명)
- reports.ts: submit 시 CEO 알림 발송 (createNotification) + 활동 로그 기록
- reports.ts: comments 작성 시 상대방 알림 발송
- reports.tsx 전면 리라이트: Tabs(전체/내 보고서/받은 보고서) + 카드 미리보기 + Badge
- /reports/:id 독립 URL 라우팅 (App.tsx + useParams)
- react-markdown 마크다운 렌더링 + CSS child selectors 스타일링
- ConfirmDialog: CEO 보고 + 삭제 모두 교체 (window.confirm 제거)
- 코멘트 좌/우 정렬: CEO=우측 accent 배경, 작성자=좌측 muted 배경
- 다운로드: fetch+blob+createObjectURL, 에러 시 Toast
- 모바일: sticky bottom 액션 버튼, -webkit-overflow-scrolling
- 목록 API에 content 필드 추가 (미리보기용)

### File List
- packages/server/src/routes/workspace/reports.ts (MODIFIED — 다운로드 API + 알림 + 활동 로그 + content 목록)
- packages/app/src/pages/reports.tsx (REWRITTEN — 탭 필터 + URL 라우팅 + 마크다운 + ConfirmDialog + 코멘트 정렬)
- packages/app/src/App.tsx (MODIFIED — /reports/:id 라우트 추가)
