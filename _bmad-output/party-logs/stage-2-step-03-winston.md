# Critic-A Review — Stage 2 Step 3: Product Scope (PRD L634-1000)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 634–1000
**Grade Request**: B (reverify)
**Revision**: v2 (post cross-talk)

---

## Initial Review Score: 7.15/10 ✅ PASS

### Initial 차원별 점수 (pre cross-talk)

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 15% | SQL CREATE TABLE, 파일 경로, 모델명, 버전 전부 명시. 감점: L877 VECTOR(768) 오류값 |
| D2 완전성 | 7/10 | 15% | 11개 서브섹션, 4대 기능 상세. 감점: Feature 5-4에 Stage 1 확정 결정 3건 누락 (#5 TTL, #8 poisoning, #9 advisory lock) + 컬럼 2개 누락 |
| D3 정확성 | 7/10 | **25%** | 대부분 수치 검증 통과 (0-100 Big Five, 1024d observations, Stitch 2, 2G Docker). 감점: L877 VECTOR(768) 사실 오류, L963 "읽기만" 부정확 |
| D4 실행가능성 | 7/10 | **20%** | Sprint 구조, 파일 경로, 구현 패턴 actionable. 감점: advisory lock 없이 reflection cron 동시 실행 시 중복, TTL 없이 Neon storage 초과 |
| D5 일관성 | 7/10 | 15% | Feature 간 soul-enricher.ts 명칭 통일. 감점: L963 "읽기만" vs L918 "1행 훅 삽입" 자기모순, L893 vs L919/L925 실행 위치 불일치 |
| D6 리스크 | 7/10 | 10% | PixiJS 번들 제한, n8n 보안, Go/No-Go 게이팅 식별. 감점: observation poisoning 보안 리스크 미언급, advisory lock 데이터 무결성 리스크 미언급 |

**Initial 가중 평균**: (8×0.15)+(7×0.15)+(7×0.25)+(7×0.20)+(7×0.15)+(7×0.10) = 1.20+1.05+1.75+1.40+1.05+0.70 = **7.15**

---

## Post Cross-talk Revised Score: 6.65/10 ❌ FAIL

### Post cross-talk 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 8/10 | 15% | 변동 없음 |
| D2 완전성 | 6/10 | 15% | 7→6: reflections table 아키텍처 전략 Brief 불일치(Bob), n8n API 키 저장 전략 미명시(Quinn), Feature 5-3 프리셋 UX 미반영(Sally) 추가 |
| D3 정확성 | 6/10 | **25%** | 7→6: reflections 별도 테이블 vs Brief Option B "기존 확장"(Bob) — Brief/Tech Research 모두 agent_memories 확장인데 PRD만 별도 테이블. 마이그레이션 0061 번호 충돌(Bob) |
| D4 실행가능성 | 7/10 | **20%** | 변동 없음 |
| D5 일관성 | 6/10 | 15% | 7→6: agent-loop.ts 4곳 모순(L702, L725, L963 "변경없음" vs L834/L918 "1행 삽입")(Bob), reflections 테이블 전략 Brief↔PRD 불일치(Bob) |
| D6 리스크 | 7/10 | 10% | 변동 없음 |

**Revised 가중 평균**: (8×0.15)+(6×0.15)+(6×0.25)+(7×0.20)+(6×0.15)+(7×0.10) = 1.20+0.90+1.50+1.40+0.90+0.70 = **6.60**

**Score revision reason**: Bob의 cross-talk에서 reflections 별도 테이블 vs Brief Option B "기존 확장" 아키텍처 전략 불일치 + 마이그레이션 번호 충돌 발견. 이는 D3(정확성)과 D5(일관성) 모두에 영향. Sally의 UX 완전성 갭 + Quinn의 n8n API 키 저장 전략 미명시도 D2에 추가 감점.

---

## Post-Fix Verified Score: 8.60/10 ✅ PASS (Grade A-)

### Post-fix 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 15% | SQL 스키마 완전 (reflected/reflected_at, VECTOR(1024), poisoning 4-layer, advisory lock 함수). 프리셋 UX, WS 제한 명시. 감점: 마이그레이션 0061 번호 충돌 잔존 (deferred) |
| D2 완전성 | 9/10 | 15% | Stage 1 확정 결정 12건 전부 반영. Option B 구조 정확. Admin /office 접근 추가, CEO 사이드바 열거, Big Five 프리셋. 감점: n8n API 키 저장 전략 deferred |
| D3 정확성 | 8/10 | **25%** | Brief Option B 정확 구현. VECTOR(1024) 통일. agent_memories 확장. 감점: L828 0061=personality vs L905 0061=enum 번호 충돌 잔존 |
| D4 실행가능성 | 9/10 | **20%** | advisory lock, TTL purge, poisoning defense 구현 가능. soul-enricher 파이프라인 명확. 마이그레이션 순서 대부분 actionable |
| D5 일관성 | 8/10 | 15% | Brief Option B 전체 통일 (L858, L861, L883-891, L932, L936, L988). 코드 경계 L989 Rule #1과 일관. 감점: L828 vs L905 마이그레이션 0061 충돌, L702 "변경 없음" vs L944 "최소 수정" (GATE vs 구현 컨텍스트 — 허용 범위) |
| D6 리스크 | 9/10 | 10% | poisoning 4-layer, advisory lock, TTL, WS 제한, OOM, 비용 모델 모두 반영 |

**Post-fix 가중 평균**: (9×0.15)+(9×0.15)+(8×0.25)+(9×0.20)+(8×0.15)+(9×0.10) = 1.35+1.35+2.00+1.80+1.20+0.90 = **8.60**

### 수정 확인 (15건 중 12건 확인, 3건 deferred)

| Fix | 이슈 | 확인 |
|-----|------|------|
| Fix 1 | reflections 테이블 제거 → Brief Option B | ✅ L858, L861, L883-891 |
| Fix 2 | VECTOR(768) 제거 (Fix 1에 의해) | ✅ agent_memories.embedding VECTOR(1024) at L889 |
| Fix 3 | agent-loop.ts 경계 통일 | ✅ L989 "⚠️ 최소 수정" |
| Fix 4 | reflected/reflected_at 추가 | ✅ L877-878 |
| Fix 5 | Poisoning 4-layer 방어 추가 | ✅ L894-898 |
| Fix 6 | TTL 30일 추가 | ✅ L900-902 |
| Fix 7 | Advisory lock 추가 | ✅ L912 |
| Fix 8 | WS /office 제한 추가 | ✅ L937 tech stack table |
| Fix 9 | Admin /office 읽기 전용 | ✅ L733-734 |
| Fix 10 | Big Five 프리셋/툴팁 UX | ✅ L846-848 |
| Fix 12 | Planning → soul-enricher.ts 귀속 | ✅ L917 |
| Fix 13-15 | Tech stack/Out of Scope/Frontmatter | ✅ L932-938, L970-971, L988 |

### 잔존 이슈 (deferred — Architecture Stage)

| # | 이슈 | 심각도 |
|---|------|--------|
| R1 | Migration 0061 번호 충돌: L828(personality) vs L905(enum) — Sprint 1 vs Sprint 3 순서 확정 필요 | LOW |
| R2 | n8n 외부 API 키 → n8n credential store 명시 필요 | LOW |
| R3 | L702 "변경 없음" GATE 문맥 vs L944 구현 규칙 — 구분 주석 추가 권장 | VERY LOW |

---

## 이슈 목록 (10건 — cross-talk 후 3건 추가)

### CRITICAL (2건 — cross-talk 후 1건 추가)

| # | 이슈 | 위치 | 근거 |
|---|------|------|------|
| C1 | **reflections VECTOR(768) 차원 불일치** | L877 | observations L865: `VECTOR(1024)` (Voyage AI 정확). reflections L877: `VECTOR(768)` (Gemini stale). Confirmed Decision #1: 모든 임베딩 Voyage AI 1024d. cosine 검색 L894에서 1024d 쿼리 vs 768d 인덱스 → 차원 불일치로 검색 불가. **Fix**: `VECTOR(768)` → `VECTOR(1024)` |
| C2 | **reflections 별도 테이블 vs Brief Option B "기존 확장"** *(Bob cross-talk)* | L870-881 vs Brief L153-154 | Brief: "채택 전략: Option B — 기존 확장 (대체·병렬 아님). `agent_memories` 테이블에 `memoryType: 'reflection'` 추가". Tech Research Decision 4.4.4 (L1421-1426): `agent_memories` = processed OUTPUT. PRD L870-881: 별도 `reflections` CREATE TABLE. Brief/Tech Research 모두 agent_memories 확장인데 PRD만 별도 테이블 → 아키텍처 전략 근본 불일치. GATE 승인 없음. **Fix**: Brief Option B로 회귀 — reflections 별도 테이블 삭제, agent_memories에 memoryType enum 확장 + embedding vector(1024) 컬럼 추가 (Tech Research 0064/0065 마이그레이션 반영) |

### HIGH (3건)

| # | 이슈 | 위치 | 근거 |
|---|------|------|------|
| H1 | **observations 스키마 `reflected`/`reflected_at` 컬럼 누락** | L857-867 | Confirmed Decision #7: `is_processed` → `reflected`, `processed_at` → `reflected_at`. CREATE TABLE에 해당 컬럼 없음. 반성 크론(L888)이 어떤 관찰을 처리했는지 추적 불가. **Fix**: `reflected BOOLEAN DEFAULT false`, `reflected_at TIMESTAMPTZ` 컬럼 추가 |
| H2 | **agent-loop.ts 4곳 자기모순** *(Bob 확장)* | L702, L725, L963 vs L834, L918 | L702 "변경 없음", L725 "수정 없음", L963 "읽기만" → 3곳에서 agent-loop.ts 불변 주장. L834/L918/L919 Rule #1: "soul-enricher.ts 1행 훅 삽입만 허용" + 정확한 코드 패턴. **L918/L919가 authoritative** (가장 구체적, 실제 코드 명시). **Fix**: L702, L725, L963 모두 "soul-enricher.ts 1행 훅 삽입만 (Rule #1)"로 통일 |
| H3 | **Feature 5-4에 Stage 1 확정 결정 3건 미반영** | L843-897 | (a) Decision #5: processed observations 30일 TTL — 스키마/크론에 TTL 정책 미언급. Neon Free tier 4개월 만에 초과 리스크. (b) Decision #8: 4-layer observation poisoning defense (max 10KB, control char strip, prompt hardening, content classification) — Feature 5-4에 보안 계층 전무. (c) Decision #9: `pg_advisory_xact_lock(hashtext(companyId))` in reflection cron — L887-891 반성 크론에 advisory lock 미언급. 동시 실행 시 중복 반성 생성 리스크. |

### MEDIUM (3건 — cross-talk 후 2건 추가)

| # | 이슈 | 위치 | 근거 |
|---|------|------|------|
| M1 | **L893 Planning 단계 실행 위치 모호** | L893 vs L919, L925 | L893: "engine/agent-loop.ts에서 Soul 주입 직전 실행" — pgvector 검색이 agent-loop.ts에서 직접 실행되는 것으로 읽힘. L919: soul-enricher.enrich()가 personality + memory 모두 처리. L925 Rule #7: soul-enricher.ts = 단일 진입점. **Fix**: L893 "soul-enricher.ts에서 실행 (agent-loop.ts enrich() 1행 호출을 통해 트리거)" |
| M2 | **마이그레이션 0061 번호 충돌** *(Bob cross-talk)* | L820 vs Tech Research L1432-1437, L2380 | PRD: 0061 = personality_traits. Tech Research: 0061 = enum extension (memoryTypeEnum add 'reflection'), 0063 = personality_traits. Enum 확장이 observations 테이블보다 먼저 실행돼야 함. Brief Option B 회귀 시 Tech Research 순서(0061→enum, 0062→observations, 0063→personality, 0064/0065→agent_memories embedding)로 복원 필요 |
| M3 | **n8n 외부 API 키 저장 전략 미명시** *(Quinn cross-talk)* | L801 | "회사별 외부 API 키로 결제 — CORTHEX가 추적할 필요 없음"만 기술. 키 저장 위치(n8n credential store vs CORTHEX DB) 미명시. 아키텍처 판단: n8n credential store가 정확 (N8N_ENCRYPTION_KEY AES-256-GCM, Decision #3 8-layer 보안). Rule #4 "n8n = 외부 서비스" 경계와도 일관. **Fix**: "API 키는 n8n credential store에 저장 (N8N_ENCRYPTION_KEY 암호화)" 명시 |

### LOW (2건)

| # | 이슈 | 위치 | 상태 |
|---|------|------|------|
| L1 | Go/No-Go 게이트 수 불일치 (교차 섹션) | L447 header "8개" vs 테이블 9건 vs Decision #11 "11개" | Step 3 범위 외 (L447). Step 2 carry-forward 또는 해당 Step reviewer에게 위임 |
| L2 | Go/No-Go #7 테이블명 "agent_memories" vs 실제 "reflections" (교차 섹션) | L456 vs L870-881 | Step 3 범위 외 (L456). reflections 테이블명이 정확. agent_memories는 기존 v2 테이블 (별도). Gate 검증 대상 테이블 잘못 참조 |

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 |
| 보안 구멍 | ⚠️ Decision #8 observation poisoning defense 미언급 — 아키텍처 위반은 아니나 보안 계층 누락 |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ⚠️ Decision #9 advisory lock 없으면 중복 반성 생성 가능. 데이터 "손실"보다 "오염" — 불합격 수준은 아님 |
| 아키텍처 위반 | ❌ 없음 (E8 경계 준수: soul-enricher.ts는 services/ 위치, agent-loop.ts는 1행 훅만) |

---

## 검증 상세

### Feature 5-1 (OpenClaw PixiJS) ✅
- PixiJS 8 + @pixi/react: 기술 스택 정확
- `packages/office/` 독립 패키지: Rule #5와 일관
- WS 16→17채널: shared/types.ts:484-501 기준 — Step 2 검증 16 type-defined + 1 new = 17 정확
- activity_logs tail: 신규 테이블 없음 → 기존 인프라 활용 적절
- 5상태 매핑: engine 상태 → 시각화 애니메이션 명확

### Feature 5-2 (n8n 워크플로우) ✅
- API-only 통합, iframe 없음: Stage 1 R2 해소 확인
- Hono proxy → localhost:5678: 포트 외부 차단 유지
- tag 기반 멀티테넌트: `?tags=company:{companyId}` 격리
- AI 모델 구분: 대화 모델(Claude 고정) vs 도구 모델(Admin 설정) — L789 명확 구분
- 마케팅 프리셋: 비개발자 커스터마이즈 허용 — n8n 철학과 일관

### Feature 5-3 (Big Five 성격) ✅
- 0-100 정수 스케일: Decision 4.3.1 정확
- OCEAN 5축 기본값 50: Brief와 일관 (Brief는 0.0-1.0이나 Decision으로 변경됨)
- personality_traits JSONB: 마이그레이션 0061 정확
- soul-enricher.ts → personality_* 5개 extraVars → renderSoul(): 파이프라인 명확
- Tech Research personality-injector.ts → soul-enricher.ts 통합: L835에서 명시적 전환 기술

### Feature 5-4 (에이전트 메모리) ⚠️ (이슈 다수)
- 3단계 파이프라인 (관찰→반성→계획): 구조 논리적
- observations VECTOR(1024): ✅ Voyage AI 정확
- **reflections VECTOR(768)**: ❌ CRITICAL — 1024d여야 함
- **reflected/reflected_at 컬럼 누락**: ❌ Decision #7 미반영
- **30일 TTL 미언급**: ❌ Decision #5 미반영
- **poisoning defense 미언급**: ❌ Decision #8 미반영
- **advisory lock 미언급**: ❌ Decision #9 미반영
- Haiku 요약: 비용 모델 일관 (Decision #6: $1.80/mo reflection)
- memory-reflection.ts 파일 경로: L890 packages/server/src/services/ — 정확

### Phase 5 절대 규칙 ✅ (1건 제외)
- Rule #1-#7: 내부 논리 일관
- **예외**: L963 코드 경계 "읽기만"이 Rule #1 "1행 훅 삽입"과 모순

### Out of Scope ✅
- "에이전트 메모리 시스템 개편" Phase 1-4 제외, Phase 5+ 가능: Feature 5-4와 시기 일관
- "멀티 LLM" Phase 1-4 제외: L789 대화 모델 vs 도구 모델 구분으로 Feature 5-2와 비충돌

### UXUI 리디자인 + 메뉴 구조 ✅
- 테마 전폐 + 재실행: Brief 방향과 일관
- CEO앱 14페이지→6그룹 통합: FR-UX1 확정 반영
- costs 제거, SketchVibe Admin 이동, /office 신규: GATE 결정 반영

---

## Cross-talk 요청

### → bob (Critic-C): 구현 패턴 검증 요청
1. soul-enricher.ts에서 personality_* extraVars + relevant_memories를 동시에 처리하는 단일 진입점 패턴 — Tech Research의 personality-injector.ts 분리 설계 대비 trade-off 평가?
2. observations reflected/reflected_at 컬럼 누락 — 반성 크론에서 미처리 관찰 식별 방법 없음. 동의?

### → sally (Critic-B): 사용자 경험 관점
1. CEO앱 14→6 페이지 통합(L988-999)에서 "agents + departments + org → nexus 통합 or 2개로 축소 — UX 설계 단계 결정" (L997): 결정 미확정. 이 수준의 모호함 허용 가능?
2. 성격 슬라이더 5개(L837): Admin 에이전트 편집 UX 상 정보 과부하 리스크?

### → quinn (Critic-D): 보안/엣지케이스
1. Feature 5-4 observation poisoning defense(Decision #8) 미언급 — 보안 계층 완전 부재 동의?
2. reflections VECTOR(768) — cosine 검색 시 1024d 쿼리 vs 768d 인덱스 차원 불일치. 추가 검증?
3. advisory lock(Decision #9) 없는 reflection cron — 동시 실행 시나리오 평가?

---

## Cross-talk 결과 요약

### Bob (Critic-C) → Winston

| 질문/발견 | 판단 |
|-----------|------|
| reflections 별도 테이블 vs Brief Option B | **Bob 정확**. Brief+Tech Research = agent_memories 확장. PRD = 별도 테이블. PRD가 이탈. → CRITICAL C2 추가 |
| agent-loop.ts L702, L725 추가 모순 지점 | **Bob 정확**. 내 H2 L963만 잡았으나 실제 4곳 모순. → H2 확장 |
| 마이그레이션 0061 번호 충돌 | **Bob 정확**. PRD 0061=personality vs Tech Research 0061=enum. → MEDIUM M2 추가 |
| Reflection 비용 한도 미명시 | **동의**. Brief "$0.10~$0.50/agent/day" 범위가 Feature 5-4에 없음 |

### Sally (Critic-B) → Winston

| 질문/발견 | 판단 |
|-----------|------|
| L997 agents+departments+org 미결정 | **Sally 정확**. Pre-Sprint Phase 0 사이드바 IA 선행 결정 필수 (L170). "UX 설계 단계 결정"은 기한 없음 → carry-forward |
| Big Five 프리셋 UX 미반영 | **Sally 정확**. Journey A에 역할 프리셋 정의되어 있으나 Feature 5-3에 미반영. Progressive disclosure 패턴 필요 |
| D2 divergence (7 vs 6) | **렌즈 차이로 설명됨**. 아키텍처 D2=7 (백엔드 충분), UX D2=6 (프론트엔드 불충분). Bob 발견 반영 후 D2=6으로 수렴 |

### Quinn (Critic-D) → Winston

| 질문/발견 | 판단 |
|-----------|------|
| observation poisoning 보안 계층 부재 | **동의**. 내 H3b와 동일 |
| reflections VECTOR(768) 차원 불일치 | **동의**. 내 C1와 동일. pgvector 하드 에러 확인 |
| advisory lock 미언급 | **동의**. 내 H3c와 동일 |
| n8n 외부 API 키 저장 전략 | **Quinn 정확**. n8n credential store 명시 필요. → MEDIUM M3 추가 |
| Stage 1 확정 결정 6건 미반영 주장 | 내 카운트: 5건 (#1 partial, #5, #7, #8, #9). 6번째 확인 대기 |

---

## Carry-Forward to Architecture Stage

1. **reflections 저장 전략 확정**: Brief Option B (agent_memories 확장) vs PRD 별도 테이블 — GATE 결정 필요. Brief가 authoritative source이므로 Option B 회귀 권고
2. **마이그레이션 순서 확정**: Brief Option B 회귀 시 Tech Research 순서 채택 (0061 enum → 0062 observations → 0063 personality → 0064 agent_memories embedding → 0065 HNSW)
3. soul-enricher.ts 단일 진입점 vs personality-injector.ts + memory-planner.ts 분리: 아키텍처에서 확정 필요
4. observations TTL 30일 구현 메커니즘: pg_cron DELETE vs application-level cleanup — 아키텍처에서 결정
5. observation poisoning 4-layer sanitization: 각 레이어 구현 위치 (API route vs service vs engine) 아키텍처에서 확정
6. L997 agents+departments+org 페이지 통합 방향: Pre-Sprint Phase 0에서 확정 필요 (사이드바 IA 선행 조건)
7. Feature 5-3 Big Five 프리셋 UX: Journey A 역할 프리셋 + progressive disclosure 패턴 Feature 설명에 반영 필요
