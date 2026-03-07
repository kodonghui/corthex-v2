---
name: 'full-pipeline'
description: 'BMAD 풀 파이프라인. planning(brief->PRD->arch->UX->epics, 오케스트레이터 주도 파티모드) 또는 story dev(create->dev->TEA->QA->CR). 사용법: /bmad-full-pipeline [planning|스토리ID]'
---

# BMAD Full Pipeline

planning 모드 또는 story dev 모드.

## 모드 판별

- `planning` 또는 인자 없음: 기획 파이프라인 (brief -> PRD -> architecture -> UX -> epics)
- 스토리 ID (예: `3-1`): 스토리 개발 파이프라인 (create-story -> dev -> TEA -> QA -> CR)

---

## 모드 A: 기획 파이프라인 (planning)

### 핵심 원칙: 오케스트레이터 주도 파티모드
- **팀원은 문서만 작성**. 파티모드는 절대 팀원이 실행하지 않음.
- **오케스트레이터(메인 대화)가 직접** `Skill("bmad-party-mode")`를 호출.
- 이렇게 하면 파티모드 할루시네이션(가짜 실행) 방지.

### 전체 흐름 (스텝 단위 반복)

```
1. 오케스트레이터 -> 팀원: "Brief의 step-02-vision 완성해"
2. 팀원: 해당 스텝 작성 완료 -> SendMessage로 보고
3. 오케스트레이터: Skill("bmad-party-mode") 호출 #1 (YOLO)
4. 오케스트레이터: Skill("bmad-party-mode") 호출 #2 (YOLO)
5. 오케스트레이터: Skill("bmad-party-mode") 호출 #3 (YOLO)
6. 이슈 발견 -> 팀원에게 수정 지시 -> 수정 후 파티모드 재실행
7. 3회 통과 -> 팀원에게 다음 스텝 지시
8. 해당 단계 전체 스텝 완료 -> 커밋 -> 다음 단계로
```

### Step 0: 팀 준비
1. `TeamCreate` 팀 이름: `bmad-planning`
2. `TaskCreate` 기획 태스크 등록

### Step 1: 팀원 생성
`Agent` 도구로 팀원 생성. 아래 프롬프트 전달:

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

## 보고 형식
[스텝 완료] {단계명} - {스텝명}
작성한 내용 요약: (1-2줄)
변경된 파일: (경로)
```

### Step 2: 단계별 실행 (오케스트레이터가 직접 루프)

각 기획 단계에 대해 아래를 반복:

#### 단계 진행 방법:
1. 팀원에게 해당 Skill 실행 + 특정 스텝 작성 지시
2. 팀원 완료 보고 대기
3. **오케스트레이터가 직접** `Skill("bmad-party-mode")` 3회 호출
   - YOLO 모드 (자동 진행, 메뉴 없음)
   - 매번 확인: 실제 동작 기능인가? 구체적 구현 계획인가? v1 기능 커버하는가?
4. 이슈 발견 시: 팀원에게 수정 지시 -> 수정 완료 후 파티모드 재실행
5. 3회 모두 통과 -> 다음 스텝으로

#### 1. Product Brief
팀원에게 Skill: `bmad-bmm-create-product-brief` 실행 지시.
스텝별 파티모드 (오케스트레이터 실행):
- step-02-vision: 파티모드 x3
- step-03-users: 파티모드 x3
- step-04-metrics: 파티모드 x3
- step-05-scope: 파티모드 x3
합계: 파티모드 12회
완료 후: git commit `docs(planning): Brief complete -- 12 party modes`

#### 2. PRD
팀원에게 Skill: `bmad-bmm-create-prd` 실행 지시.
스텝별 파티모드 (오케스트레이터 실행):
- step-02-discovery: 파티모드 x3
- step-02b-vision: 파티모드 x3
- step-02c-executive-summary: 파티모드 x3
- step-03-success: 파티모드 x3
- step-04-journeys: 파티모드 x3
- step-05-domain: 파티모드 x3
- step-06-innovation: 파티모드 x3
- step-07-project-type: 파티모드 x3
- step-08-scoping: 파티모드 x3
- step-09-functional: 파티모드 x3
- step-10-nonfunctional: 파티모드 x3
합계: 파티모드 33회
완료 후: git commit `docs(planning): PRD complete -- 33 party modes`

#### 3. Architecture
팀원에게 Skill: `bmad-bmm-create-architecture` 실행 지시.
스텝별 파티모드 (오케스트레이터 실행):
- step-02-context: 파티모드 x3
- step-03-starter: 파티모드 x3
- step-04-decisions: 파티모드 x3
- step-05-patterns: 파티모드 x3
- step-06-structure: 파티모드 x3
- step-07-validation: 파티모드 x3
합계: 파티모드 18회
완료 후: git commit `docs(planning): Architecture complete -- 18 party modes`

#### 4. UX Design
팀원에게 Skill: `bmad-bmm-create-ux-design` 실행 지시.
스텝별 파티모드 (오케스트레이터 실행):
- step-02-discovery: 파티모드 x3
- step-03-core-experience: 파티모드 x3
- step-04-emotional-response: 파티모드 x3
- step-05-inspiration: 파티모드 x3
- step-06-design-system: 파티모드 x3
- step-07-defining-experience: 파티모드 x3
- step-08-visual-foundation: 파티모드 x3
- step-09-design-directions: 파티모드 x3
- step-10-user-journeys: 파티모드 x3
- step-11-component-strategy: 파티모드 x3
- step-12-ux-patterns: 파티모드 x3
- step-13-responsive-accessibility: 파티모드 x3
합계: 파티모드 36회
완료 후: git commit `docs(planning): UX Design complete -- 36 party modes`

#### 5. Epics & Stories
팀원에게 Skill: `bmad-bmm-create-epics-and-stories` 실행 지시.
스텝별 파티모드 (오케스트레이터 실행):
- step-02-design-epics: 파티모드 x3
- step-03-create-stories: 파티모드 x3
- step-04-final-validation: 파티모드 x3
합계: 파티모드 9회
완료 후: git commit `docs(planning): Epics complete -- 9 party modes`

#### 6. 구현 준비 점검
팀원에게 Skill: `bmad-bmm-check-implementation-readiness` 실행 지시.
스텝별 파티모드 (오케스트레이터 실행):
- step-01-document-discovery: 파티모드 x3
- step-02-prd-analysis: 파티모드 x3
- step-03-epic-coverage-validation: 파티모드 x3
- step-04-ux-alignment: 파티모드 x3
- step-05-epic-quality-review: 파티모드 x3
- step-06-final-assessment: 파티모드 x3
합계: 파티모드 18회
완료 후: git commit `docs(planning): Readiness complete -- 18 party modes`

#### 7. 스프린트 플래닝
팀원에게 Skill: `bmad-bmm-sprint-planning` 실행 지시.
-> sprint-status.yaml 생성
완료 후: git commit `docs(planning): Sprint planning complete`

### Step 3: 최종 검증
- 총 파티모드 횟수 확인 (~126회)
- 개별 커밋 7개 확인: `git log --oneline`
- 팀원 종료

### Step 4: 개발 안내
- "기획 완료! `/bmad-full-pipeline [첫 스토리 ID]`로 개발을 시작하세요"

---

## 모드 B: 스토리 개발 파이프라인 (스토리 ID)

### 실행 대상
- 인자가 있으면: 해당 스토리 ID (예: `3-1`)
- 인자가 없으면: sprint-status.yaml에서 `backlog` 상태인 첫 번째 스토리

### Step 0: 팀 준비
1. `TeamCreate`로 팀 생성 (이름: `bmad-pipeline`)
2. `TaskCreate`로 대상 스토리의 태스크 등록

### Step 1: 팀원에게 5단계 파이프라인 위임
`Agent` 도구로 팀원 생성. 아래 프롬프트를 **그대로** 전달:

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

### Step 2: 대기 및 결과 확인
- 팀원 작업 완료 대기
- SendMessage로 체크리스트 보고 수신
- 6/6 체크 확인 (실제 동작 확인 포함)

### Step 3: 커밋 + 푸시
- 체크리스트 6/6 확인 후 커밋 + 푸시
- 커밋 메시지: `feat: Story [ID] [스토리 제목] -- [구현 요약] + TEA [N]건`
- sprint-status.yaml 해당 스토리를 `done`으로 업데이트
- 배포 보고 테이블 출력

### Step 4: 다음 스토리 확인
- 같은 에픽에 남은 스토리가 있으면 사용자에게 알림
- 에픽의 마지막 스토리였으면: "에픽 완료! `/bmad-bmm-retrospective` 실행하시겠어요?" 안내
