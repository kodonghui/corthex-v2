# CORTHEX v2 — Design Movements

> Creator + THE WORLD | 라이트 테마 | Figma/Notion/Slack 스타일

---

## 선택한 무브먼트

### Primary: Swiss International Style (국제 타이포그래피 스타일)

**시대**: 1950년대 스위스 → 현대 디지털 UI 기반
**핵심 특징**: 그리드 기반 레이아웃, 산세리프 타이포그래피, 오브젝티브한 명확성, 기능주의

**차용할 요소 3가지**:

1. **정교한 그리드 시스템**
   - 12-컬럼 그리드를 엄격하게 준수
   - 모든 요소가 그리드 선에 정렬
   - Tailwind: `grid grid-cols-12 gap-4` + 각 요소에 `col-span-N`
   - 적용: 모든 페이지 레이아웃, 대시보드, 카드 목록

2. **산세리프 타이포그래피 위계**
   - Helvetica 정신 → Plus Jakarta Sans (현대적 따뜻한 버전)
   - 굵기로 위계를 만들고, 장식 없음
   - 헤딩: 700-800 weight, 본문: 400, 라벨: 600
   - Tailwind: `font-bold tracking-tight` (헤딩) / `font-normal leading-relaxed` (본문)

3. **정보의 오브젝티브 표현**
   - 데이터는 숫자와 아이콘으로 명확하게
   - 감정적 언어보다 사실 중심 (에이전트 상태: "작업 중" 아닌 "✓ 완료")
   - 테이블, 차트, 메트릭 카드 = Swiss Style의 핵심
   - Tailwind: `tabular-nums font-mono` (숫자), `text-stone-500 text-xs uppercase` (레이블)

**차용하지 않을 요소**:
- 냉정하고 기계적인 느낌: Swiss는 차가울 수 있다 → Stone 뉴트럴로 따뜻하게 완화
- 극도의 미니멀리즘: 한국 비개발자 CEO에게는 적절한 시각적 가이드 필요

**Swiss + Creator 조합 효과**:
`Swiss International Style + Creator = 명확하게 구조화된 창조 Workspace`
→ Figma, Linear, Notion이 정확히 이 조합. 깔끔하지만 창의적이고 따뜻한.

---

### Secondary: Flat Design 2.0 (마이크로소프트 Fluent / Google Material 3 계열)

**시대**: 2013년 iOS 7 플랫 디자인 → 2020년대 Material You/Fluent 2
**핵심 특징**: 순수 플랫에서 진화, 부드러운 그림자+색상+둥근 모서리로 깊이감 추가

**차용할 요소 3가지**:

1. **부드러운 그림자와 깊이감 (Soft UI)**
   - 그림자는 존재하지만 과하지 않음 (shadow-sm, shadow-md)
   - 카드가 배경에서 자연스럽게 떠오르는 느낌
   - Tailwind: `shadow-sm hover:shadow-md transition-shadow`
   - 적용: 카드, 드롭다운, 모달

2. **색상으로 의미 전달 (Semantic Colors)**
   - 상태를 색상 배지로 즉시 인식
   - 의미 있는 색상 사용 (violet=창조, orange=실행, green=완료)
   - Tailwind: `bg-emerald-50 text-emerald-700` (성공), `bg-orange-50 text-orange-600` (실행 중)
   - 적용: 에이전트 상태, 작업 상태, 알림

3. **둥근 모서리로 친근함 표현**
   - Material 3의 "expressive shapes" 영향
   - 버튼 `rounded-lg`, 카드 `rounded-xl`, 모달 `rounded-2xl`
   - 적용: 모든 컴포넌트

**차용하지 않을 요소**:
- 순수 플랫 (그림자 없음): 카드와 배경 구분이 안 됨 → stone-50 배경 + white 카드 + shadow 유지
- Material Design의 복잡한 ripple 효과: 한국 CEO에게 익숙하지 않음 → 심플한 hover 배경색 변화

**Flat 2.0 + Magician 조합 효과**:
`Flat Design 2.0 + Magician = AI가 마법처럼 실행되는 깔끔한 인터페이스`
→ Slack, Notion의 상태 배지 시스템. 복잡한 AI 상태를 직관적으로 표현.

---

## Movement Application Guide

### Swiss + Flat 2.0 = CORTHEX v2 스타일

```
Swiss가 제공하는 것:
- 12-컬럼 그리드 (구조)
- 타이포그래피 위계 (명확성)
- 정보의 객관적 표현 (신뢰)

Flat 2.0이 제공하는 것:
- 부드러운 그림자 (깊이감)
- 둥근 모서리 (친근함)
- 색상 시맨틱 (직관성)

결합 결과:
- 구조화되어 있지만 따뜻한
- 명확하지만 친근한
- 전문적이지만 겁나지 않는
→ Notion + Figma + Slack의 교집합
```

### 컴포넌트별 무브먼트 적용

| 컴포넌트 | Swiss 영향 | Flat 2.0 영향 | 결과 |
|----------|-----------|--------------|------|
| 레이아웃 | 12-컬럼 그리드 엄수 | — | `grid grid-cols-12 gap-4` |
| 카드 | 정렬, 위계 | rounded-xl, shadow-sm | `rounded-xl border border-stone-200 shadow-sm bg-white p-5` |
| 버튼 | 기능 명확성 | rounded-lg, 색상 의미 | `bg-violet-600 rounded-lg` |
| 배지 | 짧고 명확한 텍스트 | 배경색으로 의미 | `bg-emerald-50 text-emerald-700 rounded-full` |
| 테이블 | 정렬, 컬럼 너비 그리드 | 행 hover 배경 | `hover:bg-stone-50 divide-y divide-stone-100` |
| 헤더 | 좌측 정렬 네비 | 흰 배경, 하단 보더 | `bg-white border-b border-stone-200` |
| 폼 | 수직 스택, 일관 간격 | rounded-lg 입력 | `space-y-4` 폼 + `rounded-lg border-stone-200` 입력 |
| 차트 | 그리드 라인 정렬 | 색상 의미 (violet/orange) | 바이올렛 primary, 오렌지 secondary |

### Do / Don't (무브먼트 기반)

```
✅ DO:
- 그리드 선에 정렬: grid + col-span 사용
- 산세리프 위계: Plus Jakarta Sans bold heading, Inter regular body
- 부드러운 shadow: shadow-sm hover:shadow-md
- 색상 의미 일관: violet=액션, orange=실행, green=완료
- 둥근 모서리: rounded-lg/xl/2xl 체계

❌ DON'T:
- 그리드 벗어나는 임의 요소: margin: 13px (4px 배수 위반)
- 장식적 serif: 본문 serif 폰트 사용 (Swiss 위반)
- 과한 그림자: shadow-2xl on 카드 (Flat 2.0 위반)
- 날카로운 모서리: rounded-none, rounded-sm
- 중앙 정렬 레이아웃: 텍스트 center, 요소 center (Swiss는 좌정렬 선호)
```
