# CORTHEX v2 — Brand & Design Guide

> **Archetype**: Creator + THE WORLD × Magician + THE SUN
> **Style**: Swiss International Style + Flat Design 2.0
> **Masters**: Müller-Brockmann + Dieter Rams + Massimo Vignelli
> **Theme**: Light | Korean UI | Figma/Notion/Slack 영감

---

## 1. Brand Identity

**Brand Essence**: 코드 한 줄 없이, 나만의 AI 회사를 만들고 운영한다.

**Personality**: 친근한 · 명확한 · 신뢰할 수 있는 · 활력 있는 · 지적인

**Positioning**:
- For 비개발자 CEO/경영진
- Who AI 조직을 설계하고 운영하고 싶다
- CORTHEX는 AI 에이전트 조직 운영 SaaS
- That 자연어 명령 한 줄로 AI 팀이 실행한다
- Unlike ChatGPT(1:1), Zapier(규칙기반), AutoGPT(UI없음)
- We 코드 없이 설계하고, AI가 마법처럼 실행하는 완전한 조직 경험

---

## 2. Archetype & Mood

- **Primary**: Creator + THE WORLD — "나만의 AI 세계를 만든다" (바이올렛, 완성, 조화)
- **Secondary**: Magician + THE SUN — "AI가 태양처럼 실행한다" (오렌지, 활력, 성공)
- **Shadow**: Rebel — 혼란스럽고 예측 불가한 UI 금지

**Mood Keywords**: 완성(Completion) · 조화(Harmony) · 가능성(Possibility) · 활력(Vitality) · 신뢰(Trust)

---

## 3. Design Tokens

### 3-1. Colors

| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **primary-500** | `#8B5CF6` | `bg-violet-500 text-violet-500` | 메인 브랜드, 아이콘, 링크 |
| **primary-600** | `#7C3AED` | `bg-violet-600` | CTA 버튼 배경 |
| **primary-700** | `#6D28D9` | `bg-violet-700` | 버튼 Active/Pressed |
| primary-50 | `#F5F3FF` | `bg-violet-50` | 선택 상태 배경, 아이콘 컨테이너 |
| primary-100 | `#EDE9FE` | `bg-violet-100` | 호버 배경 |
| primary-200 | `#DDD6FE` | `bg-violet-200` | 비활성 배지 배경 |
| **accent-500** | `#F97316` | `bg-orange-500` | AI Working 상태, 퀵 액션 |
| accent-600 | `#EA580C` | `bg-orange-600` | Accent 버튼 Active |
| accent-50 | `#FFF7ED` | `bg-orange-50` | Working 배경 |
| **neutral-0** | `#FFFFFF` | `bg-white` | 카드, 모달, 사이드바 |
| **neutral-50** | `#FAFAF9` | `bg-stone-50` | 페이지 기본 배경 ★ |
| neutral-100 | `#F5F5F4` | `bg-stone-100` | 섹션 구분 배경 |
| neutral-200 | `#E7E5E4` | `bg-stone-200 border-stone-200` | 테두리, 구분선 ★ |
| neutral-400 | `#A8A29E` | `text-stone-400` | 플레이스홀더 (텍스트 아님) |
| neutral-500 | `#78716C` | `text-stone-500` | 도움말, 메타 |
| neutral-600 | `#57534E` | `text-stone-600` | 설명 텍스트 |
| **neutral-700** | `#44403C` | `text-stone-700` | 레이블 |
| **neutral-800** | `#292524` | `text-stone-800` | 본문 텍스트 ★ |
| **neutral-900** | `#1C1917` | `text-stone-900` | 제목 텍스트 ★ |
| success-500 | `#10B981` | `bg-emerald-500` | 완료, online 점 |
| success-50 | `#ECFDF5` | `bg-emerald-50` | 성공 배경 |
| success-700 | `#047857` | `text-emerald-700` | 성공 텍스트 |
| warning-500 | `#F59E0B` | `bg-amber-500` | 예산 경고 |
| warning-50 | `#FFFBEB` | `bg-amber-50` | 경고 배경 |
| warning-700 | `#B45309` | `text-amber-700` | 경고 텍스트 |
| error-500 | `#EF4444` | `bg-red-500` | 에러, 삭제 |
| error-50 | `#FEF2F2` | `bg-red-50` | 에러 배경 |
| error-700 | `#B91C1C` | `text-red-700` | 에러 텍스트 |
| info-500 | `#3B82F6` | `bg-blue-500` | 정보, 도움말 |
| info-50 | `#EFF6FF` | `bg-blue-50` | 정보 배경 |

**Agent Status Colors**:
| 상태 | 색상 | Tailwind | 특이사항 |
|------|------|----------|---------|
| online | `#10B981` | `bg-emerald-500` | 정적 점 |
| working | `#F97316` | `bg-orange-500` | `animate-pulse` |
| error | `#EF4444` | `bg-red-500` | 정적 점 |
| offline | `#A8A29E` | `bg-stone-400` | 정적 점 |

### 3-2. Typography Scale

**Google Fonts CDN**:
```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

| Level | Font | Size | Weight | Line-Height | Letter-Spacing | Tailwind |
|-------|------|------|--------|------------|----------------|----------|
| **Display** | Plus Jakarta Sans | 48px | 800 | 1.10 | -0.03em | `text-5xl font-extrabold leading-[1.1] tracking-tight` |
| **H1** | Plus Jakarta Sans | 32px | 700 | 1.20 | -0.02em | `text-[32px] font-bold leading-tight tracking-tight` |
| **H2** | Plus Jakarta Sans | 24px | 700 | 1.25 | -0.015em | `text-2xl font-bold leading-snug tracking-tight` |
| **H3** | Plus Jakarta Sans | 18px | 600 | 1.35 | -0.01em | `text-lg font-semibold leading-snug` |
| **H4** | Plus Jakarta Sans | 16px | 600 | 1.40 | 0em | `text-base font-semibold` |
| **Body L** | Inter | 16px | 400 | 1.70 | 0em | `text-base leading-7` |
| **Body** | Inter | 14px | 400 | 1.60 | 0em | `text-sm leading-relaxed` |
| **Caption** | Inter | 12px | 400 | 1.40 | +0.01em | `text-xs leading-5` |
| **Label** | Inter | 11px | 600 | 1.20 | +0.08em | `text-[11px] font-semibold uppercase tracking-widest` |
| **Code** | JetBrains Mono | 13px | 400 | 1.50 | 0em | `text-[13px] font-mono leading-relaxed` |

### 3-3. Spacing

**Base Unit: 4px**

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| space-1 | 4px | `p-1 gap-1` | 미세 간격 |
| space-1.5 | 6px | `p-1.5 gap-1.5` | 라벨-입력 간격 |
| space-2 | 8px | `p-2 gap-2` | 버튼 sm 패딩 상하 |
| space-3 | 12px | `p-3 gap-3` | 버튼 sm 패딩 좌우 |
| space-4 | 16px | `p-4 gap-4` | 카드 sm, 폼 필드 간, 그리드 갭 |
| space-5 | 20px | `p-5` | 카드 md 패딩 |
| space-6 | 24px | `p-6 gap-6` | 페이지 패딩, 모달 패딩 |
| space-8 | 32px | `p-8 gap-8` | 섹션 간 |
| space-10 | 40px | `py-10` | 페이지 섹션 |
| space-16 | 64px | `py-16` | 히어로 섹션 |

### 3-4. Border Radius

| 컴포넌트 | Value | Tailwind |
|----------|-------|----------|
| 버튼 sm/md | 8px | `rounded-lg` |
| 버튼 pill | ∞ | `rounded-full` |
| 입력 필드 | 8px | `rounded-lg` |
| 카드 | 12px | `rounded-xl` |
| 카드 large | 16px | `rounded-2xl` |
| 모달 | 16px | `rounded-2xl` |
| 드롭다운 | 10px | `rounded-[10px]` |
| 배지/태그 | 6px | `rounded-md` |
| 배지 pill | ∞ | `rounded-full` |
| 토스트 | 12px | `rounded-xl` |
| 아바타 | ∞ | `rounded-full` |
| 툴팁 | 6px | `rounded-md` |
| 사이드바 항목 | 8px | `rounded-lg` |

### 3-5. Shadows

| Token | CSS | Tailwind | Usage |
|-------|-----|----------|-------|
| shadow-xs | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | 입력 포커스링 보조 |
| **shadow-card** | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)` | `shadow` | 카드 기본 ★ |
| shadow-card-hover | `0 4px 8px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)` | `shadow-md` | 카드 호버 |
| shadow-dropdown | `0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | `shadow-md` | 드롭다운, 팝오버 |
| **shadow-modal** | `0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)` | `shadow-xl` | 모달 ★ |
| shadow-violet | `0 4px 14px rgba(139,92,246,0.30)` | `shadow-[0_4px_14px_rgba(139,92,246,0.30)]` | Primary 버튼 호버 |
| shadow-orange | `0 4px 14px rgba(249,115,22,0.30)` | `shadow-[0_4px_14px_rgba(249,115,22,0.30)]` | Accent 버튼 호버 |

### 3-6. Transitions

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| fast | `150ms ease-out` | `transition-all duration-150` | 호버, 포커스 |
| normal | `200ms ease-out` | `transition-all duration-200` | 버튼 클릭, 토글 |
| slow | `300ms ease-in-out` | `transition-all duration-300` | 드롭다운, 팝오버 |
| modal | `300ms cubic-bezier(0.16,1,0.3,1)` | `duration-300` + ease-out-expo | 모달 오픈 |
| pulse | Tailwind 내장 | `animate-pulse` | AI Working 상태 |
| spin | Tailwind 내장 | `animate-spin` | 로딩 스피너 |

---

## 4. Design Principles

### Visual Hierarchy
- F-패턴: 대시보드, 목록 (콘텐츠 많음)
- Z-패턴: 홈, 온보딩, 빈 상태 (행동 유도)
- 단일 컬럼: 설정, 채팅, 소울 에디터 (집중)
- 대비율: 본문 최소 4.5:1, 제목 3:1 이상

### Color 60-30-10
```
60% Stone (배경): bg-stone-50 + bg-white
30% Stone (텍스트/테두리): text-stone-800 + border-stone-200
10% Brand (액션): bg-violet-600 + bg-orange-500
```

### Grid
- 12-컬럼, Gutter 16px
- Container Max: `max-w-7xl` (1280px)
- 사이드바: `w-60` (240px), 고정
- 헤더: `h-14` (56px), 고정

### Breakpoints
| BP | Width | 변화 |
|----|-------|------|
| sm | 640px | 사이드바 숨김 |
| md | 768px | 2열 그리드 |
| lg | 1024px | 사이드바 표시, 3-4열 |
| xl | 1280px | 전체 레이아웃 |

---

## 5. Design Masters Cheat Sheet

| 상황 | 거장 | 원칙 | Tailwind |
|------|------|------|----------|
| 레이아웃 | Müller-Brockmann | 12-컬럼 그리드 | `grid grid-cols-12 gap-4` |
| 여백 | Müller-Brockmann | 공간도 콘텐츠 | `p-5 p-6 py-10` |
| 장식 제거 | Rams | Less but better | 그라디언트 배경 금지 |
| 아이콘 | Rams | 기능+텍스트 | 아이콘+텍스트 병용 |
| 색상 | Vignelli | 3색 이하 | violet + orange + stone |
| 위치 | Vignelli | 일관 배치 | 제목=좌상, 액션=우상 |
| 타이포 | Müller-Brockmann | 표준 스케일 | 12/14/16/18/24/32/48만 |

---

## 6. Design Movement

**Swiss International Style**: 그리드 엄수, 산세리프 위계, 정보 객관성
**Flat Design 2.0**: 부드러운 shadow, 둥근 모서리, 색상 시맨틱

결합 = Figma + Notion + Slack = "구조화되어 있지만 따뜻한, 전문적이지만 친근한"

---

## 7. Do / Don't

| Do (Tailwind) | Don't (Tailwind) | 이유 |
|---------------|------------------|------|
| `bg-stone-50` 페이지 배경 | `bg-gray-100`, `bg-slate-50` | 차가운 gray → stone으로 통일 |
| `rounded-xl` 카드 | `rounded-none`, `rounded-sm` | Creator 따뜻한 느낌 |
| `shadow` 카드 기본 | `shadow-2xl` 카드 | Flat 2.0 — 과한 깊이감 금지 |
| 아이콘+텍스트 버튼 | 아이콘만 버튼 | 비개발자 — 의미 명확히 |
| `bg-violet-600` CTA 단일 | `bg-violet-600` 복수 CTA | Vignelli — 위계 유지 |
| `text-stone-800` 본문 | `text-gray-700` (혼재) | 색상 시스템 일관성 |
| `border border-stone-200` | `border-gray-200` | stone 계열 통일 |
| `animate-pulse` working 상태만 | 다른 곳에 pulse | 시맨틱 보존 |
| `text-sm leading-relaxed` 본문 | `text-[15px]` 임의 | 스케일 준수 |
| `space-y-4` 폼 필드 간 | `space-y-3 space-y-5` 혼재 | 4px 배수 시스템 |

---

## 8. Page-Type Templates

### Dashboard Type (대시보드)

```html
<!-- 레이아웃 -->
<div class="p-6 max-w-7xl mx-auto">
  <!-- KPI 4열 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- KPI Card -->
    <div class="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-semibold uppercase tracking-widest text-stone-500">총 에이전트</span>
        <div class="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center">
          <i data-lucide="users" class="w-4 h-4 text-violet-600"></i>
        </div>
      </div>
      <p class="text-3xl font-bold text-stone-900 tabular-nums">24</p>
      <p class="text-xs text-emerald-600 mt-1">↑ 3 이번 달</p>
    </div>
  </div>
  <!-- 차트 + 사이드 패널 -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-sm p-5"><!-- 차트 --></div>
    <div class="bg-white rounded-xl border border-stone-200 shadow-sm p-5"><!-- 사이드 --></div>
  </div>
</div>
```

Key Colors: `bg-violet-50 text-violet-600` (아이콘), `text-stone-900` (수치), `text-emerald-600` (증가)

### CRUD/Management Type (관리 페이지)

```html
<!-- 페이지 헤더 -->
<div class="flex items-center justify-between mb-6">
  <div>
    <h1 class="text-[32px] font-bold text-stone-900 tracking-tight">에이전트</h1>
    <p class="text-sm text-stone-500 mt-0.5">AI 직원을 관리하세요</p>
  </div>
  <button class="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold
                 transition-all duration-150 hover:shadow-[0_4px_14px_rgba(139,92,246,0.30)]
                 flex items-center gap-2">
    <i data-lucide="plus" class="w-4 h-4"></i>
    에이전트 추가
  </button>
</div>
<!-- 카드 그리드 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div class="bg-white rounded-xl border border-stone-200 shadow-sm p-5
              hover:border-violet-200 hover:shadow-md transition-all duration-150">
    <!-- 카드 내용 -->
  </div>
</div>
```

### Settings Type (설정 페이지)

```html
<div class="flex gap-6 max-w-5xl mx-auto p-6">
  <!-- 설정 네비 -->
  <nav class="w-48 flex-shrink-0">
    <a class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              bg-violet-50 text-violet-700"><!-- 활성 --></a>
    <a class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              text-stone-600 hover:bg-stone-100 transition-colors"><!-- 비활성 --></a>
  </nav>
  <!-- 설정 콘텐츠 -->
  <div class="flex-1 space-y-4">
    <div class="bg-white rounded-xl border border-stone-200 p-6">
      <h2 class="text-lg font-semibold text-stone-900 mb-1">일반 설정</h2>
      <p class="text-sm text-stone-500 mb-4">기본 정보를 설정하세요.</p>
      <!-- 폼 -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1.5">이름</label>
          <input class="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent">
        </div>
      </div>
      <div class="mt-6 pt-4 border-t border-stone-200 flex justify-end">
        <button class="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-semibold">
          저장하기
        </button>
      </div>
    </div>
  </div>
</div>
```

### Admin Type (관리자 콘솔)

```html
<!-- Admin 헤더 (약간 더 비즈니스 톤) -->
<header class="h-14 bg-white border-b border-stone-200 flex items-center px-6">
  <div class="flex items-center gap-2">
    <span class="text-xs font-semibold px-2 py-0.5 bg-violet-100 text-violet-700 rounded-md">ADMIN</span>
    <span class="text-sm font-medium text-stone-700">CORTHEX 관리자 콘솔</span>
  </div>
</header>
<!-- Admin KPI 더 촘촘하게 -->
<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <!-- 더 컴팩트한 KPI 카드 p-4 -->
</div>
```
