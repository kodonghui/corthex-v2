---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인 v7. Pro Max(디자인 데이터) + LibreUIUX(디자인 원칙) + Subframe(컴포넌트) + BMAD(파티모드 QA). 3-Phase: Diagnose → Redesign → Verify. Usage: /kdh-uxui-pipeline [status|diagnose PAGE|redesign PAGE|verify PAGE|batch PRIORITY|phase0|phase1|phase3|final]'
---

# CORTHEX UXUI Refactoring Pipeline v7

**Pro Max + LibreUIUX + Subframe + BMAD 통합.**
4개 도구가 각자 역할을 나눠 **레이아웃부터 바꾸는 진짜 리디자인**을 수행한다.

### 도구 역할 분담

| 도구 | 역할 | 비유 |
|------|------|------|
| **Pro Max** | 디자인 데이터 (색상, 폰트, 스타일, UX 규칙) | 설계 도면집 |
| **LibreUIUX** | 디자인 원칙 + 품질 감사 (7차원 분석, 접근성, 반응형) | 감리관 |
| **Subframe** | 실시간 프리뷰 + 컴포넌트 라이브러리 (44개 컴포넌트) | 모델하우스 + 자재 창고 |
| **BMAD Party Mode** | 3라운드 자기 리뷰 (7명 전문가 역할극) | 품질 검사관 |

### 절대 교훈 (3번 실패에서 배운 것)

```
"리디자인" = 레이아웃/구조 자체를 바꿔야 한다.
색상/border만 바꾸면 → 사용자 거부 → FAIL.
dashboard.tsx만 성공한 이유: gradient cards, charts, donut, progress bars로 구조 자체를 바꿨기 때문.
```

---

## Mode Selection

| 명령 | 설명 |
|------|------|
| `status` 또는 인자 없음 | 진행 상황 + 다음 작업 안내 |
| `diagnose PAGE` | Phase 1: 페이지 현재 상태 7차원 진단 + 디자인 데이터 수집 |
| `preview PAGE` | Phase 2A: Subframe에서 디자인 → 브라우저에서 실시간 프리뷰 확인 |
| `redesign PAGE` | Phase 2B: 프리뷰 확정 후 실제 코드에 적용 |
| `verify PAGE` | Phase 3: 파티모드 3라운드 + 재감사 + 반응형/접근성 체크 |
| `batch PRIORITY` | 해당 우선순위 전체 자동 (diagnose → preview → redesign → verify) |
| `phase0` | Playwright 환경 세팅 (1회) |
| `phase1` | 현재 기능 스모크 테스트 |
| `phase3` | 시각 회귀 기준 등록 |
| `final` | 최종 전체 검증 |

---

## 4-Phase 워크플로우

```
[Phase 1: DIAGNOSE] 현재 상태 진단
  → Pro Max: 디자인 시스템 데이터 로드 (MASTER.md + 페이지 오버라이드)
  → /libre-ui-review: 7차원 점수 (1~10) + ELEVATE/REFINE/REBUILD 판정
  → 출력: 진단 리포트 + 개선 우선순위

[Phase 2A: PREVIEW] Subframe 실시간 프리뷰 ★ NEW
  → /subframe:design 으로 Subframe 웹사이트에 페이지 디자인 생성
  → 사용자가 브라우저(app.subframe.com)에서 실시간 확인
  → "이 부분 바꿔줘" → 수정 → 다시 확인 (반복)
  → 사용자가 "이거 좋아!" 하면 다음 단계로
  → 코딩 전에 눈으로 먼저 보고 확정하는 단계

[Phase 2B: REDESIGN] 확정된 디자인을 실제 코드에 적용
  → /subframe:develop 로 Subframe 디자인을 코드로 변환
  → Pro Max: 색상/폰트/스타일/UX 규칙 참조
  → /libre-ui-synth: 디자인 원칙 (마스터리, 접근성, 성능) 적용
  → Worker: 비즈니스 로직 연결 (API 호출, 상태관리 등 기존 기능 유지)

[Phase 3: VERIFY] 품질 검증
  → BMAD 파티모드 3라운드 (Collaborative → Adversarial → Forensic)
  → /libre-ui-review: 재감사 (Phase 1 점수와 비교, 최소 +2점 상승 필수)
  → /libre-ui-critique: 8차원 디자인 피드백
  → /libre-ui-responsive: 반응형 체크 (375/768/1024/1440px)
  → /libre-a11y-audit: 접근성 감사 (WCAG, ARIA)
  → Playwright 테스트
```

### 왜 Preview 단계가 있나?

```
[이전 v6 — 3번 실패]
코드 수정 → 배포 → 사이트에서 확인 → "이거 뭐야?" → 다시 처음부터...

[v7 — Preview 추가]
Subframe에서 미리보기 → 브라우저에서 실시간 확인 → "이거 좋아!" → 그때 코딩
→ 코딩 전에 사용자가 직접 눈으로 확인하고 확정 → 재작업 방지
```

---

## 작업 환경

```
오케스트레이터 (메인 Claude Code)
  → 팀 생성, Worker 스폰, 스텝 지시, 커밋+푸시
  → 문서 작성/코딩 직접 안 함

Worker (tmux 안의 Claude Code)
  → 진단, 디자인, 코딩, 파티모드, 테스트 전부 수행
  → 사용자가 tmux에서 실시간 관찰 가능

테스트 대상: 배포 사이트 (https://corthex-hq.com)
```

---

## Single-Worker 패턴 (kdh-full-auto-pipeline 동일)

- **1인 Worker**: 작성 + 자기 리뷰 3라운드 + 수정 + 보고 = 데드락 0
- Worker는 tmux에서 실행 → 사용자가 실시간 관찰
- 오케스트레이터 ↔ Worker 핸드오프 최소 2회 (지시, 완료보고)
- 5페이지마다 Worker shutdown + 새 Worker 스폰 (컨텍스트 관리)

### 오케스트레이터가 하는 것

```
1. TeamCreate로 팀 생성
2. Worker 스폰 (첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지)
3. Worker 완료 보고 수신
4. 결과 검증 (파티 로그 존재, 점수 확인, +2점 상승 확인)
5. 타입 체크: npx tsc --noEmit -p packages/server/tsconfig.json
6. 커밋 + 푸시
7. 다음 페이지로 SendMessage (또는 shutdown + 새 Worker 스폰)
```

### 오케스트레이터가 하지 않는 것

```
- 진단/디자인/코딩 (Worker가 함)
- 파티모드 실행 (Worker가 자기 리뷰)
- PASS/FAIL 판정 (Worker가 자체 판정)
- 테스트 작성/실행 (Worker가 함)
```

---

## 디자인 참조 체계 (Worker가 반드시 읽는 것)

### 1단계: 디자인 시스템 (Pro Max 생성)

```
design-system/corthex/MASTER.md          ← 전역 디자인 규칙
design-system/corthex/pages/{page}.md    ← 페이지별 오버라이드 (있으면 우선)
```

**로드 로직:**
1. `design-system/corthex/pages/{page}.md` 확인
2. 있으면 → 페이지 오버라이드 우선, MASTER.md 보충
3. 없으면 → MASTER.md 단독 사용

### 2단계: Subframe 컴포넌트 (src/ui/)

```
packages/app/src/ui/
├── components/     ← 44개 프리빌트 컴포넌트
│   ├── Button.tsx, Badge.tsx, Card.tsx, Table.tsx...
│   ├── TextField.tsx, Select.tsx, Switch.tsx...
│   ├── Dialog.tsx, DropdownMenu.tsx, Tooltip.tsx...
│   └── ...
├── layouts/        ← 3개 레이아웃
├── theme.css       ← Subframe 테마 (Work Sans, brand colors, shadows, radii)
└── index.ts        ← 전체 export
```

**사용 규칙:**
- 새 컴포넌트를 만들기 전에 Subframe에 같은 것이 있는지 먼저 확인
- Subframe 컴포넌트는 `@/ui/components/Button` 형태로 import
- 테마 토큰은 theme.css에서 정의된 것 사용 (brand-*, neutral-*, error-*, success-*)

### 3단계: STYLE-GUIDE (종합 참고)

```
_uxui-refactoring/STYLE-GUIDE.md         ← 605줄 종합 디자인 시스템
```

- 6개 도메인 그라디언트 색상
- 4단계 표면 계층
- 14개 컴포넌트 패턴
- 4개 페이지 레이아웃 템플릿

### 4단계: 현재 코드 + 백엔드

```
packages/app/src/pages/{page}/           ← 현재 페이지 코드
packages/app/src/components/             ← 공유 컴포넌트
packages/server/src/routes/              ← API 엔드포인트
packages/server/src/db/schema.ts         ← DB 스키마
packages/shared/src/types.ts             ← 타입 정의
```

---

## Mode: diagnose PAGE (Phase 1 — 현재 상태 진단)

### Worker 스폰 프롬프트

```
You are a senior UXUI analyst for CORTHEX v2.
You diagnose the current state of a page using Pro Max design data + LibreUIUX 7-dimension analysis.
YOLO mode -- auto-proceed, never wait for user input.

## Your Task: Diagnose {페이지명} (page #{번호})

### Step 1: Load Design System References
1. Read design-system/corthex/MASTER.md (전역 디자인 규칙)
2. Read design-system/corthex/pages/{페이지명}.md (있으면 — 페이지 오버라이드)
3. Read _uxui-refactoring/STYLE-GUIDE.md (종합 가이드)
4. Read packages/app/src/ui/theme.css (Subframe 테마 토큰)

### Step 2: Analyze Current Page Code
1. Read ALL files in packages/app/src/pages/{페이지명}/ (모든 .tsx, .ts)
2. Read relevant packages/app/src/components/ (이 페이지가 쓰는 공유 컴포넌트)
3. Read relevant packages/server/src/routes/ (API 엔드포인트, 데이터 형태)
4. Map: 모든 표시 데이터, 사용자 액션, 상태 전환, API 호출

### Step 3: Pro Max Design Data Query
Run these commands to get design recommendations:

```bash
# 페이지에 맞는 디자인 데이터 조회
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --domain style -n 5
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --domain ux -n 5
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --domain chart -n 3
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "layout responsive" --stack react
```

### Step 4: LibreUIUX 7-Dimension Analysis
/libre-ui-review 의 프레임워크를 직접 적용하여 7차원 분석 수행:

1. **Archetypal Coherence** — 일관된 심리적 스토리를 전달하는가?
2. **Design Mastery** — 그리드, 타이포, 색상이론, 여백, 시각적 위계, 게슈탈트
3. **Accessibility** — WCAG AA, 키보드 네비게이션, ARIA, 색상 대비, 터치 타겟
4. **Security** — XSS, 입력 검증, 민감 데이터 노출
5. **Performance** — 번들 사이즈, 이미지 최적화, lazy loading, 코드 분할
6. **Code Quality** — 컴포넌트 구조, 타입 안전성, 에러 처리, 재사용성
7. **User Experience** — CTA 명확성, 네비게이션, 피드백, 로딩/에러/빈 상태, 반응형

각 차원 1~10점 채점 + 종합 판정 (ELEVATE/REFINE/REBUILD)

### Step 5: Write Diagnosis Report
Save to: _uxui-refactoring/diagnose/{번호}-{페이지명}.md

## Report Structure:

# {번호}. {페이지명} — Diagnosis Report

## Executive Summary
- Overall Score: X/10
- Verdict: ELEVATE / REFINE / REBUILD
- 7-dimension score table

## Current State Analysis
- 현재 레이아웃 구조 (ASCII diagram)
- 사용 중인 컴포넌트 목록
- 기능 목록 (API 호출, 상태관리)
- 현재 디자인의 문제점 (구체적: 어떤 클래스가 왜 문제인지)

## Design System Gap Analysis
- MASTER.md 대비 현재 코드의 괴리
- 페이지 오버라이드에서 지정한 것 vs 현재 구현
- Subframe 컴포넌트 중 활용 가능한 것 (현재 미사용)
- STYLE-GUIDE.md 위반 사항

## Pro Max Recommendations
- 추천 스타일 + 적용 방법
- 추천 UX 패턴 + 적용 방법
- 추천 차트 타입 (해당 시)

## 7-Dimension Detailed Scores
(각 차원별 구체적 발견 + 개선 방향)

## Redesign Priority List
| 순위 | 영역 | 현재 | 목표 | 변경 범위 |
|------|------|------|------|----------|
(레이아웃 변경이 필요한 것 최우선)

## Subframe Components to Use
| 컴포넌트 | 용도 | import 경로 |
|----------|------|-------------|

### Step 6: Report to Orchestrator
[Phase 1 Complete] diagnose-{번호}-{페이지명}
Overall score: X/10
Verdict: ELEVATE/REFINE/REBUILD
Key findings: (2~3줄)
Redesign priorities: (상위 3개)
```

---

## Mode: preview PAGE (Phase 2A — Subframe 실시간 프리뷰)

### 전제 조건
- `diagnose PAGE` 완료 (진단 리포트 존재)

### 이게 뭔가?

코딩하기 전에 **Subframe 웹사이트(app.subframe.com)에서 디자인을 먼저 만들어서 브라우저로 확인**하는 단계.
사용자가 직접 보고 "이거 좋아!" 해야 다음 단계(코딩)로 넘어간다.

### Worker 스폰 프롬프트

```
You are a senior UXUI designer for CORTHEX v2.
You create page designs in Subframe for real-time preview before coding.
YOLO mode -- auto-proceed, never wait for user input.

## Your Task: Create Subframe preview for {페이지명} (page #{번호})

### Step 1: Read References
1. Read _uxui-refactoring/diagnose/{번호}-{페이지명}.md (Phase 1 진단 결과)
2. Read design-system/corthex/MASTER.md (전역 디자인 규칙)
3. Read design-system/corthex/pages/{페이지명}.md (있으면 — 페이지 오버라이드)
4. Read _uxui-refactoring/STYLE-GUIDE.md (종합 가이드)
5. Read current page code (어떤 기능이 있는지 파악)

### Step 2: Design in Subframe
/subframe:design 스킬을 호출하여 Subframe에 페이지 디자인 생성.

디자인할 때 반드시 포함:
- Phase 1 진단에서 나온 개선 우선순위 반영
- MASTER.md의 색상/폰트/스타일 적용
- 레이아웃 구조를 현재와 다르게 (리디자인 핵심!)
- 현재 페이지의 모든 기능 요소 배치 (버튼, 테이블, 폼 등)
- 로딩/에러/빈 상태 디자인

디자인 요청 시 포함할 내용:
- 프로젝트: CORTHEX (AI 에이전트 기반 기업 운영 플랫폼)
- 스타일: 다크모드, 프로페셔널, Enterprise-grade (Linear/Vercel Dashboard 느낌)
- 색상: MASTER.md 참조 (Primary: #0369A1, Secondary: #0EA5E9, CTA: #22C55E 등)
- 레이아웃: Phase 1 진단의 redesign priority에 따라
- 컴포넌트: 기존 Subframe 컴포넌트(Button, Card, Table 등) 활용

### Step 3: Report to Orchestrator
[Phase 2A Complete] preview-{번호}-{페이지명}
Subframe page URL: (app.subframe.com 링크)
Design summary: (레이아웃 변경점 2~3줄)
User action needed: 브라우저에서 프리뷰 확인 후 "확정" 또는 "수정 요청"
```

### 사용자 확인 흐름

```
1. Worker가 Subframe에 디자인 생성 → URL 전달
2. 사용자가 브라우저(app.subframe.com)에서 확인
3. 경우의 수:
   a. "좋아!" → 오케스트레이터가 redesign 단계로 진행
   b. "이 부분 바꿔줘" → Worker에게 수정 지시 → 다시 Subframe에서 확인
   c. "전체적으로 별로" → 다시 디자인 (diagnose 결과 기반으로 다른 방향)
4. 사용자가 확정하면 → redesign PAGE 실행
```

### batch 모드에서의 preview

batch 모드에서는 preview를 자동 스킵하고 바로 redesign으로 갑니다.
사용자가 일일이 확인하기 어려우니까요. 개별 페이지(`preview PAGE`)에서만 사용.

---

## Mode: redesign PAGE (Phase 2B — 확정 디자인을 코드에 적용)

### 전제 조건
- `diagnose PAGE` 완료 (진단 리포트 존재)
- `preview PAGE` 완료 시: Subframe 디자인이 확정됨 → /subframe:develop 로 코드 변환
- `preview PAGE` 미완료 시: Worker가 직접 디자인 + 코딩 (기존 방식)

### Worker 스폰 프롬프트

```
You are a senior frontend developer AND UXUI designer for CORTHEX v2.
You REDESIGN pages — not just restyle. Layout structure MUST change.
YOLO mode -- auto-proceed, never wait for user input.

## CRITICAL RULE: LAYOUT MUST CHANGE
"리디자인" means the page layout/structure itself must be different.
If you only change colors/borders/fonts without changing layout → INSTANT FAIL.
Examples of REAL redesign:
  - Grid 구조 변경 (1-column → 2-column split, flat list → bento grid)
  - 새로운 시각화 추가 (chart, donut, progress bar, sparkline)
  - 카드 구조 변경 (flat → gradient cards with glow effects)
  - 정보 위계 재배치 (상단 KPI cards, 중앙 main content, 하단 activity)
  - 인터랙션 패턴 변경 (list → kanban, table → card grid)

## CRITICAL: 기능 로직 불변
- API 호출, 상태관리, 이벤트 핸들러 100% 유지
- UI/레이아웃/스타일/Tailwind 클래스만 변경
- 새 시각화 추가는 OK (기존 데이터를 새로운 방식으로 표현)

## CRITICAL: ALL DELIVERABLES MUST BE SPECIFIC AND DETAILED
추상적/모호한 표현 금지. hex/Tailwind/JSX 수준으로 구체적으로.

## Your References (MUST read before designing)

### Design System (Pro Max)
1. design-system/corthex/MASTER.md — 전역 규칙 (색상, 폰트, 스타일)
2. design-system/corthex/pages/{페이지명}.md — 페이지 오버라이드 (있으면 우선)

### Subframe Components (부품 창고)
3. packages/app/src/ui/components/ — 44개 프리빌트 컴포넌트
   - Button, Badge, IconButton, LinkButton
   - Card, Table, TextField, TextArea, Select, Switch, Checkbox, RadioGroup
   - Dialog, DropdownMenu, Tooltip, Tabs, Accordion
   - Avatar, ProgressBar, Loader, Calendar, FullCalendar
   - Alert, Toast, Breadcrumbs, Pagination
   - import: @/ui/components/{ComponentName}
4. packages/app/src/ui/theme.css — Subframe 테마 토큰

### Diagnosis Report (Phase 1 결과)
5. _uxui-refactoring/diagnose/{번호}-{페이지명}.md — 현재 상태 점수 + 개선 우선순위

### Style Guide + Current Code
6. _uxui-refactoring/STYLE-GUIDE.md — 종합 디자인 시스템 (605줄)
7. packages/app/src/pages/{페이지명}/ — 현재 페이지 코드
8. packages/app/src/components/ — 공유 컴포넌트
9. packages/server/src/routes/ — API 엔드포인트
10. packages/shared/src/types.ts — 타입 정의

### LibreUIUX Design Principles (/libre-ui-synth 프레임워크)
디자인 시 이 5단계 원칙을 내부적으로 적용:
- Phase 1 (Archetypal Foundation): 브랜드 심리학적 의미 — CORTHEX = Ruler+Magician (권위+혁신)
- Phase 2 (Design Mastery): 거장 원칙 적용 — Dieter Rams(less but better), Vignelli(grid), Bass(simplicity)
- Phase 3 (Technical Excellence): 접근성(ARIA, keyboard), 보안(XSS 방지), 성능(lazy load)
- Phase 4 (Quality Assurance): 컴포넌트 테스트, 접근성 테스트
- Phase 5 (Deployment Readiness): SEO, Core Web Vitals, 크로스브라우저

## Your Task: Redesign {페이지명} (page #{번호})

### Step 0: Check if Preview Exists
- If `preview PAGE` was done: Subframe 디자인이 확정됨
  → /subframe:develop 스킬 호출하여 Subframe 디자인을 코드로 변환
  → 변환된 코드에 비즈니스 로직(API, state, handlers) 연결
  → Step 2 (Design New Layout) 건너뛰고 바로 Step 3 (Implement)로
- If `preview PAGE` 안 했으면: Worker가 직접 디자인 + 코딩 (아래 Step 1~3)

### Step 1: Read ALL References
- Design system (MASTER.md + page override)
- Diagnosis report (scores, priorities, gaps)
- Current page code (ALL files)
- Subframe components (available inventory)
- Backend routes (data shapes)

### Step 2: Design New Layout
Write design spec to: _uxui-refactoring/redesign/{번호}-{페이지명}-spec.md

Include:
1. **New Layout Structure** (ASCII diagram — MUST be different from current)
   - Exact grid: `grid grid-cols-12 gap-6`, main=`col-span-8`, side=`col-span-4`
   - Container: `max-w-7xl mx-auto px-6 py-6`
2. **Component Breakdown** — 각 컴포넌트의 정확한 Tailwind 클래스 + JSX 구조
3. **Subframe Components Used** — 어떤 Subframe 컴포넌트를 어디에 쓰는지
4. **New Visualizations** — 추가할 차트, 그래프, 프로그레스바 등
5. **Responsive Behavior** — 375px, 768px, 1024px, 1440px 각각
6. **States** — Loading(skeleton), Error(alert), Empty(placeholder) 구체적 JSX
7. **data-testid Map** — 모든 인터랙티브 요소

### Step 3: Implement Code
- Design spec에 따라 코드 수정
- Subframe 컴포넌트 import하여 활용
- 기능 로직(API, state, handlers) 100% 유지
- 레이아웃 구조 자체를 변경 (색상만 바꾸면 FAIL)
- data-testid 전부 추가
- import 경로는 git ls-files 기준 대소문자 정확히 일치

### Step 4: Self-Check (코딩 완료 직후)
수정한 코드를 Read tool로 다시 읽고 체크:
- [ ] 레이아웃 구조가 이전과 확실히 다른가? (구조 변경 증거)
- [ ] Design spec의 Tailwind 클래스가 정확히 적용됐는가?
- [ ] 기능 로직(API, state, handlers)이 100% 유지됐는가?
- [ ] Subframe 컴포넌트를 최소 3개 이상 활용했는가?
- [ ] data-testid가 모두 추가됐는가?
- [ ] import 경로 대소문자가 정확한가?
하나라도 NO → 즉시 수정

### Step 5: Report to Orchestrator
[Phase 2 Complete] redesign-{번호}-{페이지명}
Layout changes: (구조 변경 요약 — 이전 vs 이후)
Subframe components used: (목록)
New visualizations: (추가된 것)
Design spec: _uxui-refactoring/redesign/{번호}-{페이지명}-spec.md
Changed files: (경로들)
```

---

## Mode: verify PAGE (Phase 3 — 품질 검증)

### 전제 조건
- `redesign PAGE` 완료 (코드 변경 + design spec 존재)

### Worker 스폰 프롬프트

```
You are a senior QA engineer AND UXUI auditor for CORTHEX v2.
You verify redesigned pages through BMAD party mode + LibreUIUX multi-audit.
YOLO mode -- auto-proceed, never wait for user input.

## CRITICAL: 비대화형 파티모드 (bmad-party-mode 스킬 호출 금지)
Worker인 네가 직접 7명 전문가 역할극을 수행한다.
Skill("bmad-party-mode") 호출하지 마라 — 대화형이라 멈춘다.

## Agent Manifest
| Agent | Name | Focus |
|-------|------|-------|
| PM | John | user value, requirements gaps, priorities |
| Architect | Winston | technical contradictions, feasibility, scalability |
| UX Designer | Sally | user experience, accessibility, flow |
| Developer | Amelia | implementation complexity, tech debt, testability |
| QA | Quinn | edge cases, test coverage, quality risks |
| Business Analyst | Mary | business value, market fit, ROI |
| Scrum Master | Bob | scope, dependencies, schedule risks |

## Your Task: Verify {페이지명} (page #{번호})

### Step 1: Read All Files
1. Read diagnosis report: _uxui-refactoring/diagnose/{번호}-{페이지명}.md (Phase 1 점수)
2. Read design spec: _uxui-refactoring/redesign/{번호}-{페이지명}-spec.md
3. Read ALL modified code files (Read tool — 기억으로 리뷰 절대 금지)
4. Read design-system/corthex/MASTER.md + pages/{페이지명}.md

### Step 2: BMAD 파티모드 3라운드

**Round 1 (Collaborative Lens):**
1. 수정된 코드 파일 전부를 Read tool로 읽기 (기억 금지)
2. 전문가 4~5명이 우호적 관점으로 리뷰 (인격 반영, 2~3문장 이상, 크로스톡 2회+)
3. **LAYOUT CHANGE VERIFICATION** (추가 체크):
   - [ ] 레이아웃 구조가 이전과 확실히 다른가?
   - [ ] 새로운 시각화(차트, 프로그레스바 등)가 추가됐는가?
   - [ ] Subframe 컴포넌트가 활용됐는가?
   - [ ] 색상만 바꾼 게 아닌가? (YES면 즉시 FAIL)
4. 최소 2개 이슈 (0개 = 재분석)
5. Write tool로 _uxui-refactoring/party-logs/{번호}-{페이지명}-round1.md 저장
6. Edit tool로 코드에서 이슈 수정

**Round 2 (Adversarial Lens):**
1. 수정된 코드 파일 전부를 Read tool로 다시 읽기
2. 전문가 전원(7명) 적대적 모드, 각자 최소 1개 새 관찰
3. ADVERSARIAL CHECKLIST:
   - [ ] Design spec 레이아웃과 코드가 정확히 일치?
   - [ ] Tailwind classes from spec applied correctly?
   - [ ] 기능 로직 100% 동일? (API calls, state, handlers)
   - [ ] data-testid 전부 추가? (spec의 testid map 대조)
   - [ ] Subframe 컴포넌트 정상 import + 렌더링?
   - [ ] 반응형 (375px, 768px, 1024px, 1440px에서 spec대로)?
   - [ ] 로딩/에러/빈 상태가 spec대로?
   - [ ] Design system (MASTER.md + page override) 준수?
   - [ ] import 경로 대소문자 일치?
   - [ ] 다른 페이지에 영향 없음?
4. Write tool로 _uxui-refactoring/party-logs/{번호}-{페이지명}-round2.md 저장
5. Edit tool로 코드에서 이슈 수정

**Round 3 (Forensic Lens):**
1. 최종 코드를 Read tool로 다시 읽기
2. Round 1+2 이슈 재평가 (과장 → 하향, 과소평가 → 상향)
3. 각 전문가 최종 평가 (2~3문장, 인격 반영)
4. 품질 점수 X/10 + PASS(7+) / FAIL(6-)
5. Write tool로 _uxui-refactoring/party-logs/{번호}-{페이지명}-round3.md 저장
6. FAIL → 코드 수정 후 3라운드 전체 재실행

### Step 3: LibreUIUX 재감사 (7차원)
/libre-ui-review 프레임워크를 직접 적용하여 재감사:
- 7차원 점수 다시 채점
- **Phase 1 점수 대비 최소 +2점 상승 필수** (미달 시 추가 수정)
- 결과를 _uxui-refactoring/verify/{번호}-{페이지명}-re-audit.md에 저장

### Step 4: LibreUIUX 추가 감사

**a) /libre-ui-critique 프레임워크 적용:**
- 8차원 디자인 피드백 생성
- 중요 이슈 있으면 코드 수정

**b) /libre-ui-responsive 프레임워크 적용:**
- 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop) 체크
- 가로 스크롤 없는지, 터치 타겟 44px+ 인지, 네비게이션 적절한지
- 이슈 있으면 코드 수정

**c) /libre-a11y-audit 프레임워크 적용:**
- WCAG AA 준수 (4.5:1 대비, ARIA, 키보드, 포커스)
- 이슈 있으면 코드 수정

### Step 5: Playwright 테스트 작성 + 실행

Save to: packages/e2e/src/tests/interaction/app/{페이지명}.spec.ts

- 페이지 로드 확인
- 주요 인터랙션 (클릭, 입력, 내비게이션)
- data-testid 존재 확인
- 반응형 테스트 (desktop + mobile viewport)

```bash
npx playwright test src/tests/interaction/app/{페이지명}.spec.ts
npx playwright test src/tests/smoke/ (회귀 확인)
```

실패 시 수정 후 재실행.

### Step 6: Report to Orchestrator
[Phase 3 Complete] verify-{번호}-{페이지명}
Party mode: 3 rounds PASS (issues fixed: N)
Quality score: X/10
Re-audit score: X/10 (Phase 1 대비 +N점)
Responsive: PASS/FAIL
Accessibility: PASS/FAIL
Playwright: N tests passed
Changed files: (경로들)
```

---

## Mode: batch PRIORITY (일괄 실행)

### 전체 흐름

```
오케스트레이터:
  1. 해당 우선순위 페이지 목록 추출
  2. TeamCreate로 팀 생성
  3. 페이지별 순차 실행:
     a. Worker 스폰 → diagnose (Phase 1)
     b. Worker에게 SendMessage → redesign (Phase 2)
     c. Worker에게 SendMessage → verify (Phase 3)
     d. Worker 완료 보고 → 오케스트레이터 검증
     e. 타입 체크: npx tsc --noEmit -p packages/server/tsconfig.json
     f. 커밋 + 푸시: feat(uxui): {페이지명} redesign — {변경요약}
     g. 배포 보고
  4. 5페이지마다 Worker shutdown + 새 Worker 스폰
  5. 모든 페이지 완료 → 스모크 테스트 전체 실행
  6. 사용자에게 완료 보고
```

### 페이지당 자동 흐름 (Worker 시점)

```
[diagnose] → 15분
  Read design system + current code + Pro Max query
  → 7-dimension analysis → score X/10 → REBUILD/REFINE/ELEVATE
  → Report

[redesign] → 30분
  Read diagnosis + design system + Subframe inventory
  → New layout design (ASCII diagram)
  → Code implementation (layout MUST change)
  → Self-check (6-point checklist)
  → Report

[verify] → 20분
  Party mode 3 rounds (Collaborative → Adversarial → Forensic)
  → Re-audit (7-dimension, +2점 상승 필수)
  → Design critique + responsive + accessibility
  → Playwright tests
  → Report
```

---

## Mode: phase0 (Playwright 환경 세팅)

```
1. packages/e2e/ 디렉토리 확인 (이미 있으면 스킵)
2. playwright.config.ts 생성 (baseURL: https://corthex-hq.com)
3. auth.setup.ts 생성
4. smoke 테스트 파일 생성
5. npx playwright install chromium
6. .env.test 확인
```

---

## Mode: phase1 (스모크 테스트)

```
1. npx playwright test src/tests/smoke/ 실행
2. 결과 파싱 (통과/실패 페이지 분류)
3. 요약 보고
```

---

## Mode: phase3 (시각 회귀 기준 등록)

```
1. visual regression 테스트 파일 생성
2. npx playwright test src/tests/visual/ --update-snapshots
3. 기준 스크린샷 생성
4. 커밋: test(visual): baseline screenshots for new UXUI
```

---

## Mode: final (최종 전체 검증)

```
1. npx playwright test src/tests/smoke/ (전 페이지 접근)
2. npx playwright test src/tests/interaction/ (기능 동작)
3. npx playwright test src/tests/visual/ (스크린샷 비교)
4. 결과 종합 리포트
5. 실패 항목 → Worker 스폰해서 수정
6. 전부 통과 → "UXUI 리팩토링 완료" 선언
```

---

## Mode: status (진행 상황)

```
1. _uxui-refactoring/ 폴더 구조 확인
2. diagnose/, redesign/, verify/, party-logs/ 존재 확인
3. 페이지별 진행 상태 테이블:
   | # | 페이지 | diagnose | redesign | verify | 점수변화 |
   |---|--------|----------|----------|--------|---------|
4. 다음 할 일 안내
```

---

## Party Log 형식

저장 경로: `_uxui-refactoring/party-logs/`

```
_uxui-refactoring/party-logs/
├── {번호}-{페이지명}-round1.md
├── {번호}-{페이지명}-round2.md
├── {번호}-{페이지명}-round3.md
...
```

### Round 1 Log:
```
## [Party Mode Round 1 -- Collaborative Review] {페이지명}

### Agent Discussion
(Natural conversation between experts. Each speaks in character, 2-3 sentences min.)

### Layout Change Verification
- [ ] Layout structure is different from before
- [ ] New visualizations added
- [ ] Subframe components utilized
- [ ] Not just color changes

### Issues Found
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|

### Fixes Applied
- (list)
```

### Round 2 Log:
```
## [Party Mode Round 2 -- Adversarial Review] {페이지명}

### Round 1 Fix Verification
| Issue # | Status | Detail |
|---------|--------|--------|

### Adversarial Agent Discussion
(Experts in cynical mode)

### Adversarial Checklist Results
- [ ] Design spec layout matched?
- [ ] Tailwind classes correct?
- [ ] Functionality 100% preserved?
- [ ] data-testid complete?
- [ ] Subframe components working?
- [ ] Responsive at all breakpoints?
- [ ] Loading/error/empty states correct?
- [ ] Design system compliance?
- [ ] Import paths case-correct?

### New Issues Found
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|

### Fixes Applied
- (list)
```

### Round 3 Log:
```
## [Party Mode Round 3 -- Final Judgment] {페이지명}

### Issue Calibration
| # | Original Severity | Calibrated | Reason |
|---|-------------------|------------|--------|

### Per-Agent Final Assessment
(Each expert: 2-3 sentences in character)

### Quality Score: X/10
Justification: (2-3 sentences)

### Final Verdict: PASS / FAIL
```

---

## 저장 위치

```
_uxui-refactoring/
├── diagnose/                    (Phase 1: 진단 리포트)
│   ├── 01-command-center.md
│   ├── 02-chat.md
│   ...
├── redesign/                    (Phase 2: 디자인 스펙)
│   ├── 01-command-center-spec.md
│   ├── 02-chat-spec.md
│   ...
├── verify/                      (Phase 3: 재감사 결과)
│   ├── 01-command-center-re-audit.md
│   ...
├── party-logs/                  (파티모드 리뷰 로그)
│   ├── 01-command-center-round1.md
│   ├── 01-command-center-round2.md
│   ├── 01-command-center-round3.md
│   ...
├── claude-prompts/              (v6 디자인 스펙 — 참고용 유지)
├── lovable-prompts/             (v5 기능 프롬프트 — 참고용 유지)
└── STYLE-GUIDE.md               (종합 디자인 시스템)

design-system/corthex/
├── MASTER.md                    (Pro Max 전역 디자인 규칙)
└── pages/                       (페이지별 오버라이드)
    ├── command-center.md
    ├── chat.md
    ├── trading.md
    ├── agora.md
    ├── nexus.md
    ├── agents.md
    ├── departments.md
    └── credentials.md
```

---

## 페이지 우선순위 + 번호 매핑

| # | 패키지 | 페이지명 | 경로 | 우선순위 |
|---|--------|---------|------|---------|
| 01 | app | command-center | /command-center | 1순위 |
| 02 | app | chat | /chat | 1순위 |
| 03 | app | dashboard | /dashboard | 1순위 (완료) |
| 04 | app | trading | /trading | 1순위 |
| 05 | app | agora | /agora | 1순위 |
| 06 | app | nexus | /nexus | 1순위 |
| 07 | admin | agents | /agents | 1순위 |
| 08 | admin | departments | /departments | 1순위 |
| 09 | admin | credentials | /credentials | 1순위 |
| 10 | app | sns | /sns | 2순위 |
| 11 | app | messenger | /messenger | 2순위 |
| 12 | app | ops-log | /ops-log | 2순위 |
| 13 | app | reports | /reports | 2순위 |
| 14 | app | jobs | /jobs | 2순위 |
| 15 | app | knowledge | /knowledge | 2순위 |
| 16 | app | files | /files | 2순위 |
| 17 | app | costs | /costs | 2순위 |
| 18 | app | activity-log | /activity-log | 2순위 |
| 19 | admin | workflows | /workflows | 2순위 |
| 20 | admin | tools | /tools | 2순위 |
| 21 | admin | users | /users | 2순위 |
| 22 | admin | employees | /employees | 2순위 |
| 23 | admin | monitoring | /monitoring | 2순위 |
| 24 | app | home | / | 3순위 |
| 25 | app | argos | /argos | 3순위 |
| 26 | app | classified | /classified | 3순위 |
| 27 | app | org | /org | 3순위 |
| 28 | app | cron | /cron | 3순위 |
| 29 | app | performance | /performance | 3순위 |
| 30 | app | notifications | /notifications | 3순위 |
| 31 | app | settings | /settings | 3순위 |
| 32 | admin | org-chart | /org-chart | 3순위 |
| 33 | admin | org-templates | /org-templates | 3순위 |
| 34 | admin | template-market | /template-market | 3순위 |
| 35 | admin | agent-marketplace | /agent-marketplace | 3순위 |
| 36 | admin | soul-templates | /soul-templates | 3순위 |
| 37 | admin | report-lines | /report-lines | 3순위 |
| 38 | admin | api-keys | /api-keys | 3순위 |
| 39 | admin | costs-admin | /costs | 3순위 |
| 40 | admin | companies | /companies | 3순위 |
| 41 | admin | settings-admin | /settings | 3순위 |
| 42 | admin | onboarding | /onboarding | 3순위 |

---

## Worker 스폰 규칙

```
1. 반드시 첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지
2. Worker에게 mode=bypassPermissions 부여
3. 5개 이상 페이지 처리하면 shutdown + 새 Worker 스폰 (컨텍스트 관리)
4. Worker가 멈추면 SendMessage로 리마인더
5. Worker가 FAIL 보고 → 자동 재시도 1회 → 2번째 FAIL → 오케스트레이터 개입
```

---

## 트러블슈팅

### Worker가 색상만 바꾸고 "완료" 보고
**이 파이프라인의 핵심 실패 패턴.** 즉시 FAIL.
"Layout structure MUST be different. You only changed colors/borders. Redo the redesign with actual layout changes: new grid structure, new visualizations, new component hierarchy."

### Worker가 파티모드 라운드를 건너뜀
party-logs 누락 → 거부: "Party logs missing. Redo 3-round self-review."

### 재감사 점수가 +2점 미달
추가 수정 지시: "Re-audit score improved only +N. Need at least +2. Fix: (구체적 영역)."

### Worker가 Subframe 컴포넌트를 안 씀
"Use Subframe components from packages/app/src/ui/components/. At least 3 components required."

### TypeScript 타입 체크 실패
Worker가 수정 또는 오케스트레이터가 직접 수정. 커밋 전 반드시 통과.

### Playwright 테스트 실패
커밋+푸시 후 2분 대기 → 재실행. 인증 실패면 auth.setup.ts 확인.

### Pro Max search.py 에러
`python3 .claude/skills/ui-ux-pro-max/scripts/search.py` 경로 확인. 데이터 CSV 누락 시 재설치.

---

## 절대 규칙

1. **레이아웃 구조 자체를 변경해야 한다** — 색상/border만 바꾸면 FAIL
2. **모든 산출물은 구체적이고 자세하게** — hex/Tailwind/JSX 수준
3. **3-Phase 순서 준수** — diagnose → redesign → verify (건너뛰기 금지)
4. **Pro Max 디자인 시스템 참조 필수** — MASTER.md + 페이지 오버라이드
5. **Subframe 컴포넌트 최소 3개 활용** — 새로 만들기 전에 기존 부품 먼저
6. **기능 로직 건드리지 말 것** — API/state/handlers 100% 유지
7. **파티모드 3라운드 없이 커밋 금지** — 각 라운드는 파일에서 다시 읽어서 리뷰
8. **재감사 점수 Phase 1 대비 +2점 이상** — 미달 시 추가 수정
9. **Playwright 테스트 없이 커밋 금지**
10. **data-testid 누락 시 커밋 금지**
11. **전문가 코멘트 2~3문장 이상** — 한 줄짜리 금지, 인격 반영 필수
12. **"이슈 0개" = 재분석** — BMAD 프로토콜
13. **오케스트레이터는 코딩/파티모드 직접 안 함** — Worker가 전부 처리
14. **Worker spawn 시 첫 작업 포함 필수** — "기다려" 금지
15. **커밋 전 npx tsc --noEmit 필수**
16. **5페이지마다 Worker shutdown + 새 Worker 스폰** — 컨텍스트 관리
17. **디자인 일관성** — 모든 페이지가 design-system/corthex/ 토큰 사용
