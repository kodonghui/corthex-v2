# CORTHEX v2 — Archetypal Combinations: Design DNA

> Creator + THE WORLD × Magician + THE SUN
> 라이트 테마 | 따뜻하고 친근 | Figma/Notion/Slack 스타일

---

## 1. 조합의 의미

Creator + THE WORLD: 사용자(CEO)가 AI 에이전트 조직이라는 자신만의 세계를 설계하고 완성하는 창조의 경험. 모든 UI는 "만드는 사람"을 위한 Workspace처럼 설계되며, 완성 순간마다 The World의 풍요로운 바이올렛-에메랄드-금 조합이 축하한다.

Magician + THE SUN: AI가 자연어 명령을 받아 태양처럼 활력 있게 실행하는 변환의 마법. 에이전트가 활성화될 때, 보고서가 생성될 때, 작업이 완료될 때 — The Sun의 따뜻한 오렌지-금 에너지가 "AI가 실제로 일하고 있다"는 생동감을 전달한다.

---

## 2. Design Tokens 최종 확정

### 2-1. Color Tokens

```css
/* ===== CORTHEX v2 Color Tokens ===== */

/* Primary — Creator Violet (THE WORLD) */
--color-primary-50:  #F5F3FF;  /* bg-violet-50  */
--color-primary-100: #EDE9FE;  /* bg-violet-100 */
--color-primary-200: #DDD6FE;  /* bg-violet-200 */
--color-primary-300: #C4B5FD;  /* bg-violet-300 */
--color-primary-400: #A78BFA;  /* bg-violet-400 */
--color-primary-500: #8B5CF6;  /* bg-violet-500 ★ Main Brand */
--color-primary-600: #7C3AED;  /* bg-violet-600 ★ CTA Button */
--color-primary-700: #6D28D9;  /* bg-violet-700 ★ Active/Pressed */
--color-primary-800: #5B21B6;  /* bg-violet-800 */
--color-primary-900: #4C1D95;  /* bg-violet-900 */

/* Secondary — Indigo (Creator 보조) */
--color-secondary-500: #6366F1;  /* bg-indigo-500 */
--color-secondary-600: #4F46E5;  /* bg-indigo-600 */

/* Accent — Sun Orange (Magician 에너지) */
--color-accent-400: #FB923C;   /* bg-orange-400 */
--color-accent-500: #F97316;   /* bg-orange-500 ★ Working/Action */
--color-accent-600: #EA580C;   /* bg-orange-600 */

/* Celebration Gold (THE WORLD 완성) */
--color-gold-400:  #FBBF24;   /* bg-yellow-400 */
--color-gold-500:  #F59E0B;   /* bg-amber-500  ★ Achievement */

/* Neutral — Warm Stone (Notion 스타일) */
--color-neutral-0:   #FFFFFF;  /* bg-white */
--color-neutral-50:  #FAFAF9;  /* bg-stone-50  ★ Page BG */
--color-neutral-100: #F5F5F4;  /* bg-stone-100 ★ Section BG */
--color-neutral-200: #E7E5E4;  /* bg-stone-200 ★ Border */
--color-neutral-300: #D6D3D1;  /* bg-stone-300 */
--color-neutral-400: #A8A29E;  /* text-stone-400 Placeholder */
--color-neutral-500: #78716C;  /* text-stone-500 Helper Text */
--color-neutral-600: #57534E;  /* text-stone-600 Secondary Text */
--color-neutral-700: #44403C;  /* text-stone-700 Label */
--color-neutral-800: #292524;  /* text-stone-800 ★ Body Text */
--color-neutral-900: #1C1917;  /* text-stone-900 ★ Title */

/* Semantic */
--color-success-50:  #ECFDF5;  /* bg-emerald-50  */
--color-success-500: #10B981;  /* bg-emerald-500 ★ Online/Done */
--color-success-700: #047857;  /* text-emerald-700 */
--color-warning-50:  #FFFBEB;  /* bg-amber-50    */
--color-warning-500: #F59E0B;  /* bg-amber-500   ★ Warning */
--color-warning-700: #B45309;  /* text-amber-700 */
--color-error-50:    #FEF2F2;  /* bg-red-50      */
--color-error-500:   #EF4444;  /* bg-red-500     ★ Error/Danger */
--color-error-700:   #B91C1C;  /* text-red-700   */
--color-info-50:     #EFF6FF;  /* bg-blue-50     */
--color-info-500:    #3B82F6;  /* bg-blue-500    ★ Info */

/* Agent Status */
--agent-online:  #10B981;  /* bg-emerald-500 */
--agent-working: #F97316;  /* bg-orange-500  animate-pulse */
--agent-error:   #EF4444;  /* bg-red-500     */
--agent-offline: #A8A29E;  /* bg-stone-400   */
```

### 2-2. Typography Scale (최종)

```css
/* Heading Font: Plus Jakarta Sans (Google Fonts) */
/* Body Font: Inter (Google Fonts) */
/* Code Font: JetBrains Mono */

/* Display — 랜딩, 빈 상태 히어로 */
font-size: 48px; font-weight: 800; line-height: 1.10; letter-spacing: -0.03em;
Tailwind: text-5xl font-extrabold tracking-tight leading-[1.1]
Font: Plus Jakarta Sans

/* H1 — 페이지 제목 */
font-size: 32px; font-weight: 700; line-height: 1.20; letter-spacing: -0.02em;
Tailwind: text-[32px] font-bold tracking-tight leading-tight
Font: Plus Jakarta Sans

/* H2 — 섹션 제목 */
font-size: 24px; font-weight: 700; line-height: 1.25; letter-spacing: -0.015em;
Tailwind: text-2xl font-bold tracking-tight leading-snug
Font: Plus Jakarta Sans

/* H3 — 카드 제목, 서브섹션 */
font-size: 18px; font-weight: 600; line-height: 1.30;
Tailwind: text-lg font-semibold leading-snug
Font: Plus Jakarta Sans

/* H4 — 소제목, 그룹 라벨 */
font-size: 16px; font-weight: 600; line-height: 1.40;
Tailwind: text-base font-semibold
Font: Plus Jakarta Sans

/* Body Large — 중요 설명 */
font-size: 16px; font-weight: 400; line-height: 1.70;
Tailwind: text-base leading-7
Font: Inter

/* Body — 기본 본문 */
font-size: 14px; font-weight: 400; line-height: 1.60;
Tailwind: text-sm leading-relaxed
Font: Inter

/* Caption — 타임스탬프, 메타 */
font-size: 12px; font-weight: 400; line-height: 1.40;
Tailwind: text-xs leading-5
Font: Inter

/* Label — 섹션 레이블 (대문자) */
font-size: 11px; font-weight: 600; line-height: 1.20; letter-spacing: 0.08em;
Tailwind: text-[11px] font-semibold uppercase tracking-widest
Font: Inter

/* Code — API 키, 소울 에디터 */
font-size: 13px; font-weight: 400; line-height: 1.50;
Tailwind: text-[13px] font-mono leading-relaxed
Font: JetBrains Mono
```

### 2-3. Spacing (최종)

```
Base Unit: 4px

컴포넌트 내부 패딩:
| 항목 | px | Tailwind |
|------|-----|---------|
| 버튼 sm | 6px 12px | py-1.5 px-3 |
| 버튼 md | 8px 16px | py-2 px-4 |
| 버튼 lg | 10px 20px | py-2.5 px-5 |
| 입력 md | 8px 12px | py-2 px-3 |
| 입력 lg | 10px 14px | py-2.5 px-3.5 |
| 카드 sm | 16px | p-4 |
| 카드 md | 20px 24px | py-5 px-6 |
| 카드 lg | 24px 32px | py-6 px-8 |
| 모달 | 24px | p-6 |
| 사이드바 항목 | 8px 12px | py-2 px-3 |
| 드롭다운 항목 | 8px 12px | py-2 px-3 |
| 테이블 셀 | 12px 16px | py-3 px-4 |
| 페이지 패딩 | 24px | p-6 |
| 헤더 | 56px (height) | h-14 |

컴포넌트 간격:
| 관계 | px | Tailwind |
|------|-----|---------|
| 라벨 ↔ 입력 | 6px | gap-1.5 mb-1.5 |
| 폼 필드 간 | 16px | gap-4 space-y-4 |
| 카드 간 | 16px | gap-4 |
| 섹션 간 | 32px | gap-8 |
| 페이지 섹션 | 40px | py-10 |
| 사이드바 그룹 | 24px | mt-6 |

레이아웃:
| 항목 | 값 | Tailwind |
|------|-----|---------|
| 사이드바 | 240px | w-60 |
| 콘텐츠 max | 1280px | max-w-7xl |
| 좁은 콘텐츠 | 768px | max-w-3xl |
| 헤더 높이 | 56px | h-14 |
| 그리드 갭 | 16px | gap-4 |
```

### 2-4. Border Radius (최종)

```
| 컴포넌트 | px | Tailwind |
|----------|-----|---------|
| 버튼 sm/md | 8px | rounded-lg |
| 버튼 lg | 10px | rounded-[10px] |
| 버튼 pill | 9999px | rounded-full |
| 입력 필드 | 8px | rounded-lg |
| 카드 | 12px | rounded-xl |
| 카드 lg | 16px | rounded-2xl |
| 모달 | 16px | rounded-2xl |
| 드롭다운 | 10px | rounded-[10px] |
| 배지/태그 | 6px | rounded-md |
| 토스트 | 12px | rounded-xl |
| 아바타 | 50% | rounded-full |
| 진행 바 | 9999px | rounded-full |
| 사이드바 메뉴 | 8px | rounded-lg |
| 툴팁 | 6px | rounded-md |
| 팝오버 | 12px | rounded-xl |
| 섹션 배경 | 16px | rounded-2xl |
```

### 2-5. Shadow (최종)

```css
/* shadow-card — 기본 카드 */
box-shadow: 0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.05);
Tailwind: shadow  (또는 shadow-sm for lighter)

/* shadow-card-hover — 카드 호버 */
box-shadow: 0 4px 8px -2px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.06);
Tailwind: shadow-md

/* shadow-dropdown — 드롭다운, 팝오버 */
box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04);
Tailwind: shadow-md

/* shadow-modal — 모달, 사이드패널 */
box-shadow: 0 20px 25px -5px rgba(0,0,0,0.10), 0 8px 10px -6px rgba(0,0,0,0.04);
Tailwind: shadow-xl

/* shadow-primary — Primary 버튼 호버 (Creator Violet glow) */
box-shadow: 0 4px 14px 0 rgba(139, 92, 246, 0.30);
Tailwind: shadow-[0_4px_14px_0_rgba(139,92,246,0.30)]

/* shadow-accent — Accent 버튼 호버 (Sun Orange glow) */
box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.30);
Tailwind: shadow-[0_4px_14px_0_rgba(249,115,22,0.30)]

/* shadow-none — 입력 필드 기본 */
box-shadow: none; (ring으로 포커스 표시)
```

### 2-6. Transition (최종)

```css
/* fast — 호버, 포커스 상태 */
transition: all 150ms ease-out;
Tailwind: transition-all duration-150 ease-out

/* normal — 버튼 클릭, 토글 */
transition: all 200ms ease-out;
Tailwind: transition-all duration-200 ease-out

/* slow — 드롭다운, 팝오버 */
transition: all 250ms ease-in-out;
Tailwind: transition-all duration-[250ms] ease-in-out

/* modal — 모달 오픈/클로즈 */
transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
(ease-out-expo 계열)

/* spring — 드롭다운 스프링 */
transition: all 350ms cubic-bezier(0.34, 1.56, 0.64, 1);
(약간 튀는 스프링 효과)

/* pulse — 에이전트 working 상태 */
Tailwind: animate-pulse (1.5s 주기)
```

---

## 3. 페이지 유형별 적용 규칙

### 3-1. Command Center (사령관실)

```
레이아웃:
- 2분할: 좌측 명령 입력(40%) + 우측 위임 체인/결과(60%)
- 배경: bg-stone-50 (페이지) + bg-white (각 패널)
- 패널 구분: border border-stone-200 rounded-xl

명령 입력 영역:
- 배경: bg-white rounded-xl shadow border border-stone-200
- textarea: rounded-xl border-stone-200 focus:ring-2 focus:ring-violet-500
- 전송 버튼: bg-violet-600 hover:bg-violet-700 rounded-lg

위임 체인 (실행 중):
- 타임라인 좌측 보더: border-l-2 border-violet-200
- 에이전트 아이콘: rounded-full bg-violet-50 border-2 border-violet-200
- Working 배지: bg-orange-50 text-orange-600 animate-pulse (주황)
- Done 배지: bg-emerald-50 text-emerald-700 (초록)

결과 영역:
- 배경: bg-gradient-to-b from-amber-50/30 to-white (Sun 무드)
- 보고서 헤더: text-stone-900 font-bold (Plus Jakarta Sans)
- 보고서 본문: text-stone-700 leading-7 (Inter)
- 만족도 버튼: 👍 bg-emerald-50 👎 bg-red-50
```

### 3-2. CRUD 관리 페이지 (에이전트, 부서, 직원 등)

```
레이아웃:
- 상단: 페이지 제목 + 주요 액션 버튼 (flex justify-between)
- 하단: 카드 그리드 또는 테이블
- 카드 그리드: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

카드:
- 기본: bg-white rounded-xl border border-stone-200 shadow-sm p-5
- 호버: hover:border-violet-200 hover:shadow-md transition-all duration-150
- 선택: border-violet-400 ring-2 ring-violet-100

주요 버튼 (추가/생성):
- bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2
- hover:shadow-[0_4px_14px_0_rgba(139,92,246,0.30)] transition-all

보조 버튼 (편집):
- bg-white border border-stone-200 hover:border-stone-300 text-stone-700 rounded-lg px-4 py-2

위험 버튼 (삭제):
- text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 text-sm

상태 배지:
- online: bg-emerald-50 text-emerald-700 rounded-full px-2.5 py-0.5 text-xs
- working: bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5 text-xs
- error: bg-red-50 text-red-700 rounded-full px-2.5 py-0.5 text-xs
- offline: bg-stone-100 text-stone-500 rounded-full px-2.5 py-0.5 text-xs

에이전트 아바타:
- 원형 이니셜 아바타: rounded-full bg-violet-100 text-violet-700 font-semibold
- 상태 점: w-2.5 h-2.5 rounded-full border-2 border-white (우하단 절대 위치)
```

### 3-3. 설정 페이지

```
레이아웃:
- 2분할: 좌측 설정 네비게이션(200px) + 우측 설정 내용
- 설정 네비: bg-stone-50 border-r border-stone-200 (사이드 탭)
- 콘텐츠 max-w: max-w-2xl

설정 섹션:
- 섹션 카드: bg-white rounded-xl border border-stone-200 p-6 mb-4
- 섹션 제목: text-base font-semibold text-stone-900 mb-1 (H4)
- 섹션 설명: text-sm text-stone-500 mb-4

폼 필드:
- 라벨: text-sm font-medium text-stone-700 mb-1.5
- 입력: rounded-lg border-stone-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white
- 도움말: text-xs text-stone-400 mt-1

저장 버튼:
- bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-4 py-2 text-sm font-medium

토글/스위치:
- checked: bg-violet-600 (Tailwind: peer-checked:bg-violet-600)
- unchecked: bg-stone-200

위험 구역:
- 배경: bg-red-50/50 border border-red-100 rounded-xl p-6
- 버튼: border border-red-300 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2
```

### 3-4. Admin 대시보드

```
레이아웃:
- 4분할 KPI 카드 (grid-cols-4 gap-4)
- 하단: 차트 영역(2/3) + 사이드 패널(1/3)
- 배경: bg-stone-50 (Admin은 살짝 더 비즈니스 느낌)

KPI 카드:
- bg-white rounded-xl border border-stone-200 p-5 shadow-sm
- 아이콘: 작은 컬러 원형 bg + Lucide 아이콘
  - 에이전트: bg-violet-50 text-violet-600
  - 비용: bg-amber-50 text-amber-600
  - 완료 작업: bg-emerald-50 text-emerald-600
  - 에러: bg-red-50 text-red-600
- 수치: text-3xl font-bold text-stone-900 (Plus Jakarta Sans)
- 변동: 증가 text-emerald-600, 감소 text-red-600 (화살표 아이콘)

차트:
- 배경: bg-white rounded-xl border border-stone-200 p-5
- 차트 색상: Primary #8B5CF6, Secondary #6366F1, Accent #F97316
- 그리드 라인: stroke-stone-100

테이블:
- 헤더: bg-stone-50 text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3
- 행: border-b border-stone-100 hover:bg-stone-50/50 px-4 py-3
- 셀 텍스트: text-sm text-stone-800
```

---

## 4. Do / Don't 리스트

### ✅ DO (이렇게 써라)

| # | Do | Tailwind 예시 | 이유 |
|---|-----|--------------|------|
| 1 | **카드에 부드러운 테두리+shadow 조합** | `border border-stone-200 shadow-sm rounded-xl bg-white` | Creator Workspace 느낌, 가독성 |
| 2 | **Primary 버튼에 violet 600 + 호버 glow** | `bg-violet-600 hover:bg-violet-700 hover:shadow-[0_4px_14px_0_rgba(139,92,246,0.30)]` | Creator CTA 에너지 |
| 3 | **에이전트 working 상태에 주황 pulse** | `bg-orange-500 animate-pulse` | Sun 에너지, 생동감 |
| 4 | **빈 상태에 창조 초대 메시지 + violet 아이콘** | `bg-violet-50 rounded-2xl` (아이콘 배경) | Creator 원형 초대 |
| 5 | **완료/성공에 emerald 색상 사용** | `bg-emerald-50 text-emerald-700 border-emerald-200` | THE WORLD의 완성 색상 |

### ❌ DON'T (이렇게 하지 마라)

| # | Don't | 잘못된 Tailwind | 이유 |
|---|--------|----------------|------|
| 1 | **어두운 배경 사용** | `bg-slate-900`, `bg-zinc-800`, `bg-gray-950` | 라이트 테마 원칙 위반, Rebel 그림자 |
| 2 | **차가운 gray 뉴트럴** | `bg-gray-100 text-gray-600` | stone 대신 gray → 따뜻한 느낌 파괴 |
| 3 | **날카로운 모서리** | `rounded-none`, `rounded-sm` | Creator+The World = 부드러운 완성 |
| 4 | **Primary 버튼을 페이지에 2개 이상** | `bg-violet-600` 버튼 여러 개 | 위계 파괴, 사용자 혼란 |
| 5 | **빨간색을 에러 외 용도로** | `bg-red-600 text-red-600` (일반 강조) | 에러 시맨틱 훼손, 공포 유발 |
