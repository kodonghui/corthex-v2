# Critic-A Review — Stage 0: PRD v3 Spec Fix

**Reviewer:** Winston (Architect) + Amelia (Dev)
**Date:** 2026-03-20
**File reviewed:** `_bmad-output/planning-artifacts/prd.md` (읽기 완료)
**Cross-checked:** `v3-corthex-v2-audit.md`, `v3-openclaw-planning-brief.md`, `architecture.md`, `stage-0-prd-fix-snapshot.md`

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 7/10 | SQL DDL, 마이그레이션 번호, 포트(5678), cosine 임계값(≥0.75), 파일 경로 전부 명시. FR-OC7의 "tail" 메커니즘(폴링 vs NOTIFY vs SKIP_LOCKED) 미지정. |
| D2 완전성 | 5/10 | 26개 FR 커버됨. 반성 워커 트리거 메커니즘(FR-MEM3) 미지정. n8n 포트 5678 외부 노출 여부·인증 방식 없음. /office 페이지 번들 전략 없음. |
| D3 정확성 | 4/10 | 485/86/71/10,154 수치 audit과 일치. 마이그레이션 번호 연속(#61~63) 정확. **그러나: FR-MEM6·FR-PERS3가 `engine/agent-loop.ts` 수정을 명시함 — Phase 5 절대 규칙 #1 "수정 금지"와 직접 충돌. 내부 모순.** |
| D4 실행가능성 | 5/10 | observations/reflections DDL 복붙 가능 수준. 그러나 agent-loop.ts "수정 금지"와 FR-MEM6·PERS3 충돌이 해결되지 않으면 어떤 파일을 수정해야 하는지 불명확. "위에 얹는 것"의 실제 구현 경로가 없음. |
| D5 일관성 | 5/10 | planning-brief 절대 규칙("agent-loop.ts 건드리지 않음")과 FR-MEM6·FR-PERS3 직접 모순. 두 섹션이 같은 PRD 안에 공존. |
| D6 리스크 | 5/10 | VPS CPU 병목, SDK 0.x, pgvector ARM64 리스크 기존 섹션에 있음. **누락: n8n Docker VPS 리소스 영향(RAM 512MB~2GB), PixiJS 8 번들 크기(~150~200KB gzip), 포트 5678 외부 노출 시 보안 위험.** |

### 가중 평균: **4.9/10 ❌ FAIL** (cross-talk 반영 후 하향)

- D1: 7 × 0.15 = 1.05
- D2: 5 × 0.15 = 0.75
- D3: 3 × 0.25 = 0.75  ← NFR-SC7 4GB 오류 추가로 하향 (architecture.md와 직접 충돌)
- D4: 5 × 0.20 = 1.00
- D5: 5 × 0.15 = 0.75
- D6: 5 × 0.10 = 0.50
- **합계: 4.80/10** (7 미만 = 재작성)

> D3 = 3점 → 차원별 3점 미만 auto-fail 경계선. NFR-SC7과 agent-loop.ts 모순 둘 다 D3 정확성 훼손.

---

## 이슈 목록

### 🔴 Issue 1 — [D3/D5 정확성·일관성 — AUTO-FAIL 위험] agent-loop.ts 아키텍처 자기모순

**위치:** PRD `Phase 5 절대 규칙 #1` vs `FR-MEM6` vs `FR-PERS3`

**Winston:** "Phase 5 절대 규칙 #1에서 '`engine/agent-loop.ts` 수정 금지 — 시각화·성격·메모리 전부 위에 얹는 것'이라고 명시했다. 그런데 같은 PRD의 FR-MEM6에서 '태스크 시작 시 `engine/agent-loop.ts`에서 현재 태스크 임베딩과 cosine ≥ 0.75 반성 상위 3개를 검색하여 `{relevant_memories}` 변수로 Soul에 주입한다'고 명시한다. FR-PERS3도 동일하게 '`engine/agent-loop.ts`의 Soul 변수 치환 단계에서 `{personality_traits}` 변수가 치환된다'고 한다. 이건 모순이 아니라 충돌이다. 개발자가 이 PRD를 보고 구현하면 어느 쪽이 맞는지 알 수 없다."

**Amelia:** "`agent-loop.ts`의 Soul variable substitution 로직(FR23 Phase 1에서 이미 구현됨)에 `{personality_traits}`와 `{relevant_memories}`를 추가하려면 해당 파일을 수정해야 한다. 수정 경로가 두 가지다: (A) agent-loop.ts를 직접 수정 — 절대 규칙 위반. (B) Soul을 agent-loop.ts에 넘기기 전에 전처리하는 `soul-enricher.ts` 같은 미들웨어를 삽입 — '위에 얹는 것' 철학에 부합. PRD는 (A)를 FR에 명시하면서 (B)를 의도하는 것 같다. 어느 쪽으로 구현할지 명확히 해야 한다."

**Fix 필요:** FR-MEM6, FR-PERS3에서 `engine/agent-loop.ts` 참조를 `packages/server/src/services/soul-enricher.ts` (신규 서비스, agent-loop.ts 호출 전 Soul 전처리)로 교체. Phase 5 기술 스택 테이블에 soul-enricher.ts 추가. 절대 규칙 #1에 "Soul 변수 치환 포함 — soul-enricher.ts에서 처리" 명시.

---

### 🔴 Issue 2 — [D2 완전성 — 구현 블로커] FR-OC7 realtime 메커니즘 미지정

**위치:** PRD `FR-OC7`: "서버가 `activity_logs` 테이블을 tail하여 상태 이벤트를 생성한다"

**Winston:** "`activity_logs` tail 방식이 지정되지 않았다. PostgreSQL의 `LISTEN/NOTIFY`를 쓰면 이벤트 드리븐이지만 Neon serverless에서 NOTIFY 지원 여부를 확인해야 한다. 폴링이면 100ms마다 DB 쿼리를 날리는 건데 4코어 VPS에서 사무실 페이지를 여러 명이 열면 초당 10+ DB 쿼리가 추가된다. 아키텍처 결정이 필요하다."

**Amelia:** "`office-channel.ts` 파일 경로는 명시됐는데 내부 구현 패턴이 없다. `setInterval(() => db.query('SELECT * FROM activity_logs WHERE created_at > ?'), 100)` 이면 퍼포먼스 문제고, `db.listen('agent_status_changed', ...)` 이면 Neon serverless 호환 여부 검증이 필요하다. 둘 중 하나를 명시해야 story 작성이 가능하다."

**Fix 필요:** FR-OC7에 "방식: PostgreSQL NOTIFY (`agent_status_changed` 이벤트) — Neon 지원 확인 후 폴백으로 500ms polling. `office-channel.ts`는 Hono WebSocket Helper의 `upgrade()` 패턴 사용" 추가.

---

### 🟠 Issue 3 — [D6 리스크 — 누락] n8n Docker VPS 리소스 영향

**위치:** PRD `Phase 5 절대 규칙 #4` / `Feature 5-2` 리스크 섹션 없음

**Winston:** "Oracle VPS 4코어 24GB에서 현재 돌아가는 것: Bun 서버, PostgreSQL, pgvector, GitHub Actions self-hosted runner, Docker. n8n Docker는 Node.js + PM2 기반으로 최소 512MB, 실무에서는 1~2GB를 쓴다. CI/CD 빌드 중에 n8n + 신규 query() 세션이 동시에 올라오면 메모리·CPU 리스크가 생긴다. PRD 리스크 섹션에 n8n이 아예 없다."

**Amelia:** "n8n은 포트 5678을 열지만 Oracle VPS Security List에 이 포트를 추가해야 한다. Admin iframe 방식이면 Admin 앱에서 5678로 직접 접근하는데, 인증 없이 외부에 n8n UI가 노출된다. n8n basic auth 또는 Cloudflare Tunnel이 필요하다. 이 보안 요구사항이 PRD에 없다."

**Fix 필요:** Feature 5-2 리스크에 "(1) VPS 리소스: n8n Docker ≤ 1GB RAM 상한 설정 (n8n 환경변수 `NODE_OPTIONS=--max-old-space-size=1024`). (2) 보안: n8n basic auth 활성화 필수 (포트 5678 raw 노출 금지). Admin iframe은 Nginx proxy를 통해 `/n8n/` 경로로 내부 프록시" 추가.

---

### 🟠 Issue 4 — [D6 리스크 — 누락] PixiJS 8 번들 크기와 NFR-P4 충돌 미검토

**위치:** `Phase 5 기술 스택` / `NFR-P4` (허브 ≤ 300KB gzip)

**Winston:** "PixiJS 8 minified는 약 450KB, gzip 후 약 160~200KB다. `packages/office/`를 독립 패키지로 분리했지만, `/office` 라우트가 CEO앱에 포함되면 해당 페이지 첫 로드에 PixiJS 청크가 포함된다. CEO앱 전체 번들(≤ 300KB gzip) 제약과 office 페이지 번들이 충돌할 수 있다."

**Amelia:** "Vite 코드 스플리팅으로 `/office` 진입 시 lazy load하면 main bundle 제약은 지킬 수 있다. 하지만 `@pixi/react`까지 포함하면 PixiJS 청크 자체가 200KB+가 된다. PRD에 'office 페이지 lazy import + 독립 청크' 명시가 없다. story에서 빠지면 개발자가 모를 수 있다."

**Fix 필요:** FR-OC1에 "PixiJS 8 + @pixi/react는 `/office` 라우트 진입 시 lazy load (React.lazy + dynamic import). Vite 번들 분석으로 main chunk ≤ 300KB 유지 검증 필수" 추가.

---

### 🔴 Issue 6 — [D3 정확성 — 코드 검증 실패] NFR-SC7 "4GB 기준" 오류 (실제 24GB)

**위치:** PRD `NFR-SC7` (L1403): "pgvector HNSW 인덱스 포함 ≤ 3GB (Oracle VPS 4GB 기준)"
**추가 발견:** Technical Success 섹션 (L306): "query() 세션당 ≤ 50MB (Oracle VPS 4GB 기준)"

**Winston:** "Architecture.md L72에 'RAM: **24GB**'로 명확히 기재되어 있다. Architecture.md L211에는 이미 이 discrepancy를 잡아냈다: 'NFR-SC7 총 메모리 ≤ 3GB (4GB 기준) → ≤ 16GB (24GB 기준)'. L1191에서도 'PRD 메모리 스펙 수정 — NFR-SC7(3→16GB), 4GB→24GB ARM64 4코어'라고 수정 권고했다. Stage 0 업데이트에서 이 수정이 빠졌다."

**Amelia:** "이 수치가 틀린 채로 남아있으면, Phase 5 architecture 작업 시 '4GB VPS에 n8n Docker 2GB를 추가하면 OOM'이라는 잘못된 판단이 나온다. 실제로는 24GB라서 n8n 2GB는 문제없지만, PRD 기준으로 story를 작성하는 개발자는 틀린 수치를 신뢰하게 된다."

**Fix 필요:** NFR-SC7를 "pgvector HNSW 인덱스 포함 ≤ 16GB (Oracle VPS **24GB** ARM64 4코어 기준)"로 수정. L306 "4GB 기준" 표현도 "24GB 기준"으로 수정.

---

### 🟠 Issue 7 — [D4 실행가능성] Phase 5 내 기능 간 의존성 그래프 누락

**위치:** `Phase 5: v3 OpenClaw — 4대 기능` 섹션 전반

**Winston:** "4개 기능 중 soul-enricher.ts (Issue 1 Fix로 신규 추가되는 서비스)가 Big Five (FR-PERS)와 Memory Planning (FR-MEM6) 양쪽의 선행 조건이다. soul-enricher.ts 없이는 {personality_traits}와 {relevant_memories} 주입이 불가능하다. PRD에 이 의존성이 없으면 Epic/Story 분할 시 순서가 잘못 결정될 수 있다."

**Amelia:** "구현 순서 분석: (1) soul-enricher.ts [선행 필수, 2~3일], (2) Big Five [낮음, 3~4일], (3) Memory Architecture [높음, 1~2주], (4) n8n [독립, 1주], (5) OpenClaw [독립, 1~2주]. (1)이 (2)(3)의 선행 조건이다. n8n과 OpenClaw는 (1)~(3)과 완전 독립이므로 병렬 가능."

**Fix 필요:** Phase 5 섹션 상단에 의존성 그래프 추가:
```
soul-enricher.ts (선행) ──→ Big Five (PERS) ──┐
                        ──→ Memory (MEM)    ──┤→ Phase 5 완료
n8n (독립)              ────────────────────┤
OpenClaw (독립)         ────────────────────┘
```

---

### 🟡 Issue 5 — [D2 완전성] FR-MEM3 반성 워커 트리거 메커니즘 미지정

**위치:** `FR-MEM3`: "에이전트별 미처리 관찰 20개 누적 시 자동 실행"

**Amelia:** "`memory-reflection.ts`가 '20개 누적 시 자동 실행'되려면 (A) 새 observation INSERT마다 COUNT 체크 → 20개면 워커 실행, (B) 매 N분마다 폴링 → 20개 미처리 에이전트 찾기, (C) DB 트리거(AFTER INSERT). A는 INSERT 부하, B는 주기 설정 필요, C는 Drizzle과 충돌. 방식이 없으면 구현 시 마음대로 결정된다."

**Fix 필요:** FR-MEM3에 "방식: 매 5분 폴링 크론 — `SELECT agent_id FROM observations WHERE processed = false GROUP BY agent_id HAVING COUNT(*) >= 20`. 처리 후 `processed = true` 업데이트 (observations 테이블에 `processed BOOLEAN DEFAULT false` 컬럼 추가 필요 → 마이그레이션 #62에 포함)" 추가.

---

## Cross-talk 요약 (Critic-B, Critic-C에 전달)

- **Issue 1 (agent-loop.ts 모순)**: D3 정확성 auto-fail 트리거 가능. Critic-B 관점에서 테스트 전략에도 영향 — agent-loop.ts를 mock할 수 없으면 memory/personality 테스트가 복잡해짐.
- **Issue 3 (n8n 보안)**: Critic-B가 보안 관점에서 추가 검토 필요. 포트 5678 인증 없이 열리면 severity high.
- **Issue 4 (PixiJS 번들)**: Critic-C 관점에서 delivery 리스크 — CEO가 /office를 처음 열 때 3초+ 로딩이면 감동이 아니라 이탈.

---

## 결론

| 항목 | 값 |
|------|---|
| **최종 점수** | **4.8/10 ❌ FAIL** (cross-talk 반영 후 하향) |
| **재작성 요구** | 예 (7점 미만, D3 3점 = auto-fail 경계) |
| **Priority Fix 🔴** | Issue 1 (agent-loop.ts 모순), Issue 6 (NFR-SC7 4GB→24GB) |
| **Priority Fix 🟠** | Issue 2 (FR-OC7 메커니즘), Issue 3 (n8n 보안), Issue 7 (Phase 5 의존성 그래프) |
| **Quick Fix 🟡** | Issue 4 (PixiJS lazy load), Issue 5 (FR-MEM3 트리거) |

Writer에게: **7개 이슈** 수정 후 재제출 요청.

### Cross-talk 합의 사항 (Critic-B, Critic-C와 정렬 완료)
- **soul-enricher.ts 패턴**: 3개 Critic 전원 동의. agent-loop.ts는 완성된 Soul 문자열만 받음.
- **n8n proxy 방식**: Hono 역방향 프록시 (`/admin/n8n/*` → `localhost:5678`) — Critic-B 보안 요건 충족.
- **NFR-SC7 24GB**: Critic-C가 먼저 발견, architecture.md로 코드 검증 완료. 24GB 정답.
