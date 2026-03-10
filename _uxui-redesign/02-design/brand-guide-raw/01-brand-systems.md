# CORTHEX v2 — Brand Systems

---

## 1. Brand Essence

> **"코드 한 줄 없이, 나만의 AI 회사를 만들고 운영한다."**

비개발자 CEO가 AI 에이전트 조직을 직관적으로 설계·운영할 수 있도록,
복잡한 AI 오케스트레이션을 친근하고 명확한 경험으로 바꾼다.

---

## 2. Brand Personality

| 형용사 | 의미 | UI 표현 방식 |
|--------|------|-------------|
| **친근한 (Approachable)** | 비개발자가 두려움 없이 쓸 수 있다 | 둥근 모서리, 부드러운 색상, 명확한 한국어 레이블 |
| **명확한 (Clear)** | 어떤 상태인지, 무엇을 해야 하는지 즉시 안다 | 강한 시각적 위계, 아이콘+텍스트 병용 |
| **신뢰할 수 있는 (Trustworthy)** | CEO가 비즈니스를 맡길 수 있다 | 차분한 바이올렛 계열, 일관된 피드백 |
| **활력 있는 (Energetic)** | AI가 실제로 일하고 있다는 느낌 | 따뜻한 오렌지 액센트, 상태 표시, 애니메이션 |
| **지적인 (Intelligent)** | 복잡한 것을 단순하게 처리한다 | 깔끔한 레이아웃, 데이터 시각화, 스마트 기본값 |

---

## 3. Color Palette

### 3-1. Primary — Warm Violet (메인 컬러)

Figma의 보라색에서 영감. 전문성과 창의성을 동시에 표현.

| Token | Hex | Tailwind 클래스 | 용도 |
|-------|-----|-----------------|------|
| primary-50 | `#F5F3FF` | `bg-violet-50` | 배경 하이라이트 |
| primary-100 | `#EDE9FE` | `bg-violet-100` | 선택 상태 배경 |
| primary-200 | `#DDD6FE` | `bg-violet-200` | 비활성 버튼 배경 |
| primary-400 | `#A78BFA` | `bg-violet-400` | 호버 상태 |
| **primary-500** | **`#8B5CF6`** | **`bg-violet-500`** | **메인 브랜드 컬러** |
| primary-600 | `#7C3AED` | `bg-violet-600` | 주요 버튼, CTA |
| primary-700 | `#6D28D9` | `bg-violet-700` | 버튼 Active 상태 |
| primary-900 | `#4C1D95` | `bg-violet-900` | 짙은 강조 |

**사용 규칙**: CTA 버튼, 링크, 활성 탭, 선택된 메뉴, 진행 바, 배지

### 3-2. Secondary — Warm Indigo (보조 컬러)

| Token | Hex | Tailwind 클래스 | 용도 |
|-------|-----|-----------------|------|
| secondary-50 | `#EEF2FF` | `bg-indigo-50` | 정보 배경 |
| secondary-100 | `#E0E7FF` | `bg-indigo-100` | 카드 배경 변형 |
| secondary-500 | `#6366F1` | `bg-indigo-500` | 보조 강조 |
| secondary-600 | `#4F46E5` | `bg-indigo-600` | 보조 버튼 |

### 3-3. Accent — Warm Orange (액션/에너지)

Slack의 활력에서 영감. AI 활동 중 상태, 경고, 중요 알림.

| Token | Hex | Tailwind 클래스 | 용도 |
|-------|-----|-----------------|------|
| accent-400 | `#FB923C` | `bg-orange-400` | 소프트 강조 |
| **accent-500** | **`#F97316`** | **`bg-orange-500`** | **에이전트 활동 중, 퀵 액션** |
| accent-600 | `#EA580C` | `bg-orange-600` | 강한 강조 |

**사용 규칙**: 에이전트 `working` 상태, 긴급 알림, 퀵 액션 버튼, 진행 중 배지

### 3-4. Neutral — Warm Stone (배경/텍스트)

Notion의 따뜻한 회색에서 영감. 차가운 gray 대신 stone(따뜻한 회백색) 계열 사용.

| Token | Hex | Tailwind 클래스 | 용도 |
|-------|-----|-----------------|------|
| neutral-0 | `#FFFFFF` | `bg-white` | 카드, 모달 배경 |
| neutral-50 | `#FAFAF9` | `bg-stone-50` | 페이지 기본 배경 |
| neutral-100 | `#F5F5F4` | `bg-stone-100` | 섹션 구분 배경 |
| neutral-200 | `#E7E5E4` | `bg-stone-200` | 테두리, 구분선 |
| neutral-300 | `#D6D3D1` | `bg-stone-300` | 비활성 요소 테두리 |
| neutral-400 | `#A8A29E` | `text-stone-400` | 플레이스홀더 텍스트 |
| neutral-500 | `#78716C` | `text-stone-500` | 설명 텍스트 |
| neutral-600 | `#57534E` | `text-stone-600` | 보조 텍스트 |
| neutral-700 | `#44403C` | `text-stone-700` | 레이블 텍스트 |
| neutral-800 | `#292524` | `text-stone-800` | 본문 텍스트 |
| neutral-900 | `#1C1917` | `text-stone-900` | 제목 텍스트 |

### 3-5. Semantic Colors (상태 표시)

| 상태 | Token | Hex | Tailwind | 용도 |
|------|-------|-----|----------|------|
| **Success** | success-500 | `#10B981` | `bg-emerald-500` | 완료, 성공, online |
| Success BG | success-50 | `#ECFDF5` | `bg-emerald-50` | 성공 배경 |
| **Warning** | warning-500 | `#F59E0B` | `bg-amber-500` | 주의, 비용 초과 임박 |
| Warning BG | warning-50 | `#FFFBEB` | `bg-amber-50` | 경고 배경 |
| **Error** | error-500 | `#EF4444` | `bg-red-500` | 오류, error 상태 |
| Error BG | error-50 | `#FEF2F2` | `bg-red-50` | 오류 배경 |
| **Info** | info-500 | `#3B82F6` | `bg-blue-500` | 정보, 도움말 |
| Info BG | info-50 | `#EFF6FF` | `bg-blue-50` | 정보 배경 |

### 3-6. Agent Status Colors (에이전트 전용)

| 상태 | Hex | Tailwind | 표시 방법 |
|------|-----|----------|-----------|
| online | `#10B981` | `bg-emerald-500` | 초록 점 |
| working | `#F97316` | `bg-orange-500` | 주황 점 + 애니메이션 |
| error | `#EF4444` | `bg-red-500` | 빨간 점 |
| offline | `#A8A29E` | `bg-stone-400` | 회색 점 |

---

## 4. Typography

Google Fonts에서 무료 사용 가능한 폰트로 구성.

### 헤딩 폰트: Plus Jakarta Sans

현대적이고 따뜻한 기하학적 산세리프. Figma UI와 유사한 느낌.

```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```css
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

Tailwind: `font-['Plus_Jakarta_Sans']` 또는 커스텀 `font-display`

### 본문 폰트: Inter

가장 읽기 편한 UI 폰트. Figma, Linear, Notion에서 사용.

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

Tailwind: `font-['Inter']` 또는 커스텀 `font-body`

### 코드 폰트: JetBrains Mono

소울 에디터, API 키, JSON 뷰어용.

```html
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

Tailwind: `font-mono`

### 타이포그래피 스케일

| 레벨 | 크기 | 무게 | 라인높이 | Tailwind | 용도 |
|------|------|------|----------|----------|------|
| Display | 48px | 800 | 1.1 | `text-5xl font-extrabold leading-tight` | 랜딩, 빈 상태 헤드라인 |
| H1 | 36px | 700 | 1.2 | `text-4xl font-bold leading-tight` | 페이지 제목 |
| H2 | 28px | 700 | 1.25 | `text-3xl font-bold leading-snug` | 섹션 제목 |
| H3 | 22px | 600 | 1.3 | `text-2xl font-semibold leading-snug` | 카드 제목 |
| H4 | 18px | 600 | 1.4 | `text-lg font-semibold` | 소제목, 라벨 그룹 |
| Body Large | 16px | 400 | 1.6 | `text-base leading-relaxed` | 기본 본문 |
| Body | 14px | 400 | 1.6 | `text-sm leading-relaxed` | 설명 텍스트 |
| Caption | 12px | 400 | 1.4 | `text-xs` | 메타 정보, 타임스탬프 |
| Label | 12px | 500 | 1.2 | `text-xs font-medium tracking-wide uppercase` | 섹션 라벨 |
| Code | 13px | 400 | 1.5 | `text-[13px] font-mono` | 코드, API 키 |

---

## 5. Voice & Tone

### 핵심 원칙
- **한국어 존댓말** (모든 UI 텍스트)
- **간결하고 행동 중심** (동사로 끝나는 버튼 레이블)
- **에러는 원인+해결책** (두려움 없이 다음 행동을 안내)

### 버튼 레이블 가이드

| 상황 | Good ✓ | Bad ✗ |
|------|---------|--------|
| 저장 | `저장하기` | `저장` |
| 삭제 확인 | `삭제하기` | `확인` |
| 추가 | `부서 추가` | `+` |
| 취소 | `취소` | `No` / `Cancel` |
| 더보기 | `더 보기` | `See more` |
| 실행 | `명령 실행` | `Go` |

### 빈 상태(Empty State) 텍스트

| 화면 | 제목 | 설명 |
|------|------|------|
| 에이전트 없음 | `아직 에이전트가 없어요` | `첫 번째 AI 직원을 추가하고 팀을 구성해보세요.` |
| 명령 없음 | `명령 내역이 없어요` | `왼쪽 입력창에 명령을 입력해보세요.` |
| 보고서 없음 | `생성된 보고서가 없어요` | `에이전트에게 보고서 작성을 명령해보세요.` |
| 알림 없음 | `모두 확인했어요 ✓` | `새 알림이 오면 여기서 보여드릴게요.` |

### 에러 메시지 가이드

| 상황 | 메시지 형식 |
|------|-------------|
| 네트워크 오류 | `연결이 끊겼어요. 잠시 후 다시 시도해주세요.` |
| 권한 없음 | `이 작업은 관리자만 할 수 있어요.` |
| 필드 미입력 | `부서 이름을 입력해주세요.` |
| 삭제 불가 | `시스템 에이전트는 삭제할 수 없어요.` |
| 예산 초과 | `이번 달 예산의 90%를 사용했어요. 한도를 조정해보세요.` |

### 성공 메시지 가이드

| 상황 | 메시지 |
|------|--------|
| 저장 완료 | `저장됐어요.` |
| 에이전트 생성 | `{이름} 에이전트가 팀에 합류했어요!` |
| 명령 완료 | `작업을 완료했어요.` |
| 삭제 완료 | `삭제했어요.` |

---

## 6. Spacing System

기본 단위: **4px (0.25rem)**. Tailwind의 기본 spacing scale 사용.

### 컴포넌트 내부 패딩

| 컴포넌트 | 패딩 | Tailwind |
|----------|------|----------|
| 버튼 (sm) | 6px 12px | `py-1.5 px-3` |
| 버튼 (md) | 8px 16px | `py-2 px-4` |
| 버튼 (lg) | 10px 20px | `py-2.5 px-5` |
| 입력 (md) | 8px 12px | `py-2 px-3` |
| 카드 | 20px 24px | `p-5` 또는 `py-5 px-6` |
| 모달 | 24px | `p-6` |
| 사이드바 항목 | 8px 12px | `py-2 px-3` |
| 드롭다운 항목 | 8px 12px | `py-2 px-3` |
| 섹션 | 32px 0px | `py-8` |

### 컴포넌트 간격

| 관계 | 간격 | Tailwind |
|------|------|----------|
| 라벨 ↔ 입력 | 6px | `gap-1.5` |
| 입력 ↔ 도움말 | 4px | `gap-1` |
| 폼 필드 간 | 16px | `gap-4` |
| 카드 간 | 16px | `gap-4` |
| 섹션 간 | 32px | `gap-8` |
| 사이드바 섹션 | 24px | `gap-6` |

### 레이아웃 간격

| 영역 | 값 | Tailwind |
|------|-----|----------|
| 사이드바 너비 | 240px | `w-60` |
| 콘텐츠 최대 너비 | 1200px | `max-w-[1200px]` |
| 페이지 패딩 | 24px | `p-6` |
| 그리드 갭 | 16px | `gap-4` |
| 헤더 높이 | 56px | `h-14` |

---

## 7. Border Radius System

따뜻하고 친근한 느낌을 위해 넉넉한 둥근 모서리 사용. Notion/Figma 스타일.

| 컴포넌트 | 반경 | Tailwind |
|----------|------|----------|
| 버튼 (sm/md) | 8px | `rounded-lg` |
| 버튼 (full) | 9999px | `rounded-full` |
| 입력 필드 | 8px | `rounded-lg` |
| 카드 | 12px | `rounded-xl` |
| 모달 | 16px | `rounded-2xl` |
| 드롭다운 | 10px | `rounded-[10px]` |
| 배지/태그 | 6px | `rounded-md` |
| 알림 토스트 | 12px | `rounded-xl` |
| 아바타 | 50% | `rounded-full` |
| 진행 바 | 9999px | `rounded-full` |
| 이미지 카드 | 12px | `rounded-xl` |
| 사이드바 메뉴 항목 | 8px | `rounded-lg` |
| 툴팁 | 6px | `rounded-md` |

---

## 8. Shadow System

부드럽고 자연스러운 그림자. 따뜻한 보라빛 그림자 tint.

| Token | CSS 값 | Tailwind | 용도 |
|-------|--------|----------|------|
| shadow-xs | `0 1px 2px 0 rgba(0,0,0,0.05)` | `shadow-sm` | 입력 필드, 작은 요소 |
| shadow-sm | `0 1px 3px 0 rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.06)` | `shadow` | 카드, 버튼 호버 |
| shadow-md | `0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)` | `shadow-md` | 드롭다운, 팝오버 |
| shadow-lg | `0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)` | `shadow-lg` | 모달, 사이드패널 |
| shadow-xl | `0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)` | `shadow-xl` | 풀스크린 오버레이 |
| shadow-violet | `0 4px 14px 0 rgba(139,92,246,0.15)` | `shadow-[0_4px_14px_0_rgba(139,92,246,0.15)]` | Primary 버튼 호버 |

---

## 9. Icon System

| 항목 | 값 |
|------|-----|
| 라이브러리 | Lucide Icons (오픈소스, 일관된 스타일) |
| 스타일 | Outlined (외곽선 아이콘) |
| 스트로크 두께 | 1.5px |
| 그리드 | 24×24px |
| 크기 | 16px (인라인), 20px (버튼), 24px (메뉴), 32px (빈 상태) |
| CDN | `https://unpkg.com/lucide@latest` |

---

## 10. Animation & Transition

| Token | 값 | 용도 |
|-------|----|------|
| transition-fast | `150ms ease-out` | 호버, 포커스 |
| transition-normal | `200ms ease-out` | 버튼, 토글 |
| transition-slow | `300ms ease-in-out` | 모달 오픈, 사이드패널 |
| transition-spring | `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` | 드롭다운 스프링 |

에이전트 `working` 상태: `animate-pulse` (주황 점 깜빡임)
로딩 스피너: `animate-spin` (violet-500 색상)
