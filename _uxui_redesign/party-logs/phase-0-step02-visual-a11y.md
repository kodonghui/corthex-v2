# Critic-B Review — Step 0-2: Vision & Identity

**Reviewer:** Marcus (Visual Hierarchy) + Quinn (WCAG Verification)
**Document:** `_uxui_redesign/phase-0-foundation/vision/vision-identity.md` (~460 lines, 14 sections)
**Date:** 2026-03-23

---

## Verification Performed

### Contrast Ratio Verification (calculated, not just stated)

**Text Colors on cream `#faf8f5` (Section 3.2):**

| Role | Hex | Stated Ratio | My Calculated Ratio | WCAG AA |
|------|-----|-------------|---------------------|---------|
| Primary `#1a1a1a` | `#1a1a1a` | 16.5:1 | ~16.4:1 | ✅ PASS |
| Secondary `#6b705c` | `#6b705c` | 4.7:1 | ~4.83:1 | ✅ PASS |
| Tertiary `#756e5a` (corrected) | `#756e5a` | 4.5:1 | ~4.82:1 | ✅ PASS (stated value conservative) |
| Sidebar `#a3c48a` on `#283618` | `#a3c48a` | 6.63:1 | ~5.8-6.6:1 | ✅ PASS |

**Semantic Colors on cream `#faf8f5` (Section 3.3 — NOT included in doc, calculated by me):**

| Role | Hex | Calculated Ratio | WCAG AA |
|------|-----|-----------------|---------|
| Success `#4d7c0f` | `#4d7c0f` | ~4.74:1 | ✅ PASS |
| Warning `#b45309` | `#b45309` | ~4.74:1 | ✅ PASS |
| Error `#dc2626` | `#dc2626` | ~4.55:1 | ✅ PASS (borderline) |
| Info `#2563eb` | `#2563eb` | ~4.88:1 | ✅ PASS |

All semantic colors pass WCAG AA when used as text on cream background. However, these ratios are NOT documented in the vision doc — should be for completeness.

**Chart Palette (Section 3.4 — risk assessment):**

| Series | Hex | Estimated Contrast on cream | Risk |
|--------|-----|---------------------------|------|
| 1 `#606C38` | `#606C38` | ~4.5:1 | ✅ OK for labels |
| 2 `#5a7247` | `#5a7247` | ~3.8:1 | ⚠️ Fails for small text |
| 3 `#8B9D77` | `#8B9D77` | ~2.5:1 | ❌ Fails — too light for legend text |
| 4-6 | progressively lighter | <2:1 | ❌ Fails — use only as fill, never as text |

### Codebase Cross-Checks

| Item | Claim | Verified | Status |
|------|-------|----------|--------|
| Subframe component count | "46 Subframe components" (line 353) | **44 .tsx files** in `packages/app/src/ui/components/` | ⚠️ Minor mismatch (46 stated vs 44 actual) |
| JetBrains Mono in admin | "currently only in admin" (line 155) | admin/index.html loads it via CDN | ✅ CORRECT |
| prefers-reduced-motion = 0 | "0 instances" (from tech spec) | Confirmed 0 in packages/app/src/ | ✅ CORRECT |
| aria-current = 0 | Implied gap (Section 11.2 rule 3) | Confirmed 0 instances | ✅ CORRECT |
| Skip-to-content = 0 | Implied gap (Section 11.1) | Confirmed 0 instances | ✅ CORRECT |

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 10% | 모든 토큰에 CSS 변수명 + hex + px + 사용처 명시. 타이포 스케일 Major Third 비율 포함. 애니메이션 ms 단위 + easing + reduced-motion fallback. 차트 팔레트 contrast만 미포함. |
| D2 완전성 | 8/10 | **25%** | 14개 섹션으로 브랜드→색상→타이포→스페이싱→아이콘→모션→접근성→반응형 전부 커버. 누락: (1) 터치 타겟 크기 (모바일 48px 최소), (2) z-index 시스템, (3) 시맨틱 색상 contrast ratio 테이블, (4) 차트 팔레트 접근성 검증. |
| D3 정확성 | 8/10 | 15% | Contrast ratio 전부 직접 계산으로 검증 — 정확. Tertiary 4.5:1 표기는 실제 4.82:1 (보수적 표기, 해 없음). Subframe "46" → 실제 44 (사소한 불일치). JetBrains Mono CDN gap 정확. |
| D4 실행가능성 | 8/10 | 10% | CSS custom property 명명 체계로 즉시 theme.css 작성 가능. 컴포넌트 마이그레이션 P0-P5 우선순위. 타이포 스케일 Tailwind 매핑 가능. |
| D5 일관성 | 9/10 | 15% | Tech Spec (Step 0-1)과 강하게 정합. R1 피드백 전부 반영 (tertiary 색상 수정, sidebar contrast 6.63:1, prefers-reduced-motion 갭). Benchmark report의 Option C 선택 근거 명확. 46 vs 44만 미세 불일치. |
| D6 리스크 | 7/10 | **25%** | 단일 테마 결정 (5-테마 428-사고 제거) ✅. Dark mode "not v3" 명확 ✅. Reduced-motion 6개 패턴 전부 fallback ✅. Subframe 마이그레이션 우선순위 ✅. 누락: (1) 차트 팔레트 series 3-6이 텍스트로 쓰이면 WCAG 실패, (2) olive 팔레트 SaaS 시장 리스크 (rare = differentiation but also unfamiliar), (3) sidebar dim text 60% opacity "marginal" — 구체적 해결책 없음. |

---

## 가중 평균: 8.00/10 ✅ PASS

**산출:**
- D1: 9 × 0.10 = 0.90
- D2: 8 × 0.25 = 2.00
- D3: 8 × 0.15 = 1.20
- D4: 8 × 0.10 = 0.80
- D5: 9 × 0.15 = 1.35
- D6: 7 × 0.25 = 1.75
- **합계: 8.00**

---

## 이슈 목록 (우선순위 순)

### Minor (통과에 영향 없음, Phase 1 참고)

1. **[D2] Semantic color contrast ratios 미포함** — Section 3.3에 hex + usage만 있고 cream 배경 대비 contrast ratio 없음. 전부 PASS이지만 (4.55~4.88:1) 문서화 권장.

2. **[D6] Chart palette series 3-6 접근성 리스크** — `#8B9D77` (series 3) = ~2.5:1 on cream. 차트 fill로만 사용 시 OK, 레전드/라벨 텍스트로 사용 시 WCAG FAIL. "차트 라벨은 `--text-secondary` 사용" 규칙 추가 권장.

3. **[D3] Subframe 46 → 44** — Section 10.1 "46 Subframe components" + Section 10.2 합계 (10+5+7+5+5+14=46) vs 실제 44개. codebase와 2개 차이 (Calendar, ToggleGroup 포함 여부 확인 필요).

4. **[D2] Touch target 최소 크기 미정의** — 모바일 반응형 섹션(13)에 터치 타겟 48×48px 최소 규칙 없음. WCAG SC 2.5.5 (AAA) 및 iOS/Android HIG 기준.

5. **[D2] Z-index 시스템 미정의** — sidebar, topbar, modal overlay, toast, dropdown의 z-index 스택 순서. 현재 codebase에서 z-index 충돌 있을 수 있음.

6. **[D6] Sidebar dim text 60% opacity 해결책 미구체화** — "~4.5:1 marginal" 인정했으나 대안 (opacity 70%? 더 밝은 hex?) 미제시.

---

## 자동 불합격 조건 체크

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ✅ 없음 |
| 보안 구멍 | ✅ 없음 |
| 빌드 깨짐 | ✅ 해당 없음 (문서) |
| 데이터 손실 위험 | ✅ 없음 |
| 아키텍처 위반 | ✅ 없음 |

---

## Strengths (칭찬)

1. **Tertiary text correction** — `#a3a08e` (2.46:1) → `#756e5a` (4.82:1). R1 피드백 정확히 반영.
2. **Motion section** — 6개 transition 패턴 전부 `prefers-reduced-motion` fallback 포함. R1에서 0 instances였던 크리티컬 갭을 완벽 해결.
3. **Status indicators** — color + icon + text label 3중 인코딩. WCAG "color alone" 금지 원칙 준수.
4. **Single theme decision** — 5-테마 → 1-테마. 428-location 사고 재발 방지의 가장 근본적 해결.
5. **Type scale** — ad-hoc에서 Major Third (1.250) ratio로 체계화. Brand "CORTHEX" 14→18px 승격으로 시각적 위계 개선.
6. **Design movement alignment** — Swiss + Arts & Crafts + Flat의 삼중 근거가 Natural Organic 팔레트를 잘 뒷받침.

---

## Cross-talk 요약

- **ux-brand**: Natural Organic 선택 근거와 Wabi-sabi 철학 연결이 브랜드 관점에서 적절한지 확인 요청. Chart palette 라벨 접근성 리스크 공유.
- **tech-perf**: 차트 팔레트 series 3-6의 라이트 색상이 data visualization 접근성에 미치는 영향. z-index 시스템 부재가 modal/dropdown 스택에 미치는 영향.
