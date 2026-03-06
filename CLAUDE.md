# CLAUDE.md — CORTHEX v2

## 사용자 정보
- 비개발자. 개발 용어 사용 금지. 쉽고 자세하게 설명할 것
- 항상 존댓말 사용

## 배포 규칙
- 작업 완료 시 커밋 + 푸시까지 자동으로 (매번 물어보지 말 것)
- main 푸시 → GitHub Actions 자동 배포 → Cloudflare 캐시 자동 퍼지
- 커밋 후 배포 보고: 빌드 번호(#N) + 변경 내용 + 확인 위치를 표로 정리

## BMAD 워크플로우 규칙 (절대 규칙 — 위반 시 전체 작업 삭제)

### 스토리 개발 필수 순서 (하나도 빠짐없이 BMAD 스킬 호출)
매 스토리마다 아래 5단계를 **반드시 BMAD 스킬로** 실행할 것. 직접 구현/리뷰/테스트 절대 금지.

1. **create-story**: `bmad-bmm-create-story` 스킬 → 스토리 파일 생성
2. **dev-story**: `bmad-bmm-dev-story` 스킬 → 구현
3. **TEA automate**: `bmad-bmm-qa-generate-e2e-tests` 스킬 → 자동 테스트 설계+생성
4. **QA 검증**: `bmad-agent-bmm-qa` 에이전트 → 기능 검증 + 엣지케이스 확인
5. **code-review**: `bmad-bmm-code-review` 스킬 → 코드 리뷰 (이슈 발견 시 자동 수정)

### 에픽 완료 시
- `bmad-bmm-retrospective` 스킬 실행 필수

### BMAD 에이전트 자동 실행 규칙
- BMAD 에이전트(QA 등) 실행 시 **메뉴 표시하지 말고 바로 작업 실행**할 것
- QA 에이전트 → 메뉴 안 보여주고 바로 [QA] Automate 실행
- 에이전트에서 사용자 입력 기다리지 말 것 — 알아서 자동 진행
- BMAD 워크플로우 내 확인/선택 프롬프트도 자동 진행 (YOLO 모드)

### 절대 금지 사항
- BMAD 스킬 없이 직접 코드 구현하는 것
- BMAD 스킬 없이 직접 코드 리뷰하는 것
- QA/TEA 단계를 건너뛰는 것
- 어떤 상황에서도 (YOLO 모드, 컨텍스트 압축, 빨리 해, 자러간다 등) 이 순서를 생략하지 말 것
- "이미 내용을 알고 있으니 스킬 안 써도 된다"는 판단 금지
- BMAD 에이전트 메뉴 보여주면서 사용자한테 선택하라고 하는 것

### 일반 규칙
- 새 기능/프로젝트 기획 시 `_bmad-output/BMAD-WORKFLOW.md`의 단계를 반드시 따를 것

### Party Mode 실행 규칙 (매우 중요)
- 아래 5개 시점에서 Claude가 스스로 `/party-mode`를 실행할 것 (사용자가 요청하지 않아도):
  1. Product Brief 완성 후
  2. PRD 완성 후
  3. Architecture + UX 설계 완성 후
  4. 개발 시작 직전
  5. Epic(기능 묶음) 하나 완료마다
- Party Mode는 **합의가 날 때까지 반복 실행**할 것:
  - 에이전트들이 문제/우려사항을 제기하면 → 문서 수정 → Party Mode 재실행
  - 모든 에이전트가 "다음 단계로 진행해도 됩니다" 또는 이견 없음 상태가 될 때까지 반복
  - 합의 기준: 주요 반대 의견이 0개, 또는 남은 의견이 모두 "사소한 것"으로 분류될 때
- Party Mode 없이 다음 단계로 넘어가려 하면 반드시 경고하고 Party Mode를 먼저 실행할 것

## 작업 효율
- 독립적인 작업이 여러 개일 때 팀 에이전트(Agent 도구)를 적극 활용하여 병렬 처리할 것
- 코드 조사, 파일 탐색, 테스트 실행 등을 서브에이전트에 위임해서 시간을 줄일 것

## 코딩 컨벤션
- 파일명은 kebab-case 소문자. import 경로는 `git ls-files` 기준 실제 케이싱과 반드시 일치시킬 것 (Linux CI 대소문자 구분)
- 유일한 예외: Nexus 컴포넌트 (`AgentNode.tsx` 등 PascalCase, git도 PascalCase)
