# Critic-UX (Sally) Review — Stage 2 Step 9: Technical Architecture Context

> Reviewer: Sally (UX Designer)
> Weights: D1=15%, D2=20%, D3=15%, D4=15%, D5=20%, D6=15%
> Section: PRD `prd.md` lines 1784–2057 (## Technical Architecture Context)
> Cross-refs: Domain Req NRT-5 (WS limits), confirmed-decisions-stage1.md (#10 WS 50/co), PER-1 (4-layer), MEM-6 (Obs 4-layer), MEM-4/MEM-5 (감사 로그), N8N-SEC-5 (2G)
> NOTE: 용어 치환 이슈는 Pre-sweep 완료. 구조/로직/정합성만 평가.

---

## 차원별 점수

| 차원 | 점수 | 근거 |
|------|------|------|
| D1 구체성 | 8/10 | 멀티테넌트 8항목(격리 방식+Sprint+근거), RBAC 매트릭스 7열×3역할, 통합 16건(v2 9+v3 7) 프로토콜·방향·보안 상세, 반응형 7기능×3디바이스 매트릭스, 컴플라이언스 검증 방법 구체적. **약점:** API Surface 7개 API가 전부 v2 — v3 신규 API 0개 기재. |
| D2 완전성 | 7/10 | Project-Type → 멀티테넌트 → RBAC → 과금 → 통합 → 반응형 → 성능 → API → 마이그레이션 → 컴플라이언스 → 구현 — 논리 흐름 우수. **그러나:** **(1)** API Surface에 v3 API 0개 (n8n proxy, Big Five CRUD, Memory 관리). **(2)** 컴플라이언스 프롬프트 주입 방어가 PER-1만 — MEM-6 Observation 4-layer 부재. **(3)** 마이그레이션 가이드 Phase 1-3(v2)만, v3 단계(Voyage AI 768→1024d, costs 제거) 없음. |
| D3 정확성 | 8/10 | Pre-fix 5건 전부 확인 (L1841 Reflection/Observation, L1859 2G, L1893 2G/2CPU, L1998 Soul 주입 기록, L2085 ≤200KB). PER-1 4-layer 세부(L1989-1994) 정확. 감사 로그 MEM-4(L2005)/MEM-5(L2006) 정합. **약점:** L1903 /ws/office "per-company 연결 상한 20" — NRT-5(L1516)/R15(L418)/confirmed #10 모두 "50 conn/company". 명확한 수치 오류. |
| D4 실행가능성 | 8/10 | Sprint별 멀티테넌트 확장 로드맵 명확. Sprint 2 과부하 대응 전략(인프라 vs 워크플로우 트랙 분리). Reflection 크론 부하 스케줄링 이슈 명시. SDK 버전 핀. **약점:** Migration Guide가 v2만이므로 v3 실행 가이드 불완전. |
| D5 일관성 | 7/10 | RBAC ↔ User Journeys 접근 권한 일치 우수 (Admin Big Five ✅, CEO /office ✅, CEO n8n 결과 읽기 ✅). 멀티테넌트 ↔ N8N-SEC 정합. **약점:** **(1)** L1903 "20" vs NRT-5/R15 "50" — 확정 결정 위반. **(2)** /office Mobile ❌ vs Tablet △ — 동일 "리스트 뷰 대체"인데 기호 비일관. **(3)** Voyage AI Phase "4"(v2 통합 시점) vs Pre-Sprint 마이그레이션 — 혼동 가능. |
| D6 리스크 | 7/10 | AES-256 마스터 키 SPOF 식별 + Phase 5+ Vault 완화. JSONB race condition Deferred 명시. Sprint 2 과부하 인식. **약점:** 컴플라이언스에서 MEM-6 observation poisoning 방어 체인 부재. PER-1 보안만 있고 MEM-6 보안 없으면 observation→reflection→Soul 공격 경로가 컴플라이언스 검토에서 빠짐. |

---

## 이슈 목록

### MAJOR (1)

**1. [D3/D5] L1903 /ws/office "per-company 연결 상한 20" — 50이어야 함**
- L1903: "per-company 연결 상한 20, 초과 시 idle 연결 graceful eviction"
- NRT-5 (L1516): "50 conn/company, 500 conn/server, 10 msg/s per userId"
- R15 (L418): "50conn/company, 500/server, 10msg/s 제한"
- Product Scope (L978): "50conn/company, 500/server"
- Confirmed decision #10: 50/company
- **4곳에서 50, 1곳에서 20 — 명확한 수치 불일치, 확정 결정 위반**
- **수정**: L1903 "연결 상한 20" → "연결 상한 50 (NRT-5, confirmed #10)" + "500 conn/server" 추가

### MINOR (6) + Observation (1)

**2. [D2] API Surface 테이블 — v3 신규 API 부재**
- L1934-1944: 7개 API 전부 v2. v3 신규 API 0개:
  - n8n proxy: `/admin/n8n/*`, `/admin/n8n-editor/*` (RBAC L1842, Integrations L1901에서 참조)
  - Big Five personality CRUD API (PER-1, RBAC L1842에서 "편집" 참조)
  - Memory 관리: observations 조회, reflections 읽기, Admin 삭제(MEM-4), Reflection 설정(MEM-2)
  - /ws/office WebSocket endpoint (Integrations L1903에서 참조)
- L1946 면책("실제 라우트는 아키텍처 문서에서 확정")이 있으나, "논리적 구조"에서도 v3 API가 0개는 Technical Architecture Context로서 불완전
- **수정**: v3 주요 API 엔드포인트 4-5행 추가 (최소: n8n proxy, Big Five, Memory, /ws/office)

**3. [D2/D6] Compliance 프롬프트 주입 방어 — MEM-6 Observation 4-layer 부재**
- L1985-1994: PER-1 (Big Five personality → Soul injection) 4-layer만 기술
- MEM-6 (Observation content → Reflection → Soul injection) 4-layer 미포함:
  - Layer 1: max 10KB cap
  - Layer 2: 제어문자 strip
  - Layer 3: 프롬프트 하드닝
  - Layer 4: 콘텐츠 분류
- PER-1과 MEM-6는 **별개 공격 표면, 별개 방어 체인** (Quinn Step 7 확인, confirmed decision #8)
- 컴플라이언스 섹션에서 프롬프트 주입 방어를 다루면서 observation poisoning을 빠뜨리면 보안 감사 불완전
- **수정**: L1994 뒤에 "**Observation Content Poisoning 방어 (MEM-6, 확정 결정 #8):**" 4-layer 테이블 추가. "PER-1과 별개 체인" 명시

**4. [D2] Migration Guide — v3 마이그레이션 단계 부재**
- L1948-1963: Phase 1-3 (v2 엔진 교체)만 기술. v3 마이그레이션 단계 없음:
  - Pre-Sprint: Voyage AI 768d→1024d re-embed + HNSW rebuild (Go/No-Go #10, R11)
  - Sprint 1: agents 테이블 personality_traits JSONB 컬럼 추가
  - Sprint 3: observations 신규 테이블 + agent_memories memoryType/embedding 확장
  - Sprint 3: costs.ts/cost-aggregation.ts 제거 (L1860에서 언급했으나 Migration에 미반영)
- Technical Architecture Context는 현재+미래 마이그레이션 모두 포함해야 함
- **수정**: "**v3 마이그레이션 (Sprint별):**" 섹션 추가 (Pre-Sprint, Sprint 1, 3 단계)

**5. [D5] L1921 /office Mobile "❌ (리스트 뷰 대체)" — Tablet "△ (리스트 뷰 대체)"와 비일관**
- Tablet: `△ (리스트 뷰 대체 — 에이전트 이름+상태+색상 뱃지, 정렬 가능)`
- Mobile: `❌ (리스트 뷰 대체, PIX-3)`
- 둘 다 "리스트 뷰 대체"인데 기호가 다름 (△ vs ❌)
- Mobile에 리스트 뷰가 존재하면 △ (partial)이지 ❌ (none)이 아님
- **수정**: Mobile 열을 `△ (리스트 뷰 — 에이전트 이름+상태, PIX-3)` 또는 리스트 뷰 미제공이면 Tablet과 Mobile 모두 일관된 기호 사용

**6. [D5] L1892 Voyage AI Phase "4" — Pre-Sprint 마이그레이션과 혼동**
- v2 통합 테이블 Phase 열 = v2에서 통합된 Phase
- L1892 Voyage AI: Phase "4", Status "v3 마이그레이션 필요 (Gemini 금지)"
- Go/No-Go #10 (L465): Pre-Sprint에 768→1024d 마이그레이션 필수
- Phase "4"가 v2 시점인지 v3 시점인지 혼동 가능
- **수정**: Phase 열을 "4 (v2) → Pre-Sprint (v3)" 또는 Status에 "(Pre-Sprint, Go/No-Go #10)" 참조 추가

**7. [D3/D5] L1901 N8N-SEC-7/8 미참조 + rate limit 수치 불일치 (Cross-talk: Winston M3)**
- L1901 보안 격리: N8N-SEC-1~6만 나열. N8N-SEC-7 (encryption) + N8N-SEC-8 (rate limit) 부재
- L1901 "100 req/min/Admin" vs N8N-SEC-8 "분당 60회" — 수치 불일치 또는 별도 레이어 구분 불명확
- **수정**: L1901 보안 격리에 N8N-SEC-7/8 추가 + rate limit 수치 정합 또는 구분 명시

**8. [D3/D5] L2051 "N8N-SEC 6건" → 8건 (Cross-talk: Quinn m2)**
- Step 7 Fix 2에서 N8N-SEC-7 + N8N-SEC-8 추가하여 총 8건
- L2051 "15건+" → "18건+"으로 Sprint 2 과부하 심각도 과소평가
- **수정**: L2051 "N8N-SEC 6건" → "N8N-SEC 8건", "15건+" → "18건+"

### Observation (cross-talk에서 하향 조정)

**Obs-A. [D2] Migration Guide v3 부재 (원래 MINOR #4 → observation 하향)**
- Bob 근거 수용: Pre-Sprint Voyage AI는 Sprint roadmap + Go/No-Go #10에서 이미 문서화
- Migration Guide 범위는 "기존→신규 전환". v3 신규 추가는 Sprint roadmap 담당
- Winston은 "최소 개요 필요" — John 판단에 위임

---

### 긍정적 관찰

- **멀티테넌트 v3 확장 테이블 (L1815-1826)**: 8개 항목 각각 격리 방식 + Sprint + 근거 3-column 구조. n8n tag, webhook HMAC, memory agent_id FK 간접 격리 등 구현 수준까지 명시.
- **RBAC v3 확장 (L1838-1844)**: User Journeys J2(Admin 조직 설계), J5(Big Five), J8(n8n)과 정확히 일치하는 역할별 권한 매핑. RBAC 결정 근거(L1846-1850) 4개 항목이 UX 관점 설명("에이전트 성격은 조직 설계의 일부이므로 CEO가 임의 변경하면 일관성 파괴")으로 매우 우수.
- **PER-1 4-layer 상세 (L1989-1994)**: Layer 0~C까지 위치·동작·코드 수준 명시. Stage 1 Research §2.3와 완전 일치 확인.
- **감사 로그 (L1996-2007)**: v2 4건 + v3 4건. MEM-4(Admin 메모리 삭제), MEM-5(Soul 주입 시 memory_id + agent_id + relevance score) 정확 반영.
- **반응형 매트릭스 (L1915-1924)**: /office Tablet "리스트 뷰 대체 — 에이전트 이름+상태+색상 뱃지, 정렬 가능"은 PIX-3 구현 가이드로 UX적으로 우수한 폴백 설계.
- **Sprint 2 과부하 인식 (L2050-2052)**: 인프라 vs 워크플로우 트랙 분리 제안 — 현실적 대응.

---

## 가중 평균: 7.45/10 ✅ PASS

계산: (8×0.15) + (7×0.20) + (8×0.15) + (8×0.15) + (7×0.20) + (7×0.15) = 1.20 + 1.40 + 1.20 + 1.20 + 1.40 + 1.05 = **7.45**

---

## Cross-talk 완료

### 스코어 비교

| Critic | Score | Status |
|--------|-------|--------|
| Winston (Architecture) | 8.30 | ✅ PASS |
| Sally (UX) | 7.45 | ✅ PASS |
| Bob (Scrum) | 7.28 | ✅ PASS |
| Quinn (QA/Security) | 7.25 | ✅ PASS |

### Cross-talk 채택

**#7 (from Winston M3). [D3/D5] L1901 N8N-SEC-7/8 미참조 + rate limit 수치 불일치 (minor)**
- L1901 보안 격리 열: N8N-SEC-1~6만 나열. N8N-SEC-7 (N8N_ENCRYPTION_KEY AES-256-GCM) + N8N-SEC-8 (API rate limiting) 부재
- 8-layer 프레임워크에서 2/8 누락
- rate limit 수치: L1901 "100 req/min/Admin" vs N8N-SEC-8 "분당 60회, configurable" — Hono proxy vs n8n 자체 구분인지, 오류인지 명확화 필요
- **수정**: L1901 보안 격리에 N8N-SEC-7/8 추가 + rate limit 수치 정합

**#8 (from Quinn m2). [D3/D5] L2051 "N8N-SEC 6건" → 8건 (minor)**
- Step 7에서 N8N-SEC-7 + N8N-SEC-8 추가하여 총 8건
- L2051 "15건+" → "18건+"으로 Sprint 2 과부하 심각도 과소평가
- **수정**: L2051 "N8N-SEC 6건" → "N8N-SEC 8건", "15건+" → "18건+"

### Cross-talk 조정

**#4 (Migration Guide v3 부재) — MINOR → Observation으로 하향**
- Bob 근거 수용: Pre-Sprint Voyage AI는 L430-432 Sprint roadmap + L465 Go/No-Go #10에서 이미 prominent하게 문서화
- Migration Guide 범위는 "기존→신규 전환" (v2 아키텍처 변환)이지, v3 신규 추가는 Sprint roadmap이 담당
- Winston은 "최소 개요 필요" 의견 — John 판단에 위임

### Cross-talk 관찰 (스코어 비변동)

**Obs-1 (from Winston Q2). CEO Big Five 읽기 권한 부재**
- RBAC에 CEO Big Five 읽기 없음. UX 판단: **불필요** — CEO는 행동 결과로 성격을 경험하며 0-100 숫자는 비개발자에게 무의미. 프리셋명으로 성격 이해. Feature Requirements 범위.

**Obs-2 (from Quinn m4). MEM-7 30일 TTL — GDPR 미반영**
- L2026 "데이터 최소 수집"에서 observations 삭제를 Phase 5+로 기재하나, MEM-7은 Sprint 3에서 30일 TTL 이미 구현 (confirmed #5). GDPR 섹션의 "현재 상태"가 실제와 불일치.

### Cross-talk 확인 (기존 이슈 강화)

- **Quinn M1/Sally #3**: MEM-6 compliance 부재 — 전원 합의. Quinn은 MAJOR, Sally는 MINOR (5곳+ 이미 문서화되어 구현 누락 가능성 낮음)
- **Winston/Quinn/Bob**: 20→50 ws/office — 전원 합의 (MAJOR #1)
- **Quinn/Bob/Sally**: API Surface v3 부재 — 전원 합의 (MINOR #2)
- **Quinn/Sally**: /office Mobile ❌ → △ — 합의 (MINOR #5)
- **Bob**: n8n editor Tablet △ "읽기 위주" — 현실적 평가 (워크플로우 조회 ✅, 실행 로그 ✅, 편집 ❌)
- **Winston**: WS 50conn 메모리 산정 안전 확인 (5,000conn × 50KB = 250MB, VPS 22GB 여유)

---

## R2 검증 (11개 수정 사항)

| # | Fix | 검증 결과 |
|---|-----|-----------|
| 1 | L1903 /ws/office 20→50 conn/company + 500/server + 10 msg/s (NRT-5 확정 결정 #10) | ✅ 수치 정합 확인 |
| 2 | API Surface v3 9행 추가 (Big Five PATCH/GET, n8n proxy, Memory CRUD, API keys, /ws/office) | ✅ v3 API 완전 커버 |
| 3 | Compliance MEM-6 4-layer 방어 테이블 (PER-1과 별개 체인, 공격 체인 명시) | ✅ 4-layer 정확, PER-1↔MEM-6 분리 명확 |
| 4 | L1901 N8N-SEC-7/8 통합 + "proxy rate limit(100) + n8n API rate limit 60/min(N8N-SEC-8)" | ✅ 8/8 layer 완전, 2-tier rate limit 구분 명확 |
| 5 | L2077 "N8N-SEC 8건" + "17건+" Sprint 2 과부하 정합 | ✅ 수치 일치 |
| 6 | L1921 /office Mobile ❌→△ (리스트 뷰 대체, PIX-3) | ✅ Tablet △와 일관 |
| 7 | L2052 MEM-7 30일 TTL "Sprint 3 필수" + Admin 보존 정책 | ✅ confirmed #5 정합 |
| 8 | L1905 soul-enricher.ts "engine/ 외부, E8 경계 밖 — lib/ 레벨" | ✅ E8 경계 정확 |
| 9 | L1892 Voyage AI Phase "Pre-Sprint→유지" + Go/No-Go #10 | ✅ Phase 혼동 해소 |
| 10 | L2043 N8N-SEC-7 토큰 관리 행 추가 (N8N_ENCRYPTION_KEY AES-256-GCM) | ✅ 보안 토큰 커버 |
| 11 | L2083 Reflection 크론 advisory lock (확정 결정 #9, MEM-2) | ✅ 교차 참조 정확 |

**11/11 수정 전부 검증 완료.**

---

## R2 차원별 점수

| 차원 | R1 | R2 | 변화 근거 |
|------|-----|-----|-----------|
| D1 구체성 | 8 | 9 | API Surface v3 9행(Fix 2), N8N-SEC-7/8 상세(Fix 4), MEM-7 TTL 상세(Fix 7) |
| D2 완전성 | 7 | 9 | v3 API 완전 커버(Fix 2), MEM-6 compliance 추가(Fix 3), Voyage AI Phase 명확(Fix 9) |
| D3 정확성 | 8 | 9 | /ws/office 50 정합(Fix 1), N8N-SEC 8건 정합(Fix 5), soul-enricher E8 경계(Fix 8) |
| D4 실행가능성 | 8 | 9 | advisory lock 교차 참조(Fix 11), 2-tier rate limit 구분(Fix 4), Mobile △ 일관(Fix 6) |
| D5 일관성 | 7 | 9 | /ws/office 수치 통일(Fix 1), Mobile/Tablet △ 일관(Fix 6), N8N-SEC 8건 전파(Fix 5) |
| D6 리스크 | 7 | 9 | MEM-6 공격 체인 명시(Fix 3), N8N-SEC-7 토큰 관리(Fix 10), MEM-7 GDPR 정합(Fix 7) |

---

## R2 가중 평균: 9.00/10 ✅ PASS

계산: (9×0.15) + (9×0.20) + (9×0.15) + (9×0.15) + (9×0.20) + (9×0.15) = 1.35 + 1.80 + 1.35 + 1.35 + 1.80 + 1.35 = **9.00**

---

## Residuals (non-blocking, deferred)

| Item | Source | Notes |
|------|--------|-------|
| SDK 버전 "0.2.x" wildcard vs exact pin | Quinn LOW | 코딩 시점 결정 — PRD 범위 밖 |
| Go/No-Go #5 L460 "< 200KB" → "≤ 200KB" | Bob (Step 5 범위) | Step 5 리뷰 시 수정 대상 |
| Migration Guide v3 개요 | Winston obs | John 판단에 위임, Sprint roadmap + Go/No-Go #10에서 커버 |

---

## 최종 결과

| | R1 | R2 |
|---|-----|-----|
| Score | 7.45 | **9.00** |
| Status | ✅ PASS | **✅ PASS** |

**Step 9 Technical Architecture Context — COMPLETE.**
