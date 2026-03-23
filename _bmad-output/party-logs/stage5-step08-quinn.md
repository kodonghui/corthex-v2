# Critic-B (QA) Review — Step 8: Visual Design Foundation

**Reviewer:** Quinn (QA Engineer)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 1434–1853)
**Grade Submitted:** A

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 10% | 9/10 | 모든 색상 hex+RGB+WCAG 대비, 모든 간격 px+Tailwind 클래스, 타이포 크기/웨이트/line-height/letter-spacing 전부 명시. 코드 스니펫(prefers-reduced-motion, forced-colors) 포함. "적절한" 수준 표현 0건. |
| D2 완전성 | 25% | 8/10 | Color System(6 서브섹션), Typography(4 서브섹션), Spacing & Layout(8 서브섹션), Accessibility(6 서브섹션) — 시각 디자인 기반의 모든 축 커버. 누락: (1) 스켈레톤/스피너 로딩 비주얼 패턴 미정의, (2) 프린트 스타일시트 미언급, (3) Noto Serif KR fontsource import 코드 누락 (Inter/JetBrains만 코드 제공). |
| D3 정확성 | 15% | 9/10 | Phase 3 Design Tokens와 전수 대조 — hex값 18개, 토큰명 40+개, WCAG 대비 16건 전부 일치. Phase 0 Vision Identity의 "Controlled Nature" 철학, Sovereign Sage 팔레트 명칭, 60-30-10 비율 정확 반영. v2→v3 팔레트 차이 명시적 구분("v2의 slate-950/cyan-400과는 다른 새 팔레트"). 오류 0건. |
| D4 실행가능성 | 10% | 9/10 | CSS 코드 스니펫 2건 (reduced-motion, forced-colors), main.tsx font import 코드, Tailwind 클래스 매핑 전 토큰, tailwind.config.ts 커스텀 breakpoint 경고 포함. 개발자가 토큰 테이블만 보고 CSS 변수 + Tailwind 설정 즉시 작성 가능. |
| D5 일관성 | 15% | 9/10 | Phase 0 Vision(§2.3 "Controlled Nature"), Phase 3 Design Tokens(§1-4 전체), Step 4 감정 목표(Authority & Trust → Curiosity & Delight → Calm Confidence) 모두 정합. 토큰 네이밍 kebab-case 통일. 428곳 색상 불일치 사건 및 5-테마 폐기 결정 일관. 용어(Sovereign Sage, Natural Organic, Ruler/Sage archetype) 전문서 동일. |
| D6 리스크 | 25% | 8/10 | **식별된 리스크 (8건):** (1) disabled text 2.48:1 WCAG FAIL → 장식 전용 제한, (2) accent on olive sidebar 2.27:1 → chrome focus ring 대안, (3) badge on olive 2.67:1 → shape+text+ring 3중 보완, (4) success≈accent 1.14:1 혼동 → 아이콘+텍스트 필수 구분 규칙, (5) chart CVD-safety → 4색조+패턴 채우기, (6) prefers-reduced-motion 전면 래핑, (7) forced-colors 보더 fallback, (8) 커스텀 Tailwind breakpoint 설정 경고. **누락 리스크 (3건):** (1) 3개 폰트 패밀리 총 파일 크기/로딩 성능 예산 미정의, (2) Retina/HiDPI 환경에서 1px 보더·그림자 렌더링 이슈 미언급, (3) Safari focus-visible 동작 차이 미고려. |

---

## 가중 평균: 8.50/10 ✅ PASS (Grade A)

계산: (9×0.10) + (8×0.25) + (9×0.15) + (9×0.10) + (9×0.15) + (8×0.25) = 0.90 + 2.00 + 1.35 + 0.90 + 1.35 + 2.00 = **8.50**

---

## 이슈 목록

### 중요도 순 (높음→낮음)

1. **[D6 리스크] 폰트 로딩 성능 예산 미정의**
   - Inter 4 웨이트 + JetBrains Mono 2 웨이트 + Noto Serif KR (variable) = 총 번들 크기 불명
   - 권장: "총 폰트 번들 ≤ 300KB (woff2)" 같은 성능 예산 명시
   - 영향: FCP ≤ 1.5초 목표(CEO 앱 /office)에 폰트 로딩이 병목 될 수 있음

2. **[D2 완전성] Noto Serif KR fontsource import 코드 누락**
   - Line 1586-1592: Inter + JetBrains Mono import만 제공. Noto Serif KR import 코드 없음
   - Phase 3 Design Tokens도 동일하게 누락 — 상위 문서부터 빠져있음
   - 권장: `import '@fontsource-variable/noto-serif-kr/wght.css';` 추가 또는 "lazy load on Korean content pages" 전략 명시

3. **[D6 리스크] HiDPI/Retina 1px 보더 렌더링**
   - `--border-primary` (#e5e1d3) 1px 보더가 Retina에서 0.5px처럼 보일 수 있음
   - 특히 cream 배경 위 1.23:1 대비의 장식 보더는 HiDPI에서 사라질 위험
   - 권장: "Retina에서는 border-width: 0.5px 또는 box-shadow 1px 대체" 가이드 추가

4. **[D2 완전성] 로딩 스켈레톤/스피너 비주얼 패턴 미정의**
   - Visual Foundation 레벨에서 스켈레톤 색상 (#f5f0e8 → #e5e1d3 shimmer?), 스피너 색상/크기 등 기본 패턴 부재
   - 컴포넌트 레벨에서 다룰 수 있으나, foundation에 최소한의 토큰 정의가 있으면 일관성 보장

5. **[D6 리스크] Safari focus-visible 동작 차이**
   - Safari는 `:focus-visible` 지원이 Chrome/Firefox와 다소 다름 (특히 click vs keyboard 구분)
   - 이중 포커스 링 전략(cream/olive)이 Safari에서 예상대로 동작하는지 검증 필요
   - 권장: `:focus-visible` polyfill 또는 fallback 전략 한 줄 추가

---

## 자동 불합격 조건 점검

| 조건 | 결과 |
|------|------|
| 할루시네이션 (존재하지 않는 API/파일/함수 참조) | **해당 없음** — 참조된 Phase 0, Phase 3 문서 모두 존재 확인 |
| 보안 구멍 | **해당 없음** — 시각 디자인 기반 문서 |
| 빌드 깨짐 | **해당 없음** — CSS 코드 스니펫 문법 정확 |
| 데이터 손실 위험 | **해당 없음** |
| 아키텍처 위반 | **해당 없음** |

---

## Cross-talk 요약

- 다른 Critic 리뷰 대기 중 — cross-talk 해당 없음 (첫 번째 제출)

---

## 총평

Step 8 Visual Design Foundation은 Phase 0 Vision과 Phase 3 Design Tokens의 기술 사양을 UX 스펙 차원으로 통합하는 데 **매우 성공적**이다. 특히:

- **WCAG 접근성 리스크**를 8건이나 선제 식별하고 각각에 구체적 대안을 제시한 점이 탁월
- 모든 토큰의 hex/RGB/WCAG 대비/Tailwind 클래스 매핑이 **Phase 3와 100% 정합**
- "Controlled Nature" 철학이 색상/타이포/간격/모서리 곡률 각각에서 **일관되게 관통**
- 60-30-10 모바일 변형과 touch target 접근성까지 커버

5건의 이슈는 모두 개선 권장 사항이며 블로커 아님. **Grade A 통과.**
