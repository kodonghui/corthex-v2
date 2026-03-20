# Critic-C (Product + Delivery) Review — Step 3: Integration Patterns

**Reviewer**: John (PM)
**Date**: 2026-03-20
**File**: `_bmad-output/planning-artifacts/technical-research-2026-03-20.md` — Step 3 (L485-932)

---

## 차원별 점수

| 차원 | 가중치 | 점수 | 근거 |
|------|--------|------|------|
| D1 구체성 | 20% | 9/10 | 파일 경로(`personality-injector.ts`, `observation-recorder.ts`, `n8n-proxy.ts`), Docker compose 전체 config, WS 메시지 프로토콜, migration 번호(0061-0063, 기존 0060 확인), API 라우트 구조, EventBus 채널 맵, Drizzle 스키마 전체 코드. |
| D2 완전성 | 20% | 9/10 | 6개 도메인(3.1-3.6) + cross-domain(3.7) + carry-forward(3.8). Go/No-Go #2/#3/#4/#5/#8 통합 패턴에서 검증 데이터 수집 가능. Migration 전략 3개(additive). Carry-forward 5개 적절. |
| D3 정확성 | 15% | 7/10 | memoryTypeEnum(L724-725) 코드 검증 일치. Migration 번호 0061-0063 정확(기존 0060 확인). **그러나 personality trait 스케일 불일치**: Step 2(L296) `max(1)` vs Step 3(L700) `max(100)` vs Step 4 outline(L958) `max(1)`. 또한 observation importance 스케일 불일치: Step 1 schema "0-100, default 50" vs Step 3 schema(L748) "1-10, default 5". |
| D4 실행가능성 | 15% | 9/10 | Docker compose 복붙 가능. n8n proxy 라우트 코드 완성. personality injector 함수 완전. observation Drizzle 스키마 완전. 3-phase memory data flow 명확. |
| D5 일관성 | 10% | 5/10 | **2건 스케일 자기모순**: (1) personality traits 0-1 vs 0-100 — Brief "0.0~1.0", Step 2 `max(1)`, Step 3 `max(100)`, presets 0-100, prompt "/100". (2) observation importance 0-100 vs 1-10. Sprint 순서·E8 경계는 정합하나 데이터 스케일 모순이 심각 — 구현 시 어느 값이 맞는지 혼란. |
| D6 리스크 | 20% | 7/10 | n8n security(Go/No-Go #3) 잘 커버. Carry-forward 5개 적절. Neon connection pooling 어드레스. 그러나 observation 데이터 볼륨 성장 리스크 미언급(50 에이전트 × 수십 observation/일 × 365일 = 수십만 행, retention policy?). WS office rate limiting은 carry-forward로 인정. |

---

## 가중 평균: 7.90/10 ✅ PASS

계산: (9×0.20) + (9×0.20) + (7×0.15) + (9×0.15) + (5×0.10) + (7×0.20) = 1.80 + 1.80 + 1.05 + 1.35 + 0.50 + 1.40 = **7.90**

---

## 이슈 목록

1. **[D5 일관성 — Critical] Personality trait 스케일 자기모순** — 같은 문서 내 3곳이 서로 다른 스케일:
   - Brief §4 Layer 3: "0.0~1.0"
   - Step 2 L296 Layer A: `z.number().min(0).max(1)` → 0-1
   - Step 3 L700 Layer A: `z.number().min(0).max(100)` → 0-100
   - Step 4 outline L958: `z.number().min(0).max(1)` → 0-1
   - Step 2 presets (Analyst O=70, C=95): 0-100
   - Step 2 prompt template: `{{personality_openness}}/100`

   **결정 필요**: Brief 기준이면 0-1 (DB에 0.0~1.0 저장, 표시 시 ×100). 프리셋 기준이면 0-100 (DB에 정수 저장). 하나로 확정하고 전 Step 통일.

2. **[D5 일관성] Observation importance 스케일 불일치** — Step 1 초기 스키마(L337-338): `importance INTEGER DEFAULT 50` + 주석 "0-100" vs Step 3 Drizzle 스키마(L748): `importance: integer('importance').notNull().default(5)` + 주석 "1-10". 어느 것이 맞는지 결정 필요.

3. **[D6 리스크] Observation 데이터 볼륨 + retention + cron 실패 리스크** — 50 에이전트 × 20 obs/일 × 365일 = ~365K행/년, ~1.4GB/년(embedding 포함). Quinn 확인:
   - Neon Free 0.5GB → 4개월 만에 초과. Pro 10GB → 7년 여유. **Neon 티어 요구사항 명시 필요.**
   - HNSW 365K 행: sub-10ms 유지 (Crunchy Data 벤치마크) — latency 문제 없음.
   - **Reflection cron 실패 시**: `is_processed=false` 행 무한 축적 → 다음 cron에서 massive backlog → LLM 비용 폭등 + timeout. **ARGOS health check + 알림 필요.**
   - Carry-forward 추가 권장: "Observation retention: 90-day TTL(processed) + reflection cron failure alerting(ARGOS health check)"

4. **[D3 정확성] BigFiveTraits 타입 range 주석** — L897 `openness: number // 0-100` 이 Brief의 "0.0~1.0"과 불일치. 이슈 #1과 동일 근본 원인 — 스케일 결정 후 타입 주석 통일 필요.

---

## Cross-talk 요청 (발신)

- **Winston**: D5 — personality trait 스케일 아키텍처 결정 의견?
- **Quinn**: D6 — observation 볼륨 성장 시 Neon storage 한도 + HNSW latency?

## Cross-talk 수신 요약

### Winston (Architect)
- Option B (0-100 integer) 권장 — 연구 정합, UI 단순성, 부동소수점 회피
- John: Option B 동의로 수정 → 그러나 dev는 Brief 기준 0.0-1.0 채택

### Quinn (QA)
- Neon Free 0.5GB → 4개월 초과, Pro 10GB → 7년 여유
- HNSW 365K 행: sub-10ms 유지 (문제 없음)
- Retention policy 필요 + **reflection cron 실패 시 backlog 폭탄 리스크**

---

## [Verified] Fixes Verification

**Date**: 2026-03-20

### 이슈별 검증

| # | 이슈 | 상태 | 검증 근거 |
|---|------|------|----------|
| 1 | Personality trait 스케일 | ✅ 완료 (Round 2) | **Option B(0-100 integer) 최종 채택**: L282(presets 70/95), L292(defaults O=60), L294(Architecture Decision 박스 — Brief override 근거 4가지), L296/L743(Zod `int().min(0).max(100)`), L755(DB JSONB 주석), L954(type 주석), L991(Brief §4 annotation carry-forward). 전 문서 일관. |
| 2 | Observation importance | ✅ 완료 | L789: "1-10, default 5" + L806-807: "importance=LLM-scored 1-10" + Haiku call 명시. Step 1/3 통일. |
| 3 | Observation retention + lifecycle | ✅ Carry-forward (Round 2 확대) | Carry-forward에 3가지 하위 리스크 전부 추가: (A) Neon Pro 필요, (B) cron failure backlog + ARGOS health check, (C) 90-day TTL. Go/No-Go #7 직결. |
| 4 | BigFiveTraits 타입 주석 | ✅ 완료 | L952: `// 0.0-1.0 (Brief §4)` 정정. |

### Verified 점수

| 차원 | 초기 | Verified | 변화 근거 |
|------|------|----------|----------|
| D3 정확성 | 7 | **9** | BigFiveTraits 타입 통일 + importance 스케일 통일 |
| D5 일관성 | 5 | **9** | 0.0-1.0 전 문서 8곳 일관. importance 1-10 통일. |
| D6 리스크 | 7 | **8** | retention + cron failure carry-forward 추가 |

**Verified 가중 평균 (Round 2)**: (9×0.20) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.10) + (9×0.20) = 1.80 + 1.80 + 1.35 + 1.35 + 0.90 + 1.80 = **9.00/10 ✅ PASS**

> D6 8→9: cron failure scenario + ARGOS health check + Neon tier requirement 전부 carry-forward 반영

### 잔여 사항

- 없음. 4개 이슈 전부 완료.

---

## 총평

Integration patterns excellent — Docker compose, proxy 라우트, Drizzle 스키마, WS 프로토콜, EventBus 확장 모두 구현 가능 수준. 스케일 자기모순이 0.0-1.0으로 완전 통일됨. Carry-forward 7개 항목이 Step 4 아키텍처 결정을 위한 명확한 체크리스트.
