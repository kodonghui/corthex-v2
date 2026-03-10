# CORTHEX v2 — Design Principles

> Creator + THE WORLD × Magician + THE SUN
> 라이트 테마 | Figma/Notion/Slack 스타일 | 비개발자 CEO 타겟

---

## 1. Visual Hierarchy Rules

### F-패턴 vs Z-패턴 사용처

| 패턴 | 사용 페이지 | 이유 |
|------|-----------|------|
| **F-패턴** | 대시보드, 보고서 목록, 에이전트 목록, 작전일지 | 콘텐츠가 많고 스캔 중심. 좌상단 → 가로 → 좌측 세로 흐름 |
| **Z-패턴** | 홈, 로그인, 빈 상태, 온보딩 | 적은 요소, 행동 유도. 좌상단 → 우상단 → 좌하단 → 우하단 |
| **단일 컬럼** | 설정, 소울 에디터, 채팅 | 집중형 작업. 수직 읽기 흐름 |

### 크기 대비 비율

```
페이지 제목(H1 32px) : 섹션(H2 24px) = 4:3
섹션(H2 24px) : 카드 제목(H3 18px) = 4:3
카드 제목(H3 18px) : 본문(Body 14px) = 9:7 ≈ 1.3:1

최소 제목-본문 비율: 1.3:1 (H3 18px vs Body 14px)
권장 제목-본문 비율: 2:1 이상 (H1 32px vs Body 14px)
```

### 색상 대비율 (WCAG AA 필수)

| 조합 | 비율 | Tailwind | 통과 여부 |
|------|------|----------|---------|
| `#1C1917` on `#FFFFFF` | 17.5:1 | `text-stone-900 bg-white` | ✅ AAA |
| `#292524` on `#FAFAF9` | 14.2:1 | `text-stone-800 bg-stone-50` | ✅ AAA |
| `#57534E` on `#FFFFFF` | 7.2:1 | `text-stone-600 bg-white` | ✅ AAA |
| `#78716C` on `#FFFFFF` | 4.8:1 | `text-stone-500 bg-white` | ✅ AA |
| `#A8A29E` on `#FFFFFF` | 2.7:1 | `text-stone-400 bg-white` | ❌ placeholder만 사용 |
| `#7C3AED` on `#FFFFFF` | 6.8:1 | `text-violet-700 bg-white` | ✅ AAA |
| `#FFFFFF` on `#7C3AED` | 6.8:1 | `text-white bg-violet-600` | ✅ AA (버튼) |
| `#FFFFFF` on `#EA580C` | 3.4:1 | `text-white bg-orange-600` | ✅ AA (대형 텍스트) |
| `#B45309` on `#FFFBEB` | 5.2:1 | `text-amber-700 bg-amber-50` | ✅ AA |
| `#047857` on `#ECFDF5` | 5.8:1 | `text-emerald-700 bg-emerald-50` | ✅ AA |

**규칙**: 플레이스홀더(`stone-400`)는 텍스트가 아닌 힌트용으로만. 실제 입력/라벨은 최소 `stone-600`.

---

## 2. Gestalt Principles Application

### Proximity (근접성)

관련 요소는 붙이고, 비관련 그룹은 명확히 분리.

```
폼 필드 내 관련 요소 간격: 6px (gap-1.5, mb-1.5)
폼 필드 간 간격: 16px (space-y-4)
폼 섹션 간 간격: 32px (space-y-8)

카드 내 요소 간격: 12px (space-y-3)
카드 간 간격: 16px (gap-4)
카드 그룹 간 간격: 32px (gap-8)

사이드바 메뉴 항목 간: 2px (space-y-0.5)
사이드바 섹션 간: 24px (mt-6)

예시:
<div class="space-y-4">           ← 폼 필드 그룹
  <div class="space-y-1.5">      ← 라벨+입력 쌍
    <label>이름</label>
    <input ...>
    <span class="mt-1">도움말</span>
  </div>
</div>
```

### Similarity (유사성)

같은 역할의 요소는 같은 시각적 언어 사용.

```
모든 주요 카드: rounded-xl border border-stone-200 bg-white shadow-sm p-5
모든 KPI 카드: rounded-xl border border-stone-200 bg-white p-4 (더 작은 패딩)
모든 보조 버튼: border border-stone-200 bg-white text-stone-700 rounded-lg px-4 py-2
모든 에이전트 배지: rounded-full text-xs font-medium px-2.5 py-0.5
모든 섹션 라벨: text-[11px] font-semibold uppercase tracking-widest text-stone-500

위반 금지:
- 어떤 카드는 rounded-xl, 어떤 카드는 rounded-md → 금지
- 어떤 버튼은 font-medium, 어떤 버튼은 font-bold → 금지
```

### Continuity (연속성)

시선 흐름을 방해하지 않는 레이아웃.

```
사이드바 → 메인 콘텐츠: 명확한 경계선
border-r border-stone-200 (사이드바 우측 보더)

위임 체인 타임라인:
border-l-2 border-violet-200 ml-4 pl-4 space-y-4
(수직 선이 에이전트 실행 흐름을 안내)

테이블 행 구분:
divide-y divide-stone-100 (행 간 연속성, 컬럼은 암묵적)

네비게이션 브레드크럼:
text-stone-400 → chevron-right → text-stone-700 (현재)
(연속적 경로 표현)
```

### Closure (폐쇄성)

불완전한 것도 뇌가 완성. 카드 블리드로 더 많은 콘텐츠 암시.

```
스크롤 힌트: 마지막 카드를 화면 끝에서 절반만 보이게
overflow-x-auto → 카드 너비 합계 > 화면 너비

페이지 섹션 경계:
bg-gradient-to-b from-white to-stone-50 (자연스러운 경계)

로딩 스켈레톤 (Closure 활용):
bg-stone-200 animate-pulse rounded (뇌가 실제 콘텐츠를 상상)
```

### Figure/Ground (전경/배경)

배경과 콘텐츠를 명확히 분리.

```
페이지 배경: bg-stone-50 (#FAFAF9)
카드 전경: bg-white (#FFFFFF) + border + shadow

모달 배경 오버레이:
bg-stone-900/60 backdrop-blur-sm (배경을 흐리게 → 모달이 전경)

드롭다운:
bg-white shadow-md border border-stone-200 z-50
(부모보다 높은 z-index + shadow로 레이어 분리)

클릭 가능 vs 정적:
클릭 가능: hover:bg-stone-50 cursor-pointer transition
정적: cursor-default (hover 효과 없음)
```

---

## 3. Color Theory Rules

### 60-30-10 법칙 (CORTHEX v2 적용)

```
60% — Dominant (배경, 대면적)
  #FAFAF9 (bg-stone-50) 페이지 배경
  #FFFFFF (bg-white) 카드, 모달, 사이드바
  #F5F5F4 (bg-stone-100) 섹션 구분

30% — Secondary (보조, 컨텐츠)
  #1C1917 ~ #292524 (text-stone-900/800) 텍스트
  #E7E5E4 (bg-stone-200) 테두리, 구분선
  #A8A29E ~ #57534E (text-stone-400~600) 보조 텍스트

10% — Accent (강조, CTA)
  #8B5CF6 / #7C3AED (violet-500/600) 주요 CTA, 활성 상태
  #F97316 (orange-500) AI 실행 중, 퀵 액션
  #10B981 (emerald-500) 완료, 성공
```

### Semantic Color 용도 (엄격한 규칙)

| 색상 | 상황 | 절대 사용 금지 |
|------|------|----------------|
| `bg-violet-600` | 주요 CTA 버튼, 활성 메뉴, 선택 상태, Primary 강조 | 에러, 경고, 일반 배경 |
| `bg-orange-500` + `animate-pulse` | 에이전트 working, AI 처리 중, 긴급 알림 | 성공, 완료, 일반 강조 |
| `bg-emerald-500/50/700` | 완료, 성공, online, 긍정 피드백 | 에러, 경고, CTA |
| `bg-amber-500/50/700` | 예산 경고, 주의 필요, 비용 초과 임박 | 성공, CTA |
| `bg-red-500/50/700` | 에러 상태, 삭제 확인, 시스템 에러 | 강조, 브랜딩 |
| `bg-blue-500/50` | 정보 안내, 도움말, 시스템 메시지 | CTA, 에러 |

---

## 4. Typography Rules

### Scale Ratio

**Major Third (1.250) 비율** 적용. 황금비(1.618)는 너무 극단적.

```
Caption:    12px  (base × 0.75)
Body:       14px  (base × 0.875)
Body Base:  16px  ★ Base Unit
H4:         16px  (font-weight으로 구분)
H3:         18px  (base × 1.125)
H2:         24px  (base × 1.500)
H1:         32px  (base × 2.000)
Display:    48px  (base × 3.000)
```

### Line Height 규칙

```
Display:       line-height: 1.10  (leading-[1.1]  — 제목은 타이트)
H1:            line-height: 1.20  (leading-tight  — 1.25)
H2:            line-height: 1.25  (leading-snug   — 1.375)
H3/H4:         line-height: 1.35  (leading-snug)
Body Large:    line-height: 1.70  (leading-7 = 28px)
Body:          line-height: 1.60  (leading-relaxed = 1.625)
Caption/Label: line-height: 1.40  (leading-5 = 20px)
Code:          line-height: 1.50  (leading-relaxed)
```

### Letter Spacing 규칙

```
Display/H1:    letter-spacing: -0.030em  (tracking-tighter = -0.05em, 실제: -0.03em)
H2:            letter-spacing: -0.020em  (tracking-tight = -0.025em, 실제 -0.02em)
H3/H4:         letter-spacing: -0.010em  (살짝 타이트)
Body:          letter-spacing:  0.000em  (tracking-normal)
Label:         letter-spacing: +0.080em  (tracking-widest = 0.1em, 실제 0.08em)
Caption:       letter-spacing: +0.010em  (tracking-wide = 0.025em)
```

### Max Line Width 규칙

```
본문 텍스트 최대 너비: 65ch (max-w-prose = 65ch)
카드 내 설명:          40ch ~ 50ch
좁은 폼 필드:          28ch (max-w-xs = 320px)
넓은 폼 필드:          전체 (w-full)
AI 보고서:             max-w-3xl (768px)
```

---

## 5. Spacing Rules

**Base Unit: 4px (Tailwind spacing-1)**

### 컴포넌트 내부 패딩 (Internal Padding)

```
버튼 sm:    padding: 6px 12px   → py-1.5 px-3
버튼 md:    padding: 8px 16px   → py-2 px-4
버튼 lg:    padding: 10px 20px  → py-2.5 px-5
입력 sm:    padding: 6px 10px   → py-1.5 px-2.5
입력 md:    padding: 8px 12px   → py-2 px-3
입력 lg:    padding: 10px 14px  → py-2.5 px-3.5
카드 sm:    padding: 16px       → p-4
카드 md:    padding: 20px 24px  → py-5 px-6
카드 lg:    padding: 24px 32px  → py-6 px-8
모달:       padding: 24px       → p-6
사이드바 항목: 8px 12px         → py-2 px-3
테이블 헤더: 12px 16px          → py-3 px-4
테이블 셀:  12px 16px           → py-3 px-4
페이지:     24px                → p-6
```

### 컴포넌트 외부 간격 (External Margin/Gap)

```
라벨 ↔ 입력 필드:     6px    → mb-1.5 gap-1.5
입력 ↔ 도움말:        4px    → mt-1
폼 필드 간:           16px   → space-y-4
카드 간 (그리드):      16px   → gap-4
카드 간 (리스트):      12px   → space-y-3
섹션 내 요소 간:       24px   → space-y-6
섹션 간:              40px   → space-y-10 py-10
페이지 주요 섹션:      64px   → py-16 (랜딩 등)
사이드바 그룹 간:      24px   → mt-6 pt-6 border-t border-stone-200
```

---

## 6. Grid System

### 기본 그리드

```
컬럼: 12-column
Gutter: 16px (gap-4)
Container Max Width:
  default: max-w-7xl (1280px)
  콘텐츠 집중: max-w-5xl (1024px)
  폼/설정: max-w-2xl (672px)
  읽기/보고서: max-w-3xl (768px)
```

### Breakpoints & 레이아웃 규칙

```
sm (640px):
  - 사이드바: 숨김 (모바일 햄버거 메뉴)
  - 카드 그리드: 1열 (grid-cols-1)
  - 테이블: 중요 컬럼만 표시 또는 카드 전환

md (768px):
  - 사이드바: 아이콘만 표시 (w-16)
  - 카드 그리드: 2열 (md:grid-cols-2)
  - KPI: 2열 (md:grid-cols-2)

lg (1024px):
  - 사이드바: 전체 표시 (w-60 = 240px)
  - 카드 그리드: 3열 (lg:grid-cols-3)
  - KPI: 4열 (lg:grid-cols-4)
  - 사령관실: 2분할 (lg:grid-cols-[1fr_1.5fr])

xl (1280px):
  - 대시보드: 4열 KPI + 차트+사이드 2분할
  - 에이전트 목록: 4열 (xl:grid-cols-4)

2xl (1536px):
  - 콘텐츠 max-width 유지 (이상 넓어지지 않음)
  - 양쪽 여백 자동 (mx-auto)
```

### 페이지 레이아웃 템플릿

```html
<!-- 기본 앱 레이아웃 -->
<div class="flex h-screen bg-stone-50">
  <!-- 사이드바 240px -->
  <aside class="w-60 flex-shrink-0 bg-white border-r border-stone-200">
  </aside>

  <!-- 메인 콘텐츠 -->
  <main class="flex-1 overflow-y-auto">
    <!-- 헤더 56px -->
    <header class="h-14 border-b border-stone-200 bg-white flex items-center px-6">
    </header>

    <!-- 콘텐츠 영역 -->
    <div class="p-6 max-w-7xl mx-auto">
    </div>
  </main>
</div>

<!-- 대시보드 그리드 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  <!-- KPI 카드 4개 -->
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div class="lg:col-span-2"><!-- 차트 --></div>
  <div class="lg:col-span-1"><!-- 사이드 패널 --></div>
</div>
```

---

## 7. 원칙 적용 체크리스트

모든 새 컴포넌트/페이지 작성 전 확인:

```
[ ] 시각적 위계: 가장 중요한 것이 크고/진하고/violet인가?
[ ] Proximity: 관련 요소는 붙어 있고, 비관련 그룹은 분리됐는가?
[ ] Similarity: 같은 유형의 카드/버튼이 같은 스타일인가?
[ ] 색상 대비: 모든 텍스트 4.5:1 이상인가?
[ ] 60-30-10: stone 배경 60%, 텍스트+테두리 30%, violet/orange 10%인가?
[ ] 폰트: 헤딩은 Plus Jakarta Sans, 본문은 Inter인가?
[ ] 간격: 4px 배수만 사용했는가?
[ ] Border Radius: 카드는 rounded-xl, 버튼은 rounded-lg인가?
[ ] 반응형: sm/md/lg/xl breakpoint 모두 고려했는가?
[ ] Max Width: 본문 컨테이너 max-w-7xl, 읽기 콘텐츠 max-w-3xl인가?
```
