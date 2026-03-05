# Story 7.4: UI Phase E — MarkdownRenderer 공유 컴포넌트 + 보고서 EmptyState + 마무리 정리

Status: review

## Story

As a 개발자 (전체 프론트엔드),
I want @corthex/ui에 MarkdownRenderer 공유 컴포넌트를 추가하고, 보고서 페이지에 EmptyState를 적용하며, 인라인 마크다운 스타일을 정리한다,
so that 마크다운 렌더링 코드 중복을 제거하고 보고서 UI 완성도를 높인다.

## Acceptance Criteria

1. **Given** MarkdownRenderer import **When** content 전달 **Then** 마크다운이 일관된 스타일로 렌더링된다 (h1~h3, p, ul/ol, code, blockquote)
2. **Given** reports.tsx 마크다운 영역 **When** MarkdownRenderer로 교체 **Then** 기존과 동일한 렌더링 + 인라인 CSS 제거
3. **Given** soul-editor.tsx 마크다운 미리보기 **When** MarkdownRenderer로 교체 **Then** 동일한 스타일 적용
4. **Given** 보고서 목록이 비어있을 때 **When** 로드 완료 **Then** EmptyState 컴포넌트로 "아직 보고서가 없습니다" 표시
5. **Given** turbo build **When** 전체 빌드 **Then** 3/3 성공

## Tasks / Subtasks

- [x] Task 1: app 패키지에 MarkdownRenderer 공유 컴포넌트 추가 (AC: #1)
  - [x] packages/app/src/components/markdown-renderer.tsx 생성: ReactMarkdown + 공유 CSS 스타일
  - [x] react-markdown이 app 전용 의존성이므로 ui 패키지 대신 app 내부에 구현

- [x] Task 2: reports.tsx 인라인 마크다운 스타일 → MarkdownRenderer (AC: #2)
  - [x] `<ReactMarkdown>` + 긴 `[&_h1]:text-lg...` 클래스 → `<MarkdownRenderer content={...} />`

- [x] Task 3: soul-editor.tsx 마크다운 미리보기 → MarkdownRenderer (AC: #3)
  - [x] `<Markdown>` + prose 클래스 → `<MarkdownRenderer content={...} />`

- [x] Task 4: 보고서 목록 EmptyState (AC: #4)
  - [x] 보고서 없을 때 공유 EmptyState 컴포넌트 사용 (탭별 메시지 분기)

- [x] Task 5: 빌드 검증 (AC: #5)

## Dev Notes

### MarkdownRenderer 설계

```tsx
// packages/ui/src/markdown-renderer.tsx
import ReactMarkdown from 'react-markdown'

export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={`text-sm leading-relaxed ${markdownStyles} ${className || ''}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

const markdownStyles = [
  '[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-3',
  '[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2',
  '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1',
  '[&_p]:mb-2',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2',
  '[&_li]:mb-0.5',
  '[&_code]:bg-zinc-200 [&_code]:dark:bg-zinc-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs',
  '[&_pre]:bg-zinc-200 [&_pre]:dark:bg-zinc-700 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-2',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-500',
  '[&_strong]:font-semibold',
  '[&_a]:text-indigo-600 [&_a]:underline',
].join(' ')
```

### 기존 코드 위치

**reports.tsx 마크다운 (430줄 부근):**
```tsx
<div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 text-sm leading-relaxed min-h-[200px] [&_h1]:text-lg...">
  <ReactMarkdown>{report.content || '(내용 없음)'}</ReactMarkdown>
</div>
```

**soul-editor.tsx 마크다운 (200줄 부근):**
```tsx
<div className="prose prose-sm dark:prose-invert max-w-none text-sm">
  <Markdown>{...}</Markdown>
</div>
```

### EmptyState 컴포넌트

이미 `packages/ui/src/empty-state.tsx`에 존재. import하여 사용.

### react-markdown 의존성

`react-markdown`은 현재 app 패키지에만 설치됨. MarkdownRenderer를 ui 패키지에 넣으려면 ui 패키지에도 react-markdown 의존성 추가 필요.
대안: MarkdownRenderer를 app 패키지 내부 공유 컴포넌트로 구현 (`packages/app/src/components/markdown-renderer.tsx`).

**결정: app 패키지 내부에 구현** — react-markdown은 app 전용 의존성이므로 ui 패키지에 추가하지 않음.

### Project Structure Notes

- 공유 UI: packages/ui/src/ (react-markdown 미포함)
- app 내부 공유: packages/app/src/components/
- 보고서 페이지: packages/app/src/pages/reports.tsx
- 소울 편집기: packages/app/src/components/settings/soul-editor.tsx

### References

- [Source: packages/app/src/pages/reports.tsx:430] — 인라인 마크다운 스타일
- [Source: packages/app/src/components/settings/soul-editor.tsx:200] — prose 마크다운 미리보기
- [Source: packages/ui/src/empty-state.tsx] — EmptyState 공유 컴포넌트
- [Source: _bmad-output/implementation-artifacts/6-5-*.md] — UI Phase D 패턴 참조

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes List
- Task 1: MarkdownRenderer를 app 패키지 내부에 구현 (react-markdown이 app 전용 의존성)
- Task 2: reports.tsx 인라인 CSS 287자 → MarkdownRenderer 1줄 교체, 번들 0.25KB 절감
- Task 3: soul-editor.tsx prose 클래스 → MarkdownRenderer, import Markdown 제거
- Task 4: EmptyState import + Card+div 교체 → 탭별 메시지 + description 분기
- Task 5: turbo build 3/3 성공

### File List
- packages/app/src/components/markdown-renderer.tsx (NEW — 공유 마크다운 렌더러)
- packages/app/src/pages/reports.tsx (MODIFIED — MarkdownRenderer + EmptyState)
- packages/app/src/components/settings/soul-editor.tsx (MODIFIED — MarkdownRenderer)
