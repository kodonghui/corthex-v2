# Story 1.5: @corthex/ui Phase A 컴포넌트 라이브러리

Status: done

## Story

As a 개발자,
I want admin/app 공통 UI 컴포넌트 라이브러리가 준비되어 있기를,
so that 모든 에픽에서 일관된 디자인 시스템으로 UI를 빠르게 개발할 수 있다.

## Acceptance Criteria

1. **Given** packages/ui / **When** `@corthex/ui`에서 컴포넌트 import / **Then** Phase A 8개 컴포넌트 모두 동작:
   - `Button` (variant: default/outline/ghost/destructive)
   - `Input`
   - `Badge` (variant: default/success/warning/error)
   - `Avatar` (이니셜 폴백)
   - `Spinner`
   - `Skeleton`
   - `Modal` (Overlay + ESC 닫기)
   - `Toast` (성공/오류/정보)
2. CVA(class-variance-authority) 기반 variant 시스템
3. 모든 컴포넌트 다크 모드 클래스(`dark:`) 지원
4. `transition-all duration-200` 애니메이션 적용
5. Skeleton 컴포넌트: 로딩 중 회색 펄스 애니메이션

## Tasks / Subtasks

- [x] Task 1: `Avatar` 컴포넌트 생성 (AC: #1)
  - [x] `packages/ui/src/avatar.tsx` 신규 생성
  - [x] props: `src?: string`, `alt?: string`, `name?: string` (이니셜 폴백용), `size?: 'sm'|'md'|'lg'`
  - [x] 이미지 있으면 `<img>`, 없으면 이름 첫 두 글자 이니셜 표시
  - [x] CVA size variants, dark mode 지원

- [x] Task 2: `Spinner` 컴포넌트 생성 (AC: #1)
  - [x] `packages/ui/src/spinner.tsx` 신규 생성
  - [x] SVG 원형 스피너 또는 `animate-spin` 기반
  - [x] size variants: sm/md/lg
  - [x] 다크 모드 지원

- [x] Task 3: `Modal` 컴포넌트 생성 (AC: #1)
  - [x] `packages/ui/src/modal.tsx` 신규 생성
  - [x] Overlay (반투명 backdrop) + 중앙 콘텐츠 카드
  - [x] ESC 키 누르면 `onClose()` 호출
  - [x] 오버레이 클릭 시 닫힘 (선택적 비활성화 가능)
  - [x] `transition-all duration-200` 진입/퇴장 애니메이션
  - [x] Portal(`createPortal`) 사용 → `document.body`에 렌더링
  - [x] props: `isOpen: boolean`, `onClose: () => void`, `title?: string`, `children: ReactNode`

- [x] Task 4: `Toast` 컴포넌트 생성 (AC: #1)
  - [x] `packages/ui/src/toast.tsx` 신규 생성
  - [x] variant: `success` (초록) / `error` (빨강) / `info` (파랑) / `warning` (노랑)
  - [x] 4초 후 자동 닫힘 또는 수동 `×` 버튼으로 닫힘
  - [x] 화면 우측 하단 고정 포지셔닝 (`fixed bottom-4 right-4`)
  - [x] `transition-all duration-200` 슬라이드-인 애니메이션
  - [x] `useToast` 훅 export: `toast.success()`, `toast.error()`, `toast.info()`

- [x] Task 5: `index.ts` 업데이트 (AC: #1)
  - [x] `Avatar`, `Spinner`, `Modal`, `Toast`, `useToast` export 추가

- [x] Task 6: 기존 컴포넌트 `transition-all duration-200` 검증 (AC: #4)
  - [x] `button.tsx`: `transition-colors` → `transition-all duration-200` 로 통일
  - [x] 기타 컴포넌트에도 `transition-all duration-200` 적용 확인

## Dev Notes

### ⚠️ 현재 코드베이스 상태

**이미 완성된 컴포넌트 (수정 불필요 또는 소폭 수정):**

| 컴포넌트 | 파일 | 상태 | 비고 |
|----------|------|------|------|
| `Button` | `button.tsx` | ✅ CVA variants 완성 | `transition-colors` → `transition-all duration-200` 변경 필요 |
| `Input` | `input.tsx` | ✅ 완성 | dark mode, error state 지원 |
| `Badge` | `badge.tsx` | ✅ CVA variants 완성 | default/success/warning/error/info/purple/amber |
| `Skeleton` | `skeleton.tsx` | ✅ `animate-pulse` 완성 | SkeletonCard, SkeletonTable 보너스 포함 |
| `Card` | `card.tsx` | ✅ 존재 | Phase A 스펙에 없지만 이미 구현됨 |
| `StatusDot` | `status-dot.tsx` | ✅ 존재 | Phase A 스펙에 없지만 유용 |
| `EmptyState` | `empty-state.tsx` | ✅ 존재 | Phase A 스펙에 없지만 유용 |

**신규 생성 필요한 컴포넌트:**

| 컴포넌트 | 파일 | 구현 가이드 |
|----------|------|-----------|
| `Avatar` | `avatar.tsx` | 이미지 or 이니셜 폴백 |
| `Spinner` | `spinner.tsx` | `animate-spin` SVG |
| `Modal` | `modal.tsx` | Portal + ESC + overlay |
| `Toast` | `toast.tsx` | fixed 포지션 + variant + 자동 닫힘 |

**CVA 사용 현황:**
- `class-variance-authority@^0.7` ✅ 설치됨
- `clsx@^2` + `tailwind-merge@^3` ✅ 설치됨
- `cn()` 유틸함수 ✅ `utils.ts`에 구현됨

### 컴포넌트 구현 예시

**Avatar:**
```typescript
// packages/ui/src/avatar.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full overflow-hidden font-medium select-none',
  {
    variants: {
      size: {
        sm: 'w-7 h-7 text-xs',
        md: 'w-9 h-9 text-sm',
        lg: 'w-12 h-12 text-base',
      },
    },
    defaultVariants: { size: 'md' },
  },
)

type AvatarProps = VariantProps<typeof avatarVariants> & {
  src?: string
  alt?: string
  name?: string
  className?: string
}

export function Avatar({ src, alt, name, size, className }: AvatarProps) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className={cn(avatarVariants({ size }), 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', className)}>
      {src ? (
        <img src={src} alt={alt ?? name ?? ''} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
```

**Spinner:**
```typescript
// packages/ui/src/spinner.tsx
import { cn } from './utils'

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin text-indigo-600 dark:text-indigo-400', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
```

**Modal:**
```typescript
// packages/ui/src/modal.tsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { cn } from './utils'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-all duration-200"
        onClick={onClose}
      />
      {/* Content */}
      <div className={cn(
        'relative z-10 bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4',
        'transition-all duration-200',
        className,
      )}>
        {title && (
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

**Toast (간단 구현 + useToast 훅):**
```typescript
// packages/ui/src/toast.tsx
import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from './utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'
type ToastItem = { id: string; message: string; variant: ToastVariant }

const variantStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-indigo-600 text-white',
  warning: 'bg-amber-500 text-white',
}

// useToast 훅 — 컴포넌트 트리 외부에서도 호출 가능하도록 모듈 레벨 상태 관리
let _addToast: ((message: string, variant: ToastVariant) => void) | null = null

export const toast = {
  success: (msg: string) => _addToast?.(msg, 'success'),
  error: (msg: string) => _addToast?.(msg, 'error'),
  info: (msg: string) => _addToast?.(msg, 'info'),
  warning: (msg: string) => _addToast?.(msg, 'warning'),
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  // 모듈 레벨 함수 등록
  _addToast = addToast

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
              'transition-all duration-200',
              variantStyles[t.variant],
            )}
          >
            {t.message}
            <button
              onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
```

> ⚠️ `ToastProvider`는 `packages/app/src/App.tsx`의 최상단(`QueryClientProvider` 안)에 감싸야 합니다.

### index.ts 업데이트

```typescript
// packages/ui/src/index.ts 최종
export { cn } from './utils'
export { Button } from './button'
export { Card, CardHeader, CardContent, CardFooter } from './card'
export { Badge } from './badge'
export { Input } from './input'
export { Skeleton, SkeletonCard, SkeletonTable } from './skeleton'
export { StatusDot } from './status-dot'
export { EmptyState } from './empty-state'
// Phase A 신규 추가
export { Avatar } from './avatar'
export { Spinner } from './spinner'
export { Modal } from './modal'
export { toast, ToastProvider } from './toast'
```

### Project Structure Notes

```
packages/ui/src/
├── utils.ts              ✅ cn() 유틸
├── button.tsx            ✅ CVA variants (transition-all 업데이트 필요)
├── badge.tsx             ✅ CVA variants
├── input.tsx             ✅ 완성
├── skeleton.tsx          ✅ animate-pulse 완성
├── card.tsx              ✅ 존재
├── status-dot.tsx        ✅ 존재
├── empty-state.tsx       ✅ 존재
├── avatar.tsx            ← 신규 생성
├── spinner.tsx           ← 신규 생성
├── modal.tsx             ← 신규 생성
├── toast.tsx             ← 신규 생성
└── index.ts              ← 4개 export 추가 필요
```

### 파일명 컨벤션

- `avatar.tsx`, `spinner.tsx`, `modal.tsx`, `toast.tsx` (kebab-case)
- export: PascalCase (`Avatar`, `Spinner`, `Modal`, `ToastProvider`, `toast`)

### References

- [Source: epics.md#Story 1.5] — Phase A 8개 컴포넌트 목록
- [Source: packages/ui/src/button.tsx] — CVA 패턴 참조 (Avatar/Badge에 동일 패턴)
- [Source: packages/ui/src/badge.tsx] — variant 패턴 참조
- [Source: packages/ui/src/skeleton.tsx] — animate-pulse 패턴 참조
- [Source: packages/ui/src/utils.ts] — cn() 유틸
- [Source: architecture.md] — UX 컴포넌트 Phase A-G 정의

## Dev Agent Record

### Agent Model Used

claude-opus-4-6

### Debug Log References

### Completion Notes List

- ✅ Task 1: Avatar — CVA size variants(sm/md/lg), 이미지 or 이니셜 폴백, dark mode
- ✅ Task 2: Spinner — SVG animate-spin, 3 sizes, dark mode
- ✅ Task 3: Modal — createPortal, ESC 닫기, overlay 클릭 닫기, transition-all
- ✅ Task 4: Toast — 4 variants, 4초 자동닫힘, × 수동닫힘, toast.success/error/info/warning
- ✅ Task 5: index.ts에 Avatar, Spinner, Modal, toast, ToastProvider export 추가
- ✅ Task 6: button.tsx/input.tsx transition-colors → transition-all duration-200 통일
- ✅ 빌드 성공, 테스트 65 pass (app:20 + server:41 + shared:4)

### Change Log

- 2026-03-05: Story 1.5 구현 완료 — Phase A 컴포넌트 4개 추가 + transition 통일

### File List

- packages/ui/src/avatar.tsx (신규 — Avatar 컴포넌트)
- packages/ui/src/spinner.tsx (신규 — Spinner 컴포넌트)
- packages/ui/src/modal.tsx (신규 — Modal 컴포넌트)
- packages/ui/src/toast.tsx (신규 — Toast + ToastProvider)
- packages/ui/src/index.ts (수정 — 4개 export 추가)
- packages/ui/src/button.tsx (수정 — transition-all duration-200)
- packages/ui/src/input.tsx (수정 — transition-all duration-200)
- packages/app/src/__tests__/ui-components.test.ts (신규 — Phase A export 테스트 6건)
