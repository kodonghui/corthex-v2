# CORTHEX v2 — Jungian Archetypes Analysis

> 참조 브랜드 시스템: `01-brand-systems.md`

---

## 1. Primary Archetype: THE CREATOR (창조자)

**Core Drive**: 혁신, 상상, 자기표현 — "나만의 것을 만든다"

**선택 이유**:
CORTHEX v2의 핵심 행동은 **조직 설계**다. 사용자는 부서를 만들고, AI 직원을 배치하고, 조직도를 그린다. 이것은 본질적으로 창조 행위다. Figma가 디자이너에게 Canvas를 주듯, CORTHEX는 CEO에게 AI 조직을 설계하는 Workspace를 제공한다. Creator 원형은 Notion/Figma/Linear 같은 현대적 도구들이 공유하는 "당신이 만드는 것"의 감성을 그대로 담는다. "코드 없이 나만의 AI 회사를 만든다"는 브랜드 에센스 자체가 Creator다.

**UI 표현**:
- 조직 설계 화면 = Canvas/Workspace 메타포
- 드래그 앤 드롭으로 부서 재배치
- 빈 상태 → 창조 초대 메시지 ("첫 번째 부서를 만들어보세요")
- 생성 버튼은 항상 눈에 띄는 위치

---

## 2. Secondary Archetype: THE MAGICIAN (마법사)

**Core Drive**: 변환, 지식, 힘 — "불가능을 가능하게"

**선택 이유**:
자연어 명령 한 줄이 → AI 오케스트레이션 → 완성된 보고서로 변환되는 과정이 곧 마법이다. 비개발자 CEO 입장에서 복잡한 AI 작업이 마치 마법처럼 실행되어야 한다. Magician 원형은 이 "변환의 경험"을 설명한다. 명령을 입력하는 순간 → 에이전트가 활성화되고 → 결과가 나타나는 시퀀스에서 경이로움을 느끼게 설계한다.

**UI 표현**:
- 명령 입력 → 점진적 실행 상태 표시 (에이전트가 깨어나는 애니메이션)
- 위임 체인 시각화 (명령이 부서를 통해 흘러가는 모습)
- 완성된 보고서 등장 = 클라이맥스 순간

---

## 3. Shadow Archetype: THE REBEL (반란자) — 피해야 할 것

**피해야 하는 이유**:
타겟 사용자인 비개발자 CEO는 익숙하지 않은 UI에서 혼란을 느낀다. Rebel 원형의 비대칭 레이아웃, 깨진 그리드, 예측 불가한 인터랙션, 도발적 언어는 신뢰를 파괴한다. CEO가 비즈니스를 맡기는 도구가 혼란스럽거나 "쿨하게 다른" 방향으로 가면 안 된다. 또한 Slack/Notion처럼 친근하고 예측 가능한 패턴에서 벗어나면 학습 비용이 증가한다.

**구체적으로 피할 것**:
- 비대칭 레이아웃 → 안정적인 좌측 사이드바 + 오른쪽 콘텐츠 구조 유지
- 글리치 효과, 인더스트리얼 폰트 → 사용 금지
- "불필요하게 독특한" UI 패턴 → 익숙한 컴포넌트 패턴 사용

---

## 4. UI Behavioral Patterns

### 4-1. Creator Primary Patterns

**사이드바 — 창조 도구 패널**
```
Notion/Figma 스타일 좌측 사이드바:
w-60 fixed left-0 h-screen bg-white border-r border-stone-200

섹션 분류:
- 주요 워크스페이스 (홈, 사령관실, 대시보드)
- 조직 (에이전트, 부서, 조직도)
- 작업 도구 (SNS, 트레이딩, 지식, 파일)
- 기록 (보고서, 작전일지, 비용)
```

**빈 상태 — 창조 초대**
```html
<!-- Creator Empty State Pattern -->
<div class="flex flex-col items-center justify-center py-16 px-8 text-center">
  <div class="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
    <i data-lucide="plus-circle" class="w-8 h-8 text-violet-500"></i>
  </div>
  <h3 class="text-xl font-semibold text-stone-800 mb-2">첫 번째 에이전트를 추가해보세요</h3>
  <p class="text-sm text-stone-500 mb-6 max-w-xs">AI 직원이 팀에 합류하면 자동으로 업무를 처리해요.</p>
  <button class="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150">
    에이전트 추가
  </button>
</div>
```

**카드 — 창조 결과물**
```
rounded-xl border border-stone-200 bg-white p-5 shadow-sm
hover:shadow-md hover:border-violet-200 transition-all duration-200
```

**생성 버튼 — 주요 행동**
```
bg-violet-600 hover:bg-violet-700 active:bg-violet-800
text-white font-medium rounded-lg px-4 py-2
shadow-sm hover:shadow-[0_4px_14px_0_rgba(139,92,246,0.25)]
transition-all duration-150
```

### 4-2. Magician Secondary Patterns

**명령 실행 — 변환의 시작**
```html
<!-- 명령 입력 박스 — Magician 스타일 -->
<div class="relative">
  <textarea
    class="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 pr-12
           text-sm text-stone-800 placeholder-stone-400
           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
           shadow-sm transition-all duration-200"
    placeholder="무엇을 해드릴까요? 자연어로 명령해주세요..."
  ></textarea>
  <button class="absolute right-3 bottom-3 bg-violet-600 hover:bg-violet-700
                 text-white rounded-lg p-2 transition-colors duration-150">
    <i data-lucide="send" class="w-4 h-4"></i>
  </button>
</div>
```

**에이전트 활성화 — 마법 순간**
```html
<!-- Working 상태 에이전트 뱃지 -->
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
             bg-orange-50 text-orange-600 text-xs font-medium">
  <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
  작업 중
</span>
```

**위임 체인 — 마법이 흐르는 시각화**
```
수직 타임라인 패턴:
border-l-2 border-violet-200 ml-4 pl-4 space-y-4

각 단계:
- 원형 아이콘 (에이전트 아바타)
- 에이전트 이름 + 역할
- 실행 중 → pulse 애니메이션 (border-violet-500)
- 완료 → 초록 체크 (border-emerald-500)
```

---

## 5. Color Mapping

| 원형 | 역할 | 색상 | Hex | Tailwind |
|------|------|------|-----|----------|
| **Creator** | 메인 행동, CTA | Primary Violet | `#8B5CF6` | `bg-violet-500` |
| **Creator** | 창조 배경, 강조 | Primary-50 | `#F5F3FF` | `bg-violet-50` |
| **Creator** | 생성 버튼 | Primary-600 | `#7C3AED` | `bg-violet-600` |
| **Magician** | AI 실행 중 | Accent Orange | `#F97316` | `bg-orange-500` |
| **Magician** | 변환 배경 | Orange-50 | `#FFF7ED` | `bg-orange-50` |
| **Magician** | 완료 상태 | Success Emerald | `#10B981` | `bg-emerald-500` |
| **Shadow** (피함) | 혼란, 위험 | Red/Chaotic | — | `bg-red-500` (에러에만 사용) |
| **Base** | 배경, 캔버스 | Warm Stone | `#FAFAF9` | `bg-stone-50` |
| **Base** | 카드 | Pure White | `#FFFFFF` | `bg-white` |

---

## 6. Typography Mapping

### Creator 타이포그래피
헤딩 폰트: **Plus Jakarta Sans** — 현대적, 따뜻함, 창조적
```css
/* 페이지 제목, 카드 제목 */
font-family: 'Plus Jakarta Sans', sans-serif;
font-weight: 700; /* font-bold */
letter-spacing: -0.02em; /* tracking-tight */
color: #1C1917; /* text-stone-900 */
```

### Magician 타이포그래피
명령 결과, 보고서, AI 출력: **Inter** — 읽기 좋음, 신뢰감
```css
/* AI 보고서, 에이전트 메시지 */
font-family: 'Inter', sans-serif;
font-weight: 400; /* font-normal */
line-height: 1.75; /* leading-7 */
color: #292524; /* text-stone-800 */
```

### Creator+Magician 조합 규칙
| 요소 | 폰트 | 무게 | 크기 | Tailwind |
|------|------|------|------|----------|
| 페이지 제목 | Plus Jakarta Sans | 700 | 28px | `text-3xl font-bold tracking-tight` |
| 카드 제목 | Plus Jakarta Sans | 600 | 18px | `text-lg font-semibold` |
| 본문 | Inter | 400 | 14px | `text-sm leading-relaxed` |
| AI 출력 | Inter | 400 | 15px | `text-[15px] leading-7` |
| 메타/라벨 | Inter | 500 | 12px | `text-xs font-medium text-stone-500` |
| 버튼 | Plus Jakarta Sans | 600 | 14px | `text-sm font-semibold` |

---

## 7. Archetype Interaction Summary

```
Creator + Magician = "당신이 설계하면, AI가 마법을 부린다"

Creator UI 역할:
- 조직 설계 (부서, 에이전트 CRUD)
- 소울 에디터 (에이전트 성격 설정)
- 워크플로우 빌더 (Nexus)
- 템플릿 선택 (빠른 조직 시작)

Magician UI 역할:
- 사령관실 명령 입력 → 실행 스트리밍
- 위임 체인 시각화
- AI 보고서 생성 순간
- 에이전트 상태 (working 애니메이션)

Creator → 사용자가 무언가를 만들 때: 바이올렛
Magician → AI가 실행/변환 중일 때: 오렌지
완료/성공 → 에메랄드 (결과물 탄생)
```
