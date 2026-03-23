# Critic-C (PM) Review — Step 8: Visual Design Foundation

**Reviewer:** John (Product Manager)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 1436–1855)
**References verified:** `_uxui_redesign/phase-3-design-system/design-tokens.md`, `_uxui_redesign/phase-0-foundation/vision/vision-identity.md`, `_bmad-output/planning-artifacts/architecture.md`

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 모든 색상에 hex/RGB/WCAG 대비 비율 명시. 스페이싱 토큰 전부 px+Tailwind 매핑. 타이포 스케일 9단계 전부 크기/행높이/자간/웨이트/용도 기재. CSS 코드 스니펫(prefers-reduced-motion, forced-colors) 포함. "적절한"/"필요에 따라" 같은 추상 표현 0건. |
| D2 완전성 | 9/10 | Step instruction의 4대 영역(Color/Typography/Spacing/Accessibility) 전부 커버. 모바일 적응(60-30-10 변형, 터치 타겟, 반응형 4단계), 엣지 케이스(CVD 보상, reduced-motion, forced-colors, 사이드바 배지 접근성), 에러/비활성 상태 처리까지 포함. Noto Serif KR의 `@fontsource-variable` import 코드만 누락(minor — lazy-load 대상이므로 main.tsx 스니펫에서 제외한 것은 합리적). |
| D3 정확성 | 9/10 | design-tokens.md와 전수 대조: 62개 토큰값(hex, px, ratio) 전부 일치. chart-3이 구버전 `#8B9D77`이 아닌 수정된 `#E07B5F` 반영 확인. chrome-dim opacity 0.80 (구버전 0.60에서 수정) 확인. vision-identity의 primary text 대비(16.5:1)와 design-tokens(16.42:1) 차이에서 design-tokens 권위 소스를 정확히 따름. 사이드바 액센트 2.27:1 WCAG 실패도 정확히 문서화. |
| D4 실행가능성 | 8/10 | fontsource import 코드, CSS media query 스니펫 제공. Tailwind 클래스 매핑 전 토큰에 명시. 커스텀 breakpoint(md:640, xl:1440) 설정 필요성 언급. 다만 `tailwind.config.ts`의 실제 설정 스니펫(screens, borderRadius 커스텀)이 없어 개발자가 별도 작성 필요. radius-sm(4px)→`rounded-sm`(기본 2px) 매핑은 config override 전제인데, override 코드가 부재. |
| D5 일관성 | 9/10 | Phase 0 "Controlled Nature" 철학, Natural Organic 방향, Sovereign Sage 팔레트 정합. Phase 3 design-tokens와 값 수준 100% 일치. Step 4 감정 목표(Authority & Trust → Curiosity & Delight → Calm Confidence)를 60-30-10 표에 직접 매핑. 네이밍 컨벤션(kebab-case 토큰) 일관. 아키타입(Ruler/Sage) 용어 통일. |
| D6 리스크 | 8/10 | 6개 리스크 명시 식별: (1) Success≈Accent 혼동 + 필수 구분 규칙, (2) Red-on-olive 배지 2.67:1 + 3중 보상, (3) 입력 보더 WCAG 1.4.11 규칙, (4) 비활성 텍스트 FAIL 의도적 표기, (5) CVD-safe 차트 + 패턴 채우기 보조, (6) 사이드바 포커스 링 대안. 미비점: Noto Serif KR 번들 사이즈 리스크 미언급(variable font이라 subset 전략 없으면 1-5MB), FOIT/FOUT에 대한 `font-display` 전략 미명시(self-hosted가 CDN보다 낫지만 완전 해결은 아님). |

---

## 가중 평균: 8.65/10 ✅ PASS (Grade A)

| 차원 | 점수 | 가중치 | 기여 |
|------|------|--------|------|
| D1 구체성 | 9 | 20% | 1.80 |
| D2 완전성 | 9 | 20% | 1.80 |
| D3 정확성 | 9 | 15% | 1.35 |
| D4 실행가능성 | 8 | 15% | 1.20 |
| D5 일관성 | 9 | 10% | 0.90 |
| D6 리스크 | 8 | 20% | 1.60 |
| **합계** | — | **100%** | **8.65** |

---

## 이슈 목록

1. **[D4 실행가능성]** `tailwind.config.ts` 커스텀 설정 코드 부재 — breakpoints(md:640, xl:1440), borderRadius(rounded-sm=4px) override 스니펫이 없어 개발자가 추론해야 함. 해당 섹션에 "tailwind.config.ts 설정 필수" 언급은 있으나 복붙 가능한 코드는 미제공.
2. **[D6 리스크]** Noto Serif KR 번들 사이즈 — `@fontsource-variable/noto-serif-kr`은 전체 CJK 글리프 포함 시 수 MB. subset 전략(필요 글리프만 번들) 또는 lazy-load 가이드라인 명시 권장.
3. **[D6 리스크]** `font-display` 전략 미명시 — self-hosted가 CDN FOIT를 줄이지만, `font-display: swap` 또는 `optional` 명시가 없으면 초기 로드 시 깜빡임 가능.

---

## 자동 불합격 조건 검토

| 조건 | 결과 |
|------|------|
| 할루시네이션 (존재하지 않는 파일/API/함수 참조) | **CLEAR** — 62개 토큰 전수 대조 일치 |
| 보안 구멍 | **CLEAR** — 시크릿 없음, 외부 CDN 의존성 제거 |
| 빌드 깨짐 | **CLEAR** — CSS 스니펫 syntactically valid |
| 데이터 손실 위험 | **CLEAR** — 마이그레이션 없음 |
| 아키텍처 위반 | **CLEAR** — engine/ 경계 무관 (UX 스펙) |

---

## 종합 평가

PM 관점에서 이 Step은 **제품 비전을 시각적으로 완전히 구현하는 설계서**다. 특히 강점:

- **Step 4 감정 목표의 직접적 시각화**: 60-30-10 표에 "넓은 하늘 아래 정원"(Calm Confidence), "대지의 경계"(Authority & Trust), "살아있는 싹"(Curiosity & Delight) 메타포를 연결한 것은 디자인 결정의 "why"를 명확히 한다.
- **접근성 내장 설계**: WCAG 검증을 후속 QA가 아닌 색상/타이포 정의 시점에 통합. 17개 조합 전수 검증 + CVD 보상 + forced-colors fallback은 프로덕션 수준.
- **리스크 선제 대응**: Success≈Accent 혼동, Red-on-olive 한계를 스스로 식별하고 구체적 해결책 제시.

3개 이슈는 모두 개선 권장(nice-to-have)이며 블로커 아님. **Grade A 통과.**
