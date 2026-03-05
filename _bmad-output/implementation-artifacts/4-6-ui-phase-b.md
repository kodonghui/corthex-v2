# Story 4.6: UI Phase B

Status: done

## Story

As a 일반 직원(유저),
I want 채팅 화면의 모달/다이얼로그/입력이 일관된 공유 UI 컴포넌트를 사용한다,
so that 화면 전체에서 동일한 디자인 시스템이 적용되어 일관된 사용자 경험을 제공받는다.

## Acceptance Criteria

1. **Given** 에이전트 선택 모달 **When** 열림 **Then** 공유 `Modal` 컴포넌트 사용 (ESC 닫기, 배경 클릭 닫기, 포털 렌더링)
2. **Given** 세션 삭제 시 **When** 삭제 버튼 클릭 **Then** 공유 `ConfirmDialog` 컴포넌트로 확인 (제목 + 설명 + 취소/확인)
3. **Given** 채팅 입력 + 검색 입력 **When** 포커스 **Then** 공유 `Input` 컴포넌트 스타일 적용 (ring, border 일관)
4. **Given** 소울 편집기 이탈 다이얼로그 **When** 미저장 이탈 시 **Then** 공유 `ConfirmDialog` 사용
5. **Given** 모든 UI 변경 **When** 적용 후 **Then** 기존 기능 동작에 영향 없음 (비파괴적 리팩토링)

## Tasks / Subtasks

- [x] Task 1: @corthex/ui — ConfirmDialog 컴포넌트 추가 (AC: #2, #4)
  - [x] ConfirmDialog 컴포넌트 구현: Modal 기반, title/description/confirmText/cancelText props
  - [x] variant: danger (빨간 확인 버튼) / default (인디고 확인 버튼)
  - [x] index.ts에 export 추가
- [x] Task 2: 채팅 — AgentListModal을 공유 Modal로 전환 (AC: #1)
  - [x] agent-list-modal.tsx: 커스텀 모달 래퍼 → `Modal` 컴포넌트로 교체
  - [x] 기존 기능 유지: ESC 닫기, 검색, 정렬, 비활성 에이전트 비활성화
- [x] Task 3: 채팅 — SessionPanel의 DeleteConfirmDialog를 ConfirmDialog로 전환 (AC: #2)
  - [x] session-panel.tsx: 인라인 DeleteConfirmDialog → 공유 ConfirmDialog
- [x] Task 4: 채팅 — 입력 필드에 공유 Input 적용 (AC: #3)
  - [x] chat-area.tsx: 채팅 입력을 공유 Input으로 교체
  - [x] agent-list-modal.tsx: 검색 입력을 공유 Input으로 교체
- [x] Task 5: 소울 편집기 — 이탈 다이얼로그를 ConfirmDialog로 전환 (AC: #4)
  - [x] soul-editor.tsx: 인라인 이탈 다이얼로그 → 공유 ConfirmDialog
- [x] Task 6: 빌드 + 기존 테스트 통과 확인
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과 (69 pass, 0 fail)

## Dev Notes

### 핵심: 비파괴적 리팩토링

기능 변경 없이 인라인 컴포넌트를 공유 UI로 교체하는 작업. 기존 동작을 정확히 보존해야 함.

### ConfirmDialog 컴포넌트 설계

```typescript
// packages/ui/src/confirm-dialog.tsx
type ConfirmDialogProps = {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description?: string
  confirmText?: string  // 기본: '확인'
  cancelText?: string   // 기본: '취소'
  variant?: 'default' | 'danger'  // danger = 빨간 확인 버튼
}
```

Modal 컴포넌트를 내부적으로 사용. `variant="danger"`면 확인 버튼이 `bg-red-500`.

### AgentListModal 전환 패턴

기존:
```tsx
<div className="fixed inset-0 z-50 ..."> // 커스텀 오버레이
  <div className="bg-white rounded-xl ..."> // 커스텀 패널
```

변경:
```tsx
<Modal isOpen={true} onClose={onClose} title="에이전트 선택" className="max-w-md max-h-[80vh]">
  {/* 검색 + 목록 그대로 */}
</Modal>
```

주의: Modal의 기본 p-6 패딩이 있으므로, AgentListModal은 자체 패딩을 조정해야 함.

### Input 전환 패턴

채팅 입력:
```tsx
// 기존: <input className="flex-1 px-4 py-2.5 rounded-xl border ..." />
// 변경: <Input className="flex-1 rounded-xl" />
```

### 기존 코드 위치

- `packages/ui/src/modal.tsx` — 이미 구현됨 (포털, ESC, 배경 클릭)
- `packages/ui/src/input.tsx` — 이미 구현됨 (focus ring, error 상태)
- `packages/app/src/components/chat/agent-list-modal.tsx` — 커스텀 모달
- `packages/app/src/components/chat/session-panel.tsx:75-109` — 인라인 DeleteConfirmDialog
- `packages/app/src/components/chat/chat-area.tsx:460-466` — 인라인 input
- `packages/app/src/components/settings/soul-editor.tsx:220-243` — 인라인 이탈 다이얼로그

### Project Structure Notes

```
packages/ui/src/
├── confirm-dialog.tsx  ← 새 파일
├── index.ts            ← export 추가
packages/app/src/
├── components/chat/agent-list-modal.tsx  ← Modal 전환
├── components/chat/session-panel.tsx     ← ConfirmDialog 전환
├── components/chat/chat-area.tsx         ← Input 전환
├── components/settings/soul-editor.tsx   ← ConfirmDialog 전환
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Phase B] — Card, Input, Modal
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Phase C] — ConfirmDialog
- [Source: packages/ui/src/modal.tsx] — 기존 Modal 컴포넌트
- [Source: packages/ui/src/input.tsx] — 기존 Input 컴포넌트
- [Source: packages/app/src/components/chat/session-panel.tsx] — DeleteConfirmDialog
- [Source: packages/app/src/components/chat/agent-list-modal.tsx] — 커스텀 모달

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- ConfirmDialog 컴포넌트 신규: Modal 기반, variant(default/danger), title/description/confirmText/cancelText props
- AgentListModal: 커스텀 모달 래퍼 → Modal 컴포넌트 전환, p-0으로 기본 패딩 제거 후 자체 헤더/패딩 유지
- SessionPanel: 인라인 DeleteConfirmDialog 제거 → 공유 ConfirmDialog(variant="danger") 전환
- chat-area.tsx: 인라인 input → 공유 Input 컴포넌트 전환
- agent-list-modal.tsx: 검색 input → 공유 Input 컴포넌트 전환
- soul-editor.tsx: 인라인 이탈 다이얼로그 → 공유 ConfirmDialog(variant="danger") 전환
- turbo build 3/3 성공, bun test 69 pass / 0 fail

### File List

- packages/ui/src/confirm-dialog.tsx — 새 ConfirmDialog 컴포넌트
- packages/ui/src/index.ts — ConfirmDialog export 추가
- packages/app/src/components/chat/agent-list-modal.tsx — Modal + Input 전환
- packages/app/src/components/chat/session-panel.tsx — ConfirmDialog 전환
- packages/app/src/components/chat/chat-area.tsx — Input 전환
- packages/app/src/components/settings/soul-editor.tsx — ConfirmDialog 전환
