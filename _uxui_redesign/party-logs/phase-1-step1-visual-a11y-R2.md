# Critic-B Review R2 — Step 1-1: Web Dashboard Layout Research

**Reviewer:** Visual Hierarchy + WCAG Verification
**Document:** `_uxui_redesign/phase-1-research/web-dashboard/web-layout-research.md`
**Date:** 2026-03-23
**R1 Score:** 7.00/10 (Conditional Pass) → **R2 Score: 8.10/10 PASS**

---

## R1 Issue Resolution Verification

### Critical (1/1 resolved)

| # | Issue | Fix | Verified |
|---|-------|-----|----------|
| 1 | Section header 50% opacity = 2.82:1 | Changed to 80% (line 649) | **4.82:1 PASS** — independently calculated, blended `#8aa773` |

### Major (4/4 resolved)

| # | Issue | Fix | Verified |
|---|-------|-----|----------|
| 2 | No `:focus-visible` styles | Added on `.nav-item` (line 631) and `.command-palette-item` (line 764) | ✅ `outline: 2px solid var(--accent-primary)`, `outline-offset: -2px` |
| 3 | No `prefers-reduced-motion` | Added `@media` block (lines 821-834) | ✅ Covers app-shell, sidebar, nav-item, command-palette-overlay |
| 4 | Command palette missing ARIA | Comment block (lines 729-732) | ✅ role="combobox", role="listbox", role="option", aria-activedescendant |
| 5 | Mobile sidebar missing ARIA | Comment block (lines 794-796) | ✅ role="dialog", aria-modal, focus trap, ESC close |

### Additional fixes (3/3)

| Fix | Verified |
|-----|----------|
| Zone B separator → `rgba(255,255,255,0.4)` (line 587) | ✅ **3.40:1** — passes WCAG 1.4.11 (3:1) |
| Semantic HTML comment block (lines 777-782) | ✅ aside, header, main, nav aria-label, skip-to-content |
| Mobile sidebar-backdrop CSS (lines 808-813) | ✅ Fixed overlay with rgba(0,0,0,0.5) + z-index 40 |
| Breakpoints aligned to Vision §13.1 (line 786) | ✅ `< 1024px` (was 768px) |

---

## New Issue Found in R2

### Minor

**1. [D3] Focus ring `#606C38` insufficient contrast on dark sidebar — 2.27:1**

The `:focus-visible` outline uses `var(--accent-primary)` (`#606C38`) which is a dark olive on the dark olive sidebar (`#283618`). Independent calculation:

| Context | Focus Ring Color | Background | Ratio | WCAG 1.4.11 (3:1) |
|---------|-----------------|------------|-------|---------------------|
| Nav item (default) | `#606C38` | `#283618` | 2.27:1 | **FAIL** |
| Nav item (hover) | `#606C38` | `white/10` on `#283618` | 1.67:1 | **FAIL** |
| Nav item (active) | `#606C38` | `white/15` on `#283618` | 1.42:1 | **FAIL** |

**Fix for Phase 2:** Use `#a3c48a` (nav text color) as focus ring on sidebar elements — gives 6.63:1 against sidebar bg. The accent-primary focus ring works fine on cream content area but needs override on dark chrome:
```css
.sidebar .nav-item:focus-visible {
  outline-color: var(--text-chrome); /* #a3c48a — 6.63:1 on sidebar */
}
```

This is not blocking for the research document (CSS here is illustrative, not production code), but should be noted for Phase 2 implementation.

---

## R2 차원별 점수

| 차원 | R1 | R2 | 변화 | 근거 |
|------|-----|-----|------|------|
| D1 구체성 | 9 | 9 | — | 변동 없음. CSS 코드, ASCII 다이어그램, 7개 layout variant 코드 유지. |
| D2 완전성 | 7 | **8** | +1 | focus-visible, prefers-reduced-motion, ARIA comment blocks, semantic HTML, skip-to-content 패턴 추가. 남은 누락: 터치 타겟 크기 명시, Wide(≥1440px) breakpoint. |
| D3 정확성 | 7 | **8** | +1 | Section header 80% opacity = 4.82:1 verified. Zone B separator 40% = 3.40:1 verified. 새 이슈: focus ring dark sidebar 2.27:1 (minor — illustrative CSS). |
| D4 실행가능성 | 8 | 8 | — | 변동 없음. |
| D5 일관성 | 6 | **8** | +2 | Breakpoint 1024px로 Vision §13.1과 정렬. Sidebar dim opacity Vision과 동일 (80%로 통일). |
| D6 리스크 | 6 | **8** | +2 | Critical contrast FAIL 해결. 키보드 접근성 (focus-visible) 추가. prefers-reduced-motion 추가. 모바일 ARIA 추가. 잔여: focus ring dark sidebar (minor, Phase 2). |

---

## R2 가중 평균: 8.10/10 PASS

**산출:**
- D1: 9 × 0.10 = 0.90
- D2: 8 × 0.25 = 2.00
- D3: 8 × 0.15 = 1.20
- D4: 8 × 0.10 = 0.80
- D5: 8 × 0.15 = 1.20
- D6: 8 × 0.25 = 2.00
- **합계: 8.10**

---

## Phase 2 참고 사항 (blocking 아님)

1. **Focus ring on dark sidebar**: `var(--accent-primary)` → `var(--text-chrome)` override 필요
2. **Touch targets**: Nav items ~37px, cmd palette items 40px — 44px 미만. Padding 증가 권장
3. **Wide breakpoint (≥1440px)**: Vision §13.1 정의되어 있으나 미구현. 3-column grid 등
4. **Semantic HTML 수정**: `<aside role="navigation">` → `<aside>` containing `<nav>`. role 중복 방지
5. **Command palette `data-selected`**: Production에서 `aria-selected="true"` + `role="option"` 사용

---

*End of Critic-B R2 Review — Phase 1, Step 1-1*
