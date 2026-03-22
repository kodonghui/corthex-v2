# Critic-A Review — Stage 2 Step 9: Technical Architecture Context (PRD L1784-2057)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 1784–2057
**Grade Request**: B (reverify)
**Revision**: **v1 8.30 → R2 9.30 PASS FINAL**

---

## Review Score: 8.30/10 ✅ PASS

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 15% | 멀티테넌트 8항목 전부 격리 방식/Sprint/근거 명시. RBAC v2+v3 매트릭스 per-permission 세분화. Compliance 5개 하위 테이블 + 검증 방법 명시. 4-layer sanitization 코드 위치까지 포함 |
| D2 완전성 | 8/10 | 15% | 11개 하위 섹션 전체 커버. But: API Surface v3 누락 (M2), L1901 N8N-SEC-7/8 미참조 (M3), MEM-7 30일 TTL Compliance 미반영 (L3) |
| D3 정확성 | 8/10 | **25%** | M1: L1903 "20/company" vs 확정 결정 #10 "50/company" — 확정 결정 위반. 4-layer sanitization = PER-1 정합 ✅. MEM-4/MEM-5 감사 로그 정합 ✅. n8n 2G 전체 정합 ✅ (선제 수정 확인) |
| D4 실행가능성 | 9/10 | **20%** | Drizzle getDB 패턴, 파일 경로 (soul-renderer.ts, soul-enricher.ts, memory-reflection.ts, crypto.ts), Docker config, 버전 핀. Compliance 각 격리에 검증 방법 (단위/통합/E2E/보안 테스트) 명시 |
| D5 일관성 | 7/10 | 15% | M1: 20 vs 50 확정 결정 위반 (5곳 50인데 1곳 20). M3: N8N-SEC-7/8 integration 테이블 미참조. L1: proxy rate limit 100 vs N8N-SEC-8 60 구분 불명확. eviction 정책 "idle" vs NRT-5 "oldest" 불일치 |
| D6 리스크 | 9/10 | 10% | JSONB race 2곳 경고 ✅. AES-256 단일 장애점 명시 ✅. Sprint 2 과부하 대응 명시 ✅. Reflection 크론 동시 실행 부하 식별 ✅. GDPR Phase 5+ 로드맵 ✅ |

**가중 평균**: (9×0.15)+(8×0.15)+(8×0.25)+(9×0.20)+(7×0.15)+(9×0.10) = 1.35+1.20+2.00+1.80+1.05+0.90 = **8.30**

---

## 이슈 목록

### MINOR (3건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| M1 | /ws/office "per-company 연결 상한 **20**" — 확정 결정 #10 위반 | L1903 | 확정 결정 #10: "50 connections/company, 500/server". PRD 5곳 (L418, L772, L978, L1516) 전부 50. L1903만 20. 추가: "idle 연결 graceful eviction" vs NRT-5 "oldest 연결 해제" — 해제 정책도 불일치 | D3 정확성, D5 일관성 |
| M2 | API Surface v3 API 부재 | L1934-1946 | 7개 API 전부 v2만. v3 추가: Big Five CRUD (`/api/admin/agents/:id/personality`), n8n proxy (`/admin/n8n/*`), Memory read (`/api/agents/:id/memories`), /ws/office — 없음. L1946 면책 "아키텍처 문서에서 확정"이 있으나 v3 API 존재 자체를 미인지 | D2 완전성 |
| M3 | L1901 n8n integration N8N-SEC-7/8 미참조 | L1901 | 보안 칼럼: SEC-1,2,3,4,5,6 + "proxy rate limit(100/min)" = 7항목. **N8N-SEC-7** (N8N_ENCRYPTION_KEY AES-256-GCM) **N8N-SEC-8** (API rate limit 분당 60회) 미참조. 8-layer 중 2 layer 누락 | D2 완전성, D5 일관성 |

### LOW (4건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| L1 | proxy rate limit 100/min vs N8N-SEC-8 60/min 구분 불명확 | L1779, L1901 | Innovation 리스크 "Hono proxy rate limit 100 req/min" ≠ N8N-SEC-8 "분당 60회". 전자는 proxy 레벨, 후자는 n8n API 레벨 — 다른 계층이지만 Technical Architecture Context에서 구분 없음 | D5 일관성 |
| L2 | soul-enricher.ts "engine/ 인접" 위치 모호 | L1905 | E8 경계: engine/ public API = agent-loop.ts + types.ts only. "engine/ 인접"이 engine/ 내부 (private) vs 외부 (lib/) vs 별도 디렉토리인지 불명확 | D4 실행가능성 |
| L3 | MEM-7 30일 TTL Compliance 미반영 | L2026 | Compliance "데이터 최소 수집"에서 "Reflection 크론 후 raw observations 자동 삭제 **옵션**" — MEM-7은 Sprint 3 **필수** (reflected=true 30일 자동 삭제). "옵션" vs "필수" 불일치 | D5 일관성 |
| L4 | N8N-SEC-7 Compliance 토큰 관리 미반영 | L2009-2017 | 보안 토큰 관리 테이블 5행 (CLI, Admin JWT, n8n proxy JWT, 외부 API, webhook HMAC). n8n 자체 크레덴셜 암호화 (N8N_ENCRYPTION_KEY, N8N-SEC-7) 미포함 — n8n이 저장하는 외부 서비스 인증 정보 보호 | D2 완전성 |

---

## john 6대 체크포인트 검증

| # | 체크포인트 | 판정 | 근거 |
|---|-----------|------|------|
| 1 | v3 멀티테넌트 격리 ↔ N8N-SEC/MEM 정합 | ⚠️ | 격리 테이블 8항목 중 N8N-SEC-1~4 정합 ✅. MEM-1,3 정합 ✅. But: N8N-SEC-7/8 미참조 (M3). 격리 테이블 자체는 무결하나 통합 테이블에서 2 layer 누락 |
| 2 | RBAC ↔ User Journeys 접근 권한 | ✅ | Admin: Big Five ✅, n8n editor ✅. CEO: /office 메인 사용 ✅, n8n 결과 읽기 ✅. Memory: Admin 삭제/CEO 읽기 ✅. Journey 2(팀장 n8n 결과), 8(Admin n8n), 9(/office CEO), 10(Memory Admin 관리) 전부 정합 |
| 3 | 통합 목록 ↔ v3 기능 누락 | ✅ | v2 9건 + v3 7건 = 16건 통합. Big Five(soul-enricher), n8n(Docker+Editor), OpenClaw(/office WS), Memory(Reflection+Voyage), 외부 AI 도구, SNS 게시 전부 포함. API Surface v3 부재는 별개 이슈 (M2) |
| 4 | Compliance 4-layer ↔ PER-1 동일 | ✅ | L1989-1994: Layer 0(Key Boundary) → A(API Zod) → B(extraVars strip) → C(Template regex). Risk Registry R7 (L403)과 동일 순서. 코드 위치 (soul-renderer.ts, soul-enricher.ts) 명시. 6개 built-in 키 목록 포함 |
| 5 | 감사 로그 ↔ MEM-4/MEM-5 정합 | ✅ | L2005: 메모리 삭제 (MEM-4) activity_logs ✅. L2006: Reflection 적용 (MEM-5) memory_id + agent_id + relevance score 3필드 정합 ✅. v2 4행 + v3 4행 = 8행 감사 이벤트 |
| 6 | n8n Docker 2G/2CPU Brief 정합 | ✅ | L1867: "memory: 2G, cpus: 2, NODE_OPTIONS=--max-old-space-size=1536 (N8N-SEC-5)" ✅. L1901: "Docker 2G/2CPU(N8N-SEC-5)" ✅. L2048: n8n Docker 2.12.3 ✅. 4G 잔류 0건 |

---

## 선제 수정 검증

| 위치 | 수정 | 판정 |
|------|------|------|
| L1841 | Reflection/Planning → Reflection/Observation | ✅ MEM-4 정합 |
| L1859 | memory: 4G → 2G + NODE_OPTIONS | ✅ Brief L408 준수 |
| L1893 | Docker 4G/2CPU → 2G/2CPU | ✅ 확정 결정 #2 |
| L1998 | Planning → Soul 주입 기록 | ✅ MEM-5 정합 |
| L2085 | "< 200KB" → "≤ 200KB" | ✅ PIX-1 정합 |

5/5 선제 수정 전부 정확.

---

## 긍정 평가

1. **멀티테넌트 테이블 v2→v3 분리**: v2 기본 격리(유지) + v3 확장(Sprint별) 구조로 기존↔신규 명확 분리
2. **RBAC 결정 근거 명시** (L1846-1850): 각 권한 결정에 "왜" 포함 (예: "에이전트 성격은 조직 설계의 일부이므로 CEO/Human이 임의 변경하면 일관성 파괴")
3. **Compliance 검증 방법 포함**: 각 격리 항목에 테스트 유형 (단위/통합/E2E/보안) + 기대 결과 명시 — 구현팀이 즉시 테스트 작성 가능
4. **JSONB race 2곳 경고**: L1826 + L2016에서 동일 리스크 이중 경고 — 방어적 중복 적절
5. **Sprint 2 과부하 대응**: L2050-2052에서 인프라/워크플로우 트랙 분리 전략 제시 — Scrum 실행 가능
6. **AES-256 단일 장애점 투명 공개**: L1981 "전 회사 CLI 토큰 + 외부 API 키 복호화 가능" 명시 + Phase 5+ Vault/KMS 전환 계획
7. **4-layer sanitization 코드 위치 완비**: Layer별 파일명 + 동작 + 6개 built-in 키 목록 — Architecture에서 즉시 구현 가능
8. **Reflection 크론 동시 실행 부하 식별** (L2054-2057): 크론 오프셋 vs 큐잉 전략 Architecture 확정 요청 — 선제적 리스크 인식

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 — 기술 스택, 버전, 파일 경로 전부 검증 가능 |
| 보안 구멍 | ❌ 없음 — 4-layer, AES-256, RBAC, HMAC 전부 커버. N8N-SEC-7/8 누락은 완전성 이슈 (보안 구멍 아님) |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 — Option B 확장 패턴, 감사 로그 "무제한" 보존 |
| 아키텍처 위반 | ❌ 없음 — engine/ E8 경계 언급, SDK agent-loop.ts only import |

---

## Confirmed Decisions Coverage

| # | Decision | Step 9 반영 |
|---|----------|--------------------|
| 2 | n8n Docker 2G | ✅ L1867, L1901 (선제 수정 확인) |
| 3 | n8n 8-layer | ⚠️ L1901 6/8 layer 참조 (SEC-7/8 미참조, M3) |
| 5 | 30일 TTL | ⚠️ Compliance에서 "옵션"으로 기술 (L3) |
| 8 | Obs Poisoning | ✅ 4-layer sanitization 별도 (PER-1 vs MEM-6 구분 인지) |
| 9 | Advisory lock | ✅ L2054-2057 크론 동시 실행 + Architecture carry-forward |
| 10 | WS limits | ❌ L1903 "20/company" — 확정 결정 위반 (M1) |
| 12 | host.docker.internal | ⚠️ 미참조 — n8n Docker 통신 시 관련 가능, Architecture carry-forward |

---

## Carry-Forward to Writer

1. **L1903 "20" → "50"**: 확정 결정 #10 (50/company, 500/server, 10msg/s). "idle 연결 graceful eviction" → NRT-5 확인 후 통일
2. **API Surface v3 추가**: 최소 v3 논리 API 목록 (Big Five, n8n proxy, Memory, /ws/office) 또는 "v3 API는 Architecture에서 정의" 명시
3. **L1901 N8N-SEC-7/8 추가**: 보안 칼럼에 N8N-SEC-7 (encryption) + N8N-SEC-8 (API 60/min) 추가
4. **L2026 "옵션" → MEM-7 Sprint 3 필수**: "Reflection 크론 후 reflected=true 30일 자동 삭제 (MEM-7, Sprint 3)"
5. **보안 토큰 관리에 N8N-SEC-7 행 추가**: n8n 크레덴셜 암호화 (N8N_ENCRYPTION_KEY AES-256-GCM)

---

## R2 검증 — 11/11 수정 확인

**R2 Score: 9.30/10 ✅ PASS FINAL**

### R2 차원별 점수

| 차원 | R1 | R2 | 가중치 | 근거 |
|------|-----|-----|--------|------|
| D1 구체성 | 9 | 9.5 | 15% | MEM-6 4-layer 공격 체인 + Layer별 위치·동작 명시. API Surface v3 9행 Sprint 귀속 포함. PER-1/MEM-6 차이 설명 추가 |
| D2 완전성 | 8 | 9.5 | 15% | v3 API 9행 추가 ✅. N8N-SEC 8/8 완전 반영 ✅. MEM-6 Compliance 별도 체인 ✅. 토큰 테이블 N8N-SEC-7 추가 ✅. Voyage AI Phase 교정 ✅ |
| D3 정확성 | 8 | 9 | **25%** | L1903 50/company 확정 결정 #10 정합 ✅. eviction "oldest" NRT-5 정합 ✅. MEM-7 "필수" + Admin 보존 정합 ✅. N8N-SEC 8건 count 정합 ✅ |
| D4 실행가능성 | 9 | 9.5 | **20%** | soul-enricher.ts "engine/ 외부, E8 경계 밖 — lib/ 레벨" 명확 ✅. v3 API Sprint별 구현 순서 ✅. advisory lock `pg_advisory_xact_lock(hashtext(companyId))` 명시 ✅ |
| D5 일관성 | 7 | 9 | 15% | 20→50 통일 ✅. eviction "idle"→"oldest" NRT-5 통일 ✅. N8N-SEC 6→8건 전파 ✅. MEM-7 "옵션"→"필수" ✅. proxy 100/min + API 60/min 양쪽 명시 (L1901) ✅ |
| D6 리스크 | 9 | 9.5 | 10% | advisory lock 확정 결정 #9 교차 참조 ✅. MEM-6 공격 체인 명시 ✅. Sprint 2 과부하 N8N-SEC 8건 정확 ✅ |

**가중 평균**: (9.5×0.15)+(9.5×0.15)+(9×0.25)+(9.5×0.20)+(9×0.15)+(9.5×0.10) = 1.425+1.425+2.25+1.90+1.35+0.95 = **9.30**

### 11/11 수정 검증

| # | Fix | 검증 | 위치 |
|---|-----|------|------|
| 1 | /ws/office 20→50 + eviction oldest | ✅ | L1903 "50 conn/company, 500 conn/server, 10 msg/s — NRT-5 확정 결정 #10 준수. 초과 시 oldest 연결 해제" |
| 2 | API Surface v3 9행 | ✅ | L1946-1958: Big Five PATCH/GET, n8n proxy, editor, memories, delete, growth, API keys, /ws/office |
| 3 | MEM-6 Compliance 4-layer | ✅ | L2010-2019: 공격 체인 + Size cap → Control strip → Prompt harden → Classification |
| 4 | N8N-SEC-7/8 통합 목록 | ✅ | L1901: "크레덴셜 암호화(N8N-SEC-7), n8n API rate limit 60/min(N8N-SEC-8)" |
| 5 | N8N-SEC 6→8건 | ✅ | L2077: "N8N-SEC 8건" |
| 6 | /office Mobile ❌→△ | ✅ | L1921: "△ (리스트 뷰 대체, PIX-3)" |
| 7 | MEM-7 옵션→필수 | ✅ | L2052: "MEM-7, Sprint 3 필수. Admin 보존 정책 설정 가능" |
| 8 | soul-enricher E8 위치 | ✅ | L1905: "engine/ 외부, E8 경계 밖 — lib/ 레벨" |
| 9 | Voyage AI Phase | ✅ | L1892: "Pre-Sprint→유지" + "Go/No-Go #10" |
| 10 | 토큰 테이블 N8N-SEC-7 | ✅ | L2043: "N8N_ENCRYPTION_KEY (AES-256-GCM, N8N-SEC-7)" |
| 11 | Advisory lock 교차 참조 | ✅ | L2083: "pg_advisory_xact_lock(hashtext(companyId)) (확정 결정 #9, MEM-2)" |

### Confirmed Decisions Coverage R2

| # | Decision | R1 | R2 |
|---|----------|-----|-----|
| 2 | n8n Docker 2G | ✅ | ✅ |
| 3 | n8n 8-layer | ⚠️ | ✅ (8/8) |
| 5 | 30일 TTL | ⚠️ | ✅ (필수) |
| 8 | Obs Poisoning | ✅ | ✅ (MEM-6 Compliance 추가) |
| 9 | Advisory lock | ✅ | ✅ (명시적 교차 참조) |
| 10 | WS limits | ❌ | ✅ (50/company) |
| 12 | host.docker.internal | ⚠️ | ⚠️ (Architecture carry-forward) |

### R2 Residuals (non-blocking)

| Item | Notes |
|------|-------|
| host.docker.internal (#12) | n8n Docker 통신 시 관련 가능 — Architecture에서 확정 |
| SDK `0.2.x` exact pinning | PRD 수준 수용. package.json에서 exact pin (observation) |
| Migration Guide v3 | Sprint roadmap이 담당 (Bob/Sally 합의, observation) |
| Sprint 2A/2B 분리 상세 | Bob 제안, Sprint Planning에서 확정 |
