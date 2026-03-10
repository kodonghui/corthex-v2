# CORTHEX v2 — Major Arcana Card Selection

> 참조: `01-brand-systems.md` + `02-jungian-archetypes.md`
> Primary Archetype: Creator | Secondary: Magician
> 색상: Warm Violet #8B5CF6, Orange Accent #F97316

---

## 1. Primary Card: XXI. THE WORLD (세계)

**선택 이유**:
THE WORLD의 "Cosmic Violet (#8b5cf6)"은 브랜드 Primary 컬러와 **완벽히 일치**한다. "당신만의 AI 회사를 만든다"는 브랜드 에센스와 THE WORLD의 "완성, 총체성, 조화"는 같은 의미다. CEO가 조직을 설계하고 AI가 작동하기 시작하는 순간이 바로 THE WORLD — 나만의 완전한 세계를 창조하는 경험이다. Creator 원형의 창조 행위가 THE WORLD 카드에서 그 정점을 찍는다.

**카드 속성 → 라이트 테마 적용**:
- 원본: 짙은 보라+초록+금 배경 → **라이트 테마로 전환**: 흰 배경 + violet/emerald/amber 포인트
- 음울함 제거, 축제적이고 활기찬 라이트 버전 사용

---

## 2. Secondary Card: XIX. THE SUN (태양)

**선택 이유**:
THE SUN의 "Sunshine Orange (#fb923c)"은 브랜드 Accent 오렌지 컬러 `#F97316`와 정확히 대응한다. AI가 명령을 실행할 때 — 에이전트가 활성화되고 결과가 도출되는 순간 — THE SUN의 "활력, 성공, 생명력"이 드러난다. Magician 원형이 변환의 마법을 부릴 때, 그 결과는 THE SUN처럼 환하게 빛나야 한다. 따뜻하고 기쁜 라이트 테마에 최적화된 카드.

---

## 3. Mood Board

### Primary Card (THE WORLD) 무드 키워드

1. **완성 (Completion)** — 조직 구성 완료, 보고서 완성 순간의 충족감
2. **조화 (Harmony)** — 부서-에이전트-Human이 함께 작동하는 균형감
3. **가능성 (Possibility)** — 이 도구로 무엇이든 만들 수 있다는 열린 느낌
4. **축하 (Celebration)** — 작업 완료 시 따뜻한 성취감
5. **총체성 (Wholeness)** — 흩어진 AI 도구들이 하나의 조직으로 통합되는 감각

### Color Influence (라이트 테마 버전)

| 원형/카드 | 색상 이름 | Hex | Tailwind | 브랜드 역할 |
|----------|---------|-----|----------|-----------|
| THE WORLD (Cosmic Violet) | 창조 바이올렛 | `#8B5CF6` | `text-violet-500 bg-violet-500` | **Primary — 이미 브랜드 컬러** |
| THE WORLD (Earth Green → 라이트) | 완성 에메랄드 | `#10B981` | `bg-emerald-500` | **Success/완료 색상 — 확인** |
| THE WORLD (Celebration Gold → 라이트) | 축하 앰버 | `#F59E0B` | `bg-amber-500` | Warning/가치 표시에 사용 |
| THE SUN (Solar Gold) | 태양 금색 | `#FBBF24` | `bg-yellow-400` | 배지, 하이라이트 (새로 추가) |
| THE SUN (Sunshine Orange) | 액션 오렌지 | `#F97316` | `bg-orange-500` | **Accent — 이미 브랜드 컬러** |
| THE SUN (Daylight Yellow) | 밝은 배경 | `#FEF9C3` | `bg-yellow-100` | 성공 완료 섹션 배경 (라이트) |

**라이트 테마 확인**:
- 배경: `bg-stone-50` (#FAFAF9) → 따뜻한 흰색 ✓
- 카드: `bg-white` (#FFFFFF) ✓
- 짙은 배경/다크모드 금지 ✓

---

## 4. Page-Specific Card Mapping

| 페이지 | 카드 | 이유 | 색상 힌트 |
|--------|------|------|-----------|
| **홈 대시보드** | THE WORLD | 전체 조직 현황 = 완성된 세계를 한눈에 봄. 총체적 시야 | Violet primary + Emerald 지표 |
| **사령관실 (Command Center)** | THE SUN | AI가 명령을 받아 활성화되는 순간 = 태양이 뜨는 것. 에너지와 활력 | Orange 활성 상태, 밝은 배경 |
| **에이전트 관리** | THE WORLD + Creator 조합 | 에이전트를 설계하고 배치하는 행위 = 세계 창조 | Violet 카드, 흰 배경, 초록 상태 |
| **Admin 대시보드** | THE WORLD (Ruler 변형) | 관리자가 전체를 조망하고 통제 = 세계의 조율자 | Violet + Indigo 톤 (약간 더 진지하게) |
| **보고서/작전일지** | THE SUN | 완성된 결과물 = 빛나는 성과 | Warm amber 배경, 밝은 카드 |
| **비용 대시보드** | THE WORLD | 전체 비용 현황 = 조직 생태계 총괄 | Violet + Amber 경고 |
| **소울 에디터** | THE MAGICIAN (Violet) | 에이전트 성격 설계 = 마법사 주문 작성 | Violet 짙게, 신비로운 느낌 |
| **Nexus (워크플로우)** | THE WORLD | 흐름도 = 연결된 세계의 구조 | Violet 연결선, 흰 노드 |
| **Agora (토론)** | THE SUN | 여러 에이전트가 의견을 내는 활력 = 태양 아래 광장 | Orange 활기 |
| **Trading** | WHEEL OF FORTUNE | 투자 = 운의 수레바퀴. 사이클과 변동 | Violet + Gold 차트 |

---

## 5. The World × Creator 라이트 테마 적용 규칙

### THE WORLD in Light Mode

```html
<!-- 홈 대시보드 히어로 섹션 -->
<div class="bg-gradient-to-br from-violet-50 via-white to-emerald-50 rounded-2xl p-8">
  <!-- Cosmic Violet 포인트 -->
  <span class="text-violet-600 font-semibold text-sm">오늘의 작전 현황</span>
  <h1 class="text-3xl font-bold text-stone-900 mt-1">나만의 AI 조직이</h1>
  <h1 class="text-3xl font-bold text-violet-600">오늘도 일하고 있어요</h1>
</div>

<!-- 완료 상태 카드 (Celebration Gold) -->
<div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
  <span class="text-amber-600 font-medium">✓ 작업 완료</span>
</div>

<!-- 성공/완료 상태 (Earth Green) -->
<span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700
             rounded-full px-3 py-1 text-xs font-medium">
  <span class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
  완료
</span>
```

### THE SUN in Light Mode (사령관실)

```html
<!-- 명령 결과 완료 순간 -->
<div class="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
  <div class="flex items-center gap-2 text-orange-600 font-semibold mb-2">
    <i data-lucide="sun" class="w-5 h-5"></i>
    작업 완료됐어요!
  </div>
  <p class="text-stone-700 text-sm leading-relaxed">보고서가 준비됐어요...</p>
</div>

<!-- 에이전트 활성화 (Sunshine Orange) -->
<div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
```

---

## 6. 카드 조합 최종 선언

```
CORTHEX v2 = THE WORLD + THE SUN
             (라이트 테마 버전)

빛이 가득한 작업공간에서:
- Creator(당신)가 조직이라는 세계를 설계하고 (THE WORLD → Violet)
- Magician(AI)이 태양처럼 활기차게 명령을 실행한다 (THE SUN → Orange)
- 결과는 완성된 세계의 빛 (Emerald + Amber)

다크니스 없음. 어두운 배경 없음.
따뜻하고 밝은, 창조의 세계.
```
