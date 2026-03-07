# CLAUDE.md -- CORTHEX v2

## 사용자 정보
- 비개발자. 개발 용어 사용 금지. 쉽고 자세하게 설명할 것
- 항상 존댓말 사용

## 배포 규칙
- 완료 시 자동 커밋 + 푸시 (묻지 말 것)
- main push -> GitHub Actions 자동 배포 -> Cloudflare 캐시 퍼지
- 커밋 후 배포 보고: 빌드 번호(#N) + 변경 내용 + 확인 위치, 테이블 형식

## v1 기능 스펙 (최우선 참조)
- 경로: `_bmad-output/planning-artifacts/v1-feature-spec.md`
- v1에서 **실제로 동작했던** 모든 기능 포함
- **기획/설계/구현 모든 단계에서 이 문서를 참조할 것**
- 핵심 원칙: "v1에서 동작했으면 v2에서도 반드시 동작해야 한다"
- stub/mock/CRUD 페이지가 아닌 진짜 동작하는 기능을 만들 것

## v2 핵심 방향 (v1과 다른 점)
- 29명 고정이 아님 -- 관리자가 **부서/인간직원/AI직원을 자유롭게 생성-수정-삭제** 가능
- 동적 조직 관리가 핵심. 에이전트 수는 관리자가 결정

## BMAD 워크플로우 규칙 (절대 규칙 -- 위반 시 전체 작업 삭제)

### 기획 파이프라인 (brief -> PRD -> architecture -> UX -> epics)
`/bmad-full-pipeline planning`으로 실행. 모든 내부 스텝마다 파티모드 필수.

### 파티모드 규칙: 팀원 핑퐁 방식 (필수)
- **팀원 2명 구조**: Writer(팀원1) + Reviewer(팀원2)
- Writer가 문서 작성 -> Reviewer에게 전달 -> 3라운드 핑퐁 -> Writer가 오케스트레이터에게 보고
- Reviewer는 7명 전문가 역할극으로 토론 (agent-manifest.csv 기반)
- **오케스트레이터는 파티모드 직접 안 함** -- Writer-Reviewer가 자율적으로 처리
- 각 기획 단계의 내부 스텝마다 파티모드 3라운드 (총 ~126회)
- 파티모드는 YOLO 모드 (자동 진행, 메뉴 없음, 대기 없음)
- 파티모드에서 확인할 것:
  1. 실제 동작하는 기능인가? (stub/mock이 아닌가?)
  2. 구체적인 구현 계획이 있는가? (placeholder가 아닌가?)
  3. v1-feature-spec.md의 해당 기능을 커버하는가?
- PASS/FAIL은 Reviewer가 판정, Writer가 수정 처리
- 합의 기준: 주요 반대 의견 0개, 남은 의견이 모두 "사소한 것"일 때
- Reviewer는 파이프라인 끝까지 상주 (스텝 사이에 종료하지 말 것)

### 기획 파이프라인: 항상 새로 생성 (필수)
- 기획 파이프라인은 모든 문서를 **처음부터 새로** 만들 것
- 기존 기획 문서가 있어도 덮어쓰기 -- 건너뛰기 금지
- "파일이 이미 있다"는 건너뛸 이유가 아님

### 단계별 개별 커밋 (필수)
- 각 기획 단계 완료 후 즉시 커밋
- 커밋 메시지 형식: `docs(planning): {stage} complete -- {N} party rounds`
- 마지막에 한꺼번에 커밋하는 것 **금지**

### 스토리 개발 필수 순서 (하나도 빠짐없이 BMAD 스킬 호출)
매 스토리마다 아래 5단계를 **반드시 BMAD 스킬로** 실행할 것.

1. **create-story**: `bmad-bmm-create-story` 스킬 -> 스토리 파일 생성
2. **dev-story**: `bmad-bmm-dev-story` 스킬 -> 구현 (**stub/mock 금지, 진짜 동작하는 코드만**)
3. **TEA automate**: `bmad-tea-automate` 스킬 -> 리스크 기반 자동 테스트 생성
4. **QA 검증**: `bmad-agent-bmm-qa` 에이전트 -> 기능 검증 + 엣지케이스 확인
5. **code-review**: `bmad-bmm-code-review` 스킬 -> 코드 리뷰 (이슈 발견 시 자동 수정)

### 에픽 완료 시
- `bmad-bmm-retrospective` 스킬 실행 필수

### BMAD 에이전트 자동 실행 규칙
- BMAD 에이전트(QA 등) 실행 시 **메뉴 표시하지 말고 바로 작업 실행**할 것
- 에이전트에서 사용자 입력 기다리지 말 것 -- 알아서 자동 진행
- BMAD 워크플로우 내 확인/선택 프롬프트도 자동 진행 (YOLO 모드)

### 오케스트레이터 프로토콜 (TeamCreate 팀 위임)
메인 대화는 **오케스트레이터**. 실제 작업은 **TeamCreate로 생성한 팀원**이 한다.
팀원은 tmux 분할 창에서 실행되어 사용자가 실시간으로 관찰 가능.

**기획 파이프라인 실행:**
1. `TeamCreate`로 팀 생성
2. Writer(팀원1) + Reviewer(팀원2) 생성
3. Writer에게 스텝 하나씩 지시
4. Writer가 작성 -> Reviewer와 3라운드 핑퐁 (오케스트레이터 개입 없음)
5. Writer 완료 보고 -> 다음 스텝 지시
6. 단계 완료 -> 커밋 -> 다음 단계

**스토리 개발 실행:**
1. `TeamCreate`로 팀 생성
2. Developer(팀원) 생성 -> BMAD 5단계 전체를 지시
3. Developer가 직렬로 create-story -> dev -> TEA -> QA -> CR 실행 (tmux에서 보임)
4. 오케스트레이터는 대기 -- 완료 보고 오면 체크리스트 확인 -> 커밋+푸시

### 커밋 전 하드 체크리스트
매 스토리 커밋 직전, 아래 6개 항목을 출력. 전부 체크되어야만 커밋 가능:
```
[BMAD 체크리스트 -- Story X-Y]
[ ] 1. create-story 완료 (팀 에이전트 또는 스킬)
[ ] 2. dev-story 완료 (팀 에이전트 또는 스킬)
[ ] 3. TEA 완료 (팀 에이전트 또는 스킬)
[ ] 4. QA 완료 (팀 에이전트 또는 스킬)
[ ] 5. code-review 완료 (팀 에이전트 또는 스킬)
[ ] 6. 실제 동작 확인 (stub/mock 아님)
```
- 하나라도 미완료이면 커밋 금지. 빠진 단계를 먼저 실행할 것

### 절대 금지 사항
- BMAD 스킬 없이 직접 코드 구현하는 것
- BMAD 스킬 없이 직접 코드 리뷰하는 것
- QA/TEA 단계를 건너뛰는 것
- stub/mock/placeholder를 "구현 완료"로 처리하는 것
- 기획 단계를 "파일이 이미 있으니" 건너뛰는 것
- 기획 단계를 한 커밋에 몰아서 커밋하는 것
- **오케스트레이터가 파티모드를 직접 실행하는 것** -- Writer-Reviewer가 자율 핑퐁
- BMAD 에이전트 메뉴 보여주면서 사용자한테 선택하라고 하는 것

### Party Mode 실행 규칙 (매우 중요)
- **기획 파이프라인**: Writer-Reviewer 핑퐁으로 매 스텝 3라운드 (총 ~126회)
- Reviewer가 FAIL 판정 -> Writer 재작성 -> 3라운드 재실행
- 합의 기준: 주요 반대 의견이 0개
- Party Mode 없이 다음 단계로 넘어가려 하면 반드시 경고

## 작업 효율
- 기획은 Writer+Reviewer 2인 팀, 개발은 Developer 1인 팀 (tmux에서 관찰 가능)
- 오케스트레이터는 스텝 지시 + 커밋만 담당 (최소 역할)

## 코딩 컨벤션
- 파일명: kebab-case 소문자
- import 경로는 `git ls-files` 기준 실제 케이싱과 반드시 일치 (Linux CI 대소문자 구분)
- 컴포넌트명: PascalCase
- API 응답: `{ success: true, data }` / `{ success: false, error: { code, message } }`
- 테스트: bun:test (서버)
