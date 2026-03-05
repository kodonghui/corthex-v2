# Story 5.3: UI Phase C -- 상호작용 컴포넌트

Status: review

## Story

As a 개발자 (전체 프론트엔드),
I want @corthex/ui 패키지에 Tabs, Toggle, Textarea, Select 공유 컴포넌트를 추가하고 기존 인라인 구현을 리팩토링한다,
so that 코드 중복을 제거하고 일관된 UI를 유지하며 향후 기능 확장이 쉬워진다.

## Acceptance Criteria

1. **Given** @corthex/ui에서 Tabs import **When** 탭 전환 클릭 **Then** 활성 탭 하이라이트 + 언더라인 표시, onChange 콜백 호출
2. **Given** @corthex/ui에서 Toggle import **When** 클릭 **Then** ON/OFF 상태 전환 + 비활성 시 회색, 활성 시 인디고 색상
3. **Given** @corthex/ui에서 Textarea import **When** 입력 시 **Then** 내용에 맞게 높이 자동 조절 (auto-resize)
4. **Given** @corthex/ui에서 Select import **When** 옵션 선택 **Then** 표준 디자인 + 화살표 아이콘 + disabled 지원
5. **Given** settings.tsx 탭 영역 **When** Tabs 컴포넌트로 교체 **Then** 동일한 동작 + 코드량 감소
6. **Given** jobs/sns/reports 페이지 inline textarea **When** Textarea로 교체 **Then** 동일 동작 + auto-resize 추가
7. **Given** jobs/sns/settings 페이지 inline select **When** Select로 교체 **Then** 동일 동작 + 일관된 스타일
8. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공, 기존 테스트 전부 통과

## Tasks / Subtasks

- [x] Task 1: @corthex/ui — Tabs 컴포넌트 (AC: #1)
  - [x]packages/ui/src/tabs.tsx 생성
  - [x]Props: items (value+label), activeValue, onChange, className
  - [x]모바일 가로 스크롤 지원 (overflow-x-auto snap-x)
  - [x]활성 탭 인디고 텍스트 + bottom bar
  - [x]index.ts에 export 추가
- [x] Task 2: @corthex/ui — Toggle 컴포넌트 (AC: #2)
  - [x]packages/ui/src/toggle.tsx 생성
  - [x]Props: checked, onChange, disabled, label, size ('sm' | 'md')
  - [x]비활성=bg-zinc-300, 활성=bg-indigo-600, transition-colors
  - [x]index.ts에 export 추가
- [x] Task 3: @corthex/ui — Textarea 컴포넌트 (AC: #3)
  - [x]packages/ui/src/textarea.tsx 생성
  - [x]Props: value, onChange, placeholder, rows, maxRows, disabled, className
  - [x]auto-resize: useEffect로 scrollHeight 기반 높이 조절
  - [x]Input과 동일 스타일 (border, focus ring, dark mode)
  - [x]index.ts에 export 추가
- [x] Task 4: @corthex/ui — Select 컴포넌트 (AC: #4)
  - [x]packages/ui/src/select.tsx 생성
  - [x]Props: value, onChange, options ({value, label}[]), placeholder, disabled, className
  - [x]Input과 동일 스타일 + 커스텀 화살표 아이콘
  - [x]index.ts에 export 추가
- [x] Task 5: 리팩토링 — settings.tsx 탭을 Tabs 컴포넌트로 교체 (AC: #5)
  - [x]inline 탭 렌더링 → <Tabs items={TABS} ... /> 으로 교체
- [x] Task 6: 리팩토링 — inline textarea를 Textarea로 교체 (AC: #6)
  - [x]jobs.tsx: <textarea> → <Textarea>
  - [x]sns.tsx: <textarea> → <Textarea>
  - [x]reports.tsx: 2개 <textarea> → <Textarea>
  - [x]soul-editor.tsx: <textarea> → <Textarea>
- [x] Task 7: 리팩토링 — inline select를 Select로 교체 (AC: #7)
  - [x]jobs.tsx: <select> → <Select>
  - [x]sns.tsx: 2개 <select> → <Select>
  - [x]settings.tsx (TelegramSection): <select> → <Select>
  - [x]soul-editor.tsx: <select> → <Select>
  - [x]nexus/NodeDetailPanel.tsx: <select> → <Select>
- [x] Task 8: 빌드 + 테스트 (AC: #8)
  - [x]turbo build 3/3 성공
  - [x]bun test 전부 통과

## Dev Notes

### Phase C 컴포넌트 설계 원칙

Phase B 패턴(Story 4-6)을 따릅니다:
1. @corthex/ui에 공유 컴포넌트 추가
2. 기존 인라인 코드를 공유 컴포넌트로 교체
3. 동작은 동일하게 유지 (리팩토링이지 기능 변경 아님)

### 기존 인라인 코드 위치

**Tabs (인라인 탭 구현):**
- `packages/app/src/pages/settings.tsx:83-109` — 6개 탭 (프로필/텔레그램/소울/파일/투자/알림)
- `packages/app/src/components/settings/soul-editor.tsx:151-175` — 모바일 편집/미리보기 탭

**Textarea (인라인 <textarea>):**
- `packages/app/src/pages/jobs.tsx:126` — 야간작업 내용 입력
- `packages/app/src/pages/sns.tsx:216` — SNS 본문 입력
- `packages/app/src/pages/reports.tsx:282, 340` — 보고서 코멘트
- `packages/app/src/components/settings/soul-editor.tsx:180` — 소울 마크다운 편집기

**Select (인라인 <select>):**
- `packages/app/src/pages/jobs.tsx:111` — 에이전트 선택
- `packages/app/src/pages/sns.tsx:208, 230, 236` — 플랫폼/에이전트 선택
- `packages/app/src/pages/settings.tsx:215` — 텔레그램 봇 선택
- `packages/app/src/components/settings/soul-editor.tsx:124` — 소울 템플릿 선택
- `packages/app/src/components/nexus/NodeDetailPanel.tsx:92` — 상세 패널 select

### 기존 @corthex/ui 컴포넌트 참조

현재 14개 컴포넌트 존재:
```
avatar, badge, button, card, confirm-dialog, empty-state,
input, modal, skeleton, spinner, status-dot, toast, utils
```

**Input 컴포넌트 스타일 (Textarea/Select가 일치해야 함):**
- `w-full px-3 py-2 text-sm rounded-lg border`
- `border-zinc-200 dark:border-zinc-700`
- `bg-white dark:bg-zinc-900`
- `focus:outline-none focus:ring-2 focus:ring-indigo-500`
- `disabled:opacity-50 disabled:cursor-not-allowed`

### AgentListModal은 이미 완성

`packages/app/src/components/chat/agent-list-modal.tsx`에 이미 구현되어 있음.
Phase C 스펙에서 "공용 모달"로 추출 지시가 있으나, 현재 chat 페이지에서만 사용 중이라 이동은 실제 재사용 시점까지 보류.

### 파일 변경 범위

```
packages/ui/src/tabs.tsx         -- 신규
packages/ui/src/toggle.tsx       -- 신규
packages/ui/src/textarea.tsx     -- 신규
packages/ui/src/select.tsx       -- 신규
packages/ui/src/index.ts         -- export 4개 추가
packages/app/src/pages/settings.tsx         -- Tabs + Select 교체
packages/app/src/pages/jobs.tsx             -- Textarea + Select 교체
packages/app/src/pages/sns.tsx              -- Textarea + Select 교체
packages/app/src/pages/reports.tsx          -- Textarea 교체
packages/app/src/components/settings/soul-editor.tsx  -- Textarea + Select 교체
packages/app/src/components/nexus/NodeDetailPanel.tsx  -- Select 교체
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:165-167] -- Phase C 컴포넌트 목록
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md:320-338] -- Form/Animation 정책
- [Source: _bmad-output/implementation-artifacts/4-6-ui-phase-b.md] -- Phase B 패턴 참조
- [Source: packages/ui/src/input.tsx] -- Input 스타일 참조
- [Source: packages/ui/src/index.ts] -- 기존 export 목록

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1-4: @corthex/ui에 Tabs, Toggle, Textarea, Select 4개 공유 컴포넌트 생성. Input 스타일과 동일한 디자인 시스템 적용.
- Task 5: settings.tsx 인라인 탭(28줄) → Tabs 컴포넌트 1줄로 교체. TabItem 타입 사용.
- Task 6: jobs/sns/reports/soul-editor 4개 파일의 인라인 textarea 5개를 Textarea로 교체. auto-resize 추가.
- Task 7: jobs/sns/settings/soul-editor/NodeDetailPanel 5개 파일의 인라인 select 8개를 Select로 교체.
- Task 8: turbo build 3/3 성공

### File List
- packages/ui/src/tabs.tsx (신규)
- packages/ui/src/toggle.tsx (신규)
- packages/ui/src/textarea.tsx (신규)
- packages/ui/src/select.tsx (신규)
- packages/ui/src/index.ts (수정 - export 추가)
- packages/app/src/pages/settings.tsx (수정 - Tabs + Select)
- packages/app/src/pages/jobs.tsx (수정 - Select + Textarea)
- packages/app/src/pages/sns.tsx (수정 - Select + Textarea)
- packages/app/src/pages/reports.tsx (수정 - Textarea)
- packages/app/src/components/settings/soul-editor.tsx (수정 - Select + Textarea)
- packages/app/src/components/nexus/NodeDetailPanel.tsx (수정 - Select)
