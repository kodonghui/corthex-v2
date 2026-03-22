# Stage 4 Step 06 — SM (Scrum Master Critic) Review

**Reviewer:** SM (Scrum Master — Sprint Planning, Delivery Risk, Scope Management)
**Date:** 2026-03-22
**Round:** R1
**Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%

---

## Content Reviewed

`_bmad-output/planning-artifacts/architecture.md` — Step 6 (L2460-2715): v3 Directory Structure, File Change Summary, Architectural Boundaries, Dependency Matrix, Requirements→Structure Mapping, Cross-Cutting Concerns, Integration Points, Data Flows.

---

## Verification Method

- Directory tree NEW file counts independently tallied per Sprint
- Sprint 4 packages/office/ files counted from tree (10 files) + office.tsx (1) = 11
- Sprint 2 files counted: 4 server + 4 presets + README = 9 (or 8 excluding README)
- Dependency matrix cross-referenced against E11-E22 patterns (Step 5)
- Cross-cutting concerns checked against Step 5 E11-E22 list
- routes/observations.ts (Sprint 3) verified as nonexistent (new route)
- 9 renderSoul callers verified in prior rounds

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 15% | 8/10 | 디렉토리 트리 Sprint+Decision 어노테이션 우수 (D25, E15, E16 등 참조). 파일 경로 구체적. ASCII 아키텍처 다이어그램 명확. 데이터 흐름 SQL 조건(confidence≥0.7, flagged=false) 명시. **감점**: Sprint 2 NEW 파일 수 "7" 오류 — 트리에서 세면 8개. Sprint 4 NEW 파일 수 "9" 오류 — 트리에서 세면 11개. |
| D2 완전성 | 20% | 8/10 | 53 v3 FRs 전부 파일 매핑. 7 cross-cutting + 7 내부 + 3 외부 통합점. 8행 dependency matrix. 4개 데이터 흐름 다이어그램. **감점**: (1) Sprint 4 테스트 파일 2개(번들 크기+ws)가 디렉토리 트리에 미표시. (2) routes/observations.ts(Sprint 3 신규 라우트) dependency matrix에 누락. (3) E14(memory-reflection) cross-cutting 테이블에 누락 — Voyage+Haiku+advisory lock+observations+agent_memories 5개 모듈 관통. |
| D3 정확성 | 15% | 7/10 | **3건 숫자 오류**: (1) Sprint 2 NEW=7, 실제=8 (tool-sanitizer + n8n-proxy + marketing + compose + presets ×4). (2) Sprint 4 NEW=9, 실제=11 (packages/office/ 10파일 + office.tsx). (3) 총계 ~25, 실제 ~28. 나머지 정확: renderSoul 9 callers, L265+L277 어노테이션, 127.0.0.1:5678, host.docker.internal:host-gateway. |
| D4 실행가능성 | 15% | 9/10 | 디렉토리 트리 = 개발자가 파일 생성 위치 즉시 파악. Sprint 어노테이션 = 언제 만드는지 명확. Dependency matrix = import 규칙 명확. FR→파일 매핑 = 요구사항→코드 추적 가능. 데이터 흐름 = 처리 순서 명확. |
| D5 일관성 | 15% | 8/10 | E11-E22 참조가 디렉토리 트리, cross-cutting, integration points에서 일관. Sprint 배정이 Step 4/5와 정합. E8 경계(engine/ vs services/) dependency matrix에서 정확히 반영. Interface contract "additive-only" L2482에 표시. **감점**: Sprint 2/4 파일 수 불일치. |
| D6 리스크 | 20% | 7/10 | Sprint 2가 가장 복잡(16 FR + n8n Docker)임이 파일 수에서 드러남. Sprint 4 packages/office/ 격리로 위험 감소. Dependency matrix로 unsafe import 방지. Security test 3개 체인 전부 커버. **감점**: (1) **Layer 0 UXUI ↔ Sprint 구현 merge conflict 미언급** — Sprint 1이 agents.tsx 수정(성격 UI) + Layer 0도 agents.tsx 수정(UXUI 리셋) = 동일 파일 병렬 수정 충돌. Sprint 3도 agents.tsx(메모리 탭) 수정. (2) Sprint 3 soul-enricher.ts에 memoryVars 확장 = Sprint 1 작업물 직접 수정 리스크(interface contract으로 완화되나 파일 수준 충돌 가능). (3) Sprint 2 파일 수 과소 표기로 스코프 과소평가 위험. |

---

## 가중 평균: 7.80/10 ✅ PASS

계산: (8×0.15) + (8×0.20) + (7×0.15) + (9×0.15) + (8×0.15) + (7×0.20) = 1.20 + 1.60 + 1.05 + 1.35 + 1.20 + 1.40 = **7.80**

---

## 이슈 목록 (2 HIGH, 4 MEDIUM, 2 LOW)

### H1 [D3] Sprint 2 NEW 파일 수: 7 → 실제 8

L2562: "7 (tool-sanitizer, n8n-proxy, marketing, compose, presets ×4)"

디렉토리 트리에서 카운트:
1. `engine/tool-sanitizer.ts`
2. `routes/admin/n8n-proxy.ts`
3. `routes/admin/marketing.ts`
4. `docker-compose.n8n.yml`
5. `_n8n/presets/marketing-image.json`
6. `_n8n/presets/marketing-video.json`
7. `_n8n/presets/marketing-narration.json`
8. `_n8n/presets/marketing-subtitle.json`

설명 텍스트에도 8개 나열하면서 숫자는 "7". 추가로 `_n8n/README.md`까지 포함하면 9개.

- **Fix**: "7" → "8" (또는 README 포함 시 9). Sprint 2는 이미 16 FR로 가장 과부하 Sprint — 정확한 파일 수로 스코프 관리 필수.

### H2 [D3] Sprint 4 NEW 파일 수: 9 → 실제 11

L2564: "9 (packages/office/ 전체, ws channels, office.tsx)"

디렉토리 트리에서 packages/office/ 카운트:
1. `package.json`
2. `tsconfig.json`
3. `vite.config.ts`
4. `src/index.ts`
5. `src/OfficeCanvas.tsx`
6. `src/sprites/AgentSprite.tsx`
7. `src/sprites/DeskSprite.tsx`
8. `src/sprites/StatusBubble.tsx`
9. `src/hooks/useOfficeWs.ts`
10. `src/store.ts`
= 10 files

Plus `app/src/pages/office.tsx` = 11 NEW.
(`ws/channels.ts`는 MODIFY이며 이미 MODIFY 컬럼에 포함 — NEW 아님)

- **Fix**: "9" → "11". 총계도 "~25" → "~28" 갱신.

### M1 [D6] Layer 0 UXUI ↔ Sprint 구현 — merge conflict 리스크

Layer 0: ~67 MODIFY (UXUI 리셋 페이지 점진적 전환)
Sprint 1: `app/src/pages/agents.tsx` MODIFY (성격 UI 슬라이더)
Sprint 3: `app/src/pages/agents.tsx` MODIFY (메모리 탭)

**동일 파일 3회 수정** — agents.tsx를 Sprint 1(성격), Sprint 3(메모리), Layer 0(UXUI 리셋)에서 각각 수정.

병렬 작업 시 merge conflict 필연. 현재 아키텍처에 순서/우선권 규칙 없음.

- **Fix**: Layer 0 UXUI는 **각 Sprint 완료 후** 해당 페이지 리셋 (병렬 아님, 직렬). 또는 Sprint 구현 시 UXUI 토큰 적용을 **함께** 수행하여 Layer 0 별도 작업 최소화. 구체적 규칙 필요:
  - Sprint 1 완료 → agents.tsx Layer 0 리셋
  - Sprint 2 완료 → admin/n8n, marketing Layer 0 리셋
  - Sprint 3 완료 → agents.tsx 메모리 탭 Layer 0 리셋

### M2 [D2] Sprint 4 테스트 파일 디렉토리 트리 누락

L2564 Summary: "테스트 2 (번들 크기 + ws)"

디렉토리 트리(L2505-2518)에 Sprint 4 테스트 파일 위치 미표시. Sprint 1-3는 `__tests__/unit/`, `__tests__/integration/`, `__tests__/security/`에 구체적 파일 표시. Sprint 4만 누락.

- **Fix**: 디렉토리 트리에 추가:
  ```
  __tests__/
    integration/
      office-bundle-size.test.ts     # NEW Sprint 4: Go/No-Go #5
      office-ws.test.ts              # NEW Sprint 4: E16 연결 제한
  ```

### M3 [D2] routes/observations.ts — dependency matrix 누락

L2634에서 Sprint 3 FR-MEM1~2의 파일 위치로 `routes/observations.ts (신규)` 명시. 그러나 L2597-2606 dependency matrix 8행에 포함되지 않음.

이 라우트는 `services/observation-sanitizer.ts`와 `db/`에 의존하고, `engine/`에 의존 금지 — 규칙이 문서화되어야 함.

- **Fix**: dependency matrix에 9번째 행 추가:
  `| routes/observations.ts | middleware/, db/, services/observation-sanitizer.ts | engine/ |`

### M4 [D2] E14(memory-reflection) cross-cutting 테이블 누락

L2660-2668 cross-cutting 테이블에 7개 관심사 나열:
1. Soul 전처리 (E11) ✅
2. PER-1 (E12) ✅
3. MEM-6 (E13) ✅
4. TOOLSANITIZE (E15) ✅
5. Voyage AI (E18) ✅
6. n8n 보안 (E20) ✅
7. /ws/office (E16) ✅

**E14 Reflection 크론 누락** — memory-reflection.ts는 Voyage AI(E18), Haiku API, advisory lock, observations 테이블, agent_memories 테이블, croner를 관통하는 cross-cutting concern. 데이터 흐름(L2706-2710)에는 있으나 cross-cutting 구조 매핑에서 빠짐.

- **Fix**: 8번째 행 추가:
  `| Reflection 크론 (E14) | services/memory-reflection.ts → services/voyage-embedding.ts + db/ (observations, agent_memories) + Claude Haiku API |`

---

## LOW (2건)

### L1 [D3] 총계 ~25 → 실제 ~28

H1+H2 수정 시 자동 해소: 2+3+8+4+11 = 28.

### L2 [D2] _n8n/README.md — 트리에 표시되나 미카운트

Sprint 2 NEW 파일에 README.md 포함 여부 결정 필요. 코드 파일이 아니므로 제외할 수 있으나, 디렉토리 트리에 표시된 이상 카운트에 반영하거나 트리에서 제거.

---

## Scrum Master 관점 — Sprint Structure Risk Assessment

### Sprint별 구조 리스크

| Sprint | NEW | MODIFY | 테스트 | 복잡도 | 리스크 | 근거 |
|--------|-----|--------|--------|--------|--------|------|
| Pre-Sprint | 2 | 3 | 0 | 낮음 | 🟡 | Voyage bulk re-embed 시간 불확실 |
| Sprint 1 | 3 | 9 | 3 | 중간 | 🟢 | 9 caller 수정 = 반복 작업. Interface contract 보호 |
| Sprint 2 | **8** | 1 | 4 | **높음** | 🟡 | NEW 최다 + n8n Docker infra + 16 FRs. 파일 수 과소평가 주의 |
| Sprint 3 | 4 | 2 | 3 | 중간 | 🟡 | soul-enricher.ts 직접 수정(Sprint 1 산출물) — additive-only contract 필수 |
| Sprint 4 | **11** | 3 | 2 | 중간 | 🟢 | 격리 workspace, 실패 시 fallback UI. 파일 수 많지만 전부 packages/office/ 내 |
| Layer 0 | 0 | ~67 | E2E | 높음 | 🔴 | **merge conflict 핫스팟**: agents.tsx 3회 수정(S1+S3+L0) |

### 핵심 판단

1. **Layer 0 merge conflict가 최대 구조 리스크** (M1) — 현재 "병행" 표기이나 실제로는 Sprint 완료 직후 순차 리셋이 안전. Sprint 구현 중 UXUI 리셋 병행하면 동일 파일 충돌 불가피.

2. **Sprint 2 스코프 과소평가** (H1) — 8-9 NEW 파일 + 16 FRs + n8n Docker 인프라. 파일 수 "7"은 스코프를 실제보다 작아 보이게 함. 정확한 카운트로 Sprint 2 리스크 가시화 필요.

3. **Sprint 3 soul-enricher.ts 수정** — Sprint 1 산출물을 Sprint 3에서 확장. Interface contract(additive-only)으로 완화되나, 파일 수준에서 동일 파일 수정임을 인지해야 함. 기능 테스트에 Sprint 1 personality 회귀 포함 필수.

### 전체 판정

**7.80/10 PASS.** 디렉토리 구조, dependency matrix, FR→파일 매핑, 데이터 흐름 모두 체계적이며 실행 가능성 높음. Sprint 2/4 파일 수 오류(H1+H2)와 Layer 0 merge conflict 리스크(M1)가 주요 감점 요인. H1+H2 수정 + M1-M4 반영 시 9.0+ 예상.

---
---

# Stage 4 Step 06 — SM R2 Verification

**Reviewer:** SM (Scrum Master — Sprint Planning, Delivery Risk, Scope Management)
**Date:** 2026-03-22
**Round:** R2 (Verification of 14 consolidated fixes from 4 critics)
**Weights:** D1=15%, D2=20%, D3=15%, D4=15%, D5=15%, D6=20%

---

## SM R1 Issues — Fix Verification

| # | Issue | Status | Evidence |
|---|-------|--------|----------|
| H1 | Sprint 2 NEW 7 → 실제 8 | ✅ FIXED | L2570: "8 (tool-sanitizer, n8n-proxy, marketing, compose, presets ×4)". 트리에서 독립 카운트 = 8 일치. README는 문서로 제외 (L2 해소). |
| H2 | Sprint 4 NEW 9 → 실제 11 | ✅ FIXED | L2572: "11 (packages/office/ 10파일, office.tsx)". 트리에서 카운트: packages/office/ 내 10파일 + office.tsx = 11 정확. |
| M1 | Layer 0 merge conflict 규칙 부재 | ✅ FIXED | L2576: "Layer 0 UXUI 리셋은 각 Sprint 해당 페이지 구현 완료 후 순차 적용. 병렬 작업 시 merge conflict 방지." 명시적 순서 규칙 추가됨. |
| M2 | Sprint 4 테스트 파일 트리 누락 | ✅ FIXED | L2524-2526: `__tests__/sprint4/office-bundle-size.test.ts` + `office-ws.test.ts`. 별도 sprint4/ 디렉토리로 조직 — Sprint 4 격리 원칙과 일관. |
| M3 | observations.ts dependency matrix 누락 | ✅ FIXED | L2611: `routes/workspace/observations.ts | middleware/, db/, services/observation-sanitizer.ts | engine/` — 9번째 행 추가. 경로도 `routes/workspace/` 하위로 정확. |
| M4 | E14 cross-cutting 테이블 누락 | ✅ FIXED | L2681: "Reflection 크론 (E14) | services/memory-reflection.ts → voyage-embedding.ts + observations + agent_memories + Claude Haiku API" — 8번째 행 추가. |
| L1 | 총계 ~25 → 실제 ~28 | ✅ FIXED | L2574: "~29". 계산: 2+3+8+5+11 = 29 정확 (Sprint 3도 4→5 수정 반영). |
| L2 | README.md 카운트 결정 | ✅ RESOLVED | README.md는 문서이므로 NEW 코드 파일에서 제외. 트리에 표시되나 카운트 미포함 — 합리적 결정. |

**Fix rate: 8/8 SM issues resolved.**

---

## Additional Fixes Verified (other critics)

| Fix | Status | Evidence |
|-----|--------|----------|
| Migration 확장자 `.ts` → `.sql` | ✅ | L2504-2508: 0061~0064 전부 `.sql` |
| Sprint 3 NEW 4 → 5 (observations.ts 추가) | ✅ | L2571: "5 (observations.ts, observation-sanitizer, memory-reflection, migrations ×2)" |
| FR-PERS/FR-N8N 라벨 PRD 정합 | ✅ | L2621 "FR-PERS", L2631 "FR-N8N" — PRD 명칭과 일치 |
| marketing.ts n8n preset 경로 명시 | ✅ | L2493: "프리셋 설치: n8n-proxy 내부 HTTP fetch 경유 (Docker 직접 금지)" |
| E8 경계: observation creation via hub.ts | ✅ | L2694 + L2722: "hub.ts 후처리 → sanitizeObservation() → INSERT observations (E8 경계: engine/ 외부에서 처리)" |
| Vector migration rollback warning | ✅ | L2505: "⚠️ 비가역: 롤백 시 전체 re-embed 필요" |

---

## R2 교차 검증

| 검증 항목 | 방법 | 결과 |
|-----------|------|------|
| 파일 수 총계 | 2+3+8+5+11 | = 29 ✅ L2574 "~29" 일치 |
| E11-E22 전수 참조 | 디렉토리 트리+cross-cutting+dependency matrix+data flow | E11~E22 전부 최소 1곳 이상 참조 ✅ |
| Dependency matrix 행 수 | L2607-2617 카운트 | 9행 ✅ (R1의 8행 + observations.ts) |
| Cross-cutting 행 수 | L2673-2682 카운트 | 8행 ✅ (R1의 7행 + E14 Reflection) |
| Stage 1 confirmed decisions 반영 | #1 Voyage(L2486), #3 8-layer(L2637), #12 host-gateway(L2602) | ✅ 핵심 결정 모두 구조에 반영 |
| Sprint 순서 일관성 | Step 4/5 Sprint 배정 vs Step 6 어노테이션 | 전 항목 일치 ✅ |

---

## R2 차원별 점수

| 차원 | 가중치 | R1 | R2 | 근거 |
|------|--------|-----|-----|------|
| D1 구체성 | 15% | 8 | **10/10** | 모든 Sprint 어노테이션 정확. Decision+Pattern 번호(D25, E15, E16 등) 디렉토리 트리 전체 부착. Migration 번호(0061~0064) + 확장자 `.sql` 정확. package 버전 pin (pixi.js 8.17.1). L265+L277 2경로 어노테이션. 데이터 흐름 SQL 조건(confidence≥0.7, importance DESC) + cron 표현식(0 3 * * *). 롤백 경고 ⚠️ 표시. |
| D2 완전성 | 20% | 8 | **9/10** | 53 FRs 전부 파일 매핑. 8 cross-cutting concerns (E14 추가). 9행 dependency matrix (observations.ts 추가). Sprint 4 테스트 트리 표시. 4개 데이터 흐름 다이어그램. E8 경계 observation 처리 명시. marketing→n8n-proxy 경로 문서화. |
| D3 정확성 | 15% | 7 | **10/10** | R1의 3건 숫자 오류 전부 수정. Sprint 2=8 ✅, Sprint 3=5 ✅, Sprint 4=11 ✅, 총계=29 ✅. Migration 확장자 .sql 정확. ws/channels.ts가 MODIFY(NEW 아님) 올바르게 분류. README 코드 파일 제외 합리적. |
| D4 실행가능성 | 15% | 9 | **9/10** | 디렉토리 트리 = 파일 생성 위치 즉시 파악. Sprint 어노테이션 = 시점 명확. Dependency matrix = import 규칙 명확. FR→파일 매핑 = 요구사항→코드 추적. Layer 0 순서 규칙 = merge conflict 방지 프로세스 명시. |
| D5 일관성 | 15% | 8 | **9/10** | 파일 수가 트리↔Summary 테이블↔FR 매핑 전부 일치. E11-E22가 트리, cross-cutting, dependency matrix, data flow에서 일관 참조. Sprint 배정 Step 4/5와 정합. Interface contract(additive-only) L2482 어노테이션. Layer 0 순서 규칙이 Summary 직후 명시 — 가시적 위치. |
| D6 리스크 | 20% | 7 | **9/10** | Layer 0 순서 규칙 추가 — 최대 구조 리스크 해소. Sprint 2 파일 수 정확 → 스코프 과소평가 위험 제거. Vector migration 비가역 경고. E8 경계 observation 처리 명시(engine/ 외부). marketing→Docker 직접 접근 금지 명시. Sprint 3→Sprint 1 수정 리스크는 interface contract으로 완화(Step 5에서 이미 문서화). |

---

## 가중 평균: 9.30/10 ✅ PASS

계산: (10×0.15) + (9×0.20) + (10×0.15) + (9×0.15) + (9×0.15) + (9×0.20) = 1.50 + 1.80 + 1.50 + 1.35 + 1.35 + 1.80 = **9.30**

---

## 잔존 이슈 (0건)

R1의 8건 전부 해소. 추가 수정 6건도 검증 완료. 잔존 이슈 없음.

---

## Scrum Master 관점 — Step 6 R2 GATE 판정

### Sprint별 구조 리스크 (R2 갱신)

| Sprint | NEW | MODIFY | 테스트 | 복잡도 | 리스크 | 근거 |
|--------|-----|--------|--------|--------|--------|------|
| Pre-Sprint | 2 | 3 | 0 | 낮음 | 🟡 | Voyage bulk re-embed 시간 불확실 |
| Sprint 1 | 3 | 9 | 3 | 중간 | 🟢 | 9 caller 수정 = 반복 작업. Interface contract 보호 |
| Sprint 2 | **8** | 1 | 4 | **높음** | 🟡 | 파일 수 정확 반영. 16 FRs + Docker 인프라. 리스크 가시화 완료 |
| Sprint 3 | **5** | 2 | 3 | 중간 | 🟡 | observations.ts 추가. soul-enricher additive-only. E8 경계 명시 |
| Sprint 4 | **11** | 3 | 2 | 중간 | 🟢 | 격리 workspace. Sprint 4 전용 테스트 디렉토리 |
| Layer 0 | 0 | ~67 | E2E | 높음 | 🟢 → 🟡 | **순서 규칙 추가**: 각 Sprint 완료 후 순차 리셋. 병렬 충돌 방지 |

### GATE: 🟢 PASS

Step 6 (v3 Project Structure & Boundaries)는 **구조 GATE 통과**.

**R1→R2 핵심 개선:**

1. **파일 수 정확성 확보** — Sprint 2(7→8), Sprint 3(4→5), Sprint 4(9→11), 총계(~25→~29). 스코프 과소평가 위험 완전 제거.

2. **Layer 0 순서 규칙** — merge conflict 핫스팟(agents.tsx 3회 수정)에 대한 명시적 프로세스 추가. Layer 0 리스크 🔴→🟡 하향.

3. **Dependency matrix + Cross-cutting 완전성** — observations.ts 9번째 행, E14 Reflection 8번째 행 추가. v3 전체 모듈이 의존성 규칙에 포함됨.

4. **Migration 안전성** — `.sql` 확장자 통일 + vector migration 비가역 경고. 롤백 시나리오 명시.

### 전체 판정

**9.30/10 PASS.** R1 대비 +1.50. 디렉토리 구조, dependency matrix, FR→파일 매핑, 데이터 흐름, Layer 0 순서 규칙 모두 정확하고 완전하며 실행 가능. Step 7(Validation) 진행 준비 완료.
