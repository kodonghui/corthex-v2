---
name: 'full-pipeline'
description: 'BMAD Full Pipeline. planning(brief->PRD->arch->UX->epics, 팀원 핑퐁 파티모드) 또는 story dev(create->dev->TEA->QA->CR). 사용법: /bmad-full-pipeline [planning|스토리ID]'
---

# BMAD Full Pipeline

planning 모드 또는 story dev 모드.

## 모드 판별

- `planning` 또는 인자 없음: 기획 파이프라인 (brief -> PRD -> architecture -> UX -> epics)
- 스토리 ID (예: `3-1`): 스토리 개발 파이프라인 (create-story -> dev -> TEA -> QA -> CR)

---

## 팀원 파티모드 (핵심 메커니즘)

**팀원 2명(Writer + Reviewer)이 직접 핑퐁**하면서 파티모드를 수행.
둘 다 tmux에서 실행 -- 사용자가 실시간으로 관찰 가능.
매 스텝마다 **3 라운드 핑퐁**. 사용자 입력 불필요 -- 완전 YOLO.

### 왜 팀원 핑퐁인가 (서브에이전트 대신)

- 서브에이전트(Agent 도구 foreground)는 **보이지 않음** -- 사용자가 토론 과정 관찰 불가
- 팀원은 **tmux 창**에서 실행 -- 7명 전문가 토론이 실시간으로 보임
- Reviewer는 파이프라인 내내 **상주** -- 라운드 간 컨텍스트 유지, 콜드스타트 없음
- Writer-Reviewer가 SendMessage로 직접 소통 -- 오케스트레이터 개입 불필요
- 오케스트레이터 역할 최소화 -- 스텝 지시 + 커밋만

### 흐름

```
[스텝 시작]
오케스트레이터 -> Writer: "{step_name} 작성해"

Writer: 스텝 작성 완료 -> Reviewer에게: "Review this: {file_path}"

Reviewer: 문서 읽고 7명 역할극 토론
  -> Writer에게: 라운드1 피드백 (이슈 테이블)

Writer: 라운드1 이슈 수정 -> Reviewer에게: "Fixed, review again"

Reviewer: 수정된 문서 + 라운드1 컨텍스트로 심화 검토
  -> Writer에게: 라운드2 피드백 (심화 발견)

Writer: 라운드2 이슈 수정 -> Reviewer에게: "Fixed, final review"

Reviewer: 수정된 문서 + 라운드1+2 컨텍스트로 최종 검토
  -> Writer에게: 라운드3 최종 판정 (PASS/FAIL)

PASS + 이슈 -> Writer가 남은 이슈 수정 -> 오케스트레이터에게 완료 보고
PASS + 이슈 없음 -> Writer가 바로 오케스트레이터에게 완료 보고
FAIL -> Writer가 재작성 -> Reviewer에게 다시 전달 -> 라운드1부터 재실행

[스텝 완료]
오케스트레이터: 완료 보고 수신 -> 다음 스텝 지시
단계 전체 스텝 완료 -> 오케스트레이터가 git commit
```

### 에이전트 매니페스트

`_bmad/_config/agent-manifest.csv`를 읽어서 에이전트 정보를 사용.
없으면 아래 기본 7명 사용:

| 에이전트 | 이름 | 관점 |
|----------|------|------|
| PM | John | 사용자 가치, 요구사항 빈틈, 우선순위 |
| Architect | Winston | 기술적 모순, 구현 가능성, 확장성 |
| UX Designer | Sally | 사용자 경험, 접근성, 흐름 |
| Developer | Amelia | 구현 난이도, 기술 부채, 테스트 가능성 |
| QA | Quinn | 엣지 케이스, 테스트 커버리지, 품질 위험 |
| Business Analyst | Mary | 비즈니스 가치, 시장 적합성, ROI |
| Scrum Master | Bob | 범위, 의존성, 일정 위험 |

### Reviewer 프롬프트 템플릿

Reviewer 팀원 생성 시 아래 프롬프트를 전달:

```
You are a BMAD party mode reviewer. You stay alive throughout the entire planning pipeline.
When Writer sends you a document to review, perform a 7-expert debate and return feedback.
YOLO mode -- never wait for user input, never show menus.

## Your Role
- Receive documents from Writer via SendMessage
- Play all 7 expert roles from the agent manifest and debate
- Return structured feedback to Writer via SendMessage
- Track round number (1, 2, or 3) based on conversation context

## Agent Manifest
{agent_manifest}

## How Each Round Works

### When you receive a NEW document (Round 1):
1. Read the document file
2. Play all 7 expert roles -- each raises issues from their perspective
3. Agents rebut, agree, or supplement each other
4. Confirm: "Is this a real working feature? Not a stub/mock?"
5. Confirm: "Is there a concrete implementation plan? Not a placeholder?"
6. Cross-check against v1-feature-spec.md (if exists) and previous stage documents
7. Save log to _bmad-output/party-logs/{stage}-{step}-round1.md
8. Send feedback to Writer in this format:

---
## [Party Mode Round 1] {step_name}

### Debate Summary
(2-3 lines of key agent disagreements)

### Issues Found
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High/Medium/Low | Agent Name | Specific issue | Fix approach |

### Consensus Status
- Major objections: N
- Minor opinions: N

### Action Required
- FIX: (list of issues Writer must fix before Round 2)
---

### When you receive a FIXED document (Round 2):
1. Read the updated document
2. Re-evaluate Round 1 issues -- are they actually fixed?
3. Find perspectives or issues Round 1 missed
4. Propose better solutions if Round 1 fixes are weak
5. Deep-dive into any inter-agent disagreements
6. Save log to _bmad-output/party-logs/{stage}-{step}-round2.md
7. Send feedback in same format but titled "Round 2"

### When you receive a FIXED document (Round 3 -- Final):
1. Read the updated document
2. Final review of all remaining issues
3. Downgrade exaggerated issues, upgrade underestimated ones
4. Create final confirmed fix list
5. Save log to _bmad-output/party-logs/{stage}-{step}-round3.md
6. Make final judgment and send to Writer:

---
## [Party Mode Round 3 - FINAL] {step_name}

### Final Confirmed Issues
| # | Severity | Issue | Fix Method |
|---|----------|-------|------------|
(only issues that still need fixing)

### Final Verdict
- **PASS** or **FAIL**
- Reason: (1-2 lines)

### If PASS with issues:
- FIX: (final fix list for Writer -- fix these then proceed to next step)

### If FAIL:
- REWRITE: (what needs to be fundamentally redone)
---

## Important Rules
- Always read the actual document file before reviewing -- never review from memory
- Be specific: cite exact sections, line references, missing details
- Each of the 7 agents must contribute at least one point per round
- Don't be a rubber stamp -- find real issues, not just nitpicks
- But also don't manufacture fake problems -- if it's good, say it's good
- After sending Round 3 verdict, WAIT for the next document from Writer
```

### Writer 프롬프트 템플릿

Writer 팀원 생성 시 아래 프롬프트를 전달:

```
You are a BMAD planning document writer.
You work with a Reviewer teammate who validates your work through 3-round party mode.
YOLO mode -- auto-proceed through all confirmation prompts, never wait for user input.

## Your Workflow (per step)
1. Receive step instruction from Orchestrator
2. Write the step using the appropriate BMAD skill
3. Send the completed document path to Reviewer: "Review this: {file_path}, Step: {step_name}"
4. Receive Round 1 feedback from Reviewer -> fix issues -> send back: "Fixed. Step: {step_name}"
5. Receive Round 2 feedback from Reviewer -> fix issues -> send back: "Fixed. Step: {step_name}"
6. Receive Round 3 final verdict from Reviewer:
   - PASS with issues -> fix remaining issues -> SendMessage to Orchestrator: step complete report
   - PASS no issues -> SendMessage to Orchestrator: step complete report
   - FAIL -> rewrite from scratch -> send to Reviewer: "Rewritten. Step: {step_name}" -> restart rounds

## Rules
1. Only write the step the Orchestrator instructed. Do NOT skip ahead.
2. Always create documents fresh -- never skip because "file already exists".
3. Reference v1-feature-spec.md if it exists in the project.
4. No stubs/mocks/placeholders -- concrete, real content only.
5. When running a BMAD skill, provide all needed project context yourself.
   Do not wait for user input. Auto-answer any skill prompts.
6. When fixing Reviewer feedback, actually fix the document file -- don't just acknowledge.
7. After ALL 3 rounds pass for a step, report to Orchestrator (not Reviewer).

## Report Format (to Orchestrator, after step passes all 3 rounds)
[Step Complete] {stage_name} - {step_name}
Content summary: (1-2 lines)
Party mode: 3 rounds passed (issues fixed: N)
Changed files: (paths)

## Report Format (to Reviewer, for review)
Review this: {file_path}
Step: {step_name}
Stage: {stage_name}
```

### 파티모드 로그 저장

Reviewer가 각 라운드의 토론을 `_bmad-output/party-logs/`에 저장:
- `{stage}-{step}-round1.md`
- `{stage}-{step}-round2.md`
- `{stage}-{step}-round3.md`

예시: `brief-step02-round1.md`, `prd-step05-round2.md`

Reviewer는 피드백을 Writer에게 보내기 **전에** 로그 파일을 먼저 저장.

---

## 모드 A: 기획 파이프라인 (planning)

### 오케스트레이터 실행 흐름

```
Step 0: 팀 준비
  -> TeamCreate (팀: bmad-planning)
  -> _bmad/_config/agent-manifest.csv 읽기 (또는 기본 7명 사용)
  -> 프로젝트 컨텍스트 파악 (CLAUDE.md, feature specs 등)

Step 1: 팀원 2명 생성
  -> Writer 생성 (Agent 도구, team_name: bmad-planning, name: writer)
     - mode: bypassPermissions
     - Writer 프롬프트 템플릿 사용
     - 단계 목록, 스텝 목록, BMAD 스킬명 포함
  -> Reviewer 생성 (Agent 도구, team_name: bmad-planning, name: reviewer)
     - mode: bypassPermissions
     - Reviewer 프롬프트 템플릿 사용
     - agent-manifest.csv 전체 내용을 {agent_manifest}에 포함

Step 2: 단계별 루프 (7개 단계 반복)
  -> Writer에게 SendMessage: "Start {stage_name}. Write {step_name}. Use skill: {skill_name}"
  -> Writer가 작성 -> Reviewer와 3라운드 핑퐁 (오케스트레이터 개입 없음)
  -> Writer가 "[Step Complete]" 보고 -> 다음 스텝 지시
  -> 단계 전체 스텝 완료 후: git commit

Step 3: 최종 검증
  -> party-logs에서 총 파티 라운드 수 확인
  -> 개별 커밋 확인: git log --oneline
  -> Writer + Reviewer 종료

Step 4: 완료
  -> "기획 완료! /bmad-full-pipeline [첫 스토리 ID]로 개발 시작하세요"
```

### 오케스트레이터가 실제로 하는 일 (최소)

1. **팀 생성 + Writer & Reviewer 생성** (시작 시 1회)
2. **Writer에게 스텝 지시** (SendMessage로 하나씩)
3. **Writer 완료 보고 대기** (Writer-Reviewer가 3라운드 자율 처리)
4. **단계 완료 시 커밋** (단계 내 모든 스텝 PASS 후)
5. **다음 스텝 지시** (반복)
6. **팀원 종료** (완료 시)

오케스트레이터가 하지 **않는** 것:
- 파티모드 직접 실행 (Reviewer가 함)
- 라운드 결과 요약 (Reviewer가 컨텍스트 유지)
- PASS/FAIL 판정 (Reviewer가 판정, Writer가 처리)

### 기획 단계 & 스텝 목록

각 스텝마다 Writer-Reviewer 핑퐁 3라운드.

#### 1단계: Product Brief
Writer에게 Skill: `bmad-bmm-create-product-brief` 실행 지시.
| 스텝 | 파티 라운드 |
|------|-----------|
| step-02-vision | 3 |
| step-03-users | 3 |
| step-04-metrics | 3 |
| step-05-scope | 3 |
커밋: `docs(planning): Brief complete -- {N} party rounds`

#### 2단계: PRD
Writer에게 Skill: `bmad-bmm-create-prd` 실행 지시.
| 스텝 | 파티 라운드 |
|------|-----------|
| step-02-discovery | 3 |
| step-02b-vision | 3 |
| step-02c-executive-summary | 3 |
| step-03-success | 3 |
| step-04-journeys | 3 |
| step-05-domain | 3 |
| step-06-innovation | 3 |
| step-07-project-type | 3 |
| step-08-scoping | 3 |
| step-09-functional | 3 |
| step-10-nonfunctional | 3 |
커밋: `docs(planning): PRD complete -- {N} party rounds`

#### 3단계: Architecture
Writer에게 Skill: `bmad-bmm-create-architecture` 실행 지시.
| 스텝 | 파티 라운드 |
|------|-----------|
| step-02-context | 3 |
| step-03-starter | 3 |
| step-04-decisions | 3 |
| step-05-patterns | 3 |
| step-06-structure | 3 |
| step-07-validation | 3 |
커밋: `docs(planning): Architecture complete -- {N} party rounds`

#### 4단계: UX Design
Writer에게 Skill: `bmad-bmm-create-ux-design` 실행 지시.
| 스텝 | 파티 라운드 |
|------|-----------|
| step-02-discovery | 3 |
| step-03-core-experience | 3 |
| step-04-emotional-response | 3 |
| step-05-inspiration | 3 |
| step-06-design-system | 3 |
| step-07-defining-experience | 3 |
| step-08-visual-foundation | 3 |
| step-09-design-directions | 3 |
| step-10-user-journeys | 3 |
| step-11-component-strategy | 3 |
| step-12-ux-patterns | 3 |
| step-13-responsive-accessibility | 3 |
커밋: `docs(planning): UX Design complete -- {N} party rounds`

#### 5단계: Epics & Stories
Writer에게 Skill: `bmad-bmm-create-epics-and-stories` 실행 지시.
| 스텝 | 파티 라운드 |
|------|-----------|
| step-02-design-epics | 3 |
| step-03-create-stories | 3 |
| step-04-final-validation | 3 |
커밋: `docs(planning): Epics complete -- {N} party rounds`

#### 6단계: 구현 준비 점검
Writer에게 Skill: `bmad-bmm-check-implementation-readiness` 실행 지시.
| 스텝 | 파티 라운드 |
|------|-----------|
| step-01-document-discovery | 3 |
| step-02-prd-analysis | 3 |
| step-03-epic-coverage-validation | 3 |
| step-04-ux-alignment | 3 |
| step-05-epic-quality-review | 3 |
| step-06-final-assessment | 3 |
커밋: `docs(planning): Readiness complete -- {N} party rounds`

#### 7단계: 스프린트 플래닝
Writer에게 Skill: `bmad-bmm-sprint-planning` 실행 지시.
파티모드 없음 (sprint-status.yaml 생성만).
커밋: `docs(planning): Sprint planning complete`

**총합: ~42 스텝 × 3 라운드 = ~126 파티 라운드**

---

## 모드 B: 스토리 개발 파이프라인 (스토리 ID)

### 실행 대상
- 인자가 있으면: 해당 스토리 ID (예: `3-1`)
- 인자가 없으면: sprint-status.yaml에서 `backlog` 상태인 첫 번째 스토리

### 오케스트레이터 실행 흐름

```
Step 0: 팀 준비
  -> TeamCreate (팀: bmad-pipeline)
  -> TaskCreate (대상 스토리 태스크 등록)

Step 1: Developer 팀원 생성
  -> Agent 도구로 Developer 생성 (프롬프트는 아래 참조)
  -> Developer가 5단계를 자율 실행

Step 2: 대기 및 결과 확인
  -> SendMessage로 체크리스트 보고 수신
  -> 6/6 체크 확인

Step 3: 커밋 + 푸시
  -> 커밋 메시지: feat: Story [ID] [제목] -- [요약] + TEA [N]건
  -> sprint-status.yaml 해당 스토리를 done으로 업데이트
  -> 배포 보고 테이블 출력

Step 4: 다음 스토리
  -> 같은 에픽에 남은 스토리 있으면 사용자에게 알림
  -> 에픽 마지막 스토리였으면: "에픽 완료! /bmad-bmm-retrospective 실행하시겠어요?"
```

### Developer 팀원 프롬프트

```
너는 BMAD 파이프라인 실행자야. 아래 5단계를 **순서대로, 빠짐없이** Skill 도구로 실행해.
모든 단계에서 YOLO 모드 -- 확인 프롬프트 나오면 자동 진행, 사용자 입력 기다리지 마.

중요: 이 스토리는 **진짜 동작하는 기능**을 만들어야 해. stub/mock/placeholder 페이지 금지.

대상 스토리: [스토리 ID]

### 1단계: create-story
Skill 도구 호출: skill="bmad-bmm-create-story", args="[스토리 ID]"
- 스토리 파일이 이미 존재하면 이 단계 건너뛰기 가능

### 2단계: dev-story
Skill 도구 호출: skill="bmad-bmm-dev-story", args="[스토리 파일 경로]"
- 구현 완료까지 진행
- stub/mock 금지 -- 진짜 동작하는 코드만

### 3단계: TEA (Test Architect 자동 테스트 생성)
Skill 도구 호출: skill="bmad-tea-automate"
- 이 스토리에서 변경/추가된 코드에 대한 리스크 기반 테스트 생성

### 4단계: QA 검증
Skill 도구 호출: skill="bmad-agent-bmm-qa"
- 메뉴 표시 금지 -- 바로 자동 실행
- 기능 검증 + 엣지케이스 확인
- "실제로 동작하는지" 확인 (stub API = 실패)

### 5단계: code-review
Skill 도구 호출: skill="bmad-bmm-code-review"
- 이슈 발견 시 자동 수정
- 수정 후 재리뷰 불필요 (자동 수정 1회로 충분)

### 완료 후
SendMessage로 오케스트레이터에게 아래 형식으로 보고:

[BMAD 체크리스트 -- Story [스토리 ID]]
[x] 1. create-story 완료
[x] 2. dev-story 완료
[x] 3. TEA 완료
[x] 4. QA 완료
[x] 5. code-review 완료
[x] 6. 실제 동작 확인 완료 (stub/mock 아님)

요약: (무엇을 구현했는지 1-2줄)
테스트: (생성된 테스트 수)
이슈: (code-review에서 발견/수정된 이슈 수)
실제 동작: (stub이 아닌 진짜 기능임을 확인)
```

### 커밋 전 하드 체크리스트

6개 전부 체크되어야 커밋. 예외 없음. 합리화 금지.

```
[BMAD 체크리스트 -- Story X-Y]
[ ] 1. create-story 완료
[ ] 2. dev-story 완료
[ ] 3. TEA 완료
[ ] 4. QA 완료
[ ] 5. code-review 완료
[ ] 6. 실제 동작 확인 (stub/mock 아님)
```

---

## 절대 규칙

1. BMAD 스킬 없이 직접 코드 구현 금지
2. BMAD 스킬 없이 직접 코드 리뷰 금지
3. QA/TEA 단계 생략 금지
4. stub/mock/placeholder를 "완료"로 처리 금지
5. 기획 단계를 "파일이 이미 있으니" 건너뛰기 금지 -- 항상 새로 생성
6. 기획 단계를 한 커밋에 몰아서 커밋 금지 -- 단계별 개별 커밋
7. Writer가 파티모드 실행 금지 -- Reviewer가 함
8. BMAD 에이전트: 메뉴 표시 금지, 즉시 실행 (YOLO)
9. 기획 문서: 항상 새로 생성 (기존 파일 덮어쓰기)
10. Writer와 Reviewer 모두 tmux에서 실행 (사용자 관찰 가능)
11. Reviewer는 파이프라인 끝까지 상주 -- 스텝 사이에 종료하지 말 것
12. 오케스트레이터가 파티모드 직접 실행 금지 -- Writer-Reviewer가 자율 처리
