# Critic-A (Architecture + API) Review — Steps 11-13 (R1)

**Reviewer:** Winston (Architect)
**Date:** 2026-03-23
**Artifact:** `_bmad-output/planning-artifacts/ux-design-specification.md` (Lines 2294–2996)
**Verification:** Cross-checked against Phase 3 Design Tokens (§1.2–§3.1), Step 8 Visual Foundation (L1434–1854), Architecture doc, PRD Sprint roadmap

---

## Step 11: Component Strategy (Lines 2294–2563)

### 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | **9/10** | Gap analysis 8항목 구체적 Radix/커스텀 분류. CC-1~7 각각 Purpose/기술스택/Content/States/Accessibility/Interaction 구조. 파일 트리 (packages/ui/src/) 경로 명시. Sprint 로드맵 Layer 0~Sprint 4 의존 관계. Layer 0 상세 6단계 (shadcn init 명령 포함). |
| D2 완전성 | 15% | **9/10** | Radix coverage ~65% + gap ~35% 분석. JF-1~6 전부 커스텀 컴포넌트로 매핑. 구현 전략 4원칙 (하드코딩 금지/Radix 우선/소스 소유/tree-shaking). Sprint 로드맵. 감점: 컴포넌트 단위 테스트 전략 미언급 (Storybook은 "선택"으로 표기). |
| D3 정확성 | **25%** | **8/10** | React Flow v12 ✓, PixiJS 8 + @pixi/react ✓, Radix 프리미티브 카테고리 정확 (Dialog/Slider/Select/Toast 등). Tanstack Table ✓. react-markdown + remark-gfm ✓. cmdk ✓. shadcn@latest init ✓. 감점: CC-1 (OfficeCanvas)를 packages/ui/custom/에 배치 — PixiJS 의존성은 CEO앱 전용이므로 packages/app/에 위치하는 것이 아키텍처적으로 더 적합. CC-6(WorkflowPipelineView)도 Admin앱 전용. 공유 UI 패키지에 앱 전용 컴포넌트를 넣으면 번들 오염 발생 가능. |
| D4 실행가능성 | **20%** | **9/10** | CC-3 BigFive ASCII 와이어프레임 복붙 수준. CC-4 HandoffTracker ASCII 와이어프레임. 파일 구조 즉시 생성 가능. Token 적용 CSS 예시 코드. Sprint별 의존 관계 명확. |
| D5 일관성 | 15% | **8/10** | CC-1~7이 JF-1~6과 정확히 매핑. 토큰명이 Phase 3과 일치. Sprint 번호가 PRD와 정합. CC-3 OCEAN 프리셋 값 (O=30 C=80 등)이 JF-4와 일치. 감점: CC-1 PixiJS 성능 예산 "50 에이전트 30fps"는 Step 8 breakpoint에서 lg=30fps/xl=60fps를 참조하나 여기서 구분 없이 "Desktop 30fps"로 축약. |
| D6 리스크 | 10% | **7/10** | CC-1 성능 예산 (50에이전트/30fps/200MB). Tree-shaking 규칙. 뷰포트 밖 스프라이트 비활성화. 감점: PixiJS 번들 200KB gzipped 한도(DO-1) 미재언급. React Flow v12 번들 크기 미언급. 앱 전용 컴포넌트가 공유 UI 패키지에 있을 때의 tree-shaking 리스크 미식별. |

### 가중 평균: 8.40/10 ✅ PASS (Grade A)

```
(9×0.15) + (9×0.15) + (8×0.25) + (9×0.20) + (8×0.15) + (7×0.10)
= 1.35 + 1.35 + 2.00 + 1.80 + 1.20 + 0.70 = 8.40
```

### 이슈 목록

**Minor:**
1. **[D3]** CC-1(OfficeCanvas), CC-2(NexusCanvas), CC-6(WorkflowPipelineView)은 앱 전용 컴포넌트 — `packages/ui/custom/`이 아닌 각 앱(packages/app/, packages/admin/) 내부에 배치 권장. 공유 UI 패키지에는 범용 컴포넌트만 포함해야 번들 오염 방지.
2. **[D6]** PixiJS 번들 200KB gzipped 한도(DO-1, L216) 미재언급 — CC-1에 명시적 예산 추가 권장.
3. **[D2]** 컴포넌트 단위 테스트 전략 (Vitest + Testing Library 등) 미언급 — Step 13 Testing Strategy와 연결 필요.

---

## Step 12: UX Consistency Patterns (Lines 2566–2810)

### 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | **9/10** | 버튼 5레벨×4크기×6상태 Tailwind 클래스 포함. 토스트 4유형 아이콘/배경/지속시간/ARIA. 파괴적 확인 ASCII 와이어프레임 + 이름 입력 규칙. 검색 cmdk 와이어프레임. 스켈레톤 shimmer 색상+주기 (0.8s). 로딩 타이밍 4단계 (200ms/2s/10s). 매우 구체적. |
| D2 완전성 | 15% | **9/10** | Buttons, Toast, Inline feedback, Destructive confirmation, Forms (states/validation/layout), Navigation (CEO+Admin 사이드바), Modals (5유형), Empty states (4유형), Loading (5유형+타이밍), Search (global+table). 포괄적. 감점: 페이지네이션/무한 스크롤 패턴 미정의 — 에이전트 50+, 워크플로우 이력 등 긴 목록 처리 미명시. |
| D3 정확성 | **25%** | **6/10** | **CRITICAL — Form input default border WCAG 위반**: L2661 `border-primary` (#e5e1d3, 1.23:1)을 입력 필드 기본 보더로 사용. Step 8 (L1493-1495)에서 명시적으로 금지: "border-primary는 장식 디바이더 전용. 모든 인터랙티브 폼 컨트롤에는 border-input (#908a78, 3.25:1) 사용 필수." **WCAG 1.4.11 위반이 UX 패턴에 인코딩됨.** 추가: 버튼 텍스트 `text-bg-primary` (L2574) — Step 8은 accent 위 텍스트를 `text-on-accent` (#ffffff)로 정의. cream(#faf8f5) vs white(#ffffff)는 다른 색상이며 토큰명 불일치. 나머지 (토스트, 네비, 모달, 검색 등)는 정확. |
| D4 실행가능성 | **20%** | **9/10** | Tailwind 클래스 예시 전 버튼 변형. CSS variable 참조. 타이밍 값. ASCII 와이어프레임. 사이드바 그룹+아이콘 매핑 (Lucide 컴포넌트명 포함). 즉시 구현 가능 수준. |
| D5 일관성 | 15% | **7/10** | Form border 규칙이 Step 8과 직접 충돌 (위 D3 참조). 버튼 토큰명 불일치. 나머지: 토스트 타이밍이 JF 패턴과 일치, 네비 그룹이 FR-UX1 참조, 키보드 패턴이 Step 8과 일치. L2577 Destructive 버튼 `bg-semantic-error text-bg-primary` — cream text on red bg의 대비는 검증되어 있지 않음 (Step 8는 red text on cream만 검증). |
| D6 리스크 | 10% | **8/10** | 로딩 타이밍 4단계. 토스트 스택 한도 3개. 파괴적 이름 입력 확인. Undo 5회. 감점: WCAG 위반 패턴이 그대로 구현되면 접근성 audit 실패 리스크. |

### 가중 평균: 7.85/10 ✅ PASS (Grade A 미달)

```
(9×0.15) + (9×0.15) + (6×0.25) + (9×0.20) + (7×0.15) + (8×0.10)
= 1.35 + 1.35 + 1.50 + 1.80 + 1.05 + 0.80 = 7.85
```

### 이슈 목록

**Major:**
1. **[D3/D5 CRITICAL] Form input border WCAG 1.4.11 위반**
   - L2661: input default border = `border-primary` (#e5e1d3, **1.23:1**)
   - Step 8 L1493-1495: "border-primary는 장식 전용. 인터랙티브 폼은 반드시 `border-input` (#908a78, **3.25:1**)"
   - **수정**: L2661 `border-primary` → `border-input` (#908a78)로 교체
   - 이 수정만으로 D3 +1, D5 +1 → 8.25+ 도달 가능

**Minor:**
2. **[D3/D5]** 버튼 Primary 텍스트 토큰 — `text-bg-primary` (#faf8f5 cream)이 아닌 `text-on-accent` (#ffffff white) 사용해야 Step 8과 정합. 대비 차이 소량 (5.35:1 vs 5.68:1)이나 토큰 참조가 불일치.
3. **[D3]** Destructive 버튼 cream-on-red 대비 미검증 — Step 8에서 `#dc2626` on cream = 4.56:1만 검증, 역(cream on red)은 미검증. 추가 검증 또는 white-on-red (#ffffff on #dc2626) 사용 권장.
4. **[D2]** 페이지네이션/무한 스크롤 패턴 미정의 — 50+ 에이전트, 워크플로우 이력 등 장기 목록 처리 전략 필요.

---

## Step 13: Responsive Design & Accessibility (Lines 2813–2996)

### 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | **8/10** | Tailwind v4 `@theme` CSS 스니펫 (Step 8에서 부재했던 것 — 여기서 제공). 키보드 단축키 7패턴. ARIA 8영역 매핑. 테스트 도구 3종 + CI 기준. 수동 테스트 5항목 + 빈도. 구현 규칙 11항. 감점: 접근성 대비 요약 테이블이 5항목으로 축약 — Step 8의 16항목에 비해 정보 손실. |
| D2 완전성 | 15% | **9/10** | 반응형 (4 breakpoint, 디바이스별 적응, CSS 코드), 접근성 (색상 대비, 키보드, 스크린리더, 색상 독립, 모션), 테스트 (자동+수동), 구현 가이드라인 (반응형 5규칙 + 접근성 6규칙). 한국 장차법 언급. Skip link. `<html lang="ko">` + `lang="en"`. 포괄적. |
| D3 정확성 | **25%** | **6/10** | **4건 오류**: (1) L2882 "sage accent on cream = 4.83:1" — 실제 `--accent-primary` (#606C38) on cream = **5.35:1**. 4.83:1은 `--text-secondary` (#6b705c). (2) L2884 "semantic-error on cream = 7.02:1" — 실제 `--semantic-error` (#dc2626) on cream = **4.56:1**. 7.02:1은 `--accent-hover` (#4e5a2b). (3) **사이드바 너비 240px** (L2712/2821/2822/2829) — Step 8 `--sidebar-width: 280px` (L1681). 5곳 모두 틀림. 280px는 한국어 텍스트 수용 근거(+20%)가 있는 의도적 결정. (4) L2906 포커스 링 "2px olive (#283618)" — Step 8 L1817 "2px solid #606C38 (sage)". olive→sage 색상 오류. **양호한 부분**: Tailwind @theme 스니펫 정확, breakpoint 4값 정확 (sm/md/lg/xl), prefers-reduced-motion CSS 정확, ARIA 패턴 정확, 테스트 도구 (axe-core/Playwright/Lighthouse) 실재. |
| D4 실행가능성 | **20%** | **9/10** | Tailwind v4 @theme 스니펫 — Step 8에서 누락됐던 핵심 config 코드. ARIA 매핑 테이블 컴포넌트별 즉시 적용. CI 기준 (critical/serious 0건, ≥90점) 파이프라인 설정 가능. 구현 규칙 11항 개발자 핸드북 수준. |
| D5 일관성 | 15% | **6/10** | **Cross-step 수치 충돌 3건**: 사이드바 240 vs 280, 대비 요약 2건, 포커스 링 색상. 이는 Step 8이 "Visual Foundation"으로 canonical인데 Step 13이 다른 값을 사용하는 것. 양호: breakpoint 4값 일치, motion CSS 일치, 한국 장차법 언급은 PRD NFR 정합. |
| D6 리스크 | 10% | **8/10** | 테스트 전략 3-tier (axe-core CI + Playwright PR + Lighthouse 배포). 수동 테스트 Sprint 주기. 저사양 기기 (Moto G4) 벤치마크. 감점: Lighthouse <90점 시 배포 차단 여부 미명시. |

### 가중 평균: 7.55/10 ✅ PASS (Grade A 미달)

```
(8×0.15) + (9×0.15) + (6×0.25) + (9×0.20) + (6×0.15) + (8×0.10)
= 1.20 + 1.35 + 1.50 + 1.80 + 0.90 + 0.80 = 7.55
```

### 이슈 목록

**Major:**
1. **[D3/D5] 사이드바 너비 240px → 280px 통일 필요**
   - L2712, L2821, L2822, L2829, L2713: 모두 "240px"
   - Step 8 L1681: `--sidebar-width: 280px` (한국어 텍스트 수용 +20% 근거)
   - L870, L991도 280px — 5곳 대 5곳이지만 토큰 정의가 280px.
   - **5곳 모두 280px로 수정 필요.**

2. **[D3] 대비 요약 테이블 수치 오류 2건**
   - L2882: "sage accent = 4.83:1" → **5.35:1** (accent-primary #606C38 on cream)
   - L2884: "semantic-error = 7.02:1" → **4.56:1** (semantic-error #dc2626 on cream)
   - Step 8 전수검증 값과 불일치. 요약 테이블은 Step 8의 정확한 값을 인용해야 함.

3. **[D3/D5] 포커스 링 색상 오류**
   - L2906: "2px olive (**#283618**) outline"
   - Step 8 L1817: "2px solid **#606C38** (sage)"
   - olive (#283618)는 사이드바 배경색이지 포커스 링 색상이 아님. sage (#606C38)로 수정 필요.

**Minor:**
4. **[D1]** 대비 요약 테이블 5항목은 Step 8의 16항목에 비해 부족 — 최소한 input border (3.25:1), text-on-accent (5.68:1), chrome text (6.63:1) 추가 권장.
5. **[D6]** Lighthouse Accessibility <90점 시 대응 전략 미명시 — 배포 차단? 경고만?

---

## 종합 점수 요약

| Step | 내용 | 점수 | 판정 |
|------|------|------|------|
| Step 11 | Component Strategy | **8.40/10** | ✅ PASS (Grade A) |
| Step 12 | UX Consistency Patterns | **7.85/10** | ✅ PASS (Grade A 미달 — Major 1건 수정 시 8.0+) |
| Step 13 | Responsive & Accessibility | **7.55/10** | ✅ PASS (Grade A 미달 — Major 3건 수정 시 8.0+) |

## 자동 불합격 체크 (3 Steps 공통)

| 조건 | 결과 |
|------|------|
| 할루시네이션 | **CLEAR** — 모든 라이브러리/패키지 실재 |
| 보안 구멍 | **CLEAR** |
| 빌드 깨짐 | **CLEAR** |
| 데이터 손실 위험 | **CLEAR** |
| 아키텍처 위반 | **CLEAR** |

---

## Cross-step 종합 패턴

Steps 11-13에서 공통적으로 나타나는 문제:

1. **Step 8 canonical 값과의 drift**: Step 8에서 정밀하게 정의한 값(280px, #606C38 포커스 링, border-input #908a78, 대비 비율)이 후속 Step에서 다른 값으로 기재됨. Step 8을 "single source of truth"로 참조하되, 후속 Step 작성 시 Step 8 값을 직접 복사하는 체계가 필요.

2. **요약 테이블의 정확성**: 상세 스펙을 요약할 때 수치가 변경되는 패턴 — 대비 4.83→5.35, 7.02→4.56, 너비 280→240. 요약 테이블은 반드시 원본 값을 인용해야 하며, 기억에 의존하면 안 됨.

3. **강점**: Step 11의 컴포넌트 전략은 Gap analysis + 커스텀 CC 7종 + Sprint 로드맵으로 아키텍처-구현 간 브리지 역할 우수. Step 12의 버튼/토스트/폼/모달/빈상태/로딩 패턴은 디자인 시스템 핸드북 수준. Step 13의 Tailwind v4 @theme 스니펫은 Step 8의 누락 갭을 메움.
