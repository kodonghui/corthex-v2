# Story 4.7: Chat Mobile Optimize

Status: done

## Story

As a 일반 직원(유저),
I want 채팅 화면이 모바일에서 터치 친화적이고 반응형으로 최적화된다,
so that 스마트폰에서도 데스크톱과 동일한 수준의 채팅 경험을 제공받는다.

## Acceptance Criteria

1. **Given** 모바일(md 이하) 세션 패널 **When** 세션 메뉴(···) 버튼 **Then** 호버 없이도 항상 접근 가능 (터치 대응)
2. **Given** 모바일 채팅 입력 **When** 키보드가 올라옴 **Then** 입력 영역이 가려지지 않고, safe area가 적용됨
3. **Given** 모바일 채팅 **When** 메시지 스크롤 **Then** iOS momentum 스크롤이 부드럽게 동작
4. **Given** 모바일 전체 **When** 버튼/터치 요소 **Then** 최소 44px 탭 타겟 확보
5. **Given** 모바일 뒤로가기 **When** `← 대화 목록` 버튼 클릭 **Then** 세션 목록으로 복귀 (충분한 탭 영역)
6. **Given** 모든 모바일 변경 **When** 데스크톱 사용 시 **Then** 기존 데스크톱 레이아웃에 영향 없음

## Tasks / Subtasks

- [x] Task 1: 세션 패널 모바일 터치 최적화 (AC: #1, #4)
  - [x] 세션 메뉴(···) 버튼: `opacity-0 group-hover:opacity-100` → 모바일에서 항상 표시 (`md:opacity-0 md:group-hover:opacity-100 opacity-100`)
  - [x] 세션 메뉴 버튼 탭 영역 확대: `px-1` → `p-2` (최소 44px 확보)
  - [x] 세션 아이템 title 최대폭: `max-w-[160px]` → 컨테이너 기반 유동 (truncate만 유지)
- [x] Task 2: 채팅 입력 영역 모바일 최적화 (AC: #2, #4)
  - [x] 입력 영역에 safe area inset 적용: `pb-[max(1rem,env(safe-area-inset-bottom))]`
  - [x] 전송/중지 버튼 높이: `py-2.5` → `py-3` (44px 이상 확보)
  - [x] 뒤로가기(← 대화 목록) 버튼 탭 영역 확대: p-2 + active 상태 + "대화 목록" 텍스트 추가
- [x] Task 3: 스크롤 및 메시지 영역 최적화 (AC: #3, #5)
  - [x] 채팅 메시지 스크롤 영역에 iOS momentum 스크롤 적용
  - [x] 세션 패널 스크롤 영역에도 동일 적용
  - [x] 스크롤 임계값: 하드코딩 100px → `Math.max(100, clientHeight * 0.15)`
- [x] Task 4: Layout safe area 적용 (AC: #2)
  - [x] index.html: viewport meta에 `viewport-fit=cover` 추가
  - [x] 모바일 헤더(Layout): `pt-[env(safe-area-inset-top)]` 적용
  - [x] Tailwind arbitrary value로 env() 사용 (별도 설정 불필요)
- [x] Task 5: 빌드 + 기존 테스트 통과 확인 (AC: #6)
  - [x] `turbo build` 3/3 성공
  - [x] `bun test src/__tests__/unit/` 전체 통과 (69 pass, 0 fail)

## Dev Notes

### 핵심: 모바일 터치 최적화 + safe area

기존 채팅 UI의 반응형 기반은 `md:` 브레이크포인트로 잘 구현되어 있음 (showChat 토글, 패딩 반응형). 이 스토리는 터치 접근성, safe area, iOS 스크롤 등 모바일 네이티브 경험을 보강하는 작업.

### 현재 상태 분석

**잘 되어 있는 것:**
- `chat.tsx`: `showChat` 상태로 세션 목록/채팅 전환 (md 이하)
- `chat-area.tsx`: 패딩 반응형 (`px-4 md:px-6`)
- 메시지 버블 폭: `max-w-[80%] md:max-w-[70%]`
- Modal: 포털 기반, ESC/배경 클릭
- PWA manifest, viewport meta 기본 설정 완료

**수정이 필요한 것:**
- 세션 메뉴(···) 버튼: `opacity-0 group-hover:opacity-100` → 모바일에서 터치 불가
- 버튼 탭 타겟: 일부 `px-1` (16px) → 44px 미달
- safe area inset 미적용 (노치/홈 인디케이터)
- iOS momentum 스크롤 미적용
- 스크롤 임계값 하드코딩

### Task 1: 세션 메뉴 터치 패턴

기존:
```tsx
// session-panel.tsx:212
className="absolute right-1 top-2 opacity-0 group-hover:opacity-100 ... text-xs px-1"
```

변경:
```tsx
className="absolute right-1 top-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 ... text-xs p-2"
```

모바일에서 항상 보이고, 데스크톱에서는 hover 시에만 보임. 탭 영역 `p-2`로 확대.

### Task 2: 입력 영역 safe area

```tsx
// chat-area.tsx 입력 영역
<div className="px-4 md:px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t ...">
```

`max()` CSS 함수로 기본 패딩(1rem)과 safe area 중 큰 값 적용.

전송/중지 버튼:
```tsx
// 기존: py-2.5 (~40px 높이)
// 변경: py-3 (~48px 높이, 44px 최소 충족)
```

### Task 3: iOS 스크롤 + 임계값

```tsx
// 스크롤 영역에 추가
className="... [&]:[-webkit-overflow-scrolling:touch]"
// 또는 Tailwind arbitrary: [-webkit-overflow-scrolling:touch]
```

스크롤 임계값:
```tsx
// 기존: scrollTop < 100
// 변경: scrollTop < el.clientHeight * 0.15
```

### Task 4: viewport-fit=cover

```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Layout 헤더:
```tsx
// 모바일 헤더에 safe area top 적용
className="... pt-[env(safe-area-inset-top)]"
```

주의: `viewport-fit=cover`가 없으면 `env(safe-area-inset-*)` 값이 항상 0. 반드시 viewport meta에 추가해야 함.

### 기존 코드 위치

- `packages/app/src/pages/chat.tsx` — 채팅 페이지 레이아웃, showChat 토글
- `packages/app/src/components/chat/chat-area.tsx:459-472` — 입력 영역
- `packages/app/src/components/chat/chat-area.tsx:302` — 메시지 스크롤 컨테이너
- `packages/app/src/components/chat/session-panel.tsx:142` — 세션 스크롤 컨테이너
- `packages/app/src/components/chat/session-panel.tsx:208-214` — 메뉴 버튼
- `packages/app/src/components/layout.tsx` — 모바일 헤더
- `packages/app/index.html` — viewport meta

### Project Structure Notes

```
packages/app/
├── index.html                              ← viewport-fit=cover 추가
├── src/
│   ├── pages/chat.tsx                      ← 뒤로가기 버튼 탭 영역
│   ├── components/
│   │   ├── layout.tsx                      ← safe area top
│   │   └── chat/
│   │       ├── chat-area.tsx               ← 입력 safe area, 버튼 크기, 스크롤
│   │       └── session-panel.tsx           ← 메뉴 터치, 스크롤
```

### References

- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#10.4] — 채팅 모바일 특수 케이스
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#5.2] — 반응형 브레이크포인트
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#2156-2185] — PWA 사양
- [Source: packages/app/src/components/chat/session-panel.tsx:208-214] — 메뉴 버튼 (hover 문제)
- [Source: packages/app/src/components/chat/chat-area.tsx:459] — 입력 영역
- [Source: packages/app/index.html] — viewport meta

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Completion Notes List

- 세션 메뉴(···) 버튼: 모바일에서 항상 보이도록 변경, 탭 영역 p-2로 확대
- 세션 title max-w-[160px] 하드코딩 제거 → 컨테이너 기반 truncate
- 세션 패널 스크롤에 iOS momentum 적용
- 채팅 입력 영역에 safe area bottom inset 적용 (max 함수로 기본 패딩 보장)
- 전송/중지 버튼 py-2.5 → py-3 (44px 최소 탭 타겟)
- 뒤로가기 버튼 "← 대화 목록" 텍스트 + p-2 탭 영역 + active 상태 추가
- 채팅 메시지 스크롤 iOS momentum 적용
- 스크롤 임계값 viewport 비례로 변경 (Math.max(100, clientHeight * 0.15))
- index.html viewport-fit=cover 추가 (safe area inset 활성화 필수 조건)
- Layout 모바일 헤더에 safe area top inset 적용
- turbo build 3/3 성공, bun test 69 pass / 0 fail

### File List

- packages/app/src/components/chat/session-panel.tsx — 메뉴 터치, title 유동, 스크롤 momentum
- packages/app/src/components/chat/chat-area.tsx — 입력 safe area, 버튼 크기, 뒤로가기, 스크롤 momentum, 임계값
- packages/app/src/components/layout.tsx — safe area top
- packages/app/index.html — viewport-fit=cover
