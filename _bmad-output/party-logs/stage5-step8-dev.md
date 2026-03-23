# Critic-A (Developer) Review — Step 8: Visual Design Foundation

**Reviewer:** Amelia (Dev Agent) — Architecture + API weights
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 1436–1855
**Source verification:** Cross-referenced against `_uxui_redesign/phase-3-design-system/design-tokens.md` (§1–§6), `_uxui_redesign/phase-0-foundation/vision/vision-identity.md` (§1–§2), and Steps 1–7 of the UX spec.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 모든 색상값 hex+RGB, WCAG 대비 비율, px 단위, Tailwind 클래스, 토큰명 명시. "감정 효과" 칼럼이 Step 4 감정 목표와 직접 매핑. `theme.screens` 오버라이드 구체 예시만 없음 (1곳). |
| D2 완전성 | 9/10 | Color(primary+semantic+text+chart+accent restrictions), Typography(stack+scale+rules+golden ratio), Spacing(grid+ratios+app shell+responsive+grid system+radius+shadow+z-index+touch targets), Accessibility(contrast table 17조합+focus+color independence+motion+iconography+badge CVD) — 4개 서브시스템 전수 커버. Motion duration tokens는 Phase 3 §5에서 별도 정의되어 있으므로 여기서 누락은 합리적. |
| D3 정확성 | **10/10** | Phase 3 Design Tokens 전수 대조 완료. 색상 hex값 18개 전부 일치, WCAG 대비 비율 17개 전부 일치, 타이포그래피 스케일 9단계 전부 일치, 스페이싱 토큰 9개 전부 일치, z-index 13레이어 전부 일치, shadow 4단계 전부 일치, border radius 5단계 전부 일치, 터치 타겟 5컨텍스트 전부 일치. 할루시네이션 0건. |
| D4 실행가능성 | 8/10 | 폰트 import 코드 스니펫(`main.tsx`), CSS 미디어 쿼리 코드(prefers-reduced-motion, forced-colors), Tailwind 클래스 매핑 전수 제공. 개발자가 바로 구현 가능 수준. 미비: (1) `tailwind.config.ts` `theme.screens` 오버라이드 스니펫 없음, (2) TW4 `@theme` 디렉티브에서 `corthex-*` 네임스페이스 설정 예시 없음, (3) `--radius-sm: 4px`이 TW4 기본 `rounded-sm: 2px`과 다른데 오버라이드 방법 미명시. |
| D5 일관성 | 9/10 | Phase 0 Vision & Identity의 "Controlled Nature" 철학, Ruler/Sage archetype 매핑 완벽 정합. Phase 3 Design Tokens와 100% 수치 일치. Step 4 감정 목표(Authority & Trust → Curiosity & Delight → Calm Confidence) 60-30-10 테이블에서 직접 연결. Phase 2 스페이싱 수정(24px→32px) 반영됨. 용어(NEXUS, Hub, ARGOS) PRD 일치. 미세: breakpoint 테이블 `sm` 레이블이 TW4 `sm` breakpoint와 혼동 가능 (label vs actual breakpoint). |
| D6 리스크 | 8/10 | Success≈Accent 혼동 위험 식별+3중 구분 규칙 제시, red-on-olive 배지 2.67:1 한계 인지+형태/텍스트/링 3중 보완, 사이드바 accent 2.27:1 불통과 경고, disabled text 의도적 FAIL 문서화, TW4 breakpoint 커스텀 주의사항 명시. 미비: Noto Serif KR 파일 크기(CJK ~2-4MB) 번들 임팩트 미언급, self-hosted 폰트 FOUT/FOIT 전략(font-display) 미명시. |

---

## 가중 평균: 8.95/10 ✅ PASS (Grade A)

**계산:**
- D1 (15%): 9 × 0.15 = 1.35
- D2 (15%): 9 × 0.15 = 1.35
- D3 (25%): 10 × 0.25 = 2.50
- D4 (20%): 8 × 0.20 = 1.60
- D5 (15%): 9 × 0.15 = 1.35
- D6 (10%): 8 × 0.10 = 0.80
- **Total = 8.95**

---

## 이슈 목록

1. **[D4 실행가능성]** TW4 `theme.screens` 오버라이드 스니펫 부재 — `md: 640px`, `xl: 1440px`은 기본값과 다르므로, `tailwind.config.ts` 예시 코드 1블록이 있으면 실수 방지. 현재는 주의사항 텍스트만 있음 (line 1687).
2. **[D4 실행가능성]** `--radius-sm: 4px`의 TW4 기본값(2px) 오버라이드 방법 미명시 — `@theme` 디렉티브 내 `--radius-sm: 4px` 설정인지, CSS override인지 명확화 필요.
3. **[D6 리스크]** Noto Serif KR 폰트 번들 크기 리스크 미언급 — CJK 글리프 세트는 보통 2-4MB. self-hosted시 초기 로딩 영향. `font-display: swap` 전략 명시 권장.
4. **[D5 일관성]** Breakpoint 테이블에서 `sm` 레이블이 "Mobile (< 640px)"에 사용됨 — TW4의 `sm` breakpoint는 640px(min-width)이므로 혼동 가능. "base" 또는 "xs"로 명명하면 TW4 컨벤션과 정합.

---

## 특기 사항 (Strengths)

- **D3 정확성 10점**: Phase 3 Design Tokens 45개+ 값 전수 대조 — 오차 0건. 이 수준의 정확도는 드물다.
- **60-30-10 감정 매핑**: 단순 색상 비율이 아닌, Step 4 감정 여정(Authority → Curiosity → Calm)과 직접 연결한 해석이 탁월.
- **CVD 3중 보완 전략**: red-on-olive 배지의 2.67:1 한계를 형태+텍스트+링으로 보완 — 색상 비의존성 원칙의 모범적 적용.
- **Success≈Accent 혼동 규칙**: 1.14:1 상호 대비 문제를 아이콘/텍스트 필수 동반 규칙으로 해결 — 실전에서 빠지기 쉬운 함정을 선제 차단.

---

## Cross-talk 요약

- 이슈 #1, #2는 D4(실행가능성) 관련으로 다른 Critic도 검증 요청
- 이슈 #4 breakpoint 네이밍은 DX(개발자 경험) 관점이므로 중요도 낮음 — 기능 구현에 영향 없음
