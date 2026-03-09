---
name: 'kdh-uxui-pipeline'
description: 'UXUI 리팩토링 파이프라인. Lovable 와이어프레임 + Claude Code 리팩토링 + 3라운드 파티모드 + Playwright QA. Usage: /kdh-uxui-pipeline [phase0|phase1|prompt PAGENAME|prompt-batch PRIORITY|code PAGENAME|code-batch PRIORITY|phase3|final]'
---

# CORTHEX UXUI Refactoring Pipeline v5

Lovable 와이어프레임(디자인) + Claude Code(코딩) + 3라운드 파티모드 + Playwright QA.
**tmux Worker가 실제 작업 수행. 오케스트레이터는 지시+커밋만.**

---

## Mode Selection

- `phase0`: Playwright 환경 세팅 (한 번만)
- `phase1`: 현재 기능 상태 점검 (스모크 테스트)
- `prompt PAGENAME`: Lovable한테 보낼 와이어프레임 프롬프트 생성
- `prompt-batch PRIORITY`: 해당 우선순위 전체 Lovable 프롬프트 생성
- `code PAGENAME`: Lovable 와이어프레임 기반 코드 리팩토링 + 파티모드 3라운드 + Playwright
- `code-batch PRIORITY`: 해당 우선순위 전체 리팩토링 일괄 실행
- `phase3`: 시각 회귀 테스트 기준 이미지 등록
- `final`: 최종 전체 검증
- 인자 없음: 진행 상황 표시 + 다음 작업 안내

---

## 핵심 원칙

### Lovable = 디자인 전권 위임

**Lovable이 결정하는 것:**
- 레이아웃, 색상, 타이포그래피, spacing, 컴포넌트 디자인, 시각적 위계
- 정보 밀도, 애니메이션, 아이콘, 다크/라이트 모드
- 모든 시각적 결정 — 예외 없음

**우리가 Lovable에게 주는 것 (프롬프트):**
- 이 페이지가 뭘 하는 페이지인지 (목적)
- 어떤 데이터가 표시되는지 (엔티티, 필드, 상태)
- 사용자가 뭘 할 수 있는지 (모든 인터랙션)
- UX 고려사항 (기능적 요구만 — 시각적 지시 제로)

**프롬프트에 절대 넣지 않는 것:**
- 색상 이름, hex 코드, 그라데이션
- 폰트 이름, 크기, 굵기
- px/rem 값, 비율, 레이아웃 구조
- 컴포넌트 라이브러리 이름
- "왼쪽에 X, 오른쪽에 Y" 같은 배치 지시

### 기능 로직 불변

- API 호출, 상태관리, 이벤트 핸들러 100% 유지
- UI/레이아웃/스타일/Tailwind 클래스만 변경
- v2 백엔드에 **현재 존재하는** 기능만 반영 (v1 스펙 직접 참조 금지 — 삭제된 기능 부활 방지)

---

## 작업 환경

```
이 PC (VS Code) 한 곳에서 전부 진행

오케스트레이터 (메인 Claude Code)
  → 팀 생성, Worker 스폰, 스텝 지시, 커밋+푸시
  → 문서 작성/코딩 직접 안 함

Worker (tmux 안의 Claude Code)
  → 프롬프트 작성, 코드 리팩토링, 파티모드 3라운드, 테스트 작성
  → 사용자가 tmux에서 실시간 관찰 가능

Lovable (브라우저)
  → 사용자가 프롬프트 복붙 → 와이어프레임 생성 → 스크린샷 저장

Playwright 확장
  → ▶ 클릭으로 테스트 실행 + 브라우저 실시간 확인

테스트 대상: 배포 사이트 (https://corthex-hq.com)
```

---

## 전체 흐름

```
[Phase 0] Playwright 환경 세팅 (1회)
    ↓
[Phase 1] 현재 기능 상태 점검 (스모크 테스트)
    ↓
[Phase 2] 페이지별 리팩토링 (반복)
    → A. prompt: Worker가 Lovable 프롬프트 생성 (현재 코드 분석 기반)
    → B. 사용자가 Lovable에 복붙 → 와이어프레임 스크린샷 저장
    → C. code: Worker가 와이어프레임 보고 코드 리팩토링 + 파티모드 3라운드
    → D. Worker가 Playwright 테스트 작성 + 실행
    → E. 오케스트레이터가 타입 체크 + 커밋 + 푸시 (자동 배포)
    ↓
[Phase 3] 시각 회귀 테스트 기준 이미지 등록
    ↓
[Phase 4] 최종 전체 검증
```

**사용자가 직접 하는 것: B단계 (Lovable에 프롬프트 복붙 + 스크린샷 저장)만.**

---

## Single-Worker 패턴 (kdh-full-auto-pipeline과 동일)

### 왜 Single Worker인가?

- 2인 핑퐁(Writer+Reviewer) → SendMessage 데드락 빈번
- **1인 Worker가 작성 + 자기 리뷰 3라운드 + 수정 + 보고** = 데드락 0
- Worker는 tmux에서 실행 → 사용자가 실시간 관찰
- 오케스트레이터 ↔ Worker 핸드오프 최소 2회(지시, 완료보고)

### Agent Manifest

Read `_bmad/_config/agent-manifest.csv` for agent definitions. If not found, use defaults:

| Agent | Name | Focus |
|-------|------|-------|
| PM | John | user value, requirements gaps, priorities |
| Architect | Winston | technical contradictions, feasibility, scalability |
| UX Designer | Sally | user experience, accessibility, flow |
| Developer | Amelia | implementation complexity, tech debt, testability |
| QA | Quinn | edge cases, test coverage, quality risks |
| Business Analyst | Mary | business value, market fit, ROI |
| Scrum Master | Bob | scope, dependencies, schedule risks |

### 오케스트레이터가 하는 것

```
1. TeamCreate로 팀 생성
2. Worker 스폰 (첫 작업을 spawn 프롬프트에 포함 — "기다려" 금지)
3. Worker 완료 보고 수신
4. 결과 검증 (파티 로그 존재, 품질 점수 확인)
5. 타입 체크: npx tsc --noEmit -p packages/server/tsconfig.json
6. 커밋 + 푸시
7. 다음 페이지로 Worker에게 SendMessage (또는 shutdown + 새 Worker 스폰)
```

### 오케스트레이터가 하지 않는 것

```
- 프롬프트 작성 (Worker가 함)
- 코드 리팩토링 (Worker가 함)
- 파티모드 실행 (Worker가 자기 리뷰)
- PASS/FAIL 판정 (Worker가 자체 판정)
- 테스트 작성 (Worker가 함)
```

---

## Party Mode: 비대화형 3라운드 자기 리뷰 (kdh-full-auto-pipeline 방식)

**Worker가 혼자서** 7명 전문가 역할극 수행. **완전 자동 — 사용자 입력/확인/메뉴 표시 일체 금지.**
`bmad-party-mode` 스킬 호출 금지 (대화형이라 멈춤). Worker가 직접 역할극 + 로그 작성 + 수정까지 전부 처리.

### 비대화형 실행 방법 (중요)

```
Worker는 bmad-party-mode 스킬을 호출하지 않는다.
Worker가 직접:
  1. 작성한 파일을 Read tool로 다시 읽는다 (기억 X, 반드시 파일에서)
  2. 7명 전문가 역할을 순서대로 연기하면서 이슈를 찾는다
  3. 이슈 테이블을 작성한다
  4. party-logs/{파일명}.md에 Write tool로 저장한다
  5. 발견된 이슈를 Edit tool로 원본 파일에서 즉시 수정한다
  6. 다음 라운드로 넘어간다 (사용자 확인 없이)
이 전체 과정에 사용자 개입 제로. YOLO 모드.
```

### Round 구조

**Round 1 (Collaborative Lens):**
- 작성한 파일을 Read tool로 다시 읽기 (기억으로 리뷰 절대 금지)
- 전문가 4~5명이 우호적 관점에서 리뷰 (인격 반영, 2~3문장 이상)
- 크로스톡 2회 이상 (전문가끼리 이름 부르며 대화)
- 최소 2개 이슈 발견 (0개 = 의심하고 재분석)
- 발견된 이슈를 Edit tool로 원본 파일에서 즉시 수정
- party-logs에 Write tool로 저장

**Round 2 (Adversarial Lens):**
- 수정된 파일을 Read tool로 다시 읽기
- 전문가 전원(7명)이 적대적 관점으로 전환
- Round 1 수정이 진짜 고쳐졌는지 검증
- 각 전문가 최소 1개 새 관찰 (Round 1에 없던 것)
- 현재 백엔드 코드 기준으로 기능 커버리지 확인 (v1-feature-spec 직접 참조 금지)
- 발견된 이슈를 Edit tool로 원본 파일에서 즉시 수정
- party-logs에 Write tool로 저장

**Round 3 (Forensic Lens):**
- 최종 파일을 Read tool로 다시 읽기
- Round 1+2의 모든 이슈를 재평가 (과장 → 하향, 과소평가 → 상향)
- 각 전문가 최종 평가 (2~3문장, 인격 반영)
- 품질 점수 X/10 + PASS (7+) 또는 FAIL (6-)
- party-logs에 Write tool로 저장
- FAIL → 수정 후 3라운드 전체 재실행

### Party Log 형식

kdh-full-auto-pipeline의 Party Log 형식과 동일.
저장 경로: `_uxui-refactoring/party-logs/`

```
_uxui-refactoring/party-logs/
├── prompt-01-command-center-round1.md
├── prompt-01-command-center-round2.md
├── prompt-01-command-center-round3.md
├── code-01-command-center-round1.md
├── code-01-command-center-round2.md
├── code-01-command-center-round3.md
...
```

### Party Log 라운드별 형식 (Worker가 이 형식으로 저장)

**Round 1 ({type}-{번호}-{페이지명}-round1.md):**
```
## [Party Mode Round 1 -- Collaborative Review] {step_name}

### Agent Discussion
(전문가들이 인격 반영해서 자연스럽게 대화. 이름 부르며 크로스톡. 각 2~3문장 이상)

### Issues Found
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|

### Consensus Status
- Major objections: N
- Minor opinions: N
- Cross-talk exchanges: N

### Fixes Applied
- (원본 파일에서 실제로 수정한 내용)
```

**Round 2 ({type}-{번호}-{페이지명}-round2.md):**
```
## [Party Mode Round 2 -- Adversarial Review] {step_name}

### Round 1 Fix Verification
| Issue # | Status | Verification Detail |
|---------|--------|---------------------|

### Adversarial Agent Discussion
(전문가들이 적대적 모드로 전환. 각자 최소 1개 새 관찰.)

### New Issues Found (Round 2)
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|

### Cross-Step Consistency Check
- Checked against: (다른 완료된 페이지 프롬프트들)
- Contradictions found: (구체적 내용 또는 "none with evidence")

### Fixes Applied
- (원본 파일에서 실제로 수정한 내용)
```

**Round 3 ({type}-{번호}-{페이지명}-round3.md):**
```
## [Party Mode Round 3 -- Final Judgment] {step_name}

### Issue Calibration (from Rounds 1+2)
| Original # | Original Severity | Calibrated Severity | Reason |
|------------|-------------------|---------------------|--------|

### Per-Agent Final Assessment (in character)
(각 전문가 2~3문장, 자기 스타일로)

### Quality Score: X/10
Justification: (2~3문장)

### Final Verdict
- **PASS** or **FAIL**
- Reason: (1~2줄)

### Fixes Applied
- (수정 내용 또는 "none needed")
```

---

## Mode: prompt PAGENAME (Lovable 프롬프트 생성 + 비대화형 3라운드 자기 리뷰)

### Worker 스폰 프롬프트

```
You are a UXUI wireframe prompt writer for CORTHEX v2. You generate design prompts for Lovable AND self-review them with 3-round party mode.
YOLO mode -- auto-proceed through all prompts, never wait for user input.

## CRITICAL: 비대화형 파티모드 (bmad-party-mode 스킬 호출 금지)
파티모드는 Skill tool로 호출하지 않는다. Worker인 네가 직접 수행한다:
1. 작성한 프롬프트 파일을 Read tool로 다시 읽는다 (기억으로 리뷰 절대 금지)
2. 7명 전문가(John/Winston/Sally/Amelia/Quinn/Mary/Bob) 역할을 직접 연기한다
3. 이슈 테이블을 작성하고, party-logs 파일에 Write tool로 저장한다
4. 발견된 이슈를 Edit tool로 프롬프트 원본 파일에서 즉시 수정한다
5. 다음 라운드로 자동 진행한다 (사용자 확인 없이, 메뉴 없이)

## CRITICAL RULE: Lovable has COMPLETE creative freedom on everything visual
Your prompt must NEVER contain:
- Colors, hex codes, gradients
- Font names, sizes, weights
- px/rem values, layout ratios, column widths
- Component library names
- Placement instructions ("left sidebar", "right panel")

Your prompt must ONLY contain:
- What the page is for (purpose, context)
- What data is displayed (entities, fields, states, relationships)
- What actions users can take (every interaction, button, form, modal)
- UX considerations (functional only — information hierarchy, edge cases, mobile adaptation)

## Your References (MUST read before writing)
1. Current page code: packages/{app|admin}/src/pages/{페이지명}/ (현재 코드 — 어떤 데이터/기능이 있는지 파악)
2. Backend routes: packages/server/src/routes/ (API 엔드포인트 — 실제 데이터 확인)
3. Database schema: packages/server/src/db/schema.ts (엔티티 구조)
4. Shared types: packages/shared/src/types.ts (타입 정의)

IMPORTANT: Only describe features that CURRENTLY EXIST in the v2 codebase.
Do NOT reference v1-feature-spec.md directly — some features were removed in v2.
Read the actual code to confirm what exists.

## Your Task: Generate Lovable prompt for {페이지명} (page #{번호})

### Step 1: Read Current Code
- Read all files in the page directory
- Read relevant backend routes
- Read relevant schema tables
- Understand: what data exists, what API calls are made, what state is managed

### Step 2: Write Lovable Prompt
Save to: _uxui-refactoring/lovable-prompts/{번호}-{페이지명}.md

Structure:
# {번호}. {페이지명} — Wireframe Prompt

## 복사할 프롬프트:
(User copies everything below this line to Lovable)

### What This Page Is For
### Data Displayed — In Detail
### User Actions
### UX Considerations
### What NOT to Include on This Page

### Step 3: 비대화형 자기 리뷰 3라운드 (직접 수행 — Skill 호출 금지)

**Round 1 (Collaborative Lens):**
1. 프롬프트 파일을 Read tool로 다시 읽기
2. 전문가 4~5명이 우호적 관점으로 리뷰 (인격 반영, 2~3문장 이상, 크로스톡 2회+)
3. 최소 2개 이슈 (0개 = 재분석)
4. Write tool로 party-logs/prompt-{번호}-{페이지명}-round1.md 저장
5. Edit tool로 프롬프트 파일에서 이슈 수정

**Round 2 (Adversarial Lens):**
1. 수정된 프롬프트 파일을 Read tool로 다시 읽기
2. 전문가 전원(7명) 적대적 모드, 각자 최소 1개 새 관찰
3. ADVERSARIAL CHECKLIST 검증:
   - [ ] Zero color/font/size/layout mentions? (ANY visual spec = instant FAIL)
   - [ ] Only describes currently existing v2 features? (deleted features included = FAIL)
   - [ ] Data descriptions match actual schema.ts fields?
   - [ ] Actions match actual frontend event handlers?
   - [ ] Edge cases defined (empty state, error, loading, mobile)?
   - [ ] Lovable has enough context to understand what to design?
   - [ ] Description is specific and detailed (not vague)?
4. Write tool로 party-logs/prompt-{번호}-{페이지명}-round2.md 저장
5. Edit tool로 프롬프트 파일에서 이슈 수정

**Round 3 (Forensic Lens):**
1. 최종 프롬프트 파일을 Read tool로 다시 읽기
2. Round 1+2 이슈 재평가 + 각 전문가 최종 평가
3. 품질 점수 X/10 + PASS(7+) / FAIL(6-)
4. Write tool로 party-logs/prompt-{번호}-{페이지명}-round3.md 저장
5. FAIL → 프롬프트 재작성 후 3라운드 전체 재실행

### Step 4: Report to Orchestrator
[Step Complete] prompt-{번호}-{페이지명}
Content summary: (1~2줄)
Party mode: 3 rounds passed (issues fixed: N)
Quality score: X/10
Changed files: (경로들)
```

---

## Mode: prompt-batch PRIORITY (일괄 프롬프트 생성 → 사용자 호출)

### 전체 흐름

```
오케스트레이터:
  1. 해당 우선순위의 전체 페이지 목록 추출
  2. Worker 스폰 (첫 페이지 작업을 spawn 프롬프트에 포함)
  3. Worker가 페이지 1개 완료 보고 → 오케스트레이터가 다음 페이지 SendMessage
  4. 5페이지마다 Worker shutdown + 새 Worker 스폰 (컨텍스트 관리)
  5. 해당 우선순위의 모든 페이지 프롬프트 완료
  6. 오케스트레이터가 일괄 커밋 + 푸시
  7. ★ 사용자에게 알림: "A단계 전체 완료! 프롬프트 {N}개 생성됨. 확인해주세요."
     → 사용자가 Lovable에서 B단계(와이어프레임) 수동 진행
     → 사용자가 다시 부르면 C단계(code-batch) 실행

Worker 페이지당 작업:
  1. 현재 코드 읽기 (페이지 파일 + 관련 백엔드 라우트 + 스키마)
  2. Lovable 프롬프트 생성 → _uxui-refactoring/lovable-prompts/{번호}-{페이지명}.md
  3. 비대화형 파티모드 3라운드 자기 리뷰 (bmad-party-mode 스킬 호출 금지)
     - Round 1 (Collaborative) → 이슈 수정 → 로그 저장
     - Round 2 (Adversarial) → 이슈 수정 → 로그 저장
     - Round 3 (Forensic) → PASS/FAIL 판정 → 로그 저장
     - FAIL → 재작성 후 3라운드 재실행
  4. 오케스트레이터에게 완료 보고 (SendMessage)
```

### 사용자 호출 시점 (중요)

```
prompt-batch 실행 → 모든 페이지 프롬프트 완료 → 커밋+푸시 → "A단계 완료" 알림
                                                                    ↓
                                                          사용자가 B단계 수동 진행
                                                          (Lovable에 프롬프트 복붙)
                                                                    ↓
                                                          사용자가 다시 부름
                                                                    ↓
                                                          code-batch 실행 (C단계)
```

---

## Mode: code PAGENAME (리팩토링 + 비대화형 3라운드 자기 리뷰 + Playwright)

### 전제 조건
- `prompt PAGENAME` 완료 (프롬프트 파일 존재)
- Lovable 와이어프레임 존재 (`_uxui-refactoring/wireframes/{번호}-{페이지명}.png`)

### Worker 스폰 프롬프트

```
You are a UXUI refactoring developer for CORTHEX v2. You implement UI changes based on Lovable wireframes AND self-review with 3-round party mode.
YOLO mode -- auto-proceed through all prompts, never wait for user input.

## CRITICAL: 비대화형 파티모드 (bmad-party-mode 스킬 호출 금지)
파티모드는 Skill tool로 호출하지 않는다. Worker인 네가 직접 수행한다:
1. 수정한 코드 파일을 Read tool로 다시 읽는다 (기억으로 리뷰 절대 금지)
2. 7명 전문가(John/Winston/Sally/Amelia/Quinn/Mary/Bob) 역할을 직접 연기한다
3. 이슈 테이블을 작성하고, party-logs 파일에 Write tool로 저장한다
4. 발견된 이슈를 Edit tool로 코드 파일에서 즉시 수정한다
5. 다음 라운드로 자동 진행한다 (사용자 확인 없이, 메뉴 없이)

## Your References (MUST read before coding)
1. **Wireframe** (DESIGN GUIDE): _uxui-refactoring/wireframes/{번호}-{페이지명}.png
   - This is the visual target. Match the wireframe's layout, visual structure, and component arrangement.
   - Lovable designed this with full creative freedom — follow its design decisions.
2. **Lovable Prompt**: _uxui-refactoring/lovable-prompts/{번호}-{페이지명}.md (what was requested)
3. **Current page code**: packages/{app|admin}/src/pages/{페이지명}/ (what exists now)

## ABSOLUTE RULES (break any = instant FAIL)
1. 기능 로직 건드리지 말 것 — API 호출, 상태관리, 이벤트 핸들러 100% 유지
2. UI/레이아웃/스타일/Tailwind 클래스만 변경
3. data-testid 전부 추가 (모든 인터랙션 요소)
4. 기존 data-testid 삭제 금지
5. 새 파일 생성 최소화 (기존 파일 수정 선호)
6. import 경로는 git ls-files 기준 대소문자 정확히 일치

## Your Task: Refactor {페이지명} (page #{번호})

### Step 1: Read References
- Read wireframe image
- Read Lovable prompt
- Read all current page code files

### Step 2: Refactor Code
For each file in the page:
1. Match wireframe layout (component arrangement, visual structure)
2. Update Tailwind classes to match wireframe's visual style
3. Implement responsive design (desktop + mobile)
4. Add loading/error/empty state UI where missing
5. Add data-testid to every interactive element
6. Preserve all existing functionality

### Step 3: 비대화형 자기 리뷰 3라운드 (직접 수행 — Skill 호출 금지)

**Round 1 (Collaborative Lens):**
1. 수정한 코드 파일 전부를 Read tool로 다시 읽기
2. 전문가 4~5명이 우호적 관점으로 리뷰 (인격 반영, 2~3문장 이상, 크로스톡 2회+)
3. 최소 2개 이슈 (0개 = 재분석)
4. Write tool로 party-logs/code-{번호}-{페이지명}-round1.md 저장
5. Edit tool로 코드 파일에서 이슈 수정

**Round 2 (Adversarial Lens):**
1. 수정된 코드 파일 전부를 Read tool로 다시 읽기
2. 전문가 전원(7명) 적대적 모드, 각자 최소 1개 새 관찰
3. ADVERSARIAL CHECKLIST 검증:
   - [ ] Wireframe layout matched?
   - [ ] 기능 로직이 100% 동일? (API 호출, 상태관리, 이벤트 핸들러)
   - [ ] data-testid 전부 추가됨?
   - [ ] 기존 data-testid 삭제 안 됨?
   - [ ] 반응형 (mobile에서 깨지지 않는가)?
   - [ ] 로딩/에러/빈 상태 UI 처리됨?
   - [ ] 다른 페이지에 영향 없음?
   - [ ] import 경로 대소문자 일치?
4. Write tool로 party-logs/code-{번호}-{페이지명}-round2.md 저장
5. Edit tool로 코드 파일에서 이슈 수정

**Round 3 (Forensic Lens):**
1. 최종 코드 파일 전부를 Read tool로 다시 읽기
2. Round 1+2 이슈 재평가 + 각 전문가 최종 평가
3. 품질 점수 X/10 + PASS(7+) / FAIL(6-)
4. Write tool로 party-logs/code-{번호}-{페이지명}-round3.md 저장
5. FAIL → 코드 재수정 후 3라운드 전체 재실행

### Step 4: Write Playwright Tests
Save to: packages/e2e/src/tests/interaction/{app|admin}/{페이지명}.spec.ts

- 페이지 로드 확인
- 주요 인터랙션 (클릭, 입력, 내비게이션)
- data-testid 존재 확인
- 반응형 테스트 (desktop + mobile viewport)

### Step 5: Run Tests
- npx playwright test src/tests/interaction/{app|admin}/{페이지명}.spec.ts
- npx playwright test src/tests/smoke/ (회귀 확인)
- 실패 시 수정 후 재실행

### Step 6: Report to Orchestrator
[Step Complete] code-{번호}-{페이지명}
Content summary: (1~2줄)
Party mode: 3 rounds passed (issues fixed: N)
Quality score: X/10
Tests: N개 작성, 전부 통과
Changed files: (경로들)
```

---

## Mode: code-batch PRIORITY (일괄 리팩토링)

```
1. 해당 우선순위에서 prompt 완료 + wireframe 존재 + code 미완료 페이지 목록 추출
2. 페이지별로 순차 실행 (code PAGENAME과 동일)
3. 5페이지마다 Worker shutdown + 새 Worker 스폰
4. 전체 완료 후 스모크 테스트 전체 실행
```

---

## Mode: phase0 (Playwright 환경 세팅)

한 번만 실행. packages/e2e/ 디렉토리에 Playwright 설정 생성.

```
1. packages/e2e/ 디렉토리 확인 (이미 있으면 스킵)
2. playwright.config.ts 생성 (baseURL: https://corthex-hq.com)
3. auth.setup.ts 생성
4. smoke 테스트 파일 생성 (42페이지)
5. npx playwright install chromium
6. 사용자에게 .env.test 비밀번호 입력 요청
```

---

## Mode: phase1 (현재 기능 상태 점검)

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
5. 실패 항목 있으면 Worker 스폰해서 수정
6. 전부 통과 → "UXUI 리팩토링 완료" 선언
```

---

## Mode: 인자 없음 (진행 상황 + 다음 안내)

```
1. _uxui-refactoring/ 폴더 구조 확인
2. lovable-prompts/, wireframes/, party-logs/ 존재 확인
3. 현재 진행 상황 요약 (완료/진행중/남은 페이지)
4. 다음 할 일 안내
```

---

## 저장 위치

```
_uxui-refactoring/
├── lovable-prompts/          (Worker가 생성한 Lovable 프롬프트)
│   ├── 00-context.md         (모든 페이지 공통 제품 컨텍스트 — 처음 한 번만 Lovable에 전달)
│   ├── 01-command-center.md
│   ├── 02-chat.md
│   ...
├── wireframes/               (사용자가 Lovable에서 받아 저장한 스크린샷)
│   ├── 01-command-center.png
│   ├── 02-chat.png
│   ...
├── party-logs/               (파티모드 리뷰 로그)
│   ├── prompt-01-command-center-round1.md
│   ├── code-01-command-center-round1.md
│   ...
└── (이전 파일들은 삭제됨: design-system/, PROGRESS.md, WORKFLOW.md)
```

---

## 페이지 우선순위 + 번호 매핑

| # | 패키지 | 페이지명 | 경로 | 우선순위 |
|---|--------|---------|------|---------|
| 01 | app | command-center | /command-center | 1순위 |
| 02 | app | chat | /chat | 1순위 |
| 03 | app | dashboard | /dashboard | 1순위 |
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

### Worker가 스텝 완료 없이 멈춤
**해결:** SendMessage: "Continue working. Complete 3-round self-review and report back."
2번 리마인더 후에도 안 되면 shutdown + 새 Worker 스폰.

### Worker가 파티모드 라운드를 건너뜀
**해결:** 거부: "Party logs missing. Redo 3-round self-review."

### Worker가 프롬프트에 색상/폰트/레이아웃을 넣음
**해결:** 즉시 FAIL. "Remove ALL visual specifications. Lovable has full creative freedom."

### Worker가 삭제된 v1 기능을 프롬프트에 넣음
**해결:** FAIL. "Only describe features that exist in current v2 code. Read the actual code, not v1-feature-spec."

### TypeScript 타입 체크 실패
**해결:** Worker가 수정 또는 오케스트레이터가 직접 수정. 커밋 전 반드시 통과.

### Playwright 테스트 실패
**해결:** 커밋+푸시 후 2분 대기 → 재실행. 인증 실패면 auth.setup.ts 확인.

---

## 절대 규칙

1. **Lovable에게 디자인 전권 위임** — 프롬프트에 시각적 지시 제로
2. **v2 현재 코드 기준** — v1-feature-spec 직접 참조 금지 (삭제된 기능 부활 방지)
3. **기능 로직 건드리지 말 것** — UI/스타일만 변경
4. **파티모드 3라운드 없이 커밋하지 말 것**
5. **Playwright 테스트 실패 시 커밋 금지**
6. **data-testid 누락 시 커밋 금지**
7. **각 파티모드는 파일에서 다시 읽어서 리뷰** (기억으로 리뷰 금지)
8. **전문가 코멘트는 2~3문장 이상** (한 줄짜리 금지, 인격 반영 필수)
9. **"이슈 0개" = 재분석** (BMAD 프로토콜)
10. **오케스트레이터는 코딩/파티모드 직접 안 함** — Worker가 전부 처리
11. **Worker spawn 시 첫 작업 포함 필수** — "기다려" 금지
12. **커밋 전 npx tsc --noEmit 필수**
13. **5페이지마다 Worker shutdown + 새 Worker 스폰** (컨텍스트 관리)
