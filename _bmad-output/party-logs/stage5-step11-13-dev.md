# Critic-A (Developer) Review — Steps 11-13: Component Strategy + UX Patterns + Responsive & A11y

**Reviewer:** Amelia (Dev Agent) — Architecture + API weights
**File:** `_bmad-output/planning-artifacts/ux-design-specification.md` lines 2294–2997
**Source verification:** Cross-referenced against Step 8 App Shell Dimensions, Step 8 Color System (WCAG table), Step 8 Text Colors, Phase 3 Design Tokens, Step 10 Journey Flows

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 9/10 | CC-1~CC-7 각각 기술 스택, 상태 테이블, ASCII anatomy 다이어그램 포함. 버튼 계층 5단계×4사이즈×6상태 모두 Tailwind 클래스와 px값 명시. 파일 트리 구조 구체적. 로딩 임계값 200ms/2s/10s, 스켈레톤 shimmer 0.8s 주기, 토스트 스택 최대 3개 등 수치 풍부. CC-5/CC-6이 다른 CC 대비 상대적 얇음. |
| D2 완전성 | 9/10 | Radix 커버리지 분석 + 7개 커스텀 컴포넌트 + 구현 로드맵. UX 패턴: 버튼/피드백/폼/네비/모달/빈상태/로딩/검색필터 전수 커버. 반응형: 4-breakpoint 디바이스별 적응 상세. 접근성: 색상대비/키보드/스크린리더/색상비의존/모션/테스트 전략. 미비: React Error Boundary 크래시 복구 패턴 없음, Undo 범위 CC-별 정의 없음. |
| D3 정확성 | **7/10** | **팩트 오류 2건:** (1) Step 13 line 2884: `semantic-error on cream = 7.02:1` — Step 8 검증값은 **4.56:1** (7.02:1은 accent-hover의 값). (2) Step 13 line 2882: `sage accent on cream = 4.83:1` — Step 8 검증값은 **5.35:1** (4.83:1은 secondary text의 값). **WCAG 위반 1건:** Step 12 line 2661: 폼 입력 default border = `border-primary` (#e5e1d3, 1.23:1) — Step 8이 "모든 인터랙티브 폼 컨트롤에 `border-input` (#908a78, 3.25:1) 필수"라고 명시적으로 금지한 것을 위반. 기술 스택(PixiJS 8, Radix, cmdk)은 정확. |
| D4 실행가능성 | 9/10 | 파일 트리 + shadcn init 명령 + Layer 0 체크리스트 5단계 = 즉시 착수 가능. 토큰 적용 CSS 예시, 로딩 임계값 규칙, 유효성 검사 타이밍(실시간/blur/제출) 명확. 버튼 크기별 touch target 계산 포함. |
| D5 일관성 | **6/10** | **주요 불일치 4건 (전부 Step 8 App Shell/Color 기준 위반):** 하단 상세 참조. |
| D6 리스크 | 8/10 | CC-1 성능 예산 (50 agents, 30fps, ≤200MB). axe-core CI 게이트 + Lighthouse ≥90. 로딩 임계값 단계적 에스컬레이션. container query "검토" 표기 (실험적 기능 인지). 미비: React Flow 번들 크기(~300KB), cmdk 번들 영향 미언급. |

---

## 가중 평균: 7.95/10 ✅ PASS (Grade A 미달 — 8.0 필요)

**계산:**
- D1 (15%): 9 × 0.15 = 1.35
- D2 (15%): 9 × 0.15 = 1.35
- D3 (25%): 7 × 0.25 = 1.75
- D4 (20%): 9 × 0.20 = 1.80
- D5 (15%): 6 × 0.15 = 0.90
- D6 (10%): 8 × 0.10 = 0.80
- **Total = 7.95**

---

## 이슈 목록

### 블로커 (Grade A 달성 필수 수정)

#### 1. [D5 일관성] 사이드바 너비 280px→240px 불일치

| 위치 | 값 |
|------|-----|
| **Step 8** line 1681: `--sidebar-width` | **280px** ("한국어 텍스트 수용 +20%") |
| Step 12 line 2712: CEO 사이드바 | **240px** |
| Step 13 line 2821: Desktop 레이아웃 | **240px** |

280px은 한국어 텍스트 길이를 수용하기 위한 의도적 결정. 240px으로 변경하면 사이드바 텍스트 잘림 발생 위험.

**수정:** Step 12/13을 280px로 통일, 또는 240px이 의도적이면 Step 8 역수정 + 한국어 텍스트 잘림 테스트 필수.

#### 2. [D5 일관성] 사이드바 축소 64px→56px 불일치

| 위치 | 값 |
|------|-----|
| **Step 8** line 1682: `--sidebar-collapsed` | **64px** ("8px × 8 = 64px") |
| Step 12 line 2713: Tablet 축소 | **56px** |
| Step 13 line 2823: Tablet 축소 | **56px** |

64px은 8px 그리드 정합(8×8). 56px은 8px 그리드(8×7)이기는 하나, 22px padding + 20px icon = 62px 이므로 64px이 더 정확.

**수정:** 64px로 통일.

#### 3. [D3 정확성] 폼 입력 default border WCAG 위반

Step 12 line 2661: 입력 필드 default 상태 border = `border-primary` (#e5e1d3, **1.23:1**)

Step 8 line 1493-1495: **"모든 인터랙티브 폼 컨트롤 경계에는 반드시 `--border-input` (#908a78, 3.25:1)을 사용한다."**

이것은 WCAG 1.4.11 위반이며, Step 8이 이 정확한 시나리오를 금지하고 있음.

**수정:** `border-primary` → `border-input` (#908a78, 3.25:1).

#### 4. [D3 정확성] WCAG 대비 비율 오기 2건

| Step 13 기재값 | Step 8 검증값 | 올바른 출처 |
|---------------|-------------|------------|
| `semantic-error on cream = 7.02:1` (line 2884) | **4.56:1** (line 1778) | 7.02:1은 `accent-hover` (#4e5a2b)의 값 |
| `sage accent on cream = 4.83:1` (line 2882) | **5.35:1** (line 1509) | 4.83:1은 `text-secondary` (#6b705c)의 값 |

**수정:** Step 8 WCAG 테이블의 검증된 값으로 교체.

### 비블로커

#### 5. [D5 일관성] Primary 버튼 텍스트 색상 cream vs white

Step 12 line 2574: Primary 버튼 텍스트 = `text-bg-primary` (**cream #faf8f5**)
Step 8 line 1536: `--text-on-accent` = **#ffffff** (white)

차이는 미미하나(cream ≈ white), Step 8에서 검증된 5.68:1 대비는 `#ffffff` 기준. `#faf8f5`는 미검증. 토큰 `--text-on-accent`를 사용해야 일관성 확보.

#### 6. [D5 일관성] 포커스 링 색상 olive vs sage

Step 13 line 2906: "2px cream gap + 2px **olive (#283618)** outline"
Step 8 line 1790: Cream 배경 포커스 링 = "2px solid **#606C38** (5.35:1)"

Olive #283618은 sidebar 배경색이며 포커스 링 용도가 아님. Sage #606C38이 Step 8에서 정의된 포커스 링 색상.

#### 7. [D1 구체성] CC-5 StreamingMessage, CC-6 WorkflowPipelineView 상대적 얇음

CC-1/CC-2/CC-3/CC-4는 각각 상태 테이블, anatomy 다이어그램, 인터랙션 상세 포함. CC-5/CC-6은 Content+States만 1-2줄씩으로 동등 수준의 상세함 부족. Performance budget, interaction 패턴 추가 권장.

---

## 특기 사항 (Strengths)

- **Radix 갭 분석**: ~65% Radix 커버, ~35% 커스텀 — 정량적 커버리지 분석이 우수. 각 갭에 "Radix로 해결 불가한 이유" 명시.
- **Implementation Roadmap**: Layer 0 → Sprint 1-4로 컴포넌트 도입 순서가 여정 의존성과 정합. Pre-Sprint ≤3일 목표 현실적.
- **로딩 임계값 계단**: 200ms/2s/10s 3단계 에스컬레이션 — 사용자 인지심리학 기반 설계. "200ms 미만 = 로딩 표시 없음" 규칙 특히 좋음.
- **파괴적 액션 확인**: 이름 입력 확인(에이전트/부서 삭제) + 단순 확인(토글) + Ctrl+Z(비파괴 액션) 3단계 분리가 정교.
- **Testing CI 게이트**: axe-core critical 0건 + Lighthouse ≥90 + wcag-contrast-checker — 자동화된 접근성 품질 보증.

---

## Cross-talk 요약

- 블로커 #1, #2 (sidebar 280→240, 64→56)는 Step 8 토큰 정의와 직접 충돌 — Writer가 어느 값을 정본으로 선택할지 결정 필요. 280/64가 8px 그리드 + 한국어 텍스트 근거로 더 강함.
- 블로커 #3 (input border WCAG)는 **자동 불합격 조건 #3 (빌드 깨짐에 준하는 접근성 위반)**에 해당할 수 있음. Step 8에서 명시적으로 금지한 패턴을 Step 12에서 기본값으로 지정 — 반드시 수정.
- 블로커 #4 (대비 비율 오기)는 D3 팩트 오류로 Step 8 검증 테이블 값으로 단순 교체.
- 다른 Critic에게: sidebar 너비 변경은 Step 7 EM 시나리오의 레이아웃 계산에도 영향. Product Critic 확인 요청.
