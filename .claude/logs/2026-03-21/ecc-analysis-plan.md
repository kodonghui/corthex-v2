# ECC 전수 분석 — 도입 플랜

Date: 2026-03-21
Analyst: Claude Opus 4.6 (Orchestrator)
Source: github.com/affaan-m/everything-claude-code v1.9.0

---

## Part 1: Claude Code 워크플로우/기록 시스템 개선 플랜

### 1.1 세션 영속성 시스템 (최우선)

**ECC 접근**: `session-end.js`가 Claude Code의 JSONL 트랜스크립트를 파싱해서 유저 메시지, 수정 파일, 도구 사용을 자동 추출 → `.tmp` 파일로 저장. `session-start.js`가 다음 세션에서 자동 로드.

**우리 현재**: `working-state.md`를 수동으로 업데이트하거나, `컴팩대비` 시 타임스탬프만 찍음.

**도입 플랜**:

| 단계 | 작업 | 파일 | 난이도 |
|------|------|------|--------|
| 1a | `session-end.js` 포팅 — JSONL 트랜스크립트 파싱 로직을 Node.js로 구현. 유저 메시지(마지막 10개), 수정 파일, 도구 사용 자동 추출 | `.claude/hooks/session-auto-summary.js` | 중 |
| 1b | `.claude/logs/{YYYY-MM-DD}/session-{short-id}.md` 형식으로 저장. ECC의 `/save-session` 포맷 채택: What WORKED / What Did NOT Work / Decisions Made / Exact Next Step | `.claude/hooks/session-auto-summary.js` | 쉬움 |
| 1c | `hooks.json`에 Stop hook 추가 — async, timeout 10s | `.claude/hooks.json` | 쉬움 |
| 1d | `session-start.js` 포팅 — 세션 시작 시 최근 로그 자동 로드 | `.claude/hooks/session-auto-load.js` | 쉬움 |
| 1e | 기존 `working-state.md`와 통합 — 세션 로그가 working-state를 대체하지 않고 보완 | CLAUDE.md 규칙 추가 | 쉬움 |

**핵심 인사이트**: ECC의 `session-end.js`가 302줄인 이유는 JSONL 트랜스크립트를 직접 파싱하기 때문. Claude Code가 `transcript_path`를 Stop hook의 stdin JSON으로 제공하므로, 이걸 읽으면 세션에서 뭘 했는지 100% 자동 추출 가능.

**우리에게 특히 중요한 이유**: 1M 컨텍스트로 세션이 수시간 지속 → 논의/결정/작업 내역이 엄청 많음 → 수동 기록 불가능 → 자동화 필수.

---

### 1.2 비용 추적 (높음)

**ECC 접근**: `cost-tracker.js`가 매 Stop마다 모델별 토큰/비용을 `costs.jsonl`에 적재. 모델별 요금: Haiku $0.8/1M, Sonnet $3/1M, Opus $15/1M.

**도입 플랜**:

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 2a | `cost-tracker.js` 포팅 — 우리는 Opus 4.6만 사용하므로 단순화 가능 | 쉬움 |
| 2b | `.claude/metrics/costs.jsonl`에 세션별 비용 기록 | 쉬움 |
| 2c | `hooks.json`에 Stop hook 추가 (async) | 쉬움 |
| 2d | 월별 비용 리포트 명령어 `/cost-report` 추가 (선택) | 중 |

**핵심 가치**: CLI Max 월정액이라 실제 비용은 없지만, 팀 에이전트(Team) 사용량 추적에 유용. Stage 2에서 5명 팀이 몇 시간 돌았는지 토큰 기준으로 파악 가능.

---

### 1.3 전략적 컴팩션 (높음)

**ECC 접근**: `suggest-compact.js`가 tool call 카운트를 추적, 50 call 도달 시 `/compact` 제안, 이후 25개마다 반복.

**도입 플랜**:

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 3a | `suggest-compact.js` 포팅 — 50 call 기준 유지 (1M 컨텍스트이므로 100으로 올려도 됨) | 쉬움 |
| 3b | PreToolUse(Edit\|Write) hook으로 등록 | 쉬움 |
| 3c | 1M 컨텍스트에 맞게 임계값 조정 — 환경변수 `COMPACT_THRESHOLD=100` | 쉬움 |

**핵심 인사이트**: ECC는 200K 기준으로 50 call. 우리는 1M이니까 100~150이 적절. 하지만 원리는 동일 — 논리적 전환점에서 컴팩션하는 게 자동 컴팩션보다 나음.

---

### 1.4 품질 게이트 Hook (중간)

**ECC 접근**: `post-edit-console-warn.js` (console.log 경고), `post-edit-typecheck.js` (tsc 자동), `post-edit-format.js` (Biome/Prettier 자동).

**우리 현재**: `pre-commit-tsc.sh`만 있음 (커밋 전 tsc). 편집 시점 체크 없음.

**도입 플랜**:

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 4a | `post-edit-console-warn.js` 포팅 — console.log 편집 시 경고 | 쉬움 |
| 4b | 우리는 이미 커밋 시 tsc를 하므로 post-edit-typecheck는 중복 → 생략 | - |
| 4c | `post-edit-format.js` — Biome 자동 포맷 (우리 프로젝트에 Biome 없으므로 선택적) | 낮음 |

---

### 1.5 보안 감지 Hook (중간)

**ECC 접근**: `governance-capture.js`가 하드코딩 시크릿, 위험 명령어(rm -rf, DROP TABLE), 민감 파일 접근을 감지.

**도입 플랜**:

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 5a | `governance-capture.js` 핵심 로직 포팅 — SECRET_PATTERNS 정규식 + APPROVAL_COMMANDS + SENSITIVE_PATHS | 중 |
| 5b | PreToolUse(Bash\|Write\|Edit) hook으로 등록 | 쉬움 |
| 5c | 우리 프로젝트 특화 패턴 추가: `sk-ant-cli-*`, `sk-ant-api-*`, CLI 토큰 패턴 | 쉬움 |

**핵심 가치**: output-redactor가 이미 있지만, 편집 시점에서 미리 잡는 게 더 나음.

---

### 1.6 `/learn` 패턴 추출 (중간)

**ECC 접근**: 세션에서 비자명한 문제를 해결했을 때 `/learn`으로 패턴을 스킬 파일로 저장.

**도입 플랜**:

| 단계 | 작업 | 난이도 |
|------|------|--------|
| 6a | `.claude/commands/learn.md` 포팅 | 쉬움 |
| 6b | 저장 경로: `.claude/skills/learned/{pattern-name}.md` | 쉬움 |
| 6c | CLAUDE.md에 "비자명한 문제 해결 후 /learn 실행" 규칙 추가 | 쉬움 |

---

### 1.7 로그 시스템 통합 (사장님 요청)

**최종 구조**:
```
.claude/logs/
  2026-03-21/
    session-{id}.md     ← session-end.js 자동 생성 (트랜스크립트 파싱)
    decisions.md        ← GATE/discuss 결정 시 자동 append (CLAUDE.md 규칙)
    discussions.md      ← /discuss-mode 종료 시 자동 append
    pipeline.md         ← Step 완료/점수 자동 기록 (파이프라인 내장)
  2026-03-22/
    ...
.claude/metrics/
  costs.jsonl           ← cost-tracker.js 자동 적재
.claude/sessions/
  compaction-log.txt    ← pre-compact 기록
```

---

### 1.8 Hook 프로필 시스템 (장기)

**ECC 접근**: `run-with-flags.js`가 Hook 실행을 프로필(minimal/standard/strict)로 제어. 환경변수 `ECC_HOOK_PROFILE`로 전환.

**도입 가치**: 파이프라인 실행 중에는 "strict" (모든 hook 활성), 일반 작업에서는 "standard" (핵심만).

**시기**: 위 1.1~1.7 안정화 후 도입.

---

## Part 2: CORTHEX v3에 반영할 아이디어 플랜

### 2.1 에이전트 보안 프레임워크 (높음)

**ECC Security Guide 핵심 교훈**:
- OpenClaw(!) 228K 스타 프로젝트에서 512개 보안 취약점 발견
- Claude Code 자체에 CVE 4개 (hooks 임의 실행, API URL 리다이렉트, MCP 자동 승인)
- MCP 서버 43%가 명령어 주입 취약점
- 에이전트 84%가 tool response 경유 프롬프트 주입에 취약

**v3 반영 플랜**:

| 아이디어 | v3 적용 | PRD 반영 위치 |
|---------|---------|-------------|
| 에이전트 샌드박싱 | n8n Docker 네트워크 격리 (이미 N8N-SEC에 있음) | FR-N8N, NFR-S9 |
| Tool response 프롬프트 주입 방어 | 4-layer sanitization 확장 — tool output도 검증 | PER-1 확장 |
| MCP 서버 health check | 우리 Stitch MCP + Playwright MCP에 적용 | 운영 NFR |
| Governance event 로깅 | 에이전트가 민감 작업 수행 시 감사 로그 | MEM-5 (Planning 감사 로그) |
| Secret rotation 자동화 | CLI 토큰 유출 시 자동 비활성화 | NFR-S1 확장 |

**핵심**: 우리 CORTHEX는 에이전트가 사용자의 CLI 토큰으로 실행됨 → ECC가 경고하는 "root access agent" 패턴과 동일. 4-layer sanitization이 이미 있지만, tool response 경유 공격은 아직 미고려.

---

### 2.2 Cost-Aware LLM Pipeline (높음)

**ECC 접근**: 태스크 복잡도에 따라 Haiku/Sonnet/Opus 자동 라우팅.

**v3 반영 플랜**:

| 아이디어 | v3 적용 |
|---------|---------|
| 모델 라우팅 | agent-loop.ts에서 대화=Claude, 도구=회사별 Admin 설정 (이미 PRD에 있음) |
| 비용 추적 | Reflection 크론 Haiku $0.10/일 한도 (NFR-COST3) |
| 예산 초과 자동 차단 | Tier별 비용 한도 → Go/No-Go #7 |
| immutable cost tracking | ECC의 frozen dataclass 패턴 → cost-aggregation.ts에 적용 |

---

### 2.3 Continuous Learning → 에이전트 메모리 3단계 (높음)

**ECC의 instinct 시스템**과 **우리 v3 에이전트 메모리**는 본질적으로 같은 문제를 풀고 있음:

| ECC Instinct | v3 에이전트 메모리 |
|-------------|-----------------|
| 관찰 (PreToolUse/PostToolUse) | 관찰 (observations 테이블) |
| 패턴 감지 (confidence scoring) | 반성 (memory-reflection.ts 크론) |
| 진화 (instinct → skill/command/agent) | 계획 (agent_memories[reflection] pgvector 검색) |

**v3 반영 플랜**:

| 아이디어 | v3 적용 |
|---------|---------|
| Confidence scoring | observations에 confidence 필드 추가 (0.3~0.9) |
| Domain tagging | observations에 domain 필드 추가 (대화, 도구 사용, 에러 등) |
| Instinct→Skill 진화 | Reflection이 confidence 높은 observations를 통합 → 높은 수준 인사이트 |
| 프로젝트별 격리 | companyId별 격리 (이미 있음) |
| Cross-project promotion | 동일 패턴이 2+ 회사에서 발견 시 "글로벌 인사이트"로 승격 |

**핵심**: ECC의 instinct는 "Claude Code 사용 패턴"을 학습하지만, 우리의 에이전트 메모리는 "비즈니스 태스크 패턴"을 학습. 원리는 동일하지만 적용 도메인이 다름.

---

### 2.4 AI Regression Testing → v3 품질 검증 (높음)

**ECC 핵심 인사이트**: "AI가 코드를 쓰고 AI가 리뷰하면 같은 블라인드 스팟을 공유한다."

**v3 반영 플랜**:

| 아이디어 | v3 적용 |
|---------|---------|
| Author-Bias Elimination | 우리 파이프라인 크리틱 시스템이 이미 이걸 함 (Writer ≠ Critic) |
| Sandbox/Production 경로 불일치 | 우리 E2E 테스트에서 sandbox 모드 검증 추가 |
| De-Sloppify 패턴 | `/simplify` 명령어가 이미 있음 |
| 새로운 아이디어: Capability Eval | "에이전트가 이전에 못 했던 것을 이제 할 수 있는지" 평가 → v3 Go/No-Go 게이트에 적용 |

---

### 2.5 Blueprint → 멀티세션 프로젝트 계획 (중간)

**ECC 접근**: 한 줄 목표 → 스텝별 construction plan 생성. 각 스텝이 독립적으로 실행 가능 (컨텍스트 브리프 포함).

**v3 반영 플랜**:

우리 `/kdh-full-auto` Stage 6 (Epics & Stories)가 이미 이 역할을 함. 하지만 ECC의 blueprint가 더 나은 점:
- 각 스텝에 "self-contained context brief" 포함 → 새 에이전트가 cold start 가능
- 의존성 그래프 시각화
- 병렬 실행 가능 스텝 자동 감지

**적용**: Story 파일에 "Context Brief" 섹션 추가 → 새 세션/에이전트가 story만 읽고 바로 착수 가능.

---

### 2.6 Search-First → v3 기술 리서치 강화 (중간)

**ECC 접근**: 코드 작성 전 npm/PyPI/GitHub/MCP에서 기존 솔루션 검색.

**v3 반영 플랜**:

| 아이디어 | v3 적용 |
|---------|---------|
| 라이브러리 검색 자동화 | Stage 1 Technical Research에서 이미 수행 |
| MCP 서버 검색 | 새 기능 구현 전 MCP 서버 카탈로그 확인 |
| "Adopt vs Build" 결정 매트릭스 | Architecture Stage에서 각 기술 결정에 적용 |

---

### 2.7 Agent Harness Construction → v3 엔진 개선 (중간)

**ECC 접근**: 에이전트 도구 정의, 관찰 포맷, 에러 복구 최적화.

**v3 반영 플랜**:

| 아이디어 | v3 적용 |
|---------|---------|
| 도구 응답 표준화 (status/summary/next_actions/artifacts) | call_agent 핸드오프 응답 포맷 표준화 |
| 에러 복구 계약 (root cause hint + safe retry + stop condition) | agent-loop.ts 에러 핸들링 개선 |
| ReAct + Function-calling 하이브리드 | 현재 messages.create() 기반 → ReAct 계획 + 도구 실행 분리 가능 |

---

### 2.8 Chief-of-Staff → v3 비서 에이전트 (낮음)

**ECC 접근**: 이메일/Slack/LINE/Messenger 통합 트리아지 + 4단계 분류 + 자동 드래프트.

**v3 반영**: 우리 "비서" 에이전트가 자연어 명령 라우팅을 담당. ECC의 chief-of-staff 패턴을 참고하면:
- 메시지 4단계 분류 (skip/info_only/meeting_info/action_required) → 에이전트 태스크 우선순위 분류에 적용
- 관계 컨텍스트 파일 (relationships.md) → 에이전트별 사용자 선호도 기록에 적용

---

## Part 3: 실행 로드맵

### Phase A: 즉시 도입 (이번 세션 또는 다음 세션)
1. **1.1** 세션 자동 요약 hook — `session-auto-summary.js`
2. **1.2** 비용 추적 hook — `cost-tracker.js` 포팅
3. **1.3** 전략적 컴팩션 — `suggest-compact.js` 포팅
4. **1.7** 로그 시스템 폴더 구조 확정

### Phase B: 파이프라인 개선 (Stage 3 시작 전)
5. **1.4** console.log 경고 hook
6. **1.5** 보안 감지 hook
7. **1.6** `/learn` 명령어

### Phase C: v3 PRD/Architecture 반영 (Stage 4~5)
8. **2.1** 에이전트 보안 프레임워크 → Architecture 문서에 반영
9. **2.3** Continuous Learning → 에이전트 메모리 3단계 설계 강화
10. **2.4** AI Regression Testing → 테스트 전략에 반영

### Phase D: v3 구현 시 (Story Dev)
11. **2.2** Cost-Aware Pipeline → agent-loop.ts
12. **2.5** Blueprint → Story 파일 Context Brief
13. **2.7** Agent Harness → call_agent 응답 포맷

---

## 핵심 결론

ECC의 가장 큰 강점은 **인프라 자동화** (hooks, session management, cost tracking)이고, 우리의 가장 큰 강점은 **기획/품질 파이프라인** (BMAD 파티 모드, 루브릭, GATE).

둘은 다른 레이어를 담당하므로 **상호 보완적**입니다:
- ECC 인프라 → 우리 Claude Code 환경에 이식
- 우리 파이프라인 → v3 제품에 적용

ECC에서 가장 도입 가치가 높은 것은 **세션 자동 요약** (session-end.js)입니다. 1M 컨텍스트 세션에서 수시간의 논의/결정/작업을 자동으로 기록하는 건 수동으로는 불가능하고, 이게 없으면 세션 간 컨텍스트 단절이 계속됩니다.
