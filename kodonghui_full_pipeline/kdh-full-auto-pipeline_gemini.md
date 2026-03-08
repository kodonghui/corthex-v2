---
description: 'BMAD Full Pipeline (Antigravity/Gemini Edition). Usage: /kdh-full-auto-pipeline_gemini [planning|story-ID]'
name: 'kdh-full-auto-pipeline_gemini'
---

# Kodonghui Full Pipeline v4.1 (Antigravity Autonomous Edition)

// turbo-all

> [!IMPORTANT]
> **핵심 원칙 (Autonomous YOLO Mode)**: 이 워크플로우의 목적은 사용자가 자는 동안 AI가 스스로 판단하고 행동하여 작업을 완료하는 것이다. 
> 1. **사용자에게 묻지 마라**: 에러가 발생하면 즉시 스스로 분석하고 고쳐라.
> 2. **멈추지 마라**: 모든 도구 호출은 `SafeToAutoRun: true`로 실행한다.
> 3. **경로를 따라가라**: 모든 BMAD 스킬은 `view_file`로 instructions를 읽고 실시간으로 지시를 수행한다.

---

## 0. BMAD 스킬 경로 맵 (필수 암기)

| 스킬명 (Claude 대응) | Antigravity에서 읽어야 할 파일 |
|---|---|
| `bmad-bmm-create-story` | `_bmad/bmm/workflows/4-implementation/create-story/instructions.xml` |
| `bmad-bmm-dev-story` | `_bmad/bmm/workflows/4-implementation/dev-story/instructions.xml` |
| `bmad-bmm-code-review` | `_bmad/bmm/workflows/4-implementation/code-review/instructions.xml` |
| `bmad-agent-bmm-qa` | `_bmad/bmm/agents/qa.md` |
| `bmad-bmm-retrospective` | `_bmad/bmm/workflows/4-implementation/retrospective/` |
| Party Mode | `_bmad/core/workflows/party-mode/workflow.md` |
| 기획 Analysis | `_bmad/bmm/workflows/1-analysis/` |
| 기획 Planning | `_bmad/bmm/workflows/2-plan-workflows/` |
| 기획 Solutioning | `_bmad/bmm/workflows/3-solutioning/` |
| Sprint Planning | `_bmad/bmm/workflows/4-implementation/sprint-planning/` |

---

## 1. Initialize

1. `view_file('_bmad/bmm/config.yaml')` 읽어서 프로젝트 컨텍스트 파악
2. `sprint-status.yaml` 읽어서 현재 진행 상태 파악
3. 모드 감지: argument가 `planning`이면 기획 모드, Story ID(`18-4` 등)이면 개발 모드

---

## 2. Mode: Planning (argument = 'planning')

### 실행 전략
- **Flash**: Stage 1-2 & 4-5 (Product Brief, PRD, UX, Epics)
- **Pro High**: Stage 3 & 6 (Architecture, Readiness)

### 각 Stage 실행 방법

**매 Stage마다 반드시:**

1. 해당 Stage의 BMAD workflow 폴더에서 `view_file`로 instructions 읽기
2. instructions 안의 단계를 순서대로 실행
3. **Party Mode 3라운드 실행** (매 내부 스텝마다):
   - `view_file('_bmad/core/workflows/party-mode/workflow.md')` 먼저 읽기
   - Round 1 (Flash): 협업 브레인스톰 — 7명 전문가 역할극
   - Round 2 (Flash): 적대적 스트레스 테스트
   - Round 3 (Pro High): 최종 포렌식 검증 + PASS/FAIL 판정
   - 각 전문가 코멘트는 **최소 2-3문장**
   - FAIL 시 → 재작성 → 3라운드 재실행
4. Party log 파일 저장: `_bmad-output/party-logs/{stage}-round{N}.md`
5. **즉시 커밋 및 푸시** (run_command):
   ```
   git add -A && git commit -m "docs(planning): {Stage Name} complete -- {N} party modes" && git push
   ```

### 7명 전문가 (Party Mode)
- **John** (Senior Architect): 시스템 설계, 확장성
- **Winston** (Security Lead): 보안, 취약점
- **Sally** (UX Director): 사용자 경험, 접근성
- **Amelia** (QA Lead): 테스트 전략, 엣지 케이스
- **Quinn** (Performance Engineer): 성능, 최적화
- **Mary** (Product Manager): 비즈니스 가치, 우선순위
- **Bob** (DevOps Lead): 배포, 인프라, 운영

---

## 3. Mode: Story Dev (argument = Story ID)

### Phase 1: create-story [Flash]

```
view_file('_bmad/bmm/workflows/4-implementation/create-story/instructions.xml')
```

1. instructions.xml의 지시를 단계별로 따라 실행
2. 스토리 스펙 파일 생성: `_bmad-output/implementation-artifacts/{story-id}-{title}.md`
3. Party Mode 3라운드 실행 (위 규칙 동일)
4. 체크리스트 확인:
   ```
   view_file('_bmad/bmm/workflows/4-implementation/create-story/checklist.md')
   ```

### Phase 2: dev-story [Pro High / Parallel]

```
view_file('_bmad/bmm/workflows/4-implementation/dev-story/instructions.xml')
```

1. instructions.xml의 지시를 단계별로 따라 실행
2. **병렬 처리**: 독립적인 작업 식별 (schema + types 동시, API + UI 동시)
3. **NO STUBS/MOCKS** — 진짜 동작하는 코드만
4. 체크리스트 확인:
   ```
   view_file('_bmad/bmm/workflows/4-implementation/dev-story/checklist.md')
   ```

### Phase 3: TEA [Pro High]

1. `_bmad/tea/workflows/` 아래 워크플로우 읽기
2. 리스크 기반 자동 테스트 생성
3. 테스트 결과를 `_bmad-output/test-artifacts/tea-{story-id}.md`에 저장

### Phase 4: QA [Pro High]

```
view_file('_bmad/bmm/agents/qa.md')
```

1. qa.md의 에이전트 지시를 따라 실행
2. 기능 검증 + 엣지 케이스 확인
3. QA 결과를 `_bmad-output/test-artifacts/qa-{story-id}.md`에 저장
4. **BMAD 에이전트 메뉴 표시 금지** — 바로 자동 진행

### Phase 5: Code Review [Pro High]

```
view_file('_bmad/bmm/workflows/4-implementation/code-review/instructions.xml')
```

1. instructions.xml의 지시를 따라 코드 리뷰 실행
2. 이슈 발견 시 **즉시 자동 수정**
3. 체크리스트 확인:
   ```
   view_file('_bmad/bmm/workflows/4-implementation/code-review/checklist.md')
   ```

### Phase 6: Hard Checklist + Commit

**반드시 아래 형식을 텍스트로 출력** (notify_user 또는 메시지에 포함):

```
[BMAD 체크리스트 -- Story {ID}]
[x] 1. create-story 완료 (instructions.xml 따라 실행)
[x] 2. dev-story 완료 (instructions.xml 따라 실행)
[x] 3. TEA 완료 (리스크 기반 테스트 생성)
[x] 4. QA 완료 (qa.md 에이전트 실행)
[x] 5. code-review 완료 (instructions.xml 따라 실행)
[x] 6. 실제 동작 확인 (stub/mock 아님)
```

**모두 [x]가 아니면 커밋 금지.**

커밋 및 푸시 (run_command):
```
git add -A && git commit -m "feat: Story {ID} {title} -- {summary} + TEA {N} tests" && git push
```

`sprint-status.yaml`에서 해당 스토리 상태를 `done`으로 변경.

---

## 4. Epic 완료 시

```
view_file('_bmad/bmm/workflows/4-implementation/retrospective/')
```

retrospective 스킬의 지시를 따라 회고 실행.

---

## 5. 절대 금지 사항

- ❌ BMAD `instructions.xml`을 `view_file`로 읽지 않고 **직접 구현하는 것**
- ❌ BMAD `instructions.xml`을 `view_file`로 읽지 않고 **직접 코드 리뷰하는 것**
- ❌ TEA/QA 단계를 **요약 파일 작성만으로 대체하는 것**
- ❌ Hard Checklist를 **출력하지 않고 커밋하는 것**
- ❌ stub/mock/placeholder를 **"구현 완료"로 처리하는 것**
- ❌ 기획 단계를 "파일이 이미 있으니" **건너뛰는 것**
- ❌ 기획 단계를 **한 커밋에 몰아서 커밋하는 것**
- ❌ BMAD 에이전트 실행 시 **메뉴 보여주면서 사용자한테 선택하라고 하는 것**
- ❌ Party Mode에서 **전문가 코멘트를 1문장으로 쓰는 것** (최소 2-3문장)

---

## 6. Antigravity 특화 규칙

- **Worker = 나 자신**: TeamCreate 없음. 내가 오케스트레이터이자 Worker
- **task_boundary**: 각 Phase 전환 시 task_boundary 호출로 진행 상태 표시
- **병렬 도구 호출**: 독립적인 파일 편집은 동시에 call_multiple tools
- **Self-Healing**: 터미널 명령 실패 시 즉시 에러 분석 → 재시도
- **모든 run_command**: `SafeToAutoRun: true` (turbo-all 적용)
