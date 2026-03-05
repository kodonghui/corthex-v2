# Story 6.5: UI Phase D — Toast + Timeline + FilterChip 공유 컴포넌트

Status: review

## Story

As a 개발자 (전체 프론트엔드),
I want @corthex/ui에 Toast, Timeline, FilterChip 공유 컴포넌트를 추가하고 기존 인라인 구현을 리팩토링한다,
so that 코드 중복을 제거하고 알림/작전일지 UI 일관성을 높인다.

## Acceptance Criteria

1. **Given** @corthex/ui Toast import **When** show 호출 **Then** 우상단 토스트 표시 (variant: success/error/info/warning), 5초 자동 닫힘
2. **Given** Toast **When** 여러 개 표시 **Then** 수직 스택 (최대 3개, FIFO)
3. **Given** @corthex/ui Timeline import **When** items 전달 **Then** 세로선 + 도트 + 카드 레이아웃 렌더링
4. **Given** @corthex/ui FilterChip import **When** 클릭 **Then** 토글 활성/비활성 (활성=인디고, 비활성=muted)
5. **Given** ops-log.tsx 인라인 타임라인/필터칩 **When** 공유 컴포넌트로 교체 **Then** 동일 동작 + 코드량 감소
6. **Given** 알림 Toast (6-2) **When** @corthex/ui Toast로 교체 **Then** 동일 동작 + 일관된 스타일
7. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: @corthex/ui Toast 개선 (AC: #1, #2)
  - [x] 우상단(top-4 right-4)으로 이동, 5초 자동 닫힘, max 3 FIFO
  - [x] slideInRight 애니메이션 추가

- [x] Task 2: @corthex/ui FilterChip 컴포넌트 (AC: #4)
  - [x] packages/ui/src/filter-chip.tsx — label, active, onClick, icon?, count?

- [x] Task 3: @corthex/ui TimelineGroup 컴포넌트 (AC: #3)
  - [x] packages/ui/src/timeline.tsx — 세로선 + 도트 + 카드 슬롯

- [x] Task 4: ops-log.tsx 리팩토링 (AC: #5)
  - [x] 인라인 FilterChip → @corthex/ui FilterChip
  - [x] 인라인 타임라인 → @corthex/ui TimelineGroup

- [x] Task 5: Toast 적용 (AC: #6)
  - [x] 이미 ToastProvider + notification-listener에서 @corthex/ui toast 사용 중

- [x] Task 6: 빌드 검증 (AC: #7) — 3/3 성공

## Dev Notes

### 기존 인라인 구현 위치
- `packages/app/src/pages/ops-log.tsx:301-362` — 타임라인 렌더링 (세로선 + 도트)
- `packages/app/src/pages/ops-log.tsx:253-280` — 필터 칩 (전체/채팅/위임/도구호출 등)
- UX 스펙 P0 컴포넌트: Toast (ux-design-specification.md:135)
- UX 스펙 P1 컴포넌트: Timeline (141행), FilterChip (142행)

### Toast 위치 규칙
- 우상단 `top-4 right-4` (ux-design-specification.md:309, 1815)
- 채팅 입력창과 겹침 방지

### @corthex/ui 현재 컴포넌트 수: 18 → 이 스토리 후 21

### References
- [Source: ux-design-specification.md#135-152] — P0/P1 컴포넌트 목록
- [Source: ux-design-specification.md#309] — Toast 사용 규칙
- [Source: packages/app/src/pages/ops-log.tsx:253-362] — 인라인 구현

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Toast 기존 구현 개선: bottom→top, 4s→5s, max 3 FIFO, slideInRight 애니메이션
- FilterChip: icon/count 지원, 활성=인디고/비활성=muted
- TimelineGroup: dotColor + ReactNode content 슬롯
- @corthex/ui 컴포넌트 수: 18 → 20 (FilterChip, TimelineGroup)

### File List
- packages/ui/src/toast.tsx (MODIFIED)
- packages/ui/src/filter-chip.tsx (NEW)
- packages/ui/src/timeline.tsx (NEW)
- packages/ui/src/index.ts (MODIFIED)
- packages/app/src/pages/ops-log.tsx (MODIFIED — 리팩토링)
- packages/app/src/index.css (MODIFIED — slideInRight keyframe)
