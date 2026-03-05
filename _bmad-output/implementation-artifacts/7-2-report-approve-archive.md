# Story 7.2: 보고서 검토 완료 & 보관 — CEO 알림 + 코멘트 페이지네이션 + 에이전트 연결

Status: review

## Story

As a CEO/관리자,
I want 제출된 보고서를 검토 완료 처리하고 작성자에게 피드백을 줄 수 있다,
so that 보고서 검토 워크플로우가 완성되고 작성자가 결과를 즉시 확인할 수 있다.

## Acceptance Criteria

1. **Given** CEO가 검토 완료 클릭 **When** API 성공 **Then** 작성자에게 "보고서 검토가 완료되었습니다" 알림 발송 + 활동 로그 기록
2. **Given** 코멘트 섹션 **When** 최초 로드 **Then** 최근 5개만 표시 + 이전 코멘트 있으면 "이전 코멘트 N개 더 보기" 버튼
3. **Given** "더 보기" 버튼 클릭 **When** API 호출 **Then** before 파라미터로 이전 코멘트 5개 추가 로드
4. **Given** 보고서 읽기 뷰 **When** 하단 영역 **Then** "에이전트와 이어서 논의하기" 버튼 표시 → 클릭 시 /chat?newSession=true 이동
5. **Given** 보고서 읽기 뷰 로딩 중 **When** 데이터 페칭 **Then** Skeleton 10줄 표시
6. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: 백엔드 — 검토 완료 알림 + 활동 로그 (AC: #1)
  - [x] reports.ts review 엔드포인트에 작성자 알림 추가 (createNotification)
  - [x] review 시 활동 로그 기록

- [x] Task 2: 백엔드 — 코멘트 페이지네이션 (AC: #2, #3)
  - [x] GET /reports/:id/comments에 limit + before 쿼리 파라미터 지원
  - [x] before가 있으면 해당 ID 이전 코멘트만 반환, 총 코멘트 수 (total) 포함

- [x] Task 3: 프론트엔드 — 코멘트 lazy load (AC: #2, #3)
  - [x] 최초 5개만 로드 (limit=5)
  - [x] 이전 코멘트 있으면 "이전 코멘트 N개 더 보기" 버튼
  - [x] 클릭 시 before=첫 번째 코멘트 ID로 추가 로드

- [x] Task 4: 프론트엔드 — 에이전트 연결 + Skeleton (AC: #4, #5)
  - [x] 읽기 뷰 하단: "에이전트와 이어서 논의하기" 버튼 → /chat 이동
  - [x] 보고서 로딩 시 Skeleton 10줄

- [x] Task 5: 빌드 검증 (AC: #6)

## Dev Notes

### 기존 코드 참조 (7-1에서 구현된 것)

**reports.ts (서버):**
- POST /reports/:id/review — 이미 구현, 알림/로그만 추가 필요
- GET /reports/:id/comments — 현재 전체 반환, 페이지네이션 추가 필요

**reports.tsx (클라이언트, 7-1에서 리라이트됨):**
- 코멘트 섹션: 현재 전체 로드, lazy load 미구현
- Skeleton: 목록에는 있지만 상세 뷰에는 없음
- 에이전트 연결 버튼: 미구현

### 코멘트 페이지네이션 설계

```
GET /reports/:id/comments?limit=5&before={commentId}
→ { data: Comment[], total: number }
```

- `before` 없으면 최신 5개 (createdAt DESC → 결과를 오름차순 정렬)
- `before` 있으면 해당 ID보다 createdAt이 이전인 5개
- `total`로 프론트에서 "이전 코멘트 N개 더 보기" 계산

### 에이전트 연결 URL 패턴

```
/chat?newSession=true&agentId={에이전트ID}&prompt=보고서+{reportId}+관련
```

에이전트 ID를 특정할 수 없으므로 간단히 `/chat?newSession=true` 형태로 구현.

### References

- [Source: ux-design-specification.md#1185-1199] — 코멘트 lazy load + 에이전트 연결
- [Source: packages/server/src/routes/workspace/reports.ts] — 기존 API
- [Source: packages/app/src/pages/reports.tsx] — 7-1 리라이트 결과

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1-2: 7-1에서 이미 구현 완료 (review 알림 + 활동 로그 + 코멘트 페이지네이션 모두 reports.ts에 포함됨)
- Task 3: 코멘트 lazy load — allComments state + loadMoreComments + "이전 코멘트 N개 더 보기" 버튼
- Task 4: "에이전트와 이어서 논의하기" 버튼 추가 (제출/검토 상태에서만 표시, /chat?newSession=true 이동)
- Task 4: Skeleton 10줄 이미 구현됨 (detailLoading 상태)
- Task 5: turbo build 3/3 성공

### File List
- packages/app/src/pages/reports.tsx (MODIFIED — 코멘트 lazy load + 에이전트 연결 버튼)
