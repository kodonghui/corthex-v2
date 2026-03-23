# Critic-B Review — Step 1-3: Landing Page Layout Research

**Reviewer:** Visual Hierarchy + WCAG Verification
**Document:** `_uxui_redesign/phase-1-research/landing/landing-page-research.md` (~1973 lines)
**Date:** 2026-03-23

---

## Verification Performed

### Contrast Ratio Verification (all independently calculated)

**Hero section — text on gradient-tinted cream:**

The hero `::before` applies `radial-gradient(circle, rgba(96,108,56, 0.06)...)` over cream `#faf8f5`. At gradient center, cream becomes `#f0efe9`.

| Element | Color | BG (gradient center) | Ratio | WCAG AA |
|---------|-------|---------------------|-------|---------|
| Hero title | `#1a1a1a` | `#f0efe9` (6% tint) | 15.11:1 | PASS |
| Hero subtitle | `#6b705c` | `#f0efe9` (6% tint) | **4.45:1** | **BORDERLINE** (4.5:1 needed) |
| Hero subtitle | `#6b705c` | `#faf8f5` (no gradient) | 4.83:1 | PASS |

At gradient edges (where transparent), contrast returns to full 4.83:1. The 0.05 deficit at center is technically below threshold but only at the peak of a barely-perceptible gradient. Not blocking but worth noting.

**CTA section — `#283618` olive dark background:**

| Element | Color | Opacity | Effective Hex | Ratio | WCAG AA |
|---------|-------|---------|---------------|-------|---------|
| CTA title | `#a3c48a` | 100% | `#a3c48a` | 6.63:1 | PASS |
| **CTA subtitle** | `#a3c48a` | **60%** | `#718b5c` | **3.40:1** | **FAIL** |
| CTA subtitle (70%) | `#a3c48a` | 70% | `#7e9967` | 4.07:1 | FAIL |
| CTA subtitle (80%) | `#a3c48a` | 80% | `#8aa773` | 4.82:1 | PASS |
| Inverted button text | `#283618` | 100% | `#283618` | 12.15:1 | PASS |
| Inverted button focus ring | `#a3c48a` | 100% | — | 6.63:1 | PASS |

**Focus ring visibility on cream/surface backgrounds:**

| Context | Focus Color | BG | Ratio | WCAG 1.4.11 (3:1) |
|---------|------------|-----|-------|---------------------|
| Nav links on cream | `#606C38` | `#faf8f5` | 5.35:1 | PASS |
| Tabs on surface | `#606C38` | `#f5f0e8` | 5.00:1 | PASS |
| CTA btn on dark | `#a3c48a` | `#283618` | 6.63:1 | PASS |

Focus ring on light backgrounds = all PASS. (Step 1-1's focus ring issue was specific to dark sidebar.)

**Metric values, labels, and footer text:**

| Element | Color | BG | Ratio | WCAG AA |
|---------|-------|----|-------|---------|
| Metric value (40px, JBMono) | `#606C38` | `#f5f0e8` | 5.00:1 | PASS (large text 3:1) |
| Metric label (14px) | `#6b705c` | `#f5f0e8` | 4.52:1 | PASS |
| Footer links (14px) | `#6b705c` | `#f5f0e8` | 4.52:1 | PASS |
| Footer copyright (14px) | `#756e5a` | `#f5f0e8` | **4.48:1** | **BORDERLINE** (0.02 below 4.5:1) |
| Tab inactive (14px) | `#6b705c` | `#f5f0e8` | 4.52:1 | PASS |
| Tab active (14px) | `#606C38` | `#f5f0e8` | 5.00:1 | PASS |

**Problem→Solution icons:**

| Element | Color | BG | Ratio | WCAG 1.4.11 |
|---------|-------|----|-------|-------------|
| Check icon (✓) | `#606C38` | `#faf8f5` | 5.35:1 | PASS |
| X icon (✗) | `#dc2626` | `#f5f0e8` | 4.26:1 | PASS (3:1 for non-text) |

### Touch Target Verification

| Element | Specified | WCAG 2.5.8 (44px) | Status |
|---------|----------|---------------------|--------|
| Hero primary button | `height: 48px` | PASS | ✅ |
| Hero ghost button | `height: 48px` | PASS | ✅ |
| CTA inverted button | `height: 56px` | PASS | ✅ |
| Tab triggers | `padding: 12px 24px` → ~41px | Marginal | ⚠️ |
| Footer links | `padding: 4px 0` → ~25px | FAIL | ❌ |
| **Header CTA** | **`height: 40px`** | **FAIL** | **❌ -4px** |

**Header CTA detail (line 1225):** `height: 40px; padding: 0 24px;` — padding is horizontal only. The interactive element is exactly 40px tall. The writer's a11y checklist (line 1894) claims "header CTA 40px is 44px with padding — OK" but this is incorrect. There is no vertical padding contributing to height.

### Animation & Reduced Motion

| Animation | prefers-reduced-motion | Status |
|-----------|----------------------|--------|
| Scroll-reveal (`.reveal`) | CSS: `opacity:1; transform:none; transition:none` (line 1155-1161) | ✅ PASS |
| Scroll-reveal (JS) | Checks `matchMedia` and adds `.visible` immediately (line 1861-1864) | ✅ PASS (dual check) |
| Hero badge-dot pulse | `animation: none` (line 1301) | ✅ PASS |
| Logo scroll (Option B) | `animation: none` (line 586) | ✅ PASS |
| Tab transitions | `transition: color 200ms, border-color 200ms` | ⚠️ Not covered by reduced-motion block |

**Scroll-reveal is exemplary:** Both CSS and JS check `prefers-reduced-motion`, with the JS path adding `.visible` class immediately to prevent invisible content. This is the correct dual-check pattern.

### Tab ARIA Pattern

| Attribute | Specified? | Notes |
|-----------|-----------|-------|
| `role="tablist"` on container | ✅ Comment (line 1553) | |
| `role="tab"` on trigger | ✅ Comment (line 1568) | |
| `aria-selected` on trigger | ✅ CSS selector (line 1569) | |
| `role="tabpanel"` on panel | ✅ Comment (line 1585) | |
| `aria-labelledby` on panel | ✅ Comment (line 1585) | |
| Arrow key navigation | Mentioned (lines 864, 1889) | ⚠️ Not detailed |
| `tabindex="0"` on active, `-1` on inactive | Not specified | Minor gap |
| Home/End key to first/last tab | Not specified | Minor gap |

### Cross-Reference Consistency

| Element | Step 1-1 (Desktop) | Step 1-3 (Landing) | Consistent? |
|---------|-------------------|-------------------|-------------|
| `--text-chrome-dim` token | Section headers fixed to 80% | `:root` still defines 60% (line 1115) | **INCONSISTENT** |
| Focus-visible | `#606C38` outline on all | Same pattern | MATCH |
| Grid base | 8px | 8px | MATCH |
| Typography | Inter + JetBrains Mono | Same | MATCH |
| Color tokens | All verified | All match | MATCH |

---

## Answers to Writer's 10 Review Points

### 1. Hero gradient contrast?
**BORDERLINE.** At gradient center (6% sage tint), secondary text `#6b705c` drops to 4.45:1 — technically 0.05 below 4.5:1. Primary text unaffected (15.11:1). **Not blocking** — the gradient is barely perceptible and the deficit is at the single strongest pixel. But could reduce to 4% for safety.

### 2. Scroll-reveal reduced motion?
**EXEMPLARY.** Dual-check pattern: CSS sets `opacity:1; transform:none; transition:none`, AND JS checks `matchMedia` to add `.visible` immediately. This prevents flash-of-invisible content for reduced-motion users. Best implementation across all 3 steps.

### 3. Tab keyboard navigation — need more specifics?
**Yes, slightly.** `role="tablist"`, `role="tab"`, `role="tabpanel"` are all specified. Arrow key nav is mentioned but needs: `tabindex="0"` on selected tab, `tabindex="-1"` on unselected tabs, Home/End key support. Add these as a Phase 2 implementation note.

### 4. CTA section contrast?
**Title PASS (6.63:1), subtitle FAIL (3.40:1).** The `--text-chrome-dim` at 60% opacity is the same issue from Step 1-1 where section headers needed 80%. Fix: use 80% or hardcoded `#8aa773` (4.82:1). Also: the `:root` token (line 1115) still defines 60% — needs updating.

### 5. Header CTA 40px touch target?
**FAILS.** `height: 40px` with only horizontal padding. No vertical padding contributes to touch area. Fix: increase to `height: 44px` or add `min-height: 44px`.

### 6. Focus-visible on cream background?
**PASS — 5.35:1.** Unlike the dark sidebar (Step 1-1: 2.27:1 FAIL), the sage `#606C38` focus ring on cream `#faf8f5` provides 5.35:1, well above the 3:1 WCAG 1.4.11 requirement. On surface `#f5f0e8`: 5.00:1 — also PASS.

### 7. Skip navigation link?
**PASS.** `<a class="sr-only focus:not-sr-only" href="#main">본문으로 건너뛰기</a>` is the correct pattern. Korean label is appropriate for `lang="ko"`. Becomes visible on focus for keyboard users.

### 8. Language attribute?
**PASS.** `<html lang="ko">` correctly specified. Screen readers will use Korean pronunciation.

### 9. Image alt text?
**Specified as requirement** (line 1891) but no actual alt text examples provided. Phase 2 should include Korean alt text for all screenshots, e.g. `alt="CORTHEX 대시보드 — 에이전트 활동, 비용 차트, 상태 표시"`.

### 10. Font loading?
**PASS.** `<link rel="preload">` specified for Inter 400/600/700 + JetBrains Mono 700 (subset). Font subsetting for JBMono to numbers-only is a strong performance decision.

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 10% | 8개 섹션 전체 CSS 코드. Scroll-reveal JS 구현. Font loading/subsetting 전략. SSG 접근법. 5개 feature tab 내용 테이블. 3개 breakpoint별 반응형 테이블. 매우 구체적. |
| D2 완전성 | 8/10 | **25%** | Skip nav, lang="ko", ARIA tabs, reduced-motion (dual-check), semantic HTML 전부 포함. 누락: (1) 탭 tabindex 관리 상세, (2) footer 링크 터치 타겟 (25px — 모바일에서 너무 작음), (3) logo scroll `aria-hidden` (Option B), (4) tab transition reduced-motion 미적용. |
| D3 정확성 | 8/10 | 15% | 대부분 contrast ratio 정확 PASS. CTA subtitle 60% = 3.40:1 FAIL (Step 1-1에서 이미 발견된 이슈 재발). Hero gradient 4.45:1 borderline. Copyright 4.48:1 borderline. Header CTA "40px is 44px with padding" 주장 부정확 (padding은 수평만). |
| D4 실행가능성 | 9/10 | 10% | CSS 즉시 사용 가능. IntersectionObserver 코드 제공. 라이브러리 선택 (custom tabs < 2KB, no Framer Motion). SSG 전략 명확. Font subsetting 방향. JS 예산 (< 50KB) 현실적. |
| D5 일관성 | 7/10 | 15% | Vision doc과 대부분 정합. 그러나 `--text-chrome-dim` 토큰이 Step 1-1 R2에서 실질적으로 80%로 수정되었는데 landing `:root`에 60%로 정의됨. Step 1-1의 교훈이 landing에 전파되지 않음. |
| D6 리스크 | 7/10 | **25%** | CTA subtitle 3.40:1 WCAG FAIL = 접근성 법적 리스크. Header CTA 40px = 모바일 사용성 리스크. Hero gradient 4.45:1 = borderline 리스크. Footer 링크 25px 터치 타겟 = 모바일 UX 리스크. |

---

## 가중 평균: 7.80/10 PASS

**산출:**
- D1: 9 × 0.10 = 0.90
- D2: 8 × 0.25 = 2.00
- D3: 8 × 0.15 = 1.20
- D4: 9 × 0.10 = 0.90
- D5: 7 × 0.15 = 1.05
- D6: 7 × 0.25 = 1.75
- **합계: 7.80**

---

## 이슈 목록 (우선순위 순)

### Critical

**1. [D3/D5/D6] CTA subtitle `--text-chrome-dim` 60% = 3.40:1 WCAG FAIL**

Line 909: `--text-chrome-dim #a3c48a/60` and line 1115: `--text-chrome-dim: rgba(163, 196, 138, 0.6)`.

This is the **same issue** that was fixed in Step 1-1 R2 for sidebar section headers (changed to 80%). The landing page's `:root` token was not updated. The CTA subtitle at 16-18px is normal text (not large text — WCAG large = ≥18pt/24px or ≥14pt bold/18.66px bold), requiring 4.5:1.

**Fix:** Update `:root` token to `--text-chrome-dim: rgba(163, 196, 138, 0.8)` = 4.82:1 PASS. This fixes both the CTA subtitle and any other element using this token.

### Major

**2. [D3/D6] Header CTA button height = 40px (below 44px touch target)**

Line 1225: `height: 40px; padding: 0 24px;` — padding is horizontal only. The writer's a11y checklist (line 1894) incorrectly claims padding reaches 44px.

**Fix:** `height: 44px;` (or `min-height: 44px`). This aligns with all other buttons in the system (hero buttons are 48px, CTA button is 56px). 44px maintains the 8px grid (8×5.5 — or use 48px = 8×6 for consistency with hero buttons).

### Minor

**3. [D3] Hero gradient brings secondary text to 4.45:1 — borderline**

At gradient center (6% sage tint), `#6b705c` on `#f0efe9` = 4.45:1 (0.05 below 4.5:1). Primary text unaffected (15.11:1).

**Fix options (any of):**
- Reduce gradient to 4% opacity
- Restrict gradient to top portion only (above text)
- Accept as-is (deficit is imperceptible and only at single point)

**4. [D3] Footer copyright on surface = 4.48:1 — borderline**

`#756e5a` on `#f5f0e8` = 4.48:1 (0.02 below 4.5:1). Vision doc verified this color at 4.5:1 on cream `#faf8f5`, but footer uses surface `#f5f0e8` which is slightly darker.

**Fix:** Use `--text-secondary` (`#6b705c` = 4.52:1 PASS) for copyright instead of `--text-tertiary`.

**5. [D2] Footer link touch targets too small for mobile**

`padding: 4px 0` = ~25px interactive height. On mobile, footer links become primary navigation (desktop nav is hidden). 44px minimum needed.

**Fix:** Add `min-height: 44px; display: flex; align-items: center;` to `.footer-column a` on mobile.

**6. [D2] Tab transitions not covered by prefers-reduced-motion**

`.tab-trigger` has `transition: color 200ms ease, border-color 200ms ease` (line 1565) but the `prefers-reduced-motion` block (lines 1155-1161) only covers `.reveal`. Tab transitions should also be disabled.

**7. [D2] Tab tabindex management not specified**

Active tab should have `tabindex="0"`, inactive tabs `tabindex="-1"`. Home/End keys should move to first/last tab. This is standard per ARIA Authoring Practices Guide.

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ✅ 없음 — 경쟁사 실존, CSS 유효, 라이브러리 실존 |
| 보안 구멍 | ✅ 없음 |
| 빌드 깨짐 | ✅ 해당 없음 (연구 문서) |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

## Strengths (칭찬)

1. **Dual-check reduced-motion pattern** — CSS + JS 동시 체크 (lines 1155-1161, 1861-1864). CSS에서 `opacity:1; transform:none; transition:none`으로 즉시 표시하고, JS에서도 `matchMedia` 체크 후 `.visible` 클래스 즉시 추가. 이중 안전장치로 "flash-of-invisible-content" 방지. 3개 Step 중 최고 구현.

2. **CTA inverted button focus ring** — `outline: 2px solid var(--text-chrome)` (line 1769). Dark bg에서 `#a3c48a`로 6.63:1 contrast. Step 1-1에서 지적한 dark-sidebar focus ring 이슈를 landing에서는 올바르게 해결.

3. **Agent Showcase section** — 경쟁사 어디에도 없는 CORTHEX 고유 섹션 (Big Five 성격, 에이전트 메모리, 성과 추적). 랜딩 페이지 차별화의 핵심. 시각적으로 agent card demo + 3-trait grid 구조가 정보 전달에 효과적.

4. **Performance-first animation** — Framer Motion (~25KB) 대신 CSS transitions + IntersectionObserver. 랜딩 JS budget < 50KB. custom tab component < 2KB. Font subsetting (JBMono numbers-only). 이 접근은 Oracle ARM VPS에 적합.

5. **Korean-first copy** — 모든 UI copy가 한국어로 작성. 번역투가 아닌 자연스러운 한국어 ("당신의 AI 조직, 살아있고 책임지는."). 랜딩 페이지에서 한국어 우선은 CEO 대상 플랫폼에 적합.

6. **Mobile nav strategy** — Hamburger 메뉴 대신 footer로 nav 이동 (line 1967). Mobile header = 로고 + CTA만. 이는 Vercel/Stripe 모바일 패턴과 일치하며, 랜딩 페이지에서 hamburger보다 전환율이 높은 것으로 검증됨.

---

## Cross-talk 요약

- **ux-brand**: Agent Showcase 섹션이 CEO(비개발자)에게 "Big Five 성격"이라는 심리학 용어가 친숙한지. "성격 부여" → "개성 부여" 같은 더 직관적 표현 검토. 또한 Problem→Solution의 "WITHOUT/WITH" 영어 표현이 한국어 landing에서 적절한지.
- **tech-perf**: IntersectionObserver + CSS-only scroll-reveal의 Safari 호환성 (특히 `threshold` + `rootMargin` 조합). `vite-react-ssg` vs React Router v7 SSG 번들 크기 비교. Font subsetting (JBMono numbers-only) 실제 구현 방법 (pyftsubset 또는 Google Fonts API subset).

---

*End of Critic-B Review — Phase 1, Step 1-3*
