# Critic-A Review — Stage 2 Step 11: Functional Requirements (PRD L2285-2494)

**Reviewer**: Winston (Architecture + API)
**Date**: 2026-03-22
**Artifact**: `_bmad-output/planning-artifacts/prd.md` lines 2285–2494
**Grade Request**: A (2사이클 필수, avg ≥ 8.0)
**Revision**: **R2 9.40 PASS FINAL**

---

## Review Score: 8.80/10 ✅ PASS

### 차원별 점수

| 차원 | 점수 | 가중치 | 근거 |
|------|------|--------|------|
| D1 구체성 | 9/10 | 15% | FR-N8N4: 5항목 보안 상세 (포트/UI/프록시/DB차단/메모리). FR-PERS2: Zod 스키마 + DB CHECK 5축. FR-OC7: LISTEN/NOTIFY + 500ms 폴링 폴백. FR-MEM4: Option B + NFR-COST3. FR-OC1: dynamic import 전략 + 번들 크기 기준 |
| D2 완전성 | 8/10 | 15% | 112+ FRs (v2 72+ v3 40). 19개 하위 섹션 전체 커버. But: MEM-6 observation 4-layer 방어 FR 부재 (M1). MEM-7 30일 TTL FR 부재 (M2). Reflection 비용 자동 차단 FR 부재 (L1) |
| D3 정확성 | 9/10 | **25%** | Option B 전 FR-MEM 일관 ✅. Phase/Sprint 배정 전부 정확 ✅. GATE 삭제 (FR37/39) 적절 ✅. FR-OC2 WS 50/co = 확정 결정 #10 ✅. FR-N8N4 2G = 확정 결정 #2 ✅. FR-PERS2 Zod 스키마 정확 ✅ |
| D4 실행가능성 | 9.5/10 | **20%** | 파일 경로: soul-enricher.ts, memory-reflection.ts, office-channel.ts, crypto.ts. 마이그레이션: #61. Zod 스키마 코드. DB CHECK SQL 패턴. LISTEN/NOTIFY + 폴백. Dynamic import 패턴. extraVars 5개 변수명 명시 |
| D5 일관성 | 8.5/10 | 15% | Option B 5곳 통일 ✅. WS limits FR-OC2 ↔ NRT-5 ✅. n8n 2G FR-N8N4 ↔ Brief ✅. But: MEM-6 Domain↔FR 갭. Gate 참조 불일관 (FR-OC1/OC2는 명시, FR-PERS/MEM은 미참조) |
| D6 리스크 | 8.5/10 | 10% | FR-OC7 LISTEN/NOTIFY Neon 미지원 폴백 ✅. FR-MEM7 pgvector 장애 폴백 ✅. FR-N8N5 n8n 장애 graceful ✅. FR-MKT7 fallback 엔진 ✅. FR-OC8 독립 패키지 격리 ✅. But: MEM-6 보안 방어 체인 FR 부재 = 보안 리스크 갭 |

**가중 평균**: (9×0.15)+(8×0.15)+(9×0.25)+(9.5×0.20)+(8.5×0.15)+(8.5×0.10) = 1.35+1.20+2.25+1.90+1.275+0.85 = **8.825 → 8.80**

---

## 이슈 목록

### MINOR (2건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| M1 | MEM-6 (observation 4-layer 방어) FR 부재 | FR-MEM 섹션 | L2287 "여기에 없는 기능은 존재하지 않는다". MEM-6 = Go/No-Go #9, R10 High. 공격 체인: 악의적 obs → Reflection LLM 오염 → Soul 주입. FR-TOOLSANITIZE는 도구 응답 경유 공격만 커버 — observation 콘텐츠 경유 공격은 **별도 표면**. Domain MEM-6에 4-layer 정의 있으나 FR 없음 = "계약서"에서 누락 | D2 완전성, D6 리스크 |
| M2 | MEM-7 (30일 observation TTL) FR 부재 | FR-MEM 섹션 | 확정 결정 #5. Domain MEM-7 = "reflected=true 30일 자동 삭제". 자동화 동작인데 FR-MEM3 (Reflection 크론) 선례: 자동화도 FR에 포함. TTL 크론이 FR 없으면 구현 누락 위험. Admin 보존 정책 설정도 FR에 없음 | D2 완전성, D5 일관성 |

### LOW (3건)

| # | 이슈 | 위치 | 근거 | 영향 |
|---|------|------|------|------|
| L1 | Reflection 비용 자동 차단 FR 부재 | FR-MEM4 | FR-MEM4 "NFR-COST3 Haiku ≤ $0.10/일" 언급하나 "비용 한도 초과 시 크론 자동 일시 중지 (ECC 2.2)" 동작 미명시. Gate #7 핵심 검증 항목 | D2 완전성 |
| L2 | Go/No-Go 참조 불일관 | FR-OC1, FR-PERS | FR-OC1 "Go/No-Go #5" 명시, FR-OC2 "#10" 명시. But FR-PERS는 #2 미참조, FR-MEM은 #4/#7/#9 미참조, FR-TOOLSANITIZE는 #11 미참조. Gated FRs에 gate 번호 명시가 일관적이면 Sprint 플래너 활용도 향상 | D5 일관성 |
| L3 | FR-N8N4 과밀 (6행+) | L2440 | 5항목 보안 + Docker 설정 + Hono proxy 상세가 단일 FR에 집약. 가독성 관점에서 FR-N8N4a (Docker infra) / FR-N8N4b (security config) 분리 가능. 기능은 무결 — 가독성 이슈 | D1 구체성 (과잉) |

---

## john 7대 체크포인트 검증

| # | 체크포인트 | 판정 | 근거 |
|---|-----------|------|------|
| 1 | 확정 결정 정합 | ⚠️ | #2 n8n 2G ✅ (FR-N8N4). #5 30일 TTL ❌ (FR 없음, M2). #8 Obs Poisoning ❌ (FR 없음, M1). #10 WS 50/co ✅ (FR-OC2). Option B ✅ (FR-MEM 5곳) |
| 2 | Phase/Sprint 매핑 | ✅ | v2 FR1-72: Phase 1-2-3-4-5+ 전부 정확. v3 FR-OC Sprint 4, FR-N8N Sprint 2, FR-MKT Sprint 2, FR-PERS Sprint 1, FR-MEM Sprint 3, FR-TOOLSANITIZE Sprint 2, FR-UX 병행 — 전부 Step 10 Sprint 테이블 정합 |
| 3 | Go/No-Go 연동 | ⚠️ | FR-OC1 #5 ✅, FR-OC2 #10 ✅. FR-PERS #2 미명시 (L2). FR-MEM #4/#7/#9 미명시 (L2). Gate 연동 기능은 무결하나 참조가 불일관 |
| 4 | FR 완전성 | ⚠️ | 112+ FRs 포괄적. MEM-6 4-layer FR 없음 (M1). MEM-7 TTL FR 없음 (M2). 비용 자동 차단 FR 없음 (L1). 나머지 Domain→FR 매핑 무결 |
| 5 | GATE 결정 반영 | ✅ | FR37/39 삭제 ✅. 티어 섹션 "CLI Max 월정액" 명시 ✅. FR-UX1-3 페이지 통합 ✅. FR-MKT5 온보딩 제안 ✅ |
| 6 | Cross-section 일관성 | ✅ | Domain N8N-SEC ↔ FR-N8N4 (5/8, 나머지 NFR) ✅. Innovation 7 ↔ FR-MEM1→3→6 (observe→reflect→search) ✅. Scoping Must-Have v3 #7-#10 ↔ FR 전부 매핑 ✅. User Journey 6개 ↔ FR 커버 ✅ |
| 7 | Option B 정합 | ✅ | FR-MEM4/5/6/8/11 전부 "agent_memories(reflection)" + "observations 별도 테이블". 선제 수정 5건 전부 정확. "reflections 테이블" 잔류 0건 |

---

## 선제 수정 검증

| 위치 | 수정 | 판정 |
|------|------|------|
| FR-MEM4 | reflections 테이블 → agent_memories memoryType='reflection' (Option B) | ✅ |
| FR-MEM5 | reflections → agent_memories(reflection) | ✅ |
| FR-MEM6 | reflections → agent_memories(reflection) | ✅ |
| FR-MEM8 | reflections 테이블 → agent_memories(reflection) | ✅ |
| FR-MEM11 | reflections → agent_memories(reflection) | ✅ |
| L98 | reflections 신규 테이블 → agent_memories 확장 | ✅ |
| L148/L1989 | Option B cross-section | ✅ |

7/7 선제 수정 전부 정확.

---

## 긍정 평가

1. **"기능 계약서" 선언** (L2287): "여기에 없는 기능은 존재하지 않는다" — FR 섹션의 권위와 범위를 명확히 정의. 이 선언이 M1/M2의 근거이기도 함
2. **FR-N8N4 보안 5항목**: 포트 차단 → UI 설정 → Hono proxy → DB 차단 → 메모리 상한 순서로 외부→내부 방어. 구현팀이 보안 체크리스트로 직접 사용 가능
3. **FR-PERS2 Zod + DB CHECK 이중 검증**: API 레벨 Zod + DB 레벨 CHECK — 양쪽 검증으로 데이터 무결성 보장. prompt injection 방지 명시
4. **FR-OC7 LISTEN/NOTIFY 리스크 인식**: "Neon serverless 지원 여부 검증 필수" + 500ms 폴링 폴백 — 불확실성 인정 + 구체적 대안
5. **FR-MEM7 pgvector 폴백**: "검색 실패 시 빈 문자열 폴백" — graceful degradation, 에이전트 실행 중단 방지
6. **FR-MKT2 부분 실패 처리**: "일부 플랫폼 게시 실패 시 성공 플랫폼은 유지" — resilient multi-platform posting
7. **FR-MKT7 fallback 엔진**: 외부 AI API 장애 → 자동 전환 + Admin 알림 — production-ready 패턴
8. **FR-OC8 독립 패키지 격리**: packages/office 장애가 기존 기능에 미영향 — Sprint 4 실패 시 v2+v3(S1-3) 무영향 보장
9. **FR-TOOLSANITIZE 별도 섹션**: 도구 응답 보안을 독립 FR로 분리 — 공격 표면 가시성 확보

---

## 자동 불합격 검토

| 조건 | 판정 |
|------|------|
| 할루시네이션 | ❌ 없음 — 파일 경로, Zod 스키마, SQL 패턴, 마이그레이션 번호 전부 검증 가능 |
| 보안 구멍 | ❌ 없음 — FR-N8N4 5항목 + FR-TOOLSANITIZE + FR-PERS2 4-layer. MEM-6 FR 부재는 완전성 이슈 (보안 구멍 아님 — Domain에 정의 존재) |
| 빌드 깨짐 | ❌ N/A |
| 데이터 손실 위험 | ❌ 없음 — FR-MEM8 company_id 격리, FR-OC8 독립 격리, FR-MEM7 pgvector 폴백 |
| 아키텍처 위반 | ❌ 없음 — FR-PERS3 "engine/agent-loop.ts 직접 수정 없음", FR-MEM6 "soul-enricher.ts 위임", FR-OC7 "agent-loop.ts 수정 없음" — E8 경계 준수 |

---

## Confirmed Decisions Coverage

| # | Decision | Step 11 반영 |
|---|----------|-------------|
| 2 | n8n Docker 2G | ✅ FR-N8N4 "memory: 2G, NODE_OPTIONS" |
| 3 | n8n 8-layer | ✅ FR-N8N4 5/8 (나머지 3 = NFR/Domain) |
| 5 | 30일 TTL | ❌ FR 없음 (M2) |
| 8 | Obs Poisoning | ❌ FR 없음 (M1) |
| 9 | Advisory lock | N/A (구현 상세, FR 범위 밖) |
| 10 | WS limits | ✅ FR-OC2 "50/co, 500/server, oldest, NRT-5, #10" |
| 12 | host.docker.internal | N/A (구현 상세) |

---

## Carry-Forward to Writer

1. **FR-MEM12 추가 (MEM-6 observation 4-layer)**: "[Sprint 3] observation 저장 시 4-layer 콘텐츠 방어가 적용된다: (1) 10KB 상한, (2) 제어문자 제거, (3) Reflection LLM 프롬프트 하드닝, (4) 의심 콘텐츠 분류 + Admin 플래그 (Go/No-Go #9, R10)"
2. **FR-MEM13 추가 (MEM-7 30일 TTL)**: "[Sprint 3] reflected=true 관찰이 30일 후 자동 삭제된다. Admin이 에이전트별 보존 정책을 설정할 수 있다 (확정 결정 #5)"
3. **FR-MEM4 비용 자동 차단 명시** (옵션): "비용 한도(NFR-COST3) 초과 시 Reflection 크론 자동 일시 중지 (ECC 2.2, Go/No-Go #7)"
4. **FR-MEM3 조건 완전 명시** (Bob #2 채택): "일 1회 크론 + unreflected ≥20 + confidence ≥0.7 + Tier 한도 미초과 + advisory lock (MEM-2, 확정 결정 #9)" — 현재 "20개 누적 시 자동 실행"은 MEM-2 전체 AND 조건 5개 중 1개만 반영

---

## R2 Review — 8 Fixes Verification

**R2 Score: 9.40/10 ✅ PASS FINAL**

### 차원별 점수 (R2)

| 차원 | R1 | R2 | 변화 | 근거 |
|------|-----|-----|------|------|
| D1 구체성 | 9 | 9.5 | +0.5 | FR-N8N4 8/8 보안 완전 (SEC-4 HMAC + SEC-7 AES-256-GCM + SEC-8 rate limit 추가). FR-MEM3 AND 5조건 전부 명시. FR-MEM12 4-layer 각 레이어 명시 |
| D2 완전성 | 8 | 9.5 | +1.5 | M1 해소 (FR-MEM12). M2 해소 (FR-MEM13). L1 해소 (FR-MEM14). FR-PERS9 a11y 추가. 112→117 FRs. MEM-6/MEM-7/비용차단 전부 기능 계약에 포함 |
| D3 정확성 | 9 | 9.5 | +0.5 | FR-MEM3 trigger = MEM-2 Domain 정확 정합. FR-MEM12 = MEM-6 4-layer + Go/No-Go #9 + 확정 #8 정확. FR-TOOLSANITIZE3 Sprint 구현/검증 분리 정확. FR-MEM1 방어→저장 순서 정확 |
| D4 실행가능성 | 9.5 | 9.5 | 0 | 기존 수준 유지. FR-MEM14 "Admin 확인 후 재개" = 명확한 운영 동작. FR-PERS9 aria-valuenow/valuetext = 구현 가능 HTML 속성 |
| D5 일관성 | 8.5 | 9 | +0.5 | Domain MEM-6 ↔ FR-MEM12 정합 ✅. Domain MEM-7 ↔ FR-MEM13 정합 ✅. FR-MEM1 ↔ FR-MEM12 교차 참조 ✅. FR-TOOLSANITIZE3 Sprint 2/3 분리 명확 ✅. Go/No-Go 참조 개선 (FR-MEM3 #9/#7, FR-MEM12 #9/#8) |
| D6 리스크 | 8.5 | 9.5 | +1.0 | MEM-6 보안 리스크 갭 해소 (FR-MEM12). FR-MEM1 "방어 실패 시 저장 거부" = 안전 실패. FR-MEM14 비용 폭주 방지. FR-N8N4 SEC-4 HMAC = cross-tenant 방어. 3개 공격 표면(도구/관찰/성격) 전부 FR 커버 |

**가중 평균**: (9.5×0.15)+(9.5×0.15)+(9.5×0.25)+(9.5×0.20)+(9×0.15)+(9.5×0.10) = 1.425+1.425+2.375+1.90+1.35+0.95 = **9.425 → 9.40**

### Fix Verification (8/8)

| # | Fix | 검증 | 판정 |
|---|-----|------|------|
| 1 | FR-MEM12 (MEM-6 4-layer) | L2481: 10KB + strip + 하드닝 + 분류. Admin 플래그 + 감사 로그. Go/No-Go #9, 확정 #8. "PER-1과 별개" 명시 ✅ | ✅ |
| 2 | FR-MEM13 (MEM-7 30일 TTL) | L2482: reflected=true 30일 삭제 + Admin 보존 기간 조정. 확정 #5 ✅ | ✅ |
| 3 | FR-MEM14 (비용 자동 차단) | L2483: NFR-COST3 초과 → 자동 중지 + Admin 알림 + 재개. ECC 2.2, Go/No-Go #7 ✅ | ✅ |
| 4 | FR-MEM3 trigger 보완 | L2472: 일 1회 크론 + ≥20 AND + confidence ≥0.7 + Tier 한도 + advisory lock + ECC 2.2 auto-pause. MEM-2 전체 AND 조건 반영 ✅ | ✅ |
| 5 | FR-N8N4 SEC-4/7/8 | L2440: (4) HMAC webhook, (7) AES-256-GCM credential encryption, (8) rate limit 60/min. 8/8 완성 ✅ | ✅ |
| 6 | FR-TOOLSANITIZE3 Sprint 명확화 | L2489: "[Sprint 2 구현, Sprint 3 Go/No-Go #11 검증]" ✅ | ✅ |
| 7 | FR-PERS9 슬라이더 a11y | L2466: 키보드 ←→ + aria-valuenow + aria-valuetext ✅ | ✅ |
| 8 | FR-MEM1 MEM-6 참조 | L2470: "MEM-6 4-layer 방어 적용 후 자동 저장. 방어 실패 시 저장 거부 + 감사 로그" ✅ | ✅ |

### Confirmed Decisions Coverage (R2)

| # | Decision | R1 | R2 |
|---|----------|-----|-----|
| 2 | n8n Docker 2G | ✅ | ✅ |
| 3 | n8n 8-layer | ✅ 5/8 | ✅ **8/8** (Fix 5) |
| 5 | 30일 TTL | ❌ | ✅ FR-MEM13 (Fix 2) |
| 8 | Obs Poisoning | ❌ | ✅ FR-MEM12 (Fix 1) |
| 9 | Advisory lock | N/A | ✅ FR-MEM3 (Fix 4) |
| 10 | WS limits | ✅ | ✅ |

**6/6 confirmed decisions 전부 FR 반영 완료.**

### john 7대 체크포인트 (R2)

| # | 체크포인트 | R1 | R2 |
|---|-----------|-----|-----|
| 1 | 확정 결정 정합 | ⚠️ | ✅ #5 TTL, #8 Obs Poisoning, #9 advisory lock 전부 해소 |
| 2 | Phase/Sprint 매핑 | ✅ | ✅ FR-TOOLSANITIZE3 Sprint 2/3 분리 명확화 |
| 3 | Go/No-Go 연동 | ⚠️ | ✅ FR-MEM3 (#9/#7), FR-MEM12 (#9/#8), FR-MEM14 (#7) 명시 |
| 4 | FR 완전성 | ⚠️ | ✅ 112→117 FRs. MEM-6/MEM-7/비용차단/a11y 전부 추가 |
| 5 | GATE 결정 반영 | ✅ | ✅ |
| 6 | Cross-section 일관성 | ✅ | ✅ Domain↔FR 갭 전부 해소 |
| 7 | Option B 정합 | ✅ | ✅ |

### R2 긍정 평가 (추가)

10. **3대 공격 표면 완전 커버**: PER-1 (성격 주입), FR-MEM12 (관찰 주입), FR-TOOLSANITIZE (도구 응답 주입) — 3개 독립 공격 표면이 각각 독립 FR로 명시. 보안 아키텍처 가시성 최고 수준
11. **FR-MEM3 "기능 계약서" 수준 상세**: 일 1회 크론 + 5개 AND 조건 + ECC 2.2 auto-pause. Domain spec과 FR이 1:1 정합. 구현팀이 추가 해석 없이 바로 코딩 가능
12. **FR-N8N4 8/8 보안 완전체**: N8N-SEC 전 레이어가 하나의 FR에 응축. 외부→내부→tenant간→운영 순서로 방어 깊이 완성
13. **FR-MEM1↔MEM12 양방향 참조**: FR-MEM1 "방어 적용 후 저장" + FR-MEM12 "저장 전 방어 적용" = 순서 보장. 안전 실패(저장 거부) 명시

### Residuals (R2, non-blocking)

| Item | Severity | Notes |
|------|----------|-------|
| Go/No-Go 참조 일관성 잔여 | Observation | FR-PERS는 여전히 #2 미명시. FR-MKT는 gate 없음 (적절). 개선 가능하나 기능 무결 |
| FR-N8N4 과밀 | Observation | 8항목으로 더 길어졌으나, 단일 FR = 단일 보안 체크리스트로 응집력 유지. 분리 불필요 |
