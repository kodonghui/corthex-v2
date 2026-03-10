# CORTHEX v2 — Design Masters

> Creator + THE WORLD | 라이트 테마 | Figma/Notion/Slack

---

## 선택한 거장 3인

### 1. Josef Müller-Brockmann — "그리드는 질서의 언어다"

> "The grid system is an aid, not a guarantee. It permits a number of possible uses and each designer can look for a solution appropriate to his personal style. But one must learn how to use the grid; it is an art that requires practice." — JMB

**CORTHEX 적용 규칙 3개**:

1. **규칙: 12-컬럼 그리드를 모든 페이지에 엄수**
   - 적용: 대시보드 KPI (span-3), 카드 목록 (span-4), 사이드 패널 (span-4)
   - Before: `w-1/3 float-left margin:10px` → After: `grid grid-cols-12 gap-4`
   - 대상: 모든 Admin/App 페이지 레이아웃

2. **규칙: 타이포그래피 스케일에서 벗어나지 않는다**
   - 12/14/16/18/24/32/48px 외 임의 크기 금지
   - Before: `text-[15px]` (임의) → After: `text-sm` (14px, 표준)
   - 대상: 모든 텍스트 요소

3. **규칙: 여백은 콘텐츠와 같은 비중으로 설계**
   - 카드 패딩은 콘텐츠 높이의 최소 15% 이상
   - Before: `p-2` (8px) → After: `p-5` (20px) for 카드
   - 대상: 카드, 섹션, 모달

**절대 하지 않을 것 2가지**:
- 비정렬 텍스트 블록: `text-justify` (가독성 파괴) → 항상 `text-left`
- 일관성 없는 간격: `mt-3 mb-7 pt-5` 혼재 → 간격 토큰 4px 배수만

**Cheat Sheet 기여**:
| 상황 | 원칙 | Tailwind |
|------|------|----------|
| 레이아웃 설계 | 12-컬럼 그리드 | `grid grid-cols-12 gap-4` |
| 정렬 확인 | 모든 요소 격자 정렬 | `items-start` + 공통 left-edge |

---

### 2. Dieter Rams — "Less but better"

> "Good design is as little design as possible." — Dieter Rams

**CORTHEX 적용 규칙 3개**:

1. **규칙: 모든 시각적 요소에 존재 이유가 있어야 한다**
   - 장식적 선, 불필요한 그라디언트, 순수 장식 아이콘 제거
   - Before: `bg-gradient-to-br from-violet-500 to-indigo-600` (배경 그라디언트) → After: `bg-white` (단색)
   - 그라디언트 허용: 빈 상태 히어로, 배지 배경 (아주 미미한 것만)
   - 대상: 카드 배경, 사이드바, 헤더

2. **규칙: 기능이 형태를 결정한다**
   - 버튼 크기는 클릭 가능성에 비례 (최소 44×44px 터치 타겟)
   - 아이콘은 텍스트와 함께 (아이콘만으로 의미 전달 금지 — 비개발자 타겟)
   - Before: 아이콘 버튼만 `<button><i data-lucide="trash-2"></i></button>` → After: 아이콘+텍스트 또는 툴팁
   - 대상: 모든 액션 버튼

3. **규칙: 제품은 최대한 적은 것을 가르쳐야 한다**
   - 표준 패턴 사용 (사이드바, 헤더, 카드, 테이블 — 낯선 레이아웃 금지)
   - 새 기능 = 기존 컴포넌트 조합으로 해결
   - Before: 복잡한 커스텀 위젯 → After: 카드 + 뱃지 + 버튼 조합
   - 대상: 모든 신규 페이지 설계

**절대 하지 않을 것 2가지**:
- 다중 Primary 버튼: 한 뷰에 `bg-violet-600` 버튼 2개 이상 → 위계 파괴
- 불필요한 애니메이션: 장식용 `transition hover:rotate-3` → 에이전트 상태같은 의미 있는 곳에만

**Cheat Sheet 기여**:
| 상황 | 원칙 | Tailwind |
|------|------|----------|
| 장식 제거 | Less but better | 그라디언트/복잡한 shadow 최소화 |
| 버튼 설계 | 기능 우선 | 아이콘+텍스트 병용, min 44px |

---

### 3. Massimo Vignelli — "인터페이스는 일관성이 전부다"

> "The life of a designer is a life of fight: fight against the ugliness." — Vignelli

**CORTHEX 적용 규칙 3개**:

1. **규칙: 색상은 3가지 이하만 사용한다**
   - 기능 색상: Violet(CTA) + Orange(AI실행) + Stone(뉴트럴)
   - Semantic 색상(Green/Red/Amber)은 상태 표시에만
   - Before: `text-blue-600 text-purple-700 text-indigo-500` 혼재 → After: `text-violet-600` 통일
   - 대상: 모든 강조 색상

2. **규칙: 같은 정보는 항상 같은 위치에**
   - 페이지 제목: 항상 좌상단 (헤더 내 또는 콘텐츠 상단)
   - 주요 액션 버튼: 항상 우상단 또는 테이블 위 우측
   - 날짜/타임스탬프: 항상 최우측 또는 최하단
   - 대상: 모든 페이지

3. **규칙: 컴포넌트 변형은 3가지 이하**
   - 버튼: Primary(violet) / Secondary(white+border) / Ghost(text only)
   - 카드: Default / Compact / Featured (3가지만)
   - 배지: Status 배지 / Label 배지 (2가지만)

**절대 하지 않을 것 2가지**:
- 레이아웃마다 다른 정렬 방식: 어떤 페이지는 centered, 어떤 페이지는 left-aligned → 통일
- 컴포넌트 임의 변형: `rounded-xl` 기본 카드 중 일부에만 `rounded-2xl` → 일관성 파괴

**Cheat Sheet 기여**:
| 상황 | 원칙 | Tailwind |
|------|------|----------|
| 색상 적용 | 최대 3색 | violet + orange + stone |
| 위치 일관성 | 정보는 예측 가능한 위치 | 제목 좌상단, 액션 우상단 |

---

## Design Masters 종합 Cheat Sheet

| 상황 | 거장 | 원칙 | Tailwind 예시 |
|------|------|------|---------------|
| 레이아웃 설계 | Müller-Brockmann | 12-컬럼 그리드 엄수 | `grid grid-cols-12 gap-4` |
| 여백 설계 | Müller-Brockmann | 여백도 콘텐츠 | `p-5` 카드, `p-6` 페이지 |
| 불필요한 장식 | Rams | Less but better | 그라디언트 배경 제거, 단색 사용 |
| 아이콘 사용 | Rams | 기능 우선 | 아이콘+텍스트 병용, 아이콘만 금지 |
| 색상 절제 | Vignelli | 3색 이하 | violet + orange + stone |
| 정보 위치 | Vignelli | 일관성 | 제목=좌상단, 액션=우상단 상수 |
| 컴포넌트 변형 | Vignelli | 최소 변형 | 버튼 3종, 카드 3종 |
| 타이포 스케일 | Müller-Brockmann | 표준 스케일 | 12/14/16/18/24/32/48만 |
