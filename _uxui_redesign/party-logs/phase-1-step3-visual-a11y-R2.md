# Critic-B Review R2 — Step 1-3: Landing Page Layout Research

**Reviewer:** Visual Hierarchy + WCAG Verification
**Document:** `_uxui_redesign/phase-1-research/landing/landing-page-research.md`
**Date:** 2026-03-23
**R1 Score:** 7.80/10 PASS → **R2 Score: 7.80/10 CONDITIONAL PASS**

---

## R1 Issue Resolution Verification

### Critical (1/1 UNRESOLVED)

| # | Issue | Attempted Fix | Verified |
|---|-------|---------------|----------|
| 1 | `--text-chrome-dim` 60% = 3.40:1 FAIL | Changed to 70% (line 1116) | **4.07:1 STILL FAILS** — writer claims ~5.2:1, but independent calculation confirms 4.07:1 |

**Detailed calculation for 70% opacity:**
- FG: `#a3c48a` = RGB(163, 196, 138)
- BG: `#283618` = RGB(40, 54, 24)
- Alpha blend at 0.7: R = 163×0.7 + 40×0.3 = **126**, G = 196×0.7 + 54×0.3 = **153**, B = 138×0.7 + 24×0.3 = **104**
- Blended hex: `#7e9968`
- Relative luminance: 0.2819
- BG luminance: 0.0316
- Contrast: (0.2819 + 0.05) / (0.0316 + 0.05) = **4.07:1**

The writer's comment `/* 70% opacity → ~5.2:1 contrast on #283618 */` is **factually incorrect**. The ~5.2:1 figure may have been confused with 90% opacity (5.65:1) or calculated against a different background.

**Opacity → contrast table (independently verified):**

| Opacity | Blended Hex | Contrast | WCAG AA (4.5:1) |
|---------|-------------|----------|-----------------|
| 60% | `#718b5c` | 3.40:1 | FAIL |
| 70% | `#7e9968` | 4.07:1 | **FAIL** |
| 77% | `#87a36e` | 4.59:1 | PASS (minimum) |
| 80% | `#8aa773` | 4.82:1 | PASS (recommended) |
| 90% | `#96b57e` | 5.65:1 | PASS |

**Required fix:** `--text-chrome-dim: rgba(163, 196, 138, 0.8)` — gives 4.82:1 with margin, consistent with Step 1-1 section header fix.

### Major (1/1 RESOLVED)

| # | Issue | Fix | Verified |
|---|-------|-----|----------|
| 2 | Header CTA 40px < 44px touch target | `min-height: 44px` (line 1226) | ✅ **PASS** — a11y checklist (line 1894) also corrected |

### Additional fixes applied (not from R1 issues)

| Fix | Verified |
|-----|----------|
| Font sizes `15px` → `16px` throughout | ✅ All instances now 16px — aligns with Vision §4.2 type scale |
| `-webkit-overflow-scrolling: touch` removed (2 instances) | ✅ No matches found — correct removal (deprecated, causes bugs on iOS 13+) |

---

## R2 차원별 점수

| 차원 | R1 | R2 | 변화 | 근거 |
|------|-----|-----|------|------|
| D1 구체성 | 9 | 9 | — | 변동 없음. |
| D2 완전성 | 8 | 8 | — | 변동 없음 — footer 터치 타겟, tab tabindex 미해결. |
| D3 정확성 | 8 | **7** | -1 | Header CTA 수정됨 (+). 그러나 `--text-chrome-dim` 70%의 CSS 코멘트가 "~5.2:1"이라고 명시하지만 실제는 4.07:1 — **사실과 다른 주장 추가됨**. R1에서는 틀린 수치 없이 60%였지만, R2에서 틀린 수치를 코멘트로 넣어 정확성 하락. |
| D4 실행가능성 | 9 | 9 | — | 변동 없음. |
| D5 일관성 | 7 | 7 | — | Step 1-1 R2는 section header를 80%로 수정. Landing은 70%. 아직 불일치. 80%로 맞춰야 전체 시스템 정합. |
| D6 리스크 | 7 | **8** | +1 | Header CTA 44px 수정으로 모바일 터치 리스크 해소. webkit-overflow-scrolling 제거. 그러나 CTA subtitle 4.07:1 WCAG FAIL은 여전히 법적 접근성 리스크. |

---

## R2 가중 평균: 7.80/10 CONDITIONAL PASS

**산출:**
- D1: 9 × 0.10 = 0.90
- D2: 8 × 0.25 = 2.00
- D3: 7 × 0.15 = 1.05
- D4: 9 × 0.10 = 0.90
- D5: 7 × 0.15 = 1.05
- D6: 8 × 0.25 = 2.00
- **합계: 7.90** → **7.80 (critical 미해결 페널티 적용)**

**CONDITIONAL PASS 사유:** Critical WCAG AA contrast failure 1건 미해결. 수정 단순 (0.7 → 0.8, 1곳 변경) — R3에서 즉시 PASS 예상.

---

## 잔여 이슈 (R3 해결 필요)

### Critical (1건)

**1. [D3/D5/D6] `--text-chrome-dim` 70% = 4.07:1 WCAG FAIL (변경 필요: 80%)**

Line 1116: `--text-chrome-dim: rgba(163, 196, 138, 0.7);  /* 70% opacity → ~5.2:1 contrast on #283618 */`

두 가지 수정 필요:
1. **Opacity**: `0.7` → `0.8` (4.82:1 PASS)
2. **Comment**: `~5.2:1` → `~4.8:1` (정확한 수치)

Line 910 ASCII diagram: `#a3c48a/70` → `#a3c48a/80`

**이 1건만 수정하면 PASS 예상 점수: 8.40+**

### Minor (5건 — Phase 2 참고, blocking 아님)

| # | Issue | Status |
|---|-------|--------|
| 3 | Hero gradient 4.45:1 borderline | 유지 — 비차단 |
| 4 | Footer copyright 4.48:1 borderline | 유지 — 비차단 |
| 5 | Footer link 25px touch target | 유지 — 모바일 Phase 2 |
| 6 | Tab transitions reduced-motion 미적용 | 유지 — Phase 2 |
| 7 | Tab tabindex 관리 미명시 | 유지 — Phase 2 |

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ⚠️ CSS 코멘트 수치 오류 (~5.2:1 ≠ 4.07:1) — 의도적 할루시네이션은 아님, 계산 실수 |
| 보안 구멍 | ✅ 없음 |
| 빌드 깨짐 | ✅ 해당 없음 |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

*End of Critic-B R2 Review — Phase 1, Step 1-3*
