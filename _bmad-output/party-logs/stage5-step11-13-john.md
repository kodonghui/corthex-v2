# Critic-C (PM) Review — Steps 11-13: Component Strategy + UX Patterns + Responsive/A11y

**Reviewer:** John (Product Manager)
**Date:** 2026-03-23
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` (lines 2291–2997)
**References verified:** Step 8 tokens (lines 1436-1855), Step 10 journeys, Phase 3 design-tokens.md, architecture.md

---

## Step 11: Component Strategy (lines 2294-2563)

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | CC-1 OfficeCanvas: 5-state 스프라이트 파일명(idle_sit.png 등), 퍼포먼스 예산(50 에이전트/30fps/≤200MB). CC-3 BigFiveSliderGroup: ASCII 와이어프레임, OCEAN 프리셋 값(O=30 C=80). 갭 분석 8개 항목 전부 여정 참조(JF-1~JF-6) 연결. 소스 구조 파일 경로 명확. |
| D2 완전성 | 8/10 | Radix 커버리지(~65%) + 커스텀 갭(~35%) 분석 완비. CC-1~CC-7 전부 Purpose/Tech/Content/States/Accessibility 5요소 구비. Layer 0 + Sprint 1-4 로드맵. **감점:** CC-5 StreamingMessage 퍼포먼스 예산 없음(1000+ 토큰 렌더링 시?). CC-2 NexusCanvas 노드 수 한계 미정의. Storybook "선택"이 아닌 필수로 권장. |
| D3 정확성 | 9/10 | PixiJS 8 + @pixi/react, React Flow v12("v2에서 이미 사용 중"), Tanstack Table, cmdk — 모두 정확. 색상 토큰(--semantic-error #DC2626, --status-working #606C38 등) Step 8과 일치. packages/ui/src/ 모노레포 구조 정합. |
| D4 실행가능성 | 7/10 | 소스 구조 복붙 가능. CSS 토큰 적용 코드 스니펫. ASCII 와이어프레임(CC-3, CC-4). Layer 0 6단계 체크리스트. **감점:** 컴포넌트 Props 인터페이스(TypeScript) 미정의 — 개발자가 추론 필요. |
| D5 일관성 | 9/10 | Step 10 여정 참조(JF-1~JF-6) 정확. Sprint 맵핑 PRD 순서 일치. 색상/접근성 토큰 Step 8 정합. |
| D6 리스크 | 7/10 | CC-1 퍼포먼스 예산 + 뷰포트 렌더링 + 모바일 fallback. CC-5 에러 재시도. CC-6 빈 상태. **감점:** CC-2 퍼포먼스 한계 미정의. PixiJS+React Flow+cmdk 번들 사이즈 누적 영향 미언급. WebGL 미지원 브라우저 fallback 미정의. |

### 가중 평균: 7.90/10 ✅ PASS (Grade B)

| D1 | D2 | D3 | D4 | D5 | D6 | **합계** |
|----|----|----|----|----|----|----|
| 8×20%=1.60 | 8×20%=1.60 | 9×15%=1.35 | 7×15%=1.05 | 9×10%=0.90 | 7×20%=1.40 | **7.90** |

---

## Step 12: UX Consistency Patterns (lines 2566-2810)

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | 버튼 5계층 전부 Tailwind 클래스 명시. 4크기 px 높이 + 터치 타겟. 6상태 aria 속성 포함. 토스트 4유형 아이콘+색상+지속시간(2/3/4/5초). 파괴적 확인 ASCII 와이어프레임. 로딩 임계치(200ms/2s/10s). 스켈레톤 shimmer(0.8s, 구체 색상). Cmd+K 와이어프레임 + 검색 범위. |
| D2 완전성 | 8/10 | 버튼/토스트/인라인/파괴적확인/폼/네비게이션/모달/빈상태/로딩/검색/필터 — 포괄적. CEO+Admin 사이드바 모두 Lucide 아이콘 매핑. 5 모달 유형. **감점:** 테이블 인터랙션 패턴(정렬/페이지네이션/가상스크롤) 미흡 — 필터 섹션에서만 간략 언급. 데이터 시각화 인터랙션(차트 호버/클릭) 미정의. |
| D3 정확성 | **6/10** | **3건 수치 불일치 발견:** (1) 사이드바 너비 "240px" (L2712, L2821) — Step 8 `--sidebar-width: 280px` (L1681). (2) 사이드바 축소 "56px" (L2713) — Step 8 `--sidebar-collapsed: 64px` (L1682). (3) 폼 입력 기본 보더 `border-primary` #e5e1d3 (L2661) — Step 8은 인터랙티브 폼 컨트롤에 `--border-input` #908a78 필수 (L1495, WCAG 1.4.11 3.25:1). **border-primary(1.23:1)를 입력 기본 보더로 사용하면 WCAG 1.4.11 위반.** |
| D4 실행가능성 | 8/10 | Tailwind 클래스 직접 사용 가능. ASCII 와이어프레임 2개. 로딩 임계치 규칙 즉시 구현 가능. 유효성 검사 타이밍 3단계(실시간/blur/제출) 명확. |
| D5 일관성 | **5/10** | **Step 8과 3건 불일치:** (1) 사이드바 280→240, (2) 축소 64→56, (3) 폼 보더 토큰 위반. 나머지 토스트 색상, 아이콘, 접근성 패턴은 정합. 불일치가 핵심 레이아웃 치수 + WCAG 규칙에 해당하므로 심각. |
| D6 리스크 | 7/10 | 파괴적 확인(이름 입력), Ctrl+Z 5개 undo, 토스트 3개 스택 제한, 필터 URL 지속성. **감점:** Cmd+K 모바일 접근성(물리 키보드 없음) 미고려. |

### 가중 평균: 7.10/10 ✅ PASS (Grade B) — 경고 수준

| D1 | D2 | D3 | D4 | D5 | D6 | **합계** |
|----|----|----|----|----|----|----|
| 9×20%=1.80 | 8×20%=1.60 | 6×15%=0.90 | 8×15%=1.20 | 5×10%=0.50 | 7×20%=1.40 | **7.40** |

> **⚠️ D5=5 경고:** 자동 불합격 임계치(3점)는 넘지만, 핵심 레이아웃 치수(사이드바)와 WCAG 규칙이 자체 Step 8과 충돌하므로 **수정 강력 권장**.

---

## Step 13: Responsive Design & Accessibility (lines 2813-2997)

### 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 4-tier 디바이스 지원 매트릭스 (Full/Full/Core/Essential). Device-specific 변경 목록 구체적 (사이드바→탭바, 테이블→카드, PixiJS→리스트). CSS @theme 코드 스니펫. 키보드 7패턴 구체 키 매핑. ARIA 8패턴 role/속성 명시. 테스트 CI 기준(axe 0 critical, Lighthouse ≥90). |
| D2 완전성 | 8/10 | 반응형: 4 breakpoint + device 적응 + 개발 규칙. 접근성: 색상/키보드/스크린리더/색상비의존/모션/테스팅(자동+수동). 구현 가이드라인 responsive+a11y 각 5-6 규칙. **감점:** i18n 고려 미흡(lang 태그 외). 프린트 스타일시트 미언급. |
| D3 정확성 | **6/10** | **2건 수치 오류:** (1) L2882 "sage accent on cream 4.83:1" — Step 8 검증값은 `--accent-primary` #606C38 on cream = **5.35:1** (4.83은 `--text-secondary` 값). (2) L2884 "semantic-error on cream 7.02:1" — Step 8 검증값은 `--semantic-error` #dc2626 on cream = **4.56:1** (7.02는 `--accent-hover` 값). **Step 12에서 이어진 사이드바 240px도 반복** (L2821-2822). |
| D4 실행가능성 | 8/10 | CSS 스니펫 2개(breakpoints, reduced-motion). 테스트 도구+기준 즉시 CI 설정 가능. 개발 규칙 6항목 명확. 수동 테스트 체크리스트 5항목 빈도 포함. |
| D5 일관성 | **5/10** | Step 12와 동일 사이드바 불일치(240 vs 280). **WCAG 대비 비율 2건이 Step 8 검증 테이블과 불일치** — 접근성 섹션에서 자체 Step 8 수치를 잘못 인용하는 것은 신뢰 손상. Breakpoint CSS는 Step 8과 정합. Motion CSS는 Step 8과 정합. |
| D6 리스크 | 7/10 | axe-core CI 차단 + Lighthouse 기준. 저사양 기기 테스트(Moto G4). VoiceOver 수동 테스트. 색각 시뮬레이션. **감점:** PWA/오프라인 미고려. aria-live 폴링 성능 예산 미정의. |

### 가중 평균: 7.20/10 ✅ PASS (Grade B)

| D1 | D2 | D3 | D4 | D5 | D6 | **합계** |
|----|----|----|----|----|----|----|
| 8×20%=1.60 | 8×20%=1.60 | 6×15%=0.90 | 8×15%=1.20 | 5×10%=0.50 | 7×20%=1.40 | **7.20** |

---

## 자동 불합격 조건 검토

| 조건 | 결과 |
|------|------|
| 할루시네이션 | **CLEAR** — 모든 참조 기술/라이브러리 실존. 수치 불일치는 할루시네이션이 아닌 인용 오류. |
| 보안 구멍 | **CLEAR** |
| 빌드 깨짐 | **CLEAR** |
| 데이터 손실 위험 | **CLEAR** |
| 아키텍처 위반 | **CLEAR** |

---

## 종합 이슈 목록

### 🔴 수정 필요 (Step 8 불일치 — 빌드 시 혼란 유발)

| # | 위치 | 이슈 | Step 8 정확값 | 현재 잘못된 값 |
|---|------|------|-------------|-------------|
| 1 | L2712, L2821-22 | **사이드바 너비** | `--sidebar-width: 280px` (L1681) | 240px |
| 2 | L2713 | **사이드바 축소** | `--sidebar-collapsed: 64px` (L1682) | 56px |
| 3 | L2661 | **폼 입력 기본 보더** | `--border-input` #908a78 (3.25:1, WCAG 1.4.11) (L1493-1495) | `border-primary` #e5e1d3 (1.23:1) — **WCAG 위반** |
| 4 | L2882 | **sage accent 대비** | 5.35:1 (`--accent-primary` #606C38 on cream) | 4.83:1 (이것은 `--text-secondary` 값) |
| 5 | L2884 | **semantic-error 대비** | 4.56:1 (`--semantic-error` #dc2626 on cream) | 7.02:1 (이것은 `--accent-hover` 값) |

> **이슈 #3이 가장 심각:** Step 8은 "모든 인터랙티브 폼 컨트롤 경계에는 반드시 `--border-input` (#908a78, 3.25:1)을 사용"(L1495)이라고 명시적으로 규정. Step 12 폼 패턴이 이를 무시하면 구현 시 WCAG 1.4.11 위반 발생.

### 🟡 개선 권장 (Nice-to-have)

1. **[Step 11, D6]** CC-2 NexusCanvas 퍼포먼스 한계 — React Flow 노드 최대 수(50? 100?) + 성능 저하 임계점 명시.
2. **[Step 11, D6]** 번들 사이즈 누적 — PixiJS 8(~200KB) + React Flow(~150KB) + cmdk(~30KB) = ~380KB 추가. 초기 로드 영향 분석.
3. **[Step 11, D2]** CC-5 StreamingMessage 퍼포먼스 — 장문 응답(5000+ 토큰) 렌더링 시 DOM 노드 증가 대응 (가상화? 청크 렌더링?).
4. **[Step 12, D2]** 테이블 인터랙션 상세 — 정렬/페이지네이션/가상스크롤/행 선택/컬럼 리사이즈 패턴 보강.
5. **[Step 12, D6]** Cmd+K 모바일 대안 — 물리 키보드 없는 모바일에서 검색 접근 방법 (검색 아이콘 탭? 상단 검색바?).
6. **[Step 13, D2]** i18n 혼합 언어 표시 규칙 — KR/EN 혼합 텍스트 타이포 처리(fallback chain은 Step 8에 있으나, 줄바꿈/정렬 규칙 미정의).

---

## 종합 평가

| Step | 점수 | 등급 | 핵심 강점 | 핵심 약점 |
|------|------|------|----------|----------|
| **11** | 7.90 | B ✅ | 갭 분석 체계적, CC-1 OfficeCanvas 퍼포먼스 예산 구체적, Sprint 로드맵 PRD 정합 | CC-2/CC-5 퍼포먼스 한계 미정의, 번들 사이즈 누적 리스크 |
| **12** | 7.40 | B ✅ | 버튼/토스트/폼/모달 패턴 매우 구체적, 파괴적 확인 와이어프레임, 로딩 임계치 | **사이드바 280→240, 축소 64→56, 폼 보더 WCAG 위반** |
| **13** | 7.20 | B ✅ | 4-tier 디바이스 전략 명확, 테스트 CI 기준 구체적, 구현 규칙 실용적 | **WCAG 대비 비율 2건 오인용, 사이드바 불일치 반복** |

**PM 총평:** 3개 Step 모두 Grade B 통과. Step 11의 컴포넌트 전략은 견고하다. Step 12-13의 **패턴 자체는 우수**하지만, Step 8에서 검증한 수치를 잘못 인용하는 문제가 반복된다. 특히 **이슈 #3(폼 보더 WCAG 위반)**은 구현에 직접 영향을 미치므로 수정 권장. 나머지 이슈는 수치 교정으로 해결 가능하며, 패턴 설계의 방향성과 구체성은 높이 평가한다.
