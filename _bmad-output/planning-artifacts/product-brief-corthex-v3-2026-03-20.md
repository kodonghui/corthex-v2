---
stepsCompleted: [1, 2, 3, 4, 5, 6]
stepsPlanned: [1, 2, 3, 4, 5, 6]
status: COMPLETE
completedAt: 2026-03-20
documentPriority:
  1: _bmad-output/planning-artifacts/v3-openclaw-planning-brief.md   # PRIMARY: CEO decision doc
  2: _bmad-output/planning-artifacts/v3-corthex-v2-audit.md          # AUTHORITY: accurate v2 numbers
  3: _bmad-output/planning-artifacts/prd.md                          # BASELINE: v2 PRD (WARNING: known issues — see note below)
  4: _bmad-output/planning-artifacts/architecture.md                 # BASELINE: v2 architecture
  5: _bmad-output/planning-artifacts/v1-feature-spec.md              # CONSTRAINT: "if it worked in v1, it must work in v2"
  6: _bmad-output/planning-artifacts/epics.md                        # SCOPE BOUNDARY: v2 21-epic structure
  7: project-context.yaml                                            # STRUCTURE: monorepo layout + stats
  8: _bmad-output/planning-artifacts/v3-vps-prompt.md               # EXECUTION CONTEXT: VPS constraints
inputDocuments:
  - path: _bmad-output/planning-artifacts/v3-openclaw-planning-brief.md
    role: PRIMARY — CEO 결정사항. v3 기능 4가지 + 절대 규칙 정의.
  - path: _bmad-output/planning-artifacts/v3-corthex-v2-audit.md
    role: AUTHORITY — 코드 기반 검증된 v2 정확한 수치 (485 API, 71 pages, 86 tables)
  - path: _bmad-output/planning-artifacts/prd.md
    role: BASELINE — v2 PRD. NOTE: last critic review scored 4.8/10 with 7 known issues; consume with caution, verify against audit doc.
  - path: _bmad-output/planning-artifacts/architecture.md
    role: BASELINE — v2 아키텍처. Hono+Bun server, React+Vite apps, Neon PostgreSQL.
  - path: _bmad-output/planning-artifacts/v1-feature-spec.md
    role: CONSTRAINT — v1 기능 스펙. "v1에서 동작한 것은 v2/v3에서도 동작해야 한다" 규칙.
  - path: _bmad-output/planning-artifacts/epics.md
    role: SCOPE BOUNDARY — v2 21개 Epic 구조. v3 scope 설정 시 기준점.
  - path: project-context.yaml
    role: STRUCTURE — 모노레포 구조, 패키지 목록, codebase stats (393 test files, 10,154 cases)
  - path: _bmad-output/planning-artifacts/v3-vps-prompt.md
    role: EXECUTION CONTEXT — VPS tmux 실행 컨텍스트. 리소스 제약 인식 필요.
date: 2026-03-20
author: CEO (사장님) + Mary (Analyst)
---

# Product Brief: CORTHEX v3

<!-- ============================================================ -->
<!-- PIPELINE: 6 Steps Total — ✅ ALL COMPLETE                    -->
<!-- Step 1 (Init):     ✅ Complete    (no party review — init)  -->
<!-- Step 2 (Vision):   ✅ Complete    (no party review — init)  -->
<!-- Step 3 (Users):    ✅ Complete    avg 8.75/10                -->
<!-- Step 4 (Metrics):  ✅ Complete    avg 8.23/10  GATE-C        -->
<!-- Step 5 (Scope):    ✅ Complete    avg 8.75/10  GATE-A        -->
<!-- Step 6 (Complete): ✅ Complete    2026-03-20                 -->
<!-- ============================================================ -->

<!-- ============================================================ -->
<!-- ⚠️  VPS RESOURCE CONSTRAINT (all subsequent steps must       -->
<!--    design within these limits):                              -->
<!--    - PixiJS 8 bundle size: target < 200KB gzipped           -->
<!--    - n8n Docker: separate container, API-only integration    -->
<!--    - Agent memory DB: pgvector on existing Neon instance     -->
<!--    - WebSocket: +1 channel (/ws/office) on existing Bun WS  -->
<!--    - No new infrastructure beyond n8n Docker container       -->
<!-- ============================================================ -->

<!-- ============================================================ -->
<!-- ⚠️  KNOWN RISKS (from v3 planning brief):                   -->
<!--    - PixiJS 8 learning curve (new dependency)               -->
<!--    - n8n iframe embed vs API integration complexity          -->
<!--    - Agent memory: pgvector already installed (Epic 10)     -->
<!--    - UXUI: 428 color-mix incident → full theme reset        -->
<!--    - prd.md has 7 known issues — verify all refs vs audit   -->
<!-- ============================================================ -->

<!-- Content sections will be appended sequentially:             -->
<!-- §1 Executive Summary + Vision — Step 2 ✅                  -->
<!-- §2 Target Users — Step 3                                   -->
<!-- §3 Success Metrics — Step 4                                -->
<!-- §4 Scope (In/Out) — Step 5                                 -->
<!-- §5 Final Assembly — Step 6                                  -->
<!-- ============================================================ -->

---

## Executive Summary

CORTHEX v3는 AI 에이전트들이 **개성을 갖고, 성장하며, 실제로 일하는 모습을 볼 수 있는** 엔터프라이즈 AI 조직 운영 플랫폼이다.

v2에서 검증된 인프라(485개 API 엔드포인트, 86개 DB 테이블, 71개 프론트엔드 페이지, 10,154개 테스트)를 기반으로 4가지 핵심 능력을 추가한다:

1. **Virtual Office (가상 사무실)** — PixiJS 8 픽셀 캐릭터로 에이전트가 실시간으로 일하는 모습을 시각화 (CEO 앱 `/office`)
2. **n8n 워크플로우 자동화** — 드래그앤드롭으로 복잡한 비즈니스 자동화 (기존 버그 많은 자체 워크플로우 대체, 신규 자동화 전용)
3. **Big Five 성격 시스템** — 외향성·성실성·개방성·친화성·신경성 슬라이더로 에이전트에 개성 부여
4. **3단계 메모리 아키텍처** — 관찰(Observation) → 반성(Reflection) → 계획(Planning)으로 에이전트가 경험에서 배우고 성장

동시에 기존 테마의 색상 혼재(428곳), dead button, 메뉴 구조 불일치 문제를 해결하는 완전한 UXUI 리디자인을 수행한다. 디자인 도구: **Stitch 2**(메인) + `/kdh-uxui-redesign-full-auto-pipeline Phase 0`부터 새 테마 아키타입 결정.

**핵심 성과 목표**: 에이전트 반복 오류율 감소, 워크플로우 설정 시간 단축, Big Five 성격 기반 응답 일관성 향상, Reflection 크론 비용 대비 태스크 품질 개선, 안전한 에이전트 실행 환경(감사 로그 + 토큰 보호), Tier별 비용 인지 모델 라우팅으로 비용 최적화.

---

## Core Vision

### Problem Statement

기업이 AI 에이전트를 도입했지만 세 가지 근본적인 문제가 해결되지 않았다:

1. **블랙박스 문제**: 에이전트가 무슨 일을 하는지, 왜 그런 결정을 내리는지 볼 수 없다. 텍스트 로그만으로는 CEO가 자신의 AI 조직을 신뢰하기 어렵다.

2. **획일성 문제**: 모든 에이전트가 동일한 성격으로 응답한다. 전략 담당 에이전트와 고객 대응 에이전트가 같은 톤, 같은 방식으로 일한다.

3. **정체 문제**: 어제 한 실수를 오늘도 반복한다. 에이전트는 매 태스크를 '처음 하는 것처럼' 처리한다. 조직이 쌓아온 경험, 교훈, 패턴이 AI에 전달되지 않는다.

### Problem Impact

| 문제 | 비즈니스 영향 |
|------|-------------|
| 블랙박스 → 신뢰 부재 | 핵심 업무 위임 불가, AI 조직화 효과 반감 |
| 획일적 에이전트 | 역할 분화 불가, 부서별 전문성 차별화 불가 |
| 메모리 없음 | 반복 실수로 비용 낭비, 품질 저하, 학습 불가 |
| 자체 워크플로우 코드 | 유지보수 비용 누적, 버그 반복 (v2에서 500 에러 확인) |
| UXUI 색상 혼재(428곳) | 사용성 저하, 브랜드 신뢰도 손상 |

### Why Existing Solutions Fall Short

| 솔루션 | 한계 |
|--------|------|
| **OpenAI Assistants** | 단일 에이전트 최적화. 조직 구조(부서-직원-에이전트 계층), 비용 추적, 권한 관리 없음 |
| **AutoGen / CrewAI** | 소규모 에이전트 팀 최적화. 엔터프라이즈 운영 인프라 없음. 메모리는 단순 벡터 검색 수준 |
| **AI Town / Agent Office** | 시각화 데모 수준. 실제 비즈니스 로직(비용, 부서, 지식베이스)과 통합 불가 |
| **n8n 단독** | 워크플로우 자동화만. AI 에이전트 조직 관리, 메모리, 성격 시스템 없음 |

CORTHEX v2가 이미 구축한 485개 API, 68개 built-in 도구, 16개 WebSocket 채널, 6개 백그라운드 워커 위에 v3의 4가지 레이어를 얹는다 — 어떤 경쟁 솔루션도 이 규모의 검증된 엔터프라이즈 기반을 갖추고 있지 않다.

### Proposed Solution

**v2 검증된 기반 위에 4가지 레이어 추가 (기존 엔진·API·DB 완전 보존):**

**구현 순서 (난이도 낮→높, 의존성 고려):**
Layer 3(Big Five, 독립·낮음) → Layer 2(n8n, 독립·중간) → Layer 4(메모리, 복잡·높음) → Layer 1(PixiJS, 에셋 선행 필요·최후)

#### Layer 3: Big Five 성격 시스템 (획일성 해결) — 1번째 구현
- `agents` 테이블에 `personality_traits JSONB` 컬럼 추가
- 5개 특성 각 0.0~1.0: `openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism`
- 에이전트 생성/편집 UI: 성격 슬라이더 5개 (Admin + CEO 앱)
- **구현 패턴**: 기존 `engine/soul-renderer.ts`의 `extraVars` 메커니즘 확장 → `{{personality_traits}}` 변수 추가, engine 경계(E8) 준수
- *사용자 경험*: 성실성 1.0인 에이전트는 꼼꼼한 체크리스트 방식으로, 외향성 0.9인 에이전트는 열정적 톤으로 응답 — 같은 LLM, 다른 개성.

#### Layer 2: n8n 워크플로우 연동 (자동화 해결) — 2번째 구현
- n8n Docker 컨테이너 (VPS 별도 배포, 포트 5678 내부망 한정)
- **보안**: Hono 리버스 프록시 `/admin/n8n/*` → n8n 내부 접근, 직접 외부 노출 없음
- 드래그앤드롭으로 Telegram/Discord/Slack/크론잡/웹훅 자동화
- **범위 명확화**: n8n은 신규 자동화 전용. 기존 ARGOS 크론잡(`services/argos-service.ts`) 그대로 유지.
- Admin: n8n 관리 페이지 (워크플로우 목록, 실행 이력)
- CEO 앱: 워크플로우 실행 결과 확인
- *사용자 경험*: 개발자 없이 드래그앤드롭으로 "매일 오전 9시 영업 보고서 → Slack 전송" 자동화 완성.

#### Layer 4: 3단계 메모리 아키텍처 (정체 해결) — 3번째 구현
**v2 기존 메모리 인프라와의 관계 (Zero Regression 원칙 적용):**
- v2에 이미 존재: `agent_memories` 테이블 (schema.ts L1589) + `memory-extractor.ts` (즉시 학습 추출, per-task)
- **채택 전략: Option B — 기존 확장** (대체·병렬 아님)
  - 기존 `agent_memories` 테이블: `memoryTypeEnum`에 `'reflection'`, `'observation'` 타입 추가
  - 기존 `memory-extractor.ts`: 즉시 추출 모드 유지. Reflection 크론 모드는 신규 `memory-reflection.ts`(별도 파일)로 분리 (race condition 방지, E8 경계 준수)
  - 신규 `observations` 테이블 추가 (raw 실행 로그 — 기존에 없는 계층). 필드: `agent_id`, `task_id`, `content`, `confidence` (0.3~0.9), `domain` (대화/도구/에러), `created_at`. 보존 정책: Reflection 처리 후 30일 이상 raw observation 자동 purge.
  - **임베딩 프로바이더**: Voyage AI `voyage-3` (1024d) — Anthropic 권장, Gemini 금지 (key constraint). ⚠️ **기존 임베딩 마이그레이션 필수**: 현재 `knowledge_docs.embedding`은 `vector(768)` Gemini 임베딩 (schema.ts:1556), `semantic_cache.queryEmbedding`도 `vector(768)`. Voyage AI 전환 시: (1) 차원 변경 768→1024 마이그레이션, (2) 기존 임베딩 전수 re-embed (Voyage AI로), (3) `embeddingModel` 컬럼 값 업데이트. Architecture에서 상세 설계.
  - **`agent_memories` 벡터 검색 신규 추가**: 현재 `agent_memories` 테이블에는 벡터 컬럼이 **없음** (schema.ts:1589-1608, text 필드만 존재). Reflection 결과의 시맨틱 검색을 위해 `vector(1024)` 컬럼 신규 추가 + 기존 memories backfill job 필요. Sprint 3 스코프에 포함 (단순 enum 확장이 아닌 스키마 변경).
  - 기존 v2 메모리 데이터 단절 없음

**3단계 파이프라인:**
- **관찰(Observation)**: 모든 실행 로그 → 신규 `observations` 테이블 (PostgreSQL)
- **반성(Reflection)**: 크론 주기적 실행(기본 일 1회) → 관찰 요약 → 기존 `agent_memories` 테이블에 `memoryType: 'reflection'`으로 저장 (pgvector 임베딩). **Confidence 기반 우선 처리**: Reflection 크론은 confidence ≥ 0.7 관찰을 우선 통합하여 노이즈 필터링 (ECC 2.3).
  - ⚠️ **비용 모델**: Reflection마다 LLM API 호출 발생. 에이전트 수 × 관찰량 × 빈도 = 비용 가변. Tier별 Reflection 한도 설정 필요 (범위: $0.10~$0.50/agent/day Haiku 기준, PRD에서 확정).
- **계획(Planning)**: 태스크 시작 시 `agent_memories`(reflection 타입) + pgvector 시맨틱 검색으로 실행 계획 수립
- pgvector: Epic 10에서 이미 설치됨 (기존 인프라 활용)
- *사용자 경험*: 한 달 후 같은 태스크를 맡긴 에이전트가 처음보다 훨씬 적은 시행착오로 완료 — AI 조직이 실제로 성장하는 순간.

#### Layer 1: Virtual Office 가상 사무실 (투명성 해결) — 4번째 구현 (에셋 선행 필요)
- PixiJS 8 + @pixi/react, Tiled JSON 타일맵, 스프라이트 애니메이션
- 에이전트 상태 5단계 시각화: `idle`(배회) → `working`(타이핑) → `speaking`(말풍선) → `tool_calling`(도구 사용) → `error`(빨간불)
- **픽셀 에셋 전략**: 오픈소스 픽셀 스프라이트 팩(LPC Sprite Sheet 등) 기반 + AI 이미지 생성(Midjourney/DALL-E) 보조. 에셋 제작은 구현 착수 전 선행 완료 필요.
- **픽셀 아트 UX 철학**: 픽셀 캐릭터는 장식이 아니라 **투명성 인터페이스**다. 텍스트 로그를 읽을 수 없는 CEO도 에이전트가 지금 무엇을 하는지 한눈에 파악한다. AI Town이 시뮬레이션인 반면, Virtual Office는 실제 `agent-loop.ts` 실행 로그를 실시간으로 픽셀 동작으로 변환한다 — 같은 엔진, 다른 창문.
- **대규모 인지 부하 관리**: 에이전트 20명+ 시나리오를 위한 부서별 그룹핑, 줌/패닝, 상태 필터(working만 표시), 에이전트 검색 기능 필수. 모든 에이전트를 한 화면에 표시하면 인지 과부하 → 부서별 "방(room)" 분리 또는 미니맵 도입.
- 기존 `agent-loop.ts` 실행 로그 읽기만 — 엔진 변경 없음
- WebSocket: 기존 16채널에 `/ws/office` 채널 1개 추가 (VPS: 번들 < 200KB gzipped)
- 라우트: CEO 앱 `/office` 신규 추가
- *사용자 경험*: CEO가 `/office`를 처음 열었을 때 — 픽셀 캐릭터들이 각자 책상에서 타이핑하고, 한 에이전트가 툴을 집어들고, 다른 에이전트가 말풍선을 띄우는 순간 — AI 조직이 살아있다는 것을 처음으로 '느끼는' 순간.

### Key Differentiators

1. **유일한 엔터프라이즈 통합 플랫폼**: 485개 API, 71개 페이지, 86개 DB 테이블의 검증된 조직 운영 인프라 위에 시각화·자동화·성격·메모리를 동시 통합. 어떤 경쟁사도 이 규모의 기반을 즉시 복제할 수 없다.

2. **에이전트가 살아있다**: 픽셀 캐릭터로 실시간 돌아다니며, Big Five 성격으로 개성을 갖고, 3단계 메모리로 매일 성장한다. AI 도구가 아니라 진짜 AI 조직.

3. **제로 회귀(Zero Regression) 철학**: 기존 `agent-loop.ts` 엔진 불변, 기존 485개 API 유지, 기존 86개 테이블 유지. 모든 v3 기능은 기존 위에 얹는다. v1에서 동작한 것은 v3에서도 동작한다.

4. **성장하는 AI 조직**: CrewAI·AutoGen과 달리 관찰→반성→계획 3단계 메모리가 완전 구현된다. 에이전트는 6개월 후 처음보다 훨씬 똑똑하게 같은 태스크를 처리한다.

5. **UXUI 완전 리셋**: 모든 버튼이 작동하고, 모든 색상이 의미를 갖고, AI 조직의 규모에 어울리는 인터페이스로 완전 재구축. 기존 428곳 색상 혼재와 dead button 문제를 패치 없이 근본 해결. 도구: Stitch 2(메인 디자인) + `/kdh-uxui-redesign-full-auto-pipeline Phase 0`에서 5개 아키타입 테마 중 선택. **시각적 일관성 원칙**: Phase 0 테마 선택 시 Virtual Office 픽셀 아트와의 시각적 호환성을 평가 기준에 반드시 포함.

---

## Target Users

> ⚠️ **v2 교훈 (온보딩 순서)**: v2에서 CEO 앱을 먼저 설계한 결과, Admin 설정 없이 CEO 앱에 접근하는 혼란이 반복됐다. v3부터 **Admin이 항상 첫 번째 사용자**다. CEO 앱은 Admin 설정 완료 후 사용 가능하다.

### 온보딩 플로우 (필수 순서)

```
Admin 계정 생성
  → 회사 설정 (이름, 구독 티어, 모델 선택)
  → 조직 구성 (부서 생성, 직원 등록)
  → AI 에이전트 설정 (역할, Big Five 성격 슬라이더, Soul Template)
  → [권장] 테스트 태스크 예약 실행 — CEO /office WOW 모먼트 보장
  → n8n 워크플로우 연결 (선택)
  → CEO 계정 초대 (Admin이 직접 초대 전까지 CEO 앱 계정 없음)
    → CEO 앱 사용 시작 (Hub, Chat, /office)
```

> **강제 구현 (2단계):**
> - **Admin 측 — Wizard 방식**: 기존 `getOnboardingStatus` API 기반 Step 1~6 잠금 해제 Wizard (Notion/Linear 패턴). "막는" 느낌 없이 단계 완료 시 다음 단계 활성화.
> - **CEO 측 — ProtectedRoute 체크**: `packages/app/src/App.tsx` `ProtectedRoute` (현재 `isAuthenticated`만 체크)에 `getOnboardingStatus()` 확인 추가 → `completed === false`이면 Setup Required 화면으로 리다이렉트. (API 실존: `onboarding.ts` — `{ completed: boolean }` 반환. v2에서 이 체크가 없어 문제 발생 — 코드 검증 완료)

> **1인 창업자 노트**: Admin=CEO 동일인인 경우 — Admin 설정 완료 후 CEO 앱으로 전환. 동일 계정으로 두 앱 접근 가능 (Admin: `/admin/...`, CEO: `/...`). 온보딩 순서는 동일하게 적용.

---

### Primary User 1: 시스템 관리자 (Admin 앱) — 첫 번째 사용자

**페르소나: 이수진, 32세, AI 시스템 운영 담당자**

| 항목 | 내용 |
|------|------|
| 역할 | 회사의 AI 조직 전체를 설계·운영 |
| 기술 배경 | 중간 (SaaS 운영 경험, 코딩 불필요) |
| 접근 앱 | Admin 앱 (27개 페이지 v2 기준, v3 +2 예정: n8n 관리 + /office read-only) |
| 사용 빈도 | 초기 집중 설정 + 주 1~2회 유지보수 |

**핵심 문제 (Before v3):**
- "에이전트를 만들었는데 다 똑같이 말한다. 전략 담당과 고객 응대 담당이 같은 톤이면 안 된다."
- "워크플로우를 만들려면 코드를 짜야 한다. 나는 개발자가 아니다."
- "에이전트가 어제 실수한 걸 오늘도 반복한다. 학습이 안 된다."

**v3 주요 사용 기능:**
- **Big Five 성격 슬라이더** (에이전트 생성/편집): 역할에 맞는 개성 설정
- **n8n 관리 페이지**: 드래그앤드롭으로 Telegram/Slack 자동화 구축
- **메모리 설정**: Reflection 크론 주기, Tier별 한도 관리
- **NEXUS 조직도**: 에이전트 계층 구조 시각화
- **Soul Templates**: 에이전트 시스템 프롬프트 템플릿
- **`/office` read-only 뷰**: 에이전트 실시간 운영 상태 모니터링 (Admin 관찰 전용 — 태스크 지시는 CEO 앱에서)

**성공 순간 (AHA Moment):**
성실성(conscientiousness) 슬라이더를 1.0으로 설정한 에이전트가 이전과 달리 체크리스트를 자동으로 작성하며 꼼꼼하게 응답하는 것을 처음 확인하는 순간. "이게 진짜 개성이네."

**User Journey:**
1. Admin 앱 로그인 → 회사 설정
2. 부서 생성 (영업팀, 개발팀, 마케팅팀)
3. 에이전트 생성 + Big Five 슬라이더로 역할별 성격 설정
4. Soul Template 적용 + 도구 배정
5. n8n 워크플로우: Telegram 알림 → 에이전트 자동 트리거 설정
6. CEO 계정 초대 → CEO 앱 사용 준비 완료
7. (엔터프라이즈) Admin 다중 계정 추가 → 단일 장애점 해소 (v2 기능, 유지)

---

### Primary User 2: CEO / 창업자 (CEO 앱) — 두 번째 사용자

**페르소나: 김도현, 38세, SaaS 스타트업 대표**

| 항목 | 내용 |
|------|------|
| 역할 | AI 조직에 태스크를 지시하고 결과를 감독 |
| 기술 배경 | 낮음 (비개발자, 비즈니스 집중) |
| 접근 앱 | CEO 앱 (42개 페이지 v2 기준, v3 +1 예정) |
| 사용 빈도 | 매일 (Hub, Chat, /office, Dashboard) |
| 전제 조건 | Admin 설정 완료 후 접근 가능 |

**핵심 문제 (Before v3):**
- "내 AI 팀이 지금 뭘 하는지 모르겠다. 텍스트 로그는 너무 기술적이다."
- "에이전트가 어제 했던 실수를 오늘도 한다. 발전이 없다."
- "워크플로우를 만들어달라고 하면 개발팀에 요청해야 한다."

**v3 주요 사용 기능:**
- **`/office` 가상 사무실**: 에이전트 실시간 상태 시각화 (idle/working/speaking/tool_calling/error)
- **Hub**: 전체 AI 조직 현황 한눈에
- **Chat**: 에이전트와 직접 대화, 태스크 지시
- **n8n 워크플로우 결과**: 자동화 실행 현황 확인
- **Costs / Reports**: 에이전트 비용·성과 추적

**성공 순간 (AHA Moment):**
`/office`를 처음 열었을 때 — 픽셀 캐릭터 에이전트들이 각자 책상에서 실시간으로 타이핑하고, 한 에이전트가 도구를 집어드는 순간. "내 AI 팀이 실제로 일하고 있다는 걸 처음으로 '봤다'."

한 달 후 — 처음에는 3번 수정해야 했던 보고서를 에이전트가 1번 만에 완성하는 순간. "이 에이전트가 성장했다."

**User Journey:**
1. Admin이 초대 → CEO 앱 첫 로그인
2. Hub 대시보드 확인 (조직 현황)
3. Chat에서 에이전트에게 태스크 지시
4. `/office` 화면에서 실시간 처리 과정 관찰 (WOW 모먼트)
5. Reports에서 결과 확인
6. 시간이 지날수록 에이전트 응답 품질 향상 체감 (메모리 효과)

---

### Secondary Users

**에이전트 자체 (시스템 내부 행위자):**
- CORTHEX에서 AI 에이전트는 사용자가 아니라 운영 대상이다.
- 단, `/office`에서 시각화되는 주체이며, Big Five 성격·메모리 아키텍처의 수혜 대상.

**일반 직원 (Messenger, Agora 사용자 — v2 기능, v3에서 유지):**
- 에이전트와 Messenger/Agora에서 직접 대화하는 사람들.
- v3 신규 기능 직접 사용 없음. 기존 v2 기능 그대로 사용.

---

### User Segment 요약

| 구분 | 유저 | 앱 | 온보딩 순서 | v3 신규 가치 |
|------|------|-----|------------|-------------|
| Primary #1 | 시스템 관리자 (이수진) | Admin | **1번째** | Big Five 슬라이더, n8n 관리, 메모리 설정 |
| Primary #2 | CEO (김도현) | CEO 앱 | **2번째** (Admin 완료 후) | `/office` 가상 사무실, 에이전트 성장 체감 |
| Secondary | 일반 직원 | CEO 앱 일부 | — | 기존 v2 기능 유지 |

> **페이지 수 참고**: v2 총 71개 = Admin 27 + CEO 42 + Login 2. v3 신규 3페이지(Admin: n8n 관리 + /office read-only, CEO: /office) 추가 예정 → **74개** 예상.

---

## Success Metrics

> ℹ️ **방침**: 이 섹션은 방향성 지표 정의. 구체적 수치 목표는 PRD 단계에서 확정.

### 사용자 성공 지표 (User Success)

| 지표 | 측정 방법 | 목표 방향 |
|------|-----------|-----------|
| 온보딩 완료율 | 필수 단계(회사설정·조직구성·에이전트설정·CEO초대) 기준. n8n·테스트태스크 optional 제외. 측정 proxy: `getOnboardingStatus` `completed === true` 기준. step-level 퍼널이 필요한 경우 `completedSteps` 배열 추가 — PRD 결정 | ↑ 높을수록 좋음 |
| CEO /office 첫 접속 WOW 달성률 | 첫 접속 시 에이전트 working 상태 목격 비율 | ↑ 90%+ 목표 (테스트 태스크 완료 시 달성 가능, 권장) |
| Big Five 성격 설정 에이전트 비율 | 에이전트 생성 후 슬라이더 조작 비율 | ↑ Admin AHA 지표 |
| 에이전트 재수정 횟수 감소 | 동일 유형 태스크 수정 요청 횟수 추이 | ↓ 6개월 후 초기 대비 감소 (메모리 효과) |

### 레이어별 KPI

**Layer 1 — Virtual Office 가상 사무실:**
- `/office` 페이지 5분+ 체류 비율 (WOW 리텐션 지표)
- WebSocket 연결 안정성: 에러율 < 1% (`/ws/office` 채널)
- PixiJS 번들: < 200KB gzipped (VPS 제약 — 하드 한도)

**Layer 2 — n8n 워크플로우:**
- Admin당 월 활성 워크플로우 수 (신규 자동화 채택률)
- n8n 트리거 → 에이전트 실행 성공률 > 95%
- 기존 ARGOS 크론 중단율: 0% (Zero Regression 지표)

**Layer 3 — Big Five 성격 시스템:**
- Big Five 슬라이더 사용 에이전트 비율 (기본값 유지 = 미사용으로 간주)
- 역할별 성격 프리셋 채택률 (관리자가 템플릿 사용 여부)
- soul-renderer.ts `{{personality_traits}}` 주입 성공률: 100% (측정: `renderSoul()` try-catch 에러 → `task_executions.error_code` 기록. extraVars 누락 시 fallback 문자열 주입 + worker log 경고 — 기존 실패 추적 경로 재활용)

**Layer 4 — 에이전트 메모리:**
- Reflection 생성 수 추이 (일 1회 크론 실행 기준)
- Tier별 Reflection LLM 비용 한도: 수치는 PRD에서 정의 (⚠️ 이월 — PRD에서 미정의 시 v3 출시 블로커)
- 기존 `agent_memories` 데이터 단절률: 0% (Zero Regression — Option B 채택 기준)
- **Capability Eval** (ECC 2.4): 에이전트 성장 검증 — 동일 유형 태스크 3회 반복 시 3회차 재수정률 ≤ 50% (메모리 효과 측정). 측정 방법 PRD에서 확정.

**Layer 0 — UXUI 리셋 (Design System):**
- 하드코딩 색상: `themes.css` 외 0곳 (기존 428곳 → 0. ESLint 룰 자동 게이팅)
- Dead button: 0개 (Playwright E2E 자동 감지)
- Phase 0 디자인 게이팅: Stitch 2 기준 대비 구현 일치율 ≥ 95%

### 비즈니스 목표 (Business Objectives)

| 목표 | 지표 | 타임라인 | 측정 방법 |
|------|------|---------|---------|
| v3 출시 후 기존 v2 사용자 이탈 없음 | v2→v3 기능 연속성 (485 API 보존) | 출시 직후 | smoke-test 전 API 200 OK |
| 에이전트 운영 가시성 향상 | CEO /office 일간 사용률 | 3개월 후 | `/ws/office` 세션 duration 서버 로깅 (신규 구현, 별도 analytics Epic 불필요) |
| 자동화 자립도 향상 | n8n 워크플로우 Admin 직접 생성 비율 | 6개월 후 | n8n API 워크플로우 생성 이벤트 |
| 에이전트 품질 향상 체감 | 동일 태스크 재수정 횟수 감소 | 6개월 후 | 기존 execution log 기반 (PRD 집계 방법 확정) |

> ℹ️ **측정 인프라**: CEO /office 체류율 = `/ws/office` 세션 duration 서버 로깅으로 대체 측정 가능. 기타 KPI는 기존 execution log 기반 또는 PRD Phase 5에서 결정.

---

## MVP Scope

> **결정**: v3 단일 릴리즈 — Phase 없음. 4개 레이어 전부 v3에 포함.

### Sprint 구현 순서 (Step 02 확정)

| Sprint | 레이어 | 내용 | 기간 (추정) | 의존성 / 선행 조건 |
|--------|--------|------|------------|--------|
| **Pre-Sprint** | **Phase 0** | 디자인 토큰 확정 (Stitch 2 아키타입 선택) | ~1주 | **Sprint 1 착수 전 완료 필수** — 미확정 시 전 Sprint UI 재작업 리스크 |
| 병행 | **Layer 0** | UXUI 완전 리셋 (3단계 분리) | 전 Sprint 병행 (~30%) | **L0-A**: 토큰 결정(블로킹, Pre-Sprint). **L0-B**: 레거시 428색상 정리(병렬). **L0-C**: 신규 페이지 테마(각 Sprint 내). 중간 게이팅: Sprint 2 종료까지 74페이지 중 ≥ 60% Stitch 2 스펙 매칭(≥95% fidelity) + 하드코딩 색상 0 + dead button 0 미달 시 레드라인 검토 |
| Sprint 1 | **Layer 3** | Big Five 성격 시스템 | ~2주 | 독립 · 낮음. Phase 0 테마 확정 선행 필수 |
| Sprint 2 | **Layer 2** | n8n 워크플로우 연동 | ~3주 | 독립 · 중간. n8n↔CORTHEX 통합 패턴 Architecture에서 확정 필수 |
| Sprint 3 | **Layer 4** | 에이전트 메모리 3단계 | ~4주 | 복잡 · 높음. **PRD Tier 비용 한도 확정 선행 필수** (미확정 시 블로커 — 완화: Reflection 비용 범위 $0.10~$0.50/agent/day Haiku 기준 하류 계획 가능) |
| Sprint 4 | **Layer 1** | Virtual Office 가상 사무실 | ~3주 | 에셋 선행 필수. **Stage 1 Technical Research 에셋 품질 승인 완료 선행 조건** |
| | | | **총 ~14주** (Pre 1 + S1 2 + S2 3 + S3 4 + S4 3 + Layer 0 병행) | Solo dev + AI 기준 추정. PRD에서 세부 확정. |

### Core Features (In Scope)

**Layer 0 — UXUI 완전 리셋 (전 Sprint 병행, 3단계 분리):**
- **L0-A (블로킹)**: Stitch 2 기반 디자인 시스템 + Phase 0 아키타입 테마 선택 (Pre-Sprint 완료 필수). 테마 선택 시 Virtual Office 픽셀 아트 호환성 평가 기준 포함 (시각적 일관성 원칙).
- **L0-B (병렬)**: 하드코딩 색상 428곳 → `themes.css` 토큰 전환 (ESLint 게이팅). Dead button 0개 (Playwright E2E 검증). 레거시 페이지 정리 — Sprint과 병렬 실행.
- **L0-C (내장)**: 신규 페이지 테마 적용 — 각 Feature Sprint 내에서 해당 페이지 UXUI 동시 작업.
- Phase 0 게이팅: Stitch 2 기준 대비 구현 일치율 ≥ 95%
- **신규 페이지 사이드바 IA 결정**: n8n 관리(Admin) + /office read-only(Admin) + /office(CEO) 배치 위치 → Layer 0에서 선행 결정
- **선행 조건 이유**: CEO `/office` 픽셀 아트 감성과 앱 전체 UI 테마의 시각적 일관성 확보 — Layer 0가 내부 부채 해소임과 동시에 v3 아이덴티티(Virtual Office 감성)의 기반임
- **접근성 기본선**: WCAG 완전 준수는 v4 범위이나, v3에서 최소 키보드 내비게이션 + ARIA 기본 레이블 필수. PixiJS Canvas 접근성 대안(텍스트 fallback) Architecture에서 설계.

**Layer 3 — Big Five 성격 시스템 (Sprint 1):**
- `agents.personality_traits JSONB` 컬럼 추가
- `engine/soul-renderer.ts` `extraVars` 확장 → `{{personality_traits}}` 변수 주입 (E8 경계 준수)
- Admin 앱: 에이전트 생성/편집 Big Five 슬라이더 UI (5개 특성, 0.0~1.0)
- 역할별 성격 프리셋 템플릿

**Layer 2 — n8n 워크플로우 연동 (Sprint 2):**
- n8n Docker 컨테이너 (API-only 모드, 포트 5678 내부망 전용, `--memory=2g --restart unless-stopped`)
- Hono 리버스 프록시: `/admin/n8n/*` → `localhost:5678` (Admin UI용 기존 JWT 인증 재활용)
- **n8n ↔ CORTHEX 통합 패턴** (Architecture에서 상세 설계):
  - n8n → CORTHEX: n8n webhook 노드 → CORTHEX `/api/v1/tasks` POST (서비스 계정 API 키 인증, 사용자 JWT 아님)
  - CORTHEX → n8n: 태스크 완료 시 n8n callback URL POST (결과 + 상태)
  - 에러 전파: 태스크 실패 시 n8n에 에러 코드 + 메시지 반환 → n8n 자체 재시도/알림
- Admin 앱: n8n 관리 페이지 (+1 페이지)
- 기존 ARGOS(`services/argos-service.ts`) 유지 — n8n은 신규 자동화 전용

**Layer 4 — 에이전트 메모리 3단계 (Sprint 3):**
- **Option B 채택** (Zero Regression 준수):
  - 기존 `agent_memories` 테이블 `memoryTypeEnum`에 `'reflection'`, `'observation'` 추가
  - 크론 모드: `memory-extractor.ts` 직접 확장 대신 **신규 `memory-reflection.ts` 분리** (race condition 방지, E8 경계 철학 준수 — 즉시 추출 모드 완전 분리)
  - 신규 `observations` 테이블 추가 (raw 실행 로그 INPUT 계층 — 기존에 없음)
  - 3단계 흐름: 실행완료 → `observations`(raw) → `memory-reflection.ts` 크론 → `agent_memories[reflection]`(OUTPUT). `observations`는 `agent_memories` 대체가 아닌 INPUT 계층.
- Neon serverless zero-downtime migration: schema push 사전 배포 패턴 적용 (관련 테이블: observations 신규, memoryTypeEnum 확장)
- Reflection 크론: 기본 일 1회. Tier별 비용 한도 — PRD에서 수치 확정 (⚠️ Sprint 3 블로커)
- **call_agent 핸드오프 응답 표준화** (ECC 2.7): 위임 체인 응답 포맷 `{ status, summary, next_actions, artifacts }` — Tracker UI 일관성 + 메모리 관찰 품질 향상. E8 경계 준수 (engine 외부 레이어에서 구현).
- **에이전트 감사 로그** (ECC 2.1): 민감 작업(도구 실행, 외부 API 호출, 비용 임계치 초과) 수행 시 감사 로그 기록 — `observations` 테이블 또는 별도 audit log. CEO 신뢰 투명성 기여.
- **Tier별 비용 인지 모델 라우팅** (ECC 2.2): 태스크 복잡도에 따라 Haiku/Sonnet 자동 선택 — Admin이 Tier별 모델 배정 설정 가능. 예산 초과 시 에이전트 실행 자동 차단.
- 기존 `agent_memories` v2 데이터 단절 없음

**Layer 1 — Virtual Office 가상 사무실 (Sprint 4):**
- PixiJS 8 + @pixi/react, Tiled JSON, CEO `/office` 라우트 추가
- 에이전트 픽셀 캐릭터: 상태별 애니메이션 (idle / working / speaking / tool_calling / error)
- `/ws/office` WebSocket 채널 추가 (기존 16 → 17)
- **접근성**: Canvas 내용의 텍스트 대안(ARIA live region으로 에이전트 상태 변경 알림), 키보드 에이전트 선택
- 에셋: LPC Sprite Sheet(오픈소스) + **AI 직접 생성** (Midjourney/DALL-E 또는 최신 AI 스프라이트 도구 — Stage 1 Technical Research에서 조사)
- ⚠️ **에셋 품질 리스크**: Stage 1 Research 결과 불충분 시 Sprint 4 착수 전 대안 확정 필수 (Go/No-Go #8 참조)
- VPS 번들 하드 한도: < 200KB gzipped

### Out of Scope

| 항목 | 이유 |
|------|------|
| `agent_memories` 대체 신규 테이블 생성 | Option B 채택 — 기존 확장만 (Zero Regression) |
| 기존 485 API 변경 | Zero Regression 절대 규칙. **워크플로우 API 예외**: `workflows.ts` 11개 엔드포인트는 n8n 대체 후에도 200 OK 유지하되, 응답에 `{ deprecated: true, migrateTo: "n8n" }` 플래그 추가. 기능적으로 dead endpoint가 되지만 Zero Regression smoke test는 통과. 완전 제거는 v4 범위. |
| 기존 86 테이블 삭제/변경 | Zero Regression 절대 규칙 |
| `engine/agent-loop.ts` 직접 수정 | E8 경계 — 신규 서비스 레이어에서 호출만 허용 |
| Redis 전환 | v3 범위 외 (Deferred) |
| OAuth CLI 아키텍처 변경 | v3 범위 외 |
| PixiJS 유료 에셋 구매 | AI 직접 생성 + 오픈소스(LPC) 기반으로 대체 (Stage 1 Technical Research 포함) |
| n8n 포트 5678 외부 노출 | 보안 절대 금지 — Hono 프록시 전용 |
| 멀티테넌트 분리 아키텍처 변경 | v3 범위 외 |

### MVP Success Criteria

v3 출시 조건 (Go/No-Go 게이트):

1. **Zero Regression**: 기존 485 API 전부 smoke-test 200 OK
2. **Big Five 주입**: `soul-renderer.ts` renderSoul() 호출 후 Soul에 `personality_traits` 실제 주입 확인 — extraVars 키 존재 여부 + 빈 문자열 여부 검증 포함 (빈 문자열 주입 = FAIL, task_executions 검증)
3. **n8n 보안**: 포트 5678 외부 차단 확인 + Hono 프록시 인증 통과 + 서비스 계정 API 키 인증 검증
4. **Memory Zero Regression**: v2 기존 `agent_memories` 데이터 단절 0건
5. **PixiJS 번들**: < 200KB gzipped (VPS 하드 한도)
6. **UXUI Layer 0**: ESLint 하드코딩 색상 0 + Playwright dead button 0
7. **Reflection 비용 한도 + 자동 차단**: Tier별 한도 PRD 확정 후 구현 (미확정 시 Sprint 3 블로커). Tier별 일일/월간 예산 한도 초과 시 에이전트 실행 자동 차단 메커니즘 포함 (ECC 2.2).
8. **에셋 품질 승인**: Stage 1 Technical Research 에셋 방향 승인 완료 — 최소 기준: 5개 상태 애니메이션 프레임 세트, 32×32 이상 해상도, 스타일 일관성 (Sprint 4 착수 선행 조건)
9. **에이전트 보안**: Tool response sanitization 검증 — tool output 경유 프롬프트 주입 방어 확인 (ECC 2.1: 에이전트 84% 취약, CORTHEX = 사용자 CLI 토큰 기반 "root access agent" 패턴)
10. **v1 기능 패리티**: v1-feature-spec.md 체크리스트 전수 검증 — 슬래시 명령어 8종, CEO 프리셋, 위임 체인 추적, AGORA 토론 등 기능 수준 동작 확인 (API smoke test와 별도). **의도적 제외 목록**: Gemini 모델 지원 (key constraint로 금지), GPT 모델 지원 (CEO 결정으로 제거, commit e294213) — 이 항목들은 v1 패리티 검증에서 명시적 예외 처리.
11. **사용성 검증**: 실제 사용자 태스크 플로우 완주 확인 — Admin: 온보딩 위저드 외부 도움 없이 완료. CEO: Virtual Office 열기 → 에이전트 식별 → Chat → 태스크 지시 → Virtual Office에서 확인, 5분 이내 완주. (v2 교훈: 기술 완성도 ≠ 제품 완성도)

### Future Vision (v4+)

- 멀티모달 에이전트 (음성, 이미지 처리)
- Virtual Office 멀티플레이어 (여러 CEO가 같은 가상 사무실 접속)
- 에이전트 간 자율 협업 (현재: 인간 지시 기반만)
- Redis 기반 실시간 캐시 (현재: Deferred)
- 외부 고객 대면 에이전트 (현재: 내부 조직 운영만)
- WCAG AA 완전 준수 (현재: 키보드 내비게이션 + ARIA 기본선만)
- 크로스 프로젝트 글로벌 인사이트 승격 — 동일 패턴이 2+ 회사에서 발견 시 글로벌 인사이트로 자동 승격 (ECC 2.3, 프라이버시 설계 필수)
- 비서 에이전트 트리아지 강화 — 메시지 4단계 분류: skip/info_only/meeting_info/action_required (ECC 2.8, Hub/알림 UX 개선)
- 에이전트별 사용자 선호도 학습 — Layer 4 메모리와 연동하여 에이전트가 개별 사용자의 선호 패턴 기록 (ECC 2.8)

---

## Technical Constraints

> 아래 제약조건은 모든 Sprint 설계에 적용됨.

| 제약 | 한도 | 근거 |
|------|------|------|
| PixiJS 8 번들 | < 200KB gzipped | VPS 대역폭 + CEO 앱 로드 성능 |
| n8n Docker | 별도 컨테이너, `--memory=2g --restart unless-stopped` | VPS 24GB RAM 중 ~2GB 할당, OOM 방지 |
| n8n 네트워크 | 포트 5678 내부망 전용, 외부 노출 절대 금지 | Hono 리버스 프록시 + 서비스 계정 API 키 인증 |
| Agent memory DB | 기존 Neon PostgreSQL + pgvector | 별도 DB 인스턴스 불가 |
| 임베딩 프로바이더 | Voyage AI `voyage-3` (1024d) | Gemini 금지 (key constraint). Anthropic 권장. 기존 `vector(768)` Gemini → `vector(1024)` Voyage AI 마이그레이션 + re-embed 필수. |
| WebSocket | 기존 16채널 + `/ws/office` = 17채널 | 기존 Bun WS 인프라 활용 |
| 신규 인프라 | n8n Docker 컨테이너 1개만 허용 | VPS 리소스 제한 |
| observations 보존 | Reflection 처리 후 30일 purge | Neon 스토리지 비용 + 성능 |
| MCP 서버 health check | Stitch 2, Playwright MCP 무응답 시 자동 알림 크론 | ECC 2.1: MCP 서버 43% 명령어 주입 취약. health check로 장애 조기 감지. Architecture NFR 상세 설계. |
| 비용 기록 immutability | cost-aggregation 데이터 append-only (수정/삭제 불가) | ECC 2.2: 비용 데이터 무결성 보장. frozen dataclass 패턴 Architecture에서 설계. |

---

## Risks

| # | 리스크 | 확률 | 영향 | 완화 전략 |
|---|--------|------|------|-----------|
| R1 | **Phase 0 테마 결정 지연** → 전 Sprint 캐스케이딩 | M | H | L0-A를 Pre-Sprint에 블로킹 배치. 1주 타임박스. 미확정 시 기본 테마(이전 Natural Organic 베이스) 임시 적용 후 Sprint 1 착수. |
| R2 | **n8n Docker VPS 리소스 경합** — CPU/RAM 부족으로 CORTHEX 성능 저하 | M | M | `--memory=2g` 하드 제한. VPS 모니터링(htop cron). n8n 워크플로우 동시 실행 수 제한. 위기 시 n8n 재시작 정책. |
| R3 | **Reflection LLM 비용 폭발** — 에이전트 수 × 관찰량 × 빈도 = 예측 불가 비용 | H | H | Tier별 Reflection 한도 PRD에서 확정 (범위: $0.10~$0.50/agent/day Haiku 기준). 일일 비용 cap. 관찰량 임계치 초과 시 샘플링. |
| R4 | **PixiJS 에셋 품질 불확실** — AI 생성 픽셀 아트 품질이 기대치 미달 | M | H | Stage 1 Technical Research에서 에셋 방향 선행 검증 (Go/No-Go #8). 대안: LPC Sprite Sheet 오픈소스 베이스 + 최소한의 커스텀. |
| R5 | **Tool response 프롬프트 주입 + 토큰 유출** — 에이전트가 도구 응답 경유 악의적 지시를 실행하거나 CLI 토큰 유출 | H | H | 기존 4-layer sanitization 확장 → tool output도 검증. Go/No-Go #9 보안 게이트. ECC 2.1 권고 기반 방어 계층. CORTHEX = 사용자 CLI 토큰 기반 실행 → root access agent 패턴 인식 필수. **CLI 토큰 유출 감지 시 자동 비활성화 메커니즘** (ECC 2.1 secret rotation). |
| R6 | **UXUI 인터리브 용량 초과** — Layer 0이 Sprint 예산의 40%+ 소모 | M | M | 3단계 분리(L0-A/B/C)로 블로킹 최소화. Sprint 2 종료 게이팅 (74페이지 중 60% Stitch 2 매칭). 미달 시 Layer 0 전용 스프린트 삽입. |
| R7 | **v2 실패 반복** — 기술 완성도 높으나 실사용 불가 | H | H | Go/No-Go #11 사용성 검증 게이트 추가. Admin/CEO 핵심 워크플로우 end-to-end 완주 확인. 기술 게이트만으로 출시 판단 금지. v2 교훈: 10,154 테스트 + 485 API → 실사용 0 → 폐기. |
| R8 | **PixiJS 8 학습 곡선** — 팀 경험 없는 새 의존성 | M | M | Sprint 4(최후) 배치로 다른 Sprint에서 학습 시간 확보. 참고 레포(Claw Empire, Agent Town) 코드 분석 선행. |
| R9 | **PixiJS Canvas 접근성** — 스크린 리더 완전 불가 | H | M | ARIA live region으로 에이전트 상태 변경 텍스트 알림 제공. 키보드 에이전트 선택. 전체 WCAG 준수는 v4 범위이나 v3에서 기본선 확보. |
| R10 | **Virtual Office 인지 과부하** — 에이전트 20+ 시 UX 붕괴 | M | H | 부서별 "방(room)" 분리, 상태 필터(working만), 줌/패닝, 미니맵. Architecture에서 상세 설계. |
