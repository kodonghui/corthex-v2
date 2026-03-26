# ECC (Everything Claude Code) 완전 가이드

## ECC란?

ECC는 Claude Code에 설치하는 "확장팩" 같은 것입니다. 게임에 모드를 설치하면 새로운 기능이 추가되듯이, ECC를 설치하면 Claude Code가 훨씬 더 많은 일을 할 수 있게 됩니다.

기본 Claude Code는 코드를 읽고, 수정하고, 실행하는 능력이 있습니다. ECC가 더해지면 여기에 "전문가 팀", "자동 품질 검사", "기억력", "학습 능력" 등이 추가됩니다. 마치 혼자 일하던 사람이 갑자기 전문가 팀과 비서, 품질 관리자, 보안 담당자를 얻는 것과 같습니다.

ECC는 5가지 핵심 구성 요소로 이루어져 있습니다: 스킬(Skills), 에이전트(Agents), 명령어(Commands), 규칙(Rules), 훅(Hooks). 이 다섯 가지가 합쳐져서 Claude Code를 "단순한 코딩 도구"에서 "종합 개발 시스템"으로 바꿔줍니다.

---

## 구성 요소

### 1. Skills (스킬) -- 142개

스마트폰의 앱처럼, 특정 상황에서 쓸 수 있는 전문 지식 모음입니다. 요리할 때 레시피북을 참고하듯이, 특정 기술을 사용할 때 해당 스킬이 "이렇게 하면 됩니다"라고 상세한 안내를 제공합니다.

**주요 스킬 분류:**

| 분류 | 예시 | 설명 |
|------|------|------|
| 프로그래밍 언어 | python-patterns, rust-patterns, golang-patterns | 각 언어의 모범 사례와 패턴 모음 |
| 프레임워크 | springboot-patterns, laravel-patterns, django-patterns | 특정 프레임워크 사용법 |
| 테스트 | tdd-workflow, e2e-testing, python-testing | 테스트 작성 방법론 |
| 보안 | security-review, security-scan, django-security | 보안 점검 절차 |
| 디자인 | design-system, design-principles, premium-saas-design | UI/UX 디자인 가이드 |
| AI/자동화 | dream, continuous-learning-v2, autonomous-loops | 자율 학습과 자동화 |
| 프로젝트 관리 | blueprint, codebase-onboarding, project-guidelines-example | 프로젝트 설정 |
| 연구/분석 | deep-research, market-research, exa-search | 조사와 분석 |
| 콘텐츠 | article-writing, content-engine, crosspost | 글쓰기와 콘텐츠 제작 |
| 특수 도구 | fal-ai-media, video-editing, videodb | 미디어 처리 |

**특별한 스킬들:**

- **dream** -- 사람이 잠을 잘 때 기억이 정리되듯이, Claude도 "꿈"을 꿉니다. 세션에서 배운 것, 사용자의 선호, 중요한 결정을 정리해서 장기 기억에 저장합니다
- **continuous-learning-v2** -- 작업하면서 패턴을 발견하고 자동으로 학습합니다. 같은 실수를 반복하지 않기 위한 장치입니다
- **learned** -- 이미 학습한 패턴들의 저장소입니다. 예를 들어 "에이전트 이름 충돌 해결법", "오케스트레이터 중계 필수" 등 실제 경험에서 배운 것들이 저장되어 있습니다
- **configure-ecc** -- ECC 자체를 설정하는 스킬입니다
- **skill-stocktake** -- 설치된 스킬의 상태를 점검합니다

### 2. Agents (에이전트) -- 33개

회사의 전문 직원들입니다. 코드 검수, 보안 점검, 테스트 등 각자 전문 분야가 있습니다. 필요할 때 자동으로 또는 수동으로 불러서 일을 시킬 수 있습니다.

**핵심 에이전트:**

| 에이전트 | 역할 | 비유 |
|---------|------|------|
| **planner** | 구현 계획 수립 | 건축 설계사 -- 무엇을 어떻게 만들지 설계도를 그립니다 |
| **architect** | 시스템 설계 | 도시 계획가 -- 전체 구조와 연결을 설계합니다 |
| **tdd-guide** | 테스트 먼저 개발 | 품질 관리자 -- "먼저 검사 기준을 만들고, 그 다음에 제품을 만들자"고 합니다 |
| **code-reviewer** | 코드 리뷰 | 편집자 -- 코드를 읽고 문제점과 개선점을 찾습니다 |
| **security-reviewer** | 보안 분석 | 경비원 -- 보안 취약점을 찾아서 보고합니다 |
| **e2e-runner** | E2E 테스트 전문가 | 미스터리 쇼퍼 -- 실제 사용자처럼 앱을 사용해보고 문제를 찾습니다 |
| **refactor-cleaner** | 코드 정리 | 정리 전문가 -- 불필요한 코드를 제거하고 구조를 개선합니다 |
| **doc-updater** | 문서 업데이트 | 기록 담당자 -- 코드 변경에 맞춰 문서를 업데이트합니다 |
| **chief-of-staff** | 작업 조율 | 비서실장 -- 여러 작업의 우선순위를 정하고 조율합니다 |
| **loop-operator** | 자율 실행 관리 | 야간 당직자 -- 자율 실행 루프를 관리하고 감시합니다 |
| **synthesis-master** | 종합 분석 | 총괄 분석가 -- 여러 소스의 정보를 종합해서 결론을 냅니다 |

**언어별 전문 에이전트:**

| 에이전트 | 전문 분야 |
|---------|----------|
| typescript-reviewer | TypeScript 코드 리뷰 |
| python-reviewer | Python 코드 리뷰 |
| rust-reviewer / rust-build-resolver | Rust 코드 리뷰 / 빌드 오류 해결 |
| go-reviewer / go-build-resolver | Go 코드 리뷰 / 빌드 오류 해결 |
| java-reviewer / java-build-resolver | Java 코드 리뷰 / 빌드 오류 해결 |
| kotlin-reviewer / kotlin-build-resolver | Kotlin 코드 리뷰 / 빌드 오류 해결 |
| cpp-reviewer / cpp-build-resolver | C++ 코드 리뷰 / 빌드 오류 해결 |
| flutter-reviewer | Flutter 코드 리뷰 |
| database-reviewer | 데이터베이스 리뷰 |

**소크라테스(Socrates) 에이전트 -- 코드 리뷰 전문팀:**

| 에이전트 | 전문 분야 |
|---------|----------|
| socrates-functional | 기능 테스트 (A) -- 모든 기능이 제대로 동작하는지 확인 |
| socrates-visual | 시각적 테스트 (B) -- 화면이 제대로 보이는지 확인 |
| socrates-edge | 엣지케이스/보안 (C) -- 극단적 상황과 보안 문제 확인 |
| socrates-regression | 회귀 테스트 (D) -- 변경 후 기존 기능이 깨지지 않았는지 확인 |

### 3. Commands (명령어) -- 114개

리모컨의 버튼입니다. `/learn`을 누르면 학습, `/verify`를 누르면 검증이 실행됩니다. 한 단어로 복잡한 작업을 시작할 수 있습니다.

**핵심 명령어:**

| 명령어 | 설명 | 비유 |
|--------|------|------|
| **/plan** | 구현 계획 수립, 확인 전까지 코드 작성 안 함 | 설계도 그리기 |
| **/tdd** | 테스트 먼저 쓰고 코드 작성 | 시험 문제 먼저 출제하기 |
| **/verify** | 빌드, 타입 체크, 린트, 테스트, console.log 전수 검사 | 출하 전 품질 검사 |
| **/code-review** | 보안과 품질 종합 리뷰 | 교정 교열 |
| **/e2e** | Playwright로 E2E 테스트 생성/실행 | 실사용 테스트 |
| **/learn** | 세션에서 배운 패턴 추출/저장 | 오늘 배운 것 노트 정리 |
| **/save-session** | 현재 작업 상태를 파일로 저장 | 게임 저장 |
| **/resume-session** | 이전 세션 불러와서 이어하기 | 게임 로드 |
| **/checkpoint** | 중간 저장 포인트 생성/확인 | 세이브 포인트 |
| **/quality-gate** | ECC 품질 파이프라인 실행 | 품질 합격 판정 |

**빌드/테스트 명령어 (언어별):**

| 명령어 | 설명 |
|--------|------|
| /build-fix | 빌드 오류 자동 해결 |
| /cpp-build, /cpp-test, /cpp-review | C++ 빌드/테스트/리뷰 |
| /go-build, /go-test, /go-review | Go 빌드/테스트/리뷰 |
| /rust-build, /rust-test, /rust-review | Rust 빌드/테스트/리뷰 |
| /kotlin-build, /kotlin-test, /kotlin-review | Kotlin 빌드/테스트/리뷰 |
| /gradle-build | Gradle 빌드 |
| /python-review | Python 리뷰 |

**프로젝트 관리 명령어:**

| 명령어 | 설명 |
|--------|------|
| /projects | 프로젝트 상태 확인 |
| /plan | 구현 계획 수립 |
| /orchestrate | 여러 에이전트 조율 |
| /multi-plan, /multi-execute | 다중 작업 계획/실행 |
| /multi-frontend, /multi-backend | 프론트/백엔드 병렬 작업 |
| /context-budget | 대화 컨텍스트 예산 관리 |
| /update-docs | 문서 업데이트 |
| /update-codemaps | 코드맵 업데이트 |

**BMAD 프레임워크 명령어 (프로젝트 관리 방법론):**

| 명령어 | 설명 |
|--------|------|
| /bmad-help | BMAD 도움말 |
| /bmad-full-pipeline | 전체 파이프라인 실행 |
| /bmad-party-mode | 3명의 비평가가 동시에 검토 |
| /bmad-bmm-create-prd | 요구사항 문서 생성 |
| /bmad-bmm-create-story | 개발 스토리 생성 |
| /bmad-bmm-create-architecture | 아키텍처 문서 생성 |
| /bmad-bmm-code-review | 코드 리뷰 실행 |
| /bmad-bmm-sprint-status | 스프린트 상태 확인 |

**자율 실행/학습 명령어:**

| 명령어 | 설명 |
|--------|------|
| /loop-start | 자율 실행 루프 시작 |
| /loop-status | 자율 실행 상태 확인 |
| /evolve | 본능/규칙 진화 제안 |
| /instinct-status | 본능 상태 확인 |
| /instinct-export | 본능 내보내기 |
| /instinct-import | 본능 가져오기 |
| /learn-eval | 학습 결과 평가 |

**기타 유용한 명령어:**

| 명령어 | 설명 |
|--------|------|
| /refactor-clean | 불필요한 코드 정리 |
| /test-coverage | 테스트 커버리지 확인 |
| /prune | 사용하지 않는 코드/의존성 제거 |
| /promote | 코드 승격(스테이징->프로덕션) |
| /model-route | AI 모델 선택 가이드 |
| /skill-create | 새 스킬 만들기 |
| /skill-health | 스킬 상태 점검 |
| /rules-distill | 규칙 핵심 요약 |
| /docs | 문서 검색 |
| /pm2 | PM2 프로세스 관리 |
| /discuss-mode | 토론 모드 활성화 |
| /aside | 사이드 노트 작성 |
| /sessions | 세션 목록 확인 |
| /claw | OpenClaw 관련 명령 |
| /devfleet | 개발 함대 관리 |
| /eval | 평가 실행 |
| /harness-audit | 하니스 감사 |
| /prompt-optimize | 프롬프트 최적화 |

**CORTHEX 전용 파이프라인 명령어:**

| 명령어 | 설명 |
|--------|------|
| /kdh-full-auto-pipeline | 전체 자동화 파이프라인 (계획+개발+테스트) |
| /kdh-uxui-redesign-full-auto-pipeline | UX/UI 리디자인 자동화 파이프라인 |
| /kdh-code-review-full-auto | 코드 리뷰 자동화 (8단계) |

**UI 리뷰 명령어:**

| 명령어 | 설명 |
|--------|------|
| /libre-ui-review | UI 종합 리뷰 |
| /libre-ui-critique | UI 비평 |
| /libre-ui-modern | 현대적 UI 분석 |
| /libre-ui-responsive | 반응형 UI 검사 |
| /libre-ui-synth | UI 종합 분석 |
| /libre-a11y-audit | 접근성 감사 |

### 4. Rules (규칙) -- 65개

교통 법규처럼, 코드를 쓸 때 지켜야 할 약속입니다. 자동으로 적용되므로 하나하나 기억할 필요는 없습니다.

**구조:**

```
공통 규칙 (9개) -- 모든 언어에 적용
    코딩 스타일, 개발 흐름, Git, 보안, 테스트, 성능, 패턴, 훅, 에이전트

언어별 규칙 (각 5개씩, 11개 언어 = 56개)
    TypeScript, Python, Go, Rust, Java, Kotlin, Swift, C++, C#, PHP, Perl
    각 언어마다: 코딩 스타일, 패턴, 보안, 테스트, 훅
```

**핵심 원칙 요약:**

- 데이터를 직접 바꾸지 않기 (불변성) -- 복사본을 만들어서 수정
- 테스트 커버리지 80% 이상 -- 코드의 80%가 테스트로 검증
- 비밀 정보를 코드에 쓰지 않기 -- 환경 변수나 비밀 관리자 사용
- SQL 인젝션 방지 -- 매개변수화된 쿼리 필수
- 파일을 작게 유지 -- 800줄 이하, 함수는 50줄 이하
- 에러를 무시하지 않기 -- 모든 에러를 명시적으로 처리

상세 내용은 `learning-ECC/rules/ALL-RULES-GUIDE.md` 파일을 참고하세요.

### 5. Hooks (자동 실행) -- 22개

자동문처럼, 특정 상황이 되면 자동으로 작동합니다. 사용자가 신경 쓸 필요 없이 백그라운드에서 동작합니다.

**도구 사용 전 자동 실행 (PreToolUse) -- 11개:**

| 훅 | 설명 | 비유 |
|----|------|------|
| block-no-verify | git 훅을 건너뛰는 것을 차단 | 안전장치 해제 방지 |
| auto-tmux-dev | 개발 서버를 tmux에서 자동 시작 | 출근하면 컴퓨터 자동 켜기 |
| tmux-reminder | 오래 걸리는 명령에 tmux 사용 알림 | "이거 오래 걸리니 백그라운드에서 돌려" 알림 |
| git-push-reminder | git push 전에 변경사항 검토 알림 | 보내기 전 한번 더 확인 |
| doc-file-warning | 비표준 문서 파일 경고 | 잘못된 위치에 파일 쓰면 알림 |
| suggest-compact | 대화가 길어지면 압축 제안 | "메모리 정리할 때 됐어요" 알림 |
| continuous-learning | 도구 사용을 관찰하고 학습 | 작업 패턴 자동 기록 |
| insaits-security | AI 보안 모니터 (옵션) | 보안 감시 CCTV |
| governance-capture | 정책 위반 감지 (옵션) | 규정 준수 감사 |
| config-protection | 설정 파일 수정 차단 | "규칙을 약하게 바꾸지 마세요" 차단 |
| mcp-health-check | MCP 서버 상태 확인 | 외부 서비스 연결 확인 |

**도구 사용 후 자동 실행 (PostToolUse) -- 6개:**

| 훅 | 설명 | 비유 |
|----|------|------|
| pr-created | PR 생성 후 URL 기록 | 문서 제출 후 접수증 발급 |
| build-complete | 빌드 완료 후 분석 | 건축 후 검수 |
| quality-gate | 파일 수정 후 품질 검사 | 제품 출하 전 검사 |
| post-edit-format | JS/TS 파일 수정 후 자동 포맷 | 글쓴 후 맞춤법 검사 |
| post-edit-typecheck | TS 파일 수정 후 타입 검사 | 수정 후 호환성 확인 |
| console-warn | console.log 남아있으면 경고 | 디버그 흔적 감지 |

**세션/응답 관련 자동 실행 -- 5개:**

| 훅 | 설명 | 비유 |
|----|------|------|
| session-start | 세션 시작 시 이전 상태 로드 | 어제 업무 이어받기 |
| check-console-log | 응답 후 수정 파일의 console.log 검사 | 퇴근 전 마지막 점검 |
| session-end | 응답 후 세션 상태 저장 | 업무 일지 자동 작성 |
| evaluate-session | 세션에서 패턴 추출 가능성 평가 | "오늘 배운 것 있나?" 자동 확인 |
| cost-tracker | 토큰 사용량과 비용 추적 | 전기/수도 요금 계량기 |

---

## 어떻게 쓰나요?

### 자동으로 돌아가는 것 (신경 안 써도 됨)

이것들은 사용자가 아무것도 하지 않아도 백그라운드에서 자동으로 작동합니다:

- **세션 시작/종료 자동 기록** -- 시작하면 이전 상태를 불러오고, 끝나면 상태를 저장합니다
- **코드 포맷 자동 정리** -- 파일을 수정하면 자동으로 코드 스타일을 맞춰줍니다
- **타입 검사 자동 실행** -- TypeScript 파일을 수정하면 자동으로 타입 오류를 확인합니다
- **품질 게이트 자동 실행** -- 파일을 수정하면 자동으로 품질 검사를 합니다
- **console.log 자동 감지** -- 디버그용 코드가 남아있으면 자동으로 경고합니다
- **비용 추적** -- 토큰 사용량과 비용을 자동으로 기록합니다
- **학습 관찰** -- 작업 패턴을 자동으로 관찰하고 기록합니다
- **설정 파일 보호** -- 린터/포맷터 설정을 함부로 약화시키지 못하게 차단합니다
- **dream (메모리 정리)** -- 세션 사이에 학습한 내용을 정리해서 장기 기억에 저장합니다

### 직접 명령하는 것

필요할 때 직접 명령어를 입력해서 사용합니다:

| 상황 | 명령어 | 설명 |
|------|--------|------|
| 작업 시작 | `/resume-session` | 어제 하던 것 이어하기 |
| 계획 세우기 | `/plan` | 구현 계획 수립 |
| 기능 개발 | `/tdd` | 테스트 먼저 쓰고 개발 |
| 코드 완성 | `/verify` | 전체 검증 (빌드+타입+린트+테스트) |
| 코드 리뷰 | `/code-review` | 보안과 품질 점검 |
| E2E 테스트 | `/e2e` | 실제 사용자 흐름 테스트 |
| 배운 것 저장 | `/learn` | 패턴 추출해서 저장 |
| 작업 끝 | `/save-session` | 오늘 한 것 저장 |
| 빌드 오류 | `/build-fix` | 빌드 오류 자동 해결 |
| 코드 정리 | `/refactor-clean` | 불필요한 코드 제거 |
| 테스트 현황 | `/test-coverage` | 테스트 커버리지 확인 |

---

## 추천 일일 루틴

| 시간 | 뭐 하나 | 명령어 | 자동/수동 |
|------|---------|--------|----------|
| 작업 시작 | 어제 이어하기 | `/resume-session` | 수동 |
| 새 기능 시작 | 계획 세우기 | `/plan` | 수동 |
| 기능 개발 | 테스트 먼저 | `/tdd` | 수동 |
| 코드 수정 | 포맷 정리 | (자동) | 자동 |
| 코드 수정 | 타입 검사 | (자동) | 자동 |
| 코드 수정 | 품질 검사 | (자동) | 자동 |
| 코드 완성 | 전체 검증 | `/verify` | 수동 |
| 코드 완성 | 코드 리뷰 | `/code-review` | 수동 |
| 문제 해결 | 패턴 저장 | `/learn` | 수동 |
| 작업 끝 | 저장하기 | `/save-session` | 수동 |
| 작업 끝 | 비용 확인 | (자동 기록됨) | 자동 |
| 쉬는 시간 | 메모리 정리 | dream (자동) | 자동 |

---

## 전체 시스템 흐름도

```
사용자가 Claude Code 시작
    |
    v
[SessionStart 훅] -- 이전 세션 상태 자동 로드
    |
    v
사용자가 명령 입력 (예: /tdd로 새 기능 개발)
    |
    v
[PreToolUse 훅들] -- 보안 확인, 학습 관찰 등
    |
    v
Claude가 코드 작성/수정
    |
    v
[PostToolUse 훅들] -- 자동 포맷, 타입 체크, 품질 게이트
    |
    v
[규칙(Rules)] -- 코딩 규칙 자동 적용
    |
    v
필요 시 [에이전트(Agents)] 자동 호출 -- 코드 리뷰, 보안 점검 등
    |
    v
[Stop 훅] -- console.log 검사, 세션 저장, 패턴 평가, 비용 기록
    |
    v
사용자가 세션 종료
    |
    v
[SessionEnd 훅] -- 최종 정리
    |
    v
[dream] -- 메모리 정리 (비동기)
```

---

## 핵심 수치 요약

| 구성 요소 | 개수 | 역할 |
|----------|------|------|
| Skills (스킬) | 142개 | 전문 지식 모음 |
| Agents (에이전트) | 33개 | 전문가 직원 |
| Commands (명령어) | 114개 | 리모컨 버튼 |
| Rules (규칙) | 65개 | 코딩 약속 |
| Hooks (자동 실행) | 22개 | 자동 안전장치 |
| **합계** | **376개** | **종합 개발 시스템** |

---

## ECC 없이 vs ECC와 함께

| 상황 | ECC 없이 | ECC와 함께 |
|------|---------|-----------|
| 코드 포맷 | 수동으로 정리해야 함 | 자동으로 깔끔하게 정리됨 |
| 타입 오류 | 나중에 발견 | 수정 직후 바로 감지 |
| 보안 취약점 | 놓칠 수 있음 | 자동으로 감지+경고 |
| 테스트 | 잊기 쉬움 | TDD 가이드가 순서를 안내 |
| 세션 연속성 | 매번 처음부터 | 어제 하던 것 바로 이어하기 |
| 학습 | 같은 실수 반복 | 패턴을 자동 학습해서 재활용 |
| 코드 품질 | 사람이 직접 확인 | 자동 품질 게이트 |
| 빌드 오류 | 혼자 해결 | 언어별 전문 에이전트가 도움 |
| 비용 관리 | 알 수 없음 | 자동 추적/기록 |
