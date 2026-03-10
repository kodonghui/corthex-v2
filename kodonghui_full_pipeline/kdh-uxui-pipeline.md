---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인 v7 (범용). Pro Max(디자인 데이터) + LibreUIUX(디자인 원칙) + BMAD(파티모드 QA). 3-Phase: Diagnose → Redesign → Verify. Usage: /kdh-uxui-pipeline [status|diagnose PAGE|redesign PAGE|verify PAGE|batch PRIORITY|phase0|phase1|phase3|final]'
---

# UXUI Refactoring Pipeline v7 (범용)

**Pro Max + LibreUIUX + BMAD 통합. 어떤 프로젝트에서든 복사해서 사용 가능.**

4개 도구가 각자 역할을 나눠 **레이아웃부터 바꾸는 진짜 리디자인**을 수행한다.

### 도구 역할 분담

| 도구 | 역할 | 비유 | 필수? |
|------|------|------|-------|
| **Pro Max** | 디자인 데이터 (색상, 폰트, 스타일, UX 규칙) | 설계 도면집 | 필수 |
| **LibreUIUX** | 디자인 원칙 + 품질 감사 (7차원 분석, 접근성, 반응형) | 감리관 | 필수 |
| **BMAD Party Mode** | 3라운드 자기 리뷰 (7명 전문가 역할극) | 품질 검사관 | 필수 |
| **Subframe** | 컴포넌트 라이브러리 (프리빌트 컴포넌트) | 자재 창고 | 선택 |

### 핵심 교훈

```
"리디자인" = 레이아웃/구조 자체를 바꿔야 한다.
색상/border만 바꾸면 → FAIL.
```

---

## 사전 준비: 프로젝트 설정

### 1. CONFIG.md (필수)

프로젝트 루트에 `_uxui-refactoring/CONFIG.md` 생성:

```markdown
# UXUI Pipeline Config

## Project Info
- Name: {프로젝트명}
- Stack: react / vue / nextjs / svelte / html-tailwind
- CSS Framework: tailwind-v4 / tailwind-v3 / css-modules / styled-components
- Test Framework: playwright / cypress / vitest
- Deploy URL: https://example.com
- Package Path: packages/app (또는 src/)

## Page Mapping
| # | 페이지명 | 경로 | 우선순위 |
|---|---------|------|---------|
| 01 | home | / | 1순위 |
| 02 | dashboard | /dashboard | 1순위 |
...

## Design References
- Design System: design-system/{project}/MASTER.md (Pro Max 생성)
- Style Guide: _uxui-refactoring/STYLE-GUIDE.md (있으면)
- Component Library: src/ui/ (Subframe) 또는 src/components/ (커스텀)
```

### 2. Pro Max 설치 (필수)

```bash
# .claude/skills/ui-ux-pro-max/ 에 설치
# scripts/search.py + data/*.csv 필요
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "test" --domain style
```

### 3. Pro Max 디자인 시스템 생성 (필수)

```bash
# 전역 디자인 시스템 생성 + 저장
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{프로젝트_키워드}" --design-system --persist -p "{프로젝트명}"

# 페이지별 오버라이드 생성 (선택)
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --design-system --persist -p "{프로젝트명}" --page "{페이지명}"
```

결과물:
```
design-system/{project}/MASTER.md          ← 전역 디자인 규칙
design-system/{project}/pages/{page}.md    ← 페이지별 오버라이드
```

### 4. LibreUIUX 명령어 설치 (필수)

`.claude/commands/` 에 아래 파일 복사:
- `libre-ui-review.md` — 7차원 분석 프레임워크
- `libre-ui-synth.md` — 마스터 디자인 오케스트레이터
- `libre-ui-critique.md` — 8차원 디자인 피드백
- `libre-ui-responsive.md` — 반응형 체크
- `libre-a11y-audit.md` — 접근성 감사

### 5. Subframe 설치 (선택)

Subframe MCP 서버 연결 + `npx @subframe/cli@latest init` + `sync`

---

## Mode Selection

| 명령 | 설명 |
|------|------|
| `status` 또는 인자 없음 | 진행 상황 + 다음 작업 안내 |
| `diagnose PAGE` | Phase 1: 현재 상태 7차원 진단 + 디자인 데이터 수집 |
| `redesign PAGE` | Phase 2: 레이아웃 재설계 + 코드 구현 |
| `verify PAGE` | Phase 3: 파티모드 3라운드 + 재감사 + 반응형/접근성 체크 |
| `batch PRIORITY` | 해당 우선순위 전체 자동 (diagnose → redesign → verify 연속) |
| `phase0` | 테스트 환경 세팅 (1회) |
| `phase1` | 현재 기능 스모크 테스트 |
| `phase3` | 시각 회귀 기준 등록 |
| `final` | 최종 전체 검증 |

---

## 3-Phase 워크플로우

```
[Phase 1: DIAGNOSE] 현재 상태 진단
  → Pro Max: 디자인 시스템 데이터 로드 (MASTER.md + 페이지 오버라이드)
  → /libre-ui-review: 7차원 점수 (1~10) + ELEVATE/REFINE/REBUILD 판정
  → 출력: 진단 리포트 + 개선 우선순위

[Phase 2: REDESIGN] 레이아웃 재설계 + 코드 구현
  → Pro Max: 색상/폰트/스타일/UX 규칙 참조
  → /libre-ui-synth: 디자인 원칙 (마스터리, 접근성, 성능) 적용
  → Subframe: 컴포넌트 활용 (설치된 경우)
  → Worker: 실제 코드 구현 (레이아웃 구조 자체를 변경)

[Phase 3: VERIFY] 품질 검증
  → BMAD 파티모드 3라운드 (Collaborative → Adversarial → Forensic)
  → /libre-ui-review: 재감사 (Phase 1 점수와 비교, 최소 +2점 상승 필수)
  → /libre-ui-critique: 8차원 디자인 피드백
  → /libre-ui-responsive: 반응형 체크 (375/768/1024/1440px)
  → /libre-a11y-audit: 접근성 감사 (WCAG, ARIA)
  → 테스트 (Playwright/Cypress)
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
```

---

## Single-Worker 패턴

- **1인 Worker**: 작성 + 자기 리뷰 3라운드 + 수정 + 보고 = 데드락 0
- Worker는 tmux에서 실행 → 사용자가 실시간 관찰
- 오케스트레이터 ↔ Worker 핸드오프 최소 2회 (지시, 완료보고)
- 5페이지마다 Worker shutdown + 새 Worker 스폰 (컨텍스트 관리)

### Agent Manifest (파티모드 전문가)

| Agent | Name | Focus |
|-------|------|-------|
| PM | John | user value, requirements gaps, priorities |
| Architect | Winston | technical contradictions, feasibility, scalability |
| UX Designer | Sally | user experience, accessibility, flow |
| Developer | Amelia | implementation complexity, tech debt, testability |
| QA | Quinn | edge cases, test coverage, quality risks |
| Business Analyst | Mary | business value, market fit, ROI |
| Scrum Master | Bob | scope, dependencies, schedule risks |

---

## Mode: diagnose PAGE (Phase 1)

### Worker 스폰 프롬프트

```
You are a senior UXUI analyst.
You diagnose the current state of a page using Pro Max design data + LibreUIUX 7-dimension analysis.
YOLO mode -- auto-proceed, never wait for user input.

## Your Task: Diagnose {페이지명} (page #{번호})

### Step 1: Load Design System References
1. Read _uxui-refactoring/CONFIG.md (프로젝트 설정)
2. Read design-system/{project}/MASTER.md (전역 디자인 규칙)
3. Read design-system/{project}/pages/{페이지명}.md (있으면 — 페이지 오버라이드)
4. Read _uxui-refactoring/STYLE-GUIDE.md (있으면)

### Step 2: Analyze Current Page Code
1. Read ALL files in {page_path}/ (모든 소스 파일)
2. Read relevant shared components
3. Read relevant backend routes (API 엔드포인트, 데이터 형태)
4. Map: 모든 표시 데이터, 사용자 액션, 상태 전환, API 호출

### Step 3: Pro Max Design Data Query
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --domain style -n 5
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --domain ux -n 5
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "{페이지_키워드}" --domain chart -n 3
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "layout responsive" --stack {stack}
```

### Step 4: LibreUIUX 7-Dimension Analysis
/libre-ui-review 프레임워크를 직접 적용:

1. **Archetypal Coherence** — 일관된 심리적 스토리?
2. **Design Mastery** — 그리드, 타이포, 색상이론, 여백, 시각적 위계, 게슈탈트
3. **Accessibility** — WCAG AA, 키보드, ARIA, 색상 대비, 터치 타겟
4. **Security** — XSS, 입력 검증, 민감 데이터 노출
5. **Performance** — 번들, 이미지, lazy loading, 코드 분할
6. **Code Quality** — 컴포넌트 구조, 타입, 에러 처리, 재사용성
7. **User Experience** — CTA, 네비게이션, 피드백, 상태 처리, 반응형

각 차원 1~10점 + 종합 판정 (ELEVATE/REFINE/REBUILD)

### Step 5: Write Diagnosis Report
Save to: _uxui-refactoring/diagnose/{번호}-{페이지명}.md

Structure:
- Executive Summary (overall score, verdict, 7-dimension table)
- Current State Analysis (ASCII layout, components, APIs, problems)
- Design System Gap Analysis (MASTER.md vs current code)
- Pro Max Recommendations (style, UX, charts)
- 7-Dimension Detailed Scores
- Redesign Priority List (layout changes first)
- Available Components (Subframe or custom)

### Step 6: Report to Orchestrator
[Phase 1 Complete] diagnose-{번호}-{페이지명}
Overall score: X/10
Verdict: ELEVATE/REFINE/REBUILD
Key findings: (2~3줄)
Redesign priorities: (상위 3개)
```

---

## Mode: redesign PAGE (Phase 2)

### 전제 조건
- `diagnose PAGE` 완료 (진단 리포트 존재)

### Worker 스폰 프롬프트

```
You are a senior frontend developer AND UXUI designer.
You REDESIGN pages — not just restyle. Layout structure MUST change.
YOLO mode -- auto-proceed, never wait for user input.

## CRITICAL: LAYOUT MUST CHANGE
"리디자인" means the page layout/structure itself must be different.
If you only change colors/borders/fonts without changing layout → INSTANT FAIL.
Examples of REAL redesign:
  - Grid 변경 (1-column → 2-column, flat list → bento grid)
  - 새 시각화 추가 (chart, donut, progress bar, sparkline)
  - 카드 구조 변경 (flat → gradient cards with effects)
  - 정보 위계 재배치 (상단 KPI, 중앙 main, 하단 activity)
  - 인터랙션 패턴 변경 (list → kanban, table → card grid)

## CRITICAL: 기능 로직 불변
API 호출, 상태관리, 이벤트 핸들러 100% 유지. UI만 변경.

## CRITICAL: 구체적이고 자세하게
hex/Tailwind/JSX 수준으로 구체적. 추상적 표현 금지.

## Your References (MUST read)
1. _uxui-refactoring/CONFIG.md — 프로젝트 설정
2. design-system/{project}/MASTER.md — 전역 디자인 규칙
3. design-system/{project}/pages/{페이지명}.md — 페이지 오버라이드 (있으면)
4. _uxui-refactoring/diagnose/{번호}-{페이지명}.md — Phase 1 진단 결과
5. _uxui-refactoring/STYLE-GUIDE.md — 종합 가이드 (있으면)
6. 컴포넌트 라이브러리 (Subframe src/ui/ 또는 커스텀 components/)
7. 현재 페이지 코드
8. 백엔드 라우트 / 타입 정의

## LibreUIUX 디자인 원칙 (/libre-ui-synth 내부 적용)
- Archetypal Foundation: 브랜드 심리학적 의미
- Design Mastery: 거장 원칙 — Dieter Rams, Vignelli, Bass
- Technical Excellence: 접근성, 보안, 성능
- Quality Assurance: 테스트
- Deployment Readiness: SEO, Core Web Vitals

## Your Task: Redesign {페이지명} (page #{번호})

### Step 1: Read ALL References

### Step 2: Design New Layout
Save spec to: _uxui-refactoring/redesign/{번호}-{페이지명}-spec.md

Include:
1. **New Layout** (ASCII diagram — MUST differ from current)
2. **Component Breakdown** — 각 컴포넌트의 정확한 Tailwind + JSX
3. **Components from Library** — 기존 컴포넌트 활용 목록
4. **New Visualizations** — 추가할 차트, 그래프 등
5. **Responsive** — 375px, 768px, 1024px, 1440px
6. **States** — Loading, Error, Empty (구체적 JSX)
7. **data-testid Map** — 모든 인터랙티브 요소

### Step 3: Implement Code
- Design spec 따라 코드 수정
- 기존 컴포넌트 라이브러리 활용
- 기능 로직 100% 유지
- 레이아웃 구조 자체를 변경

### Step 4: Self-Check
수정한 코드를 Read tool로 다시 읽고:
- [ ] 레이아웃 구조가 확실히 다른가?
- [ ] Design spec의 Tailwind이 정확히 적용됐는가?
- [ ] 기능 로직이 100% 유지됐는가?
- [ ] 컴포넌트 라이브러리를 활용했는가?
- [ ] data-testid가 모두 추가됐는가?
하나라도 NO → 즉시 수정

### Step 5: Report to Orchestrator
[Phase 2 Complete] redesign-{번호}-{페이지명}
Layout changes: (이전 vs 이후 구조 변경 요약)
Components used: (목록)
Changed files: (경로들)
```

---

## Mode: verify PAGE (Phase 3)

### 전제 조건
- `redesign PAGE` 완료

### Worker 스폰 프롬프트

```
You are a senior QA engineer AND UXUI auditor.
You verify redesigned pages through BMAD party mode + LibreUIUX multi-audit.
YOLO mode -- auto-proceed, never wait for user input.

## CRITICAL: 비대화형 파티모드 (bmad-party-mode 스킬 호출 금지)
Worker인 네가 직접 7명 전문가 역할극을 수행한다.

## Your Task: Verify {페이지명} (page #{번호})

### Step 1: Read All Files
1. _uxui-refactoring/diagnose/{번호}-{페이지명}.md (Phase 1 점수)
2. _uxui-refactoring/redesign/{번호}-{페이지명}-spec.md (design spec)
3. ALL modified code files (Read tool — 기억으로 리뷰 금지)
4. design-system/{project}/MASTER.md + pages/{페이지명}.md

### Step 2: BMAD 파티모드 3라운드

**Round 1 (Collaborative Lens):**
1. 수정된 코드 전부 Read tool로 읽기
2. 전문가 4~5명 우호적 리뷰 (인격 반영, 2~3문장, 크로스톡 2회+)
3. LAYOUT CHANGE VERIFICATION:
   - [ ] 레이아웃 구조가 이전과 다른가?
   - [ ] 새 시각화가 추가됐는가?
   - [ ] 색상만 바꾼 게 아닌가? (YES면 즉시 FAIL)
4. 최소 2개 이슈
5. party-logs/{번호}-{페이지명}-round1.md 저장
6. 코드 수정

**Round 2 (Adversarial Lens):**
1. 수정된 코드 전부 Read tool로 다시 읽기
2. 전문가 전원(7명) 적대적 모드, 각자 최소 1개 새 관찰
3. CHECKLIST:
   - [ ] Design spec 레이아웃과 코드 일치?
   - [ ] Tailwind classes 정확?
   - [ ] 기능 로직 100% 동일?
   - [ ] data-testid 전부 추가?
   - [ ] 반응형 정상?
   - [ ] Loading/Error/Empty 상태 구현?
   - [ ] Design system 준수?
   - [ ] import 경로 정확?
4. party-logs/{번호}-{페이지명}-round2.md 저장
5. 코드 수정

**Round 3 (Forensic Lens):**
1. 최종 코드 Read tool로 읽기
2. Round 1+2 이슈 재평가
3. 각 전문가 최종 평가 (2~3문장, 인격)
4. 품질 점수 X/10 + PASS(7+) / FAIL(6-)
5. party-logs/{번호}-{페이지명}-round3.md 저장
6. FAIL → 수정 후 3라운드 전체 재실행

### Step 3: LibreUIUX 재감사 (7차원)
- 7차원 점수 재채점
- Phase 1 대비 최소 +2점 상승 필수 (미달 시 추가 수정)
- _uxui-refactoring/verify/{번호}-{페이지명}-re-audit.md 저장

### Step 4: LibreUIUX 추가 감사
a) /libre-ui-critique — 8차원 디자인 피드백
b) /libre-ui-responsive — 반응형 체크 (375/768/1024/1440px)
c) /libre-a11y-audit — 접근성 감사 (WCAG, ARIA)
이슈 있으면 코드 수정

### Step 5: 테스트 작성 + 실행
- 페이지 로드 확인
- 주요 인터랙션
- data-testid 존재 확인
- 반응형 (desktop + mobile viewport)
- 실패 시 수정 후 재실행

### Step 6: Report to Orchestrator
[Phase 3 Complete] verify-{번호}-{페이지명}
Party mode: 3 rounds PASS (issues fixed: N)
Quality score: X/10
Re-audit score: X/10 (Phase 1 대비 +N점)
Responsive: PASS/FAIL
Accessibility: PASS/FAIL
Tests: N passed
Changed files: (경로들)
```

---

## Mode: batch PRIORITY

```
오케스트레이터:
  1. CONFIG.md에서 해당 우선순위 페이지 목록 추출
  2. TeamCreate로 팀 생성
  3. 페이지별 순차 실행:
     a. Worker 스폰 → diagnose (Phase 1)
     b. SendMessage → redesign (Phase 2)
     c. SendMessage → verify (Phase 3)
     d. 완료 보고 → 검증 → 타입 체크 → 커밋+푸시
  4. 5페이지마다 Worker shutdown + 새 Worker 스폰
  5. 전체 완료 → 스모크 테스트 전체 실행
```

---

## Mode: phase0 (테스트 환경 세팅)

```
1. CONFIG.md에서 테스트 프레임워크/배포 URL 읽기
2. 테스트 디렉토리 생성 + 설정 파일 생성
3. 테스트 러너 설치
4. 인증 설정 (필요 시)
```

---

## Mode: phase1 (스모크 테스트)

```
1. 전체 스모크 테스트 실행
2. 결과 파싱 (통과/실패 분류)
3. 요약 보고
```

---

## Mode: phase3 (시각 회귀 기준 등록)

```
1. visual regression 테스트 생성
2. 기준 스크린샷 캡처
3. 커밋: test(visual): baseline screenshots
```

---

## Mode: final (최종 전체 검증)

```
1. 스모크 테스트 (전 페이지)
2. 인터랙션 테스트 (기능 동작)
3. 시각 회귀 테스트 (스크린샷 비교)
4. 종합 리포트
5. 실패 → Worker 수정
6. 전부 통과 → 완료 선언
```

---

## Mode: status

```
1. _uxui-refactoring/ 구조 확인
2. 페이지별 진행 상태 테이블:
   | # | 페이지 | diagnose | redesign | verify | 점수변화 |
3. 다음 할 일 안내
```

---

## 저장 위치

```
_uxui-refactoring/
├── CONFIG.md                    (프로젝트 설정 — 범용 필수)
├── STYLE-GUIDE.md               (종합 디자인 시스템 — 선택)
├── diagnose/                    (Phase 1: 진단 리포트)
├── redesign/                    (Phase 2: 디자인 스펙)
├── verify/                      (Phase 3: 재감사 결과)
└── party-logs/                  (파티모드 리뷰 로그)

design-system/{project}/
├── MASTER.md                    (Pro Max 전역 디자인 규칙)
└── pages/                       (페이지별 오버라이드)
```

---

## Party Log 형식

### Round 1 (Collaborative):
```
## [Round 1 -- Collaborative] {페이지명}
### Agent Discussion (인격 반영, 2~3문장, 크로스톡 2회+)
### Layout Change Verification (체크리스트)
### Issues Found (테이블)
### Fixes Applied
```

### Round 2 (Adversarial):
```
## [Round 2 -- Adversarial] {페이지명}
### Round 1 Fix Verification
### Adversarial Discussion (전원 적대적)
### Checklist Results (9개 항목)
### New Issues Found
### Fixes Applied
```

### Round 3 (Forensic):
```
## [Round 3 -- Final Judgment] {페이지명}
### Issue Calibration (재평가)
### Per-Agent Final Assessment (인격)
### Quality Score: X/10
### Verdict: PASS / FAIL
```

---

## Worker 스폰 규칙

```
1. 첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지
2. mode=bypassPermissions
3. 5페이지마다 shutdown + 새 Worker 스폰
4. 멈추면 SendMessage 리마인더
5. FAIL → 자동 재시도 1회 → 2번째 FAIL → 오케스트레이터 개입
```

---

## 트러블슈팅

### Worker가 색상만 바꾸고 "완료" 보고
핵심 실패 패턴. 즉시 FAIL.
"Layout MUST change. You only changed colors. Redo with actual layout changes."

### 재감사 점수가 +2점 미달
"Need at least +2 improvement. Fix: (구체적 영역)."

### Pro Max search.py 에러
경로 확인: `.claude/skills/ui-ux-pro-max/scripts/search.py`

### LibreUIUX 명령어 없음
`.claude/commands/libre-*.md` 파일 존재 확인

---

## 절대 규칙

1. **레이아웃 구조 자체를 변경** — 색상만 바꾸면 FAIL
2. **모든 산출물은 구체적이고 자세하게** — hex/Tailwind/JSX 수준
3. **3-Phase 순서 준수** — diagnose → redesign → verify
4. **Pro Max 디자인 시스템 참조 필수** — MASTER.md + 오버라이드
5. **기능 로직 건드리지 말 것** — UI만 변경
6. **파티모드 3라운드 없이 커밋 금지**
7. **재감사 점수 +2점 이상**
8. **테스트 없이 커밋 금지**
9. **파일에서 다시 읽어서 리뷰** — 기억으로 리뷰 금지
10. **전문가 코멘트 2~3문장 이상** — 인격 반영 필수
11. **"이슈 0개" = 재분석**
12. **오케스트레이터는 코딩/파티모드 안 함** — Worker 전담
13. **Worker spawn 시 첫 작업 포함 필수**
14. **5페이지마다 Worker 교체** — 컨텍스트 관리

---

## 다른 프로젝트에서 사용하기

1. `.claude/commands/kdh-uxui-pipeline.md` ← 이 파일 복사
2. `.claude/commands/libre-*.md` ← LibreUIUX 명령어 5개 복사
3. `.claude/skills/ui-ux-pro-max/` ← Pro Max 스킬 복사
4. `_uxui-refactoring/CONFIG.md` ← 프로젝트 설정 작성
5. `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "..." --design-system --persist` 실행
6. `/kdh-uxui-pipeline diagnose {첫페이지}` 로 시작
