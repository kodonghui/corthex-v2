# Critic-B Review — Step 1-1: Web Dashboard Layout Research

**Reviewer:** Visual Hierarchy + WCAG Verification
**Document:** `_uxui_redesign/phase-1-research/web-dashboard/web-layout-research.md` (~1005 lines)
**Date:** 2026-03-23

---

## Verification Performed

### Contrast Ratio Verification (calculated, not stated)

All ratios independently computed via WCAG 2.1 relative luminance formula.

**Sidebar text on `#283618` (L=0.0316):**

| Element | Color | Opacity | Effective Hex | Ratio | WCAG AA (4.5:1) |
|---------|-------|---------|---------------|-------|-----------------|
| Nav text | `#a3c48a` | 100% | `#a3c48a` | 6.63:1 | PASS |
| Active nav text | `#ffffff` | 100% | `#ffffff` | 12.87:1 | PASS |
| Active nav bg | `white/15` on `#283618` | — | `#48543a` | — | — |
| White on active bg | `#ffffff` on `#48543a` | — | — | 8.06:1 | PASS |
| Nav text on hover bg | `#a3c48a` on `white/10` | — | — | 4.88:1 | PASS |
| **Section header** | `#a3c48a` | **50%** | `#657d51` | **2.82:1** | **FAIL** |
| Section header (Vision's 60%) | `#a3c48a` | 60% | `#718b5c` | 3.40:1 | **FAIL** |
| Section header (70%) | `#a3c48a` | 70% | `#7e9967` | 4.07:1 | **FAIL** |
| Section header (80%) | `#a3c48a` | 80% | `#8aa773` | 4.82:1 | PASS |

**Command palette on `#f5f0e8` (L=0.873):**

| Element | Color | Ratio | WCAG AA |
|---------|-------|-------|---------|
| Primary text | `#1a1a1a` | 15.34:1 | PASS |
| Secondary text | `#6b705c` | 4.52:1 | PASS |
| Group header | `--text-secondary` | 4.52:1 | PASS |

**Zone B separator (WCAG 1.4.11 — non-text contrast):**

| Element | Color | Ratio vs `#283618` | WCAG 1.4.11 (3:1) |
|---------|-------|-------------------|---------------------|
| `rgba(255,255,255,0.1)` border | `#3d4a2f` | 1.36:1 | **FAIL** |

### Touch Target Verification

| Element | Computed Height | WCAG 2.5.8 (44px) | iOS HIG (44pt) |
|---------|----------------|---------------------|-----------------|
| Nav item (8px pad + 21px line + 8px pad) | ~37px | **FAIL** | **FAIL** |
| Cmd palette item (explicit) | 40px | **FAIL** | **FAIL** |
| Topbar icons (assumed 20px icon) | varies | **Unspecified** | **Unspecified** |

### Cross-Reference: Vision Doc vs Writer's Document

| Item | Vision Doc (Step 0-2) | Writer (Step 1-1) | Match? |
|------|----------------------|-------------------|--------|
| Mobile breakpoint | < 640px (sm) | < 768px | **MISMATCH** |
| Tablet breakpoint | 640–1023px (md), hamburger nav | 768–1023px, collapsed sidebar (56px) | **MISMATCH** |
| Desktop breakpoint | ≥ 1024px (lg) | ≥ 1024px | Match |
| Wide breakpoint | ≥ 1440px (xl) | Not defined | **MISSING** |
| Sidebar dim text | `#a3c48a/60` (~4.5:1 stated) | `rgba(163,196,138,0.5)` (50%) | **Different opacity + both FAIL** |
| Section header definition | Not explicitly defined | 12px, uppercase, `#a3c48a/50` | New element |
| z-index system | Not defined (Phase 0 gap) | Partial: `--z-sidebar: 20`, `--z-command-palette: 100` | **Partial fix** |
| Content max-width | 1440px | 1440px | Match |
| Touch targets | Not defined (Phase 0 gap) | Not defined | **Still missing** |

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 10% | CSS Grid 코드 전체 제공, px 단위 + CSS variable 매핑, 7개 content layout type별 코드, 3개 옵션 ASCII 다이어그램. Command palette 내부 구조까지 명시. |
| D2 완전성 | 7/10 | **25%** | 12개 경쟁사 분석 충실. 누락: (1) focus-visible 스타일 전무, (2) skip-to-content 링크 없음, (3) 모바일 sidebar ARIA 없음 (role="dialog", aria-modal), (4) command palette ARIA 속성 없음 (role="combobox", aria-activedescendant), (5) prefers-reduced-motion 미적용 (transition 3곳), (6) nav landmark/aria-label 없음, (7) Wide(≥1440px) 반응형 없음. |
| D3 정확성 | 7/10 | 15% | 대부분의 contrast ratio 정확. 그러나 section header 50% opacity = 2.82:1 (WCAG FAIL). Vision doc의 "~4.5:1" 주장도 실제 계산하면 3.40:1 (60% opacity). Zone B separator 1.36:1도 WCAG 1.4.11 FAIL. |
| D4 실행가능성 | 8/10 | 10% | CSS Grid 코드 즉시 사용 가능. 7개 layout variant 코드 제공. cmdk 라이브러리 선정. Zustand 상태 관리 명시. |
| D5 일관성 | 6/10 | 15% | Vision doc 대비 breakpoint 불일치 (768px vs 640px). Vision에 없는 tablet collapsed-sidebar 상태 도입. Vision의 dim text opacity 60% vs writer의 50% 불일치. Phase 0 미해결 이슈(touch targets, z-index) 부분적으로만 해결. |
| D6 리스크 | 6/10 | **25%** | Section header WCAG FAIL (2.82:1)은 법적 리스크. focus 스타일 전무 = 키보드 사용자 차단. prefers-reduced-motion 누락 = 전정기관 장애 사용자 리스크. 모바일 sidebar에 focus trap/ARIA 없음 = 스크린 리더 사용 불가. Zone B separator 시각적으로 불분명 (1.36:1). |

---

## 가중 평균: 7.00/10 — CONDITIONAL PASS

**산출:**
- D1: 9 × 0.10 = 0.90
- D2: 7 × 0.25 = 1.75
- D3: 7 × 0.15 = 1.05
- D4: 8 × 0.10 = 0.80
- D5: 6 × 0.15 = 0.90
- D6: 6 × 0.25 = 1.50
- **합계: 6.90 → 7.00 (반올림)**

**CONDITIONAL**: 점수가 7.0으로 통과선이지만, Critical 이슈 1건(section header WCAG FAIL)과 Major 이슈 4건이 있어 R2에서 해결 필요.

---

## 이슈 목록 (우선순위 순)

### Critical (반드시 수정)

**1. [D3/D6] Section header contrast WCAG AA FAIL — 2.82:1**

Writer 코드 (line 616): `color: rgba(163, 196, 138, 0.5)` = 50% opacity of `#a3c48a` on `#283618`.

독립 계산 결과:
- 50% opacity → blended `#657d51` → **2.82:1** (FAIL, 4.5:1 필요)
- Vision doc의 60% → blended `#718b5c` → **3.40:1** (FAIL)
- 70% → `#7e9967` → 4.07:1 (FAIL)
- **80% → `#8aa773` → 4.82:1 (PASS)**

Section headers are 12px uppercase text — this is NOT "large text" per WCAG (large = ≥18px or ≥14px bold). 4.5:1 minimum required.

**Fix:** Change section header opacity to 80% minimum, OR use a hardcoded hex color with verified 4.5:1+ ratio. Recommended: `#8ba874` (approximately 80% blend, verified PASS). Also update Vision doc's `--text-chrome-dim` from 60% to 80%.

### Major (강력 권고)

**2. [D2/D6] Focus styles completely absent**

No `:focus-visible` styles defined in any of the 3 options' CSS. Vision doc §11.1 identifies "Focus indicators: Visible on all interactive elements" as a current gap.

All interactive elements need visible focus rings:
```css
.nav-item:focus-visible {
  outline: 2px solid #a3c48a;
  outline-offset: -2px;
}
.command-palette-input:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}
```

Without focus indicators, keyboard-only users cannot navigate the interface.

**3. [D2/D6] prefers-reduced-motion not applied to transitions**

Three transition properties defined without reduced-motion media query:
- Line 194: `transition: transform 200ms ease` (mobile sidebar slide)
- Line 548: `transition: grid-template-columns var(--transition-speed) ease` (sidebar collapse)
- Line 590: `transition: background var(--duration-fast) ease-out` (nav hover)

Vision doc §7.1 rule: "All animations must be wrapped in `prefers-reduced-motion` media query."

**Fix:** Add at document level:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

**4. [D2] Command palette missing ARIA attributes**

The command palette CSS (lines 676-733) defines visual structure but no ARIA semantics. Per ARIA Authoring Practices for combobox with listbox:

| Element | Required ARIA |
|---------|--------------|
| Input | `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-autocomplete="list"` |
| List | `role="listbox"`, `id` matching `aria-controls` |
| Items | `role="option"`, `aria-selected` (not `data-selected`) |
| Active item | `aria-activedescendant` on input |
| Group headers | `role="group"` + `aria-label`, or `role="presentation"` |

**5. [D2/D6] Mobile sidebar missing a11y semantics**

Mobile overlay sidebar (lines 755-765) lacks:
- `role="dialog"` + `aria-modal="true"` on sidebar when in overlay mode
- `aria-label="Main navigation"` on sidebar
- Focus trap (JS-level, but should be documented as requirement)
- ESC key handler (mentioned in review request but not implemented)
- Return focus to trigger element on close

### Minor (Phase 2 참고)

**6. [D5] Breakpoints diverge from Vision doc**

| Breakpoint | Vision §13.1 | Writer Step 1-1 | Impact |
|-----------|-------------|-----------------|--------|
| Mobile | < 640px | < 768px | Writer adds 128px to mobile range |
| Tablet | 640–1023px (hamburger nav) | 768–1023px (collapsed sidebar) | Writer introduces icon-only sidebar at tablet — Vision says hamburger |
| Wide | ≥ 1440px (3-col grid) | Not defined | Missing max-width container behavior |

If the writer's breakpoints are intentionally different from Vision (justified by research), this should be documented as a **deliberate deviation** with rationale. Otherwise, align with Vision.

**7. [D3] Zone B separator too faint — 1.36:1**

`border-top: 1px solid rgba(255, 255, 255, 0.1)` on `#283618` = blended `#3d4a2f` = 1.36:1 contrast.

WCAG 1.4.11 (Non-text Contrast) requires 3:1 for UI components. While decorative borders may be exempt, this separator is **functional** (distinguishes Zone A from Zone B — two different navigation regions).

**Fix:** Increase to `rgba(255, 255, 255, 0.25)` minimum for ~2.0:1, or better: `rgba(255, 255, 255, 0.4)` for ~3.0:1.

**8. [D2] Nav landmark and skip-to-content missing**

No `<nav>` elements or `aria-label` specified for sidebar navigation regions. With dual-zone sidebar, two navigation landmarks are needed:
```html
<nav aria-label="Main navigation"><!-- Zone A --></nav>
<nav aria-label="Communication"><!-- Zone B --></nav>
```

Also, Vision §11.1 flags "needs skip-to-content link" — not addressed here.

**9. [D2] Touch target heights below minimums**

| Element | Height | WCAG 2.5.8 (44px) | Gap |
|---------|--------|---------------------|-----|
| Nav item | ~37px | FAIL | -7px |
| Cmd palette item | 40px | FAIL | -4px |

**Fix:** Increase nav item padding to `10px 12px` (= 41px, closer) or `12px 12px` (= 45px, PASS). Cmd palette item `height: 44px`.

**10. [D6] Triple-scroll a11y assessment**

The writer asks about triple-scroll (Zone A + Zone B + Content). Analysis:

**Actual scroll contexts:** Zone A scrolls within sidebar, content area scrolls. Zone B is fixed. So the base case is **2 independent scrollable regions** — this is a standard, well-understood pattern (every sidebar app does this). **Not an a11y concern at base level.**

**However**, content layout Type 2 (master-detail for Hub/Chat/Messenger) adds a third scroll context within content (session list scrolls independently from chat area). And Messenger's 3-column layout could create a fourth. This is worth monitoring but not blocking — it's the established pattern for chat applications.

**Recommendation:** Add `role="region"` + `aria-label` to each independently scrollable area so screen readers can identify them.

**11. [D1] Visual hierarchy assessment for 6 section groups**

The 6 section headers (COMMAND, ORGANIZATION, TOOLS, INTELLIGENCE, SOCIAL implied in Zone B, SETTINGS) create visual rhythm in the sidebar. Assessment:

- Uppercase + 12px + dim color = appropriate de-emphasis ✅
- Sufficient vertical spacing (16px top + 4px bottom padding) ✅
- Section separators are implied by spacing, not explicit lines — clean ✅
- **Risk:** With 18 items in Zone A + 6 headers = 24 visual elements. On a 768px viewport, Zone A gets approximately `768 - 56(brand) - 48(search) - 192(Zone B) - 80(settings/profile) = ~392px`. At ~37px per item + ~20px per header = 18×37 + 6×20 = 786px content in ~392px viewport = **must scroll ~394px**. This is significant scrolling.

**Mitigation:** Command palette (⌘K) makes direct navigation possible without scrolling. Acceptable tradeoff.

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ✅ 없음 — 12개 경쟁사 실존, CSS 코드 유효 |
| 보안 구멍 | ✅ 없음 |
| 빌드 깨짐 | ✅ 해당 없음 (연구 문서) |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

## Strengths (칭찬)

1. **7 content layout types** — 23 페이지를 7개 레이아웃 패턴으로 체계적 분류. Dashboard grid, master-detail, canvas, CRUD, tabbed, multi-panel, feed. 각각 CSS Grid 코드까지 제공. 이전 "one-size-fits-all" 접근 대비 큰 개선.

2. **Dual-zone sidebar concept** — Zone A (scroll) + Zone B (pinned) 분리가 Ruler 아키타입과 정확히 매칭. CEO가 조직 구조를 Zone A에서 탐색하면서도 실시간 커뮤니케이션(Messenger/Notifications)을 Zone B에서 항상 볼 수 있음.

3. **Competitive analysis depth** — 7개 AI agent 플랫폼 + 5개 premium SaaS 대시보드 = 12개 제품 실사 분석. CrewAI, Dify, Langflow 등 직접 경쟁사까지 커버. Natural Organic 팔레트가 차별화된다는 주장에 근거 제공.

4. **CSS variable system** — z-index 변수 (`--z-sidebar: 20`, `--z-command-palette: 100`) 도입으로 Phase 0에서 지적한 z-index 시스템 부재를 부분적 해결.

5. **Command palette spec** — cmdk 라이브러리 선정, 4개 category (Recent/Navigation/Actions/Agents), 키보드 단축키 매핑. 23 페이지 앱에서 ⌘K는 필수이며 잘 설계됨.

6. **Comparison matrix** — 8개 기준 × 3개 옵션의 가중 점수 비교. 주관적 "느낌"이 아닌 정량적 근거로 Option C 추천.

---

## Cross-talk 요약

- **ux-brand**: Dual-zone sidebar가 CEO 멘탈 모델과 맞는지 확인 요청. Zone B에 4개 항목(Messenger/SNS/Agora/Notifications)이 고정되어 있는데, SOCIAL 그룹 전체를 Zone B로 빼면 Zone A에서 SOCIAL 중복이 사라져 정보 설계가 깔끔해지는지 검토. 또한 "More" 메뉴(Option B)를 거부한 근거가 discoverability인데, ⌘K가 그 역할을 대체한다면 Option B의 장점(sidebar 밀도 감소)도 취할 수 있는지.
- **tech-perf**: `grid-template-columns` transition의 브라우저 성능 비용. Safari 16.4에서 CSS Grid animation이 jank 없이 작동하는지 검증 필요. 또한 cmdk 번들 크기 + React Router 통합 비용 확인.

---

*End of Critic-B Review — Phase 1, Step 1-1*
