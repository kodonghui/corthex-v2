---
name: 'full-pipeline'
description: 'BMAD Full Pipeline. planning(brief->PRD->arch->UX->epics, 서브에이전트 파티모드) 또는 story dev(create->dev->TEA->QA->CR). 사용법: /bmad-full-pipeline [planning|스토리ID]'
---

# BMAD Full Pipeline

planning 모드 또는 story dev 모드.

## 모드 판별

- `planning` 또는 인자 없음: 기획 파이프라인 (brief -> PRD -> architecture -> UX -> epics)
- 스토리 ID (예: `3-1`): 스토리 개발 파이프라인 (create-story -> dev -> TEA -> QA -> CR)

---

## 서브에이전트 파티모드 (핵심 메커니즘)

BMAD의 대화형 파티모드(`bmad-party-mode` 스킬) 대신, **서브에이전트 방식**으로 완전 자동화.
매 스텝마다 **3 라운드 직렬 실행**. 사용자 입력 불필요 -- 완전 YOLO.

### 왜 서브에이전트를 쓰는가

- `bmad-party-mode` 스킬은 대화형 -> 매번 "Y" 눌러야 다음 진행
- 42 스텝 × 3 라운드 = 126번 "Y"는 비현실적
- 서브에이전트는 결과만 반환하고 종료 -> 입력 불필요
- 3개의 독립된 서브에이전트가 교차 검증 -> 할루시네이션 방지
- 오케스트레이터가 라운드 간 요약 정리 -> 방향 제어 + 중복 제거

### 흐름

```
Writer: 스텝 작성 완료 -> SendMessage로 보고

오케스트레이터: Agent 도구로 라운드1 실행 (foreground)
  -> 서브에이전트가 7명 역할극 토론 -> 이슈 테이블 반환

오케스트레이터: 라운드1 결과 정리 (중복 제거, 핵심 파악)

오케스트레이터: Agent 도구로 라운드2 실행
  입력: 문서 + 라운드1 요약
  -> 7명이 라운드1 결과를 보고 더 깊이 검토

오케스트레이터: 라운드1+2 결과 통합

오케스트레이터: Agent 도구로 라운드3 실행
  입력: 문서 + 라운드1+2 통합 요약
  -> 7명이 최종 검토 -> PASS/FAIL 판정

오케스트레이터: 판정에 따라 처리
  PASS + 이슈 있음 -> Writer에게 수정 지시 -> 다음 스텝으로
  PASS + 이슈 없음 -> 그대로 다음 스텝으로
  FAIL -> Writer에게 재작성 지시 -> 라운드1부터 재실행
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

### 서브에이전트 프롬프트 템플릿

#### 라운드 1

```
You are a BMAD multi-agent reviewer.
Play all 7 expert roles from the agent manifest below and debate.
Faithfully reflect each agent's communicationStyle, principles, and role.

## Agent Manifest
{agent_manifest}

## Review Target
File: {document_path}
Step: {step_name}

## Reference Documents (must cross-check)
- v1-feature-spec.md (if exists): does it cover the feature?
- Previous stage documents: is it consistent?

## Debate Rules
1. Each agent raises issues/concerns/improvements from their perspective
2. Agents may rebut, agree, or supplement each other
3. Confirm: "Is this a real working feature? Not a stub/mock?"
4. Confirm: "Is there a concrete implementation plan? Not a placeholder?"

## Output Format
### Debate Summary
(2-3 lines of key agent disagreements)

### Issues Found
| # | Severity | Raised By | Issue | Suggestion |
|---|----------|-----------|-------|------------|
| 1 | High/Medium/Low | Agent Name | Specific issue | Fix approach |

### Consensus Status
- Major objections: N
- Minor opinions: N
```

#### 라운드 2

```
You are a BMAD multi-agent reviewer (Round 2).
Play all 7 expert roles from the agent manifest below and debate.

## Agent Manifest
{agent_manifest}

## Review Target
File: {document_path}
Step: {step_name}

## Round 1 Results (Orchestrator Summary)
{round1_summary}

## This Round's Mission
1. Re-evaluate whether Round 1 issues are real problems
2. Find perspectives or issues Round 1 missed
3. Propose better solutions for Round 1 issues
4. Deep-dive into any inter-agent disagreements

## Output Format
(Same table format as Round 1)
```

#### 라운드 3

```
You are a BMAD multi-agent reviewer (Final Round).
Play all 7 expert roles from the agent manifest below and debate.

## Agent Manifest
{agent_manifest}

## Review Target
File: {document_path}
Step: {step_name}

## Round 1+2 Merged Results
{round1_2_summary}

## This Round's Mission (Final)
1. Final review of all issues so far
2. Downgrade exaggerated issues, upgrade underestimated ones
3. Create final confirmed fix list
4. Final judgment: "Can we proceed to the next stage as-is?"

## Output Format
### Final Confirmed Issues
| # | Severity | Issue | Fix Method |
|---|----------|-------|------------|

### Final Verdict
- PASS: can proceed after fixes / FAIL: rewrite needed
- Reason: (1-2 lines)
```

### 오케스트레이터가 각 라운드를 실행하는 구체적 절차

1. **문서 읽기**: Writer가 작성 완료한 문서를 Read 도구로 읽음
2. **agent-manifest.csv 읽기** (또는 기본 7명 사용)
3. **Agent 도구로 라운드1 호출** (foreground, background 아님)
   - `{agent_manifest}`, `{document_path}`, `{step_name}` 채워서 프롬프트 전달
   - 서브에이전트가 문서 읽고, 7명 역할극 수행, 이슈 테이블 반환
4. **라운드1 결과 요약** (중복 제거, 핵심 테마 정리)
5. **Agent 도구로 라운드2 호출**
   - `{round1_summary}`에 4번의 요약을 넣음
   - 서브에이전트가 심화 검토 반환
6. **라운드1+2 통합 요약** 작성
7. **Agent 도구로 라운드3 호출**
   - `{round1_2_summary}`에 6번의 통합 요약을 넣음
   - 서브에이전트가 최종 PASS/FAIL 판정 반환
8. **판정에 따라 처리**:
   - PASS + 이슈 -> Writer에게 SendMessage로 수정 지시 -> Writer 수정 후 다음 스텝
   - PASS + 이슈 없음 -> 바로 다음 스텝
   - FAIL -> Writer에게 SendMessage로 재작성 지시 -> 라운드1부터 재실행

### 파티모드 로그 저장

각 라운드 결과를 `_bmad-output/party-logs/`에 저장:
- `{stage}-{step}-round1.md`
- `{stage}-{step}-round2.md`
- `{stage}-{step}-round3.md`

예시: `brief-step02-round1.md`, `prd-step05-round2.md`

---

## 모드 A: 기획 파이프라인 (planning)

### 오케스트레이터 실행 흐름

```
Step 0: 팀 준비
  -> TeamCreate (팀: bmad-planning)
  -> TaskCreate (기획 단계별 태스크 등록)

Step 1: 준비
  -> _bmad/_config/agent-manifest.csv 읽기
  -> 기존 기획 문서 확인
  -> 프로젝트 컨텍스트 파악 (CLAUDE.md, feature specs 등)

Step 2: Writer 팀원 생성
  -> Agent 도구로 Writer 생성 (프롬프트는 아래 참조)

Step 3: 단계별 루프 (7개 단계 반복)
  -> 각 단계의 각 스텝에 대해:
     1. SendMessage로 Writer에게 지시: "{step_name} 작성해"
     2. Writer 완료 보고 대기
     3. 서브에이전트 파티모드 3라운드 실행
     4. PASS/FAIL 처리
     5. 다음 스텝으로
  -> 단계 전체 스텝 완료 후: git commit

Step 4: 최종 검증
  -> 총 파티 라운드 수 확인
  -> 개별 커밋 확인: git log --oneline
  -> Writer 종료

Step 5: 완료
  -> "기획 완료! /bmad-full-pipeline [첫 스토리 ID]로 개발 시작하세요"
```

### Writer 팀원 프롬프트

`Agent` 도구로 생성. `team_name` 지정, `mode: "bypassPermissions"`:

```
너는 BMAD 기획 문서 작성자야.
오케스트레이터가 지시하는 스텝을 하나씩 완성해.
YOLO 모드 -- 확인 프롬프트 자동 진행, 사용자 입력 기다리지 마.

## 규칙
1. 오케스트레이터가 지시한 스텝만 작성. 파티모드는 네가 실행하지 마.
2. 스텝 완성 후 SendMessage로 오케스트레이터에게 보고.
3. 문서는 항상 새로 생성 -- "파일이 이미 있으니 건너뛰기" 금지.
4. v1-feature-spec.md (_bmad-output/planning-artifacts/v1-feature-spec.md) 반드시 참조.
5. stub/mock/placeholder 금지 -- 구체적이고 실제적인 내용만.
6. BMAD 스킬 실행 시 필요한 컨텍스트를 직접 제공. 사용자 입력 기다리지 마.

## 보고 형식
[스텝 완료] {단계명} - {스텝명}
작성한 내용 요약: (1-2줄)
변경된 파일: (경로)
```

### 기획 단계 & 스텝 목록

각 스텝마다 서브에이전트 파티모드 3라운드 실행.

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
7. Writer(팀원)가 파티모드 실행 금지 -- 오케스트레이터만 서브에이전트로 실행
8. BMAD 에이전트: 메뉴 표시 금지, 즉시 실행 (YOLO)
9. 기획 문서: 항상 새로 생성 (기존 파일 덮어쓰기)
10. 파티모드 서브에이전트는 foreground 실행 (background 아님)
