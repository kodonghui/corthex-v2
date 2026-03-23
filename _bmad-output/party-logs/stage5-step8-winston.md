# Critic-A (Architecture + API) Review — Step 8: Visual Design Foundation

**Reviewer:** Winston (Architect)
**Date:** 2026-03-23
**Artifact:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 1436–1855)
**Verification method:** Python script for all 14 WCAG contrast ratios, type scale math, Tailwind class mapping cross-reference

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | **9/10** | 모든 색상에 hex/RGB/대비비, 모든 간격에 px/rem/Tailwind class, 폰트 웨이트·fallback chain·import 경로까지 명시. "적절한" 같은 뭉뚱그림 표현 거의 없음. |
| D2 완전성 | 15% | **8/10** | Color(primary/semantic/chart/accent/text/chrome), Typography(typeface/scale/rules/ratios), Spacing(grid/shell/breakpoints/radius/shadow/z-index/touch), A11y(contrast/focus/color-independence/motion/icon/badge) 전부 커버. Noto Serif KR import 누락, z-30 충돌 처리 미기술. |
| D3 정확성 | 25% | **8/10** | **14개 WCAG 대비비 전수 Python 검증 — 전부 정확** (소수점 2자리까지 일치). Phase 3 Design Tokens 색상·토큰명 100% 정합. 단, border-radius Tailwind 매핑 오류 1건 + type scale "Major Third" 주장 부정확. |
| D4 실행가능성 | 20% | **9/10** | CSS 코드 스니펫(reduced-motion, forced-colors), TSX import 예시, Tailwind class 매핑, 토큰명 전부 즉시 사용 가능. 입력 보더 vs 장식 보더 구분 규칙, accent vs link 색상 구분 규칙 등 실제 구현 시 혼동 가능한 지점을 명확히 정리. |
| D5 일관성 | 15% | **9/10** | Phase 0 Vision("Controlled Nature", Ruler/Sage archetype), Phase 3 Design Tokens(토큰명·값 동일), Step 4 감정 목표(Authority→Curiosity→Calm) 전부 정확히 연동. Phase 2 수정사항(24px→32px 페이지 패딩) 반영. 네이밍 컨벤션 준수. |
| D6 리스크 | 10% | **7/10** | WCAG 전면 준수, CVD 차트 안전, success≈accent 혼동 방지, red-on-olive 3중 보완 등 훌륭. 다만 z-index 30 삼중 충돌 리스크 미언급, 폰트 로딩 실패 시 FOIT/FOUT 타이밍 전략 부재. |

---

## 가중 평균: 8.40/10 ✅ PASS (Grade A)

```
(9 × 0.15) + (8 × 0.15) + (8 × 0.25) + (9 × 0.20) + (9 × 0.15) + (7 × 0.10)
= 1.35 + 1.20 + 2.00 + 1.80 + 1.35 + 0.70
= 8.40
```

---

## 이슈 목록

### Issue 1 — [D3 정확성] Border Radius Tailwind 매핑 오류 (Line 1705)

`--radius-sm` = 4px를 `rounded-sm`으로 매핑했으나, Tailwind v3/v4에서 `rounded-sm` = **2px** (0.125rem). 4px는 `rounded` (un-suffixed class)에 해당.

**현재:**
```
| `--radius-sm` | 4px | `rounded-sm` | 작은 pill, 인라인 배지 |
```

**수정:**
```
| `--radius-sm` | 4px | `rounded` | 작은 pill, 인라인 배지 |
```

또는 Tailwind config에서 `rounded-sm: 4px`으로 오버라이드 후 이를 명시.

### Issue 2 — [D3 정확성] Type Scale "Major Third (1.250)" 주장 부정확 (Line 1596-1598)

"Major Third 비율(×1.250)로 증가한다"고 명시하나, 실제 인접 단계 비율을 Python으로 검증한 결과:

| Step | Ratio | Major Third? |
|------|-------|-------------|
| 12→14 | 1.167 | ✗ |
| 14→16 | 1.143 | ✗ |
| 16→18 | 1.125 | ✗ |
| 18→20 | 1.111 | ✗ |
| 20→24 | 1.200 | ✗ |
| 24→32 | 1.333 | ✗ |
| 32→40 | **1.250** | ✓ (유일) |
| 40→48 | 1.200 | ✗ |

8개 중 1개만 정확히 1.250. 실제로는 Tailwind 표준 사이즈(12/14/16/18/20/24/32/40/48)를 사용한 **실용적 스케일**이며, Major Third에서 "영감을 받았다"가 정확한 표현.

**수정 제안:** "Major Third Ratio (1.250)" → "Major Third 영감의 실용적 스케일 (Tailwind 표준 사이즈 기반, 12px–48px)" 또는 비율 범위를 "평균 ×1.19, 범위 1.11–1.33" 등으로 솔직하게 명시.

### Issue 3 — [D2 완전성] Noto Serif KR Import 누락 (Line 1585-1592)

Self-hosted 전략 코드 예시에 Inter + JetBrains Mono만 포함. Noto Serif KR (`@fontsource-variable/noto-serif-kr`)의 400/700 import가 빠짐. Two-font rule로 인해 "필요한 뷰에서만 dynamic import" 전략이라면 그 전략을 명시해야 함.

**추가 필요:**
```tsx
// Knowledge Library 등 한국어 장문 뷰에서 lazy import
import '@fontsource-variable/noto-serif-kr/400.css';
import '@fontsource-variable/noto-serif-kr/700.css';
```

### Issue 4 — [D6 리스크] Z-Index 30 삼중 충돌 (Line 1731-1733)

`--z-overlay-backdrop` (30), `--z-bottom-nav` (30), `--z-fab` (30)이 동일 z-index. 모바일에서 드로어 열기 시:
- backdrop(30)이 bottom-nav(30) 아래에 렌더링되면 → bottom-nav가 backdrop 위로 돌출
- FAB(30)이 backdrop과 같은 레이어 → 드로어 뒤에 FAB가 보이거나 클릭 가능

**제안:** `--z-bottom-nav: 25`, `--z-fab: 25` (콘텐츠 위지만 오버레이 아래) 또는 "드로어 열림 시 bottom-nav/FAB를 `visibility: hidden`으로 숨김" 규칙 추가.

---

## 강점 (특기사항)

1. **WCAG 대비비 전수 정확**: 14개 조합 전부 소수점 2자리까지 정확. 계산기 검증이 아닌 실제 sRGB 감마 보정을 거친 정밀 계산.
2. **Success ≈ Accent 혼동 방지 규칙**: 1.14:1 상호대비 문제를 인식하고, 아이콘+텍스트 vs 배경 틴트로 구분하는 명확한 규칙 수립. 실무에서 흔히 놓치는 지점.
3. **Red-on-olive 배지 3중 보완**: 2.67:1이라는 불충분한 대비를 형태+텍스트+링으로 보완하는 전략. CVD 시나리오까지 고려한 방어적 설계.
4. **Gestalt Proximity 수학적 구현**: 2:1 최소 비율을 모든 spacing context에 적용하고 Phase 2 수정을 반영한 엄밀한 접근.
5. **60-30-10 모바일 변형**: 하단 네비가 60% zone에 속한다는 결정과 "열린 하늘" 메타포 유지는 브랜드 철학의 일관된 모바일 적용.

---

## Cross-talk 요약

- 다른 Critic이 z-index 충돌을 지적할 경우 동의할 준비.
- Type scale 정확성 문제는 D3에서 감점했으나, 실용적 선택 자체는 합리적 — 표현만 수정하면 됨.
- 전체적으로 Phase 0/3과의 일관성이 탁월하여 아키텍처 관점에서 큰 우려 없음.

---

**최종 판정: 8.40/10 — ✅ PASS (Grade A)**
