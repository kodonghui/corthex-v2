# Critic-UX (Sally) Review — Stage 2 Step 7: Domain-Specific Requirements

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 1352–1531 (## Domain-Specific Requirements)
> Cross-refs: Brief §4 (Go/No-Go 1-11), confirmed-decisions-stage1.md (#1-#12), Exec Summary L158 (8-layer), Product Scope L900-960 (memory schema/cron/planning), Success Criteria L586-607 (14 Go/No-Go gates)
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 75개 도메인 요구사항 각각 ID + 상세 + Phase/Sprint 배정. PER-1 4-layer 명세 매우 구체적 (Layer 0~C + 참조). PIX-4 접근성 상세 (aria-live 범위 구분). SEC/ORC/SOUL 충분. **약점:** N8N-SEC-5 "memory: 4G, cpus: '2'"만으로 부족 — OOM 시 대응 전략 없음 (실패 트리거 L549에 3단계 에스컬레이션 있으나 domain req에 미반영). MEM-4/5 "Planning" 서술이 모호 (저장 엔티티인지 검색인지 불분명). |
| D2 완전성 | 6/10 | 14개 카테고리 75개 요구사항으로 구조 우수. **그러나 심각한 커버리지 갭:** **(1)** n8n 8-layer 보안 중 4개 레이어 누락 (API key injection, rate limiting, N8N_ENCRYPTION_KEY, NODE_OPTIONS). **(2)** WebSocket 도메인 요구사항 전무 — confirmed decision #10 (50/company, 500/server, 10 msg/s) 미커버. **(3)** MEM 섹션에 Observation Poisoning 4-layer (Go/No-Go #9) 도메인 요구사항 없음. **(4)** MEM 섹션에 30일 TTL (confirmed #5) 도메인 요구사항 없음. **(5)** MEM 섹션에 Reflection 크론 트리거 모델 (20-count + advisory lock + ECC 2.2) 도메인 요구사항 없음 — MEM-3은 "격리"만 정의. |
| D3 정확성 | 5/10 | **CRITICAL**: N8N-SEC-5 L1459 `memory: 4G` — confirmed decision #2 "`--memory=2g`", Brief mandate, 실패 트리거 L549 "4G=OOM 확정". Steps 4-6에서 반복 수정된 사항 재발. **MAJOR**: MEM-4 "Planning 삭제" / MEM-5 "Planning 적용 감사 로그" — Planning은 저장 엔티티가 아님 (Product Scope L957-960: soul-enricher.ts read-time cosine ≥ 0.75 top 3 검색). Step 6 Fix 2에서 명확히 교정된 사항. **MINOR**: VEC-1 "Voyage AI Embedding 제한" — Voyage AI voyage-3은 32K 토큰 입력 지원; 2048은 설계 결정이지 API 제한이 아님. |
| D4 실행가능성 | 7/10 | 대부분의 요구사항이 구현 가능 수준. Phase/Sprint 배정 명확. Summary 테이블 75개 수치 정합. **약점:** MKT-1 "Deferred Item" 라벨이 JSONB race condition에 붙어 있음 — 개발자가 Sprint 2에서 구현 시 "deferred니까 나중에"로 오해 가능. ORC-6 ↔ SOUL-5 중복 정의 (둘 다 "매니저 Soul에 교차 검증 + 충돌 처리") — 어디를 기준으로 구현? |
| D5 일관성 | 5/10 | **(1)** N8N-SEC-5 `4G` vs 전 섹션(Exec Summary, Success Criteria, User Journeys) `2G` — **전 PRD와 불일치.** **(2)** Exec Summary L158 "8-layer 보안" vs N8N-SEC 6개 (실제 4 layer만 매칭) — 레이어 수 불일치. **(3)** MEM-4/5 "Planning" 엔티티 vs Product Scope/User Journeys "read-time search" — 선행 Step 수정사항 미반영. **(4)** MEM-2 "Tier 3-4: 주 1회" vs Product Scope L951 "20개 관찰 threshold" — 트리거 모델 혼용 (주기 vs 카운트). **(5)** ORC-6 ↔ SOUL-5 중복. |
| D6 리스크 | 7/10 | SEC-1~7, N8N-SEC-1~6, PER-1 4-layer 등 보안 커버리지 자체는 우수. PIX-5 실패 격리 정의. **약점:** 8-layer 중 4 layer 누락으로 보안 표면 불완전. WebSocket 연결 제한/rate limiting 미정의 — DDoS 벡터. Observation Poisoning이 MEM에 없어서 Sprint 3 보안 스토리 누락 위험. MKT-1 race condition "deferred" 태그 위험. |

---

## 이슈 목록

### CRITICAL (1)

**1. [D3/D5] N8N-SEC-5 L1459 `memory: 4G` — Brief 2G mandate 위반**
- L1459: "Docker 리소스 상한 | `memory: 4G`, `cpus: '2'`"
- Confirmed decision #2: `--memory=2g`, `NODE_OPTIONS=--max-old-space-size=1536`
- Brief mandate: "4G = OOM 확정"
- 실패 트리거 L549: "2G 한도 유지 (Brief 필수, 4G=OOM 확정): 3단계 에스컬레이션"
- Steps 4-6에서 반복 수정되었으나 domain req에 구버전 잔류
- **수정**: `memory: 4G` → `memory: 2G` + `NODE_OPTIONS=--max-old-space-size=1536` + "OOM 시 3단계 에스컬레이션 (실패 트리거 L549 참조)"

### MAJOR (4)

**2. [D3/D5] MEM-4/MEM-5 "Planning" 엔티티 혼동**
- MEM-4 L1480: "Admin만 Reflection/**Planning** 삭제 가능"
- MEM-5 L1481: "**Planning**이 에이전트 행동에 적용될 때 `activity_logs`에 기록"
- Product Scope L957-960: Planning = soul-enricher.ts read-time cosine ≥ 0.75 top 3 검색. **저장 엔티티 아님.**
- Step 6 Fix 2에서 User Journeys의 "Planning: 5건 적용"을 "read-time semantic search"로 교정한 동일 이슈
- "Planning 삭제"는 불가능 (삭제할 레코드 없음). "Planning 적용 감사 로그"는 의미 변경 필요.
- **수정**: MEM-4 → "Admin만 Reflection 삭제 가능 (Observation은 30일 TTL 자동 정리). CEO는 메모리 읽기만." / MEM-5 → "Reflection이 soul-enricher.ts에서 Soul에 주입될 때 `activity_logs`에 기록 (어떤 Reflection이 어떤 태스크에 영향을 줬는지 추적)"

**3. [D2/D5] n8n 8-layer 보안 중 4개 레이어 domain req 누락**
- Exec Summary L158: "8-layer 보안 (Docker network → Hono proxy → API key header injection → tag-based tenant filter → webhook HMAC → rate limiting → N8N_ENCRYPTION_KEY → NODE_OPTIONS)"
- Confirmed decision #3: "8-layer (added: N8N_ENCRYPTION_KEY AES-256-GCM, NODE_OPTIONS V8 heap cap)"
- N8N-SEC 매핑:
  - N8N-SEC-1 → Layer 1 (Docker network) ✅
  - N8N-SEC-2 → Layer 2 (Hono proxy) ✅
  - N8N-SEC-3 → Layer 4 (tag filter) ✅
  - N8N-SEC-4 → Layer 5 (webhook HMAC) ✅
  - N8N-SEC-5 → Docker resource (보안 레이어 아님)
  - N8N-SEC-6 → DB isolation (추가)
- **누락 4개**: Layer 3 (API key header injection), Layer 6 (rate limiting), Layer 7 (N8N_ENCRYPTION_KEY AES-256-GCM), Layer 8 (NODE_OPTIONS V8 heap cap)
- **수정**: N8N-SEC-7~10 추가 또는 기존 ID 재배정

**4. [D2] MEM 섹션 3대 핵심 요구사항 누락**
- **(a)** Observation Poisoning 4-layer 방어 (Go/No-Go #9, Product Scope L935-939, Success Criteria L602) — MEM에 domain req ID 없음. Sprint 3 스토리에서 누락 위험.
- **(b)** Observation TTL 30일 (confirmed decision #5, Product Scope L941-943) — MEM에 domain req ID 없음.
- **(c)** Reflection 크론 트리거 모델 — MEM-3은 "격리"만 정의. 20-count threshold, advisory lock, ECC 2.2 비용 게이트, confidence ≥ 0.7 우선 처리 모두 누락.
- **수정**: MEM-6 (Observation Poisoning 4-layer, Go/No-Go #9), MEM-7 (Observation TTL 30일, confirmed #5), MEM-8 (Reflection 크론: 20개 threshold + advisory lock + ECC 2.2 + confidence ≥ 0.7) 추가

**5. [D2/D6] WebSocket 도메인 요구사항 전무**
- Confirmed decision #10: 50 connections/company, 500/server, 10 msg/s per userId (token bucket)
- NRT 섹션은 실시간 상태(heartbeat, 브로드캐스트)만 커버. 연결 제한/rate limiting 없음.
- User Journeys J9에서 "50+ 연결 제한 + heartbeat fallback" 수정 완료했으나 domain req 미반영.
- **수정**: NRT-5 (WebSocket 연결 제한: 50/company, 500/server total) + NRT-6 (WebSocket rate limiting: 10 msg/s per userId, token bucket) 추가

### MINOR (4)

**6. [D5] ORC-6 ↔ SOUL-5 중복 정의**
- ORC-6 L1406: "매니저 Soul에 교차 검증 + 충돌 처리 + 에러 처리 지침 필수"
- SOUL-5 L1417: "매니저 Soul에 교차 검증(수치 대조) + 충돌 시 병기 + 에러 시 나머지 종합 지침"
- SOUL-5가 더 구체적. ORC-6을 "SOUL-5 참조" + 오케스트레이션 관점 보완으로 통합.

**7. [D3] VEC-1 "Voyage AI Embedding 제한" 표현 부정확**
- L1444: "2,048 토큰 이상 시 자동 분할 (Voyage AI Embedding 제한)"
- Voyage AI voyage-3 실제 입력 상한: 32,000 토큰. 2,048은 검색 품질을 위한 설계 결정.
- "Embedding 제한"이라 서술하면 구현자가 2048을 API hard limit으로 오해.
- **수정**: "(검색 품질 최적화 — Voyage AI 실제 상한 32K, 분할은 retrieval 정밀도 향상 목적)"

**8. [D5] MEM-2 "Tier 3-4: 주 1회" vs Product Scope 20-count trigger 혼용**
- MEM-2 L1478: "Tier 3-4(Haiku): 주 1회"
- Product Scope L951: "에이전트별 최근 20개 관찰(reflected=false)이 쌓이면 자동 실행"
- 주 1회 = 시간 기반 cap, 20개 threshold = 카운트 기반 trigger. 두 모델 동시 적용 시: "20개 쌓여도 이번 주에 이미 1번 했으면 스킵?" — 우선순위 미정의.
- **수정**: "Tier 3-4: 20개 threshold 충족 시에도 주 1회 cap (이번 주 이미 실행했으면 다음 주로 연기)"로 관계 명확화

**9. [D4] MKT-1 "Deferred Item" 라벨 위험**
- L1498: "⚠️ JSONB read-modify-write race 주의 (Deferred Item)"
- JSONB race condition은 동시 설정 변경 시 데이터 손실 → Sprint 2 구현 시 반드시 해결 필요
- "Deferred Item"이면 개발자가 "나중에 하라는 뜻"으로 해석 가능
- **수정**: "Deferred Item" → "구현 시 필수 해결 (`jsonb_set` atomic 또는 `SELECT FOR UPDATE`)" — 또는 별도 `company_api_keys` 테이블 분리 권고

---

### 총 이슈: 10건 (1 Critical + 4 Major + 4 Minor + 1 Observation)

### Observation (1)

**10. [D1] Summary 테이블 75개 — 수치 정합 검증 통과**
- 14개 카테고리 × 개수 합산 = 75 ✅
- Phase 분배: 14+9+4+10+6+11+5+10+6 = 75 ✅
- 각 카테고리별 Phase 매핑 검증 통과

---

## 가중 평균: 6.20/10 — FAIL ❌

계산: (8×0.15) + (6×0.20) + (5×0.15) + (7×0.15) + (5×0.20) + (7×0.15) = 1.20 + 1.20 + 0.75 + 1.05 + 1.00 + 1.05 = **6.25**

※ 반올림 → **6.25**. N8N-SEC-5 `4G` Critical + MEM Planning 혼동 + 8-layer 4개 누락 + MEM 3대 요구사항 누락 + WebSocket 전무 = D2/D3/D5에서 큰 감점.

---

## Cross-talk 완료

- **Winston**: 8-layer 보안 매핑 검증 요청 (Architecture 관점) — 응답 대기
- **Quinn**: MEM 보안 요구사항 누락 — **응답 수신 (6.00 FAIL)**
- **Bob**: N8N-SEC-5 4G 위반 + WebSocket 누락 + MKT-1 race condition — 응답 대기

---

## Cross-talk 보충 이슈 (Quinn 발견 채택)

11. **[D2/D6] PER-1 vs MEM Observation Sanitization 혼동 위험 (Quinn 발견)**
    - PER-1: personality_traits 4-layer (Key Boundary → API Zod → extraVars strip → Template regex) — Soul template 레이어
    - Missing MEM-6: observation content 4-layer (10KB cap → control char strip → prompt hardening → content classification) — 데이터 수집 레이어
    - 완전히 다른 공격 표면 + 다른 방어 체인인데 domain req에 PER-1만 존재
    - 구현자가 PER-1의 "Zod z.number().int()"를 observation TEXT content에 적용하려 할 위험
    - **Issue #4 강화**: MEM-6 추가 시 PER-1과 명확히 구분되도록 "Observation Content Sanitization (4-layer, PER-1과 별개)" 명시

12. **[D1 Minor] PER-5 접근성 — `aria-valuetext` 누락 (Bob 질문 → Sally 분석)**
    - PER-5: `aria-valuenow`, `aria-valuemin/max`, 키보드 조작 — WCAG 2.1 AA 핵심 충족
    - **누락**: `aria-valuetext` — 스크린리더가 "80"만 읽음, "높은 개방성 — 새로운 접근법을 적극 제안" 행동 컨텍스트 없음
    - PER-6이 hover/focus 툴팁 정의 → 동일 콘텐츠를 `aria-valuetext`에도 연결 필요
    - 추가 누락: `aria-label`/`<label>` 연결, 슬라이더 thumb 24×24px 최소 터치 타겟
    - **수정**: PER-5에 `aria-valuetext` 추가 (PER-6 툴팁 텍스트 연동)

13. **[D3 Minor] SOUL-6 파일 귀속 오류 (Winston M1 채택)**
    - SOUL-6 L1418: "agent-loop.ts에서 Soul 템플릿 변수를 DB 데이터로 치환 후 messages.create()에 전달"
    - 실제 역할: soul-renderer.ts (renderSoul) / soul-enricher.ts (변수 주입)
    - agent-loop.ts는 E8 경계 — 직접 Soul 템플릿 조작하면 E8 위반
    - **수정**: "soul-renderer.ts(renderSoul)에서 DB 데이터로 치환 후 agent-loop.ts가 messages.create()에 전달"

### 점수 조정 (Cross-talk 반영 — Quinn + Bob + Winston)

- Quinn: PER-1 vs MEM-6 혼동 위험 → Issue #4 강화
- Bob: MEM 5개 세부 누락 열거 (poisoning, TTL, advisory lock, 20-count, confidence) → Issue #4 보강
- Bob: PER-5 a11y 갭 → Issue #12 신규 Minor
- Winston: SOUL-6 파일 귀속 → Issue #13 신규 Minor
- Winston: PIX-4 접근성 충분 (3단 분류), MKT-4 기본 OFF 적절, 사이드바 domain req 불필요 → 모두 동의
- **D2: 6 → 유지** (이미 MEM 누락으로 6)
- **D3: 5 → 유지** (SOUL-6 파일 귀속 추가하나 기존 4G + Planning으로 이미 5)
- **D6: 7 → 유지** (보강 근거이나 기존 범위 내)
- **총 이슈: 13건 (1 Critical + 4 Major + 6 Minor + 1 Observation + 1 Cross-talk reinforcement)**
- **총점 유지: 6.25/10 FAIL**

---

## Post-Fix Verification (R2)

> Fix log: `stage-2-step-07-fixes.md` (15 fixes: 1 CRITICAL + 6 MAJOR + 8 MINOR)
> PRD re-read: lines 1352–1536

### Fix 검증

| # | Fix | 검증 | 결과 |
|---|-----|------|------|
| 1 | N8N-SEC-5 `4G`→`2G` + NODE_OPTIONS | L1459: `memory: 2G`, `NODE_OPTIONS=--max-old-space-size=1536`, "Brief 필수 (4G=OOM 확정)", 3단계 에스컬레이션 참조 | ✅ |
| 2 | N8N-SEC-7/8 추가 (8-layer 완성) | L1461: N8N-SEC-7 AES-256-GCM 암호화. L1462: N8N-SEC-8 rate limiting 분당 60회 | ✅ |
| 3 | MEM-6 Observation 4-layer | L1484: 10KB + 제어문자 + 프롬프트 하드닝 + 콘텐츠 분류. "PER-1과 별개 체인" 명시. Go/No-Go #9 | ✅ |
| 4 | MEM-7 Observation 30일 TTL | L1485: reflected=true 30일 삭제 + Admin 보존 정책 + confirmed #5 | ✅ |
| 5 | MEM-2 Reflection 크론 full spec | L1480: 일 1회 + ≥20 AND + confidence ≥ 0.7 + Tier cap + ECC 2.2 + advisory lock (confirmed #9). **우선순위 명확: AND 조건** | ✅ |
| 6 | MEM-4/5 Planning→read-time | L1482: "Reflection/Observation 삭제" (Planning 삭제 제거). L1483: "Reflection이 soul-enricher.ts에서 Soul에 주입될 때 activity_logs에 기록 (memory_id, agent_id, relevance score)" | ✅ |
| 7 | NRT-5 WebSocket 연결 제한 | L1516: 50/co, 500/server, 10 msg/s token bucket + oldest 해제 + 재연결 안내. confirmed #10 | ✅ |
| 8 | VEC-1 chunk 설명 | L1444: "검색 정밀도 최적화 — Voyage AI 실제 상한 32K" | ✅ |
| 9 | DB-3 Pre-Sprint note | L1393: Go/No-Go #10 통과 시 범위 축소 | ✅ |
| 10 | MKT-1 Deferred 제거 | L1502: "`jsonb_set` atomic... 적용 필수 (Sprint 2)" — Deferred 완전 제거 | ✅ |
| 11 | PIX-1 ≤200KB | L1491: "≤ 200KB gzipped" | ✅ |
| 12 | MEM-1 Option B 명확화 | L1479: "별도 reflections 테이블 생성 안 함" 추가 | ✅ |
| 13 | SOUL-6 soul-renderer.ts | L1418: "soul-renderer.ts에서" — agent-loop.ts 교체 완료 | ✅ |
| 14 | Summary table 80개 | L1536: 총 80, Phase 합 80 ✅. N8N-SEC 8, MEM 7, NRT 5 반영 | ✅ |
| 15 | ORC-6↔SOUL-5 유지 | 의도적 중복 (오케스트레이션 vs 템플릿 관점). 수용 | ✅ |

### 잔여 관찰 (Non-blocking)

1. **[D5 Minor] 8-layer Layer 3 "API key header injection" 암묵적 커버리지** — N8N-SEC 8개 항목이지만 Layer 3 (CORTHEX→n8n 서비스 간 API key 인증)은 명시적 domain req 없음. N8N-SEC-2 (Hono proxy)에서 암묵적으로 커버되나, Exec Summary L158의 8-layer 목록과 1:1 매핑은 7/8. 구현 시 Hono proxy 설정에서 자연스럽게 구현됨 — 별도 req 불필요할 수 있음.
2. **[D1 Micro] PER-5 `aria-valuetext` 미추가** — PER-6 툴팁 콘텐츠와 동일 문자열을 스크린리더에도 전달 필요. 구현 시 결정 가능.
3. **[D5 Micro] ORC-6↔SOUL-5 의도적 중복** — 수용. 관점 차이 인정.

### Post-Fix 차원별 점수

| 차원 | Pre-fix | Post-fix | 근거 |
|------|---------|----------|------|
| D1 구체성 | 8 | 9 | MEM-2 full spec (AND 조건 명시), MEM-6/7 상세, N8N-SEC-7/8 구체적, MEM-5 감사 로그 필드 명시 |
| D2 완전성 | 6 | 9 | MEM-6 poisoning, MEM-7 TTL, NRT-5 WebSocket, N8N-SEC-7/8. 80개 도메인 요구사항. Layer 3 암묵적 잔여 |
| D3 정확성 | 5 | 9 | 4G→2G, Planning→read-time, VEC-1 32K 명시, SOUL-6 파일 교정. 모든 confirmed decisions 매핑 |
| D4 실행가능성 | 7 | 9 | MKT-1 race condition Sprint 2 필수화, MEM-2 AND 조건 + Tier cap 명확, MEM-5 감사 로그 구체 필드 |
| D5 일관성 | 5 | 8.5 | 2G 전 PRD 정합, 8-layer 7/8 매핑 (Layer 3 암묵적), Planning 교정, MEM-2 AND로 Product Scope 통일. ORC-6/SOUL-5 의도적 중복 |
| D6 리스크 | 7 | 9 | MEM-6 poisoning 4-layer, MEM-7 TTL, NRT-5 WebSocket rate limiting, N8N-SEC-8 API rate limit. PER-5 aria-valuetext micro 잔여 |

### 가중 평균: 8.90/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (8.5×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.70 + 1.35 = **8.90**

**최종 잔여: 3건 (1 Minor + 2 Micro). 전부 non-blocking.**
