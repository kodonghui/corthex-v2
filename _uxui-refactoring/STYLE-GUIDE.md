# CORTHEX v2 — Design System & Style Guide

> AI-Agent 기반 기업 운영 플랫폼. 프리미엄, 데이터 밀도 높은 다크 SaaS 대시보드.
> "Linear meets Vercel Dashboard" — 깔끔하지만 정보가 풍부한 인터페이스.

---

## Design Philosophy

**DARK. DENSE. DECISIVE.**

1. **Dark-first**: 밝은 모드 없음. 깊은 slate 배경 위에 높은 대비 텍스트.
2. **Gradient Identity**: 각 도메인에 고유 그래디언트 색상 부여 (blue/violet/cyan/amber/emerald)
3. **Data-Dense but Breathable**: 정보가 많지만 여백으로 숨 쉴 수 있게
4. **Glow & Depth**: backdrop-blur, colored shadows, subtle glow 효과로 깊이감
5. **No Emoji Icons**: SVG 아이콘만 사용. 이모지는 데이터 표시용으로만 허용.
6. **Pill Badges**: 상태/카운트는 항상 `rounded-full` 필 뱃지로 표현

---

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 3.x (유틸리티 클래스 직접 사용, CSS-in-JS 없음)
- **Icons**: Heroicons-style inline SVG (라이브러리 의존 없이 직접 삽입)
- **Animation**: Tailwind `transition-all`, `animate-pulse`, CSS `@keyframes`
- **Charts**: div 기반 (recharts/tremor 미사용)
- **State**: Zustand + TanStack Query

---

## 🎨 Color System

### Page Background Gradient
```
bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
```
모든 페이지의 최상위 배경. 아래로 갈수록 약간 더 어두워짐.

### Surface Hierarchy (4단계)
| Level | Tailwind | Hex | 용도 |
|-------|----------|-----|------|
| Base | `bg-slate-900` | `#0f172a` | 페이지 배경 |
| Elevated | `bg-slate-800/40` | `#1e293b` 40% | 카드, 패널 |
| Raised | `bg-slate-800` | `#1e293b` | 호버 상태, 활성 항목 |
| Overlay | `bg-black/60 backdrop-blur-sm` | — | 모달 배경 |

### Domain Gradient Cards (핵심 차별점!)
각 도메인/카테고리마다 고유 색상 그래디언트:

| 도메인 | 그래디언트 | 보더 | 아이콘 배경 | 텍스트 |
|--------|-----------|------|-------------|--------|
| 작업/태스크 | `from-blue-600/20 via-slate-800 to-slate-800` | `border-blue-500/20` | `bg-blue-500/20` | `text-blue-400` |
| 비용/예산 | `from-violet-600/20 via-slate-800 to-slate-800` | `border-violet-500/20` | `bg-violet-500/20` | `text-violet-400` |
| 에이전트 | `from-cyan-600/20 via-slate-800 to-slate-800` | `border-cyan-500/20` | `bg-cyan-500/20` | `text-cyan-400` |
| 연동/시스템 | `from-amber-600/20 via-slate-800 to-slate-800` | `border-amber-500/20` | `bg-amber-500/20` | `text-amber-400` |
| 성공/완료 | `from-emerald-600/20 via-slate-800 to-slate-800` | `border-emerald-500/20` | `bg-emerald-500/20` | `text-emerald-400` |
| 위험/에러 | `from-red-600/20 via-slate-800 to-slate-800` | `border-red-500/20` | `bg-red-500/20` | `text-red-400` |

**사용법**: 카드에 `bg-gradient-to-br` 적용 + 오른쪽 상단에 장식용 원:
```html
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 via-slate-800 to-slate-800 border border-blue-500/20 p-6 group">
  <!-- 장식용 원 -->
  <div class="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-colors" />
  <div class="relative">
    <!-- 내용 -->
  </div>
</div>
```

### Text Colors
| 용도 | Tailwind | Hex |
|------|----------|-----|
| Primary (제목, 숫자) | `text-white` | `#ffffff` |
| Secondary (본문) | `text-slate-300` | `#cbd5e1` |
| Tertiary (보조) | `text-slate-400` | `#94a3b8` |
| Muted (캡션) | `text-slate-500` | `#64748b` |
| Disabled | `text-slate-600` | `#475569` |

### Semantic Colors (상태)
| 상태 | Dot | Badge BG | Text |
|------|-----|----------|------|
| 성공/온라인 | `bg-emerald-400 animate-pulse` | `bg-emerald-500/10` | `text-emerald-400` |
| 진행중/작업 | `bg-blue-400 animate-pulse` | `bg-blue-500/10` | `text-blue-400` |
| 경고/대기 | `bg-amber-400` | `bg-amber-500/10` | `text-amber-400` |
| 에러/실패 | `bg-red-400` | `bg-red-500/10` | `text-red-400` |
| 비활성/오프 | `bg-slate-500` | `bg-slate-500/10` | `text-slate-500` |

### Border Colors
| 용도 | Tailwind |
|------|----------|
| 카드 기본 | `border-slate-700/50` |
| 카드 호버 | `hover:border-slate-600` |
| 분할선 | `border-slate-700/40` |
| 도메인 카드 | `border-{color}-500/20` |
| 도메인 호버 | `hover:border-{color}-500/40` |
| 입력 필드 | `border-slate-600/80` |
| 입력 포커스 | `focus:border-blue-500` |

---

## 📝 Typography

### Font Stack
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
/* 별도 폰트 미설치. Tailwind 기본 sans 사용. */
/* 모노스페이스: font-mono (Menlo, Monaco, Consolas) */
```

### Scale
| Element | Tailwind Class | 용도 | 예시 |
|---------|---------------|------|------|
| Display | `text-4xl font-black tracking-tight` | 핵심 KPI 숫자 | "4,231" |
| Page Title | `text-3xl font-black tracking-tight text-white` | 페이지 제목 | "작전현황" |
| Section Label | `text-xs font-semibold uppercase tracking-widest text-{color}-400/80` | 섹션 라벨 | "에이전트" |
| Card Title | `text-base font-semibold text-white` | 카드/차트 제목 | "AI 사용량" |
| Body | `text-sm text-slate-300` | 일반 본문 | 설명 텍스트 |
| Caption | `text-xs text-slate-500` | 부가 정보 | 날짜, ID |
| Mono | `text-xs font-mono text-slate-400` | 숫자, 코드 | "$12.50" |
| Badge | `text-xs font-medium` | 뱃지 텍스트 | "3 완료" |

### 핵심 규칙
- 페이지 제목은 항상 `font-black` (900) — 일반 bold(700)가 아님
- KPI 숫자는 `text-4xl font-black` — 카드에서 가장 눈에 띄어야 함
- 섹션 라벨은 `uppercase tracking-widest` — 조용하지만 구조적
- `tracking-tight`은 큰 텍스트에만 (3xl 이상)

---

## 📐 Spacing System

### Page Layout
| 영역 | Tailwind |
|------|----------|
| 페이지 패딩 | `px-8 py-6` |
| 섹션 간격 | `space-y-6` |
| 헤더 하단 보더 | `border-b border-slate-800/80` |
| 스크롤 바닥 여백 | `pb-12` |

### Card Internal
| 영역 | Tailwind |
|------|----------|
| 카드 패딩 | `p-6` |
| 아이콘~라벨 간격 | `gap-3` |
| 라벨~숫자 간격 | `mb-4` |
| 뱃지 그룹 간격 | `gap-3` |
| 리스트 아이템 | `py-3.5 px-6` |

### Grid System
| 레이아웃 | Tailwind |
|---------|----------|
| 요약 카드 4개 | `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5` |
| 차트 2열 | `grid grid-cols-1 lg:grid-cols-2 gap-5` |
| 에이전트 그리드 | `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4` |
| 퀵 액션 | `grid grid-cols-1 sm:grid-cols-2 gap-3` 또는 `sm:grid-cols-3` |

---

## 🧩 Component Patterns

### 1. Gradient Summary Card (핵심 컴포넌트)
페이지 상단에 핵심 KPI를 보여주는 카드. 모든 데이터 페이지에서 사용.

```html
<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-{color}-600/20 via-slate-800 to-slate-800 border border-{color}-500/20 p-6 hover:border-{color}-500/40 transition-all duration-300 group"
     role="region" aria-label="카드 제목">
  <!-- 장식 원 -->
  <div class="absolute top-0 right-0 w-32 h-32 bg-{color}-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-{color}-500/10 transition-colors" />
  <div class="relative">
    <!-- 아이콘 + 라벨 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="w-10 h-10 rounded-xl bg-{color}-500/20 flex items-center justify-center">
        <svg class="w-5 h-5 text-{color}-400" ...><!-- SVG icon --></svg>
      </div>
      <span class="text-xs font-semibold uppercase tracking-widest text-{color}-400/80">라벨</span>
    </div>
    <!-- KPI 숫자 -->
    <p class="text-4xl font-black text-white mb-4 tracking-tight">1,234</p>
    <!-- 하단 뱃지들 -->
    <div class="flex items-center gap-3 text-xs">
      <span class="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 12 완료
      </span>
    </div>
  </div>
</div>
```

### 2. Chart/Content Panel
```html
<div class="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6 backdrop-blur-sm">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="text-base font-semibold text-white">차트 제목</h3>
      <p class="text-xs text-slate-500 mt-0.5">부가 설명</p>
    </div>
    <button class="text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-all border border-slate-600/50">
      액션
    </button>
  </div>
  <!-- 차트/콘텐츠 -->
</div>
```

### 3. Data Table
```html
<div class="rounded-2xl bg-slate-800/40 border border-slate-700/50 overflow-hidden backdrop-blur-sm">
  <table class="w-full">
    <thead>
      <tr class="border-b border-slate-700/60">
        <th class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">
          컬럼명
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-700/30">
      <tr class="hover:bg-slate-800/40 transition-colors cursor-pointer group">
        <td class="px-6 py-4">
          <span class="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
            데이터
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 4. Status Pill Badge
```html
<!-- 성공 -->
<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
  활성
</span>

<!-- 에러 -->
<span class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">
  <span class="w-1.5 h-1.5 rounded-full bg-red-400" />
  에러
</span>
```

### 5. Primary Button
```html
<button class="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30">
  <svg class="w-4 h-4" ...><!-- icon --></svg>
  버튼 텍스트
</button>
```

### 6. Secondary/Ghost Button
```html
<!-- Secondary -->
<button class="px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/60 transition-all">
  취소
</button>

<!-- Ghost Toggle -->
<button class="text-xs px-3 py-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 transition-all border border-slate-600/50 hover:border-slate-500/50">
  7일 보기
</button>
```

### 7. Form Input
```html
<div>
  <label class="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
    라벨
  </label>
  <input class="w-full px-3 py-2.5 border border-slate-600/80 rounded-xl bg-slate-800/80 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all placeholder-slate-500"
    placeholder="입력..." />
</div>
```

### 8. Modal
```html
<!-- 배경 -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
  <!-- 모달 바디 -->
  <div class="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700/60 shadow-2xl w-full max-w-md mx-4">
    <!-- 헤더 -->
    <div class="px-6 py-5 border-b border-slate-700/40 flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-{color}-500/15 flex items-center justify-center">
        <svg class="w-5 h-5 text-{color}-400" .../>
      </div>
      <h2 class="text-lg font-bold text-white">모달 제목</h2>
    </div>
    <!-- 본문 -->
    <div class="px-6 py-5">...</div>
    <!-- 푸터 -->
    <div class="flex justify-end gap-3 px-6 py-5 border-t border-slate-700/40">
      <button class="px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/60 transition-all">취소</button>
      <button class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20">확인</button>
    </div>
  </div>
</div>
```

### 9. Slide Panel (상세 패널)
```html
<div class="fixed inset-0 z-50 flex items-start justify-end bg-black/60 backdrop-blur-sm">
  <div class="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-l border-slate-700/60 shadow-2xl h-full w-full max-w-2xl overflow-y-auto">
    <!-- 헤더: sticky -->
    <div class="flex items-center justify-between px-6 py-5 border-b border-slate-700/60 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
      ...
    </div>
    <!-- 탭 바 -->
    <div class="flex border-b border-slate-700/60 px-6">
      <button class="px-4 py-3.5 text-sm font-medium border-b-2 border-blue-500 text-blue-400">활성 탭</button>
      <button class="px-4 py-3.5 text-sm font-medium border-b-2 border-transparent text-slate-500 hover:text-slate-300">비활성 탭</button>
    </div>
    <!-- 콘텐츠 -->
    <div class="px-6 py-6">...</div>
  </div>
</div>
```

### 10. Skeleton Loading
```html
<!-- 카드 스켈레톤 -->
<div class="rounded-2xl bg-slate-800/40 border border-slate-700/50 p-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-xl bg-slate-700/50 animate-pulse" />
    <div class="h-3 w-16 bg-slate-700/50 animate-pulse rounded" />
  </div>
  <div class="h-10 w-20 bg-slate-700/50 animate-pulse rounded mb-4" />
  <div class="flex gap-2">
    <div class="h-6 w-16 bg-slate-700/30 animate-pulse rounded-full" />
    <div class="h-6 w-16 bg-slate-700/30 animate-pulse rounded-full" />
  </div>
</div>
```

### 11. Empty State
```html
<div class="rounded-2xl bg-slate-800/30 border border-slate-700/40 p-16 text-center backdrop-blur-sm">
  <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4">
    <svg class="w-8 h-8 text-slate-600" .../>
  </div>
  <p class="text-sm text-slate-400 font-medium">데이터가 없습니다</p>
  <p class="text-xs text-slate-600 mt-1">부가 설명</p>
</div>
```

### 12. Error State
```html
<div class="flex flex-col items-center justify-center py-24">
  <div class="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
    <svg class="w-8 h-8 text-slate-600" ...><!-- warning icon --></svg>
  </div>
  <p class="text-base font-medium text-slate-300">데이터를 불러올 수 없습니다</p>
  <p class="text-sm text-slate-600 mt-1">잠시 후 자동으로 재시도합니다</p>
</div>
```

### 13. WS/Connection Status Pill
```html
<!-- 연결됨 -->
<span class="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 실시간 연결됨
</span>

<!-- 끊김 -->
<span class="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
  <span class="w-2 h-2 rounded-full bg-red-400" /> 연결 끊김
</span>
```

### 14. Progress Bar
```html
<div class="h-3 bg-slate-700/60 rounded-full overflow-hidden">
  <div class="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 to-teal-400"
       style="width: 65%"
       role="progressbar" />
</div>
```

---

## 🎯 Page Layout Templates

### Template A: Dashboard / Overview (데이터 중심)
```
┌─────────────────────────────────────────────────────┐
│ Header: text-3xl font-black    [Status Pill]        │
│ Subtitle: text-sm text-slate-500                    │
├─────────────────────────────────────────────────────┤
│ [Summary Card 1] [Card 2] [Card 3] [Card 4]        │  ← 4-col gradient cards
├─────────────────────────┬───────────────────────────┤
│ Chart Panel             │ Stats Panel               │  ← 2-col panels
├─────────────────────────┴───────────────────────────┤
│ [Quick Actions]         [Secondary Widget]          │  ← 2-col panels
└─────────────────────────────────────────────────────┘
```

### Template B: List / Management (CRUD 테이블)
```
┌─────────────────────────────────────────────────────┐
│ Header: text-3xl font-black    [+ Create Button]    │
│ Count: text-sm font-mono                            │
├─────────────────────────────────────────────────────┤
│ [Search] [Filter 1] [Filter 2] [Filter 3]          │  ← filter bar
├─────────────────────────────────────────────────────┤
│ ┌───┬─────────┬────────┬────────┬──────┬──────┐    │
│ │ # │ Name    │ Col 2  │ Col 3  │Status│Action│    │  ← data table
│ ├───┼─────────┼────────┼────────┼──────┼──────┤    │
│ │   │         │        │        │      │      │    │
│ └───┴─────────┴────────┴────────┴──────┴──────┘    │
└─────────────────────────────────────────────────────┘
  → Row click: Slide Panel from right (Template D)
```

### Template C: Split View (채팅/커맨드센터)
```
┌─────────────────────────────────────────────────────┐
│ Pipeline / Status Bar                               │
├──────────────────┬──────────────────────────────────┤
│ Thread List      │ Detail / Viewer                  │
│ (w-[420px])      │ (flex-1)                         │
│                  │                                  │
├──────────────────┴──────────────────────────────────┤
│ Input Bar (pinned bottom)                           │
└─────────────────────────────────────────────────────┘
  Mobile: tab bar switching between left/right
```

### Template D: Slide Panel (상세 보기)
```
                              ┌────────────────────────┐
                              │ Header + Close btn     │ ← sticky
                              ├────────────────────────┤
                              │ [Tab 1] [Tab 2] [Tab3] │
                              ├────────────────────────┤
                              │ Tab Content            │
                              │                        │
                              │                        │
                              ├────────────────────────┤
                              │ Footer Actions         │
                              └────────────────────────┘
```

---

## 📱 Responsive Strategy

### Breakpoints
| Name | Width | 전략 |
|------|-------|------|
| Mobile | `< 768px` | 싱글 컬럼, 탭 네비, 하단 액션 |
| Tablet | `768px - 1024px` | 2-col 그리드, 접이식 사이드바 |
| Desktop | `> 1024px` | 4-col 카드, multi-panel 레이아웃 |

### 반응형 패턴
```html
<!-- 4-col → 2-col → 1-col -->
grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5

<!-- 2-col → 1-col -->
grid grid-cols-1 lg:grid-cols-2 gap-5

<!-- Split view: 숨김/표시 전환 -->
<div class="hidden md:flex">  <!-- 데스크톱만 -->
<div class="flex md:hidden">  <!-- 모바일만 -->
```

---

## ⚡ Animation & Transitions

### Standard Transitions
| 대상 | Tailwind |
|------|----------|
| 카드 호버 | `transition-all duration-300` |
| 버튼 호버 | `transition-all duration-200` |
| 색상 변화 | `transition-colors` |
| 그림자 변화 | `hover:shadow-lg hover:shadow-{color}-500/5` |
| 차트 바 | `transition-all duration-500` |
| 프로그레스 바 | `transition-all duration-700` |

### Micro-interactions
- **카드 호버**: 보더 색상 밝아짐 (`/20` → `/40`)
- **장식 원 호버**: 투명도 증가 (`/5` → `/10`)
- **테이블 행 호버**: 텍스트 색상 변화 (`text-white` → `text-blue-300`)
- **상태 점**: 활성 상태는 `animate-pulse`
- **스피너**: `border-2 border-slate-600 border-t-{color}-400 rounded-full animate-spin`

### Loading States
- 스켈레톤: `bg-slate-700/50 animate-pulse rounded`
- 스켈레톤 (약한): `bg-slate-700/30 animate-pulse rounded-full`

---

## ♿ Accessibility

### 필수 규칙
1. **ARIA labels**: 모든 region에 `role="region" aria-label="..."`
2. **키보드 내비게이션**: 클릭 가능한 카드에 `tabIndex={0}` + `onKeyDown`
3. **색상 대비**: slate-50 on slate-900 = 15.4:1 (WCAG AAA 통과)
4. **포커스 링**: `focus:ring-2 focus:ring-blue-500/50 focus:outline-none`
5. **차트**: `role="img" aria-label="설명"` + 툴팁
6. **프로그레스**: `role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={100}`
7. **모달**: `backdrop-blur-sm` + `onClick` 배경 닫기

---

## 🔑 Icon System

모든 아이콘은 인라인 SVG. 라이브러리 의존 없음.

### 아이콘 규격
| 위치 | 크기 | 컨테이너 |
|------|------|----------|
| 요약 카드 | `w-5 h-5` | `w-10 h-10 rounded-xl bg-{color}-500/20` |
| 테이블 행 | `w-4 h-4` | `w-9 h-9 rounded-xl bg-{color}-500/15` |
| 버튼 내 | `w-4 h-4` | 없음 (인라인) |
| 빈 상태 | `w-8 h-8` | `w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700` |
| 닫기 버튼 | `w-5 h-5` | `w-8 h-8 rounded-lg hover:bg-slate-800` |

### 공통 아이콘 패턴
```html
<!-- stroke 아이콘 (대부분) -->
<svg class="w-5 h-5 text-{color}-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5 또는 2}>
  <path strokeLinecap="round" strokeLinejoin="round" d="..." />
</svg>

<!-- fill 아이콘 (특수: 잠금, 경고) -->
<svg class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
  <path fillRule="evenodd" d="..." clipRule="evenodd" />
</svg>
```

---

## 🚫 Anti-Patterns (절대 하지 말 것)

| 금지 | 이유 | 대안 |
|------|------|------|
| 이모지 아이콘 (`💬`, `🔔`) | 프로페셔널하지 않음 | SVG 아이콘 |
| `rounded-lg` 카드 | 너무 각짐 | `rounded-2xl` |
| `bg-slate-800/50` 카드 (flat) | 단조로움, 깊이감 없음 | gradient + backdrop-blur |
| 단색 보더 (`border-slate-700`) | 무거움 | `border-slate-700/50` (반투명) |
| `text-2xl` 페이지 제목 | 작음 | `text-3xl font-black` |
| `font-bold` 페이지 제목 | 약함 | `font-black` (900) |
| 색상 없는 카드 | 구분 안 됨 | domain gradient 적용 |
| 텍스트만 있는 상태 표시 | 시인성 낮음 | pill badge + dot |
| `dark:` prefix 사용 | 다크모드만 사용 | `dark:` 없이 직접 다크 색상 |
| StatusDot 컴포넌트 import | 외부 의존 | 인라인 span dot |

---

## 📊 Domain Color Mapping (42 Pages)

| 페이지 | 메인 색상 | 이유 |
|--------|----------|------|
| command-center | `blue` | 핵심 명령 = primary |
| chat | `blue` | 커뮤니케이션 |
| dashboard | `multi` (blue/violet/cyan/amber) | 4가지 KPI |
| trading | `emerald` | 금융/수익 |
| agora | `violet` | 토론/창의 |
| nexus | `cyan` | 연결/그래프 |
| agents | `cyan` | AI 에이전트 |
| departments | `amber` | 조직 |
| credentials | `red` | 보안 |
| sns | `violet` | 소셜 미디어 |
| messenger | `blue` | 메시지 |
| ops-log | `slate` | 로그 |
| reports | `emerald` | 성과 |
| jobs | `violet` | 야간 작업 |
| knowledge | `cyan` | 지식 |
| files | `amber` | 파일 |
| costs | `violet` | 비용 |
| activity-log | `slate` | 활동 로그 |
| workflows | `blue` | 워크플로우 |
| tools | `amber` | 도구 |
| home | `multi` | 인사말 + 팀 |
| settings | `slate` | 설정 |
| notifications | `amber` | 알림 |
| monitoring | `emerald` | 모니터링 |

---

## ✅ Design Review Checklist

모든 페이지 리디자인 시 반드시 확인:

- [ ] 페이지 배경이 `bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950`인가?
- [ ] 제목이 `text-3xl font-black tracking-tight text-white`인가?
- [ ] 핵심 KPI가 gradient summary card로 표현되는가?
- [ ] 카드가 `rounded-2xl` + `backdrop-blur-sm`인가?
- [ ] 상태가 pill badge (dot + text + rounded-full)로 표시되는가?
- [ ] 이모지 아이콘 대신 SVG 아이콘을 사용하는가?
- [ ] 도메인 색상이 올바르게 적용되었는가?
- [ ] Loading skeleton이 있는가?
- [ ] Empty state가 있는가?
- [ ] Error state가 있는가?
- [ ] 모바일 반응형이 적용되었는가?
- [ ] 기존 data-testid가 보존되었는가?
- [ ] 기능 로직(API 호출, 상태관리)이 100% 동일한가?

---

*이 스타일 가이드는 살아있는 문서입니다. 새로운 패턴이 발견되면 업데이트합니다.*
*Generated by LibreUIUX Premium SaaS Design Framework for CORTHEX v2.*
