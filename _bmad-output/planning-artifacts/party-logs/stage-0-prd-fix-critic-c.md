# Critic-C Review — Stage 0: PRD v3 Spec Fix

**Reviewer:** John (PM) + Bob (SM)
**File reviewed:** `_bmad-output/planning-artifacts/prd.md` (Phase 5 sections)
**Date:** 2026-03-20
**Cross-checked against:** `v3-openclaw-planning-brief.md`, `v3-corthex-v2-audit.md`, `v1-feature-spec.md`

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | 파일 경로·마이그레이션 번호 대부분 명시됨. 단 FR-OC7의 activity_logs 폴링 메커니즘(주기? DB 트리거? LISTEN/NOTIFY?) 미명시 |
| D2 완전성 | 6/10 | Phase 5 전용 NFR 0개. OpenClaw FPS 기준, /ws/office 이벤트 주파수 한도, memory-reflection 최대 실행시간 전무. 4개 기능 간 의존 순서 없음 |
| D3 정확성 | 7/10 | NFR-SC7 "Oracle VPS 4GB 기준" — 감사 문서 및 planning brief의 "24GB/4-core"와 6× 불일치. 나머지 수치(485/86/71/10154)는 감사 기준으로 수정됨 |
| D4 실행가능성 | 7/10 | FR-PERS3·FR-MEM6은 agent-loop.ts에 코드 추가 없이 구현 불가. 현재 명세 그대로면 개발자가 규칙 위반 없이 구현할 방법을 스스로 찾아야 함 |
| D5 일관성 | 4/10 | **Phase 5 절대 규칙 1번("engine/agent-loop.ts 수정 금지")과 FR-PERS3·FR-MEM6이 직접 충돌** (2건의 Critical 불일치 — 아래 상세) |
| D6 리스크 | 6/10 | n8n Docker VPS 메모리 예산 미산정. 기존 워크플로우 DB 데이터 마이그레이션 계획 없음. 4개 기능 Phase 5 동시 개발 리스크 미등재 |

## 가중 평균: **6.3/10 ❌ FAIL**

> D5 = 4 (7 미만). 전체 6.3 (7 미만). 재작성 요구.

---

## 이슈 목록

### 🔴 Issue 1 (Critical) — D5 일관성: FR-PERS3·FR-MEM6 vs 절대 규칙 1번 직접 충돌

**규칙 (prd.md L569):**
> "engine/agent-loop.ts 수정 금지 — 시각화·성격·메모리 전부 '위에 얹는 것'"

**충돌 FR:**
- **FR-PERS3 (prd.md L1345):** "`engine/agent-loop.ts`의 Soul 변수 치환 단계에서 `{personality_traits}` 변수가...치환된다"
- **FR-MEM6 (prd.md L1356):** "태스크 시작 시 `engine/agent-loop.ts`에서 현재 태스크 임베딩과 cosine ≥ 0.75 반성 상위 3개를 검색하여 `{relevant_memories}` 변수로 Soul에 주입한다"

**John (PM):** "에이전트가 성격과 기억을 가지는 게 핵심 사용자 가치인데, '수정 금지' 규칙이 그 구현을 막고 있어요. 규칙이 맞으면 FR이 틀린 거고, FR이 맞으면 규칙을 수정해야 합니다. 둘 다 살리려면 Soul 변수 치환을 agent-loop.ts 바깥 레이어(예: soul-renderer.ts)로 추출하는 아키텍처 결정이 필요합니다."

**Bob (SM):** "이 모순이 그대로 개발에 들어가면 스토리 작성 단계에서 dev가 규칙을 어겨야 하는 상황이 됩니다. 명확하게 해결하세요: (A) agent-loop.ts 수정 허용 + 규칙 업데이트, 또는 (B) soul-renderer.ts 미들레이어 신설 + agent-loop.ts 최소 수정만 허용."

**수정 방향 (Critic-A 아키텍처 검토 결과):**
- `soul-enricher.ts` 신규 파일 도입 — DB에서 personality_traits + reflections TOP3 조회 → 변수 치환 → enriched Soul 반환
- `agent-loop.ts`는 enriched Soul 문자열만 받음 (내부 변수 치환 로직 불필요)
- 절대 규칙 1번을 "engine/agent-loop.ts 핵심 로직 수정 금지 — soul-enricher.ts 호출 추가만 허용"으로 업데이트
- FR-PERS3·MEM6 구현 위치를 "soul-enricher.ts" 로 수정

---

### 🔴 Issue 2 (High) — D2 완전성: Phase 5 전용 NFR 없음

Phase 5 신규 기능 4개에 대한 비기능 요구사항이 전무합니다.

**누락 항목:**
- OpenClaw PixiJS FPS 기준 없음 (30fps? 60fps? 모바일 폴백?)
- `/ws/office` 이벤트 주파수 한도 없음 (에이전트 100명이면 초당 이벤트 수?)
- `memory-reflection` 워커 최대 실행시간 없음 (Gemini API 타임아웃 시 fallback?)
- n8n Docker 메모리 예산 없음 (VPS 전체 메모리 버짓에 n8n 포함 안 됨)

**Bob (SM):** "Phase 5 NFR이 없으면 QA 단계에서 '통과' 기준이 없습니다. 특히 PixiJS + n8n + memory-reflection이 동시에 돌 때 VPS 부하 시나리오가 아예 없어요."

**수정 필요:** Phase 5 NFR 섹션 신설 — 최소: PixiJS FPS(≥30fps), /ws/office 이벤트 레이트(≤1/초/에이전트), memory-reflection 타임아웃(≤30초), n8n 메모리 예산(≤2GB)

---

### 🟡 Issue 3 (Medium) — D3 정확성: VPS 메모리 스펙 불일치

**NFR-SC7 (prd.md L1403):** "pgvector HNSW 인덱스 포함 ≤ 3GB (**Oracle VPS 4GB 기준**)"

**v3-openclaw-planning-brief.md:** "n8n Docker VPS에 띄우고" + 감사 문서에서 "24GB/4-core" VPS 언급

VPS가 4GB면 Bun 서버 + PostgreSQL + pgvector + n8n Docker(~2GB) + OS = OOM 위험.
VPS가 24GB면 NFR-SC7의 "4GB 기준" 수치 자체가 잘못됨.

**John (PM):** "4GB VPS면 n8n 추가하는 순간 전체가 불안정해집니다. 실제 VPS 스펙을 명확히 하고 메모리 버짓을 다시 계산해야 합니다."

**Critic-A 코드 직접 확인 결과 (architecture.md L211, L1191):**
- VPS 실제 스펙 = **24GB ARM64 4코어** (확정)
- NFR-SC7 "4GB 기준" = PRD 미수정 버그 (architecture.md에 이미 수정 권고 기록됨)
- n8n Docker 2GB 기준 OOM 위험 없음. 단 CPU 4코어 동시 프로세스 경쟁 리스크 존재
- **수정 필요:** NFR-SC7을 "≤ 16GB (Oracle VPS 24GB ARM64 4코어 기준)"으로 수정

---

### 🟡 Issue 4 (Medium) — D1 구체성: FR-OC7 구현 메커니즘 미명시

**FR-OC7 (prd.md L1330):** "서버가 `activity_logs` 테이블을 **tail**하여 상태 이벤트를 생성한다"

"tail"이 어떤 방식인지 불명확:
- (A) 폴링 (주기적 SELECT) → 몇 ms?
- (B) PostgreSQL LISTEN/NOTIFY + 트리거
- (C) 별도 파일 워처

선택에 따라 구현 복잡도·DB 부하가 완전히 달라집니다.

**수정 필요:** FR-OC7에 "PostgreSQL LISTEN/NOTIFY 기반 (또는 N ms 폴링)" 명시

---

### 🟡 Issue 5 (Medium) — D6 리스크: Phase 5 4개 기능 스코프 리스크 미등재

v3 OpenClaw Phase 5에서 솔로 개발자+AI가 동시에 구현해야 하는 항목:
1. PixiJS 8 픽셀아트 가상 사무실 (신기술, 타일맵·스프라이트·애니메이션)
2. n8n Docker VPS 설치 + iframe/API 연동
3. Big Five 성격 시스템 (DB + Soul 주입)
4. 에이전트 메모리 아키텍처 (observations + reflections + Gemini 임베딩 + pgvector)

PRD에 Epic 순서나 병렬화 가이드가 없고, 리스크 섹션에도 스코프 과부하 언급 없음.

**Bob (SM):** "이 4개 기능을 동시에 돌리는 건 현실적이지 않습니다. 최소한 '성격(낮음) → n8n(중간) → 메모리(높음) → OpenClaw(높음)' 순서와 '각각 독립 Epic'임을 PRD에 명시해야 합니다. 순서 없이 들어가면 메모리 아키텍처가 블로커가 될 때 전체가 멈춥니다."

**수정 필요:** Phase 5 섹션에 "구현 우선순위: FR-PERS → FR-N8N → FR-MEM → FR-OC (난이도·의존성 기준)" 및 각 기능이 독립 Epic임을 명시

---

### 🟢 Issue 6 (Low) — D6 리스크: 기존 워크플로우 데이터 마이그레이션 계획 없음

**FR-N8N3:** "기존 워크플로우 자체 구현 코드(서버 라우트 + 프론트 페이지)가 삭제된다"

현재 v2에 워크플로우 DB 테이블이 있다면 삭제 시 데이터 손실. "기존 86개 DB 테이블 유지" 규칙과 충돌 가능성.

**수정 필요:** 기존 워크플로우 DB 테이블 존재 여부 확인 + 있으면 마이그레이션 or archive 계획 명시

---

### 🟡 Issue 7 (추가 — cross-talk with Critic-B) — D5 일관성: Out of Scope 표와 FR-MEM 직접 충돌

**Out of Scope 표 (prd.md L594):**
> "에이전트 메모리 시스템 개편 | autoLearn 유지. 세션 연속성은 나중에 | Phase 5+"

**Phase 5 섹션:** FR-MEM1~FR-MEM8 (8개 FR) — 정확히 이 기능을 Phase 5에서 구현함.

Out of Scope 표가 갱신되지 않아 스코프 정의와 FR 목록이 충돌.

**수정 필요:** Out of Scope 표에서 해당 행 삭제 또는 "Phase 5에서 구현됨 (FR-MEM1~8)"으로 교체

### 🟡 Issue 8 (추가 — cross-talk with Critic-A) — D6 리스크: PixiJS 번들 크기 및 lazy load 미명시

Critic-A 지적: `/office` 페이지 첫 로드 시 PixiJS 8 청크 ~200KB(gzip) 추가. lazy load 명시 없으면 CEO앱 전체 초기 번들에 포함될 수 있음.

**John (PM):** CEO 첫 `/office` 접속이 딜라이트 모먼트여야 하는데 3초+ 로딩이면 역효과.

**수정 필요:** FR-OC1에 "packages/office/는 React.lazy + Suspense로 dynamic import — CEO앱 메인 번들에서 분리" 명시

---

## Cross-talk 요약 (Critic-A, B에게)

- **Issue 1** (FR-PERS3·MEM6 vs agent-loop.ts): 아키텍처 영역 — Critic-A의 의견 요청. soul-renderer.ts 미들레이어 패턴이 적합한가?
- **Issue 3** (VPS 4GB vs 24GB): 보안/인프라 경계 — Critic-B에게 n8n Docker 권한 격리 리스크 확인 요청 (n8n이 동일 VPS에서 CORTHEX DB에 직접 접근 가능한가?)
- **Issue 5** (4개 기능 스코프): 전반적 동의 요청 — 각자 관점에서 Phase 5 스코프가 현실적인지 확인 바람
