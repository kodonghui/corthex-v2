# 08. CORTHEX v2 프로젝트에 팀 에이전트 적용 전략

## 현재 상태 분석

### 지금 쓰고 있는 패턴 (kdh-full-auto-pipeline)

```
현재:
┌──────────────────────────────────────────────┐
│  Orchestrator (팀장)                          │
│  └── Worker 1명 (tmux)                        │
│      └── 혼자서 모든 BMAD 스킬 순차 실행         │
│          - create-story                       │
│          - dev-story                          │
│          - TEA (테스트)                        │
│          - QA                                 │
│          - Code Review                        │
│      └── 혼자서 3라운드 파티 모드 (자기 검증)      │
└──────────────────────────────────────────────┘

문제점:
1. 파티 모드가 "가짜" — 같은 에이전트가 역할극
2. Worker 1명이 순차 실행 — 병렬화 없음
3. Worker가 죽으면 처음부터 다시
```

### 팀 에이전트로 바꾸면?

```
개선안:
┌──────────────────────────────────────────────┐
│  Orchestrator (팀장)                          │
│  ├── PM 팀원 (독립 프로세스)                    │
│  │   └── 제품 관점 리뷰, 사용자 여정 검증         │
│  ├── Architect 팀원 (독립 프로세스)              │
│  │   └── 기술 아키텍처 리뷰, 실현 가능성 검증      │
│  ├── QA 팀원 (독립 프로세스)                     │
│  │   └── 테스트 관점 리뷰, 엣지 케이스 발굴       │
│  └── Dev 팀원 (독립 프로세스)                    │
│      └── 실제 구현                              │
│                                               │
│  PM↔Arch↔QA: 서로 직접 토론 (진짜 파티!)         │
│  → 합의 후 Dev가 구현 → QA가 검증               │
└──────────────────────────────────────────────┘
```

## 적용 시나리오별 전략

### 시나리오 1: Planning Pipeline (기획)

**현재**: 1명이 brief→PRD→arch→UX→epics 순차 실행 + 혼자 자기검증 3라운드

**개선안**: 3명이 진짜 토론

```
팀 구성:
- pm-expert: 제품 전문가 (Sonnet)
- arch-expert: 아키텍처 전문가 (Sonnet)
- writer: 실제 문서 작성자 (Opus)

흐름:
1. writer가 PRD 초안 작성
2. pm-expert에게 "이 PRD 리뷰해줘" DM
3. arch-expert에게 "이 PRD 리뷰해줘" DM
4. pm-expert ↔ arch-expert 서로 의견 교환 (직접 DM!)
5. 두 리뷰어가 각각 writer에게 피드백 DM
6. writer가 수정 → 다시 리뷰 요청
7. 3라운드 반복 → 합의 도달
8. 팀장에게 최종 보고

장점:
- 진짜 다른 "뇌"가 검토 → 맹점 발견↑
- 동시 리뷰 → 시간 단축
- pm과 arch가 서로 토론 → 더 깊은 분석
```

### 시나리오 2: Story Development (개발)

**현재**: 1명이 create→dev→TEA→QA→CR 순차 5단계

**개선안**: 개발과 테스트 병렬화

```
팀 구성:
- developer: 구현 담당 (Opus)
- tester: TEA + QA 담당 (Sonnet)
- reviewer: 코드 리뷰 담당 (Sonnet)

흐름:
1. 팀장: create-story 실행 (스토리 파일 생성)
2. developer: dev-story 실행 (구현)
3. developer 완료 → tester에게 DM "구현 끝. 이 파일들 테스트해줘"
4. tester: TEA + QA 동시 실행
5. tester → reviewer에게 DM "테스트 결과 이거야, 코드 리뷰해줘"
6. reviewer: 코드 리뷰 + 자동 수정
7. 문제 발견 시 developer에게 DM "이거 고쳐야 해"
8. 전원 완료 → 팀장에게 보고

장점:
- tester가 테스트 작성하는 동안 reviewer가 코드 리뷰 시작 가능
- 문제 발견 시 developer에게 바로 DM (팀장 거치지 않음)
- 각자 전문 영역에 집중
```

### 시나리오 3: 다중 스토리 병렬 개발 ⭐ (가장 임팩트 큼)

```
팀 구성 (5명):
- story-dev-1: Epic 1의 Story 1 담당
- story-dev-2: Epic 1의 Story 2 담당
- story-dev-3: Epic 1의 Story 3 담당
- integrator: 통합 테스트 담당
- reviewer: 크로스-스토리 리뷰

각 developer:
  → Git Worktree에서 독립 작업 (파일 충돌 없음!)
  → 완료 시 integrator에게 알림
  → integrator: 머지 + 통합 테스트
  → reviewer: 전체 코드 리뷰

효과:
  3개 스토리를 동시 개발 → 시간 1/3로 단축!
```

### 시나리오 4: 아키텍처 의사결정 디베이트

```
"D17: 캐시 전략으로 Redis vs In-Memory 중 뭘 쓸까?"

팀 구성:
- redis-advocate: Redis 찬성론자
- inmem-advocate: In-Memory 찬성론자
- moderator: 중재자 (양쪽 의견 정리)

흐름:
1. 양쪽이 각각 우리 프로젝트 분석
2. 서로 DM으로 3라운드 토론
3. moderator가 양쪽 의견 정리
4. 팀장에게 최종 비교표 + 추천안 보고
```

## Pipeline v5 구상: 팀 에이전트 기반

```
kdh-full-auto-pipeline v5 (구상)

Planning 모드:
┌─────────────────────────────────────────┐
│  Stage: PRD                             │
│  ├── writer (Opus): 초안 작성             │
│  ├── pm-reviewer (Sonnet): 제품 리뷰      │
│  └── tech-reviewer (Sonnet): 기술 리뷰    │
│  → 3자 토론 → 합의 → 커밋                 │
├─────────────────────────────────────────┤
│  Stage: Architecture                     │
│  ├── writer (Opus): 아키텍처 문서 작성      │
│  ├── security-reviewer: 보안 리뷰          │
│  └── perf-reviewer: 성능 리뷰             │
│  → 3자 토론 → 합의 → 커밋                 │
├─────────────────────────────────────────┤
│  Stage: UX → Epics → Sprint (유사 패턴)   │
└─────────────────────────────────────────┘

Story Dev 모드:
┌─────────────────────────────────────────┐
│  병렬 실행 (Git Worktree)                │
│  ├── dev-1: Story A (worktree A)        │
│  ├── dev-2: Story B (worktree B)        │
│  └── dev-3: Story C (worktree C)        │
│  → 완료 → integrator 머지 → 통합 테스트   │
└─────────────────────────────────────────┘
```

## 주의사항 (CORTHEX 특이사항)

### 1. Windows 환경

- 현재 개발 환경이 Windows 11
- tmux는 WSL 안에서만 동작
- VS Code 터미널에서는 split-pane 불가 → **in-process 모드만** 가능
- 해결: WSL에서 Claude Code 실행하거나, in-process 모드 사용

### 2. CLI 토큰 동시 사용

- 팀원 N명 = 동시 N개 세션 = rate limit 주의
- Claude Max 구독의 동시 요청 제한 확인 필요
- 2~3명이 현실적 한계일 수 있음

### 3. 실험적 기능 주의

- 세션 재개 시 팀원 복구 안 됨
- 한 세션에 한 팀만
- 버그 가능성 있음 (아직 experimental)

### 4. 기존 파이프라인과의 호환

- v4.1 파이프라인을 즉시 교체하기보다는
- **하이브리드 접근**: 기획 단계에서 먼저 팀 토론 시도
- 안정되면 개발 단계도 팀으로 전환

## 추천 도입 로드맵

```
Phase 1: 실험 (지금)
├── 활성화: settings.json에 환경변수 추가
├── 테스트: 간단한 2명 팀으로 코드 리뷰 시도
└── 확인: in-process 모드에서 동작 여부

Phase 2: 기획 파티 (안정화 후)
├── PRD 리뷰를 3명 팀으로
├── 아키텍처 디베이트를 2명 팀으로
└── 기존 파이프라인 대비 품질 비교

Phase 3: 개발 병렬화 (검증 후)
├── 독립 스토리 병렬 개발
├── Git Worktree 활용
└── Pipeline v5 정식 채택

Phase 4: 자기조직화 (숙달 후)
├── Swarm 패턴 도입
├── Hook 기반 품질 게이트
└── 완전 자동화
```
