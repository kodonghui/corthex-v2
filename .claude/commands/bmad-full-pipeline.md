---
name: 'full-pipeline'
description: 'BMAD 5단계 풀 파이프라인 실행. 스토리 하나를 create-story → dev-story → TEA → QA → code-review 까지 한 번에 처리. 사용법: /bmad-full-pipeline [스토리 ID, 예: 15-3]'
---

# BMAD Full Pipeline — 스토리 풀 파이프라인

사용자가 지정한 스토리(또는 스프린트 플랜에서 다음 스토리)에 대해 BMAD 5단계를 **한 번에** 실행하는 오케스트레이터 명령입니다.

## 실행 대상
- 인자가 있으면: 해당 스토리 ID (예: `15-3`)
- 인자가 없으면: sprint-status.yaml에서 `backlog` 상태인 첫 번째 스토리

## 오케스트레이터 프로토콜

아래 단계를 **정확히** 따를 것. 생략/합리화/단축 절대 금지.

### Step 0: 팀 준비
1. `TeamCreate`로 팀 생성 (이름: `bmad-pipeline`)
2. `TaskCreate`로 대상 스토리의 태스크 등록

### Step 1: 팀원에게 5단계 파이프라인 위임
`Agent` 도구로 팀원 생성. 아래 프롬프트를 **그대로** 전달:

```
너는 BMAD 파이프라인 실행자야. 아래 5단계를 **순서대로, 빠짐없이** Skill 도구로 실행해.
모든 단계에서 YOLO 모드 — 확인 프롬프트 나오면 자동 진행, 사용자 입력 기다리지 마.

대상 스토리: [스토리 ID]

### 1단계: create-story
Skill 도구 호출: skill="bmad-bmm-create-story", args="[스토리 ID]"
- 스토리 파일이 이미 존재하면 이 단계 건너뛰기 가능

### 2단계: dev-story
Skill 도구 호출: skill="bmad-bmm-dev-story", args="[스토리 파일 경로]"
- 구현 완료까지 진행

### 3단계: TEA (자동 테스트 생성)
Skill 도구 호출: skill="bmad-bmm-qa-generate-e2e-tests"
- 이 스토리에서 변경/추가된 코드에 대한 테스트 생성

### 4단계: QA 검증
Skill 도구 호출: skill="bmad-agent-bmm-qa"
- 메뉴 표시 금지 — 바로 자동 실행
- 기능 검증 + 엣지케이스 확인

### 5단계: code-review
Skill 도구 호출: skill="bmad-bmm-code-review"
- 이슈 발견 시 자동 수정
- 수정 후 재리뷰 불필요 (자동 수정 1회로 충분)

### 완료 후
SendMessage로 오케스트레이터에게 아래 형식으로 보고:

[BMAD 체크리스트 — Story [스토리 ID]]
[x] 1. create-story 완료
[x] 2. dev-story 완료
[x] 3. TEA 완료
[x] 4. QA 완료
[x] 5. code-review 완료

요약: (무엇을 구현했는지 1-2줄)
테스트: (생성된 테스트 수)
이슈: (code-review에서 발견/수정된 이슈 수)
```

### Step 2: 대기 및 결과 확인
- 팀원 작업 완료 대기
- SendMessage로 체크리스트 보고 수신
- 5/5 체크 확인

### Step 3: 커밋 + 푸시
- 체크리스트 5/5 확인 후 커밋 + 푸시
- 커밋 메시지: `feat: Story [ID] [스토리 제목] — [구현 요약] + TEA [N]건`
- sprint-status.yaml 해당 스토리를 `done`으로 업데이트
- 배포 보고 테이블 출력

### Step 4: 다음 스토리 확인
- 같은 에픽에 남은 스토리가 있으면 사용자에게 알림
- 에픽의 마지막 스토리였으면: "에픽 완료! `/bmad-bmm-retrospective` 실행하시겠어요?" 안내
