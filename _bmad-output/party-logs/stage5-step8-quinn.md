# Critic-B (QA + Security) Review — Step 8: Visual Design Foundation

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 1436–1855)
**Cross-references verified:** `_uxui_redesign/phase-3-design-system/design-tokens.md`, `_uxui_redesign/phase-0-foundation/vision/vision-identity.md`, Step 4 emotional goals (lines 550–580)

---

## 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 10% | 모든 색상에 hex+RGB+토큰명, 타이포에 px+rem+line-height+letter-spacing, 간격에 정확한 px+Tailwind 클래스. "적절한" 표현 거의 없음. 황금비 비율까지 수치로 제시. |
| D2 완전성 | 8/10 | 25% | 4개 섹션(Color, Typography, Spacing, A11y) 모두 포괄적. 차트 팔레트 6색, CVD 보완, badge a11y까지 커버. Noto Serif KR의 `main.tsx` import 코드 누락(Inter+JBMono만 제시), 애니메이션 base duration/easing 토큰은 범위 외이나 cross-ref 부재. |
| D3 정확성 | 8/10 | 15% | 색상값·WCAG 대비비·토큰명이 design-tokens.md (v3)와 100% 일치. WCAG 비율 spot-check 통과 (#1a1a1a on #faf8f5 ≈ 16.3:1 → 16.42:1 주장 합리적). **오류 1건:** `--radius-sm` 4px를 `rounded-sm`으로 매핑했으나, Tailwind 기본 `rounded-sm` = 0.125rem = **2px**. 4px = `rounded`. tailwind.config.ts 커스터마이징 언급 없음. |
| D4 실행가능성 | 9/10 | 10% | 폰트 import 코드, `prefers-reduced-motion` CSS, `forced-colors` CSS까지 복붙 수준. Tailwind 클래스 매핑이 대부분 정확하여 개발자가 바로 구현 가능. radius 매핑 오류만 수정 필요. |
| D5 일관성 | 9/10 | 15% | Phase 0 Vision & Identity(Natural Organic, Controlled Nature, Ruler+Sage archetype)와 완전 정합. Phase 3 design-tokens.md 값 100% 일치. Step 4 감정 목표(Authority & Trust → Curiosity & Delight → Calm Confidence)가 60-30-10 테이블에 명시적으로 통합됨. 네이밍 컨벤션(Sovereign Sage, kebab-case 토큰) 일관. |
| D6 리스크 | 8/10 | 25% | **식별된 리스크:** Success≈Accent 혼동(1.14:1) 명시적 해결규칙 제시, red-on-olive badge 3중 보완, CVD-safe 차트+패턴채우기, disabled text WCAG FAIL 의도적 문서화, `--accent-primary` on olive sidebar 2.27:1 경고+대안. **미식별 리스크 3건:** z-index 30 3개 충돌(overlay-backdrop/bottom-nav/FAB), CJK 폰트 번들 사이즈, Tailwind 비표준 breakpoint(md:640/xl:1440) 서드파티 호환성. |

---

## 가중 평균: 8.35/10 ✅ PASS (Grade A)

계산: (9×0.10) + (8×0.25) + (8×0.15) + (9×0.10) + (9×0.15) + (8×0.25) = 0.90 + 2.00 + 1.20 + 0.90 + 1.35 + 2.00 = **8.35**

---

## 자동 불합격 검사

| 조건 | 결과 |
|------|------|
| 할루시네이션 (존재하지 않는 API/파일/함수) | CLEAR — 모든 토큰이 design-tokens.md에 존재 |
| 보안 구멍 | CLEAR — 하드코딩된 시크릿 없음 |
| 빌드 깨짐 | CLEAR — CSS/Tailwind 구문 정상 |
| 데이터 손실 위험 | N/A |
| 아키텍처 위반 (engine/ public API 외부 참조) | N/A |

---

## 이슈 목록

### 1. **[D3 정확성] Tailwind `rounded-sm` 매핑 오류** — 우선순위: Medium

**현재:** Line 1705 — `--radius-sm` | 4px | `rounded-sm`
**문제:** Tailwind CSS v3/v4 기본값에서 `rounded-sm` = 0.125rem = **2px**. 4px에 해당하는 클래스는 `rounded` (0.25rem).
**수정 방안:**
- (A) 매핑 수정: `rounded-sm` → `rounded` (4px) 또는
- (B) tailwind.config.ts에서 `borderRadius.sm: '4px'` 커스터마이징 명시 + 다른 radius 레벨도 확인

Tailwind 기본 매핑 참고:
```
rounded-sm  = 2px (0.125rem)
rounded     = 4px (0.25rem)
rounded-md  = 6px (0.375rem)
rounded-lg  = 8px (0.5rem)
rounded-xl  = 12px (0.75rem)
rounded-2xl = 16px (1rem)
```

### 2. **[D6 리스크] Z-index 30에 3개 요소 충돌** — 우선순위: Medium

**현재:** Lines 1731-1733 — `--z-overlay-backdrop` (30), `--z-bottom-nav` (30), `--z-fab` (30)
**문제:** 모바일에서 FAB(z=30)과 bottom-nav(z=30)이 동시 존재. overlay-backdrop(z=30) 활성화 시 세 요소의 paint order가 DOM 순서에 의존하게 됨 — 의도가 불명확.
**수정 방안:** z-index 분리 (예: bottom-nav=25, FAB=28, overlay-backdrop=30) 또는 **동시 존재 불가 제약** 명시.

### 3. **[D2 완전성] Noto Serif KR import 누락 (코드 스니펫)** — 우선순위: Low

**현재:** Lines 1585-1592 — `main.tsx` import 예시에 Inter + JetBrains Mono만 포함.
**문제:** Noto Serif KR은 `@fontsource-variable/noto-serif-kr` (line 1581 테이블)로 명시되었으나, 실제 import 코드가 없음.
**수정 방안:** 코드 스니펫에 추가:
```tsx
import '@fontsource-variable/noto-serif-kr/wght.css'; // 또는 400.css + 700.css
```
또는 "한국어 Serif는 lazy-load" 전략이라면 해당 전략을 명시.

### 4. **[D6 리스크] CJK 폰트 번들 사이즈 미고려** — 우선순위: Low

**문제:** Noto Serif KR (CJK 폰트)는 full weight 시 10-20MB. `@fontsource-variable`이 서브셋을 지원하나, 한국어 글리프 범위는 여전히 수 MB. 번들 사이즈 영향 및 로딩 전략(dynamic import, font-display: swap 등) 미언급.
**수정 방안:** "Noto Serif KR은 지식 라이브러리 진입 시 dynamic import로 지연 로딩" 등 전략 1줄 추가.

### 5. **[D6 리스크] 비표준 Tailwind breakpoint 서드파티 호환성** — 우선순위: Low

**현재:** Line 1687 — `md: 640px` (기본 768px), `xl: 1440px` (기본 1280px)
**인지됨:** `tailwind.config.ts` 설정 필수라고 명시 (양호).
**추가 리스크:** Radix UI, shadcn/ui 등 Tailwind 기반 서드파티 컴포넌트가 기본 breakpoint를 가정할 경우 레이아웃 불일치 가능. 이 리스크 한 줄 언급 권장.

---

## Cross-talk 요약

- Design-tokens.md (v3)와 Step 8 색상값 **완전 일치** 확인 — 다른 Critic이 색상 정확성 의문 제기 시 이 검증 참고.
- Step 4 감정 목표 → 60-30-10 매핑이 자연스러움. QA 관점에서 테스트 가능한 구체적 수치(대비비, px, rem)가 충분.
- WCAG 2.1 AA 전면 준수 목표가 접근성 섹션에서 체계적으로 구현됨. 특히 `forced-colors: active` High Contrast Mode 대응은 경쟁 제품에서도 드문 수준.

---

## 최종 판정

**8.35/10 — Grade A ✅ PASS**

Step 8은 색상·타이포·간격·접근성의 4개 축을 높은 구체성과 정확성으로 커버했다. 특히 Success≈Accent 혼동 해결 규칙, CVD-safe 차트 팔레트, red-on-olive badge 3중 보완 등 QA/접근성 관점의 리스크 대응이 우수하다. `rounded-sm` 매핑 오류와 z-index 충돌은 구현 시 수정 필요하나 방향성을 해치지 않는 사소한 이슈다.
