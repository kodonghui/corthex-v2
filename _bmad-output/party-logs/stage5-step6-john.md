# Critic-C (Product + Delivery) Review — Step 6: Design System Foundation

**Reviewer:** John (PM)
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 752-980)
**Date:** 2026-03-23
**Grade Target:** A (avg >= 8.0)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 8/10 | hex 색상 전체 매핑, WCAG 대비비 8쌍 수치, 8px 그리드 토큰 5단계, 타입 스케일 Major Third 9단계 (12-48px), 모션 토큰 4종 (100/200/300/2000ms), 터치 타겟 44/36px, 컴포넌트 파일 경로+디렉토리 구조, 7 레이아웃 타입+CSS 패턴. 감점: 차트 hex 미제공 ("4 hue family" 서술만), 반응형 브레이크포인트 토큰화 누락 (Step 3에서 640/1024/1440 정의했으나 Design System에 토큰 미등록). |
| D2 완전성 | 20% | 8/10 | Step 파일 요구 4섹션 (Choice, Rationale, Implementation, Customization) 전부 커버. 색상 60-30-10, 타이포, 간격, 모션, 접근성 9개 영역, 7 레이아웃, 단일 테마 전략, 다크 모드 계획까지. 누락: (1) z-index 스케일 없음 (사이드바 오버레이, 모달, 토스트, 툴팁 간 우선순위), (2) shadow/elevation 토큰 없음, (3) border-radius 체계 없음, (4) 차트 색상 hex 값 미정의 (CVD-safe 언급만). |
| D3 정확성 | 15% | 5/10 | ⚠️ **3건 팩트 허위 + 2건 수치 오류**: (1) Line 785 "v2에서 Radix 일부 사용 중 (Dialog, Dropdown)" — **완전 허위**. `@radix-ui`는 어떤 package.json에도 없고 소스코드 import도 0건. bun.lock에 transitive dep으로 존재하나 이는 @subframe/core 내부 의존성이지 "v2에서 사용 중"이 아님. (2) Line 768 "Recharts — 기존 v2 사용 중" — **허위**. recharts는 어떤 package.json에도 없음. v2 차트는 Subframe 내장 컴포넌트 (AreaChart.tsx, BarChart.tsx). (3) Line 853 "Subframe UI 컴포넌트 36개" — **오류**. 실제 44개. (4) Line 853 "~290 usages" — **오류**. 실제 190건 across 35 files. (5) Lines 816-822 "Design Tokens §1.2" 참조 — phase-3-design-system/design-tokens.md는 구 다크 테마 팔레트 (slate-950, cyan-400) 포함. #faf8f5/#283618/#606C38 Natural Organic 값과 불일치. |
| D4 실행가능성 | 15% | 7/10 | 토큰 테이블 → @theme 직접 매핑 가능. 컴포넌트 계층 (primitives/composed/layout) 구체적 파일명. 마이그레이션 3단계 전략. 금지 조합 3건 명시. 감점: (1) Radix가 "이미 사용 중"이라는 전제 위에 구축 — 실제로는 **신규 도입**이므로 설치 목록, 학습 곡선, 번들 추가량 필요, (2) Recharts도 신규 설치 필요한데 기존 사용 전제, (3) packages/ui 플랫 → 3-tier 재구성 마이그레이션 경로 미정의. |
| D5 일관성 | 10% | 6/10 | hex 색상 (#faf8f5, #283618, #606C38) = Step 2/3 정합 ✅, 사이드바 280px/Topbar 56px = Step 3 정합 ✅, Lucide React = 전체 문서 일관 ✅, 단일 테마 = DC-6 "5테마→1테마" 정합 ✅. 불일치: (1) "v2에서 Radix 사용 중" — 코드베이스와 모순, (2) "Recharts 기존 사용 중" — 코드베이스와 모순, (3) "Design Tokens §1.2" 참조 = 구 팔레트 파일 (slate-950/cyan) 참조 — 현재 Natural Organic 값과 내용 불일치, (4) Architecture.md에 Radix/shadcn/Tailwind v4 언급 0건 — UX spec이 아키텍처 문서와 독립적으로 기술 선택. |
| D6 리스크 | 20% | 7/10 | Subframe→Radix 3단계 마이그레이션, 공존 규칙 ("Subframe에 corthex-* 직접 적용 금지"), WCAG 금지 조합 3건, CVD-safe 차트, Windows High Contrast fallback, prefers-reduced-motion 필수, 단일 테마로 428곳 color-mix 복잡도 제거. 누락: (1) Radix **신규 도입** 리스크 미평가 — 번들 크기 추가, 학습 곡선, 1인 개발자 부담, (2) Subframe 44개(36개 아님) 마이그레이션 범위 과소평가, (3) Subframe+Radix CSS 우선순위 충돌 가능성 미언급, (4) Recharts 신규 도입 리스크 미평가. |

---

## 가중 평균: 7.00/10 ✅ PASS (borderline) — ❌ Grade A FAIL (8.0 미달)

계산: (8×0.20) + (8×0.20) + (5×0.15) + (7×0.15) + (6×0.10) + (7×0.20) = 1.60 + 1.60 + 0.75 + 1.05 + 0.60 + 1.40 = **7.00**

> ⚠️ 7.0 통과 기준에 정확히 걸침. Grade A (8.0) 미달 — **D3 정확성이 핵심 원인**. 3건의 코드베이스 허위 주장이 디자인 시스템 선택 근거, 마이그레이션 범위, 스프린트 계획 전체에 영향.

---

## 이슈 목록 (우선순위순)

### 1. **[D3 정확성] "v2에서 Radix 일부 사용 중 (Dialog, Dropdown)" — 사실과 다름** — Priority MUST-FIX

Line 785 Rationale 테이블: "v2에서 Radix 일부 사용 중 (Dialog, Dropdown)"

**검증 결과:**
- `@radix-ui` → 모든 package.json 0건
- `packages/app/src/ui/components/Dialog.tsx` → `import * as SubframeCore from "@subframe/core"` (Subframe 컴포넌트)
- bun.lock에 @radix-ui 패키지 존재하나 = @subframe/core의 **내부 의존성** (transitive dep). v2 코드가 직접 import하지 않음.

**PM 영향**: 이 주장은 Radix 선택의 "연속성" 근거로 사용됨. 실제로는 **신규 의존성 도입**이며, 이에 따라:
- Sprint 계획에 Radix 학습 시간 포함 필요
- 번들 크기 증가분 산정 필요
- Pre-Sprint 설치 + 검증 단계 추가 필요

**권장 수정**: Line 785 "v2에서 Radix 일부 사용 중" → "v2 미사용 — Subframe UI 사용 중 (`@subframe/core ^1.154.0`, 44개 컴포넌트). v3에서 Radix 신규 도입하여 점진 교체." Rationale에 "Subframe이 내부적으로 Radix 사용 → Radix API 패턴이 유사하여 전환 용이" 추가하면 근거 보완 가능.

### 2. **[D3 정확성] "Recharts — 기존 v2 사용 중" — 사실과 다름** — Priority MUST-FIX

Line 768: `기존 v2 사용 중`

**검증 결과:**
- `recharts` → 모든 package.json 0건
- v2 차트 = Subframe 내장 컴포넌트 (`packages/app/src/ui/components/AreaChart.tsx`, `BarChart.tsx`)

**PM 영향**: v3에서 Recharts 사용 시 = 신규 의존성 추가. 스프린트 계획에 반영 필요.

**권장 수정**: "기존 v2 사용 중" → "v3 신규 도입 (v2는 Subframe 내장 차트 사용). `recharts` 패키지 설치 + Subframe 차트 → Recharts 교체는 Sprint 1~2에서 해당 페이지 리빌드 시 수행."

### 3. **[D3 정확성] Subframe 컴포넌트 수 36개 → 44개** — Priority MUST-FIX

Line 853: "Subframe UI 컴포넌트 36개"

**검증**: `ls packages/app/src/ui/components/ | wc -l` = **44**. brand-/neutral- 토큰 사용량도 ~290이 아니라 **190건 across 35 files**.

**PM 영향**: 마이그레이션 범위 22% 과소평가. Post-v3 Subframe 전수 교체 일정에 직접 영향.

**권장 수정**: "36개" → "44개", "~290 usages" → "~190 usages across 35 files"

### 4. **[D5 일관성] "Design Tokens §1.2" 참조 — 구 팔레트 파일과 불일치** — Priority HIGH

Lines 816-822의 토큰 테이블이 "Design Tokens §1.2"를 출처로 명시. 그러나 `_uxui_redesign/phase-3-design-system/design-tokens.md`는 구 다크 테마 팔레트 (slate-950, cyan-400)를 담고 있으며, #faf8f5/#283618/#606C38 Natural Organic 값이 아님.

**PM 영향**: 개발자가 "Design Tokens §1.2" 찾아가면 다른 색상 발견 → 혼란. 권위 있는 색상 출처가 어디인지 불명확.

**권장 수정**: 출처를 "UX Design Specification §Customization Strategy" (본 문서 자체)로 변경하거나, Phase 3 design-tokens.md를 Natural Organic 값으로 업데이트 후 참조. 또는 "v3 목표 값 — Phase 3 design-tokens.md는 v2 기준이며 Layer 0-B에서 아래 값으로 교체 예정" 주석 추가.

### 5. **[D2 완전성] z-index / shadow / border-radius 토큰 체계 누락** — Priority MEDIUM

디자인 시스템에서 색상, 타이포, 간격, 모션은 체계적으로 정의했으나:
- **z-index**: 사이드바 오버레이 (모바일), 모달 (Dialog), 토스트, 툴팁, 드롭다운 간 레이어 순서 미정의
- **shadow/elevation**: 카드, 모달, 드롭다운의 깊이감 토큰 없음
- **border-radius**: 카드, 버튼, 인풋 등의 둥글기 체계 없음

**PM 영향**: 개발자마다 다른 값 사용 → 시각적 불일치. 특히 z-index 충돌은 런타임 버그 유발.

**권장 수정**: Customization Strategy에 3개 토큰 카테고리 추가:
```
z-index: base(0) → dropdown(10) → sticky(20) → modal(30) → toast(40) → tooltip(50)
shadow: sm(카드) → md(드롭다운) → lg(모달) → xl(시트)
radius: sm(4px 인풋/배지) → md(8px 카드/버튼) → lg(16px 모달/시트) → full(9999px 아바타)
```

### 6. **[D6 리스크] Radix 신규 도입 리스크 미평가** — Priority MEDIUM

Radix를 "이미 사용 중"으로 간주하여 도입 리스크가 평가에서 완전히 빠짐. 실제로:
- 번들 크기: Radix 8개 패키지 설치 시 예상 추가량?
- 1인 개발자 학습 곡선: Subframe → Radix API 전환 시간
- Pre-Sprint prerequisite: 설치 + 기본 설정 + 동작 확인

**권장 수정**: Migration Strategy에 "Phase 0: Radix 패키지 설치 및 검증" 단계 추가. 필요 패키지 목록: `@radix-ui/react-dialog`, `react-dropdown-menu`, `react-tabs`, `react-select`, `react-slider`, `react-toast`, `react-tooltip`, `react-slot` + `class-variance-authority` (cva). Subframe이 내부적으로 Radix 사용하므로 API 유사성으로 학습 곡선 완화 가능함을 명시.

---

## Cross-talk 요약

- **Dev 대상**: Radix transitive dep 확인 (bun.lock에 @radix-ui 존재 = @subframe/core 내부). Direct usage는 0건 — 동의 요청.
- **Winston (Arch) 대상**: Architecture.md에 Radix/shadcn/Tailwind v4 언급 0건. UX spec의 기술 선택이 아키텍처에 반영 필요한지 확인.
- **Quinn (QA) 대상**: z-index/shadow/radius 토큰 체계 누락 동의 요청. 테스트 스펙에 영향.

---

## 총평

Step 6 Design System Foundation은 **구조적으로 매우 강함**. Radix + Tailwind v4 + shadcn/ui 패턴 선택 자체는 합리적이고, 60-30-10 색상 전략, 8px 그리드, 체계적 접근성 매트릭스, 7개 레이아웃 타입 정의는 탁월하다. 단일 테마 전략 (5→1)도 올바른 판단.

**그러나 D3 정확성이 치명적.** "v2에서 Radix 사용 중"과 "Recharts 기존 사용 중"은 코드베이스 검증으로 명확히 반증되는 **허위 주장**이며, 이것이 디자인 시스템 선택 근거와 마이그레이션 전략의 전제를 흔든다. Subframe 컴포넌트 수도 22% 과소평가. PM 관점에서 가장 위험한 것은 — 이 오류들이 스프린트 계획의 입력값이 된다는 점이다. "이미 사용 중인 Radix를 확장"하는 것과 "Radix를 신규 도입"하는 것은 effort estimate가 근본적으로 다르다.

수정은 비교적 간단하다: (1) Radix/Recharts를 "신규 도입"으로 정정하고 도입 리스크+설치 단계 추가, (2) Subframe 수치 교정, (3) Design Tokens 출처 명확화. 이 3건이 해결되면 Grade A 도달 가능한 기반은 갖추고 있다.

---

## R2 Re-score (Post-Fixes)

**11 fixes applied** (fixes log: `_bmad-output/party-logs/stage5-step06-fixes.md`)

### John 이슈 해결 확인

| # | 이슈 | 상태 | 확인 위치 |
|---|------|------|----------|
| 1 | "v2에서 Radix 사용 중" 허위 주장 | ✅ 해결 | L785 "v2 미사용 — v3 신규 도입" + L794-817 신규 도입 전제 사항 (8패키지 목록, Architecture Decision, React 19 검증, Subframe 대안) |
| 2 | "Recharts 기존 v2 사용 중" 허위 주장 | ✅ 해결 | L768 "v2: Subframe 내장... v3: Recharts 도입 또는 Subframe 리스타일 유지" — 2가지 경로 명시 |
| 3 | Subframe 36개 → 44개 + ~290 usages | ⚠️ 부분 해결 | L878 "44개" ✅. "~290 usages" 잔여 (실제 ~190) — 사소하지만 부정확 |
| 4 | "Design Tokens §1.2" 구 팔레트 참조 | ⚠️ 간접 해결 | §1.2 참조 자체는 미수정. 그러나 L882에 시맨틱 색상 old→new 매핑 5개 명시 → 마이그레이션 경로 명확화로 혼란 완화 |
| 5 | z-index/shadow/border-radius 토큰 누락 | ❌ 미적용 | 변경 없음. deferred 목록에도 미포함 |
| 6 | Radix 신규 도입 리스크 미평가 | ✅ 해결 | L810-817 "아키텍처 의사결정 필요" — D-number 등록, React 19 호환성, Subframe 리스타일 대안. "최종 결정은 Pre-Sprint Architecture Review에서 확정" — 현실적 리스크 관리. 탁월. |

### 타 Critic 수정 중 Product 관점 검증

- **accent-hover WCAG 이중 표기**: ✅ L910 "7.44:1 (white-on) / 7.02:1 (on cream)". 두 컨텍스트 모두 명시 — WCAG 검증 테이블 신뢰도 회복.
- **content-max 1440px zero padding 문제**: ✅ L991. xl=1440px 뷰포트에서 max-width 1440px = 사이드 패딩 0px 문제 인식. 1280px 대안 + Pre-Sprint 확정 필요 명시. PM 관점에서 이것은 **실사용 시 체감 품질에 직결** — 발견해준 dev에게 감사.
- **시맨틱 색상 5개 Pre-Sprint 마이그레이션**: ✅ L882. success/warning/error/info/handoff 전부 old→new hex 값 나열. Sprint 0 작업 목록으로 즉시 사용 가능.
- **@fontsource 정정**: ✅ L767. "v2: CSS font-family 선언만. v3: @fontsource 설치하여 self-hosted 전환" — v2↔v3 상태 구분 명확.
- **Lucide "pinned version, no ^"**: ✅ L766. 수정됨.
- **Architecture Decision 필요**: ✅ L810-814. Radix = architecture.md 미등록 의존성 인정 + D-number 등록 + React 19 호환성 검증 + Subframe 리스타일 대안. PM 강력 동의 — 이것은 Pre-Sprint 게이트 사항이며, sally가 UX spec에서 이를 명시한 것은 제품 성숙도의 증거.
- **Subframe 리스타일 대안**: ✅ L815. "Subframe 프리미티브를 유지하면서 corthex-* 토큰으로 리스타일... Radix 도입보다 변경 범위가 작고 동일한 시각적 결과 달성 가능". 2가지 실행 경로를 열어둔 것은 PM 관점에서 매우 현명 — Sprint 0 시점에서 리스크 대비 effort를 비교 결정 가능.

### R2 차원별 점수

| 차원 | 가중치 | R1 | R2 | 변동 근거 |
|------|--------|-----|-----|----------|
| D1 구체성 | 20% | 8 | **9** | Radix 8패키지 구체적 목록, 시맨틱 색상 5개 old→new hex, content-max 1440 vs 1280 대안 수치, accent-hover 이중 표기. |
| D2 완전성 | 20% | 8 | **8** | z-index/shadow/radius 여전히 누락. 다만 Radix 도입 전제사항, 시맨틱 마이그레이션, content-max 논의가 다른 gap 보완. 유지. |
| D3 정확성 | 15% | 5 | **8** | 팩트 허위 3건 전부 해소 (Radix/Recharts/Subframe수). @fontsource/Lucide 정정. 잔여: "~290 usages" (실제 ~190), "Design Tokens §1.2" 참조 미수정 — 사소. |
| D4 실행가능성 | 15% | 7 | **9** | Radix 8패키지 목록 = 즉시 설치 가능. Architecture Decision 프로세스 명시. Subframe 대안 = 2가지 실행 경로. 시맨틱 old→new = Pre-Sprint 즉시 적용. |
| D5 일관성 | 10% | 6 | **8** | Radix/Recharts/@fontsource = 코드베이스 정합 회복. Architecture.md 미등록 = 명시적 인정 + D-number 필요. 시맨틱 색상 old↔new 양쪽 명시. |
| D6 리스크 | 20% | 7 | **8** | Radix 신규 도입 = Architecture Decision + React 19 검증 + Subframe 대안. content-max zero padding 인식. "Pre-Sprint Architecture Review에서 확정" = 현실적 게이트. z-index/shadow 누락 잔여. |

### R2 가중 평균: 8.35/10 ✅ PASS + ✅ Grade A

계산: (9×0.20) + (8×0.20) + (8×0.15) + (9×0.15) + (8×0.10) + (8×0.20) = 1.80 + 1.60 + 1.20 + 1.35 + 0.80 + 1.60 = **8.35**

### R2 총평

R1 대비 **+1.35점 상승** (7.00 → 8.35). D3(정확성) +3점이 최대 기여 — 팩트 허위 3건 전부 해소.

11건 수정 중 특히 **"v3 신규 도입 전제 사항" 섹션** (L794-817)이 가장 인상적. 단순한 팩트 오류 수정을 넘어:
- 8개 패키지 설치 목록 구체화
- Architecture Decision 등록 프로세스 명시
- React 19 호환성 검증 요구
- **Subframe 리스타일 대안**이라는 리스크 낮은 2번째 경로 제시
- "최종 결정은 Pre-Sprint Architecture Review에서 확정"이라는 현실적 의사결정 게이트 설정

이것은 PM이 보고 싶은 수준의 기술 의사결정 성숙도다. "Radix가 정답"이라고 단정하지 않고, "Radix 권장하되 Subframe 대안도 수용 가능, Pre-Sprint에서 최종 결정"이라는 **열린 아키텍처** 접근.

잔여 gap (z-index/shadow/radius 토큰, ~290 usages 수치, Design Tokens §1.2 참조)은 Grade A 등급 내에서 수용 가능한 수준. Step 7 이후에서 보완 가능.
