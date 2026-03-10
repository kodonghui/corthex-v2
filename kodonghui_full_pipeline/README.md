# Kodonghui Full Pipeline v3

BMAD 프레임워크 기반 자동화 파이프라인 패키지.
어떤 프로젝트에서든 복사해서 바로 사용 가능합니다.

---

## 이게 뭔가요?

소프트웨어 프로젝트를 만들 때 **기획 -> 개발** 전 과정을 자동으로 진행해주는 도구입니다.

- **기획 파이프라인**: 아이디어를 Product Brief -> PRD -> Architecture -> UX -> Epics 순서로 구체화
- **개발 파이프라인**: 각 스토리를 create -> dev -> test -> QA -> code-review 순서로 구현
- **파티모드**: 7명의 AI 전문가가 매 단계마다 토론하면서 품질 검증 (tmux에서 실시간 관찰 가능!)

---

## v3 변경사항 (v2 -> v3)

### 핵심 변경: 2인 체제 -> 1인 체제

| | v2 (Writer + Reviewer) | v3 (Worker 1명) |
|---|---|---|
| 팀원 수 | 2명 (Writer + Reviewer) | 1명 (Worker) |
| 메시지 전달 | 스텝당 8번 핸드오프 | 스텝당 2번 핸드오프 |
| 데드락 위험 | 높음 (SendMessage 누락) | 거의 없음 |
| 리뷰 품질 | 좋음 | 동일 (같은 모델, 같은 프롬프트) |
| tmux 가시성 | 3칸 (오케+Writer+Reviewer) | 2칸 (오케+Worker) |

### 왜 바꿨나요?

v2에서는 Writer가 문서를 Reviewer에게 보내고, Reviewer가 피드백을 Writer에게 보내는 **핑퐁 방식**이었습니다.
문제는 SendMessage가 간헐적으로 실패해서 파이프라인이 멈추는 현상이 반복됐습니다.

v3에서는 **Worker 1명이 작성 + 리뷰를 모두 처리**합니다.
핸드오프가 2번(오케스트레이터->Worker, Worker->오케스트레이터)이라 데드락 위험이 거의 없습니다.

### 리뷰 품질이 떨어지지 않나요?

아닙니다. 비교 분석 결과:
- 둘 다 같은 Claude 모델이 같은 프롬프트 템플릿으로 리뷰
- 구체적 라인 번호 참조, 실제 버그 발견, 에이전트 간 크로스톡 모두 동일
- "자기 리뷰"여도 3라운드 렌즈(협력->적대->검증)가 다른 관점을 강제함

---

## 설치 방법

### 방법 1: 프로젝트에 직접 복사 (권장)

```bash
# 기획+개발 파이프라인
cp kodonghui_full_pipeline/kdh-full-auto-pipeline.md [프로젝트]/.claude/commands/

# UXUI 리팩토링 파이프라인 (LibreUIUX 기반)
cp kodonghui_full_pipeline/kdh-libre-uxui-full-auto-pipeline.md [프로젝트]/.claude/commands/
```

### 방법 2: 글로벌 설치 (모든 프로젝트에서 사용)

```bash
cp kodonghui_full_pipeline/kdh-full-auto-pipeline.md ~/.claude/commands/
cp kodonghui_full_pipeline/kdh-libre-uxui-full-auto-pipeline.md ~/.claude/commands/
```

### 주의: 중복 방지

- 프로젝트 `.claude/commands/`와 글로벌 `~/.claude/commands/`에 **같은 이름의 파일**이 있으면 스킬이 2번 뜹니다.
- 한 곳에만 넣으세요.

---

## 사용법

Claude Code에서 아래 명령어를 입력하면 됩니다:

### 기획 시작
```
/kdh-full-auto-pipeline planning
```
-> Brief부터 Sprint Planning까지 전체 기획 파이프라인 실행

### 스토리 개발
```
/kdh-full-auto-pipeline 3-1
```
-> 스토리 3-1의 개발 파이프라인 실행 (create -> dev -> TEA -> QA -> CR)

### UXUI 리팩토링 (개발 완료 후, LibreUIUX 기반)
```
/kdh-libre-uxui-full-auto-pipeline foundation        <- 브랜드 가이드 수립 (1회)
/kdh-libre-uxui-full-auto-pipeline page chat          <- 특정 페이지 리팩토링
/kdh-libre-uxui-full-auto-pipeline batch 1            <- 1순위 페이지 전체 자동
/kdh-libre-uxui-full-auto-pipeline status             <- 진행 상황 확인
```

**UXUI 파이프라인 워크플로우:**
```
Phase A: Foundation (1회) — 7개 LibreUIUX 스킬 순차 실행
  A-1 brand-systems → A-2 jungian-archetypes → A-3 major-arcana →
  A-4 archetypal-combinations → A-5 design-principles →
  A-6 design-masters → A-7 design-movements
  → brand-guide.md 통합 문서 생성

Phase B: Per-Page (페이지마다 반복) — 5개 libre 명령어 순차 실행
  B-1 libre-ui-modern (생성) → B-2 libre-ui-critique (비평) →
  B-3 libre-ui-responsive (반응형) → B-4 libre-a11y-audit (접근성) →
  B-5 libre-ui-review (종합 7/10 이상이면 합격)
```

**사전 준비:**
- `.claude/commands/libre-*.md` — LibreUIUX 명령어 6개 설치
- LibreUIUX 내장 스킬 사용 가능 환경 (brand-systems, jungian-archetypes 등)

---

## 전체 구조 한눈에 보기

```
[기획 파이프라인]

사용자: "/kdh-full-auto-pipeline planning"
  |
  v
오케스트레이터(메인 대화)
  |
  |-- TeamCreate로 팀 생성
  |-- Worker(팀원 1명) 생성 (첫 번째 스텝 지시 포함)
  |
  v
[Stage 1: Product Brief]
  |
  |  Worker가 혼자서 모든 것을 처리:
  |
  |  1. step-02-vision 작성
  |  2. 자기 리뷰 라운드1 (7명 전문가 토론) -> 이슈 수정
  |  3. 자기 리뷰 라운드2 (적대적 검토) -> 이슈 수정
  |  4. 자기 리뷰 라운드3 (최종 판정) -> PASS/FAIL
  |  5. 오케스트레이터에게 완료 보고
  |
  |  오케스트레이터 -> Worker: "다음: step-03-users"
  |  (같은 과정 반복)
  |
  |  4개 스텝 전부 완료 -> Worker 종료 -> git commit
  |
  v
[Stage 2: PRD] (새 Worker 생성, 11개 스텝)
  v
[Stage 3: Architecture] (새 Worker 생성, 6개 스텝)
  v
[Stage 4: UX Design] (새 Worker 생성, 12개 스텝)
  v
[Stage 5: Epics & Stories] (새 Worker 생성, 3개 스텝)
  v
[Stage 6: Implementation Readiness] (새 Worker 생성, 6개 스텝)
  v
[Stage 7: Sprint Planning]
  v
기획 완료! (~126 파티 라운드)
```

```
[개발 파이프라인]

사용자: "/kdh-full-auto-pipeline 3-1"
  |
  v
오케스트레이터
  |-- TeamCreate로 팀 생성
  |-- Developer(팀원) 생성 (스토리 ID + 5단계 전체 지시 포함)
  |
  v
Developer가 5단계 자동 실행:
  1. create-story  (스토리 파일 생성)
  2. dev-story     (코드 구현)
  3. TEA           (자동 테스트 생성)
  4. QA            (기능 검증)
  5. code-review   (코드 리뷰 + 자동 수정)
  |
  v
Developer -> 오케스트레이터: 체크리스트 보고
  |
  v
오케스트레이터: 6/6 확인 -> git commit + push
```

---

## 파티모드 상세 설명

### 파티모드가 뭔가요?

문서를 작성한 후, 7명의 AI 전문가가 각자의 관점에서 그 문서를 검토하는 과정입니다.
실제로 7명이 있는 건 아니고, AI가 7명의 역할을 번갈아 맡으면서 토론합니다.

### v3 방식: Worker 자기 리뷰 (tmux 실시간 관찰)

Worker 1명이 문서를 작성한 뒤, **자기가 쓴 문서를 자기가 리뷰**합니다.
"자기 리뷰"라고 해서 허술한 게 아닙니다:

1. 매 라운드 **파일에서 다시 읽음** (기억으로 리뷰하지 않음)
2. 라운드마다 **다른 렌즈** 적용 (협력 -> 적대 -> 검증)
3. 7명 전문가가 **크로스톡** (서로를 이름으로 참조하며 토론)
4. **최소 이슈 수** 강제 (라운드1: 2개 이상, 라운드2: 1개 이상 새 이슈)

| | v2 (2인 핑퐁) | v3 (1인 자기 리뷰) |
|---|---|---|
| 파티모드 과정 | tmux 2칸에서 보임 | tmux 1칸에서 보임 |
| 핸드오프 | Writer<->Reviewer 8번 | 없음 (혼자 처리) |
| 데드락 위험 | 있음 | 없음 |
| 리뷰 품질 | 좋음 | 동일 |
| 라운드 간 연결 | Reviewer가 기억 | Worker가 기억 (같은 컨텍스트) |

### 7명의 전문가

| 이름 | 역할 | 뭘 보는가? |
|------|------|-----------|
| John (PM) | 기획자 | 사용자 가치, 빠진 요구사항, 우선순위 |
| Winston (Architect) | 설계자 | 기술적 모순, 구현 가능성, 확장성 |
| Sally (UX Designer) | UX | 사용자 경험, 접근성, 흐름 |
| Amelia (Developer) | 개발자 | 구현 난이도, 기술 부채, 테스트 가능성 |
| Quinn (QA) | 품질 | 놓친 케이스, 테스트 범위, 품질 위험 |
| Mary (Analyst) | 분석가 | 비즈니스 가치, 시장 적합성, 투자 대비 효과 |
| Bob (Scrum Master) | 일정 관리 | 범위, 의존성, 일정 위험 |

각 전문가는 `_bmad/_config/agent-manifest.csv`에 정의된 **고유한 성격, 말투, 방법론**을 가지고 있습니다.
프로젝트에 이 파일이 있으면 그 파일의 에이전트를 사용하고, 없으면 위 기본 7명을 사용합니다.

### 3라운드 자기 리뷰 과정

```
Worker: step 작성 완료
  |
[라운드 1] 협력적 리뷰 (Collaborative Lens)
  - Worker가 파일에서 자기 문서를 다시 읽음
  - 7명이 각자 관점에서 이슈 제기 (최소 2개)
  - 이슈 수정 -> 로그 저장
  |
[라운드 2] 적대적 리뷰 (Adversarial Lens)
  - Worker가 수정된 문서를 파일에서 다시 읽음
  - 7명이 "문제가 있다고 가정"하고 빠진 것을 찾음
  - 라운드1이 놓친 새 이슈 발견 (최소 1개)
  - 이슈 수정 -> 로그 저장
  |
[라운드 3] 최종 판정 (Forensic Lens)
  - Worker가 최종 문서를 파일에서 다시 읽음
  - 모든 이슈 심각도 재조정 (과장된 건 낮추고, 과소평가된 건 올림)
  - 품질 점수 (10점 만점) + PASS/FAIL 판정
  - 로그 저장
  |
PASS -> 오케스트레이터에게 완료 보고
FAIL -> 처음부터 재작성 -> 3라운드 재실행
```

### tmux에서 보는 방법

파이프라인 실행 중 tmux 창이 2개로 나뉩니다:

```
+-------------------+-------------------+
|                   |                   |
|  오케스트레이터    |  Worker (팀원)    |
|  (메인 대화)       |  문서 작성       |
|                   |  자기 리뷰 토론   |
|  - 스텝 지시       |  이슈 수정       |
|  - 커밋 관리       |  모든 과정이      |
|                   |  실시간으로 보임!  |
|                   |                   |
+-------------------+-------------------+
```

- **Ctrl+B -> 방향키**: 창 이동
- **Ctrl+B -> Ctrl+방향키**: 창 크기 조절

---

## 역할 분담

### 오케스트레이터 (메인 대화) -- 최소 역할
- 팀 생성 (TeamCreate) + Worker 1명 생성
- Worker에게 스텝별 지시 (첫 스텝은 spawn 프롬프트에, 이후는 SendMessage)
- Worker 완료 보고 수신 -> 다음 스텝 지시
- Worker가 멈추면 리마인더 전송
- 단계(Stage) 완료 시 git commit
- 단계 간 Worker 교체 (종료 -> 새로 생성)

### Worker (팀원) -- 모든 실무 담당
- 오케스트레이터 지시대로 문서 작성
- 자기 리뷰 3라운드 (7명 전문가 역할극)
- 매 라운드 로그를 `_bmad-output/party-logs/`에 저장
- 이슈 발견 시 직접 문서 수정
- 3라운드 PASS 후 오케스트레이터에게 완료 보고

---

## 파일 구성

```
kodonghui_full_pipeline/
  README.md                              <- 지금 보고 있는 파일
  kdh-full-auto-pipeline.md               <- 기획+개발 파이프라인 커맨드
  kdh-libre-uxui-full-auto-pipeline.md    <- UXUI 리팩토링 파이프라인 커맨드 (LibreUIUX 기반)
  example_CLAUDE.md.md                    <- CLAUDE.md 예시 (프로젝트에 맞게 수정)
```

---

## 필수 조건

1. **BMAD 프레임워크**: 프로젝트에 `_bmad/` 폴더와 BMAD 스킬들이 설치되어 있어야 합니다
2. **Claude Code**: Claude Code CLI에서 실행해야 합니다
3. **git**: 프로젝트가 git 저장소여야 합니다 (단계별 커밋)
4. **TeamCreate 지원**: Claude Code가 팀(tmux) 기능을 지원해야 합니다

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
