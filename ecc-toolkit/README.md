# ECC Toolkit — Claude Code Extension Catalog

ECC (Everything Claude Code) v1.9.0 기준.
사용 전 반드시 최신 버전으로 업데이트할 것: `cd ~/.claude && git pull`

---

## 사용법

```bash
# 업데이트
cd ~/.claude && git submodule update --remote

# 명령어 호출
/plan, /verify, /dream, /discuss-mode ...

# 스킬은 자동 트리거되거나 /이름 으로 호출
```

---

## 1. Commands (116개) — `/이름`으로 호출

### 일상 핵심 (매일 쓰는 것)

| Command | 용도 | 언제 |
|---------|------|------|
| `/plan` | 구현 전 계획 수립 | 기능 개발 시작할 때 |
| `/verify` | 빌드+테스트+린트 전체 확인 | 작업 끝났을 때 |
| `/build-fix` | 빌드 에러 수정 | tsc 에러 날 때 |
| `/code-review` | 코드 리뷰 | 코드 수정 후 |
| `/tdd` | 테스트 먼저 → 구현 | 새 기능/버그 수정 |
| `/discuss-mode` | 논의 모드 (코드 안 짬) | 방향 고민할 때 |
| `/save-session` | 세션 상태 저장 | 작업 중단 전 |
| `/resume-session` | 세션 복원 | 다음날 이어서 |
| `/dream` | 메모리 정리 | 자동 실행 |

### BMAD 시리즈 (35개) — 프로젝트 관리

| Command | 용도 |
|---------|------|
| `/bmad-bmm-create-product-brief` | 제품 브리프 작성 |
| `/bmad-bmm-create-prd` | PRD 작성 (11단계) |
| `/bmad-bmm-create-architecture` | 아키텍처 설계 |
| `/bmad-bmm-create-ux-design` | UX 설계 |
| `/bmad-bmm-create-epics-and-stories` | 에픽/스토리 생성 |
| `/bmad-bmm-create-story` | 스토리 상세 작성 |
| `/bmad-bmm-dev-story` | 스토리 구현 |
| `/bmad-bmm-sprint-planning` | 스프린트 플래닝 |
| `/bmad-bmm-sprint-status` | 스프린트 상태 확인 |
| `/bmad-bmm-quick-spec` | 빠른 기술 스펙 |
| `/bmad-bmm-quick-dev` | 빠른 구현 |
| `/bmad-bmm-code-review` | 적대적 코드 리뷰 |
| `/bmad-bmm-retrospective` | 회고 |
| `/bmad-full-pipeline` | BMAD 전체 파이프라인 |
| `/bmad-party-mode` | 멀티 에이전트 토론 |
| `/bmad-tea-automate` | 테스트 아키텍트 자동화 |
| `/bmad-brainstorming` | 브레인스토밍 |
| `/bmad-help` | 뭐 해야 하는지 안내 |

### KDH 시리즈 (5개) — 커스텀 파이프라인

| Command | 용도 |
|---------|------|
| `/kdh-full-auto-pipeline` | 풀사이클 자동화 (v9.3) |
| `/kdh-uxui-redesign-full-auto-pipeline` | UXUI 리디자인 파이프라인 (v7.1) |
| `/kdh-code-review-full-auto` | 8단계 코드리뷰 (v4.1) |
| `/kdh-ecc-3h` | 3시간 유지보수 |
| `/kdh-ecc-12h` | 12시간 학습+진화 |

### ECC 학습/진화 (12개)

| Command | 용도 |
|---------|------|
| `/learn` | 패턴 추출 |
| `/learn-eval` | 패턴 추출 + 품질 평가 |
| `/evolve` | instinct → 스킬 진화 |
| `/instinct-status` | 학습된 instinct 목록 |
| `/instinct-import` | instinct 가져오기 |
| `/instinct-export` | instinct 내보내기 |
| `/promote` | 프로젝트 → 글로벌 승격 |
| `/prune` | 30일 넘은 미승격 삭제 |
| `/skill-create` | git 히스토리 → 스킬 생성 |
| `/skill-health` | 스킬 건강 대시보드 |
| `/rules-distill` | 스킬 → 규칙 추출 |
| `/context-budget` | 컨텍스트 사용량 분석 |

### Libre UI 시리즈 (5개)

| Command | 용도 |
|---------|------|
| `/libre-ui-synth` | 전체 UI/UX 합성 (마스터) |
| `/libre-ui-review` | UI 분석 |
| `/libre-ui-critique` | 디자인 피드백 |
| `/libre-ui-responsive` | 반응형 검사 |
| `/libre-ui-modern` | 모던 컴포넌트 생성 |
| `/libre-a11y-audit` | 접근성 감사 |

### 언어별 리뷰/빌드/테스트 (24개)

| 언어 | Review | Build | Test |
|------|--------|-------|------|
| Python | `/python-review` | - | - |
| Go | `/go-review` | `/go-build` | `/go-test` |
| Rust | `/rust-review` | `/rust-build` | `/rust-test` |
| C++ | `/cpp-review` | `/cpp-build` | `/cpp-test` |
| Kotlin | `/kotlin-review` | `/kotlin-build` | `/kotlin-test` |
| Gradle | - | `/gradle-build` | - |

### 멀티모델 협업 (5개)

| Command | 용도 |
|---------|------|
| `/multi-plan` | 여러 모델이 함께 계획 |
| `/multi-execute` | 여러 모델이 함께 실행 |
| `/multi-frontend` | 프론트엔드 특화 |
| `/multi-backend` | 백엔드 특화 |
| `/multi-workflow` | 전체 워크플로우 |

### 기타

| Command | 용도 |
|---------|------|
| `/aside` | 현재 작업 안 끊고 질문 답변 |
| `/claw` | NanoClaw REPL |
| `/devfleet` | 병렬 에이전트 오케스트레이션 |
| `/e2e` | E2E 테스트 생성/실행 |
| `/eval` | 평가 |
| `/checkpoint` | 체크포인트 |
| `/prompt-optimize` | 프롬프트 최적화 |
| `/orchestrate` | 멀티에이전트 가이드 |
| `/sessions` | 세션 이력 |
| `/pm2` | PM2 초기화 |
| `/harness-audit` | 하니스 감사 |
| `/quality-gate` | 품질 게이트 |
| `/test-coverage` | 테스트 커버리지 |
| `/refactor-clean` | 데드코드 정리 |
| `/update-docs` | 문서 업데이트 |
| `/update-codemaps` | 코드맵 업데이트 |
| `/docs` | 라이브러리 문서 조회 (Context7) |

---

## 2. Skills (142개) — 자동 트리거 또는 `/이름`

### 우리 프로젝트에서 쓰는 것

| Skill | 용도 |
|-------|------|
| `ui-ux-pro-max` | UI/UX 디자인 만능 도구 (50 스타일) |
| `dream` | 메모리 정리 (3시간마다) |
| `search-first` | 코드 작성 전 기존 구현 검색 |
| `security-review` | 보안 취약점 분석 |
| `tdd-workflow` | TDD 워크플로우 |
| `verification-loop` | 검증 루프 |
| `e2e-testing` | E2E 테스트 패턴 |
| `blueprint` | EPIC 규모 멀티세션 계획 |
| `configure-ecc` | ECC 설정 |
| `strategic-compact` | 컨텍스트 압축 관리 |
| `postgres-patterns` | PostgreSQL 패턴 |

### 디자인 특화 (9개)

| Skill | 접근법 | 강점 |
|-------|--------|------|
| `design-principles` | 게슈탈트, 시각 위계, 색채론 | 기본기 체크리스트 |
| `design-masters` | 거장 디자이너 스타일 | "Rams처럼" 방향 설정 |
| `design-movements` | 바우하우스, Swiss, Art Deco | 사조 기반 일관성 |
| `design-system` | 디자인 토큰 생성/감사 | 체계적 시스템 |
| `jungian-archetypes` | 12 원형 → UI 매핑 | 브랜드 심리학 |
| `major-arcana` | 타로 22장 → 색상/무드 | 독특한 팔레트 |
| `archetypal-combinations` | 원형 + 타로 합체 | 풀 디자인 철학 |
| `premium-saas-design` | $5k+ SaaS 제작 프레임워크 | 실전 프로세스 |
| `brand-systems` | 브랜드 아이덴티티 전체 | 로고~보이스 가이드 |

### 업종별 특화 (15개) — 해당 업종 아니면 불필요

| Skill | 업종 |
|-------|------|
| `carrier-relationship-management` | 물류/운송 |
| `logistics-exception-management` | 물류 예외 처리 |
| `returns-reverse-logistics` | 반품/역물류 |
| `customs-trade-compliance` | 관세/무역 |
| `energy-procurement` | 에너지 조달 |
| `inventory-demand-planning` | 재고/수요 예측 |
| `production-scheduling` | 생산 스케줄링 |
| `quality-nonconformance` | 품질 비적합 관리 |

### 다른 프레임워크/언어 (50+개) — 해당 스택 아니면 불필요

Django, Laravel, Spring Boot, Kotlin, Swift, Flutter, Rust, Go, Perl, C++, Nuxt, ClickHouse 등

---

## 3. Agents (33개) — 백그라운드 전문가

### 핵심

| Agent | 역할 |
|-------|------|
| `planner` | 구현 계획 |
| `architect` | 시스템 설계 |
| `code-reviewer` | 코드 리뷰 |
| `tdd-guide` | TDD 가이드 |
| `security-reviewer` | 보안 분석 |
| `build-error-resolver` | 빌드 에러 수정 |
| `e2e-runner` | E2E 테스트 |
| `refactor-cleaner` | 데드코드 정리 |
| `doc-updater` | 문서 업데이트 |
| `typescript-reviewer` | TS 코드 리뷰 |
| `database-reviewer` | DB 리뷰 |
| `synthesis-master` | UI/UX 종합 |

### 언어별

python-reviewer, go-reviewer, rust-reviewer, cpp-reviewer, kotlin-reviewer, java-reviewer, flutter-reviewer + 각 build-resolver

### BMAD 에이전트

bmad-master, analyst, architect, dev, pm, qa, sm, tech-writer, ux-designer, quick-flow-solo-dev

---

## 4. Remote Triggers (5개) — 자동 실행

| Trigger | 스케줄 | 상태 |
|---------|--------|------|
| daily-briefing | 매일 09:03 KST | 활성 |
| ecc-3h-maintenance | 3시간마다 :07분 | 활성 |
| code-quality-nightly | 매일 03:00 KST | 활성 |
| api-health-1h | 매시간 | 비활성 |
| weekly-ecc-audit | 일요일 자정 KST | 활성 |

---

## 5. 내장 명령어 (Claude Code 기본)

| Command | 용도 |
|---------|------|
| `/help` | 도움말 |
| `/clear` | 대화 초기화 |
| `/compact` | 컨텍스트 압축 |
| `/config` | 설정 |
| `/cost` | 비용 확인 |
| `/model` | 모델 변경 |
| `/memory` | 메모리 관리 |
| `/permissions` | 권한 설정 |
| `/status` | 상태 확인 |
| `/doctor` | 진단 |
| `/vim` | Vim 모드 |

---

## 업데이트 이력

- 2026-03-27: 초기 작성 (ECC v1.9.0 기준)
