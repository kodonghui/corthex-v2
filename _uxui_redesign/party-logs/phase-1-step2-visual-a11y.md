# Critic-B Review — Step 1-2: App (Mobile/Tablet) Layout Research

**Reviewer:** Visual Hierarchy + WCAG Verification
**Document:** `_uxui_redesign/phase-1-research/app/app-layout-research.md` (~1259 lines)
**Date:** 2026-03-23

---

## Verification Performed

### Contrast Ratio Verification (all independently calculated)

**Bottom Navigation on cream `#faf8f5` (L=0.9405):**

| Element | Color | Size | Ratio | WCAG AA | Notes |
|---------|-------|------|-------|---------|-------|
| Active text | `#606C38` | 11px/500 | 5.35:1 | PASS | Good margin |
| Inactive text | `#6b705c` | 11px/500 | 4.83:1 | PASS | |
| Active icon | `#606C38` | 24px | 5.35:1 | PASS (3:1 req) | Non-text contrast |
| Inactive icon | `#6b705c` | 24px | 4.83:1 | PASS (3:1 req) | |

**Badge:**

| Element | FG | BG | Ratio | WCAG AA |
|---------|----|----|-------|---------|
| Badge text | `#ffffff` | `#dc2626` | 4.83:1 | PASS (borderline) |
| Badge bg on cream | `#dc2626` | `#faf8f5` | 4.56:1 | PASS (non-text 3:1) |

**Bottom Sheet:**

| Element | Color | BG | Ratio | WCAG | Notes |
|---------|-------|----|-------|------|-------|
| Handle | `#e5e1d3` | `#faf8f5` | **1.23:1** | **Exempt** | Decorative indicator — Vaul provides functional drag via invisible hit area |

**Other Mobile Elements:**

| Element | Color | BG | Ratio | WCAG AA |
|---------|-------|----|-------|---------|
| Canvas banner text | `#6b705c` | `#f5f0e8` | 4.52:1 | PASS (marginal) |
| Panel tab active | `#606C38` | `#faf8f5` | 5.35:1 | PASS |
| Tab border | `#606C38` 2px | `#faf8f5` | 5.35:1 | PASS (non-text) |
| Drawer nav text | `#a3c48a` | `#283618` | 6.63:1 | PASS (verified Step 1-1) |
| Drawer section header | `#a3c48a/80%` | `#283618` | 4.82:1 | PASS (Step 1-1 R2 fix applied) |

**Verdict: All contrast ratios PASS WCAG AA.** No critical failures.

### Touch Target Verification

| Element | Specified Size | WCAG 2.5.8 (44px) | Apple HIG (44pt) |
|---------|---------------|---------------------|------------------|
| Bottom nav items | `min-height: 44px` | PASS | PASS |
| Bottom nav width (5-tab, 320px screen) | 64px | PASS | PASS |
| Header buttons | `min-width: 44px; min-height: 44px` | PASS | PASS |
| Drawer nav items | `min-height: 48px` | PASS | PASS |
| Chat input | `min-height: 44px` | PASS | PASS |
| Panel tabs | `min-height: 44px` | PASS | PASS |
| Accordion triggers | `min-height: 48px` | PASS | PASS |
| Spotlight items (Option B) | `min-height: 48px` | PASS | PASS |
| Me tab nav items (Option B) | `min-height: 48px` | PASS | PASS |
| Bottom sheet handle drag area | ~48×28px (visible) | **See note** | **See note** |
| FAB (mentioned in prose) | **Not defined** | **Unspecified** | **Unspecified** |

**Bottom sheet handle note:** The visible handle is 48×4px with 12px margin = ~28px touchable height. However, Vaul internally implements a larger invisible hit area (typically the full-width header region, ~40-56px). Since the CSS here is illustrative and Vaul handles touch targeting, this is not a WCAG failure — but the visible handle contrast (1.23:1) is purely decorative, and Vaul's functional drag area should be documented.

### Cross-Reference: Step 1-1 Consistency

| Element | Step 1-1 (Desktop) | Step 1-2 (Mobile) | Consistent? |
|---------|-------------------|-------------------|-------------|
| Sidebar → Drawer styling | `#283618` bg, `#a3c48a` text | Same (line 842-843) | MATCH |
| Section headers | `rgba(163,196,138,0.8)` | Same (line 880) | MATCH |
| Focus-visible | 2px solid accent-primary | Same pattern (line 762) | MATCH |
| prefers-reduced-motion | Covers all transitions | Covers drawer + sheet + nav (line 1053) | MATCH |
| Breakpoints | < 1024px = overlay | < 1024px = bottom nav + drawer | **ALIGNED** |
| ARIA comments | Dialog, modal, labels | Same pattern (line 828) | MATCH |

### Cross-Reference: Vision Doc

| Item | Vision §13.1 | Writer Step 1-2 | Match? |
|------|-------------|-----------------|--------|
| Mobile (sm) | < 640px | < 640px (single col) | MATCH |
| Tablet (md) | 640–1023px | 640–1023px (wider padding, 2-3 col) | MATCH |
| Desktop (lg) | ≥ 1024px | ≥ 1024px (switches to desktop shell) | MATCH |
| Sidebar mobile | Overlay slide-in | Hamburger drawer (same concept) | MATCH |
| Trading mobile | Tab navigation between panels | Tab-based single panel | MATCH |
| Messenger mobile | Channel list = overlay drawer | Master→detail toggle | **BETTER** (toggle > overlay) |
| Dashboard mobile | Single column stacked | Single column stacked cards | MATCH |
| NEXUS mobile | Zoomed-out overview, pinch-to-zoom | Read-only, pinch-zoom + banner | MATCH |
| Tables mobile | Horizontal scroll or responsive card | Card transformation | **BETTER** (cards > horizontal scroll) |

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 10% | 7개 모바일 레이아웃 타입별 CSS 코드. 23개 페이지 모바일 전략 테이블. 3가지 옵션 ASCII 다이어그램. PWA manifest/safe-area 핸들링. 터치 타겟 px 단위 명시. iOS zoom 방지 (font-size 16px). |
| D2 완전성 | 8/10 | **25%** | 12개 모바일 앱 경쟁 분석. 7개 레이아웃 타입 커버. Step 1-1 피드백 선반영 (focus-visible, reduced-motion, ARIA comments). 누락: (1) FAB CSS/ARIA 미정의, (2) panel tabs `role="tablist"`/`role="tab"` 패턴 미명시, (3) pull-down search의 a11y 대안 명시적 미문서화, (4) bottom sheet 키보드 대안 (drag 외 close 버튼) 미명시. |
| D3 정확성 | 9/10 | 15% | 모든 contrast ratio 독립 계산으로 검증 — 전부 PASS. 터치 타겟 전부 44px 이상. Drawer 스타일링 Step 1-1 R2 수정 반영. iOS zoom prevention (16px) 정확. `100dvh` + `env(safe-area-*)` 정확. |
| D4 실행가능성 | 9/10 | 10% | Vaul 라이브러리 (~8kB gzip) 선정 + snap point 명시. Radix Accordion/Dialog 지정. React Flow 모바일 config 플래그 제공. React Router `useLocation()` 연동. 즉시 구현 가능한 CSS. |
| D5 일관성 | 9/10 | 15% | Step 1-1과 강하게 정합 (같은 olive sidebar, 같은 토큰, 같은 section header fix). Vision §13.1 breakpoints 일치. 23개 페이지 모바일 전략이 Vision §13.2와 일치하거나 개선. |
| D6 리스크 | 8/10 | **25%** | WCAG contrast 전부 PASS (critical 없음). 터치 타겟 전부 44px+. safe-area 핸들링. Pull-down search는 hidden gesture이나 header search icon이 대안. 잔여: (1) FAB 미정의는 구현 시 gap, (2) bottom sheet keyboard 접근성 Vaul 의존, (3) 11px bottom nav label은 readability 우려 (WCAG 위반은 아님). |

---

## 가중 평균: 8.50/10 PASS

**산출:**
- D1: 9 × 0.10 = 0.90
- D2: 8 × 0.25 = 2.00
- D3: 9 × 0.15 = 1.35
- D4: 9 × 0.10 = 0.90
- D5: 9 × 0.15 = 1.35
- D6: 8 × 0.25 = 2.00
- **합계: 8.50**

---

## 이슈 목록 (우선순위 순)

### Major 없음

Step 1-1 R1 피드백이 선반영됨: focus-visible, prefers-reduced-motion, ARIA comments, drawer backdrop 모두 포함. WCAG critical failure 없음.

### Minor (Phase 2 참고)

**1. [D2] FAB (Floating Action Button) CSS/ARIA 미정의**

Prose에서 "FAB: + New Agent on Agents page, + Upload on Files page" 언급 (lines 1085-1086, 1162)하지만 CSS 코드와 ARIA 속성이 없음.

Phase 2 구현 시 필요:
```css
.fab {
  position: fixed;
  bottom: calc(var(--bottom-nav-height) + var(--safe-bottom) + 16px);
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: 9999px;
  /* aria-label="Create new agent" 필수 */
}
```

**2. [D2] Panel tabs missing `role="tablist"`/`role="tab"` ARIA pattern**

Panel tabs (Trading 4-panel, Jobs 4-tab) use `aria-selected="true"` (line 1008) but don't specify the container `role="tablist"` or item `role="tab"`. Per ARIA Authoring Practices, the tab pattern requires:
- Container: `role="tablist"`
- Tab items: `role="tab"` + `aria-controls`
- Tab panels: `role="tabpanel"` + `aria-labelledby`
- Arrow key navigation between tabs

**3. [D2] Pull-down search a11y alternative not explicitly documented**

Pull-down search (line 584: "↕ Pull down = Search trigger") is a hidden gesture affordance. The header search icon (line 580: `[🔍]`) serves as the keyboard/screen-reader alternative, but this relationship isn't documented.

**Recommendation:** Add explicit note: "Pull-down search is a convenience gesture. The header search icon provides the same functionality and is the accessible alternative for users who cannot perform swipe gestures."

**4. [D2] Bottom sheet keyboard close mechanism not specified**

Vaul handles focus trap and ESC close internally, but the CSS/spec doesn't mention:
- An explicit close button (X or "Done") inside the sheet for keyboard/switch users
- How screen readers announce the sheet opening (`aria-label` on sheet content)

**Recommendation:** Add `<button aria-label="Close" class="bottom-sheet-close">` pattern for keyboard accessibility beyond ESC.

**5. [D6] Bottom nav labels at 11px — readability concern**

11px/500 text is WCAG-compliant (5.35:1 active, 4.83:1 inactive) but at the edge of comfortable readability, especially for older users or high-DPI mobile screens where 11px renders very small.

Not a WCAG failure, but consider: Apple HIG recommends minimum 11pt (which renders larger than 11px CSS due to device pixel ratio). At standard mobile DPI, 11px CSS ≈ 8.25pt — potentially below Apple's recommendation.

**Recommendation:** Consider 12px for bottom nav labels, or verify rendering at 1x/2x/3x DPI.

**6. [D3] Badge contrast borderline — 4.83:1**

White on `#dc2626` = 4.83:1 passes WCAG AA (4.5:1) but with only 0.33 margin. If the badge font-weight drops below 600 or renders with anti-aliasing artifacts on certain screens, perceived contrast may feel lower.

Not blocking — just noting the tight margin.

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ✅ 없음 — 12개 모바일 앱 실존, CSS 코드 유효, Vaul/Radix 라이브러리 실존 |
| 보안 구멍 | ✅ 없음 |
| 빌드 깨짐 | ✅ 해당 없음 (연구 문서) |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

## Strengths (칭찬)

1. **Step 1-1 피드백 선반영** — focus-visible, prefers-reduced-motion, ARIA comments, 44px touch targets, drawer section header 80% opacity 모두 R1 피드백 없이 자체 적용. 학습 효과가 분명함.

2. **23-page mobile strategy table** (lines 1079-1103) — 모든 23개 페이지의 데스크톱→모바일 전환 전략을 표로 정리. "Dashboard: stacked cards", "NEXUS: read-only + pinch-zoom", "Settings: accordion" 등 각 페이지에 맞는 패턴 선택. 이 테이블만으로 Phase 2 구현 가이드 역할.

3. **7 mobile layout types with CSS** — Chat/Hub(full-height+input), Dashboard(stacked cards), Master-detail(toggle view), Canvas(read-only), Multi-panel(tab switcher), Tab-heavy(accordion), Table(card transformation). 각각 CSS 코드 제공.

4. **iOS zoom prevention** — `font-size: 16px` on chat input (line 911) + spotlight input (line 438). iOS Safari는 <16px input에서 자동 줌하는데, 이를 정확히 방지. 실무 경험이 반영된 디테일.

5. **PWA-first approach** — `100dvh`, `env(safe-area-inset-*)`, `@media (display-mode: standalone)`, `overscroll-behavior-y: contain`, `-webkit-overflow-scrolling: touch`. 모바일 PWA의 핵심 이슈들을 빠짐없이 처리.

6. **Brand consistency desktop↔mobile** — 모바일 drawer가 데스크톱 sidebar와 동일한 olive dark 스타일링 사용. Section header opacity, nav item styling, ARIA 패턴 모두 Step 1-1과 일치.

7. **Competitive analysis honesty** — "AI agent platforms have NO mobile optimization (Dify, CrewAI, Langflow) — CORTHEX mobile is a differentiator" (line 84). 경쟁사 약점을 정확히 파악.

---

## Cross-talk 요약

- **ux-brand**: "More" 탭이 drawer를 열 때 사용자가 "또 다른 네비게이션"이라고 혼란할 수 있는지 UX 관점 확인. Hamburger(☰)와 "More(⋯)"가 같은 drawer를 여는 것이 일관적인지, 아니면 "More"는 별도 full-screen menu가 나은지. 또한 pull-down search gesture가 CEO 사용자(비개발자)에게 발견 가능한지.
- **tech-perf**: Vaul ~8kB + Radix Dialog + Radix Accordion 모바일 번들 크기 합산. PWA Service Worker 캐싱 전략. `100dvh` + `env(safe-area-*)` 브라우저 호환성 (특히 Samsung Internet, Firefox Mobile).

---

*End of Critic-B Review — Phase 1, Step 1-2*
