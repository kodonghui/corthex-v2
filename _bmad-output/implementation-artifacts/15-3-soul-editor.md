# Story 15.3: Soul Editor (CodeMirror 업그레이드)

Status: done

## Story

As a workspace user (에이전트에 배정된 직원),
I want a CodeMirror-based markdown editor for soul editing with syntax highlighting and auto-indent,
so that I can write and format agent souls more easily with proper markdown tooling.

## Acceptance Criteria

1. **Given** `/settings?tab=soul` 진입 **When** SoulEditor 컴포넌트 로드 **Then** CodeMirror 마크다운 에디터가 `React.lazy()`로 동적 import되어 렌더링된다 (기존 Textarea 대체)
2. **Given** CodeMirror 에디터 **When** 마크다운 입력 (# 헤딩, **볼드**, `코드` 등) **Then** 구문 강조(syntax highlighting)가 실시간 적용된다
3. **Given** CodeMirror 에디터 **When** Enter 키로 줄바꿈 **Then** 자동 들여쓰기(auto-indent)가 적용된다 (리스트 항목 등)
4. **Given** 에디터 우하단 **When** 텍스트 입력/삭제 **Then** `XXX / 2000자` 실시간 카운터 표시. 2000자 초과 시 amber 색상
5. **Given** 데스크톱(md 이상) **When** 에디터 로드 **Then** 좌: CodeMirror 편집기 / 우: 마크다운 프리뷰 (50/50 분할)
6. **Given** 모바일(md 미만) **When** 에디터 로드 **Then** [편집][미리보기] 탭 전환 방식
7. **Given** 기존 기능 **When** 소울 저장/초기화/이탈방지/템플릿불러오기 **Then** 모든 기존 기능이 CodeMirror 에디터에서도 동일하게 작동
8. **Given** turbo build + type-check **When** 전체 빌드 **Then** 8/8 success

## Tasks / Subtasks

- [x] Task 1: CodeMirror 패키지 설치 (AC: #1, #2, #3)
  - [x] `packages/app/package.json`에 CodeMirror 의존성 추가:
    - `codemirror` (코어)
    - `@codemirror/lang-markdown` (마크다운 언어 지원)
    - `@codemirror/language` (언어 프레임워크)
    - `@codemirror/theme-one-dark` (다크 테마)
    - `@codemirror/view` (에디터 뷰)
    - `@codemirror/state` (에디터 상태)
  - [x] `bun install` 실행

- [x] Task 2: CodeMirror 래퍼 컴포넌트 생성 (AC: #1, #2, #3)
  - [x] `packages/app/src/components/codemirror-editor.tsx` 생성
  - [x] CodeMirror EditorView 초기화 (마크다운 언어 + 다크 테마)
  - [x] value/onChange 프롭으로 외부 상태 연동
  - [x] `React.lazy()`로 import할 수 있도록 default export

- [x] Task 3: SoulEditor에서 Textarea → CodeMirror 교체 (AC: #1, #4, #5, #6, #7)
  - [x] `packages/app/src/components/settings/soul-editor.tsx` 수정
  - [x] `React.lazy(() => import('../codemirror-editor'))` 사용
  - [x] Suspense fallback으로 기존 Textarea 스타일의 로딩 표시
  - [x] 글자 수 카운터는 CodeMirror 외부에 유지 (기존 로직 동일)
  - [x] 50/50 분할 레이아웃 유지 (좌: CodeMirror, 우: MarkdownRenderer)
  - [x] 모바일 탭 전환 유지
  - [x] 저장/초기화/이탈방지/템플릿불러오기 기존 기능 모두 동작 확인

- [x] Task 4: 빌드 검증 (AC: #8)
  - [x] `bunx turbo build type-check` → 8/8 success

## Dev Notes

### Existing Infrastructure (DO NOT re-implement)

1. **SoulEditor 컴포넌트** (`packages/app/src/components/settings/soul-editor.tsx`)
   - 현재 Textarea 기반의 완전한 에디터
   - 50/50 분할: 편집기 + MarkdownRenderer 프리뷰
   - 글자 수 카운터 (2000자)
   - useBlocker 이탈 방지
   - 소울 저장 (PATCH /workspace/agents/:id/soul)
   - 소울 초기화 (POST /workspace/agents/:id/soul/reset)
   - 템플릿 불러오기 (ConfirmDialog 포함) — Story 15-2에서 추가됨

2. **설정 페이지** (`packages/app/src/pages/settings.tsx`)
   - 탭 구조: API / 파일 / 매매 / 소울 / 알림
   - `?tab=soul` URL 파라미터로 소울 탭 직접 진입

3. **MarkdownRenderer** (`packages/app/src/components/markdown-renderer.tsx`)
   - react-markdown 기반 프리뷰 렌더러 (이미 사용 중)

4. **ConfirmDialog + Select + Textarea** (`@corthex/ui`)
   - 공유 UI 컴포넌트. Textarea는 CodeMirror로 교체

### CodeMirror 설치 가이드

```bash
cd packages/app
bun add codemirror @codemirror/lang-markdown @codemirror/language @codemirror/theme-one-dark @codemirror/view @codemirror/state
```

### CodeMirror 래퍼 패턴

```typescript
// packages/app/src/components/codemirror-editor.tsx
import { useRef, useEffect } from 'react'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { basicSetup } from 'codemirror'

// value, onChange, className props
// useRef + useEffect로 EditorView 초기화
// value 변경 시 dispatch로 동기화
// onChange는 updateListener로 연결
// 다크모드: oneDark 테마 적용 (시스템 테마 연동)
```

### Lazy Import 패턴

```typescript
// soul-editor.tsx 내부
const CodeMirrorEditor = React.lazy(() => import('../codemirror-editor'))

// JSX 내부
<Suspense fallback={<div className="border ... rounded-md p-3 min-h-[288px] animate-pulse bg-zinc-100 dark:bg-zinc-800" />}>
  <CodeMirrorEditor value={soulText} onChange={setSoulText} />
</Suspense>
```

### 다크모드 테마 전략

- 시스템/사용자 다크모드 설정은 `localStorage`의 theme 값으로 관리
- CodeMirror: `oneDark` 테마를 다크모드에서 사용
- 라이트모드: CodeMirror 기본 테마 (별도 import 불필요)
- 테마 전환 시 EditorView 재생성 또는 compartment로 동적 교체

### 보안 고려사항

- CodeMirror는 클라이언트 전용 — 서버 영향 없음
- XSS: 에디터 입력은 기존과 동일하게 서버에서 텍스트로 저장 (HTML 렌더링 없음)
- 프리뷰: react-markdown의 기존 sanitization 유지

### Project Structure Notes

- `packages/app/src/components/codemirror-editor.tsx` (신규 - CodeMirror 래퍼)
- `packages/app/src/components/settings/soul-editor.tsx` (수정 - Textarea → CodeMirror)
- `packages/app/package.json` (수정 - CodeMirror 의존성 추가)

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.14 소울 편집 탭] — CodeMirror 마크다운, lazy import, 50/50 레이아웃
- [Source: packages/app/src/components/settings/soul-editor.tsx] — 현재 Textarea 기반 에디터
- [Source: packages/app/src/pages/settings.tsx] — 설정 페이지 탭 구조
- [Source: packages/app/src/components/markdown-renderer.tsx] — 프리뷰 렌더러

### Previous Story Intelligence (15-2)

- Story 15-2에서 템플릿 불러오기 기능 추가됨 (ConfirmDialog + soulTemplates API)
- SoulEditor에 이미 soulTemplates.length > 0일 때 드롭다운 표시
- `pendingTemplate.content`로 `setSoulText()` 호출하는 패턴 — CodeMirror에서도 동일하게 작동해야 함
- Build: 8/8 success, 1152 tests pass

### Git Intelligence

Recent commits:
- `1625ffd` feat: Story 15-2 소울 템플릿 관리 — admin CRUD + workspace API + UI + TEA 43건
- `f2af5b1` feat: Story 15-1 P3 DB 스키마
- Commit 명명: `feat: Story X-Y 제목 — 변경 요약 + TEA N건`

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

### Completion Notes List

- Task 1: Installed 7 CodeMirror packages (codemirror, @codemirror/lang-markdown, @codemirror/language, @codemirror/theme-one-dark, @codemirror/view, @codemirror/state, @codemirror/commands)
- Task 2: Created CodeMirror wrapper component with markdown language, oneDark theme, line wrapping, dark mode auto-detection via MutationObserver, external value sync, and placeholder support
- Task 3: Replaced Textarea with React.lazy CodeMirrorEditor in SoulEditor. Added Suspense fallback. All existing features preserved (save, reset, blocker, template load, char counter, mobile tabs)
- Task 4: Build 8/8 success. CodeMirror lazy-loads as separate chunk (607KB / 208KB gzip). 1157 tests pass, 0 regressions.
- Code Review: Fixed themeCompartment singleton → instance ref, removed eslint-disable, fixed SSR default, fixed TS type errors in tests. 3 MEDIUM + 1 LOW issues resolved.
- TEA: 46 tests total (expanded from 18 during TEA phase)

### File List

- packages/app/package.json (modified - added 7 CodeMirror dependencies)
- packages/app/src/components/codemirror-editor.tsx (new - CodeMirror wrapper component)
- packages/app/src/components/settings/soul-editor.tsx (modified - Textarea to CodeMirror)
- packages/server/src/__tests__/unit/soul-editor.test.ts (new - 46 unit tests)
- bun.lock (modified - lockfile updated)
