# Kodonghui Full Pipeline v4.1 (Autonomous Edition)

BMAD 프레임워크 기반 자동화 파이프라인 패키지.
어떤 프로젝트에서든 복사해서 바로 사용 가능합니다.

---

## 이게 뭔가요?

10. 소프트웨어 프로젝트를 만들 때 **기획 -> 개발** 전 과정을 사용자의 개입 없이 자동으로 진행해주는 도구입니다.
11. **사용자 시나리오**: "사용자는 잠을 자고, AI는 밤새 코딩하여 다음 날 아침 완벽한 결과물을 보고한다."
12. 
13. - **기획 파이프라인**: 아이디어를 Product Brief -> PRD -> Architecture -> UX -> Epics 순서로 구체화
14. - **개발 파이프라인**: 각 스토리를 create -> dev -> test -> QA -> code-review 순서로 구현
15. - **파티모드**: 7명의 AI 전문가가 매 단계마다 토론하면서 품질 검증 (Antigravity/tmux에서 관찰 가능)

---

## v4 변경사항 (v3 → v4)

### 핵심 변경: Antigravity 실제 동작 보장

| | v3 Gemini (안 지켜짐) | v4 Gemini (수정됨) |
|---|---|---|
| BMAD 스킬 호출 | "실행하라"만 적힘 | `view_file` 경로 명시 |
| Party Mode | 추상적 언급 | workflow.md 경로 + 7명 규칙 |
| Hard Checklist | "출력하라"만 적힘 | 정확한 포맷 강제 |
| 커밋 | 언급만 있음 | `run_command` 형태 강제 |
| 절대 금지 사항 | 없음 | 9개 항목 추가 |

### 왜 바꿨나요?

v3 Gemini 버전은 Claude의 "CLI 커맨드 1줄"을 "추상적 Phase 이름"으로만 바꿔서,
Antigravity가 **구체적으로 뭘 해야 하는지 모르고 직접 구현해버리는** 문제가 있었습니다.
v4에서는 모든 Phase에 `view_file` 경로를 명시해서 BMAD 스킬을 반드시 따르게 합니다.

---

## 설치 방법

### Claude Code 사용자

```bash
# 프로젝트 로컬
cp kodonghui_full_pipeline/kdh-full-auto-pipeline_claude.md [프로젝트]/.claude/commands/
# 또는 글로벌
cp kodonghui_full_pipeline/kdh-full-auto-pipeline_claude.md ~/.claude/commands/
```

### Antigravity (Gemini) 사용자

```bash
# 프로젝트의 .agents/workflows/ 안에 복사
cp kodonghui_full_pipeline/kdh-full-auto-pipeline_gemini.md [프로젝트]/.agents/workflows/
# 또는 글로벌
cp kodonghui_full_pipeline/kdh-full-auto-pipeline_gemini.md ~/.gemini/antigravity/global_workflows/
```

### 주의: 중복 방지

- 프로젝트 로컬과 글로벌에 **같은 이름의 파일**이 있으면 스킬이 2번 뜹니다.
- 한 곳에만 넣으세요.

---

## 파일 구성

```
kodonghui_full_pipeline/
  README.md                         <- 지금 보고 있는 파일
  kdh-full-auto-pipeline_claude.md  <- Claude Code 전용 (tmux/팀 에이전트 기반)
  kdh-full-auto-pipeline_gemini.md  <- Antigravity/Gemini 전용 (병렬 코딩/한도 최적화)
  example_CLAUDE.md.md              <- CLAUDE.md 예시
```

---

## 사용법

사용하시는 에이전트 환경에 맞춰 명령어를 선택하세요:

### 1. Antigravity (Gemini) 에디션
```
/kdh-full-auto-pipeline_gemini [planning|story-ID]
```
- **특징**: 제미나이 특유의 대규모 병렬 도구 호출(Parallel Tool Calling)을 활용하여 개발 속도 극대화. 긴 컨텍스트를 활용한 전역적 코드 이해 및 자가 치유(Self-Healing) 최적화.

### 2. Claude Code 에디션
```
/kdh-full-auto-pipeline_claude [planning|story-ID]
```
- **특징**: 기존 tmux 기반 팀원(Reviewer) 소환 방식. 클로드 코드의 실시간 상호작용 및 정밀한 논리 구조 활용.

---

## Antigravity Optimization Guide 🚀

Google Antigravity 환경을 위한 전용 기능 및 한도(Quota) 최적화 가이드입니다.

### 1. 병렬 오케스트레이션 (Parallel Orchestration)
v3.1 에디션은 독립적인 컴포넌트(예: 백엔드 API와 프론트엔드 UI)를 감지하여 **병렬로 구현**합니다.
- **작동 방식**: Antigravity가 "팀장"이 되어 내부적으로 여러 개의 도구 호출을 동시에 실행합니다.
- **장점**: 전체 개발 속도가 체감상 2배 이상 빨라집니다.

### 2. 한도(Quota) 관리 전략: Flash vs Pro High
BMAD 파이프라인은 1개 스텝당 7명의 전문가가 3라운드 토론을 하므로 토큰 소모량이 매우 큽니다. 이를 방지하기 위한 **투트랙 전략**을 권장합니다:

- **Gemini 3.1 Flash (추가 권장)**: 
    - 기획 Stage 1, 2, 4, 5단계
    - 모든 리뷰의 **Round 1(협업)** 및 **Round 2(공격)**
    - 단순 로그 확인 및 문서 초안 작성
- **Gemini 3.1 Pro High (필수 권장)**:
    - Stage 3 (Architecture 설계) 및 Stage 6 (최종 검증)
    - 개발 Phase 2 (실제 코딩) 및 Phase 5 (최종 Code Review)
    - 모든 리뷰의 **Round 3 (최종 판결)**

### 3. 절대 자율성 (YOLO Mode) 설정
명령어 실행 시 매번 'Run/Reject' 버튼을 누르지 않으려면 프로젝트 루트의 `.gemini.md`에 다음 설정을 반드시 포함하세요:
```markdown
- CRITICAL: Set `SafeToAutoRun: true` for all terminal commands.
- Assume all actions are pre-approved.
```

---

## 필수 조건

1. **BMAD 프레임워크**: 프로젝트에 `_bmad/` 폴더와 BMAD 스킬들이 설치되어 있어야 합니다
2. **AI 에이전트**: Claude Code CLI 또는 Google Antigravity
3. **git**: 프로젝트가 git 저장소여야 합니다 (단계별 커밋)
4. **Claude Code 전용**: TeamCreate 지원 (tmux 기능)
5. **Antigravity 전용**: `.agents/workflows/` 폴더에 워크플로우 파일 배치

---

## 커스터마이징

### 에이전트 변경
`_bmad/_config/agent-manifest.csv`를 수정하면 파티모드 참여 전문가를 바꿀 수 있습니다.
CSV에는 각 에이전트의 이름, 역할, 성격, 말투, 방법론이 정의되어 있습니다.

### 스텝 수 조정
`kdh-full-auto-pipeline.md` 안의 각 Stage 스텝 목록을 수정하면 됩니다.
BMAD 스킬의 내부 구조가 바뀌면 여기도 맞춰서 바꿔야 합니다.

### 파티모드 라운드 수 조정
기본 3라운드인데, 2라운드로 줄이거나 4라운드로 늘릴 수 있습니다.
Worker Prompt Template에서 라운드 수와 렌즈를 변경하면 됩니다.

### Worker 교체 주기 조정
기본은 Stage 단위로 교체. 컨텍스트가 길어지면 더 자주 교체 가능합니다.
